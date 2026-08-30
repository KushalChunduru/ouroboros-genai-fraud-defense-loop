"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, BatchReport } from "@/lib/api";
import OuroborosMark from "@/components/landing/OuroborosMark";

export default function ReportPage() {
  const params = useParams<{ batchId: string }>();
  const [report, setReport] = useState<BatchReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.report(params.batchId).then(setReport).catch((e) => setError(String(e)));
  }, [params.batchId]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <OuroborosMark size={18} />
            <span className="font-semibold tracking-tight text-sm">Ouroboros</span>
          </Link>
          <Link href="/console" className="btn btn-ghost">
            Open the full console →
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-6 py-12 flex-1">
        <div className="eyebrow mb-3">Standalone run report</div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Batch <span className="data">{params.batchId}</span>
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
          A permalink snapshot of one Generate &amp; Detect run — shareable without asking the recipient to
          re-run the pipeline. This link only works while the backend process that produced it is still running
          (in-memory store, not a database — see the feasibility notes in the repo).
        </p>

        {error && (
          <div className="card p-5">
            <p className="text-sm" style={{ color: "var(--danger)" }}>
              {error.includes("404")
                ? "No cached report for this batch — either it was never scored, or the backend has restarted since."
                : error}
            </p>
          </div>
        )}

        {!report && !error && <p className="text-sm" style={{ color: "var(--muted)" }}>Loading…</p>}

        {report && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-px" style={{ background: "var(--border)" }}>
              <Cell label="Total transactions" value={String(report.counts.total)} />
              <Cell label="Legit" value={String(report.counts.legit)} color="var(--legit)" />
              <Cell label="Attack" value={String(report.counts.attack)} color="var(--danger)" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-px" style={{ background: "var(--border)" }}>
              <Cell label="Precision" value={`${(report.overall.precision * 100).toFixed(1)}%`} />
              <Cell label="Recall" value={`${(report.overall.recall * 100).toFixed(1)}%`} color="var(--legit)" />
              <Cell label="F1" value={`${(report.overall.f1 * 100).toFixed(1)}%`} />
              <Cell label="PR-AUC" value={`${(report.overall.pr_auc * 100).toFixed(1)}%`} color="var(--legit)" />
              <Cell label="FPR" value={`${(report.overall.false_positive_rate * 100).toFixed(1)}%`} color="var(--danger)" />
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
                  {Object.entries(report.per_vector).map(([vid, m], i) => (
                    <tr key={vid} style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
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
          </div>
        )}
      </main>
      <footer className="text-center text-xs py-6 border-t" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
        Ouroboros — Mastercard Innovation Challenge @ GFF 2026 · synthetic data only, no real PII
      </footer>
    </div>
  );
}

function Cell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-4" style={{ background: "var(--background)" }}>
      <div className="data text-xl font-semibold" style={{ color: color ?? "var(--foreground)" }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
