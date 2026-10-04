# Roof Family RF-TRUSS-DUO-01 — Simple Duo-Pitched Trussed-Rafter Cold Roof

**Status:** supported-family research candidate v0.1  
**Purpose:** close the first ordinary roof gap in H1 with a deliberately narrow UK domestic roof family that fits the project's structural-assurance boundary.  
**Structural status:** geometry/support/bracing roles native; truss/member/connection adequacy supplied as scoped manufacturer/engineer evidence under SAB-H1-01.  
**Construction status:** research family, not construction specification.

> **The first supported roof should be ordinary enough that the compiler learns roof architecture rather than becoming a roof-engineering project.**

## 1. Family proposition

RF-TRUSS-DUO-01 represents a simple prefabricated timber trussed-rafter roof over a low-rise detached dwelling.

Base family:

- duo-pitched roof;
- straight rectangular ridge line;
- ordinary masonry support walls;
- uninhabited loft/roof void;
- thermal/air boundary at ceiling level;
- conventional external roof covering;
- eaves drainage;
- no room-in-roof;
- no dormers;
- no large rooflights;
- no chimney interruption in the base family;
- no intersecting valleys;
- no complex hips in v0.1.

This is intentionally narrower than what trussed rafters can physically achieve.

The supported domain should be smaller than the industry's full capability.

## 2. Why trussed rafters fit H1 v0

The Trussed Rafter Association describes trussed rafters as factory-designed and manufactured components for masonry, timber-frame and steel-frame buildings. TRA members use Eurocode 5 for new trussed-rafter design work.

That procurement model aligns naturally with SAB-H1-01:

~~~text
COMPILER
  owns:
    roof geometry
    support topology
    occurrence identity
    roof/wall interfaces
    boundary continuity
    evidence dependencies

TRUSS DESIGNER / MANUFACTURER
  supplies scoped evidence for:
    truss structural design
    member forces/capacity
    connector-plate design
    project truss layout/design data
    truss-specific bracing requirements
~~~

The compiler does not need to reinvent proprietary truss-design software to understand the roof.

## 3. Semantic entities

At minimum the family contains:

- ROOF-R01;
- RIDGE-R01;
- PITCH-SOUTH / PITCH-NORTH roof fields;
- EAVES-SOUTH / EAVES-NORTH;
- GABLE-WEST / GABLE-EAST where applicable;
- TRUSS-FAMILY-T01;
- repeated TRUSS occurrences;
- WALL-PLATE / bearing-line identities;
- ceiling tie / lower-chord relationship;
- ROOF-VOID-RV01;
- ceiling-level AIR boundary;
- ceiling-level THERMAL boundary;
- roof WEATHER boundary;
- rainwater-disposal path;
- access hatch occurrence where included.

These are conceptual identities, not implementation classes.

## 4. Source inputs

### Geometry

- building support-line positions;
- clear/overall roof span;
- roof pitch;
- ridge height/position;
- overhang/eaves geometry;
- gable geometry;
- truss spacing;
- roof covering build-up depth where needed for geometry;
- loft access location.

### Structural context

- supporting wall identities;
- wall-plate/bearing family;
- concentrated loads or openings;
- any non-standard truss zones;
- manufacturer/truss-designer evidence identity.

### Boundary context

- ceiling insulation family/depth;
- ceiling air-control layer;
- roof-void ventilation/moisture strategy;
- roof underlay/sarking family;
- external covering;
- eaves/gable junction families;
- roof penetrations/openings.

### Project context

- wind/snow/exposure inputs needed by the structural/weather evidence route;
- orientation;
- maintenance/access requirements;
- target/version.

Unknowns remain visible.

## 5. Geometry/topology responsibilities — native

The compiler should know:

- which walls support the roof;
- where the ridge/eaves/gables are;
- which truss family/occurrences populate the roof;
- which openings interrupt the truss field;
- where the roof void exists;
- where ceiling-level boundaries run;
- how the roof drains to eaves/gutters;
- where inspection/access is expected.

It should detect:

- unsupported roof fields;
- roof geometry inconsistent with the selected family;
- missing bearing lines;
- a truss-layout occurrence intersecting an unmodelled opening;
- roof openings that leave the base family.

## 6. Structural assurance

### Native compiler responsibilities

Represent:

~~~text
ROOF COVERING / ACTIONS
      ↓
TRUSS OCCURRENCES
      ↓
BEARING / WALL PLATE
      ↓
SUPPORTING WALLS
      ↓
FOUNDATION / GROUND [EXTERNAL]
~~~

Also represent:

- longitudinal/lateral bracing roles;
- restraint relationships;
- gable/spandrel relationships where selected;
- openings that alter ordinary truss layout;
- manufacturer-required bracing identities.

### External evidence

The truss designer/manufacturer supplies scoped structural evidence for:

- truss member/plate adequacy;
- project loading;
- truss spacing/layout;
- support reactions;
- special trusses;
- truss-specific bracing;
- required bearing/support data.

Building-level structural evidence remains responsible for:

- adequacy of supporting walls;
- transfer of roof reactions;
- overall stability;
- foundation implications.

### Important boundary

A truss-layout drawing is not automatically proof of the entire roof structure.

The evidence scope must say what it establishes.

## 7. Bracing

The TRA publishes standard bracing guidance for simple duo-pitched trussed-rafter roofs for dwellings and separately identifies truss-designer integrity bracing.

The semantic model therefore distinguishes:

- roof-system stability/bracing required by the building design;
- truss-specific restraint/bracing required by the truss designer;
- temporary erection bracing.

Do not collapse all three into one “BRACED = true”.

Permanent structural bracing evidence and temporary-work installation evidence have different lifecycle phases.

## 8. Installation / temporary works

Trussed-rafter erection is explicitly a high-risk site activity involving work at height and initially unstable components.

The compiler may produce/retain:

- supplier layout information;
- truss weights/dimensions where supplied;
- planned erection/inspection information;
- required evidence/hold points.

It must **not** claim that the design compile proves:

- site-specific lifting method;
- scaffold configuration;
- temporary bracing sequence;
- wind conditions during erection;
- contractor safe system of work.

Those remain site-specific contractor/temporary-works responsibilities.

This is another proof-boundary example.

## 9. Weather boundary

Conceptually:

~~~text
PRECIPITATION
    ↓
ROOF COVERING
    ↓
UNDERLAY / SECONDARY DRAINAGE STRATEGY
    ↓
EAVES / GUTTER
    ↓
RAINWATER DISPOSAL
~~~

The family requires:

- roof covering family;
- underlay/weather strategy;
- ridge/eaves/verge details;
- penetrations explicitly typed;
- drainage route.

Exact products and fixing schedules remain evidence-bearing implementation choices.

## 10. Moisture / condensation

The roof void must have an explicit condensation/moisture strategy.

For the base family:

- thermal boundary at ceiling level;
- uninhabited roof void above;
- roof build-up and ventilation/underlay strategy selected as a supported technical route;
- moisture from the dwelling must not be allowed to leak into the void through an undefined ceiling air layer;
- roof-space ventilation/condensation design must be evidenced against the selected construction and current technical guidance.

The family does not hard-code one ventilation opening dimension before the actual roof/underlay strategy is selected.

## 11. Thermal boundary

The base family uses a **ceiling-level thermal envelope**.

Conceptually:

~~~text
WALL INSULATION
    ↓
WALL-TO-EAVES / GABLE TRANSITION
    ↓
CEILING / LOFT INSULATION FIELD
~~~

The current Approved Document L guidance explicitly emphasises insulation continuity across wall-to-eaves and wall-to-gable junctions; for ceiling-level insulation the eaves condition should avoid thinning the roof insulation because of roof pitch.

Therefore the compiler must represent:

- ceiling insulation field;
- wall insulation field;
- eaves junction;
- gable junction;
- loft-hatch interruption.

A roof field can be structurally valid while its thermal junction remains unresolved.

## 12. Air boundary

The primary air boundary is at the ceiling plane for this family.

It must connect to:

- external-wall air layers;
- gable air layers;
- loft hatch;
- service penetrations;
- ceiling fixtures/penetrations.

The roof covering itself is not the room-side air barrier.

This keeps the physical model legible.

## 13. Eaves / wall interface

The eaves is a first-class interface because it combines:

- roof bearing;
- wall restraint;
- insulation continuity;
- air continuity;
- roof-void ventilation/moisture strategy;
- weather drainage;
- soffit/fascia/gutter architecture;
- maintenance.

RF-TRUSS-DUO-01 therefore requires an eaves-interface family before whole-house H1 release.

For v0.1 the compiler may mark:

**EAVES INTERFACE = SUPPORTED CONCEPT / IMPLEMENTATION EVIDENCE REQUIRED**

Do not make the entire roof unsupported merely because the eaves detail is externally evidenced.

## 14. Gable interface

For a simple gable-ended roof:

- masonry/timber gable relationship is explicit;
- ceiling insulation/air boundary reaches the gable condition;
- roof weather layer/verge is explicit;
- truss/gable restraint relationship is represented;
- fire/cavity obligations apply from target/context.

Exact gable/spandrel construction family can remain external in v0.1 if bounded.

## 15. Loft access / maintenance

The base roof is uninhabited but not semantically inaccessible.

If a loft hatch is provided, model:

- access location;
- hatch clear opening;
- insulation/air-seal interruption;
- working/access route for maintainable equipment if any is placed in the loft.

H1 should prefer **not** to place routine-maintenance plant in a difficult roof void without a deliberate access strategy.

The roof family itself does not require loft plant.

## 16. Services and penetrations

Base family allows only deliberately typed penetrations/openings.

Examples:

- small ventilation duct;
- soil-vent termination;
- electrical/solar route;
- loft hatch through ceiling plane.

Each crossing must identify affected boundaries.

Base v0.1 excludes:

- large rooflights;
- dormers;
- arbitrary truss cutting;
- arbitrary chimney openings;
- unmodelled drilling/cutting of trusses.

If an opening changes the truss design:

- manufacturer evidence becomes stale/requires redesign;
- the source model must represent the changed opening.

## 17. Architectural grammar independence

The roof family is technical.

G-01 or another grammar may constrain:

- roof pitch range;
- eaves character;
- ridge relationship;
- roof visibility;
- chimney/dormer composition later.

Those are separate architectural obligations.

A technically supported roof can still fail the selected grammar.

## 18. Workmanship / inspection

Critical evidence phases include:

### Before manufacture/release

- final support geometry;
- span;
- pitch;
- loading assumptions;
- openings;
- truss layout inputs.

### Delivery/erection

- correct truss identity/layout;
- no damage;
- permanent bracing/restraint installed to design;
- bearing/support conditions correct.

### Before closure

- insulation continuity;
- air-barrier continuity;
- moisture/ventilation route;
- eaves/gable junctions;
- penetrations;
- loft access condition.

Construction evidence must not be collapsed into product design evidence.

## 19. Family evidence model

### Shared family evidence

Can include:

- truss-system design standard/provenance;
- covering/underlay family;
- insulation/air strategy;
- typical eaves/gable implementation family.

### Project structural evidence

Includes:

- truss layout/design;
- truss reactions;
- project-specific bracing requirements;
- special truss data.

### Occurrence/as-built evidence

Includes:

- correct trusses installed in correct positions;
- bracing/restraint;
- support/bearing;
- boundary/insulation continuity;
- penetrations;
- damage/repair records.

## 20. Supported envelope v0.1

For research, keep the family deliberately small.

### Supported candidate

- detached low-rise dwelling;
- simple rectangular roof footprint;
- straight ridge;
- symmetrical or explicitly defined duo pitch;
- masonry support walls;
- uninhabited loft;
- ceiling-level insulation;
- ordinary gable ends;
- no complex roof intersection;
- no large structural roof openings.

### External / explicit exception

- small proprietary penetrations;
- small loft hatch;
- special truss at stair/void only if truss designer evidence is supplied and the occurrence is modelled.

### Unsupported in base family

- room-in-roof;
- dormer;
- large rooflight;
- intersecting valley;
- multiple ridges;
- curved roof;
- significant cantilever;
- green roof;
- flat roof;
- arbitrary cut truss;
- unmodelled chimney opening.

These can become later families.

## 21. Mutations

### RF-M01 — move support wall

Change support-line spacing after truss evidence issued.

Expected:

- truss design evidence stale;
- roof boundary-family definition remains;
- unrelated window evidence remains current.

### RF-M02 — add large rooflight

Expected:

- base family leaves supported domain;
- manufacturer/truss redesign required;
- thermal/air/weather openings generated;
- do not cut trusses silently.

### RF-M03 — change ceiling to rafter-level thermal envelope

Expected:

- RF-TRUSS-DUO-01 thermal subfamily no longer applies;
- roof structure may remain geometrically/structurally usable;
- thermal/air/moisture family must change.

### RF-M04 — block eaves ventilation path

Where selected roof moisture strategy depends on that route:

- moisture/condensation obligation fails;
- structural truss evidence remains current.

### RF-M05 — remove permanent bracing

- structural topology/evidence fails;
- thermal/weather evidence remains current.

### RF-M06 — place maintainable plant in loft without access

- maintenance geography fails;
- roof structure may remain adequate.

## 22. Complexity behavior

The ordinary author should select something like:

> **Simple trussed pitched roof**

and supply meaningful design inputs:

- support walls;
- pitch/ridge;
- eaves;
- openings;
- covering;
- insulation/ceiling strategy.

The user should not manually create:

- truss design checks;
- bracing checks;
- eaves thermal checks;
- loft condensation checks;
- air-seal checks;
- evidence tasks.

The family and target generate those contributions.

## 23. H1 result

RF-TRUSS-DUO-01 is suitable as the **first H1 roof-family candidate**.

Current status:

~~~text
roof geometry/topology        SUPPORTED / NATIVE SEMANTICS
truss structural adequacy     EXTERNAL ENGINEER/MANUFACTURER EVIDENCE
support-wall adequacy         EXTERNAL STRUCTURAL EVIDENCE
permanent bracing             SUPPORTED RELATION / EVIDENCE REQUIRED
temporary erection safety     EXTERNAL SITE-SPECIFIC
weather route                 SUPPORTED FAMILY / PRODUCT EVIDENCE
thermal/air route             SUPPORTED FAMILY / JUNCTION EVIDENCE
moisture/condensation         SUPPORTED ROUTE / TECHNICAL EVIDENCE
eaves/gable interfaces        BOUNDED / IMPLEMENTATION EVIDENCE REQUIRED
maintenance                   NATIVE SEMANTICS
~~~

This closes the conceptual “no roof family” gap without pretending the roof is release-ready.

## 24. Remaining roof work before H1 release

- choose one actual covering/underlay/moisture strategy family;
- define the first eaves interface more concretely;
- define gable-end/spandrel route;
- define fire/cavity implications under the selected whole-house fire strategy;
- obtain external competent structural/building-control review;
- exercise one real truss-designer evidence package;
- decide whether small roof penetrations remain exceptions or become supported subfamilies.

No broader roof ontology is needed before those concrete tests.

## 25. Source anchors

- Trussed Rafter Association, technical advice: https://www.tra.org.uk/technical-advice-downloads/trussed-rafters/
- TRA, Eurocode 5 / technical standards: https://www.tra.org.uk/technical-advice-downloads/bs-en-standards/
- TRA, trussed-rafter installation: https://www.tra.org.uk/health-safety/installation/
- TRA, method statement / site planning: https://www.tra.org.uk/health-safety/method-statement/
- Approved Document L, earlier regulatory standards: https://www.gov.uk/government/publications/conservation-of-fuel-and-power-approved-document-l
- Approved Document L 2026 successor family: https://www.gov.uk/government/publications/approved-document-l-2026
- Approved Document C: https://www.gov.uk/government/publications/site-preparation-and-resistance-to-contaminates-and-moisture-approved-document-c
