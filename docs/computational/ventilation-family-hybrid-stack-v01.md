# Ventilation Family VENT-HYBRID-STACK-01 — Hybrid Passive-Stack Ventilation

**Status:** H1 research-supported topology — external specialist performance proof required  
**Purpose:** define a passive-first whole-house ventilation topology with bounded mechanical assistance available when natural driving forces are insufficient.  
**Regulatory posture:** non-prescriptive/specialist route; exact compliance belongs to the selected compiler target and scoped external evidence.  
**Engineering status:** airflow design, control logic, terminal/inlet performance and verification require competent specialist evidence.  
**Evidence gate:** [Hybrid Ventilation Evidence Trial 01](h1-hybrid-ventilation-evidence-trial-v01.md) passed feasibility/evidence-boundary review, not project performance.

## 1. Principle

The family deliberately separates:

- the **airflow path**, which exists without a fan;
- the **natural driving forces**, which should do useful work whenever available;
- the **assist mechanism**, which closes the performance deficit when natural forces are inadequate.

Base topology:

~~~text
OUTSIDE AIR
    ↓
PURPOSE-PROVIDED HABITABLE-ROOM INLETS
    ↓
HABITABLE / DRY ROOMS
    ↓
DESIGNED TRANSFER ROUTES
    ↓
WET ROOMS
    ↓
EXTRACT GRILLES
    ↓
NEAR-VERTICAL PASSIVE STACK DUCTS
    ↓
LOW-PRESSURE ASSIST / ROOF TERMINAL
    ↓
OUTSIDE
~~~

Purge ventilation is separate:

~~~text
OPENABLE / SECURE PURGE OPENINGS
    ↔
ROOM / DWELLING
    ↔
CROSS / STACK PURGE PATH
~~~

## 2. H1 geometry

The bounded H1 research arrangement assumes:

- detached two-storey dwelling;
- deliberate low-infiltration envelope;
- clustered wet/service core;
- habitable rooms capable of receiving purpose-provided outdoor air;
- internal transfer paths from dry to wet zones;
- one or more short, predominantly vertical extract stacks;
- stacks routed through declared service geography rather than improvised through structure;
- roof termination with known wind/pressure performance;
- optional low-pressure assist located at or near the high point of the stack system, or another location whose stopped-state resistance is proven acceptable;
- openable-window/secure-opening purge route independent of the background system.

This is an H1 research boundary, not a generic HSA restriction. Flats, tall dwellings and complex shared shafts would require separate family work.

## 3. Airtight envelope

The family does **not** use accidental infiltration as an airflow component.

The source model must contain explicit supply occurrences.

Airtightness evidence and ventilation evidence remain separate.

A change that creates uncontrolled leakage does not improve the ventilation-family result; it creates an envelope defect and may invalidate the airflow design assumptions.

## 4. Outdoor-air inlets

Outdoor air should normally enter habitable/dry rooms before moving toward wet extract zones.

The family records for each inlet:

- host wall/window assembly;
- equivalent/free-area or product flow characteristic as appropriate to the evidence route;
- controllability;
- weather resistance;
- acoustic performance;
- external pollution context;
- security implications;
- maintenance/cleaning access;
- draught/throw relationship to the occupied zone.

A night-latch window position is not the background-air strategy.

Automatic or humidity-sensitive inlets may be supported where their performance evidence is explicit; they are not assumed by the base semantic family.

## 5. Internal transfer

The airflow path from dry rooms to wet rooms is explicit.

Possible transfer elements include:

- door undercuts;
- transfer grilles;
- open circulation routes;
- other evidence-backed low-resistance transfer elements.

The model records the route rather than merely recording that a door exists.

Flooring or door replacement can therefore stale the ventilation route without changing the room geometry.

## 6. Wet-room extract nodes

Candidate nodes include:

- bathroom;
- shower room;
- utility;
- WC/sanitary accommodation;
- kitchen background extract where coordinated with separate cooking source capture.

The wet-core arrangement is useful because it can place several stack ducts inside one accessible vertical service geography without requiring long horizontal extract branches.

The default is **not** to combine arbitrary wet-room branches into one duct merely to save space.

Any shared-stack/manifold arrangement must address:

- cross-flow between rooms;
- reverse flow;
- pressure interaction;
- fire/acoustic implications where applicable;
- cleaning/access;
- product/system evidence.

Parallel segregated ducts inside one riser remain a valid H1 research arrangement.

## 7. Stack geometry

Passive performance is sensitive to resistance and driving pressure.

Therefore the family prefers:

- short routes;
- near-vertical ducts;
- few bends;
- smooth durable ductwork;
- no long crushed/flexible runs;
- protected/insulated treatment through cold spaces where required to manage condensation and preserve buoyancy;
- planned roof penetrations and terminals.

Exact permitted offsets, diameters and pressure-loss limits are **external technical design**, not invented compiler constants.

Geometry outside the evidence envelope returns:

**UNSUPPORTED / SPECIALIST REDESIGN REQUIRED**

rather than being silently approximated.

## 8. Roof terminal

The terminal is part of the airflow engine, not decorative roof furniture.

It must carry evidence for relevant:

- wind-pressure behaviour;
- rain/weather exclusion;
- bird/pest protection;
- aerodynamic resistance;
- reverse-flow behaviour;
- maintenance;
- roof-boundary penetration;
- visual/architectural integration.

Any computational representation must coordinate the terminal with the selected roof and controlled envelope-penetration families rather than treating it as an isolated product.

## 9. Mechanical assistance

The assist system exists to guarantee performance where passive driving pressure is inadequate.

Preferred characteristics:

- low operating pressure compatible with the passive-stack geometry;
- accessible and replaceable active component;
- stopped state that does not materially obstruct the passive route, demonstrated by product/system evidence;
- local controls independent of cloud services;
- low-noise operation;
- explicit fault state;
- manual boost/override where appropriate;
- no demolition required for replacement.

The family does not select a manufacturer or exact fan form.

A roof-mounted hybrid fan is one precedent, not a default product specification.

## 10. Operating modes

### Mode P — passive

Natural wind/buoyancy forces provide adequate ventilation.

Assist power is not required except controls/monitoring where applicable.

### Mode A — assisted background

Natural driving pressure is below the proven requirement.

Low-pressure assistance increases extract sufficiently to restore the required background performance.

### Mode B — temporary boost

A high local moisture/pollutant event requires greater extraction than background operation.

Boost may be automatic and/or occupant initiated depending on the accepted design route.

### Mode F — fault / power loss

The active assist is unavailable.

The passive airflow path should remain physically open where the chosen product/system allows.

This is **graceful degradation**, not an assertion of continued regulatory compliance.

The building record must distinguish:

- residual passive capability;
- required repair obligation;
- any conditions under which purge/manual action is needed until repair.

## 11. Control semantics

The source should declare the control intent, not hand-code a proprietary controller.

Possible evidence-backed inputs include:

- airflow / differential pressure;
- indoor/outdoor temperature;
- wind condition;
- relative humidity;
- occupancy/pollutant demand;
- user boost.

The exact algorithm must demonstrate that the ventilation obligation remains satisfied across the accepted operating envelope.

A control scheme that merely waits for visible condensation is not adequate.

## 12. Performance envelope

The family is not trusted merely because the topology is plausible.

External competent analysis must cover representative adverse conditions including:

### Weak natural driving force

- low wind;
- small indoor/outdoor temperature difference;
- warm shoulder/summer conditions.

Expected result:

- assist duty is calculated;
- required airflow remains available.

### Strong wind / cold weather

Expected analysis:

- excessive extraction;
- cold-air draught;
- heat loss;
- control/throttling response;
- noise.

### Adverse pressure

Expected analysis:

- reverse flow;
- room-to-room cross-flow through stack arrangements;
- terminal location effects.

### Moisture event

Expected analysis:

- wet-room vapour removal;
- control/boost response;
- moisture criteria over relevant periods.

### Site external conditions

Expected analysis:

- air pollution;
- façade/roof noise;
- security;
- exposure.

## 13. Energy consequence

The base family has no heat recovery.

That is a significant trade-off, not a footnote.

A real whole-house energy study must compare:

- ventilation heat loss;
- fan energy in assisted operation;
- inlet comfort implications;
- plausible CMEV case;
- plausible MVHR case including heat recovery and fan energy.

If MVHR produces materially better whole-building energy/comfort with an acceptable maintenance architecture, the passive-first hierarchy permits MVHR to win.

## 14. Cooking source capture

Grease- and pollutant-heavy cooker extract is not routed through passive background stacks by default.

Cooking source capture should coordinate with this family for:

- direct external exhaust;
- make-up air;
- pressure interaction;
- hood capture performance;
- grease cleaning;
- fire;
- noise;
- envelope penetration.

Using a powerful cooker hood can temporarily change the pressure regime of the whole house and therefore belongs in the ventilation interaction model.

## 15. Purge and overheating

VENT-HYBRID-STACK-01 contributes to background ventilation and source moisture removal.

It may also contribute useful stack flow in summer, but no such credit is assumed automatically.

Overheating obligations remain separate and may be discharged through:

- solar-gain control;
- cross ventilation;
- purge openings;
- secure night ventilation;
- ceiling fans;
- other accepted passive means;
- mechanical cooling only where necessary.

## 16. Maintenance geography

Routine access should be possible for:

- inlet cleaning/inspection;
- wet-room grille cleaning;
- assist fan removal/replacement;
- control/sensor service;
- accessible stack inspection points where the technical design requires them;
- terminal inspection from a safe planned route.

The roof-terminal maintenance obligation composes with HSA maintenance geography.

The relevant principle is not “no active component may ever enter permanent fabric”; it is that shorter-lived components and their maintenance/replacement paths should be deliberately separated from longer-lived construction where proportionate.

## 17. Evidence model

### Design evidence

- room roles;
- inlet schedule;
- transfer-air paths;
- stack geometry;
- terminal selection/location;
- multizone/airflow performance analysis or accepted equivalent method;
- assist/control strategy;
- interaction with cooker source capture;
- interaction with overheating strategy.

### Product/system evidence

- inlet characteristics;
- extract-grille characteristics;
- stack duct characteristics where relevant;
- roof-terminal pressure/flow/weather data;
- assist fan pressure/flow/noise/power data;
- stopped-fan resistance where passive mode depends on it;
- control/sensor performance.

### Site-context evidence

- external noise;
- external air quality;
- exposure / relevant pressure assumptions.

### Physical/as-built evidence

- installation inspection;
- duct/terminal conformity;
- controls functional test;
- measured/verified performance appropriate to the accepted specialist design;
- handover instructions.

## 18. Mutations

### HST-M01 — block one habitable inlet

Expected:

- affected supply path invalidates;
- stack geometry remains current;
- whole-house airflow evidence becomes stale.

### HST-M02 — add two 90° bends to a stack

Expected:

- topology remains representable;
- pressure-loss/performance evidence becomes stale;
- family may leave supported evidence envelope.

### HST-M03 — move wet room away from service core

Expected:

- stack route re-solves;
- long horizontal branch may trigger unsupported/specialist result;
- unrelated architectural roles remain current.

### HST-M04 — assist fan fails

Expected:

- powered guarantee fails;
- passive residual capability remains recorded if physically available;
- release validity fails until repaired unless external evidence proves the current conditions are fully satisfied without assist.

### HST-M05 — replace fan with a unit that blocks stopped airflow

Expected:

- product substitution invalidates passive-mode evidence;
- may still be technically usable as a mechanical extract family, but not as this hybrid family without re-evaluation.

### HST-M06 — severe traffic-noise / pollution context introduced

Expected:

- inlet suitability re-evaluates;
- migration toward filtered/balanced ventilation may be suggested;
- no forced compile pass.

### HST-M07 — cooker hood flow substantially increased

Expected:

- pressure/make-up-air interaction becomes stale;
- stack family itself is not silently assumed unaffected.

### HST-M08 — summer overheating model changes

Expected:

- background ventilation evidence may remain current;
- purge/overheating obligation re-evaluates separately.

## 19. Authoring complexity

The author should not draw a fluid-dynamics network manually.

They should select a supported or project-approved ventilation family and identify:

- habitable/dry rooms;
- wet rooms;
- service core/riser;
- candidate roof termination zone;
- external context constraints.

A future implementation may derive candidate:

- inlet occurrences;
- transfer routes;
- stack nodes/routes;
- envelope penetrations;
- evidence obligations;
- maintenance obligations.

A specialist discharges the actual airflow/performance proof.

## 20. H1 posture

~~~text
passive/assisted topology               RESEARCH-SUPPORTED
purpose-provided inlet route            RESEARCH-SUPPORTED SEMANTICS
transfer-air route                      RESEARCH-SUPPORTED SEMANTICS
stack geography                         RESEARCH-SUPPORTED SEMANTICS
passive airflow performance             EXTERNAL SPECIALIST EVIDENCE
assist fan performance                  EXTERNAL PRODUCT + DESIGN EVIDENCE
control logic                            EXTERNAL DESIGN / PRODUCT EVIDENCE
site noise/pollution suitability        CONTEXT + EXTERNAL EVIDENCE
purge contribution                      SEPARATE TARGET OBLIGATION
energy comparison                       EXTERNAL WHOLE-HOUSE ANALYSIS
as-built verification                   PHYSICAL EVIDENCE
~~~

## 21. Promotion boundary

The [Hybrid Ventilation Evidence Trial](h1-hybrid-ventilation-evidence-trial-v01.md) has already promoted the **topology** from candidate to research-supported H1 status. It has not promoted technical performance to native compiler proof or established a Reference House selection.

Further promotion would require a real bounded house configuration with competent airflow design, product/system evidence and as-built verification. Failure to promote remains an acceptable result; CMEV or MVHR may be the better project family.

## 22. Source anchors

- Approved Document F, Volume 1, 2026 edition: https://www.gov.uk/government/publications/approved-document-f-2026
- Future Homes Standard consultation government response (2021): https://www.gov.uk/government/consultations/the-future-homes-standard-changes-to-part-l-and-part-f-of-the-building-regulations-for-new-dwellings
- BRE IP 13/94 listing: https://www.thenbs.com/PublicationIndex/documents/details?DocId=83994&Pub=BRE
- Scottish technical-handbook description of PSV physics and BRE IP 13/94 route (useful technical precedent, not the England compliance target): https://www.gov.scot/publications/building-standards-technical-handbook-2019-domestic/3-environment/3-14-ventilation/
- Turner & Walker, controlled passive/hybrid residential ventilation study: https://www.sciencedirect.com/science/article/pii/S0360132313002229
- Aereco hybrid ventilation and VBP technology — product/technology precedent only: https://www.aereco.co.uk/ventilation/ventilation-systems-uk/hybrid-ventilation/ and https://www.aereco.co.uk/products/exhaust-fans-uk/vbp-plus/