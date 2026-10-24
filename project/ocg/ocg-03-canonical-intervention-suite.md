# OCG-03 — Canonical Intervention Suite

**Programme:** OCG — Occupied Change  
**Parent:** [#547 — occupied change and bounded intervention programme](https://github.com/adamnoden/architecture/issues/547)  
**Packet issue:** [#577 — OCG-03 — canonical intervention suite](https://github.com/adamnoden/architecture/issues/577)  
**Depends on:** OCG-02D / PR #591 / merge `adf8c1f2d26c5818758c621e6fe230ae005cac8c`  
**Baseline `main`:** `adf8c1f2d26c5818758c621e6fe230ae005cac8c`  
**State:** candidate canonical-suite freeze; becomes the OCG-03 record when merged

## Purpose

Freeze a deliberately small, adversarial intervention corpus for later OCG doctrine/system and Reference House audits.

The suite is not a list of trades and not a catalogue of everything a house might ever undergo. It exists to exercise **different ways in which a technically bounded intervention can propagate into unrelated fabric, services, occupied functions, worksite territory, logistics, reinstatement and recovery**.

The governing selection rule is:

> **Choose scenarios for distinct consequence mechanisms, not to reward or punish the current architecture and not merely to represent different trades.**

Thirteen scenarios are sufficient at this gate. Expansion beyond the suite requires a demonstrated coverage gap; it is not permitted merely because a later audit result is inconvenient.

---

# 1. OCG-03 boundary

This record freezes intervention briefs only.

It does **not**:

- judge existing Ovid's House doctrine or patterns — OCG-04;
- judge the Reference House — OCG-05;
- predict a scenario's consequence state before it is applied to controlled architecture;
- assign a proportionality route such as `NO_CHANGE`, `METHOD_RESPONSE`, `DETAIL_RESPONSE_CANDIDATE` or `ARCHITECTURAL_RESPONSE_CANDIDATE`;
- assume that an existing Ovid's House proposition works merely because a scenario appears compatible with it;
- authorise a new access panel, cavity, riser, manifold, removable lining, service route, opening, prefabricated assembly or other architectural response;
- mutate doctrine, patterns, Reference House geometry, compiler constraints, drawings, delivery requirements or publication prose;
- invent contractor duration, dust quantities, noise quantities, cost or a composite disruption score.

A scenario may later show that current architecture already performs well, that temporary method is the proper owner, that disruption should simply be accepted, or that an architectural response deserves investigation. OCG-03 does not prejudge which.

---

# 2. Canonical scenario versus audit instance

This distinction is frozen because later testing would otherwise be easy to game.

## 2.1 Canonical scenario

A canonical scenario is the architecture-independent brief frozen in this record:

- intervention purpose;
- technical object;
- OCG class;
- starting condition;
- minimum necessary technical sequence;
- occupied condition;
- return-to-use condition;
- evidence assumptions;
- known unknowns;
- mechanism for which the scenario is included.

## 2.2 Audit instance

An audit instance applies a canonical scenario to a particular proposition, assembly or Reference House condition.

The audit may add controlled facts such as:

- exact component dimensions;
- actual isolation point;
- actual access side;
- actual route;
- represented opening dimensions;
- room/function relationships;
- real product withdrawal requirements;
- site conditions where controlled.

It may **not** quietly change the canonical purpose, class, starting condition or occupied condition in order to improve the result.

If the architecture or model lacks enough information to instantiate the scenario, the correct result is `UNKNOWN` or `NOT_REPRESENTED` under OCG-01C, not a friendlier scenario.

If a later audit discovers that a genuinely different intervention must be tested, add a separately controlled scenario only after demonstrating the coverage gap.

> **The house adapts to the test only through later authorised design work; the test does not adapt to the house.**

---

# 3. Common scenario assumptions

Unless a scenario states otherwise, the following assumptions apply.

## 3.1 Occupation

- The dwelling is normally occupied by an ordinary household.
- Rooms/functions outside the necessary work envelope remain in residential use where safe and practicable.
- The household has ordinary furniture, possessions and finishes in place; the house is not an empty shell prepared for construction.
- OCG does not assume that the room containing the work remains usable while work is active.

## 3.2 Contractor method

- Work is performed by competent ordinary trades using proportionate temporary protection, local extraction/containment, housekeeping and safe sequencing appropriate to the task.
- Poor housekeeping is not attributed to architecture.
- Heroic or institution-scale temporary works are not assumed.
- Temporary protection may itself have occupancy/logistics consequences and must be recorded where material.

## 3.3 Technical state

- The technical failure or renewal need has been made safe enough for a planned intervention unless the scenario explicitly concerns active leakage/contamination.
- No unrelated project is happening concurrently.
- Existing statutory, structural, fire, acoustic, weather, moisture, electrical and other technical duties remain in force during reinstatement.
- Replacement parts are assumed to be technically obtainable unless product obsolescence is itself the question; exact product geometry remains an audit fact.

## 3.4 Evidence and time

- OCG-02 research is admissible for general causal expectations such as temporary-containment capability, interface duties and reversibility limitations.
- No scenario assumes a universal work duration or recovery duration.
- If curing, drying, commissioning or observation time is required, later audits record the process and only quantify it where a controlled source supports the quantity.

## 3.5 Site facts

- Unknown external access, utility, neighbour, sewer, staging and boundary conditions remain `SITE_PROJECT` unknowns.
- A scenario must not be made artificially easy by assuming generous external access that the controlled site does not establish.
- Equally, OCG-03 does not invent hostile site conditions merely to make a scenario difficult.

---

# 4. Minimum sequence grammar

The scenarios below state only the technical logic that must occur somehow. They intentionally do not prescribe the current house's access route or solution.

A replacement sequence commonly contains:

`make safe / isolate → obtain access → disconnect → create working/withdrawal clearance → remove → introduce replacement → connect → test/commission → reinstate technical boundaries/finishes → clean/recover → return to use`

Inspection/maintenance may omit removal/replacement. Refit/system/structural scenarios have broader sequences appropriate to their technical object.

The later audit must trace the complete sequence rather than stop at `access opens`.

---

# 5. Frozen canonical suite

## OCG-CI-01 — inspect and clear a foul-drainage obstruction

**Class:** OCG-IC1 — Inspection / maintenance action  
**Primary mechanisms:** diagnostic access; dirty/hygienic work; service-function loss; internal/external access geography; containment; method-versus-architecture ownership  
**Primary carried questions:** OCG-PQ-09; OCG-FR-02/03/05/09/10/13/14

### Purpose

Diagnose and clear a restricted foul-drainage path without intentionally renewing the durable drainage system.

### Technical object

The affected foul branch / stack-base / inspection path and its intended rodding or inspection access.

### Starting condition

Drainage performance is materially reduced or blockage is suspected. There is no uncontrolled sewage flooding of occupied rooms; emergency damage response is outside this canonical brief.

### Necessary work sequence

1. establish the affected drainage function and likely blockage region;
2. restrict use of affected sanitary fixtures as required;
3. reach an available inspection / rodding / chamber access point;
4. open the access and perform appropriate inspection/clearance;
5. flush/test the affected route;
6. reclose the access;
7. remove contaminated temporary protection and clean affected work territory;
8. restore ordinary sanitary use.

### Occupied condition

The dwelling remains occupied. Affected sanitary fixtures may be temporarily unavailable; unrelated rooms/functions remain in use where hygienically and safely possible.

### Return-to-use condition

The affected drainage route functions normally, inspection closures are secure, contaminated work surfaces/routes are cleaned, odour/hygiene controls are removed and ordinary sanitary use can resume.

### Evidence assumptions

Competent ordinary drain-clearance methods and hygienic temporary protection are available. Exact blockage location is not assumed.

### Known unknowns

- actual below-ground/site drainage position;
- whether the obstruction is reachable from an intended access point;
- whether access is internal, external or both;
- actual isolation of affected sanitary use;
- contamination route if the blockage lies beyond the designed access geography.

### Reason for inclusion

This is the suite's principal **dirty IC1 case**. It tests whether inspection geography actually keeps a maintenance action bounded without pretending that contamination control is permanent architecture's job by default.

---

## OCG-CI-02 — inspect and clear roof rainwater collection from outside

**Class:** OCG-IC1 — Inspection / maintenance action  
**Primary mechanisms:** external temporary access; site dependence; deliberate absence of permanent internal roof access; logistics; weather-boundary preservation  
**Primary carried questions:** OCG-PQ-10; OCG-FR-03/10/12/14

### Purpose

Inspect and clear a local roof-edge rainwater collection / outlet condition without renewing the roof system.

### Technical object

The relevant accessible roof-edge collection element, outlet or equivalent external rainwater-maintenance point.

### Starting condition

Planned inspection or local debris/partial restriction is present. No active interior leak, structural roof defect or storm emergency is assumed.

### Necessary work sequence

1. establish a safe temporary external access method;
2. protect the immediate external work/staging area as required;
3. reach the rainwater-maintenance point from outside;
4. inspect and clear local debris/restriction;
5. test visible drainage performance where practicable;
6. remove temporary access/protection and restore the external area.

### Occupied condition

Normal internal occupation continues unless the actual temporary-access method creates a bounded safety exclusion adjacent to an opening or garden route.

### Return-to-use condition

The maintenance point is functioning, no interior technical boundary has been opened and temporary external access/protection has been removed.

### Evidence assumptions

Competent temporary external access is a legitimate default method; OCG does not assume a permanent roof hatch is necessary.

### Known unknowns

- real site boundary/ground-bearing conditions;
- neighbour/access constraints;
- exact roof-edge product and maintenance point;
- temporary access equipment required;
- weather constraints.

### Reason for inclusion

This is the suite's strongest **site-dependent / temporary-access control**. It can falsify the instinct that every maintainable location deserves permanent internal access.

---

## OCG-CI-03 — replace a concealed shower control / mixing-valve assembly

**Class:** OCG-IC2 — Component / assembly replacement  
**Primary mechanisms:** dry-side versus wet-side access; local isolation; waterproofing independence; working and withdrawal clearance; occupied circulation; deterministic reclosure  
**Primary carried questions:** OCG-PQ-01/06; OCG-FR-01/03/04/05/07/09/10/11/14

### Purpose

Replace a failed concealed shower control / mixing-valve assembly while retaining the bathroom, shower system architecture and surrounding room organisation.

### Technical object

One bounded concealed shower control / mixing-valve assembly and its immediate service connections.

### Starting condition

The control assembly has failed or reached replacement need. The leak/failure can be isolated safely and the wet-room waterproofing is not itself the failed object.

### Necessary work sequence

1. make the shower safe and isolate the required water service scope;
2. obtain access to the assembly from whatever side the controlled architecture actually provides;
3. create sufficient hand/tool and withdrawal clearance;
4. disconnect the failed assembly;
5. remove it without assuming surrounding finish removal is unnecessary;
6. introduce and connect the replacement;
7. pressure/function test;
8. reinstate any opened technical/finish boundary;
9. clean affected work and circulation territory;
10. restore normal bathroom use.

### Occupied condition

The dwelling remains occupied. The affected shower/bathroom may be unavailable during the intervention. Other water-dependent functions remain available only to the extent actual isolation topology permits.

### Return-to-use condition

The shower control operates normally, all water connections pass required testing, waterproofing/other technical boundaries are intact, access is reclosed to finished condition and affected occupied routes/room are clean.

### Evidence assumptions

A competent contractor uses ordinary temporary protection. Dry-side access is **not assumed** merely because the project currently prefers it; the later audit must prove the actual access side and sequence.

### Known unknowns

- exact product dimensions and withdrawal direction;
- exact local isolation scope;
- access opening size/location;
- dry-side furniture/trim conflicts;
- fire/acoustic duties of any closure;
- whether replacement fittings require local adaptation.

### Reason for inclusion

A technically small wet-service component is a strong test of whether `accessible` means more than `a panel exists`. It forces later work to prove isolation, working clearance, withdrawal, technical-boundary survival and occupied-route consequences together.

---

## OCG-CI-04 — replace the largest bounded finite-life plant module

**Class:** OCG-IC2 — Component / assembly replacement  
**Primary mechanisms:** large/heavy withdrawal; plant-room working geography; replacement route; external/internal logistics; service outage; component-versus-system class boundary  
**Primary carried questions:** OCG-PQ-05/08/11; OCG-FR-03/04/05/10/11/13/14

### Purpose

Replace one bounded finite-life plant module while preserving the incumbent primary system architecture in substance.

### Technical object

The **largest bounded finite-life plant item represented by the controlled plant schedule that can honestly be replaced as one component/assembly without intentionally redesigning the primary system**.

This definition is intentional: OCG-03 does not invent a hot-water cylinder, heat-source unit or other product that current project authority may not actually select. OCG-05 must instantiate the scenario with the controlled plant item that satisfies this definition.

### Starting condition

The plant item has failed or reached end of service life. The surrounding primary system is retained rather than materially reconfigured.

### Necessary work sequence

1. identify and make safe the affected plant/service dependencies;
2. isolate and drain/discharge/de-energise as technically required;
3. create working and disconnection clearance around the item;
4. disconnect services/supports;
5. move the existing item from its operating position to the building exit;
6. remove it from the site-side interface;
7. bring the replacement from outside to the operating position;
8. connect, fill/energise and commission;
9. reinstate any disturbed closures/finishes/protection;
10. remove packaging/old equipment and restore ordinary service use.

### Occupied condition

The dwelling remains occupied where safe. The service supplied by the plant item may be unavailable at the scope dictated by real topology. Principal living rooms are not assumed to be surrendered unless the actual route requires it.

### Return-to-use condition

The replacement plant is commissioned, affected services are restored, the complete transport route is clear/clean and any architectural opening/closure used for replacement is reinstated.

### Evidence assumptions

Normal specialist handling equipment is permitted. The scenario does not assume that a nominal door dimension proves a workable replacement path.

### Known unknowns

- exact controlled plant item;
- mass, envelope and handling orientation;
- dismantling allowance legitimately permitted by the manufacturer;
- internal and external route dimensions;
- door/threshold/landscape/site constraints;
- coupled service dependencies during exchange.

### Reason for inclusion

This tests **maintenance geography as movement**, not simply reach. It also prevents the later audit from claiming plant replaceability without tracing the old unit all the way out and the new unit all the way in.

---

## OCG-CI-05 — replace a complete window assembly in its incumbent opening

**Class:** OCG-IC2 — Component / assembly replacement  
**Primary mechanisms:** bounded replaceability; permanent host versus finite-life assembly; envelope technical boundaries; large-object withdrawal; internal/external protection; finish matching  
**Primary carried questions:** OCG-PQ-07/11; OCG-FR-01/02/03/07/08/09/10/11/12/14

### Purpose

Replace one complete failed/end-of-life window frame/assembly while retaining its permanent masonry opening and the room's spatial organisation.

### Technical object

One complete window assembly within an incumbent permanent opening, including only immediate fixing/sealing interfaces necessary for replacement.

### Starting condition

The assembly is due for complete replacement. The permanent opening itself is serviceable and is not intentionally being enlarged or structurally altered.

### Necessary work sequence

1. establish internal/external protection and safe access;
2. remove finish/trim elements that must move to expose the frame interface;
3. release fixings/seals without assuming the opening survives perfectly;
4. withdraw/remove the existing assembly and route it out;
5. inspect the permanent opening/interface;
6. introduce, position and mechanically fix the replacement assembly;
7. restore air/water/thermal/weather/fire/acoustic/security duties that apply;
8. reinstate internal/external trim and affected finish fields;
9. test operation/weather closure as applicable;
10. clean and restore the room/external work territory.

### Occupied condition

The affected room may be surrendered locally while the opening is exposed. The remainder of the dwelling stays occupied where safe. External access/protection is temporary and site-dependent.

### Return-to-use condition

The opening is secure and weather-tight, required technical boundaries are reinstated, the window operates normally, affected finishes are complete and the room is clean and ordinarily usable.

### Evidence assumptions

A replacement assembly of plausible future geometry exists. OCG does not assume identical future frame profiles or proprietary fixings.

### Known unknowns

- actual product frame dimensions/fixing positions;
- withdrawal direction and glazing-removal assumptions;
- tolerance/mounting zone geometry;
- external access method;
- exact sealing/finish interface;
- whether adjacent finish matching enlarges reinstatement.

### Reason for inclusion

This is the suite's mature **bounded-replaceability** test: a large finite-life assembly inside a much slower host. It can validate or falsify the sash-window-like principle without generalising it to the whole house.

---

## OCG-CI-06 — renew a leaking upper-level water-supply branch

**Class:** OCG-IC3 — Branch / subsystem intervention  
**Primary mechanisms:** wet-service route; destructive access; local versus broad isolation; conventional floor/wall interaction; leak containment; making-good propagation  
**Primary carried questions:** OCG-PQ-03/04/06; OCG-FR-01/02/03/04/05/06/07/08/09/10/11/12/13/14

### Purpose

Renew one bounded domestic-water branch serving an upper wet-room fixture group after the branch/run itself develops a leak or reaches renewal need.

### Technical object

One bounded hot or cold domestic-water distribution branch from its upstream branch/isolation relationship to its served upper wet-room endpoints, not the primary water system as a whole.

### Starting condition

Leakage has been detected and made safe/contained enough for planned work. Consequential drying/repair from pre-intervention water damage is excluded except where the architecture cannot separate it from access/reinstatement.

### Necessary work sequence

1. establish the affected branch and safe isolation scope;
2. trace/confirm its route sufficiently to plan work;
3. obtain access along the portions requiring renewal;
4. drain/depressurise and disconnect the branch;
5. remove/abandon the failed run only where technically legitimate;
6. install/connect the replacement bounded branch;
7. pressure/leak test;
8. reclose all access points and restore crossed technical boundaries;
9. complete necessary finish reinstatement;
10. clean/recover affected occupied territory and restore water service.

### Occupied condition

The house remains occupied. The served wet-room fixtures are unavailable during relevant phases; unrelated water use remains available only if actual isolation topology permits. Rooms crossed by the route remain occupied except while temporarily surrendered for safe access/work.

### Return-to-use condition

The renewed branch is proven leak-tight, required water service is restored, all opened fabric/technical boundaries are closed, finish reinstatement is complete enough for ordinary use and the affected route/rooms are clean.

### Evidence assumptions

The branch failure is genuinely in the run rather than one replaceable fitting, preserving IC3 classification. Competent leak control and temporary protection are assumed.

### Known unknowns

- actual route and branch extent;
- isolation granularity;
- whether route lies in deliberate service geography or conventional floor/wall territory;
- actual number/type of access openings;
- drying/finish consequences of the work itself;
- whether abandoned-in-place segments are technically permissible.

### Reason for inclusion

This is the strongest test of the project's claim that short-life wet services should not consume slow fabric. It also exposes whether conventional principal floors/walls are actually implicated once service geography is taken seriously.

---

## OCG-CI-07 — add a new data branch to an occupied bedroom

**Class:** OCG-IC3 — Branch / subsystem intervention  
**Primary mechanisms:** future dry-service change; route legibility; room-edge distribution; conventional plaster/floor preservation; furniture/door-junction conflict; low-service-outage counterpoint  
**Primary carried questions:** OCG-PQ-02/03/04/11; OCG-FR-01/02/03/04/07/08/09/10/11/12/13/14

### Purpose

Add one new wired data branch from the dwelling's controlled communications/distribution point to a new outlet position in an existing occupied bedroom.

### Technical object

One new bounded low-voltage data cable branch and its endpoint, within the incumbent higher-level communications/service-distribution strategy.

### Starting condition

The bedroom exists and is fully finished/furnished. The desired outlet did not exist at completion. No room refit is otherwise planned.

### Necessary work sequence

1. identify the distribution origin and target outlet position;
2. establish the permitted/available route through the existing house;
3. protect only the work/route territory required;
4. obtain route and endpoint access;
5. install the cable branch and termination hardware;
6. test the branch;
7. close/reinstate any opened interfaces or finishes;
8. reset displaced furniture/protection and clean affected occupied territory.

### Occupied condition

The house remains occupied and the bedroom is only locally/temporarily surrendered as necessary. No material whole-house service outage is intrinsic to the scenario.

### Return-to-use condition

The new branch is tested, all route/endpoint access is reclosed, displaced furniture/protection is reset and the bedroom/route are ordinarily usable without unfinished decoration or work controls.

### Evidence assumptions

Low-voltage data is chosen deliberately so the scenario strongly tests **physical route consequence without allowing broad electrical shutdown to dominate the result**.

### Known unknowns

- exact distribution origin;
- room-edge/skirting/door-surround route continuity;
- penetrations between compartments/floors;
- furniture and joinery conflicts;
- bend-radius/pullability constraints;
- whether any route portion is not represented.

### Reason for inclusion

This is a clean test of whether Ovid's House can absorb an ordinary future dry-service addition without chasing quiet walls or lifting principal-room floors. It also prevents service-outage severity from hiding a weak physical route.

---

## OCG-CI-08 — complete family-bathroom refit within the incumbent room envelope

**Class:** OCG-IC4 — Room / local functional refit  
**Primary mechanisms:** loss of bathing/toileting function; wet-work and curing; waterproofing; multiple local service interfaces; material/waste route; distinction between intrinsic refit work and collateral access work  
**Primary carried questions:** OCG-PQ-01/06/11; OCG-FR-01/02/03/04/05/06/07/08/09/10/11/12/13/14

### Purpose

Renew the family bathroom as a coordinated local functional setting while retaining the room envelope and primary building spatial/structural organisation.

### Technical object

The bathroom as a bounded functional setting: sanitary fixtures, local controls/fittings, waterproof/wet finishes and subordinate local service interfaces included in an ordinary complete refit.

### Starting condition

The existing bathroom is functional but due for coordinated renewal. No hidden structural failure or whole-house service-system replacement is assumed.

### Necessary work sequence

1. establish alternative household sanitary arrangements only to the extent actually available / method-provided;
2. isolate affected local services;
3. protect access/material/waste routes;
4. remove fixtures, furniture and finishes within the intended refit scope;
5. expose/adjust local service interfaces required by the new room arrangement;
6. carry out necessary substrate/waterproofing work;
7. install renewed fixtures/fittings/finishes;
8. complete required curing/testing/commissioning;
9. reinstate interfaces at the room boundary;
10. remove protection, clean and return the bathroom to ordinary use.

### Occupied condition

The remainder of the dwelling remains occupied where safe. The family bathroom is unavailable for material portions of the intervention. OCG does not assume that another full bathroom exists; availability of alternative WC/bathing is an audit fact.

### Return-to-use condition

Required sanitary functions operate safely, waterproofing/finishes have reached their controlled return-to-use state, services are commissioned, work controls are removed and the bathroom/access route are clean and ordinarily usable.

### Evidence assumptions

Wet trades remain legitimate. The audit must distinguish wet/dust work intrinsic to a durable bathroom refit from collateral work created solely by service access or poor interface relationships.

### Known unknowns

- actual alternative sanitary provision;
- retained versus changed fixture positions;
- exact wet-finish system and curing requirements;
- dry-side access usefulness once full products/furniture are instantiated;
- material/waste route;
- local isolation topology.

### Reason for inclusion

The originating renovation concern cannot be tested only with component swaps. A bathroom refit is deliberately allowed to remain **real construction**, while the audit asks whether architecture keeps that construction from propagating unnecessarily into unrelated house territory.

---

## OCG-CI-09 — complete kitchen refit within the incumbent room envelope

**Class:** OCG-IC4 — Room / local functional refit  
**Primary mechanisms:** loss of cooking/washing function; bulky logistics; cabinetry/furniture interfaces; appliance/service isolation; finish reinstatement; off-site preparation versus site fitting  
**Primary carried questions:** OCG-PQ-05/06/11; OCG-FR-01/02/03/04/05/06/07/08/09/10/11/12/13/14

### Purpose

Renew the kitchen as a coordinated room/function while retaining the room envelope and primary building spatial/structural organisation.

### Technical object

The kitchen as a bounded functional setting: fixed kitchen furniture, worktops, appliances, sink/taps and subordinate local power/water/waste/extract interfaces included in an ordinary complete refit.

### Starting condition

The incumbent kitchen is due for coordinated renewal. No structural extension, primary-system replacement or wholesale room relocation is part of the brief.

### Necessary work sequence

1. isolate affected appliances/services and make the kitchen safe;
2. establish temporary household arrangements only where provided by method/household, not as a permanent-architecture assumption;
3. protect worker/material/waste routes;
4. remove appliances, joinery/worktops and intended finishes;
5. expose/adjust local service interfaces needed by the replacement kitchen;
6. introduce/install new fixed furniture, worktops, appliances and fittings;
7. connect/test/commission local services and source capture as applicable;
8. complete finish/interface reinstatement;
9. remove protection/packaging/waste and clean;
10. restore ordinary cooking/washing/storage use.

### Occupied condition

The dwelling remains occupied where safe, but normal kitchen function may be materially unavailable. Adjacent principal circulation/living territory remains in use unless the actual material/waste/staging route requires temporary surrender.

### Return-to-use condition

Safe cooking, sink/washing and required appliance functions are restored, local services are tested, fixed furniture/finishes are complete and the kitchen/route are cleaned and free of work controls.

### Evidence assumptions

Off-site preparation only receives credit if the instantiated sequence demonstrates that it actually removes/compresses dusty, wet or fabrication operations from the occupied house.

### Known unknowns

- exact retained/changed appliance positions;
- cabinet module/product geometry;
- service-edge access after furniture installation;
- worktop/site-scribing requirements;
- route/staging availability;
- local isolation and extract connection details.

### Reason for inclusion

This complements the bathroom case with a dry-furniture-heavy refit where logistics, staging and service-edge integration may matter more than waterproofing. It guards against treating all room refits as one wet-room problem.

---

## OCG-CI-10 — create a remote en-suite outside the selected wet-service geography

**Class:** OCG-IC4 — Room / local functional refit  
**Primary mechanisms:** future brief expansion; new wet/soil/extract branches; deliberate absence of pre-provision; generic-flexibility control; structure/service crossings; consequence accepted versus infrastructure carried forever  
**Primary carried questions:** OCG-PQ-12; OCG-FR-01/02/03/04/05/06/07/08/09/10/11/12/13/14

### Purpose

Convert an existing upper dry room / dressing-storage territory remote from the selected wet-service core into a new en-suite bathroom **without changing the dwelling's primary structural/spatial organisation as the project purpose**.

### Technical object

The new remote en-suite as a bounded local functional setting, including subordinate water, waste/soil, ventilation/extract, electrical and waterproofing work needed to make that room function.

### Classification note

The canonical purpose is room creation, so the base scenario is IC4. If an actual implementation requires an independently purposeful redesign of the primary building service architecture, that additional purpose must be split and analysed separately as IC5 rather than silently changing the canonical scenario.

### Starting condition

The target territory is a finished dry room / dressing-storage use with no dedicated remote wet-room branch, soil stack or hidden reserve assumed.

### Necessary work sequence

1. establish feasible service/structural routes from controlled existing systems to the remote room;
2. protect and open only the fabric necessary to create those routes and the new wet setting;
3. install required water, foul/waste, ventilation/extract and electrical branches;
4. form the wet-room substrate/waterproofing and local interfaces;
5. install sanitaryware, controls and finishes;
6. test/commission all new branches and boundaries;
7. reinstate every route/opening outside the new bathroom;
8. clean/recover all affected rooms/routes;
9. return the altered area and collateral territory to ordinary use.

### Occupied condition

The dwelling remains occupied where safe. The target room is surrendered. Any principal room/circulation crossed by new routes is temporarily affected according to the actual sequence rather than assumed away.

### Return-to-use condition

The new en-suite is fully functional and compliant, all collateral openings/service crossings are technically and visually reinstated, work routes are clean and unrelated rooms/functions have returned to ordinary use.

### Evidence assumptions

No latent remote wet-room infrastructure is granted merely because it would make the scenario easier. Equally, the scenario does not assume the change is architecturally unreasonable; proportionality is judged later.

### Known unknowns

- viable gravity drainage/soil route;
- structural crossing constraints;
- fall/ventilation geometry;
- service capacity;
- affected fire/acoustic boundaries;
- exact collateral finish fields;
- whether a second stack or bulkhead becomes necessary;
- actual household value/frequency of such a brief change.

### Reason for inclusion

This is the suite's strongest **anti-overprovision control below IC6**. It tests whether the project can honestly say that some future conveniences are possible but materially disruptive because pre-provision would have burdened the house permanently.

---

## OCG-CI-11 — renew the primary electrical distribution system

**Class:** OCG-IC5 — Primary system renewal / upgrade  
**Primary mechanisms:** whole-house dry-service access; primary distribution topology; broad service outage; repeated endpoint/branch work; quiet-wall/floor interfaces; temporary service provision  
**Primary carried questions:** OCG-PQ-02/03/04/05; OCG-FR-01/02/03/04/05/07/08/09/10/11/12/13/14

### Purpose

Renew materially the dwelling's primary electrical distribution system while retaining the primary spatial/structural organisation.

### Technical object

The primary electrical distribution architecture: principal distribution equipment and the coordinated building-wide circuit/branch family included in a genuine system renewal.

### Starting condition

The incumbent electrical system requires end-of-life renewal or a material system-level upgrade. The dwelling is fully finished and occupied; this is not first-fix construction.

### Necessary work sequence

1. survey/document incumbent circuits and dependencies sufficiently to plan safe renewal;
2. establish isolation and any proportionate temporary-power strategy;
3. isolate/de-energise affected system portions;
4. access/remove/renew primary distribution equipment;
5. renew/reconfigure required building-wide branches and endpoints through actual available routes;
6. make controlled crossings/interfaces required by the renewed system;
7. connect, test and certify/commission the renewed system;
8. close/reinstate every accessed fabric/technical boundary/finish field;
9. remove temporary power/protection and clean;
10. restore ordinary electrical use throughout the dwelling.

### Occupied condition

The dwelling remains occupied only to the extent safe electrical and worksite conditions permit. OCG does not promise uninterrupted power; temporary power is a method option whose consequences must be recorded rather than assumed.

### Return-to-use condition

The renewed system is commissioned, required circuits are available, all access/reinstatement is complete, temporary electrical/work controls are removed and affected occupied territory is clean and usable.

### Evidence assumptions

The scenario is intentionally whole-system so easy replacement of one socket or one circuit cannot stand in for building-wide service-renewal capability.

### Known unknowns

- exact future renewal scope/standards;
- reuse versus replacement of existing dry routes;
- representability of endpoint routes;
- isolation/temporary-power strategy;
- crossing/fire/acoustic closure details;
- extent of finish disturbance.

### Reason for inclusion

This is the primary **dry-system IC5 stress test**. It tests whether concentrated trunks and room-edge routes actually scale to a building-wide renewal rather than merely making small additions easy.

---

## OCG-CI-12 — renew / materially upgrade the primary space-heating system

**Class:** OCG-IC5 — Primary system renewal / upgrade  
**Primary mechanisms:** plant and distribution renewal together; large plant movement; wet-service topology; broad functional outage; controls/commissioning; branch access; off-site preparation  
**Primary carried questions:** OCG-PQ-05/06/08/11; OCG-FR-01/03/04/05/07/09/10/11/12/13/14

### Purpose

Renew or materially upgrade the dwelling's primary space-heating system such that the heat-source / primary distribution / control architecture is genuinely the object of work while primary spatial/structural organisation remains.

### Technical object

The primary space-heating system architecture, including plant, primary distribution/control relationships and subordinate branch/component changes required by the system renewal.

### Starting condition

The incumbent system has reached system-renewal need or a credible material upgrade is selected. This is not merely one bounded heat-source component swapped like-for-like; that would be IC2.

### Necessary work sequence

1. survey/document incumbent system and dependencies;
2. establish isolation/drain-down and any temporary-heating/hot-water method where relevant;
3. decommission/remove plant and system elements within renewal scope;
4. route old equipment/materials out;
5. introduce replacement plant/equipment;
6. renew/reconfigure primary distribution, controls and required branches/interfaces;
7. refill/energise, test, balance and commission;
8. reinstate all opened fabric/technical boundaries/finishes;
9. remove temporary systems/protection and clean;
10. restore normal heating and any coupled services.

### Occupied condition

The dwelling remains occupied where safe, but normal heating may be unavailable during portions of the intervention. Coupled hot-water loss is recorded only if the instantiated system actually creates it. Season/weather are site/project facts, not silently assumed.

### Return-to-use condition

The renewed heating system is fully commissioned, intended zones/controls operate, all plant/branch access is reclosed, temporary systems/protection are removed and occupied rooms/routes are restored.

### Evidence assumptions

The audit must separate architecture-determined outage **scope** from method/programme-determined outage **duration**.

### Known unknowns

- future heat-source/system type;
- plant dimensions and external interfaces;
- retained versus renewed distribution branches;
- coupling to domestic hot water;
- actual commissioning requirements;
- branch-access/reinstatement extent.

### Reason for inclusion

This is the primary **wet/plant IC5 stress test**, deliberately distinct from electrical renewal. It exercises plant replacement geography, distribution access and system service continuity together.

---

## OCG-CI-13 — remove a substantial load-bearing wall to replan principal rooms

**Class:** OCG-IC6 — Primary spatial / structural alteration — control class  
**Primary mechanisms:** deliberate slow-fabric alteration; temporary works; wide dust/noise/debris; structural logistics; service rerouting; major finish reinstatement; honest non-promise boundary  
**Primary carried questions:** OCG-FR-01/02/03/04/05/06/07/08/09/10/11/12/13/14

### Purpose

Materially replan two principal rooms by removing a substantial load-bearing wall / forming a major structural opening between them.

### Technical object

The primary structural/spatial relationship formed by the load-bearing wall and the connected room arrangement.

### Starting condition

The dwelling is structurally sound and normally occupied. The owner deliberately chooses a materially different principal-room relationship; the intervention is not forced by hidden structural failure.

### Necessary work sequence

1. establish structural design, temporary works and affected service information;
2. clear/surrender the required work and safety zone;
3. isolate/reroute affected services as necessary;
4. install temporary support/protection;
5. demolish/remove the structural wall within the designed extent;
6. install the new permanent structural support/opening arrangement;
7. complete required fire/acoustic/service interfaces;
8. reinstate floors/ceilings/walls/finishes across the altered boundary;
9. remove temporary works/protection/debris;
10. clean/recover affected territory and return the replanned rooms to ordinary use.

### Occupied condition

The work zone and any structurally required exclusion zone are surrendered. Continued occupation of the remainder of the house is allowed only where the competent structural/construction method considers it safe; OCG makes no promise that this intervention remains locally habitable.

### Return-to-use condition

Permanent structural support is complete and verified, all affected technical boundaries/services/finishes are reinstated, temporary works are removed and the altered rooms/routes are clean and ordinarily usable.

### Evidence assumptions

This scenario is deliberately materially disruptive. The canonical suite needs at least one case for which universal low-disruption accommodation would itself be suspect.

### Known unknowns

- actual Reference House wall/opening selected for an audit instance;
- temporary works geometry;
- services intersecting the wall;
- structural member size and handling route;
- finish/redecoration extent;
- safe partial-occupation conditions.

### Reason for inclusion

This is the programme's explicit **honest boundary control**. It prevents later OCG language from drifting into a promise that arbitrary primary spatial/structural change should be easy, clean or compatible with normal occupation.

---

# 6. Intervention-class coverage

The 13 scenarios cover all six OCG classes without treating class number as disruption severity.

| Class | Canonical scenarios | Coverage purpose |
|---|---|---|
| IC1 — inspection / maintenance | CI-01, CI-02 | one dirty/internal-or-external service-maintenance case and one external/site-dependent access control |
| IC2 — component / assembly replacement | CI-03, CI-04, CI-05 | small concealed wet component; large plant module; large envelope assembly |
| IC3 — branch / subsystem | CI-06, CI-07 | wet branch renewal versus dry future branch addition |
| IC4 — room / local functional refit | CI-08, CI-09, CI-10 | ordinary wet refit; furniture/service-heavy kitchen refit; deliberately unserved future wet-room brief |
| IC5 — primary system renewal / upgrade | CI-11, CI-12 | dry electrical system versus wet/plant heating system |
| IC6 — spatial / structural control | CI-13 | deliberate major structural replanning/non-promise control |

No extra class is needed.

---

# 7. Consequence-mechanism coverage

The suite is selected because the scenarios are **not interchangeable**.

| Mechanism | Principal scenarios |
|---|---|
| diagnostic access without component renewal | CI-01, CI-02 |
| hygienic/dirty maintenance | CI-01 |
| external temporary access and real-site dependence | CI-02, CI-05 |
| local service isolation | CI-03, CI-06, CI-08, CI-09 |
| waterproofing / wet technical-boundary independence | CI-03, CI-08, CI-10 |
| actual component withdrawal, not mere reach | CI-03, CI-04, CI-05 |
| large/heavy replacement route | CI-04, CI-05, CI-09, CI-12 |
| wet branch access through a finished occupied house | CI-06 |
| dry-service addition through a finished occupied house | CI-07 |
| conventional floors/plaster challenged by future service work | CI-06, CI-07, CI-11 |
| room-function loss and intrinsic refit construction | CI-08, CI-09 |
| wet-trade / curing / recovery tail | CI-08, CI-10, CI-13 where applicable |
| bulky joinery/material/waste staging | CI-09 |
| future brief outside chosen service geography | CI-10 |
| building-wide dry-system renewal | CI-11 |
| building-wide wet/plant-system renewal | CI-12 |
| broad service-outage scope versus programme duration | CI-11, CI-12 |
| slow-fabric alteration that OCG should not pretend to eliminate | CI-13 |

This is why a fourth plumbing-component swap or another socket replacement would add less value than the apparently less common roof-access and IC6 controls.

---

# 8. Trigger/friction coverage

Every originating OCG friction is exercised by at least one scenario, while no scenario is selected merely to tick a register row.

| Trigger/friction | Representative scenarios |
|---|---|
| FR-01 destructive access | CI-03, 05, 06, 07, 08, 11, 13 |
| FR-02 contamination / dust spread | CI-01, 06, 08, 09, 11, 13 |
| FR-03 living alongside work | all scenarios by common occupied-condition rule |
| FR-04 unrelated room/function loss | CI-03, 04, 06, 08, 09, 11, 12, 13 |
| FR-05 excessive service interruption | CI-01, 03, 06, 08, 09, 11, 12 |
| FR-06 wet-trade / curing tails | CI-08, 09, 10, 13 where applicable |
| FR-07 making-good propagation | CI-03, 05, 06, 07, 08, 09, 10, 11, 13 |
| FR-08 repainting / finish renewal | CI-05, 06, 07, 10, 11, 13 |
| FR-09 post-work cleaning / recovery | CI-01, 03, 05, 06, 08, 09, 10, 11, 13 |
| FR-10 worker / material / debris routes | CI-04, 05, 08, 09, 10, 12, 13 |
| FR-11 temporary protection / furniture displacement | CI-05, 07, 08, 09, 11 |
| FR-12 noise / vibration | CI-06, 08, 09, 11, 13 |
| FR-13 uncertainty / discovery | CI-01, 06, 07, 10, 11, 13 |
| FR-14 disproportionate propagation | CI-06, 08, 09, 10, 11, 12, 13 |

---

# 9. Existing-project question coverage

OCG-03 is not an architecture audit, but the corpus must be capable of testing the questions frozen before research.

| Existing question | Canonical coverage |
|---|---|
| PQ-01 dry-side bathroom access | CI-03, CI-08 |
| PQ-02 room-edge dry-service routes | CI-07, CI-11 |
| PQ-03 conventional principal-room floors | CI-06, CI-07, CI-11 |
| PQ-04 direct plaster/mineral wall finishes | CI-06, CI-07, CI-11 |
| PQ-05 concentrated plant/service geography | CI-04, CI-09, CI-11, CI-12 |
| PQ-06 local isolation without universal manifolds | CI-03, CI-06, CI-08, CI-09, CI-12 |
| PQ-07 replaceable windows/doors in permanent openings | CI-05 (window representative) |
| PQ-08 plant replacement opening / external route | CI-04 |
| PQ-09 foul/drainage inspection geography | CI-01 |
| PQ-10 roof/external maintenance from outside | CI-02 |
| PQ-11 manufacturing / off-site preparation | CI-04, CI-05, CI-08, CI-09, CI-12 where sequence evidence exists |
| PQ-12 deleted remote en-suite control | CI-10 |
| PQ-13 future life-course adaptation | deliberately not frozen without a concrete HFI-owned adaptation brief |

## 9.1 Why PQ-13 is not a fourteenth scenario

`Life-course adaptation` is a reason for change, not a technical intervention class. Depending on the actual need it could instantiate IC2, IC3, IC4, IC5 or IC6.

Freezing a generic `adapt the house for disability/ageing` scenario would either:

- duplicate HFI authority;
- hide the technical object;
- universalise an unspecified user need; or
- smuggle speculative reserves into OCG.

If HFI later supplies a concrete adaptation brief with a defined technical object, OCG should map it to the existing class/suite or add a scenario only if a genuinely new consequence mechanism appears.

---

# 10. Candidate scenarios deliberately not selected

The parent programme listed examples generously. OCG-03 must reduce them rather than canonise every example.

## 10.1 Socket / switch replacement

**Not selected.**

A single bounded dry electrical component is adequately represented as a class boundary by IC2, while CI-07 and CI-11 exercise the more informative physical-route and system-renewal mechanisms. Add later only if an endpoint-specific access/fixing problem proves unique.

## 10.2 Concealed-cistern internals

**Not selected separately.**

CI-03 is a harder concealed wet-component test because it combines isolation, connection, working/withdrawal clearance and wet-boundary implications. CI-08 then tests the room-wide bathroom condition.

## 10.3 Radiator / emitter replacement

**Not selected separately.**

Local wet isolation/connection is exercised in CI-03/06 and large component movement in CI-04/05; whole heating-system topology is exercised in CI-12. An emitter scenario can be added only if later coverage proves a unique fixing/floor/handling mechanism.

## 10.4 Complete doorset replacement

**Held, not selected initially.**

CI-05 exercises the permanent-opening / replaceable-assembly relationship. A doorset has additional threshold/security/fire variants, but adding it now would overweight one principle. If OCG-04/05 shows that threshold or fire-door reclosure creates a genuinely distinct mechanism, it can earn a later scenario.

## 10.5 Generic future service not originally installed

**Not selected as an unconstrained scenario.**

A fictional future service can justify almost any reserve and is therefore easy to abuse. CI-07 supplies a credible ordinary future dry branch; CI-10 tests an unprovided wet function; CI-11/12 test primary-system change. A specific new service family must earn inclusion with evidence.

## 10.6 Floor-finish replacement / room redecoration

**Not selected initially.**

These may be legitimate maintenance/refit tasks but do not presently expose a consequence mechanism absent from the selected room-refit and reinstatement cases. OCG is principally testing propagation from technical change, not building a general decorating programme.

## 10.7 Ordinary appliance replacement

**Not selected separately.**

Large bounded withdrawal is exercised harder by CI-04/05, while kitchen appliance/service integration appears inside CI-09. A special appliance route is added only if later architecture makes it a unique problem.

---

# 11. Anti-gaming rules for later audits

## 11.1 No favourable scenario mutation

Do not change a failed component into an easier product, move a target outlet, relocate the remote en-suite, assume empty rooms or grant a second bathroom merely because the Reference House performs better under that variant.

## 11.2 No hostile mutation either

Do not invent an oversized replacement product, impossible neighbour condition, catastrophic leak or pathological user brief merely to create failure.

## 11.3 Unknown remains unknown

Where product, site, detail or model information is missing, use OCG-01C evidence states. Do not substitute assumed ideal geometry.

## 11.4 Temporary works receive proper ownership

Competent temporary protection/containment/sequencing is assumed. A scenario cannot fail permanent architecture merely because temporary works are inconvenient. Conversely, architecture cannot receive credit for consequences controlled only by contractor method.

## 11.5 Complete sequence or no verdict

A later audit has not evaluated the intervention if it proves only that the object can be reached.

At minimum, where applicable, trace:

`approach → protect/contain → isolate/make safe → expose/access → work/withdraw → remove/waste route → introduce replacement/material → connect/build → test/commission → close/reinstate → clean/recover → return to use`

## 11.6 Negative outcomes are protected

The suite is intentionally compatible with later conclusions of:

- `NO_CHANGE`;
- `ACCEPT_DISRUPTION`;
- `METHOD_RESPONSE`;
- `MORE_EVIDENCE`;

as well as detail/architectural response candidates.

A programme in which every scenario generates a new architectural feature has probably failed its own proportionality test.

---

# 12. Expansion rule

The canonical suite may grow beyond 13 only if a later coverage review identifies a **material consequence mechanism not exercised by the current corpus**.

Valid reasons might include:

- an intervention class is discovered to contain a genuinely distinct sequence family;
- an existing scenario cannot represent a technical boundary important to the project;
- a concrete HFI adaptation brief exposes a consequence mechanism not present here;
- a doorset/threshold/fire-door case proves materially different from the window-opening relationship;
- real evidence establishes a common future service family with a distinct topology/occupation problem.

Invalid reasons include:

- the current house fails a scenario and an easier variant is desired;
- the current house passes a scenario and a harder arbitrary challenge is desired;
- a trade is absent from the list despite its mechanism already being represented;
- a speculative future product sounds interesting;
- a scenario would make a preferred architectural idea look useful.

Any added scenario must receive a stable ID, explicit rationale and coverage-gap statement. Existing IDs must never be recycled.

---

# 13. Integrity tests

## 13.1 Suite size

**PASS.** Thirteen scenarios sit inside the intended 10–15 initial range.

## 13.2 Intervention-class coverage

**PASS.** IC1–IC6 are all represented, including an explicit IC6 non-promise control.

## 13.3 Mechanism diversity

**PASS.** The corpus distinguishes diagnostic maintenance, contaminated work, site-dependent external access, concealed component access, large withdrawal, envelope replacement, wet/dry branch work, room refits, deliberate non-provision, primary dry/wet system renewal and structural replanning.

## 13.4 No trade catalogue

**PASS.** Repetitive component examples were deliberately excluded where they added no new consequence mechanism.

## 13.5 No Reference House tailoring

**PASS.** Canonical briefs are architecture-independent. Controlled Reference House facts enter only at audit-instantiation time.

## 13.6 No design conclusion

**PASS.** No scenario asserts that an access panel, riser, manifold, removable finish, new route or other permanent provision is required.

## 13.7 No zero-disruption promise

**PASS.** Room refits remain construction and CI-13 deliberately permits the possibility that major structural change should remain materially disruptive.

## 13.8 Temporary-method ownership preserved

**PASS.** Competent temporary works are assumed and remain distinct from permanent architecture.

## 13.9 Complete intervention envelope supported

**PASS.** Each scenario includes access/work/removal or task sequence, occupied condition, reinstatement/recovery and return-to-use requirements rather than stopping at technical access.

## 13.10 Anti-gaming / restart safety

**PASS.** Canonical scenarios are frozen separately from audit instances; unknown model facts cannot silently become favourable assumptions.

---

# Result

**OCG-03 PASS — the canonical intervention suite freezes at 13 scenarios.**

The durable corpus is:

1. inspect/clear foul drainage;
2. inspect/clear roof rainwater collection from outside;
3. replace concealed shower control/mixing-valve assembly;
4. replace largest bounded finite-life plant module;
5. replace complete window assembly;
6. renew leaking upper water-supply branch;
7. add new data branch to an occupied bedroom;
8. complete family-bathroom refit;
9. complete kitchen refit;
10. create a remote en-suite outside selected wet-service geography;
11. renew primary electrical distribution;
12. renew/materially upgrade primary space-heating system;
13. major load-bearing-wall replanning control.

The suite is deliberately difficult in different ways and deliberately includes interventions for which **no permanent architectural response may be the correct answer**.

No existing Ovid's House proposition or Reference House condition has yet passed or failed because of this record.

After clean merge, the next authorised gate is **OCG-04 — existing-doctrine / system audit**.