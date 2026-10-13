# CH-08 — distillation and deletion

**Gate:** CH-08  
**Status:** implementation candidate — validate before PASS  
**Starting main:** `4a5983f3e143af9d2b535b031d3265c8cbd84107`  
**Issue:** #74  
**Computational maturity at entry:** M3  
**Reference House capability:** RH-C0 through RH-C5 remain closed; no RH-C6

## Question

After CH-00…CH-07 have established preservation, fail-closed behaviour, runtime boundaries, single-pass orchestration, stronger representation, identity/provenance, law-based tests and a boring developer contract, what machinery can now be removed or simplified without erasing evidence or changing architectural meaning?

The target is not minimum line count. It is the minimum **clear** machinery justified by the current model and its evidence.

## Runtime and evidence classification

### Permanent generic runtime

The permanent generic runtime remains:

- `compiler/core/`
- `compiler/units.ts`
- `compiler/plan-slice/`
- `compiler/structure-slice/`
- `compiler/service-slice/`
- `compiler/boundary-slice/`
- `compiler/calculation-slice/`

CH-02 already mechanically enforces the dependency direction between these domains. CH-08 found no generic runtime module that was both reachable and semantically redundant.

### Canonical Reference House runtime

The canonical source and orchestration remain:

- `compiler/reference-house/fixture.ts`
- `compiler/reference-house/plan-adapter.ts`
- `compiler/reference-house/derive.ts`
- `compiler/reference-house/compile.ts`
- `compiler/reference-house/system-compile.ts`
- `compiler/reference-house/identity.ts`

The single-pass production entry point remains `compileReferenceHouseSystem(source)`.

The canonical orchestration still calls selected Reference-House-specific adapters and coordination rules whose files retain historical RH-C names:

- RH-C2 structural source adapter and proof boundary;
- RH-C3 service source/authority/coordination and proof boundary;
- RH-C4 boundary source/coordination and proof boundary;
- RH-C5 selected calculation method and proof boundary.

Those modules are not dead research paths: `system-compile.ts` uses them directly. Moving them merely to remove the RH-C path names would create compatibility wrappers or rewrite historical evidence without reducing semantic machinery, so CH-08 deliberately leaves them in place.

### Rendering and generation projections

Drawing/rendering modules and RH-C1…RH-C4 generators remain downstream projections. CH-07 already gives them one PASS-only generation policy and one non-mutating verification path. They are not source authority and are not deletion candidates while the committed artefacts remain publication/evidence outputs.

### Historical executable evidence

P0, PAT-XW-01, CF-01, RH-C1 and RH-C2…RH-C5 tests remain executable evidence. Their historical compile surfaces are intentionally retained even where the canonical production path no longer calls the same wrapper.

This includes `compileReferenceHouse(source)`: RH-C1 tests deliberately exercise that bounded historical contract. Rewriting those tests solely to delete the wrapper would erase an independent regression surface rather than simplify production runtime.

## Distillation performed

### One `Box2D` type authority

CH-02 moved shared box algorithms to `compiler/core/geometry.ts`, but `compiler/p0/model.ts` still declared a second structurally identical `Box2D` interface.

CH-08 removes that duplicate declaration. P0 now exports `Box2D` as a type alias to the core geometry type, preserving the historical P0 public type name while leaving one underlying type authority.

`compiler/p0/geometry.ts` remains. It is not a duplicate geometry implementation: it re-exports the core algorithms and adds the P0-specific `Geometry` type guard required by historical P0 evidence.

### Unused RH-C3 / RH-C4 barrel façades

`compiler/rhc3/index.ts` and `compiler/rhc4/index.ts` exposed convenience barrels but were not themselves an executable gate, proof boundary, generator, canonical runtime dependency or documented developer command.

They are deleted. Typecheck and the complete gate stack are the reachability proof: if either façade remains a live repository dependency, CH-08 must fail rather than restore it by assumption.

## Deliberate non-deletions

### `compiler/reference-house/units.ts`

This 28-byte module is intentionally retained. It gives the RH-C1 source/model/tests a stable local units façade and is actively imported. Removing it would spread root-relative import changes through the historical Reference House surface without removing a unit authority; the real authority remains `compiler/units.ts`.

### RH-C3 / RH-C4 hardening modules

These names record the gate where the rules were discovered, but the rules themselves are live Reference House coordination knowledge. The canonical `system-compile.ts` imports them directly. Moving them would add indirection, not delete it.

### Large Reference House fixture

`createReferenceHouseSource()` remains the single authored source authority. Splitting the fixture into multiple independently authored fragments would increase authority ambiguity and perturb identity/provenance for aesthetic gain. CH-08 therefore leaves the fixture intact.

### Historical gate wrappers and tests

P0, CF-01, RH-C1 and RH-C2…RH-C5 remain because they prove independent historical contracts. They are not production architecture merely because they are executable, but executable provenance is still evidence.

### Domain names and file layout

No broad `*-slice` rename or directory rearrangement is performed. The current names are mechanically enforced, understood by the tests and not themselves a correctness burden. Renaming them would be cosmetic churn.

## CH-08 mechanical contracts

`compiler/ch08/ch08.test.ts` protects the final distillation decisions:

- `compiler/core/geometry.ts` is the sole `Box2D` interface definition;
- P0 preserves its exported `Box2D` name only as a core type alias;
- the unused RH-C3/RH-C4 barrel façades remain absent;
- historical executable P0/CF-01/RH-C1/RH-C2…RH-C5 evidence remains present.

## Preservation boundary

CH-08 must preserve exactly:

- `createReferenceHouseSource()` source authority;
- `compileReferenceHouseSystem(source)` as the canonical production path;
- CH-00 frozen semantic/proof/artefact baseline and all six exact SVG identities;
- CH-01 fail-closed behaviour;
- CH-02 dependency laws;
- CH-03 single-pass/equivalence contract;
- CH-04 ID/unit/tolerance/readonly/immutability contracts;
- CH-05 identity schema `HK-RH-COMPILE-1`, manifests, lineage and artefact linkage;
- CH-06 deterministic law/property/metamorphic evidence;
- CH-07 health, artefact-check, runtime and PASS-only generation contracts;
- CF-01 bounded genericity;
- RH-C2…RH-C5 historical meanings;
- runtime numeric values and selected calculation outcomes;
- generated drawings as downstream projections;
- no new technical proof family;
- no RH-C6.

## Maturity reassessment

Entry maturity is **M3 — Coordinated**. CH-08 does not pre-authorise promotion.

After exact-head and merged-main validation, reassess only the bounded computational workstream against M4:

> The proposition has been deliberately challenged against internal tests or evidence and is stable enough to act as the controlled baseline.

A promotion, if earned, applies only to the compiler at its stated proof boundaries. It would not promote the Reference House, establish physical adequacy, establish Building Regulations compliance, substitute for professional review or imply M5.

## Exit evidence required before PASS

- typecheck proves the deleted barrel façades have no live repository callers;
- `npm run test:ch08` passes;
- `npm run artifacts:check` remains green through the retained CH-00/CH-05 contracts;
- `npm run check` passes on the exact PR head;
- CH-00 through CH-07, CF-01 and RH-C2 through RH-C5 remain green;
- all six canonical SVG identities remain unchanged;
- merged-main builds the Working Edition and Primer PDFs and deploys Pages;
- the final computational maturity judgement is recorded explicitly;
- the Compiler Hardening programme closes rather than inventing CH-09;
- no RH-C6 is created.
