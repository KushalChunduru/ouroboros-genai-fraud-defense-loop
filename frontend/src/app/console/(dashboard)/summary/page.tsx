"use client";

import StepSection from "@/components/StepSection";
import StageFooterNav from "@/components/StageFooterNav";
import RunSummary from "@/components/RunSummary";
import { useConsole } from "@/components/ConsoleContext";

export default function SummaryPage() {
  const { selected, gen, det, selfPlay, zeroDay, stages } = useConsole();

  return (
    <>
      <div className="pt-8 pb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Run summary</h1>
        <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--muted)" }}>
          Everything the previous four pages produced, synthesized into one report on this exact run.
        </p>
      </div>

      <StepSection id="summary" index={5} title="Run summary" status={stages[4].status} divider={false}>
        <RunSummary selected={selected} gen={gen} det={det} selfPlay={selfPlay} zeroDay={zeroDay} />
      </StepSection>

      <StageFooterNav currentId="summary" />
    </>
  );
}
