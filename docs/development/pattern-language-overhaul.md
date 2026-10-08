# Pattern Language Overhaul — Migration Control

**Status:** **complete through Phase 8**  
**Baseline:** `main@974d3bf25df2f9406262384e2b8b2197403be43b`  
**Phase-7 close:** `main@d48ef1eb5fc7507b68622bd9ea66277115e374ac`  
**Phase-7 gate review:** [`pattern-language-phase7-review.md`](pattern-language-phase7-review.md)  
**Phase-8 gate review:** [`pattern-language-phase8-review.md`](pattern-language-phase8-review.md)  
**Post-handoff executable gate:** [`../computational/p0-pat-xw-01-result.md`](../computational/p0-pat-xw-01-result.md)

The catalogue-to-language migration and architectural→computational crosswalk are complete at current internal research scope. The project has a stable evidence-qualified pattern language, explicit non-pattern homes, a canonical Reference House occurrence model, publication integration, build-time metadata validation and a bounded computational handoff.

The handoff has also now been exercised in software: the P0 executable kernel and `PAT-XW-01` both passed. Therefore any earlier language in this control that treated P0 or `PAT-XW-01` as future gates is superseded by the executable result record above.

Do not restart taxonomy, catalogue migration, paper-crosswalk work or generic compiler expansion by default. Future changes require new architectural, physical, professional or executable evidence.

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

Examples include service skirting, door-surround routing, undercroft topology, pipe-in-pipe / withdrawable pipe, Seated Floor Structure, Finish-Agnostic Floor Platform, functional cornice and specific attachment-plane systems.

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
| **8 — Computational crosswalk** | **PASS** — all patterns/strategies/candidates map onto existing semantic/obligation/evidence architecture; no pattern ontology required |
| **Post-handoff executable gate** | **PASS** — P0 kernel + `PAT-XW-01`; generic compiler/crosswalk growth frozen |

The taxonomy and paper-crosswalk research questions are closed enough to stop expanding them by default.

---

## 5. Binding findings

### Graph and sequence are different structures

Composition does not equal decision order. Do not encode chronology as `requires` edges.

### Rewinds are the main generative value

The Reference House sequence rejected a universal mixed-services duct, scattered upper wet rooms, plant hidden in ordinary kitchen cabinetry and blanket leak containment everywhere.

### Selection, occurrence, implementation and evidence are separate

The canonical [Reference House Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md) records these separately.

### Preserve identity where meaning survives

`P-003` retained identity under corrected name/scope. `P-006` was retired rather than distorted to preserve numbering.

### Pattern count is an outcome, not a target

The old publication inventory mixed strategies, implementation families, underdeveloped ideas and patterns. The canonical language is smaller because admission became stricter.

### Implementation-shaped ideas can reveal stronger abstractions

Examples:

- service skirting + vertical joinery route → **Accessible Room Service Route**;
- Architectural Backplane + Fixing Infrastructure → **Controlled Attachment Plane**;
- Seated Floor Structure → structural-interface strategy + implementation challengers;
- Finish-Agnostic Floor Platform → floor-layer strategy + implementation challenger.

### Migration does not increase evidence maturity

Stable identity, publication inclusion, Reference House use and computational representability do not constitute physical validation.

### Current state and research history are separate

Phase-5 pilot/run material keeps discovery-era terminology as provenance. Current state is carried by canonical pattern pages, the occurrence register, publication architecture and latest gate/result records.

### Taxonomy can expose design errors

Removing the old **Perimeter Dry Zone** category exposed that wall-base moisture, drainage, inspection and scaffold/support territory should not be bundled automatically.

### Pattern provenance is not compiler truth

Selected HSA intent may become a project requirement with pattern provenance, while source-model entities and relationships remain the thing being compiled.

### Technical obligations remain canonical at the shared-graph layer

A penetration, route, boundary or maintenance relationship creates its technical obligations once. Multiple patterns touching the same condition do not create duplicate engineering/compliance checklists.

### Architectural judgement remains visible

Proportionality, domestic character, repose, visual integration and similar architectural questions are not assigned arbitrary thresholds merely to produce machine completeness.

---

## 6. Integrity tooling

`docs/patterns/patterns.data.ts` validates the canonical language during the normal docs build.

It rejects malformed IDs, duplicate IDs, invalid active/retired states, state/location mismatch, unknown relationship targets and self-referential graph edges. It also derives reverse references from the same frontmatter. Markdown remains the sole pattern content source.

Do not add graph visualisation, a second registry, graph-density scoring or orphan enforcement unless a real maintenance problem later justifies them.

---

## 7. Durable artefacts

### Architectural language

- [Pattern model](../patterns/language-model.md)
- [Canonical index](../patterns/README.md)
- [Service sequence](../patterns/service-topology-sequence.md)
- [Strategies](../patterns/strategies/README.md)
- [Held candidates](../patterns/candidates/README.md)
- [Reference House current state](../reference-house/pattern-occurrence-register.md)
- [Publication architecture](../manuscript/publication-architecture.md)

### Migration / crosswalk provenance

- [Phase-7 execution record](pattern-language-phase7-plan.md)
- [Phase-7 gate review](pattern-language-phase7-review.md)
- [Phase-8 execution record](pattern-language-phase8-plan.md)
- [Phase-8 gate review](pattern-language-phase8-review.md)

### Computational handoff and result

- [Crosswalk model](../computational/pattern-crosswalk-model.md)
- [Implementation handoff](../computational/pattern-crosswalk-implementation-handoff.md)
- [P0 + PAT-XW-01 executable result](../computational/p0-pat-xw-01-result.md)

Historical Core-12, pilot, candidate and Phase-5 records remain recoverable provenance, not current authority.

---

## 8. What remains open after the overhaul

The migration itself does not own the next project phase. Current priorities are controlled by root [`../../STATUS.md`](../../STATUS.md).

The work unlocked by the completed language is primarily:

- Reference House coordination using the occurrence model;
- physical and engineering validation of uncertain implementation families;
- competent external attack;
- publication development around the stable language;
- evidence-selected computational fixtures only when a real uncertainty earns them.

Do **not** treat P0, `PAT-XW-01`, catalogue migration or paper crosswalking as unfinished work. They are closed gates unless new evidence exposes a defect.

---

## 9. Resume protocol

For current work read, in order:

1. root [`../../README.md`](../../README.md);
2. root [`../../STATUS.md`](../../STATUS.md);
3. this file when pattern-language provenance is relevant;
4. [`pattern-language-phase7-review.md`](pattern-language-phase7-review.md) and [`pattern-language-phase8-review.md`](pattern-language-phase8-review.md) for migration/crosswalk gate detail;
5. [`../computational/p0-pat-xw-01-result.md`](../computational/p0-pat-xw-01-result.md) for the post-handoff executable result;
6. [`../reference-house/pattern-occurrence-register.md`](../reference-house/pattern-occurrence-register.md) for worked-house state.

Then proceed according to `STATUS.md`. Do **not** restart the catalogue migration, paper crosswalk or generic compiler growth unless new evidence genuinely requires it.
