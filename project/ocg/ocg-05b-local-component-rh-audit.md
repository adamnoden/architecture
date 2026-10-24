# OCG-05B — Reference House local/component occupied-change audit

**Programme:** OCG — Occupied Change  
**Parent:** #604  
**Packet:** #609  
**Common audit baseline:** OCG-05A merge `6c75c2d9c24faab61a2bd850ba56c70d2f6104fe`  
**Scenarios:** CI-01…CI-07  
**State:** controlled RH audit; no design response authorised

## 1. Method

This packet applies the exact evidence hierarchy, finding vocabulary and proof-unit semantics frozen by `project/ocg/ocg-05a-modelability-coverage-contract.md`.

The question is not whether each intervention is pleasant. It is whether the **current controlled Reference House** positively bounds its consequence envelope, where model silence begins, and whether any positively represented relationship actually contradicts an upstream proposition.

No scenario receives an aggregate score or pass/fail. `PROVEN` below always names the narrow relationship proved.

Primary RH authorities used here:

- `docs/reference-house/service-topology-rh06.md`;
- `docs/reference-house/service-crossing-register-rh06.md`;
- `docs/reference-house/roof-drainage-access-rh08.md`;
- `docs/reference-house/external-access-maintenance-plan.md`;
- `docs/reference-house/tectonic-integration-rh09.md`;
- `docs/reference-house/envelope-coordination-rh10.md`;
- `docs/reference-house/energy-heat-coordination-rh10.md`;
- `docs/reference-house/pattern-occurrence-register.md`;
- `docs/reference-house/whole-house-coordination-audit.md`.

Derived drawings are EH-3 corroboration only.

---

# 2. CI-01 — inspect / clear foul drainage

## Represented intervention path

RH-06 positively represents one 100 mm-class `FS-01` soil/vent stack inside the wet side of `SV-01`, with short branches from the upper family bathroom, ground WC, utility and kitchen. It also represents stack-base / rodding geography inside `G-PLANT-01` or immediately adjacent, a direct drop to below-ground drainage, service-side exit through a designed crossing, and an external inspection chamber before the surrogate continuation toward the sewer.

### Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| B — locate/access/clear | fabric | **PROVEN** — an intentional accessible stack-base/rodding geography and external inspection point are selected; routine clearing is not predicated on opening permanent masonry or principal-room floor fields | architecture; exact rodding access dimensions/fittings remain technical detail |
| C — open/close | fabric + recovery | **PARTIAL** — the architecture localises access to service geography, but exact covers, closures, finishes and post-clear sanitation are not represented | detail + delivery |
| F — isolate/test | service | **PARTIAL / OWNER_PROOF_REQUIRED** — topology is explicit; safe clearing/testing of the actual sanitary installation is plumbing/building-control work | sanitary design |
| G — contain/clean/return | contamination + occupancy | **DELIVERY_METHOD_REQUIRED** — foul work is intrinsically contaminated; temporary hygiene, protection and cleaning are method-owned even with good access | delivery |
| route beyond inspection chamber | logistics + service | **SITE_PROOF_REQUIRED** — real sewer connection, chambers, easements and blockage location are absent from the virtual site | DPL/site |

### Finding

The RH materially bounds routine internal fabric disturbance by concentrating foul access in service geography. It does **not** prove that every blockage is reachable from these points or that foul work is low-contamination.

**No `DEFECT_CANDIDATE`.**

---

# 3. CI-02 — inspect / clear roof rainwater collection or outlet

## Represented intervention path

RH-08 fixes four low-slope roof fields falling outward to external collection edges, no inner courtyard roof gutter and no internal roof outlet. The courtyard has its own primary drain plus an independent visible emergency overflow. External-maintenance planning selects ground-supported scaffold/tower routes rather than a permanent roof hatch.

### Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| C — inspect/access/reclose | fabric | **PROVEN** — primary roof collection is deliberately external/inspectable rather than concealed in the building centre | architecture; gutter/outlet product detail not proved |
| G — approach/work/clean | logistics + occupancy | **PARTIAL** — maintenance geography is reserved and ordinary temporary collective access is the intended method; the architecture does not require passage through principal rooms for outer roof-edge work | architecture + delivery |
| external support | logistics | **SITE_PROOF_REQUIRED** — ground bearing, boundaries, planting, neighbour/highway dependency and actual equipment setup require a real site | DPL/site |
| urgent blockage | contamination/work + recovery | **DELIVERY_METHOD_REQUIRED** — weather, debris, safe temporary access and cleaning are method conditions | delivery |

### Finding

The house positively reduces hidden-water failure geography: roof drainage fails toward inspectable external territory and courtyard failure is visibly separated. A permanent roof hatch is not needed merely to improve this scenario because it would not supply working platform or edge protection.

**No `DEFECT_CANDIDATE`.**

---

# 4. CI-03 — replace concealed shower control / mixing-valve assembly

## Represented intervention path

RH-06 locates maintainable valves, cistern/service components and selected shower controls toward `U-GAL-02` dry-side access, keeps concealed final runs short and joint-minimised, and explicitly requires waterproofing to remain independent from access-panel removal. The family bathroom sits directly over the main service suite adjacent to `SV-01`.

### Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| D — access/disconnect/remove | fabric | **PROVEN** — dry-side maintainability and waterproofing independence are selected architectural relationships | does not prove exact aperture/product withdrawal |
| A — hand/tool/withdrawal | fabric + logistics | **NOT_REPRESENTED / OWNER_PROOF_REQUIRED** — no controlled valve product, access-opening dimensions, tool swing or withdrawal envelope closes the real replacement sequence | technical detail/product |
| F — isolate/reconnect/test | service | **PARTIAL** — accessible primary/local isolation intent is represented; no manifold topology is selected and exact dependent outage/test procedure is not modelled | plumbing + delivery |
| C — close/reinstate | recovery | **PARTIAL** — dry-side access can avoid breaching the wet finish, but closure detail and decorative boundary are not fully represented | detail |
| G — protect/clean/return | occupancy + contamination | **DELIVERY_METHOD_REQUIRED** — temporary bathroom surrender, protection and cleaning remain work-method facts | delivery |

### Finding

The architecture has selected the correct side of the problem: **service access must not require destruction of the waterproofing field**. OCG cannot yet claim a complete replace-in-place sequence because the aperture/product/working envelope is not controlled.

That is proof debt, not a represented contradiction.

**No `DEFECT_CANDIDATE`.**

---

# 5. CI-04 — replace largest bounded finite-life plant module

## Represented intervention path

`G-PLANT-01` is approximately 2.9 × 2.2 m gross, approached internally from `G-GAL-01`, and has a nominal 1000 mm clear external replacement-opening target with direct route to the service-side access zone. RH-10 explicitly requires simultaneous packing of MVHR, DHW/hydraulic equipment, dry controls/distribution and riser access, but states that product-level packing, working clearances and replacement remain unproved.

### Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| A — disconnect/handle/withdraw | logistics + fabric | **PARTIAL** — a dedicated equipment room, nominal external replacement opening and direct replacement direction are represented | exact largest component envelope, mass, turning/tilting and working reserve are not represented |
| B — service disconnection | service | **PARTIAL / OWNER_PROOF_REQUIRED** — plant interfaces and isolation geography are concentrated; final hydraulic/electrical/ventilation connection topology is specialist work | MEP/product |
| C — remove/reinstall/close | fabric + recovery | **PARTIAL** — replacement is not intended to require principal-room demolition, but exact opening construction and local reinstatement are unresolved | architectural/technical detail |
| G — old-out/new-in | logistics | **SITE_PROOF_REQUIRED** — the virtual side strip is protected but real gates, boundary, lifting/staging and vehicle route are site facts | DPL/site |
| commissioning | service + recovery | **DELIVERY_METHOD_REQUIRED / OWNER_PROOF_REQUIRED** | specialist commissioning |

### Finding

The RH has **replacement geography**, not replacement proof. The nominal 1000 mm opening and 2.9 × 2.2 m room must not be read as compatibility with an unknown future module.

This is precisely a proof-family-A debt already identified upstream.

**No `DEFECT_CANDIDATE`.**

---

# 6. CI-05 — replace complete window assembly

## Represented intervention path

The selected opening hierarchy is:

`permanent masonry opening → mounting/tolerance zone → mechanically fixed replaceable frame → removable internal trim`.

The envelope record explicitly requires future jamb/head/sill mock-up proof of fixing/withdrawal, air/water/thermal continuity and avoidance of brittle finish bridging. The External Access & Maintenance Plan requires the complete route from room/opening through frame withdrawal/handling to site entrance, with scaffold/tower assistance where necessary.

### Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| E — release/remove/replace | fabric | **PROVEN** — permanent masonry and replaceable frame are intentionally distinct; removable internal trim is selected | not proof of actual future frame release |
| E/A — fixing/withdrawal | fabric + logistics | **OWNER_PROOF_REQUIRED** — exact fixing, seals, tolerances, frame dimensions/weight and withdrawal direction await mock-up/product detail | opening detail/product |
| C — reinstate | recovery | **PARTIAL** — trim is intended to localise internal making-good and the slow envelope must remain complete without trim; exact finish boundary is not yet prototyped | detail/prototype |
| G — scaffold/handling | occupancy + logistics | **SITE_PROOF_REQUIRED + DELIVERY_METHOD_REQUIRED** — external working position, lifting/handling, protection and route occupation depend on real site and method | site/delivery |

### Finding

The RH establishes a strong architectural distinction between permanent opening and finite-life frame, but **does not yet establish that the frame can actually be replaced without destructive permanent-fabric work**. RH-10 already treats failure of that future mock-up as a rewind condition.

That is a correctly owned open proof, not evidence of current contradiction.

**No `DEFECT_CANDIDATE` at this maturity.**

---

# 7. CI-06 — renew leaking upper water-supply branch

## Represented intervention path

Upper wet demand is concentrated at the family bathroom directly over the service suite. Pressurised water rises in `SV-01`; branch joints are intended at accessible ends/service walls; concealed final runs should be short and joint-free where practical. The structural floor is not a generic wet-service plenum.

### Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| B — locate/access branch | fabric | **PARTIAL** — riser and service-edge topology are represented and avoid arbitrary permanent-masonry chasing | exact branch path/containment/access along every run is not fully represented |
| F — isolate/drain/test | service | **PARTIAL / OWNER_PROOF_REQUIRED** — accessible isolation intent exists, but the exact branch isolation boundary is not encoded; no universal manifold is selected | plumbing detail |
| C — remove/replace/reclose | fabric + recovery | **NOT_REPRESENTED** at complete-sequence resolution — current records do not prove the local opening/closure method for a failed pipe length | later detail |
| G — leakage/work/clean | contamination + occupancy | **DELIVERY_METHOD_REQUIRED** — drying, protection, leak response, testing and cleaning remain method-owned | delivery |

### Finding

The selected topology reduces the probability that an upper-water repair requires random structural-floor excavation, but OCG cannot convert joint-minimised route intent into a proven withdraw-and-replace branch sequence.

No held `Selective Floor Access` or `Local Deep Service Zone` is granted to make this scenario easier.

**No `DEFECT_CANDIDATE`.**

---

# 8. CI-07 — add new data branch to an occupied bedroom

## Represented intervention path

The dry system originates in the segregated plant distribution field, rises in the dry sub-zone of `SV-01`, follows `U-GAL-02` / landing territory and then uses local bedroom partition/perimeter service routes. Primary dry distribution is explicitly not routed through the structural joist depth.

### Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| B — route continuity | fabric + service | **PROVEN** at topology level — a coherent dry route exists from service hub/riser to upper circulation and local room branches without making permanent structure the default route | route capacity/pullability not proved |
| B/A — add/pull cable | logistics + fabric | **NOT_REPRESENTED / OWNER_PROOF_REQUIRED** — conduit/tray dimensions, bends, fill, draw-wire/pull access and exact endpoint are not controlled | electrical/data detail |
| C — endpoint/reclose | recovery | **PARTIAL** — bounded room-edge datums may support local access, but no universal removable lining is selected | architectural/electrical detail |
| G — occupied bedroom work | occupancy + contamination | **DELIVERY_METHOD_REQUIRED** — furniture movement, local protection, drilling dust/noise and cleaning depend on endpoint and method | delivery |

### Finding

This is one of the clearest architectural benefits of the current service topology: future dry distribution has a legible route that does not default to chasing permanent masonry or drilling primary floor structure. But topology alone cannot prove cable pullability or a zero-damage endpoint.

**No `DEFECT_CANDIDATE`.**

---

# 9. Cross-scenario result

CI-01…CI-07 expose a consistent distinction:

## Positively established by current RH

- high-consequence wet/gravity/service work is concentrated in deliberate service geography;
- roof-water collection is external/inspectable rather than hidden centrally;
- shower-control maintainability is biased to the dry side and should not depend on waterproofing demolition;
- plant has dedicated replacement geography rather than principal-room access;
- window frame and permanent masonry opening are distinct architectural layers;
- upper wet services are concentrated above the service suite;
- dry distribution has a coherent hub → riser → gallery/landing → room-edge topology.

## Not yet established

- real hand/tool/withdrawal clearance for concealed components;
- largest-plant product packing and old-out/new-in geometry;
- complete window mock-up/replacement sequence;
- exact local closure/reinstatement at several service routes;
- route pullability/capacity merely from route existence;
- branch-level isolation/test dependencies;
- real exterior staging/support/vehicle/neighbour geometry.

## Ownership pattern

Most residual debt belongs to existing **detail/product/specialist/site/delivery** owners rather than to a missing OCG architectural system.

### Defect-candidate register

**None.**

This is not a declaration that all seven interventions are solved. It is a stronger and narrower result: **no positively represented Reference House relationship in CI-01…CI-07 currently contradicts the selected upstream architecture strongly enough to justify an OCG design correction.**

The dominant result is `PARTIAL` plus explicit owner proof, not hidden optimism.

---

# 10. 05E handoff

Carry forward these proof debts without turning them into OCG inventions:

1. live plant packing / withdrawal / replacement-opening proof;
2. representative concealed-component access and dry-side/wet-side closure detail;
3. representative full-window replacement mock-up;
4. exact service-zone containment / pullability / closure where future technical design reaches that maturity;
5. branch isolation/test procedure closure;
6. real-site external maintenance and logistics replay;
7. delivery-method containment/recovery for intrinsically dirty/noisy/wet tasks.

**OCG-05B result: audit complete; zero current `DEFECT_CANDIDATE`s; no design response authorised.**