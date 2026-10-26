# Project Status

**Canonical project-wide status overview**  
**Last updated:** 2026-10-26

**Current phase:** **drawing-engine uplift / editorial assurance / real-site evidence recovery / gated private-publication production**

This page records the current state, next meaningful work and principal risks. Detailed programme histories and gate records remain with their owning workstreams.

The public architectural position and publication remain internally controlled at M4; the Reference House remains M3 at virtual-design scope. Active work now includes ADE drawing-engine capability, EDA editorial assurance and DPL real-site evidence recovery. PLT v2 waits for ADE migration; TYP has an accepted production release. Final private-object manufacture remains gated by **both EDA close and the independent PLT drawing freeze**. No maturity level or machine-readable authority ceiling is raised by this reconciliation.

DPL retains its bounded M4 claim scope while its execution programme remains in real-site trials. Evidence recovery, candidate-readiness work and passing internal checks do not establish whole-site compatibility, construction adequacy or regulatory approval. Physical prototypes and competent professional review remain major unclosed evidence routes.

## Active now

### Reference House

The Reference House remains **M3 — Coordinated at virtual-design scope**. RH-00 through RH-10 are coordinated, RH-11 is issue-ready, and the 300 mm principal-stair going remains an explicit project preference rather than a statutory or universal ergonomic minimum.

The next value comes from competent RH-11 review and the P03/P04 physical-validation work. Existing RH-C and compiler results remain internal model-control evidence, not construction validation.

### Computational implementation

The bounded Reference House computational track remains **M4 — Internally validated / controlled** through RH-C5 and CH-08. There is no standing RH-C6 or CH-09. New computation must be demand-led.

The DPL runtime is a separate demand-led track. Its current execution frontier is recorded in the [deployment programme](project/dpl/deployment-programme.md). COA-00 through COA-06 are complete; no generic compiler expansion is authorised by the active ADE or DPL packets.

### Publication

The publication workstream remains M4. DRW v1 remains a frozen historical release. [TYP](docs/publication/publication-typography-v1-release.md) has an accepted RC2 release and supplies the typography contract to PLT and PR-02.

**ADE — Architectural Drawing Engine capability uplift** is active under [#812](https://github.com/adamnoden/architecture/issues/812). ADE-04A/ADE-04B are merged, and [ADE-05B](docs/publication/architectural-drawing-engine-ade05b-partition-adjacency.md) has selected the deliberately non-physical unresolved partition-datum and adjacency grammar. Physical partition bodies remain gated by **ADE-05A / [#834](https://github.com/adamnoden/architecture/issues/834)**; no print tokens are frozen. ADE-06 physical capability proof and ADE-07 migration remain downstream.

**EDA — Editorial Doctrine Audit** is active under the [EDA programme](docs/editorial/eda-programme.md). EDA-00 has frozen Editorial Doctrine v0.4 and EDA-01 has established the corpus/prose-mode register. **EDA-02 — mechanical candidate scan is next.** EDA is post-migration assurance rather than another general rewrite; its close is required before PR-02 private physical-object production.

**PLT — Architectural Plate Refinement** remains open under [#422](https://github.com/adamnoden/architecture/issues/422), but is **blocked by ADE-07 migration**. The [ADE-00 consequence](docs/publication/architectural-drawing-engine-ade00-audit.md) supersedes the older PLT-03B.1 physical-review handoff: the existing candidate is no longer eligible for final owner acceptance, token extraction or rollout. The A2 true-1:50 composition finding survives. Rebuild through ADE, then restart physical review before exemplar/token freeze.

**PUB-01 / PR-02** remains under [#71](https://github.com/adamnoden/architecture/issues/71). Paper, trim, book-block and printer/binder preparation may proceed using the accepted typography contract; final 12-copy manufacture requires **both EDA close and the independent PLT drawing freeze**. PR-03/PR-04 independent criticism follows the private object and remains required before M5 or public-release claims.

### Deployment / real-site integration

DPL remains M4 at its existing bounded claim scope. The [current programme](project/dpl/deployment-programme.md), owned by [#299](https://github.com/adamnoden/architecture/issues/299), records DPL-01 through DPL-14 complete and DPL-15 active.

[DPL-15F](project/dpl/dpl-15f-rp006-residual-recovery.md) is complete. The bounded no-spend RP-006 recovery routes did not satisfy R1 controlled spatial identity, R2 footprint-test geometry, R4 datum/level evidence or R5 physical access/street geometry. R3 orientation and R6 site-identity coherence remain satisfied. **RP-006 therefore remains 2/6 ready, candidate authoring remains prohibited, and the empirical corpus remains 0 of 8 candidate-ready sites.**

**Current gate: DPL-15G — RP-007 / RP-008 categorical no-spend path comparison**, under [#865](https://github.com/adamnoden/architecture/issues/865) / [PR #867](https://github.com/adamnoden/architecture/pull/867). The comparison is categorical rather than scored and may select at most one bounded next evidence-acquisition target. PR #867 currently proposes RP-007, but that selection is **not canonical until the PR merges**. DPL-16/17/18 remain held behind their explicit evidence gates.

The [Lennard DPL-T11 control](project/dpl/dpl-t11-lennard-no-spend-evidence.md) remains at its no-spend boundary. Structural concept review, authoritative EA data recovery and measured boundary/maintenance geometry remain dependencies; the control is excluded from the empirical sample. No external contact, commissioning or spend is authorised by this status update.

### Physical and professional validation

Physical prototypes remain M2 and competent external review remains M1. P03/P04 and the RH-11 review pack remain the most important evidence routes outside DPL. Internal M4 control is not external proof.

### Delivery

Delivery remains M2. [DEL — Delivery requirements](project/del/delivery-programme.md) frames the existing brief and modules as one evidence-dependent effort under [#854](https://github.com/adamnoden/architecture/issues/854). Manufacturing remains a strategy unless a concrete assembly decision earns delivery work; architectural specificity remains a standing boundary rather than a new packet programme. DEL does not override the EDA or PLT production gates.

The [validation execution register](docs/development/validation-execution-register.md) owns RH-11 [#32](https://github.com/adamnoden/architecture/issues/32), P03 [#30](https://github.com/adamnoden/architecture/issues/30) and P04 [#31](https://github.com/adamnoden/architecture/issues/31). Review briefs are ready/unissued; P03 geometry requires engineering before structural testing, and P04 requires physical construction and testing. P01 remains held optional research under [#856](https://github.com/adamnoden/architecture/issues/856); P02 remains held without a current house dependency under [#857](https://github.com/adamnoden/architecture/issues/857).

## Maturity and workstream status

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
| **Publication** | **M4** | 2026-10-26 | PR-00, PR-01, PUB-SAN and PUB-NOM remain complete; DRW v1 remains frozen. TYP has an accepted RC2 production release. PLT v2 remains open but its previous ground-plan candidate is not eligible for final physical acceptance. ADE-04A/ADE-04B are merged, and ADE-05B has selected the deliberately non-physical unresolved partition-datum and adjacency grammar; physical partition bodies remain gated by ADE-05A. EDA is now the active post-migration editorial assurance programme: EDA-00 froze Editorial Doctrine v0.4, EDA-01 established the corpus/prose-mode register, and EDA-02 is next. No print tokens are frozen and EDA close is required before PR-02 private physical-object production. | Resolve ADE-05A upstream Reference House internal-partition authority, then complete ADE-06 capability/physical proof before ADE-07 migrates the Reference House ground plan and restarts PLT-03 physical review. In parallel continue EDA from EDA-02 through typeset closeout. PR-02 preparation may consume the accepted typography contract, but final private-object manufacture waits for both EDA close and the independent PLT drawing freeze. PR-03/PR-04 independent criticism remains required before M5 or public-release claims. |
| **Deployment / real-site integration** | **M4** | 2026-10-26 | The M4 claim ceiling remains bounded canonical synthetic integration, controlled SCREENING owner/readiness composition and the canonical DPL-RS-01 UNRESOLVED result scope; later execution does not silently widen it. The programme has completed DPL-01 through DPL-14 and is active at DPL-15 empirical trials. DPL-15F has now exhausted the bounded no-spend RP-006 residual routes without satisfying R1/R2/R4/R5; RP-006 remains 2/6 ready, candidate authoring remains prohibited and the corpus remains 0 of 8 candidate-ready sites. DPL-15G is the active categorical RP-007/RP-008 path-comparison gate under #865 / PR #867. The Lennard instrumented control remains excluded from empirical sampling. Whole-site compatibility, incompatibility, route exhaustion and regulatory/construction adequacy remain unadmitted. | Complete DPL-15G without scoring sites or laundering planning/marketing evidence into readiness authority. If the gate lands with one selected site, perform only the bounded site-specific evidence-acquisition packet it authorises; candidate authoring remains subsequent unless R1–R6 become fully and deterministically satisfied. Keep DPL-16/17/18 held pending their explicit evidence gates; external Lennard judgement and measurement require separate acquisition. |
| **Delivery** | **M2** | 2026-10-26 | DEL frames coordination of the existing implementation brief, maintenance and human-factors modules under GitHub umbrella #854. N17 carries finished-interface verification into RIBA 3/4 as appropriate, while delivery requirements remain intentionally incomplete and evidence-dependent. | Use DEL #854 to inventory requirement readiness, responsible disciplines, stage gates and evidence dependencies. Populate modules only as architectural, DPL, professional-review and physical-validation decisions mature; retain manufacturing strategy as guidance unless a concrete assembly earns delivery work. |
<!-- maturity-status:end -->

## Principal risks

**Deployment authority.** Law, guidance, planning policy, site facts, professional judgement and project preference must not collapse into one machine result. Unknown evidence must remain unknown; England/London targets must not become doctrine; and incompatibility must remain an acceptable result rather than forcing the Reference House to mutate until every plot fits.

**Candidate/conformance overreach.** DPL must evaluate authored architecture, not become an optimiser or hidden parametric-house generator. One failed candidate is not site incompatibility, and selecting a next evidence target is not candidate readiness.

**Readiness and result overreach.** Candidate-authoring readiness is not compatibility. RP-006 remains unready at 2/6, the empirical corpus remains 0 of 8 ready, and instrumented controls must stay excluded from that sample. Neither positive compatibility nor incompatibility follows from a reduced blocker count.

**Editorial assurance.** The existence of a hardened Editorial Doctrine does not prove manuscript conformance. EDA must finish the corpus audit, whole-book recurrence pass, adversarial read and typeset proof before private-object production.

**M4 scope drift.** Later DPL execution does not silently expand the declared M4 proposition into general multi-site validity, real-site deployability, regulatory compliance or construction adequacy.

**Physical and professional evidence.** Internal control does not prove structural, fire, MEP, building-physics or construction adequacy. P03/P04 and competent RH-11 review remain material evidence gaps.

**Architectural authority drift.** Repetition of the Reference House can make its Georgian grammar, courtyard form, masonry family, low-slope roof, ASHP/PV or 300 mm stair preference appear universal. Generalise the reason; keep project choice local.

**Publication freeze integrity.** DRW v1 and accepted TYP remain protected baselines. ADE/PLT successor work must preserve semantic authority and earn physical acceptance; the older PLT candidate cannot bypass ADE migration. PR-02 final manufacture must not precede either EDA close or the PLT drawing freeze.

## Closed or frozen tracks

- **HFI — complete.** All authorised packets are closed; surviving consequences live with their destination authorities.
- **G-01 v0.1 — controlled.** Reopen only on an explicit evidence trigger.
- **Reference House bounded compiler / CH — controlled.** RH-C1→RH-C5 and CH-00→CH-08 are closed at their stated proof scope.
- **DRW — complete and frozen.** Any later representational change requires explicit authority.
- **PUB-SAN / PUB-NOM — complete.** Their public-surface and naming constraints remain active.

## Status-maintenance rule

Update this page when a major workstream changes maturity, prototype or professional evidence changes a conclusion, the Reference House reaches a new integration state, a first-class programme opens/closes, or the recommended next work materially changes.

The maturity block is generated from `project/maturity.ts`; use `npm run status:update` after changing the typed maturity registry and commit the generated result together.