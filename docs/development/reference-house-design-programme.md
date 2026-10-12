# Reference House Design Programme

**Status:** active programme control  
**Purpose:** drive the Reference House from provisional coordination fixture to a coordinated virtual building through small, restart-safe design gates.

The Reference House is the principal integration test for House Kernel. This programme exists because the work is expected to be interrupted repeatedly. Progress must therefore live in the repository rather than in conversational memory.

The programme does not assume that the current whole-house fixture is the right house. Existing geometry, room order, service bias, courtyard dimensions and stair assumptions are hypotheses unless a later gate explicitly retains them.

## Current execution state

- **Active stage:** `RH-05 — Coordinate primary structure`
- **Last closed stage:** `RH-04 — Couple plan, section and G-01 elevation` — **PASS**; canonical gate record: [RH-04 Plan / Section / Elevation Gate](../reference-house/plan-section-elevation-gate.md).
- **Current plan authority:** [RH-02 ground floor](../reference-house/ground-floor-development.svg), as modified by the [RH-03 stair overlay](../reference-house/stair-ground-floor-overlay.svg), plus the [RH-03 upper floor](../reference-house/upper-floor-and-stair-development.svg).
- **Current elevation authority:** [RH-04 front elevation](../reference-house/front-elevation-study.svg) and [courtyard elevations](../reference-house/courtyard-elevations-study.svg).
- **Current section authority:** [RH-04 principal section](../reference-house/principal-section-rh04.svg).
- **Current shell:** **12.0 × 10.8 m**, centred **3.6 × 4.0 m** courtyard.
- **Current vertical datums:** first FFL **+3300 mm**; ground clear ceiling **+2950 mm**; upper clear ceiling **+6000 mm**; cornice/eaves control approximately **+6250 mm**.
- **Current front order:** centred four-bay field at X = **1.95 / 4.65 / 7.35 / 10.05 m**; principal entrance occupies bay 3.
- **Next action:** establish a simple structural load-path concept against the RH-04 opening/floor datums, compare floor spanning and courtyard-wall strategies, and identify any architectural coordinate that structure cannot support without disproportionate transfer or depth.
- **Current brief baseline:** [Brief and Constraint Ledger](../reference-house/brief-and-constraint-ledger.md).
- **Held morphology rewind:** `B — Offset thick/thin ring`, now a deep fallback only if later coordination exposes a material failure that cannot be solved proportionately inside the selected central-court morphology.
- **Canonical project-use record:** [Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md); RH-04 creates architectural coordinates and structural obligations but no new pattern occurrence by itself.

Update this block whenever a stage closes or the active stage materially changes.

## Restart protocol

A fresh session should read, in this order:

1. [`STATUS.md`](../../STATUS.md) — project-wide maturity and priority;
2. this programme — active stage, gate logic and current execution state;
3. the latest closed `RH-*` gate record named here;
4. [Reference House README](../reference-house/README.md) — authority stack and architectural scope;
5. [Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md) — actual pattern use in the house;
6. only then the detailed studies relevant to the active stage.

Do not reconstruct project intent from chat when the repository gives a later answer.

If work is interrupted mid-stage, commit an **interrupted checkpoint** to the stage record containing:

- what has been established;
- what remains provisional;
- alternatives still alive;
- the exact next comparison or drawing required;
- any decision that must not be silently reopened.

That checkpoint is not a gate pass. It is a restart aid.

## Working rules

1. **One bounded architectural question per stage.** Avoid omnibus redesigns.
2. **A stage ends in a committed artefact.** Conversation is not project state.
3. **Existing geometry has no incumbency advantage.** Retain it only when comparison earns retention.
4. **Plan, section and elevation must converge.** Do not solve the house in plan and decorate it later.
5. **Keep authorities separate.** House Kernel doctrine, patterns, G-01, courtyard morphology, site/programme and Reference House tectonic choices must not be collapsed into one requirement set.
6. **Record rejected alternatives.** A later session should know why an apparently obvious option was abandoned.
7. **Promote only what the gate proves.** Virtual coordination cannot substitute for engineering, prototype or external evidence.
8. **Update the Pattern Occurrence Register when geometry creates, moves or destroys a real occurrence.**
9. **Prefer diagrams and explicit dimensions over prose when geometry is the issue.**
10. **Commit at each gate before starting the next stage.**

---

# Stage sequence

## RH-00 — Reconstitute the brief

**Question:** What is the house actually required to be, before inherited sketch geometry is allowed to bias the answer?

### Work

- extract programme requirements, household assumptions and known user preferences;
- separate hard requirements from preferences;
- separate House Kernel requirements from G-01 requirements and Reference House-specific choices;
- inventory current fixture assumptions;
- mark each inherited assumption as `retain for test`, `open`, or `reject unless re-earned`;
- identify missing site assumptions that materially affect virtual design.

### Deliverable

`docs/reference-house/brief-and-constraint-ledger.md`

### Gate RH-00

Pass only when a new session can answer, without reading old chat:

- what must be true;
- what is preferred;
- what is merely inherited;
- what remains unknown;
- which decisions belong to House Kernel, G-01 or this one house.

**Checkpoint:** commit the ledger and update this programme's current execution state.

---

## RH-01 — Test the gross morphology

**Question:** What overall house/courtyard geometry best satisfies the brief before room planning becomes detailed?

### Work

Develop a small serious comparison set, normally three materially different schemes. Test:

- outer footprint and total area;
- courtyard size, proportion and position;
- front–courtyard–garden sequence;
- wing depths and daylight consequences;
- likely structural simplicity;
- service-route consequences;
- external maintenance perimeter;
- G-01 ordering potential;
- area efficiency and avoidable circulation.

The current 12.6 × 11.4 m / 3.6 m courtyard fixture must appear only as one comparator or source hypothesis, not as the default winner.

### Deliverables

- `docs/reference-house/morphology-options.md`
- diagram(s) showing comparable gross geometry and metrics.

### Gate RH-01

Select one morphology as the working baseline, or explicitly carry two forward if the evidence is genuinely tied. Record why the losing options lost.

**Checkpoint:** commit options, decision and revised gross dimensions.

---

## RH-02 — Resolve ground-floor order

**Question:** Can the chosen morphology produce a convincing ground floor without technical logic overwhelming domestic architecture?

### Work

Resolve at coordination level:

- entrance and arrival sequence;
- drawing/living/family/dining relationships;
- kitchen and utility relationship;
- garden connection;
- courtyard thresholds;
- guest/study function;
- WC and service-hub geography;
- ordinary circulation and furniture-scale usability;
- principal room proportions under G-01.

Test at least one credible alternative room order before selecting the baseline.

### Deliverables

- `docs/reference-house/ground-floor-development.md`
- dimensioned schematic ground-floor plan SVG.

### Gate RH-02

Ground-floor room order and principal circulation become the controlled baseline. Gross morphology may still move only if the stage exposes a material upstream failure.

**Checkpoint:** commit baseline plan, rejected comparator and decision record.

---

## RH-03 — Resolve stair, upper floor and courtyard circulation

**Question:** Can vertical circulation, bedrooms, bathrooms and the courtyard edge form one coherent domestic composition?

### Work

Resolve:

- stair position, form, width, rise/going assumptions and headroom geometry;
- preservation or modification of the central axis;
- landing/gallery extent around the courtyard;
- principal bedroom hierarchy;
- secondary bedroom arrangement;
- bathroom/en-suite/service-access geography;
- privacy and acoustic relationships;
- daylight to circulation and wet rooms;
- voids and structural consequences.

### Deliverables

- `docs/reference-house/upper-floor-and-stair-development.md`
- upper-floor plan SVG;
- at least one longitudinal or courtyard section through the stair.

### Gate RH-03

A complete two-storey circulation and room-order baseline exists with no unresolved contradiction between stair, courtyard, bedrooms and wet-service clustering.

**Checkpoint:** commit plans/section and update occurrence geometry where necessary.

---

## RH-04 — Couple plan, section and G-01 elevation

**Question:** Does the spatial arrangement actually generate convincing Georgian-derived architecture when tested in section and elevation?

### Work

Coordinate:

- storey heights;
- floor depth zones;
- window head/sill relationships;
- opening hierarchy and bay rhythm;
- wall-to-opening proportions;
- entrance composition;
- courtyard elevation order;
- roof/cornice zone;
- G-01 plan–section–elevation coupling constraints.

This is an architectural test, not façade styling.

### Deliverables

- `docs/reference-house/plan-section-elevation-gate.md`
- principal section(s);
- front and courtyard elevation studies.

### Gate RH-04

Pass only if plan, section and elevation can coexist without disguising technical necessities or violating the selected grammar. Rewind RH-02/RH-03 where necessary.

**Checkpoint:** commit the coupled architectural baseline.

---

## RH-05 — Coordinate primary structure

**Question:** Can the architectural baseline be carried by a simple, legible structural concept without sacrificing the serviceability strategy?

### Work

At non-engineered coordination level:

- establish primary load paths;
- define likely loadbearing wall lines;
- set floor spanning directions;
- identify courtyard/stair trimming conditions;
- minimise transfers;
- register unavoidable structural/service crossings;
- identify questions requiring structural engineer review;
- connect Reference House geometry to P03 structural floor-edge work.

### Deliverables

- `docs/reference-house/structural-coordination.md`
- structural concept overlays/sections.

### Gate RH-05

No room or service strategy depends on implausible structure, hidden transfer gymnastics or arbitrary future drilling. Engineering assumptions are clearly labelled as assumptions.

**Checkpoint:** commit structural baseline and engineer question list.

---

## RH-06 — Coordinate services and failure geography

**Question:** Do actual service routes fit the house cleanly once dimensions, gravity, access and failure modes are taken seriously?

### Work

Resolve at coordination level:

- utility entry;
- plant replacement and working space;
- vertical service zone clear geometry;
- foul/soil routes and falls;
- water distribution classes;
- kitchen extract;
- bathroom extract;
- electrical/data distribution concept;
- horizontal route classes;
- designed structural penetrations;
- leak detection/visibility and isolation geography;
- dry-side access to maintainable wet-room components.

Re-test the east/rear service bias rather than assuming it survives.

### Deliverables

- revised `service-topology-coordination.md` or a superseding coordination record;
- service overlays and crossing register;
- updated Pattern Occurrence Register.

### Gate RH-06

Every major service can be traced from source to terminal and from installation to maintenance/replacement without relying on vague void space.

**Checkpoint:** commit routes, crossings, rewinds and occurrence updates.

---

## RH-07 — Resolve passive-first environmental design

**Question:** Can the architecture provide acceptable light, ventilation and summer/winter environmental behaviour before mechanical systems are used to rescue poor form?

### Work

Test:

- orientation assumptions;
- daylight and useful sunlight;
- courtyard contribution and penalties;
- purge ventilation paths;
- cross/stack ventilation opportunities;
- solar gains and shading;
- thermal-mass strategy where relevant;
- kitchen/bathroom source capture;
- bounded mechanical-assist scenarios;
- roof/terminal consequences.

### Deliverables

- `docs/reference-house/environmental-coordination.md`
- environmental diagrams and explicit unresolved modelling questions.

### Gate RH-07

The passive hierarchy is spatially credible and any active assistance has maintainable geography. If orientation or openings undermine the house, rewind rather than bolt on equipment.

**Checkpoint:** commit environmental baseline and modelling/review questions.

---

## RH-08 — Roof, drainage and external maintenance

**Question:** Can water leave the building safely and can the exterior actually be maintained without heroic access?

### Work

Resolve:

- roof form and drainage geometry;
- courtyard drainage and overflow strategy;
- rainwater routes;
- roof hatch/access strategy;
- façade/window maintenance access;
- ladder/scaffold/support zones;
- window replacement routes;
- plant replacement route;
- external landscape conflicts with access;
- service terminals and inspection points.

### Deliverables

- revised [External Access & Maintenance Plan](../reference-house/external-access-maintenance-plan.md);
- roof/drainage plan and access diagrams;
- new pattern occurrences where geometry is now real.

### Gate RH-08

Routine external tasks have credible access and drainage failure has explicit consequences/overflow routes. No important component is maintainable only by improvisation.

**Checkpoint:** commit roof/drainage/access baseline.

---

## RH-09 — Tectonic and occupied-surface integration

**Question:** How do the building's maintainable interfaces become convincing rooms rather than visible technical infrastructure?

### Work

Coordinate Reference House-specific implementations for:

- wall build-up / controlled attachment plane;
- skirting/service interfaces;
- floor access where justified;
- doors and thresholds;
- window replacement interfaces;
- wall/ceiling movement joint;
- cornice and restrained metal vocabulary;
- visible access panels and service indexing;
- ordinary fixing and exceptional loads.

Feed unresolved questions into P01, P02 and P04 rather than resolving them rhetorically.

### Deliverables

- revised tectonic architectural language where needed;
- representative room/junction drawings;
- explicit prototype handoff matrix.

### Gate RH-09

Every non-conventional tectonic move is either supported provisionally, routed to a prototype/engineering gate, or rejected. There are no decorative patches hiding unresolved assembly logic.

**Checkpoint:** commit tectonic baseline and prototype handoffs.

---

## RH-10 — Whole-house coordination audit

**Question:** Does the virtual house work as one building?

### Work

Perform an adversarial pass across:

- programme and everyday use;
- G-01 composition;
- structure;
- services;
- environment;
- moisture/drainage;
- fire/acoustic assumptions that affect geometry;
- maintenance and replacement;
- pattern occurrences;
- cost/area/complexity proportionality;
- authority drift between House Kernel, grammar and project choices.

Maintain a clash/rewind register. Resolve material failures rather than averaging them away.

### Deliverables

- `docs/reference-house/whole-house-coordination-audit.md`
- coordinated plan/section/elevation set at the project's virtual-design resolution;
- updated Pattern Occurrence Register.

### Gate RH-10

The Reference House may move from M2 toward M3 only when adjacent systems have been reconciled and the remaining uncertainty is explicitly engineering/prototype/external rather than basic architectural coordination.

**Checkpoint:** commit the audit and update project maturity only if the M3 gate is actually earned.

---

## RH-11 — External-review package

**Question:** Is the house explicit enough for competent outsiders to attack the important assumptions rather than merely react to a concept?

### Work

Prepare bounded review packages for:

- structural engineer;
- fire/building-control practitioner;
- building-services/ventilation engineer;
- later specialist review where prototype results justify it.

Each package should state the question, current assumption, drawings/evidence supplied, and what outcome would force redesign.

### Deliverables

`docs/reference-house/external-review-brief.md` plus discipline-specific appendices where useful.

### Gate RH-11

Reviewers can identify and challenge real decisions. The package does not ask them to design the missing house on the project's behalf.

**Checkpoint:** commit the review package; subsequent external findings become new evidence and may reopen earlier gates.

---

# Parallel physical-validation track

Physical validation proceeds alongside the virtual stages but has its own authority and gates under the [Tectonic Prototype and Engineering Programme](tectonic-prototype-programme.md).

Current sequence:

1. **P01 — W2 wall bay**;
2. **P02 — selective floor access**;
3. **P03 — structural floor edge**;
4. **P04 — wall/ceiling tectonic joint**.

The virtual house should provide increasingly realistic geometry to these prototypes. Prototype results may force a rewind of RH-04 through RH-10. Neither track waits for the other merely for administrative neatness.

# Definition of progress

Progress is not the number of drawings produced. Progress is the number of important uncertainties converted into one of four states:

- **resolved for the Reference House**;
- **bounded assumption awaiting specialist validation**;
- **routed to a physical test**;
- **rejected with a recorded reason**.

A clean rewind is progress. A beautifully documented ambiguity is not.