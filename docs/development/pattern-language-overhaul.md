# Pattern Language Overhaul — Migration Control

**Status:** active migration programme; Phases 0–6 complete; Phase 7 P7.1–P7.3 complete; P7.4 next  
**Baseline:** `main@974d3bf25df2f9406262384e2b8b2197403be43b` before pattern-language work  
**Phase-5 checkpoint:** `eccf8ff5721942e1cba5e7e36eb6aaf19476f49e`  
**Phase-6 checkpoint:** `5eba14402b333836add71739395385a7686edf4e`  
**Phase-7 Core checkpoint:** `722e883c6b2e4c8f3bad4ae232ab5d73125943d3`  
**Purpose:** transform the existing pattern catalogue into an evidence-qualified pattern language and generative design process without losing doctrine, research provenance, Reference House work, prototype records or the computational evidence model.

This is the durable project-level control point for the migration. Detailed Phase-7 execution is tracked in [`pattern-language-phase7-plan.md`](pattern-language-phase7-plan.md).

---

## 1. Target architecture

```text
DOCTRINE
   ↓
STRATEGIES
   ↓
PATTERN LANGUAGE
   ↓
GENERATIVE SEQUENCES
   ↓
PROJECT / REFERENCE-HOUSE APPLICATION
   ├──────────────► IMPLEMENTATION FAMILIES
   └──────────────► FORMALISABLE CONSEQUENCES
                            ↓
                 SEMANTIC RULES / OBLIGATIONS
                            ↓
                         COMPILER
```

The architectural layer remains primary.

- a **pattern is not a compiler rule**;
- graph relationships are not generative sequence order;
- evidence maturity is independent from pattern identity;
- Christopher Alexander is a methodological precedent, not an authority whose individual claims are imported wholesale.

---

## 2. Canonical definitions

**Doctrine** — durable architectural proposition.  
**Strategy** — broad way of pursuing one or more principles; may admit several materially different patterns/implementations.  
**Pattern** — recurring architectural response to a recurring context and set of forces; specific enough to guide design, general enough to admit multiple implementations.  
**Pattern language** — connected set of patterns whose sparse relationships help designers combine them coherently across scales/domains.  
**Generative sequence** — ordered or partially ordered design moves in which each move establishes context for later work and may expose a reason to rewind an earlier decision.  
**Implementation family** — a concrete construction/system family that can realise a pattern or strategy.  
**Occurrence** — one project-specific use of a pattern or implementation family.  
**Rule / obligation** — proposition formal enough to be checked, calculated, evidenced or rejected.  
**Evidence** — research, precedent, calculation, prototype, observation or professional determination supporting a scoped claim.

Detailed authoring contract: [`../patterns/language-model.md`](../patterns/language-model.md).

---

## 3. Pattern admission test

A pattern should materially satisfy:

1. recurrence;
2. explicit context;
3. competing forces;
4. a meaningful spatial/physical/lifecycle/operational relationship;
5. multiple possible implementations;
6. diagrammability;
7. identifiable consequences/trade-offs/failure modes;
8. meaningful composition with other patterns;
9. honest evidence state.

Failure does not invalidate the idea; it normally means the idea belongs as strategy, implementation family, project decision, rule, evidence or research question instead.

---

## 4. Relationship vocabulary

Keep the graph sparse:

- **requires** — another pattern/condition normally needs resolution first for this pattern to make architectural sense;
- **completes** — commonly develops/localises another pattern;
- **alternative-to** — overlapping solutions normally chosen between;
- **tension-with** — known trade-off requiring explicit resolution.

Scale/domain are metadata. Chronology belongs in generative sequences, not fake graph dependencies.

---

## 5. Sequence rules

A sequence may contain:

- hard precedence;
- soft precedence;
- parallel work;
- rewind conditions.

The key discipline is to change an upstream architectural decision where downstream complexity is merely evidence of a bad earlier choice.

---

# 6. Programme state

| Phase | Scope | Status | Result / next gate |
|---|---|---|---|
| **0 — Baseline** | record recoverable starting point | **Complete** | baseline preserved |
| **1 — Metamodel** | distinguish doctrine / strategy / pattern / sequence / family / occurrence / rule / evidence | **Complete** | model survived adversarial examples |
| **2 — Pattern contract** | IDs, metadata, relations, evidence/maturity and page anatomy | **Complete** | deliberately small contract established |
| **3 — Pilot language** | six connected service-topology records | **Complete** | graph added useful compositional knowledge |
| **4 — Pilot sequence** | first service-topology generative sequence | **Complete** | ordering + rewind logic proved non-trivial |
| **5 — Reference House trial** | whole-house service-topology application | **Complete — PASS** | real occurrences, rewinds, missing pattern and taxonomy correction produced |
| **6 — Corpus audit** | classify Core 12, specialised patterns, candidates and old 30-slot inventory | **Complete — PASS** | controlled Phase-7 migration authorised |
| **7 — Canonical migration** | canonical pattern pages, strategies and candidate bench | **Active — P7.1–P7.3 complete** | P7.4 non-pattern homes next; then publication/Reference House reconciliation and validation tooling |
| **8 — Computational crosswalk** | map formal consequences to semantic relationships/obligations | **Blocked by Phase 7** | canonical/non-canonical corpus must stabilise first |
| **9 — Publication rearchitecture** | rebuild Part III around actual language + sequences | **Blocked by Phase 7** | publication must follow canonical corpus, not old outline |
| **10 — Site tooling** | generated indexes, reverse links, validation, later optional visualisation | **Lightweight tooling only during Phase 7** | no graph UI until language is stable |
| **11 — Validation** | ongoing prototype/professional/Reference House attack | **Continuous** | maturity earned independently from migration |

---

# 7. Durable artefacts

## Model + sequence

- [`../patterns/language-model.md`](../patterns/language-model.md)
- [`../patterns/service-topology-sequence.md`](../patterns/service-topology-sequence.md)
- [`../patterns/pilot/README.md`](../patterns/pilot/README.md) — migration provenance

## Reference House gates

- [`../reference-house/whole-house-coordination-fixture.md`](../reference-house/whole-house-coordination-fixture.md)
- [`../reference-house/service-topology-run-01.md`](../reference-house/service-topology-run-01.md)
- [`pattern-language-phase5-review.md`](pattern-language-phase5-review.md)

## Audit + migration control

- [`pattern-language-corpus-audit.md`](pattern-language-corpus-audit.md)
- [`../research/pattern-language-phase6-targeted-evidence.md`](../research/pattern-language-phase6-targeted-evidence.md)
- [`pattern-language-phase6-review.md`](pattern-language-phase6-review.md)
- [`pattern-language-phase7-plan.md`](pattern-language-phase7-plan.md)

---

# 8. Findings that must survive future edits

## F1 — graph and sequence are separate structures

Conceptual composition does not equal decision order. Do not encode sequence chronology as `requires` edges merely to reproduce a flow chart.

## F2 — rewind conditions are the main generative value

The Reference House run rejected:

- a universal deep mixed-services duct;
- scattered upper wet rooms;
- plant hidden in ordinary kitchen cabinetry;
- blanket leak containment everywhere.

The sequence changed the design instead of decorating it.

## F3 — pattern occurrence is distinct from selection and evidence

A project may select a pattern, instantiate it in one or more occurrences, and still owe technical evidence. The Reference House is never evidence for the pattern itself.

## F4 — existing identity should be preserved where meaning survives

- `HSA-P-001..005` survive;
- `HSA-P-003` keeps identity but becomes **Coherent Horizontal Service Route**;
- `HSA-P-006` is retired as a pattern and its durable content becomes water-failure strategy material;
- `HSA-P-007..012` survive.

Retired IDs are never reused.

## F5 — the old 30-slot publication inventory is not the language

Several slots were strategies, implementation families or undeveloped placeholders. Phase 6 reduced the target rather than preserving the count.

## F6 — implementation-shaped names were hiding stronger abstractions

- `service skirting` + `vertical joinery route` → **Accessible Room Service Route**;
- `Architectural Backplane` + `Fixing Infrastructure` → **Controlled Attachment Plane**;
- `Seated Floor Structure` → structural-interface decomposition strategy + implementation challengers;
- `Finish-Agnostic Floor Platform` → floor-layer strategy + experimental implementation;
- `functional cornice` → Reference House expression of other patterns, not its own pattern.

## F7 — evidence maturity remains independent

Admission gives stable language identity; it does not claim physical validation. Pattern pages retain evidence/maturity limits independently from taxonomy.

## F8 — canonical identity is now materially established

P7.1–P7.3 produced one canonical page for every active pattern identity and a visible retired record for `P-006`. The remaining Phase-7 problem is no longer pattern admission; it is clear ownership of strategies, held candidates, provenance and project occurrences.

---

# 9. Canonical identity state after P7.3

## Active patterns

- `HSA-P-001` Controlled Utility Entry
- `HSA-P-002` Plant Room as Service Hub
- `HSA-P-003` Coherent Horizontal Service Route
- `HSA-P-004` High-Service-Room Service Wall
- `HSA-P-005` Designed Structural Penetration
- `HSA-P-007` Permanent Opening / Replaceable Window
- `HSA-P-008` Movement / Slip Junction
- `HSA-P-009` Accessible Rainwater Route
- `HSA-P-010` Source-Capture Kitchen Extract
- `HSA-P-011` Roof Maintenance Route
- `HSA-P-012` Physical Service Index
- `HSA-P-013` Ground-Supported Façade Access
- `HSA-P-014` Accessible Vertical Service Zone
- `HSA-P-015` Accessible Room Service Route
- `HSA-P-016` Compartmented Service Void
- `HSA-P-017` Visible Leakage Path
- `HSA-P-018` Failure-Tolerant Wet Service Room
- `HSA-P-019` Permanent Opening / Replaceable Door
- `HSA-P-020` Designed Threshold
- `HSA-P-021` Source-Capture Bathroom Extract
- `HSA-P-022` Controlled Attachment Plane

## Retired identity

- `HSA-P-006` Water-Damage-Safe Service Route — permanently retired; never reused.

## Held candidates — no stable IDs

- Replaceable Architectural Lining
- Individually Isolatable Manifold Distribution
- Local Deep Service Zone
- Selective Floor Access / Selective Accessible Floor Zone

## Strategies, not patterns

- Fail-Safe Water Distribution — canonical page already exists;
- Decompose Structural Interface Functions — P7.4 destination required;
- Separate Structural Floor from Changeable Layers Where Proportionate — P7.4 destination required.

## Implementation families / expressions, not patterns

- service skirting;
- door-surround electrical route;
- undercroft service topology;
- pipe-in-pipe / withdrawable pipe;
- Seated Floor Structure;
- Finish-Agnostic Floor Platform;
- functional cornice;
- specific backplane rail/frame systems.

## Explicitly rejected old slot

- `Perimeter Dry Zone` — do not migrate as a canonical pattern; its bundled moisture/drainage/access functions are context-sensitive and partly conflict.

---

# 10. Phase-7 migration rules

Non-negotiable rules:

1. create replacement canonical pages before deleting/superseding aggregate prose;
2. assign stable IDs only to admitted patterns;
3. keep `HSA-P-006` visibly retired for provenance;
4. preserve source/research/prototype records rather than rewriting history;
5. keep held candidates visibly non-canonical;
6. keep strategies outside the pattern graph;
7. keep graph links sparse;
8. keep sequences separate;
9. update Reference House occurrences only after canonical identities exist;
10. no D3/graph visualisation during structural migration;
11. docs build/navigation must pass at every merge checkpoint;
12. if migration adds more bureaucracy than clarity, stop and simplify.

---

# 11. Rollback / preservation

- never rewrite `docs/source/house-design-doctrine-v7.md`;
- never rewrite frozen computational runs merely to match new terminology;
- never delete useful research/prototype evidence because classification changed;
- never promote an assembly merely because a pattern-shaped page could be written;
- Markdown remains the canonical content source; no parallel database/registry;
- keep migration commits/PRs small enough to reverse coherently.

---

# 12. Resume-from-here protocol

A future collaborator/chat should read, in order:

1. root `README.md`;
2. `STATUS.md`;
3. this file;
4. [`pattern-language-phase7-plan.md`](pattern-language-phase7-plan.md);
5. [`pattern-language-phase6-review.md`](pattern-language-phase6-review.md) when classification rationale is needed;
6. [`../patterns/language-model.md`](../patterns/language-model.md);
7. Phase-5 Reference House run only when worked architectural context is needed.

Then continue **P7.4**, not another taxonomy discussion, unless new evidence genuinely contradicts the Phase-6 decision.

When a phase crosses a gate, update this file and `STATUS.md` in the same work session.

---

# 13. Current next actions

1. complete P7.4 strategy homes for structural-interface decomposition and structural-floor/changeable-layer separation;
2. create/normalise explicit non-canonical homes for the four held candidates without assigning IDs;
3. preserve implementation/prototype source material and mark legacy aggregate pages as provenance rather than rewriting history;
4. run a P7.4 checkpoint before publication/Reference House reconciliation;
5. then execute P7.5: update Reference House occurrences and rebuild Part III around the canonical language;
6. only after corpus structure is stable, add P7.6 validation/reverse-link tooling and unlock Phase 8/9 gates as appropriate.