# Assembly Composition Test 01 — External Wall Bay

**Identifier:** ASM-S0-WALL-BAY-01  
**Status:** conceptual composition test v0.1  
**Origin:** S0 Paper Compilation Run 01 + interface-bundle validation  
**Purpose:** test whether interface obligation bundles compose without duplicating or contradicting shared structural, boundary and evidence obligations.  
**Implementation:** none

> **Composition should assemble one building graph, not concatenate several checklists.**

## 1. Why this test exists

S0 Run 01 exposed obligation explosion.

The first response was the **Interface Obligation Bundle**:

- Window in Masonry Cavity Wall;
- Floor to Masonry Wall.

Both successfully package recurring multi-domain consequences behind meaningful author-facing relationships.

But composition exposes a second-order problem.

If each bundle independently emits:

- air-continuity obligation;
- thermal-continuity obligation;
- moisture obligation;
- structural-support obligation;
- inspection obligation;

then an external wall bay containing several interfaces produces duplicates.

A naïve architecture would then need a second system to merge those duplicates.

That would be a warning sign.

## 2. Initial composition

S0 wall bay contains:

~~~text
EXTERNAL WALL BAY ASM-S0-WALL-BAY-01
  |
  |-- WALL W01
  |
  |-- IF-WIN-MCW-01
  |     window WIN01 / opening O01
  |
  |-- IF-FLR-MCW-01
  |     floor F01 / wall W01
  |
  |-- PENETRATION P01
  |     controlled service crossing
  |
  |-- ROOM-SIDE FINISH
        S0-A direct finish
        OR
        S0-B W2 lining
~~~

All four children touch at least one shared performance system.

## 3. The naïve model fails conceptually

Suppose the bundles independently emit:

~~~text
WINDOW BUNDLE
  AIR-01 window transition continuous
  THERMAL-01 window transition continuous

FLOOR BUNDLE
  AIR-02 floor edge continuous
  THERMAL-02 floor edge continuous

PENETRATION
  AIR-03 sleeve sealed
  THERMAL-03 local insulation resolved

WALL FAMILY
  AIR-04 wall field continuous
  THERMAL-04 wall field continuous
~~~

These are not four independent air boundaries.

They are four **local contributions to AIR-B03**.

Likewise for the thermal boundary.

Concatenating the obligations obscures the actual architectural proposition:

> **AIR-B03 must form one coherent enclosure through all of those local transitions.**

## 4. Corrected model — contributions before obligations

The composition test suggests a refinement.

An interface bundle should primarily contribute:

1. semantic entities;
2. graph fragments;
3. local facts/constraints;
4. applicability facts;
5. evidence dependencies.

Then the obligation engine evaluates the **composed graph**.

Conceptually:

~~~text
AUTHORING RELATIONSHIPS
       |
       v
INTERFACE / ASSEMBLY BUNDLES
       |
       | contribute
       v
SHARED DOMAIN GRAPHS
  - structural
  - weather
  - thermal
  - air
  - moisture
  - fire
  - acoustic
  - service
  - maintenance
       |
       v
CANONICAL OBLIGATION DERIVATION
       |
       v
EVIDENCE / STATUS
~~~

This is stronger than:

~~~text
bundle A -> checklist A
bundle B -> checklist B
bundle C -> checklist C
merge checklists later
~~~

## 5. Boundary composition example

### AIR-B03

Base wall contributes:

- parge field segment.

Window bundle contributes:

- wall-air-layer → frame transition at head/jamb/sill.

Floor/wall bundle contributes:

- floor-edge continuation condition.

Service penetration contributes:

- sleeve transition.

The composed graph is:

~~~text
PARGE FIELD
   |
   +---- WINDOW HEAD/JAMB/SILL TRANSITION ---- FRAME
   |
   +---- FLOOR EDGE TRANSITION
   |
   +---- SERVICE SLEEVE TRANSITION
~~~

Canonical obligation:

> **AIR-B03 is topologically continuous across all represented S0 transitions, and every physical transition has an accepted evidence route.**

This can produce two different statuses:

- semantic continuity: PASS;
- physical/material evidence: UNRESOLVED.

That distinction survived Run 01 and becomes clearer under composition.

## 6. Thermal composition example

The wall, window, floor edge and service penetration all contribute to one thermal boundary.

The composed model should derive:

### Field obligations

- wall field U-value;
- window Uw.

### Junction obligations

- window head/jamb/sill;
- floor edge;
- local penetration disturbance.

### Whole-boundary obligation

- no unrepresented break in THERMAL-B02.

The same 1200 mm opening width is referenced by:

- wall quantity;
- window product;
- opening heat-loss area;
- junction geometry;
- structural head condition.

It remains authored once.

## 7. Structural composition example

The wall bay contains several structural relations.

### Floor bundle contributes

~~~text
FLOOR F01
  -> HANGER H01
  -> INNER LEAF W01C
  -> WALL BELOW
~~~

### Window bundle contributes

~~~text
WALL ABOVE OPENING
  -> HEAD SUPPORT L01
  -> SIDE PIERS
  -> WALL BELOW
~~~

### Penetration contributes

~~~text
P01 removes/localises material in RIGHT PIER
~~~

After composition, the structural graph can see that:

- the right pier receives opening-head reactions;
- the same pier contains P01;
- floor/wall reactions may also enter the wall field nearby.

The penetration should therefore not be assessed in an isolated “service bundle” that has no knowledge of structural context.

This is exactly why the composed graph must exist before final obligation derivation.

## 8. Maintenance composition example

Window bundle contributes:

- window withdrawal volume.

Room/fit-out contributes:

- fixed joinery volume.

The canonical maintenance obligation is evaluated on the composed spatial model.

This is how Mutation M3 works:

- neither window nor joinery is intrinsically invalid;
- their composition violates required replacement geography.

The failure belongs to the relationship between valid objects.

## 9. Obligation identity

The composition test suggests that obligation identity should not be based on:

> parent bundle + local rule number

alone.

Canonical identity should be tied to the proposition being proved.

Conceptually:

~~~text
OBLIGATION
  subject / graph
  proposition
  authority
  phase
  target/profile
~~~

Example:

~~~text
subject:
  AIR-B03

proposition:
  required enclosure is continuous across represented transitions

authority:
  physical boundary + selected target route

phase:
  design

target:
  T-ENG-NDW-2026-10-03-S0
~~~

Several bundles may contribute evidence/dependencies to this one obligation.

## 10. Local obligations still exist

Not every obligation should be globalised.

Examples legitimately local to a window interface:

- frame fits opening;
- repeat fixing strategy;
- withdrawal clearance.

Examples legitimately local to floor/wall:

- hanger compatibility;
- local bearing;
- joist end condition.

The distinction is:

### Local obligation

Can be evaluated meaningfully within the interface's own semantic extent.

### Composed obligation

Depends on continuity, interaction or cumulative state across multiple interfaces.

The formal model will need both.

## 11. Bundle role revised

After this test, the best definition is:

> **An Interface Obligation Bundle is a reusable semantic expansion of an architectural/physical relationship into graph contributions, local constraints, applicability facts and evidence dependencies from which local and composed obligations are derived.**

This replaces the weaker definition:

> bundle = reusable list of generated checks.

That is a meaningful refinement.

## 12. Assembly family role

An **Assembly Family** can now be distinguished from an interface bundle.

### Interface bundle

Represents a relationship:

- window in wall;
- floor to wall;
- service through boundary.

### Assembly family

Represents a repeatable physical arrangement composed from:

- entities;
- interface bundles;
- material/product families;
- boundary graph fragments;
- dimensional envelope;
- evidence envelope.

Example:

**EXTERNAL_WALL_BAY_WITH_WINDOW_AND_FLOOR_EDGE**

The assembly family can offer a coherent supported implementation envelope.

The source building still owns the actual occurrences.

## 13. Evidence composition

Evidence should also compose by scope.

Example:

A wall air-boundary method statement may cover:

- parge field;
- window tapes;
- service sleeves;

while a site inspection supplies occurrence-level evidence.

Do not require a duplicate evidence file per child bundle merely because several local conditions depend on it.

Likewise, one product certificate may support several occurrences only inside its declared family/parameter envelope.

## 14. Conflict behaviour

Composition must reveal conflicts between otherwise valid children.

Potential example:

- window interface requires 150 mm bearing zone;
- floor hanger field occupies same masonry zone;
- service penetration has been placed inside both exclusion zones.

Each object may be individually supported.

The assembly is invalid.

This is a central compiler capability.

## 15. S0 composition result

The baseline S0 source can be represented coherently as one composed wall-bay model.

The current result is:

### Geometry graph

Coherent.

### Structural graph

Coherent topologically, adequacy unresolved.

### Air-boundary graph

Coherent semantically.

### Thermal graph

Coherent semantically, performance unresolved.

### Weather/moisture graph

Coherent at route level, site/detail evidence unresolved.

### Fire graph

Applicability/route partly resolved, product evidence unresolved.

### Maintenance graph

Coherent baseline.

### Evidence graph

Coherent with due-now gaps and future planned evidence.

**Composition research result: PASS.**

## 16. Alarm test

Does the composition require manual duplicate reconciliation?

At the conceptual level:

**NO, if graph contributions precede canonical obligation derivation.**

**YES, if bundles independently emit final checklists.**

Therefore the project should change course slightly:

> **Treat bundles as semantic/graph expansion mechanisms first; treat obligations as derived over the composed building state.**

This is a refinement of the compiler architecture, not a retreat from it.

## 17. Implication for implementation — deliberately deferred

No data model is selected.

But any future implementation should be hostile to this anti-pattern:

~~~text
window.rules[]
floor.rules[]
wall.rules[]
service.rules[]
then manually dedupe strings
~~~

The conceptual architecture instead requires:

- canonical entity identity;
- shared graphs;
- declarative contributions;
- deterministic applicability;
- canonical obligation identity;
- dependency graph.

The eventual technology can be chosen later.

## 18. Implication for authoring

This reinforces the original Sims-like ambition.

The author can manipulate:

- room;
- wall;
- window;
- floor;
- service point.

The system responds to their **composition**.

The author should not be forced to understand why seventeen downstream rule nodes changed unless they ask.

## 19. Implication for standard library

A future standard library may contain:

### Semantic interface families

- WindowInMasonryCavityWall
- FloorToMasonryWall
- ServiceThroughEnvelope

### Physical implementation families

- wall assemblies;
- lintel families;
- window interface families;
- hanger families.

### Proof/evidence families

- thermal calculation methods;
- product envelopes;
- tested fire details;
- inspection plans.

The compiler combines them.

This is much more precise than calling every reusable thing a “pattern”.

## 20. Next research test

Do not create more abstraction layers immediately.

The next useful work is to **red-team this composed S0 bay**:

1. identify obligations Run 01 missed;
2. test conflicting-but-individually-valid child conditions;
3. test one product substitution;
4. test one target-context change;
5. verify one shared evidence item can support multiple child conditions without duplicated truth;
6. compare the resulting model against how an architect/engineer would review the same junction manually.

Only after that should S0 Run 02 be considered.

---

## Related documents

- [S0 Frozen Source Package](s0-source-package.md)
- [S0 Paper Compilation Run 01](s0-paper-compile-run-01.md)
- [Interface Obligation Bundles](interface-obligation-bundles.md)
- [Formal Architectural Model](formal-architectural-model.md)
- [Boundary Semantics](boundary-semantics.md)
- [Structural Semantics](structural-semantics.md)
- [Evidence and Provenance Architecture](evidence-and-provenance.md)
