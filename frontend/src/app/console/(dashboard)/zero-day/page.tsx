"use client";

import StepSection from "@/components/StepSection";
import StageFooterNav from "@/components/StageFooterNav";
import ZeroDayPanel from "@/components/ZeroDayPanel";
import { useConsole } from "@/components/ConsoleContext";

export default function ZeroDayPage() {
  const { selected, gen, setZeroDay, stages } = useConsole();

  return (
    <>
      <div className="pt-8 pb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Discover zero-day patterns</h1>
        <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--muted)" }}>
          Mines the batch from the Generate &amp; Detect page for the detector&apos;s blind spot and proposes new
          attack hypotheses back into the taxonomy on the Identify page.
        </p>
      </div>

      <StepSection id="zeroday" index={4} title="Discover zero-day patterns" status={stages[3].status} divider={false}>
        <ZeroDayPanel selected={selected} sharedBatch={gen} onResult={setZeroDay} />
      </StepSection>

      <StageFooterNav currentId="zeroday" />
    </>
  );
}
