# Reference House — Service Topology Run 01

**Status:** Phase-5 coordination run against [Whole-House Coordination Fixture 01](whole-house-coordination-fixture.md)  
**Method:** [`../patterns/service-topology-sequence.md`](../patterns/service-topology-sequence.md)  
**Purpose:** test whether the pilot pattern language and generative sequence can produce a coherent service topology on an actual courtyard-house geometry without overriding architecture or inventing technical proof.

This is not an MEP design. Route envelopes, plant sizes and technical performance remain provisional until competent design and product selection exist.

---

# 1. Result in one sentence

**The courtyard house can support a coherent service topology if high-consequence wet, gravity and extract routes remain concentrated at the east/rear service core and the rest of the house receives only proportionate low-level dry/small-bore distribution.**

The run does not require a whole-storey technical void, duplicated wet cores or routine service routing through structural floor members.

---

# 2. S1 — Service-demand overlay

## High intensity

### `G-KIT-01`

- hot/cold water;
- waste;
- cooking source capture;
- significant electrical demand;
- possible hydronic emitter/control;
- maintainable appliances.

### `G-SVC-01`

- incoming utilities;
- plant/service hub;
- utility appliances;
- WC / soil-waste;
- primary isolation/distribution;
- likely heating/hot-water plant;
- drainage/failure handling;
- service index.

### `BATH-01` / `ENS-01`

- hot/cold water;
- soil/waste where applicable;
- shower/basin/bath wastes;
- normal extract;
- waterproofing penetrations;
- high maintenance consequence.

### `U-SVC-01`

- riser head/access;
- possible ventilation-assist access;
- dry-side access to selected bathroom services;
- stewardship/maintenance support.

## Medium intensity

- `G-HALL-01` / `L-01`: electrical/data/control distribution and selected low-level route continuity;
- `G-FAM-01`, `G-DRAW-01`, `G-STUDY-01`, bedrooms: electrical/data and heating/cooling distribution if required;
- courtyard: drainage, lighting and external water point only if justified.

## Low intensity

Principal occupied rooms remain deliberately free of primary wet/service infrastructure.

### S1 finding

The fixture passes the demand-map gate. High-service demand is strongly clusterable on the east/rear side. No rewind is required at this stage.

---

# 3. S2 — `HSA-P-001` Controlled Utility Entry

## Selected occurrence — `RH-P001-01`

**Location:** east external wall of `G-SVC-01`, reached from the south-east/front boundary along the east service side.

The selected arrangement keeps incoming water, electrical and communications geography adjacent without requiring one literal shared hole. Supplier-required separation remains authoritative.

### Architectural consequences

- no utility entry through a principal south/front room;
- no route across the courtyard;
- future excavation remains on the service side rather than beneath principal entrance paving where practical;
- main isolation begins in `G-SVC-01`;
- boundary crossings are concentrated in a secondary elevation.

### Rewind test

**PASS for the coordination assumption.**

If actual utility records force approach from another side, this occurrence is invalidated and the sequence rewinds to site/plan coordination. The pattern survives; this occurrence may not.

---

# 4. S3 — `HSA-P-002` Plant Room as Service Hub

## Selected occurrence — `RH-P002-01`

**Location:** north-east portion of `G-SVC-01` against the east external wall.

### Coordination reservation

Use approximately **2,400 × 2,700 mm** as a test reservation for plant/working geometry, not a final room size.

The room/zone should have:

- direct external replacement access to the east service side;
- nominal **1,000 mm** clear replacement opening as a coordination target, subject to selected plant;
- internal access from the back/service hall;
- floor/drainage strategy for credible leakage;
- acoustic separation from principal bedrooms and sitting rooms;
- lighting and durable working surfaces;
- clear relationship to utility entry, vertical service zone and low-level distribution origin.

Likely classes include heating/hot-water plant, distribution manifolds/valves, electrical/data distribution interfaces and controls. Products remain unselected.

### Rewind test

**PASS.** The hub is not leftover cupboard space and has a direct replacement path. It consumes real area, which remains a later proportionality target.

---

# 5. S4 — Vertical distribution options

The fixture exposes a genuine vertical-design decision. Three options were tested.

## Option A — one accessible vertical service zone — **preferred for coordination**

Reserve approximately **900 × 700 mm clear** beside the courtyard/east-rear service geography, rising:

```text
G-SVC-01
    ↓/↑
RH-CAND-VSR-01
    ↓/↑
U-SVC-01
    ↓/↑
selected rear/north roof terminal zone where required
```

The reservation is deliberately larger than a soil stack chase because it must test whether several distinct systems can share geography while remaining segregated, supported, inspectable and boundary-controlled.

Potential contents, subject to technical design:

- soil/waste stack;
- hot/cold distribution risers;
- hydronic flow/return if selected;
- ventilation extract/passive stack routes where compatible;
- electrical/data vertical routes in appropriately separated sub-zones.

**Not implied:** every system shares one enclosure without separation, or every component remains continuously accessible.

### Strengths

- one planned floor crossing family;
- direct adjacency to lower and upper high-service zones;
- useful dry-side access from service-support spaces;
- short gravity branches;
- roof termination can stay on secondary/rear geometry;
- strong stewardship legibility.

### Costs / risks

- area cost;
- fire/acoustic cavity treatment;
- service separation;
- concentration of penetrations and supports;
- temptation to fill spare space with unrelated services.

## Option B — split wet stack + dry riser

Use a small wet/soil zone close to bathrooms and a separate dry electrical/data/hydronic riser nearer the landing/plant room.

### Strengths

- easier separation of some service classes;
- smaller local enclosures;
- less chance that one shaft becomes an uncontrolled mixed void.

### Costs

- more floor crossings;
- more access points;
- weaker whole-house legibility;
- increased chance of later unplanned vertical routes.

## Option C — no dedicated vertical zone

Route each system independently through service walls/ceiling/floor zones.

### Finding

**Rejected for this fixture.** It saves the explicit riser reservation but multiplies permanent crossings and makes future alteration harder to understand. It is still a legitimate option for smaller/single-storey houses.

## S4 decision

**Select Option A provisionally. Keep Option B as the principal comparator.**

The sequence therefore supplies enough real context to develop the missing pattern candidate as **Accessible Vertical Service Zone** rather than presuming a commercial-scale “riser”.

No HSA pattern ID is assigned yet.

---

# 6. S5 — `HSA-P-004` High-Service-Room Service Wall

## Ground occurrence — `RH-P004-01`

**Kitchen north/service edge**, shared with `G-SVC-01`.

Bias sink, dishwasher isolation, selected appliance connections and other maintainable wet components toward this edge where kitchen design permits.

Dry-side or adjacent access is available from the service zone for components that benefit from it. The kitchen remains a kitchen, not a visible technical room.

### Why it earns its depth

It consolidates multiple water/electrical/maintenance loads and shortens the branch to the vertical core.

## Upper occurrence — `RH-P004-02`

**Bathroom/en-suite service edge** adjoining `U-SVC-01` / landing-side service geography.

Bias concealed cisterns, isolation, shower controls and other selected maintainable components toward dry-side access where practical.

Waterproofing remains independent of routine access-panel opening.

## Rejected service-wall locations

- principal drawing-room walls;
- west-side bedroom walls merely to simplify electrical routing;
- courtyard elevations as a general access-panel field.

## S5 rewind test

**PASS.** Two concentrated service-wall occurrences do substantial work. The fixture does not require a unique deep wall in every wet room.

---

# 7. S6 — `HSA-P-003` Horizontal Service Spine

The run shows that **one universal horizontal spine is the wrong interpretation**.

Different systems need different topology.

## `HS-G-01` — ground east service route

Origin: `RH-P002-01` plant/service hub.

Runs through the service-heavy east/rear geography and connects:

- kitchen service wall;
- vertical service zone;
- utility/WC;
- low-level dry/small-bore distribution branches.

Coordination envelope:

- approximately **200–300 mm deep** where a removable joinery/wall-side zone is actually required;
- smaller where ordinary skirting/backplane routes suffice.

This route is **not** a soil-drainage duct and does not receive the kitchen grease-extract duct.

## `HS-U-01` — upper east/landing service route

Connects the vertical zone to bathroom/en-suite service walls and any justified upper dry distribution.

Keep it within service-support/landing geography rather than principal bedroom wall fields where practical.

## `LB-01` — low-level room distribution

Electrical/data and, if the chosen heating system makes it sensible, small-bore hydronic branches may continue around selected room edges in accessible skirting/backplane geography.

This is a local branch network, not permission to turn every skirting into congested trunking.

## Services deliberately excluded from the horizontal spine

- **soil/waste:** kept at the east/rear wet core with only short gravity branches;
- **kitchen source capture:** direct east-wall discharge;
- **major ventilation stacks:** predominantly vertical at the core;
- **routine future services:** not routed through structural joist zones as a default.

## S6 finding

**PASS, with a taxonomy note.** `HSA-P-003` works if understood as a coherent horizontal distribution **topology**, not a single mixed-services duct. During Phase 6, test whether “Horizontal Service Spine” should be renamed or clarified as **Coherent Horizontal Service Route**.

No rename occurs during this gated pilot.

---

# 8. S7 — `HSA-P-005` Designed Structural Penetrations

The selected topology produces a short representative crossing register rather than dozens of ad-hoc holes.

| ID | Crossing | Host / location | Main obligations | Can route eliminate it? |
|---|---|---|---|---|
| `CP-01` | utility-entry group | east external wall / `G-SVC-01` | structure as applicable; weather; air; thermal; moisture; pest; security; supplier separation | no, but entries may remain adjacent rather than one opening |
| `CP-02` | external plant / hydronic connection | east wall / plant hub | weather; air; thermal; vibration/support; maintenance | no if external plant selected; location can move locally |
| `CP-03` | kitchen source-capture duct | east wall / `G-KIT-01` | weather; air; thermal; grease/fire as applicable; cleaning; external nuisance | direct wall route deliberately avoids longer internal crossing |
| `CP-04` | vertical service-zone floor opening | `G-SVC-01` → `U-SVC-01` | structural trimming/support; fire/acoustic cavity control; service support; inspection | topology requires one controlled opening; split-riser option would multiply it |
| `CP-05` | selected roof terminal(s) | north/rear roof zone | structure; weather; air/thermal; condensate; maintenance; terminal separation | technical design may reduce/count differently |
| `CP-06` | low-level branch transition into south wing | south-east permanent/support line as resolved | structure; acoustic/fire where applicable; sleeve/route capacity; no-drill control | may be removed if later structural plan supplies a non-structural route |

### S7 rewind test

**PASS provisionally.** The topology creates a small number of repeatable crossing families. `CP-06` is deliberately flagged as the weakest crossing and should disappear if architectural/structural coordination can keep low-level distribution within non-structural joinery zones.

---

# 9. S8 — Water-failure strategy on actual route classes

The run confirms that the current `Water-Damage-Safe Service Route` material describes a **strategy/performance family**, not one invariant physical pattern.

Different parts of the selected topology need different responses.

## `WF-01` — plant/manifold geography

Preferred response:

- all joints accessible;
- local isolation;
- floor/containment geometry capable of revealing and managing credible leakage;
- drain or safe visible discharge where justified;
- leak sensing / automatic isolation as an additional layer, not the only defence.

## `WF-02` — concealed vertical pressurised-water run

Preferred response to investigate:

- continuous/joint-minimised run;
- pipe-in-pipe or withdrawable/sleeved approach where practical;
- leakage directed/detectable at an accessible end/base;
- accessible isolation upstream.

## `WF-03` — kitchen/utility branches

Preferred response:

- short route;
- joints kept in accessible service-wall/cabinet geography;
- local appliance isolation;
- no need for a continuous metal trough merely to satisfy doctrine.

## `WF-04` — bathroom branches

Preferred response:

- valves/joints biased to dry-side service geography;
- concealed final runs minimised and joint-free where practical;
- wet-zone waterproofing remains a separate boundary system;
- credible leaks do not rely on tile/grout to protect construction.

## `WF-05` — soil/waste drainage

Preferred response:

- accessible stack/base/rodding;
- short gravity branches;
- deliberate cleanout/inspection;
- tested joints and support;
- no generic “containment tray” abstraction applied to drainage merely because it works for pressurised water.

## S8 classification decision

**Reclassify `Water-Damage-Safe Service Route` as a strategy in the upcoming corpus audit unless contrary evidence appears.**

Do not yet invent child-pattern IDs. The actual recurring children should emerge from broader corpus/precedent review.

---

# 10. S9 — `HSA-P-012` Physical Service Index

## Selected occurrence — `RH-P012-01`

Locate the restrained physical index in `RH-P002-01`, on the internal approach wall near the plant-room/service-hub entrance.

Initial stable identities should cover:

- `UE-*` utility entries / main isolation;
- `PL-*` principal plant;
- `VZ-*` vertical service zone;
- `HS-*` primary horizontal routes;
- `ISO-*` principal isolation groups;
- `DR-*` drainage/rodding points;
- `PEN-*` significant penetrations;
- later maintainable components where a physical identifier materially helps.

The index should not become a duplicate O&M manual.

### S9 finding

**PASS.** The sequence correctly places stewardship after topology, while leaving enough time for IDs to become shared source information rather than handover labels.

---

# 11. Initial occurrence register

| Occurrence | Pattern / candidate | Location | Implementation direction | Evidence state |
|---|---|---|---|---|
| `RH-P001-01` | `HSA-P-001` Controlled Utility Entry | east wall / `G-SVC-01` | adjacent coordinated utility transitions | pattern supported; project geometry provisional |
| `RH-P002-01` | `HSA-P-002` Plant Room as Service Hub | north-east `G-SVC-01` | dedicated maintainable plant room/zone with external replacement path | pattern established; plant sizing external |
| `RH-CAND-VSR-01` | candidate Accessible Vertical Service Zone | east-rear stacked service geography | one accessible segregated vertical zone; split-riser comparator retained | candidate only; no HSA ID |
| `RH-P004-01` | `HSA-P-004` High-Service-Room Service Wall | north edge of `G-KIT-01` | dry/adjacent-side accessible service wall | supported; detailed kitchen unresolved |
| `RH-P004-02` | `HSA-P-004` High-Service-Room Service Wall | `BATH-01` / `ENS-01` against service-support geography | dry-side bathroom service access | supported; wet-zone detailing external |
| `RH-P003-01` | `HSA-P-003` Horizontal Service Spine | east/rear + landing distribution topology | coherent service routes split by service class | supported; route dimensions provisional |
| `RH-P005-01..06` | `HSA-P-005` Designed Structural Penetration | `CP-01..06` | controlled crossing families | structural/boundary proof external |
| `RH-P012-01` | `HSA-P-012` Physical Service Index | plant/service hub approach | durable local index + richer digital record | proposed pattern; project occurrence plausible |

These are **coordination occurrences**, not validated construction.

---

# 12. Rewind events actually tested

A generative sequence is useful only if it can reject tempting local solutions.

## Rewind A — universal mixed-services spine

**Rejected.** A single deep horizontal duct carrying drainage, ventilation, power, data and water around the courtyard would consume ceiling/floor depth and create unnecessary boundary/acoustic problems.

**Upstream correction:** cluster gravity/extract/wet demand at the east/rear core and let only appropriate services fan out.

## Rewind B — scattered upper wet rooms

**Rejected.** Moving a family bathroom to the west wing would create long drainage/ventilation branches or another vertical route.

**Upstream correction:** retain bathroom/en-suite service demand in the east/rear band unless a later architectural reason is strong enough to pay the service cost deliberately.

## Rewind C — hidden plant cupboard

**Rejected.** Absorbing plant into ordinary kitchen cabinetry would save a room boundary but destroy replacement/working geometry and stewardship clarity.

**Upstream correction:** preserve a real service-hub reservation with external replacement path.

## Rewind D — “safe water” by continuous containment everywhere

**Rejected.** The actual topology permits accessible joints, short branches and joint-minimised risers. Blanket troughing would add complexity and material where the route can instead be made intrinsically safer.

---

# 13. Phase-5 technical unknowns deliberately left open

This run does **not** prove:

- actual utility supplier approach;
- plant-room final dimensions or equipment fit;
- ventilation strategy/performance;
- heating system or pipe sizes;
- drainage sizes/falls;
- structural capacity around `CP-*` openings;
- fire/acoustic treatment of the vertical zone;
- waterproofing details;
- actual service separation requirements;
- courtyard drainage capacity;
- whole-life cost/carbon proportionality.

Those are later design/evidence obligations, not excuses to keep the architectural topology undefined.

---

# 14. Phase-5 sequence finding

The sequence has now done more than restate the catalogue:

1. it forced real utility-entry and plant-hub occurrences;
2. it exposed and compared vertical-service alternatives;
3. it kept high-service rooms clustered through an explicit rewind test;
4. it rejected a seductive but excessive universal service spine;
5. it reduced the crossing problem to a small register;
6. it demonstrated why water-failure material belongs above several different physical responses;
7. it created an occurrence register that distinguishes pattern selection from evidence.

The remaining Phase-5 question is therefore no longer “can the sequence be run?” It is:

> **Did the run expose enough genuine composition, conflict and taxonomy correction to justify auditing the rest of the corpus?**

The accompanying Phase-5 review should answer that explicitly rather than treating completion of this document as an automatic pass.