# Roof Family RF-TRUSS-DUO-01 — Simple Duo-Pitched Trussed-Rafter Cold Roof

**Status:** H1 paper-domain roof family v0.1; structural/product adequacy remains external evidence  
**Purpose:** give H1 one deliberately narrow UK domestic roof family compatible with the structural-assurance boundary.  
**Structural status:** geometry/support/bracing roles belong to the semantic model; truss/member/connection adequacy is scoped manufacturer/engineer evidence under SAB-H1-01.  
**Construction status:** research family, not construction specification or Reference House roof selection.

> **The first bounded roof family should be ordinary enough that the research tests roof semantics rather than becoming a roof-engineering project.**

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

This is intentionally narrower than the full capability of trussed-rafter construction. It is a competence boundary, not an architectural judgement.

## 2. Why trussed rafters fit the H1 research boundary

The Trussed Rafter Association describes trussed rafters as factory-designed and manufactured components. That procurement model aligns naturally with SAB-H1-01:

~~~text
SEMANTIC / PROJECT MODEL
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

The computational model does not need to reinvent proprietary truss-design software in order to understand the roof and its dependencies.

## 3. Semantic entities

The family may contain:

- roof, ridge and roof-field identities;
- eaves and gable conditions;
- truss family and repeated occurrences;
- wall-plate / bearing-line identities;
- ceiling-tie / lower-chord relationship;
- roof void;
- ceiling-level air and thermal boundaries;
- roof weather boundary;
- rainwater-disposal path;
- access-hatch occurrence where included.

These are conceptual identities, not P0 implementation classes.

## 4. Source inputs

### Geometry

- building support-line positions;
- roof span;
- pitch;
- ridge height/position;
- overhang/eaves geometry;
- gable geometry;
- truss spacing;
- covering build-up where geometry depends on it;
- loft access location.

### Structural context

- supporting-wall identities;
- wall-plate/bearing family;
- concentrated loads or openings;
- non-standard truss zones;
- manufacturer/truss-designer evidence identity.

### Boundary context

- ceiling insulation family/depth;
- ceiling air-control layer;
- roof-void ventilation/moisture strategy;
- underlay/sarking family;
- external covering;
- eaves/gable junction families;
- roof penetrations/openings.

### Project context

- wind/snow/exposure inputs needed by the structural/weather evidence route;
- orientation;
- maintenance/access requirements;
- target/version.

Unknowns remain visible.

## 5. Geometry/topology responsibilities

The model should know:

- which walls support the roof;
- where ridge/eaves/gables are;
- which truss family/occurrences populate the roof;
- which openings interrupt the truss field;
- where the roof void exists;
- where ceiling-level boundaries run;
- how the roof drains to eaves/gutters;
- where inspection/access is expected.

It should detect unsupported roof fields, missing bearing lines, geometry inconsistent with the selected family and openings that force departure from the base family.

## 6. Structural assurance

Represent the load-path topology:

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

Also represent bracing/restraint roles and openings that alter ordinary truss layout.

External structural evidence covers:

- truss member/plate adequacy;
- project loading;
- truss spacing/layout;
- support reactions;
- special trusses;
- truss-specific bracing;
- required bearing/support data;
- supporting-wall, stability and foundation adequacy as applicable.

A truss-layout drawing is not proof of the entire roof structure. Evidence scope must say what it establishes.

## 7. Bracing and temporary works

Keep separate:

- permanent building/roof-system stability;
- truss-designer integrity bracing;
- temporary erection bracing.

Trussed-rafter erection is a site-specific high-risk activity. A design model may retain supplier information and evidence obligations, but it does not prove the lifting method, scaffold configuration, temporary bracing sequence or contractor safe system of work.

## 8. Weather, moisture, thermal and air boundaries

The weather route is conceptually:

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

The family requires explicit covering, underlay/weather strategy, ridge/eaves/verge conditions, typed penetrations and drainage route.

For the base family:

- roof void is uninhabited;
- thermal boundary sits at ceiling level;
- primary air boundary sits at ceiling level;
- wall-to-eaves and wall-to-gable continuity is explicit;
- roof-space moisture/condensation strategy is evidence-backed;
- loft hatch and service penetrations are explicit interruptions.

A roof can therefore be structurally plausible while its thermal, air or moisture junction remains unresolved.

## 9. Eaves and gable interfaces

The eaves is a first-class interface combining:

- roof bearing;
- wall restraint;
- insulation continuity;
- air continuity;
- roof-void moisture strategy;
- weather drainage;
- soffit/fascia/gutter architecture;
- maintenance.

The gable similarly combines structural restraint, envelope continuity, verge/weathering and applicable fire/cavity obligations.

These interfaces can rely on bounded external technical evidence without making the whole roof semantically unknowable.

## 10. Loft access and maintenance

The base roof is uninhabited but not semantically inaccessible.

Where a loft hatch exists, model:

- location and clear opening;
- insulation/air-seal interruption;
- access route for any maintainable equipment placed in the loft.

HSA does not prohibit loft plant categorically. It requires credible maintenance geography proportionate to the task and equipment.

## 11. Services and penetrations

Base family allows deliberately typed penetrations/openings such as:

- small ventilation duct;
- soil-vent termination;
- electrical/solar route;
- loft hatch through ceiling plane.

Each crossing identifies affected boundaries.

Base v0.1 excludes large rooflights, dormers, arbitrary truss cutting, arbitrary chimney openings and other conditions that materially change the truss family without explicit redesign/evidence.

## 12. Architectural grammar independence

The roof family is technical.

G-01 or another grammar may constrain pitch, eaves character, ridge relationship, roof visibility, chimney/dormer composition or other architectural matters.

A technically supported roof can fail the selected grammar. G-01 does not prove the roof technically adequate.

## 13. Workmanship and evidence

Evidence phases may include:

### Before manufacture/release

- final support geometry;
- span;
- pitch;
- loading assumptions;
- openings;
- truss-layout inputs.

### Delivery/erection

- correct truss identity/layout;
- condition/damage;
- permanent bracing/restraint;
- bearing/support condition.

### Before closure

- insulation continuity;
- air-boundary continuity;
- moisture/ventilation route;
- eaves/gable junctions;
- penetrations;
- loft-access condition.

Construction evidence must not be collapsed into product-design evidence.

## 14. Supported envelope v0.1

### H1 research family

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
- special truss at stair/void where truss-designer evidence is supplied and the occurrence is modelled.

### Outside base family

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

These conditions are not architecturally invalid; they require another family or external proof route.

## 15. Mutations

### RF-M01 — move support wall

Expected: truss-design evidence stale while unrelated envelope evidence may remain current.

### RF-M02 — add large rooflight

Expected: base family leaves its envelope; truss redesign plus new thermal/air/weather obligations arise.

### RF-M03 — move thermal boundary to rafter level

Expected: structural roof may remain usable while the thermal/air/moisture subfamily changes.

### RF-M04 — block a required eaves-ventilation route

Expected: moisture obligation fails while truss structural evidence may remain current.

### RF-M05 — remove permanent bracing

Expected: structural topology/evidence fails while unrelated thermal/weather evidence remains current.

### RF-M06 — place maintainable plant in loft without credible access

Expected: maintenance geography fails while roof structure may remain adequate.

## 16. H1 paper result

RF-TRUSS-DUO-01 closed the paper programme's “no roof family” gap at the level required for a bounded whole-house research fixture.

~~~text
roof geometry/topology        H1 PAPER SEMANTICS
truss structural adequacy     EXTERNAL ENGINEER/MANUFACTURER EVIDENCE
support-wall adequacy         EXTERNAL STRUCTURAL EVIDENCE
permanent bracing             RELATION + EVIDENCE REQUIRED
temporary erection safety     EXTERNAL SITE-SPECIFIC
weather route                 FAMILY + PRODUCT EVIDENCE
thermal/air route             FAMILY + JUNCTION EVIDENCE
moisture/condensation         TECHNICAL EVIDENCE
maintenance                   SEMANTIC / GEOMETRIC
~~~

It did not create a release-ready roof or native executable roof solver.

## 17. Current boundary

The paper research remains useful as a bounded family and external-review target. A real project would still need actual covering/underlay/moisture strategy, eaves/gable detailing, fire/cavity coordination, truss-designer evidence and competent structural/building-control review.

Those are project proof requirements, not an unfinished H1 paper-work queue. Reference House roof selection likewise remains an architectural/project decision rather than an automatic inheritance from RF-TRUSS-DUO-01.

## 18. Source anchors

- Trussed Rafter Association, technical advice: https://www.tra.org.uk/technical-advice-downloads/trussed-rafters/
- TRA, Eurocode 5 / technical standards: https://www.tra.org.uk/technical-advice-downloads/bs-en-standards/
- TRA, trussed-rafter installation: https://www.tra.org.uk/health-safety/installation/
- TRA, method statement / site planning: https://www.tra.org.uk/health-safety/method-statement/
- Approved Document L: https://www.gov.uk/government/publications/conservation-of-fuel-and-power-approved-document-l
- Approved Document C: https://www.gov.uk/government/publications/site-preparation-and-resistance-to-contaminates-and-moisture-approved-document-c