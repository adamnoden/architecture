# Reference House — RH-11 MEP & Acoustic Review Brief

**Status:** ready for competent building-services / acoustic review  
**Parent pack:** [RH-11 External Review Brief](external-review-brief.md)  
**Current project maturity:** M3 coordinated virtual design; **no MEP sizing, commissioning or acoustic-performance claim**

## Review question

> **Can the selected plant, ventilation, heating, water, drainage and terminal topology be made technically quiet, maintainable and proportionate inside the current service geography without enlarging the house, deepening floors or turning the service side into an equipment yard?**

The preferred outcome is not “keep MVHR/ASHP at all costs”. The project already defines fallbacks where complexity ceases to justify itself.

---

## 1. Controlled service geometry

### `G-PLANT-01`

Approximate gross reservation: **2.9 × 2.2 m**.

It must plausibly accommodate:

- `MVHR-01` with filter / front service access;
- DHW cylinder and only the hydraulic equipment actually required;
- main water isolation / distribution;
- heat-pump controls / electrical controls;
- segregated electrical / data distribution field;
- physical service index;
- working access to `SV-01`;
- visible/manageable water-failure geography;
- equipment replacement through a nominal **1000 mm clear external opening target**.

It is intended as a small equipment room, not a cupboard.

### `SV-01`

Approximate clear reservation: **900 × 700 mm**.

Current classes:

- one 100 mm-class soil/vent stack;
- domestic-water risers;
- bounded low-temperature heating distribution where required;
- segregated dry electrical/data route;
- principal MVHR supply/extract trunks, currently assumed roughly in the **160–200 mm class** before technical sizing/support/insulation/fire treatment.

Structural starting opening around the zone: approximately **1050 × 850 mm**, not approved geometry.

### Ventilation

Selected baseline:

- central MVHR;
- mechanical supply to habitable rooms;
- extract from bathroom / utility / WC / kitchen background duty;
- cooker hood `KX-01` remains a separate direct grease/pollutant route;
- openable windows remain purge/overheating strategy;
- continuous MEV is the explicit fallback if MVHR's duct/acoustic/maintenance burden is disproportionate.

### Heating / DHW

Selected working baseline:

- external air-to-water heat pump `ASHP-01`;
- DHW cylinder in `G-PLANT-01`;
- bounded `HYD-G-01` / `HYD-U-01` low-temperature wet routes;
- generously sized passive low-temperature radiator/emitter family first;
- whole-house UFH deliberately not selected;
- fan coils deliberately not selected;
- no cooling plant reservation;
- no battery reservation.

If radiators become architecturally disproportionate after heat-loss design, joint-free ground-floor UFH in a non-structural replaceable screed is the first challenger—not an automatic whole-house switch.

### External/service-side geography

Current surrogate east/service side has approximately **1.75 m gross side clearance** before projections on the working plot assumption.

It carries or may carry:

- `ASHP-01` beside the plant/service field;
- MVHR intake/exhaust terminals;
- cooker exhaust;
- utility entries;
- rainwater goods;
- plant replacement access;
- ordinary human/equipment passage.

This side cannot be treated as infinite residual space.

---

## 2. Review documents / drawings

Primary:

1. [RH-10 Whole-House Coordination Audit](whole-house-coordination-audit.md)
2. [RH-06 Services and Failure Geography](service-topology-rh06.md)
3. [RH-06 Service Topology Overlay](service-topology-rh06.svg)
4. [RH-06 Riser Section](service-riser-section-rh06.svg)
5. [RH-07 MVHR Addendum](service-topology-rh07-mvhr-addendum.md)
6. [RH-07 MVHR Topology](mvhr-topology-rh07.svg)
7. [RH-10 Energy / Heat / Renewable Coordination](energy-heat-coordination-rh10.md)
8. [RH-10 Energy / Heat / PV Diagram](energy-heat-topology-rh10.svg)
9. [Service Crossing Register](service-crossing-register-rh06.md)
10. [RH-10 Outer Elevation Coordination](outer-elevation-coordination-rh10.md)
11. [External Access & Maintenance Plan](external-access-maintenance-plan.md)
12. [RH-07 Environmental Coordination](environmental-coordination.md)

---

## 3. Questions requiring an MEP answer

### Whole-house system choice

1. Given the house size, expected new-build airtightness/performance and current Part F/Future Homes direction, is **central MVHR** a technically proportionate baseline here?
2. Is **continuous MEV** the right first fallback, or is another family materially better if MVHR routing/noise fails?
3. Is the project separating background IAQ, purge/overheating and cooking source capture correctly?

### Plant-room packing

4. Can `G-PLANT-01` realistically contain MVHR + DHW cylinder + necessary hydraulics + controls/electrical + `SV-01` working access with maintainable service clearances?
5. What equipment should explicitly **not** be assumed—e.g. buffer vessel, low-loss header, manifold, secondary pumps—until a calculation earns it?
6. Can MVHR filters, DHW cylinder, valves and major components be serviced/replaced independently without a destructive equipment-unstacking sequence?
7. Is the nominal 1000 mm external replacement opening a useful reservation or should a larger/removable panel geometry be protected now?

### Riser / duct topology

8. Can two principal MVHR trunks, 100 mm soil stack, water and segregated dry services plausibly coexist in **900 × 700 mm clear** after insulation, supports, fire/acoustic closure and access?
9. What realistic trunk sizes / branch strategy would you test first for a four-bedroom house of this approximate internal area?
10. Are the proposed first-floor parallel-to-joist branch corridors plausible without inaccessible dampers or excessive pressure loss?
11. Can upper-floor distribution use landing/ceiling/roof-side geography without creating visible bedroom/courtyard bulkheads?
12. What cleaning / inspection provisions are actually useful for domestic ductwork rather than performative access?

### Heating / DHW

13. Is air-to-water ASHP a sensible virtual baseline for this house, with GSHP/heat network retained as real-site alternatives?
14. Is low-temperature passive-emitter/radiator distribution technically realistic for the expected envelope, or likely to become visually/physically disproportionate?
15. What design flow temperature / heat-loss range should trigger the UFH challenger rather than larger radiators?
16. Does a stored-DHW cylinder in `G-PLANT-01` remain the right topology for a four-bedroom family house, and what recovery/volume range is likely to drive packing?
17. Which heating-water pipe routes can credibly remain joint-minimised and accessible within the current dry/low-level architecture?

### External terminals / heat pump

18. Can MVHR intake/exhaust + cooker extract + `ASHP-01` coexist on the service side with safe separation, nuisance control and maintenance access?
19. Is a high-level wall intake/exhaust preferable to roof terminals once pressure loss, recirculation, prevailing wind and neighbour conditions are considered?
20. Does `ASHP-01` need a larger free-air / working envelope than the current side strip can reasonably provide?
21. How should defrost condensate, snow/ice risk, vibration and equipment base/drainage be handled without consuming the sole maintenance path?
22. What real-site neighbour/boundary conditions would force the heat pump to the rear or require a different source family?

### Water / drainage / failure

23. Is one primary soil stack still credible for the selected bathroom/WC/kitchen/utility arrangement?
24. Are the short kitchen and bathroom branches genuinely favourable once actual sanitary fixture positions and falls are applied?
25. Does the water-failure strategy—accessible joints/valves, joint-minimised hidden runs, visible riser/plant leakage—make technical sense without excessive containment?
26. Are there any hidden condensation / drain-trap / condensate routes from MVHR/ASHP/DHW that need a new project object rather than generic plumbing?

---

## 4. Acoustic questions

The project prioritises **repose**. Technical compliance alone is not enough if the house develops a persistent audible machine layer.

Please attack:

1. likely airborne / structure-borne noise from `MVHR-01` in `G-PLANT-01`;
2. duct breakout and room-to-room crosstalk through the supply/extract network;
3. attenuator volume and its effect on plant-room/riser packing;
4. soil-stack and drainage noise beside the upper bathroom/gallery;
5. hydraulic valve/pump noise and low-temperature emitter flow noise;
6. ASHP sound at nearest bedroom openings, garden/courtyard occupation and surrogate neighbour boundaries;
7. vibration transmission through heat-pump mounts / pipe crossings;
8. cooker-hood noise needed to deliver useful source capture;
9. whether the plant-room enclosure needs spatially significant mass/isolated linings that the current plan has not allowed for.

Please recommend **design targets / methods**, not simply minimum statutory positions, where good residential acoustic practice is materially stronger.

---

## 5. Required red-team cases

### M-RT1 — plant room does not pack

Assume competent product selection shows that MVHR, DHW and required hydraulics cannot all be serviced in `G-PLANT-01`.

Test corrections in this order:

1. delete unnecessary ancillary equipment;
2. rearrange / change equipment family;
3. use external/service-side component where appropriate;
4. reconsider MVHR versus MEV;
5. only then ask for more permanent room area.

State when the problem becomes an RH-02/RH-06 rewind.

### M-RT2 — `SV-01` is congested

Assume real duct/fire/acoustic/support geometry will not fit the **900 × 700 mm clear** zone.

Test:

1. route one ventilation trunk separately;
2. split local wet/air sub-zones;
3. invoke MEV fallback;
4. only then enlarge the riser.

State which response is technically cleanest.

### M-RT3 — ASHP noise/location fails

Assume the surrogate 1.75 m service strip and neighbour/bedroom relationships make the selected ASHP position acoustically unacceptable.

- Can the unit move to the rear service corner without breaking replacement/access geography?
- What site condition would make air-source itself the wrong family?

### M-RT4 — radiators become architectural machinery

Assume room heat-loss calculations require very large emitters at the desired low flow temperature.

- What is the best technical response: better fabric, higher flow temperature, selected UFH, alternate emitters or another system?
- Which response preserves the project's lifecycle/failure logic most cleanly?

### M-RT5 — MVHR acoustics force duct growth

Assume acceptable bedroom noise requires materially larger ducts/attenuators than RH-07 anticipated.

- Can routes be rebalanced within the architecture?
- At what point should MVHR be rejected rather than floors/core enlarged?

---

## 6. Rewind / fallback conditions

### Invoke an explicit system fallback rather than architectural growth when:

- MVHR cannot fit or remain quiet/maintainable proportionately → test **continuous MEV**;
- passive radiators become disproportionate → test selected UFH / alternate emitter only after heat-loss/fabric review;
- ASHP service-side position fails → test rear position / real-site alternative heat source.

### Treat as likely architectural rewind if:

1. `G-PLANT-01` must grow materially after unnecessary plant is removed;
2. `SV-01` must grow materially after the declared split/MEV fallbacks are tested;
3. major ducts require a new continuous ceiling/floor service zone through principal rooms;
4. ASHP or terminals consume the sole service-side maintenance route and no rear solution works;
5. service-noise control requires material wall/room rearrangement;
6. foul/water topology requires a second permanent stack or long gravity route across protected structure;
7. a required technical system forces rooftop plant or new roof penetrations extensive enough to reopen RH-08.

---

## 7. What the project wants back

Please return:

- whole-system disposition: MVHR/MEV, ASHP, DHW, emitters;
- a **credible plant-room packing sketch or dimensional schedule** sufficient to test the room, not a construction design;
- likely riser trunk/service envelopes;
- terminal / ASHP separation and access constraints;
- acoustic risks and recommended residential targets/methods;
- material findings / fallbacks / rewinds;
- commissioning, balancing and handover obligations worth preserving in the design;
- at least two ordinary counterexamples that break the current topology;
- the standards / CIBSE / manufacturer / acoustic methods used.

The project would rather lose MVHR or an en-suite-like convenience than enlarge the architecture to preserve a technology choice.