# DPL-06 — Site Manifest Model

**Issue:** [#305 — DPL-06 — site manifest model](https://github.com/adamnoden/architecture/issues/305)  
**Parent programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Baseline `main`:** `a4f1da0c243238f380942f9925aa9c1efaa6a415`  
**Status:** foundation-model proposal for review

## Question

> **How should Ovid’s House represent what is presently known, unknown or assumed about a real site without confusing that representation with the site itself, the evidence supporting it, the rules that act on it or the deployment conclusions derived from it?**

DPL-06 is deliberately a modelling packet.

It does not choose a London plot, define the Reference Site, encode planning policy, design foundations, interpret title rights, run utilities searches or implement a deployment compiler.

Its purpose is to freeze the semantics required before any of those tasks can be done honestly.

## Conclusion

A site manifest should not be modelled as a flat object such as:

```text
SITE
  width: 18 m
  depth: 32 m
  floodRisk: false
  sewer: true
  conservationArea: false
  groundBearing: 100 kPa
```

That structure hides almost everything that matters:

- where the values came from;
- what spatial extent they describe;
- when they were observed or sourced;
- whether they are measured, recorded, inferred or assumed;
- whether the source is accepted for the claim;
- what is still unknown;
- whether two sources disagree;
- what changes would make a value stale;
- whether the value is a site fact or already an interpretation of an external rule.

The canonical model is instead:

```text
REAL / SYNTHETIC SITE
        │
        ├── source evidence / observation / record
        ├── explicit assumption
        └── explicit unknown
                    │
                    ↓
              SITE CLAIMS
        identity + subject + proposition
        value + unit/reference frame where relevant
        basis + scope + time + provenance
        dependencies + supersession state
                    │
                    ↓
              SITE MANIFEST
          immutable site-state snapshot
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
      TARGET STACK      DEPLOYMENT CANDIDATE
          │                   │
          └─────────┬─────────┘
                    ↓
               OBLIGATIONS
                    ↓
            DEPLOYMENT RESULT
```

The governing rule is:

> **The manifest records claims about reality. It does not turn those claims into reality.**

A second rule is equally important:

> **Facts, evidence, assumptions, rules and conclusions remain different objects even when they refer to the same physical condition.**

## Authority inherited from DPL-01 through DPL-05

DPL-06 composes existing project authority rather than creating a parallel epistemic system.

### From DPL-01

- the **real site** exists independently of the repository;
- a **site claim** is a proposition about the site, not automatically a truth merely because it appears in a manifest;
- **site evidence** supports, qualifies or contradicts site claims;
- the **site manifest** is a controlled, versioned representation of claims, unknowns, assumptions and evidence references;
- the manifest must remain correctable when better evidence arrives;
- the **Reference Site** may later use the same manifest structure, but its provenance remains synthetic/assumed rather than observed/surveyed;
- the compiler evaluates admitted representations; it does not silently author architecture.

### From the existing evidence architecture

`docs/computational/evidence-and-provenance.md` already establishes that:

- a source artefact is not the proposition it supports;
- evidence has scope, provenance, dependencies and lifecycle;
- assumptions are explicit dependencies;
- evidence may become stale when dependencies change;
- deterministic, survey, inspection, professional and statutory evidence remain distinguishable;
- pseudo-confidence percentages should not replace explicit epistemic distinctions.

DPL-06 reuses those semantics.

### From DPL-03

Site claims do not create a new competing obligation/result status vocabulary.

The existing obligation states remain canonical:

`PASS / EXTERNALLY_DISCHARGED / FAIL / UNSUPPORTED / UNRESOLVED / NOT_APPLICABLE / WARNING / SUPERSEDED`

A missing or weak site claim usually causes a downstream obligation to remain `UNRESOLVED` or `UNSUPPORTED`; it does not justify a positive result.

### From DPL-04

The amount of site evidence **due now** depends on the selected deployment assurance profile.

A `SCREENING` evaluation may legitimately contain many explicit unknowns. A `TECHNICAL_DESIGN` or `COMMISSIONED_AS_BUILT` evaluation cannot rely on the same evidence horizon.

The site manifest itself is not a maturity score. The same manifest snapshot may be insufficient for one requested profile and adequate for another.

DPL-04 decision-critical acceleration also applies: where credible current evidence suggests that a normally later site investigation could overturn the current decision, the corresponding fact/evidence obligation becomes due now.

### From DPL-05

Site facts do not belong inside compiler targets.

Targets provide external normative logic and applicability conditions. The site manifest provides site/project facts that may satisfy, trigger or leave those conditions unresolved.

For example:

```text
SITE CLAIM
  tree T-04 exists at location X

TARGET / METHOD
  defines conditions under which that tree relationship creates an obligation

RESULT
  derived later
```

The tree does not become a planning policy fact merely because policy acts on it.

## Canonical distinction: site, claim, evidence, interpretation

Consider a sewer.

### Real-world condition

A physical sewer may exist under or near a parcel.

### Site claim

> Sewer S-01 centreline is represented at geometry G within the declared source precision.

### Evidence

A utility/sewer record, survey, inspection or other source supports or contradicts that claim.

### External rule

A target or other authority may define consequences of building near, over or connecting to that sewer.

### Derived obligation

A particular deployment candidate may therefore require a clearance, agreement, engineering design, connection strategy or external determination.

These are five different things.

The site manifest owns only the site-claim layer and references the supporting evidence layer.

## Site-manifest identity

A consequential manifest should be an immutable snapshot with stable identity.

Conceptually:

```text
SITE MANIFEST
  manifestId
  siteId
  manifestVersion
  createdAt
  sourceState / parentManifestId
  siteKind
  coordinateReference
  verticalDatum
  claimSet
  unresolvedClaimSet
  assumptions
  evidenceReferences
```

The exact storage schema is deliberately not frozen by DPL-06.

The semantic requirements are.

### `siteId`

Stable identity of the parcel/site subject represented across manifest versions.

For a real site this should not be treated as proof of title identity merely because a project identifier exists.

### `manifestVersion`

Identity of the represented site-state snapshot.

If a consequential claim changes, create a new manifest state rather than silently rewriting the historical meaning of an earlier deployment result.

### `siteKind`

At minimum distinguish:

- `REAL` — claims about an actual site;
- `SYNTHETIC_REFERENCE` — future Reference Site fixture;
- `SYNTHETIC_TEST` — test/contrast fixtures where useful.

A synthetic fixture must never acquire surveyed/observed provenance merely because it uses the same data structure as a real site.

### `coordinateReference` and `verticalDatum`

Spatial claims are meaningless if their coordinate/datum basis is ambiguous.

The manifest should identify enough frame information that geometry, levels and orientation can be interpreted consistently.

A local project coordinate frame is legitimate where it is explicitly tied to a controlled external/reference datum when consequential.

## Site claims are first-class propositions

A significant site claim should answer:

> **What do we currently claim is true about which part of the site, with what value or relationship, on what basis, over what time/scope, and what evidence or assumption supports that claim?**

A useful conceptual anatomy is:

```text
SITE CLAIM
  claimId
  subject
  property / proposition
  value / relationship
  unit + spatial reference where relevant
  spatial scope
  temporal scope / observedAt / sourceAsOf
  basis
  evidence refs
  assumptions
  dependencies
  contradiction / supersession state
  notes on precision or limitation where material
```

### Stable identity matters

A claim such as `SITE-LEVEL-017` should remain traceable when its value changes from an approximate desktop value to a surveyed value.

That allows later evidence and deployment results to say exactly which version they depended on.

### Subject matters

Claims may apply to:

- whole parcel;
- boundary segment;
- point/line/polygon/volume;
- neighbouring building or opening;
- tree occurrence;
- utility occurrence;
- ground stratum;
- access route;
- legal interest or recorded designation;
- environmental/noise/exposure region;
- other scoped site entity.

Avoid site-wide booleans where the underlying condition is spatially local.

### Value and proposition are not always scalar

Valid claim forms include:

- measurement;
- geometry;
- relation;
- category/classification;
- existence/non-existence claim;
- event/date;
- documentary/legal-record proposition;
- qualitative observation where that is all the evidence legitimately supports.

Do not force every site condition into a number.

## Claim basis

DPL-06 does not need a final software enum, but every consequential claim must make its epistemic basis explicit.

Useful basis classes include:

### `MEASURED`

Derived from an identified survey, test or instrumented observation.

The measurement method, date, reference system and material limitations remain part of provenance.

### `OBSERVED`

Directly observed but not necessarily instrumentally surveyed.

Example: a visibly existing access gate recorded during a site visit.

Observation can be useful without pretending to establish exact dimensions or legal status.

### `AUTHORITATIVE_RECORD`

Taken from an external record whose issuer and scope are identified.

Examples may include a statutory register, utility record or title-related source.

The record establishes only what lies inside its own authority and precision.

### `THIRD_PARTY_RECORD`

Taken from a source useful for screening but not treated as authoritative for the final proposition.

Examples may include listing particulars, vendor information or third-party mapping.

### `DECLARED`

Provided by an identified person/organisation as a declaration rather than independently verified observation.

### `ASSUMED`

A deliberate provisional value adopted so a bounded analysis can proceed.

Assumptions are dependencies, not weak facts.

### `DERIVED_SITE_CLAIM`

Computed from other site claims by a declared deterministic method where the result itself remains a site description rather than a normative conclusion.

For example, parcel area derived from controlled boundary geometry may be a derived site claim.

The dependencies and derivation identity must remain visible.

Do **not** use `DERIVED_SITE_CLAIM` for conclusions such as “planning-compliant setback” or “acceptable flood risk”. Those are target/judgement results.

## Unknown is first-class

A consequential fact that is not known should not disappear from the data model.

Conceptually:

```text
UNKNOWN SITE CLAIM
  claimId: GROUND-BEARING-01
  subject: proposed building zone
  proposition: characteristic ground-bearing condition
  state: UNKNOWN
  expected evidence: geotechnical investigation / engineer interpretation
  earliest useful profile: FEASIBILITY or accelerated earlier if red flags exist
```

Unknown is not:

- zero;
- false;
- not applicable;
- assumed safe;
- absent from the manifest.

A manifest may carry an explicit unknown because the relevant question is known even though its answer is not.

This is essential to early land screening.

## Assumptions are explicit temporary dependencies

An assumption may supply a provisional value where analysis is useful before real evidence is available.

It must carry at least:

- assumed proposition/value;
- reason for using the assumption;
- scope;
- replacement evidence expected;
- requested assurance profile for which it is permitted;
- dependencies/results affected;
- invalidation or failure response if contradicted.

Example:

```text
ASSUMPTION A-GROUND-01
  proposition:
    no abnormal shallow obstruction is assumed within canonical building zone
  basis:
    desktop screening assumption only
  allowed use:
    early feasibility geometry exercise
  replacement:
    site investigation / records as required
  consequence if false:
    foundation/site-interface strategy reopens
```

The project should prefer a named unknown over a fake assumption where no provisional value is actually necessary.

Assumptions exist to enable a bounded question, not to make a manifest look complete.

## Evidence references

The manifest should reference evidence rather than copy evidential authority into claim fields.

A useful relationship is:

```text
EVIDENCE E-TOPO-01
  class: site / survey evidence
  lifecycle: ACCEPTED
  source date: ...
  scope: parcel and immediate context

supports:
  LEVEL-001
  LEVEL-002
  BOUNDARY-GEOM-01

qualifies:
  TREE-LOCATION-04
```

One evidence item may support many claims.

One claim may depend on many evidence items.

Evidence lifecycle remains owned by the existing evidence architecture:

`PLANNED / PRESENT / ACCEPTED / REJECTED / STALE / SUPERSEDED / WITHDRAWN`

DPL-06 must not invent `TRUSTED`, `VERIFIED`, `HIGH_CONFIDENCE` or similar parallel states.

## Contradictory sources

The manifest must be able to represent disagreement without arbitrarily choosing a winner.

Example:

```text
BOUNDARY-SEGMENT-B3
  source A: desktop mapping geometry
  source B: title-related record
  source C: measured fence line

current conclusion:
  exact legal boundary relationship UNRESOLVED
```

A visible fence, mapped line and legal boundary may be different propositions.

Where sources appear to contradict each other, first test whether the project has accidentally conflated different propositions or scopes.

If genuine conflict remains:

- preserve the competing evidence;
- mark affected claim/result dependencies unresolved or stale as appropriate;
- require the relevant survey/legal/professional determination;
- do not average the sources into invented certainty.

## Precision, tolerance and source quality

Site geometry frequently enters the project at different levels of precision.

DPL-06 should not encode a universal numerical confidence score.

Instead record explicit characteristics where material:

- approximate / indicative / measured;
- source scale/resolution where known;
- survey method where relevant;
- dimensional tolerance/accuracy if actually supplied;
- datum/reference frame;
- field-of-view or inaccessible areas;
- source limitation or caveat;
- date of observation.

A 1:1250-style mapping source and a detailed measured survey may both be useful, but they do not support the same claim scope.

The deployment compiler should later decide whether the available precision is sufficient for the requested assurance profile and obligation.

## Temporal semantics

A site claim may change even if the parcel identity does not.

Examples:

- a tree is removed;
- a neighbouring opening is altered;
- a sewer is diverted;
- site levels are changed;
- contamination is remediated;
- access arrangements change;
- a designation is added or removed;
- a title/private-right record changes;
- utility capacity information expires or is revised.

Consequential claims therefore need enough temporal provenance to answer:

> **When was this believed true, and what evidence state supported that belief?**

Useful fields may include:

- `observedAt`;
- `sourceAsOf`;
- `validFrom` / `validTo` where the source legitimately supports them;
- `supersededBy`;
- dependencies that trigger re-evaluation.

Do not manufacture validity periods where none are known.

## Site categories

The manifest should be able to represent at least the following categories without forcing every site to populate every field.

### 1. Parcel identity and boundary geometry

Potential claims include:

- parcel/project identity;
- represented boundary geometry;
- boundary segment identities;
- frontage/depth relationships;
- adjoining land relationships;
- known ambiguity or unresolved boundary condition.

The manifest must preserve the distinction between represented geometry and any legal determination of the precise boundary.

### 2. Coordinate frame, orientation and levels

Potential claims include:

- north/orientation basis;
- horizontal coordinate frame;
- vertical datum;
- spot levels;
- contour/surface geometry;
- street and threshold levels;
- neighbouring relevant levels;
- known retaining/step conditions.

### 3. Street, access and movement context

Potential claims include:

- street edge / highway relationship;
- existing vehicular/pedestrian access points;
- gate widths where evidenced;
- route gradients where evidenced;
- construction approach constraints;
- delivery/cranage/scaffold working-space facts where known;
- fire/service access facts where relevant.

Whether these satisfy a legal or design requirement is not a site fact.

### 4. Neighbouring built context

Potential claims include:

- adjacent building footprints;
- heights/levels;
- relevant windows/openings;
- boundary distances;
- roof forms where relevant;
- immediately surrounding morphology;
- extant walls/structures.

Do not infer neighbour rights, planning harm or acceptability directly into these claims.

### 5. Trees and vegetation

Potential claims include:

- tree occurrence/location;
- approximate or surveyed canopy/stem geometry;
- species/condition where evidenced;
- root-related investigation where available;
- hedges or significant vegetation;
- externally recorded protection/designation facts where evidenced.

Protected status and design consequences remain separate from raw physical-tree claims.

### 6. Ground, geology and contamination

Potential claims include:

- ground strata;
- made ground;
- groundwater observations;
- bearing/geotechnical properties where professionally determined;
- shrink/swell or other ground behaviour where evidenced;
- contamination / ground-gas observations;
- buried obstructions where known.

A desktop geology assumption is not interchangeable with site investigation evidence.

### 7. Flood, water and drainage context

Potential claims include:

- recorded/observed flood conditions;
- site watercourse relationships;
- surface-water flow/level observations;
- existing drains/sewers;
- invert/cover levels where evidenced;
- connection points;
- existing drainage assets;
- groundwater conditions.

Policy risk classification or acceptability is a target/evaluation matter unless the claim is specifically about an authoritative recorded classification.

### 8. Utilities and service infrastructure

Potential claims include:

- electricity/gas/water/telecom occurrence;
- known routes;
- connection points;
- externally stated capacity where evidenced;
- meter/termination locations;
- easements/wayleaves where separately evidenced;
- utility-provider constraints where they are actual issued conditions.

The fact that a utility passes nearby is not proof that a new connection of required capacity is available.

### 9. Environmental and exposure context

Potential claims include:

- noise measurements or mapped records;
- air/pollution observations or records;
- wind/exposure evidence;
- solar/shading geometry;
- ecological/habitat observations or records;
- radon/ground-gas records;
- other environmental conditions relevant to deployment.

Keep measured/recorded conditions separate from target thresholds or design conclusions.

### 10. Heritage and administrative designations

A designation can be represented as a site-related **external recorded fact** where its identity, authority, spatial scope and source date are explicit.

Examples may include:

- conservation-area inclusion;
- listed-building relationship;
- locally recorded heritage designation;
- other mapped/statutory designations.

The manifest records the designation fact.

The target/planning layer determines its policy/legal consequences.

### 11. Title, private rights and property constraints

The manifest may reference evidenced propositions about:

- registered title identity;
- easements;
- rights of way;
- covenants;
- restrictions;
- wayleaves;
- ownership/control of access;
- party/boundary relationships;
- other private constraints.

These require particular discipline.

A document extract or title record is evidence of what the record says. The project must not automatically convert legal text into a definitive operative constraint without an appropriate legal interpretation where that matters.

DPL-11 owns the later due-diligence/interpretation model.

### 12. Construction logistics

Potential facts include:

- available working space;
- physical access width/height;
- overhead/underground obstacles;
- neighbouring occupation constraints that are actually evidenced;
- crane/scaffold positioning opportunities or restrictions;
- storage/laydown space;
- temporary access conditions.

Construction means/methods and final logistics strategies are later project decisions, not raw site facts.

## Geometry and topology

The site manifest should favour identifiable geometry/entities over anonymous coordinate dumps.

Conceptually:

```text
SITE
  boundary: BOUNDARY-01
  streetEdge: STREET-EDGE-01
  levels: SURFACE-01
  trees:
    - TREE-01
    - TREE-02
  drains:
    - DRAIN-01
  neighbours:
    - NBR-BLDG-01
```

Claims then attach to those entities.

This permits selective invalidation.

If `TREE-02` is resurveyed, evidence/results depending on that tree can become stale without invalidating unrelated site geometry.

## Derived site geometry

Some useful site values may be deterministic consequences of controlled site claims.

Examples:

- represented parcel area;
- distance between two surveyed entities;
- level difference between controlled points;
- orientation of a represented boundary segment.

These may be stored or regenerated as **derived site claims** if:

- the derivation method is explicit;
- source claim identities are retained;
- source changes invalidate the derived claim;
- no external normative judgement is embedded in the derivation.

Do not store “buildable envelope” as a raw site fact.

A buildable/deployment envelope is derived from site facts + targets + candidate/conformance logic and belongs downstream.

## Site facts versus target applicability

A good DPL relationship looks like:

```text
SITE CLAIM
  parcel area = A

TARGET RULE
  applicability condition depends on A

OBLIGATION
  evaluates applicability against accepted site evidence
```

A bad relationship looks like:

```text
SITE MANIFEST
  biodiversityNetGainRequired = false
```

The latter has already embedded a legal/policy interpretation into the site layer.

The site manifest may record authoritative external classifications or designations as claims, but not the project’s final interpretation of what they require.

## Site facts versus architectural response

Similarly:

```text
SITE CLAIM
  street threshold level = X
  canonical entrance threshold datum = Y

SITE INTERFACE / ARCHITECTURAL AUTHORING
  determines approach, ground transition and permitted site adaptation
```

The manifest does not decide the ramp, step, retaining wall or foundation solution.

That belongs to DPL-08 and subsequent architectural authoring.

## Site facts versus deployment candidate

A deployment candidate references a manifest snapshot; it should not mutate that manifest merely to make the candidate work.

If a candidate reveals that an assumed condition is impossible or new evidence is needed:

```text
candidate evaluation
      ↓
new site question / evidence obligation
      ↓
new evidence
      ↓
new manifest version
      ↓
new deployment case / result
```

Do not edit a sewer, level, tree or boundary claim to fit the house.

## Claim correction and supersession

The real site may stay the same while the project’s knowledge improves.

Example:

```text
MANIFEST SM-01
  LEVEL-GATE = +34.20 m
  basis: third-party mapping
  precision: indicative

survey arrives

MANIFEST SM-02
  LEVEL-GATE = +34.37 m
  basis: measured survey E-TOPO-01

SM-01 remains historical
SM-02 becomes current
results depending on SM-01 are re-evaluated or superseded
```

The old result was not necessarily dishonest. It was a result against a different evidence state and claim scope.

This is the site equivalent of target immutability from DPL-05.

## Staleness and invalidation

Site evidence/claims should participate in the existing dependency graph.

Examples:

```text
TREE-04 geometry changed
   ↓
shade study evidence STALE
foundation interface assumption STALE
planning-context obligation re-evaluate
unrelated sewer evidence unchanged
```

```text
BOUNDARY-02 legal interpretation changes
   ↓
setback/dimensional deployment checks re-evaluate
internal stair geometry unchanged
```

The system should invalidate the smallest coherent dependent set rather than treating every new survey as a total project reset.

## Completeness is question-relative

A site manifest is never globally “complete”.

Completeness only has meaning relative to a declared deployment question and assurance profile.

For example:

- a screening manifest may be sufficient to reject a parcel because it is physically too narrow;
- the same manifest may be insufficient to claim feasibility;
- a feasibility manifest may be sufficient to test broad Reference House placement but insufficient for foundation design;
- a technical-design manifest may still not contain as-built service positions or commissioning evidence.

Therefore do not add a universal `siteComplete: true` field.

The compiler should ask whether **all site claims/evidence due for this result are sufficiently resolved**.

## Minimum-input behaviour by assurance profile

DPL-04 owns the profiles; DPL-06 supplies the site-side interpretation.

### `SCREENING`

Expected site evidence may legitimately be sparse.

Useful inputs often include:

- approximate parcel geometry;
- street/access relationship;
- broad levels/topography if known;
- obvious neighbouring massing;
- known major designations/constraints;
- obvious trees/infrastructure;
- explicit unknowns for everything not evidenced.

Permitted result language remains profile-scoped.

A parcel may be rejected on one decisive known fact even while many other facts remain unknown.

### `FEASIBILITY`

Expected site claims become materially stronger, potentially including:

- controlled boundary/topographic survey or equivalent evidence appropriate to the question;
- stronger neighbouring context geometry;
- initial drainage/utilities understanding;
- material tree/environment constraints;
- title/private-right screening;
- ground-risk screening and accelerated investigation where red flags exist;
- sufficient access/site-interface facts to author a plausible candidate.

### `PLANNING_CASE`

The manifest should support the site/context evidence needed for the planning proposition being made, while planning policy itself remains in the target system.

Relevant claims may include detailed context, neighbouring openings/massing, heritage/designation facts, trees/ecology, access and other policy-triggering site conditions.

### `TECHNICAL_DESIGN`

Site evidence must support technical decisions that depend on the site: foundation/geotechnics, drainage, utilities, levels, access, environmental exposure and other site-interface conditions as applicable.

### `CONSTRUCTION`

The manifest may incorporate verified site changes, discovered conditions and construction-stage surveys needed to keep technical evidence current.

### `COMMISSIONED_AS_BUILT`

The site/land interface representation should reflect material as-built conditions where those conditions affect the final deployment record.

This does not imply that every external landscape feature requires millimetric as-built capture.

## Decision-critical acceleration

A profile does not authorise ignorance of a visible threat.

Suppose screening evidence shows:

- a large mature tree immediately adjacent to the plausible building zone;
- substantial level difference to the street;
- a major sewer crossing the parcel;
- a visible retaining condition;
- obvious evidence of flooding;
- a title/access ambiguity;
- unusually constrained construction access.

Even if detailed investigation would normally belong later, DPL-04 acceleration means the relevant site claim/evidence may become due before the current land decision is allowed to progress.

The manifest therefore needs enough structure to identify the known red flag and the unresolved replacement evidence.

## No universal confidence score

Do not emit:

```text
site confidence = 84%
manifest completeness = 71%
plot data quality = 9/10
```

unless a future project defines an actual defensible statistical model for a specific quantity.

Prefer explicit language:

```text
boundary geometry      indicative third-party source
street level           measured / accepted survey
rear sewer route       authoritative record, unverified on site
bearing condition      unknown
tree position          measured
exact legal boundary   unresolved
```

This is both more useful and more honest.

## Representative manifest A — sparse screening fixture

**Fixture identity:** `SM-EX-A`  
**Site kind:** `SYNTHETIC_TEST`  
**Purpose:** demonstrate a land-listing / desktop-screening state.  
**Important:** entirely synthetic; not evidence about a real London plot.

```text
SITE
  siteId: TEST-PLOT-A
  kind: SYNTHETIC_TEST
  coordinate frame: local indicative frame

CLAIMS
  PARCEL-GEOM-01
    proposition: represented parcel polygon
    basis: THIRD_PARTY_RECORD
    precision: indicative only
    evidence: E-LISTING-PLAN-A

  STREET-EDGE-01
    proposition: south boundary adjoins represented public-street edge
    basis: THIRD_PARTY_RECORD
    evidence: E-MAP-A

  ACCESS-01
    proposition: pedestrian gate appears present on south edge
    basis: OBSERVED_FROM_RECORD / third-party image
    exact width: UNKNOWN

  TREE-01
    proposition: mature tree appears near north-west portion of parcel
    basis: THIRD_PARTY_RECORD
    exact stem/canopy geometry: UNKNOWN

  LEVELS-01
    proposition: detailed site levels
    state: UNKNOWN
    expected evidence: topographic survey

  GROUND-01
    proposition: ground/geotechnical condition
    state: UNKNOWN

  DRAIN-01
    proposition: below-ground drainage / sewer arrangement
    state: UNKNOWN

  TITLE-01
    proposition: material private-right constraints
    state: UNKNOWN

  UTIL-01
    proposition: utility capacity/connection conditions
    state: UNKNOWN
```

This fixture may support a coarse physical-size/orientation screening question.

It cannot support technical foundation, drainage, title, planning-judgement or utility-capacity conclusions.

## Representative manifest B — feasibility fixture

**Fixture identity:** `SM-EX-B`  
**Site kind:** `SYNTHETIC_TEST`  
**Purpose:** demonstrate a substantially investigated but still pre-technical-design site.  
**Important:** entirely synthetic.

```text
SITE
  siteId: TEST-PLOT-B
  kind: SYNTHETIC_TEST
  coordinate frame: LOCAL-01 tied to declared survey control
  vertical datum: DATUM-B

CLAIMS
  PARCEL-GEOM-01
    basis: MEASURED
    evidence: E-TOPO-B
    scope: represented physical boundary features
    legal-boundary identity: UNRESOLVED

  LEVEL-SURFACE-01
    basis: MEASURED
    evidence: E-TOPO-B

  NBR-01 / NBR-02
    proposition: relevant neighbouring massing and visible opening geometry
    basis: MEASURED + OBSERVED
    evidence: E-TOPO-B, E-CONTEXT-B

  TREE-01
    proposition: stem/canopy geometry
    basis: MEASURED
    evidence: E-TREE-B
    root constraints: UNRESOLVED pending specialist scope if required

  SEWER-01
    proposition: recorded sewer route crosses eastern parcel zone
    basis: AUTHORITATIVE_RECORD
    evidence: E-SEWER-B
    surveyed physical verification: UNKNOWN

  GROUND-RISK-01
    proposition: desktop sources indicate no identified abnormal condition
    basis: THIRD_PARTY_RECORD / desktop evidence
    detailed bearing/strata: UNKNOWN
    replacement evidence: site investigation if accelerated/due

  TITLE-01
    proposition: registered title material reviewed for screening
    basis: AUTHORITATIVE_RECORD
    evidence: E-TITLE-B
    legal interpretation of covenant C-03: UNRESOLVED

  UTIL-01
    proposition: utility services recorded in street
    basis: AUTHORITATIVE_RECORD
    required new-connection capacity: UNKNOWN
```

This fixture can support materially stronger placement and feasibility work while still refusing technical claims that depend on unperformed site investigation, capacity confirmation or legal interpretation.

## Representative manifest C — technically investigated fixture

**Fixture identity:** `SM-EX-C`  
**Site kind:** `SYNTHETIC_TEST`  
**Purpose:** demonstrate site evidence appropriate to bounded technical-design questions.  
**Important:** entirely synthetic.

```text
SITE
  siteId: TEST-PLOT-C
  kind: SYNTHETIC_TEST
  coordinate frame: LOCAL-TECH-C tied to declared survey control
  vertical datum: DATUM-C

CLAIMS
  PARCEL / LEVEL / CONTEXT
    basis: MEASURED
    evidence: accepted current topographic/context survey

  GROUND-01
    proposition: interpreted strata and design-relevant geotechnical properties
    basis: EXTERNAL PROFESSIONAL DETERMINATION supported by investigation evidence
    evidence: E-GI-C, E-GEO-DET-C
    scope/limitations: explicit

  GROUNDWATER-01
    proposition: observed conditions during investigation period
    basis: MEASURED / OBSERVED
    evidence: E-GI-C
    long-term condition beyond evidence scope: not silently inferred

  SEWER-01
    proposition: route/level relevant to candidate interface
    basis: AUTHORITATIVE_RECORD + MEASURED verification where available
    evidence: E-SEWER-C, E-DRAIN-SURVEY-C

  UTIL-ELEC-01
    proposition: connection offer/capacity condition for declared demand
    basis: AUTHORITATIVE_RECORD / provider determination
    evidence: E-UTILITY-C
    sourceAsOf: explicit

  TREE-01
    proposition: tree geometry and specialist design-relevant interpretation
    basis: MEASURED + EXTERNAL PROFESSIONAL DETERMINATION
    evidence: E-ARB-C

  TITLE-01
    proposition: legal constraints relevant to proposed development
    basis: AUTHORITATIVE_RECORD + EXTERNAL PROFESSIONAL DETERMINATION where needed
    evidence: E-TITLE-C, E-LEGAL-C

  FLOOD-01
    proposition: applicable recorded/site-specific conditions used by technical study
    basis: AUTHORITATIVE_RECORD / calculation / professional evidence as scoped
    evidence: E-FLOOD-C
```

Even this fixture is not globally “complete”.

It may still contain future construction/as-built facts that cannot yet exist.

## Manifest snapshot example

A machine-readable implementation might later resemble this shape conceptually:

```text
manifest:
  id: SM-0007
  site: SITE-0001
  siteKind: REAL
  version: 7
  parent: SM-0006
  coordinateFrame: FRAME-01
  claims:
    - BOUNDARY-01@v3
    - LEVEL-01@v2
    - TREE-04@v1
    - SEWER-02@v2
    - TITLE-07@v1
  explicitUnknowns:
    - GROUND-BEARING-01
    - UTILITY-CAPACITY-01
  assumptions:
    - A-GROUND-01
  evidenceRefs:
    - E-TOPO-03
    - E-SEWER-02
    - E-TITLE-01
```

This is illustrative only.

DPL-06 does **not** authorise an implementation schema or new compiler package.

## Site claim versus obligation status

Do not write:

```text
siteClaim.status = PASS
```

A site claim is a represented proposition with an epistemic basis.

An obligation uses site claims/evidence and can then receive an existing obligation result such as `PASS`, `FAIL`, `UNRESOLVED` or `EXTERNALLY_DISCHARGED`.

Example:

```text
SITE CLAIM
  measured gate width = 980 mm

OBLIGATION
  candidate construction-access criterion requires X

RESULT
  PASS / FAIL / UNRESOLVED according to admitted method
```

This avoids turning every measured fact into a miniature compliance check.

## Negative claims require care

Claims of absence can be consequential:

- no sewer;
- no tree;
- no contamination;
- no easement;
- no flood history;
- no utility constraint.

Absence should only be asserted where the evidence scope legitimately supports it.

A search that found nothing within its scope is not universal proof that the condition does not exist.

Where absence is not established, use `UNKNOWN` rather than a convenient false value.

## External identifiers and privacy

Real-site manifestations may later contain addresses, title references, utility records or other information that should not automatically enter public publication artefacts.

DPL-06 establishes no public-disclosure requirement.

The programme should retain stable internal identities and provenance while allowing sensitive/confidential artefacts to remain referenced externally or outside the public repository where appropriate.

The Reference Site remains synthetic precisely so canonical publication/testing work does not need to expose private real-site data.

## What belongs outside the site manifest

The following do **not** belong as raw site-manifest facts:

- “planning compliant”;
- “Building Regulations compliant”;
- “buildable envelope”;
- “Reference House compatible”;
- “acceptable overlooking”;
- “foundation type required”;
- “ramp required”;
- “sewer agreement required”;
- “BNG exempt” or equivalent legal conclusion;
- “safe”;
- “good access”;
- “suitable for development”;
- “site value” or commercial viability conclusion.

These are derived conclusions, architectural responses, external determinations or commercial judgements.

The manifest should contain the evidence-backed facts those conclusions depend on.

## Ownership boundaries

### DPL-06 owns

- site-claim semantics;
- manifest snapshot/version semantics;
- explicit unknowns;
- explicit assumptions;
- source/evidence links;
- site-claim time/scope/provenance requirements;
- separation of raw site representation from target/architectural/deployment conclusions.

### DPL-07 will own

The actual authored **Reference Site** fixture and its synthetic assumptions.

### DPL-08 will own

The architectural **site interface** and legitimate site-conditioned packages.

### DPL-09 / DPL-10 will own

Substantive England regulatory and London planning target families.

### DPL-11 will own

Due-diligence and interpretation of title/private constraints, Party Wall/boundary relationships, utility/sewer and other non-planning constraints where specialist/legal interpretation is required.

### DPL-12 will own

Executable orchestration of target + site + conformance + evidence + maturity semantics.

### DPL-14 will own

The real London plot corpus used to attack these abstractions empirically.

## Anti-patterns / forbidden collapses

DPL-06 forbids the following modelling shortcuts:

### Manifest = real site

The repository representation is always partial and correctable.

### Missing field = false

Unknown remains explicit.

### Assumption = fact

Assumptions are named dependencies with replacement evidence.

### Evidence document = claim

Evidence supports a proposition; its presence does not establish the proposition automatically.

### Site fact = legal/policy consequence

Targets and professional judgement determine consequences.

### Site fact = architectural response

The site interface / authoring process determines the response.

### Mapped geometry = exact legal geometry

Keep source scope explicit.

### “No issue found” = absence proved

Negative claims require evidence capable of supporting absence.

### Latest manifest overwrites history

Historical deployment results retain the exact site-manifest identity they used.

### Profile = site quality

DPL assurance profiles define due claims, not a universal quality score for the site dataset.

### One confidence percentage

Expose evidence type, scope, recency and unknowns instead.

## Consequences for downstream DPL

### DPL-07 — Reference Site

The Reference Site should use this manifest model but mark every authored fixture claim as synthetic/assumed/derived as appropriate.

Its value comes from making assumptions explicit, not from pretending to be empirical London evidence.

### DPL-08 — site interface

DPL-08 can now author site-conditioned architectural responses against stable site-claim identities without mutating the site layer.

### DPL-09 / DPL-10

Target applicability must consume manifest claims through explicit conditions. A target may request facts not yet present; that creates unresolved obligations rather than default values.

### DPL-11

Private/legal/utility constraints can be represented as claims/evidence while specialist interpretation remains separate.

### DPL-12

An executable deployment case should fingerprint or otherwise retain the exact site-manifest identity used for its result.

### DPL-14 / DPL-15

Real-plot trials must be allowed to expose missing site-claim categories. DPL-06 is a controlled foundation, not a claim that the ontology is empirically exhaustive before contact with real plots.

## Foundation questions deliberately left open

DPL-06 does not yet decide:

1. the final TypeScript/JSON schema;
2. the canonical coordinate/reference system for the Reference Site;
3. exact survey/evidence requirements for real London plots;
4. which site claims DPL-09/DPL-10 will require at each profile;
5. how title/legal interpretations are encoded after DPL-11 research;
6. exact confidentiality/storage treatment for real-site artefacts;
7. how geometric uncertainty/tolerance is represented computationally where a source supplies it;
8. which real-site claims become native compiler geometry versus external evidence references;
9. whether some high-volume context datasets should be referenced rather than copied into the manifest;
10. the eventual real-plot acquisition/import workflow.

These are deliberately passed forward rather than guessed.

## DPL-06 acceptance check

The packet is satisfactory if a later deployment case can distinguish all of the following without category collapse:

```text
1. A real condition exists independently of the model.
2. The project holds a claim about that condition.
3. The claim has a declared basis, scope and time.
4. Evidence supports, qualifies or contradicts the claim.
5. An assumption may provisionally stand in for an unknown only when explicit.
6. A target may use the claim to decide applicability or create an obligation.
7. An architect may use the claim to author a site-interface response.
8. The compiler evaluates the admitted candidate against those obligations.
9. The resulting deployment conclusion retains the exact manifest identity.
10. Better evidence can correct the manifest and selectively invalidate dependent results without rewriting history.
```

## Packet conclusion

DPL now has a clean input separation:

```text
REFERENCE HOUSE CONFORMANCE
        DPL-02
           │
           │
ASSURANCE / RESULT SEMANTICS
        DPL-03
           │
           │
ASSURANCE PROFILES
        DPL-04
           │
           │
EXTERNAL NORMATIVE MODELS       SITE-REALITY CLAIM MODELS
        DPL-05                           DPL-06
           │                                │
           └──────────────┬─────────────────┘
                          ↓
                 future deployment case
```

DPL-05 answers:

> **What external normative environment are we evaluating against?**

DPL-06 answers:

> **What do we presently claim to know or assume about this site, and on what basis?**

Neither answers:

> **What should the architecture become?**

That remains an authored architectural question constrained by DPL-02 and later site-interface work.

This preserves the programme’s governing rule:

> **Compatibility before adaptation.**

and its epistemic rule:

> **The compiler should expose the limits of what the project knows rather than fill those limits with convenient defaults.**
