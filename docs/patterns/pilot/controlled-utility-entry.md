---
id: HSA-P-001
title: Controlled Utility Entry
kind: pattern
state: pilot
evidence: established
maturity: []
scales:
  - site
  - building
domains:
  - services
  - envelope
  - maintenance
  - lifecycle
principles:
  - 2
  - 5
  - 10
requires: []
completes: []
alternative_to: []
tension_with: []
sequences:
  - service-topology
---

# HSA-P-001 — Controlled Utility Entry

> **Historical Phase-3 pilot record.** This page preserves the compact language experiment that preceded canonical migration. For current authority, use [`HSA-P-001 — Controlled Utility Entry`](../controlled-utility-entry.md).

## Context

A house receives water, electricity, communications and potentially other utilities across the site and weather envelope. Their routes are commonly controlled by different suppliers and disciplines but ultimately enter one building.

## Invariant

Create a deliberate utility-entry condition where incoming services cross through coordinated, documented interfaces before joining internal distribution. Reserve future capacity only where it is proportionate and can be blanked safely.

## Why this is a pattern

The recurring problem is not merely “services need holes”. It is the relationship between independently governed incoming networks, permanent fabric, environmental boundaries, isolation and later alteration. Several physical implementations can realise the same relationship.

## Language role

This is an upstream service-topology pattern. It establishes where external utility networks become controlled internal infrastructure.

It deliberately had no hard `requires` edge in the pilot. Site constraints, statutory supplier requirements and existing infrastructure may determine the entry independently of other HSA patterns.

Later internal concentration patterns may **complete** this one without being prerequisites for it.

## Sequence note

Resolve the plausible utility-entry geography early enough that plant location, service distribution and permanent structural openings do not become accidental consequences of late supplier coordination.

## Formalisation boundary

Potentially formalisable consequences include identified entry occurrences, declared boundary transitions, isolation access and permitted penetrations.

The architectural judgement about whether several utilities should share one zone, several adjacent zones or separate entries remains project-specific.

## Canonical successor

See [`HSA-P-001 — Controlled Utility Entry`](../controlled-utility-entry.md). The earlier developed aggregate prose remains in the historical [Core Pattern Catalogue](../core-12.md).
