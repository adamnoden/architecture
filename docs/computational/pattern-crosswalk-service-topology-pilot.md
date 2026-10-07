# Service-Topology Pattern Crosswalk — Pilot 01

**Status:** Phase-8 P8.1 worked crosswalk  
**Context:** current Reference House coordination occurrences  
**Method:** [Architectural Pattern → Computational Crosswalk](pattern-crosswalk-model.md)  
**Purpose:** test whether canonical patterns can contribute useful computational consequences through the existing semantic / obligation / evidence architecture without becoming a parallel compiler ontology.

---

# 1. Result in one sentence

**The seven-pattern pilot maps cleanly onto the existing computational architecture: six require no new semantic primitive, while `HSA-P-012` exposes one small candidate refinement for durable physical identifier/index correspondence.**

The pilot therefore supports continuing Phase 8, subject to red-team review.

It does **not** justify implementing pattern-specific rule engines.

---

# 2. Pilot set

The Reference House currently has identifiable coordination occurrences for:

| Pattern | Reference House occurrence | Crosswalk state |
|---|---|---|
| `HSA-P-001` Controlled Utility Entry | `RH-P001-01` | **NATIVE + FIXTURE NEEDED** |
| `HSA-P-002` Plant Room as Service Hub | `RH-P002-01` | **NATIVE + FIXTURE NEEDED** |
| `HSA-P-003` Coherent Horizontal Service Route | `RH-P003-01` | **NATIVE + FIXTURE NEEDED** |
| `HSA-P-004` High-Service-Room Service Wall | `RH-P004-01/02` | **NATIVE + FIXTURE NEEDED** |
| `HSA-P-005` Designed Structural Penetration | `RH-P005-01..06` | **NATIVE** |
| `HSA-P-012` Physical Service Index | `RH-P012-01` | **SMALL REFINEMENT** |
| `HSA-P-014` Accessible Vertical Service Zone | `RH-P014-01` | **NATIVE + FIXTURE NEEDED** |

`NATIVE + FIXTURE NEEDED` means the existing model vocabulary is sufficient, but the claimed pattern-conformance path has not yet been exercised in executable form.

`HSA-P-005` is marked `NATIVE` because controlled penetration, boundary transition and obligation-bundle machinery have already survived paper-scale composition tests. A future executable fixture is still required for implementation confidence.

---

# 3. Shared pilot finding — two layers of validity

Each occurrence creates two different questions.

## Layer A — did the project realise the selected pattern?

This is a project architectural requirement with pattern provenance.

Example:

```text
RH-P002-01 claims HSA-P-002
    ↓
Does the model actually contain:
  maintainable plant/service concentration?
  declared access?
  working volume?
  replacement route?
```

## Layer B — are the resulting building relationships technically resolved?

These obligations derive from the composed building, with their actual authority.

```text
equipment in G-SVC-01
    ↓
heat rejection / ventilation / drainage / acoustics / electrical / maintenance obligations
```

The same model facts support both layers. The obligations are not duplicated.

---

# 4. `HSA-P-001` — Controlled Utility Entry

**Occurrence:** `RH-P001-01`  
**Coverage:** **NATIVE + FIXTURE NEEDED**

## Architectural invariant

Incoming services cross from site/external infrastructure into the building through a small number of deliberate, documented and maintainable transitions rather than accumulating unowned penetrations.

## S — source semantic commitments

Existing vocabulary is sufficient:

- external/site `System` / `Network` routes for each utility class;
- internal network start/distribution node;
- one or more `Penetration` / `BoundaryTransition` occurrences;
- host wall/assembly identity;
- service class carried by each transition;
- principal `Isolator` or isolation relationship;
- external approach route and internal continuation;
- boundary roles interrupted by each crossing;
- optional reserved capacity represented as an actual bounded opening/interface, not prose.

For `RH-P001-01`, the model should be able to say that water/electricity/communications arrive from the east service side and cross into `G-SVC-01` through adjacent but not necessarily shared transitions.

## O — pattern-conformance obligations

Conditional on claiming `P-001`:

1. every included utility entry has a stable identified transition;
2. the transition has an identified host and service class;
3. principal isolation is represented and accessible;
4. the external→internal route is traceable;
5. reserved entry capacity, if claimed, is represented explicitly rather than assumed.

Authority: **project architectural requirement** with `HSA-P-001` provenance.

## O — induced technical obligations

Derived independently from actual crossings:

- structural effect where applicable;
- weather/water/air/thermal/fire/acoustic/pest/security continuity as applicable;
- supplier/service separation requirements;
- permitted penetration geometry;
- sealing/blanking evidence;
- inspection where closure would conceal consequential work.

These belong to boundary, structural, product, target and evidence machinery — not to the pattern engine.

## Evidence / resolution

- utility/site records or supplier evidence;
- geometry query for transition/isolator access;
- product/assembly evidence for sleeves/seals where relevant;
- inspection evidence before concealment;
- external determination where supplier/engineering constraints sit outside native coverage.

## D — diagnostics

Potential non-blocking feedback:

- count of external-to-internal service transitions;
- distance from transition to principal hub/distribution point;
- entry route crossing a principal occupied space;
- reserved capacity with no declared credible use.

These are decision aids, not universal thresholds.

## J — retained judgement

- whether entries are grouped closely enough to be coherent;
- whether the zone is architecturally subordinate;
- whether future capacity is proportionate.

## Anti-formalisation warning

Do **not** model `controlled_utility_entry = true` or require all utilities to share one hole.

## Mutation test

Move the water isolator behind an inaccessible fixed cabinet and add an unregistered late service penetration through the same external wall.

Expected result:

- `P-001` conformance becomes unresolved/fails for access/ownership;
- the new penetration independently generates boundary obligations;
- no pattern rule needs to know how weather sealing itself works.

---

# 5. `HSA-P-002` — Plant Room as Service Hub

**Occurrence:** `RH-P002-01`  
**Coverage:** **NATIVE + FIXTURE NEEDED**

## Architectural invariant

Major maintainable plant, controls, isolation and distribution are concentrated in a genuine service location with explicit working and replacement geography.

## S — source semantic commitments

- `Space` / `Zone` representing the hub;
- contained/hosted `Equipment`, distribution and isolation nodes;
- network relationships showing what the hub serves;
- `MaintenanceTask` relationships for consequential equipment;
- `WorkingVolume` around service faces/components;
- `WithdrawalVolume` and `WithdrawalPath` for replaceable plant;
- `AccessPath` from ordinary approach / external replacement route;
- relevant boundary relationships to adjacent occupied/protected spaces;
- drainage/discharge relation where selected equipment creates credible leakage consequence.

## O — pattern-conformance obligations

Conditional on claiming `P-002`:

1. the hub contains/concentrates more than nominal leftover equipment geography;
2. consequential equipment has an explicit maintenance/access relationship;
3. largest declared replaceable units have a withdrawal route;
4. principal isolation/distribution points are represented and reachable;
5. the hub connects meaningfully to downstream service topology.

The compiler does not decide whether the area cost is philosophically worthwhile.

## O — induced technical obligations

From actual equipment/space/boundary state:

- equipment-specific working clearances;
- ventilation / heat rejection;
- drainage or leakage management where required;
- electrical/service connection requirements;
- fire/acoustic/air/thermal consequences at adjoining boundaries;
- support/vibration requirements;
- replacement-path geometry.

## Evidence / resolution

- semantic inference for network concentration;
- geometric clearance/withdrawal queries;
- selected equipment/product evidence;
- engineering calculation/determination for heat rejection/acoustics where necessary;
- inspection and commissioning at later phases.

## D — diagnostics

- plant split across multiple unrelated zones;
- replacement route crosses a bedroom/principal sitting room;
- one component's withdrawal envelope intersects another fixed component;
- proportion of hub floor area blocked by non-service storage in an as-built/in-use scenario;
- route distance between hub and primary vertical/horizontal distribution.

## J — retained judgement

- whether the hub earns its area;
- whether it is architecturally well placed;
- whether the result feels quiet/domestic rather than institutional beyond measurable technical criteria.

## Anti-formalisation warning

A `PlantRoom` type or room label is not conformance. An empty room named `PLANT` fails if equipment cannot be maintained or replaced.

## Mutation test

Increase the selected hot-water/plant replacement unit beyond the door/turning envelope while leaving the room label unchanged.

Expected result: replacement obligation invalidates while the spatial room entity remains otherwise well formed.

---

# 6. `HSA-P-003` — Coherent Horizontal Service Route

**Occurrence:** `RH-P003-01`  
**Coverage:** **NATIVE + FIXTURE NEEDED**

## Architectural invariant

Horizontal distribution forms a legible route/branch topology rather than independent ad-hoc paths through structure, boundaries and rooms.

## S — source semantic commitments

- service `Network` and `RouteSegment` entities;
- typed service class / route role;
- source, branch and sink connectivity;
- physical host/zone for each route segment;
- route envelope rather than centre-line only where geometry matters;
- branch relationships;
- maintenance/access nodes for maintainable components;
- boundary crossings / penetrations;
- service compatibility/separation constraints where known;
- gravity/duct requirements such as fall/bend envelope where applicable.

`RH-P003-01` should remain multiple service-specific routes sharing a coherent geography, not one universal mixed-services object.

## O — pattern-conformance obligations

Conditional on claiming `P-003`:

1. claimed route segments form connected distribution topology from source toward declared sinks;
2. local branches are distinguishable from primary route segments;
3. route hosts/zones are explicit where coordination depends on them;
4. access exists at declared maintainable nodes;
5. services declared as incompatible do not silently share prohibited space.

## O — induced technical obligations

Derived from the real networks/hosts:

- capacity/clearance envelope;
- drainage fall and duct bend requirements;
- structural conflicts;
- fire/acoustic/air boundary crossings;
- service separation;
- supports;
- maintainable component access.

## Evidence / resolution

- semantic connectivity;
- geometry/collision queries;
- engineering calculations or family constraints for drainage/ducting;
- fire/acoustic/product evidence at crossings;
- inspection where concealed supports/closures matter.

## D — diagnostics

- crossing count by route option;
- route length / branch length comparison;
- number of independent primary routes;
- volume/depth occupied by routing;
- repeated entry into principal rooms;
- spare capacity utilisation.

These are useful optimisation signals, not a machine definition of coherence.

## J — retained judgement

- whether the service geography produces a good domestic section;
- whether the area/depth cost is proportionate;
- whether circulation remains architectural rather than technical.

## Anti-formalisation warning

Do not require one `spine`, one corridor route or one common services duct. `P-003` is topology, not a component type.

## Mutation test

Add a new bathroom branch that bypasses the established route and drills independently through two structural/boundary elements.

Expected result:

- route/conformance diagnostic reports an unowned/ad-hoc branch;
- actual crossings independently create their structural/boundary obligations;
- the compiler need not forbid all independent branches globally.

---

# 7. `HSA-P-004` — High-Service-Room Service Wall

**Occurrences:** `RH-P004-01`, `RH-P004-02`  
**Coverage:** **NATIVE + FIXTURE NEEDED**

## Architectural invariant

Maintainable high-service components are biased toward a deliberate room edge/zone where they can be accessed and withdrawn without unnecessary destruction of the occupied wet/finished face.

## S — source semantic commitments

- room and adjacent service/access space;
- service-zone/wall-side spatial extent;
- hosted service components;
- access side relationship;
- `MaintenanceTask`, `WorkingVolume`, `WithdrawalVolume` and path where consequential;
- wet/waterproof, acoustic and fire boundary roles;
- component/network connections into building-scale routes.

## O — pattern-conformance obligations

Conditional on claiming `P-004`:

1. consequential selected components are actually located in/against the declared service zone;
2. the declared maintenance side is reachable;
3. required work/withdrawal geometry exists;
4. routine maintenance does not require destructive removal of the protected occupied finish where the pattern claims dry-side access;
5. the service zone participates in the declared upstream route rather than becoming an isolated technical pocket.

## O — induced technical obligations

- waterproof-boundary continuity and independence;
- acoustic/privacy performance;
- fire/smoke/air continuity where applicable;
- drainage/leakage consequences;
- product service clearances;
- structural fixing/host obligations.

## Evidence / resolution

- geometry query for access/withdrawal;
- semantic inference for component/access-side relationship;
- wet-zone/product evidence;
- acoustic/fire external or supported-family evidence;
- inspection/commissioning for concealed service work.

## D — diagnostics

- number of maintainable components concentrated per service zone;
- panel access blocked by future storage/joinery scenario;
- service wall depth versus component envelope;
- maintenance route enters another private room.

## J — retained judgement

- whether the added thickness earns itself;
- whether the adjoining room remains spatially good/private/quiet;
- whether the finished wall reads as architecture rather than equipment furniture.

## Anti-formalisation warning

An access panel alone is not `P-004`; visible access without tool/withdrawal geometry is false conformance.

## Mutation test

Place shelving in the dry-side service zone so the valve is visible after opening the panel but the concealed cistern cannot be withdrawn.

Expected result: access-to-view may remain true; replacement/maintenance obligation fails.

---

# 8. `HSA-P-005` — Designed Structural Penetration

**Occurrences:** `RH-P005-01..06`  
**Coverage:** **NATIVE**

## Architectural invariant

Required crossings are explicit owned interfaces between the routed service and the host/boundaries rather than late anonymous holes.

## S — source semantic commitments

Already strongly represented by current computational research:

- `Penetration` / `Opening` identity;
- host element identity;
- service/route passing through;
- opening geometry;
- structural context;
- every boundary role interrupted;
- transition/reinstatement components;
- maintenance/inspection relationship where relevant;
- permitted/no-drill/no-notch zones as project/family constraints.

The existing controlled service-penetration family and interface-bundle work are direct precedent.

## O — pattern-conformance obligations

Conditional on claiming `P-005`:

1. the crossing has stable identity;
2. host and routed system are declared;
3. geometry/location are explicit;
4. interrupted boundaries are discoverable from the composed graph;
5. the crossing is part of coordinated source information rather than anonymous site drilling.

## O — induced technical obligations

These must come from the host/service/boundary graphs, not from `P-005` itself:

- structural adequacy / trimming / bearing effects;
- fire stopping;
- air/thermal/weather/water continuity;
- acoustic/pest requirements;
- service support/separation;
- product/system evidence;
- inspection/hold points.

## Evidence / resolution

Existing evidence architecture applies directly: geometry, calculation, supported family, product evidence, inspection and external professional determination.

## D — diagnostics

- crossing count by route/system;
- repeated unique penetrations where a common family may exist;
- unused spare penetrations;
- site-created crossing not present in design source;
- crossing whose technical obligations substantially exceed a nearby route alternative.

## J — retained judgement

- whether remaining visible covers/collars are architecturally resolved;
- whether preserving future capacity is proportionate.

## Anti-formalisation warning

`penetration.status = designed` is meaningless. A named hole with unresolved structure/fire/weather remains unresolved.

## Mutation test

Change `CP-04` from a non-fire-separating host condition to a fire-separating floor while retaining the same penetration geometry and evidence.

Expected result:

- prior evidence becomes insufficient/stale for the new boundary role;
- new fire obligations arise;
- pattern identity does not change.

---

# 9. `HSA-P-012` — Physical Service Index

**Occurrence:** `RH-P012-01`  
**Coverage:** **SMALL REFINEMENT**

## Architectural invariant

A small critical layer of service identity/operational information remains physically present at the building and corresponds to the richer semantic/digital record.

## Existing native coverage

The computational model already has:

- stable semantic identities;
- building records;
- service/network/component identities;
- lifecycle/change records;
- inspection/commissioning evidence;
- provenance and supersession.

## Candidate small refinement

To prove the **physical** part rather than merely the digital record, implementation may need a bounded concept equivalent to:

- `PhysicalIdentifierMark` / `PhysicalInformationArtifact`, or
- an ordinary physical `Component` carrying an `identifies` / `refers-to` relationship.

Do not choose syntax yet.

The minimum semantic need is simply:

> a physical artefact/mark at location X corresponds to semantic identity Y and is itself inspectable/change-controlled.

If existing generic component/document relationships can express this cleanly in implementation, no new primitive is required.

## S — source semantic commitments

- index physical location/artifact;
- stable identifiers included in the index;
- mapping from each physical identifier to actual service/component/network identity;
- identifiers repeated at selected physical targets where useful;
- ownership/update process for change events.

## O — pattern-conformance obligations

Conditional on claiming `P-012`:

1. a physical non-software-only index/identifier layer exists;
2. critical listed IDs resolve to current semantic entities;
3. selected physical labels correspond to the same IDs;
4. the index location remains accessible;
5. commissioning/change-control includes an identity-correspondence check.

## O — induced/process obligations

- inspection that installed labels/index match source identities;
- change event invalidates or flags the physical record when an identified component is replaced/renamed;
- completion release cannot treat a planned physical index as installed evidence before inspection.

## Evidence / resolution

- semantic identity resolution;
- inspection evidence / commissioning evidence;
- change-control provenance;
- physical record photograph or equivalent occurrence evidence if useful.

## D — diagnostics

- semantic component has critical isolation role but no physical identifier where project policy expects one;
- index references superseded/nonexistent ID;
- physical and digital records diverge after change;
- excessive index content can be warned about only via project-defined policy, not universal machine judgement.

## J — retained judgement

- how much information is enough;
- visual restraint;
- format durability beyond explicit material/product evidence;
- whether a QR/link is useful as a supplement.

## Anti-formalisation warning

A complete digital model does **not** satisfy `P-012`. The deliberate point of the pattern is resilience outside software/account dependencies.

## Mutation test

Replace isolation valve `ISO-07` with a new occurrence/ID and update the digital model but leave the physical index/label unchanged.

Expected result: digital model integrity remains valid; `P-012` conformance / physical-record evidence becomes stale or fails.

---

# 10. `HSA-P-014` — Accessible Vertical Service Zone

**Occurrence:** `RH-P014-01`  
**Coverage:** **NATIVE + FIXTURE NEEDED**

## Architectural invariant

Where multi-storey service demand justifies concentration, vertical routes share deliberate building geography with explicit service separation, boundary crossings and access only where maintenance value warrants it.

## S — source semantic commitments

- vertical `Space` / `Zone` spanning declared storeys/levels;
- contained service `RouteSegment`s by system/class;
- connection to demand nodes / horizontal routes;
- route/zone clear envelope;
- sub-zones or separation relationships where required;
- declared maintenance/access nodes;
- floor/roof/wall `Penetration`s and boundary transitions;
- supports and host relationships;
- relevant acoustic/fire/moisture boundaries.

## O — pattern-conformance obligations

Conditional on claiming `P-014`:

1. the zone is vertically continuous over its declared scope;
2. routed systems actually use the declared geography rather than repeatedly bypassing it;
3. declared maintenance nodes are reachable;
4. service classes with required separation have explicit arrangement/constraint;
5. storey crossings are identified and coordinated;
6. zone geometry includes linings/supports/insulation where those affect usable clearance.

## O — induced technical obligations

- fire/smoke/acoustic cavity closure;
- structural opening/support adequacy;
- drainage/ventilation geometry;
- service separation;
- condensate/moisture management;
- support/fixing/product evidence;
- inspection at concealed cavity closures.

## Evidence / resolution

- topology/semantic inference;
- geometric clearance queries;
- supported family/product evidence;
- external fire/acoustic/structural/services determinations where native scope ends;
- pre-closure inspection.

## D — diagnostics

- number of independent storey crossings with/without the zone;
- service-demand nodes remote from the zone;
- occupancy of reserved envelope;
- bypass routes created after initial coordination;
- access nodes that expose no maintainable component.

## J — retained judgement

- whether the zone earns its area;
- whether split wet/dry zones are architecturally preferable;
- domestic/repose character;
- whether access should exist at every location.

## Anti-formalisation warning

Do not equate “large shaft” with adaptability or require all service classes to share one enclosure.

## Mutation test

Add fire/acoustic linings and realistic pipe/duct supports that reduce the clear zone below the envelope needed by one declared route.

Expected result: route/clearance obligation fails without changing the nominal shaft boundary or pattern label.

---

# 11. Pilot-wide semantic additions

## No new pattern ontology

**PASS.** None of the seven requires a dedicated pattern-specific building entity.

## Existing semantic model coverage

The pilot reuses:

- spaces/zones;
- service systems/networks/nodes/routes/equipment/isolators;
- physical assemblies/openings/penetrations;
- boundary transitions;
- interfaces;
- maintenance tasks/access paths/working and withdrawal volumes;
- stable identity;
- evidence and change/invalidation.

## Candidate refinement 01 — physical identity artefact

`P-012` may justify one small refinement enabling an inspectable physical mark/index to correspond to a semantic identity.

**Decision:** carry as a candidate refinement into P8.2. Do not alter the foundational formal model yet.

---

# 12. Pilot-wide obligations

The crosswalk reveals a useful rule for implementation:

> **Pattern conformance should be a composed report over source facts and existing obligations, not an independent technical rule pack.**

A future report may show:

```text
RH-P014-01 / HSA-P-014

architectural occurrence identity          PASS
vertical continuity                        PASS
service-route participation                PASS
maintenance-node access                    PASS
floor penetrations identified              PASS
fire/acoustic closure                      UNRESOLVED
structural opening adequacy                EXTERNAL EVIDENCE REQUIRED
clear route envelope                       PASS
proportionality / domestic character       HUMAN JUDGEMENT
```

This is enough to make pattern intent computationally useful without claiming the compiler can judge the architecture as a whole.

---

# 13. P8.1 gate review

## 1. Adds value beyond restating prose

**PASS.** The pilot separates pattern conformance from induced technical obligations and identifies concrete invalidation tests.

## 2. Maps mostly to existing semantic vocabulary

**PASS.** Six of seven require no new semantic primitive. `P-012` exposes one bounded candidate refinement.

## 3. Keeps architectural judgement outside machine proof

**PASS.** Proportionality, domestic character, visual integration and repose remain explicit `J` outputs.

## 4. Avoids pattern-specific compiler subsystems

**PASS.** All technical obligations derive from shared service/boundary/structure/maintenance graphs.

## 5. Produces useful mutation cases

**PASS.** Every pilot pattern has at least one mutation capable of changing model/conformance/evidence state.

## 6. Clarifies rather than duplicates the Reference House register

**PASS.** The Reference House register says *what the project currently claims*. This document says *how such a claim could be represented and tested computationally*.

### P8.1 decision

**PROVISIONAL PASS — advance to P8.2 red-team before applying the schema to the remaining 14 active patterns.**

The only open model question is whether `P-012` needs a new physical-identity artefact relation or can reuse generic physical component/information relationships cleanly.

---

# 14. Next

P8.2 should attack this pilot for:

- pattern-selection magic hidden in conformance checks;
- obligations that duplicate shared graph consequences;
- project-requirement authority accidentally replacing engineering/regulatory authority;
- diagnostics masquerading as pass/fail criteria;
- the necessity of the `P-012` semantic refinement;
- whether mutation tests can be expressed inside the planned minimal executable kernel or belong to later extension fixtures.