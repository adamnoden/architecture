# HFI-03C — Object Movement

**Packet:** HFI-03C  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `7cab8e5e3b3a9e830ab6c0d49d859af8638d53ad`  
**Prior packet:** HFI-03B — continuous ground plane  
**Question:** what representative object envelopes and route-testing method are strong enough for later HFI audit of sofa, bed/mattress, appliance, pram and mobility-device movement without pretending that one doorway width, one furniture schedule or one oversized object should dictate the whole house?  
**Boundary:** evidence synthesis, research probes and swept-path method only. This packet does **not** set final door/corridor/stair dimensions; pass/fail the Reference House; select a furniture brand/product; require universal furniture accommodation; redesign the house; specify a delivery contract; create doctrine/patterns; or add compiler proof.

---

## 1. Purpose

A large object can fit through every individual doorway on a route and still be impossible to deliver.

Failure can occur because:

- the object cannot rotate between two otherwise adequate straight runs;
- a doorway is wide enough but too close to a perpendicular wall for the required turn;
- a door leaf, handle, radiator or fixed joinery consumes the only useful rotation zone;
- the object reaches a landing but cannot be staged there for the next orientation change;
- a sofa can turn in plan but cannot tilt beneath a ceiling, door head or stair soffit;
- a mattress is assumed to flex without any product-specific basis;
- a bed is assumed to arrive assembled when the normal product is actually modular;
- an appliance can fit geometrically but handlers cannot maintain stable posture or see the route;
- a pram is assumed to be folded every time even though the task being tested is ordinary movement while in use;
- an external/garden route is assumed to exist even though the Reference House has no real site;
- a technically possible manoeuvre depends on removing permanent fabric, destructive disassembly or specialist lifting that the architecture never deliberately provided for.

The controlling proposition is:

> **Object-route adequacy is a continuous configuration-and-handling problem, not a doorway-width problem.**

The companion proportionality rule is:

> **Do not enlarge every circulation space for the largest imaginable object; design a credible route for representative recurring and replacement tasks, then make exceptional objects prove that they deserve permanent geometry.**

---

## 2. Keep four questions separate

### 2.1 Can the destination accommodate the object in use?

This is a room-layout question. Approved Document M Appendix D and current London housing guidance use representative furniture to test whether rooms can be furnished and used.

That is **not** the same as proving delivery.

### 2.2 Can the object pass the complete route?

This is HFI-03C's primary question. It includes translation, rotation, staging, door state, local obstructions and — where levels change — vertical orientation.

### 2.3 Can people safely and credibly handle the object along that route?

A collision-free object path may still be operationally implausible if it requires:

- handlers to twist under load;
- the load to be held away from the body for long periods;
- loss of sight of steps/route;
- unstable pauses on a stair;
- no place to change grip;
- manual lifting where an ordinary trolley or wheeled delivery should be possible;
- specialist strength as the hidden design assumption.

HFI does not become workplace manual-handling regulation, but handling evidence is relevant to whether an architectural route is credible.

### 2.4 Which route should carry the task?

An infrequent sofa or appliance delivery does not automatically deserve the same route treatment as a pram or occupied mobility device used daily.

A consciously designed alternate delivery route can be valid. An accidental workaround is not equivalent.

---

## 3. Controlled Reference House facts — comparison only

HFI-00B remains the controlled pre-HFI baseline. Later DRW work may improve representation but does not grant human-factors authority to dimensions.

| Item | Current project state | HFI-03C treatment |
|---|---|---|
| principal entrance → east gallery → principal ground-floor rooms | represented as the ordinary entrance-level movement system | candidate object route, not yet audited |
| ground east gallery `G-GAL-01` | `1300 mm` gross field | not clear width and not object-route proof |
| upper east gallery `U-GAL-02` | `1300 mm` gross field | same |
| upper south turn | provisional `1300 mm` depth | source fact only |
| upper north turn | approximately `1200 mm` depth | source fact only |
| stair clear-flight target | approximately `1000 mm` | not a mattress/bed-route target or proof |
| stair geometry | three flights of six risers, full landings, no winders | relevant topology; 3D object route not represented |
| final internal door clear openings | unresolved | object route cannot pass/fail |
| final internal door positions/swings | unresolved | object route cannot pass/fail |
| final external doorset geometry | unresolved | object delivery route cannot pass/fail |
| radiator/joinery/local fixed encroachment | unresolved | collision field incomplete |
| garden/courtyard delivery access from public realm | real-site dependent | may not be assumed in generic RH |
| removable/reconfigurable opening strategy for bulky delivery | not established as an HFI route | later architectural question only |

No existing `1300 mm`, `1200 mm` or `1000 mm` number receives incumbency advantage.

---

## 4. Scenario coverage

HFI-01C already freezes the relevant scenarios.

| Scenario | Object-route question |
|---|---|
| `HFI-SC-LOG-06` | representative pram through entrance, turns, doors and staging as a complete route |
| `HFI-SC-LOG-07` | representative sofa with realistic rotation/handling space |
| `HFI-SC-LOG-08` | mattress/bed component upstairs through stair, landings and upper turns |
| `HFI-SC-LOG-09` | replacement washing machine/fridge/dishwasher from delivery point to fixed destination |
| `HFI-SC-LOG-10` | occupied personal mobility device through the complete entrance-level route |

The friction register also preserves:

- `HFI-FR-HC-05/06`: corner choreography and absent swept-path representation;
- `HFI-FR-LO-01`: furniture movement as a real task, not doorway shorthand;
- `HFI-FR-LO-02`–`05`: the four missing house-level route tests;
- `HFI-FR-LO-10`: a consciously designed alternate delivery route may be preferable to universal enlargement.

03C does not create new personas or replace the 01C matrix.

---

# 5. Evidence additions and applicability

Existing `HFI-SRC-N02` remains the parent Approved Document M record. Existing `HFI-SRC-C04` remains the government Part M ergonomic research record for occupied wheeled-mobility manoeuvring. The records below add only what 03C needs.

## `HFI-SRC-O01` — Approved Document M Volume 1, Appendix D furniture schedule

- **Source:** HM Government, *Approved Document M: access to and use of buildings, Volume 1: Dwellings*, Appendix D.
- **Date/version:** 2015 edition incorporating 2016 amendments; current Volume 1 status checked 2026-10-18.
- **Jurisdiction / population:** England dwelling guidance within the document's stated scope.
- **Class:** `STATUTORY-GUIDANCE`.
- **Authority / status:** official guidance supporting Part M; Appendix D supplies furniture/fitting sizes used when demonstrating relevant room provisions.
- **Applicability:** authoritative **plan-layout comparators** for furniture that a dwelling may need to accommodate in use.
- **Useful dimensions for 03C screening:** armchair `850 × 850 mm`; optional two-seat settee `850 × 1300 mm`; three-seat settee `850 × 1850 mm`; principal double bed `2000 × 1500 mm`; other double bed `1900 × 1350 mm`; single bed `1900 × 900 mm`.
- **Critical limit:** Appendix D is a furniture schedule for furnished-plan/access demonstrations. It does **not** define delivery envelopes, product heights, mass, grip, flexibility, disassembly state, handler space or a furniture-removal route.
- **Known limits / nonclaims:** these dimensions are not market percentiles and are not Ovid's House object-route targets. A settee footprint fitting through a plan route does not prove an actual sofa can be delivered.
- **Access state:** official GOV.UK PDF publicly accessible; Appendix D text and page image inspected.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.gov.uk/government/publications/access-to-and-use-of-buildings-approved-document-m

## `HFI-SRC-O02` — London Housing Design Standards LPG

- **Source:** Greater London Authority, *Housing Design Standards London Plan Guidance* / official Housing Design page.
- **Date/version:** adopted 8 June 2023; official page checked 2026-10-18.
- **Jurisdiction / population:** Greater London planning guidance.
- **Class:** `PLANNING-GUIDANCE`.
- **Authority / status:** adopted London Plan Guidance supporting current housing policies.
- **Applicability:** current London expectation that dwelling plans demonstrate credible furnishing/use and flexibility rather than merely satisfy total floor area.
- **Useful finding:** the guidance points designers to the Approved Document M Appendix D furniture schedule for furnished plans and explicitly treats door/window/built-in-furniture positioning and alternative furniture arrangements as part of flexible dwelling planning.
- **Known limits / nonclaims:** it is not an object-delivery standard and gives no general sofa/mattress/appliance swept-path rule.
- **Access state:** official GLA page publicly accessible.
- **Checked:** 2026-10-18.
- **Canonical location:** https://www.london.gov.uk/publications/housing-design

## `HFI-SRC-O03` — Interim London Housing Design Guide furniture/appliance schedule

- **Source:** London Development Agency / Mayor of London, *Interim London Housing Design Guide*.
- **Date/version:** 2010 historical guide; superseded by later London policy/guidance.
- **Jurisdiction / population:** London housing design precedent.
- **Class:** `HISTORICAL-PRECEDENT`.
- **Authority / status:** superseded planning/design framework; retained only as provenance/comparator.
- **Applicability:** historical plan allowances for ordinary domestic appliance positions.
- **Useful comparators:** washing-machine position/worktop `600 × 630 mm`; fridge/freezer space `600 × 600 mm`; hot-water-cylinder space `600 × 600 × 1950 mm`.
- **Known limits / nonclaims:** these are **installation-space/furniture-schedule dimensions**, not guaranteed product transport envelopes and not current London policy. They cannot establish route clearance, appliance packaging dimensions or handling allowance.
- **Access state:** archived/public copies and indexed text inspected.
- **Checked:** 2026-10-18.
- **Canonical archival copy:** https://www.housinglin.org.uk/_assets/Resources/Housing/Regions/London/Interim_London_Housing_Design_Guide.pdf

## `HFI-SRC-O04` — HSE manual-handling route/task guidance

- **Source:** Health and Safety Executive, manual-handling guidance pages including *Construction physical ill health risks: Manual handling*, *Manual handling at work: Reduce the risk of injury* and pushing/pulling risk guidance.
- **Date/version:** current public HSE guidance checked 2026-10-18.
- **Jurisdiction / population:** Great Britain workplace health/safety context; handling tasks rather than domestic design standard.
- **Class:** `EXPERT-GUIDANCE`.
- **Authority / status:** official HSE guidance; **not** a Building Regulations dwelling standard and not directly binding on ordinary household use.
- **Applicability:** mechanism-level test of whether a proposed object route relies on known adverse handling conditions.
- **Useful findings:** HSE identifies bulky/difficult-to-grasp loads, restricted posture, twisting/stooping, long carries, poor visibility, stairs, obstructed/slippery floors and insufficient route width as material handling risks. It recommends reducing carrying distance/twisting, improving space/environment and using mechanical aids where practicable.
- **Known limits / nonclaims:** workplace risk-management context; no domestic corridor/stair dimension follows directly. HFI uses it to reject implausible handling assumptions, not to claim occupational-compliance proof.
- **Access state:** official HTML guidance publicly accessible.
- **Checked:** 2026-10-18.
- **Canonical locations:** https://www.hse.gov.uk/construction/healthrisks/physical-ill-health-risks/manual-handling.htm ; https://www.hse.gov.uk/msd/manual-handling/reduce-risk-injury.htm ; https://www.hse.gov.uk/msd/pushpull/risks.htm

## `HFI-SRC-O05` — Paskiewicz & Fathallah furniture-handling study

- **Source:** Paskiewicz JK, Fathallah FA, *Effectiveness of a manual furniture handling device in reducing low back disorders risk factors*.
- **Date/version:** *International Journal of Industrial Ergonomics* 37(2), 2007, 93–102.
- **Jurisdiction / population:** laboratory study with experienced furniture movers; United States.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Authority / status:** peer-reviewed empirical evidence; non-statutory.
- **Applicability:** confirms that two-person handling of heavy/awkward furniture is a genuine ergonomics problem rather than an abstract geometric exercise.
- **Useful finding:** the study evaluates a two-person furniture-handling aid specifically because furniture moving exposes handlers to low-back-disorder risk factors.
- **Known limits / nonclaims:** small specialist worker sample; handling-device study, not architectural route study; no route dimension or universal handler clearance can be derived.
- **Access state:** publisher abstract/metadata publicly accessible; full text not required for the bounded inference used here.
- **Checked:** 2026-10-18.
- **DOI:** https://doi.org/10.1016/j.ergon.2006.10.015

## `HFI-SRC-O06` — configuration-space motion planning method

- **Source:** Steven M. LaValle, *Planning Algorithms*, configuration-space and configuration-space-obstacle chapters.
- **Date/version:** online technical text, accessed 2026-10-18.
- **Jurisdiction / population:** general computational geometry/robot motion planning; not building guidance.
- **Class:** `EXPERT-GUIDANCE`.
- **Authority / status:** established academic technical reference; non-statutory.
- **Applicability:** mathematical model for asking whether a finite rigid body can translate/rotate through fixed obstacles.
- **Useful finding:** a rigid body's position and orientation can be represented as a point in configuration space; collision states form forbidden regions; route feasibility becomes finding a continuous path through the remaining free configuration space. For a planar rigid body that translates and rotates, the state can be represented by `(x, y, θ)`.
- **Known limits / nonclaims:** furniture is not a robot; human grip, flexible objects, product disassembly, tolerance, weight and 3D stair handling are additional constraints. A mathematically collision-free path is not sufficient evidence of credible manual handling.
- **Access state:** full online text publicly accessible.
- **Checked:** 2026-10-18.
- **Canonical location:** https://msl.cs.uiuc.edu/planning/node156.html

---

# 6. What counts as an object envelope

HFI needs object geometry without pretending to know the future household's purchases.

Three envelope statuses are therefore required.

## 6.1 `EXTERNAL-COMPARATOR`

A dimension taken from an applicable external source for a stated purpose.

It may be used only inside that purpose unless a later inference is justified.

Example: the Approved Document M `1850 × 850 mm` three-seat settee is a strong furnished-plan comparator but an incomplete delivery object because height and construction are absent.

## 6.2 `HFI-STRESS-PROBE`

A deliberately selected project-internal test object used to expose route topology.

A stress probe is **not**:

- a market percentile;
- a claim about typical products;
- a minimum furniture entitlement;
- an Ovid's House design target;
- evidence that the architecture must pass it.

Its purpose is to reveal whether a route is robust or precariously tuned to one small comparator.

Any later proposal to make a stress probe an acceptance target must survive HFI-05B/06D.

## 6.3 `PRODUCT-SPECIFIC`

The actual manufacturer's delivery/assembled/component dimensions, mass and disassembly instructions for a selected product.

This is the correct final-stage input when a real product matters. HFI-03C deliberately does not select one.

The HFI-01B source ontology contains no manufacturer-specification class. Rather than inventing one inside a topic packet, product-specific data remain a later technical/project input and cannot masquerade as general evidence.

---

# 7. Frozen research probes for later testing

These probes freeze **what HFI-07D should test**, not what the house must ultimately pass.

## 7.1 Sofa probes

### `HFI-OBJ-SOFA-ADM`

- status: `EXTERNAL-COMPARATOR`;
- source: `HFI-SRC-O01`;
- plan envelope: `1850 × 850 mm`;
- vertical envelope: **unresolved by source**;
- behaviour: rigid-plan screening body;
- use: test whether the basic route is obviously dependent on dimensions smaller than the Approved Document furniture comparator.

### `HFI-OBJ-SOFA-STRESS`

- status: `HFI-STRESS-PROBE`;
- project-internal box: `2400 × 1000 × 900 mm`;
- behaviour: rigid unless a later product-specific disassembly state is supplied;
- use: topology/robustness stress test only.

The stress box is intentionally round-numbered and non-statistical. Failure does not establish a design defect. Passing it does not prove universal sofa delivery.

## 7.2 Bed / mattress probes

### `HFI-OBJ-BED-ADM`

- status: `EXTERNAL-COMPARATOR`;
- source: `HFI-SRC-O01`;
- principal-bed plan envelope: `2000 × 1500 mm`;
- other-double comparator: `1900 × 1350 mm`;
- single comparator: `1900 × 900 mm`;
- behaviour: room-layout comparator only.

A normal bed may arrive as disassembled rails/base components plus a mattress. HFI therefore must not model the entire `2000 × 1500 mm` bed footprint as one rigid three-dimensional delivery body unless a real product warrants it.

### `HFI-OBJ-MATTRESS-RIGID-SCREEN`

- status: `HFI-STRESS-PROBE`;
- plan face: `2000 × 1500 mm`;
- thickness: unresolved until a product-specific test;
- behaviour: rigid slab for **conservative screening only**.

If a route fails only because this probe refuses to bend, the result is `flexibility-dependent`, not a design defect. Credit for folding/rolling/flexing requires a later product or product-family basis.

## 7.3 Appliance probes

Historical London schedules confirm the persistence of roughly 600 mm kitchen modules but do not supply transport dimensions. 03C therefore uses internal stress probes rather than falsely relabelling installation spaces as delivery envelopes.

### `HFI-OBJ-APPLIANCE-UNDERCOUNTER`

- status: `HFI-STRESS-PROBE`;
- box: `650 × 650 × 900 mm`;
- intended family: washing machine / dishwasher / similar undercounter appliance;
- behaviour: rigid, heavy, preferably trolley-compatible.

### `HFI-OBJ-APPLIANCE-TALL`

- status: `HFI-STRESS-PROBE`;
- box: `700 × 700 × 2050 mm`;
- intended family: tall fridge/freezer or similarly tall domestic appliance;
- behaviour: rigid; route must not silently depend on extreme tilting or manual overhead control.

These are robustness probes, not claims about standard appliance dimensions.

## 7.4 Pram probe

### `HFI-OBJ-PRAM-UNFOLDED`

- status: `HFI-STRESS-PROBE`;
- plan envelope: `750 × 1100 mm`;
- height: not material to ordinary horizontal route screening unless an overhead obstruction exists;
- behaviour: wheeled, steerable; no routine folding credit during the route.

The probe asks whether a plausible large wheeled child-carrying object can move through the ordinary entrance-level system. It is deliberately not labelled a market percentile.

Folding may be relevant at storage, transport or an exceptional pinch point, but HFI does not treat “fold the pram every time” as equivalent to a naturally usable daily route.

## 7.5 Occupied mobility device

Do **not** turn the wheelchair/mobility-device scenario into an unoccupied furniture test.

`HFI-SC-LOG-10` reuses the occupied-user/device manoeuvring evidence already registered in HFI-03A (`HFI-SRC-C04` etc.). Its route is assessed as human mobility, including turns and operation, not merely a polygon pushed through the house.

---

# 8. Route hierarchy

Object frequency and consequence matter.

## 8.1 `DAILY-OBJECT-ROUTE`

Examples:

- occupied mobility device;
- unfolded pram/buggy where routinely used;
- regular mobility aid.

Candidate expectation:

> the ordinary principal circulation system should carry the task without routine disassembly, destructive alteration or conspicuously second-class routing.

This is not yet a final principle, but it is the correct research default because the task is repeated.

## 8.2 `OCCASIONAL-DOMESTIC-DELIVERY-ROUTE`

Examples:

- sofa;
- mattress/bed components;
- washing machine/dishwasher;
- tall refrigerator.

A different route can be entirely legitimate if it is **consciously designed** and realistically available when needed.

Possible mechanisms include:

- principal entrance route;
- another full-height external door;
- a garden/service route that genuinely connects to the delivery point on the real site;
- a deliberately removable door leaf/architrave assembly;
- normal manufacturer-intended furniture disassembly.

The alternative route does not need ceremonial parity with the principal entrance because the user is an object-delivery task, not a person whose dignity depends on the route. It still has to be safe, practical and maintainable.

## 8.3 `SPECIALIST-EXCEPTION`

Examples might include:

- unusually large one-piece furniture;
- pianos or other high-mass specialist objects;
- items requiring cranes/hoists through windows or temporary scaffold;
- bespoke objects outside the selected probe family.

The permanent house should not automatically be enlarged to accommodate every specialist exception.

A project may still deliberately design for one where the programme/client brief warrants it.

---

# 9. Swept-path method

## 9.1 The minimum model is a path, not a sequence of apertures

For each object-route scenario define:

1. **start state** — actual delivery/removal handoff point or occupied-object start;
2. **goal state** — final room/use/storage destination;
3. **route geometry** — walls, permanent openings, stair/landing geometry and relevant fixed obstructions;
4. **object state** — envelope, orientation, rigidity/flexibility, wheels/castors and allowed disassembly;
5. **door state** — closed/open leaf geometry and whether normal temporary leaf removal is explicitly designed;
6. **staging states** — places where the object can pause, rotate or change handler grip;
7. **handling assumptions** — number of handlers, wheeled aid/trolley, visibility and gross posture constraints;
8. **reverse path** — removal/replacement must not be harder merely because construction sequencing once allowed installation.

## 9.2 Planar rigid-body screening

For a rigid 2D object envelope, represent configuration as:

`q = (x, y, θ)`

where `x/y` locate a reference point and `θ` is yaw/plan rotation.

A route screen succeeds geometrically only if there is a **continuous collision-free path** from start to goal through that configuration space.

This is stronger than checking:

- object width < each doorway;
- object length < corridor length;
- diagonal < some local opening.

It naturally captures the familiar “long object will not turn the corner” problem.

## 9.3 Collision geometry

The obstacle field should include, when known:

- permanent walls/returns;
- door frames and jambs;
- door leaves in the route's intended operating state;
- stair strings/newels/guarding where they project into movement space;
- fixed joinery/cabinetry;
- radiators or persistent emitters;
- columns/structure;
- fixed sanitary/kitchen equipment where the route passes it.

Loose chairs/tables and ordinary movable possessions do not belong in the base collision field. Their movability is precisely why architecture should not be overfitted to one furniture arrangement.

## 9.4 Mathematical contact is not a practical pass

A solver that finds a zero-clearance path has discovered a geometric limit, not a credible delivery route.

Later target work must decide what handling/tolerance allowance is justified. HFI-03C deliberately does **not** invent a universal clearance halo in millimetres.

Until then, route results must distinguish:

- robust free path;
- contact-sensitive / tolerance-dependent path;
- no collision-free path at the screened state.

These are method descriptions, not HFI-07 Reference House verdicts.

## 9.5 Handler feasibility is a second layer

The rigid object path is necessary but not sufficient for manually handled objects.

At every material turn, stair, threshold and staging point ask:

- can one/two handlers occupy plausible positions without intersecting permanent geometry?
- can they see enough of the route/steps to control the load?
- does the manoeuvre require sustained twisting, reaching or load held far from the body?
- is there a stable place to pause/regrip?
- can a trolley/dolly remain under the appliance for meaningful portions of the route?
- does a two-person manoeuvre require one handler to step backwards down stairs without adequate visibility/control?

03C does not quantify safe lifting force or certify a moving method. It rejects architecture whose only geometric solution visibly depends on implausible handling.

---

# 10. Stairs require a 3D check

A plan-only sofa/mattress route can generate false confidence on stairs.

The object may need to change:

- yaw;
- pitch;
- roll;
- vertical position;

while clearing:

- stair nosings/flight line;
- landing walls;
- ceiling/soffit;
- door heads;
- upper/lower floor edges;
- handrails/newels/guards;
- light fittings or other persistent projections where relevant.

The complete state is conceptually:

`q = (x, y, z, yaw, pitch, roll)`

HFI does **not** require a general six-degree-of-freedom solver now.

For HFI-07D the minimum credible method is:

1. plan swept-path screen through stair/landings;
2. longitudinal/transverse section envelope check at critical turns;
3. explicit statement of any tilt/flex/disassembly assumption;
4. handler/staging review;
5. `NOT-MODELLED` where the current source lacks enough stair/door/guard geometry.

A later compiler feature may earn admission for the planar part. The existence of a neat algorithm does not silently widen M4 proof scope.

---

# 11. Object mutability rules

## 11.1 Rigid by default

Unless the object family is defined otherwise, the screen assumes a rigid envelope.

This prevents optimistic “it probably bends” reasoning.

## 11.2 Flexibility requires evidence

Mattresses and upholstered furniture may deform, but the amount and safe manner vary materially by construction.

Therefore:

- no generic flex radius is invented;
- a failed rigid screen may be labelled flexibility-dependent;
- product-specific instructions can later earn flex/roll/fold credit.

## 11.3 Manufacturer-intended disassembly may count

A bed frame, modular sofa or removable appliance door may legitimately be transported in components when that is the normal intended delivery/removal method.

Acceptable later credit requires:

- non-destructive disassembly;
- ordinary tools/process;
- reassembly without specialist fabrication;
- route proof for the largest/heaviest relevant component;
- no damage to permanent building fabric.

## 11.4 Destructive building alteration does not count

Removing plasterboard, cutting structure, breaking masonry or dismantling permanent fabric is a route failure for ordinary domestic replacement unless the architecture explicitly makes that layer removable by design.

This aligns with the wider House Kernel separation of permanent fabric from replaceable assemblies.

---

# 12. Door/opening rules

A door leaf is not automatically an immutable obstacle and not automatically irrelevant.

Later route tests must state which of these applies:

1. **normal open state** — leaf remains attached and must fit the manoeuvre;
2. **designed removable leaf** — temporary removal is an intentional, bounded maintenance/delivery operation;
3. **replaceable doorset removal** — only valid if the architecture actually makes this a low-damage planned operation;
4. **permanent opening** — no leaf collision;
5. **destructive widening** — does not count.

The project must not grant itself removal credit simply because a tradesperson could theoretically take something apart.

---

# 13. External and garden delivery routes

A generic Reference House cannot assume:

- side access exists;
- rear garden can be reached from the street;
- a delivery vehicle can approach the relevant opening;
- an external level route exists;
- courtyard openings are externally accessible;
- a crane/hoist can be positioned;
- boundary walls/fences can be opened.

Accordingly:

> **Any alternate route that depends on the real plot remains conditional until the real site proves it.**

The Reference House may nevertheless preserve architectural **optionality** — for example, an opening whose size/assembly could support occasional delivery — without claiming a complete site route.

---

# 14. Probe-to-scenario test matrix

| Scenario | Primary probe | Route mode | Critical extra checks |
|---|---|---|---|
| `LOG-06` pram | `HFI-OBJ-PRAM-UNFOLDED` | `DAILY-OBJECT-ROUTE` | door operation, 90° turns, threshold, staging/storage; no routine folding credit |
| `LOG-07` sofa | `HFI-OBJ-SOFA-ADM` + `HFI-OBJ-SOFA-STRESS` | `OCCASIONAL-DOMESTIC-DELIVERY-ROUTE` | rotation at entrance/corners; handler positions; alternate route if deliberately provided |
| `LOG-08` mattress/bed | `HFI-OBJ-BED-ADM` + `HFI-OBJ-MATTRESS-RIGID-SCREEN` | `OCCASIONAL-DOMESTIC-DELIVERY-ROUTE` | stair plan + section; landing staging; flex/disassembly assumptions explicit |
| `LOG-09` appliance | `HFI-OBJ-APPLIANCE-UNDERCOUNTER` + `HFI-OBJ-APPLIANCE-TALL` | `OCCASIONAL-DOMESTIC-DELIVERY-ROUTE` | trolley compatibility, thresholds, fixed kitchen/utility approach, reverse replacement path |
| `LOG-10` mobility device | HFI-03A occupied device/user evidence | human-mobility principal route | complete route, turns, doors, destination use; never reduce to unoccupied-object fit |

No row is a Reference House finding yet.

---

# 15. Candidate outputs for HFI-07D

When the Reference House is eventually audited, each route should preserve enough information to answer:

### Route identity

- delivery/start point;
- destination;
- primary or alternate route;
- site-independent or real-site-dependent.

### Geometry identity

- object/probe envelope;
- allowed orientations;
- doorway clear openings;
- corner/landing dimensions;
- door-leaf state;
- known fixed obstructions;
- vertical/section limits where relevant.

### Operational identity

- rigid/flexible/disassemblable;
- handler count assumption;
- wheeled aid/trolley assumption;
- staging/regrip points;
- whether folding/removal/disassembly is routine or exceptional.

### Evidence identity

- external comparator vs HFI stress probe vs product-specific input;
- source/limits;
- any unsupported assumption that prevents judgement.

This makes a later `PASS / IMPROVE / CONFLICT / UNRESOLVED / NOT-MODELLED` finding auditable rather than impressionistic.

---

# 16. Rejected shortcuts

## 16.1 “If it fits through the narrowest doorway, it fits through the house” — reject

Corners, staging and orientation changes can dominate.

## 16.2 “Use the Appendix D sofa as the delivery standard” — reject

Appendix D is a furnished-plan schedule; height, handling and construction are absent.

## 16.3 “Design for the biggest sofa/fridge anyone could buy” — reject

Unbounded product variation cannot be allowed to inflate permanent geometry without proportional benefit.

## 16.4 “Everything can be flat-packed” — reject

Some furniture is modular; some is not. Credit must be tied to the object state actually being tested.

## 16.5 “Mattresses bend, so the stair is fine” — reject as a generic claim

Flexibility is product/construction specific.

## 16.6 “A pram can be folded” — reject as the ordinary-route answer

A regularly used wheeled object should be tested unfolded for its routine route. Folding may be a storage or exceptional manoeuvre.

## 16.7 “Just widen every corridor and landing” — reject

The programme's proportionality method requires local geometry or a dedicated occasional route to be considered before permanent area inflation.

## 16.8 “A side/rear route will solve it” — reject until site-proved

The generic Reference House has no side boundary/access geometry.

## 16.9 “Remove the door when necessary” — conditional only

It counts only when removal is intentionally designed and non-destructive, not because a skilled fitter might improvise it.

## 16.10 “A collision-free computer path proves usability” — reject

Tolerance and human handling remain outside pure configuration-space collision detection.

## 16.11 “A mobility device is just another object” — reject

Occupied mobility is a person-use question with dignity, operation and manoeuvring consequences.

## 16.12 “If it was installed during construction, it can be replaced later” — reject

Construction sequencing can bypass completed-building constraints. HFI tests the **completed-house replacement route**.

---

# 17. Proportionality and cross-discipline handoff

HFI-05B must later compare object-route interventions against:

- route frequency;
- probability that the object family actually matters;
- consequence of failure;
- cost/area of universal enlargement;
- availability of a bounded alternate route;
- value of removable/replaceable openings;
- real-site feasibility;
- architectural effect;
- construction/workmanship burden;
- future retrofit difficulty.

HFI-05C must reconcile object-route candidates with:

| Concern | Potential conflict |
|---|---|
| structure | larger openings, nib removal, stair/landing geometry |
| fire/escape | door/leaf/closer changes; route assumptions must not undermine fire strategy |
| security | large or removable external openings |
| moisture/weathering | external delivery opening/threshold details |
| thermal/airtightness | larger/removable external assemblies |
| services | radiators, controls or service zones intruding into turns/staging |
| maintenance | removable doorsets/openings and appliance replacement geography |
| workmanship | tolerance-sensitive routes and complex removable assemblies |
| architectural grammar | opening/door proportions and circulation hierarchy |
| real site | side/rear access, boundary, gradients, delivery vehicle position |

No discipline loses its existing ownership because HFI identifies a route conflict.

---

# 18. Computational admission boundary

A deterministic 2D rigid-body swept-path checker is a plausible future compiler capability because:

- plan boundaries are already represented;
- object probes can be represented as polygons/rectangles;
- configuration-space collision/path search is algorithmically well-established;
- complete-route failure can be machine-detectable once door/obstruction geometry exists.

But HFI-03C authorises **no implementation**.

Before any compiler admission, the project would still need to decide:

- object schema and provenance;
- door-state representation;
- fixed-obstruction authority;
- tolerance/clearance policy;
- whether path existence or a specified route is tested;
- computational resolution/determinism;
- how false negatives/positives from discretised rotation are handled;
- how 3D stair movement is bounded;
- what remains professional judgement.

Any such feature must enter through the existing computational admission/governance route. It must not become RH-C6 by stealth or widen M4 proof scope.

---

# 19. What HFI-03C establishes

Evidence is strong enough to establish the following research propositions for later synthesis:

1. **Whole-route feasibility matters.** Aperture-by-aperture checks are insufficient for large/awkward objects.
2. **Translation and rotation must be coupled.** For a planar rigid object, `(x, y, θ)` is the minimum useful geometric state.
3. **Room-layout furniture schedules do not prove delivery.** Appendix D is valuable, but for a different question.
4. **Handler feasibility matters separately from collision geometry.** HSE evidence makes restricted posture, stairs, poor visibility, bulky loads and twisting legitimate architectural warning signals.
5. **Stairs require 3D reasoning.** Plan sweep alone cannot establish mattress/sofa delivery upstairs.
6. **Object mutability must be explicit.** Flexing, folding and disassembly cannot be granted implicitly.
7. **Replacement is part of the route.** Completed-building removal/replacement matters, not only construction-stage installation.
8. **Frequency should govern route hierarchy.** Daily pram/mobility movement and occasional sofa/appliance delivery need not receive identical spatial treatment.
9. **A deliberate alternate delivery route is legitimate in principle.** It may be more proportionate than universal circulation enlargement.
10. **Real-site dependencies remain real-site dependencies.** Side/rear/garden access cannot be invented by the generic Reference House.
11. **Stress probes are not targets.** They expose topology and brittleness; HFI-05/06 decide whether any numeric object allowance deserves design authority.
12. **Pure computational path existence is not a human-factors pass.** Handling, tolerance and product state remain explicit.

---

# 20. What remains unresolved

HFI-03C does **not** determine:

- the preferred final sofa/appliance/pram probe for an Ovid's House acceptance target;
- a market percentile for any object;
- a universal handler-clearance margin;
- safe domestic lifting limits;
- exact 3D mattress flexibility;
- final door/opening dimensions;
- whether the current RH principal route passes any object probe;
- whether a dedicated alternate delivery route is architecturally warranted;
- whether a real plot will provide side/rear access;
- whether a 2D or 3D swept-path solver belongs in the compiler;
- any product-specific replacement procedure.

Those questions belong to HFI-05/06/07, real-site design, product selection and/or later computational admission as appropriate.

---

# 21. Packet closeout

**Packet:** HFI-03C — object movement  
**Baseline `main`:** `7cab8e5e3b3a9e830ab6c0d49d859af8638d53ad`  
**Exact question answered:** what representative object envelopes and swept-path method can later HFI use without confusing furnished-plan dimensions, market products, human mobility or exceptional removals logistics?  
**Evidence/sources:** Approved Document M Appendix D; current London Housing Design Standards guidance; historical London appliance-space schedule; HSE manual-handling route/task guidance; bounded furniture-handling empirical evidence; configuration-space motion-planning method; existing HFI-03A occupied mobility-device evidence.  
**Findings:** freeze three envelope statuses (`EXTERNAL-COMPARATOR / HFI-STRESS-PROBE / PRODUCT-SPECIFIC`); freeze sofa/bed/appliance/pram research probes; use continuous `(x,y,θ)` rigid-body screening plus separate handler feasibility; require plan+section/3D reasoning for stairs; distinguish daily principal-route objects from occasional delivery objects; allow deliberate alternate delivery routes in principle; forbid implicit flexibility/disassembly/site assumptions.  
**Rejected hypotheses:** narrowest-door proof; Appendix-D-as-delivery-standard; biggest-object universal design; flat-pack assumption; generic mattress-flex assumption; fold-the-pram default; universal corridor widening; invented rear route; casual door removal; solver-path-equals-usability; unoccupied-wheelchair object model; construction-stage-installation-equals-replacement.  
**Artefacts/changes:** this research record only.  
**Checks required before merge:** source/class audit; probe nonclaim audit; cross-packet consistency with HFI-01B/01C/01D, HFI-03A/03B and HFI-00C; full repository PR validation; concurrency lease against current `main`.  
**Authority/maturity consequences:** none. No HFI target, RH finding, architecture change, doctrine/pattern, compiler proof or maturity increase.  
**Stale downstream items:** none created by research alone.  
**Exact next packet:** **HFI-03D — domestic task routes**.
