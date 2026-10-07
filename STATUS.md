# Project Status

**Canonical project-wide status overview**  
**Last updated:** 2026-10-07  
**Current phase:** **convergence → validation**

This file answers one question:

> **Where is the House Systems Architecture project actually at?**

It is intentionally higher-level than the detailed research programmes, integration registers and track-specific TODOs.

The project is no longer primarily in open-ended doctrine discovery. The central architectural position is established. The current work is to complete the publication, coordinate the reference house, physically and professionally test the non-standard propositions, and begin only the smallest computational implementation justified by the completed paper research.

---

## Maturity scale

The maturity level below is not a percentage of words written.

| Level | Meaning |
|---|---|
| **L0 — Not started** | identified but materially undeveloped |
| **L1 — Framed** | scope/question defined; little resolved work |
| **L2 — Developed** | substantial content/design exists; important gaps remain |
| **L3 — Coordinated** | internally coherent across adjacent project concerns; ready for serious testing/editorial hardening |
| **L4 — Internally validated / frozen** | current internal research question has been answered; further progress requires a qualitatively different evidence source |
| **L5 — Externally validated / release-ready** | competent external/physical validation complete for the stated scope |

A frozen source document can be L4 even though the publication derived from it is unfinished. A computational concept can be L4 at paper-research scope while the software implementation remains L0/L1.

---

# Executive status

| Workstream | Maturity | Current state | Next meaningful gate |
|---|---:|---|---|
| **Original doctrine / source corpus** | **L4** | House Design Doctrine v7 is preserved as source material; it should not be rewritten in place | maintain traceability while publication supersedes raw source prose |
| **Public architectural position / governing principles** | **L3** | core thesis, selective permanence, tectonic honesty, workmanship robustness, repose and passive-first hierarchy are established; editorial overhaul complete on `editorial-overhaul` | evidence/figure hardening and later final proof in publication context |
| **Publication architecture** | **L3** | monograph + pattern catalogue + separate implementation brief structure is established | complete missing publication content, graphic system and back matter |
| **Preface** | **L3** | full editorial rewrite complete on `editorial-overhaul`; authorial/historical voice retained with reduced rhetorical density | final proof against completed book and citation presentation |
| **Part I — The Proposition** | **L3** | substantial evidence-backed draft; editorial overhaul complete | diagrams, evidence presentation and whole-book integration |
| **Part II — Architecture of the Platform** | **L3** | core interface/failure/maintenance/tolerance argument is coordinated and editorially hardened | complete figures and any remaining evidence/technical integration |
| **Part III — Pattern Catalogue** | **L2** | core patterns and experimental candidates exist and have received an editorial consistency pass, but the planned catalogue is not complete | finish strongest patterns; keep experimental systems out until prototypes justify promotion |
| **Part IV — Reference House** | **L2** | tectonic language, one coordinated vertical bay and A/B/C option study exist; no complete reference-house design yet | expand to a complete worked house and use it to expose cross-system conflicts |
| **Part V — Making and Testing** | **L3** | substantial draft and validation philosophy exist; editorial overhaul complete | align with actual prototype/engineering results as they arrive |
| **Evidence / precedent research** | **L3** | several deep evidence packages exist; coverage is strong but uneven across the eventual book | continue claim-by-claim hardening as chapters/patterns approach publication |
| **Candidate reversible assemblies** | **L3** | four major candidates have survived first-principles/evidence hardening in constrained forms | structural engineering + 1:1 physical testing + conventional comparators |
| **Physical prototype programme** | **L1–L2** | programme, acceptance criteria, W2 wall-bay build pack and drawings exist; no recorded physical validation yet | build/test P01 wall bay; engineer/test P03 floor edge; then P02 floor platform/P04 joint |
| **Reference-house structural/technical design** | **L1** | baseline systems and one vertical coordination condition exist, but no complete engineered house | competent structural/building-physics/services coordination on worked reference house |
| **Computational paper research** | **L4** | S0→S1→S2→H1 whole-house paper sequence, mutations, red team and capability freeze complete | **stop major paper expansion** |
| **Computational external validation** | **L1** | adversarial review pack exists; review has not occurred | structural + fire/building-control + building-services review |
| **Compiler software implementation** | **L1** | minimal vertical slice is authorised; heavy implementation is not | source model → geometric well-formedness → obligations → evidence → selective invalidation → useful errors |
| **Architect-facing delivery / RIBA brief** | **L2** | strong implementation-brief template exists and has received a controlled editorial pass | populate only as patterns/reference-house decisions become mature project requirements |
| **Publication graphics / drawing language** | **L1–L2** | several useful SVGs exist, including repose and vertical-bay material | establish a consistent drawing/figure system and replace remaining prose/ASCII where diagrams carry the idea better |

---

# What is genuinely complete enough to stop working on for now

## 1. Raw doctrine discovery

The project has enough governing ideas.

Do **not** respond to every new design question by inventing another doctrine principle. New findings should normally:

- refine an existing principle;
- become a pattern;
- become a reference-house decision;
- become a test/evidence requirement;
- or be rejected as unnecessary complexity.

## 2. Computational paper-compilation research

The internal paper sequence is complete through a whole bounded house.

Canonical control:

- `docs/computational/research-programme-v05.md`
- `docs/computational/h1-capability-matrix-v05.md`
- `docs/computational/h1-paper-final-red-team.md`
- `docs/computational/external-review-pack-h1-paper-v02.md`

The next computational information must come from:

1. competent external attack;
2. a minimal executable prototype;
3. physical/product evidence.

Do **not** create another large paper scale, speculative ontology, full regulations transcription or general solver architecture first.

## 3. Repo-wide prose migration

The controlled editorial overhaul is complete on `editorial-overhaul` across the public manuscript, patterns, reference-house explainers, delivery/prototype material and canonical computational explainers.

The migration deliberately did **not** rewrite frozen source, research syntheses, historical computational runs or evidence records. Those remain provenance.

Further prose work should now be local and evidence-driven rather than another global style pass.

---

# Highest-value unfinished work

## A. Physical / engineering validation of the architecture

This is currently the largest gap between an intellectually coherent doctrine and a credible building system.

Immediate candidates already have explicit gates:

1. **P01 wall bay / Architectural Backplane + Replaceable Wall Lining**  
   Build the existing W2 pack at 1:1, against a conventional plaster control, including deliberately imperfect background geometry and an installer who did not design the system.

2. **P03 structural floor edge / Seated Floor Structure**  
   Structural-engineer comparison of certified restraint hanger, direct bearing + separate restraint, and any custom seated challenger. Novelty must demonstrate an actual advantage.

3. **P02 finish-agnostic floor platform**  
   Walkable multi-panel test with timber/tile/stone-like finishes and a local-access-band comparator. Acoustic/tactile solidity is a hard acceptance criterion.

4. **P04 wall/ceiling tectonic joint**  
   Test conventional quiet joint versus mechanically honest/removable alternatives.

The physical programme is defined in `docs/development/tectonic-prototype-programme.md`.

## B. Complete the reference house

The reference house must become more than isolated detail research.

Current assets:

- tectonic architectural language;
- complete vertical-bay coordination;
- vertical-bay A/B/C option appraisal.

Next work should coordinate one complete ordinary house across:

- architectural order;
- permanent/changeable assembly hierarchy;
- maintenance geography;
- structure;
- water/failure management;
- passive-first environmental strategy;
- service access;
- openings/thresholds;
- roof/external maintenance;
- selected prototype outcomes.

The reference house remains **one worked interpretation**, never the evidence for the doctrine itself.

## C. Finish the publication as a publication

The global prose migration is no longer the main publication task. The remaining work is more architectural and editorially specific:

1. finish the pattern catalogue to the level actually justified by evidence;
2. develop Part IV from the completed reference-house work;
3. add/standardise diagrams and figure language where graphics explain better than prose;
4. close remaining evidence, citation, glossary and back-matter gaps;
5. perform a final proof only after the missing content and physical/professional findings have landed.

The publication should remain an architectural work, not become a software pitch.

## D. External professional attack

Three reviews would now create disproportionately valuable information:

- **structural engineer** — reversible/seated floor proposition, support/restraint semantics, reference-house structure and computational structural proof boundary;
- **building-control / fire practitioner** — boundary/fire/access assumptions and computational target/rule interpretation;
- **building-services / ventilation engineer** — passive-first/hybrid ventilation strategy, service geography and computational evidence boundary.

Negative findings are successful research outcomes.

## E. Minimal compiler kernel

The software track is now allowed to begin, but only as a falsification instrument.

The first vertical slice should demonstrate:

1. semantic source identities and relationships;
2. deterministic geometric/source well-formedness;
3. derived obligations;
4. scoped evidence objects;
5. selective invalidation after change;
6. supported/unsupported distinction;
7. intelligible author-facing errors.

Do not begin with polished CAD, IFC round-tripping, general structural solving, a complete regulations engine or a Sims-like UI.

---

# Important unresolved risks

These are not ordinary TODOs; they can change the project direction.

### R1 — physical quality risk

Replaceable walls/floors may calculate correctly and still feel hollow, temporary, noisy or over-detailed. The house loses if maintainability destroys repose or solidity.

### R2 — complexity / proportionality risk

The doctrine can become self-defeating if serviceability infrastructure costs more space, money, carbon and maintenance than the future change it avoids.

### R3 — workmanship risk

A detail that only works when its designer supervises assembly has failed the project. Prototype trials must include ordinary competent installers and representative dimensional variation.

### R4 — compiler externalisation risk

If nearly every meaningful technical result becomes `EXTERNAL_EVIDENCE_REQUIRED`, the software proposition weakens into an evidence manager. The executable prototype must demonstrate real native value.

### R5 — passive environmental strategy risk

Passive-first is the governing hierarchy, not a predetermined system result. Hybrid stack, CMEV, MVHR or another supported route must be selected by actual project evidence rather than doctrine purity.

### R6 — publication drift risk

The research repo can expand indefinitely. The monograph must eventually select, compress and omit. Not every useful research document belongs in the publication.

---

# Near-term project sequence

This is the current recommended order, not a rigid schedule.

### Architectural / physical track

**prototype + engineer → complete reference house → feed results back into patterns/manuscript → final publication proof**

### Computational track

**external review + minimal executable kernel → reassess thesis → only then decide whether heavy compiler/CAD work is justified**

### Delivery track

**populate RIBA implementation brief only when a doctrine/pattern/reference-house decision is mature enough to become a real project requirement**

These tracks should inform one another, but none should be allowed to block all progress elsewhere.

---

# Status-maintenance rule

This file is the canonical high-level project state.

Update it when any of the following happens:

- a major workstream crosses a maturity level;
- a candidate pattern is promoted, held or rejected;
- a prototype or competent external review materially changes a conclusion;
- the reference house reaches a new integration stage;
- the computational programme changes phase;
- the publication architecture changes materially;
- the recommended next three-to-five project actions change.

Detailed TODOs remain in their track-specific control documents. This file should stay short enough that a returning collaborator can understand the state of the entire project in a few minutes.