# Service Family SR-ROOM-LOW-01 — Accessible Low-Level Room Service Route

**Status:** H1 paper-domain service-route family v0.1; physical enclosure/product unselected  
**Purpose:** give H1 one bounded room-level distribution route for electrical/data and simple heating services without treating permanent masonry or primary structure as an opportunistic service void.  
**Construction status:** semantic/assembly family only; exact proprietary enclosure/system unselected.

> **The model should know where services are intended to live before it knows every cable size or pipe diameter.**

## 1. Supported intent

The family provides one accessible low-level route from a hall/service route into an ordinary habitable room.

It supports:

- electrical power points;
- data/communications points;
- local controls;
- a simple hydronic emitter branch;
- accessible isolation;
- replaceable terminal devices.

It is not a full domestic-services design engine and is not a general HSA requirement that every room use low-level distribution.

## 2. Physical principle

Services are distributed in a room-side, accessible, non-structural zone.

Conceptually:

~~~text
HALL / SERVICE ROUTE
      ↓
CONTROLLED ROOM ENTRY
      ↓
ACCESSIBLE LOW-LEVEL ROUTE
      ├── ELECTRICAL / DATA PATH
      └── HYDRONIC PATH
              ↓
          EMITTER
~~~

The exact enclosure may be:

- removable skirting/service trunking;
- removable low-level cover;
- another supported accessible dry-service enclosure.

The family does not require one bespoke product.

## 3. Core constraints

### Permanent fabric

Routine distribution should not rely on:

- arbitrary chasing of structural masonry;
- uncontrolled drilling/notching of primary structure;
- concealed ad-hoc routes with no later access.

This follows HSA's separation-of-lifetimes and controlled-interface principles. It is not an absolute prohibition on every service crossing or embedded route.

### Access

The route must remain reasonably accessible for:

- inspection;
- isolation;
- local repair;
- replacement.

### Segregation

Electrical/data and hydronic services are distinct sub-routes.

They may share a coordinated low-level zone only where the selected physical system provides appropriate separation and evidence.

The semantic family does not assume mixed services can occupy one undivided box.

### Crossings

Any crossing of:

- structural wall;
- fire boundary;
- acoustic boundary;
- air/thermal/weather boundary

becomes its own typed penetration/interface.

Internal non-structural partition crossings can use a simpler supported route where the wall's roles permit it.

## 4. Electrical/data contribution

The family contributes:

- outlet/control locations;
- route topology;
- accessibility;
- enclosure/segregation dependency;
- Part-M control-height contribution where applicable.

Electrical design remains competent external work under Part P, including:

- circuit design;
- conductor sizing;
- protection;
- testing;
- certification.

Spatial accessibility is not electrical safety.

## 5. Hydronic contribution

The family may carry a simple flow/return branch to one room emitter.

It contributes:

- source relationship;
- route;
- emitter identity;
- isolation point;
- replacement/access intent.

External mechanical design remains responsible for:

- pipe sizing;
- hydraulic balance;
- emitter output;
- system temperatures;
- controls;
- commissioning.

## 6. Isolation semantics

A replaceable emitter should have an explicit local or system isolation strategy.

The semantic model records:

- what isolates the component;
- where the isolation device is;
- whether access remains available.

It need not calculate valve authority or hydraulic performance.

## 7. Room-interface rules

The service route must not silently occupy:

- door clear-opening space;
- applicable approach zones;
- window replacement/working zones;
- declared furniture/maintenance clearances;
- structural bearing zones;
- floor movement joints.

Conflicts are evaluated in the composed room model.

## 8. Controls and accessibility

Where the selected target makes service controls/sockets subject to access requirements, their positions are evaluated against that target.

The service family itself does not own Part M compliance. It contributes positions and relationships.

## 9. Architectural role

The route is infrastructure.

It should be:

- accessible;
- legible to maintainers;
- subordinate to the room's architectural order;
- resolved as an intentional architectural interface where visible.

This is the practical meaning of **accessible ≠ exposed**. The exact skirting/profile language remains architectural design work.

## 10. Workmanship / tolerance

The family needs:

- controlling room datum;
- supported mounting substrate;
- declared route envelope;
- supported bend/corner/junction conditions;
- supported cover/fixing tolerances;
- inspection before any consequential closure.

Out-of-range wall/floor geometry should trigger local remediation, supported adjustment or redesign. The service enclosure should not become a cosmetic device for hiding major setting-out defects.

## 11. Evidence model

Potential shared family evidence:

- enclosure/product family;
- segregation suitability;
- material/fire classification where relevant;
- mounting/fixing envelope;
- service compatibility.

Occurrence evidence:

- route installed as authored;
- outlets/controls at correct positions;
- isolation accessible;
- crossings treated correctly;
- electrical/mechanical commissioning evidence.

## 12. S1 provenance

S1 exercised one occurrence with a hall source, low-level room route, representative electrical/data points and a simple hydronic emitter without external-masonry chasing.

The paper result demonstrated that a declared room-service geography can remain separate from electrical/hydronic technical proof. It did not select a physical enclosure product or promote this family into HSA doctrine.

## 13. Mutations

### Move socket/control to inaccessible height

Target accessibility may fail while route topology remains valid.

### Move route into an uncontrolled structural-masonry chase

HSA project intent may fail; structural/boundary obligations may also arise from the actual condition.

### Place emitter near doorway

Room access/maintenance geometry may fail even if hydraulic design remains valid.

### Change partition role

If the crossed partition becomes loadbearing or fire-resisting, the simple crossing no longer applies. Generate the relevant typed structural/fire penetration obligations.

### Add wet/high-consequence water service

This family does not automatically support domestic hot/cold-water distribution merely because it supports a heating branch.

Return:

**OUTSIDE CURRENT ROOM-SERVICE FAMILY / NEW SERVICE CLASS REQUIRED**

## 14. H1 posture

SR-ROOM-LOW-01 is a **paper-research semantic/route family with product and engineering evidence external**.

It resolves one bounded modelling question:

> ordinary room services can have declared geography and explicit crossings.

It does not establish the best room-service architecture for every HSA project or the Reference House.