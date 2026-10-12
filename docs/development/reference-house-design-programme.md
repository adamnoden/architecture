# Reference House Design Programme

**Status:** active programme control  
**Purpose:** drive the Reference House from provisional coordination fixture to a coordinated virtual building through small, restart-safe design gates.

The Reference House is the principal integration test for House Kernel. Progress lives in the repository because work may be interrupted repeatedly. Existing geometry has authority only where a later gate explicitly retains it.

## Current execution state

- **Active stage:** `RH-10 — Whole-house coordination audit`
- **Last closed stage:** `RH-09 — Tectonic and occupied-surface integration` — **PASS at architectural / pre-prototype coordination level**; canonical gate: [RH-09 Tectonic and Occupied-Surface Integration](../reference-house/tectonic-integration-rh09.md).
- **Current plan authority:** [RH-02 ground floor](../reference-house/ground-floor-development.svg), modified by the [RH-03 stair overlay](../reference-house/stair-ground-floor-overlay.svg), plus the [RH-03 upper floor](../reference-house/upper-floor-and-stair-development.svg), locally superseded by RH-06 where `U-ENS-01` became `U-DRESS-01`.
- **Current architectural/elevation authority:** [RH-04 gate](../reference-house/plan-section-elevation-gate.md), [front elevation](../reference-house/front-elevation-study.svg), [courtyard elevations](../reference-house/courtyard-elevations-study.svg), [principal section](../reference-house/principal-section-rh04.svg).
- **Current structural authority:** [RH-05 Structural Coordination](../reference-house/structural-coordination.md) and [structural overlay](../reference-house/structural-concept-overlay.svg).
- **Current service authority:** [RH-06 Services and Failure Geography](../reference-house/service-topology-rh06.md), locally superseded for whole-dwelling ventilation by the [RH-07 MVHR Addendum](../reference-house/service-topology-rh07-mvhr-addendum.md).
- **Current environmental authority:** [RH-07 Environmental Coordination](../reference-house/environmental-coordination.md).
- **Current roof/access authority:** [RH-08 gate](../reference-house/roof-drainage-access-rh08.md), [roof/drainage plan](../reference-house/roof-drainage-plan-rh08.svg), [maintenance plan](../reference-house/external-access-maintenance-plan.md).
- **Current tectonic authority:** [RH-09 gate](../reference-house/tectonic-integration-rh09.md), revised [Tectonic Architectural Language](../reference-house/tectonic-architectural-language.md), [interface family diagram](../reference-house/tectonic-interface-family-rh09.svg), [prototype handoff matrix](../reference-house/prototype-handoff-rh09.md).
- **Current crossing authority:** [Service Crossing Register](../reference-house/service-crossing-register-rh06.md), current through RH-08.
- **Current shell:** **12.0 × 10.8 m**, centred **3.6 × 4.0 m** courtyard.
- **Current vertical datums:** first FFL **+3300 mm**; ground clear ceiling **+2950 mm**; upper clear ceiling **+6000 mm**; cornice/eaves control approximately **+6250 mm**.
- **Current environmental concept:** shallow occupied bands; courtyard retained as a shaded light court; disciplined glazing; secure purge/cross ventilation; orientation-specific shading; no cooling reservation; central MVHR with continuous-MEV fallback.
- **Current roof concept:** four very-low-slope fields fall outward from the courtyard to inspectable external collection; no inner court roof gutter, internal roof outlet or permanent roof hatch.
- **Current occupied-interface concept:** `W0` direct-finished quiet masonry by default; `W1` sparse controlled attachment/service datums where real tasks justify them; `W2` replaceable lining remains P01 experimental; continuous conventional principal-room floors remain baseline; skirting may carry bounded dry routes but ordinary socket outlets rise to accessible positions; representative window/door/threshold/movement-junction families are now explicit.
- **Next action:** run an adversarial whole-house audit across ordinary life, G-01, structure, services/MVHR, environment, drainage/moisture, fire/acoustic geometry, maintenance/replacement, occupied interfaces, pattern occurrences and area/cost/complexity. Maintain a clash/rewind register. Do not promote Reference House maturity until material cross-system contradictions are resolved or bounded as external engineering/prototype dependencies.
- **Current brief:** [Brief and Constraint Ledger](../reference-house/brief-and-constraint-ledger.md).
- **Canonical project-use record:** [Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md).

Update this block whenever a stage closes or materially changes.

## Restart protocol

A fresh session should read, in order:

1. [`STATUS.md`](../../STATUS.md);
2. this programme;
3. the latest closed `RH-*` gate named above;
4. [Reference House README](../reference-house/README.md);
5. [Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md);
6. only then the detailed studies needed by the active stage.

Do not reconstruct project intent from chat where the repository gives a later answer.

If interrupted mid-stage, commit a checkpoint stating: established facts, provisional items, live alternatives, exact next test/drawing and decisions not to reopen silently. A checkpoint is not a gate pass.

## Working rules

1. One bounded architectural question per stage.
2. A stage ends in a committed artefact; conversation is not project state.
3. Existing geometry has no incumbency advantage.
4. Plan, section and elevation must converge.
5. Keep House Kernel doctrine, patterns, G-01, site/programme and Reference House choices separate.
6. Record rejected alternatives and rewind reasons.
7. Promote only what the gate proves.
8. Update the Pattern Occurrence Register when real objects move, appear or disappear.
9. Prefer explicit geometry/diagrams where geometry is the issue.
10. Commit each gate before starting the next.

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

## RH-10 — Whole-house coordination audit — ACTIVE

**Question:** does the virtual house work as one building?

**Work:** adversarial audit across:

- programme / ordinary domestic use;
- G-01 composition and authority drift;
- structure and protected zones;
- services, MVHR and service-core proportionality;
- environmental assumptions / overheating / purge;
- roof, drainage, moisture and court drying;
- fire/acoustic assumptions that affect geometry;
- occupied interfaces / fixing / replacement;
- external and internal maintenance routes;
- pattern-occurrence accuracy;
- area, cost and complexity proportionality;
- prototype and external-review dependencies.

Maintain a clash/rewind register. Resolve material failures; do not average them away.

**Deliverables:**

- `docs/reference-house/whole-house-coordination-audit.md`;
- coordinated plan/section/elevation set at current virtual-design resolution;
- updated Pattern Occurrence Register.

**Gate:** the Reference House may move from M2 toward M3 only when adjacent systems are reconciled and remaining uncertainty is explicitly engineering/prototype/external rather than basic architectural coordination.

---

## RH-11 — External-review package

**Question:** is the house explicit enough for competent outsiders to attack real assumptions rather than react to a concept?

**Work:** bounded packages for structural engineer, fire/building-control practitioner, building-services/ventilation engineer and later specialists as justified. Each package states question, current assumption, supplied evidence/drawings and rewind trigger.

**Deliverable:** `docs/reference-house/external-review-brief.md` plus discipline appendices.

**Gate:** reviewers can challenge real decisions without being asked to design the missing house on the project's behalf.

---

# Parallel physical-validation track

Physical validation has separate authority under the [Tectonic Prototype and Engineering Programme](tectonic-prototype-programme.md):

1. **P01 — W2 wall bay**;
2. **P02 — selective floor access**;
3. **P03 — structural floor edge**;
4. **P04 — wall/ceiling tectonic joint**.

RH-09 now clarifies their Reference House dependencies: P01 and P04 test selected challengers/interfaces; P02 is not currently required by the house; P03 remains an RH-05 engineering dependency. Prototype rejection may force local implementation change without automatically invalidating House Kernel or G-01.

# Definition of progress

Progress is the number of important uncertainties converted into:

- **resolved for the Reference House**;
- **bounded assumption awaiting specialist validation**;
- **routed to physical test**;
- **rejected with a recorded reason**.

A clean rewind is progress. A beautifully documented ambiguity is not.