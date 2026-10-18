<!-- nav-exclude: redirect -->
# DRW-04B.2 — Dressing/storage label-fit correction

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-04B.2  
**Status:** corrective packet — pending validation  
**Issue:** #154  

## Defect

The unchanged DRW-04D paired-plan collision proof, rerun after DRW-04B.1, found the single-line `Dressing / storage` room label intersecting cut-wall poche `U-COURT-WEST-NORTH-CONT-B`. This is a publication-renderer fit defect, not an architectural-source defect.

## Correction

Retain the semantic room name **Dressing / storage**, the frozen **7.5 pt** room-label type size and the existing label centre. Render the reader-facing label as two centred lines:

- `Dressing /`
- `storage`

with the same 300 mm model-space line gap already proven by DRW-04B.1 for a constrained room label.

## Scope held

This packet does **not** change room geometry, wall geometry, openings, stair geometry, scale, typography, page composition, collision tolerance or any other label. DRW-04D remains frozen and must pass unchanged after this correction.

## Regression contract

Renderer tests lock the two text primitives, values and paper coordinates. The controlled first-floor SVG is regenerated from canonical source and artifact tests continue to require exact deterministic equality.
