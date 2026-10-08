# Service-Topology Pattern-Language Pilot

> **Historical record — Phase 3.** This pilot tested stable identities, sparse relationships and generative sequencing before the canonical pattern-language migration. Its terminology and open questions are preserved as they existed at the time. For current authority, use the [canonical pattern language](../README.md), [pattern-language model](../language-model.md) and [service-topology sequence](../service-topology-sequence.md).

The pilot records intentionally contain only the material needed to test the language model without duplicating the fuller pattern prose available at the time.

## Pilot patterns

| ID | Pattern | Evidence at pilot stage |
|---|---|---|
| [`HSA-P-001`](controlled-utility-entry.md) | Controlled Utility Entry | Established |
| [`HSA-P-002`](plant-room-service-hub.md) | Plant Room as Service Hub | Established |
| [`HSA-P-003`](horizontal-service-spine.md) | Horizontal Service Spine | Supported |
| [`HSA-P-004`](high-service-room-service-wall.md) | High-Service-Room Service Wall | Supported |
| [`HSA-P-005`](designed-structural-penetration.md) | Designed Structural Penetration | Established |
| [`HSA-P-012`](physical-service-index.md) | Physical Service Index | Proposed |

## Pilot graph

`A → B` below meant **B completes A**; it did not mean B was a mandatory prerequisite or chronological successor.

```text
HSA-P-001  Controlled Utility Entry
     │
     ▼
HSA-P-002  Plant Room as Service Hub
     │                 │
     ▼                 └──────────────► HSA-P-012 Physical Service Index
HSA-P-003  Horizontal Service Spine
     │
     ├──────────────► HSA-P-004 High-Service-Room Service Wall
     │
     └──────────────► HSA-P-005 Designed Structural Penetration
                              ▲
                              │
                     also completes P-004
                     where crossings occur
```

The pilot graph was intentionally incomplete. Sequence order was recorded separately.

## Gaps exposed by the pilot

### Vertical distribution

The pilot identified vertical service distribution as missing reusable knowledge. Later work resolved that gap as canonical [`HSA-P-014 — Accessible Vertical Service Zone`](../accessible-vertical-service-zone.md).

### Water-damage-safe service route

The pilot questioned whether the former Core Pattern 06 described one physical pattern or a broader strategy. Later audit and worked-project testing retired `HSA-P-006`, retained its durable proposition as [Fail-Safe Water Distribution](../strategies/fail-safe-water-distribution.md), and admitted narrower patterns where recurring physical relationships existed.

These changes are outcomes of the pilot rather than corrections to the historical record.

## Pilot pass conditions

The pilot was designed to test whether a pattern language materially improved answers to:

- what should be decided next;
- what context a decision creates for later work;
- which patterns genuinely compose;
- where later technical difficulty should force an upstream architectural change;
- which apparent patterns are actually strategies or implementation families;
- which missing patterns are exposed by trying to design a whole house.

The subsequent migration and Reference House trials were authorised because the pilot produced useful distinctions and missing knowledge rather than only metadata and hyperlinks.

## Current continuation

The current canonical sequence is [Service Topology — Generative Sequence](../service-topology-sequence.md). The Phase-5 Reference House trial remains available separately as historical provenance.
