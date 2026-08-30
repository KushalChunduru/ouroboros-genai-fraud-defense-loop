const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, LevelFormat, convertInchesToTwip,
} = require("docx");

const PAGE = { width: 12240, height: 15840 }; // US Letter
const ACCENT = "5B3DF5";
const MUTED = "6B7280";

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 160 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } });
}
function p(text, opts = {}) {
  return new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 140 } });
}
function bullet(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, ...opts })],
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
  });
}
function hr() {
  return new Paragraph({
    text: "",
    border: { bottom: { color: "CCCCCC", space: 1, style: BorderStyle.SINGLE, size: 6 } },
    spacing: { after: 200 },
  });
}

function cell(text, { header = false, width = 2000, shade = null } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: shade ? { type: ShadingType.CLEAR, color: "auto", fill: shade } : undefined,
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: header, size: header ? 19 : 18, color: header ? "FFFFFF" : "1F2937" })],
      }),
    ],
  });
}

function taxonomyTable() {
  const rows = [
    ["Vector", "Channel", "Technique", "Grounding source"],
    ["Real-time deepfake voice IVR authorization", "IVR / call center", "Deepfake impersonation", "Adaptive Security / didit.me 2026"],
    ["Deepfake video executive wire authorization", "P2P wallet / ACH", "Deepfake impersonation", "2024 $25M HK deepfake CFO case"],
    ["AI shopping-agent hijack via prompt injection", "Agentic checkout", "Prompt injection / agent hijack", "Signifyd / Darwinium 2026"],
    ["Autonomous AI-agent carding bursts", "Agentic checkout", "GenAI-scaled carding", "HUMAN Security, 2026"],
    ["LLM-orchestrated low-and-slow carding", "E-commerce CNP", "GenAI-scaled carding", "Visa PERC dark-web reporting, 2026"],
    ["Synthetic 'Frankenstein' identity origination", "E-commerce CNP", "Synthetic identity", "Experian / TransUnion 2026 ($30-35B/yr)"],
    ["Autonomous romance / pig-butchering bot", "P2P wallet / crypto", "GenAI social engineering", "Experian 2026 fraud forecast"],
    ["Fraud-as-a-Service phishing/smishing kit", "E-commerce CNP", "GenAI social engineering", "FS-ISAC 2026 AI-Generated Fraud report"],
    ["AI-generated fraudulent dispute narratives", "E-commerce CNP", "AI dispute abuse", "Extrapolated, FS-ISAC FaaS reporting"],
    ["LLM-optimized mule-network routing", "P2P / real-time payments", "Mule orchestration", "GNN/AML literature, Thoughtworks/NVIDIA"],
    ["Voice-biometric enrollment spoofing", "IVR / call center", "Deepfake impersonation", "2026 voice-clone generalization study"],
    ["GAN-synthesized card/BIN validation attacks", "E-commerce CNP", "GenAI-scaled carding", "arXiv:2402.09830, FinDiff"],
    ["Agentic credential/token exfiltration", "Agentic checkout", "Prompt injection / agent hijack", "arXiv:2605.01143"],
    ["Deepfake ATM/branch liveness bypass", "ATM / branch", "Deepfake impersonation", "Security Boulevard 2026"],
    ["GenAI-assisted SIM-swap wallet takeover", "P2P wallet", "GenAI social engineering", "2026 identity-threat reporting"],
  ];
  const widths = [3600, 1900, 2200, 2700];
  return new Table({
    width: { size: 10400, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, i) =>
      new TableRow({
        children: r.map((t, j) => cell(t, { header: i === 0, width: widths[j], shade: i === 0 ? ACCENT : (i % 2 === 0 ? "F3F4F6" : null) })),
      })
    ),
  });
}

function metricsTable() {
  const rows = [
    ["Metric", "Overall (held-out test split)"],
    ["Precision", "97.6%"],
    ["Recall", "96.7%"],
    ["F1", "97.1%"],
    ["PR-AUC", "99.8%"],
    ["False positive rate (legit traffic)", "3.6%"],
  ];
  const widths = [5200, 5200];
  return new Table({
    width: { size: 10400, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, i) =>
      new TableRow({ children: r.map((t, j) => cell(t, { header: i === 0, width: widths[j], shade: i === 0 ? ACCENT : (i % 2 === 0 ? "F3F4F6" : null) })) })
    ),
  });
}

function fidelityTable() {
  const rows = [
    ["Signal (arXiv:2604.13125)", "Entity-conditioned (ours)", "Naive row-independent baseline", "Ratio"],
    ["Burst clustering (Fano factor, transactions/shared-device/10-min)", "5.2 – 6.3", "0.09 – 0.16", "~35–64×"],
    ["Single-owner device fraction", "81% – 84%", "50% – 54%", "~1.6×"],
    ["Velocity-rule trigger rate (>4 txn/hr/device)", "1.5% – 2.8%", "1.0% – 1.6%", "~1.4–2.4×"],
  ];
  const widths = [4200, 2100, 2600, 1500];
  return new Table({
    width: { size: 10400, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, i) =>
      new TableRow({ children: r.map((t, j) => cell(t, { header: i === 0, width: widths[j], shade: i === 0 ? ACCENT : (i % 2 === 0 ? "F3F4F6" : null) })) })
    ),
  });
}

function feasibilityTable() {
  const rows = [
    ["Claim", "Evidence, not assertion"],
    ["Fits a live authorization path", "Single-transaction scoring endpoint measured at 12–65ms server-side (time.perf_counter around actual model inference), inside the 50–100ms industry target"],
    ["Threshold reflects business cost, not a fixed cutoff", "Interactive tuner recomputes precision/recall/F1/FPR/estimated-cost live from held-out scores as cost assumptions change; on one real run, moving to the cost-optimal threshold cut estimated cost from $6,000 to $1,560"],
    ["Results are shareable, not locked in a session", "Every scored batch gets a standalone permalink (/console/report/{batch_id}) a reviewer can open independently, without re-running the pipeline"],
  ];
  const widths = [3800, 6600];
  return new Table({
    width: { size: 10400, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, i) =>
      new TableRow({ children: r.map((t, j) => cell(t, { header: i === 0, width: widths[j], shade: i === 0 ? ACCENT : (i % 2 === 0 ? "F3F4F6" : null) })) })
    ),
  });
}

function pipelineTable() {
  const rows = [
    ["Layer", "Component", "Role"],
    ["Generate — A", "Gemini narrative agent", "Writes the qualitative artifact per vector (phishing script, dossier, injection payload), grounded in the taxonomy description"],
    ["Generate — B", "Entity-conditioned behavioral simulator", "Persistent per-entity state (devices, IP, spend profile, session history); transactions sampled conditioned on that history, not i.i.d."],
    ["Defend — 1", "Gradient-boosted tabular model", "Learns amount/velocity/timing/session behavioral signal"],
    ["Defend — 2", "Graph propagation model", "GNN-inspired belief propagation over a device/IP/merchant/entity graph; catches shared-infrastructure fraud rings"],
    ["Defend — 3", "Content-language model", "Lexicon heuristic (production slot for a fine-tuned classifier) scoring urgency / social-engineering language"],
    ["Loop — 1", "Self-play arms race", "N rounds of adaptive-evasion attacker vs. freshly retrained defender; tracks round-over-round recall"],
    ["Loop — 2", "Zero-day discovery agent", "Isolation Forest + clustering restricted to the defender's blind spot; LLM drafts new attack hypotheses"],
  ];
  const widths = [1700, 3200, 5500];
  return new Table({
    width: { size: 10400, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, i) =>
      new TableRow({ children: r.map((t, j) => cell(t, { header: i === 0, width: widths[j], shade: i === 0 ? ACCENT : (i % 2 === 0 ? "F3F4F6" : null) })) })
    ),
  });
}

const doc = new Document({
  numbering: {
    config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 260 } } } }] }],
  },
  sections: [
    {
      properties: { page: { size: PAGE, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      children: [
        new Paragraph({ text: "Ouroboros", heading: HeadingLevel.TITLE, spacing: { after: 80 } }),
        new Paragraph({
          children: [new TextRun({ text: "A Closed-Loop AI System for GenAI-Era Payment Fraud", size: 28, color: MUTED })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Mastercard Innovation Challenge @ GFF 2026 — Solution Walkthrough", size: 22, color: MUTED, italics: true })],
          spacing: { after: 400 },
        }),

        h1("1. Executive Summary"),
        p(
          "Ouroboros is an end-to-end red-team/blue-team AI system covering all three pillars of the challenge — Identify, Generate, Defend — implemented as an actual closed loop rather than a linear pipeline. It identifies 15 grounded GenAI-era payment-fraud attack vectors across four independent axes, simulates them with an entity-conditioned behavioral generator designed to avoid a documented failure mode of naive tabular generators, defends against them with a fused tabular + graph + content detector, and runs the whole system as a self-play arms race whose blind spots are automatically converted into new attack hypotheses by a zero-day discovery agent."
        ),
        p(
          "The system is implemented as a FastAPI backend (Python, scikit-learn, networkx, Google Gemini) and a Next.js/TypeScript prototype console, and is fully demoable offline — every GenAI call degrades transparently to a deterministic template when no API key is configured."
        ),

        h1("2. Pillar 1 — Identify: A Living, Grounded Taxonomy"),
        p(
          "Rather than a short anecdotal list, the taxonomy tags every vector across four independent axes — channel, payment rail, social-engineering surface, and technique family — so coverage is provably broad. Each vector is grounded in a specific 2026 industry or academic source rather than invented from first principles. The taxonomy is implemented as living data (backend/app/taxonomy.json) that the Zero-Day Discovery agent (Section 4.2) can append to automatically."
        ),
        taxonomyTable(),
        p(""),
        p(
          "Two vectors deserve particular attention because they target Mastercard's own strategic exposure: AI shopping-agent hijacking and agentic credential exfiltration both attack the agentic-commerce protocols (Google's Universal Commerce Protocol, OpenAI's Agentic Commerce Protocol) that launched in January 2026 with Mastercard, Visa, and Stripe as partners. Visa's Payment Ecosystem Risk and Control team reported a 450%+ increase in dark-web posts mentioning 'AI Agent' in H1 2026, and HUMAN Security has already documented AI shopping agents autonomously running carding attacks — this is a live, not hypothetical, threat surface with almost no public defensive tooling yet."
        ),

        h1("3. Pillar 2 — Generate: Entity-Conditioned Simulation, Not Row-Independent GANs"),
        h2("3.1 The problem with naive tabular generators"),
        p(
          "A June 2026 benchmark (arXiv:2604.13125, 'Synthetic Tabular Generators Fail to Preserve Behavioral Fraud Patterns') showed that standard tabular generators — CTGAN, TVAE, GaussianCopula, TabularARGN — are 24x to 39x worse than real data at preserving exactly the three signals fraud detection depends on: temporal burst autocorrelation, device/IP graph fan-out motifs, and velocity-rule trigger calibration. The root cause is architectural: these generators sample each row independently, with no memory of an entity's prior transactions."
        ),
        h2("3.2 Our approach"),
        p(
          "Ouroboros's simulator (backend/app/generate/behavioral_simulator.py) instead gives every simulated entity — cardholder, mule, or AI shopping agent — persistent state: known devices, home IP subnet, merchant-category preferences, a running spend distribution, and session history. Every transaction is sampled conditioned on that entity's state, and each of the 15 attack vectors is implemented as an explicit behavioral program (a 'profile' of burst spacing, device fan-out, amount multiplier, and session-novelty behavior) that mutates entity state over time, rather than an i.i.d. draw from a marginal distribution. This reproduces burst timing and shared-device/IP fan-out — the graph motifs a real graph-based detector depends on — by construction."
        ),
        p(
          "A Gemini-backed narrative agent (backend/app/generate/narrative_agent.py) supplies the qualitative layer — phishing scripts, deepfake transcripts, synthetic-identity dossiers, prompt-injection payloads — grounded in each vector's taxonomy description via prompting, with deterministic template fallbacks so the system is fully demoable without any API key."
        ),
        h2("3.3 Adversarial evasion as a first-class parameter"),
        p(
          "Every attack profile accepts an evasion_level in [0,1]: as it rises, burst spacing widens, device fan-out shrinks, amount jitter tightens toward the legitimate distribution, and session-novelty signal weakens — modeling an attacker who adapts to a defense that keeps catching them. This parameter is what the self-play loop (Section 5) escalates round over round."
        ),
        h2("3.4 Fidelity Lab: validating the claim with computed numbers, not just a citation"),
        p(
          "Citing arXiv:2604.13125 establishes that naive generators have this failure mode; it does not by itself prove our generator avoids it. The prototype includes a Fidelity Lab that closes that gap: for any generated batch, it builds the exact naive-generator baseline the paper describes — not by training a GAN, but by independently shuffling that batch's entity_id, device_id, ip_subnet, and timestamp columns. This operation is mathematically what a row-independent generator (CTGAN, TVAE, GaussianCopula) produces: every column's marginal distribution is preserved exactly (same amounts, same categories, same counts), while all cross-column joint structure is destroyed. Comparing the real batch against this shuffled twin isolates precisely the effect entity-conditioning has, computed live and reproducibly rather than asserted."
        ),
        fidelityTable(),
        p(""),
        p(
          "One result was not the one hypothesized going in, and is reported here rather than adjusted away: an initial device-fan-out Gini metric moved in the opposite direction expected. Investigating why surfaced a more interesting finding than originally assumed — naive shuffling does not just fail to fabricate fraud rings well, it corrupts the legitimate class: a real customer's repeat visits to their own device get scattered across many fake owners, so an ordinary loyal customer starts looking exactly like a fraud ring. The single-owner-device-fraction metric above measures that effect directly and was verified directionally stable across three independent random seeds on realistic 1,000-row batches before being shipped."
        ),

        h1("4. Pillar 3 — Defend: A Fused Tabular + Graph + Content Detector"),
        p(
          "The detector fuses three independently-interpretable signals, echoing the shape of Mastercard's own Decision Intelligence Pro architecture — a transformer/relationship model over both transaction features and entity relationships, rather than a plain row-level classifier:"
        ),
        pipelineTable(),
        p(""),
        h2("4.1 Efficacy results"),
        p(
          "On a representative simulated batch (1,000 transactions: 400 legitimate, 600 across all 15 attack vectors, 65/35 train/test split, held-out evaluation):"
        ),
        metricsTable(),
        p(""),
        p(
          "Per-vector recall ranges from 73% (single-shot deepfake voice IVR fraud, which by design leaves only one transaction and therefore the weakest graph signal) to 100% (vectors with reused device/IP infrastructure, where the graph-propagation signal dominates) — an honest, non-trivial spread rather than a uniform 100%, because roughly 20% of attack instances in every vector deliberately rotate a throwaway device and legitimate traffic includes intentional hard negatives (shared household devices, one-off large purchases, occasional high-novelty sessions)."
        ),
        h2("4.2 Grounded, attribution-based explanations"),
        p(
          "Every flagged transaction receives an investigator-facing note generated from its actual signal decomposition (tabular behavior score, graph shared-infrastructure score, content-language score) rather than a free-generated, potentially hallucinated explanation — the LLM prompt is constrained to summarize the numeric contributions given, not invent new ones. This targets a real compliance requirement (auditable reasoning) that most hackathon-grade detectors skip."
        ),
        h2("4.3 Zero-day discovery: closing the loop back into Identify"),
        p(
          "An unsupervised layer (Isolation Forest, restricted to transactions the current detector already scores as low-risk — its blind spot) surfaces anomaly clusters; a Gemini reasoning agent drafts a natural-language hypothesis for each cluster, grounded strictly in that cluster's statistics (size, mean amount, dominant channel/category, mean device fan-out and session novelty). This automates the challenge brief's explicit ask that 'the gaps your defense reveals feed back into new attack ideas,' rather than leaving it as a narrative aspiration."
        ),
        h2("4.4 The decision threshold is a business-cost choice, not a fixed 0.5"),
        p(
          "Current fraud-ops practice sets the classification threshold to minimize total expected cost (missed-fraud cost + false-decline cost), not to maximize precision/recall symmetrically, and the 2026 industry benchmark bar is high recall with false-positive rate under 1%. The prototype's threshold tuner recomputes precision, recall, F1, FPR, and estimated total cost live from the scores already returned by detection — no re-scoring required — as a reviewer edits their own cost-per-missed-fraud and cost-per-false-decline assumptions, and offers a one-click 'cost-optimal threshold' that sweeps for the minimum-cost cutoff. On one real run, moving from the default 0.5 to the suggested cost-optimal threshold of 0.15 cut estimated cost from $6,000 to $1,560 while raising recall."
        ),
        h2("4.5 Real-time feasibility, proven per transaction"),
        p(
          "Batch scoring demonstrates accuracy; it does not by itself demonstrate that the detector is fast enough to sit inline in a live authorization path, where the industry target is sub-100ms. A dedicated single-transaction endpoint scores exactly one transaction through the currently trained detector and measures inference latency server-side with time.perf_counter(). Across repeated live tests, latency measured 12–65ms per transaction — comfortably inside the 50–100ms target — using the identical detector object trained in Section 4, not a separate lightweight model swapped in for the demo."
        ),

        h1("5. The Self-Play Arms Race: A Real Closed Loop"),
        p(
          "Rather than generating once and training once, Ouroboros runs an explicit N-round game: each round, the attacker escalates evasion_level specifically on the vectors the fused detector caught above a 55% recall threshold last round (an adaptive minimax dynamic, not uniform noise), a fresh detector is trained and evaluated on a held-out split of the new, harder batch, and the round's average recall becomes the 'arms race score.' This design is grounded in 2026 self-play security research (Self-RedTeam, arXiv:2506.07468; RvB, arXiv:2601.19726), which shows co-evolving attacker/defender loops produce measurably more robust systems than one-shot adversarial training."
        ),
        p(
          "In our test runs, average detector recall held between 91% and 100% across four escalating rounds even as mean evasion level rose from 0% to 54% — evidence that the fused (tabular + graph + content) signal is more resilient to adaptive evasion than any single signal alone, and a visible, round-by-round chart in the prototype rather than a claimed property."
        ),

        h1("6. One Architecture, Two Fraud Eras"),
        p(
          "Agentic-checkout attack vectors (agentic_checkout_hijack, agentic_carding_burst, agent_credential_exfil) are scored by the same fused detector as classic card-present/card-not-present fraud, using session_novelty and tool_call_burst as behavioral-sequence features standing in for an AI shopping agent's prompt/tool-call/session trajectory — directly inspired by 2026 research proposing fraud-detection-style behavioral sequence modeling for securing LLM agents (arXiv:2605.01143). This means Ouroboros defends both the fraud era Mastercard has decades of data on and the fraud era it is only now becoming exposed to via UCP/ACP, without maintaining two separate detection systems."
        ),

        h1("7. One Continuous Workflow, Not Four Disconnected Demos"),
        p(
          "An earlier iteration of the console was four independent tabs; leaving one discarded its state, so the self-play and zero-day screens each silently generated their own fresh batch instead of building on the one already scored — four demos under one navigation bar, not a closed loop. The console was restructured as a single scrolling page with five sequential stages (Identify → Generate & Detect → Self-Play → Zero-Day → Summary): a progress rail replaces the tab switcher with numbered, checkmarked anchor links that never unmount state, the selected vectors and generated batch flow down as props so each stage genuinely builds on the last, Zero-Day Discovery defaults to reusing the exact batch and detector from Generate & Detect rather than a disconnected sample, and a closing Run Summary synthesizes every stage's real output — including honestly reporting which stages have not been run yet, rather than showing fabricated zeros."
        ),
        p(
          "Every scored batch additionally gets a standalone permalink report (/console/report/{batch_id}) — a separate page that fetches that specific run's cached results by ID and renders them read-only, shareable in a message without asking the recipient to re-run anything."
        ),

        h1("8. Real-World Feasibility"),
        bullet("Privacy: every transaction, entity, device, and narrative is synthetic and generated at runtime — no real cardholder data or PII is used anywhere in the system, making it safe to run as a pre-production stress-testing sandbox."),
        bullet("Architectural fit: the feature pipeline (app/defend/features.py, app/defend/graph_model.py) is designed to be pointed at real production transaction logs unmodified — the same code path computes velocity and device fan-out whether the input is simulated or real."),
        bullet("Operational fit: a bank could run N self-play rounds against a candidate detector before shipping it, and route the zero-day agent's hypotheses into an analyst review queue rather than auto-updating the taxonomy unsupervised — keeping a human in the loop for the highest-stakes decision."),
        bullet("Strategic fit: the agentic-commerce vectors target exactly the surface Mastercard is exposing via UCP/ACP partnerships in 2026, ahead of most public defensive tooling."),
        bullet("Explainability: attribution-grounded investigator notes (Section 4.2) map directly onto a compliance/SAR workflow rather than stopping at a bare probability score."),
        p(""),
        feasibilityTable(),
        p(""),
        p(
          "Stated plainly rather than glossed over: the prototype's data store is process-local and in-memory, appropriate for a demo, not a production deployment — a real deployment would back batches, trained models, and reports with a real datastore and per-session isolation. This is called out explicitly in the codebase (backend/app/store.py) and was the subject of a concrete fix during development: detectors are now keyed by batch_id rather than a single 'last trained' pointer, so that scoring two different batches in the same process session does not silently corrupt each other's results — verified with two real batches scored back to back.",
          { italics: true, color: MUTED, size: 18 }
        ),

        h1("9. Novelty Summary"),
        p(
          "Ouroboros differentiates from a typical GAN-then-classifier submission on five points: (1) an entity-conditioned generator built specifically to avoid a documented, cited failure mode of naive tabular generators — and a Fidelity Lab that measures whether it actually does, on computed numbers, on every batch, rather than resting on the citation alone; (2) a self-play arms race that makes the closed loop measurable round-over-round rather than asserted in a slide; (3) a zero-day discovery agent that automates taxonomy growth from the defender's own blind spots, closing the loop back into Pillar 1 without human authoring; (4) a cost-based decision threshold and a measured-latency real-time scoring path, turning the feasibility claim into two concrete numbers instead of an architectural analogy; and (5) a workflow restructured around one continuous, shareable run rather than four disconnected demo screens."
        ),

        hr(),
        p("Repository, prototype, and full source referenced throughout this document are included in the accompanying submission.", { italics: true, color: MUTED, size: 18 }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const path = require("path").join(__dirname, "..", "Ouroboros_Solution_Walkthrough.docx");
  require("fs").writeFileSync(path, buf);
  console.log("written to", path);
});
