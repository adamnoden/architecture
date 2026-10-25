# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Current packet:** [#722 — DPL-T2](https://github.com/adamnoden/architecture/issues/722) — 41 Lennard Road full R1–R6 admission  
**Current real-control result:** `CONTROL_SITE_CANDIDATE_AUTHORING_READY`  
**Next authorised packet after T2 lands:** **DPL-T3 — 41 Lennard Road unchanged Reference House candidate authoring**  
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

## Next packet — DPL-T3

After T2 lands, authorise exactly:

> **DPL-T3 — 41 Lennard Road unchanged Reference House candidate authoring**

T3 must author **one explicit placement** against the frozen Lennard source package. The compiler must not search or optimise alternatives. Any placement must preserve the unchanged `12.0 m × 10.8 m` Reference House and carry the SCREENING authority limits forward.

T3 candidate authoring is not `COMPATIBLE`.

## Frozen programme boundaries

```text
DPL-14 eight-site corpus              = UNCHANGED
DPL-15C corpus readiness              = 0 / 8
instrumented real controls            = EXCLUDED FROM DPL-16 SAMPLE
Reference House                       = UNCHANGED
legal title boundary                  = UNRESOLVED
private access rights                 = UNRESOLVED
highway adoption extent               = UNRESOLVED
COMPATIBLE @ SCREENING                = NOT ADMITTED FOR REAL CONTROL
whole-site INCOMPATIBLE               = NOT ADMITTED
route search / exhaustion             = NOT IMPLEMENTED
DPL-16 deployment envelope            = HELD
DPL-17 publication integration        = HELD
DPL-18 final validation               = HELD
```

## Restart discipline

Resume from this file, #722, `project/dpl/dpl-t2-lennard-r1-r6-admission.md`, and the `DPL-T-CONTROL-004` geometry/elevation/street-access records under `project/dpl/sites/`.

Every packet must preserve:

`baseline main SHA → exact question → controlled inputs → evidence/authority → deterministic result → boundaries → artefacts changed → checks → exact next packet`
