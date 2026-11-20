# Actual foundation solids and the south-west court node

The current grid contains **35.3932059375 m³ of physical RC**, not the naïve 48.79323 m³ obtained by adding overlapping cap and beam volumes. At the explicitly authored 25 kN/m³, its own gravity is **884.8301484375 kN**. The method now introduces that load into the same compatible floor/frame/52-head solve. It does not add a prior set of foundation reactions.

The missing south-west court support is also real: it lies outside the source's physical concrete union. A separately authored **formed quarter of the existing court node** closes its 10506.25 mm² normal receiving gap in the executable comparison. This adds 0.0405 m³/1.0125 kN and introduces no extra support. Its rigid joint-plane, local transfer and reinforcement remain unqualified. Neither development closes STR-FLOOR-PORTAL.

## Exact physical inventory and load introduction

[The reusable method](studies/foundation_solid_weight.py) reads the current grid's 52 named caps, 21 girders and 14 crossbeams. It subtracts previously owned solids into disjoint boxes, retaining cap-first and then lexical beam provenance. It calculates volume and all three originating first moments; an independent X/Y interval sweep of merged Z extents verifies them. The removed overlap is **13.4000240625 m³**. The physical centroid is approximately X6305.593/Y5680.774/Z−429.413 mm.

Material owned by a cap acts at that cap's existing named head with its actual first moments. Remaining material loads its own finite source beam with two-point quadrature of the cubic Timoshenko work-conjugate interpolation, split at actual finite-member endpoints. Transverse eccentricity is included. This is a declared beam-model introduction of joint material, not a local three-dimensional joint analysis. No spring, restraint or soil bearing is invented.

The sole authored controls are `unitWeightKNPerM3` (20–30) and `gravityFactor` (0–1). They alter physical weight; the existing native `physicalGFactor` still supplies its separately declared load-combination factor. Reapplying the same addition, changing the source grid or injecting geometry/approval rejects.

All source foundation material lies at Z−750..−180, below the portal's source DPC cut at Z−40. **Its above-cut compression credit is zero.** It cannot be used to stabilise an upper-origin cut or rescue a failed moisture crossing. Pile shafts, soil and superstructure are outside this inventory.

## Actual paired response

The [fresh proof](studies/foundation-solid-weight-proof.json) executes eight compatible native35 floor/frame solves: two load contexts, each with an unweighted comparison, the 25 kN/m³ addition, a 20 kN/m³ density perturbation and a zero-addition control. The source curved portal remains a mechanical control for this proof; the separate masonry arch must carry its own joined response.

| Native context | Unweighted minimum head / negative heads | With actual 25 kN/m³ foundation G | Largest head-component change |
|---|---:|---:|---:|
| Source W31 and physical G×0.9 | −58.303416 kN / 10 | −53.353560 kN / 5 | 32.205161 kN or kNm |
| Fresh GMAX, Q2 and physical G×1.35 | −49.017162 kN / 7 | −30.546791 kN / 5 | 48.347071 kN or kNm |

Both density edits alter the actual named head response; both zero-addition controls reproduce it exactly. Force and originating first-moment residuals remain below the unchanged native tolerances. **These source controls still have negative head reactions.** Actual mass improves the response but supplies no uplift, pile, cap, reinforcement, whole-wind or whole-house pass.

## Explicit formed south-west court node

The court-W body is X3650..4250/Y3950..8050; court-S is X3950..8050/Y3650..4250. Their centreline endpoints meet, but their end-cut physical rectangles omit the south-west quadrant. The nearest P32 cap begins at Y4032.5 and does not cover it. This is not a nearest-member search defect.

[The optional node method](studies/court_corner_closure.py) derives the omitted **X3650..3950/Y3650..3950/Z−630..−180** quarter from the actual member widths, datums and levels. It verifies that it is disjoint from the source union before introducing its own G. Existing source caps/grid remain 35.3932059375 m³; with the explicit node the combined total is **35.4337059375 m³**, or **885.8426484375 kN** at the stated density. This does not silently revise the canonical source geometry.

An explicit `courtCornerClosure: { mode: 'source-sw-formed-quarter-node-comparison' }` authors the candidate. `null` preserves the source gap. The method adds the actual 64 missing normal fibres using the same upper plate shape functions, source clear-core heights, area, masonry law and compression-only contact law. Their lower displacement is the work-conjugate rigid joint plane of **existing** `GRID-3950.0-3950.0` at Z−405. It charges actual eccentric forces and moments to that node; the new body's own G acts at X3800/Y3800/Z−405. Its nodal self-weight wrench is Fz−1.0125 kN, Mx+151.875/My−151.875 kNmm before the existing combination factor.

The [fresh paired node proof](studies/court-corner-closure-proof.json) solves the same native model before and after this edit. The missing normal area changes **10506.25 → 0 mm²**, and an actual head component changes by **1.045457 kN or kNm**. The standalone node trial's minimum head remains −58.301902 kN. No fixed support is added. The bound normal route is not proof of its physical stiffness or resistance.

The receiving-plane assumption must be replaced or justified by the actual formed joint, closed cage, torsion/shear, reinforcement continuity, casting sequence and compatible moisture/thermal boundaries before selecting it. A plane mapped to a line-node is explicit comparison machinery, not evidence that a 300 mm concrete projection needs no engineering. The changed geometry and gravity must remain in the same saved masonry-frame candidate and joined solve; nominal or source-ground-zero results do not qualify a raised floor.

## Verification and remaining obligations

Run `node --test project/str/studies/foundation-solid-weight.test.mjs`. It invokes thirteen Python checks covering independent volume/first moments, disjoint ownership, nested/touching boxes, density and zero controls, stale/nonfinite/injected inputs, source geometry changes, optional-node no-op and rejection boundaries. It checks the source hashes and actual paired native receipts. Fresh native generation uses `python3 -B project/str/studies/foundation_solid_weight_proof.py --write` and `python3 -B project/str/studies/court_corner_closure_proof.py --write` with the existing pinned numerical runtime.

The source inventory and [inspection plan](studies/foundation-solid-weight.svg) share the same method. The generated plan was rendered and inspected at its actual1000×840 viewport; labels and the complete foundation footprint remain visible. The exact member/cap force, local three-dimensional transfer, real soil/pile behaviour, complete wall/roof gravity, reinforcement, actual water barrier and selected-house acceptance remain open. The former overlapping-volume sum and an inherited source-ground-zero head response cannot discharge those duties.
