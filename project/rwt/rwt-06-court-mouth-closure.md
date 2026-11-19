# RWT-06 — outward roof does not prevent closed-mouth court wetting

**4 November 2026 — decisive adverse volume/first-harm screen for the [joined outward-roof, wettable-surface candidate](rwt-06-integrated-roof-court-recomposition.md).** No selected roof or threshold changes. The candidate transfers routine inner roof water to the outside and reduces the court's direct area-based inflow, but this is **not proof of an independent fault-safe rainwater system**. Test the simpler and fatal question directly: **what level does direct court rain reach if the entire north mouth is closed?**

The [source-linked inversion model](studies/court-outlet-closure.mjs) consumes the selected HAD/MAT court geometry, the existing [open-loggia event/volume calculation](studies/open-loggia-event.mjs), and the joined candidate's [roof/court composition](studies/court-roof-recomposition.mjs). Five [adverse regression tests](studies/court-outlet-closure.test.mjs) guard exact area identity, failure assumptions, stage/volume arithmetic, the absence of an invented response clock and selected-source drift.

## What the geometry actually holds

The selected court is 3500 ×3500 mm. Its south 1500 mm strip slopes from 0 to −30; its north 2000 mm strip slopes from −30 to **−110** at the only currently selected open north mouth. In an intentionally *hydrostatic, perfectly communicating court-only* geometry with no outflow or other storage:

| Uniform comparison level | Ideal water stored above the two selected floor strips |
|---|---:|
| **−30 mm**, current unqualified pan-end/masonry/DPC wetting comparator | **280 litres** |
| 0 mm, south occupied surface | **568.75 litres** |
| +15 mm, geometric door crest | **752.50 litres** |

These quantities are neither a watertight basin certification nor an assumption that wall joints can resist standing water. The **−30 interface is unqualified for any immersion**; a lower seam, anchor, cavity or splash path may be the controlling first harm. The +15 door-crest geometry is not an alternative first-leak design datum.

## Complete north-mouth obstruction — no receiver at all

For the *unselected* outward-only roof candidate, model **direct court rain only** in a **synthetic constant 10-minute** 72/144/216 mm/h stress, assuming all falling vertical rain reaches the two-strip court. Two mutually consistent area conventions are tested: the **12.25 m² wall-line court**, and **9.61 m² exposed court** under the earlier *hypothetical* 200 mm inward overhang; the latter is not a new roof source or accepted overhang protection.

With *zero* route out of the court (full-width leaf/debris dam, collapsed path or fully closed tailwater outlet), invert exactly the floor-strip storage. The result is a **geometric head comparison**, not actual water levels under transient rain, inlets, splash, leakage or uneven pooling:

| Illustrative intensity / 10 min | Gross wall-line 12.25 m²: rain and ideal stage | Offset-exposed 9.61 m²: rain and ideal stage |
|---|---|---|
| 72 mm/h | 147 L → **−52.03 mm** | 115.32 L → **−58.66 mm** |
| 144 mm/h | 294 L → **−28.05 mm** | 230.64 L → **−37.39 mm** |
| **216 mm/h** | **441 L → −11.35 mm** | **345.96 L → −21.48 mm** |

At the **216 mm/h** comparison, **both** area conventions exceed the ideal **−30 mm** wetting comparator—by **18.65 mm** and **8.52 mm** respectively. This happens **before** the courtyard water has to reach the 0 mm occupied south surface or the +15 geometric door crest in the wall-line model. A roof that sends *no ordinary roof-face runoff* to the court does not therefore protect a lower, weak wall-base junction if the one escape mouth is disabled. It cannot inherit a supposed **full-width N+1** from the same opening.

Dividing the ideal **280 L** geometrical capacity at −30 by either assumed constant inflow would produce a synthetic volume/rate number. The executable model deliberately **does not export that number as a time**: it is **not an evacuation allowance, safe detention period, time to real leakage or maintenance response window**. Actual wind, pond connectivity, fabric weaknesses, splash, storage outside the court, court entry/exit blockage and backed-up site water are unknown. These omissions could move a real first-harm point **earlier**, not simply later.

## Design consequence: a roof reversal helps, but is insufficient

**Rejected inference:** eliminating the inner court roof gutter means the remaining 2400 mm wettable pedestrian surface can be accepted as the **only** flood escape from the open court. Even reducing direct exposed rain to 9.61 m² does not rescue that inference in the adverse 216 mm/h case.

The remaining **necessary architectural gate** is specific:

1. **OAS/MAT/HAD** must locate every real sill, pan, masonry/DPC, anchor, cavity and surface first-wetting boundary and demonstrate a physically maintainable assembly that tolerates the accepted ponding/exceedance heads; do not treat a drawn −30 line or +15 crest as a safe wetting datum.
2. **HAD/STR/RWT** must author a genuinely independent *passive* full event/spill path if that blockage case is within the accepted design duty. Two inlets into one closed 2400 north mouth or a low collector sharing its flooded garden are **not independent**. An independent opening may demand meaningful reallocation of the 12 ×12 m plan, and that price must be shown.
3. **DPL/RWT** must bind both normal and independent emergency flows to actual receiving terrain, lawful disposal, the maximum head of a flooded garden, foundation moisture and the site approach—not assume a −800 receiving-water box or quietly install a pump.
4. **People:** the north passage is an ordinary rain-wettable garden amenity path, not flood evacuation. A blocked route needs an actually viable safe human state for people in the garden, not the assertion that the house has a protected front hall.

At a real site, the accepted design might instead reject the exposed courtyard or reshape it fundamentally. **No alternative is silently adopted in this investigation.**

**Decision:** retain the 8°/+175 roof-and-court trial only as an **architectural development candidate**, and reject any claim of flood safety based on roof runoff reduction or visible surface drainage alone. RWT-06 remains **planned**, RWT-07 remains blocked, and the real source selection and first-harm/blocked-outlet proof are unresolved. Reproduce with `node --test project/rwt/studies/court-outlet-closure.test.mjs` (included in `npm run test:rwt`).
