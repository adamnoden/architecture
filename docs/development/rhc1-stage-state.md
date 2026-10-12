# RH-C1 Stage State

**Programme:** [`docs/computational/reference-house-executable-slice.md`](../computational/reference-house-executable-slice.md)  
**Fixture authority:** [`docs/reference-house/model-baseline-rhc0.md`](../reference-house/model-baseline-rhc0.md)  
**Issue:** #33  
**Status:** **PASS — merged in `4d2df89caf76d0ca98bd4bd98ca4fe36fb9db175`; model, mutation suite, generated drawings, parity and full repository CI passed**

RH-C1 is complete at its bounded one-fixture scope. RH-C0 remains the architectural authority. RH-C1 establishes Reference House fixture fidelity and dependency correctness; it does not establish compiler generality.

## C1.1 — semantic source and deterministic derivation

**State:** PASS.

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

The RH-C0 mutation map is executable at the RH-C1 boundary:

| Mutation | RH-C1 behaviour |
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

## Architectural boundaries protected

- provisional planning splits remain explicitly provisional;
- the 400–425 mm wall family and 450 mm stress value remain metadata/calculation inputs, not final wall faces;
- stair strings, guards, exact well geometry and technical headroom remain absent;
- internal door positions/swings remain absent;
- plant/riser packing and service routes remain absent;
- exact east/west courtyard opening centres remain absent;
- structural, fire, acoustic, thermal, hygrothermal and regulatory adequacy are not promoted to compile booleans.

## C1.2 — deterministic drawing projections

**State:** PASS.

The compiled semantic result generates:

1. `docs/reference-house/rhc1-ground-floor.svg`;
2. `docs/reference-house/rhc1-first-floor.svg`;
3. `docs/reference-house/rhc1-principal-section.svg`.

World/model geometry, projection and SVG drawing conventions are separate. Plan semantic objects carry stable `data-entity` identity. The generator refuses a `FAIL` compile; a `REVIEW` projection remains explicitly marked.

## C1.3 — drawing parity / supersession

**State:** PASS.

See [`docs/reference-house/rhc1-drawing-parity-result.md`](../reference-house/rhc1-drawing-parity-result.md). The generated plans/section reproduce the controlled C1 architecture without tracing comparator SVG paths. The three RH-C0 plan/section comparators are historical C0 comparison provenance; the generated C1 files are the current projections, while `model-baseline-rhc0.md` remains source authority.

## Verification record

The executable suite passes:

- P0: **17/17**;
- PAT-XW-01: **6/6**;
- RH-C1: **27/27**.

PR #37 full validation also passed repository integrity, public-route integrity, publication validation and the VitePress documentation build on implementation head `ff773849f8e293ff664b1d858c2e62c0e8b386e4`; the final closeout head `330e7bc0d0eda6a0ec33b51afed09c733c2dd4bd` passed the same validation before merge.

The CI exercise exposed two pre-existing integration drifts outside the compiler itself: incomplete curated-navigation classification and a Primer adapter still coupled to retired Reference House headings. Both were repaired without changing architectural authority or broadening RH-C1.

## Gate consequence

RH-C1 proves:

```text
Reference House reproduction = fixture fidelity
RH-C0/RH-C1 mutation suite    = dependency correctness
```

It does **not** prove bounded generality. That remains the purpose of CF-01.

## Next gate — CF-01

Issue #35 is now the next executable task: challenge the actual RH-C1 implementation with one deliberately unlike, cheap contrast fixture before RH-C2 begins.

Do not start RH-C2 structure until CF-01 passes.

## Assumptions deliberately deferred to CF-01

Attack these as implementation assumptions rather than generalising them pre-emptively:

- centred internal void/courtyard;
- two-storey organisation;
- regular four-bay front field;
- three-flight 3×6 stair topology;
- composite west-room reservation shape;
- G-01-derived opening memberships/order.

CF-01 should discover which of these actually require generalisation from the code that now exists.
