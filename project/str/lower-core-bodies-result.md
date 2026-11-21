# Lower masonry gravity belongs to its own body

The ordinary lower clear-core comparison now separates **wall-body gravity, axial shortening and compression-only contact with the first floor**. The wall's own weight reaches its actual lower grid route even when its top loses contact with the floor. It is not added to the floor as favourable retained weight.

This is an optional executable comparison. It excludes masonry arches and spandrels, finishes, source RC columns, RC corner/post stiffness paths, upper walls and roof. The separate masonry-frame successor must use the same optional stage and earn its own changed response. No installed masonry, DPC, joint, roof or whole-house acceptance follows.

## Actual material inventory

[The reusable method](studies/lower_core_bodies.py) takes the existing source clear-core rectangles, including the full ground opening and arch reservations, forms their disjoint plan union and subtracts the RC L and northern-post footprints. Source RC columns are explicitly excluded. Exclusion identifies different material and stiffness ownership; it does not assert that every existing RC path already has its own gravity accounted for. The source lower-L paths originally provided stiffness without their own G; their separate RC stage must charge that weight, without adding it to this masonry inventory. The retained ordinary bodies extend from the actual source grid top **Z−180** to first-floor RC soffit **Z3170**, not to the finished floor.

The resulting ordinary clear-core volume is **31.427430375 m³**. An explicitly authored density of 20 kN/m³ gives **628.5486075 kN** before the existing native load-combination factor. Density is an authored 0–30 kN/m³ comparison input; zero is a mechanical control. It does not qualify the physical material. The method accounts for the whole declared clear-core union, including portions with a free wall top outside the actual plate footprint.

The A abutment's extra inward tapered territory lies outside the source ordinary loggia core: the western ordinary core ends at X4447.5, within the old RC post's X4520 edge. Thus the existing source ordinary-core/post intersection is removed without pretending the new abutment is prismatic through its full height. Changed geometry that places ordinary core into that taper requires an exact three-dimensional subtraction and is rejected by this limited method.

## Body and top contact are different mechanics

For each actual plate-contact quadrature fibre, the former combined normal spring is replaced by a **bilateral axial body plus a separate compression-only top joint**, with one internal scalar wall-top coordinate. The other five coordinates are unused zero-reaction gauges. No masonry lateral, flexural or top-tension stiffness is added.

For fibre area A, body height H, authored masonry modulus E and the inherited unqualified normal-joint compliance c:

- Body stiffness is `kb = A E / H / 1000` kN/mm.
- Top-contact stiffness is `kc = A / c / 1000` kN/mm.
- Their zero-G series compliance exactly reproduces the inherited `A / (H/E + c) / 1000` spring.
- Uniform body weight W supplies consistent `W/2` to the independent wall-top body node and `W/2` to its actual lower work-conjugate route.

If the top is free, it shortens by **W/(2 kb)** and the base carries **W**. If a floor compression P is present, body shortening is **(P + W/2)/kb**, and the base carries **P + W**. A truly clamped body top shares the uniform own-G equally with its base. These distinct analytical cases are tested; a compression-only floor contact is not silently treated as a clamp.

The inherited normal-joint compliance is assigned to the top joint for this explicitly unqualified comparison. That assignment is a declared constitutive candidate, not evidence about the position or properties of installed slate, bedding or a complete moisture assembly. Real base/top interfaces still require their actual details and evidence.

Free-top body areas are partitioned at every actual finite-beam footprint edge and endpoint, every source-cap boundary and any explicit court-closure edge before load quadrature. Complete open-cell containment determines coverage; a thin unsupported strip cannot be missed between Gauss points. Within a fully covered beam-overlap cell, the nearest contained branch at its centre owns that whole cell and all its quadrature loads. This is a declared finite-frame load introduction, not a continuum nearest-axis integration or local three-dimensional joint proof. A missing route charges the exact entire unsupported cell and centroid first moments; no nearest head or new support is substituted. The inventory partitions into contacted, unsupported-contact and free-top areas, and its applied G and both originating vertical-force first moments are independently conserved.

## Numerical normalisation preserves the physical model

The source normal quadrature contains 240 machine-scale sliver fibres, with total area approximately **1.36 ×10⁻⁹ mm²**. Turning each into an explicit axial coordinate exposed tiny legitimate pivots below the existing sparse solver's absolute threshold. Those fibres are retained; neither a physical mechanism nor an adverse result is deleted.

The existing [sparse method](studies/vertical_floor_numerics.py) now accepts positive reversible scales only for the named internal lower-body scalar coordinates. It solves `D K D q = D f` and returns the physical displacement `u = D q`, preserving physical loads, residuals, work and reactions. The body stage uses `D = 1/sqrt(kb + kc)`. No singularity, free-equilibrium, contact, energy or iteration threshold is weakened. The unchanged route applies when the optional named scales are absent. An actual missing body restraint still rejects.

## Validation and integration boundary

`python3 -B project/str/studies/lower_core_bodies_test.py` runs twelve analytical/adverse checks: free top, genuinely clamped top, floor compression, zero-density series compliance, scaled/unscaled response, a real source machine-scale area, a real mechanism, invalid scale authoring and optional-input rejection, thin unsupported strips, exact beam/cap/closure edge partitions and ambiguous-cap rejection. The two existing sparse-method checks also pass. The actual lower-body proof and current-model stage must retain source identity and the altered numerical-method binding.

The optional shared-case field is `lowerCoreBodies: null` or `{ masonryUnitWeightKNPerM3: 20 }`. The null case preserves the inherited mechanism. Apply the body stage after any explicit court-node closure and before foundation own-G, then use the same native solve. Existing RC/floor mass fields retain their original scope; the new body inventory separately records its added mass and must be included when presenting cumulative physical G.

The owner has not approved a new structure or material. These normal-only bodies do not provide missing positive ties, uplift retention, diaphragm lateral resistance, reinforcement, roof actions, cap/pile resistance or accepted moisture and thermal continuity. Their weight cannot be moved into a convenient upper-origin compression account merely because the source load has now become computable.

## Fresh coupled result

The [four-state native proof](studies/lower-core-bodies-proof.json) uses the source curved-frame/RC200 diagnostic, explicit court-node closure and the actual disjoint foundation own-G. It does not transfer that control's response to the separate masonry arch.

| State | Minimum named head | Negative heads | Actual change |
|---|---:|---:|---|
| Inherited combined normal springs | −53.352029 kN | 5 | Mechanical reference |
| Serial bodies with zero density | −53.352029 kN | 5 | Maximum52-head difference **5.586 ×10⁻¹⁰ kN or kNm** |
| Serial bodies at authored20kN/m³ | −53.319604 kN | 5 | Adds628.5486075kN to its own lower paths; largest head-component change36.723876kN or kNm |
| Same bodies with actual wider plant-riser floor opening | −53.331841 kN | 5 | Changes a head component by1.892601kN or kNm from the20-density case; body inventory and628.5486075kN remain unchanged |

With actual bodyG, **4985 of17328** top-contact samples open in this particular source mesh. The top's compression totals298.931424kN, distinct from the body's own gravity. No tensile top action is admitted. The changed floor opening changes the quadrature subdivision, so raw sample counts are not an architectural coverage percentage. Body-force/first-moment residuals stay below1×10⁻⁶kN or kNm, and the original global force/energy checks remain in force.

The unchanged zero-density result earns the serial refactor. The changed body and floor inputs earn actual propagation. The persistent five negative head reactions prevent an uplift or whole-house pass. A normal-only, freely separating wall cannot become favourable floor-retention mass by moving its G into a floor ledger.
