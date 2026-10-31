<!-- nav-exclude: redirect -->
# DRW-09C — 3D clipping, visibility ordering and line-role cleanup

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-09C  
**Issue:** #154  
**Status:** IMPLEMENTED — PENDING EXACT-HEAD VALIDATION

## Outcome

DRW-09C adds the minimum generic visibility/section-processing layer needed between DRW-09B model geometry and the later Reference House scene.

The new `visibility-3d.ts` module provides:

- clipping of one polygonal face against one axis-aligned half-space;
- stable face normals from caller-owned winding;
- explicit front-facing tests against a supplied object-to-viewer direction;
- deterministic back-to-front face ordering using DRW-09B projected depth;
- topology-owned projected-edge cleanup that keeps the strongest architectural line role.

The module remains generic. It has no Reference House coordinates or architectural decisions.

## Cut-plane contract

`clipModelFaceByAxisPlane` uses exact caller-supplied model coordinates and an explicit half-space:

- axis `x / y / z`;
- finite plane coordinate;
- keep `greater-or-equal` or `less-or-equal`.

It preserves polygon winding through ordinary half-space clipping.

It does **not** create a new sectional cap, poche or architectural cut face. A later scene builder must decide which solids/surfaces actually possess material on the cut plane. This prevents generic geometry code from manufacturing construction where only surface authority exists.

Faces wholly outside the retained half-space disappear; faces wholly inside are retained; crossing edges receive deterministic linear intersections.

## Face visibility contract

`faceNormal3D` derives a unit normal from caller-owned vertex winding and refuses degenerate faces.

`isFaceFrontFacing3D` answers one bounded question only: does that outward normal face the supplied viewer direction?

It does not claim hidden-line removal for an arbitrary mesh, resolve mutual occlusion or reinterpret winding. Those remain caller/model responsibilities.

`orderFacesBackToFront3D` supplies deterministic painter order using mean projected depth, with stable face-id tie breaks. Larger depth remains closer to the viewer under the DRW-09B projection contract.

## Projected line cleanup

Architectural line hierarchy remains semantic rather than inferred from geometric coincidence.

A projected edge candidate therefore carries a **stable topology-owned `edgeId`** and an explicit role:

`secondary < primary < profile < cut`

Repeated candidates with the same topology id may collapse to one line, promoting the strongest role. Reversed endpoint order is accepted.

The helper deliberately does **not** merge lines merely because their coordinates are close. Proximity is not topological authority. If the same edge id is reused for different projected geometry the operation fails.

## Deliberate exclusions

DRW-09C still does not add:

- Reference House mesh/scene construction;
- cut-surface material generation;
- full hidden-line/occlusion solving;
- perspective;
- paper fitting or physical composition;
- NTS `DrawingScene` / SVG semantics;
- polygon/fill primitives in the drawing serializer;
- labels or architectural annotation;
- the controlled axonometric SVG.

## Tests

The packet proves:

- a crossing polygon clips exactly against an axis plane;
- fully excluded geometry returns no face;
- extrusion winding yields expected top/bottom normals and facing state;
- painter order follows explicit projection depth with deterministic ties;
- duplicate semantic edges promote to the strongest architectural line role;
- one semantic edge id cannot silently collapse distinct geometry.

## Handoff

The generic geometry stack is now sufficient for DRW-09D to attempt the actual Reference House sectional axonometric.

DRW-09D must continue to obey DRW-08F / DRW-09A source limits. In particular, generic clipping capability is not permission to create wall thickness, complete aperture solids, MEP geometry or other missing source facts.

**Next authorised packet:** DRW-09D — generate and architecturally review the sectional axonometric.
