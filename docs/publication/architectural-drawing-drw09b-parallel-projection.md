<!-- nav-exclude: redirect -->
# DRW-09B — XYZ extrusion and parallel-projection kernel

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-09B  
**Issue:** #154  
**Status:** IMPLEMENTED — PENDING EXACT-HEAD VALIDATION

## Outcome

DRW-09B adds the minimum generic 3D geometry capability required by the admitted sectional axonometric and nothing more.

The new module `compiler/publication-drawing/projection-3d.ts` provides:

- finite XYZ model points;
- explicit orthonormal right-handed projection bases;
- deterministic parallel projection into horizontal / vertical / depth coordinates;
- deterministic Z extrusion of a caller-owned counter-clockwise plan polygon into bottom, top and side faces.

It does **not** know about the Reference House.

## Boundary

This packet deliberately stops before drawing logic.

It does not add:

- perspective;
- camera focal length or field of view;
- fit-to-box behaviour;
- paper-space scaling;
- `DrawingScene` changes;
- NTS SVG semantics;
- clipping against the DRW-09A cut plane;
- hidden-face removal or back-face culling;
- face sorting;
- silhouette / cut / beyond-line cleanup;
- polygons to the SVG serializer;
- Reference House mesh/scene generation.

Those are later obligations only where the admitted drawing proves they are required.

## Projection contract

A caller supplies three unit, mutually orthogonal vectors:

- horizontal screen basis;
- vertical screen basis;
- object-to-viewer depth direction.

The basis must be right-handed:

`horizontal × vertical = viewDirection`

The module refuses malformed bases rather than normalising or repairing them invisibly.

Projection is a dot-product transform around an explicit model origin:

- `horizontal = Δp · horizontalBasis`;
- `vertical = Δp · verticalBasis`;
- `depth = Δp · viewDirection`.

No perspective term exists. Two points separated only along the view direction therefore project to the same 2D location while retaining different depth values.

That property is directly tested.

## Extrusion contract

`extrudePlanPolygonZ` accepts a caller-owned plan polygon and two Z datums.

The function:

- requires at least three finite vertices;
- requires `z1 > z0`;
- assumes caller-supplied counter-clockwise plan order when viewed from +Z;
- returns faces in deterministic order: bottom, top, then one side face per plan edge;
- preserves every face.

It does not decide whether a face is visible, cut, hidden or drawable. That remains DRW-09C.

## Why this is not a CAD kernel

The new capability is intentionally small. It exists because the frozen DRW-09A view needs deterministic source-to-projection geometry. It does not introduce solids, booleans, arbitrary transforms, tolerances, BIM objects, scene graphs or general modelling operations.

The architecture remains upstream. This module merely makes already-owned XYZ relationships projectable and inspectable.

## Checks

`projection-3d.test.ts` proves:

- malformed / left-handed bases are rejected;
- the standard isometric basis has equal axis foreshortening;
- displacement along the view direction changes depth without changing projected position;
- projection origins are deterministic;
- polygon extrusion produces the expected complete face family in stable order;
- invalid extrusion inputs fail rather than being repaired.

## Handoff

**Next authorised packet: DRW-09C — minimum cut-plane clipping, face ordering/culling and projected line-role cleanup.**

DRW-09C may consume this kernel but may not yet generate the final Reference House artifact or compose the spread.
