# OCG-00C — Trigger / Friction Register

**Programme:** OCG — Occupied Change  
**Parent:** [#547 — occupied change and bounded intervention programme](https://github.com/adamnoden/architecture/issues/547)  
**Packet issue:** [#558 — OCG-00C — trigger / friction register](https://github.com/adamnoden/architecture/issues/558)  
**Depends on:** OCG-00B / PR #562 / merge `40689805bc26627d91a266eb47d1942bc0020c0a`  
**Working base for this packet:** `d0433557a2bfc9ba64a3c4b30af13e0c75c40187`  
**State:** candidate trigger register; becomes the OCG-00C record when merged

## Purpose

Record the renovation frictions that triggered OCG, together with already-known project situations that should later be tested, **without converting any of them into architectural conclusions**.

This packet exists to preserve the problem before the project invents terminology, metrics or solutions.

It answers only:

> **What experiences or project situations are sufficiently concerning that later OCG work should investigate them?**

It does not answer whether architecture caused them, whether Ovid’s House already solves them, whether they are generalisable, or what should be changed.

---

## OCG-00C boundary

This record does not:

- treat one renovation experience as empirical evidence;
- define the final OCG terminology or intervention classes — OCG-01;
- establish a consequence ledger, score or threshold — OCG-01;
- perform external research — OCG-02;
- select the canonical intervention suite — OCG-03;
- audit doctrine or the Reference House — OCG-04/05;
- promote removable floors, panels, manifolds, extra risers, prefabrication or any other response;
- alter doctrine, patterns, Reference House geometry, compiler logic, delivery requirements, drawings or publication prose.

The identifiers below are **register handles only**. They are not an OCG taxonomy and do not survive into later work by right.

---

# 1. Status of the originating experience

The programme was triggered by direct experience of domestic renovation while the dwelling remained occupied.

The salient experience was not simply that construction was inconvenient. It was that comparatively local work appeared to propagate into a much larger domestic consequence:

- routine access felt destructive;
- dust and debris escaped the immediate work area;
- the occupied dwelling became difficult to inhabit normally while work continued;
- technical completion did not equal return to normal use;
- plastering, sanding, touching-up and painting extended the intervention beyond the nominal trade task;
- cleaning and dust management continued after the builders had effectively finished;
- the whole sequence felt materially more primitive and uncontrolled than the apparent scale of the change justified.

These observations are recorded as **problem signals only**.

They do not establish:

- that every renovation behaves this way;
- that architecture is the principal cause;
- that the contractor method was competent or incompetent;
- that more permanent serviceability infrastructure would have produced a better whole-life outcome;
- that every future intervention should remain fully compatible with normal occupation.

---

# 2. Originating friction register

## OCG-FR-01 — destructive access

### Trigger

A relatively small repair, alteration or replacement can require cutting, chasing, breaking, drilling, lifting or opening fabric that is not itself the technical object of the work.

### Questions carried forward

- Which destructive operations are genuinely required by the technical task, and which result from where the building hides services or fixings?
- How much unrelated fabric is disturbed merely to reach the object of work?
- Is routine access being purchased by sacrificial plaster, tile, floor finish or joinery?
- When is opening permanent fabric proportionate, and when does it indicate a poor lifespan/interface relationship?
- Does the same access operation create secondary fire, acoustic, airtightness, waterproofing or finish-reinstatement work?
- Would a reversible access provision reduce total consequence, or merely create a permanent architectural penalty for an infrequent event?

No presumption is made that every concealed element should become exposed or panelised.

---

## OCG-FR-02 — contamination and dust spread

### Trigger

Dust generated in one work area can migrate through circulation, furnishings, adjacent rooms and surfaces well beyond the technical intervention.

### Questions carried forward

- Which operations create fine dust or debris in foreseeable domestic work?
- What portion of spread is governed by permanent geometry versus temporary containment and contractor method?
- Does the architecture provide a plausible bounded work zone, or do circulation/open-plan relationships make containment materially harder?
- Are dusty cutting, sanding or chasing operations avoidable through different access or assembly relationships?
- If dust is unavoidable, can competent ordinary temporary works contain it without requiring permanent architectural infrastructure?
- What creates the final cleaning boundary: the work operation itself, worker routes, air movement, material handling or poor protection?

Dust-free renovation is not assumed to be achievable or desirable as a universal requirement.

---

## OCG-FR-03 — living alongside the work

### Trigger

The dwelling remains a home while parts of it temporarily become a worksite.

### Questions carried forward

- Which interventions can reasonably occur while the rest of the house remains occupied?
- What makes an intervention cross the line from local inconvenience into whole-house disruption?
- Can occupants retain safe, ordinary routes between sleeping, cooking, bathing, toileting and entrance functions?
- Does contractor access necessarily collide with primary domestic circulation?
- Can work be bounded without forcing occupants to live behind excessive temporary protection or institutional barriers?
- Which intervention classes should honestly require temporary relocation rather than architectural over-provision?

OCG does not promise continuous normal use of every room during every intervention.

---

## OCG-FR-04 — loss of unrelated rooms or functions

### Trigger

A local job may remove use of rooms, circulation or functions that are not technically being altered.

### Questions carried forward

- Which spaces become unusable because of the work object, and which become unusable only because access, staging or service dependencies pass through them?
- Does losing one bathroom, kitchen appliance or service branch unnecessarily disable a whole floor or house function?
- Are circulation pinch points commandeered by work because no other material/tool route exists?
- Does temporary protection consume more occupied space than the work itself?
- How much room loss is proportionate for different scales of intervention?

No fixed acceptable room-loss threshold is set here.

---

## OCG-FR-05 — excessive service interruption

### Trigger

A small service intervention may require shutting down water, power, heating, ventilation, data or another system more broadly than the technical object appears to require.

### Questions carried forward

- Which service dependencies actually need to be interrupted?
- Can the affected branch or component be isolated without disabling unrelated rooms or systems?
- Is broad shutdown caused by topology, missing isolation, inaccessible valves/switchgear, commissioning practice or contractor preference?
- When is finer isolation worth its valves, fittings, controls, space and maintenance burden?
- Does local isolation create false confidence if drainage, pressure, controls or shared equipment still impose broader dependencies?
- How is isolation status made legible to a future worker without relying on institutional complexity?

No universal individually isolatable manifold system is implied.

---

## OCG-FR-06 — wet-trade and curing tails

### Trigger

The nominal technical task may finish before plaster, adhesive, screed, grout, sealant, paint or another wet process has cured sufficiently for normal use or further work.

### Questions carried forward

- Which interventions acquire drying/curing time because access or reinstatement relies on wet trades?
- Are wet processes performing a durable material function, or merely repairing damage created by access?
- Can faster-changing layers be disconnected from wet reinstatement without degrading solidity, moisture control, fire performance or architectural quality?
- How much occupied-space loss comes from curing rather than the technical replacement itself?
- Does reducing wet work materially improve total consequence, or only move complexity elsewhere?

Wet trades remain legitimate where they are the best durable construction method.

---

## OCG-FR-07 — making-good propagation

### Trigger

The technical repair can trigger a second project: patching, filling, plastering, sanding, caulking, resealing, trimming and matching adjacent work.

### Questions carried forward

- What is the true reinstatement boundary after access is closed?
- Why does work on one hidden component require repair of adjacent finishes?
- Which making-good operations restore a necessary technical boundary and which merely repair collateral damage?
- Do apparently minor openings create difficult finish-matching problems that enlarge the practical work area?
- Can interfaces be reopened and reclosed deterministically, or is restoration dependent on artisanal reconstruction each time?
- Does a demountable interface still look and feel like finished domestic architecture after repeated use?

The existence of making-good is not itself treated as a defect.

---

## OCG-FR-08 — repainting and finish renewal after technical work

### Trigger

A repair or service intervention can create repainting or redecoration work well beyond the replaced component.

### Questions carried forward

- Which interventions damage finished wall/ceiling fields despite not being finish interventions?
- Does local patching produce a visible mismatch that effectively forces whole-wall or whole-room repainting?
- Which trim/interface arrangements localise decorative reinstatement?
- Is repainting a reasonable ordinary consequence at the intervention frequency involved?
- Would a replaceable finish/interface reduce repeated work or create an over-detailed, fragile or expensive architecture?

No project-wide removable lining is implied.

---

## OCG-FR-09 — post-work cleaning and recovery

### Trigger

Technical completion may be followed by substantial cleaning, dust management, furniture reset and repeated wipe-down before the dwelling feels normal again.

### Questions carried forward

- What does “finished” mean from the occupant’s point of view?
- Which cleaning burden arises from the work operation, which from routing and containment, and which from poor housekeeping?
- How far does contamination travel beyond the nominal work boundary?
- Are there surfaces, textiles, ventilation paths or open storage conditions that disproportionately retain contamination?
- Can the cleaning/recovery boundary be materially reduced by architectural decisions without turning the house into a controlled industrial environment?
- What recovery tasks remain even after an otherwise exemplary intervention?

Cleaning time is not assumed to be machine-predictable or architecture-controlled.

---

## OCG-FR-10 — worker, tool, material and debris routes

### Trigger

The work object may be local, while every worker, tool, replacement component, sheet material, removed part and bag of debris must cross the occupied dwelling repeatedly.

### Questions carried forward

- What is the complete route from exterior arrival to work face and back out again?
- Does clean domestic circulation double as the only dirty material/waste route?
- Can large replacement components reach the work face without dismantling unrelated architecture?
- Where can tools/materials be staged without consuming critical occupied routes?
- Can removed parts and waste leave without contaminating unrelated rooms?
- Which logistics depend on real site access rather than house geometry?
- When does a second/external route earn its permanent cost, and when should temporary protection be accepted instead?

OCG does not assume dedicated contractor circulation in an ordinary house.

---

## OCG-FR-11 — temporary protection and furniture displacement

### Trigger

A local intervention may require occupants to empty cabinets, move furniture, roll up rugs, cover belongings or surrender adjacent rooms simply to create a safe work path.

### Questions carried forward

- Which displacement is intrinsic to the object being worked on?
- Which displacement arises from lack of working or withdrawal space?
- Does an access panel exist while the actual working posture still requires clearing half a room?
- Can ordinary furniture coexist with the claimed maintenance geography?
- Does temporary protection itself obstruct circulation or normal household function?
- Would permanent access provision genuinely reduce displacement, or simply reserve valuable domestic space for rare work?

---

## OCG-FR-12 — noise, vibration and worksite behaviour

### Trigger

Even well-contained work can materially affect occupied rooms through drilling, cutting, impact, extraction equipment, radios, doors, worker traffic and vibration.

### Questions carried forward

- Which noisy operations are architecture-dependent and which are simply inherent to construction?
- Does destructive access create avoidable drilling/cutting that could be eliminated?
- Can a room-scale intervention remain acoustically local enough for the rest of the dwelling to function reasonably?
- Would acoustic containment require disproportionate permanent construction?
- When is temporary absence from the dwelling the proportionate answer?

OCG does not promise quiet construction.

---

## OCG-FR-13 — uncertainty, discovery and improvisation

### Trigger

Opening conventional construction can reveal undocumented routes, incompatible previous work, concealed fixings or conditions that expand the job after work starts.

### Questions carried forward

- Which uncertainty is avoidable through physical legibility, records or controlled interfaces?
- Can a future worker identify route, isolation, fixing and withdrawal information before destructive opening begins?
- Where does the building still rely on exploratory demolition?
- How robust is any information strategy if digital records are lost?
- Does increasing explicit service geography reduce discovery risk enough to justify its area and detail burden?
- What uncertainty remains inherently site-, age- or workmanship-dependent?

This packet does not claim that every future condition can be known in advance.

---

## OCG-FR-14 — disproportionate propagation from a local job

### Trigger

The central concern tying the register together is not any one nuisance. It is **propagation**: a small technical intervention can recruit unrelated fabric, services, rooms, routes, trades and recovery tasks.

### Questions carried forward

- What is the smallest technical object of the intervention?
- How much larger is the practical consequence once access, shutdown, work zone, logistics, making-good and cleaning are included?
- Which parts of that enlargement are architecture-determined?
- Which are temporary-method or workmanship effects?
- Is propagation bounded by identifiable interfaces, or does it continue until a convenient construction boundary is reached?
- At what point would reducing propagation require more permanent cost/complexity than the problem warrants?

This is a question for later OCG modelling, not a scalar “blast-radius score”.

---

# 3. Already-known project situations to carry forward as questions

These are not failures. They are current Ovid’s House / Reference House propositions whose real occupied-change consequences are not yet established.

## OCG-PQ-01 — dry-side bathroom access

The current house biases maintainable bathroom valves, cistern/service components and selected controls toward dry/gallery-side access while keeping waterproofing independent.

Carry forward:

- For which bathroom interventions does dry-side access actually keep the wet room usable or reduce finish damage?
- Does opening from the gallery simply move dust/noise/worker occupation into a principal circulation route?
- What withdrawal and working clearances exist once finishes, cabinetry and real products are present?
- Which bathroom tasks still require destructive wet-side work despite accessible controls?

---

## OCG-PQ-02 — room-edge dry-service routes

The current house permits removable skirting, selected jamb/architrave datums and local service routes where proportionate.

Carry forward:

- Can a future cable/data/power alteration be performed through these routes without chasing plaster or lifting principal-room floors?
- How many rooms/routes must be opened to reach the target?
- Does access remain local once furniture and door construction are real?
- What decoration, cleaning and reinstatement follow repeated opening?

---

## OCG-PQ-03 — conventional principal-room floors

The house deliberately retains continuous conventional floors rather than a universal access floor.

Carry forward:

- Which foreseeable interventions still demand floor lifting or cutting?
- Are those interventions rare enough that conventional floors remain clearly proportionate?
- Does selective access become justified anywhere by repeated task evidence?
- What is the occupied consequence of local floor opening compared with the permanent cost of a more accessible system?

---

## OCG-PQ-04 — direct plaster/mineral wall finishes

Quiet permanent walls use direct finishes by default; replaceable architectural lining remains held.

Carry forward:

- Which foreseeable interventions would still require chasing or destructive opening of these walls?
- Do service-edge routes already remove enough need that universal lining remains unnecessary?
- What making-good and repainting burden survives at exceptional crossings or future upgrades?
- Can any removable challenger match the solidity, acoustic behaviour, fixability and calm of the incumbent?

---

## OCG-PQ-05 — concentrated plant/service geography

The current plant/service room, vertical service zone and short high-service relationships are intended to make technical systems legible and accessible.

Carry forward:

- Does concentration actually reduce the occupied consequence of component replacement?
- Does work in the service hub preserve principal rooms, or does shared circulation still spread workers/materials through them?
- Which failures or upgrades still force broad shutdown?
- Does concentrating many systems create a single high-impact intervention zone whose temporary loss is itself consequential?

---

## OCG-PQ-06 — local isolation without universal manifolds

The house has accessible principal and local isolation relationships but does not select universal individually isolatable manifold distribution.

Carry forward:

- Which canonical interventions can be isolated narrowly with the current topology?
- Where does a wider shutdown remain necessary?
- Would finer isolation materially improve occupation during work, or add fittings/complexity without meaningful benefit?

---

## OCG-PQ-07 — replaceable windows and doors in permanent openings

The project separates permanent masonry openings from replaceable frames/doorsets and removable internal trim.

Carry forward:

- Can complete frame/doorset replacement occur without damaging the permanent reveal or large adjacent finish fields?
- What happens to air/water/thermal/fire/acoustic boundaries during replacement?
- Can removal/reinstatement be bounded to the opening?
- How much exterior access, interior protection and repainting remains?

---

## OCG-PQ-08 — plant replacement opening and external route

The plant room preserves a service-side replacement route rather than relying on ordinary domestic cabinetry or principal rooms.

Carry forward:

- Can finite-life plant actually leave through the intended route once real equipment, doors, landscaping and site boundaries exist?
- Does the route keep replacement work materially outside ordinary occupied space?
- What temporary service loss follows plant exchange?
- How much disassembly or making-good occurs at the opening itself?

---

## OCG-PQ-09 — foul and drainage inspection geography

The house provides short branches, accessible stack-base/rodding geography and external inspection access.

Carry forward:

- Can common blockage/inspection work occur without opening principal finishes or contaminating occupied rooms?
- What happens when the failure is not at an access point?
- Do cleaning/odour/hygiene consequences remain local?
- Which interventions still depend principally on real-site drainage conditions?

---

## OCG-PQ-10 — roof/external maintenance from outside

The Reference House deliberately uses external temporary access instead of a permanent roof hatch.

Carry forward:

- Does keeping roof work outside materially protect occupied interiors?
- What site, neighbour, ground-bearing or logistics conditions could invalidate that benefit?
- Does rejecting the roof hatch create any interior work consequence for foreseeable roof interventions?
- Is temporary external access still proportionate across the actual maintenance frequency?

---

## OCG-PQ-11 — manufacturing / off-site preparation

The project prefers controlled manufacture more strongly for shorter-lived replaceable layers where it earns itself, but rejects prefabrication as a universal good.

Carry forward:

- Which interventions can genuinely shift cutting, sanding, finishing or assembly out of the occupied dwelling?
- Does off-site preparation reduce dust/wet work enough to matter after transport, fitting and tolerance adjustment are included?
- Does site scribing or final finishing reintroduce the very contamination supposedly removed?
- What cost, carbon, logistics and replacement dependencies are created?

---

## OCG-PQ-12 — deleted remote en-suite as a control case

The current Reference House deleted a remote en-suite rather than adding destructive cross-structure drainage, bulkheads or a second permanent stack.

Carry forward:

- What occupied-change burden would be created if a future owner later insisted on adding that wet room?
- Is the resulting disruption an acceptable consequence of changing the brief beyond the house’s selected service geography?
- Would pre-provision for such a change have been disproportionate?

This is particularly useful as a control against the assumption that every imaginable future change deserves permanent accommodation.

---

## OCG-PQ-13 — future life-course adaptation

HFI protects some adaptability/life-course questions without pre-installing specialist equipment by default.

Carry forward:

- If a foreseeable adaptation later becomes necessary, how destructive is its installation?
- Which cheap enabling provisions, if any, are genuinely broadly useful and hard to retrofit?
- Which speculative reserves would instead burden the architecture for unlikely scenarios?
- Where does OCG stop because HFI or a real user brief owns the actual adaptation requirement?

---

# 4. Anti-bias questions

The programme began from frustration. OCG therefore needs explicit questions that can falsify its instinct toward greater access and reversibility.

For every later finding ask:

- Would an excellent ordinary contractor, using ordinary temporary protection and sequencing, already bound the consequence adequately?
- Is the perceived problem caused by architecture or by poor workmanship / housekeeping / coordination?
- How often is this intervention actually likely during the building’s life?
- Is accepting disruption once or twice better than carrying permanent access volume, joints, panels or duplicate infrastructure for decades?
- Does the proposed serviceability measure reduce dust while worsening fire, acoustics, airtightness, moisture, robustness, security or visual quality?
- Does a removable assembly create rattles, damage-prone edges, visible grids or institutional character?
- Does local isolation add enough valves/fittings/failure points that maintenance burden rises rather than falls?
- Does extra service geography consume useful domestic area more severely than the occasional intervention consequence it avoids?
- Does off-site manufacture simply shift cost and complexity without materially reducing occupied work?
- Is a claimed low-disruption solution dependent on unusually skilled installers or perfect records?
- Is the intervention genuinely foreseeable, or is “future flexibility” being used as an excuse for speculative overbuilding?
- Would the house remain architecturally desirable if none of these interventions ever happened?

Negative answers are valid programme outcomes.

---

# 5. What OCG-01 must now make possible

OCG-00C does not define the method, but it establishes what the method must later be capable of describing without loss of meaning.

At minimum OCG-01 must be able to distinguish, for a specific intervention:

- the technical object being changed;
- what must be opened or disturbed to reach it;
- what services become unavailable;
- what occupied rooms/routes/functions are lost;
- where work operations and contamination occur;
- how workers, tools, replacement components and waste move;
- what reinstatement follows the technical work;
- what cleaning/recovery follows reinstatement;
- which consequences are architecture-owned versus method/site/shared;
- which consequence is accepted proportionately rather than treated automatically as a defect.

It must do this **without** collapsing the result into one disruption score or pretending that architecture determines contractor duration.

---

# 6. Explicitly rejected premature conclusions

OCG-00C does **not** conclude that:

- all services should be exposed;
- all walls should be panelised;
- all floors should be accessible;
- every room needs a service cavity;
- every branch needs individual isolation;
- every replaceable component needs a dedicated external route;
- wet trades are bad;
- plaster is bad;
- painting after building work is unacceptable;
- dust can or should be eliminated entirely;
- ordinary rooms should be designed as maintenance environments;
- every renovation should be habitable throughout;
- future owners should be able to alter the brief without material disruption;
- the Reference House currently passes or fails occupied-change requirements;
- the publication has earned a new principle or chapter.

Those questions remain open.

---

# 7. Completion gate

OCG-00C is complete when:

1. the originating renovation frictions are durably recorded as problem signals rather than evidence;
2. destructive access, dust spread, service interruption, occupied-room loss, wet-trade tails, making-good, repainting, cleaning, debris/logistics routes and disproportionate propagation are all represented;
3. already-known Ovid’s House / Reference House conditions are converted into future test questions without auditing them;
4. counter-questions prevent the programme from assuming that more access/reversibility is automatically better;
5. no design response, doctrine, pattern, Reference House change, compiler constraint, drawing or publication claim is introduced;
6. OCG-01 receives a clear set of phenomena that its terminology/evaluation frame must be capable of representing.

---

# Result

**OCG-00C PASS — the trigger is now separated from the answer.**

The programme can proceed to OCG-01 without relying on memory of the originating frustration and without elevating that frustration into doctrine.

The key unresolved question remains intentionally plain:

> **When a foreseeable local change occurs, what makes the rest of the occupied house become part of the job?**
