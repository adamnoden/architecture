<!-- nav-exclude: redirect -->
# DRW-03A — Ground-floor publication-view authority audit

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-03A  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `fcf3691a639153827358664b73982e68e7c01707`

## 1. Purpose

Freeze the authority boundary for the first native architectural publication drawing: the Reference House ground-floor plan.

DRW-02D already fixed the view as **ESSENTIAL**, `1:100`, and one half of a `PLATE_PAIR` with the first-floor plan. Its reader task is:

> **Programme, court morphology, arrival, service flank, maintenance approach and future-adaptation substrate.**

DRW-03A asks a narrower question before any source mutation or renderer work:

> **What can the current canonical source honestly draw as an architectural ground-floor plan, what minimum facts are still missing, and what must the publication refuse to infer?**

This packet does not edit the Reference House source, implement rendering, generate SVG, place a plate, alter publication numbering or begin DRW-03B.

## 2. Authority order

For this audit, authority is read in the following order.

1. `docs/reference-house/model-baseline-rhc0.md` — canonical architectural source schedule and explicit outside-scope boundaries.
2. `compiler/reference-house/fixture.ts` plus the current Reference House derivation/plan adapter — executable semantic source.
3. RH-02 / RH-03 / RH-04 gate records where the baseline explicitly inherits their architectural decisions.
4. `docs/reference-house/rhc0-drawing-parity-audit.md` and `rhc1-drawing-parity-result.md` — cross-view and executable-parity records that say which omissions are deliberate.
5. Current generated/hand-authored drawings — inspection/comparator evidence only, never source geometry.

No coordinate is harvested from an SVG.

The existing `compiler/plan-slice/drawing.ts` is an inspection renderer. Its boundary lines and opening dots prove semantic projection; they are not a publication-plan grammar.

## 3. Current source is stronger than the current drawing

The source already owns a coherent ground-floor spatial fixture:

- outer shell `12,000 × 10,800 mm`;
- centred court `3,600 × 4,000 mm`, deriving edges `X=4,200/7,800`, `Y=3,400/7,400`;
- the eight ground spaces and their current names;
- the RH-03 hall correction `X≈4,000` as provisional-but-representable;
- west room split `Y≈5,000` as provisional-but-representable;
- gallery/service partition `X=9,100` and the principal court-continuation planning lines;
- controlled adjacency topology;
- front four-bay rule and entrance membership;
- controlled front opening centres with provisional opening families;
- centred north/south courtyard opening relationships;
- qualitative east/west courtyard opening order;
- stair rise/going topology, width target and `≈2.4–2.5 m` planning reservation;
- external/courtyard wall planning family `400–425 mm`, plus the `450 mm` stress boundary;
- explicit authority/precision metadata.

The present generated plan looks schematic because the renderer deliberately exposes only part of that information and because several items necessary to a conventional publication plan were intentionally left outside RH-C1.

That distinction matters: DRW-03 is not allowed to treat every visual absence as missing architecture.

## 4. Minimum publication-plan content

The first publication plan is an architectural overview, not a joinery, tender, fire or MEP plan. At `1:100`, the minimum honest content is:

- cut enclosure and principal internal divisions with a legible cut hierarchy;
- courtyard void;
- room/circulation names;
- principal exterior openings sufficient to read front, court and garden relationships;
- the principal stair at planning/topological resolution, with conventional up direction;
- the minimum internal openings needed to make the controlled circulation/adjacency topology physically legible;
- overall/court and selected major derived dimensions;
- numeric scale plus graphic scale bar;
- explicit provisional treatment where the architecture is approximate.

It does **not** require furniture, technical wall build-ups, door hardware, service routes, plant packing, construction details or a complete window schedule.

## 5. Authority matrix

### 5.1 Geometry already supported — no DRW-03B architectural invention

| Publication element | Current authority | Publication treatment | 03B action |
|---|---|---|---|
| outer shell | controlled `12,000 × 10,800` source | ordinary plan extent | none |
| courtyard | controlled `3,600 × 4,000`, centred | paper-white external void inside ring | none |
| court edges / wing depths | derived exactly from shell + court | may dimension derived values | none |
| eight ground spatial reservations | executable named spaces | human room labels; source uncertainty retained | none |
| hall west line | `X≈4,000`, provisional | provisional-but-representable plan division | none |
| west room split | `Y≈5,000`, provisional | provisional-but-representable plan division | none |
| gallery/service line | `X=9,100`, controlled | ordinary plan division | none |
| court-continuation divisions | controlled source boundaries | ordinary plan divisions | none |
| front four-bay axes | controlled rule, derived centres `1,950 / 4,650 / 7,350 / 10,050` | principal front opening locations | none |
| front ground opening roles | drawing window / stair window / entrance / study window | conventional simplified opening marks | none |
| front opening sizes | source-owned approximate/range families | uncertainty must remain visible; no hidden exact midpoint | none |
| courtyard N/S opening centres | boundary-centred relationships | centreline is controlled | width still missing; see §5.2 |
| adjacency topology | seven ground required adjacencies | establishes which connections must remain possible | opening geometry still missing; see §5.2 |
| stair arithmetic/topology | 18 risers, 6/6/6, 5×280 goings per flight | supports plan stair logic, not final construction | plan placement still missing; see §5.2 |
| wall planning range | `400–425` normal / `450` stress | constrains any planning-wall representation | wall faces still missing; see §5.2 |
| front/street and rear/garden handedness | fixture coordination convention only | labels such as front/street surrogate and garden may orient the reader | **no north arrow**; see §6 |

### 5.2 Required for this publication view but not yet source-complete

These are the only categories DRW-03B is authorised to harden for the ground plan.

#### A. Planning cut-wall bodies

**Problem.** Current source owns semantic boundary lines and an external/courtyard wall thickness range, but no wall faces. DRW-01B permits black poche only where controlled solid matter is actually cut. Rendering a `400–425 mm` range as one secretly selected nominal thickness would violate the RH-C0 contract.

**Why the plan needs more.** A `1:100` publication plan whose walls remain inspection-centrelines is still a topology diagram, not the ordinary architectural plan DRW promised.

**DRW-03B authority task.** Author the minimum **planning-representation wall-face contract** required to form cut matter:

- external/courtyard wall plan body at explicitly provisional planning resolution, tied to the existing `400–425 mm` family rather than disguised as construction thickness;
- ordinary internal planning-boundary body sufficient to read rooms as rooms, with its own explicit provisional authority if a thickness is required;
- a clear statement of whether shell/court coordinates govern outer face, centreline or another face before offsets are derived.

This is representation-grade architectural geometry only. It must not create masonry leaf, cavity, insulation, finish or thermal truth.

#### B. Ground stair plan placement

**Problem.** RH-03 selected a three-flight stair in the western part of the entrance hall, retained an eastern arrival passage, and established a `≈2.4–2.5 m` planning reservation. RH-C1 correctly refused to copy the old schematic stair box because exact plan placement, flight arrangement around the well and strings were not canonical source facts.

**Why the plan needs more.** The ground plan cannot prove arrival, principal circulation or the hall/stair relationship while drawing only the label `hall / stair`.

**DRW-03B authority task.** Author a bounded **planning stair footprint** sufficient for `1:100` notation:

- anchored reservation location inside `G-HALL-02`;
- three-flight sequence/orientation;
- landings/well only to the resolution needed to show how the stair occupies the hall;
- conventional up direction.

Do **not** author final strings, guarding, handrails, construction, exact technical well, headroom proof or compliance sign-off.

No coordinates may be lifted from `stair-ground-floor-overlay.svg`; that file is provenance only.

#### C. Minimum internal circulation openings

**Problem.** The source owns seven required ground adjacencies but intentionally owns no internal door positions, leaf widths or swings. Continuous boundary lines would make several controlled rooms appear physically sealed.

**Why the plan needs more.** The publication reader must be able to inspect the all-weather route and linked domestic sequence, not infer circulation from an adjacency table they cannot see.

**DRW-03B authority task.** Author planning-level openings only where needed to make the existing adjacency topology legible:

- drawing ↔ family;
- drawing ↔ hall;
- hall ↔ gallery;
- study ↔ gallery;
- service suite ↔ gallery;
- family ↔ garden dining;
- garden dining ↔ kitchen.

Each needs a host, bounded placement and planning width/width class. **Door leaf, handing and swing are not required by DRW-03 and remain absent unless an owning architectural decision genuinely exists.** A cased/open passage may be represented as such; DRW-03B must not invent a hinged door simply because CAD convention makes one easy to draw.

#### D. Width of the two centred courtyard openings

**Problem.** South and north court opening centres are controlled at the courtyard axis, but their family width is currently unknown.

**Why the plan needs more.** These openings carry the front → hall → court → garden architectural sequence. A centre point without an opening extent cannot become an honest plan opening.

**DRW-03B authority task.** Give the ground south and north major court openings a bounded approximate/range width adequate for overview representation, without product/frame/threshold detail.

#### E. East/west courtyard opening geometry at ground level

**Problem.** Current authority deliberately stops at:

- east: two-bay gallery rhythm;
- west: two room-owned axes;
- exact numeric centres absent.

**Why the plan needs more.** Part IV asks the plans to make the court-facing/multiple-aspect condition inspectable. A blank east/west court wall would contradict the controlled architectural proposition; invented window centres would overstate it.

**DRW-03B authority task.** Author only enough ground-level centre/width geometry to realise the already-selected RH-04 orders:

- two east gallery openings;
- two west room-owned openings.

These may remain explicitly provisional. Their purpose is to make the selected opening order drawable, not to freeze a sash schedule.

#### F. Garden-side ground opening field

**Problem.** RH-C0 records the provisional three-axis north/garden composition (`≈2,100 / 6,000 / ≈9,900`) as safe to derive **if represented**, but RH-C1 deliberately omitted it from required production geometry and retained only the centre relationship qualitatively.

**Why the plan needs more.** The ground plan’s reader task includes the front-to-court-to-garden sequence, while Part IV also relies on outer-aspect responsibility for the family room and kitchen. A completely blank garden wall would under-report current architecture.

**DRW-03B authority task.** Promote the existing **provisional garden-field relationship** into executable source at the same provisional status, sufficient to host the ground family / garden-dining / kitchen openings. At minimum the centre garden-dining/logistics opening must become numerically representable. No final frame, sill, threshold or glazed-wall claim follows.

### 5.3 Representation work, not source hardening

The following belong to DRW-03C/D once §5.2 is source-complete. They are not reasons to add more architecture in DRW-03B:

- black-only line/poche token application;
- paper-space line weights;
- human room-label placement;
- collision handling;
- scale ratio and 25–40 mm graphic scale bar;
- dimension strings/ticks;
- conventional stair arrow/symbol;
- uncertainty dash/note grammar;
- opening-frame simplification appropriate to `1:100`;
- SVG serialization and semantic lineage metadata.

## 6. Explicitly forbidden in the ground-floor publication plan

DRW-03 must not infer or imply any of the following merely to make the drawing look complete.

### Site/orientation

- **No true north arrow.** `+Y=north` is a fixture coordinate convention, while the manuscript explicitly says there is no commissioned site and no real orientation.
- no real boundaries, neighbours, utilities, drainage destination, levels or planning context;
- no permanent external maintenance strip drawn as though a future legal/site right exists.

The later synthetic setting/maintenance pair owns that surrogate-site reading.

### Wall/construction detail

- no hidden nominal construction thickness chosen from `400–425` without explicit 03B authority;
- no masonry leaves, cavity, insulation, airtightness layer, finish thickness or structural adequacy;
- no material hatch merely because an architectural plan usually has one.

### Openings and doors

- no exact east/west court opening centres until 03B authors them;
- no side-elevation window coordinates;
- no door swing/handing by default;
- no final window frame, sash, reveal or threshold geometry;
- no assumption that an `entrance` opening proves accessibility or regulatory compliance.

### Stair

- no final stair strings, exact technical well, guard, handrail, nosing or headroom proof;
- no claim that plan notation certifies Approved Document K compliance.

### Services/adaptation

- no fabricated utility/WC/plant subdivision inside the gross service suite;
- no plant packing, riser capacity or MEP routes;
- no adaptation route arrow on the base plan — DRW-02D separately owns the future-adaptation overlay;
- no claim of M4(2) compliance.

The base plan supplies the **substrate**: family room, arrival/circulation geometry and service-suite geography.

### Cross-view notation

- **No section markers yet.** DRW-05 has not frozen the principal section cut/direction as a publication-view source fact.
- no public figure-number family invented by the renderer.

## 7. Dimension contract for DRW-03

The base plan may safely dimension only what serves architectural inspectability and is source-owned.

### Controlled / derived dimensions eligible for ordinary notation

- overall `12,000 × 10,800`;
- court `3,600 × 4,000`;
- gross side fields `4,200 / 3,600 / 4,200`;
- gross front/court/rear fields `3,400 / 4,000 / 3,400`;
- other values derived exactly from these where a real reader task requires them.

### Provisional dimensions, only if materially useful

- hall west line `≈4,000`;
- west room split `≈5,000`;
- any 03B-authored planning opening/stair/wall representation explicitly carried as approximate/range.

Do not dimension every room simply because the geometry permits it. This is an inspectable publication plan, not a tender plan.

## 8. Reader-task closure

If DRW-03B completes only the six missing source categories in §5.2, the `1:100` plan can honestly close its frozen reader task:

| Reader task | Minimum evidence on base plan |
|---|---|
| programme | named ground rooms/circulation from canonical spatial source |
| court morphology | shell/court geometry plus controlled court-facing openings |
| arrival | front entrance, hall, principal stair and centred hall→court relationship |
| service flank | gallery + gross service suite + kitchen geography; no MEP overlay required |
| maintenance approach | base plan shows the service-side architectural geography; external working routes remain for the later setting/maintenance overlay |
| future-adaptation substrate | family room + ground circulation + service-suite geography; adaptation claim itself remains for the later overlay |

Nothing in that closure requires furniture, a complete door schedule, exact side windows or technical construction.

## 9. DRW-03B source-hardening contract

DRW-03B is authorised to touch source only to close these six categories:

1. planning cut-wall bodies / face ownership;
2. bounded ground stair plan placement/topology;
3. minimum ground internal circulation openings;
4. ground north/south courtyard-opening widths;
5. ground east/west courtyard opening positions/widths at provisional architectural resolution;
6. provisional executable garden-side ground opening field.

Every added fact must carry the narrowest honest precision/authority state and tests proving that downstream derivation cannot silently promote it.

### Stop/split rule

If DRW-03B discovers that a convincing ground plan requires any new category outside those six — for example detailed service-room subdivision, side-elevation fenestration, technical wall build-up, furniture, fire strategy or accessibility design — it must stop and reopen DRW-03A rather than broaden source casually.

## 10. Consequence for the renderer

After 03B, DRW-03C can remain small.

The renderer does **not** need a generic CAD/BIM kernel. The first plan needs only:

- deterministic world-space cut bodies/openings/stair primitives backed by source authority;
- world→paper transform at `1:100`;
- the frozen DRW-01 paper-space tokens;
- labels/dimensions/symbols sufficient for this one view;
- SVG output with lineage and deterministic regeneration.

The existing plan-slice renderer may remain available as an inspection surface. Publication output should share truth with it, not inherit its opening-dot/centreline visual grammar.

## 11. DRW-03A result

**PASS.** The ground-floor publication plan is source-feasible without reopening the Reference House morphology.

The audit found no need to change:

- shell or court dimensions;
- room programme/order;
- controlled plan lines;
- façade bay order;
- service flank;
- overall stair topology;
- publication scale or page class.

It did find six bounded representation-critical source gaps, all downstream of already-selected architecture. They are now the complete DRW-03B scope.

The key constraint is:

> **DRW-03B may make selected architecture drawable; it may not make unresolved architecture look selected.**

**Next packet:** `DRW-03B — add only the six missing ground-plan source facts above, with explicit authority/precision tests.`
