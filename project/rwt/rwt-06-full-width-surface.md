# RWT-06 — eliminate the internal court drains before designing better ones?

**3 November 2026 — bounded architectural challenger, not a change to the selected house or a water-safety approval.** [Executable source comparison](studies/court-full-width-surface.mjs) and [regression tests](studies/court-full-width-surface.test.mjs) read the **pinned selected HAD-B** open-north-loggia and MAT drainage/threshold sources. This is a direct response to the [failed terminal reception](rwt-06-terminal-reception.md) and [full-width apron/usable passage conflict](rwt-06-surface-apron.md): the combined current proposal's small carrier, covered joints, duplicate channel, 600 mm steep chute and two unlanded receiving rectangles form a large amount of machinery before any real site is known.

## The smallest architectural proposition

**What if the courtyard and the full open north loggia were simply one continuous, visible, walkable-in-normal-conditions *outdoor gravity surface* into a designed lower garden?** Its conceptual section contains no permanently embedded court-drain carrier, no covered normal collector, no separate narrow chute and no claim that two neighbouring boxes are independent destinations. That is a possible *replacement* RWT/HAD/MAT/STR source, not an amendment to the current selected objects.

The current model already provides useful geometry for the comparison:

| Source-bound quantity | Value | Meaning |
|---|---:|---|
| Full outdoor loggia | x4800–7200, y7750–12000 | **2400 mm gross** route within selected walls; not an agreed finished clear, guarding or load-bearing width |
| Courtyard north mouth level | **−110 mm** | Selected walking-surface comparison |
| Loggia north exterior level | **−152.5 mm** | Selected garden-terrace comparison, **not surveyed site ground** |
| Nominal total outdoor fall | **42.5 mm over 4250 mm (1%)** | Potential continuous graded floor, with actual supported/watertight assembly still unresolved |
| Conditional further garden run to y13200 | 1200 mm | At the same **hypothetical** 1%, the surface would reach **−164.5 mm** |
| Existing two receivers' nominal water plane | **−800 mm** | The reused receiver idealisation still lies **635.5 mm below** that hypothetical open continuation; it cannot be joined by pretending the garden is level |
| Unqualified pan/DPC wetting comparator | **−30 mm** | Neither watertight datum nor permissible flood level |

A garden that cannot accommodate the joined landform and lawful onward drainage may invalidate this candidate. The terrace figure does **not** mean the eventual plot slopes away, is accessible for earthworks or has low receiving water. Converting a pipe problem into a simple landform is useful only if that landform can actually exist without putting the house downstream of retained water.

## Stress the route instead of blessing a channel depth

Use the existing consistent wall-line vertical-rain basis, unit runoff, the source's illustrative event intensities, the **full 2400 mm** outdoor width, and its current 1% nominal fall with the existing relief roughness comparison **n=0.025**. The alternative removes the separately represented 400 mm normal channel and the 1800 mm broad relief as *separate pieces*; it does not erase rainfall. The source-linked test compares:

| 216 mm/h stress, hypothetical open 2400 mm strip | Present inward roof runoff also reaches court | Future outward-only roof operating intact |
|---|---:|---:|
| Incoming wall-line projection | **60.0625 m²** | **12.25 m²** |
| Flow into court | **3.60375 L/s** | **0.735 L/s** |
| Ideal steady uniform depth on entire 1% strip | **8.83 mm** | **3.40 mm** |
| Ideal required specific energy above a hypothetical 2400 mm broad crest | **9.19 mm** | **3.18 mm** |

These are **necessary geometric/steady-flow comparisons**, not hydraulic inlet capture, actual depth, usable pedestrian width, protection against a flood, permissible freeboard or proof that the roof will be redirected. A wide surface may remove a hidden pipe failure; it can still accumulate debris, concentrate flow at the court turn, splash a wall, erode its outlet or receive high water from the garden.

The **first-harm test remains decisive**. Under the full **3.60375 L/s** comparison a continuous 60 mm dam across the mouth leaves only **10.81 mm** of *ideal* head separation below the unqualified −30 join. At 70 mm of obstruction, the comparison falls to **0.81 mm**. Narrow the surviving ideal clear width to 600 mm with the 60 mm dam and the separation becomes **negative (−3.15 mm)**. Losses, splash, unknown weak joints, approach flow and backwater are excluded; positive margins are **not passes**. A complete blanket of the north mouth or common high receiving water still eliminates this one route. **Simplicity is not N+1.**

## What is genuinely simplified, and what remains

**Potential deletion if the family earns selection:** the concealed/covered 250-clear copper carrier, its large removable whole-body and wet temporary bypass operations, separate parallel water lane, local steep 600 mm chute, source-free twin receiving boxes and their nominal independent labels. An open, inspectable, genuinely falling hard landscape could be maintained without opening wet hardware inside permanent walls. This is a hypothesis about a different source, not a claim those components are now gone.

**Not deleted:** the full water inflow under current roof failure; a credible full-width open inlet and managed court corners; a slip-resistant, accessible daily garden path with guards, furniture movement and people; proper perimeter first-wetting/threshold/weathering; supported suspended/ground slab, movement and frost; harmless rain and flood overflow; actual external slope and lawful downstream destination; full-mouth debris and high-tailwater states; roof collection and high-level renewal while the present inward-draining roof remains selected. There is no assumption that an open route stays a **dry escape** in a severe event. If a separate all-weather garden/rescue route is necessary, HAD must design it separately rather than carve an unsourced dry strip out of this wet surface.

## Decision and next source gate
**Follow-on negative site-grade boundary:** The [joined historic receiver/plot-depth screen](rwt-06-site-grade-envelope.md) shows that carrying this 1% surface to the inherited −800 mm nominal receiving-water plane would require a hypothetical **64.75 m** of land north of the outer wall. That inherited plane is not surveyed site ground and must not become a plot brief. Its reuse is rejected for this shallow-surface family; a new joined receiving landform and real max water level are needed before claiming harmless discharge.


**Promote one broad open-surface gravity family to an explicit HAD/STR/MAT/DPL comparison, not to the selected house.** It should be compared directly against the 400/1800 divided system with its real collector/renewal cost. The next question is *a joined court-to-real-landscape longitudinal section and first-harm envelope*, not another smaller pipe, product catalogue or ideal chute-flow calculation.

Before adoption, the owner-house design must answer whether (1) the outer landscape can descend to a lawful independent receiving territory under all claimed events, including receiving flood; (2) the house's lowest vulnerable fabric remains protected in normal and degraded states; (3) everyday circulation and safe access still work when the floor is wet and when the route is closed; and (4) the permanent slab/weathering/support and maintainable exterior edge are buildable. If not, reject the single-surface family and recompose the courtyard/house or select a more suitable plot. Do not assert unconditional independence or use a pump to paper over a gravity failure.

RWT-06 remains **planned**; RWT-07, ROF-RWT-GATE and final selected-house maturity remain unchanged. **Reproduce:** `node --test project/rwt/studies/court-full-width-surface.test.mjs` (also part of `npm run test:rwt`). The comparison generates no adopted files or new workstream.
