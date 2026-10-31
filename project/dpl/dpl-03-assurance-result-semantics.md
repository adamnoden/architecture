# DPL-03 — Deployment Assurance and Result Semantics

**Issue:** [#302 — DPL-03 — assurance and deployment-result semantics](https://github.com/adamnoden/architecture/issues/302)  
**Parent programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Depends on:** [DPL-01](dpl-01-deployment-ontology.md)  
**Related authority:** [DPL-02](dpl-02-reference-house-conformance.md)  
**Baseline `main`:** `2cd509be0506133cf54fe6c4a00885cef125296c`  
**Status:** assurance/result semantics frozen for DPL foundation work

## Question

> **How should deployment evidence and obligation states compose into an honest deployment conclusion without creating a second proof system or collapsing uncertainty into a green/red badge?**

DPL-01 established that deployment reuses the existing House Kernel / Metamorph Compiler obligation, evidence and provenance model. DPL-03 therefore begins from existing computational authority rather than inventing a parallel set of statuses.

The central conclusion is:

> **Deployment compatibility is a derived conclusion over scoped obligations, evidence and admissible resolution routes. It is not a new low-level proof status.**

## Conclusion

DPL should preserve four separate semantic layers:

```text
1. OBLIGATION / APPLICABILITY
   what must be established, why and for what subject

2. OBLIGATION RESULT
   PASS / EXTERNALLY_DISCHARGED / FAIL /
   UNSUPPORTED / UNRESOLVED / NOT_APPLICABLE /
   WARNING / SUPERSEDED

3. EVIDENCE + METHOD STATE
   native / external / human determination / statutory decision
   + PRESENT / ACCEPTED / STALE / etc.

4. DEPLOYMENT CONCLUSION
   COMPATIBLE / UNRESOLVED / INCOMPATIBLE
   always qualified by exact case + maturity/claim scope
```

These layers must not be flattened.

In particular:

- `PROVED` is not needed as a new status: native proof inside admitted scope is `PASS`;
- `EVIDENCE REQUIRED` is not a result status: it is normally an `UNRESOLVED` obligation with an admitted evidence route;
- `JUDGEMENT REQUIRED` is not a result status: it is normally an `UNRESOLVED` obligation whose admitted method is a human/professional/statutory determination;
- generic `UNKNOWN` is too coarse: DPL must distinguish `UNRESOLVED`, `UNSUPPORTED`, unknown applicability and stale evidence;
- `INCOMPATIBLE` is not a synonym for one failed candidate;
- `COMPATIBLE` is never allowed to mean approved, built, physically verified or universally suitable.

## Authority recovered

### Existing obligation semantics

`docs/computational/validity-and-obligations.md` already establishes that compilation means discharging explicit obligations while preserving source authority, applicability, method, evidence and result.

The existing conceptual result vocabulary is:

- `PASS`;
- `EXTERNALLY_DISCHARGED`;
- `FAIL`;
- `UNSUPPORTED`;
- `UNRESOLVED`;
- `NOT_APPLICABLE`;
- `WARNING`;
- `SUPERSEDED`.

The current executable compiler implements only a bounded subset of the full conceptual lattice. DPL-03 does not widen executable authority merely by documenting the broader semantics.

### Existing evidence semantics

`docs/computational/evidence-and-provenance.md` already establishes that claims, obligations, methods, evidence and results are different objects.

Evidence lifecycle states include:

- `PLANNED`;
- `PRESENT`;
- `ACCEPTED`;
- `REJECTED`;
- `STALE`;
- `SUPERSEDED`;
- `WITHDRAWN`.

Evidence may be deterministic/model-derived, calculation evidence, tested/classified evidence, product evidence, site/survey evidence, inspection/commissioning evidence, an external professional determination or a statutory/regulatory decision.

DPL reuses these distinctions.

### DPL-01

DPL-01 freezes that:

- compatibility is scoped to an exact deployment case;
- `unknown` is not incompatibility;
- absence of known failure is not positive compatibility;
- Reference House conformance, target compliance, supported-domain status and approval remain separate axes;
- a deployment result cannot silently rewrite architectural source authority.

### DPL-02

DPL-02 freezes that:

- deployment candidates are architecturally authored;
- deployment freedoms are opt-in;
- whole-house mirroring and rigid placement/orientation are currently the only licensed architectural deployment variants;
- site-interface and implementation freedoms are bounded;
- changing protected order requires explicit Reference House revision.

Those distinctions matter because one candidate can fail while another permitted candidate or interface route remains available.

## Existing low-level status vocabulary remains canonical

DPL-03 does not create a new general-purpose status enum.

### `PASS`

The obligation is resolved by an admitted method operating within its declared supported authority and against current inputs.

Examples:

- represented stair geometry satisfies the admitted numeric method;
- a site-boundary clearance query over controlled geometry satisfies the defined proposition;
- a Reference House conformance clause is directly preserved by the candidate where the method is deterministic.

A `PASS` is only as broad as the proposition and method that produced it.

### `EXTERNALLY_DISCHARGED`

The obligation is resolved by accepted external evidence or determination whose subject, scope, assumptions and dependencies match the current case.

Examples:

- accepted structural engineer determination for a specified foundation condition;
- accepted geotechnical determination covering the site and selected structural response;
- accepted planning or statutory decision **for the exact process obligation that decision legitimately resolves**.

`EXTERNALLY_DISCHARGED` preserves the authority boundary. It must never be rendered as native compiler proof merely because the conclusion is satisfactory.

### `FAIL`

A known applicable mandatory proposition is violated under the method and source state being evaluated.

A `FAIL` is normative at the scope of its obligation. It is not automatically a deployment-level incompatibility conclusion.

Examples:

- a candidate changes protected Reference House order without an upstream revision;
- represented geometry violates a mandatory target rule whose applicability is established;
- a site condition makes a required clearance impossible for the current candidate.

### `UNSUPPORTED`

The system lacks an admitted method or sufficient domain authority to establish the proposition.

`UNSUPPORTED` is epistemic, not normative.

It means:

> **this system cannot establish the answer under its present authority.**

It does not mean the proposition is false or the site is incompatible.

Where an admitted external determination route exists and is merely not yet supplied, prefer `UNRESOLVED`, not `UNSUPPORTED`.

### `UNRESOLVED`

The obligation and a legitimate route to resolution are understood, but required information, evidence, determination or evaluation is missing.

Examples:

- site levels are required but the topo survey is absent;
- geotechnical capacity needs an external engineer/site investigation that has not yet been supplied;
- a planning judgement must be made by an identified competent/authority process;
- a permitted mirror variant remains to be tested after the first candidate fails;
- accepted evidence became stale after a dependency changed.

### `NOT_APPLICABLE`

The rule/method is known and its applicability condition has been established as false for the current subject/case.

Do not use `NOT_APPLICABLE` merely because applicability cannot yet be decided.

Unknown applicability is unresolved.

### `WARNING`

The represented state is valid at the mandatory level but departs from a preference, quality target or recommended condition.

Warnings do not block a deployment conclusion unless the underlying source is later promoted into a mandatory obligation.

A warning must never conceal a due mandatory `UNRESOLVED`, `UNSUPPORTED` or `FAIL` state.

### `SUPERSEDED`

The result belongs to an earlier source, target, candidate or evidence state and is retained as history rather than current authority.

A superseded result must not participate in the current deployment conclusion.

## Evidence lifecycle is independent from obligation result

The status of evidence and the status of the obligation it supports must remain separate.

Examples:

```text
Evidence: GEO-REPORT-01
state: PRESENT
obligation: FOUNDATION-CAPACITY
result: UNRESOLVED
reason: report not yet accepted for selected foundation/candidate scope
```

```text
Evidence: STRUCT-CALC-04
state: ACCEPTED
obligation: BEARING-CAPACITY
result: EXTERNALLY_DISCHARGED
```

```text
Evidence: DRAINAGE-SURVEY-02
state: STALE
obligation: SITE-DRAINAGE-ROUTE
result: UNRESOLVED
reason: site/candidate dependency changed
```

An evidence item can remain stored while its conclusion ceases to govern.

## Resolution method is also independent

A deployment obligation should preserve how it can be established.

Useful method classes include:

- deterministic semantic inference;
- geometry query;
- calculation;
- bounded table / verified envelope;
- accepted product/test evidence;
- site/survey evidence;
- external professional determination;
- planning/statutory judgement or decision;
- inspection / commissioning / physical test;
- explicitly unsupported / method not yet admitted.

This distinction is essential for deployment because many important site and planning questions are legitimately human or externally determined.

## `EVIDENCE REQUIRED` is not a status

A common deployment output will need to say “evidence required”. That phrase is useful presentation, but it should not become a new obligation status.

The canonical representation is:

```text
obligation: GEO-FOUNDATION-01
status: UNRESOLVED
method: external professional determination
required evidence: geotechnical/site investigation + engineer determination
reason: evidence absent
```

If the evidence later arrives and is accepted:

```text
status: EXTERNALLY_DISCHARGED
```

If the compiler has no admitted native or external route for the proposition:

```text
status: UNSUPPORTED
```

That distinction tells the user whether there is a known path forward.

## `JUDGEMENT REQUIRED` is not a status

Human judgement is a legitimate method, not a failure of the model.

Before determination:

```text
obligation: PLANNING-CHARACTER-01
status: UNRESOLVED
method: planning / professional judgement
required determination: named scope
```

After an accepted determination:

```text
status: EXTERNALLY_DISCHARGED
```

If no admitted authority/method has been identified at all, the proposition may remain `UNSUPPORTED` instead.

This prevents the compiler from pretending that subjective or authority-led planning questions are deterministic while still making the unresolved obligation visible.

## Applicability must fail closed

Applicability is itself epistemic.

Conceptually:

```text
applicability = TRUE
    → evaluate obligation

applicability = FALSE, established
    → NOT_APPLICABLE

applicability = UNKNOWN
    → UNRESOLVED applicability / dependent obligation cannot pass
```

A missing site fact must never be converted into `NOT_APPLICABLE` merely because the trigger cannot be proved.

Where useful, applicability may be represented as its own dependency/obligation rather than overloading the result status.

## Blocking role is separate from authority and status

Not every obligation blocks a deployment conclusion.

A deployment case should distinguish at least conceptually:

- **mandatory / blocking** — must be resolved for the stated deployment claim at the current maturity stage;
- **non-blocking advisory** — preference, quality target or optimisation feedback;
- **future-due mandatory** — real requirement whose evidence legitimately belongs to a later maturity/physical phase.

Blocking role must preserve source authority.

A mandatory Ovid’s House conformance obligation, a mandatory regulatory requirement and a mandatory site-access condition may all block the same deployment conclusion while remaining different kinds of authority.

DPL-04 owns the stage-specific rule for which obligations are **due now**.

## Deployment conclusion vocabulary

DPL needs only three top-level current conclusions:

- `COMPATIBLE`;
- `UNRESOLVED`;
- `INCOMPATIBLE`.

No fourth “probably compatible” state is needed.

The maturity/claim scope qualifies the conclusion.

For example:

```text
COMPATIBLE @ SCREENING
```

can be a legitimate later DPL-04 result even though geotechnical capacity is not yet due at screening.

It must never be rendered as bare universal `COMPATIBLE` without the deployment-case identity and maturity/claim scope.

### Why not `POTENTIALLY_COMPATIBLE`?

Because “potentially” hides what has and has not actually been checked.

A stage-qualified result is stronger and more honest:

```text
COMPATIBLE @ LAND SCREENING
unresolved future-due obligations: 12
```

rather than:

```text
82% likely / potentially compatible
```

DPL-04 will freeze the final maturity-stage names and due-now contracts.

## `COMPATIBLE`

A deployment case may conclude `COMPATIBLE` at its declared maturity/claim scope only when all of the following are true:

1. the exact deployment case identity is recorded;
2. the evaluated deployment candidate is within the current Reference House conformance contract;
3. every **applicable, due-now, blocking** obligation for that maturity/claim scope is resolved by either:
   - `PASS`; or
   - `EXTERNALLY_DISCHARGED`;
4. no due-now blocking obligation is `FAIL`, `UNSUPPORTED` or `UNRESOLVED`;
5. applicability required for due-now blocking obligations is itself resolved;
6. all evidence relied upon is current/accepted for the exact source, target, site and candidate state;
7. no unresolved contradictory evidence undermines a relied-upon proposition;
8. any permitted variant/site-interface resolution used by the candidate is explicitly identified;
9. the conclusion states its maturity/claim scope and does not imply later-stage evidence that is not yet due.

`NOT_APPLICABLE` obligations are excluded once their false applicability is established.

`WARNING` may coexist with compatibility if no mandatory condition is hidden beneath it.

Future-due mandatory obligations may remain planned where DPL-04 permits them; they must remain visible in the deployment result.

## `UNRESOLVED`

`UNRESOLVED` is the correct deployment conclusion whenever positive compatibility has not been earned and incompatibility has not been proved.

This includes cases where:

- a due-now blocking obligation is `UNRESOLVED`;
- a due-now blocking obligation is `UNSUPPORTED`;
- applicability of a blocking rule is unknown;
- required site evidence is absent;
- required professional/planning judgement is pending;
- accepted evidence became stale;
- current evidence conflicts and no authority/precedence resolution exists;
- one deployment candidate fails but another permitted discrete variant remains untested;
- a site-interface solution may exist but has not yet been established;
- a hard failure has been found in one route but route exhaustion has not been shown;
- the system cannot yet determine whether a proposed adaptation is inside the Reference House conformance contract.

`UNRESOLVED` is not a weak form of pass.

It means the model refuses to claim either compatibility or incompatibility beyond the available evidence.

## `INCOMPATIBLE`

A deployment case may conclude `INCOMPATIBLE` only when there is a known applicable **blocking failure** and the current Reference House cannot be deployed through any admitted conformance-preserving route still available under the case.

This requires more than one `FAIL`.

### Candidate failure is not site incompatibility

Suppose the unmirrored candidate fails because the service-side clearance is impossible.

If the whole-house mirror is an admitted DPL-02 variant and has not yet been tested, the correct deployment conclusion is:

```text
UNRESOLVED
current candidate: FAIL
remaining admitted route: mirrored candidate
```

not:

```text
INCOMPATIBLE SITE
```

### Route exhaustion requirement

`INCOMPATIBLE` must be supported by one of these forms of reasoning:

#### Invariant failure

The blocking conflict is independent of every admitted variant/interface freedom.

Example in principle:

- plot geometry is smaller than the protected principal mass in every possible rigid placement/rotation, and no lawful/physical site-interface response can create the required land.

#### Enumerated variant exhaustion

All relevant permitted discrete variants have been evaluated and fail the same or other blocking obligations.

Example:

- canonical and mirrored configurations both fail a protected boundary/access condition.

#### Bounded interface exhaustion

The relevant site-interface freedoms have been evaluated sufficiently to establish that no conformance-preserving solution exists within their declared bounds.

Example:

- external utility approach cannot reach the protected service-entry geography without crossing a prohibited condition under either handedness and no admitted external route remains.

#### Protected-order boundary

The only remaining apparent solution requires changing DPL-02 protected order or an identity invariant.

At that point the current Reference House is incompatible with the site/case **unless** the project elects to reopen and revise the Reference House upstream.

The deployment result should name that possible governance response without treating it as a conformance-preserving route.

### Incompatibility is revision-relative

`INCOMPATIBLE` means:

> **the current controlled Reference House revision cannot be deployed under this exact case through its currently admitted conformance-preserving routes.**

It does not mean no house could be built on the site or that Ovid’s House doctrine rejects the site forever.

A later Reference House revision may change the conclusion and must generate a new deployment result.

## Route state must remain explicit

A deployment result should record relevant routes separately from obligation status.

Useful conceptual route states are:

- `NOT_RELEVANT`;
- `AVAILABLE_UNTESTED`;
- `UNDER_EVALUATION`;
- `SATISFIES`;
- `FAILS`;
- `EXHAUSTED`;
- `REQUIRES_REFERENCE_HOUSE_REVISION`.

These are **not obligation statuses** and need not become a software enum now.

They exist to prevent one candidate failure from masquerading as exhaustive incompatibility.

## Compatibility is stage-scoped, not confidence-scored

DPL-04 will define maturity stages and the obligations that are due at each stage.

DPL-03 freezes the composition rule:

```text
deployment conclusion
  = evaluation of
      due-now applicable blocking obligations
      + Reference House conformance
      + current evidence
      + admitted route state
  under
      exact deployment case
      + declared maturity/claim scope
```

This means the same site can legitimately move through:

```text
COMPATIBLE @ SCREENING
        ↓ new evidence exposes unresolved condition
UNRESOLVED @ FEASIBILITY
        ↓ accepted external determination
COMPATIBLE @ FEASIBILITY
        ↓ planning target proves irreconcilable protected-order conflict
INCOMPATIBLE @ PLANNING
```

There is no contradiction. The propositions are different because the maturity/claim scope and evidence state changed.

## Future-due evidence does not falsely block earlier stages

Some evidence cannot exist at screening or design stage.

DPL must preserve the existing concept of planned future evidence obligations.

A future-due obligation may remain visible without blocking a current-stage `COMPATIBLE` conclusion if and only if DPL-04 has explicitly classified it as not due for that stage.

For example, a screening result should not require commissioning flow measurements that can only exist after installation.

Conversely, an obligation that is actually due at screening must not be pushed into the future merely to obtain a green result.

## Professional judgement

A judgement-dependent question should record:

- exact proposition;
- why judgement is required;
- intended authority/person/role;
- material to review;
- assumptions;
- scope/limitations;
- source/target/site state to which the determination applies;
- conditions requiring re-review.

Before the judgement exists:

```text
UNRESOLVED
```

After a valid accepted determination:

```text
EXTERNALLY_DISCHARGED
```

Where the compiler does not even have a legitimate external determination contract for the proposition:

```text
UNSUPPORTED
```

The system must not produce a pseudo-objective numerical proxy merely to avoid this distinction.

## Planning semantics

Planning is expected to contain a mixture of:

- deterministic source/applicability facts;
- policy constraints that may be checked mechanically;
- evidence requirements;
- contextual assessment;
- professional/authority judgement;
- eventual statutory decision.

DPL-03 does not treat all of these as one “planning pass”.

Examples:

```text
policy applicability               PASS / NOT_APPLICABLE / UNRESOLVED
numeric height condition           PASS / FAIL
heritage assessment evidence       UNRESOLVED → EXTERNALLY_DISCHARGED
character response judgement       UNRESOLVED → EXTERNALLY_DISCHARGED
planning permission                separate process obligation / statutory evidence
```

A model-level `PASS` against encoded planning-policy constraints is not planning permission.

## Building-control / technical semantics

The same distinction applies to Building Regulations and technical standards.

A compiler may establish a bounded geometric or numeric correspondence under a named target and method.

It must not convert that into:

- whole-building statutory compliance;
- Building Control approval;
- structural adequacy outside accepted engineering evidence;
- correct physical construction.

Approval/certification can be represented as external statutory evidence for the propositions it legitimately supports.

## Contradictory evidence

Contradictory current evidence must fail closed.

The compiler must not silently choose:

- the newest document;
- the most convenient conclusion;
- the source that preserves compatibility;
- a numeric average between incompatible determinations.

Instead:

1. retain both evidence items and their provenance;
2. identify the proposition(s) in conflict;
3. apply an explicit authority/precedence rule if one legitimately exists;
4. otherwise mark the affected obligation `UNRESOLVED`;
5. prevent positive compatibility if that obligation is due-now/blocking;
6. require a competent determination or corrected evidence to resolve the conflict.

A known current deterministic `FAIL` is not neutralised by stale positive evidence; the stale item has already lost current authority.

## Stale / superseded evidence

When a dependency changes:

```text
accepted evidence
    ↓ dependency changes
STALE evidence
    ↓
affected obligation becomes UNRESOLVED
unless another current accepted method/evidence independently discharges it
```

Historical results/evidence remain in the record as `SUPERSEDED` where appropriate.

A target-version change should selectively invalidate only the obligations/results whose applicability/method/evidence depends on that target state.

A site survey update should likewise stale only dependent conclusions.

The deployment conclusion must always be recomputed from current governing states rather than inherited from the previous green result.

## Native result versus external discharge

Do not render these as epistemically identical even when both are acceptable for compatibility.

```text
PASS
  authority: native admitted method

EXTERNALLY_DISCHARGED
  authority: accepted external evidence/determination
```

A high-level deployment result may count both as resolved, but its evidence summary should preserve how each blocking proposition was established.

This distinction becomes especially important for structural, geotechnical, planning and statutory matters where the compiler should not claim native professional authority.

## Reference House conformance integration

DPL-02 conformance findings enter the same obligation/evidence framework without becoming a separate global Boolean.

Conceptually:

### Candidate preserves clause deterministically

```text
source authority: Reference House conformance contract
status: PASS
```

### Candidate violates protected order

```text
source authority: Reference House conformance contract
status: FAIL
consequence: current candidate non-conforming
remaining route: permitted variant / reject site / explicit RH revision
```

### Conformance cannot yet be classified

If the architectural authority is incomplete but a route to determination exists:

```text
status: UNRESOLVED
```

If no admitted method/authority exists:

```text
status: UNSUPPORTED
```

A Reference House conformance `FAIL` blocks that candidate. It does not automatically prove site incompatibility until the DPL-02 admitted route space is exhausted.

## Supported-domain integration

Leaving the supported computational domain is never a hidden failure.

For a due-now blocking proposition:

- if no admitted method exists: `UNSUPPORTED` → deployment `UNRESOLVED`;
- if a legitimate external method exists but evidence is absent: `UNRESOLVED`;
- if accepted external evidence discharges it: `EXTERNALLY_DISCHARGED`.

This preserves the distinction between “software cannot prove this” and “the architecture is wrong”.

## Warning semantics

Warnings are never averaged into compatibility.

A result may legitimately be:

```text
COMPATIBLE @ <stage>
WARNINGS:
  - preferred maintenance route is less direct
  - project quality target missed but no mandatory clause violated
```

If the condition is actually mandatory under Ovid’s House, Reference House, target or site safety authority, it must be represented as a blocking obligation rather than downgraded to warning for convenience.

## Approval and physical-conformance dimensions remain separate

A deployment result can include separate projections such as:

```text
DEPLOYMENT COMPATIBILITY       COMPATIBLE @ TECHNICAL DESIGN
PLANNING PERMISSION            NOT YET OBTAINED
BUILDING CONTROL DECISION      NOT YET OBTAINED
STRUCTURAL CAPACITY            EXTERNALLY_DISCHARGED
PHYSICAL CONSTRUCTION          NOT STARTED
AS-BUILT CONFORMANCE           NOT APPLICABLE YET
```

The first line must never consume the meaning of the others.

Later DPL-04 stages may decide when an approval/process obligation becomes due for a particular maturity claim.

## A deployment result is a structured record

At minimum, a mature deployment result should be capable of identifying:

- deployment-case identity;
- Reference House revision;
- conformance-contract revision;
- site-manifest revision;
- target-stack identities;
- selected scenarios/project requirements;
- supported-domain profile;
- candidate identity;
- maturity/claim scope;
- applicable obligation set;
- obligation result by source authority;
- evidence identity/lifecycle/method;
- blocking versus non-blocking role;
- warnings;
- unresolved/unsupported states;
- failed candidates / route state;
- current deployment conclusion;
- source/evidence changes that would invalidate the conclusion.

The exact storage schema is downstream implementation work.

## No aggregate score

DPL-03 explicitly prohibits:

- compatibility percentage;
- confidence percentage without a real probabilistic model;
- count-weighted pass percentage;
- averaging architectural conformance and statutory obligations;
- “94% compliant” style summaries;
- using number of green checks to conceal one blocking failure.

One hard unresolved soil condition can matter more than fifty deterministic geometry passes. The result must preserve consequence and authority rather than count checks.

## Example 1 — sparse land-screening case

Assume DPL-04 later says the following are due at screening:

```text
Reference House conformance          PASS
basic plot geometry                  PASS
known designation applicability      PASS
obvious access impossibility         NOT_APPLICABLE / none found
geotechnical engineering             future-due
commissioning                        future-due
```

The result may legitimately be:

```text
COMPATIBLE @ SCREENING
```

with future-due obligations listed visibly.

That does **not** mean technically deployable or approvable.

## Example 2 — missing survey needed now

```text
boundary geometry evidence           UNRESOLVED
reason                               authoritative boundary/topo absent
role                                 blocking @ feasibility
```

Result:

```text
UNRESOLVED @ FEASIBILITY
```

Not `FAIL`. Not `INCOMPATIBLE`.

## Example 3 — unsupported planning judgement

If policy creates a contextual judgement and DPL has not admitted either a native or external method contract:

```text
status: UNSUPPORTED
```

Result:

```text
UNRESOLVED @ <stage>
```

Once DPL-10 defines the competent judgement route but no determination exists:

```text
status: UNRESOLVED
method: planning judgement
```

Once an accepted scoped determination exists:

```text
status: EXTERNALLY_DISCHARGED
```

## Example 4 — one failed handedness

```text
canonical candidate:
  service access obligation          FAIL

mirror variant:
  status                             AVAILABLE_UNTESTED
```

Deployment conclusion:

```text
UNRESOLVED
```

The first candidate is known bad. The site is not yet proven incompatible.

## Example 5 — route-exhausted narrow plot

Assume current protected principal mass cannot fit inside the lawful/physical buildable width under any rigid rotation, and mirroring cannot change that fact.

```text
canonical candidate                  FAIL
mirrored candidate                   FAIL / same invariant condition
site-interface widening route        EXHAUSTED
remaining route                      requires RH protected-geometry revision
```

Deployment conclusion:

```text
INCOMPATIBLE @ stated scope
```

Suggested governance response:

```text
reject site
or explicitly reopen Reference House morphology upstream
```

The compiler does not choose the latter automatically.

## Example 6 — structural evidence route

```text
foundation topology                  represented
capacity method                      external engineer determination
site investigation                   ACCEPTED
engineer calculation                 ACCEPTED
obligation status                    EXTERNALLY_DISCHARGED
```

Compatibility can count the obligation as resolved while still stating that structural authority is external.

## Example 7 — evidence becomes stale

```text
site level survey                    ACCEPTED
candidate absolute datum changes
survey remains factually valid
but derived drainage assessment      STALE
```

The affected drainage obligation becomes `UNRESOLVED`; unrelated site facts remain current.

Compatibility is recomputed rather than inherited.

## Example 8 — statutory approval

An encoded building-control geometry method may report:

```text
PASS
```

A formal Building Control approval/certificate, where relevant, is a separate statutory/process evidence object.

Neither should impersonate the other.

## Adversarial checks

### Can a design receive `COMPATIBLE` while important things are unknown?

Yes, only if those things are legitimately future-due under the declared DPL-04 maturity contract.

No, if they are due-now blocking obligations.

The maturity qualifier is therefore mandatory.

### Can one `FAIL` coexist with deployment `COMPATIBLE`?

Not if it is an applicable due-now blocking obligation for the selected candidate/case.

A `FAIL` belonging to a rejected alternative candidate or historical/superseded state may remain in the record without governing the current candidate.

### Can one candidate fail while the site remains unresolved rather than incompatible?

Yes. This is a core DPL-03 correction.

Incompatibility is about exhaustion of conformance-preserving deployment routes for the current Reference House/case, not merely failure of the first arrangement tested.

### Does route exhaustion require the compiler to prove an infinite design space?

No.

DPL-02 intentionally keeps the admitted deployment transformation space small. Incompatibility evidence only needs to address the declared permitted variants and bounded site-interface freedoms relevant to the conflict.

If the interface space is not bounded enough to establish exhaustion, the result remains `UNRESOLVED`.

That is preferable to false certainty.

### Can `UNSUPPORTED` become a convenient escape from failure?

No.

`UNSUPPORTED` is valid only where the system genuinely lacks admitted authority/method. If an applicable deterministic method exists and proves violation, the result is `FAIL`.

The model may not discard an inconvenient method to recover epistemic ambiguity.

### Can external evidence turn any failure into `EXTERNALLY_DISCHARGED`?

No.

External evidence must actually resolve the same proposition under an accepted method and authority.

An engineer cannot discharge an architectural conformance failure merely by saying the structure works. A planning decision does not prove structural capacity. A product certificate does not prove site installation.

### Can approval erase compiler failures?

No.

A statutory decision is evidence about the statutory process/propositions within its scope. Existing contradictory technical or project obligations remain separately visible unless that decision legitimately resolves them under the declared authority model.

### Can warnings accumulate into incompatibility?

Not by count.

If repeated warnings reveal that a supposedly advisory condition is actually essential, the source requirement should be reconsidered explicitly and promoted through its owning authority. DPL does not convert advisory density into an implicit hard rule.

### Can evidence conflict be resolved by “latest wins”?

Not generically.

Supersession must be explicit or follow a legitimate authority/version rule. Otherwise the proposition remains unresolved.

## Consequences for DPL-04

DPL-04 now has a precise job:

- define the maturity stages;
- define which obligation classes are **due now** at each stage;
- define what future-due obligations may remain planned;
- define the exact claim wording permitted at each stage;
- define progression/rewind rules when new evidence invalidates an earlier result;
- require every positive compatibility conclusion to carry the stage/claim scope.

DPL-04 should not invent a new status lattice.

Its output is principally a **due-now / claim-boundary contract** over DPL-03 semantics.

## Consequences for DPL-05

DPL-05 target-stack work must provide enough information for DPL-03 to determine:

- source authority;
- applicability;
- mandatory/advisory role;
- target/method identity;
- target version and temporal state;
- evidence / external-determination routes;
- supersession/invalidation.

A target does not get to define its own incompatible status vocabulary unless mapped explicitly into the canonical obligation semantics.

## Consequences for DPL-06

DPL-06 site claims/evidence must distinguish:

- fact/claim;
- evidence lifecycle;
- explicit assumption;
- unknown;
- stale/superseded site evidence;
- applicability dependencies.

A missing site value required by a due blocking obligation produces `UNRESOLVED`, not zero/default/not-applicable.

Contradictory current site evidence must remain unresolved until authority/provenance resolves it.

## Consequences for DPL-12

The deployment compiler substrate should orchestrate existing obligation/evidence semantics and derive the three-state deployment conclusion.

It should not introduce a second general `DeploymentStatus` lattice that duplicates `PASS`, `FAIL`, `UNRESOLVED`, etc.

A small top-level `COMPATIBLE / UNRESOLVED / INCOMPATIBLE` projection may eventually be justified, but only as a derived deployment conclusion carrying exact case/maturity provenance.

## No executable change yet

DPL-03 deliberately adds no compiler code.

Reasons:

1. DPL-04 has not frozen maturity/due-now semantics;
2. DPL-05 has not frozen target-stack applicability metadata;
3. DPL-06 has not frozen site-claim/evidence representation;
4. DPL-12 is the explicit compiler-integration packet;
5. the existing conceptual validity model is already adequate to express the needed distinctions without prematurely widening the executable compiler.

## Frozen governing rules

1. **DPL reuses the existing obligation result vocabulary.**
2. **Evidence lifecycle is separate from obligation result.**
3. **Resolution method/authority is separate from both.**
4. **`PROVED` is represented by scoped native `PASS`, not a new status.**
5. **`EVIDENCE REQUIRED` is normally `UNRESOLVED` plus an admitted evidence route, not a status.**
6. **`JUDGEMENT REQUIRED` is normally `UNRESOLVED` plus a human/professional/statutory method, not a status.**
7. **`UNSUPPORTED` means no admitted method/authority; it does not mean failure.**
8. **Unknown applicability is unresolved; only established false applicability yields `NOT_APPLICABLE`.**
9. **Stale evidence cannot support a current positive conclusion.**
10. **Contradictory current evidence fails closed unless an explicit authority/precedence rule resolves it.**
11. **Blocking role is separate from source authority and result status.**
12. **DPL has only three top-level deployment conclusions: `COMPATIBLE`, `UNRESOLVED`, `INCOMPATIBLE`.**
13. **Every compatibility conclusion is qualified by exact deployment case and maturity/claim scope.**
14. **`COMPATIBLE` requires every due-now applicable blocking obligation to be resolved by `PASS` or `EXTERNALLY_DISCHARGED`.**
15. **Warnings and legitimate future-due obligations do not block a stage-qualified positive conclusion.**
16. **`UNRESOLVED` is the default when positive compatibility is not earned and incompatibility is not proved.**
17. **One failed candidate does not prove deployment incompatibility.**
18. **`INCOMPATIBLE` requires a known blocking failure plus exhaustion of the relevant admitted conformance-preserving routes, or an invariant failure across them.**
19. **A solution requiring DPL-02 protected-order/identity revision is not a conformance-preserving deployment route.**
20. **Incompatibility is Reference-House-revision-relative, not a claim that no house can be built on the site.**
21. **Planning permission, Building Control approval, physical construction and as-built conformance remain separate result/evidence dimensions.**
22. **No aggregate compatibility/confidence/pass percentage is authorised.**
23. **Deployment results are recomputed from current source/target/site/evidence state; prior green results do not persist by inertia.**
24. **DPL-03 changes semantics only and does not widen executable compiler authority.**

## What DPL-03 changes

DPL-03 changes the planned DPL result model, not the architecture or executable compiler.

It does not:

- change the Reference House;
- alter DPL-02 conformance authority;
- create a target stack;
- create a site manifest;
- encode England regulations or London planning;
- define maturity stages;
- implement new status enums;
- claim current whole-building regulatory compliance;
- claim planning approval;
- claim technical/physical adequacy;
- raise `project/authority.ts`.

It removes ambiguity before DPL begins handling real external evidence.

## Next authorised work

After DPL-03 is accepted:

- **DPL-04** may define maturity stages and due-now/claim boundaries;
- **DPL-05** may freeze target-stack composition against the canonical assurance semantics;
- **DPL-06** may freeze site-manifest claim/evidence/unknown semantics against the same model.

DPL-05 and DPL-06 may then proceed laterally so long as neither invents a competing evidence/status system.

The DPL-01→06 foundation coherence review remains mandatory before DPL-07 onward.