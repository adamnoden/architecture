# Project Status

**Generated project-wide projection — do not hand-edit mutable status here.**

Durable execution authority lives in `project/control/`. Live claim occupancy lives separately in ACO on `runtime/claims`. Epistemic maturity authority lives in `project/maturity.ts`. Workstream issues and programme/result records retain reasoning, scope and provenance.

## Execution

<!-- project-control:start -->
Structural execution state is derived from `project/control/`; this Markdown is a durable projection, not runtime claim authority.

[Operations snapshots on GitHub](https://github.com/adamnoden/architecture/actions/workflows/control-operations.yml) · Agent briefing: `npm run control:brief`. Snapshots show their observation time; acquire through the live dispatcher.

Visual dependency map: [`project/control/graph.md`](project/control/graph.md). For the same graph with live ACO occupancy overlaid, run `npm run control:graph:live`.

**Structurally ready:** 18 · **Active:** 0 · **Blocked:** 31 · **Held:** 2 · **Done:** 101 · **Cancelled:** 0

### Structurally ready frontier

These nodes satisfy hard dependencies. A structurally ready node may already have a live ACO lease; query `npm run control:claims` before starting collision-prone durable work.

| Node | Work | Owner | Completion would immediately unlock |
|---|---|---|---|
| `IAS-03` | Selected interior family, drawings and disassembly set | IAS | — |
| `HAD-BOUNDARY` | Compare the Boundary Service Lodge and accessible external service raceway | HAD | — |
| `HAD-03` | Architectural design convergence and visual synthesis | HAD | — |
| `RWT-06` | Rainwater access, courtyard transition and site handoff | RWT | — |
| `RWT-METALS` | Develop copper collection, brass channels and non-plastic concealed routes | RWT | RWT-ROBUSTNESS |
| `STR-GROUND` | Compare tree-tolerant foundations, ground movement isolation and substructure interfaces | STR | — |
| `STR-HOUSE` | Coordinate whole-house structure with the inhabited plan and section | STR / HAD | — |
| `MAT-ENVELOPE` | Resolve non-plastic envelope and structural assembly alternatives | MAT | — |
| `MAT-SERVICES` | Resolve non-plastic service systems and disclose functional residues | MAT | — |
| `MAT-INTERIORS` | Resolve non-plastic interior and wet-room assembly alternatives | MAT | — |
| `ADE-SECTION-PARITY` | Migrate principal and service sections to source-bound visible geometry and cross-view parity | ADE | — |
| `DPL-COMMISSION` | Receive owner-nominated real plot and authorised assessment scope | DPL | DPL-SITE-ASSESSMENT |
| `PHY-04` | Wall/ceiling movement-junction build and test | PHY | — |
| `EPR-RH11` | Obtain and process competent Reference House reviews | EPR | — |
| `SWE-CONTROL` | Repair dispatcher selection races and make lease snapshots efficient and coherent | SWE | — |
| `SWE-PUBLICATION` | Correct PDF routes, persist pinned fonts and preserve Mermaid transformations | SWE | — |
| `SWE-AUTOMATION` | Make briefings source-coherent and reduce evidenced setup and proof overhead | SWE | — |
| `SWE-IDENTITY` | Make canonical compiler fingerprints independent of execution locale | SWE | — |

### Active durable work

`active` means the packet is durably started; it is not an agent-presence or lease. Live occupancy belongs to ACO on `runtime/claims`.

| Node | Work | Owner |
|---|---|---|
| — | No node is currently active | — |

### Blocked

| Node | Work | Direct blockers |
|---|---|---|
| `TRIAD-GATE` | Shared selected-house integration gate | IAS-03, HAD-03, ROF-RWT-GATE, MAT-COORDINATION, STR-RECONCILE |
| `BCR-CONVERGENCE` | Substantive construction-resolution convergence | TRIAD-GATE, MRA-04, HRS-TECHNICAL |
| `HRS-SYNTHESIS` | Post-BCR final house resolution and synthesis | BCR-CONVERGENCE, MRA-05, DEL-CURRENT |
| `HRS-TECHNICAL` | Current-house technical migration and computational applicability | TRIAD-GATE |
| `RWT-ROBUSTNESS` | Test full-duty independent paths, reserve and common-cause rainwater failures | RWT-METALS |
| `RWT-07` | Rainwater network synthesis and Reference House candidates | RWT-06, RWT-METALS, RWT-ROBUSTNESS |
| `ROF-RWT-GATE` | Reference House roof and rainwater reconciliation gate | RWT-07, HAD-03, STR-RECONCILE |
| `ROF-09` | Roof formalisation and regression admission | ROF-RWT-GATE |
| `RWT-08` | Rainwater formalisation and regression admission | ROF-RWT-GATE |
| `STR-RECONCILE` | Reconcile structural interfaces and affected evidence for house selection | STR-HOUSE, STR-GROUND |
| `MAT-COORDINATION` | Reconcile selected-house material compliance and explicit owner exceptions | MAT-ENVELOPE, MAT-SERVICES, MAT-INTERIORS, IAS-03, HAD-03, ROF-RWT-GATE |
| `MRA-01` | External water and ground-envelope assault | TRIAD-GATE |
| `MRA-02` | Internal water and wet-zone assault | TRIAD-GATE |
| `MRA-03` | Vapour, condensation and drying assault | TRIAD-GATE |
| `MRA-04` | Whole-house moisture failure matrix and adversarial gate | MRA-01, MRA-02, MRA-03 |
| `MRA-05` | Post-BCR moisture assurance closeout | BCR-CONVERGENCE |
| `PLT-FINAL-FREEZE` | Final resolved-house plate integration and freeze | PLT-FINAL-PREP, PLT-PRINT-REVIEW |
| `EDA-RENEWED` | Renewed editorial-doctrine assurance over enlarged final source | PLT-FINAL-FREEZE |
| `PUB-02-FINAL` | Final private-object content, drawing and manufacture gate | EDA-RENEWED |
| `PLT-FINAL-PREP` | Prepare coherent final current-house digital and print proof set | HRS-SYNTHESIS |
| `PLT-PRINT-REVIEW` | Receive and disposition actual-size BOOK and WALL print verdicts | PLT-FINAL-PREP |
| `BCR-BAY-DESIGN` | Resolve the selected bay as a coordinated design study | TRIAD-GATE |
| `ADE-MODEL` | Connect current design identities to construction-information outputs | HRS-TECHNICAL |
| `ADE-DETAILS` | Produce source-bound technical bay drawings and details | ADE-MODEL, BCR-BAY-DESIGN |
| `ADE-SCHEDULES` | Produce linked bay schedules specifications and quantities | ADE-MODEL, BCR-BAY-DESIGN |
| `ADE-EVIDENCE` | Bind bay calculations and external evidence to controlling inputs | BCR-BAY-DESIGN |
| `DEL-BAY-PACK` | Assemble one coherent construction-bay review issue | ADE-DETAILS, ADE-SCHEDULES, ADE-EVIDENCE |
| `EPR-BAY-REVIEW` | Obtain and disposition actual designer and contractor bay feedback | DEL-BAY-PACK |
| `DPL-SITE-ASSESSMENT` | Assess actual site applicability and explicit adaptation choices | DPL-COMMISSION |
| `DEL-COMMISSION-PLAN` | Register grounded whole-house design construction and handover packets | DPL-SITE-ASSESSMENT, DEL-BAY-PACK |
| `DEL-CURRENT` | Reconcile selected-house delivery and reinstatement requirements | BCR-CONVERGENCE |

### Structural critical path

`RWT-METALS` → `RWT-ROBUSTNESS` → `RWT-07` → `ROF-RWT-GATE` → `MAT-COORDINATION` → `TRIAD-GATE` → `MRA-01` → `MRA-04` → `BCR-CONVERGENCE` → `MRA-05` → `HRS-SYNTHESIS` → `PLT-FINAL-PREP` → `PLT-PRINT-REVIEW` → `PLT-FINAL-FREEZE` → `EDA-RENEWED` → `PUB-02-FINAL`

This path is structural by node count. It is not a wall-clock estimate; weighted scheduling is withheld unless every remaining node on the model has an explicit planning estimate.
<!-- project-control:end -->

## Maturity

Maturity is an **epistemic judgement**, not execution progress. Completing a graph node does not promote maturity, and reopening work does not automatically demote it.

### Scale

| Level | Meaning | Gate |
|---|---|---|
| **M1** | **Framed** | The problem, scope and intended direction are explicit enough to guide further work. |
| **M2** | **Developed** | Substantive design or research material exists and the main choices and trade-offs are visible, but important coordination remains. |
| **M3** | **Coordinated** | The workstream has been reconciled with adjacent parts of the project and is internally coherent at its stated scope. |
| **M4** | **Internally validated / controlled** | The proposition has been deliberately challenged against internal tests or evidence and is stable enough to act as the controlled baseline. |
| **M5** | **Externally validated / release-ready** | Competent independent review or real-world validation has tested the proposition, material findings are resolved, and it is release-ready at its stated scope. |

### Evidence freshness

PCO monitors the evidence content from baseline `c3701c5`. A changed evidence file marks the affected assessment **stale / reassessment required**; it does not automatically lower the M-level. The baseline establishes future drift surveillance and does not itself constitute independent revalidation of earlier evidence.

| Assessment | Maturity | Reviewed | Evidence files | Evidence watch |
|---|---:|---|---:|---|
| **Public architectural position** | **M4** | 2026-10-19 | 12 | **STALE — reassess** (`docs/manuscript/governing-principles.md`, `docs/manuscript/part-i.md`, `docs/manuscript/part-ii.md`) |
| **Pattern language** | **M4** | 2026-10-12 | 4 | **STALE — reassess** (`docs/patterns/README.md`) |
| **Architectural grammar framework** | **M3** | 2026-10-12 | 3 | content unchanged against PCO evidence baseline |
| **G-01 grammar instance** | **M4** | 2026-10-14 | 9 | **STALE — reassess** (`docs/reference-house/g01-v0.1-conformance-d12.md`) |
| **Reference House** | **M3** | 2026-10-19 | 9 | **STALE — reassess** (`docs/reference-house/README.md`, `docs/reference-house/pattern-occurrence-register.md`, `docs/reference-house/energy-heat-coordination-rh10.md`, `docs/reference-house/model-baseline-rhc0.md`) |
| **Physical prototypes** | **M2** | 2026-10-12 | 3 | **STALE — reassess** (`docs/development/tectonic-prototype-programme.md`) |
| **External professional review** | **M1** | 2026-10-12 | 3 | **STALE — reassess** (`docs/reference-house/external-review-brief.md`, `docs/reference-house/external-review-regulatory-baseline-rh11.md`) |
| **Computational track** | **M4** | 2026-10-30 | 48 | **STALE — reassess** (`docs/reference-house/model-baseline-rhc0.md`, `docs/computational/compiler-generality-assurance-cf01.md`, `docs/computational/reference-house-executable-slice.md`, `compiler/ch00/README.md`, `compiler/ch02/README.md`, `compiler/ch03/README.md`, `compiler/ch04/README.md`, `compiler/ch05/README.md`, `compiler/ch05/ch05.test.ts`, `compiler/ch06/README.md`, `compiler/ch07/README.md`, `compiler/README.md`, `compiler/reference-house/identity.ts`, `compiler/reference-house/system-compile.ts`, `compiler/rhc4/rhc4.test.ts`, `compiler/rhc5/rhc5.test.ts`, `project/ccr/ccr-identity-result.md`, `compiler/coa06/identity-contract.test.ts`, `compiler/reference-house/stair-source.test.ts`) |
| **Evidence / precedent research** | **M3** | 2026-10-12 | 3 | **STALE — reassess** (`docs/research/README.md`) |
| **Publication** | **M4** | 2026-10-28 | 17 | **STALE — reassess** (`docs/manuscript/publication-architecture.md`, `publication/publication.ts`, `docs/editorial/eda-programme.md`) |
| **Deployment / real-site integration** | **M4** | 2026-10-27 | 48 | **STALE — reassess** (`project/dpl/deployment-programme.md`, `project/dpl/exploration/README.md`) |
| **Delivery** | **M2** | 2026-10-28 | 5 | **STALE — reassess** (`docs/delivery/README.md`, `project/del/delivery-programme.md`) |

### Assessed subjects and design applicability

The named subject/source bindings live in `project/maturity-subjects.ts`. Source content is watched from the HRS inspection boundary `f75668d`, including tracked working edits. This is an inspection baseline, not a retrospective maturity assessment. Changed controlling geometry, implementation or provenance requires applicability reassessment even when review prose is untouched. An unavailable baseline is **unknown**. Unchanged sources do not prove applicability to a successor design or promote an M-level.

| Assessment | Named assessed subject / revision | Source watch | Applicability limit |
|---|---|---|---|
| **Public architectural position** | PR-01 controlled architectural proposition with HFI integration (reviewed 2026-10-19) | **REASSESS applicability** (`docs/manuscript/governing-principles.md`, `docs/manuscript/part-i.md`, `docs/manuscript/part-ii.md`) | Architectural doctrine at its stated scope; no particular house or construction acceptance. |
| **Pattern language** | 21 active patterns, three strategies and held candidates (reviewed 2026-10-12) | **REASSESS applicability** (`docs/patterns/README.md`, `docs/patterns/controlled-utility-entry.md`) | Pattern meanings and corpus only; occurrence in a changed house needs separate design evidence. |
| **Architectural grammar framework** | Coordinated grammar framework (reviewed 2026-10-12) | monitored sources unchanged; no automatic applicability pass | Framework scope only; neither a new grammar nor a house conformance result is admitted. |
| **G-01 grammar instance** | G-01 v0.1 frozen grammar and its historical D12/D13 tests (reviewed 2026-10-14) | **REASSESS applicability** (`project/triad-interface-contract.md`) | G-01 grammar evidence survives; historical conformance does not transfer automatically to revision 02. |
| **Reference House** | Historical RH-00–RH-10 technical house with HFI-RW-01 stair rewind (reviewed 2026-10-19) | **REASSESS applicability** (`compiler/reference-house/compile.ts`, `compiler/reference-house/derive.ts`, `compiler/reference-house/model.ts`, `project/triad-interface-contract.md`) | Historical subject only; applicability to RH-LAYOUT-REVISION-02 is not established. HRS and the owning assessment must explicitly reassess it. |
| **Physical prototypes** | P01/W2 challenger and P03/P04 prototype preparation (reviewed 2026-10-12) | **REASSESS applicability** (`docs/development/tectonic-prototype-programme.md`, `docs/prototypes/README.md`, `docs/prototypes/p03-floor-edge-engineering-brief.md`, `docs/prototypes/p03-floor-edge-test-protocol.md`, `docs/prototypes/p03-structural-floor-edge-handoff.md`, `docs/prototypes/p04-wall-ceiling-build-pack.md`, `docs/prototypes/p04-wall-ceiling-test-protocol.md`, `project/triad-interface-contract.md`) | Preparation at its historical configurations; no physical result or current-house prototype applicability is established. |
| **External professional review** | Historical RH-11 and H1 review preparation (reviewed 2026-10-12) | **REASSESS applicability** (`docs/reference-house/external-review-brief.md`, `docs/reference-house/external-review-regulatory-baseline-rh11.md`, `project/triad-interface-contract.md`) | No competent review response; historical packs are not issue-ready current-house professional acceptance. |
| **Computational track** | Historical Reference House/RH-C5 and CH-00–08 bounded compiler with finite CCR repairs (reviewed 2026-10-30) | **REASSESS applicability** (`compiler/boundary-slice/compile.ts`, `compiler/boundary-slice/declarations.ts`, `compiler/boundary-slice/model.ts`, `compiler/plan-slice/compile.ts`, `compiler/plan-slice/derive.ts`, `compiler/plan-slice/region-area.ts`, `compiler/reference-house/compile.ts`, `compiler/reference-house/derive.ts`, `compiler/reference-house/identity.ts`, `compiler/reference-house/model.ts`, `compiler/reference-house/system-compile.ts`, `compiler/rhc4/README.md`, `compiler/rhc4/drainage-declarations.test.ts`, `compiler/rhc4/hardening.ts`, `compiler/rhc4/rhc4.test.ts`, `compiler/rhc5/README.md`, `compiler/rhc5/compile.ts`, `compiler/rhc5/method.ts`, `compiler/rhc5/rhc5.test.ts`, `project/triad-interface-contract.md`) | Historical fixture/domain only. Geometry, implementation and controlling-input provenance can change applicability independently; no current-house technical pass follows. |
| **Evidence / precedent research** | Coordinated evidence/research corpus (reviewed 2026-10-12) | **REASSESS applicability** (`docs/research/README.md`, `docs/research/rainfall-and-hydraulic-basis.md`, `docs/research/rainwater-collection-options.md`, `docs/research/rainwater-conveyance-options.md`, `docs/research/rainwater-failure-and-exceedance.md`, `docs/research/roof-access-and-renewal.md`, `docs/research/roof-assembly-options.md`, `docs/research/roof-covering-families.md`, `docs/research/roof-failure-evaluation.md`, `docs/research/roof-junction-families.md`, `docs/research/roof-rainwater-material-compatibility.md`, `docs/research/roof-shedding-and-ground-receivers.md`, `docs/research/roof-system-candidates.md`, `docs/research/roof-topology-families.md`, `docs/research/solid-walls-and-masonry-arches.md`, `docs/research/structural-floor-roof-options.md`) | Each study retains its own subject and evidence limits; corpus freshness is not a design approval. |
| **Publication** | Controlled PR-01/publication object with later final-integration holds (reviewed 2026-10-28) | **REASSESS applicability** (`docs/manuscript/evidence-and-precedent-notes.md`, `docs/manuscript/governing-principles.md`, `docs/manuscript/part-i.md`, `docs/manuscript/part-ii.md`, `docs/manuscript/part-iv.md`, `docs/manuscript/part-v.md`, `docs/manuscript/preface.md`, `docs/manuscript/publication-architecture.md`, `docs/manuscript/readers-guide.md`, `docs/manuscript/reference-house-implementation-schedule.md`, `project/triad-interface-contract.md`, `publication/README.md`, `publication/adapters.test.ts`, `publication/adapters.ts`, `publication/figures.ts`, `publication/metadata.json`, `publication/part-iii.md`, `publication/pattern-reference.md`, `publication/plates-current.ts`, `publication/primer/README.md`, `publication/primer/constitution.md`, `publication/primer/figure.test.ts`, `publication/primer/figure.ts`, `publication/primer/outlook.md`, `publication/primer/patterns.md`, `publication/primer/proposition.md`, `publication/primer/reference-house.md`, `publication/primer/theme.css`, `publication/publication.ts`, `publication/release-candidates/README.md`, `publication/scripts/integrity.ts`, `publication/scripts/prepare.ts`, `publication/scripts/typography.ts`, `publication/scripts/validate-figures.ts`, `publication/scripts/validate-plate-rhythm.ts`, `publication/scripts/validate.ts`, `publication/specimens/plt03b4/README.md`, `publication/specimens/plt03b5/README.md`, `publication/specimens/plt13/README.md`, `publication/specimens/plt16/README.md`, `publication/specimens/typ03/README.md`, `publication/specimens/typ04/README.md`, `publication/specimens/typ05/README.md`, `publication/specimens/typ05/inventory.ts`, `publication/specimens/typ05/mixed-prepare.ts`, `publication/specimens/typ07/README.md`, `publication/specimens/typ07/audit.ts`, `publication/specimens/typ07/manifest.ts`, `publication/specimens/typ07/prepare.ts`, `publication/specimens/typ08/README.md`, `publication/typography-metadata.json`, `publication/vivliostyle.config.js`) | Internal object/process scope; changed house/content needs final PLT/EDA integration, not automatic release or maturity promotion. |
| **Deployment / real-site integration** | DPL synthetic SCREENING and DPL-RS-01 UNRESOLVED/conditional evidence (reviewed 2026-10-27) | **REASSESS applicability** (`compiler/dpl/dplT4Lennard.test.ts`, `compiler/dpl/dplT9Lennard.test.ts`, `compiler/dpl/dplT9Lennard.ts`, `compiler/dpl/fixtures/lennard-pre-ccr-reference-output-manifest.json`, `compiler/reference-house/compile.ts`, `compiler/reference-house/derive.ts`, `compiler/reference-house/model.ts`, `project/triad-interface-contract.md`) | Historical candidate and conditional/site-transform evidence only; no empirical compatibility, revision-02 site placement or real commission is established. |
| **Delivery** | DEL-00 delivery inventory and provisional allocations (reviewed 2026-10-28) | **REASSESS applicability** (`docs/delivery/README.md`, `docs/delivery/information-issue-profiles.md`, `project/triad-interface-contract.md`) | Inventory/preparation only; current-house assemblies, professional/physical evidence and commission acceptance remain outstanding. |

<details>
<summary>Legacy maturity compatibility projection (non-authoritative)</summary>

This collapsed block is retained temporarily because the existing repository-integrity check still verifies the historical renderer. Its `Current state` / `Next meaningful gate` columns are **not execution authority**; PCO owns current durable execution state above.

<!-- maturity-status:start -->
Ovid’s House uses a **project-specific maturity model**. It is not a RIBA Plan of Work stage, BIM level-of-detail convention, Technology Readiness Level or other external industry standard. The codes use **M** for maturity so they are less likely to be mistaken for those systems.

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
| **Public architectural position** | **M4** | 2026-10-19 | The core architectural position remains the internally controlled PR-01 baseline after material narrowing: proportional serviceability can reject overprovision, transfer claims are bounded, foreseeable human life-course and future-climate change are explicit, the Repose structural-perception claim is qualified, and architecture is separated from delivery and stewardship assumptions. The completed HFI programme has now integrated foreseeable human variance and complete-action / low-vigilance consequences into the governing principles without creating a parallel human-factors doctrine. | Hold the corrected position as the internally controlled baseline through PR-02; PR-03/PR-04 external critical reading and downstream physical/professional evidence remain capable of reopening it. M5 requires competent independent validation at the stated scope. |
| **Pattern language** | **M4** | 2026-10-12 | 21 active patterns, three strategies and four held candidates are canonical at current internal scope. | Reopen only when new architectural, physical or external evidence requires change. |
| **Architectural grammar framework** | **M3** | 2026-10-12 | Grammar is a first-class layer separate from Ovid’s House doctrine and is coordinated at framework level. | Continue to test neutrality across concrete grammar instances. |
| **G-01 grammar instance** | **M4** | 2026-10-14 | G-01 v0.1 is frozen as a bounded Georgian-derived domestic grammar. D8 falsification, predeclared D9 hold-outs, D10 normative reduction, fresh D10-S positive-specificity validation, freeze-before-project D12 conformance and D13 negative controls leave a small controlled rule set with explicit limitations: no universal ratios, centred-entry rule, fixed roof type or historical service topology. Positive specificity is strongest at architectural body/elevation/threshold scale; morphology-specific interior grammar remains open research debt rather than an invented rule set. | Hold v0.1 as the controlled baseline. Reopen only when competent external criticism, a real-project contradiction, a materially different second grammar, publication adversarial review or material new evidence creates a concrete question. M5 requires independent architectural validation at the stated scope. |
| **Reference House** | **M3** | 2026-10-19 | RH-00 through RH-10 remain coordinated at virtual-design scope and RH-11 remains issue-ready. HFI-RW-01 has deliberately rewound the principal stair from 280 mm to the project-preferred 300 mm going while preserving the shell, courtyard, programme and circulation topology; the HFI review handoff is integrated without claiming external validation. | Issue RH-11 packages, resolve material reviewer findings through the owning RH gates, progress P03/P04 validation, and retain the explicitly unresolved HFI handoffs for finished interfaces, real-site access, stairlift compatibility, future lift provision and laundry topology with their downstream owners. |
| **Physical prototypes** | **M2** | 2026-10-12 | The validation programme is defined but no physical result has yet been recorded; after RH-09/RH-10, P03 floor-edge and P04 wall/ceiling-joint evidence are the Reference House priorities, while P01 W2 remains an optional challenger and P02 is not a current house dependency. | Engineer and test P03 structural floor edge, then build/test P04 wall/ceiling joint; continue P01 W2 only as optional research where resources justify it. |
| **External professional review** | **M1** | 2026-10-12 | RH-11 now provides issue-ready structural, fire/building-control, MEP/acoustic and building-physics/energy review briefs with explicit rewind criteria; no competent review response has yet been recorded. | Obtain and process competent discipline reviews; material findings reopen the owning Reference House gate and remain unresolved until closure evidence is recorded. |
| **Computational track** | **M4** | 2026-10-30 | The historical Reference House/RH-C5 and CH-00–08 compiler remains M4 only at its bounded internally tested scope after the finite CCR repairs: represented rectangle unions, relative stair datums/discrete topology, authored drainage consistency and an explicitly limited compact identity contract. Current output bytes are separately verified; frozen historical evidence is preserved. This reassessment does not establish a technical pass or maturity for the current 12 × 12 m house, complete stair fit, hydraulic or physical performance. | Hold the reassessed historical compiler at this exact bounded scope; controlling-source changes still require scoped review and HRS-TECHNICAL owns current-house migration. There is no standing CH-09 or RH-C6; future computational capability should be demand-led by external review, physical validation, DPL target/site work, a real project, newly authoritative inputs or another concrete proof family. M5 requires appropriate external validation of the computational proposition at its stated scope. |
| **Evidence / precedent research** | **M3** | 2026-10-12 | Major evidence packages exist and taxonomy ambiguities are largely closed. | Targeted claim hardening where physical or publication maturity requires it. |
| **Publication** | **M4** | 2026-10-28 | PR-00, PR-01, PUB-SAN and PUB-NOM remain complete for the source/object scopes they actually reviewed; DRW v1 remains frozen and TYP has an accepted RC2 production release. EDA-00–08 remain valid historical assurance for the 128-source candidate book, and ADE remains internally complete at its stated representation scope. BSR has now completed the six-part structural migration: the Working Edition has stable Part IV design-proposition, Part V proving/technical-closure and Part VI resolved-house interfaces. IAS/OAS/HAD are unblocked against those interfaces, but the previous EDA clearance and PLT-only manufacture path remain insufficient for the enlarged final book. Publication maturity remains M4; no prior evidence is erased or promoted. | PUB-02 may continue content-independent object preparation using the accepted typography contract. Final private-object content/drawing freeze and manufacture now require IAS/OAS/HAD design resolution; BCR construction-resolution convergence; HRS final architectural synthesis; final PLT integration/physical drawing freeze; and renewed EDA assurance over the enlarged source/object. PUB-03/PUB-04 independent criticism remains required before M5 or public-release claims. |
| **Deployment / real-site integration** | **M4** | 2026-10-27 | The M4 claim ceiling remains bounded canonical synthetic integration, controlled SCREENING owner/readiness composition and the canonical DPL-RS-01 UNRESOLVED result scope; later execution does not silently widen it. DPL-01 through DPL-14 are complete. DPL-15J adds explicit assumption-based trials across all eight sites, a conditional envelope, reader-facing computational explanation and internal adversarial checks. Geometry hypotheses do not discharge evidence-backed readiness: corpus readiness remains 0/8 after DPL-15I, and real-site compatibility remains unestablished. The user has explicitly revised DPL-15/16/17/18 to conditional research scope. Their final authored case and closeout complete that revised programme; the original empirical criteria remain unearned and real-site verification is deferred. Lennard remains excluded from empirical sampling. | No standing DPL research packet remains. Trigger a separate verification follow-on only for a selected real commission/site or explicit evidence-backed request; then replace the applicable premises with controlled site data and stage-specific professional evidence. Conditional completion does not raise maturity or authority, and authorises no external contact or spend. |
| **Delivery** | **M2** | 2026-10-28 | DEL-00 inventories the existing delivery modules, N01–N17 and other brief obligations, with provisional discipline/stage allocations, evidence dependencies and rewind owners under #854. The authorised IAS/OAS/HAD/BCR/HRS programme now creates concrete future assembly and construction-resolution inputs, but no new delivery acceptance is implied. Current-house technical migration, competent review, physical evidence and commission-specific acceptance remain outstanding. | Reconcile DEL when BCR admits concrete IAS/OAS/HAD assembly obligations, and when RH-11/EPR, applicable PHY results or a real commission supplies evidence. Add fabrication, tolerance, shop-drawing, equivalence, first-article, commissioning or reinstatement requirements only where a selected assembly earns them. Declare source applicability before issuing older packages for the Georgian proposal. No project acceptance or maturity increase follows from programme authorisation. |
<!-- maturity-status:end -->

</details>

## Reading current state

- Use the **Structurally ready frontier** above to identify work whose hard dependencies are satisfied.
- Use [`project/control/graph.md`](project/control/graph.md) for the generated structural Mermaid dependency map.
- Before substantial execution, query `npm run control:claims` and acquire the ACO lease; structural READY does not mean unclaimed.
- Use owning workstream issues/programmes for the architectural question, scope and exit criteria behind a node.
- A completed node does not itself raise maturity; maturity remains an explicit evidence-backed judgement.
- Possible future PHY/EPR/DEL work is not a blocker until a concrete obligation is admitted into the graph.
