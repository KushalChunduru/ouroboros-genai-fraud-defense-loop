"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const TABS = ["Identify", "Generate & Detect", "Self-Play Arms Race", "Zero-Day Discovery"] as const;
export type Tab = (typeof TABS)[number];

export default function TopBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const [health, setHealth] = useState<{ status: string; gemini_enabled: boolean; vectors: number } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setError(true));
  }, []);

  return (
    <div className="sticky top-0 z-10 border-b" style={{ borderColor: "var(--border)", background: "rgba(11,13,20,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-lg font-bold transition-transform group-hover:scale-105"
               style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}>
            &#8734;
          </div>
          <div>
            <div className="font-semibold tracking-tight text-lg leading-none">Ouroboros</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>GenAI Payment Fraud Red/Blue Loop</div>
          </div>
        </Link>

        <nav className="flex gap-1 card-2 p-1 rounded-full">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3.5 py-1.5 rounded-full text-sm transition-colors"
              style={{
                background: tab === t ? "var(--accent)" : "transparent",
                color: tab === t ? "white" : "var(--muted)",
              }}
            >
              {t}
            </button>
          ))}
        </nav>

        <div className="text-xs flex items-center gap-3" style={{ color: "var(--muted)" }}>
          <Link href="/" className="hidden md:inline hover:underline">
            &larr; Overview
          </Link>
          {error ? (
            <span style={{ color: "var(--danger)" }}>backend offline</span>
          ) : health ? (
            <>
              <span className="h-2 w-2 rounded-full inline-block" style={{ background: "var(--accent-2)" }} />
              {health.vectors} vectors ·{" "}
              {health.gemini_enabled ? (
                <span style={{ color: "var(--accent-2)" }}>Gemini live</span>
              ) : (
                <span style={{ color: "var(--warn)" }}>template fallback mode</span>
              )}
            </>
          ) : (
            "connecting…"
          )}
        </div>
      </div>
    </div>
  );
}
