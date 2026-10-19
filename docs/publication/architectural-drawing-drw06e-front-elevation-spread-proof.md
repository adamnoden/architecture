<!-- nav-exclude: redirect -->
# DRW-06E — Principal-front-elevation spread composition and physical proof

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-06E  
**Issue:** #154  
**Status:** DONE — PENDING FINAL HEAD VALIDATION

## Purpose

DRW-06E places the controlled principal front elevation into the established architectural-drawing spread grammar and subjects it to actual browser/PDF physical proof.

The proof deliberately reuses the DRW-05E contract rather than granting the elevation a special layout:

- intentional blank page before the spread;
- verso: title, numeric scale, bounded caption and folio;
- recto: controlled vector drawing and folio;
- drawing begins 5 mm from the fold-side page edge;
- 12 mm semantic fold exclusion;
- A4 build plus conservative B5 robustness build;
- no fit scaling, CSS zoom or transform scaling.

## Proof history

The first physical proof on head `f0b44fdec06e45de369c8e5a571ddc4beb866f4e` correctly stopped after both PDFs built because the drawing-owned label `Ground ceiling +2.950` breached the conservative B5 outer 5 mm safe edge. Run `39300546273`; artifact `12210527454`; artifact ZIP SHA-256 `195941accd5217b9f2543b8504292cc49d11422ec164db46ea6ea31a489f0696`.

That defect was returned to its owning renderer as DRW-06C.1 rather than hidden with page scaling or plate movement. DRW-06C.1 compacted only three datum labels and merged as `971e620d614164495547af8abc7b40f61a7df747`.

The unchanged plate grammar was then re-proved against the corrected controlled SVG.

## Successful physical proof

Resumed proof run `39301862476` passed completely.

Artifact:

- `drw-06e-principal-front-elevation-spread-proof`
- artifact ID `12211778698`
- artifact ZIP SHA-256 `e50baf38437848f1ab97944190de2e61bc026c51309bf82c04254b67306392a4`

The proof establishes:

1. the controlled `166 × 92 mm` SVG remains true `1:100` through browser/PDF embedding;
2. A4 and conservative B5 both build as blank → spread-left → spread-right, three pages total;
3. A4 and B5 preserve identical drawing placement and physical type;
4. drawing annotations remain outside the 12 mm fold exclusion and inside the conservative B5 5 mm outer safe edge;
5. the 6.5 pt elevation note/datum role survives browser/PDF embedding at physical size;
6. provisional dashed geometry survives the plate;
7. source-range cues remain present rather than collapsing to selected dimensions;
8. the unresolved entrance statement survives into the controlled plate;
9. no page CSS scales, zooms or transforms the drawing to make it fit.

## Frozen elevation plate grammar

DRW-06E therefore freezes the principal-elevation plate grammar as compatible with the already-proven drawing system:

- true `1:100` controlled SVG;
- no fit scaling;
- 5 mm fold-side drawing offset;
- 12 mm semantic fold exclusion;
- drawing-owned uncertainty remains inside the drawing rather than being rewritten by page composition;
- conservative B5 is a robustness test, not a final PR-02 trim selection.

The renderer correction did not change architecture, scale, datum ordinates, opening geometry, source authority or page placement.

## Explicit non-work

DRW-06E does not change Reference House architecture, source authority, facade selection, opening dimensions, roof geometry or trim policy. It does not convert provisional elevation geometry into accepted architectural selection.

## Handoff

DRW-06 closes green once this final documentation head passes normal PR and physical-spread validation.

**Next packet: DRW-07A — audit roof/drainage source authority against the frozen roof view.**
