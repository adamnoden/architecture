---
id: HSA-P-012
title: Physical Service Index
kind: pattern
state: pilot
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

**Pilot language record.** The full developed pattern prose remains in [`../core-12.md`](../core-12.md) during the migration pilot.

## Context

The building may be physically maintainable yet still become difficult to understand after ownership changes, alterations, lost accounts or obsolete digital systems.

## Invariant

Keep a deliberately small physical index at the building containing stable identifiers and essential operational information, linked where useful to richer digital records.

## Why this is a pattern

The recurring problem is the relationship between the physical building, future stewards and information continuity. The response is not one sign or QR code; it is a durable on-asset indexing layer tied to actual service identities.

## Language relationships

### Completes `HSA-P-002 — Plant Room as Service Hub`

Where a service hub exists, it provides a natural place for the physical index and stable identifiers to meet the equipment they describe. The index adds informational legibility to the hub's physical legibility.

This is not a hard dependency. A useful physical index can exist in houses without a dedicated plant room.

## Sequence note

The index is resolved late enough to describe the installed system accurately, but the identifier strategy should exist early enough that drawings, labels, commissioning records and future change control use the same names.

## Formalisation boundary

Stable semantic identities and their correspondence to physical labels are strongly compatible with the computational model.

The project should not assume that a digital model is durable merely because it exists. The pattern's value lies partly in preserving a small amount of critical information outside software dependencies.

## Current source

See **Pattern 12 — Physical service index** in the [Core Pattern Catalogue](../core-12.md).
