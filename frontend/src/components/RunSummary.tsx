import { DetectResponse, GenerateResponse, SelfPlayRound, ZeroDayHypothesis } from "@/lib/api";

export default function RunSummary({
  selected,
  gen,
  det,
  selfPlay,
  zeroDay,
}: {
  selected: string[];
  gen: GenerateResponse | null;
  det: DetectResponse | null;
  selfPlay: SelfPlayRound[] | null;
  zeroDay: ZeroDayHypothesis[] | null;
}) {
  if (!gen || !det) {
    return (
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Run Generate &amp; Detect above first — this section synthesizes every stage&apos;s output into one report
        once there&apos;s something to report on.
      </p>
    );
  }

  const lastRound = selfPlay?.[selfPlay.length - 1];
  const firstRound = selfPlay?.[0];
  const recallHeld = lastRound && firstRound ? lastRound.arms_race_score >= firstRound.arms_race_score - 0.05 : null;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "var(--border)" }}>
        <SummaryCell label="Vectors tested" value={String(selected.length || "all 15")} />
        <SummaryCell label="Batch size" value={String(gen.counts.total)} />
        <SummaryCell label="Detector F1" value={`${(det.overall.f1 * 100).toFixed(1)}%`} color="var(--accent)" />
        <SummaryCell label="False positive rate" value={`${(det.overall.false_positive_rate * 100).toFixed(1)}%`} color="var(--danger)" />
      </div>

      <div className="card-2 p-4 text-sm space-y-3">
        <Line
          label="Generation"
          text={`${gen.counts.attack} synthetic attack rows across ${selected.length || 15} vector(s), entity-conditioned (not row-independent), batch ${gen.batch_id}.`}
        />
        <Line
          label="Detection"
          text={`Fused detector scored ${det.overall.n} held-out transactions at ${(det.overall.precision * 100).toFixed(0)}% precision / ${(det.overall.recall * 100).toFixed(0)}% recall.`}
        />
        <Line
          label="Self-play"
          text={
            selfPlay
              ? `${selfPlay.length} rounds run. Recall ${recallHeld ? "held" : "dropped"} as evasion escalated from ${(firstRound!.evasion_level * 100).toFixed(0)}% to ${(lastRound!.evasion_level * 100).toFixed(0)}% — ${recallHeld ? "the fused signal resisted adaptive evasion" : "these vectors need a stronger signal, see Zero-Day below"}.`
              : "Not run this session — see Step 3 to stress-test the detector against adaptive evasion."
          }
        />
        <Line
          label="Zero-day discovery"
          text={
            zeroDay
              ? zeroDay.length > 0
                ? `${zeroDay.length} candidate pattern(s) found in the detector's blind spot, ready for taxonomy review.`
                : "No unexplained anomalies surfaced — current taxonomy already covers this batch's blind spot."
              : "Not run this session — see Step 4 to mine the detector's blind spot for emerging patterns."
          }
        />
      </div>

      <p className="text-xs" style={{ color: "var(--muted)" }}>
        This is the full closed loop in one report: a grounded taxonomy produced a batch, a fused detector scored
        it, a self-play round tested whether that detection holds under escalating evasion, and a discovery agent
        checked whether the detector has an unexplained blind spot worth feeding back into Step 1.
      </p>
    </div>
  );
}

function SummaryCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-4" style={{ background: "var(--background)" }}>
      <div className="data text-xl font-semibold" style={{ color: color ?? "var(--foreground)" }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}

function Line({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="eyebrow shrink-0 w-28" style={{ color: "var(--accent)" }}>{label}</span>
      <p style={{ color: "var(--muted)" }}>{text}</p>
    </div>
  );
}
