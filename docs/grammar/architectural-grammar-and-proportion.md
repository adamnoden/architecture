# Architectural Grammar and Proportion — Framework v0.3

**Status:** foundational framework; style-neutral  
**Purpose:** define how selectable architectural languages can become explicit enough to guide or constrain generation without confusing one language with House Systems Architecture itself  
**Implementation:** none

> **The grammar framework should make a selected architectural language explicit. It should not silently select the language for the project.**

## 1. The actual claim

House Systems Architecture may support strongly opinionated architecture without embedding one style in the doctrine or compiler core.

The computational proposition is therefore not that beauty can be reduced to universal ratios. It is that a **selected architectural grammar** can describe enough topology, hierarchy, ordering, dimensional families, alignments, plan/section/elevation relationships, element families and preferences to distinguish well-formed members of that language from malformed ones.

The linguistic analogy remains useful up to a point: grammar can distinguish a well-formed sentence from an ill-formed one; it cannot prove the sentence profound. Architectural grammar can define membership and coherence without exhausting architectural quality.

A grammar is consequently an input to the system, not an upstream consequence of House Systems Architecture doctrine.

## 2. Keep the layers separate

The project already has several kinds of constraint. They answer different questions and must not collapse into one rule set.

```text
HOUSE SYSTEMS ARCHITECTURE DOCTRINE
    what durable architectural/technical propositions are being pursued?

PATTERN LANGUAGE / STRATEGIES
    what reusable responses may satisfy those propositions?

SUPPORTED DOMAIN
    what building systems and parameter ranges can the computational model reason about?

ARCHITECTURAL GRAMMAR
    what selected design language is this project using?

PROJECT + SITE CONFIGURATION
    what does this particular brief, plot and climate require?
```

A design can satisfy the doctrine and fail the selected grammar. It can satisfy the grammar and sit outside the supported technical domain. A project-specific courtyard can be valid even when the base grammar neither requires nor generically models courtyards.

These are useful distinctions, not inconveniences.

## 3. Framework versus grammar instance

This document defines the **grammar framework**: the types of architectural relationships a grammar may state and how those statements should behave computationally.

A **grammar instance** is a versioned architectural language using that framework.

Illustratively:

```text
GRAMMAR FRAMEWORK
    ├── G-01  Georgian-derived domestic grammar
    ├── A-01  possible Arts-and-Crafts-derived grammar
    └── M-01  possible modern grammar
```

Only G-01 is an active research programme. The other names are illustrative.

The framework must not assume the features of any one instance. If the framework itself requires symmetry, classical hierarchy, sash windows, a courtyard, masonry or a pitched roof, the abstraction has failed.

## 4. What a grammar may contain

A useful grammar can operate through coordinated layers.

### G0 — programme semantics

What kinds of spaces or elements exist and what roles do they play: principal room, bedroom, circulation, stair, service room, exterior threshold, court, terrace or other roles defined by that grammar/project.

The framework provides semantic capacity; the grammar chooses the vocabulary.

### G1 — spatial topology

How spaces may connect: privacy depth, circulation through or around occupied rooms, alternative routes, adjacencies, exterior relationships and forbidden connections.

Topology should remain representable independently of metric geometry.

### G2 — ordering structure

Axes, centres, fields, grids, bays, fronts, ranges, alignments, symmetry domains or deliberately asymmetric ordering devices.

No one ordering device is universal. A grammar declares which it uses.

### G3 — dimensional and proportional grammar

Permissible dimensional ranges, preferred proportion families, room-height relationships, opening ranges and dimensional hierarchy.

Prefer admissible regions and ranked preferences where architecture permits them; use exact dimensions or ratios only where their authority is real.

### G4 — vertical grammar

Stacking, floor-height relationships, opening alignment, stair continuity, roof/base relationships and other section rules.

### G5 — elevation grammar

Opening rhythm, solid/void relationships, alignment, edge conditions, storey hierarchy, entrance emphasis, roof termination and other façade relationships selected by the language.

### G6 — architectural element grammar

Doors, windows, thresholds, stairs, joinery, shading devices, screens, mouldings, balconies, fireplaces or other element families.

Element libraries should follow the language rather than define the framework.

### G7 — tectonic grammar

How visible architectural elements meet real construction: joint placement, tolerance absorption, removable trim, wear surfaces, interface depth and other relationships between architectural expression and the actual assembly.

This is where a selected language can meet House Systems Architecture without being mistaken for it.

## 5. Relational before numerical

The framework should begin with relationships, order and hierarchy before exact ratios.

A coherent language may care that:

- one room ranks above another;
- an opening belongs to a bay or field;
- circulation reaches a space without violating privacy logic;
- a façade opening corresponds to an interior condition;
- a stair occupies a defined relationship to arrival;
- a secondary mass remains subordinate to a primary one.

Those conditions may survive substantial dimensional variation.

Proportion remains important. It is simply not the universal root node of architectural grammar.

## 6. Topology before geometry

Two houses can differ dimensionally while sharing the same important spatial logic.

A topology can already express adjacency, centrality, depth, alternative paths, public/private relationships and connections to exterior space before the solver knows the exact room sizes.

This supports a useful distinction:

- **relational structure** — the stable architectural relationships selected by the grammar;
- **geometric realisation** — one site- and project-specific arrangement satisfying them.

Geometry must eventually make the relationships real, but it need not be the first representation.

## 7. Hierarchy without prescribing a historical hierarchy

Many architectural languages distinguish primary from secondary conditions. The framework should support rank without deciding in advance what receives it.

Conceptually:

```text
space.rank(A) > space.rank(B)
opening.rank(X) >= opening.rank(Y)
front.rank(main) > front.rank(service)
```

Whether a particular grammar uses such relationships, and what architectural consequence rank has, belongs to that grammar.

This is the key distinction between a generic capability to represent hierarchy and a Georgian-derived rule about how hierarchy should appear.

## 8. Proportion as an admissible region

Avoid assuming that a good room can be identified by one sacred ratio.

A grammar may instead combine:

- a valid dimensional range;
- one or more preferred proportional families;
- a dimensional class based on role;
- contextual adjustments for structure, circulation, furniture, environmental performance and common floor heights.

That allows three useful states:

```text
VALID + PREFERRED
VALID + NON-PREFERRED
OUTSIDE GRAMMAR
```

The framework should be able to express all three. The actual ranges belong to the selected grammar and its evidence.

## 9. Plan, section and elevation co-evolve

A grammar should not generate a plan and decorate the elevations afterward, nor design a façade and force a plan behind it.

They share variables: wall positions, room roles, bay centres, floor levels, openings, stair position, roof geometry, structural support and environmental conditions.

> **Plan, section and elevation are projections of one architectural order.**

A future solver may resolve them iteratively or simultaneously. The conceptual requirement comes first.

## 10. Structure, environment and services negotiate with grammar

Architecture is not the sole generator.

A selected grammar should tend toward geometry that can negotiate credibly with structure, building physics, environmental strategy and services. The technical systems should likewise avoid flattening the house into a servicing diagram.

The relationship is reciprocal:

```text
ARCHITECTURAL GRAMMAR
        ↕
PROJECT / SITE / ENVIRONMENT
        ↕
STRUCTURE + ENVELOPE + SERVICES
        ↕
VALIDITY / EVIDENCE OBLIGATIONS
```

The grammar can prefer structurally sympathetic geometry without claiming structural proof. It can prefer passive opportunity without pretending orientation or daylight performance follows from style.

## 11. Global rules, local rules and protected emptiness

Local rules may govern a junction, opening or alignment.

Global rules may govern massing, hierarchy, circulation, primary order or relationship to exterior space.

A purely local system can produce tidy nonsense. A purely global optimiser can miss the quality of individual rooms and interfaces. A useful grammar needs both scales.

It also needs the ability to protect absence. Architectural order can depend on an unoccupied axis, court, vista, wall field, circulation zone, maintenance volume or structural clear zone.

The model must therefore support constraints over **protected emptiness**, not merely placed objects.

## 12. Grammar and evaluation are different systems

A grammar determines whether a design belongs to the selected language.

Evaluation compares valid designs against objectives.

### Grammar asks

> Is this a valid member of language G?

### Evaluation asks

> Among valid members, how does this design perform against the selected objectives?

Objectives may include daylight, privacy, circulation efficiency, compactness, cost, carbon, service-route length, structural economy, garden connection or closeness to preferred proportions.

Do not turn every objective into grammar. If every preference becomes a hard rule, the language becomes sterile; if none do, the grammar becomes decorative metadata.

## 13. Three levels of architectural authority

### A. Language invariant

Violation means the design is not a valid member of the selected grammar.

### B. Language preference

Violation is allowed but produces feedback or affects ranking.

### C. Human judgement

The system informs but does not pretend to settle conditions such as whether an exception improves the whole, an asymmetry is beautifully composed or a particular sequence has the intended emotional effect.

Compiler or authoring feedback should state which level is speaking.

## 14. Intentional exception

Opinionated does not mean tyrannical.

A future system may support:

### Conforming mode

Hard grammar rules cannot be violated.

### Explicit deviation

```text
GRAMMAR G-xx
FAIL — EXPLICIT DEVIATION GDEV-004
```

The deviation records rule, location, reason, author and downstream effects.

### Different grammar

A design requiring fundamentally different ordering should select another language rather than accumulate hundreds of exceptions.

## 15. Derive grammars; do not invent them from taste

A grammar instance should have a derivation record.

A defensible process is:

1. define the intended lineage and building scope;
2. assemble a controlled corpus appropriate to that claim;
3. acquire reliable plans, sections, elevations and other evidence;
4. annotate semantics, topology, ordering, dimensions and coupling;
5. extract candidate relationships;
6. distinguish invariant, tendency, preference, optional motif and human judgement;
7. search deliberately for counterexamples;
8. separate historical/descriptive frequency from present normative choice;
9. test controlled mutations and unseen designs;
10. review with relevant architectural and technical expertise.

A grammar can be contemporary and still require evidence. Its evidence may include built work, design practice, prototypes and expert review rather than historical corpora.

## 16. Descriptive and normative grammars must remain separate

The descriptive question is:

> What relationships characterise the selected body of architecture?

The normative question is:

> Which of those relationships should this new grammar preserve, modify or reject?

Frequency is not authority.

Historical service arrangements, inaccessible circulation, obsolete social assumptions, poor environmental performance or superseded construction should not enter a new grammar merely because they were common in its precedents.

Likewise, a contemporary fashion should not become a hard rule merely because it is currently frequent.

## 17. Counterexamples and mutation testing

Positive examples reveal recurring relationships. Counterexamples reveal whether those relationships are actually necessary.

Controlled mutation is particularly useful:

- move an opening;
- change a room rank or dimension;
- break an alignment;
- alter circulation depth;
- remove a connection;
- change mass hierarchy;
- disturb a vertical relationship.

Record which relationship changed, whether the result remains inside the intended language, whether technical performance changed and whether the candidate rule should be hard, soft or discarded.

The aim is not a public beauty vote. It is to discover which relationships carry architectural load.

## 18. Multiple grammars are a feature, not an edge case

House Systems Architecture should eventually be able to inhabit several architectural languages.

That is an important falsification test for the doctrine itself. If a supposedly general HSA proposition only works inside G-01, it is either scoped too broadly or is actually a G-01/project proposition.

Conversely, a grammar may impose requirements that have nothing to do with HSA doctrine. That is legitimate. The system should report their authority honestly.

## 19. G-01 is the first test grammar, not the framework

The active first grammar is **G-01 — Georgian-derived domestic architecture**.

It exists because the Reference House already has a Georgian-derived architectural temperament and therefore provides a demanding concrete vehicle for grammar research.

G-01-specific material belongs in the dedicated research records:

- [G-01 Research Brief](g01-research-brief.md)
- [G-01 Corpus and Source-Quality Register](g01-corpus-register.md)
- [G-01 Precedent Annotation Schema](g01-annotation-schema.md)
- [G-01 Trial Case Records](g01-cases/README.md)
- [G-01 Topology Comparison](g01-topology-comparison.md)
- [G-01 Dimensional and Proportional Analysis](g01-dimensional-analysis.md)
- [G-01 Plan / Section / Elevation Coupling](g01-plan-section-elevation-coupling.md)
- [G-01 Candidate Constraint Register](g01-candidate-constraints-v01.md)

Palladio, English Georgian precedent, classical ordering, symmetry tendencies, bay composition, sash/opening hierarchy and similar material may be central to G-01. They are not assumptions of the grammar framework.

## 20. The Reference House selects rather than defines G-01

The Reference House is a worked interpretation. It may select G-01 and then add project-specific morphology or dialect.

For example, its courtyard should not be smuggled into the Georgian core merely because this house has one. The grammar should be derived independently, then the project should test whether a courtyard can coexist with it or requires an explicit extension/dialect.

The same applies to the Reference House's tectonic language. Traditional joinery, restrained brass/bronze, removable architectural trim and other interface resolutions may form a coherent project dialect without becoming generic Georgian rules or HSA doctrine.

## 21. The twelve-year-old test

A simple authoring interface should manipulate architectural intent rather than hidden rule mechanics.

A user might say:

- make this the principal room;
- enlarge it;
- add a bedroom;
- move the stair;
- add an opening;
- widen the court.

The system should manage consequences such as threatened hierarchy, broken alignments, invalid topology, increased spans, environmental conflicts and service-route consequences according to whichever grammar/domain/project rules actually own them.

Human intent sits at the interface; encoded architectural knowledge sits underneath.

## 22. Compiler and authoring output

A grammar result should distinguish at least:

```text
GRAMMAR
PASS
```

```text
GRAMMAR
PASS WITH PREFERENCE DEPARTURE
```

```text
GRAMMAR
FAIL
```

```text
GRAMMAR
HUMAN REVIEW
```

Report grammar ID/version, rule, authority class, affected entities, reason and valid alternatives where known.

Do not report a generic architectural failure when the real statement is only “not a member of G-01”.

## 23. Versioning

Released grammars should be immutable.

```text
G-01.3  Georgian-derived domestic grammar
```

A change to rules or authority creates a new version. Projects retain the grammar version they were designed against unless they explicitly migrate.

The framework itself should also version when its semantics change.

## 24. Anti-contamination rule

Before adding a rule to this framework, ask:

- Is this capability required to represent architectural grammars generally?
- Or is it a rule of G-01?
- Or a technical restriction of H1?
- Or a project-specific Reference House decision?

Only the first belongs here.

The repository-wide rule is defined in [Architectural Specificity Boundary](../development/architectural-specificity-boundary.md).

> **Generalise the reason; localise the taste.**

## 25. Current next steps

The framework is conceptually sufficient for the present computational programme. Do not expand it merely to catalogue more architectural opinions.

Next useful work is downstream:

1. continue deriving and attacking G-01 from its controlled corpus;
2. keep G-01 rules distinct from H1 technical-domain restrictions;
3. test the Reference House as a G-01 project with explicit project-specific extensions where necessary;
4. promote only relationships that survive evidence and counterexample review;
5. later test the framework with a materially different second grammar to expose assumptions that remained accidentally Georgian.

The strongest test of style-neutrality will not be another paragraph. It will be a second architectural language using the same framework without special pleading.
