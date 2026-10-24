# OCG-01B — Intervention Classes

**Programme:** OCG — Occupied Change  
**Parent:** [#547 — occupied change and bounded intervention programme](https://github.com/adamnoden/architecture/issues/547)  
**Packet issue:** [#568 — OCG-01B — intervention classes](https://github.com/adamnoden/architecture/issues/568)  
**Depends on:** OCG-01A / PR #567 / merge `a8b166b3bb825a65f51261bb23b373cf91094e89`  
**Baseline `main`:** `a8b166b3bb825a65f51261bb23b373cf91094e89`  
**State:** candidate class freeze; becomes the OCG-01B record when merged

## Purpose

Freeze the smallest useful intervention-class system for OCG.

The classes describe the **intentional technical scope and purpose** of an intervention. They do not describe how disruptive, expensive, frequent, desirable, difficult or well designed the intervention is.

That separation is essential. OCG exists partly to expose cases where a technically small intervention creates a disproportionately large consequence envelope. If classification itself expanded whenever consequences expanded, the programme would hide the very propagation it is meant to detect.

The governing classification rule is therefore:

> **Classify the intervention by what is intentionally being changed, not by how far the consequences spread.**

---

## OCG-01B boundary

This record does not:

- define consequence-ledger fields or evaluation statuses — OCG-01C;
- define proportionality or acceptance tests — OCG-01D;
- perform external research — OCG-02;
- select the canonical intervention suite — OCG-03;
- audit Ovid’s House or the Reference House — OCG-04/05;
- judge any class as inherently acceptable or unacceptable;
- rank classes by disruption severity;
- create doctrine, patterns, Reference House changes, compiler constraints, delivery requirements, drawings or publication prose.

The class identifiers below are analytical handles only. They do not imply a hierarchy of architectural value.

---

# 1. Classification rules

## 1.1 Scope, not consequence

Classification follows the intended technical object and purpose stated before the consequence envelope is analysed.

A failed valve replacement remains a component-replacement intervention even if reaching it requires demolition, whole-house shutdown, three trades and repainting two rooms.

A whole-house service upgrade remains a system intervention even if unusually good architecture allows it to be completed with little occupied disruption.

The consequence envelope never determines the class.

## 1.2 Scope, not trade

There are no plumbing, electrical, heating, glazing or decorating intervention classes.

The same trade can appear in several classes:

- inspecting a valve may be OCG-IC1;
- replacing the valve may be OCG-IC2;
- replacing a distribution branch may be OCG-IC3;
- renewing a bathroom may be OCG-IC4;
- replacing the primary water-distribution strategy may be OCG-IC5.

Trade labels may still be useful factual metadata later. They are not the analytical structure.

## 1.3 Scope, not physical size

No area, room-count, cost, duration or component-count threshold determines class.

A physically large but discrete window assembly can still be OCG-IC2. A physically small alteration to a primary service topology may be OCG-IC5 if its purpose is genuinely to change the system architecture.

## 1.4 Purpose before incidental enabling work

An intervention often contains subordinate work required to accomplish its purpose.

Replacing a boiler may require short pipe modifications, electrical reconnection, commissioning and making good. Those tasks do not automatically turn the intervention into a system upgrade if the intended purpose remains replacement of one bounded plant item within the incumbent system architecture.

Likewise, a bathroom refit may include replacing valves, wastes, controls and finishes without becoming a collection of separate OCG-IC2 interventions if those actions are subordinate to one coordinated room-renewal purpose.

## 1.5 Separate genuinely independent purposes

Where one project combines materially independent purposes, OCG should split them into linked interventions rather than inventing compound class names.

For example:

- bathroom refit + whole-house electrical upgrade → one OCG-IC4 intervention and one OCG-IC5 intervention;
- window replacement programme + heating-system renewal → repeated OCG-IC2 interventions plus one OCG-IC5 intervention;
- kitchen refit undertaken only because a structural extension changes the plan → the structural/spatial alteration may be OCG-IC6, with the kitchen refit either subordinate to that purpose or separately analysed as OCG-IC4 if it has independent scope.

Later consequence work may analyse both the individual envelopes and any additional consequence created by carrying them out together.

No `IC2+IC4`, `mixed`, `hybrid` or other combinatorial class is created.

## 1.6 Repeated instances do not create a new class

A project may repeat the same intervention type across many locations.

Replacing one window and replacing ten equivalent windows do not require different intervention classes. Where each replacement is technically separable, OCG may analyse representative OCG-IC2 instances plus the additional logistics/occupancy consequences of the repeated programme.

The number of instances is not a class boundary.

---

# 2. Frozen intervention classes

The class set is deliberately limited to six.

## OCG-IC1 — Inspection / maintenance action

### Definition

An intervention whose primary purpose is to inspect, test, clean, clear, adjust, lubricate, calibrate, reset, service or perform another upkeep action **without intentionally renewing or reconfiguring the principal durable technical object**.

Scheduled renewal of a true consumable whose replacement is itself an ordinary service action may remain in OCG-IC1.

Examples include:

- inspecting a drainage run;
- clearing a trap or accessible blockage where no durable assembly is intentionally renewed;
- testing an isolation valve;
- cleaning an extract fan or filter;
- adjusting window or door hardware;
- routine plant servicing;
- replacing a service consumable such as a filter where the consumable is explicitly intended for regular renewal.

### Includes

- diagnostic opening and closure where needed for the maintenance action;
- cleaning or servicing of the technical object;
- minor consumable replacement integral to the service regime;
- testing and return to normal operation.

### Excludes

- failure or life-expiry replacement of a durable component — OCG-IC2;
- renewal/reconfiguration of a distribution branch or bounded subsystem — OCG-IC3;
- coordinated renewal of a room or local functional setting — OCG-IC4;
- renewal/reconfiguration of a primary building service system — OCG-IC5.

### Boundary note

The amount of access required is irrelevant to classification. Inspecting one concealed joint through destructive opening is still OCG-IC1; the destructive access appears later as consequence.

---

## OCG-IC2 — Component / assembly replacement

### Definition

An intervention whose primary purpose is to remove and renew one bounded component or assembly while preserving the incumbent higher-level system, room and spatial/structural organisation in substance.

“Local component replacement” was the programme’s working phrase. **Local is deliberately omitted from the formal name** because locality is a consequence question, not a class property.

Examples include:

- replacing a failed valve;
- replacing a socket or switch;
- replacing a radiator/emitter;
- replacing shower controls;
- replacing concealed-cistern internals;
- replacing a pump or bounded plant component;
- replacing a complete window or doorset in its incumbent opening;
- replacing a failed appliance where no wider room/system renewal is intended.

### Includes

- necessary disconnection and reconnection to incumbent systems;
- like-for-like or functionally equivalent renewal;
- modest product-driven adaptation at the immediate interface where the higher-level architecture remains substantively unchanged;
- ordinary testing/commissioning of the renewed component.

### Excludes

- work whose principal object is a branch or bounded distribution subsystem — OCG-IC3;
- coordinated renewal of multiple objects because the room/local functional setting itself is being refitted — OCG-IC4;
- deliberate change to primary system topology, capability or distribution strategy — OCG-IC5;
- deliberate change to primary spatial/structural organisation — OCG-IC6.

### Boundary note

A replacement product need not be physically small. A large window assembly or plant item remains OCG-IC2 if it is a bounded component within an otherwise retained higher-level arrangement.

A replacement also does not become OCG-IC3 merely because poor access forces a long route or broad shutdown.

---

## OCG-IC3 — Branch / subsystem intervention

### Definition

An intervention whose primary purpose is to renew, extend, remove or reconfigure a **bounded branch or subsystem** within an incumbent higher-level building system, without intentionally replacing or redesigning that primary system as a whole.

The technical object is therefore larger than one bounded component but smaller in system authority than the primary distribution/system architecture.

Examples include:

- replacing a leaking section of pipework where the object is the branch/run rather than one fitting;
- renewing one heating branch serving a bounded zone;
- adding or replacing a circuit or data run;
- replacing a local waste branch;
- reworking a bounded ventilation branch;
- replacing a short distribution subsystem serving one functional area while retaining the primary plant and overall system strategy.

### Includes

- multiple fittings/components where they together constitute the intended branch/subsystem object;
- route alteration within that bounded subsystem;
- connection back to the retained primary system;
- testing/commissioning of the changed branch/subsystem.

### Excludes

- one bounded component/assembly renewal — OCG-IC2;
- coordinated room refit where service-branch work is subordinate to renewal of the room as a whole — OCG-IC4;
- primary-system renewal/reconfiguration — OCG-IC5;
- spatial/structural alteration — OCG-IC6.

### Boundary note

A branch is defined by functional/system relationship, not by metres of pipe/cable or number of rooms crossed. No numerical extent threshold is created.

---

## OCG-IC4 — Room / local functional refit

### Definition

An intervention whose primary purpose is coordinated renewal or substantial reconfiguration of the **room or bounded local functional setting as a whole**, ordinarily involving several technical objects, finishes or service interfaces under one refit purpose.

The class exists because a bathroom or kitchen refit is analytically different from replacing one component or one branch even where many subordinate OCG-IC2/IC3-like tasks occur inside it.

Examples include:

- complete bathroom renewal;
- kitchen refit;
- utility-room refit;
- coordinated renewal of a room’s finishes, fixed furniture, fittings and local services where the room itself is the intended technical/functional object;
- renewal of a bounded local technical setting whose component relationships are deliberately re-coordinated as a whole.

### Includes

- multiple component replacements subordinate to the refit;
- local service adjustments necessary to support the refit;
- finish renewal and local interface work intentionally included in the room-renewal scope;
- reconfiguration of fixtures/fixed furniture within the retained larger spatial/structural organisation.

### Excludes

- one component/assembly replacement occurring in a room — OCG-IC2;
- one branch/subsystem intervention occurring in or through a room — OCG-IC3;
- building-wide or primary-system renewal — OCG-IC5;
- alteration whose primary purpose is to change the building’s spatial/structural organisation — OCG-IC6.

### Boundary note

A room is not classified OCG-IC4 merely because work happens there. The room/local setting must itself be the coordinated object of renewal.

No room-count threshold applies. The term “local functional setting” allows coherent cases such as a compact service suite without forcing classification to follow arbitrary room labels.

---

## OCG-IC5 — Primary system renewal / upgrade

### Definition

An intervention whose primary purpose is to renew, materially reconfigure or upgrade a **primary building service system or building-wide technical system** such that the system architecture, principal distribution strategy, capability, energy source, control regime or equivalent high-level relationship is itself the object of work.

The class covers both renewal and upgrade. A full primary-system replacement does not need to introduce new capability to belong here.

Examples include:

- whole-house or primary electrical distribution renewal;
- replacement/reconfiguration of the primary heating system or heat source where associated system architecture is intentionally renewed;
- substantial replacement of primary water distribution strategy;
- major ventilation-system renewal or introduction;
- building-wide data/service distribution upgrade;
- introduction of a new primary service family whose distribution must be integrated through the house.

### Includes

- subordinate component replacements required by the system work;
- multiple branch/subsystem changes where they are coordinated consequences of the primary system intervention;
- primary control/plant/distribution reconfiguration;
- testing and recommissioning of the renewed system.

### Excludes

- bounded plant/component replacement that retains the incumbent system architecture — OCG-IC2;
- one branch/subsystem intervention within the retained primary system — OCG-IC3;
- room refit whose service changes remain subordinate to room renewal — OCG-IC4;
- primary spatial/structural alteration — OCG-IC6.

### Boundary note

A boiler or heat-pump replacement is **not automatically OCG-IC5**. If one bounded plant item is being replaced within an otherwise retained system architecture, it remains OCG-IC2. It becomes OCG-IC5 when the primary system itself is intentionally renewed or reconfigured.

Likewise, unusually easy execution does not reduce an OCG-IC5 intervention to a smaller class.

---

## OCG-IC6 — Primary spatial / structural alteration — control class

### Definition

An intervention whose primary purpose is to materially change the dwelling’s **spatial organisation, primary structural arrangement or major building-form relationship**, rather than merely maintain, renew or upgrade components, rooms or technical systems within the incumbent spatial/structural order.

This is an explicit **control / non-promise class**.

Examples include:

- removing or introducing significant structural walls/support arrangements;
- relocating the principal stair or creating major new floor openings;
- substantial replanning that changes the primary room/circulation structure;
- extension or major building-form alteration;
- major opening changes that materially reorganise the building rather than replace an incumbent opening assembly.

### Includes

- subordinate service rerouting, room refits and component replacement required because of the spatial/structural alteration where they do not have an independent project purpose;
- consequential making-good and reconfiguration associated with the altered primary fabric.

### Excludes

- ordinary room refit within the retained larger spatial/structural organisation — OCG-IC4;
- primary technical-system renewal that does not intentionally alter the spatial/structural organisation — OCG-IC5;
- replacement of windows/doors within incumbent openings — OCG-IC2.

### Boundary note

OCG-IC6 is not defined by a numerical project size, cost or duration. It is defined by what is intentionally being altered: the building’s primary spatial/structural organisation.

The class exists so later OCG work can test the programme’s honest boundary. Ovid’s House does **not** begin with a promise that arbitrary major remodelling should remain low-disruption while occupied.

Classification as OCG-IC6 also does not mean disruption is automatically acceptable; it means this class must not be used to infer the same serviceability expectation as routine foreseeable work.

---

# 3. Why the six-class set survives

The initial programme suggested:

1. inspection / maintenance;
2. local component replacement;
3. branch / subsystem replacement;
4. room refit;
5. system upgrade;
6. major structural / layout alteration.

The structure survives with two deliberate refinements:

- **“local component replacement” → “component / assembly replacement”**, because locality belongs to consequence analysis;
- **“system upgrade” → “primary system renewal / upgrade”**, because like-for-like whole-system renewal has the same analytical scope even when capability is not increased.

No seventh class is currently needed.

In particular, the following candidate distinctions are rejected:

- **trade classes** — they duplicate technical disciplines without helping consequence analysis;
- **minor / moderate / major intervention** — severity language would contaminate class with consequence;
- **single-room / multi-room** — room count is consequence/geography, not technical purpose;
- **planned / reactive** — potentially useful metadata later, not intervention scope;
- **wet / dry work** — consequence/process metadata, not technical scope;
- **internal / external** — location metadata, not technical scope;
- **occupied / vacant** — occupied condition is already a separate OCG-01A term;
- **reversible / destructive** — outcome/design characteristics that OCG is meant to test, not classes;
- **adaptation** as a standalone class — a life-course adaptation may technically be IC2, IC3, IC4, IC5 or IC6; HFI retains ownership of why it should exist.

---

# 4. Classification decision sequence

Later OCG work should classify an intervention in this order:

1. **State the purpose and technical object before analysing consequences.**
2. Ask whether the object is the building’s primary spatial/structural organisation. If yes → **OCG-IC6**.
3. Otherwise ask whether the object is a primary building-wide technical/service system architecture. If yes → **OCG-IC5**.
4. Otherwise ask whether the room/local functional setting as a coordinated whole is the object. If yes → **OCG-IC4**.
5. Otherwise ask whether a bounded branch/subsystem is the object. If yes → **OCG-IC3**.
6. Otherwise ask whether one bounded durable component/assembly is intentionally being renewed. If yes → **OCG-IC2**.
7. Otherwise, where the purpose is inspection/upkeep without durable-object renewal → **OCG-IC1**.
8. If two genuinely independent purposes survive this test, split them into linked interventions rather than selecting whichever class sounds larger.

This is a scope-resolution sequence, not a severity hierarchy.

---

# 5. Representative classification tests

These examples test consistency only. They do **not** select the OCG-03 canonical intervention suite.

| Representative intervention | Class | Why |
|---|---|---|
| inspect stack base / rodding point | OCG-IC1 | inspection/maintenance is the intended purpose |
| clean extract fan and renew scheduled filter | OCG-IC1 | upkeep plus intended consumable renewal |
| replace failed isolation valve | OCG-IC2 | bounded durable component renewal |
| replace shower mixer/control assembly | OCG-IC2 | bounded assembly renewal |
| replace one complete window in incumbent masonry opening | OCG-IC2 | replaceable assembly; opening/system retained |
| replace failed heat pump with equivalent unit while retaining system architecture | OCG-IC2 | bounded plant replacement despite physical size |
| replace leaking pipe run / bounded water branch | OCG-IC3 | branch itself is technical object |
| add a new electrical/data circuit/run to an existing distribution system | OCG-IC3 | bounded distribution addition inside incumbent system |
| complete bathroom renewal | OCG-IC4 | room as coordinated functional setting is object |
| complete kitchen refit | OCG-IC4 | coordinated room renewal, not collection of independent components |
| renew primary heating plant plus distribution/control strategy | OCG-IC5 | primary system architecture intentionally renewed |
| whole-house rewiring / primary electrical distribution renewal | OCG-IC5 | primary electrical system is object |
| introduce a new whole-house ventilation system | OCG-IC5 | new primary service family/system architecture |
| remove loadbearing wall and materially replan principal rooms | OCG-IC6 | spatial/structural organisation is object |
| relocate principal stair | OCG-IC6 | primary circulation/structure intentionally altered |

---

# 6. Adversarial tests

## 6.1 Small technical object, enormous consequence

Scenario: one failed valve is concealed behind bonded finishes; access damages wall and waterproofing, the whole water system is shut down, circulation is protected, plaster/paint follows, and cleaning extends into adjacent rooms.

**Classification: OCG-IC2.**

The large consequence envelope is precisely what later OCG analysis must be able to expose. Reclassifying this as room refit or system work would erase the disproportion.

## 6.2 Large technical intervention, unusually small consequence

Scenario: a primary data/electrical distribution upgrade uses existing accessible service geography and completes with highly local opening and little occupied-space loss.

**Classification: OCG-IC5.**

Low consequence does not reduce technical scope.

## 6.3 Boiler swap with incidental pipework

Scenario: a failed boiler is replaced and short adjacent connections are adapted for the current product.

**Classification: OCG-IC2** where the incumbent heating architecture, distribution and control strategy remain substantively retained.

The presence of pipe/electrical work does not by itself create OCG-IC3 or IC5.

## 6.4 Heating conversion

Scenario: the heat source, primary distribution, controls and emitter assumptions are intentionally renewed as a coordinated project.

**Classification: OCG-IC5.**

The system architecture, rather than one plant item, is the technical object.

## 6.5 Bathroom refit with many component replacements

Scenario: sanitaryware, controls, wastes, finishes, cabinetry and local branches are renewed under one bathroom-refit purpose.

**Classification: OCG-IC4.**

Subordinate component and branch work does not require combinatorial classification.

## 6.6 One-room rewire

Scenario: a bounded circuit/distribution branch serving one room is intentionally replaced while the primary electrical architecture remains.

**Classification: OCG-IC3**, not IC4 merely because the work is geographically contained in one room.

If the room itself is being comprehensively renewed and the electrical work is subordinate to that refit, the intervention may instead be OCG-IC4.

## 6.7 Major alteration containing room refits

Scenario: an extension/replan alters structural openings and primary circulation; a new kitchen and bathroom follow because of that change.

If the kitchen/bathroom work is entirely consequential to one integrated spatial/structural purpose, the intervention may be analysed as **OCG-IC6** with subordinate work recorded in the eventual ledger.

If the kitchen refit has an independent brief and could sensibly be analysed apart from the extension, record linked **OCG-IC6 + separate OCG-IC4** interventions rather than inventing a hybrid class.

## 6.8 Multiple identical replacements

Scenario: ten windows are replaced in incumbent openings.

There is no “multi-component upgrade” class. Each technical action is an **OCG-IC2** instance; later analysis may use representative instances and separately record cumulative logistics/occupancy consequences of the programme.

---

# 7. Relationship to foreseeable change

The class system does not decide whether an intervention is foreseeable.

A class says **what technical scope the intervention has**. Foreseeability says whether there is a reasonable basis to expect that kind of intervention over the relevant life.

Examples:

- a valve failure may be foreseeable and OCG-IC2;
- a bathroom refit may be foreseeable and OCG-IC4;
- a future system upgrade may be foreseeable and OCG-IC5;
- an arbitrary structural replan may be OCG-IC6 but not something for which the project owes routine low-disruption provision.

Likewise, foreseeability does not imply that permanent architecture should accommodate the intervention. OCG-01D later owns the proportionality frame.

---

# 8. Relationship to consequence analysis

The class system is intentionally weak as a predictor of consequence.

That is a feature.

Two OCG-IC2 interventions may have radically different:

- access boundaries;
- service consequences;
- occupied-room losses;
- containment needs;
- logistics routes;
- reinstatement boundaries;
- recovery consequences.

Likewise, an OCG-IC5 intervention may in a carefully organised house produce a smaller occupied-change envelope than a badly detailed OCG-IC2 intervention.

OCG-01C must therefore record consequence dimensions independently rather than attaching assumed burden to class.

---

# 9. Coverage against the OCG-00C problem

The class set is sufficient to carry the friction register forward without encoding the frictions as classes.

- destructive access can occur in any class;
- contamination/dust can occur in any class;
- occupied-room loss can occur in any class;
- service interruption can occur in any class;
- wet-trade/reinstatement tails can occur in any class;
- worker/material/waste routing can matter in any class;
- discovery/uncertainty can occur in any class;
- propagation can be tested by comparing technical scope with consequence envelope in any class.

This is preferable to creating a class for every nuisance because the same consequence mechanism can arise from very different technical scopes.

---

# 10. Integrity tests

## 10.1 Consequence independence

**PASS.** Class is fixed from technical object/purpose before consequence is assessed.

## 10.2 No severity ladder

**PASS.** IC1→IC6 is a scope organisation, not “easy→hard” or “good→bad”.

## 10.3 No numerical thresholds

**PASS.** No area, room count, component count, cost or duration controls class.

## 10.4 No trade taxonomy

**PASS.** Plumbing/electrical/heating/etc. remain factual disciplines, not OCG classes.

## 10.5 Mixed-work handling

**PASS.** Subordinate work follows the intervention’s unified purpose; genuinely independent purposes are split into linked interventions rather than combinatorial classes.

## 10.6 Major-alteration honesty

**PASS.** IC6 remains an explicit control/non-promise class and does not imply arbitrary major remodelling should be made routine or low-disruption.

## 10.7 Existing authority unchanged

**PASS.** The classes describe interventions only. They create no architectural, HFI, service, delivery, research, compiler or publication authority.

---

# Result

**OCG-01B PASS — six intervention classes are sufficient and non-circular.**

Frozen set:

- **OCG-IC1 — Inspection / maintenance action**
- **OCG-IC2 — Component / assembly replacement**
- **OCG-IC3 — Branch / subsystem intervention**
- **OCG-IC4 — Room / local functional refit**
- **OCG-IC5 — Primary system renewal / upgrade**
- **OCG-IC6 — Primary spatial / structural alteration — control class**

The key invariant is:

> **Technical scope determines class. Consequence remains independent evidence.**

No architecture has changed.

The next authorised packet after clean merge is **OCG-01C — consequence ledger**.