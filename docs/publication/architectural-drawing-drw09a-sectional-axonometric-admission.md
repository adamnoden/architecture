<!-- nav-exclude: redirect -->
# DRW-09A — Sectional axonometric admission, cut and projection freeze

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-09A  
**Issue:** #154  
**Status:** ADMITTED — BOUNDED SYNTHESIS, PENDING EXACT-HEAD VALIDATION

## Question

Does the optional sectional axonometric now earn its place after the orthographic family has been frozen, and can it be made from existing authority without silently completing missing architecture in three dimensions?

## Decision

**Yes, narrowly.**

The view earns admission because one sectional parallel projection can make several already-established relationships appreciably easier to grasp at once:

- the courtyard as a vertical void rather than merely a hole in plan;
- the shallow west, north and east occupied/service bands around it;
- the two-storey vertical order and inter-storey relationship;
- the concentration of high-service geography on the east flank;
- the outward roof family over the same spatial order;
- the distinction between long-life architectural support/enclosure and faster-changing components without pretending to own construction-detail thicknesses.

It remains a **synthesis view**, not evidence required to establish any new claim. No manuscript proposition may depend on the axonometric alone.

## Why admission is not automatic

DRW-02D classified the view `OPTIONAL`. DRW-08F then exposed the exact danger that a 3D view creates: plan, section and elevation may each contain bounded provisional proxies that are valid only in their own view. Combining a provisional plan width with a provisional sectional height and a qualitative elevation occurrence would create false three-dimensional certainty.

DRW-09A therefore admits the view only under the DRW-08F non-composability rule.

## Hero cut

The cut is frozen at the **controlled south courtyard edge**:

> **Y = 3,400 mm; retain Y ≥ 3,400 mm.**

The coordinate is not an aesthetic guess. It is derived directly from the centred 3.6 × 4.0 m controlled courtyard inside the 12.0 × 10.8 m shell.

This cut is preferred to an arbitrary oblique or mid-room cut because it:

- opens the courtyard immediately to the viewer;
- exposes west-room, courtyard and east gallery/service bands on one architectural section edge;
- leaves the northern half of the house present so the garden/dining/kitchen and service relationships retain depth;
- avoids cutting through the court merely for graphic drama;
- is reproducible from controlled geometry.

No second cut plane is authorised in DRW-09A.

## Projection

The drawing uses a **deterministic parallel isometric projection**, viewed from the **south-east and above**.

World coordinates remain the Reference House convention:

- +X = east;
- +Y = north;
- +Z = up.

The frozen orthonormal projection basis is:

- screen horizontal: `(1, 1, 0) / √2`;
- screen vertical-up: `(-1, 1, 2) / √6`;
- object-to-viewer depth direction: `(1, -1, 1) / √3`.

The basis is right-handed: `horizontal × vertical = view direction`.

This gives equal-axis isometric foreshortening, no vanishing points and no perspective completion. The view is explicitly **NTS**. Any later paper-space fit is editorial composition, not an architectural scale claim.

## What existing source is sufficient for

No new architectural source hardening is required before renderer work for the admitted scope.

Existing authority can support:

### Controlled geometry

- 12.0 × 10.8 m shell;
- 3.6 × 4.0 m centred courtyard;
- controlled court extents;
- ground and first-floor level datums;
- exact service-side field extents derived from the court;
- controlled space topology where already frozen.

### Provisional but representable geometry

- the selected four-field outward-draining roof family;
- current architectural wall-planning / inter-storey reservations where a later packet explicitly marks them provisional;
- the bounded `SV-01` service reservation where represented as capacity/geography rather than packed MEP design.

### Semantic architectural order

The current technical coordination already states:

- permanent masonry external and courtyard boundaries are the primary long-life structural/support family;
- first-floor structure spans between those permanent lines;
- windows are replaceable assemblies in permanent openings;
- removable trim and optional replaceable linings are faster-changing layers;
- principal active service intensity is concentrated on the east flank.

Those distinctions may be annotated. They do **not** create construction-detail thicknesses or fully modelled assemblies.

## What the axonometric may not invent

The admitted view does not own:

- construction-layer thicknesses beyond already authorised bounded planning geometry;
- complete window or door solids assembled from unrelated view-local proxies;
- exact frame/jamb/head/sill/threshold construction;
- exact service terminal points;
- plant-product geometry;
- pipe, duct or cable centrelines;
- product-specific structural members, connections or foundations;
- furniture, people, vegetation or atmospheric incidentals;
- real-site context.

### Replaceable-layer rule

“Permanent versus changeable” is allowed as **semantic annotation and hierarchy only** at DRW-09.

The drawing may distinguish the permanent masonry/support order from serviceable or replaceable components where source authority already says such a distinction exists. It may not explode or spatialise a removable lining, frame interface or trim layer at an invented thickness merely to make the thesis visually legible.

### Opening rule

An opening may appear as genuinely three-dimensional geometry only if the dimensions needed for that 3D occurrence are owned together by one admissible source family.

DRW-09 may not construct a 3D aperture by taking width from a plan proxy, sill/head from a section proxy and occurrence identity from an elevation whose aperture geometry is absent.

Where that condition is not met, omit the aperture solid or retain only an authority-honest line/annotation.

## Reader value test

The axonometric earns its conditional spread because the frozen orthographics require the reader to mentally combine at least four different views to understand the same simultaneous relationship:

1. courtyard void and shallow-band morphology;
2. vertical storey order;
3. east-side service concentration;
4. outward roof organisation.

One parallel sectional synthesis can reduce that reconstruction cost without becoming a substitute for the orthographics.

This value is sufficient to admit the view, but not sufficient to relax source authority.

## Publication position

DRW-02E's conditional slot is retained:

- **after Section 17 core orthographic/analytical evidence**;
- **before Section 18 future-maintenance scenarios**;
- page class: `PLATE_SPREAD`;
- scale: `NTS`;
- no unique claim;
- no decorative blank or extra page reserved until DRW-09E proves the actual composition.

## Renderer handoff

DRW-09B is authorised to add only the generic geometry needed to project controlled XYZ geometry through this frozen parallel basis and to create deterministic extruded/prismatic source geometry.

It is **not** authorised yet to add:

- cut-plane clipping;
- hidden-face removal / culling;
- face ordering;
- projected line-role cleanup;
- a Reference House axonometric scene;
- SVG artifact generation;
- spread composition.

Those remain DRW-09C onward.

The existing 2D `DrawingScene` also assumes a numerical architectural scale. Because this view is NTS, later scene/artifact work must represent NTS truthfully rather than smuggling in a false scale denominator. DRW-09A records that renderer obligation but does not broaden this packet to solve it.

## Gate result

**PASS — optional sectional axonometric admitted as a bounded NTS synthesis view.**

No architectural source hardening is required for the admitted scope. If DRW-09D later finds that architectural legibility depends on any explicitly absent 3D geometry, the correct result is to omit that layer, narrow the drawing, or split an owning source packet—not to infer it.

**Next authorised packet:** DRW-09B — minimum XYZ/extrusion and deterministic parallel-projection capability.
