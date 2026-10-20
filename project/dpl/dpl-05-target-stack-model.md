# DPL-05 — Compiler Target-Stack Model

**Issue:** [#304 — DPL-05 — compiler target-stack model](https://github.com/adamnoden/architecture/issues/304)  
**Parent programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Depends on:** [DPL-01](dpl-01-deployment-ontology.md), [DPL-03](dpl-03-assurance-result-semantics.md)  
**Consumes:** [DPL-04](dpl-04-compilation-maturity.md) when merged/frozen  
**Baseline `main`:** `cd05a841fedd64ffba17489d5e6f2c72d6bc5acb`  
**Status:** target composition semantics drafted for foundation review

## Question

> **How should deployment bind the exact external normative environment that governs one case without flattening law, guidance, planning policy, standards, dates, transitional routes and local authority layers into one mutable object called “the rules”?**

The existing computational model already supplies the core definition:

> **A compiler target is a named, immutable, versioned representation of the external normative environment against which defined claims are compiled.**

DPL-05 preserves that definition.

The new work is the composition layer needed when one deployment case is simultaneously affected by several external normative systems.

## Conclusion

The DPL “target stack” is **not actually a simple stack** and should not be implemented as one ordered inheritance chain.

It is better understood as an immutable **target composition manifest** over a typed graph of independently versioned target snapshots.

Conceptually:

```text
DEPLOYMENT CASE
      │
      ├── target snapshot A — England building-control family
      │
      ├── target snapshot B — Greater London strategic-planning family
      │
      ├── target snapshot C — borough/local-planning family
      │
      └── future admitted external target families, if justified

Each snapshot retains:
  source authority
  jurisdiction / scope
  temporal basis
  applicability model
  selected route(s)
  source provenance
  method/evidence dependencies
  version identity

TARGET COMPOSITION MANIFEST
  = exact selected snapshot identities
    + explicit cross-target relations where legally/technically justified
    + composition identity
```

The project may continue using the human-facing phrase **target stack**. Its semantics are graph composition, not “last/local/newest target wins”.

## Governing rules

> **No precedence may be inferred from array order, geographic nesting or publication date.**

and:

> **Target identity records the normative model; project/site facts determine whether that model applies.**

These two rules prevent the most dangerous target-modelling errors.

## Existing authority recovered

### Compiler target

`docs/computational/compiler-targets.md` already separates:

- compiler target;
- supported-domain profile;
- architectural grammar;
- project configuration;
- source building model.

DPL preserves all five boundaries.

### Temporal targets

The same record already rejects “use the latest rules” as a target-selection algorithm. Application, notification, commencement, transitional protection and later project events may all affect applicability.

### Planning as a separate family

Planning and Building Regulations are already explicitly separate legal/decision systems in the computational model.

DPL-05 therefore rejects any architecture such as:

```text
ENGLAND_TARGET
  └── LONDON
      └── BOROUGH
          └── all regulations + planning
```

That structure falsely implies one authority tree.

### Research target precedent

`docs/computational/s0-target-snapshot-v03.md` is useful precedent because it demonstrates three things:

1. target applicability can depend on a future project event;
2. a target can remain conditional/unresolved until that event is known;
3. the **target model** can improve while the underlying legal source remains unchanged.

DPL-05 generalises those semantics without promoting the S0 research target into release-grade regulatory authority.

## Canonical target objects

### External source

An authoritative external normative source or referenced source set.

Examples in principle:

- legislation / statutory instrument;
- national or local planning-policy document;
- Approved Document or official guidance;
- standard / technical specification;
- formally adopted design code;
- other external source with actual normative relevance.

A source is not itself a compiler target.

It may be too broad, ambiguous, conditional, copyrighted or non-machine-readable to compile directly.

### Source snapshot

A versioned identity for the external source material relied upon by a target model.

Useful identity may include:

- issuer;
- title / identifier;
- edition / revision;
- publication date;
- effective / commencement date where relevant;
- supersession relation;
- authoritative source locator;
- source-check date;
- integrity/hash metadata where lawful and useful.

A source snapshot records what source was interpreted. It does not claim the interpretation is correct.

### Target snapshot

An immutable DPL/House Kernel representation of one bounded external normative environment for a stated family and scope.

A target snapshot should be capable of declaring:

- target ID and model version;
- target family;
- jurisdiction / geographic scope;
- subject/building/work/development class supported by the target;
- source snapshots relied upon;
- temporal/effective/transitional model;
- applicability predicates;
- represented requirement/policy set;
- selected compliance/evaluation routes where route choice materially changes obligations;
- referenced methods/standards and their identities;
- proof/evidence routes;
- explicit coverage exclusions;
- dependencies whose change makes the target/result stale;
- legal/authority caveats;
- review/verification status of the target model itself.

A target snapshot is **immutable once used for a consequential compile**.

If its meaning changes, create a new target identity.

### Method implementation

The executable or otherwise formalised method used to test one proposition under a target route.

Method identity is independent from target identity.

Example conceptually:

```text
source edition:          unchanged
target model:            unchanged
method implementation:   M3 → M4 bug fix
```

The corrected method must create a new method identity and selectively stale affected results without pretending that the external source changed.

### Target composition manifest / target stack

An immutable record binding the exact target snapshots selected for one deployment case.

It records:

- composition ID;
- constituent target IDs;
- role/family of each target;
- explicit relation edges where required;
- unresolved/conditional target selections;
- composition assumptions/dependencies;
- composition supersession/history.

The composition is part of deployment-case identity.

Changing constituent target identity or a material relation produces a new composition identity.

## Target families

DPL-05 authorises a small generic taxonomy, not a substantive corpus.

### `BUILDING_CONTROL`

The target family for the England building-regulation environment and its supported compliance routes.

DPL-09 will determine the actual England corpus and decomposition.

The family name does not imply that every target obligation can be proved natively by the compiler.

### `STRATEGIC_PLANNING`

A strategic planning-policy target such as the Greater London layer.

DPL-10 will determine the actual policy applicability and relationships.

### `LOCAL_PLANNING`

A borough/local development-plan, supplementary design-code or other local planning layer where it genuinely participates in the planning case.

DPL-10 owns the real authority model and whether particular source types deserve separate target snapshots.

### Future target families

Do not pre-create generic families for every external constraint.

A new family should be admitted only when:

- the authority is genuinely external and normative;
- it cannot be represented honestly as site evidence, project requirement, evidence method or another existing target family;
- its source/applicability/version semantics warrant independent target identity.

Private title rights, utility facts, geotechnical evidence and project budget are not automatically compiler targets.

## Target family is not authority rank

The family label says what normative system the target belongs to.

It does **not** create a universal rank such as:

```text
LOCAL_PLANNING > STRATEGIC_PLANNING > BUILDING_CONTROL
```

Those systems answer different questions and may all apply simultaneously.

Where one planning source has legal/policy precedence, supplementation or conflict-resolution semantics relative to another, DPL-10 must encode that relation from actual planning authority rather than from generic DPL ordering.

## Typed composition graph

The target composition manifest may need explicit relations between snapshots.

DPL-05 permits relations only where they have real source semantics.

Examples of relation concepts that may later be justified include:

- `APPLIES_ALONGSIDE`;
- `SUPPLEMENTS`;
- `INCORPORATES_BY_REFERENCE`;
- `SUPERSEDES_FOR_SCOPE`;
- `ALTERNATIVE_ROUTE_TO`;
- `DEPENDS_ON`.

These names are conceptual, not an authorised software enum.

The relation must record:

- source target;
- destination target/source;
- relation meaning;
- authority/provenance for asserting the relation;
- scope/conditions under which it operates.

Do not infer relations merely because two targets share a jurisdiction or one is geographically nested inside another.

## No “more local wins” rule

A London borough policy is not allowed to override a strategic policy simply because its geography is smaller.

Likewise, a local planning target does not override Building Regulations because it is site-specific.

The two systems may impose simultaneous conditions with different authority and decision routes.

A conflict between target-derived obligations should remain visible until an actual authority/precedence rule resolves it.

## No “newer wins” rule

Publication date alone does not determine project applicability.

A new target/source can be:

- not yet effective;
- effective but subject to transition;
- effective for new applications but not an existing case;
- superseding only part of an earlier source;
- irrelevant to the project class;
- newer guidance without changing the underlying legal requirement.

Target selection must therefore preserve temporal applicability rather than sort by date and take the latest record.

## Jurisdiction and project facts are different

A target snapshot declares the **scope it represents**.

For example conceptually:

```text
target.scope.jurisdiction = England
target.scope.workClass = NewDwelling
```

The deployment case/site/project record separately supplies facts such as:

```text
case.jurisdiction = England
case.workClass = NewDwelling
```

Applicability is the relation between the target’s declared scope and the case facts.

Do not copy a site fact into the target merely to make applicability easy.

## Geographic planning facts remain site/project facts

Examples:

- site lies within a named borough;
- site lies in Greater London;
- site has a particular conservation/designation status;
- site lies inside a defined policy area.

Those are site/project claims supported by evidence.

The planning target contains the rules/policies whose applicability may depend on those facts.

This preserves:

```text
SITE CLAIM
    ↓
TARGET APPLICABILITY
    ↓
OBLIGATION
```

rather than:

```text
SITE MANIFEST
  includes interpreted policy result
```

## Reviewing body is not automatically normative target identity

The organisation reviewing a submission may matter procedurally.

It does not automatically define the substantive building-control target.

Examples of process metadata can include:

- building-control reviewer identity;
- planning authority contact/process;
- submission reference;
- correspondence state.

Those belong to process/deployment records unless the reviewer identity genuinely changes the applicable normative environment.

Do not encode “London Borough X Building Control” as a different statutory target merely because a different office reviews the same substantive England requirements.

## Temporal basis

Every target snapshot must state enough temporal semantics to explain why it is applicable.

Possible ingredients include:

- source publication date;
- source commencement/effective date;
- project application/notice date predicate;
- project commencement predicate;
- transitional cut-off;
- approval/permission date where legally relevant;
- other project-event predicate established by the actual authority system.

The exact fields are target-family-specific.

DPL-05 does not impose one universal regulatory date model.

## Conditional target applicability

A target may be a candidate target whose eventual applicability depends on a future fact.

Conceptually:

```text
Target A applicable if:
  application < D1
  AND commencement < D2

case:
  application = known
  commencement = UNKNOWN

result:
  target applicability = UNRESOLVED / conditional
```

The correct response is not to guess commencement or silently choose the newest target.

A deployment compile whose due-now obligations differ between the target branches must remain unresolved until the relevant project fact or legitimate transition basis is known.

DPL-04 decides when that unresolved target choice becomes due for the requested assurance profile.

## Temporal target does not contain future project events as source truth

A target may encode a transition predicate.

The project/case supplies the event value.

Correct:

```text
target predicate:
  commencement must occur before <date>

case fact:
  commencement = <actual / assumed / unknown>
```

Wrong:

```text
target:
  commencement = 1 September 2027
```

unless the object is explicitly a synthetic research fixture whose assumption is clearly separated from the normative target definition.

## Four independent version identities

DPL-05 freezes four version dimensions that must not be collapsed.

### 1. External source version

The legislation, policy, guidance, standard or other external source edition/revision.

### 2. Target-model version

The project’s immutable representation/interpretation of that external normative environment.

The target model can change because:

- applicability logic was incomplete;
- a source relationship was interpreted incorrectly;
- target coverage was expanded/narrowed;
- transition semantics were corrected;
- the model itself had a bug.

The external source may remain unchanged.

### 3. Method-implementation version

The specific implemented geometry/calculation/table/logic method used to discharge an obligation.

A software bug fix can change this without changing the target or source.

### 4. Target-composition version

The exact set and relationships of target snapshots selected for the deployment case.

Adding/changing/removing a constituent target or a material cross-target relation creates a new composition identity.

## Why four identities matter

Without the separation, a future result could say merely:

```text
England / London 2026
```

and nobody could tell whether a change came from:

- new law;
- new planning policy;
- corrected project interpretation;
- a compiler bug fix;
- a different borough target;
- another compliance route;
- a changed target composition.

The whole purpose of target provenance is to make that question answerable.

## Target-model correction versus source change

The S0 research history already demonstrates this distinction.

A later target model may correct an applicability error while relying on the same external source set.

The correct record is:

```text
source identity: unchanged
target model:    T2 → T3
reason:          applicability model corrected
affected results: stale / superseded as appropriate
```

not:

```text
law changed
```

## Method correction versus target change

Likewise:

```text
target:           T3 unchanged
method:           M7 → M8
reason:           implementation bug fixed
```

Only results depending on that method need re-evaluation.

This is especially important where targets reference methods that are tested, licensed or externally reviewed separately.

## Target composition identity

A composition should be reproducible from exact constituent target IDs.

Conceptually:

```text
STACK DPL-STACK-001

building-control:
  T-ENG-NDW-...

strategic-planning:
  T-GLA-...

local-planning:
  T-BOROUGH-...

relations:
  explicit planning-family relation records
```

The composition ID must change if one of those identities or material relations changes.

The composition does not need to duplicate the full source/rule contents of its constituents.

## Alternative compliance routes

Alternative routes remain first-class.

A requirement may admit:

- one bounded Approved Document method;
- another calculation/standard route;
- accepted specialist engineering;
- competent external determination;
- another lawful route not natively supported by the compiler.

The target model should identify the available/supported route semantics honestly.

Where selecting a route materially changes the obligation/method set, the selected route must be part of the target or target-route identity governing that result.

Do not allow a result compiled under Route A to be re-labelled as Route B without recompilation/evidence review.

## Route selection is not “law = one Approved Document”

The target architecture must preserve:

```text
LEGAL / POLICY REQUIREMENT
      ↓
selected route / method
      ↓
guidance / standard / calculation / external evidence
```

An Approved Document method can be encoded as one bounded route without claiming that the guidance text is the law or that every alternative route is invalid.

## Referenced standards

Standards relied upon by a route require exact identity/provenance.

The target model should know enough to say which edition/parameter set the method assumes without reproducing copyrighted standards beyond lawful implementation.

A standard update does not automatically migrate a case if the selected target/route legitimately remains based on the earlier edition.

A method implementation must also be tested against boundary/known-pass/known-fail cases before release-grade use.

## Target coverage is explicit

A target snapshot must publish what it does and does not cover.

Conceptually:

```text
TARGET T
  private-stair numeric route           NATIVE METHOD
  structural capacity                   EXTERNAL ROUTE
  contextual fire-engineering question  UNSUPPORTED / EXTERNAL
  planning permission                   SEPARATE AUTHORITY PROCESS
```

A target is not “complete” merely because it has an England/London label.

Coverage gaps interact with DPL-03:

- known external route, evidence absent → `UNRESOLVED`;
- no admitted method/route → `UNSUPPORTED`;
- accepted external determination → `EXTERNALLY_DISCHARGED`.

## Missing target family is not silent success

A target composition can itself be incomplete.

If the requested DPL-04 assurance profile requires an applicable target family and no defensible target snapshot has been selected or modelled, the affected deployment obligations remain unresolved/unsupported as appropriate.

Do not treat an absent target as equivalent to “no requirements”.

Example:

```text
SCREENING
  detailed building-control target may legitimately be future-due

TECHNICAL_DESIGN
  no applicable building-control target / route model
  → due technical obligations cannot become compatible by omission
```

## DPL-04 due-profile metadata is project interpretation

A target source may contain actual legal/process timing.

DPL also needs to map target-derived obligations onto assurance profiles such as `SCREENING` or `TECHNICAL_DESIGN`.

Those profile assignments are **project assurance metadata**, not claims that the external law uses DPL terminology.

The target/obligation model should preserve the distinction between:

- source-defined legal/process due condition;
- DPL default assurance profile for evaluating the obligation;
- DPL-04 decision-critical acceleration when current evidence makes the question due earlier.

This prevents the project from laundering its workflow model into external law.

## Planning composition

DPL-05 does not decide actual London planning precedence.

It freezes only the architecture needed for DPL-10 to do so honestly.

The composition must be capable of representing:

```text
strategic planning target
+
local development-plan target(s)
+
local design-code / supplementary target where genuinely normative/relevant
```

with explicit relation/authority records.

DPL-10 must determine from real planning authority:

- which sources form part of the development plan;
- which are guidance/material considerations rather than equivalent policy authority;
- how conflicts/weight are handled;
- which policies apply to the site/development type;
- which questions remain judgement-dependent.

The generic target-stack layer must not prejudge those answers.

## Building-control composition

Likewise, DPL-09 will determine the England target decomposition.

The building-control target may need to represent:

- legal requirements;
- amendments;
- transition basis;
- selected Approved Document routes;
- referenced standards/methods;
- external professional evidence routes;
- process/approval obligations where actually relevant.

DPL-05 only requires those components to retain their distinct authority/provenance.

## Site facts do not migrate into targets

Examples that belong to DPL-06/site evidence rather than the target:

- measured plot width;
- tree location;
- sewer position;
- flood-zone/site designation claim;
- ground-bearing evidence;
- neighbouring window location;
- utility availability;
- actual application/commencement dates as project events.

The target supplies conditional logic; the site/case supplies the facts.

## Product facts do not migrate into targets

The target may require performance.

The selected product and its evidence remain in the evidence/product graph.

Do not create a target called “England 2026 + Product X” merely because Product X is one way the candidate discharges an obligation.

## Ovid’s House requirements do not migrate into targets

Project doctrine may exceed law.

The deployment result must retain the possibility:

```text
external target obligation       PASS
Reference House / Ovid’s House   FAIL
```

or the reverse.

The target stack contains **external normative authority only**.

## Scenarios do not migrate into targets

Future climate, outage, ageing or failure scenarios selected by Ovid’s House remain project scenarios unless an external target independently requires the same condition.

If both exist, keep two source authorities even when they use similar data.

## Target selection workflow

Conceptually:

```text
1. identify deployment-case facts
2. identify candidate external normative families
3. select candidate target snapshots
4. evaluate target applicability predicates
5. preserve conditional/unresolved selection where facts are missing
6. bind exact applicable/conditional target identities into composition manifest
7. derive target obligations
8. evaluate through DPL-03 assurance semantics
9. apply DPL-04 due-profile contract
```

No step may be replaced by “pick latest target by date”.

## Target migration workflow

When a source/target/method/composition changes:

```text
change detected
   ↓
identify which identity changed
   ↓
identify dependent obligations/results/evidence
   ↓
mark only affected results stale/superseded
   ↓
select/migrate target route explicitly where required
   ↓
recompile exact affected scope
```

Unrelated results remain current.

## Historical reproducibility

A deployment record must always be capable of answering:

> **What exact external normative environment and target model did this conclusion use?**

Therefore old target snapshots and composition manifests must remain addressable even after supersession.

A later “better” target must not silently overwrite historical target identity.

## Representative examples

### Example A — England building-control target plus London planning

```text
composition:
  BUILDING_CONTROL:  T-ENG-NDW-X
  STRATEGIC_PLANNING: T-GLA-Y
  LOCAL_PLANNING:    T-LBX-Z
```

The building-control and planning targets coexist.

No generic precedence relation exists between them because they answer different legal/decision questions.

### Example B — borough policy is newer

A borough plan/source is newer than a strategic target.

DPL does **not** infer that it overrides the strategic target.

DPL-10 must encode the actual planning relationship from authoritative planning law/policy semantics.

### Example C — new Building Regulations source published during project

A new source exists, but transition rules may preserve the existing target basis for the case.

Result:

```text
new source: registered
current target: remains applicable if transition predicates satisfied
migration: not automatic
```

### Example D — transitional commencement unknown

```text
application fact: known
commencement fact: unknown
old/new target branch: materially different
```

Target applicability remains unresolved/conditional.

At an assurance profile where target choice is due, the deployment conclusion cannot become positive until the fact/route is resolved.

### Example E — method bug fix

```text
source S: unchanged
target T: unchanged
method M1: bug found
method M2: corrected
```

Affected M1 results become stale/superseded and recompile under M2.

Do not mint a fake new external-source version.

### Example F — target-model bug fix

Applicability logic was represented incorrectly but the method math was correct.

```text
source S: unchanged
target T1: superseded by T2
method M: may remain unchanged
```

Only results depending on the corrected target interpretation are invalidated.

### Example G — conservation-area status

```text
site claim:
  designation = <supported claim/evidence>

planning target:
  contains policy/applicability logic triggered by designation

result:
  obligation derived after applicability evaluation
```

Do not author `site.maxHeight = ...` directly from a planning interpretation into DPL-06.

### Example H — alternative compliance route

Route A is natively implemented; Route B requires engineer evidence.

The project may choose Route B.

Before evidence:

```text
obligation result: UNRESOLVED
method: external professional determination
```

After accepted evidence:

```text
EXTERNALLY_DISCHARGED
```

The compiler must not fail the project merely because Route A fails if another legitimate selected route remains available.

## Adversarial checks

### Is “target stack” now a misleading name?

Potentially, but the phrase remains useful and already exists in programme language.

DPL-05 freezes that its semantics are a typed composition graph/manifest, not positional stack semantics.

Future software should prefer names such as `TargetComposition` internally if that prevents accidental ordering logic.

### Why not one giant England/London target?

Because it would erase independent authority, temporal basis, method coverage and planning/building-control differences.

It would also make partial updates force unnecessary whole-target invalidation.

### Why not make every policy document its own target?

Because target identity has cost and semantic weight.

DPL-10 should group sources into snapshots at the smallest level that preserves material authority/version/applicability differences without creating a document registry masquerading as architecture.

### Can target composition contain project requirements?

No.

The composition is external normative authority. Project requirements/scenarios stay outside and remain independently reportable.

### Can target composition contain site facts?

No.

It may depend on site facts for applicability, but the facts belong to the deployment case/site manifest.

### What if the same fact affects several targets?

That is expected.

One site claim may feed applicability/obligations in several target families without being duplicated as separate factual truths.

### What if two targets conflict?

Do not average or silently choose.

Use explicit source-authority relations where they exist. Otherwise the affected deployment obligation remains unresolved pending competent interpretation or actual authority decision.

### Does the target snapshot prove the external source was interpreted correctly?

No.

It is the project’s controlled interpretation/model and itself requires review/verification before release-grade reliance.

### Does immutable mean targets can never be corrected?

No.

It means an already-used target identity never changes meaning. Corrections create a new target identity and preserve the old one for historical reproducibility.

### Does this widen current compiler authority?

No.

The current bounded stair method remains exactly as bounded as before. DPL-05 defines future deployment target composition only.

## Consequences for DPL-06

The site manifest must supply facts used by target applicability without absorbing target interpretation.

At minimum DPL-06 must support:

- jurisdiction/location claims;
- designation/context claims;
- project-event facts where stored with the site/case context;
- evidence/provenance;
- unknown/assumed states;
- supersession/staleness.

A missing target-trigger fact needed at the requested DPL-04 profile becomes unresolved under DPL-03.

## Consequences for DPL-07

The Reference Site will need a synthetic site manifest and an explicit selected target composition.

Synthetic site assumptions remain project assumptions; target contents remain external normative models.

## Consequences for DPL-09

DPL-09 should first produce an authoritative England building-control source/applicability inventory, then decide the target decomposition and bounded child implementation packets.

It must not start by encoding all Approved Documents as one rules object.

## Consequences for DPL-10

DPL-10 must establish the real Greater London + borough planning authority graph and represent it through target snapshots/composition relations.

It must not inherit generic precedence from DPL-05.

### DPL-10 must explicitly test

- development-plan authority;
- strategic/local policy relationships;
- supplementary/design-code status;
- judgement-dependent material;
- site-triggered applicability;
- temporal/version relationships;
- decision evidence versus policy conformance.

## Consequences for DPL-12

Future compiler substrate should treat target composition as an explicit deployment-case input.

Conceptually:

```text
DeploymentCase {
  targetCompositionId
  siteManifestId
  referenceHouseRevision
  conformanceContractRevision
  candidateId
  assuranceProfile
  ...
}
```

The exact schema is not authorised here.

The compiler should never infer an unrecorded target composition from the current date or the site postcode at result-rendering time.

## No machine-readable schema yet

DPL-05 deliberately does not add a target-stack TypeScript schema.

Reasons:

1. DPL-09 has not audited the substantive England target corpus;
2. DPL-10 has not audited actual London planning authority relationships;
3. DPL-06 has not frozen the site/case fact representation feeding applicability;
4. DPL-12 is the intended substrate-integration packet;
5. premature schema would encourage invented generic legal fields before the real authority families are studied.

The Markdown contract is sufficient foundation authority.

## Frozen governing rules

1. **The existing immutable/versioned compiler-target definition remains authoritative.**
2. **DPL target stack is a typed composition graph/manifest, not an ordered inheritance stack.**
3. **No precedence may be inferred from array order, geographic nesting or publication date.**
4. **Every target snapshot retains independent family, authority, jurisdiction, temporal basis, applicability, route, provenance and version identity.**
5. **Building control and planning are separate target families.**
6. **Strategic and local planning targets may coexist; their actual legal/policy relationship is DPL-10 authority, not generic stack ordering.**
7. **Target scope declarations and project/site facts remain separate.**
8. **Site facts trigger target applicability; target interpretation does not become a raw site fact.**
9. **Reviewing-body identity is not automatically substantive target identity.**
10. **“Use the latest rules” is prohibited as a target-selection algorithm.**
11. **Target applicability may legitimately remain conditional on future project events.**
12. **Unknown transition/application facts fail closed when target choice is due for the requested assurance profile.**
13. **External-source version, target-model version, method-implementation version and target-composition version are distinct identities.**
14. **A corrected target model can supersede itself without the external source changing.**
15. **A corrected method can supersede itself without target/source identity changing.**
16. **Target composition changes create a new composition identity.**
17. **Alternative compliance/evaluation routes remain first-class and retain route identity.**
18. **Approved guidance is not silently promoted into law.**
19. **Target coverage/exclusions must be explicit.**
20. **A missing due target family is unresolved/unsupported as appropriate, never equivalent to no requirements.**
21. **DPL assurance-profile due metadata is project interpretation distinct from source-defined legal timing.**
22. **Site facts, product evidence, Ovid’s House requirements and project scenarios do not belong inside the target composition.**
23. **Historical targets/compositions remain addressable for reproducibility after supersession.**
24. **DPL-05 changes target-composition semantics only and does not widen current compiler regulatory authority.**

## What DPL-05 changes

DPL-05 changes the deployment target model only.

It does not:

- implement an England Building Regulations target;
- encode London planning policy;
- select a London borough;
- claim legal/regulatory compliance;
- create a site manifest;
- define the Reference Site;
- implement compiler target classes;
- reproduce copyrighted standards;
- change the current RH-C5 regulatory proof boundary;
- alter Reference House architecture;
- raise project maturity or external validation.

## Next authorised work

DPL-06 may now freeze site-manifest claim/evidence semantics against the same DPL-03/04 assurance model.

After DPL-01 through DPL-06 close, the mandatory foundation coherence review must reconcile the six records before any DPL-07+ issue is opened.

Only after that gate should DPL-09/DPL-10 begin substantive England/London source inventory and target construction.