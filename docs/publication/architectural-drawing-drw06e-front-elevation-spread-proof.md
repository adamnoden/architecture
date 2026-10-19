<!-- nav-exclude: redirect -->
# DRW-06E — Principal-front-elevation spread composition and physical proof

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-06E  
**Issue:** #154  
**Status:** PROOF RUNNING

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

## Required proof

DRW-06E must establish:

1. the controlled `166 × 92 mm` SVG remains true `1:100` through browser/PDF embedding;
2. A4 and B5 preserve identical drawing placement and physical type;
3. drawing annotations remain outside the 12 mm fold exclusion and inside the conservative B5 5 mm outer safe edge;
4. the 6.5 pt elevation note/datum role survives PDF embedding at physical size;
5. provisional dashed geometry remains present;
6. range cues remain present rather than collapsing to a selected dimension;
7. the unresolved entrance statement survives into the controlled plate;
8. no page CSS scales the drawing to make it fit.

## Stop rule

If any drawing-owned annotation or geometry fails physical placement, typography or legibility, DRW-06E must stop and split the defect back to the appropriate renderer/source packet. The plate CSS must not conceal a drawing-system defect.

## Explicit non-work

DRW-06E does not change Reference House architecture, source authority, facade selection, opening dimensions, roof geometry or trim policy. Conservative B5 remains a robustness proof, not a final PR-02 trim decision.

## Handoff

If the proof survives unchanged, DRW-06 closes green and the next packet is DRW-07A — freeze the roof-plan view and audit its source authority. If the proof exposes a renderer defect, the corrective packet must merge first and DRW-06E must then be resumed on the corrected drawing.
