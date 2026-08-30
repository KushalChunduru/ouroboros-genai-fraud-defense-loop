"use client";

import { useState } from "react";
import { api, ZeroDayHypothesis } from "@/lib/api";

export default function ZeroDayPanel({ selected }: { selected: string[] }) {
  const [hyps, setHyps] = useState<ZeroDayHypothesis[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setHyps(null);
    try {
      const gen = await api.generate({ attack_ids: selected, n_legit: 500, n_attack_per_vector: 45 });
      setBatchId(gen.batch_id);
      const r = await api.zeroday({ batch_id: gen.batch_id });
      setHyps(r.hypotheses);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-1">Zero-day discovery: closing the loop back into Identify</h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          Simulates a fresh batch, trains a detector, then runs Isolation Forest + clustering restricted to
          transactions the detector currently scores as low-risk — the defender&apos;s blind spot. An LLM reasoning
          agent drafts a natural-language hypothesis per anomalous cluster, so the taxonomy can grow itself instead
          of staying a static research document.
        </p>
        <button onClick={run} disabled={loading} className="btn btn-solid">
          {loading ? "Discovering…" : "Run discovery agent"}
        </button>
        {error && <p className="text-sm mt-3" style={{ color: "var(--danger)" }}>{error}</p>}
      </div>

      {hyps && (
        <div className="card p-5">
          <h3 className="font-medium mb-3">
            {hyps.length} candidate pattern{hyps.length === 1 ? "" : "s"} from batch {batchId}
          </h3>
          {hyps.length === 0 && (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              No unexplained anomaly clusters surfaced this run — the current fused detector already covers the blind
              spot well. Try selecting fewer vectors or a smaller batch to stress-test further.
            </p>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            {hyps.map((h) => (
              <div key={h.cluster_id} className="card-2 card-hover p-4 text-sm" style={{ borderLeft: "2.5px solid var(--warn)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs" style={{ color: "var(--muted)" }}>{h.cluster_id}</span>
                  <span className="pill" style={{ background: "rgba(255,180,84,0.15)", color: "var(--warn)", borderColor: "transparent" }}>
                    confidence {(h.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mb-2">{h.hypothesis}</p>
                <div className="flex flex-wrap gap-2 text-[11px]" style={{ color: "var(--muted)" }}>
                  <span>size {h.size}</span>
                  <span>mean amount ${h.mean_amount.toFixed(2)}</span>
                  <span>channel {h.dominant_channel}</span>
                  <span>category {h.dominant_merchant_category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
