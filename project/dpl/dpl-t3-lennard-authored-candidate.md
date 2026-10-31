# DPL-T3 — 41 Lennard Road authored Reference House candidate

**Issue:** #729  
**Parent gate:** #700 — DPL-T  
**Control:** `DPL-T-CONTROL-004`  
**Candidate:** `DPL-T-CANDIDATE-004-01` / revision `0.1`  
**Address:** 41 Lennard Road, Bromley, BR2 8LN  
**Application:** Bromley `26/02618/FPA`  
**Date:** 2026-10-25  
**Result:** `REFERENCE_HOUSE_CANDIDATE_AUTHORED_PENDING_POST_T3_VERIFICATION`

## Decision

Author exactly one unchanged, unmirrored Reference House placement on the admitted Lennard Road control.

The placement is human-authored. The compiler may verify it later but may not search, optimise, repair or substitute another placement.

```text
Reference House shell      = 12.000 m front × 10.800 m depth
handedness                 = UNMIRRORED
variant                    = RH-V02 rigid placement/orientation
front bearing              = -51.6343476471° from BNG easting
street-frontage bearing    = -44.6343476471° from BNG easting
front skew                 = -7.000°
front-centre construction  = frontage midpoint +4.5 m along frontage +26.0 m inward
screening FFL              = 70.70 m ODN
```

Durable authored artifact:

`project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json`

## Why this placement

DPL-T1 established only that a rigid `12.0 × 10.8 m` rectangle could fit. Its constructive witness deliberately optimised nothing architectural and did not identify which rectangle edge was the Reference House front.

T3 therefore does **not** promote that witness into architecture.

The canonical Reference House front is the 12 m model-south edge. At Lennard Road that front is kept recognisably street-facing. Exact parallelism to the approximately `10.166 m` indicative title-front segment is rejected as false precision: the title-index frontage is narrower than the house front and is not a determined legal boundary. A small `-7°` authored skew allows the 12 m façade to address the street while sitting honestly inside the parcel as it broadens inland.

The authored transform is intentionally legible rather than numerically optimised:

```text
along-frontage offset = +4.5 m
inward setback        = 26.0 m
front skew            = -7.0°
```

Those are architectural inputs. The resulting coordinates and clearance are derived verification facts.

## Rigid transform

Reference House source coordinate convention remains:

```text
origin  = south-west outer corner
+X      = east / along the canonical front
+Y      = north / toward garden and rear
front   = model south edge
```

T3 maps that rigidly into EPSG:27700:

```text
model origin = 542912.3983486614 E, 166225.9379196552 N
model +X     = ( 0.6206778604, -0.7840656833 )
model +Y     = ( 0.7840656833,  0.6206778604 )
```

The four footprint corners are:

```text
542912.3983486614, 166225.9379196552
542919.8464829875, 166216.5291314728
542928.3143923517, 166223.2324523662
542920.8662580255, 166232.6412405486
```

Against the admitted HMLR / Planning Data screening polygon this footprint is contained. The derived minimum polygon-boundary clearance is approximately `0.640 m`.

That `0.640 m` is **not** promoted into a legal setback, planning separation, fire separation, maintenance corridor or construction tolerance. It is only the deterministic fit result against the admitted indicative title-index geometry.

## Reference House preservation

T3 pins the current controlled source rather than recreating a convenient house:

```text
fixture                    = RH-C1-REFERENCE-HOUSE
source                     = compiler/reference-house/fixture.ts
source git blob            = 68162a4b6336fac48fd18ecb96eaf915b38ac633
current compile fingerprint= 16ffc5c68a0247202997603f5fff48737c4c93d89b5947b40336fde0f63b366c
```

The authored candidate carries the bounded DPL-12B facts directly from that source:

```text
courtyard open to sky      = true
shell                       = 12000 × 10800 mm
courtyard                   = 3600 × 4000 mm, centred
principal storeys           = 2
stair                       = 18 risers / 6+6+6 / 300 mm going
front field                 = 4 bays @ 2700 mm
unmirrored entrance         = bay 3
```

Therefore the post-T3 replay is expected to return `CONFORMS` for `RH-I02`, `RH-PROT-01`, `RH-PROT-04`, `RH-PROT-06` and the explicit `RH-V02` route, subject to exact runtime/source-identity reproof.

T3 does not self-certify that replay. `RH-SI02` and `RH-SI05` remain open site-interface responses as DPL-02 requires.

## Absolute datum

The current T2 authority is the Environment Agency 1 m LiDAR Composite DTM, not the earlier coarse datum language retained in the original #729 issue body.

The admitted parcel evidence is:

```text
parcel minimum        = 70.20 m ODN
parcel maximum        = 71.10 m ODN
parcel mean           = 70.5288 m ODN
parcel-centroid sample= 70.4000 m ODN
```

T3 authors:

```text
ground FFL = 70.70 m ODN
```

This is the parcel-centroid screening sample plus a deliberately explicit `+0.30 m` authored offset. It provides a deterministic absolute candidate datum without pretending that a 1 m composite DTM is a measured building-platform survey.

No claim is made yet about cut/fill, retaining, threshold gradients, drainage falls, accessible approach, foundation level or final plinth height. Those belong to `RH-SI02` after measured topography and technical design.

## Conventional-street transition strategy

The conventional control must not silently smuggle in a generic detached-house solution.

T3 therefore treats the zone between Lennard Road and the Reference House front as a **site-owned approach / landscape / access field**:

- the canonical front and ranked entrance remain legible from the street;
- the exact-site planning evidence for the existing front / dropped-kerb access relationship is retained as screening context;
- parking, planting, refuse, route geometry, thresholds and temporary maintenance positions remain `RH-SI05` work rather than Reference House identity;
- the absolute FFL is reconciled to real external levels through `RH-SI02`, without split-level deformation of the house;
- the narrow title-index clearance is not treated as a sufficient maintenance, privacy or legal-boundary solution.

This is the correct distinction: the house is rigid; the site transition is designed around it.

## Evidence pins

```text
title-boundary record
  project/dpl/sites/dpl-t-control-004-lennard-road-title-boundary.json
  HMLR reference 57071807
  Planning Data entity 12057071807
  source JSON SHA-256 faa4f7bf323166e92345db7e57208b70c197379388e3c9b3e6f1f457d6985450

elevation record
  project/dpl/sites/dpl-t-control-004-lennard-road-elevation.json
  EA raster SHA-256 ee7e04c7eee8f4391bc64cd57485439722e15687ffaad49b4a02804957fd1db9

street/access record
  project/dpl/sites/dpl-t-control-004-lennard-road-street-access.json
  source ids T2-R5-01 / T2-R5-02
```

The current #729 issue text predates the final T2 evidence acquisition and mentions coarse Open-Meteo / OSM inputs. Those do not govern T3. The landed T2 HMLR + EA DTM + exact-site planning evidence is the current authority and is what this candidate pins.

## Falsifiers

The candidate must fail closed at the post-T3 gate if any of the following occurs:

1. the pinned Reference House source/compile identity no longer matches current controlled authority;
2. the rigid transform does not reproduce the `12.0 × 10.8 m` unchanged shell;
3. the footprint is not contained by the admitted screening title polygon;
4. the authored 12 m model-south edge is not the street-facing front under `RH-V02`;
5. the bounded DPL-12B protected facts differ from the current Reference House;
6. T2 evidence identity has changed without explicit reconciliation;
7. a verifier silently treats `RH-SI02` / `RH-SI05` as discharged merely because the placement exists.

A failure is a failed candidate or stale evidence, **not** automatic site incompatibility.

## Proof boundary

```text
Reference House candidate         = AUTHORED
Reference House mutation          = NONE
route search / optimisation       = NOT IMPLEMENTED / PROHIBITED
legal title boundary              = UNRESOLVED
private access rights             = UNRESOLVED
highway adoption extent           = UNRESOLVED
measured topographic survey       = NOT ACQUIRED
planning acceptability            = NOT PROVED
whole-site COMPATIBLE             = NOT ADMITTED
whole-site INCOMPATIBLE           = NOT ADMITTED
DPL-RP-001…008 corpus             = UNCHANGED / 0 of 8 ready
DPL-T-CONTROL-004 in DPL-16       = EXCLUDED
DPL-16                             = HELD
```

Embodied/economic deltas remain epilogue metrics only and are not part of candidate selection or conformance.

## Exact next gate

After T3 lands, authorise a fresh post-T3 packet only:

> **Deterministically replay the authored Lennard Road candidate against the pinned site evidence and current DPL-12B Reference House conformance authority; prove source identity, rigid-transform reproduction, screening containment and bounded conformance without route search or compatibility inflation.**

That gate may reject this candidate. It may not silently author another one.
