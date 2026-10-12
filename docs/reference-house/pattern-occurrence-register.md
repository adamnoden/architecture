# Reference House — Pattern Occurrence Register

**Status:** canonical Reference House project-state register  
**Purpose:** distinguish patterns selected in principle from actual project occurrences, implementation directions and outstanding evidence obligations.

The Reference House is a worked interpretation of House Kernel. It is **not evidence for the pattern language**.

A House Kernel pattern appears here as a current occurrence only when the active house has enough geometry or information to identify what the occurrence actually is. A pattern may be relevant or selected in principle without yet having an occurrence.

## Current transition state

`RH-01` selected the compact courtyard morphology. `RH-02` established the 12.0 × 10.8 m ground-floor order and service flank. `RH-03` added the stair and four-bedroom upper order. `RH-04` coupled plan, section and elevation. `RH-05` established the short-span courtyard-ring structure. `RH-06 — Coordinate services and failure geography` has now traced the principal service routes, dimensioned the vertical service zone, created the first current crossing register and **deleted the conditional principal en-suite** because it could not reach the main wet stack proportionately.

The old F0 identifiers remain suspended provenance. Later gates issue new identities where the new project object is geometrically distinct.

Current service authority: [RH-06 Services and Failure Geography](service-topology-rh06.md).  
Current crossing authority: [RH-06 Service Crossing Register](service-crossing-register-rh06.md).

---

## 1. Current confirmed coordination occurrences

These are current project occurrences. Their presence does not imply technical validation.

| Occurrence | Canonical pattern | Current project object | Current implementation direction | Outstanding evidence / obligation |
|---|---|---|---|---|
| `RH-P001-02` | [`HSA-P-001 — Controlled Utility Entry`](../patterns/controlled-utility-entry.md) | `UE-01`, surrogate east/service-side entry into `G-PLANT-01` | water, electricity and communications grouped geographically but kept supplier-compliant and separately penetrated; principal isolation begins at service hub | real utility records/site approach; boundary details; supplier clearances; real-site handedness |
| `RH-P002-02` | [`HSA-P-002 — Plant Room as Service Hub`](../patterns/plant-room-service-hub.md) | `G-PLANT-01`, north part of `G-SVC-02` | dedicated plant/distribution room with internal service-gallery access, nominal 1000 mm external replacement opening target and direct relation to `SV-01` | actual plant classes/capacity; working/withdrawal volume; acoustics; heat rejection; drainage/failure design |
| `RH-P003-02` | [`HSA-P-003 — Coherent Horizontal Service Route`](../patterns/coherent-horizontal-service-route.md) | `DRY-G-01`, ground service/gallery → hall/perimeter | coherent dry/small-bore route through circulation and selected low-level/perimeter zones; not a mixed-services duct | exact containment/backplane geometry; fire/acoustic crossings; electrical/data/hydronic technical design |
| `RH-P003-03` | [`HSA-P-003 — Coherent Horizontal Service Route`](../patterns/coherent-horizontal-service-route.md) | `DRY-U-01`, upper gallery + south/north landings | dry vertical route leaves `SV-01`, then follows three-sided upper circulation before local bedroom branches | exact branch zones and separation; no conversion of structural floor into generic plenum |
| `RH-P004-03` | [`HSA-P-004 — High-Service-Room Service Wall`](../patterns/high-service-room-service-wall.md) | service edge of `G-KIT-02` | sink/dishwasher/isolation and other maintainable wet components biased toward short branch to `SV-01` / service geography | final kitchen layout; access/withdrawal; acoustic/fire/water boundaries |
| `RH-P004-04` | [`HSA-P-004 — High-Service-Room Service Wall`](../patterns/high-service-room-service-wall.md) | west/inner edge of `U-BATH-01` adjoining `U-GAL-02` | dry-side access to selected concealed bathroom components; waterproofing independent of access panel | final fixture layout; waterproofing; privacy/acoustics; withdrawal geometry; fire closure |
| `RH-P005-07..12` | [`HSA-P-005 — Designed Structural Penetration`](../patterns/designed-structural-penetration.md) | `PEN-UE-01`, `PEN-SV-01`, `PEN-FD-01`, `PEN-KX-01`, `PEN-BX-01`, `PEN-HS-01` | explicit utility, riser, foul, extract and conditional plant-crossing family; no routine drilling of `EB-*` beams or courtyard reaction nodes | structural sizing/detail; boundary/fire/acoustic/weather obligations; see crossing register |
| `RH-P010-01` | [`HSA-P-010 — Source-Capture Kitchen Extract`](../patterns/source-capture-kitchen-extract.md) | `KX-01`, kitchen → east/service-side wall | short dedicated cooker-hood duct directly to outside; no shared riser or joist-zone grease route | final hood/duct pressure-loss design; cleaning access; nuisance/terminal position; site handedness |
| `RH-P012-02` | [`HSA-P-012 — Physical Service Index`](../patterns/physical-service-index.md) | internal approach to `G-PLANT-01` | durable small index sharing stable IDs with drawings / isolation / commissioning record | final service IDs and installed topology; physical format/detail |
| `RH-P014-02` | [`HSA-P-014 — Accessible Vertical Service Zone`](../patterns/accessible-vertical-service-zone.md) | `SV-01`, stacked `G-PLANT-01 → U-BATH-01` zone | approx. **900 × 700 mm clear** accessible service reservation; 100 mm-class soil/vent stack, water, optional small-bore hydronic and segregated dry route; framed opening approx. 1050 × 850 mm as engineering starting envelope | fire/acoustic compartmentation; pipe supports; final opening; service separation; roof termination; technical sizing |
| `RH-P021-01` | [`HSA-P-021 — Source-Capture Bathroom Extract`](../patterns/source-capture-bathroom-extract.md) | `BX-01`, family bathroom → east/service-side wall | short high-level direct-to-outside extract route; avoids floor/riser where duct is unnecessary | fan/duct selection; whole-dwelling ventilation strategy; condensate/acoustics/terminal relationship |

These are **coordination occurrences**, not validated construction details.

---

## 2. RH-06 programme deletion

The former conditional `U-ENS-01` is removed from the active house and replaced by `U-DRESS-01` principal dressing / linen / storage.

Reason: serving an en-suite from the primary stack would require an east–west gravity branch through the north-centre framing, a lowered technical bulkhead, or a second permanent soil stack. RH-06 finds that burden disproportionate.

No bathroom service-wall, extract or drainage occurrence is created for the deleted en-suite.

Reintroduction requires a new service-route proof and is therefore a brief/design change, not a partition tweak.

---

## 3. Suspended pre-RH-01 coordination occurrences

The previous F0 objects remain as provenance only.

| Suspended occurrence | Pattern | F0 object | Current disposition |
|---|---|---|---|
| `RH-P001-01` | `HSA-P-001` | east utility entry into old `G-SVC-01` | superseded by new surrogate object `RH-P001-02` |
| `RH-P002-01` | `HSA-P-002` | old north-east service hub | superseded by `RH-P002-02` / `G-PLANT-01` |
| `RH-P014-01` | `HSA-P-014` | old east/rear stacked service zone | superseded by `RH-P014-02` / `SV-01` |
| `RH-P004-01` | `HSA-P-004` | old kitchen service edge | superseded by `RH-P004-03` |
| `RH-P004-02` | `HSA-P-004` | old bath/en-suite service edge | family-bath part superseded by `RH-P004-04`; en-suite part rejected |
| `RH-P003-01` | `HSA-P-003` | old east/rear + landing route | superseded by distinct `RH-P003-02` and `RH-P003-03` dry routes |
| `RH-P005-01..06` | `HSA-P-005` | old F0 crossing family | obsolete geometry; replaced by RH-06 crossing family `RH-P005-07..12` |
| `RH-P012-01` | `HSA-P-012` | old service index | superseded by `RH-P012-02` |

Suspension does not reject the canonical patterns. It prevents obsolete geometry retaining false authority.

---

## 4. Selected strategies

### Fail-Safe Water Distribution

The house continues to select [Fail-Safe Water Distribution](../patterns/strategies/fail-safe-water-distribution.md). RH-06 now applies it to actual route classes:

- `WF-01` plant/isolation geography — accessible joints and isolation; significant leakage made visible/manageable; sensing optional, not sole defence;
- `WF-02` riser — joint-minimised vertical runs; accessible branch ends; pipe-in-pipe/withdrawable family remains a comparator;
- `WF-03` kitchen/utility — short branches, accessible appliance joints/valves, local visible failure response;
- `WF-04` bathroom — dry-side maintainable components, short concealed finals, waterproofing independent of access;
- `WF-05` soil/waste — accessible stack base/rodding and short gravity branches.

No manifold pattern is selected merely because the service hub exists.

### Structural / floor strategies

[Decompose Structural Interface Functions](../patterns/strategies/decompose-structural-interface-functions.md) and [Separate Structural Floor from Changeable Layers Where Proportionate](../patterns/strategies/separate-structural-floor-changeable-layers.md) remain active project strategies. RH-05/RH-06 now make the boundary explicit:

- structural deck/joists/edge beams remain primary structure;
- service routes move around protected structure except at registered crossings;
- any later removable access layer remains non-structural.

---

## 5. Selected intent without a confirmed occurrence

| Pattern | Current Reference House intent | Missing before occurrence |
|---|---|---|
| [`HSA-P-007 — Permanent Opening / Replaceable Window`](../patterns/permanent-opening-replaceable-window.md) | representative windows should permit credible full-frame replacement | frame/subframe geometry, handling/withdrawal route |
| [`HSA-P-009 — Accessible Rainwater Route`](../patterns/accessible-rainwater-route.md) | roof and courtyard rainwater systems inspectable/maintainable | RH-08 roof/drainage layout |
| [`HSA-P-011 — Roof Maintenance Route`](../patterns/roof-maintenance-route.md) | roof tasks mapped to a designed access route | RH-08 roof form/task geometry |
| [`HSA-P-013 — Ground-Supported Façade Access`](../patterns/ground-supported-facade-access.md) | ordinary external/courtyard façade maintenance remains possible | developed landscape/elevation/support zones |

The source-capture kitchen and bathroom extract patterns are omitted because RH-06 now creates current occurrences.

---

## 6. Patterns not yet selected merely because they exist

Likely later relevance is not occurrence. This currently includes:

- `HSA-P-008` Movement / Slip Junction;
- `HSA-P-015` Accessible Room Service Route beyond the current `DRY-*` topology;
- `HSA-P-016` Compartmented Service Void;
- `HSA-P-017` Visible Leakage Path;
- `HSA-P-018` Failure-Tolerant Wet Service Room;
- `HSA-P-019` Permanent Opening / Replaceable Door;
- `HSA-P-020` Designed Threshold;
- `HSA-P-022` Controlled Attachment Plane.

Some may become project occurrences at RH-08/RH-09. Do not pre-assign them.

---

## 7. Held candidates

Held candidates remain outside the canonical language even when the Reference House is interested in them.

- [Replaceable Architectural Lining](../patterns/candidates/replaceable-architectural-lining.md) — P01 wall-bay evidence gate.
- [Individually Isolatable Manifold Distribution](../patterns/candidates/individually-isolatable-manifold-distribution.md) — remains held; RH-06 selects accessible isolation geography, not a manifold topology.
- [Local Deep Service Zone](../patterns/candidates/local-deep-service-zone.md) — use only if actual routes prove a recurring need.
- [Selective Floor Access](../patterns/candidates/selective-floor-access.md) — P02 physical floor research.

No `RH-P*` identity is assigned to a held candidate.

---

## 8. Rejected / rewound moves still controlling design

The reasons remain live even where original geometry has changed:

1. universal mixed-services duct;
2. scattered upper wet rooms without route proof;
3. plant hidden in ordinary kitchen cabinetry;
4. blanket leak containment everywhere;
5. courtyard crossing as the only ordinary front-to-rear route;
6. one undifferentiated rear great room by default;
7. steep/winder stair used merely to protect a simple plan;
8. service hub displaced to accommodate stair;
9. full four-sided upper courtyard gallery;
10. whole-house independent structural frame by default;
11. long-span floor across major house dimensions;
12. every room partition made loadbearing;
13. primary beams/courtyard reaction nodes treated as future service chases;
14. **remote principal en-suite bought with a second stack / cross-joist gravity route** — rejected at RH-06;
15. **speculative MVHR ducts stuffed into `SV-01` or joist zones before RH-07 selects a ventilation system** — rejected as premature infrastructure.

---

## 9. Update rule

Update this register when:

- RH-07 selects an environmental / whole-dwelling ventilation family and creates real duct routes;
- RH-08 creates rainwater / roof-access occurrences;
- RH-09 creates occupied-surface/interface occurrences;
- a route, crossing, pattern occurrence or strategy materially changes;
- a real site invalidates surrogate utility/service-side coordinates;
- specialist review changes the technical feasibility of an occurrence.

When an old identifier is reused, ensure the underlying project object is recognisably the same. Otherwise issue a new identity and leave the old object as provenance.

Do not update general pattern evidence or maturity merely because this house uses a pattern.