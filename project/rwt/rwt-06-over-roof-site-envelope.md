# RWT-06 — temporary over-roof site territory and DPL handoff

**2 November 2026. Pre-site conditional development only.** [Source-generated data](studies/over-roof-site-envelope.json), [A3 plan](studies/over-roof-site-envelope.svg) and [generator](studies/over-roof-site-envelope.mjs) consume the exact selected [temporary over-roof trial](studies/over-roof-service.json) (Git blob `fe27b9697b5da34213d506f5c1bbd871db51a636`). They do not amend the house or establish an approved temporary roof, plot, scaffold, access method or drainage system.

## The actual reservation is larger than the roof sheet

| Layer in the current *hypothetical* source | X extent (mm) | Y extent (mm) | Bounding rectangle |
|---|---|---|---|
| Nominal Keder sheet | −1700…13700 | −2995…14995 | **15.40 × 17.99 m** |
| Sheet, both eave gutters, 32 trial 400 mm sole boards | **−1900…13900** | **−3195…15195** | **15.80 × 18.39 m** |
| Above, with the currently imagined outward front exit gate | −1900…13900 | **−3995…15195** | **15.80 × 19.19 m**, conditional |

For this particular aligned arrangement, the second rectangle extends **1900 mm west/east** and **3195 mm front/garden** from the 12 m house wall line. The gate option extends the front reservation to **3995 mm**. The gutters add 200 mm beyond the nominal roof sheet on each side; the outermost sole boards add 200 mm past the sheet at each end. This deliberately counts equipment and projection only once.

These are **axis-aligned bounding rectangles**, not minimum legal parcel sizes, required setbacks, occupied floor areas, scaffold loading areas, or evidence of an actual rectangular plot. Equipment does not occupy every interior point. A different retained design, rotated placement or irregular site might use a different footprint; equally, ties, bracing, staging, hoists, cranes, deliveries, rescue, egress, ground bearing, protected trees and genuinely separate water disposal may require much more.

## A plot can fit the sheet but fail the job

A notional rectangle of **15.40 × 17.99 m** centered on the selected house contains the nominal sheet but **fails** the authored gutters and sole boards. Merely increasing it to the 15.80 × 18.39 m equipment envelope still does not contain the conditional front gate swing. Even the expanded envelope has an unresolved **east plant-door versus sole-board collision**: the idealised leaf first touches at **7.58°**, before considering hinge geometry or necessary clearance. No amount of area arithmetic certifies that the door can operate, the scaffold is stable, or people can escape.

The full-cover setup is therefore **a large site and maintenance constraint**, not free flexibility automatically supplied by a 12 m house. The possible decision is to reserve this territory for a future real plot or reject the *full over-roof* maintenance proposition and redesign water/roof renewal at a smaller controlled footprint; it does **not** justify erasing permanent house access, safety equipment or a live water route.

## An equipment-fit rectangle cannot prove an outward overflow

The two hypothetical gutter **exterior lips** are x **−1900** (west) and **13900** (east): they lie **exactly on the lateral boundaries** of the current 15.80 m-wide equipment bounding rectangle. Therefore the current model reserves **zero positive width** beyond either lip. A nominal free-spill path which leaves either lip outwards immediately leaves this rectangle. This is a source-derived *negative topology test*, not a water-jet prediction: gutter lips, trajectories, wind, splash, real land boundaries and lowest first harm are not verified.

A site which contains the whole depicted scaffold/equipment rectangle has **not** thereby demonstrated harmless blocked-gutter spillage. RWT must locate a separate, supported and positively routed overflow and receiving territory, including common outlet/tailwater failures. DPL must verify the land and lawful access/rights needed outside the equipment reservation, or test a genuinely independent alternative contained inside a different engineered arrangement. Neither a gutter counting exercise nor a large temporary sheet alone proves this.

**Design decision:** a whole-house temporary over-roof is an **optional, plot-dependent major-repair technique**, not a premise on which the house's ordinary rainwater maintainability may rely. The permanent roof and collectors must have their own explicit cleaning, local withdrawal, first-harm and safe passive rain-failure states. The over-roof stays a conditional *challenger* for a future real plot, not a preferred requirement or approved installation. The [generated conditional overflow screen](studies/over-roof-site-envelope.json) encodes the zero-width counterexample and is regression-tested.

## Precise handoff

DPL's [owner-site brief](../dpl/owner-site-brief.md) already requires source-bound external works geometry. For a specific plot, DPL must place these **same x/y rectangles under the actual orientation** and assess usable boundary and rights, neighbouring fabric, underground assets, trees, topography and routes for erection/removal. RWT must locate *independent safe* overflow/receiving territories and a real `SITE-WATER-HANDOFF`; STR/temporary-works and DEL must resolve supports, installation, service access and safe reversal; OAS/HAD must reconcile the actual gate and plant door.

The delivered generator rejects drift in the parent over-roof model, while its tests check all 32 board placements, bounding extents, the false sheet-only fit and the conditional gate. **RWT-06 remains planned**: this screen neither proves hydraulics, water-level safety, material policy, scaffold foundations, lawful occupation nor the broader rainwater network.

Run `node project/rwt/studies/over-roof-site-envelope.mjs --check` to verify deterministic data and drawing from the pinned current over-roof source.
