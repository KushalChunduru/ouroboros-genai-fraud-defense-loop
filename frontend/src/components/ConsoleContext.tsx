"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
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

const STORAGE_KEY = "ouroboros-console-run";

type Persisted = {
  selected: string[];
  gen: GenerateResponse | null;
  det: DetectResponse | null;
  selfPlay: SelfPlayRound[] | null;
  zeroDay: ZeroDayHypothesis[] | null;
};

function loadPersisted(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}

/* Lives in the /console layout, so it survives client-side navigation
   between the five stage pages -- splitting the workflow into separate
   routes for usability shouldn't mean losing the run each page feeds.
   Also mirrored to sessionStorage: these are now real, bookmarkable URLs,
   so a direct visit or refresh of e.g. /console/summary needs the same
   run data a client-side Link click would have carried, not an empty
   "run Generate & Detect first" state.

   State always STARTS at the plain default (matching what the server
   rendered) and only picks up sessionStorage after mount, in an effect --
   reading it in the initial useState would make the client's first render
   diverge from the server's, which is a hydration mismatch, not a shortcut. */
export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [gen, setGen] = useState<GenerateResponse | null>(null);
  const [det, setDet] = useState<DetectResponse | null>(null);
  const [selfPlay, setSelfPlay] = useState<SelfPlayRound[] | null>(null);
  const [zeroDay, setZeroDay] = useState<ZeroDayHypothesis[] | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Deliberate one-time hydration from sessionStorage, not a derived-state
    // smell -- must happen post-mount (see the comment above) so this is the
    // sanctioned exception to "don't setState synchronously in an effect".
    const persisted = loadPersisted();
    if (persisted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(persisted.selected);
      setGen(persisted.gen);
      setDet(persisted.det);
      setSelfPlay(persisted.selfPlay);
      setZeroDay(persisted.zeroDay);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const persisted: Persisted = { selected, gen, det, selfPlay, zeroDay };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // storage full or unavailable (private browsing) -- state still works in-memory
    }
  }, [hydrated, selected, gen, det, selfPlay, zeroDay]);

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
