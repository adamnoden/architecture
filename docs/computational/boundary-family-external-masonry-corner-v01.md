# Boundary Family BF-CORNER-MCW-01 — Orthogonal Masonry Cavity-Wall External Corner

**Status:** supported-family research candidate v0.1  
**Purpose:** convert the ordinary 90-degree external corner between two supported masonry cavity walls from an unresolved bespoke junction into a reusable boundary-family route.  
**Structural status:** topology native; local/global adequacy external under SAB-H1-01.  
**Construction status:** research family, not construction specification.

> **A corner is not a third wall. It is the place where two wall fields must continue to behave as one enclosure.**

## 1. Supported condition

The family applies where:

- two external walls meet at approximately 90 degrees;
- both walls use the same supported masonry cavity-wall family or a declared compatible pair;
- outer leaves are masonry;
- cavity/drainage strategies are compatible;
- insulation strategies are compatible;
- inner leaves are masonry;
- primary room-side air-control layers can connect continuously;
- there is no special movement joint, façade system change or other exceptional corner condition.

S1's south/east external corner is the first occurrence.

## 2. What the family contributes

The family contributes graph fragments and evidence dependencies to:

- WEATHER;
- MOISTURE;
- THERMAL;
- AIR;
- STRUCTURAL TOPOLOGY;
- WORKMANSHIP / INSPECTION.

It does not own:

- whole-wall structural capacity;
- whole-building stability;
- foundation design;
- whole-dwelling thermal compliance;
- product-specific masonry design.

## 3. Weather/moisture contribution

The corner should preserve the same basic cavity-wall moisture strategy as the adjoining wall fields:

~~~text
EXTERIOR PRECIPITATION
    ↓
OUTER MASONRY
    ↓
DRAINED CAVITY CONTINUES AROUND CORNER
    ↓
INNER LEAF REMAINS PROTECTED
~~~

Required propositions:

- the cavity does not terminate as an accidental water trap at the corner;
- construction does not create unsupported mortar/debris bridges;
- insulation placement does not block the drainage strategy;
- local detailing preserves the wall family's drying/drainage logic;
- any DPC/cavity-tray conditions from adjoining interfaces remain continuous where applicable.

The family does not assert that one generic corner works in every exposure zone.

Site/exposure remains an input.

## 4. Thermal contribution

The insulation field must turn the corner without an unrepresented discontinuity.

The family therefore contributes:

- south-wall insulation segment;
- east-wall insulation segment;
- corner connection between them.

Canonical thermal obligations remain at the composed envelope/junction scope.

The exact linear thermal-transmittance / junction calculation is:

**EXTERNAL OR TRUSTED DETAIL EVIDENCE**

until a native assessed junction family is admitted.

This is still a supported family because the **route and evidence contract are known**.

## 5. Air contribution

The room-side permanent air-control layer should be able to continue around the internal corner.

For the current wall hypothesis:

~~~text
SOUTH PARGE / AIR LAYER
    ↘
      INTERNAL CORNER TRANSITION
    ↗
EAST PARGE / AIR LAYER
~~~

The corner transition must not depend on:

- skirting;
- decorative lining;
- removable panel;
- sealant applied only after a concealed defect has become inaccessible.

Exact product/mesh/tape/plaster reinforcement strategy remains implementation evidence.

## 6. Structural contribution

The physical masonry corner contributes to:

- orthogonal wall connection;
- wall stability;
- load-path continuity;
- robustness.

H1 v0 represents those relationships.

Capacity/detail adequacy remains external structural evidence under SAB-H1-01.

The compiler must still know that two walls meet structurally.

It must not treat them as independent planes merely because their calculations are external.

## 7. Opening interaction

This family covers an **uninterrupted corner condition**.

A window/door sufficiently close to the corner can create a different combined interface:

~~~text
OPENING
  +
CORNER
  +
PIER / HEAD / RESTRAINT
~~~

The current research does not invent a universal minimum opening-to-corner distance.

Instead:

- ordinary separated conditions may use this corner family plus the ordinary opening family;
- where the opening materially interacts with the corner structural/boundary detail, the combination returns **UNSUPPORTED / EXTERNAL COMBINED DETAIL** until a bounded family exists.

This is why S1-M03 correctly returned unsupported when the east window was squeezed toward the corner.

## 8. Fire contribution

Where cavity barriers/closures are required by the selected fire strategy, the corner must not create an unmodelled bypass.

The family contributes corner cavity identity to the fire graph.

It does not generate a cavity barrier simply because the geometry is a corner.

Applicability comes from the fire model/target.

## 9. Workmanship and tolerance

Critical construction concerns include:

- corner setting-out;
- masonry bond/connection;
- cavity width/cleanliness;
- insulation fit at the turn;
- air-layer continuity;
- damage before concealment.

The family requires:

- explicit datum/setting-out;
- inspection of concealed cavity/insulation conditions;
- remediation rather than concealment when the corner leaves the accepted wall-family envelope.

Exact numerical masonry tolerances remain specification/standard dependent.

## 10. Evidence contract

A release-grade occurrence may need, depending on project/domain:

- wall-family material/product evidence;
- thermal-junction assessment/detail;
- structural engineer/detail evidence;
- site/exposure confirmation;
- construction inspection evidence;
- air-boundary continuity evidence.

Evidence may be family-level where the scope covers multiple identical corners.

Installation evidence remains occurrence-level where appropriate.

## 11. S1 baseline result

S1 C-SE-01:

- 90-degree external corner;
- same cavity-wall family on both sides;
- large uninterrupted masonry fields near the baseline corner;
- compatible insulation/air/cavity concepts.

Therefore:

**FAMILY APPLICABILITY: PASS**

**BOUNDARY TOPOLOGY: PASS**

**THERMAL JUNCTION EVIDENCE: EXTERNAL / UNRESOLVED**

**STRUCTURAL ADEQUACY: EXTERNAL**

**CONSTRUCTION EVIDENCE: FUTURE**

This is materially better than “corner family unresolved”.

## 12. Mutation behavior

### Move east window near corner

If the opening begins to interact with the corner detail:

**BF-CORNER-MCW-01 remains a valid family definition, but the composed occurrence leaves the currently supported combination.**

Return:

**UNSUPPORTED COMBINATION / EXTERNAL DETAIL**

Do not mutate the family silently to fit.

### Change one wall family

Re-evaluate:

- cavity compatibility;
- insulation continuity;
- air-control compatibility;
- structural connection;
- thermal evidence.

### Change exposure

Re-evaluate weather/moisture evidence.

Do not automatically invalidate the room's Part-M access or service topology.

## 13. H1 posture

BF-CORNER-MCW-01 is suitable as an H1-v0 **supported boundary family with external technical evidence**.

That means:

- semantic behavior is known;
- composition is known;
- unsupported variants are explicit;
- expert evidence has a scoped place.

It does not mean the compiler has become a masonry-detail designer.
