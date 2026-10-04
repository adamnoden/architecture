# Domain S1 — Frozen Room-Scale Source Package v0.1

**Source ID:** S1-SOURCE-01  
**Target:** T-ENG-NDW-2026-10-03-S1-01  
**Status:** frozen paper-compilation input  
**Date:** 2026-10-04  
**Implementation:** none  
**Important:** values below are either inherited project hypotheses or explicit **TEST ASSUMPTIONS**. They are not construction instructions.

> **S1 is intentionally complete enough to create cross-system consequences, but incomplete enough that the compiler must still know when to ask for external evidence.**

## 1. Room identity

~~~text
ROOM R01
role: PRINCIPAL_HABITABLE_ROOM
use: LIVING
storey: ENTRANCE_STOREY / GROUND
hierarchy: H1 project role
grammar authority: PROJECT_ORDER_ONLY
target accessibility profile: M4(1) Category 1
~~~

The room belongs to a hypothetical detached two-storey dwelling.

## 2. Coordinate system

Plan coordinates use:

- origin at internal south-west room corner;
- +X east;
- +Y north;
- Z upward from finished floor level.

## 3. Room geometry — TEST ASSUMPTION

Clear room dimensions:

- east-west: **5400 mm**;
- south-north: **4200 mm**;
- finished clear height: **3000 mm**.

Derived:

- floor area: **22.68 m²**;
- room volume: **68.04 m³**;
- width:length relation: **5400:4200 = 1.286:1**.

No named historical proportion family is assigned.

## 4. Room boundaries

### SOUTH — external wall W-SOUTH-01

Length: 5400 mm.

Use wall family:

**W-S0-01 / masonry cavity wall**

and boundary family:

**BF-WIN-MCW-01** at its window opening.

Orientation:

**SOUTH — TEST ASSUMPTION**

### EAST — external wall W-EAST-01

Length: 4200 mm.

Same wall family.

Orientation:

**EAST — TEST ASSUMPTION**

### NORTH — internal loadbearing wall W-NORTH-01

Length: 5400 mm.

Roles:

- room boundary;
- support line for upper floor;
- contains internal door D01;
- separates room from hall/circulation.

Exact wall build-up/product:

**UNSELECTED**

Structural adequacy:

**EXTERNAL under SAB-H1-01**

### WEST — internal partition W-WEST-01

Length: 4200 mm.

Roles:

- room boundary;
- service-entry side;
- radiator/emitter wall.

Structural role:

**NON_LOADBEARING — TEST ASSUMPTION**

## 5. External corner C-SE-01

The south and east masonry cavity walls meet at the south-east corner.

The corner must compose:

- outer masonry;
- drained cavity;
- insulation;
- inner masonry;
- primary air-control layer.

No separate “corner detail” is authored as a checklist.

The corner exists because the two wall occurrences meet.

Current supported-family state:

**CORNER BOUNDARY FAMILY NOT YET FORMALISED**

S1 will test whether this appears as one grouped unresolved assembly issue rather than many duplicated boundary warnings.

## 6. Primary window WIN-S-01

Host:

W-SOUTH-01.

Opening geometry:

- width: **1500 mm**;
- height: **1800 mm**;
- sill: **750 mm AFFL**;
- head: **2550 mm AFFL**.

Plan position:

- centred on south wall;
- centreline X = **2700 mm**.

Roles:

- PRIMARY room opening;
- ordinary openable window;
- candidate purge-ventilation contributor;
- ground-floor/easily accessible security-critical opening;
- low-level glazing safety applicability.

Operational test state:

- hinged/casement type;
- opening angle: **>=30° — TEST ASSUMPTION**;
- effective openable area: **0.90 m² — TEST ASSUMPTION**.

Product:

**UNSELECTED**

## 7. Secondary window WIN-E-01

Host:

W-EAST-01.

Opening geometry:

- width along wall: **1200 mm**;
- height: **1500 mm**;
- sill: **900 mm AFFL**;
- head: **2400 mm AFFL**.

Plan position:

- centred on east wall;
- centreline Y = **2100 mm**.

Roles:

- SECONDARY room opening;
- ordinary openable window;
- candidate purge-ventilation contributor;
- ground-floor/easily accessible security-critical opening.

Operational test state:

- hinged/casement type;
- opening angle: **>=30° — TEST ASSUMPTION**;
- effective openable area: **0.60 m² — TEST ASSUMPTION**.

Product:

**same provisional family decision as WIN-S-01; exact product UNSELECTED**

## 8. Window-derived baseline geometry

Nominal gross glazing/opening areas:

- WIN-S-01: 1.5 × 1.8 = **2.70 m²**;
- WIN-E-01: 1.2 × 1.5 = **1.80 m²**;
- total nominal opening area: **4.50 m²**.

Effective purge opening area:

- 0.90 + 0.60 = **1.50 m²**.

Part-F tested >=30° route requirement:

- 22.68 / 20 = **1.134 m²**.

Therefore, against the frozen operational assumptions:

**PURGE OPENING AREA ROUTE = PASS GEOMETRICALLY**

This is not a whole-dwelling ventilation pass.

## 9. Corner clearances

South-window east edge:

- centre 2700 + 750 = 3450 mm;
- clear masonry to south-east corner = **1950 mm**.

East-window south edge:

- centre 2100 − 600 = 1500 mm;
- clear masonry to south-east corner = **1500 mm**.

These source values give a deliberately generous baseline corner condition.

They are not engineering proof.

## 10. Internal door D01

Host:

W-NORTH-01.

Position:

- centreline X = **2700 mm**;
- aligned with WIN-S-01 centreline.

Clear opening:

- **800 mm — TEST ASSUMPTION**.

Height:

- **1980 mm clear — TEST ASSUMPTION**.

Approach:

- head-on from HALL-H01;
- passageway clear width: **900 mm — TEST ASSUMPTION**.

Floor:

- level/step-free through doorway.

Door undercut:

- **10 mm above finished floor — TEST ASSUMPTION**.

Roles:

- primary room entry;
- entrance-storey accessible route;
- Part-F transfer-air contributor;
- whole-house escape-topology contributor;
- architectural arrival element.

Fire-door role:

**UNRESOLVED / whole-house strategy dependent**

## 11. Hall approach patch HALL-H01

Only the local patch necessary to evaluate doorway/circulation is represented.

Dimensions:

- clear approach width: **900 mm**;
- represented depth north of door: **1200 mm**.

No local obstruction in baseline.

The hall as a full space is outside S1.

## 12. Architectural-order profile — project authority only

### ORDER-S1-01 — primary arrival axis

~~~text
D01 centreline X=2700
       =
WIN-S-01 centreline X=2700
~~~

Status:

**REQUIRED BY PROJECT-ORDER PROFILE**

Not G-01.

### ORDER-S1-02 — opening hierarchy

- WIN-S-01 = PRIMARY;
- WIN-E-01 = SECONDARY.

The primary opening is larger in nominal area.

This is source intent, not a Georgian rule.

### ORDER-S1-03 — room hierarchy

R01 is marked as a principal habitable room.

No statutory meaning is attached to that architectural rank.

## 13. Ground-floor plane GF01

S1 needs a finished floor datum for:

- room area;
- accessibility;
- control heights;
- window sill heights;
- furniture/service geometry.

Physical floor/substructure family:

**GROUND_FLOOR_ASSEMBLY UNSELECTED**

The compiler may represent:

- finished floor plane;
- floor area;
- perimeter boundary interface.

It may not claim:

- ground-bearing structural adequacy;
- DPM/radon/ground-moisture performance;
- floor U-value;
- foundation adequacy.

Those remain external/unresolved in S1.

## 14. Upper floor / ceiling UF01

Above R01:

- engineered timber I-joist family;
- nominal joist depth: **240 mm — inherited S0 research assumption**;
- nominal centres: **400 mm**;
- nominal span: **4200 mm** south-to-north;
- south support: external masonry wall;
- north support: internal loadbearing wall W-NORTH-01;
- structural deck above;
- conventional ceiling finish below.

Member/connection adequacy:

**EXTERNAL under SAB-H1-01**

Ceiling finish/product/fire classification:

**UNSELECTED**

The floor is within one dwelling and is not automatically treated as a separating floor.

## 15. North-wall door structural interruption

Because W-NORTH-01 is loadbearing and contains D01:

- the door creates a structural head/support obligation;
- local upper-floor reactions must be resolved around/over the opening.

No header/lintel product is authored.

**EXTERNAL STRUCTURAL EVIDENCE REQUIRED**

This is intentionally different from the external masonry-window head condition.

## 16. Room service branch SR-R01

Purpose:

- low-level electrical/data distribution;
- simple hydronic heating emitter branch;
- avoid arbitrary chasing of external permanent masonry.

### Source

Service source/hall spine:

**SR-HALL-01 — external to S1**

### Entry

Service branch enters through the non-loadbearing west internal partition at a controlled low-level crossing.

### Route

Conceptually:

~~~text
SR-HALL-01
   →
controlled internal-partition crossing
   →
room-side accessible low-level route
   ├── electrical/data outlets
   └── hydronic emitter H-01
~~~

Physical raceway/skirting enclosure:

**UNSELECTED**

The semantic route is intentional.

The construction family is not yet promoted.

## 17. Electrical/data points

Four representative outlet/control locations.

Baseline centreline height:

**600 mm AFFL — TEST ASSUMPTION**

This is intended to exercise the Category-1 Part-M service-control band.

Electrical circuit design:

**EXTERNAL / Part P competent design**

The compiler owns:

- semantic positions;
- accessibility contribution;
- route dependency.

It does not size circuits here.

## 18. Heating emitter H-01

Type:

**ordinary hydronic radiator / emitter family — exact product UNSELECTED**

Location:

- west internal wall;
- nominal width: **1000 mm — TEST ASSUMPTION**;
- depth: **120 mm — TEST ASSUMPTION**;
- positioned away from D01/hall approach in baseline.

Service semantics:

- accessible isolation;
- replaceable emitter;
- accessible room-side pipe route;
- no external-wall chasing.

Hydraulic sizing:

**EXTERNAL / UNRESOLVED**

## 19. Ventilation semantics

R01 is HABITABLE.

### Purge

Candidate route:

WIN-S-01 + WIN-E-01.

Baseline test:

- both >=30°;
- total effective openable area = 1.50 m²;
- required tested route = 1.134 m².

**PASS against frozen assumptions**

### Whole-dwelling/background ventilation

System family:

**UNSELECTED**

This remains a higher-scale obligation.

### Transfer air

D01 undercut:

10 mm.

**PASS against frozen pre-2027 Part-F transfer-air route assumption**

## 20. Security semantics

Both windows:

- ground floor;
- easily accessible.

Therefore Part-Q applicability:

**ACTIVE**

Product/security evidence:

**UNRESOLVED**

The two occurrences may share one future product-family evidence set if scope permits.

## 21. Glazing/fall semantics

### WIN-S-01

Sill 750 mm.

Critical-glazing applicability:

**ACTIVE**

Safety-glazing evidence:

**UNRESOLVED**

Exterior ground/fall difference:

**<=150 mm — TEST ASSUMPTION**

Opening-window fall-guarding condition:

**NOT ACTIVATED by this frozen ground-level context**

### WIN-E-01

Sill 900 mm.

Low-sill critical-glazing trigger:

**NOT ACTIVATED by sill height**

Other product/safety obligations remain as applicable.

## 22. Quantities — baseline

Room:

- floor area: **22.68 m²**;
- ceiling area: **22.68 m²**;
- volume: **68.04 m³**.

External walls:

- south gross: 5.4 × 3.0 = **16.20 m²**;
- east gross: 4.2 × 3.0 = **12.60 m²**;
- total gross external-wall area: **28.80 m²**;
- total openings: **4.50 m²**;
- net opaque external-wall area before reveals/corner adjustments: **24.30 m²**.

Opening area by elevation:

- south: **2.70 m²**;
- east: **1.80 m²**.

These are geometry outputs, not compliance results.

## 23. Boundary graph expectations

S1 should create:

### AIR

One room/enclosure-side graph containing:

- south wall air layer;
- east wall air layer;
- south-window transition;
- east-window transition;
- south-east corner continuity;
- upper-floor edge interactions where relevant;
- ground-floor perimeter interaction where relevant.

### THERMAL

One envelope graph preserving:

- wall fields;
- two window transitions;
- corner;
- ground-floor perimeter;
- upper-floor edge where applicable.

### WEATHER / MOISTURE

Two elevation wall fields plus:

- two openings;
- shared external corner;
- ground/floor base interaction.

### FIRE

Only applicable room/lining/cavity/escape contributions.

No invented compartmentation.

## 24. Structural graph expectations

At minimum:

~~~text
UPPER FLOOR UF01
    ↓
south external wall
    ↓
substructure/foundation [EXTERNAL]

UPPER FLOOR UF01
    ↓
north loadbearing wall
    ↓
door-head transfer around D01
    ↓
substructure/foundation [EXTERNAL]
~~~

East external wall:

- enclosure;
- lateral/stability role to be represented if applicable;
- not assumed to be a gravity support for UF01 in this source.

## 25. Frozen mutation set

### S1-M01 — architectural-axis drift

Move D01 centreline:

2700 → 3000 mm.

### S1-M02 — purge restrictor

Change both window opening angles:

>=30° → 20°.

Keep total effective openable area:

1.50 m².

New tested requirement:

22.68 / 10 = **2.268 m²**.

### S1-M03 — corner squeeze

Move WIN-E-01 centreline:

Y 2100 → 900 mm.

New south edge:

900 − 600 = **300 mm** from south-east corner.

### S1-M04 — remove transfer-air undercut

D01 undercut:

10 → 0 mm.

### S1-M05 — inaccessible controls

Representative outlet/control centrelines:

600 → 300 mm AFFL.

### S1-M06 — hall obstruction

Add 150 mm-deep fixed emitter/fixture into the 900 mm local hall passageway near D01.

Remaining clear width:

**750 mm**.

### S1-M07 — accessibility-category migration

Target:

M4(1) → M4(2).

No source geometry changes.

## 26. Source-level invariants

1. room role remains HABITABLE unless explicitly changed;
2. primary air/thermal/weather boundaries do not depend on decorative finishes;
3. external masonry is not a routine service-routing substrate;
4. D01 and WIN-S-01 alignment is project architectural intent, not regulation;
5. window nominal area and effective openable area are distinct facts;
6. door clear opening and ventilation undercut are distinct facts;
7. shared product family does not erase occurrence-specific target applicability;
8. structural adequacy remains scoped external evidence under SAB-H1-01;
9. unsupported boundary conditions remain visible;
10. no G-01 research observation is promoted implicitly.

## 27. What the author actually authored

The source author selected/declared:

- one room;
- room role;
- four room boundaries;
- two windows and their hierarchy;
- one door and route relation;
- one room axis;
- floor/ceiling conditions;
- one service branch;
- one emitter;
- outlet/control positions;
- target/profile/context assumptions.

The author did **not** manually create:

- purge obligations;
- security obligations;
- critical-glazing obligations;
- Part-M door checks;
- transfer-air checks;
- corner continuity checks;
- structural head obligations;
- B4 elevation contributions;
- Part-O contributions;
- evidence invalidation rules.

Those are compiler consequences.
