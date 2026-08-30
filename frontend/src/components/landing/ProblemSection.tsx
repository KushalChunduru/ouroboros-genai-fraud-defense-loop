const STATS = [
  { value: "450%+", label: "increase in dark-web “AI Agent” mentions", sub: "Visa PERC, H1 2026" },
  { value: "1,265%", label: "YoY increase in GenAI phishing emails", sub: "2026 phishing threat reporting" },
  { value: "$30–35B", label: "annual US synthetic identity fraud", sub: "Experian / TransUnion, 2026" },
  { value: "24–39×", label: "worse behavioral fidelity in naive GAN-synthesized fraud data", sub: "arXiv:2604.13125, 2026" },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="max-w-6xl mx-auto px-6 py-16 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-2xl mb-10">
        <Eyebrow>The problem</Eyebrow>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2">
          GenAI didn&apos;t just speed fraud up — it changed what fraud looks like
        </h2>
        <p className="mt-3 text-sm md:text-base" style={{ color: "var(--muted)" }}>
          Deepfake voices pass IVR authentication. Autonomous shopping agents run carding attacks at machine speed.
          Synthetic identities build six months of credit history before bust-out. Static, rule-based defenses were
          built for a slower, more manual adversary — and the synthetic data typically used to train new defenses
          doesn&apos;t even preserve the behavioral signal fraud detection depends on.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "var(--border)" }}>
        {STATS.map((s) => (
          <div key={s.label} className="p-5 flex flex-col gap-2" style={{ background: "var(--background)" }}>
            <span className="data text-2xl md:text-3xl font-semibold">{s.value}</span>
            <span className="text-sm" style={{ color: "var(--foreground)" }}>{s.label}</span>
            <span className="text-xs mt-auto" style={{ color: "var(--muted)" }}>{s.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}
