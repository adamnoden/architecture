# Service-Topology Pattern-Language Pilot

**Status:** Phase 3 pilot  
**Purpose:** test whether stable identities, sparse pattern relationships and a generative sequence add real design value before the full pattern catalogue is migrated.

The developed publication prose remains in [`../core-12.md`](../core-12.md). These pilot records intentionally contain only the material needed to test the language model without duplicating canonical prose.

## Pilot patterns

| ID | Pattern | Evidence |
|---|---|---|
| [`HSA-P-001`](controlled-utility-entry.md) | Controlled Utility Entry | Established |
| [`HSA-P-002`](plant-room-service-hub.md) | Plant Room as Service Hub | Established |
| [`HSA-P-003`](horizontal-service-spine.md) | Horizontal Service Spine | Supported |
| [`HSA-P-004`](high-service-room-service-wall.md) | High-Service-Room Service Wall | Supported |
| [`HSA-P-005`](designed-structural-penetration.md) | Designed Structural Penetration | Established |
| [`HSA-P-012`](physical-service-index.md) | Physical Service Index | Proposed |

## Current graph

`A → B` below means **B completes A**; it does not mean B is a mandatory prerequisite or chronological successor.

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

The graph is intentionally incomplete. Sequence order is recorded separately.

## Gaps deliberately left open

### Vertical distribution

A **Vertical Service Riser** appears likely to be a missing recurring pattern because the current publication architecture names a riser and the house needs multi-storey distribution.

No pattern ID has been assigned. Before admission it needs:

- a clear invariant distinct from “put pipes in a shaft”;
- context and forces;
- relationship to plant, horizontal distribution, fire/acoustic compartmentation and wet-room stacking;
- proportionality for an ordinary house;
- evidence and implementation alternatives.

The pilot treats this as useful evidence that a language can expose missing intermediate moves.

### Water-damage-safe service route

Current Core Pattern 06 may be a pattern, but its variants range from accessible distribution to pipe-in-pipe, drained containment and automatic isolation.

The pilot will test whether the shared idea is better classified as a **strategy / performance objective** with several patterns beneath it.

Do not decide this by taxonomy alone; use the reference-house and sequence trial.

## Pilot pass conditions

The pilot earns full migration only if it materially improves answers to:

- what should be decided next;
- what context a decision creates for later work;
- which patterns genuinely compose;
- where later technical difficulty should force an upstream architectural change;
- which current “patterns” are actually strategies or implementation families;
- which missing patterns are exposed by trying to design a whole house.

If the result is mostly metadata and hyperlinks, stop and revise the model before migrating the corpus.

## Next

See the [Service Topology — Generative Sequence Pilot](../service-topology-sequence.md).
