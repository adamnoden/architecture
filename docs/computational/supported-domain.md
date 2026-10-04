# Supported Domain — Candidate v0.1

**Status:** Gate-B capability definition draft  
**Purpose:** define the bounded world within which a future compiler may eventually make strong claims, without confusing architectural grammar, regulation or project ambition with what the system can actually prove.  
**Implementation:** none.

> **The supported domain is the compiler's competence boundary. It is not the limit of architecture.**

## 1. Why the domain exists

The executable-architecture proposition depends on strong guarantees.

Strong guarantees become credible only when the system is explicit about what it understands.

A universal building compiler would need to reason across:

- every structural system;
- every site condition;
- every building type;
- every regulatory route;
- every material;
- every fire strategy;
- every construction process;
- every architectural morphology.

That is not a sensible first research target.

The better strategy is a **closed but extensible domain**.

Inside the domain:

- entities and relationships are known;
- structural families have bounded proof envelopes;
- construction interfaces are known;
- regulatory routes are supported;
- evidence expectations are defined;
- outputs can be generated confidently.

Outside the domain:

- the design is not automatically rejected as bad or illegal;
- the compiler simply does not claim native proof.

## 2. Domain is distinct from target, grammar and project

The supported domain is one part of the build configuration.

~~~text
BUILD CONFIGURATION
    =
COMPILER TARGET
    +
SUPPORTED DOMAIN
    +
ARCHITECTURAL GRAMMAR
    +
LONG-LIFE HOUSE DOCTRINE PROFILE
    +
PROJECT / SITE CONFIGURATION
    +
SOURCE MODEL
~~~

These layers answer different questions.

### Compiler target

What external normative environment applies?

Example:

- England;
- new dwelling;
- a defined regulatory snapshot and compliance-route set.

### Supported domain

What kinds of buildings, systems and parameter ranges does the compiler know how to reason about?

### Architectural grammar

What design language should the house belong to?

### Doctrine profile

Which Long-Life House propositions are mandatory for this project?

### Project/site configuration

What are the particular site, brief, ground, climate and client facts?

Do not collapse these.

A detached masonry house may be inside the technical domain while failing G-01.

A beautiful G-01 house may be outside the supported structural domain.

Those are useful distinctions.

## 3. The first whole-house domain should be conservative

The current Long-Life House project contains several experimental assemblies:

- seated floor structure;
- architectural backplane;
- replaceable wall lining;
- finish-agnostic floor platform.

None is yet mature enough to define the trusted compiler baseline.

The first supported whole-house domain should therefore use the **best conventional or already well-established technical answer** wherever possible.

This is strategically important.

If the compiler concept only works when paired with unproven construction inventions, two research problems become entangled.

The first compiler domain should answer:

> **Can the computational architecture work on a technically ordinary house?**

Only later should experimental Long-Life House assemblies be promoted into supported-domain extensions after calculation, prototype and evidence work.

## 4. Two domain levels

The project should distinguish two pre-implementation domain concepts.

### Domain S0 — reference-slice domain

The smallest domain needed for the first paper compilation.

It should cover one real integrated slice:

- one principal room edge;
- one external masonry wall bay;
- one window opening;
- one upper floor bearing;
- one local service/interface condition;
- relevant boundaries;
- relevant evidence obligations.

Purpose:

- test semantic model;
- test obligation generation;
- test evidence dependencies;
- test compiler-target interaction;
- test one deliberate mutation.

S0 is not a miniature product.

It is the **research integration fixture**.

### Candidate Domain H1 — first whole-house trusted domain

A deliberately narrow family of complete houses.

H1 should be defined before software implementation, but exact engineering envelopes should remain blank until competent technical work provides them.

## 5. Candidate H1 — building/use scope

Provisional inclusion:

- new-build;
- single household;
- dwelling;
- low-rise;
- detached;
- private domestic occupation;
- no change of use;
- no existing-building fabric;
- no heritage designation dependency.

Provisional vertical form:

- one or two principal storeys;
- roof space only where it remains inside a supported roof/use condition;
- no basement in H1.

Why detached first?

Because this removes several complications that are not central to proving the compiler concept:

- party-wall interfaces;
- attached-neighbour fire/acoustic conditions;
- ownership interfaces;
- heterogeneous adjoining construction.

Semi-detached and terraced houses can become later domain extensions.

## 6. Candidate H1 — morphology

Initial geometry should be intentionally legible.

Provisional inclusion:

- orthogonal primary plan geometry;
- rectangular and composited-rectangular rooms;
- simple projections/recesses;
- conventional openings;
- one coherent primary building volume or a small number of clearly related volumes;
- conventional stairs;
- simple pitched or hipped roof families once technically defined.

Provisional exclusions:

- doubly curved structure;
- free-form shells;
- large unsupported cantilevers;
- complex transfer structures;
- highly irregular floor plates;
- extreme split-level conditions;
- occupiable bridges;
- long-span halls;
- deep atria requiring unusual smoke/fire engineering.

These exclusions are not aesthetic judgements.

They remove geometries whose technical resolution would dominate the research.

## 7. Candidate H1 — structural family

### Walls

Working baseline:

- conventional masonry construction;
- dense masonry inner leaf where consistent with the selected wall family;
- ordinary lintel/opening families within declared limits;
- no assumption that the removable wall lining is structural.

### Upper floors

Working baseline already established by the project:

- engineered timber I-joists;
- manufacturer/engineer-supported span/depth/centres;
- certified restraint-type masonry hanger or another ordinary supported connection family;
- structural deck provides diaphragm action;
- routine services are not assumed to use the joist zone as their default distribution route.

For **H1 v0**, [SAB-H1-01](structural-assurance-boundary-h1-v01.md) fixes the assurance boundary:

- structural identity/topology/geometry/dependencies are native compiler concerns;
- member, connection, stability and foundation adequacy may be discharged by scoped external engineering evidence;
- later native proof families may be admitted incrementally.

This avoids making general structural-design automation a prerequisite for the first product domain.

### Local beams / trimmers

Permitted only through defined supported families and envelopes.

LVL or steel may eventually be included for:

- stair trimmers;
- larger openings;
- local collectors;
- concentrated conditions.

But H1 should not depend on arbitrary steel transfer design.

### Stability

The domain must eventually define:

- lateral load path;
- wall restraint;
- diaphragm assumptions;
- robustness/tie strategy where applicable.

H1 cannot be called structurally supported until these are explicit.

### Foundations

Do not fake a foundation domain before site/structural research exists.

**H1 v0 decision:** foundations remain permitted only through scoped external geotechnical/structural evidence.

A simple shallow-foundation family may later be promoted into native support once its site/ground envelope and proof route are explicit.

## 8. Candidate H1 — envelope family

The current Reference House coordination study provides a useful candidate family, but dimensions remain provisional.

Conceptual baseline:

- facing-brick outer leaf;
- drained cavity;
- insulation layer;
- dense masonry inner leaf;
- explicit primary environmental boundary;
- conventional internal finish as trusted baseline.

The domain should support a **small finite family of wall assemblies**, not arbitrary user-built layer stacks.

Every supported wall family must eventually declare:

- structural role;
- thermal properties and calculation route;
- moisture strategy;
- air-control strategy;
- opening/detail families;
- allowable penetrations;
- compatibility with floor/roof interfaces;
- evidence envelope.

## 9. Candidate H1 — internal finish baseline

The trusted baseline should initially be:

### W1 — conventional mineral/plaster finish

Use where service/fixing demand is low.

Why start here?

Because:

- it is technically ordinary;
- it provides a control;
- it avoids making compiler research depend on W2 success.

### W2 — backplane + removable mineral lining

Remain a **domain extension candidate**.

Promotion conditions should include:

- wall-bay prototype success;
- load-class definition;
- boundary behaviour;
- acoustic/tactile acceptance;
- tolerance strategy;
- representative-installer success;
- evidence package.

The compiler should eventually be able to support W2.

It should not pretend to already.

## 10. Candidate H1 — floor finish baseline

Initial trusted floor:

- structural deck;
- conventional acoustic/levelling build-up;
- conventional timber/tile/stone finish-specific systems as appropriate.

The full finish-agnostic removable platform remains outside H1.

A local access band may eventually become an extension if prototype evidence justifies it.

This preserves the project principle:

> **conventional construction is the baseline; novelty earns promotion.**

## 11. Candidate H1 — roof family

The roof is currently less developed than the wall/floor system.

H1 should therefore not quietly assume arbitrary roof competence.

The first family is now selected:

- [RF-TRUSS-DUO-01 — Simple Duo-Pitched Trussed-Rafter Cold Roof](roof-family-trussed-duopitch-v01.md).

It deliberately uses:

- prefabricated timber trussed rafters;
- simple rectangular/duo-pitched geometry;
- uninhabited roof void;
- ceiling-level thermal/air boundary;
- manufacturer/engineer structural design as scoped external evidence under SAB-H1-01.

Later families may include conventional cut/engineered roofs or simple hipped derivatives.

Each roof family must define:

- supported geometry;
- spans;
- bearing/support;
- stability;
- openings;
- insulation/air/moisture strategy;
- drainage;
- maintenance access;
- evidence route.

Complex flat roofs, green roofs, large rooflights and unusual roof structures should be later extensions unless deliberately researched.

## 12. Candidate H1 — openings

Supported openings should be finite families.

Examples:

- ordinary window opening in cavity masonry;
- external door opening;
- internal door;
- standard-width larger opening within declared lintel/beam envelope.

The existing Long-Life House pattern:

**permanent opening / replaceable window**

is particularly compatible with the computational approach.

A supported opening family should eventually carry:

- structural-head solution;
- jamb/sill/head geometry;
- weather/water strategy;
- thermal/air-boundary transition;
- fixing/replacement interface;
- opening component envelope;
- evidence.

## 13. Candidate H1 — service topology

The domain should take advantage of established Long-Life House patterns that do not require exotic construction.

Initial supported strategies may include:

- controlled utility entry;
- compact plant/service hub;
- planned vertical service routes;
- horizontal service spine;
- [SR-ROOM-LOW-01](service-family-room-low-level-v01.md) for accessible low-level room distribution;
- high-service-room service wall;
- designed structural penetrations;
- water-damage-safe routes;
- source-capture kitchen extract;
- bathroom extraction;
- accessible principal isolation;
- explicit drainage/fall routes.

These are strong candidates for early computational formalisation because their value is largely topological and relational.

The domain should **not** initially support:

- arbitrary routing anywhere a void exists;
- random chasing of permanent masonry;
- uncontrolled drilling/notching of primary structure.

## 14. Candidate H1 — heating / ventilation / electrical systems

Do not attempt to support every domestic system.

The domain should eventually select explicit system families.

Examples for future decision:

### Heating

- one or two standard hydronic distribution strategies;
- perhaps underfloor and/or radiator families.

### Ventilation

- explicit natural/mechanical strategy families consistent with the selected regulatory route.

### Electrical/data

- radial/ring/lighting topology as required by competent electrical design;
- room-side service zones / defined routes;
- controlled structural crossings.

The point is not to settle these systems here.

It is to require **named supported families** before native proof.

## 15. Candidate H1 — wet rooms

Wet rooms should be deliberately constrained because they combine:

- water;
- drainage;
- ventilation;
- electrical zones;
- waterproofing;
- maintenance;
- finishes.

H1 should prefer:

- bathrooms/utility/kitchen arranged around explicit service zones;
- defined drainage routes;
- known accessible valves/components;
- bounded waterproofing systems;
- no bespoke hidden wet-service labyrinths.

The high-service-room service wall is a natural supported pattern candidate.

## 16. Candidate H1 — site envelope

A whole-house compiler cannot make trustworthy claims with arbitrary site conditions.

The project should eventually define a supported site envelope.

Candidate restrictions for H1:

- ordinary low-rise residential site;
- non-extreme topography;
- no retaining-wall-dominated design;
- no basement excavation;
- no known flood-driven special structural form;
- no unresolved contamination constraints;
- ordinary access for construction;
- declared wind/exposure inputs;
- declared ground conditions.

Do not turn these into exact thresholds until appropriate technical research exists.

Where site facts are unknown, they become explicit assumptions or external evidence obligations.

## 17. Candidate H1 — fire and complexity

The first domain should deliberately avoid designs that require novel fire engineering.

Prefer:

- simple single-family dwelling fire strategy;
- ordinary protected/escape arrangements within supported regulatory routes;
- no atrium/smoke-control system;
- no mixed use;
- no basement complexity;
- no unusual compartmentation strategy.

Again, this is not an assertion that other houses are unsafe.

It is a competence boundary.

## 18. Candidate H1 — architectural grammar independence

H1 should be able to host more than one architectural grammar.

Therefore H1 must not encode:

- “Georgian”;
- symmetry;
- classical openings;
- Palladian proportions.

Those belong to G-01.

The same technical H1 house might theoretically compile under another architectural grammar.

This separation is one of the strongest tests that the architecture of the system is correct.

## 19. Candidate H1 — doctrine independence

Likewise, H1 should not assume every Long-Life House preference.

A project may technically compile inside H1 while failing the doctrine profile.

Example:

~~~text
SUPPORTED DOMAIN       PASS
REGULATORY TARGET      PASS
STRUCTURE              PASS
LONG-LIFE DOCTRINE     FAIL
~~~

That output is meaningful.

The technical compiler competence and architectural doctrine must remain separable.

## 20. Native proof / external proof / unsupported

Each H1 capability should ultimately be assigned one of three states.

### NATIVE

The compiler can discharge the obligation using trusted internal rules/calculations/evidence families.

### EXTERNAL

The condition is permitted, but proof must be supplied by an external competent source.

Example:

- early foundation/geotechnical evidence;
- unusual local beam connection;
- specialist product-specific calculation.

### UNSUPPORTED

The system has no accepted route.

The project must:

- alter the design;
- extend the domain;
- or leave the compiler's guarantee.

This is preferable to half-support.

## 21. Domain capability matrix — provisional

| Area | H1 initial posture | Notes |
|---|---|---|
| New detached single-family house | Native candidate | First whole-house typology |
| One/two storeys | Native candidate | Exact constraints later |
| Basement | Unsupported | Add later if justified |
| Orthogonal plan | Native candidate | Curvilinear special cases later |
| Cavity masonry envelope | Native candidate | Finite wall-family library |
| Engineered I-joist upper floor | Native topology / external adequacy in H1 v0 | SAB-H1-01; future bounded native proof family possible |
| Conventional plaster/mineral lining | Native candidate | Trusted control |
| W2 removable lining/backplane | Extension candidate | Requires prototype/evidence |
| Full removable floor platform | Unsupported initially | Experimental |
| Local floor-access band | Extension candidate | Prototype dependent |
| Simple duo-pitched trussed roof | **Supported candidate** | RF-TRUSS-DUO-01; truss adequacy external, geometry/boundaries native semantics |
| Arbitrary steel frame | Unsupported | Local defined beams may be allowed |
| Complex transfer structure | Unsupported | Outside initial purpose |
| Simple masonry openings | Native semantics / external structural adequacy initially | Boundary family can be native while lintel/masonry capacity remains scoped external evidence |
| Long-span opening | External/unsupported | Depends on future structural domain |
| Controlled service spine | Native candidate | Strong doctrine/pattern basis |
| High-service wall | Native candidate | Technical build-up to define |
| Arbitrary service routing | Unsupported | Deliberately |
| Ordinary site | Candidate | Site thresholds unresolved |
| Complex retaining/site structures | Unsupported | Later extension |
| Foundations | **External in H1 v0** / future native family | Explicit programme decision under SAB-H1-01 |
| Standard prescriptive fire strategy | Candidate | Tied to compiler target |
| Fire-engineered alternative | External/unsupported | Not native H1 |
| G-01 Georgian grammar | Separate input | Not domain capability |
| Long-Life doctrine | Separate profile | Not domain capability |

Nothing marked “Native candidate” is yet a software capability.

The table defines research intent.

## 22. Domain extensions

The supported domain should grow by **admission**, not by casual feature creep.

A proposed extension should state:

1. new entity/relationship semantics;
2. affected obligations;
3. engineering evidence;
4. regulatory implications;
5. interaction with existing assemblies;
6. conformance tests;
7. reference example;
8. failure/unsupported behaviour.

Potential future extensions:

- H1-W2 removable lining;
- H1-FP local access floor;
- H2 semi-detached/party wall;
- H3 terrace;
- H4 basement;
- H5 alternative structure;
- H6 flat-roof family.

Names are illustrative.

## 23. Promotion rule for experimental Long-Life systems

An experimental assembly should enter the native supported domain only after:

### Architectural evidence
It meets tactile/visual/tectonic acceptance.

### Technical evidence
Structure, fire, acoustics, moisture and other relevant performance are resolved.

### Workmanship evidence
Ordinary competent installers can achieve the intended result within declared tolerances.

### Replacement evidence
The claimed reversible/replaceable behaviour actually works at 1:1 scale.

### Domain specification
Parameter envelope and incompatible conditions are explicit.

### Conformance cases
Known-pass and known-fail examples exist.

This connects the physical prototype programme directly to future computational capability.

## 24. Paper compilation and S0

See [Domain S0 — Paper Compilation Fixture](paper-compilation-s0.md) for the exact v0.1 integration-test specification.

The first paper compilation should **not** attempt the entire H1 house.

Use Domain S0.

Recommended slice:

- principal room edge;
- cavity masonry external wall;
- replaceable window/opening pattern;
- I-joist upper-floor bearing;
- conventional W1 internal finish for the trusted baseline;
- one local service route/penetration;
- relevant thermal/air/water/acoustic/fire obligations;
- maintenance/replacement route;
- evidence plan.

Optionally run a **second comparative paper compile** using the candidate W2 wall system.

This gives:

~~~text
S0-A  conventional trusted baseline
S0-B  selective tectonic candidate
~~~

That comparison would be highly informative.

The compiler model could be tested without pretending W2 has already earned native support.

## 25. What H1 deliberately does not solve

H1 is not intended to answer:

- arbitrary architecture;
- conservation;
- listed buildings;
- conversions;
- apartments;
- high-rise;
- commercial buildings;
- complex fire engineering;
- basements;
- extreme sites;
- arbitrary structural systems;
- sculptural free-form geometry;
- every HVAC system;
- every product;
- every compliance route.

A narrow useful compiler is more credible than a broad dishonest one.

## 26. Relationship to the Reference House

The Reference House is allowed to exceed H1.

That is important.

The architecture should not be constrained by today's compiler research merely because the compiler is incomplete.

Where the Reference House uses an unsupported condition, the research record should say:

> **Reference House design exceeds current supported-domain capability here.**

The compiler domain can later grow to meet the architecture if the condition proves valuable and supportable.

This preserves the correct authority:

> **architecture leads; the compiler earns coverage.**

## 27. Open questions

- Should H1 permit semi-detached houses, or is detached-only materially cleaner?
- Is two storeys enough, or should a third/light attic storey be included?
- Which foundation family gives the best first native proof envelope?
- Which roof family is ordinary, flexible and computationally tractable?
- How much local steel can exist before the domain is effectively arbitrary structural engineering?
- What exact span/opening envelopes are technically useful?
- Which wall families should exist beyond the Reference House masonry family?
- Which heating/ventilation strategies deserve native support?
- How should sloping sites be parameterised?
- Which fire/acoustic obligations become materially harder if party walls are added?
- Should a later “all-native proof” tier exist in addition to H1-v0 release-grade compilation with scoped external professional evidence?
- What is the smallest H1 that still produces enough architectural variety to justify a product?

## 28. Immediate work

S0 Run 01/02 and S1 Run 01 have now exercised the compiler from junction scale through a complete room. S1 adds an external corner, ground-floor perimeter dependency, multi-role door, two non-identical windows, room-level ventilation/accessibility and a service branch. Complexity remains provisionally contained, but S1 exposes **unresolved-family gravity** as the dominant Gate-B risk.

Before H1 can graduate from candidate to specification:

1. **S1 Run 01 — complete; room-scale fixture frozen**;
2. **BF-CORNER-MCW-01 — established v0.1**;
3. **BF-GF-MCW-01 — established v0.1**;
4. **SR-ROOM-LOW-01 — established v0.1**;
5. external competent red-team of S0/S1 structural/regulatory/evidence boundaries;
6. select first roof family;
7. retain foundations as scoped external proof in H1 v0;
8. deepen England-new-dwelling target coverage/regression testing;
9. advance G-01 to the first small candidate constraint set needed for connected-room research;
10. revise H1 and test whether ordinary houses are mostly supported rather than mostly external;
11. design S2 only after the minimum G-01 candidate constraints and capability review are ready.

## 28A. Post-S1 H1 capability audit

The current whole-house audit is recorded in [H1 Capability Matrix — Post-S1](h1-capability-matrix-v01.md).

Its main conclusion is:

> **H1 is not yet Gate-B complete, but the remaining gaps are modular rather than foundational.**

The compiler architecture now has credible paper evidence for:

- semantic source-of-truth;
- composition;
- scoped obligations;
- evidence/provenance;
- selective invalidation;
- repeated-family reuse;
- complexity containment through room scale.

The dominant remaining ordinary-house gaps are:

- stair / vertical circulation;
- external entrance door;
- whole-house ventilation;
- heating / water / drainage / wet-room strategy;
- whole-house fire/escape family;
- whole-dwelling L/O calculations;
- external competent review.

The first roof gap is now materially reduced by RF-TRUSS-DUO-01.

## 29. Current conclusion

The first supported domain should be **boring in exactly the right ways**.

It should use:

- ordinary masonry;
- ordinary certified structural families;
- ordinary pitched roofs;
- known service routes;
- conventional finishes where experimental alternatives are not yet proven.

The architectural ambition then lives in:

- spatial grammar;
- proportion;
- hierarchy;
- service topology;
- interface design;
- maintainability;
- evidence;
- selective later extensions.

This separation is crucial.

> **The compiler should prove itself on ordinary construction before asking novel construction to prove itself through the compiler.**
