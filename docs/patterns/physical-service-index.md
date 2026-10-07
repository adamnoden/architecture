---
id: HSA-P-012
title: Physical Service Index
kind: pattern
state: active
evidence: proposed
maturity: []
scales:
  - stewardship
  - building
domains:
  - stewardship
  - maintenance
  - lifecycle
  - services
principles:
  - 5
  - 6
  - 10
requires: []
completes:
  - HSA-P-002
alternative_to: []
tension_with: []
sequences:
  - service-topology
---

# HSA-P-012 — Physical Service Index

## Context

A building may be physically maintainable yet become difficult to understand after ownership changes, alterations, lost accounts or obsolete digital systems.

## Problem

Detailed digital records are valuable but fragile as the only route to critical operational information. At the other extreme, extensive physical labelling becomes stale, visually noisy and difficult to keep current.

## Pattern

**Keep a deliberately small physical index at the building containing stable identifiers and essential operational information, linked where useful to richer digital records.**

Typical content may include principal isolation, route/riser identifiers, distribution-board references, emergency information and stable IDs matching labels on actual components.

## Forces

- physical information must be updated after alterations;
- too much information becomes noise;
- URLs and QR codes are not durable by themselves;
- detailed records belong in editable information systems;
- critical information should survive ordinary software/account loss.

## Relationships

This pattern commonly **completes** [HSA-P-002 — Plant Room as Service Hub](plant-room-service-hub.md). A hub provides a natural place where identifiers, isolation and equipment can be understood together.

The index does not require a dedicated plant room. Its invariant is the durable relationship between the physical asset, future stewards and system identity.

## Design requirements

- prefer stable identifiers to verbose descriptions;
- place the index where maintenance naturally begins;
- pair IDs with drawings/digital records where available;
- assign responsibility for updating the record after change;
- use durable, ordinarily readable formats;
- repeat identifiers at the actual components or route points they describe where useful.

## Proportionality

The physical layer should contain only information whose loss would materially impede safe isolation, understanding or maintenance. Everything else can remain in richer records.

## Boundary debt

Usually low, but the index location must remain safe, accessible and appropriate to any electrical, fire or plant-room conditions around it.

## Permanent-fabric impact

Minimal. A durable board, plate or enclosure may require fixing, but the information layer should not depend on proprietary embedded hardware.

## Workmanship and tolerance

The main construction risk is not dimensional but informational: identifiers applied inconsistently, obscured during fit-out or changed without updating the index. Commissioning should verify correspondence between labels and records.

## Occupation and repose

Concentrate technical information where service activity begins rather than distributing labels through domestic rooms. The pattern should make systems easier to understand when needed and easier to ignore during normal occupation.

## Failure modes

- index becomes false after alteration;
- additions destroy hierarchy;
- digital and physical identifiers diverge;
- labels disappear during redecoration or replacement;
- the index contains so much detail that emergency information is hard to find.

## Evidence

RIBA Plan for Use supports layered building information, including quick-start/emergency material and detailed O&M information. Golden-thread practice provides a strong precedent for information remaining current, accessible, usable and transferable, although its statutory regime does not apply directly to an ordinary detached house.

## Does not prove

These precedents do not prove that every house needs a formal service board or that one particular labelling system is durable. The HSA proposition is the small resilient on-asset layer, not a specific product or information standard.

## Reference House application

The Reference House places one restrained physical service index in the service hub, with identifiers repeated at corresponding isolation and distribution components.

## Formalisation boundary

Stable semantic identities and correspondence between records and physical labels fit naturally with the computational model. The pattern deliberately preserves a small critical layer outside software dependencies, so digital existence alone cannot discharge it.

---

**Provenance:** migrated from Pattern 12 in [`core-12.md`](core-12.md) and [`pilot/physical-service-index.md`](pilot/physical-service-index.md). Migration does not increase evidence or maturity.
