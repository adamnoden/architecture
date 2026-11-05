# RWT-06 — court/plant space exchange for a second weathered eastern route

**5 November 2026 — source-bound architectural option screen, not a changed house selection.** The previous [northeast-corner trap](rwt-06-east-corner-pier-trap.md) found that even a **bare** 1200 mm east strip with an illustrative 200 mm court-corner pier needs a 247 mm south shift of the selected plant wall. That arithmetic omitted the boundary between an outdoor wet passage and a protected plant room. This continuation prices a **complete-width wall reservation** before further drainage detail. [Executable comparison](studies/court-plant-space-exchange.mjs) and [five regressions](studies/court-plant-space-exchange.test.mjs) bind directly to the pinned selected HAD-B and MAT sources.

## The space constraint

The current **3500 mm square court** ends at y7750; its centre is y6000. The east plant room's current north partition has **finished south/north faces at y6403/6597** and is only **194 mm thick**. The selected insulated loggia weather wall uses **519.5 mm total**. This is a spatial comparator, **not a universal required wall thickness** and not a certified east-passage assembly. The tested passage remains **1200 mm gross**, with a **200 mm hypothetical corner-pier reservation**; neither number is an accepted usable walking clearance or a structural minimum.

Using the existing plant-wall **south face** as a reference, the necessary *plan* inequality is:

**plant-wall south face − plant southward move + weather separation thickness + 1200 gross passage + 200 corner reservation ≤ court north edge + court northward extension.**

Therefore the sum of the plant-wall move **south** and court extension **north** must meet these lower bounds, *before* support, installation, guard, complete walking width, drainage edge, weathering returns or construction tolerance:

| Separating-wall comparison | Effective thickness from original plant south face | Combined required plan move | Meaning |
|---|---:|---:|---|
| **Bare original partition — invalid control** | 194 mm | **247 mm** | Reproduces the 4 November clearance trap; no qualified wet/dry boundary |
| **Rebuild partition as complete weather wall** | 519.5 mm | **572.5 mm** | Replace the wall while holding its protected-room south face as the reference |
| **Keep partition and add separate weather wall** | 713.5 mm | **766.5 mm** | Retain existing 194 mm and add 519.5 mm on its north |

These are *necessary, never sufficient* scalar budgets. Rebuilding a partition into an external assembly needs actual load support, continuity, thermal and moisture junctions, as well as equipment access; the thickness comparison is not permission to perform that work.

## Three ways of paying for the 572.5 mm rebuilt-wall comparator

| Space exchange | Court north edge | Consequence against the selected house |
|---|---:|---|
| **Plant only: wall 572.5 mm south** | 7750 | New plant south face **5830.5** cuts **369.5 mm into present controls** and **319.5 mm into buffer reservation** |
| **Split: plant 286.25 mm south, court 286.25 mm north** | **8036.25** | New wall south face **6116.75** still cuts **83.25 mm into controls**; centred square court becomes **4072.5 mm** across, adding **4.33525625 m² gross open-court plan area** |
| **Court only: north edge 572.5 mm further north** | **8322.5** | Without moving plant the centred square must become **4645 mm**, adding **9.326025 m² gross open-court area** and intersecting **167 mm** of the rear-east wall's existing finished plan band |

For the **separate additional wall** option, a fixed plant room would need a court north edge of **8516.5**, a **5033 mm** centred square and **13.081089 m²** additional gross open-court area; that court reaches fully through the original rear-east wall's **269 mm finished band**. An unweathered bare passage needing 247 mm of movement is not an admissible fallback. A **north-only rectangular extension** pays less *court surface area* (2.00375 m² for the 572.5 mm case), but destroys the owner's selected centred square and still changes the northern room, wall and roof arrangement. None of these areas is a measured net loss of conditioned floor.

The **split case** is a possible *drawing challenger*, not a fit. It leaves the current rear-east wall's south finished face at y8155.5 beyond the proposed court north y8036.25, a nominal **119.25 mm gap** that cannot be credited as an insulation, arch bearing, maintenance or weathering allowance. Its east passage projects into the two current ground east-window intervals, needs a new opening through the solid x9300 service spine (whose sole authored gap is y2750–3650), and requires a complete support/roof/upper-storey section. The fixture overlap alone rejects a claim that the split case works without moving equipment.

## Architectural disposition

**Do not call a 247 mm wall shift an east exit.** The complete wet/dry wall budget changes the trade-off materially. The cheapest-looking split still touches current plant equipment and replaces two weather-window conditions. Widening the courtyard instead of moving equipment has real room and bearing costs; stacking another weather wall has larger costs still.

If the owner retains the open court and requires a genuinely independent passive east passage, the next **joined HAD/STR/IAS/MAT/OAS architectural drawing** should use the split/rebuilt-wall comparison as an explicit **challenge**, with actual room/equipment relocation, continuous structural arch/piers, two corrected openings, complete weather boundary and roof support. Reject that option if the planted equipment and protected fabric cannot be retained safely. Reconsider court location/size and the single north-route fault criterion rather than adding a hidden wet passage through occupied permanent fabric.

**RWT/DPL downstream remains separate:** identify the real lowest wetted joint; couple full-event outlet obstruction to a physically independent destination and actual site receiving head; resolve garden human occupancy when the north loggia is flooded. A second daylight cut alone does not establish hydraulic independence or a safe garden exit.

**Decision:** this is a quantitative *architectural handoff* inside RWT-06, not another selected house, structural capacity result, hydraulic calculation, site fact or packet completion. **RWT-06 remains planned; RWT-07 remains blocked.** Reproduce with the new tests under the existing test:rwt command.
