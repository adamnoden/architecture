# CH-06 — strengthen the kinds of tests

**Gate:** CH-06  
**Status:** PASS — merged-main validation recorded in the [programme closeout](../../docs/computational/compiler-hardening-programme.md)\
**Starting main:** `57e9cc84b5c031794cbdd758db9141bc1befc63f`  
**Issue:** #65  
**Computational maturity:** M3  
**Reference House capability:** RH-C0 through RH-C5 remain closed; no RH-C6

## Question

Do the tests establish durable laws and meaningful failure properties of the compiler machinery rather than only a growing collection of selected examples, without allowing test infrastructure to become larger or more speculative than the compiler itself?

## Audit

The existing test surface is already strong in selected examples and adversarial mutations. CH-06 therefore does not rewrite historical gates into a common abstraction.

| Existing surface | Main evidence kind | CH-06 judgement |
|---|---|---|
| P0 / PAT-XW-01 | canonical examples, semantic mutations, selective invalidation, deterministic replay | preserve as historical regression/adversarial evidence |
| RH-C1 | canonical Reference House architectural projection and drawing parity | preserve |
| CF-01 | bounded second-fixture genericity challenge | preserve |
| RH-C2 | structural topology examples and semantic mutations | preserve |
| RH-C3 | service topology, coordination hardening and mutations | preserve |
| RH-C4 | boundary/envelope topology, occurrence and coordination mutations | preserve |
| RH-C5 | selected calculation examples, inclusive-boundary checks, malformed evidence and upstream status preservation | preserve |
| CH-00 | exact semantic/artefact regression baseline | preserve |
| CH-01 | fail-closed malformed-source contracts | preserve |
| CH-02 | dependency-law enforcement | preserve |
| CH-03 | single-pass/equivalence contract | preserve |
| CH-04 | representation, unit/tolerance and source-immutability contracts | preserve |
| CH-05 | semantic identity, determinism, permutation metamorphisms and lineage | preserve |

The clearest gaps were small pure kernels whose behaviour is governed by reusable laws but was mainly exercised indirectly through selected fixtures:

1. shared box geometry;
2. calculation criterion/aggregate semantics;
3. service-network connectivity and source-order independence.

These are the CH-06 targets.

## Added evidence

### Geometry laws

`compiler/ch06/ch06.test.ts` uses a fixed-seed deterministic generator over 512 pairs of valid integer-coordinate boxes. It checks:

- overlap symmetry;
- intersection symmetry;
- adjacency symmetry;
- self-containment;
- non-negative overlap and overlap upper bounds;
- positive overlap implies intersection;
- adjacency implies intersection;
- translation invariance for overlap, intersection, adjacency and containment.

A separate exact boundary test pins behaviour around `BOX_GEOMETRY_EPSILON` without changing its established value.

`compiler/ch06/geometry-positive.test.ts` adds 256 constructed positive cases so the suite cannot be satisfied by trivial always-false/zero implementations. It proves that:

- self-overlap equals box area;
- a strict generated child is contained by its parent but not vice versa;
- an exact shared edge is adjacent and intersecting but has zero overlap area;
- those positive relationships survive common translation.

### Calculation-kernel laws

A synthetic method isolates the generic calculation kernel from Reference House authority. The gate exhaustively checks all 125 combinations of five evidence states across three criteria:

- pass;
- fail;
- missing;
- non-finite;
- wrong unit.

Each combination is run under all six criterion permutations. Aggregate status must obey the existing contract:

`UNSUPPORTED > FAIL > PASS`

The gate also generates 256 deterministic inclusive-range / maximum criteria and proves exact-boundary inclusion plus immediate outside-boundary rejection. This generalises the specific RH-C5 stair examples without changing them.

### Service-connectivity metamorphisms

A minimal three-node / two-bridge generic service network proves:

- node order is irrelevant;
- route order is irrelevant;
- required-node order is irrelevant;
- network route-ID order is irrelevant;
- removing either required bridge disconnects the required nodes;
- retaining a route in source while excluding it from the network route set also disconnects the required nodes.

This attacks the connectivity algorithm directly without creating an arbitrary-house/service-network generator.

## Tooling decision

### Property-testing framework — not adopted

No third-party property-testing dependency is justified at this scale. The relevant kernels are small; fixed-seed bounded generation in ordinary `node:test` expresses the laws directly, produces replayable case indices, and adds no framework lifecycle or DSL.

If CH-06 later discovers shrinking/replay needs that the local generator cannot handle economically, this decision can be revisited. Framework adoption is not itself evidence.

### Automated mutation-testing framework — not adopted

No mutation-testing package is introduced. Installing and configuring a mutation runner would add a toolchain and execution surface larger than the current critical kernels, while CH-07 explicitly owns broad toolchain ergonomics. CH-06 instead targets mutation-sensitive laws directly: symmetry operators, comparison boundaries, positive/negative geometry constructions, aggregate precedence, and graph-bridge connectivity are all assertions that common meaningful implementation mutations would violate.

Mutation score is not a project KPI. This is a cost/benefit decision, not a claim that automated mutation testing has no value.

### Coverage target — rejected

Coverage percentages are not used as an exit criterion. No test is added solely to execute a line.

## Preservation boundary

CH-06 introduces no intended production semantic change. It must preserve:

- `createReferenceHouseSource()` authority;
- `compileReferenceHouseSystem(source)` as canonical production path;
- CH-00 frozen values/statuses/diagnostics/proofs and six SVG identities;
- CH-01 fail-closed behaviour;
- CH-02 runtime dependency boundary;
- CH-03 single-pass/equivalence contract;
- CH-04 ID/unit/tolerance/readonly/immutability contracts;
- CH-05 identity schema `HK-RH-COMPILE-1`, fingerprints, manifests, lineage and artefact linkage;
- CF-01 and RH-C2 through RH-C5 meanings;
- runtime calculation outcomes;
- generated drawings as downstream projections;
- computational maturity M3;
- no RH-C6.

If a stronger law test falsifies one of those assumptions, the correct response is to investigate the semantic assumption rather than weaken the test automatically.

## Validation

The strengthened exact PR head passed repository validation in GitHub Actions run `38468759439`, including `test:ch06`, all earlier CH gates, the existing Reference House/generic regression suites and publication validation. No production compiler file changed to obtain the pass.

Merged-main repository/PDF/docs/Pages validation subsequently passed; the [owning programme result](../../docs/computational/compiler-hardening-programme.md) records the final PR and merged-main runs.

## Exit

CH-06 has materially stronger law/property/metamorphic evidence over selected critical kernels; generated evidence is deterministic and replayable; historical example/adversarial tests remain intact; no new testing framework or coverage KPI was introduced; and no production semantics or proof boundary changed. Its historical handoff was [CH-07 — toolchain and developer ergonomics](../ch07/README.md), subsequently completed.
