# OCG-04D — IC5–IC6 Proposition Audit

**Programme:** OCG — Occupied Change  
**Parent:** [#593 — OCG-04 existing-doctrine / system audit](https://github.com/adamnoden/architecture/issues/593)  
**Packet:** [#597 — OCG-04D](https://github.com/adamnoden/architecture/issues/597)  
**Depends on:** OCG-04A / PR #599 / merge `831a7f7eac7a762b08e2ccf7b23e5121659546b7`  
**Baseline:** `831a7f7eac7a762b08e2ccf7b23e5121659546b7`  
**Method:** `project/ocg/ocg-04a-audit-method.md`  
**State:** candidate proposition audit; becomes the OCG-04D record when merged

## Purpose

Audit CI-11…CI-13 against current Ovid’s House propositions.

These scenarios deliberately test two limits that small maintenance cases do not:

1. whether targeted serviceability propositions scale from local access to **whole-system renewal**; and
2. whether the project can state an honest non-promise for **primary spatial/structural alteration** without contradicting its wider language about change over time.

No whole scenario receives one finding status.

---

# 1. Controlling posture

OCG-04A requires OCG-04D to preserve these distinctions:

- route coherence is not whole-system replaceability;
- accessible equipment is not independent system isolation;
- a designed penetration is not a spare future penetration;
- physical indexing cannot carry a physical-route claim;
- architecture may determine outage **scope**, while contractor/product/commissioning strongly influence duration;
- IC6 is a control class: major structural change is allowed to remain materially disruptive.

OCG-02B/D additionally reject universal demountability and require permanent serviceability infrastructure to justify its own fire/acoustic/moisture/thermal/area/workmanship/maintenance/architectural burden.

Source classes and causal-ownership tokens are used exactly as frozen in OCG-04A/01C; structural, electrical, heating and other downstream technical owners are named under proof route/upstream owner rather than invented as new classes.

---

# 2. CI-11 — renew primary electrical distribution

**Class:** IC5 — primary system renewal / upgrade  
**Principal dimensions:** access/permanent fabric; services; occupancy; worksite; logistics; reinstatement; recovery.

## OCG-04D-CI-11-R01 — coherent primary dry-service distribution

**Consequence / sequence:** whole-system renewal needing arbitrary discovery/chasing because primary electrical distribution has no coherent route family; `survey/trace → isolate → access routes → renew distribution → test → reclose`.  
**Existing proposition:** organise primary dry distribution through controlled utility entry, plant/distribution geography, vertical service zone and coherent horizontal routes rather than opportunistic routes through structural/quiet fabric.  
**Source / authority:** Controlled Utility Entry; Plant Room as Service Hub; Accessible Vertical Service Zone; Coherent Horizontal Service Route; service-topology sequence.  
**Source class / maturity:** ACTIVE_PATTERN + STRATEGY; utility entry/plant hub `established`, vertical/horizontal routes `supported`; RH occurrences selected.  
**Finding:** `ADDRESSED` at proposition level.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual end-to-end electrical route/capacity `NOT_REPRESENTED` at this layer.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** building-scale route coherence and service concentration.  
**Does not control:** actual cable containment, branch count, spare capacity, bend/pull conditions, terminations or future standards.  
**Permanent-burden / conflict note:** route coherence is deliberately not a whole-storey plenum; fire/acoustic/area/access duties remain.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** represented electrical route continuity, service packing, access, capacity and crossings.  
**Upstream owner if unresolved:** electrical/service-topology owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-11-R02 — room-scale accessible routes do not prove whole-circuit renewability

**Consequence / sequence:** whole rewire assumed easy because selected rooms have accessible edge routes.  
**Existing proposition:** suitable room-scale dry services may use removable architectural layers where proportionate; stable walls/floors may remain conventional.  
**Source / authority:** Accessible Room Service Route; OCG-00B conventional-surface baseline; Separate Structural Floor from Changeable Layers Where Proportionate.  
**Source class / maturity:** ACTIVE_PATTERN + STRATEGY + REFERENCE_OCCURRENCE; room route/floor strategy `supported`.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual branch/endpoint replacement path `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** selected local accessible route families and lifecycle separation.  
**Does not control:** every circuit segment, every endpoint, every wall, universal floor access or full withdrawal of incumbent cable.  
**Permanent-burden / conflict note:** Replaceable Architectural Lining and Selective Floor Access remain held; the house does not buy universal technical surfaces merely to simplify a rare rewire.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** representative end-to-end circuit replacement sequences, endpoint access and any unavoidable quiet-wall/floor disturbance.  
**Upstream owner if unresolved:** electrical/room-interface/floor owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-11-R03 — service voids/crossings remain technically bounded

**Consequence / sequence:** accessible dry routes becoming continuous fire/acoustic/pest paths or later renewal puncturing boundaries without controlled reclosure.  
**Existing proposition:** open service voids stop at significant boundaries; services cross through deliberate reinstated penetrations rather than preserving continuous access volume.  
**Source / authority:** Compartmented Service Void; Designed Structural Penetration.  
**Source class / maturity:** ACTIVE_PATTERN; service void `supported`, penetration `established`; RH occurrences selected.  
**Finding:** `ADDRESSED` as a proposition constraint.  
**Causal ownership:** `ARCHITECTURE` + `ASSEMBLY_DETAIL`.  
**Evidence / knowledge state:** `PRESENT`; actual closure/crossing performance `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** boundary logic and requirement for deliberate reinstated crossings.  
**Does not control:** actual fire/acoustic construction, future cable-installation workmanship or whether a crossing has usable capacity.  
**Permanent-burden / conflict note:** this is specifically the counterweight to the access benefit; technical adequacy still requires owner proof.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05 crossing occurrences/access; fire/acoustic technical proof.  
**Upstream owner if unresolved:** fire/acoustic/service-boundary owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-11-R04 — primary isolation/outage scope

**Consequence / sequence:** whole-system renewal or staged renewal disabling more of the dwelling than topology requires.  
**Existing proposition:** controlled utility entry and plant/distribution geography keep principal electrical isolation/distribution legible and concentrated; no claim is made that every circuit can remain live through system renewal.  
**Source / authority:** Controlled Utility Entry; Plant Room as Service Hub; OCG-00B.  
**Source class / maturity:** ACTIVE_PATTERN + REFERENCE_OCCURRENCE; utility entry/hub `established`.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE` for permanent isolation/distribution topology; `CONTRACTOR_METHOD` for staging/temporary-power programme.  
**Evidence / knowledge state:** `PRESENT`; actual board/circuit dependencies `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `SUPPORTED_INFERENCE`.  
**Controls:** legible principal isolation/distribution.  
**Does not control:** uninterrupted occupation, independent energisation of every branch, future temporary-power arrangement.  
**Permanent-burden / conflict note:** duplicating permanent electrical systems simply to avoid renewal outage is not selected.  
**Next proof route:** `OCG05_REQUIRED` for topology; `DELIVERY_METHOD_REQUIRED` for staging/temporary power.  
**Outstanding facts:** actual distribution hierarchy and plausible outage scope.  
**Upstream owner if unresolved:** electrical owner + delivery.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-11-R05 — Physical Service Index / discovery reduction

**Consequence / sequence:** exploratory investigation caused by illegible circuit/service identity.  
**Existing proposition:** maintain a durable physical index tied to richer records.  
**Source / authority:** Physical Service Index.  
**Source class / maturity:** ACTIVE_PATTERN, **`proposed`**; RH occurrence is direction only.  
**Finding:** `UNRESOLVED`.  
**Causal ownership:** `ARCHITECTURE` / stewardship.  
**Evidence / knowledge state:** `PRESENT` proposition; evidential adequacy `UNKNOWN`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** intended identity/discovery assistance if implemented and maintained.  
**Does not control:** physical route coherence, stale records, as-built correspondence or circuit replaceability.  
**Permanent-burden / conflict note:** small physical burden but real stewardship/change-control liability; cannot carry the core renewal claim.  
**Next proof route:** `OWNER_PROOF_REQUIRED`.  
**Outstanding facts:** mature indexing/change-control evidence.  
**Upstream owner if unresolved:** stewardship/information owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-11-R06 — temporary power, sequencing, dust and protection

**Consequence / sequence:** keeping safe essential functions during rewire and managing temporary worksite effects.  
**Existing proposition:** temporary power, work phasing, source control and protection are competent delivery/method matters once permanent topology is known.  
**Source / authority:** OCG-02A/C; delivery.  
**Source class / maturity:** RESEARCH + DELIVERY.  
**Finding:** `NOT_ARCHITECTURE_OWNED`.  
**Causal ownership:** `CONTRACTOR_METHOD` by default.  
**Evidence / knowledge state:** `PRESENT`; actual method `NOT_REPRESENTED`.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** temporary work method.  
**Does not control:** permanent route/isolation geometry that may make staging unnecessarily difficult.  
**Permanent-burden / conflict note:** no permanent duplicate temporary-power architecture earned by default.  
**Next proof route:** `DELIVERY_METHOD_REQUIRED`, with OCG-05 only for permanent-topology cause.  
**Outstanding facts:** real renewal programme/method.  
**Upstream owner if unresolved:** delivery/electrical contractor.  
**OCG-specific addition earned now:** **NO**.

### CI-11 synthesis

**Existing strength:** the project has a coherent building-scale dry-service architecture and explicit boundary/crossing discipline.

**Critical bounded partial:** room-edge routes and lifecycle separation do **not** prove full end-to-end circuit renewability. Whole-system renewal remains a stronger test than adding one future data branch.

**OCG-05 queue:** representative whole-circuit replacement sequences, route continuity/capacity/access, endpoints, crossings and outage topology.

**Owner/method queue:** fire/acoustic closure, stewardship/index maturity and temporary-power/phasing method.

**OCG-specific addition earned now:** **NO**.

---

# 3. CI-12 — renew / materially upgrade primary space-heating system

**Class:** IC5  
**Principal dimensions:** access/permanent fabric; services; occupancy; logistics; reinstatement; recovery.

## OCG-04D-CI-12-R01 — plant renewal geography

**Consequence / sequence:** heat-source/primary plant renewal requiring work through principal occupied rooms or lacking replacement clearance; `isolate → decommission → withdraw → introduce replacement → reconnect/commission`.  
**Existing proposition:** concentrate major heating plant/isolation/distribution in the plant/service hub with explicit working and replacement geography.  
**Source / authority:** Plant Room as Service Hub; OCG-00B heating/service baseline.  
**Source class / maturity:** ACTIVE_PATTERN `established` + REFERENCE_OCCURRENCE.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; future heat-source/package geometry `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** plant-side working/replacement/approach proposition.  
**Does not control:** future system type, module dimensions, external source equipment/interface or actual commissioning.  
**Permanent-burden / conflict note:** hub area/noise/heat/fire/acoustic burdens remain explicit.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual incumbent plant packing/replacement route and credible future renewal envelope.  
**Upstream owner if unresolved:** heating/plant owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-12-R02 — primary heating distribution is not proven universally replaceable

**Consequence / sequence:** system renewal assumed bounded because primary heating leaves the plant room through coherent service geography.  
**Existing proposition:** launch low-temperature heating distribution from concentrated service geography and use coherent routes, but do not treat every floor/wall as an accessible service void.  
**Source / authority:** OCG-00B; Coherent Horizontal Service Route; Accessible Vertical Service Zone where relevant; floor-layer strategy.  
**Source class / maturity:** REFERENCE_OCCURRENCE + ACTIVE_PATTERN + STRATEGY; horizontal/vertical/floor strategy `supported`.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual heating branch route/access `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `SUPPORTED_INFERENCE`.  
**Controls:** primary route concentration and deliberate avoidance of ad-hoc structural-depth service distribution.  
**Does not control:** actual emitter-branch accessibility, whole-pipe withdrawal, branch isolation, underfloor access or reuse in a future system type.  
**Permanent-burden / conflict note:** universal accessible floor/void infrastructure remains unselected; route access must pay fire/acoustic/depth/character cost.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual heating distribution topology, route access, branch segmentation and retained-versus-renewed sequence.  
**Upstream owner if unresolved:** heating/service-topology/floor owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-12-R03 — building-side major-plant replacement path

**Consequence / sequence:** old plant cannot reach the building exit or new plant cannot reach the operating position.  
**Existing proposition:** plant maintenance geography includes a credible replacement path from operating position through the building.  
**Source / authority:** Plant Room as Service Hub; Constitution 5.  
**Source class / maturity:** ACTIVE_PATTERN `established` + CONSTITUTION; RH occurrence carries explicit withdrawal proof debt.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual plant envelope/route `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** building-side replacement-path proposition.  
**Does not control:** future product geometry, external site continuation, staging or specialist handling.  
**Permanent-burden / conflict note:** route/door/turn geometry must remain proportionate and domestically resolved.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual plant envelope/orientation, turns, doors, thresholds and exit.  
**Upstream owner if unresolved:** heating/plant owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-12-R04 — whole-system material / waste logistics

**Consequence / sequence:** old/new distribution materials, equipment, packaging and waste spreading through unrelated domestic territory during system renewal.  
**Existing proposition:** complete material/waste routes must be traced; permanent circulation geometry may bound them, while staging/protection/sequence remain delivery work.  
**Source / authority:** current HFI task-route strategy; OCG-02C.  
**Source class / maturity:** STRATEGY + RESEARCH.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `SHARED`.  
**Evidence / knowledge state:** `PRESENT` as analytical proposition; actual CI-12 logistics `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `SUPPORTED_INFERENCE`.  
**Controls:** requirement to trace permanent approach/turn/threshold route and not ignore waste/replacement movement.  
**Does not control:** package dimensions, specialist handling, temporary staging, external continuation.  
**Permanent-burden / conflict note:** no permanent contractor staging room or second circulation system is selected.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05 internal route; SITE_DPL external continuation where relevant; delivery staging/handling.  
**Upstream owner if unresolved:** HFI/circulation + DPL + delivery.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-12-R05 — isolation and coupled heating/hot-water consequence

**Consequence / sequence:** system renewal disabling coupled services more broadly than architecture requires.  
**Existing proposition:** major isolation is concentrated/legible, but no proposition guarantees independent continued service for every coupled heating/hot-water subsystem during renewal.  
**Source / authority:** Plant Room as Service Hub; Fail-Safe Water Distribution where water coupling applies; OCG-00B.  
**Source class / maturity:** ACTIVE_PATTERN + STRATEGY + REFERENCE_OCCURRENCE.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE` for permanent topology/outage scope; `CONTRACTOR_METHOD` for programme/temporary provision.  
**Evidence / knowledge state:** `PRESENT`; actual heating/hot-water coupling `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `SUPPORTED_INFERENCE`.  
**Controls:** accessible principal isolation and concentrated dependencies.  
**Does not control:** future system coupling, temporary bypass or continuous hot-water/heating provision.  
**Permanent-burden / conflict note:** duplicate permanent systems are not selected merely to eliminate renewal outage.  
**Next proof route:** `OCG05_REQUIRED` + `DELIVERY_METHOD_REQUIRED` if temporary provision is needed.  
**Outstanding facts:** actual plant/system dependency graph and isolation hierarchy.  
**Upstream owner if unresolved:** heating/hot-water owner + delivery.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-12-R06 — future heat-source / utility-interface change

**Consequence / sequence:** material system upgrade requiring a different external utility/source interface.  
**Existing proposition:** Controlled Utility Entry groups transitions but keeps utility families distinct and does not presume one permanent energy technology or universal future interface.  
**Source / authority:** Controlled Utility Entry; Constitution 1/6.  
**Source class / maturity:** ACTIVE_PATTERN `established` + CONSTITUTION.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE` for controlled transition geography; `SITE_PROJECT` for real future utility/source.  
**Evidence / knowledge state:** `PRESENT`; future source/site requirement `UNKNOWN`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** legible bounded building transition and separation.  
**Does not control:** unknowable future source technology, external plant, utility rules or site route.  
**Permanent-burden / conflict note:** speculative oversized universal utility reserve is not justified by the pattern.  
**Next proof route:** `MULTIPLE` only when a future target exists — owner/system + SITE_DPL; OCG-05 for represented current transition geometry.  
**Outstanding facts:** actual current/future source interfaces.  
**Upstream owner if unresolved:** energy/services + DPL/site.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-12-R07 — temporary heating/hot-water and commissioning programme

**Consequence / sequence:** temporary comfort/service loss, temporary plant, filling/balancing/commissioning duration.  
**Existing proposition:** outage duration and temporary provision are strongly task/product/method dependent; architecture is judged on scope/topology, not a universal duration promise.  
**Source / authority:** OCG-02A/C; delivery.  
**Source class / maturity:** RESEARCH + DELIVERY.  
**Finding:** `NOT_ARCHITECTURE_OWNED`.  
**Causal ownership:** `CONTRACTOR_METHOD` by default.  
**Evidence / knowledge state:** `PRESENT`; actual future duration `UNKNOWN`.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** temporary provision/programme/commissioning method.  
**Does not control:** permanent outage scope or route geometry.  
**Permanent-burden / conflict note:** no permanent duplicate heating system earned by default.  
**Next proof route:** `DELIVERY_METHOD_REQUIRED`.  
**Outstanding facts:** actual renewal target, season and commissioning method.  
**Upstream owner if unresolved:** heating engineer/delivery.  
**OCG-specific addition earned now:** **NO**.

### CI-12 synthesis

**Existing strength:** major plant renewal is conceptually strong because the plant hub is an established pattern with explicit replacement geography.

**Critical bounded partial:** primary heating distribution is not thereby proven fully accessible/replaceable; branch topology remains the major OCG-05 question.

**OCG-05 queue:** plant packing/replacement route, actual heating distribution/access/branch segmentation and coupled isolation.

**Other-owner queue:** future utility/site interface, whole-system staging/handling, commissioning and temporary provision.

**OCG-specific addition earned now:** **NO**.

---

# 4. CI-13 — major load-bearing-wall replanning control

**Class:** IC6 — primary spatial / structural alteration — control class  
**Principal dimensions:** all seven consequence dimensions, with especially large access/fabric, occupancy, worksite, logistics and reinstatement envelopes.

## OCG-04D-CI-13-R01 — low-disruption major structural replanning is deliberately not a selected promise

**Consequence / sequence:** deliberate removal of slow primary structure generating wide temporary works, demolition, debris, room surrender and reinstatement.  
**Existing proposition:** the house is designed for change over time **proportionately**, while defining structural/spatial relationships may legitimately remain slow architectural fabric; changeability is concentrated where it earns itself.  
**Source / authority:** Constitution 1/2/5/7; OCG-01D proportionality framework; OCG-02D counter-evidence.  
**Source class / maturity:** CONSTITUTION + STRATEGY + RESEARCH.  
**Finding:** `UNADDRESSED` **deliberately** for the proposition that arbitrary primary structural replanning should be low-disruption.  
**Causal ownership:** `ARCHITECTURE` for the permanence of selected load-bearing/spatial structure; the wide consequence is intrinsic to intentionally changing that slow layer.  
**Evidence / knowledge state:** `PRESENT` — non-provision is explicit in governing posture, not model silence.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** honest non-promise boundary.  
**Does not control:** the future structural solution or intervention envelope if CI-13 is chosen.  
**Permanent-burden / conflict note:** permanently making primary load-bearing walls generically movable/demountable would impose structural, acoustic, fire, robustness, cost and architectural burdens for a rare arbitrary brief.  
**Next proof route:** `NONE` for the proposition-level non-promise; OCG-05 may instantiate the consequence envelope as a control.  
**Outstanding facts:** physical magnitude/route of one control instance, not whether generic structural flexibility is selected.  
**Upstream owner if unresolved:** structural owner for any actual future alteration.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-13-R02 — controlled service geography may reduce embedded-service discovery but does not make wall removal easy

**Consequence / sequence:** structural demolition additionally complicated by unexpected primary services inside permanent wall fabric.  
**Existing proposition:** primary services should avoid permanent structural/quiet fabric where reasonable and use controlled routes/crossings instead.  
**Source / authority:** Constitution 2/3/5; Coherent Horizontal Service Route; Accessible Vertical Service Zone; Designed Structural Penetration.  
**Source class / maturity:** CONSTITUTION + ACTIVE_PATTERN; horizontal/vertical `supported`, penetration `established`.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual CI-13 wall/service intersections `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** proposition against opportunistic primary service embedding and uncontrolled crossings.  
**Does not control:** local wiring/fixings, actual selected wall, temporary works or need to reroute services that legitimately intersect.  
**Permanent-burden / conflict note:** service concentration serves ordinary maintenance first; it is not latent structural-remodelling infrastructure.  
**Next proof route:** `OCG05_REQUIRED` for the selected control wall/service relationships.  
**Outstanding facts:** actual service crossings/fixings at the control wall.  
**Upstream owner if unresolved:** structural + services owners.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-13-R03 — designed structural penetrations do not provide generic future opening capacity

**Consequence / sequence:** treating registered service crossings as evidence that major new structural openings are pre-authorised or easy.  
**Existing proposition:** consequential penetrations are deliberate interfaces for known service needs; speculative spare openings are rejected.  
**Source / authority:** Designed Structural Penetration.  
**Source class / maturity:** ACTIVE_PATTERN, `established`.  
**Finding:** `PARTIAL` only for existing crossing discipline; it offers no generic CI-13 opening capacity.  
**Causal ownership:** `SHARED`.  
**Evidence / knowledge state:** `PRESENT`; future structural opening design `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** known crossing interfaces.  
**Does not control:** future load-bearing wall removal or large opening formation.  
**Permanent-burden / conflict note:** speculative structural reserves must separately earn themselves.  
**Next proof route:** `OWNER_PROOF_REQUIRED` if CI-13 is pursued.  
**Outstanding facts:** actual future structural design/temporary works.  
**Upstream owner if unresolved:** structural owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-13-R04 — temporary works, dust/noise/debris and safe occupation

**Consequence / sequence:** propping, demolition, cutting, noise/vibration, debris handling, exclusions and decant.  
**Existing proposition:** these are intrinsic/method consequences of a chosen major structural alteration; OCG explicitly allows room surrender or temporary absence/decant to win.  
**Source / authority:** OCG-02A/C/D; delivery.  
**Source class / maturity:** RESEARCH + DELIVERY.  
**Finding:** `NOT_ARCHITECTURE_OWNED` as a missing serviceability proposition.  
**Causal ownership:** `SHARED` between technical temporary-works requirements and contractor method; the permanent house is audited separately for any avoidable amplification.  
**Evidence / knowledge state:** `PRESENT`; actual method/decant need `UNKNOWN`.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** prevents OCG from demanding a permanently construction-ready house for rare slow-fabric alteration.  
**Does not control:** whether the chosen wall/route makes the specific intervention more or less difficult.  
**Permanent-burden / conflict note:** no permanent clean/dirty contractor route, structural demountability or universal decant-free promise earned.  
**Next proof route:** `DELIVERY_METHOD_REQUIRED` + `OWNER_PROOF_REQUIRED`; OCG-05 only for house-specific consequence envelope.  
**Outstanding facts:** actual temporary works/safety/occupation plan.  
**Upstream owner if unresolved:** structural engineer + delivery.  
**OCG-specific addition earned now:** **NO**.

## OCG-04D-CI-13-R05 — held/generic flexibility systems cannot be imported to defeat the control

**Consequence / sequence:** using unselected demountability/flexible-partition/service-void concepts to make primary replanning appear routine.  
**Existing proposition:** OCG-02B/D and current pattern authority reject maximum generic flexibility; held candidates remain non-selected.  
**Source / authority:** OCG-00B held-candidate baseline; OCG-02B/D; Constitution 7.  
**Source class / maturity:** HELD_CANDIDATE + RESEARCH + CONSTITUTION.  
**Finding:** `UNADDRESSED` by current selected architecture, intentionally.  
**Causal ownership:** `ARCHITECTURE` if such systems were ever selected; presently they are absent by decision.  
**Evidence / knowledge state:** `PRESENT` as explicit non-selection.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** anti-gaming boundary only.  
**Does not control:** CI-13 disruption.  
**Permanent-burden / conflict note:** adaptable-housing evidence includes acoustic/tolerance/visual/low-use failures; generic flexibility has not paid rent.  
**Next proof route:** `NONE` at OCG-04.  
**Outstanding facts:** none for present non-selection.  
**Upstream owner if unresolved:** only later architecture/structure if independent evidence genuinely reopens the question.  
**OCG-specific addition earned now:** **NO**.

### CI-13 synthesis

**The control succeeds if the project can remain intellectually comfortable with wide disruption here.**

Ovid’s House expects repair, renewal and some alteration over time, but current authority does **not** promise that deliberate alteration of primary load-bearing/spatial structure is low-disruption or compatible with normal occupation.

Controlled service geography may reduce accidental embedded-service complication, but it is not a structural-flexibility system.

The deliberate `UNADDRESSED` finding is therefore a non-promise boundary, not a defect waiting for OCG to fix.

**OCG-05 queue:** only enough physical instantiation to preserve the control boundary and identify actual service intersections; no redesign is authorised.

**Owner/method queue:** structural design, temporary works, decant/occupation safety and demolition method.

**OCG-specific addition earned now:** **NO**.

---

# 5. Cross-scenario observations for OCG-04E

## 5.1 Whole-system renewal exposes the limits of local-serviceability rhetoric

CI-11 and CI-12 prevent small-component access from standing in for system renewability.

Current architecture is strongest at:

- primary service concentration;
- coherent trunks/routes;
- plant working/replacement geography;
- controlled crossings;
- local room-edge access where justified.

It deliberately does **not** yet establish that:

- every circuit is withdrawable end to end;
- every heating branch is accessible;
- every endpoint is replaceable without local finish work;
- every subsystem remains operational during primary renewal.

## 5.2 The principal IC5 result is `PARTIAL`, not missing doctrine

Existing system architecture credibly reduces discovery/destructive propagation, but OCG-05 must establish how much a real whole-system renewal remains inside selected service geography.

Universal access floors, wall linings and spare service plenums remain unearned.

## 5.3 IC6 establishes a clean non-promise boundary

CI-13 reveals no proposition-level contradiction between “build for time” and durable architecture.

The constitution already says permanent structural/spatial relationships may endure, changeability should be concentrated where it earns itself and serviceability is pursued proportionately.

Therefore broad “house as platform” language must be read through that constitutional limit, not as a promise that arbitrary structural replanning is routine.

No proposition-level `CONFLICT` is found here.

## 5.4 `UNADDRESSED` can be a successful controlled result

CI-13, like CI-10 in the parallel IC4 audit, preserves explicit non-provision where generic future flexibility would carry greater permanent burden than credible intervention value.

`UNADDRESSED` is diagnostic. It is not equivalent to `ARCHITECTURAL_RESPONSE_CANDIDATE`.

## 5.5 Method/site remain separate from architecture

Temporary power, temporary heating, handling, staging, demolition control, temporary works and decant are not permanent architectural systems by default.

Architecture remains responsible for topology/geometry that needlessly enlarges those tasks.

---

# 6. Forward proof queue from OCG-04D

## OCG-05

- CI-11 — primary electrical route continuity/capacity/access, representative end-to-end circuit renewal, endpoint/crossing conditions and outage topology;
- CI-12 — plant packing/replacement path, primary heating-distribution route/access/branch segmentation and coupled isolation;
- CI-13 — control-wall/service intersections and enough physical instantiation to preserve the IC6 boundary without redesigning it.

## Owning technical authorities

- electrical design/testing and fire/acoustic closure;
- heating system/commissioning and hydronic detail where applicable;
- structural design/temporary works for CI-13;
- Physical Service Index maturity/change control.

## Site / DPL

- any future external energy/utility interface;
- plant replacement site continuation where relevant.

## Delivery / method

- temporary power/heating;
- renewal phasing;
- major plant/material handling/staging;
- demolition/containment/debris;
- occupation safety/decant.

---

# Result

**OCG-04D PASS as an audit packet — CI-11…CI-13 now have schema-complete proposition-level findings under OCG-04A.**

The packet does not find a new OCG-specific doctrine proposition earned now.

Its two main results are:

1. whole-system electrical/heating renewal remains only **partially** supported by targeted route/serviceability propositions until OCG-05 proves actual branch/circuit renewal geography; and
2. CI-13 establishes a coherent deliberate `UNADDRESSED` boundary for arbitrary major structural replanning rather than a mandate for generic structural flexibility.

OCG-04E must reconcile these findings with OCG-04B/04C before any programme-level conclusion.

No architecture, doctrine, pattern, Reference House, compiler constraint, drawing, delivery requirement or publication prose is changed by this packet.