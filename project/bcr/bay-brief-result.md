# BCR-BAY-BRIEF — front study window, wall and floor edge

**Result:** select one bounded construction-information study: `BAY-FRONT-STUDY-01`, centred on the current ground-floor `south-window-0`. This completes the brief, not the bay design. The package must demonstrate how an ordinary renewable window, its enclosing wall and floor boundaries are built, occupied and repaired together.
**Source baseline:** `04212ccdddab5a56b0599061cc6724444e409a08`, 29 October 2026. Dimensions below are model millimetres. The current house remains a pre-site reference for the owner's house, not an authorised construction commission.
**Owner:** BCR, under the [bay programme](buildability-construction-resolution-programme.md#owner-house-construction-bay-demonstration) and [owner-house delivery route](../del/owner-house-delivery-plan.md). The [current preflight](bcr-preflight-result.md) retains unresolved whole-house findings.

## Why this bay is consequential

The selection tests whether the project's preferred ordinary assemblies actually meet at one buildable, renewable interface. It combines exterior water shedding, frame support and anchorage, insulation and airtightness, the head/floor-edge/movement junction, ground-floor continuity, local service provision and a furnished room. The current desk occupies the window's approach frontage. A neat empty-window detail would conceal that real operational duty. The package can expose an unnecessary special mounting component or removable lining as readily as justify one.

| Candidate | Specific information and proof value | Decision for this brief |
|---|---|---|
| Front study window, adjoining wall and floor edge | Tests the selected OAS conventional frame family against actual masonry/cavity reservations, upper-floor support, lower-floor boundary, first release and furnished access. Existing OAS head/jamb/sill studies supply a substantive starting point, while their unresolved supports and performance are precisely what a technical issue must expose | **Select.** It makes a repeatable envelope/occupation interface concrete without pretending its repetition makes it universally applicable. No product, structural connection or performance is already accepted |
| Court threshold and rainwater carrier crossing | More urgent for complete house feasibility: thresholds, occupied passage, retained water, independent failure consequence, ground package and support crossings must work together. RWT-06 and HAD hold competing, unadopted level/route proposals | Retain as an explicit critical house obligation in RWT/HAD/BCR. Selecting it here would make the first bay issue depend on choosing that unresolved system topology. It remains a candidate for a later distinct package after selection; this window brief cannot discharge it |
| Entrance bridge and court doorway support | Tests the concrete BCR-STRUCTURE finding that edge-aligned trimmers meet a doorway, with offset-frame alternatives, guarding, doorway head and service crossing | Retain with HAD/structural owner and BCR. A selected framing arrangement and competent structural design are needed before it becomes a coherent detail package. The window bay still requires an actual floor-edge load path; it does not borrow the bridge's unresolved structure |

The choice is therefore an information-development priority alongside critical design work, not a ranking that makes rainwater or entrance support less important. Failure to fit the window bay is useful negative evidence and must return to its owning design. Success cannot be extrapolated to court thresholds, wet floors, bridge supports, roof edges or other opening types.

## Exact source and extent

The controlling design is `RH-LAYOUT-REVISION-02` through `RH-LAYOUT-FAMILY-02`. Recover each entry at the baseline commit above and the linked path; the blob pins identify the inspected bytes. No frozen historical Reference House aperture identity substitutes for this source.

| Source | Inspected Git blob |
|---|---|
| [Layout revision](../../compiler/reference-house/georgian/layout-revision.ts) | `af955c7da2e2469fd24598f98db6fc942a119ed3` |
| [Inherited exterior opening generator](../../compiler/reference-house/georgian/source.ts) | `1edcfe12392e7b56bf957ffa10a57e21878f3fa0` |
| [Current elevations and section queries](../../compiler/reference-house/georgian/layout-family.ts) | `30ef287f3176e0f4cf2b03ef57c4fdfc915494c9` |
| [Section choices](../../compiler/reference-house/georgian/section-source.ts) | `1617867dc3441206c116ddf877dcfd5ba89fb5a4` |
| [Held section/floor reservations](../../compiler/reference-house/georgian/section-exemplar.ts) | `75bf5c749da5095c07eed46105817a79095ca418` |
| [OAS family selection](../oas/oas-03-selection-result.md) | `8e608bc4fa740a5171680a48b3b501717eec174d` |
| [OAS nominal detail completion](../oas/representative-detail-completion.md) | `cc4ac3277f301c6cee7ca0745b03125c0ef5d678` |
| [BCR preflight](bcr-preflight-result.md) | `1af61accfaa5bbcb84fa02fca208b6121273f102` |

Use the composite identity **GROUND / outer-south / south-window-0**, because the bare opening ID also occurs on the first floor. `revisionOpenings('GROUND')` gives centre x 1800 and width 1000; `layoutSectionAt(1800)` gives the ground aperture z 750–2850. South is the front, y 0 the exterior face and positive y inward/north; z 0 is ground FFL. The aperture runs x 1300–2300. The 1000 × 2100 is a nominal source opening, not measured site work, clear glazing, ventilation area or unobstructed passage.

The **authored study crop** is x 750–2850, y −400–1000, z −300–3450: 2100 along the facade, through the exterior/sill and wall into the room, from the ground-floor reservation to first FFL. These are inspection limits, not construction joints, member ends, an excavated foundation or a safe work area. Show cut continuations and off-crop load/air/water/thermal paths. Extend a drawing where the selected support or boundary needs it; record the extension rather than silently truncating the proposition.

For occupation and handling, show the **whole current study**, its door and connected approach, plus the exterior access route when a site is known. Its planning boxes are x 0–4800/y 0–1200 and x 0–3400/y 1200–2650, before wall/partition thickness. The desk is x 600–2200/y 600–1300 and chair reservation x 1000–2000/y 1400–2300. The desk overlaps 900 of the window's 1000 frontage in plan and starts only 182.5 from the nominal inner finished wall y 417.5. These observations require an action/approach study; desk height, reach, sash sweep, handle and blind positions are unselected, so they establish neither an operating pass nor an unavoidable clash. Do not mistake the crop's 582.5 interior depth for the full required work field.

## Existing budgets, with no spare-depth assumption

| Interface | Starting quantity | Design obligation |
|---|---|---|
| Wall | 417.5 = 102.5 weather leaf + 160 cavity + 140 inner leaf + 15 finish | Select the real substrate, insulation/closure and structural role. Total wall depth is not solid fixing material. Locate ties, supports and uninterrupted boundaries |
| Window and reveal | OAS nominal frame 970 × 2070 × 140, at wall depth 220–360; 15 perimeter study gap; remaining room reveal 57.5 | Product/profile, pack/fixing spacing, tolerances, movement, glazing and declared performance must be selected together. Neither 15 nor the drawn 60 frame occupation is a certified installation allowance |
| Head to ceiling | Aperture head 2850; ceiling 3100, leaving 250 | OAS's nominal head reserve 200 and tray/upstand reaching 3100 already occupy this territory. Coordinate lintel/support, insulation, drainage, air seal, cornice/trim and movement in one section; a drawn upstand at ceiling level is not a proven junction |
| Intermediate floor | FFL 3450 to soffit 3100: finish 20, deck 22, framing 238, service 55, lining 15 | Framing lies 3170–3408; nominal seat depth 40 ends at 3130. Select actual support/reactions, fixing, deflection and protection; do not treat a section running across the house as the selected member span. Services cannot assume holes/notches or borrow framing depth |
| Ground floor | z −300–0 reservation | Actual slab/deck, insulation, moisture/gas boundary, edge support and service crossing remain unallocated. No foundation type, depth or local ground level is selected. Continue these obligations beyond the crop |
| Sill, first release and services | Existing OAS sloped sill/tray and separate trim studies; IAS ordinary finish/local access selection | Resolve support separately from water seals, drainage exits and perimeter reinstatement. Ordinary 18 trim projection and 45 service-skirting challenger are study inputs, not installed products or permission to run wet joints here. Do not add a universal access floor/backplane |

The [IAS/OAS junction](../oas/ias-oas-junction.md), [opening studies](../../docs/reference-house/opening-interface-studies.md), [structure study](bcr-structure-result.md) and [proportionality comparison](bcr-proportionality-result.md) own the fuller qualifications. Reuse them by reference. The bay design must replace nominal envelopes with selected dimensions where its claim depends on them.

## Conventional comparator and required actions

The control is the selected **OAS E0/I0 conventional renewable frame/doorset family**, mechanically fixed to an appropriate supported substrate, with ordinary dry finishes and independently removable local trim. Interrupted perimeter seals and sacrificial local finish are deliberately renewed during full frame exchange. Compare a local E1 fixing implementation only if an actual task earns it. No continuous retained cassette, novel wall family or promise of damage-free whole-frame removal is introduced.

BCR-BAY-DESIGN must show these operations on the same selected geometry:

1. **Ordinary use:** seated/standing approach, actual opening/closing, blind/shade operation, cleaning and ventilation, with the desk in its intended position. Decide whether furniture moves for routine use; if so, expose that owner burden. Handle height and clear reach require an actual assembly. The bay is not assigned an escape-window role by this brief.
2. **Installation:** tolerance survey, temporary support, sill/water boundary sequence, packs/anchors, frame/glazing handling, completion of weather/air/insulation interfaces and inspection before closure. Identify actual tools, fixings, masses, temporary protection and which side each task occupies.
3. **Routine service:** hardware, seals, sash or glazing replacement as distinct tasks, with isolation/protection where relevant. Demonstrate the first accessible release without trapping it behind desk, skirting, sill or fixed cabinetry.
4. **Full frame renewal:** clear and protect the room, safely handle/remove the assembly, expose all required anchors, renew interrupted membranes/closures and reinstate finishes. Show exterior access if needed; do not promise universal inside-only removal. Include replacement of any retained mounting component that fails.
5. **Abnormal conditions:** blocked drainage exit, failed perimeter seal, differential movement and inaccessible/damaged fixing. Trace detection, water consequence, temporary weathering and a repair sequence. A drawn arrow is not a tested drainage performance result.

A conventional solution is not exempt from these duties. Any added interface must demonstrate an actual avoided burden sufficient to justify its space, installation, inspection and eventual renewal obligations. No service-life, cost or carbon advantage is assumed.

## Required issue content and named receiving owners

These are deliverables for the later review issue, not completed drawings or appointments. Use [DEL IP-03 coordinated technical review](../../docs/delivery/information-issue-profiles.md#six-purpose-profiles) for the issue purpose and declared gaps; no IP-05 construction authority follows. ADE should use existing source identities and rendering capabilities; absence of a detail here does not justify a parallel design model.

| Required record | Question it must answer | Design/evidence owner |
|---|---|---|
| Located plan/elevation and room/exterior action sheets, typically 1:20/1:50 | Which actual opening, levels, room contents and approach are being reviewed? Where do crop and supporting context stop? | HAD/Reference House owns geometry and occupation; ADE represents it |
| Complete vertical section and jamb/head/sill, ground edge and floor-edge details, typically 1:5 with 1:2 local release views where needed | Can supports, fixings, water/air/thermal continuity, movements, finish interfaces and service routes physically coexist? Show all layers and actual dimensions, not only envelopes | OAS opening; IAS interior/floor/service edge; HAD/structural designer receiving structure; ADE output |
| Exploded or staged installation/renewal sequence and component schedule | What is removed first, by whom, from which side, with which clearance/tools/support and which consumables renewed? Which parts are conventional obtainable replacements? | OAS/IAS design; DEL maintenance/procurement record; ADE links schedule identities |
| Structural and envelope evidence schedule | What establishes substrate/anchor/support capacity, floor reactions/movement, glazing duty, water/air performance, insulation/condensation and relevant fire/acoustic interfaces? Record applicability, source inputs and limitations | Competent structural/envelope designers through EPR; OAS/IAS/HAD reconcile responses; ADE binds actual evidence |
| Verification and unresolved-question register | Which proposition is verified, which is only represented, and what must change if a check fails? Record installation inspections and any necessary physical test without inventing results | BCR dispositions; PHY applicable test evidence; DEL issue/hold register |

Scale is a proposed communication choice, not an accuracy claim; ADE must establish printed legibility, dimensions and output identity. Schedules must distinguish product, fixings, seals, finishes, temporary works and renewable consumables, with unknown quantities/performance visibly unselected. Prices and procurement commitments are absent. The same revision must bind drawings, specifications, calculation inputs and maintenance sequence.

[PHY](../phy/physical-validation-programme.md) retains engineering-first PHY-03 floor-edge work and PHY-04 movement-junction tests. The [current-house applicability result](../phy/current-house-prototype-applicability.md) distinguishes surviving methods from superseded specimen geometry: the ordinary side-wing edge cannot represent entrance/stair interruptions, and the older 2950 movement rig cannot silently represent the current 3100 room. Apply its release requirements to the selected bay support and actual movement/closure detail. The ordinary plain upper termination remains the IAS default; an optional local cover requires a real independently moving junction. A new selected detail still needs an explicit specimen-scope decision before any test. A prepared protocol or architectural mock-up is not capacity/performance evidence. Held optional wall/access-floor tests do not reactivate merely because this brief exists. The [current EPR review applicability record](../epr/current-house-review-applicability.md) supplies the refreshed technical questions and response boundaries; its prepared briefs are not responses. EPR-BAY-REVIEW requires real competent designer and contractor responses after a coherent DEL-BAY-PACK; this brief records no such review, appointment or authorised spend.

## Site boundary and completion test

The pre-site study can resolve internal fit, selected-component compatibility, supported release sequences and a coherent review issue. Actual plot orientation/exposure, ground levels/conditions, foundations, external working space and access, neighbouring constraints, applicable planning/statutory requirements and project-specific loads need the commissioned site's evidence. DPL/DEL own that activation; EPR and relevant designers determine applicability. Do not turn an unknown site into a blanket reason to leave the internal assembly undefined, or fabricate site assumptions to claim construction readiness.

The brief is complete when ADE and a competent reviewer can locate the bay, understand the conventional control, identify each required drawing/evidence item and see its receiving owner. **BCR-BAY-DESIGN still depends on TRIAD-GATE.** Subsequent design must reconcile selected IAS/OAS/HAD sources before technical output; completion of this brief neither grants that gate nor resolves any shared construction-matrix row. No source geometry, assembly selection, matrix disposition or external evidence state changes here. A material source change triggers a brief applicability check before issuing the package.
