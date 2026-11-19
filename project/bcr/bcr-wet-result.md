# BCR-WET — wet layers, sanitary fit and connected waste routes

**Result:** bounded physical investigation complete, with material design and qualification holds. No wet assembly, sanitary layout, stack or house-source change is adopted here.
**Starting main:** `d93250a949d253e1b5c189aac36721bdf661febb`, 29 October 2026.
**Owner:** [BCR #944](https://github.com/adamnoden/architecture/issues/944). The [programme](buildability-construction-resolution-programme.md) distinguishes a completed investigation from an accepted design. The shared matrix remains PREFLIGHT-owned.

## Decision for the house

Do not continue trying to fit the accepted small en suite by shrinking sanitary symbols. The accepted [HAD fit review](../had/had-03-ensuite-fit-review.md) already rejects two actual component arrangements. A thinner wet lining may reduce a layer penalty, but cannot remove the held service lining or prove fixture/door operation.

There is a thinner **tiling-layer comparison** worth developing with IAS: a fully supported 4 mm board can challenge the generic 26.5 mm dimensional trial. A nominal 20 mm composition is possible on paper, with essentially no spare depth. The manufacturer's separate wet-duty guidance prevents treating that arithmetic as a qualified waterproof floor. Match the actual exposure, product and jurisdiction scope, including any additional waterproofing, before selecting it. Bonding beds, joint treatment, substrate, tolerance and complete wall/threshold/penetration continuity remain real costs. This does not solve a level-access shower or allow waste pipe inside the finish.

For the unadopted larger Bedroom 4 alternative, a raised tray and exposed perimeter branch remain a meaningful comparison. The next decision is a **connected sanitary system**, including its actual stack fittings, basin and WC branches, vent, lower-room support and ground exit. Ending a polyline at the cabinet does not complete it. The two located stack-axis comparisons below make that missing length and access tradeoff visible.

## Source and physical evidence

The [current house basis](../../docs/reference-house/current-house-basis.md), [interface contract](../triad-interface-contract.md), [IAS wet variants](../ias/ias-02w-wet-kitchen-variants.md), [IAS service-access study](../ias/ias-02s-services-access.md), accepted HAD fit/relocation studies and compiler source control the baseline. The current house retains U-ENS3 as an unfitted reservation. The evolving rear-west proposal remains a candidate, even where its geometry is useful for this investigation.

The [A3 physical study](studies/wet-feasibility.svg), [exact source-bound values](studies/wet-feasibility.json) and [generator](studies/wet-feasibility.ts) record house-source fingerprints separately from product guidance and authored comparison dimensions. Run `node --import tsx project/bcr/studies/wet-feasibility.ts`; add `--check` to verify retained outputs. The plate supplies layer sections and connected-route alternatives, not a fabrication or plumbing drawing.

Primary material inspected on 29 October 2026:

| Evidence | What is used / boundary |
|---|---|
| Wedi [current linked wall/floor application guidance](https://www.wedi.net/fileadmin/media/downloads/01_fuer_Haendler/03_Dokumente_und_Downloads/Montageanleitungen/GB_und_UK/wedi-eu_bs_bb_v1-wall-floor-application_td_agu_screen_210x297mm_240904_en.pdf), pp 2–4 | Fully supported floor boards from 4; wooden substrate rigidity, fixing/sealing and tile conditions; stud spacing versus wall-board thickness. These are conditions on an actual assembly, not proof the source deck or partitions meet them. |
| Wedi UK [building-board brochure, manufacturer document hosted by NBS](https://asset.source.thenbs.com/api/pdf/974e16a5-d673-40ce-9148-7d1ea3e386ed), printed p 9 | 4 board on 4–6 bonding bed, full support, sealed joints/penetrations and mechanical fixation on timber. Publication date is not established from the document; current project-specific applicability must be confirmed before specification. |
| Wedi [wooden-floor application](https://www.wedi.net/en/competencies/product-applications/install-the-building-board/attach-the-building-board-to-the-floor/wooden-surfaces) and [610 sealant](https://www.wedi.net/en/products/system-accessories/bonding/wedi-610-adhesive-sealant) | Bonded, fixed, sealed system logic; a waterproof board core alone does not make the whole room watertight. |
| Wedi [sealing overview](https://www.wedi.net/en/competencies/theme-world/sealing) | Its DIN 18534 discussion states 10/25 board minima for named exposure classes, creating a scope distinction from the thin bonded-board application. This is neither a universal UK minimum nor proof that every 4 mm arrangement is impossible. |
| Mira [Flight Low manual 1493053-W2-D](https://resources.kohler.com/plumbing/mira/pdf/1493053-w2-d-mira-flight-low-level-installation-and-user-guide.pdf), especially dimensioned p 4 and installation instructions | Rigid waste, product-specific 18 mm/m minimum fall, waste access/testing and actual datum distinctions. The dimensioned page was visually inspected independently; compatibility with the delivered tray/waste/support kit remains an IAS selection duty. |
| Duravit [D-Code #211509](https://pro.duravit.co.uk/pro/html/default/product-details.uk-en.html?nser=7120&product=94738) | 355 × 560, horizontal rear outlet, 22 kg body. No verified outlet-height or connector take-off was retrieved; the plan midpoint used below is expressly an assumption. Ceramic dimensions have product tolerances. |

## Accepted small en suite and service front

U-ENS3 clear is **2020 × 1075**, x 9562.5–11582.5/y 2712.5–3787.5. Its 250-deep upper service lining occupies x 9862.5–10112.5. The nominal 900 door lies on the south partition; real leaf/frame/clear opening remain separate.

HAD's west-shower arrangement intersects that lining over **250 × 987.5**. Its 800 shower width plus 155 carrier plus 480 ceramic leaves only 585 across the room before further layers. The opposite arrangement leaves 190 in front of the pan. These accepted adverse results remain valid; they do not prove every imaginable compact arrangement impossible. The room's 2.1715 m² area and a nominal shower opening do not reverse them.

The service-front problem also survives a moved panel. IAS's 650 × 550 clear panel is a task-sized opening, not a full cistern/stack exchange route. BCR-SERVICES identifies the 300 unassigned distance between the gallery-side face and the lining, and distinct access/packing duties. The small-room panel position must be reconciled with the actual fixture, frame, pipe, reach and withdrawal task. Removing the lining or changing the room association requires an explicit HAD/IAS source decision, including where its former services go.

## Complete floor and wall comparison

The held intermediate section is **20 finish + 22 deck + 238 framing + 55 service + 15 ceiling = 350**, FFL +3450 and lower soffit +3100. Deck top is +3430. None of the lower layers is an allowance to spend on an unlocated drain.

A named **tiling-layer** comparison, top to bottom, is: selected slip/cleaning-appropriate tile; compatible tile adhesive; sealed wedi board and its treated seams/fixings; full bonding bed over a prepared, supported deck; the actual deck/framing/service/ceiling below. The board is continuously supported, staggered, mechanically fixed on timber and joined to the wall/penetration boundary using the matched system. Its material does not earn fire/acoustic performance, fixture support or removable-cassette status.

| Tile comparison | Bonding bed + board + tile bed + tile | FFL versus held dry floor | Interpretation |
|---|---|---:|---|
| 7 tile | 4–6 + 4 + 3 + 7 = **18–20** | −2 to 0 | 7 is the manufacturer's minimum thickness condition, not a selected tile. |
| 8 tile | 4–6 + 4 + 3 + 8 = **19–21** | −1 to +1 | 5 lower bed gives 20 nominal, with no space for uncounted levelling or local thickening. |
| 10 tile | 4–6 + 4 + 3 + 10 = **21–23** | +1 to +3 | An explicit level consequence, still less than the generic 26.5 trial but not flush as drawn. |

The 3 tile bed and 8/10 tile are authored sensitivity inputs. Local joint reinforcement/sealing, flatness correction, actual cured-bed thickness, movement profiles and tolerances must enter the final section. Do not turn this arithmetic into a promise of an exactly 20 mm installed floor. The manufacturer conditions include tiles at least 100 × 100 and 7 thick, no high-point rolling loads, and timber substrate checks: wood-based panels at least 16 with density 600 kg/m³, plywood at least 16 with density 520 kg/m³, or boards at least 21; screw penetration at least 20. Those are source-specific conditions, not new project specifications. The 22 deck's thickness alone does not establish its material, density, supported edges, screw engagement or stiffness. Continuous structural support and the manufacturer's substrate conditions remain BCR-STRUCTURE/IAS obligations. No underfloor heating or whole-room falls are included.

The current manufacturer sealing overview separately discusses 10 mm boards for W0/W1 and 25 for W2 under DIN 18534; the application guide also separates directly exposed sealing duties from general residential floor use. Product, exposure and jurisdiction applicability have not been reconciled. Therefore the 18–23 table is a tiling-layer budget only. A qualified additional membrane would add its full bonding/overlap/junction depth, or a thicker approved board could replace 4: using 10 adds 6, using 25 adds 21 to those arithmetic cases. Neither larger number is adopted as a UK house requirement. No unverified thin hybrid system is invented to retain 20.

The wall needs a different section. For an authored 3 adhesive + 8 tile, a 10 board produces 21, a 12.5 board 23.5, and a 20 board 31. The manufacturer's respective maximum stud spacings are 300/400/600; these are not existing selected house studs. The current PDF's text uses 400 for 12.5 board while one diagram labels 450; this comparison conservatively uses 400 pending a matched detail, not certification. Against a **hypothetical** 15 room-side finish being replaced, two opposing faces would leave the small-room depth **1063 / 1058 / 1043**. The 125 partition has no adopted layer split, so these are sensitivity comparisons, not source dimensions to silently substitute. A thin floor board cannot be fastened across unsupported wall studs by analogy.

Heavy sanitary fittings, enclosures, rails and cabinets require actual backing/frame/support. Their anchors must be located and sealed without making tile or a removable face the load path. At the floor-wall junction, carry the matched sealing transition and movement provision behind finish and boxing. At tray edges, reconcile the tray manufacturer's seal/support instructions with the wall/floor system; no unverified adhesive is assumed compatible with every acrylic or movement condition.

## Threshold, tray and the water boundary

For the larger candidate, the wet-to-bedroom boundary is the proposed partition at x 2400; its actual door/threshold position and opening operation are not yet selected. The nominal floor alternatives above change the wet finish relative to dry FFL by −2 to +3 before local additions. A transition profile must be independently supported and allow actual movement, water continuity, leaf sweep and passage. A flat decorative strip or bevel is not a containment dam, nor does a raised edge automatically provide acceptable access.

Keep the room's water boundary continuous under removable boxing and, where the selected supported tray detail permits, under the accessible tray region. Terminate it at designed wall/door boundaries. A leak above that layer can become inspectable; a leak through an unsealed penetration or below it can still wet the deck and lower room first. No floor-drain, emergency storage volume or guaranteed visible alarm is selected. The consequences of a blocked shower, escaping enclosure water and supply failure must reach MRA with their actual first-wetted surfaces.

IAS is developing a 160 rim comparison for the raised Mira tray. The **corrected** current manual p 4 distinguishes C25 rim-to-low-floor from D12 rim-to-higher sloping tray field; D12 is not local tray thickness or drain seating; the waste's 50 dimension runs downward from its flange reference to its outlet axis. The old IAS draft's 2.1/−6.4 under-tray diagnostic was withdrawn after this inspection and is not evidence here. If the flange reference coincided with the low wet face, a 160 rim would give flange/axis/bottom +135/+85/+54. The exploded installation puts the flange below the tray: let its unknown seating offset be δ. Then those values become 135−δ,85−δ,54−δ. The actual local tray/gasket/seating datum must be measured or dimensionally bound; no δ range is certified. IAS must also bind outlet orientation, legs and product revision before adoption. A 40-profile tray is not itself a 40-deep waste assembly.

A supported raised tray avoids an automatic structural recess but adds a real step and harder under-tray inspection. A flush alternative requires a complete supported floor/drain redesign. Neither option may hide its trap in the 55 void by drawing through the 22 deck and 238 framing. Keep those options distinct until the actual step, enclosure operation, support, fall, tool access and renewal route agree.

## From fixture to stack, then out of the house

The accepted source's small-en-suite branch is a plan polyline from (10900,3450) through (10100,3450) to (10100,4850), **2200 long**. It has no adopted service duty, diameter, invert, slope or fitting geometry. As a diagnostic only, a 43 outside-diameter shower line following it at Mira's 18 mm/m would need **39.6 fall + 43 body = 82.6 vertical envelope**, exceeding 55 by 27.6 before supports. This is not a WC gradient or hydraulic capacity claim. The physical crossing from the fixture to that service void remains unresolved independently of its depth.

The rear-west alternative makes a separate stack cabinet visible in the ground rear sitting room. Its gross envelope is **300 × 750**, x 417.5–717.5/y 8800–9550. An authored 18 face each side leaves **264 × 714**, before grounds, support, acoustic/fire treatment and fittings. A bare 110 circle is only a body-packing comparison; the whole cabinet is not a structural floor hole.

The IAS shower route arrives at (492.5,9500). This is an **entry**, not a selected stack junction. Compare two stack axes without adopting either:

| Located comparison | Additional shower travel from cabinet entry | WC plan travel from assumed rear-face midpoint (717.5,8977.5) | Consequence |
|---|---:|---:|---|
| South axis (567.5,8977.5), aligned to WC in plan | 597.5; **10.755 extra fall** at 18 mm/m | 150 | Short WC connection but more low-level shower travel and remote northern access. |
| North axis (567.5,9450), toward routine access | 125; **2.25 extra fall** at 18 mm/m | 622.5 | Shorter shower connection but a longer WC branch with real bends/slope/access; bare pipe already leaves only 27 to the assumed north inner face. |

These are orthogonal geometric lengths, not socket take-offs or required centre lines. WC outlet height and actual branch/connector bodies are unknown; a ceramic's plan symmetry is not connection certification. The revised IAS 2685 shower run would reach the cabinet at axis +(36.67−δ) relative to finish before these extra lengths, if its +(85−δ) start and 18 mm/m apply. An authored 60 envelope leaves only 6.67−δ below it at entry. The north extension gives axis 34.42−δ and underside 4.42−δ; the south gives 25.915−δ and underside −4.085−δ. Thus the southern route with that hypothetical 60 body would intersect the proposed finish plane even before positive seating offset; it needs another connection geometry or explicit floor change. This is a **conditional falsification test**, not a measured fitting rejection. Actual product/socket/clip dimensions, revised outlet routing or a better stack location can change the result; preserve a credible simpler connection rather than force the old line.

The basin needs its own reachable trap and supported branch to the selected stack. Do not combine it into the shower line merely because two lines meet in plan: fitting direction, trap protection, gradients, flow interaction and cleaning duties require actual design. WC water supply/cistern, service isolation and full cistern renewal are also absent from a pan rectangle. Above, specify a real vent/air-pressure strategy and terminal; below, independently support the stack, locate its base bend/cleanout and route through the ground-floor/foundation section to a declared foul-water handoff. The external connection is site-dependent, but the internal route and support are architectural obligations now. No vent is silently put through the provisional roof.

## Isolation, service, drying and reinstatement

| Event / complete task | Proposed physical sequence | What prevents a false pass |
|---|---|---|
| Normal shower cleaning | Stop use; enter safely; lift and refit the actual top-access hair-trap parts; run water and inspect | Top access does not replace the housing, union, tray support or hidden branch. |
| Branch leak/blockage | Stop discharge and isolate the relevant supply; protect the occupied route; open the local independent face; contain/drain water; support pipe before disconnecting accessible joints | A permanently bonded joint may require cutting and a planned repair length; “removable boxing” does not make it demountable. Tools, retained water and replacement sockets need room. |
| Trap/housing renewal | Open a proven tray-side access route; reach actual union/fastenings without removing required support; support/disconnect and withdraw the component; inspect and dry the water boundary/deck as affected | A low front cover does not prove reach to a remote north outlet through legs. If inaccessible, exchange tray or change the architecture; do not call it routine service. |
| WC/cabinet work | Isolate and drain cistern/supply; support and remove the pan if it blocks the east service face; cap/secure the open drain; remove the actual branch or fitting through its working field | The 22 kg ceramic needs handling/staging and actual fixings. A north hatch is not a 750-long reach tunnel. Complete cistern and stack renewal require separate release/length studies. |
| Water below finish or at a penetration | Identify and stop the source; expose affected local layers; assess support and contamination; dry and inspect before closing; replace damaged seals/substrate and test the repaired route | No invented drying time or moisture threshold. Waterproof board can conceal a wet deck below; a dry tile surface proves nothing about it. |
| Return to use | Reconnect and support; test actual supply/waste joints and disturbed water boundary using applicable instructions; inspect while exposed; reinstate fire/acoustic/movement duties; refit covers and update records | Commissioning and reinstatement evidence belong to DEL/actual installation. The virtual study does not certify a completed repair. |

Kitchen/utility use the same source/first-wetted-surface/isolation/withdrawal questions, with actual appliance connections and doorway levels. No decorative drain or unselected whole-room containment is introduced. Ground wet rooms have their own unresolved 300 reserve and cannot inherit this upper-floor section.

## Findings for serial PREFLIGHT integration

Every following material design obligation remains **routed-pending / blocked**. The bounded investigation can complete with these adverse findings; no selected-house fit or technical acceptance follows.

| Finding / receiving rows | Owner and discharge condition |
|---|---|
| BWT-01 / BCR-007, 019, 023: wet depth is system-specific | IAS with structural/HAD owners: choose a complete supported floor/wall system with reconciled wet-duty qualification, local sealing build-up, tile and tolerances; reconcile finished levels/faces and actual deck/support conditions. Thin-board arithmetic alone is not acceptance. |
| BWT-02 / BCR-008, 021: current compact room and service front remain unfitted | HAD/IAS/OAS: adopt a coherent sanitary/door/service arrangement or explicit programme-preserving reallocation; reconcile former room/lining/tasks and recheck all complete actions. |
| BWT-03 / BCR-007, 010: tray/drain datums and route must belong to one assembly | IAS: bind current matched tray/waste/support instructions and actual outlet/leg geometry; show usable access, continuous fall and end connection, or select a simpler arrangement. Withdraw superseded calculation claims. |
| BWT-04 / BCR-010, 011: cabinet entry is not stack connection | Services/IAS with BCR-STRUCTURE: select actual stack/branch/connector/vent/base geometry and supported openings, including the south/north tradeoff and basin/WC duties; resolve internal route before site handoff. |
| BWT-05 / BCR-009, 016, 019: threshold and first-wetted boundary incomplete | IAS/OAS/HAD with MRA: define complete floor-wall/tray/penetration/door water path, movement and finished passage; name blockage/supply-release destination and visible inspection/drying path. |
| BWT-06 / BCR-003, 005, 006: wet loads and holes need supported assemblies | Structural/IAS/services: actual local loads, fixings, framed penetration, acoustic/fire reinstatement and stack support; cabinet area or deck thickness is not evidence. |
| BWT-07 / BCR-021, 024, 025: service and renewal require full operations | IAS/HAD/DEL: actual trap/union/cistern/tray/stack access, removal tools, component length/weight, staging and dry/reinstate sequence; recheck the lower sitting-room maintenance state and exterior route. |
| BWT-08 / BCR-001: candidate adoption changes applicability | PREFLIGHT/HRS: bind final HAD/IAS source heads, re-run affected plan/section/route studies and reconcile accepted-source identities. Keep this conditional comparison distinct from a selected sanitary system. |

## Validation and limits

The generator imports current house geometry and retains explicit external inputs. Arithmetic and artifact checks, TypeScript/repository validation, rendered A3 inspection and independent IAS/HAD/structural seam review are recorded in the PR. Exact-head full CI is required before merge. None establishes hydraulic capacity, waterproofing performance, load capacity, human handling, statutory compliance or construction readiness. Current house source, shared matrix, maturity and external-evidence status remain unchanged.
