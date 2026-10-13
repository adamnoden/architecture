# Project Status

**Canonical project-wide status overview**  
**Last updated:** 2026-10-13  
**Current phase:** **validation / implementation falsification**

This page answers one question: **where is House Kernel now?** Detailed programme histories and gate records remain in their owning areas; this page records the current state, next meaningful work and principal risks.

The architectural position and canonical pattern language are established strongly enough that the project's largest uncertainties now sit downstream. The highest-value work is to force the system through one actual house, build and test the propositions that cannot be settled on paper, obtain competent external criticism, and complete the publication without allowing project-specific choices to drift upstream into doctrine.

## Active now

### Reference House

The Reference House has passed **RH-00 through RH-11**. It remains **M3 — Coordinated at virtual-design scope**. RH-10 reconciled the whole virtual building; RH-11 turned the remaining structural, fire/building-control, MEP/acoustic and building-physics/energy uncertainties into issue-ready review briefs. RH-C0 froze a controlled pre-compiler source contract, and RH-C1 reproduces that bounded fixture deterministically from one semantic source, including the ground-floor plan, first-floor plan and principal section.

The design-gate sequence is complete at its current virtual scope. **Active evidence work remains:** issue the RH-11 pack to competent reviewers, record findings against the owning RH gate, and progress the P03 structural floor-edge and P04 wall/ceiling physical-validation work. RH-C0/RH-C1 and the subsequent CF-01 compiler-generalisation result are internal model-control results, not construction validation, and do not raise Reference House maturity.

### Computational implementation

CF-01 is closed **PASS**. P0 remains 17/17, PAT-XW-01 6/6, RH-C1 27/27 and CF-01 adds 7/7 bounded-generality tests; the full repository and documentation build pass in CI.

CF-01 extracted a shared plan-semantic kernel and challenged it with an unlike single-storey, asymmetric fixture with no courtyard, stair, regular bay field or entrance-bay membership. The Reference House still passes its complete regression/mutation suite through that shared layer. This is **two-fixture bounded evidence**, not arbitrary architecture support.

**RH-C2 — bounded structural view — is now the next computational gate.** CF-01 removed the sequencing block but did not begin structural implementation. Services, detailed envelope physics, products and general regulations logic remain later demand-led slices.

### Physical and engineering validation

This remains a major evidence gap between a coordinated architectural system and a credible building system. P03 structural floor-edge work is a real RH-05 engineering dependency and P04 tests the selected RH-09 wall/ceiling movement interface. P01 W2 remains an optional challenger rather than an architectural dependency; P02 selective floor access is not currently selected by the Reference House.

Prototype outcomes should be allowed to reject or simplify implementations. A successful mock-up does not promote a general House Kernel proposition automatically, and a failed challenger does not invalidate the house where a conventional baseline already exists.

### Professional review

The [RH-11 External Review Brief](docs/reference-house/external-review-brief.md) is now issue-ready, with separate structural, fire/building-control, MEP/acoustic and building-physics/energy appendices plus a date-stamped regulatory baseline and response template.

**No competent review response has yet been recorded.** External professional review therefore remains M1. The next value comes from actual independent findings, especially negative ones that force a bounded rewind, qualification or rejection. A review request, meeting or unprocessed consultant note is not validation.

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
| **Reference House** | **M3** | 2026-10-12 | RH-00 through RH-10 are coordinated at virtual-design scope, RH-11 provides issue-ready discipline review packages, and RH-C0 has frozen a controlled pre-compiler model without converting unresolved technical assumptions into certainty. | Issue RH-11 packages, resolve material reviewer findings through the owning RH gates, and progress P03/P04 validation; RH-C0 does not raise Reference House maturity. |
| **Physical prototypes** | **M2** | 2026-10-12 | The validation programme is defined but no physical result has yet been recorded; after RH-09/RH-10, P03 floor-edge and P04 wall/ceiling-joint evidence are the Reference House priorities, while P01 W2 remains an optional challenger and P02 is not a current house dependency. | Engineer and test P03 structural floor edge, then build/test P04 wall/ceiling joint; continue P01 W2 only as optional research where resources justify it. |
| **External professional review** | **M1** | 2026-10-12 | RH-11 now provides issue-ready structural, fire/building-control, MEP/acoustic and building-physics/energy review briefs with explicit rewind criteria; no competent review response has yet been recorded. | Obtain and process competent discipline reviews; material findings reopen the owning Reference House gate and remain unresolved until closure evidence is recorded. |
| **Computational track** | **M3** | 2026-10-13 | P0 passes 17/17 tests, PAT-XW-01 6/6, RH-C1 27/27 and CF-01 7/7. CF-01 extracted a shared plan-semantic kernel and passed an unlike single-storey, asymmetric, no-courtyard, no-stair, non-bay-derived fixture without fixture-ID branching while preserving the Reference House regression suite. This is two-fixture bounded evidence, not arbitrary architectural validity. | Begin RH-C2 as the bounded structural view now that CF-01 has removed the sequencing block; preserve the existing proof boundary and do not imply structural adequacy merely from representability. |
| **Evidence / precedent research** | **M3** | 2026-10-12 | Major evidence packages exist and taxonomy ambiguities are largely closed. | Targeted claim hardening where physical or publication maturity requires it. |
| **Publication** | **M3** | 2026-10-12 | Publication Architecture v0.12 is established; Parts III/IV and figure language remain less mature than the main argument. | Finish Part III/IV development, figures and evidence presentation. |
| **Delivery** | **M2** | 2026-10-12 | The implementation-brief structure exists, but downstream requirements remain intentionally incomplete. | Populate only as architectural and validation decisions mature. |
<!-- maturity-status:end -->

## Principal risks

**Physical quality.** Replaceable walls, floors and interfaces may work technically yet feel hollow, temporary or over-detailed. Tactile, acoustic and architectural quality must survive the serviceability agenda.

**Complexity and proportionality.** Serviceability infrastructure can consume more space, money, carbon and maintenance than the future work it avoids. RH-10 is encouraging here: later gates repeatedly deleted or rejected disproportionate infrastructure rather than accumulating it. That discipline must continue under specialist review.

**Workmanship.** A detail that works only under designer supervision fails the project. Tests should include imperfect backgrounds, realistic tolerances and ordinary competent installation.

**Environmental performance.** Passive-first is a hierarchy, not a predetermined system answer. Actual orientation, glazing, gains, heat loss, ASHP acoustics, PV performance and dynamic overheating remain unproved until a real site and specialist models exist.

**External validation gap.** M3 is internal coordination, not external proof. Structural, fire/building-control, MEP/acoustic and building-physics assumptions are now explicit and issue-ready, but remain vulnerable until competent reviewers attack them and findings are resolved.

**Authority drift.** The Reference House is the project's dominant concrete example. Repetition can make its Georgian grammar, courtyard form, masonry family, low-slope roof, ASHP/PV or tectonic vocabulary appear inevitable even when they are project choices. Generalise the reason; keep the taste and technology local.

**Compiler generality.** CF-01 removed several accidental Reference-House assumptions from the reusable plan layer and passed a second unlike fixture, but two fixtures are not arbitrary architecture. The current plan kernel remains intentionally orthogonal and rectangular; RH-C2 must not reintroduce fixture coupling or turn representability into a structural-validity claim.

## Closed or frozen tracks

These areas are not current work queues. Their detailed records remain available for provenance.

- **Naming history — recorded.** The project began as **House Design Doctrine**, became **Long-Life House**, then **House Systems Architecture**, and is now **House Kernel**. The active project identity has been migrated across the website, manuscript, publication pipeline, current research/control documents and build tooling; older names remain only where they describe historical state or a stable legacy identifier.
- **Original doctrine discovery — closed.** House Design Doctrine v7 is preserved as source material rather than a live specification.
- **Architectural-specificity audit — complete.** Gates 0–7 established the boundary between project doctrine, patterns, technical scope, grammar and Reference House choices. See the [audit](docs/development/architectural-specificity-audit.md) and [adversarial test](docs/development/architectural-specificity-adversarial-test.md).
- **Pattern-language migration — complete.** Phases 0–7 established the current canonical language. The stable `HSA-P-*` pattern namespace dates from the House Systems Architecture phase and is retained for identifier stability. See the [Phase 7 review](docs/development/pattern-language-phase7-review.md).
- **Pattern → computational crosswalk — complete at internal mapping scope.** Phase 8 showed that pattern provenance can remain separate from technical obligation derivation. See the [Phase 8 review](docs/development/pattern-language-phase8-review.md).
- **P0 + PAT-XW-01 — passed.** The executable kernel and first crosswalk fixture are retained as regression tests. See the [gate result](docs/computational/p0-pat-xw-01-result.md).
- **RH-C0 + RH-C1 + CF-01 — passed.** The Reference House has a frozen source contract and deterministic one-fixture executable projection; the subsequent contrast-fixture gate supplies bounded two-fixture evidence for the shared plan-semantic mechanisms. See the [RH-C1 executable result](docs/computational/reference-house-executable-slice.md), [drawing parity result](docs/reference-house/rhc1-drawing-parity-result.md) and [CF-01 result](docs/computational/compiler-generality-assurance-cf01.md).
- **Computational paper programme — frozen.** S0 → S1 → S2 → H1 answered the current paper-research question; further expansion requires evidence from another workstream.
- **Information-architecture migration — complete.** Repository ownership, publication structure, website navigation and project state now have distinct roles. See the [closeout record](docs/development/information-architecture-migration.md).

## Status-maintenance rule

Update this page when a major workstream changes maturity, prototype or professional evidence changes a conclusion, the Reference House reaches a new integration state, or the project's recommended next work materially changes.

The maturity block is generated from `project/maturity.ts`; use `npm run status:update` after changing a rating or its evidence. Track-specific TODOs and historical sequencing belong in their owning control documents. This page should remain readable in a few minutes.
