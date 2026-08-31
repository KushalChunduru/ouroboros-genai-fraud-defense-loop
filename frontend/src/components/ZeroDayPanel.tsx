"use client";

import { useState } from "react";
import { api, GenerateResponse, ZeroDayHypothesis } from "@/lib/api";

export default function ZeroDayPanel({
  selected,
  sharedBatch,
  onResult,
}: {
  selected: string[];
  sharedBatch: GenerateResponse | null;
  onResult?: (hyps: ZeroDayHypothesis[] | null) => void;
}) {
  const [hyps, setHyps] = useState<ZeroDayHypothesis[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);

  const run = async (fresh: boolean) => {
    setLoading(true);
    setError(null);
    setHyps(null);
    try {
      let id = sharedBatch?.batch_id;
      if (fresh || !id) {
        const gen = await api.generate({ attack_ids: selected, n_legit: 500, n_attack_per_vector: 45 });
        id = gen.batch_id;
      }
      setBatchId(id);
      const r = await api.zeroday({ batch_id: id });
      setHyps(r.hypotheses);
      onResult?.(r.hypotheses);
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
          Runs Isolation Forest + clustering restricted to transactions the detector currently scores as low-risk —
          the defender&apos;s blind spot. An LLM reasoning agent drafts a natural-language hypothesis per anomalous
          cluster, so the taxonomy can grow itself instead of staying a static research document.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => run(false)} disabled={loading} className="btn btn-solid">
            {loading
              ? "Discovering…"
              : sharedBatch
                ? `Run on batch ${sharedBatch.batch_id}`
                : "Generate a batch and discover"}
          </button>
          {sharedBatch && (
            <button onClick={() => run(true)} disabled={loading} className="btn btn-ghost">
              Use a fresh batch instead
            </button>
          )}
        </div>
        {sharedBatch && (
          <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
            Reusing the batch and detector from Step 2 by default, so the pattern you&apos;re mining for blind spots
            is the same one you just scored — not a disconnected fresh sample.
          </p>
        )}
        {error && <p className="text-sm mt-3" style={{ color: "var(--danger)" }}>{error}</p>}
      </div>

      {hyps && (
        <div className="card p-5">
          <h3 className="font-medium mb-3">
            {hyps.length} candidate pattern{hyps.length === 1 ? "" : "s"} from batch <span className="data">{batchId}</span>
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
                  <span className="data text-xs" style={{ color: "var(--muted)" }}>{h.cluster_id}</span>
                  <span className="pill" style={{ background: "color-mix(in srgb, var(--warn) 15%, white)", color: "var(--warn)", borderColor: "transparent" }}>
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
