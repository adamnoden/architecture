<!-- nav-exclude: redirect -->
# DRW-07D — Controlled roof / drainage plate and physical proof

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-07D  
**Issue:** #154  
**Status:** IMPLEMENTED — PENDING VALIDATION

## Purpose

DRW-07D converts the DRW-07B/07C roof-and-drainage source/renderer into a controlled deterministic SVG and proves its publication placement through the same A4/conservative-B5 browser→PDF route used by the earlier controlled drawing plates.

No architectural selection is added in this packet.

## Controlled artifact

The controlled artifact is `docs/reference-house/publication-roof-drainage.svg`.

Generation is gated by the canonical Reference House compiler status, then proceeds only through the shared physical-mm drawing serializer. Regression tests require the committed bytes to equal a fresh canonical render.

The artifact remains:

- `166 × 145 mm` at true `1:100`;
- exact for the shell/courtyard substrate;
- provisional for roof watersheds, field geometry and fall/catchment notation;
- qualitative for RWP occurrence zones, courtyard drainage topology and soil-vent zone;
- silent where gutter profiles, point coordinates, pipe centrelines, overflow levels and hydraulic sizing remain absent.

## Physical proof

The spread uses the established blank → verso furniture → recto drawing grammar.

The drawing is placed with:

- no fit scaling, CSS zoom or transform;
- `5 mm` fold-side offset;
- `12 mm` fold exclusion for unique drawing annotation;
- conservative B5 outer safe edge of `5 mm`;
- physical `6.5 pt` drawing-note/marker type proven through browser/PDF output;
- the same literal SVG geometry in A4 and B5.

The validator also accounts for rotated roof-field labels when checking drawing-owned annotation bounds.

## Stop rule

If the controlled scene breaches the physical envelope, the renderer must be corrected in a bounded packet. Page CSS is not permitted to hide a geometry or notation defect by shrinking the drawing.

## Handoff

**Next packet: DRW-08A — freeze the primary service-riser / plant-wall detail authority boundary.**

DRW-08A must audit the service-infrastructure sources before any detail geometry is rendered.
