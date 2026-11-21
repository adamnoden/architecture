# Straight frame and separate masonry arch

The recommended replacement for the rejected crossing curved RC cage is now an actual joined numerical candidate: a straight northern RC frame, four enlarged direct-bearing abutment/post unions, and two separate masonry arches. The same source RC200 plate and actual 52-head ground frame participate in the solve. The previous ring stiffness, its concrete mass and its masonry infill are removed rather than inheriting their reactions.

This remains an **unselected source-ground-0 reference comparison**. It does not complete STR-FLOOR-PORTAL or admit the roof. No owner aesthetic, physical, professional, material or construction acceptance has been invented.

## Authored source and actual mechanics

`studies/masonry_frame_a.py --read` emits the current 41-source case. Its only floor geometry is the existing `verticalCase.monolithicCase.houseCase.joinedCase.floor`; the saved compiler derives that from its sole distributed-floor stage. The new authored controls are masonry seat projection and density, tapered-abutment subdivision, explicit foundation gravity, an optional formed court-corner candidate, and the separately authored reinforcement comparison settings. The native solver, plate and ground-grid kernels are reused.

The 180 mm inward abutment retains the 2400 mm finished opening and 775 mm normal envelope. Its actual polygon bears within each named 600 mm cap. The four post/abutment unions total **1.3893697554 m³ RC**; their stepped section comparison integrates the exact linear polygon area. The taper's stiffness is a declared discretisation, with a fresh subdivision comparison. The local jamb has only **60 mm cellular glass plus 40 mm lining**. That remains a substantial unqualified thermal and architectural cost.

Each masonry arch has two 102.5 mm radial courses and a 10 mm mortar bed. Separate three-hinge selfweight witnesses introduce the course forces at the actual radial seats. Two arches total **5.4345068880 kN** at the authored 20 kN/m³. Neither composite 215 mm masonry bending strength nor displacement compatibility of a real moving arch has been inferred. The mortar is a separately reported weight-only equilibrium comparison, not an accepted third structural arch. There is no credited masonry spandrel; the 105 mm crown-to-upstand space requires actual finish, restraint and movement design.

The plate stiffness, actual aperture mass, compression-only normal fibres, source ground frame and source wind programme remain in the same compatible solve. Actual gravity is reintroduced through consistent member vectors and the plate's existing work-dual condensation. The full upstand solid includes its four 106.25 mm end regions beyond the finite beam axes: 0.0595 m³ / 1.4875 kN at the 200 mm width. Their centroid forces and first moments enter the actual end masters; local joint-zone strength remains unqualified. An independent full-solid mass inventory checks this material in every replay. New member actions are calculated from this structure; old curved-ring forces are not accepted as replacement actions.

The source post pressure remains its original **equivalent nodal load comparison**. Those exact removed-member vectors, body-load records and original masters are emitted in `loadIntroduction`. Pressure formerly at deleted ring nodes transfers to declared straight-frame receivers with conserved force and first moments. This is an explicit unqualified cladding/pressure-introduction assumption. The new post cuts are not presented as recovered distributed pressure cuts of a fabricated wall or restraint. Actual pressure transfer, masonry out-of-plane restraint and the complete signed wind envelope remain open.

## Ground material and the missing court corner

The [foundation solid-weight method](foundation-solid-weight-result.md) supplies the actual disjoint cap/grid material once, with its originating force and moments. This weight is below the source DPC. It supplies **no above-cut precompression credit**, roof retention or pile/cap resistance proof.

The worked case explicitly requests the [formed SW court-node comparison](foundation-solid-weight-result.md#explicit-formed-south-west-court-node). A new 300 × 300 × 450 mm quarter adds 0.0405 m³ / 1.0125 kN, provides the former 0.01050625 m² missing normal footprint and charges its eccentric action to the existing shared finite grid node. There is no additional fixed support. Its local rigid-plane, reinforcement and three-dimensional joint resistance remain unqualified. `courtCornerClosure: null` preserves the original missing route; the candidate has not silently replaced the source foundation.

The result reports structural-shell, foundation, optional new-node and final combined physical gravity separately, together with the actual authored combination factor. `joinedPhysicalGKN` is the actual sum in the solved physical-G family, rather than the slab-only quantity inherited from the earlier comparison.

## Source identity, drawings and change proof

Both the outer result and its nested compatible frame/vertical result carry the actual A source tuple and controlling A request. The original vertical case survives only as the explicit `plateCase` subinput and named reused-method lineage. A modified frame cannot masquerade as an unchanged native-35 result.

The primary [section](studies/masonry-frame-a.svg) draws the source finished profile, actual abutment polygon, separate radial masonry courses, named outer-north upstand depth and actual joined head extrema. The [computed floor view](studies/masonry-frame-a-floor.svg) comes from the same solved plate and head response. Neither drawing adopts the raised-house proposal.

`studies/masonry_frame_a_proof.py --write` executes the same native model for the worked case, an actual plant-riser aperture enlargement, zero physical gravity and a doubled taper subdivision. The aperture changes the actual plate mass, bending field and named head response; the source geometry and material controls remain unchanged. Independent midpoint area integration checks all three own-weight ring/course witnesses without reusing their analytical first-moment expression. Tests also reject stale sources, unsupported geometry and fabricated approvals, and verify that an upstand-depth edit changes the drawn section.

The four executed states retain all 52 simultaneous named head reactions. The worked W31 case has a minimum vertical reaction of **−50.805972 kN**; zero physical gravity gives **−76.270909 kN**. The 0.545 kN aperture-mass removal changes a head component by **1.883367 kN/kNm**. Doubling the tapered-section slices from 12 to 24 changes the governing head component by **0.000239891 kN/kNm**. This is measured section-discretisation sensitivity, not local stress or constitutive convergence. Negative reactions remain adverse; the added below-cut RC weight does not earn an uplift or whole-house pass.

The [plate bending](studies/plate_bending_recovery.py) and [reinforcement](floor-reinforcement-result.md) methods consume this actual solved rotation field. Passing a section-action comparison does not accept local stress convergence, continuity, opening cages, support anchorage or a complete reinforcement layout.

## Actual remaining selection obligations

- Resolve the actual enlarged post, straight-beam joint, cap and ground-grid reinforcement, development, shear and torsion.
- Prove masonry thrust line, compression/shear bearing, asymmetric and construction loading, movement compatibility and out-of-plane restraint with actual material properties.
- Complete the withheld wet-floor aperture inventory and actual vertical wall/body loads; no gross filled-opening masonry or old roof/foundation reactions are imported.
- Resolve actual four-L keys/ties and receiving laws, full signed wind/roof participation and compatible foundation actions.
- Design the complete non-plastic moisture/thermal/air boundary around the enlarged continuous RC union. Old curved-control barrier flanges and rod seals do not qualify it.
- Transform and solve any raised-house choice as an actual changed structure before adopting its services, roof or wind applicability.

The negative head reactions and failed/unfinished reinforcement duties remain adverse results. They are reasons to continue the joined engineering and compare the remaining architectural costs, not grounds to manufacture structural completion.
