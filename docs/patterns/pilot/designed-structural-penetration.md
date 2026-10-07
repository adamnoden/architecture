---
id: HSA-P-005
title: Designed Structural Penetration
kind: pattern
state: pilot
evidence: established
maturity: []
scales:
  - assembly
  - interface
domains:
  - services
  - structure
  - envelope
  - fire
  - acoustics
  - maintenance
principles:
  - 2
  - 3
  - 11
requires: []
completes:
  - HSA-P-003
  - HSA-P-004
alternative_to: []
tension_with: []
sequences:
  - service-topology
---

# HSA-P-005 — Designed Structural Penetration

**Pilot language record.** The full developed pattern prose remains in [`../core-12.md`](../core-12.md) during the migration pilot.

## Context

Coherent service routes still need to cross structural and environmental boundaries. If those crossings are discovered late, drilling, notching, oversized holes and improvised reinstatement follow.

## Invariant

Treat required crossings as designed interfaces established during structural/service coordination. Define location, size, structural effect and applicable boundary reinstatement before construction.

## Why this is a pattern

The recurring architectural relationship is the controlled crossing of one system through another, not a particular sleeve or collar product. Different structural systems and boundary roles can use different implementation families while preserving the same pattern.

## Language relationships

### Completes `HSA-P-003 — Horizontal Service Spine`

A route is not resolved merely because a line can be drawn through the plan. Where the spine meets structure or a protected boundary, this pattern converts the abstract route into a controlled crossing.

### Completes `HSA-P-004 — High-Service-Room Service Wall`

Local service zones commonly create crossings at floors, walls and room boundaries. The penetration pattern prevents those local branches from becoming unowned holes.

Neither relation means every service spine or wall requires a structural penetration. The link matters where a crossing actually occurs.

## Sequence note

Do not lay out individual holes before the route topology is known. Conversely, do not freeze structure while assuming services will “find a way through” later. Route and structural coordination should converge before construction geometry is released.

## Formalisation boundary

This pattern has unusually strong formal potential: opening identity, host identity, permissible location, geometry, boundary roles, no-drill zones and evidence obligations can all be explicit.

Structural adequacy, fire performance, acoustic performance and product/system applicability still require scoped evidence; the compiler must not infer adequacy merely from the existence of a penetration object.

## Current source

See **Pattern 05 — Designed structural penetration** in the [Core Pattern Catalogue](../core-12.md).
