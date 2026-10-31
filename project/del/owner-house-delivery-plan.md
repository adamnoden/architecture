# Owner-house delivery plan

**Purpose:** implement the [owner-house charter](../owner-house-charter.md) through existing workstreams. **Tracking:** DEL [#854](https://github.com/adamnoden/architecture/issues/854). This plan adds a delivery route; it does not claim an actual plot, commission, budget, engineering approval or construction readiness.

## Route and stopping points

| Stage | Concrete outcome | Execution / trigger |
|---|---|---|
| Brief and feasibility | Owner requirements, open decisions, cost/programme questions and a usable plot brief | DEL-BRIEF; DPL-SITE-BRIEF; existing HAD/BCR studies |
| Repair and coordinate the current house | One current design and honest technical applicability | Existing HRS-BASELINE, CCR, TRIAD, BCR, MRA and HRS-TECHNICAL |
| Demonstrate one construction-information slice | One selected bay whose design, drawings, schedule, specification and evidence agree | BCR-BAY-BRIEF / DESIGN; ADE successor packets; DEL-BAY-PACK |
| Test usefulness with real practitioners | Competent design/build feedback with dispositions, including rejection or conventional fallback | EPR-BAY-REVIEW, manual; relevant PHY tests remain separate |
| Establish actual site and project basis | Owner-nominated plot and authorised evidence-led assessment, then explicit adaptation findings | DPL-COMMISSION, manual; DPL-SITE-ASSESSMENT |
| Plan the actual commission | Stage-specific drawing/specification/calculation register, design responsibilities, budget/evidence gaps and bounded execution packets | DEL-COMMISSION-PLAN after the site assessment and reviewable bay package; practitioner feedback may remain outstanding |
| Develop and issue the site-specific design | Coordinated architectural/engineering/specialist information, relevant applications and reviewed construction issue | Decompose under the actual commission plan; actual approvals and issue authority stay manual |
| Procure, build and commission | Selected procurement, accepted substitutions, inspected work, tests and commissioning records | Future real-world stage, activated by owner and appointed team |
| Handover and occupation | As-built information, maintenance instructions, aftercare and evidence from use | Future real-world stage; book conclusions may be updated from findings |

Stages are outcomes, not claimed RIBA appointments or certification. A plot may be considered, advisers involved and real design work progressed before this software route is complete. The bay is a proving exercise for information production, not a prohibition on other professionally coordinated delivery routes. Its review may adopt a simpler conventional/external-tool route.

Do not pre-create dozens of fictitiously executable construction tasks before the plot, procurement and design responsibilities exist. DEL-COMMISSION-PLAN must register those tasks when grounded, with distinct agent preparation and manual decisions. The master DEL issue must remain open while the admitted owner-house delivery scope is unfinished; completion of the present planning packets is not completion of the house.

## DEL packet contracts

### DEL-BRIEF — owner/project brief, independent

Read the charter, current Reference House brief/constraint ledger and HAD results. Prepare `docs/delivery/owner-project-brief.md` and `project/del/owner-brief-result.md`: priorities for living, architectural quality, maintenance, accessibility/change, resources, procurement and programme. Distinguish confirmed instructions, inherited study assumptions, proposals and questions for the owner. Link controlled room/geometry facts rather than copying them. Reconcile contradictions by recording the owning decision, not silently settling them.

Exit: every material unknown has the decision it affects, owner and latest useful decision point. A draft may complete with explicit unknowns; it must not claim owner acceptance, a cost ceiling, household facts or a delivery date that have not been supplied. This does not delay independent repair work.

### DEL-ISSUE-PROFILES — purpose-specific information requirements, independent

Produce `docs/delivery/information-issue-profiles.md` and `project/del/issue-profiles-result.md`. Define the information needed for concept review, planning preparation, coordinated technical review, tender/pricing, construction issue and as-built/maintenance handover. Each profile names its audience, document/register requirements, revision basis, evidence/approval needs, tolerable unknowns and responsible issuing authority. Tailor actual submission requirements later to the selected project.

Keep normative compiler targets separate from these issue profiles. Define machine-checkable completeness versus human acceptance; a complete register is not a build approval. Exit: a worked example distinguishes a valid review issue from an invalid construction issue using the same incomplete information. This packet specifies the delivery contract; ADE implements only the bounded checks the bay actually needs.

### DEL-BAY-PACK — coherent review issue

Consume the BCR bay design, ADE detail/schedule/evidence outputs and issue profiles. Assemble a reproducible review package and `project/del/bay-pack-result.md`, with a document index, shared revision, specifications, material/quantity basis, replacement sequence, evidence register, open questions and targeted reviewer questions. Keep missing specialist evidence visible. Include a credible conventional comparator using existing BCR proportionality work where applicable.

Exit: all represented facts agree; links/identities resolve; the package can be regenerated and is clearly issued for review, not construction. State which decisions a designer/contractor can evaluate and price and which remain impossible without more information. Do not invent market quotations. Professional responses belong to EPR-BAY-REVIEW.

### DEL-COMMISSION-PLAN — grounded expansion to the full house

After DPL-SITE-ASSESSMENT and DEL-BAY-PACK, produce `project/del/commission-execution-plan.md`. Convert the actual site/adaptation findings and reviewable information route into the whole-house deliverable register and bounded DAG packets. Consume available EPR-BAY-REVIEW findings; when feedback is still outstanding, name the affected decision, responsible evidence route and latest useful review point. Preparing the plan does not accept the unreviewed package or complete EPR-BAY-REVIEW. Cover site/setting-out, foundations/structure, envelope/roof, wet rooms, stairs/openings, services, performance calculations, specifications/schedules, procurement, commissioning, handover and maintenance; identify any item not applicable with a reason.

Allocate design responsibilities and actual issue/approval authority. Record owner acceptance needed for brief/cost/procurement choices and all outstanding specialist evidence. Separate tasks that agents can execute from commissioned work and actual approvals; add links/issues and graph nodes without claiming those activities complete. Reuse existing authoritative CAD/BIM/engineering outputs where appropriate; justify any new engine capability by the required deliverable.

Exit: another session can see the next executable work, every remaining material deliverable, its responsibility and evidence dependency, and the route through construction and occupation. This is a commission plan, not a technical design result or permission to build.

## Interfaces with existing programmes

- HAD/IAS/OAS retain design authorship. BCR owns construction questions; MRA owns deep moisture assurance; ROF/RWT retain roof/water selection. No new design authority is created here.
- HRS-TECHNICAL supplies current technical migration. ADE must extend it rather than create another competing house model. HRS-SYNTHESIS remains the final book-house reconciliation; it is not a hard prerequisite of this delivery route.
- EDA uses the enquiry to improve the book and distinguish personal choices from transferable findings. Publication release and actual house delivery are independent outcomes; neither may manufacture the other's evidence.
- PLT owns book/wall presentation. ADE owns reusable drawing/information capability; DEL owns issue purpose and information requirements. A construction sheet need not use the book's visual density or composition.
- DPL owns site/target applicability. Earlier conditional DPL results remain historical; the successor does not reopen RSI or authorise property search.

## Swarm boundaries

All near-term packets are registered in `project/control/nodes/house-delivery.ts`. Normal leases and current-main checks apply. Parallel packets own separate result paths and source modules; they must not concurrently edit selected house geometry, a shared document index or generated manifests. BCR integrates selected bay design; ADE-MODEL integrates identity/schema changes before downstream parallel output work; DEL-BAY-PACK integrates the package. Rebase/regenerate shared projections serially after each source merge.

No invented percentages, whole-house PASS, general compliance certification or physical completion. Rejected provision, conventional fallback and a documented unsupported condition can be legitimate findings; an unresolved essential design decision cannot be hidden as completed construction information.
