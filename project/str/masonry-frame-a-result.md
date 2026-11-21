# Joined straight-frame, masonry and roof comparison

The separate masonry arch and straight northern RC frame now participate in one source-bound calculation with the actual RC200 plate, ordinary lower masonry bodies, lower and upper four-L members, modeled roof steel, the tied roof operator and all 52 ground heads. A saved floor, roof stiffness or wind edit changes this same compatible system. No historical fixed-base reaction increment is added to an earlier foundation solution.

This is an **unselected source-ground-0 reference comparison**. STR-FLOOR-PORTAL remains open. The coupled calculation does not accept the installed structure, roof weather geometry, moisture barrier or reinforcement, and supplies no owner aesthetic verdict.

## One authored case and one floor

`studies/masonry_frame_a.py --read` emits the current 48-source case. The only floor is `verticalCase.monolithicCase.houseCase.joinedCase.floor`; the current compiler derives it from the saved document's sole distributed-floor stage. Optional `lowerCoreBodies`, `lowerLWeight`, `roofCoupling` and `straightFrameCage` settings remain explicit authored comparisons. Their defaults are null; the worked proof supplies its actual material and receiving-law settings.

The independent A portal builder calls the existing current floor/frame method with the actual north beam width, replaces the curved RC ring and post paths **before** vertical plate condensation, and supplies its own continuous frame. The old 200 mm monolithic barrier/cage contract is unchanged. Its bridge, barrier, bar-axis, pressure-contact and schedule receipts do not qualify A. All nested A results retain the actual controlling case and full current source identity; the reused vertical case is explicitly a plate subinput.

The worked full north beam is **290 mm normal**, matching the posts. The same existing `northUpstandWidthMm` input controls in-plane CST omissions, finite beam stiffness, vertical plate geometry, mass, actual aperture guards and drawing; there is no independently editable duplicate beam width. Outer/court depths remain 750/650 mm. The wider ordinary wall/room/weather assembly still needs material and architectural coordination.

## Actual material and load paths

| Component | Recomputed scope |
| --- | --- |
| Four northern posts and abutments | Exact polygon union, **1.3893697554 m³ RC**. Finite tapered-section slices retain each masonry course's actual seat elevation. |
| North upstands | Complete material between the source outer post faces, including the four end-zone strips outside the finite axes. The latter contribute **2.156875 kN** at the worked 290 mm width; source-centroid wrenches charge them to the real end joints. |
| RC200 floor | Actual known-domain slab/band union, real openings and source stair edge; north upstands own their omitted strips once. The entire principal wet territory remains withheld, not asserted to be an architectural hole. |
| Ordinary lower masonry | Actual clear-core solid union, **31.427430375 m³ / 628.5486075 kN** at the openly authored 20 kN/m³. Separate body and top-contact coordinates keep wall selfweight off the floor when its top opens. |
| Lower four-L members | Eight actual finite members, total **103.2966 kN** at 25 kN/m³. Their real lengths omit the 20 mm DPC gaps. The ordinary masonry inventory excludes these RC stiffness paths. |
| Upper four-L members | Actual matching source sections from Z3370 to Z6540, **98.3334 kN**, connected to the current plate and metal ring through declared work-dual offsets. |
| Modeled roof steel | Source-modeled primary halves/tails, secondary row allocations, twin rails and closed ring: **194.812930389 kN** at 78.5 kN/m³. Consistent finite-member loads and released-half local gravity recovery share the same source geometry. The old 1.5 kPa background and connection allowances are not imported as steel stock. |
| Ground cap/grid | The [disjoint foundation union](foundation-solid-weight-result.md), **35.3932059375 m³ / 884.8301484375 kN**, with exact originating forces and moments. It supplies no above-DPC compression credit. |
| Formed SW court node | The explicitly authored [0.0405 m³ / 1.0125 kN quarter](foundation-solid-weight-result.md#explicit-formed-south-west-court-node) closes the known 0.01050625 m² normal footprint through the existing finite grid node. No new restraint is added; local joint rigidity, cage and resistance remain unqualified. |

The `adjacentGridMemberCuts`, `capCuts` and additional ground-cap rows are **elastic element-end actions under declared equivalent nodal loads**, including mapped foundation gravity. Their historical field names do not establish distributed physical local-cut recovery: every row carries `localDistributedLoadRecoveryQualified: false`. Per-member body-load vectors have not been subtracted for these grid/cap outputs, so they supply neither a recovered distributed-load envelope nor local strength proof. The separate owning grid-local recovery development remains subsequent work; changing this scope must not alter any solved action or hide adverse values.

The lower and upper L weights leave the 200 mm floor interval to the existing RC200 plate. Direct intersection of the actual plate cells confirms that all **1,240,800 mm²** of the four L-shaped corner patches is already included there; it is not added again as wall material. Each result reports structural-shell, foundation, new-node, lower-body/L and roof additions separately, then the actual combined physical-G family and its authored combination factor.

The northern posts and upstands register their distributed gravity with the existing physical local-cut recovery method. Lower and upper L own-weight additions instead retain declared work-dual endpoint loads and source-wrench checks; separate distributed-ownG section-cut recovery and L reinforcement qualification remain outside this northern-frame cage comparison. Their global mass and 52-head transfer must not be confused with a completed local L cage proof.

The secondary rows are **tributary allocations**, not an individual cut-stock centroid takeoff or a qualified installed minimum. Their assigned origins and the condensed loads conserve the declared model's force and moments; that is a narrower claim than surveying each actual purlin. The 31 m ridge line is already included once within the 62 m ring inventory. It is not an additional steel allowance. `retainedMinimumGQualified` remains false.

The roof energy check covers the **represented roof operator**. Separate released-inner-half and free-tail flexural particular energy is not included as whole physical strain energy. Heel vectors are whole-component interface actions, not automatically section cuts immediately inside the heel. Local gravity recovery and its declared component boundaries remain available for inspection; neither an energy residual nor an interface vector is promoted into complete roof resistance.

### Masonry arches and architectural cost

The inward 180 mm direct abutment retains the 2400 mm finished opening and 775 mm normal envelope. Each arch has two 102.5 mm radial courses and a 10 mm mortar bed. Separate three-hinge own-weight witnesses introduce their forces at explicit stations at the actual radial-seat elevations. The two arches total **5.4345068880 kN** at the authored 20 kN/m³. No homogeneous 215 mm composite masonry strength, asymmetric/construction load pass or displacement-compatible moving arch is inferred. The mortar is a weight-only equilibrium comparison, not an accepted third freestanding structural arch.

The local jamb retains only **60 mm cellular glass plus 40 mm lining**. The 105 mm gross crown-to-upstand space has no credited masonry spandrel and needs actual finish, restraint and movement design. Thermal performance and assembled appearance remain genuine unresolved decisions.

### Wind and receiving-law boundaries

The roof method removes the old grounded L compliance, independent floor and grounded normal springs before condensation. Its six rigid-body modes are checked. The actual upper L paths and eighteen named roof-to-plate laws then join that roof to the current plate and ground frame. The worked 40 kN/mm bilateral laws are unqualified mechanical comparisons, not manufactured anchors, real wall tests or installed retention acceptance.

The roof's P2/crown pressure uses the **same wind index** as the floor. Its pressure origins and full six-component wrench are retained. This is projected upper-wall/roof-height horizontal pressure and crown overturning, **not roof surface suction or a complete wind envelope**. Lower P0 pressure, actual upper opening pressure and other upper-wall/roof-layer gravity remain distinct missing load duties. The modeled steel's gravity is explicit; `roofGravityIntegrated` stays false for the complete roof and `roofWeatherDatumMm` stays null.

The frozen receiving layout also has actual occupied-service conflicts: north receiver (4700, 11667.5) crosses the bed4 supply-port envelope at X4800 / Z6300 / radius180; east receiver (11667.5, 6000) crosses the family-condensate envelope at Y5950 / Z6400 / radius20 after the declared 100 mm receiving strip and ±10 mm allowances. The source exterior-port inventory includes supply as well as extract. Mechanical plate participation therefore does **not** establish full installed route fit. Moving the two receiving positions to north X4500 and east Y6100 is a subsequent candidate requiring actual finite ring interpolation, route checks and a fresh coupled response; it is not adopted by this receipt.

Source post pressure retains its original equivalent nodal cards. Their removed-member vectors, original masters and body-load records are emitted in `loadIntroduction`; deleted curved-ring loads transfer with conserved force and moments. This is an explicitly unqualified pressure/cladding introduction comparison. New post cuts are not described as recovered distributed pressure cuts of a fabricated wall.

## Current calculations, drawings and change proof

`studies/masonry_frame_a_proof.py --write` executes eight fresh coupled states: the worked case, an actual plant-riser aperture enlargement, halved roof plan stiffness, the paired courtyard W79 pressure programme, zero physical gravity, independent 2 kPa net-floor live load, uniform −2.25 kPa signed roof PLAN-pressure and restoration of the complete original case. The edited aperture removes 0.545 kN of actual RC. The roof-only stiffness edit holds material fixed while changing floor/head response. All 52 head forces and first moments are independently reconstructed using their **actual XYZ positions**. Restored parameters must recover the original response; source or method drift prevents writing a receipt.

The [architectural section](studies/masonry-frame-a.svg), [computed plate/head view](studies/masonry-frame-a-floor.svg), [actual roof support view](studies/masonry-frame-a-roof.svg) and [worked cage view](studies/masonry-frame-a-cage.svg) come from the same case. The section uses the actual authored outer-north depth; the roof view distinguishes structural planes from the unresolved weather surface. Dense solver fields remain reproducible through the native/current-design entry points; the compact proof retains the source, controlling case, simultaneous cuts, all heads, load/material ledgers, receiving forces and adverse results.

The [plate bending recovery](studies/plate_bending_recovery.py), [floor reinforcement comparison](floor-reinforcement-result.md) and [straight-frame cage assessment](straight-frame-cage-result.md) consume these actual solved fields and simultaneous actions. A necessary section comparison is not a complete cage, hook, anchorage, cap-grid node or local-stress convergence pass. Increased bar area cannot silently discharge its actual route and termination obligations.

The independent net-floor live load uses the actual net plate area and its same uniform-load operator with the existing explicit 1.5Q comparison factor. It changes applied forces, plate particular recovery, bending and work without changing physical material. It does not require the gross GMAX/Q flag, whose overlapping upper gravity remains rejected by the roof join. The Q2 control checks all six external-wrench differences against its own source-centroid ledger.

The separate roof PLAN-pressure control applies signed authored pressure at all 108 actual source rows. The −2.25 kPa control checks its independently summed origin wrench against the actual all-head response and holds physical material fixed. It is a mechanical load control, not a site aerodynamic coefficient, snow case or automatically correlated facade-pressure case.

Before every accepted solve, all eighteen roof feet must reuse physical plate/member traces already present in the assembled operator. Each trace must have nonzero assembled and condensed plate participation and create no scalar coordinate. An earlier integer/float string-key defect created ten orphan receiver coordinates: the resulting coupled47 comparisons are rejected and are not current evidence. The corrected48 proof regenerates the complete coupled response; a small global equilibrium residual alone could not expose that topology error.

## Corrected worked-case result

The corrected worked case gives a minimum signed head reaction of **−118.957765809 kN** and maximum ring translation of **22.202192714 mm** under its declared mechanical laws. All eighteen roof receiving springs now act through the actual plate; the smallest condensed trace-row maximum is **77.6094861**, rather than an orphan zero row. The worked six-bar cage has a governing necessary section ratio of **0.8698550** at the court-west post top. These numbers describe the one executed W31 case; they are not a programme envelope or connection acceptance. Negative foundation action remains an unresolved resistance/load-combination obligation.

| Executed control | Minimum head kN | Largest head-component change kN/kNm | Necessary frame ratio |
| --- | ---: | ---: | ---: |
| Worked W31 | -118.957766 | 0.000000 | 0.869855 |
| Wider plant riser | -118.954792 | 2.147743 | 0.869858 |
| Half roof plan stiffness | -118.929950 | 0.379445 | 0.870405 |
| Courtyard W79 | -119.067600 | 1.516513 | 0.869030 |
| Zero physical-G factor | -191.601418 | 95.386105 | 1.047854 |
| Net-floor Q2 | -106.987041 | 15.754870 | 0.857676 |
| Roof PLAN −2.25 kPa | -134.673226 | 24.423351 | 0.935331 |
| Full restoration | -118.957766 | 0.000000 | 0.869855 |

The zero-G adverse control **fails** the necessary frame section comparison at **1.047854**. The suction control is **0.935331**; this finite pair is not a qualified full load envelope. All eight cases retain negative signed head actions. The independent head-wrench residual is at most **1.008 × 10⁻⁷ kN/kNm**, and complete restoration reproduces every head component exactly in this run.

The independent Q2 control applies **294.90721875 kN** to the actual **98.30240625 m²** net plate. The separate roof suction control acts on **144.15 m²** of source row territory and produces **324.3375 kN upward**. Each change matches the actual external six-wrench while leaving the **2476.872718349 kN** physical inventory unchanged. Live load is not credited as favourable permanent gravity.

## Remaining selection obligations

- Resolve actual north-frame and four-L reinforcement, development, qualified cracked stiffness, second-order response, DPC transfer, shear/torsion and three-dimensional cap/grid joints using the same controlling geometry and signed actions.
- Prove masonry compression/thrust-line, bed sharing, seat shear, asymmetric and construction loads, movement compatibility and out-of-plane restraint.
- Complete the applicable roof aerodynamic/snow pressure envelope, lower P0 and actual upper opening pressure, the remaining permanent load inventory and signed combinations. The authored PLAN-pressure controls do not discharge those source obligations.
- Replace the unqualified intermediate roof and lower masonry laws with justified material, bearing and retention requirements; assess actual pile/head resistance and site movement at their real acceptance boundary.
- Complete the wet-floor aperture inventory and occupied service/room interfaces; no gross filled-opening mass or phantom receiving restraint is credited.
- Design the complete non-plastic moisture, air and thermal boundary around the enlarged continuous RC union. Retired barrier flanges, rod seals and old guide/heel receipts do not qualify it.
- Reconcile actual roof weather/support datums and any raised-house choice before adopting rainwater, services, material or whole-house views.

Negative head reactions, failed necessary reinforcement comparisons and unearned connection duties stay visible. The result is an integrated editable engineering comparison, not an STR closeout or automatic roof-gate release.
