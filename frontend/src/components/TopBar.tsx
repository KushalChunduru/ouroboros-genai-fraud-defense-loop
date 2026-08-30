"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import OuroborosMark from "./landing/OuroborosMark";

const TABS = ["Identify", "Generate & Detect", "Self-Play Arms Race", "Zero-Day Discovery"] as const;
export type Tab = (typeof TABS)[number];

export default function TopBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const [health, setHealth] = useState<{ status: string; gemini_enabled: boolean; vectors: number } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setError(true));
  }, []);

  return (
    <div className="sticky top-0 z-10 border-b" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 md:gap-6">
        <Link href="/" className="flex items-center gap-2.5 order-1 shrink-0">
          <OuroborosMark size={18} />
          <span className="font-semibold tracking-tight text-sm">Ouroboros</span>
        </Link>

        <nav className="order-3 md:order-2 w-full md:w-auto flex gap-1 card-2 p-1 rounded-full overflow-x-auto scrollbar-thin">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-active={tab === t}
              className="segment shrink-0 whitespace-nowrap"
            >
              {t}
            </button>
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
            <span className="pill data">
              <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: "var(--legit)" }} />
              {health.vectors} vectors ·{" "}
              {health.gemini_enabled ? (
                <span style={{ color: "var(--legit)" }}>Gemini live</span>
              ) : (
                <span style={{ color: "var(--warn)" }}>template fallback mode</span>
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
