# Pattern-Language Overhaul — Phase 7 Canonical Migration Plan

**Status:** active migration control for Phase 7  
**Base:** `main@5eba14402b333836add71739395385a7686edf4e` — Phase-6 audited checkpoint  
**Authority:** [Phase 6 Gate Review](pattern-language-phase6-review.md)

## Purpose

Phase 7 changes the repository from aggregate pattern prose plus pilot records into **one canonical Markdown page per active pattern**, with strategies, held candidates and retired identities kept visibly separate.

This phase must not reopen the taxonomy casually. Its job is to migrate the reviewed identities safely and reduce duplication.

---

# 1. File layout

## Active patterns

Active canonical pattern pages live directly in:

```text
docs/patterns/<descriptive-slug>.md
```

Examples:

```text
docs/patterns/controlled-utility-entry.md
docs/patterns/coherent-horizontal-service-route.md
docs/patterns/visible-leakage-path.md
```

The stable HSA ID lives in frontmatter, **not the filename**. This keeps URLs readable and prevents IDs from becoming category/order codes.

## Strategies

```text
docs/patterns/strategies/<slug>.md
```

Strategies are adjacent to the language for navigation but are not pattern graph nodes.

## Held candidates

```text
docs/patterns/candidates/<slug>.md
```

No stable HSA pattern ID until admitted.

## Retired identities

```text
docs/patterns/retired/<id>-<slug>.md
```

A retired page is a provenance/tombstone record, not active guidance.

## Legacy aggregates

`core-12.md` and `reversible-assembly-candidates.md` remain at their existing URLs until replacements are complete. At the end of Phase 7 they become explicit legacy/provenance indexes rather than duplicate canonical prose.

---

# 2. Stable identity allocation

Existing identities preserve meaning wherever Phase 6 said they survive.

| ID | Canonical identity | Migration |
|---|---|---|
| `HSA-P-001` | Controlled Utility Entry | existing identity |
| `HSA-P-002` | Plant Room as Service Hub | existing identity |
| `HSA-P-003` | **Coherent Horizontal Service Route** | existing identity, renamed from Horizontal Service Spine |
| `HSA-P-004` | High-Service-Room Service Wall | existing identity |
| `HSA-P-005` | Designed Structural Penetration | existing identity |
| `HSA-P-006` | **RETIRED** — formerly Water-Damage-Safe Service Route | never reused |
| `HSA-P-007` | Permanent Opening / Replaceable Window | existing identity |
| `HSA-P-008` | Movement / Slip Junction | existing identity |
| `HSA-P-009` | Accessible Rainwater Route | existing identity |
| `HSA-P-010` | Source-Capture Kitchen Extract | existing identity |
| `HSA-P-011` | Roof Maintenance Route | existing identity |
| `HSA-P-012` | Physical Service Index | existing identity |
| `HSA-P-013` | Ground-Supported Façade Access | new admitted identity |
| `HSA-P-014` | Accessible Vertical Service Zone | new admitted identity |
| `HSA-P-015` | Accessible Room Service Route | new admitted identity |
| `HSA-P-016` | Compartmented Service Void | new admitted identity |
| `HSA-P-017` | Visible Leakage Path | new admitted identity |
| `HSA-P-018` | Failure-Tolerant Wet Service Room | new admitted identity |
| `HSA-P-019` | Permanent Opening / Replaceable Door | new admitted identity |
| `HSA-P-020` | Designed Threshold | new admitted identity |
| `HSA-P-021` | Source-Capture Bathroom Extract | new admitted identity |
| `HSA-P-022` | Controlled Attachment Plane | new admitted identity |

IDs indicate stable identity only. They encode no scale, topic, maturity or publication order.

---

# 3. Canonical active file map

| ID | File |
|---|---|
| P-001 | `controlled-utility-entry.md` |
| P-002 | `plant-room-service-hub.md` |
| P-003 | `coherent-horizontal-service-route.md` |
| P-004 | `high-service-room-service-wall.md` |
| P-005 | `designed-structural-penetration.md` |
| P-007 | `permanent-opening-replaceable-window.md` |
| P-008 | `movement-slip-junction.md` |
| P-009 | `accessible-rainwater-route.md` |
| P-010 | `source-capture-kitchen-extract.md` |
| P-011 | `roof-maintenance-route.md` |
| P-012 | `physical-service-index.md` |
| P-013 | `ground-supported-facade-access.md` — existing path retained |
| P-014 | `accessible-vertical-service-zone.md` |
| P-015 | `accessible-room-service-route.md` |
| P-016 | `compartmented-service-void.md` |
| P-017 | `visible-leakage-path.md` |
| P-018 | `failure-tolerant-wet-service-room.md` |
| P-019 | `permanent-opening-replaceable-door.md` |
| P-020 | `designed-threshold.md` |
| P-021 | `source-capture-bathroom-extract.md` |
| P-022 | `controlled-attachment-plane.md` |

The already-developed candidate file `candidates/accessible-vertical-service-zone.md` is source material for P-014 and will become a pointer/provenance note after the canonical page exists.

---

# 4. Strategy map

Create canonical strategy pages for:

- `strategies/fail-safe-water-distribution.md`
- `strategies/decompose-structural-interface-functions.md`
- `strategies/separate-structural-floor-from-changeable-layers.md`

These pages may reference patterns/implementations but must not receive HSA pattern IDs or participate in pattern relationship arrays.

---

# 5. Held candidate map

Retain or create unnumbered candidate pages for:

- `candidates/replaceable-architectural-lining.md`
- `candidates/individually-isolatable-manifold-distribution.md`
- `candidates/local-deep-service-zone.md`
- `candidates/selective-floor-access.md`

Candidate pages use the same readable anatomy where useful but make `state: candidate` explicit and omit stable pattern IDs.

---

# 6. Retired identity

Create:

```text
docs/patterns/retired/hsa-p-006-water-damage-safe-service-route.md
```

It must state:

- historical title/ID;
- why identity was retired;
- where durable content went (`Fail-Safe Water Distribution` strategy plus narrower patterns/implementations);
- that the ID is never reused;
- provenance links back to `core-12.md`, Phase-5 run and Phase-6 audit.

Do not quietly redirect P-006 to a different semantic object.

---

# 7. Frontmatter rule

Active pattern pages use the contract in `language-model.md`.

Example:

```yaml
---
id: HSA-P-003
title: Coherent Horizontal Service Route
kind: pattern
state: active
evidence: supported
maturity:
  - drawn
scales:
  - building
  - zone
domains:
  - services
  - maintenance
principles:
  - 2
  - 5
  - 6
  - 8
requires: []
completes: []
alternative_to: []
tension_with: []
sequences:
  - service-topology
---
```

Relationship arrays remain empty unless the prose can explain why the edge is useful. Do not fill metadata merely because two patterns are adjacent in a sequence.

---

# 8. Migration tranches

## Tranche A — surviving existing identities

Create P-001..005 and P-007..012 from the developed Core-12 prose. Add the formalisation boundary and context where the aggregate lacked them. Correct P-003 scope/name.

Create P-006 retired record + water strategy in the same tranche so no semantic hole appears.

**Gate:** all old active IDs resolve to canonical individual pages; P-006 provenance is explicit.

## Tranche B — developed/new identities with strong source material

Migrate:

- P-013 Ground-Supported Façade Access;
- P-014 Accessible Vertical Service Zone;
- P-022 Controlled Attachment Plane.

These already have substantial developed source material.

## Tranche C — new identities assembled from audited source material

Create:

- P-015 Accessible Room Service Route;
- P-016 Compartmented Service Void;
- P-017 Visible Leakage Path;
- P-018 Failure-Tolerant Wet Service Room;
- P-019 Permanent Opening / Replaceable Door;
- P-020 Designed Threshold;
- P-021 Source-Capture Bathroom Extract.

No new factual claim should be introduced merely to complete a template. Where evidence remains weak, label it honestly.

## Tranche D — candidates + other strategies

Normalise the held candidate bench and structural/floor strategies. Cross-link existing research/prototype records instead of duplicating them.

## Tranche E — retire aggregates / reconcile consumers

Only after A–D exist:

- replace `core-12.md` duplicate prose with a legacy identity/provenance index;
- qualify `reversible-assembly-candidates.md` as development/prototype provenance and link new strategy/candidate destinations;
- update pilot pages/sequence references to canonical pages;
- update Reference House occurrence links;
- update publication architecture Part III;
- update README/docs indexes and navigation.

---

# 9. Tooling boundary

Phase 7 may add **validation**, not a visualisation product.

Useful tooling after active frontmatter exists:

- duplicate-ID check;
- relationship-target existence check;
- active/retired state validation;
- reverse-link generation later if simple.

Do not add D3/network visualisation during content migration.

---

# 10. Checkpoint policy

Use separate PR checkpoints where rollback value is high:

1. **P7A:** layout + surviving identities + P-006 retirement/water strategy;
2. **P7B:** new admitted identities + strategies/candidates;
3. **P7C:** legacy aggregate cleanup + publication/site integration + lightweight validation.

Every checkpoint must pass the existing VitePress/navigation guard before the next tranche begins.

---

# 11. Resume rule

If context is lost during Phase 7:

1. read `STATUS.md`;
2. read `pattern-language-overhaul.md`;
3. read `pattern-language-phase6-review.md`;
4. read this plan;
5. inspect which P7 checkpoint has merged;
6. continue the first incomplete tranche only.

Do not re-derive the taxonomy unless a concrete migration contradiction is recorded.