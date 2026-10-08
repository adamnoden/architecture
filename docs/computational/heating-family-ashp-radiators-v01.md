# Heating Family HEAT-ASHP-RAD-01 — Air-to-Water Heat Pump + Low-Temperature Radiators

**Status:** H1 paper-domain heating family v0.1; technical performance remains external evidence  
**Purpose:** provide one bounded, maintainable whole-house heating topology for H1 research without making the floor assembly itself the primary heat-distribution network.  
**Engineering status:** heat-loss calculation, heat-pump sizing, emitter sizing, hydraulics and commissioning are competent external design/evidence.

> **The computational model may own heat-demand relationships and maintenance geography. The heating engineer owns the technical design that proves performance.**

## 1. Base topology

~~~text
OUTDOOR AIR-TO-WATER HEAT PUMP
        ↓
DESIGNED WALL / SERVICE ENTRY
        ↓
ACCESSIBLE PLANT / HYDRAULIC HUB
        ├── SPACE-HEATING FLOW/RETURN
        │      ↓
        │   VERTICAL / HORIZONTAL SERVICE ROUTE
        │      ↓
        │   ROOM BRANCHES
        │      ↓
        │   REPLACEABLE LOW-TEMP RADIATORS
        │
        └── HOT-WATER CYLINDER CHARGE CIRCUIT
               ↓
          DHW STORAGE
~~~

Potable water leaving the cylinder belongs to the wet-service system, not the heating circuit.

## 2. H1 arrangement

The bounded family assumes:

- external air-to-water heat-pump unit;
- replaceable plant;
- accessible internal hydraulic components;
- room-by-room hydronic radiator emitters;
- heating pipes routed through declared service geography;
- accessible isolation and balancing components;
- weather compensation or another accepted heat-pump control strategy;
- hot-water cylinder in accessible plant/service geography where DHW is heat-pump supplied.

Embedded wet underfloor loops are outside the H1 baseline. That is a domain choice, not an HSA prohibition. Another project may legitimately use them where their performance, construction, failure and replacement consequences are well resolved.

## 3. Room semantics

Each heated room contributes:

- design temperature;
- room geometry;
- envelope/ventilation heat-loss inputs;
- emitter occurrence;
- emitter location;
- accessibility/maintenance volume.

The competent heating design determines required output. The compiler does not invent room watts.

## 4. Emitter family

H1 baseline emitter:

**ordinary replaceable wall radiator / low-temperature panel emitter**

Requirements:

- sized by competent design at the selected low-temperature regime;
- replaceable without disproportionate destruction of longer-lived construction;
- isolatable;
- not placed inside access/door/maintenance clearances;
- served by a deliberate route.

Fan-coils and other active emitters would be separate families.

## 5. Distribution geography

Heating flow/return may use:

- service riser;
- accessible corridor/service route;
- `SR-ROOM-LOW-01`-compatible low-level room zone;
- designed sleeves/crossings.

Avoid as the H1 baseline:

- arbitrary masonry chasing;
- concealed inaccessible pipework in floor build-ups;
- uncontrolled joist drilling;
- long inaccessible pipe loops.

The governing reason is lifecycle separation and maintainability, not a universal ban on pipes crossing or entering long-lived construction.

## 6. Isolation

At minimum the semantic model records:

- whole-system isolation;
- heat-pump isolation;
- hot-water-cylinder charge isolation;
- room/zone/branch isolation where selected;
- radiator valves.

Isolation devices must remain accessible for their intended task.

## 7. Heat-pump occurrence

The outdoor unit needs:

- service/replacement clearance;
- airflow clearance;
- drainage/defrost condensate route;
- vibration/noise context;
- planned hydraulic/refrigerant interface according to selected product subfamily;
- electrical supply;
- maintenance route.

Neighbour/noise/planning context remains a site dependency rather than a property of the heat-pump label.

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

Evidence dependencies must reference source geometry and envelope performance. A window/fabric change can therefore stale heat-loss and emitter evidence without invalidating unrelated system facts.

## 9. Controls

The family supports:

- manufacturer heat-pump control;
- weather compensation or accepted equivalent;
- time/temperature control;
- room/zone controls compatible with heat-pump operation.

Cloud connectivity or proprietary smart-home services should not become a proof dependency.

## 10. Hot-water cylinder relation

The family may include:

- heat-pump-compatible cylinder;
- immersion/auxiliary element where required by the selected design;
- accessible controls/safety devices;
- accessible maintenance/replacement route.

Part-G hot-water safety and potable-water quality belong to the H1 wet-service target/family.

## 11. Failure behaviour

### Heat pump fails

- heating/DHW charge unavailable;
- plant remains replaceable through the designed route;
- room distribution remains physically present.

### One radiator/valve fails

- local branch can be isolated where the selected design provides it;
- remaining distribution stays serviceable.

### Pipe leak

- failure consequence follows the actual route and surrounding construction;
- hidden permanent fabric must not be assumed to absorb or conceal leakage harmlessly.

The H1 baseline avoids embedded floor loops partly because their failure and replacement geography is harder to bound.

## 12. Mutations

- improve/enlarge envelope → heat-loss evidence stale; downsizing may be possible;
- add room → heating branch/emitter/evidence required;
- move radiator into door/access zone → architectural/accessibility conflict;
- route pipe through structure without a designed crossing → source/interface failure;
- change design flow temperature → emitter-capacity evidence re-evaluates;
- substitute heat pump → hydraulic/control/noise/cylinder evidence re-evaluates while unrelated room geometry remains.

## 13. H1 posture

~~~text
heating topology                 RESEARCH-SUPPORTED H1 FAMILY
room/emitter identity            SEMANTIC
service geography                RESEARCH-SUPPORTED
heat-loss calculation            EXTERNAL COMPETENT EVIDENCE
heat-pump sizing/performance     EXTERNAL COMPETENT/PRODUCT EVIDENCE
radiator sizing                  EXTERNAL COMPETENT EVIDENCE
controls                         PRODUCT / DESIGN EVIDENCE
plant maintenance/replacement    SEMANTIC + GEOMETRIC
installation/commissioning       PHYSICAL EVIDENCE
~~~

## 14. Reference House boundary

HEAT-ASHP-RAD-01 is a useful H1 technical family, not the Reference House heating decision. The actual house must compare fabric demand, emitter requirements, summer strategy, plant placement, noise, domestic hot water, maintenance and credible alternatives.

The computational family exists to bound a research problem. It does not turn one current low-carbon system into architectural doctrine.