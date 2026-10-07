# Pattern Language Overhaul — Phase 8 Computational Crosswalk Plan

**Status:** **COMPLETE — P8.0 through P8.5 PASS**  
**Starting point:** Phase 7 closed on `main@d48ef1eb5fc7507b68622bd9ea66277115e374ac`  
**Purpose:** connect the canonical architectural pattern language to the existing semantic / obligation / evidence model without turning patterns into compiler rules or creating a parallel ontology.  
**Gate review:** [`pattern-language-phase8-review.md`](pattern-language-phase8-review.md)

This is the durable Phase-8 control record. The research question is now closed enough that future work should implement/test the result rather than extend the crosswalk on paper.

---

# 1. Final Phase-8 proposition

The pattern language sits above the computational architecture as an architectural authoring/provenance layer:

```text
SELECTED ARCHITECTURAL INTENT
        ↓
project requirement / provenance
        ↓
ordinary source-model entities + relationships
        ↓
SHARED DERIVED GRAPHS
        ↓
CANONICAL OBLIGATIONS
        ↓
EVIDENCE / DETERMINATION
        ↓
VALIDITY + DIAGNOSTICS
```

A pattern label is never proof.

---

# 2. Locked findings

## F1 — no pattern ontology

Do not rebase the compiler around pattern objects. No active pattern, strategy or held candidate exposed a need for a second semantic building model.

## F2 — pattern provenance may create project requirements

A selected pattern can explain why a project architectural requirement exists and can group a useful crosswalk report.

The source building facts still live in the ordinary semantic model.

## F3 — technical obligations remain graph-derived

Structure, fire, water, acoustics, ventilation, maintenance and other technical obligations derive from actual composed building relationships.

Do not generate duplicate technical checklists once per pattern.

## F4 — no whole-pattern machine Boolean

Do not create a universal `HSA-P-xxx = PASS` result.

A crosswalk report may contain:

- formal project commitments: resolved / failed / unresolved;
- induced technical obligations with their own statuses/authorities;
- diagnostics;
- explicit human architectural judgement.

## F5 — pattern evidence is not occurrence evidence

Pattern publication maturity/evidence never proves a project occurrence or implementation.

## F6 — computational representability does not imply architectural promotion

All three strategies and four held candidates are representable. They remain strategies/candidates because their architectural/physical admission questions are independent.

## F7 — P0 kernel scope remains unchanged

Pattern-crosswalk machinery is not a prerequisite for the minimal executable compiler kernel.

Build P0 first.

---

# 3. Completed phase sequence

## P8.0 — model alignment — **PASS**

Reviewed the stable pattern language against:

- Formal Architectural Model;
- Validity and Obligations;
- Evidence and Provenance;
- Compiler Targets;
- interface obligation bundles;
- current programme-control documents.

Result: existing semantic architecture is the correct substrate.

## P8.1 — service-topology pilot — **PASS**

Crosswalked current Reference House occurrences for:

- `P-001` Controlled Utility Entry;
- `P-002` Plant Room as Service Hub;
- `P-003` Coherent Horizontal Service Route;
- `P-004` High-Service-Room Service Wall;
- `P-005` Designed Structural Penetration;
- `P-012` Physical Service Index;
- `P-014` Accessible Vertical Service Zone.

Canonical record: [`../computational/pattern-crosswalk-service-topology-pilot.md`](../computational/pattern-crosswalk-service-topology-pilot.md).

## P8.2 — pilot red-team — **PASS WITH CORRECTIONS**

Main correction: pattern conformance is not a new universal validity dimension. The machine-checkable subset is reported alongside technical obligation state and retained human judgement.

Also decided:

- no required `PatternIntent` core entity;
- no new P0 scope;
- `P-012` may later justify a generic physical-information `identifies` relation, but no foundational-model edit is warranted yet.

Canonical review: [`pattern-language-phase8-pilot-review.md`](pattern-language-phase8-pilot-review.md).

## P8.3 — remaining active patterns — **PASS**

Crosswalked all remaining active identities:

`P-007..011`, `P-013`, `P-015..022`.

No pattern forced a new fundamental graph or subsystem.

Canonical record: [`../computational/pattern-crosswalk-remaining-active.md`](../computational/pattern-crosswalk-remaining-active.md).

## P8.4 — strategies and held candidates — **PASS**

Audited:

**Strategies**

- Fail-Safe Water Distribution;
- Decompose Structural Interface Functions;
- Separate Structural Floor from Changeable Layers Where Proportionate.

**Held candidates**

- Replaceable Architectural Lining;
- Individually Isolatable Manifold Distribution;
- Local Deep Service Zone;
- Selective Floor Access.

All are representable without promotion or new fundamental semantics.

Canonical record: [`../computational/pattern-crosswalk-strategies-candidates.md`](../computational/pattern-crosswalk-strategies-candidates.md).

## P8.5 — implementation handoff — **PASS**

Produced the bounded implementation sequence and mutation suite.

Canonical record: [`../computational/pattern-crosswalk-implementation-handoff.md`](../computational/pattern-crosswalk-implementation-handoff.md).

Programme effect is recorded in [`../computational/research-programme-v06.md`](../computational/research-programme-v06.md).

---

# 4. Crosswalk schema

The frozen schema for future pattern additions/changes is:

1. architectural invariant;
2. computational coverage state;
3. project-requirement / provenance role;
4. source semantic commitments (`S`);
5. genuinely deterministic project commitments;
6. induced technical obligations (`O`) referenced to shared graph machinery;
7. evidence/resolution methods;
8. diagnostics (`D`);
9. retained human judgement (`J`);
10. anti-formalisation warning;
11. mutation/fixture;
12. implementation timing.

Use this only where useful. Do not turn ordinary pattern editing into compulsory metadata bureaucracy.

---

# 5. Small semantic refinements in view

Only two generic refinements remain relevant:

1. `AccessMethod` + approach/support/setup/work/withdrawal roles for exterior maintenance — already authorised independently by Research Programme v0.5;
2. possible generic physical-information `identifies` / `refers-to` relationship for `P-012`, to be added only if implementation proves existing generic relationships insufficient.

Neither is a pattern-specific ontology.

---

# 6. Implementation handoff

## P0 — first

Implement the already-authorised minimal semantic/compiler kernel. Do not add pattern machinery to the success gate.

## `PAT-XW-01` — first post-P0 crosswalk fixture

Primary scope:

- `P-003` Coherent Horizontal Service Route;
- `P-005` Designed Structural Penetration;
- optional `P-012` Physical Service Index extension.

Required proof includes:

- architectural project-intent failure can coexist with technical PASS;
- technical evidence failure can coexist with resolved formal pattern commitments;
- dependency invalidation remains local;
- human judgement remains explicit;
- pattern provenance does not require invasive schema expansion.

Later extension fixture map is recorded in the implementation handoff and Research Programme v0.6.

---

# 7. Stop rules after Phase 8

Do not reopen the crosswalk merely to produce more prose.

Reopen only if implementation, professional review, physical prototype work or a genuinely new architectural pattern demonstrates one of:

- the existing semantic model cannot represent an important consequence;
- authority cannot remain separated cleanly;
- source facts must be duplicated to support pattern provenance;
- a new generic relationship is proven necessary by an executable failure.

If a pattern needs custom compiler code merely to preserve its label, simplify the crosswalk.

---

# 8. Resume protocol after chat/context loss

Read:

1. root `README.md`;
2. `STATUS.md`;
3. [`pattern-language-phase7-review.md`](pattern-language-phase7-review.md);
4. [`pattern-language-phase8-review.md`](pattern-language-phase8-review.md);
5. [`../computational/research-programme-v06.md`](../computational/research-programme-v06.md);
6. [`../computational/pattern-crosswalk-implementation-handoff.md`](../computational/pattern-crosswalk-implementation-handoff.md);
7. the core computational model documents as required.

Then proceed with **P0 implementation / external review / physical validation**, not another paper crosswalk expansion.