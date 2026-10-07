# Pattern Language Overhaul — Migration Control

**Status:** active migration programme  
**Branch:** `pattern-language-overhaul`  
**Baseline:** `main@974d3bf25df2f9406262384e2b8b2197403be43b`  
**Owner:** House Systems Architecture project  
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

## 2. What changes

### Major change

- `docs/patterns/` moves from a catalogue toward a connected language with stable identities, typed relationships and explicit sequence participation.
- Part III of the publication changes from a grouped catalogue to a browsable pattern language supported by maps and generative sequences.
- The reference house becomes an integration test of the language as well as a worked interpretation of the doctrine.

### Moderate change

- the project gains one or more generative sequences: partially ordered design processes with explicit feedback / rewind conditions;
- delivery documents can reference mature pattern IDs and selected implementation families;
- the computational track gains a crosswalk from architectural patterns to formalised consequences where justified.

### Presumed unchanged

- frozen source doctrine;
- eleven governing principles unless independent evidence requires change;
- research syntheses as evidence records;
- prototype/test records;
- frozen computational paper-compilation history;
- the formal architectural model based on semantic relationships, overlapping graphs, obligations and evidence.

This is an information-architecture and design-method migration, not another repo-wide prose rewrite.

---

## 3. Definitions to preserve during migration

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

---

## 4. Pattern admission test

A proposition should become a pattern only when it passes the following tests strongly enough to be useful:

1. **Recurrence** — the problem plausibly recurs across more than one project condition.
2. **Context** — the pattern can state when the problem exists and when it does not.
3. **Forces** — it exposes competing pressures rather than simply stating a preference.
4. **Relationship** — it resolves a meaningful spatial, physical, lifecycle or operational relationship.
5. **Variation** — materially different implementations can realise the same pattern.
6. **Diagrammability** — the invariant can be communicated spatially or systemically.
7. **Consequences** — benefits, costs, boundary debt and failure modes can be stated.
8. **Composition** — it meaningfully connects to other patterns.
9. **Evidence state** — its evidential status can be declared honestly, including `Proposed` or `Experimental`.

Failure of this test does not make an idea invalid. It means the idea probably belongs as doctrine, strategy, implementation family, reference-house decision, rule, evidence or research question instead.

---

## 5. Initial relationship vocabulary

Keep the graph deliberately small.

- **requires** — this pattern normally needs another pattern or condition to be resolved first.
- **completes** — this pattern commonly develops or localises another pattern.
- **alternative-to** — these patterns solve materially overlapping problems and should normally be chosen between rather than blindly accumulated.
- **tension-with** — adopting both creates a known trade-off that must be resolved explicitly.

Do not add relationship types merely because a semantic distinction can be imagined. Add one only after worked cases show repeated need.

Scale and domain are metadata, not graph edges.

---

## 6. Sequence rules

A generative sequence is not a rigid linear recipe.

It may contain:

- **hard precedence** — later work is meaningless or unsafe before an earlier decision exists;
- **soft precedence** — earlier resolution usually reduces rework but can legitimately be revisited;
- **parallel work** — two concerns can develop together;
- **rewind condition** — a later conflict requires an earlier architectural decision to change rather than being patched locally.

The project must prefer changing an upstream decision over inventing downstream technical complexity where the latter merely hides a bad earlier choice.

---

## 7. Programme

| Phase | Scope | Status | Exit gate |
|---|---|---|---|
| **0 — Baseline** | freeze recoverable starting point and record migration boundary | **Complete** | branch exists from recorded `main` commit |
| **1 — Metamodel** | define doctrine / strategy / pattern / language / sequence / family / occurrence / rule / evidence | **In progress** | definitions survive adversarial examples from current repo |
| **2 — Pattern contract** | define admission test, IDs, metadata, relations, evidence/maturity fields and page anatomy | **In progress** | contract is useful without becoming bureaucratic |
| **3 — Pilot language** | migrate a small connected service-topology fragment into individual linked pattern records | **Not started** | graph adds real reasoning value over the current catalogue |
| **4 — Pilot sequence** | create one service-topology generative sequence using the pilot fragment | **Not started** | sequence changes or clarifies design decisions rather than restating categories |
| **5 — Reference-house trial** | apply the pilot language/sequence to existing reference-house material; record conflicts, gaps and rewinds | **Not started** | language composes in a real worked case |
| **6 — Corpus audit** | classify current candidate content as principle / strategy / pattern / family / rule / instance / evidence | **Not started** | complete migration matrix with no silent category changes |
| **7 — Full migration** | split, merge, promote, demote and link pattern material systematically | **Blocked by Phase 5** | no duplicated canonical pattern content; stable IDs and links |
| **8 — Computational crosswalk** | map pattern consequences to existing semantic relationships / obligations where justified | **Blocked by Phase 5** | no pattern is treated as a compiler rule by default |
| **9 — Publication rearchitecture** | revise Part III and surrounding explanatory material around language + sequence | **Blocked by Phase 5** | publication explains and exposes the same system the repo uses |
| **10 — Site tooling** | derive indexes, reverse links, filters, orphan checks and later visualisation from Markdown metadata | **Blocked by Phase 3** | no second content store; graph is generated from canonical files |
| **11 — Validation** | continue evidence, prototype, reference-house and professional attack against migrated language | **Continuous after pilot** | maturity is earned by evidence, not migration status |

---

## 8. Pilot scope

The first pilot is **service topology**, because it crosses building, room and interface scales and touches maintenance, permanent fabric, boundaries, occupation and formalisation.

Start only with propositions already supported strongly enough to expose the language mechanics:

- Controlled Utility Entry;
- Plant Room as Service Hub;
- Horizontal Service Spine;
- High-Service-Room Service Wall;
- Designed Structural Penetration;
- Physical Service Index.

A vertical riser is a likely missing pattern, but it must be treated as a **discovered gap** until its invariant, context, forces and evidence are developed. Do not invent it merely to complete a diagram.

The pilot should also test whether `Water-Damage-Safe Service Route` is truly one pattern or a higher-level strategy whose variants belong elsewhere.

---

## 9. Pilot evaluation questions

The pilot succeeds only if it answers these better than the present catalogue:

1. What should the designer decide next?
2. Which earlier decisions constrain this one?
3. Which patterns commonly work together?
4. Which combinations create known tensions?
5. At what point should the designer go back and change the plan rather than detail around it?
6. Can the reference house state which patterns it uses without pretending those patterns prove the house is valid?
7. Can formal consequences be extracted without turning the architectural pattern itself into a compiler object?
8. Is the metadata small enough that authors will actually maintain it?

If the answer is mostly no, stop the migration and revise the metamodel before Phase 6.

---

## 10. Rollback and preservation rules

- Do not rewrite `docs/source/house-design-doctrine-v7.md`.
- Do not rewrite frozen computational runs merely to match new terminology.
- Do not delete existing pattern prose until the replacement location is canonical and cross-links are repaired.
- Do not promote an experimental assembly because it has been assigned a pattern-shaped page.
- Do not create a second database or registry as the source of truth; canonical content remains Markdown in the repository.
- Do not build a graph visualisation before the graph itself survives the pilot.
- Keep commits phase-oriented and reversible.

---

## 11. Resume-from-here protocol

A future collaborator or chat should recover context in this order:

1. read root `README.md`;
2. read `STATUS.md`;
3. read this file;
4. read `docs/patterns/language-model.md` once created;
5. inspect the pilot pattern files and service-topology sequence;
6. check the phase table above and continue only the first incomplete phase whose prerequisites are satisfied.

When a phase changes state, update **this table and `STATUS.md` in the same work session**.

---

## 12. Current next actions

1. complete the canonical pattern-language model / contract;
2. create the six-pattern service-topology pilot with stable IDs and typed links;
3. write the first generative sequence against those six patterns;
4. apply the sequence to the reference-house material and record what breaks;
5. decide whether Phase 6 is authorised.
