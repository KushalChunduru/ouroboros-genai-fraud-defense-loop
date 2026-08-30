"use client";

import { useMemo, useState } from "react";
import { ScoredTransaction } from "@/lib/api";

/**
 * Decision threshold is a business-cost choice, not a fixed 0.5 -- 2026
 * fraud-ops practice sets it to minimize (missed-fraud cost + false-positive
 * cost), not to maximize precision/recall symmetrically. Everything here
 * recomputes instantly from the scores /api/detect already returned, so
 * moving the slider costs zero extra backend calls.
 */
function metricsAt(scored: ScoredTransaction[], threshold: number, costFN: number, costFP: number) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (const s of scored) {
    const predicted = s.fused_score >= threshold;
    if (s.is_attack && predicted) tp++;
    else if (!s.is_attack && predicted) fp++;
    else if (s.is_attack && !predicted) fn++;
    else tn++;
  }
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp + fn ? tp / (tp + fn) : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  const fpr = fp + tn ? fp / (fp + tn) : 0;
  const cost = fn * costFN + fp * costFP;
  return { precision, recall, f1, fpr, cost, tp, fp, fn, tn };
}

export default function ThresholdTuner({ scored }: { scored: ScoredTransaction[] }) {
  const [threshold, setThreshold] = useState(0.5);
  const [costFN, setCostFN] = useState(500);
  const [costFP, setCostFP] = useState(15);

  const current = useMemo(() => metricsAt(scored, threshold, costFN, costFP), [scored, threshold, costFN, costFP]);

  const optimal = useMemo(() => {
    let best = { t: 0.5, cost: Infinity };
    for (let t = 0.05; t <= 0.95; t += 0.01) {
      const { cost } = metricsAt(scored, t, costFN, costFP);
      if (cost < best.cost) best = { t: Math.round(t * 100) / 100, cost };
    }
    return best;
  }, [scored, costFN, costFP]);

  return (
    <div className="card-2 p-4 space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-1">Decision threshold — a cost choice, not a fixed cutoff</h4>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Fraud ops set thresholds to minimize total expected cost, not to maximize precision/recall symmetrically.
          Set your own cost of a missed fraud vs. a false decline below, and the threshold that minimizes total cost
          is computed live from this batch&apos;s scores — no re-scoring required.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 text-xs">
        <label className="flex items-center gap-2">
          <span style={{ color: "var(--muted)" }}>Cost per missed fraud ($)</span>
          <input
            type="number"
            value={costFN}
            onChange={(e) => setCostFN(Number(e.target.value))}
            className="data card-2 px-2 py-1 rounded-md w-20"
          />
        </label>
        <label className="flex items-center gap-2">
          <span style={{ color: "var(--muted)" }}>Cost per false decline ($)</span>
          <input
            type="number"
            value={costFP}
            onChange={(e) => setCostFP(Number(e.target.value))}
            className="data card-2 px-2 py-1 rounded-md w-20"
          />
        </label>
        <button
          className="text-xs underline shrink-0"
          style={{ color: "var(--accent)" }}
          onClick={() => setThreshold(optimal.t)}
        >
          Use cost-optimal threshold ({optimal.t.toFixed(2)}) →
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span style={{ color: "var(--muted)" }}>Decision threshold</span>
          <span className="data">{threshold.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.05}
          max={0.95}
          step={0.01}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: "var(--accent)" }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-px" style={{ background: "var(--border)" }}>
        <Cell label="Precision" value={`${(current.precision * 100).toFixed(1)}%`} />
        <Cell label="Recall" value={`${(current.recall * 100).toFixed(1)}%`} color="var(--legit)" />
        <Cell label="F1" value={`${(current.f1 * 100).toFixed(1)}%`} />
        <Cell label="FPR" value={`${(current.fpr * 100).toFixed(1)}%`} color={current.fpr > 0.01 ? "var(--warn)" : "var(--legit)"} />
        <Cell label="Est. cost" value={`$${current.cost.toLocaleString()}`} color="var(--danger)" />
      </div>
      <p className="text-[11px]" style={{ color: "var(--muted)" }}>
        2026 industry benchmark targets high recall with FPR under 1%. At the current threshold: {current.tp} caught,{" "}
        {current.fn} missed, {current.fp} legitimate transactions wrongly declined.
      </p>
    </div>
  );
}

function Cell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-3" style={{ background: "var(--background)" }}>
      <div className="data text-lg font-semibold" style={{ color: color ?? "var(--foreground)" }}>{value}</div>
      <div className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
