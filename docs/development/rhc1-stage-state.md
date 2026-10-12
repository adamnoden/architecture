# RH-C1 Stage State

**Programme:** [`docs/computational/reference-house-executable-slice.md`](../computational/reference-house-executable-slice.md)  
**Fixture authority:** [`docs/reference-house/model-baseline-rhc0.md`](../reference-house/model-baseline-rhc0.md)  
**Issue:** #33  
**Status:** **IN PROGRESS — C1.1 model + C1.2 drawings + C1.3 parity pass locally; repository CI/merge still required**

This file is the restart-safe execution pointer for RH-C1. RH-C0 remains the architectural authority. RH-C1 is still a bounded one-fixture reproduction exercise; it does not establish compiler generality.

## C1.1 — semantic source and deterministic derivation

**State:** PASS in the executable slice.

Implemented under `compiler/reference-house/`:

- canonical RH-C0-authored source facts with explicit frozen/provisional disposition;
- millimetre / square-millimetre unit types at the source-calculation boundary;
- fixture-specific symbolic planning lines from which room reservations are derived;
- composite room reservations without duplicating derived polygons in source data;
- zero-thickness semantic boundaries, so RH-C1 does not invent a final wall construction thickness;
- front opening membership, host-boundary and host-space relationships;
- exact absence of numeric east/west courtyard opening centres;
- derived shell/court/ring areas and dimensions;
- derived levels and stair arithmetic;
- derived front axes and entrance centre;
- derived boundary lengths and opening areas/elevations where source authority exists;
- thickness-aware planning stress calculations without turning the wall range into source geometry;
- provisional roof-section fall relationship only;
- deterministic model diagnostics and replay.

P0 remains unchanged. RH-C1 is a sibling executable slice that reuses the existing simple geometry primitives rather than expanding P0 into a CAD model.

## Mutation coverage

The RH-C0 mutation map is now executable at the RH-C1 boundary:

| Mutation | C1.1 behaviour |
|---|---|
| M1 shell width −300 | centred court / areas / axes / openings propagate; fixed partition and levels stay fixed |
| M2a court width +400 | centred court / plate / room reservations propagate |
| M2b court depth +400 | geometry propagates; recorded stair-fit conflict returns `REVIEW`, no auto-repair |
| M3 wall stress 450→500 | stress clearances change; gross geometry does not |
| M4 first FFL +150 | stair + datum consequences derive; authored ceilings stay fixed |
| M5 risers 18→17 | `FAIL` because 3×6 authored grouping still totals 18 |
| M6 bay spacing 2700→3000 | axes/opening centres move; room geometry does not |
| M7 riser/service reduction | deliberately absent from RH-C1 source |
| M8 one major window +250 | occurrence width changes; bay centre remains fixed |
| M9 roof drainage reversed | only provisional roof relation changes in C1; no unrelated geometry repair |
| M10 plant reduction | deliberately absent from RH-C1 source |

The tests distinguish automatic propagation, explicit source-integrity failure, recorded architectural review, and intentionally unaffected/absent facts. They are not snapshot-only tests.

## Architectural boundaries protected by C1.1

- provisional planning splits remain explicitly provisional;
- the 400–425 mm wall family and 450 mm stress value remain metadata/calculation inputs, not final wall faces;
- stair strings, guards, exact well geometry and technical headroom remain absent;
- internal door positions/swings remain absent;
- plant/riser packing and service routes remain absent;
- exact east/west courtyard opening centres remain absent;
- structural, fire, acoustic, thermal, hygrothermal and regulatory adequacy are not promoted to compile booleans.

## C1.2 — deterministic drawing projections

**State:** PASS locally.

The compiled semantic result now generates:

1. `docs/reference-house/rhc1-ground-floor.svg`;
2. `docs/reference-house/rhc1-first-floor.svg`;
3. `docs/reference-house/rhc1-principal-section.svg`.

World/model geometry, projection and SVG drawing conventions are separate. Plan semantic objects carry stable `data-entity` identity. The generator refuses a `FAIL` compile; a `REVIEW` projection remains explicitly marked.

## C1.3 — drawing parity / supersession

**State:** PASS locally.

See [`docs/reference-house/rhc1-drawing-parity-result.md`](../reference-house/rhc1-drawing-parity-result.md). The generated plans/section reproduce the controlled C1 architecture without tracing comparator SVG paths. The three RH-C0 plan/section comparators are demoted to historical C0 comparison provenance; the generated C1 files become the current projections, while `model-baseline-rhc0.md` remains source authority.

## Remaining closeout

- run the full repository test/build path in GitHub CI;
- repair any integration-only failure without broadening scope;
- record the passing commit;
- close #33 only after CI and repository state agree;
- leave #35 / CF-01 as the next blocked-then-ready generality gate.

## Assumptions deliberately deferred to CF-01

Do not generalise these during RH-C1 merely because the current fixture uses them:

- centred internal void/courtyard;
- two-storey organisation;
- regular four-bay front field;
- three-flight 3×6 stair topology;
- composite west-room reservation shape;
- G-01-derived opening memberships/order.

CF-01 remains the post-RH-C1 gate for discovering which of these implementation conveniences need genuine generalisation.
