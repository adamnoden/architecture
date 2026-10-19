<!-- nav-exclude: redirect -->
# DRW-09E — Sectional axonometric spread proof and freeze

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-09E  
**Issue:** #154  
**Status:** PHYSICAL PROOF IMPLEMENTED — PENDING EXACT-HEAD VALIDATION

## Purpose

Close the DRW-09 sectional-axonometric family by proving the controlled DRW-09D artifact as an actual publication spread rather than merely a valid standalone SVG.

No architectural geometry is changed by this packet.

## Frozen composition

The controlled axonometric remains exactly **166 × 112 mm** and explicitly **NTS**.

The publication proof uses the established architectural-plate grammar:

1. intentional blank leaf;
2. verso furniture — title, `NTS`, restrained caption;
3. recto controlled drawing.

The controlled SVG is placed literally on the recto:

- fold-side offset: **5 mm**;
- top offset: **28 mm**;
- width: **166 mm**;
- height: **112 mm**;
- no CSS transform scaling;
- no `zoom`;
- no fit-to-box operation.

The fixed paper placement is editorial composition only. It does not create an architectural scale claim.

## Conservative B5 proof

The B5 robustness specimen uses a **176 × 250 mm** page.

Literal placement gives:

- drawing frame outer edge at `5 + 166 = 171 mm`;
- therefore **5 mm** remains to the B5 outer edge;
- the frozen fold exclusion remains **12 mm** from the inner edge.

The controlled SVG's first architectural line begins at approximately `x = 14.829 mm` within the SVG. With the 5 mm recto offset this places the first unique architectural content at approximately **19.829 mm from the fold**, comfortably beyond the 12 mm exclusion.

The validator does not trust those headline figures alone. It parses every drawing-owned `<line>` endpoint and every drawing-owned text box and proves that the actual controlled content remains outside the fold exclusion and inside the conservative B5 safe area.

## Typography proof

The spread preserves the physical SVG typography correction established earlier in DRW:

- drawing label token: **7.5 pt physical**;
- drawing note / marker token: **6.5 pt physical**;
- SVG serializer uses user-space `px`, not CSS `mm`, so Chromium does not multiply text by the 96 px/in CSS-unit conversion.

The A4 and B5 PDFs are calibrated against the 11 pt spread title and then checked for:

- 8.3 pt `NTS` furniture;
- 7.5 pt internal drawing label;
- 6.5 pt internal drawing note;
- A4/B5 physical-width parity for both publication furniture and controlled drawing text.

## Authority checks retained in the physical proof

A physically successful page is not enough. The validator also requires the controlled SVG to retain the principal DRW-09 authority cues:

- `data-scale="NTS"` and no numerical scale denominator;
- court identified as a controlled open void;
- `SV-01` identified as provisional capacity;
- exact 3D roof-fall surfaces remain absent;
- composite aperture geometry remains forbidden;
- paper fit remains editorial / NTS.

The proof therefore cannot pass by replacing the controlled artifact with a cosmetically easier drawing.

## Stop rule

If either trim proof fails, correct the composition or renderer while preserving the controlled architectural authority.

Do **not**:

- shrink the SVG to make it fit;
- change its architectural projection;
- reduce text below the drawing token sizes;
- move unique content through the fold exclusion;
- remove uncertainty cues merely to reduce visual density.

## Gate result

If the dedicated A4/B5 proof, shared typography proof and full repository validation all pass on the exact head, **DRW-09 is complete**.

The sectional axonometric then remains admitted and frozen in the conditional spread position between Section 17's orthographic/analytical evidence and Section 18's future-maintenance scenarios.

**Next authorised programme family after green merge:** DRW-10 — analytical readings on canonical geometry. The exact first packet must be taken from the execution plan after DRW-09 closes.
