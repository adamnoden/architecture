# BCR-OCCUPATION — complete actions, not empty walking space

**Result:** bounded current-house investigation complete with adverse fit findings and unresolved safety/operation duties. The house does not pass an occupation, accessibility or escape gate.  
**Date / baseline:** 29 October 2026; `fde0b81d7fca2a39d9d01532a80e0125485583d5`.  
**Source:** RH-LAYOUT-REVISION-02, `compiler/reference-house/georgian/layout-revision.ts`, blob `af955c7da2e2469fd24598f98db6fc942a119ed3`; HRS [current basis](../../docs/reference-house/current-house-basis.md).  
**Programme / parent:** [BCR](buildability-construction-resolution-programme.md), #944.

## Study and authority

This study follows entry, sanitary use, stair/bedroom access, window/door operation and component renewal through approach, operation, use and return. It tests the accepted source and the explicitly named OAS/HAD local assumptions. It does not adopt the separate, unmerged HAD Bedroom 3/en-suite relocation candidate. That candidate must be assessed on its own final source if adopted; its existence does not fix the current plan.

The [A 3 geometry sheet](studies/occupation-geometry.svg), [source-bound calculation](studies/occupation-geometry.ts) and [recorded values](studies/occupation-geometry.json) expose three consequential relationships. Reproduce with `node --import tsx project/bcr/studies/occupation-geometry.ts`. The script is an inspectable study, not a new whole-house compiler or an automated approval gate. Source changes require reviewing its assumptions, not merely regenerating a green output.

Finished faces here mean the represented 417.5 mm envelope and 125 mm partitions. Actual finish, trim, frame, hardware, guard, tolerance and service projections can reduce space. The 600 mm circle is the same **diagnostic proxy** used by the existing `layout-revision-audit.ts`; it is neither a validated body model nor a wheelchair, assistance or regulatory standard. A failed proxy route is a specific geometric counterexample. A passing empty route proves no complete action. No operating force, user capability, product mass or site datum is invented.

## 1. Entry and ground-floor sanitary action

The nominal main route starts at the 1800 mm paired front opening, enters the hall, then turns toward the WC or follows the court-side circulation to the rear. The pair is not 1800 mm clear passage with one leaf open: each drawn leaf is nominally 900 mm, before frame/stop/hinge effects. Both-leaf release, hands occupied by shopping, latch reach, closing and a safe standing position require actual hardware and an occupied sequence.

The [OAS front-threshold study](../../docs/reference-house/opening-interface-studies.md) proposes a +15 mm crossing, 100 × 100 collector and a cropped outward-falling landing. It does not select the full approach. The general exterior −150 datum and near-door 0 datum leave a 150 mm transition whose actual slope, landing, edge and safe water route are unestablished. Therefore “level entrance” and a usable exterior carrying route are withheld. This is a specific OAS/HAD/DPL interface, not an excuse to invent a site ramp.

The current guest WC has a nominal finished rectangle **2175 × 2170 mm**. Its 900 mm door is on the north wall, low hinge (7650,2650), opening north toward the circulation. At its drawn 90° position the tip is (7650,3550), only **282.5 mm** below the solid court-wall face at y 3832.5. A 600 mm proxy approaching directly from the western hall cannot pass that tip. This does **not** prove every door-angle sequence impossible: the door can move, and the long route around the court can approach from the other side. It proves that a convenient direct approach and a fully open leaf cannot simply be superimposed. HAD/OAS must show the coupled person/leaf/handle sequence or change the local handing/location; a long court detour is a burden to compare, not an assumed solution.

Continue the action inside: close/latch, approach the pan, use it, approach the basin, wash, return to the latch and leave. The source pan is only a 400 × 650 footprint at x 9000/y 600, and the basin 400 × 400 at x 7337.5/y 600. Their orientation, seat, taps and reach are not supplied as products. As an explicit north-facing **trial**, a centred 600-wide front field would extend 62.5 mm through the pan's east room face; the basin's corresponding field would extend 25 mm through the west face. Offset standing may be possible, so these are alignment/operation questions rather than anatomical verdicts. They expose why fixture containment is insufficient. Door operation, assistance, transfer/support, cleaning and recovery after a fall remain untested.

There is **no ground-floor shower in this source**. The study can be a potential sleeping room, but temporary ground-floor living cannot be represented as a complete bathing arrangement on the strength of a reachable WC. The owner/HAD decides whether a proportionate washing/fallback provision is needed; no universal specialist-equipment requirement is imposed.

## 2. Bedroom and shower access: an exact adverse route

Bedroom 3's source bed occupies x 9400–11400/y 600–2100. Its north strip to the partition face is **487.5 mm**; south and east strips are each **182.5 mm**. The en-suite doorway is x 10450–11350 on y 2650, beyond that bed from the bedroom's ordinary entrance at x 8250–9150.

At the separator x 10000, still west of the en-suite aperture, a 600 mm circle above the bed requires centre y≥2400, but the solid north wall requires y≤2287.5. No centre satisfies both. The southern bypass is also only 182.5 mm. Thus the proxy cannot reach the en-suite from the bedroom entrance **even if all door leaves are removed**. This continuous interval argument does not depend on grid resolution. It narrows the existing room-level walking-grid pass: that audit omits furniture and accepts any reachable point inside each gross room box, not the actual sanitary approach.

The en-suite's nominal finished rectangle is 2020 ×1075 mm before its lining/service reservations. No shower, pan, basin, screen and complete use/cleaning/door sequence is fitted there in accepted source. A 600 circle entering an empty reservation would still not prove shower use. The adjacent [IAS selection](../../docs/reference-house/interior-family-selection.md) holds wet-floor depth and service-front release; a new shower tray cannot borrow unallocated depth from the 350 mm intermediate package.

The first correction to investigate is loose furniture and its actual access sides, then a proportionate room/door reallocation if that cannot earn the sanitary sequence. An unadopted HAD relocation trial is relevant evidence for that decision, not a source change made by BCR. Retest the entire bedroom-to-shower action, including shared occupation, products, screen/leaf operation, isolation and return, after any adoption.

Other bedrooms also need side-specific tasks. For example Bed 2 leaves 487.5 mm north and 182.5 mm south, with 282.5 mm at its west end. The sizeable area east of the bed is not evidence of access to every sleeping side or the front windows. Bed making, opening wardrobes and approaching controls need connected routes; isolated rectangles labelled “600 clearance” do not establish them.

## 3. Stair, bridge, guarding and escape

The current return stair has 20 rises of 172.5 mm,300 mm goings,1100 mm flights,1635 mm intermediate landing and a 200 mm well. Its pitch is about 29.899°. The west gallery is 1015 mm; the arrival/upper bridge band between y 2712.5 and 3832.5 is 1120 mm. These are source dimensions, before actual guards/handrails. A sensitivity allowance of 50 or 75 mm into each flight side would leave 1000 or 950 mm respectively; those projections are **study variables**, not selected rails or minimum widths.

The complete action is approach from the hall, turn onto the lower flight, grasp/release continuous support, ascend, reverse at the intermediate landing, ascend again, leave the upper flight, cross the bridge and open the bedroom door. Repeat descending and carrying an ordinary load. No simulation of these actions, useful rail grip, contrast/lighting, two-person assistance or stair-lift transfer is present. Do not infer them from rise/going arithmetic.

For a located headroom check, take the ordinary ground ceiling at+3100 as a **hostile overhead boundary**. At lower-flight nosing 6 (y 5332.5,z 1035), the vertical remainder is 2065 mm; at nosing 7 (y 5632.5,z 1207.5), it is 1892.5 mm. This shows where a 2 m diagnostic envelope ceases to fit below an uninterrupted ordinary ceiling. It does not assert that a solid ceiling exists across the stair opening. BCR-STRUCTURE/HAD must locate the real opening edge, trimmer/soffit and finishes against the continuous pitch line and landing, and reconcile the resulting support reservation. Upper occupied ceiling height is a separate 3100 mm relationship; roof-space headroom is not a substitute.

The source explicitly leaves entry-void guarding unselected. Its 2275 ×2295 mm void,200 mm stair well and 1120 mm bridge need actual guard position, height, opening geometry, loads and non-climbable/usable detailing. A line in plan supplies none of these. Changing a guard can change the route; reserving it after a circulation “pass” is unsafe reasoning.

For escape, the first occupied floor is+3450, but low building height alone does not approve an open stair/entrance void, smoke path or escape-window strategy. Trace each bedroom → door → upper circulation → stair → ground exit, then a place free from fire danger. The court is surrounded by the building: arriving there is not equivalent to reaching such a place. No protected route, detection design, smoke control, evacuation assistance or emergency lighting is selected by this study. These are current-revision EPR fire/HFI questions with concrete geometry, not a transfer of the predecessor three-flight review result.

## 4. Window and external-door operation

The source windows have 1000 mm nominal width and 750/2850 mm sill/head. OAS's 970 ×2070 frame study,60 mm face reservation and 15 mm nominal gap do not give an actual opening sash, clear escape aperture, control height, operating force or guarding solution. A window may need to serve ventilation, cleaning, shading, security and emergency egress without one duty defeating another.

At Bedroom 3's south window centred 10200, the bed sits only 182.5 mm from the inner facade; a 600 standing proxy cannot occupy that strip. Reaching over a bed is an unresolved operation, not an accepted control strategy. In the HAD rear-room study the low sofa is only nominally below the 750 sill; its back≤650 leaves 100 mm vertically, which does not establish handle/shade reach. The north kitchen station has only 20 mm beyond each nominal 80 mm trim field. Opening, cleaning and withdrawing adjacent components must be tested with actual sash/handle trajectories and a person in place.

The paired 2400 garden and courtyard apertures retain actual leaf/threshold questions. The court threshold cannot inherit the front study's open landing-edge spill. HAD's dining-chair field touches its garden-leaf bounding field with zero margin: retain this as a tolerance/occupation hold. The smallest correction may be moving loose furniture, not changing an aperture or accepting a cramped repeated action.

## 5. Large-component renewal, step by step

Use the source plant-water reservation 700 ×700 mm as a **plan-only test object**. Its mass, height, connections and actual duty remain unknown. The retained 1400 nominal east replacement opening offers a shorter candidate route than the 900 nominal gallery door. A 700 square crossing the centred 1400 aperture leaves 350 mm each side in the bare plan. Through the internal OAS 900-door trial's 820 between-frame dimension, only 120 mm total remains before leaf/stop/handles, carriers or protection. Neither subtraction proves a complete carry.

| Action | Current test / missing relationship | Consequence |
|---|---|---|
| Isolate, empty and disconnect | Source footprint does not locate valves, tools, wet discharge, electrical isolation or removable connections | Services/DEL must define safe isolation and first release; no assumed live removal |
| Support and withdraw | A 700 square can be considered in the source plant working territory, but lift height, hands, mass and fixing direction are absent | BCR-SERVICES supplies product/duty envelopes and a continuous task; no assumed one-person lift |
| Traverse the building boundary | External 1400 aperture is the useful conventional comparator; internal 820 trial is a materially tighter alternative | Test the actual clear door, turns, leaf release and protection with the selected object; preserve external access if it earns the route |
| Set down and remove from site | Outside approach, ground bearing, slope, equipment and legal access unknown | DPL/actual commission supplies these; no corridor label establishes a complete exterior route |
| Install and return to use | Reconnection, support, disturbed seals/boundaries and test access unknown | DEL records inspection/commissioning and reinstatement; a new box fitting the old rectangle is insufficient |

For a window-frame replacement, the nominal 970 ×2070 ×140 envelope likewise does not prove an inside-only path through 900 doors: flat passage is narrower than the frame, but edgewise turning might be possible. Show the real release, supported rotation, intermediate set-down and external work position before selecting a route. Do not remove an environmental boundary or guard to obtain a fictitious permanent access path.

The roof void has no accepted occupant/storage/renewal route. Its drawn 300 mm roof zone is vertical, not normal to the 25° face. ROF-04 is investigating those exact reserves; this study assumes no usable loft, hatch, platform or maintenance walk. Safe roof/court/facade access remains a separate located task with ROF/RWT and the actual site.

## Evidence and applicability

- Existing source geometry, [OAS interface cases](../../docs/reference-house/opening-interface-studies.md), [HAD furnished study](../had/had-03-furnished-design-study.md) and [shared budgets](../triad-interface-contract.md) are primary project inputs. The historical [human-factors brief](../../docs/reference-house/external-review-human-factors-inclusive-design-rh11.md) supplies reusable questions only; its obsolete dimensions and absent external response are not adopted evidence.
- [Approved Document K,2013 England edition](https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/443181/BR_PDF_AD_K_2013.pdf), paragraph 1.11/Diagram 1.3, supplies the 2 m stair-headroom guidance used as a diagnostic. Guarding and glazing need their applicable complete provisions, not a single number. It is guidance, not a project approval.
- [Approved Document B Volume 1, 2019 edition incorporating 2020/2022/2025/2026 amendments, with future 2029 changes](https://assets.publishing.service.gov.uk/media/67d2bb074702aacd2251cb94/Approved_Document_B_volume_1_Dwellings_2019_edition_incorporating_2020_2022_and_2025_amendments_collated_with_2026_and_2029_amendments.pdf), paragraph 2.10 and Diagram 2.5 (printed p.15), distinguishes actual emergency opening/continued escape from a nominal window or court destination. This 29 October 2026 review recognises the 30 September 2026 changes; the 2029 changes are future provisions. Real-project transitional applicability remains unestablished. No fire compliance verdict is made.

Primary official pages/PDFs inspected 29 October 2026. No new user disability, site, selected product or professional appointment is assumed. Guidance does not replace competent application to the eventual house.

## Proposed findings for BCR-PREFLIGHT

Every item remains **routed-pending / blocked** at its affected design claim. None is discharged by this investigation. BCR-PREFLIGHT integrates these into the shared matrix; this packet does not edit it.

| Finding / matrix IDs | Owner and design consequence | Discharge condition |
|---|---|---|
| OCC-01 entry/threshold; BCR-016/021/025 | OAS/HAD, eventual site owner: entry operation and 150 mm exterior transition unearned | Actual door/person/landing/level and water paths agree; legitimate pre-site residual only for genuinely external facts |
| OCC-02 guest-WC complete action; BCR-008/021/022 | HAD/OAS/IAS:90° leaf blocks direct 600-proxy approach; fixture front tasks and ground-floor washing incomplete | Source-bound coupled leaf/person/fixture sequence or adopted correction, applicable task/user brief and no hidden circulation burden |
| OCC-03 Bed 3→en suite; BCR-008/021 | HAD/house with IAS: accepted furniture blocks 600-proxy route before sanitary fit | Adopted furniture/layout and fitted sanitary action resolve connected approach/use/return; retest wet build-up and service access |
| OCC-04 stair/void; BCR-004/005/021 | HAD/house, BCR-STRUCTURE, EPR fire/HFI: actual opening, guard and complete ascent/escape unresolved | Located finished section and supported guard/handrail reservations, actual action route and applicable competent safety evidence |
| OCC-05 opening operation; BCR-017/021/022 | OAS/HAD: beds/sofas/trim cannot stand in for control, cleaning, guard or egress access | Selected operating geometry and connected task positions; security/ventilation/escape/cleaning duties reconciled |
| OCC-06 renewal; BCR-011/023/024/025 | BCR-SERVICES/DEL/OAS and site owner: dimensions alone omit release, handling and reinstatement | One actual component traced from isolation through safe exterior removal and recommissioning, with current envelope/mass and boundary duties |

The investigation completes the programme's required physical study through located counterexamples, conditional sequences and explicit missing inputs. It does not declare the house feasible, close BCR, or remove the obligation for design owners to resolve material internal fit and safety dependencies before adoption. Source changes, including any HAD relocation, trigger reassessment of affected findings. Appropriate repository checks, rendered-sheet inspection and exact-head CI are recorded in the integrating PR.
