# Ordinary masonry roof seats in the joined house

## Development decision

Develop the continuous roof ring as an ordinary load-spreading beam on masonry seats. Keep roof uplift and lateral transfer at the four finite RC L cores. Retire the eighteen long intermediate bilateral laws as the active successor direction; retain their 48-source calculation as an explicit predecessor comparison. This is a simpler load-path proposition, **not structural selection or STR-FLOOR-PORTAL completion**.

The new saved `upperRoofBearing` stage consumes the sole `distributedFloor` geometry and the existing saved `masonryFrame` controls. It runs the native plate, lower masonry, northern frame, four upper L members, represented roof steel and all52 foundation heads together. The old intermediate receiving-law values are explicitly removed when deriving this successor; they cannot remain hidden authored inputs to an unrelated result. The predecessor roof solve is skipped when this stage is requested.

## Actual material and support geometry

The ordinary upper clear-core inventory comes from the current FIRST arch register, upper wall bodies and native140mm structural cores. Longitudinal room lines are clipped at the native262.5–11737.5mm bounds. Exact three-dimensional unions remove overlaps, the actual four RC L footprints and both complete north RC upstand solids, including end zones and intersecting partition returns. Ordinary bodies start at slab top3370mm or their actual contained concrete top (3920mm outer /3820mm court), and end at6540mm. Only the actual pad volume replaces masonry at each seat. A full pad/setting footprint crossing different receiving heights rejects.

As with the arch reservations, every upper service penetration omits its **full-height projected column**. This deliberately withholds the unknown redistribution above/below the circular hole. It is not an exact circular-hole net takeoff, whole-wall gravity inventory or installed minimum-weight qualification. Arch/spandrel/sill/head material, finishes and the complete roof weather assembly remain outside this clear-column addition.

At the worked20kN/m³, the clear masonry after pad substitution contributes438.477085kN. The eighteen100×100×10mm pads separately contribute0.1413kN at78.5kN/m³. The default upper axial modulus3000MPa and normal-joint compliance0.1mm/MPa are explicit unqualified comparisons, distinct from the lower-body law. Editing them is not material approval.

Each seat uses an independent axial masonry body, a separate compression-only roof contact and consistent body gravity split equally between the body top and its actual floor trace. A bedded/retained pad puts its weight on the masonry, so opening the roof contact does not lend the pad or wall weight to the roof. No intermediate tension resistance, masonry lateral/bending stiffness or fictitious grounded roof spring is introduced.

The eighteen seats are **axial point-bearing idealisations of dimensioned footprints**. Full pressure distribution, pad/bed rotation, relative in-plane sliding and friction remain unqualified; no72-fibre contact or installed pad pass is claimed. Full pad-plus-setting envelopes must nevertheless fit the actual clear masonry and represented straight ring strips before calculation.

Two service conflicts are removed by moving the north seat4700→4500mm and east seat6000→6100mm. The four court corner seats move132.5mm onto the adjacent straight north/south ring legs (X4050/7950), avoiding invented bearing material in a corner joint. Stable seat IDs survive the edits. The court-north5925mm seat has only120mm clear width: its100mm pad and two10mm setting allowances consume that comparison exactly.

Moved roof traces use the actual ring's Euler-Hermite interpolation, rotations and normal offsets. Floor feet are retained in the physical plate/member operator before condensation; every foot must have real assembled and condensed participation. No nearest-node substitution or orphan normal coordinate is allowed.

## Gravity and local response

Free-top clear masonry loads the actual plate through named nonuniform pressure vectors. Their Schur condensation uses the same stiffness factorisation and retains the interior particular displacement in the final simultaneous bending/work recovery. A source-origin force and both vertical first moments independently check the added masonry, replaced pad material, upper L bodies and roof stock against the assembled physical-G family.

North-upstand loads are partitioned at actual members and introduced as distributed force/moment densities with the existing local recovery ledger. Physical end-zone strips use explicit end-joint point introductions; they do not gain invented distributed joint resistance. No unreceived body load is silently sent to a convenient head. The worked case has zero unrouted clear-body gravity.

The first current worked response retains a minimum signed head action of−112.363681kN. The existing H12/100 floor comparison still fails its necessary section screen. These findings prevent a foundation, reinforcement or whole-house pass. The source-bound mutation/adverse/reversal receipt accompanies the actual calculated view; it does not convert these adverse findings into acceptance.


| Executed source-bound control | Minimum head kN | Peak bending + twisting kNm/m |
| --- | ---: | ---: |
| UPPER-SEAT-BASE | -112.363681 | 74.923613 |
| UPPER-SEAT-DENSITY-HALF | -114.703468 | 74.160763 |
| UPPER-SEAT-APERTURE-WIDER | -112.373479 | 74.929852 |
| UPPER-SEAT-NET-FLOOR-Q2 | -101.559026 | 80.383912 |
| UPPER-SEAT-ZERO-G-AND-ROOF-SUCTION | -243.065934 | 65.818697 |
| UPPER-SEAT-RESTORED | -112.363681 | 74.923613 |

## Executable route and proof

- `upper_roof_bearing.py` owns the new explicitly authored source/case interface and composes existing specialist methods.
- `upper_masonry_inventory.py` owns disjoint clear-column/pad quantities and full footprint/service exclusions.
- `named_plate_load.py` owns nonuniform element loads, condensation and actual particular recovery.
- `roof_bearing_trace.py` owns physical ring interpolation and virtual-work mapping.
- `structural-upper-bearing.ts`, the common engineering document and public CLI use those methods. The source account extends the existing masonry-frame family rather than registering another house or packet.

The analytical checks compare nonuniform loads against an independently solved uncondensed plate; test sparse/standard algebra, first moments, particular work and reversal; preserve all six ring rigid motions and point-force virtual work; reject missing ring/plate routes, non-finite inputs, duplicate IDs, full-footprint/service collisions and overlapping material; and retain unchanged face-finish controls. Native full-system controls exercise actual density, floor aperture, live load, suction/zero-G and restored inputs against all52 heads.

## Exact remaining obligations

Before structural selection: prove finite pad contact/rotation and installed bedding law; ring/pad overlap under actual relative lateral movement; upper-wall stability and wall-head restraint; the omitted wall/arch/finish/weather gravity and actual pressure programmes including lower P0; floor/north-frame/four-L reinforcement and anchorage; physical resistance and interfaces of the now-modelled west wet-wall beam and its actual supports/cage; complete signed grid/cap demand and foundation resistance; and moisture/air/thermal continuity. The floor-section continuation includes computational wet-beam and discrete receiving-grid recovery; it does not qualify those physical obligations. Reconcile the actual weather datums and raised-house decision before using rainwater or nominal views as evidence for this geometry.

The recommended replacement is now executable and source-bound. Its unresolved duties are those concrete engineering boundaries, not another request to refine the rejected intermediate rods. No owner, material, physical or professional verdict is fabricated.

The [editable floor-section continuation](floor-section-result.md) now reassembles the actual plate/membrane, physical weight, upper body starts and52-head response for an authored200..250mm trial. It preserves this RC200 result as the exact control and withholds unadopted finish/stair/service evidence; it does not select thicker concrete from an unqualified corner point peak.
