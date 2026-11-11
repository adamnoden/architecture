# STR-FLOOR-PORTAL — roof shear-key sensitivity, generation 3

Status: **numerical sensitivity evidence only; no detail is adopted for construction**.

This note preserves the finite comparisons that turned the roof-to-RC plan connection
from an undifferentiated "positive key" into a kinematically defined guide problem.
All values below come from exact GitHub Actions executions of
`floor_portal_recovery_probe.py` on PR #1485. The source calculation retains the
actual roof roots, finite floor/portal assembly, unilateral upper contacts and global
six-component equilibrium.

## What failed

The historical L-cap cruciform is 90 x 10 x 60 mm in the old comparator. On the
recovered square-corner model its positive-X wind/suction screen is about 262 MPa,
but the governing +720 microstrain roof movement reaches about 575 MPa. The
pre-outage proposal to shorten/stiffen the key was therefore tested rather than
assumed:

| comparator | L key | +X L root screen | governing +/-720 microstrain L root screen | conclusion |
|---|---:|---:|---:|---|
| square / historical key | 90 x 10 x 60, three cruciforms | 262 MPa | 575 MPa | reject |
| short-key | 70 x 12 x 30, six cruciforms | 182 MPa | 1,089 MPa | reject |
| flex-key-80 | 70 x 8 x 80, six cruciforms | 449 MPa | 635 MPa | reject |
| flex-key-100 | 70 x 8 x 100, six cruciforms | 517 MPa | 635 MPa | reject |
| flex-key-120 | 70 x 8 x 120, six cruciforms | 573 MPa | 613 MPa | reject |

The short key reduces one wind stress only by becoming much stiffer. It attracts
roughly 91.5 kN in the cold roof-strain comparison and makes the imposed-movement
case much worse. Making the plate deeper and more flexible simply trades force for
slip while leaving the elastic root screen near 0.6 GPa. Neither is a solution.

The square-corner reconstruction itself is independently confirmed: it reproduces
the lost predecessor receipts of 9.663 kNm gravity collector torque and
111.604 kNm positive-X collector strong-axis moment.

The half-mesh comparison changes the short-key positive-X strong moment only from
112.426 to 112.447 kNm and the thermal key result negligibly. The gravity strong
moment changes by about 3%, which remains worth retaining as a mesh sensitivity,
but mesh density is not the shear-key failure mechanism. Reducing the idealised
joint rigid zone lowers global positive-X moment/head tension but does not cure the
thermal key demand.

## Kinematic correction: radial guided shear

A roof support does not need to restrain thermal expansion in both horizontal axes.
The generation-3 guide comparator keeps the separate vertical anchors/compression
contact and changes only the plan-shear function:

- each key blade is aligned radially towards the house centre;
- the guide resists the perpendicular, plan-tangential component;
- motion parallel to the blade is deliberately released;
- six L stations remain at local (200,70), (475,70), (725,70) and their swapped-leg
  coordinates, preserving the previously screened bar-station avoidance;
- no friction, accidental end-stop engagement or strength from the released
  direction is credited.

This is the same structural *function* as a conventional guided sliding bearing:
movement is permitted along one horizontal axis while horizontal force is
transferred in the perpendicular direction. It is not an adoption of a bridge
bearing product. Current public comparators include Freyssinet TETRON SK guide
bearings and mageba guided-sliding bearings:

- https://www.freyssinet.com/solution/build/bearings/tetron-guide-and-restraint-bearings/
- https://www.mageba-group.com/ch/data/docs/en_HU/3108/BROCHURE-RESTON-DISC-ch-en.pdf?v=1.10

## Guided results

| comparator | L blade | +X L root screen | +/-720 microstrain L root screen | +X max head tension | released travel observed |
|---|---:|---:|---:|---:|---:|
| radial-guide-60 | 70 x 10 x 60 | 384 MPa | 33 MPa | 94.68 kN | not recorded in first run |
| radial-guide-80 | 70 x 8 x 80 | 552 MPa | 26 MPa | 93.36 kN | not recorded in first run |
| radial-guide-60-t12 | 70 x 12 x 60 | 308 MPa | 32 MPa | 95.24 kN | 5.82 mm |
| radial-guide-60-t16 | 70 x 16 x 60 | **214 MPa** | **28 MPa** | **96.20 kN** | **5.80 mm** |

For the 16 mm comparator, positive-X active L-guide shear slip is only 0.113 mm.
The released movement reaches about 5.8 mm in the +/-720 microstrain comparison;
positive-X wind produces up to about 4.8 mm released movement at a jamb guide.
Those values size a slot/travel check; they are not yet an accepted movement
allowance.

The 16 mm comparator also keeps the recovered square-corner global behaviour:
gravity collector torque 9.920 kNm, positive-X collector strong moment
111.225 kNm, positive-X minimum upper-spandrel gap 24.850 mm and maximum total
translation 8.871 mm. Its result therefore comes from thermal release rather than
from making the whole connected house artificially soft.

## Execution receipts

- Run 43106282991: baseline/square/short-key, joint-rigidity and half-mesh movement
  comparison.
- Run 43106873349: deep flexible-key comparisons.
- Run 43107232034: first radial-guide comparisons.
- Run 43107567715: radial-guide 12/16 mm sizing and released-travel recovery.

The connected historical four-case/all-52-head replay also passes on the recovered
source when judged numerically; changed source hashes are reported explicitly
instead of being mistaken for a numerical regression.

## Required before selection

The current leading comparator is the 60 mm deep, 16 mm L blade, subject to one
final thickness bracket. It is **not selected** until all of the following are
closed:

1. full 579-case signed pressure domain and 110 movement-domain replay on the same
   guided geometry;
2. released-direction travel envelope, slot/end-stop reserve and finite jamb/L
   footprint checks;
3. concrete side-bearing, splitting/confinement and local cap/plate/weld strength;
4. guide material, corrosion pair, sliding/liner detail, debris protection,
   inspection and replaceability;
5. actual vertical coupler/stub/weld stack and lower DPC anchorage;
6. finite bars/hoops and the square-corner cage, then occupied-room/service replay;
7. support compliance rather than the fixed-reference comparison;
8. hardware mass and displaced-RC accounting.

No friction in the permitted direction, favourable roof dead load against uplift,
or accidental contact with a slot end may be used to close another duty.
