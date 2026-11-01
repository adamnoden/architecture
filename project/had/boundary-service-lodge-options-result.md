# Boundary Service Lodge — a small interface, not an all-service room

**1 November 2026 · HAD-BOUNDARY pre-site options result.** Starting main `40da14fcf855125b18cc90ad0bcd2c419a1ee236`. This answers the [owner's brief](boundary-service-lodge-and-raceway-brief.md) under the [house charter](../owner-house-charter.md) and [plot brief](../dpl/owner-site-brief.md). There is no nominated site, accepted supply capacity, utility offer, cost ceiling or installation consent. The accepted house and its controlled service geography are unchanged.

**Reference design — not released for construction. Assumptions and outstanding verification accompany the proposal; internal checks do not constitute external assurance or certification.**

## Recommendation

Use **separate small front-access masonry cells**, composed as a restrained boundary group, rather than a walk-in mixed-utility building. Keep potable isolation in a separate protected below-ground chamber unless an above-ground arrangement earns its frost and supplier acceptance. Keep foul inspection outside the electrical/data enclosure. Retain independent house-side isolation; neither customer switch disconnects the network's incoming live conductors.

Treat **separate conventional buried routes with accessible endpoint fittings as the benchmark**. A continuous solid-cover private raceway is a conditional alternative where the actual gravity, groundwater, frost, tree and handling evidence earns it. Reject open grates as the default cover over potable-water or supposedly dry electrical services. Solid covers improve exposure but do not make an underground void dry. A protected service corridor can be useful without housing every service.

This is a completed bounded comparison and recommendation, including concrete trial geometry and failed cases. It is not selection of a site, a provider-approved kiosk, a complete material assembly or a commissioned route. The recommendation is reversible if actual network positions, access or ground evidence favour a wall cabinet, distinct structures or conventional burial throughout.

[Form/maintenance comparison](studies/boundary-service-lodge-forms.svg) · [connected route and failure sections](studies/boundary-service-lodge-routes.svg) · [authored quantities](studies/boundary-service-lodge.json) · [reproducer and adverse checks](studies/boundary-service-lodge.mjs).

## Evidence that changes the design

Primary information was inspected on 1 November 2026. Statements below apply to the named source and operator, not every London plot. Sources [1]–[9] are linked at the end. The project chooses its architectural trial dimensions; it does not present them as standards.

| Source | Consequence used |
|---|---|
| UKPN **EDS 08-2110-13c, version 09, 01/12/2025** [1], visually inspected UKPN-authored drawing recovered from a public planning deposit | The 100A three-phase row has internal height 1100, depth 250, DNO-only width 445, minimum duct bend radius 250 and duct size 50. The front working field is 1000. These are distinct quantities; the equipment-only width is not a complete customer cabinet. Its 100A single-phase row instead gives 900/250/367 and duct 32. Neither supply is adopted. |
| Same drawing, construction notes | It depicts brick, ventilating airbricks, timber doors at least 38 thick, stainless hinges, a concrete base, membrane and waterproofed concrete roof slab. Size, layout and location require UKPN agreement before construction. A brick exterior is therefore neither a complete mineral-material pass nor automatic approval of our pitched roof. |
| UKPN customer responsibility page, **V2 April 2024** [2], and current service-drawing catalogue [3] | Operator-agreed routes, ducts and permanent route records remain necessary. The page specifies a particular steel-duct requirement for unburied DNO cable; it does not approve loose cable in a picturesque trough or govern a customer-owned submain by analogy. The current catalogue identifies drawing collection version 13; the deposited sheet's own identity is retained. |
| Water Regs UK access guidance [4] | Readily accessible unburied fittings can be below ground. This is an access distinction, not an exemption from protection or undertaker agreement for shared ducts. |
| Water Regs UK below-ground/entry guidance [5,6] | Conventional depth, entry ducting, insulation and gas/vermin sealing remain real duties. Insulation delays freezing rather than proving indefinite protection. An air void at burial depth cannot borrow soil-cover performance. |
| Thames Water responsibility and stop-valve guidance [7] | Preserve actual network/owner limits and the working internal stop valve. A private upstream control supplements them; it does not relocate a company meter or justify routine interference with a shared street stop tap. |
| Forest Research trenching guidance [8] | Avoid an unbroken excavation through roots merely to obtain continuous access. Compare broken/trenchless sections and a route outside important roots, using actual arboricultural evidence. |
| HSE handling guidance [9] | Lid mass alone cannot establish safe lifting. Provide an assessed lifting and temporary-opening method; a nominal 25 kg limit is not a safety rule. |

The deposited UKPN PDF is 332,990 bytes, SHA-256 `ccd29a0bebe16422d818447bebedf3fb0fedfa852badfda36d984f49b0633edb`. Its actual one-page drawing was rendered and inspected, including the table and construction notes. Its **concrete flat slab is not adopted**. The brief's earlier EDS 08-2101 v14 link returned 404 during this work; its full text was not newly verified and supplies no new dimension here. The current operator catalogue plus the explicitly dated recovered sheet are the recoverable comparison basis, not proof of latest contractual applicability.

## Three built forms

All new geometry is an authored space/cost comparison, not a dimensioned equipment installation. Equipment chemistry, roof members, ventilation free area, weather performance, foundation and substrate remain unselected. Wall thickness is a drawing assumption, not engineering evidence. The same front clear field must remain on private land without obstructing the principal approach or relying on highway occupation.

| Trial | Concrete geometry and occupied field | Assessment |
|---|---|---|
| **A: compact front-access cabinet** | Electrical interior 795 wide × 250 deep × 1100 high: 445 source DNO-only width plus **350 authored customer space**. With 215 side/back masonry and a 50 front-door depth reservation: **1225 × 515**, 0.631 m² rounded. Clear front field 1000. Eaves trial 1500 above grade, 30° gable across 1225 width. | Best baseline when electricity alone earns a boundary structure. Customer isolator, terminals, radii, lighting and actual reach still have to fit the extra 350; it is not demonstrated spare capacity. Do not place a water valve or communications apparatus in its unassigned equipment space. |
| **B: walk-in masonry lodge** | **1800 square internal**, 215 perimeter walls, **2230 square external**, 4.973 m² rounded. Trial equipment strip 500 and working depth 1300; 900 clear entrance, 2100 internal height; 2400 eaves and 30° roof. | Almost eight times A's footprint before approach. Shelter may help substantial equipment, but is not frost control; additional structure, roof, door and internal access must earn themselves. Reject as the present default: no identified domestic apparatus requires the room. This does not prove every future walk-in option disproportionate. |
| **C: separate coordinated cells** | A's electrical cell plus a separate **400 × 250 × 600 internal** passive communications/index cell (830 × 515 external), with **300 open gap**: row width **2355**, 1.058 m² built / 1.213 m² rectangular row field. Independent roofs (data eaves trial 950) and full separation; same 1000 front field. Separate water-chamber trial **600 square clear**, at least **1000 authored gap** from the electrical cell; no gas cell is introduced. | Recommended pre-site arrangement. It can follow disparate network arrivals without forcing mixed occupancy. The 300 gap is a composition/cleaning enquiry, not a safe separation rule; actual penetrations, doors, vents, supports and operator access govern. Chamber aperture is not a proven valve/tool or entry space. |

The electrical reference is a comparison with a 100A three-phase supply, not an estimated house load. A smaller actual supply or different operator may change the dimensions; growing PV/battery equipment must not silently enter the same cell. Customer cable protection, voltage drop, earthing/bonding and isolation need the actual electrical design. The DNO cable ends at its agreed cut-out; the private lodge-to-house leg is identified separately. Gas remains omitted from this trial; if required later it needs its own externally ventilated approved arrangement and a recheck of all separations.

Compose C with plain brick, simple joints, recessed solid timber doors, quiet hinges and a real pitched slate or metal roof. The drawn gable is a volume enquiry, not false proof that the UKPN slab can be replaced. Prefer independently removable small roof/door components over decorative masonry hiding emergency access. Check planning height, highway visibility, security and garden composition on the actual plot. Do not turn the row into a continuous wall across a necessary maintenance route.

## A connected 12 m route, including the failures

The route sheet authors **12,000 mm from lodge station 0 to house station 12,000**, with relative grade 0; this is not a claimed plot setback or proposed site plan. The 600-clear trough has 100 walls and a base at **−650 at the house**, falling **1:100 toward the lodge to −770**. A trial passive outfall discharges to an assumed receiving-water plane **−900**, leaving **130 mm** of geometric head before outlet losses, freeboard or capacity. Assessed groundwater is hypothetically **−1200**. None of these environmental values is a fact about London soil or a future site.

The 800 overall width and average 710 depth give a **6.816 m³ lower-bound rectangular excavation prism**, before base construction, bedding, working space, overdig, chambers or root-preserving diversions. This is already a substantial civil intervention. Direct burial can share a staged excavation while preserving service-specific protection/separation; its actual excavation is unknown, so no invented cost or carbon saving is claimed for either option.

The trial has separate electrical/data reservations, not a shared wet sump. No cable size, duct outside diameter, segregation distance, support spacing, soil bearing or cover load class is inferred from the rectangles. The public-side DNO duct follows the agreed incoming route into its cell. The private submain and communications route emerge from separate controlled endpoints. Their installed ducts, clamps, protective conductors, pulling bends and all seals must be chosen before route acceptance.

At the house end the electrical/data corridor rises **outside the permanent wall** to a proposed dry entry **+450 above the same grade**, with independently supported tails, an authorised formed sleeve through the wall above the ground beam and house-side isolation. There is **no penetration through an assumed pile cap or structural beam**. The first access cover and the entry face must remain removable from outside. The actual wall/base section, approach conflict, thermal/fire/gas/air/pest seals, cable bends and flooding level must all be resolved before adopting this terminal. An above-grade sleeve is a deliberate design alternative, not an asserted match to the current house entry.

The complete water route is **separate conventional burial**, trial crown at −900 (32 diameter is an authored comparison only), from the protected private upstream isolation to a separately ducted/insulated house entry and independent internal isolation. The drawing does not place potable pipe in the air-filled electrical trough. At the house end −900 is **250 below** that trough's −650 base before pipe depth: burying it beneath the trough would destroy independent access and is rejected. Use a laterally separate alignment. The actual water entry beneath/around the ground beam must be designed with STR and the undertaker; it cannot inherit the elevated electrical sleeve or an unheated open-air rise. Notification, insulation and no-demand frost analysis determine whether any accessible water alternative survives. Do not omit prescribed protection to meet the material policy.

Foul drainage remains a separate sealed route with its own rodding access. Its invert and gravity fall are **unknown**: the raceway's 1:100 base is not a foul-pipe gradient or evidence of a lawful outfall. RWT retains the lodge roof and site-water destinations; neither drains into the electrical cell. Pitched shedding needs a safe receiver outside the doors, water-chamber opening and principal approach.

### Failure F1: grate, frost and no demand

An open grate admits runoff, dirt and cold air. The trial's −900 water level does not make pipe in an air void equivalent to soil-buried pipe. Solid metal lids also conduct cold and do not establish a thermal envelope. With no demand and no useful heat input, insulation alone is not a demonstrated freeze-prevention mechanism. **Reject an unheated water valve in the exposed roofed cell and an open-grated all-service trench as defaults.** The separate protected burial/chamber remains the benchmark; its actual frost package and reachable operating/renewal task remain necessary site design.

### Failure F2: blocked outlet and flood to grade

With the assumed outlet blocked and external water at **0**, the house end contains **650 mm of water**. The nominally dry trough fails. A second pipe to the same flooded destination does not solve it. The proposed +450 entry has 450 geometric separation only against this declared water plane; a higher flood, tracking sleeve, failed seal or inappropriate cable can defeat it. No essential dry equipment is placed below grade, and no pump/tanking is credited as backup. If the site cannot provide an assessed dry equipment position and suitable service route, choose protected conventional burial or redesign/reject that route. Troughs may be designed to tolerate wetting; this result supplies no submerged-service approval.

### Movement, lifting and actual renewal

The pile-supported house, independent lodge and soil-supported corridor move differently. A **50 mm relative vertical sensitivity over a 1000 transition run** gives **2.862°**; this is not a pipe/cable or coupling capacity. Rigidly fixing both ends is rejected as an unexplained movement solution. Keep the final transition externally inspectable, with independently engineered supports, demonstrated bend/slack or movement fittings, and connections on the accessible side of the real wall boundary. Actual movement comes from STR/site evidence; an arbitrary flexible connector is not selected.

For 500-long covers across 800 width, an **8 mm bare steel plate** at an explicit density assumption of 7850 kg/m³ weighs **25.12 kg**, before ribs, keys, finish, retained water or lifting gear. Twelve metres means **24 covers**. This is a handling/civil-burden sensitivity, not a plate design: load class, span, deflection, bearings, corrosion, lock, anti-slip finish and fingers/trips remain unproved. Provide a retained lifting device/staging field and barriers; do not assume two people can lift every lid safely or call 25 kg a permitted limit. An open grate requires the same real support/handling decisions.

Ordinary diagnosis uses the index, safe lights and relevant isolator without lifting a long route. For pipe or cable renewal: establish the responsible isolation (including network work where required), control residual water/energy, barrier the route, lift only the assessed modules, retain independent service supports, disconnect at accessible terminals and remove the defined section. Continuous open-top access permits a **cut-and-renew pipe task**, not a promise of intact 12 m extraction. A ducted cable still needs its actual pulling/tension/bend and endpoint space; lifting lids alone does not release it. Renew disturbed seals and supports, inspect/test the relevant system, dry affected fabric and reinstate each cover. Do not unfix the permanent house structure to reach a joint. This is an intervention design order; product-specific tools, strokes and safe-work procedures are not fabricated.

## Light, labels, indications and constituents

Use a protected, replaceable fixed light serving the private working front, with a reachable switch outside operator-only apparatus and a clear dark-state label. A portable independently powered inspection light is the outage fallback; no promise is made that switching off the private supply leaves the fixed light working. Emergency lighting can be added if its actual inspection/replaceable battery burden earns it. Luminaire, circuit, ingress rating and earthing remain the electrical designer's job. Do not put unapproved lighting or loose leads in the DNO-only equipment territory.

The physical index names each service/run, operator and owner limits, which device isolates which part, incoming live risk, house-side control and route station/direction. Use durable engraved metal/ceramic labels fixed independently of renewable covers, with duplicate endpoint identities. Retain a paper route/operation record at the internal hub. No dependence on an app or network. Use the provider's actual meter for the useful indication; no duplicate electrical meter or remote display is required. A separately isolatable water pressure gauge/flow indication is optional only after it earns leakage diagnosis, frost and renewal burdens; no filter bank is justified by this trial.

| Assembly | Material/maintenance consequence; no complete pass |
|---|---|
| Masonry/base/roof | Audit brick, mortar, concrete, waterproofing compound/membrane and all coatings. The provider drawing's membrane is explicit; the owner has approved no exception. A slate roof does not remove the base/roof-water duties. STR owns foundations and roof support. |
| Doors/ironmongery | Timber treatment, coating/glue, seals, hinges, locks and any intumescent constituents need whole-assembly disclosure. The source's treatment/38 thickness is not a complete door design. Keep emergency access legible. |
| Covers/trough/supports | Include cast/rolled metal, finishes, bedding, seals, gaskets, lifting keys, support pads and all retained installation compounds. A plain steel sensitivity proves no corrosion system or polymer-free lid. |
| Electricity/data | Cable insulation, ends, glands, ducts, seals, clips, earthing, light and controls remain MAT-SERVICES/electrical design duties. A steel duct or brick box does not clear internals. |
| Water/foul | Pipe, valve seals, packing/lubricant, insulation/facing, chambers, joints and boundary seals retain existing MAT findings. Neither metal body nor unheated masonry protects a complete wet assembly. |

## Completion boundary and retained decisions

HAD-BOUNDARY completes **this pre-site architectural comparison**, not every future site/installation design. It removes the assumption that a walk-in all-services lodge or continuously dry grated trench is a good default. The selected *research recommendation* is C plus separate conventional burial benchmark, with accessible covered segments only where proven useful. It neither approves a material exception nor adds a second authoritative site/house model.

| Missing evidence | Decision it prevents / responsible route / latest point |
|---|---|
| Real utility arrivals, load/supply, operator access, current applicable drawings and consent | Cabinet equipment fit, placement and pitched-roof departure; DPL/operator and electrical designer, **before fixing lodge geometry or ordering/building it**. The deposited drawing is a comparison, not the consent. |
| Surveyed groundwater/flood/receiving levels, drains and sewer invert | A gravity-drained accessible void and foul destination; DPL with RWT/MRA, **before selecting route levels or a plot/house combination relying on them**. Reject pumping/tanking dependence. |
| Root/ground movement and actual support/cover/transition design | Excavation alignment, bearing and movement connection; STR/arboricultural/site design through existing BCR/DEL route, **before route or foundation issue**. |
| Water temperature/no-demand/frost package and undertaker acceptance | Accessible water alternative/chamber/entry; water designer/DPL/MAT, **before fixing service assembly and entry**. Conventional burial does not excuse this. |
| Complete products, materials, joints, lighting, terminals, tools and release travel | Component fit/renewal and owner policy admission; MAT with HAD/IAS and BCR/DEL, **before product/assembly selection**. No exception assumed. |
| Actual construction/maintenance pricing, tasks and lifting/access evidence | Whether C and any covered corridor earn their whole-life burden; owner/design team through BCR/DEL, **before adopting the site-specific variant**. No cost rank in pounds is earned here. |

These are acceptance gates tied to actual decisions, rather than a referral replacing the comparison. They live with the existing DPL, STR, MAT, MRA, BCR and DEL owners; no duplicate assurance register, new arbitrary task graph or premature site-suitability pass is created. Revisit the recommendation if it cannot meet these obligations more simply than the conventional benchmark.

## Verification

`node project/had/studies/boundary-service-lodge.mjs --check` reproduces both physical A3 sheets and the quantity record from the authored inputs. It checks complete dimensions/areas, outlet and flood arithmetic, bare-cover mass and count, and adverse controls for an elevated outfall, flooded dry trough, undersized front field, water beneath the trough and rigid endpoint assumption. Source SHA-256 values bind the charter/brief/plot basis; a changed source requires regeneration and judgement rather than silently inheriting a prior result. These checks establish the stated comparison only.

The deposited UKPN sheet and both actual output renderings were inspected. Repository health and exact-head integration evidence belong in the PR; neither replaces engineering, real operation, material disclosure or provider agreement. No physical test, certification, statutory determination or independent external review occurred.

[1]: https://docs.planning.org.uk/20260216/28/TA6V3KTYGNY00/43m5vbmlif503iwf.pdf
[2]: https://library.ukpowernetworks.co.uk/library/en/Connectionsquotations/Customerresponsibilities/3.2-ducts/
[3]: https://g81.ukpowernetworks.co.uk/library/design-and-planning/lv/eds-08-2110-lv-electrical-service-drawings
[4]: https://www.waterregsuk.co.uk/topics/all-faqs/what-is-meant-by-concealed-and-accessible/
[5]: https://www.waterregsuk.co.uk/topics/all-faqs/how-should-below-ground-pipework-be-installed/
[6]: https://www.waterregsuk.co.uk/topics/all-faqs/how-should-pipework-access-a-building/
[7]: https://www.thameswater.co.uk/help/water-and-waste-help/leaks/pipe-responsibility
[8]: https://www.forestresearch.gov.uk/tools-and-resources/fthr/urban-regeneration-and-greenspace-partnership/practical-considerations-and-challenges-to-greenspace/tree-roots-and-trenching/
[9]: https://www.hse.gov.uk/msd/manual-handling/
