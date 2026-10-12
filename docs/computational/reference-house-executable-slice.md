# Reference House Executable Slice

**Status:** **PASS — deterministic Reference House fixture reproduced from one semantic source**  
**Date:** 2026-10-12  
**Prerequisite:** [RH-C0 — Reference House Model Freeze](reference-house-model-freeze-rhc0.md) — **PASS**  
**Canonical fixture source:** [`../reference-house/model-baseline-rhc0.md`](../reference-house/model-baseline-rhc0.md)  
**Implementation:** `compiler/reference-house/`  
**Drawing parity result:** [`../reference-house/rhc1-drawing-parity-result.md`](../reference-house/rhc1-drawing-parity-result.md)  
**Post-C1 gate:** [`compiler-generality-assurance-cf01.md`](compiler-generality-assurance-cf01.md)  
**Trigger:** RH-00→RH-11 produced an M3 coordinated Reference House; RH-C0 froze the bounded architectural fixture; RH-C1 has now compiled that fixture deterministically.

## Result

RH-C1 passed at the bounded one-fixture scope.

One canonical semantic source now reproduces:

- shell and centred courtyard geometry;
- room/circulation reservations and major semantic boundaries;
- principal levels and stair arithmetic;
- controlled front axes and opening memberships;
- legitimate opening dimensions/areas where source authority exists;
- ground-floor plan;
- first-floor plan;
- principal section.

The RH-C1 suite passes **27/27 tests**, including the RH-C0 mutation expectations and deterministic SVG projection tests. The generated drawings are:

- `docs/reference-house/rhc1-ground-floor.svg`;
- `docs/reference-house/rhc1-first-floor.svg`;
- `docs/reference-house/rhc1-principal-section.svg`.

The RH-C0 hand-authored comparator drawings are retained as historical comparison provenance. They are no longer the current geometric projections and were not reverse-engineered into source geometry.

RH-C1 establishes **fixture fidelity + dependency correctness**. It does not establish compiler generality. CF-01 is therefore the next executable gate before RH-C2.

## Why this reopened executable work

P0 and `PAT-XW-01` deliberately froze generic compiler growth until another workstream exposed a concrete, high-value question. The Reference House did so.

The problem was specific and falsifiable:

> **Can one canonical semantic source reproduce the controlled Reference House geometry, its simple derived calculations and a small set of architectural drawings deterministically?**

RH-C1 answers that question **yes, at the bounded Reference House fixture scope**.

The Reference House remains a **controlled regression fixture**, not a universally correct house. RH-C0 established that its architectural facts were internally coherent enough to freeze while preserving provisional and out-of-scope uncertainty; RH-C1 preserved those distinctions in code.

This is a vertical slice through the existing computational architecture, not a restart of a general CAD/compiler programme.

---

## RH-C1 — minimum executable slice

RH-C1 encodes only geometry released by RH-C0 as `FROZEN_FOR_RH_C1` or deliberately `PROVISIONAL_BUT_REPRESENTABLE`:

- outer shell;
- courtyard;
- storey levels / principal vertical datums;
- rooms and circulation spaces;
- stair;
- major walls / semantic boundaries;
- major openings;
- principal architectural axes / bay centres.

It does **not** pull structure, MEP, arbitrary 3D solids, products, optimisation or a general regulations engine into the slice.

### Canonical source

The Reference House has one machine-readable source of geometric facts. Drawings and derived calculations consume that source; they do not duplicate it.

The only architectural source contract for RH-C1 is [`model-baseline-rhc0.md`](../reference-house/model-baseline-rhc0.md). Representative values in this document are explanatory only; if this document and the RH-C0 baseline ever differ, the baseline wins.

Stable semantic identity survives projection. A window, boundary or room shown in a drawing is the same project entity used by calculations and later evidence.

---

## Derived calculation layer

The implementation uses small deterministic derivations only where authority is clear, including:

- shell / courtyard / enclosed plate area;
- room reservation dimensions and areas where deterministically implied;
- stair rise, pitch and `2R+G`;
- boundary length;
- opening centre, width/height range and area where source authority exists;
- thickness-aware wall-planning stress views without promoting the provisional wall family into final wall geometry;
- the provisional low-slope roof screening relation needed by the section.

These are derived views over canonical source entities, not a miscellaneous calculator collection.

Professional judgement is not encoded as a numerical helper merely because it is convenient.

---

## Deterministic drawing output

The production outputs are deliberately narrow:

1. ground-floor plan;
2. first-floor plan;
3. principal section.

SVG remains appropriate because it is text, diffable and web-native.

The renderer is **not** a CAD authoring system. It is a deterministic projection of the semantic model.

Rendered semantic groups retain stable identity through attributes such as `data-entity`. The drawing engine separates:

- model/world coordinates;
- projection/view logic;
- drawing conventions such as line weight, labels and dimensions.

A change to a canonical dimension propagates to every drawing that consumes it.

### Parity gate

The generated drawings are not architectural authority merely because they compile.

Parity passed because the generated plans/section reproduce the RH-C0-controlled fixture semantically, not merely visually. The check covered controlled dimensions, entity identity, hosts, axes, room topology, levels, stair arithmetic, provisional boundaries and deliberate absences.

The RH-C0 visual comparators remain:

- `docs/reference-house/rhc0-ground-floor-comparator.svg`;
- `docs/reference-house/rhc0-first-floor-comparator.svg`;
- `docs/reference-house/rhc0-principal-section-comparator.svg`.

They are historical comparison projections, not source geometry.

---

## Executable invariants

RH-C1 tests that:

- shell and courtyard dimensions derive from the controlled source;
- rooms lie inside the permitted enclosed field;
- rooms do not occupy the courtyard;
- required room geometry does not overlap incompatibly;
- openings belong to their declared host boundary and semantic host space;
- controlled axes and opening centres derive from the same facts used by drawings;
- first-floor and ceiling datums remain consistent across projections;
- stair rise derives from FFL and riser count rather than duplicate authorship;
- authored stair groups cannot silently mutate into a different topology;
- repeated compilation of unchanged source produces identical semantic and drawing output;
- committed generated SVGs remain exact renderer outputs.

The mutation tests use the RH-C0 dependency map and distinguish propagation, explicit failure, architectural review and unaffected/out-of-scope facts.

### Fixture-specificity discipline

RH-C1 does not attempt to anticipate every future house. It keeps three roles distinct:

1. **semantic core** — architectural meaning justified independently of this fixture;
2. **fixture data** — the Reference House courtyard, topology, dimensions, stair grouping, bay field and other project-specific facts;
3. **derived projection** — calculations and drawings produced from the source.

The implementation does not claim that every house has a centred courtyard, four bays, two storeys, an 18-riser 3×6 stair or G-01-derived opening order. Nor does it build speculative generic abstractions merely because another house might one day need them.

CF-01 is the explicit second-case challenge that will discover which assumptions actually need generalisation.

---

## Calculation and evidence boundary

Not every technical question belongs in a pure function.

The project retains three broad discharge modes:

1. **deterministic calculation** — geometry/arithmetic or another method whose authority is explicit;
2. **supported implementation/rule family** — only after a bounded family and competent method are established;
3. **external evidence** — engineer, building-physics model, fire/building-control determination, product evidence or physical test.

The existing P0 evidence/staleness architecture remains relevant for later slices. Structural, fire, acoustic, hygrothermal, daylight and dynamic-overheating calculations remain external unless and until a deliberately bounded native implementation earns authority.

Representability is not adequacy. A passing compile is not physical construction proof.

---

## Growth sequence after RH-C1

A successful single-fixture compile is not evidence that the core is general.

### CF-01 — contrast fixture generality gate

**NEXT.** Before deeper compiler slices enlarge the architecture, challenge RH-C1 with the deliberately unlike, minimal contrast fixture defined in [`compiler-generality-assurance-cf01.md`](compiler-generality-assurance-cf01.md).

CF-01 tests something the RH-C0/RH-C1 mutation suite cannot: whether the semantic core accidentally assumes the Reference House's courtyard, room ring, four-bay front, stair topology or grammar. It is not a second fully developed Reference House and not an arbitrary-architecture target.

### RH-C2 — structural view

**BLOCKED by CF-01.** After CF-01, add supports, spans, edge beams, protected nodes and load-path semantics needed to reproduce RH-05 coordination. This is not a general structural solver.

### RH-C3 — service view

Add plant, riser, routes, penetrations and controlled crossings needed to reproduce RH-06/RH-07/RH-10 service topology.

### RH-C4 — envelope / boundary view

Add external/courtyard wall family geometry, openings and air/thermal/weather boundary relationships needed for coordinated junction obligations.

### RH-C5 — selected target calculations

Only then consider narrow, versioned England-target checks where the rule and proof boundary are clear—for example stair geometry, escape-opening geometry or selected ventilation obligations. Avoid a monolithic `isBuildingRegulationsCompliant()` abstraction.

These labels are sequencing aids, not maturity levels.

---

## Explicit non-goals

RH-C1 does not justify:

- arbitrary architecture support;
- a polished 3D modelling UI;
- general BIM replacement;
- generative design;
- a universal structural solver;
- a complete Building Regulations engine;
- encoding architectural quality as a boolean;
- rebuilding external specialist software inside House Kernel without a strong case.

The source model may eventually produce 3D/IFC and richer analytical views, but RH-C1 succeeds with deterministic semantic geometry, calculations and drawings.

A passing RH-C1 establishes **one-fixture reproduction and mutation correctness**, not generality. CF-01 is the next evidence gate for that claim.

---

## Why drawings matter

The earlier Reference House SVGs were useful design records, but most were authored artefacts rather than generated projections from one canonical geometric model. That permitted prose, calculations and drawings to drift apart.

Deterministic plans/sections are therefore not presentation polish. They are a compiler test:

> **If the semantic model cannot faithfully draw the house we already designed and froze through RH-C0, it does not yet describe the house strongly enough.**

RH-C1 now passes that test for the three controlled views. The same model can later support structural, services, maintenance, boundary and obligation projections without each view becoming a second source of truth—but those later slices remain gated work.
