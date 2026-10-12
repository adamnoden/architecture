# Reference House Executable Slice

**Status:** **READY — RH-C0 passed; RH-C1 may begin**  
**Date:** 2026-10-12  
**Prerequisite:** [RH-C0 — Reference House Model Freeze](reference-house-model-freeze-rhc0.md) — **PASS**  
**Canonical fixture source:** [`../reference-house/model-baseline-rhc0.md`](../reference-house/model-baseline-rhc0.md)  
**Trigger:** RH-00→RH-11 produced an M3 coordinated Reference House; RH-C0 has now frozen the bounded architectural fixture needed for deterministic implementation.

## Why this reopens executable work

P0 and `PAT-XW-01` deliberately froze generic compiler growth until another workstream exposed a concrete, high-value question. The Reference House has now done so.

The problem is no longer abstract compiler capability. It is specific and falsifiable:

> **Can one canonical semantic source reproduce the controlled Reference House geometry, its simple derived calculations and a small set of architectural drawings deterministically?**

The Reference House is the **controlled regression fixture** for this executable slice. It is not assumed to be a universally correct house. RH-C0 established that its current architectural facts are internally coherent enough to freeze at the bounded fixture scope while preserving provisional and out-of-scope uncertainty.

The compiler is not asked to generate a better house yet. It must first reproduce the house already coordinated and hardened manually.

This is a vertical slice through the existing computational architecture, not a restart of a general CAD/compiler programme.

---

## RH-C1 — minimum executable slice

Encode only the geometry released by RH-C0 as `FROZEN_FOR_RH_C1` or deliberately `PROVISIONAL_BUT_REPRESENTABLE`:

- outer shell;
- courtyard;
- storey levels / principal vertical datums;
- rooms and circulation spaces;
- stair;
- major walls;
- major openings;
- principal architectural axes / bay centres.

Do **not** begin with structure, MEP, arbitrary 3D solids, products, optimisation or a general regulations engine.

### Canonical source

The Reference House must have one machine-readable source of geometric facts. Drawings and derived calculations consume that source; they do not duplicate it.

The only source contract for RH-C1 is [`model-baseline-rhc0.md`](../reference-house/model-baseline-rhc0.md). Representative values in this document are explanatory only; if this document and the RH-C0 baseline ever differ, the baseline wins.

Stable semantic identity must survive every projection. A window, wall or room shown in a drawing is the same project entity used by calculations, obligations and later evidence.

---

## Derived calculation layer

Create small deterministic functions only where the authority is clear. Examples:

- shell / courtyard / enclosed plate area;
- room and wing clear dimensions;
- stair rise, pitch and `2R+G`;
- wall / opening length and area;
- opening centre and clear dimensions;
- roof/courtyard catchment geometry where later added;
- route length / clearance geometry where later added;
- simple solar geometry where later justified.

These are not a miscellaneous calculator collection. They are derived views over canonical source entities.

Prefer small pure functions with explicit units and tests. Do not encode professional judgement as a numerical helper merely because it is convenient.

---

## Deterministic drawing output

The first production outputs are deliberately narrow:

1. ground-floor plan;
2. first-floor plan;
3. principal section.

SVG is an appropriate first target because it is text, diffable, web-native and already used by the project.

The renderer is **not** a CAD authoring system. It is a deterministic projection of the semantic model.

Each rendered group should retain semantic identity where practical, for example:

```xml
<g data-entity="WALL-W17">…</g>
<g data-entity="OW-01">…</g>
```

The drawing engine should separate:

- model/world coordinates;
- projection/view logic;
- drawing conventions such as line weight, hatching, labels and dimensions.

A change to a canonical dimension must propagate to every drawing that consumes it.

### Parity gate

The generated drawings do not become authoritative merely because they compile.

RH-C1 passes only when the generated plans/section reproduce the RH-C0 controlled fixture closely enough that the equivalent hand-authored geometric drawings can be retired or clearly marked historical.

The test is not visual resemblance alone. Geometry and semantic identity must match the controlled Reference House facts.

The RH-C0 visual comparators are:

- `docs/reference-house/rhc0-ground-floor-comparator.svg`;
- `docs/reference-house/rhc0-first-floor-comparator.svg`;
- `docs/reference-house/rhc0-principal-section-comparator.svg`.

They are comparison projections, not source geometry.

---

## Initial executable invariants

At minimum, test that:

- shell and courtyard dimensions match the controlled source;
- rooms lie inside the permitted enclosed field;
- rooms do not occupy the courtyard unless explicitly typed as court/external space;
- required room geometry does not overlap incompatibly;
- openings belong to their declared host wall;
- controlled axes and opening centres are derived from the same source facts used by the drawing;
- first-floor and ceiling datums are consistent in plan/section projections;
- stair rise is derived from FFL and riser count rather than separately authored;
- repeated compilation of a frozen source produces identical semantic and drawing output.

Mutation tests should use the dependency expectations recorded by RH-C0 and deliberately change source facts to verify that dependent calculations and drawings change together.

---

## Calculation and evidence boundary

Do not respond to every technical question by writing another pure function.

Use three broad discharge modes:

1. **deterministic calculation** — geometry/arithmetic or another method whose authority is explicit;
2. **supported implementation/rule family** — only after a bounded family and competent method are established;
3. **external evidence** — engineer, building-physics model, fire/building-control determination, product evidence or physical test.

The existing P0 evidence/staleness mechanism should remain central. If an external overheating result depends on glazing/orientation, for example, changing those source facts should mark that evidence stale rather than pretending the compiler can replace the simulation.

Structural, fire, acoustic, hygrothermal, daylight and dynamic-overheating calculations remain external unless and until a deliberately bounded native implementation earns authority.

---

## Growth sequence after RH-C1

Grow only when the Reference House creates a real need.

### RH-C2 — structural view

Add supports, spans, edge beams, protected nodes and load-path semantics needed to reproduce RH-05 coordination. This is not a general structural solver.

### RH-C3 — service view

Add plant, riser, routes, penetrations and controlled crossings needed to reproduce RH-06/RH-07/RH-10 service topology.

### RH-C4 — envelope / boundary view

Add external/courtyard wall family geometry, openings and air/thermal/weather boundary relationships needed for coordinated junction obligations.

### RH-C5 — selected target calculations

Only then consider narrow, versioned England-target checks where the rule and proof boundary are clear—for example stair geometry, escape-opening geometry or selected ventilation obligations. Avoid a monolithic `isBuildingRegulationsCompliant()` abstraction.

These labels are sequencing aids, not new maturity levels.

---

## Explicit non-goals

Do not use this fixture as justification for:

- arbitrary architecture support;
- a polished 3D modelling UI;
- general BIM replacement;
- generative design;
- a universal structural solver;
- a complete Building Regulations engine;
- encoding architectural quality as a boolean;
- rebuilding external specialist software inside House Kernel without a strong case.

The source model may eventually produce 3D/IFC and richer analytical views, but RH-C1 succeeds with deterministic semantic geometry, calculations and drawings.

---

## Why drawings matter

The current Reference House SVGs have been useful design records, but most are authored artefacts rather than generated projections from one canonical geometric model. That permits prose, calculations and drawings to drift apart.

Deterministic plans/sections are therefore not presentation polish. They are a high-value compiler test:

> **If the semantic model cannot faithfully draw the house we already designed and froze through RH-C0, it does not yet describe the house strongly enough.**

Once this slice works, the same model can support different projections—architectural, structural, services, maintenance, boundaries and obligations—without each view becoming a second source of truth.
