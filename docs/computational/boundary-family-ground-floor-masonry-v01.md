# Boundary Family BF-GF-MCW-01 — Ground Floor to Masonry Cavity Wall Perimeter

**Status:** H1/S1 paper-domain boundary family v0.1; floor, ground and structural evidence remain external  
**Purpose:** define one ordinary ground-floor / external-wall perimeter route so the base of the enclosure is represented as a coordinated boundary junction rather than an undefined gap.  
**Structural status:** ground/foundation/slab adequacy remains external under SAB-H1-01.  
**Construction status:** research family, not construction specification or Reference House floor selection.

> **The floor/wall perimeter is one environmental junction with several layers of responsibility. It is not solved by saying “DPC” or “insulation” in isolation.**

## 1. Bounded condition

The family assumes:

- detached low-rise dwelling;
- masonry cavity external wall;
- ordinary ground-bearing floor construction;
- continuous damp-proof membrane / ground-moisture strategy;
- wall damp-proof course;
- continuous floor insulation strategy;
- declared room-side air-control layer;
- no basement;
- no exceptional flood/ground-gas condition;
- no retaining-wall condition.

The exact floor product/build-up remains a separate implementation family.

These are H1 research restrictions, not HSA doctrine.

## 2. Why this family is needed

A ground-floor datum participates in much more than room geometry. The perimeter can affect:

- ground moisture;
- wall moisture;
- air leakage;
- thermal bridging;
- insulation continuity;
- finished-floor level;
- accessible thresholds elsewhere;
- structural/substructure interfaces.

The family makes those relationships explicit without pretending to prove the foundation or floor construction itself.

## 3. Moisture contribution

Approved Document C illustrates the fundamental relationship between floor damp-proofing and wall damp protection.

Conceptually:

~~~text
GROUND / MOISTURE
    ↓
FLOOR DPM
    ↔
PERIMETER DPM/DPC CONNECTION
    ↔
WALL DPC
    ↓
WALL / CAVITY MOISTURE STRATEGY
~~~

Required propositions include:

- ground moisture cannot bypass the floor membrane at the perimeter;
- wall DPC and floor membrane are compatibly connected;
- inner-leaf protection remains coherent;
- cavity drainage/moisture behaviour remains coherent above/below the junction;
- site-specific gas/radon/flood requirements are separately represented where applicable.

## 4. Thermal contribution

The floor insulation and wall insulation must connect through an accepted perimeter strategy.

The family contributes:

- floor insulation field;
- wall insulation field;
- perimeter connection/junction identity.

Exact junction thermal performance remains **external / trusted junction evidence** until a bounded assessed detail is deliberately admitted.

The semantic model can still preserve junction identity, detect an unrepresented gap and invalidate evidence when geometry/materials change.

## 5. Air contribution

The room-side air-control system must connect at the wall/floor perimeter.

For the current wall hypothesis:

~~~text
WALL AIR-CONTROL LAYER
    ↓
PERIMETER AIR TRANSITION
    ↓
FLOOR / DPM / AIR-CONTROL ROUTE
~~~

The exact implementation depends on the selected floor family. The stable proposition is simply that the enclosure air boundary cannot stop accidentally at finished floor level.

## 6. Structural / ground contribution

The family does not prove:

- bearing capacity;
- slab design;
- foundation size;
- settlement;
- heave;
- ground improvement;
- local wall support.

Those remain external structural/geotechnical evidence.

The source model must still identify:

- wall support line;
- floor/substructure relationship;
- foundation/ground evidence dependency.

## 7. Site-condition inputs

The family requires explicit project facts or external evidence for relevant:

- ground conditions;
- contamination;
- radon/ground gas;
- flood/groundwater conditions;
- external ground level;
- drainage/subsoil conditions.

Unknown is legitimate during early design. It is not equivalent to release-grade proof.

## 8. External ground / DPC relation

The family preserves the relationship between external ground level, wall DPC and floor moisture strategy.

Exact dimensional requirements remain target/detail dependent.

A later landscaping or level change can therefore invalidate wall-base moisture evidence; it is not automatically “external works only”.

## 9. Workmanship / inspection

Critical hidden conditions include:

- DPM continuity;
- DPC/DPM connection;
- insulation continuity at perimeter;
- cavity cleanliness/base condition;
- air-seal/perimeter transition;
- service penetrations through the floor/perimeter where present.

Hold points should occur before consequential layers are concealed.

## 10. Evidence contract

Depending on the selected implementation, evidence may include:

- ground/site report;
- structural/foundation design;
- floor product/build-up evidence;
- DPM/DPC system evidence;
- thermal-junction assessment;
- air-continuity detail;
- construction inspections.

One family-level detail may support multiple occurrences only where its parameter scope genuinely covers them.

## 11. S1 provenance

S1 supplied external masonry walls, a finished ground-floor plane, ordinary detached-house context, no basement and no exceptional ground condition asserted.

It did not select a ground-floor construction family or supply ground/thermal-junction evidence.

The paper result was therefore a **known boundary route with incomplete external evidence**, not a completed floor design.

## 12. Mutations

### External ground level changes

Re-evaluate wall-base moisture/DPC relation, drainage and threshold/access implications where connected.

### Floor build-up changes

Re-evaluate finished-floor datum, dependent sill/control/door heights, insulation/junction evidence and DPM/air transition.

### Wall family changes

Re-evaluate DPC/DPM compatibility, insulation continuity, air transition and thermal evidence.

These dependencies are the value of the family: changing one occurrence need not invalidate unrelated systems.

## 13. H1 paper posture

~~~text
boundary topology              H1 PAPER FAMILY
moisture continuity            SEMANTIC + DETAIL EVIDENCE
air/thermal continuity         SEMANTIC + JUNCTION EVIDENCE
floor implementation           EXTERNAL / UNSELECTED IN PAPER FAMILY
ground/foundation adequacy     EXTERNAL STRUCTURAL/GEOTECHNICAL EVIDENCE
as-built continuity            PHYSICAL EVIDENCE
~~~

The family closes a conceptual junction in the H1 paper model. It does not create a native executable floor/foundation family or choose the Reference House ground-floor construction.

## 14. Current boundary

A real project must select and evidence the actual floor, foundation, ground-moisture, thermal and air-continuity details. Further computational work is justified only if that project work exposes a useful semantic or invalidation problem; a larger ground-floor ontology is not a standing task.