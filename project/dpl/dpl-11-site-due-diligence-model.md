# DPL-11 — Site Due-Diligence and Non-Planning Constraint Model

**Issue:** [#350 — DPL-11 — define site due-diligence and non-planning constraint model](https://github.com/adamnoden/architecture/issues/350)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Research date:** 2026-10-20  
**Baseline `main`:** `9921cd9b10a85349b484f0d9267336c043574a16`  
**Geographic posture:** England / London first implementation, with provider/authority identity remaining site-specific  
**Status:** due-diligence authority/evidence model; **not** legal advice, a site investigation, a utility offer or a declaration that any real plot is buildable

## Question

> **What private-law, infrastructure, ground, access, utility and other due-diligence conditions can block or reshape deployment, who has authority to establish them, and how should DPL represent them without laundering them into planning or compiler-native proof?**

DPL-11 defines the non-planning deployment constraint model.

It does not perform due diligence on a real site.

## Executive conclusion

A plausible London plot can satisfy planning and Building Regulations questions and still be **undeployable** because of a materially different family of constraints.

Examples include:

- title/control defects or uncertainty;
- restrictive covenants or third-party rights;
- insufficient access rights;
- legal-boundary uncertainty;
- Party Wall procedures / adjoining-owner relationships;
- public sewers or drains conflicting with foundations;
- utility capacity or route constraints;
- unsuitable ground / groundwater / contamination / ground gas;
- tree-root / arboricultural engineering constraints;
- physical flood/water conditions;
- impossible construction access or temporary-works geography;
- unavailable neighbour/highway permissions required by the construction or maintenance method.

These are **not one ruleset**.

The correct DPL architecture is:

```text
SITE CLAIMS
   +
EXTERNAL RECORDS / SURVEYS / SEARCHES
   +
PROFESSIONAL / LEGAL / UNDERTAKER DETERMINATION
   ↓
NON-PLANNING OBLIGATIONS / CONSTRAINTS
   ↓
DEPLOYMENT CASE
```

The compiler may represent claims, evidence, applicability and accepted external determinations.

It must not impersonate:

- a solicitor/conveyancer;
- a boundary surveyor;
- a Party Wall surveyor;
- a structural/geotechnical engineer;
- an arboriculturist;
- a sewerage undertaker;
- a utility network operator;
- a highway authority;
- a court or tribunal.

## Governing separation

DPL-11 freezes four distinct layers.

### 1. Site fact / claim

Examples:

- a registered title reference exists;
- a physical fence is observed at a coordinate;
- a public sewer record shows a sewer line;
- a tree stem/canopy is surveyed;
- trial pits record a soil profile;
- an electricity network operator identifies a connection point;
- the street width is measured.

These are represented through DPL-06 site claims with provenance, time and scope.

### 2. Evidence / source record

Examples:

- official title register and title plan;
- filed deed;
- measured boundary/topographical survey;
- utility/sewer record;
- statutory undertaker response;
- geotechnical report;
- arboricultural survey;
- environmental search;
- neighbour agreement / licence / Party Wall award;
- utility connection offer.

Evidence is not automatically the legal/technical conclusion.

### 3. External determination / agreement

Examples:

- solicitor advice on covenant/easement effect;
- determined legal boundary / boundary agreement;
- Party Wall award;
- sewer diversion/build-over approval where relevant;
- structural/geotechnical design conclusion;
- accepted utility connection offer;
- oversail/access licence;
- highway licence;
- competent contamination/remediation conclusion.

The compiler may track that determination as external evidence.

### 4. Deployment consequence

Examples:

- route remains feasible;
- foundation interface requires a different site package;
- temporary access is unresolved;
- third-party consent is due;
- an assumed route is blocked;
- all conformance-preserving deployment routes are exhausted.

Only this last layer belongs in the DPL deployment conclusion, and only through DPL-03's evidence/route-exhaustion semantics.

## Constraint taxonomy

The taxonomy below is intentionally source/authority-led rather than a checklist of searches.

## DD-01 — title identity, ownership/control and registered extent

### Core questions

- What registered title(s) comprise the proposed development site?
- Who owns/controls them?
- Is the development relying on land outside the controlled title?
- Are there leasehold, charge, restriction or other interests material to the works?
- Do filed deeds/documents contain rights or burdens that the register alone does not explain fully?

### Evidence sources

Typical evidence includes:

- official copy of title register;
- official title plan;
- filed deeds/documents referred to by the register;
- conveyancer/solicitor review;
- contract/option evidence where site control is not yet ownership.

HM Land Registry practice material:

- title-plan guidance:  
  `https://www.gov.uk/government/publications/land-registry-plans-title-plan/land-registry-plans-title-plan-practice-guide-40-supplement-5`
- land-registration practice guides:  
  `https://www.gov.uk/government/collections/land-registration-practice-guides`

### DPL representation

Represent separately:

```text
title_record_id
registered_extent_source
registered_proprietor/control evidence
filed_document references
third-party entries
source retrieval date
legal review state
```

Do not represent `site_owned = true` merely because one title plan has been downloaded.

### Assurance posture

- `SCREENING`: title identity may be approximate/unconfirmed but must be flagged.
- `FEASIBILITY`: official title/register evidence normally due where land purchase/deployment decision depends on it.
- decision-critical acceleration: any visible access/boundary/control anomaly makes title evidence due immediately.

## DD-02 — legal boundary versus physical / survey boundary

This is a high-risk ontology boundary.

HM Land Registry states that most registered titles show **general boundaries**, not precise legal boundaries. There is no standard tolerance or measurement that converts the red title-plan line into an exact legal-boundary coordinate.

Official guidance:

- `https://www.gov.uk/government/publications/hm-land-registry-plans-boundaries-pg40s3/land-registry-plans-boundaries-practice-guide-40-supplement-3`
- `https://www.gov.uk/government/publications/boundary-agreements-and-determined-boundaries-pg40s4/practice-guide-40-land-registry-plans-supplement-4-boundary-agreements-and-determined-boundaries`

### Required DPL distinction

```text
REGISTERED_GENERAL_EXTENT
    ≠
OBSERVED_PHYSICAL_FEATURE
    ≠
MEASURED_SURVEY_COORDINATE
    ≠
LEGAL_BOUNDARY_DETERMINATION
```

A later site manifest should be able to hold all four without silently merging them.

### Native-computation restraint

A compiler may compute geometry against a **declared working boundary model**.

It must expose the model's authority:

- `SURVEY_WORKING_LINE`;
- `GENERAL_TITLE_EXTENT_APPROXIMATION`;
- `DETERMINED_BOUNDARY`;
- other explicit status.

It may not convert an HM Land Registry general boundary into millimetre-precise legal buildable width.

### Acceleration trigger

Boundary precision becomes decision-critical early where:

- side clearances are tight;
- foundations/retaining walls approach the boundary;
- access route width depends on centimetres;
- Party Wall / excavation applicability depends on relative geometry;
- maintenance access relies on neighbour land;
- a sewer/utility corridor runs near the edge.

## DD-03 — covenants, restrictions and third-party interests

### Core questions

- Does the title/register/deed record a restrictive covenant relevant to building/use/form?
- Is a restriction or notice registered?
- Are there estate-management/consent provisions?
- Who has the benefit/burden and is it enforceable in the proposed circumstances?
- Is release/modification/consent available or required?

HM Land Registry's registers can record notices/restrictions and other third-party interests, but legal interpretation remains a professional/legal matter.

Useful source family:

`https://www.gov.uk/government/publications/notices-restrictions-and-protection-of-third-party-interests-pg19/practice-guide-19-notices-restrictions-and-the-protection-of-third-party-interests-in-the-register`

### DPL representation

A raw covenant entry should be represented as:

```text
source_record
burden text/reference
beneficiary/affected land if evidenced
legal_interpretation_state
consent/release/modification state
```

Do **not** create:

```text
covenant = "BLOCKS_HOUSE"
```

unless that conclusion is supplied as an accepted external legal determination for the exact proposal.

### Assurance posture

Potentially decision-critical at `SCREENING`/`FEASIBILITY`, especially before land acquisition.

A credible restrictive-title risk accelerates competent legal review.

## DD-04 — easements, rights of way, access rights, service rights and wayleaves

### Core questions

- Does the site have lawful vehicular/pedestrian access required by the proposal?
- Are service routes supported by rights where they cross third-party land?
- Does another property exercise rights over the site?
- Are there rights to enter for maintenance/repair?
- Are utility wayleaves/easements restricting construction zones?

HM Land Registry practice guide 62 covers registration of easements but is explicitly not a general legal guide to easement law:

`https://www.gov.uk/government/publications/easements-pg62/practice-guide-62-easements`

That is precisely the DPL boundary.

### Site-interface consequence

A service route that is geometrically possible but lacks an established right is **not a proven route**.

A deployment candidate may therefore carry:

```text
physical route:             FEASIBLE
legal route authority:      EVIDENCE_REQUIRED
accepted legal conclusion:  unresolved
```

## DD-05 — rights to light / air and related private rights

Private rights to light are not simply the same thing as planning daylight/sunlight/amenity policy.

Where evidence indicates such rights may be material, keep two obligation families:

```text
PRIVATE_RIGHT / LEGAL DETERMINATION
        ≠
PLANNING DAYLIGHT / SUNLIGHT / AMENITY
```

HM Land Registry maintains separate practice guidance on registration aspects of rights to light or air within its practice-guide collection.

The compiler should not attempt to decide acquisition, prescription, infringement, remedies or compensation.

## DD-06 — Party Wall etc. Act 1996 relationships

The Party Wall etc. Act 1996 is a separate statutory/private-neighbour process from planning permission and Building Regulations.

Current GOV.UK explanatory guidance states explicitly that agreement/requirements under the Act do not remove the need for planning/building-regulations compliance, and the reverse is also true.

Official guidance:

`https://www.gov.uk/government/publications/preventing-and-resolving-disputes-in-relation-to-party-walls/the-party-wall-etc-act-1996-explanatory-booklet`

Potential trigger families include:

- work to/on party structures;
- construction at/astride certain boundary conditions;
- excavation near neighbouring buildings where statutory geometry/depth tests apply.

### DPL representation

The compiler may eventually perform bounded geometry to identify **potential applicability** where authoritative neighbour/foundation geometry exists.

It must not itself produce:

- a legally valid notice;
- consent;
- dissent;
- surveyor appointment;
- Party Wall award;
- legal interpretation of disputed ownership.

These remain process/external evidence.

### Assurance posture

Normally feasibility/planning-to-technical transition, but accelerated where:

- the Reference House sits close to existing neighbours;
- deep foundations/retaining works are plausible;
- site access depends on adjoining land;
- construction sequencing is materially affected.

## DD-07 — public sewers, lateral drains and statutory-undertaker access

### Core questions

- Where are public sewers/lateral drains relative to the proposed building/foundations?
- What are their diameter/depth/material/ownership status?
- Is diversion required or possible?
- Is build-near/build-over approval applicable?
- Must statutory-undertaker access be preserved?
- Where can foul/surface-water connections lawfully/technically occur?

### London first implementation

For sites served by Thames Water, current developer guidance states that construction over/near public sewers is constrained by undertaker requirements. It states that build-over agreements are required for certain works within stated distances and that **new properties should generally use sewer diversion rather than building over the sewer**.

Official/current provider guidance:

- `https://www.thameswater.co.uk/developers/larger-scale-developments/sewers-and-wastewater/developing-over-or-near-sewers`
- `https://www.thameswater.co.uk/help/home-improvements/do-i-need-a-build-agreement`

Provider identity must remain a site claim. Do not hard-code Thames Water into generic DPL doctrine.

### Critical authority separation

Thames Water explicitly notes that planning permission does not itself grant permission to build over a sewer/drain.

Therefore:

```text
PLANNING PERMISSION
      ≠
SEWER UNDERTAKER AGREEMENT / DIVERSION APPROVAL
      ≠
PART H / TECHNICAL DRAINAGE COMPLIANCE
```

These may constrain the same geometry while remaining separate obligations.

### Site-interface consequence

A sewer conflict may be solved by:

- compatible foundation/interface design;
- sewer diversion;
- revised external drainage route;
- another conformance-preserving site solution.

Only where those routes are exhausted should DPL consider whether the site is incompatible or whether an architectural rewind is required.

## DD-08 — utility location, connection availability and capacity

Utility due diligence is not one binary `utilitiesAvailable` field.

Represent separate service families, potentially including:

- electricity;
- potable water;
- foul sewer;
- surface-water route where relevant;
- electronic communications;
- gas only if the project later requires it;
- other district/local infrastructure where relevant.

For each service distinguish:

```text
existing apparatus location
network/operator identity
connection point
route rights
capacity / offer state
reinforcement requirement
cost/lead-time evidence where project-critical
final service-entry interface
```

A desktop network map is not a connection offer.

A connection offer is not proof that the internal service geography works.

A technically possible connection is not proof of legal route rights across third-party land.

### Assurance posture

- screening: broad availability may remain indicative;
- feasibility: material route/capacity risk should be investigated;
- technical design: accepted connection strategy and provider evidence normally due;
- construction/as-built: installed connection/commissioning records supersede forecasts.

Decision-critical acceleration applies where a network diversion/reinforcement or unavailable route could invalidate the land decision.

## DD-09 — ground, geotechnics and foundation evidence

### Site claims

Potentially material claims include:

- geology/soil sequence;
- bearing characteristics;
- shrink/swell potential;
- made ground;
- groundwater;
- basement/nearby foundation conditions;
- historic workings/voids where relevant;
- tree-related ground interaction;
- aggressive ground/chemical conditions;
- slope/stability conditions.

### Evidence ladder

Typical progression:

```text
desktop geology/history
      ↓
site reconnaissance
      ↓
intrusive investigation
      ↓
laboratory/testing evidence
      ↓
geotechnical interpretation
      ↓
structural foundation design
```

The compiler should not infer safe foundation capacity from a postcode/geological map alone.

### DPL relationship

- DPL-06 owns the physical claims/evidence identity;
- DPL-09 Part A/C/Regulation 7 obligations may consume them;
- DPL-08 owns the house↔ground site-interface response;
- external competent engineering owns final foundation adequacy.

A difficult ground condition is not automatically a site failure if a conformance-preserving competent foundation solution exists.

## DD-10 — contamination, ground gas and environmental ground conditions

Keep separate:

- evidence that a physical hazard/contaminant may exist;
- planning remediation obligations;
- Building Regulations / technical site-preparation obligations;
- environmental/statutory regulator requirements;
- competent remediation design/verification.

The same site condition may trigger several target families.

DPL must not create one `contaminationStatus` whose value is interpreted simultaneously as planning, legal and technical clearance.

## DD-11 — groundwater, flood and water conditions

Physical water conditions can affect deployment outside the planning classification alone.

Potential site claims:

- observed/recorded groundwater;
- surface-water pathways;
- watercourse proximity;
- historic flooding evidence;
- sewer surcharge evidence;
- site levels and low points;
- infiltration test results;
- drainage-outfall availability.

Separate downstream obligations may include:

- planning flood/drainage evidence under DPL-10;
- Part H / technical drainage obligations under DPL-09;
- foundation/waterproofing/interface response under DPL-08;
- statutory undertaker / riparian / other third-party consents where applicable.

## DD-12 — trees and arboricultural / foundation constraints

A tree is simultaneously capable of being:

- a physical site object;
- a planning-designation/policy object;
- an arboricultural condition;
- a foundation/ground interaction;
- a construction-logistics constraint.

Keep those obligations separate.

Site claims may include:

- species where competently identified;
- stem location/diameter;
- canopy extent;
- condition/age class;
- root-protection evidence where professionally established;
- TPO/conservation status as a separate administrative source claim.

Do not infer root geometry or foundation effect from canopy geometry alone.

DPL-RS-01's synthetic mature tree remains **physical synthetic friction**, not a TPO or professional arboricultural conclusion.

## DD-13 — construction access, temporary works and logistics

A completed house can fit on a plot while its construction remains implausible.

DPL should preserve site claims/evidence for:

- site entrance width/height;
- delivery vehicle access;
- crane/pump/scaffold/tower working zones;
- material storage/staging;
- excavation spoil route;
- neighbour/highway oversail/access dependency;
- temporary drainage/dewatering where relevant;
- street restrictions/parking/loading conditions;
- temporary service interruptions/diversions;
- retained emergency/public access where relevant;
- build sequence where it materially affects feasibility.

### External permissions

Where construction relies on neighbour/highway land, distinguish:

```text
physical possibility
      ≠
legal right / licence
      ≠
highway authority permit
      ≠
contractor method statement
```

A future deployment compile can expose the dependency and track the resulting evidence.

It should not invent permission.

## DD-14 — future maintenance access and third-party dependency

The Reference House already protects credible ordinary maintenance geography.

Real deployment must test whether:

- façade/roof access can occur from controlled land/highway with credible permissions;
- plant replacement remains possible;
- courtyard logistics remain available;
- drains/chambers remain inspectable;
- future maintenance does not depend on an unowned strip whose access right does not exist.

A neighbour-access assumption must remain an explicit external-rights question.

DPL-08 later owns the architectural/site-interface response; DPL-11 owns the evidence/authority category.

## DD-15 — abnormal / site-specific constraints

No closed taxonomy will capture every real property.

The due-diligence model therefore needs an extension seam for site-specific constraints such as:

- retained structures;
- tunnels/transport infrastructure;
- unusual statutory undertaker apparatus;
- mines/voids;
- ransom strips;
- unusual estate management controls;
- shared private drainage;
- private roads;
- bespoke access licences;
- other third-party infrastructure/rights.

Extension must retain:

- source authority;
- site claim identity;
- external determination/evidence state;
- DPL result semantics;
- no silent promotion into generic doctrine.

## Due-diligence evidence matrix

| Family | Raw site evidence | Typical external authority / competent source | Native role | Default assurance horizon | Acceleration trigger |
|---|---|---|---|---|---|
| title/control | title register/plan, deeds | HMLR + solicitor/conveyancer | identity/provenance only | feasibility | ownership/access anomaly |
| legal boundary | title evidence + topo/physical survey | surveyor / legal determination / agreement | geometry against declared working model | feasibility→technical | tight clearance / boundary works |
| covenants/restrictions | register/deeds | solicitor / beneficiary/court where needed | track question/evidence | feasibility | apparent building/use restriction |
| easements/access | deeds/register/site evidence | solicitor / rights-holder | route geometry + evidence state | feasibility | sole access/service route affected |
| Party Wall | neighbour/foundation geometry | Act/process + appointed surveyor(s) | bounded trigger screening only | feasibility→technical | close/deep excavation |
| sewer/drain | undertaker record/survey | sewerage undertaker + drainage professional | spatial conflict/applicability | feasibility→technical | sewer under footprint |
| utilities | operator maps/offers | relevant network operator | route/capacity state tracking | feasibility→technical | reinforcement/diversion risk |
| ground/geotech | investigation/report | geotechnical + structural engineer | evidence orchestration | technical; earlier if risky | made ground/tree/slope/water risk |
| contamination/gas | searches/investigation | environmental specialist/regulator as relevant | evidence state | feasibility→technical | historic risk signal |
| groundwater/flood | records/survey/testing | competent drainage/flood professional + authorities | geometry/input orchestration | feasibility→technical | known flood/groundwater issue |
| trees | topo/arboricultural survey | arboriculturist + planning authority for designation | spatial inputs only | feasibility | dominant tree near footprint |
| construction logistics | survey/highway/temporary works plan | contractor/temporary works designer/highway/rights-holder | geometric route tests | technical/construction | constrained street/site access |
| maintenance rights | title/access evidence | legal adviser/rights-holder | route test | feasibility→technical | sole maintenance route off-site |

The table is a default horizon only.

DPL-04 decision-critical acceleration overrides it whenever current evidence shows that the question could overturn the present land/project decision.

## Selective invalidation / staleness

Due-diligence evidence has different lifetimes.

A later site system should avoid one global `dueDiligenceValidUntil` field.

Examples:

### Title evidence

Potential invalidators:

- transfer/new title;
- new/released charge/restriction;
- deed/agreement;
- boundary determination;
- newly discovered filed document.

### Utility evidence

Potential invalidators:

- revised connection offer;
- network reinforcement/change;
- design load change;
- route change;
- offer expiry.

### Geotechnical evidence

Potential invalidators:

- new investigation contradicting model;
- footprint/foundation concept change;
- groundwater observation change;
- newly discovered contamination/void;
- relevant tree removal/addition/maturity change.

### Arboricultural evidence

Potential invalidators:

- tree removal/failure/growth/condition change;
- revised survey;
- designation change;
- footprint/access change.

### Party Wall / neighbour evidence

Potential invalidators:

- design/excavation change;
- ownership change;
- expiry/change of notice/award circumstances;
- changed temporary-works method.

The DPL case fingerprint should therefore depend on the exact accepted evidence set rather than a generic “searches complete” flag.

## Interaction with DPL-08 — site interface

DPL-11 supplies **constraints and evidence**, not the site-interface design.

Examples:

```text
geotechnical evidence
     ↓
DPL-08 foundation interface response

public sewer geometry / undertaker constraint
     ↓
DPL-08 drainage/foundation/site routing response

utility connection point + route rights
     ↓
DPL-08 external service approach

working boundary + access rights
     ↓
DPL-08 approach / grading / maintenance solution
```

A DPL-08 solution must keep the source obligation visible. It must not solve an evidence problem by drawing a convenient route through land we do not control.

## Interaction with DPL-09 — England technical target

Shared facts can trigger technical obligations without merging authority.

Examples:

- ground evidence → Part A/C/site preparation questions;
- sewer/drainage facts → Part H questions;
- parking/utilities → Part S/electrical questions where applicable;
- material/site conditions → Regulation 7/product evidence.

DPL-09 remains the regulatory authority owner.

DPL-11 owns site/external evidence and non-planning consent/determination state.

## Interaction with DPL-10 — planning target

The same physical fact may drive both planning and non-planning questions.

Examples:

```text
TREE
 ├── DPL-10 planning policy / TPO / design question
 ├── DPL-11 arboricultural / ground constraint
 └── DPL-08 foundation / construction response

SEWER
 ├── DPL-10 planning/drainage context where relevant
 ├── DPL-11 undertaker rights/approval/physical constraint
 ├── DPL-09 Part H technical obligations
 └── DPL-08 route/foundation interface
```

Never merge the resulting statuses merely because the site object is shared.

## Interaction with DPL-07 Reference Site

DPL-11 validates DPL-RS-01's decision to leave title/private rights, ground, detailed sewers, utilities and several environmental facts explicitly unknown.

A canonical deployment compile should **not** silently turn those unknowns into clean assumptions simply to obtain a result.

Where the Reference Site needs a synthetic scenario value later, it should be introduced as an explicit synthetic/assumed claim with:

- scenario purpose;
- provenance;
- replacement evidence expected on a real site;
- invalidation consequence;
- no claim of empirical representativeness.

## Recommended downstream decomposition

DPL-11 is an inventory/model packet. Substantive implementation should split only where a real independent authority seam exists.

### DPL-11A — title / boundaries / private-rights evidence spine

Own:

- title/register/deed evidence types;
- general-boundary versus working-survey model;
- covenants/restrictions/easements/rights evidence states;
- external legal-determination boundary;
- site-control/route-right applicability contract.

No native legal interpretation.

### DPL-11B — sewer / utility / external-infrastructure evidence spine

Own:

- statutory undertaker/provider identity;
- sewer/drain records;
- build-near/diversion/agreement state;
- utility mapping/offer/capacity/route-right distinctions;
- cross-target handoff to DPL-08/DPL-09.

### DPL-11C — ground / water / environmental investigation spine

Own:

- geotechnical/environmental evidence progression;
- contamination/ground-gas/groundwater physical claims;
- selective staleness;
- external professional evidence boundary;
- interface with foundation/drainage design.

### DPL-11D — neighbour / Party Wall / construction-logistics spine

Own:

- potential Party Wall applicability inputs;
- notice/award external evidence states;
- neighbour access/oversail/licence dependency;
- highway/temporary-access evidence;
- construction/maintenance route dependency.

### DPL-11E — integrated due-diligence adversarial closeout

Own:

- cross-family omission test;
- false-clearance regression;
- evidence staleness/selective invalidation;
- assurance-profile due-now rules;
- real-plot replay with DPL-14.

These should not be opened until programme sequencing decides whether DPL-12 or real-plot work needs them.

## Explicit non-claims

DPL-11 does **not** establish that:

- any real or synthetic site has clean title;
- a title plan proves an exact legal boundary;
- a physical fence proves the legal boundary;
- a covenant/easement entry legally prevents or permits the Reference House;
- Party Wall applicability/notice/award can be finally decided by the compiler;
- planning permission grants sewer-build-over rights;
- a sewer record is necessarily survey-accurate enough for construction;
- a utility map proves connection capacity;
- desktop geology proves foundation adequacy;
- a tree canopy proves root geometry;
- planning approval resolves private rights;
- Building Regulations approval resolves private rights;
- an architect can assume neighbour land for scaffold, maintenance or crane oversail;
- unresolved due-diligence evidence is equivalent to a pass.

## Acceptance assessment

DPL-11 succeeds at model/inventory scope if later deployment work can answer:

- what non-planning constraint family a fact belongs to;
- what evidence supports the fact;
- who/what has authority to determine its legal/technical consequence;
- whether the compiler can perform a bounded applicability/geometric test or must await external determination;
- at what assurance profile the obligation is normally due;
- what credible red flag accelerates it;
- what evidence change makes the previous result stale;
- how the result constrains DPL-08 without silently rewriting Reference House architecture.

The model supports those questions.

It deliberately stops before site-specific legal, engineering or utility determination.
