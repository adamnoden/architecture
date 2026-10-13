# Reference House Executable Slice

**Status:** **PASS through RH-C3 — deterministic architecture + bounded structural and service topology**  
**Date:** 2026-10-13  
**Prerequisite:** [RH-C0 — Reference House Model Freeze](reference-house-model-freeze-rhc0.md) — **PASS**  
**Canonical fixture source:** [`../reference-house/model-baseline-rhc0.md`](../reference-house/model-baseline-rhc0.md)  
**Structural authority:** [`../reference-house/structural-coordination.md`](../reference-house/structural-coordination.md)  
**Service authority:** [`../reference-house/service-topology-rh06.md`](../reference-house/service-topology-rh06.md), [`../reference-house/service-topology-rh07-mvhr-addendum.md`](../reference-house/service-topology-rh07-mvhr-addendum.md), [`../reference-house/service-crossing-register-rh06.md`](../reference-house/service-crossing-register-rh06.md), [`../reference-house/energy-heat-coordination-rh10.md`](../reference-house/energy-heat-coordination-rh10.md)  
**Implementation:** `compiler/reference-house/`, `compiler/plan-slice/`, `compiler/structure-slice/`, `compiler/service-slice/`, `compiler/rhc2/`, `compiler/rhc3/`  
**Drawing parity result:** [`../reference-house/rhc1-drawing-parity-result.md`](../reference-house/rhc1-drawing-parity-result.md)  
**Generality gate:** [`compiler-generality-assurance-cf01.md`](compiler-generality-assurance-cf01.md) — **PASS**

## Current result

The executable Reference House programme has now passed four successive questions.

```text
RH-C1  Can one frozen Reference House be reproduced deterministically?     PASS
CF-01  Is the shared plan layer more than a Reference-House-shaped script? PASS
RH-C2  Can RH-05 structural topology be represented and falsified?         PASS
RH-C3  Can RH-06/RH-07/RH-10 service topology be represented and falsified? PASS
```

Current executable suites:

```text
P0                         17 / 17 PASS
PAT-XW-01                   6 /  6 PASS
RH-C1                      27 / 27 PASS
CF-01                       7 /  7 PASS
RH-C2                      17 / 17 PASS
RH-C3                      21 / 21 PASS
```

The current deterministic projections are:

- `docs/reference-house/rhc1-ground-floor.svg`;
- `docs/reference-house/rhc1-first-floor.svg`;
- `docs/reference-house/rhc1-principal-section.svg`;
- `docs/reference-house/rhc2-structural-topology.svg`;
- `docs/reference-house/rhc3-service-topology.svg`.

The RH-C3 SVG is deliberately **non-spatial**. It projects network identity, semantic route continuity and registered crossings; it does not manufacture exact pipe, cable or duct coordinates that the source authority does not control.

---

## RH-C1 — deterministic architectural fixture

RH-C1 proved that one canonical semantic source can reproduce the bounded Reference House geometry, simple derived calculations and three controlled drawings without parallel authored geometry.

The source covers only geometry released by RH-C0 as `FROZEN_FOR_RH_C1` or deliberately `PROVISIONAL_BUT_REPRESENTABLE`:

- outer shell and courtyard;
- storey levels / principal datums;
- rooms and circulation spaces;
- stair arithmetic;
- major walls / semantic boundaries;
- major openings;
- principal architectural axes / bay centres.

Derived views include shell/courtyard/plate area, room reservations, stair rise/pitch/`2R+G`, boundary lengths, legitimate opening dimensions/areas, provisional wall-planning stress views and the narrow roof screening relation used by the section.

Stable semantic identity survives projection. Drawings do not become architectural authority merely because they compile.

### RH-C1 invariants

RH-C1 checks that:

- rooms remain inside the permitted enclosed field and outside the courtyard;
- incompatible room reservations do not overlap;
- openings belong to their declared host boundary and semantic host space;
- controlled axes and opening centres derive from the same source used by drawings;
- levels and stair consequences remain coordinated;
- authored stair groups cannot silently mutate into another topology;
- repeated compilation is deterministic;
- committed SVGs are exact renderer outputs.

Its mutation suite distinguishes propagation, explicit failure, architectural review and deliberate absence rather than auto-repairing the architecture.

RH-C1 therefore establishes **fixture fidelity + dependency correctness**, not generality or technical adequacy.

---

## CF-01 — bounded plan generality

CF-01 challenged the actual RH-C1 implementation with a deliberately unlike domestic fixture: single-storey, asymmetric, no courtyard, no stair, no regular bay field, no entrance-bay membership and irregular opening coordinates.

The exercise extracted the reusable plan-semantic mechanisms into `compiler/plan-slice/`:

- dynamic levels;
- orthogonal named planning lines;
- spaces and optional voids;
- boundaries;
- openings and host relationships;
- required adjacency;
- plate closure;
- deterministic semantic plan projection.

Reference-House-specific courtyard centring, bay composition, stair, wall-planning and roof logic remain local to the Reference House compiler/adapter.

CF-01 is **two-fixture bounded evidence**, not arbitrary architecture support. The shared plan slice still deliberately supports rectangular shells, orthogonal named planning lines, axis-aligned rectangular region unions and line-hosted openings.

---

## RH-C2 — bounded structural topology

RH-C2 reproduces the structural concept coordinated in RH-05 without pretending to perform structural engineering analysis.

```text
STRUCTURAL TOPOLOGY       MACHINE-CHECKED
STRUCTURAL ADEQUACY       EXTERNAL — NOT PROVED
```

### Gross floor fields

The structural view derives four RH-05 first-floor fields directly from the architectural planning lines:

| Field | Span direction | Gross span |
|---|---|---:|
| `F-W` | east / west | 4,200 mm |
| `F-E` | east / west | 4,200 mm |
| `F-S` | north / south | 3,400 mm |
| `F-N` | north / south | 3,400 mm |

Their gross areas close to the same **115.2 m²** first-floor plate used by the architectural model.

### Support and gravity topology

RH-C2 represents:

- outer and courtyard bearing lines;
- four short edge beams: `EB-W-S`, `EB-E-S`, `EB-W-N`, `EB-E-N`;
- continuous support paths assembled from bearing/beam segments;
- four protected courtyard reaction nodes;
- the structural deck as the declared diaphragm layer;
- a qualitative `FDN-SITE-DESIGNED` foundation destination.

The compiler can reject missing support segments, misaligned beams, false span supports, broken reaction-node geometry, unclosed structural fields and represented gravity paths that no longer reach a declared foundation destination.

`FDN-SITE-DESIGNED` is not a selected foundation system. It is an explicit handoff to later site-specific foundation engineering.

### Openings and interruptions

RH-C2 does not allow a continuous bearing-line abstraction to make architectural openings disappear. Every numeric opening already present on a mapped bearing boundary derives an explicit:

```text
EXTERNAL-HEAD-SUPPORT-AND-BEARING
```

The canonical Reference House currently derives **12** such obligations. This records the consequence without inventing lintel sizes, residual-pier capacities or end-bearing adequacy.

Two first-floor structural interruptions are carried without false precision:

- `ST-01` — stair opening; local trimming required, exact geometry absent;
- `PEN-SV-01` — service opening; approximately **1,050 × 850 mm** structural envelope, with exact position/final engineered trimming external.

Changeable floor finishes remain explicitly non-structural; the structural deck owns the diaphragm role.

### RH-C2 invariants

RH-C2 checks support continuity, span/support geometry, field closure, reaction-node coincidence, foundation handoff, bearing-boundary mappings, interruption ownership, diaphragm accounting and propagation of upstream `REVIEW`/`FAIL` state. Its mutation suite deliberately breaks each of those relationships. The structural renderer refuses failed topology, and its committed SVG is an exact deterministic renderer output.

---

## RH-C3 — bounded service topology

RH-C3 compiles only the service relationships already coordinated through RH-06, RH-07 and RH-10.

Its proof boundary is equally explicit:

```text
SERVICE TOPOLOGY          MACHINE-CHECKED
MEP PERFORMANCE / DETAIL  EXTERNAL — NOT PROVED
```

### Represented service systems

The current Reference House fixture contains **13 semantic networks** covering:

- water, electricity and communications utility entry;
- domestic-water distribution;
- foul / soil / vent topology;
- dry electrical/data distribution;
- low-temperature hydronic distribution;
- MVHR supply;
- MVHR extract;
- MVHR outdoor-air / exhaust-air boundary routes;
- separate cooker source capture;
- ASHP connection;
- PV electrical route.

These are Reference House fixture decisions. They are not promoted into House Kernel doctrine or requirements of the generic service-topology kernel.

### Service geography and access

C3 makes the controlled service geography explicit rather than inferring exact runs:

- `G-PLANT-01` remains the plant / isolation / distribution hub;
- `SV-01` remains the shared vertical service zone;
- ground and upper dry/hydronic/MVHR distribution hubs retain their coordinated host-space geography;
- principal rooms are protected from **primary** service infrastructure while local terminal branches remain permitted;
- plant working/replacement/isolation access, MVHR working/replacement/filter access, riser inspection and foul-stack-base inspection are explicit obligations.

The service graph therefore cannot silently become connected by routing primary infrastructure through a protected principal room or by deleting required maintenance geography.

### Vertical service reservation

The RH-06/RH-07 controlled `SV-01` clear reservation is approximately **900 × 700 mm**. RH-C3 ties that reservation to the RH-C2 structural interruption `PEN-SV-01`, whose current coordination envelope is approximately **1,050 × 850 mm**.

The compiler checks only the gross envelope relation:

```text
900 × 700 service reservation
    fits within
1050 × 850 structural opening envelope
```

That is **not** proof that the selected ducts, pipes, cables, insulation, fire stopping, supports and access clearances actually pack successfully. Detailed packing remains an external MEP/fire/acoustic coordination task.

Six selected vertical service classes currently use the shared structural crossing:

- domestic water;
- foul stack;
- electrical/data;
- hydronic;
- MVHR supply;
- MVHR extract.

Removing the structural crossing from one of those trunks fails the compile.

### Controlled crossings

RH-C3 carries the selected RH crossing register needed by its scope:

- `PEN-UE-01` — grouped utility-entry **crossing family**;
- `PEN-SV-01` — shared vertical structural service opening;
- `PEN-FD-01` — foul drainage exit;
- `PEN-KX-01` — cooker extract;
- `PEN-HS-01` — ASHP service link;
- `PEN-MV-01` — MVHR outdoor/exhaust-air **crossing family**;
- `PEN-SV-RF-01` — soil/vent roof termination;
- `PEN-PV-01` — PV electrical boundary route.

`PEN-BX-01`, the former direct bathroom extract route, is retained explicitly as an **unselected fallback** after the RH-07 MVHR decision. An active route cannot silently start using it.

`PEN-UE-01` and `PEN-MV-01` are semantic crossing families. Their use by several routes does not assert one literal multi-service hole or one physical duct opening.

`PEN-CD-01` is deliberately outside C3: courtyard rainwater coordination belongs to the RH-08 / envelope-boundary work rather than the RH-06/RH-07/RH-10 service slice.

### Bearing-wall consequences

A service crossing through an architectural outer boundary cannot disappear behind the structural model. The compiler geometrically checks selected plan-boundary crossings against represented bearing lines. Four selected east-wall crossing families currently derive:

```text
EXTERNAL-STRUCTURAL-OPENING-AND-BEARING
```

for `PEN-UE-01`, `PEN-KX-01`, `PEN-HS-01` and `PEN-MV-01`, each resolving to `LB-OUTER-E`.

This does not invent hole sizes, lintels, residual-pier capacities or bearing checks. It records that those structural consequences must be discharged externally.

### RH-C3 invariants and mutation evidence

RH-C3 checks that:

- service, plan and structural fixtures correspond;
- semantic service IDs are unique;
- required network nodes remain connected through declared routes;
- routes and networks agree about ownership/service class;
- route endpoints and host spaces exist;
- primary infrastructure stays out of protected principal-room geography;
- required maintenance/replacement/isolation/filter/inspection access remains declared;
- a boundary-link route cannot cross fabric anonymously;
- route/crossing ownership is reciprocal;
- active topology cannot use an unselected fallback crossing;
- vertical trunks declaring structural interaction resolve a real structural interruption;
- selected plan-boundary crossings resolve real architectural boundaries;
- crossing families carry explicit downstream obligations;
- the `SV-01` clear reservation does not exceed the represented structural opening envelope;
- selected service crossings through represented bearing walls derive external structural-opening/bearing obligations;
- upstream architectural/structural `REVIEW` or `FAIL` state cannot be erased by a coherent service graph;
- unchanged input and the committed topology SVG remain deterministic.

The mutation suite breaks network continuity, structural-crossing ownership, protected-room geography, fallback state, access obligations, crossing reciprocity, boundary identity, riser fit and bearing-line identity. All fail closed at the intended boundary.

### What RH-C3 does not prove

C3 deliberately does **not** calculate or certify:

- actual service packing inside `SV-01`;
- pipe, duct or cable sizes;
- airflow, pressure loss or fan duty;
- hydraulic pressure loss or pump duty;
- heat loss, emitter sizing or ASHP capacity;
- cable sizing, fault protection or electrical design;
- drainage falls, invert levels or self-cleansing performance;
- fire-stopping or compartmentation adequacy;
- acoustic breakout/crosstalk performance;
- condensation risk at penetrations or ducts;
- product suitability/compliance;
- commissioning or balancing;
- exact branch coordinates where source authority remains qualitative.

Those questions remain external until a later, explicitly bounded proof family earns authority.

---

## Calculation and evidence boundary

The programme retains three broad discharge modes:

1. **deterministic calculation** — geometry/arithmetic or another method whose authority is explicit;
2. **supported implementation/rule family** — only after a bounded family and competent method are established;
3. **external evidence** — engineer, MEP specialist, building-physics model, fire/building-control determination, product evidence or physical test.

Representability is not adequacy. Passing C2 says the represented structural graph is coherent; passing C3 says the represented service graph is coherent. Neither says the physical system is adequate.

---

## Programme sequence

```text
RH-C0 — model freeze                    PASS
  ↓
RH-C1 — deterministic Reference House  PASS
  ↓
CF-01 — adversarial contrast fixture   PASS
  ↓
RH-C2 — bounded structural view        PASS
  ↓
RH-C3 — bounded service view           PASS
  ↓
RH-C4 — envelope / boundary view       NEXT
```

### RH-C4 — envelope / boundary view

**NEXT.** Add only the external/courtyard wall family geometry, openings and air/thermal/weather/moisture boundary relationships needed to reproduce the already-coordinated envelope and junction obligations. Do not infer building-physics performance merely because boundary continuity can be represented.

### RH-C5 — selected target calculations

Only then consider narrow, versioned target checks where the rule and proof boundary are clear. Avoid a monolithic `isBuildingRegulationsCompliant()` abstraction.

These labels are sequencing aids, not maturity levels.

---

## Explicit non-goals

The executable programme does not presently justify:

- arbitrary architecture support;
- a polished 3D modelling UI;
- general BIM replacement;
- generative design;
- a universal structural or MEP solver;
- a complete Building Regulations engine;
- encoding architectural quality as a boolean;
- rebuilding external specialist software inside House Kernel without a strong case.

The current result is stronger but still bounded: **deterministic architectural fixture + two-fixture plan evidence + internally coherent structural topology + internally coherent service topology**. Competent structural/MEP review, detailed design, product selection and site-specific engineering remain external requirements.