<!-- nav-exclude: redirect -->
# DRW-06C.1 — Front-elevation datum-label correction

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-06C.1  
**Issue:** #154  
**Status:** IMPLEMENTED — PENDING VALIDATION

## Trigger

The first DRW-06E browser/PDF proof built both A4 and conservative B5 successfully, then correctly failed its physical annotation-bound check.

Proof run `39300546273` failed on:

`Ground ceiling +2.950: drawing annotation breaches the B5 outer 5 mm safe edge`

Artifact `12210527454`; ZIP SHA-256 `195941accd5217b9f2543b8504292cc49d11422ec164db46ea6ea31a489f0696`.

The same source-metric audit showed that `Upper ceiling +6.000` and `≈ Cornice control +6.250` also exceeded the frozen conservative B5 edge contract. This is a drawing-owned notation defect, not a page-fit problem.

## Correction

Only three side-datum labels are compacted:

- `Ground ceiling +2.950` → `G ceiling +2.950`;
- `Upper ceiling +6.000` → `U ceiling +6.000`;
- `≈ Cornice control +6.250` → `≈ Cornice +6.250`.

`GFFL ±0.000` and `First FFL +3.300` remain unchanged.

The compact forms preserve the same datum meaning and numerical value while fitting the existing physical scene with several millimetres of conservative B5 outer-edge reserve.

## Frozen non-change boundary

DRW-06C.1 changes no:

- Reference House source fact or authority;
- datum ordinate or tick position;
- facade, opening, entrance or roof geometry;
- drawing scale or physical scene size;
- fold-side placement or publication-page geometry;
- line hierarchy, dash grammar or typography size;
- public figure identity.

The controlled SVG is regenerated deterministically from the corrected renderer. Internal `data-entity` slugs follow the compact labels; they remain technical lineage only.

## Handoff

After this correction validates and merges, DRW-06E resumes on its existing draft PR and must re-run the same A4/B5 physical proof without changing page placement or scaling.
