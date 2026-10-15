# Formal Architectural Model

A CAD model is commonly organised around objects and geometry. That is insufficient for Ovid’s House because one piece of building can participate in several systems simultaneously.

An external wall may bound a room, support a floor, carry several environmental boundaries, contain an opening, exclude routine services, receive an attachment datum, separate sound and create future maintenance obligations.

Those are not competing descriptions. They are overlapping relationships.

The formal model is therefore best understood as a **multi-view semantic graph with stable identity**, from which geometry, analytical views and human outputs can be derived.

## Source model, derived views and outputs

Three layers should remain distinct.

### Source semantic model

The authoritative description of represented architectural intent and selected physical systems: meaningful entities, facts and relationships authored or selected by the design process.

### Derived analytical views

Purpose-specific projections such as structural, service, boundary, quantity, maintenance, obligation and geometric views.

Derived views may calculate consequences from the source. They should not create contradictory private versions of source truth.

### Production and inspection outputs

Human- and machine-facing artefacts such as plans, sections, schedules, calculations, semantic registers, IFC mappings, quantities, proof manifests and publication graphics.

A drawing is therefore a view of the source model, not the ontology of the building.

## Stable identity

Every meaningful entity needs stable identity across views and regeneration.

A window appearing in plan geometry, a boundary transition, a quantity schedule, a replacement sequence and a later alteration should remain the same semantic occurrence.

Stable identity enables:

- cross-domain traceability;
- deterministic regeneration;
- change impact;
- evidence attachment;
- versioning;
- inspection;
- maintenance history.

Identity should be stable where the entity remains conceptually the same and should change where the entity itself is replaced rather than merely edited.

## Core entity families

These families describe semantic roles; they do not prescribe programming classes.

### Project and context

Relevant entities may include:

- project;
- site;
- legal/plot boundary;
- climate and exposure context;
- ground condition;
- brief;
- assumption;
- compiler target reference;
- supported-domain profile;
- architectural grammar reference.

### Spatial entities

Relevant entities include building, storey, space, room, circulation space, void, courtyard, external space and maintenance/working/withdrawal volumes.

Useful relationships include:

`contains` / `overlaps` / `adjacent-to` / `connected-to` / `accessible-from` / `visible-from` / `served-by` / `bounded-by`

A room is not merely a polyhedron. It has role, hierarchy, occupation and relationships to other spaces.

### Physical entities

Relevant entities include assembly, element, layer, component, opening, finish, fastener, seal, cover, replaceable unit and permanent-fabric element.

The model should be able to distinguish:

- family from occurrence;
- permanent from replaceable;
- site-made from manufactured where relevant;
- commodity component from architectural assembly;
- primary performance carrier from protective or decorative layer.

### Structural entities

Relevant entities include structural element, support, bearing, connection, action/load, stability system and foundation/ground support condition.

Core relationships include:

`supports` / `spans-between` / `bears-on` / `restrains` / `transfers-to` / `stabilises` / `reacts-at`

The key derived view is a **load-path and stability graph**. Semantic continuity is useful before detailed analytical idealisation begins; it does not prove capacity.

See [Structural Semantics](structural-semantics.md).

### Boundary entities

A boundary should have first-class identity rather than being inferred from visible materials.

Roles may include:

- weather / rain;
- thermal;
- air;
- moisture / vapour;
- fire / smoke;
- acoustic;
- security;
- pest exclusion.

Relevant entities include boundary, boundary segment, transition, penetration, opening, seal, drainage path and failure path.

A physical assembly can carry several boundaries, and one boundary can pass through several assemblies. This many-to-many relationship is why an air boundary, for example, should not be reduced to a property on a wall object.

See [Boundary Semantics](boundary-semantics.md).

### Service-system entities

Relevant entities include system, network, node, port, route segment, source, sink, equipment, isolator, distribution point and discharge point.

Core relationships include:

`connects-to` / `feeds` / `returns-to` / `drains-to` / `isolated-by` / `routes-through` / `serves` / `requires-access-to`

The **functional network** and its **physical route** are related but not identical. A system can be topologically connected while its exact duct or pipe geometry remains unresolved.

### Interface entities

Relevant entities include interface, joint, datum, tolerance envelope, adjustment mechanism, fixing interface, release mechanism, movement allowance and remediation threshold.

Relationships may include:

`joins` / `locates` / `attaches` / `restrains` / `permits-movement` / `seals` / `adjusts-to` / `references-datum` / `releases-from`

An interface can create structural, movement, tolerance, boundary, removal and inspection obligations at once.

### Lifecycle and stewardship entities

Relevant entities include permanence class, service-life band, replacement unit, maintenance task, inspection task, replacement sequence, access path, working position, withdrawal path, commissioning test and change event.

Core relationships may include:

`maintained-by` / `inspected-by` / `replaceable-as` / `accessed-via` / `withdrawn-via` / `depends-on-removal-of` / `expected-to-outlive` / `supersedes` / `changed-by`

### Requirement, obligation and evidence entities

Relevant entities include requirement source, rule/method, applicability condition, obligation, assumption, evidence item, calculation, test result, product declaration and external professional determination.

These form the evidence graph rather than being incidental metadata.

See [Evidence and Provenance](evidence-and-provenance.md).

## Relationship vocabulary

A relatively small explicit relationship vocabulary is preferable to hundreds of ad-hoc object properties.

Useful families include:

- **spatial:** contains / adjacent-to / connected-to / accessible-from / visible-from / bounded-by;
- **composition:** composed-of / layer-of / hosted-by / inserted-in / covers / protects;
- **structural:** supports / spans-between / bears-on / restrains / transfers-to / stabilises;
- **boundary:** separates / continues / transitions / penetrates / seals / drains / reinstates;
- **services:** connects / supplies / returns / drains / isolates / routes-through / serves;
- **interface:** attaches / locates / references-datum / adjusts / permits-movement / releases;
- **lifecycle:** outlives / replaceable-as / maintained-by / inspected-by / withdrawn-through / supersedes;
- **requirement:** creates-obligation / applies-to / discharged-by / depends-on / evidenced-by / derived-from.

The vocabulary should grow from useful cases rather than from exhaustive ontology brainstorming.

## Overlapping graphs

The same semantic source can produce several coordinated graphs.

### Spatial graph

What spaces exist, how are they connected and what hierarchy do they form?

### Structural graph

What supports what, where do reactions go and how do gravity/stability relationships close?

### Boundary graph

Which environmental or safety boundaries exist, where are they continuous and where do they transition or become penetrated?

### Service graph

What supplies what, how do networks connect, and where can systems be isolated or discharged?

### Maintenance graph

How does a person reach a component, where can they work, what must be removed and where does the replacement travel?

### Lifecycle graph

What outlives what, what changes together and what slower fabric is touched by a foreseeable intervention?

### Evidence graph

What proposition applies, what created it, what method addresses it, what evidence supports it and which dependencies can stale it?

No graph is “the building”. The value lies in the coordinated set sharing identity and source facts.

## Geometry

Geometry remains essential. It simply does not have sole semantic authority.

The model should support:

- exact geometry where controlled;
- relational geometry where only a relationship is known;
- derived geometry;
- geometric queries;
- tolerance/acceptance ranges;
- a distinction between nominal design geometry and allowed variation.

A useful rule is:

> **Semantics create geometric obligations; geometry can discharge some of them.**

A room creates a usable-width question; a geometric query can answer it. A support relationship creates a bearing question; geometry can establish whether the represented bearing exists. A maintenance task creates approach/working/withdrawal obligations; clearance analysis can test them where the necessary geometry is present.

## Relationship-level type safety

Some represented relationships should be invalid or unresolved by construction.

Examples include:

- a protected structural zone receiving an unowned service crossing;
- a routinely removable layer silently becoming the sole carrier of a slow critical boundary;
- a structural opening existing without a support obligation;
- a maintenance claim with no approach or working relationship;
- a replaceability claim that requires destruction of a slower element contrary to the selected project requirement.

These need not all become programming-language type rules. The principle is simpler:

> **Consequential invalid relationships must be explicit states, not latent facts hidden in drawings.**

## Authored, derived and proven facts

The model should keep three categories separate.

### Authored

Examples: this space has a particular role; this wall uses a selected family; this route is the primary service route; this architectural grammar is selected.

### Derived

Examples: room area, span, boundary length, roof catchment, opening ratio, collision state or reaction location.

### Proven / determined

A proposition for which an applicable method and sufficient evidence exist within a declared scope.

“Beam B14 is adequate” should not be an authored Boolean. If represented, it must arise from engineering evidence or calculation.

## Unknowns and assumptions

The model must represent uncertainty without converting it into certainty.

Unknown ground capacity, unselected products, unresolved exposure or pending acoustic evidence may:

- leave an obligation unresolved;
- return `UNSUPPORTED`;
- require accepted external evidence;
- permit exploratory work under an explicit assumption.

Assumptions should remain visible and dependency-bearing.

## Family, occurrence and evidence scope

Three ideas should not collapse into one another.

- **family/type** — reusable design, system or product concept;
- **occurrence** — one instance in one represented building;
- **evidence scope** — the parameter range and occurrences actually covered by a calculation, test or certification.

A tested wall family does not prove every mutation. A lintel table does not cover spans outside its conditions. A product certificate does not prove an arbitrary assembly containing that product.

Applicability belongs in the model.

## Contextual roles

A stable entity can participate in different propositions at different scopes without becoming a “god object” containing permanent fields for every possible analysis.

Prefer:

```text
STABLE ENTITY
    +
TYPED RELATIONSHIPS / CONTEXT MEMBERSHIPS
    +
SCOPE-SPECIFIC DERIVED OBLIGATIONS
```

A window may simultaneously:

- participate in a purge route;
- belong to an elevation;
- serve a room;
- carry an architectural hierarchy role;
- fall inside a security or fire-analysis scope.

The roles belong to relationships and contexts rather than inflating the physical noun itself.

## Evaluation scope and contribution

The same entity can contribute facts to propositions evaluated at different scales.

A window may contribute:

- occurrence-level safety information;
- interface-level envelope continuity;
- room-level purge ventilation;
- elevation-level fire reasoning;
- whole-building overheating analysis.

The window is not necessarily the owner of all those obligations. It **contributes facts** to propositions owned at different scopes.

Useful scopes can include occurrence, interface, route, room, elevation, system, building and site/target.

Separating contribution from ownership reduces duplicated obligations and incorrect invalidation.

## Route roles are authored semantics

Identical spatial connectivity can have different architectural meaning depending on whether a route is principal arrival, ordinary circulation, service circulation or escape.

Route class therefore belongs to architectural source intent where it materially changes downstream reasoning. It should not be guessed later from geometry alone.

## Composed obligations, not checklist concatenation

An ordinary wall bay can contain a wall field, window transition, floor edge and service penetration. Each participates in shared air, thermal, structural and other systems.

The correct model is not four independent checklists that happen to contain similar obligations.

Instead:

```text
AUTHORING RELATIONSHIPS
        ↓
LOCAL INTERFACE / ASSEMBLY CONTRIBUTIONS
        ↓
SHARED DOMAIN GRAPHS
        ↓
CANONICAL OBLIGATION DERIVATION
        ↓
EVIDENCE / STATUS
```

A wall field, window and sleeve contribute to one relevant air-boundary graph. The canonical continuity obligation belongs to that composed state.

This is the key reason [Interface Obligation Bundles](interface-obligation-bundles.md) are useful as a conceptual authoring abstraction without becoming independent sources of truth.

## Time and change

A future building record may need to distinguish proposed, agreed, manufactured, installed, commissioned, in-service, altered, replaced and removed states.

The ontology should therefore not make temporal identity impossible.

A later alteration should be able to preserve statements such as:

```text
Opening O17 supersedes O12 under Change C17.
Evidence attached to O12 remains part of the earlier building state.
```

The current executable system implements only a bounded subset of lifecycle reasoning. Stable identity and provenance are nevertheless designed so future time states need not be retrofitted onto an incompatible ontology.

## IFC and open standards

IFC provides valuable precedent for stable identifiers, semantic objects, objectified relationships, spatial structure, system connectivity and analytical views.

It should not automatically dictate the internal ontology.

The intended relationship is:

```text
House Kernel semantic model
        ↕
interoperability mapping
        ↕
IFC / bSDD / IDS where appropriate
```

Some project concepts—maintenance withdrawal volumes, permanence relationships, evidence obligations, architectural grammar—may not map directly to existing exchange schemas. That is an interoperability problem rather than a reason to omit the concepts internally.

## Model integrity invariants

Before architectural or technical rules are considered, the semantic model itself should enforce basic integrity such as:

- stable unique identity;
- relationships reference existing entities;
- valid containment;
- meaningful host relationships;
- no impossible peer overlaps where the model forbids them;
- explicit boundary roles;
- explicit support direction/ownership;
- obligations identify subject and source;
- evidence declares scope and dependencies;
- assumptions remain explicit.

These are model invariants, not Ovid’s House doctrine.

## Worked example

One external bay might be represented as overlapping facts:

```text
ROOM R01
  bounded-by WALL W01

WALL W01
  supports FLOOR F01
  contains-opening O01
  participates-in THERMAL-BOUNDARY TB01
  participates-in AIR-BOUNDARY AB01
  excludes ROUTINE-SERVICE-ROUTING

OPENING O01
  receives WINDOW WIN01
  creates STRUCTURAL-OBLIGATION SO17
  creates WATER-DETAIL-OBLIGATION WO09
  creates THERMAL-JUNCTION-OBLIGATION TO11

FLOOR F01
  bears-on WALL W01

ATTACHMENT-DATUM AP01
  attaches-to WALL W01 through INTERFACE I01
  supports REPLACEABLE-LINING L01
  references DATUM D01
  absorbs declared tolerance through ADJUSTMENT A01
```

The notation is illustrative. The point is that changing `O01` can propagate through several shared graphs without each domain keeping its own contradictory copy of opening geometry.

## Current executable boundary

The implemented model currently exercises stable identity, source/geometry integrity, spatial relationships, hosted openings, structural topology, service topology, boundary roles/transitions, obligations, scoped evidence and selected versioned numeric methods.

It does not implement every entity family or relationship described here. The conceptual model is the map of legitimate semantic territory; [Computational Track](README.md) is the authority for what Metamorph Compiler presently proves.

## Open model questions

The unresolved design questions are architectural/computational rather than programme milestones:

- Which relationships deserve first-class identity rather than ordinary properties?
- How should zones with several simultaneous roles be represented without duplicating geometry?
- Which contextual roles belong in source intent and which can be derived safely?
- How much lifecycle state is worth representing before a real alteration/operation case requires it?
- Which interoperability mappings preserve meaning and which should remain lossy exports?

The stop rule remains important: add semantic machinery only when it exposes a real relationship that is otherwise easy to lose, duplicate or misstate.
