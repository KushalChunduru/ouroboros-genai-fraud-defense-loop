"use client";

import { useState } from "react";
import StageRail, { Stage } from "@/components/StageRail";
import ConsoleSidebar from "@/components/ConsoleSidebar";
import StepSection from "@/components/StepSection";
import TaxonomyExplorer from "@/components/TaxonomyExplorer";
import GenerateDetectConsole from "@/components/GenerateDetectConsole";
import SelfPlayDashboard from "@/components/SelfPlayDashboard";
import ZeroDayPanel from "@/components/ZeroDayPanel";
import RunSummary from "@/components/RunSummary";
import { DetectResponse, GenerateResponse, SelfPlayRound, ZeroDayHypothesis } from "@/lib/api";

export default function ConsolePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [gen, setGen] = useState<GenerateResponse | null>(null);
  const [det, setDet] = useState<DetectResponse | null>(null);
  const [selfPlay, setSelfPlay] = useState<SelfPlayRound[] | null>(null);
  const [zeroDay, setZeroDay] = useState<ZeroDayHypothesis[] | null>(null);

  const stages: Stage[] = [
    { id: "identify", label: "Identify", status: selected.length > 0 ? "done" : "current" },
    { id: "generate", label: "Generate & Detect", status: det ? "done" : selected.length > 0 ? "current" : "pending" },
    { id: "selfplay", label: "Self-Play", status: selfPlay ? "done" : det ? "current" : "pending" },
    { id: "zeroday", label: "Zero-Day", status: zeroDay ? "done" : det ? "current" : "pending" },
    { id: "summary", label: "Summary", status: det ? "current" : "pending" },
  ];

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <ConsoleSidebar stages={stages} />
      <div className="flex-1 flex flex-col lg:pl-64">
        <StageRail stages={stages} />
        <main className="wash-soft max-w-6xl mx-auto w-full px-6 flex-1">
          <div className="pt-8 pb-2">
            <h1 className="text-2xl font-semibold tracking-tight">One run, five stages, one closed loop</h1>
            <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--muted)" }}>
              Each stage below feeds the next: the vectors you pick carry into generation, the batch you generate is
              what gets scored and mined for blind spots, and the summary at the end reports on this exact run — not
              a disconnected demo per tab.
            </p>
          </div>

          <StepSection id="identify" index={1} title="Identify attack vectors" status={stages[0].status}>
            <TaxonomyExplorer selected={selected} setSelected={setSelected} />
          </StepSection>

          <StepSection id="generate" index={2} title="Generate a batch, then detect" status={stages[1].status}>
            <GenerateDetectConsole selected={selected} onResult={(g, d) => { setGen(g); setDet(d); }} />
          </StepSection>

          <StepSection id="selfplay" index={3} title="Stress-test with self-play" status={stages[2].status}>
            <SelfPlayDashboard selected={selected} onResult={setSelfPlay} />
          </StepSection>

          <StepSection id="zeroday" index={4} title="Discover zero-day patterns" status={stages[3].status}>
            <ZeroDayPanel selected={selected} sharedBatch={gen} onResult={setZeroDay} />
          </StepSection>

          <StepSection id="summary" index={5} title="Run summary" status={stages[4].status}>
            <RunSummary selected={selected} gen={gen} det={det} selfPlay={selfPlay} zeroDay={zeroDay} />
          </StepSection>
        </main>
        <footer className="text-center text-xs py-6 border-t" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
          Ouroboros — Mastercard Innovation Challenge @ GFF 2026 · synthetic data only, no real PII
        </footer>
      </div>
    </div>
  );
}
