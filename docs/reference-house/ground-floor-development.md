# Reference House — RH-02 Ground-Floor Development

**Status:** RH-02 design gate record  
**Date:** 2026-10-12  
**Question:** can the selected courtyard morphology produce a convincing ground floor without technical logic overwhelming domestic architecture?  
**Brief authority:** [Brief and Constraint Ledger](brief-and-constraint-ledger.md)  
**RH-01 authority:** [Gross Morphology Options](morphology-options.md)  
**Drawing:** [ground-floor-development.svg](ground-floor-development.svg)

RH-02 tests domestic order at room and furniture scale. It does not fix stair geometry, upper-floor stacking, structural member sizes, services, wall construction or final openings.

The stage exposed one material upstream problem and resolves it explicitly rather than hiding it in furniture diagrams.

---

## 1. RH-01 rewind: side-wing width

RH-01 selected an **11.4 × 10.8 m** outer mass around a **3.6 × 4.0 m** courtyard, giving **3.9 m gross side wings**.

At gross morphology scale that looked viable. At room scale it is too lean once the side wing is recognised as lying between two substantial weather-separating walls: the external wall and the courtyard wall.

For RH-02 planning only, use these conservative allowances:

- external / courtyard wall: **350 mm**;
- ordinary internal partition: **125 mm**.

These are not technical selections. They are planning allowances to stop gross dimensions masquerading as usable room dimensions.

A 3.9 m gross side wing then gives only about **3.2 m clear** between outer and courtyard faces before local linings, tolerances or architectural depth. That is possible, but too mean for the Reference House's principal rooms and makes normal furniture fit depend on optimistic wall assumptions.

### Controlled correction

Increase overall width by **600 mm**, symmetrically:

- RH-01 width: **11.4 m**;
- RH-02 controlled width: **12.0 m**;
- depth remains **10.8 m**;
- courtyard remains **3.6 × 4.0 m** and centred;
- side wings become **4.2 m gross**;
- front/rear wings remain **3.4 m gross**.

The revised gross enclosed plate proxy is:

- **115.2 m² / storey**;
- **230.4 m²** across two principal storeys.

That remains about **11.9% smaller** than the F0 two-storey proxy of 261.4 m². On the same 15.5 m-wide surrogate plot it leaves approximately **1.75 m side clearance per side** before any projections.

This is an RH-02 rewind of one RH-01 dimension, not a return to F0. The courtyard, depth and compact-morphology decision remain intact.

---

## 2. Ground-floor tests

Three arrangements were tested inside the corrected shell.

### G0 — Full room ring, no dedicated internal route

Rooms occupy almost the whole ring. The entrance hall addresses the courtyard directly; drawing, family, dining, kitchen and study form a sequence around it.

**Strengths**

- maximum room area;
- strongest literal room-to-room sequence;
- no area spent on corridor;
- simple gross geometry.

**Failure**

A year-round route from front door to kitchen/rear garden either:

- crosses the open courtyard;
- passes through the study;
- or passes through several principal rooms.

Through-room sequence can be architecturally legitimate, but making it the only ordinary route to the kitchen is poor contemporary domestic planning. The courtyard should enrich movement, not become a weather tax.

**Decision:** reject.

---

### G1 — One-sided service gallery + linked rear rooms

This scheme keeps the balanced courtyard morphology but makes **one inner flank work harder**.

A narrow internal gallery runs along one side of the courtyard from the entrance hall toward the rear. The outer side of that flank contains the small study and the service hub. At the rear the gallery arrives directly into the kitchen / garden-side family sequence.

The opposite flank remains primarily domestic: principal drawing room toward the front and family room toward the rear.

The rear is a linked three-room sequence:

**family room → garden dining hall → kitchen**

with wide but controlled connections rather than one undifferentiated open-plan volume.

**Strengths**

- all-weather front-to-rear circulation without a full courtyard gallery;
- technical access concentrated on one flank without dictating the external mass;
- drawing and family rooms keep the full corrected side-wing depth;
- kitchen reaches the rear garden directly;
- service hub has direct side replacement access;
- the entrance still looks through the courtyard to the garden-side room and garden beyond;
- front composition can remain balanced while internal subdivision is deliberately asymmetric;
- rear rooms can be acoustically and visually separated when desired;
- the gallery gives future dry-side access opportunities without turning the whole house into a technical corridor.

**Risks**

- study is deliberately compact;
- the rear central garden/dining room is not large enough to act as a grand formal dining room in isolation;
- the gallery width must survive real wall/door/joinery coordination;
- the service block must later prove plant, utility and WC fit rather than merely being labelled "service".

**Decision:** select.

---

### G2 — Rear great room

The north/rear wing and both rear corners become one large kitchen / family / dining territory. Drawing room and study remain toward the front; service space sits on one side.

**Strengths**

- easiest contemporary family circulation;
- generous kitchen/family relationship;
- strongest direct garden occupation;
- furniture placement is forgiving.

**Failure**

It solves room fit by dissolving too much of the architecture:

- the courtyard becomes an opening inside a very large continuous living field rather than a sequence-maker;
- multiple large openings around the rear corners increase structural transfer pressure before RH-05;
- acoustic retreat between cooking, dining and family use weakens;
- the room hierarchy becomes flatter;
- the Reference House begins to resemble a conventional "formal front / open-plan rear" extension model rather than testing whether contemporary occupation can coexist with a stronger room grammar.

Open connections remain available inside G1 where useful; a single great room is unnecessary.

**Decision:** reject.

---

## 3. Selected ground-floor baseline — G1

### Coordinate system

For coordination only:

- origin = south-west outer corner;
- +X = east;
- +Y = north;
- outer rectangle = **12,000 × 10,800 mm**;
- courtyard = X **4,200–7,800 mm**, Y **3,400–7,400 mm**;
- front/street surrogate = south;
- rear/garden surrogate = north.

The handedness is **not a compass commitment**. The service/gallery flank is drawn east for continuity with prior diagrams. The plan may be mirrored when a real site gives west/east different value.

### Zones

| ID | Zone | Coordination reservation | Role |
|---|---|---:|---|
| `G-DRAW-02` | west/front | X 0–4.2 m; Y 0–5.0 m | principal drawing / sitting room |
| `G-FAM-02` | west/rear | X 0–4.2 m; Y 5.0–10.8 m | informal family room with garden relationship |
| `G-HALL-02` | south/centre | X 4.2–7.8 m; Y 0–3.4 m | principal entrance hall and courtyard address |
| `G-STUDY-02` | south-east outer strip | X 9.1–12.0 m; Y 0–3.4 m | compact study / work room |
| `G-GAL-01` | east inner flank | X 7.8–9.1 m; Y 0–7.4 m | all-weather internal gallery / service-access route |
| `G-SVC-02` | east-middle outer strip | X 9.1–12.0 m; Y 3.4–7.4 m | service-hub reservation: utility / WC / plant / storage mix to be resolved |
| `G-GARDEN-02` | north/centre | X 4.2–7.8 m; Y 7.4–10.8 m | garden dining hall / breakfast-dining room |
| `G-KIT-02` | north-east | X 7.8–12.0 m; Y 7.4–10.8 m | kitchen with direct garden relationship |
| `C-01` | centre | X 4.2–7.8 m; Y 3.4–7.4 m | open courtyard |

`G-DRAW-02` and `G-FAM-02` deliberately split the west wing at Y ≈ 5.0 m rather than at the courtyard corner. This prevents both rooms becoming small 4.2 × 3.4 m corner cells merely to obey the courtyard grid.

The split dimension remains adjustable during detailed room planning by a few hundred millimetres. The *order* is controlled; millimetric partition position is not.

---

## 4. Furniture-scale adequacy

These checks use the temporary 350 / 125 mm planning allowances above. They are not measured net-area claims.

### Drawing room

Approximate controlling clear field: **3.5 × 4.5 m** where the room runs beside the courtyard.

This is sufficient to test:

- 2.1–2.3 m sofa;
- two loose chairs;
- central table;
- fireplace / console / bookcase field;
- an ordinary route around rather than through the furniture group.

The room is compact for a principal drawing room but no longer mean. If RH-04's G-01 work requires materially more width, that must be argued as an architectural requirement rather than hidden inside wall assumptions.

### Family room

Approximate clear field: **3.5 × 5.3 m**.

This supports a substantial everyday sitting room, books/storage and flexible child/family use without asking it simultaneously to be the kitchen.

### Entrance hall

Approximate clear field: **3.3 × 2.7 m** before door/joinery refinement.

The hall is a real room/threshold rather than a corridor. It can support a bench/console and preserve the direct view to the courtyard.

### Study

Approximate clear field: **2.3–2.4 × 2.9 m**, depending on final gallery wall.

This is intentionally a **small proper study**, not a guest bedroom disguised as an office. It can support a 1.4–1.8 m desk, shelving and a reading chair. If a ground-floor guest bedroom becomes a real owner requirement, the current plan must be reconsidered rather than forcing a bed into this room.

### Garden dining hall

Approximate clear field: **3.3 × 2.7 m**.

This supports an ordinary six-seat table at compact clearances. It is deliberately connected to the larger family room and kitchen so an extended table or larger gathering can borrow adjacent space through the openings.

It should not be sold as a self-contained twelve-person formal dining room.

### Kitchen

Approximate clear field: **3.7 × 2.9 m** before final cabinetry.

This is enough for a high-quality L / parallel / peninsula study, with direct relation to `G-GARDEN-02` and the garden. RH-06 should bias the wet/high-maintenance parts toward the service side rather than distributing them around the room.

### Service block

The outer service strip gives approximately **2.3–2.4 m clear width × 3.7 m clear length** before its own partitions.

That is enough to justify carrying a real service-hub hypothesis into later design, but not enough to claim the plant/utility/WC arrangement is solved. RH-06 must prove equipment, working volume, drainage, heat rejection and replacement paths.

---

## 5. Circulation and sequence

The plan now has two deliberately different movement systems.

### Principal architectural sequence

**front door → entrance hall → courtyard view / threshold → garden dining hall → garden**

The courtyard remains the architectural centre of the arrival sequence.

The direct line is primarily visual and ceremonial. The house does not require occupants to cross an outdoor court every time they move front-to-rear.

### Ordinary all-weather route

**entrance hall → east inner gallery → kitchen / garden dining hall → family room / garden**

The gallery is subordinate in width and expression. It is not the principal architectural event.

This separation is consistent with G-01's current evidence: principal and secondary movement can be distinct without reproducing historical servant circulation.

### Room sequence

The rear domestic sequence remains spatially legible:

**family → garden dining → kitchen**

Connections may later range from ordinary doors to generous cased openings. They should not become one continuous structural opening by default.

---

## 6. Courtyard role

G1 gives the court four different relationships rather than surrounding it with an equal gallery:

- **south:** addressed by the entrance hall;
- **west:** principal occupied rooms look into it;
- **east:** the internal gallery uses it for orientation and daylight;
- **north:** the garden dining hall mediates court-to-garden.

This asymmetry is intentional.

The courtyard is not leftover lightwell and not a circulation tax. It becomes a visual centre with different architectural ranks on each side.

---

## 7. G-01 implications

RH-02 does **not** claim the ground floor is already a validated Georgian plan.

It does establish useful conditions for RH-04:

- explicit hierarchy exists;
- entrance/courtyard/garden sequence is named;
- a secondary route is distinguishable from the principal sequence;
- the external mass may remain broadly balanced while internal subdivision is asymmetric;
- rooms retain distinct identities rather than collapsing into one open field;
- proportion remains role-specific rather than forced to one ratio.

One particularly useful condition is the front field:

**4.2 m west wing / 3.6 m centre / 4.2 m east wing**

The two side fields are equal at gross-massing scale even though the east field contains study + gallery internally. RH-04 can therefore test plan/elevation coupling instead of assuming the exterior must expose every internal partition.

---

## 8. Service / pattern implications

RH-02 is allowed to establish room-scale pattern occurrences where geometry is now real, but not to pretend service topology is resolved.

Two occurrences are sufficiently identifiable to re-enter the current register:

1. a new **Plant Room as Service Hub** occurrence at `G-SVC-02`, because a dedicated maintainable service block with direct side replacement potential now exists geometrically;
2. a new **High-Service-Room Service Wall** occurrence where `G-KIT-02` meets the service/gallery geography, because the kitchen has a defined high-service edge rather than an abstract intention.

Utility entry, riser, horizontal route, crossings and physical service index remain uninstantiated until later stages provide enough geometry.

---

## 9. What remains deliberately unresolved

RH-02 does **not** fix:

- exact stair position/form;
- exact study door/window placement;
- whether the gallery is 1.10, 1.15 or 1.20 m clear;
- internal subdivision of `G-SVC-02`;
- exact kitchen cabinetry / island;
- exact cased-opening widths between family/dining/kitchen;
- fireplace locations;
- wall construction;
- structural support / transfers;
- upper-floor wet-room stacking;
- external doors/terraces;
- real solar orientation;
- final façade bay/window positions.

Those belong downstream.

---

# RH-02 gate record

**Result:** **PASS, with one controlled RH-01 dimensional rewind.**

The ground floor now has:

- a controlled room order;
- a furniture-scale basis rather than gross-block labels;
- a credible all-weather circulation route;
- a distinct principal arrival sequence;
- direct garden-side family/kitchen occupation;
- a compact but genuine study;
- a dedicated service geography with side replacement potential;
- no requirement for a full internal gallery around the courtyard;
- no dependence on one giant open-plan rear room.

The gross width is revised from **11.4 m to 12.0 m**. Courtyard and depth remain unchanged.

**No maturity promotion is claimed.**

**Next stage:** `RH-03 — Resolve stair, upper floor and courtyard circulation`.

**Exact next action:** test stair positions/forms against `G-HALL-02`, the east gallery and courtyard, then develop an upper-floor room order that preserves the ground-floor service geography without forcing bathrooms into dark or scattered positions.