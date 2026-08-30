# Design decision log

This documents the reasoning behind the frontend's visual design, not just what changed. It exists because the first two iterations of this UI were built by directly embedding generic hero/dashboard templates — a mistake worth recording, not hiding.

## Who this is actually for

**Known:** this is a hackathon submission (Mastercard Innovation Challenge, GFF 2026) with a hard deadline, judged against a fixed rubric (diversity of attacks, fidelity, detection efficacy, novelty, feasibility).

**Reasonable inference:** the primary user is a judge — domain-literate in payments/fraud/ML, time-poor, skimming many submissions, cross-referencing this site against a `.docx` writeup and the repo. The most valuable action they can take is running Generate → Detect and seeing real numbers on real (synthetic) data; everything else on the landing page exists to get them to that moment, or to trust the numbers once they see them.

**Unknown:** whether judges click into `/console` at all versus skimming the landing page and the docx. The design assumes both happen.

This reframes the job of the UI: **transmit technical credibility fast**, not delight a consumer.

## What we got wrong, and why

An audit against a checklist of "generic AI-generated aesthetic" signals (purple/teal gradient palette, ambient blur/glow, decorative particle fields, generic line-art illustration, pill-shaped everything, glowing hover shadows) found the first two iterations matched nearly every item. The direct cause: two rounds of changes were explicit requests to embed specific external hero templates (a CollectUI atmospheric gradient hero, an orbital-atom illustration site). Faithfully embedding a generic template is, by definition, the opposite of a product-specific design — and for an audience of domain experts evaluating rigor, decoration that resembles dozens of other "AI startup" landing pages is a credibility cost, not a stylistic preference.

## Competitive reference points (reasoning extracted, not just look)

- **Stripe Radar / Sift** (fraud review consoles): lead with one risk score, disclose signal contributions only on demand, keep transaction lists dense (tables, not cards). *Why:* an analyst reviewing many transactions needs density and a sortable list, not a card grid.
- **Chainalysis Reactor / Darktrace** (graph-based investigation tools): the network graph is the primary *interactive* surface — clicking a node opens real entity data. *Why it mattered here:* our original hero canvas used the same visual language (dots + edges) but carried zero information and couldn't be interacted with. That's the exact gap between "looks like a security tool" and "is one."
- **Linear.app** (as a marketing-site reference): near-monochrome, one accent color used only for interactive elements, no gradient text, confident whitespace. *Why it fits:* restraint reads as confidence to a technical audience; over-decoration reads as compensating for a weak claim.

## Decisions

| Decision | Evidence / reasoning | Trade-off |
|---|---|---|
| Removed hero particle canvas, gradient-sky backdrop, orbital illustration, ambient glow blobs, film grain | All decorative — carried no information, matched the "generic AI aesthetic" checklist, and this audience specifically penalizes it | Landing page is visually quieter; relies on typography and real data instead |
| Replaced gradient-clip headline text with solid color + one accent word | Gradient text is a strong "AI startup template" signal; solid color with sparing accent still creates emphasis | Slightly less "flashy" on first glance |
| Renamed `--accent-2` → `--legit` and gave every color exactly one meaning (interactive / legit / attack / uncertain) | Colors were previously chosen per-component for variety, not meaning — a violation of semantic color use | Less color variety per section; sections now look more alike, which is intentional (system, not decoration) |
| Replaced full-pill buttons with `rounded-lg` solid/ghost buttons; reserved pill shape for tags and the segmented tab control only | Phase-12 "stop using card/pill for everything" — pills had become the default shape for buttons, badges, and stats alike | One less "signature" visual motif |
| Replaced individual stat/pillar cards with hairline-divided rows (CSS grid + 1px border, no card background) | Four comparable data points, or three sequential pipeline steps, are closer to a data table / editorial layout than to four unrelated products needing card isolation | Less visual "pop" than colorful cards |
| Sized the feature-grid by actual content (Generate & Detect leads full-width with its 3 real sub-capabilities; the other three tabs are equal cells below) instead of an arbitrary bento pattern | Phase-10 hierarchy must be argued, not decorative; Generate & Detect is the single most valuable user action | Less visually "dynamic" than varied random spans |
| Added a real, interactive entity-relationship graph inside Generate & Detect, built from the actual generated batch (nodes = entities, edges = shared device, color = fused risk score, click = inspect) | This is literally what the Defend pillar's graph-propagation model computes; making it real and clickable (not ambient decoration) is the one legitimate "signature" a security/graph product earns | Cost real implementation time; scoped to a lightweight synchronous force layout rather than a full physics library |
| Added empty-state copy to Generate & Detect and Self-Play before any action is taken | Phase-21: empty states are part of the product, not an afterthought — "nothing here yet" without guidance reads as broken | None |
| Added explicit `:focus-visible` outlines distinct from the active-tab fill color | Testing surfaced that the browser's default focus ring on a previously-clicked segmented button was visually indistinguishable from the "active" state | None |

## What we kept, deliberately

- Dark theme — a legitimate convention for developer/security tooling (Stripe Radar, Datadog, GitHub security tooling), not itself a "generic AI" signal.
- The four-tab console IA (Identify → Generate & Detect → Self-Play → Zero-Day) — it maps directly onto the actual pipeline; this is correct information architecture, not decoration.
- Progressive disclosure in the detect view (fused score → per-signal breakdown → grounded explanation) — mirrors how Stripe Radar / Sift present risk, and was already correct before this pass.
- The closed-loop SVG diagram — a real information diagram explaining an actual mechanism, not decorative art, so it survived the "stop using cards/decoration everywhere" audit.

## Known trade-offs / not done

- The entity graph caps at ~70 nodes and uses a synchronous force layout (not a real physics library) for time reasons; it is accurate but not as smooth as a production graph library would be at larger scale.
- No dedicated mobile-specific redesign pass beyond existing responsive breakpoints — acceptable given judges are assumed to review on a laptop, but a real product would need one.
- Accessibility was addressed opportunistically (focus states, semantic color, contrast) rather than a full WCAG 2.2 AA audit, given the deadline.
