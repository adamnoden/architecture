---
id: HSA-P-003
title: Coherent Horizontal Service Route
kind: pattern
state: active
evidence: supported
maturity:
  - drawn
scales:
  - building
  - zone
domains:
  - services
  - maintenance
  - acoustics
  - fire
  - lifecycle
principles:
  - 2
  - 5
  - 6
  - 8
requires: []
completes: []
alternative_to: []
tension_with: []
sequences:
  - service-topology
---

# HSA-P-003 — Coherent Horizontal Service Route

**Identity note:** this is the audited continuation of `HSA-P-003 Horizontal Service Spine`. Phase 6 preserved the identity but changed the name because “spine” too easily implied one universal mixed-services duct.

## Context

Use where horizontal services would otherwise be routed room-by-room through structure, finished construction or unrelated boundaries, creating repeated crossings and future destructive work.

The pattern is strongest where several rooms or service demands can share deliberate route geography. It may be unnecessary where only a few short, direct local runs exist.

## Problem

The individually shortest route for each pipe, cable or duct is often poor whole-building architecture. Independent routing accumulates penetrations, chases, inaccessible junctions and maintenance activity across many rooms.

The opposite mistake is to create one oversized “service spine” and force every service into it regardless of gravity, duct size, segregation, acoustics or actual destination.

## Pattern

> **Organise horizontal distribution into a small number of coherent, service-appropriate routes along circulation, service-heavy edges or other maintainable geography, then branch locally to rooms. Do not force incompatible or geometrically unsuitable services into one shared duct merely for conceptual neatness.**

The invariant is **route coherence**. A project may legitimately use more than one horizontal route by service class.

## Forces

- the shortest individual route may not be the best whole-building route;
- shared geography can reduce repeated crossings and maintenance disturbance;
- power, data, water, drainage and ventilation have different size, fall, segregation and access requirements;
- ducts and gravity drainage may need more depth than cables or small-bore distribution;
- concentrated routes create fire, acoustic, moisture and pest consequences;
- spare capacity can be useful but oversized routes consume space and invite uncontrolled later use;
- domestic circulation should not read as institutional infrastructure.

## Relationships

A coherent horizontal route often begins near a [Plant Room as Service Hub](plant-room-service-hub.md) or vertical service zone, but neither is mandatory.

[High-Service-Room Service Wall](high-service-room-service-wall.md) commonly **completes** this pattern at room scale by giving a concentrated route somewhere useful to terminate.

[Designed Structural Penetration](designed-structural-penetration.md) resolves the crossings that remain after route topology has been simplified. It should not be used as an excuse to preserve a poor route plan.

Sequence order is recorded in the service-topology sequence rather than encoded here as dependency edges.

## Variants / implementation families

- corridor-side wall/joinery route;
- accessible ceiling-edge or local ceiling zone;
- shallow floor-side route;
- service-heavy external/internal wall edge;
- low-level dry-service route paired with a separate gravity/duct route;
- short local deep zone only where a bulky service genuinely requires it.

A project may combine several variants.

## Design requirements

- coordinate disciplines on one whole-building route plan rather than independently;
- identify which service classes may actually share geography;
- separate incompatible services as required;
- keep gravity drainage short and correctly graded rather than bending it into a convenient abstract route;
- stop open voids at compartment/boundary lines;
- reserve spare capacity only where useful;
- provide access at actual maintenance nodes rather than making the entire route removable by default;
- avoid making every room part of the maintenance route;
- show the transition from principal route to local room distribution.

## Proportionality

The route earns dedicated depth or access only where concentration materially reduces destructive crossings, maintenance disturbance or future retrofit difficulty.

A whole-storey raised floor or dropped ceiling is not justified merely because it would make routing easy. Local or service-specific geometry should be preferred where it achieves the same outcome with less area/material/depth.

## Boundary debt

Check where applicable:

- fire/smoke compartmentation;
- acoustic flanking and speech transfer;
- air/thermal continuity at envelope crossings;
- water leakage consequences;
- pests through continuous voids;
- structural crossings/support;
- access-panel boundary performance.

A route is not a boundary-free corridor.

## Permanent-fabric impact

The pattern aims to reduce random permanent-fabric work by concentrating a smaller number of route interfaces and crossings. Record the deliberate openings/supports it still requires and protect no-drill zones elsewhere.

## Workmanship / tolerance

Size route envelopes using installed dimensions, including insulation, bends, supports, falls and access space—not nominal service diameters alone.

Where a route meets structure or manufactured joinery, define the controlling datum and realistic adjustment space. Do not leave the final trade to reconcile a service route that exists only as a centreline on drawings.

## Occupation / repose impact

A coherent route should reduce disturbance elsewhere without turning circulation or principal rooms into technical interiors. It must not become a path for speech, plumbing noise, smoke, fan hum or light leakage.

Where a corridor or joinery edge carries the route, it should still read first as domestic architecture.

## Architectural resolution

Use real architectural edges—skirtings, joinery zones, secondary corridors, ceiling margins or service-room boundaries—where they genuinely suit the service geometry. Do not invent decorative depth merely to hide a technical route, and do not allow commercial trunking logic to dictate room composition by default.

## Maintenance / replacement sequence

For each route class, define:

1. access points;
2. isolation/disconnection;
3. how a failed/replaced component is reached;
4. whether the route itself or only nodes need opening;
5. which boundaries are disturbed;
6. how reinstatement is verified.

## Failure modes

- one mixed-services void is created for conceptual neatness;
- route is too small after insulation, supports, bends or drainage falls are included;
- continuous void becomes a sound/smoke/pest path;
- route is placed where furniture/storage blocks access;
- gravity drainage is forced through excessive bends or depth changes;
- every wall/floor edge becomes serviceable infrastructure despite little actual demand;
- local branches become long enough to defeat the reason for concentration.

## Evidence

Historic England recommends shared/common routes where services would otherwise repeatedly scar fabric. Approved Document R provides a narrower precedent for planned vertical and horizontal communications infrastructure in residential buildings.

The Phase-5 Reference House trial materially sharpened the pattern by showing that one universal horizontal spine is not the invariant: wet/gravity/extract routes remained concentrated while dry/small-bore distribution fanned out through separate appropriate routes.

**Evidence anchors:** Historic England, *Installing New Services*; Approved Document R; Reference House Service Topology Run 01 as an integration test, not external evidence.

## Does not prove

A detached house does not thereby need a commercial corridor ceiling, raised floor or universal accessible duct. Nor does route coherence establish that incompatible services should share an enclosure.

## Reference House application

The Phase-5 fixture uses provisional occurrence `RH-P003-01` as a topology rather than one physical duct:

- `HS-G-01` ground east/rear service route;
- `HS-U-01` upper east/landing route;
- `LB-01` selective low-level dry/small-bore branches;
- soil/waste, kitchen source extract and major ventilation remain outside the horizontal route where direct vertical/external geometry is better.

## Formalisation boundary

Potentially formal consequences include:

- route identity and continuity;
- service-class membership;
- clearance envelopes;
- branch lengths;
- crossings and boundary transitions;
- access nodes;
- prohibited routing through selected permanent/structural zones.

Whether a route is architecturally proportionate, domestically quiet, visually subordinate and worth the area/depth it consumes remains design judgement.