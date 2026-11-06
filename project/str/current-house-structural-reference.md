# Current selected house — structural re-entry

STR-HOUSE consumes the architectural independent-water source merged in PR1332. This is structural development, not a whole-house structural selection. The [interface audit](studies/current-house-interfaces.json) preserves historical calculations and their input guards.

## Resolved local design comparisons

The new bridge has support axes 1,600 mm apart and 1,000 mm clear between its 600 mm nodes. The court core acts 132.5 mm east of axis X = 7,950; the new weather leaf acts 371.25 mm east of axis X = 9,300. Those are the actual eccentricities, rather than the old grid's offsets.

The [bridge calculation](studies/current-house-bridge.json) uses declared C30/S500 properties. It assigns gross wall-mass envelopes, separate floor and ceiling budgets, the actual ordinary roof-seat action, and a 5 kN characteristic wet-carriage/rail point budget. All absolute ingredient torques go to one end; favourable cancellation and equal torsional sharing earn no capacity. The 250 mm field passes the declared section screens at both 40 and 50 mm cover. Its reinforcement is 4H20 at each face in the 600 mm court member, or 4H25 at each face in the 900 mm spine member, with four-leg H10 links at 75 mm. The 200 mm alternative fails. These are enforced design budgets and section comparisons, not a measured takeoff or construction acceptance.

The [representative node](studies/current-house-nodes.json) widens each spine node to 900 mm east–west by 600 mm north–south. This supports the complete weather-wall footprint with 27.5 mm east reserve, adds 2.565 kN concrete per node, and preserves 50 mm to the water portal. The declared node domain is N ≤ 850 kN and |Mx|, |My| ≤ 100 kNm. Its conservative tie demand is 385.14 kN per direction against 682.95 kN from 5H20. Orthogonal top and bottom layer elevations, cover, clear bar spaces and 750 mm straight anchorage reservations are explicit. That is a force-and-space reference; it does not certify the pile, soil, reinforcement intersection or shop cage.

The current joined reference initially retains a 450 mm field depth. The passing 250 mm section is not automatically an anchored shallow bridge: its lower bars lie 200 mm higher and require an explicit force-turn/development detail. The deep nodes remain at −750 mm. No water-bed, floor or grade change follows automatically from the section result. The old 600 mm spine node is rejected because 122.5 mm of its weather leaf lies beyond the node, even when the field member itself is 900 mm wide.

The [raised tie and end shoes](studies/current-house-tie.json), shown in the [section](studies/current-house-tie.svg), retain the formed 40 mm bore at Z = 2,200 mm and the original M30 end hardware. A 100 × 20 mm central strap at Z = 2,240 mm clears the complete 2,300 mm incoming component after 7.006 mm self-weight sag, without favourable tension: reserve is 35.244 mm at the court portal and 71.094 mm at the garden portal. The earlier 12 mm strap fails that same sag test.

The offset shoes transfer through the existing M30 rods and lower RC-face compression pads. A rod force of 1.8H at Z = 2,200 mm, opposed by a pad force of 0.8H at Z = 2,150 mm, gives resultant H at Z = 2,240 mm. The governing archived thrust H = 29.979 kN demands 53.963 kN rod tension against the declared 102 kN section resistance. Raw arch clearance is 32.442 mm; no voussoir drilling is inferred. Crosshead, toe, cheek and shop-weld force screens are explicit. The enlarged formed collar replaces the old 50 mm finish assumption and carries a real thermal/fire/material detail cost. Actual splitting, threads, welds, collars and installation remain STR-RECONCILE duties.

## Whole-house exit still to earn

| Duty | Current state |
|---|---|
| Changed bridge actions and eccentricities | Source-bound section comparison reproduces |
| Incoming component versus actual north ties | Explicit raised strap and equivalent-force shoes reproduce |
| Spine node bearing and representative force/space envelope | 900 × 600 mm reference now located; final cage fabrication remains downstream |
| Whole-house gravity and signed lateral/uplift ledger | Active: allocate actual roof, wall, slab and service origins once to named supports |
| Roof corners and collector continuity | Active: the historical collapsed corner envelope is not a complete jack/hip/collector route |
| Current RC200 / glass100 / mineral-DPC bearing and occupation | Active: join actual continuous load/restraint path without silently importing the older warm/cold floor comparison |

Selection requires the last three duties and actual critical reactions to fit their declared support domains. Final multi-arm anchorage fabrication, thermal/material qualification and actual site/physical acceptance remain downstream; an identified insufficient bearing or unexplained transfer does not.

Method provenance is the [JRC 2008 Walraven presentation](https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/EN1992_1_Walraven.pdf), torsion slides 83–89, alongside the owning RC method. This dated source establishes method provenance, not current UK or National Annex compliance. Run `npm run test:str` for the existing fourteen regressions and four current source-bound reproducers.
