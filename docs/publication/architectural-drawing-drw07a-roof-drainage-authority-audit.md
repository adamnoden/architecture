<!-- nav-exclude: redirect -->
# DRW-07A — Roof / drainage source-authority audit

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-07A  
**Issue:** #154  
**Status:** FROZEN — PENDING VALIDATION  
**View:** roof / drainage plan  
**Target publication scale:** 1:100

## Purpose

DRW-07A freezes the source-authority boundary for the essential roof / drainage publication view before a canonical roof source layer or renderer is hardened.

The frozen reader task is to make the following inspectable:

- four outward-falling roof fields;
- the diagonal watershed structure;
- external collection rather than inward/courtyard collection;
- the courtyard's separate water route;
- visible, inspectable failure topology.

The audit must reconcile three authority layers without flattening them:

1. **RH-08 architectural coordination**, which positively selected the roof/drainage topology and rejected inward/internal collection;
2. **RH-C0 / RH-C1 executable-slice authority**, which intentionally carries only the gross roof family/fall as provisional and leaves courtyard drainage outside the first executable slice;
3. **the inherited RH-08 SVG**, which illustrates the selected relationships but does not gain geometric authority merely because its pixels are concrete.

This packet changes no Reference House geometry and creates no roof renderer.

## Source hierarchy

### 1. Controlled base geometry

The roof plan inherits its base plan substrate from the canonical Reference House source:

- shell: `12,000 × 10,800 mm`;
- centred courtyard: `3,600 × 4,000 mm`;
- court edges: `X=4,200 / 7,800`, `Y=3,400 / 7,400`;
- south/front orientation and model coordinate convention.

Those facts are controlled independently of the roof decision and may be projected exactly.

### 2. RH-08 architectural decision authority

RH-08 positively selected **R2 — four outward-draining low-slope fields** and rejected both a conventional inward-draining courtyard roof and a near-flat roof with internal outlets.

Its selected architectural topology is:

- four roof fields around the court;
- field boundaries run from each outer shell corner to the corresponding courtyard corner;
- those diagonal boundaries are watersheds, not valleys;
- each field falls from the courtyard edge outward to its corresponding external elevation;
- primary roof collection is at the external perimeter, not the courtyard;
- no primary internal roof outlet;
- no primary courtyard roof gutter;
- the principal front is kept free of main downpipes;
- four main downpipes live on side/rear return geography;
- the courtyard handles principally its own open-to-sky catchment through an east/service-side accessible collector, a short straight primary route and an independent higher-level visible overflow route;
- no permanent roof hatch is selected in the RH-08 baseline.

These are architectural decisions even where the first executable fixture does not encode them.

### 3. RH-C0 / RH-C1 executable boundary

RH-C0 deliberately does not promote the full RH-08 water system into first-slice executable truth.

Its current schedule records:

- `RHCF-ROOF-FAMILY`: four very-low-slope fields, diagonal outer-corner→court-corner watersheds, falls outward — **PROVISIONAL_BUT_REPRESENTABLE**;
- `RHCF-ROOF-FALL`: approximately `1:40 class` outward — **PROVISIONAL_BUT_REPRESENTABLE**;
- `RHCF-ROOF-CATCH`: S/N approximately `26.5 m²`, W/E approximately `31.1 m²` — derived but **OUTSIDE_RH_C1**;
- `RHCF-COURT-DRAIN`: east-side accessible route + visible overflow — **OUTSIDE_RH_C1**.

That executable-slice boundary is intentional. DRW-07 must not misread `OUTSIDE_RH_C1` as architectural rejection, nor may it silently relabel those facts `CONTROLLED` inside the compiler.

## Frozen publication-view contract

The roof/drainage plan remains the `ESSENTIAL` DRW-07 view frozen by DRW-02D.

Its contract is:

- **view type:** orthographic roof/drainage plan;
- **orientation:** same model orientation as the controlled floor plans;
- **scale:** true `1:100`;
- **base geometry:** exact canonical shell and courtyard substrate;
- **roof geometry:** mixed authority; selected architectural relationships whose executable representation remains provisional where RH-C0 says so;
- **water geography:** show only source-owned topological/zone relationships where exact coordinates are absent;
- **failure reading:** preserve visible/outward failure routes, but reserve analytical consequence emphasis for the later DRW-10 roof-water/failure overlay;
- **page class:** `PLATE_PAIR` with the later roof-water/failure reading.

DRW-07B may harden a provenance-bearing publication source for this view. It may not promote legacy SVG coordinates or technical-design placeholders into architectural truth.

## Authority matrix

| Subject | Current authority | DRW-07 disposition | Consequence for DRW-07B |
| --- | --- | --- | --- |
| South/front orientation | canonical fixture coordinate convention | **Controlled** | Reuse exactly |
| Shell extent | `12,000 × 10,800 mm` | **Controlled** | Reuse exact plan substrate |
| Courtyard extent / placement | `3,600 × 4,000 mm`, centred | **Controlled** | Reuse exact plan substrate |
| Four-field roof topology | RH-08 R2 selected; RH-C0 `RHCF-ROOF-FAMILY` provisional | **Architecturally selected; executable representation provisional** | Encode with RH-08 + RH-C0 provenance; do not upgrade authority |
| Watershed relationship | outer corner → corresponding court corner | **Selected relationship; provisional representation** | Endpoints may be derived from exact shell/court geometry, but inherit roof-family provisional status |
| Fall direction | court edge → outer perimeter | **Selected relationship; provisional representation** | Encode one outward direction per field |
| Fall magnitude | `≈1:40 class` | **Provisional** | Preserve approximation; never present as finished-system specification |
| S/N plan catchment | `≈26.5 m²` each | **Derived coordination value; outside RH-C1** | May be recomputed/labelled as approximate plan catchment, not hydraulic sizing |
| W/E plan catchment | `≈31.1 m²` each | **Derived coordination value; outside RH-C1** | Same |
| Outer collection edge | open/inspectable collection at external perimeter | **Architecturally selected topology** | Represent external collection relation; no gutter section/profile invention |
| Gutter direction toward corners | each perimeter collection edge splits toward adjacent corners | **Architecturally selected relationship** | May show directional collection logic; exact falls/profile remain technical |
| Four main RWP occurrences | `RWP-SW / SE / NW / NE` | **Selected occurrences; exact point coordinates not source-authored** | Carry identity + side/rear-return zone, not pixel positions from legacy SVG |
| Principal-front RWP absence | no main downpipes across principal south/front field | **Selected exclusion** | Enforce absence on principal front |
| Individual RWP hydraulic size | none selected | **Absent / technical** | Do not draw diameter as selected fact |
| Roof-edge overflow detail | deliberate, visible outward overflow required | **Selected behaviour; geometry absent** | Carry failure behaviour/provenance; do not invent scupper/profile |
| Site discharge destination | no real site/soil/sewer strategy | **Absent / site-dependent** | Stop at accessible external collection/inspection geography |
| Courtyard open catchment | approximately `14.4 m²` + local wall runoff | **Controlled plan area; hydraulic consequence outside RH-C1** | Plan area can derive from court; do not invent runoff coefficient/design flow |
| Court primary collector | removable-grate linear collector / silt access toward east/service side | **Architecturally selected topology; exact geometry absent** | Encode east-side occurrence/role without importing legacy rectangle dimensions |
| Court primary route | short straight joint-minimised gravity route beneath east service/gallery strip to external service-side inspection | **Architecturally selected route relationship; outside RH-C1** | Encode route topology/host geography; exact centreline/depth/diameter absent |
| Court emergency overflow | separate higher-level inlet, independent straight conduit, visible east/service-side outlet | **Architecturally selected failure topology; exact geometry absent** | Encode independent route and visible-outlet relationship only |
| Court overflow level / pipe size | explicitly deferred | **Absent / technical** | Must remain unresolved |
| Courtyard threshold relationship | overflow before occupied-room threshold flooding | **Selected performance relationship; datums absent** | May be stated/annotated; no invented levels |
| Soil vent roof penetration | east/service roof field near outer service edge | **Selected service geography; exact point absent** | May carry qualitative zone occurrence if needed by view; no precise coordinate |
| MVHR / cooker terminals on roof | wall preferred/selected at current gate | **Selected roof absence** | Do not add roof terminals unless RH-08 is reopened |
| Chimney / rooflight / rooftop plant | none currently selected | **Controlled current absence** | Do not populate roof for visual completeness |
| Permanent roof hatch | explicitly rejected for current baseline | **Selected absence** | Do not add hatch/access symbol |
| Waterproofing / material family | deferred | **Absent / technical** | No material hatch implying a selected system |
| Exact gutter/coping/parapet profile | deferred | **Absent / technical** | No construction-style edge detail |
| Final hydraulic sizing / rainfall | deferred | **Absent / technical** | No pseudo-engineering dimensions or capacity claims |

## Deterministic geometry does not erase provenance

The four diagonal watershed lines are geometrically determinate once two things are combined:

1. exact controlled shell/courtyard corners; and
2. the RH-08 rule that each watershed joins the corresponding outer and courtyard corner.

That permits DRW-07B to derive exact endpoints mechanically. It does **not** promote the roof family from `PROVISIONAL_BUT_REPRESENTABLE` to controlled RH-C1 geometry.

The same rule applies to plan catchments. With the current base geometry the four trapezoids reproduce approximately:

- south: `26.52 m²`;
- north: `26.52 m²`;
- west: `31.08 m²`;
- east: `31.08 m²`.

Those values explain RH-08's rounded `≈26.5 / ≈31.1 m²` coordination figures. They remain plan-area proxies, not hydraulic design values.

## Outer collection and RWP authority

RH-08 owns the **topology** of the perimeter collection system, not a detailed gutter drawing.

DRW-07 may therefore show:

- collection on all four external roof edges;
- directional splitting toward adjacent corner-return downpipes;
- the four named RWP occurrences;
- the absence of a principal-front downpipe field;
- deliberate outward-visible overflow behaviour as a requirement.

It may not infer:

- gutter section or depth;
- outlet diameter;
- exact outlet coordinate from the inherited SVG;
- decorative hopper geometry;
- hidden transfer routes;
- a site drain connection.

The working RWP locations are zones/relationships: SW and SE just behind the principal front on side returns; NW and NE on rear/side-return geography. The legacy SVG's circles are diagrammatic placements, not survey coordinates.

## Courtyard water-route authority

The court-water system is architecturally decided more strongly than its RH-C1 encoding might suggest, but less strongly than the inherited SVG appears to suggest.

RH-08 selects:

- no primary roof catchment into the court;
- an accessible east/service-side primary collector;
- a short straight route beneath service/circulation geography;
- inspection/rodding from both ends;
- an independent higher-level overflow route;
- a visible external overflow outlet;
- abnormal water escaping by that route before occupied thresholds become the overflow path.

What remains absent is equally important:

- exact collector length/width;
- exact pipe centreline, depth, gradient or diameter;
- exact overflow inlet level;
- exact external discharge point/surface;
- final threshold datums;
- final site drainage destination.

DRW-07B must encode topology and authority separately so the renderer can show the route without fabricating those dimensions.

## Roof-service and access exclusions

A canonical roof plan must not accumulate generic roof furniture.

At the current gate:

- the soil vent is the only expected roof-level service penetration, with qualitative east/service-field geography;
- MVHR OA/EA and cooker extract remain wall-terminal decisions unless later competent design reopens RH-08;
- no chimney, rooflight or rooftop plant is selected;
- no permanent roof hatch is selected;
- permanent fall-arrest hardware is not authorised merely because a roof exists.

These negative facts are part of the roof architecture and should be protected by the source layer where useful.

## Legacy RH-08 SVG quarantine

`docs/reference-house/roof-drainage-plan-rh08.svg` is a coordination drawing and valuable evidence of RH-08 intent. It is **not** a canonical publication geometry source.

Specifically, DRW-07B must not lift from it as source truth:

- its `55 px/m` drawing transform;
- RWP circle centres/radii;
- collector rectangle dimensions;
- primary/overflow path pixel coordinates;
- terminal symbol coordinates;
- note-box geometry;
- typography or line weights.

Where the SVG corresponds to prose/source-owned relationships, DRW-07B must regenerate them from those relationships and canonical house geometry. Where prose supplies only qualitative geography, the publication source must keep it qualitative/provisional rather than laundering SVG pixels into millimetres.

## Relationship to the later DRW-10 failure overlay

DRW-07 owns the canonical roof/drainage substrate. DRW-10 owns the later analytical roof-water/failure reading.

DRW-07 therefore needs enough water geography to make the roof itself intelligible:

- fields;
- watersheds;
- falls;
- external collection;
- named collection/downpipe topology;
- courtyard primary and independent overflow routes.

It must not consume DRW-10's analytical task by adding speculative failure extents, damp zones, consequence shading, blocked-outlet scenarios or other invented event graphics. DRW-10 must reuse the DRW-07 substrate rather than create a parallel roof geometry.

## DRW-07B hardening requirements

DRW-07B is authorised to create a canonical provenance-bearing roof/drainage publication source only if it satisfies all of the following:

1. reuse exact canonical shell/courtyard geometry and orientation;
2. derive four roof-field polygons and outer-corner→court-corner watershed endpoints mechanically from canonical base geometry;
3. preserve roof-family and fall provenance as provisional where RH-C0 marks them provisional;
4. preserve the RH-08 selected outward-fall relationship and rejection of inward/internal collection;
5. encode outer collection topology without inventing gutter profiles;
6. encode `RWP-SW / SE / NW / NE` as named occurrences with qualitative/zone placement rather than false point precision;
7. encode the east/service-side courtyard primary route and independent visible overflow route as topology/host geography, not made-up pipe coordinates;
8. preserve explicit absence/technical status for site discharge, gutter sizes, pipe sizes, exact overflow levels, waterproofing/material build-up and threshold datums;
9. preserve the selected absence of principal-front RWPs, internal roof outlets and permanent roof hatch;
10. quarantine all legacy SVG pixel geometry from source hardening;
11. fail rather than invent a required exact point/line where the authority is only qualitative;
12. keep the canonical substrate suitable for reuse by DRW-10 without embedding the later analytical failure overlay into DRW-07.

## Audit conclusion

The essential roof/drainage view is sufficiently specified to proceed, but only as a provenance-aware mixed-authority drawing.

The source boundary is:

- **controlled base geometry:** shell, court and orientation;
- **architecturally selected relationships:** four outward-draining fields, diagonal watersheds, external collection, side/rear-return RWP topology, courtyard primary route, independent visible overflow, current roof-service/access exclusions;
- **provisional representation:** roof family itself in RH-C0, approximately 1:40 fall and all geometry deterministically derived from those provisional roof facts;
- **outside RH-C1 but architecturally source-owned:** catchment coordination and courtyard water-route topology;
- **absent / technical:** exact gutter/RWP/collector/pipe profiles and coordinates, hydraulic sizing, overflow level, waterproofing/build-up, site discharge and threshold detail.

That mixed boundary is the thing DRW-07B must encode. A neat roof diagram is not permission to make it more resolved than the project actually is.

## No-change declaration

DRW-07A changes no Reference House architecture, roof topology, drainage topology, executable source fact, drawing geometry, renderer, publication plate or inherited RH-08 coordination asset. It freezes source authority only.

## Handoff

**Next packet: DRW-07B — harden canonical roof/drainage publication source.**

DRW-07B must preserve the distinctions above before any controlled roof-plan scene or SVG is generated.
