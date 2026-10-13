# Compiler Hardening programme

**Programme:** CH — Compiler Hardening  
**Status:** CH-03 PASS — CH-04 next  
**Baseline:** `0538be4a9124b107565717bb2f172e73ebfe86ba`  
**Computational maturity:** M3  
**Reference House capability sequence:** RH-C0 → RH-C5 complete; no RH-C6 authorised

## Purpose

The Reference House executable sequence has reached the limit of what can responsibly be added without new external, physical or professional evidence. The next internal programme therefore does **not** add building claims. It hardens the software machinery that represents the claims already earned.

The objective is to make the compiler **small, deterministic, explicit, fail-closed, strongly bounded, reproducible, traceable and difficult to misuse** while preserving the existing Reference House semantics and proof boundaries.

This programme is intentionally named `CH`, not `RH-C6`. A successful hardening pass may improve confidence in the compiler implementation. It does not, by itself, increase confidence in the physical adequacy of the house.

## End-state qualities

The hardened compiler should be:

- **total** — expected invalid input produces a controlled result rather than an incidental exception;
- **single-source** — every architectural fact has one computational authority;
- **single-pass** — the canonical Reference House is compiled once through an explicit dependency graph;
- **small** — no speculative CAD/BIM framework, generic solver architecture or premature abstraction;
- **typed where mistakes matter** — units and dangerous cross-domain semantic identities are hard to interchange accidentally;
- **immutable** — compilation behaves as a pure transformation of source into result;
- **deterministic** — semantically irrelevant source ordering does not change semantic output;
- **traceable** — important derived claims can be walked back to source facts, methods and authority;
- **architecturally bounded** — generic domains contain no Reference-House-specific knowledge;
- **boring to operate** — one obvious health check and one obvious artefact-verification path.

## Baseline to preserve

The starting baseline is commit:

`0538be4a9124b107565717bb2f172e73ebfe86ba`

At that commit:

- P0: PASS
- PAT-XW-01: PASS
- RH-C0: PASS
- RH-C1: PASS
- CF-01: PASS
- RH-C2: PASS
- RH-C3: PASS
- RH-C4: PASS
- RH-C5: PASS
- computational maturity: **M3**
- Working Edition PDF: PASS
- Primer PDF: PASS
- docs build / Pages deployment: PASS

If `main` has advanced before CH-00 begins, the agent must reconcile the new state explicitly and record the new hardening baseline before continuing.

## Proof boundary

Hardening is primarily **semantic-preserving software work**.

It may improve:

- software correctness;
- reproducibility;
- determinism;
- type safety;
- failure behaviour;
- traceability;
- test strength;
- maintainability;
- developer ergonomics.

It must not silently expand claims about:

- structural adequacy;
- foundation adequacy;
- thermal / moisture performance;
- airtightness;
- drainage capacity;
- MEP performance;
- fire / Building Regulations compliance;
- product adequacy;
- workmanship or construction tolerances;
- whole-building technical adequacy.

Any semantic change to existing architectural conclusions or proof boundaries must be explicit, separately justified and reviewed. Refactoring is not authority.

## Important observations to verify before refactoring

These observations motivated the programme. They are **audit hypotheses**, not instructions to rewrite blindly.

### Research history is visible in runtime architecture

The current repository contains useful historical/gate names such as `p0`, `cf01`, `rhc2`, `rhc3`, `rhc4` and `rhc5`. These are valuable as evidence, tests and programme history. They should not automatically remain the permanent production module boundaries.

The likely stable runtime concepts are:

```text
core
  ↓
plan
  ↓
structure
  ↓
services
  ↓
envelope
  ↓
calculation
```

Reference-House-specific adapters and coordination should sit outside the generic domains.

### The canonical Reference House path is historically nested

The current later-stage wrappers compose earlier gates (`C5 → C4 → C3 → C2`) and expose nested results such as `c4.c3.c2...`. Some upstream material is compiled more than once. This was useful while proving the gates, but should be tested against a cleaner final architecture in which one source produces one coherent compiled house.

### Fail-closed behaviour is not yet fully structural

Several compilers perform source diagnostics before derivation, while derivation helpers still contain `throw` paths for missing references. That means some malformed sources may fail by exception rather than by the compiler's controlled diagnostic/status model.

CH-01 should make the intended boundary explicit:

```text
source
  ↓
source-integrity validation
  ↓
fatal source error? ── yes → deterministic failed result
  │
  no
  ↓
pure derivation
  ↓
derived / integration validation
  ↓
canonical result
```

Expected malformed input belongs in the result model. Exceptions should be reserved for genuine programmer defects or impossible internal states.

### Cross-cutting conventions are duplicated

Audit for duplication of:

- diagnostic constructors;
- diagnostic sorting;
- status aggregation;
- duplicate-ID detection;
- numeric tolerance / `EPSILON` policy;
- SVG escaping / number formatting;
- generation policy;
- source/result cloning and ordering conventions.

Do not centralise mechanically. Extract only concepts that are actually the same.

### Type safety is selective

`Millimetres`, `SquareMillimetres` and `Degrees` are branded at some boundaries, while shared geometry and several calculations still use naked `number`. Many semantic identifiers are plain `string`, so a route ID and a boundary ID can satisfy the same TypeScript shape accidentally.

CH-04 should increase type safety selectively at high-risk boundaries without creating type-level ceremony.

### Provenance richness is uneven

The Reference House source carries authority/authorship/disposition/precision metadata. Several downstream slice sources reduce this to `provisional: boolean` plus semantic IDs.

CH should determine whether a lightweight trace/provenance index can preserve important derivation lineage without wrapping every scalar in metadata.

### `hardening.ts` modules contain real knowledge

C3/C4 hardening passes encode useful cross-domain invariants discovered during red-teaming. The programme should decide which of these are:

- generic domain checks;
- Reference House coordination checks;
- temporary research-stage post-processing.

The final architecture should avoid mutating an already-compiled generic result merely to bolt on Reference-House meaning where a clearer coordination phase would suffice.

### Generation policy is slightly inconsistent

C1/C2/C3/C4 generator scripts have small differences in filesystem style and in whether PASS/REVIEW/FAIL states may render. CH should converge on one explicit policy for canonical artefact generation and verification.

## Programme

### CH-00 — baseline freeze and architecture map

**Question:** Can later refactors prove that they preserved architectural meaning?

Work:

1. Reload current `main` and reconcile it with the baseline above.
2. Run and record the complete current validation stack.
3. Create a **machine-readable semantic baseline/manifest** for the canonical Reference House. Avoid an indiscriminate giant object snapshot. Capture the stable things that matter, such as:
   - compiler/result schema version;
   - fixture identity;
   - source fingerprint;
   - domain statuses;
   - proof boundaries;
   - stable diagnostic codes;
   - selected high-value derived values/counts;
   - generated artefact hashes.
4. Document the actual runtime dependency graph.
5. Record duplicate compilation and repeated cross-cutting conventions.
6. Classify modules/names into:
   - permanent runtime concepts;
   - Reference House adapters/coordination;
   - historical gates/regression fixtures;
   - publication/rendering concerns.
7. Define the semantic-preservation invariants that all later CH gates must satisfy.
8. Record any disagreement between this programme and the actual code before refactoring.

**Exit:** There is a durable, machine-checkable baseline that can detect accidental semantic drift during CH-01…CH-08.

**Result:** PASS. The CH-00 execution record and audited architecture map are in `compiler/ch00/README.md`; the machine-readable baseline is `compiler/ch00/reference-house-baseline.json`, enforced by `compiler/ch00/reference-house-baseline.test.ts`.

### CH-01 — total / fail-closed compilation

**Question:** Does every expected invalid source produce a deterministic compiler result rather than escaping as an incidental exception?

Work:

- separate source-integrity validation from derivation;
- prevent derivation from running across fatal missing references;
- remove silent neutral fallbacks for absent required evidence;
- define which exceptional conditions are genuine programmer errors;
- add adversarial tests for malformed references, non-finite values and broken graph edges;
- preserve upstream REVIEW/FAIL semantics.

**Exit:** expected malformed input cannot accidentally crash normal compilation.

**Result:** PASS. Plan compilation now stops before derivation when fatal source references or identities are invalid. Structural compilation validates every architectural plan-line prerequisite and stops only for failures that make derivation unsafe or ambiguous; invalid-but-derivable structural sources still run downstream checks so established diagnostics are preserved. Service and boundary derivation were audited and did not contain the same throwing required-reference path. The execution record is `compiler/ch01/README.md`, with adversarial coverage in `compiler/ch01/ch01.test.ts`; the CH-00 semantic manifest remains green.

### CH-02 — distil the permanent runtime architecture

**Question:** Can the codebase reflect stable architectural concepts rather than the chronology of the research programme?

Candidate runtime shape:

```text
compiler/
  core/
    ids
    units
    numeric
    geometry
    diagnostics
    status
    provenance
    deterministic

  plan/
  structure/
  services/
  envelope/
  calculation/

  reference-house/
    source/
    adapters/
    coordination/
    compile/
    render/
    manifest/

  testing/
    fixtures/
    contracts/
    gates/
      p0/
      pat-xw-01/
      rh-c1/
      cf01/
      rh-c2/
      rh-c3/
      rh-c4/
      rh-c5/
```

This shape is a hypothesis, not a mandated file move. Prefer less movement if the same architectural clarity can be achieved more cheaply.

Work:

- decide permanent domain boundaries;
- preserve RH-C*/CF-01 as tests/provenance where useful;
- establish explicit dependency direction;
- add machine-enforced forbidden imports if justified;
- ensure generic domains contain no Reference House fixture IDs or special cases.

**Exit:** runtime structure expresses stable concepts and dependency direction is mechanically enforceable.

**Result:** PASS. CH-02 extracted the shared `Box2D` primitive and box algorithms from historical P0 into `compiler/core/geometry.ts`, leaving `compiler/p0/geometry.ts` as a compatibility adapter for the P0 regression gate. Permanent plan/structure runtime modules no longer import P0. `compiler/ch02/architecture.test.ts` now enforces the actual generic runtime dependency DAG and rejects Reference House fixture knowledge in generic runtime logic. The audit also corrected the programme hypothesis: `calculation-slice` is a generic independent kernel, not a literal downstream dependency of boundary; RH-C5 places it downstream through Reference House orchestration. Rendering remains a separately classified downstream projection. The execution record is `compiler/ch02/README.md`. CH-00 semantic/artefact identity and CH-01 fail-closed behaviour remain green.

### CH-03 — single-pass Reference House compiler

**Question:** Can one canonical source be compiled once into one coherent result?

Target shape:

```text
compileReferenceHouse(source)

→ {
    status,
    architecture,
    plan,
    structure,
    services,
    envelope,
    calculations,
    coordination,
    diagnostics,
    provenance,
    proof
  }
```

Work:

- eliminate redundant upstream recompilation;
- replace `c4.c3.c2...` result archaeology with a coherent context/result;
- keep temporary compatibility adapters while migrating tests if needed;
- make cross-domain Reference House checks explicit coordination rules;
- avoid mutating generic compiled results in Reference House post-processing.

**Exit:** one canonical compilation path, one upstream result per domain, no semantic regression.

**Result:** PASS. `compiler/reference-house/system-compile.ts` is now the canonical production orchestration path. It compiles plan, structure, services, boundary and the selected calculation once each, derives the Reference House from that same plan result, and returns direct coherent domain state without `c4.c3.c2...` archaeology. Historical RH-C2…RH-C5 wrappers remain regression/provenance surfaces. The CH-00 frozen semantic/artefact test now runs through the single-pass compiler, and `compiler/ch03/ch03.test.ts` proves deep equivalence with the historical chain for the canonical source and a REVIEW mutation while mechanically rejecting nested stage-wrapper use in production orchestration. The execution record is `compiler/ch03/README.md`. No CH-00 baseline value, proof boundary or drawing identity changed.

### CH-04 — strengthen representation

**Question:** Can important category mistakes become impossible or obvious before runtime?

Work, selectively:

- introduce lightweight branded IDs at dangerous cross-domain interfaces;
- carry units through important geometry/calculation types instead of dropping to naked numbers;
- centralise an explicit numeric/tolerance policy by operation class;
- make source and compiled outputs readonly where practical;
- add source immutability tests;
- progressively consider stricter TypeScript options such as:
  - `noUncheckedIndexedAccess`;
  - `exactOptionalPropertyTypes`;
  - `noImplicitReturns`;
  - `noFallthroughCasesInSwitch`.

Do not add suppressions merely to satisfy strictness. Turn on only what has been properly reconciled.

**Exit:** meaningful ID/unit/mutation mistakes move from runtime convention toward compile-time prevention.

### CH-05 — determinism, identity and provenance

**Question:** Can a compiled result prove what source/methods produced it and reproduce itself exactly?

Work:

- canonical collection ordering;
- permutation-invariance tests for semantically unordered source data;
- stable source fingerprinting;
- calculation-method fingerprints where useful;
- result/schema versioning;
- semantic compile manifest;
- generated artefact hashes;
- lightweight derivation trace index from important outputs to source fact/method IDs.

Avoid cryptographic complexity for its own sake. The goal is identity and reproducibility.

**Exit:** semantically identical sources compile identically regardless of irrelevant ordering, and important outputs have inspectable lineage.

### CH-06 — strengthen the kinds of tests

**Question:** Do tests establish properties of the machinery rather than only many examples?

Preserve all useful existing mutation/example tests.

Add where valuable:

- shared compiler-contract tests;
- property-based tests for geometry/graph/status invariants;
- metamorphic tests, especially source permutation invariance and irrelevant-input isolation;
- deep determinism tests;
- selected mutation testing of small critical kernels such as geometry, status aggregation, graph connectivity and numeric criteria.

Coverage is diagnostic, not a target. Do not optimise for 100%.

**Exit:** core laws are attacked across generated state spaces and meaningful code mutations are killed by tests.

### CH-07 — toolchain and developer ergonomics

**Question:** Is the compiler boring and obvious to maintain?

Candidate interface:

```text
npm run check
npm test
npm run artifacts:check
npm run compile:reference-house
```

Work:

- one formatter/linter stack rather than overlapping tools;
- machine-enforced import/dependency policy if CH-02 justified it;
- pinned/local-vs-CI Node/package-manager conventions;
- CI caching and cancellation where useful;
- canonical artefact check mode that verifies without rewriting;
- one generation policy for PASS/REVIEW/FAIL;
- concise developer documentation for compiler work.

Tool choices are not pre-authorised. Evaluate cost first. Prefer the fewest tools that enforce meaningful invariants.

**Exit:** a clean checkout has one obvious path to “healthy repository,” and generated-state drift is easy to detect.

### CH-08 — distillation and deletion

**Question:** Does every remaining abstraction earn its existence?

Work:

- delete compatibility scaffolding introduced during migration;
- remove dead research-runtime paths while preserving historical tests/records;
- remove genuinely duplicated helpers after semantic consolidation;
- break giant fixtures into clearer domain data/builders only where that decreases cognitive load;
- audit public compiler API and names;
- final proof-boundary audit;
- final baseline comparison;
- reassess computational maturity.

Do **not** pre-authorise M4. At closeout ask whether the computational workstream itself satisfies the project definition of internally validated/controlled. Do not confuse that with physical validation or technical adequacy of the Reference House.

**Exit:** minimum machinery required to express the existing model without ambiguity.

## Programme-wide invariants

Every CH gate must preserve these unless an explicit semantic-change record says otherwise:

1. Existing architectural source authority remains authoritative.
2. No missing fact is invented to make a compiler path complete.
3. PASS/REVIEW/FAIL/UNSUPPORTED semantics do not silently weaken.
4. Existing proof boundaries do not expand by refactor.
5. CF-01 remains a regression gate against Reference-House-shaped generic code.
6. Generated drawings remain downstream projections of canonical model state.
7. No fixture-ID branching enters generic domain compilers.
8. Tests and publications remain green before merge.
9. Computational maturity stays M3 until explicitly reassessed at a justified gate.
10. No RH-C6 is created merely because CH work uncovers a possible new feature.

## Deliberate non-goals

Do not use CH to introduce:

- structural member sizing or whole-structure adequacy;
- foundation engineering;
- U-value, thermal-bridge, condensation or airtightness proof;
- drainage-capacity sizing;
- MEP sizing/performance;
- fire/building-control compliance conclusions;
- arbitrary polygon/curve geometry merely for generality;
- IFC/BIM export;
- a database;
- plugin architecture;
- dependency injection framework;
- monorepo tooling;
- speculative generic solver architecture;
- a language rewrite;
- abstraction for abstraction's sake.

## Final programme quality bar

By CH-08 we should be able to defend all of the following:

```text
Expected bad source data cannot accidentally crash normal compilation.

Every diagnostic has stable semantic identity.

Every generic domain is independent of the Reference House.

The Reference House is compiled in one coherent pass.

No architectural fact has two computational authorities.

Units survive through important geometry/calculation paths.

Dangerous cross-domain IDs cannot be casually interchanged.

Compilation does not mutate source data.

Source order does not affect semantic output where order has no meaning.

Generated artefacts are exactly reproducible.

Important derived claims can be traced to source facts/methods.

Module dependency direction is machine-enforced where it matters.

Tests attack laws and meaningful mutations, not only selected examples.

One obvious command establishes repository health.

The canonical Reference House still produces the architectural conclusions
frozen before the hardening refactor unless a semantic change is explicit.
```

## Handoff

CH-00, CH-01, CH-02 and CH-03 are complete. The next authorised gate is **CH-04 — strengthen representation**. Start from the frozen CH-00 manifest, CH-01 fail-closed contract, CH-02 runtime dependency boundary and CH-03 single-pass Reference House compiler; do not use CH-04 to add Reference House technical capability, do not create RH-C6, and keep computational maturity at M3 unless a later justified gate explicitly reassesses it.
