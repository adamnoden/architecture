# DPL-T2 — 41 Lennard Road datum / street-access composition and R1–R6 admission

**Issue:** #722  
**Parent gate:** #700 — DPL-T  
**DPL-T1 merge:** `5ebedc08c469af7e46e7a13d25d5b42b1fd9f943`  
**Control:** `DPL-T-CONTROL-004`  
**Address:** 41 Lennard Road, Bromley, BR2 8LN  
**Application:** Bromley `26/02618/FPA`  
**UPRN:** `100020404537`  
**Date:** 2026-10-25  
**Result:** `CONTROL_SITE_CANDIDATE_AUTHORING_READY`

## Result

All six frozen SCREENING candidate-authoring dimensions now have positive, bounded evidence dispositions.

```text
R1_CONTROLLED_SPATIAL_IDENTITY       = SATISFIED_FOR_SCREENING_TITLE_EXTENT
R2_FOOTPRINT_TEST_GEOMETRY           = SATISFIED_POSITIVE_CONSTRUCTIVE_PREFLIGHT
R3_REAL_ORIENTATION_FRAME            = SATISFIED_EPSG4326_SOURCE_WITH_BNG_ANALYSIS
R4_DATUM_LEVEL_EVIDENCE              = SATISFIED_SCREENING_DATUM_TOPOGRAPHY_EA_DTM
R5_PHYSICAL_ACCESS_STREET_GEOMETRY   = SATISFIED_SCREENING_PHYSICAL_STREET_ACCESS_RELATIONSHIP
R6_SITE_IDENTITY_COHERENCE           = SATISFIED_AT_PARCEL_ADDRESS_PLANNING_IDENTITY_LEVEL

final result = CONTROL_SITE_CANDIDATE_AUTHORING_READY
```

This result authorises one later authored Reference House placement only. It is not compatibility and does not establish legal-title, planning, highway-right, ground or construction assurance.

## R1 / R2 / R3 / R6 — inherited DPL-T1 proof

DPL-T1 bound the exact site through independent identity convergence:

```text
planning BNG point     = 542903,166217
UPRN                    = 100020404537
UPRN BNG point          ≈ 542903.0123,166217.0333
point separation        ≈ 0.036 m
HMLR title entity       = 12057071807
HMLR reference          = 57071807
quality                 = authoritative
source CRS              = EPSG:4326
analysis CRS            = EPSG:27700
```

The exact SCREENING polygon is `783.6969 m²` with a minimum rotated containing width of `13.5235 m`.

The unchanged Reference House remains `12.0 m × 10.8 m`. A constructive rigid rectangle is contained by the exact controlled polygon with approximately `1.232 m` minimum boundary clearance at the geometry witness placement.

Therefore R2 positively establishes that controlled SCREENING geometry does not disprove an unchanged RH placement. The witness remains geometry proof, not the authored candidate.

The HMLR polygon is an indicative registered-property index extent, not a determined legal boundary.

## R4 — Environment Agency DTM

A bounded first-party Environment Agency WCS extraction was acquired from:

```text
LiDAR Composite Digital Terrain Model DTM 1m
coverage = 13787b9a-26a4-4775-8523-806d13af58fc__Lidar_Composite_Elevation_DTM_1m
CRS      = EPSG:27700
vertical = metres ODN
bbox     = E 542840–542980 / N 166140–166300
raster   = 140 × 160 cells @ 1 m
SHA-256  = ee7e04c7eee8f4391bc64cd57485439722e15687ffaad49b4a02804957fd1db9
```

Masking that exact raster by the controlled HMLR SCREENING polygon yields:

```text
included 1 m cells           = 786
parcel DTM minimum           = 70.20 m ODN
parcel DTM maximum           = 71.10 m ODN
parcel DTM mean              = 70.5288 m ODN
parcel terrain range         = 0.90 m
parcel-centroid sample       = 70.40 m ODN
planning-identity point      = 70.55 m ODN
```

This is enough to author a SCREENING ground datum in the later candidate packet without inventing a level relationship.

It is **not** a private measured topographic survey. The later candidate must retain that assurance boundary.

Durable record:

`project/dpl/sites/dpl-t-control-004-lennard-road-elevation.json`

## R5 — physical street/access relationship

The exact-address submitted planning statement for 41 Lennard Road records:

- the bungalow front elevation faces south-west;
- the property sits on the eastern side of Lennard Road;
- the **front / south-west** adjoining condition is Lennard Road;
- existing primary access is via the front garden/front door;
- a dropped kerb exists directly in front of the site for vehicular access to the front garden.

The current `26/02618/FPA` proposal independently retains that physical relationship by explicitly including **front driveway alterations**.

Composed with the exact HMLR SCREENING polygon, the source evidence identifies the street side of the controlled parcel as the south-west/front boundary. The corresponding south-west polygon segment used for SCREENING orientation/context is approximately:

```text
start  = 542891.0360,166209.4646 BNG
end    = 542898.2702,166202.3222 BNG
length = 10.1660 m
```

This is sufficient for honest SCREENING placement relative to the actual street/access side.

It does **not** establish:

- the legally determined highway boundary;
- highway adoption extent;
- private access rights;
- a current measured kerb/crossover survey.

Bromley separately states that a paid highway search is the route to its maintenance/adoption extent records. DPL-T2 does not purchase or fabricate that later assurance merely to author a SCREENING candidate.

A bounded open-road API probe was also attempted and failed at transport (HTTP 406 / timeout / DNS); no road-scraping subsystem is warranted because the site-specific planning evidence already answers the physical relationship question at this assurance level.

Durable record:

`project/dpl/sites/dpl-t-control-004-lennard-road-street-access.json`

## Planning snapshot

Current public indexes of Bromley's register continue to report:

```text
26/02618/FPA
41 Lennard Road, Bromley, BR2 8LN
Full planning permission
Valid / awaiting decision
received  2026-06-29
validated 2026-08-24
proposal includes demolition of existing bungalow and front driveway alterations
```

The current file is also indexed as containing explicit existing/proposed site plans, sections, a location/site plan, and `DRAW/41.LR/0626/010 — Existing & Proposed Streetscene Elevations incl. AOD Levels`.

Those document identities corroborate that the current planning file is spatially rich, but T2 does not use unacquired drawing bytes to manufacture any numerical fact. R4 is supplied by EA DTM; R5 is supplied by the exact-site frontage/access evidence plus the current planning proposition.

Decision outcome is irrelevant to candidate-authoring readiness.

## Final authority boundary

`CONTROL_SITE_CANDIDATE_AUTHORING_READY` means only:

> enough controlled real-site geometry, orientation, topography, physical street/access relationship and identity coherence now exist to author one explicit unchanged Reference House placement at SCREENING assurance without inventing site facts.

It does not mean:

```text
legal title boundary proved            = NO
private rights/access cleared           = NO
highway adoption extent proved          = NO
measured topographic survey acquired    = NO
planning acceptability proved           = NO
building-regulation compliance proved   = NO
COMPATIBLE @ SCREENING                  = NO
INCOMPATIBLE                            = NO
```

## Next packet

Authorise exactly:

> **DPL-T3 — 41 Lennard Road unchanged Reference House candidate authoring**

T3 must author exactly one explicit placement against the admitted T2 source package. The compiler must not search alternatives or optimise the placement.

## Frozen programme boundaries

```text
DPL-RP-001…008 corpus          = UNCHANGED / 0 of 8 ready
DPL-T-CONTROL-004              = EXCLUDED FROM DPL-16 SAMPLE
Reference House               = UNCHANGED
candidate                     = NOT YET AUTHORED
COMPATIBLE                     = NOT ADMITTED
whole-site INCOMPATIBLE        = NOT ADMITTED
route search / optimisation    = NOT IMPLEMENTED
DPL-16                         = HELD
```
