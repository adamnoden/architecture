# ADE — construction information for the owner's house

**Tracking:** [#1008](https://github.com/adamnoden/architecture/issues/1008). This is a bounded successor to completed internal representation work [#812](https://github.com/adamnoden/architecture/issues/812); its original closeout remains historical and valid at that scope. Governing purpose: [owner-house charter](../owner-house-charter.md). Delivery route: [DEL plan](../del/owner-house-delivery-plan.md).

## Workable-interior drawing obligation — 14 November 2026

The owner expects to **inspect actual designed and dimensioned physical interfaces**, not merely a schematic promise of cassette windows or accessible floors. The pre-site [IAS workable-interior plan](../ias/workable-interior-design-plan.md) requires source-owned room-specific modular floor grids, wall panel elevations, removable skirting and metal grates, shown in representative **1:5 assemblies and enlarged 1:2/1:1 joints**, plus section/plan/axonometric connections to window/door reveals. ADE must consume the **owner-selected** versions when developing the front window/wall/floor technical bay and its schedules. Its selected-bay outputs must not silently retain IAS-03's earlier continuous-plaster/floor default after the owner chooses otherwise.

ADE's existing one-bay scope remains a **construction-information demonstration**, not an implied complete set of whole-house fabrication sheets. HRS/PLT should nevertheless include the coherent representative interior kit in the Reference House and book. Actual product/shop drawings, supplied finishes, complete engineering calculations, site/cost and construction issue remain under the later DEL commission route. The [registered workable-interior sequence](../ias/workable-interior-design-plan.md) puts owner selection and detailed interior evidence before the technical bay work.

## Early executable model foundation — 15 November 2026

The [current-house integration programme](../ccr/current-house-integration-programme.md) supersedes the former requirement to wait for HRS-TECHNICAL before starting ADE-MODEL. Implement read-only source/assembly/component views as soon as CCR-CURRENT-SOURCE exists, preserving provisional/candidate status. Final technical acceptance remains on ADE-DETAILS/SCHEDULES/EVIDENCE through HRS-TECHNICAL and the selected bay. Do not confuse early model integration with adoption of unresolved design.

The future browser editor and the CLI must consume the same serialisable model and semantic edit/diagnostic contracts. ADE is a representation/output consumer, not an independent geometric authority. Parameter perturbation and source-to-view/schedule consistency are implementation acceptance tests, not optional future hardening. The later CCR-CURRENT-RELEASE audit must include these actual bay outputs before final publication preparation.

## Scope

Make one current-house construction bay's information dependable across drawings, schedules, specifications and evidence before generalising to a whole-house issue system. Existing orthogonal geometry and authored-section capabilities are the starting point. Do not claim a full 3D solid model, arbitrary CAD, integrated engineering solver, BoQ or exchange pipeline merely because drawings can be produced.

CCR owns the reusable current-source/compile migration; HRS-TECHNICAL owns selected technical applicability. ADE consumes their actual results and extends the smallest necessary interfaces. External specialist models/calculations can remain authoritative through controlled, explicit input/output and evidence contracts.

## Packets

| Node | Inputs / scope | Required evidence and acceptance |
|---|---|---|
| ADE-DELIVERY-AUDIT | Current code, architectural-drawing contracts, publication/inspection split, charter and DEL intent | `project/ade/delivery-audit-result.md`: historical audit of capability and gaps. Its late ADE-MODEL sequencing is superseded by this early-foundation direction; no speculative universal engine |
| ADE-MODEL | Completed audit and CCR-CURRENT-SOURCE, before final technical selection | `project/ade/model-integration-result.md`: working stable IDs and read-only current-source interfaces across bay geometry, assemblies and openings; no copied competing dimensions. Provisional and accepted objects remain distinct. Demonstrate opening/assembly edits propagate consistently and removed/renamed objects fail referential checks. Preserve authored section scope |
| ADE-DETAILS | Model contract, BCR-BAY-DESIGN and HRS-TECHNICAL | `project/ade/detail-output-result.md`: working dimensioned selected-bay plan/section/detail outputs, source-bound annotations and cross-references, layers/tolerances/access geometry, legible at declared scales. Visual inspection plus cross-view change checks. Nominal geometry cannot masquerade as selected construction |
| ADE-SCHEDULES | Model contract, BCR-BAY-DESIGN and HRS-TECHNICAL | `project/ade/schedule-output-result.md`: reproducible selected-bay assembly/opening/component/penetration schedules and bounded quantities linked to specifications. Define inclusion, units, wastage/exclusions and product status. Change a component and reconcile schedule/drawing; no unearned whole-house cost plan |
| ADE-EVIDENCE | Audit, model, BCR-BAY-DESIGN, HRS-TECHNICAL, CCR-IDENTITY and PCO-APPLICABILITY | `project/ade/evidence-integration-result.md`: bind actual selected checks and external evidence to controlling values, units, method/source versions and limits. Geometry changes invalidate dependent evidence; unrelated presentation changes do not. Missing/unsupported evidence prevents stronger issue claims. Reuse tested numeric methods and independently check new ones |

These are implementation packets. A document describing a future feature does not complete ADE-MODEL/DETAILS/SCHEDULES/EVIDENCE. Each result records changed source, executable checks, mutation tests, rendered/sample artefacts, limitations and downstream handoff. Stage-specific acceptance profiles come from DEL; the implementation must not silently redefine them.

## Parallel ownership and integration

ADE-MODEL owns its shared read-only view/identity contract and integrates first. ADE-DETAILS and ADE-SCHEDULES own separate output modules; ADE-EVIDENCE owns evidence adapters and tests. Shared source changes return to the owning model authority and are integrated serially. Generated manifests are regenerated from combined main, not resolved by keeping stale outputs.

DEL-BAY-PACK composes the outputs. EPR-BAY-REVIEW obtains actual practitioner feedback. Whole-house expansion and exchange formats are selected under DEL-COMMISSION-PLAN from real delivery needs. The compiler need not reimplement every engineering method, but every active current output must have a truthful shared-source/dependency contract. Passing internal checks is never structural, regulatory or construction acceptance.
