"use client";

import { ReactNode } from "react";
import ConsoleSidebar from "./ConsoleSidebar";
import StageRail from "./StageRail";
import { useConsole } from "./ConsoleContext";

export default function ConsoleShell({ children }: { children: ReactNode }) {
  const { stages } = useConsole();

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <ConsoleSidebar stages={stages} />
      <div className="flex-1 flex flex-col lg:pl-64">
        <StageRail stages={stages} />
        <main className="wash-soft max-w-6xl mx-auto w-full px-6 flex-1">{children}</main>
        <footer className="text-center text-xs py-6 border-t" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
          Ouroboros — Mastercard Innovation Challenge @ GFF 2026 · synthetic data only, no real PII
        </footer>
      </div>
    </div>
  );
}
