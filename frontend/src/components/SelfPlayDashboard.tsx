"use client";

import { useState } from "react";
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { api, SelfPlayRound } from "@/lib/api";

export default function SelfPlayDashboard({ selected }: { selected: string[] }) {
  const [rounds, setRounds] = useState(5);
  const [nLegit, setNLegit] = useState(300);
  const [nAttack, setNAttack] = useState(35);
  const [results, setResults] = useState<SelfPlayRound[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.selfplay({ rounds, n_legit: nLegit, n_attack_per_vector: nAttack, attack_ids: selected });
      setResults(r.rounds);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const chartData = results?.map((r) => ({
    round: `R${r.round_index}`,
    "avg evasion level": Number((r.evasion_level * 100).toFixed(1)),
    "avg detector recall": Number((r.arms_race_score * 100).toFixed(1)),
    "false positive rate": Number((r.overall.false_positive_rate * 100).toFixed(1)),
  }));

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-1">Self-play arms race</h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          Instead of generating once and training once, the attacker and defender co-evolve over N rounds: each
          round the attacker escalates evasion specifically on the vectors the fused detector caught best last
          round (an adaptive minimax dynamic), a fresh detector is trained/evaluated on a held-out split, and the
          resulting detection curve is the closed loop the challenge brief describes — made measurable rather than
          asserted.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm">
            Rounds
            <input type="number" value={rounds} onChange={(e) => setRounds(Number(e.target.value))} className="block mt-1 card-2 px-3 py-1.5 rounded-md w-24" />
          </label>
          <label className="text-sm">
            Legit volume / round
            <input type="number" value={nLegit} onChange={(e) => setNLegit(Number(e.target.value))} className="block mt-1 card-2 px-3 py-1.5 rounded-md w-32" />
          </label>
          <label className="text-sm">
            Attack rows / vector
            <input type="number" value={nAttack} onChange={(e) => setNAttack(Number(e.target.value))} className="block mt-1 card-2 px-3 py-1.5 rounded-md w-32" />
          </label>
          <button onClick={run} disabled={loading} className="px-4 py-2 rounded-lg font-medium text-sm" style={{ background: "var(--accent)", color: "white" }}>
            {loading ? "Running rounds… (can take a minute)" : "Run self-play"}
          </button>
        </div>
        {error && <p className="text-sm mt-3" style={{ color: "var(--danger)" }}>{error}</p>}
      </div>

      {chartData && (
        <div className="card p-5">
          <h3 className="font-medium mb-3">Round-over-round arms race</h3>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="round" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="avg detector recall" stroke="var(--accent-2)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="avg evasion level" stroke="var(--warn)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="false positive rate" stroke="var(--danger)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
            As the attacker escalates evasion on vectors it keeps losing on, watch whether the fused detector&apos;s
            recall holds — a flat/rising line demonstrates a resilient closed loop; a falling line pinpoints exactly
            which vectors need a stronger signal, feeding directly into the Zero-Day Discovery panel.
          </p>
        </div>
      )}
    </div>
  );
}
