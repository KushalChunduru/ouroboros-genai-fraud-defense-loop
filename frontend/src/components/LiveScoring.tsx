"use client";

import { useState } from "react";
import { api, AttackVector, LiveScoreResponse, Transaction } from "@/lib/api";
import InfoTooltip from "./InfoTooltip";

/**
 * Proves the feasibility claim with a real number instead of an assertion:
 * industry target for a live-authorization-path fraud check is sub-100ms.
 * This scores exactly one transaction through the already-trained detector
 * and reports measured server-side latency, distinct from the batch flow
 * the rest of the console demonstrates.
 */
export default function LiveScoring({ vectors, detectorReady }: { vectors: AttackVector[]; detectorReady: boolean }) {
  const [txn, setTxn] = useState<Transaction | null>(null);
  const [result, setResult] = useState<LiveScoreResponse | null>(null);
  const [loading, setLoading] = useState<"sample" | "score" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attackId, setAttackId] = useState(vectors[0]?.id ?? "");

  const fetchSample = async (kind: "legit" | "attack") => {
    setLoading("sample");
    setError(null);
    setResult(null);
    try {
      const t = await api.sampleTransaction(kind, kind === "attack" ? attackId : undefined);
      setTxn(t);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(null);
    }
  };

  const score = async () => {
    if (!txn) return;
    setLoading("score");
    setError(null);
    try {
      const r = await api.scoreLive(txn);
      setResult(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(null);
    }
  };

  if (!detectorReady) {
    return (
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Run the fused detector above first — real-time scoring uses that same trained detector, not a separate model.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        A production authorization path needs a per-transaction decision in well under 100ms. This scores one
        transaction at a time through the exact detector trained above and reports measured server-side latency —
        the batch scoring elsewhere in this console proves accuracy; this proves it&apos;s fast enough to sit in a
        live payment flow.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => fetchSample("legit")} disabled={loading !== null} className="btn btn-ghost">
          Sample a legit transaction
        </button>
        <select
          value={attackId}
          onChange={(e) => setAttackId(e.target.value)}
          className="data card-2 px-2 py-2 rounded-md text-xs"
        >
          {vectors.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        <button onClick={() => fetchSample("attack")} disabled={loading !== null} className="btn btn-ghost">
          Sample this attack
        </button>
      </div>

      {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

      {txn && (
        <div className="card-2 p-4 text-xs space-y-2">
          <div className="flex flex-wrap gap-4">
            <span className="data">id {txn.id}</span>
            <span className="data">amount ${txn.amount.toFixed(2)}</span>
            <span className="data">channel {txn.channel}</span>
            <span className="data">merchant {txn.merchant_category}</span>
            <span
              className="pill"
              style={{ color: txn.is_attack ? "var(--danger)" : "var(--legit)", borderColor: "transparent" }}
            >
              ground truth: {txn.is_attack ? txn.attack_vector_name : "legit"}
            </span>
          </div>
          <button onClick={score} disabled={loading !== null} className="btn btn-solid mt-1">
            {loading === "score" ? "Scoring…" : "Score in real time →"}
          </button>
        </div>
      )}

      {result && (
        <div className="card-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Result</span>
            <span
              className="pill"
              style={{
                background: result.predicted_attack
                  ? "color-mix(in srgb, var(--danger) 12%, white)"
                  : "color-mix(in srgb, var(--legit) 12%, white)",
                color: result.predicted_attack ? "var(--danger)" : "var(--legit)",
                borderColor: "transparent",
              }}
            >
              {result.predicted_attack ? "flagged as attack" : "passed as legit"}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: "var(--border)" }}>
            <Cell
              label="Fused score" value={result.fused_score.toFixed(3)}
              info="The final 0-1 risk score: a weighted blend of the three signals to the right. Flagged as attack at ≥0.5 here (the tuner above lets you change that cutoff for a whole batch)."
            />
            <Cell
              label="Tabular signal" value={result.gbm_score.toFixed(3)}
              info="Score from the gradient-boosted classifier trained on this transaction's amount, velocity, timing, and session features alone — no graph or text context."
            />
            <Cell
              label="Graph signal" value={result.graph_score.toFixed(3)}
              info="Risk propagated from shared infrastructure (device/IP/merchant) this entity is connected to in the training graph — high even if this single transaction looks ordinary, when its device is linked to known-risky entities."
            />
            <Cell
              label="Inference latency" value={`${result.latency_ms.toFixed(2)} ms`}
              color={result.latency_ms < 100 ? "var(--legit)" : "var(--warn)"}
              info="Measured server-side with time.perf_counter() around the actual model inference call — not estimated. Industry target for a live authorization-path check is under 100ms."
            />
          </div>
          <p className="text-[11px] mt-2" style={{ color: "var(--muted)" }}>
            {result.latency_ms < 50
              ? "Well inside the 50-100ms industry target for real-time authorization-path scoring."
              : result.latency_ms < 100
                ? "Inside the industry target for real-time authorization-path scoring."
                : "Above the typical 100ms real-time target — acceptable for step-up review, not inline authorization."}
          </p>
        </div>
      )}
    </div>
  );
}

function Cell({ label, value, color, info }: { label: string; value: string; color?: string; info?: string }) {
  return (
    <div className="p-3" style={{ background: "var(--background)" }}>
      <div className="data text-lg font-semibold" style={{ color: color ?? "var(--foreground)" }}>{value}</div>
      <div className="flex items-center gap-1.5 text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>
        {label}
        {info && <InfoTooltip title={label}>{info}</InfoTooltip>}
      </div>
    </div>
  );
}
