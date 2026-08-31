"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import OuroborosMark from "./landing/OuroborosMark";

export type StageStatus = "done" | "current" | "pending";
export type Stage = { id: string; label: string; status: StageStatus };

export default function StageRail({ stages }: { stages: Stage[] }) {
  const [health, setHealth] = useState<{ status: string; gemini_enabled: boolean; vectors: number } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setError(true));
  }, []);

  return (
    <div className="lg:hidden sticky top-0 z-10 border-b" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 md:gap-6">
        <Link href="/" className="flex items-center gap-2.5 order-1 shrink-0">
          <OuroborosMark size={18} />
          <span className="font-semibold tracking-tight text-sm">Ouroboros</span>
        </Link>

        <nav className="order-3 md:order-2 w-full md:w-auto flex gap-1 overflow-x-auto scrollbar-thin">
          {stages.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm shrink-0 whitespace-nowrap transition-colors"
              style={{ color: s.status === "pending" ? "var(--muted)" : "var(--foreground)" }}
            >
              <span className="data badge-outline h-4 w-4 text-[9px] shrink-0" data-state={s.status}>
                {s.status === "done" ? "✓" : i + 1}
              </span>
              {s.label}
            </a>
          ))}
        </nav>

        <div className="order-2 md:order-3 text-xs flex items-center gap-3" style={{ color: "var(--muted)" }}>
          <Link href="/" className="hidden md:inline hover:underline">
            &larr; Overview
          </Link>
          {error ? (
            <span className="pill" style={{ color: "var(--danger)", borderColor: "color-mix(in srgb, var(--danger) 40%, var(--border))" }}>
              backend offline
            </span>
          ) : health ? (
            <span className="pill data" title="The fused detector always trains live via scikit-learn regardless of this setting — this only affects whether phishing/deepfake narrative text is LLM-generated or templated.">
              <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: "var(--legit)" }} />
              {health.vectors} vectors · detector: live-trained ·{" "}
              {health.gemini_enabled ? (
                <span style={{ color: "var(--legit)" }}>narratives: Gemini live</span>
              ) : (
                <span style={{ color: "var(--warn)" }}>narratives: templated</span>
              )}
            </span>
          ) : (
            "connecting…"
          )}
        </div>
      </div>
    </div>
  );
}
