# Ventilation Family VENT-CMEV-01 — Central Continuous Mechanical Extract

**Status:** H1 paper-domain fallback / alternate family v0.1  
**Purpose:** define one bounded whole-house mechanical-extract topology whose service geography, failure mode and maintenance burden are explicit.  
**Target posture:** valid under the S0/S1 pre-2027 Part-F target route; also recognised as a system type in Approved Document F 2026.  
**Engineering status:** airflow design, commissioning and product performance require competent technical evidence.

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

## 2. H1 arrangement

The bounded family contains:

- one central extract unit;
- unit located in an accessible internal service/plant zone;
- continuous extract from wet rooms;
- designed background air inlets to habitable rooms;
- designed transfer-air routes;
- openable-window purge route where the target requires it;
- one planned external exhaust termination;
- rigid or otherwise approved durable ductwork;
- duct routes inside declared service geography;
- designed structural/envelope crossings rather than opportunistic drilling;
- commissioning and handover evidence.

This is an H1 research family, not an HSA requirement that houses use central mechanical extract.

## 3. Plant geography

The central fan unit must not be placed merely where a void exists.

Preferred:

- walk-in plant/service room;
- accessible service riser enclosure;
- another full-access technical zone.

Avoid as H1 default:

- inaccessible loft corner;
- sealed ceiling void;
- location requiring destructive removal of longer-lived finishes for fan replacement.

Required access includes:

- unit removal;
- fan/electrical service;
- duct connections;
- controls;
- cleaning where applicable.

## 4. Extract-room semantics

Wet-room extract nodes include, as applicable:

- kitchen background extract;
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
- target-version differences.

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

A floor-finish change that removes a designed undercut can therefore invalidate the ventilation route without invalidating unrelated door geometry.

## 7. Ductwork

Ductwork should use declared service geography such as:

- vertical service zones;
- accessible corridor/service ceiling zones;
- high-service-room service walls;
- planned sleeves.

Avoid:

- arbitrary drilling through structure;
- long concealed flexible duct;
- ducts trapped behind finishes that must be destroyed for routine replacement or repair.

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

The bounded family uses one deliberate exhaust rather than multiplying ad-hoc wet-room penetrations.

## 9. Background-inlet comfort risk

CMEV intentionally uses outdoor inlets.

Therefore the model must retain context for:

- external noise;
- local air pollution;
- prevailing exposure;
- room layout relative to inlet;
- draught risk.

Where the site cannot support acceptable inlet placement, the family may be inappropriate. Simpler computational representation is not a reason to force it.

## 10. Failure behaviour

### Central fan fails

Consequences:

- mechanical extract fails;
- background inlets remain physically present;
- purge windows remain available;
- target whole-dwelling ventilation is no longer satisfied in normal operation.

Required response:

- visible fault/maintenance obligation;
- accessible fan replacement;
- no destructive opening merely to reach the fan.

### One duct/terminal blocked

- affected extract route fails;
- other routes may remain intact;
- inspection/commissioning evidence becomes stale for the affected branch.

## 11. Controls

The family permits:

- continuous low/background operation;
- high/boost operation;
- humidity/occupancy demand control where compatible with accepted evidence;
- manual occupant override where target/product route requires.

Cloud connectivity or proprietary home automation should not become a proof dependency.

## 12. Kitchen source capture

VENT-CMEV-01 is a whole-house background ventilation family. It does not establish the project's preferred cooking-pollutant source capture.

`HSA-P-010 — Source-Capture Kitchen Extract` remains a separate architectural pattern and may require a dedicated cooker extract route coordinated with:

- make-up air;
- pressure balance;
- grease;
- fire;
- maintenance;
- envelope penetration.

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

### VENT-M02 — replace flooring and remove door undercut

Expected:

- transfer-air route fails;
- unrelated door/accessibility geometry may remain valid.

### VENT-M03 — move fan into inaccessible loft void

Expected:

- maintenance geography fails;
- airflow may remain technically achievable.

### VENT-M04 — add wet room

Expected:

- new extract node;
- whole-dwelling rate and fan/duct evidence re-evaluate;
- unrelated envelope evidence remains current.

### VENT-M05 — external noise/pollution context worsens

Expected:

- background-inlet suitability re-evaluates;
- family may become unsuitable for the site;
- filtered/balanced alternatives become more credible.

### VENT-M06 — target changes

Expected:

- target-dependent equivalent areas/flows/evidence re-evaluate;
- physical duct topology may remain usable.

## 15. Authoring complexity

The author should select the ventilation family and identify:

- rooms;
- wet-room roles;
- habitable-room roles;
- service hub;
- exterior exhaust location.

A future implementation may derive:

- inlet requirements;
- extract nodes;
- transfer routes;
- flow/evidence obligations;
- commissioning obligations;
- envelope penetrations.

The author should not maintain a room-by-room regulatory checklist by hand when the semantic model can derive it.

## 16. H1 posture

~~~text
whole-house ventilation topology     RESEARCH-SUPPORTED FALLBACK
wet-room extract route               RESEARCH-SUPPORTED
habitable background-air route       RESEARCH-SUPPORTED
transfer air                         RESEARCH-SUPPORTED
purge contribution                   TARGET / SEPARATE OBLIGATION
duct sizing / fan selection          EXTERNAL COMPETENT DESIGN
product performance                  EXTERNAL PRODUCT EVIDENCE
commissioning                        PHYSICAL EVIDENCE
noise/pollution site suitability     CONTEXT DEPENDENT
cooking source capture               SEPARATE PATTERN / SYSTEM
~~~

VENT-CMEV-01 remains a useful bounded fallback and the historical S2 ventilation family. It was superseded as the **preferred H1 research direction** by VENT-HYBRID-STACK-01; it was not invalidated technically.

## 17. Relationship to Reference House

Reference House ventilation selection remains open. CMEV may outrank the hybrid route where site conditions, external noise/pollution, winter comfort, maintenance burden or specialist performance evidence make it the stronger whole-building answer.

An H1 fallback family is evidence available to the project, not a project decision.