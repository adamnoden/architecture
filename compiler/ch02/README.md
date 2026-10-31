# CH-02 — permanent runtime architecture

**Gate:** CH-02  
**Baseline:** CH-01 merge `5c6c2f2ca541002520757e1e49006067a0b1a76f`  
**Computational maturity:** M3  
**Reference House capability sequence:** closed at RH-C5; no RH-C6 authorised

CH-02 clarifies stable compiler-module ownership. It does not flatten the Reference House stage chain, remove duplicate compilation or add architectural/technical capability.

## Audit conclusion

The candidate programme diagram `core → plan → structure → services → envelope/boundary → calculation` is useful as a conceptual ordering, but it is not the correct generic import graph.

The current generic domains already have a defensible shape. The material historical coupling was narrower: `plan-slice` and `structure-slice` imported shared `Box2D` and geometry algorithms from the historical `p0` gate. That made a research-stage module an accidental permanent runtime dependency.

CH-02 removes that coupling and records the actual permanent graph:

```text
core/geometry ─→ plan ─→ structure ─→ services ─→ boundary
                  ↑          ↑           ↑
                units      units       units

calculation
  (generic method/check kernel; independent of the topology domains)
```

More precisely:

- `core` owns domain-neutral geometry primitives/operations;
- `units.ts` remains a domain-neutral primitive at compiler root for now;
- `plan-slice` may depend on `core` and units;
- `structure-slice` may depend on `core`, plan and units;
- `service-slice` may depend on plan, structure and units;
- `boundary-slice` may depend on plan and services;
- `calculation-slice` is generic and independent of those topology domains;
- Reference House orchestration may compose all of them outside the generic layers.

The calculation slice is intentionally **not** made to import boundary merely to make the diagram linear. RH-C5 is downstream of RH-C4 because the Reference House adapter/orchestration chooses that sequence; the generic calculation kernel itself has no architectural reason to know about the enclosure topology.

## Core geometry extraction

`compiler/core/geometry.ts` now owns `Box2D` for the permanent plan/structure runtime plus the shared box algorithms previously implemented under P0.

`compiler/p0/geometry.ts` remains as a small compatibility adapter for the historical P0 gate. P0 keeps its own historical source-model type surface, but delegates the reusable geometry operations to `core`. This preserves the P0 gate without making generic production domains depend on its name or chronology.

No numeric policy was changed: the extracted geometry retains the existing `1e-9` tolerance exactly. The separate `1e-6` plan/structure tolerances remain untouched for CH-04 to classify by operation rather than being centralised accidentally here.

## Mechanical boundary

`compiler/ch02/architecture.test.ts` scans the **runtime logic** of the permanent domains and enforces the allowed dependency DAG. A generic runtime module fails the gate if it imports a historical gate, CH programme module, Reference House module, later generic domain or other unclassified compiler module.

Rendering is intentionally excluded from that runtime import/fixture-token scan. Domain `drawing.ts` files are classified separately as downstream projections and may carry stage-specific presentation text without becoming source or compiler authority. The gate still checks the plan/structure runtime directly for any dependency back into P0.

The same runtime gate scans generic compiler logic for Reference House fixture tokens. This is deliberately simple: it protects the architectural boundary actually at risk without adding a dependency-analysis package or framework.

## Module classification after CH-02

| Class | Modules / responsibilities | Decision |
| --- | --- | --- |
| Permanent generic runtime | `core/geometry.ts`, `units.ts`, runtime logic in `plan-slice`, `structure-slice`, `service-slice`, `boundary-slice`, `calculation-slice` | Dependency direction is now explicit and machine checked. Existing `-slice` names are retained because they describe bounded domains rather than research chronology. |
| Reference House source/adapters/coordination | `reference-house/*`; RH-C2 structural adapter/fixture; RH-C3 authority/fixture/hardening; RH-C4 fixture/hardening; RH-C5 calculation input/method adapter | Remain outside generic domains. C3/C4 hardening is classified as Reference House coordination knowledge, not generic service/boundary logic. |
| Historical gates/regression fixtures | P0 compiler/source/evidence/obligation gate, PAT-XW-01, CF-01, RH-C1…RH-C5 tests/proof identities, CH gates | Retained for provenance and regression. P0 geometry path is now only a compatibility adapter over permanent core geometry. |
| Rendering/publication | domain `drawing.ts` modules, Reference House drawings/generators, committed SVGs, publication tooling | Remain downstream projections; no source authority moves here. |

## Deliberate non-moves

CH-02 does **not** move RH-C2…RH-C5 wrappers or C3/C4 hardening files merely to make the folder tree resemble a hypothetical end state. Those stage-named modules still participate in the historically nested canonical orchestration. Moving individual pieces before CH-03 would increase churn while leaving the real orchestration problem intact.

CH-02 also does not:

- rename `plan-slice`, `structure-slice`, `service-slice`, `boundary-slice` or `calculation-slice`;
- rename boundary to envelope;
- move `units.ts` simply for visual symmetry, especially while CH-04 still owns unit-representation hardening;
- flatten `c4.c3.c2...` result archaeology;
- eliminate the duplicate plan compile;
- centralise diagnostic/status/tolerance helpers;
- change IDs, units, provenance or immutability semantics;
- change generation policy;
- increase computational maturity;
- add any Reference House capability or physical/regulatory claim.

## Preservation contract

CH-00 remains the semantic/artefact authority and CH-01 remains the fail-closed contract. CH-02 passes only if:

- the CH-00 manifest and all frozen SVG identities remain exact;
- CH-01 malformed-input behaviour remains green;
- CF-01 remains green;
- the historical P0 and RH-C gates remain green;
- no canonical status, diagnostic set, proof boundary or selected derived value changes;
- M3 remains unchanged and no RH-C6 appears.

## Historical handoff

CH-02 handed removal of nested stage orchestration and duplicate plan compilation to [CH-03 — single-pass Reference House compiler](../ch03/README.md). That work and the [CH programme](../../docs/computational/compiler-hardening-programme.md) are complete.
