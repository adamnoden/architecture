# Floor and portal reconciliation

**Interim disposition, 12 November 2026.** The monolithic floor/jamb comparison still needs a roof guide that fits its concrete receiver. The full radial cassette fails the provisional concrete side-web screen in the 140 mm outer L-pier arms. Centring it in a hypothetical 180 mm arm clears this local screen and gives a specific candidate for replay. STR-FLOOR-PORTAL remains open, and both final house gates still depend on its resolution.

## Radial receiver at the outer L piers

The [source-bound predecessor](https://github.com/adamnoden/architecture/pull/1489/commits/7a1b697431e9c1556f426068068b96356d3158ca) locates six radial guides on each of four L piers. The complete cassette is 94 × 46 mm in plan. Its 70 × 20 mm tongue carries ±10 mm released travel, 2 mm running allowance at each edge, and 5 mm slide plate plus 6 mm carrier cheek on each side. The local comparison deducts two independent 5 mm setting allowances from the minimum gross concrete web. The 25 mm screening dimension is a comparison input. Required cover, confinement and anchorage remain open.

| Compared at all 24 guides | Gross web | Web after settings | Margin to 25 mm |
| --- | ---: | ---: | ---: |
| 140 mm arm, full cassette | 19.56 mm | 9.56 mm | −15.44 mm |
| 140 mm arm, cassette reduced to bare tongue width | 28.17 mm | 18.17 mm | −6.83 mm |
| 180 mm arm, full cassette centred 20 mm farther into each arm | 39.58 mm | 29.58 mm | +4.58 mm |

The limiting straight-arm station is 725 mm in all three comparisons. The full 140 mm assembly is short even before the two setting deductions. Holding the current radial angle, guide centres and travel length fixed, a narrower cassette alone cannot meet the screen: even a 20 mm envelope, the tongue's width before adding the receiver, is short.

The [standalone calculation](studies/floor-portal-receiver-cover.py) checks the full oriented cassette against the six exposed edges of the L union. It includes controls for a cassette edge crossing the re-entrant corner while all four cassette corners fit, and for the closest point falling between cassette corners. The [receipt](studies/floor-portal-receiver-cover.json) replaces the predecessor summary's rounded 9.60 and 29.62 mm with the values calculated from the recovered coordinates. The 180 mm local plan comparison also clears the retained [H20 layout and H12 stations](studies/current-house-ground-ties.json), with minimum screened plan gaps of 38.98 and 60.13 mm respectively after settings. These gaps address the stated plan obstructions only.

Run the study with Python 3 and compare its stdout with the receipt.

```sh
python3 -B project/str/studies/floor-portal-receiver-cover.py | diff - project/str/studies/floor-portal-receiver-cover.json
```

## Next comparison and dependent evidence

Compare the 180 mm plan with a revised guide location or orientation at 140 mm before choosing a pier geometry. Retain real guide travel and a positive load route in either option. Build the full receiver, bar, link, coupler and bearing detail and demonstrate its cover, splitting restraint and erection tolerances. If the 180 mm pier is pursued, carry the changed body, bar locations, stiffness and mass into the ring, floor collector, feet and foundation model. Re-run the signed 579-case demand and 104 individual-head movement comparisons with all 52 head reactions, plus the strain controls. Reconcile the widened geometry against the occupied rooms, finishes, roof and court receivers, service openings and renewal paths before offering it to either final gate.

The predecessor's coupled results describe its 140 mm comparison. The numerical force and movement records are recoverable at the pinned head, with its [recorded CI run](https://github.com/adamnoden/architecture/actions/runs/43263256156). They do not transfer to the widened pier. The [interface review](floor-portal-interface-review.md) and [shared contract](../triad-interface-contract.md#structural-direction-and-selection-compatibility) continue to govern the withdrawn SAP-C1 structural handoff and the receiving gates.

## Outward cap and core-only bearing comparison

Moving the 40 mm enlargement outward keeps the inner concrete face at q402.5 and the ordinary room finish at q429.5. The outward L origin shifts 40 mm in both plan coordinates. The 1040 mm local legs preserve the world end stations, and the guide centres move 20 mm outward across their respective legs. The [24-guide plan receipt](studies/floor-portal-receiver-cover.json) gives 29.53 mm of concrete web after settings, with 34.78 mm minimum H20 clearance and 60.20 mm minimum H12 station clearance. These are local plan screens with the retained bar positions.

The cap-only comparison confines the enlarged footprint to Z6215–6515. The 140 mm pier and damp-proof course footprint continue below it. The glass zone in the enlarged cap strip changes from 110 to 70 mm before local closure and fixings. The [ordinary wall section](../mat/ordinary-eave-joined.md#connected-section-and-actual-stops) supplies those starting dimensions. The 180-to-140 concrete step uses a rigid sectional connection for demand recovery. The contact quadrature splits at the actual 40 mm projection, so the projected strip and underlying core have separate vertical reactions.

The core-only alternative uses an authored **5 mm initial vertical gap** over the projected strip and retains compression contact over the old 140 mm core. All six lateral guides per pier retain their prior force law and travel reservation. The installed question is whether the roof seat can stop at the core edge, keep the projected strip clear under load and setting, and retain the radial guide, closed glass return and inspection access. The 300 mm cap depth and 5 mm gap are comparison dimensions.

### Coupled comparison

| Signed demand case envelope | Peak head tension, kN | Peak L-end torsion, kNm | Peak collector-end torsion, kNm | Peak absolute L-guide Cartesian component, kN |
| --- | ---: | ---: | ---: | ---: |
| 140 mm full-height reference | 159.45 | 2.345 | 11.951 | 28.41 |
| 180 mm full-height outward | 156.99 | 4.304 | 12.201 | 25.88 |
| 300 mm outward cap, shelf bearing | 159.24 | 2.690 | 11.978 | 27.40 |
| 300 mm outward cap, 5 mm shelf gap | 159.24 | 2.695 | 11.970 | 29.24 |

All four models recover equilibrium at the 52 heads. Each column has its own case witness. The full-height outward comparison retains the old 140 mm damp-proof contact as a stiffness input. Its connection across the added footprint still requires a physical transition.

The touching shelf attracts **135.59 kN** of vertical compression at the southeast cap, with **18.42 kNm** about the lower-section global X axis in that same case. The core-only seat leaves the projection unloaded in all 579 signed cases and 110 movement cases. Its minimum modeled contact-point gap is **4.884 mm** under signed loading and **4.967 mm** under imposed movements. Peak core compression moves from **71.80 to 128.52 kN**, the largest individual L-anchor tension remains **8.78 kN**, and the largest absolute Cartesian component of L-guide force rises from **27.40 to 29.24 kN**. The two cap models give the same 159.24 kN peak head tension. The P10 −1 mm fixed-head movement control gives **1459.92 kN** tension with the relieved seat. This is a kinematic model demand.

In the case producing 128.52 kN of core compression, southeast guide 5 carries the simultaneous force vector (−22.814, −25.887, 0) kN, a **34.505 kN resultant** in that case. The predecessor plate-root screen uses the largest Cartesian component. A diagonal guide requires the actual tangential resultant for its plate and weld checks.

Develop the **core-only seat** as the next finite detail. Draw the steel bearing and its end at q262.5, the gap over q222.5–262.5, and the supported 70 mm glass return. Establish the local plate pressure and closure across the entire projection, including setting and plate deformation. Detail the outward cassette anchorage and confinement into the 140 mm core for the simultaneous actions in the [coupled receipt](studies/floor-portal-cap-replay.json). Keep the room edge and lower damp-proof geometry in the replay. STR-FLOOR-PORTAL stays open until the actual joint and dependent interfaces are resolved.

### Replay

The [companion patch](studies/floor-portal-cap-replay.patch) applies to the exact pinned predecessor and records the changed footprint, mass, split contact and step forces. The [runner](studies/floor-portal-cap-replay.py) checks both the predecessor and the applied patch. It uses Python with NumPy 2.3.5 and SciPy 1.17.0.

```sh
git fetch origin refs/pull/1489/head
replay_dir=$(mktemp -d)
git worktree add --detach "$replay_dir" 7a1b697431e9c1556f426068068b96356d3158ca
git -C "$replay_dir" apply "$(pwd)/project/str/studies/floor-portal-cap-replay.patch"
OPENBLAS_NUM_THREADS=1 python3 -B project/str/studies/floor-portal-cap-replay.py "$replay_dir" cap300-relief5 signed
OPENBLAS_NUM_THREADS=1 python3 -B project/str/studies/floor-portal-cap-replay.py "$replay_dir" cap300-relief5 movement
```

Use `140` for the base, `outward180` for the full-height outward comparator and `cap300` for the cap whose projection has initial vertical contact. The signed screen retains the 579 predecessor cases. The compatibility screen retains six free-strain comparisons and 104 individual unit head movements. Both use the inherited fixed-head and frictionless-guide comparisons.

## Finite core seat, cage and glass return

The [finite detail study](studies/floor-portal-seat-detail.py) locates the complete trial at all four L piers. Narrow the 300 mm tall cap from 180 to **175 mm**, keep the 140 mm core and room-side face, and leave **75 mm** between the cap and the fixed wall-glass/cavity datum q152.5. A 5 mm outward cap setting leaves **70 mm** without using the 50 mm cavity. Place the six radial guides at old-core coordinates 220, 475 and 680 along each arm, 52.5 across it. The adjusted guides leave **27.10 mm** minimum concrete web after settings. Keep the earlier q50 line with this narrower cap and the web falls to **24.59 mm** against the 25 mm screen. The glass must turn continuously across the two faces and down the cap shoulder. Retain it independently of the moving roof shoe. Locate the supported toe, head/drain and air return before awarding a thermal, fire, restraint or renewal result. The comparison sets a geometric reservation for those details.

Keep the soffit at Z6540 and end the bearing shoe at q262.5. The highest hardware over the shelf is Z6525 for a **15 mm** authored gap. Two independent vertical settings and the prior modelled 0.116 mm approach leave **4.884 mm** before real plate flexure. The ring source has a 20 mm skin and the outer skin edge overhangs the core by 40 mm. Assigning all of the earlier 128.52 kN cap reaction to one 100 mm strip at the overhang tip gives about 771 MPa, so that strip idealisation cannot be used as an elastic deflection bound. The physical seat needs the actual web-to-core transfer width, local plate stiffness and toe geometry.

The twelve staggered H20 lines bend from Z6140 to 6450. Below the Z6215 shoulder they keep **25.05 mm** side cover after settings in the old core. The continuous 3D bar-pair clearance lower bound is **23.18 mm** after settings. The trial embeds Ø38 × 48 CXL20W couplers below the seat and gives each a 2 mm radial weld-toe reservation. The minimum coupler/weld clearance is **21.61 mm**, minimum plate edge reserve **1 mm** and minimum coupler-to-cassette separation **26.31 mm**, all after settings. The moved 680 guide leaves only **15.58 mm** at the retained H12 station 600. Moving its cap end to 590 gives **25.58 mm** in the independent station screen. Its finite bend, ties and connection remain separate geometry to resolve. The original, unstaggered centres leave only **6 mm** between couplers. The geometric reservation allows at most 2.31 mm radial weld toe at the packing screen. A 5 mm external toe would also overrun the plate edge.

Three rounded H8 loops at Z6355, 6394 and 6433 maintain **21 mm** vertical separation and **2 mm** above the highest hoop to the cassette, after independent settings. The exact straight and curved centreline screen tests all twelve bars across the full relative ±10 mm height band. The limiting bar clears by **0.057 mm** after the geometric and sampling deductions. The Z6350/6390/6430 control overlaps by **0.398 mm**. These margins support comparison at the drawn dimensions. Cage deformation, joint hooks, concrete flow around the actual welded sleeves and final tying/installation tolerances still control selection.

The installed packing model exposes a different failure during assembly. Turning each bent bar fully into a fixed, pre-welded plate creates four reciprocal collision pairs at the lower straight leg. Common-angle turning also fails, with **−11.57 mm** screened clearance. The Ø35, 48 mm CXL20/C sleeve avoids rotating the continuation bar, but the straight piece below CXL20W is only 17 mm. It is **31 mm short** even before the Type C locknut and wrench envelope. Pre-threading individual seat segments avoids those relative turns. A subsequent straight feed of the closed links still fails: the loop overlaps the retained lower straight bars by 15.70 mm after settings or the pre-threaded sleeve envelopes by 10.31 mm from above. Moving the Type C splice below the cap while retaining the original H20 grid also fails. Even a staggered Ø35 sleeve beside a bare bar leaves only **16.50 mm** clear, and sleeve side cover is **20.50 mm** after setting. Develop a separable seat and a mechanically closed multi-piece link, or a different no-rotation tension connection with a demonstrated cage sequence. Verify the weld and carbon-equivalent-specific procedure independently of the dimensional fit. [Leviat reinforcing bar coupler catalogue, pp. 16–17 and 23](https://www.ancon.co.uk/downloads/81/Reinforcing%20Bar%20Couplers%20UK%20IRE%20Edition.pdf)

The trial leaves the original lower pier and DPC as the inherited comparison. Complete the compression transfer, cage bursting and installed sliding law before using the reference joint. The geometric screen carries no product, connection or construction acceptance.

### Movement and adverse guide pressure

The moved anchor and guide points enter the ring model as actual port locations. The candidate removes obsolete 140 mm bearing and bar subdivisions from that ring mesh. Retaining the displaced bar nodes had introduced 3 mm segments and failed the unchanged dimensional balance check. The established bearing and anchor stiffness assumptions remain comparison inputs. A shop-installed stiffness or a checked weld may move the force split.

All **579 signed cases** and **110 movement cases** retain all 52 heads. The signed sweep gives **130.54 kN** maximum core compression and **8.585 kN** maximum single-anchor tension. Its smallest projected gap is **14.890 mm**, with zero shelf compression. The two 5 mm vertical settings leave 4.890 mm before actual plate flexure. Using that signed compression in the isolated 100 mm strip yields 783 MPa, corroborating the prior adverse comparison. The 110 movement cases separately retain all 52 heads. The minimum projected contact-point gap is **14.969 mm**, with zero shelf compression. The largest radial release travel is **5.754 mm** in the model. The reference imposed-head demand is separate from installation and product tolerances.

Three signed cases also test the previous fixed-direction **20% friction** overdrive with the relocated ports. All remain open at the shelf. The W(1,4) downward pressure case with court wind enabled, with goods at Z7400, gives **56.180 kN** resultant at the governing L guide, from **55.089 kN** tangent and **11.018 kN** radial components. Its direction reversals remain visible. Treat this as an adverse test, with the actual stick/slip law and assembled normal pressure still held. [GGB-CBM sliding material product data](https://www.ggbearings.com/en/our-products/metal-and-bimetal-bearings/ggb-cbm)

The 70 × 60 mm tongue with the earlier 75% effective bearing area gives **17.49 MPa** on the concrete backing under that tangent, above the prior 17.00 MPa pressure comparator. The same screen would require at least **61.72 mm** effective depth with that width and area factor. Extending the existing cassette down by 2 mm to trial 62 mm depth consumes the whole 2 mm upper-link reserve. At unchanged tangent, a 73 × 60 mm active face instead gives **16.77 MPa**. Its longer cassette still clears the planar web and coupler screens at **25.98 mm** and **25.14 mm**. The trial H12 station would need to move from 590 to 589 to retain **25.58 mm**. The three-case repeat with the longer blade's changed model stiffness drives the W(1,4) resultant up to **57.57 kN** and the pressure to **17.18 MPa**. Reject the unchanged pressure assumption as a sizing method. Rework force spreading and splitting restraint with the actual H12 bend before choosing a longer guide. Increasing depth alone gives no placement or splitting pass. The supplier's static sliding-material pressure is a separate contact interface.

### Reproduce the finite detail

Use the exact pinned predecessor and its finite-detail companion patch in a separate worktree. The new runner refuses a moved source or altered patch. The signed replay retains the original 0.03 N / 20 Nmm global balance limits. Sparse reaction recovery uses extended precision to keep the high-stiffness products from losing meaningful digits during subtraction. The run used Linux x86_64, Python 3.12.14, NumPy 2.3.5 and SciPy 1.17.0, with 63 stored mantissa bits in NumPy longdouble versus 52 for float64. The signed command fails explicitly on a platform that lacks wider longdouble arithmetic. The [receipt](studies/floor-portal-seat-detail.json) binds geometry to the owning source files.

```sh
git fetch origin refs/pull/1489/head
replay_dir=$(mktemp -d)
git worktree add --detach "$replay_dir" 7a1b697431e9c1556f426068068b96356d3158ca
git -C "$replay_dir" apply "$(pwd)/project/str/studies/floor-portal-seat-detail.patch"
python3 -B project/str/studies/floor-portal-seat-detail.py
OPENBLAS_NUM_THREADS=1 python3 -B project/str/studies/floor-portal-seat-detail.py "$replay_dir" signed
OPENBLAS_NUM_THREADS=1 python3 -B project/str/studies/floor-portal-seat-detail.py "$replay_dir" movement
OPENBLAS_NUM_THREADS=1 python3 -B project/str/studies/floor-portal-seat-detail.py "$replay_dir" friction
OPENBLAS_NUM_THREADS=1 python3 -B project/str/studies/floor-portal-seat-detail.py "$replay_dir" friction-longer
```

### Room-side ring access and separate air closure

A removable room-side cover would cross the torsion path of the welded roof ring. The [local reproducer](studies/floor-portal-ring-access.py) and [receipt](studies/floor-portal-ring-access.json) compare a 100 × 56 mm cut in the 220 × 120 × 20 mm straight outer arm with the intact section at the authored 10 kNm corner-adjacent arm action. The thin-wall closed estimate gives 53.33 million mm⁴. The freely warping open estimate gives 1.45 million mm⁴, or 2.72% of intact. Over 100 mm the respective twists are 0.014° and 0.513°. These are uniform-section comparisons. The short aperture, restrained warping, thick corners and axial transitions need a local connection model. [Thin-wall torsion method](https://ocw.mit.edu/courses/2-082-ship-structural-analysis-design-13-122-spring-2003/ad91f0302bba1ce047679b774982f599_notes_14_twist_closed.pdf)

| Trial | Result | Consequence |
| --- | --- | --- |
| Removable structural closure | A perfectly engaged 12 mm insert restores 94.14% of the section constant and a 20 mm insert restores 100%. Each seam carries 250 N/mm, or 10 kN per 40 mm pitch. The 20 mm ideal section needs a relative slip of about 0.0049 mm or less per seam to limit extra twist to 10% of the intact 100 mm reference. | The nominal overlap has 24 mm against 31.2 mm for two trial 15.6 mm bolt-edge reservations. The inner web ligament is 12 mm. Two straight perimeter rows leave only 1.6 mm overall height spare before tolerance and weld. Bolt shear alone gives no stiffness or slip proof. |
| Permanent recessed closing web | Retaining a 32 mm blind pocket inside the room-side face gives 72.67–80.89% of intact stiffness for the tested 12–40 mm welded webs. The best sampled web is 30 mm. | This keeps a closed cell during servicing at the cost of reduced enclosed area. Verify both transitions, fatigue and local combined actions before using the web as a load path. A blind pocket also changes the pin interface to an accessible face-side connection. |
| Separate air sleeve and lid | The Ø46 mm tool plus 5 mm radial setting needs a 56 mm opening. The former 45 mm hole is 11 mm short. The straight route crosses the ordinary q489.5 receiver at z6572–6628. The q550 membrane stops above the tool sweep at z6640. A 120 × 76 mm clear sleeve leaves 2 mm upper flange land against a 10 mm trial. Lifting the return from z6640 to z6650 gives 12 mm, but the flange still overlaps the ordinary C-O70 ceiling elevation by 68 mm. | Provide a local removable ceiling opening and an independently resealable air lid to develop this route. The tested 60 mm underside elbow envelope exceeds the 37 mm local ceiling drop. Locate the actual corner solids and demonstrate seal compression, fastener reach, removal and reinstallation. |

The envelope comparison borrows the [ordinary eave return and ceiling datums](../mat/ordinary-eave-joined.md#connected-section-and-actual-stops) for a prospective corner assembly. Keep all service parts roomward. The trial retains the 70 mm glass and 50 mm drained cavity reservations there. A 5 mm intrusion into the glass zone leaves 65 mm and fails the retained width. The corner glass toe, continuous return around both faces, drain and air lid remain to be demonstrated together. The roof ring and floor portal remain unselected.

The 30 mm permanent web shifts 37 mm at its median line. Two 128 mm tapers bring the modified piece to 356 mm overall. The first possible pocket centre in a straight arm is 328 mm from the corner axis when the existing 300 mm cassette is kept intact. At the full 10 kNm arm probe, gross cell shear flow rises from 250 to 306.75 N/mm through the pocket. Integrating the local torsional compliance adds the equivalent of 50.56 mm of intact arm. A two-arm spring check at the authored nearest support distances transfers up to 0.0534 kNm more to the adjacent arm if one pocket is introduced and the far ends are fixed. Retain the original full 10 kNm on the pocket arm for local sizing. The simplified split leaves out the house ring, walls, floor and coupled movement. The near-corner pin would need a new cassette and a separately demonstrated vertical restraint path to the cap.

A room-side removal sequence would remove the local ceiling panel, open the separate air lid, withdraw the pin towards the room, and reverse the sequence to restore the air seal. A trial q-oriented double-shear fork uses two 8 mm ears, a 10 mm eye and two 2 mm fit gaps. Its 30 mm stack and 5 mm rear seating reserve exceed the 32 mm recess by 3 mm. A 5 mm room-side projection creates 2 mm spare beyond that stack. The trial 40 mm straight extraction leaves 2 mm spare in the 42 mm run to q489.5 and 2 mm radial spare in a 60 mm high pocket. A flanged air sleeve requires at least 140 mm of removable ceiling-panel width before perimeter framing. These envelopes give a workshop comparison for a redesigned receiver. The pin, retainer, force introduction, corner steel, full tool sweep and repeated seal compression remain unverified.
