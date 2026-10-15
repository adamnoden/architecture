# Computational Track

The computational track asks a narrow question within **Ovid’s House**:

> **Which building relationships can be represented strongly enough that invalid arrangements, unresolved obligations or missing evidence are exposed during authoring rather than discovered later in drawings or construction?**

**House Kernel** is the formal architectural/computational system: a bounded set of facts, relationships, invariants, obligations and proof boundaries that can legitimately be made explicit. **Metamorph Compiler** is the software that compiles and checks those representations.

The computational system is deliberately narrower than the architecture. Rooms, walls, openings, structure, boundaries, service routes and maintenance paths may be represented semantically where doing so creates a useful check. Architectural judgement is not converted into arbitrary machine rules merely to make the model more complete.

## What the compiler does

The current implementation can represent and check a bounded chain through:

- plan geometry and spatial relationships;
- qualitative structural topology;
- service topology and registered crossings;
- envelope/boundary obligations;
- selected versioned numeric methods;
- deterministic human-readable inspection outputs.

The Reference House is the principal controlled fixture for this work. A materially different contrast fixture is also used to ensure that shared semantics do not silently depend on the Reference House’s Georgian grammar, courtyard morphology or other project-specific choices.

The executable model is a **controlled internal proof system at its stated boundaries**, not a building-release compiler.

## What has been demonstrated

At bounded internal scope, the computational work demonstrates that:

- semantic identity, typed relationships, obligations and scoped evidence can remain coherent from component to whole-house scale;
- source and geometry well-formedness can be checked deterministically;
- one architectural source can drive derived calculations and multiple deterministic projections without parallel authored geometry;
- mutation tests can distinguish propagation, source-integrity failure, architectural review conditions, deliberate absence and unsupported technical evidence;
- shared plan semantics can operate across materially unlike fixtures without fixture-specific branching;
- structural topology can check support continuity, span/support coherence, reaction geometry, interruptions, diaphragm ownership and represented gravity handoff **without claiming structural capacity**;
- service topology can check network continuity, route/crossing ownership, primary-service geography, maintenance access and structural-crossing coordination **without inventing MEP sizing or exact routing**;
- envelope topology can keep weather, air, thermal and moisture duties separate across walls, roofs, openings and ground-interface handoffs;
- opening and penetration obligations can remain visible even where exact geometry is not yet known;
- service penetrations can derive boundary-reinstatement duties rather than disappearing between service and envelope abstractions;
- roof catchments and drainage relationships can be derived from canonical geometry rather than redrawn independently;
- critical slow-envelope functions can be prevented from migrating accidentally onto routinely removable trim or lining layers;
- versioned numeric methods can consume canonical derived values while exposing applicability, source authority and unsupported states;
- missing, wrong-unit, non-finite or out-of-domain evidence can fail closed rather than being guessed;
- deterministic inspection views can expose what the model knows without manufacturing absent geometry.

These are claims about representation and internal coherence. They do **not** establish structural, environmental, regulatory, fire, acoustic or MEP adequacy.

## A bounded numeric example: the private stair

The current Reference House supplies enough controlled information for one deliberately narrow regulatory-guidance correspondence example.

The canonical stair values are approximately:

- rise: **183.333 mm**;
- going: **280 mm**;
- pitch: **33.215°**;
- `2R + G`: **646.667 mm**.

A versioned calculation-method record compares those values with the selected Approved Document K 2013 guidance for an England dwelling/private-stair context: 150–220 mm rise, 220–300 mm going, maximum 42° pitch and 550–700 mm for `2R + G`.

The proof boundary is explicit:

```text
SELECTED NUMERIC METHOD CORRESPONDENCE  MACHINE-CHECKED
APPROVED-DOCUMENT GUIDANCE COVERAGE     BOUNDED-METHOD-ONLY
BUILDING REGULATIONS COMPLIANCE         NOT PROVED
WHOLE-BUILDING TECHNICAL ADEQUACY       NOT PROVED
```

This distinction matters. Approved Document guidance is not silently promoted into law, and one passing calculation does not manufacture a whole-building compliance result.

## Semantic layers

The current executable architecture separates several kinds of knowledge.

### Plan

The plan layer represents orthogonal spatial geometry, spaces and voids, boundaries, openings, adjacency and plate closure. It establishes enough shared geometry for downstream structural, service and boundary reasoning without becoming a general CAD model.

### Structure

The structural layer represents supports, span fields, reactions, interruptions, diaphragm ownership and qualitative gravity handoff. It can reject incoherent topology while remaining explicitly unable to prove member capacity, connection adequacy, stability or foundations.

### Services

The service layer represents semantic nodes, routes, networks, access obligations and registered crossings. It is useful for questions such as whether a route is continuous, who owns a penetration, whether primary service geography is coherent and whether maintenance access has been forgotten.

It does not route pipes and ducts automatically or size systems.

### Exterior maintenance boundary

The same semantic vocabulary can represent a maintenance task, an approach path, a working position and a withdrawal route, but the demonstrated software cases are primarily internal and service-related. **Exterior maintainability has not been established merely because those concepts exist in the model.**

A real exterior task may also depend on scaffold, tower or MEWP setup geometry; supporting ground; equipment clearance and stabilisation; component withdrawal; neighbouring-land or highway permissions; and future landscape obstruction. Those conditions remain outside the demonstrated executable scope until a concrete project supplies enough geometry and evidence to check them without invention.

### Boundaries

The boundary layer represents weather, air, thermal and moisture carriers independently rather than collapsing “the wall” into one pass/fail object. Openings and penetrations transition those duties explicitly, allowing a crossing to create reinstatement obligations instead of vanishing between disciplines.

### Calculations

The calculation layer supports bounded, versioned methods with explicit applicability, authority, inputs and unsupported states. A method is admitted only where the model has sufficiently controlled inputs and the claim boundary can be stated honestly.

## Output architecture

Machine proof, human inspection and publication graphics are different things.

The compiler therefore distinguishes:

1. **machine/proof artefacts** — exact identity, regression and traceability;
2. **semantic inspection outputs** — human-readable views of what the compiled model knows and does not know;
3. **publication figures** — editorial architectural drawings whose job is to communicate, not to act as machine proof.

The generated Reference House inspection surface includes plans, a principal section, a structural view, service and boundary registers and an output manifest. Spatial/metric information is drawn; primarily relational topology is reported as structured text. That distinction prevents every domain from being forced into a diagram simply for visual symmetry.

See the [generated Reference House inspection surface](../reference-house/generated/).

## Authority boundary

The computational model has deliberately limited authority.

- **A pattern is not a compiler primitive.**
- **Pattern provenance is not technical authority.**
- **An architectural grammar is not owned by the compiler.**
- **Representability is not evidence of adequacy.**
- **An Approved Document calculation correspondence is not Building Regulations compliance.**
- **A research compile is not a building-release certificate.**
- **A generated inspection drawing is not architectural source authority.**
- **Architectural judgement remains architectural where no legitimate deterministic rule exists.**

The compiler should fail closed when the evidence needed for a deterministic conclusion is absent.

## Relationship to architectural grammar

Architectural grammar remains a separate layer. G-01-derived bay and opening facts may enter a particular fixture where relevant; they are not compiler defaults.

House Kernel may encode selected consequences of a grammar when deterministic representation is useful. It does not own the grammar itself, and a shared computational layer must remain capable of describing buildings that do not belong to G-01.

## Relationship to external evidence

Computation is only one evidence mode.

A building proposition may require:

1. deterministic calculation where method and authority are explicit;
2. a bounded supported rule family whose domain has been established;
3. competent external evidence from engineering, MEP, building physics, fire/building-control, product evidence or physical testing.

The computational model cannot discharge obligations that belong to the third category merely because the missing answer could in principle be represented as a number.

## Where computation should stop

There is no standing requirement to encode more of the building.

A new calculation family or semantic check should be introduced only when another part of the work creates a concrete relationship worth checking deterministically: for example, a professional review identifies a repeatable proof obligation, a physical prototype supplies authoritative parameters, a real project supplies site-specific inputs, or a technical family becomes controlled enough for deterministic checking.

Likewise, a new drawing or topology view should exist only when it answers an inspection or publication question better than the existing representations.

U-values, thermal bridges, condensation analysis, rainwater capacity, structural capacity and MEP sizing are therefore not a speculative implementation queue. Each would require authoritative inputs, a method contract, a supported domain, regression evidence and an explicit proof boundary before admission.

The governing principle is simple: **a machine-checked weak assumption remains a weak assumption.**

## Further technical detail

The resolved conceptual model is developed in:

- [Executable Architecture](executable-architecture.md)
- [Formal Architectural Model](formal-architectural-model.md)
- [Validity and Obligations](validity-and-obligations.md)
- [Evidence and Provenance Architecture](evidence-and-provenance.md)
- [Compiler Targets](compiler-targets.md)
- [Structural Semantics](structural-semantics.md)
- [Boundary Semantics](boundary-semantics.md)
- [Interface Obligation Bundles](interface-obligation-bundles.md)
- [Supported Domain](supported-domain.md)
