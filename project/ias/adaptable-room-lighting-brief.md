# Adaptable room lighting and services

**Authority:** the owner's agreement and instruction to register and connect this package, 21 November 2026.  
**Tracking:** [#1614](https://github.com/adamnoden/architecture/issues/1614), within IAS [#941](https://github.com/adamnoden/architecture/issues/941) and HAD [#943](https://github.com/adamnoden/architecture/issues/943).  
**Execution:** `IAS-ROOM-LIGHTING`; lifecycle and dependencies belong to the [canonical graph](../control/nodes/architecture.ts), and live ownership to ACO.  
**Status:** authorised design development; no room scheme, service cavity, lighting product or physical result is selected by this registration.

## Decision to improve

Develop a useful, beautiful room whose lighting can change with furniture, tasks and occupants while the permanent building remains intact. Resolve the accessible electrical interface and test it through an inhabited Study, then challenge the approach with a demanding kitchen task. This is one bounded integration package within the existing interiors and house-design programmes, not a separate lighting workstream or a repeat of the broad research.

Use this provisional design rule:

> A room should be easy to relight without opening the permanent building.

The agreed working direction is **lamps as the default**, useful accessible electrical provision through the skirting/service system, optional replaceable wall-light modules and ceiling fittings where the room comparison justifies them. It is a preference to test against credible alternatives, not a ceiling-light ban or new universal doctrine. A complete panelled ceiling and acoustic-improvement system each need their own architectural justification.

## Starting authority and evidence

- [Lighting and accessible service-layer research](../../docs/research/lighting-and-accessible-service-layers.md) supplies the completed evidence synthesis and comparison questions. Its hypotheses remain distinct from this owner's direction and from future design findings.
- The [Crafted Room Kit brief](crafted-room-kit-brief.md), [result](crafted-room-kit-result.md) and [Study wall transition](crafted-study-wall-transition.md) supply the room ambition, prepared-room assumptions, complete lining, interfaces and removal operations. Retain their completed, bounded evidence; this successor does not silently reopen or supersede it.
- [IAS service/access evidence](ias-02s-services-access.md) supplies selective skirting routes, rises, independent service support and access duties. Route location does not determine socket height. Read the current house's actual services, furniture, openings and obstructions before drawing the proposed interface.
- The [current-house integration programme](../ccr/current-house-integration-programme.md) and [executable design contract](../../docs/computational/executable-design-contract.md) govern shared inputs and dependent outputs. Record the exact source revision at execution; do not use a dated rendering as current geometry.
- The [whole-house material policy](../../docs/reference-house/material-policy.md), [workable-interior approval plan](workable-interior-design-plan.md) and [owner charter](../owner-house-charter.md) retain their existing material, owner-choice and evidence boundaries.

## Deliverable 1 — a worked lighting comparison

Use the same current furnished Study, viewpoints, finishes and task assumptions for four competent arrangements:

| Arrangement | Question |
| --- | --- |
| Portable lighting | Can floor, desk and side-table lamps provide the intended room use with convenient controls and unobstructed routes? |
| Lamps with limited wall lighting | Does a small amount of fixed lighting improve arrival, general visibility or a named task enough to earn its installation? |
| Predominantly wall lighting | Can wall-mounted sources serve the room convincingly, including its central tasks, while remaining maintainable and adaptable? |
| Simple ceiling fitting plus lamps | What does an ordinary accessible ceiling fitting contribute, and what installation or maintenance burden does it actually introduce? |

Assess arrival in darkness, reading, desk work, cleaning, finding small objects, reaching controls, furniture rearrangement and ordinary light/driver replacement. Include a removed or failed lamp, disconnected automation and a changed finish or reflectance assumption. Compare task illumination, observer glare and reflections, shadows, surrounding brightness, daylight interaction, colour/dimming behaviour, visible equipment, leads and control convenience. Any numerical target must state its evidence, role and applicability. Missing product photometry or measurements stays explicit; attractive renders and nominal lamp output do not establish performance.

Then test a demanding central kitchen preparation/task location against the **current** layout, its fixed equipment and usable working positions. Preserve a credible fixed-lighting fallback. This is a check on transferability, not permission to redesign the kitchen or whole-house electrical system silently.

Recommend a room arrangement and explain where the working preference survives, changes or fails. State which findings are particular to the furnished Study and kitchen rather than a prescription for every room.

## Deliverable 2 — one coordinated service corner

Develop a representative wall/skirting corner that includes a reachable socket or rise, the panel/rail interface, an optional wall-light module and an adjoining door or reveal. Use real component envelopes or explicitly labelled project-designed requirements. Show:

- the permanent boundary, independently supported electrical enclosure/routing, fixed carrier and removable decorative assembly;
- useful socket and switch positions with actual plugs, leads, furniture, grip and use space;
- rails, fixings, boxes, cable bends, segregation and thermal/protection requirements that consume space;
- the light's complete support/load path, connector and driver access, isolation and removal sequence;
- first release, panel withdrawal, temporary support or parking, repair and reinstatement without destructive work to adjacent assemblies;
- dimensional consequences for the complete lining, room area, corners and reveals, together with maintenance and material-admission consequences.

Measure **total lining depth**, **gross stand-off behind the panel**, and **connected usable routing space** separately. The crafted kit's existing total lining is already allocated; it is not a spare electrical cavity. Explore the research's gap alternatives and a shallow general space with locally deeper provision as candidates, letting actual components and safe access determine the result. No one-inch gap or universal rail depth is selected here.

Keep the decorative light panel, its mechanical support and replaceable electrical parts distinct. A catalogue product or metal enclosure is not material-policy approval. Concealed insulation, binders, facings, seals, coatings and electrical parts retain their admission requirements; no safety function may be removed to achieve nominal material purity.

The cavity receives **no automatic acoustic credit**. Review plausible rattle, hollow response, resonance, rigid connections and flanking harm. Acoustic improvement remains outside this package's initial promise. Whole-ceiling panelling likewise remains a separately justified design question; compare the smallest useful ceiling support/access provision where ceiling lighting is considered.

## Deliverable 3 — source integration and trial-ready handoff

Keep the room arrangement, interface dimensions and dependent drawings/schedules on the current shared source route. Where new parameters or computations are warranted, show a relevant input change, an adverse or unsupported case and an unchanged control; make affected evidence invalidate explicitly. Do not invent a general lighting simulator or another house model merely for this package.

Record the result in `project/ias/adaptable-room-lighting-result.md`, linking its drawings, component/assumption schedule, comparison and exact source identities. Give existing principles and patterns a reasoned disposition: retain, qualify, update or propose a bounded candidate. Start with [Controlled Attachment Plane](../../docs/patterns/controlled-attachment-plane.md) and the existing service/maintenance sources. Neither this brief nor a convenient Reference House detail automatically creates doctrine or a new active pattern.

Include a concrete physical-trial checklist for the representative service corner: build-up and obstructions, socket/plug use, panel release and reinstatement, supported light/driver replacement, ordinary controls/failure behaviour, and observed acoustic/mechanical nuisance. Separate what drawings or calculations establish from what the physical event must measure. Name the affected decision, responsible existing PHY/BCR/DEL route and resolution point for each outstanding acceptance duty. Do not pre-create an ungrounded prototype programme or make a physical event a default book dependency.

**Design completion:** a coordinated, reviewable room scheme and component-grounded representative service detail ready for physical trial, with alternatives, limits and trial criteria explicit. A rejected approach is valid evidence; it must leave a defensible alternative or an explicit unresolved design decision, never a disguised pass. Physical validation, personal aesthetic acceptance and construction release remain separate and unearned until their actual evidence exists.

## Execution and downstream ownership

| Stage | Existing authority and handoff |
| --- | --- |
| Registration | `PCO-ROOM-LIGHTING` records this owner-directed scope and the canonical links. It completes only the registration. |
| Independent design package | `IAS-ROOM-LIGHTING`, shared by IAS/HAD and self-service after registration, `IAS-CRAFT-ROOM-KIT` and `IAS-02S`. Their results are its actual prerequisites. |
| Whole-house coordination | `TRIAD-GATE` consumes the lighting/service result before presenting a coordinated house. Roof, inlet and structural work retain their own independent scopes. |
| Owner decision | Existing `HAD-OWNER-DESIGN-REVIEW`; include the comparison and interface in the [owner pack](../had/owner-design-pack-preparation.md). Agreement to this brief is not acceptance of unpresented fixtures, appearance or geometry. |
| Selected detail | Existing `IAS-WORKABLE-DETAILS` owns post-owner fabrication, tolerances and material detail, followed by existing BCR/ADE/delivery consumers. The new package does not duplicate that work. |
| Physical evidence | Use the existing PHY/BCR/DEL routes when a concrete test or construction acceptance claim requires them. Actual tests and external acceptance are not claimed by registering or completing the design study. |

The design package does not wait for `TRIAD-GATE`, the owner's later visual verdict, unrelated roof/inlet resolution, a nominated site or a physical trial. No additional owner gate, top-level workstream or parallel assurance register is introduced. Preserve already completed IAS evidence and other workers' current leases.

## Registration provenance

The owner authorised this bounded package after the lighting study was integrated. Starting main was `c8b16ee993f348c25d82aa19d3ada827235f9007`. [Issue #1614](https://github.com/adamnoden/architecture/issues/1614) records the exceptional registration-only bootstrap before acquisition of the new `PCO-ROOM-LIGHTING` identity, including its temporary fail-closed effect on automatic dispatch until the node is registered and its lease released. No existing lease is taken over and no dispatcher or protection policy changes.

Registration changes the brief, graph and review handoffs only. It introduces no architectural parameter values, calculations, selected geometry, product admission or physical result. Computational change proofs are therefore not applicable to this registration; they apply to the subsequent design work when its sources and methods change. The registration PR owns validation and merge provenance. The issue remains open for the design package after registration closes.
