# Executable Architecture — Research Programme

**Status:** master computational research programme v0.1  
**Purpose:** preserve the grand TODOs, dependency structure, decision gates and unresolved research questions so the computational track can be resumed without relying on conversational memory.  
**Implementation:** explicitly deferred.

## 1. Programme objective

The computational track exists to test one proposition:

> **Can a deliberately bounded domestic architectural system be represented strongly enough that a user manipulates meaningful building primitives and a successful compilation produces a resolved, traceable and buildable design rather than merely plausible geometry?**

The programme should not drift into “build some CAD”.

The central intellectual work is to define:

1. the building world the software would reason about;
2. the kinds of validity that matter;
3. the obligations created by design decisions;
4. the evidence that can discharge those obligations;
5. the regulatory/normative environment against which claims are made;
6. the limits of the supported world;
7. the boundary between machine proof and professional / physical verification.

Only after those questions are coherent should a programming language, solver stack or CAD technology be selected.

## 2. Programme principles

### Architecture remains primary

The software is an executable expression of the architectural doctrine, not the reason the doctrine exists.

A proposition that makes architectural sense only because it is convenient to encode should be treated with suspicion.

### Formalise before automating

Automation should follow explicit concepts.

Do not let implementation data structures become the accidental ontology of the house.

### Closed world before universal system

Strong guarantees require restriction.

The first credible system should intentionally know how to compile a small family of excellent houses rather than pretend to understand arbitrary architecture.

### Explainability before apparent intelligence

A hard pass/fail result should be traceable to explicit rules, calculations, assumptions and evidence.

AI may assist interpretation and exploration. It should not become the hidden source of a structural or regulatory truth claim.

### Unsupported is a first-class result

The system must be allowed to say:

> **I do not know how to prove this.**

Unsupported is different from failed, and both are different from passed.

### Preserve provenance

The project should be able to explain not only **what** passed, but:

- against which target;
- using which rule version;
- under which assumptions;
- by which calculation or evidence item;
- from which source requirement;
- for which version of the building.

## 3. The major workstreams

The workstreams below are deliberately broader than individual files. They are the durable research agenda.

### W1 — Prior art and intellectual positioning

**Question:** what has already been solved, what has repeatedly failed, and where is the actual research contribution?

Research areas:

- semantic BIM and IFC;
- building ontologies and linked building data;
- buildingSMART Data Dictionary;
- Information Delivery Specification;
- automated code compliance checking;
- machine-readable / SMART standards;
- digital permitting and building control;
- shape grammars;
- architectural style grammars;
- parametric and generative planning;
- constraint programming;
- structural design automation;
- building-services network modelling;
- quantity and cost derivation;
- formal methods and proof-carrying systems outside AEC;
- versioned digital building records / golden-thread approaches.

**Output:** living prior-art map, then a proper literature review before novelty claims.

**Current state:** initial reconnaissance exists in [Prior Art Map](prior-art-map.md).

### W2 — Formal architectural model

**Question:** what does the system believe a house consists of?

The model must describe more than objects.

It must represent overlapping relationships between:

- spaces;
- physical assemblies;
- structure;
- boundaries;
- services;
- interfaces;
- tolerances;
- maintenance and replacement;
- time / lifecycle;
- requirements and evidence.

**Output:** [Formal Architectural Model](formal-architectural-model.md), followed later by a machine-independent schema.

**Current state:** conceptual v0.1 established.

### W3 — Validity and obligation model

**Question:** what does “this house compiles” actually mean?

Distinguish:

- well-formed model;
- semantic validity;
- supported-domain validity;
- structural resolution;
- boundary / building-physics validity;
- regulatory conformance against a selected route;
- Long-Life House doctrine conformance;
- selected architectural-grammar conformance;
- constructability/workmanship resolution;
- evidence completeness;
- advisory quality objectives.

Define:

- error;
- warning;
- unresolved;
- unsupported;
- externally discharged obligation;
- passed obligation;
- release-grade compile.

**Output:** [Validity and Obligations](validity-and-obligations.md).

**Current state:** conceptual v0.1 established.

### W4 — Evidence and provenance architecture

**Question:** how does the compiled building show its working?

Every material claim should eventually be traceable through:

~~~text
model condition
   ↓
obligation
   ↓
applicable rule / source
   ↓
method of resolution
   ↓
calculation / geometry query / tested assembly / external evidence
   ↓
result
   ↓
output artefact
~~~

Research:

- evidence identifiers;
- calculation records;
- rule provenance;
- source/version provenance;
- assumptions;
- external professional evidence;
- product evidence;
- model hashes / release manifests;
- change impact;
- reproducible compilation.

**Output:** dedicated evidence/provenance specification.

**Current state:** conceptual v0.1 established in [Evidence and Provenance Architecture](evidence-and-provenance.md). The next test is application to the first paper-compilation slice.

### W5 — Compiler-target model

**Question:** against exactly what normative environment is the building compiled?

The target should cover external requirements such as:

- jurisdiction;
- effective date;
- transition regime;
- building/use class;
- applicable legislation;
- selected statutory-guidance route;
- referenced standards / national parameters;
- regulatory amendments.

Do **not** put everything into the target.

Architectural grammar, supported technical systems, project brief and site facts are separate inputs to the build configuration.

**Output:** [Compiler Targets](compiler-targets.md).

**Current state:** conceptual v0.1 established.

### W6 — Supported-domain definition

**Question:** what is the smallest closed world large enough to produce real architectural variety?

Candidate first domain:

- England;
- new-build houses;
- perhaps one- and two-storey detached / semi-detached forms initially;
- limited structural systems;
- limited envelope families;
- finite roof families;
- explicit service strategies;
- known spans and interface families;
- selected long-life patterns.

The goal is not yet to choose the answer, but to find the **minimum credible domain**.

**Output:** supported-domain specification with explicit inclusions, exclusions and extension rules.

**Current state:** candidate v0.1 established in [Supported Domain](supported-domain.md). Domain S0 and candidate H1 are now separated; engineering envelopes remain open.

### W7 — Architectural grammar and proportion

**Question:** how can the system be architecturally opinionated without pretending that beauty is a statutory calculation?

Research should cover:

- room proportion;
- ceiling-height relationships;
- hierarchy of principal / secondary spaces;
- axes;
- enfilade and circulation;
- bay structure;
- opening families;
- solid-to-void relationships;
- façade hierarchy;
- stairs;
- thresholds;
- courtyard relationships;
- daylight and prospect;
- Georgian and other formal grammars;
- shape-grammar literature;
- where numerical ratios are useful and where relational rules are stronger.

Required distinction:

**hard grammar rule** vs **objective/preference** vs **human judgement**.

**Output:** architectural-grammar position paper, followed eventually by one explicit grammar family.

**Current state:** foundational position v0.1 established in [Architectural Grammar and Proportion](architectural-grammar-and-proportion.md), with scope/method in the [G-01 Research Brief](g01-research-brief.md), D1/D2 in the [G-01 Corpus and Source-Quality Register](g01-corpus-register.md), and D3 annotation contract/trials in the [G-01 Precedent Annotation Schema](g01-annotation-schema.md). Active work is source-phase reconciliation and completion of the three trial annotations before candidate-rule extraction.

### W8 — Structural semantics

**Question:** what is the minimum structural representation that makes “load path” a first-class property rather than a post-hoc analysis?

Research:

- support graph;
- actions and combinations;
- spanning direction;
- tributary areas;
- reaction propagation;
- stability systems;
- openings;
- bearings;
- foundations;
- supported member families;
- calculation provenance;
- out-of-domain engineering.

Do not attempt arbitrary structural engineering initially.

**Output:** structural semantic model and definition of supported proof envelope.

**Current state:** partly sketched in the concept paper only.

### W9 — Boundary and building-physics semantics

**Question:** how are thermal, air, vapour, water, acoustic, fire, smoke, security and pest boundaries represented independently of decorative layers?

The model should support:

- continuity;
- opening;
- penetration;
- transition;
- sealing;
- drainage;
- redundancy;
- removability;
- reinstatement;
- failure path.

This work has direct overlap with existing Long-Life House doctrine.

**Output:** boundary ontology / graph and obligation patterns.

**Current state:** architectural concepts exist; formalisation open.

### W10 — Service-network and maintenance semantics

**Question:** how does the model represent both flow networks and the physical geography needed to maintain them?

Research:

- source / sink;
- network topology;
- ports;
- isolation;
- route;
- fall / drainage;
- capacity;
- segregation;
- access route;
- working volume;
- withdrawal volume;
- replacement sequence.

**Output:** service and maintenance semantic model.

**Current state:** doctrine is relatively mature; computational formalisation open.

### W11 — Construction, tolerance and workmanship model

**Question:** can the design compiler reason about the transition from precise digital geometry to variable physical construction?

Carry forward workmanship robustness:

- nominal geometry;
- incoming tolerance;
- controlling datum;
- adjustment mechanism;
- adjustment range;
- remediation threshold;
- inspection point;
- assembly sequence;
- representative-installer test evidence.

**Output:** computational tolerance / assembly model.

**Current state:** strong architectural doctrine exists; formal representation open.

### W12 — Cost, quantity, carbon and procurement semantics

**Question:** which downstream commercial outputs can genuinely descend from the same semantic source?

Research:

- quantity derivation;
- bill of materials;
- bill of quantities;
- work sections;
- waste factors;
- labour assumptions;
- cost data provenance;
- embodied-carbon datasets;
- product substitutions;
- procurement packages.

Do not promise “automatic QS” until the distinction between geometric quantity and commercial pricing knowledge is explicit.

**Output:** downstream-information model.

**Current state:** open.

### W13 — Versioned building and change compilation

**Question:** can the same source model govern later alterations?

A change should reveal:

- impacted elements;
- broken obligations;
- superseded evidence;
- new target implications;
- disturbance to permanent fabric;
- boundary impact;
- quantity delta;
- maintenance consequences.

**Output:** building-version / change-impact model.

**Current state:** concept only.

### W14 — Human authoring model

**Question:** what should the user be allowed to manipulate?

The product ambition remains:

> sophisticated system; simple authoring experience.

Research:

- direct manipulation;
- semantic editing rather than mesh editing;
- valid-range feedback;
- explanation of compiler errors;
- generated alternatives;
- controlled escape hatches;
- expert mode;
- visualisation of load paths, boundaries, service routes and evidence;
- the “twelve-year-old Sims player” test.

**Output:** interaction principles and paper UX prototypes.

**Current state:** concept only.

### W15 — Paper compilation

**Question:** does the compiler metaphor survive contact with an actual house before code exists?

Manually compile a bounded part of the Reference House.

Start with one representative slice:

- one principal room;
- one external wall bay with a window;
- one upper floor bearing;
- one service/interface condition.

For that slice, manually produce:

~~~text
intent
→ semantic source objects
→ relationships
→ generated obligations
→ target rules
→ doctrine rules
→ structural consequences
→ boundary consequences
→ construction/tolerance consequences
→ quantities
→ evidence
→ errors/warnings
→ compiled outputs
~~~

**Output:** paper-compilation case study.

**Current state:** not started.

This is the principal **pre-implementation integration test**.

## 4. Dependency structure

The programme should not be executed as fifteen independent essays.

The critical path is:

~~~text
W1 PRIOR ART ───────────────────────────────────────┐
                                                    │
W2 FORMAL MODEL                                     │
      │                                             │
      ├────────► W7 ARCHITECTURAL GRAMMAR           │
      ├────────► W8 STRUCTURE                       │
      ├────────► W9 BOUNDARIES                      │
      ├────────► W10 SERVICES                       │
      └────────► W11 CONSTRUCTION                   │
      │                                             │
      ▼                                             │
W3 VALIDITY / OBLIGATIONS                           │
      │                                             │
      ├────────► W4 EVIDENCE / PROVENANCE           │
      │                                             │
      ▼                                             │
W5 COMPILER TARGETS                                 │
      │                                             │
      ▼                                             │
W6 SUPPORTED DOMAIN ◄───────────────────────────────┘
      │
      ▼
W15 PAPER COMPILATION
      │
      ▼
FORMAL LANGUAGE / SYSTEM ARCHITECTURE
      │
      ▼
IMPLEMENTATION
~~~

W12–W14 can develop alongside the core once W2/W3 are stable enough.

## 5. Decision gates

### Gate A — Concept coherence

Required before formal-language design.

Must have:

- coherent formal architectural model;
- validity taxonomy;
- obligation/evidence model;
- compiler-target model;
- explicit proof boundary.

### Gate B — Domain coherence

Required before implementation architecture.

Must have:

- first supported-domain proposal;
- first architectural grammar;
- first structural proof envelope;
- boundary/service semantics sufficient for one house slice;
- clear unsupported-condition behaviour.

### Gate C — Paper compilation

Required before software implementation.

At least one real Reference House slice must be manually compiled end-to-end.

The exercise must demonstrate:

- meaningful source semantics;
- generated obligations;
- at least one deliberate compile failure;
- at least one external proof obligation;
- traceable evidence;
- derived quantities/geometry;
- intelligible result to a human reviewer.

If this cannot be done convincingly on paper, building software is premature.

### Gate D — Implementation readiness

Only after Gate C ask:

- language / data representation;
- constraint solver;
- geometry kernel;
- structural engine strategy;
- rule engine;
- storage/versioning;
- UI framework;
- IFC/export architecture;
- deployment;
- security;
- commercial model.

## 6. Grand TODO register

These items should not be lost even if priorities change.

| ID | TODO | Depends on | State |
|---|---|---|---|
| C-001 | Complete serious prior-art literature map | — | active |
| C-002 | Define semantic entity families | — | first draft |
| C-003 | Define canonical relationship vocabulary | C-002 | first draft |
| C-004 | Define identity, decomposition and version semantics | C-002 | open |
| C-005 | Define derived-view versus source-of-truth rules | C-002 | first draft |
| C-006 | Define validity dimensions | C-002 | first draft |
| C-007 | Define obligation object and lifecycle | C-006 | first draft |
| C-008 | Define evidence/provenance object model | C-007 | first draft |
| C-008A | Define time-phased evidence obligations and evidence-plan semantics | C-008 | first draft |
| C-008B | Test evidence invalidation on paper-compilation mutation | C-008 | blocked on W15 |
| C-009 | Define compile status / release semantics | C-006,C-007 | first draft |
| C-010 | Define compiler-target anatomy | — | first draft |
| C-011 | Research England regulatory versioning / transition rules | C-010 | active |
| C-012 | Determine standards licensing / machine-readable strategy | C-010 | open |
| C-013 | Distinguish building-regulations target from planning constraints | C-010 | first draft |
| C-014 | Define initial supported-domain candidates | C-002,C-006 | candidate v0.1 |
| C-014A | Specify Domain S0 paper-compilation slice | C-014 | complete v0.1 |
| C-014B | Define candidate H1 structural proof envelope | C-014,C-017 | open |
| C-014C | Select first supported roof family | C-014 | open |
| C-014D | Decide first foundation proof strategy | C-014 | open |
| C-014E | Define initial native/external/unsupported capability matrix | C-014 | first draft |
| C-015 | Research architectural grammars and proportion deeply | W1 | initial foundation complete; corpus research continues |
| C-016 | Define layered architectural-grammar model | C-015 | first draft |
| C-016A | Define G-01 scope and precedent corpus strategy | C-015,C-016 | complete v0.1 |
| C-016A1 | Build G-01 corpus + source-quality register | C-016A | complete v0.1 |
| C-016A2 | Acquire/index source packs for Marble Hill, Danson and 76 Dean Street | C-016A1 | active; first source IDs indexed |
| C-016B | Create semantic annotation schema for precedent corpus | C-002,C-016A | D3 v0.1 established; qualitative trial started |
| C-016B1 | Reconcile Marble Hill source phases and complete metric/topology annotation | C-016A2,C-016B | active |
| C-016B2 | Extract authoritative Danson principal-floor/section evidence | C-016A2,C-016B | open |
| C-016B3 | Retrieve Survey of London plan evidence for 76 Dean Street | C-016A2,C-016B | open |
| C-016C | Extract candidate topology/hierarchy/proportion/elevation rules | C-016B | open |
| C-016D | Mutation-test candidate grammar against strong precedents and near-misses | C-016C | open |
| C-016E | Draft first executable-independent G-01 rule specification | C-016D | open |
| C-017 | Formalise structural support/load graph | C-002 | open |
| C-018 | Define first supported structural proof envelope | C-017,C-014 | open |
| C-019 | Formalise critical boundary graph | C-002 | open |
| C-020 | Formalise service network + maintenance volumes | C-002 | open |
| C-021 | Formalise interface/tolerance model | C-002 | open |
| C-022 | Map doctrine principles to formal predicates/obligations | C-006 | open |
| C-023 | Map pattern catalogue to candidate standard-library entries | C-022 | open |
| C-024 | Define quantity/BOM derivation semantics | C-002 | open |
| C-025 | Define BoQ/cost knowledge boundary | C-024 | open |
| C-026 | Define carbon-data provenance | C-024,C-008 | open |
| C-027 | Define change-impact / recompilation model | C-004,C-007 | open |
| C-028 | Define inspection/commissioning evidence feedback | C-008 | open |
| C-029 | Define building-release manifest concept | C-008,C-009 | open |
| C-030 | Design paper compilation case | C-014,C-016,C-018,C-019 | S0 fixture v0.1 established; technical prerequisites open |
| C-031 | Execute paper compilation | C-030 | blocked |
| C-032 | Red-team proof claims with structural/regulatory expertise | C-031 | blocked |
| C-033 | Decide whether computational material enters monograph Part VI | C-031 | blocked |
| C-034 | Design formal language / syntax | Gate C | deliberately deferred |
| C-035 | Select implementation architecture | Gate C | deliberately deferred |
| C-036 | Build software prototype | Gate D | deliberately deferred |

## 7. Questions that must remain open

Do not resolve these by assertion.

- How much architectural quality can be encoded as grammar without producing sterile repetition?
- Which dimensions should be solved, which constrained, and which chosen by a person?
- Is “correct by construction” realistically achievable for structure and building physics, or only within narrow certified envelopes?
- How should conflicting obligations be represented?
- How are alternative compliance routes compared?
- Can a compiler legitimately infer applicability of complex regulatory exceptions, or should some require explicit human confirmation?
- How much site information must exist before a release-grade compile is meaningful?
- What happens when a standard is revised but an older target remains legally applicable under transitional provisions?
- How should proprietary product evidence enter a reproducible build?
- What is the acceptable boundary between internal semantic model and IFC interoperability?
- How should local planning policy eventually interact with, but remain distinct from, building-regulations compilation?
- Can the built house feed inspection and commissioning results back into the same evidence graph?
- Can the building be recompiled after thirty years when software, standards and products have changed?
- What is the minimum source model that still produces trustworthy quantity and cost information?
- What kinds of professional judgement should **never** be disguised as deterministic compiler logic?

## 8. Research record discipline

Each future computational research note should state:

- question;
- why it matters;
- current hypothesis;
- evidence / precedents;
- model impact;
- unresolved issues;
- decision;
- downstream TODOs.

A settled conclusion should be promoted into the relevant canonical computational document.

Exploratory notes should not silently redefine the canonical model.

## 9. Immediate next research sequence

Unless new evidence changes the order, the next non-implementation sequence should be:

1. deepen the **formal architectural model** through worked examples;
2. apply the **validity / obligation / evidence** model to worked examples and paper-compilation dependencies;
3. acquire the **G-01 trial source packs** and run D3 semantic annotation on Marble Hill, Danson and 76 Dean Street;
4. harden **Domain S0** for paper compilation and candidate H1 technical envelopes;
5. formalise the first **structural + boundary slice**;
6. design and execute the **paper compilation**.

That sequence should produce enough information to decide whether the compiler concept is genuinely architectural infrastructure or merely an attractive analogy.

## 10. Stop condition

The project should be willing to weaken or abandon the compiler framing if research shows that:

- crucial building decisions cannot be represented without destructive simplification;
- strong guarantees collapse into endless exceptions;
- the semantic model merely recreates BIM with new vocabulary;
- the evidence burden makes compilation less legible rather than more;
- architectural quality depends on freedoms that the closed world cannot admit;
- or the paper compilation fails to create a useful, reviewable result.

The idea earns continuation by surviving its own tests.

## Research signals as of October 2026

Several external developments support continuing the investigation without proving our proposition:

- IFC already treats objects, relationships and properties as first-class semantic entities and supplies multiple relationship concepts rather than reducing a building to geometry.
- buildingSMART IDS demonstrates interoperable machine-readable information requirements, while explicitly not covering general geometry.
- current automated-compliance research increasingly emphasises semantic models, rule provenance, traceability, versioning and human oversight.
- England's building-safety regime has strengthened requirements around digital records, version control, change control and evidence for higher-risk buildings; government has also signalled a wider digital-building-control roadmap.
- BSI is actively developing SMART (machine applicable/readable/transferrable) standards capability.
- shape-grammar research demonstrates that architectural design languages can be formal enough to generate recognisable families while remaining genuinely spatial.

These are reasons to research the synthesis carefully, not evidence that the Long-Life House compiler already exists.
