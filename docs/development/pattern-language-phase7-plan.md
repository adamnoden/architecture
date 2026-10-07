# Pattern-Language Overhaul — Phase 7 Canonical Migration Plan

**Status:** active — P7.1 and P7.2 complete; P7.3 next  
**Branch:** `pattern-language-phase7`  
**Starting point:** `main@5eba14402b333836add71739395385a7686edf4e`  
**Authority:** [`pattern-language-phase6-review.md`](pattern-language-phase6-review.md)

This is the durable Phase-7 control point. It is written so migration can resume safely after loss of conversational context.

---

# 1. Current checkpoint

## Complete

- **P7.1 — identity/layout checkpoint**
  - Phase-7 branch created from the Phase-6 checkpoint;
  - stable ID map fixed;
  - canonical file layout fixed;
  - pattern index now derives active/retired entries from Markdown frontmatter through `docs/patterns/patterns.data.ts`;
  - authoring contract updated to the `HSA-P-003 — Coherent Horizontal Service Route` identity;
  - global navigation includes the migrated corpus.

- **P7.2 — surviving Core identities**
  - canonical pages created for `HSA-P-001..005`, `HSA-P-007..012`;
  - `HSA-P-003` renamed/scope-corrected without changing identity;
  - `HSA-P-006` retired permanently and recorded under `docs/patterns/retired/`;
  - durable `P-006` content moved to the canonical **Fail-Safe Water Distribution** strategy;
  - `core-12.md` remains untouched provenance and is not yet demoted.

## Next

**P7.3 — migrate/admit `HSA-P-013..022`.**

Do not start destructive cleanup, publication rewrite or computational crosswalk yet.

---

# 2. Migration principle

Phase 7 is structural work, not another doctrine or prose-discovery phase.

Each admitted pattern gets:

- one stable ID;
- one canonical page;
- one human-readable name;
- sparse graph relationships;
- explicit evidence/maturity state;
- an explicit boundary between architectural judgement and any formal consequence.

Migration itself never increases evidence or maturity.

---

# 3. Canonical layout

Active patterns live directly under `docs/patterns/`. The filesystem does not encode a canonical taxonomy.

Supporting material has explicit homes:

```text
docs/patterns/
  README.md
  language-model.md
  patterns.data.ts
  service-topology-sequence.md
  <active canonical patterns>.md

  strategies/
  candidates/
  retired/
  pilot/                  # migration provenance until final cleanup
```

Historical aggregate/source files stay in place until every reusable claim has a canonical destination and navigation/build validation passes.

---

# 4. Stable identity map

## Migrated existing identities

| ID | Canonical title | State |
|---|---|---|
| `HSA-P-001` | Controlled Utility Entry | active |
| `HSA-P-002` | Plant Room as Service Hub | active |
| `HSA-P-003` | Coherent Horizontal Service Route | active |
| `HSA-P-004` | High-Service-Room Service Wall | active |
| `HSA-P-005` | Designed Structural Penetration | active |
| `HSA-P-006` | Water-Damage-Safe Service Route | **retired permanently** |
| `HSA-P-007` | Permanent Opening / Replaceable Window | active |
| `HSA-P-008` | Movement / Slip Junction | active |
| `HSA-P-009` | Accessible Rainwater Route | active |
| `HSA-P-010` | Source-Capture Kitchen Extract | active |
| `HSA-P-011` | Roof Maintenance Route | active |
| `HSA-P-012` | Physical Service Index | active |

`HSA-P-006` is never reused.

## Authorised new identities — P7.3

| ID | Canonical title | Target file |
|---|---|---|
| `HSA-P-013` | Ground-Supported Façade Access | `ground-supported-facade-access.md` |
| `HSA-P-014` | Accessible Vertical Service Zone | `accessible-vertical-service-zone.md` |
| `HSA-P-015` | Accessible Room Service Route | `accessible-room-service-route.md` |
| `HSA-P-016` | Compartmented Service Void | `compartmented-service-void.md` |
| `HSA-P-017` | Visible Leakage Path | `visible-leakage-path.md` |
| `HSA-P-018` | Failure-Tolerant Wet Service Room | `failure-tolerant-wet-service-room.md` |
| `HSA-P-019` | Permanent Opening / Replaceable Door | `permanent-opening-replaceable-door.md` |
| `HSA-P-020` | Designed Threshold | `designed-threshold.md` |
| `HSA-P-021` | Source-Capture Bathroom Extract | `source-capture-bathroom-extract.md` |
| `HSA-P-022` | Controlled Attachment Plane | `controlled-attachment-plane.md` |

The numbering has no design meaning.

---

# 5. Frontmatter and graph rules

Canonical active patterns follow [`../patterns/language-model.md`](../patterns/language-model.md).

Required machine fields are:

- `id`, `title`, `kind`, `state`, `evidence`, `maturity`;
- `scales`, `domains`, `principles`;
- `requires`, `completes`, `alternative_to`, `tension_with`;
- `sequences`.

Graph discipline:

1. add an edge only when it carries recurring compositional knowledge;
2. do not encode sequence chronology as graph dependency;
3. do not add symmetric reverse edges mechanically;
4. omit mere “related to” relationships;
5. standalone patterns are acceptable.

The active/retired index is generated from canonical frontmatter; do not create another manual ID registry.

---

# 6. Remaining Phase-7 sequence

## P7.3 — ten newly admitted identities — **NEXT**

Migrate/admit `P-013..P-022` individually or in tightly related pairs.

Rules:

- use existing developed material where it exists;
- do not fabricate evidence for thin old publication placeholders;
- keep prose concise when the evidence base is thin;
- preserve Phase-6 evidence classification;
- do not infer maturity from Reference House use.

## P7.4 — non-pattern homes

After P7.3, normalise:

### Strategies

- Fail-Safe Water Distribution — **already complete**;
- Decompose Structural Interface Functions;
- Separate Structural Floor from Changeable Layers Where Proportionate.

### Held candidates — no stable IDs

- Replaceable Architectural Lining;
- Individually Isolatable Manifold Distribution;
- Local Deep Service Zone;
- Selective Floor Access / Selective Accessible Floor Zone.

Implementation-family/research records remain where they are unless moving them genuinely improves ownership. Do not tidy history for aesthetics.

## P7.5 — publication + Reference House reconciliation

Only after all canonical identities exist:

- update Reference House occurrence names/IDs;
- replace the obsolete Part-III 30-slot inventory;
- demote aggregate pattern prose from primary navigation;
- preserve provenance links.

## P7.6 — lightweight validation/tooling

Add only useful automation:

- ID uniqueness;
- relationship-reference validity;
- active/retired state checks;
- reverse-link/index generation;
- useful orphan warnings.

No D3 graph in Phase 7.

---

# 7. Evidence preservation rules

For every migration:

- carry forward the prior evidence classification unless Phase 6 explicitly changed it;
- preserve `Does not prove` limits;
- preserve prototype/professional-review gates;
- never infer `Drawn`, `Calculated`, `Built`, etc. from a reference-house occurrence;
- never treat Reference House use as evidence for the pattern;
- never treat formalizability as architectural validity.

Where source records conflict, keep the lower-confidence interpretation and record the conflict.

---

# 8. Delete/demote rules

Do not delete/demote an aggregate or source page until:

1. every reusable claim has a destination;
2. all canonical inbound navigation is repaired;
3. provenance points to the superseding destination;
4. docs build passes.

Expected later actions:

- `core-12.md` → superseded/provenance pointer only after all Core destinations are reviewed as a set;
- `candidates/accessible-vertical-service-zone.md` → superseded after `HSA-P-014` lands;
- `reversible-assembly-candidates.md` → retain until candidate/strategy/implementation destinations exist;
- `pilot/` → keep through Phase 7 as migration evidence, then decide whether to archive/demote.

---

# 9. Stop rules

Stop before merging if:

- IDs start encoding taxonomy/publication order;
- graph edges mostly mean “related to”;
- prose grows without adding design knowledge;
- a pattern changes meaning merely to preserve its number;
- research history must be rewritten to make the new structure neat;
- candidates are promoted because migration wants complete-looking pages;
- generated indexing requires a second content database;
- VitePress/navigation validation fails.

---

# 10. Resume protocol

Read in order:

1. root `README.md`;
2. `STATUS.md`;
3. [`pattern-language-overhaul.md`](pattern-language-overhaul.md);
4. [`pattern-language-phase6-review.md`](pattern-language-phase6-review.md);
5. this file;
6. [`../patterns/language-model.md`](../patterns/language-model.md).

Then continue **P7.3**, beginning with the strongest already-developed sources (`P-013` and `P-014`) before drafting thinner new pages.
