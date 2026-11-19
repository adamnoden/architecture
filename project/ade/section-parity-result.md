# ADE-SECTION-PARITY — current-house orthographic section integrity

**Owner-directed packet:** ADE-SECTION-PARITY; [scope #1187](https://github.com/adamnoden/architecture/issues/1187); [implementation PR #1192](https://github.com/adamnoden/architecture/pull/1192).  
**Accepted architectural basis:** `RH-LAYOUT-REVISION-02` — 12,000 mm square shell, 3,500 mm courtyard from 4,250–7,750 mm in X and Y; pitched ring roof with 2,125 mm ridge inset, equal +6,800 mm inner and outer eaves, 25° nominal pitch. This is an architectural representation result, **not** an engineered construction release.

## Root defect and correction

The principal section formerly showed four freestanding sash drawings behind the cut but omitted both the distant courtyard wall top and the roof behind it. The service section compounded the error by showing the same remote sash drawings through opaque intervening service rooms. These are source-to-view failures, not missing ink or editorial conventions.

The current `compiler/reference-house/georgian/layout-family.ts:createLayoutSection` now compiles the principal X=5900 and service X=10100 view context from the same original building model:

1. `roof-surfaces.ts` owns the selected twin-pitch ring's **actual 3D roof face mesh and height law**, replacing an independent exterior-isometric roof generator and parallel section/elevation formulae. Retained face IDs/shape remain stable; roof pitch and eaves remain the house source's responsibility.
2. `section-context.ts` derives courtyard west/east **hosted wall material with true openings**, nominal sash grid as attached detail, source-controlled +6800 mm wall termination, retained view direction and vertical cut planes.
3. Existing shared ADE 3D projection, face clipping and depth-aware interval occlusion select visible edges. The cut wall and roof assembly representation still owns its separate stronger cut marks, source IDs, paper profile, unresolved supports and material build budgets. An obscured roof is not shown merely because the renderer knows it exists.
4. Interior partitions are genuine **occluder-only geometry**: their wall segments and source-authored door gaps block more distant wall/window marks without introducing false visible construction or choosing solid/finish assemblies. The section-cut partitions mask views in their own storeys only.
5. An enclosed-room/service section retains geometrically visible background envelope/roof context but suppresses incidental isolated sash grid fragments visible only through narrow door apertures. The open-courtyard principal cut retains full source-hosted sash articulation. This is deliberate legibility policy, not source alteration.
6. Ground/first-level cut opening IDs are qualified at the source `layoutSectionAt`; the former renderer-level ID patch was deleted. Their opening source authority is preserved.

## Bounded proof and visual review

- Non-house ADE tests exercise opaque occluders, absent wall holes, cut/camera direction and no projected phantom outlines.
- Current-house tests cover both stations, hosted facade coordinate identity, partition/source door masks, service-spine sight lines, intentional section-vs-background hierarchy, source roof mutations and true 1:100 BOOK / 1:50 WALL model-to-paper scaling. The selected A1/1:25 principal proof also reproduces.
- The visual section proof workflow emits four native SVGs and semantic JSON scenes. Inspect the **principal and service**, both BOOK and WALL, and verify window hosting, +6800 wall termination, roof-ridge visibility and physical foreground masking. Production proof and publication page composition remain distinct.
- At 1:100 the principal background shows the far courtyard wall and roof ridge around +7791 mm; the service view retains distant roof geometry but does not display sash detail through the intervening opaque service/wet-room spine. These are source projections, not independent extra lines.
- [Initial A1 principal rendered proof](https://github.com/adamnoden/architecture/actions/runs/41246230945) and [principal/service SVG specimen run](https://github.com/adamnoden/architecture/actions/runs/41247499399) preserved reproduced source/scene snapshots. Later exact-head runs and CI are the final integration requirement; prior successes do not substitute for checks against a changed head.

## Explicit limits

This is a bounded **2.5D planar** geometry solution. It does not supply a general solid-model/BIM system, automatically derive material sectional caps from arbitrary meshes, resolve structural bearing or member directions, invent window frame positions, verify fire/acoustics, size rainwater drainage, choose foundation/DPC assemblies, or establish buildability. The down-branch opaque faces represent source-selected physical partitions for sight-line suppression, not a construction-wall specification. Unknown geometry must fail closed rather than be represented as selected material.

The current accepted layout is the only current-house input. Historic PLT/DRW specimens, their source identifiers and protected v1 publication drawings remain retained comparison evidence; they must not be silently treated as the adopted house or overwritten.

## Integration and follow-on

The canonical packet's completion means a source-bound, regression-tested and visually inspected **digital section representation**, not site/construction maturity. Do not treat the branch-only lifecycle value as shipped until an exact-head CI result and fresh native MVB merge preflight permit PR integration, then verify `main` and release the ACO lease. The final `PLT-FINAL-PREP` and actual-size `PLT-PRINT-REVIEW` gates remain separate; no print acceptance is claimed here.

This result is the authoritative handoff for any future elevation/roof/section consistency regressions: repair the original model or shared representation, not a final SVG.
