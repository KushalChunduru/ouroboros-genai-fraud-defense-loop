"use client";

import StepSection from "@/components/StepSection";
import StageFooterNav from "@/components/StageFooterNav";
import SelfPlayDashboard from "@/components/SelfPlayDashboard";
import { useConsole } from "@/components/ConsoleContext";

export default function SelfPlayPage() {
  const { selected, setSelfPlay, stages } = useConsole();

  return (
    <>
      <div className="pt-8 pb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Stress-test with self-play</h1>
        <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--muted)" }}>
          Escalates evasion round over round against a freshly trained detector, to check whether the detection
          from the Generate &amp; Detect page actually holds up under an adaptive adversary.
        </p>
      </div>

      <StepSection id="selfplay" index={3} title="Stress-test with self-play" status={stages[2].status} divider={false}>
        <SelfPlayDashboard selected={selected} onResult={setSelfPlay} />
      </StepSection>

      <StageFooterNav currentId="selfplay" />
    </>
  );
}
