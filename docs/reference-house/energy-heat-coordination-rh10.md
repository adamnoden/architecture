# Reference House — RH-10 Energy, Heating and Renewable Coordination

**Status:** RH-10 corrective coordination addendum  
**Date:** 2026-10-12  
**Triggered by:** whole-house audit  
**Parent authorities:** [RH-06 Services and Failure Geography](service-topology-rh06.md), [RH-07 Environmental Coordination](environmental-coordination.md), [RH-08 Roof / Drainage / Access](roof-drainage-access-rh08.md), [RH-09 Tectonic Integration](tectonic-integration-rh09.md)  
**Diagram:** [energy / heat / PV topology](energy-heat-topology-rh10.svg)

RH-10 exposed a real omission: the Reference House had coordinated ventilation, water, drainage and electrical/service geography without selecting a space-heating or domestic-hot-water family. That is too large a hole to call the house coordinated.

This addendum closes the **architectural topology** of heat and renewable electricity. It is not a heat-loss calculation, MEP design, SAP calculation, product schedule or acoustic assessment.

---

## 1. Forward regulatory context

As of 12 October 2026 the Future Homes and Buildings Standards amendments for ordinary non-HRB work are published but do not generally take effect until **24 March 2027**, subject to transitional arrangements.

The published 2026 regime introduces a functional requirement for on-site renewable electricity generation in new dwellings. Government guidance describes the reference output for a new dwelling using a photovoltaic array whose peak power is based on panels at **0.22 kWp/m² over an area equivalent to 40% of the dwelling ground-floor area**, with annual output then assessed using the approved methodology.

Canonical sources:

- GOV.UK, *The Future Homes and Buildings Standards: Building Circular 01/2026* — https://www.gov.uk/government/publications/the-future-homes-and-buildings-standards-building-circular-012026
- GOV.UK, *Approved Document L: Energy and greenhouse gas emissions, frequently asked questions* — https://www.gov.uk/guidance/approved-document-l-energy-and-greenhouse-gas-emissions-frequently-asked-questions

The Reference House has no build date, but a real project derived from it is unlikely to justify designing around a regulatory condition already known to arrive in 2027. RH-10 therefore treats the 2026 Future Homes regime as a **forward-design stress case**, not as a claim about the law currently applying to a hypothetical October-2026 building notice.

---

## 2. Heat-source comparison

### H0 — direct electric resistance

**Strength:** almost no plant or hydraulic complexity.

**Failure:** poor whole-house energy proposition for a new detached dwelling and an implausible baseline against the direction of the Future Homes Standard.

**Decision:** reject as the Reference House baseline.

### H1 — air-to-water heat pump — **SELECTED WORKING BASELINE**

Use an external air-source unit feeding a low-temperature wet heating system and an indirectly heated domestic-hot-water cylinder in `G-PLANT-01`.

Why it wins at Reference House resolution:

- works with the already-selected plant room and service-side replacement geography;
- requires no boreholes or large ground array;
- keeps combustion products, fuel storage and flues out of the house;
- is compatible with low design heat loads expected from a new high-performance envelope;
- leaves heat-generation equipment replaceable without disturbing principal rooms;
- gives a real distribution topology to coordinate now without pretending a specific product is known.

The external unit is placed provisionally in the **middle-to-rear east/service-side working zone beside `G-PLANT-01`**, biased toward the plant-room/service field rather than beneath a bedroom opening. Exact position remains subject to real-site boundary, airflow, acoustic, terminal and access constraints.

### H2 — ground-source heat pump

Potentially efficient and durable but strongly site-dependent. Ground area, geology, borehole permissions, capital cost and access are unknown.

**Decision:** retain as a real-site alternative, not the virtual baseline.

### H3 — heat network

Entirely dependent on an actual site and local infrastructure.

**Decision:** not selectable in the virtual house.

---

## 3. Space-heating emitters

The Reference House does **not** select whole-house underfloor heating as the default merely because heat pumps favour low flow temperatures.

### Selected baseline — low-temperature radiator / passive-emitter family

Use generously sized low-temperature emitters, normally on outer-wall/window geography where the room composition permits.

Reasons:

- emitter replacement is ordinary and visible;
- valves and joints remain accessible;
- no active service needs to be embedded across whole principal-room floors;
- the solution is compatible with `W0` direct-finished walls and `W1` local attachment/service datums;
- high-performance new-build heat loads should reduce the size penalty associated with lower water temperatures.

Exact emitter size, appearance and flow temperature require room-by-room heat-loss design. If competent heat-loss work shows the required emitters become architecturally disproportionate, test **joint-free ground-floor underfloor loops in a non-structural replaceable screed layer** as the first challenger. Do not adopt buried heating pre-emptively.

Fan-coil emitters are not the baseline because they add room-level fans, filters, noise and replacement components where a passive emitter may suffice.

---

## 4. Hydronic distribution

Create two coherent heating distribution objects:

- `HYD-G-01` — ground-floor low-temperature flow / return;
- `HYD-U-01` — upper-floor low-temperature flow / return.

Both originate in `G-PLANT-01`.

### Ground floor

Use the service/gallery side as the principal launch route, then selected low-level/perimeter architectural routes to individual emitters.

Rules:

- do not use permanent masonry chases as routine distribution;
- do not convert every skirting into wet-service infrastructure;
- where a low-level architectural route carries heating pipework, use continuous/joint-minimised pipe lengths and keep joints/valves at accessible ends;
- protect later fixing zones from the route;
- cross structural/boundary zones only through explicit details.

### Upper floor

Rise within the service geography adjacent to `SV-01`, then distribute through the upper gallery/landing service territory before short room branches.

The upper structural floor remains **structure first**, not a generic wet-service plenum. Pipework may occupy declared parallel route zones where coordinated, but no arbitrary boring through `EB-*` edge beams or reaction nodes is assumed.

### Failure response

Heating water is pressurised water and therefore inherits the House Kernel failure hierarchy:

- accessible plant isolations;
- joint-minimised concealed runs;
- accessible branch joints and emitter valves;
- route records / safe-fixing information;
- visible or inspectable leakage at service-hub / riser bases;
- no reliance on electronic leak sensors as the only defence.

---

## 5. Domestic hot water

Reserve a conventional insulated hot-water cylinder in `G-PLANT-01`, sized later from actual occupancy and heat-pump recovery duty.

The cylinder belongs in the plant room because:

- replacement route already exists;
- water failure remains in high-service geography;
- primary valves and controls stay together;
- stored hot water does not consume kitchen cabinetry or upper-floor linen space.

RH-10 does not select cylinder volume, buffer vessel or hydraulic schematic. A competent heat-loss / hot-water design may show that some nominal plant is unnecessary.

---

## 6. Plant-room packing test

`G-PLANT-01` retains its approximate **2.9 × 2.2 m gross** reservation.

At coordination level it must accommodate four classes without destructive overlap:

1. `MVHR-01`, with filter/front service access;
2. hot-water cylinder / associated hydraulic equipment;
3. electrical / controls / service index in a segregated dry field;
4. `SV-01` access and working approach.

The room is not declared technically proved. It passes RH-10 only as a plausible **equipment room rather than cupboard** with an existing nominal 1000 mm external replacement opening. Product-level packing, service clearances, acoustics and heat rejection become explicit MEP-review questions at RH-11.

If actual equipment cannot fit with working clearance, first remove unnecessary buffer/ancillary equipment or reconsider equipment arrangement. Enlarging the permanent service suite is not the first response.

---

## 7. External heat-source geography

Create `ASHP-01` as the working external heat-source object.

Preferred position:

- **middle-to-rear portion of the east/service side beside `G-PLANT-01`**, within the service/bathroom field rather than below a bedroom opening;
- accessible from the same side/rear maintenance route used for plant replacement;
- clear of the principal front elevation and courtyard;
- separated from MVHR intake, cooker exhaust, bedroom openings and rainwater goods as competent acoustic/MEP design requires.

The current surrogate side clearance is approximately 1.75 m before projections. RH-10 therefore treats the external unit as a **real space consumer**: it may project into that strip only if a useful human/equipment route remains beside it. A real site must re-test neighbour noise and boundary constraints.

RH-06 already created the conditional external heat-source crossing object. RH-10 now activates that same identity rather than inventing a duplicate:

- `RH-P005-12 / PEN-HS-01` — bounded heat-pump flow/return, electrical/control and condensate/service crossing between `ASHP-01` and `G-PLANT-01`.

Keep it low, local and serviceable rather than routing external heat-source services through the roof or principal rooms.

---

## 8. Renewable electricity / PV reserve

The roof must no longer be described as if future solar generation were optional visual clutter.

Using the current **115.2 m² gross enclosed ground-floor plate proxy** as a deliberately conservative geometry stress test:

- 40% area equivalent = **46.08 m²**;
- at 0.22 kWp/m² this corresponds to about **10.14 kWp** of reference peak power.

These are **not compliance values**. The actual Future Homes calculation uses the defined dwelling ground-floor area and approved annual-output methodology. The purpose here is simply to prove that the RH-08 roof is not geometrically hostile to the known future requirement.

### Roof reservation

Reserve at least **approximately 50 m² of clear PV-capable roof field** across the four RH-08 outward-draining roof surfaces before a real orientation is known.

The reserve is distributed rather than committed to one compass face. A real site may concentrate the array on better-performing fields, but it may not assume a north-facing or shaded field is automatically excluded from the regulatory calculation.

### PV rules

- keep primary drainage lines, gutters, overflows and inspection routes visible and reachable;
- preserve clear maintenance approach around array edges and to `PEN-SV-RF-01`;
- do not bridge the courtyard opening;
- keep active inverter / isolation equipment in `G-PLANT-01` or another genuinely accessible service position rather than placing avoidable electronics beneath modules;
- use sparse designed roof attachments or another engineered mounting family; do not casually puncture the waterproofing field;
- coordinate ballast/attachment loads with roof structure;
- record module and cable replacement routes.

A battery is **not selected**. It would add fire, ventilation, replacement and cost obligations and must earn itself later.

Create one genuinely new crossing family:

- `RH-P005-16 / PEN-PV-01` — dedicated PV electrical boundary crossing from the east/service roof field into the service/riser geography, with weathering, fire, airtightness and safe-isolation obligations.

---

## 9. RH-08 roof-access consequence

Adding PV does **not** automatically reverse RH-08's no-hatch decision.

PV creates additional rare roof tasks—inspection, module replacement and cable/mounting work—but the selected external scaffold/tower route still provides:

- safe roof arrival;
- working platform;
- edge protection;
- material handling.

A hatch would still provide only arrival and would introduce another permanent roof interface. Reopen that decision only if technical PV layout makes recurring internal roof access materially safer or simpler overall.

---

## 10. What remains external / specialist

RH-10 does not prove:

- design heat loss;
- heat-pump capacity or acoustic compliance;
- radiator sizes / flow temperatures;
- DHW cylinder capacity or recovery time;
- MVHR / heat-pump combined plant-room acoustics;
- SAP / Future Homes compliance;
- PV annual output, exact area, mounting or inverter duty;
- electrical network/export constraints;
- actual neighbour/boundary effects.

Those are now **bounded questions attached to explicit geometry**, which is the correct state for RH-11 review.

---

# RH-10 corrective result

**PASS at architectural coordination level.**

The house now has a coherent heating / DHW / renewable-energy topology without enlarging the shell, deepening the structural floor or embedding an unproven technical system into principal architecture.

Selected working family:

**air-to-water heat pump → plant-room DHW/hydraulic equipment → low-temperature accessible radiator distribution**

with:

**approximately 50 m² roof PV-capable reserve → accessible plant-room electrical conversion/control**.

Neither ASHP nor PV is promoted into general House Kernel doctrine by this project selection.