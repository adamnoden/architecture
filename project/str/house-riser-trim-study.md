# Riser opening: real trimming and a complete floor boundary

**1 November successor:** [J-RC3](joined-rc-reference.md) changes the first conventional enquiry to a solid RC200 slab with deliberately formed water/soil-stack penetrations and slab-contact cabinet supports. This removes the full-opening/hanger dependency for the demonstrated joint rather than inventing a special HC150 product. The hollowcore comparisons below remain reproducible at their original scope; the complete service programme, seals and lower plant-door reactions are not thereby resolved or adopted.

**31 October 2026 · STR-HOUSE bounded comparison · not for construction.** Starting main `09130048037f20fdc86b60959b2c631db18b6a6f`. This develops the [located riser enquiry](house-support-study.md#riser-the-stacked-cabinet-does-not-design-the-slab-hole) on the **unadopted B plan**. It changes no accepted house geometry, selected floor, structural member or material exception. STR-HOUSE remains planned.

## Decision

Advance a **supplier-designed local trimmer carried by adjacent full-length hollowcore units**, with an explicit supported closure around the riser. Keep the independently supported frame as the fallback. The local arrangement has a real manufacturer precedent; neither route yet has a selected section or demonstrated capacity in this house.

Three consequences now constrain that enquiry:

- The 700 × 800 structural bay extends beyond the 600 × 750 cabinet on every side. The cabinet does not close the floor opening or demonstrate its own support.
- The adjacent planks and an independent frame both return reactions to the east wall near the ground plant doorway. Changing the trimmer does not remove that arch/spandrel duty.
- The opening removes the east-hand slab end along 800 mm of the spine. A tied **opposed-end** detail from an uninterrupted bay cannot be copied into this one-sided location.

[Located plan and section duties](studies/house-riser-trim.svg) · [recorded geometry](studies/house-riser-trim.json) · [reproducer](studies/house-riser-trim.mjs).

## What the primary detail actually supplies

The [Ibstock/Coltman engineer's page](https://www.ibstock.co.uk/products/flooring-and-lintels/hollowcore/engineers-section) links its [Standard Trimmer Strap Detail](https://images.ctfassets.net/eta2vegx3yuv/6HziuaY2D0E9AjhL3qx9RP/d51e8cfeedf89e1c7d51d169f36f79ac/Hollowcore_-_Standard_Trimmer_Strap_Detail.png). The downloaded colour isometric shows a shortened unit carried on a lower trimmer shelf, with upper tabs supported on neighbouring full-length units. Its only numerical annotation is a trimmer width up to 1200 mm. It does **not** provide tail bearing, plate thickness, shelf projection, installed depth or this house's load capacity.

The [manufacturer's vertical-services guidance](https://www.ibstock.co.uk/products/flooring-and-lintels/hollowcore/finishes-and-service-runs) makes larger openings and metal trimmers subject to design, and assigns fire protection of the straps to the Principal Contractor. It distinguishes factory-formed openings from limited small site-drilled holes. This enquiry is not permission to cut prestressing strands or enlarge a hole during ordinary service maintenance.

**Source identity matters.** The original PNG was visually inspected: 1045 × 702 pixels, 256,761 bytes, SHA-256 `93d6cb14f9d8a4260552749c43b12985489e947fa320af28583aeefa0752e5f7`. A browser-derived image at the same URL displayed a different technical drawing with additional dimensions. Those dimensions are not bound to the downloaded primary detail and are **not used as supplier dimensions here**. Do not scale the isometric. Any dimensioned successor must have its own recoverable manufacturer identity.

## Located bay, cabinet and closure

The reproducer pins the existing paired-plan, support and source-inventory JSON blobs. Its dimensions belong to the B comparison, not the accepted plan's different riser position.

| Boundary | Located extent | Consequence |
|---|---|---|
| Structural opening enquiry | x9370–10070; y4650–5450 | 700 × 800; its west edge reaches the spine's structural east face |
| Gross riser | x9410–9960; y4700–5400 | Margins to the structural opening: 40 west, 110 east, 50 at each y end |
| Gross upper cabinet | x9385–9985; y4675–5425 | The opening extends beyond it by 15 west, 85 east and 25 at each y end |
| South flanking floor territory | y3770–4650 | 880 between the retained structural wall face and the hole |
| North flanking floor territory | y5450–6430 | 980 before the next structural wall face |

The opening is 0.560 m²; the cabinet footprint is 0.450 m². Therefore **0.110 m² of opening lies outside that footprint**. This is a plan subtraction, not a required panel area or an allowance for fixings. Inside the cabinet, the gross riser already leaves only 25 mm on each side; these are not proved free installation or firestop clearances. The 40 mm west margin to the structural face also includes the retained 15 mm wall-finish reservation.

Draw a supported closure spanning the actual remaining opening around the services, with its fire, acoustic, moisture and finish continuity. Name the cabinet's own supports: its outline is wholly inside the larger bay, so ordinary slab bearing beneath its base is not demonstrated. A supported removable collar, independent cabinet frame or a deliberately changed enclosure can be compared; none is selected here. The closure must not bear on pipes, rely on the riser being empty, or hide an unsupported floor edge outside the cabinet. Actual constituent compliance remains under MAT.

## Two complete load-path enquiries

### Local strap and adjacent units

Locate the local header along the **east edge** of the bay. The shortened floor portion to its east transfers to the lower shelf; the trimmer then transfers to adjacent full-length east–west units; those units carry the added demand to the spine and outer-east structure. The drawing locates that route without inventing the shelf thickness or a rated strap.

Here **full-length** does not mean that an assumed full-width stock panel fits each 880/980 strip. The supplier must set the panel grid, permitted widths, strand/core positions and factory cuts. Local bearing, torsion, end shear, reinforcement and load spread in the receiving units remain actual design questions. A standard uniformly distributed load table would not establish this concentrated-transfer case.

Let the actual required south and north bearing territories be `b_s` and `b_n`. Then the trimmer's north–south occupied extent is at least `800 + b_s + b_n`, before other projections and tolerances. Both territories must fit on the intended receiving units; the source picture supplies neither value. The **100 mm territories shown on the sheet are authored occupancy sensitivities only**: y4550–4650 and y5450–5550, with a 1000 mm total extent. They are not specified bearings. Wider territories exceeding 880 south or 980 north leave the retained local fields; passing those bounds alone is not a structural or product-fit result.

### Independent frame

The comparator uses two east–west members flanking the opening, with an east-side header between them. This gives the header explicit supporting members instead of borrowing the capacity of adjacent hollowcore units. Their finite seats, connections, restraint and erection sequence must then be resolved at the spine and outer-east structural leaf.

The ground plant doorway is **y3900–5300**. For the same illustrative 100 mm edge bands, the southern outer reaction patch y4550–4650 lies wholly over that aperture; the northern y5450–5550 band starts 150 mm beyond its north jamb. That 150 mm is a plan separation, not a sufficient bearing or arch-abutment length. The actual arch profile, spandrel, finite load spread and foundation route still control.

The strap alternative does not escape this condition: its southern neighbouring floor territory also overlies the doorway. Its wall reaction is not assumed equal to the illustrative frame patch; the actual receiving-panel arrangement determines the distribution. Neither alternative earns a plain unbroken east-wall support by drawing an arrow to the wall face.

## Spine, section and service renewal

The [shared-bearing study](house-spine-bearing-study.md) deliberately used the uninterrupted y6570–7770 bay. Over the present y4650–5450 opening there is no opposing east slab end. Resolve the local west-gallery end, continuing upper masonry, restraint and closure separately. Do not open/grout imaginary opposing cores, fill the service hole to recreate that detail, or use a removable cabinet component as a structural tie.

The retained floor enquiry places the HC soffit at +3170 and ceiling top at +3115, leaving **55 mm for services**. A trim downstand `d` plus its actual protection `f` leaves `55 − d − f` in the same zone. The source provides neither installed value. Nor can top hooks silently consume the existing topping and upper-function reservations. Bind the actual section, tolerances, fire protection, corrosion/constituent treatment and accessible service routing before keeping the old ceiling level.

Trimmers, adjacent slabs, permanent ties and the cabinet's load-bearing frame remain in place during ordinary service replacement. Renewable service closures and fire/acoustic seals need their own accessible reinstatement sequence. Their removal must not release the structural trim or reduce its protection. No tested firestop, plastic exception, service capacity or professional acceptance is created by this study.

## Dimensioned hanger and floor-depth comparison

**Further comparison from main `08c68ef0e3014efb8d6aecbcdb1bb208a57425ae`.** The [depth sheet](studies/house-riser-product.svg) and [source-bound record](studies/house-riser-product.json) add a separate, named hanger enquiry. The earlier Ibstock isometric and authored tail sensitivities remain unchanged.

The [Peikko UK product page](https://www.peikko.co.uk/products/product/petra-slab-hanger/) links the [PETRA manual, PEIKKO GROUP 04/2025](https://media.peikko.com/file/dl/i/TTEgOw/DF_du37YwNLtV2TBUjJW6Q/PETRA_PEIKKO_GROUP_04_Technical_Manual_Web.pdf?fv=72d1). Table 3 starts at 175 mm; it does not list HC150. Its 175/200 rows give `b1=140`, `L2=150`, `b2=100`, tolerance ±2 mm. Pages 7–8 give 50–70 lateral joints and maximum 80 supported-slab bearing at depths ≤200. Page 22 depicts 55 overlap on a sound receiving edge and excludes bearing over an empty, unreinforced hollow. The nominal 100 flange, illustrated 55 contact and earlier authored 100 tail are different quantities. Steel thickness and installed downstand remain unbound.

With fire reinforcement, page 8 requires at least 51 between opening edge and supported slab at these depths. Its 30 alternative applies to short hangers without fire rebar; that fire strategy is not selected. Receiving slabs require their own reaction check. Direct point/line loads need individual design, so cabinet/closure loads cannot inherit the standard diagrams. The fire mechanism uses reinforced grouted concrete under stated exposure conditions. Neither that mechanism nor the steel grades qualifies the service-penetration seals or complete constituents.

Accessed 31 October 2026; the downloaded manual is 2,083,337 bytes, SHA-256 `73d418fa20f659dbb6ef5586e9c9e765238a42298b596b626e77adfde349a640`. Relevant diagrams and installation pages were visually inspected. No capacity graph is used here.

The [Ibstock nominal-depth list](https://www.ibstock.co.uk/products/flooring-and-lintels/hollowcore/plank-technical-details), accessed the same day, includes 150 and 200 but not 175. Thus **200 is the smallest shared listed depth**, not evidence of an approved pairing. A special HC150 hanger remains a separate supplier enquiry; its dimensions cannot be supplied by relabelling either current standard row.

Hold the source slab top at +3320 and ceiling top at +3115. The arithmetic then exposes the cost of changing slab depth:

| Slab depth comparison | Slab soffit | Gross depth above unchanged ceiling | Ceiling underside if the original 55 services and 15 ceiling are retained |
|---|---:|---:|---:|
| 150, retained enquiry | +3170 | 55 | +3100 |
| 175, listed PETRA depth only in these two sources | +3145 | 30 | +3075 |
| 200, first shared listed depth | +3120 | 5 | +3050 |

These values precede the hanger, protection and tolerances. They do not establish that 5 mm can accommodate the actual metal. Keeping the 55 service reservation with the 200 case already lowers the ceiling 50 mm, before any additional downstand; changing another layer instead needs its own explicit reconciliation. The complete floor, supporting masonry, adjacent bay transitions, arch/header levels and occupied room section must be redrawn together. A locally deeper plank cannot quietly retain the original neighbour and bearing geometry.

There is a plan consequence too. For the conditional fire-rebar arrangement, retaining opening edge x10070 puts the supported slab face at least at x10121. The remaining 1476.5 to the outer structural face is a geometric interval, not a slab cut length or design span; the outer seat, panel grid, joint profiles and actual hanger remain to be bound. Do not put the slab face directly on the opening-edge line.

**Decision:** retain the supplier-specific HC150 enquiry and the independent-frame comparator. A current standard PETRA arrangement has not earned an unchanged floor section. Keep the cabinet's permanent support, floor closure and renewable service faces as separate duties: neither the dimensioned flange nor a lowered ceiling completes them. The next actual product pairing must resolve those duties together with the one-sided spine and plant-door reactions. No selected assembly, material exception or STR-HOUSE completion follows.

The coordinated [IAS cabinet and floor-boundary comparison](../ias/ias-03-b-plan-riser-closure.md) retains the 600 × 750 enclosure first and tests a 770 × 750 east-only alternative against the complete current HAD slider sequence. Its positive planar results require an independently supported, flush floor closure; they do not prove that closure or actual component withdrawal. The 770 × 950 enlargement obstructs the inherited starting torso position. Carry the retained or justified east-only enclosure into the same installed support and depth section.

## Verification and next decision

Run `node project/str/studies/house-riser-trim.mjs --check`. It checks immutable source identities, actual gross envelopes, closure area, finite bearing-territory bounds, the located doorway interaction, invalid inputs and adverse service-depth controls. It reproduces the original JSON/drawing and the separate product/depth record and sheet, checking the conditional cut-face and complete datum arithmetic. Source review and rendered inspection remain distinct from these arithmetic checks; full repository health and fresh lease/publication checks are separate integration requirements.

The next comparison must bind one real supplier trim and receiving-panel layout **together with** the supported floor closure, cabinet support and one-sided spine detail. If that arrangement consumes required service/closure space or cannot carry the named reactions, return to the independent frame or an explicit riser/plan adjustment. The source-backed topology is advanced; assembly selection and STR-HOUSE completion remain unearned.
