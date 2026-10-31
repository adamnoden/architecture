# Reference House Design Programme

**Current-house supersession:** the owner-selected [Georgian re-plan](../reference-house/georgian-replan.md) develops the square-house programme and a west stair to attic. New project designs exclude flat and very-low-slope roofs. The RH-08/RH-10 low-slope roof and dimensions below remain historical technical coordination, not the new architectural brief. Full successor technical migration remains open.


**Status:** active programme control  
**Purpose:** drive the Reference House from provisional coordination fixture to a coordinated virtual building through small, restart-safe design gates.

The Reference House is the principal integration test for House Kernel. Progress lives in the repository because work may be interrupted repeatedly. Existing geometry has authority only where a later gate explicitly retains it.

## Current execution state

- **Active work:** `Post-RH-11 — competent external review execution`.
- **Last closed stage:** `RH-11 — External-review package` — **PASS: issue-ready discipline packages with explicit assumptions, review questions and rewind conditions; no maturity promotion**; canonical pack: [RH-11 External Review Brief](../reference-house/external-review-brief.md).
- **Current whole-house authority:** [RH-10 Whole-House Coordination Audit](../reference-house/whole-house-coordination-audit.md) and [coordination map](../reference-house/whole-house-coordination-rh10.svg).
- **Current external-review authority:** [RH-11 External Review Brief](../reference-house/external-review-brief.md), [package map](../reference-house/external-review-package-rh11.svg), [regulatory baseline](../reference-house/external-review-regulatory-baseline-rh11.md) and discipline appendices for [structure](../reference-house/external-review-structural-rh11.md), [fire/building control](../reference-house/external-review-fire-building-control-rh11.md), [MEP/acoustics](../reference-house/external-review-mep-acoustic-rh11.md) and [building physics/energy](../reference-house/external-review-building-physics-energy-rh11.md).
- **Current plan authority:** [RH-02 ground floor](../reference-house/ground-floor-development.svg), modified by the [RH-03 stair overlay](../reference-house/stair-ground-floor-overlay.svg), plus the [RH-03 upper floor](../reference-house/upper-floor-and-stair-development.svg), locally superseded by RH-06 where `U-ENS-01` became `U-DRESS-01`.
- **Current architectural/elevation authority:** [RH-04 gate](../reference-house/plan-section-elevation-gate.md) for principal front, courtyard opening order and sectional hierarchy, supplemented by [RH-10 Outer Elevation Coordination](../reference-house/outer-elevation-coordination-rh10.md) for garden/service/west elevations. RH-08/RH-10 explicitly supersede RH-04's earlier pitched-roof preference while retaining RH-04 cornice/storey/opening datums.
- **Current structural authority:** [RH-05 Structural Coordination](../reference-house/structural-coordination.md) and [structural overlay](../reference-house/structural-concept-overlay.svg).
- **Current service authority:** [RH-06 Services and Failure Geography](../reference-house/service-topology-rh06.md), locally superseded for whole-dwelling ventilation by the [RH-07 MVHR Addendum](../reference-house/service-topology-rh07-mvhr-addendum.md), and extended for heating/DHW/renewables by [RH-10 Energy, Heating and Renewable Coordination](../reference-house/energy-heat-coordination-rh10.md).
- **Current environmental authority:** [RH-07 Environmental Coordination](../reference-house/environmental-coordination.md), with RH-10 forward-energy coordination added downstream.
- **Current envelope authority:** [RH-10 Envelope Coordination](../reference-house/envelope-coordination-rh10.md): normal masonry-envelope planning family **400–425 mm**, whole-house geometry stress limit **450 mm**; materially thicker construction requires explicit geometry rewind.
- **Current roof/access authority:** [RH-08 gate](../reference-house/roof-drainage-access-rh08.md), [roof/drainage plan](../reference-house/roof-drainage-plan-rh08.svg), [maintenance plan](../reference-house/external-access-maintenance-plan.md), plus RH-10's approximately **50 m² PV-capable roof reserve**.
- **Current tectonic authority:** [RH-09 gate](../reference-house/tectonic-integration-rh09.md), revised [Tectonic Architectural Language](../reference-house/tectonic-architectural-language.md), [interface family diagram](../reference-house/tectonic-interface-family-rh09.svg), [prototype handoff matrix](../reference-house/prototype-handoff-rh09.md).
- **Current crossing authority:** [Service Crossing Register](../reference-house/service-crossing-register-rh06.md), current through RH-10.
- **Current shell:** **12.0 × 10.8 m**, centred **3.6 × 4.0 m** courtyard.
- **Current vertical datums:** first FFL **+3300 mm**; ground clear ceiling **+2950 mm**; upper clear ceiling **+6000 mm**; cornice/eaves control approximately **+6250 mm**.
- **Current environmental concept:** shallow occupied bands; courtyard retained as a shaded light court; disciplined glazing; secure purge/cross ventilation; orientation-specific shading; no cooling reservation; central MVHR with continuous-MEV fallback.
- **Current heat/energy concept:** `ASHP-01` air-to-water heat-pump baseline on the east/service side beside plant geography; DHW/hydraulics in `G-PLANT-01`; bounded `HYD-G-01` / `HYD-U-01` low-temperature routes; passive low-temperature emitters as baseline rather than whole-house UFH; about **50 m²** PV-capable roof reservation; no battery reservation.
- **Current roof concept:** four very-low-slope fields fall outward from the courtyard to inspectable external collection; no inner court roof gutter, internal roof outlet or permanent roof hatch. PV must preserve drainage and external maintenance routes.
- **Current fire/visitability concept:** each first-floor bedroom retains an outer-façade emergency-egress-window duty at current coordination level; principal entrance receives `TH-02` substantially level/visitable threshold intent; final escape opening, M4(1) WC/access, fire closure and real-site approach are now explicit RH-11 review questions.
- **Current occupied-interface concept:** `W0` direct-finished quiet masonry by default; `W1` sparse controlled attachment/service datums selectively; `W2` remains P01 experimental; continuous conventional principal-room floors remain baseline; skirting may carry bounded dry routes but ordinary socket outlets rise to accessible positions.
- **Next action:** issue the RH-11 packages to competent reviewers. Capture responses using the [review response template](../reference-house/external-review-response-template-rh11.md) or equivalent. For every material finding, record the affected project object, owning RH gate, smallest correction, stale downstream documents and closure evidence. Do not increase Reference House or external-review maturity merely because a package was issued.
- **Parallel evidence priority:** progress **P03 structural floor edge** and **P04 wall/ceiling movement joint** while external review is sought; P01 W2 remains optional and P02 selective floor access is not a current house dependency.
- **Current brief:** [Brief and Constraint Ledger](../reference-house/brief-and-constraint-ledger.md).
- **Canonical project-use record:** [Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md).

Update this block whenever a review finding reopens a gate, a prototype changes the controlled baseline or external evidence materially changes maturity.

## Restart protocol

A fresh session should read, in order:

1. [`STATUS.md`](../../STATUS.md);
2. this programme;
3. [RH-10 Whole-House Coordination Audit](../reference-house/whole-house-coordination-audit.md);
4. [RH-11 External Review Brief](../reference-house/external-review-brief.md);
5. [Reference House README](../reference-house/README.md);
6. [Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md);
7. then the discipline brief or prototype material needed by the active evidence task.

Do not reconstruct project intent from chat where the repository gives a later answer.

If external review is interrupted, commit each received finding and project disposition. A review request or unprocessed consultant note is not validation.

## Working rules

1. One bounded architectural question per design gate.
2. A gate ends in a committed artefact; conversation is not project state.
3. Existing geometry has no incumbency advantage.
4. Plan, section and elevation must converge.
5. Keep House Kernel doctrine, patterns, G-01, site/programme and Reference House choices separate.
6. Record rejected alternatives and rewind reasons.
7. Promote only what the evidence proves.
8. Update the Pattern Occurrence Register when real objects move, appear or disappear.
9. Prefer explicit geometry/diagrams where geometry is the issue.
10. An external review finding reopens the **owning gate**, not whichever downstream document is easiest to edit.

---

# Stage sequence

## RH-00 — Reconstitute the brief — CLOSED PASS

**Question:** what must this house be before inherited sketches bias the answer?

**Work:** separate hard requirements, preferences, doctrine, G-01, project choices, inherited assumptions and unknown site facts.

**Deliverable:** `docs/reference-house/brief-and-constraint-ledger.md`

**Gate:** a new session can distinguish required, preferred, inherited, unknown and authority owner.

---

## RH-01 — Test gross morphology — CLOSED PASS

**Question:** what overall house/courtyard geometry best satisfies the brief before detailed room planning?

**Work:** compare serious alternatives on footprint/area, court size/position, front–court–garden sequence, wing depth/daylight, structure, services, maintenance perimeter, G-01 ordering and circulation efficiency.

**Deliverables:** `morphology-options.md` + diagrams.

**Gate:** select a working morphology and record why losers lost.

---

## RH-02 — Resolve ground-floor order — CLOSED PASS

**Question:** can the selected morphology produce a convincing domestic ground floor without technical logic dominating it?

**Work:** entrance, drawing/family/dining/kitchen relationships, garden/court thresholds, study, WC/service geography, circulation, furniture-scale use and G-01 room hierarchy. Test a credible alternative.

**Deliverables:** `ground-floor-development.md` + plan SVG.

**Gate:** room order and principal circulation become controlled baseline; morphology rewinds only for demonstrated failure.

---

## RH-03 — Resolve stair, upper floor and courtyard circulation — CLOSED PASS

**Question:** can vertical circulation, bedrooms, bathroom and court edge form one coherent composition?

**Work:** stair geometry/headroom, landing/gallery extent, bedroom hierarchy, bathroom geography, privacy/acoustics, daylight and structural consequences.

**Deliverables:** `upper-floor-and-stair-development.md`, upper plan and stair/court section.

**Gate:** complete two-storey room/circulation baseline with no unresolved stair/court/wet-service contradiction.

---

## RH-04 — Couple plan, section and G-01 elevation — CLOSED PASS

**Question:** does the spatial arrangement generate convincing Georgian-derived architecture when section/elevation are coordinated rather than applied afterward?

**Work:** storey/floor depths, openings, bay rhythm, entrance, court elevations, cornice/roof zone and G-01 coupling.

**Deliverables:** `plan-section-elevation-gate.md` + principal sections/elevations.

**Gate:** plan/section/elevation coexist without disguising technical necessities or violating selected grammar.

**Later supersession:** RH-08/RH-10 replace RH-04's preliminary pitched-roof preference with the outward-draining low-slope roof. RH-04 remains current for storey hierarchy, front/courtyard opening order and cornice datum.

---

## RH-05 — Coordinate primary structure — CLOSED PASS

**Question:** can the architecture be carried by a simple legible structure without sacrificing serviceability?

**Work:** load paths, bearing lines, floor spans, court/stair trimming, transfers, protected structural zones, engineer questions and P03 floor-edge geometry.

**Deliverables:** `structural-coordination.md` + structural overlay.

**Gate:** no room/service strategy depends on implausible transfers, hidden gymnastics or arbitrary drilling.

---

## RH-06 — Coordinate services and failure geography — CLOSED PASS

**Question:** do real routes fit once gravity, dimensions, access and failure modes are taken seriously?

**Work:** utility entry, plant/replacement, vertical zone, foul/water, extract, electrical/data, route classes, crossings, leak/isolation and dry-side wet-room access.

**Deliverables:** `service-topology-rh06.md`, overlays, crossing register and updated occurrences.

**Gate:** every major service can be traced source→terminal and installation→maintenance/replacement without vague voids.

---

## RH-07 — Resolve passive-first environmental design — CLOSED PASS

**Question:** can form/openings provide credible light, ventilation and summer/winter behaviour before active equipment is asked to rescue architecture?

**Work:** orientation stress cases, daylight/sun, court effect, purge/cross/stack ventilation, gains/shading, mass, source capture and bounded mechanical-assist comparison.

**Deliverables:** `environmental-coordination.md` + diagrams + MVHR addendum.

**Gate:** passive hierarchy is spatially credible; active assistance has maintainable geography; poor form is rewound rather than disguised.

---

## RH-08 — Roof, drainage and external maintenance — CLOSED PASS

**Question:** can water leave safely and can the exterior be maintained without heroic access?

**Work:** roof form, court/outer drainage and overflow, rainwater routes, roof access, façade/window access, support zones, plant replacement, landscape conflicts and service terminals.

**Deliverables:** `roof-drainage-access-rh08.md`, revised maintenance plan and access/drainage diagrams.

**Gate:** routine external tasks have credible access; drainage failure has explicit visible consequences/overflow; no key component depends on improvised access.

---

## RH-09 — Tectonic and occupied-surface integration — CLOSED PASS

**Question:** can maintainable interfaces become convincing rooms rather than visible technical infrastructure?

**Work:** wall finish/attachment hierarchy, skirting/service routes, fixing loads, window/door interfaces, thresholds, wall/ceiling movement, floor-access proportionality, access panels, service index and restrained metal vocabulary.

**Deliverables:** `tectonic-integration-rh09.md`, revised tectonic language, interface-family SVG and prototype handoff matrix.

**Gate:** every non-conventional occupied-interface move is selected conventionally, a bounded current pattern occurrence, routed to physical/specialist validation, or rejected. The house remains complete if W2 and selective floor access fail.

---

## RH-10 — Whole-house coordination audit — CLOSED PASS

**Question:** does the virtual house work as one building?

**Work:** adversarial audit across programme, G-01, structure, services/MVHR, heating/DHW, environmental performance, roof/drainage, envelope, fire/visitability geometry, maintenance/replacement, occupied interfaces, pattern occurrences, authority drift and area/cost/complexity.

**Material findings repaired inside the gate:**

- missing heat/DHW topology;
- forward renewable-electricity / PV provision;
- RH-04/RH-08 roof-authority conflict;
- unresolved garden/service elevations;
- obsolete 350 mm wall-depth assumption.

**Deliverables:**

- [`whole-house-coordination-audit.md`](../reference-house/whole-house-coordination-audit.md);
- [`whole-house-coordination-rh10.svg`](../reference-house/whole-house-coordination-rh10.svg);
- [`energy-heat-coordination-rh10.md`](../reference-house/energy-heat-coordination-rh10.md);
- [`envelope-coordination-rh10.md`](../reference-house/envelope-coordination-rh10.md);
- [`outer-elevation-coordination-rh10.md`](../reference-house/outer-elevation-coordination-rh10.md);
- updated Pattern Occurrence Register and crossing register.

**Gate:** PASS. Adjacent architectural systems are reconciled at stated virtual-design scope; remaining material uncertainty is engineering, simulation, prototype, real-site or competent external-review work rather than missing basic architecture.

**Maturity consequence:** Reference House **M2 → M3 — Coordinated**. No M4 claim.

---

## RH-11 — External-review package — CLOSED PASS

**Question:** is the coordinated house explicit enough for competent outsiders to attack real assumptions rather than react to a concept?

**Work completed:** four bounded discipline packages now state the exact decision under review, current geometry, supplied evidence, provisional assumptions, explicit fallback/rewind logic and the earlier RH authority that owns any material correction.

**Deliverables:**

- [RH-11 External Review Brief](../reference-house/external-review-brief.md);
- [RH-11 Regulatory Baseline](../reference-house/external-review-regulatory-baseline-rh11.md);
- [Structural Review Brief](../reference-house/external-review-structural-rh11.md);
- [Fire & Building-Control Review Brief](../reference-house/external-review-fire-building-control-rh11.md);
- [MEP & Acoustic Review Brief](../reference-house/external-review-mep-acoustic-rh11.md);
- [Building-Physics & Energy Review Brief](../reference-house/external-review-building-physics-energy-rh11.md);
- [Review Response Template](../reference-house/external-review-response-template-rh11.md);
- [Review Package Map](../reference-house/external-review-package-rh11.svg).

**Gate:** **PASS.** A competent reviewer can identify and challenge real project decisions without reconstructing intent from conversation or being asked to design the missing house.

**Maturity consequence:** **none.** Reference House remains M3. External professional review remains M1 until competent responses are actually received and material findings resolved. Issuing a brief is not validation.

---

# Post-RH-11 evidence execution

The RH design-gate sequence is now complete at coordinated virtual-design scope. The next evidence events are external review and physical validation.

## External review

Issue the RH-11 package to competent reviewers for:

1. structural engineering;
2. fire / building control;
3. MEP / acoustics;
4. building physics / energy.

For every material finding, record:

```text
finding
→ affected project object / occurrence
→ owning RH gate
→ smallest correction
→ downstream documents made stale
→ closure evidence
```

A material finding may reopen RH-03 through RH-10. Resolve the owning gate rather than patching the latest drawing.

## Physical validation

Physical validation has separate authority under the [Tectonic Prototype and Engineering Programme](tectonic-prototype-programme.md):

1. **P01 — W2 wall bay** — optional challenger;
2. **P02 — selective floor access** — not a current house dependency;
3. **P03 — structural floor edge** — real RH-05 engineering dependency;
4. **P04 — wall/ceiling tectonic joint** — selected RH-09 interface evidence.

Prototype rejection may force a local implementation change without automatically invalidating House Kernel or G-01.

# Definition of progress

Progress is the number of important uncertainties converted into:

- **resolved for the Reference House**;
- **bounded assumption awaiting specialist validation**;
- **routed to physical test**;
- **rejected with a recorded reason**.

A clean rewind is progress. A beautifully documented ambiguity is not.
