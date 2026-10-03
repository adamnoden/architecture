# Domain S0 — Run 02 Source Overlay v0.2

**Source ID:** S0-SOURCE-02  
**Base source:** [S0 Frozen Source Package v0.1](s0-source-package.md)  
**Purpose:** add only the context and repeated occurrences required to test target applicability, operational-window semantics and complexity scaling.  
**Status:** frozen research overlay  
**Date:** 2026-10-03

> **Run 02 does not redesign S0. It adds enough context to test whether a better compiler model can understand more while asking the author for less.**

## 1. Target

Use:

**T-ENG-NDW-2026-10-03-S0-03**

Frozen transition inputs:

- hypothetical building-control application: 3 October 2026;
- non-HRB work;
- hypothetical commencement: **1 September 2027 — TEST ASSUMPTION**.

This deliberately retains the previous L/F route under the tested transitional branch.

## 2. Variant scope

Run 02 uses **S0-A conventional construction only**.

S0-B/W2 remains valuable research but is excluded from this run because the purpose is:

- composition scaling;
- target completeness;
- occurrence reuse;
- authoring-complexity containment.

Do not add experimental assembly complexity to a scaling test that does not need it.

## 3. Repeated wall-bay occurrences

Create two adjacent occurrences on one hypothetical upper-floor elevation.

### BAY-B01

Inherits the original S0 geometry:

- width: 3000 mm;
- storey height represented: 3300 mm;
- opening: 1200 × 1800 mm;
- sill: 750 mm AFFL;
- window: WIN01;
- wall family: W-S0-01;
- boundary family: BF-WIN-MCW-01;
- floor/wall interface family: IF-FLR-MCW-01;
- service penetration: P01 retained.

### BAY-B02

Duplicate B01's supported families and nominal geometry:

- width: 3000 mm;
- storey height represented: 3300 mm;
- opening: 1200 × 1800 mm;
- sill: 750 mm AFFL;
- window: WIN02;
- same wall/boundary/floor-interface families;
- no additional service penetration in the baseline.

The purpose is to distinguish:

- family knowledge;
- occurrence facts;
- project/elevation aggregates.

## 4. Room context

Both bays bound the same hypothetical:

**ROOM R01**

Research role:

- HABITABLE ROOM;
- upper-floor occupied room.

Full room geometry is deliberately not supplied.

Consequences:

- room-level purge-ventilation obligation exists;
- window contribution can be reasoned about;
- a final purge calculation cannot be completed from the bay slice alone.

## 5. Window operational state

WIN01 and WIN02 share the same provisional window-family selection state.

Known:

- external window;
- ordinary openable capability intended;
- replacement unit distinct from masonry opening;
- sill = 750 mm;
- no final product selected.

Unknown / unresolved:

- sash/opening mechanism;
- maximum opening angle;
- effective clear opening area;
- guarding/restrictor strategy;
- safety-glazing product;
- whether either window is required for emergency egress;
- exact frame/fixing product;
- Uw.

### Purge role

R01 nominates **the window set {WIN01, WIN02} as a candidate purge route**.

This does not mean it passes Part F.

The compiler must request operational geometry/room information needed to prove the route.

### Emergency-egress role

**UNRESOLVED APPLICABILITY**

Whole-house fire/escape strategy is outside S0.

### Fall context

Exterior fall below the opening is:

**3.3 m — TEST ASSUMPTION**

The low sill therefore deliberately exercises Part K/fall-protection semantics.

### Security context

For Run 02 only:

- no balcony;
- no adjacent accessible roof/ledge;
- not otherwise easily accessible from outside.

This is a TEST ASSUMPTION to allow Part Q window applicability to resolve without designing the security product.

## 6. Site/envelope context

Still unknown:

- wind-driven-rain exposure;
- orientation;
- relevant-boundary distance;
- neighbouring elevation relationship;
- whole-dwelling overheating inputs.

These unknowns are deliberate.

They test whether one missing project-level context is surfaced once even though several occurrences depend on it.

## 7. Structural assurance

Apply:

**SAB-H1-01**

Native compile responsibilities:

- topology;
- geometry extraction;
- relationship/applicability;
- evidence dependency/invalidation.

External evidence remains required for:

- floor member/hanger adequacy;
- lintel/head support;
- local masonry;
- stability/foundation outside S0.

No structural-engineer evidence item is fabricated for the run.

## 8. Boundary family

Apply:

**BF-WIN-MCW-01**

to both B01/WIN01 and B02/WIN02.

The family definition is authored once.

Occurrences reference it.

## 9. Workmanship route

Apply:

**S0-A Conventional Workmanship and Tolerance Route v0.1**

to both occurrences.

Process semantics are shared.

Exact numeric/product tolerance envelopes remain unresolved pending real technical family selection.

## 10. Complexity-test mutation set

### C-M1 — duplicate occurrence

Baseline test itself.

Expected:

- second bay adds occurrences/quantities;
- family/rule knowledge not re-authored;
- shared unresolved family decisions group together.

### C-M2 — local withdrawal obstruction

Obstruct WIN02's withdrawal volume only.

Expected:

- B02 maintenance failure;
- B01 remains valid;
- shared family issues remain shared.

### C-M3 — local opening width change

Change B02 opening width:

1200 → 1800 mm.

Expected:

- B02 local structural/window/boundary evidence stale;
- whole-elevation opening aggregate updates;
- B01 local opening evidence remains current.

### C-M4 — target-transition failure

Change hypothetical commencement:

2027-09-01 → 2028-04-01.

Expected:

- previous L/F target branch invalid;
- L/F-dependent evidence for both bays stale;
- structural/doctrine geometry evidence remains current.

### C-M5 — product-family selection

Select one future window family for both occurrences.

Expected:

- one family decision can discharge/shared-support multiple product-level obligations where evidence scope permits;
- occurrence installation evidence remains separate.

## 11. Derived baseline quantities

Two identical bays:

- gross wall area: **19.80 m²**;
- total opening/window area: **4.32 m²**;
- net opaque wall area: **15.48 m²**.

These are geometric test quantities only.

They do not determine B4 or Part L compliance by themselves.

## 12. Source-authoring principle

The Run-02 author has not manually created:

- Part K obligations;
- purge checks;
- B4 aggregation;
- air-boundary checks;
- structural evidence requirements;
- workmanship checks.

They arise from:

- semantic roles;
- target;
- family selections;
- context.

That is the point of the run.
