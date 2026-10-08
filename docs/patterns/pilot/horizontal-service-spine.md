---
id: HSA-P-003
title: Horizontal Service Spine
kind: pattern
state: pilot
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

# HSA-P-003 — Horizontal Service Spine

> **Historical Phase-3 pilot record.** This page preserves the earlier “spine” formulation. The canonical pattern is now [`HSA-P-003 — Coherent Horizontal Service Route`](../coherent-horizontal-service-route.md), which retains the identity while broadening the invariant beyond one literal spine.

## Context

A house needs horizontal distribution between plant or primary service locations and multiple rooms. Uncoordinated room-by-room routing creates repeated crossings of structure, boundaries and finished space.

## Invariant

Bias horizontal distribution toward a coherent service edge, circulation band or floor/ceiling zone from which shorter local branches serve rooms.

## Why this is a pattern

The pattern does not prescribe raised floors, corridor ceilings or one construction technology. It describes a recurring topology: coherent shared distribution first, short local branches second.

## Language relationships

### Completes `HSA-P-002 — Plant Room as Service Hub`

The service hub concentrates equipment and distribution. The horizontal spine extends that organisation through the building rather than allowing it to dissolve immediately into ad-hoc routes.

The relation is not a hard dependency: distributed plant or unusual house forms may generate a spine from another source condition.

## Sequence note

Resolve the broad horizontal route before individual room branches and before repeated structural penetrations are detailed. The route must be tested against acoustic, fire, drainage and depth requirements before it is treated as “available void”.

## Formalisation boundary

Potentially formalisable consequences include route continuity, capacity envelopes, forbidden boundary crossings, branch relationships and access intervals.

Whether the route produces a domestic rather than institutional interior remains architectural judgement.

## Canonical successor

See [`HSA-P-003 — Coherent Horizontal Service Route`](../coherent-horizontal-service-route.md). The earlier developed aggregate prose remains in the historical [Core Pattern Catalogue](../core-12.md).
