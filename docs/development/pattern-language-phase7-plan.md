# Pattern-Language Overhaul — Phase 7 Canonical Migration Plan

**Status:** active — P7.1 through P7.5 complete; P7.6 next  
**Current branch:** `pattern-language-phase7-integration`  
**P7.5 starting point:** `main@f4c67caed03eb1eb383dfb4738b5e1ebcaf5842e`  
**Authority:** [`pattern-language-phase6-review.md`](pattern-language-phase6-review.md)

This is the durable Phase-7 control point. It is written so migration can resume safely after loss of conversational context.

---

# 1. Completed checkpoints

## P7.1 — identity and layout

- stable ID map fixed;
- canonical file layout fixed;
- generated active/retired index established from Markdown frontmatter;
- authoring contract aligned to canonical names;
- navigation distinguishes canonical material from provenance.

## P7.2 — surviving Core identities

- canonical pages created for `HSA-P-001..005`, `HSA-P-007..012`;
- `HSA-P-003` preserved but renamed **Coherent Horizontal Service Route**;
- `HSA-P-006` retired permanently and never reused;
- its durable umbrella proposition moved to **Fail-Safe Water Distribution**.

## P7.3 — newly admitted identities

Canonical pages created for `HSA-P-013..022` without evidence or maturity inflation.

## P7.4 — non-pattern ownership

Canonical strategy homes:

- [Fail-Safe Water Distribution](../patterns/strategies/fail-safe-water-distribution.md)
- [Decompose Structural Interface Functions](../patterns/strategies/decompose-structural-interface-functions.md)
- [Separate Structural Floor from Changeable Layers Where Proportionate](../patterns/strategies/separate-structural-floor-changeable-layers.md)

Held candidates, deliberately unnumbered:

- [Replaceable Architectural Lining](../patterns/candidates/replaceable-architectural-lining.md)
- [Individually Isolatable Manifold Distribution](../patterns/candidates/individually-isolatable-manifold-distribution.md)
- [Local Deep Service Zone](../patterns/candidates/local-deep-service-zone.md)
- [Selective Floor Access](../patterns/candidates/selective-floor-access.md)

Implementation challengers and old aggregate records remain provenance/research rather than being promoted for tidiness.

## P7.5 — Reference House + publication reconciliation

### Reference House

Created the canonical [Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md), which distinguishes:

- selected pattern;
- actual project occurrence;
- implementation direction;
- outstanding evidence/design obligation;
- selected strategy;
- held candidate;
- rejected/rewound design move.

Confirmed current coordination occurrences:

- `RH-P001-01` — `HSA-P-001` Controlled Utility Entry;
- `RH-P002-01` — `HSA-P-002` Plant Room as Service Hub;
- `RH-P014-01` — `HSA-P-014` Accessible Vertical Service Zone;
- `RH-P004-01/02` — `HSA-P-004` High-Service-Room Service Wall;
- `RH-P003-01` — `HSA-P-003` Coherent Horizontal Service Route;
- `RH-P005-01..06` — `HSA-P-005` Designed Structural Penetration;
- `RH-P012-01` — `HSA-P-012` Physical Service Index.

Other patterns remain selected intent or simply unselected until geometry justifies an occurrence. Reference House use does not raise evidence/maturity.

The Phase-5 service-topology brief/run remain historical records; current navigation and Reference House overview identify them as such rather than rewriting their discovery-era terminology.

The External Access & Maintenance Plan was corrected to remove the old bundled **Perimeter Dry Zone** assumption. Wall-base moisture, drainage, inspection and temporary maintenance support are now coordinated as distinct functions and combined only where technically compatible.

### Publication

`publication-architecture.md` advanced to v0.11 and Part III now uses the actual canonical language:

- 21 active patterns;
- one visibly retired identity (`HSA-P-006`);
- three strategies alongside, not inside, the graph;
- four held candidates shown as a research frontier;
- editorial reading groups that do not encode taxonomy into IDs;
- the service-topology sequence presented as generative method, separate from graph relationships;
- migration provenance removed from the primary Part-III reading model.

P7.5 therefore passes: neither current Reference House state nor publication architecture treats the superseded catalogue/audit taxonomy as canonical.

---

# 2. Canonical identity state

Active pattern identities:

`HSA-P-001..005`, `HSA-P-007..022`.

Retired permanently:

`HSA-P-006 — Water-Damage-Safe Service Route`.

IDs carry identity only. They do not encode domain, scale, publication order or evidence level.

---

# 3. Graph / evidence discipline

- graph relations remain `requires`, `completes`, `alternative-to`, `tension-with`;
- chronology belongs in generative sequences;
- no generic `related-to` graph;
- evidence and maturity remain independent from identity;
- Reference House occurrence is not evidence;
- strategy is not a pattern node;
- implementation family is not a pattern merely because it has a reusable detail.

---

# 4. P7.6 — lightweight validation/tooling — **NEXT**

Add only tooling that reduces maintenance error.

Required gate:

1. stable pattern IDs are unique;
2. IDs match the canonical `HSA-P-xxx` form;
3. active/retired state is consistent with canonical location;
4. graph relationship references resolve to a known stable identity;
5. self-referential graph edges are rejected;
6. validation runs automatically during the documentation build;
7. reverse-reference information may be derived if useful, but no second registry/database is introduced.

Explicitly **do not** add:

- D3/graph visualisation;
- automatic graph-density targets;
- orphan warnings that punish intentionally standalone patterns;
- a second content store;
- compiler semantics in pattern metadata.

P7.6 passes when malformed identity/relationship metadata cannot silently enter the published language and the ordinary docs build remains green.

---

# 5. Phase-7 close gate

After P7.6, close Phase 7 only if:

- every active pattern has exactly one canonical page;
- `P-006` remains visibly retired;
- strategies/candidates remain outside the graph;
- Reference House current state uses canonical identities;
- publication architecture uses canonical Part III;
- provenance remains recoverable but is not presented as current authority;
- build/navigation/metadata validation passes;
- the resulting structure is easier to understand than the pre-migration catalogue.

Then Phase 8 (computational crosswalk) and the remaining publication development may proceed from the stable architectural language.

---

# 6. Preservation / stop rules

Never:

- rewrite `docs/source/house-design-doctrine-v7.md`;
- rewrite frozen computational runs merely to match terminology;
- erase research/prototype history because classification changed;
- assign a stable ID to a held candidate for convenience;
- add graph edges merely because two patterns are related;
- treat formalizability as architectural validity;
- let migration tooling become a new ontology project.

---

# 7. Resume protocol

Read:

1. root `README.md`;
2. `STATUS.md`;
3. [`pattern-language-overhaul.md`](pattern-language-overhaul.md);
4. this file;
5. [`../patterns/language-model.md`](../patterns/language-model.md);
6. [Reference House Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md);
7. [`publication-architecture.md`](../manuscript/publication-architecture.md).

Then execute **P7.6 only**. Do not reopen taxonomy unless new evidence exposes a genuine contradiction.