# DPL-Q — Post-DPL-15D External Spatial-Evidence Boundary / DPL-15 Hold Gate

**Issue:** #606  
**Depends on:** DPL-15D #589 / PR #590  
**Reviewed DPL-15D candidate:** `d19424f5dbd7e8e02acbb2b113c36c09d714c8c2`  
**Status:** **PASS DPL-15D; EXTERNAL SPATIAL EVIDENCE REQUIRED; HOLD FURTHER CANDIDATE AUTHORING AND DPL-16.**

## 1. Decision

DPL-15 has reached a genuine external evidence boundary.

The current limiting system is no longer the compiler, the Reference House conformance model, the planning-target model, the real-claim ontology, source-status composition or the candidate-authoring readiness rule.

The limiting system is the absence of controlled real-site spatial evidence sufficient to author a non-fabricated Reference House placement.

Freeze the programme state as:

```text
DPL-15 real-site evidence graph         = PROVED
DPL-15 candidate-authoring readiness    = 0 / 8 current corpus
RP-004 bounded public-document pass     = DOCUMENT_RETRIEVAL_BOUNDARY
real Reference House candidate          = NOT_AUTHORED
COMPATIBLE                              = NOT_ADMITTED
INCOMPATIBLE                            = NOT_ADMITTED
route exhaustion                        = NOT_IMPLEMENTED
DPL-16 deployment envelope              = HELD
DPL-15 programme state                  = BLOCKED_EXTERNAL_SPATIAL_EVIDENCE
```

Do not create another internal implementation packet merely to create movement.

## 2. Evidence accumulated before this gate

The external-boundary finding is cumulative rather than based on one failed scrape.

### DPL-15A — real-site ontology contact

RP-003 proved that real evidence can enter the deployment evidence graph without being renamed into the synthetic `RS-*` fixture vocabulary.

It also proved that incomplete public evidence can correctly stop candidate authoring rather than forcing a placement.

### DPL-15B — first public-evidence supplement

A bounded RP-003 public-planning pass improved source provenance and proposal context but did not yield controlled dimensional geometry.

The result remained:

```text
NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT
```

### DPL-15C — corpus-wide readiness sweep

One common six-part candidate-authoring contract was applied to the eight admitted real sites.

Result:

```text
CANDIDATE_AUTHORING_READY = 0 / 8
NOT_READY                 = 8 / 8
```

No site was called incompatible.

### DPL-15D — shortest public-document path

RP-004 was selected categorically as the shortest remaining public evidence path.

The first-party Havering application record and decision lineage are controlled, and a substantial application document corpus is publicly indexed.

However the bounded acquisition could not recover inspectable approved/dimensioned plan bytes or an approved-plan schedule.

Result:

```text
RP004_NOT_READY_DOCUMENT_RETRIEVAL_BOUNDARY
```

The required geometry was not inspected and found inadequate; it was not retrievable through the bounded public channel. DPL correctly refuses to guess what inaccessible documents contain.

## 3. The six-part reopening contract remains unchanged

Candidate authoring may reopen at `SCREENING` assurance only when one real site positively satisfies all six dimensions:

1. `R1_CONTROLLED_SPATIAL_IDENTITY` — a controlled real parcel/application extent suitable for placement;
2. `R2_FOOTPRINT_TEST_GEOMETRY` — explicit shape/dimensions sufficient to test the 12.0 m × 10.8 m Reference House footprint;
3. `R3_REAL_ORIENTATION_FRAME` — a real north/orientation/frame rather than synthetic inheritance;
4. `R4_DATUM_LEVEL_EVIDENCE` — levels/topography sufficient to author the house-ground relation at screening scope;
5. `R5_PHYSICAL_ACCESS_STREET_GEOMETRY` — physical approach/street/access geometry sufficient to place the house honestly;
6. `R6_SITE_IDENTITY_COHERENCE` — a coherent statement of which real land is actually being tested.

Do not weaken this contract to obtain a candidate.

It is intentionally weaker than title/survey/construction assurance while still strong enough to prevent fictional placement.

## 4. Minimum external evidence package that can reopen DPL-15

The programme does **not** require a full technical-design dossier merely to reopen screening candidate authoring.

One of the following evidence packages may be sufficient if it positively carries R1–R6.

### Package A — controlled planning/survey drawing set

A coherent set containing, at minimum:

- controlled application/red-line or measured site boundary suitable for screening placement;
- explicit scale and/or dimensions sufficient to reconstruct real shape/width/depth without pixel measurement;
- north/orientation;
- explicit relationship to the public street/access route;
- site levels, spot levels, contours, section or another explicit datum relationship sufficient for screening ground placement;
- drawing identity/revision/date/source provenance.

An approved or submitted planning site/block plan may contribute to this package at `SCREENING` assurance if its authority and scale are explicit.

A planning red line remains planning/application geometry; it does not silently become legal title.

### Package B — measured topographical/site survey

A measured/topographical survey may satisfy the spatial dimensions directly where it provides:

- surveyed boundary/physical extent being tested;
- dimensions/coordinates;
- north/orientation;
- levels/contours;
- access/street relationship;
- clear site identity/source provenance.

Title/control may remain a separate unresolved evidence class if the survey does not establish ownership.

### Package C — equivalent controlled digital geometry

A CAD/GIS/survey package can be accepted where its provenance, coordinate/orientation system, dimensions, levels and tested-site identity are explicit enough to satisfy R1–R6 deterministically.

## 5. Evidence that does not reopen candidate authoring by itself

The following remain insufficient alone:

- gross site area;
- estate-agent floor/site plans;
- marketing descriptions;
- web-map measurements;
- screenshots;
- approximate plot polygons;
- an approved replacement-house gross floor area;
- historic planning prose without retrievable controlled geometry;
- a document index saying that drawings exist;
- an application address/reference alone;
- planning permission alone.

No combination of weak evidence becomes strong merely through quantity.

## 6. No ninth site merely for document convenience

Do **not** add a ninth corpus site simply because its PDFs are easy to obtain.

That would change the sampling criterion from deployment pathology to evidence retrievability and risk producing a misleading end-to-end success case selected for tooling convenience.

A deliberately instrumented ninth real site would be justified only if it answered an unanswered systems question independent of document availability.

DPL-Q finds no such unanswered internal systems question at present:

- candidate semantics have already been proved on controlled synthetic cases;
- real-site evidence ingestion has been proved on RP-003;
- real-site readiness failure has been proved across the corpus;
- public-evidence acquisition has been tried on RP-003 and the categorically shortest RP-004 path;
- the remaining missing proposition is the real spatial evidence itself.

Therefore:

```text
ninthSiteForDocumentConvenience = NOT_ADMITTED
instrumentedNinthSite           = NOT_EARNED_YET
```

If a genuinely controlled real site later arrives with R1–R6 evidence, it can enter DPL under an explicit corpus/evidence revision without pretending that the original eight-site corpus was wrong.

## 7. Why DPL-16 remains held

DPL-16 is supposed to derive a deployment envelope from real deployment evidence.

There are currently zero real authored/evaluated Reference House candidates.

Starting DPL-16 now would force the programme to infer an envelope from:

- corpus metadata;
- absence of evidence;
- synthetic Reference-Site behaviour;
- or planning history unrelated to an actual Reference House placement.

That would reverse the intended dependency.

Keep:

```text
real candidate evidence
    ↓
real candidate evaluation evidence
    ↓
DPL-16 deployment envelope
```

DPL-16 therefore remains **HELD**, not cancelled.

## 8. DPL-15 programme state

DPL-15 is neither failed nor fully complete.

Use the explicit state:

```text
BLOCKED_EXTERNAL_SPATIAL_EVIDENCE
```

What has been completed is the internally executable portion of the real-plot trial programme:

- real evidence representation;
- evidence-state discipline;
- real-claim owner mapping;
- public source-authority handling;
- corpus-wide readiness assessment;
- two bounded public acquisition attempts;
- proof that missing evidence does not become site incompatibility;
- proof that the compiler refuses fabricated placement.

What remains blocked is the first **real candidate authoring/evaluation**.

## 9. No further generic compiler work admitted

The following are explicitly not earned by the current frontier:

- generic council-document scraping;
- OCR/drawing measurement machinery;
- web-map geometry inference;
- a universal real-site ontology rewrite;
- scalar site/readiness scoring;
- automatic site selection;
- Reference House mutation;
- route optimisation/exhaustion;
- a generalized planning-drawing parser.

Those mechanisms would not create the missing authority.

## 10. User / external action now genuinely required

Further DPL candidate work can resume when one controlled real site supplies an R1–R6 spatial package.

For the current sites, the most direct examples are:

- obtain the actual RP-004 Havering approved/submitted site-plan / block-plan / level drawing set outside the currently accessible retrieval channel; or
- provide a measured/topographical site survey for any intended real plot; or
- provide another controlled real plot package with equivalent explicit geometry, orientation, levels and access relationship.

No action is required merely to preserve or close the current internal work. Action is required only to **advance from evidence readiness into a real Reference House candidate**.

## 11. Result authority remains held

Nothing in DPL-Q admits:

- `COMPATIBLE @ SCREENING`;
- `INCOMPATIBLE`;
- route exhaustion;
- planning permission for the Reference House;
- Reference House adaptation/mutation;
- DPL-16;
- DPL-17 publication integration;
- DPL-18 closeout.

## 12. Restart condition

When an R1–R6 evidence package becomes available, the restart sequence is:

```text
external spatial evidence intake / provenance freeze
    ↓
candidate-authoring readiness re-run
    ↓
controlled real Reference House candidate authoring
    ↓
real candidate conformance / screening aggregation
    ↓
post-candidate adversarial gate
    ↓
DPL-16 admission decision
```

Do not bypass the readiness re-run merely because the new evidence appears complete.

## 13. Closeout

DPL-Q records a successful refusal to fabricate.

The programme has done enough internal work to know exactly what it does not know.

The next missing object is not another abstraction. It is a controlled piece of reality.