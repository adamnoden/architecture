# RWT-06 — northeast emergency daylight passage: the corner-pier trap

**4 November 2026 — negative source-bound architectural clearance screen; not a second-outlet selection or a revised house plan.** The [three straight second-outlet trial](rwt-06-second-daylight-exit.md) found an east route through occupied plant space. This continuation tests the specific tempting escape: **slide that east passage as far north as possible**, away from the equipment, while retaining the present 3.5 m court and a nonzero corner support reservation. It uses the selected HAD-B/open north loggia and MAT sources through the [executable screen](studies/court-east-corner-clearance.mjs) and [five regressions](studies/court-east-corner-clearance.test.mjs). No source geometry is changed.

The proposed east passage is **1200 mm gross**, straight from court-east x7750 to exterior-east x12000, a **4250 mm run and 5.10 m² minimum ground territory** before weather walls, bearings, replacement rooms, actual finished clear width or an exterior receiving route. The *1200* is a comparison reservation, not a certified route width. A new masonry opening would cross the currently solid service spine x9300 (its only authored hole is y2750–3650). It cannot be described as an extra drain fitted inside the existing wall.

## The controlling arithmetic

The selected plant-north wall is centred at **y6500**, with structural core **6430–6570** and finished faces **6403–6597**. The courtyard ends at **y7750**. A corridor **north of that finished wall** has just **1153 mm gross** if it consumes the *entire* northeast corner; it already misses the proposed 1200 width by **47 mm with no corner pier at all**. Zero pier is an intentionally impossible bearing control, **not an offered design**.

For each hypothetical **north courtyard corner-pier reservation**, place the 1200 route as far north as possible. The table computes the **minimum** southward shift of the entire plant-north wall to make its finished face merely *touch* the passage. It provides **zero clearance** for another weather enclosure, movement, working tolerance or structural bearing.

| Nominal corner pier kept | East passage y interval | Gross clear above current plant wall | Minimum plant-wall shift south | Conflict after shifting wall: controls / 600 buffer |
|---:|---|---:|---:|---:|
| 0 mm — invalid structural control | 6550–7750 | 1153 mm | 47 mm | 0 / 0 mm |
| 140 mm — trial only | 6410–7610 | 1013 mm | 187 mm | 0 / 0 mm |
| **200 mm — trial only** | **6350–7550** | **953 mm** | **247 mm** | **44 / 0 mm** |
| 300 mm — trial only | 6250–7450 | 853 mm | 347 mm | 144 / 94 mm |

At the 200 mm comparator, the shifted wall's new **south finished face is y6156**, but the existing plant controls reach **y6200**. Thus even this lower-bound wall move interferes with actual equipment, before services, wall support or usable passage are reconsidered. The 140 mm case has only **16 mm** between moved wall finish and controls: a positive coordinate difference is **not** maintainable plant access, qualified pier width or physical tolerance. STR has not determined the required corner pier; 200 mm is not a sanctioned structural size.

The selected **court-east-1** window spans y6350–7350 and **outer east-window-2** spans y6900–7900. The 200 mm-pier passage consumes **all 1000 mm** of the former window interval and **650 mm** of the latter. Other pier trials also intersect both windows. Widening/replacing them with physically weathered archways, maintaining corner masonry above, and carrying upper wall/roof loads is an **architecture and structure redesign**, not a window-sill or drain detail.

## Consequence for the rainwater decision

The [direct-court-rain closed-mouth calculation](rwt-06-court-mouth-closure.md) shows why an **independent receiving path** cannot be waved away by redirecting ordinary roof water outward. This east shortcut does **not** earn that independence: it has no selected complete outdoor section, first-wetting junction, open/blocked hydraulic head, pedestrian exit, guard, dry-side wall assembly or *separate* site destination. A covered passage may be a useful architectural solution, but merely drawing a hole below an occupied first floor is not an open-air, maintained flood route.

**Decision:** reject “move the emergency passage a little north of the plant” as a minor RWT repair. **Do not adopt a 47/187/247/347 mm wall shift from the calculation.** For a genuine alternative, HAD and STR must redraw the actual east-court/corner/spine bearing and two openings, MAT the complete wall/floor/weather boundary, IAS the affected equipment and services, OAS the windows, and RWT/DPL the physical spill, lawful receiving head and safe garden occupancy. If those costs overwhelm the desired house, redesign the court or retain one north loggia with explicitly proven tolerable fault states; neither is selected here.

**RWT-06 remains planned; RWT-07 stays blocked.** Reproduce with `node --test project/rwt/studies/court-east-corner-clearance.test.mjs` (included in `npm run test:rwt`).
