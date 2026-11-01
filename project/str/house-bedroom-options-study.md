# STR-HOUSE — compact bedrooms and an aligned front reallocation

**Decision: develop the compact-front B arrangement as the first 12 × 12 m occupation alternative; reject C as an unchanged-plan substitution.** Two 900 × 2000 mm single beds, the two existing rear doubles and explicitly reduced front storage give a credible four-bedroom comparison without treating four doubles as an established owner requirement. This is a conditional architectural recommendation, not adoption of a household brief, furniture product or whole-house design. STR-HOUSE remains open because its named structural junctions and complete occupied/service interfaces are not yet joined into a selected candidate.

The [paired drawing](studies/house-bedroom-options.svg), [exact witness record](studies/house-bedroom-options.json) and [reproducer](studies/house-bedroom-options.py) preserve the original [B plan](house-plan-study.md) and all its pinned structural inputs. They change no accepted house source, foundation grid, riser or shared generated family. The drawing shows both B floors, actual external opening positions and two C detail comparisons. The accepted house remains RH-LAYOUT-REVISION-02 / RH-LAYOUT-FAMILY-02.

## Source and question

Starting main is `7c0e2c500eea0b6c0e9d495d39ce1d0b03a6b11c`. The JSON fingerprints `house-plan.json`, `house-bedside.json`, `house-supports.json`, `house-quantities.json` and `house-source.json` by SHA-256. Nine of its ten owning blobs still match exactly, including the plan, upstream dimensions and BCR/brief sources. The exception is `layout-family.ts`: `30ef287f…` → `61c2e9c744e05e98838ae01738852d7508282731`, from the section/context rendering changes in #1192, commit `b927525d8b375bdaf4e97d4c8304ed62c8d81628`. The reviewed diff changes section projection and the shared roof adaptor, not these plan dimensions. The standalone generator checks all nine unchanged blobs and that exact reviewed successor for this **2D plan comparison only**. The original `house-source.ts --check` still correctly rejects its older whole-family pin; no roof/section applicability or shared-family regeneration is claimed here. Later source changes require a fresh applicability decision.

The [structural brief](../../docs/reference-house/structural-brief.md) asks for solid rooms with aligned supports **and** a desirable house. The [current house basis](../../docs/reference-house/current-house-basis.md) records four bedrooms; it does not fix four double beds. The previous B study's 1500 mm front doubles were declared comparison furniture. Its adverse 192.5 / 65 mm head-side strips must not be hidden, but they do not prove that every four-bedroom arrangement fails.

This comparison asks whether smaller front beds resolve that particular occupation conflict while preserving B's support order, and whether reallocating space to retain front doubles is a better first step. It does not infer household size, children, guest use or an occupancy decision from furniture count.

## B compact — changes and connected operations

All coordinates are millimetres in the existing southwest-origin plan.

| Occurrence | Original B | Compact B | Consequence |
|---|---|---|---|
| Bed 2 | x1040 / y1062.5; 1500 × 2000 | x1125 / y1062.5; 900 × 2000 | Full-length side minima become 707.5 / 707.5 |
| Bed 3 | x9450 / y1525; 1500 × 2000 | x10033.75 / y1525; 900 × 2000 | Full-length side minima become 648.75 / 648.75 |
| Bed 2 wardrobe | x4055 / y600; 660 × 1500 | x4055 / y1017.5; 660 × 900 | Loses 600 mm of frontage (40%); leaves 600 depth before the south window |
| Bed 3 wardrobe | x7285 / y900; 660 × 1500 | x7285 / y1017.5; same size | Moves 117.5 north; leaves the same 600 window-front depth |
| Bed 2 bedroom door | Unbound operation at x3450–4350 / y2650 | West hinge; 110° inward opening | Avoids the 90° leaf/wardrobe approach trap under the declared geometry |
| Bed 3 bedroom door | Unbound operation at x8250–9150 / y2650 | East hinge; 90° inward opening | Retains the wardrobe and a connected inside-operation witness |
| Rear bedrooms, stairs, court, void, walls and other furnishings | Original B | Retained exactly | No claimed improvement of their separately stated limits |

The 900 mm beds and 600 mm circle are authored comparison dimensions. A wardrobe front station is not proof of opening its doors, handling clothes or replacing the unit. The west wardrobe is deliberately shortened from 1500 to 900; its 660 depth is retained. This loses 40% of its nominal frontage and 0.396 m² of floor footprint, not a measured hanging/storage capacity. Bedroom 3 keeps its 1500 × 660 envelope and moves 117.5 north. Both now start at y1017.5, 600 from the south finished face at y417.5. The earlier flush-end trial projected 345 into the south-window width and is rejected; zero wall-footprint overlap did not establish an unobstructed window. The revised positions keep the whole 600-deep front band clear at the represented windows. Actual sill, handles, curtains, daylight, fixings and cabinet hardware remain unbound.

The generator computes full-length strips at every finite wall/furniture transition, not only two convenient bedside points. It also retains **16 complete axis-segment route witnesses**: hall to each open-door operating position, then closed-room routes to both lower and head-side stations, the foot, the wardrobe and a window-front station. Reversing each route returns to the coupled operating curve and the hall. The bed-head comparison pieces are included as obstacles. Routes use a 320 mm radius: the declared 300 body plus 20 radial geometric reserve. Bedside stations are 325 from the bed, wardrobe stations 330 from the cabinet face, and window-front stations stand at y740. This avoids treating zero-clearance contacts or the former sub-millimetre approach witness as credible installed operation. Twenty millimetres is an authored geometry reserve, not a validated installation tolerance or human-use allowance.

A 900 mm leaf is represented by a conservative capsule with a 22 mm radius. Intended contact with its own host/frame is excepted; all other fixed walls and furnishings are checked. The body follows a reversible coupled curve through 2201 states for Bed 2 and 1801 for Bed 3, with a hinge-speed bound between states. For the **coupled rotating-body curves only**, continuous clearance lower bounds are about **50.21 / 64.08 mm**; the leaf-to-fixed-object bounds are **27.65 / 42.61 mm**. Handle points remain within the declared 600 mm reach, at maxima **461.01 / 557.59 mm**. A mathematical circle, reach point and capsule do not represent limbs, grasp, force, a usable door closer, actual hinge projection or human comfort.

The 110° choice matters. At 90°, the west door's eastern capsule edge is x3472 and the wardrobe's west face x4055: **583 mm**, less than the 600 circle, along overlapping portions of the two obstacles. Shortening the wardrobe’s northward reach improves sweep clearance but does not supply a 600-wide approach through that throat. A door/product that cannot reach the investigated 110° state must be rechecked or the furnishing/door arrangement changed. The original 90° state is not silently credited with the successful 110° route.

The source front windows at x1800 / x3900 and x8100 / x10200 remain in their openings. Both cabinets stand 600 back from the south finished face; their 345 mm projected overlap in x is therefore separated from that clear front band. The new window-front circle stations are connected routes, not complete window-operation tests. No new daylight calculation, window-handle action, escape assessment or furniture-delivery result is earned. The original ground shared-room seating, inward court-door clash and kitchen/plant/wet-service limitations remain; smaller beds do not cure them.

## C — paired support-line reallocation within the envelope

C tests moving the two front main wall axes **475 north, y2650 → y3125**, including their connecting ends, on both storeys. It retains the 12 × 12 m shell, court, stair, void, outer apertures and the more northerly L heads. Mirroring below preserves upper-wall alignment instead of casually transferring masonry sideways. This is a declared sensitivity, not an adopted new plan.

The main front depth increases **2147.5 → 2622.5**; the remaining south-gallery strip is **622.5**. A 1500 × 2000 double with 600 side strips and a 600 foot strip occupies a **2700 × 2600** rectangle before any headboard. The drawing locates such a box with only 22.5 mm nominal depth reserve. Both front wardrobes and the headboard pieces are omitted in this favourable bed-box trial. It is therefore a fit sensitivity rather than an equivalent furnished programme.

The lower consequence is decisive for a drop-in substitution. The new ground WC wall occupies y3040–3210 and reaches the service-spine axis x9300. It intersects the original plant-entry aperture y2750–3650 over its actual western 85 mm of depth, leaving **290 / 440 mm** aperture remnants. Neither takes the 600 circle. Retaining only the upper movement instead would put the upper wall **475 mm sideways** from its lower support. An arch in the old wall cannot move that load sideways.

C also changes the south bridge's short-member support at the front wall. Moving that seat from y2650 to y3125 puts it north of the void's y2735 edge: the earlier short side-member enquiry cannot be copied over the initial **390 mm** of the bridge. A cantilever, longer member or different support would be an explicit new design. The southeast north/south floor field length increases 475; the north/south gallery comparison shortens 475. West east/west room fields retain their span direction but their field boundaries and landing dogleg change. Original span/reaction records must be regenerated if this reallocation is developed.

The exact whole-wall reservation convention gives C **97.829375 m²** ground remainder before stair deduction, against B **97.990875 m²**, and the same **99.185125 m²** upper remainder before stair/void deductions. Internal ground core footprint rises **6.6126625 → 6.7456625 m²**; at the existing limited 3100 height this adds **0.4123 m³ gross core**, before all opening deductions. Upper core footprint is unchanged. These are union-of-rectangles planning quantities, not furnished usable areas, tender quantities or a foundation action calculation. The larger front-room allocations redistribute existing space; they do not create more house area.

**Reject C as an unchanged-layout substitute.** It has not supplied the wardrobes, plant access, equivalent doors or revised bridge/floor support. Developing it remains possible through actual ground-room/service reallocation and new support geometry. A larger shell is not needed to establish that conclusion, and no footprint expansion is recommended by this study.

## Whole-house structural consequence and next decision

Compact B preserves the exact B wall/support topology and material reservations. Its ground/upper remainder areas, 37.9236175 m³ gross internal core screen and all earlier load-path quantities are unchanged. Bed/wardrobe self-weight and moving-use actions are not calculated or credited as reductions. The conventional enquiry remains cellular masonry, source-specific hollowcore junctions, local permanent frames and a tied steel roof; the exposed-vault alternative remains at its earlier stated scope.

| Boundary | Compact B disposition | What prevents a whole-house selection now |
|---|---|---|
| Gravity to foundations | Named floor/roof reactions → aligned walls or finite local frames → lower arches/piers → supporting grid | Actual bearing/upper-wall transmission, frame seats, arch actions and complete ground support interfaces remain unbound; STR-GROUND supplies its separate candidate constraints |
| East spine | Preserve the existing 140 mm core enquiry and supplier-specific tied intact bay | The intact bay is not the one-sided riser bay; actual units, core alignment, wet infill, erection and upper-wall transmission must agree |
| Bridge/stair | Preserve reduced 1800 court-south doorway, outside-void members and lowered-window/header comparison | Finite seat/protection/landing and nosing-headroom surfaces need one joined detail; no capacity is inferred from an occupancy box |
| Riser | Preserve x9410/y4700 gross riser and current cabinet/trim comparisons | Actual receiving floor, permanent cabinet support, closure, protection and service withdrawal must fit the same section; the standard 200-depth comparison cannot retain the old floor budget silently |
| Arch thrust and lateral restraint | Named ties/collectors and wall/base destinations remain necessary | A slab tie is not automatically an arch tie; DPC shear/sliding, finite anchorage and temporary-stage paths need actual constructions |
| Roof heel/corners | Preserve tied cross-ring and diagonal corner topology | Finite corner seats and the complete shared structural/thermal/ceiling heel remain internal design work; no roof or storage volume is spent twice |
| Inhabitation and renewal | Compact front rooms improve the specific bed/door/wardrobe approach problem | The owner's occupancy choice, principal wet-room action, shared-room operation and current IAS/HAD/OAS service interfaces remain at their own evidence limits |

Integration at main `cf466b583a91ed2bd936ad3499cce31ca84a584b` also consumes the completed [STR-GROUND comparison](ground-interfaces-result.md) and the concurrent [HAD local court-passage design](../had/had-03-local-portal-design.md). The former retains an unresolved ground-floor/DPC/support splice; its comparison completion does not qualify the B foundation assembly. HAD's N plus E-W1 proposal reserves 600-wide covered passages and a 300 whole-house relative-level rise on the **accepted** plan. Its x9500 service-spine crossing cannot be copied into B's x9300 spine, and the N family-floor strip intersects B dining furniture in the ordinary state. Actual first release, temporary furniture movement, permanent wall/threshold caps, the suspended floor and independent water containment must be joined before either design can be selected. The compact bedrooms change none of these obligations. Current C in this memo means the within-envelope front-wall shift, not an envelope extension.

**Recommendation:** carry compact B as the first unchanged-envelope occupation alternative while the structural junctions are joined. If the actual household brief requires front doubles, its single-bed premise fails; reallocate whole rooms/services and their supports rather than advertise the present B doubles as fully accessible or accept C's wall shift without its consequences. This condition belongs to adoption; it is not a generic stop on continued structural design.

Missing product/connection, physical and competent-review evidence retains BCR/EPR/PHY/MAT/DPL ownership. The named internal geometry and assembly design still has to be done before those owners can assess a coherent selection. This comparison creates no new assurance register, external contact or material exception, and no lifecycle completion or maturity promotion.

## Reproduction and inspection

The reproducible study environment is **NumPy 2.3.5 and Matplotlib 3.10.8**. The generator checks those exact versions before producing or comparing its deterministic JSON/SVG. No repository dependency or CI permission is changed.

Run:

```sh
python project/str/studies/house-bedroom-options.py --check
```

The original whole-family source check remains stale at the explicitly named rendering change above. This study's narrower current-plan guard is inside its generator; it does not weaken that original check. The generator records exact inputs, full-length strips, the coupled finite door curves and each retained route. Its deterministic JSON/SVG check detects changes; it does not select products or certify a house. The actual SVG was rendered through Inkscape at 2520 pixels and inspected for readable paired-plan correspondence, the actual door states, window setbacks and C collision. An independent internal review reproduced all sixteen segment paths against the finite fixed obstacles and actual door capsules at radius 320; the least spare above that radius is approximately 0.02 mm, so the declared radius-300 body retains at least the authored 20 mm reserve. This is internal geometric review, not independent external assurance. Local typecheck, repository integrity and a direct VitePress build passed. The canonical `npm run check` launch stops at the known TSX IPC `listen EPERM` restriction; full exact-head CI and fresh canonical lease publication preflight remain required before integration.

Recovery note: the predecessor lease pointed to `work/swarm-next-2043-20261031` and a front-allocation attempt. Fresh Git fetch and connector branch search found no such remote branch, and no proposed files were present on main. Its checkpoint was therefore not treated as recoverable output or silently reused. This new comparison preserves the available B evidence and its independent source fingerprints.

**Reference design — not released for construction. Assumptions and outstanding verification accompany the proposal; internal checks do not constitute external assurance or certification.**
