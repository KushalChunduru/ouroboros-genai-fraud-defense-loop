"""Self-play arms-race loop: the closed-loop mechanism the challenge asks for,
executed as an explicit multi-round game rather than a one-shot pipeline.

Each round:
  1. The attacker (generation agents) produces a batch using the CURRENT
     per-vector evasion level.
  2. A fresh detector is trained/evaluated on a held-out split of that batch
     (train/test split avoids leakage).
  3. The attacker escalates evasion specifically for vectors the defender is
     currently catching well (recall > threshold) -- an adaptive minimax
     dynamic, not uniform noise -- modeling a real adversary reallocating
     effort toward whatever a defense currently blocks best.

The resulting recall-per-round curve is the demoable "arms race" evidence of
a genuine closed loop.
"""
import random

from app.defend.detector import FusedDetector, compute_metrics
from app.generate.behavioral_simulator import simulate

ESCALATION_STEP = 0.18
ESCALATION_RECALL_THRESHOLD = 0.55


def _train_test_split(transactions: list[dict], test_frac: float, seed: int):
    rng = random.Random(seed)
    shuffled = transactions[:]
    rng.shuffle(shuffled)
    cut = int(len(shuffled) * (1 - test_frac))
    return shuffled[:cut], shuffled[cut:]


def run_self_play(taxonomy: list[dict], attack_ids: list[str], rounds: int,
                   n_legit: int, n_attack_per_vector: int) -> list[dict]:
    vectors = [v for v in taxonomy if v["id"] in attack_ids] if attack_ids else taxonomy
    evasion_by_vector = {v["id"]: 0.0 for v in vectors}
    round_results = []

    for r in range(rounds):
        batch = simulate(
            taxonomy, [v["id"] for v in vectors], n_legit, n_attack_per_vector,
            seed=1000 + r, evasion_by_vector=evasion_by_vector,
        )
        train, test = _train_test_split(batch, test_frac=0.35, seed=2000 + r)

        detector = FusedDetector().fit(train)
        bundles = detector.score(test)

        y_true = [t["is_attack"] for t in test]
        y_score = [b.fused for b in bundles]
        y_pred = [s >= 0.5 for s in y_score]
        overall = compute_metrics(y_true, y_pred, y_score)

        per_vector = {}
        for v in vectors:
            idxs = [i for i, t in enumerate(test) if t.get("attack_vector_id") == v["id"]]
            legit_idxs = [i for i, t in enumerate(test) if not t["is_attack"]]
            if not idxs:
                continue
            sub_true = [test[i]["is_attack"] for i in idxs] + [test[i]["is_attack"] for i in legit_idxs]
            sub_pred = [y_pred[i] for i in idxs] + [y_pred[i] for i in legit_idxs]
            sub_score = [y_score[i] for i in idxs] + [y_score[i] for i in legit_idxs]
            per_vector[v["id"]] = compute_metrics(sub_true, sub_pred, sub_score)

        avg_recall = sum(m["recall"] for m in per_vector.values()) / len(per_vector) if per_vector else 0.0

        round_results.append({
            "round_index": r,
            "evasion_level": sum(evasion_by_vector.values()) / len(evasion_by_vector) if evasion_by_vector else 0.0,
            "overall": overall,
            "per_vector": per_vector,
            "arms_race_score": round(avg_recall, 4),
        })

        for v in vectors:
            m = per_vector.get(v["id"])
            if m and m["recall"] >= ESCALATION_RECALL_THRESHOLD:
                evasion_by_vector[v["id"]] = min(1.0, evasion_by_vector[v["id"]] + ESCALATION_STEP)

    return round_results
