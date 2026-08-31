import Reveal from "@/components/Reveal";

const STATS = [
  {
    value: "450%+",
    label: "dark-web “AI Agent” mentions",
    sub: "Visa PERC, H1 2026",
    href: "https://corporate.visa.com/en/sites/visa-perspectives/security-trust/the-threats-landscape-of-agentic-commerce.html",
  },
  {
    value: "1,265%",
    label: "YoY GenAI phishing emails",
    sub: "SentinelOne, 2026 phishing threat reporting",
    href: "https://www.sentinelone.com/cybersecurity-101/cybersecurity/cyber-security-statistics/",
  },
  {
    value: "$30–35B",
    label: "annual US synthetic identity fraud",
    sub: "Experian / TransUnion, 2026",
    href: "https://www.biia.com/synthetic-identity-fraud-statistics-2026-hard-numbers-big-threats/",
  },
  {
    value: "24–39×",
    label: "worse behavioral fidelity, naive GAN data",
    sub: "arXiv:2604.13125, 2026",
    href: "https://arxiv.org/abs/2604.13125",
  },
];

const PROBLEM_TAGS = ["#GenAI-Fraud", "#Behavioral-Fidelity", "#Adaptive-Adversary"];
const SOLUTION_TAGS = ["#Entity-Conditioned", "#Fused-Detection", "#Self-Play"];

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

        {/* White cards with a small tinted icon badge -- the reference's exact
            problem/solution treatment, not a full-color panel. */}
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-0 items-stretch">
          <div className="card p-7 md:p-9 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-xl font-semibold">Problem</h3>
              <span
                className="icon-bubble h-8 w-8 shrink-0"
                style={{ background: "color-mix(in srgb, var(--danger) 14%, white)" }}
              >
                <IconWarning color="var(--danger)" />
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Deepfake voices pass IVR authentication. Autonomous shopping agents run carding attacks at machine
              speed. Synthetic identities build six months of credit history before bust-out — and the synthetic
              data used to train defenses doesn&apos;t even preserve the signal detection depends on.
            </p>
            <div className="flex flex-wrap gap-2 mt-auto pt-6">
              {PROBLEM_TAGS.map((t) => (
                <span key={t} className="pill">{t}</span>
              ))}
            </div>
          </div>

          <FlowConnector />

          <div className="card p-7 md:p-9 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-xl font-semibold">Solution</h3>
              <span
                className="icon-bubble h-8 w-8 shrink-0"
                style={{ background: "color-mix(in srgb, var(--accent) 14%, white)" }}
              >
                <IconCheck color="var(--accent)" />
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Ouroboros unifies a grounded attack taxonomy, entity-conditioned simulation, and a fused detector
              into one closed loop — a self-play arms race and a zero-day discovery agent keep it honest round
              over round, live in the console below.
            </p>
            <div className="flex flex-wrap gap-2 mt-auto pt-6">
              {SOLUTION_TAGS.map((t) => (
                <span key={t} className="pill">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px mt-4" style={{ background: "var(--border)" }}>
          {STATS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 flex flex-col gap-2 card-hover"
              style={{ background: "var(--background)" }}
            >
              <span className="data text-2xl md:text-3xl font-semibold">{s.value}</span>
              <span className="text-sm" style={{ color: "var(--foreground)" }}>{s.label}</span>
              <span className="text-xs mt-auto underline underline-offset-2" style={{ color: "var(--muted)" }}>
                {s.sub} ↗
              </span>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function FlowConnector() {
  return (
    <div className="hidden md:flex items-center justify-center px-3">
      <span
        className="icon-bubble h-9 w-9 shrink-0"
        style={{ background: "var(--surface)", border: "1px solid var(--border-strong)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: "var(--muted)" }}>
          <path d="M4 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

function IconWarning({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

function IconCheck({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="m7.5 12.5 3 3 6-6" />
    </svg>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}
