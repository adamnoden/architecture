---
id: PAT-005
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
  - PAT-003
  - PAT-004
alternative_to: []
tension_with: []
sequences:
  - service-topology
---

# Designed Structural Penetration

## Context

A service route must sometimes cross structure or another protected construction. The crossing can be small, ordinary and conventionally built while still being consequential because it interrupts a slower-lived host and may carry several boundary duties at once.

## Problem

When the crossing is treated as residual trade work, the service geometry and the host geometry are resolved independently. Late drilling, notching, oversized holes and improvised reinstatement then become the means by which the two systems meet.

## Pattern

**Where a required service route crosses structural or protected permanent fabric, localise the crossing through a deliberately placed interface whose host, geometry and applicable boundary duties are defined as part of the architectural/structural/service coordination.**

The invariant is the physical relationship:

**route → controlled crossing interface → host / protected boundary**

It is not the administrative instruction “coordinate penetrations”, and it does not require a bespoke sleeve, frame or proprietary product. An ordinary engineered opening can satisfy the pattern completely.

## Forces

- future services cannot all be predicted;
- oversized sleeves may weaken structure or boundaries;
- different penetrations carry different fire, acoustic, moisture and movement obligations;
- spare openings can become uncontrolled routes;
- late structural changes are expensive, but premature hole schedules can fossilise bad service topology;
- concentrating crossings can simplify inspection while over-concentration can create one highly burdened interface.

## Relationships

This pattern commonly **completes** [PAT-003 — Coherent Horizontal Service Route](coherent-horizontal-service-route.md) where a route crosses structure or a protected boundary.

It also commonly **completes** [PAT-004 — High-Service-Room Service Wall](high-service-room-service-wall.md) where local service zones cross floors, walls or room boundaries.

Neither link means the parent pattern necessarily creates a penetration. The relationship matters only where a crossing actually occurs.

## Variants

The crossing interface can be materially ordinary. Depending on host and duties it may be:

- a preformed or drilled engineered opening;
- a cast or built-in sleeve;
- a framed service opening;
- a coordinated group of small penetrations;
- a replaceable collar / closure assembly;
- a boundary transition with no special visible component beyond the ordinary construction required to reinstate it.

The pattern does not prefer complexity. If standard engineered coordination satisfies the relationship, that is the preferred implementation.

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

A compact building may satisfy this pattern through ordinary local engineered crossings and need no special penetration family at all.

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
- a formally coordinated hole is located correctly but cannot be serviced or reinstated;
- the project invents a special penetration component where an ordinary engineered opening would have been better.

## Evidence

Approved Document P explicitly recognises the interactions between electrical penetrations, structure, fire, moisture and sound. Movement, fire-stopping and structural-opening coordination are also ordinary professional practice across building systems.

This evidence supports the need to resolve the crossing relationship; it does not make the relationship novel to Ovid’s House.

## Does not prove

A documented opening is not evidence of adequacy. Structural, fire, acoustic, moisture and product/system performance remain subject to scoped design and evidence.

The existence of this pattern also does not imply that a building needs a special penetration system. Standard professional coordination may be the complete implementation.

## Reference House application

The Reference House uses a limited catalogue of coordinated crossings at known service-route/boundary intersections rather than allowing each trade to create unique site openings.

## Formalisation boundary

Opening identity, host identity, permissible location, geometry, boundary roles, no-drill zones and evidence obligations have strong formal potential. The compiler must not infer structural or boundary adequacy merely because a penetration object exists.
