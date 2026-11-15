# Separated outer supports at the room-side guide plane

**Reject the four-point room-side guide retrofit.** Separating compression, hold-down and plan restraint removes the nested hip obstruction. Concentrating all plan restraint at four existing far jambs leaves too much motion and concentrates the remaining force. Rewind to independently braced wall heads and tied roof segments with deliberate fixed restraints and a defined movement route. Keep the joint selection and house gates open.

## Located guide and hold routes

Use the existing inner concrete face at q402.5, finish at q429.5, and roof ring edge at q442.5. The trial moving guide resultant is at q535 and Z6475, connected to the top of the 180 mm far jamb at q312.5 and Z6515. The bracket therefore transfers over 222.5 mm of plan offset and 40 mm of height, with moments at each actual endpoint. Rotate the old 94 × 46 plan only as a bounding envelope. It occupies q482.88–587.12 and clears the ring edge by 40.38 mm. It reaches 157.62 mm past the wall finish before body tolerances, a cover or tools. The 60 mm engagement from Z6455 to 6515 starts 95 mm below the occupied ceiling. Reserve the access pocket, closures and return of the fire and air lines in a joined section. The existing [room-side roof receiver comparison](roof-normal-receiver-comparison.md) illustrates a similar spatial reservation for an earlier and much smaller force. Its hardware and demand do not carry over.

The eight near jambs contain four compared axial force lines each, at along offsets ±32 and normal offsets ±52 from the head centre. Their steel axial plus two plate-strip compliances are the earlier cap comparison. The roof attachment and concrete cage still need their finite backing, installation order and accessible positive transfer. The released vertical direction retains its separate compression patch. The four L cores retain their distributed direct compression and lose every corner positive tension and guide element, including the generic duplicate corner M24 and bearing row. The ordinary remote M24 and court supports retain their old locations. The existing RC bodies and original mass budgets remain in this first force comparison.

The pinned pressure input includes half of the ordinary upper façade pressure at the roof even away from the four guides. That application is an adverse imposed roof-action comparison. A coupled successor needs an actual load path for the wall heads and twelve portal jambs that lost roof restraint. Model the wall, spandrel and floor receivers explicitly and replace the old façade allocation wherever it no longer applies. Preserve its net force and both moments during the change.

At q535 the ideal tangent magnitudes are 0.8562 and 0.5166, exchanged between adjoining faces. If the four guides alone take the 91.88 kN source face action, at least one must take 33.46 kN, even with arbitrary sharing. A 45 × 20 mm rectangular blade with a 40 mm lever reaches the existing 355 MPa parent-metal comparison at 26.63 kN in bending alone. The original blade cannot take this concentrated control. Moving the old hardware into the room does not resolve receiver backing, the 222.5 mm lever arm at the host, or the architecture of the return.

## Equilibrium and replay

The old compliance kernel uses a bilateral roof hold to make its unloaded base invertible. With every vertical roof interface sign-dependent, vertical translation and both tilts of the roof alone are rigid modes until contacts are selected. The incremental comparison solves those three fields explicitly. It uses three mathematical gauge coordinates to obtain a compliance matrix, recovers the three true rigid movements through the active contacts, and checks zero reaction at the gauge. A contact, gauge or six-axis balance violation withholds the case. The accepted cases retain the previous 0.03 N and 20 Nmm tolerances. A withheld case remains visible and does not enter the force envelopes. Lack of a matching physical wall load path and fabricated receiver applies even to successfully balanced cases.

In the short signed domain, **15 of 21** cases meet the existing balance criteria. The other six exceed the moment tolerance, with a first yaw residual of **40.65 Nmm**. The balanced suction case W(4,4) requires **139.06 mm** released travel at the south guide against a 10 mm reservation, **98.08 mm** normal mismatch between the roof and south released jamb, and **174.08 kN** total tension at the east near jamb. The balanced downward-pressure W(1,1) case puts **90.99 kN** resultant on the east guide. It gives **1,213 MPa** in the old blade calculation and **129.50 mm** released movement at the north guide. These are witnesses from two actual simultaneous signed comparisons. The route fails these bounded inputs without needing strengths or forces inferred from withheld cases. The signs, source pressure applicability and physical installation remain conditional.

All **110** separate compatibility cases balance at the same tolerance, including six strain cases and both 1 mm movements at each of 52 heads. The movement domain peaks at **5.00 mm** released travel and **2.30 mm** absolute plan displacement at an L head. P10 at −1 mm still gives **1455.74 kN** calculated head tension under the prescribed fixed-head control. Maximum global moment residual is **1.43 Nmm**, and the gauges carry no force to the reported resolution. These loaded movement comparisons establish neither ground resistance nor adequate travel under the signed pressure cases. [Source-bound receipt](studies/floor-portal-separated-replay.json)

## Redraw the roof and wall heads

Compare tied roof frames or tied roof segments bearing on continuous, independently braced wall heads. Bring lateral restraint from the wall heads into aligned structural walls or jambs and the first-floor diaphragm, with actual out-of-plane paths for paired portal heads, spandrels and ordinary infill. Locate positive roof retention and the deliberate fixed restraint at accessible supports. Put the required thermal relief within the designed roof joints or segments and balance the remaining reactions without the four projected guide brackets. Make one finite ordinary and one hip/valley section before repeating a full run. Choose where the two systems can move without interrupting the water, fire, insulation and air lines. Show any architectural change explicitly in the owning source before using it at either final gate. [Fixed wall-head and raised roof comparison](floor-portal-fixed-wall-head.md)

Use the existing NumPy 2.3.5 and SciPy 1.17.0 runtime. Apply the two patches in the shown order to the pinned predecessor. The runner verifies that exact commit, modified paths and hashes before importing any native calculation.

```sh
git fetch origin refs/pull/1489/head
replay_dir=$(mktemp -d)
git worktree add --detach "$replay_dir" 7a1b697431e9c1556f426068068b96356d3158ca
git -C "$replay_dir" apply "$(pwd)/project/str/studies/floor-portal-cap-replay.patch"
git -C "$replay_dir" apply "$(pwd)/project/str/studies/floor-portal-separated-replay.patch"
OPENBLAS_NUM_THREADS=1 python3 -B project/str/studies/floor-portal-separated-replay.py "$replay_dir" signed-quick --check
OPENBLAS_NUM_THREADS=1 python3 -B project/str/studies/floor-portal-separated-replay.py "$replay_dir" movement --check
```

The `signed` mode attempts all 579 original signed cases. The `signed-quick` mode retains the native short input subset of 21; it gives a direct reproduction of the signed boundary without waiting for the complete domain.
