<!-- nav-exclude: redirect -->
# PLT-02 — architectural-information admission audit

**Programme:** PLT — Architectural Plate Refinement  
**Parent:** #422  
**Packet:** #742  
**Baseline:** `c1b8405c614736dfaffd1a846bee9411d65839d5`  
**Protected comparison release:** `drawing-publication-v1`  
**Status:** candidate closeout

## 1. Purpose

PLT-01 found that the released drawings are strongest in semantic honesty and weakest where coarse representation forces notes, provisional symbols or heavy poche to carry work that architecture could carry.

PLT-02 therefore asks one question before any visual refinement begins:

> **Which additional architectural facts may a v2 plate draw without silently making a design decision?**

This is an authority packet. It changes no renderer, drawing token, SVG, publication placement or Reference House source.

## 2. Admission rule

Every candidate fact is classified:

- **A — controlled:** explicitly owned by current architectural/source authority, including facts deliberately marked provisional where that provisional state itself is controlled;
- **B — deterministically derivable:** follows mechanically from A facts without an architectural choice;
- **C — absent / unresolved:** would require a new design, technical, product, consultant or site decision, or exists only as a legacy publication-only proxy rather than current architectural authority.

Only A/B facts may enter new v2 architectural linework.

A C fact may remain visible as an omission, uncertainty range, relationship, zone or note where useful. It may not be converted into plausible-looking geometry.

### 2.1 Authority precedence

PLT inherits DRW-00A's stack:

1. current architectural/source facts;
2. deterministic derived/compiled state;
3. generated inspection outputs;
4. publication composition/selection;
5. publication-only and historical drawn proxies.

The important consequence is that `drawing-publication-v1` remains protected evidence but does **not** override later/current architectural authority.

`compiler/reference-house/publication-plan-source.ts` contains useful DRW-03B publication-only facts deliberately authored to close representation gaps. Those facts were valid for the v1 drawing contract, but their own comments state that they are separate from the RH-C1 inspection fixture and do not select construction or door geometry. COA-04 subsequently makes the stronger current boundary explicit: final internal door positions/swings remain unresolved and required connectivity is represented as whole shared-edge obligation rather than invented doors.

Therefore PLT v2 must not promote a DRW-03B publication proxy into architectural fact merely because it already has coordinates.

## 3. Admission register

| Candidate fact | Class | Current authority | v2 may show | v2 must not imply |
|---|---|---|---|---|
| 12.0 × 10.8 m shell | A | canonical Reference House source | exact overall plan dimensions / outer geometry | technical setting-out tolerance |
| 3.6 × 4.0 m centred courtyard | A + B placement | canonical source + deterministic centring | exact court size and derived coordinates | final wall-face construction geometry beyond owned planning family |
| ground / first / ceiling / cornice datums | A | canonical levels; cornice explicitly provisional | owned datums with provisional state retained | floor/ceiling build-up thickness not owned |
| front four-bay field / 2700 spacing / entrance bay | A + B axes | canonical source | exact derived bay axes and entrance centre | unowned façade construction detail |
| normal external/court wall planning family 400–425 mm | A | RH-10 + canonical wall-planning source | bounded planning thickness / nominal publication body explicitly labelled provisional | selected construction thickness or completed wall build-up |
| 450 mm wall stress comparator | A | RH-10 + canonical source | stress-test dimension where analytically relevant | actual wall thickness |
| masonry cavity-wall family | A at family level | RH-10 | layer-family statement in explanatory context | exact insulation, ties, structural sufficiency, U-value or junction detail |
| window permanent-opening → mounting zone → replaceable frame → removable trim sequence | A at relationship level | RH-09 / RH-10 | relationship/sequence and opening ownership | exact jamb/head/sill geometry, frame position, fixing or thermal/water closure |
| front opening family widths / sill / head ranges | A, provisional | canonical opening families | ranges/approximate extents with uncertainty encoded | exact aperture size or product size |
| front opening centres from controlled bay placement | B | canonical front field + placement | exact derived centre axes | exact jamb faces where width is ranged |
| courtyard north/south major-opening occurrence and centred relationship | A/B occurrence only | canonical opening occurrence / boundary-centred placement | known centre/occurrence relationship | width, head, sill or doorset geometry where absent |
| courtyard east/west rhythm / room ownership | A qualitative | canonical qualitative opening relationships | whole-host/rhythm notation | exact centre coordinates or aperture widths |
| garden-centre opening room ownership | A qualitative | canonical qualitative relationship | occurrence/ownership at relationship scale | exact centre, width, head or threshold geometry |
| v1 DRW-03B courtyard/garden exact publication coordinates and widths | C for architectural admission | publication-only provisional companion source | retained only as protected v1 comparison/provenance if needed | current architectural selection |
| required internal room connectivity | A relationship | canonical required adjacency graph | shared-edge/connection obligation | a door at a chosen point |
| v1 DRW-03B internal opening centres and widths | C for architectural admission | publication-only representation proxy | protected v1 comparison only | current door/open-passage selection |
| internal door leaf / swing / handing / exact clear opening | C | explicitly unresolved in COA-04 / HFI | omission or unresolved interface marker | plausible generic door swing |
| replaceable doorset sequence `OD-01` | A at relationship level | RH-09 | permanent opening → adjustment/fixing zone → replaceable doorset → removable architrave | exact frame/leaf/ironmongery geometry |
| same-build-up internal doorway: no decorative threshold strip | A, conditional | RH-09 / HFI-03B | no decorative strip where same floor build-up genuinely continues | claim that every internal doorway is flush regardless of construction |
| external threshold family `TH-01` / continuous-ground-plane intent | A at relationship level | RH-09 + HFI-03B | threshold as integrated floor/doorset/drainage/weather interface; substantially flush intent | final sill/track/upstand/fall/drainage geometry or accessibility/weather proof |
| principal entrance / garden / courtyard exact threshold profile | C | explicitly NOT-MODELLED / technical-design obligation | bounded unresolved threshold zone | a resolved flush threshold detail |
| stair 18 risers | A | canonical source / HFI-08B | exact riser count | finished stair construction |
| stair three rise groups 6/6/6 | A | canonical source / HFI-08B | exact rise topology | exact landing plan geometry unless separately owned |
| stair going 300 mm / 5 goings per flight | A | canonical source / HFI-08B | exact selected going and flight-run mathematics | universal HFI minimum or complete stair adequacy |
| rise 3300/18 ≈183.33 mm, flight run 1500 mm, pitch ≈31.4°, 2R+G ≈666.67 mm | B | deterministic RH-C5 derivation | exact derived values | headroom/guard/landing/escape compliance |
| stair clear-width target ≈1000 mm | A, provisional | canonical source | labelled target / reservation relationship | proven finished clear width |
| stair reservation 2400–2500 mm | A, provisional | canonical source | bounded reservation | exact well/opening geometry |
| v1 three-flight plan orientation / clockwise trace from DRW-03B | C for architectural admission | publication-only provisional source | historical v1 comparison only | current architectural stair plan selection |
| finished stair strings, tread/nosing positions in space, guards/handrails, headroom | C | explicitly non-claimed by RH-C5 / COA-04 / HFI-09C | omission or proof-boundary note | resolved stair anatomy |
| roof four outward-draining low-slope fields | A | RH-08 + canonical source | exact topology / watershed direction | technical waterproofing build-up |
| roof 1:40-class screening fall | A, provisional | RH-08 + canonical source | coordination fall with provisional status | finished-fall specification |
| roof outer edge control +6250 and derived court-side rise | A + B | canonical source / derivation | section relationship / derived fall consequence | parapet/coping technical closure |
| four outer collection edges | A relationship | RH-08 | inspectable outer collection geography | exact gutter profile/sizing |
| four corner-return downpipe geographies | A at working-location level | RH-08 | side/rear return locations schematically | precise coordinates, hydraulic sizing or final product |
| courtyard east/service-side primary collector + independent overflow relationship | A spatial relationship | RH-08 | primary and emergency path geography | inlet levels, grate dimensions, pipe sizes or final threshold datum |
| exact gutter, scupper, outlet, RWP sizes/coordinates and below-ground site discharge | C | technical/site design reserved | unresolved notation | hydraulic proof or site drainage selection |
| service zones / riser / dry-side access geography already compiled | A/B at zone scale | RH-06/07 + compiled system | controlled zones and working/withdrawal relationships | pseudo-pipes, product layouts or penetrations not sourced |
| exact service equipment routes / product clearances not modelled | C | DRW-02C / service proof boundaries | bounded zone / note | detailed MEP layout |
| selective overall dimensions between controlled coordinates | B | canonical geometry | dimensions that improve scale/cross-registration | construction-document dimension completeness |
| dimensions between provisional planning facts | A/B with provenance | provisional source + deterministic difference | dimension only if marked as provisional / planning | false exactness |
| wall/window/threshold construction details | C at current maturity | DRW-02C + RH-09/10 | abstract relationship or deferred-detail marker | resolved 1:10/1:5 assembly |
| people, furniture, vegetation or decorative occupation invented to enrich plate | C / out of scope | no source authority | none unless a later separate authority explicitly owns it | atmosphere presented as architectural fact |

## 4. High-value findings

### 4.1 Window enrichment is narrower than PLT-01 hoped

PLT may improve front-opening representation because centre axes and bounded family extents are owned. It may also make the permanent-opening / replaceable-frame relationship clearer at an abstract level.

It may **not** add realistic frame depth, reveal depth, jamb returns, sill construction or a preferred frame position. RH-10 explicitly reserves whether the frame aligns toward the inner leaf, cavity or another thermal position, and requires a future jamb/head/sill mock-up.

So the v2 gain is better hierarchy of owned opening extent and uncertainty — not a fake detailed window.

### 4.2 Internal doors are a subtraction problem before they are an enrichment problem

The current architectural source owns required adjacency, not exact internal door position/swing.

The v1 publication-only source intentionally created provisional aperture coordinates to make the plan drawable. Those remain legitimate evidence of the v1 representation contract, but PLT must not mistake them for current architecture.

**Decision:** the PLT-03 exemplar should test the current stronger convention: show the required connection/shared candidate edge without choosing a leaf/swing or precise opening point. Any retained v1 aperture must be explicitly justified as a protected comparison feature rather than silently inherited.

This is a source-traced semantic difference (`S`) if v2 changes the old aperture depiction to the current coordinated relationship model.

### 4.3 External thresholds are strongly selected as a problem, weakly selected as geometry

The project knows what a threshold must coordinate and has a clear preference for quiet, substantially flush movement. HFI sharpened the distinction further: continuous ground plane is a movement-and-water-management system, not visual flatness.

But HFI-08B explicitly leaves entrance/threshold/door/detail questions `NOT-MODELLED`, and HFI-03B refuses a measurable finished profile before doorset, paving, falls and drainage exist.

**Decision:** no resolved threshold linework enters PLT v2. A threshold zone/relationship may be shown; technical profile remains C.

### 4.4 The stair contains more admissible mathematics than the v1 plates expose

HFI-08B selected a 300 mm principal-stair going while retaining 18 risers, three flights × six rises and five goings per flight. RH-C5 deterministically derives rise, flight run, pitch, landing datums and `2R+G`.

This is meaningful A/B information.

However, HFI-09C deliberately declined compiler admission for finished stair usability, stairlift compatibility and other complete-action proof. COA-04 likewise states that exact well, strings, treads, guards and headroom are not asserted.

**Decision:** PLT may make the numeric/topological stair authority much more legible, but it may not turn those numbers into a fully resolved plan/section anatomy. Exact tread-line placement in plan is C until the stair path/landing/well geometry is architecturally selected rather than publication-proxied.

### 4.5 Elevation richness remains genuinely source-limited

Front elevation can improve through better use of controlled bay axes and family ranges.

Courtyard east/west and garden opening geometry remain deliberately qualitative. The service-side façade similarly lacks exact aperture/terminal geometry at the level a rich elevation would need.

**Decision:** PLT cannot make every FRAME-GRADE elevation equally information-rich by drawing craft alone. Courtyard/garden refinement must preserve this asymmetry unless an upstream architectural packet later chooses aperture geometry.

### 4.6 Roof plates have unusually strong admissible content

RH-08 owns substantially more architectural topology than the v1 roof plates exploit: four outward fields, watershed logic, outer collection edges, corner-return RWP geography, courtyard primary collector relationship and independent overflow logic.

The technical sizes/details remain C, but the architectural/failure geography is A/B and can support a materially richer roof/failure plate without invention.

This is one of the best later PLT opportunities.

## 5. What is worth routing upstream?

PLT-02 distinguishes a missing fact that merely limits graphic richness from a missing fact worth making an architectural decision about now.

### U1 — internal door positions/swings: **do not rewind now**

They matter to a mature plan, but HFI has correctly established that final circulation adequacy depends on door approach, nibs, clear openings, encroachments and complete-action geometry. Choosing leaves/swings merely to beautify PLT would reverse that discipline.

Keep unresolved until the architectural/HFI route is ready to select them for the house itself.

### U2 — entrance/garden/courtyard threshold profiles: **do not rewind now**

These need technical doorset/drainage/weathering/site facts. A publication-driven decision would be especially dangerous because a visually flush line can falsely imply solved water management.

Keep as designed interface / unresolved technical profile.

### U3 — courtyard/garden exact aperture extents: **candidate later architectural rewind, but not a PLT-03 blocker**

These are the missing facts most likely eventually to justify a bounded upstream design packet because they materially affect façade order, daylight, threshold relationships and the ability of the courtyard/garden elevations to reach FRAME-GRADE maturity.

Do not invent them inside PLT. Record them as the principal future architecture-source opportunity.

### U4 — finished stair plan/well geometry: **candidate later architectural rewind, but not a PLT-03 blocker**

The project now owns strong numeric stair targets but not a finished stair anatomy. Because stair geometry affects plan, section and human factors, a future source packet may be warranted. PLT-03 can proceed using topology/reservation/derived mathematics without pretending the stair is complete.

## 6. PLT-03 admissible exemplar palette

The ground-floor exemplar may use:

- exact shell/court geometry and derived placement;
- controlled/provisional wall planning family with uncertainty preserved;
- front bay axes and owned opening extents;
- relationship-level courtyard/garden opening information without upgrading unknown geometry;
- current required-adjacency/shared-edge model rather than fabricated internal doors;
- stair reservation plus controlled 18-riser / 300 mm / 6-6-6 / 5-going topology information, without resolved tread/guard/well anatomy;
- Source Sans 3 through the TYP interface once the PLT-03 cross-gate is actually satisfied;
- selective B-class dimensions derived from controlled coordinates;
- reduced notes where geometry/metadata can now carry the same owned meaning.

It may **not** use:

- generic door swings;
- invented frame/reveal depth;
- resolved external thresholds;
- construction wall layers;
- invented furniture/people/landscape;
- exact technical roof/service details merely because conventional architectural drawings often show them.

## 7. Semantic-diff consequences for v2

Against `drawing-publication-v1`:

- retaining the same fact with new graphic treatment is `R`;
- removing or changing a v1 publication-only proxy to reflect stronger current architectural authority is `S`, with the current source/COA/HFI authority cited;
- adding any C-class geometry is `X` and fails.

This means semantic fidelity does **not** require v2 to preserve every old drawn coordinate. It requires v2 to explain any semantic movement and route it to a stronger source.

## 8. Packet decision

PLT-02 resolves the apparent paradox from PLT-01:

> **The project owns enough additional architecture to make the plates materially better, but not enough to make them conventionally “complete” without lying.**

The correct refinement strategy is therefore selective:

1. expose more of the A/B geometry already owned;
2. subtract obsolete publication-only specificity where current authority is stronger;
3. improve hierarchy and composition around that truth;
4. keep C-class absences visible;
5. route only genuinely architectural missing facts upstream — never solve them in the renderer.

PLT-03 is **not blocked by doors, thresholds or complete façade aperture selection**. It can proceed on the ground-floor exemplar with the admissible palette above.

The principal later source risks are courtyard/garden aperture completion and finished stair/well geometry; neither justifies stopping the first exemplar.

**Next authorised packet after clean merge: PLT-03 — ground-floor exemplar + drawing token / typography gate.**
