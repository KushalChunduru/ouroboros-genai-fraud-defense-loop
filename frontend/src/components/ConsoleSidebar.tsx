"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import OuroborosMark from "./landing/OuroborosMark";
import { IconRadar, IconSpark, IconShield, IconMicroscope, IconReport } from "./landing/icons";
import type { Stage } from "./StageRail";

const ICONS = [IconRadar, IconSpark, IconShield, IconMicroscope, IconReport];

/* Left-sidebar dashboard nav -- the VERDE-reference's "minimal navigation
   for maximum focus" pattern: logo, a flat list of destinations with the
   current one pilled, a status card pinned to the bottom instead of a
   user profile since this console has no login. */
export default function ConsoleSidebar({ stages }: { stages: Stage[] }) {
  const [health, setHealth] = useState<{ status: string; gemini_enabled: boolean; vectors: number } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setError(true));
  }, []);

  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 z-20"
      style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
    >
      <Link href="/" className="flex items-center gap-2.5 px-6 h-16 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <OuroborosMark size={18} />
        <span className="font-semibold tracking-tight text-sm">Ouroboros</span>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {stages.map((s, i) => {
          const Icon = ICONS[i] ?? IconReport;
          const active = s.status === "current";
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                background: active ? "var(--surface-2)" : "transparent",
                color: active ? "var(--foreground)" : "var(--muted)",
                fontWeight: active ? 600 : 500,
              }}
            >
              <Icon color={s.status === "done" ? "var(--accent)" : active ? "var(--foreground)" : "var(--muted)"} />
              {s.label}
              {s.status === "done" && (
                <span className="data ml-auto text-[10px]" style={{ color: "var(--accent)" }}>✓</span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="p-3">
        <Link href="/" className="text-xs px-3 hover:underline" style={{ color: "var(--muted)" }}>
          &larr; Overview
        </Link>
        <div className="mt-3 rounded-xl p-3.5" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          {error ? (
            <span className="text-xs" style={{ color: "var(--danger)" }}>Backend offline</span>
          ) : health ? (
            <>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: "var(--legit)" }} />
                {health.vectors} vectors live
              </div>
              <div className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
                detector: live-trained
                <br />
                narratives:{" "}
                <span style={{ color: health.gemini_enabled ? "var(--legit)" : "var(--warn)" }}>
                  {health.gemini_enabled ? "Gemini live" : "templated"}
                </span>
              </div>
            </>
          ) : (
            <span className="text-xs" style={{ color: "var(--muted)" }}>connecting…</span>
          )}
        </div>
      </div>
    </aside>
  );
}
