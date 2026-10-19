<!-- nav-exclude: redirect -->
# DRW-06D — Controlled principal front elevation

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-06D  
**Issue:** #154  
**Status:** IMPLEMENTED — PENDING VALIDATION  
**View:** `REFERENCE-HOUSE-PRINCIPAL-FRONT-ELEVATION`  
**Scale:** 1:100

## Purpose

DRW-06D turns the DRW-06C elevation scene into a controlled, deterministic SVG artifact and proves that it is registered to the same architectural substrate as the controlled plans and principal section.

This packet does not compose a publication page. DRW-06E owns placement and physical plate proof.

## Controlled artifact

Canonical output:

`docs/reference-house/publication-principal-front-elevation.svg`

The generator is:

`compiler/reference-house/generate-publication-front-elevation.ts`

Canonical artifact generation is gated on a `PASS` Reference House compile. The committed SVG must equal a fresh canonical render byte-for-byte.

The artifact remains `166 × 92 mm` at true `1:100`; the 12,000 mm facade occupies exactly 120 mm of paper width. No fit scaling is introduced.

## Cross-view registration

### Plan/opening parity

The elevation source carries the same eight canonical front-opening IDs as the Reference House source. DRW-06D verifies every opening centre against the compiled plan-derived opening occurrence and verifies that the elevation bay-axis field is exactly the compiled front-axis field.

This proves the elevation has not acquired an independent facade grid. In particular, the entrance remains on canonical bay 3 at X=7,350 mm.

### Section/level parity

The elevation and principal section both use true 1:100 X/Z or Y/Z physical projection with the same vertical paper origin and 6,500 mm top bound. DRW-06D compares the paper ordinate for:

- GFFL 0;
- ground ceiling +2,950;
- first FFL +3,300;
- upper ceiling +6,000;
- provisional cornice/eaves control +6,250 mm.

The ordinate must be identical in both controlled views.

This comparison does not promote the provisional cornice control: it proves only that both drawings represent the same provisional datum consistently.

## Authority preservation

The controlled artifact preserves the DRW-06A/06B boundary:

- opening geometry remains provisional and dashed;
- ranges retain paired bounds;
- the entrance lower termination remains explicitly unresolved;
- GFFL remains a datum/drawing termination, not exterior grade;
- no ridge, canopy, facade panel, slab course or decorative articulation is introduced;
- no new public elevation-marker family is invented.

Machine/source opening IDs remain technical lineage in SVG metadata only; they are not reader-facing figure numbering.

## Explicit non-work

DRW-06D does not:

- change Reference House geometry or source authority;
- alter the DRW-06C renderer;
- add elevation markers to plans;
- compose the publication plate;
- select a page class, fold strategy or caption treatment;
- perform browser/PDF physical proof of the plate.

## Handoff

**Next packet: DRW-06E — compose and physically prove the principal-front-elevation plate.**

DRW-06E must place this controlled artifact at true 1:100 without fit scaling, prove A4 and conservative B5 output, inspect physical typography and uncertainty notation, and freeze the reusable elevation plate grammar if the result survives inspection.
