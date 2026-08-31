import os
import random
import time
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import GEMINI_ENABLED, load_taxonomy
from app.defend.detector import FusedDetector, compute_metrics
from app.defend.explain import explain_transaction
from app.generate.behavioral_simulator import simulate
from app.generate.fidelity import compute_fidelity_report
from app.generate.narrative_agent import generate_narrative
from app.loop.self_play import run_self_play
from app.loop.zero_day import discover_zero_day_patterns
from app.models import (
    DetectRequest, DetectResponse, GenerateRequest, GenerateResponse, Metrics,
    ScoredTransaction, SelfPlayRequest, SelfPlayResponse, Transaction, ZeroDayResponse,
)
from app.store import store

app = FastAPI(title="Ouroboros — GenAI Payment Fraud Red/Blue Loop", version="0.1.0")

# Deployment-friendly: defaults cover local dev + the deployed Vercel frontend,
# and ALLOWED_ORIGINS (comma-separated) lets a new frontend origin be added
# without a code change.
_default_origins = [
    "http://localhost:3000",
    "https://ouroboros-genai-fraud-defense-loop.vercel.app",
]
_extra_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_default_origins + _extra_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TAXONOMY = load_taxonomy()
MAX_LLM_EXPLANATIONS = 20


@app.get("/api/health")
def health():
    return {"status": "ok", "gemini_enabled": GEMINI_ENABLED, "vectors": len(TAXONOMY)}


@app.get("/api/taxonomy")
def get_taxonomy():
    return {"vectors": TAXONOMY}


@app.post("/api/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    attack_ids = req.attack_ids or [v["id"] for v in TAXONOMY]
    txns = simulate(
        TAXONOMY, attack_ids, req.n_legit, req.n_attack_per_vector,
        evasion_level=req.evasion_level, seed=req.seed,
    )
    batch_id = f"batch_{uuid.uuid4().hex[:10]}"
    store.batches[batch_id] = txns

    narratives_sample = [
        {"attack_vector_id": t["attack_vector_id"], "attack_vector_name": t["attack_vector_name"], "text": t["narrative_text"]}
        for t in txns if t.get("narrative_text")
    ][:12]

    counts = {"total": len(txns), "legit": sum(1 for t in txns if not t["is_attack"]),
              "attack": sum(1 for t in txns if t["is_attack"])}
    for v in TAXONOMY:
        counts[v["id"]] = sum(1 for t in txns if t.get("attack_vector_id") == v["id"])

    return GenerateResponse(batch_id=batch_id, transactions=txns, narratives_sample=narratives_sample, counts=counts)


@app.get("/api/fidelity/{batch_id}")
def fidelity(batch_id: str):
    """Proves the entity-conditioning claim with computed numbers: builds a
    naive-generator baseline by independently shuffling this exact batch's
    structural columns (mathematically what a row-independent tabular
    generator produces) and compares burst clustering, device-fanout
    concentration, and velocity-rule calibration against the real batch."""
    if batch_id not in store.batches:
        raise HTTPException(404, "unknown batch_id")
    return compute_fidelity_report(store.batches[batch_id])


def _split(transactions: list[dict], test_frac: float = 0.35, seed: int = 7):
    rng = random.Random(seed)
    shuffled = transactions[:]
    rng.shuffle(shuffled)
    cut = int(len(shuffled) * (1 - test_frac))
    return shuffled[:cut], shuffled[cut:]


@app.post("/api/detect", response_model=DetectResponse)
def detect(req: DetectRequest):
    if req.transactions:
        txns = [t.model_dump() for t in req.transactions]
    elif req.batch_id:
        if req.batch_id not in store.batches:
            raise HTTPException(404, "unknown batch_id")
        txns = store.batches[req.batch_id]
    else:
        raise HTTPException(400, "provide batch_id or transactions")

    train, test = _split(txns)
    detector = FusedDetector().fit(train)
    store.set_detector(req.batch_id, detector)

    bundles = detector.score(test)
    y_true = [t["is_attack"] for t in test]
    y_score = [b.fused for b in bundles]
    y_pred = [s >= 0.5 for s in y_score]
    overall = compute_metrics(y_true, y_pred, y_score)

    vector_ids = sorted({t.get("attack_vector_id") for t in test if t.get("attack_vector_id")})
    per_vector = {}
    for vid in vector_ids:
        idxs = [i for i, t in enumerate(test) if t.get("attack_vector_id") == vid]
        legit_idxs = [i for i, t in enumerate(test) if not t["is_attack"]]
        sub_true = [test[i]["is_attack"] for i in idxs + legit_idxs]
        sub_pred = [y_pred[i] for i in idxs + legit_idxs]
        sub_score = [y_score[i] for i in idxs + legit_idxs]
        per_vector[vid] = Metrics(**compute_metrics(sub_true, sub_pred, sub_score))

    order = sorted(range(len(test)), key=lambda i: y_score[i], reverse=True)
    flagged_order = [i for i in order if y_pred[i]]

    scored = []
    for rank, i in enumerate(order):
        t, b = test[i], bundles[i]
        predicted = y_pred[i]
        if predicted and rank < MAX_LLM_EXPLANATIONS:
            explanation = explain_transaction(t, b)
        elif predicted:
            explanation = f"Fused score {b.fused:.2f} exceeded threshold (tabular {b.gbm:.2f}, graph {b.graph:.2f}, content {b.content:.2f})."
        else:
            explanation = "Below decision threshold; no action."
        scored.append(ScoredTransaction(
            id=t["id"], fused_score=round(b.fused, 4), gbm_score=round(b.gbm, 4),
            graph_score=round(b.graph, 4), content_score=round(b.content, 4),
            predicted_attack=predicted, is_attack=t["is_attack"],
            attack_vector_id=t.get("attack_vector_id"), explanation=explanation,
        ))

    if req.batch_id:
        counts = {"total": len(txns), "legit": sum(1 for t in txns if not t["is_attack"]),
                  "attack": sum(1 for t in txns if t["is_attack"])}
        store.reports[req.batch_id] = {
            "batch_id": req.batch_id, "counts": counts,
            "overall": overall, "per_vector": {k: v.model_dump() for k, v in per_vector.items()},
            "n_test": len(test),
        }

    return DetectResponse(scored=scored, overall=Metrics(**overall), per_vector=per_vector)


@app.get("/api/report/{batch_id}")
def get_report(batch_id: str):
    """Permalink-able snapshot of one run's results -- lets a specific batch's
    detection outcome be shared as a standalone link instead of requiring a
    re-run of the whole console workflow."""
    report = store.reports.get(batch_id)
    if report is None:
        raise HTTPException(404, "no cached report for this batch_id -- run /api/detect on it first")
    return report


@app.post("/api/selfplay", response_model=SelfPlayResponse)
def selfplay(req: SelfPlayRequest):
    results = run_self_play(TAXONOMY, req.attack_ids, req.rounds, req.n_legit, req.n_attack_per_vector)
    return {"rounds": results}


@app.post("/api/zeroday", response_model=ZeroDayResponse)
def zeroday(req: DetectRequest):
    if req.batch_id:
        if req.batch_id not in store.batches:
            raise HTTPException(404, "unknown batch_id")
        txns = store.batches[req.batch_id]
    elif req.transactions:
        txns = [t.model_dump() for t in req.transactions]
    else:
        raise HTTPException(400, "provide batch_id or transactions")

    # Prefer the detector actually trained on THIS batch_id (correct even if
    # other batches were scored elsewhere in the meantime); fall back to
    # whichever detector was trained most recently, then train fresh.
    detector = store.detectors.get(req.batch_id) or store.last_detector
    if detector is None:
        train, _ = _split(txns)
        detector = FusedDetector().fit(train)
        store.set_detector(req.batch_id, detector)

    hypotheses = discover_zero_day_patterns(txns, detector)
    return {"hypotheses": hypotheses}


@app.get("/api/sample_transaction")
def sample_transaction(kind: str = "legit", attack_id: str | None = None):
    """One realistic transaction from the entity-conditioned simulator, for
    the live single-transaction scoring demo -- avoids asking a user to
    hand-fill 15 numeric fields to see real-time inference in action."""
    if kind == "attack":
        vector = next((v for v in TAXONOMY if v["id"] == attack_id), None) or TAXONOMY[0]
        txns = simulate(TAXONOMY, [vector["id"]], n_legit=0, n_attack_per_vector=1, seed=random.randint(0, 1_000_000))
    else:
        txns = simulate(TAXONOMY, [], n_legit=1, n_attack_per_vector=0, seed=random.randint(0, 1_000_000))
    if not txns:
        raise HTTPException(500, "simulation produced no rows")
    return txns[0]


@app.post("/api/score_live")
def score_live(txn: Transaction):
    """Scores exactly one transaction through the currently trained fused
    detector and reports measured server-side inference latency -- the
    concrete proof point for a live-authorization-path deployment, distinct
    from the batch scoring the rest of the console demonstrates."""
    detector = store.last_detector
    if detector is None:
        raise HTTPException(400, "no trained detector yet -- run Step 2 (Generate & Detect) first")

    row = txn.model_dump()
    start = time.perf_counter()
    bundle = detector.score([row])[0]
    latency_ms = (time.perf_counter() - start) * 1000

    return {
        "fused_score": round(bundle.fused, 4),
        "gbm_score": round(bundle.gbm, 4),
        "graph_score": round(bundle.graph, 4),
        "content_score": round(bundle.content, 4),
        "predicted_attack": bundle.fused >= 0.5,
        "latency_ms": round(latency_ms, 3),
    }


@app.post("/api/narrative_preview")
def narrative_preview(attack_id: str):
    vector = next((v for v in TAXONOMY if v["id"] == attack_id), None)
    if not vector:
        raise HTTPException(404, "unknown attack_id")
    return {"text": generate_narrative(vector)}
