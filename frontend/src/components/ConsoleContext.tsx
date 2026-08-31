"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { DetectResponse, GenerateResponse, SelfPlayRound, ZeroDayHypothesis } from "@/lib/api";
import type { Stage } from "./StageRail";

type ConsoleState = {
  selected: string[];
  setSelected: (v: string[]) => void;
  gen: GenerateResponse | null;
  det: DetectResponse | null;
  setResult: (g: GenerateResponse | null, d: DetectResponse | null) => void;
  selfPlay: SelfPlayRound[] | null;
  setSelfPlay: (v: SelfPlayRound[] | null) => void;
  zeroDay: ZeroDayHypothesis[] | null;
  setZeroDay: (v: ZeroDayHypothesis[] | null) => void;
  stages: Stage[];
};

const ConsoleCtx = createContext<ConsoleState | null>(null);

/* Lives in the /console layout, so it survives client-side navigation
   between the five stage pages -- splitting the workflow into separate
   routes for usability shouldn't mean losing the run each page feeds. */
export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [gen, setGen] = useState<GenerateResponse | null>(null);
  const [det, setDet] = useState<DetectResponse | null>(null);
  const [selfPlay, setSelfPlay] = useState<SelfPlayRound[] | null>(null);
  const [zeroDay, setZeroDay] = useState<ZeroDayHypothesis[] | null>(null);

  const setResult = (g: GenerateResponse | null, d: DetectResponse | null) => {
    setGen(g);
    setDet(d);
  };

  const stages: Stage[] = useMemo(
    () => [
      { id: "identify", href: "/console", label: "Identify", status: selected.length > 0 ? "done" : "current" },
      { id: "generate", href: "/console/generate", label: "Generate & Detect", status: det ? "done" : selected.length > 0 ? "current" : "pending" },
      { id: "selfplay", href: "/console/self-play", label: "Self-Play", status: selfPlay ? "done" : det ? "current" : "pending" },
      { id: "zeroday", href: "/console/zero-day", label: "Zero-Day", status: zeroDay ? "done" : det ? "current" : "pending" },
      { id: "summary", href: "/console/summary", label: "Summary", status: det ? "current" : "pending" },
    ],
    [selected, det, selfPlay, zeroDay]
  );

  const value: ConsoleState = { selected, setSelected, gen, det, setResult, selfPlay, setSelfPlay, zeroDay, setZeroDay, stages };

  return <ConsoleCtx.Provider value={value}>{children}</ConsoleCtx.Provider>;
}

export function useConsole() {
  const ctx = useContext(ConsoleCtx);
  if (!ctx) throw new Error("useConsole must be used within ConsoleProvider");
  return ctx;
}
