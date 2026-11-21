# PLT — refurbishment handoff and physical-review boundary

**State:** current digital capability complete; final preparation, physical review and freeze remain open
**Owner:** PLT — Architectural Plate Refinement, parent #422
**Cross-stream control:** [Refurbishment plan](../refurbishment-plan.md)

This record makes the existing current-source, integration and physical-review obligations executable as bounded packets. It does not add new proof requirements, repair drawings or record a physical verdict. The [current-source record](../../docs/publication/architectural-plate-current-source-and-rollout.md) and [candidate admission/handoff](../../docs/publication/architectural-plate-candidate-admission-and-handoff.md) retain the candidate facts, role dispositions and source limitations. Historical DRW/PLT release and specimen identities remain unchanged.

## Owner's final design acceptance — proposed 14 November 2026

The owner requires a **design verdict**, distinct from the existing physical BOOK/WALL **print-quality** verdict. After `PLT-FINAL-PREP`, prepare the actual current-house drawing set, representative interior-kit details and assembled rendered Working Edition for personal review. Show floor/wall panels, metal grates, skirting, window/door frame/junctions and room images at intelligible scale; attach a versioned **delta** from the earlier owner-accepted `HAD-OWNER-DESIGN-REVIEW` pack. The owner may accept, request changes or reject the final design. Silence and previous technical packet completion are not approval.

The registered manual packet `PLT-OWNER-FINAL-DESIGN-ACCEPTANCE` must precede `PLT-FINAL-FREEZE`; return substantive architecture changes to IAS/HAD/OAS/STR/BCR/HRS rather than cosmetically altering drawings. The [workable-interior plan](../ias/workable-interior-design-plan.md) defines the review scope and the [canonical graph](../control/graph.md) governs delivery order. The existing `PLT-PRINT-REVIEW` and `PUB-02-FINAL` manual gates remain separate.

## Packet sequence

| Node | Dispatch | Dependencies | Bounded result |
|---|---|---|---|
| PLT-CURRENT-REVIEW | Complete; [digital result](current-review-digital-closeout.md) | BSR-ROOT | Complete the remaining candidate representation capability, source-consistent review pack and explicit handoff. Retain and cite useful partial evidence; no physical acceptance is inferred. |
| PLT-FINAL-PREP | Self-service | HRS-SYNTHESIS, PLT-CURRENT-REVIEW, CCR-CURRENT-RELEASE | Prepare the source-reconciled candidate publication integration, role dispositions, complete source delta and final print-review files. No release or final freeze. |
| EDA-RENEWED | Self-service | PLT-FINAL-PREP, EDA-ADAPTER | Audit the integrated digital source and typeset object before final freeze; no physical or owner verdict is inferred. |
| PLT-PRINT-REVIEW | Manual | PLT-FINAL-PREP | Process the actual owner BOOK/WALL print verdict, bound to the prepared source/object. Material revise/reject findings require repair and acceptance of affected reprints. |
| PLT-OWNER-FINAL-DESIGN-ACCEPTANCE | Manual | PLT-FINAL-PREP | Receive the owner's actual final book and design verdict on the versioned prepared object. |
| PLT-FINAL-FREEZE | Self-service | PLT-FINAL-PREP, PLT-PRINT-REVIEW, PLT-OWNER-FINAL-DESIGN-ACCEPTANCE, EDA-RENEWED | Verify that current source still matches accepted evidence; complete atomic publication integration, freeze/release and normal closeout. |
| PUB-02-FINAL | Manual | PUB-02-PREP, EDA-RENEWED, PLT-FINAL-FREEZE | Retain the final owner-controlled manufacture/release decision after editorial assurance and actual freeze. |

The [digital closeout](current-review-digital-closeout.md) and [artifact index](current-review-artifacts.json) reconcile the retained candidate work and exact review files. Requeueing PLT-CURRENT-REVIEW did not erase its completed candidate work. It separates the remaining digital packet from the physical judgement it cannot autonomously provide. Do not retain an idle agent lease while awaiting physical evidence; leave a durable handoff and release normally.

## Current-source preparation

PLT-FINAL-PREP consumes the single HRS source handoff and its expressly retained unresolved obligations. Reconcile plans, sections, elevations, roof, services/analytical readings, isometrics, captions and associated implementation descriptions to that source. A historical figure may survive only with unambiguous historical applicability.

Record material source changes and propagate them to every affected drawing. A current plan with an old technical overlay is not a coordinated set. Classify representational versus architectural differences from v1; route architectural defects to their existing owner instead of repairing them cosmetically.

Preparation must account for retained, merged, omitted and replaced roles without losing their obligations. Assemble the proposed full-publication sequence so the print review can judge the actual plate/text relationships. Candidate integration and review files do not promote the frozen register or claim drawing-publication-v2 acceptance.

## Manual physical verdict

PLT-PRINT-REVIEW requires owner-supplied actual-size evidence. Agents may prepare the review pack and process the reported verdict; they cannot manufacture it from screen inspection, generated PDFs, scale assertions or font checks.

Preserve the already required BOOK, A2 WALL and selected A1 review, including facing pages, spreads, gutters and the established viewing distances. No new physical test is introduced here. Record the inspected source/object identity, formats, material qualifications and keep/revise/reject findings.

Prior candidate acceptance carries forward only where the final object has no material change affecting the accepted reading. Changed geometry, scale, placement, fold interaction or graphic hierarchy requires the affected review to be repeated. A material revise/reject verdict is not node completion: repair the relevant candidate, regenerate the affected evidence and obtain acceptance before final freeze.

## Final integration and release

PLT-FINAL-PREP integrates manuscript descriptions and captions, placement anchors, the drawing register and generated views, then rebuilds and inspects the full publication's prose/plate rhythm, facing pages, gutters, fonts and scales. EDA-RENEWED audits that prepared digital source and typeset object before final freeze, independently of the human print and owner design verdicts. No mixed current/historical set may be labelled final.

After renewed editorial assurance and the applicable physical-print and owner design acceptance, PLT-FINAL-FREEZE verifies that the accepted source/object still matches the intended release. Only then freeze source/token identities, create and verify drawing-publication-v2 and reconcile PLT-owned issue, branch and evidence residue under the existing closeout rules. A material editorial, layout or design change reopens the affected evidence before manufacture.

PLT does not certify structural, moisture, fire, environmental, product, service or site adequacy. It carries the source owners' results and explicit unknowns faithfully. PUB retains the final manual manufacture/release gate.
