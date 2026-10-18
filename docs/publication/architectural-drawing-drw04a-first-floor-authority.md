<!-- nav-exclude: redirect -->
# DRW-04A — First-floor publication-plan authority and bounded source hardening

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-04A  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `c5db4feee48a91101deef7df98bed8e0aafc16fa`

## 1. Purpose

DRW-04A determines what the first-floor `1:100` publication plan is allowed to say after the ground-plan work and the corrective DRW-04A.1 circulation packet.

The objective is deliberately narrow:

> **reuse every first-floor fact already earned by the canonical Reference House or DRW-03, and author only the residual planning geometry required to make the upper floor legible as architecture.**

The target view remains the essential first-floor plan frozen by DRW-02D. Its reader task is to make the bedroom / landing / gallery order, bathroom/service alignment and consequence of deleting the remote principal en-suite immediately legible. It must pair with the ground plan at the same `1:100` scale.

## 2. Authority order

For this packet the governing order is:

1. canonical executable Reference House source and compiled result;
2. RH-03 upper-floor/stair architecture, as superseded where later gates explicitly change it;
3. RH-04 plan/section/elevation coupling;
4. RH-06 service decision deleting the principal en-suite;
5. RH-10 garden/outer-elevation coordination and RH-C0 parity/domesticity audits;
6. DRW-04A.1 upper-circulation correction;
7. DRW-03B publication-plan representation source, but only for facts deliberately shared across floors;
8. generated RH-C1 SVGs as inspection evidence only.

No coordinate is harvested from an SVG or historical comparator.

## 3. Current first-floor substrate

After DRW-04A.1 the canonical source is strong enough to own the plan morphology without another room-layout rewrite.

It already controls or provisionally represents:

- the `12000 × 10800 mm` shell;
- the centred `3600 × 4000 mm` court;
- four bedrooms, not five;
- south stair / landing, east gallery and north cross-landing as one positive-width U-shaped route;
- no west gallery;
- family bathroom on the east service flank;
- dry dressing/storage and linen in the north-centre field;
- deletion of `U-ENS-01` as an active wet room;
- the front four-bay axes and upper front opening family;
- the centred north/south courtyard relationships;
- qualitative east/west courtyard orders with vertical alignment where coherent;
- the RH-10 three-axis garden composition and corrected centre host `U-DRESS-01`;
- the principal-bedroom and east-rear-bedroom garden openings as outer-façade / escape obligations at coordination level.

DRW-04A.1 also proved that the south stair turn, east gallery and north turn meet over real edge lengths rather than mathematical corner points.

## 4. A false alarm deliberately rejected

During this audit the executable `requiredAdjacencies` initially appeared to imply that the principal bedroom could only be reached through `U-BED-02`, because `U-BED-P01 ↔ U-LAND-N01` is not in that list.

That interpretation is wrong.

The compiler uses `requiredAdjacencies` only to assert that named spaces share a planning edge. It does **not** define the internal door schedule. RH-03 separately owns the circulation statement that the south/east/north route serves all four bedrooms and wet/service rooms.

Therefore DRW-04A does **not** mutate the canonical adjacency set merely to encode doors. Publication door apertures belong in the bounded publication companion source.

This distinction prevents a drawing requirement from silently changing semantic house topology.

## 5. What DRW-03 already earned and DRW-04A must reuse

### 5.1 Wall representation

DRW-03B already fixed the plan representation contract:

- shell coordinates own outer faces;
- court coordinates own void faces;
- internal planning lines own publication-body centrelines;
- external/court body proxy ≈`400 mm`;
- ordinary internal body proxy ≈`125 mm`.

These are plan-representation facts, not ground-floor architectural facts. DRW-04A introduces **no second wall-thickness family**. DRW-04B may generalise the implementation naming so both plan renderers consume the same source.

### 5.2 Stair footprint and topology

The principal stair is one vertically continuous object. DRW-03B already bounded its planning reservation and three-flight topology:

- approximate reservation X `4000–6500`, Y `450–2950`;
- north → east → south flight sequence;
- clockwise progression;
- three-flight geometry inherited from RH-03.

The first-floor plan therefore does not earn a second independently placed stair. DRW-04B may project the same provisional reservation/topology from the upper cut with appropriate `DOWN` / arrival notation, but may not invent a new well, string, guard, handrail or technical floor-opening geometry.

## 6. Residual publication source that is genuinely needed

The new companion source is:

- `compiler/reference-house/publication-first-floor-plan-source.ts`

It contains only three categories: private-room apertures, upper courtyard openings and upper garden openings.

### A. Minimum upper internal apertures

RH-03 states that the three circulation fields serve the four bedrooms and wet/service rooms. RH-06 replaces the rejected en-suite with useful dry dressing/linen storage. A publication plan with solid internal walls everywhere would therefore under-report the actual architecture.

DRW-04A authors seven planning-level apertures:

1. west-front bedroom ↔ south stair/landing;
2. east-front bedroom ↔ south stair/landing;
3. principal bedroom ↔ north cross-landing;
4. family bathroom ↔ east gallery;
5. east-rear bedroom ↔ north cross-landing;
6. dry dressing/storage ↔ north cross-landing;
7. linen ↔ north cross-landing.

Each owns only:

- the existing host boundary;
- the connected spaces;
- an approximate centre;
- an approximate `900 mm` publication aperture proxy;
- treatment = `door-aperture-no-leaf`.

The `900 mm` value is **not** a final clear opening, accessibility decision, joinery size or Human Factors resolution. It is a provisional planning aperture sufficient to prevent the plan from lying about circulation. No leaf, handing or swing is authored.

The continuous stair → gallery and gallery → north-landing transitions require no artificial doorway: DRW-04A.1 made those circulation fields meet directly.

### B. Upper courtyard opening field

RH-04 is unusually explicit here:

- south court: upper stair/landing opening directly above the centred ground opening;
- north court: upper landing opening directly above the centred ground opening;
- east court: two aligned ground/upper gallery openings;
- west court: room-owned upper/lower axes aligned where the plan supports it.

The DRW-03B ground publication source has already made those orders executable. Because the current upper hosts remain coherent with those axes, DRW-04A derives the upper publication centres and cut widths from the corresponding DRW-03B ground openings rather than selecting six independent new numbers.

The result is:

- south/north centre X `6000`, width proxy ≈`1600`;
- east gallery centres Y ≈`4400 / 6400`, width proxies ≈`900 / 900`;
- west room-owned centres Y ≈`4200 / 6200`, width proxies ≈`900 / 1000`.

All upper occurrences remain provisional. Cross-floor alignment is the authority; DRW-03B pixels are not.

### C. Upper garden opening field

RH-10 fixes the garden composition at approximately:

- west X `2100` — principal bedroom;
- centre X `6000` — dry dressing/storage field;
- east X `9900` — rear secondary bedroom.

Exact rear opening widths remain deliberately unresolved. For the publication plan DRW-04A therefore uses the **lower bound of the already-controlled upper-window family**, `900 mm`, as a drawing cut proxy for all three occurrences.

This is the same anti-false-precision move used by DRW-03B for wall bodies: reuse an existing bounded family edge rather than invent a midpoint or pretend a product schedule exists.

The centre dry-space opening may ultimately be lighter/narrower than the bedroom windows; this plan proxy does not override that RH-10 latitude.

## 7. Authority matrix

| Plan content | Authority after DRW-04A | Publication treatment |
|---|---|---|
| shell / court | canonical controlled source | draw directly |
| upper room reservations | canonical source, including DRW-04A.1 turns | draw directly |
| U-shaped circulation | canonical source + RH-03 + DRW-04A.1 | draw directly |
| wall bodies | DRW-03B shared representation contract | reuse; do not re-author |
| stair footprint/topology | RH-03 + DRW-03B | reuse same provisional stair; upper notation only is new |
| front openings | canonical numeric source | draw directly |
| internal private-room apertures | DRW-04A companion source | provisional gaps; no leaves/swings |
| north/south court openings | RH-04 vertical relationship + DRW-03B executable ground field | vertically aligned provisional upper cuts |
| east/west court openings | RH-04 aligned/room-owned order + DRW-03B ground field | vertically aligned provisional upper cuts |
| garden west/centre/east axes | RH-10 | provisional `900 mm` plan-cut proxy |
| bathroom/service alignment | canonical room geography + RH-06 | show room position only; no MEP overlay |
| deleted principal en-suite | RH-06 | show dry dressing/storage; do not draw rejected wet room |
| true north / site | absent | do not draw |
| section markers | deferred to DRW-05 | do not draw |
| technical stair/wall/door construction | absent | do not infer |

## 8. Dimension contract

The first-floor base plan remains deliberately sparse.

At `1:100` it may show dimensions already useful on the ground plan and controlled by the same source:

- overall shell width/depth;
- courtyard width/depth;
- only a small number of internal controls if they materially explain the upper arrangement.

It must not become a pseudo-working drawing by adding chains for every provisional bedroom split, door aperture or wall proxy.

The paired ground/first plate should make cross-floor registration do more explanatory work than dimension clutter.

## 9. Explicit forbidden invention

DRW-04B/04C must not add:

- door leaves, handing or swing arcs;
- final clear-opening claims from the `900 mm` aperture proxies;
- final stair strings, nosings, guards, handrails, well construction or headroom proof;
- technical wall build-ups or construction thicknesses;
- a revived principal en-suite;
- service pipes, ducts, riser internals or bathroom fixture layouts on the base plan;
- exact side-elevation window schedules not already required by this source;
- true north, site boundary, neighbours, levels or real utility approach;
- section-cut markers before DRW-05 owns the section relationship;
- regulatory/compliance claims from the existence of openings or escape-window obligations.

## 10. Reader-task closure

With this packet the source is sufficient for the first-floor base plan to communicate, without prose rescue:

- four-bedroom private-floor hierarchy;
- stair arrival and the three-sided circulation route;
- bathroom alignment with the service flank;
- dry dressing/linen occupying the territory where the rejected en-suite might otherwise have appeared;
- front, courtyard and garden aspect;
- deliberate absence of a west gallery;
- direct comparison with the ground plan at the same scale.

The plan does not need a rejected-design inset to prove the en-suite deletion. Showing the current dry-space resolution, together with later service/structural evidence, is stronger and less process-laden.

## 11. Tests and handoff

`compiler/reference-house/publication-first-floor-plan-source.test.ts` locks that:

- only the three authorised first-floor source categories exist;
- every selected coordinate/width remains provisional and approximate;
- the seven upper apertures are wall openings without door leaves/swings;
- every aperture sits on an actual boundary shared by its declared spaces;
- upper court geometry is derived from DRW-03B only where RH-04 authorises vertical alignment;
- garden centres remain `2100 / 6000 / 9900` with the correct hosts;
- the garden width proxy is the lower bound `900`, not an invented `925 mm` midpoint;
- geometric `requiredAdjacencies` are not silently reinterpreted as a door schedule;
- no wall/stair/site/north/section source is duplicated here.

### Handoff to DRW-04B

DRW-04B may now add **only genuinely new first-floor rendering capability**:

1. consume the same wall-body representation contract as the ground plan;
2. project the existing stair source from the upper level with restrained down/arrival notation;
3. render `door-aperture-no-leaf` without inventing swings;
4. consume the upper court/garden companion openings;
5. handle first-floor labels/collisions while preserving the frozen physical-paper grammar.

If implementation discovers a missing architectural fact rather than a rendering problem, stop and reopen DRW-04A. Do not bury architectural authorship in renderer coordinates.
