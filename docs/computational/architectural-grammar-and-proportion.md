# Architectural Grammar and Proportion — Position v0.2

**Status:** foundational research draft  
**Purpose:** define how the Long-Life House can be architecturally opinionated and computationally generative without pretending architectural quality reduces to a universal formula  
**Implementation:** none

> **The grammar should make good architectural relationships ordinary, bad relationships difficult, and its own opinions visible.**

## 1. The actual claim

The original intuition was simple: if the system is opinionated enough about proportion and design, perhaps many bad layouts can become impossible to express.

That survives, with an important correction. The system should not try to prove beauty from a short list of ratios. It should define a **declared architectural language** made of topology, hierarchy, ordering, dimensional/proportional families, permitted transformations, alignments, plan/section/elevation relationships, element families and explicit preferences.

A design can then be a valid or invalid member of that language.

The linguistic analogy is useful up to a point: grammar can distinguish a well-formed sentence from an ill-formed one; it cannot prove the sentence profound. Architectural grammar can likewise define coherence without exhausting architectural quality.

## 2. Relational before numerical

Historical proportion research warns against beginning with sacred numbers.

Palladio described preferred room shapes and methods for relating height to plan dimensions, yet later quantitative and computational work repeatedly shows that his architecture is not governed by one rigid numerical system. Howard and Longair found a clear preference for harmonic dimensions without consistent harmonic control across all published plans; more recent scholarship continues to treat Palladian proportion as more complicated than the simplified canonical account.

Hersey and Freedman's Planmaker is particularly relevant. It generated recognisably Palladian plans using rules for rectangularity, symmetry, splitting, room-size hierarchy, wall alignment, door/window axes and bounds on elongation. Exact canonical ratios were less determinative of Palladian identity than commonly assumed.

The working conclusion is therefore:

> **Begin with relationships, order and hierarchy. Introduce exact ratios only where the architecture and evidence justify them.**

Proportion remains important. It is simply not the root node of the language.

## 3. Architecture was already partly codified

Pattern books and treatises matter here not because they were primitive software, but because they concentrated architectural knowledge into transferable rules, examples and procedures.

Palladio's *Four Books* supplied room-shape families, proportional methods, orders, components and repeatable compositional ideas. James Gibbs made designs available beyond direct access to the architect. Batty Langley translated classical design into geometric and proportional procedures for builders. William Chambers systematised precepts while noting that room proportion depends on use and actual dimension, and that rooms on one floor often share a common height despite differing plan dimensions.

The Georgian tradition therefore offers more than a visual catalogue. It contains a culture of **codification and executable architectural convention**.

That is the useful precedent.

## 4. Grammar must sit below costume

A weak computational definition of Georgian architecture would be a list of sash windows, brick, cornice, symmetry and classical doorcase.

A useful grammar constrains deeper relationships: public/private hierarchy, primary/secondary room rank, circulation depth, axes, bay structure, room alignment, plan-to-elevation coordination, storey hierarchy, opening-to-wall relationships, threshold sequence, structural regularity, service concentration and architectural depth at interfaces.

Recognisable style can then emerge from those relationships and the element families expressing them.

> **A Georgian grammar should be a grammar of spatial and tectonic order before it becomes a library of Georgian-looking parts.**

## 5. Grammar as coordinated layers

The future language is better understood as a stack than one rule set.

### G0 — Programme semantics

What kinds of spaces exist and what roles do they play: principal room, secondary room, bedroom, service room, circulation, stair hall, kitchen, courtyard, exterior threshold.

### G1 — Spatial topology

How may those spaces connect? This includes public/private depth, whether circulation passes through occupied rooms, permitted enfilades, service relationships and house/courtyard/garden connections.

Topology should be representable independently of metric geometry.

### G2 — Ordering structure

Primary and secondary axes, centre, courtyard, bay lattice, symmetry condition, hierarchy of fronts, principal/secondary ranges and alignment lines.

### G3 — Dimensional and proportional grammar

Permissible dimensional ranges, preferred proportional families, room-height relationships, bay widths, opening ranges and dimensional hierarchy.

Prefer bands and loci over universal exact ratios.

### G4 — Vertical grammar

Stacking, principal-storey hierarchy, ceiling heights, stair continuity, opening alignment, roof/base relationships and wet/service stacking where selected.

### G5 — Elevation grammar

Bay rhythm, opening hierarchy, alignment, solid/void ranges, storey hierarchy, window family by role, centre/edge conditions, roof/cornice relationships and entrance emphasis.

### G6 — Architectural element grammar

Doors, windows, architraves, skirtings, cornices, thresholds, stairs, fireplaces, porticos, screens and joinery.

### G7 — Tectonic grammar

Where joints may occur, where metal can legitimately signal movement/wear/access, how removable linings terminate, how architectural overlap absorbs tolerance and how thresholds mediate real changes of material or datum.

This layer connects the design language to Long-Life House constructional doctrine.

## 6. Topology before geometry

Two houses can differ dimensionally while sharing the same important spatial logic.

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

That graph already says something architectural: ceremonial versus service routes, privacy depth, centrality, alternative paths and relation to garden/courtyard.

A geometric solver can later produce several site-specific plans from the same topology.

The genotype/phenotype analogy is useful if kept modest:

- **spatial genotype** — stable relational structure;
- **geometric phenotype** — one dimensional/site-specific realisation.

## 7. Hierarchy before uniform perfection

Classical domestic architecture often gains coherence from **difference under order**.

The grammar should therefore understand rank: principal rooms generally larger or more prominent than secondary rooms; principal-storey openings more emphatic than subordinate ones; circulation subordinate to rooms without becoming mean; service spaces useful without dominating composition; entrance sequence modulating spatial significance.

Conceptually:

~~~text
principal-room.area > adjacent-secondary-room.area
principal-room.ceiling-height >= secondary-room.ceiling-height
principal-room.opening-rank >= secondary-room.opening-rank
~~~

No syntax is proposed. The point is that rank may matter more than one absolute dimension.

## 8. Proportion as admissible region

Avoid brittle rules such as:

~~~text
room.length / room.width == 1.5
~~~

Real rooms must absorb wall thickness, structure, tolerances, furniture, common storey heights, circulation, services and site response.

A more useful model combines:

- an **admissible proportion band**;
- one or more **preferred ratio families**;
- a **dimensional class** based on room role.

Conceptually:

~~~text
VALID RANGE
1.25 ───────────────────────── 1.80

PREFERRED ATTRACTORS
      4:3     √2      3:2     5:3
       │       │       │       │
~~~~~~~▲~~~~~~~▲~~~~~~~▲~~~~~~~▲~~~~~~
~~~

The numbers are illustrative only.

This gives three useful states: valid and preferred; valid but non-preferred; outside grammar.

## 9. Historical ratios are inputs to research, not commandments

Palladio's well-known room families—square, 1:√2, 3:4, 2:3, 3:5, 1:2 and rare circular rooms—remain relevant, as do his arithmetic, geometric and harmonic methods for room heights.

But the first grammar should ask which relationships survive into high-quality English Georgian domestic architecture, which were theoretical ideals rather than ordinary practice, which remain useful at contemporary sizes, which conflict with modern floor-to-floor conditions and which actually improve the Reference House.

The grammar should be derived from architecture, not historical piety.

## 10. Chambers supplies the better attitude

Chambers is useful because he combines precept with practical reconciliation. Room proportion depends on use, actual size, ceiling form and plan relationship; real floors also impose shared heights on differently sized rooms.

That is close to the desired computational posture:

> **Strong preferences, explicit limits, practical reconciliation.**

The compiler should know whether an 80 mm departure from a preferred ratio is irrelevant, mildly non-preferred or enough to leave the selected language. It should not fail a good room simply because a theoretical ratio lost a small amount to structure and services.

## 11. Grammar and evaluation are different systems

A grammar determines whether a design belongs to the language. Evaluation compares valid designs against objectives.

### Grammar asks

> Is this a valid member of language G?

### Evaluation asks

> Among valid members, how does this one perform against selected objectives?

Objectives may include daylight, prospect, privacy, circulation efficiency, compactness, structural economy, cost, carbon, service-route length, garden connection, symmetry preference or closeness to preferred proportions.

Do not turn every objective into grammar. If every preference becomes a hard rule, the language becomes sterile; if none do, the system becomes generic CAD again.

## 12. Three levels of architectural authority

### A. Language invariant

Violation means the design is not a valid member of the selected grammar. Candidate future examples include forbidden topology, failure of a principal entrance to participate in the ordering structure, a principal room leaving its dimensional class, or a required primary façade opening leaving its bay relationship.

### B. Language preference

Violation is allowed but produces feedback: valid room ratio outside a preferred family, unusually solid façade, weakened axis, and similar conditions.

### C. Human judgement

The system informs but does not pretend to settle questions such as whether an asymmetry is beautifully composed, a vista is emotionally effective or an exception improves the whole.

Compiler output should state which level is speaking.

## 13. Intentional exception

Opinionated does not mean tyrannical.

A future system may support:

### Conforming mode
Hard grammar rules cannot be violated.

### Explicit exception

~~~text
GRAMMAR G-01
FAIL — EXPLICIT DEVIATION GDEV-004
~~~

The deviation records rule, location, reason, author and downstream effects.

### Different grammar

A design requiring fundamentally different ordering should select another language rather than accumulate hundreds of exceptions.

## 14. Structure and services should negotiate with grammar

The grammar should tend toward structurally sympathetic geometry—reasonable spans, aligned support where appropriate, viable piers, regular depths and compatible roof forms—without pretending those relationships prove engineering adequacy.

~~~text
ARCHITECTURAL GRAMMAR
       ↓
structurally sympathetic geometry
       ↓
STRUCTURAL OBLIGATIONS
       ↓
engineering proof
~~~

Services work similarly. Wet-room clustering, service walls, short drainage runs and clear maintenance spines may influence room placement without making the house read as a plumbing schematic.

Architecture and technical systems should constrain one another without either becoming the sole generator.

## 15. Plan, section and elevation co-evolve

The future grammar cannot generate a plan and decorate elevations afterward, nor design a façade and force a plan behind it.

They share variables: bay centres, wall positions, room hierarchy, floor levels, opening positions, sill/head levels, stair position, roof geometry and structural support.

> **Plan, section and elevation are projections of one architectural order.**

A future solver may resolve them iteratively or simultaneously. The conceptual requirement comes first.

## 16. Global and local rules

Local rules include an opening centred in a bay, a door aligned to an opposite opening or an architrave overlapping a real interface.

Global rules include principal axis, room hierarchy, façade rhythm, courtyard/circulation structure and legibility of principal/service routes.

A purely local system can produce tidy nonsense. A purely global optimiser can miss the quality of individual joints. The grammar needs both scales.

## 17. Absence is also design information

Architectural order often depends on keeping something empty: a central axis, wall mass, vista, maintenance volume, structural clear zone or courtyard void.

The formal model must therefore support constraints over **forbidden occupation and protected emptiness**, not merely placed objects.

That connects naturally to maintenance, structure, sight lines, circulation and boundary zones.

## 18. Grammar is independent of doctrine and style family

The computational architecture should eventually permit several grammars. Illustratively:

~~~text
G-01  Georgian-derived Long-Life House
A-01  Arts-and-Crafts-derived Long-Life House
C-01  Courtyard / Mediterranean-derived Long-Life House
~~~

The names beyond G-01 are speculative.

The Long-Life House doctrine is independent of them. One doctrine can inhabit several architectural languages.

## 19. G-01 should not simply mean Palladian

The Reference House is Georgian in temperament, with selective courtyard/Andalusian influence and its own Long-Life House tectonic language.

G-01 should therefore draw from English Georgian domestic architecture, Palladian/classical ordering where relevant, British pattern-book traditions, measured precedents, the emerging Reference House and the project's tectonic requirements.

Palladio is foundational precedent, not product specification.

## 20. Deriving G-01 from a controlled corpus

Do not write G-01 from memory.

### Step 1 — define corpus classes

Include canonical theoretical sources, built precedents, ordinary high-quality Georgian houses/terraces, later adaptations, known failures/caricatures and successful contemporary reinterpretations.

### Step 2 — acquire measured information

Prefer plans, sections, elevations, pattern books, archival drawings and good surveys. Do not derive metric rules from photographs when proper drawings exist.

### Step 3 — annotate semantics

Record room roles, hierarchy, connections, axes, bays, dimensions, heights, opening families, circulation and recoverable structural/service logic.

### Step 4 — extract candidate rules

Classify them as invariant, frequent tendency, preferred range, optional motif or exceptional condition.

### Step 5 — search for counterexamples

A rule that explains five favourites but rejects ten excellent houses is unlikely to be a good invariant.

### Step 6 — separate descriptive from normative

Historical frequency does not automatically become a rule for the new system.

### Step 7 — generate unseen paper designs

Ask whether they remain recognisable, avoid monotony, adapt to site, support contemporary life, cooperate with structure/services and still permit the doctrine.

### Step 8 — expert review

Architectural historians, practising architects and builders should attack historical accuracy, architectural brittleness and constructional naivety—not vote on taste.

## 21. Include bad examples

A purely positive corpus teaches only what selected good examples have in common.

Also collect awkward rooms, poor neo-Georgian façades, false symmetry, mis-scaled openings, flattened hierarchy, developer pastiche and technically compliant but dead circulation.

The useful question is not only what good examples share, but **which small relationship changes make the architecture collapse**. Those may become the best compiler errors.

## 22. Statistics and machine learning are research aids

Statistics can expose common ratio bands, bay frequencies, room hierarchies, opening spacing, adjacency and alignment. Frequency discovers candidates; it does not create normative authority.

Machine learning may help classify precedents, find relationships/outliers, propose candidate rules or retrieve analogues. It should not become the canonical grammar.

A black-box result such as `94% Georgian` is not enough. The language itself should remain inspectable, editable, versioned and explainable.

## 23. A defensible version of “impossible to lay out badly”

The system cannot guarantee that every generated house is beautiful.

A stronger ambition is:

> **Within grammar G, make known classes of spatial and compositional error impossible; make departures from preferred relationships visible; leave genuine architectural judgement explicit.**

A novice can then inherit ordering, hierarchy, proportion, alignment, circulation logic and structural sympathy without consciously knowing every rule.

## 24. The twelve-year-old test

The simple author should manipulate intent: make this the principal drawing room, enlarge it, add a bedroom, move the stair, add a bay, widen the courtyard.

The system should manage consequences such as façade alignments, threatened room hierarchy, bay validity, increased spans and broken service routes.

This is the intended division of labour: human intent at the interface, encoded architectural knowledge underneath.

## 25. Mapping to validity

### Hard grammar failure

~~~text
V7 ARCHITECTURAL GRAMMAR
FAIL
~~~

### Preference departure

~~~text
V7 ARCHITECTURAL GRAMMAR
PASS WITH WARNING
~~~

### Human judgement condition

~~~text
V7 ARCHITECTURAL GRAMMAR
REVIEW
~~~

Report grammar version, rule, authority, affected entities, reason and possible valid alternatives.

## 26. Grammar versioning

Released grammars should be immutable.

~~~text
G-01.3  Georgian-derived Long-Life House
~~~

A refinement creates G-01.4 rather than silently changing the meaning of G-01.3. Future alterations may remain on the older grammar, migrate, deviate explicitly or switch under major redesign.

## 27. Conceptual grammar object

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

Do not yet turn this into TypeScript, JSON, DSL syntax or a database schema.

## 28. Grammar needs conformance tests

Ship canonical valid/invalid examples, edge cases, near-misses, counterexamples and regressions.

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

Small mutations of good houses may be particularly valuable.

## 29. Mutation testing

Take a strong precedent and change one thing: room width, door position, alignment, upper window, circulation link, stair or bay width. Observe when coherence breaks.

This can reveal rules more effectively than measuring intact precedents alone and maps directly onto future compiler behaviour.

> **A grammar is partly defined by the mutations it refuses.**

## 30. Anti-drift rules

- Good architecture is not the golden ratio.
- Georgian does not mean symmetry everywhere.
- Historical frequency identifies candidates; it does not create rules by itself.
- The grammar should produce a coherent contemporary family, not reproduce old houses exactly.
- Not every preference should become a compile error.
- Grammar validity does not prove beauty.
- Grammar failure is not regulatory failure.
- Façade is not decoration added after plan.
- Grammar should be structurally sympathetic but never substitute for engineering proof.
- Grammar is versioned and evidence-driven, not fixed forever.

## 31. Immediate G-01 research programme

1. define scope;
2. assemble corpus;
3. define annotation schema;
4. analyse topology independently of geometry;
5. analyse hierarchy and dimensional families;
6. analyse plan/section/elevation coupling;
7. analyse opening/bay rules;
8. compare theory with built practice;
9. create candidate rules;
10. mutation-test them;
11. generate paper designs;
12. integrate survivors into Reference House paper compilation.

Do not lock a ratio table before steps 1–8.

## 32. Current position

Architectural grammar should be a first-class input to compilation, independent of regulatory target, technical domain, project/site configuration and Long-Life House doctrine.

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

That is more useful than “CAD with good proportions”. The system constrains **relationships with architectural meaning**.

---

## Research anchors

- George Stiny and William J. Mitchell, **“The Palladian Grammar”**, *Environment and Planning B* 5(1), 1978: https://doi.org/10.1068/b050005
- George Stiny and William J. Mitchell, **“Counting Palladian Plans”**, *Environment and Planning B* 5(2), 1978: https://doi.org/10.1068/b050189
- George Stiny and James Gips, **“An Evaluation of Palladian Plans”**, *Environment and Planning B* 5(2), 1978: https://doi.org/10.1068/b050199
- George Hersey and Richard Freedman, **Possible Palladian Villas (Plus a Few Instructively Impossible Ones)**, MIT Press open edition: https://mitp-arch.mitpress.mit.edu/possible-palladian-villas-plus-a-few-instructively-impossible-ones
- Roberta Spallone and Michele Calvano, **“Parametric Experiments on Palladio’s 5 by 3 Villas”**, *Nexus Network Journal* 24 (2022): https://doi.org/10.1007/s00004-022-00592-1
- Deborah Howard and Malcolm Longair, **“Harmonic Proportion and Palladio's Quattro Libri”**, *Journal of the Society of Architectural Historians* 41(2), 1982: https://doi.org/10.2307/989937
- David Hemsoll, **“Palladio and the ‘Secrets’ of Architectural Proportion”**, *Journal of the Society of Architectural Historians* 84(1), 2025: https://doi.org/10.1525/jsah.2025.84.1.4
- Andrea Palladio, **The Architecture of A. Palladio, in Four Books**, Smithsonian Libraries digital copy: https://library.si.edu/digital-library/book/architecturepal00pall
- Sir William Chambers, **A Treatise on Civil Architecture** / later *Decorative Part of Civil Architecture*: https://resources.warburg.sas.ac.uk/pdf/cmh182b2212612.pdf
- James Gibbs, **A Book of Architecture**, Sir John Soane's Museum catalogue record: https://collections.soane.org/b8780
- IHBC Context, **“Pattern books and the Georgian builder”**: https://ihbconline.co.uk/context/172/24/
- Ju Hyun Lee, Michael J. Ostwald and Ning Gu, **“A Justified Plan Graph grammar approach to identifying spatial design patterns in an architectural style”**, *Environment and Planning B* 45(1): https://doi.org/10.1177/0265813516665618
- Michael J. Ostwald et al., **“Examining control, centrality and flexibility in Palladio's villa plans using space syntax measurements”**, *Frontiers of Architectural Research* 10(3), 2021: https://doi.org/10.1016/j.foar.2021.02.002
- Sverre Magnus Haakonsen, Anders Rønnquist and Nathalie Labonnote, **“Fifty years of shape grammars”**, *International Journal of Architectural Computing* 21(1): https://doi.org/10.1177/14780771221089882
- Thomas Liebich, **“A design grammar for architectural languages”**, *Automation in Construction* 2(4), 1994: https://doi.org/10.1016/0926-5805(94)90002-7
- Michael J. Ostwald and others, **critical mapping of Christopher Alexander's Pattern Language**, *City, Territory and Architecture* 4, 2017: https://doi.org/10.1186/s40410-017-0073-1
