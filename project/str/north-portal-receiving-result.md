# Northern portal lower receiving operator

**Disposition — 20 November 2026:** implement four actual lower RC receiving subpaths on the existing 52-head grillage. Do **not** count them as four completed floor supports. The floor, masonry spandrel, brick ring, tie and moisture joins remain incomplete; all 28 floor-receiving duties remain open.

The [callable method](studies/north_portal_receiving.py), [source-bound proof](studies/north-portal-receiving-proof.json) and [computed section](studies/north-portal-receiving.svg) use the same native source tuple and explicit numerical case. No existing floor, roof, retained-weight or foundation action result is imported.

## The actual topology

The 28 named perimeter/courtyard receiver duties represent 24 physical locations. They are not the complete inventory of internal floor, stair, wet-beam or ceiling supports.

| Source path | Named duties | Available mechanics and exact missing join |
| --- | --- | --- |
| Ordinary outer clear piers | 12 | Prismatic six-DOF member mechanics exist. Actual masonry material, compression/sliding behavior, adjacent arch coupling, seating and DPC path remain unprovided. |
| Courtyard middle clear piers | 2 | The same mechanics apply to the actual clear interval, without assigning rigid lateral support or tensile masonry. |
| Courtyard corner wall unions | 8 at four locations | Existing L-section/frame primitives are reusable. Actual unequal clear-leg unions, dry-side support footprints, contact/shear and corner transfer still need assembly. |
| North portal chains | 4 | This method implements the lower RC, finite upper cap and coupled grillage operator. Masonry/arch/tie-to-floor joining remains missing. |
| South courtyard arch/bridge jambs | 2 | Positions are known; the source bridge and arch do not establish a full-height RC column or qualified whole receiving law. |

The existing [spatial arch kernel](studies/arch-space-kernel.py), [flexibility system](studies/arch-space-flexibility.py) and [coupled arches](studies/current-house-coupled-arches.py) own the eight **first-floor corner-window** arch comparisons. Their opposite jambs terminate on the floor, and their background model contains the earlier fixed-base L/roof system. They cannot be relabelled as these ground-floor receiving laws. Reuse their force-dual and flexibility principles and the actual [finite frame primitives](studies/joined_successor_kernel.py); do not reuse their old fixed-base background as a current 52-head response.

## Source geometry that controls the northern chain

HAD explicitly stops the 212.5 × 215 mm RC piers at the **radial skewback**. RC does not continue to the first-floor slab through the masonry spandrel.

| Item | Bound source geometry |
| --- | --- |
| West/east RC foot centroids | X4413.75 / 7586.25 mm |
| West/east source floor lines | X4377.5 / 7622.5 mm; offset ±36.25 mm from the RC centroids |
| Mean skewback points | X4445.141 / 7554.859 mm, Z2327.152 mm |
| Full RC shoulder | Flat top Z2404.304, then the actual radial bevel to the raw spring at Z2250 |
| Source floor receiving plane | Z3170 mm; 842.848 mm above the mean skewback |
| Actual tie and bore | Tie axis Z2200; 40 mm horizontal through-bore; tie force station 127.152 mm below the mean skewback |
| Named receiving caps | P28/P30 at the courtyard and P25/P26 at the garden; each actual 600 × 600 mm cap contains its complete pier foot |

The finite RC subbody is deliberately cut at the mean-skewback level. Its upper shoulder is shown as source geometry outside this operator. A work-dual six-coordinate cut is not proof that a physical masonry hinge can transmit a moment. The actual member contact, bearing patch, confinement and steel development below the bevel remain unresolved.

These Z values belong to the inherited native datum comparison. They do not select the separate raised dry-floor proposal or reconcile its thresholds and ground levels. A controlling source/datum edit invalidates this operator and its drawing.

## Implemented mechanics

The method integrates the actual horizontal RC sections and their changing centroid by complementary energy, including axial, biaxial bending, shear and torsion. It reuses the existing rectangular-section and compatible frame primitives. The known transverse bore is removed from section area and second moments. Its two remaining strips use an explicitly unqualified additive Saint-Venant torsion comparison; local three-dimensional hole effects, warping, shear concentration and plate splitting are not thereby qualified.

A finite, **explicitly authored bilateral** DPC comparison occupies the authored interval. The default read case leaves the interval and every constitutive law null. It does not copy the outer L cut into the north portal by default. The numerical fixture compares Z−50…−30, normal stiffness 0.5 kN/mm³ and shear stiffness 0.05 kN/mm³. It is not a compression-only mineral bed, qualified positive retention, a selected moisture break or measured installation behavior. Cuts through the tie-bore region reject.

The named finite upper cap segments run from the source grid axis Z−405 to the actual cap top Z−180. The inherited lower head-to-grid section transfer Z−750…−405 remains rigid and explicitly bounded. All 52 heads restrain translation ideally and release rotation; no site resistance or soil/shaft stiffness is invented.

Twenty-four unit wrenches obtain the actual coupled 24 × 24 cap/grillage flexibility. The correct wrench/displacement transforms join it to the four finite RC/joint subbodies. This returns a work-conjugate skewback operator, stiffness inverse and all 52 head recovery coefficients. A future upper system must solve compatibility against this same operator before recovering head actions. Adding these results to an old fixed-base house state would be invalid.

The internal tie force at Z2200 has a separate influence port at each pier. A point resultant represents its station; the end plate’s actual bearing distribution is not modelled. Independent authored end forces are comparison challenges, not automatically an equilibrated two-ended bar. Its cross-flexibility and tie displacement are retained. The tie's own axial member law, pretension, end plate, thread, bearing and capacity are absent. A necessary affine normal-pressure check at each authored DPC reports when the bilateral comparison requires normal tension; it grants no resistance, friction or partial-contact redistribution. Opposite axial controls demonstrate the compression/tension distinction. Collapsing its force into a hinge moment preserves the global head wrench but changes RC curvature and strain energy; the executable adverse control demonstrates this difference.

## Verification and replay

Eleven native tests cover closed-form prismatic Timoshenko/axial/torsion limits, independent eccentric coupling, taper/bore volume and quadrature refinement, all 24 unit-wrench balances, reciprocal work, stiffness inversion and positive energy, actual source topology, a real stiffness perturbation, the internal tie-station control, source/proof binding and unsupported inputs.

The executed numerical comparison gives a maximum unit-wrench global equilibrium residual of approximately 6.1 × 10⁻¹⁴ kN / kNm and relative reciprocal-work residual 1.2 × 10⁻¹⁶. Each partial RC body contains 0.1127438475 m³ after the authored DPC gap and actual bore removal. No resulting weight is credited as stabilising gravity.

A 0.01 mm prescribed vertical movement at the first skewback, with the other cut coordinates held by explicit comparison actuators, produces different compatible reactions when the pier flexural factor changes 0.25 → 0.125. The maximum head-component change is 0.146661 kN; the grid operator and source geometry remain unchanged. This is a controlled constitutive challenge, not a house movement or demand prediction.

With prescribed forces instead, the same grid head reactions remain unchanged while pier movements change. This is the correct force-controlled contrast. Neither behavior is manufactured by a snapshot or a reused foundation increment.

Run `python3 -B project/str/studies/north_portal_receiving_proof.py --write` to regenerate the actual unit-response, perturbation and tie-station proof plus section SVG. The thin native CLI accepts `--read` and an explicit JSON case. Save/load and current-design consumption belong to the shared adapter route when this development is integrated; this isolated module does not create another current-house authority.

## Remaining obligations

The four northern chains still need masonry spandrel/ring contact and actual tie coupling to the floor receiver, local bevel/bore/cage and foundation-joint proof, and the selected dry-side moisture section. The other 24 named duties need their actual finite wall/arch/bridge/corner paths assembled with the floor and source loads. Vertical slab/full-upstand behavior, internal receivers, complete disjoint gravity/precompression and successor roof compatibility remain whole-house engineering duties.

Material/product stiffness and installed contact behavior remain evidence requirements for the exact proposed joint; site head behavior belongs to later site acceptance. These are distinct from the internal implementation still available now. No generic professional referral or plot purchase is introduced as a reason to stop the book's bounded development. STR-FLOOR-PORTAL remains incomplete and ROF-RWT-GATE remains genuinely blocked.
