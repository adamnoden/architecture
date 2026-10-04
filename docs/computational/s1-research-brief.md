# S1 Research Brief — Complete Room-Scale Compilation

**Status:** integration-fixture specification v0.1  
**Purpose:** move the paper compiler one architectural scale above S0 and test whether complexity remains contained when a complete habitable room composes multiple interfaces, regulatory roles, service routes and architectural-order relationships.  
**Implementation:** none.

> **S0 asked whether a junction can compile. S1 asks whether a room can remain intelligible when several valid junctions begin interacting.**

## 1. Why S1 exists

S0 Run 02 provisionally passed the first complexity-scaling test:

- repeated occurrences reused knowledge;
- shared issues grouped by action;
- local mutations remained local;
- higher-scale aggregates were derived automatically.

That result is encouraging but not sufficient.

A room introduces qualitatively new phenomena:

- **enclosure composition** rather than one wall;
- an **external corner** joining two boundary graphs;
- multiple windows with different orientations and roles;
- an internal door joining circulation, ventilation and fire topology;
- a room-level ventilation obligation;
- a service route crossing several architectural zones;
- a complete occupied volume;
- architectural ordering at room scale;
- accessibility requirements tied to circulation and controls;
- upper-floor structural support over an occupied room;
- floor/ceiling surfaces that are not merely wall attachments.

The central risk remains:

> more complete internal reasoning could turn into more authoring bureaucracy.

S1 exists to try to make that happen.

## 2. Core research questions

### Q1 — Does the room become a meaningful semantic unit?

Can the system derive obligations from:

- room role;
- floor area;
- entrance-storey status;
- adjacency;
- openings;
- circulation;

rather than treating the room as a geometric polygon?

### Q2 — Do boundaries compose through a corner?

Can two supported external-wall families meet at one corner and contribute to:

- one air enclosure;
- one thermal enclosure;
- coherent weather/moisture behavior;

without manually re-authoring each boundary?

### Q3 — Can repeated components remain non-identical?

Two windows may share one product/family while differing in:

- sill height;
- orientation;
- elevation;
- architectural rank;
- safety-glazing applicability;
- maintenance context.

Can shared evidence remain shared without flattening occurrence-specific obligations?

### Q4 — Can one door carry several meanings?

The same internal door participates in:

- room access;
- Part M circulation;
- Part F air transfer;
- whole-house escape topology;
- architectural arrival sequence.

Can those roles coexist without one generic “door compliance” flag?

### Q5 — Can room-level regulation emerge at the correct scale?

Examples:

- purge ventilation belongs to the habitable room;
- B4 belongs at elevation/site scale;
- Part O remains whole dwelling;
- Part M access arises from route → doorway → room;
- Q security arises from exterior accessibility of openings.

### Q6 — Can services remain topological rather than opportunistic?

Can a simple room service branch identify:

- source;
- route;
- ports;
- isolation;
- access;
- forbidden permanent-fabric chasing;

without turning S1 into an MEP design suite?

### Q7 — Can architectural order enter without pretending G-01 is finished?

Can S1 carry:

- a declared room hierarchy;
- a primary room axis;
- a primary versus secondary opening;
- a door/window relation;

as **project architectural intent** while leaving G-01 rule authority explicitly unpromoted?

### Q8 — Does the author-facing complexity remain bounded?

Can the baseline room compile to a small set of meaningful resolution actions even though the internal obligation graph is materially larger than S0?

## 3. Fixture type

S1 uses one:

**ground-floor principal living room on the entrance storey of a detached two-storey dwelling**

Why this room?

It activates, in one bounded space:

- Category-1 accessibility;
- ground-floor window security;
- habitable-room ventilation;
- low-level glazing safety;
- whole-elevation contributions;
- upper-floor structure;
- service controls;
- architectural arrival/order.

It avoids:

- wet-room drainage;
- roof construction;
- stairs;
- basement/foundation design as a native proof problem;
- party-wall complexity.

## 4. Physical extent

S1 includes:

- one complete room volume;
- two adjacent external masonry cavity walls;
- their external corner;
- two windows, one per external wall;
- two internal walls;
- one internal doorway plus a small approach patch in the hall;
- finished ground-floor plane;
- upper-floor / ceiling condition;
- one low-level electrical/data route;
- one simple hydronic emitter branch;
- maintenance and replacement volumes;
- one declared architectural-order axis.

It does not include the whole dwelling.

## 5. Target

Use:

[S1 Compiler Target Snapshot v0.1](s1-target-snapshot-v01.md)

Key new target addition over S0:

- Approved Document M, Volume 1;
- M4(1) Category 1 frozen as the research profile;
- internal-door circulation and service-control obligations.

## 6. Technical-domain posture

### Native / semantic

- room identity/role;
- geometry;
- wall/opening/door occurrences;
- boundary graph topology;
- structural topology;
- service topology;
- maintenance volumes;
- target applicability;
- architectural-intent relationships;
- quantities;
- evidence dependencies;
- invalidation.

### External proof

Under SAB-H1-01:

- upper-floor member/connection adequacy;
- window/door head support;
- local masonry adequacy;
- ground/foundation/substructure adequacy.

### Supported-family candidate

- BF-WIN-MCW-01 for each window/wall condition.

### Explicitly unresolved family

- ground-floor wall/slab perimeter boundary family;
- exact hydronic/electrical product design.

These gaps must appear as grouped unresolved issues, not silently vanish.

## 7. Architectural-order probe

S1 does **not** claim G-01 conformance.

It declares project intent:

### ORDER-S1-01 — principal arrival axis

Internal door centreline aligns with primary south-window centreline.

### ORDER-S1-02 — opening hierarchy

South window is designated PRIMARY.

East window is designated SECONDARY.

Their dimensions deliberately differ.

### ORDER-S1-03 — room dimensional state

Room proportions and height are recorded as source geometry.

No named historical ratio is assigned.

This is intentionally compatible with the current G-01 finding:

> proportion is one variable inside hierarchy/topology/section, not the generator of the room.

### Mutation purpose

A later door/window-axis mutation should fail or warn only against the **project-order profile**, unless another technical obligation is also affected.

That preserves authority separation.

## 8. New composition tests

### External corner

The south/east wall meeting should create one corner condition automatically.

Required questions include:

- air-layer continuity;
- insulation continuity;
- cavity/weather continuity;
- masonry/structural corner relation;
- workmanship/inspection.

Do not manually author “check corner”.

### Door / room / hall

The door should be evaluated from the composed route:

~~~text
HALL APPROACH
    →
DOOR
    →
HABITABLE ROOM
~~~

### Door / ventilation

The same door contributes an air-transfer condition through its undercut.

### Windows / purge

The room's purge requirement should be derived from:

- room area;
- selected window operational states.

The windows do not each own independent “purge compliance”.

### Windows / elevation

Each window contributes to its own elevation identity and whole-house overheating/fire-spread models.

## 9. Complexity gate — S1 extension

S1 inherits S0's eight complexity principles.

Additional room-scale tests:

### S1-CG-01 — room obligations derive from room role

The user should not create a purge-ventilation check manually.

### S1-CG-02 — multi-role objects do not become multi-form authoring

One door remains one authoring object despite several analytical roles.

### S1-CG-03 — repeated family, distinct applicability

Shared window-family evidence may cover both occurrences, while low-sill safety glazing may apply to only one.

### S1-CG-04 — corner is emergent

Adding the second external wall should create corner obligations from composition, not from another hand-authored checklist.

### S1-CG-05 — architectural intent remains lightweight

Declaring a primary axis/opening hierarchy should not require formal G-01 rule authoring.

### S1-CG-06 — default action surface remains decision-shaped

Internal obligation count may grow substantially.

Default unresolved items should still group around decisions such as:

- choose/evidence window family;
- resolve ground-floor perimeter family;
- supply structural package;
- resolve whole-house fire/ventilation context.

## 10. Deliberate mutations

### S1-M01 — architectural-axis drift

Move the internal door 300 mm off the primary window axis.

Expected:

- ORDER-S1-01 deviation;
- Part M may remain passed if circulation geometry still works;
- structure may become stale if the door is in a loadbearing wall;
- no false regulatory “symmetry” failure.

### S1-M02 — purge restrictor

Reduce both window opening angles from >=30° to 20° without increasing effective openable area.

Expected:

- Part-F purge route fails;
- masonry openings remain unchanged;
- Part-Q/security and structure may remain current.

### S1-M03 — corner squeeze

Move the secondary east window toward the south-east corner until only 300 mm of masonry remains between opening and corner.

Expected:

- boundary/structural applicability re-evaluates;
- current family may return UNSUPPORTED rather than inventing a detail;
- primary south-window evidence should remain current where independent.

### S1-M04 — remove transfer-air undercut

Door undercut 10 mm → 0 mm.

Expected:

- Part-F transfer-air contribution fails/stales;
- Part-M clear-opening result remains current.

### S1-M05 — inaccessible controls

Move selected socket/control centrelines 600 mm → 300 mm AFFL.

Expected:

- Part-M service-control obligation fails;
- electrical circuit topology remains otherwise current.

### S1-M06 — local hall obstruction

Place a radiator/fixture in the entrance-storey approach so the clear corridor/door approach no longer meets the frozen Category-1 route.

Expected:

- Part-M access route fails;
- room geometry and window obligations remain current.

### S1-M07 — accessibility-category migration

Change target from M4(1) to M4(2).

Expected:

- Part-M-dependent evidence becomes stale;
- unrelated physical/regulatory evidence remains current.

## 11. Stop / alarm conditions

Raise an alarm if S1 requires:

- manual authoring of target checks;
- separate duplicated dimensions in architecture/structure/thermal models;
- one user-facing warning per child obligation;
- duplicated family evidence for the two windows;
- a global recompile state where local changes stale unrelated systems;
- inventing G-01 rules merely to make the architectural layer look complete;
- hiding unsupported ground-floor/corner conditions to obtain a green result.

## 12. S1 pass condition

S1 is worth continuing if:

1. room-scale obligations emerge at the correct semantic scale;
2. boundary composition works through a corner;
3. the door's multiple roles remain distinguishable;
4. repeated windows reuse knowledge without losing occurrence-specific applicability;
5. service routing remains legible and maintenance-aware;
6. project architectural intent can coexist with incomplete G-01 research;
7. mutations invalidate selectively;
8. the default issue surface remains much smaller than the internal obligation graph;
9. building release can still fail cleanly.

## 13. Non-goals

S1 will not prove:

- whole-house compliance;
- whole-house fire strategy;
- Part O compliance;
- foundation adequacy;
- arbitrary room planning;
- full G-01 grammar;
- complete MEP design;
- native structural member sizing;
- roof competence;
- software architecture.

If the fixture starts demanding those answers, the correct output is external/unresolved, not scope expansion.

## 14. Expected programme value

S1 should tell us whether the system is becoming:

### A compiler architecture

Where semantics compose and complexity is contained.

or:

### A formalised checklist

Where every new room merely multiplies obligations and exceptions.

That distinction is now more important than adding new conceptual vocabulary.
