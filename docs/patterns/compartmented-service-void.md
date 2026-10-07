---
id: HSA-P-016
title: Compartmented Service Void
kind: pattern
state: active
evidence: supported
maturity: []
scales:
  - zone
  - assembly
domains:
  - services
  - fire
  - acoustics
  - maintenance
  - lifecycle
principles:
  - 3
  - 5
  - 10
requires: []
completes: []
alternative_to: []
tension_with: []
sequences:
  - service-topology
---

# HSA-P-016 — Compartmented Service Void

## Context

An accessible or semi-accessible service void crosses room, floor or zone boundaries.

## Problem

A void created for maintainability can quietly become a continuous path for smoke, flame, sound, odour, dust or pests. Treating the whole void as one uninterrupted volume solves access by weakening the boundaries it passes through.

## Pattern

**Stop the open service void at significant boundaries and pass individual services through deliberate, reinstated crossings.**

The architectural move is the distinction between **continuous services** and a **non-continuous void**.

## Forces

- access benefits from spatial continuity;
- fire/acoustic/pest control often benefits from discontinuity;
- services still need to cross boundaries;
- too many closures can make maintenance awkward;
- later alterations can defeat previously correct compartmentation.

## Design requirements

- identify which boundaries the void encounters;
- close the void where that boundary function requires it;
- pass services individually or in controlled groups through designed interfaces;
- keep fire/acoustic closures inspectable at construction hold points where practical;
- preserve maintainable access to components without treating every boundary as removable finish.

## Boundary debt

Boundary performance is the point of the pattern. Fire and smoke are primary concerns; acoustics, air, odour, dust and pest pathways may also matter depending on the location.

## Permanent-fabric impact

Closures and controlled penetrations may add permanent interfaces, but they prevent a service-access strategy from creating one uncontrolled building-wide cavity.

## Workmanship and tolerance

The boundary line must remain legible during construction so later services are not simply pushed through the closure. Penetration families and remediation rules should be defined before trades arrive.

## Occupation / repose impact

Good compartmentation should be almost invisible to occupants while reducing speech transmission, service noise and odour movement between rooms.

## Failure modes

- cavity barrier exists on drawings but is omitted behind services;
- later cable additions puncture the closure without reinstatement;
- access panels unintentionally become the only boundary layer;
- services are bundled through an oversized uncontrolled opening;
- the void remains an acoustic path despite nominal fire closure.

## Evidence

Approved Document B treats concealed cavities as potential routes for smoke and flame spread and requires cavity barriers in relevant conditions. HSA's architectural extension is to make the void/service distinction explicit across several boundary functions rather than treating service geography as exempt from them.

## Does not prove

This pattern is not a substitute for fire design and does not prescribe cavity-barrier locations independently of the applicable building construction and regulatory context.

## Reference House application

Where service walls, risers or accessible routes cross floor/room boundaries, the Reference House stops the open void and uses designed crossings rather than preserving continuous access volume for its own sake.

## Formalisation boundary

Void extent, boundary intersections and controlled crossing occurrences can be represented formally. Required fire/acoustic construction and proof of performance remain scoped technical evidence.

---

**Provenance:** admitted by the Phase-6 corpus audit and targeted evidence review. Stable identity does not increase evidence or maturity.
