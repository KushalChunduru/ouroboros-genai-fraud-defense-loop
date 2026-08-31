<div align="center">

# Ouroboros

### The attack and the defense, trained in the same loop.

[![Mastercard Innovation Challenge](https://img.shields.io/badge/Mastercard%20Innovation%20Challenge-GFF%202026-black?style=flat-square)](https://github.com/KushalChunduru/ouroboros-genai-fraud-defense-loop)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Synthetic data only](https://img.shields.io/badge/data-100%25%20synthetic-16a34a?style=flat-square)](#data--privacy)

**[Evaluation criteria](#how-this-maps-to-the-evaluation-criteria)** · **[Architecture](#the-loop)** · **[Quick start](#getting-started)** · **[API](#api-surface)** · **[References](#grounding--references)**

</div>

<br>

> An ouroboros is a serpent eating its own tail — an ancient symbol for something that sustains itself in a closed cycle. This system is that mechanism made literal: **the defender's own blind spots become the attacker's next move, on purpose, every round.**

Most fraud-simulation projects generate a dataset once, train a classifier once, and report a score once — a straight line from A to B. Ouroboros is a closed loop instead. It **identifies** emerging GenAI attack vectors grounded in named 2026 threat reporting, **generates** high-fidelity behavioral simulations of them, and **defends** with a fused detector — then feeds the detector's own performance back into a self-play arms race and a zero-day discovery agent, so the system's output becomes its next input.

Five connected console pages, one shared run, real backend calls throughout — no mocked data anywhere in the demo path:

`/console` → `/console/generate` → `/console/self-play` → `/console/zero-day` → `/console/summary`

See [`docs/DESIGN.md`](docs/DESIGN.md) for the UI/UX research and decision log, and [`docs/Ouroboros_Solution_Walkthrough.docx`](docs/Ouroboros_Solution_Walkthrough.docx) for the full written walkthrough.

---

## How this maps to the evaluation criteria

### Diversity of attacks identified

15 vectors, tagged across **4 independent axes** — channel (IVR, agentic checkout, ATM, P2P wallet, e-commerce CNP...), rail, social-engineering surface (voice, video, chat, SMS, none), and technique family (deepfake impersonation, prompt-injection agent hijack, GenAI-scaled carding, synthetic identity, mule orchestration...) — so coverage is a provable cross-product, not a flat anecdotal list. Every vector carries a `severity_base` weight and a named, hyperlinked 2026 source (Visa PERC, Experian, TransUnion, FS-ISAC, HUMAN Security, Signifyd/Darwinium, Security Boulevard, or a peer-reviewed arXiv paper). The taxonomy also isn't static: the zero-day discovery agent (below) is designed to append new candidate vectors to it automatically.
→ [`backend/app/taxonomy.json`](backend/app/taxonomy.json) · [Identify page](#60-second-tour)

### Fidelity of attacks in simulation

The simulator gives every entity **persistent state** (devices, IP, spend profile, session history) and conditions each new transaction on that entity's running history, instead of sampling rows independently like CTGAN/TVAE/GaussianCopula. That claim isn't just cited — it's benchmarked live by the **Fidelity Lab**, which builds a naive-shuffle baseline from your exact batch (independently shuffling `entity_id`, `device_id`, `ip_subnet`, and `timestamp` — mathematically identical to what a row-independent generator produces) and compares three real statistics between the two:

- **Fano factor** (variance/mean of transaction counts per device per 10-minute window) — near 1 means memoryless/Poisson activity; well above 1 means coordinated bursts through shared infrastructure, which naive shuffling destroys.
- **Single-owner-device fraction** — how much of the device graph resolves to one dominant entity, a fraud-ring signature naive shuffling erases.
- **Velocity-rule exceed rate** — how often an entity crosses a same-day transaction-count threshold, the exact signal real velocity rules key on.

→ [`backend/app/generate/fidelity.py`](backend/app/generate/fidelity.py) · [Why entity-conditioning isn't a nice-to-have](#why-entity-conditioning-isnt-a-nice-to-have)

### Detection algorithms and their efficacy

A **fused** detector, weighted `0.55` tabular + `0.30` graph + `0.15` content — not a single model:

- **Tabular**: `HistGradientBoostingClassifier` (`max_depth=6`, `max_iter=150`, `learning_rate=0.08`) over engineered features (`log_amount`, `velocity_1h`, `device_fanout_raw`, `session_novelty`, `tool_call_burst`, `hour_of_day`).
- **Graph**: risk seeded per entity/device/IP/merchant node, propagated 3 iterations across the shared-infrastructure graph with damping `0.6` — an entity looks risky if it's connected to known-risky infrastructure, even if its own transaction looks ordinary.
- **Content**: a language-signal score over generated narrative text (phishing scripts, deepfake transcripts, injection payloads).

Every run reports real precision/recall/F1/PR-AUC/false-positive-rate on a held-out split, broken down per vector — plus **cost-based threshold tuning** (fraud-ops sets the decision cutoff to minimize `missed-fraud cost + false-decline cost`, not a fixed 0.5) computed live from scores already returned, and grounded, attribution-based explanations per flagged transaction.
→ [`backend/app/defend/`](backend/app/defend/) · [Generate & Detect page](#60-second-tour)

### Novelty of the solution

Two closed feedback loops, both implemented and measured live rather than asserted in a slide:

- **Self-play arms race** — each round, the attacker escalates evasion by a fixed step (`+0.18`, capped at `1.0`) specifically on the vectors the *previous* round's detector caught best, then a **fresh detector is retrained** on a new held-out split and re-evaluated. The round-over-round recall curve is the demoable evidence that detection holds (or doesn't) under an adaptive adversary.
- **Zero-day discovery** — mines exactly the transactions the current detector scores below the decision threshold (its blind spot), runs `IsolationForest` to surface the most anomalous of those, clusters them (a from-scratch NumPy k-means, up to 3 clusters), and asks an LLM to draft a natural-language attack hypothesis per cluster from real cluster statistics (size, mean amount, dominant channel/category, device fan-out, session novelty) — ready to feed back into the taxonomy.

The system's own output becomes its next input, twice. See [The loop](#the-loop) and [`backend/app/loop/`](backend/app/loop/).

### Real-world feasibility in live payments

- **Measured, not estimated, latency**: single-transaction scoring reports server-side latency via `time.perf_counter()` around the real inference call — typically 10–30ms, against a sub-100ms industry target for an inline authorization-path check.
- **A feature pipeline built to point at real logs unmodified**: the tabular+graph+content fusion mirrors the shape of production fraud platforms (sequence/transformer signal plus relationship-graph signal, not a plain row classifier) — see [`app/defend/features.py`](backend/app/defend/features.py) and [`app/defend/graph_model.py`](backend/app/defend/graph_model.py).
- **Cost-aware decisioning**, matching how 2026 fraud-ops teams actually set thresholds, not textbook accuracy-maximizing.
- **Attack vectors aimed at where the surface is actually moving**: `agentic_checkout_hijack` and `agent_credential_exfil` model AI-shopping-agent hijacking and credential exfiltration via tool poisoning — the agentic-commerce fraud surface card networks and AI labs are jointly exposing via agent-commerce protocols in 2026, with almost no public detection tooling yet.
- **A pre-production stress-testing story, not just a detector**: a bank could run *N* self-play rounds against a candidate detector before shipping it, and route zero-day hypotheses into an analyst review queue instead of auto-updating the taxonomy unsupervised.

→ [Real-world feasibility](#real-world-feasibility)

---

## The loop

```mermaid
flowchart LR
    subgraph P1["① Identify"]
        TAX["Living taxonomy<br/>15 grounded vectors"]
    end

    subgraph P2["② Generate"]
        SIM["Entity-conditioned<br/>behavioral simulator"]
        NAR["Gemini narrative agent<br/>(templated fallback offline)"]
    end

    subgraph P3["③ Defend"]
        GBM["Gradient-boosted<br/>tabular signal"]
        GRAPH["Graph-propagation<br/>risk signal"]
        CONTENT["Content-language<br/>signal"]
        FUSE["Fused detector"]
    end

    TAX -->|attack vectors| SIM
    SIM --> NAR
    SIM -->|synthetic batch| GBM
    SIM --> GRAPH
    NAR --> CONTENT
    GBM --> FUSE
    GRAPH --> FUSE
    CONTENT --> FUSE

    FUSE -->|escalate evasion on what got caught| SELFPLAY["④ Self-play arms race<br/>N rounds, fresh detector each round"]
    SELFPLAY -->|round-over-round recall| FUSE

    FUSE -->|mine the low-risk blind spot| ZERODAY["⑤ Zero-day discovery<br/>unsupervised clustering + LLM hypothesis"]
    ZERODAY -->|new candidate vector| TAX

    style TAX fill:#5b3df0,color:#fff,stroke:none
    style SIM fill:#16a34a,color:#fff,stroke:none
    style NAR fill:#16a34a,color:#fff,stroke:none
    style GBM fill:#0090ff,color:#fff,stroke:none
    style GRAPH fill:#0090ff,color:#fff,stroke:none
    style CONTENT fill:#0090ff,color:#fff,stroke:none
    style FUSE fill:#0090ff,color:#fff,stroke:none
    style SELFPLAY fill:#16a34a,color:#fff,stroke:none
    style ZERODAY fill:#b3690a,color:#fff,stroke:none
```

The two feedback edges — self-play back into the detector, zero-day discovery back into the taxonomy — are the whole thesis. Everything else in this repo exists to make those two arrows real and measurable instead of a slide.

### One self-play round, end to end

```mermaid
sequenceDiagram
    participant A as Attacker (simulator)
    participant D as Fused detector
    participant S as Scoreboard

    A->>D: Generate batch at evasion level N
    D->>D: Train fresh on held-out split
    D->>S: Score batch, report recall
    S->>A: "Here's what you missed"
    A->>A: Escalate evasion, targeting what got caught
    Note over A,S: Repeat for N rounds — recall curve is the live evidence
```

## 60-second tour

| Step | Page | What actually happens |
|---|---|---|
| 1 | **Identify** — `/console` | Pick from 15 hyperlinked, sourced attack vectors, or select all |
| 2 | **Generate & Detect** — `/console/generate` | Simulate an entity-conditioned batch, prove fidelity vs. a naive-shuffle baseline, then train + evaluate the fused detector |
| 3 | **Self-Play** — `/console/self-play` | Watch the attacker escalate evasion round over round against a freshly retrained detector |
| 4 | **Zero-Day** — `/console/zero-day` | Mine the detector's blind spot, get LLM-drafted attack hypotheses back |
| 5 | **Summary** — `/console/summary` | One synthesized report on this exact run, with a shareable permalink |

## Why entity-conditioning isn't a nice-to-have

Row-independent generators are the industry default — and they quietly destroy the exact signal fraud detection depends on. A 2026 benchmark ([arXiv:2604.13125](https://arxiv.org/abs/2604.13125)) measured it directly:

| | Row-independent generators (CTGAN, TVAE, GaussianCopula, TabularARGN) | Ouroboros's entity-conditioned simulator |
|---|---|---|
| Entity state | None — every row sampled independently | Persistent per entity (devices, IP, spend, session history) |
| Burst timing | Not preserved | Conditioned on the entity's running history |
| Device/IP fan-out | Not preserved | Modeled as real graph motifs |
| Behavioral fidelity vs. real data | **17–100× worse** (measured) | Benchmarked live, per batch, against a naive-shuffle baseline you can inspect |

That last row isn't a citation borrowed from the paper — it's the **Fidelity Lab**, a self-validating check built into the console that runs the same comparison on whatever batch you just generated, live.

## Feasibility, made concrete not asserted

- **Cost-based threshold tuning** — 2026 fraud-ops practice sets the decision threshold to minimize total business cost (missed-fraud cost + false-decline cost), not a fixed 0.5 cutoff. Enter your own cost assumptions in the console and the cost-minimizing threshold is computed live from scores already returned by `/api/detect` — no re-scoring required.
- **Real single-transaction scoring with measured latency** — batch scoring proves accuracy; live scoring proves the fused detector is fast enough to sit inline in a real authorization path. The industry target is sub-100ms; sample transactions typically score in 10–30ms end-to-end, measured server-side with `time.perf_counter()`, not estimated.
- **One connected run across five pages, not five disconnected demos** — each stage page reads from the same run (persisted across page loads and refreshes) and ends with an explicit link to what comes next.
- **Every research claim is a real, verified hyperlink** — the taxonomy's 15 source citations and the four headline threat statistics link directly to the actual report or paper, not just a name in italics.

## Architecture

<details>
<summary><strong>Expand full directory layout</strong></summary>

```
backend/                  FastAPI + scikit-learn + networkx + Gemini (optional)
  app/taxonomy.json         Pillar 1: the living, hyperlinked attack taxonomy
  app/generate/
    behavioral_simulator.py   Pillar 2: entity-conditioned transaction simulator
    narrative_agent.py        Gemini-backed narrative generation, templated fallback
    fidelity.py                Self-validating fidelity benchmark vs. naive-shuffle baseline
  app/defend/
    features.py                Tabular feature engineering
    graph_model.py              Device/IP/merchant graph risk propagation
    detector.py                 Fused GBM + graph + content detector
    explain.py                   Grounded, attribution-based explanations
  app/loop/
    self_play.py                Self-play arms race (N rounds, escalating evasion)
    zero_day.py                  Unsupervised blind-spot clustering + LLM hypothesis agent
  main.py                    REST API (see API surface below)

frontend/                 Next.js 16 (App Router) + TypeScript + Tailwind v4
  src/app/console/           Five routed stage pages sharing one run via React context
  src/components/            TaxonomyExplorer, GenerateDetectConsole, SelfPlayDashboard,
                              ZeroDayPanel, RunSummary, FidelityLab, ThresholdTuner, LiveScoring
```

</details>

## Tech stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS custom properties (no component library) |
| Charts | Recharts |
| Motion | motion/react (purposeful, reduced-motion aware) |
| Backend framework | FastAPI, Pydantic |
| ML | scikit-learn (HistGradientBoostingClassifier, IsolationForest) |
| Graph | NetworkX |
| Synthetic data | Faker + a custom entity-conditioned simulator |
| GenAI | Google Gemini (`google-generativeai`), optional — deterministic template fallback when no key is set |

## API surface

<details>
<summary><strong>Expand endpoint table</strong></summary>

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Backend status, vector count, Gemini enabled flag |
| `GET` | `/api/taxonomy` | The 15 grounded attack vectors |
| `POST` | `/api/generate` | Simulate a batch (entity-conditioned) |
| `GET` | `/api/fidelity/{batch_id}` | Fidelity Lab: batch vs. naive-shuffle baseline |
| `POST` | `/api/detect` | Train + evaluate the fused detector on a batch |
| `GET` | `/api/report/{batch_id}` | Standalone permalink report for a batch |
| `POST` | `/api/selfplay` | Run the self-play arms race |
| `POST` | `/api/zeroday` | Run zero-day blind-spot discovery |
| `GET` | `/api/sample_transaction` | Sample one legit or attack transaction |
| `POST` | `/api/score_live` | Score one transaction with measured latency |
| `POST` | `/api/narrative_preview` | Preview a generated narrative for one vector |

</details>

## Getting started

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Optional: create a `.env` file at the repo root with `GEMINI_API_KEY=...` (and optionally `GEMINI_MODEL=...`) to enable live Gemini-generated narratives, explanations, and zero-day hypotheses. Without a key, every LLM call transparently falls back to deterministic templates, so the whole system is demoable offline.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>. The frontend expects the backend at `http://localhost:8000` (override with `NEXT_PUBLIC_API_BASE`).

### Regenerating the solution walkthrough

`docs/Ouroboros_Solution_Walkthrough.docx` is generated from `docs/generate_docx/build.js` (docx-js):

```bash
cd docs/generate_docx
npm install
npm run build
```

## Grounding & references

Every taxonomy vector and every headline statistic in the app links to its real, verified source — no fabricated citations. A sample of what's grounding the core claims:

- [arXiv:2604.13125](https://arxiv.org/abs/2604.13125) — *Synthetic Tabular Generators Fail to Preserve Behavioral Fraud Patterns* — the paper behind the entity-conditioning claim, benchmarked live in the Fidelity Lab.
- [Visa PERC — Agentic Commerce Threats](https://corporate.visa.com/en/sites/visa-perspectives/security-trust/the-threats-landscape-of-agentic-commerce.html) — 450%+ increase in dark-web "AI Agent" mentions, H1 2026.
- [BIIA — Synthetic Identity Fraud Statistics 2026](https://www.biia.com/synthetic-identity-fraud-statistics-2026-hard-numbers-big-threats/) — $30–35B annual US synthetic identity fraud.
- [HUMAN Security — AI Agents Carding Attack Breakdown](https://www.humansecurity.com/learn/blog/ai-agents-carding-attack-breakdown/) — documented autonomous AI-agent carding.
- [FS-ISAC — AI-Generated Fraud Report](https://fsscc.org/wp-content/uploads/2026/03/FSSCC-AI-Generated-Fraud.pdf) — Fraud-as-a-Service GenAI phishing kits.

Full list with every vector's source: [`backend/app/taxonomy.json`](backend/app/taxonomy.json).

## Data & privacy

Every transaction, entity, device, and narrative is synthetic and generated at runtime — no real cardholder data, PII, or production traffic is used anywhere in this repository.

## Real-world feasibility

- The fused detector's tabular+graph shape mirrors the transformer+relationship-graph pattern used in modern production fraud platforms, so the same feature pipeline built here (`app/defend/features.py`, `app/defend/graph_model.py`) is designed to be pointed at real production transaction logs without modification.
- The `agentic_checkout_hijack` / `agent_credential_exfil` vectors and their trajectory-style features (`session_novelty`, `tool_call_burst`) target the agentic-commerce fraud surface that card networks and AI labs are jointly exposing via agent-commerce protocols in 2026 — an attack surface with almost no public tooling yet.
- The self-play loop and zero-day agent are designed as a pre-production stress-testing sandbox: a bank could run *N* self-play rounds against a candidate detector before shipping it, and route the zero-day agent's hypotheses into an analyst review queue rather than auto-updating the taxonomy unsupervised.

---

<div align="center">

*The tail feeds the head. The loop closes. Built for the **Mastercard Innovation Challenge @ GFF 2026**.*

</div>
