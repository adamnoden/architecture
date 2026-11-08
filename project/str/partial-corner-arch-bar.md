# A partial reinforcing bar for the corner-window arch

In the 180 × 215 mm inner concrete arch, the existing four H16 bars exceed the project’s bending limit at just two of the 19 sampled stations. Both are at the end supported by the corner pier. A single H25 bar at the section centre brings the highest adverse interaction from **1.189 to 0.992** when it can develop **98.2 kN** at that end. The bar can finish inside the arch. Its force transfer into the corner pier remains unresolved.

![One partial central bar and bending interaction at the nineteen sampled arch stations](studies/current-house-central-arch-sheet.svg)

## Where the extra steel earns its place

For each of the eight windows, the calculation retains both bending magnitudes and the compression from the same signed load case and member end. The table gives the worst result over four stiffness and restraint comparisons, 96 roof wind programmes, both pressure signs and both locations and signs of the guard point. The model recovers 196,608 window responses across those controls. Its gross concrete stiffness, 25 kN/m³ reinforced-concrete gravity assumption, guards, crown, jamb foot and thermal section are those of the [180 mm width study](outward-arch-width-comparison.md).

| Station from corner pier | Existing four H16 | With partial H25 |
|---|---:|---:|
| 0, near spring | 1.189 | 0.992 |
| 1, first interior station | 1.082 | 0.904 |
| 2, next station | 0.966 | 0.966 |
| 18, opposite spring | 0.647 | 0.647 |

The four continuous corner bars retain their entire longitudinal torsion debit. The H25 receives up to 200 MPa in tension at stations 0 and 1, with ±5 mm setout relative to the centre of the adverse formed section in each bending plane. Beyond station 1 the calculation gives the H25 zero flexural strength and deducts the concrete it displaces up to the free tip. The unchanged jamb reaches 0.712 bending interaction. Maximum adverse link demand across arch and jamb is 186.45 N/mm against the existing 191.29 N/mm comparison. Station checks do not bound intermediate extrema. The signed load path through the knee, pier and foundations still requires reconciliation. [Section solver and case recovery](studies/current-house-outward-arches.py) · [Station results](studies/current-house-outward-arches.json)

## Cutoff in the arch

The trial cuts the H25 at station 12, two-thirds of the way around the ring. The nominal curved length is 972 mm. A reduced radius and a 5 mm early cut leave **872.4 mm** from station 1 to the tip. At the study’s 2.1 MPa bond stress with its 5% reserve, developing 200 MPa in a 25 mm bar requires **626.6 mm**. The 245.8 mm difference exceeds one 215 mm ring depth. This is a length allowance. Curved bond, radial pressure (about 146 N/mm at the nominal radius and full bar force), transverse restraint and shear-induced tension shift need their own checks. No H25 enters the opposite jamb or its footing. The nominal steel inventory is **49.7 kg for all eight openings**. [Cutoff and bar quantities](studies/current-house-central-arch-detail.json)

## Anchorage at the corner pier

The H25 continues along the arch tangent for a nominal 640 mm. Inspection limits of 630–650 mm leave just **3.4 mm** of straight bond reserve at the shortest length. The unchanged near-pier H20 bars intersect the H25 at X1007.5/Z5680 and X1077.5/Z5811.25 in the representative elevation. Both crossings have a nominal steel overlap of 15.5 mm.

One trial shifts the outer H20 lane from 43 to 6 mm at the two affected stations on each arm of the L. Four bars move per corner pier. The shifted portion extends from Z5400 to Z5950, with 400 and 250 mm reserved for transitions within the widened pier band. On the stated centred form contraction and independent steel setout allowances, the calculated surface gaps are **6.5 mm** at the H20 crossings, **5.5 mm** to the existing arch H16s, and **3.3 mm** to the nearest H12 at the longest cut. These gaps only establish geometric separation for that setout. Assigning the full 10 mm form error to one side consumes another 5 mm. The H12 clearance bound then becomes −1.7 mm and separation is unproved. The proposed H10 hoop has 26 mm nominal cold-face cover, falling to **11 mm** with a one-sided 10 mm form loss and 5 mm link error.

Using the same 3,072 historical pier action cards and moment datum, the widened upper L gives 0.828 interaction before the four bars move and 0.813 in the proposed constant-lane section. That comparison excludes the cranks and new local H25 force. The next detail must place the cranks, transverse links and H25 restraint, show where aggregate can pass, retain the necessary cover and carry the 98.2 kN into the pier. House adoption remains open until that transfer is demonstrated. [Pier and anchorage calculation](studies/current-house-central-arch-detail.py) · [Basic anchorage relation, JRC workshop slide 7](https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/05_EC2WS_Arrieta_Detailing.pdf)
