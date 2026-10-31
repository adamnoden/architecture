# OCG-04B — IC1–IC3 Proposition Audit

**Programme:** OCG — Occupied Change  
**Parent:** [#593 — OCG-04 existing-doctrine / system audit](https://github.com/adamnoden/architecture/issues/593)  
**Packet:** [#595 — OCG-04B](https://github.com/adamnoden/architecture/issues/595)  
**Depends on:** OCG-04A / PR #599 / merge `831a7f7eac7a762b08e2ccf7b23e5121659546b7`  
**Baseline:** `831a7f7eac7a762b08e2ccf7b23e5121659546b7`  
**Method:** `project/ocg/ocg-04a-audit-method.md`  
**State:** candidate proposition audit; becomes the OCG-04B record when merged

## Purpose

Audit canonical scenarios CI-01…CI-07 against **existing** Ovid’s House propositions without repairing anything and without awarding Reference House implementation passes.

The frozen OCG-04A finding unit is:

> **scenario × proposition × consequence mechanism**

No scenario receives one overall pass/fail status.

Finding status, causal ownership, evidence/knowledge state, evidence basis and next proof route remain independent throughout this record.

---

# 1. Controlling evidence posture

Primary current authority used below includes:

- `docs/manuscript/governing-principles.md`;
- `project/ocg/ocg-00b-controlled-architectural-baseline.md`;
- `docs/reference-house/pattern-occurrence-register.md` only for selection and already-declared proof debt;
- `docs/patterns/service-topology-sequence.md`;
- admitted active patterns and canonical strategies cited per row;
- `docs/development/manufacturing-strategy.md` where assembly/manufacturing logic materially qualifies a claim;
- OCG-02A/B/C/D research and counter-evidence.

The OCG-02A causal split is controlling:

- architecture may own **why** a destructive access operation is necessary;
- competent extraction, temporary barriers, housekeeping and ordinary worksite controls are contractor/method owned by default;
- service topology may determine outage **scope**, while task/product/method usually dominate outage **duration**;
- technical completion, reinstatement completion and return to use remain separate.

OCG-02B/D prevent any finding from equating a removable fixing, cavity or access panel with completed replaceability.

## 1.1 Evidence-state convention in this packet

For proposition rows:

- `PRESENT` means the cited current source actually contains/selects the proposition being audited;
- `UNKNOWN` means proposition-level evidence is insufficient to judge the causal claim;
- `NOT_REPRESENTED` means the required fact belongs to a later model/site/detail layer and is not established here.

A `PRESENT` proposition can still require `OCG05_REQUIRED`; presence of the proposition is not implementation proof.

## 1.2 Conflict convention

A stated force, burden or failure mode does **not** become `CONFLICT` merely because it exists. `CONFLICT` is reserved for an actual unresolved contradiction between current selected propositions or obligations. This packet finds burdens and proof debts, but no proposition-level contradiction requiring that status.

---

# 2. CI-01 — inspect and clear a foul-drainage obstruction

**Class:** IC1 — inspection / maintenance  
**Principal dimensions:** access/permanent fabric; services; occupancy; worksite/contamination; logistics; recovery.

## OCG-04B-CI-01-R01 — controlled foul-maintenance geography

**Consequence / sequence:** destructive or occupied-space access to diagnose/clear an obstruction; `approach → expose/access → work → test → close/recover`.  
**Existing proposition:** concentrate foul routes and intended inspection/rodding nodes in legible service geography rather than relying on arbitrary discovery through principal fabric.  
**Source / authority:** Constitution 4/5/10; OCG-00B §10.1; service-topology S4/S6/S7/S10; Accessible Vertical Service Zone; Designed Structural Penetration.  
**Source class / maturity:** CONSTITUTION + ACTIVE_PATTERN; AVSZ `supported`, DSP `established`; RH occurrence selected for vertical/service geography.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE` for intended access-node geography; `SHARED` once fault location lies beyond controlled access.  
**Evidence / knowledge state:** `PRESENT` for the proposition; actual blockage reach `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `SUPPORTED_INFERENCE`.  
**Controls:** one primary soil/vent geography, stack-base/rodding direction, service-side building crossing and external inspection-chamber direction.  
**Does not control:** exact blockage location; whether every obstruction is reachable from intended nodes; real downstream sewer/site geometry; contractor clearance method.  
**Permanent-burden / conflict note:** concentrated nodes avoid proliferating permanent inspection infrastructure; no actual proposition conflict identified.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05—actual approach/opening/working/reach geometry; DPL/site—real sewer/chamber route and access.  
**Upstream owner if unresolved:** drainage/service owner + DPL/site.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-01-R02 — hygienic containment and cleaning

**Consequence / sequence:** contamination, odour, protection and cleaning; `protect/contain → work → clean/recover`.  
**Existing proposition:** OCG-02A/C assigns ordinary temporary separation, hygiene controls and housekeeping to competent delivery/method by default.  
**Source / authority:** OCG-02A/02C; delivery authority.  
**Source class / maturity:** RESEARCH + DELIVERY; no RH occurrence required.  
**Finding:** `NOT_ARCHITECTURE_OWNED`.  
**Causal ownership:** `CONTRACTOR_METHOD` by default.  
**Evidence / knowledge state:** `PRESENT`.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** temporary protection, hygienic work-zone control, removal of contaminated protection and cleaning method.  
**Does not control:** whether permanent access geography makes ordinary containment needlessly difficult; that remains an architectural geometry question.  
**Permanent-burden / conflict note:** no permanent clean/dirty contractor circulation is earned.  
**Next proof route:** `DELIVERY_METHOD_REQUIRED`; OCG-05 only if permanent geometry appears to obstruct ordinary containment.  
**Outstanding facts:** actual work method if/when deployed.  
**Upstream owner if unresolved:** delivery/contractor.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-01-R03 — downstream/site drainage truth

**Consequence / sequence:** inspection or blockage territory beyond the site-agnostic building boundary.  
**Existing proposition:** OCG-00A/00B stop building authority at the controlled building-to-site interface and refuse to invent sewer/site facts.  
**Source / authority:** OCG-00A site/deployment boundary; OCG-00B foul baseline.  
**Source class / maturity:** SITE_DEPLOYMENT + REFERENCE_OCCURRENCE; real site fact absent.  
**Finding:** `NOT_ARCHITECTURE_OWNED` for unknown external sewer position/access rights.  
**Causal ownership:** `SITE_PROJECT`.  
**Evidence / knowledge state:** `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** only the building-side transition and declared assumption boundary.  
**Does not control:** real external sewer alignment, chamber availability, easements/access rights.  
**Permanent-burden / conflict note:** none; this is an authority boundary, not a missing house feature.  
**Next proof route:** `SITE_DPL_REQUIRED`.  
**Outstanding facts:** real site drainage records/geometry.  
**Upstream owner if unresolved:** DPL/site/drainage authority.  
**OCG-specific addition earned now:** **NO**.

### CI-01 synthesis

**Existing strength:** the project already rejects blind/room-scattered foul access and provides a controlled service-side access proposition.

**Material remainder:** intended access nodes cannot guarantee reach to an arbitrary obstruction. That is an honest scope limit, not evidence that inspection infrastructure should proliferate.

**Method-owned consequence:** hygienic containment/cleaning.

**OCG-05 queue:** physical access/working/reach geometry at represented foul-maintenance nodes and the route to them.

**Other-owner queue:** real external drainage truth → DPL/site.

**OCG-specific addition earned now:** **NO**.

---

# 3. CI-02 — inspect and clear roof rainwater collection / outlet

**Class:** IC1  
**Principal dimensions:** access/permanent fabric; occupancy; logistics; reinstatement; site dependence.

## OCG-04B-CI-02-R01 — task-specific roof-access strategy

**Consequence / sequence:** reaching a roof maintenance point without disproportionate permanent access infrastructure; `approach → access → work → restore`.  
**Existing proposition:** choose access from the actual task; internal, external, temporary and combined routes are legitimate, and permanent hardware is not automatically preferred.  
**Source / authority:** `docs/patterns/roof-maintenance-route.md`.  
**Source class / maturity:** ACTIVE_PATTERN, `established`; RH occurrence selected but current external scaffold/tower direction remains proof debt.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE` for preserving feasible approach/landing/working relationships; `CONTRACTOR_METHOD` for final temporary-system design.  
**Evidence / knowledge state:** `PRESENT`; actual RH/site method `NOT_REPRESENTED` at this layer.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** proposition-level access hierarchy and proportionality; explicitly rejects symbolic hatch/anchor provision.  
**Does not control:** actual safe system, built dimensions, ground bearing or site access.  
**Permanent-burden / conflict note:** hatches/anchors can create weather, thermal, security and visual debt; current pattern already owns that trade-off. No unresolved contradiction identified.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05—RH approach/target geometry; SITE_DPL—real ground/boundaries; delivery—temporary system design.  
**Upstream owner if unresolved:** external-maintenance/site/delivery owners.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-02-R02 — inspectable rainwater maintenance/failure points

**Consequence / sequence:** blockage remaining invisible until water enters concealed vulnerable fabric; `inspect/access → clear → test`.  
**Existing proposition:** make debris-prone collection/outlet points inspectable and maintainable, with deliberate visible/safe failure routes.  
**Source / authority:** `docs/patterns/accessible-rainwater-route.md`.  
**Source class / maturity:** ACTIVE_PATTERN, `established`; RH occurrence selected.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; hydraulic/detail adequacy `NOT_REPRESENTED` here.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** inspectability/maintainability/failure-legibility proposition.  
**Does not control:** hydraulic sizing, exact discharge destination, real rainfall/exposure, gutter/coping/outlet detail.  
**Permanent-burden / conflict note:** access/redundancy remains task/roof dependent; no universal drainage form is implied.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** owner technical proof for hydraulics/detail; OCG-05 for maintenance geometry; site/DPL for discharge.  
**Upstream owner if unresolved:** rainwater/envelope + DPL/site.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-02-R03 — ground-supported temporary-access geography

**Consequence / sequence:** ordinary temporary access rendered impossible by façade/ground/landscape geometry.  
**Existing proposition:** preserve credible approach, support, working and component/waste routes for selected ordinary ground-supported maintenance methods.  
**Source / authority:** `docs/patterns/ground-supported-facade-access.md`.  
**Source class / maturity:** ACTIVE_PATTERN, `supported`; RH occurrence selected with real-site proof outstanding.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE` for latent geometry; `SITE_PROJECT` for real support/boundaries; `CONTRACTOR_METHOD` for equipment design.  
**Evidence / knowledge state:** `PRESENT`; actual site feasibility `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** architectural preservation of credible temporary-access territory.  
**Does not control:** final equipment selection, bearing verification, neighbour/highway dependence.  
**Permanent-burden / conflict note:** proposition deliberately prefers latent geometry over permanent hardware where proportionate.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05 geometry; site/DPL bearing/boundaries; delivery temporary-works design.  
**Upstream owner if unresolved:** external-maintenance + site + delivery.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-02-R04 — work-at-height execution

**Consequence / sequence:** scaffold/tower/MEWP/other temporary system selection, erection and protection.  
**Existing proposition:** competent temporary access is delivery work once architecture/site conditions are known.  
**Source / authority:** OCG-02A/C; delivery authority.  
**Source class / maturity:** RESEARCH + DELIVERY.  
**Finding:** `NOT_ARCHITECTURE_OWNED`.  
**Causal ownership:** `CONTRACTOR_METHOD` + `SITE_PROJECT`.  
**Evidence / knowledge state:** `PRESENT` as ownership principle; actual method `NOT_REPRESENTED`.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** temporary-system design/execution.  
**Does not control:** permanent geometry that may enable/obstruct competent work.  
**Permanent-burden / conflict note:** no permanent access hardware is earned merely to internalise delivery work.  
**Next proof route:** `DELIVERY_METHOD_REQUIRED` + `SITE_DPL_REQUIRED`.  
**Outstanding facts:** actual task/site-specific access plan.  
**Upstream owner if unresolved:** delivery/site.  
**OCG-specific addition earned now:** **NO**.

### CI-02 synthesis

**Existing strength:** Roof Maintenance Route and Accessible Rainwater Route are both `established`; Ground-Supported Façade Access adds a supported external-access proposition without forcing permanent infrastructure.

**Material remainder:** the RH occurrence currently favouring external scaffold/tower is a site-dependent implementation direction, not proof.

**OCG-05 queue:** target/access relationships and any represented support/approach geometry.

**Other-owner queue:** real ground/boundaries/discharge and temporary-system design.

**OCG-specific addition earned now:** **NO**.

---

# 4. CI-03 — replace concealed shower control / mixing-valve assembly

**Class:** IC2 — component / assembly replacement  
**Principal dimensions:** access/permanent fabric; services; occupancy; reinstatement; recovery.

## OCG-04B-CI-03-R01 — dry/maintainable-side access with working/withdrawal logic

**Consequence / sequence:** routine replacement otherwise destroying tile/waterproofing/wall finish; `expose/access → work/withdraw → introduce replacement → close/reinstate`.  
**Existing proposition:** arrange high-service fixtures against an accessible service zone where justified, with actual tool and withdrawal clearance rather than nominal access.  
**Source / authority:** `docs/patterns/high-service-room-service-wall.md`.  
**Source class / maturity:** ACTIVE_PATTERN, `supported`; RH occurrence selected for upper bathroom service relationship.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE` + `ASSEMBLY_DETAIL`.  
**Evidence / knowledge state:** `PRESENT`; actual product/opening clearance `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** proposition-level dry/maintainable-side access, tool clearance and withdrawal requirement.  
**Does not control:** actual control dimensions, opening size, adjacent furniture, tolerances or reclosure detail.  
**Permanent-burden / conflict note:** extra zone depth/acoustic/fire/privacy burdens are explicit pattern forces; no actual contradiction established here.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05 product/access/adjacent-space geometry; owner proof closure/boundary detail.  
**Upstream owner if unresolved:** wet-room/service-interface owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-03-R02 — waterproofing independence from routine access

**Consequence / sequence:** routine component access requiring destruction/reconstruction of the wet-side waterproof boundary.  
**Existing proposition:** access and waterproofing should remain independent where practical; removable access must not be the primary water boundary by accident.  
**Source / authority:** High-Service-Room Service Wall; OCG-00B upper-bathroom baseline; Failure-Tolerant Wet Service Room where applicable.  
**Source class / maturity:** ACTIVE_PATTERN + REFERENCE_OCCURRENCE; service wall/wet-room pattern `supported`.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE` + `ASSEMBLY_DETAIL`.  
**Evidence / knowledge state:** `PRESENT`; physical build-up performance `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** the causal separation principle.  
**Does not control:** actual waterproofing, fire or acoustic performance of the selected closure.  
**Permanent-burden / conflict note:** independence must not create acoustic/fire/water weakness; technical performance remains mandatory.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05 occurrence geometry; owner technical proof for wet/fire/acoustic boundary.  
**Upstream owner if unresolved:** wet-room/fire/acoustic detail owners.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-03-R03 — local water-isolation scope

**Consequence / sequence:** replacing one control unnecessarily disabling broad unrelated water functions; `isolate/make safe → reconnect/test`.  
**Existing proposition:** keep principal/consequential isolation accessible and bias maintainable wet-service valves toward service geography, without selecting universal manifold isolation.  
**Source / authority:** Fail-Safe Water Distribution; OCG-00B isolation baseline.  
**Source class / maturity:** STRATEGY + REFERENCE_OCCURRENCE; canonical strategy, RH implementation topology unproved.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE` for topology/outage scope; `CONTRACTOR_METHOD` for task duration.  
**Evidence / knowledge state:** `PRESENT`; actual shower-control dependency/isolation `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `SUPPORTED_INFERENCE`.  
**Controls:** accessible isolation as a selected strategy.  
**Does not control:** independent isolation of every shower control/branch; `Individually Isolatable Manifold Distribution` is held.  
**Permanent-burden / conflict note:** universal manifold infrastructure has not earned permanent cost/complexity.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual water topology, isolator relationship and outage scope.  
**Upstream owner if unresolved:** water-services owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-03-R04 — temporary protection / dust / cleaning

**Consequence / sequence:** worksite protection and cleaning after the component intervention.  
**Existing proposition:** competent source control, temporary barriers/protection and housekeeping remain method-owned; architecture is judged upstream on whether it forces avoidable destructive access.  
**Source / authority:** OCG-02A/C.  
**Source class / maturity:** RESEARCH + DELIVERY.  
**Finding:** `NOT_ARCHITECTURE_OWNED`.  
**Causal ownership:** `CONTRACTOR_METHOD` by default.  
**Evidence / knowledge state:** `PRESENT`.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** temporary worksite method.  
**Does not control:** whether architecture eliminates tile/plaster destruction; that requires OCG-05 testing of R01/R02.  
**Permanent-burden / conflict note:** no permanent contractor-containment infrastructure earned.  
**Next proof route:** `DELIVERY_METHOD_REQUIRED`.  
**Outstanding facts:** actual method only if intervention is deployed.  
**Upstream owner if unresolved:** delivery.  
**OCG-specific addition earned now:** **NO**.

### CI-03 synthesis

**Existing strength:** the service-wall proposition already contains the complete conceptual move OCG might otherwise have invented: dry/maintainable-side access, tool space, withdrawal and independent technical boundaries.

**Bounded partial:** local water isolation is intentionally not universal.

**OCG-05 queue:** actual product/opening/adjacent-space geometry and water-isolation scope.

**Owner-proof queue:** waterproofing/fire/acoustic closure performance.

**OCG-specific addition earned now:** **NO**.

---

# 5. CI-04 — replace the largest bounded finite-life plant module

**Class:** IC2  
**Principal dimensions:** access/permanent fabric; services; occupancy; logistics; reinstatement.

## OCG-04B-CI-04-R01 — plant hub as working/replacement geography

**Consequence / sequence:** plant technically reachable but impossible to work on or replace; `approach → isolate → access/work → disconnect → withdraw → transport → introduce replacement → reconnect/commission`.  
**Existing proposition:** concentrate major replaceable plant, isolation and distribution in a service hub with explicit working and replacement paths.  
**Source / authority:** `docs/patterns/plant-room-service-hub.md`.  
**Source class / maturity:** ACTIVE_PATTERN, `established`; RH occurrence selected with product packing/withdrawal explicitly outstanding.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual largest-plant packing/route `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** working space, replacement-envelope and building-route proposition.  
**Does not control:** actual product envelope/mass, future dismantling allowance, door/turn clearances or conflicts.  
**Permanent-burden / conflict note:** area, heat, noise, fire/acoustic and storage risks are explicit pattern forces.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** controlled plant item; real packing; approach/door/turn/exit route; competing equipment/storage.  
**Upstream owner if unresolved:** plant/service architecture.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-04-R02 — avoidance of principal-room service territory

**Consequence / sequence:** major plant work routinely recruiting bedrooms/principal living rooms.  
**Existing proposition:** routine service access should not depend on bedrooms/principal sitting rooms where a reasonable alternative exists.  
**Source / authority:** Plant Room as Service Hub.  
**Source class / maturity:** ACTIVE_PATTERN, `established`.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual RH approach `NOT_REPRESENTED` at proposition layer.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** spatial placement/approach principle.  
**Does not control:** actual RH route geometry or site-side continuation.  
**Permanent-burden / conflict note:** dedicated hub only earns area by concentrating multiple recurring tasks.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual approach and replacement route through the RH.  
**Upstream owner if unresolved:** plant/service architecture.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-04-R03 — plant isolation and coupled outage scope

**Consequence / sequence:** one bounded plant exchange disabling unrelated systems/functions.  
**Existing proposition:** concentrate primary isolation/distribution visibly in the service hub; do not infer independent separability of every module.  
**Source / authority:** Plant Room as Service Hub; Controlled Utility Entry; OCG-00B. Physical Service Index may support stewardship but is only `proposed`.  
**Source class / maturity:** ACTIVE_PATTERN + REFERENCE_OCCURRENCE; hub/entry `established`; physical index `proposed`.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE` for topology/outage scope; task/product/method for duration.  
**Evidence / knowledge state:** `PRESENT`; actual dependency graph `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `SUPPORTED_INFERENCE`.  
**Controls:** legible principal isolation and concentrated distribution.  
**Does not control:** independent isolation of every finite-life module or coupled service.  
**Permanent-burden / conflict note:** extra isolation hardware must still earn complexity/space/maintenance.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual plant/system dependency graph and isolation points.  
**Upstream owner if unresolved:** services/plant owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-04-R04 — building-side replacement path

**Consequence / sequence:** old module cannot reach the building exit / new module cannot reach operating position.  
**Existing proposition:** maintenance geography includes handling/replacement path, and the plant hub must provide a credible route for the largest foreseeable replaceable item to leave.  
**Source / authority:** Constitution 5; Plant Room as Service Hub.  
**Source class / maturity:** CONSTITUTION + ACTIVE_PATTERN; hub `established`; RH occurrence selected with withdrawal proof debt.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual route clearance `NOT_REPRESENTED` here.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** proposition from operating position to a credible building-side exit route.  
**Does not control:** actual product packing or real external site continuation.  
**Permanent-burden / conflict note:** route/door area must remain proportionate and domestically resolved.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual module envelope/orientation, turns, thresholds, doors and building exit.  
**Upstream owner if unresolved:** plant/service architecture.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-04-R05 — real external/site continuation

**Consequence / sequence:** module crosses from building exit to vehicle/staging/site boundary.  
**Existing proposition:** site-dependent replacement geography belongs to site deployment once the building interface is established.  
**Source / authority:** OCG-00A; external-maintenance/site authority.  
**Source class / maturity:** SITE_DEPLOYMENT.  
**Finding:** `NOT_ARCHITECTURE_OWNED` at the site-agnostic RH layer.  
**Causal ownership:** `SITE_PROJECT`.  
**Evidence / knowledge state:** `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** authority boundary only.  
**Does not control:** actual exterior path, gate, slope, highway/vehicle/staging arrangement.  
**Permanent-burden / conflict note:** none at site-agnostic layer.  
**Next proof route:** `SITE_DPL_REQUIRED`.  
**Outstanding facts:** real-site continuation and staging.  
**Upstream owner if unresolved:** DPL/site.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-04-R06 — specialist handling method

**Consequence / sequence:** lifting, trolleying, dismantling and contractor handling of old/new plant.  
**Existing proposition:** architecture provides geometry; competent handling method remains delivery/specialist work.  
**Source / authority:** OCG-02C; delivery authority.  
**Source class / maturity:** RESEARCH + DELIVERY.  
**Finding:** `NOT_ARCHITECTURE_OWNED`.  
**Causal ownership:** `CONTRACTOR_METHOD`.  
**Evidence / knowledge state:** `PRESENT` as ownership principle; actual method `NOT_REPRESENTED`.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** temporary handling/equipment methodology.  
**Does not control:** missing permanent clearance; architecture cannot offload an undersized route to heroic handling.  
**Permanent-burden / conflict note:** no permanent lifting infrastructure earned by default.  
**Next proof route:** `DELIVERY_METHOD_REQUIRED`.  
**Outstanding facts:** actual module/method after product selection.  
**Upstream owner if unresolved:** delivery/plant specialist.  
**OCG-specific addition earned now:** **NO**.

### CI-04 synthesis

**Existing strength:** Plant Room as Service Hub is an `established` pattern whose wording already contains working **and complete replacement-path** logic.

**Bounded partial:** concentration/primary isolation does not imply every plant module is independently separable.

**OCG-05 queue:** largest controlled plant item, packing, operating-space clearance and building-side replacement route.

**Other-owner queue:** external site continuation → DPL; specialist handling → delivery.

**OCG-specific addition earned now:** **NO**.

---

# 6. CI-05 — replace a complete window assembly in its incumbent opening

**Class:** IC2  
**Principal dimensions:** access/permanent fabric; occupancy; logistics; reinstatement; recovery.

## OCG-04B-CI-05-R01 — permanent host / replaceable-window relationship

**Consequence / sequence:** full-frame replacement reconstructing sound masonry/opening fabric; `expose interface → release/withdraw → introduce replacement → refix → reclose/reinstate`.  
**Existing proposition:** treat the masonry opening as enduring architecture and the window as a replaceable assembly within a deliberate fixing/drainage/thermal/air/movement interface.  
**Source / authority:** `docs/patterns/permanent-opening-replaceable-window.md`.  
**Source class / maturity:** ACTIVE_PATTERN, `supported`; RH occurrence selected with fixing/withdrawal proof outstanding.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE` + `ASSEMBLY_DETAIL`.  
**Evidence / knowledge state:** `PRESENT`; actual family/interface performance `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** durable-host/replaceable-frame relationship and requirement to draw full-frame replacement.  
**Does not control:** actual fixing positions, future product fit, sill/jamb/head geometry or technical-boundary performance.  
**Permanent-burden / conflict note:** extra subframes/interfaces are not assumed; any permanent anchor/subframe must justify service life and thermal burden.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05 withdrawal geometry; owner technical proof for jamb/head/sill and envelope duties.  
**Upstream owner if unresolved:** openings/envelope owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-05-R02 — replaceability constrained by envelope performance

**Consequence / sequence:** removable/mounting interface weakening air/water/thermal/acoustic/security performance or becoming a maintenance liability.  
**Existing proposition:** replaceability is subordinate to complete envelope duties; failure modes include thermal bridge, drainage error, seal dependence and destructive boundary loss.  
**Source / authority:** Permanent Opening / Replaceable Window; OCG-02B/D.  
**Source class / maturity:** ACTIVE_PATTERN `supported` + RESEARCH.  
**Finding:** `ADDRESSED` **as a proposition constraint only**.  
**Causal ownership:** `ASSEMBLY_DETAIL`.  
**Evidence / knowledge state:** `PRESENT` for the constraint; actual performance `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** what a valid replaceable-window solution must preserve.  
**Does not control:** whether the selected physical interface actually meets any of those duties.  
**Permanent-burden / conflict note:** this row records the anti-conflict condition; no technical pass is awarded.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** scoped building-physics/security/acoustic/fixing evidence and RH interface geometry.  
**Upstream owner if unresolved:** envelope/openings technical owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-05-R03 — exterior working/replacement geography

**Consequence / sequence:** frame theoretically removable but ordinary exterior working/support/component route unavailable.  
**Existing proposition:** preserve credible ordinary façade-maintenance support/approach/component/waste routes where the task warrants them.  
**Source / authority:** Ground-Supported Façade Access.  
**Source class / maturity:** ACTIVE_PATTERN, `supported`; RH occurrence selected with site proof outstanding.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE` for latent geometry; `SITE_PROJECT` for real support/boundaries; `CONTRACTOR_METHOD` for temporary-access design.  
**Evidence / knowledge state:** `PRESENT`; real site feasibility `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** preservation of credible ordinary access geometry.  
**Does not control:** actual access equipment, ground bearing, neighbour/highway dependence.  
**Permanent-burden / conflict note:** no empty universal maintenance strip or permanent façade system is required.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05 building geometry; site/DPL support/access; delivery temporary method.  
**Upstream owner if unresolved:** external maintenance + DPL + delivery.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-05-R04 — tolerance translation and proof by removal/reinstatement

**Consequence / sequence:** manufactured frame nominally removable but defeated by site variation, concealed fixing or brittle finish bridging.  
**Existing proposition:** translate site-built tolerance through bounded adjustment interfaces and prove claimed reversibility by first-article removal/reinstatement.  
**Source / authority:** `docs/development/manufacturing-strategy.md`.  
**Source class / maturity:** DEVELOPMENT_STRATEGY; current project strategy, not an active pattern.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ASSEMBLY_DETAIL`.  
**Evidence / knowledge state:** `PRESENT`; actual first article `NOT_REPRESENTED` here.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** project manufacturing/tolerance/removal discipline.  
**Does not control:** actual window mock-up result or product applicability.  
**Permanent-burden / conflict note:** manufacturing precision must not force unrealistic masonry tolerance or proprietary dependency.  
**Next proof route:** `OWNER_PROOF_REQUIRED`; OCG-05 consumes resulting physical evidence where relevant.  
**Outstanding facts:** first-article removal/reinstatement and interface/tolerance test.  
**Upstream owner if unresolved:** manufacturing/openings detail owner.  
**OCG-specific addition earned now:** **NO**.

### CI-05 synthesis

**Existing strength:** bounded replaceability is already embodied in an admitted active pattern and reinforced by the manufacturing strategy; OCG-02’s sash-window precedent strengthens rather than invents that logic.

**Main proof debt:** fixing/withdrawal geometry and real air/water/thermal/acoustic/security performance.

**Site dependency:** exterior access remains site-contingent even if the building preserves useful access geography.

**OCG-specific addition earned now:** **NO**.

---

# 7. CI-06 — renew a leaking upper-level water-supply branch

**Class:** IC3 — branch / subsystem intervention  
**Principal dimensions:** access/permanent fabric; services; occupancy; worksite; reinstatement; recovery.

## OCG-04B-CI-06-R01 — concentrated wet-service route protects slow fabric

**Consequence / sequence:** branch renewal requiring ad-hoc opening of principal-room structural floors/walls; `diagnose/trace → access route → disconnect/remove/renew → test → reclose`.  
**Existing proposition:** bias primary/high-burden services toward coherent horizontal/vertical service geography and high-service-room edges rather than treating structural floors/walls as free distribution space.  
**Source / authority:** Coherent Horizontal Service Route; Accessible Vertical Service Zone; High-Service-Room Service Wall; Constitution 2/5.  
**Source class / maturity:** ACTIVE_PATTERN + CONSTITUTION; all three patterns `supported`; RH occurrences selected.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual branch route/access `NOT_REPRESENTED` here.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** proposition-level route concentration and protection of slow fabric.  
**Does not control:** whether the actual RH branch lies fully in accessible geography, congestion, joint positions or continuous replacement access.  
**Permanent-burden / conflict note:** shared routes carry fire/acoustic/area/access debt; current patterns already limit universal voids.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** end-to-end branch route, route access, service packing and crossed boundaries.  
**Upstream owner if unresolved:** water/service topology owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-06-R02 — component access is not full branch replaceability

**Consequence / sequence:** treating accessible valves/joints at one service wall as proof the entire pipe branch can be renewed.  
**Existing proposition:** service-wall access covers selected maintainable components/short branches but does not promise independent withdrawal of every continuous pipe segment.  
**Source / authority:** High-Service-Room Service Wall.  
**Source class / maturity:** ACTIVE_PATTERN, `supported`.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE` + `ASSEMBLY_DETAIL`.  
**Evidence / knowledge state:** `PRESENT`; actual branch segmentation/replacement sequence `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** local component/short-branch access.  
**Does not control:** full end-to-end branch withdrawal/removal/renewal.  
**Permanent-burden / conflict note:** expanding access infrastructure simply to make every pipe segment withdrawable would require later proportionality evidence.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** branch segmentation, connection points, route openings and replacement sequence.  
**Upstream owner if unresolved:** water/service detail owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-06-R03 — water-failure legibility and repairability

**Consequence / sequence:** leakage remaining hidden in slow fabric long enough to enlarge damage/recovery territory.  
**Existing proposition:** first avoid concealed joints/routes, then selectively use access, visible leakage, containment and isolation according to risk.  
**Source / authority:** Fail-Safe Water Distribution; Visible Leakage Path where selected.  
**Source class / maturity:** STRATEGY + ACTIVE_PATTERN; fail-safe strategy canonical, individual implementation still scoped.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE` + `ASSEMBLY_DETAIL`.  
**Evidence / knowledge state:** `PRESENT`; actual leak destination/joint schedule `NOT_REPRESENTED` here.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** failure-avoidance/legibility hierarchy.  
**Does not control:** actual physical containment/drainage/detection performance of an implementation.  
**Permanent-burden / conflict note:** the strategy expressly rejects stacking every protective layer by default.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05 actual route/joints/failure destination; owner proof for selected containment/detail family.  
**Upstream owner if unresolved:** water/failure-detail owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-06-R04 — local isolation without universal manifold

**Consequence / sequence:** bounded branch renewal requiring broader water shutdown than necessary.  
**Existing proposition:** accessible principal/consequential isolation is selected; universal central per-branch manifold isolation is not.  
**Source / authority:** OCG-00B; Fail-Safe Water Distribution.  
**Source class / maturity:** REFERENCE_OCCURRENCE + STRATEGY; `Individually Isolatable Manifold Distribution` is HELD_CANDIDATE.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE` for outage topology.  
**Evidence / knowledge state:** `PRESENT`; actual branch isolator relationship `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** accessible principal/consequential isolation.  
**Does not control:** independent isolation of every branch.  
**Permanent-burden / conflict note:** held manifold infrastructure cannot be imported to improve this result; its complexity has not earned selection.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual branch isolation topology and resulting outage scope.  
**Upstream owner if unresolved:** water-services owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-06-R05 — conventional principal floors / selective-access restraint

**Consequence / sequence:** assuming branch renewal can use underfloor access merely because a floor-layer strategy exists.  
**Existing proposition:** separate structural floors from faster layers **where proportionate**, while allowing ordinary layered floors with no routine access.  
**Source / authority:** Separate Structural Floor from Changeable Layers Where Proportionate; OCG-00B.  
**Source class / maturity:** STRATEGY `supported` + REFERENCE_OCCURRENCE; Selective Floor Access is HELD_CANDIDATE.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual CI-06 need for floor access `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** lifecycle separation principle where selected.  
**Does not control:** universal removable/access floor or accessible underfloor branch renewal.  
**Permanent-burden / conflict note:** acoustic/tactile/fire/depth burdens are explicit guardrails; principal-room conventional floors remain incumbent.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** whether the actual branch crosses/depends on inaccessible principal-floor territory.  
**Upstream owner if unresolved:** floor/service topology owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-06-R06 — dusty access work and temporary containment

**Consequence / sequence:** dust/protection/cleaning if branch access requires cutting/opening.  
**Existing proposition:** competent source control/containment/cleaning is method-owned; architecture owns upstream necessity of destructive access.  
**Source / authority:** OCG-02A/C.  
**Source class / maturity:** RESEARCH + DELIVERY.  
**Finding:** `NOT_ARCHITECTURE_OWNED` for the worksite-control method itself.  
**Causal ownership:** `CONTRACTOR_METHOD`; `ARCHITECTURE` only for any avoidable destructive-access cause established separately.  
**Evidence / knowledge state:** `PRESENT`; actual need for destructive access `NOT_REPRESENTED` until OCG-05.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** temporary controls/cleaning.  
**Does not control:** whether architecture unnecessarily creates the dusty operation.  
**Permanent-burden / conflict note:** no permanent dust-control architecture earned.  
**Next proof route:** `MULTIPLE` only if OCG-05 finds destructive access; otherwise delivery method.  
**Outstanding facts:** actual branch-access sequence.  
**Upstream owner if unresolved:** OCG-05 + delivery.  
**OCG-specific addition earned now:** **NO**.

### CI-06 synthesis

**Existing strength:** current doctrine has a coherent response to the central mechanism—wet-service concentration, controlled routes, designed crossings and failure legibility.

**Critical bounded partials:** service-wall access and floor-layer separation do **not** prove whole-branch replaceability; isolation is deliberately not universal.

**OCG-05 queue:** actual branch route, joint locations, access/replacement logic, floor/wall intersections and outage scope.

**Method-owned consequence:** source control/containment/cleaning.

**OCG-specific addition earned now:** **NO**.

---

# 8. CI-07 — add a new data branch to an occupied bedroom

**Class:** IC3  
**Principal dimensions:** access/permanent fabric; occupancy; logistics; reinstatement; recovery.

## OCG-04B-CI-07-R01 — accessible room-edge dry-service route

**Consequence / sequence:** future dry-service addition requiring chasing quiet permanent walls; `approach/access route → install branch/endpoint → test → reclose`.  
**Existing proposition:** where local demand warrants it, route suitable room-scale services through removable architectural layers/joinery rather than routinely chasing permanent fabric.  
**Source / authority:** `docs/patterns/accessible-room-service-route.md`.  
**Source class / maturity:** ACTIVE_PATTERN, `supported`; RH occurrence selected.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual route depth/continuity/conflicts `NOT_REPRESENTED` here.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** targeted accessible local dry-service route principle.  
**Does not control:** every wall, every service class, actual furniture/joinery conflicts or physical capacity.  
**Permanent-burden / conflict note:** pattern explicitly rejects turning every moulding/room into technical trunking.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual route continuity/depth/service compatibility/access after fit-out.  
**Upstream owner if unresolved:** dry-service/room-interface owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-07-R02 — coherent path from distribution origin to room

**Consequence / sequence:** room-edge route cannot be reached from primary dry distribution without new destructive crossings.  
**Existing proposition:** building-scale coherent horizontal/vertical routes connect controlled distribution to room-scale routes, with consequential crossings deliberately owned.  
**Source / authority:** Coherent Horizontal Service Route; Accessible Vertical Service Zone; Designed Structural Penetration.  
**Source class / maturity:** ACTIVE_PATTERN; horizontal/vertical `supported`, penetration `established`; RH occurrences selected.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual connected RH route/capacity `NOT_REPRESENTED` here.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** route-coherence/crossing proposition.  
**Does not control:** actual capacity, bend/pull geometry, segregation or closure detail.  
**Permanent-burden / conflict note:** route coherence must not become a deep whole-house plenum; current patterns expressly constrain that failure.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** end-to-end route, capacity, bends/pullability, separation and crossings.  
**Upstream owner if unresolved:** dry-service/service-topology owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-07-R03 — arbitrary endpoint flexibility is not selected

**Consequence / sequence:** treating a bounded room-edge route as a promise of dry installation at any future wall point.  
**Existing proposition:** local accessibility is proportional; stable low-demand walls may remain conventional and technically quiet.  
**Source / authority:** Accessible Room Service Route; Constitution 7; OCG-00B conventional-surface baseline.  
**Source class / maturity:** ACTIVE_PATTERN `supported` + CONSTITUTION + REFERENCE_OCCURRENCE.  
**Finding:** `PARTIAL` by design.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; target-point reach `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** selected room-edge/architectural-route family.  
**Does not control:** arbitrary future outlet position or continuous technical rack around every room.  
**Permanent-burden / conflict note:** universal technical lining would burden depth, appearance, fixings and repose; current pattern rejects it.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** credible CI-07 endpoint and whether selected room-edge/door/joinery geometry reaches it proportionately.  
**Upstream owner if unresolved:** room/service topology owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-07-R04 — floor/lining held-candidate control

**Consequence / sequence:** borrowing universal wall/floor access to make future data addition appear easier than current authority allows.  
**Existing proposition:** conventional principal floors and direct quiet walls remain incumbent; layer separation/access is selective and proportionate.  
**Source / authority:** OCG-00B; floor-layer strategy; held-candidate register.  
**Source class / maturity:** STRATEGY `supported` + REFERENCE_OCCURRENCE + HELD_CANDIDATE.  
**Finding:** `PARTIAL` for selected layer separation; held candidates provide **no positive support**.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** targeted layer separation and explicit non-selection of universal access.  
**Does not control:** generic replaceable lining or selective floor access not currently selected.  
**Permanent-burden / conflict note:** Replaceable Architectural Lining and Selective Floor Access remain held precisely because their permanent performance/value is unproved.  
**Next proof route:** `OCG05_REQUIRED` only if the real CI-07 route demonstrates a physical gap; held candidates cannot pre-empt it.  
**Outstanding facts:** actual route/endpoint condition.  
**Upstream owner if unresolved:** room/floor/service owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-07-R05 — service discovery / physical index

**Consequence / sequence:** exploratory opening caused by illegible existing routes.  
**Existing proposition:** maintain a small durable physical index of stable system/isolation/route identities linked to richer records.  
**Source / authority:** `docs/patterns/physical-service-index.md`.  
**Source class / maturity:** ACTIVE_PATTERN, **`proposed`**; RH occurrence selected as direction only.  
**Finding:** `UNRESOLVED`.  
**Causal ownership:** `ARCHITECTURE` / stewardship.  
**Evidence / knowledge state:** `PRESENT` as a selected proposition; evidential adequacy `UNKNOWN`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** intended future service discoverability/identity if successfully implemented and maintained.  
**Does not control:** physical route coherence, stale-information risk or actual installed correspondence.  
**Permanent-burden / conflict note:** low physical burden but significant informational-maintenance failure modes; proposed maturity must not carry the core physical-route claim.  
**Next proof route:** `OWNER_PROOF_REQUIRED`.  
**Outstanding facts:** mature evidence/format/change-control proof; OCG-05 may only use physically represented facts actually present.  
**Upstream owner if unresolved:** stewardship/information owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04B-CI-07-R06 — temporary dust/protection/furniture handling

**Consequence / sequence:** ordinary protection, source control, furniture movement and cleaning during branch installation.  
**Existing proposition:** these are delivery/method-owned unless permanent geometry unnecessarily creates destructive work or blocks ordinary containment.  
**Source / authority:** OCG-02A/C.  
**Source class / maturity:** RESEARCH + DELIVERY.  
**Finding:** `NOT_ARCHITECTURE_OWNED`.  
**Causal ownership:** `CONTRACTOR_METHOD` by default.  
**Evidence / knowledge state:** `PRESENT`; actual work sequence `NOT_REPRESENTED`.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** temporary worksite method.  
**Does not control:** whether architecture forces chasing/demolition or is permanently blocked by furniture/joinery geometry.  
**Permanent-burden / conflict note:** no permanent contractor infrastructure earned.  
**Next proof route:** `DELIVERY_METHOD_REQUIRED`, with OCG-05 only for upstream architectural cause.  
**Outstanding facts:** actual route/endpoint intervention sequence.  
**Upstream owner if unresolved:** delivery + OCG-05 as applicable.  
**OCG-specific addition earned now:** **NO**.

### CI-07 synthesis

**Existing strength:** the project already has a targeted dry-service change strategy at building and room scale.

**Deliberate boundedness:** it does not promise arbitrary outlet placement, universal floor access or removable wall linings.

**Unresolved low-maturity support:** Physical Service Index remains `proposed`; it cannot carry the core physical maintainability claim.

**OCG-05 queue:** end-to-end route continuity/capacity, endpoint geometry, crossing duties and ordinary furniture/joinery conflicts.

**Owner-proof queue:** Physical Service Index maturity/stewardship proof.

**OCG-specific addition earned now:** **NO**.

---

# 9. Cross-scenario observations for OCG-04E

These are packet-local observations, not final OCG-04 synthesis.

## 9.1 The strongest claims are already in the owning pattern system

CI-02, CI-04 and much of CI-05 are carried by patterns whose wording already contains the OCG concern:

- task-specific roof maintenance route;
- working **and replacement** geography for plant;
- full-frame replacement within a durable host opening.

OCG does not need to rename those ideas.

## 9.2 `Accessible` is not allowed to mean `solved`

Across CI-01, CI-03, CI-04 and CI-06 the recurring physical debt is:

- exact working clearance;
- withdrawal direction;
- route continuation;
- product packing;
- boundary reclosure;
- outage topology.

Those are OCG-05 / owner-proof questions, not reasons to invent more doctrine.

## 9.3 Deliberate non-universality is doing useful work

The following remain deliberately unselected:

- universal manifold isolation;
- universal selective floor access;
- universal replaceable lining;
- generic deep service zones.

CI-03/06/07 expose consequences those ideas might reduce, but OCG-02 counter-evidence and current proportionality authority provide no basis to promote them before a real RH failure is shown.

## 9.4 The principal partial findings are honest scope limits

- foul access nodes cannot guarantee reach to every obstruction;
- accessible/local isolation does not mean every component/branch is independently isolatable;
- service-wall access does not prove full branch renewal;
- room-edge dry-service routes do not promise arbitrary endpoint flexibility;
- building-side replacement paths do not establish unknown real-site continuation.

These are not silently converted into `UNADDRESSED` because the current propositions intentionally stop at those boundaries.

## 9.5 No `CONFLICT` or `UNADDRESSED` finding is forced by CI-01…07

This is a substantive result, not an assumption of completeness.

Potential burdens—fire/acoustics at access zones, weather/thermal duties at windows, area/heat/noise at the plant hub, visual/technical character of room routes—are already acknowledged by current propositions and remain proof/proportionality obligations. None is presently an unresolved contradiction between selected propositions at this layer.

Likewise, the audit has not found a material architecture-owned consequence mechanism for CI-01…07 that lacks any selected proposition **at proposition level**. OCG-05 may still reveal that the Reference House fails to implement those propositions physically.

## 9.6 Worksite control remains mainly method-owned

No scenario in CI-01…07 earns permanent clean/dirty circulation, dust-control architecture or contractor staging infrastructure merely because temporary work exists.

Architecture is accountable upstream where it creates needless destructive work or blocks competent temporary containment.

---

# 10. Forward proof queue from OCG-04B

## OCG-05

- CI-01 — foul access opening/working/reach geometry;
- CI-02 — roof target/access geometry and represented support/approach conditions;
- CI-03 — shower-control product/access/withdrawal geometry and actual isolation scope;
- CI-04 — largest controlled plant item, packing, working volume, building-side old-out/new-in route and dependency isolation;
- CI-05 — full-frame fixing/withdrawal geometry and interface occurrence;
- CI-06 — whole water-branch route, access/replacement segmentation, floor/wall intersection and isolation scope;
- CI-07 — end-to-end dry route continuity/capacity, credible endpoint, crossings and fit-out conflicts.

## Owning technical authorities

- window jamb/head/sill air/water/thermal/acoustic/security proof;
- wet-room access-panel/waterproofing/fire/acoustic detail;
- any selected water-containment/failure detail;
- Physical Service Index maturity/change-control proof.

## Site / DPL

- downstream foul drainage;
- roof/façade support/boundary/access conditions;
- real exterior continuation of plant/window replacement routes;
- rainwater discharge.

## Delivery / contractor method

- hygienic containment;
- construction-dust/source control;
- temporary work-at-height systems;
- specialist plant handling;
- ordinary protection/housekeeping/furniture/waste sequencing.

---

# Result

**OCG-04B PASS as an audit packet — CI-01…CI-07 now have schema-complete proposition-level findings under the frozen 04A contract.**

This does **not** mean CI-01…CI-07 pass as interventions or that the Reference House is adequate.

The packet finds **no new OCG-specific doctrine proposition earned at this stage**. Its main output is a bounded physical/model/site/owner proof queue, plus several explicit limits on what current serviceability propositions claim.

OCG-04E must reconcile these findings with OCG-04C and OCG-04D before any programme-level conclusion.

No architecture, doctrine, pattern, Reference House, compiler constraint, drawing, delivery requirement or publication prose is changed by this packet.