# Executable Architecture

The long-term ambition is to compile a habitat.

The computational proposition within Ovid’s House is not that architecture should become software. It is that some building relationships are formal enough that they can be represented, propagated and checked before they become expensive mistakes.

A conventional digital workflow often begins with geometry and analyses it downstream. House Kernel starts from a stronger semantic source: meaningful architectural entities, relationships, constraints, obligations and evidence boundaries. Metamorph Compiler derives consequences from that source and fails closed where it lacks authority.

The authoring ambition is a bounded semantic system in which important consequences are part of the act of authoring, rather than checks applied only after a house has been drawn.

The current executable scope is deliberately much narrower than the complete concept described here. [Computational Track](README.md) records what is actually implemented and demonstrated.

## Relationship to Ovid’s House

Executable architecture is not doctrine. Ovid’s House remains meaningful if no compiler exists.

The architectural chain is:

```text
Doctrine
   ↓
Strategy
   ↓
Pattern
   ↓
Project choice
   ↓
Technical design
   ↓
Evidence / test
```

The computational chain is:

```text
Architectural / project intent
   ↓
Formal architectural model
   ↓
Semantic relationships + invariants
   ↓
Derived obligations
   ↓
Evidence / determination
   ↓
Validity + diagnostics
```

The two can meet where a proposition has enough explicit structure to be represented honestly. They should remain separate where architectural judgement, professional interpretation or physical evidence cannot be reduced without distortion.

## Semantic building primitives

The compiler should operate on meaningful building entities rather than generic meshes alone.

An external wall may know that it:

- bounds particular spaces;
- carries a structural role;
- participates in weather, thermal and air boundaries;
- supports or restrains another assembly;
- contains openings;
- admits only controlled service penetrations;
- belongs to a particular construction family;
- has maintenance and lifecycle consequences.

A window may know which permanent opening it occupies, which boundaries it transforms, what replacement path it needs and which technical obligations arise at its perimeter.

A maintenance task may know its target, approach path, working position and withdrawal route.

Illustratively:

```text
ExternalWall
  role: load-bearing
  construction-family: masonry-cavity-01
  supported-by: foundation-F03
  supports: upper-floor-F17
  exposure: west
  openings: [W12, W13]
  boundaries: [weather, thermal, air]
  service-policy: controlled-penetrations-only
```

This is not prescribed syntax. It illustrates the level of meaning required for computation to reason about architecture rather than merely surfaces.

## Compiler rather than checker

A checker accepts an authored state and reports on it. A compiler can make some invalid states impossible to express and can propagate the consequences of changes through shared semantics.

Move a wall and more than a polygon may change. Depending on what the model actually knows, the change can affect:

- room geometry;
- adjacency;
- opening position;
- a structural span or support line;
- service continuity;
- a boundary transition;
- stair clearance;
- roof catchment;
- quantity;
- maintenance access.

A useful diagnostic explains the broken relationships rather than merely colouring the geometry red.

```text
Cannot accept proposed change.

Failed obligations:
- support path no longer closes;
- stair geometry leaves supported method range;
- service crossing has no registered host transition.
```

The software analogy is type safety. A short-lived service should not attach to protected permanent fabric without an explicit interface. A removable lining should not silently become the sole carrier of a boundary required to survive its removal. A load-bearing opening should not exist without structural consequences becoming visible.

## Authoring experience

The long-term interface ambition is to move complexity into the system rather than demanding it from every author.

A useful test is whether someone comfortable manipulating a house in a game-like spatial interface could explore supported designs without first learning BIM authoring conventions, structural analysis software and every encoded dimensional rule.

That user is not thereby made legally or professionally competent. The point is the division of labour:

- the author expresses architectural intent through meaningful operations;
- the system derives consequences it legitimately understands;
- unresolved obligations remain explicit;
- professional or physical evidence enters where machine authority ends.

The conceptual product stack is:

**interactive authoring environment + semantic building model + compiler + versioned methods/targets + evidence and production outputs**.

A 3D model is one view of that system, not the system itself.

## Opinionated architecture without counterfeit certainty

The system may support a declared architectural grammar governing relationships among rooms, heights, openings, axes, bays, circulation, hierarchy and composition.

Three rule classes should remain distinct.

### Hard invariants

Conditions that must hold inside the represented supported domain: source integrity, topology closure, declared boundary continuity, selected method applicability and other genuinely deterministic requirements.

### Grammar constraints

Conditions belonging to a selected architectural language: hierarchy, relational dimensions, opening families, alignments and other architectural commitments.

They are authored cultural/design rules, not laws of nature.

### Objectives and preferences

Conditions that can be assessed without becoming binary truth: economy, daylight quality, degree of symmetry, circulation efficiency, material use, maintenance burden, views or proportional fit.

The system may be opinionated. It must not disguise taste as regulation, engineering or evidence.

## Structure from the beginning

Structure belongs in the semantic model even when capacity remains external engineering work.

At minimum, represented structural elements should participate in an explicit support topology:

```text
roof
  ↓
roof support
  ↓
wall / beam
  ↓
floor / wall / column
  ↓
foundation
  ↓
ground
```

An incoherent represented load path can be rejected semantically. A coherent load path does not prove that any member is large enough.

The stronger architecture separates:

- physical structural fabric;
- structural topology;
- analytical idealisation and proof.

This allows the compiler to expose missing supports, impossible reactions or unowned interruptions without pretending to replace structural engineering.

See [Structural Semantics](structural-semantics.md).

## Boundaries as systems

A wall is not one environmental Boolean.

Weather, air, thermal, moisture, fire, acoustic, security and pest-control functions can pass through the same physical construction in different ways. Openings and penetrations transform or interrupt those functions and create reinstatement obligations.

The computational model therefore treats boundaries as semantic systems with continuity, transitions, penetrations, terminations and evidence rather than simply colouring one CAD layer “envelope”.

See [Boundary Semantics](boundary-semantics.md).

## Compiler targets

A design never compiles against “the rules” in the abstract.

A **compiler target** describes a named external normative environment such as jurisdiction, applicable regulatory snapshot, transitional basis, building/work classification, selected compliance route and referenced standards.

The target remains separate from:

- the compiler’s supported domain;
- the selected architectural grammar;
- project/site facts;
- Ovid’s House requirements.

This separation prevents a stylistic preference, an unsupported technical condition and a legal failure from acquiring the same authority merely because each can block a workflow.

See [Compiler Targets](compiler-targets.md).

## Compilation as obligation discharge

The central computational abstraction is an **obligation**: a proposition that must be resolved because of a represented relationship, external requirement or selected project commitment.

An opening may create obligations relating to:

```text
opening W12
  ├─ architectural order
  ├─ structural support
  ├─ weather transition
  ├─ thermal continuity
  ├─ air continuity
  ├─ service / environmental consequences
  └─ maintenance and replacement
```

An obligation can be discharged by an appropriate method:

- deterministic semantic inference;
- geometric query;
- bounded numeric method;
- supported design table or family;
- tested/classified assembly;
- manufacturer evidence;
- competent external professional determination;
- construction inspection or commissioning evidence where the claim belongs to the physical building.

If the necessary method or evidence is absent, the condition remains unresolved or unsupported. The compiler should never translate absence into confidence.

See [Validity and Obligations](validity-and-obligations.md) and [Evidence and Provenance](evidence-and-provenance.md).

## Interface obligation bundles

Ordinary architectural relationships can generate many domain-specific consequences. A window in a masonry wall may simultaneously involve structure, weather, air, thermal continuity, tolerance, replacement and evidence.

Authors should not have to maintain those as duplicated checklists.

An **interface obligation bundle** is a conceptual way of saying that a meaningful architectural relationship can contribute facts and constraints to several shared domain graphs. Canonical obligations are then derived from the composed building state.

The important rule is:

> **Obligations belong to composed building relationships, not to duplicated checklists attached to labels.**

See [Interface Obligation Bundles](interface-obligation-bundles.md).

## Evidence and outputs

A useful compile result is inspectable. Another person should be able to answer:

- what was claimed;
- why the claim applied;
- which source or requirement created it;
- what method was used;
- which evidence supported it;
- which model version and dependencies it described;
- what would make it stale.

Potential outputs therefore extend beyond geometry:

- semantic model and identity manifest;
- plans, sections and inspection views;
- structural/service/boundary registers;
- calculations admitted within explicit method contracts;
- obligation and evidence traces;
- assumptions and source-version registers;
- quantities and schedules;
- maintenance/replacement information;
- machine-readable compilation manifest.

The current implementation intentionally distinguishes machine proof artefacts, human semantic inspection and publication graphics. They do different jobs.

## Proof boundary

Compilation proves propositions about **the represented model, under declared assumptions, within a stated supported domain**.

It does not prove that the physical building matches the model.

Ground conditions, substitutions, construction tolerances, installation quality, concealed changes, commissioning results and later alterations may all remain external facts.

```text
DIGITAL DESIGN CONFORMANCE
      │
      │ compiler + accepted evidence
      ▼
RESOLVED REPRESENTED STATE
      │
      │ procurement + construction + inspection + commissioning
      ▼
PHYSICAL CONFORMANCE
```

The opportunity is not to compile professional responsibility or statutory process away. It is to give them a clearer, more traceable evidence structure.

## Mapping Ovid’s House into computation

Several project principles concern relationships that can sometimes be formalised.

| Architectural concern | Possible computational expression |
|---|---|
| different lifetimes | lifecycle classes and change scenarios |
| protect permanent fabric | attachment and penetration policies |
| design the interface | explicit typed interface relationships |
| failure architecture | failure paths and consequence obligations |
| maintenance geography | approach, working and withdrawal geometry |
| ordinary parts in robust arrangements | bounded families and stable interfaces |
| legibility across generations | stable identities and provenance |
| workmanship robustness | tolerance envelopes, datums, adjustment and inspection obligations |

This compatibility is not a command to encode every proposition. A machine-checkable weak proxy remains a weak proxy.

## Patterns as provenance, not compiler primitives

A selected architectural pattern may explain **why** a project requirement exists. It does not gain structural, regulatory or physical authority merely by being a pattern.

The useful chain is:

```text
selected architectural intent
        ↓
project requirement / provenance
        ↓
ordinary source entities + relationships
        ↓
shared derived graphs
        ↓
canonical obligations
        ↓
evidence / determination
        ↓
validity + diagnostics
```

There is no requirement for a universal whole-pattern machine `PASS`. Formal project commitments, induced technical obligations and architectural judgement remain separate.

## Closed world by design

A trustworthy compiler should not support arbitrary architecture merely because it can draw it.

Strong guarantees become plausible only where competence is bounded. A supported domain may restrict building topology, geometry families, structural systems, construction families, technical methods and available interfaces.

Outside that domain, legitimate outcomes include:

- choose a supported solution;
- provide accepted external evidence;
- extend the supported domain through controlled work;
- leave the computational system.

Unsupported is not invalid. It is also not proven.

See [Supported Domain](supported-domain.md).

## A versionable building

Stable semantic identity can outlive first construction.

A later alteration can in principle expose which permanent fabric, interfaces, boundaries and structural relationships change; which evidence becomes stale; which target applies; and what new proof is required.

The building record then becomes more than drawings. It retains a versioned account of **what the represented building is and why**.

## Trust architecture

If software is allowed to make consequential claims, its own behaviour must remain inspectable.

Prefer:

- deterministic checks for hard obligations;
- stable identifiers;
- explicit provenance;
- versioned methods and targets;
- declared assumptions;
- visible unsupported states;
- reproducible outputs;
- open exchange formats where useful;
- external professional evidence where machine authority ends.

AI can help interpret intent, propose alternatives, explain diagnostics or navigate large bodies of information. It should not become an opaque authority whose assertion is treated as engineering or regulatory proof.

### Formalisation is a reduction

A formal model makes selected parts of architecture legible to software by naming and simplifying them. That reduction creates computational leverage; it also creates the danger of mistaking legibility for completeness.

Polanyi’s account of tacit knowledge and James C. Scott’s critique of schematic legibility provide useful guardrails. The compiler should expose its proof boundary and route unresolved matters to competent judgement rather than treating what it cannot represent as irrelevant.

## Prior art and research context

Semantic building representation, BIM, machine-readable information requirements, automated compliance checking, ontology-based reasoning, parametric design and generative planning are established fields.

The computational track therefore makes no novelty claim merely because it combines architecture and software.

Its narrower research question is:

> **Can a deliberately bounded, architecturally opinionated domestic design system represent enough shared architectural meaning that consequential changes propagate coherently, invalid states fail clearly and evidence remains scoped—without pretending to automate the whole building?**

[Prior Art and Research Context](prior-art-map.md) places the proposition beside IFC/openBIM, IDS, automated compliance research, building ontologies and related systems.

## Anti-drift rules

- A semantic model is not proof of physical adequacy.
- A coherent load path is not a structural calculation.
- A pattern is not a technical authority.
- An architectural grammar is not a law of nature.
- An Approved Document method is not the Building Regulations themselves.
- A supported product or assembly family is supported only within its evidence envelope.
- A generated drawing is not architectural source authority.
- Unsupported conditions remain visible rather than guessed.
- The 3D view is not the ontology.
- Formalisation should stop where it no longer creates a trustworthy deterministic relationship.

## Current executable boundary

The present Metamorph Compiler implements a bounded chain through plan semantics, qualitative structural topology, service topology and registered crossings, envelope/boundary obligations, selected numeric methods and deterministic inspection outputs.

It does **not** currently establish structural capacity, building-physics performance, fire adequacy, acoustic adequacy, MEP sizing, whole-building regulatory compliance or a general-purpose technical-family library.

That distinction between the complete conceptual architecture and the smaller earned executable domain is permanent in principle. Capability should expand only when a concrete architectural or evidence problem justifies another deterministic check.

## Reference points

- buildingSMART International, Industry Foundation Classes (IFC) and openBIM standards.
- buildingSMART International, Information Delivery Specification (IDS).
- Sydora & Stroulia (2020), “Rule-based compliance checking and generative design for building interiors using BIM”, *Automation in Construction* 120, 103368.
- Michael Polanyi, *The Tacit Dimension* (1966).
- James C. Scott, *Seeing Like a State* (1998).
- UK Government, Approved Documents and building-control application guidance for England.
- BSI, intellectual-property guidance for standards.
