# Formal Architectural Model — Conceptual v0.1

**Status:** foundational research draft  
**Purpose:** define what the future computational system must be capable of representing before language syntax, database schema or CAD implementation is chosen.

## 1. Premise

A house is not a mesh.

Nor is it adequately described by a single object hierarchy.

A house simultaneously has:

- spatial organisation;
- physical composition;
- structural behaviour;
- environmental boundaries;
- service networks;
- interfaces and joints;
- maintenance geography;
- lifecycle relationships;
- regulatory obligations;
- evidence and provenance.

These structures overlap.

The same wall may:

- bound a room;
- support a floor;
- form part of the thermal envelope;
- carry an air-control layer;
- contain a window opening;
- exclude routine service routes;
- provide a backplane interface;
- participate in an acoustic separation;
- create maintenance constraints;
- discharge several regulatory obligations.

The formal model should therefore be conceived as a **multi-view semantic graph with stable identity**, not a tree of CAD objects.

## 2. Source model, derived models and outputs

The project should distinguish three things.

### Source semantic model

The authoritative description of architectural intent and selected physical systems.

It contains meaningful entities and relationships.

### Derived analytical views

Projections generated from the source for particular purposes:

- structural graph;
- boundary graph;
- service network;
- thermal model;
- quantity model;
- maintenance graph;
- regulatory obligation graph;
- geometric representation.

These may add derived values but should not silently create contradictory source truth.

### Production outputs

Human- or machine-facing artefacts:

- 3D geometry;
- IFC;
- plans / sections / elevations;
- details;
- schedules;
- calculations;
- quantities;
- compliance reports;
- assembly information;
- building record.

A drawing is therefore an output view of the building model, not the building's primary ontology.

## 3. Stable identity

Every meaningful entity should have stable identity across views.

The same window must remain the same semantic thing when appearing as:

- geometry;
- an opening in an envelope;
- a structural interruption;
- a thermal bridge context;
- an item in the quantity schedule;
- a replacement unit;
- an evidence subject;
- a later alteration.

Identity should survive regeneration of geometry.

This is necessary for:

- traceability;
- versioning;
- change impact;
- evidence;
- inspection;
- maintenance history.

## 4. Core entity families

The following families are conceptual. They do not prescribe programming classes.

### A. Project and context

Candidate entities:

- **Project**
- **Site**
- **Plot / legal boundary**
- **Climate / exposure context**
- **Ground condition**
- **Brief**
- **Assumption**
- **Compiler target reference**
- **Supported-domain profile**
- **Architectural grammar reference**

These describe the environment in which the building exists.

### B. Spatial entities

Candidate entities:

- **Building**
- **Building part**
- **Storey**
- **Space**
- **Room**
- **Circulation space**
- **Void**
- **Courtyard**
- **External space**
- **Maintenance zone**
- **Working volume**
- **Withdrawal volume**

Important relationships:

- contains;
- overlaps;
- adjacent-to;
- connected-to;
- accessible-from;
- visible-from;
- served-by;
- bounded-by.

A room is not merely a closed polyhedron. It has role, hierarchy, occupation, adjacency and architectural relationships.

### C. Physical entities

Candidate entities:

- **Assembly**
- **Element**
- **Layer**
- **Component**
- **Opening**
- **Finish**
- **Fastener**
- **Seal**
- **Cover**
- **Replaceable unit**
- **Permanent-fabric element**

Useful distinctions include:

- assembly versus occurrence;
- generic family versus selected instance;
- permanent versus replaceable;
- site-made versus manufactured;
- architectural element versus commodity component.

### D. Structural entities

Candidate entities:

- **Structural element**
- **Support**
- **Bearing**
- **Connection**
- **Load / action**
- **Load case / combination**
- **Stability system**
- **Foundation support**
- **Ground support condition**

Core relationships:

- supports;
- supported-by;
- spans-between;
- bears-on;
- restrains;
- transfers-to;
- stabilises;
- reacts-at.

The central derived object is the **load-path graph**.

A semantic structural path should exist before detailed finite-element modelling is considered.

See [Structural Semantics](structural-semantics.md), which separates physical structural fabric, structural topology and analytical idealisation and explicitly rejects load-path continuity as sufficient proof of capacity.

### E. Boundary entities

A boundary should be first-class rather than inferred casually from visible materials.

Candidate boundary roles:

- thermal;
- air;
- vapour;
- rain / water;
- drainage;
- fire;
- smoke;
- acoustic;
- security;
- pest.

Candidate entities:

- **Boundary**
- **Boundary segment**
- **Transition**
- **Penetration**
- **Opening**
- **Seal**
- **Drainage path**
- **Failure path**

Core relationships:

- separates;
- continues-through;
- transitions-to;
- penetrated-by;
- sealed-by;
- drained-by;
- interrupted-by;
- reinstated-by.

One physical assembly may carry several boundaries.

One boundary may cross many physical assemblies.

That many-to-many relationship is precisely why boundary should not be reduced to a wall property.

See [Boundary Semantics](boundary-semantics.md) for the first model of overlapping weather, thermal, air, moisture, fire, acoustic and related boundary graphs.

### F. Service-system entities

Candidate entities:

- **System**
- **Network**
- **Node**
- **Port**
- **Route segment**
- **Source**
- **Sink**
- **Equipment**
- **Valve / isolator**
- **Distribution point**
- **Drain / discharge point**

Core relationships:

- connects-to;
- feeds;
- returns-to;
- drains-to;
- isolated-by;
- routes-through;
- serves;
- requires-access-to.

The physical route and the functional network are related but not identical.

### G. Interface entities

The Long-Life House places unusual emphasis on the interface.

Candidate entities:

- **Interface**
- **Joint**
- **Datum**
- **Tolerance envelope**
- **Adjustment mechanism**
- **Fixing interface**
- **Release mechanism**
- **Movement allowance**
- **Remediation threshold**

Core relationships:

- joins;
- locates;
- attaches;
- restrains;
- permits-movement;
- seals;
- adjusts-to;
- references-datum;
- releases-from.

An interface may itself carry obligations for:

- load;
- movement;
- tolerance;
- seal;
- fire;
- acoustics;
- removal;
- inspection.

### H. Lifecycle and stewardship entities

Candidate entities:

- **Permanence class**
- **Expected service-life band**
- **Replacement unit**
- **Maintenance task**
- **Inspection task**
- **Replacement sequence**
- **Access path**
- **Working position**
- **Withdrawal path**
- **Commissioning test**
- **Change event**

Core relationships:

- maintained-by;
- inspected-by;
- replaceable-as;
- accessed-via;
- withdrawn-via;
- depends-on-removal-of;
- expected-to-outlive;
- supersedes;
- changed-by.

This is where the building becomes more than a design-stage object.

### I. Requirement, obligation and evidence entities

Candidate entities:

- **Requirement source**
- **Rule**
- **Applicability condition**
- **Obligation**
- **Assumption**
- **Evidence item**
- **Calculation**
- **Test result**
- **Product declaration**
- **External professional determination**
- **Deviation**
- **Accepted alternative**, where legally and procedurally meaningful.

These entities should not be hidden metadata.

They form an explicit evidence graph.

Evidence and provenance are developed further in [Evidence and Provenance Architecture](evidence-and-provenance.md). A key implication is that evidence has scope, dependencies and lifecycle state: a calculation or test is not a free-floating truth attached to an object.

## 5. Relationship families

The eventual model should prefer a small, explicit relationship vocabulary over hundreds of ad-hoc object attributes.

Provisional families:

### Spatial
contains / adjacent-to / connected-to / accessible-from / visible-from / bounded-by

### Physical composition
composed-of / layer-of / hosted-by / inserted-in / covers / protects

### Structural
supports / spans-between / bears-on / restrains / transfers-to / stabilises

### Boundary
separates / continues / transitions / penetrates / seals / drains / reinstates

### Services
connects / supplies / returns / drains / isolates / routes-through / serves

### Interface
attaches / locates / references-datum / adjusts / permits-movement / releases

### Lifecycle
outlives / replaceable-as / maintained-by / inspected-by / withdrawn-through / supersedes

### Requirement
creates-obligation / applies-to / discharged-by / depends-on / evidenced-by / derived-from

The exact vocabulary needs testing against real details before formalisation.

## 6. Overlapping graphs

A central design decision is that the same semantic source should admit several overlapping graphs.

### Spatial graph

Answers:

- what spaces exist?
- how do people move between them?
- which spaces are adjacent?
- what hierarchy do they form?

### Structural graph

Answers:

- what supports what?
- where do actions travel?
- where are stability paths?
- where do reactions terminate?

### Boundary graph

Answers:

- what environmental / safety boundaries exist?
- where are they continuous?
- where do they transition or get penetrated?

### Service graph

Answers:

- what supplies what?
- how are flows routed?
- where can systems be isolated?
- where do they discharge?

### Maintenance graph

Answers:

- how does a person reach the component?
- where do they stand?
- what must be removed?
- where does the old/new component travel?

### Lifecycle graph

Answers:

- what outlives what?
- what changes together?
- what is the replacement unit?
- what permanent fabric is touched by the change?

### Evidence graph

Answers:

- what claim applies to this element?
- why?
- what rule created it?
- what evidence discharged it?
- which assumptions does that evidence depend on?

No single graph is the building.

The useful object is the coordinated set.

## 7. Geometry

Geometry remains essential.

The claim is not that geometry becomes secondary in importance. It becomes secondary in **semantic authority**.

The model must support:

- exact geometry where required;
- parametric / relational geometry;
- derived geometry;
- geometric queries;
- tolerances;
- clear distinction between nominal design geometry and physical acceptance ranges.

Potential principle:

> **Semantics constrain geometry; geometry discharges some semantic obligations.**

Examples:

- Room semantics establish that usable dimensions matter.
- geometric calculation proves the actual clear width.
- Support semantics establish that bearing is required.
- geometric calculation proves bearing length.
- MaintenanceVolume semantics establish required access.
- collision/clearance analysis proves it exists.

## 8. Type safety

The software analogy of type safety should operate at relationship level.

Examples:

- a service route that is forbidden from a permanent zone cannot attach without an explicit permitted interface;
- an element declared removable cannot be the sole carrier of a boundary declared to survive routine removal;
- a structural opening cannot exist without a support resolution;
- a maintenance task cannot claim accessibility without an access/working/withdrawal path appropriate to the task;
- a component cannot claim replaceability if its replacement sequence destroys a longer-lived element contrary to the selected doctrine constraints.

These are not necessarily all compile-time type rules in a programming-language sense.

The conceptual point is:

> **invalid architectural relationships should be explicit model states, not latent facts hidden in drawings.**

## 9. Source truth versus derived truth

Not every fact should be manually authored.

### Authored facts

Examples:

- this space is the principal drawing room;
- this wall belongs to construction family W2;
- this route is designated as the horizontal service spine;
- this architectural grammar is selected.

### Derived facts

Examples:

- room area;
- span;
- quantity of masonry;
- whether a maintenance volume collides;
- calculated reaction;
- total external-wall area.

### Proven facts

Derived or authored facts that have an applicable validation method and evidence.

Example:

- “beam B14 is structurally adequate under target T” is not merely an authored boolean. It must be produced from calculation/evidence.

The system should resist allowing users to hand-author conclusions that exist specifically to be proved.

## 10. Unknowns and assumptions

A model must be able to represent uncertainty without fabricating certainty.

Examples:

- ground bearing capacity not yet investigated;
- exact product not selected;
- exposure condition awaiting site data;
- acoustic performance awaiting test evidence.

An unknown may:

- block compilation;
- create an external proof obligation;
- permit an exploratory compile under an explicitly named assumption.

Assumptions must be visible and traceable.

## 11. Occurrence, family and evidence scope

The model should distinguish:

- **family / type** — a reusable design or product concept;
- **occurrence** — a particular installed instance;
- **evidence scope** — what instances and parameter ranges a calculation, test or certification actually covers.

This matters enormously.

A tested wall family does not prove every geometrical mutation of that wall.

A lintel table does not prove spans outside its stated conditions.

A product certificate does not automatically prove a novel assembly that merely contains the product.

The formal model must preserve evidence applicability.

## 12. Time

The building model should eventually be temporal.

At minimum distinguish:

- proposed;
- approved/agreed design;
- manufactured;
- installed;
- commissioned;
- in service;
- altered;
- replaced;
- removed.

A future building version should be able to say:

> this opening exists because Change C17 superseded Opening W12 under Target T2, while the original evidence remains attached to historical Version V1.

This is not needed for the first formalisation, but the ontology should avoid making temporal identity impossible later.

## 13. Relationship to IFC and open standards

IFC is highly relevant but should not automatically become the internal semantic model.

Useful precedents include:

- stable identifiers;
- semantically treated objects;
- first-class objectified relationships;
- properties;
- spatial structure;
- distribution-system connectivity;
- model views.

The future project should attempt a mapping:

~~~text
Long-Life House semantic model
        ↕
interoperability mapping
        ↕
IFC / bSDD / IDS where appropriate
~~~

rather than:

~~~text
IFC schema
   =
the complete ontology of the Long-Life House
~~~

The internal model is allowed to express concepts—maintenance withdrawal volumes, permanence classes, doctrine constraints, evidence obligations—that may not map cleanly to current IFC constructs.

That is an interoperability problem, not a reason to erase the concept.

## 14. Initial invariants for the model itself

Before domain rules, the semantic model should eventually enforce basic integrity such as:

- every entity has stable identity;
- every relationship references existing entities;
- containment does not create impossible cycles;
- every occurrence belongs to an appropriate project/building context;
- a replacement unit has a defined extent;
- a boundary segment has a declared boundary role;
- a structural support relationship identifies direction of support;
- an obligation identifies its subject and source;
- evidence identifies its applicability scope;
- assumptions are explicit rather than hidden text comments.

These are model invariants, not architecture.

## 15. Worked example — one wall bay

A future paper compilation might represent one external wall bay as overlapping facts:

~~~text
ROOM R01
  bounded-by WALL W01

WALL W01
  construction-family W2
  supports FLOOR F01
  contains-opening O01
  participates-in THERMAL-BOUNDARY TB01
  participates-in AIR-BOUNDARY AB01
  excludes ROUTINE-SERVICE-ROUTING
  carries BACKPLANE BP01

OPENING O01
  receives WINDOW WIN01
  interrupts WALL W01
  creates STRUCTURAL-OBLIGATION SO17
  creates WATER-DETAIL-OBLIGATION WO09
  creates THERMAL-JUNCTION-OBLIGATION TO11

FLOOR F01
  bears-on WALL W01
  creates reaction R17 at bearing B01

BACKPLANE BP01
  attaches-to WALL W01 through INTERFACE I01
  supports REPLACEABLE-LINING L01
  references DATUM D01
  absorbs declared incoming tolerance through ADJUSTMENT A01
~~~

The value of the representation is not the notation.

The value is that a single design act—changing O01—can traverse several graphs and create consequences that cannot silently disappear.

## 16A. Compositional obligation bundles — finding from S0 Run 01

The first paper compilation exposed a scaling problem.

A single ordinary junction—such as a window in a masonry cavity wall—can legitimately create many obligations across:

- geometry;
- structure;
- weather;
- moisture;
- thermal performance;
- airtightness;
- fire;
- acoustics;
- replacement;
- tolerance;
- inspection;
- evidence.

Those obligations are useful internally.

They are unacceptable as manually authored user-facing bureaucracy.

The model therefore introduces a provisional research construct:

> **Interface Obligation Bundle — a meaningful architectural/physical relationship that deterministically expands into the fine-grained obligations required to resolve it.**

Examples now tested:

- [Window in Masonry Cavity Wall](interface-bundle-window-masonry.md);
- [Floor to Masonry Wall](interface-bundle-floor-masonry.md).

Both use the same machinery:

~~~text
SEMANTIC RELATIONSHIP
        ↓
CONTEXT / TARGET / DOMAIN
        ↓
OBLIGATION GROUPS
        ↓
EVIDENCE + STATUS
        ↓
DEPENDENCY INVALIDATION
~~~

The ordinary author manipulates the meaningful relationship.

The expert can inspect the expansion.

### Bundles do not own duplicate truth

A bundle must reference canonical source entities and dimensions.

For example:

**OPENING-O01.width**

is authored once.

Structural, thermal, weather, quantity and grammar views derive from it.

Do not allow each analytical view to maintain a private copy.

### Bundles preserve authority

A child obligation retains whether it comes from:

- physical/engineering validity;
- compiler target/regulation;
- product evidence;
- Long-Life House doctrine;
- architectural grammar;
- project requirement.

A high-level bundle status must never hide a failed mandatory child obligation.

### Bundles are not product macros

A bundle says **what the relationship commits the building to resolving**.

An implementation family says **how** those obligations are discharged.

This distinction allows several supported details to implement one semantic interface.

### Next scaling test — bundle composition

Do not create bundles for every noun.

The next test is whether several bundles compose into an assembly without duplicating shared obligations.

For S0:

~~~text
EXTERNAL WALL BAY
  ├── WINDOW / WALL INTERFACE
  ├── FLOOR / WALL INTERFACE
  ├── SERVICE PENETRATION
  └── WALL BOUNDARY FAMILY
~~~

Air/thermal/weather obligations shared by several children should merge into one coherent boundary graph.

If composition instead creates duplicate obligations requiring manual reconciliation, the bundle abstraction has not solved the scaling problem.

See [Interface Obligation Bundles](interface-obligation-bundles.md).

## 16. Open research problems

- How many entity families are genuinely needed before the model becomes bloated?
- Which relationships deserve first-class identity versus ordinary properties?
- How should zones that overlap geometrically but have different purposes be represented?
- How should continuous materials be reconciled with discrete component identities?
- How should finishes that are sacrificial or renewed in place be represented?
- Where does an architectural “room” differ from a regulatory “space”?
- What is the best representation of an interface spanning several physical components?
- How are tolerances represented without turning every coordinate into an interval-arithmetic problem?
- How should assemblies declare which transformations remain inside their evidence envelope?
- How should geometric constraints and graph constraints interact?
- How much of the model should be authored explicitly versus inferred?

## 17. Next validation step

Do not add more entity types merely by brainstorming.

Take a real Reference House slice and attempt to describe it using this model.

Every missing concept should be added because the worked example requires it.

Every concept that never participates in a useful rule, output or explanation should be challenged.

The ontology should grow under pressure from architecture, not under pressure from software neatness.

## External anchors

- buildingSMART, IFC 4.3 official documentation: https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/
- buildingSMART, IFC Kernel and objectified relationships: https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/ifckernel/content.html
- buildingSMART, spatial structure: https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/concepts/Object_Connectivity/Spatial_Structure/content.html
- buildingSMART Data Dictionary: https://www.buildingsmart.org/users/services/buildingsmart-data-dictionary/
- Karim Farghaly, Ranjith K. Soman and Shanjing Alexander Zhou, “The evolution of ontology in AEC: A two-decade synthesis, application domains, and future directions”, Journal of Industrial Information Integration 36 (2023), 100519: https://doi.org/10.1016/j.jii.2023.100519
