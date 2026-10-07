# Pattern-Language Overhaul — Phase 7 Canonical Migration Plan

**Status:** active — P7.1 through P7.4 complete; P7.5 next  
**Current branch:** `pattern-language-phase7-nonpattern-homes`  
**P7.4 starting point:** `main@4d831efb08f619799cfd0a2bc5d9c07a9273c08c`  
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

Canonical pages exist for all ten Phase-6 admissions:

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

P7.3 preserved evidence/maturity limits, kept thin admissions concise, and did not invent graph edges merely to make the language appear connected.

### P7.4 — non-pattern homes

The material deliberately kept outside the pattern graph now has explicit canonical homes.

**Strategies**

- [Fail-Safe Water Distribution](../patterns/strategies/fail-safe-water-distribution.md)
- [Decompose Structural Interface Functions](../patterns/strategies/decompose-structural-interface-functions.md)
- [Separate Structural Floor from Changeable Layers Where Proportionate](../patterns/strategies/separate-structural-floor-changeable-layers.md)

**Held candidates — no HSA IDs**

- [Replaceable Architectural Lining](../patterns/candidates/replaceable-architectural-lining.md)
- [Individually Isolatable Manifold Distribution](../patterns/candidates/individually-isolatable-manifold-distribution.md)
- [Local Deep Service Zone](../patterns/candidates/local-deep-service-zone.md)
- [Selective Floor Access](../patterns/candidates/selective-floor-access.md)

P7.4 disciplines preserved:

- candidates use `kind: candidate`, `state: held` and no `HSA-P-*` IDs;
- strategies use `kind: strategy` and remain outside the graph;
- each held candidate states the specific admission gate rather than accumulating generic research TODOs;
- Seated Floor Structure and Finish-Agnostic Floor Platform remain implementation challengers/provenance, not patterns;
- the old reversible-assembly aggregate remains untouched historical source material;
- the pre-admission Accessible Vertical Service Zone candidate remains provenance for canonical `HSA-P-014`;
- navigation now distinguishes canonical patterns, strategies, held candidates, retired identities and migration provenance explicitly.

## Next

**P7.5 — Reference House + publication reconciliation.**

This is integration work, not taxonomy work.

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

  strategies/              # canonical non-pattern strategies
  candidates/              # explicitly held, unnumbered pattern candidates
  retired/                 # retired stable identities, never reused
  pilot/                   # migration provenance until final cleanup
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

## P7.5 — publication + Reference House reconciliation — **NEXT**

### Reference House

- replace provisional/legacy pattern names with canonical IDs and titles where actual occurrences exist;
- distinguish **selected pattern**, **project occurrence**, **implementation family** and **evidence obligation**;
- do not add a pattern to the house merely because it exists in the language;
- preserve rejected/deferred decisions and rewind events from the Phase-5 run;
- keep Reference House use separate from evidence for the pattern.

### Publication

- replace the obsolete 30-slot Part-III inventory with the actual canonical language;
- group patterns for reading without encoding category into IDs;
- make strategies and held candidates visible where editorially useful but not part of the canonical pattern count;
- incorporate the service-topology generative sequence as method, not as a fake hierarchy;
- demote old aggregate pattern pages from primary reading paths while preserving provenance.

P7.5 passes only when the Reference House and publication no longer use obsolete pattern taxonomy as if it were canonical.

## P7.6 — lightweight validation/tooling

After P7.5, add only useful automation:

- duplicate-ID detection;
- relationship-reference validity;
- active/retired state checks;
- reverse links where they reduce navigation friction;
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

Current provenance disposition:

- `core-12.md` — legacy aggregate; canonical replacements now exist;
- `candidates/accessible-vertical-service-zone.md` — pre-admission provenance for `HSA-P-014`;
- `reversible-assembly-candidates.md` — mixed historical source whose strategy/candidate destinations now exist; implementation/prototype material remains useful;
- `pilot/` — migration evidence for the first linked language experiment.

P7.5 may demote these further in reading/navigation structure, but should not erase the historical record merely for neatness.

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
4. this file;
5. [`pattern-language-phase6-review.md`](pattern-language-phase6-review.md) only when classification rationale is needed;
6. [`../patterns/language-model.md`](../patterns/language-model.md);
7. Phase-5 Reference House run when occurrence/rejection context is needed.

Then continue **P7.5**. Do not reopen Phase-6 taxonomy unless new evidence reveals a genuine contradiction.