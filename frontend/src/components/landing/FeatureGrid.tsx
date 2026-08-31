import Link from "next/link";
import Reveal from "@/components/Reveal";
import { Eyebrow } from "./ProblemSection";

// Generate & Detect is the core demo action -- it leads, full width, with
// its three real sub-capabilities shown as columns. The other three tabs
// follow as three equal cells: 3 + 3 = two clean rows, sized by actual
// content rather than an arbitrary bento pattern.
const CORE = {
  tab: "Generate & Detect",
  items: [
    {
      title: "Entity-conditioned batch simulation",
      desc: "Every entity carries persistent devices, IP, and spend history, so fraud rings show up as real graph motifs.",
    },
    {
      title: "Gemini narrative artifacts",
      desc: "Phishing scripts, deepfake transcripts, injection payloads — generated live, or from deterministic fallbacks offline.",
    },
    {
      title: "Live fused-detector scoring",
      desc: "Precision, recall, F1, PR-AUC, and FPR on a held-out split, per vector, with a real interactive entity graph.",
    },
  ],
};

const OTHERS = [
  {
    tab: "Identify",
    href: "/console",
    title: "Filterable attack taxonomy",
    desc: "15 grounded vectors by channel, rail, social-engineering surface, or technique family — each with a cited 2026 source.",
  },
  {
    tab: "Self-Play Arms Race",
    href: "/console/self-play",
    title: "Round-over-round arms race",
    desc: "N rounds of escalating attacker evasion against a freshly retrained defender, recall tracked live.",
  },
  {
    tab: "Zero-Day Discovery",
    href: "/console/zero-day",
    title: "Blind-spot hypothesis generator",
    desc: "Clusters the detector's blind spot and drafts natural-language hypotheses, ready to feed back into the taxonomy.",
  },
  {
    tab: "Summary",
    href: "/console/summary",
    title: "One report per run",
    desc: "Every stage's output synthesized into one shareable permalink — not a disconnected demo per page.",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-16 border-t" style={{ borderColor: "var(--border)" }}>
      <Reveal>
        <div className="max-w-2xl mb-10">
          <Eyebrow>In the console</Eyebrow>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2">Five pages, one connected run</h2>
          <p className="mt-3 text-sm md:text-base" style={{ color: "var(--muted)" }}>
            No mockups — this mirrors the console&apos;s actual navigation. Generate &amp; Detect carries the core
            demo action, so it leads.
          </p>
        </div>

        <div style={{ border: "1px solid var(--border)" }}>
          <Link href="/console/generate" className="block p-5 card-hover" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="eyebrow" style={{ color: "var(--accent)" }}>{CORE.tab}</span>
            <div className="grid sm:grid-cols-3 gap-4 mt-3">
              {CORE.items.map((item) => (
                <div key={item.title}>
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
            <span className="text-xs mt-3 inline-block" style={{ color: "var(--accent)" }}>Open in console →</span>
          </Link>

          <div className="grid sm:grid-cols-2 md:grid-cols-4">
            {OTHERS.map((o, i) => (
              <Link
                key={o.tab}
                href={o.href}
                className="p-5 flex flex-col gap-2 card-hover"
                style={{ borderLeft: i > 0 ? "1px solid var(--border)" : undefined }}
              >
                <span className="eyebrow" style={{ color: "var(--accent)" }}>{o.tab}</span>
                <h3 className="font-medium text-sm">{o.title}</h3>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{o.desc}</p>
                <span className="text-xs mt-auto pt-1" style={{ color: "var(--accent)" }}>Open in console →</span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
