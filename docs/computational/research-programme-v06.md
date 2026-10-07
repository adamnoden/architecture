# Executable Architecture — Research Programme v0.6

**Status:** current programme-control delta — post pattern-language crosswalk  
**Date:** 2026-10-07  
**Inherits:** [v0.5](research-programme-v05.md) and all prior stop rules / open TODOs unless explicitly superseded here  
**Paper phase:** frozen  
**Implementation:** minimal P0 falsification kernel remains first; pattern crosswalk begins only after P0 succeeds

---

## 1. Why v0.6 exists

Phase 7 converted HSA's architectural pattern catalogue into a canonical evidence-qualified pattern language. Phase 8 then audited the entire active language, all canonical strategies and all held candidates against the computational model.

The question was whether this new architectural layer exposed a missing compiler abstraction or required patterns to become computational primitives.

It did not.

---

## 2. Phase-8 result

**SEMANTIC ARCHITECTURE: PASS.**

All 21 active patterns can express their machine-readable consequences through the existing source semantic model, shared derived graphs, obligations and evidence system.

No new fundamental graph or pattern-specific compiler subsystem is justified.

The pattern language therefore remains an **architectural authoring/provenance layer above the compiler model**, not the compiler ontology itself.

The critical implementation distinction is:

- pattern-derived project requirements test the deterministic subset of selected architectural intent;
- actual building relationships generate technical obligations through their normal structural/boundary/service/maintenance graphs;
- non-formalisable architectural judgement remains human.

No new whole-pattern PASS/FAIL validity dimension is added.

---

## 3. P0 kernel remains unchanged

The first executable milestone still implements only enough to falsify:

- stable identity;
- typed relationships;
- deterministic source/geometry well-formedness;
- obligation derivation;
- status separation;
- evidence scope;
- selective invalidation;
- diagnostics;
- unsupported-domain behaviour;
- reproducibility.

**Pattern provenance is not a P0 prerequisite.**

Do not add `Pattern`, `PatternIntent`, pattern rule packs or a pattern graph to the kernel simply because Phase 8 exists.

---

## 4. First post-P0 crosswalk fixture

After P0 passes, run:

**`PAT-XW-01 — Pattern Provenance / Crosswalk Fixture`**

Primary patterns:

- `HSA-P-005 — Designed Structural Penetration`;
- `HSA-P-003 — Coherent Horizontal Service Route`;
- optional second-stage `HSA-P-012 — Physical Service Index`.

Required mutations:

- route crosses boundary without owned transition;
- penetration exists but one technical evidence item is absent;
- technically valid branch departs from selected HSA route geography;
- boundary role changes and selectively invalidates evidence;
- optional physical identifier becomes stale after semantic identity change.

The fixture must demonstrate that architectural project-intent status and technical/evidence status can diverge without authority leakage.

Canonical handoff: [Pattern Crosswalk — Implementation Handoff](pattern-crosswalk-implementation-handoff.md).

---

## 5. Authorised bounded refinements

Phase 8 adds no required P0 schema.

Post-P0 refinements are authorised only if implementation demonstrates the need:

1. project-requirement provenance reference to an `HSA-P-xxx` identity;
2. report grouping that gathers relevant project commitments and induced technical obligations under one architectural pattern scope;
3. generic physical-information `identifies` / `refers-to` semantics if `P-012` cannot be expressed cleanly otherwise.

Previously authorised v0.5 refinements remain:

- `AccessMethod` or equivalent maintenance-process concept;
- approach/support/setup/work/withdrawal path/zone roles;
- third-party/highway access dependency;
- landscape/as-built maintenance scenario dependencies.

---

## 6. Extension fixture map

After `PAT-XW-01`, prioritise evidence-rich extensions rather than generic pattern automation.

| Fixture | Architectural coverage | Existing programme relation |
|---|---|---|
| `EXT-MAINT-01` | `P-011` Roof Maintenance Route + `P-013` Ground-Supported Façade Access | inherited from v0.5 |
| `RAIN-XW-01` | `P-009` Accessible Rainwater Route | can discharge/extend `C-043` |
| `KEX-XW-01` | `P-010` Source-Capture Kitchen Extract | can discharge/extend `C-044` |
| `WATER-XW-01` | Fail-Safe Water Distribution + `P-017` + `P-018` | post-kernel water-failure test |
| `ROOM-XW-01` | `P-015` Accessible Room Service Route + `P-016` Compartmented Service Void | service/boundary composition |
| `OPEN-XW-01` | `P-007`, `P-008`, `P-019`, `P-020` | interface / replacement / prototype-linked |
| `ATTACH-XW-01` | `P-022` + Replaceable Architectural Lining candidate | pair with W2 physical wall-bay evidence |

Do not implement all fixtures merely because they are listed. Select the next one from the uncertainty that remains after P0 / external review / physical prototype work.

---

## 7. Grand TODO additions

| ID | TODO | Status |
|---|---|---|
| `C-050` | Full canonical pattern → computational crosswalk | **COMPLETE — Phase 8** |
| `C-051` | `PAT-XW-01` post-P0 executable crosswalk fixture | **OPEN — blocked by P0 success gate** |
| `C-052` | Test generic physical identity/reference relation with `P-012` | **OPEN — optional post-P0 refinement** |
| `C-053` | Crosswalk report grouping without new validity dimension | **OPEN — deliver with `PAT-XW-01` if useful** |
| `C-054` | Link W2 physical prototype evidence to `P-022` / lining crosswalk | **OPEN — physical programme dependency** |

All unresolved TODOs from earlier programme versions remain inherited.

---

## 8. Important negative findings

### No pattern ontology

The project does not need a second semantic building model composed of HSA patterns.

### No pattern rule pack

Technical obligations should not be generated independently by every pattern. They derive once from composed shared graphs.

### No whole-pattern Boolean

A pattern may have:

- resolved formal commitments;
- unresolved technical obligations;
- external evidence requirements;
- open architectural judgement.

Flattening that to `PASS` would destroy useful distinctions.

### No evidence laundering

`evidence: established` on a pattern page does not prove a project occurrence or its implementation.

### No P0 expansion

The crosswalk is not permission to delay the first executable test with more abstractions.

---

## 9. Current development sequence

1. **Major paper expansion remains frozen.**
2. Obtain competent external attack of H1 using the existing review pack.
3. Build the minimal P0 semantic/compiler kernel.
4. Run P0 mutation/evidence/invalidation gate.
5. If P0 passes, run `PAT-XW-01`.
6. Run the highest-value extension fixture selected from evidence/uncertainty, not from pattern count.
7. Continue physical prototype programme in parallel.
8. Reassess whether heavier CAD/solver/product architecture has been earned.

---

## 10. Kill / weakening conditions added by Phase 8

Weaken the crosswalk or remove it from implementation if:

- pattern provenance requires invasive schema changes;
- source building facts are duplicated inside pattern records;
- architectural project requirements and technical obligations cannot stay separate;
- reports need arbitrary aesthetic thresholds to look complete;
- every new pattern requires custom compiler code;
- crosswalk metadata becomes specialist clerical work with little design feedback;
- whole-pattern status encourages false claims of architectural proof.

The correct outcome may be a very thin provenance/reporting layer. That is acceptable.

---

## 11. Canonical Phase-8 records

- [Architectural Pattern → Computational Crosswalk](pattern-crosswalk-model.md)
- [Service-Topology Pattern Crosswalk — Pilot 01](pattern-crosswalk-service-topology-pilot.md)
- [P8.2 Pilot Red-Team Review](../development/pattern-language-phase8-pilot-review.md)
- [Remaining Active Pattern Crosswalk](pattern-crosswalk-remaining-active.md)
- [Strategies and Held Candidates Audit](pattern-crosswalk-strategies-candidates.md)
- [Implementation Handoff](pattern-crosswalk-implementation-handoff.md)

The pattern language itself remains canonical under `docs/patterns/`; these documents only describe its computational projection.