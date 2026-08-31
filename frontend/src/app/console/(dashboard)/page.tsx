"use client";

import StepSection from "@/components/StepSection";
import StageFooterNav from "@/components/StageFooterNav";
import TaxonomyExplorer from "@/components/TaxonomyExplorer";
import { useConsole } from "@/components/ConsoleContext";

export default function IdentifyPage() {
  const { selected, setSelected, stages } = useConsole();

  return (
    <>
      <div className="pt-8 pb-2">
        <h1 className="text-2xl font-semibold tracking-tight">One run, five stages, one closed loop</h1>
        <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--muted)" }}>
          Each stage lives on its own page now, but they still share one run: the vectors you pick here carry into
          generation, the batch you generate is what gets scored and mined for blind spots, and the summary at the
          end reports on this exact run — not a disconnected demo per page.
        </p>
      </div>

      <StepSection id="identify" index={1} title="Identify attack vectors" status={stages[0].status} divider={false}>
        <TaxonomyExplorer selected={selected} setSelected={setSelected} />
      </StepSection>

      <StageFooterNav currentId="identify" />
    </>
  );
}
