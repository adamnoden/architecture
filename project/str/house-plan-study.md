# STR-HOUSE: joined solid-wall comparison B

**Frozen unadopted comparison, 30 October 2026. STR-HOUSE remains open.** The plan demonstrates a much more coherent alignment of substantial internal walls, a closed four-bedroom/two-en-suite topology, and concrete floor/arch/service junctions to develop. It also demonstrates two material front-bedroom compromises and tight shared-room operating space. Those findings should keep HOUSE unpassed; a collection of positive route targets must not conceal them.

The owner's preference has been treated as an architectural direction: solid rooms, genuine arches, direct bearing and redesign before casually transferring heavy walls. The comparison does not claim that every solid wall must carry floors, that every necessary force is compression, or that any construction has a proven universal psychological effect.

## 1. Source and authority

The source is `RH-LAYOUT-REVISION-02` / `RH-LAYOUT-FAMILY-02`. The ten file blobs retained in `house-source.json` were checked against the HOUSE integration baseline at **68d0273f928681aed7222bba2927dc8a89ae5ead** and all matched exactly. The geometric source files are:

| Source | Git blob |
|---|---|
| `compiler/reference-house/georgian/layout-revision.ts` | `af955c7da2e2469fd24598f98db6fc942a119ed3` |
| `compiler/reference-house/georgian/layout-family.ts` | `30ef287f3176e0f4cf2b03ef57c4fdfc915494c9` |
| `compiler/reference-house/georgian/section-exemplar.ts` | `75bf5c749da5095c07eed46105817a79095ca418` |
| `compiler/reference-house/georgian/source.ts` | `1edcfe12392e7b56bf957ffa10a57e21878f3fa0` |

The [source inventory](studies/house-source.json) and its [guarded generator](studies/house-source.ts) own the current repository binding. This investigation changes no accepted house geometry.

The other governing sources are the BCR structure, occupation, wet, services and preflight results; the owner brief and programme ledger; HAD's furnished-room and Bedroom4 studies; IAS's wet-room successor; the structural brief; and the merged ground-water policy. HAD furniture and fixture positions are unadopted comparisons. Their actual envelopes and duties are accounted for, but their initial coordinates are not treated as an immutable owner requirement.

## 2. Comparisons kept distinct

**A — retain the existing topology and make it solid.** This is an adverse control. The original upper internal centreline is 37.9925 m: only 16.6025 m is collinear with a lower partition, including 3.5 m over lower doors;21.390 m has no such lower line. Collinearity itself is not a capacity finding. Simply enlarging 125 planning partitions does not repair the source bed, sanitary, stair or load-transfer conflicts.

**Envelope sensitivity.** Holding the 102.5 weather leaf,160 cavity and 15 finish, increasing the structural inner leaf 140→215 enlarges the envelope 417.5→492.5. With the same shell/court and a 2400 stair kept out of the thicker outer wall, the ordinary band falls 3415→3265 and the west gallery 1015→865. The190-core sensitivity gives 3315/915. These are reasons to compare role-specific solid systems, not to enlarge every wall by declaration. A larger shell, smaller court or outward-growing local bay is an explicit different geometry.

**B — joined replan.** Retain the 12 m shell,3500 court, source 417.5 envelope and 1100 stair flights. Shift the entire 2400×4335 stair 600 north. Reallocate room shapes, mirror the upper wall lines below, place the rear divider on x7400 and explicitly change opening/fixture/service locations. This gives a useful structural hypothesis but does not yet provide four unqualified comfortable double bedrooms.

## 3. Frozen B geometry

Unless stated otherwise, internal finished walls are **170 =140 core +15 finish each side**. The thicker rear divider, rear-east wall and rear-west return are **245 =215 core +15 each side**. These are real spatial envelopes for comparing solid construction; no material, load-bearing capacity or finish system is selected by the arithmetic.

| Element | B coordinates / operation | Consequence |
|---|---|---|
| Stair | x417.5–2817.5; y4432.5–8767.5 |1100 flights,200 well and 1635 landing retained; no narrowing to preserve inherited fittings |
| Front-west L | north wall y3247.5 to x2817.5; return x2817.5 to y2650; main north wall y2650 | Mirrored on ground as the study/cloak boundary; new study opening 1350–2250 in the L north wall |
| Front-east L | head-room north wall y3700, x9300–12000 | Mirrored below by a 1400 structural plant opening, x9650–11050 |
| Wet/service spine | x9300 |200 west of source 9500; gallery 1047.5 before projections; actual old guest pan and lining cannot simply remain |
| Family bath north / plant north | y6500 | Upper line retained; lower plant wall moves from 6650 to align |
| Rear-west boundary | y8852.5, x0–4450; door 3100–4000 | Its north face 8937.5 clears the shifted stair; nominal east jamb 450 |
| Rear-west return | x4450, y8012.5–8852.5;245 finished, both floors | Reaches actual court inner-core territory and closes the former 600 bypass; not automatic thrust resistance |
| Rear wet/reading divider | x2902.5 | Upper door 10350–11250; lower 1500 opening 9400–10900 |
| Rear divider | x7400, y8167.5–12000;245 finished | Lower1500 arch 9450–10950; avoids the source x6000 wall over central court/garden apertures |
| Rear-east boundary | y8290;245 finished | Principal/gallery opening 8250–9150,900 rather than former 1000; pantry/en-suite opening 10450–11350 |
| Utility access | Close spine opening y1050–1950; new 900 north opening x10250–11150 at y2550 | Entry from plant vestibule 2635–3615 instead of through the guest WC |
| Entry void | x4885–7115, y417.5–2735 | Bridge depth 1097.5 before actual guard/trim/frame projections |
| Court-south lower door |1800, x5100–6900 | HOUSE comparison to improve finite floor reaction geography; source 2400 remains a control |
| Upper court-north right window | x6200–7200 |150 west of its source location, leaving 77.5 to the rear-divider finished face |

The rear-east 900 opening ends 65 before the shifted spine's west finished face 9215. That is a nominal geometric fit, not a rated frame, arch abutment or installation tolerance. Likewise, the 450 rear-west jamb and transverse return require an actual tie/collector or engineered abutment/foundation route.

All B upper internal centreline lengths have a collinear lower line. This removes the initial casual floor-supported-wall topology; it does **not** establish finite bearing through the actual lower openings, floor-end junctions, material strength or foundation support.

## 4. Bedrooms: the material adverse result

All four beds retain double-bed dimensions: three 1500×2000 and a 1600×2000 principal bed. B provides 28 named upper station routes, checked over complete axis segments for a 600-diameter circle. Those stations include a lower/middle point on each bed side. They do not measure the complete length of a bedside.

`house-bedside.py/.json` therefore computes the actual horizontal clear strips over every part of each bed. It finds:

| Room | Planning area | Bed | Minimum west / east strip over full length | Material qualification |
|---|---:|---|---:|---|
| Bed2 |10.6193 m² |1500×2000 |622.5 / **192.5** | The eastern head side lacks a 600 strip for 497.5 of its 2000 length |
| Bed3 |11.5435 m² |1500×2000 |**65** /632.5 | The western head side lacks a 600 strip for 960 of its 2000 length |
| Bed4 |13.4403 m² |1500×2000 |650 /627.5 | Full-length nominal side strips survive; actual furniture, opening and comfort tasks remain |
| Principal |12.9259 m² |1600×2000 |967.5 /832.5 | Walk-in masonry is replaced by a wardrobe; not a silent claim of identical storage programme |

The front rooms use deeper head nooks to earn foot/window access. Bed2's foot strip is 645; Bed3's is 1107.5. Their head-side pinch points are real geometric compromises. A 600 strip is the existing diagnostic, not a universal regulation, but 65 or 192.5 should not be described as full bilateral bed access. The next comparison is **greater bedroom allocation or a shell/court proportion rewind** if full-length bilateral access is part of the intended comfort brief. B must not be declared successful by turning the beds into singles or relabelling the compromised sides.

The Bed2 wardrobe is the source-sized 1500×660 envelope on its solid east wall, x4055–4715/y600–2100. The earlier small front-wall wardrobe cut off the tested foot/window route and is retained as a not-found diagnostic control. The Bed4 island wardrobe has a valid geometric envelope but needs a new credible tip-restraint/furniture construction; it cannot inherit wall-mounted PAX approval.

## 5. Enclosure is independently established

`house-enclosure.py/.json` decomposes the plan at every finite wall face and endpoint. Only cells sharing a positive-length edge connect. It closes one named door with actual wall thickness, then checks whether the enclosed space still reaches the shared hall. Furniture, the stair and entrance void are excluded so that they cannot disguise an open wall end.

All eleven named private/secondary-space checks behave as intended: the room reaches the hall with its relevant door open and is separated when that door closes. The four bedrooms include their own en suites where applicable; each en suite is also checked separately. The revised utility is independently enclosed from the guest WC.

The old rear-west wall ending 4250 without the return still reaches the hall with its door closed. That exact adverse topology remains in the output. This proves the return solves an actual enclosure defect, not just a diagram's appearance. It is a point-connectivity result, not a frame/door privacy rating, person-clearance result or escape approval.

## 6. Joined ground furnishing and operations

The ground plan now contains actual loose-furniture reservations rather than a blank shared bay. One source 1900×850 sofa sits in the 6.348 m² reading territory. The source 1900×750 sofa is rotated in the 13.4403 m² family/dining bay, faces **west**, and has a nominal 662.5 front strip toward the reading arch. An earlier placement against that wall blocked 1300 of the 1500 opening in plan and is rejected.

The former 1600×800 table becomes an explicit **1200×800 four-place comparison**. Four500×500 chair rectangles have separate 600×600 occupied/pullback fields. Two300 side tables replace the former 1200×550 coffee table. The two sofas and six-chair bounding field were study choices, not fixed owner counts; this reallocation is explicit. It does not claim identical hospitality capacity or comfortable simultaneous use.

The strip between the eastern dining fields and the rear-divider face is **677.5**. A 600 circle can pass alongside the occupied fields in the tested state. The sofa's662.5 strip can also receive the tested front stations. Seated legs, entering/withdrawing chairs, serving people and passing someone already seated are **not** earned by those results. The two seating territories should not be advertised as one generous eight-person group.

`house-ground-actions.py/.json` provides 18 complete verified route witnesses for each of two garden-door comparisons. They include study-chair approach, stair entry, utility turn and entry, plant working stations, pantry, both sofas, rear-stack access, kitchen stations, refrigerator-front reservation and garden passage. The ordinary candidate can retain the **2400 garden pair**;1800 is a separate successful plan-route sensitivity, not a necessary adopted reduction.

One actual furniture/door clash remains consequential: a 44-thick fully open inward **court-north** leaf intersects the southwest dining chair. The2400 pair gives 22000mm² of rectangle overlap; an 1800 pair still gives 9570mm². The investigated correction opens that pair toward the courtyard. This removes the indoor footprint but does not establish an external landing, water threshold, hold-open, wind, security or courtyard-use result. It is separate from the 1800 court-**south** structural comparison.

The guest pan moves from 9000–9400 to 8700–9100 because the old position intersects the new 9215–9385 spine. The utility entrance moves to its north wall: a 900×44 high-hinge inward leaf and 600 turn through the 980-deep plant vestibule have a plan witness. Actual laundry equipment and renewal remain unselected. The pantry shelf and cold-store position are represented; the kernel of the old discontinuous-pier kitchen survives, but latest HAD appliance, dishwasher, worktop/window and operating studies must be reconciled rather than claimed by these boxes.

## 7. Wet rooms and services

The rearranged rear wet cell is 2400×2645 at finished faces,6.348 m². Its1000 tray is in the southeast internal corner, WC on the northwest pier clear of the north window, basin on the south wall, and 300×750 stack cabinet in the northwest service territory. This preserves the 1100 stair flights. The old HAD cell cannot merely translate: its retained south face would overlap the shifted stair 475, and a simple 645 north translation would put its north wall 35 into the outer finished boundary.

The principal en suite is a separate 900-tray comparison in 3.4775 m². The5.7794 m² family bathroom contains a 1700×700 bath envelope, WC, basin and localized service cabinet. These are actual proposed objects, not an empty room being called fitted; product, screen and full occupied operation remain separate.

The former long upper lining x9862.5–10112.5/y2762.5–8167.5 overlaps the new Bed3 by 250×762.5. It is retired as that occurrence. A local 600×750 family-bath cabinet x9385–9985/y4675–5425 contains the gross 550×700 riser x9410–9960/y4700–5400, giving 25 on each side. That is gross packing, not an internal free section. The structural opening needs a real trimmed bay; the 40 between riser and spine core is not a usable hollowcore sliver.

The ground water reservation is repacked at 9485/3900, with the riser at 9410/4700 and Q350 body at 9862.5/5550. Their y gaps are 100/150, and Q350 ends 140 before the plant's north finished face. The service strip loses 85 of depth with the aligned plant north wall. The original water location across the new 1400 arch leaves 212.5/487.5 side gaps and cannot retain a 600 passage; that failed control remains.

`house-wet-actions.py/.json` provides explicit **open-entry → coupled close → closed-room task → reverse/open/leave** proxy sequences for the rear wet door and revised inward guest-WC door. Every retained route segment and bounded rotation is checked. Rear route reserves range 12.5–40; guest reserves 10–48. These small numbers are geometric margins after the declared 600 body,44 leaf and handle/reach assumptions; they are not installation tolerances or human-use approval.

The family-bath surface-slider comparison has a different unresolved duty: parking outside on the gallery wall does not automatically supply an inside-operable handle across solid masonry. Its actual leading edge, stops, grips, clear opening and inside close/reopen sequence must be drawn. The principal en-suite door/screen sequence is also incomplete. Positive open-door fixture routes do not discharge either task.

The moved trays, stack and outlets cannot inherit IAS's previous floor/trap/fall result. Their actual outlet lengths, gradients, traps, containment, thresholds and structural floor layers must be rebound. Rear routine stack access is from the cabinet's south end; pan removal/east-face access and complete component withdrawal are different tasks.

## 8. Support and section seams

The source 3415 dimension is finished-face space, not the structural span. In the south band, source inner-core faces are 3445 apart and core centres 3585 apart. Neither number selects an effective span or bearing patch. The floor corners, bridge, stair and openings need the specific mechanisms developed in the separate support study.

The finite stair header is a serious arch-supported comparison. A 200 member centred on the aperture edge 4432.5 would intrude 100. Keeping it entirely south gives **y4232.5–4432.5**, centre 4332.5. Its west reaction is genuinely above the west window 4100–5100; its east reaction lies before the court-west first window 4650. A real arch/spandrel can be investigated for that in-plane head load. This is different from shifting an upper wall sideways onto a floor.

The [support study](house-support-study.md) owns the current HC floor/seat and lowered-window/downstand comparisons. Its actual finite footprints and section replace the earlier timber-seat diagnostic; those datums must not be mixed.

The long inner-trimmer fallback has 5435 between the proposed finished faces and 5605 between wall axes. Its finite outside-aperture patch extends beyond the front L wall endpoint and needs a real support extension. The revised rear doorway leaves 82.5 from the trial member edge; that is not sufficient-bearing evidence.

The masonry review distinguishes 140-through-wall custom solid-concrete voussoirs from a genuine 215 clay alternative. Growing215 inward consumes 75 of the stair reservation. A distinct, ground-supported outward 75 west bay retains the checked interiors and cavity but adds 0.2925 m² footprint over the nominated 3900 length and changes foundation-to-eaves/facade/site duties. No local thickness or arch-ring depth is free space.

Use the paired plan with the [support study](house-support-study.md) and [junction alternatives](house-junction-study.md), not as a substitute for them. Those studies name floor fields, finite seats, roof corner mechanisms, diaphragms/collectors, arch-thrust ties/abutments and connected foundation actions. Compression preference does not remove necessary tension, uplift, lateral restraint or temporary-stage obligations.

## 9. Exact area and gross core accounting

`house-quantities.py` exactly unions rectangular reservations. Whole wall footprints, including doorway thresholds, are reserved consistently. The quantities are not statutory usable area, accessible area or a material takeoff.

| Metric | Source125 planning walls | B |
|---|---:|---:|
| Ground ring after partitions, before stair deduction |102.428125 m² |97.990875 m² |
| Upper ring after partitions, before apertures |101.174531 m² |99.185125 m² |
| Upper after full stair aperture and entrance void |85.549406 m² |83.613100 m² |
| Ground finished wall reservation |3.436875 m² |7.874125 m² |
| Upper finished wall reservation |4.690469 m² |6.679875 m² |

B's gross internal core footprint is 6.6126625 m² ground and 5.6207625 m² upper. At an expressly limited 3100 height, before all door/arch deductions, that is **20.49925375 +17.42436375 =37.9236175 m³**. It excludes the envelope, foundations, roof extensions and masonry above the 3100 ceiling datum. No density or mass has been assigned. The added finished internal wall reservation is 6.42665625 m² over the two floors.

## 10. Dryness, datum and decision boundary

Every gravity, arch-thrust and lateral path needs an actual wall-base/foundation/DPC bearing, shear, sliding and restraint construction. The merged policy's redundancy wording means substantial overbuilding; it does not prescribe three separate barriers. Neither a slate/engineering-brick candidate nor a ground slab supplies an assumed shear connection or hidden tie.

No pump-dependent undercroft, inaccessible tanking or service trench is introduced to make this comparison fit. Ground-floor 300 reserve and exterior−150 schematic datum are not actual site levels or proof of passive drainage. A raised section remains an explicit option with consequences for stair, thresholds, court discharge and service crossings; no ground level has been invented here.

The bounded result is therefore **a reviewable partial HOUSE comparison**. Its next architectural decision is substantive: either develop greater front-bedroom allocation/changed shell-court proportions, or explicitly decide that the head-nook comfort compromises are appropriate for the eventual programme. Meanwhile, actual bilateral bed use, seated dining/sofa actions, the two incomplete sanitary door groups, changed wet-floor/service sections and finite structural junctions remain open. These are located design tasks, not reasons to call a paper geometry construction-ready.

## Reproduction and files

The [HOUSE result](str-house-result.md#6-reproduction-and-validation-boundary) provides the ordered reproduction commands. The portable generators read the guarded source inventory and the current paired-plan record. Positive axis-aligned routes, including simplified polylines, are checked over every complete segment. A missing lattice route remains a diagnostic result; independent rectangle overlaps and exact enclosure topology carry their separate, narrower claims.

The [A 3 paired sheet](studies/house-plan.svg) is the principal plan comparison. The [wet-action sheet](studies/house-wet-actions.svg) shows its two completed proxy sequences, and the [support sheet](studies/house-supports.svg) supplies the actual frame/arch/service sections. Other sanitary door groups remain incomplete as described above. The earlier isolated front-L and timber-seat preparation are superseded at the joined-comparison scope; they are not additional passed designs.
