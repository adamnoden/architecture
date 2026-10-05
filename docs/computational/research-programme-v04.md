# Executable Architecture — Research Programme v0.4

**Status:** current programme-control layer — paper phase frozen  
**Date:** 2026-10-05  
**Inherits:** [v0.3](research-programme-v03.md), [v0.2](research-programme-v02.md) and every unresolved grand TODO from [v0.1](research-programme.md) unless explicitly superseded below  
**Implementation:** minimal falsification prototype may begin; heavy product implementation remains gated

## 1. Programme state

Completed internal paper sequence:

- S0 wall bay;
- S0 repeated/composed wall conditions;
- S1 complete room;
- S2 connected two-storey cluster;
- H1-PAPER complete bounded house;
- H1 whole-house mutation suite;
- final internal red team;
- post-H1 capability freeze.

Current controlling documents:

- [H1-PAPER research brief](h1-paper-research-brief.md);
- [corrected frozen H1 source](h1-paper-source-package.md);
- [H1-PAPER Run 01](h1-paper-compile-run-01.md);
- [H1 final internal red team](h1-paper-final-red-team.md);
- [H1 Capability Matrix v0.5](h1-capability-matrix-v05.md).

The major internal paper-compilation phase is now complete.

## 2. Programme decision

Do not create another paper integration scale merely because more detail exists.

Specifically, do not start:

- S3;
- H2-PAPER;
- a universal MEP ontology;
- a full product catalogue;
- a general regulations transcription;
- a speculative full solver architecture.

The next useful uncertainty is no longer:

> can we describe another ordinary house condition on paper?

It is:

> **does the model survive competent external attack and executable implementation?**

## 3. What H1 changed

H1 produced the first complete-house evidence for the central proposition.

It demonstrated on paper that:

- one semantic source can support architectural and technical analyses;
- contextual roles need not become flags on every entity;
- shared boundary/service/structural graphs can compose across a whole house;
- architectural validity and technical validity can diverge;
- external evidence can remain scoped;
- selective invalidation can remain local;
- unsupported conditions can be returned without guessing;
- maintenance can remain a first-class validity dimension;
- whole-house scale did not force uncontrolled family proliferation.

It also exposed a source-level geometric contradiction, proving that machine-enforced well-formedness must precede higher-order reasoning.

## 4. Grand TODO transition

The earlier registers remain authoritative history.

Current supersessions/additions:

| ID | TODO | Current status |
|---|---|---|
| C-032H | First complete H1 paper-house compile | **COMPLETE — research pass / release fail** |
| C-032J | Freeze pre-implementation paper research after H1 + red-team | **COMPLETE** |
| C-032F | Actual competent external review | **OPEN — now highest-priority non-code task** |
| C-014I3 | Hybrid ventilation H1 proof envelope | **TOPOLOGY/FEASIBILITY COMPLETE; competent house-level performance proof EXTERNAL** |
| C-014I4 | Hybrid vs CMEV/MVHR whole-house comparison | **EXTERNAL SERVICES/ENERGY WORK; not paper blocker** |
| C-019B | Controlled envelope penetration family | **COMPLETE — PEN-ENV-01** |
| C-020E | Wet-zone waterproofing family | **COMPLETE — WZ-BSM-01** |
| C-032I | Structured real external-evidence package | **COMPLETE at product/system scope** |
| C-037 | Machine-enforced source well-formedness / geometry consistency | **NEW — first prototype requirement** |
| C-038 | Minimal executable semantic/compiler vertical slice | **NEW — authorised next implementation task** |
| C-039 | External structural attack of H1/SAB-H1 | **NEW/OPEN** |
| C-040 | External building-control/fire/access attack of H1 | **NEW/OPEN** |
| C-041 | External building-services attack of hybrid/passive-first H1 strategy | **NEW/OPEN** |
| C-042 | Physical mock-up candidate: penetration/wet-zone/service-access interface | **NEW/OPEN** |
| C-043 | Rainwater family as implementation-extension test | **OPEN / not paper prerequisite** |
| C-044 | Cooking source-capture family as implementation-extension test | **OPEN / not paper prerequisite** |

No earlier open TODO disappears by omission.

## 5. Next phase — three evidence streams

The programme now splits deliberately.

### Stream A — competent external attack

Minimum reviewers:

1. structural engineer;
2. building-control/fire/regulatory practitioner;
3. building-services/ventilation engineer.

Their job is not to admire the concept.

Their job is to identify:

- incorrect applicability assumptions;
- missing ordinary obligations;
- bad evidence boundaries;
- hidden professional judgement;
- unsafe family simplifications;
- conditions that should not be made deterministic.

External review may force paper corrections.

That is acceptable.

It should not trigger another internal speculative scale by default.

### Stream B — minimal executable vertical slice

Purpose:

> **falsify the central semantic/compiler mechanism with code before choosing heavy CAD/product architecture.**

The prototype should implement only enough to prove or disprove:

- semantic identity;
- typed relationships;
- simple geometry/well-formedness;
- obligation generation;
- supported/unsupported states;
- evidence scope;
- dependency/invalidation;
- grouped diagnostics.

### Stream C — physical/product prototype

Select one small condition where the doctrine and evidence model meet real workmanship.

Strong candidates:

- controlled service penetration;
- wet-zone/drain/penetration interface;
- removable service lining/low-level service route;
- window/building interface.

The purpose is to expose tolerances, sequencing, access and inspection facts that digital paper work cannot.

## 6. Minimal executable prototype — allowed scope

The first implementation milestone is **not** the house application.

It is a semantic compiler kernel with deliberately crude geometry.

Suggested source subset:

- one storey/room or small S1-like cluster;
- external wall;
- window/opening;
- door/route;
- one service route or penetration;
- selected family/evidence references.

Required executable behaviours:

### P0-01 — identity

Stable IDs for source entities and relationships.

### P0-02 — deterministic well-formedness

At minimum:

- containment;
- non-overlap where forbidden;
- adjacency;
- opening-host relation;
- level/storey consistency.

H1 RT-01 makes this non-optional.

### P0-03 — contextual roles

One physical entity can carry several relationships without becoming several objects.

### P0-04 — obligation derivation

Relationships/family/target conditions generate obligations.

### P0-05 — status model

Keep separate:

- PASS;
- FAIL;
- UNRESOLVED;
- UNSUPPORTED;
- EXTERNALLY DISCHARGED.

Do not put RESOLVABLE inside this release lattice.

### P0-06 — evidence scope

Evidence item records:

- proposition;
- subject/scope;
- source/version;
- dependencies;
- result/status.

### P0-07 — selective invalidation

Mutation of one source fact stales only dependent obligations/evidence.

### P0-08 — diagnostics

Return building-meaningful messages rather than raw failed predicates.

Example:

> Bedroom escape capability lost because WIN-12 is now fixed. Weather/thermal window evidence remains current.

### P0-09 — unsupported domain

A deliberately unsupported mutation must return a clean unsupported result rather than guess.

### P0-10 — reproducibility

Compile result should be deterministic for a frozen source/target/evidence set.

## 7. What the first prototype must not contain

Do not start with:

- polished 3D editor;
- general B-rep/mesh modelling;
- general constraint solver;
- general structural solver;
- full regulations database;
- BIM/IFC authoring stack;
- automatic product search/substitution;
- cloud collaboration architecture;
- AI-generated compliance judgements;
- cost engine;
- production deployment.

Those choices create enormous path dependence.

They must wait until the compiler kernel proves useful.

## 8. Prototype success gate

The minimal executable slice succeeds only if it can reproduce several paper findings without manual orchestration.

At minimum:

1. create one semantic source;
2. derive obligations;
3. compile baseline;
4. mutate geometry/role/evidence;
5. invalidate only dependent results;
6. distinguish architecture/technical/evidence statuses;
7. explain the result intelligibly;
8. reject an unsupported condition cleanly.

If this requires extensive application scaffolding before the compiler mechanism can be tested, reconsider the architecture.

## 9. Prototype kill/weakening conditions

Weaken or stop the compiler thesis if early implementation shows:

- the relationship model is more complex than conventional BIM without delivering stronger results;
- geometry and semantics cannot remain synchronised without wholesale duplication;
- dependencies require manual annotation everywhere;
- most useful results are external/unresolved;
- diagnostic explanations cannot be traced deterministically;
- adding one ordinary family requires invasive schema change;
- authoring burden becomes specialist metadata entry;
- target/rule versioning becomes impossible to reproduce;
- the software needs a general CAD kernel before any compiler value appears.

## 10. External-review priority questions

### Structural

- Is SAB-H1-01 a credible proof boundary?
- Are load-path semantics sufficient to scope engineering evidence?
- Which structural judgements must remain external/human?
- Does H1 hide stability/foundation/opening interactions?

### Building control / fire / access

- Are target/applicability assumptions correct?
- Are Approved Documents being treated as guidance rather than law correctly?
- Is FIRE-H1-2S-EGRESS-01 missing ordinary dependencies?
- Are M4(1) scope/door/route semantics credible?
- What should never be auto-determined?

### Building services / ventilation

- Is passive-first hybrid topology credible for this bounded house class?
- What operating states must be modelled?
- Can low-pressure assist/passive residual behaviour be evidenced robustly?
- When should CMEV/MVHR win instead?
- Which inputs belong in the architectural source versus specialist model?

## 11. Paper-phase stop rule

From this point:

- paper corrections are allowed when external/prototype evidence exposes a defect;
- new paper family research is allowed only when it answers a concrete implementation/external-review failure;
- speculative expansion is not allowed as default progress.

This prevents the project retreating back into comfortable documentation work when harder evidence is available.

## 12. Current overall posture

### Architecture doctrine

Remains primary.

### Paper compiler research

**LOGICAL STOPPING POINT REACHED.**

### External validation

**REQUIRED / OPEN.**

### Minimal compiler implementation

**AUTHORISED AS FALSIFICATION PROTOTYPE.**

### Heavy compiler/CAD product build

**NOT YET AUTHORISED.**

The next phase must earn it.
