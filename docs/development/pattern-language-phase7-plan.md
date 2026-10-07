# Pattern-Language Overhaul — Phase 7 Canonical Migration Plan

**Status:** active  
**Branch:** `pattern-language-phase7`  
**Starting point:** `main@5eba14402b333836add71739395385a7686edf4e`  
**Authority:** [`pattern-language-phase6-review.md`](pattern-language-phase6-review.md)  
**Purpose:** migrate the audited pattern corpus into one canonical, individually addressable language without changing evidence maturity, rewriting research history or conflating patterns with strategies and implementation families.

This is the control document for Phase 7. It exists so the migration can be resumed safely after loss of conversational context.

---

# 1. Migration principle

Phase 7 is structural work, not another doctrine or prose-discovery phase.

The migration should make the existing knowledge easier to use by giving each admitted pattern:

- one stable ID;
- one canonical page;
- one human-readable name;
- sparse graph relationships;
- explicit evidence/maturity state;
- an explicit boundary between architectural judgement and any formal consequence.

The migration itself must not make a proposition appear more established than it was before.

---

# 2. Final canonical layout

Active patterns live directly under `docs/patterns/` so links remain short and the filesystem does not pretend there is one canonical taxonomy.

```text
docs/patterns/
  README.md                         language index / reading entry point
  language-model.md                 authoring contract
  service-topology-sequence.md      generative sequence

  controlled-utility-entry.md
  plant-room-service-hub.md
  coherent-horizontal-service-route.md
  high-service-room-service-wall.md
  designed-structural-penetration.md
  permanent-opening-replaceable-window.md
  movement-slip-junction.md
  accessible-rainwater-route.md
  source-capture-kitchen-extract.md
  roof-maintenance-route.md
  physical-service-index.md
  ground-supported-facade-access.md
  accessible-vertical-service-zone.md
  accessible-room-service-route.md
  compartmented-service-void.md
  visible-leakage-path.md
  failure-tolerant-wet-service-room.md
  permanent-opening-replaceable-door.md
  designed-threshold.md
  source-capture-bathroom-extract.md
  controlled-attachment-plane.md

  strategies/
    README.md
    fail-safe-water-distribution.md
    decompose-structural-interface-functions.md
    separate-structural-floor-changeable-layers.md

  candidates/
    README.md
    replaceable-architectural-lining.md
    individually-isolatable-manifold-distribution.md
    local-deep-service-zone.md
    selective-floor-access.md

  retired/
    README.md
    hsa-p-006-water-damage-safe-service-route.md
```

Historical aggregate files are removed from canonical navigation only after all replacement destinations exist and provenance pointers are in place.

`pilot/` is temporary migration provenance. It should remain until the canonical replacements for the pilot records are complete and their useful differences have been reconciled.

---

# 3. Stable identity map

IDs carry identity only. They do not encode domain, scale, publication order or evidence level.

| ID | Canonical title | Canonical file | Source / action |
|---|---|---|---|
| `HSA-P-001` | Controlled Utility Entry | `controlled-utility-entry.md` | split from Core 12 + reconcile pilot |
| `HSA-P-002` | Plant Room as Service Hub | `plant-room-service-hub.md` | split from Core 12 + reconcile pilot |
| `HSA-P-003` | Coherent Horizontal Service Route | `coherent-horizontal-service-route.md` | rename/scope correction of Horizontal Service Spine |
| `HSA-P-004` | High-Service-Room Service Wall | `high-service-room-service-wall.md` | split from Core 12 + reconcile pilot |
| `HSA-P-005` | Designed Structural Penetration | `designed-structural-penetration.md` | split from Core 12 + reconcile pilot |
| `HSA-P-006` | **Retired** — Water-Damage-Safe Service Route | `retired/hsa-p-006-water-damage-safe-service-route.md` | retire; durable content moves to water strategy |
| `HSA-P-007` | Permanent Opening / Replaceable Window | `permanent-opening-replaceable-window.md` | split from Core 12 |
| `HSA-P-008` | Movement / Slip Junction | `movement-slip-junction.md` | split from Core 12 |
| `HSA-P-009` | Accessible Rainwater Route | `accessible-rainwater-route.md` | split from Core 12 |
| `HSA-P-010` | Source-Capture Kitchen Extract | `source-capture-kitchen-extract.md` | split from Core 12 |
| `HSA-P-011` | Roof Maintenance Route | `roof-maintenance-route.md` | split from Core 12 |
| `HSA-P-012` | Physical Service Index | `physical-service-index.md` | split from Core 12 + reconcile pilot |
| `HSA-P-013` | Ground-Supported Façade Access | `ground-supported-facade-access.md` | migrate existing developed page in place |
| `HSA-P-014` | Accessible Vertical Service Zone | `accessible-vertical-service-zone.md` | promote developed candidate after Phase-6 admission |
| `HSA-P-015` | Accessible Room Service Route | `accessible-room-service-route.md` | new canonical abstraction from skirting + vertical joinery-route material |
| `HSA-P-016` | Compartmented Service Void | `compartmented-service-void.md` | new canonical page from audited material/evidence |
| `HSA-P-017` | Visible Leakage Path | `visible-leakage-path.md` | new canonical page from water-failure evidence |
| `HSA-P-018` | Failure-Tolerant Wet Service Room | `failure-tolerant-wet-service-room.md` | new canonical room-scale pattern |
| `HSA-P-019` | Permanent Opening / Replaceable Door | `permanent-opening-replaceable-door.md` | new canonical opening pattern |
| `HSA-P-020` | Designed Threshold | `designed-threshold.md` | new canonical interface pattern |
| `HSA-P-021` | Source-Capture Bathroom Extract | `source-capture-bathroom-extract.md` | new canonical environmental pattern |
| `HSA-P-022` | Controlled Attachment Plane | `controlled-attachment-plane.md` | abstraction of backplane + fixing-infrastructure material |

`HSA-P-006` is permanently reserved. No future pattern may reuse the ID.

---

# 4. Frontmatter contract for Phase 7

Use the existing contract in [`../patterns/language-model.md`](../patterns/language-model.md) with one correction: the example title for `HSA-P-003` is historical and must become **Coherent Horizontal Service Route** during migration.

Every active canonical pattern must have:

```yaml
---
id: HSA-P-xxx
title: Human-readable title
kind: pattern
state: active
evidence: established | supported | proposed | experimental
maturity: []
scales: []
domains: []
principles: []
requires: []
completes: []
alternative_to: []
tension_with: []
sequences: []
---
```

Use lower-case machine values in frontmatter. Display prose may use title case.

The retired `HSA-P-006` record uses:

```yaml
kind: pattern
state: retired
```

and must point explicitly to the replacement water strategy.

Strategies/candidates do **not** receive pattern IDs.

---

# 5. Relationship discipline

Phase 7 is not permission to populate a dense graph.

For each active pattern:

1. carry forward pilot relationships only where their prose rationale still survives;
2. add a new edge only when it expresses recurring compositional knowledge;
3. do not encode chronology as `requires` merely because one move appears earlier in a sequence;
4. do not create symmetric reverse edges automatically unless the relation genuinely reads correctly both ways;
5. if a relationship is merely “related to”, omit it.

The first canonical corpus may legitimately contain patterns with no graph edges.

---

# 6. Migration sequence

## P7.1 — identity and layout checkpoint

- [x] create Phase-7 branch from Phase-6 checkpoint;
- [x] freeze ID map and target file layout in this document;
- [ ] correct the `HSA-P-003` example in the authoring contract;
- [ ] establish canonical index mechanics without introducing a parallel registry;
- [ ] record Phase 7 as active in migration control / status.

**Checkpoint:** no canonical prose is moved before this document exists.

## P7.2 — surviving Core identities

Migrate in three small sets:

### Set A — pilot-backed service patterns

`P-001`, `P-002`, `P-003`, `P-004`, `P-005`, `P-012`.

Reconcile developed Core-12 prose with pilot graph/formalisation material. The canonical page replaces both as authority; pilot remains provenance until cleanup.

### Set B — openings / movement / drainage

`P-007`, `P-008`, `P-009`.

### Set C — extraction / roof

`P-010`, `P-011`.

Then create the retired `P-006` pointer and the `Fail-Safe Water Distribution` strategy before the old Core-12 aggregate can be demoted.

## P7.3 — ten newly admitted identities

Migrate/admit `P-013..P-022` individually or in tightly related pairs. Use existing developed source material where available. Thin source material remains concise rather than being padded to match a template.

## P7.4 — non-pattern homes

Create/normalise:

- three strategies;
- four held candidates;
- implementation-family pointers where useful.

Do not move research/prototype evidence merely for neatness.

## P7.5 — publication and Reference House reconciliation

Only after all canonical pages exist:

- update Reference House occurrence IDs/names;
- replace obsolete Part-III inventory;
- demote/remove aggregate pattern pages from primary navigation;
- preserve provenance links.

## P7.6 — lightweight validation/tooling

Add only what reduces maintenance error:

- duplicate-ID detection;
- broken relationship-reference detection;
- active/retired state validation;
- reverse-link/index generation from frontmatter;
- orphan warnings where useful.

No graph visualisation in Phase 7.

---

# 7. Canonical index rule

`docs/patterns/README.md` is the human entry point, but it must not become a manually maintained second identity registry.

The final active-pattern list should be derived from canonical Markdown frontmatter at build time. Hand-authored prose around the list is fine; the ID/title/state table itself should not be duplicated manually once tooling exists.

Until enough canonical pages exist for generated indexing to be useful, the Phase-7 plan is the temporary authoritative migration map.

---

# 8. Evidence / maturity preservation

For every migration:

- copy the prior evidence classification unless the Phase-6 audit explicitly changed it;
- preserve unresolved `Does not prove` limits;
- preserve prototype/professional-review gates;
- never infer `Drawn`, `Calculated`, `Built`, etc. merely from a reference-house occurrence;
- never treat Reference House use as pattern evidence;
- never treat formalizability as architectural validity.

If source records conflict, record the conflict in the pattern page and keep the lower-confidence interpretation until resolved.

---

# 9. Delete/demote rules

Do not delete or demote any aggregate/source page until:

1. every reusable claim has a destination;
2. all inbound canonical navigation is repaired;
3. provenance pointers identify the superseding destination;
4. docs build passes.

Expected later actions:

- `core-12.md` → provenance/superseded pointer after `P-001..P-012` migration;
- `ground-supported-facade-access.md` → remains in place but gains canonical frontmatter/ID;
- `candidates/accessible-vertical-service-zone.md` → superseded by canonical root page after `P-014` migration;
- `reversible-assembly-candidates.md` → retained until candidate/strategy/implementation destinations exist, then demoted to provenance or split only where useful;
- `pilot/` → retained through Phase 7 as migration evidence; cleanup is a final step, not an early aesthetic exercise.

---

# 10. Stop rules

Stop before merging if any of the following happens:

- stable IDs begin encoding taxonomy or publication order;
- the graph becomes dense enough that edges mostly mean “related to”;
- migration prose becomes longer without adding design knowledge;
- a pattern identity changes materially merely to preserve its number;
- research history has to be rewritten to make the new structure look clean;
- candidates are promoted because migration needs pages;
- the generated index requires a second content database;
- VitePress/navigation validation fails.

---

# 11. Resume-from-here protocol

A future collaborator should read:

1. root `README.md`;
2. `STATUS.md`;
3. [`pattern-language-overhaul.md`](pattern-language-overhaul.md);
4. [`pattern-language-phase6-review.md`](pattern-language-phase6-review.md);
5. this file;
6. [`../patterns/language-model.md`](../patterns/language-model.md).

Then continue the first unchecked Phase-7 item above.
