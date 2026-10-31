# CH-00 — baseline freeze and architecture map

**Gate:** CH-00  
**State:** PASS — historical baseline and pre-hardening audit\
**Semantic baseline:** `0538be4a9124b107565717bb2f172e73ebfe86ba`  
**Programme handoff:** `5fd80620de0faecc4c5510e52fef98f9ab7b2495`  
**Computational maturity:** M3  
**Historical handoff:** CH-01 — total / fail-closed compilation\
**RH-C sequence:** closed at RH-C5; no RH-C6 is authorised

CH-00 freezes the meaning of the existing compiler before refactoring it. It does not add a Reference House capability or expand any proof boundary.

The runtime map and unresolved implementation issues below describe the CH-00 baseline. [CH-08](../ch08/README.md) records the completed hardening programme; the [compiler overview](../README.md) describes the current entry point and workflow.

## Baseline reconciliation

`main` at CH-00 start was exactly the hardening-plan handoff commit `5fd80620de0faecc4c5510e52fef98f9ab7b2495`. Comparing it with the semantic compiler baseline `0538be4a9124b107565717bb2f172e73ebfe86ba` shows one change only: addition of `docs/computational/compiler-hardening-programme.md`. No compiler, fixture, drawing, test, package or publication implementation changed between those commits. The executable semantics on the handoff commit are therefore the `0538be4` semantics.

The validation history needs one qualification. The full Pages workflow for `0538be4` passed. The Pages workflow for `5fd8062` failed during `test:repo` because the newly added programme page was not added to curated navigation; later publication and docs-build steps were skipped. This is a documentation-integration defect introduced by the handoff commit, not a compiler semantic failure. CH-00 preserves that historical fact and repairs the navigation omission separately from the semantic baseline.

## Machine-readable semantic baseline

The canonical baseline is `compiler/ch00/reference-house-baseline.json`. It intentionally does not serialize the complete internal object graph.

It freezes:

- CH-00 manifest identity and historical baseline commits;
- computational maturity M3;
- canonical Reference House fixture identity;
- a Git-blob fingerprint of the authoritative Reference House fixture source;
- canonical domain and aggregate statuses;
- RH-C2, RH-C3, RH-C4 and RH-C5 proof boundaries;
- canonical diagnostic-code sets;
- selected high-value dimensions, areas, counts and coordination results;
- RH-C5 method/input identity and selected observed values;
- Git-blob hashes of the six committed RH-C1…RH-C4 SVG artefacts.

`compiler/ch00/reference-house-baseline.test.ts` is the machine gate. It recompiles the canonical Reference House through RH-C5, compares the selected semantics with the manifest, verifies the fixture source fingerprint, re-renders every committed compiler SVG and requires byte-for-byte equality with both the committed file and its frozen hash.

The repository `npm test` chain runs this gate as `test:ch00`.

There is no pre-existing global compiler/schema version in the current implementation. CH-00 therefore does not invent one. `manifestVersion: CH00-1`, fixture identity and the existing calculation method version provide the explicit identities that actually exist at this gate. A future schema/compiler version may be introduced only when the runtime has a real versioned contract to identify.

## Actual runtime / compilation map

The current architecture is not the simple programme-history folder tree, nor yet the candidate final runtime.

```text
units ───────────────────────────────────────────────┐
                                                     │
p0/model.Box2D + p0/geometry ─→ plan-slice ─────────┼──────────────┐
             │                         │              │              │
             └─────────────────────────┼→ structure-slice           │
                                       │       │                     │
Reference House source                 │       │                     │
  ├→ reference-house/plan-adapter ─────┘       │                     │
  ├→ reference-house/compile ─→ plan-slice     │                     │
  │                                            │                     │
  └→ RH-C2 wrapper ────────────────────────────┘                     │
       ├→ reference-house/compile ─→ plan-slice                      │
       ├→ plan-adapter ─→ plan-slice  [second plan compile]          │
       └→ rhc2 fixture/adaptation ─→ structure-slice                 │
                                                                    │
RH-C3 wrapper ─→ RH-C2 ─→ rhc3 fixture ─→ service-slice(plan,structure)
                                      └→ rhc3 hardening/coordination
                                                                    │
RH-C4 wrapper ─→ RH-C3 ─→ rhc4 fixture ─→ boundary-slice(plan,services)
                                      └→ rhc4 hardening/coordination
                                                                    │
RH-C5 wrapper ─→ RH-C4 ─→ rhc5 input adapter ─→ calculation-slice

compiled domain results ─→ drawing/render modules ─→ committed SVG artefacts
```

For one canonical RH-C5 call today:

- the RH-C5 wrapper calls RH-C4;
- RH-C4 calls RH-C3;
- RH-C3 calls RH-C2;
- RH-C2 calls `compileReferenceHouse(source)`, which adapts and compiles the plan;
- RH-C2 then adapts and compiles the same plan source a second time for the generic plan result;
- structure, services, boundary and calculation each compile once.

So the programme's “nested historical path” hypothesis is confirmed, and the duplication is concrete: the plan slice is compiled twice on every RH-C2-or-later canonical path.

## Repeated cross-cutting conventions

The audit confirms repeated implementations of:

- diagnostic construction;
- diagnostic ordering;
- status aggregation;
- duplicate-ID detection;
- numeric tolerance policy;
- wrapper-level status propagation;
- source/result copying and ordering conventions;
- artefact generation failure policy.

These are observations, not a CH-00 extraction list. Later gates should consolidate only concepts proven to be semantically identical.

Numeric tolerance is already inconsistent rather than merely duplicated: `p0/geometry.ts` uses `1e-9`, while plan, structure, RH-C3 hardening and RH-C4 hardening use `1e-6`. CH-04 must therefore define tolerance by operation class rather than blindly replace every constant with one global value.

## Module classification

Classification is by responsibility, not by directory name. Several historical folders contain live runtime concepts today.

| Class | Current modules / responsibilities | CH-00 conclusion |
| --- | --- | --- |
| Permanent runtime concepts | `units.ts`; shared `Box2D`/geometry currently under `p0`; `plan-slice`; `structure-slice`; `service-slice`; `boundary-slice`; `calculation-slice` | Concepts are durable. Names/locations are not frozen. `p0` cannot simply be treated as dead history because plan/structure import its geometry. |
| Reference House source, adapters and coordination | `reference-house` source/model/plan adapter/compiler; RH-C2 structural fixture adapter; RH-C3 authority/fixture/hardening; RH-C4 fixture/hardening; RH-C5 method input adapter and stage wrappers | These encode fixture authority or cross-domain RH coordination. Some current wrappers also act as the production orchestration path; CH-02/03 must separate role from historical stage name without changing semantics. |
| Historical gates / regression fixtures | P0 compiler/evidence/obligation tests; PAT-XW-01 crosswalk gate; CF-01; RH-C1…RH-C5 gate tests, proof records and stage identities | Preserve as regression evidence even if runtime orchestration later moves elsewhere. CF-01 remains specifically authoritative against Reference-House-shaped generic code. |
| Rendering / publication | domain drawing renderers; RH-C1 drawings renderer; `generate.ts` scripts; committed `docs/reference-house/*.svg`; publication tooling | Downstream projections only. Rendering must not become an architectural source of truth. |

## Audit verdicts and programme amendments

All major pre-handoff observations were verified, with these qualifications:

1. **Research-stage names do double duty today.** In particular, RH-C2…RH-C5 wrappers are both historical gates and the live canonical orchestration chain. `p0` is also mixed: its original compiler is historical, while `Box2D` and geometry helpers are live shared dependencies.
2. **Duplicate upstream compilation is definite.** RH-C2 compiles the plan once inside `compileReferenceHouse` and a second time directly through `compilePlanSlice`.
3. **The fail-closed defect is strongest and directly demonstrated in plan and structure.** Both collect source diagnostics and then unconditionally enter derivation helpers that throw on missing references. Service and boundary also derive before complete validation, but their current derive helpers do not expose the same explicit missing-reference throw pattern. CH-01 should preserve this distinction rather than overstate one common failure mode.
4. **Cross-cutting conventions really are repeated.** Their implementations are similar but not automatically identical; tolerance policy already differs.
5. **Branded units are lost at shared geometry boundaries.** `Millimetres`/`SquareMillimetres` exist, while `p0` `Box2D` stores naked `number` coordinates and dimensions.
6. **Cross-domain semantic IDs are mostly interchangeable strings.** Plan, structural, service and boundary references can satisfy one another structurally when their string shapes match.
7. **Immutability is conventional.** Most source/result interfaces expose mutable objects/arrays; selected calculation records are readonly. RH-C3 hardening explicitly clones and then mutates a compiled service-derived result to add coordination meaning.
8. **Provenance richness drops downstream.** Reference House `SourceFact` carries authority/authorship/disposition/precision, while generic downstream slice sources mostly retain semantic IDs plus `provisional`.
9. **C3/C4 `hardening.ts` contains genuine coordination knowledge.** C3 includes service/structure/architectural crossing coordination; C4 includes Reference-House-specific enclosure/drainage coordination and occurrence knowledge. CH-02/03 should assign this deliberately rather than move it mechanically into a generic domain.
10. **Generation policy is inconsistent.** C1/C2 require PASS to generate; C3 rejects only a failed service result and therefore permits REVIEW; C4 rejects only aggregate FAIL and therefore also permits REVIEW. Filesystem conventions differ as well.
11. **The candidate `core → plan → structure → services → envelope → calculation` architecture is directionally supported, not literally the current import graph.** The generic calculation slice is independent; RH-C5 orchestration makes calculation downstream of C4. The current generic enclosure module is named `boundary-slice` and also carries drainage-transition semantics. Renaming it to `envelope` is not authorised by CH-00.

No audited observation requires a semantic change to the Reference House.

## Semantic-preservation invariants for CH-01 onward

Later CH work must keep the manifest green unless a reviewed semantic-change record explicitly says otherwise. In addition to the programme-wide invariants:

1. `createReferenceHouseSource()` remains the architectural source authority; adapter/refactor code may not manufacture absent facts.
2. Canonical statuses frozen in the CH-00 manifest must not become more permissive through refactor.
3. RH-C2/3/4/5 proof-boundary objects must remain byte-for-byte semantically equivalent unless separately reviewed.
4. The canonical diagnostic-code sets must remain stable; new canonical warnings/reviews are semantic changes, not cleanup.
5. The frozen high-value derived values/counts must remain equal within their existing represented semantics. No rounding/tolerance change may mask a different result.
6. The six committed RH-C1…RH-C4 SVGs must remain exact downstream projections of the compiled model. A deliberate drawing change is separately reviewable and requires an explicit baseline update.
7. The canonical Reference House source fingerprint may change only when the source record itself is intentionally changed or deliberately relocated/re-encoded with an explicit baseline review.
8. CF-01 must remain green. Generic compilers may not gain Reference House fixture-ID branching or other fixture-shaped special cases.
9. Calculation `UNSUPPORTED` must continue to dominate incomplete method evidence; PASS/FAIL/REVIEW/UNSUPPORTED meanings may not silently collapse into a simpler status system.
10. M3 and the closed RH-C0…RH-C5 capability boundary remain unchanged by hardening.

## What CH-00 does not fix

CH-00 intentionally leaves the following implementation issues in place for later gates:

- throwing derivation paths after fatal source-integrity diagnostics;
- duplicate plan compilation and nested `c4.c3.c2` result archaeology;
- duplicated diagnostics/status helpers;
- tolerance fragmentation;
- naked-number shared geometry;
- plain-string cross-domain identifiers;
- conventional mutability;
- thin downstream provenance;
- RH-C3/RH-C4 post-compile hardening placement;
- inconsistent generation policy.

Changing those here would weaken the baseline by mixing the measurement instrument with the refactor it is meant to police.

## Gate boundary

CH-00 passes only when the new baseline gate, all pre-existing repository tests, publication validation/builds and docs build are green on the merge candidate. CI/run evidence belongs in the PR/issue execution record so this file does not need to churn merely to record run IDs.

CH-00 handed the next implementation work to CH-01. Both gates are complete; their separate execution records retain the original scope and evidence.
