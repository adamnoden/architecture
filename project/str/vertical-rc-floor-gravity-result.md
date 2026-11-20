# RC200 floor gravity joined to the 52-head model

The new vertical-floor method adds the missing slab mechanics and its own weight to the existing coupled structural comparison. It uses the actual net floor bodies, a two-way RC200 plate, finite north upstands, the four L paths, distributed compression-only clear-core receiving fibres and the actual 52-head grid. It does not replace the floor by a rigid diaphragm or distribute a gross gravity budget directly to pile heads.

This is a **source-ground-0 control**, with openly authored stiffness laws. The current curved RC north receiver is a mechanical control, not a fabrication-approved cage. The raised occupied-floor proposals, actual masonry/contact properties, wall and roof permanent loads, local reinforcement and construction acceptance remain separate obligations.

## Material and load accounting

The known-domain RC200 plate has **98.75938125 m²** and **493.79690625 kN** physical selfweight at the authored 25 kN/m³. Together with the existing north RC/infill, the joined physical gravity inventory is **556.53780306 kN** before the explicitly authored comparison factor.

The plate owns the physical RC200 field and the authored 140×200 slab-level band union once. The full north upstands own their complete 200 mm strips; their overlapping slab material is removed from the plate. The old retained-component no-credit reservations are not silently added as further concrete. Existing ground cap mass, gross filled-opening masonry, the historical floor/finish GMAX budgets and old fixed-base roof/head reactions are not imported.

The physical stair void comes from the architectural source: its west edge is **X417.5**. The old membrane study's X402.5 adjustment is retained as an explicit 15 mm **in-plane credit reservation**, not a second architectural void. This recovers the actual 0.065025 m² tongue in the vertical material account without asserting its local reinforcement capacity. Round service penetrations use explicit enclosing rectangular structural-opening comparisons; the service positions and radii still control those envelopes.

The entire principal wet territory remains withheld because its complete penetration inventory is missing. Its beige reservation in the figure is **not a confirmed architectural hole**. Consequently this is a known-domain gravity result, not permission to claim the complete house permanent load.

All previously admitted first-floor Q cards are removed before any fresh floor use load is introduced. The optional 2 kPa challenge is applied to the new net plate area and participates in its finite stiffness and reaction redistribution. Source upper-wall/ceiling GMAX remains an explicit external strength challenge; it is not favourable minimum gravity.

## Mechanics and numerical controls

Rectangular MITC4 Mindlin elements carry vertical bending and shear. The same floor geometry controls stiffness, selfweight, openings, contact, deflections and reactions. Actual north beam/member coordinates provide the full work-dual vertical/rotation trace. Clear structural core territories exclude door openings and radial arch projections; their finite axial/compression-only normal laws add no masonry horizontal restraint or tensile capacity. Unused auxiliary-coordinate gauges carry zero reaction and do not clamp plate rotations.

Each lower receiving fibre uses an actual finite ground beam within its width, including eccentric torsion and master offsets. Where an actual source cap exists beyond that beam footprint, its finite upper-cap body receives the load. Existing north cap members are reused. Two further source upper-cap comparisons, P34/P35, supply the missing cap-face paths. Their local three-dimensional cap/grid union and lower-cap transfer are not qualified by this equivalent frame.

The only remaining absent ground receiving footprint is the exact **0.01050625 m² SW court patch**. The method supplies no invented restraint there. It is the same independently identified corner duty requiring an actual ground closure/transfer solution.

NumPy 2.3.5 and SciPy 1.17.0 are pinned in `studies/vertical-floor-requirements.txt`. The new route uses sparse block condensation and direct assembly of the existing transformed frame members and unchanged zero-gap unilateral laws. Independent controls compare it against the original standard-library Schur and FrameModel, including opposite contact signs. The frozen 30-source wind model and its 48-case evidence are unchanged.

## Actual executed cases

Ten coupled cases were executed; this is not a new 96-programme sweep.

| Control | Plate maximum vertical movement | Largest unqualified L tie demand |
|---|---:|---:|
| W31, explicit 0.9 physical G | 1.13244 mm | 94.6094 kN |
| Vertical mesh 1000 → 700 mm | 1.14412 mm | 95.4053 kN |
| Masonry comparison E500 MPa | 1.27991 mm | 95.0432 kN |
| Masonry comparison E5000 MPa | 0.90845 mm | 93.6052 kN |
| Fresh net-area Q2 + specified GMAX | 1.69804 mm | 82.5707 kN |
| Opposite source W7 | 0.88431 mm | 99.4927 kN |
| Mixed source W35 | 0.88353 mm | 84.6026 kN |
| Zero physical G adverse control | 1.74142 mm | 118.3537 kN |

The 1000→700 mm mesh changes the largest head-wrench component by **1.78633 kN/kNm**. This is a measured refinement difference, not an assertion of asymptotic local-stress convergence. Two- versus four-point quadrature per contact direction changes that component by **0.00999 kN/kNm**. Pressure extrema are values at evaluated fibres, not certified boundary/local bearing peaks.

Enlarging the actual plant-riser opening removes **0.545 kN** RC selfweight and changes a coupled head component by **1.89193 kN/kNm**, while the ground geometry and material laws remain unchanged. This is a geometric/stiffness/load propagation result, not a repeated snapshot check.

Across the ten cases, the largest global wrench residual is **3.39×10⁻⁹ kN/kNm** and the recovered physical plate work residual is **5.28×10⁻¹³**. Tests independently reconstruct all 52 global head wrenches from source wind actions, actual RC gravity and fresh floor Q, and check every saved normal fibre against its finite constitutive law.

## Reproduction and remaining scope

`vertical_rc_floor.py --read` returns the 35-source case with null plate/bearing laws. Standard input is exactly `{ "case": ..., "name": ... }`. The sole floor is `monolithicCase.houseCase.joinedCase.floor`; there is no second editable floor definition. `vertical_rc_floor_proof.py --write` reproduces the ten cases and computed SVG. `vertical-rc-floor.test.mjs` runs the mathematics, source-bound evidence and actual CLI consumer tests.

Future lower-wall gravity must not be dumped onto the floor contact nodes. The present normal fibres contain no wall selfweight. Joining wall gravity requires separating the wall body, its base joint and its top bearing so that the top can open while wall mass still reaches the ground. Upper-wall loads must likewise enter their actual plate/beam locations.

The SW ground closure, complete wet-floor inventory, arch/headwall contacts, actual constitutive and pressure resistance, local slab/opening reinforcement, cap/grid joints, L ties/keys, northern replacement cage, waterstop, thermal detail, raised profile and roof remain explicit. All 28 canonical complete receiving duties and all physical/whole-house acceptance flags remain open.

## Current design consumer

The current compiler now reads this35-source method through `--read-vertical-rc-floor` and executes its exact case through `--vertical-rc-floor`. The optional saved `verticalRcFloor` stage contains only authored laws, mesh/use-load and portal controls; its only floor geometry comes from the saved `distributedFloor` stage. Missing shared geometry, duplicate or injected sources/results, changed implementations, unsupported250mm thickness and stale bindings reject explicitly. The real saved-bundle/CLI aperture edit removes0.545kN, changes all-head response and the computed section, then restores the original case. No independent floor copy or installed approval is accepted. The native numerical runtime is pinned; the earlier30-source wind sweep remains a separate bounded control.
