# OCG-05C — Reference House room-refit / adaptation occupied-change audit

**Programme:** OCG — Occupied Change  
**Parent:** #604  
**Packet:** #610  
**Common audit baseline:** OCG-05A merge `6c75c2d9c24faab61a2bd850ba56c70d2f6104fe`  
**Scenarios:** CI-08…CI-10  
**State:** controlled RH audit; no design response authorised

## 1. Method

This packet applies the exact OCG-05A evidence hierarchy, proof-family contract and non-scalar finding vocabulary. It audits complete room-scale interventions, where service access alone is insufficient: occupied-room loss, material routes, wet/dust work, reinstatement and return to use matter equally.

Primary RH authorities:

- `docs/reference-house/ground-floor-development.md`;
- `docs/reference-house/upper-floor-and-stair-development.md`;
- `docs/reference-house/service-topology-rh06.md`;
- `docs/reference-house/service-topology-coordination.md`;
- `docs/reference-house/environmental-coordination.md`;
- `docs/reference-house/tectonic-integration-rh09.md`;
- `docs/reference-house/pattern-occurrence-register.md`;
- `docs/reference-house/whole-house-coordination-audit.md`.

The canonical starting conditions remain unchanged. In particular CI-10 is a deliberately remote en-suite request outside selected wet-service geography. It must not be rescued by redesign during the audit.

---

# 2. CI-08 — complete family-bathroom refit

## Represented starting condition

The selected family bathroom is directly above the service suite and adjacent to `SV-01`. Water, soil/waste and relevant maintainable components are intentionally concentrated at the service edge. RH-06 biases maintainable valves, cistern/service components and selected shower controls toward dry-side access from `U-GAL-02`, while requiring waterproofing to remain independent from access-panel removal.

The house retains `G-WC-01` on the entrance storey. The deleted principal en-suite is **not** available as an alternative bathroom.

## Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| B/D — isolate/disconnect | service + fabric | **PARTIAL** — wet-service topology is short, concentrated and dry-side-biased; exact fixture/product isolation and withdrawal are not fully represented | plumbing/detail |
| C — remove old fixtures/finishes | fabric | **PARTIAL** — permanent structure/services are not intended to require broad demolition merely to reach core service points; the room's own wet finishes and fittings are legitimately sacrificial/renewable work | architecture + detail |
| D — preserve wet boundary outside target work | fabric + contamination | **PARTIAL / OWNER_PROOF_REQUIRED** — dry-side access independence is selected, but full waterproofing build-up and renewal interfaces are technical-detail work | wet-room detail |
| A/G — old-out/new-in materials | logistics | **NOT_REPRESENTED** at product scale — bath/shower-screen/board/tile/component dimensions, stair/turning envelopes and packaging are not encoded as a complete refit route | product + delivery |
| G — protect/contain/work | contamination/work | **DELIVERY_METHOD_REQUIRED** — demolition dust, wet cutting, adhesives/sealants, temporary extraction and daily cleaning are method-owned | delivery |
| room loss during works | occupancy | **PROVEN** as unavoidable programme consequence — the only selected full family bathroom is unavailable while its wet field is materially refitted; `G-WC-01` preserves a toilet, not bathing | architecture/programme fact; no zero-disruption claim |
| test/cure/reinstate/clean | recovery | **OWNER_PROOF_REQUIRED + DELIVERY_METHOD_REQUIRED** — waterproofing cure, commissioning, sealants and final hygiene are product/method dependent | specialist/delivery |

## Finding

The Reference House materially bounds **collateral** bathroom-refit consequence by placing the room on the high-service spine and keeping key maintenance access biased to the dry side. It does not and should not pretend that a complete wet-room refit is a dry, instant intervention.

The principal occupied consequence—temporary loss of the sole full bathroom—is real. Adding a second bathroom solely to reduce rare refit inconvenience would contradict the project's proportionality discipline and the explicit RH-06 deletion of an unjustified remote en-suite.

**No `DEFECT_CANDIDATE`.**

---

# 3. CI-09 — complete kitchen refit

## Represented starting condition

The kitchen occupies the north-east high-service field beside the main service geography. RH-06 gives it a short branch to `FS-01`, accessible appliance valves/joints at the service edge, short source-capture extract to the service-side external wall and dry/electrical distribution launched from the nearby plant/service hub. Utility functions remain separate programme rather than being buried entirely in kitchen cabinetry.

## Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| B/F — isolate/disconnect services | service | **PARTIAL** — water/waste/electrical/extract origins are geographically concentrated and short; exact final circuits/appliance isolations/test dependencies are not fully represented | MEP/detail |
| C — remove cabinetry/finishes | fabric | **PROVEN** narrowly — kitchen equipment/cabinetry is not the plant-access layer and primary services do not need to be reached by demolishing remote permanent fabric | architecture |
| C — local closure/reinstatement | recovery | **PARTIAL** — service-edge concentration should localise making-good, but final cabinetry, splashback, flooring and wall-finish interfaces are not controlled as a complete replacement system | architectural/detail/product |
| A/G — appliance/cabinet/material route | logistics | **NOT_REPRESENTED** at product scale — no complete old-unit/appliance extraction and new-unit delivery envelope is encoded | delivery/product |
| occupied kitchen loss | occupancy | **PROVEN** as intrinsic consequence — a complete kitchen refit removes the kitchen function for a period; the house does not contain a duplicate kitchen | programme fact |
| temporary cooking/washing | occupancy + service | **DELIVERY_METHOD_REQUIRED** — any temporary provision is project/method-dependent and architecture receives no automatic credit for it | delivery |
| dust/noise/wet work | contamination/work | **DELIVERY_METHOD_REQUIRED** | delivery |

## Finding

The RH makes kitchen refit **more local than ordinary hidden-service reconstruction** by concentrating wet, extract and dry infrastructure at a short service edge. It does not eliminate the disruption inherent in replacing a kitchen.

The correct OCG objective is not duplicate domestic infrastructure; it is preventing a kitchen refit from unnecessarily propagating into structure, remote rooms or unrelated service zones.

Current RH evidence supports that direction but does not fully prove the final cabinetry/finish reinstatement boundary.

**No `DEFECT_CANDIDATE`.**

---

# 4. CI-10 — create a remote en-suite outside selected wet-service geography

## Represented starting condition

This scenario directly attacks a prior Reference House decision.

RH-06 explicitly tested a principal en-suite in the north-centre field and **deleted it**. The reason was physical service burden: reaching the primary stack would require one or more of a long east–west gravity branch across north–south floor framing, repeated large engineered-joist penetrations, a service bulkhead below, a second soil stack with new permanent penetrations, or relocation of the primary service hub to serve one private convenience room.

The former en-suite reservation became `U-DRESS-01` principal dressing / linen / storage. RH-06 states that reintroducing an en-suite is a **brief change requiring a new route proof**, not a casual partition edit.

## Proof units

| Family / sequence | Consequence | Evidence / finding | Owner / nonclaim |
|---|---|---|---|
| B — new soil/water route | fabric + service | **PROVEN** — the currently selected topology deliberately does **not** provide a proportionate wet-service route to this remote field | architecture |
| B/A — create new route | fabric + logistics | **PROVEN** at consequence level — known candidate routes would invade protected floor framing, add bulkhead/stack/penetrations or move primary service geography | architecture; exact redesign is outside scenario |
| F — isolate/connect/test | service | **OWNER_PROOF_REQUIRED** if the brief is changed; no current system design exists for this rejected programme | future MEP |
| G — occupied works | occupancy + contamination + recovery | **PARTIAL** — substantial invasive work is the foreseeable result of choosing this adaptation after completion; exact method/duration remains delivery-owned | architecture + delivery |
| speculative permanent reserve | cost/space/architectural consequence | **PROVEN** as rejected current strategy — the RH intentionally does not reserve a second stack, universal wet plenum or deep speculative route merely for this possible future desire | architecture/proportionality |

## Finding

**CI-10 is a successful negative control.**

OCG must not turn “bounded change” into “every imaginable future programme change must be easy.” The current house has concentrated wet-service geography precisely so that high-consequence systems do not colonise the entire plan. A later demand for a remote en-suite may therefore legitimately cross the slow/fast boundary and incur real disruption.

The architectural answer at the current baseline is:

> **ACCEPT_DISRUPTION unless a future brief change independently earns a new route.**

This is not a failure of occupied-change doctrine. It is the proportionality limit that prevents OCG from becoming speculative infrastructure.

**No `DEFECT_CANDIDATE`; no new wet-service reserve authorised.**

---

# 5. Cross-scenario consequence synthesis

## Fabric

- CI-08 and CI-09 are bounded principally to their own finish/equipment fields plus already concentrated service interfaces.
- CI-10 deliberately lacks such a route; making it easy would require permanent provision whose current value has not been earned.

## Services

- bathroom/kitchen core services are geographically short and concentrated;
- exact isolation/test/commissioning procedures remain specialist/delivery proof;
- the remote en-suite has no selected service solution by design.

## Occupancy

- a full bathroom refit removes the sole bathing room even though a ground WC remains;
- a kitchen refit removes the kitchen function even though utility remains separate;
- OCG does not redefine these intrinsic room losses as architectural defects.

## Contamination/work

Room refits remain noisy, dusty and often wet. Architecture can reduce propagation and destructive access; contractor containment, extraction and housekeeping remain delivery-owned.

## Logistics

Current domestic circulation is credible for ordinary occupation, but complete product/material/waste envelopes for bath/kitchen refits are not modelled strongly enough to claim `PROVEN` delivery logistics.

## Recovery

Service-edge concentration and dry-side maintainability reduce some making-good risk, but complete finish-system replacement/reclosure is not yet a controlled prototype. Curing, sealing, testing and hygiene remain real recovery tails.

---

# 6. Defect-candidate register

**None.**

The most important result is CI-10: **the absence of universal future wet-service reach is intentional, proportionate architecture rather than a defect.**

OCG-05C therefore provides no justification for:

- restoring the deleted en-suite;
- adding a second soil stack;
- enlarging the service riser for speculative future wet rooms;
- introducing a house-wide wet plenum;
- adding a second kitchen or bathroom solely for works continuity;
- selecting house-wide replaceable lining/floor access.

---

# 7. 05E handoff

Carry forward only the following bounded proof debts:

1. representative bathroom service-edge / dry-side access / waterproofing-independence detail;
2. representative kitchen service-edge and adjacent-finish reinstatement detail where technical design matures;
3. real material/waste route checks for selected bulky room-refit components if/when product families exist;
4. delivery-method containment/recovery obligations for complete room refits;
5. preserve CI-10 as the programme's proportionality control and explicit non-promise.

**OCG-05C result: audit complete; zero current `DEFECT_CANDIDATE`s; remote en-suite difficulty is an intentional proportionality boundary, not a design failure.**