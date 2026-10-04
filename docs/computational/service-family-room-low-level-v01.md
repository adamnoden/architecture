# Service Family SR-ROOM-LOW-01 — Accessible Low-Level Room Service Route

**Status:** supported-family research candidate v0.1  
**Purpose:** give H1 one ordinary room-level distribution route for electrical/data and simple heating services without treating permanent masonry or primary structure as an opportunistic service void.  
**Construction status:** semantic/assembly family only; exact proprietary enclosure/system unselected.

> **The compiler should know where services are allowed to live before it knows every cable size or pipe diameter.**

## 1. Supported intent

The family provides one accessible low-level route from a hall/service spine into an ordinary habitable room.

It supports:

- electrical power points;
- data/communications points;
- local controls;
- a simple hydronic emitter branch;
- accessible isolation;
- replaceable terminal devices.

It does not attempt to become a full domestic-services design engine.

## 2. Physical principle

Services are distributed in a room-side, accessible, non-structural zone.

Conceptually:

~~~text
HALL / SERVICE SPINE
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

Routine distribution must not rely on:

- arbitrary chasing of external structural masonry;
- uncontrolled drilling/notching of primary structure;
- concealed ad-hoc routes with no later access.

### Access

The route must remain reasonably accessible for:

- inspection;
- isolation;
- local repair;
- replacement.

### Segregation

Electrical/data and hydronic services are distinct sub-routes.

They may share a coordinated low-level zone only where the selected physical system provides appropriate separation and evidence.

The semantic family does not assume mixed services can simply occupy one undivided box.

### Crossings

Any crossing of:

- structural wall;
- fire boundary;
- acoustic boundary;
- air/thermal/weather boundary;

becomes its own typed penetration/interface.

Internal non-structural partition crossings can use a simpler supported route where the wall's roles permit it.

## 4. Electrical/data contribution

The family contributes:

- outlet/control locations;
- route topology;
- accessibility;
- enclosure/segregation dependency;
- Part-M control-height contribution where applicable.

Electrical design remains external/competent under Part P, including:

- circuit design;
- conductor sizing;
- protection;
- testing;
- certification.

The compiler should not confuse spatial accessibility with electrical safety.

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
- Part-M approach zones;
- window replacement/working zones;
- declared furniture/maintenance clearances;
- structural bearing zones;
- floor movement joints.

Conflicts are evaluated in the composed room model.

## 8. Controls and accessibility

Where the selected target makes service controls/sockets subject to access requirements, their positions are evaluated against that target.

For S1 Category 1:

- the frozen 600 mm AFFL control/outlet positions are in the tested target range.

The service family itself does not own Part M compliance.

It contributes the positions.

## 9. Architectural role

The route is infrastructure.

It should be:

- accessible;
- legible to maintainers;
- subordinate to the room's architectural order;
- resolved as an intentional architectural interface where visible.

This directly reflects the Long-Life House principle:

> accessible does not mean visually exposed or carelessly technical.

The exact skirting/profile language remains architectural design work.

## 10. Workmanship / tolerance

The family needs:

- controlling room datum;
- supported mounting substrate;
- declared route envelope;
- supported bend/corner/junction conditions;
- supported cover/fixing tolerances;
- inspection before any concealment.

Out-of-range wall/floor geometry should trigger:

- local remediation;
- supported adjustment;
- or explicit redesign.

Do not force the service enclosure to hide major building-setting-out defects.

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

## 12. S1 application

S1 SR-R01:

- source from hall spine;
- entry through non-loadbearing west partition;
- low-level room route;
- four representative electrical/data points;
- simple hydronic emitter H-01;
- no external-masonry chasing.

Therefore:

**SERVICE TOPOLOGY: PASS**

**DOCTRINE / PERMANENT FABRIC: PASS**

**ACCESSIBILITY CONTRIBUTION: PASS at frozen positions**

**PHYSICAL ENCLOSURE PRODUCT: UNSELECTED**

**ELECTRICAL / HYDRONIC DESIGN: EXTERNAL**

This is now a supported room-service route rather than a purely abstract service graph.

## 13. Mutations

### Move socket/control to inaccessible height

Part-M applicability may fail.

Route topology remains valid.

### Move route into external masonry chase

Long-Life House doctrine fails.

Structural/boundary obligations may also wake up.

### Place emitter near doorway

Room access/maintenance geometry may fail even if hydraulic design remains valid.

### Change west partition to loadbearing/fire-rated wall

The entry crossing is no longer the same supported simple partition crossing.

Generate a typed structural/fire penetration obligation.

### Add wet/high-consequence water service

This family does not automatically support domestic hot/cold-water distribution merely because it supports a heating branch.

Return:

**OUTSIDE CURRENT ROOM-SERVICE FAMILY / NEW SERVICE CLASS REQUIRED**

## 14. H1 posture

SR-ROOM-LOW-01 is suitable as an H1-v0 **supported semantic/route family with product and engineering evidence external**.

It resolves an important domain question:

> ordinary room services have a declared geography.

It does not claim to resolve all domestic services.
