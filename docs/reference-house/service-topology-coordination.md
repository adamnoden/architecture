# Reference House — Service Topology Coordination

**Status:** coordination brief / unresolved whole-house work  
**Method:** [`../patterns/service-topology-sequence.md`](../patterns/service-topology-sequence.md)  
**Purpose:** turn the Reference House's serviceability doctrine into explicit house-scale geometry without inventing detail before the plan is ready.

The existing [Vertical Bay Coordination](vertical-bay-coordination.md) establishes a preferred direction: horizontal services biased toward coherent spines, room distribution in wall-side/skirting zones, planned vertical routes, and deeper dedicated zones for ducts and drainage. This document owns the next house-scale coordination step.

It is intentionally a **brief, not a solved design**. No pattern is recorded as a Reference House occurrence until actual geometry exists.

---

## 1. Required base drawing

Before resolving service topology, establish a provisional whole-house plan/section set containing at minimum:

- site entrance and relevant boundaries;
- storeys and principal circulation;
- room identities and broad furniture/use assumptions where these affect service demand;
- primary structural grid / wall strategy;
- principal external openings;
- courtyard / roof / external-maintenance access geometry;
- external plant constraints;
- likely utility approach from the site.

The drawings may remain schematic. They must be spatially honest enough that route length, depth, access and replacement can be judged.

---

## 2. Service-demand overlay

Map demand before drawing routes.

For each room or external zone, record only consequential demand classes:

- potable / domestic water;
- soil / waste drainage;
- extract / ventilation;
- heating / cooling distribution where required;
- significant electrical demand;
- communications/data where route choice matters;
- controls / sensing where infrastructure is consequential;
- maintainable or replaceable equipment;
- credible failure/discharge points.

Classify rooms as **high**, **medium** or **low** service intensity. Do not turn this into a full MEP schedule yet.

### Gate

If the house plan cannot identify its high-service zones, it is too early to draw the service network.

---

## 3. `HSA-P-001` — Controlled Utility Entry

Select a credible project occurrence only after checking supplier/site constraints.

Record:

- approach direction for water, electricity and communications;
- whether entries can be grouped or must remain separate;
- external-to-internal boundary transitions;
- principal isolation location;
- spare capacity, if any, and why it is justified;
- relationship to external maintenance and future excavation;
- relationship to the plant/service hub.

### Rewind trigger

If the credible entry geometry damages a principal room, major axis, weather strategy or external maintenance route, change the plan/site organisation rather than hiding the conflict in joinery.

---

## 4. `HSA-P-002` — Plant Room as Service Hub

Place the actual hub and draw its working/replacement geometry.

Record:

- room/zone dimensions;
- external delivery/replacement path;
- door clear opening;
- drainage / water-failure provision;
- ventilation / heat rejection;
- acoustic relationship to bedrooms and principal rooms;
- major plant classes expected, without premature product lock-in;
- relationship to vertical and horizontal distribution.

### Rewind trigger

A leftover cupboard with no replacement path is not an occurrence of the pattern. If the hub cannot be placed well, change the plan while that remains cheap.

---

## 5. Vertical distribution — open pattern candidate

Draw at least two credible vertical-distribution options before naming a preferred route.

Test:

- stacking of bathrooms / utility / kitchen where relevant;
- drainage fall and branch length;
- duct dimensions and bends;
- fire/acoustic cavity closure;
- access value versus area cost;
- structural crossings;
- relation to stairs/circulation;
- whether one riser, several smaller routes or no dedicated riser is actually better.

This work will supply evidence for or against admitting a **Vertical Service Riser** pattern.

Do not assign a pattern ID until the admission test is passed.

---

## 6. `HSA-P-004` — High-Service-Room Service Wall

On each high-service room, mark candidate service-wall edges and dry-side access opportunities.

For each candidate, record:

- fixtures/components served;
- access side;
- wall depth consumed;
- acoustic/privacy consequence;
- waterproofing/boundary relationship;
- working and withdrawal geometry;
- whether the candidate actually consolidates enough maintenance burden to justify itself.

### Rewind trigger

If nearly every high-service room needs a unique deep technical wall, revisit room adjacency and stacking first.

---

## 7. `HSA-P-003` — Horizontal Service Spine

Draw the primary horizontal distribution topology only after the demand nodes, hub and vertical options are visible.

At concept scale show:

- route origin / destination;
- real depth bands, not centre lines;
- ducts and gravity drainage at credible sizes/falls;
- branch points;
- maintenance access locations;
- boundary crossings;
- places where route depth changes;
- routes deliberately excluded from principal rooms or structural zones.

Compare at least one alternative topology if the preferred route creates a large technical void or repeated crossings.

### Rewind trigger

Excessive depth, branch length or bespoke crossing count is evidence against the upstream topology, not merely a detailing challenge.

---

## 8. `HSA-P-005` — Designed Structural Penetration

Once route topology is credible, derive a crossing register.

For each crossing record:

- service route / system;
- host element;
- location and provisional opening envelope;
- structural owner/evidence required;
- boundary roles crossed;
- reinstatement obligations;
- inspection/access requirement where relevant;
- whether the crossing can be eliminated by a small route adjustment.

Do not turn every crossing into a custom detail until repeatable families are identified.

---

## 9. Water-failure strategy

Apply Principle 4 to the actual selected routes.

For each relevant segment or joint class, decide which response is proportionate:

- eliminate concealed joints;
- make the route accessible;
- use withdrawable / pipe-in-pipe distribution;
- provide local containment;
- provide passive drainage / visible discharge;
- provide sensing / automatic isolation as an additional layer;
- accept ordinary concealed routing where consequence and evidence justify it.

This comparison should determine whether current Core Pattern 06 remains one pattern or becomes a strategy above several narrower patterns.

---

## 10. `HSA-P-012` — Physical Service Index

Once topology stabilises, establish stable service identities shared between:

- drawings;
- physical labels;
- isolation points;
- commissioning records;
- digital building record;
- future change records.

Locate the physical index where service activity naturally begins, likely but not necessarily in the service hub.

The physical record stays deliberately small.

---

## 11. Pattern occurrence register

When geometry exists, begin a Reference House occurrence table.

| Occurrence | Pattern | Location | Implementation family | Evidence state | Notes |
|---|---|---|---|---|---|
| _not yet assigned_ | `HSA-P-001` | — | — | — | utility entry unresolved |
| _not yet assigned_ | `HSA-P-002` | — | — | — | hub unresolved |
| _not yet assigned_ | `HSA-P-003` | — | — | — | horizontal route unresolved |
| _not yet assigned_ | `HSA-P-004` | — | — | — | service-wall locations unresolved |
| _not yet assigned_ | `HSA-P-005` | — | — | — | crossings derive later |
| _not yet assigned_ | `HSA-P-012` | — | — | — | stewardship identity derives later |

Do **not** populate this table merely because the Reference House intends to use a pattern. An occurrence requires identifiable project geometry or information.

---

## 12. Completion gate

This coordination package is complete enough to rerun the pattern-language pilot when the project has:

1. a provisional whole-house plan/section;
2. service-demand overlay;
3. selected utility-entry occurrence;
4. selected service-hub occurrence with replacement geometry;
5. explicit vertical-distribution proposal and rejected alternative(s);
6. candidate/selected service-wall occurrences;
7. primary horizontal route with real depth/fall constraints;
8. representative crossing register;
9. water-failure strategy applied to actual routes;
10. initial occurrence register.

At that point rerun [`../development/service-topology-reference-house-trial.md`](../development/service-topology-reference-house-trial.md) and decide whether full pattern-corpus migration is authorised.
