# Project Status

**Canonical project-wide status overview**  
**Last updated:** 2026-10-12  
**Current phase:** **validation / implementation falsification**

This page answers one question: **where is House Kernel now?** Detailed programme histories and gate records remain in their owning areas; this page records the current state, next meaningful work and principal risks.

The architectural position and canonical pattern language are established strongly enough that the project's largest uncertainties now sit downstream. The highest-value work is to force the system through one actual house, build and test the propositions that cannot be settled on paper, obtain competent external criticism, and complete the publication without allowing project-specific choices to drift upstream into doctrine.

## Active now

### Reference House

The Reference House has passed **RH-00 through RH-10** and is now **M3 — Coordinated at virtual-design scope**. RH-10 deliberately stepped back before certifying the accumulated design and found five material issues: missing heating/DHW topology, no forward PV provision, an RH-04/RH-08 roof-authority conflict, unresolved rear/service elevations and continued dependence on the old 350 mm wall allowance. Those were repaired inside the gate: air-to-water heat pump + DHW/hydronic topology is explicit, roughly 50 m² of PV-capable roof is reserved, the low-slope outward-draining roof formally supersedes the earlier pitched-roof preference, all outer elevations now have scoped order, and the shell survives a 450 mm masonry-envelope stress test. The active stage is **RH-11 — External-review package**. The next value comes from competent attack by structural, fire/building-control, MEP/acoustic and building-physics/energy reviewers, each against explicit rewind conditions rather than general concept commentary.

### Physical and engineering validation

This remains a major evidence gap between a coordinated architectural system and a credible building system. The immediate tests are the W2 wall bay, structural floor-edge alternatives and the Reference House wall/ceiling interface. RH-09/RH-10 make the dependency explicit: W2 and selective floor access are not required for architectural completeness; P03 remains a structural dependency and P04 must test the selected wall/ceiling movement problem rather than a decorative special detail.

### Professional review

This is now the active Reference House gate rather than a generic future intention. The coordinated house needs competent external attack from structural engineering, building-control/fire practice, MEP/acoustic engineering and building-physics/energy work. Negative findings are useful outcomes: they should force a bounded rewind, narrowing or rejection rather than be absorbed as exceptions.

### Publication and delivery

The publication architecture is structurally established. Remaining work is primarily Part III/IV development, figures, evidence hardening and whole-book proof. Delivery material should continue to lag the research deliberately: only decisions mature enough to become requirements for an appointed team should enter it.

## Maturity and workstream status

<!-- maturity-status:start -->
House Kernel uses a **project-specific maturity model**. It is not a RIBA Plan of Work stage, BIM level-of-detail convention, Technology Readiness Level or other external industry standard. The codes use **M** for maturity so they are less likely to be mistaken for those systems.

### Scale

| Level | Meaning | Gate |
|---|---|---|
| **M1** | **Framed** | The problem, scope and intended direction are explicit enough to guide further work. |
| **M2** | **Developed** | Substantive design or research material exists and the main choices and trade-offs are visible, but important coordination remains. |
| **M3** | **Coordinated** | The workstream has been reconciled with adjacent parts of the project and is internally coherent at its stated scope. |
| **M4** | **Internally validated / controlled** | The proposition has been deliberately challenged against internal tests or evidence and is stable enough to act as the controlled baseline. |
| **M5** | **Externally validated / release-ready** | Competent independent review or real-world validation has tested the proposition, material findings are resolved, and it is release-ready at its stated scope. |

The levels are cumulative. An **M3** assessment asserts that the framing and development gates are also satisfied; **M4** adds internal validation; **M5** requires external validation. A level applies only to the stated scope of that workstream.

### Governance

The canonical ratings live in `project/maturity.ts`, not in this Markdown table. TypeScript makes the evidence chain cumulative: a workstream cannot be declared M3 without framing, development and coordination evidence, and M5 cannot be declared without external-validation evidence. Repository validation checks that every registered evidence path exists and that this rendered block exactly matches the typed registry.

That enforcement prevents invalid codes, missing evidence references and duplicated status text from drifting apart. It cannot decide whether the evidence is architecturally convincing, nor can it detect a real-world change that nobody records. Promotion, demotion and reassessment therefore remain explicit architectural/editorial judgements. The per-workstream review date makes the age of those judgements visible rather than pretending they are automatically current.

### Current ratings

| Workstream | Maturity | Reviewed | Current state | Next meaningful gate |
|---|---:|---|---|---|
| **Public architectural position** | **M3** | 2026-10-12 | Governing principles, selective permanence, interface design, failure architecture, maintenance geography, workmanship robustness, repose and passive-first hierarchy are coordinated and style-neutral. | Evidence and figure hardening, followed by final whole-book proof. |
| **Pattern language** | **M4** | 2026-10-12 | 21 active patterns, three strategies and four held candidates are canonical at current internal scope. | Reopen only when new architectural, physical or external evidence requires change. |
| **Architectural grammar framework** | **M3** | 2026-10-12 | Grammar is a first-class layer separate from House Kernel doctrine and is coordinated at framework level. | Continue to test neutrality across concrete grammar instances. |
| **G-01 grammar instance** | **M2** | 2026-10-12 | The Georgian-derived instance has corpus, dimensional and coupling work, but derivation remains incomplete. | Complete evidence-led derivation and test it against the Reference House without promoting project taste into doctrine. |
| **Reference House** | **M3** | 2026-10-12 | RH-00 through RH-10 are coordinated at virtual-design scope; the whole-house audit reconciles architecture, structure, services, environment, roof/maintenance, occupied interfaces, heating/renewables and envelope, with remaining uncertainty bounded to engineering, simulation, prototype, real-site and external-review work. | RH-11 competent structural, fire/building-control, MEP/acoustic and building-physics review; resolve any material rewinds before claiming further maturity. |
| **Physical prototypes** | **M2** | 2026-10-12 | The programme, acceptance criteria and W2 build/test material exist; no physical validation has yet been recorded. | Build and test the wall bay; engineer and test the floor edge; then the floor platform and tectonic joint. |
| **External professional review** | **M1** | 2026-10-12 | Review targets and computational review material exist; competent broad external review has not yet occurred. | Structural, fire/building-control and building-services review. |
| **Computational track** | **M3** | 2026-10-12 | P0 passed 17/17 tests and PAT-XW-01 passed 6/6; generic compiler growth is intentionally stopped. | Add a fixture only when another workstream exposes a concrete high-value question. |
| **Evidence / precedent research** | **M3** | 2026-10-12 | Major evidence packages exist and taxonomy ambiguities are largely closed. | Targeted claim hardening where physical or publication maturity requires it. |
| **Publication** | **M3** | 2026-10-12 | Publication Architecture v0.12 is established; Parts III/IV and figure language remain less mature than the main argument. | Finish Part III/IV development, figures and evidence presentation. |
| **Delivery** | **M2** | 2026-10-12 | The implementation-brief structure exists, but downstream requirements remain intentionally incomplete. | Populate only as architectural and validation decisions mature. |
<!-- maturity-status:end -->

## Principal risks

**Physical quality.** Replaceable walls, floors and interfaces may work technically yet feel hollow, temporary or over-detailed. Tactile, acoustic and architectural quality must survive the serviceability agenda.

**Complexity and proportionality.** Serviceability infrastructure can consume more space, money, carbon and maintenance than the future work it avoids. RH-10 is encouraging here: later gates have repeatedly deleted or rejected disproportionate infrastructure rather than accumulating it. That discipline must continue under specialist review.

**Workmanship.** A detail that works only under designer supervision fails the project. Tests should include imperfect backgrounds, realistic tolerances and ordinary competent installation.

**Environmental performance.** Passive-first is a hierarchy, not a predetermined system answer. Actual orientation, glazing, gains, heat loss, ASHP acoustics, PV performance and dynamic overheating remain unproved until a real site and specialist models exist.

**External validation gap.** M3 is internal coordination, not external proof. Structural, fire/building-control, MEP/acoustic and building-physics assumptions are now explicit enough to attack, but remain vulnerable until that review occurs.

**Authority drift.** The Reference House is the project's dominant concrete example. Repetition can make its Georgian grammar, courtyard form, masonry family, low-slope roof, ASHP/PV or tectonic vocabulary appear inevitable even when they are project choices. Generalise the reason; keep the taste and technology local.

## Closed or frozen tracks

These areas are not current work queues. Their detailed records remain available for provenance.

- **Naming history — recorded.** The project began as **House Design Doctrine**, became **Long-Life House**, then **House Systems Architecture**, and is now **House Kernel**. The active project identity has been migrated across the website, manuscript, publication pipeline, current research/control documents and build tooling; older names remain only where they describe historical state or a stable legacy identifier.
- **Original doctrine discovery — closed.** House Design Doctrine v7 is preserved as source material rather than a live specification.
- **Architectural-specificity audit — complete.** Gates 0–7 established the boundary between project doctrine, patterns, technical scope, grammar and Reference House choices. See the [audit](docs/development/architectural-specificity-audit.md) and [adversarial test](docs/development/architectural-specificity-adversarial-test.md).
- **Pattern-language migration — complete.** Phases 0–7 established the current canonical language. The stable `HSA-P-*` pattern namespace dates from the House Systems Architecture phase and is retained for identifier stability. See the [Phase 7 review](docs/development/pattern-language-phase7-review.md).
- **Pattern → computational crosswalk — complete at internal mapping scope.** Phase 8 showed that pattern provenance can remain separate from technical obligation derivation. See the [Phase 8 review](docs/development/pattern-language-phase8-review.md).
- **P0 + PAT-XW-01 — passed.** The executable kernel and first crosswalk fixture are retained as regression tests. See the [gate result](docs/computational/p0-pat-xw-01-result.md).
- **Computational paper programme — frozen.** S0 → S1 → S2 → H1 answered the current paper-research question; further expansion requires evidence from another workstream.
- **Information-architecture migration — complete.** Repository ownership, publication structure, website navigation and project state now have distinct roles. See the [closeout record](docs/development/information-architecture-migration.md).

## Status-maintenance rule

Update this page when a major workstream changes maturity, prototype or professional evidence changes a conclusion, the Reference House reaches a new integration state, or the project's recommended next work materially changes.

The maturity block is generated from `project/maturity.ts`; use `npm run status:update` after changing a rating or its evidence. Track-specific TODOs and historical sequencing belong in their owning control documents. This page should remain readable in a few minutes.