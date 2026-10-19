<!-- nav-exclude: redirect -->
# DRW-05E — Principal-section spread composition and physical proof

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-05E  
**Issue:** #154  
**Status:** PROVED GREEN  
**Physical-proof head:** `fe7e15d8eab4e82b0a4efc29df9a5f7f27bbbf0d`

## Outcome

DRW-05E proves the controlled principal longitudinal section as an intentional blank followed by a two-leaf spread:

- left/verso leaf: title, numeric scale, bounded caption and folio;
- right/recto leaf: the controlled principal-section SVG and folio.

The controlled section remains literal `166 × 92 mm` at true `1:100`. There is no `transform: scale`, CSS `zoom`, fit-to-page scaling or equivalent geometry mutation.

The final physical proof establishes:

- A4 build and validation: PASS;
- conservative B5 build and validation: PASS;
- intentional blank → spread-left → spread-right pagination: PASS;
- frozen `7.5 pt` label and `6.5 pt` note/marker roles through browser/PDF embedding: PASS;
- `12 mm` semantic fold exclusion: PASS;
- first unique controlled-drawing content remains `19 mm` from the fold;
- conservative B5 edge safety: PASS;
- label/visible-line collision freedom: PASS;
- A4/B5 page-furniture and drawing-placement parity: PASS;
- inline controlled vector drawing preserved at true scale.

Resumption proof run `39275985963` passed on head `fe7e15d8eab4e82b0a4efc29df9a5f7f27bbbf0d`. Proof artifact `12196429304`; digest `sha256:95a5ff4aa374eebab00f6ecdbfe6c8bdb65cedc98a8d883d9c456c96b5ec2f23`.

## Corrective history

The spread proof correctly stopped rather than concealing two drawing-system defects in page CSS.

1. **DRW-03C.1** corrected the original unitless SVG `font-size` serialization.
2. **DRW-05C.1** corrected the bounded `Entrance hall / stair` label collision without changing architectural or stair geometry.
3. The resumed proof then exposed DRW-03C.1's second-order browser/viewBox error: CSS `mm` type expanded by approximately `96 / 25.4 = 3.779×` in the embedded PDF path.
4. **DRW-03C.2** corrected the shared boundary by preserving the paper-space numeric type tokens as browser-safe SVG/CSS user units (`2.646px` / `2.293px`) and permanently proved ground plan, first-floor plan and principal section in A4/B5 browser/PDF output. It merged as `9dcda8f3a51af4c84b83c073dcd330a14e1161cb`.
5. DRW-05E was rebased onto that merge and the complete spread proof passed unchanged geometrically.

The earlier failing proof remains useful evidence of the regression mechanism: run `39254044781`, artifact `12187230980`, digest `sha256:69cca74a8d5c9e06564827faace0d9eb804e56ca408e4225185624beaae18372`, with labels at `28.3425 pt` and notes at `24.5625 pt`.

## Boundary preserved

DRW-05E and its corrective splits do not change:

- Reference House architectural geometry or source authority;
- principal-section cut position, direction or scene geometry;
- stair, wall, opening, floor-zone or roof geometry;
- section scale or physical drawing dimensions;
- the frozen line hierarchy;
- spread placement, fold offset or page furniture;
- public section identity;
- final PR-02 trim.

The omission of an `A–A` / `S01` marker remains deliberate because no accepted publication reference family currently authorises one.

## Handoff

On merge, **DRW-05 closes green**. The next authorised packet is **DRW-06A — freeze the principal front-elevation view and audit facade/opening vertical authority**. No DRW-06 source hardening or renderer work is authorised until that audit establishes the exact elevation boundary.
