<!-- nav-exclude: redirect -->
# DRW-10A — Structural / span analytical overlay

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-10A  
**Issue:** #154  
**Status:** REVIEWED — CONTROLLED SVG BYTE-LOCKED; EXACT-HEAD MERGE PENDING

## Purpose

Produce the structural/span analytical reading retained by DRW-02D without turning the architectural model into structural engineering.

The overlay is built over the canonical **first-floor publication plan at true 1:100** because the present structural claim is primarily about the first-floor support/span concept: permanent masonry boundaries, short gross floor spans and local framing around the stair/service reservations.

## Current source boundary

The current Technical Coordination owns a deliberately restrained structural concept:

- loadbearing inner leaves to the external masonry envelope;
- loadbearing inner leaves to the courtyard envelope;
- engineered-timber first-floor framing between those permanent lines;
- four short repeated edge-beam conditions associated with the courtyard support order;
- local framing around stair and service openings;
- a structural floor deck retaining diaphragm responsibility;
- ordinary gross span classes of approximately **4.2 m** across side wings and **3.4 m** across front/rear central strips.

It explicitly does **not** prove member size, bearing, connection, lintel, foundation or robustness design.

DRW-10A preserves that exact maturity. It does not revive more detailed historic RH-05 nomenclature that is no longer present in the current coordination source.

## Canonical substrate

The overlay does not redraw the house.

`createStructuralSpanOverlayPublicationScene()` first creates the existing canonical first-floor publication-plan scene and appends analytical primitives. Tests require the entire canonical primitive sequence to remain unchanged as the prefix of the analytical scene.

The appended primitives all carry `overlay="structural-span"`, so the structural reading remains independently identifiable/removable and can never become sole authority for the architectural geometry beneath it.

## Structural reading

### Permanent support order

The four courtyard masonry boundaries are re-emphasised as **permanent masonry support order**, not as member centrelines. The outer masonry envelope remains part of the same source-defined support family but is already legible in the canonical plan substrate and is not redrawn as a second invented structural frame.

The current coordination says four short repeated edge-beam conditions exist around the courtyard support order, but does not own their exact material, section or member extents. DRW-10A therefore carries that fact in the source/metadata only. It does not draw four fictional beam rectangles.

### Gross span directions

Four diagrammatic span readings are derived from controlled shell/courtyard geometry and the current structural concept:

- west side wing: approximately **4.2 m gross**, east–west;
- east side wing: approximately **4.2 m gross**, east–west;
- south centre: approximately **3.4 m gross**, north–south, with local stair framing modifying the regular field;
- north centre: approximately **3.4 m gross**, north–south.

The arrows are **span-direction notation only**. Their paper position is diagrammatic within each region and does not assert joist centrelines, spacing, bearings or member layout.

### Openings

The existing provisional stair reservation is already visible in the canonical plan. The overlay adds the structural qualification that local framing is required; exact trimmers and bearings remain absent.

`SV-01` is carried as its already-documented approximate **900 × 700 mm clear reservation** and shown with a provisional outline solely to identify the local floor-framing obligation. This is **not** the final structural opening. `PEN-SV-01`, trimmers, bearings and fire/acoustic closure remain technical design.

## Explicit absences

DRW-10A does not draw or infer:

- joist centrelines or spacing;
- joist depth / engineered-timber product family;
- beam sections or exact edge-beam extents;
- bearings;
- hangers / shoes / seated-bearing details;
- connections / ties / diaphragm fasteners;
- lintels;
- columns;
- foundation geometry;
- ground-bearing / settlement response;
- robustness / disproportionate-collapse strategy.

The overlay therefore remains architectural coordination, not a structural drawing package.

## Architectural review and controlled artefact

The candidate was reviewed as a drawing rather than accepted from source/tests alone. The first candidate was rejected for annotation collisions through the landing/service field and around the courtyard. The accepted revision shortens span labels, rotates the north–south span notation into its own fields, reduces the service note to `SV-01`, and compresses the qualification line without changing geometry or authority.

The accepted candidate keeps the canonical first-floor plan intact and makes the analytical layer subordinate but legible. Exact reviewed SVG bytes are committed at `docs/reference-house/publication-structural-span-overlay.svg` and a deterministic regeneration test requires the source render to remain byte-identical.

Physical A4/B5 family proof is deliberately **not duplicated here**. DRW-10F owns analytical-family consistency and plate proof across all retained analytical overlays.

## Handoff

After DRW-10A closes, proceed to **DRW-10B — service / maintenance-geography overlay**, again over canonical geometry and with the analytical layer independently removable.
