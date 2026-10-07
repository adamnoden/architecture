# P0 + PAT-XW-01 — Executable Gate Result

**Status:** PASS  
**Date:** 2026-10-07  
**P0 merge:** `efbf412a4c8c7d5d80b13979bda8a14af7f8b2ce`  
**P0 integration repair:** `7fa7b5ce9629336457634e69c209cf19952c7f65`  
**PAT-XW-01 merge:** `2c3c87c5fbc3fcce370b94d694c4bff038624871`

This record closes the first executable falsification gate of the House Systems Architecture computational track. It records what the code actually demonstrated. It does not convert the compiler prototype into evidence that a building, pattern or construction system is technically adequate.

---

## 1. P0 result

**P0: PASS.**

The minimal executable kernel was merged to `main` and run in GitHub Actions. The successful integration run executed:

- TypeScript type checking;
- 17 P0 executable tests across five suites;
- the documentation build and navigation guard;
- the Pages artifact build.

All passed.

The kernel demonstrated the intended minimum mechanisms:

- stable semantic identity;
- typed relationships;
- deterministic source and simple geometry well-formedness;
- architectural project requirements distinct from model validity;
- obligation derivation from composed source relationships;
- scoped evidence;
- selective evidence staleness and invalidation;
- explicit `PASS`, `FAIL`, `UNRESOLVED`, `UNSUPPORTED` and `EXTERNALLY_DISCHARGED` states;
- intelligible diagnostics;
- deterministic replay.

The mutation suite rejected or distinguished:

- duplicate identities;
- missing relationship endpoints;
- overlapping spaces;
- false declared adjacency;
- hosted openings outside their host;
- uncontrolled service crossings;
- new boundary roles without matching evidence;
- evidence applied outside its declared subject scope;
- stale evidence after a dependent fact changed;
- explicit technical evidence failure;
- unsupported geometry.

No pattern object, pattern ontology, general CAD model, regulations engine or solver was required.

---

## 2. PAT-XW-01 result

**PAT-XW-01: PASS.**

The first post-P0 executable pattern-crosswalk fixture was merged to `main` and run in the same CI path. The successful run executed six crosswalk tests in addition to the full P0 suite. All passed.

The fixture exercised:

- `HSA-P-003 — Coherent Horizontal Service Route`;
- `HSA-P-005 — Designed Structural Penetration`.

Pattern provenance is carried by project requirements. The building facts remain ordinary semantic entities and relationships. Technical obligations continue to derive from the composed building model rather than from pattern-specific rule packs.

A crosswalk report groups three things without collapsing them:

1. **formal architectural commitments** — project authority, with `HSA-P-*` provenance;
2. **induced technical obligations** — physical/regulatory/product authority as appropriate;
3. **architectural judgement** — explicitly `HUMAN_DETERMINATION` where the machine has no legitimate proof.

There is deliberately no whole-pattern `status` field.

---

## 3. Mutation findings

### XW-M01 — uncontrolled crossing

Removing the owned penetration while retaining the route/wall crossing causes model failure. This is a source/relationship defect, not a pattern-specific fire or envelope rule.

### XW-M02 — pattern commitment resolved, technical evidence absent

Removing one penetration evidence item leaves the formal `P-005` project commitments resolved while the corresponding technical obligation becomes `UNRESOLVED`.

This proves that pattern conformance is not technical proof.

### XW-M03 — technically unchanged, HSA intent violated

A new branch can remain acceptable to the technical model while failing the selected `P-003` accessible-route project requirement.

This proves that technical validity is not the same thing as compliance with HSA project intent.

### XW-M04 — new boundary role

Adding a fire role to the crossed wall derives a new regulatory technical obligation. Existing air evidence remains current and its scope does not broaden automatically.

This proves selective obligation derivation and evidence scope survive the crosswalk layer.

### Deterministic replay

A frozen source produces a deep-equal crosswalk result on repeated compilation.

---

## 4. Negative findings

The executable work did **not** justify:

- a `Pattern` or `PatternIntent` core compiler entity;
- a pattern graph inside the compiler;
- pattern-specific technical rule packs;
- a universal pattern PASS/FAIL result;
- arbitrary numerical thresholds for architectural judgement;
- a second source of building facts;
- immediate expansion into CAD, general solvers or a full regulations engine.

These remain explicit stop rules.

---

## 5. Deferred item — P-012

`HSA-P-012 — Physical Service Index` was deliberately not added to PAT-XW-01.

Representing physical labels/index records may eventually justify a generic `identifies` / `refers-to` relationship and a physical-record correspondence state. The first crosswalk did not need that abstraction, so it has not been added speculatively.

`C-052` therefore remains open but **deferred until a real physical-information use case makes the abstraction necessary**.

---

## 6. Programme consequence

The computational track has now crossed the gate it was waiting for:

```text
paper semantic model       PASS at internal research scope
Phase-8 crosswalk          PASS at internal mapping scope
P0 executable kernel       PASS
PAT-XW-01                  PASS
```

This is enough to stop generic compiler expansion.

The next executable fixture must be selected from a real unresolved architectural, physical or professional-review question. It must not be selected merely because another pattern can be automated.

The highest-value project uncertainties are now outside this kernel:

- physical quality and workmanship of reversible assemblies;
- structural validity of floor/interface propositions;
- whole-house Reference House coordination;
- passive-first environmental performance;
- competent external structural, fire/building-control and building-services review.

Computational extensions remain available as targeted experiments when those workstreams expose a question worth formalising.

---

## 7. Gate decision

**PASS — freeze generic kernel/crosswalk growth.**

Keep the P0 and PAT-XW-01 suites in CI as regression tests. Reopen the computational architecture only when implementation, physical testing, Reference House coordination or external professional review exposes a concrete model defect or a high-value unresolved relationship.