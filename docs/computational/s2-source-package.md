# Domain S2 — Frozen Connected-Cluster Source Package v0.1

**Source ID:** S2-SOURCE-01  
**Status:** frozen paper-compilation input  
**Date:** 2026-10-04  
**Target basis:** H1 current target + services extension + FIRE-H1-2S-EGRESS-01 candidate  
**Grammar basis:** G01-PILOT-P0 only  
**Important:** dimensions are explicit research assumptions, not construction instructions.

## 1. Cluster identity

S2 is a partial detached two-storey dwelling cluster.

It contains enough of the dwelling to represent:

- principal arrival;
- principal / secondary rooms;
- vertical circulation;
- wet/service core;
- one representative upper bedroom;
- shared front elevation;
- whole-house systems crossing the cluster.

It is not a complete dwelling.

## 2. Coordinate system

Plan:

- origin at south-west front corner of represented cluster;
- +X east;
- +Y north;
- Z from ground-floor finished floor.

Front elevation:

**SOUTH**

## 3. Ground-floor geometry

Represented front width:

**10,800 mm**

### R-P01 — principal room

- X = 0–4800;
- Y = 0–5400;
- clear height = 3000 mm;
- role = PRINCIPAL_HABITABLE_ROOM;
- architectural rank = H1.

Area:

**25.92 m²**

### H-01 — principal hall

- X = 4800–6800;
- Y = 0–5400;
- clear width = 2000 mm;
- role = PRINCIPAL_CIRCULATION.

The hall continues north into the stair/landing zone.

### R-S01 — secondary room

- X = 6800–10800;
- Y = 0–4500;
- clear height = 3000 mm;
- role = SECONDARY_HABITABLE_ROOM;
- architectural rank = H2.

Area:

**18.00 m²**

### U-01 — utility / WC / service room

- north/east of R-S01;
- approximate clear footprint = 3000 × 2400 mm;
- roles:
  - UTILITY;
  - SANITARY;
  - WET_SERVICE_ZONE;
  - CMEV_EXTRACT_ZONE.

Exact outer cluster geometry beyond the four primary spaces is not used as a whole-house envelope claim.

## 4. Principal entrance ENTR-01

Family:

**ENTR-DOOR-MCW-01**

Front/south wall.

Centreline:

**X = 5800 mm**

Clear opening:

**900 mm — TEST ASSUMPTION**

Threshold:

**step-free**

Roles:

- PRINCIPAL_ARRIVAL;
- FINAL_EXIT contribution;
- M4(1) access;
- Part-Q security;
- architectural arrival.

The entrance centreline defines:

**AXIS-A01**

## 5. Stair ST-01

Family:

**ST-PRIVATE-01**

Located north of H-01.

Stair route centreline:

**X = 5800 mm**

Therefore:

~~~text
ENTR-01 centreline
    =
ST-01 route centreline
~~~

Project / G01-PILOT scoped relation:

**AXIS-A01 — PASS baseline**

### Vertical geometry

Ground FFL:

0 mm.

Upper FFL:

**3000 mm**

Stair configuration:

- two straight flights;
- rectangular intermediate landing;
- width = 900 mm;
- total risers = 18;
- 9 risers per flight;
- rise = 166.7 mm nominal;
- going = 250 mm nominal;
- 2R + G = 583.4 mm;
- nominal pitch ≈ 33.7°;
- headroom volume arranged to satisfy the selected ST-PRIVATE-01 / Part-K route.

Structural adequacy:

**EXTERNAL**

Floor opening/trimmers:

**represented / external adequacy**

## 6. Ground-floor room doors

### D-P01 — hall → principal room

- clear opening: 850 mm;
- ordinary internal door;
- position: west side of H-01;
- principal-route relationship.

### D-S01 — hall → secondary room

- clear opening: 800 mm;
- position: east side of H-01.

### D-U01 — hall/service route → utility/WC

- clear opening: 800 mm;
- marked SERVICE / SECONDARY route.

Door undercuts:

**10 mm — TEST ASSUMPTION where required for VENT-CMEV-01 transfer air**

## 7. Principal route graph

Declared project / G01-PILOT route:

~~~text
OUTSIDE
  ↓
ENTR-01
  ↓
H-01
  ├── principal → D-P01 → R-P01
  ├── secondary → D-S01 → R-S01
  └── vertical → ST-01 → L-01 → B-01
~~~

Service route:

~~~text
H-01
  ↓
D-U01
  ↓
U-01 / WET CORE / SERVICE RISER
~~~

The service route is explicitly subordinate.

## 8. Front-elevation openings

### WIN-P01 — principal-room front window

Host:

R-P01 south wall.

- width: 1800 mm;
- height: 1800 mm;
- sill: 750 mm AFFL;
- centreline X = 2400 mm;
- role = PRIMARY_OPENING;
- family = BF-WIN-MCW-01 interface.

### WIN-S01 — secondary-room front window

Host:

R-S01 south wall.

- width: 1500 mm;
- height: 1500 mm;
- sill: 900 mm AFFL;
- centreline X = 8800 mm;
- role = SECONDARY_OPENING.

### Front-elevation order

The represented façade is not required to be globally symmetric.

Declared facts:

- ENTR-01 / ST-01 share AXIS-A01;
- principal and secondary openings have different rank;
- WIN-P01 nominal area > WIN-S01 nominal area.

G01-PILOT uses this as hierarchy/order evidence only.

## 9. Upper landing L-01

Connected from ST-01.

Role:

- upper principal circulation node.

It connects to representative bedroom B-01.

Other upper rooms are OUTSIDE S2.

## 10. Bedroom B-01

Located above the secondary/east portion of the cluster.

- role = HABITABLE_BEDROOM;
- rank = H2;
- FFL = +3000 mm;
- clear height = 2700 mm — TEST ASSUMPTION.

## 11. Upper escape window WIN-B01

Front/south elevation.

Centreline:

**X = 8800 mm**

Therefore it is vertically aligned with WIN-S01.

Project coupling relation:

**ALIGN-V01 — vertical centreline alignment**

Geometry:

- nominal opening: 1200 × 1500 mm;
- sill / bottom of openable area: 900 mm AFFL;
- effective unobstructed openable area: 0.60 m² — TEST ASSUMPTION;
- openable width and height each >450 mm.

Roles:

- ordinary ventilation opening;
- ground-independent upper window;
- **EMERGENCY_ESCAPE** under FIRE-H1-2S-EGRESS-01;
- architectural upper opening;
- Part-O contribution.

Upper floor level:

3.0 m above ground.

Therefore inside the selected <=4.5 m fire-family route.

## 12. Fire route baseline

Candidate family:

**FIRE-H1-2S-EGRESS-01**

Baseline:

- upper representative bedroom has escape window;
- stair is ordinary private stair;
- ground hall reaches principal external final exit;
- no open-plan kitchen/stair special condition in the represented cluster;
- alarm-system obligation generated at dwelling scope.

Fire-family status:

**SEMANTIC ROUTE PASS / EXTERNAL REVIEW REQUIRED**

## 13. Wet/service core

Family:

**WET-CORE-01**

U-01 contains/adjacent to:

- accessible wet-service riser;
- zonal hot/cold isolation;
- soil/waste stack;
- utility appliance connections;
- WC branch;
- hot-water cylinder/plant relationship;
- CMEV extract route;
- heating hydraulic/service hub.

The service core position is authored once.

All service networks reference it.

## 14. Ventilation

Family:

**VENT-CMEV-01**

Cluster occurrences:

### Habitable background-air nodes

- R-P01;
- R-S01;
- B-01.

### Extract node

- U-01 / WC/utility.

The rest of the whole-dwelling extract network is outside S2.

Transfer routes:

- room doors;
- hall;
- stair/landing;
- U-01 route.

Whole-dwelling rates/background-vent totals remain:

**EXTERNAL / WHOLE DWELLING CONTEXT REQUIRED**

## 15. Heating

Family:

**HEAT-ASHP-RAD-01**

Plant relationship:

- heat-pump hydraulic hub adjacent to wet core.

Representative emitters:

- RAD-P01 on internal wall of R-P01;
- RAD-S01 on internal wall of R-S01;
- RAD-B01 on internal wall of B-01.

No emitter is embedded in floors.

Heat-loss / emitter sizing:

**EXTERNAL**

## 16. Electrical / data

Family:

**SR-ROOM-LOW-01**

Low-level room-service routes originate from the service core / hall spine.

Representative controls/outlets stay inside the Category-1 target band.

Electrical design:

**EXTERNAL Part-P competent evidence**

## 17. Drainage / water

U-01 is adjacent to the vertical wet core.

Baseline:

- WC branch short;
- utility sink/appliance branches short;
- stack access/rodding available;
- cylinder adjacent;
- zonal valve cluster accessible.

Detailed pipe sizes/falls:

**EXTERNAL / TARGET EVIDENCE**

The source deliberately chooses a geometrically easy wet-core condition.

## 18. Structural topology

Upper floor:

- I-joist family;
- primary span south ↔ north support lines;
- ST-01 creates floor opening/trimmer obligation;
- front-window openings create head obligations;
- loadbearing/internal wall conditions represented where used.

Roof:

- RF-TRUSS-DUO-01 is registered at whole-house scope but not geometrically expanded in S2.

Adequacy:

**EXTERNAL under SAB-H1-01**

## 19. Architectural hierarchy / pilot profile

G01-PILOT-P0 source facts:

### Hierarchy

- R-P01 = H1 principal;
- R-S01 = H2 secondary;
- B-01 = H2;
- H-01 = principal circulation;
- ST-01 = principal vertical circulation;
- U-01 route = service/secondary.

### Sequence

Principal arrival:

~~~text
ENTR-01 → H-01 → R-P01
~~~

Vertical arrival:

~~~text
ENTR-01 → H-01 → ST-01 → L-01 → B-01
~~~

### Scoped axis

AXIS-A01:

- principal entrance;
- stair route.

It does **not** claim whole-building symmetry.

### Opening rank

WIN-P01 > WIN-S01 as declared architectural rank.

### Coupling

ALIGN-V01:

WIN-S01 and WIN-B01 share vertical centreline.

No universal room ratio is enforced.

## 20. Baseline quantities

Ground represented habitable floor areas:

- R-P01 = 25.92 m²;
- R-S01 = 18.00 m².

Upper represented bedroom:

- exact plan assumption = 18.00 m² for research alignment.

Front opening areas:

- WIN-P01 = 3.24 m²;
- WIN-S01 = 2.25 m²;
- WIN-B01 = 1.80 m²;
- ENTR-01 product area unselected.

These quantities are source geometry only.

## 21. Frozen mutations

### S2-M01 — service shortcut

Add D-UP01:

- 900 mm general-use door;
- direct U-01 → R-P01 connection;
- mark as ordinary circulation.

### S2-M02 — stair-axis drift

Move ST-01 route centreline:

5800 → 6200 mm.

Keep rise/going valid.

### S2-M03 — flatten opening hierarchy

Change WIN-S01:

1500 × 1500 → 1900 × 1800 mm.

It becomes nominally larger than WIN-P01.

### S2-M04 — remove upper escape capability

WIN-B01 becomes fixed glazing.

Masonry opening unchanged.

### S2-M05 — move wet core

Relocate U-01 / core approximately 4 m west, away from current stack/plant alignment while keeping room identities unchanged.

### S2-M06 — entrance-hall obstruction

Add fixed joinery reducing the principal clear route near ENTR-01/ST-01 to:

**750 mm**

### S2-M07 — promote service route

Keep geometry unchanged but reclassify D-U01 / U-01 path as PRINCIPAL circulation while leaving the original principal route in place.

### S2-M08 — raise upper floor

Upper FFL:

3000 → 3250 mm.

Do not initially change stair riser count/geometry.

## 22. Source invariants

1. service geography is authored once;
2. room rank is authored once;
3. route class is relational;
4. opening rank is relational;
5. fire escape is a window role, not a new window type;
6. stair technical geometry and architectural rank remain separate;
7. external professional evidence remains scoped;
8. G01-PILOT-P0 is research-only;
9. whole-dwelling Part L/O/F totals remain outside S2;
10. no mutation silently expands the supported domain.

## 23. Authoring burden

The author creates:

- spaces;
- doors/openings;
- stair;
- entrance;
- hierarchy/route intentions;
- wet core;
- service-system family choices.

The author does not manually create:

- fire checks;
- Part-M checks;
- Part-F checks;
- structural trimmer checks;
- wet-service fall checks;
- façade hierarchy checks;
- evidence invalidation rules.

Those are compiler consequences.
