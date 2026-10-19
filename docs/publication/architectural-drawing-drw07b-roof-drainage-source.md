<!-- nav-exclude: redirect -->
# DRW-07B — Canonical roof / drainage publication source

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-07B  
**Issue:** #154  
**Status:** IMPLEMENTED — PENDING VALIDATION

## Purpose

DRW-07B encodes the mixed-authority boundary frozen by DRW-07A as a publication-specific canonical source. It deliberately does not widen the generic RH-C1 fixture merely to make the roof drawing convenient.

The source is `compiler/reference-house/publication-roof-drainage-source.ts`.

## Authority types

The source keeps five materially different states distinct:

- **CONTROLLED** — exact canonical shell/courtyard/view substrate;
- **PROVISIONAL** — roof-field/watershed geometry derived from the provisional RH-C0 roof family;
- **RH08_SELECTED_OUTSIDE_RH_C1** — architectural relationships positively selected by RH-08 but intentionally outside the first executable slice;
- **ABSENT_SELECTED** — objects/routes explicitly excluded from the current architecture;
- **ABSENT_TECHNICAL** — values/details deferred to technical, hydraulic or site design.

This separation is the main deliverable. It prevents computability from laundering provenance.

## Derived roof geometry

The four roof polygons and diagonal watersheds are derived only from:

- controlled shell geometry;
- controlled centred courtyard geometry;
- the RH-08 outer-corner → corresponding-court-corner relationship.

Their numeric endpoints are deterministic, but the polygon/watershed authority remains `PROVISIONAL` because the roof family itself remains `PROVISIONAL_BUT_REPRESENTABLE` in RH-C0.

The derived plan-area proxies are:

- south `26.52 m²`;
- north `26.52 m²`;
- west `31.08 m²`;
- east `31.08 m²`;
- total `115.2 m²`.

They are explicitly `OUTSIDE_RH_C1_DERIVED` and approximate in publication meaning. They are not hydraulic-sizing claims.

## Water topology without false coordinates

The source carries:

- all four external collection host edges;
- collection splitting toward adjacent corner-return RWPs;
- visible outward overflow behaviour;
- named RWP occurrences `RWP-SW / SE / NW / NE` with qualitative zones only;
- east/service-side courtyard primary collector role;
- short straight primary route through service/gallery geography to external inspection;
- independent higher-level overflow route to a visible east/service-side outlet;
- the soil-vent occurrence on the east/service roof field near its outer edge.

None of the RWP, collector, pipe-route or soil-vent objects receives an invented X/Y coordinate.

## Explicit absences

Selected architectural absences include:

- principal-front RWP;
- internal roof outlet;
- courtyard roof gutter;
- permanent roof hatch;
- roof MVHR/cooker terminals;
- chimney;
- rooflight;
- rooftop plant.

Technical absences include gutter profile, RWP diameter, collector dimensions, drain centreline/depth/gradient/diameter, overflow level, threshold datums, waterproofing build-up, site discharge and hydraulic sizing.

These are machine-visible so later rendering cannot silently fill them.

## Legacy SVG quarantine

The source contains only the statement that the RH-08 SVG is `QUARANTINED_COORDINATION_EVIDENCE` with `geometryAuthority: NONE`.

No `55 px/m` transform, circle centre, rectangle size, route pixel coordinate or terminal symbol location is imported.

## Handoff

**Next packet: DRW-07C — implement the minimum roof-plan / fall / drainage renderer.**

The renderer must consume this source without demanding exact coordinates for relationships that are intentionally qualitative. Where a qualitative occurrence needs graphic representation, DRW-07C must use a notation whose geometry communicates zone/topology rather than pretending to be an exact surveyed point or pipe centreline.
