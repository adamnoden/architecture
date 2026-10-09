# Project Status

**Canonical project-wide status overview**  
**Last updated:** 2026-10-09  
**Current phase:** **validation / implementation falsification**

This page answers one question: **where is House Systems Architecture now?** Detailed programme histories and gate records remain in their owning areas; this page records the current state, next meaningful work and principal risks.

The architectural position and canonical pattern language are established strongly enough that the project's largest uncertainties now sit downstream. The highest-value work is to force the system through one actual house, build and test the propositions that cannot be settled on paper, obtain competent external criticism, and complete the publication without allowing project-specific choices to drift upstream into doctrine.

## Active now

### Reference House

The Reference House is the main architectural integration test. Its pattern-occurrence register and authority stack are established, but the building remains provisional. Current work should challenge the footprint and room order; resolve stair, courtyard and circulation relationships; coordinate structure and service crossings; develop the passive-first environmental strategy against real orientation and openings; and keep G-01 grammar, courtyard morphology and project tectonic choices distinguishable.

### Physical and engineering validation

This is the largest evidence gap between a coherent architectural system and a credible building system. The immediate tests are the W2 wall bay, structural floor-edge alternatives, the finish-agnostic floor platform and the Reference House wall/ceiling interface. Each should be tested against a strong conventional comparator, with general HSA evidence separated from Reference House or G-01 fit.

### Professional review

The current work needs competent external attack from structural engineering, building-control/fire practice and building-services/ventilation engineering. Negative findings are useful outcomes: they should narrow, alter or reject propositions rather than be treated as obstacles to the programme.

### Publication and delivery

The publication architecture is structurally established. Remaining work is primarily Part III/IV development, figures, evidence hardening and whole-book proof. Delivery material should continue to lag the research deliberately: only decisions mature enough to become requirements for an appointed team should enter it.

## Workstream status

The maturity scale is **L1 framed · L2 developed · L3 coordinated · L4 internally validated/frozen · L5 externally validated/release-ready**.

| Workstream | Maturity | Current state | Next meaningful gate |
|---|---:|---|---|
| **Public architectural position** | **L3** | Governing principles, selective permanence, interface design, failure architecture, maintenance geography, workmanship robustness, repose and passive-first hierarchy are coordinated and style-neutral | evidence/figure hardening and final whole-book proof |
| **Pattern language** | **L4** | 21 active patterns, three strategies and four held candidates are canonical at current internal scope | reopen only when new architectural, physical or external evidence requires change |
| **Architectural grammar** | **L3 framework; G-01 incomplete** | Grammar is a first-class layer separate from HSA doctrine; the Georgian-derived G-01 instance remains under evidence-led development | continue derivation only where evidence warrants; a materially different second grammar remains the strongest later neutrality test |
| **Reference House** | **L2–L3** | Current occurrence register and authority stack exist; whole-house geometry and technical coordination remain provisional | coordinated architectural, structural and environmental design |
| **Physical prototypes** | **L1–L2** | Programme, acceptance criteria and W2 build/test material exist; no physical validation has yet been recorded | build and test the wall bay; engineer/test the floor edge; then floor platform and tectonic joint |
| **External professional review** | **L1** | Review targets and computational review material exist; competent external review has not yet occurred | structural + fire/building-control + building-services review |
| **Computational track** | **L3 executable scope; broader paper work frozen** | P0 passed 17/17 tests and PAT-XW-01 passed 6/6; generic compiler growth is intentionally stopped | add a fixture only when another workstream exposes a concrete high-value question |
| **Evidence / precedent research** | **L3** | Major evidence packages exist and taxonomy ambiguities are largely closed | targeted claim hardening where physical or publication maturity requires it |
| **Publication** | **L3 structurally** | Publication Architecture v0.12 is established; Parts III/IV and figure language remain less mature than the main argument | finish Part III/IV development, figures and evidence presentation |
| **Delivery** | **L2** | Implementation-brief structure exists, but downstream requirements remain intentionally incomplete | populate only as architectural and validation decisions mature |

## Principal risks

**Physical quality.** Replaceable walls, floors and interfaces may work technically yet feel hollow, temporary or over-detailed. Tactile, acoustic and architectural quality must survive the serviceability agenda.

**Complexity and proportionality.** Serviceability infrastructure can consume more space, money, carbon and maintenance than the future work it avoids. Capacity for change must continue to justify its initial burden.

**Workmanship.** A detail that works only under designer supervision fails the project. Tests should include imperfect backgrounds, realistic tolerances and ordinary competent installation.

**Environmental performance.** Passive-first is a hierarchy, not a predetermined system answer. Real orientation, openings, internal gains and measured performance may require bounded mechanical assistance.

**External validation gap.** Internal coherence is not external proof. Structural, fire/building-control and building-services assumptions remain vulnerable until competent reviewers attack them.

**Authority drift.** The Reference House is the project's dominant concrete example. Repetition can make its Georgian grammar, courtyard form, masonry family or tectonic vocabulary appear inevitable even when they are project choices. Generalise the reason; keep the taste local.

## Closed or frozen tracks

These areas are not current work queues. Their detailed records remain available for provenance.

- **Original doctrine discovery — closed.** House Design Doctrine v7 is preserved as source material rather than a live specification.
- **Architectural-specificity audit — complete.** Gates 0–7 established the boundary between HSA doctrine, patterns, technical scope, grammar and Reference House choices. See the [audit](docs/development/architectural-specificity-audit.md) and [adversarial test](docs/development/architectural-specificity-adversarial-test.md).
- **Pattern-language migration — complete.** Phases 0–7 established the current canonical language. See the [Phase 7 review](docs/development/pattern-language-phase7-review.md).
- **Pattern → computational crosswalk — complete at internal mapping scope.** Phase 8 showed that pattern provenance can remain separate from technical obligation derivation. See the [Phase 8 review](docs/development/pattern-language-phase8-review.md).
- **P0 + PAT-XW-01 — passed.** The executable kernel and first crosswalk fixture are retained as regression tests. See the [gate result](docs/computational/p0-pat-xw-01-result.md).
- **Computational paper programme — frozen.** S0 → S1 → S2 → H1 answered the current paper-research question; further expansion requires evidence from another workstream.
- **Information-architecture migration — complete.** Repository ownership, publication structure, website navigation and project state now have distinct roles. See the [closeout record](docs/development/information-architecture-migration.md).

## Status-maintenance rule

Update this page when a major workstream changes maturity, prototype or professional evidence changes a conclusion, the Reference House reaches a new integration state, or the project's recommended next work materially changes.

Track-specific TODOs and historical sequencing belong in their owning control documents. This page should remain readable in a few minutes.