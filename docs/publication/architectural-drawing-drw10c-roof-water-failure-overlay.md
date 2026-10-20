<!-- nav-exclude: redirect -->
# DRW-10C — roof water / failure analytical overlay

**Status:** MERGED + PHYSICALLY CORRECTED UNDER DRW-10F  
**Programme:** DRW  
**Parent:** #154

## Question

Can the controlled DRW-07 roof/drainage drawing make failure behaviour legible without inventing drainage engineering?

## Result

Yes. The complete controlled DRW-07 roof/drainage scene remains the unchanged substrate. DRW-10C appends paper-space analytical notation only:

- offset perimeter territory = inspectable external collection/failure zone, not gutter profile;
- outward arrows = visible failure direction, not overflow coordinates;
- east courtyard bracket = collector/inspection zone, not exact collector geometry;
- PRIMARY / EMERGENCY hierarchy = consequence order and redundancy, not drawn pipework.

The architectural proposition remains: outward-falling roof fields, externally inspectable perimeter collection, visible outward failure, an inspectable courtyard primary collector/route and an independent emergency overflow before occupied thresholds flood.

## Explicit absences

No gutter profile, RWP coordinate/diameter, collector dimension, drain centreline/depth/gradient/diameter, overflow coordinate/level, threshold datum, waterproofing build-up, real-site discharge or hydraulic sizing is asserted.

## Original closeout

DRW-10C was reviewed, byte-frozen and merged as `fcbe462…`. Its semantic regression was corrected during review by narrowing the outward-arrow count to line primitives rather than changing drawing metadata or architecture.

## DRW-10F physical correction

Family-level physical proof later exposed one genuine presentation defect in the accepted 10C plate: the long bottom absence/nonclaim sentence collided with the inherited roof scale-bar `0` label at both A4 and B5.

This was **not** a geometry, authority, renderer-scale or hydraulic defect. DRW-10F corrected presentation only:

- the inherited DRW-07 roof scene and scale bar remain unchanged;
- the same absence semantics are now expressed in the unused right analytical legend as `ABSENT / DEFERRED` plus three short lines;
- metadata/nonclaims remain intact;
- a regression now keeps the absence block to the right of the inherited scale-bar territory.

The corrected controlled SVG was frozen at `deb7afc3e74c76229070f94bd51a40df9a163316`; the human-authored regression head is `ec8700dd48d81024862d7813f6fe2eb107a46876`.

The complete A4 + conservative-B5 family was then regenerated and directly reviewed under run `39486843600`, artifact digest `sha256:23fce67a06629fcd8a98a30aa8f3bcdf03fc35afa4160779c5a207049362e572`. The corrected roof pair is legible and collision-free at both sizes.

## Files

- `compiler/reference-house/publication-roof-water-failure.ts`
- `compiler/reference-house/publication-roof-water-failure.test.ts`
- `compiler/reference-house/generate-publication-roof-water-failure-overlay.ts`
- `.github/workflows/drw-roof-water-failure-candidate.yml`
- `docs/reference-house/publication-roof-water-failure-overlay.svg`

DRW-10F owns the family-level physical proof; this record preserves the bounded 10C authority and the later presentation correction.
