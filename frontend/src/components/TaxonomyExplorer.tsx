"use client";

import { useEffect, useMemo, useState } from "react";
import { api, AttackVector } from "@/lib/api";

const AXES = ["channel", "rail", "social_surface", "technique"] as const;

export default function TaxonomyExplorer({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (ids: string[]) => void;
}) {
  const [vectors, setVectors] = useState<AttackVector[]>([]);
  const [filterAxis, setFilterAxis] = useState<(typeof AXES)[number]>("technique");
  const [filterValue, setFilterValue] = useState<string>("all");

  useEffect(() => {
    api.taxonomy().then((r) => setVectors(r.vectors));
  }, []);

  const axisValues = useMemo(
    () => ["all", ...Array.from(new Set(vectors.map((v) => v[filterAxis])))],
    [vectors, filterAxis]
  );

  const filtered = vectors.filter((v) => filterValue === "all" || v[filterAxis] === filterValue);

  const toggle = (id: string) => {
    setSelected(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-1">Living attack taxonomy</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {vectors.length} grounded GenAI payment-fraud attack vectors, tagged across four independent axes
          (channel, rail, social-engineering surface, technique family) so coverage is provably broad rather than a
          flat anecdotal list. New entries can be appended automatically by the Zero-Day Discovery agent.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {AXES.map((a) => (
            <button
              key={a}
              onClick={() => {
                setFilterAxis(a);
                setFilterValue("all");
              }}
              className={`px-3 py-1 rounded-full text-xs capitalize transition-all ${filterAxis === a ? "btn-primary" : ""}`}
              style={{
                background: filterAxis === a ? undefined : "var(--surface-2)",
                color: filterAxis === a ? undefined : "var(--muted)",
              }}
            >
              {a.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {axisValues.map((v) => (
            <button
              key={v}
              onClick={() => setFilterValue(v)}
              className="px-2.5 py-1 rounded-md text-xs capitalize border"
              style={{
                borderColor: "var(--border)",
                background: filterValue === v ? "var(--surface-2)" : "transparent",
                color: filterValue === v ? "var(--foreground)" : "var(--muted)",
              }}
            >
              {v.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          {selected.length} selected for simulation ({filtered.length} shown)
        </span>
        <div className="flex gap-2">
          <button className="text-xs underline" style={{ color: "var(--accent-2)" }} onClick={() => setSelected(vectors.map((v) => v.id))}>
            select all
          </button>
          <button className="text-xs underline" style={{ color: "var(--muted)" }} onClick={() => setSelected([])}>
            clear
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((v) => (
          <button
            key={v.id}
            onClick={() => toggle(v.id)}
            className="card-2 card-hover p-4 text-left hover:-translate-y-0.5"
            style={{ outline: selected.includes(v.id) ? "2px solid var(--accent)" : "none" }}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm leading-snug">{v.name}</h3>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded shrink-0 font-medium"
                style={{ background: "color-mix(in srgb, var(--warn) 15%, transparent)", color: "var(--warn)" }}
              >
                sev {v.severity_base.toFixed(2)}
              </span>
            </div>
            <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>
              {v.description}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {[v.channel, v.rail, v.social_surface, v.technique].map((tag) => (
                <span key={tag} className="pill capitalize" style={{ padding: "2px 8px", fontSize: "10px" }}>
                  {tag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
            <p className="text-[10px] mt-2 italic" style={{ color: "var(--muted)" }}>
              source: {v.source}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
