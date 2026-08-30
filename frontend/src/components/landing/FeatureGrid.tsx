import Link from "next/link";
import { Eyebrow } from "./ProblemSection";

const FEATURES = [
  {
    title: "Filterable attack taxonomy",
    tab: "Identify",
    desc: "Browse 15 grounded vectors by channel, rail, social-engineering surface, or technique family — each with a cited 2026 source, not an assumption.",
  },
  {
    title: "Entity-conditioned batch simulation",
    tab: "Generate & Detect",
    desc: "Generate labeled transaction batches where every entity carries persistent devices, IP, and spend history — so fraud rings show up as real graph motifs.",
  },
  {
    title: "Gemini narrative artifacts",
    tab: "Generate & Detect",
    desc: "See the qualitative side of each attack — phishing scripts, deepfake transcripts, injection payloads — generated live, or from deterministic fallbacks offline.",
  },
  {
    title: "Live fused-detector scoring",
    tab: "Generate & Detect",
    desc: "Precision, recall, F1, PR-AUC, and false-positive rate on a held-out split, broken down per attack vector, with per-transaction grounded explanations.",
  },
  {
    title: "Self-play arms-race chart",
    tab: "Self-Play Arms Race",
    desc: "Run N rounds of escalating attacker evasion against a freshly retrained defender and watch the recall curve move in real time.",
  },
  {
    title: "Zero-day hypothesis generator",
    tab: "Zero-Day Discovery",
    desc: "Cluster the detector's blind spot and get natural-language hypotheses for emerging patterns, ready to feed back into the taxonomy.",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-2xl mb-10">
        <Eyebrow>In the console</Eyebrow>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2">Every feature is a working screen</h2>
        <p className="mt-3 text-sm md:text-base" style={{ color: "var(--muted)" }}>
          No mockups — every card below links to a real, running part of the prototype.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <Link
            key={f.title}
            href="/console"
            className="card-2 p-5 flex flex-col gap-2 transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            <span
              className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full w-fit"
              style={{ background: "rgba(124,92,255,0.15)", color: "var(--accent)" }}
            >
              {f.tab}
            </span>
            <h3 className="font-medium text-sm mt-1">{f.title}</h3>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {f.desc}
            </p>
            <span className="text-xs mt-auto pt-2" style={{ color: "var(--accent-2)" }}>
              Open in console →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
