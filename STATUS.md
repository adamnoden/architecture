# Project Status

**Canonical project-wide status overview**  
**Last updated:** 2026-10-07  
**Current phase:** **convergence → validation**

This file answers one question:

> **Where is the House Systems Architecture project actually at?**

The central architectural position is established. The pattern-language overhaul is complete. Current work should now move to physical/professional validation, continued Reference House development, publication development from the stable language, and the bounded computational crosswalk/minimal kernel.

---

## Maturity scale

| Level | Meaning |
|---|---|
| **L0 — Not started** | identified but materially undeveloped |
| **L1 — Framed** | scope/question defined; little resolved work |
| **L2 — Developed** | substantial content/design exists; important gaps remain |
| **L3 — Coordinated** | internally coherent across adjacent project concerns; ready for serious testing/editorial hardening |
| **L4 — Internally validated / frozen** | current internal research question answered; further progress requires a qualitatively different evidence source |
| **L5 — Externally validated / release-ready** | competent external/physical validation complete for the stated scope |

---

# Executive status

| Workstream | Maturity | Current state | Next meaningful gate |
|---|---:|---|---|
| **Original doctrine / source corpus** | **L4** | House Design Doctrine v7 preserved as source material | maintain traceability while publication supersedes raw source prose |
| **Public architectural position / governing principles** | **L3** | selective permanence, designed interfaces, failure architecture, maintenance geography, workmanship robustness, repose and passive-first hierarchy established | evidence/figure hardening and final proof |
| **Publication architecture** | **L3–L4 structurally** | v0.11 organises Part III around the canonical 21-pattern language, strategies, held candidates and generative method | develop finished Part III/IV content and figures |
| **Pattern-language migration** | **L4 — complete** | Phases 0–7 complete; canonical corpus, non-pattern homes, Reference House mapping, publication integration and build-time metadata validation all passed | reopen only if new architectural/physical evidence requires classification change |
| **Preface** | **L3** | full editorial rewrite complete | final proof against completed book |
| **Part I — The Proposition** | **L3** | substantial evidence-backed draft; editorial overhaul complete | diagrams, evidence presentation and whole-book integration |
| **Part II — Architecture of the Platform** | **L3** | interface/failure/maintenance/tolerance argument coordinated and editorially hardened | complete figures and remaining evidence/technical integration |
| **Part III — Pattern language** | **L3–L4 structurally** | canonical 21-pattern language is stable; old 30-slot inventory removed; strategies/candidates visibly distinct; metadata integrity enforced by docs build | publication-quality figures, evidence presentation and cross-links |
| **Part IV — Reference House** | **L2–L3** | canonical Pattern Occurrence Register separates actual occurrences, selected intent, strategies, candidates and evidence obligations; house remains provisional/unengineered | continue whole-house architectural/structural/environmental coordination |
| **Part V — Making and Testing** | **L3** | substantial draft and validation philosophy exist | align with actual prototype/engineering results |
| **Evidence / precedent research** | **L3** | deep packages exist; targeted evidence closed taxonomy ambiguities | continue claim-by-claim hardening where physical/publication maturity needs it |
| **Candidate reversible assemblies** | **L3 conceptually** | stronger strategies/candidates have explicit homes; implementation validity unresolved | structural engineering + 1:1 testing + conventional comparators |
| **Physical prototype programme** | **L1–L2** | programme, acceptance criteria, W2 wall-bay build pack/drawings exist; no physical validation recorded | build/test wall bay; engineer/test floor edge; then floor platform/joint |
| **Reference-house structural/technical design** | **L1–L2** | whole-house coordination geometry exists; structure, services, building physics/products remain concept-level | competent multidisciplinary coordination |
| **Computational paper research** | **L4** | S0→S1→S2→H1 paper sequence, mutations, red team and capability freeze complete | stop major paper expansion |
| **Computational crosswalk** | **L1** | now unblocked by stable pattern language; patterns must remain distinct from compiler ontology | map only formalisable pattern consequences into existing semantic/obligation/evidence model |
| **Computational external validation** | **L1** | adversarial review pack exists; review not yet performed | structural + fire/building-control + building-services review |
| **Compiler software implementation** | **L1** | minimal vertical slice authorised; heavy implementation not authorised | source model → well-formedness → obligations → evidence → invalidation → diagnostics |
| **Architect-facing delivery / RIBA brief** | **L2** | strong implementation-brief template exists | populate only as decisions mature into requirements |
| **Publication graphics / drawing language** | **L1–L2** | repose, vertical-bay and whole-house coordination SVGs exist | establish consistent figure language as content stabilises |

---

# Complete enough to stop working on for now

## 1. Raw doctrine discovery

The project has enough governing ideas. New findings should normally refine an existing principle, become a strategy/pattern, become a Reference House decision, become evidence/test work, or be rejected.

## 2. Computational paper-compilation research

The internal paper sequence is complete through a bounded whole house. Next information must come from competent external attack, a minimal executable prototype and physical/product evidence.

## 3. Repo-wide prose migration

The controlled global editorial overhaul is complete. Further prose work should be local, structural and evidence-driven.

## 4. Pattern-language overhaul

**Phases 0–7 are complete.** See the [Phase 7 Gate Review](docs/development/pattern-language-phase7-review.md).

Locked outcomes:

- 21 active canonical patterns: `HSA-P-001..005`, `HSA-P-007..022`;
- `HSA-P-006` permanently retired; ID never reused;
- `HSA-P-003` is **Coherent Horizontal Service Route**;
- three canonical strategies: **Fail-Safe Water Distribution**, **Decompose Structural Interface Functions**, **Separate Structural Floor from Changeable Layers Where Proportionate**;
- four held candidates remain unnumbered: **Replaceable Architectural Lining**, **Individually Isolatable Manifold Distribution**, **Local Deep Service Zone**, **Selective Floor Access**;
- implementation challengers such as Seated Floor Structure and Finish-Agnostic Floor Platform remain outside the graph;
- current Reference House state is recorded in `docs/reference-house/pattern-occurrence-register.md`;
- Phase-5 run/brief remain historical research records rather than current taxonomy;
- Publication Architecture v0.11 uses the canonical language rather than the superseded 30-slot inventory;
- the rejected **Perimeter Dry Zone** bundling has been removed from the current external-maintenance plan;
- the ordinary docs build now rejects malformed/duplicate IDs, invalid state/location combinations, unknown relationship targets and self-referential edges.

Do not restart catalogue/taxonomy migration. Reopen classification only when new evidence genuinely demands it.

---

# Highest-value unfinished work

## A. Physical / engineering validation

This remains the largest gap between an intellectually coherent doctrine and a credible building system.

Immediate gates:

1. **Controlled Attachment Plane + Replaceable Architectural Lining wall bay** — build 1:1 against first-rate plaster control, including imperfect background geometry and an unfamiliar competent installer.
2. **Structural floor edge / Seated Floor challenger** — engineer comparison of ordinary certified restraint hanger, direct bearing + separate restraint and any custom alternative.
3. **Finish-Agnostic Floor Platform** — walkable multi-panel comparison including a local-access-band alternative; tactile/acoustic solidity is non-negotiable.
4. **Wall/ceiling tectonic joint** — conventional quiet joint versus mechanically honest/removable alternatives.

## B. Continue the Reference House

The [Pattern Occurrence Register](docs/reference-house/pattern-occurrence-register.md) is the canonical pattern/project-state layer. The house itself remains provisional.

Next work should:

1. challenge the provisional **12.6 × 11.4 m** footprint for area/proportionality;
2. resolve stair/circulation/courtyard relationships;
3. coordinate structure and `RH-P005-*` crossings with an engineer;
4. develop passive-first environmental strategy against real orientation/openings;
5. turn selected-intent patterns into actual occurrences only when geometry supports them;
6. coordinate courtyard drainage/external maintenance without recreating the rejected Perimeter Dry Zone bundle;
7. feed prototype outcomes back into wall/floor/interface choices.

Reference House use is never evidence for doctrine/pattern validity.

## C. Publication development

The publication architecture is structurally correct. Remaining work is publication work rather than taxonomy repair:

1. develop Part III pages/figures around the canonical language;
2. develop Part IV from the evolving Reference House/current occurrence register;
3. standardise diagrams where graphics outperform prose;
4. close evidence/citation/glossary/back-matter gaps;
5. final proof after physical/professional findings land.

## D. Computational crosswalk + minimal kernel

Phase 8 is now unblocked, but the boundary remains strict: **patterns do not become compiler entities by default**.

First crosswalk/kernel work should:

1. identify only formalisable consequences of stable patterns;
2. map those consequences into existing semantic relationships / obligations / evidence requirements;
3. preserve architectural judgement outside the executable core;
4. continue the minimal kernel: source model → well-formedness → obligations → evidence → invalidation → diagnostics;
5. reassess before heavier CAD/solver/rule-pack work.

## E. External professional attack

High-value reviews:

- **structural engineer** — floor/interface propositions, Reference House structure, computational structural proof boundary;
- **building-control / fire practitioner** — boundary/fire/access assumptions, service-void/vertical-zone treatment, computational target interpretation;
- **building-services / ventilation engineer** — passive-first strategy, service geography, domestic vertical-zone proportionality and computational evidence boundary.

Negative findings are successful research outcomes.

---

# Important unresolved risks

### R1 — physical quality

Replaceable walls/floors may work technically and still feel hollow, temporary or over-detailed.

### R2 — complexity / proportionality

Serviceability infrastructure can consume more space, money, carbon and maintenance than the future change it avoids.

### R3 — workmanship

A detail that works only under designer supervision fails the project.

### R4 — compiler externalisation

If most technical results become `EXTERNAL_EVIDENCE_REQUIRED`, the compiler degenerates into an evidence manager.

### R5 — passive environmental strategy

Passive-first is a hierarchy, not a predetermined system answer.

### R6 — publication drift

The repo can expand indefinitely. The monograph must select, compress and omit.

### R7 — pattern-language bureaucracy

The migration is complete; resist accreting tooling or taxonomy around it unless a real maintenance problem appears.

---

# Near-term project sequence

### Architectural / physical

**prototype + engineer in parallel with whole-house Reference House coordination → feed validated results back into language/manuscript → final publication proof**

### Pattern language

**Phase 7 closed → maintain canonical corpus under build-time validation; reopen classification only on real evidence**

### Computational

**Phase 8 formalisable-consequence crosswalk + external review + minimal executable kernel → reassess thesis → only then heavier CAD/solvers/rule packs**

### Delivery

**populate implementation brief only when architecture/pattern/reference-house decisions are mature enough to become requirements**

---

# Status-maintenance rule

Update this file when a major workstream crosses maturity, new evidence changes the language, prototype/professional review changes a conclusion, Reference House reaches a new integration stage, the computational programme changes phase, or recommended next actions materially change.

Detailed TODOs live in track-specific control documents. This file should remain readable in a few minutes.