# Development and external-review gate audit

**PCO-REVIEW-POLICY · 31 October 2026.** Owner-directed audit of professional-review and external-audit waits. Baseline: `c9e9a2c0087ef4e18b5fa4527826767ba4f0c8bd`; all 28 open issues and the canonical node graph inspected. Question: which waits unnecessarily prevent rigorous internal work, and which protect a distinct evidence claim or real-world action?

## Decision

The [owner-house charter](../owner-house-charter.md#development-and-assurance--31-october-2026) now separates development completion from acceptance for the affected use. Agents must perform substantive primary-source research, reproducible analysis and adversarial internal review, reach a reasoned recommendation and make residual uncertainty useful. A generic professional referral is not a stopping condition. A missing measurement, physical result, required approval or justified specialist check remains a scoped obligation with an affected decision and resolution point.

This is a work-scope change, not a finding that any engineering proposal is sound. Internal review is not external assurance; completed investigation is not accepted design. No maturity rating changes.

## Audit and changes

| Route | Finding | Disposition |
|---|---|---|
| PHY-03-ENGINEERING / #30 | Option reduction is manual even though the applicability prerequisite is complete | Make the internal research/calculation/options package self-service. Preserve competent structural/specimen release under ER-STR-01 / EPR-RH11 before loaded testing or verified structural reliance. Reconcile the PHY programme, applicability notice and execution register. |
| EPR / #913 and #32 | Preparation exists, but no executable internal route answers the five discipline briefs | Add EPR-DESK-REVIEW after EPR-REFRESH. Require technical answers, source-bound calculations, failure/contrary-evidence checks and dispositions. Keep actual external responses as the separate manual EPR-RH11 deliverable. |
| DEL-COMMISSION-PLAN / #854 | Planning waits for EPR-BAY-REVIEW even when pending feedback could be registered | Replace that dependency with DEL-BAY-PACK; retain DPL-SITE-ASSESSMENT. Consume received feedback or carry its scoped acceptance obligations into the plan. EPR-BAY-REVIEW stays open/manual. |
| BCR, MRA and HRS / #944, #959, #945 | BCR already consumes completed review/applicability preparation, not the whole external review programme; remaining graph waits are internal design/technical integration | Keep genuine design dependencies. Clarify the common policy in the issue navigation without manufacturing a newly unblocked house. |
| PHY-04, PHY-01/02, actual-site nomination and physical print/manufacture gates | Actual evidence/actions, or optional experiments not earned by the current house | Retain their scope and manual/held status. A desk study cannot become a measured event, nominated plot or owner release. |
| PUB external critical circle and compiler audit | External criticism is separate from the current internal/private-edition route; compiler audit waits on design-source stability | No external-development edge to remove. |

Two bounded agent opportunities result: one existing manual packet becomes self-service and one new internal-review packet is added. Both prerequisites were complete at the audit baseline. This is eligibility, not completed technical work; live ACO ownership still governs acquisition. Commission planning loses a future external wait but still needs a real-site assessment and reviewable bay. The main house-design critical path is not shortened by pretending unresolved design work is external bureaucracy.

The floor-edge study starts from current STR/material direction. The historical timber/hanger comparison is retained as evidence, not imposed on the later non-timber brief. EPR reviews named accepted and trial sources separately and routes corrections to existing design owners; it does not adopt geometry through a review packet.

## Boundary evidence

The policy does not claim that every professional review is legally mandatory or that all review can wait until construction. [England's building-regulations duties guidance](https://www.gov.uk/guidance/design-and-building-work-meeting-building-requirements) addresses design competence as well as building work. [HSE's designer guidance](https://www.hse.gov.uk/construction/areyou/designer.htm) describes duties beginning with designs potentially used for construction. Both were inspected on 31 October 2026. Their relevance is the timing and accountability boundary; they do not validate a project design.

## Execution and verification

Owner-directed bootstrap uses the existing connector CAS exception: the new manual PCO-REVIEW-POLICY node is registered in this same change, with a create-if-absent lease on retained `runtime/claims`, verified UUID/generation and dedicated branch. Until registration merges, its previously unknown node may make new automatic dispatch fail closed. Existing design leases and source ownership are preserved. No alternative dispatcher, permission change or external appointment is introduced.

The regression contract exercises the actual dispatcher: internal floor-edge/review work remains eligible while external/physical evidence stays manual; commission planning is eligible after site/package prerequisites without practitioner feedback. Normal graph, repository and exact-head CI checks and fresh publication preflight apply. Validation results and merge identity are recorded in the implementing PR; generated status/graph projections come from their canonical renderer. Issue reconciliation does not close unfinished evidence or design work.
