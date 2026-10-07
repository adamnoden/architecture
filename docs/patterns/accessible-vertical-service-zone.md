---
id: HSA-P-014
title: Accessible Vertical Service Zone
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
  - fire
  - acoustics
  - lifecycle
  - repose
principles:
  - 2
  - 3
  - 5
  - 6
  - 8
  - 10
requires: []
completes: []
alternative_to: []
tension_with: []
sequences:
  - service-topology
---

# HSA-P-014 — Accessible Vertical Service Zone

## Context

A multi-storey house contains enough vertically connected service demand that independent floor-by-floor routing would create repeated structural crossings, long branches, inaccessible joints or poorly coordinated shafts.

The pattern may be unnecessary in a single-storey house, a very small dwelling or a plan where one or two ordinary stacks/chases already resolve vertical demand cleanly.

## Problem

Vertical services are often treated as whatever remains after room planning: soil stack in one corner, ventilation elsewhere, cables drilled through floors and later additions finding new paths.

Each system may work individually while the building accumulates repeated penetrations, inaccessible junctions, fire/acoustic discontinuities and routes future trades cannot understand.

A domestic house does not justify a commercial services shaft merely because larger buildings use one. The problem is to create enough deliberate vertical geography without turning the house into plant infrastructure.

## Pattern

**Where several service systems need to pass between storeys, reserve a deliberate vertical service zone aligned with service-intensive rooms. Size and subdivide it for the real systems and boundary obligations; make access available only where it materially improves inspection, isolation, maintenance or replacement.**

The invariant is the planned vertical zone, not a particular shaft construction, enclosure size or promise of continuous access.

## Forces

- vertical concentration reduces repeated structural crossings;
- drainage and ventilation benefit from direct, low-resistance vertical routes;
- water, electrical, ventilation and drainage have different support/separation requirements;
- a continuous void can transmit fire, smoke, sound and pests;
- access consumes area and may weaken fire/acoustic performance;
- some services need access only at specific nodes;
- oversized spare zones invite uncontrolled later use;
- domestic architecture should not acquire an institutional shaft character;
- future systems will not exactly match current dimensions.

## Variants / implementation families

- **Accessible service cupboard/riser** — bounded zone with useful storey-level access.
- **Split wet and dry vertical zones** — where separation outweighs the cost of multiple routes.
- **Narrow stack/chase with local access nodes** — smaller permanent route with access only at actual maintenance points.
- **Joinery-integrated vertical route** — genuine architectural cupboard/joinery where service scale permits.

These remain implementation families unless later worked cases reveal different recurring patterns.

## Proportionality

The zone earns permanent area only where it materially reduces repeated structural penetrations, long gravity/duct branches, destructive future access, inaccessible maintenance nodes or route confusion. A large empty shaft reserved for unspecified futures fails the test.

## Boundary debt

Resolve floor/ceiling fire separation, smoke, acoustic flanking, envelope crossings, moisture/condensate, pest pathways, structural support and service separation. A service zone is not boundary-free merely because it exists for infrastructure.

## Permanent-fabric impact

The pattern intentionally concentrates a smaller number of designed floor/roof/wall interfaces rather than licensing arbitrary later drilling. Permanent openings/supports should be recorded; unused spare capacity should be bounded and closed robustly.

## Workmanship and tolerance

- define clear envelope after structure, fire/acoustic linings, supports and insulation are included;
- establish controlling datums before manufactured service systems arrive;
- ensure access exposes the component that actually needs work;
- inspect cavity closure/fire stopping at suitable hold points;
- do not rely on the final trade to reconcile cumulative dimensional conflict.

## Occupation / repose impact

The zone should normally recede into secondary circulation, service rooms or genuine domestic cupboards. Check plumbing noise, fan/duct noise, vibration, access-door rattles and light leakage. A technically efficient riser that makes bedrooms sound like a plant room fails the house.

## Failure modes

- zone sized from centre-lines and unusable after supports/insulation;
- all services share one void without separation logic;
- access door exists but valves/fans cannot be worked on or withdrawn;
- continuous void becomes a fire/acoustic path;
- future contractors bypass the zone because it is full or undocumented;
- oversized zone becomes storage;
- route sits far from actual service demand;
- architecture is distorted to preserve a zone that no longer earns its area.

## Evidence

CIBSE maintainability guidance supports designing service systems around operation and maintenance over their service life. Approved Documents B, H and F demonstrate the real fire, drainage and ventilation obligations that vertical routes must accommodate. The Phase-5 Reference House run showed the pattern materially improved whole-house service topology without requiring a commercial-scale riser.

## Does not prove

The evidence does not establish that every two-storey house needs a dedicated riser, that all service classes should share one enclosure, that larger means more adaptable, or that access is needed along every part of the route.

## Reference House application

Historical occurrence `RH-CAND-VSR-01` reserves one east/rear vertical zone between the lower service hub and upper service area, with split wet/dry routing retained as the principal comparator. The occurrence helped test the pattern; it is not evidence of technical adequacy.

## Formalisation boundary

Zone continuity, clear envelope, relationship to demand nodes, crossing count, declared maintenance nodes and boundary transitions can be represented formally. Proportionality, domestic character, repose and whether the reserved area earns its cost remain architectural judgement.

---

**Provenance:** promoted from [`candidates/accessible-vertical-service-zone.md`](candidates/accessible-vertical-service-zone.md) after the Phase-6 gate review. Stable identity does not increase evidence or technical maturity.
