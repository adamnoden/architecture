# Boundary Family BF-GF-MCW-01 — Ground Floor to Masonry Cavity Wall Perimeter

**Status:** supported-family research candidate v0.1  
**Purpose:** define one ordinary ground-floor / external-wall perimeter route so S1 does not leave the base of every room as an undefined envelope gap.  
**Structural status:** ground/foundation/slab adequacy external under SAB-H1-01.  
**Construction status:** research family, not construction specification.

> **The floor/wall perimeter is one environmental junction with several layers of responsibility. It is not solved by saying “DPC” or “insulation” in isolation.**

## 1. Supported condition

The initial family assumes:

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

## 2. Why this family is needed

S1 needs a finished ground-floor datum and room area.

But a whole-house compiler must eventually understand that the floor perimeter also affects:

- ground moisture;
- wall moisture;
- air leakage;
- thermal bridging;
- insulation continuity;
- finished-floor level;
- accessible thresholds elsewhere;
- structural/substructure interfaces.

Leaving this as generic “external evidence” would make a common junction undefined.

## 3. Moisture contribution

Approved Document C illustrates the fundamental relationship:

> wall damp-proof course and floor damp-proof membrane should form a continuous damp-protection strategy.

The family therefore contributes:

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
- the inner leaf is protected by the selected wall-base strategy;
- cavity drainage/moisture behavior remains coherent above/below the junction;
- any site-specific gas/radon/flood requirement is separately represented.

## 4. Thermal contribution

The floor insulation and wall insulation must connect through an accepted perimeter strategy.

The family contributes:

- floor insulation field;
- wall insulation field;
- perimeter connection/junction identity.

The exact junction thermal performance remains:

**EXTERNAL / TRUSTED JUNCTION EVIDENCE**

until a native assessed detail is admitted.

The compiler can still:

- preserve the junction identity;
- prevent an unrepresented insulation gap;
- invalidate evidence when geometry/materials change.

## 5. Air contribution

The room-side air-control system must connect at the wall/floor perimeter.

For the current wall hypothesis:

~~~text
WALL PARGE / AIR LAYER
    ↓
PERIMETER AIR TRANSITION
    ↓
FLOOR / DPM / AIR-CONTROL ROUTE
~~~

The exact air-control implementation depends on the chosen floor family.

The semantic obligation is stable:

> the enclosure air boundary cannot simply stop at finished floor level.

## 6. Structural / ground contribution

The family does not prove:

- bearing capacity;
- slab design;
- foundation size;
- settlement;
- heave;
- ground improvement;
- local wall support.

Those remain external structural/geotechnical evidence under H1 v0.

The source model must still identify:

- wall support line;
- floor/substructure relationship;
- foundation/ground evidence dependency.

## 7. Site-condition inputs

The family requires explicit site inputs or external evidence for:

- ground conditions;
- contamination;
- radon/ground gas where relevant;
- flood/groundwater conditions where relevant;
- external ground level;
- drainage/subsoil conditions where relevant.

UNKNOWN is legitimate at early design stage.

Release-grade compilation is not.

## 8. External ground / DPC relation

The family preserves the ordinary moisture-control relationship between:

- external ground level;
- wall DPC;
- floor moisture strategy.

Exact dimensional compliance remains tied to the selected target/detail.

Do not hide changes in finished external ground level as landscaping-only information.

A later level change can invalidate the wall-base moisture evidence.

## 9. Workmanship / inspection

Critical hidden conditions include:

- DPM continuity;
- DPC/DPM connection;
- insulation continuity at perimeter;
- cavity cleanliness/base condition;
- air-seal/perimeter transition;
- service penetrations through the floor/perimeter where any exist.

Hold points must occur before:

- screed/finish conceals the floor membrane;
- skirting/lining conceals the internal perimeter;
- external work makes wall-base defects inaccessible.

## 10. Evidence contract

Depending on the selected implementation, release evidence may include:

- ground/site report;
- structural/foundation design;
- floor product/build-up evidence;
- DPM/DPC system evidence;
- thermal-junction assessment;
- air-continuity detail;
- construction inspections.

One detail/evidence family may support many room perimeters if its parameter scope genuinely covers them.

## 11. S1 baseline result

S1 supplies:

- external masonry walls;
- finished ground-floor plane;
- ordinary detached-house context;
- no basement;
- no exceptional ground condition asserted.

It does **not** yet supply:

- selected ground-floor construction family;
- ground/site evidence;
- thermal junction assessment.

Therefore:

**BF-GF-MCW-01 FAMILY APPLICABILITY: CANDIDATE / ROUTE KNOWN**

**MOISTURE TOPOLOGY: PASS SEMANTICALLY**

**AIR / THERMAL TOPOLOGY: PASS SEMANTICALLY**

**FLOOR IMPLEMENTATION FAMILY: UNSELECTED**

**GROUND / STRUCTURAL / THERMAL EVIDENCE: EXTERNAL**

This turns the S1 gap into a bounded evidence problem rather than an undefined junction.

## 12. Mutations

### External ground level changes

Re-evaluate:

- wall-base moisture/DPC relation;
- drainage;
- accessibility implications at doors elsewhere.

Do not automatically invalidate upper-floor structure.

### Floor build-up changes

Re-evaluate:

- finished floor datum;
- door/control/window sill heights measured from AFFL;
- insulation/junction evidence;
- DPM/air transition.

This is an important dependency.

A “floor finish” change can alter accessibility/window-control semantics if finished floor level changes.

### Wall family changes

Re-evaluate:

- DPC/DPM compatibility;
- insulation continuity;
- air transition;
- thermal evidence.

## 13. H1 posture

For H1 v0 this can be a:

**SUPPORTED BOUNDARY ROUTE + EXTERNAL FLOOR/GROUND/STRUCTURAL EVIDENCE**

The next technical step is not a larger ontology.

It is selecting one ordinary ground-floor implementation family that can instantiate this boundary route.
