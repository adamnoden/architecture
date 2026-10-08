# Computational Doctrine Delta 01 — External Maintenance Geography

**Status:** post-H1 doctrine-sync audit; executable extension candidate, not a standing implementation task  
**Date:** 2026-10-05  
**Doctrine change:** commit `fa883693` — external maintenance geography  
**Paper compiler state:** H1-PAPER remains frozen; this document does not reopen the completed paper-compilation programme.  
**Executable state:** P0 and `PAT-XW-01` have since passed. External-maintenance semantics remain unexercised in software.

## 1. Question

The doctrine **Give maintenance a geography** extends beyond internal plant/service access to the exterior of the building.

Exterior maintenance must be understood as a task-specific spatial route involving, where relevant:

- site/service entrance;
- approach and material route;
- access method/equipment;
- support position and supporting ground/structure;
- setup / stabiliser / clearance volume;
- safe working position;
- target component;
- removed-component / waste / replacement route;
- façade/roof projections;
- courtyards and enclosed gardens;
- mature landscape;
- dependency on neighbouring land or highway occupation;
- as-built preservation of the designed maintenance geography.

Question:

> **Does the frozen computational model already cover this doctrine, and if not, what is actually missing?**

## 2. Verdict

**The compiler architecture substantially covers the concept, but H1 did not demonstrate the exterior case.**

No new fundamental graph is required.

The existing formal model already contains the core nouns needed to represent most of the doctrine:

- `Site`;
- `Plot / legal boundary`;
- `Ground condition`;
- `Courtyard`;
- `External space`;
- `Maintenance zone`;
- `Working volume`;
- `Withdrawal volume`;
- `Ground support condition`;
- `Maintenance task`;
- `Inspection task`;
- `Replacement sequence`;
- `Access path`;
- `Working position`;
- `Withdrawal path`;
- `Assumption`;
- `Change event`;
- obligations/evidence and dependency invalidation.

The model also already states the critical invariant:

> a maintenance task cannot claim accessibility without an access / working / withdrawal path appropriate to the task.

This is the correct conceptual foundation for the doctrine.

However, the H1 capability statement must be read narrowly: H1 demonstrated maintenance validity through **internal/service examples**, principally plant, riser, valve, service-route and component-withdrawal access. It did not exercise the exterior task chain.

Current status:

**EXTERNAL MAINTENANCE GEOGRAPHY = CONCEPTUALLY REPRESENTABLE / NOT YET SOFTWARE-DEMONSTRATED.**

## 3. Doctrine → computational mapping

| Doctrine requirement | Existing computational concept | Coverage |
|---|---|---|
| target façade/roof component | physical entity + maintenance task | STRONG |
| distinguish inspect / clean / repair / replace | MaintenanceTask / InspectionTask / ReplacementSequence | STRONG; role taxonomy needs formalisation |
| route from site/service entrance | Site + ExternalSpace + AccessPath | STRONG conceptually |
| route through gate/passage/courtyard | connected ExternalSpace / Courtyard + AccessPath | STRONG conceptually |
| equipment/access method | no explicit first-class access-method entity | **GAP** |
| support position | MaintenanceZone / WorkingPosition + GroundSupportCondition | PARTIAL; role needs sharpening |
| ground/structure support adequacy | GroundCondition + GroundSupportCondition + structural/evidence obligation | STRONG boundary; adequacy external |
| scaffold/tower/MEWP setup geometry | WorkingVolume / MaintenanceZone | PARTIAL; setup/clearance role needs sharpening |
| stabiliser/outrigger/swept clearance | geometric volume + collision query | PARTIAL; not yet exercised |
| façade projections / bays / porticos | building geometry + collision/clearance | CONCEPTUALLY STRONG; not exercised |
| full window/component withdrawal | ReplacementUnit + WithdrawalPath / WithdrawalVolume | STRONG conceptually |
| waste/material return route | AccessPath / WithdrawalPath roles | PARTIAL; role taxonomy needed |
| neighbour/highway dependency | Plot/legal boundary + path geometry + obligation | **PARTIAL GAP** — dependency/permission should become explicit |
| landscape/tree obstruction | ExternalSpace geometry + future scenario/assumption | **PARTIAL GAP** — no mature-landscape scenario demonstrated |
| as-built changes consume access | ChangeEvent + dependency invalidation | STRONG conceptually; not exercised externally |
| permanent anchor/tie creates own obligations | Interface + structural/boundary/evidence graph | STRONG |
| roof hatch is not sufficient by itself | AccessPath + WorkingPosition + onward route | STRONG conceptually |

## 4. Minimal semantic additions

Do **not** create a parallel exterior-maintenance ontology.

The smallest useful additions are:

### A. Access method as a first-class maintenance/process entity

Candidate entity:

**AccessMethod**

Examples:

- INTERNAL;
- GROUND_LEVEL;
- SCAFFOLD;
- TOWER;
- MEWP;
- LADDER;
- GUARDED_ROOF / TERRACE;
- SPECIALIST_TEMPORARY_WORKS.

The entity represents the selected method sufficiently to generate spatial/support obligations. It does **not** mean the house compiler designs future temporary works.

Candidate relationships:

- `MaintenanceTask performed-via AccessMethod`;
- `AccessMethod reaches-via AccessPath`;
- `AccessMethod bears-on MaintenanceZone / GroundSupportCondition`;
- `AccessMethod occupies WorkingVolume / setup volume`;
- `AccessMethod requires-clearance Volume`.

### B. Roles on existing maintenance spaces/paths

Prefer roles over new entity classes where possible:

- `APPROACH_PATH`;
- `MATERIAL_ROUTE`;
- `SUPPORT_ZONE`;
- `SETUP_CLEARANCE_VOLUME`;
- `WORKING_VOLUME`;
- `WITHDRAWAL_ROUTE`;
- `WASTE_ROUTE`.

One geometric route/zone may carry several roles.

### C. External-access dependency

A path crossing the project boundary must not silently count as guaranteed access.

Candidate relationship / obligation:

- `depends-on-external-access`;
- subject identifies neighbouring plot / highway / third-party land;
- status remains `UNRESOLVED` until the selected project stage supplies the relevant legal/procedural evidence or accepts the dependency explicitly.

The compiler should expose the dependency. It should not pretend to grant a licence or predict future consent.

### D. Maintenance scenario state

Exterior maintenance needs scenario-specific geometry.

At minimum support assumptions such as:

- mature landscape state;
- temporary removable planting state;
- selected access method;
- as-built levels / drainage / external plant positions.

A first implementation can treat these as explicit scenario facts/assumptions rather than inventing a horticultural growth simulator.

## 5. Obligations a future fixture should derive

Given:

- maintenance target;
- task type;
- selected access method;
- site/external geometry;

it should be possible to derive obligations such as:

1. **APPROACH** — method/equipment/materials can reach the support/setup position;
2. **SUPPORT** — a credible ground/structural support condition exists;
3. **SETUP** — required temporary setup/clearance volume exists;
4. **WORK** — credible working position/volume reaches the target;
5. **WITHDRAWAL** — removed/replacement component can traverse the route;
6. **BOUNDARY DEPENDENCY** — any reliance on third-party/highway land is explicit;
7. **INTERFACE DEBT** — permanent anchor/tie/roof-access hardware generates structural/weather/security/inspection obligations;
8. **PRESERVATION** — later landscape/external-works changes invalidate access evidence when they consume a depended-on zone.

These are maintenance obligations on the shared building/site model, not a separate compliance checklist.

## 6. What remains external / should not be faked

The compiler should **not** claim to prove:

- scaffold engineering;
- MEWP outrigger loads;
- actual temporary-works design;
- ground bearing capacity without evidence;
- suitability of a ladder for an unspecified future task;
- future neighbour consent;
- highway licence availability;
- contractor means and methods;
- exact mature tree geometry without an authored scenario;
- safe work-at-height method merely from collision-free geometry.

It may prove or flag architectural preconditions and generate scoped external evidence obligations.

## 7. Evidence-selected executable fixture

P0 has now demonstrated the minimal identity / relationship / obligation / evidence mechanism. That makes an exterior-maintenance fixture technically eligible; it does not make it automatically next.

`EXT-MAINT-01` should run only when Reference House coordination, physical work or professional review exposes a live question that the fixture can answer better than drawings and direct review.

Suggested fixture:

**EXT-MAINT-01 — two-storey façade + bay/portico + side route + courtyard**

Baseline should contain:

- one upper masonry façade repair task;
- one upper-window full replacement task;
- one gutter/eaves task;
- site/service entrance;
- side passage;
- courtyard;
- one ground-supported access method;
- support/setup zone;
- one projection;
- one removable landscape assumption;
- no third-party land dependency in baseline.

Mutations:

1. enlarge bay/portico into setup/working clearance;
2. narrow side gate below selected equipment/replacement-unit route;
3. move drain/lightwell into sole support zone;
4. add mature tree/planter to sole route;
5. move required route across neighbour land;
6. move external plant into support/setup zone;
7. retain worker route but block full-window withdrawal;
8. add permanent anchor and verify new boundary/structural/inspection obligations rather than free PASS.

Desired result:

- maintenance validity can fail independently of ordinary occupation;
- access-method geometry can invalidate only dependent maintenance tasks;
- neighbour/highway dependency becomes explicit rather than invisible;
- support adequacy can remain externally unresolved while spatial suitability is internally checked;
- no new discipline-specific source model is authored.

## 8. Effect on H1 claims

The H1 paper run remains valid historical research.

But the phrase:

> **maintenance / replacement — demonstrated internally**

must be interpreted as:

> **maintenance / replacement validity demonstrated internally for the H1 internal/service cases exercised. Exterior maintenance geography is strengthened doctrine and has not yet been demonstrated by the compiler.**

Do not retroactively claim that H1 tested exterior scaffold/site logistics.

## 9. Programme consequence

### Reopen the paper compiler programme?

**NO.**

The doctrine does not expose a missing fundamental abstraction. It lands naturally in the existing maintenance + spatial + structural + evidence graphs.

### Reopen generic P0/crosswalk growth?

**NO.**

P0 and `PAT-XW-01` have passed and generic growth remains frozen.

### Is `EXT-MAINT-01` authorised as a standing next task?

**NO.**

It is an evidence-selected candidate fixture. Run it only when a real unresolved architectural, physical or professional-review question justifies the implementation cost.

### Overall compiler-coverage verdict

**SEMANTIC ARCHITECTURE: PASS**  
**H1 DEMONSTRATION COVERAGE: PARTIAL**  
**EXTERNAL-MAINTENANCE SOFTWARE DEMONSTRATION: OPEN**

This doctrine delta remains useful as a computational boundary test. It is not a reason to abandon, substantially redesign or automatically extend the compiler model.