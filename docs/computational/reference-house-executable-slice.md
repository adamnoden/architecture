# Reference House Executable Slice

**Status:** **PASS through RH-C2 — deterministic architecture + bounded structural topology**  
**Date:** 2026-10-13  
**Prerequisite:** [RH-C0 — Reference House Model Freeze](reference-house-model-freeze-rhc0.md) — **PASS**  
**Canonical fixture source:** [`../reference-house/model-baseline-rhc0.md`](../reference-house/model-baseline-rhc0.md)  
**Architectural structural authority:** [`../reference-house/structural-coordination.md`](../reference-house/structural-coordination.md)  
**Implementation:** `compiler/reference-house/`, `compiler/plan-slice/`, `compiler/structure-slice/`, `compiler/rhc2/`  
**Drawing parity result:** [`../reference-house/rhc1-drawing-parity-result.md`](../reference-house/rhc1-drawing-parity-result.md)  
**Generality gate:** [`compiler-generality-assurance-cf01.md`](compiler-generality-assurance-cf01.md) — **PASS**

## Current result

The executable Reference House programme has now passed three successive questions.

```text
RH-C1  Can one frozen Reference House be reproduced deterministically?     PASS
CF-01  Is the shared plan layer more than a Reference-House-shaped script? PASS
RH-C2  Can RH-05 structural topology be represented and falsified?         PASS
```

RH-C1 still passes **27/27 tests**. CF-01 passes **7/7**. RH-C2 adds **17/17** structural-topology tests while preserving the earlier suites.

The current deterministic projections are:

- `docs/reference-house/rhc1-ground-floor.svg`;
- `docs/reference-house/rhc1-first-floor.svg`;
- `docs/reference-house/rhc1-principal-section.svg`;
- `docs/reference-house/rhc2-structural-topology.svg`.

The first three are architectural projections. The RH-C2 drawing is a structural-topology projection, not an engineer's structural drawing and not evidence of structural adequacy.

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

RH-C2 now reproduces the structural concept already coordinated in RH-05 without pretending to perform structural engineering analysis.

The proof boundary is explicit:

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

- outer bearing lines;
- courtyard bearing lines;
- four short edge beams: `EB-W-S`, `EB-E-S`, `EB-W-N`, `EB-E-N`;
- continuous support paths assembled from bearing/beam segments;
- four protected courtyard reaction nodes;
- the structural deck as the declared diaphragm layer;
- a qualitative `FDN-SITE-DESIGNED` foundation destination.

The compiler can therefore reject missing support segments, misaligned beams, false span supports, broken reaction-node geometry, unclosed structural fields and represented gravity paths that no longer reach a declared foundation destination.

`FDN-SITE-DESIGNED` is not a selected foundation system. It means only that the represented load path has an explicit handoff to later site-specific foundation engineering.

### Openings and interruptions

RH-C2 does not allow a continuous bearing-line abstraction to make architectural openings disappear.

Architectural bearing boundaries are mapped to their structural bearing lines. Every **numeric** opening already present on those boundaries derives an explicit structural obligation. The canonical Reference House currently derives **12** such obligations, each marked:

```text
EXTERNAL-HEAD-SUPPORT-AND-BEARING
```

This records the consequence without inventing lintel sizes, residual-pier capacities or end-bearing adequacy.

Openings whose architectural geometry remains qualitative remain qualitative. The compiler does not manufacture east/west courtyard centres or north/garden opening geometry to make the structural view complete.

Two first-floor structural interruptions are also carried without false precision:

- `ST-01` — stair opening; a local trimmer system is required, but exact trimming geometry remains absent;
- `PEN-SV-01` — service opening; approximately **1,050 × 850 mm** structural envelope, with exact position/final engineered trimming still external.

Changeable floor finishes remain explicitly non-structural; the structural deck owns the diaphragm role.

### RH-C2 invariants

RH-C2 checks that:

- the structural fixture is compiled against the intended architectural fixture;
- structural IDs are unique;
- bearing lines declare a foundation destination;
- support paths reference real, collinear and continuous structural segments;
- edge beams terminate on declared endpoint supports;
- span fields stay inside the shell and outside architectural voids;
- support paths oppose the declared span direction and bound the field they support;
- supports cover the full cross-width of their field;
- gross structural fields do not overlap and close to architectural plate area;
- represented gravity paths terminate at a declared foundation destination;
- reaction nodes lie on every structural element they reference;
- architectural bearing boundaries geometrically match their mapped structural bearing lines;
- known structural interruptions have declared local framing systems;
- the structural-deck diaphragm accounts for all gross fields and known interruptions;
- an upstream Reference House `REVIEW` or `FAIL` cannot be erased by a structurally coherent projection.

The structural renderer refuses a failed topology, and the committed structural SVG is checked as an exact deterministic projection.

### Mutation evidence

The RH-C2 suite verifies that:

- courtyard-width changes propagate into span lengths and edge-beam positions;
- an RH-C1 stair-fit `REVIEW` survives as the overall result even when structural topology still passes;
- deleting an edge-beam segment exposes a support-path gap;
- moving a beam off its support line exposes path/reaction inconsistency;
- deleting a bearing line's foundation destination breaks represented gravity continuity;
- mapping an architectural bearing boundary to the wrong structural line fails;
- assigning a field to supports that do not bound it fails;
- deleting a required local trimmer fails;
- silently dropping a field from the diaphragm fails;
- unchanged input remains deterministic.

---

## Calculation and evidence boundary

The programme retains three broad discharge modes:

1. **deterministic calculation** — geometry/arithmetic or another method whose authority is explicit;
2. **supported implementation/rule family** — only after a bounded family and competent method are established;
3. **external evidence** — engineer, building-physics model, fire/building-control determination, product evidence or physical test.

RH-C2 is deliberately a topology implementation under that boundary. It does **not** contain or prove:

- engineered joist or beam sections;
- timber strength classes;
- loads or load combinations;
- connection design/capacity;
- deflection or vibration adequacy;
- lintel or residual-pier adequacy;
- global lateral stability or robustness;
- fire resistance;
- exact stair trimmer geometry;
- exact service-opening position;
- roof structural adequacy;
- foundation adequacy;
- ULS / SLS compliance;
- Building Regulations structural compliance.

Representability is not adequacy. If a native structural proof family is ever added, it will need its own explicit analytical model, proof envelope, validation and authority.

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
RH-C3 — bounded service view           NEXT
```

### RH-C3 — service view

**NEXT.** Add only the plant, riser, route, penetration and controlled-crossing topology needed to reproduce the already-coordinated RH-06/RH-07/RH-10 service relationships. Route coherence may be machine-checked; MEP sizing, hydraulic/aerodynamic performance, acoustic performance, fire-stopping adequacy and product compliance remain outside the proof boundary unless separately earned.

### RH-C4 — envelope / boundary view

Add external/courtyard wall family geometry, openings and air/thermal/weather boundary relationships needed for coordinated junction obligations.

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
- a universal structural solver;
- a complete Building Regulations engine;
- encoding architectural quality as a boolean;
- rebuilding external specialist software inside House Kernel without a strong case.

The current result is stronger but still bounded: **deterministic architectural fixture + two-fixture plan evidence + internally coherent structural topology**. Competent structural review and site-specific engineering remain external requirements.
