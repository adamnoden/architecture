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
