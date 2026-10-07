# Pattern-Language Overhaul — Phase 7 Canonical Migration Plan

**Status:** active — P7.1, P7.2 and P7.3 complete; P7.4 next  
**Current branch:** `pattern-language-phase7-new-identities`  
**P7.3 starting point:** `main@722e883c6b2e4c8f3bad4ae232ab5d73125943d3`  
**Authority:** [`pattern-language-phase6-review.md`](pattern-language-phase6-review.md)

This is the durable Phase-7 control point. It is written so migration can resume safely after loss of conversational context.

---

# 1. Current checkpoint

## Complete

### P7.1 — identity/layout checkpoint

- stable ID map fixed;
- canonical file layout fixed;
- pattern index derives active/retired entries from Markdown frontmatter through `docs/patterns/patterns.data.ts`;
- authoring contract updated to the `HSA-P-003 — Coherent Horizontal Service Route` identity;
- global navigation carries canonical and provenance material explicitly.

### P7.2 — surviving Core identities

- canonical pages exist for `HSA-P-001..005`, `HSA-P-007..012`;
- `HSA-P-003` was renamed/scope-corrected without changing identity;
- `HSA-P-006` is permanently retired under `docs/patterns/retired/`;
- durable `P-006` content became the **Fail-Safe Water Distribution** strategy;
- `core-12.md` remains untouched provenance pending final Phase-7 cleanup.

### P7.3 — newly admitted identities

Canonical pages now exist for all ten Phase-6 admissions:

- `HSA-P-013` Ground-Supported Façade Access;
- `HSA-P-014` Accessible Vertical Service Zone;
- `HSA-P-015` Accessible Room Service Route;
- `HSA-P-016` Compartmented Service Void;
- `HSA-P-017` Visible Leakage Path;
- `HSA-P-018` Failure-Tolerant Wet Service Room;
- `HSA-P-019` Permanent Opening / Replaceable Door;
- `HSA-P-020` Designed Threshold;
- `HSA-P-021` Source-Capture Bathroom Extract;
- `HSA-P-022` Controlled Attachment Plane.

P7.3 disciplines preserved:

- `P-013` and `P-014` migrated from developed source material without evidence inflation;
- the thinner `P-015..P-022` pages remain deliberately concise;
- new identities are `supported` where the architectural pattern itself remains a transfer/generalisation even if an underlying regulation or technical principle is established;
- Reference House use did not increase maturity;
- no graph edges were invented merely to make the language look connected;
- the generated index scans canonical root pattern pages plus retired identities, while excluding pilot duplicates;
- legacy candidate/pilot/aggregate pages remain explicit migration provenance rather than competing canonical records.

## Next

**P7.4 — normalise non-pattern homes.**

Do not begin publication rewrite or computational crosswalk until P7.4 is complete and the canonical/non-canonical corpus is structurally unambiguous.

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
| `HSA-P-013` | Ground-Supported Façade Access | active |
| `HSA-P-014` | Accessible Vertical Service Zone | active |
| `HSA-P-015` | Accessible Room Service Route | active |
| `HSA-P-016` | Compartmented Service Void | active |
| `HSA-P-017` | Visible Leakage Path | active |
| `HSA-P-018` | Failure-Tolerant Wet Service Room | active |
| `HSA-P-019` | Permanent Opening / Replaceable Door | active |
| `HSA-P-020` | Designed Threshold | active |
| `HSA-P-021` | Source-Capture Bathroom Extract | active |
| `HSA-P-022` | Controlled Attachment Plane | active |

`HSA-P-006` is never reused. The numbering has no design meaning.

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

## P7.4 — non-pattern homes — **NEXT**

Normalise the material Phase 6 explicitly kept outside the canonical graph.

### Strategies

- **Fail-Safe Water Distribution** — already complete;
- **Decompose Structural Interface Functions** — create canonical strategy page from the durable abstraction in Seated Floor Structure research;
- **Separate Structural Floor from Changeable Layers Where Proportionate** — create canonical strategy page from the floor-platform work without promoting a removable platform.

### Held candidates — no stable IDs

Create or normalise explicit candidate homes for:

- Replaceable Architectural Lining;
- Individually Isolatable Manifold Distribution;
- Local Deep Service Zone;
- Selective Floor Access / Selective Accessible Floor Zone.

Candidate pages must state their unresolved admission gate. They do not receive `HSA-P-*` IDs.

### Implementation-family/provenance material

Keep source research and prototypes where they are unless moving them clearly improves ownership. In particular, do not erase:

- service skirting;
- door-surround service routing;
- undercroft topology;
- pipe-in-pipe / withdrawable pipe;
- Seated Floor Structure;
- Finish-Agnostic Floor Platform;
- functional cornice;
- specific backplane rail/frame systems.

These remain useful implementations, experiments or project expressions rather than canonical patterns.

## P7.5 — publication + Reference House reconciliation

Only after P7.4:

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
- `candidates/accessible-vertical-service-zone.md` → pre-admission provenance after canonical `HSA-P-014` is established;
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

Then continue **P7.4**. Do not reopen Phase-6 taxonomy unless new evidence reveals a genuine contradiction.