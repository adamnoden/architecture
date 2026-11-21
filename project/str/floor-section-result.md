# One editable floor section in the coupled house

The floor section is now an authored parameter of the existing engineering document, rather than a scaled result from an RC200 solve. The optional `floorSection:{thicknessMm:200..250}` stage consumes the **sole** saved distributed floor, masonry/frame and upper-seat controls. It skips the superseded individual frame and roof-seat solves. There is no second floor geometry or saved foundation response.

## Actual change propagation

The native method retains the admitted perforated topology, including the stair, service apertures and withheld wet territory. It reassembles and condenses the actual MITC4 vertical plate and CST/band membrane, updates their energy/work maps and interior particular recovery, subtracts the old plate weight and adds the new physical weight once. Independently authored steel-chord axial rigidity stays unchanged.

The soffit stays at3170mm. A200→250mm edit moves the top3370→3420mm and membrane centroid3270→3295mm. Actual upper masonry and four upper L bodies begin at the new top, avoiding duplicate slab/body gravity. Complete north upstands keep their actual bodies once. The roof support geometry remains the same explicit control; no raised roof is silently adopted.

The named facade pressure programme keeps its authored originating heights. Its changed membrane-plane transfer uses the actual new offset; source force and first moments must still balance. This is an explicit mechanical control, **not regenerated weather tributaries or a complete pressure family**.

Every trial uses the same actual roof, lower bodies, floor, frame, grid and52heads. Results include the changed physical floor drawing, quantities, full head actions and raw local bending/twisting recovery. Native source identity, independent source-G/pressure wrench checks and all52-head equilibrium accompany the result.

The existing source FFL3450 leaves80mm above RC200 and only30mm above RC250. The latter is not a coordinated finish assembly. No FFL3500, altered stair, moved service or revised room kit is inferred. The manifest withholds affected roof/water, vertical-profile, service-floor and room-kit evidence. Nominal plan geometry remains an explicit unrelated control until architectural adoption.

The adapter also intersects declared, source-bound PV route segments with the actual material cells. The PV descent atX10000/Y5000 crosses the retained slab **already at RC200**, outside the plant-riser aperture ending atX9905. It emits an object-linked `UNQUALIFIED_SERVICE_PENETRATION` diagnostic, also atRC250, without silently adding a hole or calling the conflict new. Missing cable/sleeve/support/fire/removal envelopes prevent a general clearance pass. Resolving the actual PV route remains with the joined services/roof choice.

## Section judgement

Do not select a global slab thickness to repair one unqualified point peak. The governing south-corner sample lies beside the rigid L boundary in a narrow15mm source partition, with substantial twisting. Physical joint/strip demand and local convergence remain unproved. The actual west wet-wall beam is a separate missing load-path duty; its north-west position is not an evidenced cure for this south-corner peak.

The new necessary section result uses the same rectangular concrete block, ultimate concrete strain and steel law as the retained frame comparison. It solves zero-axial-force equilibrium with a single tension direction at the adverse actual depth, without compression-mat benefit. It retains neutral-axis depth, steel strain/stress, force residual and moment capacity. The earlier authored-lever-arm comparison remains visible but is not a crushing/strain-compatible capacity.

At the matched1.35G+Q2,25kN/m³ controls, actual RC200/H16/80 gives83.893808kNm/m raw demand against86.833302kNm/m necessary strain capacity: only3.5% reserve; concrete reaches its source strain limit just before steel reaches the comparison yield stress. RC250/H16/100 gives113.923915 against114.481169: only0.49% reserve. Neither is a convincing replacement. RC250/H16/80 gives137.156476kNm/m necessary capacity and is the stronger **provisional comparison**, subject to missing loads and the actual joint/strip proof. No section is selected.

The fresh receipt also executes a matched density27kN/m³,1.35G+Q2 pair, rather than comparing Q0/0.9G RC200 with Q2 RC250 or assuming ordinary reinforced-concrete density qualifies a heavy four-layer cage. The density is an authored adverse trial, not an approved complete reinforcement takeoff. See the [source-bound nine-state evidence](studies/floor-section-proof.json) and [actual RC250 floor field](studies/floor-section-250.svg).

## Interfaces and proof

`floor_section_model.py` composes the existing physical solvers; `floor_section_successor.py` owns reusable operator/section transformation and the necessary strain calculation. The existing source family accounts for both, the shared adapter and live consumers. The predecessor52-source case remains reproducible at its original scope.

`--read-floor-section` / `--floor-section` expose the same source-bound method as `--bundle`. The saved document stores only thickness plus its existing stage controls. The semantic `set-floor-section-thickness` operation names stable assembly `STR/current-floor-section`, uses millimetres, requires an existing explicit stage, and shares revision checks, save/load, undo/redo and stale-reply rejection with roof edits. Browser transport can carry this command; no new visual floor control is claimed.

Analytical tests independently separate bending-cubic and shear-linear thickness effects, verify strain equilibrium and reject unsupported sections before assembly. Native evidence checks actual200 identity against all312 components of the current52-source response, a matched heavy200/250 pair, source wrench conservation and exact reversal. The saved API/public CLI proof edits200→250→200 and checks quantities, datums,52heads, floor drawing, affected evidence and unchanged nominal plans.

Review also restored strict native upper-L material-law admission: finite positive properties, the supported Poisson range and stiffness factors no greater than one are required before assembly. Invalid extra/missing keys, modes, booleans, non-finite values and enhanced stiffness reject. Valid current numerical controls remain unchanged; their source-bound evidence is regenerated after the guard change.

## Remaining structural work

Resolve the finite corner joint and supported design-strip/local-convergence basis before selecting global thickness. Complete the source west wet-wall beam and its real receivers without double-counting slab/column stiffness or importing its obsolete no-tolerance cage. Close the wet-floor/arch/spandrel/finish/weather inventory, full pressure families, post/cap/floor reinforcement and development, grid/foundation resistance and water/thermal interfaces. Then adopt one coordinated floor/FFL/stair/service/roof arrangement. STR-FLOOR-PORTAL stays open.

## Nodal wet-support and fixed-cut continuation

The [seated support result](seated-wet-support-result.md) records the actual nodal
attachment correction and its nine-state controls. The shared fixed-cut method
consumes the same native bending field in CLI, saved-document and batch paths.
It integrates signed normal bending, signed twisting and absolute component
values through actual material intervals; it does not invent a strip width or
reinforcement distribution. The [11-control cut receipt](studies/floor-section-cuts-proof.json)
contains two additional700/500mm mesh trials. Its declared convergence screen
fails; neither RC200 nor RC250 is an adopted engineering development baseline.
The ground datum0 and service-floor comparison715 remain distinct, uncoordinated
arrangements. Current room/roof/book outputs are withheld from either adoption.
