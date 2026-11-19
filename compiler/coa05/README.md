# COA-05 — topology successor views

**Gate:** COA-05  
**Status:** PASS — accepted in the [completed COA programme](../../docs/computational/compiler-output-architecture-programme.md)\
**Starting main:** `5f76fc014c4754939afecb3e0cdd733d6bbc5e71`  
**Issue:** #95  
**Authority effect:** none

## Question

Which compiled topologies genuinely benefit from a diagram, and can those diagrams share the same orientation and uncertainty rules as the architectural plans?

## Decision

The structural topology does. It is metric, plan-bound and materially easier to inspect graphically. The service and boundary topologies do not need another general-purpose SVG merely for symmetry: their detailed content is already clearer in the COA-02 generated registers.

A future publication figure may selectively diagram service continuity or drainage ownership, but COA does not manufacture those graphics without a demonstrated inspection need.

## Structural successor

`renderReferenceHouseStructuralInspection()` generates `docs/reference-house/generated/first-floor-structure.svg` from the same canonical single-pass Reference House output context used by the COA plan/section set.

The successor structural view:

- uses the shared north-up plan projection;
- therefore places `F-N` visually north/up and `F-S` south/down, fixing the historical RH-C2 orientation defect;
- shows the shell/courtyard only as light plan context;
- distinguishes provisional bearing lines, edge beams and reaction nodes;
- renders span axes with arrowheads at both ends because the model owns an axis, not a one-way load direction;
- lists `ST-01` and `PEN-SV-01` as interruption obligations at their owned precision without placing invented openings in plan;
- keeps semantic IDs and the canonical compile fingerprint inspectable;
- retains the explicit structural adequacy boundary.

## Service and boundary decision

No replacement table-as-SVG is created.

- service topology remains primarily `service-register.md`;
- boundary topology remains primarily `boundary-register.md`;
- spatial companions are deferred unless a concrete question cannot be answered efficiently from those reports.

This is deliberate asymmetry. Output medium follows information character, not compiler-domain symmetry.

## Preservation

The CH-frozen `rhc2-structural-topology.svg`, `rhc3-service-topology.svg` and `rhc4-boundary-topology.svg` remain historical evidence and are not edited.

No structural capacity, member sizing, foundation adequacy, service performance, drainage capacity or building-physics claim is added.

**Historical handoff:** [COA-06 — integration, docs surface and closeout](../coa06/README.md), subsequently completed as the final COA gate.
