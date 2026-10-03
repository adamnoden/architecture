# Evidence and Provenance Architecture — Conceptual v0.1

**Status:** foundational research draft  
**Purpose:** define how a future compiled building can show its working, preserve the scope and origin of every material claim, plan evidence that can only be collected later, and invalidate stale conclusions when the building changes.  
**Implementation:** none.

> **A green result is only trustworthy if another person can discover what was claimed, why it applied, how it was established, what assumptions it depended on and which building version it describes.**

## 1. Evidence is part of the architecture

The computational proposition is not merely to run rules against a model.

It is to create a resolved building whose important claims are accompanied by an auditable chain of reasoning and evidence.

A house contains different kinds of truth:

- a stair width can be established geometrically;
- a beam may be justified by calculation;
- a wall assembly may rely on tested evidence;
- ground conditions may rely on site investigation;
- an installation may need inspection before closure;
- ventilation performance may only be known after commissioning;
- an unusual route may require professional judgement.

These are different epistemic acts.

The system should preserve the difference rather than reducing them all to one compliance Boolean.

## 2. Relationship to obligations

The existing validity model defines compilation as **obligation discharge**.

The evidence model makes that idea explicit:

~~~text
REQUIREMENT SOURCE
        ↓
RULE / INTERPRETATION
        ↓
APPLICABILITY DECISION
        ↓
OBLIGATION
        ↓
RESOLUTION METHOD
        ↓
EVIDENCE
        ↓
DETERMINATION
        ↓
COMPILE STATUS
~~~

Every arrow needs provenance.

## 3. Do not collapse source, rule, evidence and decision

### Requirement source

The authority or origin of a proposition.

Examples:

- legislation;
- Approved Document;
- British Standard;
- manufacturer system requirement;
- Long-Life House doctrine;
- G-01 architectural grammar;
- client brief.

### Rule implementation

The interpretation used by the compiler.

A source document and its computational implementation are different versioned things.

A bug may exist in a rule implementation even when the source requirement has not changed.

### Applicability decision

Why the rule applies to this entity/project.

Examples:

- this building is a new dwelling in England;
- this wall is part of the thermal envelope;
- this opening lies within structural family SF-01.

Applicability should itself be inspectable.

### Obligation

A proposition that must be resolved.

Example:

> Opening O17 requires adequate structural support under the applicable action set.

### Evidence

Information capable of supporting or resolving that proposition within a declared scope.

### Determination

The result produced by applying the accepted method to the evidence.

Evidence does not magically pass itself.

A method determines whether that evidence is sufficient for this obligation.

## 4. Evidence item model

Every significant evidence item should conceptually carry:

- stable ID;
- evidence class;
- subject(s);
- proposition(s) supported;
- producer / origin;
- creation date;
- method;
- source artifact;
- building/model version;
- target/rule-pack version where relevant;
- parameter scope;
- geometric scope;
- lifecycle phase;
- assumptions;
- dependencies;
- validity period if relevant;
- supersession state;
- acceptance state;
- rights/licensing/access metadata where relevant.

No storage format is implied.

## 5. Evidence classes

### E1 — semantic inference

Produced directly from the semantic model.

Example:

- no routine electrical route crosses a prohibited permanent-fabric zone.

### E2 — geometric query

Examples:

- clear width;
- bearing length;
- maintenance clearance;
- opening area.

### E3 — engineering calculation

Examples:

- beam utilisation;
- thermal transmittance;
- ventilation sizing;
- drainage calculation.

Must preserve method, inputs, units, assumptions, parameters, implementation version and output.

### E4 — bounded design table / verified envelope

Example:

- member or lintel selection from a verified family within a declared span/loading range.

The evidence must state the envelope.

### E5 — tested assembly / classification

Examples:

- fire-resistance test;
- acoustic test;
- weather test.

Preserve the tested construction and permitted field of application.

### E6 — product declaration / manufacturer evidence

Examples:

- thermal property;
- dimensional tolerance;
- load rating;
- installation requirements.

A product declaration does not automatically prove an arbitrary assembly containing that product.

### E7 — site / survey evidence

Examples:

- topographic survey;
- ground investigation;
- existing-building survey.

### E8 — inspection evidence

Examples:

- measured bearing before closure;
- photograph of cavity/fire-stop condition;
- installed fixing spacing;
- product identity.

### E9 — commissioning / test evidence

Examples:

- air-tightness;
- ventilation flow;
- electrical test;
- functional water test.

### E10 — external professional determination

Examples:

- structural engineer accepts an out-of-domain connection;
- fire engineer supplies a specialist strategy;
- competent reviewer accepts an alternative solution.

The exact proposition determined and scope must be recorded.

### E11 — statutory / regulatory decision

Examples:

- building control approval;
- completion certificate;
- planning decision where relevant.

A regulatory decision is evidence about a legal process.

It is not the same thing as native compiler proof.

## 6. Evidence scope is fundamental

Evidence must answer:

> **What exactly does this establish?**

Potential scope dimensions:

- entity;
- assembly family;
- occurrence;
- geometry;
- dimensions;
- loading;
- material;
- environment;
- installation condition;
- target version;
- lifecycle phase.

For example:

~~~text
Test T-004
applies to:
  wall family WF-03
  height <= H
  stud spacing = S
  board family = B
  fixing pattern = F
  penetration condition = P
~~~

Changing a scoped parameter may invalidate the inheritance.

This is why evidence cannot be stored as a field such as wall-is-fire-safe = true.

## 7. Family evidence and occurrence evidence

The system should distinguish:

### Family-level evidence

Evidence applies to a reusable design envelope.

Examples:

- tested wall assembly;
- engineered joist table;
- certified window family.

### Occurrence-level evidence

Evidence applies to a particular installed instance.

Examples:

- this wall used the specified board;
- this beam has the required bearing;
- this fire stop was inspected before closure.

A future compiled house may therefore reason:

~~~text
FAMILY WF-03
  performance evidence: PASS

OCCURRENCE W-114
  geometry inside family envelope: PASS
  selected materials match family: PASS
  installation inspection: PLANNED at hold point HP-17

current phase:
  DESIGN RELEASE = PASS
  PHYSICAL CONFORMANCE = NOT YET DUE
~~~

## 8. Time-phased obligations

A major refinement is that evidence has a lifecycle.

At design stage, some obligations cannot yet be physically evidenced.

Every obligation should therefore carry a **due phase**.

Candidate phases:

- CONCEPT;
- COORDINATED DESIGN;
- TECHNICAL DESIGN;
- PRE-MANUFACTURE;
- PRE-CLOSURE;
- INSTALLATION;
- COMMISSIONING;
- COMPLETION;
- IN-USE;
- ALTERATION.

### Due-now obligation

Must be discharged before the current release can pass.

### Future evidence obligation

The method is known, but the evidence can only be generated later.

Example:

> verify backplane fixing installation before lining closure.

A design release can pass if:

- the future obligation is explicitly planned;
- the evidence method is defined;
- responsible party is defined;
- hold point / due phase is defined;
- failure response is defined.

This turns compilation into an **evidence plan for construction**, not merely a design report.

## 9. Evidence plans

A compiled technical design should be capable of outputting an evidence plan.

| Obligation | Evidence required | Due phase | Responsible party | Hold point | Failure response |
|---|---|---|---|---|---|
| INT-017 | measure panel datum after backplane adjustment | pre-closure | installer / inspector | HP-12 | remediate before lining |
| STR-044 | verify beam bearing | pre-closure | contractor | HP-21 | stop / engineer review |
| VENT-012 | measured extract flow | commissioning | commissioning engineer | CP-03 | rebalance / rectify |
| PROD-008 | product identity | installation | contractor | — | reject substitution |

The table is illustrative.

The important concept is:

> **future proof obligations become explicit construction tasks.**

This aligns directly with the existing workmanship-robustness and hold-point doctrine.

## 10. Evidence states

Evidence should have its own state independent of obligation result.

### PLANNED
Required later; method, owner and due phase are defined.

### PRESENT
Artifact/data exists but has not yet been validated for this obligation.

### ACCEPTED
Evidence has been checked as applicable and sufficient for the method.

### REJECTED
Evidence exists but does not satisfy scope/quality requirements.

### STALE
A dependency changed and the evidence must be regenerated or re-evaluated.

### SUPERSEDED
A newer accepted item replaces it; history remains.

### WITHDRAWN
The evidence source/product/certification has been formally withdrawn where that distinction matters.

This allows the system to explain why an old calculation remains stored but no longer governs the release.

## 11. Dependency and invalidation

Evidence must know what it depends on.

~~~text
CALC-221 Beam B14
depends on:
  geometry G-B14-V3
  loading LOADSET-04
  material MAT-S275
  support SUP-W12
  target parameters NA-ENG-01
~~~

If a design change alters SUP-W12:

~~~text
SUP-W12 changed
   ↓
CALC-221 becomes STALE
   ↓
STR-044 becomes UNRESOLVED
   ↓
release status changes
~~~

The old calculation is not deleted.

It becomes historical evidence for the earlier building version.

This is the conceptual foundation of incremental recompilation.

## 12. Assumptions are dependencies

An assumption should never live only in narrative notes.

~~~text
ASSUMPTION GEO-004
ground bearing capacity = X
basis = preliminary desktop assumption
status = provisional
must be replaced by = site investigation
due phase = TECHNICAL DESIGN
~~~

Any result depending on GEO-004 inherits the provisional condition.

When real site evidence replaces the assumption:

- compare actual value;
- invalidate dependent evidence where necessary;
- recompile.

## 13. Rule provenance and applicability provenance

Every machine rule should be traceable through:

~~~text
machine rule ID
   ↓
rule implementation version
   ↓
interpretation record
   ↓
source requirement / guidance / standard
   ↓
source version / date
~~~

Where a source is copyrighted, provenance can reference it without reproducing protected text.

The system should also preserve **why a rule ran**.

Example:

~~~text
RULE STAIR-017 applies because:
  target = England.NewDwelling.T-2026-A
  entity = Stair ST-01
  use = private dwelling stair
  condition C1 = true
  exception E4 = false
~~~

A NOT-APPLICABLE result should also retain its reason.

## 14. Human judgement provenance

Some conditions cannot legitimately be reduced to deterministic logic.

When a competent person makes a determination, preserve:

- person/role/organisation;
- competence basis where relevant;
- exact proposition determined;
- material reviewed;
- assumptions;
- date;
- scope;
- limitations;
- changes that trigger re-review.

Avoid a vague record such as “engineer approved”.

Prefer a scoped determination tied to a calculation, geometry and load/material state.

## 15. Evidence strength is not a fake probability

The project should resist invented percentages such as “97% compliant” unless a real probabilistic method justifies them.

Prefer explicit characteristics:

- direct / indirect;
- native / external;
- family / occurrence;
- current / stale;
- complete / incomplete;
- within / outside scope;
- design / physical;
- deterministic / judgement-based.

## 16. Design evidence and physical evidence

### Design evidence

Supports claims about the proposed/resolved model.

Examples:

- structural calculation;
- geometry;
- specification;
- product selection.

### Physical-conformance evidence

Supports claims that the built thing corresponds to the design.

Examples:

- installed product identity;
- measured dimension;
- photograph;
- inspection;
- test;
- commissioning.

### In-use evidence

Supports later stewardship.

Examples:

- maintenance record;
- replacement;
- inspection;
- failure event;
- measured performance where collected.

One building record can eventually contain all three without pretending they are interchangeable.

## 17. Change control

A building change should be a first-class event.

~~~text
CHANGE C-017
from model V23
to model V24

changed:
  Opening O17 width
  Window WIN-17 family

impact:
  grammar obligation G-114          re-evaluate
  structural obligation STR-044     stale
  thermal obligation TH-017         stale
  quantity Q-022                    regenerate
  rainwater detail WT-008           unchanged
~~~

The dependency graph, rather than memory, determines which evidence is affected.

## 18. Regulatory precedent — use carefully

England's higher-risk-building regime provides a useful information-management precedent.

Government guidance requires relevant projects to maintain digital building information, use version control, record controlled changes and keep evidence showing how building work complies. Building-control application guidance also calls for:

- a building-regulations compliance statement;
- referenced drawings and plans;
- a change-control plan and log;
- a construction-control plan;
- a list of expected construction evidence;
- as-built evidence for completion.

This maps surprisingly well to the proposed evidence graph.

But the initial Long-Life House domain is an ordinary low-rise dwelling.

Therefore:

> **higher-risk-building golden-thread duties are precedent for rigorous information architecture, not legal requirements we may falsely impose on every house.**

The project may voluntarily adopt analogous discipline because it is useful.

## 19. Evidence graph versus document folder

A folder may contain:

- structural PDF;
- drawings;
- product certificates;
- photos;
- commissioning reports.

Without explicit relationships, a future owner cannot easily know:

- which entity each file supports;
- which model version it refers to;
- whether the product was substituted;
- whether the geometry changed;
- whether the evidence still applies.

Documents can remain ordinary files.

The evidence graph supplies semantic context.

## 20. Evidence granularity and sampling

Do not create one obligation per screw.

Evidence granularity should be proportionate to:

- consequence;
- repeatability;
- replaceability;
- difficulty of later inspection;
- extent of evidence reuse.

Possible scopes:

- building;
- system;
- assembly family;
- representative sample;
- occurrence;
- critical interface.

Repeated work may use:

- type testing;
- first article;
- representative-installer trial;
- sample inspection;
- 100% inspection for critical conditions.

The evidence plan should state the strategy rather than pretending every occurrence was individually verified.

## 21. Workmanship robustness becomes auditable

A tolerance strategy already asks:

- incoming condition;
- datum;
- adjustment;
- remediation threshold;
- verification.

The evidence architecture adds:

- who verifies;
- when;
- what artifact is retained;
- which obligation it discharges;
- which building occurrence/version it describes.

Thus:

> **workmanship robustness becomes auditable without becoming bureaucratic theatre.**

The aim is the smallest evidence set that proves the things worth proving.

## 22. Building record views

At handover, one evidence graph could generate different views.

### Occupant view
Isolation, maintenance, replacement and emergency information.

### Trade view
Service routes, component IDs, access/replacement method and compatible replacements.

### Professional view
Calculations, boundary/interface records, assumptions, deviations and evidence scope.

### Regulatory/submission view
Requirement-by-requirement compliance statement, referenced drawings, standards, decisions and inspection/commissioning results.

Different audiences receive different projections of one building identity.

## 23. Building release manifest

Every significant release should produce a compact manifest.

~~~text
BUILD RELEASE BR-00023

source model
  HOUSE-MODEL-V23

compiler target
  T-ENG-NDW-2026-A

supported domain
  DOMAIN-HOUSE-01

architectural grammar
  G-01.3

doctrine profile
  LLH-01

rule packs
  structure: RP-STR-04
  regulation: RP-REG-09
  grammar: RP-G01-03

evidence set
  EVSET-23

due-now obligations
  failed: 0
  unresolved: 0
  unsupported-as-proven: 0

future evidence obligations
  planned: 17
  overdue: 0

external determinations
  2

warnings
  4
~~~

Exact fields remain open.

## 24. Reproducibility and integrity

Given the same:

- source model;
- compiler version;
- target;
- rule packs;
- input datasets;
- accepted external evidence;

the deterministic portions of compilation should reproduce the same result.

Future implementation may use hashes, signatures or append-only logs.

Do not design those mechanisms yet.

The conceptual requirement is:

> **a released evidence bundle should make silent mutation detectable.**

## 25. Evidence retention and access

Do not delete evidence merely because it becomes stale.

Historical evidence helps explain:

- prior building versions;
- why a change was made;
- what was believed at the time;
- maintenance and alteration history.

Some evidence may also be copyrighted, confidential, personal or safety-sensitive.

The model therefore needs separate metadata for:

- technical existence;
- storage location;
- access;
- rights;
- identity/hash/reference.

Traceability should survive even when the artifact cannot be openly redistributed.

## 26. Anti-drift rules

Reject the following.

- **“Upload the structural PDF and tick complete.”**  
  Evidence must be related to subjects, obligations, versions and scope.

- **“Approval means the compiler proved it.”**  
  Regulatory decision and native proof are distinct evidence classes.

- **“The product certificate proves the wall.”**  
  Only if the assembly and parameter scope actually match.

- **“We will inspect it later.”**  
  Future evidence needs method, owner, due phase and failure response.

- **“Every future inspection blocks design release.”**  
  Time-phased evidence distinguishes due-now from planned-later proof.

- **“Keep only the latest report.”**  
  Preserve superseded evidence and its building version.

- **“Nothing important changed, so the old calculation is fine.”**  
  The dependency graph decides.

- **“Golden-thread duties apply to every house.”**  
  No. We borrow useful information discipline voluntarily unless the legal regime actually applies.

- **“More evidence is always safer.”**  
  No. Evidence should be proportionate, legible and useful.

## 27. Open questions

- What minimum evidence graph is enough for an ordinary house without administrative overload?
- Which evidence can be generated automatically?
- Which should be externally signed?
- How should external evidence be accepted/governed?
- What does evidence inheritance across an assembly family formally require?
- How should probabilistic geotechnical/material evidence be represented?
- When does a change make evidence STALE versus definitely INVALID?
- How should sampling plans be represented?
- Which site inspections are worth making mandatory for a low-rise house?
- How can the record remain readable if the original software disappears?
- What open export format can preserve the evidence graph?
- How should contested regulatory interpretations be recorded?
- How should target migration affect historical evidence?

## 28. Immediate validation

Do not elaborate the ontology indefinitely.

Test it during the first paper compilation.

For one Reference House wall/window/floor slice:

1. generate obligations;
2. identify the evidence method for each;
3. assign due phase;
4. distinguish native from external evidence;
5. create a small dependency graph;
6. mutate one input;
7. verify the correct evidence becomes stale;
8. generate a release manifest.

If this is harder to understand than reviewing the building manually, simplify it.

---

## External anchors

- Building Safety Regulator, **Keeping information about a higher-risk building: the golden thread**: https://www.gov.uk/guidance/keeping-information-about-a-higher-risk-building-the-golden-thread
- Building Safety Regulator, **Preparing information for a building control approval application**: https://www.gov.uk/guidance/preparing-information-for-a-building-control-approval-application
- Building Safety Regulator, **Making changes to a higher-risk building project**: https://www.gov.uk/guidance/making-changes-to-a-higher-risk-building-project
- Building Regulations Advisory Committee, **Golden thread report**: https://www.gov.uk/government/publications/building-regulations-advisory-committee-golden-thread-report/building-regulations-advisory-committee-golden-thread-report
- Purushotham, Kailashnath & Mutis, **Framework for automated building code compliance checking to improve transparency, trust, validation, and design interpretation**, *Automation in Construction* 181 (2026), 106598: https://doi.org/10.1016/j.autcon.2025.106598
