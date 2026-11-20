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
| First occupied FFL | 3980 | 4165 |
| Ground-to-first occupied interval | 3450 | 3450 |
| Source attic **datum**, not a proved floor | 7430 | 7615 |
| Cap-to-first-soffit structural envelope | 3880 | 4065 |
| First FFL above authored grade−150 | 4130 | 4315 |
| Front1:20 sloping run | 13600 | 17300 |
| Front straight reservation with source landings | 17200 | 20900 |

Source firstFFL3450 is RC3170…3370 plus80 finishing. It is not a competing3370 occupied datum. The ground controller determines FFL; the profile adds its occupied translation to the source first RC, first FFL, attic datum, room-opening and north-portal datums. The actual north raw spring/crown become2780/3380 for530 and2965/3565 for715. All source arch-opening identities and available sill/spring/head levels appear in the receipt.

The cold grid and all52 caps remain fixed. The180 wet RC plinth reaches the **mineral receiving plane0**; this is not a grid/cap lift. The source waterstop−50…−30 remains labelled as source evidence. The proposed130…150 top20 mineral-interface waterstop is a **new unproved concept**, not an automatic relocation of that detail. Its putative lower-post envelope is310 from cap−180 to130, versus source130 to−50; bars, anchors, constituent/contact, air/gas/water and thermal continuity are not inherited. Ordinary masonry begins above dryRC350; a full cap-to-soffit structural envelope is not a solid adopted masonry/post recipe through the mineral joint.

The rendered sheet includes both whole-house datum profiles and a source900-wide service-spine girder /140 core ground detail. The occupied upper-wall termination is dashed and unassigned. Plinth/enclosure returns, exterior wet-leaf separation, actual weather/water/air/gas/thermal continuity, stair toe and roof geometry remain explicit roles rather than filled-in lines. No step count or going is authored, so the profile shows the actual source-derived ramp reservations and withholds a steps design. Actual approach layout, site terrain and fire-height interpretation remain unearned.

## Roof and wind boundaries

The native structural ring/pressure datum6600, historical nominal eave6800, HAD's explicitly raised eave7100 and MAT's7418.423 wall line are different assembly datums. At715 their arithmetic translated references are7315, a historical nominal7515, HAD7815 and MAT8133.423. MAT's separate8645.327 cap comparison becomes9360.327. None supplies a joined roof section. The method therefore returns `coherentWeatherProfile=null` and `wholeHouseWeatherHeightAboveAuthoredGradeMm=null`; the attic datum is not relabelled a floor or weather height. ROF/MAT/HAD/STR must join actual structure, pitch, ceiling/attic use, full weather stack, supports, access and independent water receivers before a complete roof profile can be claimed.

Raising a walking plane does not hide piers from wind. The715 case exposes a865 grade-to-FFL envelope above authored−150, with **no occlusion credit** and no adopted pressure law. Changing authored grade to−250 increases that envelope to965, including exposed cold construction. Actual external faces/openings, plinth closures and their supported tributaries must own the raised pressure application. A floor-level label cannot remove their pressure.

The old source3350 ground structural height becomes3880/4065. The profile exports exact member-envelope and proposed joint-segment coordinates, and explicit `PROFILE_FORCE_REPLAY_REQUIRED` diagnostics; it exports no raised reactions or stiffness. The new `vertical_rc_floor.py` is a baseline0 receiving method, not a raised-house solution. Its actual floor/portal endpoints, boundary rotation offsets, RC masses, joints, retained pressure application and source52 six-wrench paths must rebuild before any715 demand is adopted. No lower-force budget or source capacity is translated.

The530 and715 ground cases retain the same concrete geometry: the source receipt's separation RC, wet plinth and net new beam sum21.983509475m³, about549.588kN at its authored25kN/m³. This profile claims **zero removal** of that extra RC and no monetary saving. The taller wall/post, facade/enclosure, approach and roof costs are not included in that retained ground-only number.

## Executable contract and validation

`project/had/studies/house_vertical_profile.py` exports `load_profile_source`, `reference_profile_case`, `derive_profile` and `render_profile`. The exact `house-vertical-profile/1` request contains only source identities and the **actual native ground case**. The method recomputes that case, binds all ground inputs and its own code, and rejects injected levels, absent ground source identities and changed source bytes. `--read`, stdin replay, `--write` and `--check` share this method. Generated comparison JSON and SVG retain530/715 ground-case identity; the250 comparison is authored only through the existing ground setting.

The new current adapter `compiler/reference-house/current-design/house-vertical-profile.ts` exports `readHouseVerticalProfileCase(resolved, groundCase?)` and `runHouseVerticalProfileCase(resolved, input)`. Its public case contains `schema,planDigest,bindingDigest,groundCase`; it recomputes the existing ground adapter, rebuilds the native ground request, then checks returned ground levels against that replay. No computed-ground injection, service-stage FFL, site-grade knob or second stack is accepted. The canonical `had-house-vertical-profile` source family binds its native method, ground dependencies, consumers and generated receipts. Tests use `readCurrentDesignResolution` without an injected source inventory. The actual saved ground stage and public ground CLI feed the same authored case into the profile and retain identical ground-case identity. A dedicated saved profile stage and profile CLI mode remain shared current-design wiring; this adapter does not introduce a second saved ground owner.

Seven native controls and four current-adapter controls verify the actual530 baseline,250→270 service-zone propagation to715→735 across first/attic/arch/approach/render/identity, unchanged cold foundations and waterstop concept, non-occluded wind, withheld roof, source invalidation and level-injection rejection. TypeScript checking, deterministic regeneration and rendered inspection cover the changed representation boundaries. These are source-derived proposal results, not selected-house or installed acceptance.
