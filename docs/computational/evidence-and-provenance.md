# Evidence and Provenance Architecture — Conceptual v0.2

**Status:** foundational research draft  
**Purpose:** define how compiled claims retain origin, scope, lifecycle and invalidation  
**Implementation:** none

A green result is useful only if another person can answer: **what was claimed, why did it apply, how was it established, what did it depend on, and which building version does it describe?**

## 1. Different claims need different evidence

A stair width may be established by geometry. A beam may need calculation. A wall may rely on tested evidence. Ground conditions come from investigation. Installation quality may require inspection before closure. Ventilation performance may not be known until commissioning.

These are different epistemic acts. The system should preserve that difference rather than flattening them into one compliance Boolean.

## 2. Evidence sits inside obligation discharge

The validity model defines compilation as obligation discharge. The evidence model makes the chain inspectable:

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

Each transition needs provenance.

## 3. Keep source, rule, evidence and decision separate

### Requirement source
The authority or origin: legislation, Approved Document, standard, manufacturer requirement, Long-Life House doctrine, architectural grammar or client brief.

### Rule implementation
The compiler's versioned interpretation of that source. A rule implementation can contain a bug even when the source has not changed.

### Applicability decision
Why the rule applies to this project/entity. Applicability itself should be inspectable.

### Obligation
The proposition that must be resolved.

### Evidence
Information capable of supporting the proposition within a declared scope.

### Determination
The result of applying the accepted method to the evidence.

Evidence does not pass itself; a method determines whether it is sufficient for this obligation.

## 4. Conceptual evidence record

A significant evidence item should carry, where relevant:

- stable ID and class;
- subject(s) and propositions supported;
- producer/origin and creation date;
- method and source artefact;
- building/model version;
- target/rule-pack version;
- parameter, geometry and lifecycle scope;
- assumptions and dependencies;
- validity period where relevant;
- supersession and acceptance state;
- rights/licensing/access metadata.

No storage format is implied.

## 5. Evidence classes

### E1 — Semantic inference
Derived directly from model relationships.

### E2 — Geometric query
Clearance, width, bearing length, opening area or other deterministic geometry.

### E3 — Engineering calculation
Structural, thermal, ventilation, drainage or similar calculation. Preserve method, inputs, units, assumptions, parameters, implementation version and output.

### E4 — Bounded design table / verified envelope
A family selection valid only inside a declared parameter range.

### E5 — Tested assembly / classification
Fire, acoustic, weather or other tested system. Preserve construction and permitted field of application.

### E6 — Product / manufacturer evidence
Declared properties, ratings and installation requirements. Product evidence does not automatically prove an arbitrary assembly containing the product.

### E7 — Site / survey evidence
Topographic survey, ground investigation, existing-building survey.

### E8 — Inspection evidence
Measured bearing, concealed-work photograph, fixing spacing, installed product identity.

### E9 — Commissioning / test evidence
Airtightness, ventilation flow, electrical test, functional water test and similar completion evidence.

### E10 — External professional determination
A competent person resolves a proposition outside native compiler authority. Record the exact proposition and scope.

### E11 — Statutory / regulatory decision
Approval, certificate or planning decision where relevant. This is evidence about a legal process, not native compiler proof.

## 6. Scope is part of the evidence

Every evidence item must answer **what exactly does this establish?**

Scope may depend on entity, family, occurrence, geometry, dimensions, loading, material, environment, installation condition, target version and lifecycle phase.

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

Change a scoped parameter and inheritance may disappear. This is why `wall-is-fire-safe = true` is an inadequate evidence model.

## 7. Family versus occurrence evidence

**Family-level evidence** supports a reusable design envelope: a tested wall assembly, engineered joist table or certified window family.

**Occurrence-level evidence** supports a particular installed instance: the specified board was actually installed, bearing was measured, the fire stop was inspected.

A future release may therefore say:

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

## 8. Evidence has a lifecycle

Some evidence cannot exist at design stage. Every obligation therefore needs a **due phase**.

Candidate phases:

`CONCEPT` / `COORDINATED DESIGN` / `TECHNICAL DESIGN` / `PRE-MANUFACTURE` / `PRE-CLOSURE` / `INSTALLATION` / `COMMISSIONING` / `COMPLETION` / `IN-USE` / `ALTERATION`

A **due-now** obligation blocks the current release if unresolved.

A **future evidence obligation** is legitimate when method, owner, due phase/hold point and failure response are already defined.

This lets compilation produce an evidence plan for construction rather than pretending design-stage information can prove future workmanship.

## 9. Evidence plan

A technical-design compile should be able to produce something like:

| Obligation | Evidence required | Due phase | Responsible party | Hold point | Failure response |
|---|---|---|---|---|---|
| INT-017 | measure panel datum after adjustment | pre-closure | installer / inspector | HP-12 | remediate before lining |
| STR-044 | verify beam bearing | pre-closure | contractor | HP-21 | stop / engineer review |
| VENT-012 | measured extract flow | commissioning | commissioning engineer | CP-03 | rebalance / rectify |
| PROD-008 | product identity | installation | contractor | — | reject substitution |

Future proof obligations become explicit construction tasks.

## 10. Evidence states

Evidence state is independent of obligation result.

- **PLANNED** — required later; method, owner and phase known.
- **PRESENT** — artefact exists but has not been accepted for this obligation.
- **ACCEPTED** — checked as applicable and sufficient.
- **REJECTED** — exists but does not satisfy scope/quality requirements.
- **STALE** — a dependency changed; re-evaluation required.
- **SUPERSEDED** — replaced by newer accepted evidence but retained historically.
- **WITHDRAWN** — source/product/certification formally withdrawn where relevant.

An old calculation may therefore remain stored without governing the current release.

## 11. Dependencies and invalidation

Evidence should declare the facts it depends on.

~~~text
CALC-221 Beam B14
depends on:
  geometry G-B14-V3
  loading LOADSET-04
  material MAT-S275
  support SUP-W12
  target parameters NA-ENG-01
~~~

If `SUP-W12` changes:

~~~text
SUP-W12 changed
   ↓
CALC-221 becomes STALE
   ↓
STR-044 becomes UNRESOLVED
   ↓
release status changes
~~~

The old calculation remains historical evidence for the earlier building version. This is the basis of incremental recompilation.

## 12. Assumptions are dependencies too

Assumptions should be structured facts rather than narrative caveats.

~~~text
ASSUMPTION GEO-004
ground bearing capacity = X
basis = preliminary desktop assumption
status = provisional
must be replaced by = site investigation
due phase = TECHNICAL DESIGN
~~~

Dependent results inherit that provisional status. When real evidence replaces the assumption, compare the value, invalidate affected evidence and recompile.

## 13. Rule and applicability provenance

A machine rule should be traceable through:

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

Copyrighted sources can be referenced without reproducing protected text.

Also retain **why the rule ran**:

~~~text
RULE STAIR-017 applies because:
  target = England.NewDwelling.T-2026-A
  entity = Stair ST-01
  use = private dwelling stair
  condition C1 = true
  exception E4 = false
~~~

`NOT APPLICABLE` should carry the same kind of explanation.

## 14. Human judgement provenance

Where a competent person determines a proposition, record:

- person/role/organisation;
- competence basis where relevant;
- exact proposition;
- material reviewed;
- assumptions;
- date and scope;
- limitations;
- changes requiring re-review.

“Engineer approved” is not enough. The determination should be tied to the state it actually covers.

## 15. Do not fake evidence strength

Avoid invented percentages such as “97% compliant” without a real probabilistic method.

Prefer explicit attributes: direct/indirect, native/external, family/occurrence, current/stale, complete/incomplete, within/outside scope, design/physical, deterministic/judgement-based.

## 16. Design, physical and in-use evidence

**Design evidence** supports the resolved model: geometry, calculations, specification, product selection.

**Physical-conformance evidence** supports the claim that construction corresponds to that model: identity, measurement, inspection, test and commissioning.

**In-use evidence** records later stewardship: maintenance, replacement, failure and measured performance.

One building record can contain all three without treating them as interchangeable.

## 17. Change control

A change should be a first-class event whose impact is derived from dependencies.

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

The dependency graph, not memory, decides what must be revisited.

## 18. Regulatory precedent, carefully bounded

England's higher-risk-building regime is useful precedent for information architecture: digital records, version control, controlled change, compliance evidence, construction control and as-built records.

The initial Long-Life House domain is an ordinary low-rise dwelling. Those higher-risk-building duties must not be presented as legal requirements for it.

The project may adopt analogous discipline voluntarily because it is useful.

## 19. Evidence graph versus document folder

A folder of calculations, drawings, certificates and photographs does not by itself tell a future reader which entity each file supports, which model version it describes, whether a product changed or whether the evidence still applies.

Documents may remain ordinary files. The evidence graph supplies their semantic context.

## 20. Granularity and sampling

Do not create one obligation per screw.

Evidence granularity should reflect consequence, repeatability, replaceability, difficulty of later inspection and evidence reuse.

Valid scopes may include building, system, assembly family, representative sample, occurrence or critical interface. Repeated work may use type tests, first article, representative-installer trial, sampling or 100% inspection where consequence warrants it.

The evidence plan should state the strategy honestly.

## 21. Workmanship robustness becomes auditable

A tolerance strategy already defines incoming condition, datum, adjustment, remediation threshold and verification.

The evidence layer adds who verifies, when, what artefact is retained, which obligation it discharges and which occurrence/version it describes.

The aim is not maximum documentation. It is the smallest evidence set that proves the things worth proving.

## 22. Building-record views

One evidence graph can produce different views.

- **Occupant:** isolation, maintenance, replacement and emergency information.
- **Trade:** service routes, IDs, access/replacement method and compatible parts.
- **Professional:** calculations, boundaries/interfaces, assumptions, deviations and evidence scope.
- **Regulatory/submission:** requirement-by-requirement evidence, referenced drawings, standards, decisions and commissioning results.

Different projections retain one building identity.

## 23. Building release manifest

Each significant release should produce a compact manifest, for example:

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

Given the same source model, compiler version, target, rule packs, datasets and accepted external evidence, deterministic portions of compilation should reproduce the same result.

Future implementation may use hashes, signatures or append-only logs. The present requirement is simply that silent mutation of a released evidence bundle should be detectable.

## 25. Retention and access

Stale evidence should not be deleted merely because it no longer governs the current building. It explains earlier versions, past decisions and maintenance history.

Some artefacts may be copyrighted, confidential, personal or security-sensitive. The evidence model therefore separates technical identity and existence from storage location, access rights and redistribution rights.

Traceability should survive even when the underlying artefact cannot be shared openly.

## 26. Anti-drift rules

Reject these shortcuts:

- **“Upload the structural PDF and tick complete.”** Evidence needs subjects, obligations, versions and scope.
- **“Approval means native compiler proof.”** Regulatory decision and native proof are different classes.
- **“The product certificate proves the wall.”** Only if assembly and parameter scope match.
- **“We will inspect it later.”** Future evidence needs method, owner, phase and failure response.
- **“Every future inspection blocks design release.”** Time-phased obligations separate due-now from due-later.
- **“Keep only the latest report.”** Superseded evidence remains historical record.
- **“Nothing important changed, so the old calculation is fine.”** Dependencies decide.
- **“Golden-thread duties apply to every house.”** They do not; the discipline is borrowed voluntarily unless legally applicable.
- **“More evidence is always safer.”** Evidence should be proportionate and legible.

## 27. Open questions

- What is the minimum useful evidence graph for an ordinary house?
- Which evidence can be generated automatically and which should be externally signed?
- How should external evidence be accepted and governed?
- What formally permits family evidence to pass to occurrences?
- How should probabilistic geotechnical/material evidence be represented?
- When does a change make evidence stale rather than definitely invalid?
- How should sampling plans be represented?
- Which site inspections justify mandatory status in a low-rise house?
- How can the record remain readable if the original software disappears?
- What open export can preserve the graph?
- How should contested regulatory interpretations and target migration be recorded?

## 28. Validation

Test the model on a real Reference House slice rather than elaborating it indefinitely:

1. generate obligations;
2. identify an evidence method for each;
3. assign due phase;
4. distinguish native from external evidence;
5. create a small dependency graph;
6. mutate one input;
7. verify the right evidence becomes stale;
8. generate a release manifest.

If that is harder to understand than reviewing the building manually, simplify the model.

---

## External anchors

- Building Safety Regulator, **Keeping information about a higher-risk building: the golden thread**: https://www.gov.uk/guidance/keeping-information-about-a-higher-risk-building-the-golden-thread
- Building Safety Regulator, **Preparing information for a building control approval application**: https://www.gov.uk/guidance/preparing-information-for-a-building-control-approval-application
- Building Safety Regulator, **Making changes to a higher-risk building project**: https://www.gov.uk/guidance/making-changes-to-a-higher-risk-building-project
- Building Regulations Advisory Committee, **Golden thread report**: https://www.gov.uk/government/publications/building-regulations-advisory-committee-golden-thread-report/building-regulations-advisory-committee-golden-thread-report
- Purushotham, Kailashnath & Mutis, **Framework for automated building code compliance checking to improve transparency, trust, validation, and design interpretation**, *Automation in Construction* 181 (2026), 106598: https://doi.org/10.1016/j.autcon.2025.106598
