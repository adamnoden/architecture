# RH-C0 Mutation / Dependency Map

**Status:** RH-C0.4 — **PASS**  
**Date:** 2026-10-12  
**Baseline:** [`model-baseline-rhc0.md`](model-baseline-rhc0.md)  
**Purpose:** define expected consequences of high-leverage source changes before RH-C1 so later mutation tests test the model rather than merely update snapshots.

This is not optimisation. A mutation may intentionally make the house worse or invalid. The important question is whether the expected dependency and review boundary are explicit.

## Reading rules

- A **direct derived change** should occur automatically from the semantic source.
- An **architectural conflict** should surface as a failed expectation or review trigger; the model must not silently move unrelated facts to hide it.
- **Stale obligations/evidence** means prior reasoning or specialist evidence would need re-checking even if geometry still compiles.
- “Unaffected” means the fact should not move merely because this source changed; it may still become subject to review if the mutation creates a new conflict.

---

## M1 — shell width `12,000 → 11,700 mm`

**Source fact changed**  
`RHCF-SHELL-X`; depth remains 10,800, court remains 3,600 wide and centred.

**Expected direct derived changes**

- shell centre X `6,000 → 5,850`;
- centred court edges X `4,200/7,800 → 4,050/7,650`;
- west/east gross wings `4,200 → 4,050`;
- shell area `129.6 → 126.36 m²`; enclosed plate `115.2 → 111.96 m²`;
- centred four-bay front axes shift 150 mm west: `1,800 / 4,500 / 7,200 / 9,900` while 2,700 spacing remains;
- entrance centre follows bay 3 to `X=7,200`;
- courtyard N/S opening axis follows centre to `X=5,850`;
- roof field vertices/catchments update from new shell/court edges.

**Expected architectural conflicts**

- the absolute authored east gallery/service partition at `X=9,100` does **not** move automatically: gallery gross width becomes 1,450 mm while service/study strip width falls from 2,900 to 2,600 mm;
- east study/service/bathroom/plant packing therefore takes the principal width loss, exposing whether that fixed partition remains architecturally acceptable;
- hall/stair field loses 150 mm between its fixed/provisional west line and moved court east edge;
- west principal rooms lose 150 mm gross ring depth;
- 400–450 mm envelope stress results must be recomputed.

These are expected consequences, not reasons to make `X=9,100` secretly relative. A design decision to preserve the gallery/service proportions would be an RH-02/RH-06 rewind.

**Obligations/evidence likely stale**

- RH-02 furniture/room adequacy;
- RH-03 stair/hall passage fit;
- RH-05 span/support geometry;
- RH-06/RH-10 plant and service packing;
- RH-07 daylight/purge assumptions tied to room proportions;
- RH-10 envelope stress test and outer elevations;
- any future daylight/overheating/structural/MEP evidence using the old width.

**Owning gates needing review**  
RH-02 first; then RH-03, RH-04, RH-05, RH-06/RH-07, RH-10 as consequences demand.

**Drawings/schedules affected**  
Both plans, front/garden/court elevations, section width references, roof plan, structural/services overlays, room/area schedule.

**Expected unaffected facts**  
Shell depth, court depth, FFL/ceiling datums, stair riser count/going, roof fall direction, four-bedroom brief, service philosophy.

---

## M2 — courtyard width or depth `+400 mm`

Two variants are deliberately distinguished because “larger courtyard” is not one dependency.

### M2a — width `3,600 → 4,000 mm`

**Direct derived changes**

- centred court X edges `4,200/7,800 → 4,000/8,000`;
- side wings `4,200 → 4,000`;
- court area `14.4 → 16.0 m²`; enclosed plate `115.2 → 113.6 m²`;
- gallery west edge follows court east edge to 8,000; with partition X=9,100 unchanged, gallery gross width `1,300 → 1,100`;
- west principal room ring loses 200 mm;
- roof field vertices/catchments change.

**Conflicts**

- east gallery may no longer support its circulation/dry-service role after wall/finish deductions;
- west principal rooms lose useful width;
- courtyard H/W improves environmentally, but that benefit is purchased directly from occupied floor area.

### M2b — depth `4,000 → 4,400 mm`

**Direct derived changes**

- centred court Y edges `3,400/7,400 → 3,200/7,600`;
- front/rear gross rings `3,400 → 3,200`;
- same area change `14.4 → 15.84 m²` for width 3.6 m; enclosed plate `115.2 → 113.76 m²`;
- stair/front and garden-dining/rear fields lose 200 mm gross depth;
- roof fields/catchments change.

**Conflict with current stair**

At the normal 425 mm envelope test, a 3,200 mm front ring leaves about **2,350 mm** between two envelope faces, already below the current `≈2,400–2,500 mm` stair reservation. This is a real RH-03 morphology conflict rather than a value the compiler should “make fit”.

**Obligations/evidence likely stale**

RH-02 domestic fit, RH-03 stair/circulation, RH-04 court proportions/openings, RH-05 support/spans, RH-07 court daylight/solar screen, RH-08 roof/court drainage, RH-10 envelope stress.

**Owning gates needing review**  
RH-01/RH-02 morphology first, RH-03 immediately for depth variant; then downstream gates.

**Affected drawings**  
All plans; court elevations/solar section; principal section; roof plan; structural/service overlays.

**Expected unaffected**  
Outer shell, front façade field/axes if shell remains unchanged, FFL/ceiling datums, riser count/going, service system choice unless spatial conflict forces a later rewind.

---

## M3 — wall planning stress thickness `450 → 500 mm`

**Source fact changed**  
Stress parameter only. This does not redefine a proven construction build-up.

**Direct derived changes**

- side-ring clear stress field `3,300 → 3,200 mm`;
- front/rear-ring clear stress field `2,500 → 2,400 mm`;
- reveal depth and wall-face offsets in any thickness-aware derived view increase by 50 mm per affected face.

**Expected architectural conflicts**

- RH-10 explicitly defines materially `>450 mm` as a rewind trigger;
- a 2,400 mm front clear field is below the upper end of the current stair reservation and leaves no honest tolerance for the 2,400 mm lower end;
- garden-dining/front-centre rooms become materially tighter;
- deeper reveals further reduce court/outer daylight and alter window replacement/interface geometry.

**Obligations/evidence likely stale**

RH-02/RH-03 furniture and stair fit; RH-07 daylight; RH-09 window/threshold interface; RH-10 envelope conclusion; any later building-physics result that produced the thicker wall; structural bearing/opening details.

**Owning gates needing review**  
RH-10 envelope first, then RH-03 stair and RH-02 domestic planning. RH-04 only if opening/visible hierarchy must move.

**Affected drawings/schedules**  
Thickness-aware plans/sections, window interface details, room-clearance schedules.

**Expected unaffected**  
Outer shell/court gross coordinates, room topology, bay axes, FFLs, roof fall direction, stair riser count/going.

---

## M4 — first-floor FFL `+150 mm` (`3,300 → 3,450`)

**Direct derived changes**

- stair rise `183.33 → 191.67 mm` with 18 risers;
- intermediate six-rise landing increments `1,100 → 1,150 mm`;
- `2R+G 646.67 → 663.33 mm`;
- stair pitch rises to approximately `34.4°` at 280 mm going;
- with ground ceiling fixed at +2,950, inter-storey datum gap `350 → 500 mm`;
- with upper ceiling fixed at +6,000, upper clear height `2,700 → 2,550 mm`;
- upper-window absolute sill/head positions move where their dimensions are defined relative to first FFL.

**Expected architectural conflicts**

- RH-04's restrained ground/upper hierarchy materially changes;
- the 500 mm inter-storey zone no longer expresses the selected section even if structurally easy;
- upper rooms lose 150 mm clear height unless another authored datum is separately changed;
- stair-window/landing relationships and headroom must be rechecked.

The model must **not** quietly raise the ground ceiling or upper ceiling to preserve old derived gaps: both are independently authored architectural datums.

**Obligations/evidence likely stale**

RH-03 stair fit; RH-04 section/elevation; RH-05 floor/edge/stair framing levels; RH-06 riser lengths/crossings; RH-07 daylight/opening relationships; RH-09 wall/ceiling/window interfaces; RH-10 elevation/fire opening checks.

**Owning gates needing review**  
RH-04 first, then RH-03/RH-05 and downstream coordination.

**Affected drawings**  
Principal section, front/rear/court elevations, stair drawings, structural/service sections.

**Expected unaffected**  
Plan shell/court, room topology, plan bay spacing/count, roof plan field topology, service-side handedness.

---

## M5 — stair risers `18 → 17`

**Direct derived arithmetic if FFL remains 3,300**

- rise becomes `194.12 mm`;
- `2R+G ≈ 668.24 mm`;
- pitch ≈ `34.8°` with 280 mm going.

**Required invariant failure**

The authored grouping `3 flights × 6 rises` sums to 18. Changing only `riserCount` to 17 makes the source internally impossible. RH-C1 should reject that state rather than silently invent `6/6/5`, delete a step or alter FFL.

To continue the design mutation, the stair topology must be explicitly re-authored—e.g. a new flight grouping—through RH-03.

**Expected architectural conflicts after a valid regrouping**

- intermediate landing levels and flight endpoints change;
- stair box/well may change;
- bay-2 stair-window sill relationship requires review;
- headroom/guarding/landing geometry must be re-proven.

**Obligations/evidence likely stale**  
RH-03 stair safety/comfort, RH-04 section/stair window, RH-05 stair opening/trimmers, any fire/egress review involving stair geometry.

**Owning gate**  
RH-03 first; RH-04/RH-05 downstream.

**Affected drawings**  
Stair plan/overlay, upper plan stair symbol, principal section, structural stair-opening view.

**Expected unaffected**  
Shell/court, room topology outside stair reservation, front bay count/spacing, service suite, roof topology, wall family.

---

## M6 — front bay spacing changed materially

**Concrete test mutation:** `2,700 → 3,000 mm`, retaining four bays centred on shell X=6,000.

**Direct derived changes**

- axes become `1,500 / 4,500 / 7,500 / 10,500`;
- entrance centre follows bay 3 `7,350 → 7,500`;
- every front opening whose centre is bay-derived moves with its axis;
- outer margin and masonry-pier fields change.

**Expected architectural conflicts**

- entrance moves nearer the east edge of the stair hall/court line;
- bay-2 stair window moves relative to stair geometry;
- drawing/study/bedroom window positions move relative to furniture and internal partitions;
- masonry pier/lintel/support conditions change;
- the façade's G-01-derived compositional judgement must be re-made rather than assumed invariant.

**Obligations/evidence likely stale**

RH-04 architectural composition; RH-05 masonry/lintel/pier logic; RH-07 solar/daylight/overheating if glazing positions matter; RH-09 window interfaces; RH-10 front-bedroom escape-opening coordination.

**Owning gates**  
RH-04 first; then RH-05/RH-07/RH-09/RH-10.

**Affected drawings**  
Front elevation, both plans where openings are shown, section if it cuts a moved opening, structural façade overlay.

**Expected unaffected**  
Shell/court, rooms and stair topology, levels, roof topology, service suite geometry. Internal facts do not move merely to rescue a new façade field.

---

## M7 — `SV-01` critical clear dimension `−150 mm`

**Concrete test mutation:** clear `900 × 700 → 900 × 550 mm`.

**Direct derived changes**

- riser clear area falls from `0.63 → 0.495 m²` (−21.4%);
- any lining/fire-stopping/support envelope based on that clear width must be recomputed;
- no RH-C1 architectural source coordinate changes because `SV-01` is outside the first slice.

**Expected architectural conflicts**

RH-07's working plausibility assumption—two roughly 160–200 mm-class MVHR trunks plus 100 mm-class soil stack, water and segregated dry routes—becomes materially less credible. Without competent MEP/fire coordination it is not legitimate to claim whether it still fits.

The recorded response order remains:

1. move one air route;
2. split wet/ventilation sub-zones locally;
3. revert MVHR to continuous MEV if justified;
4. enlarge permanent service reservation only last.

The model must not automatically steal area from bathroom/gallery/principal rooms.

**Obligations/evidence likely stale**  
RH-06 route/maintenance assumptions; RH-07 MVHR addendum; RH-10 plant/service packing; RH-11 MEP review brief.

**Owning gates**  
RH-06/RH-07 first; RH-10 if room reservation must change.

**Affected drawings**  
Service topology/riser section, plant room/topology drawings; architectural plans only if an actual redesign follows.

**Expected unaffected**  
Shell/court, rooms, stair, façade axes, levels, roof plan, structural concept until a new structural opening is required.

---

## M8 — representative major opening width `+250 mm`

**Concrete test mutation:** one 1,050 mm-class front principal ground window → 1,300 mm, keeping its bay centre fixed.

**Direct derived changes**

- opening jambs move ±125 mm from the controlled centre;
- masonry/pier length adjacent to that opening reduces accordingly;
- glazing/opening area increases; host-wall net area decreases.

**Expected architectural conflicts**

- façade hierarchy/proportion may no longer match the selected RH-04 family;
- lintel/bearing/pier obligations change;
- daylight and solar gain increase together rather than one being “free”;
- deeper/larger replacement frame, sill and weather interfaces must be rechecked;
- if repeated across the façade, aggregate pier and overheating consequences compound.

The bay axis **does not move** because width and centre are distinct attributes with different authorities.

**Obligations/evidence likely stale**  
RH-04 elevation judgement; RH-05 opening structure; RH-07 daylight/Part O model inputs; RH-09 OW-01 interface/mock-up; RH-10 envelope/opening coordination; future thermal/airtightness evidence.

**Owning gates**  
RH-04 for architecture; RH-05/RH-07/RH-09/RH-10 for downstream proof.

**Affected drawings**  
Host plan/elevation/section; structural opening schedule; window/interface schedule.

**Expected unaffected**  
Shell/court, room polygons, bay centres, FFLs, stair, roof topology, service geography.

---

## M9 — roof fall/catchment reversed toward courtyard

**Source fact changed**  
Four fields fall inward instead of outward.

**Direct derived changes**

- field plan boundaries can remain the same, but low/high edges reverse;
- primary collection moves from outer perimeter to the inner courtyard perimeter;
- the court drainage system would receive up to the full `115.2 m²` roof-plan catchment **plus** its own `14.4 m²` open area before hydraulic corrections, rather than principally 14.4 m² + local wall runoff;
- outer gutters/downpipe topology no longer follows RH-08.

**Expected architectural conflicts**

This directly defeats the RH-08 reason for selecting the roof: it reintroduces inner gutters/outlets/valleys or equivalent high-consequence collection at the building centre, increases blockage consequence and maintenance difficulty, and worsens the shaded court's moisture risk.

The correct response is an RH-08 redesign decision—not silently enlarging a court drain while retaining a “PASS”.

**Obligations/evidence likely stale**  
RH-08 drainage/failure/access strategy; RH-07 court microclimate; RH-10 roof-edge/envelope/PV coordination; site drainage assumptions.

**Owning gate**  
RH-08 first; RH-07/RH-10 downstream.

**Affected drawings**  
Roof/drainage plan, section roof slopes, rainwater/downpipe elevations, courtyard drainage diagrams, PV/maintenance layout.

**Expected unaffected**  
Shell/court plan, room topology, stair and levels below roof, front bay axes. Those facts must not move simply to rescue the drainage reversal.

---

## M10 — plant-room gross area materially reduced

**Concrete test mutation:** `G-PLANT-01` depth `≈2,200 → ≈1,600 mm`, width remaining ≈2,900; gross reservation `≈6.38 → ≈4.64 m²` (about −27%). The rest of `G-SVC-02` is not automatically reassigned.

**Direct derived changes**

- plant-room gross area and working/packing envelope reduce;
- utility/WC/service remainder can increase only if the partition is intentionally moved; it is not an automatic consequence of changing equipment-room adequacy;
- external replacement-opening geography remains where separately authored unless redesigned.

**Expected architectural conflicts**

RH-10 currently requires four classes to coexist without destructive overlap: MVHR service access, DHW/hydraulic equipment, segregated dry electrical/controls, and `SV-01` access/working approach. Product-level packing is already unproved at 2.9 × 2.2 m, so the reduced room cannot honestly be declared adequate or inadequate without competent packing data; it can only be declared a **new unproved condition with materially lower margin**.

First responses remain removal of unnecessary ancillary equipment and arrangement review. Enlarging the service suite or taking principal-room area is not automatic.

**Obligations/evidence likely stale**  
RH-06 plant/replacement topology; RH-07 MVHR serviceability; RH-10 heat/DHW packing and ASHP connection; RH-11 MEP review questions.

**Owning gates**  
RH-06/RH-10 first; RH-02 only if a larger service suite is ultimately demanded.

**Affected drawings**  
Service-suite plan, service topology, energy/heat topology, east/service elevation if plant door/equipment arrangement changes.

**Expected unaffected**  
Shell/court, principal rooms until a deliberate plan rewind, stair, façade front order, roof family, structural support concept.

---

# Cross-mutation test expectations for RH-C1

The eventual first-slice mutation tests should distinguish three kinds of outcome:

1. **automatic propagation** — e.g. shell width changes centred court edges, plate area and centred bay axes;
2. **explicit invariant failure** — e.g. `17` risers with an unchanged `3×6` flight grouping is invalid and must not compile silently;
3. **review/staleness signal rather than automatic geometry repair** — e.g. a thicker wall or smaller riser can make architectural/technical adequacy uncertain, but the model must not enlarge the shell, move rooms or select a new ventilation system on its own.

These expectations are more valuable than whole-document snapshots because they state what **should** and **should not** change.

# RH-C0.4 gate result

**PASS.** The ten required mutations have explicit direct dependencies, conflict boundaries, stale obligations, owning RH gates, affected representations and unaffected facts. The exercise exposes no hidden need to alter the RH-C0.3 source graph before domestic review. It does, however, establish several deliberate future failure tests—most clearly the 17-riser grouping contradiction and the courtyard-depth/stair clash—that RH-C1 should detect rather than auto-repair.