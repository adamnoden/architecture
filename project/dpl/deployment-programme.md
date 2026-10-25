# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Current packet:** [#752 — DPL-T4](https://github.com/adamnoden/architecture/issues/752) — deterministic Lennard candidate verification  
**Current real-control result:** `VERIFIED_BOUNDED_CANDIDATE_READY_FOR_NEXT_DPL_GATE`  
**Next authorised packet:** **DPL-T5 — real-control deployment case assembly and screening-coverage replay**  
**Programme maturity:** **M4 — internally controlled at bounded SCREENING-result scope. Real-site whole-deployment validation remains unearned.**

## Purpose and governing rules

DPL asks whether the controlled Ovid’s House Reference House can be deployed honestly onto real land under declared site, jurisdiction, evidence and assurance conditions.

> **Compatibility before adaptation.**

> **The compiler evaluates architecture; it does not silently author it.**

> **Unknown reality stays unknown. Missing evidence is not a pass.**

> **Spatial evidence retains its actual authority class. An HMLR index polygon is not a determined legal boundary; EA DTM is not a private measured topo survey.**

## Controlled synthetic and corpus state

DPL-01 through DPL-13 establish the controlled deployment ontology, conformance seam, interface authority, target stack, runtime composition and SCREENING aggregation semantics.

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

The site is the intended conventional condition: existing bungalow → demolition → one detached replacement house on the normal street frontage.

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

The admitted evidence package is:

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

T3 kept the canonical 12 m façade street-facing rather than reusing the arbitrary T1 fit witness. The small authored skew avoids false parallelism to an indicative title-front segment only ~10.166 m wide.

Durable artifacts:

- `project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json`
- `project/dpl/dpl-t3-lennard-authored-candidate.md`

#### T4 — deterministic candidate verification

T4 now machine-replays the exact candidate from pinned source authority.

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

DPL-12B conformance replay:

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

The open interface results are intentional. Under DPL-08, a site-interface freedom is discharged only by a controlled response between building handoff, evidenced site facts and applicable obligations. Placement alone cannot make `RH-SI02` or `RH-SI05` pass.

## Active packet — DPL-T4

DPL-T4 is the bounded **verification** packet.

It fails closed on:

- stale Reference House or site-evidence identity;
- transform drift, mirroring or deformation;
- title-index containment failure;
- frontage-relation drift;
- protected Reference House fact drift;
- unexpected DPL-12B conformance changes.

It does not:

```text
search / generate another placement
optimise the authored placement
repair a failing candidate
infer legal boundaries
infer measured topography
solve site interfaces
assess planning acceptability
emit whole-site COMPATIBLE / INCOMPATIBLE
```

## Next gate — DPL-T5

The useful next question is no longer whether another placement can be found.

> **Assemble `DPL-T-CONTROL-004` + `DPL-T-CANDIDATE-004-01` as one instrumented real-control deployment case through the existing DPL runtime, using current England/London/Bromley target slices and DPL-08 interface authorities; preserve all real-site unknowns and emit coverage/readiness evidence without whole-site compatibility inflation.**

This follows the DPL-13A discipline: compose real evidence and current authority first, then observe what remains unresolved/unsupported. Do not pre-emptively design `RH-SI02`, `RH-SI05`, drainage, utilities or other site responses merely to manufacture a green case.

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
COMPATIBLE @ SCREENING                = NOT_ADMITTED FOR REAL CONTROL
whole-site INCOMPATIBLE               = NOT_ADMITTED
route search / exhaustion             = NOT_IMPLEMENTED
DPL-16 deployment envelope            = HELD
DPL-17 publication integration        = HELD
DPL-18 final validation               = HELD
```

## Restart discipline

Resume from this file, #752, `project/dpl/dpl-t4-lennard-candidate-verification.md`, and the T3/T4 artifacts under `project/dpl/sites/`.

Every packet must preserve:

`baseline main SHA → exact question → controlled inputs → evidence/authority → deterministic result → boundaries → artefacts changed → checks → exact next packet`
