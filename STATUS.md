# Project Status

**Canonical project-wide status overview**  
**Last updated:** 2026-10-09  
**Current phase:** **validation / implementation falsification**

This file answers one question:

> **Where is the House Systems Architecture project actually at?**

The central architectural position, canonical pattern language and pattern→computational crosswalk are established. The minimal executable compiler kernel and first executable pattern-crosswalk fixture have passed. The architectural-specificity audit is also closed: HSA doctrine/patterns and the generic grammar/computational framework are explicitly separated from G-01, H1 technical scope and Reference House choices. The project's highest-value remaining evidence is physical, professional and whole-house architectural: prototypes, competent external attack, continued Reference House coordination and publication completion.

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
| **Original doctrine / source corpus** | **L4** | House Design Doctrine v7 preserved as source material, including historical style leakage | maintain provenance; do not rewrite frozen source to resemble current doctrine |
| **Public architectural position / governing principles** | **L3** | selective permanence, designed interfaces, failure architecture, maintenance geography, workmanship robustness, repose and passive-first hierarchy established and style-neutral | evidence/figure hardening and final proof |
| **Architectural specificity / authority boundary** | **L4 — complete** | Gates 0–7 passed; doctrine, patterns, technical domain, grammar, project morphology/dialect and prototype evidence authority are explicitly separated | reopen only on real authority drift or when a materially different second grammar exposes a defect |
| **Publication architecture** | **L3–L4 structurally** | v0.12 organises Part III around canonical language, strategies, held candidates and generative method; Reference House remains one interpretation rather than proof | develop finished Part III/IV content and figures |
| **Pattern-language migration** | **L4 — complete** | Phases 0–7 complete; canonical corpus, non-pattern homes, Reference House mapping, publication integration and metadata validation all passed | reopen only when new architectural/physical evidence requires classification change |
| **Pattern→computational crosswalk** | **L4 at internal mapping scope — complete** | Phase 8 crosswalked all 21 active patterns, three strategies and four held candidates; no new fundamental compiler abstraction required | maintain as provenance layer; reopen only if executable/physical evidence exposes a defect |
| **Preface** | **L3** | full editorial rewrite complete; situated material/architectural preferences remain authorial context rather than doctrine | final proof against completed book |
| **Part I — The Proposition** | **L3** | substantial evidence-backed draft; explicitly distinguishes doctrine from Georgian/reference implementations | diagrams, evidence presentation and whole-book integration |
| **Part II — Architecture of the Platform** | **L3** | interface/failure/maintenance/tolerance argument coordinated; specific traditional details explicitly treated as examples/project language | complete figures and remaining evidence/technical integration |
| **Part III — Pattern language** | **L3–L4 structurally** | canonical 21-pattern language stable; strategies/candidates distinct; specificity audit found no style-bound invariant requiring migration | publication-quality figures, evidence presentation and cross-links |
| **Part IV — Reference House** | **L2–L3** | Pattern Occurrence Register plus explicit authority stack separates HSA, technical families, G-01, site/programme, courtyard morphology, local dialect and tectonic dialect | continue whole-house architectural/structural/environmental coordination |
| **Part V — Making and Testing** | **L3** | validation philosophy coordinated; material-specific wording generalised and prototype target-fit evidence separated from general evidence | align with actual prototype/engineering results |
| **Evidence / precedent research** | **L3** | deep packages exist; targeted research closed taxonomy ambiguities | continue claim-by-claim hardening where physical/publication maturity needs it |
| **Candidate reversible assemblies** | **L3 conceptually** | stronger strategies/candidates explicit; implementation validity unresolved | engineering + 1:1 testing + conventional comparators |
| **Physical prototype programme** | **L1–L2** | programme, acceptance criteria and W2 wall-bay build pack/drawings exist; general HSA evidence and Reference House/G-01 fit now require separate verdicts; no physical validation recorded | build/test wall bay; engineer/test floor edge; then floor platform/joint |
| **Reference-house structural/technical design** | **L1–L2** | whole-house coordination geometry exists; structure, services, building physics/products remain concept-level | competent multidisciplinary coordination |
| **Architectural grammar framework** | **L3 conceptually** | framework style-neutral; G-01 has independent domestic-grammar charter; G-01 rule set remains research-incomplete | continue G-01 derivation only where evidence warrants; later second grammar is strongest neutrality test |
| **Computational paper research** | **L4 — frozen** | S0→S1→S2→H1 paper sequence, mutations, red team and capability freeze complete | stop major paper expansion |
| **Computational external validation** | **L1** | adversarial review pack exists; review not yet performed | structural + fire/building-control + building-services review |
| **Compiler software implementation** | **L3 at P0 falsification scope** | P0 kernel passed 17/17 executable tests; PAT-XW-01 passed 6/6; CI also typechecks and builds docs | freeze generic growth; add a fixture only when another workstream exposes a concrete high-value question |
| **Architect-facing delivery / RIBA brief** | **L2** | strong implementation-brief template exists | populate only as decisions mature into requirements |
| **Publication graphics / drawing language** | **L1–L2** | repose, vertical-bay and whole-house coordination SVGs exist | establish consistent figure language as content stabilises |

---

# Complete enough to stop working on for now

## 1. Raw doctrine discovery

The project has enough governing ideas. New findings should normally refine an existing principle, become a strategy/pattern, become a Reference House decision, become evidence/test work, or be rejected.

## 2. Computational paper-compilation research

The internal paper sequence is complete through a bounded whole house. Further paper expansion is not authorised unless executable or external evidence exposes a real model defect.

## 3. Repo-wide prose migration

The controlled global editorial overhaul is complete. Further prose work should be local, structural and evidence-driven.

## 4. Pattern-language overhaul

**Phases 0–7 are complete.** See [Phase 7 Gate Review](docs/development/pattern-language-phase7-review.md).

Locked outcomes:

- 21 active canonical patterns: `HSA-P-001..005`, `HSA-P-007..022`;
- `HSA-P-006` permanently retired; ID never reused;
- three canonical strategies;
- four held candidates remain unnumbered;
- current Reference House state lives in `docs/reference-house/pattern-occurrence-register.md`;
- Publication Architecture v0.12 uses the canonical language;
- metadata integrity is enforced by the ordinary docs build.

Do not restart catalogue/taxonomy migration absent real new evidence.

## 5. Pattern→computational crosswalk

**Phase 8 is complete.** See [Phase 8 Gate Review](docs/development/pattern-language-phase8-review.md).

Locked outcomes:

- pattern language remains an architectural authoring/provenance layer, not the compiler ontology;
- selected pattern intent may create project requirements with `HSA-P-*` provenance;
- technical obligations still derive from actual composed structural/boundary/service/maintenance graphs;
- there is no universal whole-pattern machine `PASS`;
- architectural judgement remains explicit rather than converted into arbitrary thresholds;
- all 21 active patterns fit the existing semantic model;
- all strategies/candidates are representable without promotion.

Do not produce more paper crosswalks unless implementation or external/physical evidence exposes a real model defect.

## 6. P0 executable kernel + PAT-XW-01

**Both executable gates have passed.** See [P0 + PAT-XW-01 Executable Gate Result](docs/computational/p0-pat-xw-01-result.md).

P0 demonstrated:

- stable semantic identity and typed relationships;
- simple deterministic source/geometry well-formedness;
- obligation derivation;
- scoped evidence and selective invalidation;
- distinct model / architectural / technical / evidence state;
- clean unsupported-domain behaviour;
- deterministic replay.

`PAT-XW-01` demonstrated:

- `P-003` and `P-005` provenance can be carried by ordinary project requirements without becoming compiler entities;
- HSA project intent can fail while technical state remains unchanged;
- formal pattern commitments can remain resolved while a technical obligation becomes unresolved;
- a new boundary role creates only its dependent technical obligation and does not broaden old evidence;
- the report can group project commitments and technical obligations without inventing a whole-pattern PASS.

`P-012` physical-index semantics remain deliberately deferred. Do not add a generic physical `identifies` relation until a real use case earns it.

**Generic compiler/crosswalk growth is now frozen.** Keep the executable suites as regression tests.

## 7. Architectural specificity audit

**Gates 0–7 are complete.** See [programme control](docs/development/architectural-specificity-audit.md), [claim ledger](docs/development/architectural-specificity-ledger.md) and [adversarial verification](docs/development/architectural-specificity-adversarial-test.md).

Locked outcomes:

- HSA doctrine is style-neutral without becoming architecturally neutral;
- all 21 active patterns and three strategies passed the portability audit;
- H1 construction/morphology restrictions remain supported-domain competence, not architectural virtue;
- the generic grammar framework does not require G-01 concepts;
- G-01 is a Georgian-derived domestic grammar, independently selectable from HSA doctrine;
- courtyard morphology and local Andalusian influence remain Reference House/project layers, not G-01 core by default;
- Reference House tectonic language may remain Georgian/traditional and use brass/bronze without promoting that vocabulary upstream;
- prototype general evidence and selected-grammar/Reference-House fit require separate verdicts;
- a materially different architectural language and technical family passed the adversarial authority test.

Do not reopen this as a standing taxonomy exercise. Reopen only if actual future work collapses those authority boundaries.

---

# Highest-value unfinished work

## A. Physical / engineering validation

This is now the largest gap between an intellectually coherent doctrine and a credible building system.

Immediate gates:

1. **Controlled Attachment Plane + Replaceable Architectural Lining wall bay** — build 1:1 against first-rate plaster control, including imperfect background geometry and an unfamiliar competent installer; record general HSA evidence separately from Reference House/G-01 fit.
2. **Structural floor edge / Seated Floor challenger** — engineer comparison of ordinary certified restraint hanger, direct bearing + separate restraint and any custom alternative.
3. **Finish-Agnostic Floor Platform** — walkable multi-panel comparison including a local-access-band alternative; tactile/acoustic solidity is non-negotiable.
4. **Reference House wall/ceiling tectonic joint** — conventional quiet joint versus mechanically honest/removable alternatives; generalise interface behaviour, not cornice/brass vocabulary.

## B. Continue the Reference House

The [Pattern Occurrence Register](docs/reference-house/pattern-occurrence-register.md) is the canonical pattern/project-state layer. The house itself remains provisional.

Use the [Reference House authority stack](docs/reference-house/README.md) while developing it.

Next work should:

1. challenge the provisional **12.6 × 11.4 m** footprint for area/proportionality;
2. resolve stair/circulation/courtyard relationships;
3. coordinate structure and `RH-P005-*` crossings with an engineer;
4. develop passive-first environmental strategy against real orientation/openings;
5. turn selected-intent patterns into actual occurrences only when geometry supports them;
6. coordinate courtyard drainage/external maintenance without recreating the rejected Perimeter Dry Zone bundle;
7. feed prototype outcomes back into wall/floor/interface choices;
8. keep G-01 rules, courtyard project morphology and tectonic dialect distinguishable as the architecture develops.

Reference House use is never evidence for doctrine/pattern validity.

## C. External professional attack

High-value reviews:

- **structural engineer** — floor/interface propositions, Reference House structure, computational structural proof boundary;
- **building-control / fire practitioner** — boundary/fire/access assumptions, service-void/vertical-zone treatment, computational target interpretation;
- **building-services / ventilation engineer** — passive-first strategy, service geography, domestic vertical-zone proportionality and computational evidence boundary.

Negative findings are successful research outcomes.

## D. Publication development

The publication architecture is structurally correct. Remaining work is publication work rather than taxonomy repair:

1. develop Part III pages/figures around the canonical language;
2. develop Part IV from the evolving Reference House/current occurrence register;
3. standardise diagrams where graphics outperform prose;
4. close evidence/citation/glossary/back-matter gaps;
5. final proof after physical/professional findings land.

Specific architectural examples are welcome; their authority must remain clear.

## E. Targeted computational extensions — only when earned

The P0/PAT-XW line is no longer the default project workstream.

Possible fixtures remain available when another workstream exposes the corresponding uncertainty:

- `EXT-MAINT-01` — roof/facade maintenance geography;
- `RAIN-XW-01` — rainwater route;
- `KEX-XW-01` — kitchen source capture;
- `WATER-XW-01` — water failure / visible leakage / wet-service room;
- `ROOM-XW-01` — room service route + compartmented void;
- `OPEN-XW-01` — replaceable openings, movement and thresholds;
- `ATTACH-XW-01` — Controlled Attachment Plane + Replaceable Architectural Lining, ideally after W2 physical evidence.

Do not implement these in sequence for coverage. Select from actual evidence and uncertainty.

---

# Important unresolved risks

### R1 — physical quality

Replaceable walls/floors may work technically and still feel hollow, temporary or over-detailed.

### R2 — complexity / proportionality

Serviceability infrastructure can consume more space, money, carbon and maintenance than the future change it avoids.

### R3 — workmanship

A detail that works only under designer supervision fails the project.

### R4 — compiler externalisation

If most useful technical results become external-evidence requirements, the compiler risks degenerating into an evidence manager. P0 has shown the distinction can be represented; competent external evidence is still required to test whether it is useful in practice.

### R5 — passive environmental strategy

Passive-first is a hierarchy, not a predetermined system answer.

### R6 — publication drift

The repo can expand indefinitely. The monograph must select, compress and omit.

### R7 — pattern-language bureaucracy

The language/crosswalk work is complete. Resist accreting taxonomy or tooling around it unless a real design/maintenance problem appears.

### R8 — crosswalk authority leakage

`PAT-XW-01` passed the first executable authority-separation test. Preserve that architecture as new fixtures arrive; pattern provenance must never masquerade as regulation, engineering or product authority.

### R9 — worked-example authority drift

The Reference House is the project's dominant concrete example. Repetition can make its Georgian grammar, courtyard morphology, masonry family or tectonic dialect feel inevitable even when the canonical layers remain formally separate.

Control: **generalise the reason; localise the taste.** Use the architectural-specificity boundary when promoting any Reference House result upstream.

---

# Near-term project sequence

### Architectural / physical

**W2 wall-bay + structural floor-edge engineering + whole-house Reference House coordination → feed validated findings back into language/manuscript with evidence authority preserved**

### Professional validation

**structural + fire/building-control + building-services attack → record negative findings as evidence → revise only where findings require it**

### Pattern language

**Phases 0–8 closed → maintain canonical corpus/crosswalk; reopen only on evidence**

### Architectural specificity

**Audit closed → ordinary boundary rule only → reopen on demonstrated authority drift or second-grammar failure**

### Computational

**P0 PASS + PAT-XW-01 PASS → freeze generic growth → targeted fixture only when an architectural/physical/professional question earns one**

### Publication

**continue Part III/IV figures and integration in parallel → final proof after physical/professional findings land**

### Delivery

**populate implementation brief only when architecture/pattern/reference-house decisions are mature enough to become requirements**

---

# Status-maintenance rule

Update this file when a major workstream crosses maturity, new evidence changes the language/crosswalk, prototype/professional review changes a conclusion, Reference House reaches a new integration stage, the computational programme changes phase, or recommended next actions materially change.

Detailed TODOs live in track-specific control documents. This file should remain readable in a few minutes.