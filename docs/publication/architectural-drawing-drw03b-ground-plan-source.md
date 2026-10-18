<!-- nav-exclude: redirect -->
# DRW-03B — Ground-floor publication-plan source hardening

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-03B  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `cf99b2bf74cc1e4553b2a74a6cfd381b2739f73c`

## 1. Outcome

DRW-03A found that the Reference House morphology was already strong enough for the first publication plan but six representation-critical facts were still absent from executable source. DRW-03B closes exactly those six categories and no others.

The new companion source lives at:

- `compiler/reference-house/publication-plan-source.ts`

It is intentionally separate from the RH-C1 inspection fixture. RH-C1 remains the canonical semantic house source; DRW-03B adds only the bounded planning-resolution facts required to turn that house into an honest `1:100` architectural publication plan.

## 2. Governing distinction

A publication plan needs more geometry than a topology diagram, but less authority than a technical construction drawing.

DRW-03B therefore distinguishes:

- **house truth already owned by RH-C1** — shell, court, room topology, plan lines, principal front opening order, stair arithmetic;
- **publication-plan source added here** — bounded wall bodies, stair footprint, circulation openings and previously qualitative/provisional court/garden opening geometry;
- **technical truth still absent** — construction build-ups, exact partition systems, product openings, door leaves, MEP, fire, structure, regulatory proof and real-site orientation.

The drawing is allowed to become architectural without becoming falsely technical.

## 3. Six authorised source categories

### A. Planning cut-wall bodies / face ownership

The source now states that:

- shell coordinates own the **outer face**;
- court coordinates own the **court void face**;
- internal planning lines own the **centreline** of their publication-plan body.

This ownership rule is controlled because deterministic offset direction is a representation contract, not a technical selection.

Two explicit **provisional drawing proxies** are then authored:

- external/courtyard body proxy: **≈400 mm**;
- ordinary internal body proxy: **≈125 mm**.

The 400 mm value is deliberately the lower bound of the already-controlled `400–425 mm` planning family. It is **not** a midpoint, hidden nominal construction thickness or assertion of final masonry/cavity/finish geometry.

The 125 mm value re-authorises the earlier planning allowance solely as a plan-body proxy. It is not a selected partition specification.

### B. Ground stair plan placement/topology

The stair remains the RH-03 three-flight principal stair. DRW-03B adds only a bounded `1:100` planning footprint:

- host: `G-HALL-02`;
- approximate reservation: X `4000–6500`, Y `450–2950`;
- three-flight quarter-turn topology;
- flight directions: north → east → south;
- clockwise progression;
- up direction toward first floor.

The reservation remains provisional. It does not author strings, guards, handrails, exact well construction, detailed landings, headroom proof or compliance sign-off.

The footprint preserves a **1300 mm gross eastern arrival strip** between the stair reservation and the court-east/hall boundary, consistent with RH-03’s requirement that the ordinary all-weather route survive beside the stair.

### C. Minimum internal circulation openings

One planning-level open passage is authored for each of the seven ground adjacencies already required by the canonical house source:

1. drawing ↔ family;
2. drawing ↔ hall;
3. hall ↔ gallery;
4. study ↔ gallery;
5. service suite ↔ gallery;
6. family ↔ garden dining;
7. garden dining ↔ kitchen.

Each occurrence owns only:

- host boundary;
- connected spaces;
- approximate centre coordinate;
- approximate width;
- treatment = `open-passage`.

No hinged leaf, handing or swing is invented.

### D. Centred north/south courtyard-opening widths

The two already-controlled centred ground court relationships become drawable as approximate openings:

- south / hall → court: centre X `6000`, width ≈`1600`;
- north / garden dining → court: centre X `6000`, width ≈`1600`.

Their common centre remains the controlled courtyard axis. Width is explicitly provisional.

### E. East/west ground courtyard openings

The RH-04 qualitative orders now have provisional executable coordinates:

- east gallery face: two openings centred approximately Y `4400 / 6400`, each ≈`900` wide;
- west occupied-room face: drawing-room opening centred approximately Y `4200`, ≈`900` wide; family-room opening centred approximately Y `6200`, ≈`1000` wide.

This is enough to draw the selected two-bay/room-owned court order. It is not a sash schedule.

### F. Garden-side ground opening field

The existing provisional RH-10 three-axis garden composition is promoted into the publication-plan source at the same provisional status:

- west/family axis X≈`2100`, width ≈`1400`;
- centre/garden-dining logistics opening X=`6000`, width ≈`1800`;
- east/kitchen axis X≈`9900`, width ≈`1400`.

This lets the ground plan show real outer-aspect and garden relationships without claiming final frame, threshold or façade-detail geometry.

## 4. Authority / precision policy

Every newly selected dimension, centre or footprint in this packet is:

- `authority: PROVISIONAL`;
- `authorship: AUTHORED_PROVISIONAL`;
- `disposition: PROVISIONAL_BUT_REPRESENTABLE`;
- `precision: approximate`.

The sole controlled fact introduced here is wall **face ownership**, because without it a renderer cannot know how to offset a planning body from a source line. That rule says nothing about construction composition or performance.

Tests reject accidental promotion of the provisional values.

## 5. Explicit non-authority

DRW-03B still does not source:

- true north or real orientation;
- section cuts/markers;
- site boundaries, neighbours, levels, utilities or drainage destination;
- technical wall build-ups;
- exact internal door leaves/swings;
- final window/door frame/reveal/threshold geometry;
- side-elevation opening schedules;
- utility/WC/plant packing;
- MEP routes;
- stair strings/guards/handrails/headroom construction;
- fire, structure, accessibility or other compliance proof.

Nothing in the new source may be interpreted as proof of those domains.

## 6. Tests

`compiler/reference-house/publication-plan-source.test.ts` proves that:

- all six authorised source categories exist and no seventh category is introduced;
- all newly selected dimensions remain provisional/approximate;
- the 400 mm external/court body is explicitly the lower-bound drawing proxy, not an invented `412.5 mm` midpoint;
- the stair footprint remains inside the hall and preserves the eastern arrival strip;
- the seven internal openings correspond exactly to the seven canonical ground adjacencies;
- no door swing is introduced;
- court/garden orders are executable but provisional;
- no north-arrow, section-marker or site-boundary source exists.

## 7. Handoff to DRW-03C

DRW-03C may now build the **minimum shared publication drawing scene** required by this plan.

It should consume:

- canonical RH-C1 derived shell/court/spaces/boundaries/front openings;
- the DRW-03B companion publication-plan source for bounded wall bodies, stair footprint and added openings;
- frozen DRW-01 physical-paper tokens.

It must not expand the architectural source further. If rendering exposes a genuinely missing architectural fact rather than a representation problem, stop and reopen DRW-03B instead of inventing it in renderer code.
