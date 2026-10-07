# Pattern Language Overhaul — Migration Control

**Status:** active migration programme; full-corpus migration held at Phase 5 gate  
**Branch:** `pattern-language-overhaul`  
**Baseline:** `main@974d3bf25df2f9406262384e2b8b2197403be43b`  
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
- Part III of the publication will move from a grouped catalogue toward a browsable pattern language supported by maps and generative sequences, **but only after the pilot passes**.
- The reference house becomes an integration test of the language as well as a worked interpretation of the doctrine.

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
| **0 — Baseline** | freeze recoverable starting point and record migration boundary | **Complete** | dedicated branch from recorded `main` commit |
| **1 — Metamodel** | define doctrine / strategy / pattern / language / sequence / family / occurrence / rule / evidence | **Complete for pilot** | definitions survived current Core 12 / reversible-assembly adversarial examples |
| **2 — Pattern contract** | define admission test, IDs, metadata, relations, evidence/maturity fields and page anatomy | **Complete for pilot** | small frontmatter contract + authoring anatomy established |
| **3 — Pilot language** | create connected service-topology fragment with stable IDs and sparse typed links | **Complete** | six thin language records + graph expose useful relationships without duplicating publication prose |
| **4 — Pilot sequence** | create one service-topology generative sequence | **Complete** | sequence produced non-trivial ordering, rewind logic and taxonomy findings |
| **5 — Reference-house trial** | apply pilot language/sequence to current Reference House | **In progress — gate held** | first trial complete; whole-house geometry is not developed enough to prove composition |
| **6 — Corpus audit** | classify current candidate content as principle / strategy / pattern / family / rule / instance / evidence | **Blocked by Phase 5** | complete migration matrix with no silent category changes |
| **7 — Full migration** | split, merge, promote, demote and link pattern material systematically | **Blocked by Phase 5** | no duplicated canonical pattern content; stable IDs and links |
| **8 — Computational crosswalk** | map pattern consequences to existing semantic relationships / obligations where justified | **Blocked by Phase 5** | no pattern is treated as a compiler rule by default |
| **9 — Publication rearchitecture** | revise Part III and surrounding material around language + sequence | **Blocked by Phase 5** | publication explains and exposes the same system the repo uses |
| **10 — Site tooling** | derive indexes, reverse links, filters, orphan checks and later visualisation from Markdown metadata | **Partially blocked** | do not build graph UI before Phase 5; lightweight validation/index tooling can follow pilot stability |
| **11 — Validation** | continue evidence, prototype, reference-house and professional attack against migrated language | **Continuous after pilot** | maturity is earned by evidence, not migration status |

---

## 8. Pilot scope and current artefacts

The first pilot is **service topology**, because it crosses building, room and interface scales and touches maintenance, permanent fabric, boundaries, occupation and formalisation.

Pilot index: [`../patterns/pilot/README.md`](../patterns/pilot/README.md)  
Generative sequence: [`../patterns/service-topology-sequence.md`](../patterns/service-topology-sequence.md)  
Reference-house trial: [`service-topology-reference-house-trial.md`](service-topology-reference-house-trial.md)  
Reference-house coordination brief: [`../reference-house/service-topology-coordination.md`](../reference-house/service-topology-coordination.md)

The six pilot patterns are:

- `HSA-P-001` Controlled Utility Entry;
- `HSA-P-002` Plant Room as Service Hub;
- `HSA-P-003` Horizontal Service Spine;
- `HSA-P-004` High-Service-Room Service Wall;
- `HSA-P-005` Designed Structural Penetration;
- `HSA-P-012` Physical Service Index.

Their full developed prose remains in `core-12.md` during the pilot. The pilot files are intentionally thin language records so the experiment does not create duplicate canonical prose.

---

## 9. Findings from Phases 3–5

### F1 — graph and sequence must remain separate

The graph describes conceptual composition. The sequence describes decision order.

`HSA-P-004` can conceptually complete `HSA-P-003` at room scale while the sequence still examines service-wall opportunities **before** the horizontal spine is finalised because room adjacency is expensive to change later.

Do not collapse these two structures.

### F2 — rewind conditions are a core feature

The strongest added value is not merely “do A then B”. It is explicit recognition that downstream complexity can invalidate upstream architecture.

Examples:

- scattered wet rooms → revisit adjacency before multiplying service walls;
- excessive route depth → revisit hub/vertical/room organisation before creating a large technical void;
- many bespoke crossings → revisit the route before detailing more penetrations;
- elaborate leak containment everywhere → revisit where water is routed.

### F3 — vertical distribution is a confirmed language gap

The Reference House already assumes planned vertical routes and the service sequence cannot connect plant to multi-storey room distribution without resolving them.

A **Vertical Service Riser** candidate should be researched against the admission test. No ID is assigned yet.

### F4 — Water-Damage-Safe Service Route is probably too broad

Current Core Pattern 06 may be a strategy/performance objective rather than one pattern. Its variants solve leakage through substantially different physical relationships.

Keep classification provisional until actual Reference House routes are drawn.

### F5 — pattern occurrence is distinct from project intention

The Reference House currently expresses several preferences compatible with the pilot patterns, but no house-scale occurrence should be claimed until identifiable project geometry/information exists.

Later Reference House records should distinguish:

- pattern considered;
- pattern selected;
- occurrence located;
- implementation family selected;
- evidence available.

### F6 — full migration is not yet earned

The current Reference House is strong at doctrine, tectonic language and representative-bay coordination but incomplete at whole-house plan/site/service topology.

This is why Phase 5 remains open.

---

## 10. Phase 5 completion package

Before authorising Phase 6, advance the Reference House just enough to produce:

1. provisional whole-house plan and storey relationships;
2. high-service-room / demand-node overlay;
3. utility-entry and plant-hub occurrence;
4. explicit vertical-distribution proposal and at least one credible alternative;
5. horizontal primary route proposal with real depth/fall constraints;
6. service-wall opportunities and rejected locations;
7. representative crossing register;
8. water-failure strategy applied to those real routes;
9. initial pattern-occurrence register.

The detailed brief is [`../reference-house/service-topology-coordination.md`](../reference-house/service-topology-coordination.md).

Once that exists, rerun the Reference House trial and either:

- **PASS** → authorise Phase 6 corpus audit;
- **REVISE** → amend the model/sequence and rerun;
- **FAIL** → stop the migration and keep only useful local concepts.

---

## 11. Rollback and preservation rules

- Do not rewrite `docs/source/house-design-doctrine-v7.md`.
- Do not rewrite frozen computational runs merely to match new terminology.
- Do not delete existing pattern prose until its replacement location is canonical and links are repaired.
- Do not promote an experimental assembly because it has been assigned a pattern-shaped page.
- Do not create a second database or registry as the source of truth; canonical content remains Markdown in the repository.
- Do not build a graph visualisation before the graph itself survives the Reference House gate.
- Keep migration commits phase-oriented and reversible.

---

## 12. Resume-from-here protocol

A future collaborator or chat should recover context in this order:

1. read root `README.md`;
2. read `STATUS.md`;
3. read this file;
4. read [`../patterns/language-model.md`](../patterns/language-model.md);
5. read [`../patterns/pilot/README.md`](../patterns/pilot/README.md);
6. read [`../patterns/service-topology-sequence.md`](../patterns/service-topology-sequence.md);
7. read [`service-topology-reference-house-trial.md`](service-topology-reference-house-trial.md);
8. continue the first incomplete phase whose prerequisites are satisfied.

When a phase changes state, update **this table and `STATUS.md` in the same work session**.

---

## 13. Current next actions

1. advance the Reference House whole-house plan/site work rather than adding more pattern taxonomy;
2. execute [`../reference-house/service-topology-coordination.md`](../reference-house/service-topology-coordination.md) against that plan;
3. develop the Vertical Service Riser candidate only from the resulting real constraints;
4. retest the classification of Water-Damage-Safe Service Route against actual routes;
5. rerun Phase 5 and authorise or reject Phase 6 explicitly.
