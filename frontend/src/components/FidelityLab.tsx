"use client";

import { useState } from "react";
import { api, FidelityReport } from "@/lib/api";

/**
 * Proves the entity-conditioning claim with computed numbers instead of just
 * citing arXiv:2604.13125 and asserting it applies here. Builds the naive-
 * generator baseline the paper describes by independently shuffling this
 * exact batch's structural columns server-side (mathematically what a
 * row-independent tabular generator produces), then compares the three
 * signals the paper showed those generators destroy.
 */
export default function FidelityLab({ batchId }: { batchId: string }) {
  const [report, setReport] = useState<FidelityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.fidelity(batchId);
      setReport(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Builds a naive-generator baseline from this exact batch by independently shuffling entity, device, IP, and
        timestamp columns — preserving every marginal distribution exactly while destroying cross-column structure,
        which is mathematically what a row-independent generator (CTGAN, TVAE, GaussianCopula) produces. Then
        compares the three signals{" "}
        <a
          href="https://arxiv.org/abs/2604.13125"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
          style={{ color: "var(--accent)" }}
        >
          arXiv:2604.13125
        </a>{" "}
        showed those generators fail to preserve.
      </p>
      <button onClick={run} disabled={loading} className="btn btn-solid">
        {loading ? "Computing…" : "Run fidelity comparison"}
      </button>
      {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

      {report && (
        <div className="space-y-3">
          <MetricRow
            label="Burst clustering (Fano factor)"
            help="Variance/mean of transactions per shared device per 10-minute window. ~1 = memoryless; higher = coordinated bursts."
            real={report.entity_conditioned.burstiness_fano_factor}
            naive={report.naive_baseline.burstiness_fano_factor}
            format={(v) => v.toFixed(2)}
          />
          <MetricRow
            label="Single-owner device fraction"
            help="Share of devices used by exactly one entity — the customer-loyalty signal naive shuffling destroys, making ordinary repeat customers look like fraud rings."
            real={report.entity_conditioned.single_owner_device_fraction}
            naive={report.naive_baseline.single_owner_device_fraction}
            format={(v) => `${(v * 100).toFixed(1)}%`}
          />
          <MetricRow
            label="Velocity-rule trigger rate"
            help="Share of (device, hour) windows exceeding a 4-txn/hour rule — the calibration signal a velocity rule's threshold is tuned against."
            real={report.entity_conditioned.velocity_exceed_rate}
            naive={report.naive_baseline.velocity_exceed_rate}
            format={(v) => `${(v * 100).toFixed(2)}%`}
          />
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>
            Computed on this batch&apos;s {report.n} transactions, not a fixed demo number — regenerate the batch
            above and re-run this to see it recompute.
          </p>
        </div>
      )}
    </div>
  );
}

function MetricRow({
  label, help, real, naive, format,
}: {
  label: string; help: string; real: number; naive: number; format: (v: number) => string;
}) {
  const max = Math.max(real, naive, 0.0001);
  const ratio = naive > 0 ? real / naive : null;
  return (
    <div className="card-2 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        {ratio !== null && ratio > 1.05 && (
          <span className="pill" style={{ color: "var(--legit)", borderColor: "transparent", background: "color-mix(in srgb, var(--legit) 12%, white)" }}>
            {ratio.toFixed(1)}× more preserved
          </span>
        )}
      </div>
      <p className="text-[11px] mb-3" style={{ color: "var(--muted)" }}>{help}</p>
      <Bar label="Entity-conditioned (ours)" value={real} max={max} color="var(--accent)" format={format} />
      <Bar label="Naive shuffle baseline" value={naive} max={max} color="var(--muted)" format={format} />
    </div>
  );
}

function Bar({ label, value, max, color, format }: { label: string; value: number; max: number; color: string; format: (v: number) => string }) {
  const pct = Math.max(2, (value / max) * 100);
  return (
    <div className="flex items-center gap-3 text-xs mb-1.5 last:mb-0">
      <span className="w-40 shrink-0" style={{ color: "var(--muted)" }}>{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="data w-16 text-right shrink-0">{format(value)}</span>
    </div>
  );
}
