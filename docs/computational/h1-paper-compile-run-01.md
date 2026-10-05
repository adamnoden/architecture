# H1-PAPER-01 — Complete Bounded-House Paper Compilation Run 01

**Run ID:** H1-PAPER-RUN-01  
**Source:** [H1-PAPER-01 Frozen Complete-House Source Package](h1-paper-source-package.md)  
**Research brief:** [H1-PAPER-01 Complete Bounded-House Research Brief](h1-paper-research-brief.md)  
**Date:** 2026-10-05  
**Implementation:** manual paper compilation  
**Release claim:** none

## 1. Headline result

### Research compile

**PASS — WHOLE-HOUSE PAPER SCALE**

The frozen H1 source composes one complete two-storey house using the existing semantic model and supported research families without introducing another intermediate abstraction or duplicating discipline-specific source models.

The run successfully composes:

- architectural hierarchy and route roles;
- complete ground/upper spatial topology;
- entrance and private stair;
- upper escape-window fire route;
- simple structural support topology;
- full external-envelope boundary graph;
- windows/door/corners/floor perimeter/roof;
- controlled wall/roof penetrations;
- passive-first hybrid ventilation topology;
- ASHP + radiator heating topology;
- clustered water/drainage/service core;
- upper wet-zone waterproofing;
- maintenance/access geography;
- external evidence dependencies;
- target/version obligations;
- selective invalidation under whole-house mutation.

### Building release

**FAIL — EXPECTED AND CORRECT**

The run does not contain the competent calculations, product selections, commissioned results and physical evidence required for a release-grade house.

No unresolved external proof is converted into a green tick.

### Complexity gate

**PROVISIONAL PASS AT WHOLE-HOUSE SCALE**

The source remains recognisably architectural.

The author does not manually maintain parallel structural, fire, ventilation, waterproofing or evidence models.

This is the most important positive result of the run.

## 2. Source-model / well-formedness compile

Building:

- one detached dwelling;
- two habitable storeys;
- rectangular 10.8 × 9.0 m footprint;
- no unsupported basement/garage/loft condition;
- one simple duo-pitched roof;
- one private stair;
- one principal entrance;
- one clustered wet/service core.

Storey relationships:

- ground FFL = 0;
- upper FFL = +3000 mm;
- roof above upper storey.

Space graph:

Ground:

- G-LIV-01;
- G-STUDY-01;
- G-DIN-01;
- G-KIT-01;
- G-UTIL-01;
- G-HALL-01;
- G-REARHALL-01;
- ST-01.

Upper:

- B-P01;
- B-S01;
- B-S02;
- BATH-01;
- U-SVC-01;
- L-01;
- ST-01.

No physical room is duplicated for discipline-specific reasoning.

**SOURCE MODEL: PASS**

## 3. Architectural hierarchy

Research grammar:

**G01-PILOT-P0**

Declared hierarchy remains legible:

- G-LIV-01 = principal ground room;
- G-STUDY-01 / G-DIN-01 = subordinate habitable rooms;
- B-P01 = principal upper bedroom;
- B-S01 / B-S02 = secondary bedrooms;
- G-HALL-01 / ST-01 = principal circulation;
- rear/service routes = secondary circulation;
- service core remains subordinate to arrival sequence.

The model does not infer rank simply from area or centring.

**HIERARCHY: PASS**

No claim is made that this proves Georgian quality.

## 4. Principal sequence / route roles

Principal arrival:

~~~text
OUTSIDE
  → ENTR-01
  → G-HALL-01
  → D-LIV-01
  → G-LIV-01
~~~

Vertical sequence:

~~~text
ENTR-01
  → G-HALL-01
  → ST-01
  → L-01
  → upper rooms
~~~

Secondary/service movement:

~~~text
G-HALL-01 / STAIR FIELD
  → G-REARHALL-01
  → G-UTIL-01 / service core
~~~

The geometry does not need to be copied into a separate service-route graph by the author.

Route roles are relationships on the shared spatial graph.

**ROUTE / SEQUENCE: PASS**

## 5. Scoped axis / façade order

AXIS-A01 contains:

- ENTR-01;
- principal arrival line;
- ST-01 route.

Front-opening relationships:

- WIN-LIV-01 = primary ground opening;
- WIN-STUDY-01 = secondary ground opening;
- WIN-BP01 aligns vertically with WIN-LIV-01;
- WIN-BS01 aligns vertically with WIN-STUDY-01.

No rule claims that the whole dwelling must be globally symmetrical.

**SCOPED ORDER: PASS**

## 6. Structural topology

Structural proof boundary:

**SAB-H1-01**

### Native / represented

- loadbearing external-wall identities;
- central-spine support identities;
- upper-floor spanning directions;
- stair-opening dependency;
- opening-head obligations;
- roof support relationships;
- foundation-support obligations;
- dependency from structural changes to external calculations/evidence.

### Whole-house topology

West upper-floor wing:

~~~text
WEST EXTERNAL WALL
   ↕ I-JOIST SPAN
WEST SPINE SUPPORT
~~~

East upper-floor wing:

~~~text
EAST SPINE SUPPORT
   ↕ I-JOIST SPAN
EAST EXTERNAL WALL
~~~

Central stair opening remains in the spine field rather than forcing an arbitrary room-scale transfer.

Roof:

~~~text
RF-TRUSS-DUO-01
   ↓
NORTH / SOUTH EXTERNAL SUPPORT LINES
   ↓
WALL SUPPORT GRAPH
   ↓
FOUNDATION EVIDENCE
~~~

No source condition requires an unsupported transfer beam.

### External unresolved proof

- member sizing;
- trimmers;
- connections;
- masonry capacities;
- global stability;
- truss design;
- foundation/geotechnical design.

**STRUCTURAL TOPOLOGY: PASS**  
**STRUCTURAL ADEQUACY: EXTERNAL / UNRESOLVED**

This is a valid research outcome under the declared assurance boundary.

## 7. Ground / foundation boundary

BF-GF-MCW-01 supplies the perimeter semantic route for:

- ground moisture;
- DPC/DPM relationship;
- air continuity;
- thermal continuity;
- floor/wall transition.

Foundation dimensions are not invented.

**GROUND-FLOOR / WALL BOUNDARY: SUPPORTED RESEARCH ROUTE**  
**FOUNDATION ADEQUACY: EXTERNAL**

## 8. External wall / corners

The rectangular form contains four ordinary external masonry corners.

Each contributes to the shared:

- weather graph;
- air graph;
- thermal graph;
- cavity/moisture graph.

Family:

**BF-CORNER-MCW-01**

There is no need for four bespoke corner rule sets.

**CORNER COMPOSITION: PASS**

## 9. Windows

Nine external window occurrences are represented by physical openings once.

Roles are layered onto those occurrences.

Examples:

WIN-BP01 participates simultaneously in:

- envelope boundary;
- purge/ventilation;
- Part-O analysis input;
- emergency escape;
- fall/security applicability;
- architectural façade order.

The compiler does not create a separate `fire window` object and a separate `ventilation window` object.

**WINDOW SEMANTICS: PASS**

Product/thermal/security/installation evidence remains occurrence/family scoped and external where declared.

## 10. Principal entrance

ENTR-01 composes:

- principal arrival;
- step-free threshold;
- final-exit role;
- security;
- air/weather/thermal boundary transitions;
- opening/head structural obligation;
- replacement semantics.

A single physical doorset participates in all scopes.

**ENTRANCE COMPOSITION: PASS**

Exact selected product and installation evidence remain external.

## 11. Roof

Family:

**RF-TRUSS-DUO-01**

Geometry stays inside the selected simple family:

- one ridge;
- two slopes;
- no hip/valley/dormer;
- no habitable loft.

The roof participates in:

- structural support;
- weather boundary;
- thermal/air boundary interfaces;
- ventilation terminal penetrations;
- soil-vent penetration;
- future rainwater drainage obligations.

**ROOF FAMILY APPLICABILITY: PASS**  
**TRUSS / CONNECTION ADEQUACY: EXTERNAL**

Rainwater drainage remains a partial/external ordinary-house obligation; no false full-family claim is made.

## 12. Controlled penetrations

Family:

**PEN-ENV-01**

Representative whole-house occurrences:

- kitchen source-capture wall duct;
- ASHP service wall crossing;
- hybrid ventilation roof terminal(s);
- drainage soil-vent roof terminal as required by technical design.

Each occurrence contributes separately to:

- WEATHER;
- AIR;
- THERMAL;
- CAVITY/MOISTURE;
- service-support;
- maintenance/replacement;
- fire/acoustic branches where applicable.

No generic `sealed` boolean is used.

**PENETRATION SEMANTICS: PASS**

Detail/product evidence remains external.

## 13. Fire / escape compile

Family:

**FIRE-H1-2S-EGRESS-01**

### Applicability

- two-storey detached dwelling;
- upper storey at +3.0 m;
- no habitable loft;
- no integral garage;
- ordinary stair;
- no open-plan kitchen/stair special condition.

**APPLICABILITY: PASS at research-family scope**

### Upper rooms

B-P01:

- WIN-BP01 carries ESCAPE role.

B-S01:

- WIN-BS01 carries ESCAPE role.

B-S02:

- WIN-BS02 carries ESCAPE role.

Frozen source assumptions provide the current route's required opening geometry.

**UPPER ESCAPE-WINDOW GEOMETRY: PASS against frozen research assumptions/target route**

### Ground rooms

G-LIV-01, G-STUDY-01 and G-DIN-01 each connect to circulation leading to ENTR-01 final exit.

Kitchen remains outside the unsupported open-plan-stair configuration.

**GROUND ESCAPE TOPOLOGY: PASS**

Alarm system:

**OBLIGATION GENERATED / PRODUCT + INSTALLATION EVIDENCE UNRESOLVED**

Whole fire result:

**RESEARCH-FAMILY PASS / COMPETENT EXTERNAL REVIEW OPEN**

## 14. Accessibility compile

Target route:

**M4(1) / Category 1 research baseline**

Source contains:

- step-free principal threshold;
- 2000 mm principal hall research dimension;
- direct entrance-storey room access;
- ground-floor WC;
- representative internal door clear openings;
- accessible service-control intent.

No authored source condition obviously contradicts the selected route.

**REPRESENTED CATEGORY-1 ROUTE: PASS at paper-research scope**

The target remains responsible for exact applicability/dimensional checks.

No Category 2/3 claim is made.

## 15. Passive-first environmental strategy

Governing hierarchy:

~~~text
REDUCE LOAD
   ↓
PASSIVE RESPONSE
   ↓
BOUNDED ASSISTANCE
   ↓
FULL MECHANICAL RESPONSE ONLY WHERE JUSTIFIED
~~~

The source does not use accidental infiltration as ventilation.

Airtightness remains a separate envelope obligation.

**ENVIRONMENTAL HIERARCHY: PASS**

## 16. Hybrid ventilation topology

Family:

**VENT-HYBRID-STACK-01**

### Inlet/source side

Purpose-provided outdoor-air obligations are generated for:

- G-LIV-01;
- G-STUDY-01;
- G-DIN-01;
- B-P01;
- B-S01;
- B-S02.

### Transfer

Shared room/door/circulation topology supplies transfer-route relationships.

The author does not draw a second ventilation-only house plan.

### Extract side

Extract zones:

- G-KIT-01;
- G-UTIL-01/WC;
- BATH-01.

Near-vertical routes use the east-rear service geography and terminate through PEN-ROOF-TERM-01.

### Assistance

Any bounded assist component is located in accessible service geography such as U-SVC-01.

### Separate obligations

- purge/openable windows;
- cooking source capture;
- whole-house airflow performance;
- noise/pollution/site suitability;
- Part-O overheating.

**VENTILATION TOPOLOGY: PASS**

But:

- actual flow rates;
- pressure behaviour;
- low-driving-force adequacy;
- assist control;
- energy consequence;
- acoustic/site performance

remain external specialist evidence.

**VENTILATION PERFORMANCE: UNRESOLVED / RELEASE BLOCKER**

This is the correct proof boundary.

## 17. Kitchen source capture

Cooking source capture remains distinct from whole-house ventilation.

The source contains a dedicated duct/penetration obligation.

The compiler does not pretend the general passive/hybrid kitchen extract node automatically proves preferred cooking-pollutant capture.

**SOURCE-CAPTURE TOPOLOGY: REPRESENTED**  
**DETAILED PERFORMANCE FAMILY: EXTERNAL / UNRESOLVED**

This non-blocking candidate gap remains visible rather than generating a fictitious family during the run.

## 18. Heating compile

Family:

**HEAT-ASHP-RAD-01**

Source composes:

- external ASHP occurrence;
- controlled wall penetration;
- accessible G-UTIL-01 plant/hydraulic zone;
- hot-water-cylinder relationship;
- low-temperature radiator occurrences;
- accessible room distribution geography.

No wet underfloor heating is embedded in the permanent floor.

**HEATING TOPOLOGY: PASS**

External unresolved:

- heat-loss calculations;
- design temperatures;
- emitter sizes;
- heat-pump selection;
- hydraulics;
- controls;
- external-unit acoustic/siting analysis;
- commissioning.

**HEATING TECHNICAL DESIGN: UNRESOLVED / RELEASE BLOCKER**

## 19. Potable water / hot water

WET-CORE-01 composes:

- incoming supply relationship;
- accessible valve/isolation cluster;
- cylinder;
- short kitchen branch;
- utility/WC branches;
- vertical bathroom riser;
- maintenance geography.

**WATER TOPOLOGY: PASS**

Sizing/pressure/hot-water-safety proof remains external.

## 20. Sanitary drainage

Source topology:

- BATH-01 stacked near wet core;
- soil/waste stack in east-rear service geography;
- short upper branches;
- ground WC/utility connections;
- kitchen branch;
- rodding/access;
- planned floor/substructure crossings.

**DRAINAGE TOPOLOGY: PASS**

External unresolved:

- pipe diameters;
- gradients;
- branch/stack sizing;
- below-ground layout;
- discharge/venting design;
- testing.

## 21. Wet-zone waterproofing

Occurrence:

**WZ-BATH-01**

Family:

**WZ-BSM-01**

The source supplies:

- substrate/wet-zone identity;
- shower fall/drain relation;
- corner/junction identities;
- pipe/control penetrations;
- drain transition;
- dry-side access relationship;
- hold point before tile/finish concealment.

The structured Mapeguard WP evidence trial is available as a product/system evidence example.

It does not prove the installed bathroom.

**WET-ZONE SEMANTICS: PASS**  
**PRODUCT/APPLICABILITY EVIDENCE: PARTIAL / SCOPED**  
**AS-BUILT WATERPROOFING EVIDENCE: FUTURE PHYSICAL**

## 22. Electrical / data geography

Family:

**SR-ROOM-LOW-01**

Source contains one accessible room-service geography rather than arbitrary buried wiring paths.

**ELECTRICAL/DATA GEOGRAPHY: PASS**

Electrical circuit design, protection, Part-P competent work and testing remain external.

## 23. Maintenance geography

### Plant

G-UTIL-01 provides access to:

- cylinder;
- hydraulic plant;
- valves;
- distribution interfaces;
- rodding/drainage access.

### Vertical services

U-SVC-01 / service riser provides access to:

- ventilation assistance where required;
- vertical routes;
- bathroom dry-side service relationships.

### Room systems

Radiator/service routes remain accessible by design intent.

### Penetrations

Service-side collars/connections remain accessible where the family/detail requires maintenance/replacement.

**MAINTENANCE GEOGRAPHY: PASS at source/family scope**

This pass is independent of technical operation.

## 24. Permanent-fabric doctrine compile

Golden rule under test:

> **No service is permitted inside the permanent fabric of the building.**

Whole-house result:

- active plant in service rooms/zones;
- water/drainage in riser/service geography;
- electrical/data in accessible low-level routes;
- radiator branches accessible;
- ventilation stacks use declared service geography;
- unavoidable envelope crossings are controlled PEN-ENV-01 transitions;
- unavoidable floor/service crossings are declared openings/sleeves rather than casually buried services.

No baseline source service requires routine destruction of structural masonry for maintenance.

**DOCTRINE CONFORMANCE: PASS at represented source scope**

## 25. Evidence/provenance compile

The whole-house run demonstrates four distinct evidence scopes.

### A — native/derived result

Examples:

- spatial connectivity;
- route role;
- source dimensions;
- family applicability conditions;
- dependency/invalidation graph.

### B — family/product evidence

Examples:

- window/doorset system data;
- membrane-system evidence;
- penetration collar/terminal evidence;
- ventilation components.

### C — external competent design evidence

Examples:

- structural calculations;
- ventilation airflow design;
- heating design;
- drainage/water sizing;
- Part-L/Part-O analysis;
- fire/building-control review.

### D — physical/as-built evidence

Examples:

- commissioning;
- airtightness;
- installation inspection;
- wet-zone hold points;
- penetration photographs;
- substitutions.

The compiler does not collapse these into one `evidence = true` state.

**EVIDENCE-SCOPE MODEL: PASS**

## 26. Whole-dwelling energy / overheating

The source supplies geometry and system choices relevant to later analysis.

But it does not contain a real dwelling energy/SAP calculation or Part-O assessment.

Therefore:

**PART L WHOLE-DWELLING PERFORMANCE: UNRESOLVED EXTERNAL**  
**PART O OVERHEATING: UNRESOLVED EXTERNAL**

This also prevents premature claims that hybrid ventilation is globally preferable to MVHR for the selected house.

## 27. Source-derived quantities

The paper compiler can derive basic geometry without a separate quantity model.

Baseline outputs:

- footprint = **97.20 m²**;
- two-storey gross bounding area = **194.40 m²**;
- external perimeter = **39.60 m**;
- nominal roof area ≈ **118.7 m²** before eaves/waste;
- ground habitable-room source area = **59.40 m²** if G-LIV/G-STUDY/G-DIN are counted as habitable rooms;
- upper bedroom source area = **59.40 m²**;
- scheduled external windows = **9**;
- principal entrance doorsets = **1**;
- upper escape-window roles = **3**;
- wet-zone occurrences = **1**;
- stair occurrences = **1**;
- primary service hubs = **1**.

The source therefore supports geometric take-off semantics.

It does **not** yet justify automatic commercial pricing, labour, waste or procurement assumptions.

## 28. Grouped author-facing issue surface

A poor implementation could expose hundreds of unresolved leaf obligations.

The whole-house paper compiler instead groups them into meaningful release blockers.

### ISSUE H1-EXT-01 — structural/foundation proof absent

Affected:

- floor;
- stair opening;
- wall/opening heads;
- roof;
- stability;
- foundations.

Author-facing meaning:

> Structural topology is coherent, but competent structural/foundation proof has not been attached.

### ISSUE H1-ENV-01 — whole-house environmental analysis absent

Affected:

- hybrid airflow adequacy;
- ventilation energy consequence;
- overheating;
- external noise/pollution context.

Author-facing meaning:

> Environmental topology is resolved; whole-house performance remains unproved.

### ISSUE H1-HEAT-01 — heating design absent

Affected:

- heat loss;
- ASHP capacity;
- radiator sizing;
- hydraulics;
- controls.

### ISSUE H1-WET-01 — water/drainage technical design absent

Affected:

- supply sizing;
- hot-water safety;
- drainage sizing/falls;
- below-ground route.

### ISSUE H1-ENERGY-01 — regulatory whole-dwelling analyses absent

Affected:

- Part L/SAP;
- Part O.

### ISSUE H1-FIRE-01 — competent fire/building-control review absent

The selected research family composes but is not externally validated.

### ISSUE H1-PROD-01 — occurrence-specific product evidence incomplete

Includes:

- selected windows/doors;
- wet-zone system occurrence;
- roof/penetration terminals;
- ventilation components;
- other selected construction systems.

### ISSUE H1-PHYS-01 — construction/commissioning evidence impossible yet

Correct state for a paper design.

This grouped surface is materially more legible than an unstructured list of every missing certificate.

## 29. Baseline release manifest posture

Conceptual result:

~~~text
SOURCE WELL-FORMED                 PASS
SUPPORTED-DOMAIN APPLICABILITY     PASS at research scope
ARCHITECTURAL PILOT                PASS
STRUCTURAL TOPOLOGY                PASS
ENVELOPE TOPOLOGY                  PASS
FIRE RESEARCH ROUTE                PASS / EXTERNAL REVIEW OPEN
ACCESS RESEARCH ROUTE              PASS
VENTILATION TOPOLOGY               PASS
HEATING TOPOLOGY                   PASS
WATER/DRAINAGE TOPOLOGY            PASS
WET-ZONE TOPOLOGY                  PASS
MAINTENANCE GEOGRAPHY              PASS
EVIDENCE SCOPING                   PASS
EXTERNAL TECHNICAL PROOF           INCOMPLETE
PHYSICAL / COMMISSIONING EVIDENCE  NOT YET POSSIBLE
BUILDING RELEASE                   FAIL
~~~

This is the intended distinction between a coherent resolved source model and a release-ready building.

# Mutation compilation

The frozen source defines twelve mutations.

The purpose is selective invalidation and domain falsification, not design optimisation.

## 30. H1-M01 — move wet/service core west

Mutation:

- move G-UTIL-01/U-SVC-01/service riser approximately 3000 mm west;
- keep room identities/external form.

Immediate consequences:

- BATH-01 wet-service alignment changes;
- vertical drain/vent routes are no longer naturally aligned;
- kitchen/utility branch lengths change;
- new upper-floor penetration locations are required;
- hybrid stack verticality/pressure model becomes stale;
- wet-zone dry-side access may be lost;
- maintenance routes re-evaluate;
- heating/service-distribution routes re-evaluate.

Unaffected unless secondary consequences are introduced:

- front façade hierarchy;
- ENTR-01;
- front escape windows;
- principal stair geometry;
- most external wall boundary evidence.

Result:

**CURRENT SERVICE CONFIGURATION: INVALID / STALE**

A valid re-layout may exist, but the compiler cannot claim it without re-solving/re-evidencing the affected networks.

**SELECTIVE INVALIDATION: PASS**

## 31. H1-M02 — raise upper floor to +3250 mm

Mutation:

- upper FFL +250 mm;
- ST-01 initial geometry unchanged.

Consequences:

- stair no longer lands on the authored upper FFL;
- stair rise/flight solution invalid in current occurrence;
- upper external-wall quantities/heights change;
- vertical service lengths change;
- structural geometry/evidence stales;
- escape-window absolute external heights/site relation may re-evaluate;
- roof support/eaves geometry may re-evaluate depending section strategy.

The selected ST-PRIVATE-01 family may still contain a valid re-parameterised stair.

Therefore the paper compiler may expose the research hint:

**RESOLVABLE WITHIN CURRENT FAMILY — POSSIBLE**

but current validity remains:

**FAIL / STALE**

The hint does not become a release state.

**FAMILY-RESOLVABILITY SEPARATION: PASS**

## 32. H1-M03 — fixed B-S01 window

Mutation:

WIN-BS01 remains physically glazed but loses required escape opening capability.

Consequences:

- masonry opening remains;
- weather/air/thermal window interface may remain valid;
- façade alignment remains valid;
- room remains habitable geometrically;
- upper fire-family escape route for B-S01 fails.

Result:

~~~text
ARCHITECTURAL ORDER       PASS
WINDOW BOUNDARY           MAY PASS
FIRE ESCAPE ROLE          FAIL
BUILDING RELEASE          FAIL
~~~

This is the required cross-role behaviour.

## 33. H1-M04 — incomplete membrane substitution

Mutation:

- substitute a nominally similar sheet membrane;
- retain old system tapes/corners/drain accessory evidence.

Geometry:

**UNCHANGED**

Consequences:

- wet-zone boundary extent remains authored;
- drain geometry remains authored;
- existing product/system evidence no longer proves compatibility;
- accessory/interface evidence becomes stale;
- as-built evidence remains absent as before.

Result:

**WET-ZONE GEOMETRY: PASS**  
**WATERPROOFING PRODUCT/SYSTEM EVIDENCE: FAIL / STALE**

This confirms that evidence is not attached merely to product category names.

## 34. H1-M05 — omit ASHP air collar

Mutation:

- exterior weather detail retained;
- ASHP service route retained;
- internal air-barrier collar omitted.

Consequences:

- WEATHER boundary may remain valid;
- service topology remains connected;
- HEATING topology remains valid;
- AIR boundary continuity fails;
- whole-house airtightness/evidence stales;
- thermal/moisture consequences may require re-evaluation.

Result:

**MULTI-BOUNDARY PENETRATION MODEL: PASS**

The compiler does not treat the penetration as generically sealed/unsealed.

## 35. H1-M06 — block B-P01 outdoor-air inlet

Mutation:

- purpose-provided normal-air inlet to B-P01 is sealed/blocked;
- escape/purge window remains operational.

Consequences:

- normal whole-house ventilation route for B-P01 fails/stales;
- transfer/extract networks elsewhere remain physically present;
- escape role remains valid;
- purge role remains available;
- window envelope may remain valid.

Result:

**VENTILATION NORMAL-OPERATION ROUTE: FAIL**  
**FIRE/PURGE/BOUNDARY ROLES: NOT AUTOMATICALLY FAILED**

Selective invalidation behaves correctly.

## 36. H1-M07 — remove hybrid assist capability

Mutation:

- passive stacks/inlets remain;
- bounded mechanical-assist capability removed;
- no replacement external analysis attached.

Consequences:

The physical passive route still exists.

However, the current family/evidence posture no longer guarantees required low-driving-force performance.

Result:

**PASSIVE TOPOLOGY: PRESENT**  
**NORMAL PERFORMANCE ADEQUACY: UNRESOLVED**  
**BUILDING RELEASE: FAIL**

The compiler correctly refuses to infer:

> passive path exists → ventilation requirement proved.

## 37. H1-M08 — move stair off AXIS-A01

Mutation:

- ST-01 centreline shifts +400 mm;
- rise/going/headroom/support assumptions kept technically feasible for the mutation test.

Consequences:

- scoped entrance/stair axis relation fails;
- principal arrival composition changes;
- stair technical geometry can still pass;
- fire route may remain connected;
- structure may require local evidence update depending exact support relationship.

Core result:

~~~text
TECHNICALLY PLAUSIBLE
+
ARCHITECTURALLY WRONG AGAINST DECLARED PILOT PROFILE
~~~

**ARCHITECTURAL / TECHNICAL VALIDITY SEPARATION: PASS**

## 38. H1-M09 — invert front opening hierarchy

Mutation:

WIN-STUDY-01 becomes visually/nominally dominant over WIN-LIV-01 while room ranks stay fixed.

Consequences:

- G01-PILOT opening-rank relationship fails/deviates;
- lintel/head evidence stales;
- window product evidence stales;
- thermal/opening quantities change;
- ventilation/purge capability must re-evaluate only where dependent.

Result:

**ARCHITECTURAL PILOT: FAIL/DEVIATION**  
**BUILDING MAY REMAIN TECHNICALLY RESOLVABLE**

Again, architectural failure is not disguised as a statutory failure.

## 39. H1-M10 — remove spine support / demand transfer

Mutation:

- remove a required central support segment;
- demand long-span transfer without selecting a supported transfer family.

The compiler knows that the previous support graph no longer carries the same load path.

It does not auto-invent a steel beam.

Result:

**OUTSIDE H1 SUPPORTED STRUCTURAL DOMAIN**

Required output:

> External structural redesign / another supported structural family required.

This is not equivalent to:

- definitely impossible;
- probably okay;
- automatically solved.

**UNSUPPORTED-STATE BEHAVIOUR: PASS**

## 40. H1-M11 — open kitchen to stair

Mutation:

- remove separation so ordinary escape/circulation condition passes through an open kitchen/stair arrangement.

Spatially the plan may become more open and attractive to some occupants.

But the selected fire family explicitly excludes this condition.

Result:

**ARCHITECTURAL SOURCE: WELL-FORMED**  
**FIRE-H1-2S-EGRESS-01: NOT APPLICABLE / OUTSIDE FAMILY**  
**ALTERNATE FIRE STRATEGY: REQUIRED**

The compiler does not create special fire-engineering logic merely to preserve the mutation.

## 41. H1-M12 — block plant withdrawal volume

Mutation:

- fixed joinery prevents replacement/service withdrawal of cylinder/hydraulic plant;
- connections remain technically possible.

Consequences:

- heating/water network connectivity may remain valid;
- equipment may even operate;
- maintenance geography fails;
- Long-Life House doctrine fails;
- replacement plan/evidence invalid.

Result:

~~~text
SYSTEM CONNECTIVITY       PASS
CURRENT OPERATION         POSSIBLY PASS
MAINTENANCE GEOGRAPHY     FAIL
DOCTRINE CONFORMANCE      FAIL
~~~

This proves maintenance is not merely a note attached to technical validity.

# Whole-run assessment

## 42. Required outcome classes achieved

### Technically invalid but architecturally coherent

Examples:

- H1-M03 fixed escape window;
- H1-M05 broken air seal;
- H1-M06 blocked inlet.

### Technically plausible but architecturally wrong

Examples:

- H1-M08 stair-axis drift;
- H1-M09 inverted opening hierarchy.

### Outside supported domain

Examples:

- H1-M10 unsupported transfer;
- H1-M11 alternate fire strategy.

### Current occurrence invalid but plausibly resolvable within family

Example:

- H1-M02 upper-floor height change / stair re-solve.

### Geometry valid but evidence stale

Example:

- H1-M04 membrane-system substitution.

The mutation suite therefore exercises all required validity classes.

## 43. Cross-domain invalidation result

The model does not require every mutation to invalidate the entire building graph.

Observed dependency behaviour is meaningfully scoped.

Examples:

- fixed escape window → fire role fails without erasing weather boundary;
- membrane substitution → wet-zone evidence fails without moving bathroom geometry;
- missing air collar → air boundary fails without disconnecting heating pipes;
- service-core move → services/wet/ventilation evidence stales without changing front architectural order;
- opening hierarchy change → architecture + local structure/product evidence change, not drainage;
- plant access obstruction → maintenance/doctrine fail without necessarily breaking network connectivity.

**SELECTIVE INVALIDATION: WHOLE-HOUSE PAPER PASS**

## 44. Evidence invalidation result

H1-PAPER demonstrates that evidence dependencies can remain narrower than physical-object identity.

A physical object can remain while one evidence proposition becomes stale.

Examples:

- same window, lost escape evidence;
- same wet-room geometry, lost membrane-system evidence;
- same service penetration, lost air-boundary evidence;
- same stair family, occurrence geometry stale after storey-height change.

**EVIDENCE DEPENDENCY MODEL: PASS**

## 45. Family-count / catalogue risk

H1-PAPER did **not** require a new family simply because the model became a complete house.

The complete house reused:

- existing spatial/entity semantics;
- boundary families;
- structural assurance boundary;
- entrance/stair/roof/fire families;
- environmental/service families;
- wet-zone family;
- penetration family.

This matters.

If whole-house scale had immediately required dozens of new special cases, the compiler concept would be in serious trouble.

Current result:

**FAMILY-CATALOGUE RISK: PRESENT BUT NOT YET DOMINANT**

Guardrail remains:

> create a new family only for a genuinely different topology/proof route, not because a detail has a name.

## 46. Authoring-burden audit

The frozen source is long because this is a research record, not because a future author should manually type it.

Semantically the author supplied a finite set of architectural decisions:

- footprint/storeys;
- room arrangement;
- openings;
- stair;
- route/hierarchy intentions;
- structural support intent;
- wet/service-core location;
- supported construction/system choices;
- plant/terminal locations;
- selected evidence references.

Derived consequences included:

- fire escape roles;
- ventilation inlet/extract obligations;
- envelope boundary obligations;
- structural opening/support obligations;
- maintenance obligations;
- target checks;
- evidence invalidation.

No second discipline model was needed.

**AUTHORING COMPLEXITY GATE: PROVISIONAL PASS**

Future software must preserve this asymmetry.

## 47. The largest remaining risks after H1-PAPER

The paper model surviving does not remove the hardest real-world risks.

They are now clearer.

### Risk A — external competent attack may expose incorrect assumptions

Especially:

- fire-family completeness;
- regulatory applicability;
- structural assurance boundaries;
- ventilation performance/evidence route;
- boundary-detail assumptions.

### Risk B — evidence integration may be harder in software than on paper

Real product data is inconsistent, proprietary and versioned.

### Risk C — geometry solving may create complexity not visible on paper

The semantic model has not yet been forced through a real geometry/constraint solver.

### Risk D — interactive re-solving could become opaque

A future authoring system must explain why a valid range/alternative exists rather than behave like a black-box optimiser.

### Risk E — regulations/standards licensing and interpretation remain substantial

The paper model can cite sources; executable rule packs need a deliberate legal/provenance strategy.

### Risk F — physical workmanship remains outside digital proof

The release architecture must connect inspection/commissioning evidence back into the build without pretending the compiled model guarantees workmanship.

## 48. What H1-PAPER does prove internally

Within the limits of a manual research exercise, the project has demonstrated that:

1. one semantic building source can support several technical/architectural views;
2. obligations can be derived at different scopes from shared physical entities;
3. architectural validity can differ from technical validity;
4. unsupported can remain distinct from failed;
5. external evidence can discharge scoped obligations without becoming hidden native truth;
6. evidence can be invalidated selectively;
7. family re-solving can be discussed without confusing possible solvability with current validity;
8. ordinary services/boundaries can compose at whole-house scale without a universal MEP ontology;
9. maintenance/replacement can remain first-class validity dimensions;
10. whole-house paper scale has not yet forced duplicate BIM-like source models.

These are meaningful research results.

They are not evidence that the future software will automatically be tractable.

## 49. What H1-PAPER does not prove

It does not prove:

- the structure is adequate;
- the foundations work on a real site;
- Part L is satisfied;
- Part O is satisfied;
- the hybrid ventilation system performs adequately in this house;
- the heat pump/emitter system is correctly sized;
- drainage/water systems are technically sized;
- the fire strategy has passed competent review;
- any particular product is correctly installed;
- the building is buildable at a known price;
- the eventual solver/UI/data architecture is practical;
- the house is Georgian;
- the house is beautiful;
- the built result will match the model.

Any future summary that implies these would overstate the work.

## 50. H1-PAPER-01 verdict

### Central research proposition

> Can the current semantic/obligation/evidence abstraction compose one complete bounded house without collapsing into duplicate discipline models or family explosion?

**PROVISIONAL YES.**

### Internal paper-compilation gate

**PASS.**

### Building release

**FAIL — EXPECTED.**

### External competent validation

**OPEN.**

### Recommendation

Proceed immediately to the final red-team / capability freeze.

Do **not** add H2-PAPER, S3, a wider supported domain or new pre-implementation families first.
