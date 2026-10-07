---
id: HSA-P-012
title: Physical Service Index
kind: pattern
state: active
evidence: proposed
maturity:
  - drawn
scales:
  - stewardship
  - building
domains:
  - stewardship
  - services
  - maintenance
  - lifecycle
principles:
  - 5
  - 6
  - 10
requires: []
completes: []
alternative_to: []
tension_with: []
sequences:
  - service-topology
---

# HSA-P-012 — Physical Service Index

## Context

Use where future owners and trades need a small amount of critical operational information to remain available at the building even if digital records, accounts or software become inaccessible.

The pattern is most useful when the house already has stable service/route identifiers worth preserving across drawings, labels and later alterations.

## Problem

Digital building records can be lost through poor handover, obsolete software, dead accounts or simple neglect. The opposite response—labelling everything physically—creates visual noise and can become dangerously stale after alterations.

A future maintainer needs a small, durable bridge between the physical building and the richer editable record.

## Pattern

> **Keep a deliberately small physical index at the building containing stable identifiers and essential isolation/record-location information, linked to a richer digital building record.**

The physical index is a resilience layer, not a duplicate O&M manual.

## Typical content

As applicable:

- main water, electrical and fuel isolation;
- principal distribution-board references;
- route/riser/service-zone identifiers;
- critical drainage/rodding references;
- emergency or record-location information;
- stable identifiers matching labels on actual components;
- a durable pointer to the richer digital/building record without relying on the pointer alone for essential emergency information.

## Forces

- physical information must be updated after alterations;
- too much labelling becomes visual/technical noise;
- QR codes, URLs and cloud accounts are not durable by themselves;
- detailed records belong in an editable information system;
- a physical plate can become false if nobody owns change control;
- stable IDs are more durable than long descriptive prose;
- information must remain readable without specialist software.

## Relationships

A [Plant Room as Service Hub](plant-room-service-hub.md) is often the natural location because maintenance activity and isolation begin there, but the index may live elsewhere if access/security make that better.

[Controlled Utility Entry](controlled-utility-entry.md) and the service-topology patterns generate many of the stable identities the index may reference.

The pattern depends conceptually on good stewardship practice, not on any specific service topology.

## Variants / implementation families

- engraved/printed durable service plate;
- small bound service card/manual in a dedicated enclosure;
- cabinet-door index inside a plant/service space;
- schematic diagram plus stable component IDs;
- minimal physical emergency sheet paired with a richer digital building passport.

## Design requirements

- prefer stable identifiers to verbose descriptions;
- keep content deliberately small and high-value;
- place the index where maintenance/emergency operation plausibly begins;
- pair IDs with drawings and digital records;
- use the same IDs on the physical components/routes where useful;
- assign change-control responsibility in the house manual/building record;
- use durable, ordinarily readable formats;
- ensure essential isolation information is understandable even if an external link/QR target is dead.

## Proportionality

Only information whose absence would materially hinder safe isolation, fault-finding, maintenance or record discovery belongs physically at the asset. Hundreds of component labels or full printed O&M sets are not justified by the resilience argument.

## Boundary debt

Normally low, but check:

- fire/escape implications if an enclosure is placed in a protected route;
- security/privacy where the index exposes sensitive system information;
- moisture/heat durability in plant/service rooms;
- visual intrusion in occupied areas.

## Permanent-fabric impact

The pattern should require little or no invasive work: a durable plate, holder or cabinet-mounted record can usually attach to a replaceable/service-side surface. Do not embed information in permanent fabric merely to make it “permanent”.

## Workmanship / change control

The main failure risk is informational rather than dimensional. Establish one stable naming scheme and use it across physical labels, drawings and digital records.

Alteration work should include updating affected IDs/index entries as an explicit completion task. If the physical and digital naming diverge, the index has failed.

## Occupation / repose impact

Concentrate technical information where service activity begins rather than distributing signage through domestic rooms. Stable IDs should reduce visible technical labelling elsewhere.

## Architectural resolution

The index can be plain and utilitarian inside a service room. If visible in domestic space, resolve it as restrained joinery/metalwork/signage rather than a laminated engineering notice.

Durability and readability matter more than decorative expression.

## Maintenance / update sequence

When a relevant system changes:

1. retain or deliberately supersede stable IDs;
2. update the digital record;
3. update the physical index if its essential content changed;
4. replace/relabel affected physical identifiers;
5. verify isolation/route information against the as-altered building;
6. preserve historical identity where the building record needs it.

## Failure modes

- plate becomes false after alteration;
- additions accrete until the index is unreadable;
- digital record uses different names;
- physical identifiers disappear during redecoration/replacement;
- QR code or URL is treated as the only information and later dies;
- index is hidden behind stored possessions;
- emergency isolation description is ambiguous.

## Evidence

RIBA's Plan for Use work supports layered building information, including simple user-facing and more detailed operation/maintenance material. The Building Safety Regulator's golden-thread regime—though not applicable to an ordinary detached house—provides a strong precedent for information remaining current, accessible, usable and transferable.

The distinctive HSA proposition is the resilience extension: enough critical information remains physically at the asset if external information systems fail.

**Evidence anchors:** RIBA *Plan for Use Guide*; Building Safety Regulator golden-thread guidance as a non-applicable but relevant information-management precedent.

## Does not prove

Higher-risk-building information duties do not transfer wholesale to an ordinary house, and this pattern does not justify a complex digital-twin platform. The physical index should remain deliberately small.

## Reference House application

The Phase-5 Reference House uses provisional occurrence `RH-P012-01`: one restrained service board/plate at the plant/service hub approach, with stable identifiers repeated at corresponding components and linked to the richer record.

## Formalisation boundary

Potentially formal consequences include:

- stable identity uniqueness;
- physical/digital identifier consistency;
- required index fields for selected critical systems;
- references from components/routes/isolation points to records;
- change events invalidating stale index content.

Deciding what information is important enough to preserve physically, and where it can remain useful without becoming visual noise, remains stewardship/architectural judgement.