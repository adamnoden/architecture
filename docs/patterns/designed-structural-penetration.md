---
id: HSA-P-005
title: Designed Structural Penetration
kind: pattern
state: active
evidence: established
maturity:
  - drawn
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
completes: []
alternative_to: []
tension_with: []
sequences:
  - service-topology
---

# HSA-P-005 — Designed Structural Penetration

## Context

Use where a service must cross a structural element or other slow, performance-critical construction and the crossing cannot be removed by better route topology.

The pattern applies to the **remaining necessary crossings** after the service layout has been simplified. It is not permission to drill freely so long as each hole is documented.

## Problem

Services often reach structure after structural design is substantially complete. The site solution then becomes drilling, notching, chasing or enlarging openings in construction that was not designed for them.

The crossing also affects more than capacity: fire, acoustics, airtightness, weather, moisture, pests and future access may all depend on the same small interface.

## Pattern

> **Treat every necessary service crossing of structure or other permanent construction as a designed interface: establish its size, location, permitted contents, support, sleeve/collar where needed, boundary obligations and evidence before construction.**

A good service topology should reduce the number of such interfaces; this pattern makes the survivors deliberate.

## Forces

- future services cannot all be predicted;
- oversized sleeves can weaken structure or boundaries;
- undersized openings invite site enlargement;
- fire, acoustic, air, moisture and movement obligations differ by crossing;
- spare openings can become uncontrolled routes;
- access to hidden fire stopping or seals may be limited after completion;
- proprietary penetration systems have applicability limits;
- structural capacity remains an engineering question.

## Relationships

[Coherent Horizontal Service Route](coherent-horizontal-service-route.md) and vertical service planning should eliminate avoidable crossings first.

Where a crossing enters or leaves a [High-Service-Room Service Wall](high-service-room-service-wall.md), the penetration is still a separate interface with its own obligations.

Future [Compartmented Service Void](compartmented-service-void.md) logic may require individual service crossings through a stopped void boundary rather than one continuous opening.

## Variants / implementation families

- cast/former opening;
- designed drilled opening within an engineered permitted zone;
- sleeve through masonry/concrete;
- trimmer/framed opening in timber structure;
- proprietary fire/acoustic penetration system;
- grouped adjacent sleeves rather than one large shared aperture.

## Design requirements

- structural engineer owns structural adequacy;
- define allowable services and fill ratio where relevant;
- coordinate fire, acoustic, air, water, thermal and pest requirements;
- define support/restraint so the service does not load seals or fragile edges inadvertently;
- blank unused capacity robustly;
- make important penetrations identifiable and inspectable where practical;
- document no-drill/no-notch zones;
- record the system/product applicability where a proprietary seal or collar is used.

## Proportionality

Spare capacity is justified only where future demand is plausible and the cost of later crossing would be high. Do not create an oversized structural opening merely in the name of adaptability.

## Boundary debt

For each occurrence, explicitly identify which of these actually apply:

- structural capacity/stability;
- fire/smoke;
- acoustic separation;
- airtightness;
- vapour/moisture;
- weather/bulk water;
- thermal continuity;
- pest control;
- security;
- movement/tolerance.

The boundary ledger should be scoped, not copied mechanically.

## Permanent-fabric impact

This pattern is itself a deliberate intervention in permanent fabric. Its purpose is to make that intervention sparse, engineered, documented and stable enough that shorter-lived services can change without uncontrolled enlargement or new holes elsewhere.

## Workmanship / tolerance

Define accepted opening size/location and remediation thresholds. A sleeve or former set inaccurately during construction can be as damaging as later drilling if the service no longer fits.

Coordinate tolerance between structure, sleeve/collar, insulation, service diameter, movement allowance and sealing system. Do not rely on sealant/fire-stopping products to absorb geometry outside their tested or designed range.

## Occupation / repose impact

Protect the acoustic and environmental performance of the construction crossed. Where collars, grilles or covers remain visible, resolve them as part of the room rather than residual engineering work.

## Architectural resolution

Most penetrations should disappear within coherent construction. Tectonic honesty does not require exposing every sleeve; it requires that concealment does not substitute for unresolved structure, sealing or access.

## Assembly / maintenance sequence

Record:

1. how the opening is formed;
2. which service is installed and supported;
3. how each required boundary is reinstated;
4. how unused capacity is closed;
5. what later service replacement may disturb;
6. how reinstatement is inspected/verified after change.

## Failure modes

- opening enlarged on site;
- service placed outside permitted structural zone;
- sleeve becomes an acoustic bridge;
- hidden fire stopping is later disturbed;
- external penetration falls inward or tracks water;
- spare opening becomes a pest/air/smoke path;
- multiple later services exceed the original fill/support assumption;
- sealing product used outside its evidence scope.

## Evidence

Approved Document P explicitly identifies interactions between electrical penetrations and structure, fire, moisture and sound. Approved Documents B, C and E provide additional boundary context; structural adequacy remains subject to the relevant engineer/design route.

**Evidence anchors:** Approved Document P; Approved Documents B/C/E as applicable boundary context.

## Does not prove

This pattern does not make a penetration structurally or fire-safely adequate by itself. Nor does it justify forming spare openings without a scoped future use and boundary strategy.

## Reference House application

The Phase-5 service-topology run records a representative `CP-01..06` crossing register, including utility entry, external plant connection, kitchen extract, vertical service-zone floor opening, roof terminals and a deliberately weak low-level branch crossing that should disappear if better architectural/structural coordination permits.

## Formalisation boundary

Potentially formal consequences include:

- crossing identity, host and geometry;
- permitted service class/fill;
- structural no-go/permitted zones;
- boundary obligations;
- product/evidence applicability;
- inspection/reinstatement status.

The decision that a crossing is unavoidable—and the architectural judgement about where it belongs—must still come from route/structure coordination rather than the pattern itself.