# Reference House — RH-08 Roof, Drainage and External Maintenance

**Status:** RH-08 design gate record / pre-technical coordination  
**Date:** 2026-10-12  
**Question:** can the roof shed water, carry the required terminals and remain maintainable without internal drainage traps, unsafe improvised access or damage to the RH-04 architecture?  
**Architectural authority:** [RH-04 Plan / Section / Elevation Gate](plan-section-elevation-gate.md)  
**Structural authority:** [RH-05 Structural Coordination](structural-coordination.md)  
**Service authority:** [RH-06 Services and Failure Geography](service-topology-rh06.md) and [RH-07 MVHR Addendum](service-topology-rh07-mvhr-addendum.md)  
**Environmental authority:** [RH-07 Environmental Coordination](environmental-coordination.md)  
**Maintenance brief:** [External Access & Maintenance Plan](external-access-maintenance-plan.md)  
**Drawings:** [roof/drainage plan](roof-drainage-plan-rh08.svg), [external-maintenance access diagram](external-maintenance-access-rh08.svg)

RH-08 is not roof engineering, hydraulic sizing, temporary-works design or a contractor method statement. It fixes the **architectural roof and maintenance topology** strongly enough that later technical design cannot quietly introduce inaccessible box gutters, anonymous outlets, speculative roof hardware or façade-access problems.

The selected answer is deliberately simple:

> **Use four very-low-slope roof fields falling away from the courtyard to the outer perimeter. Keep primary roof drainage outside the courtyard. Keep the roof free of routine plant. Maintain it principally from planned external scaffold/tower positions rather than adding a roof hatch that does not itself make roof work safe.**

---

## 1. Regulatory / safety anchors

### Rainwater

Building Regulations requirement H3 requires adequate provision to carry rainwater from the roof. Where collected rainwater is discharged, the regulatory priority is:

1. adequate soakaway / infiltration where reasonably practicable;
2. watercourse where infiltration is not reasonably practicable;
3. sewer where neither preceding route is reasonably practicable.

The Reference House has no real site, soil, groundwater or sewer data. RH-08 therefore fixes the **building-side collection and failure geography**, not the final site discharge destination.

Canonical source: GOV.UK, *Drainage and waste disposal: Approved Document H* and Building Regulations requirement H3.

### Roof work

HSE HSG33 treats roof access as a task-specific safety problem. Credible methods include general access scaffold, stair towers, mobile towers, mobile access equipment, ladders and roof hatches. A hatch is therefore one possible access component, not a universal sign of maintainability.

RH-08 uses that distinction directly: first reduce the number of things that need roof access, then preserve ordinary external access for the remaining work.

Canonical source: HSE, *Health and safety in roof work (HSG33)*.

---

## 2. Roof-form comparison

### R0 — conventional pitched courtyard ring

A familiar pitched roof could be arranged around the court with ridges over the four wings and inner eaves / valleys collecting water around the courtyard.

**Advantages**

- familiar domestic construction language;
- visually legible roof silhouette;
- generous pitch can suit durable traditional coverings.

**Failure for this house**

- creates debris-prone rainwater collection at the least forgiving part of the plan;
- introduces inner gutters and/or valleys above an enclosed shaded court;
- increases the number of roof-level outlets and flashings that require court-side access;
- makes blocked drainage more likely to fail toward the building centre;
- increases roof geometry without an architectural requirement from G-01.

**Decision:** reject as the Reference House baseline.

### R1 — flat roof with internal outlets

A parapeted near-flat roof could preserve the clean cornice and discharge through internal outlets/downpipes.

**Advantage:** visually quiet.

**Failure:** moves critical rainwater components into concealed or internal geography. It solves the elevation by creating precisely the inspection and failure problem `PAT-009` warns against.

**Decision:** reject.

### R2 — four outward-draining low-slope fields — **SELECTED**

Divide the roof plan along the four diagonals between outer corners and courtyard corners. This produces four trapezoidal fields:

- south field — approximately **26.5 m²** plan catchment;
- north field — approximately **26.5 m²**;
- west field — approximately **31.1 m²**;
- east field — approximately **31.1 m²**.

Total roof-plan catchment remains approximately **115.2 m²**, matching the enclosed plate proxy.

Each field falls from the courtyard edge **outward** to its corresponding external elevation. The diagonal boundaries are watersheds, not valleys.

The roof therefore has:

- no primary inner courtyard gutter;
- no internal roof outlet;
- no valley collecting water toward the middle of the house;
- no need for rainwater pipes inside occupied rooms;
- four simple outer collection edges.

This roof form is selected.

---

## 3. Vertical geometry

RH-04 controls the outer cornice/eaves datum at approximately **+6250 mm**.

RH-08 keeps the roof visually subordinate to that line. For coordination only, test a low-slope waterproofing fall around the **1:40 class**. That is not a specification or minimum acceptable finished fall; the final system must meet its own technical requirements and tolerate structure/construction variation.

At that coordination fall:

- 3.4 m front/rear depth needs only about **85 mm** of rise;
- 4.2 m side depth needs about **105 mm**.

The courtyard high edge therefore rises only modestly above the outer low point. RH-07's shaded-light-court conclusion is not materially worsened by a tall pitched inner roof face.

The exact waterproofing build-up, insulation falls, parapet/coping and deck structure remain technical design.

### Architectural reading

From the principal front, the roof should remain largely recessive behind the controlled cornice/parapet line. RH-08 does **not** add a picturesque roof silhouette merely to make the house read as Georgian.

The project-specific conclusion is:

> **the roof is allowed to disappear when disappearance gives the rainwater system the cleaner geometry.**

That is not a G-01 rule.

---

## 4. Outer roof rainwater route — `RW-OUT-01`

### Collection

Use an open, inspectable gutter / collection edge at the outer perimeter, wholly outside the primary air/thermal boundary.

The final architectural detail may integrate the gutter closely with the cornice, but must preserve three behaviours:

1. debris can be seen and removed;
2. leakage/overflow sheds outward rather than into concealed wall build-up;
3. full gutter replacement does not require dismantling the permanent masonry envelope.

A hidden sealed box gutter buried inside the wall/roof boundary is not the baseline.

### Four corner-return downpipes

Split each perimeter gutter toward its adjacent corners. Place four main downpipes on **side/rear return geography**, not across the principal front field.

Under symmetrical flow division each corner pipe represents roughly **28.8 m²** of plan catchment before pitch/exposure hydraulic corrections. That figure is a coordination check only; final gutter/downpipe sizing must use the selected rainfall design method and actual roof geometry.

Working locations:

- `RWP-SW` — west side return, just behind the principal front;
- `RWP-SE` — east/service side return, just behind the principal front;
- `RWP-NW` — rear/west return;
- `RWP-NE` — rear/east/service return.

This keeps the principal south/front elevation free of downpipes while avoiding long concealed transfers.

### Failure / overflow

Each collection edge must have a deliberate overflow behaviour. Exact scupper/gutter geometry remains technical design, but overflow must:

- be visible from ground or ordinary access;
- discharge outward clear of openings and vulnerable wall bases;
- not first reveal blockage as internal damp;
- remain independent of decorative seals.

### Ground connection

Downpipes terminate at accessible gullies/inspection points. RH-08 does **not** select a buried perimeter ring drain before the site drainage strategy exists.

A real site must later decide whether these points feed infiltration, attenuation/watercourse or sewer in H3 priority order.

---

## 5. Courtyard surface-water route — `RW-COURT-01`

The selected roof deliberately sends **no primary roof catchment into the courtyard**. The court therefore has to manage principally its own approximately **14.4 m² open-to-sky plan area**, plus local wall runoff.

This is a substantial reduction in consequence compared with an inward-draining roof.

### Primary route

Use a removable-grate linear collector / silt box toward the **east/service side of the courtyard**, coordinated with paving falls.

From that accessible collector, use one straight, joint-minimised gravity route beneath the east service/gallery strip to an external service-side inspection point.

The under-slab route is accepted here because:

- it is short and straight;
- it passes beneath service/circulation geography rather than a principal room;
- it can be rodded/inspected from both ends;
- it need contain no maintainable joints beneath the building;
- leakage consequence is materially lower than an internal roof outlet above occupied fabric.

This is proportional serviceability rather than a rule that every drain must be exposed.

### Independent emergency overflow

The enclosed court needs a second failure path.

Provide a **separate higher-level overflow inlet** in the courtyard discharging through an independent straight conduit to a visible above-ground outlet on the east/service side.

The overflow outlet must discharge safely to an external surface-water position rather than invisibly into the same blocked internal collector.

Its job is not hydraulic normal operation. Its job is to make failure obvious and to keep water level below vulnerable internal thresholds if the primary court drain blocks.

Final inlet level, pipe size, threshold detail and external receiving surface require technical drainage design.

### Threshold rule

Courtyard doors may use accessible drained thresholds, but no room threshold should be the emergency overflow weir.

The court drainage / overflow datums must be coordinated so abnormal standing water escapes by the designed overflow before it enters occupied rooms.

---

## 6. Roof terminals and penetrations

The roof remains deliberately sparse.

### MVHR

Keep `MV-OA-01` and `MV-EA-01` on the **east/service-side high-level wall** as the preferred RH-08 terminal geography, subject to MEP separation, acoustic and contamination checks.

This is preferred to roof terminals because it:

- shortens the route from `MVHR-01`;
- keeps filter/terminal inspection on the service side;
- avoids two additional roof penetrations;
- keeps the roof fields clear for repair and possible future solar equipment.

If competent MEP design cannot achieve safe intake/exhaust separation or nuisance control on the wall, roof termination remains the fallback and RH-08 must be reopened locally.

### Cooker extract

`KX-01` remains a direct east/service-side wall terminal and does not enter the roof.

### Soil vent

The 100 mm-class soil/vent stack remains the one current service that is expected to require a roof-level termination.

Place it on the **east/service roof field near the outer service edge**, away from the principal front and away from MVHR intake as later MEP/drainage rules require.

The penetration is a designed roof crossing with accessible flashing from planned external roof access.

### No chimney / rooflight / rooftop plant currently selected

The Reference House currently has no fixed chimney, rooflight or rooftop plant requirement.

Adding one later is not a harmless object placement. It reopens RH-08 for drainage, access, structure, fire/weathering and architectural review.

---

## 7. Roof-access strategy — no permanent hatch at this gate

RH-08 maps the actual current tasks:

- inspect / renew waterproofing;
- inspect / renew outer gutters and copings;
- inspect the soil-vent penetration;
- inspect any later wall-mounted MVHR/cooker terminals from the service side;
- repair local roof/cornice conditions;
- potentially install/remove future solar equipment if later selected.

None requires frequent occupant access.

A permanent hatch would:

- add another roof/weather/air/thermal penetration;
- need a secure internal approach and landing;
- still not provide edge protection or a safe route across the roof;
- add little value when temporary scaffold already provides both access and edge protection for the likely maintenance tasks.

**Decision: no permanent roof hatch in the controlled RH-08 baseline.**

This is a positive task-derived decision, not an omission.

### Primary method

Use planned **ground-supported scaffold / tower access** from front, rear and side support positions. A general scaffold can provide roof-level access, edge protection and material handling in one system.

The roof geometry must therefore preserve:

- clear approach to at least two useful external elevations;
- ordinary scaffold/tower support positions;
- no irremovable landscape occupying the only feasible support line;
- no projection whose sole consequence is to make roof access specialist.

### Courtyard-side roof edge

Because the selected roof has no court gutter or routine terminal, inner-edge access is rare.

For courtyard wall/coping work, bring dismantled tower components through the garden-to-court logistics route and erect a suitable tower in the court. Entry onto the roof itself remains a task-specific temporary-work decision; RH-08 does not install permanent anchors merely because a roof exists.

### Reopen trigger

Reconsider a rear/secondary hatch only if later technical design adds a maintenance task whose frequency or geometry makes external access disproportionate—for example substantial rooftop plant that cannot be designed out.

---

## 8. Ground-supported external-maintenance geography

### Zone A1 — east/service side

This is the highest-value permanent maintenance strip.

It must preserve a credible route for:

- plant replacement through the nominal 1000 mm equipment opening;
- utility boundary work;
- MVHR/cooker terminal access;
- east façade/window scaffold/tower work;
- `RWP-SE` / `RWP-NE` maintenance;
- courtyard drain / emergency-overflow external inspection points.

On the current 15.5 m surrogate plot the 12.0 m house leaves about **1.75 m** gross side clearance. Do not consume that residual width with permanent planters, fixed stores or other uniquely difficult obstructions before a real site proves an alternative.

### Zone A2 — west side

Preserve ordinary façade/scaffold access and the two west return downpipes. This side can tolerate more removable landscape than the service side but should not become inaccessible by design.

### Zone A3 — rear/garden working line

Preserve temporary scaffold/tower support positions along enough of the rear elevation for upper-window, masonry, cornice and gutter work. Permanent terraces may occupy this zone only if their structure can take the relevant temporary loads or a different working method is demonstrated.

### Front

Front scaffold/highway dependence is acceptable where ordinary front-façade work genuinely requires it. Avoid making the front the only route to roof/service components.

---

## 9. Courtyard logistics

The **north garden-dining route** becomes the preferred maintenance logistics path into the courtyard.

At technical design, its paired external and courtyard openings should preserve a practical clear route for:

- dismantled mobile-tower components;
- window/frame components;
- gutter/coping materials;
- masonry repair materials;
- protection and waste removal.

RH-08 sets a **1200 mm clear-opening coordination target** for the controlling logistics opening where the selected door family can provide it, with a larger fully-openable pair preferred where compatible with RH-04 composition.

This is a handling target, not a universal doorway rule. Exact door leaves, threshold, fire/security and replacement geometry belong to RH-09/technical design.

The court itself, at **3.6 × 4.0 m**, is large enough to remain a plausible small-tower working area. Actual tower type, outriggers and floor loading remain temporary-works design.

Permanent fountain, fixed raised planter or other central object must not be introduced unless it leaves a credible alternative working position. The early fountain image study has no authority here.

---

## 10. Window and façade maintenance

RH-08 establishes the access geography but does not prematurely create `PAT-007 — Permanent Opening / Replaceable Window` occurrences; frame/subframe release geometry remains RH-09 work.

### Routine cleaning/service

Prefer room-side cleaning/ironmongery service where the final window family permits it. External access remains available for masonry, sealant, full-frame work and conditions that cannot be reached safely from inside.

### Full replacement

Every representative upper window family must retain two credible possibilities until RH-09 closes the detail:

1. internal frame release and handling through the house; or
2. external removal from scaffold/tower.

Do not make replacement depend on a façade projection that leaves no working platform.

### Courtyard façades

Courtyard windows and masonry use the court-tower route. The north logistics opening must remain large enough that replacement components and temporary-access pieces can enter without removing permanent architecture.

---

## 11. Landscape controls created by RH-08

The maintenance brief's A/B/C classification now has project geometry.

### Category A — keep substantially available

- east/service-side equipment/access strip;
- west-side scaffold/tower positions needed for façade and roof-edge work;
- rear working line at representative scaffold/tower bays;
- court north logistics path and at least one viable tower position inside the court;
- external points serving courtyard drain/overflow inspection.

### Category B — removable landscape

- planting/furniture along non-critical parts of the side and rear elevations;
- courtyard planting that can be moved without excavation or permanent demolition;
- seasonal pots / loose furniture.

### Category C — unconstrained by current maintenance route

- garden areas outside the declared temporary-work approaches and handling routes.

Mature tree crowns and roots must be replayed against these zones when a real site exists.

---

## 12. Pattern occurrences created by RH-08

RH-08 now has enough geometry to instantiate four previously selected intents.

### `RH-P009-01` — Accessible Rainwater Route / outer roof

Object: `RW-OUT-01` — four outward-draining roof fields → open outer collection edges → four return downpipes → accessible ground gullies.

### `RH-P009-02` — Accessible Rainwater Route / courtyard

Object: `RW-COURT-01` — accessible courtyard collector/silt trap → straight service-side gravity route plus independent visible emergency overflow.

### `RH-P011-01` — Roof Maintenance Route

Object: `RM-01` — task-specific external scaffold/tower approach to outer roof edges and roof surface; no permanent hatch; courtyard tower route for rare inner-edge work.

### `RH-P013-01` — Ground-Supported Façade Access

Object: `FA-01` — declared external side/rear support geography plus court-tower logistics route, protected from permanent obstruction.

These are Reference House coordination occurrences. They do not increase the evidence or maturity of the general patterns.

RH-08 also creates two new crossing objects for the existing `PAT-005` family:

- `RH-P005-14 / PEN-CD-01` — courtyard primary drain + independent overflow crossing family through the east ground/service-side fabric;
- `RH-P005-15 / PEN-SV-RF-01` — soil/vent roof penetration on the east/service roof field.

Final structural/weather/drainage detailing remains external technical work.

---

## 13. Decisions explicitly rejected / held

### Rejected

- inward-draining courtyard roof as the baseline;
- internal roof outlets;
- routine box gutters hidden inside permanent fabric;
- roof hatch as a symbolic maintainability feature;
- rooftop plant without a demonstrated need;
- speculative permanent fall-arrest hardware before actual tasks require it;
- principal-front downpipes merely because they are hydraulically convenient;
- courtyard drainage whose only failure mode is water entering a room;
- permanent central court object that consumes the only credible tower working area.

### Held for technical / site design

- final roof waterproofing/material family;
- exact fall and gutter profiles;
- hydraulic sizing and design rainfall;
- final rainwater discharge destination;
- external threshold/drainage details;
- temporary support loads and scaffold/tower type;
- permanent anchors or sockets if a later risk assessment earns them;
- future solar array and its replacement/access implications;
- final MVHR intake/exhaust separation;
- final soil-vent terminal height/clearances.

---

## 14. RH-08 gate decision

**PASS at architectural / pre-technical coordination level.**

The selected house now has:

- a roof form generated by water and maintenance rather than silhouette;
- no primary roof drainage into the courtyard;
- visible/inspectable outer rainwater collection;
- an explicit courtyard primary drain and independent failure overflow;
- a sparse terminal strategy;
- a task-derived decision not to install a roof hatch;
- external and courtyard maintenance logistics that can be preserved before landscape hardens;
- new current rainwater, roof-access, façade-access and crossing occurrences.

No RH-04 architectural rewind is required.

The next stage is **RH-09 — Tectonic and occupied-surface integration**. It must turn the maintainable house into convincing rooms: wall attachment plane, skirting/service interfaces, window replacement detail, thresholds, movement joints, floor access where justified and the visible access/indexing language. RH-09 must feed unresolved physical questions to P01/P02/P04 rather than resolving them rhetorically.