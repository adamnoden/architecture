# Pattern Language Phase 8 — Pilot Red-Team Review

**Status:** P8.2 complete — **PASS WITH CORRECTIONS**  
**Scope:** [Service-Topology Pattern Crosswalk — Pilot 01](../computational/pattern-crosswalk-service-topology-pilot.md)  
**Authority:** [Phase 8 Plan](pattern-language-phase8-plan.md)

---

# 1. Decision

**Advance to P8.3.**

The pilot demonstrates useful computational consequences without requiring a parallel pattern ontology.

However, the review makes one important correction:

> **Do not create “pattern conformance” as a new universal validity dimension or one Boolean result.**

A selected pattern may create project requirements whose formal subset can be checked. The resulting technical obligations compile through the normal validity model. Architectural remainder may require explicit human determination.

Phase 8 therefore produces a **crosswalk report**, not a new compiler truth layer.

---

# 2. Attack A — pattern-selection magic

## Risk

The working model allowed a lightweight `PatternIntent` concept as an illustration. Implemented carelessly, this could become a god-object:

```text
pattern = HSA-P-003
conforms = true
```

with source facts hidden behind it.

## Correction

`PatternIntent` is **not a required core entity** and is not part of the minimal P0 kernel.

The first implementation should reuse existing `Requirement`, project configuration, provenance and stable-reference machinery. A pattern reference may annotate a project requirement or report:

```text
PROJECT REQUIREMENT PR-17
source/provenance: HSA-P-003
scope: route set SR-01
requires: explicit route/branch topology + declared maintenance nodes
```

If a later UI benefits from a first-class pattern-selection record, that can remain an authoring convenience above the compiler source.

**Finding:** no new pattern-selection primitive is justified by the pilot.

---

# 3. Attack B — false whole-pattern PASS

## Risk

`P-002`, `P-003`, `P-004` and `P-014` contain qualitative propositions such as proportionality, domestic character and spatial quality. A formal subset could pass while the architecture remains bad.

## Correction

Do not report:

```text
HSA-P-003 = PASS
```

without qualification.

Prefer:

```text
HSA-P-003 crosswalk report
  formal commitments       RESOLVED
  induced technical state  MIXED / see obligations
  architectural judgement  OPEN / ACCEPTED BY DESIGN AUTHORITY
```

Where project governance needs a final pattern acceptance, that is a recorded **architectural/project determination**, not compiler proof.

No new validity dimension is added to `validity-and-obligations.md`.

---

# 4. Attack C — duplicate technical obligations

## Risk

A pattern-specific crosswalk could generate a fire/acoustic/access checklist even though the same obligations already arise from service routes, boundaries, equipment and penetrations.

## Review result

The pilot correctly separates:

- **project requirements derived from selected pattern intent**;
- **technical obligations derived from composed building graphs**.

This separation is retained.

Implementation rule:

> A pattern crosswalk may contribute source relationships and architectural project requirements. Shared technical graphs remain the sole canonical generators of technical obligations.

`P-005` is the clearest test. Fire/weather/structural obligations belong to the penetration/boundary state, never to a `P-005` rule pack.

---

# 5. Attack D — hidden machine judgement

The following pilot propositions were too strong if interpreted as deterministic compiler rules.

## `P-002`

“the hub contains/concentrates more than nominal leftover equipment geography” is not a machine invariant.

**Correction:** machine checks declared hub membership, service relationships and maintenance/replacement geometry. Whether that constitutes a proportionate hub remains human judgement.

## `P-003`

“forms a coherent topology” cannot be proven from graph connectedness alone.

**Correction:** compiler checks explicit topology, route ownership, branches, hosts, crossings and declared exclusions. Route counts/lengths/crossings are diagnostics. Coherence/proportionality remain design judgement.

## `P-004`

Which components are “consequential enough” to deserve access is not inferred automatically.

**Correction:** the project/family declares maintenance/replacement tasks and access requirement. The compiler then tests the declared geometry.

## `P-014`

Whether a vertical zone “earns its area” remains human judgement. The compiler may report demand proximity, crossing counts, bypasses and clear envelope.

---

# 6. Attack E — `P-012` semantic refinement

## Question

Does Physical Service Index require a new semantic primitive?

## Result

**Not yet.**

The minimal requirement can probably be represented as:

- ordinary physical component / information artefact occurrence;
- stable identifier/value;
- generic provenance/reference relation to the semantic entity it identifies;
- inspection/change-control evidence.

The genuinely useful missing relation may be something equivalent to `identifies` / `refers-to`, but this is generic information semantics rather than a special `ServiceIndex` type.

### Decision

Reclassify the pilot result from **SMALL REFINEMENT REQUIRED** to:

**NATIVE + POSSIBLE GENERIC RELATION REFINEMENT**.

Do not edit the foundational model yet. Test this in implementation after P0 or when the first physical-record fixture is built.

---

# 7. Attack F — minimal-kernel scope

The current implementation programme deliberately keeps P0 small:

- stable identity;
- typed relationships;
- crude geometry/well-formedness;
- obligation derivation;
- evidence scope;
- invalidation;
- diagnostics;
- unsupported states.

Pattern crosswalk machinery should **not delay P0**.

## Staging decision

### P0 kernel

Implement existing semantic/compiler mechanism with one service route or penetration as already authorised.

Do not add a pattern subsystem.

### First post-kernel crosswalk fixture — `PAT-XW-01`

After P0 passes, exercise the Phase-8 mechanism using a compact subset of the pilot:

- `HSA-P-005` Designed Structural Penetration — strongest native case;
- `HSA-P-003` Coherent Horizontal Service Route — topology + diagnostics case;
- optionally `HSA-P-012` Physical Service Index — change/invalidation/information-resilience case.

This tests architectural provenance and crosswalk reporting without requiring whole-house geometry.

### Later extension fixtures

`P-001`, `P-002`, `P-004`, `P-014` fit naturally into S1/S2/H1-like or Reference House extension fixtures after the kernel is stable.

---

# 8. Attack G — coverage vocabulary

The original crosswalk states remain useful with one clarification:

- **NATIVE** means the current semantic architecture can express the formal consequences;
- it does **not** mean implemented, externally validated or architecturally proven.

The P8.3 records must state fixture/evidence status separately.

---

# 9. Frozen crosswalk schema after review

For the remainder of Phase 8, each pattern record should contain:

1. architectural invariant;
2. computational coverage state;
3. project-requirement / provenance role;
4. source semantic commitments (`S`);
5. formal project commitments where genuinely deterministic;
6. induced technical obligations (`O`) — referenced to shared graph machinery, not duplicated;
7. evidence/resolution methods;
8. diagnostics (`D`);
9. retained human judgement (`J`);
10. anti-formalisation warning;
11. mutation/fixture;
12. implementation timing: P0 / post-P0 / later extension / no implementation priority.

Do not add a whole-pattern Boolean.

---

# 10. P8.2 gate

| Question | Result |
|---|---|
| Does the pilot depend on a new pattern ontology? | **No** |
| Does it duplicate technical obligation generation? | **No, after explicit rule above** |
| Is architectural judgement kept visible? | **Yes, strengthened by this review** |
| Is any semantic refinement proven necessary? | **No** |
| Does Phase 8 need to expand P0 kernel scope? | **No** |
| Is the schema useful enough for the remaining language? | **Yes** |

## Decision

**P8.2 PASS WITH CORRECTIONS. P8.3 AUTHORISED.**

The remaining active patterns may now be crosswalked in thematic groups. Do not change the schema casually during that work; if a pattern genuinely does not fit, record the contradiction and reopen this gate.