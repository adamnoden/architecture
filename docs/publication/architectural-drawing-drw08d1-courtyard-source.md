<!-- nav-exclude: redirect -->
# DRW-08D.1 — Courtyard elevation source hardening

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-08D.1  
**Issue:** #154  
**Status:** IMPLEMENTED — PENDING VALIDATION

## Why DRW-08D splits

DRW-02D retains one `SUPPORTING` courtyard architectural-elevation plate at `1:50` because the court must read as an external room with its own order rather than as a miniature copy of the principal façade.

The source audit shows that the architectural relationships are strong but the aperture geometry is deliberately incomplete. RH-C1 contains boundary-centred north/south opening occurrences whose family dimensions are explicitly unknown. East and west are even more restrained: RH-C1 freezes a two-axis relationship while stating that the numeric centres are deliberately absent.

A finished-looking four-face courtyard plate drawn from the old RH-04 schematic would therefore launder pixel geometry into architecture. DRW-08D.1 hardens the actual authority first.

## Frozen publication view

`REFERENCE-HOUSE-COURTYARD-ELEVATION-FAMILY`

- true scale `1:50`;
- one publication plate presenting the four courtyard faces as a family rather than four independent ceremonial elevations;
- south/north face width `3,600 mm` from controlled court geometry;
- east/west face width `4,000 mm` from controlled court geometry;
- shared controlled vertical datums from the canonical house;
- no inheritance of the principal front four-bay grid.

## Face order

### South

Owned by entrance-hall/stair geography. One ground and one first-floor occurrence are boundary-centred. Their centreline is therefore a controlled derivation at `1,800 mm` along the `3,600 mm` face. Aperture width, sill/head and threshold geometry remain absent.

### North

Owned by garden-dining / upper cross-landing geography. It has the same one-axis centred relation and the same absence of aperture extents.

### East

Ground and upper gallery own the face. RH-C1 freezes a two-bay rhythm and vertical alignment where coherent, but explicitly withholds numeric centres. DRW-08D may represent the **relationship**, not make up two convenient axes.

### West

Occupied rooms own two axes. Alignment between floors is retained where supported, but numeric centres are again deliberately absent.

## Representation consequence

The later DRW-08D renderer may show:

- the exact face widths and shared vertical datum hierarchy;
- north/south centre axes and selected opening occurrences without aperture extents;
- east/west two-bay / two-room-owned relationships using non-coordinate notation;
- the fact that the four faces have different owners and therefore different orders.

It may not draw window/door rectangles merely because the old RH-04 schematic contains them.

## Explicit absences

The source keeps machine-visible:

- all courtyard opening widths and vertical aperture geometry;
- east/west numeric axis positions;
- threshold build-ups and courtyard grade;
- guarding;
- coping/weathering build-up;
- arches, tile, planting or other decorative treatment.

## Legacy schematic

`courtyard-elevations-study.svg` is retained as `QUARANTINED_COORDINATION_EVIDENCE / geometryAuthority: NONE`. Its proportions and pixel coordinates are not a publication source.

## Handoff

Resume **DRW-08D — courtyard elevation/section material**. The honest 1:50 plate should make the distinct four-face order legible through exact face envelopes, datums and authority-labelled opening relationships. If that cannot carry the reader task without invented apertures, the packet should record a failed retention test rather than fabricate detail.
