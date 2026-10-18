<!-- nav-exclude: redirect -->
# DRW-04B.1 — South-landing label-fit correction

**Programme:** DRW — Architectural Drawing Programme  
**Corrective packet:** DRW-04B.1  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Trigger:** DRW-04D paired-plan proof

## Defect

The first DRW-04D A4/B5 pair proof built successfully but failed its drawing-level collision gate:

`South landing intersects cut-wall poche U-COURT-EAST-SOUTH-CONT-B`.

This exposed a real renderer-label defect that DRW-04B scene tests had not yet measured at physical type width.

The south-landing clear arrival strip between the shared stair reservation and the courtyard-east continuation is approximately 1,300 mm wide. At the frozen 7.5 pt plan-label size, the single-line phrase `South landing` is wider than that strip. Moving it west would place the label over the stair trace, so the defect cannot be solved by a minor horizontal nudge.

## Correction

The semantic label remains **South landing**.

Its publication presentation is changed only to two centred lines inside the same clear arrival strip:

```text
South
landing
```

The renderer now supports an optional bounded multi-line presentation for a room label while retaining the full semantic label string in the label specification.

For `U-STAIR-01`:

- centre X: 7,150 mm;
- semantic centre Y: 1,400 mm;
- line gap: 300 mm model-space / 3 mm paper-space at 1:100;
- `South` paper position: X 79.5 mm, Y 104.5 mm;
- `landing` paper position: X 79.5 mm, Y 107.5 mm.

Each line remains ordinary 7.5 pt plan-label typography. No abbreviation, smaller type, rotated text or page-level scaling is introduced.

## Scope held

The correction does not change:

- any Reference House room, wall, opening or stair geometry;
- the 1,300 mm circulation strip;
- stair trace or reservation;
- any other first-floor label;
- paper scale, line hierarchy or typography;
- the DRW-04A source layer.

The controlled first-floor SVG is regenerated because it is a deterministic consequence of the renderer. Its artifact regression is updated to expect the two reader-visible text lines while retaining exact-byte generation authority.

## Regression

Renderer tests now explicitly lock the two line IDs, values and paper coordinates. The controlled-artifact test requires both words in the regenerated SVG and continues to reject technical/process leakage.

DRW-04D is not weakened. Its original collision proof must pass unchanged after this corrective packet merges.