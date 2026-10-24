# OCG-01A — Terminology

**Programme:** OCG — Occupied Change  
**Parent:** [#547 — occupied change and bounded intervention programme](https://github.com/adamnoden/architecture/issues/547)  
**Packet issue:** [#566 — OCG-01A — terminology](https://github.com/adamnoden/architecture/issues/566)  
**Depends on:** OCG-00C / PR #565 / merge `9ae5f94d001b764cffa9efa370026df5247b38d2`  
**Baseline `main`:** `9ae5f94d001b764cffa9efa370026df5247b38d2`  
**State:** candidate terminology freeze; becomes the OCG-01A record when merged

## Purpose

Freeze the smallest vocabulary OCG needs to describe occupied interventions without silently creating design requirements, intervention classes, a scoring system or a parallel maintenance doctrine.

The terms below are analytical language only. They let later packets describe what happens during change and where consequences propagate. They do not establish that any consequence is unacceptable, that architecture caused it, or that a permanent architectural response is warranted.

---

## OCG-01A boundary

This record does not:

- define intervention classes — OCG-01B;
- define the consequence ledger or its final fields — OCG-01C;
- define proportionality or acceptance tests — OCG-01D;
- perform external research — OCG-02;
- select canonical interventions — OCG-03;
- audit Ovid’s House or the Reference House — OCG-04/05;
- create doctrine, patterns, Reference House changes, compiler constraints, delivery requirements, drawings or publication prose;
- establish numerical disruption, renovability or blast-radius metrics.

Where a term overlaps existing maintenance, HFI, service, delivery or site authority, that existing authority remains the owner of the underlying architectural or process proposition. OCG owns only the cross-cutting description of intervention consequences.

---

# 1. Adjacent terms required to avoid circular definitions

## 1.1 Technical object

The **technical object** is the element, assembly, service, finish, space condition or defined system relationship that an intervention is intentionally directed at.

Examples may include a failed valve, a shower waste, a cable run, a window assembly, a room finish, a plant item or a whole service distribution system.

The technical object is not automatically the same thing as the area disturbed by the work.

A local technical object may create a much wider intervention consequence envelope; conversely, a large technical object may be worked on with comparatively little collateral consequence.

The term does not imply that the object is defective, replaceable, serviceable or architecture-owned.

## 1.2 Occupied condition

The **occupied condition** is the stated habitation assumption under which an intervention is being considered.

It records which parts of the dwelling remain in residential use and which ordinary functions, routes or occupants are assumed to remain present during the work.

An occupied condition may range from:

- the whole dwelling remaining in use except the immediate work area;
- one room or zone being surrendered temporarily;
- occupants remaining resident but being absent during working hours;
- partial temporary decant while another part of the dwelling remains inhabited.

It is not a promise that every intervention can or should occur under every occupied condition.

## 1.3 Return-to-use condition

The **return-to-use condition** is the point at which the dwelling or affected part can again perform the ordinary residential functions assumed for the intervention without temporary work controls, unfinished reinstatement or residual intervention burden materially preventing that use.

It is an occupant-facing completion condition, not merely the moment when the technical object has been repaired, installed or commissioned.

Return to use does not require that an intervention has left no evidence of having occurred, nor that every cosmetic preference has been satisfied beyond the stated reinstatement scope.

## 1.4 Propagation

**Propagation** is the extension of intervention consequences beyond the technical object and the direct task needed to act on it.

Propagation may occur through fabric, services, occupied space, contamination, logistics, reinstatement or recovery.

Propagation is descriptive, not automatically a defect. Some interventions reasonably have wide consequences. Later OCG work must determine whether a particular propagation is unavoidable, proportionate, architecture-determined, method-dependent, site-dependent or otherwise justified.

No scalar propagation ratio is created by this term.

---

# 2. Core OCG terms

## 2.1 Occupied change

**Occupied change** is an intervention carried out while some or all of the dwelling remains under an occupied condition rather than being treated as a wholly vacant construction site.

It may include inspection, maintenance, repair, replacement, refit, upgrade or alteration.

Occupied change does not mean:

- every room remains continuously usable;
- every service remains continuously available;
- work is silent, dustless or consequence-free;
- occupants must remain physically present while trades are working;
- temporary local decant is prohibited;
- major construction must be made compatible with normal habitation.

The term describes the habitation context of the intervention. It does not establish what architecture should provide.

### Authority boundary

HFI continues to own ordinary inhabitation and person × task × state questions. Delivery and contractor method own temporary working arrangements by default. OCG uses occupied change only to state the context in which intervention consequences are examined.

---

## 2.2 Foreseeable change

**Foreseeable change** is a kind of future intervention for which there is a reasonable basis to expect occurrence during the relevant life of the building, assembly or service, even though its exact timing, product or cause may be unknown.

Reasonable bases may later include evidence such as:

- known inspection or maintenance need;
- finite component or finish life;
- credible failure and replacement;
- ordinary appliance, fixture or service renewal;
- common system upgrade;
- evidence-supported life-course adaptation;
- known regulatory, technological or functional change where the evidence warrants it.

Foreseeable does not mean merely imaginable.

The term excludes speculative flexibility justified only by the possibility that an owner might someday want an arbitrary layout, service or technology.

It also does not mean probable enough to deserve permanent architectural provision. That is a later proportionality question.

### Authority boundary

OCG may decide that a change belongs in its test set. HFI retains ownership of whether a life-course adaptation itself should be supported; architectural and service authorities retain ownership of any permanent response.

---

## 2.3 Intervention

An **intervention** is a defined episode of work undertaken for a stated purpose on one or more technical objects.

For OCG analysis, the episode is considered from the preparation needed to undertake the work through return to use, rather than stopping at the moment the direct technical task is complete.

Depending on the case, the episode may include:

- preparation and temporary protection;
- obtaining access;
- isolation or shutdown;
- inspection or direct work on the technical object;
- removal and extraction;
- delivery and installation of replacement material or components;
- testing and recommissioning;
- closure and reinstatement;
- cleaning, drying, curing, reset or other recovery needed for return to use.

This list describes possible sequence scope only. It does not freeze intervention classes or ledger fields.

An intervention is not synonymous with a trade package, a contractor visit, a room, or the technical object itself.

### Authority boundary

Maintenance geography may already own the safe/task-complete route to the object. Delivery may own sequencing and temporary works. OCG treats the intervention as the episode whose consequences are being traced across those authorities.

---

## 2.4 Intervention consequence envelope

The **intervention consequence envelope** is the complete set of material consequences created by carrying out a defined intervention under a stated occupied condition, through return to use.

It is the primary analytical object of OCG.

The envelope may include consequences involving:

- building fabric and finishes;
- service availability or dependency;
- occupied rooms, routes or functions;
- dust, debris, moisture, odour, noise or other worksite effects;
- worker, tool, material, replacement-part and waste movement;
- reinstatement and making-good;
- cleaning, curing, reset and other recovery.

This is a **set of consequences**, not necessarily a geometric shape. Some parts may be spatially representable; others are topological, temporal or dependency-based.

The envelope must therefore not be reduced to:

- one drawn polygon;
- one duration;
- one room count;
- one cost;
- one disruption, renovability or blast-radius score.

A larger envelope is not automatically unacceptable. Later packets determine causal ownership, evidence and proportionality.

### Authority boundary

OCG owns description of the envelope. Existing architectural, assembly, service, delivery and site authorities own the causes and any accepted responses.

---

## 2.5 Access boundary

The **access boundary** is the spatial and material extent of building elements or finishes that must be opened, removed, displaced, penetrated or otherwise disturbed in order to make the technical object available for the intended direct work.

It describes the disturbance required to **obtain access**, not the full intervention consequence envelope.

It may include, for example, removal of a trim piece, access cover, floor element, lining section or sacrificial finish needed to expose the work object.

It excludes, unless they are themselves disturbed to obtain access:

- the worker/material route to the work face;
- the general working zone around the object;
- service shutdown effects;
- temporary dust containment;
- the direct alteration of the technical object;
- later cleaning and recovery.

The access boundary may be zero or negligible where the technical object is already directly reachable.

### Authority boundary

Maintenance/service authorities remain responsible for whether access is safe, adequate and technically appropriate. OCG uses the access boundary to distinguish the collateral disturbance required merely to reach the object from the work on the object itself.

---

## 2.6 Reinstatement boundary

The **reinstatement boundary** is the spatial and material extent of building work that must be restored, reassembled, repaired, resealed or refinished after the direct task and access operation so that the building again meets its intended technical and finish condition.

It may include:

- reclosing an access assembly;
- replacing removed trim or finishes;
- restoring waterproofing, airtightness, acoustic, fire or weather boundaries where they were disturbed;
- patching, plastering, filling, sealing or decorating where those operations are part of restoring the affected construction.

The reinstatement boundary is not necessarily identical to the access boundary. Finish matching, damaged interfaces or necessary technical restoration may make it larger; a deliberately reclosable interface may make it nearly coincident.

It excludes residual cleaning, furniture reset, odour clearance and other post-reinstatement burdens that belong to recovery consequence.

### Authority boundary

The owning construction/interface authority determines what technical reinstatement is required. OCG records its extent and its effect on occupied change.

---

## 2.7 Containment

**Containment** is the temporary or permanent arrangement used to limit the spread of intervention-generated worksite conditions beyond an intended limit.

Depending on the intervention, the conditions being contained may include:

- dust and debris;
- moisture or dirty water;
- fumes, odours or aerosols;
- tools, materials or temporary hazards;
- worker/worksite occupation of domestic space.

Containment describes a control relationship, not a claim that zero migration is achieved.

It does not automatically mean permanent compartmentation, a dedicated contractor route, industrial clean-room practice or new architectural infrastructure.

### Authority boundary

Temporary barriers, extraction, protection, housekeeping and sequencing are delivery/contractor-method owned by default. OCG may later identify that permanent geometry either enables or frustrates competent containment, but the term itself creates no permanent design requirement.

---

## 2.8 Service consequence

A **service consequence** is any material change in the availability, performance, independence or operating state of a building service experienced because an intervention is being carried out.

It may include, where relevant:

- planned shutdown;
- loss of a branch, zone or whole system;
- loss of hot water, heating, power, drainage, ventilation, data or other service function;
- loss of redundancy or backup;
- a temporary operating restriction required to keep the work safe or technically valid.

The consequence may affect only the technical object or may propagate to unrelated users, rooms or systems.

Service consequence does not mean that the service topology is defective. Nor does the term prescribe finer isolation.

### Authority boundary

Service architecture owns topology, isolation and technical relationships. OCG records the occupied-change consequence of those relationships during an intervention.

---

## 2.9 Recovery consequence

A **recovery consequence** is the residual burden between technical reinstatement and the return-to-use condition that exists because the intervention occurred.

It may include:

- final or repeated cleaning;
- dust settlement and wipe-down;
- drying or curing before normal use;
- ventilation or odour clearance;
- removal of temporary protection;
- furniture, storage or household reset;
- other non-design work needed before the affected dwelling can function normally again.

Recovery consequence is deliberately separated from reinstatement.

Reinstatement restores disturbed building construction and finishes. Recovery restores ordinary residential use after that technical work is complete.

The existence of a recovery consequence is not itself an architectural defect, and its duration must not be treated as architecture-controlled without evidence.

### Authority boundary

Contractor method, products, weather, occupant behaviour and site conditions may strongly determine recovery. OCG records the consequence and later allocates causal ownership rather than presuming it belongs to permanent architecture.

---

# 3. Relationships between the terms

The terms are intended to support the following non-circular reading:

1. State the **occupied condition**.
2. Identify a **foreseeable change** to be examined.
3. Define the **technical object** and intervention purpose.
4. Describe the **intervention** through return to use.
5. Identify the **access boundary** required to reach the technical object.
6. Record any **service consequence** and relevant **containment** relationship.
7. Identify the **reinstatement boundary** after the direct work.
8. Record the **recovery consequence** before the **return-to-use condition** is reached.
9. The total material consequence across the episode is the **intervention consequence envelope**.
10. Any extension of consequence beyond the technical object/direct task may be described as **propagation**, without yet judging it excessive or unacceptable.

This sequence is analytical language only. It is not an intervention class system, a ledger schema or an architectural prescription.

---

# 4. Deliberately rejected terminology

The following are not formal OCG terms:

- **blast radius** — acceptable conversational shorthand only; it misleadingly suggests a single geometric radius;
- **renovation pain** — too subjective for durable analysis;
- **disruption score** / **renovability score** — rejected scalar pseudo-precision;
- **zero-disruption renovation** — false programme promise;
- **maintenance-free** / **future-proof** — overclaiming and conceptually incompatible with OCG’s evidence/proportionality posture;
- **construction-free replacement** — potentially useful marketing language, not a rigorous analytical category;
- **demountable house** — not the project objective and conflicts with the controlled OCG-00B baseline.

---

# 5. Friction-register coverage test

The terminology can describe every OCG-00C friction without deciding its cause or solution:

| OCG-00C friction | Minimum terms needed |
|---|---|
| destructive access | technical object + access boundary + reinstatement boundary |
| dust / contamination spread | containment + intervention consequence envelope + propagation |
| living alongside work | occupied condition + occupied change + return-to-use condition |
| loss of unrelated rooms/functions | occupied condition + consequence envelope + propagation |
| broad service interruption | service consequence + consequence envelope |
| wet-trade / curing tails | reinstatement boundary + recovery consequence |
| making-good propagation | reinstatement boundary + propagation |
| repainting / finish renewal | reinstatement boundary + consequence envelope |
| post-work cleaning | recovery consequence + return-to-use condition |
| worker/tool/material/debris routes | intervention + consequence envelope |
| furniture displacement / temporary protection | occupied condition + containment + consequence envelope |
| noise / vibration | intervention consequence envelope + propagation |
| uncertainty / discovery | intervention + consequence envelope; causal ownership remains later work |
| disproportionate propagation | technical object + consequence envelope + propagation |

No friction requires a numerical score or an architectural conclusion to be stated coherently.

---

# 6. Integrity tests

## 6.1 No hidden architectural ownership

PASS. None of the terms claims that an observed consequence belongs to architecture. Service, assembly, contractor, site and HFI authorities remain intact.

## 6.2 No circular definition

PASS. The technical object and occupied condition can be stated before the intervention is analysed. The intervention can then be described independently of the size or acceptability of its consequence envelope.

## 6.3 No scalar pseudo-precision

PASS. The consequence envelope is explicitly plural and heterogeneous. Spatial, system, temporal and recovery consequences are not collapsed into one number.

## 6.4 No zero-disruption promise

PASS. Occupied change permits temporary room loss, service loss, decant and materially disruptive interventions where later evidence/proportionality justify them.

## 6.5 Existing baseline remains unchanged

PASS. These definitions do not promote held floors, linings, manifolds, extra risers, prefabrication, panels or any other OCG-00B non-selection.

---

# Result

**OCG-01A PASS — terminology is sufficiently precise to support intervention classification without changing architectural authority.**

The core analytical object remains:

> **intervention consequence envelope** — the complete set of material consequences created by carrying out a defined intervention under a stated occupied condition, through return to use.

The central descriptive phenomenon remains:

> **propagation** — consequences extending beyond the technical object and direct task.

Neither formulation says that propagation is inherently bad or that architecture must eliminate it.

## Next authorised packet

**OCG-01B — intervention classes.**

01B may use the frozen terms above to create the smallest useful intervention-class system. It must not yet define the consequence ledger or proportionality framework.