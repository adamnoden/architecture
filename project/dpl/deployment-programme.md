# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Current packet:** [#778 — DPL-T6](https://github.com/adamnoden/architecture/issues/778) — Lennard SCREENING frontier classification and architectural review  
**Current real-control result:** `UNRESOLVED_AT_SCREENING_GENUINE_FRONTIER_CLASSIFIED`  
**Next authorised packet:** **DPL-T7 — Lennard acceleration classification and public-evidence disposition**  
**Programme maturity:** **M5 — the real-control SCREENING frontier is now explicitly classified; whole-site compatibility and evidence procurement remain unearned.**

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

The crucial interpretation is that **45 raw missing fields are not 45 SCREENING blockers**. T6 exists to apply the current owner authority to that low-level diagnostic set.

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

The fifteen due-classification blockers are the exact `::ACCELERATION_REVIEW` records. They are **classification instructions, not survey instructions**. T6 deliberately does not commission site evidence from them.

Result:

`UNRESOLVED_AT_SCREENING_GENUINE_FRONTIER_CLASSIFIED`

T6 does not emit `COMPATIBLE`, `INCOMPATIBLE`, route exhaustion, planning acceptability, engineering adequacy or a survey/consultant procurement list.

## Current gate — DPL-T6

T6 answers its bounded question: it reduces the raw T5 diagnostic gaps to the exact current SCREENING frontier under existing authority.

It proves:

```text
45 raw missing runtime inputs are not treated as 45 equal blockers
16 architectural-review clauses are resolved by fresh exact-candidate review
RH-PROT-08 / RH-PROT-14 remain due now
RH-SI02 / RH-SI05 remain future-due
25 post-review blockers remain
15 of those are acceleration-classification questions
no real claim is uncovered
no site evidence has been commissioned
```

It does not prove:

```text
whole-site compatibility
whole-site incompatibility
route exhaustion
legal boundary position
private rights
measured topography
foundation adequacy
planning acceptability
site-interface design
```

## Next gate — DPL-T7

> **Classify the exact fifteen Lennard `::ACCELERATION_REVIEW` records against present coverage authority and already-admitted or recoverable public evidence before commissioning anything; only evidence that survives that classification may become a due-now external acquisition requirement.**

T7 must:

1. start from the exact T6 result fingerprint and 25-item blocker frontier;
2. review each of the fifteen acceleration records individually;
3. use already-admitted or recoverable public evidence where it is authoritative enough for SCREENING;
4. classify each acceleration item as resolved/dismissed, genuinely due now, future-due/downstream, or unresolved pending external authority;
5. reconcile directly coupled substantive blockers only where the same evidence legitimately earns it;
6. produce a minimum surviving external-evidence frontier rather than a default consultant shopping list;
7. preserve `RH-PROT-08` and `RH-PROT-14` unless competent evidence actually resolves them;
8. preserve the Reference House unchanged;
9. refuse `COMPATIBLE`, `INCOMPATIBLE` and route exhaustion.

Only after T7 should DPL decide what, if anything, must actually be commissioned for the next real-control gate.

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
site evidence commissioned by T6      = NO
COMPATIBLE @ SCREENING                = NOT_ADMITTED FOR REAL CONTROL
whole-site INCOMPATIBLE               = NOT_ADMITTED
route search / exhaustion             = NOT_IMPLEMENTED
DPL-16 deployment envelope            = HELD
DPL-17 publication integration        = HELD
DPL-18 final validation               = HELD
```

## Restart discipline

Resume from this file, #778, `project/dpl/dpl-t6-lennard-screening-aggregation.md`, `project/dpl/dpl-t5-merge-state-replay.md`, the T3/T4/T5 artifacts under `project/dpl/sites/`, and the exact T6 deterministic output.

Every packet must preserve:

`baseline main SHA → exact question → controlled inputs → evidence/authority → deterministic result → boundaries → artefacts changed → checks → exact next packet`
