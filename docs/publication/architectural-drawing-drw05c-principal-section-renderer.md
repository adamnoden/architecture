<!-- nav-exclude: redirect -->
# DRW-05C — Principal longitudinal-section renderer capability

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-05C  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `be0b328661e5fde92681c79082a8efec6775cd8a`

## 1. Outcome

DRW-05C adds only the renderer capability needed to convert the frozen DRW-05A view and DRW-05B companion source into a deterministic publication `DrawingScene`.

New renderer:

- `compiler/reference-house/publication-principal-section.ts`

New projection capability:

- `createSectionPaperProjection(...)` in `compiler/publication-drawing/projection.ts`

Regression proof:

- `compiler/reference-house/publication-principal-section.test.ts`

No controlled SVG is committed in this packet. That remains DRW-05D.

No canonical Reference House geometry or DRW-05B source fact is changed.

## 2. Projection contract

The section is projected directly in Y/Z paper space:

- model Y increases left-to-right on paper;
- model elevation increases upward while SVG Y increases downward;
- scale is literal `1:100`;
- `10800 mm` overall depth therefore occupies exactly `108 mm` on paper;
- `6500 mm` of vertical model envelope occupies exactly `65 mm`.

The projection is not fit-to-box and has no perspective component.

The generic capability added here is intentionally narrow: one orthographic section projection helper parallel to the existing plan projection. No CAD-style camera/view framework is introduced.

## 3. Cut-body representation

The scene reuses the DRW-05B representation source rather than inventing sectional construction.

### 3.1 Wall bodies

Four continuous cut-wall bodies are rendered:

1. south outer wall;
2. south courtyard wall;
3. north courtyard wall;
4. north outer wall.

Their plan thickness is the already-shared publication external/courtyard body proxy. Outer faces and courtyard void faces remain geometrically registered with the plans.

The wall bodies rise only to the controlled/provisional roof-edge geometry already available in the compiled house.

### 3.2 Inter-storey zone

The `350 mm` interval between ground clear ceiling and first FFL is rendered as two cut planning zones, one in each occupied wing.

It remains explicitly a **planning zone**, not a slab, joist or ceiling-construction depth.

There is no floor body across the open courtyard.

## 4. Opening cuts

All six DRW-05B vertical opening occurrences are cut back to paper white through their corresponding section wall body:

- ground south court;
- ground north court;
- upper south court;
- upper north court;
- ground centre garden/logistics opening;
- upper centre garden/dressing-field opening.

The renderer consumes their source sill/head values directly. It does not create a frame/reveal/threshold family and does not infer opening construction.

## 5. Roof treatment

The roof is represented by two profile lines only:

- south outer edge → south court edge;
- north court edge → north outer edge.

The current compiled relationship is a rise of `85 mm` from outer edge to court-side edge across each front/rear ring, consistent with the controlled outward `1:40` planning fall.

No roof body, deck thickness, insulation, coping, gutter or parapet construction is drawn.

## 6. Stair projection

The three-flight source is rendered with a real cut/beyond hierarchy:

- flight 1 — north-running, beyond, secondary/provisional line;
- flight 2 — east-running, perpendicular beyond, secondary/provisional line;
- flight 3 — south-running at the section plane, cut line.

A critical projection rule is made explicit:

> the east–west middle flight collapses vertically at the shared Y turn in a west-looking Y/Z projection.

Its own X coordinates are therefore **not** misused as section-horizontal coordinates.

The renderer requires flight 1 end Y and flight 3 start Y to match before projecting that perpendicular flight.

The resulting section path preserves DRW-05B canonical arithmetic:

- longitudinal run `1400 mm`;
- landing elevations `+1100 / +2200 mm`;
- first FFL `+3300 mm`.

No treads, strings, soffits, guards, balustrades, handrails or headroom construction are added.

## 7. Ground termination

The architectural cut ends at ground FFL as a single profile datum.

There is no model or drawing geometry below it. The source prohibition against invented foundations/site profile remains intact.

## 8. Labels and level markers

The scene uses human architectural labels only:

- Entrance hall / stair;
- Garden dining;
- South landing / stair;
- North landing;
- Dressing / storage;
- Open courtyard;
- South / North orientation words for the section itself.

Narrow upper north fields use wrapped two-line labels rather than moving architecture to fit text.

Five restrained level markers are shown outside the building:

- Ground FFL `±0`;
- Ground ceiling `+2950`;
- First FFL `+3300`;
- Upper ceiling `+6000`;
- Roof edge `+6250`.

A physical `3 m` scale bar is retained.

## 9. Scene envelope

The renderer creates a `166 × 92 mm` scene at true `1:100`.

The width allows the `108 mm` architectural section plus the level-marker field and scale furniture to exist without page-level rescaling. DRW-05E remains responsible for final spread composition, gutter safety and physical proof.

## 10. Explicit non-work

DRW-05C does not:

- change the section cut or viewing direction;
- change canonical house morphology;
- add source coordinates to make the drawing attractive;
- create foundations, ground-bearing construction or site topography;
- choose structural member depths;
- create wall or roof build-ups;
- draw frame/reveal/threshold construction;
- draw stair strings, treads, soffits, guards or handrails;
- add services;
- add section markers to the plans;
- generate or commit the controlled publication SVG;
- compose the publication spread.

## 11. Validation target

`publication-principal-section.test.ts` proves that:

- Y/Z projection is literal `1:100` paper geometry;
- the section scene remains `166 × 92 mm` with no fit-to-box scaling;
- exactly four cut walls and two inter-storey planning zones are rendered;
- exactly six authorised vertical opening cuts are rendered;
- roof geometry remains profile-only;
- the compiled `85 mm` roof rise is preserved;
- beyond stair flights remain lighter/provisional and the cut flight is distinct;
- the perpendicular middle flight projects at the shared Y turn rather than from its X coordinate;
- ground termination is exactly at FFL;
- no construction-component geometry is introduced;
- room/zone labels are reader-facing names, not machine IDs;
- SVG serialization is deterministic and carries no DRW packet-history text.

## 12. Handoff to DRW-05D

DRW-05D may now generate the controlled principal-section SVG from this scene using the existing publication SVG serializer and canonical-generation guard.

It should add only:

1. deterministic generator;
2. committed controlled SVG;
3. exact-byte artifact regression;
4. plan/section cross-registration checks, including X = `6000 mm` section-marker registration where the controlled plans are updated to carry the now-earned section relationship.

If controlled generation exposes a rendering defect, repair this renderer and regenerate. Do not edit the SVG manually.
