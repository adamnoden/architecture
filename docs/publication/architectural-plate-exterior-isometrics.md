<!-- nav-exclude: redirect -->
# Complete exterior isometric family

**Question:** can one source-owned complete exterior support four intact-roof
corner isometrics without inventing missing construction or altering the house?

**Owner direction:** [PLT #994](https://github.com/adamnoden/architecture/issues/994).
Starting main `e96f08e`. This is candidate representation under PLT-CURRENT-REVIEW;
PLT parent #422 and final HRS/physical acceptance gates remain open.

## Source admission

`georgian/exterior-isometrics.ts` derives eight exterior face planes, all 49
outer/courtyard apertures (44 windows, five doors) and the complete twin-pitch
roof from `layout-revision.ts` and `layout-family.ts`. The four cameras look from
south-west, south-east, north-east and north-west with vertical Z and equal
projected XYZ scale. Quarter-turn cameras never reflect or redraw the building.

| Information | Disposition |
|---|---|
| Current shell, court, levels, opening host/centre/width/heights | Keep exact source relationships, including both court doors, plant opening and the four-bay upper rear |
| Roof faces, ridge inset, eaves, overhang and 300 mm represented zone | Derive the intact current roof; no cut plane, lifted roof or new openings |
| Frame/grid, head/sill, front door/panels/fanlight, threshold mark | Reuse the current face-on elevation convention on the nominal facade plane |
| Cornice and plinth | Use source-owned elevation datums; interrupt plinth at external doors |
| Frame setback, physical reveals, glazing depth | Unselected; no recess depth or fabricated frame section introduced |
| Internal assemblies and site | Omit; these are complete exterior views, not a complete material/BIM model or landscape design |
| Roof covering, outlets/overflows, rainwater hardware, access products | Omit until selected by the owning ROF/RWT/HAD source |

The aperture notation is coplanar with the nominal facade. The opaque face is a
**drawing occlusion mask**, not a claim that masonry fills the window or that
glass/frame occupies that plane. This prevents back walls and unmodelled
interiors showing through a schematic opening. It does not select a frame
position. Projected sill/head widths are elevation conventions, not fabrication
sections. The door threshold mark does not establish a 50 mm step.

The roof masks wall tops where the represented zones intersect. This expresses
the exterior silhouette only; it does not resolve roof/eaves construction.
The intact roof legitimately obscures some court geometry. Nothing is lowered
or removed to improve visibility.

## Shared capability and physical output

`architectural-drawing/boundary-mesh-edges.ts` factors the existing planar-boundary
edge extraction out of the sectional adapter. Its caller controls edge roles.
A signed-zero canonicalisation defect found by an independent asymmetric pair
of triangles is corrected, so a triangulation diagonal cannot survive as a false
crease. The generic helper owns no house dimensions or cut plane.

The complete exterior uses the existing parallel projection, spatial segment
and depth-interval visibility functions. A shared aperture helper extracted in
`layout-family.ts` supplies the exact existing nominal joinery, including the
front door and fanlight. A direct comparison against the starting-main modules
found all 24 orthographic scale/view scenes and four sectional profile/format
combinations JSON-identical after extraction and the signed-zero correction.
Historical specimen identities are retained.

All four views share one source fingerprint, common bounds about the house
centre, physical tokens and a fixed factor per format. Translation alone centres
them. SVG and A2 share 0.019 paper mm per projected model mm; BOOK uses 0.0075
at both B5/A4. Isometric foreshortening is not labelled as an ordinary orthographic
measurement scale: all are explicitly NTS.

Standalone SVGs are 420 × 390 mm and contain vector linework without visible text
or font dependencies. A2 proof pages are 420 × 594 mm at the identical drawing
factor. B5/A4 show each view individually; the fifth A2 page compares all four
BOOK-factor scenes in a 2×2 layout. PDF captions embed pinned Source Sans 3.

## Production, checks and access

`publication/specimens/plt21/prepare.ts` generates the four tracked assets in
`public/drawings/exterior-isometrics/`. Its `--check` mode rejects stale assets;
`--proof` also prepares thirteen finished PDF pages through the existing
Vivliostyle pipeline. The validator checks source/hash identity, physical page
sizes, camera labels, Unicode font embedding and explicit NTS.

The exterior regression suite uses independent asymmetric box occlusion and
triangle-seam fixtures, verifies all camera bases, source apertures/roof vertices,
consistent paper factors, unique identities, margins and deterministic SVGs.
Existing current-layout/section, engine and freeze tests apply. Rendered SVG/PDF
inspection remains separate from these numerical checks.

The [web comparison page](../reference-house/exterior-isometrics.md) provides
four direct SVG links. These are review assets, not an implicit replacement of
the frozen seventeen-role register. Four available web views do not require
four separate plates in the book; final admission should judge redundancy.

## Limits and downstream change

ROF/RWT/HAD can revise the current provisional roof and visible interfaces.
Their changes must regenerate this family and the orthographics together.
The roof/water interface contract, shared triad gate, MRA/BCR and HRS still
control final house authority. No geometry, product, technical adequacy,
physical verdict, maturity or drawing-publication-v2 freeze changes here.

Implementation proof identities and the rendered verdict belong in the PR and
issue closeout. Actual print acceptance is not inferred from screen inspection.
