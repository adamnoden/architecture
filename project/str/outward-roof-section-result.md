# STR-HOUSE — outward roof, real bearing and ceiling junction

**3 November 2026. Conditional comparative result; STR-HOUSE remains planned. Reference design — not released for construction.** This answers a bounded question raised by [RWT-06's outward-only four-face roof challenger](../rwt/rwt-06-outward-roof-rewind.md): would moving rain away from the courtyard actually remove its structural burden, and could the retained roof/ceiling assembly simply follow the shallower new slope?

**Decision:** investigate the outward-draining four-face roof further *only with a rewritten structural/roof/ceiling section*. Moving the water downhill to the outside does not move the structural gravity and uplift reactions there. Under a concrete two-line reaction topology, the high courtyard rim still attracts **41% of trial vertical roof action**. At the available MAT/STR roof section, inherited 5–12° face options physically intrude below the **+6620 protected ceiling top** at the outer inner-leaf axis. Neither a completed roof support nor an adopted replan is shown.

The [reproducer](studies/outward-roof-structure.mjs) and [adverse regression tests](studies/outward-roof-structure.test.mjs) consume and Git-blob pin **three different owners**: the selected [HAD-B open north loggia](../had/studies/open-north-loggia.json), current [MAT roof composition](../mat/studies/loggia-roof-section.json), and [STR open-loggia support actions](studies/open-loggia-support.json). The owner changes the source; STR does not hand-edit the architecture or borrow RWT's unadopted model as house authority.

## What supports the roof if no water falls to the court?

The wall-line 12 m square less its 3.5 m square open court has **131.75 m²** of roof horizontal projection. Four identical trapezoids each have an **outer 12,000 mm edge, inner 3,500 mm court edge and 4,250 mm horizontal perpendicular run**, so each is **32.9375 m²**. Four hips connect outer to inner corners. The absence of an inward roof-drainage valley says nothing about whether a high inner bearing or tie line can be deleted.

As a deliberately *conditional* counterexample, suppose each trapezoidal face transfers all its vertical action to **two continuous parallel bearing-resultant lines** at the outer eave and the high court rim, with **no independent vertical hip, corner or intermediate reaction and no external support couple**. Integrating its linearly varying plan width between these two lines and taking first moments gives these force-equivalent areas:

| Face, wall-line only | Total | Outer support line | Court high-rim support line |
|---|---:|---:|---:|
| Equivalent tributary area | 32.9375 m² | 19.47917 m² | **13.45833 m²** |
| Four faces | 131.75 m² | 77.91667 m² | **53.83333 m²** |
| Trial ULS-down, 6.3 kPa | 830.025 kN | 490.875 kN | **339.150 kN** |
| Trial uplift, −2.25 kPa with no favourable dead load | −296.4375 kN | −175.3125 kN | **−121.125 kN** |

The trial 6.3 kPa uses the existing STR roof action **1.35 × G3.0 + 1.5 × Q1.5**; the signed −2.25 kPa mirrors its **1.5 × 1.5** uplift sensitivity. These are authored action challenges, **not UK site design loads or a complete ULS combination**. Every total and first moment balances in the conditional model; no strength, stiffness, diaphragm, anchor, member or real load-sharing is calculated.

**Structural consequence:** the high court edge is not merely an aesthetic cap to protect from rain. If the architecture elects this two-line scheme, it needs continuous bearings, a designed high-rim collector and signed tie/diaphragm paths to the actual upper cores, interrupted ground arches, warm grid, mineral/DPC crossings and cold supports. If it instead takes the water and structural loads to hips/posts/intermediate frames, it must **replace** this trial equilibrium with the actual 3D reaction allocation: that is a different structural family, not a free pass. The [existing southwest corner](sw-corner-station.md) and [full southwest roof region](studies/sw-roof-region-route.md) are evidence on the *inward/outward* topology only; their finite hip/valley members, offsets, failed seats and reactions do not automatically transfer to the new four-face field.

The present STR roof load ledger covers **144.15 m²** including represented edge extensions; this wall-line challenger covers **131.75 m²**. Its missing **12.40 m²** is an extent mismatch, not proof of reduced material mass, reduced roof action or improved foundation capacity. An adopted comparison must account for both models' actual overhangs, projections, covering and extra supports on the **same** domain.

## The shallow roof meets an already allocated protected ceiling

MAT's selected 25° section has an actual **+7100 outer weather eave**, **+6620 separately supported protected ceiling top**, **332.5 mm exterior-wall-to-inner-structural-axis inset**, **500.7 mm normal roof recipe**, and **38.4509 mm** between its purlin underside and ceiling at that axis. The current section locates its weather face there at +7255.047 mm, projects the 500.7 normal stack by 1/cos(25°), and places the supported purlin **44.1351 mm lower** than that normal-stack underside. This recovers MAT's actual +6658.451 purlin soffit.

For an intentionally adverse **same-assembly/same-support topology** test only, keep the +7100 outer eave, +6620 ceiling, the normal recipe, and that additional purlin drop fixed while changing only the outward fall. The modelled lowest purlin at the inner structural wall is:

`z = 7100 + 332.5 × tan(pitch) − 500.7 / cos(pitch) − 44.1351` mm.

| Outward pitch | Modelled lowest purlin at this wall | Nominal clearance to +6620 |
|---:|---:|---:|
| 5° | +6582.34 mm | **−37.66 mm — overlap** |
| 8° | +6596.97 mm | **−23.03 mm — overlap** |
| 12° | +6614.65 mm | **−5.35 mm — overlap** |
| 15° | +6626.60 mm | +6.60 mm — no installation reserve proved |
| Original 25° matched MAT section | +6658.45 mm | +38.45 mm — existing matched comparison |

The roof geometry permits outward pitches **up to 13.12427°** before the courtyard high rim exceeds the *current* +8090.904 roof ridge. The unchanged inherited frame/ceiling envelope needs at least **13.30872°** for even **zero** theoretical clearance. Thus, **the exact unchanged stack does not meet both constraints simultaneously**. At 13.12427° the mathematical deficit is only **0.74 mm**, less than any earned placement or movement tolerance: it is an indication that the two choices cannot simply be asserted compatible, **not a universal proof that an outward roof is impossible**. At the more interesting 5–12° pitches the inherited support is visibly too deep by 5–38 mm before tolerance, deflection, fire joins, glass and renewal handling.

This transfer is an *adverse physical-envelope comparison*, **not** an assertion that a 25° roof product may be installed at 5°. A new pitched covering needs manufacturer-supported minimum pitch, drainage and movement, ventilation, support and uplift details, a real high court-rim wall/hip section, and the complete fire/thermal/air/ceiling interface. A new design might reallocate the stack, raise the outside eaves, alter the ceiling or change the primary framing and member location. Each is a real HAD/STR/MAT/ROF source and occupied-elevation decision, not a hidden saving.

The selected HAD programme places **plant on the ground floor and does not promise usable attic space**. This study therefore does **not** make a 2 m loft a false veto. The actual binding conflicts are the selected protected upper ceiling, retained masonry/window/head geometry, the physical roof build-up, court high-rim expression and genuine roof access.

## Necessary joined selection work

Before selecting this roof family, draw one **continuous matched cross-section** through an exterior loadbearing axis, high court-rim line, roof/weathering layers, purlin/primary supports, ceiling protection and actual upper wall/head. Include an equally physical **corner/hip support, diaphragm collector, down/uplift connection and real reversible repair state**, not four drainage arrows. Run the old and candidate structural action ledgers on matched projected areas, then allocate actual ring/hip reactions into named first-storey cores and lower opening piers, including source-bound hold-down paths through the mineral/DPC band. Keep court water/failure and exterior outfalls with RWT and the source/adoption decision with ROF/HAD.

**Rejection/rewind triggers:** a cavity/thermal or ceiling/fire discontinuity, a bearing or corner crossing inside an opening without its own transfer, a new hidden wet trap at the rim, an unjustified hip support or uplift anchor, a high-rim access task with no plausible work position, or missing whole-face exterior exceedance. A conventional roof with robust outer collection remains a comparator. For this packet, the next action is an actual whole-house **support/topology and inhabited-section option**, not another generic referral to a future engineer.

The bounded calculation is reproducible with `node --test project/str/studies/outward-roof-structure.test.mjs` and `node project/str/studies/outward-roof-structure.mjs`. Its geometric and equilibrium statements are not roof, material, capacity, site or construction acceptance. **STR-HOUSE remains planned; STR-RECONCILE and ROF-RWT-GATE retain their prerequisites.**
