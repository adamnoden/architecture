# BCR-STRUCTURE — current support, floor and opening feasibility

**Result:** bounded investigation complete, with unresolved structural and spatial findings. No member, stair opening, connection, bearing or foundation is selected by this result.
**Starting main:** `dfb5dce0e2e452a4afaaaa0f0562346c38653111`, 29 October 2026; subsequent integration is recorded in the PR.
**Owner:** [BCR #944](https://github.com/adamnoden/architecture/issues/944), under the [programme](buildability-construction-resolution-programme.md). Proposed finding rows below are for serial PREFLIGHT integration; the shared matrix is unchanged.

## Decision for the house

Keep conventional short-way floor construction as a credible comparison, with explicitly framed stair and entrance openings. The ordinary wing's 3415 mm wall-face distance is a useful starting geometry. It is not a span-table result or a complete support system. The represented 11165 mm service section is not evidence that an 11.165 m member is required: section direction and member direction are different. The consequential work is to locate actual receiving structure around the court, stair, openings and corners, then size and coordinate that structure with the held floor package.

Two concrete design choices now require a response. First, side trimmers placed exactly on the entrance-void edges would meet the court wall inside its ground-floor doorway, so an assumed direct load path to solid wall is false. An offset frame can reach nominal pier strips, at the cost of a wider header and offset floor/guard support. Second, the stair needs an authoritative aperture and trimmer section. A full-footprint opening and a stepped opening have different floor-retention and headroom consequences. Neither can be replaced by a generic claim that the source already contains enough floor depth.

## Source and repeatable study

The [current house basis](../../docs/reference-house/current-house-basis.md), [interface contract](../triad-interface-contract.md) and current compiler source own the house geometry. This is the accepted 12 m shell and 3500 square court; old structural studies remain historical evidence until HRS establishes applicability. In particular, old court dimensions, capacity tables or prototype results are not imported.

The [A3 study](studies/structure-geometry.svg), [exact values and source fingerprints](studies/structure-geometry.json) and [generator](studies/structure-geometry.ts) record actual `layoutRevision`, `layoutSectionAt`, roof and section-assembly outputs. Run `node --import tsx project/bcr/studies/structure-geometry.ts`; `--check` verifies that the retained JSON/SVG match the current source. The drawing is a spatial study, not an engineered framing plan. Dimensions are model millimetres; printed scales apply at 100%.

| Current quantity | Source observation and meaning |
|---|---|
| Shell / court / envelope | 12000; court x/y 4250, width/depth 3500; envelope 417.5. The envelope is a layered reservation, not 417.5 of load-bearing material. |
| Floor and room levels | First FFL +3450; ground ceiling +3100; upper ceiling +6550. The intermediate package is fully allocated. |
| Ordinary wing face distance | 4250 − 2 × 417.5 = 3415. Actual structural bearing lines lie within an unresolved wall/connection assembly; their distance is not asserted equal to this clear dimension. |
| Principal section x 5900 | Floor runs y 417.5–3832.5 and 8167.5–11582.5; entrance void removes y 417.5–2712.5 from the front upper floor, leaving the 1120 bridge band. |
| Service section x 10100 | Continuous represented interval y 417.5–11582.5 = 11165. This cut has no adopted joist direction; it does not compel a member spanning the whole interval. |
| Stair section probes x 1000 / 2200 | `layoutSectionAt` also returns that continuous interval. Its first-floor subtraction handles the entrance void, not a selected stair aperture. This identifies missing authoritative opening coordination; it does not establish that a real slab has been built across the stair. |

## Load paths and representative floor section

A candidate gravity path is deck → floor members → supported wall/beam/connection → continuous structure below → foundations → ground. Each arrow is an obligation, not a verified capacity. Short-way strips may span outer-to-court receiving lines in the four wings. Corners, interrupted court walls, stair and entrance opening require explicit framing/load transfer. Upper partitions, wet floors, full plant, guarding and concentrated reactions require actual loading; a drawing's partition is not automatically a supporting wall. A horizontal diaphragm, ties and wall restraint must also carry lateral actions to stable elements; no wind, racking or uplift calculation is supplied by the gravity sketch.

| Layer / interface | Current geometry | Consequence |
|---|---|---|
| Finish and deck | 20 + 22; deck bottom +3408 | No spare depth for a wet-floor change or heavy topping without a coordinated decision. Deck span/fixings and diaphragm role are unverified. |
| Framing reserve | 238, between +3170 and +3408 | A reservation, not a sized joist. Member species/grade or engineered product, spacing, span, loads, vibration, fire/acoustic duties and connections remain unselected. |
| Service and ceiling | 55 + 15, soffit +3100 | Services cannot borrow the framing zone by assuming holes/notches. Additional depth reduces local room/stair clearance if FFL remains held. |
| Represented seat and end gap | Seat projection 100, depth 40, bottom +3130; member end gap 25 | These drawing values do not establish an adequate bearing, hanger, fixing, load path, fire protection or toleranced assembly. Service-view omission of seats is not a different adopted structure. |

Compare an ordinary proprietary hanger/support arrangement with an engineered seated bearing only after choosing the actual receiving substrate. A hanger may preserve a flush soffit but needs its complete fixing, end support and installation/replacement access. A seated arrangement consumes wall/edge space and may introduce a local downstand or interruption to lining, insulation and air/fire boundaries. The current nominal ledge has not earned preference over the conventional control. Neither arrangement may fix through an envelope layer assumed solid from its total thickness.

## Entrance void: located support alternatives

The upper entrance void is x 4862.5–7137.5, y 417.5–2712.5: 2275 × 2295. Its north bridge occupies y 2712.5–3832.5, **1120 before guarding and finishes**. Any header, guard fixing or local service boxing must be tested against this same passage and the double-height entrance below.

**Edge-following frame.** Side trimmers on x 4862.5 and 7137.5 would extend toward the court wall at y 3832.5. Both x positions lie within the ground court-south doorway, whose nominal interval is x 4800–7200. Therefore their reactions cannot be assigned to solid court-wall piers at those points. A lintel/transfer beam and its end reactions could support them, but its actual section, bearings, doorway head, deflection and connection must be authored. The front doorway x 5100–6900 does not intercept those two side lines; that alone proves no front bearing capacity.

**Offset frame comparison.** Trial side lines x **4600 and 7400**, running y 417.5–3832.5, reach nominal front and court pier strips. The court strips are x 4250–4800 and 7200–7750; the front trial lines also avoid the front door and adjacent window intervals x 3400–4400 / 7600–8600. A header at y **2712.5** spans **2800** between the trial lines, with each line **262.5** outside the void edge. These are authored geometry inputs, not selected member centres or adequate bearing widths. Finite member/connection width, reveal geometry, tolerance and reaction distribution can consume the apparent pier margin. The offset needs explicit local floor/guard load transfer to the frame; no cantilever capacity is assumed.

A flush frame contained within the 238 framing reserve protects the held soffit but may not have sufficient strength/stiffness or connection space. A deeper header or side beam consumes service/ceiling/headroom space or requires a raised-floor/source revision. A column alternative introduces an entrance/court approach obstacle and a new lower support/foundation reaction; it is not free compensation for a failed beam fit. Choose the support arrangement before detailing trim around the opening.

## Stair aperture and depth sensitivity

Current stair: x 417.5–2817.5, y 3832.5–8167.5; 20 risers over 3450, hence **172.5 rise** and **300 going**. The lower flight occupies x 417.5–1517.5; the return flight x 1717.5–2817.5, separated by the 200 well. Lower nosing 6 is y 5332.5/z 1035; nosing 7 y 5632.5/z 1207.5. The north landing and upper return also need their complete opening, support and guarding geometry.

For a bounded diagnostic, [England's Approved Document K, 2013 edition, paragraph 1.11 / Diagram 1.3](https://assets.publishing.service.gov.uk/media/60d5bdcde90e07716f516cfd/Approved_Document_K.pdf), retrieved 29 October 2026, measures a 2 m vertical headroom over the pitch line/landings. This single comparison does not establish jurisdiction applicability or complete stair/escape/guard compliance.

The 350 depth is source-held. **400 and 450 are authored +50/+100 total-depth perturbations**, with all non-framing layers held, not structurally sized products. Their framing allowances would be 288/338. The following is a hostile uniform-overhead test, not a claim an actual slab exists across the opening:

| Total floor depth | Hypothetical soffit | Headroom over nosing 6 / 7 | Last lower-flight y retaining 2000 below that soffit |
|---|---:|---:|---:|
| 350 | 3100 | 2065 / 1892.5 | 5445.5 |
| 400 | 3050 | 2015 / 1842.5 | 5358.6 |
| 450 | 3000 | 1965 / 1792.5 | 5271.6 |

The continuous pitch-line calculation is `z(y) = 172.5 + (y − 3832.5) × 172.5 / 300`. Increasing depth by 50 moves that limiting opening edge south by about 87.0. A real trimmer's underside, protective lining and tolerances govern; equality to 2000 is a diagnostic boundary, not a selected clearance.

Compare two located opening reservations:

- **Full-footprint aperture:** x 417.5–2817.5, y 3832.5–8167.5. This removes the low-flight uniform-overhead ambiguity. It requires an inner long trimmer, end support/reactions, actual flight/landing connections and guarding. The reservation is a rectangle of removed floor, not an engineered opening.
- **Stepped aperture:** keep the return-flight/well path open and begin the lower-flight aperture at or south of the applicable y limit above. This retains more floor over the low lower flight, but places a transverse header at the sensitive edge. Its real depth and connection can force an earlier opening, removing the apparent benefit. Support locations and reactions remain to be assigned; upper-flight landing/arrival must remain open and guarded.

Neither option authorises a source cut, altered floor level or framing direction. Reference House/HAD must compare the actual frame/soffit with continuous occupation routes and adopt one coordinated aperture. The [occupation study](bcr-occupation-result.md) retains the same nosing 6/7 diagnostic and guards/arrival obligations. The absence of this choice is a design coordination gap, not a reason to label the represented house physically impossible.

## Roof, services, wet loads and below-ground crossings

[ROF-04](../rof/rof-04-assembly-and-support.md) found that the roof's 300 vertical reserve is only 271.9 normal to its 25° face. Geometry's ridge line is not a supported ridge beam. Rafters, ties, hips, inner valleys, covering/substrate, access loads and outer/court receiving structure still need a coherent load path. A roof diaphragm or rafter tie cannot be borrowed as a service tray; no storage/load-bearing loft is earned by the roof-space drawing. ROF owns selection, with structural consequences returned to this study's receiving rows.

The BCR-SERVICES candidate westbound distribution route at **y 3300** passes through the **bridge band y 2712.5–3832.5** and crosses the trial side-trimmer lines **x 4600/7400**. This is a concrete collision interface for PREFLIGHT even though neither route nor framing is adopted. A route avoiding the court in plan has not earned a continuous section or a joist-parallel path. Compare an accessible local service drop, a different ring route, or a fully engineered crossing; no notching/drilling is implied. The actual 55 service zone cannot accommodate a 75 outside-diameter branch, much less a 190 main or 250 insulated/support comparison, without a change elsewhere.

The source 550 × 700 riser is likewise not an approved structural opening. Its framing, supported edge and interrupted fire/acoustic boundaries must be drawn separately from component packing. Filled plant, wet-room toppings and partitions supply actual loads only after the systems are chosen. The unadopted HAD rear-west en-suite draft observed on 29 October 2026 reserves a gross 300 × 750 cabinet at x 417.5–717.5/y 8800–9550 beside the west inner wall. This supersedes its earlier 300 × 400 comparison. It could intersect an end-bearing/hanger region if short-way floor members are adopted; neither the cabinet's internal clear space nor an opening equal to its gross footprint is established. Its visible descent into the rear sitting room does not establish a structurally permitted floor penetration. The future HAD source/PR must bind the final candidate before this conditional interface is adopted. BCR-WET/IAS must return the complete floor, drain/trap, supported openings and local load package before adoption.

The ground-floor 300 reservation and substructure drawing's 600 depth / 200 × 250 support envelope are not a service tunnel, footing design or proof of bearing-free passage. RWT's court-to-exterior crossing must locate each actual wall/support crossing and its pipe invert/crown against an authored foundation/ground-floor section. Compare an above-support route with a designed sleeve/bridged crossing only on explicit geometry and load evidence. Ground conditions, foundation type/size and actual reactions remain site/commission obligations; no arbitrary underground cut is approved.

## Findings for serial PREFLIGHT integration

Investigation is complete; every following material design obligation remains **routed-pending / blocked**, not accepted construction. Existing routes are used; no new appointment, purchase or prototype is requested.

| Finding / receiving matrix rows | Owner and discharge condition |
|---|---|
| BST-01 / BCR-003, 006, 017: nominal floor/support zones lack an adopted load path | Reference House/HAD structural owner with IAS: choose actual member directions, corner/end supports, floor-edge connections and wall substrate; reconcile span/bearing geometry, gravity/lateral actions, stiffness/vibration and fire/acoustic duties. ER-STR-01 supplies competent design evidence; PHY only for a concrete unresolved selected detail. |
| BST-02 / BCR-004, 017, 021: entrance edge reactions meet a doorway | Reference House/HAD with OAS: adopt a supported transfer or offset-frame arrangement, actual header/trimmer dimensions and bearing/reaction locations; demonstrate bridge/guard/doorway and lower load-path fit. A point lying in a pier strip is insufficient. |
| BST-03 / BCR-003, 004, 021: stair aperture/trimmer remains unauthored | Reference House/HAD with occupation/OAS: adopt the full/stepped or another explicit opening, complete flight/landing support and guard details; test continuous finished headroom against actual trimmer soffits and tolerances. Reconcile plan, section helper, issued sections and human-action study. |
| BST-04 / BCR-003, 005, 010, 011: service routes cross candidate framing | IAS/services with structural owner: resolve y 3300 bridge/trimmer crossing, riser and each wet/service penetration in one section, with supported opening and boundary reinstatement; demonstrate physical route or adopt simplification. No unassigned joist holes. |
| BST-05 / BCR-007, 010: wet-room/plant loads and local holes not coordinated | IAS/HAD/BCR-WET: supply adopted build-up, load and drain/stack geometry; structural owner accepts support and penetration; reconcile living-space and renewal consequences. Unadopted second en-suite earns no source capacity. |
| BST-06 / BCR-014, 019, 025: roof geometry is not roof structure or access support | ROF/HAD with structural/envelope owner: selected roof assembly and support/tie/connection scheme fit moisture layers, collectors and actual maintenance loads; route applicable technical evidence through existing EPR/PHY/DEL. |
| BST-07 / BCR-002, 015, 016: ground/support crossings and foundations unresolved | RWT/house ground-floor owner: located building-side crossing with load/support and level section; site/structural commission later supplies ground, actual foundation and outfall evidence. Keep genuine site uncertainty distinct from unselected internal crossing geometry. |
| BST-08 / BCR-001, 023: later adopted source changes can invalidate the study | PREFLIGHT/HRS: compare adopted HAD/IAS/ROF/RWT changes against fingerprints, rerun affected geometry and replace conditional diagrams with the agreed support/opening source. Do not preserve a historical pass across altered dimensions or loads. |

## Validation and claim ceiling

Source-imported arithmetic, exact artifact regeneration, TypeScript/repository checks and the inspected A3 drawing establish reproducible geometry. Exact-head CI and independent seam review are recorded in the integrating PR. They establish neither capacity nor structural certification, fabrication dimensions, safe installation, statutory approval or site suitability. Current house geometry, the shared construction matrix and historical evidence identities remain unchanged. The next useful design action is to choose the actual supported opening/frame and service section, then obtain evidence for that concrete proposition.
