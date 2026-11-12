# Floor, portal and roof connection correction

**Work in progress. STR-FLOOR-PORTAL is incomplete. No successor house is admitted.**

The comparison starts at main `003f61bacebd4cb3294280059b64f1bb5fc87f88`.
It preserves the historical SAP-C1 calculations and the adverse
[floor/portal review](floor-portal-interface-review.md). The owning question is
whether a conventional connected RC floor and real steel/RC roof seats can
replace the geometrically impossible independent movement interfaces without
losing the occupied house, service routes or a complete foundation account.

## Recovery and rejected first detail — 11 November

The first published detail receipt is retained as a **rejected whole-house
candidate**, despite its useful local section and bar-clearance screens. Its
500 mm far-west transition starts at Y8595 while the actual stair ends at
Y8767.5. At that end the circular inner H16 path, H10 link and retained35 mm
nominal cover require concrete to X428.210, intruding10.710 into the stair
opening beginning at X417.5. At the narrow transition start, replacing H8 by
H10 also reduces nominal cover to33 rather than35. Stronger H12/H14 hoops
would reduce it further unless the concrete or bar path changes.

Shortening the transition to300 increases the full-yield adverse bend force
to316.843 kN per half with the original58 mm displacement. Three single
closed H12 hoops offer295.037 kN and fail that screen. A61 mm displacement
raises the burden to329.670 kN. Neither the shorter transition nor paired
stronger hoops is selected; aggregate steel area cannot establish the finite
joint's cover, bend radii, anchorage, shear/torsion combination or assembly.

A simpler successor is now being compared: keep the straight160 mm collector
and widen each jamb inward to240 mm, q222.5–462.5. Its continuous vertical
bars can move to q260.5/424.5, avoiding the floor-bar bends. This costs60 mm
room-side projection at each205 mm jamb and changes its normal centroid from
312.5 to342.5. The180 mm arch remains eccentric by30; the existing floor and
roof axes are10 outward of the new jamb centroid. These offsets, material
unions and actual room/renewal consequences must enter the same calculation.
This comparison is not source adoption or an issued reinforcement schedule.

The restored execution has rebuilt the missing numerical helper from source;
no unverified local prototype from the interrupted session is presumed to have
passed. `floor_portal_frame.py` checks a cantilever against its closed-form
solution and a dense reference solve, exact eccentric-load/work equivalence,
actual relative-link force, plate rigid fields and three constant-curvature
energy patches. `floor_portal_roof.py` removes the old condensed floor,
fixed-base pier and22 absolute receiving springs from the unchanged native
roof. It then splits actual ring elements at all16 cap stations. Condensing
those new degrees of freedom recovers the original roof stiffness to3.1e-17
relative entry error in the local run; all six rigid fields and the physical
cap offsets are independently checked. This is numerical component evidence,
not a completed coupled house or an RC joint acceptance.

## A second physical conflict at the roof

The old continuous jamb reaches Z6600. At the same station the actual outer
steel collector is a220×120×20 closed box, normal q222.5–442.5 and Z6540–6660.
Its bottom plate intersects each205×180 jamb by0.000738 m³ and its outer web
by another0.000164 m³. Across16 jambs that is **0.014432 m³ of steel/RC solid
intersection**, before any purported movement. The upper RC spandrel also
ends at the steel soffit6540 with zero clearance. The specified20-high blade
with±35 vertical movement requires90 clear; the box void is only80 high.
The old statement that a120-high gross envelope accommodates that guide does
not prove an internal receiver.

These are structural-interface contradictions. A floor-only correction cannot
restore a coherent-structure claim while sending the roof contradiction to the
rainwater programme. The successor must model a real separated roof assembly
or an intentional roof seat. The old negative control remains useful evidence.

The current first comparison is an intentional cap seat at each jamb, retaining
all existing22 receiving points until their loads and physical connections are
explicitly reassigned. A6515 RC jamb cap with a25 steel plate reaches the6540
soffit. Trimming the upper spandrel to its6515 crown envelope leaves25 nominal
clear to the locally supported ring. **That25 is a proposed gap, not an earned
movement reserve.** Cap stiffness, uplift, both rotations, the real20 normal
eccentricity, thermal restraint and changing contact must be calculated. A
fully restrained cap is the first simplicity control; moving hardware earns
its place only if the restrained comparison fails. Free/sliding and locked
states cannot be casually treated as an envelope for every intermediate state.

## Retained first collector comparison — rejected at the house interface

[The reproducible detail screen](studies/floor_portal_detail.py) produces
[the numerical receipt](studies/floor-portal-detail.json). This is an
unselected comparison, not an issued reinforcement schedule.

The ordinary body is160 wide, centred on the existing332.5 axis. The outer
750-deep collector uses6H16 at each flexural face; the court650-deep collector
uses4H16 per face. Both retain the separate8H12 plan bars. The ordinary body
therefore costs10 of insulation and10 of room-side projection, not a relocated
structural axis. The proposed face-bar levels also allow actual transverse
H12 slab rows at Z3201/3339 within the existing RC200 slab.

Each of the eight paired-jamb bays has a220-wide local collector, q252.5–472.5,
with continuous large-radius transitions. The face H16 planes become313.5/419.5;
the plan H12 planes311.5/421.5. This passes the continuous vertical jamb bars
without relying on a change of horizontal-bar elevation. The local finished
face would be499.5,70 inward of the old429.5 finish. The ordinary finish would
be439.5. Those costs must be replayed against the two affected radiators,
rear-west low box, window work and all other current room/service occurrences.

The source comparator explicitly uses **16 maximum aggregate**. Parallel-bar
spacing therefore starts at21 under the stated EC2 method; a25 rule for20
aggregate must not be silently substituted. Conversely, a parallel-bar rule
must not be relabelled as a universal gap at every orthogonal crossing.
The screen applies independent5 setting allowances, distinguishes those cases,
and identifies an open vertical placement path through the ordinary cage.
This geometric access path is not a casting trial or a complete local cage.

The fourteen ordinary upper-roof connections use **two permanent M16 studs**
and a220×100 top crossbar; the M24 upper rod stops above the RC. They do not
contain a28 or32 through-sleeve. The crossbar is fitted after concrete
placement. The eight collector corners retain a separate detailing burden;
they cannot inherit the ordinary crossbar screen.

The preliminary adverse rectangular-section bending resistances are262.86 kNm
for the ordinary outer member,165.37 for the court member and278.27 for the
local widened member. Those are zero-axial-force screens without slab flange
or compression-steel credit. They are **not** comparisons against newly solved
house demand. The new cage changes stiffness, mass, support sharing and the
force route, so historical demand alone cannot select it.

The58 normal bar offsets over500 transitions are not free. Two circular bends
retain horizontal end tangents, and their transverse force is calculated from
the actual bar yield force and tangent change. Simultaneous full-yield adverse
signs across both face and plan groups demand193.93 kN per half-transition.
Five closedH10 links in each250 half give341.48 kN transverse steel yield
resistance before combining the actual beam shear/torsion and proving local
anchorage. A clearance-only S-bend drawing would omit this force.

## Coupled calculation boundary

The next calculation replaces the old condensed floor/pier/absolute-receiver
blocks explicitly, rather than adding another collector over their existing
axial and weak-axis stiffness. It retains all jamb translations and rotations,
the actual floor openings, finite strong-axis/torsion response, relative roof
receiving displacement, and the real ground-beam/head geometry. The physical
lower RC spandrels also meet the floor soffit at3170: connecting only16 jamb
centre points while ignoring this continuous material would repeat the error.

Gravity must enter once at its physical origin. The old portal routine already
contains floor strips and ceiling tributaries; the old gross core budgets fill
openings. Their full totals cannot be added. Sill infill must remain a distinct
material origin, and arch/knee/spandrel/jamb/slab/collector intersections need
single ownership. Old uniform roof layer budgets are not substitutes for
the located slate/specials/goods ledger. All52 head reactions, including signed
uplift, horizontal forces and residual moments, must be recovered from the
new coupled response, never used as applied loads.

Validation will include rigid-body and eccentric work equivalence, mirrored
axial-vector transforms, symmetry, all three forces and moments, relative-link
force recovery, component reference solves and meaningful mesh/stiffness
controls. Elastic stiffness alone cannot prove RC anchorage or joint shear.
Site stiffness remains a named input domain; assigning a convenient spring
does not establish it. Specific material/manufacturing acceptance follows the
internally completed design, rather than replacing that design work.

### Detailing references

- [Concrete Centre EC2 detailing](https://www.concretecentre.com/Structural-design/Eurocode-2-concrete/Detailing.aspx): first-generation EC2 parallel-bar and anchorage method.
- [JRC EC2 worked examples](https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/1110_WS_EC2.pdf): spacing, bond and concrete-inside-bend method; this is not a declaration of whole-building regulatory compliance.
- [nVent LENTON UK catalogue](https://www.nvent.com/sites/default/files/acquiadam/assets/LENTON-CAT-CP7J-TaperThreadedRebarSystem-UKEN.pdf): real non-rotating position-coupler geometry for the forthcoming field-splice/assembly comparison. No product is procured or qualified by this citation.

## Connected-house calculation checkpoint — 11 November, generation 2

`floor_portal_house.py`, `floor_portal_loads.py` and
`floor_portal_coupled.py` now assemble the actual ground beams and 52 head
coordinates, finite floor plate and retained trimmers, continuous jambs and
L piers, explicit capillary-break force paths and the extracted native roof.
This is an **unselected calculation checkpoint**. It does not close
STR-FLOOR-PORTAL or authorise the geometry for construction.

The first connected assembly controls check all six rigid motions, exact
relative link displacement, unilateral contact force recovery and global
force/three-moment balance. The added Python CI job installs the two pinned
calculation dependencies and runs the source roof-split control and the same
connected calculation. Green repository health alone does not imply that the
physical join, cage or force capacity has passed.

The source membrane's 1200 MPa modulus and independent 440 MPa shear modulus
remain confined to the actual 200 mm plate. Collector axial stiffness counts
the stated H16 face bars and additional eight H12 chord bars; no nominal
membrane modulus is applied through the full 750/650 mm upstand depth.
Collector, trimmer, slab, L-pier, jamb and clear arch/spandrel mass use disjoint
solid ownership. The 400 × 400 mm wet penetration reduces the old
100.6602 m² floor area to 100.5002 m². The full 174.3483375 kN ceiling origin
remains once. Removed gross portal masonry is replaced by the actual jambs,
arch/spandrel union and retained below-sill infill, rather than importing the
old portal's already included floor and ceiling tributaries.

The roof calculation keeps the source 413.4868209166 kN adverse weather/steel
budget, including its explicitly uninstalled 8.5 kN stock reserve. Current
316L specials, lower trays and beds total 566.7869443 kg and are located within
that budget; the old lead family is not added on top. The actual 220 × 120 × 20
outer and 280 × 120 × 25 court rings are a separate mass origin. Current roof
water dry and blocked-water point origins retain their actual roots and
moments. This is a declared adverse budget and load-location comparison, not a
new measured roof take-off or permission to credit removable roof weight
against uplift.

### Finite-detail findings carried forward

The full-height 250 mm jamb trial clashes with several ground and upper room
objects. The current comparison therefore keeps the original 180 mm jamb
outside a local floor flare: core 222.5–402.5 changes to 207.5–457.5 over
Z2770–3170, holds through Z3920 and returns by Z4320. The two H12 normal planes
move from 260.5/364.5 to 250.5/414.5. Their 400 mm transitions have offsets
−10/+50 mm; the larger transition's radius is 812.5 mm. The full-yield
transverse force is approximately 12.2 kN per H12, requiring an actual
confinement arrangement. The change adds 0.26404 m³ across sixteen jambs
before other solids are unioned. Upper radiator/cabinet and ordinary 160 mm
collector finish-face consequences remain unresolved.

The source L-pier H20 positions clash with the ordinary 160 mm collector
face bars. A separate **unselected** local 250 mm corner collector has been
screened: 45 mm bar transitions over 200 mm at stations 1230–1430, outer H16
turn radius 430 mm, inner radius 162 mm and a 120 mm diagonal concrete
haunch. The finite geometry screen retained all twelve H20 and eight H12
L bars, with 6.43 mm adverse residual after two 5 mm placement errors and
the sampling bound; the inner tied turn has 35.775 mm nominal cover. This
corner geometry is not yet in the coupled model and has not earned shear,
confinement, whole cage or room acceptance. A 100 mm hoop / 150 mm slab-bar
grid fails the parallel-spacing screen; a common 150 mm grid phased by
75 mm is a comparator requiring actual shear capacity.

At each 180 × 205 mm jamb foot, the bounded imperforate DPC comparator uses
two 120 × 60 × 140 mm steel blocks, a 20 mm continuous web and four opposed
blind M16 connections. Its net unbored stock is about 19.36 kg, before
execution details. A lower anchor trial using two 120 × 70 × 25 mm plates
at Z−480 to −455 fails the straight P24 starter surrogate: −11.267 mm
clearance after two 5 mm errors. The threaded studs themselves retained
12.82 mm in that control. The product-headed alternative is not a pass:
Ancon TTH12 is Ø40 × 27 mm, and its published C32/40 minimum cannot be
borrowed for the current C30 basis. Its TTA12 adaptor uses 24 mm M16
engagement, not the opposed-block comparator's 45 mm. Actual bent starters,
ground reinforcement, breakout/splitting and a practical assembly margin
remain to resolve.

At the roof, the 16 jambs stop at Z6515 below a 25 mm cap. A compatible
weldable/position-coupler arrangement below the cap avoids nuts inside the
20 mm box bottom. The four H12 force lines, cap/bottom-plate bending,
compression contact and a finite cruciform key are separate model terms.
The 621 mm development-zone contribution is an explicit conservative slip
surrogate; it is not a measured joint stiffness. Coupler-plus-cap-only and
that more compliant limit still require comparison. Published nVent
EL12P13LN dimensions are OD25 and 124/159 mm closed/open length; the EL12C13N
weldable half needs its specified weld preparation and cannot be credited
from its small unwelded neck alone. Cover, final-pour access, weld strength,
full anchor development and gap closure remain owning STR duties.

Primary product references for these unselected controls:

- [nVent LENTON UK mechanical splice catalogue](https://www.nvent.com/sites/default/files/acquiadam/assets/LENTON-CAT-CP7J-TaperThreadedRebarSystem-UKEN.pdf).
- [Ancon UK/Ireland reinforcing-bar couplers catalogue](https://www.ancon.co.uk/downloads/81/Reinforcing%20Bar%20Couplers%20UK%20IRE%20Edition.pdf).

No generic independent review referral substitutes for the remaining internal
calculations. The immediate next work is the actual coupled demand envelope,
located L-cap compliance, local corner comparison, joint and mesh sensitivity,
complete reinforcement/anchorage and room/service replay on the same geometry.

The first four-case reaction receipt is
`studies/floor-portal-coupled-checkpoint.json`. Its no-favourable-dead-load
positive-X wind/suction comparison reaches 112.404 kN head tension; that is a
calculated demand, not a shaft-capacity or hold-down pass. The independent
review has identified a remaining duplicated lower-core volume inside the
new trimmer downstands, plus a 140 mm-only body/finish fraction used where
source core widths vary. Those corrections are explicitly required before
interpreting a final demand envelope. The recorded source identities, load
resultants and all 52 head cards are replayed by the new CI job.


### Corrected connected comparison after the first checkpoint

The exact source-cell ledger now separates all2965 retained wall-body cells
from their finish origins, using their actual100/140/215 mm core gauge.
The replaced body is221.74150625 kN on the ground storey and285.38071250 kN
upstairs. This includes the2.20550625 kN of actual downstand/core intersections
and0.044 kN of tapered-jamb intersections. Retained pieces keep their own
centroids and the finishes keep their original locations. The upper below-sill
panel also excludes the actual550 mm collector overlap; that removes the
previous15.4 kN duplicate. These are ownership corrections, not load exemptions.

Each disjoint long RC solid now supplies two Gauss load origins on every real
member segment. This preserves its cubic consistent-load field as well as its
force and all three moments. The actual75 mm court slate strip adds0.9075 m²
and2.041875 kN of suction outside the predecessor roof field. It is separate
from the27.8321 m² of added rainwater-goods sky area.

The four outer L roof joints now use their original twelveH20 force lines,
located positive keys and finite compression contact. Splitting the real ring
at all such stations reproduces the original roof after condensation with a
1.292e-13 relative matrix difference. The27 mm shortest ring segment introduces
small absolute cancellation residuals, so its rigid-body control also checks
an explicit floating-point arithmetic bound. No residual support spring is
used. The16 jamb caps retain their real20 mm offset. Both cap families still
need the actual compatible weldable-half, short threaded stub, position
coupler, long-bar and concrete closure. The present development-length series
spring is a named conservative slip comparison, not a measured splice law.

The revised four-case receipt conserves force and all three moments at all52
heads. Its isolated+X wind/suction case, with zero favourable G, has a maximum
head tension of113.3573 kN. This is an unselected demand, not shaft resistance.
The new domain runner retains coherent case names, simultaneous member ends
and six signed components for every head; full/half, signed biaxial winds and
both body-height endpoints are evaluated with changing contact.

The small biaxial section helper follows the existing L-section stress-block
method and the [JRC2014 EC2 worked examples](https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/1110_WS_EC2.pdf).
Its exact clipped-rectangle area/first moments agree with an independent
polygon calculation; reflected sections and120/240-angle contours are checked.
It reports same-N biaxial END-section comparisons. It does not infer bond,
interior moment maxima, second-order stability, links or construction from a
cross-section result. The ordinary160 collector still fails the original L
bar crossing: the local250 corner and finite haunch remain an explicit next
physical comparator, with their room footprint to reconcile.


### Full coherent demand and compatibility checkpoint

The [579-case register](studies/floor-portal-demand-checkpoint.json) includes
three gravity controls and192 signed/partial/biaxial pressure programmes,
each with zero-favourable-G suction, simultaneous factored gravity plus downward
pressure, and simultaneous factored gravity plus suction. Every case recalculates
unilateral contact. All52 correlated head cards and actual link/member witnesses
are retained. The largest head tension in that stated domain is173.1282 kN at
P04. Component extrema have distinct case witnesses and are never summed.
The final summary was reconstructed directly from the saved solve matrices
after repairing a NumPy-index JSON serialization error. An independent
force/three-moment sum of those head cards has maximum residual0.2395 Nmm.

The [end-section screening receipt](studies/floor-portal-section-ends.json)
uses exact same-axial-force120/240-angle contours at the shortlisted correlated
states. It reports0.55944 at a widened jamb end,0.38025 in the outer collector
and0.16218 in the court collector after5 mm adverse bar shifts. These are
shortlisted END checks, not continuous-section, second-order or cage admission.
The collector's separate extreme shear is203.278 kN and torque5.708 kNm.
A preliminary H8/150, cot(theta)=2 flow comparison reaches0.955 with7.7 mm
challenged diameter,160 mm delivered pitch and inward hoop deviations; its
longitudinal chord charge, weak-axis spacing and actual joint schedule remain
unearned. A steel-area pass alone cannot select that detail.

The [compatibility receipt](studies/floor-portal-movement-checkpoint.json)
preserves six dimension-change cases and both signs of a1 mm vertical motion
at every one of52 heads. The six common rigid-motion controls create no
meaningful restraint. Roof free strain±720 microstrain is explicitly a
comparison (equivalent to±60 K only if alpha=12 microstrain/K), not a site
thermal range. Actual member-length and reference-affine forcing give the
same recorded house/head/link response to numerical precision; the unsummarized
ridge displacement still needs its physical finite-offset interpretation. Individual cap/key link forces
reach28.48 kN. Superstructure±300 microstrain is a net dimensional-change
comparison relative to the older grid, not a curing or bond prediction.

The fixed-head reference is deliberately exposed by the movement controls:
forcing P10 down1 mm while the other51 heads remain fully fixed produces
1478.37 kN of head tension. This is a stiffness demand for that kinematic
condition, not a predicted soil movement or an admissible pile load. The
actual shaft/group rotational and translational compliance must be compared;
the model is not allowed to turn this result into a fixed-head site acceptance.

The room replay has also rejected an unqualified square-haunch adoption.
The candidate keeps250 width through1430 before the160 shoulder and uses a
120×120 corner block; its larger footprint reaches the principal-room radiator.
The coordinated radiator/bed, rear-WC/stack and existing small floor-port
relocations are separate explicit design candidates. The original ordinary160
still adds10 mm at every affected finished face. No room or service route is
claimed unchanged.

## Wardrobe swept-path proof correction — 12 November 2026

The recovered room comparator originally asserted that swept path distances were
nonnegative, although its distance function **cannot return a negative value**.
Consequently a wardrobe colliding with a solid returned zero and met the supposed
clearance test. That false-pass assertion is now removed.

The executable room replay distinguishes the one permitted initial mounting-wall
contact from every other swept obstacle. The first move must separate from that
mounting wall; all other swept paths require a positive 5 mm **nominal** gap,
and each step must leave at least 25 mm to its own released wall. Three explicit
adverse controls must fail: crossing another fixture, re-entering the mounting
wall, and commencing within the nominal clearance band.

On the source-bound upper-room geometry, the bedroom-2 and bedroom-3 paths
survive the corrected geometry check. But the bedroom-3 north-wall first-stage
clearance is only **5.5 mm**, leaving **0.5 mm** after the nominal 5 mm screen.
This is not a two-sided setting/handling tolerance allowance or evidence of a
physically executable release. The retained IAS/physical handling obligations remain live; neither
wardrobe receives construction/renewal acceptance here.

A separate **unselected** room-layout comparator translates the bedroom-3
wardrobe's parked position **30 mm south** and translates both first and final
renewal waypoints with it, without moving walls or service sources. The
source-bound sweep then clears the north wall by **35.5 mm** on the first stage.
Its minimum independently checked whole-route gap is **25 mm**, leaving
**15 mm** after two independent 5 mm setting allowances. There is no modeled
furniture collision in that local comparator. This is a concrete route out of
the narrow nominal gap, **not** an amendment to the adopted HAD/IAS furniture
layout; anti-tip handling, mount/fixings, site tolerances and the full inhabited
room/renewal effects remain duties of those owners. A fourth negative control
now also rejects a wardrobe initially penetrating its mounting wall.
The floor/portal joint, anchor, local concrete confinement and final roof hardware
remain separate unfinished STR-FLOOR-PORTAL duties.

## L radial-receiver cover challenge — 12 November 2026

The source-bound complete receiver fit now records a **concrete side-cover
conflict at all four L piers** independently of the successful H20/H12
clearance and elastic hardware screens. Each 140 mm L arm receives a
46 mm-wide full cassette. At the limiting angled 70 × 20 × 60 guide,
the shortest gross edge web is **19.60 mm**, reducing to **9.60 mm** after
two independently reserved5 mm steel-setting allowances. A provisional
25 mm nominal cover comparator is therefore short by **15.40 mm**.
This is a conservative screening challenge, not a statutory cover declaration
or a demonstrated cracking/collapse result.

The current `floor_portal_guide_fit.py` explicitly retains this adverse
control; the 579-case and104-head numerical successes remain meaningful
*for the provisional geometry* but do not certify local concrete anchorage,
durability or constructability. Resolving the L arm/guide footprint and
re-solving the coupled loads and occupied bays is required before this node
can close or ROF-RWT-GATE can be released. No house baseline or material
selection is changed by this failure record.
