# Executable Architecture — Research Programme v0.6

**Status:** current programme control — Phase 8, P0 and PAT-XW-01 complete  
**Date:** 2026-10-07  
**Inherits:** [v0.5](research-programme-v05.md) and all prior stop rules / open TODOs unless explicitly superseded here  
**Paper phase:** frozen  
**Generic implementation growth:** frozen after successful P0 + PAT-XW-01 falsification gates

---

## 1. Current programme position

Phase 7 established the canonical evidence-qualified pattern language. Phase 8 audited that language against the computational model and found no need for a pattern ontology or new fundamental semantic graph.

That conclusion has now survived executable testing.

- **P0 executable kernel: PASS**
- **PAT-XW-01 executable crosswalk: PASS**

Canonical executable result: [P0 + PAT-XW-01 — Executable Gate Result](p0-pat-xw-01-result.md).

The computational track should no longer expand by default. Its next work must be triggered by a concrete architectural, physical or professional-review uncertainty.

---

## 2. Phase-8 result — retained

**SEMANTIC ARCHITECTURE: PASS.**

All 21 active patterns can express their machine-readable consequences through the existing source semantic model, shared derived graphs, obligations and evidence system.

No new fundamental graph or pattern-specific compiler subsystem is justified.

The pattern language remains an **architectural authoring/provenance layer above the compiler model**, not the compiler ontology itself.

The critical distinction remains:

- pattern-derived project requirements test the deterministic subset of selected architectural intent;
- actual building relationships generate technical obligations through normal structural/boundary/service/maintenance graphs;
- non-formalisable architectural judgement remains human.

No whole-pattern PASS/FAIL validity dimension is authorised.

---

## 3. P0 executable gate — complete

P0 implemented only enough to falsify the core mechanism:

- stable identity;
- typed relationships;
- deterministic source/geometry well-formedness;
- obligation derivation;
- model / architectural / technical / evidence status separation;
- scoped evidence;
- selective invalidation;
- diagnostics;
- unsupported-domain behaviour;
- reproducibility.

The production CI gate passed:

- TypeScript typecheck;
- **17/17 P0 tests**;
- documentation build/navigation coverage;
- Pages artifact creation.

The executable result therefore supports the paper architecture at the deliberately narrow P0 scale. It does not establish whole-house technical adequacy.

No `Pattern`, `PatternIntent`, pattern rule pack or pattern graph was added to the kernel.

---

## 4. PAT-XW-01 executable gate — complete

`PAT-XW-01` exercised:

- `HSA-P-003 — Coherent Horizontal Service Route`;
- `HSA-P-005 — Designed Structural Penetration`.

The production CI gate passed:

- full P0 regression suite;
- **6/6 PAT-XW-01 tests**;
- documentation build.

The fixture demonstrated:

1. pattern provenance can sit on project requirements without becoming a building entity;
2. HSA project intent can fail while technical state remains unchanged;
3. formal `P-005` commitments can remain resolved while a technical obligation is `UNRESOLVED`;
4. changing a boundary role derives a new technical obligation without broadening unrelated evidence;
5. architectural judgement can remain `HUMAN_DETERMINATION` without fabricating a whole-pattern Boolean;
6. crosswalk output is deterministic for a frozen source.

This is the authority-separation result Phase 8 required.

---

## 5. P-012 remains deliberately deferred

The optional `HSA-P-012 — Physical Service Index` extension was not required to pass PAT-XW-01.

A future physical-information use case may justify generic `identifies` / `refers-to` semantics and correspondence/staleness behaviour. Do not add those abstractions merely to complete pattern coverage.

`C-052` remains open but deferred until physical information actually requires it.

---

## 6. Bounded refinements now demonstrated

Phase 8 authorised three possible post-P0 refinements. Current outcome:

1. **project-requirement provenance reference to `HSA-P-xxx`** — demonstrated by PAT-XW-01;
2. **crosswalk report grouping without a new validity dimension** — demonstrated by PAT-XW-01;
3. **generic physical-information identity/reference semantics** — not yet justified; deferred.

Previously authorised maintenance-process refinements remain available only when the external-maintenance fixture is actually selected:

- `AccessMethod` or equivalent maintenance-process concept;
- approach/support/setup/work/withdrawal path/zone roles;
- third-party/highway access dependency;
- landscape/as-built maintenance scenario dependencies.

---

## 7. Extension fixture map — not a queue

These are available experiments, not an implementation roadmap.

| Fixture | Architectural coverage | Trigger |
|---|---|---|
| `EXT-MAINT-01` | `P-011` Roof Maintenance Route + `P-013` Ground-Supported Façade Access | Reference House / maintenance-geometry uncertainty |
| `RAIN-XW-01` | `P-009` Accessible Rainwater Route | rainwater design exposes a formalisation question |
| `KEX-XW-01` | `P-010` Source-Capture Kitchen Extract | ventilation/extract review exposes a formalisation question |
| `WATER-XW-01` | Fail-Safe Water Distribution + `P-017` + `P-018` | physical/plumbing failure work needs machine support |
| `ROOM-XW-01` | `P-015` Accessible Room Service Route + `P-016` Compartmented Service Void | service/boundary coordination exposes a defect |
| `OPEN-XW-01` | `P-007`, `P-008`, `P-019`, `P-020` | opening/interface prototype or professional review requires it |
| `ATTACH-XW-01` | `P-022` + Replaceable Architectural Lining candidate | preferably after W2 physical wall-bay evidence |

**Do not implement these in sequence for coverage.** Select the next fixture from evidence and uncertainty.

---

## 8. Grand TODO delta

| ID | TODO | Status |
|---|---|---|
| `C-050` | Full canonical pattern → computational crosswalk | **COMPLETE — Phase 8** |
| `C-051` | `PAT-XW-01` post-P0 executable crosswalk fixture | **COMPLETE — PASS** |
| `C-052` | Test generic physical identity/reference relation with `P-012` | **DEFERRED — no current need** |
| `C-053` | Crosswalk report grouping without new validity dimension | **COMPLETE — PAT-XW-01** |
| `C-054` | Link W2 physical prototype evidence to `P-022` / lining crosswalk | **OPEN — physical programme dependency** |

All unresolved TODOs from earlier programme versions remain inherited unless superseded by evidence.

---

## 9. Important negative findings — now executable stop rules

### No pattern ontology

The project does not need a second semantic building model composed of HSA patterns.

### No pattern rule pack

Technical obligations derive once from composed shared graphs. They should not be regenerated independently by every pattern.

### No whole-pattern Boolean

A pattern/project occurrence may simultaneously have resolved formal commitments, unresolved technical obligations, external evidence requirements and open architectural judgement.

### No evidence laundering

Pattern evidence or project provenance does not prove a project occurrence or technical implementation.

### No generic compiler growth

P0 and PAT-XW-01 passed without heavier architecture. Do not use success as permission to build CAD, a general solver, a full regulations engine or pattern automation.

### No coverage-for-coverage's-sake

The remaining pattern inventory is not a software backlog.

---

## 10. Current development sequence

1. **Major paper/crosswalk expansion remains frozen.**
2. **P0 and PAT-XW-01 remain in CI as regression tests.**
3. Obtain competent external attack of H1 using the existing review pack.
4. Advance the physical prototype programme, beginning with the W2 wall-bay and structural floor-edge questions.
5. Continue whole-house Reference House architectural/structural/environmental coordination.
6. Select a targeted executable fixture only if one of those workstreams exposes a concrete, high-value computational question.
7. Feed negative and positive findings back into doctrine/patterns/manuscript only where warranted.
8. Reassess heavier CAD/solver/product architecture only after materially different evidence has accumulated.

---

## 11. Kill / weakening conditions

Weaken or remove the crosswalk layer if:

- provenance requires invasive schema changes;
- source building facts are duplicated inside pattern records;
- architectural project requirements and technical obligations cease to remain separate;
- reports need arbitrary aesthetic thresholds to look complete;
- every new pattern requires custom compiler code;
- crosswalk metadata becomes specialist clerical work with little design feedback;
- whole-pattern status encourages false claims of architectural proof.

The correct long-term outcome may remain a thin provenance/reporting layer. PAT-XW-01 provides evidence that this thin architecture is viable.

---

## 12. Canonical records

- [Architectural Pattern → Computational Crosswalk](pattern-crosswalk-model.md)
- [Service-Topology Pattern Crosswalk — Pilot 01](pattern-crosswalk-service-topology-pilot.md)
- [P8.2 Pilot Red-Team Review](../development/pattern-language-phase8-pilot-review.md)
- [Remaining Active Pattern Crosswalk](pattern-crosswalk-remaining-active.md)
- [Strategies and Held Candidates Audit](pattern-crosswalk-strategies-candidates.md)
- [Implementation Handoff](pattern-crosswalk-implementation-handoff.md)
- [P0 Implementation Plan](p0-implementation-plan.md)
- **[P0 + PAT-XW-01 — Executable Gate Result](p0-pat-xw-01-result.md)**

The pattern language itself remains canonical under `docs/patterns/`; these records describe only its computational projection and executable falsification.