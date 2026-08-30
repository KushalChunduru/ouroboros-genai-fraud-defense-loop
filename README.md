# Ouroboros — GenAI Payment Fraud Red/Blue Loop

**Mastercard Innovation Challenge @ GFF 2026**

A closed-loop AI system that **identifies** emerging GenAI-powered payment fraud, **generates** high-fidelity simulations of it at scale, and **defends** against it with a fused detector — then runs the whole thing as a self-play arms race so the defense's blind spots automatically become new attack hypotheses.

See [`docs/DESIGN.md`](docs/DESIGN.md) for the UI/UX research and decision log behind the frontend.

## Why this isn't a one-shot pipeline

Most fraud-simulation projects generate a dataset once, train a classifier once, and report a score once. Ouroboros instead:

1. **Identifies** ~15 GenAI fraud vectors across 4 independent axes (channel, rail, social-engineering surface, technique), each grounded in a 2026 source (Experian, Visa PERC, FS-ISAC, arXiv research — see `backend/app/taxonomy.json`).
2. **Generates** with an *entity-conditioned behavioral simulator* — not a row-independent GAN/tabular generator. A 2026 benchmark (arXiv:2604.13125) showed those generators are 24x-39x worse than real data at preserving temporal burst timing, device/IP graph fan-out, and velocity-rule calibration, because they generate each row independently. Our simulator gives every entity persistent state and conditions each transaction on that entity's running history.
3. **Defends** with a fused detector: gradient boosting (tabular behavior) + graph-propagation risk (shared device/IP/merchant infrastructure, GNN-inspired) + a content-language score, echoing the shape of Mastercard's own Decision Intelligence Pro architecture (transformer + relationship graph, not just row features).
4. **Closes the loop twice**:
   - A **self-play arms race** (`/api/selfplay`) runs N rounds where the attacker escalates evasion specifically on the vectors the defender caught best last round, and a fresh detector is trained/evaluated each round — the round-over-round recall curve is the demoable evidence of a real closed loop.
   - A **zero-day discovery agent** (`/api/zeroday`) runs unsupervised anomaly detection restricted to the defender's current blind spot, clusters the anomalies, and asks an LLM to draft a new attack hypothesis per cluster — growing the taxonomy automatically instead of leaving it a static document.

## Architecture

```
backend/            FastAPI + scikit-learn + networkx + Gemini
  app/taxonomy.json       Pillar 1: the living attack taxonomy
  app/generate/           Pillar 2: narrative agent (Gemini) + entity-conditioned simulator
  app/defend/             Pillar 3: fused GBM + graph + content detector, grounded explanations
  app/loop/               Self-play arms race + zero-day discovery agent
  main.py                 REST API

frontend/           Next.js 16 + TypeScript + Tailwind + Recharts
  src/components/         Taxonomy explorer, Generate&Detect console, Self-Play dashboard, Zero-Day panel
```

## Running it

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Optional: copy `.env.example` to `.env` at the repo root and set `GEMINI_API_KEY` to enable live Gemini-generated narratives, explanations, and zero-day hypotheses. Without a key, every LLM call transparently falls back to deterministic templates, so the whole system is demoable offline.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. The frontend expects the backend at `http://localhost:8000` (override with `NEXT_PUBLIC_API_BASE`).

## Regenerating the solution walkthrough

`docs/Ouroboros_Solution_Walkthrough.docx` is generated from `docs/generate_docx/build.js` (docx-js):

```bash
cd docs/generate_docx
npm install
npm run build
```

## Data & privacy

Every transaction, entity, device, and narrative is synthetic and generated at runtime — no real cardholder data, PII, or production traffic is used anywhere in this repository.

## Real-world feasibility

- The fused detector's tabular+graph shape mirrors Mastercard Decision Intelligence Pro's transformer+relationship-graph architecture, so the same feature pipeline built here (`app/defend/features.py`, `app/defend/graph_model.py`) is designed to be pointed at real production transaction logs without modification.
- The `agentic_checkout_hijack` / `agent_credential_exfil` vectors and their trajectory-style features (`session_novelty`, `tool_call_burst`) target the exact agentic-commerce fraud surface Mastercard, Visa, and OpenAI/Google are jointly exposing via UCP/ACP in 2026 — an attack surface with almost no public tooling yet.
- The self-play loop and zero-day agent are designed as a pre-production stress-testing sandbox: a bank could run N self-play rounds against a candidate detector before shipping it, and route the zero-day agent's hypotheses into an analyst review queue rather than auto-updating the taxonomy unsupervised.
