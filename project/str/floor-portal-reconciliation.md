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

The twelve staggered H20 lines bend from Z6140 to 6450. Below the Z6215 shoulder they keep **25.05 mm** side cover after settings in the old core. The continuous 3D bar-pair clearance lower bound is **23.18 mm** after settings. The trial embeds Ø38 × 48 CXL20W couplers below the seat and gives each a 2 mm radial weld-toe reservation. The minimum coupler/weld clearance is **21.61 mm**, minimum plate edge reserve **1 mm** and minimum coupler-to-cassette separation **26.31 mm**, all after settings. The original, unstaggered centres leave only **6 mm** between couplers. The adopted geometric reservation allows at most 2.31 mm radial weld toe at the packing screen. A 5 mm external toe would also overrun the plate edge.

Three rounded H8 loops at Z6355, 6394 and 6433 maintain **21 mm** vertical separation and **2 mm** above the highest hoop to the cassette, after independent settings. The exact straight and curved centreline screen tests all twelve bars across the full relative ±10 mm height band. The limiting bar clears by **0.057 mm** after the geometric and sampling deductions. The Z6350/6390/6430 control overlaps by **0.398 mm**. These margins support comparison at the drawn dimensions. Cage deformation, joint hooks, concrete flow around the actual welded sleeves and final tying/installation tolerances still control selection.

The installed packing model exposes a different failure during assembly. Turning each bent bar fully into a fixed, pre-welded plate creates four reciprocal collision pairs at the lower straight leg. Common-angle turning also fails, with **−11.57 mm** screened clearance. The Ø35, 48 mm CXL20/C sleeve avoids rotating the continuation bar, but the straight piece below CXL20W is only 17 mm. It is **31 mm short** even before the Type C locknut and wrench envelope. Develop a separable seat or a different no-rotation tension connection. Verify the weld and carbon-equivalent-specific procedure independently of the dimensional fit. [Leviat reinforcing bar coupler catalogue, pp. 16–17 and 23](https://www.ancon.co.uk/downloads/81/Reinforcing%20Bar%20Couplers%20UK%20IRE%20Edition.pdf)

The trial leaves the original lower pier and DPC as the inherited comparison. Complete the compression transfer, cage bursting and installed sliding law before using the reference joint. The geometric screen carries no product, connection or construction acceptance.
