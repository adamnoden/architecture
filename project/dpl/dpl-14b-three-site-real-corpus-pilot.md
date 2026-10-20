# DPL-14B — Three-Site Real London Corpus Pilot

**Issue:** [#379 — DPL-14B — three-site real London corpus pilot](https://github.com/adamnoden/architecture/issues/379)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Protocol:** [DPL-14A](dpl-14a-real-plot-corpus-protocol.md)  
**Site-manifest authority:** [DPL-06](dpl-06-site-manifest-model.md)  
**Site-interface authority:** [DPL-08A](dpl-08a-site-interface-authority-register.md) + [DPL-08B](dpl-08b-ground-datum-plinth-approach-interface.md)  
**England target slice:** [DPL-09B](dpl-09b-structure-ground-moisture-materials.md)  
**London target slice:** [DPL-10B](dpl-10b-london-strategic-residential-design.md)  
**Research date:** 2026-10-20  
**Initial baseline `main`:** `b5bc6d9a068a255995ff35a8abaa9063fcd610be`  
**Assurance profile:** `SCREENING`  
**Status:** pilot corpus admitted; **not** deployment trials, site recommendations or purchase shortlist

## Question

> **Can three deliberately different real London sites be represented honestly at screening level using the frozen DPL evidence/unknown discipline, and what should change before Corpus 1 scales toward 24 sites?**

---

# 1. Result

**PASS WITH BOUNDED PROTOCOL REFINEMENTS.**

Three real Greater London sites have been admitted without changing the core DPL ontology:

| ID | Site | Borough | Primary stress |
|---|---|---|---|
| `DPL-RP-001` | Land at 26 The Avenue, Finchley N3 2FD | Barnet | parcel area close to Reference Site, but public-footpath access and exact geometry unknown |
| `DPL-RP-002` | land to rear of 10 Highland Road, Bromley BR1 4AD | Bromley | backland/private access, tree/TPO history, neighbour/context sensitivity, historic one-house permission |
| `DPL-RP-003` | rear of 73A/73B Woodside Green, SE25 5HU | Croydon | garage infill, one-house permission followed by two-house refusal/appeal dismissal, qualitative amenity/context pressure |

Records:

- [`sites/dpl-rp-001-26-the-avenue-finchley.md`](sites/dpl-rp-001-26-the-avenue-finchley.md)
- [`sites/dpl-rp-002-rear-10-highland-road-bromley.md`](sites/dpl-rp-002-rear-10-highland-road-bromley.md)
- [`sites/dpl-rp-003-rear-73a-73b-woodside-green-croydon.md`](sites/dpl-rp-003-rear-73a-73b-woodside-green-croydon.md)
- minimal pilot index: [`sites/corpus-1-pilot-index.json`](sites/corpus-1-pilot-index.json)

The core site-manifest model survived first contact with real land.

The most important empirical result is not a plot dimension. It is this:

> **Real public site evidence arrives as partially overlapping claims with different source lineages, dates, spatial scopes and authority. The manifest must preserve those differences rather than synthesize a convenient “site truth”.**

---

# 2. Pilot selection

The three sites were selected as `COVERAGE_ADDITION`, not by price, desirability or apparent likelihood of accepting the Reference House.

## DPL-RP-001 — Finchley

Why admitted:

- approximately 491.7 m² marketed area — unusually close to the 522 m² Reference Site;
- existing small building;
- access described through a public footpath;
- no published site plan in the discovery listing;
- strong test of access, construction logistics, utilities and exact-geometry unknowns.

Primary discovery/current sources:

- Rightmove property `774538831569105`;
- Savills Auctions lot for 26 The Avenue;
- independent postcode/context mapping confirming Barnet / Finchley Church End location.

## DPL-RP-002 — Bromley

Why admitted:

- genuine backland garage site;
- historical private/partially unmade access lane;
- tree/TPO evidence in historical technical documents;
- larger backland scheme refused;
- later one-house proposal granted;
- historic permission included surface-water design as a due condition.

The pilot deliberately uses planning-defined site identity rather than trying to prove that a current generic “Land at Highland Road” marketing listing has exactly the same legal parcel.

## DPL-RP-003 — Croydon

Why admitted:

- urban garage/infill condition;
- official 2025 permission for one four-bedroom house;
- later two-house proposal refused and appeal dismissed in 2026;
- appeal decision makes character/massing and functional private amenity space materially explicit;
- unusually useful test of DPL-10B's distinction between numeric policy checks and qualitative planning judgement.

---

# 3. What the pilot proves about DPL-06

## 3.1 Unknown must remain first-class

Across all three sites, the following are absent or materially incomplete at screening:

- exact legal boundary;
- topographical survey;
- geotechnical profile;
- groundwater;
- contamination / ground gas / radon;
- sewer geometry/status;
- utility routes/capacity/rights;
- exact neighbour-window geometry;
- current title/private-right position.

Yet all three records remain useful.

This validates the DPL-06 decision not to require a globally “complete site manifest”.

A screening manifest can be decision-useful precisely because it says:

```text
known
unknown
historically evidenced
third-party asserted
current status requires recheck
```

rather than filling every field.

## 3.2 Site claims need temporal scope

The pilot repeatedly encountered facts that were true for an earlier proposal or investigation but are not automatically current facts.

Examples:

- Highland Road's historical garage condition;
- historical tree categories/TPO evidence;
- historical access geometry;
- Woodside Green's earlier garage condition;
- planning permission existing at a particular decision date.

Therefore a consequential real-site claim should carry, where relevant:

```text
observed / asserted time
retrieval time
validity / recheck requirement
```

DPL-06 already has temporal/source scope conceptually. DPL-14B confirms it is not optional implementation decoration.

## 3.3 Site claims need spatial scope

Highland Road exposed the clearest failure mode.

A council report gives approximately **950 m²** for a combined parcel involving rear land at Nos. 8 and 10. The later single-house site is narrower in scope.

A naive site database could have copied `950 m²` onto the one-house rear-of-10 record.

DPL-14B refuses that transfer.

Therefore every material geometry/area claim needs enough spatial identity to answer:

> **Which parcel / proposal / red-line extent did this value actually describe?**

## 3.4 Source URL != source independence

Finchley demonstrated that Rightmove and Savills can expose distinct URLs while substantially carrying the same seller/auction particulars.

They are separate provenance records, but they are **not independent evidence of the same technical fact** merely because there are two pages.

Therefore future corpus tooling should distinguish:

```text
source record
source provider
upstream lineage / syndication where known
independent corroboration status
```

This prevents three portal mirrors from masquerading as three confirmations.

---

# 4. Protocol refinements earned by the pilot

The DPL-14A protocol remains valid. Four refinements should be treated as mandatory when the corpus scales.

## `R1 — SOURCE_LINEAGE`

Record whether evidence sources are:

- genuinely independent;
- syndicated from one marketing source;
- public copies of one authority document;
- derivative summaries pointing to an underlying official record.

A second URL is not automatically corroboration.

## `R2 — SPATIAL_SCOPE`

For every consequential area/dimension/context claim, retain enough spatial scope to prevent values from migrating between:

- larger historical application sites;
- subdivided parcels;
- current marketed land;
- title parcels;
- inferred working geometry.

## `R3 — TEMPORAL_STATE`

Facts such as:

- building present;
- tree condition;
- access state;
- permission status;
- site clearance;

must carry historical/current/recheck semantics.

## `R4 — IDENTITY_LINK_CONFIDENCE`

Where marketing and planning sources appear to describe the same land but exact linkage is not proven, do not merge them silently.

Future source records should support a bounded relation such as:

```text
EXACT_IDENTITY
LIKELY_OVERLAP
CONTEXT_ONLY
UNRESOLVED_LINK
```

The pilot avoided needing this relation in the admitted authority by choosing stable planning identities where necessary, but the collection process demonstrated that the field is needed.

These refinements extend provenance fidelity. They do not alter the architectural/site ontology.

---

# 5. What the pilot proves about DPL-08B

All three sites successfully consume the five ground/plinth duties without turning them into construction details.

## Finchley

The phrase `accessed via public footpath` immediately makes `ACCESS / MOVEMENT`, utilities and construction logistics decision-critical while leaving support/datum/water unresolved.

The correct result is not:

```text
site fails
```

but:

```text
access evidence must be accelerated before a useful land decision
```

## Bromley

Historic private-lane geometry, tree constraints and drainage conditions show how SUPPORT, ACCESS, MAINTENANCE and context duties can collide without implying one standard foundation/landscape solution.

## Croydon

The constrained urban context makes site-interface working territory and access relevant, but the strongest early pressure is planning/context rather than foundation geometry.

This proves the interface package model can represent sites whose dominant blockers arise in different authority families.

---

# 6. What the pilot proves about DPL-09B

Real screening sources do **not** naturally provide enough evidence to discharge A1/A2/C1/C2.

That is important empirical confirmation.

A development-land listing or planning permission routinely tells us far less than would be required for:

- structural adequacy;
- ground movement;
- contamination;
- groundwater;
- sub-soil drainage need;
- moisture design.

Therefore DPL-09B's external-evidence posture is not theoretical conservatism. It matches the actual evidence field.

The three sites also show the value of decision-critical acceleration:

- Bromley tree history may make A2/foundation evidence relevant earlier than usual if the site becomes a serious candidate;
- Finchley access may need resolution before spending money on detailed technical design;
- Woodside's rich planning history may make planning/context evidence due before geotechnical investigation for a screening decision.

There is no universal order in which all unknowns become due.

---

# 7. What the pilot proves about DPL-10B

Woodside Green provides the strongest real-world attack on the first strategic planning slice.

The same broad parcel has:

- a one-house permission;
- a later two-house refusal/appeal dismissal;
- proposal-specific findings on character/massing;
- proposal-specific findings on functional private amenity space.

This directly validates:

```text
D6 numeric result
        ≠
D3 design judgement
        ≠
D6 qualitative amenity judgement
        ≠
overall planning decision
```

Bromley similarly shows that a larger backland scheme and a later one-house scheme can receive different decisions.

The empirical lesson is:

> **planning suitability is not a property of land alone.**

It is a relation between site, proposal, operative policy, evidence, judgement and time.

That relation must remain visible in DPL-12 later.

---

# 8. Coverage review

The three-site pilot is deliberately too small to satisfy Corpus 1 coverage rules.

## What it covers well

- three boroughs: Barnet, Bromley, Croydon;
- access-constrained / backland / garage-infill conditions;
- existing-building/garage redevelopment;
- tree/TPO history;
- rich planning-history contrast;
- explicit unknown ground/services/title conditions;
- D3/context and D6 qualitative amenity pressure;
- approximately Reference-Site-sized area without Reference-Site-like access.

## What it does not cover well

The pilot is intentionally biased toward difficult infill/backland examples because the goal was to attack the model quickly.

Before Corpus 1 scales far, deliberately add:

- ordinary street-front detached/replacement plots;
- corner/dual-frontage examples;
- sites with a reliably evidenced slope/topographic condition;
- orientation-diverse examples;
- a site with authoritative flood/water/environmental trigger;
- materially wider and materially narrower parcels with credible working geometry;
- a less planning-history-rich “ordinary” control;
- at least one site where public mapping/site geometry is unusually clear but technical due diligence remains sparse.

This prevents the corpus from teaching the compiler that “London land” means backland garage sites.

---

# 9. First-borough signal — not selection

The B1/B2 programme deliberately prohibited choosing the first DPL-10C borough before real evidence existed.

The pilot now provides a first signal.

## Strongest current candidate: Croydon

Croydon is currently the strongest **candidate to help select** the first borough proof because DPL-RP-003 has:

- a clearly identified small-site parcel;
- a one-house permission;
- a later refused/dismissed two-house proposal;
- an appeal decision explicitly citing strategic and local policies;
- concrete character, amenity and parking reasoning;
- enough public decision history to test the boundary between London strategic policy, borough policy and judgement.

## Why selection remains held

Three sites are too small a corpus to establish that Croydon is the best first plug-in for generality.

The B2 integration gate should decide whether:

- this evidence is sufficient to open DPL-10C with Croydon;
- a few more corpus sites are needed first;
- Bromley provides a better adversarial first borough;
- the first proof should deliberately choose one borough and immediately nominate a contrasting second.

DPL-14B does not make that programme decision itself.

---

# 10. Machine-readable decision

The pilot **does earn machine-readable corpus metadata**, but not a full duplicate site-schema implementation.

Added:

`project/dpl/sites/corpus-1-pilot-index.json`

The following fields proved stable across all three sites:

- site ID;
- display identity;
- borough;
- site kind;
- assurance profile;
- corpus role;
- admission state;
- human-readable site-record path;
- primary identity basis;
- challenge tags;
- decision-critical unknowns.

The following are **not** frozen by DPL-14B:

- full claim-object schema;
- geometry model;
- title model;
- technical due-diligence model;
- planning target schema;
- deployment compatibility fields;
- any scoring/ranking system.

Why:

> the three records show that the claim envelope is stable, but domain claim payloads are heterogeneous enough that DPL-12 should orchestrate the existing DPL-06 semantics rather than inherit a prematurely rigid “property database” schema from DPL-14B.

This is exactly the kind of concrete evidence B2 was intended to produce before DPL-12.

---

# 11. Source-retention / privacy / copyright result

The protocol worked without storing third-party photos, plans, PDFs or personal applicant/owner data.

The public repo retains:

- stable source URLs/record IDs;
- minimal factual paraphrases;
- authority/status/precision notes;
- retrieval date;
- only the location detail required to identify already-public development sites.

It does not retain:

- copied listing photography;
- downloaded legal packs;
- personal applicant/contact names;
- inferred resident characteristics;
- scraped portal datasets.

This should remain the default for Corpus 1.

---

# 12. Protocol acceptance test

## Can another session apply DPL-14A consistently?

**Yes.**

The three records use the same admission logic without requiring ad-hoc scoring.

## Did real sources force unsupported facts into the manifest?

**No.**

The dominant result was more explicit `UNKNOWN`, not invented precision.

## Did any plot require changing DPL-06 ontology?

**No.**

Only provenance refinements were earned: lineage, spatial scope, temporal state and source-link confidence.

## Did the corpus accidentally become a purchase shortlist?

**No.**

Price is absent from admission logic and no recommendation/ranking is recorded.

## Did the pilot begin deployment trials?

**No.**

No site receives `COMPATIBLE` / `INCOMPATIBLE`.

## Did planning history get mistaken for Reference House permission?

**No.**

Historical decisions are external evidence only.

---

# 13. B2 integration consequences

DPL-14B now supplies the missing empirical objects identified by the B1 gate:

1. three real screening site records;
2. three different source/evidence patterns;
3. concrete decision-critical unknowns;
4. a minimal corpus index;
5. real pressure on DPL-08B's interface contract;
6. real pressure on DPL-09B's evidence boundaries;
7. real pressure on DPL-10B's mixed planning-method model.

The B2 gate can now ask DPL-12's readiness question against **actual instances**, not just ontology/prose.

---

# 14. Explicit non-claims

DPL-14B does **not** establish that:

- any pilot site is compatible with the Reference House;
- any site is unsuitable;
- any site should be purchased;
- the pilot is representative of London;
- the first borough is selected;
- a historical planning permission remains live;
- a past planning decision predicts a new one;
- a planning permission proves technical adequacy;
- title/access/service rights are known;
- public listing dimensions are survey dimensions;
- DPL-12 is automatically ready merely because three real records now exist.

---

# 15. Closeout

DPL-14B demonstrates that the DPL site model survives genuine public evidence without collapsing uncertainty.

Its principal lesson is:

> **A real site is not a row in a property spreadsheet. It is a versioned set of claims whose source, spatial scope, time and authority matter as much as the value itself.**

The pilot is complete when merged. Corpus 1 expansion remains held pending the B2 integration/admission gate.
