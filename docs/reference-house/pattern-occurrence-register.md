# Reference House — Pattern Occurrence Register

**Status:** canonical Reference House project-state register through RH-10  
**Purpose:** distinguish patterns selected in principle from actual project occurrences, implementation directions and outstanding evidence obligations.

The Reference House is a worked interpretation of House Kernel. It is **not evidence for the pattern language**.

A pattern appears here as a current occurrence only when the active house has enough geometry or information to identify the project object. Project use does not increase general pattern evidence or maturity.

## Current transition state

`RH-01` selected the compact courtyard morphology. `RH-02` established the 12.0 × 10.8 m ground-floor order and service flank. `RH-03` added the stair and four-bedroom upper order. `RH-04` coupled plan, section and elevation. `RH-05` established the short-span courtyard-ring structure. `RH-06` traced principal services and deleted the remote principal en-suite. `RH-07` retained the courtyard as a shaded light court and selected central MVHR. `RH-08` selected outward-draining roof / drainage / maintenance geography. `RH-09` fixed the occupied-interface hierarchy. `RH-10 — Whole-house coordination audit` has now reconciled those layers, added the previously missing heating/DHW/renewable-energy topology, stress-tested the envelope at 450 mm, completed the outer elevation order and resolved the RH-04/RH-08 roof-authority conflict.

**Reference House maturity is now M3 at coordinated virtual-design scope.** This does not constitute engineering, prototype or external validation.

Current whole-house authority: [RH-10 Whole-House Coordination Audit](whole-house-coordination-audit.md).  
Current energy/heat authority: [RH-10 Energy, Heating and Renewable Coordination](energy-heat-coordination-rh10.md).  
Current envelope authority: [RH-10 Envelope Coordination](envelope-coordination-rh10.md).  
Current outer-elevation authority: [RH-10 Outer Elevation Coordination](outer-elevation-coordination-rh10.md).  
Current occupied-interface authority: [RH-09 Tectonic Integration](tectonic-integration-rh09.md).  
Current crossing authority: [Service Crossing Register](service-crossing-register-rh06.md), current through RH-10.

---

## 1. Current confirmed coordination occurrences

These are current project occurrences. Their presence does not imply technical validation.

| Occurrence | Canonical pattern | Current project object | Current implementation direction | Outstanding evidence / obligation |
|---|---|---|---|---|
| `RH-P001-02` | [`HSA-P-001 — Controlled Utility Entry`](../patterns/controlled-utility-entry.md) | `UE-01`, surrogate east/service-side entry into `G-PLANT-01` | water, electricity and communications grouped geographically but separately penetrated; principal isolation begins at service hub | real utility records/site approach; supplier clearances; boundary details; handedness |
| `RH-P002-02` | [`HSA-P-002 — Plant Room as Service Hub`](../patterns/plant-room-service-hub.md) | `G-PLANT-01` | dedicated 2.9 × 2.2 m gross plant/distribution room with internal working access and nominal 1000 mm external replacement opening; RH-10 now expects MVHR + DHW/hydraulics + dry controls + riser access | product-level packing; working/withdrawal space; acoustics; heat rejection; water-failure design |
| `RH-P003-02` | [`HSA-P-003 — Coherent Horizontal Service Route`](../patterns/coherent-horizontal-service-route.md) | `DRY-G-01` | dry/small-bore route through ground service/gallery and selected perimeter geography; not a mixed-services duct | exact containment; fire/acoustic crossings; electrical/data design |
| `RH-P003-03` | `HSA-P-003` | `DRY-U-01` | upper gallery / landing dry distribution before local room branches | exact branch zones and separation; no generic floor plenum |
| `RH-P003-04` | `HSA-P-003` | `HYD-G-01` | low-temperature ground heating flow/return from plant through service/gallery launch and bounded local low-level routes; joint-minimised concealed runs, accessible valves/joints | heat-loss design; pipe size; expansion/noise; fixing protection; exact route detail |
| `RH-P003-05` | `HSA-P-003` | `HYD-U-01` | low-temperature upper heating flow/return rises in service geography and follows landing/gallery territory before short room branches | heat-loss design; pipe size; structural/fire/acoustic route detail |
| `RH-P004-03` | [`HSA-P-004 — High-Service-Room Service Wall`](../patterns/high-service-room-service-wall.md) | service edge of `G-KIT-02` | wet/maintainable kitchen components biased toward short service-side branch | final kitchen layout; access/withdrawal; acoustic/fire/water boundaries |
| `RH-P004-04` | `HSA-P-004` | west/inner edge of `U-BATH-01` adjoining `U-GAL-02` | dry-side access to selected concealed bathroom components; waterproofing independent of access | fixture layout; waterproofing; privacy/acoustics; withdrawal geometry; fire closure |
| `RH-P005-07..11` | [`HSA-P-005 — Designed Structural Penetration`](../patterns/designed-structural-penetration.md) | utility/riser/foul/cooker-extract/fallback-bath-extract crossing family | explicit crossings; no routine drilling of `EB-*` beams or courtyard reaction nodes | structural sizing/detail and boundary obligations; see crossing register |
| `RH-P005-12` | `HSA-P-005` | `PEN-HS-01`, `ASHP-01` external heat-source crossing | existing RH-06 conditional heat-source sleeve family is now activated for local heat-pump flow/return + associated power/control/service connection | MEP sizing; weather/air/thermal detail; vibration; condensate/frost; isolation; replacement |
| `RH-P005-13` | `HSA-P-005` | `PEN-MV-01`, MVHR intake/exhaust crossing family | two short high-level east/service-wall routes preferred; roof route fallback | terminal separation; contamination/nuisance; condensation; weather/air/acoustic detail |
| `RH-P005-14` | `HSA-P-005` | `PEN-CD-01`, courtyard primary drain + independent overflow crossing family | two separately functioning conduits beneath east service/gallery geography | foundation/slab detail; settlement; rodding; threshold/overflow levels; hydraulic sizing |
| `RH-P005-15` | `HSA-P-005` | `PEN-SV-RF-01`, soil/vent roof penetration | one sparse roof service crossing on east/service roof field, kept clear of PV access and MVHR intake | flashing; structural/thermal/air detail; clearances |
| `RH-P005-16` | `HSA-P-005` | `PEN-PV-01`, photovoltaic electrical boundary crossing | dedicated roof-to-service electrical route toward accessible plant-room inversion/isolation; no avoidable active electronics beneath modules | roof/fire/electrical detail; segregation; safe isolation; final array/inverter design |
| `RH-P007-01` | [`HSA-P-007 — Permanent Opening / Replaceable Window`](../patterns/permanent-opening-replaceable-window.md) | `OW-01`, representative G-01 window-opening family | permanent masonry opening → mounting/tolerance zone → mechanically fixed replaceable frame → removable internal reveal/architrave; RH-10 adds emergency-egress duty to the four bedroom instances | jamb/head/sill mock-up; air/water/thermal continuity; fixing/withdrawal; actual escape free-opening geometry |
| `RH-P008-01` | [`HSA-P-008 — Movement / Slip Junction`](../patterns/movement-slip-junction.md) | `WCJ-01`, principal-room wall/ceiling junction | wall and ceiling terminate independently; cover fixed to one controlling assembly; no brittle bridge across intended movement | P04; quantified movement; fire/acoustic/air continuity; decoration sequence |
| `RH-P009-01` | [`HSA-P-009 — Accessible Rainwater Route`](../patterns/accessible-rainwater-route.md) | `RW-OUT-01`, outer roof rainwater system | four roof fields fall outward to inspectable external collection edges and side/rear return downpipes; RH-10 PV reserve must not obstruct inspection/drainage | hydraulic sizing; gutter/coping detail; design rainfall; final site discharge; PV coordination |
| `RH-P009-02` | `HSA-P-009` | `RW-COURT-01`, courtyard surface-water system | accessible court collector → short primary service-side drain + independent visible emergency overflow | hydraulic sizing; falls; threshold levels; sleeve/foundation detail; receiving drainage |
| `RH-P010-01` | [`HSA-P-010 — Source-Capture Kitchen Extract`](../patterns/source-capture-kitchen-extract.md) | `KX-01`, kitchen → service-side wall | short dedicated cooker-hood duct; independent of MVHR | hood/duct sizing; cleaning; nuisance/terminal location |
| `RH-P011-01` | [`HSA-P-011 — Roof Maintenance Route`](../patterns/roof-maintenance-route.md) | `RM-01` | no permanent hatch; planned external scaffold/tower provides roof arrival, working platform and edge protection; RH-10 PV adds module/mounting work without changing baseline access method | temporary-work selection; ground bearing; PV access zones; later tie/anchor assessment |
| `RH-P012-02` | [`HSA-P-012 — Physical Service Index`](../patterns/physical-service-index.md) | internal approach to `G-PLANT-01` | durable index sharing stable IDs with drawings/isolation/commissioning; RH-10 adds ASHP, hydronic and PV identities | final installed IDs and physical format |
| `RH-P013-01` | [`HSA-P-013 — Ground-Supported Façade Access`](../patterns/ground-supported-facade-access.md) | `FA-01`, external support geography + courtyard logistics/tower route | Category-A east/service strip, west/rear positions, garden-to-court route and viable court tower position; ASHP may not consume the sole useful side route | real-site boundaries/ground bearing; tower/scaffold envelopes; landscape replay; neighbour/highway dependence |
| `RH-P014-02` | [`HSA-P-014 — Accessible Vertical Service Zone`](../patterns/accessible-vertical-service-zone.md) | `SV-01` | approx. 900 × 700 mm clear reservation carrying soil/vent, water, segregated dry services, MVHR trunks and possible small-bore hydronic risers | fire/acoustic compartmentation; supports; final sizes; congestion/separation; roof termination |
| `RH-P015-01` | [`HSA-P-015 — Accessible Room Service Route`](../patterns/accessible-room-service-route.md) | `AR-01`, dry-room edge family | removable substantial timber skirting may carry bounded **dry** distribution; selected door/architrave/local datum provides declared vertical rise to accessible controls/outlets | electrical safe-zone/protection/separation; detail depth; furniture/access conflicts; P01 compatibility |
| `RH-P019-01` | [`HSA-P-019 — Permanent Opening / Replaceable Door`](../patterns/permanent-opening-replaceable-door.md) | `OD-01`, doorsets in genuinely permanent openings | permanent opening → fixing/adjustment zone → replaceable doorset → removable architrave; lightweight partitions remain simpler | fire/acoustic/security variants; fixing detail; replacement sequence; tolerance range |
| `RH-P020-01` | [`HSA-P-020 — Designed Threshold`](../patterns/designed-threshold.md) | `TH-01`, principal courtyard/garden external-opening family | quiet substantially flush wear/weather/movement interface only where construction changes | level access/weathering/drainage detail; doorset integration; material; replacement sequence |
| `RH-P020-02` | `HSA-P-020` | `TH-02`, principal entrance threshold | substantially level / visitable entrance interface coordinated with bay-3 entrance; weather, wear, air/thermal and replacement duties separated from decorative surround | real-site approach levels; M4(1) proof; weathering; doorset/security; final material/detail |
| `RH-P021-01` | [`HSA-P-021 — Source-Capture Bathroom Extract`](../patterns/source-capture-bathroom-extract.md) | high-level `U-BATH-01` moisture-source extract | central MVHR extract baseline; direct wall fan retained only as fallback | capture effectiveness; duct pressure/acoustics; condensate; commissioning |
| `RH-P022-01` | [`HSA-P-022 — Controlled Attachment Plane`](../patterns/controlled-attachment-plane.md) | `W1`, sparse architectural-datum fixing family | skirting grounds, architrave/jamb grounds, genuine picture-rail/hanging datum and local heavy-load plates; sparse documented anchors; not a whole-room rack | load classes/anchor design; safe/no-fix map; fire/acoustic consequences; P01 relationship |

These are **coordination occurrences**, not validated construction details.

---

## 2. Programme decisions that remain authoritative

### RH-06 — remote en-suite deleted

Former `U-ENS-01` is `U-DRESS-01` principal dressing / linen / storage. Reintroduction requires a new service-route proof.

### RH-07 — central MVHR selected conditionally

Central MVHR remains the whole-dwelling ventilation baseline. It is not House Kernel doctrine, does not create a generic floor plenum and does not replace purge windows. Continuous MEV remains fallback if competent design finds the burden disproportionate.

### RH-08 / RH-10 — outward-draining low roof selected

Four low-slope fields drain away from the courtyard to external collection. There is no inner court gutter, internal roof outlet or permanent roof hatch. RH-10 explicitly records that this roof family **supersedes RH-04's earlier pitched-roof preference** while leaving RH-04 storey/cornice/opening authority intact.

RH-10 additionally reserves about **50 m² PV-capable roof field** as a forward-design response to the published 2027 renewable-electricity regime.

### RH-09 — occupied-interface hierarchy selected

- `W0` direct-finished masonry remains default;
- `W1` sparse controlled datums are selective;
- `W2` replaceable lining remains experimental under P01;
- continuous conventional principal-room floors remain baseline;
- P02 selective floor access is not required for house completeness.

### RH-10 — heating / envelope baseline selected

- air-to-water heat pump is the working heat-source family;
- DHW cylinder/hydraulics stay in `G-PLANT-01`;
- low-temperature radiators/passive emitters are baseline; whole-house UFH is not selected;
- external/courtyard walls now use a **400–425 mm working planning family with 450 mm stress test**, superseding RH-02's historical 350 mm allowance.

These are Reference House choices, not new House Kernel doctrine.

---

## 3. Suspended pre-RH-01 occurrences

| Suspended occurrence | Pattern | F0 object | Current disposition |
|---|---|---|---|
| `RH-P001-01` | `HSA-P-001` | old east utility entry | superseded by `RH-P001-02` |
| `RH-P002-01` | `HSA-P-002` | old north-east hub | superseded by `RH-P002-02` |
| `RH-P014-01` | `HSA-P-014` | old stacked service zone | superseded by `RH-P014-02` |
| `RH-P004-01` | `HSA-P-004` | old kitchen service edge | superseded by `RH-P004-03` |
| `RH-P004-02` | `HSA-P-004` | old bath/en-suite edge | family-bath part superseded by `RH-P004-04`; en-suite rejected |
| `RH-P003-01` | `HSA-P-003` | old combined horizontal route | superseded by distinct current dry/hydronic route families |
| `RH-P005-01..06` | `HSA-P-005` | old F0 crossing family | obsolete geometry; replaced by current crossing register |
| `RH-P012-01` | `HSA-P-012` | old service index | superseded by `RH-P012-02` |

Suspension does not reject the canonical patterns.

---

## 4. Selected strategies

### Fail-Safe Water Distribution

The house continues to select [Fail-Safe Water Distribution](../patterns/strategies/fail-safe-water-distribution.md):

- `WF-01` plant/isolation geography — accessible joints and isolation; significant leakage visible/manageable;
- `WF-02` riser — joint-minimised vertical runs; accessible branch ends;
- `WF-03` kitchen/utility — short branches and accessible appliance isolation;
- `WF-04` bathroom — dry-side maintainable components, short concealed finals, waterproofing independent of access;
- `WF-05` soil/waste — accessible stack base/rodding and short gravity branches.

RH-10 extends the same logic to hydronic heating: joint-minimised concealed runs and accessible emitter/plant joints. No manifold pattern is selected merely because the hub exists.

### Structural / floor strategies

[Decompose Structural Interface Functions](../patterns/strategies/decompose-structural-interface-functions.md) and [Separate Structural Floor from Changeable Layers Where Proportionate](../patterns/strategies/separate-structural-floor-changeable-layers.md) remain active:

- structural deck/joists/edge beams remain primary structure;
- services move around protected structure except at registered crossings;
- MVHR/hydronic branches may use explicit parallel route zones, not a generic floor void;
- removable floor layers remain optional rather than a project dependency.

---

## 5. Held candidates / prototype dependency

- [Replaceable Architectural Lining](../patterns/candidates/replaceable-architectural-lining.md) — P01; optional challenger, not M3 dependency.
- [Individually Isolatable Manifold Distribution](../patterns/candidates/individually-isolatable-manifold-distribution.md) — remains held.
- [Local Deep Service Zone](../patterns/candidates/local-deep-service-zone.md) — use only if real routes prove recurring need.
- [Selective Floor Access](../patterns/candidates/selective-floor-access.md) — P02; not selected in the Reference House baseline.

P03 structural floor edge remains a real engineering/prototype dependency. P04 tests the selected wall/ceiling movement condition.

No held candidate receives an `RH-P*` identity merely for being tested.

---

## 6. Rejected / rewound moves still controlling design

1. universal mixed-services duct;
2. scattered upper wet rooms without route proof;
3. plant hidden in kitchen cabinetry;
4. blanket leak containment everywhere;
5. courtyard crossing as only front-to-rear route;
6. undifferentiated rear great room;
7. steep/winder stair merely to protect plan simplicity;
8. service hub displaced for stair;
9. full four-sided upper court gallery;
10. whole-house independent structural frame;
11. long-span floor across major house dimensions;
12. every room partition loadbearing;
13. primary beams/reaction nodes treated as future chases;
14. remote en-suite bought with second stack / cross-joist waste;
15. speculative MVHR before route proof;
16. whole-floor service plenum;
17. giant generic rear glazing;
18. cooling reservation before modelling;
19. inward-draining courtyard roof / inner gutter baseline;
20. concealed internal roof outlets where outward drainage works;
21. roof hatch as symbolic maintainability;
22. permanent courtyard object consuming tower geometry;
23. house-wide replaceable wall lining before P01;
24. house-wide access floor without a service need;
25. sockets located in skirting merely because skirting carries routes;
26. visible brass grids used to advertise disassembly;
27. whole-house underfloor heating selected merely for heat-pump fashion;
28. battery storage reserved without a demonstrated project case;
29. retaining RH-02's 350 mm wall allowance as if technical envelope depth were already solved.

---

## 7. Update rule

Update this register when:

- RH-11 specialist review changes a current occurrence or invalidates a route/family;
- P01–P04 produce evidence that changes project selection;
- a real site changes orientation, utility approach, service-side access, drainage, ASHP or PV geography;
- a route, crossing, threshold or opening identity materially changes.

When an old identifier is reused, ensure the underlying project object is recognisably the same. Otherwise issue a new identity and retain the old object as provenance.

Do not update general pattern evidence or maturity merely because this house uses a pattern.