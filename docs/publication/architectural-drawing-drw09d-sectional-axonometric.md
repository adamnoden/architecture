<!-- nav-exclude: redirect -->
# DRW-09D — Reference House sectional axonometric generation and architectural review

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-09D  
**Issue:** #154  
**Status:** CANDIDATE IMPLEMENTED — PHYSICAL COMPOSITION RESERVED FOR DRW-09E

## Purpose

Generate the admitted DRW-09A sectional axonometric from controlled Reference House geometry and review whether it remains architecturally honest once it becomes an actual drawing.

This packet creates the drawing itself. It does **not** freeze final spread crop, fold relation or B5/A4 physical composition; that remains DRW-09E.

## NTS truth

The existing drawing serializer previously assumed that every `DrawingScene` had a positive numerical architectural scale denominator. That assumption was valid for the orthographic family but false for the admitted axonometric.

DRW-09D therefore broadens the scene contract minimally:

- existing drawings continue to use positive numeric denominators and serialize `data-scale-denominator="…"`;
- an explicitly NTS scene uses `scaleDenominator: 'NTS'` and serializes `data-scale="NTS"`;
- an NTS drawing never receives a fabricated denominator merely because SVG needs physical dimensions.

The physical plate still needs deterministic composition. The axonometric therefore uses one fixed model-projection-to-paper composition factor. That factor is editorial page fitting only and is declared in source/metadata as NTS composition, not architectural scale.

## Architectural scene

The drawing uses the frozen DRW-09A cut:

- cut plane: `Y = 3400 mm`;
- retained half: north;
- viewer: elevated south-east;
- projection: deterministic parallel isometric.

The retained U-shaped architectural order is reconstructed only from the controlled shell and courtyard geometry. It is shown at:

- ground FFL;
- first FFL;
- upper clear-ceiling datum.

Vertical order is carried at the same controlled U-outline vertices. Edges coincident with the south-court cut use the `cut` line role; uncut permanent boundary order uses profile/primary hierarchy.

This is deliberately a **line axonometric**, not a rendered solid model. The project does not own enough construction geometry to justify a materially filled BIM-like object.

## Service geography

The exact controlled `galleryServiceX` datum is carried into the drawing at ground and first-floor level as a restrained service-flank datum.

`SV-01` is shown as its documented approximate 900 × 700 mm capacity reservation extending through the occupied vertical order. It uses provisional dashed geometry and metadata that explicitly says:

> capacity zone — not packed services.

No pipe, duct, cable, support, closure or plant-product geometry is generated.

## Roof representation

DRW-09D does **not** create exact sloping roof planes.

The current source owns:

- a selected four-field outward-draining topology;
- a provisional outer cornice/roof-edge control around +6250 mm;
- a coordination fall around the 1:40 class;
- explicit technical absences for exact roof build-up/distribution geometry.

Turning the 1:40 coordination class into exact continuous 3D planes would manufacture geometry, particularly because the front/rear and side field runs differ.

The axonometric therefore spatialises only the retained external outer roof-edge control as provisional dashed geometry and annotates the outward-field topology. Exact 3D fall surfaces remain absent.

## Openings and replaceable layers

The DRW-08F non-composability rule is enforced directly in the scene.

The axonometric contains no complete window or door solids assembled from unrelated view-local proxies. A note records that composite aperture geometry is forbidden.

Likewise, the permanent/changeable thesis is expressed semantically:

- permanent support/enclosure order is visible in the architectural boundary framework;
- replaceable layers remain semantic only;
- no removable lining, frame interface, architrave, skirting or tolerance zone receives invented spatial thickness.

## Courtyard

The courtyard is represented primarily by **absence**: the controlled U-shaped retained floor/boundary order wraps a vertical void. A restrained internal marker identifies the open courtyard void without filling it or turning it into a separate solid object.

## Deliberate absences

The generated candidate contains no:

- complete aperture solids;
- product-specific structural members or connections;
- wall/floor/roof construction-layer solids;
- packed MEP geometry;
- exact service terminals;
- plant product outlines;
- furniture;
- people;
- vegetation;
- real-site context.

## Candidate protocol

The first DRW-09D validation pass generates the candidate SVG in CI rather than committing guessed bytes.

The dedicated workflow:

1. generates the SVG from canonical source;
2. proves that it carries `data-scale="NTS"`;
3. proves that it does **not** carry `data-scale-denominator`;
4. uploads the exact candidate artifact for review.

After the candidate passes source/tests and architectural review, those exact generated bytes are committed and a deterministic regeneration lock is added before DRW-09D merges.

## Architectural review criteria

The candidate survives only if it demonstrates all of the following without extra invented geometry:

- the courtyard reads as a vertical organising void;
- the two-storey order is immediately legible;
- the east service flank is recognisable but subordinate;
- `SV-01` reads as provisional capacity, not a designed shaft interior;
- the roof order is present without pretending exact roof planes are known;
- the section cut is visually stronger than beyond/projection lines;
- annotations make NTS/provisional/absent boundaries legible without turning the plate into an engineering legend.

If those conditions cannot be met from the current authority, the correct outcome is to narrow or reject the axonometric—not to complete the missing architecture.

## Handoff

Once exact candidate bytes are reviewed, committed and regeneration-locked, DRW-09D may close.

**Next authorised packet:** DRW-09E — final hero spread composition, gutter-safe crop and A4/conservative-B5 physical proof.
