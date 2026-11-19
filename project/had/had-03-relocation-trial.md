# HAD-03 — relocation and coupled-operation trials

**Disposition:** conditional design evidence; no adopted source rewind or fitted
room. The original compact en suite remains unfitted. The study continues beyond
the [two rejected arrangements](had-03-ensuite-fit-review.md), but small nominal
clearances are adverse findings, not an acceptance criterion.

## Front-bedroom relocation

The tested front-west strip of Bedroom 3 becomes an en suite above the ground
WC. A new partition at x 8900 gives nominal clear x 7262.5–8837.5,
y 417.5–2587.5: **1575 × 2170**. The retained front window spans x 7600–8600;
its face-to-aperture margins are **337.5 west and 237.5 east**, not symmetric.
No aperture, shell or courtyard changes. Four bedrooms and two en suites remain.

Bedroom 3 takes the former en suite as its entry vestibule. Remove the old
north wall only east of x 9500 and retain the gallery boundary at x 9500. A
westward extension of that vestibule would consume the court-corner approach.
The old door at x 8700 closes. The former upper lining, branch and access panel
at y 3450 need explicit new service dispositions; this trial does not erase them.

A source-sized 2000 × 1500 bed at x 9562.5, y 1017.5 leaves only **70 mm**
between its north-west corner and the retained wall. Three isolated clearance
rectangles do not form a connected route. That furnishing is rejected.

## Smaller actual base and connected comparison

The [Hypnos manufacturer brochure](https://www.hypnoscontractbeds.com/download_file/c3247136-15b6-4036-a286-48200a53d354/6776)
printed page 21 (PDF index 20) lists a ClassicBase **1350 × 1900**; printed
page 27 lists flush-width EuroSlim headboards **90 deep, 1310 high**. These are
actual base/headboard envelopes, not mattress labels or an owner's purchase.
The new comparison puts the base at x 9615–10965, y 1042.5–2942.5 and its
headboard immediately north, ending y 3032.5. Raw side spaces are 652.5 west
and 617.5 east; the south foot space is 625. The north headboard avoids putting
a 1310-high panel directly at the retained 750-sill front window.

The [A3 route sheet](studies/relocation-route-study.svg),
[exact geometry/result](studies/relocation-route-study.json) and
[generator](studies/relocation-route-study.ts) find connected paths to both lower
bed sides, foot/front-window approach, WC, basin and shower's east side. They
use a 600-diameter circular body, 5 mm lattice, valid start and exact collision
checks along every complete axis step. Targets lie on that lattice. SVG paths
retain every turn. A 25 mm grid gave false negatives in the narrow east-side
centre interval; coarse-grid failure is not physical impossibility.

The west bed side is reached around the east side and south foot, not directly
through the blocked north-west corner. The plotted front-window point is only
an approach point: no handle, shading, cleaning or sash operation is accepted.
The route layer omits the moving wet-door leaf and is explicitly state-dependent.
The separate operation comparison below tests entry/closing. Neither model is a
human, carrying, ergonomic, accessibility, fire or installed-product assessment.

## Fixture and door dimensions being compared

| Item | Trial envelope / primary source | What is and is not established |
|---|---|---|
| WC | Duravit D-Code #211509, 355 × 560, x 7512.5/y 1250 | [Manufacturer series](https://pro.duravit.co.uk/pro/html/default/overview-series.uk-en.html?series=7120); support, connection and maintenance remain unselected |
| Shower | Duravit D-Code #720105, 900 × 800, x 7262.5/y 1787.5 | Same series; east approach is required. The 182.5 south gap is not an entry. Actual screen/door, tray step and wet section remain unresolved |
| Basin | Duravit No.1 #074536, 360 × 220, x 8617.5/y 500 | [Manufacturer dimensions](https://la.pro.duravit.com/pro/content/homepage/productos/categorias/resumen/productos~402880943a1b6e1b013a1bd2494e0047.la-es.html?ncat=washbasins&nser=2209&product=6749506); UK availability unverified. Extended bottle trap required; no overflow. Compared with the earlier 270 projection, it buys 50 mm and stays 17.5 east of the front aperture extent |
| Bedroom leaf | JB Kind KOAK826, 2040 × 826 × 44 | [Manufacturer current range](https://www.jbkind.com/range/oak). A stock fire leaf does not confer a fire rating on a sliding assembly |
| Bedroom slider | P C Henderson H100/18A, 1800 track, maximum 950-wide/100 kg leaf, thickness 20–50 | [Manufacturer](https://www.pchenderson.com/husky-sliding-100-sliding-door-kit/). Leaf size is in range; top-rail fixing, mass, privacy, guide and pull are not a selected assembly |
| Wet leaf | JB Kind KOAK232, 1981 × 686 × 44 | Same current range. A smaller leaf buys sweep clearance; no whole doorset rating or installed clear passage is inferred |
| Wet lining | Champion 138DL, finished 28 × 132 | [Own-brand catalogue, page 27](https://www.championtimber.com/media/downloads/Champion_Timber_Brochure_23.pdf). With authored 3 mm leaf gaps, frame outside is 748 inside an 800 rough opening; rebate, hinge, stop and wet lining remain actual details |
| Compact knob | Eurospec SSK1062, 62 × 62, projection 68 | [Manufacturer historical catalogue, page 126](https://www.carlislebrass.com/media/ebrochure/file/c/CarlisleBrass2016-2017.pdf). With half a 44 leaf, a 100-radius planar envelope conservatively bounds the dimensions. Current supply, latch, privacy and emergency release are unselected |

Manufacturer material retrieved 29 October 2026. The narrower basin avoids the
previous basin/WC diagonal choke, but local wet layers and actual trap/tap access
remain obligations. This is a comparison schedule, not procurement authority.

The bedroom's 750 final clear aperture is y 2925–3675. An 826 leaf gives 38
end overlaps when closed at y 2887–3713, then travels 788 to park at 3675–4501.
A proposed service-panel start at 4650 leaves 149 nominal clearance. The 1800
track, hanger positions and guide cannot be equated with the leaf's parking
extent. A provisional 75 gallery projection leaves 1195 from the existing 1270;
actual flush pulls, trim, attachment and service-panel operation must earn it.

## Coupled wet-door comparison: useful, fragile, not adoption

The [operation script](studies/wet-door-operation.py) and
[retained witness](studies/wet-door-operation.json) model a 686 × 44 leaf with
north hinge at (8837.5,1693), within the 800 rough opening y 950–1750.
The 28 jambs and 3 leaf gaps give jamb faces y 1004/1696. For body passage,
the model conservatively adds 12 mm stop intrusion at each end across the full
wall depth, giving a **668 mm throat**. This is a body exclusion comparison,
not a buildable full-depth stop or a leaf-to-frame closing detail.

The moving leaf is bounded by a 22-radius capsule. The compact knob is a separate
100-radius envelope at station 620 along the leaf; a normal long lever is not
silently represented by a small circle. Rotation edges check the whole swept
five-degree sector/arc; translation edges check whole 10 mm segments. Start
collision is asserted. Rotation requires an authored maximum 600 centre-to-knob
reach. Arms, grasp, strength, height, toe clearance and actual hardware are absent.

The witness enters from the bedroom, opens the leaf, moves into the southern
basin zone, and closes it before proceeding to the shower. It does not claim
simultaneous shower access with the leaf fully open. Both radius 300 and 305
find a witness; radius 310 does not on this grid. **That is an adverse, fragile
nominal margin**, not an installed-door tolerance or proof of impossibility at
310. A larger room or different allocation is preferable to making acceptance
depend on this numerical threshold. Fixed WC/leaf sweep is separately checked;
frame/stop/hinge contact remains unresolved.

## Storage, stack and continuation

The same Hypnos brochure, printed page 24, offers a **1350 × 1900 SuperStorage**
base with a foot-lifting lid and a 395 mm closed height including castors/glides.
It is a real folded-clothes/linen alternative. The opening sweep, mattress mass,
operator and headboard interaction are not dimensioned here. It supplies no
hanging wardrobe. A full wardrobe placed in the compact trial's circulation
cannot be silently omitted or counted twice as clear floor.

The second-stack reservation is x 7262.5–7512.5, y 1250–1650, **250 × 400**,
above the ground guest WC. It stands in the room, not inside a 125 partition or
55 floor void. The downstairs basin ends y 1000, leaving 250 nominal separation.
The upper west face adjoins the entrance void: there is no dry gallery behind
it. Maintenance must be from a genuine room face or an explicit fixture-release
sequence. Vertical capacity, supports, vent, cleanout, leak declaration, floor
penetration and reinstatement are not certified by alignment. Existing wet-floor
build-up deficits and the ground WC door operation remain unresolved.

Preserve this front-bedroom trial as conditional evidence. The [next comparison](had-03-bedroom4-allocation.md) develops a more generous
room allocation within the accepted shell, moving the second en suite to the
larger Bedroom 4 while retaining four bedrooms/two en suites.
That changes the room association and requires a new visible service route;
it must earn its bedroom, wardrobe, shower and maintenance fields. No owner
preference, source adoption, current-house applicability change or HAD-03
completion is inferred from either comparison.

## Reproduce

```sh
node --import tsx project/had/studies/relocation-route-study.ts --check
python project/had/studies/wet-door-operation.py --check
```

Independent review checked product dimensions, the disconnected large-bed
counterexample, lattice/segment geometry, door sector mathematics, handle bounds
and stop omissions. Findings changed the model rather than being hidden in a
positive room label. The original source remains the current house.
