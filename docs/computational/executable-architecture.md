# Executable Architecture — Computational Expression of the Long-Life House

**Status:** concept paper v0.1 — research trajectory, not an implementation specification  
**Purpose:** preserve the complete computational proposition in a form that can be understood and developed later with no prior conversation context.  
**Scope:** conceptual architecture only. No programming language, solver, CAD kernel, regulatory rule pack or product implementation is selected here.

> **The program should compile a habitat.**

## 1. The proposition

The Long-Life House has so far been expressed as architectural doctrine, strategies, patterns, reference implementations, delivery requirements and physical tests.

A further possibility follows from that work.

The project could also be expressed as a **constrained computational system for authoring and compiling houses**.

The user would not primarily draw arbitrary geometry and then ask a collection of downstream tools whether it is acceptable. They would manipulate meaningful architectural objects and relationships inside a deliberately opinionated system. The system would know that an object is a room, wall, opening, floor, structural support, service route, boundary, replaceable lining or maintenance path rather than merely a collection of surfaces and solids.

Those objects would carry enough semantics for the system to reason about:

- architectural topology and proportion;
- structure and load paths;
- construction systems and interfaces;
- services and maintenance geography;
- fire, acoustic, thermal, moisture and other boundaries;
- regulatory and standards obligations;
- quantities, materials and replaceability;
- assembly, inspection and future change.

Compilation would elaborate that semantic model into a coordinated building and a body of evidence.

The strongest version of the ambition is:

> **Within a deliberately bounded domain, a successful compile should mean that the proposed house is not merely drawable but resolved: its required relationships, supported structural conditions and selected compliance obligations have been discharged or explicitly evidenced.**

The word **bounded** is essential. Strong guarantees become plausible by restricting what the system is allowed to express.

## 2. Relationship to the architectural doctrine

This is **not Principle 11**.

It is not a replacement for the architectural doctrine and should not be allowed to make the project subordinate to software.

The doctrine should remain meaningful if no software is ever written.

The computational project is better understood as an **executable expression of the doctrine**.

The existing architectural chain remains:

```text
Doctrine
   ↓
Strategy
   ↓
Pattern
   ↓
Reference implementation
   ↓
Delivery requirement
   ↓
Test
```

The possible computational chain is:

```text
Doctrine
   ↓
Formal architectural model
   ↓
Semantic primitives + invariants + rules
   ↓
Compiler target
   ↓
Resolved building model
   ↓
Production outputs + evidence
```

The missing intellectual layer is therefore not “write a CAD program”.

It is **formalise enough of the architecture that the important propositions can be represented, reasoned about and tested computationally without reducing architecture to geometry**.

The software should be downstream of that formalisation.

The existing architect-facing implementation brief remains the project's current **human translation layer** from doctrine into a real commission. A future compiler might formalise part of that translation, but does not supersede the implementation brief today.

## 3. Why a compiler rather than a checker

Most digital building workflows begin with a model whose geometry can be almost arbitrarily authored. Structure, energy, code compliance, quantities and coordination are then analysed by separate processes.

That is useful, but it leaves a fundamental freedom intact: the source model can represent nonsense.

The stronger proposition is **correct-by-construction authoring**.

The author works in a language whose objects already know what kinds of relationships are permitted. The system prevents some invalid states from being expressed at all and rejects others during compilation.

A wall moved by 400 mm should not simply produce a new wall location. The move may alter:

- the proportion of two rooms;
- an elevation bay;
- a floor span;
- the bearing available to a beam;
- a stair or circulation dimension;
- a service route;
- a fire or acoustic boundary;
- a quantity and cost;
- a maintenance withdrawal route.

The authoring interface can remain simple because complexity is held by the model and compiler.

A representative interaction might be:

```text
Cannot move Wall W17 +400 mm.

Failed obligations:
- structural bay S4 exceeds supported span for assembly F02;
- stair landing clearance falls below target rule M.STAIR.014;
- west elevation leaves grammar range G.WEST.BAY.03.

Maximum valid movement under current configuration: +265 mm.
```

This is fundamentally different from drawing freely and receiving a report afterwards.

The software analogy is **type safety**. A short-lived service should not be attachable to a forbidden permanent zone without an explicit interface. A removable lining should not be capable of silently carrying a boundary that is required to survive its removal. A load-bearing opening should not exist without satisfying its support obligations. Where an invalid relationship is representable, it should become a compiler error rather than latent design debt.

## 4. The user should manipulate architectural meaning

The system should operate on **semantic building primitives**, not generic meshes.

Conceptually, a load-bearing external wall might carry information such as:

```text
ExternalWall
  role: load-bearing
  construction-family: masonry-cavity-01
  supported-by: foundation-F03
  supports: upper-floor-F17
  exposure: west
  openings: [W12, W13]
  boundaries: [thermal-envelope, air-boundary]
  service-policy: controlled-penetrations-only
```

This notation is illustrative only. It is not a proposed syntax.

A room should know that it is a room. A window should know that it is an opening through several coordinated layers. A removable lining should know which critical boundaries remain intact when it is removed. A structural member should participate in a load path rather than simply occupy space.

Geometry becomes one representation of the building, not the definition of the building.

## 5. The authoring experience

The long-term user-interface ambition is deliberately extreme:

> **A person who can competently manipulate a house in a building game should be able to explore this system without first becoming an architect, structural engineer, quantity surveyor or BIM technician.**

A deliberately provocative product test is: **could a twelve-year-old who understands a game such as *The Sims* manipulate the house while the system, rather than the child, carries the technical complexity?** The answer need not literally determine the audience. It captures the intended inversion: expert knowledge belongs in the constrained system rather than being demanded from every author.

The sophistication belongs inside the system.

The user may:

- add or remove a room;
- enlarge a room;
- move an opening;
- add a bay;
- change a roof family;
- alter a storey height;
- select between supported construction families;
- choose between valid layout alternatives.

They should not need to manually draw every beam, calculate every reaction, route every service or remember every dimensional rule.

The system should derive downstream consequences where it has authority to do so and reject unresolved consequences where it does not.

This is an interface ambition, **not a claim that a non-professional user thereby acquires legal competence or that professional responsibility disappears**.

### Product form

If developed, this should be understood as a **software product**, not merely a research script or plug-in.

The conceptual product is:

**interactive 3D authoring environment + semantic building model + compiler + versioned target/rule packs + evidence/production output system.**

The user experience may resemble unusually constrained CAD or a building game. The underlying product is closer to an integrated compiler toolchain. The 3D model is one view of the source and one compiled artefact; it is not the entire product.

No decision is made here about desktop versus web delivery, modelling kernel, storage model, implementation language or commercial form.

## 6. Opinionated architecture and proportion

The system is not intended to be geometrically neutral.

A central proposition is that architectural quality can be assisted by embedding a **declared architectural grammar**: relationships among room dimensions, heights, openings, axes, bays, circulation, hierarchy and façade composition.

This should not be confused with claiming that beauty is mathematically provable.

The system should distinguish at least three kinds of rule:

### Hard invariants

Conditions that must be true for the model to compile within its supported domain.

Examples may include:

- a resolved structural load path;
- required clearances;
- boundary continuity;
- permitted span ranges for a selected assembly;
- non-negotiable regulatory conditions;
- declared doctrine constraints where the system claims conformance.

### Grammar constraints

Conditions that are mandatory **within a selected architectural language**.

A chosen grammar may constrain:

- room proportion ranges;
- storey-height relationships;
- bay rhythms;
- opening families;
- alignments;
- hierarchy between principal and secondary spaces.

These rules are architectural commitments, not laws of nature. A different architectural grammar may make different commitments.

### Objectives and preferences

Conditions that can be optimised, ranked or warned about without pretending they are binary truth.

Examples may include:

- daylight quality;
- efficiency of circulation;
- symmetry;
- economy;
- material use;
- maintenance effort;
- preferred views;
- degree of proportional fit.

The distinction is essential. The compiler should be opinionated without disguising taste as structural or regulatory fact.

## 7. Structure is part of the semantic model

Structure should not be a late check against finished geometry.

Every load-bearing object should participate in an explicit structural graph.

At the simplest conceptual level:

```text
roof
  ↓
rafter / truss
  ↓
beam / bearing wall
  ↓
wall / column
  ↓
foundation
  ↓
ground
```

An unresolved load path should be a compile failure.

Changing an opening in a load-bearing wall should trigger whatever downstream structural consequences belong to that operation: lintel or beam selection, bearing, reactions, supporting construction and foundation effects.

The system need not initially solve arbitrary structural engineering.

The more credible path is a **closed library of supported structural systems and parameter ranges**, each backed by declared calculation methods, engineering evidence and test cases.

Where the model leaves that supported envelope, the correct output is not a guess.

It is:

```text
OUTSIDE SUPPORTED DOMAIN
External structural proof required.
```

Unsupported is not equivalent to invalid, but it is never equivalent to proven.

## 8. Compiler targets

A house does not compile against “the building regulations” in the abstract.

Compilation must be against an explicit, versioned **target**.

A target may eventually bind together:

- jurisdiction;
- regulatory date / transition regime;
- building category and use;
- selected compliance routes;
- referenced standards and national parameters;
- supported construction families;
- environmental and exposure assumptions;
- project-specific requirements.

A conceptual target might resemble:

```text
England.NewDwelling.<regulatory-version>
```

The name is illustrative. The important idea is that a compiled result is always relative to a declared body of rules and assumptions.

### England as the first jurisdiction

The initial research constraint should be **England**, not “the UK”.

England, Wales, Scotland and Northern Ireland have distinct regulatory systems. Attempting to universalise them at the outset would weaken the proposition.

An eventual first implementation should probably narrow further:

- new-build dwellings;
- a small range of one- and two-storey house types;
- a finite catalogue of construction systems;
- known material and structural families;
- explicit site assumptions.

Restriction is not a defect here. It is the source of stronger guarantees.

### Regulation, guidance and standards are different things

The target must preserve the distinction between:

1. **legal requirements** — the applicable Building Regulations and other law;
2. **statutory guidance / accepted compliance routes** — for example the relevant Approved Documents;
3. **technical standards** — British Standards, adopted European standards, Eurocodes and National Annexes where applicable;
4. **product evidence** — declarations, certifications, manufacturer data and tested systems;
5. **project requirements** — constraints chosen by the client or doctrine.

These should not be collapsed into one undifferentiated rule set.

Approved Documents provide guidance for common ways of satisfying the Building Regulations; they are not identical to the legal requirements themselves. A compiler target must therefore record **which compliance route it is implementing**, not silently redefine guidance as law.

Likewise, British Standards and many related standards are copyrighted works. Any future machine-executable standards layer will require a deliberate licensing and provenance strategy rather than simply copying standards text into a repository.

## 9. Compilation as obligation discharge

A useful mental model is that compilation creates and attempts to discharge a graph of **obligations**.

For example:

```text
opening W12
  ├─ architectural grammar obligation
  ├─ structural support obligation
  ├─ thermal continuity obligation
  ├─ water-management obligation
  ├─ ventilation consequence
  ├─ quantity/material consequence
  └─ replacement/access obligation
```

An obligation may be discharged by:

- a deterministic rule;
- a calculation;
- a geometry query;
- a tested library assembly;
- product evidence;
- an approved external calculation or professional evidence item.

An obligation that cannot be discharged must remain visible.

The system should fail closed rather than converting uncertainty into a green tick.

A mature compilation result might therefore distinguish:

- **passed** — obligation resolved within the supported system;
- **passed by declared external evidence** — obligation resolved by a referenced evidence item outside the compiler;
- **warning / preference deviation** — valid but outside a preferred condition;
- **failed** — rule violated;
- **unsupported / unresolved** — the system does not know how to prove the condition.

A successful release-grade compile should contain **no hidden unresolved obligations**.

## 10. The evidence bundle

The output should not merely be a 3D model.

The compiled building should carry enough provenance that another person can understand **why the system believes it is resolved**.

Potential outputs include:

- coordinated semantic model;
- 3D geometry and open exchange formats such as IFC where useful;
- plans, sections, elevations and detail drawings;
- structural calculation outputs and load-path records;
- regulatory compliance matrix;
- rule-by-rule evidence trace;
- assumptions register;
- standards and source-version register;
- boundary register;
- interface register;
- tolerance/workmanship requirements;
- quantity take-off;
- bill of materials;
- bill of quantities / cost-plan inputs;
- embodied-carbon quantities where datasets permit;
- component and product schedules;
- assembly and inspection information;
- maintenance and replacement information;
- building record / handover dataset;
- machine-readable compilation manifest.

A manifest might eventually identify:

- source-model version or hash;
- compiler version;
- compiler target and version;
- rule-pack versions;
- input datasets;
- unresolved warnings;
- external evidence;
- generated artefacts.

The aspiration is a **verifiable, reproducible building release**, not an unexplained green badge.

## 11. The proof boundary

“Proof” is useful language only if its boundary remains explicit.

A compiler can potentially prove propositions about **its model under declared assumptions and within its supported domain**.

It cannot prove, merely by compiling, that physical construction will match that model.

Examples of facts that may remain external include:

- actual ground conditions before adequate site investigation;
- material substitutions;
- workmanship;
- installation quality;
- hidden site changes;
- damage during construction;
- commissioning results;
- later unauthorised alterations.

The computational system therefore divides the problem:

```text
DESIGN CONFORMANCE
      │
      │ compiler + evidence
      ▼
RESOLVED DIGITAL BUILDING
      │
      │ procurement + construction + inspection + commissioning
      ▼
PHYSICAL CONFORMANCE
```

The design system proves what it legitimately can.

Construction records, inspection, testing and commissioning establish whether reality corresponds sufficiently to the resolved design.

Building control and statutory responsibility are not “compiled away”.

The stronger opportunity is to give them a far more explicit, traceable and inspectable body of evidence.

## 12. Relationship to the Long-Life House principles

The computational direction is unusually compatible with the existing doctrine because many of the doctrine's concerns are already about explicit relationships.

| Architectural doctrine | Possible computational expression |
|---|---|
| Build for time | lifecycle state and future-change scenarios are part of the model |
| Preserve permanent fabric | attachment and penetration rules distinguish lifespan layers |
| Design the interface | interfaces become explicit typed relationships |
| Failure architecture | failure paths and consequence zones become checkable obligations |
| Maintenance geography | approach, working and withdrawal volumes become spatial constraints |
| Ordinary parts in extraordinary arrangements | finite standard libraries and stable interfaces |
| Let permanence be architectural | permanent spatial order can be a first-class constraint |
| Passive architecture does the first work | passive performance strategies precede active-system elaboration |
| Legibility across generations | compiled records preserve semantic intent and provenance |
| Resolve technology as architecture | technical elements remain subject to the architectural grammar |

Workmanship robustness also maps naturally:

- incoming tolerance becomes declared data;
- controlling datums become model relationships;
- adjustment range becomes explicit;
- remediation thresholds become constraints;
- inspection points become compilation / construction requirements.

This compatibility is significant, but it should be investigated rather than used as proof that every doctrine proposition must become machine-enforceable.

## 13. Patterns may become a standard library

The pattern catalogue is a plausible bridge between doctrine and implementation.

A mature pattern might eventually have two representations:

1. the architectural pattern as published — problem, forces, trade-offs, evidence and architectural resolution;
2. a formalised computational counterpart — typed inputs, constraints, compatible assemblies, obligations and generated outputs.

That would make the catalogue resemble a **standard library of architectural responses**.

The analogy should not be pushed too far. A pattern is richer than a function and often admits judgement and variants.

Nevertheless, the distinction already present in the project is promising:

> doctrine says **why**;  
> patterns describe reusable **ways**;  
> a compiler could enforce the formal subset of **how**.

## 14. A closed world is a feature

The first computational system should **not** attempt to compile arbitrary architecture.

A small trusted language is more valuable than a vast permissive one if the purpose is strong guarantees.

The initial system might support only:

- a handful of house topologies;
- one jurisdiction;
- a small set of structural grids and span families;
- several tested wall/floor/roof assemblies;
- known opening types;
- explicit service strategies;
- limited architectural grammars;
- predefined interface families.

A user who wants something outside the language has several legitimate outcomes:

- choose another supported solution;
- introduce an externally evidenced exception;
- extend the language after proper engineering and research;
- leave the system.

The compiler should never respond to an unsupported architectural idea by quietly inventing confidence.

## 15. The building becomes versionable

The computational idea extends naturally beyond first construction.

A future alteration could be represented as a change to the same semantic source model.

The system could then expose:

- what permanent fabric is affected;
- what interfaces change;
- what boundaries are disturbed;
- what structure changes;
- which rule target applies;
- what components become obsolete;
- what new evidence is required.

This gives the building record an unusually strong form.

The house is not merely handed over with drawings.

It retains a **versioned description of what it is and why**.

That directly serves the existing stewardship doctrine.

## 16. Trust architecture

If this system is ever used to make safety or compliance claims, its own trustworthiness becomes part of the architectural problem.

The future implementation should therefore favour:

- deterministic and reproducible checks for hard obligations;
- explicit rule provenance;
- versioned targets and datasets;
- conformance test suites for rule implementations;
- inspectable calculations;
- audit logs;
- stable identifiers for model entities and requirements;
- declared assumptions;
- visible external proof obligations;
- open exchange formats where practical.

AI may eventually be useful for:

- interpreting user intent;
- suggesting arrangements;
- explaining failures;
- navigating standards;
- generating alternatives.

It should not become an opaque authority whose unsupported assertion is treated as structural or regulatory proof.

The pass/fail path must remain auditable.

## 17. Existing work and prior art

This concept does not begin from a claim that computational design, BIM compliance checking or machine-readable rules are new.

Relevant existing directions include:

- **Industry Foundation Classes (IFC)** and the wider buildingSMART openBIM ecosystem for semantic building data and interoperability;
- **Information Delivery Specification (IDS)**, which defines machine-interpretable information requirements and supports automated checking of IFC model information, while currently excluding general geometric checking;
- research into **rule-based BIM compliance checking and generative design**, including systems in which formal rules can both evaluate and generate compliant arrangements;
- computational building platforms such as **Hypar**, which package and execute building design logic and support rapid constrained planning;
- digital building-control and change-control processes that increasingly depend on structured, traceable project information.

The Long-Life House computational proposition should therefore be positioned as a **specific synthesis and extension**, not as a claim to have invented rule-based design.

Its distinctive research question is narrower and stronger:

> **Can an architecturally opinionated, deliberately bounded domestic design language unify spatial grammar, tectonics, long-life doctrine, structure, selected regulatory obligations, quantities and evidence strongly enough that compilation produces a genuinely buildable house rather than merely a plausible model?**

That question still requires a serious prior-art review before any novelty claim is made.

## 18. Anti-drift rules

The following interpretations are rejected.

- **“This is just BIM.”**  
  No. BIM may be an interchange/output technology. The proposition is semantic constraint and compilation from a controlled architectural language.

- **“This is generative AI for houses.”**  
  No. Generation may assist exploration, but validity must come from explicit constraints, calculations and evidence.

- **“The compiler replaces architects and engineers.”**  
  Not as a premise. It relocates and formalises repeatable knowledge. Competent judgement remains necessary wherever the system's supported domain ends or where regulation, engineering and architecture require it.

- **“A green compile means building control approval.”**  
  No. Compilation can assemble evidence against a declared target. Statutory approval remains a real-world legal process.

- **“Approved Documents are the Building Regulations.”**  
  No. The target must preserve the distinction between legal requirement and a selected compliance route.

- **“Anything aesthetically good can be reduced to equations.”**  
  No. The system can implement a declared architectural grammar and evaluate defined relationships. It should not pretend to prove beauty.

- **“Any geometry should be supported.”**  
  No. The closed domain is the mechanism by which meaningful guarantees become possible.

- **“Unsupported means probably fine.”**  
  No. Unsupported conditions produce explicit proof obligations or failure.

- **“The 3D model is the product.”**  
  No. The product is the resolved semantic building plus its production information and evidence.

- **“Implementation should begin immediately.”**  
  No. The concept first needs formalisation, prior-art research and a credible proof boundary.

## Research programme and canonical follow-on documents

The computational concept now has a structured pre-implementation research programme.

Before adding new computational work, consult:

- [Computational Track index](README.md);
- [Research Programme](research-programme.md) — master workstreams, grand TODO register, dependency graph and implementation gates;
- [Formal Architectural Model](formal-architectural-model.md) — semantic entity/relationship model;
- [Validity and Obligations](validity-and-obligations.md) — what compile success/failure means and how obligations are discharged;
- [Compiler Targets](compiler-targets.md) — versioned external normative environments;
- [Prior Art Map](prior-art-map.md) — current reconnaissance and unanswered prior-art questions.

These documents deliberately sit between the concept paper and any future implementation.

The current governing rule is:

> **No formal language or software architecture before an end-to-end paper compilation has demonstrated that the semantic model, obligation system and evidence model cohere on a real piece of the Reference House.**

## 19. Future development sequence

No implementation work is authorised by this concept paper.

When the computational track is resumed, the recommended sequence is:

1. **Prior-art review**  
   Map existing generative design, BIM semantics, automated code checking, structural design automation, digital permitting, formal methods and building-product data.

2. **Supported-domain definition**  
   Define the first house types, jurisdiction, construction systems and exclusions.

3. **Semantic model**  
   Define what entities exist and what relationships matter before choosing syntax or CAD technology.

4. **Obligation taxonomy**  
   Separate architectural grammar, doctrine invariants, structure, regulation, standards, product evidence, project requirements and preferences.

5. **Compiler-target model**  
   Define how jurisdiction, date, standards, compliance routes and assumptions are versioned.

6. **Proof / evidence model**  
   Define what a successful compile claims, how claims are evidenced, and which conditions remain external.

7. **Minimal formal grammar**  
   Only then define the first machine-readable primitives, types and rules.

8. **Reference-house conformance case**  
   Attempt to express a tightly bounded fragment of the Reference House and discover where the model fails.

9. **Prototype authoring environment**  
   Build the smallest interactive environment capable of proving or disproving the central idea.

The first software milestone should not be “draw a house in 3D”.

It should be:

> **Represent one small but real piece of domestic architecture semantically enough that an invalid change produces an intelligible compile failure and a valid change produces traceable downstream evidence.**

## 20. Current repository position

For now, this document is the canonical record of the computational concept.

It is deliberately **not yet integrated as a new governing principle or a numbered manuscript part**.

The next publication-level decision should be made only after the formal model and prior-art work establish whether executable architecture belongs:

- as a final part of the monograph;
- as a companion research volume;
- as a separate software/product specification;
- or as some combination of the above.

The architectural project remains primary.

The computational ambition is to make more of that architecture **executable, constrained, reproducible and verifiable**.

> **Do not merely draw a house and check it afterwards. Define a language in which a resolved house can be compiled.**

---

## Initial reference points

These are starting points for later research, not an exhaustive literature review.

- buildingSMART International, **Industry Foundation Classes (IFC)** and openBIM standards: https://www.buildingsmart.org/standards/
- buildingSMART International, **Information Delivery Specification (IDS)**: https://www.buildingsmart.org/standards/bsi-standards/information-delivery-specification-ids/
- Christoph Sydora and Eleni Stroulia, **Rule-based compliance checking and generative design for building interiors using BIM**, *Automation in Construction* 120 (2020), 103368: https://doi.org/10.1016/j.autcon.2020.103368
- Hypar, **Documentation / computational building planning platform**: https://docs.hypar.io/
- UK Government, **Approved Documents — Building Regulations guidance for England**: https://www.gov.uk/government/collections/approved-documents
- UK Government, **Preparing information for a building control approval application**: https://www.gov.uk/guidance/preparing-information-for-a-building-control-approval-application
- BSI, **Intellectual property in standards**: https://standardsdevelopment.bsigroup.com/home/IntellectualProperty
