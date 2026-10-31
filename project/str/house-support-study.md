# STR-HOUSE support topology and section reservations

**Unadopted design comparison — 30 October 2026.** This memo and its adjacent calculation give the paired B plan an explicit structural enquiry. They change no accepted house source and claim no member size, loading, capacity, selected floor, selected roof or whole-house pass. The preferred conventional route is a cellular masonry house with hollowcore floors, deliberately integrated local frames and a tied steel roof. The exposed 200-rise masonry vault remains a serious compression-led challenger. Neither family has earned adoption.

The current paired plan includes the x9300 wet/service spine, y6500 bath/plant boundary, y3700 Bed3/plant wall, x7400 rear divider, y8852.5 rear-west wall extended to x4450, its new x4450 return, the rear-east 900 opening x8250–9150, the shifted stair and new front void. The 550×700 gross riser is x9410/y4700; its new 600×750 upper cabinet is x9385/y4675. This memo supersedes calculations using the earlier x9380 spine, y6650 boundary, x4250 rear-west end or unallocated upper service lining.

[support generator](studies/house-supports.py) reads the accepted STR-SPANS JSON and the adjacent current [paired-plan record](studies/house-plan.json), records SHA-256 fingerprints of those inputs and four geometry-owning TypeScript files, retains the relevant paired-plan snapshot, and generates [support calculations](studies/house-supports.json) and [support section sheet](studies/house-supports.svg). Run it again with `--check` to detect changes. These are geometry and declared-model checks, not physical validation. The JSON is authoritative for unrounded arithmetic; dimensions below are millimetres unless labelled otherwise.

## 1. A coherent candidate, with its unresolved nodes visible

The candidate has four separate but connected systems:

1. **Gravity:** actual slab fields and local frames → named structural inner leaves or aligned internal walls → real lower arches/piers where openings interrupt those walls → a supporting foundation grid.
2. **Lateral resistance:** designed floor/roof joints and collectors → named in-plane masonry wall regions → wall-base/DPC interfaces → foundations and ground. A drawn collection of planks is not yet a diaphragm.
3. **Opening-arch thrust:** actual in-plane abutments, or a deliberately located enduring tie/collector, with its force and eccentricity carried to a named resistance. Perpendicular wall returns are not automatically in-plane abutments.
4. **Renewable services:** accessible cabinets, local lowered galleries and removable inserts within actual arched openings. The permanent masonry, prestressing strands and structural topping are not a distribution chase.

This is sufficient to draw the intended load routes. Three architectural junctions remain unclosed: opposed slab ends on a 140 structural wall, the actual finite stair/bridge frame section and seat, and the riser opening beside the spine. Arch thrust closure and the roof heel also need specific designs rather than an abstract assurance that engineering will solve them. These reservations are not a claim that a sufficiently strong product exists inside every drawn box.

Use `q` for the actual distributed field action, `w_u` for upper-wall line load, `R_i` for a finite reaction at support i, `H_a` for local opening-arch thrust, `H_v` for floor-vault thrust, and `T_c` for collector/tie action. Actual values and combinations remain unselected. If a floor-level collector closes a lower arch's thrust, the intervening path must also carry the moment associated with `H_a × vertical offset`.

## 2. Complete HC150 section and real bearing datums

The complete simple allocation is **20 finish +35 upper functions +75 topping +150 hollowcore +55 services +15 ceiling =350**. With FFL+3450, the flat support-level hollowcore soffit is **+3170**, its top+3320 and the finished ceiling+3100. Reserving an expressly hypothetical 10 for the slab/support contact puts receiving masonry top at **+3160**. Ten is not a selected bedding/pad specification or a demonstrated shear interface. The former timber-seat level+3130 has no authority over this assembly.

The35 upper functions cannot also be spent on unlimited camber. One explicit alternative allocation is 20 finish,20 renewable upper interface,75 minimum topping,15 positive camber/tolerance envelope,150 hollowcore,55 services and 15 ceiling. It retains 350 total. The top of topping is+3410; at the supports topping is 90 over a+3320 plank top, reducing to 75 at the hypothetical maximum+3335 crown. The actual combined positive deviation must be no greater than 15 for this reservation to work. Negative deviations, manufacture/erection tolerances, the minimum topping rule and the actual upper assembly still need their own demonstrated limits. The extra 15 of concrete is up to 0.375 kN/m² at the declared 25 kN/m³ comparison density; it is not weightless. The20 upper-interface allowance is not an already proven wet-floor, heating or acoustic system.

The source layers distinguish **3415 finished-face gap,3445 structural-face gap and 3585 leaf-centre gap**. None is an accepted effective span. A trial 100 bearing on each source 140 inner leaf occupies outer 302.5–402.5 and court 3847.5–3947.5. Their centres are 352.5/3897.5, separation 3545; the hypothetical unit end-to-end length is 3645. Each end reaction is eccentric 20 from the corresponding leaf centre. These are occupancy comparisons, not a manufacturer's bearing acceptance.

Two opposed 100 ends consume 200 before their joint. They cannot fit into 140; they leave only 15 within 215 before any joint, tolerances or required anchorage. Actual narrow-wall supplier details, shorter accepted bearings or a locally wider support may solve this, but none is presently selected. A nominal wall centreline cannot provide two independent 100 seats.

For upper masonry perpendicular to plank direction, draw the actual load transfer through designed solid end closures, bedding and/or a separately designed support band into the lower wall. **Do not bear an upper heavy wall on ungrouted hollow ends.** Where a wall runs parallel to adjacent planks, it can instead continue through a properly detailed floor gap. The vertical line-load path then bypasses those planks; floor restraint, acoustic/fire closures, differential movement and the final roof reaction remain separate duties.

## 3. Floor fields: corners and longer strips have real destinations

The paired cellular plan permits the following first support study. It is an arrangement of fields to investigate, not a complete manufacturer panel schedule.

| Field | First direction and named supports | Consequence |
|---|---|---|
| SW main room, south of y2650 | Prefer testing EW, outer-west inner leaf to x4800 bedroom/study/cloak wall | Clear structural-face comparison 4327.5. It avoids ending the south-room slabs on the 140 L-north wall, at the cost of a longer field and real lower door-arch reactions |
| SW L extension, y2650–3247.5 | EW, outer-west to x2817.5 L return | Clear comparison 2345. Upper L-north masonry runs parallel to plank edges and can continue through its own gap |
| Front-west arrival landing | NS from L-north wall toward the stair south header, with actual dogleg closure fields | Only the landing ends at L-north under the rotated-room alternative; no automatic opposed 100 pair there. The eastern dogleg still needs actual finite panel/edge support boundaries |
| SE front room and east gallery | Compare the existing short NS room field with an NS gallery from y2650 to y8290 | Gallery clear comparison 5462.5 avoids opposed ends on x9300, but transfers the opposed-end question to the 140 wall at y2650 if the south field also remains NS. This is not a whole-house cure by rotation |
| East wet/service strip | EW from x9300 to outer-east inner leaf | Clear comparison 2227.5. y3700 and y6500 upper walls run parallel to these planks and may continue in their own supported gaps; riser opening interrupts the field |
| NW rooms | NS, rear-west y8852.5 to outer-north | Clear comparison 2675. Divide the field around parallel x2902.5 heavy wall, preserving its direct lower wall/arch path |
| North central strip | NS, court-north to outer-north | The ordinary 3445 comparison applies. x7400 upper divider runs parallel to the field and continues into its lower divider/1500 arch; it is not silently carried by a spanning plank |
| NE corner | NS, actual rear-east wall y8290 to outer-north | Clear comparison 3200. Actual reactions meet the lower rear-east door arches and piers; no imaginary continuation of the court wall under this corner |
| West gallery beside stair | EW, inner stair trimmer to court-west wall where it exists | At the north end, the new x4450 return supplies a named support beyond the court corner. Its junction with the y8852.5 wall and the field change at the court end need an actual joint/collector |
| Entrance bridge | EW planks between finite side members outside the front void | Named beam/arch/pier reactions below; no assumption that the void-edge centreline is a bearing |

A simple four-sided “all floors span the short way” instruction is inadequate. The SW rotated field, NS east gallery and local stair/bridge frames have different lengths, supports and loads. HC150 is still only a family enquiry for the longer fields. HC200 untopped, a changed floor allocation, a different local family or a revised wall/support arrangement must remain live if 150 fails. No load table is imported as acceptance.

The subsequent [east-spine shared-bearing comparison](house-spine-bearing-study.md) locates an actual supplier tied 140 mm detail against an authored full-width bay and tests centred/eastward/westward 215 mm widenings. It prioritises the supplier-specific narrow junction for further design because widening has concrete bedroom, riser, fitting and door conflicts. It selects no end dimensions, connection capacity or upper-wall transmission detail. The 140 mm option's temporary works, core alignment, full remote bearing and staged upper-wall loading are actual design duties; an invented universal shelf/cap is not an alternative.

## 4. Entrance bridge: reducing the court opening is meaningful

The B front void is x4885–7115, y417.5–2735. The bridge from its north edge to the court-south finished face is **1097.5 deep**, y2735–3832.5. Test EW bridge planks on two side members wholly outside the void. A 200-wide occupancy comparison gives **x4685–4885 and x7115–7315**. Their width is not a member design; the final seat, connection and through-wall bearing patch may be different.

The short side-member alternative bears at the bedroom-north wall aroundy 2650 and the court-south structural wall aroundy 3917.5. The longer control continues from outer-south aroundy 332.5 to the court wall. Either must draw its finite endpoints, upper-wall/end-closure interaction, plank seats and collector connections; the short alternative is worth developing first because the side masonry already supplies a lower wall up to the front bedroom boundary.

| Court door comparison |2400 source opening |1800 alternative |
|---|---:|---:|
| Opening x interval |4800–7200 |5100–6900 |
| Nominal jamb strip within court face 4250–7750 |550 each |850 each |
| Overlap of each outside-void 200 patch with opening |85 |0 |
| Gap from nearest patch edge to opening jamb |−85 |215 |
| Springing / rise / radial ring |2250 /600 /215 |2250 /600 /215 |
| Crown extrados |3065 |3065 |
| Separate ideal parabolic UDL `H/W` diagnostic |0.500 |0.375 |

The1800 case puts the compared vertical reaction patches over nominal solid pier territory and deserves first development. It is a changed door/elevation, not adopted geometry. Its radial outer skewbacks extend 198.462 beyond the aperture jamb, to x4901.538/7098.462 at z2332.692. The outside-void patches therefore miss that radial extent by only 16.538 horizontally. This geometrical fact does not certify load spreading, coursing, pier eccentricity or an adequate frame seat. The2400 case remains a genuine finite arch/spandrel/pier reaction question, not a conventional pier bearing.

The quoted ratios compare ideal **three-hinged parabolic arches under uniform vertical loading**, with W=2V. They do not calculate the circular masonry arches just drawn, concentrated bridge reactions or real thrust resistance. Narrowing the opening does not erase the east/west horizontal reaction. Court side returns run north/south; their participation needs a designed three-dimensional path or a specific tie. An enduring springing-level tie/structural transom is a disclosed tension alternative; a higher floor collector has a different intervening force/moment duty.

## 5. Stair: finite plan fit and vertical seat are separate tests

The shifted clear aperture is x417.5–2817.5, y4432.5–8767.5. The serious short-frame comparison keeps the south header wholly outside that aperture: **y4232.5–4432.5**, centre 4332.5, for a 200 plan width. It must run from the **outer-west structural inner leaf to the court-west structural inner leaf**, so that its inner-trimmer reaction has two vertical destinations. A short line ending at an unsupported trimmer is not this topology.

At the west, this patch crosses the actual window aperture y4100–5100 and must be carried by its structural arch/spandrel. At the east, it ends 217.5 before the court-west opening beginning 4650; the actual finite court-corner/leaf junction still controls. The inner longitudinal trimmer stays **x2817.5–3017.5**, wholly east of the aperture. Its north support is the y8852.5 rear wall near the x2902.5 T junction. The revised door beginningx 3100 leaves 82.5 from the compared member edge; this is space, not an adequate bearing or load-spreading width.

For the west-window 1000 arch, springing 2550/rise 300/radial ring 215, the serious patch has extrados **2973.2–3046.8**. To receiving masonry top+3160 this leaves **113.2–186.8** geometrically. The old centred-on-aperture-edge patch y4332.5–4532.5 intrudes 100 into the clear opening and is not the fit case.

Let `δ` be the header's lowest load-bearing member face below the HC soffit+3170. With the same hypothetical 10 contact allowance, its masonry seat becomes+3160−δ. The arch reserve reduces by exactlyδ:

| Authored downstand comparison δ |Masonry seat |Minimum/maximum geometric reserve over patch |
|---:|---:|---:|
|0 |3160 |113.2 /186.8 |
|50 |3110 |63.2 /136.8 |
|100 |3060 |13.2 /86.8 |
|150 |3010 |−36.8 /36.8 |

Thus a simple 150-deep beam with its **top at the slab-bearing soffit 3170** would conflict with this envelope. A genuinely integrated beam/slab seat may put much of the member within the floor zone, but needs its actual flanges, connection, support and fire protection drawn. The HC150 name supplies no such detail. A revised window arch, a different frame elevation or the longer trimmer topology remain concrete alternatives. The longer trimmer cannot assume plain support at the L-wall endpoint: its 200 footprint outside the hole extends beyond x2817.5, so it requires an actual support extension and its room consequences.

**A direct architectural redesign sensitivity is to lower this window arch with the header seat.** Lower the inner and weather-leaf springings together by 250, from the 2550 trial to 2300, retaining 1000 span and 300 rise. The structural-ring comparator's crown intrados becomes 2600 and extrados 2815; the old 2850 crown is deliberately surrendered. A 250-deep header whose slab-bearing top is 3170 has bottom 2920, with the hypothetical 10 contact reserve putting its masonry seat at 2910. The entire arch envelope also drops 250, restoring the same 113.2–186.8 geometric reserve over the finite patch. With15 protective lining the header underside is 2905. This is a real option to draw before insisting upon an integrated seat. It selects neither a 250 member nor its capacity, and it requires an actual window-frame, facade/elevation, weather-leaf arch, cavity closure and water-management rewind. The external arch assembly is not proven by the inner 215 radial-ring comparison.

With protective lining thickness `p`, the local finished member underside is 3170−δ−p. For the declaredp 15, δ50 gives 3105;δ100 gives 3055. On the lower flight, the tread 6 comparison is y5932.5/z1035 and tread 7 is y6232.5/z1207.5. Clear heights under 3105 are 2070/1897.5; under 3055 they are 2020/1847.5. A correctly outside-aperture member does not cross these treads; this calculation shows why even modest intrusion or a bulkhead extending into the flight cannot be dismissed. The full actual nosing/headroom surface remains the required check.

For the lowered-window/250-downstand option, the protected 2905 underside gives 1870/1697.5 at those same treads **if it intrudes over them**. Its plan footprint therefore remains wholly south ofy 4432.5; that boundary is substantive. At the clear approach before the flight, the same underside gives 2905 from the ground-floor datum. The actual upper landing, guard and arrival junction still need to be bound to the final frame/protection geometry.

## 6. Services: a usable local route instead of an impossible 55 void

The75,190 and 250 bodies are comparison envelopes, not a selected ventilation/plumbing system. They cannot inherit a 55-deep distribution zone. Reserve an accessible **single-body lowered gallery** beneath the structural floor: a 250 body plus 25 above,25 below and 15 removable lid consumes 315 vertically. Its finished soffit is**+2855** below an undropped+3170 structure, or+2805 below a declared 50 downstand. The400 gross plan width contains 250 body,50 each side and 25 side-panel allowance each. Two250 trunks, actual bends, acoustic/fire devices and clamps are not proven by that single-body box.

Choose the south cross-route **y3350–3750**, centre 3550. This leaves 17.5 from the L-wall north finished face 3332.5 and 82.5 to the court-south face 3832.5. The old y3300 route lies in the new L wall. Across the entrance bridge this route passes **below the finite side frames**, with the local soffit lowered by their actual downstandδ. It does not drill those frames. All drops and transitions remain south of the stair aperture; a 2805 soffit over the flight would fail the same headroom comparison much earlier.

For a single 75 body, the same 25/25/15 allowances give 140 gross depth; for 190 they give 255. These do not demonstrate flow, bend radius, pressure, fire separation, acoustic privacy or maintenance reach.

### Study branch through the opening

Use the 900 study arch centred x1800 in the L-north wall y3247.5, springing 2250/rise 225. A removable **175-wide×140-high insert at z2280–2420** sits above a complete rectangular 2250 door assembly and within the curved opening. The circular intrados is at least 2468.15 over the insert, leaving 48.15 above it;30 remains below. It is a renewable transom/service closure, not a chase through the arch or spandrel. Reserve accessible local transition boxes; actual bend/terminal and door-closer/hardware envelopes must fit. An open ventilation slot is not an acoustic/fire result.

### Large plant exit requires its own decision

A 250 body cannot inherit the study's shallow transom. The first simplification is to keep the large trunk in the plant zone and pass separately designed smaller branches through actual opening inserts. That route must establish its actual number and duties, not relabel the 250 system 75.

A concrete architectural alternative is a **900 semicircular plant door arch**, springing 2250/rise 450/ring 215, in the x9300 spine atcentre y3200. It has crown intrados 2700/extrados 2915. A 400-wide×315-high removable transom box at z2310–2625 has 28.11 minimum clearance beneath the circular intrados across its full width and 60 above a complete 2250 rectangular door assembly. This is a higher arch with an opaque/service upper closure; its architectural cost is explicit.

For the step down to that insert, reserve a 900-long×600-wide×900-high accessible transition on each side of the wall: west plan x8315–9215/y2900–3500 and east x9385–10285/y2900–3500. The west reserve clears the court-east finished face by 147.5; the east route remains south of the revised water-reserve start y3900. No actual elbow, handle, fire damper or access operation is selected. The main trunk need not cross every solid room wall. This is a specific service-route enquiry, not an engineered MEP layout.

### Riser: the stacked cabinet does not design the slab hole

The550×700 gross riser x9410–9960/y4700–5400 fits inside the 600×750 upper cabinet x9385–9985/y4675–5425 with 25 nominal margins. Those are gross envelopes, not usable internal free area. The riser's west edge is only **40 from the structural spine's east face x9370**. Do not leave an imaginary 40-wide hollowcore end strip there or cut strands to create it.

Develop a deliberate structural service bay reaching the wall, for example a **700×800 comparison x9370–10070/y4650–5450**, containing the gross riser. Its perimeter still needs a real frame. Preferred first enquiry: manufacturer-designed trimming of adjacent full planks with a finite east-side header and verified reactions. Alternative: a separately supported cross-span frame, with its actual outer-east and spine reactions. The latter can meet the outer-east plant door aperture; that reaction must return to an arch/pier enquiry, not a plain-wall assumption. No member, cabinet free section or wet/fire/acoustic closure is yet selected. This is a genuine architectural/structural opening boundary, not just product sizing.

The [riser-trim continuation](house-riser-trim-study.md) now binds the local strap topology to a current manufacturer detail, locates the two complete reaction routes, and exposes the floor opening beyond the cabinet footprint. It keeps actual bearing/section dimensions unknown, makes the one-sided spine condition explicit, and requires independent cabinet support and a complete floor closure. Neither the local strap nor the frame is selected or assigned capacity.

## 7. Roof: corners have a named mechanism

Keep25° principal faces and the represented eaves/ridge geometry. Ordinary tied cross-ring trusses run outer-to-court: NS in the south/north central wings, EW in the east/west central wings. Their ties, top-plane bracing and wall anchorage resist the actual force system, including uplift and reversals. No ridge-bearing wall is invented.

At each corner, test **two orthogonal boundary cross-ring trusses plus a diagonal tied girder/truss** from outer structural corner to court structural corner, supporting the intervening jack/purlin fields. At the SW reference corner the diagonal connects(332.5,332.5) to(3917.5,3917.5), plan length **5070.0**. Its roof-profile angle is **18.25°**, because it crosses two 25° faces diagonally. Its ridge node is(2125,2125,+7790.9). The ridge is an apex/connection, not an assumed vertical support.

The two finite corner bearings receive combined diagonal, boundary and jack-field reactions; they cannot be represented as one unlimited point on a 140 L-shaped leaf. Locate actual seats, anchors and joints. The same principle mirrors into the other corners. This topology supplies a named route for roof hip/valley regions while retaining unknown member depths, spacing and connections.

The roof envelope is still not a complete assembly. A 300 vertical band is 271.892 normal to a 25° slope. The ceiling lining/member region is+6550 to+6690, and the provisional storage deck reaches+6712. At a structural-support centre 332.5 in from the nominal eave, the represented lower roof trace is about+6655.0, already below the ceiling-zone top. A heel, tie, insulation and storage cannot each inherit the same volume. The next actual roof section must locate their shared or separate roles. STR owns the primary load path and ROF the covering, secondary supports, weathering/thermal layers and renewal; slate/hook interest is not a selected compatible system.

## 8. Collector, arch and foundation topology

Nominate an outer wall-head collector and an inner court collector, connected by actual floor topping/joints/ties and the local gallery/bridge frames. The **stair aperture touches the outer-west wall**: there is no residual floor strip there to act as an automatic chord. A real wall-head member/restraint path must connect the headers and upper wall. Likewise the front void touches the outer-south wall; a collector/restraint spanning the door/void and connected to the flanks must replace any imagined slab chord.

For X actions, test actual EW outer/court walls and transverse internal wall regions; for Y actions, actual NS outer/court walls and spines. Openings, discontinuities, joints, anchorage and material strengths determine participation. Do not count every short return as a shear wall. The narrow west gallery and south bridge must transmit their specific collector actions; their circulation width does not prove that duty.

For the court door, plant arch and rear doors, draw the participating in-plane masonry length first. Where a genuine compression abutment is unavailable, an enduring tie at the actual springing is an explicit alternative. A collector 920 higher than a 2250 springing adds an intervening path and a 0.920H moment demand; it is not the same detail. The new 450 nominal rear-west end strip and x4450 return improve the plan, but still do not by themselves certify an abutment.

Below, the concept is a connected supporting grid under outer/court structural inner leaves, named internal walls and arch piers. It selects no strip, raft, pile or foundation depth. Each base/DPC node must carry its actualN,V,H,M and restraint/anchorage demands. The merged passive-dryness policy requires a robust evidenced damp boundary; it does not specify three barriers. No ground slab becomes a secret tension tie, and no pump, tanking dependency or undercroft is introduced to make this upper-floor scheme work.

## 9. Exposed vault on the same support plan

Keep the accepted exposed challenger: FFL3450, finish 20, hypothetical crown fill 27.5, hypothetical crown masonry 102.5, crown intrados 3300 and rise 200 to springing 3100. The55 service void and 15 ceiling are relocated, not retained underneath. At rise 500 the same crown gives springing 2800. The constant-vertical-offset fill comparison gives average fill 94.167 at rise 200; at the declared 20 kN/m³ this is 1.883 kN/m² before ring, finishes and occupancy. It is nonuniform load and not solved by the separateUDL diagnostic.

On structural-face 3445 or trial-bearing-centre 3545 diagnostics, ideal parabolic `H/W` at rise 200 is 2.153/2.216. The actual vault springing span/geometry must be selected before even this ideal ratio is relevant. A vault spanning outer-to-court pushes those receiving walls normal to their planes; this is additional to local door-arch thrust. Opposite bays, incomplete construction and unequal occupancy do not guarantee thrust cancellation. Foundations/DPCs or explicit ties must close whatever thrust remains.

The same plan makes the vault challenger concrete: repeat vault bays only where the named continuous supports exist; preserve upper walls on direct supported lines; separately design the irregular front corners, stair edges, entrance bridge and riser bay. A barrel cannot be cut around those holes without its own edge/longitudinal mechanism. Large services can use the same lowered gallery principle:315 below a 3100 springing gives **2785 soffit** near that springing before extra frame depth. Selected routes may instead occupy higher intrados territory, but that must be drawn; no chasing of vault masonry or hidden service fill is assumed.

This challenger directly tests the owner's preference. It has more horizontal reaction and service/edge obligations than a prestressed plank enquiry, while the plank solution depends explicitly on steel tension. The comparison is about actual systems and spatial consequences, not a claim that one material is intrinsically safer or calmer for everyone.

## 10. What this earns and what remains

This work earns a bounded whole-house **support hypothesis**: named fields including corners; a genuine court 1800 simplification; finite stair reactions and their section failure threshold; complete 350 floor accounting; an accessible main-service route with two distinct transom cases; a located riser-hole problem; roof corner mechanisms; explicit collectors and thrust/foundation destinations.

It does not earn HOUSE or RECONCILE. The immediate architectural comparisons are narrow and actionable: real narrow-wall versus wider-wall bearing junctions; actual integrated stair/bridge seats versus revised arch/frame topology; actual riser trimming; selected arch-thrust closure and roof heel section. These sit alongside the paired plan's remaining furnishing, access, wet-room and door tasks. Member/arch capacities, design actions, fire/durability, ground response, actual product tolerances and temporary stability are subsequent competent-design duties, not substitutes for resolving those geometric nodes.

The technical family/evidence basis remains the accepted STR-SPANS and STR-MASONRY studies and their bounded primary sources: Forterra/Bison hollowcore data and support details; MPA/PFF hollowcore and composite-floor notes, including minimum topping at maximum camber; SCI tied-truss/bracing guidance; BIA31 arch/abutment behaviour; and the installation/temporary-stability guidance. All new positions, reserve boxes and ratios here are explicitly authored design comparisons. No source supplier or standard has approved this house.

Primary references already inspected in those accepted studies:

- [MPA/PFF, Hollowcore Floor Systems](https://www.mpaprecast.org/MPAPrecast/media/root/Publications/Flooring/p2.pdf): actual plank behaviour, camber, bearing, joints and diaphragm duties. It does not supply this house's selected bearing detail.
- [MPA/PFF, Hollowcore Composite Floor Systems](https://www.mpaprecast.org/MPAPrecast/media/root/Publications/Flooring/Hollowcore-Composite-Floor-Systems_1.pdf): the 75 topping comparator and its maximum-camber interface. It does not prescribe the authored 15 camber reserve used here.
- [Forterra/Bison, Hollowcore and solid floors](https://www.forterra.co.uk/bison/precast-hollowcore-solid-floors/): real support, tie and steel-interface detail families. No diagram is transferred as project acceptance.
- [SCI/BCSA, Trusses](https://steelconstruction.info/topics/design/trusses): tied structural action, restraint and connection behaviour. The roof-corner topology here is an authored enquiry.
- [BIA, Technical Note31: Brick Masonry Arches](https://www.gobrick.com/media/file/31-brick-masonry-arches.pdf): thrust, abutment and stability duties. The circular envelopes and ideal parabolic statics here are separately declared geometric models, not a BIA design or UK approval.
