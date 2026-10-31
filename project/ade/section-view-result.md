# ADE-SECTION-VIEW — orthographic context proof and handoff

**Packet:** ADE-SECTION-VIEW, issue #1187, draft PR #1188.  
**Scope:** internal reusable drawing representation only; no construction selection, no final-plate replacement or physical print acceptance.

## Accepted implementation

`compiler/architectural-drawing/section-view.ts` adds a small, source-space view compiler:

- hosted vertical facade surfaces with actual window voids, unique host/aperture identities and optional grids that cannot exist without their host;
- orthographic X/Y cut plane, station, camera-facing direction, retained halfspace and section profile, without paper-coordinate assumptions;
- candidate original mesh edges, then retained-face clipping and exact-depth interval visibility, so behind-cut edges can disappear only for geometric occlusion;
- explicit section caps at cut weight; no fictional cut seam from trimming a roof surface;
- reuse of the existing 3D projection, face clipping, boundary mesh, segment visibility and v2 SVG/PDF vector terminal.

`section-view-contrast-fixture.ts` is a deliberately **non-Reference-House** asymmetric test building: oblique pitch, two aperture types and a partial foreground cut screen. Its scene is compiled at true 1:50 and 1:100 with no token inflation or fitted scale. The current house and frozen historical publication files remain unchanged.

The generic compiler does **not** infer solids, cavity/leaf assembly intersections, roof topology, structural supports or foundations. It admits explicit caller-owned planar faces, facade hosts and cut faces. Provenance is carried via entity meaning and semantic source IDs through vector output.

## Evidence and acceptance

The first complete code-head proof was `aa720044521bf05c6fbe5081726591ea0ad23170`, with:

- [Validate PR workflow #41243548307](https://github.com/adamnoden/architecture/actions/runs/41243548307): **SUCCESS**; includes project health, TypeScript, publication builds and packet declaration.
- [ADE wall assembly #41243548270](https://github.com/adamnoden/architecture/actions/runs/41243548270), [ADE opening subtraction #41243548363](https://github.com/adamnoden/architecture/actions/runs/41243548363), [ADE partition/adjacency #41243548291](https://github.com/adamnoden/architecture/actions/runs/41243548291), [ADE opening uncertainty #41243548352](https://github.com/adamnoden/architecture/actions/runs/41243548352), [ADE wall topology #41243548260](https://github.com/adamnoden/architecture/actions/runs/41243548260), [ADE atlas #41243548267](https://github.com/adamnoden/architecture/actions/runs/41243548267), [ADE migrated plans #41243548275](https://github.com/adamnoden/architecture/actions/runs/41243548275), [PLT ADE physical profiles #41243548311](https://github.com/adamnoden/architecture/actions/runs/41243548311): **SUCCESS** on that implementation head.
- [PLT owner-feedback proof #41243548312](https://github.com/adamnoden/architecture/actions/runs/41243548312) was still running when this record was authored. A passing focused result does not replace all exact-head PR checks.

The `section-view.test.ts` tests explicitly cover host geometry and true aperture absence, invalid axis/overlap/out-of-host inputs, partial roof occlusion by opaque cut geometry, reversed view and X/Y axes, false cut-plane seam rejection, source mutation propagation, shuffled face determinism, non-planar / duplicate / off-plane rejection, and exact SVG physical scale and semantic hierarchy. Existing ADE and DRW terminal regressions stay protected.

## Separate house-specific migration

**ADE-SECTION-PARITY** (separate node) owns the current house replacement: feed the accepted `RH-LAYOUT-REVISION-02` model into this API and the existing cut assembly compiler. Its entrypoint is `compiler/reference-house/georgian/layout-family.ts:createLayoutSection`, with cuts A=5900 mm / B=10100 mm, a 3500 mm courtyard and a 2125 mm ridge inset. It currently inserts beyond-cut `court-west` windows and 2D roof paths independently. Historical `section-exemplar.ts` / `orthographic-family.ts` use predecessor geometry and must not silently become current source authority.

The next packet must derive host-wall tops, eaves, ridge, roof fields and apertures once, use actual visibility for background projections and verify plan/section/elevation/roof mutation parity. Only then regenerate current drawings and inspect exact BOOK/WALL output, without rewriting historical frozen proofs.

## Delivery boundary

This packet is internally proven when its final exact-head checks pass. It remains **unshipped while its PR is unmerged**. The owner-directed connector-only chat cannot run the repository's native `control:merge-check` (a fresh runner-side publication preflight) from a local Git checkout; a green PR workflow is not equivalent. Handoff must preserve exact branch, PR, validated head and ACO lease history, and must not claim a main merge.
