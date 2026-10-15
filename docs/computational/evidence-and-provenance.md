# Evidence and Provenance

A computational building model becomes trustworthy only when its claims can be traced to evidence of the right scope.

A folder containing drawings, calculations, product data and certificates is not yet an evidence system. A future reader also needs to know:

- which proposition each artefact supports;
- which entity or family it applies to;
- which source/target version it describes;
- which assumptions it depends on;
- whether those dependencies have changed;
- whether the evidence is design-stage, physical-conformance or in-use evidence;
- whether it is still current.

The evidence architecture therefore treats provenance as part of the model rather than decorative metadata around it.

## Claims, obligations and evidence are different

A useful chain is:

```text
SOURCE FACT / REQUIREMENT
        ↓
APPLICABILITY
        ↓
OBLIGATION
        ↓
METHOD
        ↓
EVIDENCE / DETERMINATION
        ↓
RESULT
```

The obligation says **what needs to be established**. Evidence says **what supports the conclusion**. The result records the present epistemic state.

Keeping those separate prevents an uploaded document from being mistaken for a proven proposition merely because it exists.

## Evidence anatomy

A consequential evidence item should carry enough information to establish:

- stable identity;
- type/class;
- issuer or author where relevant;
- date/version;
- subject or family;
- proposition supported;
- scope and limits;
- dependencies;
- source/target state;
- lifecycle state;
- storage/reference location;
- acceptance status;
- supersession/withdrawal state where relevant.

The repository does not need to contain every evidence artefact itself. It needs enough semantic context for the evidence relationship to remain intelligible.

## Evidence classes

Useful classes include:

### Deterministic source/model evidence

Facts derived directly from a controlled semantic source: identity, topology, geometry, quantities or other deterministic projections.

### Calculation evidence

Results from a stated analytical or numeric method, with method identity, inputs, applicability and assumptions.

### Tested or classified assembly evidence

Fire, acoustic, structural, weather or other test/classification results covering a bounded assembly and field of application.

### Product/manufacturer evidence

Declarations, installation conditions, technical literature or other manufacturer evidence whose authority and scope remain explicit.

### Site / survey evidence

Topographic survey, ground investigation, existing-building survey, utility survey or other real-site information.

### Inspection evidence

Measured bearing, concealed-work record, fixing spacing, product identity or other observations of the physical building.

### Commissioning / test evidence

Airtightness, ventilation flow, electrical test, functional water test and similar completion evidence.

### External professional determination

A competent person resolves a proposition outside native compiler authority. The exact proposition, assumptions and scope should be recorded.

### Statutory / regulatory decision

Approval, certificate or planning decision where relevant. This is evidence about a legal process, not native compiler proof.

## Scope is part of evidence

Every item must answer:

> **What exactly does this establish?**

Scope may depend on:

- entity or family;
- occurrence;
- geometry and dimensions;
- loading;
- material;
- environment/exposure;
- installation condition;
- target/method version;
- lifecycle phase.

For example:

```text
TEST T-004
applies to:
  wall family WF-03
  height <= H
  spacing = S
  board family = B
  fixing pattern = F
  penetration condition = P
```

Change a scoped parameter and evidence inheritance may disappear. This is why a property such as `wall-is-fire-safe = true` is an inadequate model.

## Family evidence and occurrence evidence

**Family-level evidence** supports a reusable design envelope: a tested wall, engineered joist table or certified window family.

**Occurrence-level evidence** supports a particular instance: the selected materials were installed, a bearing was measured, a fire stop was inspected, a terminal was commissioned.

A design-stage result may therefore legitimately rely on family evidence while physical conformance remains a later obligation.

The distinction prevents a tested family from silently proving installation quality and prevents an installation photograph from being mistaken for technical design evidence.

## Evidence lifecycle

Evidence can have its own state independently of the obligation result.

Useful states include:

- **PLANNED** — required later; method, owner and phase known;
- **PRESENT** — artefact exists but has not yet been accepted for this proposition;
- **ACCEPTED** — applicable and sufficient for the declared scope;
- **REJECTED** — exists but does not satisfy scope or quality requirements;
- **STALE** — a dependency changed and the conclusion needs re-evaluation;
- **SUPERSEDED** — replaced by newer accepted evidence but retained historically;
- **WITHDRAWN** — formally withdrawn or no longer valid where relevant.

An old calculation can remain in the record without governing the current building state.

## Time-phased evidence

Some evidence cannot exist at design stage.

A useful evidence architecture therefore distinguishes what is **due now** from what is legitimately **due later**.

Possible phases include:

`CONCEPT` / `COORDINATED DESIGN` / `TECHNICAL DESIGN` / `PRE-MANUFACTURE` / `PRE-CLOSURE` / `INSTALLATION` / `COMMISSIONING` / `COMPLETION` / `IN-USE` / `ALTERATION`

A future obligation is legitimate where its method, responsible party, due phase/hold point and failure response are already clear.

This allows compilation to generate an evidence plan without pretending design information can prove future workmanship.

## Evidence plan

A mature technical design could produce a compact plan such as:

| Obligation | Evidence | Due phase | Responsible party | Hold point | Failure response |
|---|---|---|---|---|---|
| interface datum | measured post-adjustment datum | pre-closure | installer / inspector | before lining | remediate |
| beam bearing | measured bearing / engineer acceptance | pre-closure | contractor / engineer | before concealment | stop / review |
| ventilation duty | measured flow | commissioning | commissioning engineer | commissioning | rebalance / rectify |
| product identity | installed product check | installation | contractor | as required | reject substitution |

The aim is not maximal paperwork. It is to make consequential future proof obligations explicit while they can still influence design and procurement.

## Dependencies and invalidation

Evidence should declare the facts it depends on.

```text
CALC-221
supports: beam B14

depends on:
  geometry G-B14-V3
  loading LOADSET-04
  material MAT-S275
  support SUP-W12
  method M-04
```

If `SUP-W12` changes:

```text
SUP-W12 changed
   ↓
CALC-221 becomes STALE
   ↓
dependent obligation becomes UNRESOLVED
```

Unrelated evidence should remain current. This selective invalidation is one of the main advantages of an evidence graph over a folder of files.

## Assumptions are dependencies

Assumptions should be structured facts rather than hidden caveats.

```text
ASSUMPTION GEO-004
subject: preliminary ground capacity
basis: desktop assumption
status: provisional
replacement evidence: site investigation
```

Any conclusion depending on that assumption inherits its provisional basis. When real evidence arrives, affected results can be compared and selectively re-evaluated.

## Rule and applicability provenance

A machine-checked method should be traceable through:

```text
method / rule identity
   ↓
implementation version
   ↓
interpretation / applicability contract
   ↓
source requirement / guidance / standard
   ↓
source version / date
```

Copyrighted standards can be referenced without reproducing protected text.

It is equally important to preserve **why a method ran**. A `PASS` is incomplete if the reader cannot tell why the rule was applicable to this entity, project and target.

A `NOT_APPLICABLE` result should be explainable for the same reason.

## Human judgement provenance

Where a competent person determines a proposition, the record should identify:

- person, role or organisation;
- competence basis where material;
- exact proposition determined;
- material reviewed;
- assumptions;
- date and scope;
- limitations;
- source changes requiring re-review.

“Engineer approved” or “building control accepted” is too coarse to act as evidence architecture.

## Do not fake evidence strength

Avoid invented confidence percentages unless a real probabilistic method exists.

Prefer explicit distinctions:

- direct / indirect;
- native / external;
- family / occurrence;
- current / stale;
- complete / incomplete;
- within / outside scope;
- design / physical / in-use;
- deterministic / judgement-based.

Specific epistemic language is more useful than pseudo-precision.

## Design, physical and in-use evidence

### Design evidence

Supports the represented design: geometry, calculations, specifications, selected families and product/system evidence.

### Physical-conformance evidence

Supports the claim that construction corresponds sufficiently to the design: identity, measurement, inspection, test and commissioning.

### In-use evidence

Records later stewardship: maintenance, failure, replacement, alteration and measured performance.

One building record can contain all three without treating them as interchangeable.

## Change as a first-class event

A change can carry an explicit impact derived from dependencies.

```text
CHANGE C-017
changed:
  Opening O17 width
  Window WIN-17 family

impact:
  grammar obligation       re-evaluate
  structural evidence      stale
  thermal evidence         stale
  quantity                 regenerate
  unrelated drainage       unchanged
```

The dependency graph—not memory—should decide what must be revisited.

## Golden-thread discipline without false legal applicability

England’s higher-risk-building regime provides useful precedent for information architecture: version control, controlled change, compliance evidence, construction control and as-built records.

An ordinary low-rise house is not thereby subject to those higher-risk-building duties. Ovid’s House may borrow analogous discipline voluntarily because it is useful, while keeping the legal boundary explicit.

## Evidence graph versus document folder

A folder can store evidence. It cannot by itself say which claim each artefact supports or whether it is still applicable.

Documents can remain ordinary files. The evidence graph supplies their semantic context.

This allows the record to preserve traceability even where an artefact is confidential, licensed, security-sensitive or stored outside the public repository.

## Granularity and sampling

Do not create one obligation per screw.

Evidence granularity should reflect:

- consequence;
- repeatability;
- replaceability;
- difficulty of later inspection;
- evidence reuse;
- variability of the construction process.

Useful scopes may include building, system, assembly family, representative sample, occurrence or critical interface.

Repeated work may use type tests, first article, representative-installer trial, sampling or 100% inspection where consequence warrants it. The evidence plan should state which strategy is being relied upon.

## Workmanship robustness becomes auditable

A tolerance strategy already describes incoming condition, datum, adjustment, remediation threshold and verification.

The evidence layer adds:

- who verifies;
- when;
- what artefact is retained;
- which obligation it discharges;
- which occurrence/source state it describes.

The target is the **smallest intelligible evidence set that proves the things worth proving**.

## Building-record views

One evidence graph can support different readers.

### Occupant

Isolation, maintenance, replacement and emergency information.

### Trade

Service routes, IDs, access/replacement method and compatible components.

### Professional

Calculations, boundaries/interfaces, assumptions, deviations and evidence scope.

### Regulatory/submission

Requirement-by-requirement evidence, referenced drawings, standards, decisions and commissioning results.

Different projections retain one building identity.

## Release manifest

A significant future release can produce a compact machine-readable manifest identifying, for example:

- source-model identity;
- compiler version;
- target/method versions;
- supported-domain profile;
- architectural grammar;
- evidence set;
- due-now failures/unresolved states;
- future evidence obligations;
- external determinations;
- generated artefacts.

The exact fields are implementation detail. The principle is reproducibility: another competent reader should be able to establish what state was compiled against what authority and evidence.

## Reproducibility and integrity

Given the same source model, compiler version, methods/targets, datasets and accepted external evidence, deterministic portions of compilation should reproduce the same result.

Hashes, signatures or append-only logs may later strengthen integrity. The essential requirement is that silent mutation of a released source/evidence bundle be detectable.

## Retention and access

Stale or superseded evidence should not automatically be deleted. It explains earlier states, decisions and maintenance history.

Some evidence may be copyrighted, confidential, personal or security-sensitive. The semantic record should therefore distinguish evidence identity and provenance from storage location and access rights.

Traceability should survive even when the underlying artefact cannot be redistributed.

## Anti-drift rules

- Uploading a calculation does not establish what it proves.
- Approval is not native compiler proof.
- A product certificate proves only the conditions within its scope.
- “Inspect later” is not an evidence plan without method, owner and consequence.
- Evidence due later should not falsely block work due now.
- Superseded evidence remains part of history even when it no longer governs.
- Dependencies, not intuition, decide when evidence becomes stale.
- Higher-risk-building information duties should not be presented as legal requirements for an ordinary house where they do not apply.
- More evidence is not automatically better; evidence should remain proportionate and legible.

## Current executable boundary

The present compiler demonstrates the critical small-scale mechanism: obligations can carry scoped evidence; evidence applied outside scope can be rejected; source changes can stale dependent evidence without invalidating unrelated evidence; and accepted external determination remains distinguishable from native machine result.

The richer construction evidence plan, lifecycle and release-manifest model described here is not yet implemented as a general subsystem. It should be extended only when an architectural, physical or professional-review case supplies a concrete reason.

## Reference points

- Building Safety Regulator, guidance on the golden thread, building-control applications and controlled changes for higher-risk buildings.
- Building Regulations Advisory Committee, Golden Thread report.
- Purushotham, Kailashnath & Mutis, transparent automated building-code compliance framework, *Automation in Construction* 181 (2026), 106598.
