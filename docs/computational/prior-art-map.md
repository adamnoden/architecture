# Prior Art and Research Context

The computational proposition within Ovid’s House sits at the intersection of several mature fields. None of its constituent ideas should be claimed as novel merely because they are combined here.

Existing work already covers:

- semantic building representation;
- interoperable BIM;
- machine-readable information requirements;
- automated compliance checking;
- building ontologies and linked data;
- generative and parametric planning;
- architectural shape grammars;
- digital building records;
- formal verification concepts in other engineering domains.

The narrower research question is:

> **Can a deliberately bounded, architecturally opinionated domestic design system represent enough shared architectural meaning that consequential changes propagate coherently, invalid states fail clearly and evidence remains scoped—without pretending to automate the whole building?**

Any claim of distinctiveness belongs to that synthesis and its demonstrated behaviour, not to the existence of BIM, ontologies, grammars or rule checking themselves.

## IFC and openBIM

Industry Foundation Classes provide an established international model for semantic built-asset information exchange.

Relevant precedents include:

- stable identified entities;
- type/occurrence distinctions;
- objectified relationships;
- properties;
- spatial containment;
- systems and connectivity;
- process/control/resource concepts;
- multiple model views.

The important lesson is that relationships such as support, containment and connection can themselves carry semantics rather than being incidental object attributes.

IFC should therefore be treated as a crucial interoperability precedent and potential exchange target, not automatically as the complete internal ontology. Ovid’s House may need additional concepts for maintenance withdrawal geometry, permanence relationships, architectural grammar, evidence dependencies or proof boundaries.

## buildingSMART Data Dictionary

bSDD demonstrates the value of shared identifiers and definitions across classification systems and IFC concepts.

The lesson is conservative: do not invent project-specific names for established industry concepts without reason. Where Ovid’s House needs specialised vocabulary, map it to wider industry semantics where that mapping is honest.

A dictionary does not by itself provide architectural grammar, proof semantics or a compiler.

## Information Delivery Specification

buildingSMART’s IDS provides a strong precedent for pairing human-readable information requirements with machine-interpretable constraints and deterministic checking.

Its scope is intentionally different from the House Kernel proposition. IDS primarily expresses information requirements for IFC data and does not constitute a general geometric, structural or generative architectural language.

The transferable idea is the discipline of explicit, machine-checkable requirements with clear scope and interoperability.

## Automated compliance checking

Automated code- and rule-compliance research has a long history. Recent work increasingly emphasises:

- semantic models;
- machine-readable rule representations;
- ontology-based reasoning;
- traceability;
- versioning;
- exceptions and ambiguity;
- human oversight;
- explainable reports.

This aligns with the project’s insistence that a compliance result cannot be an opaque green tick.

The stronger architectural question is upstream: rather than only checking an arbitrary finished model, can authoring occur inside a semantic system where important consequences are generated as obligations as the design changes?

That distinction is plausible and useful. It should be demonstrated through behaviour rather than treated as a novelty claim by assertion.

## Building ontologies and linked data

AEC ontology research spans construction process, cost, operation and maintenance, safety, sustainability, compliance, monitoring and digital twins.

A recurring difficulty is fragmentation: different domains need overlapping views of the same building.

This supports the House Kernel preference for **several coordinated graphs over stable entities** rather than one monolithic hierarchy:

- spatial;
- structural;
- boundary;
- service;
- lifecycle/maintenance;
- evidence.

No single graph is the building.

## Building-services ontologies

Existing service ontologies distinguish equipment identity, functional networks and physical topology. That is directly relevant to House Kernel.

The additional Ovid’s House concern is maintenance geography: how a human reaches, isolates, services and replaces the system.

The useful contribution is therefore not to reinvent service ontology, but to connect service semantics to spatial access, crossings, boundaries and lifecycle obligations within the same project model.

## Shape grammars

Shape grammar research established that architectural languages can be represented through generative rules rather than numerical optimisation alone.

Historical examples include grammars for Palladian villas, Frank Lloyd Wright prairie houses, gardens and decorative systems.

This is important because it removes any need to defend “architectural grammar” as a category. The real questions are which relationships deserve formalisation, what authority the rules have and how their limits are made visible.

A grammar can generate membership in a selected architectural language. It does not prove universal architectural quality.

## Palladian computational grammars

Stiny and Mitchell’s Palladian Grammar is a particularly close precedent for representing a historical architectural language as a generative system. Later work by Hersey and Freedman is useful because it separates:

- generation from explicit rules;
- tendencies in a precedent corpus;
- dimensional/proportional bounds;
- plan/facade negotiation;
- evaluation of generated results.

One important implication is that architectural identity need not reduce to exact canonical room ratios. Relationships such as hierarchy, subdivision, symmetry, alignment and opening axes may carry more explanatory weight.

G-01 follows that general lesson: relational rules and scoped order come before universal numerical ratios.

The House Kernel problem begins where stylistic grammar alone stops: structure, boundaries, services, maintenance, evidence and selected technical methods must coexist with the architectural language without being owned by it.

## Space Syntax and topological representation

Space Syntax and justified-plan-graph methods demonstrate that significant architectural properties can be represented independently of precise metric geometry.

Rooms and connections can be analysed through depth, centrality, permeability, route choice, privacy and hierarchy.

The useful lesson is that **spatial topology can precede dimensional resolution**. A room is not merely a rectangle with dimensions; it is a meaningful space participating in a network of relationships.

## Pattern languages

Christopher Alexander’s pattern language remains an important precedent for transferring design knowledge through composable architectural responses.

Its criticism is equally valuable. Pattern systems can overstate universality, use weakly defined terms, outrun their evidence or imply that possession of patterns guarantees successful synthesis.

Ovid’s House therefore separates:

- doctrine;
- strategies;
- patterns;
- project occurrences;
- evidence maturity;
- technical proof.

A stable pattern name is not a certificate of universal truth.

## Automated floor-plan generation

Academic and commercial systems already generate or optimise plans using constraints, adjacency, reference designs, geometry search and machine learning.

The project should not rediscover generic room packing.

The distinction of interest is that House Kernel treats the plan as one projection of a wider semantic building state involving structure, services, boundaries, maintenance and evidence. Plan generation is not the whole computational problem.

## Parametric and generative building platforms

Platforms including Rhino/Grasshopper, Revit/Dynamo, Archicad parametric systems, Autodesk Forma, TestFit, Finch, Hypar, Speckle and related ecosystems demonstrate broad capability in parametric geometry, data exchange, optimisation and rule-driven generation.

Their existence is a strong warning against broad novelty language.

The relevant comparison is narrower:

- what owns semantic identity;
- how relationships propagate;
- whether unsupported states are explicit;
- how technical authority and architectural preference are separated;
- how evidence scope is represented;
- whether one source can drive several deterministic inspection outputs without duplicated authored geometry.

The answer may vary by platform and version. The project need not establish commercial differentiation to justify the internal research question.

## Digital building records and the golden thread

Digital-building-record and golden-thread work demonstrates the value of persistent identity, controlled change, information provenance and evidence through the building lifecycle.

For an ordinary low-rise house, higher-risk-building legal duties should not be imported falsely. The transferable principle is informational: a future reader should be able to establish what was designed, what evidence supported it, what changed and which information still applies.

## Formal verification as a conceptual precedent

Software and other engineering disciplines demonstrate useful ideas such as type safety, invariants, dependency graphs, deterministic builds and proof obligations.

The architectural transfer must remain bounded. A compiler can prove only propositions that have been represented faithfully and for which it has legitimate methods. Formalising an architectural preference does not make the preference objective; formalising an inadequate proxy does not make the underlying phenomenon solved.

The useful contribution of verification thinking is **discipline about what follows from what**.

## Where the field is already crowded

Claims should remain modest around:

- BIM as a semantic model;
- object relationships;
- parametric or generative design;
- automated code checking;
- building ontologies;
- architectural grammars;
- digital twins and building records;
- rule-driven floor-plan generation;
- machine-readable information requirements.

These are established territories.

## Where the synthesis remains interesting

The project becomes more distinctive where several demands are kept together without collapsing their authority:

1. a deliberately bounded domestic supported domain;
2. an explicit architectural grammar that remains separate from technical truth;
3. shared semantic identity across plan, structure, services and boundaries;
4. generated obligations at consequential interfaces;
5. scoped evidence and selective invalidation;
6. architecture concerned explicitly with maintenance, replacement and lifespan coupling;
7. deterministic human inspection outputs derived from the same source as machine checks;
8. explicit refusal to infer unsupported technical adequacy.

None is individually unprecedented. The research value lies in whether the combination produces a materially better and more trustworthy design process.

## Current demonstrated claim

The current Metamorph Compiler does **not** demonstrate a general-purpose building compiler.

It does demonstrate, at bounded scope, that one semantic source can drive coordinated plan, qualitative structural, service and boundary reasoning; that unlike domestic fixtures can share part of the same semantics; that evidence can remain scoped; that selected method checks can fail closed; and that deterministic inspection outputs can be generated without parallel authored geometry.

That is sufficient to justify continued research. It is not a basis for broad novelty claims.

## Reference points

- buildingSMART International, Industry Foundation Classes (IFC).
- buildingSMART International, bSDD and Information Delivery Specification (IDS).
- Stiny & Mitchell, “The Palladian Grammar” (1978).
- Hersey & Freedman, *Possible Palladian Villas*.
- Space Syntax and justified-plan-graph literature.
- Alexander, Ishikawa & Silverstein, *A Pattern Language* (1977).
- Sydora & Stroulia (2020), rule-based BIM compliance and generative design.
- Purushotham, Kailashnath & Mutis (2026), transparent automated code-compliance checking.
- Zentgraf, Hagedorn & König, BIM-based automated rule extraction/compliance research.
- Weber, Mueller & Reinhart, review of automated floor-plan generation methods.
