# Pattern Language Overhaul — Migration Control

**Status:** active migration programme; Phase 5 passed, Phase 6 corpus audit authorised  
**Baseline:** `main@974d3bf25df2f9406262384e2b8b2197403be43b` before pattern-language work  
**First migration tranche:** merged to `main` via PR #9 (`18ff519`)  
**Purpose:** transform the existing pattern catalogue into an evidence-qualified pattern language and generative design process without losing the existing doctrine, research record, reference-house work, prototype programme or computational evidence model.

This document is the durable control point for the migration. It is written so the work can be resumed after loss of conversational context.

---

## 1. Decision

The project will not merely expand its existing catalogue of pattern cards.

The target architecture is:

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

The architectural layer remains primary. Patterns are not compiler rules, and compiler rules are not architectural judgement.

The existing evidence discipline is retained and strengthened. Christopher Alexander is a methodological precedent for pattern connectivity and generation, not an authority whose individual claims are imported wholesale.

---

## 2. Migration boundary

### Major change

- `docs/patterns/` moves from a catalogue toward a connected language with stable identities, typed relationships and explicit sequence participation.
- Part III of the publication will move from a grouped catalogue toward a browsable pattern language supported by maps and generative sequences **only after the corpus audit establishes what the language actually contains**.
- the Reference House is an integration test of the language as well as a worked interpretation of the doctrine.

### Moderate change

- the project gains generative sequences: partially ordered design processes with explicit feedback / rewind conditions;
- delivery documents can later reference mature pattern IDs and selected implementation families;
- the computational track can later gain a crosswalk from architectural patterns to formalised consequences where justified.

### Presumed unchanged

- frozen source doctrine;
- eleven governing principles unless independent evidence requires change;
- research syntheses as evidence records;
- prototype/test records;
- frozen computational paper-compilation history;
- the formal architectural model based on semantic relationships, overlapping graphs, obligations and evidence.

This is an information-architecture and design-method migration, not another repo-wide prose rewrite.

---

## 3. Definitions

**Doctrine** — durable architectural proposition.  
**Strategy** — broad way of pursuing one or more principles; may admit several substantially different patterns.  
**Pattern** — recurring architectural response to a recurring context and set of forces; specific enough to guide design, general enough to admit multiple implementations.  
**Pattern language** — connected set of patterns whose relationships help designers combine them coherently across scales and domains.  
**Generative sequence** — ordered or partially ordered series of design moves in which each move establishes context for later moves and may expose a reason to revisit an earlier move.  
**Implementation family** — a concrete construction/system family that can realise a pattern.  
**Occurrence** — one project-specific use of a pattern or implementation family.  
**Rule / obligation** — a proposition formal enough to be checked, calculated, evidenced or rejected.  
**Evidence** — research, precedent, calculation, prototype, observation or professional determination supporting a scoped claim.

These categories must not collapse into one another.

The canonical detailed contract is [`../patterns/language-model.md`](../patterns/language-model.md).

---

## 4. Pattern admission test

A proposition should become a pattern only when it passes these tests strongly enough to be useful:

1. **Recurrence** — the problem plausibly recurs across more than one project condition.
2. **Context** — the pattern can state when the problem exists and when it does not.
3. **Forces** — it exposes competing pressures rather than simply stating a preference.
4. **Relationship** — it resolves a meaningful spatial, physical, lifecycle or operational relationship.
5. **Variation** — materially different implementations can realise the same pattern.
6. **Diagrammability** — the invariant can be communicated spatially or systemically.
7. **Consequences** — benefits, costs, boundary debt and failure modes can be stated.
8. **Composition** — it meaningfully connects to other patterns.
9. **Evidence state** — its evidential status can be declared honestly, including `Proposed` or `Experimental`.

Failure does not make an idea invalid. It means the idea probably belongs as doctrine, strategy, implementation family, reference-house decision, rule, evidence or research question instead.

---

## 5. Initial relationship vocabulary

Keep the graph deliberately small.

- **requires** — another pattern or condition normally needs to be resolved first for this pattern to make architectural sense;
- **completes** — this pattern commonly develops or localises another pattern;
- **alternative-to** — the patterns solve materially overlapping problems and should normally be chosen between rather than blindly accumulated;
- **tension-with** — adopting both creates a known trade-off that must be resolved explicitly.

Sequence order does **not** belong in graph edges merely because one decision is usually made before another.

Scale and domain are metadata, not graph edges.

---

## 6. Sequence rules

A generative sequence is not a rigid linear recipe.

It may contain:

- **hard precedence** — later work is meaningless or unsafe before an earlier decision exists;
- **soft precedence** — earlier resolution usually reduces rework but can legitimately be revisited;
- **parallel work** — two concerns can develop together;
- **rewind condition** — a later conflict requires an earlier architectural decision to change rather than being patched locally.

The project should prefer changing an upstream decision over inventing downstream technical complexity where the latter merely hides a bad earlier choice.

---

## 7. Programme state

| Phase | Scope | Status | Exit gate |
|---|---|---|---|
| **0 — Baseline** | freeze recoverable starting point and record migration boundary | **Complete** | dedicated recoverable baseline recorded |
| **1 — Metamodel** | define doctrine / strategy / pattern / language / sequence / family / occurrence / rule / evidence | **Complete for migration** | definitions survived current Core 12 / reversible-assembly adversarial examples and Reference House pilot |
| **2 — Pattern contract** | define admission test, IDs, metadata, relations, evidence/maturity fields and page anatomy | **Complete for migration** | small frontmatter contract + authoring anatomy established |
| **3 — Pilot language** | create connected service-topology fragment with stable IDs and sparse typed links | **Complete** | six thin language records + graph expose useful relationships without duplicating publication prose |
| **4 — Pilot sequence** | create one service-topology generative sequence | **Complete** | sequence produced non-trivial ordering, rewind logic and taxonomy findings |
| **5 — Reference-house trial** | apply pilot language/sequence to worked whole-house geometry | **Complete — PASS** | whole-house coordination fixture + sequence run produced real occurrences, rewinds, missing-pattern and reclassification findings |
| **6 — Corpus audit** | classify current/planned reusable content as principle / strategy / pattern / family / rule / instance / evidence | **Authorised — next active phase** | complete migration matrix with no silent category changes |
| **7 — Full migration** | split, merge, promote, demote and link pattern material systematically | **Blocked by Phase 6** | no duplicated canonical pattern content; stable IDs and links |
| **8 — Computational crosswalk** | map pattern consequences to existing semantic relationships / obligations where justified | **Blocked by Phase 6** | no pattern is treated as a compiler rule by default |
| **9 — Publication rearchitecture** | revise Part III and surrounding material around language + sequence | **Blocked by Phase 6/7** | publication explains and exposes the same system the repo uses |
| **10 — Site tooling** | derive indexes, reverse links, filters, orphan checks and later visualisation from Markdown metadata | **Partially blocked** | no graph UI before Phase 6; lightweight validation may follow corpus stability |
| **11 — Validation** | continue evidence, prototype, reference-house and professional attack against migrated language | **Continuous** | maturity is earned by evidence, not migration status |

---

## 8. Pilot and Phase-5 artefacts

Pilot index: [`../patterns/pilot/README.md`](../patterns/pilot/README.md)  
Generative sequence: [`../patterns/service-topology-sequence.md`](../patterns/service-topology-sequence.md)  
Initial Reference House trial: [`service-topology-reference-house-trial.md`](service-topology-reference-house-trial.md)  
Whole-house coordination fixture: [`../reference-house/whole-house-coordination-fixture.md`](../reference-house/whole-house-coordination-fixture.md)  
Completed sequence run: [`../reference-house/service-topology-run-01.md`](../reference-house/service-topology-run-01.md)  
Phase-5 gate review: [`pattern-language-phase5-review.md`](pattern-language-phase5-review.md)  
Vertical-zone candidate: [`../patterns/candidates/accessible-vertical-service-zone.md`](../patterns/candidates/accessible-vertical-service-zone.md)

The six original pilot patterns are:

- `HSA-P-001` Controlled Utility Entry;
- `HSA-P-002` Plant Room as Service Hub;
- `HSA-P-003` Horizontal Service Spine;
- `HSA-P-004` High-Service-Room Service Wall;
- `HSA-P-005` Designed Structural Penetration;
- `HSA-P-012` Physical Service Index.

Their full developed prose remains in `core-12.md` until Phase 7. The pilot files remain intentionally thin language records so the experiment does not create duplicate canonical prose.

---

## 9. Findings from Phases 3–5

### F1 — graph and sequence must remain separate

The graph describes conceptual composition. The sequence describes decision order.

`HSA-P-004` can conceptually complete `HSA-P-003` at room scale while the sequence still examines service-wall opportunities **before** the horizontal spine is finalised because room adjacency is expensive to change later.

### F2 — rewind conditions are a core feature

The strongest added value is not merely “do A then B”. It is explicit recognition that downstream complexity can invalidate upstream architecture.

The worked Reference House run rejected:

- a universal deep mixed-services horizontal duct;
- scattered upper wet rooms;
- plant hidden in ordinary kitchen cabinetry;
- blanket leak containment everywhere.

### F3 — vertical distribution is a genuine language gap

The worked run produced the candidate **Accessible Vertical Service Zone**.

It passes the conceptual admission test and has credible professional/regulatory evidence anchors, but remains unnumbered until Phase 6 checks its scope and overlap against the full corpus.

### F4 — Water-Damage-Safe Service Route is probably a strategy

The worked house required materially different physical responses for plant/manifold leakage, vertical pressurised water, kitchen branches, bathroom branches and drainage.

Their shared invariant is failure performance rather than one physical relationship.

**Phase-6 starting presumption:** demote current Core Pattern 06 to strategy and test narrower children separately.

### F5 — pattern occurrence is distinct from project intention

The Reference House now records provisional project occurrences separately from selected pattern identities and evidence state.

This distinction should survive the migration.

### F6 — horizontal distribution must remain service-aware

The worked house did **not** justify one universal mixed-services spine.

`HSA-P-003` survived only when interpreted as coherent horizontal route topology whose contents and geometry vary by service class. Phase 6 should test whether its current name encourages the wrong reading.

### F7 — Phase 5 passed because the method changed the design

The sequence created real project geometry, rejected bad downstream patches, exposed missing reusable knowledge and corrected taxonomy.

That is enough to justify auditing the rest of the corpus.

---

## 10. Phase-5 gate decision

**PASS.** Full-corpus **audit** is authorised.

This does **not** authorise automatic full migration.

Phase 7 remains blocked until Phase 6 produces a complete reviewed migration matrix.

The Reference House itself remains provisional and continues independently as architectural/technical work.

---

## 11. Phase-6 mandate

Audit at minimum:

- `docs/patterns/core-12.md`;
- `docs/patterns/ground-supported-facade-access.md`;
- `docs/patterns/reversible-assembly-candidates.md`;
- the 30-item candidate inventory in `docs/manuscript/publication-architecture.md`;
- `Accessible Vertical Service Zone`;
- stronger abstractions hiding inside candidate assemblies.

For each proposition, record:

1. current identity/name;
2. recommended classification;
3. retain / rename / split / merge / demote / retire action;
4. evidence state;
5. likely pattern relations only where useful;
6. sequence participation where known;
7. formalisation boundary;
8. migration risk / unresolved evidence.

The objective is **fewer, clearer, more composable concepts**, not preservation of the old catalogue count.

---

## 12. Rollback and preservation rules

- Do not rewrite `docs/source/house-design-doctrine-v7.md`.
- Do not rewrite frozen computational runs merely to match new terminology.
- Do not delete existing pattern prose until its replacement location is canonical and links are repaired.
- Do not promote an experimental assembly because it has been assigned a pattern-shaped page.
- Do not create a second database or registry as the source of truth; canonical content remains Markdown in the repository.
- Do not build a graph visualisation before the graph survives the corpus audit.
- Keep migration commits phase-oriented and reversible.

---

## 13. Resume-from-here protocol

A future collaborator or chat should recover context in this order:

1. read root `README.md`;
2. read `STATUS.md`;
3. read this file;
4. read [`../patterns/language-model.md`](../patterns/language-model.md);
5. read [`pattern-language-phase5-review.md`](pattern-language-phase5-review.md);
6. inspect the Phase-5 Reference House fixture/run if architectural context is needed;
7. continue Phase 6 from the corpus audit matrix.

When a phase changes state, update **this table and `STATUS.md` in the same work session**.

---

## 14. Current next actions

1. create the Phase-6 corpus audit matrix before editing canonical pattern prose;
2. classify every Core 12 item and the reversible-assembly candidates first;
3. reconcile those results with the 30-item publication inventory rather than assuming all 30 survive;
4. decide the fate/name of `HSA-P-003`, Core Pattern 06 and Accessible Vertical Service Zone;
5. only after the matrix is reviewed, authorise or reject Phase 7 full migration.