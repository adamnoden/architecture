# Executable Architecture — Initial Prior Art Map

**Status:** reconnaissance v0.1  
**Snapshot:** October 2026  
**Purpose:** prevent reinvention, identify useful standards/precedents and keep novelty claims proportionate. This is not yet a systematic literature review.

## 1. Position

The computational proposition sits at the intersection of several mature and emerging fields.

No single constituent idea should currently be claimed as novel.

Existing work already covers:

- semantic building representation;
- interoperable BIM;
- machine-readable information requirements;
- automated compliance checking;
- ontology-based reasoning;
- generative planning;
- architectural shape grammars;
- parametric design;
- digital building records;
- formal verification concepts in other engineering domains.

The research question is whether these can be synthesised into a particularly strong form:

> **a deliberately bounded, architecturally opinionated domestic design system in which spatial grammar, structure, long-life tectonics, selected regulatory obligations, constructability, quantities and evidence descend from one semantic source strongly enough that compilation yields a genuinely resolved house.**

That synthesis still needs to earn any novelty claim.

## 2. IFC — semantic exchange, not merely geometry

Industry Foundation Classes are an open international standard for exchanging built-asset information.

Relevant concepts include:

- semantic object definitions;
- globally identified entities;
- object types and occurrences;
- first-class relationships;
- properties;
- spatial containment;
- systems/connectivity;
- process/control/resource concepts;
- model views.

Particularly relevant to this project is IFC's use of **objectified relationships**: relationships can themselves carry semantics rather than being reduced to incidental object attributes.

### Lesson

Our instinct that relationships—support, containment, service, interface, boundary—must be first-class is not unusual in semantic modelling.

### Limit

IFC is designed for broad industry interoperability.

It should be treated as a crucial mapping/output target, not automatically assumed to be the complete internal ontology for:

- long-life doctrine;
- maintenance withdrawal geometry;
- permanence classes;
- compiler obligations;
- architectural grammar;
- evidence dependency.

## 3. buildingSMART Data Dictionary — semantic vocabulary

bSDD provides shared definitions for built-environment classes and properties and supports links between dictionaries and IFC concepts.

### Lesson

The project should not casually invent new names for industry concepts that already have durable identifiers and definitions.

### Opportunity

A future Long-Life House dictionary could potentially map its specialised concepts to existing classifications where appropriate.

### Limit

A dictionary defines vocabulary.

It does not by itself provide the compiler semantics, proof rules or architectural grammar proposed here.

## 4. IDS — machine-readable information requirements

buildingSMART's Information Delivery Specification defines IFC information requirements in a computer-interpretable form and supports automated checking.

IDS can constrain things such as:

- entities;
- classifications;
- materials;
- properties;
- values;
- relations.

As of IDS 1.0, buildingSMART explicitly states that IDS is limited to alphanumeric information and does **not cover general geometrical aspects**.

### Lesson

There is already a mature precedent for:

> human-readable requirement + machine-interpretable requirement + deterministic checker.

### Limit

The Long-Life House concept requires much more:

- generative/constructive constraints;
- geometry;
- structural consequences;
- network topology;
- architectural grammar;
- obligation generation.

IDS should be considered one interoperability layer, not the language.

## 5. Automated code compliance checking

Automated compliance checking has a long research history.

Recent work is especially relevant because it increasingly emphasises:

- semantic representations;
- ontologies;
- machine-readable rule sets;
- traceability;
- versioning;
- exceptions;
- human oversight;
- structured compliance reports.

A 2026 framework by Purushotham, Kailashnath and Mutis explicitly focuses on transparency, trust, validation and human-in-the-loop handling of exceptions/interpretation.

Zentgraf, Hagedorn and König's 2026 work combines structured standards data, ontologies and SHACL validation rules and emphasises maintainability across regulatory revisions.

### Lesson

Our insistence that compliance cannot be an opaque green tick is well aligned with the research frontier.

### Remaining gap for us

Most automated-compliance work begins with an existing model and asks whether it complies.

Our stronger proposition is to move validity **upstream into authoring**:

> do not merely inspect arbitrary geometry; constrain what can be authored and propagate consequences as obligations.

That difference needs to be researched carefully rather than asserted rhetorically.

## 6. Building ontologies and linked data

AEC ontology research is extensive.

Reviews identify applications across:

- process;
- cost;
- operation/maintenance;
- safety;
- sustainability;
- compliance;
- monitoring;
- digital twins.

Research repeatedly encounters fragmentation because different domains require overlapping representations.

### Lesson

Do not attempt one monolithic hierarchy.

The Long-Life House should expect multiple graph views over stable entities:

- spatial;
- structural;
- boundary;
- service;
- lifecycle;
- evidence.

## 7. Building-services ontologies

Work such as the TUBES System Ontology addresses hierarchical, topological and functional representations for building technical systems.

### Lesson

Services have at least three distinct semantics:

- what equipment is;
- how the network connects/functions;
- where the physical route exists.

Our maintenance doctrine adds another:

- how a human reaches, isolates and replaces it.

This should be compared explicitly with existing service ontologies later.

## 8. Shape grammars

Shape grammar research is highly relevant to the architectural-grammar problem.

George Stiny and related researchers demonstrated that design can be formalised as rule-based operations on shapes rather than merely numerical optimisation.

Historical applications include grammars for:

- Palladian villas;
- Frank Lloyd Wright prairie houses;
- gardens;
- decorative systems.

### Lesson

“Opinionated architectural grammar” is not a category error.

Architecture can be represented by generative relational rules without reducing everything to scalar ratios.

### Warning

Shape grammar demonstrates formal expressibility.

It does not prove that a grammar produces universally good architecture.

Our system should make the selected grammar explicit and contestable.

## 8A. Palladian computational grammars — a particularly close precedent

Stiny and Mitchell's 1978 **Palladian Grammar** is a direct historical precedent for treating an architectural style as a parametric generative language. Their work generated Palladian villa ground plans and was followed by enumeration and evaluation of possible plans.

Hersey and Freedman's later **Possible Palladian Villas** is even more useful for the present project because it separates several ideas that are often conflated:

- generation from explicit rules;
- frequency/statistical tendencies in a precedent corpus;
- dimensional/proportional bounds;
- plan/facade negotiation;
- aesthetic evaluation of generated results.

Their computational experiments also challenge a simplistic proportion-first account of Palladian identity. They found that exact canonical room ratios were less determinative than relationships such as symmetry, rectangular subdivision, hierarchy, alignment and opening axes.

### Lesson

The first Long-Life House grammar should be **relational first and numerical second**.

Proportion should probably be represented by admissible ranges and preferred families rather than universal equality constraints.

### Important difference

The proposed Long-Life House system must go beyond stylistic generation by coupling the architectural grammar to:

- structure;
- boundaries;
- services;
- maintenance;
- construction;
- regulation;
- evidence.

This is precisely where the prior art stops being a solution and becomes a foundation.

## 8B. Space Syntax and topological grammar

Space Syntax and Justified Plan Graph methods demonstrate that important architectural properties can be represented independently of metric geometry.

Rooms may be represented as nodes and connections as edges, allowing analysis of:

- depth;
- centrality;
- permeability;
- alternative routes;
- privacy;
- access hierarchy.

Research combining Justified Plan Graphs with grammars demonstrates that spatial topology itself can participate in identifying an architectural language.

### Lesson

The Long-Life House grammar should preserve a **spatial-topology layer** before dimensional resolution.

A room is not first a rectangle of a particular size. It is first a semantically meaningful space participating in a network of relationships.

## 8C. Pattern languages — useful warning

Christopher Alexander's pattern language remains relevant as a precedent for transferring architectural knowledge through composable rules.

The critical literature is equally valuable.

Repeated criticisms include:

- overly universal or singular claims about the “right” way to build;
- weakly defined terms;
- insufficient empirical validation;
- rules that can become too controlling;
- the fact that possessing patterns does not itself guarantee beautiful synthesis.

### Lesson

The Long-Life House should not turn architectural preferences into universal truths.

Every grammar rule needs:

- explicit scope;
- stated authority;
- evidence;
- counterexamples;
- versioning;
- a distinction between invariant, preference and judgement.

## 9. Automated floorplan generation

Research and commercial tools generate floorplans using combinations of:

- constraints;
- optimisation;
- reference designs;
- programmatic adjacency;
- geometry generation;
- machine learning.

A 2022 review by Weber, Mueller and Reinhart divides methods into bottom-up, top-down and referential approaches and notes the value of hybrid approaches.

### Lesson

We should not spend years rediscovering room packing.

### Difference to investigate

A layout generator often optimises a plan.

Our ambition is broader:

- architecture;
- structure;
- services;
- boundaries;
- construction;
- regulation;
- maintenance;
- evidence.

The plan is one projection.

## 10. Generative/computational building platforms

Commercial/research platforms to review in depth include:

- Hypar;
- Finch;
- TestFit;
- Autodesk Forma;
- Revit/Dynamo;
- Rhino/Grasshopper;
- Archicad parametric/object systems;
- Speckle and related data infrastructures.

This reconnaissance has **not yet** completed product-by-product capability analysis.

Future review should ask of each:

- what is the source-of-truth model?
- can invalid states be made unrepresentable?
- what semantics exist beyond geometry?
- how are engineering consequences handled?
- how are regulations represented?
- how are outputs/provenance versioned?
- can users extend the language?
- is the system generative, checking, or genuinely compiling?

## 11. Formal methods outside AEC

Architecture-description languages and formal methods in cyber-physical systems provide useful conceptual precedents.

Relevant ideas:

- explicit system architecture;
- multiple analysis models generated from one architecture;
- model checking;
- verification conditions;
- traceability;
- proof obligations;
- typed interfaces;
- compositional reasoning.

### Lesson

The compiler/type-safety analogy has serious engineering precedents.

### Warning

Buildings are not software.

Continuous physics, material variability, site conditions, workmanship and professional judgement prevent simplistic transfer of formal-method claims.

Use the analogy to structure thought, not to exaggerate certainty.

## 12. England — digital evidence and the golden thread

England's higher-risk-building regime requires digital building information and version control as part of the golden thread.

Government guidance emphasises:

- information showing compliance;
- digital records;
- version control;
- accurate and current information;
- change control.

In July 2026, the government's response on a Single Construction Regulator also described a forthcoming **Digital Building Control Roadmap** and prioritised interoperable data and consistent information standards.

### Lesson

A versioned, evidence-carrying building record is directionally compatible with regulatory digitalisation.

### Warning

Higher-risk-building golden-thread requirements do not automatically apply to the ordinary houses in our intended first domain.

Use them as precedent for information architecture, not as a false legal requirement for every dwelling.

## 13. SMART standards

BSI's 2025 annual reporting describes continuing work on standards that are **Machine Applicable, Readable and Transferrable (SMART)** and greater use of next-generation standards authoring.

PAS 1958:2026 provides a landscape guide to built-environment data/information standards and explicitly addresses preparation for AI adoption.

### Lesson

Do not design a long-term standards ingestion strategy on the assumption that standards will forever exist only as PDFs.

### Research need

Determine:

- what SMART content BSI actually exposes;
- licensing;
- identifiers;
- APIs;
- machine applicability;
- update/version semantics;
- suitability for executable engineering rules.

## 14. What appears distinctive so far

The following combination appears less common than its individual parts:

1. **Opinionated domestic architectural grammar** rather than neutral BIM.
2. **Correct-by-construction authoring** rather than solely downstream checking.
3. **Load paths, boundaries, services, maintenance and lifecycle** represented in the same semantic source.
4. **Long-life / replaceability doctrine** as formal obligations.
5. **Explicit compiler targets** for jurisdiction/version/route.
6. **Obligation discharge and evidence provenance** as core compilation semantics.
7. **Buildable production outputs**—not merely plan generation or compliance reporting.
8. **Non-expert authoring UX** with expert complexity held inside the system.
9. **Versioned recompilation of the building through later change.**

This is a hypothesis about the synthesis.

It is **not yet a novelty claim**.

## 15. Prior-art questions still unanswered

- Are there research systems that integrate structural resolution directly into generative domestic layout?
- Has any building design system adopted explicit proof-obligation semantics?
- Is there existing “proof-carrying BIM” literature we should adopt rather than rename?
- Which jurisdictions have the most advanced machine-readable building codes?
- What has happened in Singapore CORENET X, Norway, Finland and other digital-permitting programmes?
- Which commercial systems generate construction documentation/BOM from constrained building products?
- How close do modern house configurators / off-site manufacturers already come to “compiling” a bounded house?
- What can we learn from automotive/aerospace configuration systems?
- Are there formal ontologies for maintenance access and component withdrawal?
- Which open structural-analysis libraries or schemas express load paths semantically?
- How are building-product declarations being made machine-readable?
- What existing standards address product data templates, information need and digital twins?
- What are the failure modes of previous automated code-checking initiatives?
- How much manual formalisation remains necessary even with 2026 AI/ontology approaches?

These belong in W1 of the research programme.

## 16. Current research posture

The project should proceed on three assumptions:

1. **we are standing on substantial prior art;**
2. **the synthesis may still be unusual and valuable;**
3. **only an end-to-end paper compilation can show whether the synthesis coheres.**

## Sources / starting points

- buildingSMART, IFC 4.3 official: https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/
- buildingSMART, IFC Kernel: https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/ifckernel/content.html
- buildingSMART Data Dictionary: https://www.buildingsmart.org/users/services/buildingsmart-data-dictionary/
- buildingSMART, IDS: https://www.buildingsmart.org/standards/bsi-standards/information-delivery-specification-ids/
- Farghaly, Soman & Zhou, “The evolution of ontology in AEC”, Journal of Industrial Information Integration 36 (2023), 100519: https://doi.org/10.1016/j.jii.2023.100519
- Xue, Wu & Lu, “Semantic enrichment of building and city information models: A ten-year review”, Advanced Engineering Informatics 47 (2021), 101245: https://doi.org/10.1016/j.aei.2020.101245
- Purushotham, Kailashnath & Mutis, “Framework for automated building code compliance checking to improve transparency, trust, validation, and design interpretation”, Automation in Construction 181 (2026), 106598: https://doi.org/10.1016/j.autcon.2025.106598
- Zentgraf, Hagedorn & König, “A BIM-based framework for automated building code extraction and compliance checking”, Advanced Engineering Informatics 74 (2026), 104735: https://doi.org/10.1016/j.aei.2026.104735
- Lee, Ji & Ostwald, “Automated compliance checking across the building lifecycle”, Automation in Construction 185 (2026), 106859: https://doi.org/10.1016/j.autcon.2026.106859
- Weber, Mueller & Reinhart, “Automated floorplan generation in architectural design: A review of methods and applications”, Automation in Construction 140 (2022), 104385: https://doi.org/10.1016/j.autcon.2022.104385
- George Stiny, Shape: Talking about Seeing and Doing, MIT Press: https://mitpress.mit.edu/9780262693677/shape/
- UK Government, golden thread: https://www.gov.uk/guidance/keeping-information-about-a-higher-risk-building-the-golden-thread
- UK Government, Single Construction Regulator government response: https://www.gov.uk/government/consultations/single-construction-regulator-prospectus/outcome/single-construction-regulator-prospectus-government-response
- BSI, PAS 1958:2026: https://knowledge.bsigroup.com/products/built-environment-data-and-information-standards-landscape-guide
