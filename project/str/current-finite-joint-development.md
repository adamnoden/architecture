# Actual loaded SW joint in the house

The executable comparison now replaces one rigid SW floor patch with an actual finite slab and upper wall stub in the same roof, floor, wall and52-head system. This supplies the missing loaded joint demand. It does not select the house, establish reinforced-concrete resistance or close STR-FLOOR-PORTAL.

The controlling input is the saved engineering document. `stages.floorSection.finiteJointComparison` chooses explicit computation, finite insertion, uniform secant modulus and solid pitch; `stages.distributedFloor.cornerWidthsMm.SW` owns the actual wall width. CLI, API and editor use these same inputs. The ordinary authored-law floor remains a separate executed control. No retained isolated contour response supplies the inserted stiffness or loaded forces.

## Physical replacement

The patch is X262.5..2177.5/Y262.5..2650 mm, exactly4.5720625 m² of actual uninterrupted source slab. RC occupies Z3170..3370. The lower frame cuts at the actual L footprint at3170; the finite upper L continues from3370 to4370, where the remaining physical frame begins. Neither a whole-slab rigid lower plane nor a fictitious1000 mm transfer arm supplies support.

Actual native CST in-plane fields and MITC4 bending fields cross the east/north cut through work-dual traces. Their meshes need not coincide. The slab band retains its own140 mm width and steel chord allowance separately from the wall width. The same conventional isotropic secant modulus8250 MPa is used for the frame/slab comparison; it is not a qualified cracked-RC law. Source masonry/body normal laws remain independently authored.

The patch slab G24.6891375 kN, finite upper-stub G and the shortened upper frame are charged exactly once. Fresh1.5Q, upper free masonry and signed source wind retain their actual force origins. Thirty-two literal normal-contact top traces are replaced by real finite-solid soffit coordinates; every lower serial-body/grid trace, body own-G and source contact law is preserved.

The native CST kernel remains byte-for-byte unchanged. Exact point interfaces use zero-measure kinematic descriptors; they do not create rigid footprints. Exact partitions of existing source rectangles introduce numerical axes without changing their physical union. On the actual assembled candidate, this composition gives identical triangles, axes, area, participation, condensed K and condensed F to the initial explicit point-interface extension; both maximum differences are exactly zero. This avoids altering unrelated native58-source evidence.

## Paired loaded case

The matched axes-only control and finite250/140 mm runs use identical authored case, conventional laws, native58 identities and runtime. Both finite runs retain the same148 physical ports and the same32 contact catalogue. Exterior CST axes are identical across all three cases.

| Actual result | 250 mm | 140 mm |
| --- | ---: | ---: |
| Loaded joint strain energy, kNm | 0.1419816992 | 0.1347368080 |
| Largest whole-house wrench residual | below1e−6 | 2.965e−8 |
| Actual contact state in W31/Q2 | all32 open | all32 open |

The250→140 change is3.203 kN in the largest port-action component and3.242 kN in the largest52-head vertical reaction. Joint energy changes about5.1%. The140 finite case changes a head vertical reaction by up to5.019 kN against its matched rigid-patch control. These are real loaded-house consequences, not convergence or strength acceptance. The next engineering work can now use actual physical wall/contour actions rather than inventing forces from an isolated component.

A separately integrated physical freebody reconstructs the port wrenches from their actual coordinates and balances them against independently integrated slab/stub G, upper masonry, Q and source wind. Saved Kq−f, loaded physical work, actual52-head equilibrium and load-family sums are replayed without solving the component again. Changed q, changed port origins, dropped/doubled G and missing contacts reject.

The saved-document compiler executed both the ordinary52-head floor and the additional finite250 comparison. Its finite request, executed case, five physical-method identities and runtime exactly match the paired140 capture. The finite drawing marks the real inserted domain rather than depicting its removed shell cells as a hole.

## Section decision and room consequences

Do not preserve the140 mm L merely to retain the old room face. Existing ordinary cage allowances make it an unsuitable next two-face longitudinal/link development section. The shared source allows H12/H8,32 mm link mandrel,45 mm nominal link cover,40 mm minimum cover,5 mm cage setting, independent±5 mm bar positioning and21 mm clear spacing. Its conservative rounded-corner bar face is69 mm.

| Width, mm | H12 adverse opposite-face clear, mm | H16 adverse clear, mm |
| --- | ---: | ---: |
| 140 | −20 | −24 |
| 180 | 20 | 16 |
| 200 | 40 | 36 |

Choose one200 mm inward section as the conventional development standard at all four corners. The same140 mm cage exclusion applies toSE; it is not exempt because the worked finite joint isSW. NW/NE were already200. The earlier SW200/SE140 cases below remain bounded diagnostic controls. The uniform200 W0 whole-house comparison passes the existing limits and charges the additional SE16.185 kN characteristic G; its complete signed run follows the same source case, without dropping programmes. This is not four qualified physical joints.

Choose200 mm inward as the next conventional section development input. This is a placing screen derived from shared physical allowances, not the portal-specific cage function reused as an L-cage proof. Complete L links, slab-node anchorage, simultaneous biaxial resistance, shear/torsion and durability remain to design against the actual loaded actions.

The actual source width input gives disjoint SW rectangles `[262.5,262.5,462.5,1262.5]` and `[462.5,262.5,1262.5,462.5]`. RC area increases0.0996 m². Existing cavity and110 mm glass remain. With27 mm room finish, the local corner face moves429.5→489.5 mm: a real60 mm roomward projection. Holding the old room face instead would consume60 mm of that glass and require an explicit thermal rewind.

The actual200 mm native comparison passes the same52-head and independent joint balances. Its characteristic joint G is33.6891375 kN; whole-house physical G increases16.185 kN against140, including actual lower/upper wall, stub and masonry exclusion consequences. The largest head vertical redistribution is37.307 kN. The minimum W31 head remains tensile: −92.970 kN atP10, compared with−97.656 kN for140. This is not a foundation or uplift-resistance pass.

SE enlarges symmetrically into the Utility: its finished local east/south faces become11510.5/489.5 mm. The original sink and east seat boxes overlap it; the original whole Utility pan/load-body geometry therefore loses applicability. Entries, outfalls, bank and Plant territory must be assessed at their actual positions rather than shifted wholesale. The same corner reader and saved width must drive this replan.

The original Study west emitter occupies X429.5..629.5/Y1250..2400. It intersects the enlarged finished return; the exact non-overlap start is1289.5 mm before installation reserve. The source-derived Study consequence must therefore notch its floor/panels and move the emitter through the same width choice. The raw first-opening start1300 leaves the unchanged37.5 mm RC-to-aperture plan reserve; that is not a three-dimensional arch or finish qualification. No owner acceptance is inferred.

## Execution boundaries and next work

An initial140 run failed the unchanged1e−6 whole-house wrench limit because eigenmode roundoff retained tiny world-rigid work. Measured rigid-null projection changes K by only about3.1e−10 relatively; mapped coefficient correction is about5.6e−13. The corrected run passes the original equilibrium limit. No support, force or acceptance tolerance was added.

One duplicate250 process was killed with OS exit137 while several heavy native processes overlapped. This is a runtime failure, not a mechanical rejection. Heavy solves are subsequently serial. An initial200 attempt exposed an inherited engine assumption equating wall width with slab-band width; the revised interface separates these physical inputs instead of forcing the wall to stay140 mm.

The source assembly is simultaneous and zero-gap: masonry own-G acts while the floor, frame and top contact are solved together. Its construction reference is explicit; no prestress, pre-shortening reset or artificial contact activation is added.

| Actual SW200 programme | Active contacts | Total top compression, kN | Largest independent body base−top−ownG residual, kN |
| --- | ---: | ---: | ---: |
| W31 /2 kPa Q | 0/32 | 0 | 1.39e−17 |
| W31 /5 kPa Q | 0/32 | 0 | 1.39e−17 |
| W0 /2 kPa Q | 32/32 | 7.622015673 | 2.08e−11 |
| W6 /2 kPa Q | 32/32 | 1.471785882 | 2.83e−11 |

Both opening and compression are therefore exercised through actual solid top traces, original serial bodies and lower grid traces in the complete house. W0 independently closes the loaded joint freebody within5.14e−9 kNm and the52-head wrench within4.08e−9. Ordinary extra Q did not force the adverse W31 contacts closed. These results establish the executed mechanical path, not masonry/pad bearing resistance or a different construction sequence.

The signed positive-face cases also exercise the inherited facade-envelope tail outside real slab material. Only its−200..262.5 mm portion is projected as an exact force/first-moment wrench at the real lower wall cut; the contained slab line remains distributed. This is the existing rigid-trace source-load convention, separately reported as generalized port load, including its exact q·p work. It creates no physical facade or slab beyond the domain. The complete original3370→3270 offset is applied once. Independent source floor force/first-moment residuals are1.42e−11 forW0 and4.54e−10 forW6. Site wind and actual facade attachment remain unqualified.

The expanded source producer guards the transitive solid numerical kernel as well as its direct methods. Earlier paired receipts keep their original method metadata; the same unchanged kernel is retained separately from checkpoint9bd40f6d. A current-method140 rerun reproduces all312 old head components and the whole port-displacement array exactly, independently verifying unchanged reference mechanics after the explicit band-width and passive-observer additions.

Remaining critical work is the complete signed programme and numerical adequacy, complete conventional reinforcement/node detailing, foundation resistance and the full moisture/thermal/weather/stair/service integration. Existing three other L patches remain explicit rigid controls. This is one inserted physical joint in a complete native comparison, not four qualified installed joints or an executable construction approval.
