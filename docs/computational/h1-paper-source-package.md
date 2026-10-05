# H1-PAPER-01 — Frozen Complete-House Source Package

**Source ID:** H1-PAPER-SOURCE-01  
**Status:** frozen paper-compilation input  
**Date:** 2026-10-05  
**Target basis:** current H1 England research target + services extension + current transition logic  
**Grammar basis:** G01-PILOT-P0 only  
**Important:** dimensions are research assumptions for compiler falsification, not construction information.

## 1. Building identity

One detached two-storey single-family dwelling.

No basement, attached garage or habitable roof storey.

External footprint:

**10,800 × 9,000 mm**

Plan area per level:

**97.20 m² gross bounding area**

Two-storey gross bounding area:

**194.40 m²**

Front elevation:

**SOUTH**

Coordinate system:

- origin at south-west external corner;
- +X east;
- +Y north;
- Z from ground finished floor level.

Ground FFL:

**0 mm**

Upper FFL:

**+3000 mm**

Primary external form:

- simple rectangle;
- masonry cavity walls;
- simple duo-pitched roof;
- ridge east–west at Y = 4500 mm;
- nominal roof pitch 35° — research assumption;
- north roof slope used for ordinary service terminals where possible.

## 2. Organising plan

The plan uses three longitudinal fields:

~~~text
WEST ROOMS     CENTRAL SPINE      EAST ROOMS
0–4400         4400–6400          6400–10800
~~~

The central 2000 mm field contains:

- principal entrance/hall;
- private stair;
- upper landing/circulation;
- rear secondary/service circulation.

This is an architectural and technical organising device, not a claim that every supported house needs a central spine.

## 3. Ground floor

### G-LIV-01 — principal living room

Coordinates:

- X = 0–4400;
- Y = 0–4500.

Nominal area:

**19.80 m²**

Roles:

- PRINCIPAL_HABITABLE_ROOM;
- architectural rank H1;
- principal arrival destination;
- habitable ventilation inlet zone;
- purge/overheating window contribution.

### G-STUDY-01 — secondary habitable room

Coordinates:

- X = 6400–10800;
- Y = 0–4500.

Nominal area:

**19.80 m²**

Roles:

- SECONDARY_HABITABLE_ROOM;
- architectural rank H2;
- habitable ventilation inlet zone.

### G-DIN-01 — rear dining/family room

Coordinates:

- X = 0–4400;
- Y = 4500–9000.

Nominal area:

**19.80 m²**

Roles:

- HABITABLE_ROOM;
- architectural rank H2;
- rear garden-facing room;
- habitable ventilation inlet zone.

It connects to the central rear circulation and to the kitchen.

### G-KIT-01 — kitchen

Coordinates:

- X = 6400–10800;
- Y = 4500–7000.

Nominal area:

**11.00 m²**

Roles:

- KITCHEN;
- wet-service consumer;
- whole-house ventilation extract source;
- separate cooking-source-capture obligation.

The kitchen is **not** open to the stair/hall in a way that creates the unsupported open-plan fire condition.

### G-UTIL-01 — utility / WC / plant / service-core room

Coordinates:

- X = 6400–10800;
- Y = 7000–9000.

Nominal area:

**8.80 m²**

Roles:

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
- ventilation stack/service riser access.

No active item is intentionally buried in permanent masonry.

### G-HALL-01 — front principal hall

Central spine:

- X = 4400–6400;
- Y = 0–3600.

Nominal clear width:

**2000 mm**

Roles:

- PRINCIPAL_CIRCULATION;
- ACCESS_ROUTE;
- FINAL_EXIT route contribution;
- architectural arrival.

### ST-01 — private stair

Central spine:

- X = 4400–6400;
- Y = 3600–7400.

Family:

**ST-PRIVATE-01**

Configuration:

- two straight flights;
- rectangular intermediate landing;
- nominal width = 900 mm;
- total risers = 18;
- nominal rise = 166.7 mm;
- nominal going = 250 mm;
- upper FFL = +3000 mm.

The exact structural stair/floor-opening adequacy remains external evidence under SAB-H1-01.

### G-REARHALL-01 — rear secondary circulation

Central spine:

- X = 4400–6400;
- Y = 7400–9000.

Roles:

- SECONDARY_CIRCULATION;
- service-route distribution;
- connection to G-DIN-01 and G-UTIL-01.

It is deliberately subordinate to G-HALL-01 as principal arrival.

## 4. Principal entrance

### ENTR-01

Family:

**ENTR-DOOR-MCW-01**

South/front wall.

Centreline:

**X = 5400 mm**

Nominal clear opening:

**900 mm — research assumption**

Threshold:

**step-free**

Roles:

- PRINCIPAL_ARRIVAL;
- M4(1) access contribution;
- FINAL_EXIT contribution;
- SECURITY;
- WEATHER/AIR/THERMAL transition;
- architectural entrance.

ENTR-01 centreline defines:

**AXIS-A01**

ST-01 is intentionally organised on the same scoped central axis.

This does not assert whole-building bilateral symmetry as a grammar rule.

## 5. Ground-floor internal doors/routes

### D-LIV-01

G-HALL-01 → G-LIV-01.

Nominal clear opening:

**850 mm — research assumption**

Principal-route relationship.

### D-STUDY-01

G-HALL-01 → G-STUDY-01.

Nominal clear opening:

**800 mm — research assumption**

### D-DIN-01

G-REARHALL-01 → G-DIN-01.

Nominal clear opening:

**800 mm — research assumption**

### D-UTIL-01

G-REARHALL-01 → G-UTIL-01.

Nominal clear opening:

**850 mm — research assumption**

### O-DIN-KIT-01

Ordinary internal opening/door connection between G-DIN-01 and G-KIT-01.

It does not connect the kitchen directly to the stair.

Transfer-air requirements are derived from the selected ventilation design; door/transfer geometry remains shared physical source information rather than a ventilation-only duplicate.

## 6. Upper floor

### B-P01 — principal bedroom

Coordinates:

- X = 0–4400;
- Y = 0–4500.

Nominal area:

**19.80 m²**

Roles:

- HABITABLE_BEDROOM;
- upper rank H1;
- habitable ventilation inlet zone;
- escape-window obligation.

### B-S01 — secondary front bedroom

Coordinates:

- X = 6400–10800;
- Y = 0–4500.

Nominal area:

**19.80 m²**

Roles:

- HABITABLE_BEDROOM;
- upper rank H2;
- habitable ventilation inlet zone;
- escape-window obligation.

### B-S02 — rear bedroom

Coordinates:

- X = 0–4400;
- Y = 4500–9000.

Nominal area:

**19.80 m²**

Roles:

- HABITABLE_BEDROOM;
- upper rank H2;
- habitable ventilation inlet zone;
- escape-window obligation.

### BATH-01 — upper bathroom / wet zone

Coordinates:

- X = 6400–10800;
- Y = 4500–7200.

Nominal area:

**11.88 m²**

Roles:

- BATHROOM;
- WET_ZONE;
- ventilation extract zone;
- stacked wet-service consumer.

Family:

**WZ-BSM-01**

Research arrangement:

- bonded sheet waterproofing system;
- walk-in shower area with local fall to drain;
- waterproof wall/floor extent declared by family/detail;
- drain transition;
- pipe/control penetrations use system accessories;
- dry-side service access from service zone where possible;
- inspection hold point before finish concealment.

Product/evidence test reference:

**Mapeguard WP evidence trial is available as a scoped example.**

This does not turn the product trial into installed-instance proof.

### U-SVC-01 — upper service / linen zone

Coordinates:

- X = 6400–10800;
- Y = 7200–9000.

Nominal area:

**7.92 m²**

Roles:

- vertical service-riser access;
- linen/storage secondary use;
- hybrid-assist/service access zone;
- dry-side access for relevant bathroom services.

Active ventilation-assist components, where required by the external design, are located here or in another equally accessible service position rather than at an inaccessible roof terminal.

### L-01 — upper landing/circulation

Central spine around ST-01.

Roles:

- UPPER_CIRCULATION;
- connection to all bedrooms and BATH-01;
- service access to U-SVC-01.

No habitable room is authored as an unresolved upper inner room.

## 7. Window/opening schedule

All external window interfaces use:

**BF-WIN-MCW-01**

unless a later occurrence-specific detail proves outside its supported envelope.

### Front/south

#### WIN-LIV-01

G-LIV-01.

- 1800 × 1800 mm nominal;
- centreline X = 2200 mm;
- sill = 750 mm AFFL;
- architectural role = PRIMARY_OPENING;
- purge/overheating contribution;
- habitable-room ventilation inlet host/candidate location as selected by ventilation design.

#### WIN-STUDY-01

G-STUDY-01.

- 1500 × 1500 mm nominal;
- centreline X = 8600 mm;
- sill = 900 mm AFFL;
- architectural role = SECONDARY_OPENING.

#### WIN-BP01

B-P01.

- 1600 × 1500 mm nominal;
- centreline X = 2200 mm;
- sill / bottom of effective escape opening = 900 mm AFFL — research assumption;
- vertically aligned with WIN-LIV-01;
- ESCAPE role;
- effective unobstructed openable area = 0.60 m² — test assumption;
- effective openable dimensions each >450 mm — test assumption.

#### WIN-BS01

B-S01.

- 1200 × 1500 mm nominal;
- centreline X = 8600 mm;
- sill / bottom of effective escape opening = 900 mm AFFL — research assumption;
- vertically aligned with WIN-STUDY-01;
- ESCAPE role;
- effective unobstructed openable area = 0.60 m² — test assumption;
- effective openable dimensions each >450 mm — test assumption.

### Rear/north

#### WIN-DIN-01

G-DIN-01.

- 1800 × 1500 mm nominal;
- purge/overheating contribution;
- habitable-room ventilation inlet host/candidate location.

#### WIN-BS02

B-S02.

- 1500 × 1500 mm nominal;
- ESCAPE role;
- bottom of effective escape opening = 900 mm AFFL — research assumption;
- effective unobstructed openable area = 0.60 m² — test assumption;
- effective openable dimensions each >450 mm — test assumption.

#### WIN-UTIL-01

G-UTIL-01.

- 900 × 900 mm nominal;
- ordinary secondary opening.

### East

#### WIN-KIT-01

G-KIT-01.

- 1200 × 1200 mm nominal;
- ordinary kitchen opening/purge contribution.

#### WIN-BATH-01

BATH-01.

- 900 × 1200 mm nominal;
- natural light/openable purge contribution;
- not relied upon as the normal extract system.

## 8. Architectural pilot profile

Research grammar:

**G01-PILOT-P0**

### Hierarchy

- G-LIV-01 = principal ground room H1;
- G-STUDY-01/G-DIN-01 = secondary H2;
- B-P01 = principal upper bedroom;
- B-S01/B-S02 = secondary upper bedrooms;
- G-HALL-01/ST-01 = principal circulation;
- G-REARHALL-01/service routes = secondary/service circulation.

### Principal sequence

~~~text
OUTSIDE
  → ENTR-01
  → G-HALL-01
  → D-LIV-01
  → G-LIV-01
~~~

### Vertical sequence

~~~text
ENTR-01
  → G-HALL-01
  → ST-01
  → L-01
  → upper rooms
~~~

### Scoped axis

AXIS-A01 contains:

- ENTR-01;
- G-HALL-01 principal arrival line;
- ST-01 route.

### Front opening hierarchy

- WIN-LIV-01 = PRIMARY;
- WIN-STUDY-01 = SECONDARY;
- upper opening alignments preserve two explicit vertical coupling relations.

No universal room-ratio rule is enforced.

The result may be ordered/classically sympathetic without claiming validated Georgian grammar.

## 9. Structural source topology

Structural assurance boundary:

**SAB-H1-01**

### External walls

Masonry cavity walls participate in the structural support graph.

### Central spine

The two principal longitudinal spine support lines at approximately X = 4400 and X = 6400 provide a simple upper-floor support geography where applicable.

### Upper floor

I-joist topology.

Preferred wing spans are approximately:

- west external wall ↔ west spine support;
- east spine support ↔ east external wall.

The stair opening lies inside the central field and generates trimmer/member/connection obligations without requiring a large transfer across a principal room.

Native/semantic:

- support identities;
- spanning directions;
- opening dependency;
- load-path continuity requirement.

External:

- joist sizes;
- reactions;
- trimmers;
- connections;
- wall/masonry capacity;
- global stability;
- foundation/geotechnical adequacy.

### Ground/foundation

Ground floor uses the supported BF-GF-MCW-01 perimeter/boundary route.

Foundation/geotechnical design remains explicitly external.

The source does not invent footing dimensions.

## 10. Roof

Family:

**RF-TRUSS-DUO-01**

Source geometry:

- ridge east–west at Y = 4500 mm;
- nominal roof pitch = 35°;
- north and south eaves;
- east/west gables;
- no hips/valleys/dormers.

Roof structural adequacy remains external manufacturer/engineer evidence.

Source-derived nominal sloping roof area, ignoring eaves overhang:

approximately **118.7 m²**.

Roof terminals are concentrated on the rear/north slope where technically feasible.

## 11. Fire / escape

Family:

**FIRE-H1-2S-EGRESS-01**

Source conditions:

- upper floor at +3.0 m;
- one ordinary private stair;
- no habitable loft;
- no integral garage;
- no unsupported open-plan kitchen/stair arrangement;
- B-P01, B-S01 and B-S02 each carry an ESCAPE window role;
- ground living/study/dining rooms connect to circulation leading to ENTR-01 final exit;
- dwelling alarm-system obligation generated at building scope.

Fire-family result remains research-supported and subject to competent external review.

## 12. Accessibility

Research target:

**Category 1 / M4(1) route**

Source deliberately provides:

- step-free principal entrance;
- wide principal hall;
- ordinary entrance-storey habitable rooms;
- ground-floor WC within G-UTIL-01;
- direct accessible route from entrance/hall to the principal ground-floor rooms and WC;
- service controls/outlets intended to remain within target-supported zones.

Exact target checks remain derived obligations; no Category 2/3 claim is made.

## 13. Wet/service core

Family:

**WET-CORE-01**

Vertical service geography is concentrated in the east-rear field:

~~~text
ROOF TERMINALS
    ↑
U-SVC-01 / BATH-01
    ↑
G-UTIL-01 / G-KIT-01
    ↓
planned substructure/drainage route
~~~

The compiler treats:

- potable water;
- hot water;
- sanitary drainage;
- ventilation;
- heating hydraulics;
- electrical/data

as distinct networks that share geography where appropriate.

They are not collapsed into one generic MEP network.

## 14. Potable water / drainage

Authorised topology:

- incoming water route to G-UTIL-01 service hub;
- accessible isolation/valve cluster;
- hot-water cylinder in G-UTIL-01;
- short branch to G-KIT-01;
- short branch to ground WC/utility fixtures;
- vertical riser to BATH-01;
- soil/waste stack aligned with the wet core;
- upper shower drain/wastes descend through planned service/floor crossing;
- rodding/access retained;
- appliance leak/failure zone directed away from inaccessible permanent fabric where practicable.

External competent evidence remains required for:

- pipe sizing;
- pressure/flow;
- hot-water safety details;
- waste/soil sizing;
- falls;
- underground drainage;
- discharge arrangements.

## 15. Wet-zone waterproofing

Family:

**WZ-BSM-01**

Occurrence:

**WZ-BATH-01 in BATH-01**

Source owns:

- wet-zone boundary extent;
- substrate identity;
- shower fall/drain geometry;
- pipe/control penetrations;
- drain transition identity;
- junction/corner identities;
- dry-side service-access relationship.

The Mapeguard WP structured evidence trial may be referenced as the candidate system evidence example.

Release still requires occurrence-specific applicability, product identity, substrate/drain compatibility and construction evidence.

Tiles/grout are finish, not the waterproofing proof.

## 16. Ventilation / indoor-air-quality topology

Selected research family:

**VENT-HYBRID-STACK-01**

Governing hierarchy:

**passive first; mechanical assistance only where natural driving force cannot reliably discharge the obligation.**

### Purpose-provided outdoor-air inlet zones

Habitable rooms:

- G-LIV-01;
- G-STUDY-01;
- G-DIN-01;
- B-P01;
- B-S01;
- B-S02.

Exact inlet products/areas/locations remain part of the external ventilation design and site/acoustic/pollution evidence.

### Extract zones

- G-KIT-01 — whole-house extract contribution, separate from enhanced cooking-source capture;
- G-UTIL-01 / WC;
- BATH-01.

### Vertical stack geography

Near-vertical stack routes use the east-rear service geography and terminate through the north roof slope using PEN-ROOF-TERM-01.

The source permits separate stack/terminal occurrences as required by competent design.

It does not assume that several extract streams can be combined merely because a common shaft is convenient.

### Mechanical assistance

If external performance design requires low-pressure assistance, the active assist module must be serviceable from U-SVC-01 or equivalent accessible technical geography.

Stopped-fan/passive-path claims require system evidence.

### Purge / summer heat removal

Openable external windows provide purge capability subject to target/whole-house Part-O analysis.

No claim is made that openable windows alone discharge overheating obligations.

### Cooking source capture

A dedicated cooker-hood/source-capture obligation is generated separately.

Its duct uses:

**PEN-WALL-CORE-01**

through the east or north external wall.

Detailed hood/make-up-air/pressure/grease performance remains external and is not silently treated as solved by VENT-HYBRID-STACK-01.

## 17. Controlled envelope penetrations

Family:

**PEN-ENV-01**

Planned occurrences include at least:

### Roof

- hybrid ventilation terminal(s);
- soil-vent terminal where required by drainage design.

### Wall

- kitchen source-capture duct;
- ASHP/hydronic-service crossing;
- any selected grouped incoming service entry required by the final technical design.

Each occurrence carries independent obligations for:

- weather;
- cavity/moisture;
- airtightness;
- thermal continuity;
- service support;
- product/detail evidence;
- maintenance/replacement;
- fire/acoustic branches if applicable.

No penetration receives a generic `sealed = true` flag.

## 18. Heating / hot water

Family:

**HEAT-ASHP-RAD-01**

Source:

- external air-to-water heat-pump unit at rear/north-east service side;
- short controlled wall penetration to G-UTIL-01;
- accessible hydraulic plant and cylinder in G-UTIL-01;
- low-temperature radiators in habitable rooms;
- accessible low-level hydronic branch routes rather than embedded wet UFH.

External evidence required:

- room heat loss;
- whole-house demand;
- ASHP capacity/performance;
- emitter sizes;
- hydraulic design;
- controls;
- noise/siting;
- commissioning.

Heating is downstream of fabric/environmental demand reduction.

## 19. Electrical / data

Family:

**SR-ROOM-LOW-01**

Source geography:

- accessible distribution origin near G-UTIL-01/service spine;
- low-level room routes;
- sockets/data in replaceable/accessed service geography;
- controls associated with doors/surrounds where project pattern selects them;
- no routine cabling buried unpredictably in permanent structural masonry.

Electrical technical design / Part-P competence remains external.

## 20. Maintenance geography

The source declares first-class access for:

- G-UTIL-01 plant/valves/cylinder;
- vertical service riser;
- U-SVC-01 ventilation-assist components if used;
- drain/rodding access;
- radiator valves/connections;
- room service routes;
- wet-room dry-side service access where possible;
- replaceable envelope penetration collars/terminal-side connections where detail permits.

Maintenance validity is independent of whether the system could technically operate while inaccessible.

## 21. Boundary graph

Primary boundaries include:

- WEATHER;
- AIR;
- THERMAL;
- GROUND/MOISTURE;
- INTERNAL WET-ZONE WATERPROOFING;
- FIRE/SMOKE where applicable;
- SECURITY at openings;
- acoustic obligations where target/site creates them.

Windows, entrance, corners, floor perimeter, roof and penetrations contribute to shared boundary graphs before canonical obligations are derived.

Do not duplicate one air-boundary checklist per family occurrence.

## 22. Source-derived quantities

These are geometric/source outputs only, not a QS cost plan.

- external footprint = 97.20 m²;
- two-storey gross bounding area = 194.40 m²;
- external perimeter = 39.60 m;
- principal rectangular external-wall height basis = 3.0 m ground + 2.7 m upper research assumption where needed for rough quantity views;
- nominal sloping roof area ≈ 118.7 m² before overhang/waste;
- ground habitable room areas = 50.60 m² excluding kitchen/service/circulation;
- upper bedroom area = 59.40 m²;
- one bonded wet-zone bathroom occurrence;
- nine scheduled external window occurrences;
- one principal external doorset occurrence;
- three upper escape-window roles;
- at least two planned wall-service-penetration occurrences plus roof/service terminals as technical design resolves them.

Commercial rates, waste factors, labour and procurement remain outside this source.

## 23. Evidence plan

### Available research evidence

- current target/source register;
- existing boundary-family research;
- structured Mapeguard WP product/system trial;
- hybrid ventilation evidence-boundary trial;
- source-derived geometry/topology.

### External design evidence required before release

- structural member/connection/stability calculations;
- foundation/geotechnical design;
- whole-dwelling Part-L/SAP evidence;
- Part-O overheating analysis;
- hybrid ventilation airflow/control/energy/acoustic/site analysis;
- heating design;
- water/drainage design;
- electrical design;
- occurrence-specific product selections/certifications;
- competent fire/building-control review.

### Physical/as-built evidence required later

- installed dimensions/levels;
- airtightness testing;
- ventilation commissioning/performance;
- heating commissioning;
- wet-zone installation hold-point evidence;
- penetration photographs/inspection;
- drainage/water tests;
- alarm installation/commissioning;
- substitutions/change records.

## 24. Frozen baseline invariants

1. one semantic source owns physical entities;
2. contextual roles are relational;
3. services stay in declared accessible geography except controlled crossings;
4. no active service is intentionally buried in permanent structural fabric;
5. architecture remains primary to compiler convenience;
6. airtightness and ventilation are separate propositions;
7. wet-zone finish is not waterproofing proof;
8. external evidence remains scoped and cannot silently become native PASS;
9. unsupported is different from invalid;
10. RESOLVABLE-within-family is not current validity;
11. G01-PILOT-P0 is not validated Georgian grammar;
12. foundation/whole-house analytical evidence may remain external without disappearing.

## 25. Frozen mutations

### H1-M01 — move wet/service core west

Relocate G-UTIL-01/U-SVC-01/BATH service alignment approximately 3000 mm west while keeping room identities and external form fixed.

Purpose:

- attack service-network length;
- stack verticality;
- floor penetrations;
- wet-zone dry-side access;
- maintenance geography;
- evidence invalidation.

### H1-M02 — raise upper floor

Upper FFL:

**3000 → 3250 mm**

Do not initially change ST-01 geometry.

Purpose:

- reproduce family re-solving at whole-house scale;
- stale stair/structure/envelope/service evidence selectively;
- keep `RESOLVABLE WITHIN CURRENT FAMILY` separate from valid.

### H1-M03 — remove escape function from one bedroom window

WIN-BS01 becomes fixed glazing while masonry opening remains.

Purpose:

- make fire fail without making the wall/window weather boundary disappear.

### H1-M04 — substitute wet-zone membrane incompletely

Replace the specified WZ-BSM-01 membrane product with an apparently similar sheet membrane but retain old tapes/corners/drain accessory evidence.

Purpose:

- test system-level product evidence;
- geometry remains unchanged;
- waterproofing evidence becomes stale/invalid.

### H1-M05 — lose the air-barrier seal at the ASHP penetration

Retain exterior weather terminal/seal and service route but remove/omit the internal air-barrier collar connection.

Purpose:

- AIR boundary fails;
- WEATHER may remain current;
- heating network topology remains current.

### H1-M06 — block one bedroom outdoor-air inlet

Seal/obstruct the purpose-provided inlet serving B-P01 while leaving the escape/purge window otherwise operational.

Purpose:

- ventilation normal-operation obligation fails/stales;
- fire escape and ordinary window boundary can remain valid.

### H1-M07 — remove mechanical-assist availability

Delete/disable the bounded assist capability from the selected hybrid family without replacing performance evidence.

Purpose:

- passive topology remains physically present;
- whole-house ventilation adequacy becomes unresolved unless external evidence independently proves the operating envelope.

### H1-M08 — move stair off principal axis

Shift ST-01 route centreline approximately +400 mm within a technically feasible central field while preserving rise/going/headroom assumptions.

Purpose:

- architectural scoped-axis validity changes;
- technical stair geometry may remain valid;
- demonstrates architectural ≠ technical validity.

### H1-M09 — invert front opening hierarchy

Enlarge WIN-STUDY-01 so its declared visual treatment/area clearly dominates WIN-LIV-01 while room ranks remain unchanged.

Purpose:

- G01-PILOT opening-rank relation fails/deviates;
- structural/head/product evidence must re-evaluate;
- ventilation role may remain satisfiable.

### H1-M10 — create unsupported structural transfer

Remove a required spine support segment and demand that the upper floor/roof load route bridge across an enlarged opening without selecting a supported transfer family.

Purpose:

- leave the H1 supported structural domain;
- return OUTSIDE SUPPORTED DOMAIN rather than inventing a beam.

### H1-M11 — open kitchen to stair route

Remove the separation between G-KIT-01 and the stair/hall so the only ordinary circulation condition becomes an open-plan kitchen/stair arrangement.

Purpose:

- leave FIRE-H1-2S-EGRESS-01;
- architecture may remain spatially attractive;
- compiler must request another fire strategy rather than silently pass.

### H1-M12 — obstruct plant withdrawal/working volume

Add fixed storage/joinery in G-UTIL-01 that prevents removal/service of the hot-water cylinder/hydraulic plant while leaving pipe connections and operating clearances superficially plausible.

Purpose:

- maintenance geography fails;
- heating/water topology may remain technically connected;
- doctrine failure remains independently visible.

## 26. Authoring burden

The author supplies:

- building/storeys;
- spaces;
- openings/doors;
- stair;
- architectural hierarchy/routes;
- support lines/spanning intent;
- service-core location;
- supported system-family choices;
- exterior/site-side locations for major plant/terminals;
- selected evidence references where known.

The author does **not** manually author:

- one fire checklist per bedroom;
- one Part-F checklist per room;
- one air-boundary checklist per penetration;
- one waterproofing checklist per corner;
- one structural checklist per opening;
- duplicated room graphs for structure/fire/services;
- invalidation dependencies.

Those are derived compiler responsibilities.

## 27. Freeze statement

This source is now frozen for H1-PAPER-01.

Do not improve the plan during compilation merely to make an obligation pass.

Do not add a new family merely because one mutation leaves the supported domain.

The purpose of the run is to expose the limits of the current abstraction exactly as it stands.
