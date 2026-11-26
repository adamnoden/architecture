# Portal simplification after cage rejection

**Historical topology comparison.** Its preference for the separate masonry arch below a straight RC frame is no longer the next development instruction. The later [finite lower-masonry bed comparison](lower-masonry-bed-development.md) rejected its tested lower-arch arrangement; the [floor–portal reconciliation](floor-portal-reconciliation.md) owns the active seated-RC route. Those later tests do not validate this earlier, differently dimensioned masonry proposal or reject every masonry arch. Reopening it requires a changed, complete and consistently loaded mechanism rather than another refinement of the failed bed.

One explicit inward-enlarged RC alternative was checked here and still has arch-bar/link intersections. Neither alternative is a selected structure. The rejected cage record is [continuous-rc-closed-links.md](continuous-rc-closed-links.md).

This comparison binds the actual HAD portal and four grid caps. The governing architectural controls are the finished 2400 mm aperture, its existing curved profile, and the 775 mm normal envelope. The previous 2960 mm raw structural span is allowed to change. Current native 48-wind forces remain frozen evidence for their original mechanical model; they are not reused as forces for either altered structure. The separately developing 200 mm floor integration likewise requires its own joined calculation.

| Consequence | A: separate masonry arch and straight RC frame | B: inward 300 mm RC posts with curved RC ring |
|---|---:|---:|
| Raw structural span | 2600 mm | 2785 mm |
| Raw intrados spring | 2406.048 mm | 2330.277 mm |
| Finished opening/profile | Existing 2400 mm/profile retained | Existing 2400 mm/profile retained |
| Finished normal envelope | 775 mm intent retained | 775 mm retained |
| Local jamb glass plus lining | 60 + 40 mm minimum | 152.5 + 40 mm |
| Glass plus lining at 290 mm normal core | 202.5 + 40 mm each face | 202.5 + 40 mm each face |
| Room-side projection | None from the inward abutment | None; source room faces remain X4280.5/7719.5 |
| Added RC | 0.563595 m³ full-height abutments | 0.311474 m³ actual post/ring union |
| Added RC weight at authored 25 kN/m³ | 14.0899 kN before removed rings | 7.78684 kN net |
| Crossing curved RC cage | Removed | Still present; explicit trial rejected |

No purchase or installed cost is invented. The quantities above price the architectural choices in concrete, load, glass and space. A's two removed RC rings total 0.403656 m³/10.0914 kN. Its two new 215 mm normal masonry rings total 0.271725 m³/5.43451 kN at the explicitly authored 20 kN/m³ trial. Abutments plus new rings minus removed rings add 9.43296 kN. This partial net excludes changed spandrels, ties, reinforcement and load redistribution.

## A: direct-bearing masonry arch

The old source skewback cannot simply be retained underneath a full-height straight RC post. Its radial seat runs from X4370.282/Z2404.304 to X4520/Z2250, through the territory now occupied by continuous frame bars. Calling this a separate masonry arch does not remove that physical overlap.

The authored replacement carries an inward 180 mm RC abutment down to the actual cap top Z−180. The western abutment extends X4520–4700, is 290 mm normal, and terminates in the actual radial seat. The inner seat is X4700/Z2406.048; the outer seat is X4568.491/Z2576.137. Its top continues along that radial line to X4550.041/Z2600, then closes against the frame. The model uses this polygon, not a solid box overlapping the masonry. The four abutments are wholly within the source 600 ×600 cap plans, with 100 mm inward plan reserve. This is direct bearing, not a high floating corbel or an assumed slab transfer. Its enlarged bar cage and cap force path still require authoring.

The structural masonry intrados retains the existing radius 2125.333 mm and crown Z2850; the 215 mm radial ring retains outer crown Z3065. The finished concentric arch has radius 1845.333 and crown Z2570. Moving the structural spring inward narrows the raw opening but does not enter the existing finished opening. Below the finished spring the remaining 100 mm jamb reserve permits only 60 mm cellular glass plus 40 mm lining. This substantial local thermal loss needs a three-dimensional junction calculation and the owner's acceptance of the assembled appearance; it is not a thermal pass inferred from a positive thickness.

The frame/upstand carries the floor, its actual side-wall reactions and wind. The masonry arch carries its explicitly assigned masonry and finish gravity. It does not receive hidden floor or roof load. At the existing upstand underside Z3170, the ring crown leaves 105 mm gross; any spandrel and a deliberately unloaded head separation must fit that actual space. A 30 mm head separation would leave only 75 mm at the crown. Actual out-of-plane restraints must permit the intended movement without transferring an unanalysed vertical action.

A symmetric three-hinge self-weight witness gives each seat V1.35863 kN/H1.91254 kN, resultant2.34599 kN. Resolving onto the radial seat gives compression2.34407 kN and tangential0.09501 kN, requiring friction ratio0.04053 if no positive shear transfer is provided. Mean gross seat pressure is0.05071 MPa. These are deliberately small own-ring-only witnesses, not the design action envelope or a masonry strength/thrust-line pass. They omit spandrel, finish, construction asymmetry, wind, out-of-plane stability and movements.

Before admitting A, complete the masonry thrust-line/eccentric-compression envelope with actual units/mortar and asymmetric construction/load cases; detail radial bearing and shear restraint; design the enlarged abutment/frame reinforcement and closed links without the removed curved cage; provide its cap/grid/52-head force transfer; and replace the ring's stiffness, mass and loads in the joined house solver. The source 140 mm warm-core clip remains part of the continuous RC wet-to-warm route. The enlarged ground, metal barrier, bar seals and adjacent masonry slate returns must be redrawn and moisture/thermal checked. A shorter cage does not discharge those duties.

## B: hidden inward enlargement, one explicit trial

Hold the western outer core face X4307.5 fixed and move the opening face X4520→4607.5; mirror east. The post is 300 mm along X and 290 mm normal. The RC intrados circle and the finished circle remain unchanged, so the new spring/rise are calculated from the actual circle, rather than retaining the old 2250/600 values. Four gross post additions are0.340025 m³; cropping the two rings to their new vertical post faces removes0.0285515 m³ of overlap. The resulting net RC addition is0.311474 m³. The post centroid moves X4413.75→4457.5, reducing the eccentricity to source cap X4500 from86.25 to42.5 mm. Neither this reduction nor containment in the cap establishes cap strength.

The trial recomputes H12 arch tangencies and 87 mm bend radii, uses post main axes X4378.5/4536.5 and normal±74 mm, and remaps the explicit H8 horizontal link to its new 100.5 ×95.5 mm half-cell. At Z2350–2475 the sampled links hit the curved bars or fail the admitted clearance envelope. Passing trial stations at2325/2500 leave a175 mm nominal/179 mm adverse interval, exceeding100 mm. The ring/post joint is therefore still not a fabricable closed cage. There is no promise that a body enlargement alone solves it, and no continued local tie iteration is recommended here.

The previous proposed cap mats are not an existing schedule and cannot be copied into the new footprint. In particular, the new X4536.5 starter is36.5 mm from a cap-centred X4500 north–south mat axis; actual rib/placement spacing and crossing elevations need a revised mesh layout. Whole-house stiffness, section law, barrier axes and ground support must likewise change explicitly if B is revisited.

## Preceding decision and reproducibility

A is the cleaner next mechanism because it removes the failed curved RC reinforcement crossing. Its cost is the 60 mm local jamb insulation and larger direct-bearing abutment; if the thermal junction cannot earn its requirement inside the finished envelope, revise the architectural opening/wrap explicitly. Do not silently adopt a high tension corbel or relabel B's failed cage as conventional.

The new helper regenerates geometry, quantities, the limited reaction witness and B trial from authored inputs and source JSON. Seven tests cover actual radial seats, conservative mass union, the failed enlarged trial, a changed masonry seat projection with unchanged B control, and adverse cap/approval inputs. Run `python3 -B project/str/studies/portal_architectural_simplification.py --check` and `python3 -B project/str/studies/portal_architectural_simplification_test.py`. The SVG is an inspected section comparison, not a fabrication drawing or owner acceptance.
