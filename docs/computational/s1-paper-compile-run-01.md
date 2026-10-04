# Domain S1 — Paper Compilation Run 01

**Run ID:** S1-RUN-01  
**Source:** [S1 Frozen Room-Scale Source Package](s1-source-package.md)  
**Target:** [T-ENG-NDW-2026-10-03-S1-01](s1-target-snapshot-v01.md)  
**Structural assurance:** [SAB-H1-01](structural-assurance-boundary-h1-v01.md)  
**Window boundary family:** [BF-WIN-MCW-01](boundary-family-window-masonry-v01.md)  
**Complexity basis:** [S0 Complexity Gate](s0-complexity-gate.md) + S1 extensions  
**Date:** 2026-10-04  
**Implementation:** manual paper compilation

## 1. Headline result

### Research compile

**PASS — WITH TWO MODELLING WARNINGS**

S1 successfully composes:

- one complete occupied room;
- two adjacent external walls;
- one external corner;
- two non-identical windows sharing family knowledge;
- an internal loadbearing wall with a door;
- a local hall approach;
- an upper-floor structural condition;
- a ground-floor boundary placeholder;
- a service branch;
- room-level purge ventilation;
- Category-1 access;
- security/safety applicability;
- project architectural order.

The author-facing unresolved state remains decision-shaped rather than rule-shaped.

### Building release

**FAIL — EXPECTED**

Material due-now gaps remain, including:

- external structural engineering evidence;
- ground-floor/substructure/perimeter boundary family;
- external-corner implementation evidence;
- window/security/safety/thermal product evidence;
- wind-driven-rain/relevant-boundary site context;
- whole-house fire strategy;
- whole-dwelling/background ventilation strategy;
- Part-O whole-dwelling assessment;
- product-specific tolerance/installation envelopes;
- service-system engineering.

The room is semantically coherent.

It is not release-ready.

## 2. First new result — obligation scope is first-class

S1 makes an important scaling fact impossible to ignore.

WIN-S-01 participates in all of these:

### Occurrence/interface scope

- opening fits wall;
- frame fixing;
- low-sill critical glazing;
- air/weather/thermal transition;
- replacement interface.

### Room scope

- contributes effective openable area to R01 purge ventilation.

### Elevation scope

- contributes 2.70 m² opening area to the south elevation for B4 analysis.

### Whole-building scope

- contributes orientation/glazing/openability to Part O;
- may contribute to whole-house ventilation and fire strategy.

### Site/target scope

- security applicability;
- relevant-boundary relationship;
- target-version applicability.

These are not five copies of one “window obligation”.

They are propositions evaluated at different semantic scopes.

### Modelling correction

Every obligation/evaluation needs an explicit **scope subject**, for example:

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

The list is conceptual, not a software enum.

This should be promoted into the formal model.

## 3. Second new result — avoid role-bloated object types

S1's door participates in:

- architectural arrival;
- Part-M access;
- Part-F transfer air;
- structural opening;
- whole-house escape topology.

The windows participate in:

- architecture;
- purge;
- security;
- glazing safety;
- envelope;
- overheating;
- B4.

A weak model would turn this into one large Window or Door record full of boolean flags.

That will not scale.

### Better conceptual direction

Keep the physical entity stable.

Attach contextual roles/relationships such as:

~~~text
WIN-S-01
  PARTICIPATES_IN  PURGE_ROUTE-R01
  LOCATED_ON       ELEVATION-SOUTH
  HAS_ARCH_ROLE    PRIMARY_OPENING
  IN_SECURITY_SCOPE Q-SCOPE-GROUND
  CONTRIBUTES_TO  OVERHEATING-MODEL
~~~

This is a **warning**, not a request to design syntax now.

The formal model should prefer typed relationships/context memberships over accumulating flags on nouns.

## 4. Geometry compile

### GEO-S1-01 — room enclosure

Clear room:

5400 × 4200 × 3000 mm.

**PASS**

### GEO-S1-02 — south window fit

South wall:

5400 mm.

WIN-S-01:

1500 mm wide, centred.

Residual wall each side:

1950 mm.

**PASS geometrically**

### GEO-S1-03 — east window fit

East wall:

4200 mm.

WIN-E-01:

1200 mm wide, centred.

Residual wall each side:

1500 mm.

**PASS geometrically**

### GEO-S1-04 — corner clearance

Baseline opening-to-corner masonry fields:

- south opening → SE corner: 1950 mm;
- east opening → SE corner: 1500 mm.

**PASS as source geometry**

No structural claim follows automatically.

### GEO-S1-05 — door/hall route

D01:

- 800 mm clear;
- head-on approach;
- hall clear width 900 mm;
- level route.

**PASS against frozen Category-1 geometry route**

### GEO-S1-06 — service/control geometry

Representative control/outlet centrelines:

600 mm AFFL.

**PASS against frozen M4(1) test route**

## 5. Architectural-order compile

Authority:

**PROJECT ORDER**, not G-01.

### ORD-S1-01 — arrival axis

D01 centreline:

X=2700.

WIN-S-01 centreline:

X=2700.

**PASS**

### ORD-S1-02 — opening hierarchy

- south = PRIMARY;
- east = SECONDARY;
- south opening area > east opening area.

**PASS source intent**

### ORD-S1-03 — room proportion

Recorded only.

**NO G-01 RATIO PASS/FAIL GENERATED**

This is an important restraint.

S1 can carry architectural order before G-01 is mature without laundering project preference into historical/architectural “proof”.

## 6. Part M / accessibility compile

Target profile:

**M4(1) Category 1**.

### ACC-S1-01 — habitable room access

R01 is a habitable room on the entrance storey.

Door/hall geometry is inside the frozen tested route.

**PASS**

### ACC-S1-02 — local obstruction

Baseline HALL-H01 has no close/opposite obstruction.

**PASS**

### ACC-S1-03 — services and controls

600 mm centreline lies inside the frozen Category-1 control band.

**PASS**

### Accessibility result

**ROOM-SCALE CATEGORY-1 TEST: PASS**

This is not a whole-dwelling Part-M pass.

## 7. Ventilation compile

## 7.1 Purge route

Room area:

22.68 m².

Both windows:

- hinged/casement;
- >=30° opening angle;
- effective opening areas 0.90 + 0.60 = 1.50 m².

Tested minimum:

22.68 / 20 = 1.134 m².

~~~text
1.50 >= 1.134
~~~

**PURGE GEOMETRY: PASS**

The compiler derives this from:

- room role/area;
- operational window roles.

No manually authored “purge check” exists.

## 7.2 Transfer air

D01 undercut:

10 mm above finished floor.

**PASS against frozen route**

## 7.3 Whole-dwelling ventilation

System family/background/mechanical strategy:

**UNSELECTED**

R01 contributes as a habitable room.

**WHOLE-DWELLING F: UNRESOLVED**

Correct scope is building/system, not room.

## 8. Window safety / security compile

## 8.1 WIN-S-01

Ground-floor accessible window.

Part Q:

**APPLICABLE / PRODUCT EVIDENCE REQUIRED**

Sill:

750 mm.

Low-level critical glazing:

**APPLICABLE / PRODUCT EVIDENCE REQUIRED**

Fall guarding:

not activated under frozen <=150 mm exterior level difference.

## 8.2 WIN-E-01

Ground-floor accessible window.

Part Q:

**APPLICABLE / PRODUCT EVIDENCE REQUIRED**

Sill:

900 mm.

Low-sill critical-glazing trigger used by this target test:

**NOT APPLICABLE**

### Important result

The two windows may share one product family.

They do **not** share identical obligation applicability.

The evidence model therefore needs:

~~~text
shared family evidence
+
occurrence-specific applicability
~~~

not either/or.

## 9. External-envelope / boundary compile

## 9.1 Window/wall interfaces

Both windows reference BF-WIN-MCW-01.

Family knowledge reused.

**SUPPORTED FAMILY / EVIDENCE INCOMPLETE**

Shared unresolved inputs include:

- exposure;
- window product;
- closer/interface system;
- Uw/junction evidence.

## 9.2 External corner

The south/east wall composition creates C-SE-01.

Semantic boundary requirement:

- air continuity around inner corner;
- insulation continuity;
- drained/weather strategy;
- masonry physical continuity.

**SEMANTIC GRAPH: COHERENT**

Implementation family:

**UNRESOLVED**

The author did not manually create “corner obligations”.

They emerged from composition.

### S1 complexity criterion

**S1-CG-04 EMERGENT CORNER: PASS**

## 9.3 Ground-floor perimeter

The external walls meet an unselected ground-floor/substructure family.

Required contributions include:

- air continuity;
- thermal perimeter;
- moisture/ground strategy.

**UNRESOLVED / EXTERNAL OR FUTURE FAMILY**

This appears as one assembly decision, not three unrelated generic warnings.

## 9.4 Ceiling / upper floor

The floor above is inside conditioned domestic space under the frozen fixture.

It is not part of the external thermal envelope.

Do not create a thermal-roof obligation merely because R01 has a ceiling.

**APPLICABILITY DISCIPLINE: PASS**

## 10. Structural compile

Under SAB-H1-01:

### Native topology

UF01 spans south ↔ north.

South support:

external masonry wall.

North support:

loadbearing wall W-NORTH-01.

D01 interrupts the north support line and therefore creates a head/transfer obligation.

WIN-S-01 creates an external-wall head obligation.

WIN-E-01 does not carry the selected UF01 gravity bearing line, though east-wall stability/lateral roles remain whole-building structural context.

**STRUCTURAL TOPOLOGY: PASS**

### Adequacy

No engineer evidence supplied for:

- I-joist/member design;
- hangers/bearings;
- D01 head transfer;
- window heads;
- masonry;
- stability;
- ground/foundations.

**STRUCTURAL ADEQUACY: EXTERNAL EVIDENCE REQUIRED**

### Useful result

One structural evidence package may potentially cover repeated/related standard conditions.

But D01 and external window heads are not automatically the same evidence proposition.

## 11. Service-network compile

SR-R01 has:

- source relationship;
- controlled internal-partition entry;
- room-side route;
- electrical/data ports;
- hydronic emitter;
- accessible isolation concept.

### Topology

**PASS**

### Permanent-fabric doctrine

No routine external masonry chase.

**PASS**

### Electrical

Circuit design/testing:

**EXTERNAL**

### Hydronic

Pipe sizing/emitter output/system balancing:

**EXTERNAL / UNRESOLVED**

### Route construction family

Raceway/skirting/enclosure:

**UNSELECTED**

### Maintenance

Emitter marked replaceable and isolation-accessible in source intent.

Detailed working/withdrawal geometry:

**UNRESOLVED**

### Service result

**SEMANTIC ROUTE COHERENT / TECHNICAL FAMILY UNRESOLVED**

This is sufficient for S1.

## 12. Fire compile

Current local facts:

- habitable room;
- internal door to hall;
- two external windows;
- same dwelling;
- upper floor above.

Whole-house fire strategy absent.

Therefore S1 can contribute:

- room/opening/door topology;
- lining/product obligations;
- cavity/opening fire contributions.

It cannot decide:

- whether D01 is a fire door;
- whether either window is an escape window;
- protected-route strategy.

**FIRE: CONTRIBUTION PRESENT / APPLICABILITY PARTLY UNRESOLVED**

No fake fire-door rule generated.

## 13. Elevation / whole-house contributions

### B4 external fire spread

Preserve by elevation:

- SOUTH opening contribution: 2.70 m²;
- EAST opening contribution: 1.80 m².

Relevant-boundary context:

**UNKNOWN separately by elevation**

Therefore:

**B4: UNRESOLVED AT ELEVATION/SITE SCOPE**

### Part O

Contributions include:

- south glazing;
- east glazing;
- window operational/openable facts;
- room identity.

Whole-dwelling assessment:

**UNRESOLVED / OUTSIDE S1**

Again, no local “Part O pass”.

## 14. Workmanship / Regulation 7 compile

The S0-A process model applies.

Critical S1 interfaces include:

- two window openings;
- external corner;
- ground-floor perimeter;
- D01 structural opening;
- upper-floor support;
- service route/controls.

### Process semantics

**PASS**

### Product/numeric envelopes

**UNRESOLVED**

### Construction evidence

**PLANNED / FUTURE**

The conventional room is not auto-passed because its materials are familiar.

## 15. Default author-facing issue surface

The internal graph is materially larger than S0.

The ordinary author should nevertheless see approximately these resolution actions.

### 1. Site/envelope context required

Resolve:

- wind-driven-rain exposure;
- south/east relevant-boundary context;
- whole-house overheating inputs later.

### 2. Select/evidence the window family — 2 occurrences

Covers shared product decisions such as:

- thermal performance;
- security performance;
- frame/fixing family;
- weather/air interface;
- safety-glazing capability where occurrence requires it.

Occurrence note:

- WIN-S-01 has low-level safety-glazing applicability;
- WIN-E-01 does not under the same trigger.

### 3. Resolve corner + ground-floor perimeter envelope families

One building-envelope action group:

- external corner;
- wall/floor perimeter;
- moisture/thermal/air implementation evidence.

### 4. Structural engineering package required

Scope includes:

- UF01;
- south/north supports;
- D01 head;
- window heads;
- wall/stability/foundation dependencies.

Evidence scope may later be split intelligently.

### 5. Whole-dwelling fire / ventilation strategy required

S1 already passes its tested purge geometry.

Higher-scale decisions remain:

- background/mechanical ventilation family;
- fire/escape topology;
- door/window fire/egress roles.

### 6. Service implementation/evidence required

- electrical competent design;
- hydronic design;
- accessible low-level route construction family;
- isolation/maintenance details.

### 7. Product-specific tolerance / construction evidence

Critical interfaces have process semantics but not final numeric envelopes/products.

### Baseline accessibility

No user action.

Category-1 room route and control positions pass the frozen test.

### Baseline architectural order

No user action.

Project-axis/opening hierarchy pass.

## 16. Complexity-gate result

S1 has substantially more internal semantics than S0 Run 02.

Default unresolved action groups:

approximately **7**, with several representing genuinely new design decisions.

The count alone is not the criterion.

The important result is:

- repeated window knowledge remains shared;
- occurrence-specific applicability remains visible;
- room/elevation/building obligations occur once at their proper scope;
- no target check is manually authored;
- project architectural order remains separate;
- unsupported assemblies group by decisions.

### Complexity verdict

**PROVISIONAL PASS AT ROOM SCALE**

The authoring burden has increased because the room contains genuinely more design/system decisions.

It has **not** increased in proportion to internal obligation count.

## 17. Mutation S1-M01 — architectural-axis drift

Move D01 centreline:

2700 → 3000 mm.

Assume hall approach shifts with the door and remains head-on/900 mm clear for this mutation.

### Project order

ORDER-S1-01:

**FAIL / DEVIATION**

### Part M

Door/hall clear geometry remains within frozen route.

**PASS**

### Structure

Door head/support geometry changes.

**EXTERNAL STRUCTURAL EVIDENCE: STALE / RE-EVALUATE**

### Other systems

Windows, purge, Q, glazing safety, wall quantities:

**UNCHANGED**

### Result

This is a clean authority-separation example.

A room can fail architectural intent while remaining regulatory-accessible.

## 18. Mutation S1-M02 — purge restrictor

Change both windows:

>=30° → 20° opening angle.

Effective openable area stays:

1.50 m².

New tested minimum:

2.268 m².

~~~text
1.50 < 2.268
~~~

**PURGE ROUTE: FAIL**

Remain current:

- masonry openings;
- B4 nominal opening areas;
- project axes;
- structural head geometry.

Re-evaluate:

- operational product/hardware evidence;
- Part O operational contribution.

This is a strong example of operational semantics changing validity without geometric-envelope change.

## 19. Mutation S1-M03 — corner squeeze

Move WIN-E-01 centreline:

Y 2100 → 900 mm.

South edge of opening:

300 mm from corner.

### Geometry

Opening still fits the wall.

**GEOMETRIC FIT: PASS**

### Current boundary family

BF-WIN-MCW-01 does not presently contain a verified window-near-external-corner implementation envelope.

External corner family itself is unresolved.

**SUPPORTED-DOMAIN RESULT: UNSUPPORTED / EXTERNAL DESIGN REQUIRED**

### Structure

Local corner pier/head/wall evidence:

**STALE / EXTERNAL**

### Purge

Effective opening area unchanged.

**REMAINS CURRENT**

### Security

Same accessible-window role.

**REMAINS APPLICABLE**

### Result

This is exactly why:

> drawable ≠ supported ≠ failed.

## 20. Mutation S1-M04 — remove transfer-air undercut

D01 undercut:

10 → 0 mm.

### Part M

Clear opening width/hall approach:

**UNCHANGED / PASS**

### Part F transfer route

Frozen route no longer satisfied.

**FAIL / ALTERNATIVE AIR-TRANSFER ROUTE REQUIRED**

### Architecture

Door centre/axis:

**UNCHANGED**

One physical change affects one semantic role without poisoning unrelated roles.

## 21. Mutation S1-M05 — inaccessible controls

Control/socket centreline:

600 → 300 mm AFFL.

### Part M

Category-1 services/control route:

**FAIL**

### Part P

Electrical circuit topology/safety is not automatically invalid merely because the controls became inaccessible.

**EXTERNAL ELECTRICAL DESIGN REMAINS CURRENT subject to its own dependencies**

### Service topology

Routes/ports remain connected.

**PASS**

Again:

**accessibility authority ≠ electrical authority**.

## 22. Mutation S1-M06 — hall obstruction

Add a fixed 150 mm-deep obstruction near D01 in the 900 mm local approach.

Remaining clear width:

750 mm.

The frozen Category-1 route requires the larger clear passageway in this head-on doorway configuration and the obstruction is close to the doorway.

**PART M ACCESS ROUTE: FAIL**

Unaffected:

- purge;
- window security;
- structural window heads;
- room axis;
- service controls elsewhere.

The issue surface gains one local action:

> **Clear the D01 entrance approach.**

It does not explode into several Part-M messages by default.

## 23. Mutation S1-M07 — accessibility-category migration

Target profile:

M4(1) → M4(2).

Source geometry unchanged.

### Target consequence

Part-M-dependent evidence/status becomes:

**STALE / RE-EVALUATE**

because M4(2) contains a different/higher set of circulation, doorway, room and control requirements.

### Remain current

Unless independently affected:

- room physical geometry;
- structure;
- weather;
- window Uw evidence;
- service network topology;
- project architectural axis.

This is target migration without source mutation.

## 24. S1 acceptance audit

### Room as semantic unit

**PASS**

Purge/access obligations derive from role and relationships.

### Corner composition

**PASS semantically / implementation family unresolved**

### Repeated but non-identical windows

**PASS**

Shared family + occurrence applicability coexist.

### Multi-role door

**PASS with modelling warning**

Roles remain separable.

### Correct obligation scale

**PASS with formal-model refinement required**

Room/elevation/building/site scopes are now explicit research requirements.

### Services

**PASS semantically**

Technical family remains unresolved.

### Architectural intent before G-01 maturity

**PASS**

Project-order authority works without fake G-01 claims.

### Selective invalidation

**PASS across seven mutations**

### Complexity containment

**PROVISIONAL PASS**

### Release-grade compile

**FAIL — correct**

## 25. Alarm 01 — role-bloat risk

The compiler is now at real risk of creating enormous object schemas.

If Window, Door, Room and Wall accumulate a boolean/property for every regulatory and architectural role, the semantic model will become brittle and unreadable.

Required course discipline:

> **prefer stable entities plus typed contextual relationships/roles over god-objects full of flags.**

Do not implement a role system yet.

Promote the principle into the formal model.

## 26. Alarm 02 — scope confusion risk

The same object contributes to obligations evaluated at several scales.

If every local object independently tries to “own compliance”:

- windows will own purge;
- windows will own B4;
- windows will own Part O;
- doors will own Part M;
- doors will own fire strategy.

That is wrong.

Required discipline:

> **obligations belong to the semantic subject whose proposition is being evaluated; lower-level entities contribute facts.**

Examples:

- purge → ROOM;
- B4 → ELEVATION/SITE relation;
- overheating → BUILDING;
- accessible route → ROUTE / ROOM relationship;
- window safety glazing → WINDOW occurrence.

This is now a first-class formal-model requirement.

## 27. Alarm 03 — unresolved-family gravity

S1 can remain conceptually coherent while several implementation families are unresolved:

- corner;
- ground-floor perimeter;
- services.

That is acceptable in research.

It becomes dangerous if H1 accumulates so many EXTERNAL/UNRESOLVED families that the compiler is mostly a dependency tracker.

### Course trigger

Before Gate B is considered passed, H1 needs enough native/supported assembly families that:

- ordinary houses do not spend most of their life in EXTERNAL/UNRESOLVED;
- the compiler supplies meaningful resolution, not merely issue bookkeeping.

This risk is now more visible than after S0.

## 28. What S1 changes in the programme

### Proven enough to retain

- composition before obligation derivation;
- action-grouped issue surface;
- shared evidence with occurrence applicability;
- structural topology + external adequacy boundary;
- room as semantic object;
- target migration/invalidation;
- project architectural-order profile independent of G-01.

### Promote to formal model

1. **obligation/evaluation scope is explicit**;
2. **contextual roles should be relationships, not entity-flag accumulation**.

### Still open

- service semantic model;
- external-corner family;
- ground-floor perimeter family;
- external expert red-team;
- G-01 candidate constraints;
- roof family;
- H1 family sufficiency.

## 29. Next computational milestone

Do **not** immediately jump to the whole house.

S1 has passed at room scale but exposed unresolved-family gravity.

The next move should be two-pronged:

### Harden the missing ordinary families

At minimum:

- external masonry corner;
- ground-floor/wall perimeter;
- basic room service-route family.

### Advance architectural grammar just enough

Take G-01 through the minimum D4–D7 work required to produce a **small candidate constraint set** suitable for one room/elevation relation.

Then create:

> **S2 — a small connected room cluster**, not a whole dwelling.

Candidate:

- principal room;
- hall;
- secondary room;
- stair/circulation edge;
- shared façade/order relationships.

That is where topology, sequence and hierarchy—not just room internals—will begin to challenge the compiler.

Do not start S2 until the three missing ordinary-family gaps above are less hand-wavy.

## 30. Overall verdict

S1 strengthens the computational proposition.

The most important result is not that the room “passes”.

It is that several new domains became active while the system could still say, in a human-sized way:

> here are the few decisions you actually need to resolve.

That is precisely the behavior required if a house compiler is to contain complexity rather than display it.
