<!-- nav-exclude: redirect -->
# DRW-03C.1 — Physical SVG typography correction

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-03C.1  
**Status:** ACTIVE pending validation  
**Issue:** #154  
**Starting baseline:** `ffc870364bf28b7ab7d1f6337c9773b8580d7c19`

## 1. Trigger

DRW-05E was the first packet to render the controlled principal section through the browser/PDF publication stack at physical proof size. That proof exposed a shared defect below the section renderer.

`PUBLICATION_DRAWING_TOKENS.textMm` already stored the frozen DRW-01B text roles correctly in physical millimetres:

- label: 7.5 pt = approximately 2.646 mm;
- note: 6.5 pt = approximately 2.293 mm;
- marker: 6.5 pt = approximately 2.293 mm.

However `renderDrawingSceneSvg()` serialized those values as unitless CSS declarations such as `font-size:2.646`.

A CSS `font-size` declaration requires a valid CSS size. Unlike line geometry expressed in the SVG viewBox coordinate system, the unitless text-size declaration does not mean “millimetres”. Browser/PDF rendering therefore did not preserve the frozen physical paper type size.

## 2. Correction

DRW-03C.1 changes only the serializer’s text CSS:

- before: `font-size:2.646`
- after: `font-size:2.646mm`

The corresponding 6.5 pt roles become `font-size:2.293mm`.

No token numeric value changes. No scene coordinate changes. No drawing scale changes.

## 3. Why line weights are not changed

The publication drawing scene deliberately uses a same-number SVG `viewBox` and physical `width` / `height` in millimetres. Geometry and strokes are therefore authored in the scene’s user-space millimetres and continue to use the established line-width contract.

Typography is different because `font-size` is a CSS property. Its physical intent must be explicit in the CSS declaration itself.

This packet therefore does **not** append `mm` to every SVG geometric quantity or line token. It corrects only the semantic boundary that DRW-05E proved was wrong.

## 4. Regression hardening

The DRW-03C foundation regression now requires:

- `.text-label` to serialize as `font-size:2.646mm`;
- `.text-note` to serialize as `font-size:2.293mm`;
- `.text-marker` to serialize as `font-size:2.293mm`;
- the old unitless forms to be absent.

This closes the gap in the original foundation test, which proved the numeric token and deterministic SVG bytes but did not prove that the emitted CSS preserved the intended physical unit in a browser/PDF renderer.

## 5. Controlled-artifact consequence

Because the serializer is shared, the correction deterministically changes the stylesheet line in every controlled architectural publication SVG already produced through it:

- `docs/reference-house/publication-ground-floor-plan.svg`;
- `docs/reference-house/publication-first-floor-plan.svg`;
- `docs/reference-house/publication-principal-section.svg`.

Those three artifacts must be regenerated from their existing canonical generators. Their architecture, scene primitives, coordinates, dimensions, IDs and metadata remain unchanged. The only intended byte drift is the explicit `mm` suffix on the three text-role declarations.

## 6. Explicit non-work

DRW-03C.1 does not:

- change Reference House source or compiled geometry;
- change any plan or section scene coordinate;
- move or rewrite a reader-facing drawing label;
- change line weights, dash grammar, fills or scale bars;
- alter drawing scale or physical SVG dimensions;
- create a reader-facing section identifier;
- fix the `Entrance hall / stair` / `stair-flight-2-perpendicular-beyond` collision exposed by DRW-05E.

That last defect remains owned by **DRW-05C.1** after this shared correction is green.

## 7. Acceptance

DRW-03C.1 is complete only when:

1. the serializer emits explicit physical `mm` type sizes;
2. the foundation regression rejects the former unitless CSS;
3. all three controlled SVGs regenerate deterministically with no non-typographic drift;
4. their existing exact-byte artifact regressions pass;
5. full PR validation passes on current `main`;
6. post-merge publication/site deployment passes.

The next authorised packet is **DRW-05C.1 — bounded principal-section label-fit correction**. DRW-05E remains draft/blocked until that local correction also closes green.
