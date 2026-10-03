# Architectural Grammar and Proportion — Position v0.1

**Status:** foundational research draft  
**Purpose:** define how the Long-Life House can be architecturally opinionated and computationally generative without pretending that architectural quality reduces to a universal formula.  
**Implementation:** none. This document defines the conceptual architecture of a future grammar system.

> **The grammar should make good architectural relationships ordinary, bad relationships difficult, and its own opinions visible.**

## 1. The question

The computational project began with a strong intuition:

> if the system is sufficiently opinionated about proportion and design, perhaps a large class of bad layouts can become impossible to express.

That intuition survives, but in a more precise form.

The system should **not** attempt to prove beauty from a small set of ratios.

It should define a **declared architectural language** composed of:

- spatial topology;
- hierarchy;
- ordering devices;
- dimensional and proportional families;
- permitted transformations;
- alignments;
- relationships between plan, section and elevation;
- architectural element families;
- explicit preferences and tolerances.

A design can then be a valid or invalid member of that language.

This is analogous to linguistic grammar:

- grammar can distinguish a well-formed sentence from an ill-formed one;
- grammar cannot prove that the sentence is profound.

Likewise:

> **architectural grammar can define coherence without claiming to exhaust architectural quality.**

## 2. The first major conclusion — relational before numerical

The historical research gives a useful warning against beginning with sacred ratios.

Palladio explicitly described preferred room shapes and methods for relating room height to plan dimensions. Yet later quantitative and computational studies repeatedly show that his architecture is not governed by one rigid numerical system.

Howard and Longair found a clear preference for harmonic dimensions but not consistent harmonic control across all published plans. More recent scholarship continues to describe Palladian proportion as a contested and more complex subject than the familiar simplified account.

Hersey and Freedman's computational reconstruction is especially useful for this project. Their Planmaker could generate recognisably Palladian plans using rules concerned with:

- rectangularity;
- symmetry;
- splitting;
- hierarchy of room sizes;
- wall alignment;
- door/window axes;
- bounds on room elongation.

They concluded that exact canonical proportions were much less determinative of Palladian identity than commonly assumed.

This is the right lesson for the Long-Life House.

> **The grammar should begin with relationships, order and hierarchy. Exact ratios should enter where evidence shows that they improve the language.**

Proportion remains important.

It is simply not the root node of architecture.

## 3. Historical precedent — architecture was already partly programmable

The idea of an architectural language executable by people predates computers.

Palladio's *Four Books* supplied:

- room-shape families;
- proportional methods;
- orders;
- components;
- examples;
- repeatable compositional principles.

Eighteenth-century British architectural books pushed this further into a culture of transferable rules and examples.

James Gibbs's *A Book of Architecture* (1728) was explicitly intended to make designs available beyond direct access to the architect and became highly influential across the English-speaking world.

Batty Langley's builder-facing works translated classical design into geometric procedures and proportional constructions.

William Chambers's *Treatise on Civil Architecture* systematised architectural precepts while also giving an important caution: room proportion depends on use and actual dimension, and real dwelling houses often impose common floor heights across rooms of different size.

This matters.

The Georgian tradition was not simply a collection of beautiful objects.

It also contained a **culture of codification, pattern books, transferable geometries and rules that competent builders could execute**.

That does not make eighteenth-century pattern books software.

It does make them relevant ancestors for a project whose ambition is to concentrate architectural knowledge in a system rather than demand that every user reinvent it.

## 4. Grammar is not style decoration

A weak computational definition of “Georgian” would be:

- sash windows;
- brick;
- cornice;
- symmetrical façade;
- classical doorcase.

That is costume.

The grammar must operate more deeply.

It should be capable of constraining relationships such as:

- public / private spatial hierarchy;
- primary / secondary room hierarchy;
- circulation depth;
- principal axes;
- bay structure;
- room-to-room alignment;
- plan-to-elevation coordination;
- vertical hierarchy between storeys;
- opening-to-wall relationships;
- threshold sequence;
- structural regularity;
- service concentration;
- architectural depth at interfaces.

Style emerges from the coordination of these relationships and then from the architectural elements that express them.

> **A Georgian grammar must be a grammar of spatial and tectonic order before it is a library of Georgian-looking parts.**

## 5. Grammar should be a stack, not one rule set

The future system should treat an architectural language as several coordinated grammar layers.

The exact architecture remains open, but the following stack is a strong working model.

### G0 — Programme semantics

Defines what kinds of spaces exist and their intended roles.

Examples:

- principal room;
- secondary room;
- bedroom;
- service room;
- circulation;
- stair hall;
- kitchen;
- courtyard;
- exterior threshold.

This layer does not decide geometry.

It gives later relationships meaning.

### G1 — Spatial topology

Defines how spaces may connect.

Examples:

- which rooms may be directly accessed from entrance/circulation;
- public-to-private depth;
- whether movement passes through occupied rooms;
- permitted enfilades;
- service-to-principal-room relationships;
- relationship between house, courtyard and garden.

This should be representable as a graph independently of exact room shape.

Space-syntax research is useful here because it demonstrates that access structure can be analysed independently of metric geometry.

### G2 — Ordering structure

Defines the larger compositional skeleton.

Candidate concepts:

- primary axis;
- secondary axes;
- centre;
- courtyard;
- bay lattice;
- symmetry condition;
- hierarchy of fronts;
- principal / secondary ranges;
- alignment lines.

This layer creates the frame into which spaces resolve.

### G3 — Dimensional and proportional grammar

Defines:

- permissible dimensional ranges;
- preferred proportional families;
- room-height relationships;
- bay widths;
- opening ranges;
- dimensional hierarchy.

This should normally use **bands and preferred loci**, not exact universal ratios.

Historical ratios may become preferred points within a larger valid range.

### G4 — Vertical grammar

Defines relationships across storeys:

- stacking;
- principal-storey hierarchy;
- ceiling-height hierarchy;
- stair continuity;
- vertical opening alignment;
- roof/base relationships;
- wet-room/service stacking where selected.

Plan cannot be treated as independent from section.

### G5 — Elevation grammar

Defines:

- bay rhythm;
- opening hierarchy;
- alignment;
- solid-to-void ranges;
- storey hierarchy;
- window family by storey/room role;
- centre / edge conditions;
- roof and cornice relationships;
- entrance emphasis.

Plan and elevation must negotiate rather than be generated independently.

### G6 — Architectural element grammar

Defines families of:

- doors;
- windows;
- architraves;
- skirtings;
- cornices;
- thresholds;
- stairs;
- fireplaces;
- porticos;
- screens;
- joinery.

This is where recognisable stylistic vocabulary becomes explicit.

### G7 — Tectonic grammar

Defines how visible architectural elements correspond to real construction.

For the Reference House this may include:

- where a joint is allowed or celebrated;
- where brass/bronze may legitimately signal movement, wear or access;
- how removable linings terminate;
- how architectural overlap absorbs tolerance;
- how thresholds mediate real changes of material/datum.

This layer connects architectural language to the Long-Life House doctrine.

## 6. Topology before metric geometry

One of the strongest decisions from this research is to preserve **topological intent independently of dimensions**.

Two houses may have different dimensions yet share the same important spatial logic.

For example:

~~~text
EXTERIOR
   ↓
ENTRANCE HALL
   ├── PRINCIPAL ROOM A
   ├── PRINCIPAL ROOM B
   ├── STAIR
   └── SECONDARY CIRCULATION
          ├── KITCHEN
          └── SERVICE / WET ROOMS
~~~

That graph says something architectural before any wall is drawn.

It can encode:

- ceremonial versus service routes;
- privacy depth;
- circulation independence;
- centrality;
- alternative routes;
- connection to garden/courtyard.

A geometric solver can later instantiate many plans that satisfy the same topology.

This suggests a productive genotype/phenotype distinction:

- **spatial genotype** — stable relational structure;
- **geometric phenotype** — one dimensional/site-specific realisation.

The analogy should be used cautiously, but it captures the idea.

## 7. Hierarchy is more important than uniform perfection

Classical domestic architecture often gains coherence from **difference under order**.

The grammar should therefore encode hierarchies such as:

- principal rooms larger than secondary rooms;
- principal rooms associated with stronger axes or more significant positions;
- principal-storey openings larger or more emphatic than subordinate openings;
- circulation subordinate to rooms while remaining generous enough to feel architectural;
- service spaces appropriately related without dominating the composition;
- entrance sequence increasing or modulating spatial significance.

This is relational.

It does not require every principal room to be 5.40 × 7.20 m.

A rule may look conceptually like:

~~~text
principal-room.area > adjacent-secondary-room.area
principal-room.ceiling-height >= secondary-room.ceiling-height
principal-room.opening-rank >= secondary-room.opening-rank
~~~

Again, no syntax is proposed.

The point is that **rank** can be more important than absolute dimensions.

## 8. Proportion should use admissible regions

The future grammar should avoid brittle equality tests such as:

~~~text
room.length / room.width == 1.5
~~~

Real architecture needs:

- wall thickness;
- structure;
- tolerances;
- site response;
- shared storey heights;
- circulation;
- furniture;
- technical requirements;
- dimensional coordination.

Historical practice itself was not perfectly exact.

Instead, a room might belong to:

- an **admissible proportion band**;
- one or more **preferred ratio families**;
- a **dimensional class** determined by room role.

Conceptually:

~~~text
VALID RANGE
1.25 ───────────────────────── 1.80

PREFERRED ATTRACTORS
      4:3     √2      3:2     5:3
       │       │       │       │
~~~~~~~▲~~~~~~~▲~~~~~~~▲~~~~~~~▲~~~~~~
~~~

The actual numbers above are illustrative only.

This structure permits three useful outcomes:

- inside valid range and near a preferred attractor;
- inside valid range but non-preferred;
- outside grammar.

That is far more useful than pretending architecture lives on exact fractions.

## 9. Historical ratios are evidence, not commandments

For research purposes, Palladio's room families remain highly relevant:

- square;
- 1 : √2;
- 3 : 4;
- 2 : 3;
- 3 : 5;
- 1 : 2;
- circular rooms as a rare special case.

Palladio also proposed arithmetic, geometric and harmonic methods for deriving vaulted room heights from length and width.

These are important precedents.

They should not automatically become Long-Life House rules.

The first grammar should instead ask:

- which relationships survive into high-quality English Georgian domestic architecture?
- which were theoretical ideals versus common practice?
- which work at contemporary room sizes?
- which conflict with modern floor-to-floor constraints?
- which remain perceptually meaningful after structure and services intervene?
- which improve the Reference House?

The grammar must be derived from architecture, not historical piety.

## 10. Chambers gives us the more useful attitude

Chambers's treatment of room proportion is particularly valuable because it combines rules with practical qualification.

He connects room proportion to:

- use;
- actual size;
- ceiling form;
- length/breadth relationship.

He also acknowledges the ordinary difficulty that rooms on one floor often share a common height despite having different plan dimensions.

That is almost exactly the stance our system needs:

> **strong preferences, explicit limits, practical reconciliation.**

The compiler should not fail a house because a serviceable, beautiful room misses an ideal ratio by 80 mm after the structural stack is resolved.

It should know whether that 80 mm is:

- irrelevant;
- mildly non-preferred;
- enough to leave the selected grammar.

## 11. Grammar and evaluation must be separate

The Palladian computational literature contains a crucial distinction.

A grammar can generate members of a design language.

Separate criteria can evaluate those members.

The Long-Life House should preserve this separation.

### Grammar asks

> Is this design a valid member of language G?

### Evaluation asks

> Among valid members, how does this one perform against chosen objectives?

Possible objectives:

- daylight;
- prospect;
- privacy;
- circulation efficiency;
- compactness;
- structural economy;
- cost;
- carbon;
- service-route length;
- garden connection;
- symmetry preference;
- closeness to preferred proportions.

This produces an important rule:

> **Do not turn every design objective into grammar.**

If every preference becomes a hard rule, the language becomes sterile.

If nothing becomes a hard rule, the system becomes generic CAD again.

The work is to find the boundary.

## 12. Three levels of architectural authority

Every architectural rule should declare its authority.

### A. Language invariant

Violation means the design is not a valid member of the selected grammar.

Examples might eventually include:

- principal entrance must participate in a declared ordering structure;
- certain primary façade openings must align to bays;
- a principal room must satisfy a defined dimensional class;
- a forbidden topology cannot occur.

### B. Language preference

Violation is allowed but produces architectural feedback.

Examples:

- room ratio is valid but not near preferred proportion family;
- façade is valid but unusually solid;
- axis is valid but weakened by a secondary opening.

### C. Human judgement

The system provides information but does not pretend to decide.

Examples:

- whether an asymmetry is beautifully composed;
- whether a vista is emotionally effective;
- whether a deliberately strange room is worth the departure;
- whether an architectural exception improves the whole.

This should be visible in compiler output.

## 13. A grammar should permit intentional exception

An opinionated system must not confuse enforcement with tyranny.

A user may decide:

> this room should violate G-01.

The system should allow controlled responses.

Possible future modes:

### Conforming mode

Hard grammar rules cannot be violated.

Best for the simple authoring experience.

### Explicit exception

The design remains technically compilable, but grammar conformance becomes:

~~~text
GRAMMAR G-01
FAIL — EXPLICIT DEVIATION GDEV-004
~~~

The exception records:

- rule;
- location;
- reason;
- architectural author;
- downstream effects.

### Different grammar

A design that wants fundamentally different ordering should select another language rather than accumulate hundreds of exceptions.

This preserves human agency without making the grammar meaningless.

## 14. Grammar should coordinate with structure instead of fighting it

The architectural grammar should create geometries that are naturally compatible with the supported structural domain.

Examples:

- bay dimensions that sit comfortably inside supported floor spans;
- stacked support lines where architecturally acceptable;
- openings positioned with enough residual pier/bearing capacity;
- regular structural depth;
- roof forms compatible with supported systems.

But structural truth remains separate.

A beautiful aligned bay does not prove a wall.

The relationship should be:

~~~text
ARCHITECTURAL GRAMMAR
       ↓
structurally sympathetic geometry
       ↓
STRUCTURAL OBLIGATIONS
       ↓
engineering proof
~~~

This is preferable to either extreme:

- architecture ignores structure and receives beams later;
- structure determines the architecture mechanically.

## 15. Grammar should coordinate with services without becoming a machine plan

The same principle applies to services.

The grammar may prefer:

- wet-room clustering;
- stacked wet zones;
- service walls;
- short drainage runs;
- a clear maintenance spine;
- separation between principal architecture and high-change technical zones.

These choices should influence room placement.

But a Georgian-derived house must not become visibly determined by a schematic plumbing diagram.

The doctrine already gives us the right relationship:

> **technical necessity should become architecture rather than merely being exposed or hidden badly.**

## 16. Plan, section and elevation must co-evolve

Historical computational work on Palladian villas demonstrates a recurring problem: a plan generator and a façade generator must negotiate.

That is a warning for us.

The future grammar cannot be:

~~~text
make plan
then decorate elevations
~~~

Nor should it be:

~~~text
make pretty façade
then force plan behind it
~~~

Critical shared variables include:

- bay centres;
- wall positions;
- room hierarchy;
- floor levels;
- opening positions;
- sill/head levels;
- stair position;
- roof geometry;
- structural supports.

A future solver may resolve these iteratively or simultaneously.

The conceptual requirement is simply:

> **plan, section and elevation are different projections of one architectural order.**

## 17. Grammar needs global and local rules

Some architectural relationships are local.

Examples:

- opening centred within bay;
- architrave overlaps declared interface;
- door aligns with opposite opening.

Others are global.

Examples:

- building organised around a principal axis;
- primary rooms form a hierarchy;
- elevation has coherent bay rhythm;
- courtyard mediates major circulation;
- principal and service routes remain legible.

A purely local rule engine can produce locally tidy nonsense.

A purely global optimiser can miss the quality of individual joints.

The grammar must eventually support both scales.

## 18. Grammar must understand absence

Architecture is not only the placement of objects.

Meaning may depend on:

- leaving the central axis unoccupied;
- preserving wall mass;
- retaining a clear vista;
- keeping a service route out of a principal wall;
- maintaining a void around the courtyard tree;
- refusing an opening at a particular position.

Therefore the formal model must support constraints over **empty space and forbidden occupation**, not merely components.

This connects naturally to:

- maintenance volumes;
- structural clear zones;
- sight lines;
- movement routes;
- boundary zones.

## 19. Grammar is not one historical style

The computational architecture should eventually allow several architectural languages.

Conceptually:

~~~text
GRAMMAR-G01  Georgian-derived Long-Life House
GRAMMAR-A01  Arts-and-Crafts-derived Long-Life House
GRAMMAR-C01  Courtyard / Mediterranean-derived Long-Life House
...
~~~

These are illustrative only.

The Long-Life House doctrine is independent of them.

A building could satisfy the doctrine under several different architectural grammars.

That separation is essential:

~~~text
DOCTRINE
  ≠
STYLE
~~~

The Reference House is likely to become the first grammar-development vehicle because its language is already unusually explicit.

## 20. The first grammar should not simply be “Palladian”

The Reference House is Georgian in temperament, with selective Andalusian/courtyard influence and a strong Long-Life House tectonic language.

The first computational grammar should therefore be derived from:

- English Georgian domestic architecture;
- Palladian/classical ordering where genuinely relevant;
- British pattern-book traditions;
- high-quality measured precedents;
- the Reference House's developing architecture;
- Long-Life House tectonic requirements.

Palladio is a foundational precedent, not the product specification.

The goal is **a living domestic language**, not historical reenactment.

## 21. Deriving G-01 — proposed research method

Do not write G-01 from memory.

Build it from a controlled corpus.

### Step 1 — Define corpus classes

Potential classes:

- canonical theoretical sources;
- canonical built precedents;
- ordinary high-quality Georgian houses;
- Georgian terraces/town houses;
- later Georgian/Palladian adaptations;
- known failures/caricatures;
- contemporary successful reinterpretations.

### Step 2 — Acquire measured information

Prefer:

- measured plans;
- elevations;
- sections;
- original pattern books;
- archival drawings;
- high-quality surveys.

Avoid deriving metric rules from photographs where proper drawings exist.

### Step 3 — Annotate semantics

For each building identify:

- room roles;
- hierarchy;
- connections;
- axes;
- bays;
- dimensions;
- heights;
- opening families;
- circulation;
- structural logic where recoverable;
- service logic where relevant.

### Step 4 — Extract candidate rules

Candidate rule classes:

- invariant;
- frequent tendency;
- preferred range;
- optional motif;
- exceptional condition.

### Step 5 — Search for counterexamples

A rule that explains five favourite houses but rejects ten excellent ones is probably not a good language invariant.

Counterexamples are design evidence.

### Step 6 — Separate descriptive from normative rules

Historical frequency does not automatically mean we should reproduce it.

The project may intentionally reject some inherited relationships.

### Step 7 — Generate unseen designs on paper

Use the candidate grammar to produce houses not in the corpus.

Ask:

- are they recognisably of the language?
- are they monotonous?
- can they adapt to site?
- can they support contemporary life?
- do they cooperate with structure/services?
- can the Long-Life House doctrine survive inside them?

### Step 8 — Expert review

Eventually use architectural historians, practising architects and builders to challenge the grammar.

Not to vote on taste.

To identify rules that are historically false, architecturally brittle or constructionally naive.

## 22. Corpus should contain bad examples

A purely positive corpus teaches only what exists in the selected good buildings.

The project should also collect:

- awkward rooms;
- poor neo-Georgian façades;
- false symmetry;
- mis-scaled openings;
- flattened hierarchy;
- developer pastiche;
- technically compliant but dead circulation.

Why?

Because we need to learn the boundary.

The research question is not only:

> what do good examples share?

It is also:

> **what small relationship changes make the architecture collapse?**

Those may become the most valuable compiler errors.

## 23. The role of statistics

Statistics can identify:

- common ratio bands;
- bay-frequency distributions;
- room-size hierarchies;
- typical opening spacing;
- adjacency frequency;
- alignment frequency.

Statistics should not determine architecture by majority vote.

A rare condition may be:

- a legitimate exception;
- an important special case;
- the best solution.

Use frequency to discover candidate grammar.

Do not convert frequency directly into law.

## 24. The role of machine learning

Machine learning may later help:

- classify precedents;
- identify recurring geometric relationships;
- detect outliers;
- propose candidate rules;
- predict expert classifications;
- retrieve analogous precedents.

It should not be the canonical definition of the grammar.

A black-box classifier that says:

> 94% Georgian

does not satisfy the project.

The grammar must be:

- inspectable;
- editable;
- versioned;
- explainable.

Machine learning may help us discover the language.

The language itself should remain legible.

## 25. The “impossible to lay out badly” ambition

The original ambition should survive, but be stated accurately.

It is unrealistic to guarantee:

> no architecturally bad building can be generated.

A stronger and defensible ambition is:

> **Within grammar G, the system should make it impossible to produce certain known classes of spatial and compositional error; make departures from preferred relationships visible; and confine free judgement to the places where genuine architectural judgement remains necessary.**

This is already radical.

It means a novice can inherit:

- ordering;
- hierarchy;
- proportion;
- alignment;
- circulation logic;
- structural sympathy;

without consciously knowing every rule.

The system holds the discipline.

## 26. Relationship to the twelve-year-old test

The simple user should manipulate high-level intent.

Examples:

- make this the principal drawing room;
- enlarge this room;
- add another bedroom;
- give the garden room more prominence;
- move the stair;
- add a bay;
- make the courtyard wider.

The grammar turns those acts into constrained operations.

The user should not need to know:

- which façade alignments must move;
- which room hierarchy is now threatened;
- whether a bay family has become malformed;
- which structural span has increased;
- which service route has become impossible.

Those consequences become compiler work.

This is how architectural knowledge moves from user skill into system design.

## 27. Interaction with the validity model

Architectural grammar should map into the existing validity taxonomy.

### Grammar hard rule violated

~~~text
V7 ARCHITECTURAL GRAMMAR
FAIL
~~~

### Grammar preference violated

~~~text
V7 ARCHITECTURAL GRAMMAR
PASS WITH WARNING
~~~

### Human judgement condition

~~~text
V7 ARCHITECTURAL GRAMMAR
REVIEW
~~~

The output should identify:

- grammar version;
- rule;
- authority;
- affected entities;
- reason;
- possible valid alternatives.

## 28. Grammar versioning

Architectural grammars should be immutable once used for a released building.

Example:

~~~text
G-01.3  Georgian-derived Long-Life House
~~~

A later refinement creates G-01.4 rather than silently changing G-01.3.

A house can then retain a meaningful statement:

> this design conformed to G-01.3 at release.

Future alterations may:

- remain on G-01.3;
- migrate to G-01.4;
- explicitly deviate;
- switch grammar under major redesign.

This mirrors compiler-target versioning but represents a different authority.

## 29. First conceptual grammar object

A future grammar definition might contain:

~~~text
Grammar
  identity
  lineage
  scope
  semantic roles
  topology rules
  ordering rules
  dimensional families
  vertical rules
  elevation rules
  element families
  tectonic rules
  preference functions
  exception policy
  examples
  counterexamples
  conformance tests
~~~

This is conceptual only.

It should not yet be translated into TypeScript, JSON, DSL syntax or a database schema.

## 30. Conformance tests for architecture

The grammar itself needs tests.

A grammar should ship with:

- canonical valid examples;
- canonical invalid examples;
- edge cases;
- deliberate near-misses;
- counterexamples;
- regression cases.

For example:

~~~text
CASE G01-PLAN-017
Given:
  principal-axis house
  three-bay front
  two principal front rooms

Mutation:
  shift right opening off both room and bay axis

Expected:
  grammar failure at elevation/plan coordination rule
~~~

This is analogous to unit testing, but the cases are architectural.

The most valuable suite may be a collection of **small mutations of good houses**.

## 31. Mutation testing may be an unusually powerful research method

Take a strong precedent.

Change one thing:

- widen one room;
- shift one door;
- break one alignment;
- enlarge one upper window;
- remove one circulation connection;
- move one stair;
- change one bay width.

Then ask when the architecture stops feeling coherent.

This could reveal rules more effectively than merely measuring intact precedents.

It also maps directly onto future compiler behaviour.

> **A grammar is partly defined by the mutations it refuses.**

This deserves serious future experimentation.

## 32. Anti-drift rules

Reject the following interpretations.

- **“Good architecture is the golden ratio.”**  
  No. Historical proportion systems are one source of relationships, not a universal aesthetic proof.

- **“Georgian means symmetry everywhere.”**  
  No. Symmetry is one ordering device whose scope must be derived from real precedents.

- **“Historical frequency equals rule.”**  
  No. Frequency identifies candidates, not normative authority.

- **“The grammar should reproduce old houses exactly.”**  
  No. It should generate a coherent contemporary family with historical intelligence.

- **“Every preference should become a compile error.”**  
  No. Hard grammar must remain small enough to permit architectural life.

- **“A valid grammar member is automatically beautiful.”**  
  No. Grammar provides coherence and removes known classes of error; quality still requires judgement.

- **“A grammar violation is a regulatory violation.”**  
  No. Authorities remain separate.

- **“The façade is decoration added after the plan.”**  
  No. Plan, section and elevation must share ordering variables.

- **“The grammar may ignore structure until later.”**  
  No. It should generate structurally sympathetic geometry, while engineering proof remains separate.

- **“The grammar is fixed forever.”**  
  No. It is versioned and evidence-driven.

## 33. Immediate research programme for G-01

The next work should be:

1. define the intended architectural scope of G-01;
2. assemble a precedent corpus;
3. define annotation schema;
4. analyse plan topology separately from geometry;
5. analyse room hierarchy and dimensional families;
6. analyse plan/section/elevation coupling;
7. analyse opening/bay rules;
8. compare theoretical texts with built practice;
9. create first candidate rules;
10. mutation-test those rules against good precedents;
11. generate paper designs;
12. integrate the surviving grammar into the Reference House paper compilation.

Do not lock a ratio table before steps 1–8.

## 34. Current position

The architectural grammar should become a first-class input to compilation, separate from:

- regulatory compiler target;
- supported technical domain;
- site/project configuration;
- Long-Life House doctrine.

The build model therefore becomes:

~~~text
SOURCE BUILDING INTENT
        +
ARCHITECTURAL GRAMMAR
        +
LONG-LIFE HOUSE DOCTRINE PROFILE
        +
SUPPORTED TECHNICAL DOMAIN
        +
COMPILER TARGET
        +
PROJECT / SITE CONFIGURATION
        ↓
OBLIGATIONS + DERIVED MODELS
        ↓
COMPILED BUILDING + EVIDENCE
~~~

This is a much stronger architecture than “CAD with good proportions”.

The system does not merely constrain dimensions.

It constrains **relationships with architectural meaning**.

---

## Research anchors

- George Stiny and William J. Mitchell, **“The Palladian Grammar”**, *Environment and Planning B* 5(1), 1978: https://doi.org/10.1068/b050005
- George Stiny and William J. Mitchell, **“Counting Palladian Plans”**, *Environment and Planning B* 5(2), 1978: https://doi.org/10.1068/b050189
- George Stiny and James Gips, **“An Evaluation of Palladian Plans”**, *Environment and Planning B* 5(2), 1978: https://doi.org/10.1068/b050199
- George Hersey and Richard Freedman, **Possible Palladian Villas (Plus a Few Instructively Impossible Ones)**, MIT Press open edition: https://mitp-arch.mitpress.mit.edu/possible-palladian-villas-plus-a-few-instructively-impossible-ones
- Roberta Spallone and Michele Calvano, **“Parametric Experiments on Palladio’s 5 by 3 Villas”**, *Nexus Network Journal* 24 (2022): https://doi.org/10.1007/s00004-022-00592-1
- Deborah Howard and Malcolm Longair, **“Harmonic Proportion and Palladio's Quattro Libri”**, *Journal of the Society of Architectural Historians* 41(2), 1982: https://doi.org/10.2307/989937
- David Hemsoll, **“Palladio and the ‘Secrets’ of Architectural Proportion”**, *Journal of the Society of Architectural Historians* 84(1), 2025: https://doi.org/10.1525/jsah.2025.84.1.4
- Andrea Palladio, **The Architecture of A. Palladio, in Four Books**, early English edition, Smithsonian Libraries digital copy: https://library.si.edu/digital-library/book/architecturepal00pall
- Sir William Chambers, **A Treatise on Civil Architecture** / later *Decorative Part of Civil Architecture*, Warburg/Cambridge digital editions: https://resources.warburg.sas.ac.uk/pdf/cmh182b2212612.pdf
- James Gibbs, **A Book of Architecture**, Sir John Soane's Museum catalogue record: https://collections.soane.org/b8780
- IHBC Context, **“Pattern books and the Georgian builder”** discussion of Gibbs and Batty Langley: https://ihbconline.co.uk/context/172/24/
- Ju Hyun Lee, Michael J. Ostwald and Ning Gu, **“A Justified Plan Graph grammar approach to identifying spatial design patterns in an architectural style”**, *Environment and Planning B* 45(1): https://doi.org/10.1177/0265813516665618
- Michael J. Ostwald et al., **“Examining control, centrality and flexibility in Palladio's villa plans using space syntax measurements”**, *Frontiers of Architectural Research* 10(3), 2021: https://doi.org/10.1016/j.foar.2021.02.002
- Sverre Magnus Haakonsen, Anders Rønnquist and Nathalie Labonnote, **“Fifty years of shape grammars”**, *International Journal of Architectural Computing* 21(1): https://doi.org/10.1177/14780771221089882
- Thomas Liebich, **“A design grammar for architectural languages”**, *Automation in Construction* 2(4), 1994: https://doi.org/10.1016/0926-5805(94)90002-7
- Michael J. Ostwald and others, **critical mapping of Christopher Alexander's Pattern Language**, *City, Territory and Architecture* 4, 2017: https://doi.org/10.1186/s40410-017-0073-1
