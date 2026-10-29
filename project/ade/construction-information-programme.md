# ADE — construction information for the owner's house

**Tracking:** [#1008](https://github.com/adamnoden/architecture/issues/1008). This is a bounded successor to completed internal representation work [#812](https://github.com/adamnoden/architecture/issues/812); its original closeout remains historical and valid at that scope. Governing purpose: [owner-house charter](../owner-house-charter.md). Delivery route: [DEL plan](../del/owner-house-delivery-plan.md).

## Scope

Make one current-house construction bay's information dependable across drawings, schedules, specifications and evidence before generalising to a whole-house issue system. Existing orthogonal geometry and authored-section capabilities are the starting point. Do not claim a full 3D solid model, arbitrary CAD, integrated engineering solver, BoQ or exchange pipeline merely because drawings can be produced.

HRS-TECHNICAL owns the current-house migration; CCR owns admitted correctness repairs. ADE consumes their actual results and extends the smallest necessary interfaces. External specialist models/calculations can remain authoritative in their own disciplines with controlled references and revisions.

## Packets

| Node | Inputs / scope | Required evidence and acceptance |
|---|---|---|
| ADE-DELIVERY-AUDIT | Current code, architectural-drawing contracts, publication/inspection split, charter and DEL intent | `project/ade/delivery-audit-result.md`: map every needed bay deliverable to implemented capability, gap or external owner. Establish source/file ownership and minimal implementation contract, with explicit no-change/reuse options. No speculative universal engine |
| ADE-MODEL | Audit and HRS-TECHNICAL | `project/ade/model-integration-result.md`: working stable IDs and current-source interfaces across selected bay geometry, assemblies and openings; no copied competing dimensions. Demonstrate an opening or assembly change propagates consistently; removed/renamed objects fail referential checks. Preserve authored section scope honestly |
| ADE-DETAILS | Model contract and BCR-BAY-DESIGN | `project/ade/detail-output-result.md`: working dimensioned plan/section/detail outputs for the selected bay, source-bound annotations and cross-references, layers/tolerances/access geometry, legible at declared scales. Visual inspection plus cross-view change checks. Nominal geometry cannot masquerade as selected construction |
| ADE-SCHEDULES | Model contract and BCR-BAY-DESIGN | `project/ade/schedule-output-result.md`: reproducible selected-bay assembly/opening/component/penetration schedules and bounded quantities linked to specification records. Define inclusion, units, wastage/exclusions and product status. Change one component and reconcile schedule/drawing; no unearned whole-house cost plan |
| ADE-EVIDENCE | Audit, BCR-BAY-DESIGN, CCR-IDENTITY and PCO-APPLICABILITY | `project/ade/evidence-integration-result.md`: link actual selected checks and external calculation/evidence records to exact inputs, units, method/source versions and limitations. A controlling geometry change must mark the affected evidence for reassessment while an unrelated presentation change does not. Missing/unsupported evidence must prevent a stronger issue claim. Implement only calculations needed for this bay; independently check any new numeric method |

These are implementation packets. A document describing a future feature does not complete ADE-MODEL/DETAILS/SCHEDULES/EVIDENCE. Each result records exact changed source, executable checks, rendered/sample artefacts, limitations and downstream handoff. Stage-specific acceptance profiles come from DEL; the implementation must not silently redefine them.

## Parallel ownership and integration

ADE-DELIVERY-AUDIT identifies existing source owners and proposes separate output/evidence modules. ADE-MODEL owns shared contract changes and integrates them first. ADE-DETAILS and ADE-SCHEDULES then own separate output modules/artifact paths; ADE-EVIDENCE owns evidence adapters and tests. If they need a shared schema change, route it explicitly through the model owner and serialise integration. Generated shared manifests are regenerated from combined main, not resolved by keeping one worker's stale output.

DEL-BAY-PACK composes the outputs. EPR-BAY-REVIEW obtains actual practitioner feedback. Whole-house expansion and exchange formats are selected under DEL-COMMISSION-PLAN from the real team's needs. The compiler need not implement every engineering method itself; controlled external evidence is a valid route. Passing internal checks is never structural, regulatory or construction acceptance.
