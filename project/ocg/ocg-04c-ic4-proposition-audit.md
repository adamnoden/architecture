# OCG-04C — IC4 Proposition Audit

**Programme:** OCG — Occupied Change  
**Parent:** [#593 — OCG-04 existing-doctrine / system audit](https://github.com/adamnoden/architecture/issues/593)  
**Packet:** [#596 — OCG-04C](https://github.com/adamnoden/architecture/issues/596)  
**Depends on:** OCG-04A / PR #599 / merge `831a7f7eac7a762b08e2ccf7b23e5121659546b7`  
**Baseline:** `831a7f7eac7a762b08e2ccf7b23e5121659546b7`  
**Method:** `project/ocg/ocg-04a-audit-method.md`  
**State:** candidate proposition audit; becomes the OCG-04C record when merged

## Purpose

Audit canonical IC4 scenarios CI-08…CI-10 against current Ovid’s House propositions.

IC4 is deliberately different from the component/branch cases. A genuine bathroom or kitchen refit **is construction**: fixtures, finishes, furniture and some local interfaces are intentionally renewed. OCG therefore asks a narrower question:

> **Which consequences are intrinsic to renewing the room, and which spread into unrelated house territory only because service geography, interfaces, isolation or logistics are poorly resolved?**

For CI-10 the inverse question is equally important:

> **Has the project deliberately chosen not to pre-provision a speculative remote wet-room brief, and is that bounded non-provision coherent rather than an accidental omission?**

No scenario receives one overall status.

---

# 1. Controlling posture

The following OCG-02 findings are especially controlling:

- room/function loss can be real even where the physical work area is small;
- temporary containment, protection, housekeeping and much sequencing remain contractor/method owned;
- wet-trade curing is product/process specific and cannot be assigned a universal duration;
- off-site preparation earns credit only where it actually deletes or compresses onsite work;
- architecture should not abolish the construction site; it should avoid unnecessary propagation beyond the task that genuinely requires it;
- targeted latent capacity is stronger than generic flexibility where the future brief is not sufficiently credible.

Evidence-state and conflict conventions follow OCG-04A unchanged.

---

# 2. CI-08 — complete family-bathroom refit

**Class:** IC4 — room / local functional refit  
**Principal dimensions:** access/permanent fabric; services; occupancy; worksite/contamination; logistics; reinstatement; recovery.

## OCG-04C-CI-08-R01 — high-service-room interface localises service work

**Consequence / sequence:** a bathroom refit propagating into unrelated walls/floors because valves, cisterns, controls, soil/waste or service connections can only be reached destructively outside the intended room/service edge.  
**Existing proposition:** align the principal upper wet room with concentrated service geography and bias high-maintenance components toward a dry/maintainable service side.  
**Source / authority:** High-Service-Room Service Wall; Coherent Horizontal Service Route; Accessible Vertical Service Zone; OCG-00B upper-bathroom baseline.  
**Source class / maturity:** ACTIVE_PATTERN + REFERENCE_OCCURRENCE; service wall/horizontal/vertical patterns `supported`; RH occurrence selected.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual room/service-edge geometry `NOT_REPRESENTED` at this layer.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** proposition that routine local service interfaces and high-burden wet routes should remain near the selected wet/service geography.  
**Does not control:** actual fixture-product packing, complete branch access, retained/changed fixture positions or physical room-refit sequence.  
**Permanent-burden / conflict note:** extra service-wall depth and access closures retain acoustic/fire/privacy/area duties; no actual contradiction identified here.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual fixture/service-wall relationship, route crossings, access openings and working geometry.  
**Upstream owner if unresolved:** wet-room/service-topology owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-08-R02 — waterproofing is not routine service access

**Consequence / sequence:** refit/service work outside the intended wet-finish renewal scope becoming necessary because access itself relies on destroying the waterproof boundary.  
**Existing proposition:** dry-side/maintainable access and wet-room technical boundaries should remain logically independent where proportionate.  
**Source / authority:** High-Service-Room Service Wall; Failure-Tolerant Wet Service Room; OCG-00B.  
**Source class / maturity:** ACTIVE_PATTERN + REFERENCE_OCCURRENCE; both patterns `supported`.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE` + `ASSEMBLY_DETAIL`.  
**Evidence / knowledge state:** `PRESENT`; actual technical build-up `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** causal separation between maintainable service access and the primary wet boundary.  
**Does not control:** the fact that a **complete bathroom refit** may intentionally renew waterproofing/finishes anyway, nor actual waterproofing/fire/acoustic performance.  
**Permanent-burden / conflict note:** access cannot be credited if it weakens the permanent room boundary; owner technical proof remains required.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05 physical interface; wet-room/fire/acoustic detail performance.  
**Upstream owner if unresolved:** wet-room/detail owners.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-08-R03 — local isolation is useful but deliberately non-universal

**Consequence / sequence:** room refit disabling unrelated water functions because service isolation can only occur at whole-house level.  
**Existing proposition:** provide accessible principal/consequential isolation and bias local wet-service controls to service geography without selecting universal per-user/per-branch manifold infrastructure.  
**Source / authority:** Fail-Safe Water Distribution; OCG-00B isolation baseline.  
**Source class / maturity:** STRATEGY + REFERENCE_OCCURRENCE; Individually Isolatable Manifold Distribution is HELD_CANDIDATE.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE` for outage scope; `CONTRACTOR_METHOD` for duration/sequence.  
**Evidence / knowledge state:** `PRESENT`; actual bathroom isolation topology `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `SUPPORTED_INFERENCE`.  
**Controls:** accessible/localised isolation where selected.  
**Does not control:** independent isolation of every fixture/branch or uninterrupted unrelated water use.  
**Permanent-burden / conflict note:** universal manifold complexity remains deliberately unearned.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual bathroom branch/fixture isolation and coupled outage scope.  
**Upstream owner if unresolved:** water-services owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-08-R04 — bathroom extract route remains a bounded maintainable subsystem

**Consequence / sequence:** room refit requiring distant destructive work merely to clean/replace fan/grille or reconnect bathroom extract.  
**Existing proposition:** provide source-capture bathroom extraction through a short, maintainable air path whose fan/grille/controls are serviceable and whose route is coordinated with the service topology.  
**Source / authority:** `docs/patterns/source-capture-bathroom-extract.md`.  
**Source class / maturity:** ACTIVE_PATTERN, `supported`; RH occurrence selected.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE` + `ASSEMBLY_DETAIL`.  
**Evidence / knowledge state:** `PRESENT`; actual duct/fan access `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** maintainable source-to-terminal route proposition.  
**Does not control:** actual airflow, condensate, acoustics, terminal or commissioning.  
**Permanent-burden / conflict note:** penetrations retain air/thermal/weather/fire/acoustic/pest duties.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05 route/access geometry; ventilation owner performance/commissioning.  
**Upstream owner if unresolved:** ventilation/environmental owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-08-R05 — intrinsic room surrender / wet work / curing

**Consequence / sequence:** bathroom unavailable while fixtures/wet finishes are intentionally removed/rebuilt and while selected wet products cure/dry.  
**Existing proposition:** OCG-02 explicitly rejects a universal zero-disruption or zero-wet-trade promise; product/process recovery is recorded from actual technical evidence.  
**Source / authority:** OCG-02A/02D; wet-room/product technical authority.  
**Source class / maturity:** RESEARCH + OWNER TECHNICAL AUTHORITY.  
**Finding:** `NOT_ARCHITECTURE_OWNED` as an OCG serviceability gap where the work is intrinsic to the chosen complete refit.  
**Causal ownership:** `NOT_ARCHITECTURE_OWNED` for the intentional room-function loss; `ASSEMBLY_DETAIL` for product-specific curing requirements.  
**Evidence / knowledge state:** `PRESENT` as causal principle; actual duration `UNKNOWN`.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** distinguishes genuine refit work from collateral access destruction.  
**Does not control:** whether current architecture unnecessarily spreads that work outside the room/service edge.  
**Permanent-burden / conflict note:** wet construction remains legitimate where it performs the durable room function best.  
**Next proof route:** `OWNER_PROOF_REQUIRED` for actual product/process duration; OCG-05 only for collateral spread.  
**Outstanding facts:** selected finish/waterproofing system and return-to-use requirements.  
**Upstream owner if unresolved:** wet-room/material owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-08-R06 — temporary containment / material / waste route

**Consequence / sequence:** protecting occupied circulation, moving removed/new bathroom materials and cleaning.  
**Existing proposition:** ordinary temporary separation/protection/housekeeping remain method-owned; architecture is accountable only where route geometry needlessly expands occupied territory or prevents containment.  
**Source / authority:** OCG-02A/C; delivery.  
**Source class / maturity:** RESEARCH + DELIVERY.  
**Finding:** `NOT_ARCHITECTURE_OWNED`.  
**Causal ownership:** `CONTRACTOR_METHOD` by default.  
**Evidence / knowledge state:** `PRESENT`; actual route `NOT_REPRESENTED`.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** temporary worksite/logistics method.  
**Does not control:** permanent route geometry if it proves unusually destructive.  
**Permanent-burden / conflict note:** no dedicated contractor circulation earned.  
**Next proof route:** `DELIVERY_METHOD_REQUIRED`; OCG-05 for route geometry only.  
**Outstanding facts:** actual occupied/material/waste route.  
**Upstream owner if unresolved:** delivery + OCG-05.  
**OCG-specific addition earned now:** **NO**.

### CI-08 synthesis

**Existing strengths:** wet/service concentration, dry-side service access, independent wet boundary logic and maintainable bathroom extract all directly target collateral propagation.

**Bounded partial:** isolation is intentionally not universal.

**Intrinsic consequence protected from false failure:** surrendering the bathroom and renewing genuine wet-room finishes are part of a complete bathroom refit; OCG does not require the house to make them disappear.

**OCG-05 queue:** actual service-wall/interface geometry, route crossings, bathroom isolation and extract access.

**Owner/method queue:** wet-build-up performance/curing and temporary containment/logistics.

**OCG-specific addition earned now:** **NO**.

---

# 3. CI-09 — complete kitchen refit

**Class:** IC4  
**Principal dimensions:** access/permanent fabric; services; occupancy; worksite; logistics; reinstatement; recovery.

## OCG-04C-CI-09-R01 — kitchen adjacency to concentrated service geography

**Consequence / sequence:** complete kitchen renewal spreading water/waste/power work through principal floor/wall territory because local service connections are remote or ad hoc.  
**Existing proposition:** place the kitchen adjacent to the high-service geography and keep sink/appliance wet branches short, with accessible local service-edge relationships.  
**Source / authority:** OCG-00B kitchen baseline; Coherent Horizontal Service Route; High-Service-Room Service Wall where its context genuinely applies; service-topology sequence.  
**Source class / maturity:** REFERENCE_OCCURRENCE + ACTIVE_PATTERN; relevant route/service-wall patterns `supported`.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual cabinet/service-edge packing `NOT_REPRESENTED` here.  
**Evidence basis:** `CONTROLLED_SOURCE` + `SUPPORTED_INFERENCE`.  
**Controls:** concentrated/short local service-route proposition.  
**Does not control:** actual future cabinet module, changed appliance locations, worktop geometry or complete service accessibility behind installed furniture.  
**Permanent-burden / conflict note:** service-edge provision cannot dominate kitchen use/storage or become visible technical infrastructure without justification.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual kitchen service edge, cabinet/appliance conflicts, branch access and route geometry.  
**Upstream owner if unresolved:** kitchen/service topology owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-09-R02 — kitchen source-capture route is maintainable and bounded

**Consequence / sequence:** refit/maintenance requiring long concealed grease-laden duct work or repeated coring because extraction was residual.  
**Existing proposition:** capture cooking contaminants at source with one deliberate, short/maintainable route whose fan/filter/duct/terminal relationships are coordinated.  
**Source / authority:** `docs/patterns/source-capture-kitchen-extract.md`.  
**Source class / maturity:** ACTIVE_PATTERN, `established`; RH occurrence selected.  
**Finding:** `ADDRESSED`.  
**Causal ownership:** `ARCHITECTURE` + `ASSEMBLY_DETAIL`.  
**Evidence / knowledge state:** `PRESENT`; actual duct/hood/terminal performance `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** deliberate maintainable source-to-discharge route and replaceable fan/filter/control expectation.  
**Does not control:** actual capture performance, airflow, replacement air, acoustics or terminal nuisance.  
**Permanent-burden / conflict note:** route penetrations retain weather/fire/acoustic/air/pest duties.  
**Next proof route:** `MULTIPLE`.  
**Outstanding facts:** OCG-05 access/route occurrence; ventilation owner engineering/commissioning.  
**Upstream owner if unresolved:** kitchen ventilation/environmental owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-09-R03 — local service isolation

**Consequence / sequence:** kitchen refit shutting broad unrelated services because appliance/sink connections cannot be isolated locally.  
**Existing proposition:** appliance valves/joints are biased toward accessible service edges, while universal manifold-style isolation is not selected.  
**Source / authority:** OCG-00B kitchen/isolation baseline; Fail-Safe Water Distribution.  
**Source class / maturity:** REFERENCE_OCCURRENCE + STRATEGY.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE` for topology; contractor/task for duration.  
**Evidence / knowledge state:** `PRESENT`; actual future kitchen dependency graph `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** local isolation direction for common water/appliance interfaces.  
**Does not control:** every future altered fixture/appliance position or all electrical/gas/other service dependencies.  
**Permanent-burden / conflict note:** no universal isolation infrastructure earned.  
**Next proof route:** `OCG05_REQUIRED`.  
**Outstanding facts:** actual local isolation points and coupled service consequences.  
**Upstream owner if unresolved:** kitchen/services owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-09-R04 — off-site preparation / manufacturing

**Consequence / sequence:** cutting/fabrication/assembly work occurring inside the occupied house when it could credibly be removed or compressed off site.  
**Existing proposition:** prefabricate only where doing so materially improves quality/repeatability or removes useful onsite operations; rational site fabrication remains legitimate where measurement/tolerance/control favour it.  
**Source / authority:** `docs/development/manufacturing-strategy.md`; OCG-02C.  
**Source class / maturity:** DEVELOPMENT_STRATEGY + RESEARCH.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ASSEMBLY_DETAIL` + `CONTRACTOR_METHOD`.  
**Evidence / knowledge state:** `PRESENT`; actual kitchen package/process `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** decision rule against prefabrication theatre.  
**Does not control:** whether a particular future kitchen can be measured/prepared off site, nor whether worktop/cabinet/site tolerance still requires onsite cutting/scribing.  
**Permanent-burden / conflict note:** factory precision must not create bespoke proprietary dependencies or unrealistic tolerance demands.  
**Next proof route:** `MULTIPLE` — owner/manufacturing proof + delivery method; OCG-05 only where house geometry constrains assembly ingress/fit.  
**Outstanding facts:** actual future cabinet/worktop product and fabrication sequence.  
**Upstream owner if unresolved:** manufacturing/kitchen delivery owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-09-R05 — bulky material/removal route

**Consequence / sequence:** cabinets, worktops/appliances/waste forcing disproportionate occupation of unrelated domestic territory.  
**Existing proposition:** OCG/HFI already requires complete task/material routes to be traced rather than inferred from room distances, but no dedicated contractor circulation is selected.  
**Source / authority:** HFI task-route method; OCG-02C; current circulation architecture.  
**Source class / maturity:** CROSS-PROGRAMME METHOD + RESEARCH; physical RH route proof still outstanding.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `SHARED` — architecture owns permanent passage/turn/threshold geometry; delivery owns staging/protection/sequence.  
**Evidence / knowledge state:** `PRESENT` as analytical method; actual CI-09 route `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `SUPPORTED_INFERENCE`.  
**Controls:** requirement to trace complete logistics; ordinary generous domestic circulation where already selected.  
**Does not control:** actual future package dimensions or contractor staging method.  
**Permanent-burden / conflict note:** no second contractor corridor or permanent staging room is earned.  
**Next proof route:** `MULTIPLE` — OCG-05 for house route geometry; delivery for staging/protection.  
**Outstanding facts:** ingress/egress, turns, thresholds, package dimensions, temporary staging.  
**Upstream owner if unresolved:** HFI/circulation + delivery.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-09-R06 — loss of normal kitchen function during complete refit

**Consequence / sequence:** temporary loss of cooking/sink/storage while the kitchen itself is intentionally renewed.  
**Existing proposition:** OCG permits genuine room/function surrender where intrinsic to the intervention; temporary household arrangements are method/occupant/project decisions, not permanent duplicate infrastructure by default.  
**Source / authority:** OCG-02A/C/D.  
**Source class / maturity:** RESEARCH.  
**Finding:** `NOT_ARCHITECTURE_OWNED` as an OCG serviceability gap where the loss follows directly from choosing a complete kitchen refit.  
**Causal ownership:** `NOT_ARCHITECTURE_OWNED` / `CONTRACTOR_METHOD` for temporary arrangements.  
**Evidence / knowledge state:** `PRESENT`; actual duration `UNKNOWN`.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** prevents the audit from demanding duplicate permanent cooking infrastructure merely to avoid ordinary refit consequence.  
**Does not control:** unrelated-room/service loss caused by poor topology or logistics.  
**Permanent-burden / conflict note:** duplicated permanent facilities would carry area/cost/maintenance burdens.  
**Next proof route:** `DELIVERY_METHOD_REQUIRED`; OCG-05 only for collateral spread.  
**Outstanding facts:** actual programme and temporary arrangements if the intervention occurs.  
**Upstream owner if unresolved:** delivery/household/project.  
**OCG-specific addition earned now:** **NO**.

### CI-09 synthesis

**Existing strengths:** adjacency to concentrated service geography and an established source-capture extract pattern credibly bound several technical consequences.

**Bounded partials:** local isolation, off-site preparation and bulky logistics remain scenario/product/method dependent.

**Intrinsic consequence protected from false failure:** a complete kitchen refit may genuinely surrender kitchen function; no duplicate permanent kitchen is earned by that fact.

**OCG-05 queue:** service-edge/cabinet packing, actual local isolation, extract access and complete ingress/egress/turn route.

**Owner/method queue:** extraction engineering, fabrication/package strategy, staging/protection and programme.

**OCG-specific addition earned now:** **NO**.

---

# 4. CI-10 — create a remote en-suite outside selected wet-service geography

**Class:** IC4  
**Principal dimensions:** access/permanent fabric; services; occupancy; worksite; logistics; reinstatement; recovery.

CI-10 is the principal anti-overprovision control below IC6. The current project **deliberately deleted** the former remote principal en-suite because its service burden was disproportionate. OCG-04C must not rewrite that negative decision into accidental incompleteness.

## OCG-04C-CI-10-R01 — targeted wet-service geography deliberately does not serve arbitrary remote wet rooms

**Consequence / sequence:** future remote en-suite requires new water/soil/waste/extract/electrical routes across currently quiet/slow territory.  
**Existing proposition:** high-burden wet/soil/service geography is intentionally concentrated around selected demand; speculative remote wet-room infrastructure is not reserved merely for generic future flexibility.  
**Source / authority:** Constitution 1/2/5/7; service-topology sequence; OCG-00B remote-en-suite deletion and service-geography baseline.  
**Source class / maturity:** CONSTITUTION + STRATEGY/SEQUENCE + REFERENCE_OCCURRENCE/NEGATIVE BASELINE.  
**Finding:** `UNADDRESSED` **for the remote en-suite intervention consequence itself, deliberately**.  
**Causal ownership:** `ARCHITECTURE` because current topology intentionally does not provide a cheap remote wet route.  
**Evidence / knowledge state:** `PRESENT` — the non-provision is explicit, not model silence.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** establishes that the project knowingly selected targeted capacity rather than generic wet-service flexibility.  
**Does not control:** how a future owner would best execute CI-10 if they nevertheless choose it.  
**Permanent-burden / conflict note:** pre-provision would carry permanent stack/route/void/penetration/area/fire/acoustic/moisture/maintenance burdens for a speculative convenience; the earlier project test already rejected that trade.  
**Next proof route:** `NONE` for the proposition-level fact of non-provision; OCG-05 may still quantify the actual consequence envelope.  
**Outstanding facts:** physical magnitude of future disruption, not whether latent provision exists.  
**Upstream owner if unresolved:** none at proposition level; later proportionality/OCG-05 if the consequence needs quantification.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-10-R02 — existing service patterns can support only the portions they actually reach

**Consequence / sequence:** assuming current vertical/horizontal/service-wall patterns make the remote room easy merely because the house has good service topology elsewhere.  
**Existing proposition:** Accessible Vertical Service Zone and Coherent Horizontal Service Route serve selected demand/crossings; they explicitly reject oversized speculative capacity and whole-house plenums.  
**Source / authority:** Accessible Vertical Service Zone; Coherent Horizontal Service Route; High-Service-Room Service Wall.  
**Source class / maturity:** ACTIVE_PATTERN; all relevant patterns `supported`.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE`.  
**Evidence / knowledge state:** `PRESENT`; actual route from selected zone to remote target `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE`.  
**Controls:** existing topology up to its real selected boundary; potential connection points only where physically available.  
**Does not control:** gravity fall, new soil path, remote wet-route capacity or a route across quiet principal fabric.  
**Permanent-burden / conflict note:** extending the pattern’s scope by assertion would contradict its own proportionality guardrails.  
**Next proof route:** `OCG05_REQUIRED` only to establish the actual collateral route/consequence, not to infer hidden capacity.  
**Outstanding facts:** feasible future water/waste/soil/extract route and affected boundaries.  
**Upstream owner if unresolved:** service topology/wet-room owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-10-R03 — designed penetrations do not equal spare future penetrations

**Consequence / sequence:** future remote route crossing structure/protected boundaries.  
**Existing proposition:** consequential penetrations should be designed/owned when required; speculative arrays of spare holes are explicitly rejected.  
**Source / authority:** Designed Structural Penetration.  
**Source class / maturity:** ACTIVE_PATTERN, `established`.  
**Finding:** `PARTIAL`.  
**Causal ownership:** `ARCHITECTURE` + structural/technical owner.  
**Evidence / knowledge state:** `PRESENT`; future CI-10 crossing locations `NOT_REPRESENTED`.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** how an actually required future crossing must be resolved.  
**Does not control:** pre-existence of useful spare openings or permission to drill wherever convenient.  
**Permanent-burden / conflict note:** spare openings can weaken structure/fire/acoustics/pest control and become uncontrolled routes.  
**Next proof route:** `OWNER_PROOF_REQUIRED` if CI-10 is ever pursued; OCG-05 may identify likely crossing burden.  
**Outstanding facts:** future structural route/opening design.  
**Upstream owner if unresolved:** structural/service-boundary owner.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-10-R04 — held flexibility infrastructure cannot be imported

**Consequence / sequence:** using unselected deep service zones, manifolds, accessible floors or removable linings to make CI-10 appear cheaply accommodated.  
**Existing proposition:** those responses remain held because whole-life value/permanent performance is unproved.  
**Source / authority:** OCG-00B held-candidate register; OCG-02B/D counter-evidence.  
**Source class / maturity:** HELD_CANDIDATE + RESEARCH.  
**Finding:** `UNADDRESSED` by current selected architecture; held candidates supply **no positive support**.  
**Causal ownership:** `ARCHITECTURE` if later selected, but they are not selected now.  
**Evidence / knowledge state:** `PRESENT` as explicit non-selection.  
**Evidence basis:** `CONTROLLED_SOURCE` + `EXTERNAL_EVIDENCE`.  
**Controls:** anti-gaming boundary only.  
**Does not control:** CI-10 consequence.  
**Permanent-burden / conflict note:** these systems would carry permanent area/joint/acoustic/fire/moisture/tolerance/character obligations; no evidence currently earns them for a speculative en-suite.  
**Next proof route:** `NONE` at OCG-04; they remain held unless later evidence independently reopens their owners.  
**Outstanding facts:** none for their present non-selection.  
**Upstream owner if unresolved:** only later owner-level reconsideration if OCG-05/proportionality genuinely earns it.  
**OCG-specific addition earned now:** **NO**.

## OCG-04C-CI-10-R05 — collateral worksite consequence

**Consequence / sequence:** dust/noise/protection/cleaning along whatever future route CI-10 requires.  
**Existing proposition:** temporary controls are method-owned; architecture is accountable for the extent of destructive route work it structurally/topologically necessitates.  
**Source / authority:** OCG-02A/C.  
**Source class / maturity:** RESEARCH + DELIVERY.  
**Finding:** `NOT_ARCHITECTURE_OWNED` for temporary-control method.  
**Causal ownership:** `CONTRACTOR_METHOD` for controls; `ARCHITECTURE` for any future destructive-route cause established separately.  
**Evidence / knowledge state:** `PRESENT`; actual route consequence `NOT_REPRESENTED`.  
**Evidence basis:** `EXTERNAL_EVIDENCE`.  
**Controls:** temporary worksite method.  
**Does not control:** physical extent of future route/opening work.  
**Permanent-burden / conflict note:** no permanent clean/dirty infrastructure earned.  
**Next proof route:** `MULTIPLE` — OCG-05 for consequence envelope; delivery for temporary controls.  
**Outstanding facts:** actual future route and work sequence.  
**Upstream owner if unresolved:** service topology + delivery.  
**OCG-specific addition earned now:** **NO**.

### CI-10 synthesis

**The important finding is deliberate `UNADDRESSED`, not failure.**

The current project knowingly does **not** provide a cheap remote wet-room route. That negative space was already tested when the earlier principal en-suite was deleted. Existing service patterns remain deliberately bounded and held generic-flexibility systems cannot be imported to make the scenario pass.

At OCG-04 level this is coherent with the constitution’s proportionality rule and OCG-02’s counter-evidence against generic flexibility.

Whether the resulting physical disruption is proportionate in the Reference House is an OCG-05 / later proportionality question. OCG-04C does **not** authorise latent infrastructure merely because CI-10 is difficult.

**OCG-05 queue:** instantiate the actual future water/waste/soil/extract route and consequence envelope without redesigning the scenario.

**OCG-specific addition earned now:** **NO**.

---

# 5. Cross-scenario observations for OCG-04E

## 5.1 Room refit is not component replacement writ large

CI-08 and CI-09 deliberately preserve the reality that a complete room refit can require:

- room surrender;
- demolition/removal within the intended refit scope;
- wet work or fabrication;
- material/waste movement;
- curing/commissioning;
- cleaning/reset.

OCG’s architectural question is whether those consequences **propagate beyond the intended room/service/interface envelope unnecessarily**.

## 5.2 Current service geography appears genuinely relevant, but still needs RH proof

The family bathroom and kitchen are both deliberately adjacent to concentrated service geography. This is exactly the sort of architectural relationship OCG might otherwise have invented after the fact.

The proposition-level logic is credible. OCG-05 must still prove actual service-edge geometry, isolation, access and route consequences under CI-08/09.

## 5.3 CI-10 establishes an important negative-space result

For the first time in OCG-04, a material architecture-owned intervention consequence is `UNADDRESSED` **by explicit design choice**.

That status is protected from being read as a repair instruction.

The project currently says, in effect:

> selected wet/service geography earns permanent infrastructure; a speculative remote en-suite does not.

That is a coherent candidate for later `ACCEPT_DISRUPTION` / `NO_CHANGE`, but OCG-04C does not assign the proportionality route yet.

## 5.4 Off-site preparation remains conditional

Manufacturing discipline helps only where it genuinely removes/compresses occupied-house operations. The kitchen case does not justify a prefabrication doctrine merely because factory work sounds cleaner.

## 5.5 Worksite/logistics ownership remains split

Architecture owns routes/turns/thresholds and whether technical work spills beyond its intended geography. Delivery owns temporary protection, staging, housekeeping and programme.

No dedicated contractor circulation or staging architecture is earned.

---

# 6. Forward proof queue from OCG-04C

## OCG-05

- CI-08 — bathroom service-wall/interface geometry, route crossings, isolation and extract access;
- CI-09 — kitchen service-edge/cabinet packing, local isolation, extract access and complete bulky ingress/egress route;
- CI-10 — actual future remote water/waste/soil/extract route, crossed boundaries and resulting physical/occupancy/reinstatement envelope.

## Owning technical authorities

- wet-room waterproofing/fire/acoustic build-up and product curing/return-to-use;
- bathroom/kitchen ventilation engineering and commissioning;
- kitchen manufacturing/fabrication/package strategy;
- any future structural/service crossing required by CI-10.

## Delivery / method

- room containment/protection;
- material/waste staging and housekeeping;
- temporary household arrangements;
- wet-process/fabrication programme.

---

# Result

**OCG-04C PASS as an audit packet — CI-08…CI-10 now have schema-complete proposition-level findings under OCG-04A.**

This does **not** mean the room-refit scenarios pass physically.

The packet finds no new OCG-specific doctrine proposition earned now. Its most important result is that CI-10 remains deliberately `UNADDRESSED` by permanent remote wet-service infrastructure, without that status becoming design permission.

OCG-04E must reconcile this negative-space result with OCG-04B/04D and the later Reference House evidence before programme-level proportionality can be judged.

No architecture, doctrine, pattern, Reference House, compiler constraint, drawing, delivery requirement or publication prose is changed by this packet.