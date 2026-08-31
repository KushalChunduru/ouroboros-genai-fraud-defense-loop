"use client";

import StepSection from "@/components/StepSection";
import StageFooterNav from "@/components/StageFooterNav";
import GenerateDetectConsole from "@/components/GenerateDetectConsole";
import { useConsole } from "@/components/ConsoleContext";

export default function GeneratePage() {
  const { selected, setResult, stages } = useConsole();

  return (
    <>
      <div className="pt-8 pb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Generate a batch, then detect</h1>
        <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--muted)" }}>
          Using {selected.length || "all 15"} vector(s) selected on the Identify page. Generation produces the
          batch this whole run scores, stress-tests, and mines below.
        </p>
      </div>

      <StepSection id="generate" index={2} title="Generate a batch, then detect" status={stages[1].status} divider={false}>
        <GenerateDetectConsole selected={selected} onResult={setResult} />
      </StepSection>

      <StageFooterNav currentId="generate" />
    </>
  );
}
