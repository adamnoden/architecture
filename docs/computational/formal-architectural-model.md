# Formal Architectural Model — Conceptual v0.2

**Status:** conceptual foundation; core identity, relationship and obligation mechanisms exercised by P0, broader entity families remain research  
**Purpose:** define the semantic building model independently of any particular syntax, database schema or CAD implementation

## 1. Premise

A CAD model is usually organised around objects and geometry. That is not enough for this project because the same piece of building participates in several systems at once.

One external wall may bound a room, support a floor, carry thermal and air boundaries, contain an opening, exclude routine services, receive an attachment plane, separate sound and create maintenance obligations.

Those are not alternative descriptions. They are simultaneous relationships.

The formal model should therefore be a **multi-view semantic graph with stable identity**, not a single object hierarchy.

The relevant views include:

- spatial organisation;
- physical composition;
- structural behaviour;
- environmental and safety boundaries;
- service networks;
- interfaces;
- maintenance and lifecycle relationships;
- regulatory obligations;
- evidence and provenance.

## 2. Source model, derived views and outputs

Keep three layers distinct.

### Source semantic model

The authoritative description of architectural intent and selected physical systems: meaningful entities and relationships authored or selected by the design process.

### Derived analytical views

Purpose-specific projections such as structural, boundary, service, thermal, quantity, maintenance, obligation and geometric models.

They may derive values from the source but should not create contradictory private versions of source truth.

### Production outputs

Human- and machine-facing artefacts: 3D geometry, IFC, drawings, schedules, calculations, quantities, compliance reports, assembly information and the building record.

A drawing is therefore a view of the source model, not the primary ontology of the building.

## 3. Stable identity

Every meaningful entity needs stable identity across views and over regeneration.

A window appearing in geometry, the thermal model, a quantity schedule, a replacement sequence and a later alteration must remain the same semantic occurrence.

Stable identity enables traceability, versioning, change impact, evidence attachment, inspection and maintenance history.

## 4. Core entity families

These families are conceptual; they do not prescribe programming classes.

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

### B. Spatial entities

Candidate entities:

- **Building / building part / storey**
- **Space / room / circulation space / void / courtyard / external space**
- **Maintenance zone / working volume / withdrawal volume**

Important relationships include `contains`, `overlaps`, `adjacent-to`, `connected-to`, `accessible-from`, `visible-from`, `served-by` and `bounded-by`.

A room is not merely a closed polyhedron. It has role, hierarchy, occupation and adjacency.

### C. Physical entities

Candidate entities:

- **Assembly / element / layer / component**
- **Opening / finish / fastener / seal / cover**
- **Replaceable unit / permanent-fabric element**

The model needs to distinguish family from occurrence, permanent from replaceable, site-made from manufactured, and architectural element from commodity component.

### D. Structural entities

Candidate entities:

- **Structural element / support / bearing / connection**
- **Load / action / load case / combination**
- **Stability system**
- **Foundation support / ground support condition**

Core relationships include `supports`, `spans-between`, `bears-on`, `restrains`, `transfers-to`, `stabilises` and `reacts-at`.

The key derived object is the **load-path graph**. A semantic path should exist before detailed analytical idealisation.

See [Structural Semantics](structural-semantics.md). Load-path continuity is necessary but does not prove capacity.

### E. Boundary entities

A boundary should be first-class rather than inferred from visible materials.

Roles may include thermal, air, vapour, rain/water, drainage, fire, smoke, acoustic, security and pest control.

Candidate entities include **Boundary**, **Boundary segment**, **Transition**, **Penetration**, **Opening**, **Seal**, **Drainage path** and **Failure path**.

A physical assembly can carry several boundaries, and one boundary can cross several assemblies. That many-to-many relationship is why “air boundary” should not be reduced to a property on a wall object.

See [Boundary Semantics](boundary-semantics.md).

### F. Service-system entities

Candidate entities:

- **System / network / node / port / route segment**
- **Source / sink / equipment / isolator / distribution point / discharge point**

Core relationships include `connects-to`, `feeds`, `returns-to`, `drains-to`, `isolated-by`, `routes-through`, `serves` and `requires-access-to`.

The functional network and its physical route are related but not identical.

### G. Interface entities

Candidate entities:

- **Interface / joint / datum / tolerance envelope**
- **Adjustment mechanism / fixing interface / release mechanism**
- **Movement allowance / remediation threshold**

Relationships include `joins`, `locates`, `attaches`, `restrains`, `permits-movement`, `seals`, `adjusts-to`, `references-datum` and `releases-from`.

An interface may itself create load, movement, tolerance, boundary, removal and inspection obligations.

### H. Lifecycle and stewardship entities

Candidate entities:

- **Permanence class / expected service-life band / replacement unit**
- **Maintenance task / inspection task / replacement sequence**
- **Access path / working position / withdrawal path**
- **Commissioning test / change event**

Core relationships include `maintained-by`, `inspected-by`, `replaceable-as`, `accessed-via`, `withdrawn-via`, `depends-on-removal-of`, `expected-to-outlive`, `supersedes` and `changed-by`.

### I. Requirement, obligation and evidence entities

Candidate entities:

- **Requirement source / rule / applicability condition / obligation / assumption**
- **Evidence item / calculation / test result / product declaration**
- **External professional determination / deviation / accepted alternative** where procedurally meaningful

These are not incidental metadata. They form the evidence graph.

Evidence has scope, dependencies and lifecycle state; see [Evidence and Provenance Architecture](evidence-and-provenance.md).

## 5. Relationship vocabulary

Prefer a small explicit relationship vocabulary over hundreds of ad-hoc object properties.

Provisional families:

- **Spatial:** contains / adjacent-to / connected-to / accessible-from / visible-from / bounded-by
- **Composition:** composed-of / layer-of / hosted-by / inserted-in / covers / protects
- **Structural:** supports / spans-between / bears-on / restrains / transfers-to / stabilises
- **Boundary:** separates / continues / transitions / penetrates / seals / drains / reinstates
- **Services:** connects / supplies / returns / drains / isolates / routes-through / serves
- **Interface:** attaches / locates / references-datum / adjusts / permits-movement / releases
- **Lifecycle:** outlives / replaceable-as / maintained-by / inspected-by / withdrawn-through / supersedes
- **Requirement:** creates-obligation / applies-to / discharged-by / depends-on / evidenced-by / derived-from

The exact vocabulary should grow from worked cases rather than brainstorming.

## 6. Overlapping graphs

The same source model should generate several coordinated graphs.

### Spatial graph
What spaces exist, how are they connected and what hierarchy do they form?

### Structural graph
What supports what, how do actions travel and where do reactions terminate?

### Boundary graph
Which safety/environmental boundaries exist, where are they continuous and where do they transition or get penetrated?

### Service graph
What supplies what, how do flows move, and where can systems be isolated or discharged?

### Maintenance graph
How does a person reach the component, where can they work, what is removed and where does the replacement travel?

### Lifecycle graph
What outlives what, what changes together and what permanent fabric is touched?

### Evidence graph
What claim applies, what created it, what discharged it and which assumptions does that evidence depend on?

No graph is the building by itself. The useful model is the coordinated set.

## 7. Geometry

Geometry remains essential; it simply does not have sole semantic authority.

The model must support exact and relational geometry, derived geometry, geometric queries, tolerances and a distinction between nominal design geometry and acceptance ranges.

A useful relationship is:

> **Semantics create geometric obligations; geometry can discharge some of them.**

A room creates a usable-width obligation; a query proves the clear width. A support relationship creates a bearing obligation; geometry proves the bearing length. A maintenance task creates working/withdrawal-volume obligations; clearance analysis proves whether they exist.

## 8. Relationship-level type safety

Some relationships should be invalid by construction or become explicit compile failures.

Examples:

- a forbidden service route cannot attach to permanent fabric without a permitted interface;
- a removable element cannot silently become the sole carrier of a boundary required to survive its removal;
- a structural opening cannot exist without support resolution;
- “accessible” maintenance cannot pass without the required approach, working and withdrawal geometry;
- “replaceable” cannot pass where replacement destroys a longer-lived element contrary to selected project constraints.

These need not all become programming-language type rules. The model requirement is simpler: **invalid architectural relationships must be explicit states, not latent facts hidden in drawings.**

## 9. Authored, derived and proven facts

Not every fact should be hand-authored.

**Authored:** this is the principal drawing room; this wall uses family W2; this route is the primary service route; this grammar is selected.

**Derived:** room area, span, masonry quantity, collision state, reaction, external-wall area.

**Proven:** an authored or derived proposition for which an applicable validation method and evidence exist.

“Beam B14 is adequate under target T” should not be a user-set boolean. It should arise from evidence or calculation.

## 10. Unknowns and assumptions

The model must represent uncertainty without converting it into certainty.

Unknown ground capacity, unselected products, unresolved exposure or pending acoustic evidence may block compilation, create an external proof obligation, or permit an exploratory compile under an explicit assumption.

Assumptions must be visible and traceable.

## 11. Family, occurrence and evidence scope

Keep three ideas separate:

- **family/type** — reusable design or product concept;
- **occurrence** — one installed instance;
- **evidence scope** — the parameter range and occurrences actually covered by a calculation, test or certification.

A tested wall family does not prove every geometric mutation. A lintel table does not cover spans outside its conditions. A product certificate does not prove every novel assembly that contains the product.

The formal model must preserve applicability.

## 12. Time

The model should eventually distinguish proposed, agreed, manufactured, installed, commissioned, in-service, altered, replaced and removed states.

A later implementation should be able to retain statements such as:

> Opening O17 superseded O12 under Change C17 and Target T2; evidence for O12 remains attached to historical Version V1.

P0 does not support the full lifecycle. The ontology should nevertheless avoid making temporal identity impossible later.

## 13. IFC and open standards

IFC is relevant but should not automatically become the internal ontology.

Its useful precedents include stable identifiers, semantic objects, objectified relationships, properties, spatial structure, system connectivity and model views.

The intended relationship is:

~~~text
HSA semantic model
        ↕
interoperability mapping
        ↕
IFC / bSDD / IDS where appropriate
~~~

The internal model may need concepts that do not map cleanly to present IFC constructs, such as maintenance withdrawal volumes, permanence classes, HSA/project constraints or evidence obligations. That is an interoperability problem, not a reason to discard them.

## 14. Model integrity invariants

Before architectural rules, the semantic model itself should enforce basic integrity:

- stable identity for every entity;
- relationships reference existing entities;
- containment has no impossible cycles;
- occurrences belong to valid project/building context;
- replacement units have defined extent;
- boundary segments declare their role;
- support relationships declare direction;
- obligations identify subject and source;
- evidence declares applicability;
- assumptions are explicit rather than hidden in comments.

These are model invariants, not architectural doctrine.

P0 has exercised a deliberately small subset of these invariants in software: stable identity, relationship endpoints, simple spatial overlap/adjacency and hosted-opening conditions. That executable subset should not be mistaken for implementation of the full conceptual model.

## 15. Worked wall-bay example

A single external bay might be represented as overlapping facts:

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
  carries ATTACHMENT-PLANE AP01

OPENING O01
  receives WINDOW WIN01
  interrupts WALL W01
  creates STRUCTURAL-OBLIGATION SO17
  creates WATER-DETAIL-OBLIGATION WO09
  creates THERMAL-JUNCTION-OBLIGATION TO11

FLOOR F01
  bears-on WALL W01
  creates reaction R17 at bearing B01

ATTACHMENT-PLANE AP01
  attaches-to WALL W01 through INTERFACE I01
  supports REPLACEABLE-LINING L01
  references DATUM D01
  absorbs declared incoming tolerance through ADJUSTMENT A01
~~~

The notation is not the point. Changing O01 can now propagate through several graphs without its consequences silently disappearing.

## 16. Findings from paper compilation

### 16.1 Obligation bundles — S0 Run 01

An ordinary junction such as a window in a cavity wall can create legitimate obligations across geometry, structure, weather, moisture, thermal performance, air, fire, acoustics, replacement, tolerance, inspection and evidence.

Those obligations are useful internally but unacceptable as manually authored bureaucracy.

The project therefore introduced an **Interface Obligation Bundle**: a meaningful relationship that contributes semantic graph fragments, local constraints, applicability facts and evidence dependencies from which obligations are derived.

Tested examples:

- [Window in Masonry Cavity Wall](interface-bundle-window-masonry.md)
- [Floor to Masonry Wall](interface-bundle-floor-masonry.md)

The common machinery is:

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

The author manipulates the architectural relationship; the expert can inspect the resulting obligations.

### 16.2 Composition correction — ASM-S0-WALL-BAY-01

The first composition test showed that bundles should not emit final independent checklists and rely on later de-duplication.

Instead:

~~~text
AUTHORING RELATIONSHIPS
        ↓
BUNDLE / ASSEMBLY CONTRIBUTIONS
        ↓
SHARED DOMAIN GRAPHS
        ↓
CANONICAL OBLIGATION DERIVATION
        ↓
EVIDENCE / STATUS
~~~

A wall field, window transition, floor edge and service sleeve do not create four separate air boundaries. They contribute to one boundary graph whose continuity is evaluated after composition.

See [Assembly Composition Test 01](assembly-composition-s0-wall-bay.md).

Bundles must also reference canonical source facts rather than duplicate them. `OPENING-O01.width` is authored once; structural, thermal, weather, quantity and grammar views derive from it.

Authority remains attached to each obligation: engineering validity, regulation/target, product evidence, HSA/project requirement, grammar or client requirement. A bundle-level status must never hide a failed mandatory child obligation.

A bundle defines **what a relationship commits the building to resolving**. An implementation family defines **how those obligations are discharged**.

### 16.3 Evaluation scope and contribution — S1

The same source entity can contribute to propositions evaluated at different scales.

A window may contribute to occurrence-level safety glazing, interface-level envelope continuity, room purge ventilation, elevation fire analysis and whole-building overheating.

Those are not duplicate window checks. The obligation belongs to the subject whose proposition is being evaluated.

Useful conceptual scopes include:

~~~text
OCCURRENCE
INTERFACE
ROUTE
ROOM
ELEVATION
SYSTEM
BUILDING
SITE / TARGET
~~~

This remains research vocabulary, not an implementation enum.

A lower-level entity may contribute facts without owning the higher-level compliance claim. Effective opening area can feed a room purge calculation; glazing/orientation can feed a whole-building overheating model. Keeping contribution separate from ownership prevents duplicated obligations and incorrect invalidation.

### 16.4 Contextual roles — S1

The same door or window can participate in many analyses. Do not respond by turning physical entities into god-objects with permanent properties for every possible role.

Prefer:

~~~text
STABLE ENTITY
    +
TYPED RELATIONSHIPS / CONTEXT MEMBERSHIPS
    +
SCOPE-SPECIFIC DERIVED OBLIGATIONS
~~~

Example:

~~~text
WIN-S-01
  PARTICIPATES_IN   PURGE_ROUTE-R01
  LOCATED_ON        ELEVATION-SOUTH
  HAS_ARCH_ROLE     PRIMARY_OPENING
  IN_SECURITY_SCOPE GROUND_FLOOR_ACCESSIBLE
~~~

The implementation mechanism is open. The architectural requirement is that roles remain contextual and compositional rather than permanently inflating the nouns of the model.

See [S1 Paper Compilation Run 01](s1-paper-compile-run-01.md).

### 16.5 Route roles are authored semantics — S2

S2 showed that identical spatial connectivity can have different architectural validity when the intended route role changes: principal arrival, secondary circulation, service route or escape route.

Route class therefore belongs to source architectural intent, not merely downstream analysis decoration. Technical analyses consume that authored semantic role at the relevant scope.

See [S2 Paper Compilation Run 01](s2-paper-compile-run-01.md).

### 16.6 `RESOLVABLE WITHIN CURRENT FAMILY` — provisional research state

S2-M08 exposed a useful distinction. After an upper-floor change, the current stair occurrence/evidence became stale while the selected stair family still contained a valid re-parameterised solution.

Conceptually:

~~~text
CURRENT OCCURRENCE
  INVALID / STALE

SELECTED FAMILY
  still contains a valid solution
~~~

A possible authoring state is:

> **RESOLVABLE WITHIN CURRENT FAMILY**

It is **not** a release state and is not part of the canonical validity lattice. It must survive unrelated cases before promotion, and must never blur the difference between “a solution probably exists” and “the current building is valid”.

## 17. Open research problems

- How many entity families are actually needed?
- Which relationships deserve first-class identity rather than properties?
- How should overlapping zones with different purposes be represented?
- How should continuous materials coexist with discrete component identity?
- How should sacrificial or in-place-renewed finishes be represented?
- Where does an architectural room differ from a regulatory space?
- What is the right representation of an interface spanning several components?
- How should tolerance be represented without turning all geometry into interval arithmetic?
- How do assemblies declare the transformations covered by their evidence?
- How should geometric and graph constraints interact?
- What should be authored explicitly and what can be inferred safely?

## 18. Current validation discipline

Do not expand the ontology by brainstorming.

P0 and `PAT-XW-01` have already demonstrated that a small subset of stable identity, typed relationships, obligation derivation, scoped evidence and local invalidation can survive executable mutation tests. That is enough to freeze generic ontology growth.

Add a concept only when Reference House work, physical testing or competent professional review exposes a real relationship that the existing model cannot express cleanly. Challenge any concept that never participates in a useful rule, output or explanation.

See [P0 + PAT-XW-01 — Executable Gate Result](p0-pat-xw-01-result.md).

## External anchors

- buildingSMART, IFC 4.3 official documentation: https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/
- buildingSMART, IFC Kernel and objectified relationships: https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/ifckernel/content.html
- buildingSMART, spatial structure: https://standards.buildingsmart.org/IFC/RELEASE/IFC4_3/HTML/concepts/Object_Connectivity/Spatial_Structure/content.html