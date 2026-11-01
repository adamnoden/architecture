# HAD-03 — source-bound courtyard escape: plan and paired sections

**1 November 2026 · bounded architectural decision study · NOT source adoption or house selection.** This is an architectural continuation of the [RWT-06 negative gravity-egress disposition](../rwt/court-egress-architectural-rewind.md), not a claim that water or structural design is solved. It tests the controlled [RH-LAYOUT-REVISION-02](../../docs/reference-house/current-house-basis.md) by drawing a connected plan, **north court–family–garden** section and **east court–gallery–pantry–exterior** section at explicit coordinates. The [ground-water policy](../../docs/reference-house/ground-water-policy.md), [STR-GROUND option reduction](../str/ground-movement-foundation-options-result.md), [HAD threshold first-failure register](had-03-court-threshold-first-failure.md), [raised-section sensitivity](had-03-undercroft-section-screen.md), and [RWT-ROBUSTNESS fault tree](../rwt/rwt-robustness-result.md) govern what can be claimed.

The graphics are deliberately **source-generated, not re-drawn when the model moves**. The [renderer](studies/court-egress-study.mjs) imports the accepted layout and opening schedule, guards the intersections and checks the committed [geometry/uncertainty ledger](studies/court-egress-study.json) and SVGs. Its `--check` is exercised by the existing `test:drawings` repository test family (`scripts/court-egress-source.test.ts`), so a project-study change does not masquerade as a compiler-engine change. Redraw on source revision rather than assuming today's overlays remain applicable. The coloured drain centrelines in section illustrate **connectivity**, not a selected invert, bore, gradient, head, joint, portal or discharge capacity. The 1:25 dimensions apply only to the declared trial datums and accepted source extents.

## Drawn evidence

- [01 — ground plan / intersected rooms and openings](studies/court-egress-plan.svg)
- [02 — north longitudinal section / court to garden](studies/court-egress-north-section.svg)
- [03 — east transverse section / court through service geography](studies/court-egress-east-section.svg)

The three drawings describe **one orthogonal N/E pair** on the same accepted 12,000 mm square and 3,500 mm court. Both section cuts start at the same court datum; the option comparison raises the building **relative to a fixed illustrative exterior grade**, not the external terrain with it. N = ordinary water route; E = passively operating emergency escape when the primary is blocked. Different letters, plan directions and receivers are **not** an independent-capacity or harmless-flood verdict.

## What the actual plan permits—and what it does not

| Crossing | Controlled source facts | Architectural consequence |
|---|---|---|
| **N, x=6,000** | Court north edge y=7,750; outer north face y=12,000: **4,250 mm**. Both north court and garden doors have 2,400 mm nominal apertures centred x=6,000. Family/dining occupies y=8,167.5–12,000. | The two door *openings* terminate at their sills. Neither implies a free hole below the threshold. Show separately supported, air/thermal/water-safe threshold bridges, a real bearing path around the service portal and whole-pipe replacement access; the family/dining floor cannot become an inaccessible sealed carrier |
| **E, y=7,000** | Court east edge x=7,750; outer east face x=12,000: **4,250 mm**. Crosses the east court wall, **1,270 mm** nominal gallery clear (x8,167.5–9,437.5), the **125 mm** service partition (x9,437.5–9,562.5), and **2,020 mm** pantry clear to x11,582.5. | The axis is within the **ground court-east window** bay centred y=6,850 and the **outer-east window** bay centred y=7,400. The passage would be **below nominal +750 mm window sills**, not through the glass; it still cuts both wall/footing support territories, the spine, floor layers and pantry. No sash/window support is deemed adequate by proximity |
| **Open north loggia** | Replacing the 2,400 mm garden-axis internal family strip across the y8,167.5–12,000 ring displaces **2,400 × 3,832.5 mm = 9.198 m² gross** from the existing family rectangle | Not a minor drainage alteration. It needs a new exposed thermal enclosure, family/dining furniture arrangement, protected door/walking sequence, roof and masonry load path, and a distinct normal rainwater system. Rejected as a surreptitious fix; retain only as an overt owner-level replan |

This is not a claim that any underfloor aperture is structurally possible. STR must identify load-carrying wall, portal/arch reactions, bearings, corner and pier stability, uplift/heave and movement separation; a pipe may not act as a structural tie or be locked into sacrificial permanent fabric. IAS must locate removable supports and independent floor layers. OAS must make both door pan/threshold and window-base junctions real.

## The drawing that defeats an unchanged-ground solution

The inherited design's ground FFL is **z=0**; the shared schematic exterior grade is **z=−150 mm**. It is **not surveyed**. If a genuine human-accessible dry undercroft is the answer, the [necessary inequality](had-03-undercroft-section-screen.md) is `D ≥ T + H + F`, where D is finished floor above the **fixed real external level**, T the *complete* supported/insulated/sealed floor, H genuinely clear working height **after** obstructions and F the justified freeboard/movement/exposure allowance. In the explicitly authored **T=300, H=900, F=0 sensitivity**:

- Minimum relative floor above fixed grade: **1,200 mm**;
- Current drawn separation: **150 mm**;
- Additional rise of the whole building **relative to fixed grade**: **1,050 mm, before any F**.

The two 1:25 sections therefore draw a *conditional* FFL **+1,050** in the old global datum and keep exterior grade **−150**, with 300 mm floor and a theoretical 900 mm clear envelope. These are **illustrations**, not accepted levels. The actual open void may be reduced by ground beams, ventilation, fire/gas/moisture closures, crossing services, supporting piers, safe access and flood margin; `F=0` is not an acceptable construction assumption. An actual site high-water line may rise into this space and invalidate it. **Lowering a local well rather than raising the house creates the very pump/tanking dependence the owner rejects.**

A raised house also creates a serious front-entry and garden-interface problem. For scale, gaining 1,050 mm over an illustrative **1:20** continuous gradient takes **21 m of horizontal run before landings and turns**; that is arithmetic, **not** a claimed UK access rule, an available plot length or an adopted ramp. The current centred front and garden doors, Georgian plinth, steps/terraces and step-free access must be resolved together. Raising both house **and** garden equally supplies no additional differential discharge head.

### Why the two drawing cuts are not a hydraulic solution

**N:** the lower unadopted pan z−180 (perimeter) / z−215 (illustrated low) relative to FFL can, in a raised-site trial, lie above fixed exterior grade. That enables a *candidate gravity topology*, **not** a carrier invert. Court inlet, supporting opening, separate replaceable water-tight connection, room-side renewal access, undercroft dryness and actual receiving event must all be drawn and tested. The source plan's two 2,400 mm doors make a simply unsupported under-sill shortcut especially unacceptable.

**E:** a separate exposed relief intake, possibly at the historical *uncomputed* z−75 trial crest, needs a functional and inspectable route through the east court wall under the window, gallery and pantry to **another external hazard/receiving territory**. Its operating head may exceed crest; the hypothetical z−50 operating-water target sits only **5 mm below** a hypothetical z−45 sill underside. That underside is **not** the lowest demonstrated vulnerable joint. E must take the *assigned full degraded inflow* with N blocked, with no wall, pan, door jamb, cavity or DPC wetted first. It cannot borrow N's final flooded gully, be hidden behind pantry fittings or depend on an electric pump. E's surface-level intake must still work with blocked paving joints, common leaves, splash, freezing and maintenance-lapsed conditions.

Both routes require a **repeatable repair operation**, not just eventual access. At minimum show the first removable cover, controlled release of retained water, shortest removable segment and tool path, a supported withdrawal direction, temporary rain safety during the repair, the still-functional independent path, exterior end access, reinstated seals and inspection of leakage. A beautiful brass/metal outlet does not waive MAT's complete-installed-constituent policy or a structural movement joint.

## B / D / C decision, not option proliferation

| Family | Structural/architectural result | Disposition |
|---|---|---|
| **B — raised house over a genuinely dry accessible undercroft** | Could accommodate separate N/E gravity routes **if** actual fixed external high-water/levels, structure, front/garden approach and whole-floor interfaces all cooperate. Major +1,050 mm illustrative relative-level consequence is now visible | **Leading conditional architectural *trial***, not selected. Prioritise site section / entrance integration and STR's wall/pile/ground-beam alignment |
| **D — keep current level with a shallow accessible normal route and separate daylight relief** | Avoids wholesale plinth rise, but the normal pan is z−180/−215 compared with schematic external grade z−150; no useful daylight fall or clean wet/dry release is established. Old shallow E cover/thermal envelope failed prior screens | **No present positive demonstration.** Only reopen when actual separate lower receiver/high-tailwater data and an actual complete structural/thermal/threshold section falsify those failures |
| **C — north open loggia / break the enclosed courtyard ring** | A genuinely passive water escape is architecturally easier to see, but consumes significant family/dining area and undermines the central court–family–garden arrangement | **Reject as drop-in; full replan only** if B/D fail on an actual suitable site |
| **A — excavated, pumped or tanked service basin** | Creates a wet space to solve another wet-space problem; inaccessible or actively dependent | **Reject against the governing owner policy** |

**Recommendation:** continue with **B as a source-bound conditional architectural challenger** and retain **D as a tight evidence-dependent comparator**. Do **not** raise the accepted 12 m house on paper, revise its roof, or change the three existing north doors yet. The stronger conclusion is that **the present house has no adopted court water escape** and site selection must incorporate a gravitational freeboard/accessibility question early. If real plot data make B untenable or full-duty E cannot avoid the first harmed fabric, deliberately redesign the court/house rather than continue fitting deeper concealed pipe.

## Decision boundary, owners and falsifiers

The next design acceptance requires the same connected section to locate (not merely name):

1. **HAD/owner architectural trial:** real front entrance, garden approach, 3.5 m court and north/east openings, minimum usable household rooms/circulation and truthful appearance at the proposed relative levels. Reject if raised plinth makes site use or room quality fail.
2. **STR-GROUND/STR-HOUSE:** actual wall/pile/ground-beam/portal and floor support paths, movement clearances and weather/gas boundary across N/E. Reject if an intact masonry load path cannot be reconciled with the service portals.
3. **OAS/IAS:** matched actual pan, first susceptible joint, door/window support details and a separately removable complete floor/access section. Reject if operation or repair consumes permanent masonry, seals or room function.
4. **RWT-06/RWT-07:** source-to-inlet-to-outlet *and faulted* paths, whole assigned storm and roof run-off, hydraulic capacity at actual operating head, independently harmless high-water receivers. Reject if E's flowing water reaches any actual first harmed junction or shares a common blocked cut.
5. **DPL/DEL/MRA:** measured lawful receiving levels, soil/trees, flood/backwater/access/exterior work territory and downstream failure/commission assurance. Reject any ungrounded assumption that plotted street/ground is lower or gravity disposal is available.

**Outcome of this bounded HAD-03 study:** the source intersections and scale costs are drawn; an unchanged-grade dry undercroft is rejected; B is conditionally preferred for next joined architecture/site challenge, D stays unproved, C needs a conscious replan. **No option passes** technical, material or site acceptance. The **HAD-03 packet remains planned** because complete house architecture and a genuinely admissible court scheme are not yet selected. Its dependent **RWT-06 remains blocked**, which correctly prevents unearned downstream rainwater synthesis; the study contributes concrete source-bound inputs to the next integration work without manufacturing a positive closeout.
