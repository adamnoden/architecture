# Pattern Language Overhaul — Migration Control

**Status:** **complete through Phase 8**  
**Baseline:** `main@974d3bf25df2f9406262384e2b8b2197403be43b`  
**Phase-7 close:** `main@d48ef1eb5fc7507b68622bd9ea66277115e374ac`  
**Phase-7 gate review:** [`pattern-language-phase7-review.md`](pattern-language-phase7-review.md)  
**Phase-8 gate review:** [`pattern-language-phase8-review.md`](pattern-language-phase8-review.md)

The catalogue-to-language migration and the architectural→computational crosswalk are complete at internal research scope. The project has a stable evidence-qualified pattern language, explicit non-pattern homes, a canonical Reference House occurrence model, publication integration, build-time metadata validation and a bounded implementation handoff into the existing semantic/compiler programme.

Do not restart taxonomy or paper-crosswalk work by default. Future changes require new architectural, physical, professional or executable evidence.

---

## 1. Architectural model

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
- strategy, pattern, implementation family and occurrence remain distinct;
- pattern provenance may explain a project requirement but does not replace source-model facts or technical authority;
- technical obligations derive from actual composed building relationships, not duplicate pattern checklists;
- there is no universal whole-pattern machine `PASS`.

---

## 2. Canonical definitions

**Doctrine** — durable architectural proposition.  
**Strategy** — broad way of pursuing one or more principles; valid physical responses may differ materially.  
**Pattern** — recurring architectural response to recurring context and forces; specific enough to guide design, general enough to admit multiple implementations.  
**Pattern language** — connected set of patterns whose sparse relationships help designers combine them coherently.  
**Generative sequence** — ordered or partially ordered design moves with explicit rewind conditions.  
**Implementation family** — concrete construction/system family capable of realising a pattern or strategy.  
**Occurrence** — one project-specific use of a pattern.  
**Rule / obligation** — proposition precise enough to check or evidence.  
**Evidence** — research, precedent, calculation, prototype, observation or professional determination supporting a scoped claim.

Detailed contract: [`../patterns/language-model.md`](../patterns/language-model.md).

---

## 3. Final canonical corpus

### Active patterns — 21

`HSA-P-001..005`, `HSA-P-007..022`.

### Retired identity

`HSA-P-006 — Water-Damage-Safe Service Route` — permanently retired; ID never reused.

### Canonical strategies

- [Fail-Safe Water Distribution](../patterns/strategies/fail-safe-water-distribution.md)
- [Decompose Structural Interface Functions](../patterns/strategies/decompose-structural-interface-functions.md)
- [Separate Structural Floor from Changeable Layers Where Proportionate](../patterns/strategies/separate-structural-floor-changeable-layers.md)

### Held candidates — no stable IDs

- [Replaceable Architectural Lining](../patterns/candidates/replaceable-architectural-lining.md)
- [Individually Isolatable Manifold Distribution](../patterns/candidates/individually-isolatable-manifold-distribution.md)
- [Local Deep Service Zone](../patterns/candidates/local-deep-service-zone.md)
- [Selective Floor Access](../patterns/candidates/selective-floor-access.md)

### Implementation families / expressions — not patterns

Examples: service skirting; door-surround routing; undercroft topology; pipe-in-pipe / withdrawable pipe; Seated Floor Structure; Finish-Agnostic Floor Platform; functional cornice; specific attachment-plane systems.

### Explicit rejection

`Perimeter Dry Zone` is not canonical. Its old bundling of wall-base moisture/drainage, inspection and maintenance-support territory was context-sensitive and internally conflicting.

---

## 4. Programme result

| Phase | Result |
|---|---|
| **0 — Baseline** | recoverable starting point preserved |
| **1 — Metamodel** | doctrine / strategy / pattern / sequence / family / occurrence / rule / evidence separated |
| **2 — Pattern contract** | stable IDs, metadata, evidence/maturity and page anatomy established |
| **3 — Pilot language** | linked service-topology patterns proved useful compositional knowledge |
| **4 — Pilot sequence** | decision order + rewind logic proved non-trivial |
| **5 — Reference House trial** | real occurrences, rewinds and taxonomy corrections produced |
| **6 — Corpus audit** | existing/candidate inventory classified under one admission model |
| **7 — Canonical migration** | **PASS** — canonical corpus, non-pattern homes, Reference House/publication integration and build-time validation complete |
| **8 — Computational crosswalk** | **PASS** — all patterns/strategies/candidates map onto existing semantic/obligation/evidence architecture; no pattern ontology required; P0 unchanged |

The crosswalk research question is closed enough to stop expanding it on paper.

---

## 5. Findings that remain binding

### F1 — graph and sequence are different structures

Composition does not equal decision order. Do not encode chronology as `requires` edges.

### F2 — rewinds are the main generative value

The Reference House sequence rejected:

- a universal mixed-services duct;
- scattered upper wet rooms;
- plant hidden in ordinary kitchen cabinetry;
- blanket leak containment everywhere.

### F3 — selection, occurrence, implementation and evidence are separate

The canonical [Reference House Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md) records these separately.

### F4 — preserve identity where meaning survives

`P-003` retained identity under a corrected name/scope. `P-006` was retired rather than distorted to preserve numbering.

### F5 — pattern count is an outcome, not a target

The old 30-slot publication inventory contained strategies, implementation families and undeveloped placeholders. The canonical language is smaller because classification became stricter.

### F6 — implementation-shaped ideas can reveal stronger abstractions

- service skirting + vertical joinery route → **Accessible Room Service Route**;
- Architectural Backplane + Fixing Infrastructure → **Controlled Attachment Plane**;
- Seated Floor Structure → structural-interface strategy + implementation challengers;
- Finish-Agnostic Floor Platform → floor-layer strategy + implementation challenger.

### F7 — migration does not increase evidence maturity

Stable identity, publication inclusion and Reference House use do not constitute physical validation.

### F8 — current state and research history are separate

Phase-5 pilot/run material keeps its discovery-era terminology as provenance. Current state is carried by canonical pattern pages, the occurrence register and publication architecture.

### F9 — taxonomy can expose design errors

Removing the old **Perimeter Dry Zone** category exposed that wall-base moisture, drainage, inspection and scaffold/support territory should not be bundled automatically.

### F10 — pattern provenance is not compiler truth

Phase 8 established that selected HSA intent may become a project requirement with pattern provenance, while ordinary source-model entities and relationships remain the thing being compiled.

### F11 — technical obligations remain canonical at the shared-graph layer

A penetration, route, boundary or maintenance relationship creates its technical obligations once. Multiple patterns touching the same condition do not create duplicate engineering/compliance checklists.

### F12 — architectural judgement remains visible

Proportionality, domestic character, repose, visual integration and similar architectural questions are not assigned arbitrary thresholds merely to produce machine completeness.

---

## 6. Integrity tooling

`docs/patterns/patterns.data.ts` validates the canonical language during the normal docs build.

It rejects:

- malformed `HSA-P-xxx` IDs;
- duplicate IDs;
- invalid active/retired states;
- state/location mismatch;
- unknown relationship targets;
- self-referential graph edges.

It also derives reverse references from the same frontmatter. Markdown remains the sole pattern content source.

Do not add graph visualisation, a second registry, graph-density scoring or orphan enforcement unless a real maintenance problem later justifies them.

---

## 7. Durable artefacts

### Architectural language

- Pattern model: [`../patterns/language-model.md`](../patterns/language-model.md)
- Canonical index: [`../patterns/README.md`](../patterns/README.md)
- Service sequence: [`../patterns/service-topology-sequence.md`](../patterns/service-topology-sequence.md)
- Strategies: [`../patterns/strategies/README.md`](../patterns/strategies/README.md)
- Held candidates: [`../patterns/candidates/README.md`](../patterns/candidates/README.md)
- Reference House current state: [`../reference-house/pattern-occurrence-register.md`](../reference-house/pattern-occurrence-register.md)
- Publication architecture: [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)

### Migration / crosswalk control

- Phase-7 execution record: [`pattern-language-phase7-plan.md`](pattern-language-phase7-plan.md)
- Phase-7 gate review: [`pattern-language-phase7-review.md`](pattern-language-phase7-review.md)
- Phase-8 execution record: [`pattern-language-phase8-plan.md`](pattern-language-phase8-plan.md)
- Phase-8 gate review: [`pattern-language-phase8-review.md`](pattern-language-phase8-review.md)

### Computational handoff

- Crosswalk model: [`../computational/pattern-crosswalk-model.md`](../computational/pattern-crosswalk-model.md)
- Implementation handoff: [`../computational/pattern-crosswalk-implementation-handoff.md`](../computational/pattern-crosswalk-implementation-handoff.md)
- Current programme: [`../computational/research-programme-v06.md`](../computational/research-programme-v06.md)

Historical Core-12, pilot, candidate and Phase-5 records remain recoverable provenance, not current authority.

---

## 8. What is now unlocked

### Minimal executable compiler kernel — P0

The computational programme should now stop designing more paper abstractions and implement the already-authorised minimal semantic/compiler kernel.

Phase 8 explicitly leaves P0 scope unchanged.

### `PAT-XW-01` — only after P0 passes

The first executable pattern-provenance fixture exercises primarily:

- `P-003` Coherent Horizontal Service Route;
- `P-005` Designed Structural Penetration;
- optional `P-012` Physical Service Index.

Its purpose is to prove that project architectural intent and technical/evidence validity can diverge cleanly without authority leakage or invasive schema growth.

### Publication development

Develop Part III/IV from the stable corpus and occurrence model. The structural taxonomy problem is solved; remaining work is synthesis, figures, evidence presentation and editing.

### Continuous physical/professional validation

Prototype and engineering evidence may change maturity, invalidate project occurrences or force future retirement. The language remains revisable by evidence, not by editorial convenience.

---

## 9. Resume protocol

Read:

1. root `README.md`;
2. `STATUS.md`;
3. this file;
4. [`pattern-language-phase7-review.md`](pattern-language-phase7-review.md);
5. [`pattern-language-phase8-review.md`](pattern-language-phase8-review.md);
6. [`../computational/research-programme-v06.md`](../computational/research-programme-v06.md);
7. [`../computational/pattern-crosswalk-implementation-handoff.md`](../computational/pattern-crosswalk-implementation-handoff.md);
8. [`../reference-house/pattern-occurrence-register.md`](../reference-house/pattern-occurrence-register.md) when worked-house context is needed.

Then proceed with P0 implementation, external review, physical validation, Reference House coordination or publication development as appropriate. Do **not** restart the catalogue migration or paper crosswalk unless new evidence genuinely requires it.