# Pattern-Language Overhaul — Phase 7 Canonical Migration Plan

**Status:** **complete — P7.1 through P7.6 passed**  
**Validated checkpoint:** `main@d2788191b546d1049f84e50fe1644e1007715179`  
**Gate review:** [`pattern-language-phase7-review.md`](pattern-language-phase7-review.md)  
**Authority:** [`pattern-language-phase6-review.md`](pattern-language-phase6-review.md)

Phase 7 converted the audited corpus into one canonical architectural language without erasing research history or promoting unresolved systems for neatness.

---

# 1. Completed sequence

## P7.1 — identity and layout

- stable IDs fixed;
- active canonical patterns live directly under `docs/patterns/`;
- retired identities live under `docs/patterns/retired/`;
- the pattern index derives from Markdown frontmatter;
- navigation distinguishes current authority from migration provenance.

## P7.2 — surviving Core identities

- `HSA-P-001..005` and `HSA-P-007..012` migrated to individual canonical pages;
- `HSA-P-003` retained its identity but became **Coherent Horizontal Service Route**;
- `HSA-P-006` was permanently retired;
- its durable umbrella proposition became the **Fail-Safe Water Distribution** strategy.

## P7.3 — newly admitted identities

Canonical pages created for `HSA-P-013..022` without evidence or maturity inflation.

## P7.4 — non-pattern homes

Canonical strategies:

- [Fail-Safe Water Distribution](../patterns/strategies/fail-safe-water-distribution.md)
- [Decompose Structural Interface Functions](../patterns/strategies/decompose-structural-interface-functions.md)
- [Separate Structural Floor from Changeable Layers Where Proportionate](../patterns/strategies/separate-structural-floor-changeable-layers.md)

Held candidates — deliberately without HSA IDs:

- [Replaceable Architectural Lining](../patterns/candidates/replaceable-architectural-lining.md)
- [Individually Isolatable Manifold Distribution](../patterns/candidates/individually-isolatable-manifold-distribution.md)
- [Local Deep Service Zone](../patterns/candidates/local-deep-service-zone.md)
- [Selective Floor Access](../patterns/candidates/selective-floor-access.md)

Implementation challengers and research history remained outside the graph.

## P7.5 — Reference House + publication integration

- created the canonical [Reference House Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md);
- separated pattern selection, actual occurrence, implementation direction and evidence obligation;
- retained Phase-5 run/brief terminology as historical discovery records;
- advanced Publication Architecture to v0.11 and replaced the obsolete 30-slot inventory with the actual language;
- removed the rejected bundled **Perimeter Dry Zone** assumption from the current external-maintenance plan.

## P7.6 — lightweight validation

The normal documentation build now rejects:

- malformed stable IDs;
- duplicate stable IDs;
- invalid active/retired state;
- canonical-location/state mismatch;
- relationship references to unknown IDs;
- self-referential graph edges.

Reverse-reference data is derived from the same Markdown frontmatter. No second registry or graph database was introduced.

The first production build with validation active passed on 2026-10-07.

---

# 2. Final canonical identity state

Active patterns:

`HSA-P-001..005`, `HSA-P-007..022` — **21 active identities**.

Retired permanently:

`HSA-P-006 — Water-Damage-Safe Service Route`.

IDs encode identity only. They do not encode domain, scale, publication order or evidence level.

---

# 3. Rules that remain binding

- graph relations remain sparse: `requires`, `completes`, `alternative-to`, `tension-with`;
- chronology belongs in generative sequences, not graph edges;
- evidence/maturity are independent from identity;
- Reference House occurrence is not evidence;
- strategies are not pattern nodes;
- candidates receive no stable pattern IDs until admission;
- implementation families are not promoted merely because they are reusable;
- retired IDs are never reused;
- Markdown remains the source of truth;
- research/prototype history is preserved rather than rewritten to match current taxonomy.

---

# 4. Phase-7 close gate

All close conditions passed:

- one canonical page per active pattern;
- visible retired `P-006`;
- explicit strategy and held-candidate homes;
- current Reference House state reconciled to canonical IDs;
- publication Part III rebuilt around the canonical language;
- provenance preserved but demoted from current authority;
- navigation/build validation green;
- identity/state/relationship validation green.

See [`pattern-language-phase7-review.md`](pattern-language-phase7-review.md) for the formal gate review.

---

# 5. What comes next

## Phase 8 — computational crosswalk

Map only **formalisable consequences** of stable patterns into the existing semantic relationship / obligation / evidence model.

Do not make pattern objects the compiler ontology.

## Publication development

The taxonomy/structure problem is solved. Continue with publication-quality Part III/IV synthesis, figures, evidence presentation and editing.

## Continuous validation

Physical prototypes, engineering and professional review may change evidence/maturity or force future pattern retirement. Phase 7 completion does not freeze knowledge against new evidence.

---

# 6. Resume protocol

Read:

1. root `README.md`;
2. `STATUS.md`;
3. [`pattern-language-overhaul.md`](pattern-language-overhaul.md);
4. [`pattern-language-phase7-review.md`](pattern-language-phase7-review.md);
5. [`../patterns/README.md`](../patterns/README.md);
6. [`../reference-house/pattern-occurrence-register.md`](../reference-house/pattern-occurrence-register.md);
7. [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md).

Do **not** restart Phase 7 or reopen taxonomy by default. Reclassification now requires new architectural, physical or professional evidence.