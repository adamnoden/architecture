# Wet-Service Family WET-CORE-01 — Clustered Wet Core with Zonal Service Walls

**Status:** H1 paper-domain wet-service family v0.1  
**Purpose:** give water, sanitary drainage and high-consequence domestic appliances a deliberate whole-house geography rather than allowing plumbing to accumulate through unrelated construction.  
**Engineering status:** pipe sizing, hydraulic design, drainage sizing/gradients and hot-water safety require competent design/evidence against the selected target.

> **Keep water close to the core, keep gravity routes short, and make isolation and repair legible before failure occurs.**

## 1. Architectural proposition

The bounded H1 family groups:

- bathrooms;
- shower rooms;
- utility;
- kitchen high-service edge;
- hot-water plant

around one deliberately accessible wet-service geography.

The core contains or directly adjoins:

- vertical water mains;
- soil/waste stack(s);
- ventilation extract routes where coordinated;
- hot-water cylinder/plant;
- zonal valve clusters;
- service access.

This is a planning proposition with architectural consequences, not a requirement that every HSA house use one central core.

## 2. Why not one giant central manifold

A whole-house home-run manifold is superficially attractive because every outlet is individually legible.

It can also create:

- long hot/cold branches;
- more pipe;
- more stored water volume;
- stagnation/wait-time risk;
- a large proprietary distribution hub.

The H1 family therefore uses **zonal distribution** rather than requiring every outlet to home-run to one remote manifold.

This does not settle the general HSA question of individually isolatable manifold distribution; that remains a held candidate assessed by context and evidence.

## 3. Zonal water topology

Conceptually:

~~~text
INCOMING COLD MAIN
      ↓
MAIN ISOLATION / PLANT CORE
      ├── COLD RISER
      │      ↓
      │   ZONE VALVE CLUSTER
      │      ↓
      │   SHORT FIXTURE BRANCHES
      │
      └── HOT-WATER CYLINDER
             ↓
          HOT RISER
             ↓
          ZONE VALVE CLUSTER
             ↓
          SHORT FIXTURE BRANCHES
~~~

A zone normally corresponds to:

- one wet room;
- one closely coupled bathroom pair;
- utility/kitchen service wall;
- another deliberately compact service group.

## 4. Valve clusters

Each zone has an accessible labelled isolation point.

The model records:

- zone;
- hot isolation;
- cold isolation;
- appliance-specific isolation where useful;
- access.

The objective is local, intelligible isolation without searching through the house. The exact valve/manifold product remains replaceable.

## 5. Service walls

Wet rooms use a high-service wall or accessible service zone that can carry:

- hot/cold water;
- sanitary branches;
- cistern/valves where applicable;
- ventilation terminal/duct coordination;
- electrical/control interfaces with required segregation.

Service access may come through:

- removable panels;
- adjacent service corridor/riser;
- another deliberate access face.

A brittle decorative finish should not be the only route to a valve or trap.

## 6. Drainage topology

Gravity drainage is organised around one or a small number of vertical stacks in the wet-service geography.

Conceptually:

~~~text
FIXTURE
   ↓ short branch with explicit fall
ZONAL SERVICE WALL
   ↓
SOIL / WASTE STACK
   ↓
DESIGNED FLOOR / SUBSTRUCTURE CROSSING
   ↓
BELOW-GROUND DRAIN
   ↓
EXTERNAL INSPECTION / SITE DRAINAGE
~~~

The semantic model records:

- source fixture;
- branch length;
- invert/start/end levels;
- required fall;
- stack;
- access/rodding points;
- crossing/sleeve identity.

## 7. Drainage cannot cheat gravity

If fixture and stack geometry cannot achieve the selected Part-H route without cutting structure, hiding a long flat pipe, dropping below an inaccessible zone or creating an unsupported branch, the source arrangement must change or leave the supported family.

The compiler must not “solve” drainage after the plan is finished by inventing an impossible route.

This is one reason to coordinate wet-room adjacency early.

## 8. Stack access

The stack lives in deliberate vertical service geography.

The model provides for:

- rodding/clearing access;
- repair access;
- vent/AAV access where selected;
- removable access where needed;
- working space appropriate to the task.

Approved Document H's repair/access requirements align with HSA maintenance geography but retain their own regulatory authority.

## 9. Floor/substructure crossing

Where a stack or drain crosses the ground-floor assembly:

- use a planned opening/sleeve/box-out;
- preserve DPM/air/thermal boundaries;
- record below-ground drainage as site infrastructure;
- connect to an accessible external inspection strategy.

The route passes through a designed interface rather than becoming an arbitrary cast-in service path.

## 10. Hot-water plant

The H1 family places the heat-pump-compatible hot-water cylinder adjacent to the wet-service core where practical.

Benefits include:

- shorter principal hot-water routes;
- shared plant access;
- visible safety-discharge geography;
- easier cylinder replacement;
- reduced distribution loss/wait time.

The cylinder is replaceable plant, not permanent fabric.

## 11. Hot-water safety

Where an unvented cylinder is used, the family must accommodate:

- safety valves;
- expansion provisions;
- visible tundish;
- discharge route;
- required fall/termination;
- maintenance access.

The exact design is competent Part-G/installer evidence. The computational model can own route and access dependencies without claiming to be the hot-water designer.

## 12. Water quality

H1 preferences include:

- keep cold water cold;
- keep hot water hot;
- avoid unnecessary dead legs;
- avoid unnecessary pipe length and stored branch volume;
- keep rarely used branches explicit in the model.

A low-use remote outlet should trigger review rather than disappear into generic plumbing topology.

## 13. Appliance failure architecture

Dishwasher and washing machine belong in high-consequence wet/service zones where practical.

The H1 family expects:

- accessible isolation;
- replaceable hoses/connections;
- inspectable connection zone;
- local containment/drainage where proportionate;
- surrounding finishes capable of tolerating foreseeable leakage long enough for detection;
- no critical junction made inaccessible by fixed cabinetry without a deliberate access method.

Electronic leak sensors/automatic shutoff may assist. They are not the only failure-containment strategy.

## 14. Bathroom failure architecture

Bathrooms are treated as wet rooms.

The family coordinates:

- waterproofing;
- falls where applicable;
- trap access;
- isolation;
- sanitary drainage;
- extract ventilation;
- electrical-zone constraints;
- service-wall access.

The exact waterproofing assembly remains a dedicated product/detail family.

## 15. Kitchen

The kitchen connects to the wet-service geography through a compact service edge where practical.

Prefer sink, dishwasher and other water-consuming equipment near that edge when doing so does not damage the architecture.

Moving the sink or appliances can legitimately create:

- longer water branches;
- longer waste route;
- new crossings;
- drainage-fall conflicts.

Those consequences belong in the design decision; the kitchen layout is not reduced to plumbing efficiency.

## 16. Ventilation coordination

The wet core can share a vertical technical geography with the selected ventilation family for wet-room extract routes, subject to separation, fire/acoustic obligations, maintainability and actual duct geometry.

H1 research has used both:

- `VENT-CMEV-01` — supported fallback / historical S2 family;
- `VENT-HYBRID-STACK-01` — later research-supported passive/assisted topology.

Water, drainage and ventilation remain distinct systems even when they occupy adjacent service geography.

## 17. Heating coordination

`HEAT-ASHP-RAD-01` may use the same plant/service geography for:

- heat-pump hydraulic interface;
- cylinder;
- primary heating distribution.

Space-heating water remains distinct from potable hot/cold water.

## 18. Evidence

### Design

- fixture schedule;
- water demand;
- branch/stack layout;
- drainage falls;
- isolation schedule;
- hot-water storage/safety;
- water-efficiency calculation;
- waterproofing strategy;
- ventilation/electrical coordination.

### Product

- pipe/joint systems;
- valves/manifolds;
- cylinder;
- sanitary fittings;
- waterproofing;
- traps/AAVs where used.

### Construction

- pressure testing;
- drainage testing;
- falls;
- access/rodding;
- waterproofing inspection;
- safety-discharge route;
- isolation labelling;
- commissioning.

## 19. Mutations

### WET-M01 — move bathroom away from core

Expected:

- longer water/drain branches;
- drainage fall/structure conflicts;
- family may become a poor or unsupported fit.

### WET-M02 — move WC across joist field

Expected:

- branch route re-evaluates;
- arbitrary joist cutting is not accepted as an implicit solution;
- plan may fail despite geometric room fit.

### WET-M03 — hide valve cluster behind fixed tiling/joinery

Expected:

- maintenance geography fails.

### WET-M04 — relocate cylinder remote from core

Expected:

- hot-water route, heat loss, safety discharge and maintenance re-evaluate.

### WET-M05 — remove rodding access

Expected:

- Part-H/maintenance obligation fails;
- pipe geometry can remain otherwise valid.

### WET-M06 — add infrequently used remote outlet

Expected:

- water-quality/stagnation warning;
- branch quantities and hot-water performance re-evaluate.

### WET-M07 — appliance moved outside failure-tolerant wet geography

Expected:

- leakage consequence and project requirements re-evaluate rather than producing a generic doctrine failure.

## 20. H1 posture

~~~text
wet-room clustering              H1 ARCHITECTURAL / SYSTEM FAMILY
hot/cold topology                RESEARCH-SUPPORTED
zonal isolation                  RESEARCH-SUPPORTED
gravity drainage topology        RESEARCH-SUPPORTED
stack/service geography          RESEARCH-SUPPORTED
pipe sizing / hydraulics         EXTERNAL COMPETENT DESIGN
drain sizing / gradients         TARGET + EXTERNAL DESIGN
hot-water safety                 TARGET + COMPETENT EVIDENCE
water efficiency                 TARGET / CALCULATION
waterproofing                    PRODUCT/FAMILY EVIDENCE
construction testing             PHYSICAL EVIDENCE
~~~

WET-CORE-01 is deliberately a **geography + network family**, not a universal plumbing design engine.

## 21. Reference House boundary

The Reference House may select, modify or reject this family as its plan develops. The general HSA proposition is that wet services, gravity, isolation, failure consequences and maintenance geography should be coordinated deliberately. The exact number of cores, stacks, valve groups and room adjacencies belongs to the project.

## 22. Source anchors

- Approved Document G: https://www.gov.uk/government/publications/sanitation-hot-water-safety-and-water-efficiency-approved-document-g
- Approved Document H: https://www.gov.uk/government/publications/drainage-and-waste-disposal-approved-document-h
- HSE hot/cold water systems: https://www.hse.gov.uk/legionnaires/hot-and-cold.htm