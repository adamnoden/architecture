# HFI-06C — Interface and Task Targets

**Packet:** HFI-06C  
**Programme:** [`docs/development/human-factors-low-friction-inhabitation-programme.md`](../../docs/development/human-factors-low-friction-inhabitation-programme.md)  
**Execution plan:** [`docs/development/human-factors-low-friction-inhabitation-execution-plan.md`](../../docs/development/human-factors-low-friction-inhabitation-execution-plan.md)  
**Owning issue:** #195  
**Baseline `main`:** `b8b992b5107b04821ca160c41d797a6af270cd70`  
**Method:** HFI-06A target classes / derivation method  
**Prior target packet:** HFI-06B — movement targets  
**Question:** what reach, operating-force, clearance, control, sanitary, storage and domestic-task targets are actually earned once action/posture, sequence, state feedback, proportionality and technical conflicts are preserved?  
**Boundary:** target formation only. This packet does **not** audit or change Reference House geometry; select hardware, controls, sanitary fittings, kitchen products or automation platforms; set specialist product specifications; edit doctrine/patterns; add compiler proof; or change publication maturity.

---

## 1. Result in one sentence

HFI-06C yields **almost entirely relational targets rather than new universal dimensions**.

That is the correct result of the evidence.

For interfaces and domestic tasks, the dominant mechanisms are:

- approach and obstruction depth;
- posture;
- grip/action type;
- sequence;
- moving/open states;
- feedback and persistence;
- set-down/regrip;
- wet/hot consequence;
- repeated task topology.

A universal control height, door force, bathroom clearance, worktop height or storage band would erase those mechanisms rather than represent them.

---

# 2. Authority stack retained

HFI-06A remains controlling:

- `T1` — statutory/regulatory boundary;
- `T2` — external good practice;
- `T3` — evidence-supported range/relationship;
- `T4` — deliberately adopted Ovid’s House target;
- `T5` — actual project/site/product value later.

A `T4-REL` target is not weaker because it lacks a scalar. Where the evidence is relational, forcing it into millimetres or newtons would be pseudo-precision.

---

# 3. Reach and operating position

## `HFI-USE-REACH-01` — functional reach, not mounting height alone

**Cause:** `CF-04 — reach / posture / operating-effort mismatch`.  
**Class/form:** `T4-REL`.

> **A frequently used fixed interface must be operable from a stable, credible operating position for the representative scenario. Judge vertical and horizontal reach together with approach, obstruction depth, posture, grip/manipulation and the complete return/confirmation task.**

This target applies to relevant:

- switches/controls;
- door/window hardware;
- sanitary controls;
- storage;
- fixed appliances/interfaces.

### What does not count as proof

- handle centreline inside a nominal height band;
- ability to touch only by leaning/stretching materially;
- standing reach used as a proxy for seated/wheeled-aid reach;
- opening reach where closing/relocking later becomes unreachable;
- height without countertop/cill/reveal/furniture obstruction.

---

## `HFI-USE-REACH-02` — no universal Ovid’s House control-height band

### External context

Current Approved Document M dwelling guidance includes familiar service-control height relationships, including a general `450–1200 mm` centreline band for switches/sockets serving habitable rooms in the relevant guidance context, plus distinct consumer-unit guidance.

These remain **`T1` external guidance context**, not a project ergonomic optimum.

### Evidence context

HFI-02A retains wheeled-mobility-aid study observations such as:

- lateral vertical reach without trunk movement around `710 / 1015 / 1180 mm` at 5th/50th/95th percentiles in that study condition;
- lateral horizontal reach around `298 / 525 / 700 mm` at 5th/50th/95th percentiles;
- raised-arm reach observations extending roughly `1210–1840 mm` across the study’s 5th–95th range.

Those remain `T3` observations, not a house-wide mounting band.

### Decision

**Outcome:** `NO-UNIVERSAL-NUMERIC-T4`.

The project should use `HFI-USE-REACH-01` plus applicable `T1/T2` context and task-specific `T5` placement.

A later door-surround/control datum may be a useful architectural strategy, but it must be tested as geometry and mapping rather than promoted to doctrine from repetition.

---

# 4. Operating effort, grip and manipulation

## `HFI-USE-FORCE-01` — task-matched operating-effort profile

**Cause:** `CF-04`.  
**Class/form:** `T4-REL`.

> **For frequent ordinary interfaces, minimise unnecessary operating effort and avoid near-limit or compound manipulation for the representative action/posture, while preserving fire, security, weathering, acoustic and other hard duties. Measure the action that actually governs use, not one generic hardware force.**

Where relevant distinguish:

- latch/lock/lever action;
- breakaway/static resistance;
- push/pull through useful travel;
- closer/return resistance;
- final seal/latching effort;
- torque/pinch/twist;
- one-handed completion;
- wet/slippery grip.

---

## `HFI-USE-FORCE-02` — empirical force observations stay `T3`

HFI-02A preserves current government experimental 5th-percentile observations in the tested condition:

- anterior push `16.7 N`;
- anterior pull `25.3 N`;
- anterior downward handle `18.7 N`;
- lateral push `16.8 N`;
- lateral pull `29.8 N`;
- lateral downward handle `36.0 N`.

The posture/action spread itself is the important result.

### Decision

**No universal Ovid’s House door/window operating-force scalar is adopted.**

Reasons:

1. action and travel phase differ;
2. anterior/lateral posture differs materially;
3. sample/configuration limits remain;
4. fire/security/weather seals can create legitimate lower bounds or profiles;
5. a simple low-force internal latch, a weather-sealed external door and a fire door are not one interface class.

These observations remain `T3` comparators for product/interface selection and later audit where actual force data exists.

---

## `HFI-USE-MANIP-01` — avoid unnecessary compound manipulation

**Class/form:** `T4-REL`.

> **Frequent ordinary interfaces should not require fine pinch, high wrist torque or simultaneous compound actions such as grip + twist + pull where a technically equivalent simpler action is available.**

This is especially important under:

- one-hand use;
- temporary upper-limb impairment;
- occupied opposite hand;
- wet hands;
- mobility-aid use.

This does **not** mandate one universal lever/handle product form.

---

## `HFI-USE-ONEHAND-01` — one-handed completion for frequent ordinary interfaces

**Class/form:** `T4-REL`, conditional on technical duty.

> **Where technically compatible, a frequent ordinary door/control interface should be completable as a coherent one-handed sequence without requiring the user to steady one component while manipulating another with the second hand.**

It is not a universal rule for specialist isolation, child-safety or security tasks where a deliberate compound action may be justified.

---

# 5. Doors and windows

## `HFI-USE-OPENING-01` — complete opening/closing task

**Cause:** `CF-04`, `CF-05`, `CF-07`, `CF-08`.  
**Class/form:** `T4-REL / SEQUENCE`.

> **Judge a door/window through the complete task: approach → position → reach/grasp → unlock/unlatch → initiate → control motion → pass/use → close → relatch/relock → confirm.**

An interface does not pass because it can merely be opened.

For windows, opening must not move the sash/handle into a state that makes ordinary closing/relocking materially worse or impossible for the same representative user.

---

## `HFI-USE-OPENING-02` — important closure/security state must be confirmable

**Cause:** `CF-08`.  
**Class/form:** `T4-REL`.

> **Where closed/latched/locked/restricted state matters, the interface should provide an intelligible means of confirming correct completion without repeated trial operation or specialist knowledge.**

Feedback may be mechanical, visual, tactile or audible as appropriate. No signal language or indicator technology is mandated.

---

## `HFI-USE-OPENING-03` — powered/remote operation is adaptation, not default compensation

**Class/form:** `T4-REL / DEMAND-LED`.

> **Do not use powered or remote operation as justification for poor direct interface geometry. Use it where direct low-friction operation cannot be achieved proportionately or where a defined user/brief benefits from it; preserve proportionate fallback and maintainability.**

No universal motorisation target is adopted.

---

# 6. Environmental and electrical controls

## `HFI-USE-CONTROL-01` — complete control loop

**Cause:** `CF-04`, `CF-05`, `CF-08`.  
**Class/form:** `T4-REL / SEQUENCE`.

A fixed ordinary control must be judged through:

`need → locate → identify → approach → see/read → reach → operate → feedback → system response → interpret → correct/reverse → understand persistence → confirm`

and, where failure matters:

`detect abnormal state → identify correct service/control → isolate/reset/override as authorised → confirm consequence → recover/escalate`.

No aggregate usability score is authorised.

---

## `HFI-USE-CONTROL-02` — point-of-decision locality

**Class/form:** `T4-REL`.

> **For frequent immediate local actions, place the ordinary control where the need is perceived and the consequence can be understood, unless a stronger technical reason requires centralisation.**

Examples include ordinary lighting and local ventilation boost where the technical system expects occupant action.

The target is causal, not “every control beside every load”. Whole-house/rare/diagnostic controls may legitimately be centralised.

---

## `HFI-USE-CONTROL-03` — mapping and grouping

**Class/form:** `T4-REL`.

> **The relationship between a control and the thing/state it controls should be inferable for ordinary repeated use; grouping must reduce search rather than create an undifferentiated bank of identical controls.**

Where several controls represent spatial zones, their arrangement should follow an intelligible spatial/functional mapping unless a better convention is explicit.

---

## `HFI-USE-CONTROL-04` — state, feedback and persistence

**Class/form:** `T4-REL`.

> **The user must be able to tell that an input registered, understand the occupant-relevant resulting state, and know whether an override will persist, time out or be superseded by automation/schedule.**

The more delayed/hidden the environmental response, the stronger the need for explicit state feedback.

---

## `HFI-USE-CONTROL-05` — ordinary basic use without household-specific briefing

**Class/form:** `T4-REL`.

> **An unfamiliar user should be able to perform ordinary basic local actions—such as room lighting and straightforward local environmental adjustment—without household-specific instruction.**

Advanced scheduling/commissioning may legitimately require documentation.

---

## `HFI-USE-CONTROL-06` — fallback is consequence-based

**Class/form:** `T4-REL`.

> **Where ordinary essential control depends on software, network, cloud service or automation, provide a proportionate local/manual fallback when loss of the primary path would materially impair ordinary use or safe recovery.**

This does not require duplicated physical controls for every low-consequence automated function.

App/cloud-only essential environmental control remains rejected as a universal default.

---

# 7. Sanitary interfaces and bathing

## `HFI-USE-SAN-01` — level-access bathing claim

**Cause:** `CF-03`, `CF-04`, `CF-05`.  
**Class/form:** `T4-REL / CATEGORY-TASK-SPECIFIC`.

> **Where reduced-mobility or entrance-level fallback showering is claimed, the shower route must avoid a deliberate rim/step transfer event and remain technically real as a drainage/moisture assembly.**

No universal bathroom-selection rule follows; baths remain legitimate domestic provision.

---

## `HFI-USE-SAN-02` — control before consequence

**Cause:** `CF-05`.  
**Class/form:** `T4-REL / SEQUENCE`.

> **A shower/bath control should be operable from a stable position without requiring the user to enter the direct spray/hot-water consequence zone or perform a materially unstable reach before establishing the intended state.**

No universal offset dimension is adopted because fixture/control form, enclosure and approach vary.

This directly rejects the familiar arrangement where the only practical control position is under the shower head solely for installation convenience.

---

## `HFI-USE-SAN-03` — permanent support-capable zones

**Cause:** `CF-04`, `CF-09B`.  
**Class/form:** `T4-REL`.

> **At sanitary locations where future support is credibly foreseeable, permanent wall/structure should provide coordinated support-capable fixing zones without critical concealed-service conflict; actual rails/seats remain demand-led unless the applicable category/brief requires them at completion.**

This target concerns capacity, not visible generic grab rails everywhere.

---

## `HFI-USE-SAN-04` — dry staging and dressing remains part of the task

**Cause:** `CF-05`, `CF-06`.  
**Class/form:** `T4-REL`.

> **Where bathing/showering requires drying/dressing in or immediately from the sanitary room, provide a credible dry reachable staging point and stable dressing posture/seat opportunity appropriate to the claimed scenario.**

No universal dressing-bay dimension is justified.

---

## `HFI-USE-SAN-05` — assistance is a two-body task, not a room-size label

**Class/form:** `T4-REL / CATEGORY-TASK-SPECIFIC`.

> **Where assisted sanitary use is claimed, prove the actual helper + user task envelope and approach to the relevant fixture; do not infer assistability from room area or generic wheelchair clearance alone.**

No universal carer clearance is adopted.

---

# 8. Kitchen, storage and fixed work

## `HFI-USE-KIT-01` — open-state work geometry

**Cause:** `CF-07`, with `CF-04/06`.  
**Class/form:** `T4-REL / CLEAR-ENVELOPE`.

> **Judge fixed kitchen/work geometry in the representative open/occupied states required by the task, including appliance door/rack/drawer extension and the user operating position.**

At minimum, where present and relevant, later design/audit should test representative dishwasher, oven, fridge/freezer and wide-drawer states.

No closed-plan drawing may stand in for this proof.

---

## `HFI-USE-KIT-02` — hot/heavy transfer needs credible landing

**Cause:** `CF-05`, `CF-06`.  
**Class/form:** `T4-REL / SEQUENCE`.

> **Where a predictable task requires extraction or transfer of a hot, heavy, wet or two-handed load, provide a stable nearby landing/set-down opportunity before a forced regrip, door manipulation or principal-route crossing.**

This does not mean a dedicated landing shelf beside every appliance. An ordinary correctly placed work surface may satisfy the relation.

---

## `HFI-USE-KIT-03` — frequent-use storage capability

**Cause:** `CF-04`.  
**Class/form:** `T4-REL`.

> **Provide credible fixed storage capacity for frequent-use items that does not force those items into the most demanding high, low or deep reach zones. Preserve occasional high/low storage rather than pretending every shelf must be equally reachable.**

The target is storage **allocation capability**, not household micromanagement.

---

## `HFI-USE-KIT-04` — no universal worktop height

Evidence shows work-surface suitability varies with:

- stature/elbow relationship;
- task and applied force;
- standing/seated use;
- sink bowl depth;
- surface duration;
- user/state.

### Decision

**Outcome:** `NO-UNIVERSAL-NUMERIC-T4`.

Common industry worktop heights and category-specific adjustable/seated provisions remain external/project context. HFI adopts no one-height-fits-all Ovid’s House number.

Where a defined wheelchair/user-specific brief exists, use the correct category/user target rather than generalising it.

---

## `HFI-USE-KIT-05` — no universal storage reach band

### Decision

**Outcome:** `NO-UNIVERSAL-NUMERIC-T4`.

Height alone cannot represent obstruction depth, body approach, item weight, frequency, visibility and bend/kneel burden.

Use `HFI-USE-KIT-03` and task-specific evidence instead.

---

# 9. Domestic-task targets

## `HFI-USE-TASK-01` — complete task chain

**Cause:** often `CF-05`, `CF-06`, `CF-09A`.  
**Class/form:** `T4-REL / SEQUENCE`.

> **Judge repeated domestic work through the complete task chain rather than room-to-room distance. Record the events that create compensation—doors, turns, level changes, set-downs, regrips, bending/reach, loading, sorting, storage and dirty/clean transitions.**

This target governs representative:

- groceries;
- laundry;
- waste/recycling;
- cleaning;
- care/childcare;
- garden-serving.

No numerical friction score follows.

---

## `HFI-USE-TASK-02` — set-down at predictable state changes

**Class/form:** `T4-REL`.

> **Where a frequent task predictably changes grip/load state before another building interaction, provide or preserve a credible support/set-down opportunity when doing so materially reduces carrying/regrip burden.**

This may be satisfied by ordinary furniture/work surfaces where the architecture credibly accommodates them; it does not automatically create built-in shelves everywhere.

---

## `HFI-USE-TASK-03` — no shortest-route doctrine

### Decision

**Outcome:** `NO-NUMERIC-TARGET`.

There is no universal maximum grocery/laundry/waste distance or number of doors/floors justified by current evidence.

A longer route may be proportionate because of:

- moisture/noise separation;
- security/privacy;
- service concentration;
- dirty/clean zoning;
- fire/leak risk;
- other domestic relationships.

HFI-07 should judge the event chain and consequence, not compare path length to an invented threshold.

---

## `HFI-USE-TASK-04` — cross-level laundry remains an audit proposition, not a target

The upper sleeping/bathing → ground utility dirty/wash/dry/fold/return cycle is important enough to audit but not target-ready.

### Decision

**Outcome:** `UNRESOLVED / PROJECT-TOPOLOGY`.

No HFI rule says:

- laundry must be upstairs;
- laundry must be downstairs;
- appliances must be duplicated;
- a laundry chute is required;
- a maximum number of stair crossings is acceptable.

HFI-07 must test the actual Reference House cycle; any material change then routes to the owning architecture gate after moisture/noise/services conflicts are considered.

---

# 10. Life-course interface targets

## `HFI-USE-LC-01` — dual-use entrance-level fallback capability

**Cause:** `CF-09B`.  
**Class/form:** `T4-REL`.

> **Where a two-storey Ovid’s House is intended to support common temporary/permanent stair-loss states, preserve a credible entrance-level combination of ordinary living/eating, sleeping capability, WC and technically real potential level-access shower without requiring dedicated unused institutional rooms.**

This target is functional/topological, not a fixed room-size schedule.

---

## `HFI-USE-LC-02` — stairlift enabling architecture, machinery demand-led

**Class/form:** `T4-REL`.

> **If stairlift compatibility is claimed, prove enough real stair/landing/parking/door/power geometry for a credible equipment-family route while retaining safe ordinary stair use; nominal stair width alone is not proof.**

Machinery remains `DEMAND-LED`.

No universal product or rail clearance is adopted in HFI-06C.

---

## `HFI-USE-LC-03` — future through-floor lift reservation remains unresolved

### Decision

**Outcome:** `UNRESOLVED`.

HFI-05B/05C require one genuinely buildable low-burden reservation counterfactual before the project may either adopt or reject a universal future-lift reservation.

HFI-06C therefore creates **no target** for lift-shaft dimensions, reservation area or structure.

---

# 11. Interface/task target register

| ID | Subject | T4 result |
|---|---|---|
| USE-REACH-01 | functional reach | stable operating position + approach/obstruction/posture/action relation |
| USE-REACH-02 | control mounting height | **no universal numeric T4**; retain external/task context |
| USE-FORCE-01 | operating effort | task/action/travel-specific low-effort relation subject to hard duties |
| USE-FORCE-02 | force scalar | **no universal numeric T4**; empirical force values remain T3 |
| USE-MANIP-01 | manipulation | avoid unnecessary pinch/high torque/compound actions |
| USE-ONEHAND-01 | one-handed use | frequent ordinary interfaces one-hand completable where technically compatible |
| USE-OPENING-01 | doors/windows | complete open→close→secure sequence |
| USE-OPENING-02 | state confirmation | important closure/security state intelligibly confirmable |
| USE-OPENING-03 | powered/remote | adaptation/demand-led, not compensation for poor direct geometry |
| USE-CONTROL-01 | fixed controls | complete need→operate→feedback→confirm loop |
| USE-CONTROL-02 | locality | frequent immediate controls at point of decision/consequence where coherent |
| USE-CONTROL-03 | mapping | inferable control-to-function grouping/mapping |
| USE-CONTROL-04 | feedback/persistence | registered action, occupant-relevant state, override duration/reversion clear |
| USE-CONTROL-05 | unfamiliar use | ordinary basic controls usable without household briefing |
| USE-CONTROL-06 | fallback | consequence-based local/manual fallback for essential digital/automated control |
| USE-SAN-01 | level-access bathing | no deliberate rim/step where reduced-mobility/fallback showering is claimed |
| USE-SAN-02 | shower/bath control | stable control before direct spray/hot consequence; no universal offset |
| USE-SAN-03 | support capacity | coordinated permanent fixing capacity; hardware demand-led |
| USE-SAN-04 | dry staging/dressing | credible dry reachable staging + stable dressing posture where task requires |
| USE-SAN-05 | assistance | actual two-body task envelope; no generic carer clearance |
| USE-KIT-01 | kitchen open states | appliance + user occupied-state proof |
| USE-KIT-02 | hot/heavy landing | stable nearby set-down before forced regrip/crossing |
| USE-KIT-03 | frequent storage | credible non-extreme frequent-use storage capacity |
| USE-KIT-04 | worktop height | **no universal numeric T4** |
| USE-KIT-05 | storage reach band | **no universal numeric T4** |
| USE-TASK-01 | domestic tasks | complete event-led task chain |
| USE-TASK-02 | task staging | support at material grip/state changes where earned |
| USE-TASK-03 | route length | **no universal numeric target** |
| USE-TASK-04 | laundry topology | **unresolved project audit proposition** |
| USE-LC-01 | entrance fallback | dual-use living/sleeping/WC/future shower functional relationship |
| USE-LC-02 | stairlift compatibility | real enabling geometry; machinery demand-led |
| USE-LC-03 | future lift reservation | **unresolved; no target** |

---

# 12. External numeric context that remains external

HFI-06C deliberately retains rather than launders external numbers.

Examples include:

- current Part M service-control mounting-height guidance;
- category-specific sanitary/clearance/transfer geometry under M4(2)/M4(3);
- category-specific door-opening force profiles where applicable;
- specialist wheelchair kitchen/worktop relationships;
- product/manufacturer operating-force data;
- electrical/fire/security specialist limits.

These may constrain or inform `T5` design and can coexist with `T4-REL` HFI targets.

They do not become universal Ovid’s House ergonomic constants by repetition.

---

# 13. Deliberate non-targets

HFI-06C explicitly does **not** adopt:

- one universal `450–1200 mm` Ovid’s House control band;
- one preferred switch height;
- one universal door/window opening-force limit;
- `18.7 N`, `30 N`, `22.5 N` or any other single force as the house-wide answer;
- one universal handle type;
- universal motorised windows/blinds;
- app/cloud-only essential control;
- one universal shower-control offset;
- generic grab rails everywhere;
- one universal bathroom size/transfer clearance;
- one worktop height;
- one fixed storage reach band;
- one maximum domestic-task route length;
- one maximum stair-crossing count for laundry;
- upstairs laundry as doctrine;
- universal lift reservation dimensions.

---

# 14. Target interactions

Interface targets interact strongly.

### Door

A low-force lever is not enough if:

- approach forces an awkward lateral reach;
- leaf sweep requires retreat/regrip;
- closer return overwhelms the next movement;
- lock state is ambiguous.

### Shower

A level floor is not enough if:

- the user must enter spray before setting temperature;
- no stable support opportunity exists where claimed;
- dry staging is impossible;
- drainage/moisture detailing is false.

### Control

A switch inside the external height band is not enough if:

- it sits behind an opening leaf;
- mapping is ambiguous;
- an automated state later reverses the action without intelligible persistence;
- the user needs an app/account after network failure.

### Kitchen

A generous aisle is not enough if:

- the dishwasher rack consumes the operating position;
- a hot oven load has nowhere to land;
- frequent heavy storage is all deep/low;
- fixed controls are reachable only across an active hazard.

### Life course

A nominal future shower or stairlift claim is not enough without technically credible enabling geometry.

---

# 15. Reference House audit handoff — no verdict here

HFI-07 may now test interfaces/tasks without moving the goalposts.

### Where numeric project data exists

Compare it to the correct authority class:

- external `T1/T2` where applicable;
- `T3` evidence as context;
- `T4` relational target;
- actual `T5` value.

### Where detailed interfaces are not modelled

Use `NOT-MODELLED`.

Do not invent:

- hardware forces;
- control locations;
- shower fittings;
- support rails;
- kitchen layout;
- cabinet contents;
- automation logic

to manufacture a pass.

### High-value HFI-07 cases

- principal entrance/garden doors under loaded use;
- sanitary control-before-exposure and future support capacity;
- frequent room lighting/environmental controls;
- fixed kitchen open states if source detail exists;
- entrance-level fallback living sequence;
- stairlift claim if source makes one;
- full cross-level laundry task route.

---

# 16. Red-team of the non-numeric result

## “Is this avoiding hard decisions?”

No. A relational target is a hard decision when the mechanism is relational. A fabricated number would be easier to specify but weaker to defend.

## “Why not choose 1000 mm switch height?”

Because height alone does not represent smaller ambulant users, wheeled-aid approach, obstruction, door-leaf interference, visual access or the task sequence. Applicable external bands remain useful constraints/context.

## “Why not choose 18.7 N for handles?”

Because it is one 5th-percentile observation for one tested downward anterior action, while other actions/postures differ materially and real doors must satisfy closure/security/weathering/fire duties.

## “Does no worktop height mean ergonomics are subjective?”

No. It means the correct variables are task + user + posture + sink/work depth. A one-height universal rule would conceal those variables.

## “Could relational targets become untestable prose?”

They must not. HFI-07 should represent them as explicit geometry/state/event relationships where source data exists. HFI-09C later decides which can be machine-proved rather than assuming only scalars are testable.

## “Does this weaken minimum standards?”

No. Applicable `T1` boundaries remain separate and mandatory in their own context. T4 relations add human-use tests rather than replacing them.

---

# 17. Computational boundary

No compiler admission occurs in HFI-06C.

Potential future source facts include:

- control position + operating position + obstruction geometry;
- door/window hardware/action profile;
- opening/return states;
- sanitary control/support/staging relationships;
- appliance open envelopes + operating zones;
- task-route event graphs;
- automation/control state transitions.

HFI-09C must separately decide whether each relation is machine-checkable with controlled source inputs.

No compiler may infer:

- low operating effort from handle type alone;
- accessibility from mounting height alone;
- sanitary usability from room area alone;
- kitchen usability from aisle width/worktop height alone;
- task quality from shortest path alone.

---

# 18. Closeout

**Packet:** HFI-06C — interface and task targets  
**Baseline:** `b8b992b5107b04821ca160c41d797a6af270cd70`  
**Main result:** interface/task evidence does not justify new universal project mounting-height, operating-force, bathroom-clearance, worktop-height, storage-band or domestic-route scalars. The defensible Ovid’s House targets are predominantly relational/sequence based.  
**Adopted T4 relations:** functional reach from stable operating position; action/travel-specific low operating effort; reduced compound manipulation; one-handed completion where technically compatible; complete door/window task; closure-state confirmation; complete control loop/locality/mapping/feedback/persistence/fallback; level-access bathing where claimed; control-before-spray/hot consequence; sanitary support-capable zones; dry staging; task-specific assistance; kitchen open-state proof; hot/heavy landing; frequent-use storage capacity; complete domestic-task event chains; material state-change staging; dual-use entrance fallback; real stairlift enabling geometry.  
**Explicit no-number outcomes:** universal control band/height; universal door/window force; shower-control offset; bathroom clearance; worktop height; storage reach band; domestic route-length or laundry-crossing threshold.  
**Unresolved:** cross-level laundry topology and universal through-floor lift reservation remain project/architectural questions, not quantitative targets.  
**Checks:** no Reference House verdict/rewind or geometry change; no product/platform/fitting selection; no doctrine/pattern/compiler/publication/maturity change.  
**Exact next packet:** **HFI-06D — target red-team.**
