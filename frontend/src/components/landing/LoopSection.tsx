import { Eyebrow } from "./ProblemSection";

export default function LoopSection() {
  return (
    <section id="loop" className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-2xl mb-10">
        <Eyebrow>What makes it a loop</Eyebrow>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2">
          Not generate-once, train-once, report-once
        </h2>
        <p className="mt-3 text-sm md:text-base" style={{ color: "var(--muted)" }}>
          Two mechanisms turn the pipeline above into an actual closed loop — measurable round over round, not
          asserted in a slide.
        </p>
      </div>

      <div className="card p-4 md:p-8 mb-8 overflow-x-auto scrollbar-thin">
        <LoopDiagram />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card-2 p-6">
          <div className="text-xs font-medium mb-2" style={{ color: "var(--accent-2)" }}>
            LOOP 1 — SELF-PLAY ARMS RACE
          </div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Each round, the attacker escalates evasion specifically on the vectors the fused detector caught best
            last round — an adaptive minimax dynamic — and a fresh detector is trained and evaluated on a held-out
            split. The round-over-round recall curve is live in the console, not a claimed property.
          </p>
        </div>
        <div className="card-2 p-6">
          <div className="text-xs font-medium mb-2" style={{ color: "var(--warn)" }}>
            LOOP 2 — ZERO-DAY DISCOVERY
          </div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            An unsupervised agent mines exactly the transactions the current detector already scores as low-risk —
            its blind spot — clusters the anomalies, and asks an LLM to draft a new attack hypothesis per cluster,
            feeding candidates straight back into the taxonomy.
          </p>
        </div>
      </div>
    </section>
  );
}

function LoopDiagram() {
  const nodeColors = { identify: "var(--accent)", generate: "var(--accent-2)", defend: "var(--warn)" };
  return (
    <svg viewBox="0 0 900 340" className="w-full min-w-[640px]" style={{ color: "var(--muted)" }}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
        </marker>
      </defs>

      {/* main pipeline */}
      <Node x={70} y={60} w={190} h={70} label="Identify" sub="living taxonomy" color={nodeColors.identify} />
      <Node x={355} y={60} w={190} h={70} label="Generate" sub="entity-conditioned sim" color={nodeColors.generate} />
      <Node x={640} y={60} w={190} h={70} label="Defend" sub="fused detector" color={nodeColors.defend} />

      <path d="M260,95 H355" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow)" fill="none" opacity="0.6" />
      <path d="M545,95 H640" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow)" fill="none" opacity="0.6" />

      {/* feedback: defend -> generate (self-play) */}
      <path
        d="M690,130 C 690,230 500,230 450,130"
        stroke="var(--accent-2)"
        strokeWidth="2"
        markerEnd="url(#arrow)"
        fill="none"
        strokeDasharray="5 4"
      />
      <text x="565" y="255" textAnchor="middle" fontSize="13" fill="var(--accent-2)" fontWeight="600">
        Self-Play Arms Race
      </text>
      <text x="565" y="273" textAnchor="middle" fontSize="11" fill="var(--muted)">
        escalates evasion on what got caught
      </text>

      {/* feedback: defend -> identify (zero-day) */}
      <path
        d="M735,130 C 900,300 250,320 165,130"
        stroke="var(--warn)"
        strokeWidth="2"
        markerEnd="url(#arrow)"
        fill="none"
        strokeDasharray="5 4"
      />
      <text x="450" y="330" textAnchor="middle" fontSize="13" fill="var(--warn)" fontWeight="600">
        Zero-Day Discovery — mines the blind spot, proposes new attack hypotheses back into the taxonomy
      </text>
    </svg>
  );
}

function Node({ x, y, w, h, label, sub, color }: { x: number; y: number; w: number; h: number; label: string; sub: string; color: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="var(--surface-2)" stroke={color} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 - 4} textAnchor="middle" fontSize="18" fontWeight="600" fill="var(--foreground)">
        {label}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 16} textAnchor="middle" fontSize="11" fill="var(--muted)">
        {sub}
      </text>
    </g>
  );
}
