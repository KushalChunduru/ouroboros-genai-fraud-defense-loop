"use client";

import { useEffect, useState } from "react";
import { api, AttackVector, DetectResponse, GenerateResponse } from "@/lib/api";
import EntityGraph from "./EntityGraph";
import Counter from "./Counter";
import ThresholdTuner from "./ThresholdTuner";
import LiveScoring from "./LiveScoring";
import FidelityLab from "./FidelityLab";
import InfoTooltip from "./InfoTooltip";

const METRIC_INFO: Record<string, string> = {
  Precision: "Of everything flagged as an attack, what fraction actually was one. Low precision means legitimate customers get wrongly declined.",
  Recall: "Of everything that actually was an attack, what fraction got caught. Low recall means fraud slips through.",
  F1: "The balance of precision and recall in one number — high only when both are high.",
  "PR-AUC": "Precision-recall performance averaged across every possible decision threshold, not just the one currently selected — a threshold-independent view of overall detector quality.",
  "False positive rate": "Of everything that was actually legitimate, what fraction got wrongly flagged. The 2026 industry benchmark targets this under 1%.",
};

function MetricPill({ label, value, suffix = "", color = "var(--accent)" }: { label: string; value: number; suffix?: string; color?: string }) {
  return (
    <div className="card-2 px-4 py-3 flex-1 min-w-[110px] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide" style={{ color: "var(--muted)" }}>
        {label}
        {METRIC_INFO[label] && <InfoTooltip title={label}>{METRIC_INFO[label]}</InfoTooltip>}
      </div>
      <div className="text-2xl font-semibold mt-1" style={{ color }}>
        <Counter value={value * 100} suffix={suffix} />
      </div>
    </div>
  );
}

export default function GenerateDetectConsole({
  selected,
  onResult,
}: {
  selected: string[];
  onResult?: (gen: GenerateResponse | null, det: DetectResponse | null) => void;
}) {
  const [nLegit, setNLegit] = useState(400);
  const [nAttack, setNAttack] = useState(40);
  const [gen, setGen] = useState<GenerateResponse | null>(null);
  const [det, setDet] = useState<DetectResponse | null>(null);
  const [loading, setLoading] = useState<"gen" | "det" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vectors, setVectors] = useState<AttackVector[]>([]);

  useEffect(() => {
    onResult?.(gen, det);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gen, det]);

  useEffect(() => {
    api.taxonomy().then((r) => setVectors(r.vectors)).catch(() => {});
  }, []);

  const runGenerate = async () => {
    setLoading("gen");
    setError(null);
    setDet(null);
    try {
      const r = await api.generate({ attack_ids: selected, n_legit: nLegit, n_attack_per_vector: nAttack });
      setGen(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(null);
    }
  };

  const runDetect = async () => {
    if (!gen) return;
    setLoading("det");
    setError(null);
    try {
      const r = await api.detect({ batch_id: gen.batch_id });
      setDet(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-3">Generate: entity-conditioned attack simulation</h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          Simulates {selected.length || "all"} selected vector(s). Each simulated entity carries persistent state
          (devices, IP, spend profile, session history) so transactions are sampled from entity history rather than
          i.i.d. rows — preserving burst timing and device-sharing graph motifs that row-independent GAN generators
          are known to destroy.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm">
            Legit volume
            <input
              type="number"
              value={nLegit}
              onChange={(e) => setNLegit(Number(e.target.value))}
              className="data block mt-1 card-2 px-3 py-1.5 rounded-md w-32"
            />
          </label>
          <label className="text-sm">
            Attack rows / vector
            <input
              type="number"
              value={nAttack}
              onChange={(e) => setNAttack(Number(e.target.value))}
              className="data block mt-1 card-2 px-3 py-1.5 rounded-md w-32"
            />
          </label>
          <button onClick={runGenerate} disabled={loading === "gen"} className="btn btn-solid">
            {loading === "gen" ? "Simulating…" : "Generate batch"}
          </button>
          {gen && (
            <button onClick={runDetect} disabled={loading === "det"} className="btn btn-ghost">
              {loading === "det" ? "Scoring…" : "Run fused detector"}
            </button>
          )}
        </div>
        {error && <p className="text-sm mt-3" style={{ color: "var(--danger)" }}>{error}</p>}
        {!gen && !error && (
          <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
            Nothing simulated yet — set volumes above and generate a batch to see it here.
          </p>
        )}
      </div>

      {gen && (
        <div className="card p-5">
          <h3 className="font-medium mb-2 data text-sm">{gen.batch_id}</h3>
          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <span className="data">total {gen.counts.total}</span>
            <span className="data" style={{ color: "var(--legit)" }}>legit {gen.counts.legit}</span>
            <span className="data" style={{ color: "var(--danger)" }}>attack {gen.counts.attack}</span>
          </div>
          {gen.narratives_sample.length > 0 && (
            <>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: "var(--muted)" }}>
                Sample Layer-A narrative artifacts
                <InfoTooltip title="Layer A">
                  The qualitative side of each attack — phishing scripts, deepfake transcripts, injection payloads —
                  written by Gemini when an API key is configured, or a deterministic template otherwise, so this
                  works fully offline too.
                </InfoTooltip>
              </h4>
              <div className="grid md:grid-cols-2 gap-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                {gen.narratives_sample.map((n, i) => (
                  <div key={i} className="card-2 card-hover p-3 text-xs" style={{ borderLeft: "2.5px solid var(--warn)" }}>
                    <div className="font-medium mb-1" style={{ color: "var(--warn)" }}>{n.attack_vector_name}</div>
                    <p style={{ color: "var(--muted)" }}>{n.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {gen && (
        <div className="card p-5">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            Fidelity Lab — prove entity-conditioning matters, on this batch
            <InfoTooltip title="Why this exists">
              Row-independent generators (CTGAN, TVAE, GaussianCopula) preserve column averages but destroy the
              cross-column structure fraud detection depends on. This builds that naive baseline from your own
              batch and measures the gap, instead of just citing a paper.
            </InfoTooltip>
          </h3>
          <FidelityLab batchId={gen.batch_id} />
        </div>
      )}

      {det && gen && (
        <div className="card p-5 space-y-4">
          <h3 className="font-medium">Fused detector results (held-out test split)</h3>
          <div className="flex flex-wrap gap-3">
            <MetricPill label="Precision" value={det.overall.precision} suffix="%" color="var(--accent)" />
            <MetricPill label="Recall" value={det.overall.recall} suffix="%" color="var(--legit)" />
            <MetricPill label="F1" value={det.overall.f1} suffix="%" color="var(--accent)" />
            <MetricPill label="PR-AUC" value={det.overall.pr_auc} suffix="%" color="var(--legit)" />
            <MetricPill label="False positive rate" value={det.overall.false_positive_rate} suffix="%" color="var(--danger)" />
          </div>

          <div className="card-2 overflow-x-auto scrollbar-thin p-1">
            <table className="w-full text-xs border-separate" style={{ borderSpacing: 0 }}>
              <thead>
                <tr className="text-left" style={{ color: "var(--muted)" }}>
                  <th className="py-2 px-3">Vector</th>
                  <th className="py-2 px-3">Precision</th>
                  <th className="py-2 px-3">Recall</th>
                  <th className="py-2 px-3">F1</th>
                  <th className="py-2 px-3">FPR</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(det.per_vector).map(([vid, m], i) => (
                  <tr
                    key={vid}
                    className="transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
                  >
                    <td className="data py-2 px-3">{vid}</td>
                    <td className="data py-2 px-3">{(m.precision * 100).toFixed(0)}%</td>
                    <td className="data py-2 px-3">{(m.recall * 100).toFixed(0)}%</td>
                    <td className="data py-2 px-3">{(m.f1 * 100).toFixed(0)}%</td>
                    <td className="data py-2 px-3">{(m.false_positive_rate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--muted)" }}>
            Tune the decision threshold
            <InfoTooltip title="Why a slider, not a fixed cutoff">
              A 0.5 cutoff is arbitrary. Real fraud-ops teams set the threshold to minimize total business cost
              (missed-fraud cost + false-decline cost) — this recomputes precision/recall/cost live from the scores
              already returned above, no re-scoring needed.
            </InfoTooltip>
          </h4>
          <ThresholdTuner scored={det.scored} />

          <h4 className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--muted)" }}>
            Entity relationship graph
            <InfoTooltip title="What you're looking at">
              Each dot is an entity from this batch; lines connect entities that shared a device. Color = fused risk
              score (teal = legit, red = high risk). Dense red clusters are fraud rings caught by shared
              infrastructure — click any node to inspect it.
            </InfoTooltip>
          </h4>
          <EntityGraph transactions={gen.transactions} scored={det.scored} />

          <h4 className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--muted)" }}>
            Top flagged transactions (grounded, attribution-based explanations)
            <InfoTooltip title="What does grounded mean here?">
              The explanation text is generated from this transaction&apos;s actual signal breakdown (tabular, graph,
              content scores) — the model is constrained to summarize numbers it was given, not invent a plausible-
              sounding reason.
            </InfoTooltip>
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin pr-1">
            {det.scored
              .filter((s) => s.predicted_attack)
              .slice(0, 20)
              .map((s) => (
                <div
                  key={s.id}
                  className="card-2 card-hover p-3 text-xs flex flex-col gap-1"
                  style={{ borderLeft: `2.5px solid ${s.is_attack ? "var(--danger)" : "var(--warn)"}` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="data">{s.id}</span>
                    <span
                      className="pill"
                      style={{ background: s.is_attack ? "color-mix(in srgb, var(--danger) 15%, white)" : "color-mix(in srgb, var(--warn) 15%, white)", color: s.is_attack ? "var(--danger)" : "var(--warn)", borderColor: "transparent" }}
                    >
                      fused {s.fused_score.toFixed(2)} · {s.is_attack ? "true attack" : "false positive"}
                    </span>
                  </div>
                  <p style={{ color: "var(--muted)" }}>{s.explanation}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="card p-5">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          Prove real-time feasibility
          <InfoTooltip title="Batch vs. real-time">
            Everything above scores a whole batch at once. This scores exactly one transaction through the same
            trained detector and times it server-side — proving the model is fast enough for a live authorization
            path (industry target: under 100ms), not just accurate offline.
          </InfoTooltip>
        </h3>
        <LiveScoring vectors={vectors} detectorReady={!!det} />
      </div>
    </div>
  );
}
