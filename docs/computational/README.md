# Computational Track

The computational track asks a narrow question within House Kernel: **which building relationships can be represented strongly enough that invalid arrangements, unresolved obligations or missing evidence are exposed during authoring rather than discovered later in drawings or construction?**

It is subordinate to the architecture. Rooms, walls, openings, structure, boundaries, service routes and maintenance paths may be represented semantically where doing so creates a useful check, but architectural judgement is not converted into arbitrary machine rules merely to make the model more complete.

The paper-compilation programme, Phase-8 pattern crosswalk, P0 executable kernel, `PAT-XW-01`, RH-C0 model freeze, RH-C1 deterministic fixture, CF-01 contrast-fixture gate, RH-C2 structural view, RH-C3 service view, RH-C4 envelope/boundary view and RH-C5 selected calculation gate have now completed at their stated internal scopes.

## Current state

**The currently authorised bounded Reference House executable sequence is complete through RH-C5. There is no standing RH-C6.**

RH-C5 adds one deliberately narrow numeric proof family over the same architecture → structure → services → boundary chain: the represented private-stair rise, going, pitch and 2R+G are compared with a versioned Approved Document K 2013 calculation-method snapshot for an England dwelling/private-stair context.

The canonical Reference House values are approximately 183.333 mm rise, 280 mm going, 33.215° pitch and 646.667 mm for 2R+G. They correspond to the selected guidance values of 150–220 mm rise, 220–300 mm going, maximum 42° pitch and 550–700 mm for 2R+G.

The proof boundary is explicit:

```text
SELECTED NUMERIC METHOD CORRESPONDENCE  MACHINE-CHECKED
APPROVED-DOCUMENT GUIDANCE COVERAGE     BOUNDED-METHOD-ONLY
RELEASE-GRADE COMPILER TARGET           NOT ESTABLISHED
BUILDING REGULATIONS COMPLIANCE         NOT PROVED
WHOLE-BUILDING TECHNICAL ADEQUACY       EXTERNAL — NOT PROVED
```

This is a versioned method/source correspondence check, **not** a release-grade England compiler target. The latter would also require a legal snapshot, transitional basis, building/work classification, selected compliance routes and referenced standards. Approved Document guidance is not silently promoted into the law or into a whole-building compliance result.

Current executable suites:

```text
P0                         17 / 17 PASS
PAT-XW-01                   6 /  6 PASS
RH-C1                      27 / 27 PASS
CF-01                       7 /  7 PASS
RH-C2                      17 / 17 PASS
RH-C3                      21 / 21 PASS
RH-C4                      29 / 29 PASS
RH-C5                      16 / 16 PASS
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
RH-C5 — selected target calculations   PASS
```

Programme records:

- [RH-C0 — Reference House Model Freeze](reference-house-model-freeze-rhc0.md)
- [Reference House executable programme — RH-C1 through RH-C5](reference-house-executable-slice.md)
- [CF-01 — Compiler Generality Assurance](compiler-generality-assurance-cf01.md)
- [RH-C1 drawing parity result](../reference-house/rhc1-drawing-parity-result.md)

The Reference House remains a **controlled regression fixture**, not a universal House Kernel template. The CF-01 contrast house remains an adversarial test fixture, not a second design proposal.

## What has been established

At deliberately bounded internal scope, the executable work now demonstrates that:

- semantic identity, typed relationships, obligations and scoped evidence can remain coherent from component to whole-house scale;
- pattern provenance can inform authoring without becoming compiler ontology or technical authority;
- source and geometry well-formedness can be checked deterministically;
- one architectural source can drive derived calculations and deterministic projections without parallel authored geometry;
- mutation tests can distinguish propagation, source-integrity failure, architectural `REVIEW`, deliberate absence and unsupported technical evidence;
- shared plan semantics can operate across two materially unlike fixtures without fixture-ID branching;
- structural topology can be checked for support continuity, span/support coherence, reaction geometry, interruptions, diaphragm ownership and represented gravity handoff without claiming structural adequacy;
- service topology can be checked for network continuity, route/crossing ownership, primary-service geography, maintenance access and structural-crossing coordination without inventing MEP sizing or exact routing;
- envelope topology can keep weather, air, thermal and moisture as independent systems across outer walls, courtyard walls, roof and ground-interface handoffs;
- numeric and qualitative enclosure openings can remain visible as boundary obligations without manufacturing missing geometry;
- selected service penetrations can derive boundary-reinstatement obligations rather than disappearing between service and envelope abstractions;
- four outward roof catchments can derive from canonical shell/courtyard geometry and close to the 115.2 m² enclosed plate;
- courtyard primary drainage and independent visible emergency overflow can remain distinct and owned by canonical `PEN-CD-01`;
- critical slow-envelope functions can be prevented from migrating onto routinely removable trim/lining layers;
- a versioned numeric calculation method can consume canonical derived values, expose its authority/applicability and return `PASS`, `FAIL` or `UNSUPPORTED` without widening its claim;
- missing, wrong-unit, non-finite or out-of-domain inputs can fail closed as `UNSUPPORTED`, and incomplete evidence can prevent a definitive technical conclusion;
- an external-guidance correspondence check can remain distinct from a release-grade compiler target and from Building Regulations compliance.

These results do **not** establish that the building is structurally, environmentally, regulatorily or MEP-adequate. Building release remains outside the demonstrated scope.

## Authority boundary

The computational model has a deliberately limited authority.

- **A pattern is not a compiler primitive.**
- **Pattern provenance is not technical authority.**
- **An architectural grammar is not owned by the compiler.**
- **Representability is not evidence of adequacy.**
- **An Approved Document calculation correspondence is not Building Regulations compliance.**
- **A research compile is not a building-release certificate.**
- **Architectural judgement remains architectural where no legitimate deterministic rule exists.**

A `PASS` in C2, C3 or C4 means the represented topology is internally coherent at the declared scope. A C5 `PASS` means only that the named values correspond to the named method's selected criteria. None of those claims silently widens into physical or regulatory adequacy.

## Core executable layers

- `compiler/plan-slice/` — orthogonal plan semantics, spaces/voids, boundaries, openings, adjacency and plate closure.
- `compiler/structure-slice/` + `compiler/rhc2/` — line supports, span fields, reactions, interruptions, diaphragm ownership and qualitative foundation handoff.
- `compiler/service-slice/` + `compiler/rhc3/` — semantic service nodes/routes/networks, access obligations and registered crossings.
- `compiler/boundary-slice/` + `compiler/rhc4/` — independent weather/air/thermal/moisture carriers, typed opening/penetration transitions, registered boundary occurrences and directional drainage routes.
- `compiler/calculation-slice/` + `compiler/rhc5/` — bounded versioned numeric methods with explicit applicability, authority, inputs, unsupported states and claim boundaries.

These are semantic/control layers, not general CAD/BIM, FE, MEP-routing, building-physics or regulatory-compliance engines.

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

Architectural grammar remains a separate layer. G-01-derived bay/opening facts are fixture inputs where needed; they are not compiler defaults. CF-01 demonstrated that the shared plan layer does not require Georgian composition. C2–C5 consume relevant Reference House relationships without promoting G-01, the courtyard, masonry, ASHP, MVHR or any other project choice into House Kernel doctrine.

## Evidence and external review

The compiler retains three broad discharge modes:

1. deterministic calculation where method and authority are explicit;
2. a bounded supported rule/calculation family only after its proof domain is established;
3. external evidence from competent engineering, MEP, building physics, fire/building-control, product evidence or physical testing.

The RH-11 external-review briefs and physical prototype programme remain independent evidence tracks. C2–C5 do not discharge them.

## What happens after RH-C5

There is no automatic next numbered compiler stage. Further computational work is **evidence-selected**.

A new calculation family or semantic check should be introduced only when another workstream creates a concrete need: for example, a competent reviewer identifies a repeatable proof obligation, a physical prototype supplies authoritative parameters, a real project supplies site-specific inputs, or a technical family becomes controlled enough for deterministic checking.

U-values, thermal bridges, condensation analysis, rainwater capacity, structural capacity and MEP sizing are not a standing implementation queue. Each would require its own authoritative inputs, method contract, supported domain, regression cases and proof boundary before implementation.

The existing P0, `PAT-XW-01`, RH-C1, CF-01 and RH-C2–C5 suites remain regression gates. Physical validation and competent professional review now provide more value than speculative compiler breadth.
