<!-- nav-exclude: redirect -->
# DRW-05E — Principal-section spread composition and physical proof

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-05E  
**Issue:** #154  
**Status:** BLOCKED / SPLIT by rendered physical proof  
**Latest proof head:** `29c520b7c82f24880d168c3e117370dec7837b8f`

## Outcome so far

DRW-05E composes the principal longitudinal section as an intentional blank followed by a two-leaf spread:

- left/verso leaf: title, numeric scale, bounded caption and folio;
- right/recto leaf: the controlled principal-section SVG and folio.

The controlled section remains literal `166 × 92 mm` at true `1:100`. The spread does not use `transform: scale`, CSS `zoom`, fit-to-page scaling or any equivalent geometry mutation.

The spread geometry itself remains viable:

- the right-leaf drawing frame begins `5 mm` from the fold;
- the controlled SVG reserves `14 mm` before first drawing content, putting first unique annotation `19 mm` from the fold;
- that exceeds the frozen `12 mm` semantic fold exclusion;
- both A4 and conservative B5 PDFs build successfully.

## Corrective split history

The first DRW-05E proof exposed two lower-level defects:

1. DRW-03C emitted unitless SVG CSS `font-size` values;
2. the ground-south section label collided with the perpendicular-beyond stair flight.

Those were addressed by DRW-03C.1 and DRW-05C.1 respectively. The second correction is valid; the stair/label collision is no longer the blocker.

## New rendered-proof finding

The resumed physical proof falsifies DRW-03C.1's typography semantics.

The shared serializer now emits valid CSS such as:

- `font-size:2.646mm` for the intended 7.5 pt label role;
- `font-size:2.293mm` for the intended 6.5 pt note/marker roles.

However, when the controlled SVG is embedded inline in the browser/PDF publication stack, the physical CSS length is converted to CSS pixels and then scaled again by the SVG viewBox transformation.

The rendered PDF therefore contains:

- intended 7.5 pt drawing labels at **28.343 pt**;
- intended 6.5 pt drawing notes/markers at **24.562 pt**.

Both are approximately `×3.779`, matching CSS pixels per millimetre (`96 / 25.4`). Render inspection shows severe text overlap on both A4 and B5 right leaves. The plate furniture on the left leaf remains correct.

Dedicated proof run `39254044781` records:

- A4 build: PASS;
- B5 build: PASS;
- physical validator: FAIL;
- proof artifact: `12187230980`;
- artifact digest: `sha256:69cca74a8d5c9e06564827faace0d9eb804e56ca408e4225185624beaae18372`.

Generic PR validation `39254044961` passes completely, which confirms the defect lies outside the current repository-health/source/publication-nomenclature gates and must be caught by physical proof.

## Consequence

DRW-05E must not merge while this shared renderer defect exists.

The next corrective packet is **DRW-03C.2 — restore physical SVG typography under browser/viewBox rendering**. It must determine and regression-lock a serializer representation that is both CSS-valid and physically correct when the SVG is embedded through the publication browser/PDF stack. The likely mechanism to test is SVG user-space sizing expressed through valid CSS/user-unit semantics rather than absolute CSS `mm`, but the corrective packet must prove the browser/PDF result rather than assume the representation.

After DRW-03C.2 closes green, DRW-05E resumes unchanged and reruns the A4/B5 physical proof.

## Explicit non-work

This split does not change:

- Reference House geometry or source authority;
- principal-section cut/projection/scene geometry;
- stair, wall, opening, floor-zone or roof representation;
- DRW-05C.1's fitted two-line entrance-hall/stair label;
- spread placement, fold offset or page furniture;
- public section identity;
- final PR-02 trim.
