<!-- nav-exclude: redirect -->
# DRW-07C — Roof / drainage renderer capability

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-07C  
**Issue:** #154  
**Status:** IMPLEMENTED — PENDING VALIDATION

## Purpose

DRW-07C adds the minimum drawing capability required to render the mixed-authority roof/drainage source from DRW-07B without turning qualitative drainage relationships into false surveyed geometry.

No controlled SVG is generated in this packet. DRW-07D owns artifact generation, composition and physical proof.

## Literal plan geometry

The renderer uses the shared plan projection at true `1:100`.

The following geometry is literal:

- exact `12,000 × 10,800 mm` shell substrate;
- exact centred `3,600 × 4,000 mm` courtyard;
- four mechanically derived corner→court-corner watershed lines.

The watershed endpoints are exact consequences of canonical base geometry, but the lines remain visually/provenance-wise provisional because the roof family remains provisional in RH-C0.

## Fall notation

Each field receives a simple outward fall arrow and an approximate plan-catchment/fall note.

The arrow location is explicitly **annotation geometry**, not surveyed roof geometry. Its purpose is to communicate direction only. The line metadata records `notExactGeometry=true`, and the arrow uses the provisional line convention.

Labels retain the source precision:

- south/north `≈26.5 m²`;
- west/east `≈31.1 m²`;
- fall `≈1:40`.

Those area labels are plan-area proxies, not hydraulic sizing.

## Drainage topology without false points

DRW-07C refuses to draw exact RWP symbols because DRW-07B records no exact RWP point coordinates. Instead the drawing carries a compact side register:

- RWP SW — west-return zone;
- RWP SE — east/service-return zone;
- RWP NW — rear/west zone;
- RWP NE — rear/east zone.

Likewise, the courtyard water system is stated as topology:

- collector on the east/service side;
- short straight primary route to external service-side inspection;
- independent overflow route to a visible east/service-side outlet.

No collector rectangle, pipe centreline or overflow-level geometry is drawn.

The soil vent is represented only as an east/service roof-field zone note, not a point terminal.

## External collection

The source-selected relationship that all four external perimeter edges collect roof water is stated explicitly. DRW-07C does not offset a fictitious gutter line from the building perimeter because gutter profile/position remains technical.

The principal-front exclusion is also explicit: no main RWP on the principal front.

## Explicit non-work

DRW-07C does not:

- alter source authority;
- import any geometry from the legacy RH-08 SVG;
- invent gutter sections, RWP points, pipe routes, overflow levels or site discharge;
- add material hatch or waterproofing build-up;
- add the later DRW-10 analytical failure overlay;
- generate or compose the controlled roof SVG/plate.

## Handoff

**Next packet: DRW-07D — generate, compose and physically prove the controlled roof/drainage plate.**

DRW-07D must first lock deterministic SVG bytes, then test the `166 × 145 mm` scene at true 1:100 in the established A4/conservative-B5 plate grammar. If the side register or topology notes fail physical bounds, the defect returns here rather than being hidden with page scaling.
