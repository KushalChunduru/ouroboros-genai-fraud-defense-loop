"use client";

import { useState } from "react";
import TopBar, { Tab } from "@/components/TopBar";
import TaxonomyExplorer from "@/components/TaxonomyExplorer";
import GenerateDetectConsole from "@/components/GenerateDetectConsole";
import SelfPlayDashboard from "@/components/SelfPlayDashboard";
import ZeroDayPanel from "@/components/ZeroDayPanel";

export default function Home() {
  const [tab, setTab] = useState<Tab>("Identify");
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar tab={tab} setTab={setTab} />
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
        {tab === "Identify" && <TaxonomyExplorer selected={selected} setSelected={setSelected} />}
        {tab === "Generate & Detect" && <GenerateDetectConsole selected={selected} />}
        {tab === "Self-Play Arms Race" && <SelfPlayDashboard selected={selected} />}
        {tab === "Zero-Day Discovery" && <ZeroDayPanel selected={selected} />}
      </main>
      <footer className="text-center text-xs py-6" style={{ color: "var(--muted)" }}>
        Ouroboros — Mastercard Innovation Challenge @ GFF 2026 · synthetic data only, no real PII
      </footer>
    </div>
  );
}
