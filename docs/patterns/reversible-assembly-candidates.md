# Reversible Assembly — Candidate Patterns

**Status:** development catalogue  
**Purpose:** hold high-value but not-yet-proven physical systems outside the established Core 12 until calculation, detailing, costing and prototype work justify promotion.

These patterns are intentionally demanding. They should be challenged by the architect, structural engineer, services engineer, building physicist, acoustic consultant and relevant fabricators before they are treated as project requirements.

They are also subject to a **workmanship-robustness gate**. Before promotion, each candidate must demonstrate how credible site variability reaches a controlling datum; how adjustment is bounded; when preceding work must instead be remediated; and whether a competent installer unfamiliar with the design can execute the intended sequence from the issued information without undocumented improvisation.

They are additionally subject to a **repose gate** wherever the system enters occupied space. A candidate does not earn promotion merely by being replaceable: it must not create persistent rattle, fragile-feeling surfaces, distracting access geometry, unnecessary technical display or visual complexity that overwhelms the room. Measurable acoustic, thermal and lighting effects should be tested; perceptual judgements should be recorded explicitly as judgements.

---

# Candidate 01 — Seated Floor Structure

**Evidence:** Supported principle / implementation options under engineering review  
**Maturity:** Evidence review complete; calculation and edge prototype pending  
**Principles:** 2 Preserve permanent fabric; 3 Design the interface; 7 Let permanence be architectural

## Problem

A floor structure needs clear gravity support, lateral stability, diaphragm action and—depending on the wall system—restraint of the surrounding structure.

Those requirements are often collapsed into a single “fixed connection”. The result can be structurally sound but unnecessarily rigid, difficult to inspect, difficult to replace and poorly suited to differential movement between timber and masonry.

## Proposition

> **Support by bearing; restrain only where restraint is required.**

Treat the joist-end interface as a set of separate structural functions rather than assuming that every floor member should be rigidly locked to masonry.

A conceptual arrangement may include:

- a durable bearing seat, ledge, shoe or hanger carrying vertical reaction;
- positive anti-roll or anti-unseating restraint;
- blocking, decking or other means of joist stability;
- separately designed diaphragm and wall-restraint connections;
- controlled clearance where longitudinal timber movement or construction tolerance should not be forcibly suppressed;
- inspectable and replaceable vulnerable components where practical.

The exact connection is a structural-engineering decision.

## Conceptual section

```text
ROOM / FLOOR

      structural deck / diaphragm
  ═════════════════════════════════
       │       │       │
       │ joist │ joist │
       │       │       │
       ▼       ▼       ▼
      ┌─────────────────┐
      │ bearing / seat  │  ← gravity support
      └──────┬──────────┘
             │
      deliberate restraint
      only where required
             │
████████████████████████████  permanent masonry / structure

Possible relative movement is defined at the interface;
unseating, roll and required wall movement are not left uncontrolled.
```

## Forces

- gravity bearing must remain adequate under all design actions;
- floor diaphragm action may require positive mechanical connection;
- masonry walls may require lateral restraint from floors;
- timber changes dimension with moisture;
- joist rollover and accidental unseating must be prevented;
- fire and acoustic performance at the floor edge may depend on continuity;
- concealed steelwork can corrode if exposed to moisture;
- a theoretically replaceable joist is of little value if replacement requires dismantling half the room.

## Structural and boundary obligations

The structural engineer must explicitly resolve:

- bearing length and bearing stress;
- horizontal reactions;
- wall restraint;
- diaphragm/shear transfer;
- joist lateral stability;
- progressive-collapse/local-robustness requirements;
- vibration and deflection;
- fire resistance;
- acoustic flanking paths;
- corrosion and moisture exposure;
- construction sequence.

**Bounded movement must never be used as a euphemism for inadequate restraint.**

## Permanent-fabric impact

Prefer a small number of deliberate structural interfaces formed during original construction over repeated ad-hoc cutting or drilling of masonry.

Any embedded plate, seat or fixing should be documented as part of the permanent structural record.

## Architectural resolution

The connection should normally disappear into the floor/wall build-up. Tectonic honesty does not require exposed steelwork in occupied rooms.

Where an edge interface is visible, its line should coincide with a real floor or wall junction rather than being cosmetically filled across expected movement.

## Assembly and replacement sequence

The technical design must draw:

1. how the floor member is installed;
2. what prevents roll and unseating;
3. which components can be released;
4. what must be removed to inspect the seat;
5. whether an individual joist could realistically be replaced;
6. which fire/acoustic boundaries must be reinstated.

## Failure modes

Insufficient bearing; joist end split or crushed; restraint omitted because “movement is allowed”; excessive movement at finishes; hidden corrosion; floor diaphragm weakened by detachable details; acoustic flanking at the wall edge; replacement theoretically possible but physically blocked.

## Does not prove

This pattern does not prove that a seated or partially sliding joist detail is superior to a conventional joist hanger in the reference house.

A conventional engineered hanger may remain the best answer if it already provides the required movement tolerance, structural behaviour and replacement logic.

## Research / prototype requirements

- structural-engineer options appraisal;
- compare masonry hanger, bearing ledge, steel angle/shoe and other appropriate systems;
- calculate all required restraint separately from gravity support;
- full-scale wall/floor-edge mock-up;
- movement and squeak observation;
- fire/acoustic edge-detail review.

## Current evidence direction

The evidence now supports the **decomposition principle** more strongly than a bespoke connection.

A certified restraint-type masonry hanger is the baseline to beat. Direct bearing with separate restraint remains a credible comparator. A custom bearing ledge/shoe stays experimental and should not proceed unless it demonstrates a material advantage in inspection, repair, tolerance or architectural coordination.

Do not create structural sliding freedom merely because the doctrine values movement accommodation. Put movement at the interface where the actual movement occurs.

See: `docs/research/seated-floor-structure-options.md`.

## Reference-house direction

Investigate a **seated-but-captured** engineered timber floor edge, but begin with ordinary certified restraint hardware. The reference-house preference should be selected only after a structural-engineer options study compares the baseline against direct bearing and any custom seat.

---

# Candidate 02 — Architectural Backplane

**Evidence:** Supported direction / project-specific implementation unproven  
**Maturity:** Evidence review complete; wall-bay prototype pending  
**Principles:** 2 Preserve permanent fabric; 3 Design the interface; 6 Ordinary parts; 11 Resolve technology as architecture

## Problem

Permanent walls are normally treated as unlimited fixing surfaces.

Over decades, pictures, televisions, cabinets, radiators, controls, panelling and replacement fit-out generate repeated drilling, plugging, chasing and patching. Even if each intervention is minor, ordinary occupation progressively consumes the permanent wall.

## Proposition

Create a durable **attachment plane** between permanent fabric and faster-changing interior work.

The permanent wall receives relatively few engineered, documented fixings. Those fixings support a repeatable rail, frame, ground or backplane. Replaceable wall linings, joinery and suitable fittings then attach primarily to that interface.

```text
PERMANENT MASONRY
████████████████████
       │   │
       │   │  sparse designed anchors
       ▼   ▼
════════════════════   durable attachment plane
  │      │       │
  ▼      ▼       ▼
lining  joinery  service / fixing carriers
  │
  ▼
ordinary occupation
```

## Forces

- the system must not turn rooms into technical racks;
- general fixing loads and exceptional structural loads are different;
- continuous rails may create acoustic or thermal bridges in some locations;
- hidden services must remain protected from future fixings;
- the backplane itself may become obsolete if it depends on a proprietary clip;
- tolerances between site-built masonry and manufactured panels need adjustment;
- depth consumed by the system must justify itself.

## Design requirements

- establish load classes;
- distinguish ordinary occupation loads from exceptional engineered loads;
- use non-proprietary or remanufacturable geometry where practical;
- define safe fixing zones and no-fix zones;
- coordinate with electrical/service routes;
- permit local adjustment for construction tolerance;
- keep future fasteners on the replaceable side of the permanent interface wherever practical;
- document anchors and allowable loads physically and digitally.

## Boundary obligations

Check fire, acoustic, air/vapour and moisture consequences of any cavity or continuous rail.

The backplane must not become an uncontrolled service void or flanking path.

## Permanent-fabric impact

This pattern exists specifically to reduce permanent-fabric penetrations.

The design should record:

- number and type of permanent anchors;
- load they are intended to carry;
- zones where later drilling is prohibited;
- replacement method for the backplane itself.

## Architectural resolution

The backplane should normally be invisible.

Its visible consequences should appear through ordinary architecture: picture rails, panelling, skirtings, mouldings, joinery or clean wall surfaces. A room should not look industrial merely because its attachment logic is sophisticated.

## Assembly and replacement sequence

1. verify permanent anchors;
2. install/level the backplane;
3. install any service carriers;
4. attach replaceable lining;
5. attach ordinary fittings to defined interface positions;
6. remove lining/fittings without enlarging the original permanent anchors.

## Failure modes

Rail system becomes proprietary and irreplaceable; insufficient load capacity encourages occupants to bypass it; heavy loads are attached without engineering; hidden service conflicts; rattling lining; excessive build-up depth; backplane cavity bypasses acoustic or fire separation.

## Does not prove

The pattern does not justify covering every masonry wall with a technical subframe.

It is strongest on walls expected to carry repeated occupation loads, service distribution, replaceable lining or major joinery.

## Research / prototype requirements

- establish useful domestic load classes;
- compare timber grounds, metal rails, slotted sections and bespoke-but-remanufacturable profiles;
- pull-out/load testing of representative anchors;
- full wall-bay prototype;
- repeated removal/reinstallation test;
- acoustic and impact testing strategy.

## Current evidence direction

Independent lining, mechanical fixing and robust sheet materials are mature. The distinctive project move is a **sparse, non-proprietary, load-classified backplane** that takes relatively few permanent masonry anchors and lets future occupation remain on the room side of them.

The backplane should remain selective rather than universal. It earns its depth on walls with repeated fixing, service access, replaceable lining or major joinery.

See: `docs/research/replaceable-wall-system-options.md`.

## Reference-house direction

Develop the backplane together with the Georgian lining grammar so that technical fixing zones coincide with real skirting, dado, picture-rail or panel divisions where useful.

---

# Candidate 03 — Replaceable Wall Lining

**Evidence:** Supported direction / architectural system unproven  
**Maturity:** Evidence review complete; full wall-bay prototype pending  
**Principles:** 2 Preserve permanent fabric; 3 Design the interface; 6 Ordinary parts; 11 Resolve technology as architecture

## Problem

Conventional internal finishes often use wet plaster, skim, filler, adhesive or bonded board to turn several layers into one apparently continuous surface.

This can be durable where the assembly should genuinely remain together. It performs badly as a philosophy for walls that contain services, need future access, move relative to adjacent assemblies or are expected to change on a shorter cycle than the masonry behind them.

## Proposition

Treat the **room surface as a replaceable architectural lining** rather than automatically as the final wet finish of the permanent wall.

A typical arrangement may be:

```text
PERMANENT WALL / PRIMARY BOUNDARIES
██████████████████████████████████
          │
   attachment / tolerance zone
          │
══════════════════════════════════
 service space where justified
          │
┌────────────────────────────────┐
│ replaceable lining panel       │
│ factory or workshop finished   │
└────────────────────────────────┘
ROOM
```

Possible panel materials include, subject to testing:

- timber;
- gypsum-fibre or other dense mineral board;
- calcium-silicate or other mineral systems where appropriate;
- factory-finished plaster/mineral surfaces;
- stone or stone-faced assemblies;
- specialist wet-room panels.

The pattern is performance-led rather than material-prescriptive.

## Forces

- walls must feel solid under touch and impact;
- fire performance may depend on lining composition;
- acoustic mass and airtightness may depend on continuity;
- panel joints can become visually weak or excessively repetitive;
- large panels become heavy and difficult to handle;
- small panels create too many joints;
- factory finish must tolerate transport and installation;
- corners, reveals, sockets and switches complicate panel removal;
- furniture and joinery loads must not overload decorative panels.

## Design requirements

- define which primary boundaries sit behind the removable lining;
- keep routine panel removal from casually destroying those boundaries;
- provide realistic tolerance and adjustment;
- coordinate outlets, controls and service access;
- protect panel edges;
- design internal/external corners and opening reveals as first-class interfaces;
- make damaged panels locally replaceable where practical;
- retain a reproducible fabrication record.

## Wet-trade rule

A wet or bonded finish may still be preferable where it offers better durability, fire, moisture or visual performance.

The comparison should be explicit.

The project should not replace a simple good plaster wall with a complicated removable system merely because demountability is fashionable.

## Architectural resolution

> **Panelisation does not require a panelised aesthetic.**

The joint strategy is part of the room architecture.

For the reference house, joints may coincide with:

- skirting;
- dado;
- picture rail;
- cornice;
- architrave;
- true panel mouldings;
- deliberately proportioned wall fields.

A plaster-like visual field may also be possible using large panels and restrained joints, but the joint should not depend on brittle filler that defeats removability.

Factory-applied mineral/plaster finishes are explicitly worth investigating: the surface may read as calm plaster while remaining the truthful finish of a removable panel.

## Assembly and replacement sequence

Draw and prototype:

1. backplane/tolerance adjustment;
2. panel location;
3. mechanical capture;
4. edge/joint closure;
5. outlet/interface removal;
6. individual-panel withdrawal;
7. replacement/reinstallation without wet making-good.

## Failure modes

Office-fit-out appearance; hollow/rattling wall; poor impact resistance; excessive joints; panel too heavy to remove; fire/acoustic boundary accidentally assigned to decorative panel; proprietary clips become unavailable; factory finish chips during removal; corners require destructive sealant/filler.

## Does not prove

The pattern does not establish that all rooms should use removable lining.

Some long-lived masonry/plaster walls may be simpler, more durable and more beautiful. The pattern is strongest where access, services, repeated occupation fixing or differential movement justify the additional layer.

## Research / prototype requirements

- material/substrate comparison;
- impact and fixing-load tests;
- fire strategy review;
- acoustic build-up options;
- moisture/hygrothermal review;
- full-scale wall bay including corner, skirting, picture rail, socket and opening reveal;
- repeated panel removal/reinstallation;
- compare site skim with factory-finished mineral surface in appearance and whole-life labour.

## Current evidence direction

The preferred research direction is now a **hybrid wall**:

**permanent masonry / primary boundary → sparse adjustable backplane → optional shallow service/absorption zone → robust manufactured panel**

This keeps structure, acoustic mass and other slow continuous obligations in the masonry/background rather than loading them onto a routinely removable decorative panel.

The system should be deployed selectively. High-quality direct plaster remains the benchmark and may remain the correct answer on low-service walls.

See: `docs/research/replaceable-wall-system-options.md`.

## Reference-house direction

Develop at least one principal-room prototype that does **not** read as a technical panel system. Compare it physically against a first-rate plaster wall and an ordinary independent drylining system.

---

# Candidate 04 — Finish-Agnostic Floor Platform

**Evidence:** Strong external precedent / residential implementation unproven  
**Maturity:** Evidence review complete; walkable multi-finish prototype pending  
**Principles:** 2 Preserve permanent fabric; 3 Design the interface; 6 Ordinary parts; 7 Architectural permanence

## Problem

Floor finish, substrate, acoustic layer, services and primary structure are often fused into one construction sequence.

Changing tile to timber, replacing damaged stone, or reaching services can therefore destroy layers with much longer remaining lives.

Earlier project work described removable timber or stone “floor cassettes”. That formulation couples the access system too closely to the finish.

## Proposition

Standardise the **platform interface**, not the finish.

```text
TIMBER            TILE              STONE
finish            finish            finish
   │                 │                │
carrier A          carrier B         carrier C
   └──────────────┬───────────────────┘
                  ▼
      STANDARD PLATFORM INTERFACE
══════════════════════════════════════
       removable floor platform
──────────────────────────────────────
 acoustic / service / levelling layer
══════════════════════════════════════
        primary structural floor
```

Different finishes may require different carriers, stiffness, mass and movement details.

What should remain common where practical is:

- finished floor datum;
- support geometry;
- module family;
- edge and threshold condition;
- allowable mass/load range;
- locating/capture method;
- lifting/removal method;
- acoustic seating;
- replacement sequence.

## Forces

- tile and stone are sensitive to deflection;
- removable panels can squeak, rattle or rock;
- joints may compromise impact-sound isolation;
- mass varies substantially between finishes;
- underfloor heating complicates removability;
- waterproof floors require special treatment;
- panel size trades off joint count against lifting weight;
- room geometry rarely divides into perfect modules;
- thresholds and perimeter cuts can become bespoke.

## Structural and boundary obligations

The routinely removable platform should normally **not** be the sole element providing critical whole-building diaphragm stability.

The design must also check:

- point and distributed loads;
- panel deflection;
- impact and airborne acoustics;
- fire contribution;
- underfloor service clearances;
- moisture;
- thermal response;
- movement;
- trip/edge safety.

## Permanent-fabric impact

Services and finish renewal should occur above the primary structure wherever practical.

Penetrations through structural members remain deliberately designed rather than becoming a consequence of floor access.

## Architectural resolution

The floor must feel permanent in use.

Removal seams may align with board patterns, stone/tile geometry, room axes, borders or thresholds. Brass/bronze may be used selectively at genuine edge, wear or lifting interfaces in the reference house, but it is not required.

The access grid should not force every finish to look like a raised access floor.

## Assembly and replacement sequence

1. remove any deliberate perimeter/border piece;
2. release or lift the affected platform panel;
3. preserve adjacent acoustic seating;
4. reach the service or replace the finish module;
5. reseat to the same datum;
6. verify no rocking, rattle, acoustic bypass or edge misalignment.

## Failure modes

Floor feels hollow or temporary; joints telegraph through tile; panels rock; resilient layers are bypassed; panel cannot be lifted because furniture/thresholds trap it; interchangeable finishes exceed structural load assumptions; underfloor heating becomes inaccessible; water enters the access layer.

## Does not prove

The pattern does not establish that every room needs accessible flooring.

Where no maintainable services or foreseeable finish change justify the complexity, a conventional durable floor may be preferable.

## Research / prototype requirements

- define support-grid options;
- stiffness and mass modelling for timber/tile/stone variants;
- acoustic consultant input;
- underfloor-heating options appraisal;
- full-scale multi-panel floor bay;
- repeated lifting/reseating;
- rolling/impact load testing;
- tactile and acoustic comparison against a conventional solid floor.

## Current evidence direction

Commercial raised-floor systems already prove removable dense mineral panels carrying stone, ceramic and parquet finishes. The project does not need to prove that such a floor can exist; it needs to prove that it can be **domesticated**.

The preferred research direction is a **low-profile mineral platform on a continuous or semi-continuous support lattice**, with local deeper service zones rather than a tall whole-room plenum. A perimeter/corridor access-band strategy is a serious comparator and may be more proportionate than full-room removability.

Underfloor heating should remain mechanically independent of routinely removable panels unless testing proves otherwise.

See: `docs/research/finish-agnostic-floor-platform-options.md`.

## Reference-house direction

Prototype at least three finish variants on one common platform interface and judge the result first as **flooring**, not as an access system. If a blind walking test reveals “raised floor”, the full-room concept has failed.

---

# Promotion rule

No candidate enters the Core Pattern Catalogue merely because it is conceptually attractive.

Promotion requires, proportionate to risk:

- evidence review;
- architectural detail;
- calculations;
- boundary ledger;
- cost and embodied-impact comparison;
- full-scale mock-up where tactile performance matters;
- maintenance/disassembly test;
- explicit statement of where the conventional alternative remains better.

The objective is not maximum novelty.

It is to discover which reversible assemblies can become **ordinary, beautiful, robust building practice**.