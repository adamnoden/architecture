# Ventilation Family VENT-CMEV-01 — Central Continuous Mechanical Extract

**Status:** H1 supported-family candidate v0.1  
**Purpose:** provide one whole-house Part-F ventilation route whose service geography and maintenance burden are deliberately bounded.  
**Target posture:** valid under the S0/S1 pre-2027 Part-F target route; also recognised as a system type in Approved Document F 2026.  
**Engineering status:** airflow design/commissioning and product performance require competent technical evidence.

> **Fresh air must have a designed route through the house. “Air finds a way” is not a ventilation strategy.**

## 1. System topology

~~~text
OUTSIDE AIR
    ↓
BACKGROUND INLETS
    ↓
HABITABLE ROOMS
    ↓
TRANSFER ROUTES / DOOR UNDERCUTS
    ↓
WET ROOMS
    ↓
EXTRACT TERMINALS
    ↓
RIGID EXTRACT DUCTS
    ↓
CENTRAL EXTRACT UNIT
    ↓
EXHAUST TERMINAL
    ↓
OUTSIDE
~~~

Purge ventilation remains a separate intermittent route through openable windows/openings.

## 2. Supported H1 arrangement

The base family requires:

- one central extract unit;
- unit located in an accessible internal service/plant zone;
- continuous extract from wet rooms;
- designed background air inlets to habitable rooms;
- designed transfer-air routes;
- openable-window purge route where the target requires it;
- one planned external exhaust termination;
- rigid or otherwise approved durable ductwork;
- duct routes inside declared service zones;
- no routine duct routing through structural members/permanent masonry except designed sleeves/openings;
- commissioning and handover evidence.

## 3. Plant geography

The central fan unit must not be placed merely where a void exists.

Preferred:

- walk-in plant/service room;
- accessible service riser enclosure;
- another full-access technical zone.

Avoid as H1 default:

- inaccessible loft corner;
- sealed ceiling void;
- location requiring removal of permanent finishes for fan replacement.

Required access includes:

- unit removal;
- fan/electrical service;
- duct connections;
- controls;
- cleaning where applicable.

## 4. Extract-room semantics

Wet-room extract nodes include, as applicable:

- kitchen;
- utility;
- bathroom;
- shower room;
- WC/sanitary accommodation.

The target owns minimum flow requirements.

The system model owns:

- room role;
- extract terminal identity;
- route to fan;
- duct geometry/evidence;
- high/boost mode where required;
- controls.

## 5. Habitable-room supply semantics

Outdoor make-up air enters habitable rooms through designed background ventilators.

The target owns:

- required equivalent area;
- number/location conditions;
- any target-version differences.

The family owns:

- inlet occurrence;
- host façade/window/wall;
- security/weather/acoustic/product evidence;
- maintenance/access.

A night-latch window position is not treated as a background ventilator.

## 6. Air-transfer semantics

Air must move from supplied habitable zones toward extract rooms.

Transfer routes can include:

- door undercuts;
- transfer grilles;
- open circulation paths.

The source records the route.

A floor-finish change that removes the designed undercut can therefore invalidate the ventilation route without invalidating the door's Part-M clear opening.

S1 already demonstrated this separation.

## 7. Ductwork

H1 principle:

> ducts are services and live in service geography.

Therefore extract ductwork should use:

- vertical service risers;
- accessible corridor/service ceiling zones;
- high-service-room service walls;
- planned sleeves.

Avoid:

- arbitrary drilling through joists;
- long concealed flexible duct;
- ducts trapped behind non-removable finishes.

Exact pressure-loss sizing and fan selection remain competent technical design.

## 8. External exhaust

The exhaust terminal is a first-class envelope penetration.

It must carry:

- façade/roof identity;
- weather seal;
- air boundary;
- thermal penetration;
- acoustic/noise implications;
- wind/exposure context;
- maintenance access;
- pest/bird protection where required.

One exhaust terminal is preferable to multiple ad-hoc wet-room penetrations in the base family.

## 9. Background-inlet comfort risk

CMEV intentionally uses outdoor inlets.

Therefore the compiler must retain context for:

- external noise;
- local air pollution;
- prevailing exposure;
- room layout relative to inlet;
- draught risk.

Where the target/site cannot support acceptable inlet placement:

**VENT-CMEV-01 = UNSUITABLE FOR SITE / SELECT ANOTHER FAMILY**

Do not force the system merely because it is simpler.

## 10. Failure behavior

### Central fan fails

Consequences:

- mechanical extract fails;
- background inlets remain physically present;
- purge windows remain available;
- target whole-dwelling ventilation is no longer satisfied in normal operation.

Required response:

- visible fault/maintenance obligation;
- accessible fan replacement;
- no demolition.

### One duct/terminal blocked

- affected extract route fails;
- other routes may remain intact;
- inspection/commissioning evidence becomes stale for affected branch.

This is a reasonably legible failure model.

## 11. Controls

Base family permits:

- continuous low/background operation;
- high/boost operation;
- humidity/occupancy demand control only where compatible with accepted evidence;
- manual occupant override where target/product route requires.

Do not make cloud connectivity or proprietary home automation a dependency of ventilation validity.

## 12. Kitchen source capture

VENT-CMEV-01 provides the **whole-house Part-F ventilation route**.

It does not pretend that a general kitchen extract terminal is always sufficient as the project's preferred cooking-pollutant source capture.

The Long-Life House may add:

**KITCHEN-SOURCE-CAPTURE-01**

as a separate future family.

That family must coordinate:

- cooker hood;
- exhaust;
- make-up air;
- pressure balance;
- grease;
- fire;
- maintenance.

Do not run grease-laden cooker-hood air through the central extract fan unless the selected system is explicitly designed for that duty.

## 13. Evidence

### Design evidence

- room roles;
- required airflow schedule;
- duct layout;
- pressure-loss/fan selection;
- background inlet schedule;
- controls.

### Product evidence

- fan performance;
- background vents;
- terminals;
- duct system;
- acoustic/weather/security data where relevant.

### Commissioning evidence

- measured flow rates;
- control operation;
- terminal settings;
- fan settings.

### Handover

- normal/boost operation;
- maintenance;
- fault response;
- inlet/terminal cleaning guidance;
- warning not to block vents/undercuts.

## 14. Mutations

### VENT-M01 — seal one background vent

Expected:

- affected room supply contribution fails/stales;
- wet-room duct topology remains current.

### VENT-M02 — replace carpet/flooring and remove door undercut

Expected:

- transfer-air route fails;
- door clear-opening/accessibility may remain valid.

### VENT-M03 — move fan into inaccessible loft void

Expected:

- maintenance geography fails;
- Part-F airflow may remain technically achievable.

### VENT-M04 — add wet room

Expected:

- new extract node;
- whole-dwelling rate and fan/duct evidence re-evaluate;
- unrelated envelope evidence remains current.

### VENT-M05 — external noise/pollution context worsens

Expected:

- background-inlet suitability re-evaluates;
- system may leave supported site envelope;
- triggers alternate-family consideration such as MVHR.

### VENT-M06 — target changes to successor F route

Expected:

- target-dependent equivalent areas/flows/evidence re-evaluate;
- physical duct topology may remain usable.

## 15. Complexity behavior

The author should select:

> central continuous extract ventilation

and identify:

- rooms;
- wet-room roles;
- habitable-room roles;
- service hub;
- exterior exhaust location.

The compiler derives:

- inlet requirements;
- extract nodes;
- transfer routes;
- flow/evidence obligations;
- commissioning;
- envelope penetrations.

The author does not individually create a Part-F checklist for every room.

## 16. H1 posture

~~~text
whole-house ventilation topology     SUPPORTED
wet-room extract route               SUPPORTED
habitable background-air route       SUPPORTED
transfer air                         SUPPORTED
purge contribution                   SUPPORTED / TARGET
duct sizing / fan selection          EXTERNAL COMPETENT DESIGN
product performance                  EXTERNAL PRODUCT EVIDENCE
commissioning                        FUTURE PHYSICAL EVIDENCE
noise/pollution site suitability     CONTEXT DEPENDENT
enhanced cooker source capture       FUTURE FAMILY
~~~

VENT-CMEV-01 is therefore sufficient as H1's first whole-house ventilation family.

## 17. Upgrade path

A later MVHR family may reuse:

- room roles;
- wet extract nodes;
- transfer routes;
- service hub;
- envelope intake/exhaust semantics;
- commissioning/evidence architecture.

The H1 choice therefore does not dead-end the model.

It deliberately defers the second supply-duct network, heat exchanger, filters and condensate until they are worth their complexity.
