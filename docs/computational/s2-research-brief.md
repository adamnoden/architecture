# S2 Research Brief — Connected Vertical Room Cluster

**Status:** integration-fixture specification v0.1  
**Purpose:** test whether the compiler architecture survives the transition from a complete room to a small, connected two-storey architectural sequence using the now-bounded H1 families.  
**Implementation:** none.

> **S2 is the first fixture where the compiler must understand not merely rooms, but why one route, room, opening and stair matter more than another.**

## 1. Why S2 exists

S1 proved that a complete room can combine:

- envelope;
- accessibility;
- ventilation;
- services;
- structure;
- architectural order;

without authoring complexity tracking internal obligation count.

H1 now also has candidate families for:

- principal entrance;
- private stair;
- roof;
- whole-house CMEV ventilation;
- heat-pump/radiator heating;
- clustered wet services;
- two-storey escape-window fire route.

S2 should therefore stop testing isolated building systems.

It should test:

- connected spatial topology;
- architectural hierarchy;
- route class;
- sequence;
- vertical circulation;
- shared façade/elevation relationships;
- service-core placement;
- cross-storey fire topology;
- selective invalidation across several spaces.

## 2. Fixture extent

S2 contains a connected cluster, not a complete dwelling.

### Ground floor

- principal entrance;
- entrance hall;
- principal habitable room;
- secondary habitable room;
- utility/WC wet-service room;
- private stair;
- service riser/core.

### Upper floor

- stair landing;
- one representative bedroom;
- one escape-window occurrence.

### Building systems crossing the cluster

- VENT-CMEV-01;
- HEAT-ASHP-RAD-01;
- WET-CORE-01;
- SR-ROOM-LOW-01;
- FIRE-H1-2S-EGRESS-01;
- ENTR-DOOR-MCW-01;
- ST-PRIVATE-01.

The rest of the dwelling is represented only through explicit external nodes.

## 3. Core research questions

### Q1 — Can hierarchy exist independently of size/centre?

The principal room is architecturally H1.

The entrance/stair has a strong axis.

Those two facts need not coincide.

The compiler must not assume:

- central = principal;
- largest = principal;
- on-axis = highest rank.

### Q2 — Can route classes coexist?

The fixture contains:

- principal arrival/circulation;
- stair/vertical circulation;
- technical/service route.

A technically shorter service route must not silently become the principal arrival sequence.

### Q3 — Can sequence be changed without geometry moving?

Adding a doorway can alter:

- route;
- sequence;
- hierarchy;

without moving room boundaries.

S2 will mutation-test this.

### Q4 — Can shared façade order coexist with room-specific obligations?

Several openings share a front elevation.

They may differ in:

- room rank;
- security;
- glazing safety;
- escape role;
- vertical alignment.

Shared family evidence cannot erase those occurrence differences.

### Q5 — Can stair/fire/access remain separate authorities?

The same stair participates in:

- Part K geometry;
- architectural hierarchy;
- vertical circulation;
- fire/escape topology.

A change can affect one without necessarily affecting all.

### Q6 — Can the wet core influence planning without taking over the plan?

The wet/service core should make:

- water;
- drainage;
- ventilation;
- plant access

easier.

It must remain subordinate to principal architectural order.

### Q7 — Can cross-storey changes invalidate selectively?

Examples:

- remove bedroom escape role;
- move stair;
- relocate wet core;
- alter entrance route.

The compiler should invalidate affected evidence only.

## 4. Architectural research profile

S2 uses:

**G01-PILOT-P0**

It is not a validated Georgian grammar.

Enabled research constraints:

1. hierarchy;
2. route class;
3. sequence;
4. scoped axis/order;
5. opening rank;
6. no universal ratio.

No numeric Georgian room ratio is enforced.

## 5. H1 families used

### Envelope / openings

- masonry cavity-wall baseline;
- BF-WIN-MCW-01;
- BF-CORNER-MCW-01 where required;
- BF-GF-MCW-01;
- ENTR-DOOR-MCW-01.

### Structure

- I-joist floor semantics + external adequacy;
- ST-PRIVATE-01;
- SAB-H1-01.

### Services

- VENT-CMEV-01;
- HEAT-ASHP-RAD-01;
- WET-CORE-01;
- SR-ROOM-LOW-01.

### Fire

- FIRE-H1-2S-EGRESS-01.

## 6. Complexity gate

S2 inherits all S0/S1 complexity rules.

Additional S2-specific alarms:

### S2-CG-01 — route explosion

The author should not have to manually maintain separate circulation graphs for:

- architecture;
- accessibility;
- fire;
- services.

One spatial graph supplies facts to several scoped route evaluations.

### S2-CG-02 — hierarchy is not duplicated metadata

Room rank is authored once.

Opening/route obligations reference it.

### S2-CG-03 — service-core knowledge remains shared

Moving one service core should update:

- wet services;
- ventilation;
- heating;
- maintenance;

through shared topology.

Do not maintain four manually synchronized core locations.

### S2-CG-04 — façade/elevation scope remains separate

Front-elevation order is one scoped graph.

It must not become whole-building symmetry.

### S2-CG-05 — cross-storey invalidation remains local

Moving a stair may affect:

- floor opening;
- structure;
- route;
- fire;
- order.

It should not stale:

- unrelated window security;
- wet-room drainage;
- wall product evidence

unless a real dependency exists.

## 7. Planned mutations

### S2-M01 — service shortcut

Add a normal-width direct door from the wet/service room into the principal room and nominate it as a general circulation route.

Tests:

- route hierarchy;
- sequence;
- technical route becoming architectural shortcut.

### S2-M02 — stair-axis drift

Move stair 400 mm off the principal entrance/stair axis while keeping technical stair geometry valid.

Tests:

- scoped order;
- structure/floor opening;
- accessibility/fire independence.

### S2-M03 — flatten opening hierarchy

Make secondary-room front window identical to or larger than the principal-room front window.

Tests:

- opening rank;
- façade order;
- technical validity independence.

### S2-M04 — remove upper escape-window role

Make bedroom window fixed/non-egress.

Tests:

- fire route failure;
- thermal/security geometry may remain valid.

### S2-M05 — move wet core away

Relocate wet/service core several metres from utility/WC.

Tests:

- drainage falls/length;
- water route;
- cMEV ducting;
- heating plant/distribution;
- complexity grouping.

### S2-M06 — obstruct entrance hall

Reduce clear route near the principal entrance/stair.

Tests:

- Part M;
- fire final-exit route;
- architectural arrival.

### S2-M07 — make service route visually dominant

Widen/align technical/service access while narrowing or obscuring principal route.

Tests:

- G01-PILOT hierarchy;
- doctrine service subordination;
- no false regulatory failure.

### S2-M08 — move upper floor level

Change floor-to-floor height without re-solving stair.

Tests:

- stair K geometry;
- structural opening;
- upper-window sill/escape relation;
- unrelated ground-floor services.

## 8. Stop conditions

Stop S2 and rethink if:

- each discipline needs its own duplicated room/door/stair model;
- route classes require manual graph maintenance;
- family count, not design decision count, dominates authoring;
- service core placement dictates architecture merely because the model cannot coordinate alternatives;
- G01-PILOT begins to masquerade as validated Georgian truth;
- fire-family assumptions are silently expanded beyond their bounded route;
- the default issue surface becomes a list of regulations rather than design actions.

## 9. Pass condition

S2 passes provisionally if:

1. one connected source model supports all route/space evaluations;
2. hierarchy/sequence changes are represented without geometry hacks;
3. stair roles remain compositional;
4. service-core movement produces grouped service consequences;
5. upper-room fire obligations occur at the right scope;
6. façade/opening order remains separate from technical validity;
7. mutations invalidate selectively;
8. ordinary author-facing actions remain far fewer than internal obligations;
9. release can still fail honestly.

## 10. Non-goals

S2 does not prove:

- a complete house;
- full G-01;
- whole-house energy compliance;
- whole-house overheating compliance;
- foundation adequacy;
- wet-room waterproofing details;
- product selection;
- external competent validation.

## 11. Expected value

S2 should answer:

> **Can the compiler preserve architectural meaning when technical systems and regulations are no longer attached to one room, but cross through a connected sequence of spaces and storeys?**

If yes, the next major research scale can finally approach a whole H1 house.

If no, the formal model must simplify before implementation.
