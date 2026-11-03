# RWT-06 — can the open court route land on a plausible garden grade?

**3 November 2026. Negative grade-only boundary for the historic receiver, not a plot assessment, adopted house amendment or hydraulic/accessibility approval.** This is the joined *longitudinal datum comparison* requested by the [full-width surface challenger](rwt-06-full-width-surface.md). It deliberately tests the price of continuing that broad surface to the old **−800 mm nominal receiver-water plane**, rather than developing another piece of terminal apparatus. [Source-bound computation](studies/court-site-grade-envelope.mjs) and [adverse tests](studies/court-site-grade-envelope.test.mjs) inherit the current selected HAD-B and MAT source fingerprints through the full-width comparison. No land level, measured tailwater or suitable site is introduced.

## The section has two separate authorities

The **selected** outdoor north loggia falls from court mouth **y7750/−110 mm** to outer house **y12000/−152.5 mm** over **4250 mm at 1%**, in a **2400 mm gross** open passage. The **hypothetical** continuation at the same grade reaches **y13200/−164.5 mm**. These are walking-surface geometry, not a proven watertight, supported outdoor slab or an actual garden contour.

The other end, **−800 mm**, is a *historical, unverified nominal receiving-water plane* carried by the MAT terminal study. It is **not** a measured London site datum, design requirement, lawful outfall or currently selected surface receiving level. Its difference below the hypothetical guard continuation is **635.5 mm**. A lower *water plane* also does not by itself establish a stable path into the receiving territory: actual receiving surface, hydraulic head, impact, scour, submergence and outgoing disposal are separate. The calculations below optimistically ignore all of those duties.

## If the old receiver-water plane were retained

For one uninterrupted constant-gradient *surface* from the guard to the old water comparison, divide the **635.5 mm** drop by the trial grade. This gives a **necessary, optimistic geometric reach**, not sufficient land or hydraulic clearance:

| Hypothetical onward grade after y13200 | Further reach north of guard | Total open territory beyond y12000 | Gross 2400 mm strip area |
|---:|---:|---:|---:|
| **1%** (same as selected loggia) | **63.55 m** | **64.75 m** | **155.40 m²** |
| 2% | 31.775 m | 32.975 m | 79.14 m² |
| 5% | 12.71 m | 13.91 m | 33.384 m² |

The 2% and 5% cases involve an explicit grade change *after* the hypothetical guard; they are not a seamless extension of the selected 1% passage. These are gross surface footprints with no allowance for walls, guards, foundations, any dry parallel path, planting, maintenance, accessibility, overtopping, material transitions or onward receiving infrastructure. They **must not become a minimum plot-size rule**: the −800 plane may be discarded when an actual plot supports a different lawful receiving geometry.

Conversely, holding only the further garden depth fixed while retaining the same historical water plane produces:

| Space beyond guard | Average grade needed just to meet −800 | Level reached by continuing 1% | Remaining vertical mismatch |
|---:|---:|---:|---:|
| 5 m | **12.71%** | −214.5 mm | **585.5 mm** |
| 10 m | **6.355%** | −264.5 mm | **535.5 mm** |
| 20 m | **3.1775%** | −364.5 mm | **435.5 mm** |

No amount of calling the last half-metre a *receiver* creates the omitted fall. A sudden drop, steeper garden, raised lip, chute or excavated chamber would each be a **different** architecture with real structural, wetting, pedestrian and first-harm consequences. In particular the 5–10 m trials are not proofs of an appropriate accessible walking route.

## Adverse boundaries not solved by the slope arithmetic

- **First harm:** the current **−30 mm** pan-end/masonry/DPC junction remains an *unqualified wetting interface*, only **80 mm** above the −110 court mouth. No new calculation establishes a safe water level under obstruction, splash or contraction. A common flood connected to that junction can harm the house without any blocked drain.
- **Receiving water:** if the real site receiving-water maximum rises to or above the trial **−164.5 mm** level, the notional onward shallow surface loses its positive gravity head. Excavating a deeper local box does not lower the receiving water or remove backwater. This is a rejection case, not a flood forecast.
- **Single-route failure:** a blanket across the entire court mouth and a shared flooded garden defeat one broad path. A full-width surface is not independent emergency drainage, nor automatically a dry evacuation or maintenance way.
- **Structure and use:** the section does not allocate waterproofing/wall-base protection, movement joints, supports, thresholds, slip resistance, guarded movement, cleaning or high-level receiver renewal. Nor does it confirm a continuous falling outfall beyond the plot.

## Disposition and decision at the real-site boundary

**Reject importing the historical −800 mm receiver-water plane into the one-piece 1% garden-surface family.** It generates a huge optimistic site-depth burden and is not an observed condition. Do **not** respond by demanding a 65 m London garden, by burying a pump/well, or by asserting a steeper unqualified walkway. The correct next experiment is a jointly authored **HAD/STR/MAT/DPL court–house–garden section on an actual or expressly parameterised plot** with the actual maximum receiving water, a supported external edge, guard/circulation route and physical first-wetting levels.

To make that section decision-ready it needs, together: (1) selected house and foundation levels; (2) surveyed site grades/boundaries and safe external flood level; (3) a *distinct* legitimate onward water destination and allowable discharge; (4) actual weakest house joint and full-event/backwater behaviour; and (5) normal, blocked and maintenance circulation. If the site cannot admit the broad route plus independent failure/people duties, reject this family and redesign the house/catchments rather than fitting extra concealed machinery into an unviable section. A shallower verified high-level receiver may make the broad route much shorter, but that **requires site evidence**, not new guessed levels.

**Packet:** RWT-06 remains **planned**; this is a negative boundary result only. RWT-07 and the roof-water integration gate remain blocked. No owner-house dimensional selection, roof-water claim, DPL site fact, material detail or physical safety approval changes. Reproduce with `node --test project/rwt/studies/court-site-grade-envelope.test.mjs` (included in `npm run test:rwt`), or print the numerical ledger using `node project/rwt/studies/court-site-grade-envelope.mjs`.
