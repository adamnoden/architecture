# DPL-S1A — 25A Chesterfield Road parcel binding

**Issue:** #672  
**Parent:** #663 — DPL-S1  
**Control:** `DPL-S-CONTROL-003`  
**Address:** 25A Chesterfield Road, Chiswick, London, W4 3HQ  
**Application:** Hounslow `P/2025/1408`  
**Retrieval date:** 2026-10-25  
**Final S1 disposition:** `CONTROL_SITE_SCREENING_GEOMETRY_NO_UNCHANGED_RH_PLACEMENT`

## Result

The exact-address and parcel-geometry seam is closed.

```text
UPRN                       = 100021580413
Planning Data entity       = 12044235316
title-boundary reference   = 44235316
quality                    = authoritative
source CRS                 = EPSG:4326
source JSON SHA-256        = 45240408b1a30743acfb5c06a98e9647ee55fa9bd6a24bcb5819163dee3b2b79
UPRN query result count    = 1
point query result count   = 1
query convergence          = IDENTICAL_SINGLE_ENTITY
```

The exact UPRN query and an independent coordinate query return the same single authoritative title-boundary entity. No neighbouring polygon was selected by visual judgement.

The exact geometry is frozen in:

`project/dpl/sites/dpl-s-control-003-chesterfield-road-title-boundary.json`

## Authority boundary

Planning Data publishes the HM Land Registry `title-boundary` dataset as authoritative source data. HM Land Registry describes INSPIRE/index polygons as showing the position and **indicative extent** of a registered freehold property; they do not establish the exact legal extent of a registered title.

Therefore DPL uses entity `44235316` as the exact controlled **SCREENING index geometry** for this experiment. It does not claim that the legally determined title boundary has the same exact coordinates.

That distinction changes the wording of the result, not the geometry proof.

## Geometry

Exact WKT from Planning Data:

```text
MULTIPOLYGON (((-0.267505 51.485697, -0.267403 51.485882, -0.267309 51.486055, -0.267396 51.486074, -0.267438 51.486015, -0.267626 51.485725, -0.267505 51.485697)))
```

The WGS84 source geometry was transformed to British National Grid (`EPSG:27700`) for planar metric analysis.

```text
polygon area                         = 327.8688 m²
minimum rotated containing envelope = 8.96194 m × 42.07089 m
Reference House footprint            = 12.0 m × 10.8 m
minimum RH projection width          = 10.8 m
screening-polygon containing width   = 8.96194 m
shortfall                            = 1.83806 m
```

## No-placement proof

The controlled SCREENING polygon lies wholly within a strip `8.96194 m` wide.

A rigid `12.0 m × 10.8 m` rectangle has a minimum possible orthogonal projection width of `10.8 m` over all rotations.

Therefore:

```text
8.96194 m < 10.8 m
```

and no rigid rotation of the unchanged Reference House footprint can be contained inside this exact tested polygon. Mirroring cannot change the footprint dimensions.

No Reference House candidate was authored.

## DPL meaning

Final S1 result:

```text
CONTROL_SITE_SCREENING_GEOMETRY_NO_UNCHANGED_RH_PLACEMENT
```

Meaning only:

> The controlled SCREENING title-boundary geometry is sufficiently explicit to prove that no rigid placement of the unchanged `12.0 m × 10.8 m` Reference House footprint exists within that tested polygon.

This is **not**:

```text
CONTROL_SITE_NOT_READY_EVIDENCE_GAP
CONTROL_SITE_NOT_READY_SOURCE_CONFLICT
whole-site INCOMPATIBLE
legal-title impossibility
planning refusal
```

The evidence is sufficient and coherent; it simply yields a negative pre-candidate geometry result.

## R1–R6 closeout

```text
R1 = SATISFIED_FOR_TESTED_SCREENING_TITLE_EXTENT
R2 = SATISFIED_GEOMETRY_ACQUIRED_KNOWN_NO_PLACEMENT
R3 = SATISFIED_EPSG4326_SOURCE_WITH_BNG_ANALYSIS
R4 = NOT_ASSESSED_GEOMETRY_SHORT_CIRCUIT
R5 = PARTIAL_FIRST_PARTY_STREET_FRONT_IDENTITY_GEOMETRY_SHORT_CIRCUIT
R6 = SATISFIED_FOR_TESTED_SCREENING_TITLE_EXTENT
```

R4/R5 were deliberately not completed after the geometric short-circuit. Datum and access evidence cannot rescue a rigid footprint that cannot be contained by the tested geometry.

## Boundary

Do not respond to this result by:

- shrinking the Reference House;
- changing its `12.0 m × 10.8 m` footprint;
- aggregating neighbouring No. 25 land;
- selecting another title polygon by visual plausibility;
- treating the applicant's smaller replacement house as an RH route;
- upgrading an index polygon into a determined legal boundary;
- emitting whole-site `INCOMPATIBLE`.

25A is retained as a useful conventional street-front **negative geometry control**. The next positive-control attempt should preserve this ordinary replacement-house typology but run exact parcel geometry and width preflight before spending effort on datum/access evidence.

## Attribution

This information is subject to Crown copyright and database rights 2026 and is reproduced with the permission of HM Land Registry.

The polygons, including associated x/y geometry, are subject to Crown copyright and database rights 2026 Ordnance Survey 100026316.

Conditions: `https://use-land-property-data.service.gov.uk/datasets/inspire/#conditions`
