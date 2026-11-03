# RWT-06 — outward-only pitched roof: remove the court's roof-water burden?

**3 November 2026. Bounded architectural alternative, NOT a new selected Reference House source or RWT-06 closeout.** The original [ROF-07 comparative family](../rof/rof-07-system-synthesis.md) proposes an outward-only pitched roof; this study transfers that question to the **selected HAD-B/open-loggia** courtyard and its actual +7100 roof datum. The [source-bound calculation](studies/outward-court-load.mjs) and [regression tests](studies/outward-court-load.test.mjs) reuse the pinned HAD/MAT input contract of the [open-loggia failure study](rwt-06-open-loggia-event.md). This is a counterfactual against selected geometry, **not** a claim that the HAD source already describes an outward-draining roof.

## Architectural diagnosis and candidate

The source's 25° inward/outward ring allocates **47.8125 m²** of projected roof to the 3.5 m square court, in addition to **12.25 m²** of direct court rain at the wall line. This is the origin of the combined **60.0625 m²** court stress that has driven the narrow high-eave receiver, complex live-diversion trials, blocked-collector hazards and difficult repairs. The interior court is asked to dispose of water captured on a much larger roof. Downpipes, pumps, duplicate outlets, deeper pans and elaborate access do not erase that gravitational topology.

**Challenger: drain every ordinary pitched ring face outward to the four exterior edges, retaining an open pitched roof throughout.** The courtyard still receives its own rain, but no *ordinary roof-face* runoff. The implied high point is at the courtyard rim rather than the middle of each wing; the roof must join its corners and exterior eaves without a hidden flat/valley or service inside permanent masonry. Proper detailing and failure analysis of the high inner edge, hips and exterior collector are separate ROF/STR/MAT/RWT duties.

### Water conserved, not eliminated

All figures below use the **same wall-line horizontal projection**, coefficient-one vertical rainfall and the existing illustrative **216 mm/h** stress, not a selected design event, climate allowance, wind-effective area or product capacity. Do not pair a 200 mm overhang-adjusted inner projection with the full court area: that double-counts sheltered strips.

| Quantity | Current inward/outward ring | Outward-only candidate |
|---|---:|---:|
| Roof projection draining toward court | 47.8125 m² | **0 m²** |
| Direct court projected area | 12.25 m² | **12.25 m²** |
| Court receiving load at 216 mm/h | **3.60375 L/s** | **0.735 L/s** |
| Ten minutes of court load (no discharge) | 2,162.25 L | 441 L |
| Roof projection draining to exterior | 83.9375 m² | **131.75 m²** |
| Exterior roof load at 216 mm/h | 5.03625 L/s | **7.905 L/s** |

The transfer is exactly **47.8125 m² / 2.86875 L/s** from the court-side roof to exterior roof collectors. It reduces that ideal court load by about **79.6%**, but increases the exterior roof duty by about **57.0%**, without yet allocating peaks among the four edges. In the separately consistent 200 mm inner-overhang model, **9.61 m²** of the court is exposed to straight vertical rain; this cannot be substituted into the wall-line exterior totals without also modelling changed roof projections.

At the existing **60 mm mouth obstruction / 600 mm remaining clear opening** control, the same ideal low-approach rectangular-crest formula changes the hypothetical upstream stage from **−26.85 mm** (present full court load) to **−41.98 mm** (direct-court-only alternative), against the **unqualified** −30 pan/DPC comparison. This **does not establish a safe level, permitted debris width, hydraulic pass or waterproof joint**: there is no real inlet/crest, losses, wind/splash or downstream head. In particular, a **common high tailwater at −30** still reaches that same vulnerable interface even if the roof contributes no inflow. The court must retain an independent passive surface escape and an actual first-harm/water-level design.

### The architectural price is height at the court edge

The selected HAD source gives exterior eaves **+7100 mm**, present 25° roof ridge **+8090.904 mm**, and **4250 mm** from exterior wall to court. Holding the exterior eave and changing roof drainage to an outwardly falling pitch puts the court rim at `7100 + 4250 × tan(pitch)`.

| Outward pitch, hypothetical | New inner/court high edge | Above current +7100 court eave | Relative to current +8090.9 ridge |
|---:|---:|---:|---:|
| 5° | +7472 mm | +372 mm | −619 mm |
| 8° | +7697 mm | +597 mm | −394 mm |
| 12° | +8003 mm | +903 mm | −88 mm |
| 15° | +8239 mm | +1139 mm | +148 mm |
| 25° | +9082 mm | +1982 mm | +991 mm |

The precise geometric ceiling to stay no higher than the current selected roof ridge is **13.124°**. This **does not preserve the current +7100 courtyard eave**: every positive outward pitch raises that rim if the exterior eave remains +7100. The 25° version worsens the enclosed-court height substantially; do not inherit ROF-07's old +6800 historical datum as the current house. Shallower **5–12° roof-plane challengers** deserve a real ROF assembly, fixing, movement, wind, snow, watertightness, access, daylight, elevation and construction comparison. A shallow pitched *metal roof system* is not the same as an arbitrary near-flat membrane, and no product or minimum pitch is selected by this study.

## Four actual roof faces, not four unexplained drainage arrows

The [finite annular four-face model](studies/outward-four-face-topology.mjs) takes the selected 12,000 mm house, 3,500 mm central court (x/y4250–7750), +7100 exterior eave and a **hypothetical 5°** outward pitch. For every point on the roof annulus, define height `z = 7100 + tan(5°) × min(x, y, 12000−x, 12000−y)`. The open 3500 ×3500 court **has no roof surface**. This is a compact exact height-field for four planar surfaces: the minimum distance to an outer house side identifies the face and direction of downhill flow. There is no flat *area* or inward valley in this ideal topology; linear hips and a high closed rim remain.

| Planar face | Exterior low edge | Interior high edge | Wall-line projected area |
|---|---|---|---:|
| South | (0,0) to (12000,0) | (4250,4250) to (7750,4250) | 32.9375 m² |
| East | (12000,0) to (12000,12000) | (7750,4250) to (7750,7750) | 32.9375 m² |
| North | (0,12000) to (12000,12000) | (4250,7750) to (7750,7750) | 32.9375 m² |
| West | (0,0) to (0,12000) | (4250,4250) to (4250,7750) | 32.9375 m² |

Each face is a trapezoid: outer width 12,000, inner width 3,500, perpendicular run 4,250. Four diagonal **hips** connect the four exterior corners to their corresponding court corners. The entire outer edge is at +7100, and the high inner roof line is +7471.83 for 5°. The source-bound [tests](studies/outward-four-face-topology.test.mjs) probe both perimeters, every hip and strictly outward descending sample lines, reject invented roof points in the open court, and conserve all **131.75 m²** of roof area. At the existing 216 mm/h vertical-rain sensitivity, each face conveys an *unallocated* **1.97625 L/s** toward its own outer edge. This is not gutter sizing: corner/hip water delivery, real eaves, outlet count, wind, overflow and shared site flood remain unknown.

**Unexpected cost: the loft/attic envelope.** HAD's selected section has an **attic datum +6900**. A vertical distance between a roof plane and that datum is merely a *raw geometric upper bound* before joists, roof build-up, insulation, support, floor, ventilation and working clearance:

| Topology | Maximum raw roof elevation above +6900 attic datum | Raw width of a zone at least 2000 mm high |
|---|---:|---:|
| Existing inward/outward 25° ridge at +8090.9 | **1191 mm** | **0 mm** |
| Outward 5°, high court rim +7471.8 | **572 mm** | **0 mm** |
| Outward 12°, high court rim +8003.4 | **1103 mm** | **0 mm** |
| Outward 25°, high court rim +9081.8 | **2182 mm** | **390 mm** adjacent to the high inner edge |

For this unchanged +6900 datum, achieving even **2000 mm of raw height at the high court edge** needs at least **22.954°** outward pitch, which elevates that edge to +8900. It provides zero allowance for structure/insulation and says nothing about useful continuous floor width, loft equipment transport or access. Even the **existing** selected 25° ring peaks at only 1191 mm above this datum; that is a pre-existing architectural programme conflict if an occupied, maintainable loft is required, not a defect unique to outward shedding. Verify exactly what `atticDatum` denotes and reconcile it with the intended plant/attic/roof-maintenance function before choosing any roof family. Moving all water outside cannot be purchased by silently deleting the loft or turning access into inaccessible interstitial voids.

This geometric field proves **a viable continuous surface topology to develop**, not a buildable roof. ROF/STR/MAT must author the hip joint, continuous inner high-line cap/weathering, thermal and structural assembly, real member depths and maintenance/roof-opening routes. HAD must accept both the changed court silhouette and the genuinely usable attic volume. Every exterior edge still needs an accessible collector and harmless blocked-state receiving route. No permanent roof source has been changed.

## Service deletion is conditional; the court's water risk survives

The outward four-face surface has **no ordinary roof-facing inward low edge**. If ROF/HAD eventually adopt that exact drainage topology, the court would have a **high weathered rim, not a court-side rainwater collector**. That would retire the current selected-ring *court gutter* clearing, full receiver withdrawal and live roof-to-court temporary bypass duties **because the component and its flow no longer exist**. It would **not** retire inspection and repair of the high rim, hips, weathering or the roof itself. Nor would it allow a high-level access route to be deleted without ROF/STR/HAD proving how those remaining tasks are done. This is a **conditional change in design obligations**, not a declaration that the selected +7100 inner receiver has already been removed.

| Distinct state at 216 mm/h wall-line sensitivity | Current selected inward/outward ring | Outward-only four-face challenger |
|---|---:|---:|
| Court inflow with all selected inner roof water discharged into it / challenger roof shedding intact | 3.60375 L/s | 0.735 L/s |
| Exterior roof-water burden | 5.03625 L/s | 7.905 L/s |
| Court-only ideal empty geometric pool to the **unqualified** −30 join under a completely blocked outlet | 280 L | 280 L |
| Constant-inflow volume÷rate equivalent for that 280 L | **77.7 s** | **381.0 s** |

The pool is computed from the pinned HAD/MAT sloping-court strips, not from a fictitious 80 mm deep square basin. These two inflow columns are **different defined failure/operation cases**, not simultaneous design capacities or forecasts. They deliberately illustrate that removing roof-to-court transfer increases the *ideal* blockage-volume timescale by 4.9× without creating a passive exit. They assume an initially empty, completely isolated court-only pool and constant vertical rain, with no incoming terrace/side water, ponding dynamics, capture losses, surface jetting, wind, existing water or leakage. The −30 join is **not a proven allowable level or first leak**. In particular, **381 seconds is not safe detention or an evacuation/maintenance response window**. The exact arithmetic is regression-checked against the source-bound [open-loggia event](studies/open-loggia-event.mjs) and [roof-load comparison](studies/outward-court-load.mjs).

A more forgiving roof changes the *burden* of proof, not the minimum safety topology:

1. **No court-side roof collector** is earned only after the adopted ROF/HAD/STR/MAT sections demonstrate continuous outward falls, all hips and high-edge weathering, actual exterior interception and safe external overflow. Do not spend more design effort on detachable inner gutters for a roof family that may delete them.
2. **Court escape remains indispensable.** Direct rain still enters the sloping court. A blanket across the intake and loggia mouth, or common high receiving water, still offers no established harmless outlet. Reduction of inflow is not a second independent path; re-test operating water level against an *established* first-susceptible boundary with head, debris, splash and safe exterior relief.
3. **Exterior eaves inherit every displaced litre.** Each of the four ideal 32.9375 m² faces contributes 1.97625 L/s to its own edge at this sensitivity; a gutter blocked over one face must shed away from vulnerable fabric and foundations into a physically available receiving territory, independent of the court's failed-state receiver. Outer roof access and actual plot clearance still need proof.

**Decision:** develop the outward-only collector-deletion alternative as an architectural scope reduction, not a qualified drainage system. Keep the present inner-court gutter maintenance obligation on the **selected** roof until that architectural adoption and joined rainwater/source evidence occur. RWT-06 stays planned.

## The selected house does not promise an occupied or serviced loft

The preceding raw-head envelope is a **conditional use test**, not proof that the currently selected house has lost an actual loft room. The pinned HAD-B source explicitly states **no free attic storage** in its roof development. Its protected-route door register places **PLANT on GROUND**, while the ground-furniture inventory locates the water reserve, riser, complete round primary buffer and plant controls on that storey. The selected service projection locates the cylinder, buffer and controls in the ground plant territory; roof/flue service is described as requiring **external scaffold/lift, not attic access**. This supersedes treating older discussions of an attic plant room as an installed or selected current-house requirement. It does **not** pre-empt a later owner decision to require one.

There is a real geometric **no-go if a future 2000 mm *raw* loft-height requirement is imposed simultaneously with the existing maximum roof-ridge height**. At the retained +7100 exterior eave and +6900 attic datum, an outward roof whose inner high edge does not exceed today's +8090.904 ridge can achieve at most **1190.904 mm raw height** at its highest court edge. Achieving even 2000 mm of raw height there requires a **22.954°** outward slope and a +8900 high edge, **809.096 mm above today's ridge**—before structural, insulation, floor and maintenance clearances. The unchanged current 25° inward/outward ring is also limited to 1190.904 mm raw at its ridge. These results are exact height-datum arithmetic, not human-use headroom approvals.

**Consequence for the RWT roof challenger:** do not reject 5–12° outward pitched forms because they fail an *unselected* occupied-attic criterion. Equally, do not claim that no loft need means a roof can be made arbitrarily shallow. The actual remaining ROF/HAD/STR/MAT gate must reconcile a complete covering at its documented pitch, roof build-up, upper-storey ceiling/support and fire interfaces, maintainable high rim, hips and external access. If a loft plant or internally accessed roof service is reintroduced, HAD must revise the occupancy/plant and roof-height brief explicitly before roof-water selection. The [source-bound regression](studies/outward-four-face-topology.test.mjs) enforces this distinction; no geometry is adopted here.

## Specific design decision and tests before selection

**Prefer studying removal of the inward roof-water load before further refining temporary court-water bypass hardware.** The transfer is large enough to change the task; it is a more promising architectural simplification than an inaccessible second gutter. It also trades the problem for exterior collector capacity, site access, the higher court rim and roof system requirements, so it is a *challenger*, not a preapproved solution. ROF owns the new coupled roof/edge/corner section, HAD the courtyard/elevations/daylight, STR the span and supports, MAT the complete roof-material assembly, OAS its thresholds, RWT the outer gutters/receivers and court outfall, and DPL the lawful independent exterior receiving territory.

A next ROF/HAD candidate needs: (1) actual sloping surfaces, corner/hip topology and pitched drains with no trapping low point; (2) a documentably matched shallow-pitch roof assembly and renewal path; (3) a courtyard view/daylight and actual high-edge maintenance section; (4) a wall-line and actual-overhang catchment split including wind, blocked exterior gutters and simultaneous court rain; (5) a continuous, inspectable exterior receiver with full-duty failed-state escape outside vulnerable paths, and independent site handoffs; and (6) the selected court's normal inlet, −30 unqualified first-harm boundary, blocked mouth, blanket failure, high tailwater and wet replacement all re-tested at the *new* loads.

**Disposition:** retain the selected roof as baseline until ROF/HAD provide the new source. Keep RWT-06 **planned**; RWT-07/ROF-RWT-GATE must compare this architecture with the original coupled ring once its roof, drainage and access details genuinely exist. No exterior receiving capacity, safe court overflow, construction detail, site boundary or material acceptance is inferred.

Reproduce arithmetic against the pinned current HAD/MAT source with `node project/rwt/studies/outward-court-load.mjs`; the test is part of `npm run test:rwt`.
