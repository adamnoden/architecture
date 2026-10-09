# Service Topology — Generative Sequence

**Sequence ID:** `service-topology`

This sequence orders architectural decisions that strongly affect structure, room planning, boundaries, maintenance and later technical complexity. It is not a services-design specification and does not prescribe one mechanical or electrical system.

Its practical question is:

> **In what order should the building create places for services so that later systems can be resolved without consuming the architecture that should have constrained them?**

## Starting context

Begin when the project has enough architectural order to know approximately:

- site access and likely utility approach;
- storey count and broad structural concept;
- principal rooms, circulation and service-intensive rooms;
- external maintenance and replacement constraints;
- environmental strategy direction;
- which parts of the building are intended to be long-lived permanent fabric.

Begin before the plan, structure and envelope are so fixed that service coordination can only patch around them.

# Sequence

## S1 — Map service demand before drawing routes

**Move:** identify service-intensive rooms, major plant classes, external utility sources, discharge points, likely replacement events and tasks requiring recurring access.

Do not draw detailed routes yet.

### Creates

- demand nodes;
- service-intensive-room map;
- likely plant and replacement events;
- external entry and discharge constraints.

### Check before proceeding

Can the project identify which spaces impose the greatest water, drainage, ventilation, electrical, control and maintenance burden?

### Rewind condition

If major service-intensive spaces do not have even approximate positions, return to room planning. A topology generated from placeholder rooms is false precision.

## S2 — Establish controlled utility entry

**Invoke:** [`HSA-P-001 — Controlled Utility Entry`](controlled-utility-entry.md)

**Move:** determine credible entry geography for incoming utilities and the architectural/boundary condition where they become internal infrastructure.

### Creates

- one or more controlled external-to-internal transitions;
- likely isolation geography;
- constraints on nearby permanent fabric and site routes.

### Check before proceeding

- Are statutory and supplier constraints compatible with the proposed location?
- Can the boundary transition be detailed without casual later drilling?
- Is the route accessible enough for foreseeable work?

### Rewind condition

If the only credible utility entry cuts through a principal room, conflicts with exposure or blocks external maintenance, revisit site and plan organisation rather than disguising the problem in residual space.

## S3 — Place the service hub

**Invoke:** [`HSA-P-002 — Plant Room as Service Hub`](plant-room-service-hub.md)

**Move:** establish a proportionate internal hub for plant, primary isolation, distribution and maintenance-intensive equipment.

### Creates

- primary internal service origin;
- working and replacement geography;
- acoustic, heat and drainage constraints;
- a likely stewardship location.

### Check before proceeding

- Can major equipment be delivered and replaced?
- Is routine access compatible with domestic privacy?
- Can noise and heat be contained?
- Is credible leakage or drainage handled safely?
- Does the hub connect sensibly to utility entry and likely distribution routes?

### Rewind condition

If the hub has no replacement route or requires service distribution to cross most principal rooms, revisit the plan.

## S4 — Resolve vertical distribution

**Invoke where justified:** [`HSA-P-014 — Accessible Vertical Service Zone`](accessible-vertical-service-zone.md)

**Move:** in multi-storey houses, establish how services pass between storeys while preserving structure, boundaries, access and room quality. The answer may be a deliberate service zone, several smaller stacks or another proportionate arrangement.

### Creates

- vertical distribution zone or zones;
- stacking constraints for service-intensive rooms;
- likely floor and ceiling crossing locations;
- fire, acoustic and maintenance obligations.

### Check before proceeding

- Are service-intensive rooms reasonably stackable or connectable?
- Does a dedicated zone earn its area?
- Can required access be provided without creating an uncontrolled fire or acoustic path?
- Are wet and dry services separated where their technical requirements demand it?

### Rewind condition

If vertical distribution requires repeated structural improvisation or long branches to scattered wet rooms, revisit room adjacencies and stacking before adding more infrastructure.

## S5 — Re-test service-intensive rooms and local service walls

**Invoke where useful:** [`HSA-P-004 — High-Service-Room Service Wall`](high-service-room-service-wall.md)

**Move:** examine bathrooms, kitchens and utility spaces against the developing hub and vertical topology. Reorganise fixtures or adjacencies where a shared maintainable zone materially reduces destructive access or branch complexity.

### Creates

- local service zones;
- shorter branch opportunities;
- dry-side access relationships;
- revised fixture and room constraints.

### Check before proceeding

- Does the zone serve enough real maintenance burden to justify its depth?
- Can access occur without exporting noise or privacy problems?
- Can components actually be disconnected and withdrawn?
- Can waterproofing and other primary boundaries remain reliable?

### Rewind condition

If every service-intensive room needs bespoke infrastructure because the plan scatters them arbitrarily, revisit the plan rather than multiplying service space.

## S6 — Establish coherent horizontal distribution

**Invoke:** [`HSA-P-003 — Coherent Horizontal Service Route`](coherent-horizontal-service-route.md)

**Move:** connect the hub, vertical distribution and local service zones through one or more coherent horizontal routes, with short local branches where practical.

### Creates

- route topology;
- depth and capacity demands;
- local access locations;
- boundary and acoustic/fire consequences;
- candidate crossing points.

### Check before proceeding

- Have duct sizes, drainage falls, insulation, supports and bends been represented rather than idealised as lines?
- Does the route avoid becoming a continuous acoustic, smoke or pest path?
- Is access proportionate and compatible with ordinary rooms and circulation?
- Are gravity services forcing a different topology from power or data?

### Rewind condition

If the route needs excessive depth, long gravity runs or repeated crossings because earlier hub, room or vertical decisions are poor, revisit those decisions. Do not create a whole-storey technical void merely to preserve a weak plan.

## S7 — Resolve void boundaries and crossings

**Invoke as applicable:**

- [`HSA-P-016 — Compartmented Service Void`](compartmented-service-void.md)
- [`HSA-P-005 — Designed Structural Penetration`](designed-structural-penetration.md)

**Move:** stop open service voids at significant boundaries and identify every necessary crossing of structure or protected construction as an owned interface with defined geometry and evidence obligations.

### Creates

- compartment lines;
- controlled crossing schedule;
- structural coordination requirements;
- boundary-reinstatement obligations;
- explicit no-drill and permitted-crossing zones.

### Check before proceeding

- Is each crossing necessary?
- Which structural, fire, acoustic, air, water, thermal, pest or security duties apply?
- Does the open void stop where those boundaries require it?
- Can future work reach the crossing without casually destroying its reinstatement?

### Rewind condition

If a route produces numerous bespoke structural crossings or a continuous uncontrolled void, first ask whether the route itself is wrong.

## S8 — Resolve credible water failure

**Apply:** [Fail-Safe Water Distribution](strategies/fail-safe-water-distribution.md)

**Invoke narrower patterns where their contexts apply:**

- [`HSA-P-017 — Visible Leakage Path`](visible-leakage-path.md)
- [`HSA-P-018 — Failure-Tolerant Wet Service Room`](failure-tolerant-wet-service-room.md)

**Move:** for pressurised-water and drainage conditions, decide how credible leakage is prevented, detected, contained, isolated, drained or made repairable without silently consuming vulnerable construction.

### Check before proceeding

- Have joints been minimised where concealment makes failure consequential?
- Is isolation accessible?
- Where secondary containment is justified, does water have a real physical destination?
- Does the protection create its own maintenance or moisture problem?

### Rewind condition

If safe failure requires elaborate containment everywhere because the selected route passes continuously over vulnerable inaccessible construction, revisit the route.

## S9 — Resolve room-scale distribution

**Invoke where useful:** [`HSA-P-015 — Accessible Room Service Route`](accessible-room-service-route.md)

**Move:** carry appropriate low-level or room-scale services from the primary topology into rooms through architectural layers or joinery where repeated change justifies it.

### Check before proceeding

- Is an accessible local route actually likely to earn its depth and complexity?
- Are service classes compatible with the selected zone?
- Does the room still read as architecture rather than trunking?
- Are safe fixing and no-fix relationships intelligible?

### Rewind condition

If local accessibility distorts the room or creates more technical apparatus than the likely change justifies, use a simpler conventional route.

## S10 — Establish stewardship identity

**Invoke:** [`HSA-P-012 — Physical Service Index`](physical-service-index.md)

**Move:** assign stable identifiers to principal systems, isolators, routes and maintainable components; define the restrained physical information that should survive alongside richer digital records.

### Creates

- identifier strategy shared by drawings, labels and records;
- physical index location;
- handover and change-control expectations.

### Check before proceeding

Can a future competent person locate principal isolation and understand the major system routes if the original digital project environment is unavailable?

### Rewind condition

If the installed topology is too irregular to describe simply, do not solve that solely with more labels. First ask whether the system itself has become needlessly complex.

# Sequence summary

```text
SERVICE DEMAND MAP
        ↓
HSA-P-001  Controlled Utility Entry
        ↓
HSA-P-002  Plant Room as Service Hub
        ↓
HSA-P-014  Accessible Vertical Service Zone — where justified
        ↓
HSA-P-004  High-Service-Room Service Wall — where useful
        ↓
HSA-P-003  Coherent Horizontal Service Route
        ↓
HSA-P-016  Compartmented Service Void
      + HSA-P-005  Designed Structural Penetration
        ↓
FAIL-SAFE WATER DISTRIBUTION
      ↳ HSA-P-017 / HSA-P-018 where applicable
        ↓
HSA-P-015  Accessible Room Service Route — where useful
        ↓
HSA-P-012  Physical Service Index
```

The sequence is not identical to the pattern graph. Graph relationships describe reusable architectural relationships; a generative sequence orders decisions by when they become expensive to reverse. A pattern may therefore be considered earlier or later than its graph relation alone would suggest.

The sequence is also deliberately incomplete. Kitchen and bathroom extraction, rainwater, roof access, openings and other patterns intersect service topology but have their own environmental, envelope or maintenance logic. They should enter when those decisions become live rather than being forced into one universal master sequence.
