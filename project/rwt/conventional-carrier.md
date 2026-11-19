# North court carrier — conventional pipe and accessible terminals

**Material direction superseded later on 30 October 2026.** The owner's [whole-house material policy](../../docs/reference-house/material-policy.md) rejects plastic defaults, including concealed carriers, sleeves and spacers. The PVC/PE ranking below is retained as a **dated historical comparison**, not the current preferred house solution. Continue through the [rainwater rebrief](rainwater-elegance-brief.md), developing copper or another explicitly justified non-plastic complete assembly. No old stiffness, fitting, support or clearance result transfers merely by renaming its material.

**30 October 2026 · RWT-06 bounded development · not for construction.** Starting main: `27b32f233983219c287e5bb3c03cabfb9646b0b2`. This compares a conventional gravity-drain carrier with the [previous PE support study](carrier-support.md). The [north crossing](north-court-carrier.md) remains an unadopted architectural comparison; its original levels and drawings are not silently changed.

[Calculation](studies/conventional-carrier.json) · [source](studies/conventional-carrier.mjs) · [tests](studies/conventional-carrier.test.mjs) · [A3 axial study](studies/conventional-carrier.svg).

## Historical decision — no longer the material brief

**The study prioritised a solid-wall PVC-U gravity carrier, using Marley UL406 as the dimensioned comparator, rather than treating the eleven-ring PE assembly as the default.** The finite comparison has eight ring stations per carrier, with actual stiffness still to be established. PE was a fallback, not an adopted material. This removes six ring stations across two carriers in the model; it does not remove the sleeves, four accessible terminal supports, seals, inspection or withdrawal tasks. Neither plastic candidate is now an admissible default under the subsequent owner policy.

The useful trade-off is explicit: fewer interior supports, but a larger end-service reservation. Separating the proposed terminal saddle and coupling changes each exposed pipe projection from 100 to 200, the removable body from 4450 to 4650, and the exterior renewal territory from 5250 to **5450 × 1600**. These are successor-trial dimensions, not amendments to the selected house or verified site provision.

## Primary evidence, inspected 30 October 2026

| Source | Used fact | Boundary |
|---|---|---|
| [Marley Underground design/installation guide, 2019 file, printed pp.6 and 25](https://www.marleyplumbinganddrainage.com/website/aliaxis-uk/Downloads/Brochures%20and%20range%20guides/underground-brochure-2019%20%281%29.pdf) | UL406: 110 solid-wall double-spigot pipe in 6 m lengths; listed OD110.0–110.3, wall3.2 and mass1.7 kg/m. UE405 slip coupling:128 axial length | These are catalogue dimensions, not measured delivery tolerances or a casing-ring installation approval. The wall/mass entries are not declared worst-case bounds |
| [Wavin OsmaDrain manual, printed pp.2 and 23](https://blog.wavin.com/hubfs/UK/ABM/5120-Orbia-Wavin-OsmaDrain-BG-PIM-%28OD107%29.pdf) | Current manual describes multilayer Recycore pipe. Its4D086 zinc-coated suspended support excludes damp inaccessible voids | Do not model OsmaDrain as homogeneous solid wall or transplant that bracket into a potentially wet sleeve |
| [Vinidex PVC material properties](https://www.vinidex.com.au/resources/technical-resources/material-properties/pvc-properties/) | Generic long-term creep modulus0.9–1.2 GPa; properties depend on formulation, duration and temperature | Australian material guidance, **not** a Marley UL406 longitudinal stiffness certificate. Ring stiffness SN8 is not a substitute for that evidence |

The Marley product/dimension tables and Wavin multilayer/support pages were visually inspected. No unseen product drawing, supplier response or new physical test is claimed. The dated catalogue remains the source, not a claim that its historical regulatory references constitute current approval.

## Same failure question, not a favourable material label

Reuse the existing simply supported, uniform full-water-load model and its **4250 run, 60 fall and 3 mm adverse endpoint differential**. The published PVC dimensions give a comparison inertia of **1,532,193 mm⁴**. Using OD110.3 minus twice the listed3.2 wall gives103.9 bore for a full-water load comparison, with total load **0.0998174 N/mm**. It is a declared combination of catalogue inputs, not a guaranteed manufactured section.

Use900 MPa as the lower *generic* reference and450 MPa as a deliberately halved sensitivity. Neither is an accepted product property, statutory factor or lifetime bound. PE's earlier160/80 assumptions remain unchanged. A common model is helpful for comparison; the different evidence for the two materials does not establish equivalent reliability.

| Case | Rings per carrier | Pitch | Effective modulus | Worst local downhill slope with one inactive interior ring |
|---|---:|---:|---:|---:|
| Previous PE sensitivity |11|390|80 MPa|+2.043 mm/m|
| PVC reference |6|780|900 MPa|+0.744 mm/m|
| PVC lower sensitivity |7|650|450 MPa|−1.443 mm/m: fails|
| **PVC development candidate** |**8**|**557.143**|**450 MPa**|**+3.080 mm/m**|

Two adjacent ineffective rings fail the eight-ring PVC screen: **−15.844 mm/m**. The six-ring900 result cannot be reported as the robust replacement; it fails the lower sensitivity. The eight-ring result is the first passing count in the declared3–20 equal-pitch family, not a universal optimum or an installed-system pass.

The comparison also inverts the model rather than asking vaguely for a “stiff pipe”:

```text
Required effective longitudinal EI > q L³ / [24 (S − delta/L)]
```

Here S is the chord slope and delta is the adverse difference between the two ends of the assessed span. When `S − delta/L <= 0`, no stiffness can restore a downhill chord. For the eight-ring intact/one-inactive pair the controlling required **EI exceeds503.634 million N·mm²**, equivalent to **E >328.702 MPa** only for the stated homogeneous section. Equality is not a pass. Delivered section, contact, temperature, creep, support movement and continuous-beam behaviour must justify an appropriate effective stiffness; this algebra does not do so. The3 mm difference is not ±3 at each end or a cumulatively applied whole-route settlement.

Keep ring centres, relative to the court sleeve end, at **175, 732.143, 1289.286, 1846.429, 2403.571, 2960.714, 3517.857 and4075**. Actual marking must follow resolved installed fall, not rounded graph labels. The same16 mm PSI skid family remains only a fit comparator: its ideal110.3 +2×16 projection leaves6.95 radial space in the156.2 sleeve bore, before bolts, profile, ovality and contact orientation. Fewer rings do not establish lower pull force or adequate ring retention.

## End geometry that cannot be omitted

The previous study expressly left end supports unproved. Merely placing one at the sleeve mouth creates a175 span to the first ring. Its chord drops only2.471 over that distance; the3 mm adverse difference already reverses it **without any pipe sag**. This is a new rejection case, not a claim that the previous interior calculation was wrong.

The successor reservation puts an independent accessible support centre **75 outside the sleeve**, with an authored **60 axial contact zone**, and extends the carrier **200 outside**. In coordinates measured outwards from either sleeve mouth:

- Support contact occupies45–105.
- A centred128 UE405 coupling is provisionally allocated64 onto the carrier, occupying136–200 there: **31 axial separation** from the support.
- The adjacent terminal-to-first-ring span is250. Its isolated-span screen at450 MPa/3 mm retains+2.023 mm/m; increasing the adverse difference to3.6 fails. This does not calculate terminal moments or overhang/connector loads.

The64 overlap is a geometric reservation, **not verified socket engagement or thermal travel**. Actual coupling profile, seals, chamfers, insertion marks and axial movement can reject it. No bearing or pressure rating is inferred for the60 support. A seal or coupling is not an independent structural support. The retained100 projection, with these same reservations, overlaps by69 and does not fit; this does not prove every possible100-projection assembly impossible.

Allocate128 of uninterrupted fixed-stub length on which to park the released slip coupling, plus80 authored tool territory. With the200 projection the furthest reservation reaches408 into the600 court-end access strip, leaving192 for other duties **only in this axial view**. This is not clearance for an inlet body, vertical transition, hands and paver supports in three dimensions. At the exterior, it is similarly a requirement to be located within the actual transition. Retain the old800 handling allowance rather than silently reducing it to conceal the longer carrier.

The source computes dimensions, not a chosen gasket/frame/support design. The actual resting carrier axis, end inverts and outward annular drain require re-derivation with the installed rings. Continuing the existing chord slope through a200 projection changes level by2.824; the old50/30 receiving margins and−585 site-water comparison cannot be transferred without that reconciliation.

## Renewal sequence to demonstrate

Isolate or independently divert incoming rain; support both the carrier and fixed receiver/inlet connections. Expose and park each actual slip coupling entirely on its uninterrupted fixed stub. Release the removable court annular seal without relying on it to hold the carrier. Transfer load to controlled external handling support, release obstructing terminal saddles as their actual design requires, and withdraw the carrier **with all rings retained on it** into the5450 territory. Install the joint-free replacement, reinstate separately supported terminals and matched seals, then prove leakage, discharge, annular observation and local fall before closing the access surfaces.

The court-end seal must resist the actual water head on the actual pipe/sleeve combination; the exterior annulus must remain inspectable and drain outward. No dirt/moisture boot is promoted to a pressure-qualified seal. The125 overhang from terminal centre to pipe end, connector forces, anchors/base and possible terminal moments still need connected assessment. Conventional buried bedding is a valid baseline, but putting it beneath a permanent floor would change the intended renewal task; it is not quietly substituted for the removable sleeve system.

## Verification and next acceptance

The original support module is reused unchanged and pinned by blob `a351d1ab5d8f8dba38829a341e91b10762d42e7a`; historical north-study drawings remain intact. Eleven regression tests cover source identity, independent numerical values, finite count selection, stiffness inversion, terminal counterexamples, axial collision, corridor growth, source drift and deterministic output. The A3 sheet was rendered and inspected. JSON presentation uses the existing12-significant-digit convention; decisions use unrounded values.

```sh
node --test project/rwt/studies/conventional-carrier.test.mjs
node project/rwt/studies/conventional-carrier.mjs --check
```

**Earned at the original comparison scope:** six fewer interior ring stations in the stated model, quantified stiffness evidence thresholds and a located terminal reservation with its real spatial cost. **Not earned:** manufacturer approval of the installed assembly, support/pressure-seal design, pullability, hydraulic capacity, courtyard threshold protection or real-site suitability. RWT-06 stays planned. The subsequent material policy supersedes the original PVC preference; retain the adverse geometric lessons while re-designing the complete non-plastic assembly or its route.
