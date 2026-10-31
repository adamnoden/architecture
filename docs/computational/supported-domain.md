# Supported Domain

A computational building system is trustworthy only if it states clearly what it knows how to handle.

A **supported domain** is the bounded set of building types, semantic relationships, geometric conditions, technical families and proof methods for which the system has legitimate authority.

The domain is not a temporary limitation to hide. It is part of the product’s epistemic contract.

## Four configuration layers

Keep the supported domain separate from three neighbouring concepts.

### Compiler target

The external normative environment: jurisdiction, regulatory snapshot, building/work class and selected compliance methods.

### Supported domain

The cases the software legitimately knows how to represent or evaluate.

### Architectural grammar

The selected architectural language.

### Project configuration

Site, brief, client requirements, assumptions and other job-specific facts.

Conceptually:

```text
BUILD
 = TARGET
 + SUPPORTED DOMAIN
 + ARCHITECTURAL GRAMMAR
 + PROJECT CONFIGURATION
 + SOURCE MODEL
```

This separation allows a house to be inside the software’s representational competence but outside a selected grammar; grammatically valid but outside a technical proof envelope; technically supported but dependent on external site evidence; or coherent as a model while lacking whole-building regulatory proof.

## Why a closed domain matters

“Supports houses” is not a useful scope statement.

A trustworthy domain may need to bound:

- house topology;
- storey count and spatial representation;
- structural families;
- envelope families;
- opening/interface families;
- service-system semantics;
- permitted crossings;
- stair/method families;
- maintenance/access representations;
- dimensional ranges;
- evidence/proof methods;
- known exclusions.

Without such limits, software can draw far more than it can justify.

## Domain envelope

A domain profile can be understood as a set of **proof envelopes**.

For each supported family or method, state:

- what entity or relationship it applies to;
- geometric range;
- material/system range;
- required inputs;
- supported outputs;
- method identity and provenance;
- exclusions;
- conditions requiring external evidence.

Outside that envelope, the correct result is not “probably okay”. It is:

```text
UNSUPPORTED
```

or an explicit route to accepted external determination.

## Unsupported is not invalid

This distinction is fundamental.

A design can be technically legitimate while outside the compiler’s competence. The software should not claim failure merely because it lacks a method, and it should not claim success merely because nothing crashed.

Legitimate responses include:

- choose another supported solution;
- provide scoped external evidence;
- add a new bounded method/family after research and validation;
- continue the project outside the computational system.

## Representation scope and proof scope differ

The compiler may be able to **represent** a condition without being able to **prove** it.

For example, it can represent:

- a load-bearing wall;
- a floor support relationship;
- an external-wall boundary;
- a service penetration;
- a heat-pump object;
- a maintenance task.

That does not automatically give it:

- structural-capacity calculations;
- thermal-bridge analysis;
- fire classification;
- acoustic prediction;
- heat-loss or plant sizing;
- safe scaffold design.

A supported domain should state these authority differences explicitly.

## Current executable domain

The present Metamorph Compiler supports a bounded semantic chain demonstrated primarily on the Reference House plus a materially different contrast fixture.

### Plan

Supported concepts include orthogonal plan geometry, spaces and voids, containment, adjacency, host boundaries and openings at the precision actually represented.

The compiler can check source integrity and derive shared plan geometry. It is not a general CAD kernel.

### Structural topology

Supported concepts include support lines, span fields, reactions, interruptions, diaphragm ownership and qualitative gravity handoff.

The compiler can reject incoherent topology. It does **not** prove member capacity, connection adequacy, global stability or foundations.

### Services

Supported concepts include semantic nodes, networks, routes, maintenance obligations and registered crossings.

The compiler can check continuity, route/crossing ownership, selected primary-service geography and maintenance-access obligations. It does **not** automatically route or size MEP systems.

### Envelope and boundaries

Supported concepts include weather, air, thermal and moisture carriers; openings and transitions; selected service penetrations; roof catchments; courtyard-drainage relationships; and boundary-reinstatement obligations.

The compiler can check represented topology and continuity relationships. It does **not** prove U-values, thermal bridges, condensation, airtightness, fire or acoustic performance.

### Calculations

The calculation layer supports bounded versioned methods with explicit applicability, input authority and unsupported states.

The current public example is the Reference House private-stair numeric correspondence against a selected Approved Document K guidance method. That result is intentionally reported as a bounded method correspondence rather than whole-building Building Regulations compliance.

### Human inspection outputs

The current output layer generates deterministic plan, section and structural views; service and boundary registers; and an output manifest from the canonical compiled state.

Those are semantic inspection views, not source-authority drawings or construction documents.

## Current contrast test

A materially different domestic plan is used to check that shared plan semantics do not silently depend on the Reference House’s courtyard morphology, G-01 grammar or other fixture-specific facts.

This demonstrates limited generality of the shared plan layer. It does not prove that the compiler supports arbitrary domestic architecture.

## Exterior maintenance remains outside the demonstrated executable scope

The semantic vocabulary can represent a maintenance task, approach path, working position and withdrawal route. The demonstrated software cases remain primarily internal and service-related.

Real exterior maintenance can depend on:

- scaffold, tower or MEWP setup geometry;
- bearing/support ground;
- equipment stabilisation and swept volume;
- replacement-component handling;
- neighbouring-land or highway permissions;
- mature landscape obstruction.

Until a real site supplies those facts and a specific check is justified, exterior maintainability remains an architectural/project obligation rather than a machine-proved domain.

## Regulatory boundary

The computational system currently contains selected **methods**, not a complete regulations engine.

A machine-checked numeric method can establish only what that method covers. It cannot be promoted silently into:

- full Approved Document coverage;
- whole-part compliance;
- whole-building Building Regulations compliance;
- statutory approval.

[Compiler Targets](compiler-targets.md) records how such authority would have to be represented if broader regulatory coverage is ever earned.

## Evidence boundary

A supported semantic relationship may still require external evidence.

For example:

- represented wall/window transition — semantic support may be native; physical thermal/weather performance remains external;
- represented structural floor — topology may be native; member/connection capacity remains external;
- represented ventilation route — continuity may be native; pressure loss and duty remain external;
- represented penetration — boundary obligations may be native; proprietary sealing/fire evidence remains external.

The domain therefore concerns **legitimate system knowledge**, not a binary distinction between software and human authority.

## Adding to the domain

A new family or method should be admitted only when it has:

1. a concrete architectural or evidence problem worth formalising;
2. explicit input authority;
3. a bounded applicability contract;
4. a deterministic method where a machine result is claimed;
5. known pass/fail/unsupported examples;
6. regression coverage;
7. explicit proof limits;
8. a reason the new complexity is better than leaving the matter to external judgement.

Representability alone is not a reason to grow the domain.

## Anti-drift rules

- The supported domain is a claim boundary, not a marketing category.
- Representability is not proof.
- Passing one fixture is not generality.
- Unsupported is not invalid, and it is not proven.
- External evidence can discharge an obligation without becoming native compiler authority.
- Product availability does not create a supported family automatically.
- A standard or Approved Document cannot be encoded casually without applicability, provenance and rights review.
- Domain growth should follow real design/evidence needs rather than completeness for its own sake.

## Current conclusion

The present computational system is intentionally useful before it is comprehensive.

It can expose missing or incoherent relationships across plan, qualitative structure, services, envelope boundaries and selected calculations while preserving a clean distinction between what it knows, what requires external evidence and what lies outside its scope.
