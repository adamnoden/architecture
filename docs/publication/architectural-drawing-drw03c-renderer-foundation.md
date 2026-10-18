<!-- nav-exclude: redirect -->
# DRW-03C — Publication drawing foundation

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-03C  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `00a6f4c986b2fbbd2c71efca87bc99f8527dcc0f`

## 1. Outcome

DRW-03C establishes the minimum renderer substrate needed by the first native architectural publication plan without building a generic CAD framework and without changing Reference House architecture.

New shared code:

- `compiler/publication-drawing/model.ts`
- `compiler/publication-drawing/tokens.ts`
- `compiler/publication-drawing/projection.ts`
- `compiler/publication-drawing/svg.ts`

The foundation owns four things only:

1. a small semantic scene primitive model;
2. frozen physical-paper graphic tokens;
3. model-space → paper-space plan projection;
4. deterministic SVG serialization.

It does **not** yet decide the ground plan’s walls/opening composition, stair symbol, labels, dimensions or final plate.

## 2. Paper-space is authoritative

The central implementation rule is:

> **SVG user units equal physical millimetres.**

A scene with `widthMm: 128` serializes as:

- SVG intrinsic width `128mm`;
- `viewBox` width `128`;
- therefore one SVG user unit = one physical millimetre at intended placement.

The DRW-01B line hierarchy can consequently be represented literally:

- cut `0.50`;
- profile `0.35`;
- primary `0.25`;
- secondary `0.18`.

The renderer never multiplies line weights by drawing scale.

Typography is likewise encoded from the frozen point sizes into physical millimetres:

- label `7.5 pt` → `≈2.646 mm`;
- note `6.5 pt` → `≈2.293 mm`;
- marker `6.5 pt` bold → `≈2.293 mm`.

This is the key separation missing from the RH-C1 inspection renderer, whose model-space strokes were appropriate for inspection but not publication authority.

## 3. Scene model

The first scene model admits only the primitives the ground plan currently needs:

- line;
- rectangle;
- text.

Each primitive has:

- stable entity ID;
- semantic line/text/fill role;
- optional dash role;
- optional deterministic metadata.

The model intentionally does not yet add:

- arbitrary paths;
- Bézier curves;
- symbols/blocks;
- 3D geometry;
- clipping trees;
- transforms beyond text rotation;
- CAD-style layer systems.

Future packets may add a primitive only when a frozen drawing requires it.

## 4. Frozen executable tokens

`PUBLICATION_DRAWING_TOKENS` encodes the DRW-01B/01C decisions rather than letting individual renderers choose local CSS.

### Lines

- `cut = 0.50 mm`
- `profile = 0.35 mm`
- `primary = 0.25 mm`
- `secondary = 0.18 mm`

All ordinary lines use butt caps and miter joins through the serializer.

### Dashes

- overhead/beyond: `3 / 1.5 mm`;
- datum/grid: `6 / 1.5 / 1 / 1.5 mm`;
- provisional: `1 / 1 mm`.

### Ink

- primary black `#000000`;
- context ≈60% black `#666666`;
- faint ≈35% black `#a6a6a6`;
- paper white `#ffffff`.

Required meaning remains black-only compatible.

### Type

- publication sans family: `Arial, Helvetica, sans-serif`;
- label `7.5 pt` regular;
- note `6.5 pt` regular;
- marker `6.5 pt` bold.

## 5. Plan projection

`createPlanPaperProjection()` takes:

- drawing scale denominator;
- model bounds;
- paper-space origin.

It projects model millimetres directly to paper millimetres.

At the frozen ground-plan scale `1:100`:

- 12,000 mm shell width → `120 mm` paper;
- 10,800 mm shell depth → `108 mm` paper;
- 3,600 × 4,000 mm court → `36 × 40 mm` paper.

Model +Y is drawn upward while SVG +Y is downward, so projection performs the inversion explicitly rather than asking individual drawing code to remember it.

Invalid scales or non-positive bounds fail rather than being silently normalised.

## 6. Deterministic SVG contract

`renderDrawingSceneSvg()`:

- emits physical `mm` dimensions;
- emits a same-number `viewBox`;
- centralises all token CSS;
- serializes primitives in intentional scene order;
- sorts metadata attributes lexically;
- rounds numeric serialization deterministically to 0.001 drawing units;
- XML-escapes reader text and metadata;
- retains stable `data-entity`, view, source and scale lineage.

Two semantically identical scenes serialize byte-for-byte identically.

Layer ordering remains the responsibility of the scene builder: the serializer does not reorder primitives because drawing order is architectural/graphic meaning, not an implementation accident.

## 7. Deliberate non-scope

DRW-03C does not:

- alter `compiler/reference-house/fixture.ts` or the DRW-03B source;
- render a Reference House publication plan;
- construct cut-wall geometry;
- cut openings through wall bodies;
- draw door leaves or swings;
- draw the stair;
- place labels/dimensions/scale bar;
- add north or section markers;
- create public figure numbering;
- modify the publication registry;
- replace the RH-C1 inspection renderer.

The old renderer remains valuable as an inspection surface. The new publication renderer is a separate representation surface over the same architectural truth.

## 8. Proof

`compiler/reference-house/publication-drawing-foundation.test.ts` proves:

- exact line-token values;
- exact 7.5/6.5 pt conversion to paper millimetres;
- DRW-01C dash patterns;
- exact `120 × 108 mm` shell projection at `1:100`;
- exact `36 × 40 mm` court projection;
- north-up model / down-positive SVG conversion;
- byte-deterministic SVG serialization;
- physical-mm SVG dimensions and line weights;
- deterministic metadata ordering;
- fail-closed invalid scale/paper dimensions.

## 9. Handoff to DRW-03D

DRW-03D may now create the ground-floor plan scene using:

- RH-C1 canonical compiled geometry;
- DRW-03B publication-plan source;
- this shared paper-space projection/token/SVG foundation.

03D is allowed to add only the plan symbols and annotations already required by the frozen view: cut-wall bodies, openings/passages, bounded stair notation, human room labels, selected dimensions, graphic scale bar and explicit provisional notation where necessary.

If that work needs a new architectural fact, it must return to DRW-03B rather than hide the decision in rendering code.
