# Current selected house — structural re-entry

STR-HOUSE consumes the architectural independent-water source merged in PR1332. This is structural development, not a whole-house structural selection. The [interface audit](studies/current-house-interfaces.json) preserves historical calculations and their input guards.

## Resolved local design comparisons

The new bridge has support axes 1,600 mm apart and 1,000 mm clear in the initial 600 mm NS-node comparison (950 mm with the later 650 mm NS candidate). The court core acts 132.5 mm east of axis X = 7,950; the new weather leaf acts 371.25 mm east of axis X = 9,300. Those are the actual eccentricities, rather than the old grid's offsets.

The [bridge calculation](studies/current-house-bridge.json) uses declared C30/S500 properties. It assigns gross wall-mass envelopes, separate floor and ceiling budgets, the actual ordinary roof-seat action, and a 5 kN characteristic wet-carriage/rail point budget. All absolute ingredient torques go to one end; favourable cancellation and equal torsional sharing earn no capacity. The 250 mm field passes the declared section screens at both 40 and 50 mm cover. Its reinforcement is 4H20 at each face in the 600 mm court member, or 4H25 at each face in the 900 mm spine member, with four-leg H10 links at 75 mm. The 200 mm alternative fails. These are enforced design budgets and section comparisons, not a measured takeoff or construction acceptance.

The [representative node](studies/current-house-nodes.json) widens each spine node to 900 mm east–west by 650 mm north–south. This supports the complete weather-wall footprint with 27.5 mm east reserve, adds 3.206 kN concrete per spine node relative to the original 600 × 600 mm node, and preserves 25 mm to the water portal. The declared node domain is N ≤ 850 kN and |Mx|, |My| ≤ 100 kNm. Its conservative tie demand is 385.14 kN per direction against 682.95 kN from 5H20. Orthogonal top and bottom layer elevations, cover, clear bar spaces and 750 mm straight anchorage reservations are explicit. That is a force-and-space reference; it does not certify the pile, soil, reinforcement intersection or shop cage.

The current joined reference initially retains a 450 mm field depth. The passing 250 mm section is not automatically an anchored shallow bridge: its lower bars lie 200 mm higher and require an explicit force-turn/development detail. The deep nodes remain at −750 mm. No water-bed, floor or grade change follows automatically from the section result. The old 600 mm spine node is rejected because 122.5 mm of its weather leaf lies beyond the node, even when the field member itself is 900 mm wide.

The [raised tie and end shoes](studies/current-house-tie.json), shown in the [section](studies/current-house-tie.svg), retain the formed 40 mm bore at Z = 2,200 mm and the original M30 end hardware. A 100 × 20 mm central strap at Z = 2,240 mm clears the complete 2,300 mm incoming component after 7.006 mm self-weight sag, without favourable tension: reserve is 35.244 mm at the court portal and 71.094 mm at the garden portal. The earlier 12 mm strap fails that same sag test.

The offset shoes transfer through the existing M30 rods and lower RC-face compression pads. A rod force of 1.8H at Z = 2,200 mm, opposed by a pad force of 0.8H at Z = 2,150 mm, gives resultant H at Z = 2,240 mm. The governing archived thrust H = 29.979 kN demands 53.963 kN rod tension against the declared 102 kN section resistance. Raw arch clearance is 32.442 mm; no voussoir drilling is inferred. Crosshead, toe, cheek and shop-weld force screens are explicit. The enlarged formed collar replaces the old 50 mm finish assumption and carries a real thermal/fire/material detail cost. Actual splitting, threads, welds, collars and installation remain STR-RECONCILE duties.

## Whole-house exit still to earn

| Duty | Current state |
|---|---|
| Changed bridge actions and eccentricities | Source-bound section comparison reproduces |
| Incoming component versus actual north ties | Explicit raised strap and equivalent-force shoes reproduce |
| Spine node bearing and representative force/space envelope | 900 × 650 mm reference now located; final cage fabrication remains downstream |
| Whole-house gravity and signed lateral/uplift ledger | Active: allocate actual roof, wall, slab and service origins once to named supports |
| Roof corners and collector continuity | Active: the historical collapsed corner envelope is not a complete jack/hip/collector route |
| Current RC200 / glass100 / mineral-DPC bearing and occupation | Active: join actual continuous load/restraint path without silently importing the older warm/cold floor comparison |

Selection requires the last three duties and actual critical reactions to fit their declared support domains. Final multi-arm anchorage fabrication, thermal/material qualification and actual site/physical acceptance remain downstream; an identified insufficient bearing or unexplained transfer does not.

Method provenance is the [JRC 2008 Walraven presentation](https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/EN1992_1_Walraven.pdf), torsion slides 83–89, alongside the owning RC method. This dated source establishes method provenance, not current UK or National Annex compliance. Run `npm run test:str` for the existing fourteen regressions and seven current source-bound reproducers.

## Finite whole-house candidate now under integration

The [roof network](studies/current-house-roof.json) replaces the unlocated corner sharing with end-supported secondary members between the actual hips and adjacent primaries. The longest plan span is 4,577.5 mm, rather than the ordinary 3,245 mm. Computed fabricated closed boxes are 250 × 150 × 12 mm for primaries/hips and 150 × 80 × 8 mm for secondary members. Their properties are calculated project fabrication references. Each ordinary primary is tested against the entire central roof strip plus both adjacent corners, deliberately overlapping local load envelopes; those envelopes must never be summed as building mass. The structural roof/load area of 144.15 m² and global gravity/uplift origins are retained once. It is not the RWT catchment: the current assigned inward roof (47.8125 m²) plus court (12.25 m²) totals 60.0625 m²; outward roof fields retain separate receiving handoffs.

The core-width RC roof collector is 140 × 400 mm, from Z = 6,540 to 6,940 mm. It passes a declared 200 kN point over a 1,300 mm axis span with 2H20 at each face and H8/75 links. The lower edge remains 25 mm above the existing upper-window ring extrados. This explicit stronger roof raises the eave and ridge by **446.99 mm**. It preserves the protected ceiling but changes external proportions, eave height and vertical rainwater runs. It is a proposed source rewind; the selected HAD model has not been silently changed. The steel-and-connection budget plus a 1.5 kPa normal-area nonsteel budget totals 426.95 kN against the retained 432.45 kN roof-G limit. Actual mass must remain inside the separate maxima.

The [upper-wall transfer record](studies/current-house-wall-transfers.json) locates ten actual unsupported intervals against the lower structural cores and their openings. Integral reinforcement strips remain inside RC200; the void-edge strip is clipped to 385 mm rather than crossing the entrance void. Section and fully cracked creep/shrinkage screens select stronger steel where needed. The rear wet-wall strip requires 3H16 at each face. Actual end-seat, anchorage and floor-field accounting remain integration duties; the result does not treat the strips as new independent building weight.

The [lateral candidate](studies/current-house-lateral.json) uses four continuous RC corner L-piers in the existing 140 mm inner-core footprint. Each physical leg is 1,000 mm; the conservative flexural section is 900 × 140 mm. The raw first-window aperture has 37.5 mm reserve. This deliberately replaces inner-core arch-abutment material locally and needs a formed RC/masonry transition; outer weather-brick appearance is retained. A full rectangular facade to the increased ridge receives the authored ±2.25 kPa design wind envelope. The four parallel legs each receive V = 60.807 kN and M = 265.056 kNm. Symmetric 8H20 per leg passes the declared N–M domain from −100 to +500 kN. A 25%-gross cracked stiffness screen gives 17.161 mm against H/500 = 17.436 mm.

That global drift result is **not** masonry or window compatibility. Actual first-floor sway is 4.304 mm and upper-storey relative racking is 8.670 mm. An explicit ±10 mm infill/RC return interface is required; the present bonded plaster, arch and window junctions cannot simply inherit that movement capacity. The corner group resolves base moment over a real 860 mm pile couple: required compression is up to 558.20 kN and uplift 408.20 kN per governing pile. Those are site-admissibility requirements, not demonstrated soil resistance. A full-section, unperforated 20 mm metal splice at Z = −50 to −30 mm is the candidate capillary break; opposed anchored bars transfer force through its faces. MAT is joining its DPC/air/gas edge and thermal price to this exact geometry.

The smallest buried-node correction is now **650 mm north–south**, preserving axes Y = 6,100 / 7,700 mm. It gives 32.5 mm to the actual transverse wall cores, instead of the old 7.5 mm, while retaining 25 mm to the full 900 mm water portal. These buried solids do not narrow the finished exterior working band. This supersedes the initial 600 mm NS node comparison; actual RWT rail/catch/body envelopes are being checked against the changed buried faces.

No whole-house structural selection is claimed yet. Remaining finite joins are the conserved origin-to-foundation ledger, actual strip/end anchorage and representative splice/collector forces, the wind-movement/inner-arch transition, and the matched architectural adoption of the changed roof and support domains. Final shop fabrication, material, fire, actual site and physical qualification remain separate.


## Coplanar roof recommendation — supersedes the stacked height choice

The [exact end-node comparison](studies/current-house-roof-connection.json) and [rendered house section](studies/current-house-roof-connection.svg) identify a proportionately better conventional connection. Keep the finite end-supported hip/secondary network, but use a **200 × 140 × 12 mm fabricated steel collector** with a **250 × 400 × 20 mm vertical knife/clevis plate**. The primary and collector share depth rather than stacking the whole primary above a 400 mm RC ring. Eight M24 bolts, a literal sloping bolt grid, plate combined stress and opposed weld-group force/moment screens are recorded. This is an actual proposed connection, not a reduction obtained by hiding jack-root torsion.

The ring remains at Z = 6,540–6,740 mm; the primary and tie underside is Z = 6,645 mm, 25 mm above the protected ceiling top. The knife's lower stem occupies 80 mm of the 176 mm wall/ceiling closure, so it replaces some insulation locally. A 25 mm mineral protection envelope would bottom at 6,515 mm, 71 mm above the retained finished ceiling. Its material/fire/thermal admission remains unearned. The complete 220 mm hardware-width envelope likewise requires a real local metal/roof closure, rather than pretending it fits entirely within a 140 mm core.

This connection raises the weather eave and ridge by **129.99 mm**, saving **317 mm** against the stacked RC400 control. The recommendation is the coplanar steel candidate, subject to the remaining whole-house joins. The stacked control is rejected on height and whole-design merit; the historical height is not an immutable owner constraint. The previously published lateral calculation uses the higher stacked roof as an adverse action comparison until the final coplanar/pier section and movement card are rebound together. It is not a claim that both roof sources are selected.

The section and tie figures have been rendered and inspected. The roof drawing includes actual normal-layer depth and physical overhang fall; local bolt positions follow the sloping primary. Numerical reproduction does not establish architectural adoption or physical qualification.


### Subsequent adverse joint control

The initial eight-bolt witness is **rejected**. It checked direct resultant without distributing moment through the actual sloping bolt group. Explicit down/up and horizontal-reversal combinations now preserve that failure. A hollow primary also cannot imply a solid clevis. The +130 mm massing remains a useful proposal, but that bolted connection is not an accepted force path. The next revision will use the actual conserved row/hip ledger and a conventional common welded node, including positive reverse loading and box-force introduction. The coloured front elevation also now distinguishes the 144.15 m² structural roof domain from the 60.0625 m² inward-roof-plus-court rain assignment.


## Conserved actual roof network — replaces the loose local pressure envelopes

The [current finite row network](studies/current-house-roof-network.json) now assigns each actual secondary-member row to the adjacent ordinary primary and diagonal hip. Eight ordinary frames at 12.7816875 m² each plus four hips at 10.474125 m² each conserve **144.15 m² exactly**. Physical secondary length is **280.2 m**. The short 127.5 mm inner-eave axis gap is a common terminal diaphragm, not an imaginary short hollow member with two full cleats.

Every primary, tie, common seat, crown and wind-bracing weight is a separate located origin. With a 1.5 kPa normal-area nonsteel budget, total roof G is **407.706 kN**, Q is **216.225 kN**, the actual uniform ULS downward total is **874.741 kN**, and the no-favourable-G uplift challenge is **−324.338 kN**. The separate collector replaces the old wall-head collector in the forthcoming whole-house ledger; its mass is not quietly moved into this roof allowance.

Each row also ranges independently from −2.25 to +6.3 kPa, with discrete metal adverse weights included. Maximum ordinary-frame court/outer reactions are **42.911 / 58.675 kN**; hip reactions are **27.851 / 59.216 kN**. Maximum tie force is **48.830 kN**. An unsigned 75 mm torque bound to one seat is **7.349 kNm** for ordinary frames and **6.247 kNm** for hips. Thus the new provisional node card is **70 kN down / 25 kN up / 60 kN either-sign tie / 10 kNm torsion**, rather than invented owner requirements of 200/65/139.

A computed 200 × 140 × 12 mm primary, 150 × 80 × 8 mm secondary and 150 × 100 × 8 mm tie pass the declared member screens. Secondary vertical deflection now resolves both local section axes. The actual metal origins and member-length limits must remain in this ledger. The conventional shared welded seat and 45° hip geometry are the active next join; the earlier single-knife/eight-bolt witness remains rejected. No new roof or house geometry is selected by these calculations.

## 6 November, 14:27 UTC — recoverable handoff

**STR-HOUSE remains open. PR1340 stays draft; do not merge or select this WIP.** The coordinator reached the actual execution limit. All meaningful source above is published; the completed architectural source and the historical structural fixtures remain unchanged. The next owner must acquire a fresh canonical lease, reconcile current main and replace the draft's released lease declaration before a new source event.

### Operative source roles

| Source | Actual claim |
|---|---|
| `current-house-interfaces` | Exact selected-HAD interface audit |
| `current-house-bridge` | Local section comparison; no automatic shallow-field anchorage or grade change |
| `current-house-nodes` | Proposed 650 mm NS node geometry/force-space reference; no completed whole-house reaction allocation |
| `current-house-tie` | Raised strap/end-shoe arithmetic and located incoming clearance; final actual arch/load/interface evidence remains bounded |
| `current-house-roof` | Larger overlapping local-load and stacked RC400 comparison, superseded as the preferred design direction |
| `current-house-roof-connection` | Useful coplanar height/elevation comparison; the eight-bolt force witness is explicitly **rejected** |
| `current-house-roof-network` | Current conserved finite row/hip and located metal action ledger; use its actual signed reactions for the next joint |
| `current-house-wall-transfers` | Ten actual source intervals with section/service screens; actual end seats, anchorage and whole-floor accounting still need joining |
| `current-house-lateral` | Higher-roof adverse action comparison; neither masonry movement compatibility nor the capillary path is selected |

### First concrete next action

Use the conserved network's bounded **70 kN down / 25 kN up / ±60 kN tie / 10 kNm torque** card to author one conventional **closed common welded seat**. Rafter and tie solids overlap if simply drawn through one another; terminate their branches into a real common node. The 45° hip needs its own plan projection, transverse roof-plane clearance and positive torsion route. The inner row's 127.5 mm axis gap cannot fit a hollow purlin plus two normal cleats; use one actual terminal diaphragm and retain its weight/reactions. Size local box introduction, BOTH load directions, collector combined bending/shear/torsion and its actual end restraint. Do not merely replace the failed bolts with an unlocated weld label.

The independent review identified a proportionate trial for that next step: matching 200 × 140 × 12 mm primary members and a 250 × 140 × 16 mm collector, with a common closed haunch rather than one planar knife. **That welded node has not been calculated, drawn or adopted in this checkpoint.** The +130 mm coplanar massing was accepted by the coordinator as an architectural proposal, not structural/source admission. A modest different height is allowed if the literal hip and common-node fit needs it.

The collector is a real separate wall-head origin. The earlier 260 × 140 mm RC collector must be explicitly deleted/replaced in the whole-house mass/geometry ledger; do not relabel the new ring's weight to squeeze it into the roof-G allowance. [SCI P432](https://steel-sci.com/assets/downloads/High-Strength-Steel-and-Execution-Guide-P432.pdf), §6.3.2/Table 6.2, and the [SCI bolts/welds notes](https://ihsbb.steel-sci.com/explanatory-notes/bolts-welds/) establish conventional bolt-method provenance. They do not rescue the rejected direct-resultant-only bolt model or qualify this proposed joint.

### Shallow bridge: adverse anchorage result to preserve

The actual new ordinary court-seat maximum is **42.911 kN**, at Y = 7,622.5 mm, only 77.5 mm from the north support axis. The independent read-only bridge calculation places it there, separately from the worst rail position: court M = 27.9045 kNm, T = 26.3046 kNm, V = 104.761 kN, longitudinal corner interaction 0.87568; spine M = 30.4789 kNm, T = 38.6152 kNm, V = 76.1973 kN, interaction 0.72935. These review figures are **not yet reproduced by an owning new script**; the committed bridge file still preserves its earlier source point/action comparison.

A candidate downward 90° return of the field bars into the deep node appears to fit at assumed 3 MPa bond. Conservative corner forces including the full end-moment envelope and V/8 shift are 132.705 kN for H20 / 165.186 kN for H25, needing 704.0 / 701.1 mm at that bond assumption. The candidate offers 735.7 / 729.6 mm, respectively. **It fails the adverse top-of-pour bond screen:** applying 0.7 × 3 = 2.1 MPa to the horizontal/bend zones, and 3 MPa only to the vertical tail, gives about 106.4 / 130.8 kN. Do not change the selected 450 mm field, water-bed or grade on that candidate.

The finite next anchorage test is the actual shifted end-moment/node compression path at the 325 mm node face, or an explicit confined positive head/eye; neither may assume good bond everywhere. Check mandrel bearing, splitting/hangers, positive torsion into the transverse arm/pile and all 3D bar lanes. The 400 mm pile axis is 325 mm from the wet node face. Candidate lower tails at 525 mm sit one pile radius away, while their curved portions sweep 425–525 / 445–525 mm and overlap inner pile/starter lanes in plan. No completed 3D starter/hoop/bar clearance exists. Existing EW top bars at Z = −250 collide with proposed NS field bars; rotating the EW layer to −302.5 mm is only a review suggestion, not selected geometry. No field bar may be counted again as an independent node bar.

### Other genuine exit blockers

- **Arch and movement:** the SW upper-window skewback projects X = 1,110.29–1,300 mm; the proposed RC toe at 1,262.5 cuts about 152.2 mm of that projection. A slip line through that bonded bearing is not an arch force path. First test the independently spring-tied genuine arch on actual sliding vertical-load shoes, both thrust abutments, positive out-of-plane guides and a renewable frame independent of the structural tie. Price any fixed fanlight/sash/reveal consequence. If it fails, compare the explicit integral curved RC inner-arch exception; do not substitute a disguised boxed lintel.
- **L-pier coupling:** Igxy/Igxx ≈ −0.584. The published full-Igxx sway needs transverse diaphragm restraint and corresponding secondary/base moments; a freely responding isolated L has only about 0.659 Ig effective inertia. The nominal ±10 mm note is not a finished movement detail. Actual floor-fed facade wind and the tied/sliding panel must determine travel, tolerance and guide forces.
- **Whole-house load/support ledger:** roof origins are now conserved, but all wall, slab, stair, grid and collector origins and every actual pile/head have not been allocated. Twelve corner-group positions are not the complete support list. Keep signed uplift and moment combinations distinct; do not attach the old N = 0…850 kN / ±100 kNm domain automatically to the new uplift extreme.
- **Moisture:** the upper solid plate at −50…−30 mm isolates only the upper pier. The retained RC200 floor remains connected below it through grid/piles; it is not a whole-floor capillary break. MAT is tracing a conditional lower-source-cut or separate-field boundary, including every real support and alternate bulk-water exposure. No lower cut, universal plate count or whole suspended-RC moisture acceptance is selected.
- **Exact below-floor coordination:** the 650 mm NS candidate leaves 25 mm to the full 900 mm portal, 75 mm to the rail bodies and 93.5 mm to the 763 mm carriage. Side posts at X = 7,950 / 9,300 and Y = 6,350 / 7,450 lie inside node plan footprints: their upper ends must terminate/anchor at actual node undersides rather than pass through RC. The finite underside-plate/rod force reference remains to author.

Run `npm run test:str`: fourteen existing regressions and nine current producers reproduce. That health result includes explicit failed controls and WIP boundaries; it is not a whole-house structural pass. Final shop fabrication, material, fire, actual site and physical qualification remain downstream after the intrinsic design joins above are resolved.

### Current common-grid and threshold register — 6 November, second session

The [located lower grid](studies/current-house-grid.svg), [full head register](studies/current-house-grid.json) and [reproducer](studies/current-house-grid.py) give one explicit, **unadopted** support arrangement: **52** distinct 400 mm shaft positions, including the twelve corner-group positions. The four local nodes straddle the water passage at X7950/9300 and Y6100/7700; the outer pair sits at X11667.5 and Y6000/7800. None intrudes into Y6450–7350. The original 58 positions and the corner groups cannot simply be added. Even this consolidated comparison puts two shafts only 550 mm apart at the north-west court/loggia return. It is not a site-independent promise of efficient piling or group capacity. The rail/sidepost and wet node detailing still use the retained 450 mm field, not the rejected shallow anchorage.

At the south-court threshold the 600 mm court-S support occupies Y3650–4250, top −180. The transition Y3987.5–4060 is over the real beam. The declared RC200 seat continues to Y4460: **210 mm is cantilever**, rather than a new pedestal. A 1 m strip with 5 kN/m characteristic line load at its far edge and 7.5 kPa G has demand 1.80 kNm/m; continuous top H12/150 has ample section reserve under the declared C30/S500 screen. This is a distributed-strip and footprint result, not concentrated pad/sill capacity, drying, thermal or waterproofing admission. The whole-floor RC still has a continuous capillary route to the grid below the upper L-pier plate; every head must be treated explicitly in any lower-source-cut comparison.

This register fixes physical head identities for load bookkeeping; it does not by itself select a foundation, distribute all roof/floor actions, qualify a beam/shaft group, or accept 52 metal cuts.

### All-head design-action comparison

The [support action schedule](studies/current-house-head-actions.json) now assigns roof rows, collector steel, ceiling, wall cores and leaves, floor fields, finite stair/bridge members, outside decks, equipment and the union of the common grid and its caps to the 52 named heads. Each origin balances vertical force **and both horizontal first moments**. The generic warm/cold grid is not another mass. Gross wall allowances deliberately fill opening territories for downward design, and the common RC volume counts the slab/grid/cap intersections once. These **6991.71 kN G / 762.31 kN Q** totals are reproducible budgets, not a measured structural take-off. The roof slice remains **407.71 G / 216.225 Q / −324.34 kN**; the wall-head steel ring adds 55.76 kN exactly once outside that roof mass.

| Whole-grid comparison | Result and limit |
|---|---|
| Four mirrored L groups, actual plate to head path | Full 12.4 m wind rectangle, ±2.25 kPa, ridge +8220.9 to shaft-head −750: 250.29 kN shear and 1122.65 kNm base moment per axis; includes 0.57 m of plinth. The restrained-axis Ixy/I = −0.584 creates reversing secondary group couples. It does not disappear at individual heads. |
| Fully adverse local axial range | **−518.62 kN** at P02 to **+692.82 kN** at P12. Opposing full X/Y envelopes, row loads and unfavourable local gravity influences are included. These are separate maxima, not simultaneous building reactions. 45 of 52 can require tension with no favourable dead-load credit. |
| Shaft-head moments and horizontal load | Maximum absolute eccentric-force components 20.22 and 17.24 kNm in this routing model. Each corner group requires direct lateral transfer of up to 62.57 kN per axis; an unknown group share is not counted three times. Vertical force from its overturning couple is already in the axial range. |
| Spatial and stiffness limits | Each main span is treated as end supported; local offsets are carried as moments. Entry-bridge residuals travel through the finite side members, not across a gap. The remaining nearest-axis fallback is at most 133.75 mm inside the actual 600 mm rib width. The longest ground-floor comparison field is 4.00 m; the independent ceiling comparison reaches 6.203 m. Their real section, bearings and integration are still design duties. |

The [calculation](studies/current-house-head-actions.py) reports actual case loads separately from independent station-by-station adverse bounds. Its 52 coordinates and signs are suitable for MAT comparing 52 possible cuts against a separate protected field; they neither admit 52 metal joints nor prove wet-ground capacity, common-grid continuity, group stiffness, positive roof tie-down, independent ceiling support, the external deck details or the whole-house design. The 550 mm head spacing in one return is still an explicit adverse cost.
