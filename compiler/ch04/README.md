# CH-04 — strengthen representation

**Gate:** CH-04  
**Baseline:** CH-03 merge `b265c611dd8322c7d1f7583b538c46d2c2e5fab5`  
**Computational maturity:** M3  
**Reference House capability sequence:** closed at RH-C5; no RH-C6 authorised

CH-04 strengthens selected compiler representations where a category mistake was plausible and the protection is cheap. It does not redesign the source language, add technical capability or change runtime numeric values.

## Result

The gate adopts four bounded changes:

1. validated cross-domain references now use lightweight nominal ID types;
2. important unit-bearing coordination values retain their existing branded units through helper/result boundaries;
3. numeric tolerances are named by operation class instead of anonymous local `EPSILON` constants;
4. the canonical Reference House result is shallow readonly and compilation is tested not to mutate its source.

Two low-noise TypeScript checks are also enabled: `noImplicitReturns` and `noFallthroughCasesInSwitch`.

## ID policy — brand references, not the authored language

The useful mistake to prevent is not “a string exists”. It is “a string known to mean one cross-domain identity is supplied where a different identity is required”.

CH-04 therefore introduces nominal reference types for:

- `PlanBoundaryId`;
- `StructuralLineId`;
- `StructuralInterruptionId`;
- `ServiceCrossingId`.

The constructors are zero-runtime-cost casts over strings. Runtime IDs and generated artefacts are unchanged.

The brands are deliberately applied **after validation / while deriving compiled cross-domain references**, for example:

- an architectural opening’s validated host-boundary reference;
- a structural bearing-opening obligation linking plan boundary to structural line;
- a derived service crossing’s plan-boundary / structural-interruption host and optional bearing line;
- a service-bearing obligation linking crossing, plan boundary and structural line;
- boundary opening/service obligations referring back to validated plan/service identities.

Authored fixtures and source contracts keep ordinary string IDs. This is intentional. Malformed-source tests must remain able to author a missing or wrong reference without type casts, because the compiler’s fail-closed source validation is responsible for rejecting those states.

Local entity IDs also remain ordinary strings where branding would only make maps and intra-domain validators noisy. CI initially exposed exactly this distinction: branding local entity IDs caused type friction in comparison maps without protecting an additional category boundary. CH-04 narrowed the design rather than weakening type safety with casts everywhere.

`compiler/ch04/ch04.test.ts` contains compile-time `@ts-expect-error` contracts proving that the cross-domain ID categories are not assignable to one another.

## Unit retention

The compiler already carries `Millimetres`, `SquareMillimetres` and `Degrees` through many architectural/structural results. CH-04 preserves those units more deliberately where higher-level helper/result signatures had fallen back to naked numbers.

In particular, Reference House boundary coordination now exposes `wallPlanningStressThicknessMm` as `Millimetres`, and plan helper arithmetic retains millimetre types at opening/host coordinate boundaries.

Two deliberate non-moves matter:

- `core/geometry.ts` keeps `Box2D` numeric rather than pretending a domain-neutral geometry primitive is always millimetres. P0 and generic box algorithms share it.
- `calculation-slice` keeps its explicit `{ value: number, unit: string }` evidence model. The generic method/check kernel validates units at runtime and must remain capable of representing malformed/wrong-unit evidence as `UNSUPPORTED`; importing architectural unit brands there would reduce that useful evidence boundary rather than improve it.

## Numeric tolerance policy

CH-04 does **not** replace every tolerance with one global epsilon. The earlier audit found two different operation classes and their values are preserved exactly:

```text
BOX_GEOMETRY_EPSILON        = 1e-9
MODEL_COORDINATE_EPSILON_MM = 1e-6
MODEL_AREA_EPSILON_MM2      = 1e-6
```

`compiler/core/numeric.ts` records that policy.

- generic box containment/adjacency/intersection keeps the established `1e-9` tolerance;
- plan/structure/RH-C3 coordinate, length and envelope comparisons use the named `1e-6` millimetre tolerance;
- plan/structure/RH-C4 overlap/closure comparisons use the named `1e-6` square-millimetre tolerance.

The equal numeric values for coordinate and area classes are not a claim that their dimensions are interchangeable. Separate names preserve the semantic distinction and allow later evidence to change one class without silently changing the other.

No comparison outcome for the canonical fixture was changed.

## Immutability boundary

`compileReferenceHouseSystem(source)` is now tested against a deep clone of its input; canonical compilation must leave source authority unchanged.

Its public `ReferenceHouseSystemCompileResult` surface is shallow readonly, including the direct domain-result slots, coordination/calculation groups, diagnostic groups and proof-family slots. This prevents accidental replacement/reclassification of canonical results after construction while avoiding a deep-readonly framework that would make domain mutation tests unnecessarily awkward.

CH-04 does not call `Object.freeze` and does not introduce runtime immutability machinery.

## TypeScript strictness

CH-04 evaluated the low-noise strictness options separately from the representation migration.

Adopted:

- `noImplicitReturns: true`;
- `noFallthroughCasesInSwitch: true`.

The complete repository already satisfies both without suppressions or unrelated edits, so they provide useful ongoing protection at negligible maintenance cost.

Not adopted in CH-04:

- `noUncheckedIndexedAccess`;
- `exactOptionalPropertyTypes`.

Those options would change the representation contract across broad parts of the repository, fixtures and tests rather than harden a small set of demonstrated compiler risks. CH-04 does not manufacture guards, non-null assertions or `any` merely to turn on a flag. They may be reconsidered later only if a concrete defect class justifies the migration.

## CI falsification during the gate

Opening the PR before closeout was useful.

The first typecheck exposed three places where validated source strings crossed into newly nominal compiled references: a boundary compiler lookup, an RH-C3 bearing obligation, and a service crossing object spread. These were fixed at the promotion boundary rather than by weakening the brands.

The next typecheck exposed one comparison-set inference in RH-C4. The set was correctly made `Set<string>` because it is comparison storage, not a source of nominal authority.

After typecheck was clean, every historical suite through CH-03 passed. The only CH-04 runtime failure was a new test that incorrectly expected the canonical wall stress thickness to be `600`; the frozen fixture is `450`. The test was corrected to the existing authority. Production source was not changed.

This sequence is evidence for the selected boundary: nominal types should mark validated references, not infect every local identity.

## Deliberate non-moves

CH-04 does not:

- brand every ID or local map key;
- convert domain-neutral `Box2D` to a millimetre-only geometry type;
- change the calculation evidence model;
- introduce deep readonly / runtime freezing;
- introduce provenance, fingerprints or result/schema identity work reserved for CH-05;
- add property/mutation-testing frameworks;
- change Reference House orchestration established by CH-03;
- change any fixture source fact, technical method, proof boundary or building conclusion;
- increase computational maturity;
- create RH-C6.

## Preservation contract

CH-04 passes only if:

- CH-00 semantic values, diagnostic sets, proof boundaries and six SVG identities remain exact;
- CH-01 fail-closed behaviour remains green;
- CH-02 dependency boundaries remain green;
- CH-03 single-pass/equivalence behaviour remains green;
- CF-01 remains green;
- every historical RH-C gate remains green;
- all runtime numeric values and selected calculation outcomes remain unchanged;
- canonical compilation does not mutate source input;
- M3 remains unchanged and no RH-C6 appears.

## Historical handoff

CH-04 handed canonical ordering/permutation evidence, stable source/method identity, justified result/schema identity, artefact/compile manifests and lightweight derivation lineage to [CH-05 — determinism, identity and provenance](../ch05/README.md). That work and the [CH programme](../../docs/computational/compiler-hardening-programme.md) are complete; CH-04's original scope did not include them.
