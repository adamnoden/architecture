# Whole-house vertical proposal from one ground case

The raised service floor changes the house, not only the water route. This source-bound comparison derives the whole occupied profile from the actual `dry_side_ground_section` case. It compares the existing authored65 service zone with the250 trial; it does not introduce another FFL or floor-stack setting.

| Datum / consequence, mm | Ground530 | Ground715 |
|---|---:|---:|
| Retained cold grid / cap top | −180 | −180 |
| Wet RC plinth | −180…0 | −180…0 |
| Mineral course | 0…150 | 0…150 |
| Dry ground RC | 150…350 | 150…350 |
| Retained bare cellular glass | 350…450 | 350…450 |
| Accessible service zone | 450…515 | 450…700 |
| Finish / occupied FFL | 515…530 | 700…715 |
| First RC soffit / top | 3700 / 3900 | 3885 / 4085 |
| Wet-beam soffit / top, unadopted | 3550 / 3900 | 3735 / 4085 |
| Wet-post top / fixed base | 3540 / −180 | 3725 / −180 |
| Local structural clearance below wet beam | 3020 | 3020 |
| Wet-post extension above retained base | +530 | +715 |
| Conditional added gross post envelope,m³ | 0.124020 | 0.167310 |
| First occupied FFL | 3980 | 4165 |
| Ground-to-first occupied interval | 3450 | 3450 |
| Source attic **datum**, not a proved floor | 7430 | 7615 |
| Cap-to-first-soffit structural envelope | 3880 | 4065 |
| First FFL above authored grade−150 | 4130 | 4315 |
| Front1:20 sloping run | 13600 | 17300 |
| Front straight reservation with source landings | 17200 | 20900 |

Source firstFFL3450 is RC3170…3370 plus80 finishing. It is not a competing3370 occupied datum. The ground controller determines FFL; the profile adds its occupied translation to the source first RC, first FFL, attic datum, room-opening and north-portal datums. The actual north raw spring/crown become2780/3380 for530 and2965/3565 for715. All source arch-opening identities and available sill/spring/head levels appear in the receipt.

### Opening datums: local source, absolute output

The arch register stores sill, spring and head relative to each storey's finished floor. The profile must add that source storey FFL before applying the occupied-plane shift. Adding the shift alone placed first-floor openings3450mm too low. The corrected receipt names both the local source datum and absolute source-ground output datum, and retains each source/raised storey FFL.

At groundFFL530, `GROUND/south-window-0` has absolute sill/spring/head1280/3080/3380mm. Its first-floor counterpart is4730/6530/6830mm, above firstFFL3980; first-floor south-window-1 has sill4830mm. A250→270mm service-zone edit moves the first counterpart4915/6715/7015→4935/6735/7035mm while preserving the3450mm storey interval. These controls correct coordinate interpretation; they do not alter the source opening shapes, ground stack, lower-member comparison or any force/adoption boundary below.

The cold grid and all52 caps remain fixed. The180 wet RC plinth reaches the **mineral receiving plane0**; the full mineral course occupies0…150 and the separate dry RC slab150…350. Dry walls, columns, portal abutments and the stair toe restart on the slab top350. No column or bar is extended through the mineral course. The former20mm column cut at−50…−30 remains source history and is omitted from the proposed dry members; moving that cut to130…150 would not implement the full mineral separation.

The existing ground case now derives two transformations: the dry receiving plane moves−180→350, or530mm; occupied geometry moves0→530 at service65 and0→715 at service250. At service65 those shifts coincide, so a source3350mm lower member remains3350mm between350 and3700. At service250 the dry slab remains350 while the occupied first-floor soffit becomes3885; that member becomes3535mm. A250→270 service edit adds20mm to that height while preserving the dry support plane and cold grid. Treating the entire−180…3700 separation as one3880mm column would instead bridge the intended mineral boundary. Actual full-width mineral bearing, shear/uplift transfer, dry-slab reinforcement/base anchorage and the rebuilt native response remain unresolved; the new profile is geometry, not an installed connection.

The rendered sheet includes both whole-house datum profiles and a source900-wide service-spine girder /140 core ground detail. The occupied upper-wall termination is dashed and unassigned. Plinth/enclosure returns, exterior wet-leaf separation, actual weather/water/air/gas/thermal continuity, stair toe and roof geometry remain explicit roles rather than filled-in lines. No step count or going is authored, so the profile shows the actual source-derived ramp reservations and withholds a steps design. Actual approach layout, site terrain and fire-height interpretation remain unearned.

## Actual wet support in the same profile

The profile now binds the actual [floor-section receipt](../str/studies/floor-section-proof.json)
and verifies its58native source identities against current file bytes. It checks
all seven wet controls for one consistent beam/post section and source datum set.
Quadrature, pad offsets, loading and concrete-density comparisons are not selected
by this geometry join. A missing control, conflicting post head, stale receipt
or floor-datum mismatch rejects the profile rather than silently using the first
case or a historical beam reservation.

The actual350deep wet beam has its underside150below the ordinary source slab.
It therefore translates to3550/3735in the530/715profiles, giving3020unfinished
structural clearance above either walking floor. That is not a finished ceiling
or a clearance pass for panels, services or handling. The section includes the
unadopted local beam and a dashed post-datum overlay; it does not depict a new
accepted joint through the ground layers.

Both actual260×450posts restart at dry slab350. Their heads translate
to3540/3725, preserving the actual10mm beam-to-post bearing gap. Their heights
are3190/3375mm, versus source3190mm. Conditional gross post-volume changes
are therefore0/0.043290m³ across the two posts. At the independently authored
25and27kN/m³ comparisons, the latter is1.082250/1.168830kN. These are characteristic
geometric arithmetic, with no selected density, factored force, steel/cage
quantity, delivered material qualification or raised equilibrium result.

The retained ground-only RC receipt below is unchanged. The extension comparison
is separately labelled and is not silently folded into a whole-house mass or
capacity claim. Actual post segmentation, mineral/DPC crossings, cages and
anchorage, renewed beam/slab interfaces, stiffness, wind/load lever arms and
all52heads must rebuild before adopting a raised arrangement. The new
`PROFILE_WET_SUPPORT_REPLAY_REQUIRED` diagnostic names those exact beam/post
objects. Roof/weather, raised-force and house-adoption gates remain held.

## Roof and wind boundaries

The native structural ring/pressure datum6600, historical nominal eave6800, HAD's explicitly raised eave7100 and MAT's7418.423 wall line are different assembly datums. At715 their arithmetic translated references are7315, a historical nominal7515, HAD7815 and MAT8133.423. MAT's separate8645.327 cap comparison becomes9360.327. None supplies a joined roof section. The method therefore returns `coherentWeatherProfile=null` and `wholeHouseWeatherHeightAboveAuthoredGradeMm=null`; the attic datum is not relabelled a floor or weather height. ROF/MAT/HAD/STR must join actual structure, pitch, ceiling/attic use, full weather stack, supports, access and independent water receivers before a complete roof profile can be claimed.

Raising a walking plane does not hide piers from wind. The715 case exposes a865 grade-to-FFL envelope above authored−150, with **no occlusion credit** and no adopted pressure law. Changing authored grade to−250 increases that envelope to965, including exposed cold construction. Actual external faces/openings, plinth closures and their supported tributaries must own the raised pressure application. A floor-level label cannot remove their pressure.

The source3350 ground member height becomes3350/3535 in the two dry-base proposals. The separate cold-grid-to-first-soffit distances3880/4065 are not continuous column lengths. The profile exports exact member-envelope and full mineral-course coordinates, and explicit `PROFILE_FORCE_REPLAY_REQUIRED` diagnostics; it exports no raised reactions or stiffness. `vertical_rc_floor.py` remains a baseline0 receiving method. Actual floor/portal endpoints, boundary rotation offsets, RC masses, mineral/contact laws, anchorage, retained pressure application and source52 six-wrench paths must rebuild before raised demands can be adopted. No lower-force budget or source capacity is translated.

The530 and715 ground cases retain the same concrete geometry: the source receipt's separation RC, wet plinth and net new beam sum21.983509475m³, about549.588kN at its authored25kN/m³. This profile claims **zero removal** of that extra RC and no monetary saving. The taller wall/post, facade/enclosure, approach and roof costs are not included in that retained ground-only number.

## Executable contract and validation

`project/had/studies/house_vertical_profile.py` exports `load_profile_source`, `reference_profile_case`, `derive_profile` and `render_profile`. The exact `house-vertical-profile/1` request contains only source identities and the **actual native ground case**. The method recomputes that case, binds all ground inputs, the actual wet-support receipt and its native58source tuple, and its own code, and rejects injected levels, absent ground source identities and changed source bytes. `--read`, stdin replay, `--write` and `--check` share this method. Generated comparison JSON and SVG retain530/715 ground-case identity; the250 comparison is authored only through the existing ground setting.

The new current adapter `compiler/reference-house/current-design/house-vertical-profile.ts` exports `readHouseVerticalProfileCase(resolved, groundCase?)` and `runHouseVerticalProfileCase(resolved, input)`. Its public case contains `schema,planDigest,bindingDigest,groundCase`; it recomputes the existing ground adapter, rebuilds the native ground request, then checks returned ground levels against that replay. No computed-ground injection, service-stage FFL, site-grade knob or second stack is accepted. The canonical `had-house-vertical-profile` source family binds its native method, ground dependencies, consumers and generated receipts. Tests use `readCurrentDesignResolution` without an injected source inventory. The actual saved ground stage and public ground CLI feed the same authored case into the profile and retain identical ground-case identity. A dedicated saved profile stage and profile CLI mode remain shared current-design wiring; this adapter does not introduce a second saved ground owner.

Ten native controls and four current-adapter controls cover the actual530 baseline,250→270 service-zone propagation to715→735 across first/attic/arch/approach/render/identity, unchanged cold foundations and waterstop concept, non-occluded wind, withheld roof, source invalidation and level-injection rejection. TypeScript checking, deterministic regeneration and rendered inspection cover the changed representation boundaries. The updated native tests and deterministic producer pass; current-adapter execution against the final refreshed source account remains an integration check. These are source-derived proposal results, not selected-house or installed acceptance.
