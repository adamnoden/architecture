# CH-08 — distillation and deletion

**Gate:** CH-08  
**Status:** PASS  
**Starting main:** `4a5983f3e143af9d2b535b031d3265c8cbd84107`  
**Issue:** #74  
**Computational maturity:** M4 — internally validated / controlled at bounded computational scope  
**Reference House capability:** RH-C0 through RH-C5 remain closed; no RH-C6

## Question

After CH-00…CH-07 established preservation, fail-closed behaviour, runtime boundaries, single-pass orchestration, stronger representation, identity/provenance, law-based tests and a boring developer contract, what machinery could be removed or simplified without erasing evidence or changing architectural meaning?

The target was not minimum line count. It was the minimum **clear** machinery justified by the current model and its evidence.

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

They are deleted. Typecheck and the complete gate stack prove that neither façade has a live repository caller.

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

### Other duplicated-looking conventions

The final audit also revisited diagnostic/status helpers, ordering/canonicalisation, cloning and generation policy. No additional extraction earned its cost:

- domain diagnostic/status logic differs in semantics and failure boundaries, so a generic helper would introduce flags or erase meaning;
- CH-05 canonicalisation is intentionally narrow to collections proven semantically unordered;
- clone helpers remain useful test/source-mutation tools rather than production authorities;
- CH-07 already centralised the genuinely shared PASS-only canonical generation policy.

## Durable callable surface

`compiler/README.md` now distinguishes the durable production surface from historical executable evidence.

For the canonical Reference House:

- `createReferenceHouseSource()` is the source authority;
- `compileReferenceHouseSystem(source)` is the canonical production compiler;
- returned identity/lineage state is the inspectable CH-05 provenance surface.

The permanent generic compilers remain directly usable at their own bounded contracts: `compilePlanSlice`, `compileStructuralTopology`, `compileServiceTopology`, `compileBoundaryTopology` and `runCalculationCheck`.

Historical P0/CF-01/RH-C1…RH-C5 entry points remain regression/provenance surfaces, not competing canonical production APIs.

## CH-08 mechanical contracts

`compiler/ch08/ch08.test.ts` protects the final distillation decisions:

- `compiler/core/geometry.ts` is the sole `Box2D` interface definition;
- P0 preserves its exported `Box2D` name only as a core type alias;
- the unused RH-C3/RH-C4 barrel façades remain absent;
- historical executable P0/CF-01/RH-C1/RH-C2…RH-C5 evidence remains present.

## Proof-boundary audit

The first complete validation of the implemented distillation ran on exact branch head `14b6b9f9da055982dcd4507583acce140a1dcde9` in workflow `38479425004`, job `115578076876`, and passed:

- TypeScript typecheck;
- repository and public-route integrity;
- P0 17/17;
- PAT-XW-01 6/6;
- RH-C1 27/27;
- CF-01 7/7;
- RH-C2 17/17;
- RH-C3 21/21;
- RH-C4 29/29;
- RH-C5 16/16;
- CH-00 through CH-08;
- publication validation;
- VitePress documentation build.

CH-00 specifically reconfirmed the frozen semantic/proof baseline and all six exact canonical SVG identities. No source fact, diagnostic set, proof boundary, runtime numeric value, selected calculation outcome or canonical drawing changed.

The final exact-head PR run and merged-main publication/Pages run are recorded in the issue #74 closeout so the execution record does not require a post-merge documentation-only commit.

## Maturity reassessment

CH-08 explicitly reassessed the computational workstream against the project definition of M4:

> The proposition has been deliberately challenged against internal tests or evidence and is stable enough to act as the controlled baseline.

**Judgement: M4 is earned for the bounded computational workstream.**

The basis is the cumulative CH programme:

- CH-00 froze semantic, proof and artefact identity;
- CH-01 attacked malformed prerequisites and established fail-closed behaviour;
- CH-02 machine-enforced the permanent runtime boundary;
- CH-03 proved single-pass equivalence with the historical chain;
- CH-04 strengthened dangerous representations and source immutability;
- CH-05 established deterministic source/method/result/compile identity and lineage;
- CH-06 attacked generic laws over deterministic generated state spaces;
- CH-07 made local/CI health and artefact verification reproducible and explicit;
- CH-08 removed only machinery that failed the runtime/evidence test, then reproduced the pre-hardening baseline unchanged.

This is a software-control judgement, not a building-performance judgement. M4 does **not** establish Reference House physical adequacy, structural adequacy, Building Regulations compliance, building-physics adequacy, construction validation or external professional validation. The Reference House remains M3 at virtual-design scope. M5 remains unavailable without appropriate external validation.

## Preservation result

CH-08 preserves:

- `createReferenceHouseSource()` source authority;
- `compileReferenceHouseSystem(source)` as canonical production path;
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

## Closeout

CH-08 is the final Compiler Hardening gate. The programme is closed rather than extended by inertia.

There is **no CH-09** and **no standing RH-C6**. The bounded compiler is now held as an M4 internally validated/controlled baseline. Future compiler work should be demand-led by external review, physical validation, a real project, newly authoritative inputs or another concrete proof family—not by an open-ended software-hardening queue.
