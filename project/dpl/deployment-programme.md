# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Current packet:** [#729 — DPL-T3](https://github.com/adamnoden/architecture/issues/729) — 41 Lennard Road unchanged Reference House candidate authoring  
**Current real-control result:** `REFERENCE_HOUSE_CANDIDATE_AUTHORED_PENDING_POST_T3_VERIFICATION`  
**Next authorised packet after T3 lands:** **fresh post-T3 deterministic candidate verification and conformance replay**  
**Programme maturity:** **M4 — internally controlled at the bounded synthetic SCREENING-result scope. Real-site deployment remains unvalidated.**

## Purpose and governing rules

DPL asks whether the controlled Ovid’s House Reference House can be deployed honestly onto real land under declared site, jurisdiction, evidence and assurance conditions.

> **Compatibility before adaptation.**

> **The compiler evaluates architecture; it does not silently author it.**

> **Unknown reality stays unknown. Missing evidence is not a pass.**

> **Spatial evidence retains its actual authority class. An HMLR index polygon is not a determined legal boundary; EA DTM is not a private measured topo survey.**

## Controlled synthetic and corpus state

DPL-01 through DPL-13 establish the current controlled synthetic deployment machinery and SCREENING aggregation semantics.

The empirical DPL-14 London corpus remains unchanged:

```text
DPL-RP-001 … DPL-RP-008
DPL-15C candidate-authoring readiness = 0 / 8
DPL-16 deployment envelope            = HELD
```

Instrumented controls are pipeline experiments only and are excluded from DPL-16 sampling.

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

#### Geometry

```text
area                            = 783.6969 m²
minimum containing envelope     = 13.5235 m × 67.1018 m
unchanged RH                    = 12.0 m × 10.8 m
width margin                    = 2.7235 m
constructive witness contained  = YES
witness min boundary clearance  = ~1.232 m
```

Result:

`CONTROLLED_SCREENING_GEOMETRY_DOES_NOT_DISPROVE_PLACEMENT`

The witness is geometry proof only, not the authored deployment candidate.

#### Datum / topography

Environment Agency 1 m DTM, EPSG:27700 / metres ODN, masked by the exact controlled SCREENING parcel:

```text
parcel minimum     = 70.20 m ODN
parcel maximum     = 71.10 m ODN
parcel mean        = 70.5288 m ODN
terrain range      = 0.90 m
planning-point     = 70.55 m ODN
raster SHA-256     = ee7e04c7eee8f4391bc64cd57485439722e15687ffaad49b4a02804957fd1db9
```

This satisfies SCREENING datum/topography authority while remaining below measured private-survey assurance.

#### Street / access relationship

Exact-site submitted planning evidence identifies:

- south-west/front adjacency to Lennard Road;
- existing front-garden/front-door access;
- a dropped kerb directly in front of the site.

The current `26/02618/FPA` proposition independently includes front driveway alterations.

Composed with the exact parcel polygon, this is sufficient to identify the real street/access side for honest SCREENING candidate placement. Legal highway extent/adoption and private rights remain unresolved and are not required to author the SCREENING candidate.

#### Final R1–R6 state

```text
R1_CONTROLLED_SPATIAL_IDENTITY       = SATISFIED_FOR_SCREENING_TITLE_EXTENT
R2_FOOTPRINT_TEST_GEOMETRY           = SATISFIED_POSITIVE_CONSTRUCTIVE_PREFLIGHT
R3_REAL_ORIENTATION_FRAME            = SATISFIED_EPSG4326_SOURCE_WITH_BNG_ANALYSIS
R4_DATUM_LEVEL_EVIDENCE              = SATISFIED_SCREENING_DATUM_TOPOGRAPHY_EA_DTM
R5_PHYSICAL_ACCESS_STREET_GEOMETRY   = SATISFIED_SCREENING_PHYSICAL_STREET_ACCESS_RELATIONSHIP
R6_SITE_IDENTITY_COHERENCE           = SATISFIED_AT_PARCEL_ADDRESS_PLANNING_IDENTITY_LEVEL

result = CONTROL_SITE_CANDIDATE_AUTHORING_READY
```

#### DPL-T3 authored candidate

T3 now authors exactly one unchanged, unmirrored `RH-V02` placement:

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

The earlier T1 constructive witness is not promoted into architecture: it proved only that the shell could fit. T3 keeps the canonical 12 m façade street-facing and uses a deliberately legible small skew rather than forcing false parallelism to the approximately 10.166 m indicative title-front segment.

The `~0.640 m` clearance is a screening geometry result only. It is not a legal setback, planning separation, maintenance corridor, fire separation or construction tolerance.

Durable artifact:

`project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json`

Decision record:

`project/dpl/dpl-t3-lennard-authored-candidate.md`

The candidate preserves the current controlled shell/courtyard/stair/front-field facts and pins `RH-V02`. `RH-SI02` absolute-datum/external-level transition and `RH-SI05` approach/access/landscape integration remain open site-interface work.

## Active packet — DPL-T3

DPL-T3 is the bounded **authoring** packet. It does not prove the candidate by letting a verifier search for something that works.

The compiler role remains deterministic verification only:

```text
candidate generation / search   = PROHIBITED
placement optimisation          = PROHIBITED
Reference House mutation        = PROHIBITED
whole-site COMPATIBLE           = NOT ADMITTED
route exhaustion                = NOT IMPLEMENTED
```

The original #729 wording predates the final T2 acquisition and mentions coarse Open-Meteo / OSM evidence. The landed T2 authority supersedes that admission detail: HMLR / Planning Data title geometry, Environment Agency 1 m DTM, and exact-site planning frontage/access evidence are the source package pinned by T3.

## Next gate after T3

After T3 lands, authorise only a fresh verification packet:

> **Deterministically replay `DPL-T-CANDIDATE-004-01` against the pinned Lennard evidence and current DPL-12B Reference House authority; prove source identity, rigid-transform reproduction, screening containment and bounded conformance without route search or compatibility inflation.**

The post-T3 gate may reject the authored candidate. It may not silently author another one.

## Frozen programme boundaries

```text
DPL-14 eight-site corpus              = UNCHANGED
DPL-15C corpus readiness              = 0 / 8
instrumented real controls            = EXCLUDED FROM DPL-16 SAMPLE
Reference House                       = UNCHANGED
legal title boundary                  = UNRESOLVED
private access rights                 = UNRESOLVED
highway adoption extent               = UNRESOLVED
measured private topographic survey   = NOT ACQUIRED
planning acceptability                = NOT PROVED
COMPATIBLE @ SCREENING                = NOT ADMITTED FOR REAL CONTROL
whole-site INCOMPATIBLE               = NOT ADMITTED
route search / exhaustion             = NOT IMPLEMENTED
DPL-16 deployment envelope            = HELD
DPL-17 publication integration        = HELD
DPL-18 final validation               = HELD
```

## Restart discipline

Resume from this file, #729, `project/dpl/dpl-t3-lennard-authored-candidate.md`, and `project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json` together with the admitted T2 geometry/elevation/street-access records under `project/dpl/sites/`.

Every packet must preserve:

`baseline main SHA → exact question → controlled inputs → evidence/authority → deterministic result → boundaries → artefacts changed → checks → exact next packet`
