import Reveal from "@/components/Reveal";

const STATS = [
  { value: "450%+", label: "dark-web “AI Agent” mentions", sub: "Visa PERC, H1 2026" },
  { value: "1,265%", label: "YoY GenAI phishing emails", sub: "2026 phishing threat reporting" },
  { value: "$30–35B", label: "annual US synthetic identity fraud", sub: "Experian / TransUnion, 2026" },
  { value: "24–39×", label: "worse behavioral fidelity, naive GAN data", sub: "arXiv:2604.13125, 2026" },
];

const FIXES = [
  { label: "Living taxonomy", text: "15 attack vectors, each grounded in a named 2026 source — not invented." },
  { label: "Entity-conditioned simulation", text: "A persistent-state simulator that preserves the behavioral signal naive generators lose." },
  { label: "Fused detector + arms race", text: "Tabular + graph + content signal, stress-tested round over round against adaptive evasion." },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="max-w-6xl mx-auto px-6 py-20 border-t" style={{ borderColor: "var(--border)" }}>
      <Reveal>
        <div className="max-w-2xl mb-10">
          <Eyebrow>The problem, the fix</Eyebrow>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2">
            GenAI didn&apos;t just speed fraud up — it changed what fraud looks like
          </h2>
        </div>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-0 items-stretch">
          <div className="mesh-warm rounded-3xl p-7 md:p-9 flex flex-col">
            <div className="eyebrow mb-4" style={{ color: "rgba(255,244,239,0.65)" }}>
              The problem we found
            </div>
            <p className="text-base md:text-lg font-medium leading-snug">
              Deepfake voices pass IVR authentication. Autonomous shopping agents run carding attacks at machine
              speed. Synthetic identities build six months of credit history before bust-out — and the synthetic
              data used to train defenses doesn&apos;t even preserve the signal detection depends on.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-4 mt-7 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              {STATS.map((s) => (
                <div key={s.label} className="min-w-[130px]">
                  <div className="data text-xl font-semibold">{s.value}</div>
                  <div className="text-xs mt-0.5 mesh-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <FlowConnector />

          <div className="mesh-cool rounded-3xl p-7 md:p-9 flex flex-col">
            <div className="eyebrow mb-4" style={{ color: "rgba(238,242,255,0.65)" }}>
              The system we built
            </div>
            <p className="text-base md:text-lg font-medium leading-snug mb-6">
              A closed loop, not a slide: the taxonomy, the simulator, and the detector all feed each other — and
              the whole thing runs live in the console below.
            </p>
            <div className="space-y-4 mt-auto pt-2">
              {FIXES.map((f) => (
                <div key={f.label} className="flex gap-3">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0 mt-2" style={{ background: "#eef2ff" }} />
                  <div>
                    <div className="text-sm font-semibold">{f.label}</div>
                    <div className="text-xs mesh-muted mt-0.5">{f.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function FlowConnector() {
  return (
    <div className="hidden md:flex items-center justify-center px-3">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "var(--muted)" }}>
        <path d="M4 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}
