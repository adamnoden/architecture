# North drainage crossing: retained support, removable services

**31 October 2026 · STR-HOUSE bounded connected-section comparison · not for construction.** Starting main `6c3c7c6d4c5fabd1112b13b86d309edfa1db4df3`. This answers the structural side of the [segmented copper-access comparison](../rwt/segmented-copper-access.md), alongside the [raised terminal](../rwt/raised-terminal-section.md) and [joined structural proposition](str-house-result.md). The accepted house and the unadopted STR replan remain distinct. No house geometry, floor specification, drain size, arch, material exception or water level is selected.

## Decision

**Separate the permanent doorway support from the removable floor access and the pipe supports.** Develop two retained threshold-support zones and a separately supported, openable room-floor route between them. A drain maintenance operation must not remove the door's support, an arch abutment, a structural tie or a necessary floor restraint.

This also requires a real change to the earlier floor proposition: a hatch above its continuous supporting slab does not expose the pipe below. The room-side portion of that slab must be replaced by a designed opening/edge-support/cover arrangement, or access must come from a different side. Do not simultaneously retain an unbroken structural slab and credit top access through it.

A compression-led threshold arch is a legitimate alternative, but **not a drop-in replacement for the old 100 mm bridge envelope**. The located circular-arch comparisons below clash with the bare copper tube at the retained level. Lowering the drain consumes receiving-level and maintenance space; simply raising the whole house does not remove pipe-versus-arch interference. Keep a conventional bending bridge as a disclosed comparator rather than disguising it as compression-only. No exception to the owner's structural preferences is approved here.

[Connected section and transverse comparison](studies/north-drainage-support.svg) · [reproducer](studies/north-drainage-support.mjs) · [regression tests](studies/north-drainage-support.test.mjs).

## Located territories and load paths

The two retained RWT studies supply the historical north route, not selected construction. Their exact JSON blobs are checked by the reproducer: `segmented-copper-access.json` at `8e1a32d97118faa5697b1f77aaf1a4449a1c5733`, and `raised-terminal-section.json` at `accba05df4cc394732dcbe8e95bdd375a45adca8`. Their underlying house and product source identities remain in those records. A changed geometry requires reassessment; these are not automatic assertions about a successor house.

Recovery against main `2512f116e277d3ab724fd0bcf0f13ba1d04533c3` on 31 October confirmed both source blobs unchanged. The later [inward-renewal comparison](../rwt/threshold-renewal-access.md) locates a separately renewable threshold piece, while the [retained-tail alternative](../rwt/segmented-copper-access.md#a-retained-court-tail-changes-the-maintenance-boundary) and its [secondary leak route](../rwt/retained-tail-leak-route.md) examine a different intervention boundary. Neither supplies the missing floor support or an admitted assembly. This sheet retains its earlier pipe levels and structural trials; do not splice the later alternatives into its dimensions without a new connected-section check.

| Territory | Located comparison | Permanent versus renewable duty |
|---|---|---|
| Court threshold | y7750–8167.5; 417.5 mm | Keep sill/door support and the court's fixed water-boundary penetration independent of the service joint and room cover |
| Family-room run | y8167.5–11582.5; 3415 mm | Give removable covers and their edges an actual load path; expose pipe modules without demolishing a retained slab |
| Garden threshold | y11582.5–12000; 417.5 mm | Retain support/weathering while separately resolving the short crossing and exterior terminal |
| Transverse service reservation | x5675–6325; 650 mm; pipe axes x5800/6200 | Historical clear territory, not a designed structural opening, working clearance or approval of a sleeve material |

The two door apertures are x4800–7200 in this study. Opening the nominal 650 mm room strip affects **2.220 m²** of floor before edge bearings, lids, insulation joints, guards, furniture movement and set-down. It replaces **3415 mm** of the earlier continuous-slab concept; **835 mm** remains in the two threshold bands. Those numbers do not establish a finished access opening or a shorter exterior withdrawal corridor.

Three load paths must remain legible:

- **Masonry above the doorway:** its own structural head/arch, jambs and foundations. Neither the removable sill assembly nor a drain cover is its assumed support. Arch thrust and any ties must not cross a renewal opening without an explicit permanent path.
- **Doorway threshold and occupied floor:** permanent local bridge/abutment or bearing members, independently supported cover edges, and the relevant ground/foundation construction. A cover's appearance or catalogue depth supplies no capacity or thermal performance.
- **Water services:** independent permanent and temporary supports for the carrier and terminal. A coupling, gasket or pan penetration is not an uncalculated bearing or a support for the floor.

The drawing identifies functions and alternative envelopes; **it does not size the abutments, bearings, reinforcement, ties, cover, supports or foundations**. In particular, the unadopted STR replan's moved north division is not permission to assume there are no upper-wall reactions affecting this route. Reconcile the actual selected plan and floor reactions before adopting an opening. Do not cut a jamb foundation or restraint merely because the drain passes beneath a doorway.

## Transverse support comparison

Retain the historical support top at **z−185**, flat-comparator underside **z−285**, and carrier axes **z−420 at y7750**, falling 60 mm to **z−480 at y12000**. The 108 mm bare-tube size and 220 × 220 transverse flange bounding box come from the product-bound RWT comparison. No axial fitting size or complete elbow envelope is borrowed.

The new **authored** arch alternatives have a 650 mm clear span, 215 mm radial ring, and either 75 or 150 mm intrados rise. Their extrados crown stays at −185, so the intrados crown is −400. These are explicit geometry trials, not a minimum masonry thickness, suitable brick bond, designed arch or supplier detail. Their 417.5 mm longitudinal extent belongs to the threshold-band comparison, not a proven barrel-vault construction.

A circular intrados with half-span `a`, rise `f`, radial ring `t` and extrados crown `z_e` has:

`R = (a² + f²)/(2f)` and `z_c = z_e − t − R`.

For a circular pipe of radius `r` at lateral offset `x` and axis `z`, the upper-arc clearance in the checked domain is:

`g = R − sqrt(x² + (z − z_c)²) − r`.

The model checks that the envelope stays inside the vertical abutment lines and in its supported upper-circle domain. It evaluates both pipe axes at all four threshold-band ends, not just the arch crown. The near court end controls these descending, constant-section trials. A lower-bound drop to contact is **not** a release or safe working clearance.

The circles are idealised transverse envelopes; the slight ellipticity from the retained slope is omitted, so quoted decimals are model arithmetic, not installed tolerances.

| Support/envelope case | Near-end result | With an illustrative 10 mm normal allowance |
|---|---:|---:|
| Old 100 mm flat bridge; 108 mm bare tube | 81 mm vertical upper gap | No support or access approval follows |
| Old flat bridge; 220 mm-high box | 25 mm vertical upper gap | Actual bolts, supports and tool sweep remain unknown |
| 215 ring / 75 rise; 108 mm tube | **63.726 mm downward shift to contact** | **74.185 mm** shift |
| 215 ring / 150 rise; 108 mm tube | **92.137 mm downward shift to contact** | **104.049 mm** shift |
| 215 ring / 75 rise; full 220 × 220 box | 157.894 mm downward clearance bound | 168.918 mm bound |
| 215 ring / 150 rise; full 220 × 220 box | 223.314 mm downward clearance bound | 238.052 mm bound |

The box rows are **conservative reserved-envelope checks**, not proof that the actual flange occupies its square corners or needs those exact drops. Its true contour, clocking and retained hardware require the exact assembly. No extra fitting dimension is invented. Conversely, substituting a bare-tube circle for unidentified carried hardware would falsely improve the result. Keeping flanges outside the threshold changes the renewal question; it does not demonstrate how the threshold piece is eventually replaced.

The 10 mm allowance is a sensitivity input, **not** a construction tolerance or sufficient clearance. The flat comparator still requires bending resistance and a real material/member calculation. A masonry arch still requires suitable units, bond, abutments, horizontal reactions, lateral restraint, centering and staged-load design. Neither geometry earns capacity. A shallower ring, wider opening or relocated pipe is a new option to assess, not a silent fix to this comparison.

## Connected water boundary and maintenance state

**W1** is conveyed water in the pipe; **W2** is the retained court/pan/floor boundary around it. Keep the first service joint in demonstrated accessible territory, with a fixed penetration through W2. The diagram's W2 marker is a functional interface whose actual assembly remains unresolved, not a fabricated seal or a dry chamber claim. The [HAD first-failure register](../had/had-03-court-threshold-first-failure.md) still controls vulnerable joints.

The thermal and moisture boundary must remain continuous over/around the permanent threshold support and across the reinstated room covers. It cannot be omitted to gain the 81 or 25 mm geometric gap. The older five-millimetre separation layer is not a specified waterproofing system. Check capillary bypass, wall/floor continuity and the structural effect of any DPC or tray through an abutment; a metal/mineral label alone proves neither duty.

A credible renewal sequence must demonstrate all of these states on the chosen assembly:

1. Independently manage incoming rain and the unavailable drainage path; close the affected northern circulation area to ordinary occupation. An open trench is not a usable passage merely because the door remains supported.
2. Open the actual replaceable room-floor components, retaining threshold bridges, structural edges, wall restraint and W2. Keep temporary pipe support independent of the piece being released.
3. Remove the defined joint/module through a verified complete sweep, including tools, collars and set-down. The two short threshold pieces remain separate renewal tasks. No 417.5 mm removable pipe or indefinitely reusable seal is assumed.
4. Reinstate the structural cover, thermal/moisture interfaces and services, then verify W1 and W2 separately before returning the route to occupation. Actual engineering, hydraulic and physical acceptance remain outstanding.

The owner's protection of **permanent fabric** does not require every replaceable service component to survive its own replacement. A bounded cut-and-renew copper joint in properly accessible service territory remains an honest conventional comparator already retained by RWT. It must disclose the sacrificed material, hot-work/access risks and subsequent joint method; it is not a licence to shorten fixed stubs repeatedly until masonry must be opened. RWT owns the product and process decision. Do not enlarge structural openings solely to avoid consuming a replaceable fitting without comparing that whole-life cost.

## Receiving levels and disposition

The [passive-dryness policy](../../docs/reference-house/ground-water-policy.md) governs the complete section. Lowering the carrier to clear an arch moves its outlet, leak escape and access duties downward unless some other relationship changes. Re-derive the actual collector and receiving-water ledger; no earlier −585 receiving target or 435/550 house raise is an accepted answer for this changed route. Raising building and arch together leaves the internal clash unchanged, although it can change the relationship to a fixed external receiving level.

Do not excavate a deeper wet service well and rescue it with pumps or inaccessible tanking. Under blocked primary, relevant flooded receiving conditions and maintenance, water must still have a demonstrated safe destination. The trial arch's geometry alone cannot decide whether the raised or rerouted whole-house section is preferable.

**Advance:** independent retained threshold support plus a genuinely openable, supported room-side route; keep the conventional bridge and masonry arch as explicitly different structural alternatives. **Reject:** a lid above an unbroken slab as pipe access; service fittings carrying door/floor loads; and the tested 215 mm arches as drop-in supports at the old pipe levels. **Withhold:** a chosen arch/bridge, safe water level, material exception, removal corridor or construction issue.

This settles the support/access topology and quantifies one important structural cost; it does not complete STR-HOUSE. The next joined selection must choose the support and wet assembly together with RWT-06/RWT-METALS, then reconcile the actual house section, reactions and maintenance occupation. Concurrent RWT source and geometry remain untouched.

## Evidence and validation

The numerical conclusions are project calculations from the pinned RWT inputs and the separately labelled structural trials. The existing STR wall/span/house results own the broader structural choice.

[Brick Industry Association, Technical Note 31, January 1995](https://www.gobrick.com/media/file/31-brick-masonry-arches.pdf), PDF page 8 and its structural-function text, supports treating arch vertical/horizontal reactions and restraint as real duties. Its weather-resistance discussion also identifies flashing as a potential bond break affecting arch/abutment resistance. The structural-function page/figure was visually inspected on 31 October 2026; a later-page image retrieval failed, so no dimensions from that image are adopted. This US guide supplies mechanisms, not UK capacity, a prescribed ring size or this house's approval.

Run:

```sh
node project/str/studies/north-drainage-support.test.mjs
node project/str/studies/north-drainage-support.mjs --check
```

Ten tests cover pinned source identity/territories, whole circular envelopes, contact versus reserve, conservative box corners, alternative rise, global vertical translation, bounded stations, invalid inputs and the acceptance ceiling. The initial connector-only study used exact copies of the retained source JSON blobs. Recovery reproduced all ten tests on Node 24.22.1 against current-main inputs and preserved the calculation, tests and generated SVG unchanged. Independent review checked the source relationships and numerical claims; rendered inspection checks the actual sheet. Full repository health, exact submitted-head CI and fresh canonical publication preflight remain separate integration requirements. No physical or engineering acceptance is claimed.
