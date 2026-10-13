# Computational Track

The computational track asks a narrow question within House Kernel: **which building relationships can be represented strongly enough that invalid arrangements, unresolved obligations or missing evidence are exposed during authoring rather than discovered later in drawings or construction?**

It is subordinate to the architecture. Rooms, walls, openings, structure, boundaries, service routes and maintenance paths may be represented semantically where doing so creates a useful check, but architectural judgement is not converted into arbitrary machine rules merely to make the model more complete.

The paper-compilation programme, Phase-8 pattern crosswalk, P0 executable kernel, `PAT-XW-01`, RH-C0 model freeze, RH-C1 deterministic fixture, CF-01 contrast-fixture gate, RH-C2 structural view, RH-C3 service view and RH-C4 envelope/boundary view have now completed at their stated internal scopes.

## Active computational work

**RH-C5 — selected target calculations — is next.**

RH-C4 now represents and falsifies the already-coordinated RH-08/RH-09/RH-10 envelope topology over the same architectural → structural → service source chain. It keeps weather, air, thermal and moisture as independent boundary systems rather than collapsing them into a generic wall property; carries outer/courtyard/roof/ground interfaces; turns numeric and deliberately qualitative openings into explicit obligations; carries selected service penetrations into boundary reinstatement; and represents roof/courtyard rainwater routes directionally.

A late C4 red-team recovered `PEN-CD-01` from the canonical crossing register so the courtyard primary drain and independent emergency overflow cannot become anonymous boundary crossings.

The proof boundary remains narrow:

```text
ENVELOPE / BOUNDARY TOPOLOGY  MACHINE-CHECKED
BUILDING-PHYSICS PERFORMANCE   EXTERNAL — NOT PROVED
```

Current executable suites:

```text
P0                         17 / 17 PASS
PAT-XW-01                   6 /  6 PASS
RH-C1                      27 / 27 PASS
CF-01                       7 /  7 PASS
RH-C2                      17 / 17 PASS
RH-C3                      21 / 21 PASS
RH-C4                      29 / 29 PASS
```

Canonical sequence:

```text
RH-C0 — model freeze                    PASS
  ↓
RH-C1 — deterministic Reference House  PASS
  ↓
CF-01 — adversarial contrast fixture   PASS
  ↓
RH-C2 — bounded structural view        PASS
  ↓
RH-C3 — bounded service view           PASS
  ↓
RH-C4 — envelope / boundary view       PASS
  ↓
RH-C5 — selected target calculations   NEXT
```

Programme records:

- [RH-C0 — Reference House Model Freeze](reference-house-model-freeze-rhc0.md)
- [Reference House executable programme — RH-C1 through RH-C4](reference-house-executable-slice.md)
- [CF-01 — Compiler Generality Assurance](compiler-generality-assurance-cf01.md)
- [RH-C1 drawing parity result](../reference-house/rhc1-drawing-parity-result.md)

The Reference House remains a **controlled regression fixture**, not a universal House Kernel template. The CF-01 contrast house is an adversarial test fixture, not a second design proposal.

## What has been established

The executable work now demonstrates, at deliberately bounded internal scope, that:

- semantic identity, typed relationships, obligations and scoped evidence can remain coherent from component to whole-house scale;
- pattern provenance can inform authoring without becoming compiler ontology or technical authority;
- simple source/geometry well-formedness can be checked deterministically;
- one architectural source can drive derived calculations and deterministic projections without parallel authored geometry;
- mutation tests can distinguish propagation, source-integrity failure, architectural `REVIEW` and deliberate absence;
- shared plan semantics can operate across two materially unlike fixtures without fixture-ID branching;
- structural topology can be checked for support continuity, span/support coherence, reaction geometry, interruptions, diaphragm ownership and represented gravity handoff without claiming structural adequacy;
- service topology can be checked for network continuity, route/crossing ownership, primary-service geography, maintenance access and structural-crossing coordination without inventing MEP sizing or exact routing;
- envelope topology can keep weather, air, thermal and moisture as independent systems across outer walls, courtyard walls, roof and ground-interface handoffs;
- numeric **and qualitative** enclosure openings can remain visible as boundary obligations without manufacturing missing geometry;
- selected service penetrations can derive boundary-reinstatement obligations rather than disappearing between service and envelope abstractions;
- four outward roof catchments can derive from canonical shell/courtyard geometry and close to the **115.2 m²** enclosed plate;
- courtyard primary drainage and independent visible emergency overflow can remain distinct and owned by the canonical `PEN-CD-01` occurrence;
- critical slow-envelope functions can be prevented from migrating onto routinely removable trim/lining layers.

These results do **not** establish that the building is structurally, environmentally, regulatorily or MEP-adequate. Building release remains outside the demonstrated scope.

## Authority boundary

The computational model has a deliberately limited authority.

- **A pattern is not a compiler primitive.**
- **Pattern provenance is not technical authority.**
- **An architectural grammar is not owned by the compiler.**
- **Representability is not evidence of adequacy.**
- **A research compile is not a building-release certificate.**
- **Architectural judgement remains architectural where no legitimate deterministic rule exists.**

A `PASS` in C2, C3 or C4 means the represented topology is internally coherent at the declared scope. It does not prove physical performance.

## Core executable layers

- `compiler/plan-slice/` — orthogonal plan semantics, spaces/voids, boundaries, openings, adjacency and plate closure.
- `compiler/structure-slice/` + `compiler/rhc2/` — line supports, span fields, reactions, interruptions, diaphragm ownership and qualitative foundation handoff.
- `compiler/service-slice/` + `compiler/rhc3/` — semantic service nodes/routes/networks, access obligations and registered crossings.
- `compiler/boundary-slice/` + `compiler/rhc4/` — independent weather/air/thermal/moisture carriers, typed opening/penetration transitions, registered boundary occurrences and directional drainage routes.

These are semantic/control layers, not general CAD/BIM, FE, MEP-routing or building-physics engines.

Core conceptual records:

- [Executable Architecture](executable-architecture.md)
- [Formal Architectural Model](formal-architectural-model.md)
- [Validity and Obligations](validity-and-obligations.md)
- [Evidence and Provenance Architecture](evidence-and-provenance.md)
- [Compiler Targets](compiler-targets.md)
- [Structural Semantics](structural-semantics.md)
- [Boundary Semantics](boundary-semantics.md)
- [Interface Obligation Bundles](interface-obligation-bundles.md)

## Relationship to architectural grammar

Architectural grammar remains a separate layer. G-01-derived bay/opening facts are fixture inputs where needed; they are not compiler defaults. CF-01 demonstrated that the shared plan layer does not require Georgian composition. C2–C4 consume relevant architectural relationships without promoting G-01, the courtyard, masonry, ASHP, MVHR or any other Reference House choice into House Kernel doctrine.

## Evidence and external review

The compiler retains three broad discharge modes:

1. deterministic calculation where method and authority are explicit;
2. a bounded supported rule/calculation family only after its proof domain is established;
3. external evidence from competent engineering, MEP, building physics, fire/building-control, product evidence or physical testing.

The RH-11 external-review briefs and physical prototype programme remain independent evidence tracks. C2–C4 do not discharge them.

## RH-C5 gate

RH-C5 may now consider **selected target calculations only**. Every candidate needs:

- explicit source inputs;
- a named/versioned rule or calculation method;
- declared supported-domain limits;
- deterministic failure/unsupported behaviour;
- an explicit statement of what the result does and does not prove;
- tests against the Reference House without turning project taste into a general rule.

C5 must not become a monolithic `isBuildingRegulationsCompliant()` function or an excuse to rebuild specialist software without a strong architectural and evidentiary case.

The P0, `PAT-XW-01`, RH-C1, CF-01 and RH-C2–C4 suites remain regression gates. Physical validation and competent professional review proceed independently.
