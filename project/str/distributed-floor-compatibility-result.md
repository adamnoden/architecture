# Four-wall, perforated-floor and 52-head compatibility

**Disposition — 20 November 2026:** retain the conventional diaphragm topology for development and replace the isolated north-band stiffness comparison with a callable, source-bound four-wall subsystem. This is an implemented compatibility calculation, not an accepted house or an STR closeout. `completeHouseProof` and `installedAcceptance` remain false; asking for complete-house use rejects.

The [numerical method](studies/distributed_floor_compatibility.py) connects the actual 52-head grillage and four finite corner L-wall/contact paths through one explicitly authored slab-level diaphragm. Loads, wall deformation, joint contact and head reactions share that solution. Existing fixed-base foundation actions and roof reactions are not added to it.

## Physical and computational boundary

The model uses the union of all 88 source first-floor bodies, all known structural and service apertures, and the complete omitted principal wet-room territory whose aperture inventory is incomplete. Circular holes are represented by bounding squares. This removes extra stiffness, but does **not** guarantee conservative individual reactions or local stresses. Geometry and mesh refinement remain part of the evidence boundary.

The original 200 mm band comparison is **rejected**: it overlaps the source stair void by 30 mm along the west edge and the entrance void by 15 mm along the south edge. The original northern 240 mm L patch is also rejected because its west leg overlaps the retained rear-soil aperture envelope by 15 mm. These are actual material conflicts; a generic applicability warning does not make them valid geometry. The NW opening is retained until an actually bound west-foul replacement earns its removal.

The revised numerical comparison uses **140 × 200 mm conventional slab-level bands**, northern L widths 200 mm and southern widths 140 mm. Every actual aperture and the whole unknown wet territory must clear every band, band junction and L patch. An intersection rejects before stiffness assembly. Source 240 remains visible in the default unqualified read case and rejects if requested with its current hole; the openly authored numerical fixture explicitly selects 200 for comparison. No permanent house geometry is silently adopted.

The retained-mass account's 160 mm reservations are conservative omissions of weight, not proof of either a physical void or structural continuity. Here the independent authored replacement uses the source floor-body geometry, removes the actual 140 mm band footprint from field CST triangles, and adds that band once. The band occupies only Z3170–3370 with midplane Z3270. It does not borrow full-height stiffness from the outer Z3170–3920 or courtyard Z3170–3820 upstands. The separate axial law is the unqualified steel-only reference rigidity of eight H12 bars at E 200 GPa (EA≈180955.7 kN); gross RC area receives no uncracked axial-tension credit. No band gravity is credited.

Source floor collectors use 35 mm nominal and 40 mm adverse cover. The old eight H12 upstand arrangement does not automatically fit or develop in the 200 mm-deep band: a four-level/two-face arrangement at 40 mm cover has about 18.67 mm vertical and 20 mm horizontal bar clearance, below the 21 mm placing comparison. The narrower band is geometrically compatible, not a reinforcement or installed-stiffness selection. Combined mesh/chord action, local cage, corners, services, anchorage, fire, construction and an actually adequate chord remain open. An eight H10 or other genuinely simpler cage can be compared later without holding the corrected compatibility method hostage to another local variant.

The CST strain/constitutive relationship and edge-plan beam relationships follow the existing [membrane method](studies/current-house-membrane.py). The [condensation helper](studies/perforated_floor_condensation.py) separates that method from filesystem and fixed-house state. It performs static Schur condensation and a positive-energy decomposition into the existing [compatible frame kernel](studies/joined_successor_kernel.py). It is not a new foundation or general building solver. The reported `condensedPortStrainEnergyKNmm` is port strain energy; it excludes the load-only internal energy constant when interior pressure nodes are loaded. It is not labelled total physical floor strain energy. Rigid translation and yaw remain zero-energy modes; singular interiors and negative energy reject rather than receive artificial restraint.

The native first-floor pressure band is assembled continuously on the actual outer band nodes before condensation. The source P1 pressure recipe, face-coordinate reversal and half-face extents are checked against the owning Python AST. Original source force and all first moments are conserved. The Z3370 load application lies 100 mm above the membrane midplane; explicit external couples preserve that eccentricity at the active finite corner ports. Their split follows the source face position. This boundary projection does not supply the missing vertical slab/receiving proof.

Only this source pressure band enters. Roof-level pressure and uplift, below-floor wall pressure, floor/core retained gravity, floor bending gravity, occupied loads, full upstands and old foundation actions are absent. In particular, neither old retained mass family is counted again. Source `rr=6600` is an inherited pressure-band comparator, not an adopted successor roof datum.

## Meaningful change and adverse checks

Ten native analytical and source regressions run through the canonical `test:str` glob. They establish:

- Schur force and strain energy agree with an independent dense elimination using the existing factorisation primitive; positive-energy modes preserve the nullspace and reject negative energy.
- Every native signed pressure programme has the correct independently reconstructed face position and resultant. +X west-face and −Y north-face half-programmes reverse the along-face coordinate.
- All four finite L paths and all 52 actual named heads share six-component equilibrium. The native source object remains unchanged.
- Widening the actual Plant-riser aperture westward by 200 mm changes the mesh area, joint movement, head reactions and computed drawing while the complete external wind boundary remains identical.
- Native court-projection case 48 has exactly the same floor-only response as case 0. Signed reverse case 3 reverses the global transverse reaction while preserving equilibrium; individual head states are not assumed to reverse under different face loading.
- Actual 200 mm source band conflicts, the 240 mm NW/source-soil conflict and a Plant-aperture edit through the courtyard band reject explicitly. A loaded two-segment independent control distinguishes condensed port strain energy from full physical floor strain energy.
- Missing authored laws, stale source identities, extra approval fields, unsupported receiving laws and complete-house use reject explicitly.

The default read case contains null member, joint, membrane and band laws. It also contains null successor-roof, vertical-floor and dry-ground laws plus all 28 named intermediate receiving-port laws. Those correspond to 24 physical locations because courtyard corners have separate wall ports. Their coordinates come from the actual native lower-support geometry; they are not added as invented restraints.

## Actual signed sweep and inspection

An executed sweep retains all 96 native signed programme identities and all 52 head records for each. It reuses the exact geometry-keyed condensate. The second 48 cases reuse their first 48 floor-only solutions because court projection changes omitted roof actions, not the first-floor external band. The reason is recorded per reused case; the roof response is not inferred.

| Measurement | Explicit numerical comparison |
| --- | --- |
| Default field mesh | 2098 CST triangles;2418 interior DOFs condensed to 12 corner port coordinates |
| Six-component global equilibrium | Worst residual approximately 1.08 ×10⁻⁹ kN / kNm across 96 programmes |
| Head Fz range | −95.2211 to +107.9297 kN; support force on model, upward positive |
| Largest upper-wall translation component | 0.38375 mm |
| Largest unqualified joint-group tie tension | 177.992 kN |
| Active compression samples | 1–2 of 8 quadrature samples per corner in these no-gravity boundary comparisons |
| Pitch 1400 → 700 mm | 2098 → 2654 triangles; maximum head-component difference 0.50425 kN, maximum upper-translation difference 0.0006387 mm |

These figures are not full-house joint demands, foundation capacities, local contact resistance or a mesh-convergence certificate. The sparse active compression samples particularly prohibit a local contact-pressure claim. The actual minimum stabilising gravity and complete signed loading still have to enter the successor model through their originating paths.

The [computed inspection plan](studies/distributed-floor-compatibility.svg) shows the field triangles, explicit bands, four finite wall ports, actual 52 head positions, signed Fz symbols and missing receiving ports. It was rendered and inspected. Its [source-bound proof summary](studies/distributed-floor-compatibility-proof.json) identifies the complete native case and method sources. The producer also returns the same SVG for changed apertures and settings; this is not an independently authored plan.

## Replay and current-model handoff

`load_distributed_floor_source(root)` reads the actual owning source tuple, including both new methods, the view producer, existing finite-frame kernel and source geometry methods. `reference_distributed_floor_request(source)` returns the versioned editable case with explicit null constitutive/receiving laws. `compile_distributed_floor(case,source)` returns geometry, the condensed operator, compatible port states, all 52 reactions, source actions, contact diagnostics, missing ports and the drawing. `compile_distributed_floor_sweep(case,source)` executes the 96-programme comparison and retains the shared floor geometry once.

Run `python3 -B project/str/studies/distributed_floor_proof.py --write` to execute and regenerate the complete source-bound signed proof and inspection SVG.

The thin Python CLI accepts `--read`, a JSON case on stdin, and `--sweep` with that same case. The numerical test fixture authors the comparison laws openly: member E 33000 MPa/ν0.2 with 0.25 flexural and torsional factors and 0.5 shear-area factor; membrane E 1200/G 440 MPa/ν0.15; band E 33000 MPa with 0.25 plan-flexural factor and separately authored steel-only EA≈180955.7 kN; zero-gap DPC compression 0.5 kN/mm³, tie 50 kN/mm and shear-key 100 kN/mm. These are numerical laws, not measured installation properties or product acceptance.

Root integration owns the shared current-design/CLI/saved-document adapter and its source registry. The native module and these evidence files do not constitute a competing current-house document.

The next actual obligations are the 28 finite masonry/arch/portal receiving laws, vertical slab and full upstand behavior, actual net gravity/precompression, complete dry-side ground section, successor roof stiffness and datums, local reinforcement/contact/shear/retention proof and the final joined signed response. These are internal engineering duties except where an exact material, physical or site claim genuinely needs outside evidence. ROF-RWT-GATE remains blocked by the incomplete STR result.
