---
id: HSA-P-003
title: Coherent Horizontal Service Route
kind: pattern
state: active
evidence: supported
maturity: []
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
completes:
  - HSA-P-002
alternative_to: []
tension_with: []
sequences:
  - service-topology
---

# HSA-P-003 — Coherent Horizontal Service Route

## Context

A house needs horizontal distribution between plant or primary service locations and several rooms or zones. Without an explicit topology, each discipline tends to find its own path through structure, ceilings, floors and finished rooms.

## Problem

Room-by-room routing creates repeated crossings of structure and boundaries, scatters access points and makes later additions repeat the same damage. A nominally available void can also become an uncontrolled common route for smoke, sound, pests or incompatible services.

## Pattern

**Bias horizontal distribution toward a coherent route or small family of routes from which shorter local branches serve rooms. The route may be an edge, circulation band, ceiling zone, floor-side zone or other proportionate architectural condition; it need not be one literal spine.**

The Phase-6 migration deliberately changes the name from **Horizontal Service Spine**. The stable identity survives because the recurring problem and response are unchanged; the new title avoids implying one continuous central duct as the preferred implementation.

## Forces

- the shortest individual route may not be the best whole-building route;
- shared routes concentrate fire, acoustic and maintenance consequences;
- gravity drainage and larger ducts may need different depth or fall from cables and small pipes;
- circulation must remain domestic rather than becoming a technical corridor;
- future capacity is useful only where it remains genuinely accessible and compatible.

## Relationships

This pattern commonly **completes** [HSA-P-002 — Plant Room as Service Hub](plant-room-service-hub.md) by extending concentrated services through the building without immediately dissolving into ad-hoc branches.

It is not a hard dependency. Distributed plant, existing buildings or unusual forms may produce coherent horizontal routes without a single service hub.

## Design requirements

- coordinate disciplines on one route plan rather than separate hidden assumptions;
- distinguish services that can share a zone from those needing separation, fall, depth or fire/acoustic treatment;
- stop open voids at relevant boundaries;
- reserve spare capacity only where it is likely to remain usable;
- provide access at sensible intervals and at maintainable components;
- avoid making every room part of the maintenance route;
- do not treat structural floor or ceiling zones as free service space before their primary duties are resolved.

## Proportionality

The pattern is strongest where several services need to reach several rooms. A small isolated branch should remain local rather than being forced through a ceremonial “spine”.

## Boundary debt

Shared routes can become paths for smoke, speech, plumbing noise, vibration, pests and air leakage. Fire/acoustic/air boundaries must remain explicit, and crossings through them should use designed interfaces.

## Permanent-fabric impact

The route should reduce random chasing, drilling and notching by concentrating unavoidable crossings at planned locations. It does not justify a large permanent void merely to preserve speculative flexibility.

## Workmanship and tolerance

Size the route from real outer dimensions, insulation, bend radii, gradients, supports and access clearances. Do not coordinate on centre-lines and export the dimensional conflict to site.

## Occupation and repose

A coherent route should reduce disturbance elsewhere without turning circulation or principal rooms into technical interiors. Noise, grilles, panels and ceiling/floor depth must remain subordinate to the architecture.

## Failure modes

- route is too small once insulation and bends are included;
- one continuous void bypasses fire or acoustic separation;
- drainage is forced into impossible falls;
- later furniture or joinery blocks access;
- all services are forced into one zone despite incompatible requirements;
- “coherence” becomes a needlessly deep whole-house service floor or ceiling.

## Evidence

Historic England supports shared/common service routes where repeated individual routes would scar fabric. Approved Document R provides a narrower precedent for planned vertical and horizontal communications infrastructure. The Reference House Phase-5 run also showed that coherent routing is useful while a universal deep mixed-services duct is not.

## Does not prove

A detached house does not thereby need a commercial corridor ceiling, raised floor or one central service duct. The transferable pattern is route coherence and controlled branching.

## Reference House application

The Reference House uses ordinary circulation and service-heavy edges as the primary horizontal topology, with local deeper conditions only where ducts, drainage or access justify them. The Phase-5 run explicitly rejected a universal deep mixed-services route.

## Formalisation boundary

Route continuity, capacity envelopes, branch relationships, forbidden boundary crossings and access intervals can be represented formally. Whether the route produces a good domestic section and proportionate spatial cost remains architectural judgement.

---

**Provenance:** migrated from Pattern 03 **Horizontal Service Spine** in [`core-12.md`](core-12.md), [`pilot/horizontal-service-spine.md`](pilot/horizontal-service-spine.md), and the Phase-6 identity audit. `HSA-P-003` retains identity through the scope/name correction.
