# H1-PAPER-01 — Frozen Complete-House Source Package

**Source ID:** H1-PAPER-SOURCE-01  
**Status:** frozen paper-compilation input — source erratum incorporated  
**Date:** 2026-10-05  
**Target basis:** current H1 England research target + services extension + current transition logic  
**Grammar basis:** G01-PILOT-P0 only  
**Important:** dimensions are research assumptions for compiler falsification, not construction information.

## 1. Building identity

One detached two-storey single-family dwelling.

No basement, attached garage or habitable roof storey.

External footprint:

**10,800 × 9,000 mm**

- plan area per level = **97.20 m²** gross bounding area;
- two-storey gross bounding area = **194.40 m²**;
- front elevation = **SOUTH**;
- ground FFL = **0 mm**;
- upper FFL = **+3000 mm**.

Coordinate system:

- origin at south-west external corner;
- +X east;
- +Y north;
- Z from ground FFL.

Primary external form:

- simple rectangle;
- masonry cavity walls;
- simple duo-pitched roof;
- ridge east–west at Y = 4500 mm;
- nominal roof pitch 35° — research assumption;
- north roof slope preferred for ordinary service terminals.

## 2. Organising plan

Three longitudinal fields:

~~~text
WEST ROOMS     CENTRAL SPINE      EAST ROOMS
0–4400         4400–6400          6400–10800
~~~

The 2000 mm central field contains principal entrance/hall, stair, upper landing and rear secondary/service circulation.

This is a fixture-specific organising device, not a universal house rule.

## 3. Ground floor

### G-LIV-01 — principal living room

- X = 0–4400;
- Y = 0–4500;
- area = **19.80 m²**;
- PRINCIPAL_HABITABLE_ROOM;
- architectural rank H1;
- principal arrival destination;
- habitable ventilation inlet zone;
- purge/overheating window contribution.

### G-STUDY-01 — secondary habitable room

- X = 6400–10800;
- Y = 0–4500;
- area = **19.80 m²**;
- SECONDARY_HABITABLE_ROOM;
- rank H2;
- habitable ventilation inlet zone.

### G-DIN-01 — rear dining/family room

- X = 0–4400;
- Y = 4500–9000;
- area = **19.80 m²**;
- HABITABLE_ROOM;
- rank H2;
- rear garden-facing room;
- habitable ventilation inlet zone;
- connects to G-REARHALL-01.

### G-KIT-01 — kitchen

- X = 6400–10800;
- Y = 4500–7200;
- area = **11.88 m²**;
- KITCHEN;
- wet-service consumer;
- whole-house ventilation extract source;
- separate cooking-source-capture obligation.

G-KIT-01 shares a real wall boundary with the central rear circulation from Y = 6200–7200 and is accessed through D-KIT-01.

The kitchen is separated from the stair/hall by ordinary construction in the baseline and does not create the unsupported open-plan fire condition.

### G-UTIL-01 — utility / WC / plant / service-core room

- X = 6400–10800;
- Y = 7200–9000;
- area = **7.92 m²**;
- UTILITY;
- SANITARY;
- WET_SERVICE_ZONE;
- PRIMARY_SERVICE_HUB;
- HOT_WATER_PLANT;
- accessible riser base;
- ventilation extract zone.

Contains or provides access to:

- hot/cold zonal valve cluster;
- soil/waste stack base and rodding access;
- hot-water cylinder;
- ASHP hydraulic interface/plant;
- electrical/service distribution interface;
- low-level room-service route origin;
- ventilation stack/service-riser access.

No active item is intentionally buried in permanent masonry.

### G-HALL-01 — front principal hall

- X = 4400–6400;
- Y = 0–3000;
- nominal clear width = **2000 mm**;
- PRINCIPAL_CIRCULATION;
- ACCESS_ROUTE;
- FINAL_EXIT contribution;
- architectural arrival.

### ST-01 — private stair

- X = 4400–6400;
- Y = 3000–6200;
- family = **ST-PRIVATE-01**;
- two straight flights + rectangular intermediate landing;
- nominal width = 900 mm;
- 18 risers;
- nominal rise = 166.7 mm;
- nominal going = 250 mm;
- upper FFL = +3000 mm.

The 3200 mm plan field is a source-level spatial reservation. Exact stair/member/headroom/floor-opening adequacy remains subject to the family and external structural evidence.

### G-REARHALL-01 — rear secondary circulation

- X = 4400–6400;
- Y = 6200–9000;
- SECONDARY_CIRCULATION;
- service-route distribution;
- connects to G-DIN-01, G-KIT-01 and G-UTIL-01.

It remains subordinate to G-HALL-01 as principal arrival.

## 4. Principal entrance

### ENTR-01

Family:

**ENTR-DOOR-MCW-01**

- south/front wall;
- centreline X = **5400 mm**;
- nominal clear opening = **900 mm — research assumption**;
- threshold = **step-free**.

Roles:

- PRINCIPAL_ARRIVAL;
- M4(1) access contribution;
- FINAL_EXIT contribution;
- SECURITY;
- WEATHER/AIR/THERMAL transition;
- architectural entrance.

ENTR-01 defines **AXIS-A01**. ST-01 is intentionally organised on the same scoped central axis.

This does not assert whole-building bilateral symmetry.

## 5. Ground-floor internal doors/routes

- **D-LIV-01:** G-HALL-01 → G-LIV-01; 850 mm nominal clear; principal relationship.
- **D-STUDY-01:** G-HALL-01 → G-STUDY-01; 800 mm nominal clear.
- **D-DIN-01:** G-REARHALL-01 → G-DIN-01; 800 mm nominal clear.
- **D-KIT-01:** G-REARHALL-01 → G-KIT-01; 800 mm nominal clear; ordinary separating door in baseline.
- **D-UTIL-01:** G-REARHALL-01 → G-UTIL-01; 850 mm nominal clear.

Transfer-air requirements are derived from the selected ventilation design. Door/transfer geometry remains shared physical source information rather than a ventilation-only duplicate.

## 6. Upper floor

### B-P01 — principal bedroom

- X = 0–4400;
- Y = 0–4500;
- area = **19.80 m²**;
- HABITABLE_BEDROOM;
- upper rank H1;
- habitable ventilation inlet zone;
- escape-window obligation.

### B-S01 — secondary front bedroom

- X = 6400–10800;
- Y = 0–4500;
- area = **19.80 m²**;
- HABITABLE_BEDROOM;
- rank H2;
- inlet zone;
- escape-window obligation.

### B-S02 — rear bedroom

- X = 0–4400;
- Y = 4500–9000;
- area = **19.80 m²**;
- HABITABLE_BEDROOM;
- rank H2;
- inlet zone;
- escape-window obligation.

### BATH-01 — upper bathroom / wet zone

- X = 6400–10800;
- Y = 4500–7200;
- area = **11.88 m²**;
- BATHROOM;
- WET_ZONE;
- ventilation extract zone;
- stacked wet-service consumer;
- family = **WZ-BSM-01**.

Research arrangement:

- bonded sheet waterproofing system;
- walk-in shower area with local fall to drain;
- waterproof wall/floor extent declared by family/detail;
- drain transition;
- pipe/control penetrations use system accessories;
- dry-side service access where possible;
- inspection hold point before finish concealment.

The Mapeguard WP trial is available as a scoped product/system evidence example, not installed-instance proof.

### U-SVC-01 — upper service / linen zone

- X = 6400–10800;
- Y = 7200–9000;
- area = **7.92 m²**;
- vertical service-riser access;
- linen/storage secondary use;
- hybrid-assist/service access zone;
- dry-side access for relevant bathroom services.

Active ventilation-assist components, where required, must be serviceable here or in equally accessible technical geography rather than at an inaccessible roof terminal.

### L-01 — upper landing/circulation

Central spine around ST-01.

Roles:

- UPPER_CIRCULATION;
- connection to all bedrooms and BATH-01;
- service access to U-SVC-01.

No habitable room is authored as an unresolved upper inner room.

## 7. Window/opening schedule

All external window interfaces use **BF-WIN-MCW-01** unless occurrence-specific evidence shows otherwise.

### Front/south

**WIN-LIV-01 — G-LIV-01**

- 1800 × 1800 mm nominal;
- centreline X = 2200 mm;
- sill = 750 mm AFFL;
- PRIMARY_OPENING;
- purge/overheating contribution;
- ventilation inlet host/candidate location as selected by ventilation design.

**WIN-STUDY-01 — G-STUDY-01**

- 1500 × 1500 mm;
- centreline X = 8600 mm;
- sill = 900 mm;
- SECONDARY_OPENING.

**WIN-BP01 — B-P01**

- 1600 × 1500 mm;
- centreline X = 2200 mm;
- bottom of effective escape opening = 900 mm AFFL — test assumption;
- aligned with WIN-LIV-01;
- ESCAPE role;
- unobstructed openable area = 0.60 m² — test assumption;
- effective openable dimensions each >450 mm — test assumption.

**WIN-BS01 — B-S01**

- 1200 × 1500 mm;
- centreline X = 8600 mm;
- bottom of effective escape opening = 900 mm AFFL — test assumption;
- aligned with WIN-STUDY-01;
- ESCAPE role;
- openable area = 0.60 m² — test assumption;
- effective openable dimensions each >450 mm — test assumption.

### Rear/north

**WIN-DIN-01 — G-DIN-01**

- 1800 × 1500 mm;
- purge/overheating contribution;
- ventilation inlet host/candidate location.

**WIN-BS02 — B-S02**

- 1500 × 1500 mm;
- ESCAPE role;
- bottom of effective escape opening = 900 mm AFFL — test assumption;
- openable area = 0.60 m² — test assumption;
- effective openable dimensions each >450 mm — test assumption.

**WIN-UTIL-01 — G-UTIL-01**

- 900 × 900 mm;
- ordinary secondary opening.

### East

**WIN-KIT-01 — G-KIT-01**

- 1200 × 1200 mm;
- ordinary kitchen opening/purge contribution.

**WIN-BATH-01 — BATH-01**

- 900 × 1200 mm;
- natural light/openable purge contribution;
- not relied upon as the normal extract system.

## 8. Architectural pilot profile

Research grammar:

**G01-PILOT-P0**

Hierarchy:

- G-LIV-01 = ground H1;
- G-STUDY-01/G-DIN-01 = H2;
- B-P01 = upper H1;
- B-S01/B-S02 = H2;
- G-HALL-01/ST-01 = principal circulation;
- G-REARHALL-01/service routes = secondary/service circulation.

Principal sequence:

~~~text
OUTSIDE → ENTR-01 → G-HALL-01 → D-LIV-01 → G-LIV-01
~~~

Vertical sequence:

~~~text
ENTR-01 → G-HALL-01 → ST-01 → L-01 → upper rooms
~~~

AXIS-A01 scopes entrance/hall/stair only.

Front opening rank:

- WIN-LIV-01 = PRIMARY;
- WIN-STUDY-01 = SECONDARY;
- upper openings carry explicit vertical alignments.

No universal room-ratio rule is enforced. The fixture does not claim validated Georgian grammar.

## 9. Structural source topology

Assurance boundary:

**SAB-H1-01**

- masonry external walls participate in support graph;
- spine support lines at approximately X = 4400 and X = 6400 provide simple upper-floor support geography;
- I-joist upper-floor wings span approximately external wall ↔ spine support;
- stair opening lies inside central field and generates trimmer/member/connection obligations;
- opening heads generate support obligations;
- roof support graph remains explicit.

Native/semantic:

- support identities;
- spanning direction;
- opening dependencies;
- load-path continuity requirement.

External:

- joist/member sizes;
- reactions;
- trimmers/connections;
- wall/masonry capacity;
- global stability;
- foundations/geotechnics.

Ground floor uses BF-GF-MCW-01 perimeter/boundary semantics. No footing dimensions are invented.

## 10. Roof

Family:

**RF-TRUSS-DUO-01**

- ridge east–west at Y = 4500 mm;
- nominal pitch = 35°;
- north/south eaves;
- east/west gables;
- no hips, valleys or dormers;
- no habitable loft.

Nominal sloping area, ignoring eaves overhang:

**≈118.7 m²**

Structural adequacy remains external manufacturer/engineer evidence.

Roof terminals are concentrated on the north/rear slope where feasible.

## 11. Fire / escape

Family:

**FIRE-H1-2S-EGRESS-01**

Baseline:

- upper floor +3.0 m;
- one private stair;
- no habitable loft/garage;
- kitchen separated from stair/hall;
- B-P01/B-S01/B-S02 each have ESCAPE window role;
- ground living/study/dining connect to circulation leading to ENTR-01 final exit;
- alarm obligation generated at dwelling scope.

Status remains research-supported with competent external review required.

## 12. Accessibility

Research baseline:

**Category 1 / M4(1)**

Source provides:

- step-free entrance;
- 2000 mm principal hall research width;
- entrance-storey habitable rooms;
- ground WC within G-UTIL-01;
- direct route from entrance/hall to ground rooms and WC;
- representative clear door openings;
- accessible service-control intent.

Exact target checks remain compiler obligations. No M4(2)/M4(3) claim is made.

## 13. Wet/service core

Family:

**WET-CORE-01**

East-rear geography:

~~~text
ROOF TERMINALS
    ↑
U-SVC-01 / BATH-01
    ↑
G-UTIL-01 / G-KIT-01
    ↓
planned substructure/drainage route
~~~

Potable water, hot water, drainage, ventilation, heating hydraulics and electrical/data remain distinct networks that share geography where appropriate.

## 14. Potable water / drainage

Topology:

- incoming water to G-UTIL-01 service hub;
- accessible isolation cluster;
- cylinder in G-UTIL-01;
- short kitchen/utility/WC branches;
- vertical bathroom riser;
- soil/waste stack aligned with wet core;
- shower/wastes descend through planned floor/service crossing;
- rodding/access retained.

External competent evidence owns pipe sizing, pressure/flow, hot-water safety, waste/soil sizing, falls, underground drainage and discharge arrangements.

## 15. Wet-zone waterproofing

Occurrence:

**WZ-BATH-01**

Source owns wet-zone extent, substrate identity, shower fall/drain geometry, pipe/control penetrations, drain transition, junction/corner identities and dry-side access relationship.

Mapeguard WP may be referenced as candidate system evidence. Release still requires occurrence-specific applicability, selected product identity and construction evidence.

Tiles/grout are finish, not waterproofing proof.

## 16. Ventilation / IAQ topology

Family:

**VENT-HYBRID-STACK-01**

Hierarchy:

> passive first; mechanical assistance only where natural driving force cannot reliably discharge the obligation.

Purpose-provided outdoor-air obligations:

- G-LIV-01;
- G-STUDY-01;
- G-DIN-01;
- B-P01;
- B-S01;
- B-S02.

Extract zones:

- G-KIT-01 — whole-house extract contribution distinct from enhanced cooking source capture;
- G-UTIL-01/WC;
- BATH-01.

Near-vertical stack routes use east-rear service geography and terminate through PEN-ROOF-TERM-01 on the north roof slope.

The source does not assume unrelated extract streams may be combined merely because a shared shaft is convenient.

Any low-pressure assist component required by external design must remain accessible from U-SVC-01 or equivalent service geography. Stopped-fan/passive-path claims require evidence.

Openable windows supply purge capability subject to actual Part-O analysis.

Cooking source capture is a separate obligation and uses PEN-WALL-CORE-01. Hood/make-up-air/grease/pressure performance remains external.

## 17. Controlled envelope penetrations

Family:

**PEN-ENV-01**

Planned occurrences include:

- hybrid ventilation roof terminal(s);
- soil-vent terminal where required;
- kitchen source-capture wall duct;
- ASHP/hydronic wall crossing;
- grouped incoming-service entry if final design requires it.

Each occurrence carries independent weather, cavity/moisture, airtightness, thermal, service-support, product/evidence and maintenance obligations plus fire/acoustic branches where applicable.

No generic `sealed = true` state exists.

## 18. Heating / hot water

Family:

**HEAT-ASHP-RAD-01**

- external ASHP at north-east service side;
- short controlled wall penetration to G-UTIL-01;
- accessible hydraulic plant + cylinder;
- low-temperature radiators in habitable rooms;
- accessible hydronic routes;
- no embedded wet UFH baseline.

External evidence owns heat loss, plant/emitter sizing, hydraulics, controls, noise/siting and commissioning.

## 19. Electrical / data

Family:

**SR-ROOM-LOW-01**

- accessible distribution origin near service hub/spine;
- low-level room routes;
- replaceable/accessed socket/data geography;
- no routine unpredictable burial in structural masonry.

Electrical technical design/Part-P competence remains external.

## 20. Maintenance geography

First-class access is declared for:

- cylinder/hydraulic plant/valves;
- service riser;
- ventilation assist if used;
- rodding/drainage access;
- radiator valves/connections;
- room service routes;
- wet-room dry-side access where possible;
- maintainable penetration-side connections where detail requires.

Maintenance validity remains independent of whether an inaccessible system could still operate.

## 21. Boundary graph

Primary boundaries:

- WEATHER;
- AIR;
- THERMAL;
- GROUND/MOISTURE;
- INTERNAL WET-ZONE WATERPROOFING;
- FIRE/SMOKE where applicable;
- SECURITY at openings;
- acoustic obligations where target/site creates them.

Windows, entrance, corners, floor perimeter, roof and penetrations contribute to shared boundary graphs before canonical obligations are derived.

## 22. Source-derived quantities

Geometric/source outputs only:

- footprint = **97.20 m²**;
- two-storey gross bounding area = **194.40 m²**;
- external perimeter = **39.60 m**;
- nominal sloping roof area ≈ **118.7 m²** before overhang/waste;
- ground habitable-room source area = **59.40 m²** for G-LIV/G-STUDY/G-DIN;
- upper bedroom source area = **59.40 m²**;
- one bonded wet-zone occurrence;
- nine scheduled external windows;
- one principal external doorset;
- three upper escape-window roles;
- at least two planned wall-service penetrations plus roof/service terminals as technical design resolves them.

Commercial pricing/labour/waste/procurement are outside this source.

## 23. Evidence plan

Available research evidence:

- current target/source register;
- existing family research;
- Mapeguard WP structured evidence trial;
- hybrid ventilation evidence-boundary trial;
- source geometry/topology.

External design evidence required before release:

- structure/foundations/geotechnics;
- Part L/SAP;
- Part O;
- ventilation airflow/control/energy/acoustic/site analysis;
- heating design;
- water/drainage design;
- electrical design;
- occurrence-specific product certifications;
- competent fire/building-control review.

Later physical evidence includes installed dimensions, airtightness, commissioning, wet-zone hold points, penetration inspection, drainage/water tests, alarm commissioning and substitution/change records.

## 24. Frozen baseline invariants

1. one semantic source owns physical entities;
2. contextual roles are relational;
3. services stay in accessible geography except controlled crossings;
4. no active service is intentionally buried in permanent structural fabric;
5. architecture remains primary to compiler convenience;
6. airtightness and ventilation are separate propositions;
7. wet-zone finish is not waterproofing proof;
8. external evidence remains scoped and cannot silently become native PASS;
9. unsupported ≠ invalid;
10. RESOLVABLE-within-family ≠ current validity;
11. G01-PILOT-P0 ≠ validated Georgian grammar;
12. external whole-house technical proof may remain unresolved but visible.

## 25. Frozen mutations

### H1-M01 — move wet/service core west

Relocate G-UTIL-01/U-SVC-01/service alignment ~3000 mm west while keeping room identities/external form fixed.

Tests network length, stack verticality, floor penetrations, wet-zone dry-side access, maintenance and evidence invalidation.

### H1-M02 — raise upper floor

Upper FFL **3000 → 3250 mm** without initially changing ST-01.

Tests family re-solving and selective staleness while keeping RESOLVABLE distinct from valid.

### H1-M03 — remove escape function from WIN-BS01

Window becomes fixed glazing while masonry opening remains.

Tests fire-role failure without erasing window boundary.

### H1-M04 — incomplete wet-zone product substitution

Substitute the membrane but retain old tape/corner/drain accessory evidence.

Tests system-level evidence while geometry remains unchanged.

### H1-M05 — lose ASHP penetration air seal

Retain exterior weather detail/service route but omit internal air-barrier collar.

Tests independent boundary states.

### H1-M06 — block B-P01 outdoor-air inlet

Seal the purpose-provided normal inlet while leaving escape/purge window operational.

Tests ventilation-specific invalidation.

### H1-M07 — remove mechanical-assist availability

Keep passive stacks/inlets but delete/disable bounded assist with no replacement evidence.

Tests physical passive path versus proven normal-operation adequacy.

### H1-M08 — move stair off AXIS-A01

Shift ST-01 centreline ~+400 mm while preserving technically plausible geometry for the mutation.

Tests architectural versus technical validity.

### H1-M09 — invert front opening hierarchy

Enlarge/promote WIN-STUDY-01 so it dominates WIN-LIV-01 while room ranks remain unchanged.

Tests architectural hierarchy plus selective structural/product recalculation.

### H1-M10 — create unsupported structural transfer

Remove a required spine support segment and demand unsupported long-span transfer.

Tests OUTSIDE SUPPORTED DOMAIN behaviour.

### H1-M11 — open kitchen to stair route

Remove the separating condition between G-KIT-01 and stair/hall to create an open-plan kitchen/stair arrangement.

Tests fire-family applicability without declaring the architecture itself malformed.

### H1-M12 — obstruct plant withdrawal/working volume

Add fixed storage/joinery blocking cylinder/hydraulic plant replacement while leaving connections superficially intact.

Tests maintenance/doctrine validity independent of network connectivity.

## 26. Authoring burden

The author supplies building/storeys, spaces, openings/doors, stair, hierarchy/routes, support intent, service-core location, supported system choices, major plant/terminal positions and selected evidence references.

The author does **not** manually author separate fire/ventilation/air-boundary/waterproofing/structural copies of the house or invalidation dependency lists.

## 27. Erratum record

The first frozen draft accidentally declared a direct G-DIN-01 → G-KIT-01 opening even though the central spine geometrically separated those rooms.

The first red-team pass caught the contradiction before final programme freeze.

This revision corrects only the fixture topology:

- front hall ends at Y = 3000;
- stair occupies Y = 3000–6200;
- rear hall begins at Y = 6200;
- kitchen occupies Y = 4500–7200;
- utility/service room occupies Y = 7200–9000;
- dining, kitchen and utility connect independently to the rear hall.

No compiler abstraction, family selection or research conclusion was changed to force a pass.

## 28. Freeze statement

This corrected source is the final baseline for H1-PAPER-01.

Do not improve the plan during compilation merely to satisfy obligations.

Do not add a family merely because a mutation leaves the supported domain.

The run exists to expose the limits of the current abstraction.
