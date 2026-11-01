# HAD-03 — test the near-level court *before* raising the entire house

**1 November 2026 · bounded, source-grounded relative-level option reduction · not an adopted courtyard, outlet or technical pass.** This is a continuation of the [paired N/E architectural sections](had-03-court-egress-plan-sections.md) and the [dry-access undercroft screen](had-03-undercroft-section-screen.md). It makes a decisive distinction: the approximately **1,050 mm** relative rise in the previous screen buys a *human-accessible 900 mm undercroft*, **not** the minimum rise required for every renewable shallow passage or gravity-water route. The latter must earn a complete local service/structural/water section; we must not force a metre-high plinth merely because a crawling route would be pleasant.

The [controlled layout](../../compiler/reference-house/georgian/layout-revision.ts) has a 12,000 mm shell, centred 3,500 mm courtyard and 4,250 mm gross court-edge-to-exterior crossing. The [common interface contract](../triad-interface-contract.md) draws ground FFL at **0** and exterior grade at **−150 mm**; neither is a surveyed site receiving level. The [HAD court-floor proposal](had-03-court-levels.md) supplies an **unadopted** 20 mm paver, 6 mm protective pad, PLV60 minimum 60 mm height comparison and a 2% fall over 1,750 mm = **35 mm** from pan perimeter to central low. These are explicitly authored dimensional comparators; the actual four-way pan, thresholds, finishes, structural floor and support/insulation remain unqualified.

## The simplest necessary level inequality

Let **P** be the perimeter depth below the *same walking-level datum*, **C** the fall to the court low point, **J** the actual collector-to-carrier inlet drop, **S** the 4,250 mm passage gradient, and **K** a trial clear separation between the *exit invert* and an external receiving-water level. The gross required relative floor-over-receiver height for a specifically **free-outfall-style** route is:

**`D_required = P + C + J + 4,250 × S + K`**

The current drawing has **D = 150 mm** *only against synthetic exterior grade −150*. For that one comparison, additional rise relative to an **unchanged** receiving surface is `max(0, D_required − 150)`. If the exterior water/ground rises with the building, the relative gain disappears. A partially submerged terminal may still discharge under sufficient head; this screen **does not** prove total gravity impossibility for a configuration that fails the *free outlet* test.

The [source-derived ledger](studies/court-near-level-window.json), [figure](studies/court-near-level-window.svg) and [deterministic generator](studies/court-near-level-window.mjs) compare the following explicit sensitivities. Each assumes the **unverified** inlet drop J=10 mm and outlet/receiving clearance K=25 mm unless shown otherwise. Neither number is a standard, measured joint allowance, required air gap or earned safe freeboard. A 1% carrier fall is another *hypothesis*, not a hydraulic capacity specification.

| Local architectural section | P at court perimeter | Carrier fall | D required | Additional relative rise from the drawn 150 |
|---|---:|---:|---:|---:|
| Inherited deep pan (P=180) | 180 mm | 42.5 mm (1%) | **292.5 mm** | **142.5 mm** |
| **Compact pan** with the compared 20+6+60 mm paving/support family | 86 mm | 42.5 mm (1%) | **198.5 mm** | **48.5 mm** |
| Same compact pan, **half the carrier slope** | 86 mm | 21.25 mm (0.5%) | **177.25 mm** | **27.25 mm** |
| Hypothetical **20 mm low support** + 20+6 layers (unmatched assembly) | 46 mm | 42.5 mm (1%) | **158.5 mm** | **8.5 mm** |
| Compact 86 mm pan, 0.5% carrier, J=K=0 | 86 mm | 21.25 mm | **142.25 mm** | 0 mm; **7.75 mm spare** only by deleting all allowance |

**Result of this geometry screen:** the inherited −180/−215 mm pan is poorly matched to the present nominal site level if a *free* normal gravity exit is required; deliberately raising the court pan into a shallow accessible floor assembly materially improves the level budget. The compared 60 mm pedestal family still misses a synthetic at-grade free-outlet case by **48.5 mm** at the declared fall/drop/clearance assumptions. A small, real relative grade adjustment *could* be explored before moving the entire house by 1,050 mm. Conversely, an unqualified 20 mm support or zero clearances cannot be called a solution. Reducing gradient loses hydraulic head and may worsen silt and rodding; no row here proves transport of rainwater at the actual storm profile.

### The missing second constraint: fit the carrier *and* its retained cover

The free-outlet bars are **necessary but not sufficient**. They measure a water level, not the physical height of an independent, replaceable passage below a load-bearing floor or threshold. A channel must pass through an actual wall/floor portal while retaining a sound cover and separately supported load path. The companion [source-derived portal pinch ledger](studies/court-near-level-window.json) tests that omitted dimension without choosing a pipe or making a hydraulic claim.

For **one monotone gravity carrier beneath a retained cover**, let `H` be the carrier's complete outside height, and `T` the actual required depth from finished floor to the top of that carrier (including supported cover, protection and clearances). The inlet invert must lie at least `H + T` below the floor. Combined with the compact court low and free-outlet test, a **necessary** condition is:

**`D ≥ max(P + C + J, H + T) + 4,250 × S + K`**

At the same synthetic `D = 150`, 1% fall and *hypothetical* 25 mm receiver separation, only **82.5 mm of invert depth below floor** remains at the court end. Yet the compared compact pan plus trial inlet drop already needs **131 mm**. The **48.5 mm** initial shortfall therefore assumes nothing about whether a real carrier and independently load-bearing cover could fit; it is *not* a clearance for them.

| Deliberately synthetic carrier height + retained cover | Controlling inlet depth, below FFL | Relative D required | Additional separation vs 150 |
|---|---:|---:|---:|
| 60 + 40 mm | 131 mm, **collector** controls | 198.5 mm | 48.5 mm |
| 80 + 80 mm | 160 mm, **physical envelope** controls | 227.5 mm | 77.5 mm |
| 120 + 100 mm | 220 mm, **physical envelope** controls | 287.5 mm | 137.5 mm |

None of those heights is an adopted product, structure, compliant cover or full-duty flow area. The figures deliberately omit horizontal withdrawal, fittings, joint release, floor thermal/gas/water closures, N/E independence and a high-tailwater event. A portal with a different bearing or side-exit arrangement requires its own properly drawn geometry: do **not** transfer this under-cover inequality unchanged. The architectural proposition must establish **both** passable vertical section and independent, maintainable service replacement before the modest raised-pan option can be credited.

### The second route still has to work

The separate provisional emergency inlet crest at **−75 mm** and a *hypothetical* 1% fall across 4,250 mm give a centreline exit comparison at **−117.5 mm**, 32.5 mm above the synthetic exterior grade. Against an arbitrarily chosen 25 mm receiving separation, that leaves only **7.5 mm geometric surplus** before any inlet transition, outlet casing, flowing head, flow depth, structural support or local backwater. This does **not** size E or qualify its full degraded-duty flow.

More seriously, the historical **−50 mm operating-water label** against a **hypothetical −45 mm sill-support underside** offers **5 mm nominally** and does not even identify the first susceptible water boundary. The relief cannot become safe by putting its crest on a pretty drawing. The proper order is **HAD/OAS/IAS: first harm + physical section** → **RWT: named blocked-primary flow/head and independent receiving surface** → **MRA: water-to-fabric failure challenge**. Full-duty court input under the RWT illustration is 2.4025 L/s when the inward roof spills to the court, and direct rain alone is 0.4900 L/s. These figures are load cases from [RWT-ROBUSTNESS](../rwt/rwt-robustness-result.md), *not* an outlet or floor-capacity calculation.

## An architectural, not merely numerical, trial

A credible **D-high-pan** study would retain the 3.5 m open court and step-free walking line at z=0 while testing a *shallower supported pan* and **two physically distinct, independently removable local service passages**, rather than a human-accessible full undercroft. Draw a complete connected physical section through the [north two door thresholds and family/dining floor](studies/court-egress-north-section.svg), and another below the [east window bays, 1,270 mm gallery, 125 mm service spine and 2,020 mm pantry](studies/court-egress-east-section.svg). Both must show:

1. Actual pan/collector low, substrate and supported stone paver, including four-corner falls, loads and independently removable threshold strips. Do not assign the 20+6+60 mm comparator to a complete no-plastic system: the cited historic protective pads and pedestal family may conflict with MAT's current requirement.
2. Independently supported fixed **masonry/ground-beam passages** and the load path *around*, not through, the service piece; bridge both door thresholds and both window-base supports. Draw the complete replaceable loadbearing cover, floor/thermal/air/gas/rodent/fire/moisture boundary and intentionally movable soil/house interface before calling a slot accessible.
3. Entire normal **N** carrier removal/reinstatement (or another consciously bounded local replacement task) without consuming permanent structure; independent **E** inlet, passage and visibly harmless exterior landing with N blocked. Court water and exterior water must not enter the floor service cavity through a leaking assembly. A long removable room-floor strip cannot become permanently hidden under kitchen furniture.
4. A named receiving-water *event* at each exit, not the vague −150 drawing grade; measured/legal exit and site-flood response are DPL obligations. No safe bypass is earned if the two outlets share a flooded receiver or their water sheets return to the foundations.
5. Both court door pan/jamb/frame/anchor and wall-base **first-harm** elevations, *flowing* E water level plus splash/movement/tolerances, actual inlet head loss and full flow. The exact physical and hydraulic data may reject the entire near-level family; record that decision rather than reduce allowances or add a pump.

This is not a return to the already **rejected historical narrow/deep north-axis carrier**. That reference had serious sleeve, transverse flange, withdrawal, threshold and hidden-leak defects. The new D-high-pan question changes the pan/wet plane and requires an independently structured, surface-accessible passage from first principles; its success would have to be demonstrated rather than assumed from a better level equation.

## Disposition and decision hierarchy

**Change the trial priority, not the accepted geometry.** Before adopting a raised whole-house undercroft (B), first falsify the **compact court-pan plus two local accessible portals** (D-high-pan) against an *actual full floor/threshold section*. It has the potential to preserve the Georgian house, centred through-route, existing garden approach and family room while pursuing gravity and no service in permanent fabric. A positive level window makes further structural investigation worthwhile; it is not itself a physically workable solution.

Keep B as an honest comparator where a site, high-water line, approach and structure can earn a substantial open dry void. The north loggia (C) remains a major house replan, not a minor architectural correction. If the matched D-high-pan section fails the first-harm or independently harmless escape test, redesign the house/court and/or choose a different site. Do not pursue an unending sequence of nominal thin pipes.

**HAD-03 remains planned**, including unrelated inhabited-house convergence. **RWT-06 remains blocked** pending a located **complete** N/E architecture and actual water/threshold limits. STR, IAS, OAS, MAT and the receiving site evidence retain their existing owner and gates. This bounded result neither creates a second programme nor promotes maturity, selected geometry, material system or regulatory/physical acceptance.
