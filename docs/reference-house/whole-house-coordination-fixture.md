# Reference House — Whole-House Coordination Fixture 01

**Status:** provisional whole-house coordination fixture; not a final architectural design  
**Purpose:** provide enough explicit whole-house geometry to coordinate service topology, maintenance geography and pattern composition.  
**Companion drawing:** [whole-house-coordination-fixture.svg](whole-house-coordination-fixture.svg)

This fixture is the current provisional geometry for whole-house coordination. It gives the Reference House enough spatial definition to test relationships that cannot be resolved at detail scale alone.

It is deliberately schematic. It preserves established Reference House directions where they matter—two storeys, Georgian-derived order, an open courtyard, a strong front-to-courtyard-to-garden axis, permanent masonry architecture and explicit maintenance geography—without implying that room proportions, elevations or dimensions are final.

Dimensions below are **coordination assumptions**, not construction information.

---

## 1. Relationship to the computational H1 fixture

The frozen H1 paper-compilation house is a useful internal comparator, not the Reference House.

H1 demonstrated that a compact rectangular house can cluster kitchen, utility, bathroom, plant and vertical services at one rear corner. This Reference House fixture asks whether the same serviceability logic survives a courtyard plan with stronger architectural axes and more perimeter.

H1 geometry is not evidence for this design. The useful comparison is architectural:

> **Can the courtyard house remain service-coherent without paying for its spatial order through long routes, duplicated cores or technical corridors?**

---

## 2. Site and orientation assumptions

Current coordination assumptions:

- **front / street:** south;
- **rear garden:** north;
- **primary service side:** east;
- **secondary maintenance side:** west;
- **principal entrance axis:** north–south through the centre of the house;
- **garden-to-courtyard connection:** retained on the same central axis;
- **external plant candidate zone:** north-east, beside the internal service hub;
- **utility approach assumption:** from the south-east/front boundary, continuing along the east service side.

The utility approach remains provisional. Actual site searches, statutory undertaker information and levels may invalidate it.

The site plan must preserve an ordinary external route along the east side wide enough for plant replacement, maintenance equipment and movement between front and rear. Exact site-boundary offsets are not fixed here.

---

## 3. Building envelope

Provisional outer rectangle:

- **12,600 mm east–west**;
- **11,400 mm south–north**;
- two principal storeys;
- no basement currently assumed;
- no habitable roof storey currently assumed.

Open courtyard reservation:

- **3,600 × 3,600 mm**;
- X = **4,500–8,100 mm**;
- Y = **3,900–7,500 mm**.

This creates four gross wings:

- south wing depth ≈ **3,900 mm**;
- north wing depth ≈ **3,900 mm**;
- west wing width ≈ **4,500 mm**;
- east wing width ≈ **4,500 mm**.

Gross ring area is approximately **130.6 m² per storey** before wall thicknesses, gallery/circulation and local voids. The fixture is deliberately not area-optimised. The footprint remains open to reduction if the same architectural and service relationships can be preserved more compactly.

### Coordinate system

- origin = south-west outside corner;
- +X = east;
- +Y = north;
- principal axis = X **6,300 mm**.

---

## 4. Ground-floor organisation

The ground floor is organised by an architectural centre and a service-heavy east/rear edge.

| ID | Zone | Approximate geometry / role | Service intensity |
|---|---|---|---|
| `G-DRAW-01` | south-west | principal drawing/living room | low |
| `G-HALL-01` | south-centre | entrance hall, stair and clear axial passage to courtyard | low–medium |
| `G-STUDY-01` | south-east | study / guest-capable room | low |
| `G-FAM-01` | west / north-west | family / dining living territory opening to courtyard/garden | low–medium |
| `G-GARDEN-01` | north-centre | garden hall / dining / axial garden connection | low |
| `G-KIT-01` | east-middle | kitchen against service-heavy eastern geography | high |
| `G-SVC-01` | north-east | back hall + utility + WC + plant/service hub | high |
| `C-01` | centre | open courtyard | external / drainage |

### Principal circulation

The front entrance, principal hall, courtyard threshold and rear garden connection remain legible as one architectural sequence.

The stair may occupy part of `G-HALL-01` but must not close the central visual/physical axis. Exact stair form remains unresolved.

### Ground service logic

The east side is deliberately asked to do more technical work than the west:

- kitchen shares an edge with the service zone;
- utility/WC/plant cluster at the north-east;
- utility entry and external plant approach from the east;
- a vertical service zone can rise from `G-SVC-01` without passing through a principal room;
- kitchen source capture can discharge directly through the east external wall rather than crossing the house.

This asymmetry is intentional. Georgian-derived architectural order does not require bilateral technical symmetry.

---

## 5. Upper-floor organisation

The current upper-floor programme uses four bedrooms.

| ID | Zone | Approximate role | Service intensity |
|---|---|---|---|
| `B-P01` | north / north-west | principal bedroom | low |
| `B-S01` | south-west | bedroom | low |
| `B-S02` | south-east | bedroom | low |
| `B-S03` | west-middle | bedroom | low |
| `BATH-01` | east-middle | family bathroom | high |
| `ENS-01` | east / north-east | principal en-suite | high |
| `U-SVC-01` | north-east | linen / service-access zone / riser head | high-service support |
| `L-01` | inner circulation | landing/gallery around the courtyard where required | low–medium |

The exact partitioning of the upper east wing remains adjustable. The current proposition is that `BATH-01`, `ENS-01` and `U-SVC-01` can share the same service geography rather than creating independent wet cores.

Dry-side access to selected bathroom components should occur from `L-01` or `U-SVC-01`, not from another bedroom.

---

## 6. Structural assumptions for service coordination

The fixture keeps structure intentionally simple:

- loadbearing external/perimeter masonry remains the baseline architectural mass;
- courtyard walls are treated as substantial permanent lines unless later engineering suggests otherwise;
- floors use engineered timber members or an equivalent system with explicit spanning direction;
- routine services do not use structural member zones as general distribution space;
- concentrated service crossings occur at designed locations adjacent to service geography;
- the central stair opening and courtyard opening are known permanent geometric constraints.

No member sizes, foundation capacities, transfer beams or connection capacities are asserted here.

The current structural question is whether the proposed service topology can avoid repeated arbitrary crossings and whether the remaining crossings can be owned explicitly.

---

## 7. Environmental / roof assumptions affecting service topology

The house remains **passive first**.

Current assumptions:

- openable external windows and courtyard openings provide daylight/purge opportunities;
- kitchen source capture remains a separate direct-to-outside system;
- bathroom/utility normal extract must have a credible route but no final ventilation system is selected;
- a north/rear roof zone is preferred for service terminals where roof termination is required;
- active assist equipment, if later required, must remain accessible from `U-SVC-01`, the plant hub or other genuine maintenance geography rather than being marooned at a roof terminal.

The service plan must work with hybrid, continuous mechanical or another evidence-supported ventilation strategy. It must not depend on one system choice merely to make the topology look coherent.

---

## 8. Courtyard and maintenance constraints

The courtyard is not leftover space. It creates both architectural value and service/maintenance constraints.

For this fixture:

- no principal utility route crosses beneath the courtyard merely because it is geometrically short;
- courtyard drainage remains a first-class external-water problem;
- service access panels should not accumulate visibly on principal courtyard elevations;
- the north garden-to-courtyard logistics route must remain usable for maintenance and material movement;
- upper courtyard façades still require a credible maintenance method.

A service topology that turns the courtyard into a technical yard fails the architectural brief.

---

## 9. Current invariants and open geometry

### Retained for current coordination

- two storeys;
- open courtyard;
- front-to-courtyard-to-garden central axis;
- permanent masonry architectural character;
- service-heavy east/rear bias as the **starting hypothesis**, not a conclusion.

### Open to revision

- exact room boundaries;
- plant-room size;
- kitchen/utility partition;
- upper bathroom/en-suite arrangement;
- riser size and exact position;
- stair form;
- horizontal route depth/location;
- external plant location within the service side;
- overall footprint if later coordination reveals disproportionate area or route consequences.

These remain open wherever later structural, environmental, maintenance or architectural work gives a better answer.

---

## 10. Coordination adequacy

The fixture is useful only if it permits identifiable answers to:

1. where services enter;
2. where plant is maintained and replaced;
3. how services rise between floors;
4. which wet rooms genuinely share service geography;
5. where primary horizontal routes run and what they carry;
6. which structural/boundary crossings remain;
7. how water failure is handled along actual route classes;
8. where pattern occurrences exist rather than merely being intended.

If those answers depend on pretending that unresolved dimensions or technical performance are proven, the fixture remains a coordination brief rather than a resolved design.