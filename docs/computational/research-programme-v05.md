# Executable Architecture — Research Programme v0.5

**Status:** current programme-control delta — doctrine sync after H1 freeze  
**Date:** 2026-10-05  
**Inherits:** [v0.4](research-programme-v04.md) in full; all v0.4 stop rules, external-review tasks and implementation gates remain in force.  
**Paper phase:** frozen  
**Implementation:** minimal falsification kernel first; doctrine-driven extension fixtures only after the kernel proves itself.

## 1. Why v0.5 exists

After the H1 paper freeze, the architectural doctrine was materially extended by the external-maintenance-geography work in commit `fa883693`.

The change adds task-specific exterior maintenance obligations involving:

- site approach/logistics;
- ground/support positions;
- setup and working volumes;
- façade/roof projections;
- courtyards;
- replacement-unit routes;
- landscape;
- neighbour/highway dependencies;
- as-built preservation of maintenance capability.

The computational audit is:

[Computational Doctrine Delta 01 — External Maintenance Geography](doctrine-delta-external-maintenance-v01.md)

## 2. Audit result

The new doctrine does **not** expose a missing fundamental compiler abstraction.

The existing formal model already contains the important substrate:

- Site / Plot / legal boundary;
- Ground condition / Ground support condition;
- ExternalSpace / Courtyard;
- MaintenanceZone / WorkingVolume / WithdrawalVolume;
- MaintenanceTask / InspectionTask / ReplacementSequence;
- AccessPath / WorkingPosition / WithdrawalPath;
- Assumption / ChangeEvent;
- obligation/evidence/dependency graphs.

Therefore:

**SEMANTIC ARCHITECTURE: PASS.**

However, H1-PAPER did not exercise exterior scaffold/site logistics. Its maintenance demonstration covered internal/service cases.

Therefore:

**EXTERNAL MAINTENANCE DEMONSTRATION: OPEN.**

## 3. Minimal semantic refinement authorised

When implementation reaches the maintenance graph, the following refinements are authorised without reopening paper architecture:

1. first-class `AccessMethod` or equivalent maintenance-process concept;
2. roles on paths/zones/volumes for approach, material route, support, setup clearance, working and withdrawal;
3. explicit third-party/highway access dependency obligation;
4. scenario facts/assumptions for mature landscape and as-built external conditions.

These should be expressed through the existing shared graphs rather than a parallel façade-maintenance ontology.

## 4. Grand TODO additions

| ID | TODO | Current status |
|---|---|---|
| C-045 | External maintenance geography compiler coverage audit | **COMPLETE — doctrine delta recorded** |
| C-046 | Formalise minimal AccessMethod + exterior maintenance roles during implementation | **OPEN — not P0 blocker** |
| C-047 | EXT-MAINT-01 executable exterior maintenance fixture | **OPEN — post-kernel extension test** |
| C-048 | Explicit neighbour/highway access dependency semantics | **OPEN — may be delivered with C-047** |
| C-049 | Mature-landscape/as-built maintenance scenario invalidation test | **OPEN — may be delivered with C-047** |

All v0.4 TODOs remain inherited.

## 5. EXT-MAINT-01 — authorised implementation extension fixture

Run only after the minimal compiler kernel has demonstrated identity, deterministic geometry/well-formedness, obligation generation, evidence scope and selective invalidation.

Suggested baseline:

- two-storey façade;
- one bay/portico projection;
- side route into courtyard;
- site/service entrance;
- one upper masonry repair task;
- one upper-window full replacement task;
- one gutter/eaves task;
- selected ground-supported access method;
- support/setup/working volumes;
- withdrawal route;
- explicit landscape assumption.

Required mutations should include:

- projection blocks ordinary setup geometry;
- gate blocks equipment or replacement unit;
- drain/lightwell blocks sole support position;
- mature landscape blocks sole route;
- route crosses neighbour/highway land;
- external plant consumes support/setup zone;
- worker can reach target but replacement unit cannot be withdrawn;
- permanent anchor introduces new structural/boundary/inspection obligations.

## 6. Proof boundary

The compiler may establish architectural/spatial preconditions and generate evidence obligations.

It must not pretend to engineer:

- scaffold temporary works;
- MEWP support/outrigger design;
- actual ground bearing capacity without evidence;
- future neighbour consent;
- highway occupation permission;
- unspecified contractor methods;
- safe work-at-height merely from geometric clearance.

## 7. Programme effect

### Major paper research

**REMAINS STOPPED.**

### First executable kernel

**SCOPE UNCHANGED.**

Do not burden P0 with exterior-maintenance modelling before the central compiler mechanism works.

### Post-kernel extension sequence

External maintenance geography is now a high-value early extension because it tests:

- empty-but-functional space;
- site context;
- temporary future methods;
- cross-boundary dependency;
- scenario/change invalidation;
- maintenance validity independent of ordinary occupancy.

## 8. Current rule for future doctrine changes

After the paper freeze, a material doctrine addition should receive a **doctrine-delta computational audit** before the compiler is claimed to cover it.

The audit should classify the addition as one of:

- already represented and demonstrated;
- represented but not demonstrated;
- requires small semantic refinement;
- requires new supported family/fixture;
- exposes a fundamental compiler-model problem.

Do not silently allow the doctrine and compiler to drift apart.
