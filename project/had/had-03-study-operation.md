# HAD-03 — the Study can close its retained door

**Result: retain the current low-hinge handing as an eligible comparison.** A blocked route with the door held fully open does not establish that the room needs a reversed door. A connected sequence enters the existing east-side pocket, partly closes the leaf, passes around its free end with continuous contact, changes face grip and finishes closing. It then reaches the chair side and reverses to the hall.

The price of this particular witness is an **explicit two-grip, two-hand handover**, with small geometric margins. It is not a one-handed, comfortable, inclusive or installed-door result. The comparison keeps the existing 600 mm reach proxy; no enlarged reach assumption is needed. HAD-03 remains planned and incomplete.

The [A3 operation sheet](studies/study-operation.svg), [exact numerical record](studies/study-operation.json) and [reproducer](studies/study-operation.py) describe this bounded result. They also distinguish the source chair reservation from one real chair envelope and test a reversible chair movement before a west-window approach. The source desk remains in place.

A [fair handing comparison](#one-unchanged-contact-does-not-require-rehanding) now adds a second retained-door route: go around the stationary open leaf **before** first contact, then close and reopen with the same authored face contact. It preserves the earlier two-hand witness. The [separate comparison sheet](studies/study-handing-comparison.svg) and [numerical record](studies/study-handing-comparison.json) show why removing that witness's handover does not require a hinge change. Neither route establishes one-handed physical operation or how the initial stationary opening state is maintained.

## Source authority and the actual room

The basis is accepted `RH-LAYOUT-REVISION-02`, starting main `9f1e6f8b4df6e9df4e617238a75b3e202f93b191`. It is **not** the different L-shaped Study and relocated opening in joined STR candidate B. The generator pins the [accepted layout](../../compiler/reference-house/georgian/layout-revision.ts), its underlying source/section inputs and [schematic handing implementation](../../compiler/architectural-drawing/opening-symbol.ts). No owning source, wall, aperture, handing, furnishing reservation or lifecycle is changed.

The [S-A room brief](had-01s-private-service-candidates.md#study-and-cloak) retains the Study's L-shaped footprint and current desk/chair reservations. The separate [front Study bay brief](../bcr/bay-brief-result.md) requires whole-room use and release evidence. This comparison supplies part of that room evidence; it does not select its window, support or external working route.

| Source quantity | Retained geometry, mm | Consequence |
|---|---|---|
| Study door | Raw x2400–3300 on north wall y2650; inward, low hinge | The source symbol identifies handing, not an installed 900-wide leaf or frame |
| Desk | x600–2200 / y600–1300 | Only 182.5 separates its south edge from the finished front wall |
| Chair reservation | x1000–2000 / y1400–2300 | A reserved working field, not the solid outline of a chair or person |
| Cloak's Study-facing corner | x3337.5 / y1137.5 | The cloak is not borrowed as Study floor |
| Windows | South centres x1800 and 3900; west centre y1800; each 1000 nominal | All three remain visible; the west wall is not an invented solid storage wall |

The first door sequence conservatively keeps the **whole original chair reservation clear**. That strengthens its positive route result without turning that field into a physical object. The later chair task uses the smaller declared product envelope instead.

## A real leaf, with authored installation geometry

The [JB Kind oak page](https://www.jbkind.com/range/oak), checked on 31 October 2026, lists **KOAK262 at 1981 × 762 × 44 mm**. Its fire-door listing does not rate this proposed assembly or admit its constituent recipe. The plan uses its 762 width and 44 thickness; no frame/head, hinge, latch, finish or material selection follows.

Author the same bounded frame arithmetic used in the earlier room comparisons: 762 leaf + two 3 mm gaps + two 32 mm jambs = 832 outer frame. Centring that in the 900 aperture leaves 34 packing each side. Jamb clear is x2466–3234; two 13 mm stop reservations give a conservative 742 passage, x2479–3221. These are study allowances, not a retrieved lining section. The hinge is placed at **H=(2469,2587.5)** on the room face, rather than treating the source's mid-wall drawing symbol as a chosen hinge section. The full-depth lining/stop strips are passage reservations; the model does not verify moving leaf or hardware contact with an actual installed frame and stops.

For angle θ, zero closed and 90° open, define along-leaf direction `u=(cosθ,−sinθ)` and normal `n=(sinθ,cosθ)`. The finite leaf occupies local `0≤u≤762`, `−22≤n≤22`. An authored spindle station C lies 702 from the hinge, 60 from the free end. Two contact proxies are **G±=C±84n**.

The 84 normal allowance combines half the 44 leaf with the prior [Bedroom 4 hardware comparison's](had-03-bedroom4-operations.md) 62 projection. Its 102 lever-length bound is also reused conservatively. For body clearance only, the model contains both handles in local `600≤u≤804`, `−84≤n≤84`. **That symmetric rectangle is not a recovered handle shape or an installed hardware/frame check.** Lever orientation, rose, lock, fixings, stop contact and actual grasp positions remain to be bound to the applicable manufacturer drawings. An actual handle cannot be assumed to fit a jamb because this body-clearance bound passes.

## The connected retained-handing sequence

Use a 600-diameter body disc and an 80-diameter capsule around each straight torso-to-contact segment. Both are authored geometric proxies, not anthropometry. Maximum torso-to-contact distance is limited to 600 throughout.

1. **Enter at 90°.** From hall `(6000,3250)`, pass through `(2850,3250)` and `(2850,2200)` to `(2900,2200)`. This reaches the real pocket east of the open leaf.
2. **Close to 80° without moving the torso.** Retain G+ while the first 10° of motion opens space around the free end. Holding this body position through the whole closing arc instead would collide with the leaf; the intermediate movement matters.
3. **Go around the tip while holding G+.** Move to `(3020,2200)`, then `(3020,1484.515317)`, then **P=(2663.485959,1484.515317)**. This last point is 1120 along the 80° leaf axis from the hinge.
4. **Hand over with continuous control.** At P, both G+ and G− are within 426.357 of the torso and both finite arm corridors clear the leaf. Reach the second face before releasing the first. This is an explicit **two-hand** proposition; no one-handed transfer or real grip is demonstrated.
5. **Finish closing from the other face.** Retaining G−, move via `(2663.485959,1396.164957)` to `(2590.901021,1396.164957)`. As θ decreases from 80° to 0°, use torso position `C+(-300(1−θ/80°),−500)`. It ends at `(2871,2087.5)`.
6. **Approach the chair and return.** Pass via `(2871,2000)` to `(2325,2000)`. After the chosen room task, return to the closing endpoint and reverse every preceding stage to reach the hall.

| Stage / relationship | Verified comparison margin, mm |
|---|---:|
| Hall entry, body to finite leaf | 59 minimum |
| First 10° closing, body to handle bound | At least 8.512 |
| Movement around the tip, body to fixed surroundings | 17.5 minimum |
| Around-tip hand/forearm to finite leaf | More than 8.963 |
| Final 80° closing, hand/forearm to leaf | At least 21.267 |
| Closed chair-side approach, keeping the entire reservation clear | 25 minimum |
| Largest face-contact reach over the complete sequence | Less than 550; within the 600 proxy |

No arm-to-leaf penetration is exempted. Straight torso movements check their complete segments. With a fixed grip, the union of all moving forearm centre lines is the whole triangle swept between the two torso endpoints and that grip; the generator tests that triangle, not just endpoint poses.

The two rotations use 1001 and 1601 sampled states plus explicit continuous bounds. The largest leaf, handle-bound and contact radii bound their movement between a state and its nearest sample. The final torso's speed is bounded by `702+300/(80° in radians)`. Appropriate sums of these movement bounds are subtracted from sampled distances, and added to sampled maximum reach. The unrounded corrections and results are in the numerical record. These bounds cover intervening motion; they do not make the geometric person a real occupant.

The adverse control retains the failed chair-side route with the leaf fixed at 90°. Its failure remains true at that state. **The complete positive sequence is why that static finding alone does not justify rehanding.** A simpler real action or a different handing may still be preferable after actual use, hardware and one-/two-hand needs are established.

## A separate chair movement and two window approaches

The [ercol Quaker 1875 page](https://www.ercol.com/en-gb/dining/dining-chairs/quaker-dining-chair), rechecked on 31 October 2026, gives **490 × 600 × 1030 overall**, 450 seat height and 5.5 kg unpacked mass. This is the existing unupholstered dining comparator, introduced here only as a real movable envelope. It is **not an adopted Study chair**, an office-ergonomic result or a material-policy admission. Overall dimensions do not disclose an occupied shape or safe grip; the manufacturer also warns of dimensional variation.

Place that rectangle at x1255–1745/y1400–2000, wholly inside the source chair reservation. Its north edge leaves only **587.5** to the north finished face. The tested 600-disc route behind it fails in that state. The much larger source reservation must not be substituted for this real footprint to manufacture a chair-size conclusion.

With the room door closed, approach the chair's east side from the closing endpoint, via `(2500,2087.5)` and `(2195,2087.5)` to `(2195,1700)`. Compare a temporary **90 mm southward translation** to y1310–1910. An authored east-side contact moves from `(1745,1700)` to `(1745,1610)`, with the body 450 east of it throughout. The complete chair sweep, body segment and arm sweep are checked. The chair ends 10 from the desk, with no assumed under-desk insertion. The source reservation itself is not moved or adopted; this temporary loose-chair pose extends 90 south of it.

The whole movement has **10 minimum nominal body/desk and chair/desk margins**, 150 between body and moving chair, and 450 contact reach. The contact lies on the overall envelope; it is not a measured grasp on the bow or a manufacturer's sliding instruction. Actual hand height, grip, lifting/sliding method, floor protection, force and tolerances are unresolved. Neither the quoted mass nor a geometric contact point proves that the operation is safe or easy.

After this temporary move, the body follows `(2195,1610) → (2500,1610) → (2500,2230) → (800,2230) → (800,1800)` to the west-window approach. The complete route's minimum remains 10; its segment behind the stowed chair has 20. Reverse this route and the 90 mm movement to restore the original comparison pose before reversing the door sequence.

The east/front window also has a connected approach with the chair in place: from the closing endpoint through `(2800,2087.5)` and `(2800,800)` to `(3900,800)`. Its minimum fixed-object margin is 37.5. These are **approach points**, not sash, blind, cleaning or release tests.

The proposed standing point `(1800,800)` at the first south window remains inside the retained desk envelope. Its 182.5 rear strip does not accommodate the 600 standing proxy. This is a blocked **direct standing approach**, not proof that actual window operation is impossible. Desk height, sash trajectory, controls, over-desk reach, shade and release positions remain unselected. The existing BAY brief still requires ordinary operation with furniture in its intended place, separately from clearing furniture for full renewal. No desk-moving, carrying, dismantling or full window-renewal sequence is earned here.

## One unchanged contact does not require rehanding

This continuation starts from accepted Study PR1163 on main `76addac4dfcb64d54ce6a794b07d012de7349435`; the intervening copper result does not change its room inputs. The generator retains the same source pins, finite leaf, handle bound, frame/stop reservations, 600 body, 80 arm and 600 reach proxies. The original operation JSON and SVG remain byte-for-byte unchanged. The comparison changes an authored route and tests an unadopted mirrored hinge; it does not alter the source room or door.

**The initial state is part of the comparison.** Each route starts with a leaf already stationary at its declared angle and assumes it stays there throughout the unheld entry and reversed exit. Neither proves how the person opens or parks it, or controls it while walking around the tip. No hold-open device, stop, detent or closer is inferred. Zero angle means geometrically closed, not proved latched; reversing the geometry does not qualify actual unlatching. Contact acquisition, hand orientation, force and released-leaf control also remain unresolved.

### Retained low hinge, with contact acquired after the approach

Keep the low hinge and the leaf at **90°** for the whole initial approach. Enter along
`(6000,3250) → (2850,3250) → (2850,2200) → (3020,2200) → (3020,1385.5) → (2530,1385.5)`.
The body has now passed around the free end without holding the leaf. Acquire the authored **G−** at this final position. During the modelled closing motion, use
`P(θ)=(clamp(C.x,2530,3000), C.y−500)` for θ from 90° to 0°. Retain that same G− throughout; this particular motion has no face change or handover.

The closed endpoint is **(3000,2087.5)**. Its explicitly checked horizontal connector reaches **(2871,2087.5)**, the earlier task origin. From there, follow the unchanged chair-side route through `(2871,2000)` to `(2325,2000)`. The earlier chair-stow/window-approach tasks also retain their own exact geometry and state limits through this connector; any moved chair is restored before returning. Return to the new closed endpoint, reacquire the same authored contact, reverse P through 0° to 90°, release at the assumed stationary leaf and reverse the entire entry route. The reverse movements trace the same swept sets; they do not supply missing latch or parking evidence.

| Relationship in the second retained route | Verified proxy margin or reach, mm |
|---|---:|
| Complete unheld entry/exit, body to fixed surroundings | 17.5 minimum |
| Closing/reopening, body to fixed surroundings | At least 37.193 |
| Closing/reopening, body to finite leaf / handle bound | At least 135.454 / 67.204 |
| Closing/reopening, forearm to finite leaf | At least 2.194 |
| Closing/reopening, forearm to fixed surroundings | At least 57.446 |
| Closing/reopening, maximum face-contact reach | Less than 521.216 |
| Closed connector to earlier task origin | 37.5 minimum fixed margin |
| Full closed chair-side route | 25 minimum fixed margin |

Straight body paths use exact swept-segment distances. The rotation uses 1801 states plus conservative nearest-sample movement bounds. Clipping C's x-coordinate to the fixed strip is nonexpansive, so the torso's speed is at most 702 mm per radian, including both clamp corners. The contact speed is `sqrt(702²+84²)`. A forearm segment's movement is bounded by the **larger** endpoint speed; add the finite leaf's `sqrt(762²+22²)` speed for their relative separation. Appropriate sums likewise bound body/leaf, body/handle and reach. These corrections cover all intervening angles, including the reverse motion. The **2.194 mm** lower bound is a narrow mathematical proxy margin, not a construction tolerance or comfort result.

### What the mirrored trials actually establish

Mirror the hinge exactly about the aperture centre x2850, giving **H=(3231,2587.5)**. Keep all other geometry and proxies. Its basis becomes `u=(−cosθ,−sinθ)`, `n=(sinθ,−cosθ)`. The room-facing contact when closed is now **G+=C+84n**.

| Mirrored state or tested route | Result and limit |
|---|---|
| 90° open, same room-face contact | G+=(3315,1885.5), only 22.5 from the cloak face x3337.5. The radius-40 capsule at this endpoint overlaps the cloak by **17.5**, independently of torso position. That exact contact cannot earn a complete 90° loop under these proxies. |
| Separate 85° initial state and one proposed turn | A dogleg entry through `(2800,3250) → (2800,2350) → (2700,2350) → (2700,1388.171322) → (3000,1388.171322)` clears the body. However, the proposed `P=(min(C.x,3000),C.y−500)` turn already fails at its starting forearm: its centreline is 34.696195 from the finite leaf, less than the 40 radius, giving **5.303805 penetration**. This fails the particular path, not every possible 85° path. |
| Geometrically closed, earlier west-window approach | The mirrored body-only handle bound becomes x2427–2631 / y2503.5–2671.5. At the earlier route's `(2500,2230)` body position, its 273.5 separation is less than the 300 radius: **−26.5 body clearance**. The earlier low-hinge window route cannot simply be inherited. This is not a claim that every west-window route fails. |

A clear body entry is therefore insufficient to qualify the subsequent arm/leaf motion. Nor does changing an angle from 90° to 85° establish a physical way to prepare or hold that state. The finite handle bound remains the same conservative body-clearance comparator, not recovered hardware geometry or a handle/frame fit test.

## Decision, checks and handoff

Retain the source handing as eligible. Neither the static fully open obstruction nor a wish to remove the earlier witness's handover establishes a need to reverse it: the retained low hinge now has a connected alternative with one unchanged face contact during closing/reopening. Carry **both** valid retained witnesses, their different contact sequences and small margins into the actual room/doorset decision. The longer unheld approach in the second witness is a real qualification to resolve, not evidence of easier one-handed use.

There is no basis here to prefer rehanding on the contact criterion alone. A later rehanded proposal must qualify its own initial-state preparation, complete task route and closed hardware interaction; the failed trials do not make rehanding universally impossible. Actual hardware, grasp, latch/force, door control, occupied use and the room's architectural requirements govern a later preference. No occupant handedness, accessibility requirement or comfort advantage is invented from the margins.

The source shell, room, apertures, desk and chair reservation remain authoritative. Real door/frame/handle installation and bodily operation may defeat the comparison. The actual Study chair, desk section and first south-window duties still need resolution; source adoption must reconcile HAD, IAS/OAS and the selected BAY/occupation evidence. The separate STR candidate must be retested on its own different room and opening if adopted. No shared BCR matrix, material decision or architectural maturity is changed.

```sh
python project/had/studies/study-operation.py --check
```

Meaningful adverse controls cover the fully open direct route, an unstaged closing arc, the west approach before chair movement, the specific blocked front-window standing point, and the distinct mirrored-hinge failures above. The mirrored trial also retains a failed straight entry whose intervening body/handle collision is removed by the stated dogleg; this still does not clear the initial arm. Distance controls include a segment crossing a rectangle and an intervening swept-triangle collision that endpoint tests would miss. Independent segment/rectangle calculations reproduce the new movement bounds and closed-task connector. Source review, independent movement review and A3 rendering cover their separate claims. The integrating PR must also pass the required exact-head repository and publication checks. No software result supplies the missing physical, human or installed-assembly evidence.
