# Heating Family HEAT-ASHP-RAD-01 — Air-to-Water Heat Pump + Low-Temperature Radiators

**Status:** H1 supported-family candidate v0.1  
**Purpose:** provide one maintainable whole-house heating topology compatible with the Long-Life service geography.  
**Engineering status:** heat-loss calculation, heat-pump sizing, emitter sizing, hydraulics and commissioning are competent external design/evidence.

> **The compiler owns where heat must go and whether the system remains maintainable. The heating engineer owns how many watts and litres per minute make that true.**

## 1. Base topology

~~~text
OUTDOOR AIR-TO-WATER HEAT PUMP
        ↓
DESIGNED WALL / SERVICE ENTRY
        ↓
ACCESSIBLE PLANT / HYDRAULIC HUB
        ├── SPACE-HEATING FLOW/RETURN
        │      ↓
        │   VERTICAL / HORIZONTAL SERVICE SPINE
        │      ↓
        │   ROOM BRANCHES
        │      ↓
        │   REPLACEABLE LOW-TEMP RADIATORS
        │
        └── HOT-WATER CYLINDER CHARGE CIRCUIT
               ↓
          DHW STORAGE
~~~

The potable water leaving the cylinder belongs to WET-CORE-01, not the heating circuit.

## 2. H1 supported arrangement

- external air-to-water heat-pump unit;
- replaceable plant;
- accessible internal hydraulic components;
- room-by-room hydronic radiator emitters;
- heating pipes routed through declared service zones;
- no wet underfloor loops embedded in permanent floor fabric;
- accessible isolation and balancing components;
- weather compensation / accepted heat-pump controls;
- hot-water cylinder in accessible plant/service core where DHW is heat-pump supplied.

## 3. Room semantics

Each heated room contributes:

- design temperature;
- room geometry;
- envelope/ventilation heat-loss inputs;
- emitter occurrence;
- emitter location;
- accessibility/maintenance volume.

The heat-loss engine/design evidence determines required output.

The compiler does not invent room watts.

## 4. Emitter family

H1 baseline emitter:

**ordinary replaceable wall radiator / low-temperature panel emitter**

Requirements:

- sized by competent design at the selected low-temperature regime;
- independently replaceable;
- isolatable;
- no permanent-fabric destruction for replacement;
- not placed inside access/door/maintenance clearances;
- route to emitter remains accessible.

Fan-coils and active emitters are later families.

## 5. Distribution geography

Heating flow/return lives in:

- service riser;
- accessible corridor/service spine;
- SR-ROOM-LOW-01-compatible low-level room zone;
- designed sleeves/crossings.

Avoid:

- arbitrary masonry chasing;
- concealed inaccessible pipework in permanent floors;
- uncontrolled joist drilling;
- long inaccessible pipe loops.

## 6. Isolation

At minimum the semantic model records:

- whole-system isolation;
- heat-pump isolation;
- hot-water-cylinder charge isolation;
- room/zone/branch isolation where selected;
- radiator valves.

Isolation devices must remain accessible.

## 7. Heat-pump occurrence

The outdoor unit needs:

- service/replacement clearance;
- air-flow clearance;
- drainage/defrost condensate route;
- vibration/noise context;
- planned hydraulic/refrigerant interface according to selected product subfamily;
- electrical supply;
- maintenance route.

The compiler treats neighbour/noise/planning context as a site dependency.

## 8. Competent design evidence

External evidence must cover:

- room-by-room design heat loss;
- design external temperature;
- selected heat-pump capacity/modulation;
- flow/return temperatures;
- emitter sizing;
- pipe sizing/pressure loss;
- pump/hydraulic arrangement;
- cylinder charging capability;
- controls;
- frost/defrost strategy;
- commissioning.

Evidence dependencies must reference source geometry and envelope performance.

A window/fabric change can therefore stale heat-loss and emitter evidence.

## 9. Controls

The family supports:

- manufacturer heat-pump control;
- weather compensation or accepted equivalent;
- time/temperature control;
- room/zone controls compatible with heat-pump operation.

Do not make cloud connectivity or proprietary smart-home services a proof dependency.

## 10. Hot-water cylinder relation

The family may include:

- heat-pump-compatible cylinder;
- immersion/auxiliary element where required by the selected design;
- accessible controls/safety devices;
- accessible maintenance/replacement route.

Part-G hot-water safety and potable-water quality belong to the H1 wet-service target/family.

## 11. Failure behavior

### Heat pump fails

- heating/DHW charge unavailable;
- plant is replaceable without demolition;
- room distribution remains intact.

### One radiator/valve fails

- local branch can be isolated;
- remaining distribution stays serviceable.

### Pipe leak

- route should be inspectable/accessible;
- leak consequence must not rely on hidden permanent fabric absorbing the failure.

This is a strong reason not to embed H1 wet heating in floors.

## 12. Mutations

- enlarge/upgrade envelope → heat-loss evidence stale/downsizes possible;
- add room → heating branch/emitter/evidence required;
- move radiator into door access zone → architectural/accessibility conflict;
- route pipe through structural wall without designed sleeve → doctrine/interface failure;
- change design flow temperature → all emitter capacity evidence re-evaluates;
- substitute heat pump → hydraulic/control/noise/cylinder evidence re-evaluates, room geometry remains.

## 13. H1 posture

~~~text
heating topology                 SUPPORTED
room/emitter identity            NATIVE
service geography                SUPPORTED
heat-loss calculation            EXTERNAL COMPETENT EVIDENCE
heat-pump sizing/performance     EXTERNAL COMPETENT/PRODUCT EVIDENCE
radiator sizing                  EXTERNAL COMPETENT EVIDENCE
controls                         SUPPORTED ROUTE + PRODUCT EVIDENCE
plant maintenance/replacement    NATIVE SEMANTICS
installation/commissioning       FUTURE PHYSICAL EVIDENCE
~~~
