# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Current packet:** [#806 — DPL-T7](https://github.com/adamnoden/architecture/issues/806) — Lennard acceleration classification and public-evidence disposition  
**Current real-control result:** `ACCELERATION_FRONTIER_DISPOSED_NO_NEW_DUE_NOW_EVIDENCE`  
**Next authorised packet:** **DPL-T8 — Lennard substantive SCREENING blocker disposition and minimum evidence packet**  
**Programme maturity:** **M6 — acceleration uncertainty has been separated from genuine due-now substance; ten substantive blockers remain and evidence procurement is still unearned.**

## Purpose and governing rules

DPL asks whether the controlled Ovid’s House Reference House can be deployed honestly onto real land under declared site, jurisdiction, evidence and assurance conditions.

> **Compatibility before adaptation.**

> **The compiler evaluates architecture; it does not silently author it.**

> **Unknown reality stays unknown. Missing evidence is not a pass.**

> **Spatial evidence retains its actual authority class. An HMLR index polygon is not a determined legal boundary; EA DTM is not a private measured topo survey.**

## Controlled synthetic and corpus state

DPL-01 through DPL-13 establish the deployment ontology, conformance seam, interface authority, target stack, runtime composition and SCREENING aggregation semantics.

The empirical DPL-14 London corpus remains unchanged:

```text
DPL-RP-001 … DPL-RP-008
DPL-15C candidate-authoring readiness = 0 / 8
DPL-16 deployment envelope            = HELD
```

Instrumented controls are pipeline experiments only and remain excluded from DPL-16 sampling.

## Instrumented-control sequence

### Control 1 — 92 Uphill Road, Mill Hill

Evidence sufficient in principle; exact machine-readable geometry was not recovered faithfully from the scaled planning source.

`REAL_CONTROL_CANDIDATE_NOT_AUTHORED_GEOMETRY_RECOVERY_FAILED`

### Control 2 — 1 Whittington Road, Wood Green

Planning file exposed `SiteLocation.geojson` identity and useful plans/sections, but the portal transport did not expose controlled bytes.

Lesson: document-list metadata is not acquired geometry.

### Control 3 — 25A Chesterfield Road, Chiswick

Conventional street-front replacement typology; exact HMLR SCREENING geometry acquired but too narrow:

```text
area                        = 327.8688 m²
minimum containing width    = 8.96194 m
unchanged RH                = 12.0 m × 10.8 m
result                      = CONTROL_SITE_SCREENING_GEOMETRY_NO_UNCHANGED_RH_PLACEMENT
```

This is a pre-candidate geometry result, not whole-site `INCOMPATIBLE`.

### Control 4 — 41 Lennard Road, Bromley

```text
control id       = DPL-T-CONTROL-004
address          = 41 Lennard Road, Bromley, BR2 8LN
planning ref     = 26/02618/FPA
UPRN             = 100020404537
HMLR entity      = 12057071807
HMLR reference   = 57071807
```

The site is the intended conventional condition: existing bungalow → demolition → one detached replacement house on a normal street frontage.

#### T1 — fail-fast geometry preflight

```text
area                            = 783.6969 m²
minimum containing envelope     = 13.5235 m × 67.1018 m
unchanged RH                    = 12.0 m × 10.8 m
constructive witness contained  = YES
witness min boundary clearance  = ~1.232 m
```

Result:

`CONTROLLED_SCREENING_GEOMETRY_DOES_NOT_DISPROVE_PLACEMENT`

The witness proved only that the shell could fit. It was not promoted into architecture.

#### T2 — R1–R6 admission

Admitted evidence:

- HMLR / Planning Data indicative title-index geometry;
- Environment Agency 1 m LiDAR Composite DTM, EPSG:27700 / ODN;
- exact-site submitted planning evidence identifying the south-west Lennard Road frontage, front access and dropped kerb;
- current `26/02618/FPA` proposition corroborating front driveway alterations.

```text
R1_CONTROLLED_SPATIAL_IDENTITY       = SATISFIED_FOR_SCREENING_TITLE_EXTENT
R2_FOOTPRINT_TEST_GEOMETRY           = SATISFIED_POSITIVE_CONSTRUCTIVE_PREFLIGHT
R3_REAL_ORIENTATION_FRAME            = SATISFIED_EPSG4326_SOURCE_WITH_BNG_ANALYSIS
R4_DATUM_LEVEL_EVIDENCE              = SATISFIED_SCREENING_DATUM_TOPOGRAPHY_EA_DTM
R5_PHYSICAL_ACCESS_STREET_GEOMETRY   = SATISFIED_SCREENING_PHYSICAL_STREET_ACCESS_RELATIONSHIP
R6_SITE_IDENTITY_COHERENCE           = SATISFIED_AT_PARCEL_ADDRESS_PLANNING_IDENTITY_LEVEL

result = CONTROL_SITE_CANDIDATE_AUTHORING_READY
```

EA parcel terrain evidence:

```text
minimum             = 70.20 m ODN
maximum             = 71.10 m ODN
mean                = 70.5288 m ODN
terrain range       = 0.90 m
centroid sample     = 70.4000 m ODN
raster SHA-256      = ee7e04c7eee8f4391bc64cd57485439722e15687ffaad49b4a02804957fd1db9
```

This remains SCREENING evidence, not a measured private topographic survey.

#### T3 — authored candidate

T3 authored exactly one unchanged, unmirrored `RH-V02` placement:

```text
candidate                  = DPL-T-CANDIDATE-004-01 / rev 0.1
canonical front            = 12.000 m model-south edge
front bearing              = -51.6343476471° from BNG easting
frontage bearing           = -44.6343476471° from BNG easting
front skew                 = -7.000°
front-centre construction  = frontage midpoint +4.5 m along frontage +26.0 m inward
ground FFL                 = 70.70 m ODN
screening containment      = YES
min title-index clearance  = ~0.640 m
```

T3 kept the canonical 12 m façade street-facing rather than reusing the arbitrary T1 fit witness.

Artifacts:

- `project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json`
- `project/dpl/dpl-t3-lennard-authored-candidate.md`

#### T4 — deterministic candidate verification

Executable proof:

`compiler/dpl/dplT4Lennard.test.ts`

Bounded BNG analysis artifact:

`project/dpl/sites/dpl-t-control-004-lennard-road-analysis-bng-v01.json`

Frozen verification result:

`project/dpl/sites/dpl-t-control-004-lennard-road-verification-v01.json`

Semantic result fingerprint:

`0fafa462472370e54d5e1e3aba40e88cb594e8aafb877e0c687af0e5c5fc96dc`

The replay proves:

```text
Reference House source identity    = CURRENT / PINNED
Reference House compile identity   = CURRENT / PINNED
rigid 12.0 × 10.8 m transform      = PASS
handedness                         = UNMIRRORED
title-index containment            = PASS
minimum screening clearance        = ~0.640024 m
frontage / front / -7° skew        = REPRODUCED
70.70 m ODN screening FFL          = REPRODUCED
```

Bounded DPL-12B result:

```text
RH-I02       = CONFORMS
RH-PROT-01   = CONFORMS
RH-PROT-04   = CONFORMS
RH-PROT-06   = CONFORMS
RH-V02       = CONFORMS
RH-SI02      = OPEN / EXTERNAL_OR_UNMODELLED
RH-SI05      = OPEN / EXTERNAL_OR_UNMODELLED
```

This is a verified **candidate**, not a verified whole site.

#### T5 — real-control runtime assembly

T5 is the first instrumented real control to reach the generic DPL runtime with an authored and verified Reference House candidate.

Real-control manifest:

`project/dpl/sites/dpl-t-control-004-lennard-road-runtime-manifest-v01.json`

Adapter and proof:

- `compiler/dpl/dplT5Lennard.ts`
- `compiler/dpl/dplT5Lennard.test.ts`

Decision record:

`project/dpl/dpl-t5-lennard-real-control-runtime.md`

T5 uses seventeen real claims, `LNR-C01 … LNR-C17`, mapped explicitly to current DPL-10 / DPL-11 coverage families. It does not rename real evidence into the synthetic `RS-*` vocabulary.

Only one candidate-specific runtime proposal fact is admitted:

```text
dwellingStoreys = 2
```

The current applicant proposal's bedroom count, bedspace count, GIA, storage, private-outside-space geometry and M4 assignment are deliberately not transferred onto the different unchanged Reference House candidate.

T5's branch-time frozen identities remain historical evidence:

```text
manifest fingerprint
  d45dda4d1c7faa46aaf08e773671590cf78a2bc7335079dfebec81091a56145b

source-set fingerprint
  a6af74fed8e78faa84bdcb3dcc28d2f245b74585f2a2024a3cec5ff729ce76d0

deployment-case fingerprint
  791cb427364d32208a00d02d7b42f2b472a64023e0e1b2eed58215e37fee52f3

deployment-result fingerprint
  3f2fdfb9573a31bfdf33fc418169f49d83cad303830e4e9a56370c65e22608f9

T5 result fingerprint
  c858fcac7b7481f43c33e49cf7e092ca749467370d75e7903973c1887401ecdf
```

T6 replayed the unchanged T5 control through the actual landed/current generic runtime. The current T5 parent identity is:

```text
manifest
  7541bf23840f81af9089e7ce5fadbe62456ed9b51f0c9e2d1e601db9ee25bced
source set
  d3e08dfc8d411ff54dbd4d462878540a70c3b24bdd2729fcd35210df3d8242c9
deployment case
  e10a8fe8cc458a39254e3c8b82b0d64216b13fd74b69a87b9a945b06ae6aa475
deployment result
  2557f147639ae1eebd34fd4ca8d01893996b634047c98be4ca206798bf971984
T5 result
  bf04feb48795c0f5fddda5d9ddbe944428f06a52fd2afebc857a3b1bde1cf009
```

The change is shared-runtime identity invalidation, not Lennard evidence or candidate drift. See `project/dpl/dpl-t5-merge-state-replay.md`.

Raw runtime remains:

```text
obligations               = 29
UNRESOLVED                 = 27
UNSUPPORTED                = 2
FAIL                       = 0
PASS                       = 0
EXTERNALLY_DISCHARGED      = 0
raw unresolved inputs      = 45
```

Candidate conformance remains:

```text
CONFORMS                           = 5
OPEN                              = 20
NON_CONFORMING                     = 0
REQUIRES_REFERENCE_HOUSE_REVISION = 0
```

The crucial interpretation is that **45 raw missing fields are not 45 SCREENING blockers**. T6 applies current owner authority to that low-level diagnostic set.

#### T6 — SCREENING aggregation and architectural review

Executable proof:

- `compiler/dpl/dplT6Lennard.ts`
- `compiler/dpl/dplT6Lennard.test.ts`

Decision record:

`project/dpl/dpl-t6-lennard-screening-aggregation.md`

T6 reuses current DPL-02 / DPL-09 / DPL-10 / DPL-11 authority and the existing DPL-13 aggregation semantics rather than inventing a parallel real-site compatibility engine.

The exact current DPL-02 architectural-review universe is sixteen clauses. A fresh Lennard-specific, evidence-bearing delegated project-author review passes all sixteen against the exact T5 candidate. `RH-PROT-08` and `RH-PROT-14` remain outside project-author review and remain current blockers. `RH-SI02` and `RH-SI05` are preserved as external site interfaces but are `FUTURE_DUE`, not current SCREENING blockers.

T6 also performs narrow source/status composition:

```text
London / Bromley planning source composition = PASS
England project-event source applicability   = UNRESOLVED
```

The planning PASS is source/status composition only. It is not planning compliance or permission.

Frozen identities:

```text
T6 result fingerprint
  c59073cc2c6b073c2905a92b42b36b27f287e32e84d86d51f92cdd4d52ba3b45

readiness identity fingerprint
  8329522c604de85912b35aab4a3958f270bd7b246395ed0a534494f3b6d33853

architectural-review ledger fingerprint
  d320507d8bf7d6a6606e502a49515bb1a071c36ed8ed248f0d4fb022d4e1365c
```

The intermediate normalized readiness contains 46 blocking coverage entries. After the sixteen-clause architectural review and narrow source/status composition, the actual post-review frontier is:

```text
raw T5 unresolved inputs          = 45
post-review T6 blockers           = 25
SUBSTANTIVE_UNRESOLVED            = 10
DUE_CLASSIFICATION_UNRESOLVED     = 15

REFERENCE_HOUSE                   = 2
ENGLAND                           = 1
PLANNING                          = 12
NON_PLANNING                      = 10
```

The exact two due-now Reference House blockers are:

```text
RH-PROT-08
RH-PROT-14
```

The fifteen due-classification blockers are the exact `::ACCELERATION_REVIEW` records. They are **classification instructions, not survey instructions**.

Result:

`UNRESOLVED_AT_SCREENING_GENUINE_FRONTIER_CLASSIFIED`

#### T7 — acceleration classification and public-evidence disposition

Executable proof:

- `compiler/dpl/dplT7Lennard.ts`
- `compiler/dpl/dplT7Lennard.test.ts`

Decision and evidence records:

- `project/dpl/dpl-t7-lennard-acceleration-disposition.md`
- `project/dpl/sites/dpl-t-control-004-lennard-road-t7-public-screening-v01.json`

T7 evaluates each of the fifteen T6 `::ACCELERATION_REVIEW` entries against its literal registered trigger. It refuses the inference `UNKNOWN → trigger activated`.

Frozen identities:

```text
T7 result fingerprint
  f326bf64e599b08099edd21160e8e6a7af79477fd76a1f72b3b445e587f3c88c

public evidence fingerprint
  091dccbc6b5da1e4a7888a96aa605c1b91c28d27dbd64d26506094282166163e

planning coverage fingerprint
  d740bc9ddde53055e68d9cae407b306c92d4ed8c5004a2a5e525a6f1b87b90fc

non-planning coverage fingerprint
  0d855806e818b4ddfe35e9a38b44278f6d041a7feeee795998b9dc5d0df8c615
```

Result counts:

```text
acceleration inputs                          = 15
NO_POSITIVE_TRIGGER_FACT_ADMITTED            = 15
FUTURE_DUE_OR_DOWNSTREAM                     = 12
TRIGGER_NOT_ACTIVATED_AT_SCREENING           = 3
new acceleration-driven due-now evidence     = 0
remaining substantive blockers               = 10
```

The three non-activated acceleration records whose base families remain independently due now are:

```text
DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
DPL11-COV-ACCESS-STATUS
DPL11-COV-PHYSICAL-FLOOD-WATER
```

The other twelve return to their registered future/downstream timing. In particular:

- unknown legal-boundary precision is not a known boundary discrepancy;
- unknown ground, rights, sewer or utility evidence is not a positive fatal constraint;
- approximate public flood/heritage/ecology context cannot prove absence or manufacture a positive trigger;
- Bromley parking/access acceleration remains unsupported while strategic/local temporal policy composition is unresolved.

Result:

`ACCELERATION_FRONTIER_DISPOSED_NO_NEW_DUE_NOW_EVIDENCE`

## Current gate — DPL-T7

T7 has answered the acceleration question. It reduces the active frontier from 25 T6 blockers to exactly ten substantive blockers without pretending those ten are already procurement instructions:

```text
REFERENCE_HOUSE:RH-PROT-08
REFERENCE_HOUSE:RH-PROT-14
ENGLAND:ENG-COV-SOURCE-APPLICABILITY
PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT
PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY
PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY
PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
NON_PLANNING:DPL11-COV-ACCESS-STATUS
NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER
NON_PLANNING:DPL11-COV-SITE-CONTROL
```

It proves:

```text
15 / 15 acceleration predicates evaluated individually
15 / 15 have no admitted positive trigger fact
12 return to FUTURE_DUE / downstream timing
3 add no evidence burden beyond their independently due base families
0 new accelerated external-evidence requirements
25 → 10 active blockers
no site evidence commissioned
```

It does not prove:

```text
that future-due constraints are absent
whole-site compatibility
whole-site incompatibility
route exhaustion
planning acceptability
engineering adequacy
legal boundary position
private rights
measured topography
```

## Next gate — DPL-T8

> **Take only the exact ten substantive blockers surviving T7; challenge their present SCREENING timing and resolve everything that can be resolved from authoritative existing project/public evidence before defining the minimum genuinely external evidence packet.**

T8 must:

1. bind to T7 result `f326bf64e599b08099edd21160e8e6a7af79477fd76a1f72b3b445e587f3c88c` and the exact ten-item frontier;
2. distinguish a true current SCREENING blocker from a downstream project-event or later-design obligation;
3. resolve authoritative England/planning source and policy questions internally where possible;
4. evaluate the independent access-status, physical-flood/water and site-control blockers against authoritative public/project evidence;
5. preserve `RH-PROT-08` and `RH-PROT-14` unless their current timing can be legitimately reclassified or competent evidence resolves them;
6. output the **minimum surviving evidence classes**, bundling only where authority supports it;
7. commission nothing in T8;
8. preserve the Reference House unchanged;
9. refuse `COMPATIBLE`, `INCOMPATIBLE` and route exhaustion.

Only after T8 should DPL authorise an actual evidence-acquisition packet, if any external evidence still survives.

## Frozen programme boundaries

```text
DPL-14 eight-site corpus              = UNCHANGED
DPL-15C corpus readiness              = 0 / 8
instrumented real controls            = EXCLUDED FROM DPL-16 SAMPLE
Reference House                       = UNCHANGED
legal title boundary                  = UNRESOLVED
private access rights                 = UNRESOLVED
highway adoption extent               = UNRESOLVED
measured private topographic survey   = NOT_ACQUIRED
foundation / ground adequacy          = NOT_PROVED
accessible approach / threshold       = NOT_PROVED
foul / surface-water solution         = NOT_PROVED
utility approach / external plant     = NOT_PROVED
planning acceptability                = NOT_PROVED
site evidence commissioned by T7      = NO
COMPATIBLE @ SCREENING                = NOT_ADMITTED FOR REAL CONTROL
whole-site INCOMPATIBLE               = NOT_ADMITTED
route search / exhaustion             = NOT_IMPLEMENTED
DPL-16 deployment envelope            = HELD
DPL-17 publication integration        = HELD
DPL-18 final validation               = HELD
```

## Restart discipline

Resume from this file, #806, `project/dpl/dpl-t7-lennard-acceleration-disposition.md`, `project/dpl/dpl-t6-lennard-screening-aggregation.md`, the T3/T4/T5 artifacts under `project/dpl/sites/`, and the exact T7 deterministic output.

Every packet must preserve:

`baseline main SHA → exact question → controlled inputs → evidence/authority → deterministic result → boundaries → artefacts changed → checks → exact next packet`
