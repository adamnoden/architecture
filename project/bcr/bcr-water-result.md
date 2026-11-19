# BCR-WATER — roof and courtyard water-path feasibility

**Result:** bounded physical investigation complete, with unresolved crossing, threshold and failure-route findings. No current rainwater network or safe court escape is accepted.
**Observed main:** `cd097fd960325b2b9503a5f4d0c96cbf349fdb1a`, 29 October 2026.
**Owner:** [BCR #944](https://github.com/adamnoden/architecture/issues/944); [programme and completion boundary](buildability-construction-resolution-programme.md).

## Consequence for the house

The enclosing ring makes a blocked court drain a whole-building interface problem. The nominal inner roof and direct court together collect vertical rainfall over **60.0625 m²**, almost five times the court's 12.25 m² alone. A failed inner collector can transfer that roof load into the court. Separate relief piping can bypass a named primary blockage, but cannot by itself resolve common exterior backwater, threshold vulnerability or the floor/support crossings.

RWT's newly located eastward crossing is a useful candidate: two separate removable strips through the gallery and pantry avoid pretending the court has an open surface route through occupied rooms. The physical price is three boundary/support crossings, a complete removable ground-floor assembly, and an exterior receiver below the drawn ground. Those are specific design-admission obligations. They cannot be relabelled as harmless site details while the architecture depends on them.

## Source and reproducible study

The [current house basis](../../docs/reference-house/current-house-basis.md), [interface contract](../triad-interface-contract.md), [rainfall basis](../../docs/research/rainfall-and-hydraulic-basis.md), [collection](../../docs/research/rainwater-collection-options.md), [conveyance](../../docs/research/rainwater-conveyance-options.md) and [failure study](../../docs/research/rainwater-failure-and-exceedance.md) retain their authorities.

| Source inspected | Git blob / identity |
|---|---|
| `compiler/reference-house/georgian/layout-revision.ts` | `af955c7da2e2469fd24598f98db6fc942a119ed3` |
| `compiler/reference-house/georgian/layout-family.ts` | `30ef287f3176e0f4cf2b03ef57c4fdfc915494c9` |
| `project/triad-interface-contract.md` | `789df054ec0c97326bf6549e1e93db50163036d0` |
| `docs/research/rainwater-failure-and-exceedance.md` | `f646363e9a239ed22b02297807670725c254bf6a` |
| `project/rwt/rwt-05-blockage-failure-exceedance.md` | `d73dd89a095b1451ce17dd7e6cae08e6bf07e0e5` |
| Unadopted crossing snapshot | [RWT-06 draft PR #1044](https://github.com/adamnoden/architecture/pull/1044), head `aa5740b8ff351a3689462d28758a7abc0de37a2c`; its [exact result](https://github.com/adamnoden/architecture/blob/aa5740b8ff351a3689462d28758a7abc0de37a2c/project/rwt/rwt-06-access-court-transition.md) supplies declared trial inputs only |

The [A3 study](studies/water-path-study.svg), [exact data](studies/water-path-study.json) and [generator](studies/water-path-study.ts) retain the area accounting, crossing section and named failure cuts. Run `node --import tsx project/bcr/studies/water-path-study.ts`; `--check` checks retained outputs. Source guards reject a changed shell/court/ridge/overhang or court-door basis. This small study is not a hydraulic solver. RWT may change its candidate; that triggers reappraisal, not automatic adoption here.

**29 October handoff:** RWT-06 is subsequently comparing a separate higher, shallow relief carrier. That moving, unadmitted alternative is outside the pinned low-twin snapshot tested here. The below-grade outlet finding applies to this snapshot; later outlet geometry and common-backwater consequences require their own recheck. The numeric study is deliberately not rewritten against an unpublished target.

## Catchment accounting before a pipe size

The source roof height is controlled by distance from the nearest outer edge. Its ridge square is 7750 × 7750; the court is 3500 × 3500. At the nominal wall-line boundary:

| Vertical-rain plan partition | Area, m² | Meaning |
|---|---:|---|
| Outer roof | 83.9375 | Shell square minus ridge square |
| Inner roof | 47.8125 | Ridge square minus court square |
| Direct court | 12.25 | Nominal open court |
| Total | 144 | Exactly one partition of the 12 × 12 m reference footprint |

Symmetry gives outer/inner face partitions of 20.984375/11.953125 m². These are not four outlet allocations: concentrated arrivals at the four inner valleys still need receiving geometry. The source's 25° faces produce approximately 18.249° diagonal inner valleys, about 3005.2 mm in plan and 990.9 mm fall from ridge corner to nominal court corner. A roof-face product pitch is not a valley-detail approval.

**Overhang sensitivity:** current section traces extend 200 mm outside the shell and into the court; the roof plan uses nominal wall-line edges. If those extensions are consistently interpreted as square offsets, outer roof becomes 93.6975 m², inner roof 50.4525 m² and exposed court 9.61 m², totalling 153.76 m². Actual corners, edge weathering and collection extent are not selected by this inference. Adding the full 12.25 m² court to that overhanging roof double-counts 2.64 m². Both consistent partitions retain 60.0625 m² inside the ridge for the full-inner-spill-plus-direct-rain case.

These are projected vertical-rain areas, not sloping material areas, wind-adjusted effective areas or a complete loading case. Facade runoff and roof transfers must be explicitly allocated under the eventual method. No universal pitch factor is applied to this ring.

Using RWT-01's deliberately illustrative rates and no retention:

| Input L/(s·m²), not a design event | Nominal court only, L/s | Full inner spill plus court, L/s |
|---:|---:|---:|
| 0.020 | 0.245 | 1.20125 |
| 0.040 | 0.490 | 2.40250 |
| 0.060 | 0.735 | 3.60375 |

At the middle input, complete obstruction and no escape would retain 1441.5 litres in ten minutes under the combined scenario. This is a conservation sensitivity, **not** the actual flood depth, permissible storage or time available to react. Actual falls, landing displacement, leakage and vulnerable levels are unknown. Do not divide that volume by a hypothetical level court and present the result as a safe basin.

## Current normal and failure geography

| Contribution | Normal candidate route | Failure consequence and unresolved physical link |
|---|---|---|
| Four outer roof faces | Exposed eave collection → separate visible drops → accessible outside transitions → site handoff | Local collector/drop failure may wet cornice, wall or opening before falling clear. Actual drop coordinates, support, splash territory and ground route remain unselected. More drops do not prove independent site receiving conditions. |
| Four inner roof faces and valleys | Inner collection/receivers → court drops and a low-level crossing, or an independently proven high-level transfer | Spill enters the court or wets its enclosing wall. High-level transfer requires real head, support and access across the ring; it never removes direct court rainfall. |
| Court surface | Actual surface falls → primary inlet → eastward crossing candidate → outside receiver | Grate/throat/crossing blockage ponds within the ring. The two paired doors at x4800–7200 on north/south sides and wall-base interfaces need the actual first-vulnerable-level section. They are not emergency weirs. |

There are no adopted outlet coordinates, capacity curves or complete crossing in current source. The drawing's arrows and collector reserves therefore do not earn physical continuity. This study preserves that baseline while testing a located candidate rather than inventing a selected network.

## Located RWT crossing: what fits and what does not yet follow

RWT-06's trial has two 300-wide strips centred at y7000 and y7450, x7750–12000. They fit the pantry's nominal y6712.5–8042.5 clear interval, leaving 150 between strips. The run crosses the court wall x7750–8167.5, service partition x9437.5–9562.5 and outer wall x11582.5–12000. The intervening gallery/pantry clear lengths are 1270/2020. Those lengths are working territories, not proof that a person can pass safely beside open channels or operate every tool.

The candidate uses a 100 internal/110 external carrier, internal invert −205 to −265 over 4250 (60 fall, about 1:70.8). Outer crown is −100 to −160 and outer bottom −210 to −270. With a 50-deep lid and lower trial limit −300, top space is 50–110 and bottom space 90–30. All numbers are authored trial envelopes; no product, capacity or required support/insulation thickness is implied.

The ground reserve is separate from the 350 mm intermediate floor studied in BCR-SERVICES. It is not empty service space. Two channels also interrupt a combined 750 mm plan band across three support/boundary zones; the 150 mm strip between them is not automatically an independent bearing pier. IAS/BCR-STRUCTURE must allocate the real floor, supports, thermal/moisture/air continuity, permanent sleeves and removable lids. No foundation drilling or joist cutting is authorised by a plan line.

The route avoids current plant/riser footprints in plan. It still crosses below the upper service-lining/panel territory and future vertical services; a two-dimensional noncollision is insufficient. Pantry storage must preserve access. The pipe invert at the outside is **115 below the schematic −150 ground**, so the drawing requires an accessible lowered receiving transition, not an open shoe draining onto existing ground. Site levels, excavation, receiving capacity and rights remain DPL inputs; if they cannot meet this requirement the candidate must change.

## Named fault cuts and level hierarchy

The retained connectivity check has separate primary/relief inlets, crossings and handoffs. Removing the primary inlet or primary crossing leaves a potential relief edge sequence. Removing both inlets or both receiving conditions leaves none. This establishes only graph connectivity. The relief is not assumed to flow during normal operation; activation, inlet capacity, operating head and receiving level are not simulated.

The draft activation −75 and operating target −50 sit 75/100 above the schematic court −150. No actual lowest vulnerable boundary has been established. A supposed 50 mm difference below internal floor0 is not a weathering allowance: seals, wall-base layers, splash, tolerances and running-water level can control first. The front-threshold study's local −60 envelope and open landing-edge spill are **not** court details and must not be copied here.

| Attack | Required next path / result at this scope |
|---|---|
| Primary grate or crossing blocked | Separate relief may bypass that particular obstruction only after its inlet/head/receiver are proved. No shared sump/throat is credited. |
| One missed cleaning plus heavy rain | Both inlets need assessed debris exposure. Their 450 mm spacing does not prove that debris, frost or neglected cleaning cannot obstruct both. No invented blockage percentage supplies capacity. |
| Inner receiver spills while primary court route is blocked | Combined inner-roof/direct-court scenario above reaches the relief. A court-only calculation is incomplete for this case; actual partial/complete spill allocation belongs to RWT. |
| Common outside backwater | Two pipes ending below the same external flood level can both be defeated. Separate endpoint names do not prove independence; a closed check valve cannot discharge new rainfall. Actual site receiving conditions remain a candidate constraint. |
| Joint or channel-boundary failure | Leakage can reach floor insulation, air/moisture layers or wall base before visible ponding. The assembly needs a declared leak path, inspection/drying access and bounded reinstatement; an overflow does not cure a split joint. |

## Maintenance, replacement and evidence

The [official Approved Document H publication](https://www.gov.uk/government/publications/drainage-and-waste-disposal-approved-document-h) and [2015 England PDF](https://assets.publishing.service.gov.uk/media/5a80cf9ded915d74e33fc8ae/BR_PDF_AD_H_2015.pdf) were checked on 29 October 2026. H3's performance and §§0.3–0.5, 1.2, 1.7–1.10 support whole-route flow, accessible blockage clearance and avoiding harmful overflow; §1.13 identifies splash, openings and concentrated discharge concerns. Its simple gutter table is configuration-specific. This is a guidance basis, not project compliance or a substitute for the licensed drainage calculation.

The lower-route intervention must expose the actual inlet/obstruction, manage occupation and retained water, open the relevant covers, support and disconnect the chosen carrier segment, withdraw it, restore the carrier and all interrupted boundaries, then inspect/test before return to use. Rain is not isolated by a water valve. A 417.5 mm joint-free wall piece is a more credible renewal unit than pulling 4250 mm rigid pipe into a 3500 mm court; sockets, tool swing, extraction and actual segment handling still need product evidence. Permanent sleeve/support replacement remains a larger repair.

For high-level goods, ground observation, remote cleaning and receiver/support replacement are different tasks at eaves +6800. The court's 3500 width, actual door clears, staging, equipment support and reach must be demonstrated jointly with ROF-06. No usable attic, hatch, tower or anchor is inferred. Failed channels and adjacent wet layers need an inspection/drying route and material-specific closure criteria through MRA/DEL; no universal drying time is prescribed.

## Findings for serial PREFLIGHT integration

The investigation is complete; all material design-admission findings below remain **routed-pending / blocked**. The shared matrix is unchanged.

| Finding / receiving rows | Owner and discharge condition |
|---|---|
| BW-01 / BCR-014, 015: nominal/overhang catchments need consistent allocation | ROF/RWT: adopt actual collecting edge/corner geometry and effective-area method; account for four valley concentrations, direct court rain and transferred spill once each. |
| BW-02 / BCR-002, 003, 015, 019: crossing lacks complete floor/support boundaries | RWT with IAS/BCR-STRUCTURE: actual two-strip section, support/sleeve arrangement, continuous layers and maintainable carrier assembly; eliminate/reconfigure if the budget fails. |
| BW-03 / BCR-015, 016, 018: safe relief operating level unproved | OAS/HAD/RWT: actual court falls, landing/threshold/wall-base vulnerable levels, inlet/overflow operating head and tolerances. No interior escape or copied front-threshold pass. |
| BW-04 / BCR-015: primary-block bypass has shared-failure limits | RWT then MRA: assess compound debris/heavy-rain and inner-spill cases; distinguish inlet, carrier and outside common obstruction. Capacity and physically safe continuation must support the claim. |
| BW-05 / BCR-002, 016: receiving invert below schematic ground | DPL/actual site with RWT: establish receiving level/capacity, backwater and lawful safe exterior continuation; reject site/candidate incompatibility rather than invent a lower garden. |
| BW-06 / BCR-014, 020, 024, 025: actual renewal and drying tasks incomplete | ROF/RWT/IAS with DEL: equipment/people/component routes, temporary weather control, supports, exposure/drying and reinstatement. Targeted competent/physical evidence only for concrete remaining duties. |

PREFLIGHT must reconcile these with structure, services, occupation and wet studies. Subsequent RWT-06/07, ROF/HAD or threshold changes trigger the affected recheck. Historical drainage validation, a green topology cut test or completed packet does not establish the selected house's safe water system.
