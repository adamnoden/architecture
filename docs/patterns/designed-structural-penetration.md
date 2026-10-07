---
id: HSA-P-005
title: Designed Structural Penetration
kind: pattern
state: active
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

## Context

Coherent service routes still need to cross structural and environmental boundaries. If those crossings are discovered after structure is substantially fixed, drilling, notching, chasing, oversized holes and improvised reinstatement follow.

## Problem

The crossing is often treated as a service detail even though it simultaneously affects structure, fire, acoustics, air, moisture, weathering and later maintenance. No one owns the interface as a whole.

## Pattern

**Treat required crossings as designed interfaces established during structural/service coordination. Define their location, size, structural effect and applicable boundary reinstatement before construction.**

The recurring relationship is the controlled crossing of one system through another, not a particular sleeve, collar or proprietary product.

## Forces

- future services cannot all be predicted;
- oversized sleeves may weaken structure or boundaries;
- different penetrations carry different fire, acoustic, moisture and movement obligations;
- spare openings can become uncontrolled routes;
- late structural changes are expensive, but premature hole schedules can fossilise bad service topology.

## Relationships

This pattern commonly **completes** [HSA-P-003 — Coherent Horizontal Service Route](coherent-horizontal-service-route.md) where a route crosses structure or a protected boundary.

It also commonly **completes** [HSA-P-004 — High-Service-Room Service Wall](high-service-room-service-wall.md) where local service zones cross floors, walls or room boundaries.

Neither link means the parent pattern necessarily creates a penetration. The relationship matters only where a crossing actually occurs.

## Design requirements

- structural engineer owns structural adequacy;
- define allowable service type, location and fill where relevant;
- coordinate fire, acoustic, air, water, thermal and pest requirements;
- blank unused capacity robustly;
- make important penetrations identifiable and inspectable where practical;
- document no-drill/no-notch zones;
- distinguish a penetration through structure from a transition across an environmental or fire boundary even when both occur at one location.

## Proportionality

Design likely crossings once; do not scatter permanent spare holes for speculative services. Future capacity belongs only where later retrofit difficulty and credible demand justify it.

## Boundary debt

Every penetration should explicitly state which boundaries it interrupts and how continuity is reinstated. A structurally acceptable hole can still be an envelope, fire, acoustic or pest failure.

## Permanent-fabric impact

The pattern accepts deliberate openings in permanent fabric where needed. Its purpose is to make them sparse, coordinated and owned rather than accidental or repeated.

## Workmanship and tolerance

Define the controlling datum, required opening tolerance, sleeve/collar installation sequence and acceptable remediation if site geometry is wrong. Oversized site drilling should not be the default adjustment mechanism.

## Occupation and repose

Protect the acoustic and environmental performance of the construction crossed. Where collars, covers or grilles remain visible, resolve them as part of the room rather than residual engineering work.

## Failure modes

- opening enlarged on site;
- sleeve becomes an acoustic bridge;
- hidden fire stopping is later disturbed;
- external penetration falls inward or traps water;
- spare opening becomes a pest route;
- a formally coordinated hole is located correctly but cannot be serviced or reinstated.

## Evidence

Approved Document P explicitly recognises the interactions between electrical penetrations, structure, fire, moisture and sound. Movement, fire-stopping and structural-opening coordination are also ordinary professional practice across building systems.

## Does not prove

A documented opening is not evidence of adequacy. Structural, fire, acoustic, moisture and product/system performance remain subject to scoped design and evidence.

## Reference House application

The Reference House uses a limited catalogue of coordinated crossings at known service-route/boundary intersections rather than allowing each trade to create unique site openings.

## Formalisation boundary

Opening identity, host identity, permissible location, geometry, boundary roles, no-drill zones and evidence obligations have strong formal potential. The compiler must not infer structural or boundary adequacy merely because a penetration object exists.

---

**Provenance:** migrated from Pattern 05 in [`core-12.md`](core-12.md) and [`pilot/designed-structural-penetration.md`](pilot/designed-structural-penetration.md). Migration does not increase evidence or maturity.
