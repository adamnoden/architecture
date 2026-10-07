# Service Topology — Generative Sequence Pilot

**Status:** Phase 4 pilot v0.1  
**Sequence ID:** `service-topology`  
**Scope:** ordinary low-rise house; test sequence logic before full language migration  
**Pattern set:** [`pilot/`](pilot/README.md)

This sequence is not a services-design specification. It is an architectural ordering device for decisions whose timing strongly affects structure, room planning, boundaries, maintenance and later technical complexity.

The purpose is to answer a practical question:

> **In what order should the building create places for services so that later systems can be resolved without consuming the architecture that should have constrained them?**

---

## Starting context

Begin when the project has enough architectural order to know approximately:

- site access and likely utility approach;
- storey count and broad structural concept;
- principal rooms, circulation and high-service rooms;
- external maintenance and replacement access constraints;
- environmental strategy direction;
- which parts of the building are intended to be long-lived permanent fabric.

But begin **before** the plan, structure and envelope are so frozen that service coordination can only patch around them.

This is therefore neither the first design sequence nor a late engineering overlay.

---

# Sequence

## S1 — Map service demand before drawing routes

**Move:** identify service-intensive rooms, major plant classes, external utility sources, discharge points, likely replacement events and tasks requiring recurring access.

Do not draw pipework yet.

### Creates

- demand nodes;
- high-service-room map;
- likely plant/replacement events;
- likely external entry and discharge constraints.

### Why now

Routes cannot be coherent if the design has not distinguished primary demand from incidental fittings.

### Check before proceeding

Can the project identify which spaces will impose the greatest water, drainage, ventilation, electrical, control and maintenance burden?

### Rewind condition

If major service-intensive spaces have not even approximate positions, return to room planning. A topology generated from placeholder rooms is false precision.

---

## S2 — Establish controlled utility entry

**Invoke:** [`HSA-P-001 — Controlled Utility Entry`](pilot/controlled-utility-entry.md)

**Move:** determine credible entry geography for incoming utilities and the architectural/boundary condition where they become internal infrastructure.

### Creates

- one or more controlled external-to-internal transitions;
- likely isolation geography;
- constraints on nearby permanent fabric and site routes.

### Why now

Supplier routes and site edges can invalidate an elegant internal service plan if considered too late.

### Check before proceeding

- Are statutory/supplier constraints compatible with the proposed location?
- Can the boundary transition be detailed without casual later drilling?
- Is the route accessible enough for foreseeable work?

### Rewind condition

If the only credible utility entry cuts through a principal room, conflicts with flood/water exposure, blocks external maintenance or creates unreasonable structural penetrations, revisit site/plan organisation rather than disguising the problem in a cupboard.

---

## S3 — Place the service hub

**Invoke:** [`HSA-P-002 — Plant Room as Service Hub`](pilot/plant-room-service-hub.md)

**Move:** establish a proportionate internal hub for plant, primary isolation, distribution and maintenance-intensive equipment.

### Creates

- primary internal service origin;
- working and replacement geography;
- acoustic/heat/drainage constraints;
- a likely stewardship location.

### Why now

The plant hub is a room-planning decision as much as an engineering one. Its door, replacement path, drainage and adjacency cannot be recovered cheaply after the plan is fixed.

### Check before proceeding

- Can major equipment be delivered and replaced?
- Is routine access compatible with domestic privacy?
- Can noise and heat be contained?
- Is credible leakage or drainage handled safely?
- Does the hub connect sensibly to utility entry and likely distribution routes?

### Rewind condition

If the hub only fits by stealing unusable leftover space, has no replacement route, or requires service distribution to cross most principal rooms, revisit the plan.

---

## S4 — Resolve vertical distribution as an explicit architectural problem

**Pattern status:** **language gap discovered — no HSA pattern admitted yet**.

**Move:** for multi-storey houses, establish where vertical services can pass between storeys while preserving structure, boundaries, access and room quality.

### Creates

- provisional vertical distribution zone(s);
- stacking constraints for high-service rooms;
- likely floor/ceiling crossing locations;
- fire/acoustic/boundary obligations.

### Why now

A horizontal service language is incomplete in a multi-storey house without an intentional vertical transition.

### Check before proceeding

- Are high-service rooms reasonably stackable or connectable?
- Can the vertical route remain accessible where access is actually useful?
- Does it create uncontrolled fire/acoustic transfer?
- Is its area proportionate for a house?

### Rewind condition

If the proposed vertical route requires repeated structural improvisation or long branches to scattered wet rooms, revisit room adjacencies and stacking.

### Research action created by this sequence

Develop and test a **Vertical Service Riser** candidate against the pattern admission test before assigning it an HSA pattern ID.

This is a successful pilot finding: the sequence has exposed missing reusable knowledge rather than silently pretending the catalogue is complete.

---

## S5 — Re-test high-service-room adjacency and service-wall opportunities

**Invoke:** [`HSA-P-004 — High-Service-Room Service Wall`](pilot/high-service-room-service-wall.md)

**Move:** examine bathrooms, kitchens and utilities against the developing hub/vertical topology. Where worthwhile, reorganise fixtures or adjacencies so several high-maintenance components can share accessible service geography.

### Creates

- local service zones;
- shorter branch opportunities;
- dry-side access relationships;
- revised room/fixture constraints.

### Why now

The pattern can alter room adjacency and wall depth. Applying it after kitchens/bathrooms are fully designed turns an architectural pattern into a retrofit detail.

### Check before proceeding

- Does the zone serve enough real maintenance burden to justify its depth?
- Can access occur without exporting noise/privacy problems?
- Does waterproofing remain independent of routine access where practical?
- Can components actually be withdrawn?

### Rewind condition

If every high-service room needs its own bespoke service wall because the plan scatters them arbitrarily, return to plan/stacking decisions. Do not multiply infrastructure to preserve a weak adjacency plan.

---

## S6 — Establish horizontal distribution

**Invoke:** [`HSA-P-003 — Horizontal Service Spine`](pilot/horizontal-service-spine.md)

**Move:** connect the service hub / vertical distribution to local service zones through one or more coherent horizontal routes, with short local branches where practical.

### Creates

- route topology;
- depth/capacity demands;
- local access locations;
- boundary and acoustic/fire consequences;
- candidate crossing points.

### Why now

The route can now respond to real demand nodes instead of defining them arbitrarily.

### Check before proceeding

- Have duct sizes, drainage falls, insulation and bends been represented rather than idealised as lines?
- Does the route avoid becoming a continuous acoustic, smoke or pest path?
- Is access proportionate and compatible with ordinary rooms/circulation?
- Are gravity services forcing a different topology from power/data?

### Rewind condition

If the route needs excessive depth, long gravity runs or repeated crossings because the earlier hub/room/vertical decisions are poor, revisit those decisions. Do not create a whole-storey technical void merely to avoid moving one bathroom.

---

## S7 — Resolve crossings as interfaces, not holes

**Invoke:** [`HSA-P-005 — Designed Structural Penetration`](pilot/designed-structural-penetration.md)

**Move:** identify each necessary crossing of structure or significant boundary and turn it into an owned interface with defined geometry, host, roles and evidence obligations.

### Creates

- controlled penetration schedule;
- structural coordination requirements;
- boundary reinstatement obligations;
- explicit no-drill / permitted-crossing zones.

### Why now

Crossings should follow a coherent route topology. Designing holes first bakes accidental routing into permanent fabric.

### Check before proceeding

- Is each crossing actually necessary?
- Is the host structurally capable subject to engineering evidence?
- Which fire/acoustic/air/water/thermal/pest/security boundaries are affected?
- Can the detail be inspected or maintained where that matters?

### Rewind condition

If a route produces numerous bespoke structural crossings, first ask whether the route itself is wrong.

---

## S8 — Resolve credible water failure along the chosen topology

**Current language status:** classification under review.

The existing **Water-Damage-Safe Service Route** material should now be applied to the actual distribution topology.

### Move

For each pressurised-water and drainage condition, decide how credible leakage becomes detectable, containable and repairable without silently consuming vulnerable construction.

### Why this stage matters

Only after topology exists can the project distinguish where accessibility, pipe-in-pipe, containment, passive drainage, joint minimisation or automatic isolation is proportionate.

### Classification question

If fundamentally different physical patterns are selected in different parts of the house while sharing only the performance goal, reclassify the present Core Pattern 06 as a strategy and admit narrower child patterns later.

### Rewind condition

If safe failure requires elaborate containment everywhere because the chosen service route passes continuously over vulnerable inaccessible construction, revisit the route.

---

## S9 — Establish stewardship identity

**Invoke:** [`HSA-P-012 — Physical Service Index`](pilot/physical-service-index.md)

**Move:** assign stable identifiers to principal systems, isolators, routes and maintainable components; determine the restrained physical index that will survive alongside richer digital records.

### Creates

- identifier strategy shared by drawings, labels and records;
- physical index location;
- handover/change-control expectation.

### Why now

Identifiers need the system topology to be real, but should exist before commissioning and documentation become a separate naming exercise.

### Check before proceeding

Can a future competent person locate principal isolation and understand the major system routes if the digital project environment is unavailable?

### Rewind condition

If the installed topology is too irregular to describe simply, do not solve that solely with better labelling. First ask whether the system itself has become needlessly complex.

---

# Sequence summary

```text
SERVICE DEMAND MAP
        ↓
HSA-P-001  Controlled Utility Entry
        ↓
HSA-P-002  Plant Room as Service Hub
        ↓
VERTICAL DISTRIBUTION — OPEN LANGUAGE GAP
        ↓
HSA-P-004  High-Service-Room Service Wall opportunities
        ↓
HSA-P-003  Horizontal Service Spine
        ↓
HSA-P-005  Designed Structural Penetrations
        ↓
WATER-FAILURE STRATEGY — CLASSIFICATION TEST
        ↓
HSA-P-012  Physical Service Index
```

This ordering is deliberately **not identical to the pattern graph**. `HSA-P-004` completes `HSA-P-003` conceptually at the local scale, yet service-wall opportunities are tested before the horizontal route is finalised because room adjacency is more expensive to change later.

That distinction is one of the main reasons to keep language relationships and generative sequences separate.

---

# Pilot findings already produced

Even before reference-house application, the sequence has generated two non-trivial findings:

1. **Vertical distribution is underrepresented in the current pattern corpus.** The publication architecture names a riser, but the Core 12 pilot set has no equivalent reusable pattern.
2. **Water-Damage-Safe Service Route may be too broad to remain one pattern.** The sequence makes its role look more like a strategy applied after topology, with narrower patterns likely needed for specific recurring relationships.

Neither finding should be promoted to permanent taxonomy until the reference-house trial.

---

# Next gate

Apply this sequence to the current reference-house material.

The trial should record:

- which steps can actually be answered;
- where existing reference-house work already contains the needed decision implicitly;
- missing information;
- conflicts and rewind events;
- missing patterns;
- patterns that prove too broad or too implementation-specific;
- whether the sequence adds enough value to authorise the full corpus audit.
