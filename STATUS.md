# Project Status

**Generated project-wide projection — do not hand-edit mutable status here.**

Durable execution authority lives in `project/control/`. Live claim occupancy lives separately in ACO on `runtime/claims`. Epistemic maturity authority lives in `project/maturity.ts`. Workstream issues and programme/result records retain reasoning, scope and provenance.

## Execution

<!-- project-control:start -->
Structural execution state is derived from `project/control/`; this Markdown is a durable projection, not runtime claim authority.

Visual dependency map: [`project/control/graph.md`](project/control/graph.md). For the same graph with live ACO occupancy overlaid, run `npm run control:graph:live`.

**Structurally ready:** 17 · **Active:** 0 · **Blocked:** 57 · **Held:** 2 · **Done:** 43 · **Cancelled:** 0

### Structurally ready frontier

These nodes satisfy hard dependencies. A structurally ready node may already have a live ACO lease; query `npm run control:claims` before starting collision-prone durable work.

| Node | Work | Owner | Completion would immediately unlock |
|---|---|---|---|
| `CCR-PLAN` | Repair rectangle-union area and plate closure | CCR | — |
| `CCR-STAIR` | Repair stair datum arithmetic and discrete topology | CCR | — |
| `CCR-DRAINAGE` | Repair drainage declaration validity and source consistency | CCR | — |
| `PCO-RESILIENCE` | Bound failure recovery and expose lease freshness and handoff evidence | PCO | — |
| `IAS-03` | Selected interior family, drawings and disassembly set | IAS | — |
| `HAD-03` | Architectural design convergence and visual synthesis | HAD | — |
| `BCR-SCAFFOLD` | Construction-resolution inventory and matrix scaffolding | BCR | — |
| `HRS-BASELINE` | Accepted 12 m house identity and historical-evidence applicability | HRS | PCO-APPLICABILITY, DPL-SITE-BRIEF |
| `ROF-01` | Roof evidence, failure model and evaluation frame | ROF | ROF-02, ROF-03, ROF-04 |
| `RWT-01` | Rainfall and hydraulic basis | RWT | RWT-02, RWT-03, RWT-04 |
| `MRA-00` | Moisture constitution, inventory and threat model | MRA | — |
| `PLT-CURRENT-REVIEW` | Current-house digital plate capability and review handoff | PLT | — |
| `PUB-02-PREP` | Content-independent private-object preparation | PUB | — |
| `EDA-ADAPTER` | Restore authored ownership of architectural publication prose | EDA | — |
| `EDA-ARGUMENT` | Red-team architectural contribution and evidence for the central thesis | EDA | — |
| `DEL-ISSUE-PROFILES` | Define purpose-specific information and issue requirements | DEL | — |
| `ADE-DELIVERY-AUDIT` | Map construction-information needs to existing capabilities | ADE | — |

### Active durable work

`active` means the packet is durably started; it is not an agent-presence or lease. Live occupancy belongs to ACO on `runtime/claims`.

| Node | Work | Owner |
|---|---|---|
| — | No node is currently active | — |

### Blocked

| Node | Work | Direct blockers |
|---|---|---|
| `CCR-IDENTITY` | Adjudicate identity guarantees and integrate correctness repairs | CCR-PLAN, CCR-STAIR, CCR-DRAINAGE |
| `PCO-APPLICABILITY` | Bind maturity applicability to assessed design sources | HRS-BASELINE |
| `TRIAD-GATE` | Shared selected-house integration gate | IAS-03, HAD-03, ROF-RWT-GATE, BCR-PREFLIGHT |
| `BCR-CONVERGENCE` | Substantive construction-resolution convergence | BCR-SCAFFOLD, TRIAD-GATE, MRA-04, BCR-PROPORTIONALITY, HRS-TECHNICAL, EPR-REFRESH, PHY-APPLICABILITY |
| `HRS-SYNTHESIS` | Post-BCR final house resolution and synthesis | BCR-CONVERGENCE, MRA-05, PCO-APPLICABILITY, DEL-CURRENT, EDA-NARRATIVE |
| `BCR-STRUCTURE` | Structure, stair and entry-void feasibility | BCR-SCAFFOLD, HRS-BASELINE |
| `BCR-WET` | Wet-room sections, sanitary fit and foul-drainage feasibility | BCR-SCAFFOLD, HRS-BASELINE |
| `BCR-SERVICES` | Plant, riser, distribution and replacement feasibility | BCR-SCAFFOLD, HRS-BASELINE |
| `BCR-WATER` | Roof and courtyard normal/failure water-path feasibility | BCR-SCAFFOLD, HRS-BASELINE |
| `BCR-OCCUPATION` | Complete occupation, escape and renewal actions | BCR-SCAFFOLD, HRS-BASELINE |
| `BCR-PROPORTIONALITY` | Current-house conventional comparator and burden appraisal | BCR-SCAFFOLD, HRS-BASELINE |
| `BCR-PREFLIGHT` | Reconcile early feasibility findings into selection constraints | BCR-STRUCTURE, BCR-WET, BCR-SERVICES, BCR-WATER, BCR-OCCUPATION |
| `HRS-TECHNICAL` | Current-house technical migration and computational applicability | TRIAD-GATE, CCR-IDENTITY |
| `ROF-02` | Roof topology and geometry families | ROF-01 |
| `ROF-03` | Roof covering-system families | ROF-01 |
| `ROF-04` | Roof assembly beneath the covering | ROF-01 |
| `ROF-05` | Roof junction and penetration families | ROF-02, ROF-03, ROF-04 |
| `ROF-06` | Roof access, maintenance, repair and renewal | ROF-05 |
| `ROF-07` | Roof system synthesis and candidate families | ROF-05, ROF-06 |
| `RWT-02` | Rainwater collection architecture | RWT-01 |
| `RWT-03` | Rainwater conveyance topology | RWT-01 |
| `RWT-04` | Rainwater materials, joints and compatibility | RWT-01 |
| `RWT-05` | Rainwater blockage, failure and exceedance | RWT-02, RWT-03, RWT-04 |
| `RWT-06` | Rainwater access, courtyard transition and site handoff | RWT-03, RWT-05 |
| `RWT-07` | Rainwater network synthesis and Reference House candidates | RWT-02, RWT-03, RWT-04, RWT-05, RWT-06, ROF-02 |
| `ROF-RWT-GATE` | Reference House roof and rainwater reconciliation gate | ROF-07, RWT-07, HAD-03 |
| `ROF-09` | Roof formalisation and regression admission | ROF-RWT-GATE |
| `RWT-08` | Rainwater formalisation and regression admission | ROF-RWT-GATE |
| `MRA-01` | External water and ground-envelope assault | MRA-00, TRIAD-GATE |
| `MRA-02` | Internal water and wet-zone assault | MRA-00, TRIAD-GATE |
| `MRA-03` | Vapour, condensation and drying assault | MRA-00, TRIAD-GATE |
| `MRA-04` | Whole-house moisture failure matrix and adversarial gate | MRA-01, MRA-02, MRA-03 |
| `MRA-05` | Post-BCR moisture assurance closeout | BCR-CONVERGENCE |
| `PLT-FINAL-FREEZE` | Final resolved-house plate integration and freeze | PLT-FINAL-PREP, PLT-PRINT-REVIEW |
| `EDA-RENEWED` | Renewed editorial-doctrine assurance over enlarged final source | PLT-FINAL-FREEZE, EDA-ADAPTER |
| `PUB-02-FINAL` | Final private-object content, drawing and manufacture gate | PUB-02-PREP, EDA-RENEWED |
| `PLT-FINAL-PREP` | Prepare coherent final current-house digital and print proof set | HRS-SYNTHESIS, PLT-CURRENT-REVIEW |
| `PLT-PRINT-REVIEW` | Receive and disposition actual-size BOOK and WALL print verdicts | PLT-FINAL-PREP |
| `EDA-NARRATIVE` | Reshape and subtract for a compelling architectural reader journey | EDA-ARGUMENT, EDA-ADAPTER |
| `BCR-BAY-BRIEF` | Select one consequential construction bay and its proof obligations | HRS-BASELINE, BCR-PREFLIGHT |
| `BCR-BAY-DESIGN` | Resolve the selected bay as a coordinated design study | BCR-BAY-BRIEF, TRIAD-GATE |
| `ADE-MODEL` | Connect current design identities to construction-information outputs | ADE-DELIVERY-AUDIT, HRS-TECHNICAL |
| `ADE-DETAILS` | Produce source-bound technical bay drawings and details | ADE-MODEL, BCR-BAY-DESIGN |
| `ADE-SCHEDULES` | Produce linked bay schedules specifications and quantities | ADE-MODEL, BCR-BAY-DESIGN |
| `ADE-EVIDENCE` | Bind bay calculations and external evidence to controlling inputs | ADE-DELIVERY-AUDIT, BCR-BAY-DESIGN, CCR-IDENTITY, PCO-APPLICABILITY |
| `DEL-BAY-PACK` | Assemble one coherent construction-bay review issue | ADE-DETAILS, ADE-SCHEDULES, ADE-EVIDENCE, DEL-ISSUE-PROFILES |
| `EPR-BAY-REVIEW` | Obtain and disposition actual designer and contractor bay feedback | DEL-BAY-PACK |
| `DPL-SITE-BRIEF` | Derive owner-house plot criteria and evidence requirements | HRS-BASELINE |
| `DPL-COMMISSION` | Receive owner-nominated real plot and authorised assessment scope | DPL-SITE-BRIEF |
| `DPL-SITE-ASSESSMENT` | Assess actual site applicability and explicit adaptation choices | DPL-COMMISSION |
| `DEL-COMMISSION-PLAN` | Register grounded whole-house design construction and handover packets | DPL-SITE-ASSESSMENT, EPR-BAY-REVIEW |
| `PHY-03-ENGINEERING` | Structural floor-edge engineering option reduction | PHY-APPLICABILITY |
| `PHY-04` | Wall/ceiling movement-junction build and test | PHY-APPLICABILITY |
| `EPR-RH11` | Obtain and process competent Reference House reviews | EPR-REFRESH |
| `EPR-REFRESH` | Refresh current-house review briefs and questions | HRS-BASELINE, BCR-PREFLIGHT |
| `PHY-APPLICABILITY` | Reconcile prototype applicability and earned evidence requirements | HRS-BASELINE, BCR-PREFLIGHT |
| `DEL-CURRENT` | Reconcile selected-house delivery and reinstatement requirements | BCR-CONVERGENCE |

### Structural critical path

`ROF-01` → `ROF-02` → `ROF-05` → `ROF-06` → `ROF-07` → `ROF-RWT-GATE` → `TRIAD-GATE` → `MRA-01` → `MRA-04` → `BCR-CONVERGENCE` → `MRA-05` → `HRS-SYNTHESIS` → `PLT-FINAL-PREP` → `PLT-PRINT-REVIEW` → `PLT-FINAL-FREEZE` → `EDA-RENEWED` → `PUB-02-FINAL`

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
| **Public architectural position** | **M4** | 2026-10-19 | 12 | fresh against PCO evidence baseline |
| **Pattern language** | **M4** | 2026-10-12 | 4 | fresh against PCO evidence baseline |
| **Architectural grammar framework** | **M3** | 2026-10-12 | 3 | fresh against PCO evidence baseline |
| **G-01 grammar instance** | **M4** | 2026-10-14 | 9 | fresh against PCO evidence baseline |
| **Reference House** | **M3** | 2026-10-19 | 9 | **STALE — reassess** (`docs/reference-house/README.md`) |
| **Physical prototypes** | **M2** | 2026-10-12 | 3 | **STALE — reassess** (`docs/development/tectonic-prototype-programme.md`) |
| **External professional review** | **M1** | 2026-10-12 | 3 | fresh against PCO evidence baseline |
| **Computational track** | **M4** | 2026-10-19 | 45 | fresh against PCO evidence baseline |
| **Evidence / precedent research** | **M3** | 2026-10-12 | 3 | fresh against PCO evidence baseline |
| **Publication** | **M4** | 2026-10-28 | 17 | **STALE — reassess** (`docs/editorial/eda-programme.md`) |
| **Deployment / real-site integration** | **M4** | 2026-10-27 | 48 | **STALE — reassess** (`project/dpl/deployment-programme.md`) |
| **Delivery** | **M2** | 2026-10-28 | 5 | **STALE — reassess** (`docs/delivery/README.md`, `project/del/delivery-programme.md`) |

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
| **Computational track** | **M4** | 2026-10-19 | The bounded Reference House executable sequence remains closed PASS through RH-C5 and CH-00 through CH-08 remain complete. The intentional HFI stair rewind has propagated through the controlled semantic source and deterministic projections; RH-C5 now checks the selected 300 mm going while HFI-09C/09D explicitly refuse to turn that project preference into a universal human-factors or statutory rule. | Hold this bounded compiler as the controlled baseline. There is no standing CH-09 or RH-C6; future computational capability should be demand-led by external review, physical validation, DPL target/site work, a real project, newly authoritative inputs or another concrete proof family. M5 requires appropriate external validation of the computational proposition at its stated scope. |
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
