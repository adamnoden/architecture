# Retained-component accounting for the upper-cut comparison

This method replaces the two historical retained floor/core families with source-bound net material components. It supplies actual quantities and adverse first moments for the existing global compression necessary condition. It does not select a collector, prove a retention route, or complete STR-FLOOR-PORTAL.

`studies/retained_components.py` reads the same floor fields, residual cells, entrance bridge, wall/opening geometry and lower-material declarations as the existing native structural sources. Each body has a stable component ID, editable source aperture geometry, a plan centroid, source identities and a component digest. The separate geometry method analytically integrates clipped circular apertures and unions their removal with rectangular holes. A circular drop inside the rear well is removed once.

The first-floor catalogue contains 88 non-overlapping bodies. Actual court, stair, entrance and service voids are subtracted. The source's 80 mm each-side collector material reservation is also union-subtracted, separately labelled from the service voids; replacement steel and a hypothetical integral-RC collector receive no credit. The resulting known-opening RC area is 93.9337842963 m². The principal wet-room aperture inventory is incomplete, so the intersecting east-strip component remains withheld even when its route is declared. The connected ground slab remains withheld because it bypasses the wall DPC and no authored dry-side section replaces it.

The eight upper-wall components include only clear full-height source core bands. Window/arch projection zones, end exclusions and actual level-1 extract/condensate territories are omitted. The known wall service territories are conservatively omitted for their full height. The remaining source 25% allowance for uncharted longitudinal loss is allowed to occur at either end of each disjoint band set. Exact extreme retained intervals give a first-moment range rather than an invented uniform-loss centroid. Because the source walls are axis-aligned, horizontal and vertical placement are independent and four combined XY first-moment vertices bound every linear hull-contact inequality. The nominal centroid remains a labelled uniform-loss comparison only.

| Component family | Default credited load | Declared comparison credited load |
| --- | ---: | ---: |
| First floor, with unknown principal wet field withheld | 0 kN | 299.682948712 kN |
| Clear upper core, with known service omissions | 0 kN | 98.055554400 kN |
| Connected ground slab | 0 kN | 0 kN |

Every credited component needs an explicitly authored route, current source references and its current geometry/material digest. A declared route is an unqualified retention proposal. It cannot override incomplete aperture evidence or the ground-slab bypass. Geometry edits invalidate affected component evidence; changed source identities invalidate the route evidence. Disabling a route removes its credit.

The replacement removes both original native families, including their actual full-precision first moments, before inserting the component vectors. With unresolved routes this removes the old 118.953142538 kN floor and 100.462680000 kN core credits; neither survives implicitly. The native source upper-cut case remains unchanged.

The existing source comparison passes 4 of 96 global cases. Replacement with unresolved routes passes 0 of 96. The explicitly declared comparison passes all 96 cases for each of the four adverse wall-loss vertices. This is a conditional global vertical/contact result over the native contact convex hull. Existing source roof retained-weight and wind assumptions are inherited unchanged; the successor tied roof is not modelled or accepted by this result. Local contact, DPC shear and bearing, floor continuity, force distribution, ties and reinforcement, moisture barriers, construction stages and all 52 foundation heads remain separate unresolved joined-proof obligations.

The focused tests check analytic circular clipping and nested union removal; current native quantities; real service-hole and wall-window edits; centroid and digest changes; unchanged controls; source/route invalidation; unrecognised source-hole grammar rejection; disabling routes; exact disjoint-band loss extremes; known wall ports; and actual replacement through all 96 native upper-cut vectors and all four adverse vertices. The compiler integration consumes this method and renders the same net geometry; it must retain the conditional status and test every adverse vertex.

## Current compiler and review drawing

The [source-derived mass plan](../ccr/studies/retained-component-contact.svg) shows net first-floor material, actual union-cut apertures, separate non-RC collector reservations, withheld eastern territory and clear upper-wall bands. Dark fill is an explicitly unqualified retained-path comparison, not an accepted connection. Its producer regenerates that virtual hypothesis from the current quantities; it does not renew physical or installed evidence. The individual component schedule and signed replacement vectors accompany the same compiler result.

`prepareCurrentDesignCompile` exposes `readRetainedComponentCase` and `retainedComponentCase`. The real CLI uses `--read-retained-components` and `--retained-components`. The saved engineering document supports an optional `retainedComponents` stage with authored `cutZMm`, `roofRiseMm`, `edits` and `retentionPaths`; source and implementation identities are derived, never accepted as stage settings. The stage remains optional because the default lacks proved retention paths.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --read-retained-components - > retained-case.json
node --import tsx scripts/compile-current-design.ts --retained-components retained-case.json
node --import tsx --test compiler/reference-house/current-design-retained-components.test.ts
node --import tsx project/ccr/studies/current-projection-witnesses.ts --check
```

A real rear service-aperture edit changes the cutout, net area, centroid, lower weight and all applicable contact vectors. Its old component-retention digest withholds the changed part until the comparison is explicitly refreshed. The compiler separately marks fixed service/protection applicability stale for that edited aperture; corresponding wall-opening edits require local arch/support/opening evidence to be requalified. Base nominal plans and services retain their original source scope. The saved stage also exercises a pressure-height change, save/load, the actual CLI, unchanged controls, rejection of load/result injection and stale geometry-helper implementations. The native numerical wrapper accepts a trusted derived signed account only from this adapter; its standalone input is not authenticated current-house evidence.
