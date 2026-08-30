"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const FALLBACK = [
  "Deepfake voice IVR bypass", "Agentic checkout hijack", "Synthetic identity origination",
  "LLM-orchestrated carding", "Mule-network routing", "Zero-day pattern discovery",
];

export default function TaxonomyTicker() {
  const [names, setNames] = useState<string[]>(FALLBACK);

  useEffect(() => {
    api.taxonomy().then((r) => setNames(r.vectors.map((v) => v.name))).catch(() => {});
  }, []);

  const loop = [...names, ...names];

  return (
    <div className="relative py-4 border-y overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <div
        className="absolute inset-y-0 left-0 w-24 z-10"
        style={{ background: "linear-gradient(90deg, var(--background), transparent)" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-24 z-10"
        style={{ background: "linear-gradient(270deg, var(--background), transparent)" }}
      />
      <div className="flex gap-3 w-max" style={{ animation: "ticker 44s linear infinite" }}>
        {loop.map((name, i) => (
          <span key={i} className="pill shrink-0" style={{ padding: "6px 14px" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: i % 2 === 0 ? "var(--accent)" : "var(--accent-2)" }} />
            {name}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
