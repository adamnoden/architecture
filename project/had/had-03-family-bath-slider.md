# HAD-03 — a reachable inside pull for the family bathroom

**Result: retain a leading portion of the sliding leaf in the opening and route entry around it.** This supplies a complete *geometric proxy sequence* from the hall, through inside closing, closed-door fixture approaches, reopening and return. It keeps the fixtures in place. It does not select a doorset or complete HAD-03.

This is a continuation of the **unadopted joined STR comparison B**, whose [plan study](../str/house-plan-study.md) explicitly leaves the family bathroom's inside operation unresolved. It is not a repair or adoption of accepted `RH-LAYOUT-REVISION-02`. The [generator](studies/family-bath-slider.py) pins that accepted layout file and the exact [joined-plan record](../str/studies/house-plan.json); neither source is changed. The [three-state A3 drawing](studies/family-bath-slider.svg) and [numerical record](studies/family-bath-slider.json) describe this local proposal.

## What changes, and what it costs

The joined proposal places a surface slider on the gallery side of the x9300 wet spine. A panel parked entirely south of the opening can hide its room-facing pull behind solid wall. An open route to the fixtures therefore does not establish that an occupant can close the door from inside.

Keep the raw opening at **y5450–6350** and the four existing fixture/cabinet rectangles. Author a **1000 long × 44 thick** panel at x9156–9200, **15 off the gallery finished face x9215**. Its closed interval is y5400–6400, with 50 nominal overlap beyond each raw jamb. Its open interval is y4680–5680: the leading edge remains **230 into the raw opening**. The total movement is **720**.

An authored 32 lining at each jamb leaves y5482–6318. The retained panel then leaves **638 of lined opening**, before unmodelled seals, tolerances or hardware. This is a real reduction from the nominal 900 aperture. It is not an accessible-opening or household suitability claim. The panel's height, rail elevation, mass, support, head closure and actual overlap/sealing section remain unselected; a plan overlap is not privacy or acoustic performance.

Place the inside flush-pull centre **150 behind the leading edge**, at x9200. It moves from y5530 to6250 and remains opposite the lined opening throughout. The proposed pull is recessed on the room-facing side; a projecting lever passing behind the wall cannot be substituted. The 15 wall gap and flush-face position are authored comparison inputs, not recovered installation dimensions.

## A connected sequence, including the gallery

The existing x8910 gallery approach conflicts with the newly explicit parked panel: a 600-diameter disc on that line overlaps it by **54**. Move only the temporary approach line to **x8750**. That leaves 106 beyond the same disc at the panel and preserves the court-side route. No wall or source circulation width is changed.

The complete entry path is:

`(6000,3250) → (8750,3250) → (8750,6000) → (9480,6000) → (9480,5880) → (9710,5880) → (9710,5750)`.

The body crosses the reduced opening at y6000, then turns down within the recess before proceeding east. Continuing straight at y6000 would intersect the basin's body-clearance field. Reaching the inside operating stance directly through the parked panel also does not work. The generator checks every complete axis segment against all joined upper walls, objects, court, stair, void, envelope, added jambs, panel and guide; it does not substitute sparse route points.

For closing, let `t` progress from 0 to 1. The pull is `(9200,5530+720t)` and the torso centre is `(9710,5750+130t)`. The hand follows the translating leaf while the torso moves **130 mm** inside the room. The hand/forearm comparison passes through the opening without intersecting masonry.

The model uses a **600 torso disc**, an **80-diameter capsule around the straight torso-to-pull segment**, and a **650 maximum centre-to-pull distance**. These are authored geometric proxies. The 650 reach sensitivity is wider than the existing STR wet-action study's 600 convention; this prescribed movement reaches **630.079**, so it fails 600. Neither value is a human reach standard or a claim about an occupant's ability. A shorter-reach or differently articulated user may need another arrangement. The capsule checks clearance to fixed surroundings. At the pull it represents a contact task; fingers, recess and contact with the moving leaf are not physically resolved.

| Check | Geometric result | Interpretation |
|---|---:|---|
| Complete hall-to-inside entry | 18 minimum reserve | Includes the reduced lined opening and changed gallery line |
| Torso against fixed geometry during closing | At least 24.9675 | Continuous lower bound, not just sampled poses |
| Hand/forearm capsule against fixed geometry | At least 10.1092 | Includes the solid spine and lining; it does not prove a real grasp |
| Torso to translating panel | At least 210 | The panel stays on the gallery side |
| Maximum centre-to-pull distance | 630.079 | Passes the 650 sensitivity; fails 600 for this same prescribed movement |
| Closed-door WC, bath and cabinet approach paths | 15 minimum reserve | One approach and return at a time; no fixture movement |
| Closed-door basin approach | 5 minimum reserve | Very small model margin, with no installation allowance earned |

Each task path starts at the closed-door torso endpoint `(9710,5880)` and returns there. Reversing the exact coupled movement reopens the leaf; reversing the complete entry path returns to the hall. This is one consistent geometric sequence, not unrelated open- and closed-state diagrams. The task endpoints remain *approaches*: sitting, bathing, tap manipulation, cabinet-cover release, simultaneous people and assistance have not been demonstrated.

For the coupled movement, the generator samples 2001 states and subtracts a bound on the maximum movement between a state and its nearest sample: **0.0325** for the torso and **0.18** for every point of the arm segment. Distance to fixed geometry cannot change faster than that movement, so the reported positive lower bounds cover the intervening motion. Maximum reach is checked at both endpoints of the affine relative vector. The numerical record retains the unrounded values.

## Located hardware comparison, with its missing section

Primary product information was checked on 31 October 2026. The [P C Henderson Husky Sliding 100 page](https://www.pchenderson.com/husky-sliding-100-sliding-door-kit/) lists H100/20 and H100/20A with a 2000 track, maximum 1050 leaf width, 20–50 leaf thickness and 100 kg limit. This supplies a real hardware-family comparison for the authored 1000×44 panel, subject to its unknown height and mass. The page identifies nylon rollers/hangers and a nylon floor guide. **This named kit is not an admitted non-plastic assembly**; an alternative or an explicitly authorised material disposition must be established and its geometry rechecked before selection. The steel-track description does not describe every component.

The manufacturer's [102N guide page](https://www.pchenderson.com/102n-guide/) gives 45 long × 25 wide × 16 high. Locate that plan envelope at x9165.5–9190.5/y5517.5–5562.5, beneath the moving panel. All panel positions share y5400–5680; the guide therefore retains **117.5 longitudinal reserve** at both limiting ends and 9.5 at each side within the 44 panel plan. This locates the guide away from the walking opening. It does not turn the whole 25-wide base into an invented rebate: actual blade/slot geometry, engagement, floor clearance, fixing, water-boundary continuity and replacement need a section from the real assembly.

The [Carlisle/Eurospec FPH1000 product family](https://www.carlislebrass.com/products/sliding-door-cat/steelworx-rectangular-flush-pull-50816) provides a named recessed-pull alternative to projecting handles. Its manufacturer [Fingertip Catalogue 2016](https://www.carlislebrass.com/media/ebrochure/file/f/i/FingertipCatalogue2016.pdf), printed page 7, lists 102×51 overall. That dated envelope is not a verified recess depth, internal finger space or actual force/ergonomic result. The 80 capsule is a separate authored hand/forearm sensitivity, not the product's cavity size. Exact recess/projection, panel section, fixing and any second pull must be bound to the selected drawing; do not combine dimensions from differing catalogue editions.

The gallery-side rail and parked panel also occupy the service-front territory. Cabinet/panel release and door use must have compatible, explicit states. No handle, rail bracket, privacy latch, emergency release, seal or support is assumed to disappear because it is absent from the plan model. No fire, accessibility or assisted-rescue result is claimed.

## Decision and verification

Carry **retained-edge slider with an exposed inside pull** forward as a concrete alternative to the hidden-pull assumption. Its architectural price is the 638 lined opening, occupied gallery wall and wider reach sensitivity. Before adoption, bind the actual head/support and floor-guide sections, material disposition, usable grip and operating force, privacy closure, release/rescue and real bodily action. The narrow basin reserve must be addressed with actual fixture and user evidence; it is not a tolerance budget.

The reproducer retains adverse controls for the old gallery line, a straight entry into the basin field, the old hidden pull, the 600 reach sensitivity and attempting entry through the closed panel:

```sh
python project/had/studies/family-bath-slider.py --check
```

Independent geometry review, source review, rendered-sheet inspection and exact-head repository/publication CI cover distinct claims. The accepted house, joined STR inputs, fixtures, lifecycle and maturity remain unchanged. Any eventual adoption must use the existing owning-source rewind and reconcile HAD, IAS/OAS, STR and BCR applicability. HAD-03 remains planned.
