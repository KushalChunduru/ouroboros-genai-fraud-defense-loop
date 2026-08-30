import { Eyebrow } from "./ProblemSection";

const PILLARS = [
  {
    n: "01",
    title: "Identify",
    tag: "Living taxonomy",
    desc: "15 GenAI payment-fraud attack vectors tagged across four independent axes — channel, rail, social-engineering surface, technique — each grounded in a named 2026 source, not invented from first principles.",
    color: "var(--accent)",
  },
  {
    n: "02",
    title: "Generate",
    tag: "Entity-conditioned simulation",
    desc: "A persistent-state behavioral simulator (not a row-independent GAN) plus a Gemini narrative agent, producing transaction graphs and attack content that preserve burst timing and device-sharing motifs.",
    color: "var(--accent-2)",
  },
  {
    n: "03",
    title: "Defend",
    tag: "Fused detector",
    desc: "Gradient boosting + graph propagation + content-language scoring fused into one risk score, with grounded, attribution-based explanations for every flagged transaction.",
    color: "var(--warn)",
  },
];

export default function PillarsSection() {
  return (
    <section id="pillars" className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-2xl mb-10">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2">
          Three pillars, built as one connected system
        </h2>
        <p className="mt-3 text-sm md:text-base" style={{ color: "var(--muted)" }}>
          Each pillar is a fully working component in the console — not a slide. Together they form the pipeline
          that runs underneath the self-play and zero-day loops.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {PILLARS.map((p, i) => (
          <div key={p.title} className="card p-6 relative overflow-hidden group transition-transform hover:-translate-y-1">
            <div
              className="absolute -top-6 -right-4 text-7xl font-bold opacity-10 select-none"
              style={{ color: p.color }}
            >
              {p.n}
            </div>
            <div className="h-9 w-9 rounded-lg mb-4 flex items-center justify-center" style={{ background: `color-mix(in srgb, ${p.color} 18%, transparent)` }}>
              <div className="h-3 w-3 rounded-sm" style={{ background: p.color }} />
            </div>
            <h3 className="text-lg font-semibold">{p.title}</h3>
            <div className="text-xs mb-3" style={{ color: p.color }}>
              {p.tag}
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {p.desc}
            </p>
            {i < PILLARS.length - 1 && (
              <div
                className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 h-6 w-6 rounded-full items-center justify-center text-xs z-10"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--muted)" }}
              >
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
