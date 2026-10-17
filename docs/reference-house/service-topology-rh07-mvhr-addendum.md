# Reference House — RH-07 MVHR Service Topology Addendum

**Status:** bounded RH-06 rewind created by RH-07  
**Date:** 2026-10-12  
**Parent service authority:** [RH-06 Services and Failure Geography](service-topology-rh06.md)  
**Environmental authority:** [RH-07 Environmental Coordination](environmental-coordination.md)  
**Diagram:** [MVHR topology](mvhr-topology-rh07.svg)

RH-06 deliberately left whole-dwelling ventilation unselected. RH-07 now selects **central mechanical ventilation with heat recovery (MVHR)** as the Reference House baseline and therefore reopens only the duct-routing part of RH-06.

This addendum does not convert RH-06 into an MEP design. It proves that selecting a central ducted system does not require a generic service plenum, structural drilling or a new architectural core.

---

## 1. Why RH-06 reopens

The RH-06 service topology already solved:

- utility entry;
- plant/service hub;
- soil/foul drainage;
- water distribution geography;
- direct cooker source capture;
- dry electrical/data/small-bore routes;
- controlled structural crossings;
- water-failure geography.

What it intentionally did **not** solve was whole-dwelling ventilation.

MVHR adds a supply network, a continuous extract network and outdoor-air intake/exhaust ducts. Those routes must therefore become explicit before RH-07 can claim that MVHR fits the house.

---

## 2. Central unit — `MVHR-01`

Place the central unit in `G-PLANT-01`.

Project requirements:

- front/filter access from the internal plant working zone;
- ordinary removal/replacement through the same nominal external equipment route already reserved for plant;
- condensate drainage accessible and inspectable;
- controls and isolation located with the physical service index;
- fan/noise transmission isolated from principal rooms;
- no requirement to dismantle kitchen cabinetry or permanent masonry to replace the unit.

The exact product and duty remain unselected.

### Coordination airflow

The four-bedroom bedroom-count minimum under Approved Document F is 37 l/s, but the floor-area test is likely to govern this relatively large house once actual internal floor area is known.

RH-07 therefore expects a whole-dwelling design airflow materially above 37 l/s, likely around the **60 l/s class**, but this is not a fan selection. Final internal floor area and competent MEP calculations control.

---

## 3. Outdoor-air and exhaust routes

Create two dedicated air routes:

- `MV-OA-01` — outdoor air intake;
- `MV-EA-01` — exhaust air discharge.

Preferred geography:

- secondary/service-side external face or later roof zone;
- short route from `MVHR-01`;
- insulated/condensation-controlled as required;
- accessible terminal for inspection/cleaning;
- kept away from cooker exhaust, soil vent, combustion products if any, and contamination/nuisance sources;
- no exhaust into the courtyard.

RH-08 owns the final terminal location because roof drainage, maintenance and façade hierarchy must be coordinated together.

### New crossing family

Create one new crossing family for the pair of external air ducts:

- `RH-P005-13` / `PEN-MV-01` — MVHR outdoor-air / exhaust boundary penetrations at service-side plant geography.

The two ducts may need separate physical penetrations. The single crossing-family identity describes the repeated boundary condition, not one literal hole.

---

## 4. Vertical trunks in `SV-01`

Add:

- `MV-SUP-01` — principal supply-air trunk;
- `MV-EXT-01` — principal extract-air trunk.

These rise through the existing **900 × 700 mm clear** `SV-01` service reservation.

Working coordination assumption:

- two principal ducts in roughly the **160–200 mm class** are spatially plausible alongside the 100 mm-class soil/vent stack, water and segregated dry services;
- actual duct size, insulation, separation, fire stopping and support may invalidate that assumption.

### Rewind trigger

If competent design cannot keep the required vertical bundle within the existing clear zone with maintainable/fire-safe separation, test these responses in order:

1. move one air route to a nearby service-side roof/wall route;
2. split wet and ventilation sub-zones locally;
3. revert to continuous MEV;
4. only then consider increasing the permanent service reservation.

Do not enlarge `SV-01` first simply because space is convenient.

The existing `PEN-SV-01` / `RH-P005-08` structural opening remains the controlling floor-crossing family; MVHR does not create another arbitrary floor penetration.

---

## 5. Ground-floor supply topology

Habitable ground-floor targets include:

- drawing room;
- family room;
- study;
- garden dining / living territory as required by final ventilation design.

The supply network should radiate from the service/central geography using **bounded branch corridors**.

### Structural coordination rule

Where a branch uses the first-floor structural zone:

- it should run **parallel to joists** within a deliberately reserved bay or branch corridor;
- no routine bore through I-joists is assumed;
- no crossing of `EB-*` edge beams is assumed without an engineered opening/detail;
- branches should emerge into rooms at a planned terminal position rather than wandering to suit installation convenience.

The current structural concept is unusually compatible with this rule because floor spans run radially between outer and courtyard support lines.

### Access rule

A branch concealed within a floor zone is treated as a long-life duct, not a frequently accessed service.

Maintainability must therefore rely on:

- removable terminal/plenum access;
- cleanable route geometry;
- accessible branch/manifold points where used;
- documented route coordinates;
- avoidance of inaccessible dampers or active components inside the floor.

Do not create removable flooring over an entire room solely to claim that an inert ventilation duct is accessible.

---

## 6. Upper-floor supply topology

Upper bedrooms require mechanical supply.

Preferred order:

1. use `SV-01` to reach the upper ceiling / roof-service geography;
2. distribute along landing/gallery or roof/ceiling routes;
3. make short branches/drops to each bedroom;
4. avoid bedroom wall fields where a common circulation-side route can do the work.

Because RH-08 has not fixed roof form, exact upper duct geography remains provisional.

No duct should occupy the open courtyard or require visible technical boxes on principal courtyard elevations.

---

## 7. Extract topology

### `U-BATH-01`

RH-06's direct wall bathroom extract `BX-01` is superseded as the **baseline implementation** by an MVHR high-level extract terminal close to the moisture source.

The architectural intent of `PAT-021 — Source-Capture Bathroom Extract` remains live: extract should be close enough to the shower/bath moisture source that steam is captured before migration through the house.

The short direct-wall route remains a fallback if the central system is rejected.

### Utility / WC

Continuous extract is easy to obtain because both lie within `G-SVC-02` adjacent to plant/service geography.

### Kitchen

Two different duties remain separate:

- MVHR provides normal background extract for the kitchen/wet-room ventilation duty;
- `KX-01` remains a **separate direct cooker-hood source-capture route** for grease, high moisture and cooking pollutants.

Cooker extract does not pass through the MVHR heat exchanger.

---

## 8. Purge remains separate

MVHR is not the summer-overheating system.

The house retains openable windows sized for purge/cross ventilation. Summer bypass in the MVHR may help avoid recovering unwanted heat, but it does not replace secure night purge or Part O modelling.

This separation is important:

> **background IAQ is mechanical; emergency/seasonal heat rejection remains predominantly architectural.**

---

## 9. Occurrence changes

### New

- `RH-P005-13` — `PEN-MV-01`, MVHR outdoor-air/exhaust boundary crossing family.

### Modified implementation, same project object

- `RH-P021-01` — `U-BATH-01` source-capture bathroom extract now uses the central MVHR extract network as baseline; direct wall `BX-01` becomes fallback rather than selected implementation.

### Unchanged

- `RH-P010-01` cooker source capture remains separate/direct;
- `RH-P014-02` vertical service zone remains the same project object but now carries the two main MVHR trunks as an additional service class;
- dry electrical/data routes remain independent;
- water/foul/failure geography remains unchanged.

---

## 10. MVHR acceptance / rejection gate

Keep MVHR selected only if later MEP coordination demonstrates:

1. `MVHR-01` can be serviced and replaced without destructive work;
2. intake/exhaust positions can be maintained and separated adequately;
3. `SV-01` can carry the vertical bundle without unsafe congestion;
4. branches avoid arbitrary structural penetrations;
5. noise targets can be achieved without excessive duct/attenuator volume;
6. filters can be changed easily enough that normal occupants are likely to do it;
7. commissioning/balancing can be recorded and repeated;
8. the architectural cost remains lower than the energy/IAQ benefit.

If those conditions fail, **continuous MEV is the preferred fallback**. The project should not deepen all floors, enlarge the core or compromise principal rooms merely to preserve MVHR as a badge of technical sophistication.