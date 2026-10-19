# HFI-04C — Environmental and Electrical Controls

**Packet:** HFI-04C  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Research-start baseline `main`:** `a4fb2c706ff02a7c6089d857a33cf6d71c87c0a1`  
**Prior packet:** HFI-04B — doors, windows and hardware  
**Question:** how should HFI represent and judge fixed lighting, shading, ventilation, heating and relevant electrical isolation/fault controls as complete human–control–system action loops — including location, reach, mapping, manipulation, state feedback, correction, manual fallback and degraded conditions — without reducing usability to a mounting-height table or turning HFI into a building-services specification?  
**Boundary:** evidence synthesis and audit method only. This packet does **not** redesign the Reference House electrical/controls layout, specify a home-automation platform, set Ovid’s House mounting-height or operating-force targets, define lighting/thermal/IAQ performance, alter ventilation/heating strategy, specify consumer-unit architecture, weaken Part F/L/P or electrical-safety duties, create doctrine/patterns, add compiler proof or change publication maturity.

---

## 1. Purpose

A fixed control can be nominally reachable yet still impose avoidable friction.

The relevant unit is not the switch, thermostat or app screen by itself. It is the complete control loop:

`recognise need → locate control → identify correct function → approach/position → reach → manipulate → perceive response → interpret resulting state → correct/reverse if needed → confirm stable state`

Fault and isolation tasks extend the loop:

`detect abnormal condition → identify affected service → locate correct isolation/reset → distinguish it from adjacent controls → operate safely → confirm consequence → recover/escalate`

Not every control uses every event. A light switch differs from a heating scheduler. A local extract boost differs from a whole-house ventilation setting. A blind switch differs from an electrical isolator. The method must preserve those differences.

The controlling proposition is:

> **Control usability is a property of the complete perception–decision–action–feedback loop, not of mounting height or reach alone.**

A second proposition follows:

> **Automation may remove routine actions, but it does not remove the need for intelligible local override, fault recovery and state awareness where occupants are expected to intervene.**

A third proposition limits HFI scope:

> **HFI judges the human interface to environmental/electrical control; the owning technical discipline still determines what the system must safely and legally do.**

---

## 2. Existing project and normative boundaries

### 2.1 Existing HFI reach/force boundary

HFI-02A already establishes that:

- one mounting-height band cannot prove usability;
- reach depends on body geometry, approach, obstruction depth and posture;
- comfortable and maximum reach are different constructs;
- force, grip, pinch, twist and repeated operation are distinct demands;
- population percentiles cannot be combined into a fictional universal person;
- current Reference House or regulatory dimensions are not HFI targets merely because they exist.

HFI-04C carries those rules forward.

### 2.2 Current Approved Document M reference points

Current England dwelling guidance includes familiar external reference points:

- switches and sockets serving habitable rooms are generally described with centre lines in the `450–1200 mm` band;
- consumer-unit switches are described at `1350–1450 mm` above floor level in the M4(1) guidance cited by the current Approved Document M.

These values remain **regulatory/guidance context**, not Ovid’s House ergonomic proof.

HFI-04C explicitly rejects the inference:

`control centreline within band → control task usable`

The complete approach, identification, manipulation, feedback and recovery sequence still has to work.

### 2.3 Current Approved Document F control logic

Approved Document F Volume 1 (2026 edition) is particularly useful because its control requirements encode several human-interface mechanisms without claiming to be an ergonomics standard:

- ventilation should be controllable;
- controls may be manual or automatic;
- continuously running fans may use manual or automatic high-rate control;
- manual high-rate controls should be local to the spaces served, such as bathrooms and kitchens;
- automatic background-ventilator controls should also have manual override;
- automatic control must still satisfy relevant technical duties such as combustion ventilation where applicable.

This supports three bounded HFI mechanisms:

1. **locality can matter when the occupant is responding to an immediate local condition**;
2. **automation and manual override are not mutually exclusive**;
3. **human convenience does not waive the underlying ventilation duty**.

HFI does not infer a universal control location or interface type from Part F.

### 2.4 Current Approved Document L control logic

Approved Document L Volume 1 (2026 edition) requires meaningful heating-control structure, including room/zone thermostatic control routes in the relevant circumstances.

That establishes a technical need for control granularity. It does **not** establish that a particular thermostat interface, scheduler, app or menu structure is comprehensible.

HFI therefore separates:

- **control capability** — what zones/functions the building-services system exposes;
- **control usability** — whether an occupant can understand and operate those capabilities;
- **energy/system performance** — owned by Part L/building-services design rather than HFI.

### 2.5 Electrical-safety ownership

Consumer units, isolators, switched fused connections, protective devices, emergency switching and safe fault handling remain with the electrical design and relevant Part P / BS 7671 / product duties.

HFI may ask whether an expected occupant action is:

- reachable;
- identifiable;
- distinguishable;
- operable under the tested state;
- mapped to an intelligible consequence;
- provided with adequate feedback.

HFI may **not** decide that an unsafe isolation arrangement is acceptable because it is easier to reach.

---

## 3. Frozen scenario coverage

HFI-04C primarily owns or materially contributes to these HFI-01C scenarios.

| Scenario | Controls question |
|---|---|
| `HFI-SC-ARR-07` | can an unfamiliar visitor identify relevant route/local controls without relying on learned household routine? |
| `HFI-SC-USE-01` | do frequent environmental controls work for a smaller adult when reach, sight and feedback are considered together rather than as height alone? |
| `HFI-SC-USE-02` | do door leaf/body position and adjacent control placement create reach-back or interference? |
| `HFI-SC-USE-12` | are controls and route transitions intelligible in low light without importing specialist life-safety signalling scope? |
| `HFI-SC-USE-13` | does temporary upper-limb impairment create avoidable cross-body reach, compound manipulation or dependence? |
| `HFI-SC-USE-15` | can an unfamiliar user with reduced processing reserve identify the correct fixed control and understand the resulting state? |

HFI-04C also informs fault/isolation tasks already present in the wider HFI friction register, but does not create a new life-safety scenario family.

---

## 4. Control-family taxonomy

Controls should not be judged as one undifferentiated class.

### 4.1 Immediate local controls

Examples:

- ordinary room lighting;
- local extract boost;
- manually operated blinds/shades;
- local fan or comfort adjustment where architecture exposes it.

Characteristic task:

`local condition → local action → near-immediate perceivable response`

Primary risks:

- control not where the decision occurs;
- ambiguous gang/grouping;
- reach-back around door leaf/furniture;
- response not visible/audible from operating position;
- small or compound manipulation.

### 4.2 Setpoint controls

Examples:

- thermostat setpoint;
- zone temperature adjustment;
- target ventilation setting where occupant-adjustable.

Characteristic task:

`perceive condition → adjust desired state → system responds over time`

Primary risks:

- confusing current state with target state;
- delayed feedback;
- mode/setpoint ambiguity;
- hidden schedules overriding local action;
- occupant repeatedly compensating because the system model is unclear.

### 4.3 Scheduled/programmed controls

Examples:

- heating schedules;
- timed ventilation modes;
- programmed shading scenes where used.

Characteristic task:

`construct future rule → enter time/state sequence → verify saved programme → later understand why system acted`

Primary risks:

- high step count;
- hidden mode hierarchy;
- terminology mismatch;
- difficult correction/cancellation;
- poor visibility of future state;
- permanent automation unexpectedly overriding immediate intent.

### 4.4 Automatic controls with occupant override

Examples:

- humidity/occupancy-driven ventilation;
- daylight-linked lighting where installed;
- automated shading;
- thermostatic algorithms.

Characteristic task:

`automation acts → occupant notices/accepts/disagrees → occupant overrides if necessary → system later resumes or remains overridden`

Primary risks:

- no obvious manual path;
- uncertain duration of override;
- system silently reverting;
- sensor state invisible;
- automation masking a fault;
- dependence on an app/network/cloud path for essential local control.

### 4.5 Isolation, reset and fault controls

Examples:

- consumer-unit protective-device operation where occupants are expected to interact;
- clearly designated local appliance/service isolators;
- reset controls;
- fault acknowledgement where appropriate.

Characteristic task:

`abnormal condition → identify affected system → select correct control → isolate/reset → verify result`

Primary risks:

- infrequent task + low learned familiarity;
- visually similar adjacent devices;
- poor labels;
- inaccessible cabinet/door/height;
- dangerous guessing;
- reset treated as cure without understanding fault persistence.

These are low-frequency but potentially high-consequence tasks. Their low frequency is not a reason to make them cryptic.

---

## 5. The control-loop ledger

Every tested fixed control should be represented through the following fields where relevant.

| Event | Question |
|---|---|
| `NEED` | what condition causes the occupant to seek control? |
| `LOCATE` | can the correct control be found from the place where the need is perceived? |
| `IDENTIFY` | can function be distinguished from neighbouring controls? |
| `APPROACH` | can the person reach an appropriate operating position without obstruction or body/door conflict? |
| `SEE/READ` | can labels/state be perceived under the tested lighting/visual condition? |
| `REACH` | is the operating element within usable reach for the tested person/posture? |
| `GRASP/TOUCH` | what finger/hand action is required? |
| `OPERATE` | what force, travel, precision, timing or multi-step sequence is required? |
| `FEEDBACK` | what immediate indication confirms the input registered? |
| `SYSTEM_RESPONSE` | can the resulting environmental/system change be perceived or inferred? |
| `INTERPRET` | can the occupant understand current mode/state and whether further action is required? |
| `CORRECT/REVERSE` | can an unintended setting be undone without restarting a complex sequence? |
| `PERSISTENCE` | will the setting remain, time out, be overridden by schedule/automation or revert after failure? |
| `CONFIRM` | can the occupant establish the stable final state? |
| `FALLBACK` | if primary interaction fails, what local/manual route remains where one is technically required or proportionate? |

No aggregate “control friction score” is authorised.

The ledger exists to expose **where** compensation occurs.

---

## 6. Mapping and grouping

### 6.1 Spatial mapping

A useful control should have an intelligible relationship to the thing controlled.

This does not require every device to sit physically beside its load. It does require the mapping to be learnable and, for frequent or unfamiliar use, reasonably inferable.

Questions include:

- does the control sit near the decision point?
- can the controlled outcome be observed from the operating position?
- if several loads are controlled together, is the grouping spatially/intentionally coherent?
- does a door leaf conceal or force reach-back to a switch?
- does a multi-way lighting arrangement preserve consistent behaviour at both ends of a route?
- does the control order correspond to the physical order of zones where several similar controls are grouped?

### 6.2 Functional grouping

Grouping should reduce searching, not create an undifferentiated wall of identical devices.

Relevant distinctions include:

- routine vs fault/isolation controls;
- room-local vs whole-house controls;
- immediate action vs scheduled/programmed action;
- frequently used vs commissioning/maintenance-only functions.

A large bank of unlabeled identical switches can satisfy reach guidance while failing identification and mapping.

### 6.3 Door-surround proposition

The existing project idea of using the door/arrival zone as an infrastructure datum for frequent controls remains a **candidate architectural strategy**, not a conclusion of this packet.

HFI-07/HFI-08 should test it against:

- door leaf and architrave geometry;
- switch reach on approach/exit;
- visibility in low light;
- wiring/service-zone logic;
- historical/architectural expression;
- whether the same datum remains intelligible across rooms rather than becoming a decorative rule.

HFI-04C neither mandates nor rejects it.

---

## 7. Feedback and state visibility

### 7.1 Immediate input feedback

The user should be able to tell that the control registered an action.

Possible mechanisms include:

- mechanical travel/click;
- visible indicator;
- haptic response;
- immediate change in the controlled load;
- clear screen/state change.

The appropriate mechanism depends on the control. HFI does not mandate digital feedback where simple mechanical state is already evident.

### 7.2 System-state feedback

For controls with delayed or hidden effects, feedback must distinguish at least the states necessary for correct use.

Examples:

- heating requested vs actual room temperature;
- ventilation normal vs boost vs fault where those states are occupant-relevant;
- blind fully open/closed where motion is not visible from the operator position;
- schedule currently active vs temporary override.

### 7.3 Persistence must be intelligible

A common control failure is not the first action but uncertainty about what happens next.

The occupant should not need to remember an undocumented rule such as:

- “this override lasts until the next programme event”;
- “this boost times out after an unknown period”;
- “the app changed the setpoint but the wall controller will later replace it”;
- “this scene was temporary rather than saved”.

HFI-04C therefore treats **persistence/reversion semantics** as an audit field where automation/scheduling exists.

---

## 8. Evidence on thermostat comprehensibility

### `HFI-SRC-CTL01` — Meier et al. 2011 residential thermostat usability

- **Source:** Alan Meier, Cecilia Aragon, Therese Peffer, Daniel Perry, Marco Pritoni, *Usability of residential thermostats: Preliminary investigations*.
- **Date/version:** 2011; *Building and Environment* 46(10), 1891–1898; DOI `10.1016/j.buildenv.2011.03.009`.
- **Class:** `PEER-REVIEWED-EMPIRICAL`.
- **Population/context:** several small US residential thermostat investigations; no single investigation was population-representative.
- **Applicability:** demonstrates that control complexity, mental models and programming burden can defeat technically capable environmental controls.
- **Useful findings:** interviews found widespread misunderstanding; many users operated programmable thermostats manually rather than using programming functions.
- **Known limits/nonclaims:** older US thermostat technologies and energy context; does not establish a UK mounting height, preferred product, interface geometry or universal optimum.
- **Access state:** publisher/Lawrence Berkeley National Laboratory metadata and abstract.
- **Checked:** 2026-10-19.
- **Canonical location:** https://eta-publications.lbl.gov/publications/usability-residential-thermostats

### `HFI-SRC-CTL02` — Peffer et al. 2011 thermostat-use review

- **Source:** Therese Peffer et al., *How people use thermostats in homes: A review*.
- **Date/version:** 2011; *Building and Environment* 46(12), 2529–2541.
- **Class:** `PEER-REVIEWED-REVIEW`.
- **Applicability:** control comprehension, terminology, button/text size, programming complexity and mismatch between occupant mental models and HVAC-control models.
- **Useful findings:** literature reviewed complaints around complexity, small buttons/text, confusing terms/symbols and excessive programming steps; users varied materially in preferred interaction style.
- **Known limits/nonclaims:** largely US HVAC/programmable-thermostat literature of its period; evidence supports a usability mechanism, not a specific modern UI or home-automation architecture.
- **Access state:** open institutional repository copy/metadata.
- **Checked:** 2026-10-19.
- **Canonical location:** https://escholarship.org/uc/item/9p95z5m6

### `HFI-SRC-CTL03` — Perry et al. 2011 thermostat usability metrics

- **Source:** Daniel Perry, Cecilia Aragon, Alan Meier, Therese Peffer, Marco Pritoni, *Making Energy Savings Easier: Usability Metrics for Thermostats*.
- **Date/version:** 2011.
- **Class:** `EMPIRICAL/METHOD`.
- **Applicability:** supports task-based evaluation of thermostat operation rather than feature-count or nominal capability.
- **Useful finding:** energy-control capability can fail to deliver intended outcomes when task usability is poor; task completion is therefore a legitimate control-evaluation construct.
- **Known limits/nonclaims:** not a dwelling-accessibility standard and not a basis for an Ovid’s House numeric threshold.
- **Access state:** University of California eScholarship.
- **Checked:** 2026-10-19.
- **Canonical location:** https://escholarship.org/uc/item/9gz9x7br

These sources are deliberately old enough that HFI does **not** infer “touchscreens bad” or “simple dial good”. Their value is the durable mechanism: **technical capability is not equivalent to comprehensible operation**.

---

## 9. General human-factors evidence on controls

### `HFI-SRC-CTL04` — UK HSE human-factors design guidance

- **Source:** Health and Safety Executive, *Design* / human-factors topic guidance.
- **Class:** `SPECIALIST-GOVERNMENT-GUIDANCE`.
- **Context:** industrial/work-system design, not domestic housing.
- **Applicability:** general control-interface principles only.
- **Useful mechanisms:** design should account for user characteristics; foreseeable operating conditions and interface between end user and system should be considered; task/equipment design can materially affect human error/performance.
- **Known limits/nonclaims:** no direct dwelling jurisdiction; does not create domestic regulatory duties or a project target.
- **Checked:** 2026-10-19.
- **Canonical location:** https://www.hse.gov.uk/humanfactors/topics/design.htm

### `HFI-SRC-CTL05` — HSE control-selection / mapping guidance

- **Source:** Health and Safety Executive, *Control room design* technical guidance.
- **Class:** `SPECIALIST-GOVERNMENT-GUIDANCE`.
- **Context:** major-hazard/process control rooms, not homes.
- **Applicability:** bounded corroboration for matching control form to task, user stereotypes/mapping, visibility of labels/displays and anthropometric compatibility.
- **Useful mechanism:** different control operations suit different control types; controls should conform to expected mapping and should not obscure labels/displays.
- **Known limits/nonclaims:** control-room hazard context is radically different from domestic environmental controls; HFI imports only the general mapping/task-fit mechanism.
- **Checked:** 2026-10-19.
- **Canonical location:** https://www.hse.gov.uk/comah/sragtech/techmeascontrol.htm

These sources are not used to “industrialise” the house. They support the limited proposition that mapping, task fit and feedback are established human-factors concerns rather than aesthetic preference.

---

## 10. Locality and point-of-use control

Locality is not a universal rule. It is a task property.

### 10.1 Strong locality case

Local control is especially defensible where:

- the occupant perceives the need in the affected space;
- the action is immediate and repeated;
- the response should be confirmed in that same space;
- walking elsewhere would add avoidable steps or delay;
- the technical system permits local control safely.

Approved Document F’s local manual high-rate ventilation control is a concrete current example of this logic.

### 10.2 Weak locality case

A control may legitimately be centralised where:

- it governs a whole-house state;
- duplication would create contradictory settings;
- operation is rare;
- safe/technical ownership requires controlled access;
- the central location improves diagnosis or isolation.

### 10.3 HFI rule

Do not ask “should controls be local?” in the abstract.

Ask:

`where does the user perceive the need, where can they understand the consequence, and what additional choreography does remote placement impose?`

---

## 11. One-handed and upper-limb-impaired operation

HFI-04C distinguishes:

- one hand **occupied**;
- only one hand practically **available**;
- temporary upper-limb impairment changing reach/force/dexterity;
- bilateral tasks genuinely required by safety or technical design.

Frequent controls should be tested for avoidable:

- two-hand bracing;
- simultaneous press/turn operations;
- small pinch targets;
- long press-and-hold without clear feedback;
- cross-body reach caused by fixed placement;
- sequences where the user must hold one element while manipulating another.

This does not mean every electrical/service control must become one-handed. It means compound manipulation must be **visible in the analysis** rather than hidden behind “within reach”.

---

## 12. Low-light, unfamiliar and reduced-processing states

### 12.1 Low light

HFI-SC-USE-12 asks whether a control can be found and interpreted in plausible low light.

This concerns ordinary domestic states such as entering a dark room or waking at night. It does not replace emergency-lighting/life-safety design.

Audit questions include:

- can the control be located without searching a wall?
- does its position remain predictable across equivalent rooms/routes?
- can state be understood without relying on subtle colour alone?
- does operating it expose the user to a route/edge hazard before light is established?

### 12.2 Unfamiliar user

HFI-SC-ARR-07 and HFI-SC-USE-15 prevent the house from relying entirely on learned household ritual.

A guest should not need a briefing to perform ordinary actions such as:

- turn on a room light;
- operate an obvious local blind/shade control;
- request bathroom extract boost where manual action is expected;
- understand a straightforward comfort adjustment.

Complex commissioning and advanced scheduling may legitimately require instructions; ordinary repeated use should not.

### 12.3 Reduced processing reserve

HFI does not diagnose cognitive conditions. It asks whether an interface remains intelligible when working-memory/processing reserve is reduced by ordinary causes such as fatigue, unfamiliarity or age-related variation represented by the scenario set.

Relevant burdens include:

- nested modes;
- unlabeled abbreviations;
- arbitrary press durations;
- inconsistent control direction;
- hidden save/cancel states;
- requiring several remembered steps before feedback appears.

---

## 13. Automation, apps and remote control

### 13.1 Automation is not inherently low-friction

Automation can remove repeated manual work. It can also create a new burden: the occupant must infer what the building is doing and why.

HFI therefore tests:

- trigger visibility where relevant;
- manual override;
- override duration/persistence;
- recovery after power/network failure;
- whether automatic action is safe/technically valid;
- whether the user can restore a normal state without specialist intervention.

### 13.2 App-only essential control is a weak default

HFI-04C does not ban apps. It rejects the assumption that a phone/cloud path is automatically an adequate sole interface for ordinary essential environmental control.

Potential burdens include:

- device not present/charged;
- account/login dependency;
- connectivity failure;
- software/vendor obsolescence;
- guest/unfamiliar-user exclusion;
- reduced tactile/positional predictability;
- accessibility varying with personal device setup.

A remote/app path can be excellent as a **secondary** or adaptive interface. Whether it can be primary depends on the consequence of loss and available fallback.

### 13.3 Redundancy should be proportionate

HFI does not require duplicated physical controls for every automated function.

The question is:

> if this interaction path disappears, what ordinary or safety-relevant function becomes unavailable, for how long, and by what lower-burden fallback can it be recovered?

---

## 14. Manual fallback and degraded modes

Fallback is most important where:

- the normal interface depends on network/cloud/software state;
- automation can conflict with immediate occupant intent;
- failure would materially affect ventilation/heating/lighting access;
- an occupant is expected to perform isolation/reset.

A fallback should not itself require an implausible sequence such as:

- finding an undocumented hidden button;
- opening a service cavity with tools;
- using an installer-only app;
- cycling unrelated circuits without identification.

HFI does not dictate the technical fallback. It requires the expected occupant route to be **explicit**.

---

## 15. Fault and isolation controls

### 15.1 Routine control and isolation are different tasks

Do not mix:

- “turn the appliance off normally”;
- “electrically isolate this appliance/service”;
- “reset a protective device after a trip”;
- “diagnose why it tripped”.

Each has different authority and consequence.

### 15.2 Identification matters more as consequence rises

For consumer-unit/service isolation tasks, the audit should ask:

- can the intended control be located without moving stored objects or using an unsafe posture?
- is the controlled circuit/service clearly identified?
- are labels legible and durable?
- can adjacent controls be distinguished?
- can the user confirm what was isolated/reset?
- does the interface discourage repeated blind resetting of an unresolved fault?

### 15.3 Main riser / service geography relationship

The project’s broader maintenance/service-access strategy may make fault/isolation controls easier to organise and label, but HFI-04C does not move maintenance-only controls into occupied space merely for visibility.

The owner split is:

- **routine occupant controls:** ordinary use geography;
- **expected occupant fault/isolation controls:** reachable and intelligible without entering unsafe maintenance conditions;
- **maintenance-only controls:** maintenance geography, with competent-person access as appropriate.

---

## 16. Shade/blind controls

Shading control is included only where architecture fixes the interface or actuator location.

Audit sequence:

`perceive glare/solar/privacy need → locate control → identify target blind/shade → operate → observe movement → stop/set position → confirm stable state`

Questions include:

- can the controlled element be seen while operating?
- does control direction map naturally to shade movement?
- if several windows are grouped, is grouping intelligible?
- does manual operation require high reach or sustained force?
- if motorised, is local/manual recovery proportionate when power/control fails?
- does automation unexpectedly reopen/close against occupant privacy intent?

HFI does not decide the solar-control strategy, fabric performance or motor specification.

---

## 17. Lighting controls

Lighting is a high-frequency control family with low tolerance for search burden.

Audit questions:

- is a useful control available at the point of entering/leaving a relevant space/route?
- is the switch position predictable?
- can the user establish enough light before negotiating a hazard/level change?
- do multi-way switches behave consistently?
- can dimming be operated and reversed without mode ambiguity?
- if scenes are used, can basic on/off still be understood by an unfamiliar user?
- are switch banks mapped to the controlled zones?

HFI-04C does not define illuminance, colour temperature, emergency lighting or lighting design quality.

---

## 18. Ventilation controls

Ventilation is the clearest example of human factors intersecting with a hard performance duty.

Audit questions include:

- what ventilation state is automatic and what requires occupant action?
- if boost is manual, is it local to the need and clearly identifiable?
- if automatic, can the occupant tell whether boost/normal/fault state is active where that knowledge matters?
- can an automatic background-ventilator function be manually overridden where the applicable system/guidance expects it?
- does the control encourage disabling ventilation because operation is noisy/confusing, or is that actually an acoustics/system-design defect owned elsewhere?
- after override, what state will the system return to and when?

Do not solve a ventilation-performance problem by simply giving occupants a more convenient “off” button.

---

## 19. Heating controls

Heating controls combine slow feedback with multiple possible control layers.

The audit should distinguish:

- room/zone setpoint;
- emitter-level adjustment;
- schedule;
- temporary override;
- whole-system mode;
- hot-water control where separate;
- installer/commissioning functions.

A good system model should let an occupant answer, at least for ordinary use:

1. what temperature/state is currently requested?
2. is the system in a scheduled or manual/override mode?
3. what will happen next?
4. how do I make a temporary correction?
5. how do I return to normal operation?

The 2011 thermostat literature shows why these questions cannot be assumed solved by programmable capability alone.

---

## 20. Instructions and learned use

The 2026 government home-user-guide framework recognises that occupants need information about operating their dwelling systems.

HFI uses that as a boundary, not an excuse:

- **commissioning, maintenance and advanced programming** may reasonably require documentation;
- **ordinary repeated local use** should not require consulting a manual every time;
- labels/instructions should support the interface, not compensate for arbitrary mapping where a clearer architecture was feasible.

The project should prefer interfaces that remain intelligible after years of forgotten setup knowledge.

---

## 21. Candidate findings before target formation

| Candidate | Benefit mechanism | Burden / counter-case | HFI-04C disposition |
|---|---|---|---|
| audit complete perception→action→feedback loop | exposes failures hidden by reach-height compliance | low analytical burden | **adopt as audit method** |
| place immediate frequent controls near the decision point where technically coherent | reduces search/walking and improves feedback | wiring/layout/aesthetic constraints | **strong candidate; test by control family** |
| make frequent controls predictable in location/mapping | helps low-light/unfamiliar/reduced-processing use | rigid repetition can conflict with room geometry | **strong candidate, not universal datum** |
| treat state/persistence feedback as part of usability | reduces repeated checking and accidental override | interface-specific | **adopt as audit field** |
| require local/manual fallback for every automated function | resilient to failure | unnecessary duplication/complexity | **reject as universal rule; consequence-based fallback instead** |
| use app/cloud control as sole interface for all environmental systems | removes wall controls | device/network/account/vendor dependency; guest exclusion | **reject as universal default** |
| ban apps/automation | avoids digital complexity | throws away genuine convenience/adaptive value | **reject** |
| use one `450–1200 mm` band as proof of control usability | simple compliance check | ignores sight, approach, mapping, feedback and task | **reject** |
| make all environmental controls physically identical | visual consistency | different tasks need different control forms/state feedback | **reject** |
| separate routine controls from fault/isolation controls | reduces accidental high-consequence action and improves mapping | some extra labelling/grouping | **strong candidate** |
| make expected occupant isolation/fault controls legible and reachable | improves recovery under abnormal conditions | coordination with electrical safety/enclosure | **strong candidate; technical owner governs implementation** |
| require unfamiliar-user basic operation without household-specific briefing | improves guest resilience and legibility | complex advanced functions still need learning | **adopt for ordinary basic controls** |
| expose automation override duration/reversion semantics | prevents mystery behaviour | product/UI dependent | **strong candidate** |

No row is a final numerical HFI target.

---

## 22. HFI-07 audit representation

Later Reference House audit should represent controls through named task facts rather than a single mounting-height field.

Where source data exists, an environmental/electrical control audit should be able to ask:

- `control_id` and controlled function;
- control family: immediate / setpoint / scheduled / automatic-override / isolation-reset;
- room/route and decision point;
- physical location and mounting height where relevant;
- approach/operating position and obstruction depth;
- whether a door leaf/furniture/fixed element interferes;
- identification/label/mapping strategy;
- manipulation type: press / rocker / rotary / slider / touch / pull / compound sequence;
- operating force/travel/precision where known and materially relevant;
- one-handed feasibility for tested scenario;
- state indication visible from operating position;
- response latency/immediacy;
- persistence/reversion rule;
- automatic trigger where relevant;
- manual override path;
- fallback if primary interface fails;
- expected occupant vs maintenance-only ownership;
- fault/isolation consequence where applicable.

Missing source data remains `NOT-MODELLED` in HFI-07.

Do **not** invent a finished electrical/controls schedule to manufacture a pass.

No combined control-friction score is authorised.

---

## 23. Reference House implications — no verdict yet

### 23.1 Frequent room lighting / environmental controls

The Reference House contains general control/interface intent but does not yet freeze enough room-by-room control geometry, gang mapping, automation logic or feedback semantics for an HFI verdict.

HFI-07 should particularly inspect:

- principal entrance/arrival lighting control;
- stair/landing lighting control under low-light scenarios;
- bathroom ventilation/lighting controls;
- bedroom/living comfort controls;
- garden/courtyard threshold lighting where ordinary use crosses inside/outside;
- door-adjacent switch positions where leaf/body geometry could create reach-back.

### 23.2 Consumer unit / isolation

The current external M guidance gives a consumer-unit switch height reference, but HFI-04C does not infer actual Reference House usability from that fact.

HFI-07 needs source facts for:

- actual consumer-unit/isolation location;
- access obstruction/storage conflict;
- enclosure/door operation;
- labelling;
- expected occupant task boundary.

Until then, verdict: **not available at 04C**.

### 23.3 Ventilation and heating controls

The project’s service philosophy strongly values intelligible local control, but the detailed control topology is not sufficiently frozen here to prove it.

HFI-07 must distinguish:

- what the building does automatically;
- what the occupant must do locally;
- what requires central/system-level action;
- what happens after override or fault.

### 23.4 Smart-home architecture

No HFI finding requires a proprietary “smart home” layer.

A future digital system may be excellent if it preserves intelligibility, local basic use and credible failure recovery. It may be poor if it centralises ordinary use behind accounts/apps/cloud services.

04C therefore creates **evaluation criteria**, not a platform selection.

---

## 24. Rejected hypotheses and shortcuts

HFI-04C explicitly rejects:

1. **“Inside the mounting-height band means usable.”** Reach is only one event in the control loop.
2. **“More automation always means less friction.”** Automation can move burden from manipulation into comprehension/recovery.
3. **“Manual controls are inherently simpler.”** Poor mapping, gang ambiguity and awkward placement can make a simple switch bad.
4. **“Apps are inaccessible.”** They can be highly useful secondary/adaptive interfaces; the concern is unjustified dependency, not digital form itself.
5. **“App control makes physical location irrelevant.”** Basic use, visitors and failure states can still require local interaction.
6. **“Every automatic function needs a duplicate manual control.”** Fallback should be consequence- and failure-based, not duplication for its own sake.
7. **“One switch type should be used everywhere for consistency.”** Task fit can justify different control forms.
8. **“The user can learn it.”** Learned routine is valuable but cannot excuse arbitrary ordinary-use mapping or a hostile unfamiliar-user experience.
9. **“A label fixes bad mapping.”** Labels help; they do not automatically cure spatial or functional ambiguity.
10. **“A home-user manual fixes bad everyday controls.”** Documentation is appropriate for advanced/rare tasks, not as a crutch for repeated basic use.
11. **“Fault controls are too infrequent to matter.”** Infrequency reduces learning and can increase the need for legibility.
12. **“Reset is the same as isolation.”** The tasks and consequences differ.
13. **“Low-friction means easy to turn everything off.”** Ventilation, fire, security and other technical duties remain hard boundaries.
14. **“A central touchscreen is a universal answer.”** It can improve overview while degrading locality, resilience and guest use.
15. **“A wall full of switches is honest because everything is exposed.”** Accessibility is not exposure; intelligible grouping and hierarchy matter.
16. **“The current Reference House passes because it already values local control.”** A philosophical preference is not a represented room-by-room control proof.

---

## 25. Evidence confidence

| Finding | Confidence | Reason |
|---|---|---|
| mounting height alone cannot establish control usability | `E-HIGH` | HFI-02A + established human-factors task structure + current guidance mechanisms |
| mapping, identification and feedback materially affect control performance | `E-HIGH` | general human-factors guidance + thermostat empirical literature |
| programmable thermostat capability can be undermined by poor usability/mental models | `E-MODERATE/HIGH` | multiple residential studies/review; technology vintage limits direct product inference |
| local control is valuable for immediate local ventilation actions | `E-HIGH` for the current Part F mechanism; `E-MODERATE` as a broader HFI generalisation | explicit 2026 Part F local high-rate control guidance + task logic |
| automatic control should preserve intelligible manual override where the applicable system expects occupant intervention | `E-MODERATE/HIGH` | explicit Part F manual-override mechanism + human-factors rationale; not universal to every automated function |
| app/cloud-only essential control is a poor universal default | `E-MODERATE` | strong failure/task logic; product and household contexts vary |
| low-frequency fault/isolation controls need strong identification and mapping | `E-MODERATE/HIGH` | consequence + low-familiarity mechanism; exact domestic empirical evidence is thinner |
| predictable frequent-control location benefits low-light/unfamiliar use | `E-MODERATE` | strong scenario/human-factors mechanism; exact architectural datum not derived |
| one universal project mounting-height band is justified now | **rejected** | task/person/interface variation and HFI-02A inference firewall |
| a particular smart-home platform/interface family is justified now | **rejected** | outside evidence scope and would create technology lock-in |

---

## 26. Proportionality / burden flags for HFI-05B

HFI-04C creates several propositions that later require explicit HFI-01D proportionality review.

### Low-burden / likely broad benefit

- coherent mapping/grouping;
- clear labels for fault/isolation functions;
- state feedback for non-obvious modes;
- predictable basic lighting/control positions where room geometry permits;
- local manual ventilation boost where technically required/appropriate;
- documenting override persistence/reversion;
- keeping basic control independent of specialist commissioning interfaces.

### Potentially higher burden

- duplicating physical controls solely for redundancy;
- motorising every blind/window-related control;
- whole-house touchscreen infrastructure;
- battery-backed/network-redundant control architecture for low-consequence functions;
- reserving excessive wall/service space for speculative future controls;
- proprietary integrated automation that increases maintenance/lock-in burden.

HFI-05B must compare actual benefit against cost, service complexity, lock-in, standby energy/material, repairability and architectural effect rather than assuming “more control” is better.

---

## 27. Cross-discipline handoffs

HFI-04C does not absorb adjacent disciplines.

| Question | Owning discipline / later gate |
|---|---|
| required ventilation rates/system strategy | ventilation / Part F / services |
| heating system efficiency/zoning technical compliance | Part L / building services |
| electrical protection, isolation and safe switching | electrical / Part P / BS 7671 |
| emergency/fire controls and specialist alarm signalling | fire/life safety |
| lighting levels, glare and detailed visual environment | lighting/environmental design |
| blind/shade thermal/solar performance | envelope/environmental design |
| security-related electrical controls | security owner |
| service maintainability | maintenance geography / serviceability |
| control-interface human use | HFI |
| quantitative HFI targets | HFI-06C |
| actual Reference House verdict | HFI-07 |

The invariant remains: nothing leaves HFI scope without being owned somewhere else.

---

## 28. Computational consequence

HFI-04C identifies a possible future representation opportunity only.

Potential source facts include:

- `control_id`;
- control family/function;
- physical location / mounting height;
- associated controlled element/zone;
- approach obstruction geometry;
- manipulation type;
- input state set;
- output/feedback state set;
- response latency class;
- persistence/reversion semantics;
- automatic/manual mode relationship;
- fallback path;
- expected occupant vs maintenance-only ownership;
- isolation/fault consequence class.

It does **not** authorise compiler work, a universal `control_height_ok`, a smart-home architecture rule, a control-usability score or a hidden expansion of the M4 proof boundary.

Any future rule must preserve source context. For example:

- an Approved Document M service-control height can be represented as external guidance correspondence;
- a Part F local boost requirement can be represented as a ventilation-control relationship;
- neither automatically becomes an Ovid’s House HFI pass/fail rule until HFI-06/HFI-09 admits it deliberately.

---

## 29. Closeout

**Packet:** HFI-04C — environmental/electrical controls  
**Research-start baseline:** `a4fb2c706ff02a7c6089d857a33cf6d71c87c0a1`  
**Exact question answered:** environmental/electrical controls must be analysed as complete perception–decision–action–feedback loops covering need, location, identification, approach, reach/manipulation, feedback, system response, correction, persistence and failure recovery rather than as mounting-height checks alone.  
**Evidence:** HFI-01C/02A; current Approved Documents M/F/L; current government home-user-guide framework; residential thermostat empirical/review literature; bounded HSE control-interface guidance used only for general human-factors mechanisms.  
**Findings:** adopts a control-loop ledger; separates immediate, setpoint, scheduled, automatic-override and isolation/fault control families; treats mapping, state feedback and persistence semantics as first-class audit fields; preserves local/manual fallback on a consequence basis rather than by universal duplication; rejects app/cloud-only control as a universal default without banning digital interfaces; distinguishes routine operation from isolation/reset; preserves technical safety/performance ownership.  
**Artefact:** this record only.  
**Checks:** no Reference House geometry, electrical layout, product/platform selection, mounting-height/force target, ventilation/heating strategy, doctrine, pattern, compiler proof, publication content or maturity state changed.  
**Authority/maturity consequence:** research method advances; no downstream architectural authority is superseded and no RH rewind is authorised.  
**Stale downstream items:** none created; HFI-07 now has explicit environmental/electrical-control audit fields.  
**Exact next packet:** **HFI-04D — kitchen, storage and fixed work zones.**
