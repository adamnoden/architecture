# RH-C0 Discrepancy Register

**Status:** RH-C0.6 parity disposition complete  
**Date:** 2026-10-12  
**Baseline:** [`model-baseline-rhc0.md`](model-baseline-rhc0.md)  
**Drawing audit:** [`rhc0-drawing-parity-audit.md`](rhc0-drawing-parity-audit.md)

A discrepancy is never resolved by making the independent reconstruction resemble an older SVG. Resolution means correcting the owning authority, replacing the current visual comparator, or explicitly demoting the representation.

| ID | Subject | Controlling fact | Conflicting representation | Severity | Owning RH gate | Disposition | Status |
|---|---|---|---|---|---|---|---|
| `RHC0-D01` | front drawing/hall boundary | RH-03 nominal `X≈4,000` south of court; court west edge `X=4,200` | RH-02 ground SVG remains `X=4,200` throughout | MATERIAL as current comparator | RH-03 | RH-02 SVG demoted to provenance; RH-C0 ground comparator applies the front-only notch | **RESOLVED** |
| `RHC0-D02` | upper en-suite | RH-06 deletes `U-ENS-01` for dry `U-DRESS-01` | RH-03 upper SVG still shows conditional en-suite | MATERIAL semantic drift | RH-06 | RH-03 SVG demoted; RH-C0 first-floor comparator shows dry dressing/storage | **RESOLVED** |
| `RHC0-D03` | upper stair datum | RH-04 FFL `+3300`; derived rise `183.33` | RH-03 upper/section SVGs show `3240 / 180` | MATERIAL numeric drift | RH-04 | RH-03 drawings demoted; current plan/section comparators use +3300 | **RESOLVED** |
| `RHC0-D04` | roof silhouette in RH-04 section/elevation | RH-08/RH-10 outward low-slope family | RH-04 section/front drawing pitched roof | MATERIAL if whole-view current | RH-08/RH-10 | RH-04 drawings demoted; current section/front comparators use low-slope/controlled edge | **RESOLVED** |
| `RHC0-D05` | service subdivisions absent from RH-02 plan | RH-06 text controls plant/south band/`SV-01` reservations | RH-02 plan leaves `G-SVC-02` undivided | MODERATE scope gap | RH-06 | RH-02 plan demoted; current ground comparator shows subdivisions only as provisional overlays | **RESOLVED** |
| `RHC0-D06` | wall thickness / clear geometry | RH-10 400–425 normal family; 450 stress boundary | old plans use zero-thickness zones/furniture from earlier allowance | MODERATE if measured | RH-10 | old plans explicitly provenance; RH-C0 comparators are semantic reservations and do not imply wall faces/furniture proof | **RESOLVED** |
| `RHC0-D07` | exact east/west court opening centres | RH-04 controls qualitative rhythm only | court SVG pixels imply centres no text authority owns | MATERIAL authority risk | RH-04 | exact numeric centres remain un-authored and **OUTSIDE RH-C1**; current comparators deliberately omit them | **CONTROLLED OPEN — NOT A FREEZE BLOCKER** |
| `RHC0-D08` | RH-06 utility/WC pixels | RH-06 text: service suite `≈2.9×4.0`, plant `≈2.9×2.2`, south band `≈2.9×1.8` | service SVG visually extends utility/WC through a larger front field | MODERATE if measured | RH-06 | SVG classified non-geometric topology; current ground comparator uses the text-controlled band | **RESOLVED** |
| `RHC0-D09` | north centre upper garden opening host | controlled upper plan places cross-landing at `Y≈7.4–8.6`; dry dressing/linen occupies `Y≈8.6–10.8` | RH-10 outer elevation text/SVG called `X=6.0` north upper opening a “landing” window | **MATERIAL current cross-view contradiction** | RH-10 outer elevation coordination | owning RH-10 text corrected to dry dressing/storage field; plan unchanged; current garden comparator records corrected host; old RH-10 SVG classified stale | **RESOLVED THROUGH OWNING GATE** |

## Final disposition before freeze

There is no unresolved contradiction between two current source authorities.

`RHC0-D07` is the sole intentionally open geometric detail in this register. It is not silently guessed: exact east/west court-opening centres are excluded from RH-C1 until an owning architectural gate authors them. All other discovered representation drift has either been superseded by current visual comparators or repaired through the owning authority.