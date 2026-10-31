# DPL-14A — Real London Plot Corpus Protocol and Selection Frame

**Issue:** [#361 — DPL-14A — real London plot corpus protocol and selection frame](https://github.com/adamnoden/architecture/issues/361)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Authorised by:** [#356 — DPL-WA Wave A integration and DRW rendezvous](https://github.com/adamnoden/architecture/issues/356)  
**Depends on:** DPL-06 site-manifest model and [DPL-07 Reference Site](dpl-07-reference-site.md)  
**Research / protocol date:** 2026-10-20  
**Baseline `main`:** `61a0db9cc7a5b33b97742c1320cc28b681959455`  
**Geographic scope:** Greater London first corpus  
**Status:** empirical corpus protocol; **not** the substantive plot corpus, a land search, a purchase shortlist or a deployment-envelope result

## Question

> **What real plots should we admit, what evidence is sufficient at screening level, and how do we select a varied corpus that attacks rather than confirms the Reference Site and deployment abstractions?**

DPL-14A freezes the collection and admission method before enough real examples exist to bias the method around convenient sites.

---

# 1. Result

The first DPL real-site corpus will be a **deliberately varied adversarial sample**, not a statistical claim about London land.

Its purpose is to attack:

- `DPL-RS-01` assumptions;
- the DPL-06 site-manifest ontology;
- DPL-02 conformance boundaries;
- DPL-08A site-interface package coverage;
- DPL-09/10/11 authority/applicability seams;
- eventual compiler orchestration assumptions.

The governing rule is:

> **Select for coverage of materially different deployment conditions, not for similarity to the Reference Site and not for likelihood of success.**

The first substantive corpus target is:

```text
24 admitted plots
+
up to 6 reserve plots
```

The number is a programme sampling choice, not a claim of statistical representativeness.

Twenty-four is large enough to require repeated examples rather than anecdotes, while still small enough that every site can retain human-readable provenance and uncertainty instead of becoming a scraped data lake.

The corpus should span **at least eight London boroughs before any borough contributes more than four admitted plots**, unless genuine market/source scarcity is documented and the exception is explicitly approved.

No single borough should become the default planning target merely because it was convenient to research first.

---

# 2. What the corpus is — and is not

## It is

- a controlled set of `REAL` DPL site manifests at `SCREENING` assurance profile;
- an empirical stress test of the deployment model;
- a source of recurring site-condition patterns;
- a disciplined way to discover missing ontology categories;
- an evidence base for selecting the first borough proof target;
- an eventual input to real-plot deployment trials.

## It is not

- a claim to be statistically representative of Greater London;
- a market survey;
- a valuation exercise;
- a property recommendation list;
- a purchase shortlist;
- a dataset of sites already known to fit the Reference House;
- a substitute for title, survey, planning, utilities, drainage or geotechnical due diligence;
- a source of exact legal boundaries;
- permission to scrape or republish third-party property content.

## Forbidden aggregate labels

Do not assign plots:

- a `London-ness score`;
- a `compatibility score` before DPL-15;
- a `desirability score`;
- a single `site quality` percentage;
- a synthetic `planning likelihood` number.

Selection is coverage-driven and reasoned explicitly.

---

# 3. Geographic frame

The first corpus is bounded to **Greater London**.

This is deliberate because:

- DPL-10’s first planning target is Greater London;
- London supplies a sufficiently varied low-rise residential context without changing strategic planning jurisdiction mid-corpus;
- a borough plug-in can then be selected from actual admitted sites rather than chosen abstractly;
- the eventual project goal is deployment onto a plausible London residential plot.

A site outside Greater London is not admitted to Corpus 1 merely because it is close to London or useful to a commuter.

Those sites may form a later generality corpus under a separate target composition.

## Geographic diversity rule

The collector should seek geographic spread, but geographic spread is a means rather than a demographic proxy.

Do **not** select boroughs based on the protected characteristics, socioeconomic composition or presumed identity of their residents.

Relevant geographic/context variation is physical and regulatory:

- inner/denser versus outer/looser urban form;
- strategic/local planning source composition;
- plot morphology;
- street/access condition;
- heritage/environmental context;
- land geometry;
- topography/water/tree conditions where publicly evidenced.

---

# 4. Candidate site class

The first corpus studies sites on which deployment of **one new low-rise detached dwelling** is at least a meaningful question.

A candidate may be:

- vacant/cleared residential land;
- an infill or side-garden parcel;
- a backland/flag plot;
- a corner/edge parcel;
- a single-dwelling replacement/redevelopment site;
- another bounded residential plot where a one-dwelling deployment question is genuinely intelligible.

## Planning permission is not required for admission

A plot may be admitted with:

- no planning permission;
- outline/other planning history;
- an existing or lapsed permission;
- a permission for a different dwelling;
- a marketing statement claiming development potential.

Each of those is a different claim/evidence state.

Do not infer:

```text
advertised as development land
        ↓
residential permission exists
```

or:

```text
permission for another house
        ↓
Reference House acceptable
```

## Existing buildings

A site containing an existing building may be admitted where the corpus question is replacement/redevelopment.

The existing-building condition must be recorded and must not be silently treated as `cleared`.

Demolition, reuse, embodied-carbon, heritage and lawful-use questions remain separate obligations.

## Exclusions from Corpus 1

Exclude by default:

- major multi-unit development sites whose natural planning/development unit is not one dwelling;
- strategic estate/masterplan parcels;
- agricultural/rural holdings with no meaningful London residential-plot comparison;
- commercial/industrial sites whose residential conversion/redevelopment question dominates the deployment question;
- sites outside Greater London;
- listings without enough location/context evidence to create even a screening manifest;
- duplicate marketing entries for the same underlying parcel unless retained explicitly as a source-comparison case;
- fictional/example listings;
- sites whose only available evidence requires bypassing access controls or retaining source material on terms the project has not reviewed.

A site is **not** excluded merely because it looks difficult, narrow, sloped, tree-constrained, heritage-sensitive or likely to reject the Reference House.

---

# 5. Corpus size and composition

## Primary target

```text
ADMITTED: 24
RESERVE:  up to 6
```

The reserve exists to replace a source that disappears, proves duplicated, or becomes unusable before the substantive corpus freeze.

Reserve sites are not silently promoted; promotion is recorded with reason and date.

## Borough coverage

Before any borough contributes more than four admitted plots:

```text
minimum distinct boroughs: 8
```

This prevents the first local-policy environment encountered from becoming the project’s unconscious definition of “London”.

The corpus need not allocate identical counts to every borough.

## Intentional repetition

Variation alone is not enough. A corpus of 24 completely unique oddities cannot reveal recurring failure modes.

Therefore retain some deliberate near-replicates where they test whether a condition recurs, for example:

- several ordinary street-front plots with different widths;
- multiple narrow plots in different boroughs;
- more than one mature-tree condition;
- more than one backland/access-constrained condition.

The collector must identify a plot as either:

- `COVERAGE_ADDITION` — adds a materially underrepresented condition; or
- `INTENTIONAL_REPLICATE` — repeats a condition deliberately to test recurrence.

A duplicate-looking plot admitted for no stated reason is corpus drift.

---

# 6. Diversity axes

The corpus is selected against a **coverage matrix**, not a weighted score.

A site may cover several axes simultaneously.

## 6.1 Apparent parcel width / frontage

The Reference House is 12.0 m wide.

Two existing project comparators matter:

- DRW synthetic width stress test: **15.5 m** overall surrogate width;
- `DPL-RS-01`: **17.4 m** parcel width.

The first corpus must deliberately contain sites:

- apparently narrower than 15.5 m;
- between the 15.5 m stress-test width and 17.4 m Reference Site width;
- around/above the Reference Site width;
- materially wider than the Reference Site.

These are selection relationships, not legal/survey thresholds.

Where source precision is poor, record the width relation as uncertain rather than rounding a map measurement into a false bin.

## 6.2 Apparent parcel depth

`DPL-RS-01` is 30.0 m deep.

The corpus must include:

- shallower apparent parcels;
- parcels around the Reference Site depth;
- materially deeper parcels;
- irregular cases where one `depth` value is a misleading description.

Do not invent an exact depth if the source only supports approximate geometry.

## 6.3 Shape / boundary morphology

Seek coverage of:

- roughly rectangular;
- tapering;
- corner/dual-frontage;
- flag/backland;
- irregular/notched;
- plots whose apparent working boundary is uncertain enough to matter.

The corpus records a **working geometry claim**, never an exact legal boundary unless accepted legal/survey evidence actually establishes one.

## 6.4 Street / access relationship

Seek materially different conditions such as:

- direct ordinary street frontage;
- corner/dual frontage;
- long/narrow access strip;
- shared access;
- backland access;
- constrained construction approach;
- apparent vehicle/pedestrian access asymmetry.

Physical access and legal access rights remain separate claims per DPL-11.

## 6.5 Orientation

Avoid a corpus in which every apparent frontage happens to face the same compass direction.

Seek examples across the broad orientation field so the house-placement/mirroring logic is attacked by:

- north-ish frontage;
- east-ish frontage;
- south-ish frontage;
- west-ish frontage;
- oblique/irregular frontage where cardinal shorthand is inadequate.

Orientation should come from an identified mapping/reference source, not marketing prose alone.

## 6.6 Neighbour / edge condition

Seek:

- ordinary two-sided low-rise neighbours;
- materially close side relationships;
- one open/edge flank;
- corner conditions;
- backland neighbour exposure;
- context where neighbour openings/amenity are plausibly material but exact geometry remains unknown.

Do not infer window ownership, rights or planning harm from aerial imagery.

## 6.7 Topography / levels

Seek a mixture of:

- apparently level/low-relief sites where evidence supports that description;
- visible/recorded front-to-rear fall;
- visible/recorded cross-fall;
- retaining/level-change conditions;
- `UNKNOWN` where public evidence does not support a responsible conclusion.

`UNKNOWN` is valuable corpus coverage; it proves the screening model can remain useful without pretending to possess a topographical survey.

## 6.8 Trees / vegetation

Seek:

- no material mature tree visible in the evidenced site area;
- one or more material mature trees;
- edge/neighbour tree conditions;
- tree condition/designation unknown.

A visible tree is not a Tree Preservation Order claim.

TPO/conservation status requires the appropriate official source where later checked.

## 6.9 Heritage / townscape context

Include some sites where official or clearly evidenced context raises questions such as:

- conservation area;
- listed-building setting;
- locally designated heritage/townscape context;
- otherwise sensitive existing character.

Also include ordinary contexts without a known heritage trigger.

Do not infer `NOT_IN_CONSERVATION_AREA` from silence in a property listing.

## 6.10 Water / drainage / environmental context

Seek some sites with publicly evidenced or credible screening questions around:

- flood context;
- watercourse adjacency;
- drainage constraints;
- other environmental designations.

The corpus need not solve them.

The purpose is to prove that a screening manifest can carry the trigger and unknowns into later target/due-diligence work.

## 6.11 Site-interface stress

Across the corpus ensure the six DPL-08A packages are attacked:

- `SI-P01` ground/foundation support;
- `SI-P02` datum/plinth/accessible approach;
- `SI-P03` foul/surface/site water;
- `SI-P04` utility approach/external plant;
- `SI-P05` construction/maintenance/landscape;
- `SI-P06` context/environment mitigation.

At DPL-14A no plot is required to have all six resolved.

Indeed, some should expose unresolved packages early.

---

# 7. Coverage rules — not quotas masquerading as statistics

The 24-plot corpus should satisfy the following minimum **design-of-experiments** conditions unless scarcity is documented:

1. at least eight boroughs before concentration exceptions;
2. more than one plot on each side of the 15.5 m and 17.4 m width comparators where source evidence permits classification;
3. more than one plot shallower than, around and deeper than the 30.0 m Reference Site comparator;
4. at least four distinct plot/access morphologies from section 6;
5. frontage/orientation examples distributed across the compass rather than one directional cluster;
6. at least several plots with visible/evidenced mature-tree friction;
7. at least several plots with non-trivial access/construction geometry;
8. at least several sites carrying a heritage/environmental/planning-context trigger;
9. explicit examples whose important due-diligence facts remain `UNKNOWN` at screening;
10. at least four plots selected partly because they are plausible **failure/challenge controls**, not because they look easy.

The words `several`, `around` and `materially` are deliberate here.

DPL-14A refuses fake precision where the public source field is too heterogeneous to justify a statistical quota.

If the substantive collector discovers that one axis is collapsing into near-uniformity, it should add a coverage challenger rather than inventing numbers to make the matrix look balanced.

---

# 8. Admission evidence

A plot is admitted only when there is enough evidence to create a useful `SCREENING` manifest while leaving unsupported facts explicit.

## 8.1 Required minimum source package

Every admitted plot needs:

### A. Site identity / discovery source

At least one publicly accessible source that identifies the offered/development parcel sufficiently to distinguish it from other sites.

Typical examples:

- property/land listing;
- agent/developer marketing page;
- public planning record identifying the site;
- another legitimate public source.

Record:

- source URL/reference;
- source provider;
- listing/record ID where exposed;
- access/capture date;
- source status if known (`ACTIVE`, `SSTC`, `ARCHIVED`, etc.);
- display address/location exactly as the source permits/requires for identification.

### B. Independent context source

At least one separate mapping/planning/public-record source sufficient to establish broad location/context independently of the marketing description.

This may support:

- geographic orientation;
- street relationship;
- borough;
- surrounding built form;
- broad parcel/context reading;
- designation/flood/context claims where the source is authoritative for them.

A marketing listing alone is not enough to author every site fact.

## 8.2 What need not be known at admission

The following are normally **not required** to admit a screening site and should remain explicit `UNKNOWN` unless genuinely evidenced:

- exact legal boundary;
- title ownership/control;
- restrictive covenants;
- easements/rights;
- Party Wall implications;
- exact sewer geometry/status;
- utility capacity/connection terms;
- geotechnical bearing/groundwater;
- contamination/ground-gas conclusions;
- exact tree root constraints;
- topographical survey levels;
- neighbour window survey;
- planning acceptability of the Reference House;
- foundation solution;
- drainage solution.

A plot is not rejected from the empirical corpus merely because these later-stage facts are unknown.

---

# 9. Source and precision classes

Corpus collection must inherit DPL-06 claim-basis semantics.

## 9.1 Marketing/listing source

Treat listing particulars as `THIRD_PARTY_RECORD` unless a more authoritative basis is justified for a particular claim.

Examples:

```text
asking price          THIRD_PARTY_RECORD
advertised area       THIRD_PARTY_RECORD
agent plot dimensions THIRD_PARTY_RECORD
"planning granted"   THIRD_PARTY_RECORD until planning record corroborates it
```

Marketing language does not become planning/title truth.

## 9.2 Online map / aerial source

Map/aerial interpretation can support bounded screening claims such as broad orientation or apparent context, subject to the source's precision and usage terms.

Do not represent a screen measurement as surveyed geometry.

If dimensions are derived from a map:

```text
basis: DERIVED_SITE_CLAIM
source: identified map/aerial source
precision: approximate / source-limited
legal boundary status: NOT ESTABLISHED
```

## 9.3 Marketing plan / floor/site plan

An agent plan may be useful for screening but is still a third-party record.

Record whether dimensions are:

- explicitly stated;
- graphically measured/derived;
- only schematic.

Do not infer scale where none is stated.

## 9.4 HM Land Registry title plan

If later obtained, retain DPL-11's rule:

> **Registered general extent is not a millimetre-precise legal boundary.**

A title plan may improve title/extent evidence without becoming a measured site survey.

## 9.5 Planning records

A public planning record may authoritatively establish that an application/decision/document exists and its recorded contents/status at the source date.

It does not prove:

- that the approved geometry matches current site geometry;
- that permission remains live without checking relevant conditions/timing;
- that a different Reference House proposal would be acceptable.

---

# 10. Screening manifest claim set

Every admitted plot should have a compact screening record covering the following, with `UNKNOWN` where evidence is insufficient.

```text
IDENTITY
  corpusPlotId
  source listing/record ids
  capture date
  borough / Greater London membership
  coarse/display location

MARKET / SOURCE STATE
  advertised transaction state
  asking price if retained as source fact
  source providers
  source dates

WORKING GEOMETRY
  apparent/working parcel geometry
  frontage relation
  apparent width/depth/area where evidenced
  geometry source + precision
  legal-boundary status

ORIENTATION / CONTEXT
  geographic north basis
  street/frontage orientation
  access morphology
  neighbouring built-form summary
  existing-building condition

LEVELS / GROUND
  qualitative topographic claim or UNKNOWN
  geotechnical state = UNKNOWN unless evidenced

TREES / LANDSCAPE
  visible/recorded mature tree claims
  TPO/conservation-tree status = UNKNOWN unless official source checked

WATER / UTILITIES
  flood/water-context claims where evidenced
  sewer/drainage/utility state = UNKNOWN unless source exists

PLANNING / DESIGNATIONS
  known public planning history references
  known official designations checked
  unverified marketing planning claims kept separate

PRIVATE / DUE DILIGENCE
  title/boundary/rights/covenants/access-right state
  normally UNKNOWN at initial corpus screening

SOURCE / EVIDENCE
  exact URLs/record refs
  accessedAt / sourceAsOf
  claim → evidence relationships
  retention/licence notes

SELECTION
  coverageAddition or intentionalReplicate
  axes added/repeated
  admission rationale
```

The screening record is deliberately richer in provenance than in apparent factual completeness.

---

# 11. Selection procedure

The substantive corpus collector should follow this order.

## Step 1 — discover broadly

Search across Greater London for potentially relevant one-dwelling sites without using similarity to `DPL-RS-01` as a filter.

Do not begin with a 17.4 × 30 m search envelope.

## Step 2 — create candidate stub

Before deep research, create a lightweight candidate record:

- stable temporary candidate ID;
- discovery source;
- borough/location;
- apparent site class;
- immediately visible diversity axes;
- obvious duplicate relationship.

## Step 3 — reject only by protocol exclusion

Do not reject because the site appears incompatible with the Reference House.

Reject only for reasons such as:

- wrong geography/site class;
- duplicate;
- insufficient legitimate evidence;
- source/retention problem;
- natural development unit clearly outside one-dwelling study;
- other recorded protocol exclusion.

## Step 4 — build screening manifest

Create the DPL-06-aligned claim set with explicit unknowns.

Do not perform deep due diligence merely to admit the site.

## Step 5 — update coverage matrix

Record which underrepresented conditions the site adds.

No weighted total score is calculated.

## Step 6 — admit / reserve / reject

Choose:

- `ADMIT_COVERAGE`;
- `ADMIT_REPLICATE`;
- `RESERVE`;
- `REJECT_PROTOCOL`.

Record one short rationale.

## Step 7 — freeze the first 24

Freeze corpus membership before performing full deployment trials.

Do not keep swapping difficult plots out after they produce inconvenient results.

A post-freeze replacement requires:

- source loss/unavailability;
- proven duplicate/site identity error;
- protocol violation discovered later;
- similarly objective corpus-validity reason.

`Reference House fails badly here` is **not** a replacement reason.

---

# 12. First borough proof-target selection

DPL-14A intentionally does not select the borough.

The first borough target should be selected **after the initial corpus exists**.

## Eligibility

A borough is eligible for first detailed plug-in work only where the corpus contains enough admitted sites to exercise more than one site condition.

Prefer a borough with:

- at least **three admitted plots**;
- more than one plot/access/context morphology;
- official planning-source material sufficiently identifiable to create a reproducible borough target;
- no dependence on one anomalous listing as the entire empirical case.

## Selection principle

Choose the borough that provides the strongest **internally varied mini-cohort** for proving the plug-in architecture without obviously selecting the easiest planning regime.

Document:

- corpus plots involved;
- planning-source composition known at selection time;
- why it is a useful first proof target;
- what it does **not** prove about London generally.

Do not choose a borough merely because:

- the user lives there;
- the project already knows its planning website;
- it has the easiest policy corpus;
- it contains the Reference-Site-like plot;
- it appears most permissive.

---

# 13. Second borough generality challenger

The later second borough should attack the first borough implementation.

It should differ materially on several independent axes, for example:

- urban/plot morphology;
- local-plan/source composition or vintage;
- heritage/townscape context;
- flood/water context;
- access/backland prevalence;
- apparent plot dimensions;
- design-code/guidance environment.

No single scalar `difference score` is required.

The second borough is selected by an explicit contrast matrix and rationale.

Its purpose is to expose overfitting in the borough plug-in architecture, not to establish statistical London-wide validity.

---

# 14. Price, tenure and acquisition posture

## 14.1 Price is not a corpus admission criterion

The deployment corpus exists to test architectural/site/regulatory compatibility.

It must not silently become constrained by a particular acquisition budget.

If an asking price is retained, it is:

- a time-stamped third-party market claim;
- useful for later separate viability/acquisition work;
- **not** part of DPL-14A admission scoring.

## 14.2 Tenure/title claims

Marketing claims such as `freehold` may be recorded as third-party claims.

They do not replace official title evidence or legal review.

## 14.3 Availability changes

A plot that goes SSTC, withdrawn or sold after corpus freeze can remain valid empirical evidence if its source/provenance is sufficient.

The corpus is a dated research snapshot, not a live shopping shortlist.

Availability status is updated rather than using market movement to rewrite the corpus.

---

# 15. Copyright, licensing and privacy

The repository is public. Corpus evidence retention must therefore be deliberately conservative.

## 15.1 Default retention rule

By default commit only:

- original project-authored notes;
- extracted factual claims necessary to the research;
- source URL/reference/identifier;
- source provider;
- access/source date;
- short provenance/precision notes;
- project-authored derived geometry/data where the underlying source permits the research use and the derivation is identified.

Do **not** commit by default:

- listing photographs;
- agent floor/site-plan images;
- copied marketing descriptions;
- map tiles/screenshots;
- third-party PDFs;
- source databases;
- other copyrighted source artefacts.

If a later source has an explicit licence permitting retention/republication, record that licence and scope before committing the artefact.

## 15.2 No source circumvention

DPL-14A authorises no scraping system.

Do not:

- bypass login/paywall/access controls;
- defeat anti-bot measures;
- ignore an API/connector boundary;
- mirror a property portal;
- build an automated ingest against a provider before source-specific terms/licensing have been reviewed.

Manual research or an authorised connector/search surface may support screening claims, but repository retention still follows the conservative rule above.

## 15.3 Source disappearance

If a third-party source later disappears, the project retains:

- the dated citation/source reference;
- project-authored extracted claims and their stated basis/precision;
- any independently corroborated public records.

Do not retrospectively archive/rehost a full copyrighted source merely to preserve convenience.

Loss of the only evidence supporting a consequential claim can make that claim stale/unresolved under DPL-03/06.

## 15.4 Residential privacy

Do not collect or commit owner/occupier personal information merely because it is visible in a source.

Do not retain:

- names of private occupants/owners unless legally/process-essential in a later authorised due-diligence packet;
- phone numbers/email addresses;
- personal photographs/details unrelated to the site;
- inferred demographic information.

A publicly marketed address may be retained where necessary to identify the real parcel/source, but the corpus should prefer the least personal identification sufficient for reproducible site research.

The corpus studies land/building conditions, not residents.

---

# 16. Unknowns are a success condition

The first corpus will contain many unknowns.

That is desirable.

If every screening manifest somehow contains:

```text
title: clear
boundary: exact
ground: good
sewer: no issue
utilities: adequate
planning: likely
```

then the protocol has almost certainly laundered absence of evidence into optimistic facts.

Expected screening unknowns include:

- legal boundary precision;
- title burdens/rights;
- below-ground services;
- utility capacity;
- exact topography;
- geotechnics;
- groundwater/contamination;
- neighbour window geometry;
- consent requirements;
- many local planning judgements.

The empirical value lies partly in learning **which unknowns become decision-critical earliest** across recurring site types.

---

# 17. Challenge controls

At least four of the 24 admitted sites should be retained partly because they stress the model.

Useful challenge classes include:

- narrow but not trivially impossible frontage;
- irregular/backland access;
- material mature-tree relationship;
- noticeable topographic/retaining condition;
- heritage/townscape sensitivity;
- water/flood/drainage-context trigger;
- close neighbour/amenity condition;
- awkward construction/maintenance access.

Avoid challenge controls that are so obviously outside the intended site class that they teach nothing beyond `house does not fit`.

The best challenge is a site that appears plausible at first glance but forces the deployment architecture to expose a real assumption.

---

# 18. Relationship to DPL-RS-01

`DPL-RS-01` remains the canonical synthetic integration fixture.

The corpus does not vote on whether it was “right”.

Instead it attacks individual assumptions:

```text
Reference Site width          17.4 m
Reference Site depth          30.0 m
service-side clearance         3.0 m
principal-side clearance       2.4 m
front setback                  5.2 m
rear garden                   14.0 m
north street / south garden
ordinary side neighbours
modest fall
one mature rear tree
```

For every assumption, real plots may show:

- recurring support;
- frequent alternative condition;
- an unmodelled condition;
- a limit case;
- no useful inference yet.

Do not average the corpus into a new “typical plot” unless a later programme specifically establishes a statistically legitimate sampling method.

The likely outcome is a richer **deployment envelope**, not a redesigned average Reference Site.

---

# 19. Relationship to planning-target selection

DPL-14A is intentionally upstream of the first detailed borough plug-in.

The corpus should reveal which borough provides a useful first proof case.

This prevents the planning architecture from being designed entirely around:

- one familiar borough;
- one convenient website;
- one unusually simple local plan;
- one plot already known to fit the house.

DPL-10A supplies the source/status contract; the corpus supplies empirical borough candidates.

Neither decides permission.

---

# 20. Relationship to DPL-15 and deployment-envelope work

DPL-14A does not perform deployment trials.

The intended progression remains:

```text
DPL-14A
  corpus protocol
      ↓
later substantive corpus collection
      ↓
B1 integration / target + corpus readiness
      ↓
DPL-12 / DPL-13 as authorised
      ↓
DPL-15 real-plot deployment trials
      ↓
DPL-16 deployment envelope
```

The corpus membership must be frozen before DPL-15 conclusions are known, preventing outcome-driven sample substitution.

---

# 21. Minimal corpus record shape

DPL-14A does not add a machine-readable corpus registry yet.

The substantive collection packet should first prove the stable fields across several real sources.

Any later structured record should preserve at least:

```text
CorpusPlotRecord {
  corpusPlotId
  siteManifestId
  admissionState
  admissionReason
  selectionRole

  geography
  discoverySourceRefs[]
  independentContextSourceRefs[]
  capturedAt

  coverageAxes[]
  replicateOf?
  sourceRetentionNotes[]

  sourceStatus
  replacementHistory[]
}
```

The full site facts belong in the DPL-06 manifest, not duplicated into the corpus-membership object.

This is another reason not to implement a registry prematurely.

---

# 22. Dry-run decision

DPL-14A does **not** commit a live three-site dry run.

That is deliberate rather than incomplete.

The protocol has now established that a responsible real-site record needs:

- discovery-source identity;
- a separate context source;
- claim-level precision/provenance;
- public-repo retention rules;
- explicit unknowns;
- coverage role.

A casual three-listing exercise performed before these rules were frozen would either require retaining unstable third-party material or create candidate manifests that immediately need restructuring.

The next substantive corpus packet should begin with a **three-site pilot inside the actual corpus workflow**, apply this frozen protocol, red-team the fields, and only then continue toward 24 admissions.

Those first three sites therefore count only if they satisfy the same final admission protocol; there is no disposable parallel test format.

---

# 23. Red-team findings

## 23.1 “Find plots like the Reference Site” would invalidate the experiment

The Reference Site is synthetic and explicitly non-typical.

Using its dimensions as discovery filters would guarantee circular confirmation.

Therefore the dimensions are comparison anchors only, not admission filters.

## 23.2 “Current listings = representative market sample” is false

Portal availability is shaped by market timing, agent practices, source coverage and planning/ownership circumstances.

The corpus makes no population-statistics claim.

## 23.3 Exact-looking map geometry is dangerous

Online measurements can be useful at screening but cannot silently become surveyed/legal boundaries.

Source precision remains attached to every geometry claim.

## 23.4 Requiring complete due diligence would destroy screening usefulness

The corpus is specifically allowed to contain unknown title, ground, utility and drainage facts.

Later assurance profiles accelerate them when decision-critical.

## 23.5 Selecting only currently purchasable affordable plots would mix two projects

Architecture/deployment research and personal acquisition/viability are separate concerns.

The first corpus does not encode an acquisition budget.

## 23.6 Selecting the first borough in advance would bias the source model

The borough plug-in should be earned from the corpus.

Familiarity or convenience is not a research criterion.

## 23.7 Archiving source imagery in a public repository creates needless rights risk

The corpus needs evidence/provenance, not a mirror of property portals.

Default retention is therefore metadata + project-authored extracted claims, with third-party artefacts retained only where an explicit licence/authority justifies it.

## 23.8 Removing failed sites after deployment trials would be outcome tampering

Membership freezes before DPL-15.

A hard failure is valuable evidence, not a reason to replace the site.

---

# 24. Acceptance result

**DPL-14A result: PASS at protocol scope.**

Another session/agent can now assemble the first real London corpus without inventing:

- site-class boundaries;
- admission evidence;
- diversity criteria;
- source precision rules;
- unknown handling;
- borough-selection logic;
- source-retention/privacy policy;
- a success-biased sample.

The first empirical collection should start as a three-site pilot under this protocol and proceed to the frozen 24-site corpus only if those first records demonstrate that the manifest/corpus fields survive real sources.

## Next gate

DPL-14A does **not** start DPL-15 and does not authorise the full corpus automatically.

After DPL-09A, DPL-10A and DPL-14A are all landed, return to a bounded Wave-B1 integration/readiness gate.

That gate should decide:

- whether the three-site pilot/full corpus collection is the immediate empirical next packet;
- whether DPL-12 now has enough concrete source/site/interface objects to begin a minimal substrate;
- which single England technical family, if any, earns the first DPL-09B packet;
- whether a first borough can be selected only after the initial empirical pilot or should wait for the larger corpus;
- whether any DPL-08 package is ready for substantive solution work without getting ahead of real evidence.
