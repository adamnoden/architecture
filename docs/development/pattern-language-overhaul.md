# Pattern Language Overhaul — Migration Control

**Status:** active migration programme; Phases 0–6 complete; Phase 7 P7.1–P7.5 complete; P7.6 next  
**Baseline:** `main@974d3bf25df2f9406262384e2b8b2197403be43b` before pattern-language work  
**Phase-5 checkpoint:** `eccf8ff5721942e1cba5e7e36eb6aaf19476f49e`  
**Phase-6 checkpoint:** `5eba14402b333836add71739395385a7686edf4e`  
**Phase-7 Core checkpoint:** `722e883c6b2e4c8f3bad4ae232ab5d73125943d3`  
**Phase-7 identity checkpoint:** `4d831efb08f619799cfd0a2bc5d9c07a9273c08c`  
**Phase-7 non-pattern checkpoint:** `f4c67caed03eb1eb383dfb4738b5e1ebcaf5842e`  
**Purpose:** transform the existing pattern catalogue into an evidence-qualified pattern language and generative design process without losing doctrine, research provenance, Reference House work, prototype records or the computational evidence model.

Detailed Phase-7 execution is tracked in [`pattern-language-phase7-plan.md`](pattern-language-phase7-plan.md).

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

Hard constraints:

- a **pattern is not a compiler rule**;
- graph relationships are not generative sequence order;
- evidence/maturity are independent from pattern identity;
- Reference House use is not evidence for a pattern;
- Christopher Alexander is a methodological precedent, not an authority whose individual claims are imported wholesale.

---

## 2. Canonical definitions

**Doctrine** — durable architectural proposition.  
**Strategy** — broad way of pursuing one or more principles; valid physical responses may differ materially.  
**Pattern** — recurring architectural response to recurring context and forces; specific enough to guide design, general enough to admit multiple implementations.  
**Pattern language** — connected set of patterns whose sparse relationships help designers combine them coherently.  
**Generative sequence** — ordered/partially ordered design moves with explicit rewind conditions.  
**Implementation family** — concrete construction/system family capable of realising a pattern or strategy.  
**Occurrence** — one project-specific use of a pattern.  
**Rule / obligation** — proposition precise enough to check/evidence.  
**Evidence** — research, precedent, calculation, prototype, observation or professional determination supporting a scoped claim.

Detailed contract: [`../patterns/language-model.md`](../patterns/language-model.md).

---

## 3. Admission and graph discipline

A canonical pattern should materially satisfy recurrence, context, forces, relationship, variation, diagrammability, consequences, composition and evidential honesty.

Graph relation vocabulary remains deliberately small:

- `requires`;
- `completes`;
- `alternative-to`;
- `tension-with`.

Scale/domain are metadata. Chronology belongs in sequences. Do not create `related-to` edges merely to make the graph look connected.

---

# 4. Programme state

| Phase | Scope | Status | Result / next gate |
|---|---|---|---|
| **0 — Baseline** | recoverable starting point | **Complete** | baseline preserved |
| **1 — Metamodel** | doctrine / strategy / pattern / sequence / family / occurrence / rule / evidence | **Complete** | distinctions survived adversarial examples |
| **2 — Pattern contract** | IDs, metadata, relations, evidence/maturity, page anatomy | **Complete** | deliberately small contract established |
| **3 — Pilot language** | connected service-topology records | **Complete** | graph added useful compositional knowledge |
| **4 — Pilot sequence** | first service-topology generative sequence | **Complete** | ordering + rewind logic proved non-trivial |
| **5 — Reference House trial** | whole-house service-topology application | **Complete — PASS** | occurrences, rewinds and taxonomy corrections produced |
| **6 — Corpus audit** | classify existing/candidate inventory | **Complete — PASS** | controlled Phase-7 migration authorised |
| **7 — Canonical migration** | corpus, non-pattern homes, project/publication integration, validation | **Active — P7.1–P7.5 complete** | P7.6 metadata validation next; then close Phase 7 |
| **8 — Computational crosswalk** | map formal consequences to semantic relationships/obligations | **Blocked by Phase 7** | unlock after Phase-7 close gate |
| **9 — Publication rearchitecture** | develop final Part III/IV from stable language | **Partially unblocked structurally** | publication architecture now canonical; full development proceeds after Phase-7 close |
| **10 — Site tooling** | generated indexes, validation, optional later visualisation | **Minimal tooling only** | no graph UI during Phase 7 |
| **11 — Validation** | prototype/professional/Reference House attack | **Continuous** | maturity earned independently |

---

# 5. Canonical corpus

## Active patterns — 21

`HSA-P-001..005`, `HSA-P-007..022`.

## Retired identity

`HSA-P-006 — Water-Damage-Safe Service Route` — permanently retired; never reused.

## Canonical strategies

- [Fail-Safe Water Distribution](../patterns/strategies/fail-safe-water-distribution.md)
- [Decompose Structural Interface Functions](../patterns/strategies/decompose-structural-interface-functions.md)
- [Separate Structural Floor from Changeable Layers Where Proportionate](../patterns/strategies/separate-structural-floor-changeable-layers.md)

## Held candidates — no stable IDs

- [Replaceable Architectural Lining](../patterns/candidates/replaceable-architectural-lining.md)
- [Individually Isolatable Manifold Distribution](../patterns/candidates/individually-isolatable-manifold-distribution.md)
- [Local Deep Service Zone](../patterns/candidates/local-deep-service-zone.md)
- [Selective Floor Access](../patterns/candidates/selective-floor-access.md)

## Implementation families / expressions — not patterns

Service skirting; door-surround service routing; undercroft topology; pipe-in-pipe / withdrawable pipe; Seated Floor Structure; Finish-Agnostic Floor Platform; functional cornice; specific backplane rail/frame systems.

## Explicit rejection

`Perimeter Dry Zone` is not canonical. Its old bundling of wall-base moisture/drainage, inspection and maintenance-support territory is context-sensitive and can conflict.

---

# 6. Findings that must survive future edits

### F1 — graph and sequence are different structures

Composition does not equal decision order.

### F2 — rewind conditions are the main generative value

The Reference House sequence rejected:

- universal deep mixed-services duct;
- scattered upper wet rooms;
- plant hidden in kitchen cabinetry;
- blanket leak containment everywhere.

### F3 — selection, occurrence, implementation and evidence are separate

The canonical Reference House [Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md) now records these separately.

### F4 — preserve identity where meaning survives

`P-003` was renamed without changing identity. `P-006` was retired because its physical variants were too different to remain one pattern.

### F5 — the old 30-slot publication inventory was never the language

The final canonical set is smaller and cleaner because strategies, implementation families and held candidates are no longer disguised as patterns.

### F6 — stronger abstractions emerged from implementation-shaped ideas

- service skirting + vertical joinery route → **Accessible Room Service Route**;
- Architectural Backplane + Fixing Infrastructure → **Controlled Attachment Plane**;
- Seated Floor Structure → **Decompose Structural Interface Functions** strategy + implementation challengers;
- Finish-Agnostic Floor Platform → **Separate Structural Floor from Changeable Layers Where Proportionate** strategy + implementation challenger.

### F7 — evidence maturity remains independent

Migration and Reference House use do not promote evidence/maturity.

### F8 — current Reference House state is separate from migration history

The Phase-5 coordination brief/run retain their discovery-era terminology as research history. The current [Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md) is authoritative for project pattern state.

### F9 — publication Part III now follows the canonical language

`publication-architecture.md` v0.11 replaces the obsolete 30-slot inventory with the 21 active patterns, three strategies, held-candidate bench and generative-sequence method.

### F10 — taxonomy correction changed a live design assumption

P7.5 removed the bundled “Perimeter Dry Zone” premise from the current External Access & Maintenance Plan. Wall-base moisture, drainage, inspection and temporary access support are coordinated separately and combined only where compatible.

---

# 7. Durable artefacts

- Pattern model: [`../patterns/language-model.md`](../patterns/language-model.md)
- Canonical pattern index: [`../patterns/README.md`](../patterns/README.md)
- Service sequence: [`../patterns/service-topology-sequence.md`](../patterns/service-topology-sequence.md)
- Strategies: [`../patterns/strategies/README.md`](../patterns/strategies/README.md)
- Held candidates: [`../patterns/candidates/README.md`](../patterns/candidates/README.md)
- Reference House current state: [`../reference-house/pattern-occurrence-register.md`](../reference-house/pattern-occurrence-register.md)
- Publication architecture: [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)
- Phase-7 execution control: [`pattern-language-phase7-plan.md`](pattern-language-phase7-plan.md)
- Phase-6 audit authority: [`pattern-language-phase6-review.md`](pattern-language-phase6-review.md)

Migration provenance remains available in Core-12, pilot, candidate and Phase-5 records but is no longer the primary reading path.

---

# 8. P7.6 close task

Add lightweight build-time validation only:

1. duplicate stable IDs fail;
2. malformed `HSA-P-xxx` IDs fail;
3. canonical root/retired state mismatch fails;
4. relationship references to unknown stable IDs fail;
5. self-referential graph edges fail;
6. ordinary docs build executes the validation;
7. optionally derive reverse-reference data from the same Markdown frontmatter.

Do not add graph visualisation, a second registry, compiler semantics, graph-density scoring or noisy orphan warnings.

---

# 9. Preservation rules

- never rewrite `docs/source/house-design-doctrine-v7.md`;
- never rewrite frozen computational runs merely to match terminology;
- never erase useful research/prototype evidence because classification changed;
- never promote a candidate or assembly for editorial neatness;
- Markdown remains the source of truth;
- provenance may be demoted in navigation, not falsified.

---

# 10. Resume protocol

Read, in order:

1. root `README.md`;
2. `STATUS.md`;
3. this file;
4. [`pattern-language-phase7-plan.md`](pattern-language-phase7-plan.md);
5. [`../patterns/language-model.md`](../patterns/language-model.md);
6. [`../reference-house/pattern-occurrence-register.md`](../reference-house/pattern-occurrence-register.md);
7. [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md).

Then execute **P7.6 only**. Do not reopen taxonomy unless new evidence exposes a genuine contradiction.

When P7.6 passes, update this file and `STATUS.md`, close Phase 7, and explicitly unlock the Phase-8 computational crosswalk / remaining Part-III development.