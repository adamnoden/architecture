# Wet-Service Family WET-CORE-01 — Clustered Wet Core with Zonal Service Walls

**Status:** H1 supported-family candidate v0.1  
**Purpose:** give water, sanitary drainage and high-consequence domestic appliances a deliberate whole-house geography rather than allowing plumbing to spread opportunistically through permanent fabric.  
**Engineering status:** pipe sizing, hydraulic design, drainage sizing/gradients and hot-water safety require competent design/evidence against the selected target.

> **Keep water close to the core, keep gravity routes short, and make isolation/repair visible before the bad day arrives.**

## 1. Architectural proposition

H1 groups:

- bathrooms;
- shower rooms;
- utility;
- kitchen high-service edge;
- hot-water plant

around one deliberately accessible wet-service core.

The core contains or directly adjoins:

- vertical water mains;
- soil/waste stack(s);
- ventilation extract riser/duct routes where coordinated;
- hot-water cylinder/plant;
- zonal valve clusters;
- service access.

This is a planning constraint with architectural consequences.

## 2. Why not one giant central manifold

A whole-house home-run manifold is superficially attractive because every outlet is individually legible.

But it can also create:

- long hot/cold branches;
- more pipe;
- more stored water volume;
- stagnation/wait-time risk;
- a large proprietary distribution hub.

H1 therefore prefers:

> **zonal distribution**

rather than:

> every tap home-run to one remote manifold.

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

The goal is:

> a leak or fixture replacement can be isolated locally without searching through the house.

The exact valve/manifold product remains replaceable.

## 5. Service walls

Wet rooms use a high-service wall or accessible service zone that can carry:

- hot/cold water;
- sanitary branches;
- cistern/valves where applicable;
- ventilation terminal/duct coordination;
- electrical/control interfaces with required segregation.

Service access is provided through:

- removable panels;
- adjacent service corridor/riser;
- another deliberate access face.

No brittle decorative finish should be the only route to a valve or trap.

## 6. Drainage topology

Gravity drainage is organised around one or a small number of vertical stacks in the wet core.

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

The compiler stores:

- source fixture;
- branch length;
- invert/start/end levels;
- required fall;
- stack;
- access/rodding points;
- crossing/sleeve identity.

## 7. Drainage cannot cheat gravity

If fixture and stack geometry cannot achieve the selected Part-H route without:

- cutting structure;
- hiding a long flat pipe;
- dropping below an inaccessible zone;
- creating an unsupported branch,

the compiler returns:

**FAIL / UNSUPPORTED LAYOUT**

It does not “solve” drainage after the plan is finished.

This is one of the strongest reasons for clustering wet rooms early.

## 8. Stack access

The stack lives in a first-class accessible riser.

The model provides for:

- rodding/clearing access;
- repair access;
- vent/AAV access where selected;
- removable panels;
- working space.

Approved Document H's expectation that pipework be reasonably accessible for repair is treated as architecture, not an afterthought.

## 9. Floor/substructure crossing

Where a stack or drain crosses the ground-floor assembly:

- use a planned opening/sleeve/box-out;
- preserve DPM/air/thermal boundaries;
- record below-ground drainage as site infrastructure;
- connect to an accessible external inspection strategy.

Do not cast an arbitrary drainage route inside structural floor fabric.

The pipe passes through a designed interface.

## 10. Hot-water plant

The heat-pump-compatible hot-water cylinder sits adjacent to the wet-service core where practical.

Benefits:

- short main hot-water routes;
- shared plant access;
- safety-discharge route can be designed visibly;
- easier cylinder replacement;
- reduced distribution loss/wait time.

The cylinder is replaceable plant.

It is not permanent fabric.

## 11. Hot-water safety

Where an unvented cylinder is used, the family must accommodate:

- safety valves;
- expansion provisions;
- visible tundish;
- discharge route;
- required fall/termination;
- maintenance access.

The exact design is competent Part-G/installer evidence.

The compiler owns the route and access dependency.

## 12. Water quality

H1 principles:

- keep cold water cold;
- keep hot water hot;
- keep water moving;
- avoid dead legs;
- avoid unnecessary pipe length;
- keep rarely used branches visible in the model.

A low-use remote outlet should generate a design review rather than disappear into plumbing topology.

## 13. Appliance failure architecture

Dishwasher and washing machine belong in high-consequence wet/service zones.

Base H1 requirements:

- accessible isolation;
- replaceable hoses/connections;
- inspectable connection zone;
- local leak containment where practical;
- floor/wall finishes that tolerate foreseeable leakage long enough for detection;
- no critical junction hidden behind permanently fixed cabinetry.

Electronic leak sensors/automatic shutoff may be added.

They are not allowed to be the only failure-containment strategy.

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

The kitchen is connected to the wet core through one compact service edge.

Prefer:

- sink;
- dishwasher;
- water-consuming equipment

near the service wall/core.

The kitchen layout remains architectural.

The compiler can warn when moving the sink across the room creates:

- long water branches;
- long waste route;
- new floor penetrations;
- drainage conflicts.

## 16. Ventilation coordination

VENT-CMEV-01 extracts from wet rooms.

Therefore the wet core can share a vertical technical geography for:

- drainage stack;
- water risers;
- extract ducts,

with appropriate separation/access.

They remain distinct networks.

A shared shaft is not permission to merge boundaries, fire requirements or access blindly.

## 17. Heating coordination

HEAT-ASHP-RAD-01 may use the same plant/service core for:

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
- may leave supported domain.

### WET-M02 — move WC across joist field

Expected:

- branch route re-evaluates;
- arbitrary joist cutting forbidden;
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

### WET-M07 — appliance moved outside wet/failure-tolerant zone

Expected:

- leak-consequence/doctrine warning or failure depending project profile.

## 20. H1 posture

~~~text
wet-room clustering              SUPPORTED ARCHITECTURAL STRATEGY
hot/cold topology                SUPPORTED
zonal isolation                  SUPPORTED
gravity drainage topology        SUPPORTED
stack/service-riser geography    SUPPORTED
pipe sizing / hydraulics         EXTERNAL COMPETENT DESIGN
drain sizing / gradients         TARGET + EXTERNAL DESIGN
hot-water safety                 TARGET + COMPETENT EVIDENCE
water efficiency                 TARGET / CALCULATION
waterproofing                    PRODUCT/FAMILY EVIDENCE
construction testing             FUTURE PHYSICAL EVIDENCE
~~~

WET-CORE-01 is deliberately a **geography + network family**, not a universal plumbing design engine.

## 21. Source anchors

- Approved Document G: https://www.gov.uk/government/publications/sanitation-hot-water-safety-and-water-efficiency-approved-document-g
- Approved Document H: https://www.gov.uk/government/publications/drainage-and-waste-disposal-approved-document-h
- HSE hot/cold water systems: https://www.hse.gov.uk/legionnaires/hot-and-cold.htm
