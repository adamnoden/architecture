# DPL-S1A — 25A Chesterfield Road parcel binding

**Issue:** #672  
**Parent:** #663 — DPL-S1  
**Control:** `DPL-S-CONTROL-003`  
**Address:** 25A Chesterfield Road, Chiswick, London, W4 3HQ  
**Application:** Hounslow `P/2025/1408`  
**Retrieval date:** 2026-10-25  
**State:** `AUTHORITATIVE_TITLE_GEOMETRY_ACQUIRED_KNOWN_NO_UNCHANGED_RH_PLACEMENT`

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

The UPRN query and an independent coordinate query return byte-identical JSON with the same single authoritative title-boundary entity. No neighbouring polygon was selected by visual judgement.

The exact source geometry is frozen in:

`project/dpl/sites/dpl-s-control-003-chesterfield-road-title-boundary.json`

## Source authority

Planning Data publishes the HM Land Registry `title-boundary` dataset under OGL v3.0 and describes it as Land Registry Index polygons showing the position and indicative extent of a registered property.

HM Land Registry's own INSPIRE contract is deliberately narrower than a legal-title claim:

- the polygons show the position and **indicative extent** of registered freehold property;
- they do not establish the exact legal extent of the land in a registered title;
- the individual title plan is required for that stronger proposition.

DPL therefore uses entity `44235316` only as the exact controlled SCREENING geometry for the tested land. It is not silently promoted to a determined legal boundary.

The current HMLR direct Hounslow ZIP endpoint was also recovered exactly:

`https://use-land-property-data.service.gov.uk/datasets/inspire/download/London_Borough_of_Hounslow.zip`

but the live service returns a self-referential redirect loop to automated retrieval. This transport defect is non-blocking because Planning Data exposes the current authoritative title-boundary entity and exact machine-readable geometry.

## Geometry

Exact WKT from Planning Data:

```text
MULTIPOLYGON (((-0.267505 51.485697, -0.267403 51.485882, -0.267309 51.486055, -0.267396 51.486074, -0.267438 51.486015, -0.267626 51.485725, -0.267505 51.485697)))
```

For metric analysis the WGS84 geometry was transformed to British National Grid (`EPSG:27700`) and evaluated planarly.

Derived metrics:

```text
polygon area                           = 327.8688 m²
minimum rotated containing rectangle   = 8.96194 m × 42.07089 m
Reference House footprint              = 12.0 m × 10.8 m
minimum RH projection width            = 10.8 m
site containing-strip width            = 8.96194 m
shortfall                              = 1.83806 m
```

The minimum-rotated-envelope result is not being used as an approximate plot width guessed from a map. It is a deterministic metric derived from the exact controlled polygon.

## No-placement proof

The tested title polygon lies wholly within a strip `8.96194 m` wide.

For a rigid `12.0 m × 10.8 m` rectangle, the minimum possible orthogonal projection width over all rotations is its shorter side, `10.8 m`.

Therefore:

```text
8.96194 m < 10.8 m
```

and any rigid Reference House rectangle would necessarily exceed that containing strip in at least one direction.

Hence:

```text
UNCHANGED_REFERENCE_HOUSE_RECTANGLE_CANNOT_BE_CONTAINED
```

This conclusion survives:

- arbitrary rigid rotation;
- mirroring, because mirroring does not change the footprint dimensions;
- absolute map-position shifts, because the proof depends on local polygon width rather than absolute coordinate position.

No Reference House candidate has been authored.

## DPL meaning

This is **not**:

```text
CONTROL_SITE_NOT_READY_EVIDENCE_GAP
CONTROL_SITE_NOT_READY_SOURCE_CONFLICT
INCOMPATIBLE
```

The evidence is sufficient and internally coherent. The problem is the opposite: the acquired geometry is sufficiently good to prove that no unchanged rigid footprint placement exists inside the tested title polygon.

DPL-S1's original three-result universe did not include that evidence-rich no-placement case. #674 must therefore admit a bounded pre-candidate disposition rather than laundering the result into an evidence gap.

Proposed result vocabulary:

```text
CONTROL_SITE_KNOWN_GEOMETRY_NO_UNCHANGED_RH_PLACEMENT
```

That is a candidate-authoring admission result only. It does not itself emit whole-site `INCOMPATIBLE`, planning refusal, legal failure or deployment-envelope evidence.

## R1–R6 effect

```text
R1 = SATISFIED_FOR_TESTED_TITLE_EXTENT
R2 = SATISFIED_GEOMETRY_ACQUIRED_KNOWN_NO_PLACEMENT
R3 = SATISFIED_EPSG4326_SOURCE_WITH_BNG_ANALYSIS
R4 = NOT_ASSESSED_GEOMETRY_SHORT_CIRCUIT
R5 = PARTIAL_FIRST_PARTY_STREET_FRONT_IDENTITY_GEOMETRY_SHORT_CIRCUIT
R6 = SATISFIED_FOR_TESTED_TITLE_EXTENT
```

R4/R5 should not be completed merely for ceremony unless #674 finds that their evidence is required to establish the no-placement proposition. Datum and access cannot rescue an impossible rigid footprint fit.

## Boundary

Do not respond to this result by:

- shrinking the Reference House;
- changing its 12.0 m × 10.8 m footprint;
- aggregating neighbouring No. 25 land;
- selecting another title polygon by visual plausibility;
- converting the applicant's smaller replacement house into an RH route;
- calling the whole site `INCOMPATIBLE` without the separately controlled result authority.

The correct architectural/system response is compatibility before adaptation: retain 25A as a valuable conventional **negative geometry control**, then select a wider conventional street-front replacement control if DPL still needs a positive end-to-end authored-candidate exercise.

## Attribution

This information is subject to Crown copyright and database rights 2026 and is reproduced with the permission of HM Land Registry.

The polygons (including the associated geometry, namely x, y co-ordinates) are subject to Crown copyright and database rights 2026 Ordnance Survey 100026316.

Conditions: `https://use-land-property-data.service.gov.uk/datasets/inspire/#conditions`
