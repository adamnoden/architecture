# DPL-04 — Compilation Maturity / Deployment Assurance Profiles

**Issue:** [#303 — DPL-04 — compilation maturity model](https://github.com/adamnoden/architecture/issues/303)  
**Parent programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Depends on:** [DPL-03](dpl-03-assurance-result-semantics.md)  
**Related authority:** [DPL-01](dpl-01-deployment-ontology.md), [DPL-02](dpl-02-reference-house-conformance.md)  
**Baseline `main`:** `0e6d7d0ad8c717b537e509467cdaf4e32e3f64f8`  
**Status:** deployment assurance profiles frozen for DPL foundation work

## Question

> **How can the same Reference House and site be evaluated usefully from land screening through completed construction without an early result pretending to carry the evidence of a later one?**

DPL-03 already defines the epistemic language:

- obligation results remain `PASS / EXTERNALLY_DISCHARGED / FAIL / UNSUPPORTED / UNRESOLVED / NOT_APPLICABLE / WARNING / SUPERSEDED`;
- deployment derives only `COMPATIBLE / UNRESOLVED / INCOMPATIBLE`;
- positive compatibility requires every applicable due-now blocking obligation to be resolved;
- incompatibility requires a hard failure plus exhaustion of the relevant conformance-preserving deployment routes.

DPL-04 therefore does not define another status system.

It defines **which claims are mature enough to be due now, and which claims are legitimate at each deployment assurance profile**.

## Conclusion

The candidate “stages” are retained but tightened into six named **deployment assurance profiles**:

1. `SCREENING`;
2. `FEASIBILITY`;
3. `PLANNING_CASE`;
4. `TECHNICAL_DESIGN`;
5. `CONSTRUCTION`;
6. `COMMISSIONED_AS_BUILT`.

The term **profile** is deliberate.

These are not:

- project-wide maturity levels;
- RIBA Plan of Work stages;
- a mandatory procurement sequence;
- one irreversible progress counter;
- a confidence score.

A profile is a **claim boundary** selected for a deployment compile. It states which categories of obligation are due for the requested conclusion and what evidence can legitimately remain future-due.

The same case may be evaluated repeatedly under different profiles as information and decisions mature.

## Core model

Conceptually:

```text
DEPLOYMENT CASE
      +
REQUESTED ASSURANCE PROFILE
      ↓
PROFILE DUE-NOW CONTRACT
      ↓
applicable blocking obligations due now
      +
triggered decision-critical obligations
      ↓
DPL-03 assurance semantics
      ↓
COMPATIBLE / UNRESOLVED / INCOMPATIBLE
      @ exact profile + case identity
```

Every positive conclusion therefore reads conceptually as:

```text
COMPATIBLE @ FEASIBILITY
```

or:

```text
COMPATIBLE @ TECHNICAL_DESIGN
```

never simply:

```text
COMPATIBLE
```

The qualifier is part of the truth of the claim.

## Assurance profile is not project M1–M5

Ovid’s House already has a project-specific maturity model in `project/maturity.ts`:

- M1 Framed;
- M2 Developed;
- M3 Coordinated;
- M4 Internally validated / controlled;
- M5 Externally validated / release-ready.

Those codes assess the maturity of **project workstreams** such as the Reference House, computational implementation, grammar or DPL programme itself.

DPL assurance profiles assess **one deployment case at one evidential horizon**.

The systems are orthogonal.

Examples:

```text
DPL programme maturity: M4
specific plot result:   COMPATIBLE @ SCREENING
```

is coherent.

Likewise:

```text
Reference House maturity: M3
specific plot result:     UNRESOLVED @ FEASIBILITY
```

is coherent.

Do not map `SCREENING` to M1, `FEASIBILITY` to M2 or otherwise create a false correspondence.

## Assurance profile is not RIBA stage

The profile names describe deployment evidence horizons, not professional appointment or project-management stages.

A planning application and technical design may overlap. Technical investigation may begin before a planning decision. Construction evidence may force a design rewind.

DPL therefore makes no claim such as:

```text
PLANNING_CASE = RIBA Stage 3
TECHNICAL_DESIGN = RIBA Stage 4
```

Those external process structures may later be useful in delivery/project planning, but they do not define DPL truth semantics.

## Assurance profile is not evidence lifecycle

Existing evidence has its own lifecycle and due phase:

`PLANNED / PRESENT / ACCEPTED / REJECTED / STALE / SUPERSEDED / WITHDRAWN`

and phases such as:

`CONCEPT / COORDINATED DESIGN / TECHNICAL DESIGN / PRE-MANUFACTURE / PRE-CLOSURE / INSTALLATION / COMMISSIONING / COMPLETION / IN-USE / ALTERATION`.

DPL profiles consume that evidence architecture.

They do not replace it.

A `TECHNICAL_DESIGN` deployment compile can legitimately contain `PLANNED` commissioning evidence because commissioning cannot yet exist. DPL-04 decides whether that evidence is due now or future-due for the deployment claim.

## Due-now semantics

Every applicable mandatory obligation should be classified for the requested profile as one of:

### `DUE_NOW`

The obligation must be resolved to support `COMPATIBLE @ <profile>`.

A due-now blocking `FAIL`, `UNSUPPORTED` or `UNRESOLVED` prevents positive compatibility under DPL-03.

### `FUTURE_DUE`

The obligation is real, but the evidence or act legitimately belongs to a later profile/physical phase.

It remains visible and should identify its expected method/evidence/phase where known.

A legitimate future-due obligation does not block the current profile.

### `NOT_APPLICABLE`

Applicability has been established false.

The obligation is excluded from the current conclusion with the reason preserved.

### `ADVISORY / NON_BLOCKING`

A quality preference, warning or optimisation condition rather than a mandatory due proposition.

It remains visible but does not block compatibility.

DPL-04 does not require these labels to become a software enum. They define the profile contract that DPL-12 may later implement.

## Due obligations are cumulative where still applicable

A later assurance profile does not waive an earlier obligation.

If a site-boundary fact was due at `SCREENING`, it remains part of later deployment truth unless:

- it becomes `NOT_APPLICABLE`;
- it is explicitly superseded by better current evidence;
- the subject/case changes and the old obligation no longer governs.

A later positive profile therefore evaluates the **current cumulative due set**, not merely the new obligations introduced at that profile.

However, DPL does not require a prior green result as a procedural prerequisite.

A site may move directly from:

```text
UNRESOLVED @ SCREENING
```

with poor listing geometry to:

```text
COMPATIBLE @ FEASIBILITY
```

after an authoritative survey resolves the missing facts.

The later evidence discharges the current obligations; the project does not need to manufacture a historical screening pass first.

## Decision-critical acceleration

Profile defaults must not become an excuse to defer a known potential blocker.

A normally later obligation becomes `DUE_NOW` earlier when credible current evidence establishes that resolving it is necessary to support the decision being made at the current profile.

This is **decision-critical acceleration**.

Examples in principle:

- geotechnical design is normally later, but obvious severe ground instability makes ground viability decision-critical before land acquisition;
- detailed drainage is normally later, but a known sewer/easement condition crossing the only protected house position may need feasibility resolution;
- arboricultural engineering may normally mature later, but a protected tree dominating the only buildable position makes the question due during feasibility;
- a planning judgement normally refined for application becomes due earlier where a known heritage/context condition could categorically defeat the Reference House proposition;
- detailed utility design is later, but a known absence of any viable service access may need early resolution.

The inverse is prohibited:

> **A known red flag may not be labelled future-due merely because the profile normally tolerates unknowns in that category.**

DPL-05/06/09/10/11 will later provide the actual target/site facts that trigger acceleration.

## Unknowns are profile-relative, not free

A positive early compile may contain many unknown facts, but only where those facts are legitimately outside the current due-now decision boundary.

Each material unknown should therefore be one of:

```text
future-due — legitimate at this profile
triggered/due-now — blocks positive conclusion
not applicable — false applicability established
unsupported — no admitted route yet, blocks if due now
```

An unknown with no ownership or future evidence route is not a harmless placeholder.

## Profile 1 — `SCREENING`

### Purpose

Answer the land-search question:

> **Does the currently available desktop/market evidence support keeping this plot in consideration for the current Reference House, or is there already enough evidence to reject or suspend it?**

This is intentionally useful before full surveys and professional appointments exist.

It is also intentionally weak compared with later profiles.

### Minimum case identity

A screening compile needs at least:

- exact controlled Reference House revision;
- DPL-02 conformance-contract revision;
- identifiable site/parcel/listing source;
- date/provenance of screening information;
- initial jurisdiction / planning-authority context sufficient to select later target work;
- a site-manifest revision, however sparse;
- at least one explicit deployment candidate or candidate placement/handedness to evaluate;
- an explicit unknown/assumption register.

If even the site or Reference House identity is ambiguous, the compile is not a meaningful screening result.

### Due-now categories

At screening, positive compatibility normally requires enough evidence to evaluate:

- coarse but decision-useful plot/boundary geometry relative to protected Reference House mass and admitted rigid placement/rotation;
- whether known access/street relationships create an obvious categorical failure;
- obvious known site/designation/private constraints already present in authoritative screening evidence where they materially affect the house;
- Reference House conformance of the screened candidate;
- known conditions that make every admitted DPL-02 route obviously impossible;
- any decision-critical accelerated red flag already visible.

The exact site claims and target sources are downstream DPL-05/06/10/11 work.

### Facts allowed to remain future-due

Normally, screening can leave unresolved for later profiles:

- detailed topographic levels;
- full title/legal due diligence;
- detailed utilities and sewer mapping;
- geotechnical investigation;
- detailed drainage design;
- detailed planning assessment and contextual judgement;
- structural capacity;
- product/system evidence;
- detailed energy/environment modelling;
- construction logistics design;
- physical inspection / commissioning evidence.

But any of these becomes due now if credible current evidence triggers decision-critical acceleration.

### Permitted positive claim

```text
COMPATIBLE @ SCREENING
```

means:

> **No incompatibility has been established within the declared screening evidence boundary, and every screening-due blocking obligation is resolved for the evaluated case. The site remains a rational candidate for further due diligence.**

It does **not** mean:

- buy the land;
- planning permission is likely;
- title is clear;
- foundations are feasible;
- Building Regulations are satisfied;
- utilities/drainage are solved;
- the house is technically buildable;
- the site is compatible at any later profile.

### Appropriate use

This is the profile that can eventually power the land-search workflow without turning a property listing into fake technical certainty.

## Profile 2 — `FEASIBILITY`

### Purpose

Answer:

> **After proportionate site-specific due diligence, is there a credible conformance-preserving deployment route worth carrying into planning and technical development?**

This is the first profile intended to interrogate the major real-site conditions rather than merely screen for obvious blockers.

### Minimum case identity

In addition to screening identity, feasibility normally requires:

- materially better site geometry and level evidence appropriate to the constraints being tested;
- a deliberate choice of candidate handedness/orientation/placement to study, while retaining alternatives where relevant;
- a site-interface concept sufficient to expose major land/building conflicts;
- current target-context assumptions identified with provenance;
- major private/public/site due-diligence sources identified;
- explicit professional/external evidence routes for questions that cannot be resolved natively.

### Due-now categories

Positive feasibility normally requires resolution, to feasibility depth, of the conditions capable of invalidating the deployment proposition before major further investment, including as applicable:

- authoritative/decision-useful boundary and level geometry;
- access and maintenance geography;
- major title/private-right conditions capable of preventing the proposal;
- major tree, flood, contamination, ground, sewer/drainage and utility constraints where relevant to site viability;
- initial planning-policy/context constraints capable of forcing protected-order change;
- credible foul/surface-water and utility connection routes at concept/feasibility level;
- credible foundation/ground response route at feasibility level where site evidence requires it;
- environmental orientation / neighbour conditions capable of forcing architectural change;
- DPL-02 conformance of the feasibility candidate;
- remaining admitted variant/interface routes relevant to any known failure.

“Resolved to feasibility depth” does not mean final engineering design. It means enough evidence exists to support the feasibility proposition being claimed.

### Facts legitimately future-due

Typically still future:

- final structural member/capacity design;
- final detailed Building Regulations evidence route;
- product-specific fire/acoustic/thermal evidence;
- final MEP sizing;
- detailed construction information;
- installation inspection;
- commissioning / completion evidence.

### Permitted positive claim

```text
COMPATIBLE @ FEASIBILITY
```

means:

> **The current evidence establishes a credible site-specific route for the controlled Reference House without a known unresolved feasibility-level blocker or need for unadopted protected-order change.**

It does not mean:

- planning permission will be granted;
- Building Control will approve the design;
- technical design is complete;
- unforeseen ground/site conditions cannot exist;
- the project is financially viable unless budget/cost is an explicit project constraint.

## Profile 3 — `PLANNING_CASE`

### Why the name is not simply `PLANNING`

The profile evaluates the **planning case**, not the existence of planning permission.

This prevents the phrase `COMPATIBLE @ PLANNING` from being misread as “approved”.

### Purpose

Answer:

> **Is the exact site-specific architectural proposal and its evidence coherent against the applicable planning target stack and the planning judgements/evidence required for the chosen submission/determination route?**

### Minimum case identity

Normally requires:

- stable site-specific deployment candidate;
- survey/context evidence adequate for the planning propositions being made;
- exact planning-target identities/effective basis under DPL-05/10;
- drawings/model identity consistent across the planning case;
- relevant planning evidence/assessments identified;
- any professional/judgement determinations used in the case recorded with scope/provenance;
- known site/private conditions capable of invalidating the proposed planning geometry reconciled.

### Due-now categories

Positive planning-case compatibility requires:

- every applicable planning-case blocking obligation under the selected target route resolved to the degree the planning case claims;
- site/context facts used by the planning argument current enough for their propositions;
- architectural candidate remaining inside DPL-02 conformance;
- all material judgement-dependent matters either externally discharged by an admitted determination or otherwise not due under the precise planning-case claim;
- no known conflict between the submitted/proposed planning geometry and the controlled deployment candidate;
- planning-related supporting evidence due for that case present/accepted.

DPL-10 will define which planning propositions are deterministic, evidence-driven or judgement-dependent.

### Planning permission remains separate

A case can be:

```text
COMPATIBLE @ PLANNING_CASE
PLANNING DECISION: PENDING
```

That means the planning proposition is internally/evidentially mature enough at the declared profile. It does **not** predict the authority decision.

Once a statutory decision exists, it becomes external statutory/process evidence with its own scope.

A refusal may introduce a new blocking state or route question, but DPL must record the actual decision/grounds rather than retroactively claim the planning-case analysis never existed.

### Permitted positive claim

```text
COMPATIBLE @ PLANNING_CASE
```

means:

> **The current candidate and evidence satisfy the DPL planning-case due-now contract under the selected target/authority model.**

It does not mean:

- permission granted;
- permission guaranteed;
- technical design complete;
- Building Regulations compliance established.

## Profile 4 — `TECHNICAL_DESIGN`

### Purpose

Answer:

> **Is the represented deployed design technically resolved, to the declared design-stage evidence scope, against its site, target stack, Reference House contract and admitted external evidence routes?**

### Minimum case identity

Normally requires:

- controlled site-specific architectural candidate;
- stable site-interface design;
- technical target stack / compliance-route identities;
- sufficiently detailed site manifest for technical obligations;
- structural, building-physics, MEP, fire, access, drainage and other technical design inputs relevant to the selected design;
- accepted external determinations where native compiler authority is insufficient;
- product/family evidence where the design relies on it;
- planning constraints/conditions that materially affect technical design incorporated or explicitly tracked;
- coordinated semantic/drawing/source identity.

### Due-now categories

Positive technical-design compatibility normally requires:

- every applicable **design-stage** mandatory obligation resolved by `PASS` or `EXTERNALLY_DISCHARGED`;
- structural design propositions due at technical design externally/native resolved;
- site/foundation/drainage/utilities interface technically evidenced to the required scope;
- applicable regulatory-route obligations represented and resolved at the exact encoded proof boundary;
- fire/access/environment/energy/ventilation/acoustic/water/service obligations due for technical design resolved under their admitted methods;
- selected product/assembly evidence current where relied upon;
- Reference House conformance preserved after technical coordination;
- no critical due assumption left disguised as a fact.

### Legitimately future-due

Still normally future:

- installation/workmanship inspection;
- concealed-work verification;
- final product identity where procurement is not yet fixed and family evidence legitimately covers design;
- commissioning measurements;
- completion/as-built evidence;
- in-use performance.

### Approval remains separate

A technical compile can report target correspondence and accepted evidence without claiming a statutory body has approved the design.

Where a formal preconstruction approval/notification is legally required for the project state, DPL-05/09 may later make that process obligation due separately.

### Permitted positive claim

```text
COMPATIBLE @ TECHNICAL_DESIGN
```

means:

> **The represented design is resolved at the declared technical-design evidence boundary for the exact site/candidate/targets, with later physical evidence still explicitly future-due.**

It does not mean:

- construction is correct;
- the building exists;
- commissioning has passed;
- whole-building statutory approval is implied beyond recorded external decisions.

## Profile 5 — `CONSTRUCTION`

### Purpose

Answer repeatedly during physical delivery:

> **Does the current released design plus the physical facts, substitutions and changes known at this construction state remain a conforming deployment of the Reference House under the current case?**

This is a snapshot profile, not one end-of-construction badge.

### Minimum case identity

Normally requires:

- released design/source identity;
- current deployed-instance/candidate identity;
- current target stack;
- construction/change log linked to affected source/evidence;
- actual site conditions discovered during work;
- selected installed product/family identities as they become fixed;
- inspections/tests due at the current hold points;
- updated evidence dependencies after substitutions/deviations.

### Due-now categories

At any construction compile, obligations become due according to the actual physical phase/hold point.

Examples include:

- preconstruction/legal process obligations that are applicable and actually due;
- foundations/ground conditions once exposed/confirmed;
- product substitution evidence before affected work is accepted;
- critical dimensions/bearings/interfaces before concealment;
- fire/water/air/acoustic/service interface evidence at relevant hold points;
- change-control re-evaluation after site-driven alteration;
- physical conformance of work that can no longer legitimately remain design-only evidence.

DPL-04 does not predefine every hold point. The existing evidence plan model and later DPL target/site implementation own them.

### Change cannot inherit old green status automatically

When construction changes a dependency:

```text
released result
   ↓ physical change / substitution
relevant evidence becomes STALE
   ↓
affected obligations re-evaluate
   ↓
new construction-profile result
```

Unrelated evidence remains current.

### Permitted positive claim

```text
COMPATIBLE @ CONSTRUCTION
```

must always identify the source/evidence state or hold-point date it describes.

It means:

> **At this controlled construction state, every obligation due by this point is resolved and no known physical/design change has forced the deployed instance outside the current contract.**

It does not mean the building is complete or commissioned.

## Profile 6 — `COMMISSIONED_AS_BUILT`

### Purpose

Answer:

> **Does the recorded completed building, including as-built changes and due commissioning/completion evidence, remain a conforming deployed instance at the completion boundary?**

This is the strongest DPL assurance profile defined by the current programme.

It is still not universal proof of future performance.

### Minimum case identity

Normally requires:

- final controlled Reference House/deployed-instance relationship;
- as-built source/model/drawing identity;
- final relevant site-manifest facts;
- installed product/system identities where consequential;
- all accepted design changes incorporated;
- completion-stage target identities;
- inspection/commissioning/test/certification evidence due at completion;
- planning/building-control/statutory decision evidence where applicable and due;
- unresolved deviations explicitly closed, accepted through a competent route or retained as blockers.

### Due-now categories

Positive commissioned/as-built compatibility normally requires:

- all completion-due blocking obligations resolved;
- commissioning results accepted where required;
- installed occurrence evidence accepted where family/design evidence alone is insufficient;
- as-built deviations reconciled against Reference House conformance and target obligations;
- completion statutory/process evidence due at this state accepted;
- no unresolved construction change invalidating relied-upon design evidence;
- maintenance/operational information due at completion present where it forms part of a mandatory project/target obligation.

### Permitted positive claim

```text
COMPATIBLE @ COMMISSIONED_AS_BUILT
```

means:

> **The recorded completed instance satisfies the current DPL due-now contract at completion under the identified design, site, target and physical evidence set.**

It does not mean:

- the building will perform perfectly in use;
- no latent defect exists;
- long-term maintenance has occurred;
- future alterations remain compatible;
- architectural/publication M5 release has automatically been achieved.

Long-term in-use evidence remains a possible future extension, not part of the authorised DPL foundation programme.

## Profile claim matrix

| Profile | Main decision supported | Typical evidence horizon | Positive claim explicitly does **not** establish |
|---|---|---|---|
| `SCREENING` | keep/reject/suspend a plot for further investigation | desktop/market + coarse authoritative facts | purchase safety, planning likelihood, technical buildability |
| `FEASIBILITY` | invest in site-specific planning/technical development | proportionate due diligence + survey/context/site-interface evidence | permission, detailed technical compliance, construction readiness |
| `PLANNING_CASE` | planning proposition ready/coherent at stated evidence scope | exact candidate + planning target/context/evidence/judgement | planning permission or technical completion |
| `TECHNICAL_DESIGN` | represented design technically resolved at design-stage proof boundary | detailed site + engineering + regulatory-route + product/family evidence | correct construction, commissioning, automatic statutory approval |
| `CONSTRUCTION` | current physical/released state remains controlled through delivery | change control + installed facts + phase/hold-point inspection evidence | completion or as-built assurance |
| `COMMISSIONED_AS_BUILT` | completed recorded instance remains compatible at completion | as-built + occurrence + commissioning + completion evidence | future in-use performance or universal validation |

## Minimum-input failure

A requested profile can still be compiled when its minimum evidence is missing, but the result must fail closed.

Example:

```text
requested profile: FEASIBILITY
boundary/topo evidence: absent
status of geometry obligation: UNRESOLVED
result: UNRESOLVED @ FEASIBILITY
```

The compiler should not silently downgrade the profile to `SCREENING` and return green unless the caller explicitly requests a screening compile.

This keeps the requested claim boundary visible.

## Profile progression is not automatic promotion

Moving from one profile to another creates a new deployment result.

A prior result may be reused as evidence only where its underlying source/evidence remains current and the later obligation has the same proposition/scope.

Never implement:

```text
SCREENING passed
therefore FEASIBILITY passed
```

Instead:

```text
FEASIBILITY compile
  reuses current screening evidence where applicable
  adds feasibility-due obligations
  re-evaluates any changed dependencies
  produces new result
```

## Rewind semantics

A deployment case can move backwards in assurance without architectural failure or process embarrassment.

### New site evidence

```text
COMPATIBLE @ FEASIBILITY
   ↓ new sewer survey
UNRESOLVED @ FEASIBILITY
```

until the interface is redesigned/evidenced.

### Target change

```text
COMPATIBLE @ TECHNICAL_DESIGN under Target T1
   ↓ target basis changes / T1 no longer governs this case
affected evidence/results SUPERSEDED
   ↓
UNRESOLVED @ TECHNICAL_DESIGN under T2
```

DPL-05 owns whether a historical/transitional target remains legitimately governing; later publication of a new rule does not automatically invalidate a case entitled to the old route.

### Candidate change

A new handedness, site-interface design or upstream Reference House revision creates a new candidate/case identity and selectively invalidates dependent results.

### Construction discovery

Unexpected ground, product substitution or built deviation can rewind technical/construction assurance until affected obligations are re-established.

### Approval decision

A statutory refusal/condition/approval changes the external evidence/process state and can reopen affected obligations without falsifying the historical result that existed before the decision.

## Historical results are not retroactively false

A result that was correctly stated as:

```text
COMPATIBLE @ SCREENING
case: C17
site manifest: S3
as of: 2026-xx-xx
```

remains a truthful historical statement about that evidence state even if later investigation discovers a blocker.

The current result becomes different; the earlier one becomes historical/superseded for present decision-making.

This is why exact case/evidence identity is mandatory.

## No single `currentStage`

Do not reduce a deployment case to one mutable field such as:

```text
stage = TECHNICAL_DESIGN
```

A real project may simultaneously have:

- a mature planning case;
- incomplete technical drainage;
- advanced structural design;
- pending statutory decision;
- early procurement evidence.

The assurance profile is the **requested claim contract** for a particular compile.

The repository may record which profile results currently exist, but must not infer that every aspect of the project has the maturity implied by the largest label.

## No “highest compatible stage” quality score

A result at a later profile is not automatically “better architecture” than one at an earlier profile.

Profiles express evidential horizon, not quality.

A beautiful but newly identified site may be only screening-compatible; a poor architectural proposition could be heavily engineered and as-built.

DPL keeps architectural authority, evidence maturity and quality judgement separate.

## Same-site example through the profiles

Consider one hypothetical real plot.

### Screening

Listing/boundary evidence comfortably accommodates the protected house and no known screening blocker is found.

```text
COMPATIBLE @ SCREENING
```

Geotechnics, title detail and drainage remain visible as future-due.

### Feasibility

A measured survey discovers an easement/sewer condition close to the only service-side route.

The canonical candidate fails, but the DPL-02 mirrored variant has not yet been tested.

```text
UNRESOLVED @ FEASIBILITY
```

### Feasibility revision

The mirrored candidate plus an external service route resolves the conflict inside the site-interface contract.

Title/survey evidence is accepted.

```text
COMPATIBLE @ FEASIBILITY
```

### Planning case

The candidate, context evidence and admitted planning assessments are complete, but no authority decision yet exists.

```text
COMPATIBLE @ PLANNING_CASE
PLANNING DECISION: PENDING
```

### Technical design

Ground investigation requires a different foundation family. Engineering has not yet been supplied.

```text
UNRESOLVED @ TECHNICAL_DESIGN
```

### Technical design revision

Accepted engineer evidence establishes a foundation solution within DPL-02 site-interface freedom.

```text
COMPATIBLE @ TECHNICAL_DESIGN
FOUNDATION CAPACITY: EXTERNALLY_DISCHARGED
```

### Construction

A product substitution changes an interface evidence dependency before closure.

```text
UNRESOLVED @ CONSTRUCTION
```

until replacement evidence/inspection is accepted.

### Completion

As-built changes are reconciled, commissioning evidence is accepted and all completion-due obligations are resolved.

```text
COMPATIBLE @ COMMISSIONED_AS_BUILT
```

The progression demonstrates why one permanent “site compatible” Boolean would be dishonest.

## Early incompatibility remains possible

The profile model must not force every site to survive until detailed design before rejection.

If screening evidence already proves:

- protected house geometry cannot fit under any admitted rigid placement/rotation;
- mirroring is irrelevant to the failure;
- no site-interface route can resolve it without protected-order change;

then DPL-03 route-exhaustion semantics permit:

```text
INCOMPATIBLE @ SCREENING
```

That is a high-value early result.

Conversely, insufficient listing dimensions produce:

```text
UNRESOLVED @ SCREENING
```

not optimistic compatibility and not incompatibility.

## Later incompatibility is allowed after earlier compatibility

A site can legitimately move from:

```text
COMPATIBLE @ SCREENING
```

to:

```text
INCOMPATIBLE @ FEASIBILITY
```

when stronger evidence reveals a route-exhaustive conflict.

That does not mean the screening system failed if the hidden condition was legitimately outside its evidence horizon and no early trigger existed.

It means DPL preserved the scope of the earlier claim correctly.

## Claims that are never authorised by profile alone

No assurance profile, including `COMMISSIONED_AS_BUILT`, by itself authorises statements such as:

- “this is a universally compliant house”;
- “planning permission was guaranteed”;
- “the compiler proved structural safety” without the external/native evidence route actually doing so;
- “the built house is defect-free”;
- “the site was a good financial purchase” unless explicit viability/budget requirements were modelled;
- “Ovid’s House doctrine is externally validated”;
- “the Reference House is suitable for all London plots”;
- “future regulation or site change cannot invalidate the result”.

## Profile selection and UI language

A future interface should require an explicit requested profile rather than infer the most flattering one.

Good:

```text
Evaluate this site at SCREENING profile.
```

Good:

```text
Recompile the current case at TECHNICAL_DESIGN profile using evidence set E17.
```

Bad:

```text
Tell me if the site passes.
```

unless the interface immediately exposes which claim profile it is applying.

A human-friendly UI may explain the profile in ordinary language. It must preserve the exact profile identity in the result/provenance record.

## Consequences for DPL-05

Target-stack items must support profile-sensitive due-now evaluation.

DPL-05 should therefore provide enough semantic information to determine:

- whether a target/rule is applicable to the case;
- source authority and version;
- when an obligation becomes due;
- whether a later effective/transitional target actually governs the case;
- whether an approval/process obligation is due at the requested profile;
- what evidence/method can discharge it.

DPL-05 should not hard-code all rules as “technical-design due”.

## Consequences for DPL-06

Site-manifest claims need sufficient provenance/precision/maturity information for the profile contract to determine whether they are adequate.

DPL-06 should support, at minimum:

- sparse screening facts;
- stronger feasibility evidence;
- precise technical/as-built facts where required;
- explicit assumptions/unknowns;
- source/evidence date;
- supersession/staleness.

The site manifest should not itself decide profile compatibility; it supplies evidence to obligations.

## Consequences for DPL-09 / DPL-10 / DPL-11

Later substantive target/due-diligence packets should assign obligations to the **earliest profile at which they are normally decision-relevant**, while preserving decision-critical acceleration.

This is preferable to one giant checklist applied from the first land search onward.

## Consequences for DPL-12

The deployment compiler substrate should eventually accept an explicit assurance profile as an input to the deployment case/result projection.

Conceptually:

```text
compileDeployment({
  case,
  assuranceProfile
})
```

It should then:

1. determine applicable obligations;
2. select due-now blocking obligations under the profile;
3. accelerate triggered decision-critical obligations;
4. evaluate through DPL-03 semantics;
5. preserve future-due obligations;
6. derive the profile-qualified deployment conclusion;
7. emit provenance sufficient to reproduce the result.

This is conceptual future behaviour, not current implementation authority.

## Adversarial checks

### Does `SCREENING` become permission to ignore everything expensive?

No.

The decision-critical acceleration rule makes known material red flags due as soon as they become capable of invalidating the current decision.

Screening tolerates **unknown future work**, not known serious threats.

### Is `COMPATIBLE @ SCREENING` too strong a phrase?

It is acceptable only because DPL-03 requires the profile qualifier as part of the claim and DPL-04 defines the explicit exclusion boundary.

Replacing it with “probably compatible” would be weaker epistemically because it implies an unquantified probability.

### Does `PLANNING_CASE` pretend to predict permission?

No.

Planning-case assurance and planning-decision evidence are explicitly separate.

### Can technical design proceed while planning permission is pending?

Yes as a work activity and as a technical assurance profile, provided the result states the planning-decision dimension separately and all technical-profile due obligations are evaluated against the current planning/design basis.

A known planning refusal or condition that undermines the candidate can of course create a blocking deployment issue.

DPL profiles are evidence claim boundaries, not a procurement sequence.

### Are later profiles cumulative?

The **current due obligations** are cumulative where they remain applicable, but a previous profile result is not itself a prerequisite artefact.

Later evidence can directly resolve an earlier unknown.

### Can a case skip directly from screening to technical design?

Yes in principle if the technical compile has all evidence required by the cumulative current due set.

DPL does not require performative intermediate passes.

### Can a result go backwards?

Yes, and must when evidence changes.

The project values truthful rewind over status preservation.

### Does `COMMISSIONED_AS_BUILT` become Ovid’s House M5?

No.

It is a deployment-case evidence profile. Project-wide M5 requires competent independent validation/release readiness of the relevant workstream at its stated scope.

### Does as-built compatibility prove in-use success?

No.

Long-term performance, maintenance, ageing and alterations remain different evidence states.

## Frozen governing rules

1. **DPL maturity is expressed as assurance profiles, not one project schedule.**
2. **The six profiles are `SCREENING`, `FEASIBILITY`, `PLANNING_CASE`, `TECHNICAL_DESIGN`, `CONSTRUCTION`, `COMMISSIONED_AS_BUILT`.**
3. **Every deployment conclusion must identify its assurance profile.**
4. **Profiles define which applicable blocking obligations are due now and which may legitimately remain future-due.**
5. **Later profiles do not waive earlier still-applicable obligations.**
6. **A prior green result is not a prerequisite for a later compile; current evidence is what matters.**
7. **Decision-critical evidence can accelerate a normally later obligation into the current due-now set.**
8. **A known red flag cannot be deferred merely because its category is usually later-stage work.**
9. **Unknowns are legitimate only when explicitly future-due or otherwise outside the current mandatory claim boundary.**
10. **`COMPATIBLE @ SCREENING` means suitable for further due diligence, not safe to buy or likely to gain permission.**
11. **`COMPATIBLE @ FEASIBILITY` means a credible site-specific deployment route exists at feasibility evidence depth, not technical completion.**
12. **`COMPATIBLE @ PLANNING_CASE` evaluates the planning case; it does not mean permission granted or guaranteed.**
13. **`COMPATIBLE @ TECHNICAL_DESIGN` is a design-stage evidence claim, not physical-construction proof.**
14. **`COMPATIBLE @ CONSTRUCTION` is a controlled snapshot tied to current released/physical state, not a completion claim.**
15. **`COMPATIBLE @ COMMISSIONED_AS_BUILT` is a completion-boundary evidence claim, not long-term in-use proof.**
16. **Profile progression produces new results; it never automatically promotes old ones.**
17. **Changes to site, target, candidate, Reference House or evidence selectively stale/reopen dependent obligations.**
18. **Historical profile results can remain truthful at their old scope while being superseded for current decision-making.**
19. **Do not model one scalar `currentStage` or “highest compatible stage” as overall project quality.**
20. **DPL assurance profiles are independent of project M1–M5, RIBA Plan of Work and evidence lifecycle phases.**
21. **No profile alone establishes financial viability, statutory approval, defect-free construction, future performance or universal London deployability.**
22. **DPL-04 changes claim timing/scope only; it does not widen the current compiler proof boundary.**

## What DPL-04 changes

DPL-04 changes the deployment claim boundary model only.

It does not:

- alter Reference House architecture;
- define site-manifest fields;
- define target-stack contents;
- encode England regulations;
- encode London planning policy;
- create a real site or Reference Site;
- implement compiler code/UI;
- create new obligation statuses;
- declare any real plot compatible;
- raise project-wide DPL, Reference House or computational maturity.

## Next authorised work

With DPL-03 and DPL-04 frozen:

- **DPL-05** can define versioned target-stack composition and temporal/applicability semantics;
- **DPL-06** can define site-manifest facts/evidence/unknowns/precision semantics;
- those two packets may proceed laterally against one shared assurance/profile contract.

The DPL-01→06 foundation coherence review remains mandatory before DPL-07 onward.