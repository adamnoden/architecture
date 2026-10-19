<!-- nav-exclude: redirect -->
# DRW-05C.1 — Principal-section label-fit correction

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-05C.1  
**Issue:** #154  
**Starting baseline:** `552bc8fb84379287a032cd7f7e18cef74c03bcc9`

## Trigger

DRW-05E physical proof exposed a collision between the ground-south section label `Entrance hall / stair` and the vertically projected `stair-flight-2-perpendicular-beyond` line. DRW-03C.1 subsequently restored the intended physical 7.5 pt drawing type, so this packet addresses only the remaining section-local fit defect.

## Cause

The original ground-south label was a 22.6 mm single line centred at paper `x = 31 mm`, `y = 58.5 mm`. The perpendicular-beyond stair flight occupies `x = 36 mm` from `y = 62 mm` to `51 mm`.

At the frozen 7.5 pt type size, the single-line label necessarily crossed that flight. Moving the full label left or right while retaining it inside the south hall would not provide enough width. This is therefore a presentation-fit problem, not an architectural geometry problem.

## Correction

The wording is preserved across two lines:

- `Entrance hall /` at paper `(27, 57)`;
- `stair` at paper `(27, 60)`.

The block is derived from the previous label anchor by a 4 mm paper-space shift toward the south and ±1.5 mm vertical line separation. It remains a reader-facing editorial label only.

The new placement provides:

- more than 0.5 mm horizontal clearance from the perpendicular-beyond flight at frozen label metrics;
- more than 1 mm vertical clearance from the adjacent first and third stair flights;
- no change to room, stair, wall, opening, roof, level or section geometry.

## Regression

`publication-principal-section.test.ts` now proves:

- all three stair flight coordinates remain exactly unchanged;
- the two new label primitives remain at the intended paper coordinates;
- the first line's frozen physical width clears the perpendicular flight;
- the two-line block clears the adjacent stair flights vertically;
- public labels remain human-readable and machine-ID free.

The controlled principal-section SVG is regenerated from the same scene contract. Its only intended drawing-content drift is the replacement of the former one-line label by the two-line fitted label.

## Explicit non-work

DRW-05C.1 does not change:

- Reference House source or compiled geometry;
- the section cut or view direction;
- stair source geometry or projection semantics;
- wall, opening, floor-zone or roof representation;
- line weights, drawing scale or physical SVG size;
- public section identity or nomenclature;
- DRW-05E spread composition.

## Handoff

After this correction closes green, DRW-05E may resume its spread proof against the corrected controlled section.