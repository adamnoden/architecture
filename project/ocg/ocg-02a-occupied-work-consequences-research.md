# OCG-02A — Occupied-Work Consequences Research

**Programme:** OCG — Occupied Change  
**Parent:** [#547 — occupied change and bounded intervention programme](https://github.com/adamnoden/architecture/issues/547)  
**Packet issue:** [#573 — OCG-02A — occupied-work consequences research](https://github.com/adamnoden/architecture/issues/573)  
**Depends on:** OCG-01D / PR #579 / merge `278460f720fabf74642dd5eda9a5920f148df6e8`  
**Baseline `main`:** `278460f720fabf74642dd5eda9a5920f148df6e8`  
**State:** candidate evidence synthesis; becomes the OCG-02A record when merged

## Purpose

Test the originating OCG concern against external evidence before the project invents architectural responses.

The specific question is:

> **When building work occurs while a dwelling remains occupied, which consequences are intrinsic to the intervention, which are primarily controlled by competent work method, and where can permanent architecture materially change the consequence envelope?**

This packet concentrates on lived occupied-work consequences: dust/debris, noise/vibration, room and route loss, services, logistics, wet/curing tails and recovery.

It does **not** yet research reversible construction or design-for-disassembly in depth — OCG-02B — and does not select canonical intervention scenarios — OCG-03.

---

## Evidence posture

The available evidence is uneven.

There is strong UK regulatory/guidance evidence on **construction controls** for dust, noise, public separation, housekeeping and occupied premises. There is useful but smaller empirical/qualitative evidence showing that disruption materially affects retrofit decisions and residents’ experience of home. There is much less robust evidence from ordinary UK owner-occupied houses that quantifies a universal duration, dust spread, cleaning burden or acceptable disruption threshold for a given intervention.

Accordingly this record distinguishes:

- **regulatory / official guidance** — strong for work controls and resident-protection principles;
- **empirical / peer-reviewed evidence** — stronger for lived disruption and some environmental measurements, but often context-specific;
- **practice evidence** — useful for what housing providers actually plan around, but not universal proof;
- **OCG inference** — project synthesis that must remain bounded by the source evidence.

No anecdote from the originating renovation is promoted into general evidence.

---

# 1. Source register

## S1 — HSE, *Construction dust* (CIS36)

Source: <https://www.hse.gov.uk/pubns/cis36.pdf>

Type: UK official health-and-safety guidance.

Material findings:

- design/planning can eliminate or reduce dust-producing operations before site controls are needed;
- HSE explicitly recommends limiting cutting, chasing, drilling and breaking by design/layout where possible;
- off-site cutting and alternative work methods can reduce dust generation;
- where dust-producing work remains, water suppression and on-tool extraction are primary controls.

Transferability to OCG: **high for causal separation**, not for resident exposure quantification. The document is worker-health guidance, but it clearly separates upstream elimination of dusty work from downstream control of dust at source.

## S2 — HSE, *Construction dust: FAQ / refurbishment controls*

Source: <https://www.hse.gov.uk/construction/faq-dust.htm>

Type: UK official guidance.

Material findings:

- water suppression and suitable vacuum extraction can substantially control airborne construction dust when used correctly;
- indoor fine dust may remain suspended for a long time if it is allowed into the air;
- HSE points specifically to controls for refurbishment and extension of occupied premises;
- public risk/nuisance and worker occupational exposure are distinct regulatory questions.

Transferability: **high for method ownership**, moderate for occupied-home recovery. It supports the proposition that preventing dust becoming airborne is preferable to treating house-wide cleaning as inevitable.

## S3 — HSE, *Protecting the public* / HSG151

Source: <https://www.hse.gov.uk/pubns/priced/hsg151.pdf>

Type: UK official guidance.

Material findings:

- HSE explicitly identifies noise, dust and vibration as serious practical problems in refurbishment where part of a building remains occupied;
- controls protecting workers often also reduce nuisance to others;
- identified measures include suppression, different work methods, temporary barriers, local exhaust ventilation, off-site work and timing noisy operations.

Transferability: **high at principle level**. The guidance is broader than domestic interiors but directly recognises the occupied-refurbishment condition.

## S4 — HSE, *Construction physical ill health risks: Noise*

Source: <https://www.hse.gov.uk/construction/healthrisks/physical-ill-health-risks/noise.htm>

Type: UK official guidance.

Material findings:

- powered cutting, breaking, drilling, sanding and similar operations are inherently noisy;
- HSE prioritises elimination/reduction of unnecessary noisy tasks at design stage;
- lower-noise processes/equipment, temporary barriers, distance and scheduling are legitimate controls;
- enclosed spaces can increase noise exposure through reflection.

Transferability: **high for source/control hierarchy**, low for domestic annoyance thresholds because the guidance principally concerns worker exposure.

## S5 — HSE, *Construction physical ill health risks: Vibration*

Source: <https://www.hse.gov.uk/construction/healthrisks/physical-ill-health-risks/vibration.htm>

Type: UK official guidance.

Material findings:

- design-stage elimination of unnecessary vibrating tasks is preferred;
- prefabricated components and alternative processes may reduce vibration-generating site work;
- equipment condition and work method materially alter vibration exposure.

Transferability: **moderate**. It supports the same elimination-before-control hierarchy but does not quantify building-transmitted nuisance to occupants.

## S6 — HSE, *Materials storage and waste management*

Source: <https://www.hse.gov.uk/construction/safetytopics/storage.htm>

Type: UK official guidance.

Material findings:

- housekeeping and timely waste removal are planned construction responsibilities;
- delivery quantities, staging, waste routes, internal movement and skip/bin positions should be planned;
- waste generated inside buildings requires an explicit safe route outward.

Transferability: **high for logistics ownership**. It supports treating clutter, waste accumulation and basic housekeeping as delivery/method issues by default rather than permanent architectural defects.

## S7 — UK Government, *Code of Practice for the remediation of residential buildings* — Part 3, Living with remediation

Source: <https://www.gov.uk/government/publications/code-of-practice-for-the-remediation-of-residential-buildings/code-of-practice-for-the-remediation-of-residential-buildings>

Type: UK official residential-work guidance; context is building-safety remediation rather than ordinary house renovation.

Material findings:

- occupied building work can significantly affect residents and those effects should be identified, assessed and managed;
- disruptive/intrusive work should be kept to the shortest reasonable duration and smallest physical coverage;
- noise cannot always be eliminated; off-site work, staging, restricted hours and alternative resident space are possible mitigations;
- access systems and coverings can materially affect light, ventilation, security and normal life;
- access to homes and amenities should be minimised and managed;
- temporary decant may sometimes be the proportionate last-resort response.

Transferability: **high for occupied-work principles, low for scale**. Multi-storey remediation is much larger than ordinary domestic intervention and must not be used to justify permanent domestic construction-site infrastructure.

## S8 — Kaveh et al., 2018, *An investigation into retrofitting the pre-1919 owner-occupied UK housing stock to reduce carbon emissions*

Source: <https://doi.org/10.1016/j.enbuild.2018.06.038>

Type: peer-reviewed UK retrofit research.

Material finding:

- disruption to home life appears among the important barriers to energy-efficiency retrofit alongside funding/payback and installer trust/skill.

Transferability: **high for significance of disruption**, low for defining its physical mechanism or acceptable amount.

## S9 — Preece, 2025, *Inhabiting unsettlement: Living through building safety remediation works in England*

Source: <https://doi.org/10.1177/00420980251321388>

Type: peer-reviewed qualitative research; 20 English leaseholders experiencing fire-safety remediation.

Material findings:

- occupied works can disrupt home as a safe, controllable and private setting;
- residents reported effects from noise, dirt, visual enclosure, worker presence and blurred boundaries between home and building site;
- prolonged/unpredictable work reduced residents’ sense of control.

Transferability: **strong for the human meaning of occupied work, limited for ordinary house-scale work**. It supports analysing privacy/control and worksite spread but not duplicating high-rise remediation controls in houses.

## S10 — *Energy efficiency refurbishment of UK owner-occupied homes* — householder disruption study

Source: <https://files01.core.ac.uk/download/pdf/288368084.pdf>

Type: UK academic fieldwork / thesis evidence.

Material findings:

- disruption was examined through daily routine, work, access into the home, space use and moving out;
- actual disruption sometimes exceeded expectations where work took longer than expected;
- different measures produced materially different disruption patterns.

Transferability: **moderate-to-high for ledger structure**, limited by small sample and intervention mix. It supports OCG’s refusal to reduce disruption to one scalar.

## S11 — Pullen et al. / ICE, *Building information modelling to cut disruption in housing retrofit*

Source: <https://www.emerald.com/jensu/article/170/6/322/424105/Building-information-modelling-to-cut-disruption>

Type: peer-reviewed / professional research on social-housing retrofit.

Material findings:

- literature on user disruption in retrofit is comparatively scarce;
- occupied retrofit must balance construction-team requirements and occupant use over space and time;
- planning disruptive activities and integrating spatial, organisational and temporal information can reduce user disruption.

Transferability: **high for OCG method**, particularly the need to model the complete intervention episode rather than component access alone.

## S12 — London City Hall, *Flats Retrofit Toolkit*

Source: <https://www.london.gov.uk/programmes-strategies/environment-and-climate-change/environment-and-climate-change-publications/flats-retrofit-toolkit>

Type: public-sector practice guidance.

Material findings:

- delivery planning should explicitly consider stakeholder/resident experience, not only construction activity;
- timeframes and acute disruption points should be communicated and planned.

Transferability: **moderate**. It reinforces process ownership but does not establish a permanent architectural response.

## S13 — British Gypsum technical guidance and Mapei product data

Sources:

- <https://www.british-gypsum.com/technical-support/self-help-tools/faqs/what-minimum-temperature-gypsum-products>
- <https://www.british-gypsum.com/installation/installation-guidance-and-support/installation-guides/thistle-dricoat-installation-instructions>
- <https://cdnmedia.mapei.com/docs/librariesprovider12/products-documents/1_00958_fix-grout-concrete-timber-floors_en-gb_e5097dffd37141d1a642f84bd2f75a17.pdf>

Type: manufacturer technical guidance.

Material finding:

- setting, drying and ready-for-use periods vary by product, temperature, substrate, absorption and installation condition.

Transferability: **high for one negative conclusion only**: OCG should not invent a universal `wet-trade recovery duration`. The relevant recovery tail is product/process specific and should be recorded from controlled technical evidence when a scenario is tested.

---

# 2. Finding — disruption is a real design/delivery concern, not merely annoyance

The evidence is sufficient to reject a weak framing in which occupied-work disruption is merely a subjective complaint outside architectural consideration.

UK retrofit research identifies disruption to home life as a meaningful barrier to work being undertaken. Qualitative residential-remediation research shows that the effect is not exhausted by noise level or dust quantity: work changes privacy, control, domestic territory and residents’ relationship to their home.

Official residential remediation guidance similarly treats resident impacts as something to identify, minimise and manage, including the spatial coverage and duration of intrusive activity.

### OCG consequence

**Keep occupancy consequence as an independent ledger dimension.**

A technically safe intervention can still have a material occupied consequence. Equally, the existence of that consequence does not prove that permanent architecture should remove it.

**Evidence status:** SUPPORTED.

---

# 3. Finding — the strongest architectural move is often eliminating the dirty operation, not permanently containing it

HSE dust, noise and vibration guidance repeatedly uses the same control hierarchy:

1. eliminate or reduce the need for the dusty/noisy/vibrating task through design, planning or alternative process;
2. where the task remains, control it at source through appropriate equipment/method;
3. separate/protect people from the residual worksite consequence.

This matters directly to OCG.

A conventional house can create dust because a service is chased from plaster or masonry. A contractor can and should use extraction/containment, but those controls do not answer the upstream architectural question: **why did routine access require chasing in the first place?**

Conversely, where cutting or drilling is intrinsic to legitimate construction, OCG must not demand permanent architectural infrastructure merely because temporary control is needed.

### OCG consequence

Freeze the causal split:

- **necessity of destructive/dust-generating access** may be architecture or assembly-detail owned;
- **source extraction, water suppression, temporary barriers, PPE, housekeeping and execution quality** are contractor/method owned by default;
- architecture earns a response only where it materially creates avoidable dirty work or prevents competent containment.

This is stronger and narrower than a doctrine of `dust-free renovation`.

**Evidence status:** STRONGLY SUPPORTED.

---

# 4. Finding — containment is legitimate temporary infrastructure

HSE public-protection guidance and residential-remediation guidance both treat temporary separation/barriers and controlled work zones as normal tools of occupied work.

That is important negative evidence against permanent over-design.

The existence of a need to separate occupants from a dusty/noisy work area does **not** imply the house should permanently contain a contractor corridor, anteroom or industrial clean/dirty zoning system.

The more appropriate question is whether the ordinary domestic geometry permits competent temporary separation without surrendering a wildly disproportionate part of the dwelling.

### OCG consequence

Later scenarios should record:

- intended work zone;
- temporary containment assumption;
- occupied routes/functions left outside it;
- any architectural condition that prevents a plausible temporary boundary.

The architecture can be judged for **containability**, but temporary containment itself remains delivery/method owned.

Candidate wording for later testing, **not doctrine**:

> The house need not contain the work permanently; it should avoid making competent temporary containment absurdly difficult.

**Evidence status:** SUPPORTED as analytical principle; architectural threshold remains unresolved.

---

# 5. Finding — noise is partly irreducible

HSE guidance makes clear that drilling, breaking, cutting, sanding and powered equipment can produce high noise. Government remediation guidance explicitly says noise from building works is unlikely to be completely mitigated for residents.

This is decisive against any OCG promise that routine change should be quiet.

Architecture can still affect noise consequence by:

- removing unnecessary destructive access operations;
- allowing work to happen in service territory rather than principal occupied rooms;
- reducing repeated drilling/breaking required by assembly interfaces;
- enabling a door/temporary boundary to separate work from occupied territory.

But tool selection, temporary acoustic barriers, work hours, sequencing and duration are strongly method/delivery owned.

### OCG consequence

**Reject `quiet renovation` as a project promise.**

Later OCG audits should ask only whether the incumbent architecture creates **avoidable noisy work or avoidable spread**, not whether construction can occur without audible consequence.

**Evidence status:** STRONGLY SUPPORTED.

---

# 6. Finding — service outage scope and service outage duration are different causal questions

Occupied works commonly involve temporary service interruption in housing practice. However, the evidence reviewed does not support a universal acceptable outage duration for a domestic intervention.

OCG should separate:

- **scope** — which branch, room, zone or entire system must be isolated;
- **duration** — how long that isolation persists.

Scope may be materially determined by permanent topology and isolation provision. Duration is often much more dependent on task, fault, replacement product, contractor method, commissioning and unforeseen conditions.

A whole-house water shutdown to replace one valve can therefore be an architecture/topology finding **without OCG inventing a two-hour or four-hour threshold**.

### OCG consequence

Keep service consequence topological first. Record duration only where directly observed, specified or otherwise controlled.

This validates the OCG-01C ledger design.

**Evidence status:** SUPPORTED in principle; scenario-specific evidence required later.

---

# 7. Finding — room/function loss matters more than crude room count

The UK householder evidence and residential-remediation guidance both support analysing disruption by what people can still do, not merely by square metres occupied by builders.

Relevant losses may include:

- only WC/bathroom;
- cooking;
- sleeping;
- safe entrance/egress;
- primary stair/circulation;
- water, heat or power to otherwise unaffected rooms;
- privacy/security;
- ability to work/study at home.

A small work area can therefore have a large occupancy consequence if it captures a critical route or sole household function.

### OCG consequence

**Retain functional occupancy analysis; do not replace it with `number of rooms affected`.**

Redundancy itself is not automatically required. Later proportionality must ask whether duplicate provision is worth its permanent area/cost.

**Evidence status:** SUPPORTED.

---

# 8. Finding — logistics are real, but dedicated contractor circulation is not yet earned

HSE housekeeping/waste guidance confirms that material storage, deliveries and waste routes require active planning. Occupied-work guidance likewise treats access and separation as material concerns.

That validates OCG’s worker/tool/material/waste route as a real intervention consequence rather than a trivial contractor inconvenience.

But nothing reviewed supports a general domestic requirement for a second permanent contractor circulation system.

### OCG consequence

Later scenario testing should trace the actual route and identify whether it:

- consumes the only domestic circulation route;
- crosses clean/high-value occupied rooms unnecessarily;
- cannot pass the replacement component;
- requires excessive furniture displacement;
- prevents containment;
- depends on site facts rather than house geometry.

The default response remains planning/protection unless repeated evidence earns permanent architectural change.

**Evidence status:** SUPPORTED for analysis; permanent route provision NOT EARNED.

---

# 9. Finding — technical completion and return to use can genuinely diverge

The manufacturer evidence demonstrates that wet-applied materials can impose product- and condition-dependent setting, drying or full-service periods after the direct application task. HSE dust guidance also notes that fine airborne dust can remain suspended after generation if not controlled at source.

The original OCG distinction between technical reinstatement and occupant recovery therefore has a real basis.

However, there is no defensible universal `recovery duration`.

### OCG consequence

For a real scenario:

- record the actual wet/dry process;
- use product/manufacturer or project evidence for required curing/drying where material;
- record cleaning/air-clearance/reset as process consequences when known;
- leave duration `UNKNOWN` rather than estimating from intuition.

Architecture may be responsible where an otherwise dry technical replacement acquires a wet recovery tail **only because access destroyed plaster/tile/finish**.

Wet construction itself remains legitimate where it performs the durable architectural function best.

**Evidence status:** STRONGLY SUPPORTED for the distinction; universal duration REJECTED.

---

# 10. Finding — unpredictability is part of lived disruption

The qualitative remediation evidence shows that prolonged uncertainty and loss of control amplify the experience of works. Retrofit studies also report disruption changing when work takes longer than expected.

This does **not** mean OCG can make contractor schedules deterministic.

But architecture can influence one contributor to uncertainty: discovery work caused by concealed, illegible or undocumented services/interfaces.

### OCG consequence

Carry `uncertainty/discovery` forward as a causal question, but do not create a separate scalar penalty.

Later scenario tests should distinguish:

- uncertainty intrinsic to diagnosing a failure;
- uncertainty caused by undocumented/concealed building topology;
- uncertainty caused by existing-condition/site variability;
- ordinary programme uncertainty owned by delivery.

**Evidence status:** SUPPORTED; architectural share scenario-dependent.

---

# 11. Finding — vulnerability changes work planning, not the universal architecture

Official occupied-residential-work guidance repeatedly calls for particular consideration of residents whose disability, health condition or vulnerability can worsen the impact of dust, noise, access restriction or decant.

This matters, but OCG must not quietly convert all high-sensitivity temporary-work controls into permanent universal architectural requirements.

### OCG consequence

Occupied condition must be explicit and can include resident-specific constraints where a real project has them. The Reference House can test ordinary occupied conditions without claiming to model every vulnerability.

Where HFI has already established durable inclusive design obligations, those remain HFI/architectural authority rather than being recreated by OCG.

**Evidence status:** SUPPORTED.

---

# 12. Finding — some work should honestly trigger temporary absence or decant

Government residential-remediation guidance explicitly recognises temporary decant as sometimes necessary, even while treating it as a last-resort disruption to minimise.

That supports OCG’s IC6/control posture and guards against a pathological `inhabitable through anything` doctrine.

### OCG consequence

The programme may legitimately conclude:

- local room surrender;
- daytime absence;
- partial decant; or
- full temporary decant

is the proportionate occupied condition for a particular intervention.

Permanent architecture is not required to make arbitrary major structural alteration compatible with normal domestic occupation.

**Evidence status:** STRONGLY SUPPORTED at principle level.

---

# 13. Causal map after research

The evidence supports the following default ownership map. `Default` is important: a real scenario can rebut it.

| Consequence | Default owner(s) | Architectural question that remains legitimate |
|---|---|---|
| Need for chasing/breaking merely to access a short-life service | Architecture / assembly detail | Could lifespan/interface geography remove the destructive operation? |
| Dust generated by an unavoidable cutting/sanding task | Contractor method | Can the task be eliminated or moved off site without architectural penalty? |
| Dust source extraction / water suppression | Contractor method | Does geometry physically prevent ordinary competent control? |
| Temporary dust barrier | Contractor method | Is there a plausible boundary that preserves useful occupied territory? |
| Noise from powered construction tool | Contractor method / intrinsic task | Did architecture create unnecessary powered access work or spread? |
| Broad service isolation | Service topology + method | Could ordinary local isolation materially narrow the outage? |
| Isolation duration | Task / contractor / product, sometimes shared | Avoid architecture claims without controlled evidence. |
| Loss of a room being directly refitted | Intervention itself | Usually accept as intrinsic unless scope propagates unnecessarily. |
| Loss of unrelated rooms/functions | Shared; architecture can be material | Why did access, route, topology or containment recruit them? |
| Worker/tool/material/waste housekeeping | Contractor method | Does permanent geometry make competent logistics unusually destructive? |
| Replacement component cannot enter/leave | Architecture / assembly detail | Is required empty withdrawal/handling space missing? |
| Waste accumulation / poor housekeeping | Contractor method | No architectural response by default. |
| Wet curing intrinsic to selected durable finish | Assembly/material | Is that material still the proportionate permanent construction? |
| Wet curing caused only by destructive access patching | Architecture / assembly detail | Can a local reversible interface eliminate the reinstatement tail? |
| Final cleaning after well-controlled ordinary work | Method / intervention | Architecture responds only to repeated propagation it materially causes. |
| Whole-house contamination caused by poor containment | Contractor method by default | Do not redesign the house around incompetent execution. |
| Discovery from undocumented/illegible service routes | Architecture / stewardship / existing condition | Can physical legibility/indexing reduce exploratory demolition? |
| Real external skip/staging/site access constraint | Site/project | Do not invent Reference House site geometry. |

---

# 14. Hypotheses tested from OCG-00C

## H1 — “Renovation dust is mainly an architectural problem.”

**REJECTED.**

Dust generation/control is strongly method-dependent. Architecture has a narrower upstream responsibility for whether destructive dusty operations are necessary and whether competent containment is feasible.

## H2 — “Occupied work needs permanent clean/dirty separation.”

**REJECTED as a general rule.**

Temporary separation is established practice. Permanent separation must be earned only where ordinary temporary containment repeatedly fails because of permanent geometry.

## H3 — “The house should make routine change quiet.”

**REJECTED.**

Construction noise is partly intrinsic. OCG may target avoidable noisy work and propagation, not silence.

## H4 — “Service outages should be short.”

**TOO VAGUE / REFRAMED.**

Topology can determine outage **scope**; duration is much more scenario-dependent. Record them separately.

## H5 — “Technical completion is not always return to use.”

**SUPPORTED.**

Wet processes, cleaning, protection removal, air clearance and household reset can extend the occupied intervention after the direct technical task.

## H6 — “Local work can genuinely create disproportionate whole-home consequence.”

**SUPPORTED as a phenomenon, not yet as a verdict on Ovid’s House.**

Research and lived-experience evidence both support disruption propagating through home life, access, space use and resident control. Later canonical scenarios must test the causal mechanism rather than assuming architecture is responsible.

---

# 15. Research limits

This packet does **not** establish:

- a universal acceptable dust concentration for residents during ordinary domestic works;
- a universal noise threshold for domestic renovation nuisance;
- an acceptable number of unavailable rooms;
- an acceptable water/power/heating outage duration;
- a universal cleaning period;
- a universal curing/drying period;
- that open-plan houses are intrinsically unmaintainable;
- that occupants should always remain resident;
- that off-site manufacture is always superior;
- that demountable construction reduces whole-life burden;
- that the current Reference House passes or fails any scenario.

Those absences are deliberate. The literature reviewed does not justify fake thresholds.

---

# 16. Consequences for later OCG packets

## For OCG-02B

Research reversible construction with a stricter burden of proof:

> A reversible interface earns attention where it removes a repeated, architecture-owned consequence — especially destruction of slower fabric — not merely because disassembly sounds desirable.

## For OCG-02C

Research temporary containment/sequencing as **legitimate first-line controls**, and ask what permanent geometry is required only to make those controls ordinary and bounded.

## For OCG-02D

Attack any serviceability proposal that introduces permanent joints, cavities, area, maintenance or institutional character to solve a consequence that competent temporary work already handles.

## For OCG-03

Canonical scenarios should deliberately include cases that separate ownership, for example:

- destructive-access IC2 where architecture may be causal;
- dusty IC4 where much of the worksite burden is method-owned;
- service IC2 with broad topological shutdown but unknown duration;
- wet refit where curing is intrinsic rather than collateral;
- logistics-heavy replacement where withdrawal route is the architectural question;
- IC6 control where temporary decant is allowed to win.

These are coverage requirements, **not yet the selected scenario set**.

---

# Result

**OCG-02A PASS — occupied-work consequences are real, but causal ownership is substantially narrower than the original renovation frustration might suggest.**

The strongest supported position is:

> **Architecture should not try to abolish the construction site. It should avoid unnecessarily creating one around work that ought to remain local.**

That distinction is now evidence-backed strongly enough to continue.

No architectural correction is authorised by this packet.

Next: **OCG-02B — maintainability / reversible construction research**.
