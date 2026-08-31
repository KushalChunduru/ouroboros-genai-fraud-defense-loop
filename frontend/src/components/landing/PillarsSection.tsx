import Reveal from "@/components/Reveal";
import { Eyebrow } from "./ProblemSection";
import { IconRadar, IconSpark, IconShield } from "./icons";

const PILLARS = [
  {
    n: "01",
    title: "Identify",
    tag: "Living taxonomy",
    desc: "15 GenAI payment-fraud attack vectors tagged across four independent axes — channel, rail, social-engineering surface, technique — each grounded in a named 2026 source, not invented from first principles.",
    Icon: IconRadar,
    color: "var(--accent)",
  },
  {
    n: "02",
    title: "Generate",
    tag: "Entity-conditioned simulation",
    desc: "A persistent-state behavioral simulator (not a row-independent GAN) plus a Gemini narrative agent, producing transaction graphs and attack content that preserve burst timing and device-sharing motifs.",
    Icon: IconSpark,
    color: "var(--legit)",
  },
  {
    n: "03",
    title: "Defend",
    tag: "Fused detector",
    desc: "Gradient boosting + graph propagation + content-language scoring fused into one risk score, with grounded, attribution-based explanations for every flagged transaction.",
    Icon: IconShield,
    color: "var(--accent-2)",
  },
];

export default function PillarsSection() {
  return (
    <section id="pillars" className="max-w-6xl mx-auto px-6 py-16 border-t" style={{ borderColor: "var(--border)" }}>
      <Reveal>
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

        <div className="grid md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className="p-6 md:pr-8 relative"
              style={{ borderTop: "1px solid var(--border)", borderLeft: i > 0 ? "1px solid var(--border)" : undefined }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ border: `1.5px solid ${p.color}`, background: `color-mix(in srgb, ${p.color} 8%, transparent)` }}
                >
                  <p.Icon color={p.color} />
                </span>
                <span className="data text-xs" style={{ color: "var(--muted)" }}>{p.n}</span>
              </div>
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <div className="text-xs mb-3 font-medium" style={{ color: p.color }}>
                {p.tag}
              </div>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
