# Wet support: ordinary closed-loop cage comparison

This is an unselected geometric and quantity comparison for the actual 250 ×350 beam and two 260 ×450 posts. It preserves the 70mm south beam overhang. It does not establish the beam-end load transfer, post-head bearing/anchorage, grid joint, signed house envelope, delivered material weight or fabrication acceptance. All corresponding result flags remain false.

The development reference retains centred pads `[0,0]`. The retained path witness uses the frozen `GRID-ORIGIN-wet-shifted-quadrature8` result with `[160,0]` offsets as an **adverse edit probe**, not a selected arrangement. The same method consumes each subsequently supplied centred or density-control result independently. It never borrows that probe's actions for another geometry.

## Authored choices and methods

- [Versioned choices](studies/wet-support-cage-comparison-settings.json), schema `str-wet-support-cage-comparison/1`.
- [Reusable method and CLI](studies/wet_support_cage_comparison.py): `comparison_settings()`, `validate_settings(settings)`, `assess(native, grid, settings, with_collisions=True)`.
- [Recoverable path witness](studies/wet-support-cage-comparison-paths.json): explicit main-bar paths; four complete link templates plus 220 translated instances; actual same-case six-action rows, source-solid union, quantities and unsuccessful acceptance flags. This frozen comparison is explicitly **not a current-house receipt**.
- [Analytical tests](studies/wet_support_cage_comparison_test.py), including rejected return/hook configurations and material/input edits. No native solve is performed by these tests.

Units are mm, kN and kNm unless a field explicitly says otherwise. XYZ uses the source house datums. Bar IDs begin `STR/WET-CAGE/`; concrete, grid and cap IDs remain linked to their owning source objects. Authored choices, derived physical paths and same-case action evidence are separate objects.

The pure Python API records a canonical parsed-grid digest, not an assertion of raw-source authentication. The explicit-file CLI verifies the grid's raw SHA256 against `native.sourceSHA256['project/str/studies/current-house-grid.json']`; the shared wrapper must perform the same check before calling the API. Changed native dimensions or unsupported material/bar methods reject before a result can inherit their actions.

```sh
python3 -B project/str/studies/wet_support_cage_comparison.py --read-settings
python3 -B project/str/studies/wet_support_cage_comparison.py --validate-settings < choices.json
python3 -B project/str/studies/wet_support_cage_comparison.py --stdin < explicit-native-grid-settings.json
python3 -B project/str/studies/wet_support_cage_comparison.py --native frozen-native.json --grid project/str/studies/current-house-grid.json --output comparison.json
```

`--stdin` requires exactly `{native, grid, settings}`. `--skip-collisions` is an explicitly incomplete analytical mode, never a geometric pass. A malformed payload, missing raw identity or incompatible dimension fails explicitly. Hook-tail edits are bounded to 80–120mm; a valid choice still has to pass its resulting physical geometry checks.

## Beam: four strands from two ordinary loops

Two single H12 bars form closed longitudinal stadium loops in vertical planes X2852.5 and X2952.5. Their ordinary 180° returns have 200mm mandrels, 106mm centreline radius and 212mm strand separation, fitting the 350mm actual depth. The upper/lower straight centres are Z3301/3089. Their south and north return-centre Y coordinates are 8957.5 and 11562.5; extreme Y coordinates are 8851.5 and 11668.5. No hidden welded closure, end bar or vertical 621mm tail is supplied.

| Loop ID suffix | Full lap Y interval | Lower lap Z | Ramp to upper strand Y interval | Actual path length |
| --- | --- | --- | --- | --- |
| `beam/loop/0` | 9150–10110 | 3257 | 10110–10391.545656 | 6839.579401mm |
| `beam/loop/1` | 10280–11240 | 3257 | 11240–11521.545656 | 6839.579401mm |

The 960mm top laps are disjoint along the span. Each has 44mm vertical separation: 22mm adverse clear after H12 diameter and independent ±5mm main-bar placement. Its 950mm lap after endpoint tolerance exceeds the explicit `1.5 ×621.118 =931.677mm` poor-bond, full-yield comparison. The shallow ramp uses two actual opposite 200mm-mandrel bends and a straight tangent, not an abrupt kink. At a lap there are five straight strands, not an invented six or eight; ramp and return regions receive no fictional straight longitudinal steel.

The repository comparison material gives fyd434.782609MPa, fbd3.0/2.1MPa and concrete compression17MPa. Good/poor full-yield basic lengths are434.782609/621.118012mm. The source full-yield mandrel comparison is183.402218mm against the authored200mm. These are necessary numerical comparisons: no bend-pressure, splitting/bursting, lap confinement or beam-end D-region acceptance follows from them. The bearing centre is near the south U extremity, so a straight-section capacity cannot settle that local force transfer.

## Posts: actual grid depth and full coordinates

Each post has eight H12 bars at X offsets±58 and Y offsets±153/±51. Their upper ends are Z2954, 56mm below the actual Z3010 head; this deliberately leaves the unresolved head anchorage visible. Fourteen bars run straight to Z−680. The source post bases are Z−180, so their nominal straight grid embedment is500mm, or490mm after the comparison endpoint allowance.

The south post sits over actual `CAP/P47`, bounds `[2642.5,8552.5,−750;3242.5,9152.5,−180]`. The north cap `CAP/P24` starts at Y11367.5 and has bounds `[2602.5,11367.5,−750;3202.5,11967.5,−180]`. Its two southern bar axes at Y11359.5 are outside that cap, over actual `GRID/wet`, Z−630..−180. The method checks the **union** of these actual source solids and its reentrant external boundary; it does not assume a deeper continuous cap.

Those two bars descend vertically to Z−480, turn on a200mm mandrel toward north/outward at30° in plan, then run160mm horizontally. The bend itself supplies no credited bond length. The actual straight-only development is300+160=460mm, or450mm after endpoint allowance. This exceeds the **good-bond** full-yield basic comparison only; good-bond construction, splitting, grid cage fit and joint transfer remain unproved.

| Bar ID suffix | Start XYZ | Bend start XYZ | Bend end XYZ | Tail end XYZ |
| --- | --- | --- | --- | --- |
| `post/1/main/-1/0` | `[2844.5,11359.5,2954]` | `[2844.5,11359.5,−480]` | `[2791.5,11451.298693,−586]` | `[2711.5,11589.862757,−586]` |
| `post/1/main/1/0` | `[2960.5,11359.5,2954]` | `[2960.5,11359.5,−480]` | `[3013.5,11451.298693,−586]` | `[3093.5,11589.862757,−586]` |

These starter paths are checked against all known candidate steel. The existing grid reinforcement is unknown and is explicitly not declared clear.

## Links, tolerance checks and rejected geometry

There are28 beam H8 links,64 post H8 perimeter links and128 H8 intermediate cross-ties. Groups are spaced≤100mm. Each perimeter link includes its complete ordinary32mm-mandrel perimeter, two40mm-mandrel135° hook arcs,80mm tails and60mm smooth changes to hook planes±6mm. Post cross-tie hook planes are staggered±18mm about the perimeter link. Beam closures face downwards. A link is not a sharp rectangle with its hook steel omitted.

Beam end hoops are30mm into each U from the straight tangent, at Y8927.5/11592.5; the76mm distance to the return extremity stays within the100mm declared link duty. No end-link force-transfer acceptance is claimed.

The retained nominal paths have28,203 independent path-pair checks, zero failed clearances and zero failed internal hook/lap closure checks. Main-bar pairs require21mm clear; other known steel paths require no physical overlap. Independent per-coordinate relative bounds are±5mm per main path and±1mm per link path. Common cage installation±5mm is additionally included in concrete-cover checking. Chord interpolation is bounded≤0.01mm, and smooth jog lengths use lower/upper bounds. Actual minimum adverse known-steel clearance is0.563994mm; minimum adverse concrete cover is40mm. These are narrow modeled margins, not installation evidence.

Rejected attempts are preserved as explicit regression controls, not silently removed constraints:

| Attempt | Actual problem | Corrected geometry |
| --- | --- | --- |
| Terminal beam hoop at return extremity Y11668.5 | Collided with the U | End hoops30mm inside tangent; actual≤100mm duty retained |
| Post main face71mm |64 top-right hook/main conflicts across post groups | Main face72mm; complete hook geometry retained |
| North return plan angle28° | Adverse main/main lower bound20.902534mm<21mm |30°, yielding23.413003mm at the same pair |
| Coplanar opposite link hooks | Self closure steel overlaps |±6mm hook planes with actual smooth transition paths |
| Valid120mm hook-tail edit |128 same-bar cross-tie tail closure failures, despite zero independent-path and cover failures |80mm default retained; all three geometry reports remain necessary |

The box/projection distance certificates are conservative lower bounds; a failed lower bound is unresolved geometry. Connected local tangent segments are one bar, not independent bars. Same-bar distant lap strands and opposed hook arcs/tails are checked separately. Actual bending, link closure strength and fabrication remain outstanding.

## Weight:25 is not qualified

The actual beam/post gross concrete region is1.0050225m³. The path takeoff includes bends, complete laps, all hook tails and jogs, and all post development into the actual grid.

| Steel group | Centreline length upper bound |
| --- | --- |
| Beam H12 loops |13.679158801m |
| Post H12 bars, including development |58.397008821m |
| Beam H8 links |27.777884464m |
| Post H8 perimeter links |77.572307347m |
| Post H8 cross-ties |47.391715790m |

Steel volume upper bound is0.01582926819m³:0.01489587488m³ within the new concrete bodies and0.00093339331m³ in starter regions below the posts. **All** grid starter steel is charged in full; there is no offsetting credit for displaced existing grid concrete. Existing grid concrete/reinforcement and the two source pad weights retain their separate native inventories.

The explicit steel force density is78.5kN/m³. The separately authored nominal steel mass density7850kg/m³ gives124.259755kg of explicit steel; the force calculation uses78.5, not a covert kg conversion. Wire, chairs and existing grid cage quantities remain unbounded.

With plain concrete **authored only as a24kN/m³ comparison**, explicit body concrete plus all steel weighs25.00563656kN. The native bulk25 budget is25.12556250kN: only0.11992594kN remains. The maximum plain-concrete unit weight compatible with bulk25 is therefore **24.12112183kN/m³ before wire/chairs**. No delivered upper bound at or below that threshold has been established. Using25 for plain concrete fails the bulk25 ledger. No weight qualification follows from this takeoff.

The code separately reports each native case's actual wet-body density. Changing the **floor** concrete density to27 does not change wet beam/post density; an actual wet-support27 control is required. No global27 selection or house-level consequence is adopted here.

## Actual simultaneous actions and remaining decision

Each beam record retains one physical cut's simultaneous N, Vy, Vz, T, My and Mz. Straight-bar intersections are recovered at that same physical station. Nominal strain-compatibility and thin-cell link-flow screens use that row only; no independent component maxima are fabricated. Curved returns, ramps and post-head terminations report unsupported D-regions. Position-tolerance resistance, full biaxial resistance, torsion struts, bond/anchorage and complete signed loading remain unproved.

For the retained shifted-pad q8 probe, the largest supported nominal beam interaction ratio is0.251688 and necessary link-flow ratio0.267206. Sixteen of40 native beam rows lie in unsupported return/ramp regions. These small nominal ratios do not close the ends. The adverse south post head has N45.066682kN/Mx−7.049194kNm/My0.027407kNm, gross full-compression kern ratio2.099594. The centred north head in that same adverse solve is nearly unloaded, N0.235808kN/Mx0.007631kNm/My0.020762kNm, kern ratio2.463299. These are necessary gross-section screens, not a prediction of cracking or failure and not a full bearing-contact proof.

The next consequential comparison is this same cage against all actual centred-pad controls, especially roof/gravity variations and explicit wet25/27 cases, followed by a local curved-bar/bearing/head/grid joint model with an actual grid reinforcement cage. If the local load path cannot develop the required force within the real support geometry, simplify the support/bearing/end arrangement; do not increase the whole slab or invent embedment in a void to conceal it. A300mm-wide beam alternative is outside the current native250..260mm support-width contract and needs an explicit coordinated geometry extension before comparison.
