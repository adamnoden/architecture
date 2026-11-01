# IAS-03 — the B-plan riser cabinet and complete floor boundary

**31 October 2026 · unadopted architectural comparison · IAS-03 remains planned.** Starting main `d81aab99cd8900395deffc16a26f1490fb9658f6`. This develops the cabinet side of the [STR riser-trim enquiry](../str/house-riser-trim-study.md), using the current [B support geometry](../str/studies/house-supports.json) and the [HAD family-bath slider sequence](../had/had-03-family-bath-slider.md). It changes no accepted house geometry, structural member, material selection or tested boundary.

## Decision

Develop the **retained 600 × 750 cabinet with an independently supported fixed chassis and complete floor closure** first. Enlarging the cabinet is not a substitute for closing and supporting the floor. If an actual service component earns more internal access, the **770 × 750 east-only alternative** preserves the inherited door sequence and admits a revised cabinet approach. The 770 × 950 enlargement in both directions fails that sequence: its north edge obstructs the starting torso position by 75 mm.

[Located comparison sheet](studies/b-plan-riser-closure.svg) · [recorded geometry and results](studies/b-plan-riser-closure.json) · [reproducer](studies/b-plan-riser-closure.mjs).

## One source geometry, three enclosures

The 700 × 800 structural opening is x9370–10070 / y4650–5450. The 550 × 700 gross riser is x9410–9960 / y4700–5400. The retained cabinet is x9385–9985 / y4675–5425. Those positions come from STR's unadopted B comparison; they are not a relocation of the accepted plan's IS-01 occurrence.

| Enclosure comparison | Footprint, mm | Bath gap | Gap below raw doorway y5450 | Opening outside cabinet footprint |
|---|---|---:|---:|---:|
| **A — retained** | x9385 / y4675; 600 × 750 | 190 | 25 | 0.110 m² |
| **B — full enlargement** | x9385 / y4575; 770 × 950 | 90 | **−75** | 0.012 m² |
| **C — east only** | x9385 / y4675; 770 × 750 | 190 | 25 | 0.04625 m² |

These are envelope subtractions, not free working clearances or panel quantities. C increases the gross east margin between riser and cabinet from 25 to 195 mm; actual lining, frame, fixings, insulation and services still consume that space. No actual clear face opening or component withdrawal envelope is selected.

### Preserve the complete HAD sequence

HAD supplies an authored 1000 × 44 leaf at x9156–9200, open at y4680–5680 and closed at y5400–6400. Its two 32 mm jambs leave y5482–6318; the open leaf leaves **638 mm** before hardware and tolerances. Keep that exact leaf, guide, pull, entry route, coupled closing/reopening and return route. The old approximate parked reserve in the earlier plan narrative is not used to earn a new positive result.

The inherited body disc is 600 mm in diameter; the hand/forearm capsule is 80 mm, with a **650 mm reach sensitivity**. The prescribed motion still fails a 600 mm reach limit. The entry comes through x8750 and y6000, then turns to the starting torso point (9710,5750). During closure the torso moves to (9710,5880); the grip follows HAD's exposed inside pull. Its maximum proxy reach is 630.08 mm. These are design proxies, not dimensions or abilities assigned to a person.

| Whole sequence check | A — retained | B — full enlargement | C — east only |
|---|---:|---:|---:|
| Inherited entry: minimum reserve beyond the 300 radius | 18 mm | **−75 mm** | 18 mm |
| Starting torso reserve to cabinet north edge | 25 mm | **−75 mm** | 25 mm |
| Continuous coupled body lower bound, including unchanged HAD obstacles | 24.9675 mm | **−75.0325 mm** | 24.9675 mm |
| Continuous arm lower bound, including unchanged HAD obstacles | 10.109 mm | 10.109 mm; torso still fails | 10.109 mm |
| Original closed cabinet approach ending at x10300 / y5050 | 15 mm | **−155 mm** | **−155 mm** |
| Revised closed cabinet approach ending at x10500 / y5050 | Not needed | No replacement sequence proposed | **15 mm overall; 45 mm on east leg** |
| Complete compared proxy sequence | Preserved | **Fails inherited entry/closure** | Preserved with cabinet-route revision |

**All positive route and sequence results assume a continuous, supported, flush walking boundary wherever the body proxy overlaps the structural opening. That floor closure is a prerequisite, not a result of the obstacle calculation.** At A’s cabinet approach point, the proxy projects 70 mm west of the opening’s east edge; the existing slab cannot be assumed beneath that part of the disc. The closure and its capacity remain unearned, so none of these planar passes establishes safe passage over an open bay.

For C, replace only the closed cabinet approach with **(9710,5880) → (10500,5880) → (10500,5050)**. The horizontal leg has 15 mm beyond the body radius beneath the basin; the vertical leg has 45 mm to the cabinet's east face. Reverse it before reopening the door. WC and bath approaches retain their 15 mm minimum; the inherited basin approach still has **only 5 mm**. The resulting complete sequence therefore does not acquire a 45 mm universal reserve. A and C retain HAD's 18 mm entry and its close/reopen sequence; B requires a new coordinated enclosure/door proposal, rather than an unsupported claim that every possible B route is impossible.

The code checks complete axis-aligned route segments against the actual wall pieces, jambs, fixtures, court, stair, void, external boundary, correct leaf state and guide. A reproduces HAD's individual entry and task margins. For the changed cabinets, it reuses HAD's exact affine torso/grip trajectory and 2001 states, subtracting the same 0.0325 mm body and 0.18 mm arm half-step bounds. Combining each new cabinet bound with the pinned HAD bound preserves the unchanged obstacles conservatively. Reopening and return use exact reversal; the model introduces no alternative slider mechanism. The old x8910 gallery line remains a failing control, with **54 mm overlap** against the actual open leaf.

HAD's remaining limits survive: unselected installed rail/support/rebate and pull details, force and balance, actual human operation, use of fixtures, accessibility/rescue, privacy/acoustics/fire, and material admission of the named polymer-containing kit. This IAS comparison earns no additional claim at those boundaries.

## Close the floor, not just the space around a gross box

The opening is **0.560 m²**. The gross riser is **0.385 m²**, a packing envelope containing as-yet unlocated services; it is **not a sealed penetration**. The geometric difference is 0.175 m², divided for inspection as follows:

| Territory outside the gross riser | Rectangle, mm | Area |
|---|---|---:|
| West | x9370 / y4650; 40 × 800 | 0.032 m² |
| East | x9960 / y4650; 110 × 800 | 0.088 m² |
| South | x9410 / y4650; 550 × 50 | 0.0275 m² |
| North | x9410 / y5400; 550 × 50 | 0.0275 m² |

These are **closure territories**, not four loose strips, bearing widths or specified plates. The 0.110 m² outside A's cabinet plus the 0.065 m² inside it but outside the gross riser accounts for the same 0.175 m². Even closing those territories would leave the whole gross riser unresolved. The complete floor boundary must cover the opening except for individually located and appropriately qualified service penetrations; the actual closure and sealing area remains unknown.

At the west, reach the structural face **x9370** beneath the retained 15 mm finish reservation. Inspect that fixed termination during construction before the finish conceals it. Do not place a routine release fastener or routinely disturbed seal behind that finish.

The dashed **785 × 950 territory x9370 / y4575** on the sheet is an authored space for enquiring into fixed support and closure, extending 75 beyond the bay north/south and 85 east. These overlaps are not selected bearings or frame members. Any room-exposed closure stays supported and flush at the source **FFL +3450**: a raised north apron would intrude into the doorway. Actual members, anchorage, spans, reactions, constituent compliance and protection remain unselected.

Cabinet loads must reach permanent supports independently of removable infill, renewable faces and service pipes. Neither a cabinet outline nor a standard hollowcore hanger load table proves that path. STR owns the actual trim/receiving-panel/spine design and its depth consequences. The closure cannot silently consume the upper-function layers or the retained 55 mm underside service reservation; it needs the same coordinated installed section.

## First release and reinstatement

The east room-side face is the proposed ordinary access direction. Retain the permanent trim, fixed chassis, cabinet load supports, complete floor boundary outside actual service apertures and structural protection throughout ordinary service renewal.

1. Locate and isolate the actual service using accessible controls. Establish support for the face and component; do not use their connections as temporary supports.
2. Release the **nonstructural east face** through accessible room-side fixings. Its clear opening, fastener/tool envelope and handling position must be drawn for the actual assembly. A checked closed-face approach does not prove that operation.
3. Support, disconnect and withdraw the identified component through its demonstrated aperture and travel. Any disturbed penetration closure needs an explicit reinstatement procedure; do not remove a structural trimmer or its protection to reach a joint.
4. Inspect and restore the applicable floor, moisture, fire/acoustic and service boundaries before closing. Preserve the existing first-wetted-surface, visible declaration, isolation and all-affected-surface drying duties; no leak or firestop performance is inferred here.

The next concrete design is **one fixed support/closure section and one actual service component**, with independently located supports, penetrations, accessible first release and complete withdrawal. Retain A unless that assembly earns C's extra depth; reject B as a drop-in to the inherited HAD sequence. Manufacturer/competent/physical evidence must then address the named support and boundary duties. This result does not discharge accepted-plan IS-01, select a material exception or close IAS-03; the existing [IS-01–06 adoption obligations](../../docs/reference-house/interior-family-selection.md#adoption-gate--exact-work-remaining) remain.

## Reproduction and verification

Run `python3 project/had/studies/family-bath-slider.py --check`, then `node project/ias/studies/b-plan-riser-closure.mjs --check`. The IAS reproducer pins STR's plan/support/source inventory and HAD's owning note, JSON and Python generator by Git blob identity. Its exact output checks, baseline correspondence, changed-cabinet motion checks and adverse controls establish this declared geometry only. Rendered A3 inspection and independent architectural review remain separate from arithmetic and repository health; none is construction or physical acceptance.

## Joined J-RC2 continuation — 1 November 2026

**Reference design — not released for construction. Assumptions and outstanding verification accompany the proposal; internal checks do not constitute external assurance or certification.** Starting main `1e7b2cbce408834ca3cbb91c286af37eda066829`. This is the same compact B geometry above, with the STR solid-floor comparison; it adopts no house geometry or material exception. [Connected floor/task sheet](studies/b-plan-riser-task.svg) and `joinedTrial` in the existing [record](studies/b-plan-riser-closure.json) are reproduced by the existing generator.

**Joined vertical datum:** all z values below and on the task sheet are LOCAL coordinates relative to the proposed ground FFL0. The final HAD/MAT ground comparison is D1300: authored exterior/soil is −1300 on that same datum. If later adopted against the accepted 150 grade relationship, the +1150 global translation applies to the whole house; it consumes no storey height or floor depth. RC3170–3370 and upper FFL3450 remain the same local cross-storey geometry, not a second global model.

### Decision and the full boundary

Develop **permanent floor plus local service-part renewal** before a demountable whole floor. STR's J-RC2 comparison replaces the old bay with solid RC200 at +3170–3370; 60 upper function and 20 finish return to +3450. Two cast-formed 50 diameter bores at (9500,4850) and (9700,4850), plus a 160 bore at (9800,5200) for an actual 110 OD soil-stack body, locate the joined witness. The fixed 160 diameter occupied cylinder is conservatively retained through the cabinet height, including the seal territory; no seal projection beyond the bore is assumed or qualified. Four permanent 100 × 100 slab-contact plinths occupy x9435–9535 / x9835–9935 and y4700–4800 / y5300–5400. They rise through the 80 upper layers; the cabinet's authored 25 square fixed frame bears on them. The upper layers, access cover and pipework carry no cabinet load. STR owns reinforcement, reactions, anchors and the trial 1.0 kN action; that action is not a manufacturer's cabinet mass or an accepted capacity.

**This does not close the inherited whole-house riser.** The 550 × 700 gross envelope still represents the unlocated foul/vent/water/power and other service duties. Two 22 OD example pipes and one 110 soil-stack body cannot replace the complete inventory, branches, couplings and required clearances. Retain the original 700 × 800 opening as the adverse whole-stack alternative until every required service, bend, joint, insulation/separation, support and penetration is connected and packed. Reopening/enlarging the three bores is a structural redesign, not maintenance permission. A future full inventory that needs the old opening falsifies this small-bore solution for that use.

The geometric annulus around each 22 OD example pipe is 14 radial; the 110 stack has 25 within its 160 bore. It earns no fire, acoustic, water or gas seal, no insulation provision and no material admission. Floor penetrations remain independent, fixed boundaries during the local maintenance task. A permanent mineral floor improves continuity; it does not qualify its penetrations by association.

### A real service part, rather than an unspecified box

The manufacturer's [Fig 12 technical sheet, TI-P164-02 CMGT Issue 13](https://www.spiraxsarco.com/-/media/spiraxsarco/international/documents/en/ti/Fig_12-TI-P164-02-EN), read and visually inspected on 1 November 2026 (pages 2–4), supplies the half-inch bronze strainer comparison: length 72, depth B54 and withdrawal datum C85 below the pipe centre. Its dimensional cap envelope is 30 A/F, while its torque table says 22 A/F. Preserve that conflict: verify the delivered cap, tool and applicable torque before a physical trial. No torque is selected here. The listed assembly comprises bronze body, brass cap, 316L screen and reinforced exfoliated graphite gasket; the complete gasket recipe remains unverified. For liquid service its pocket points down. The sheet permits maintenance in the pipeline after safe isolation and recommends a new gasket.

The comparison locates the fixed body on a north–south branch at x9850 / y5000 / z4350 (+900 above FFL). Its 40 plan width is a schematic allowance, not a recovered manufacturer's width. A 200 × 200 × 400 maintenance void at x9750 / y4900 / z4100 contains the C85 datum and a generous local capture field. It does not invent a thread-disengagement stroke or an exact pocket angle. The retained stack is a fixed obstacle in the cap/screen task: its conservative 160 field starts at y5120, leaving **20** to both the maintenance void and complete transfer prism ending y5100. Its actual 110 body starts y5145; that extra25 is not borrowed to earn the task clearance. The nearest plinth corner lies25.95 outside the160 field. The plan and east view retain this cylinder during renewal. A larger actual coupling, insulation or seal projecting south by20 or more falsifies this task reserve and requires relocation or access redesign. A continuous reserved transfer prism x9750–10035 / y4900–5100 / z4100–4500 bridges the 35 between the local void and face and extends 50 into the room. Its y/z section lies wholly inside the clear aperture. After complete disengagement, free parts travel east through this prism; the dot on the east elevation means out of the sheet, not northward. The actual side width and screen/cap envelope must still be checked before this reserve becomes an actual withdrawal proof. The body, both pipe connections and independent supports stay fixed; ordinary screen renewal does not disturb either floor seal.

This is a closed-water branch maintenance witness, with no selected hydraulic need, flow, pressure, temperature or potable-water application. Upstream/downstream isolation, drain connection, adapters, supported pipe routes and their materials remain missing installed components. Their absence prevents acceptance of a connected operating circuit; it does not prevent comparing a specific cap/screen task with whole-floor dismantling. No live task is authorised by this reference design.

### First release, free part movement and reinstatement

The retained cabinet receives a local east aperture x9985 / y4900–5100 / z3950–4550: **200 wide × 600 high**. The authored 220 × 620 × 2 plain-steel cover weighs 2.14 kg at an assumed 7850 kg/m³, excluding screws, hooks and coatings. It has four room-side captive metal screws into the fixed frame. Support it before releasing those screws; move it 30 east and then 300 north onto two fixed metal hooks. The parked cover occupies y5190–5410, still within the cabinet length. Two 39 × 25 × 3 seats at y5220 and y5380 receive its bottom at z3940; 3 thick upturned lips at x10019 retain its east edge. Their fixed rail occupies x9958–9983 / y4700–5400 / z3910–3935. Two 33 long brackets connect it to the retained east posts. Thus the gravity route is cover → seats → rail → brackets → fixed frame → plinths → slab; connections, deflection and capacity remain unaccepted. It is a dry cover; its removal opens no structural floor or claimed fire/water boundary.

Use the existing HAD entry and complete close/reopen sequence. With the door closed, move (9710,5880) → (10350,5880) → (10350,5300) for cover release, then south to (10350,5050) for the cap task. Reverse that transfer before reinstating the cover; return by the same path and the inherited reopening/exit. The existing reproducer checks the full axis-aligned approach against the located B obstacles. At the first-release position the cover's complete plan sweep leaves 33 beyond the 300 radius body proxy; the furthest fixing is 548.9 away in plan. The part position is 502.5 away in plan from the task body point. A 180 tool/hand occupancy diameter fits inside the 200 aperture with 10 each side. These are authored sensitivities, not a selected tool or human acceptance. The earlier x10300 body position overlaps the released cover by 17; a checked closed-face approach therefore cannot stand in for this task.

The connected sequence is: isolate both sides, cool, drain into a supported vessel and verify zero pressure; support and park the face; transfer to the task position; support the cap and counterhold the fixed body; release the actual cap and withdraw cap/screen into the local void; take free parts east; clean the seats and restore the screen with a new identified gasket and verified torque. Restore pressure slowly and inspect the cap, body, retained pipe joints and catch vessel. Dry every affected surface before reversing the panel route and refitting the screws. The permanent slab, all three penetration seals, four plinths, frame, body and supported pipes remain throughout.

The plan calculation omits vertical reach, articulated hands, counterholding, cap reaction, force, clothing, balance, leakage, tool engagement and real handling. The cover's material/weight, hooks, captive fixings, full actual strainer envelope, cap-axis motion and complete circuit and all actual stack connections need an installed witness and physical operation. The floor/support design needs STR's verification. MAT owns complete constituents; MRA/BCR retain first-wetted surface, visible declaration, isolation, all-affected-surface drying and restoration evidence. These exact missing inputs prevent local installed acceptance and must be resolved before prototype acceptance or fixing the affected service design. They do not justify removing the whole floor to clean a small screen.

IAS-03, accepted-plan IS-01–06 and the whole-house riser remain open. The result is a concrete, rejectable joined candidate: fixed floor and supports, a located renewable part and first release, and explicit conditions under which the small-bore direction must be abandoned.

Local verification: inherited HAD Python checks and the IAS `--check` reproducer passed; `git diff --check` passed. Inkscape rendered the actual A3 task sheet and it was visually inspected after correcting a frame crop and the east/out-of-plane motion symbol. Independent internal challenge checked the transfer gap and parked-cover support; this is not independent external assurance. Exact integration-head CI and fresh per-node preflight remain integration duties.
