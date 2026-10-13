# RH-C2 — Reference House Structural View

**Status:** **PASS — bounded structural topology compiled from the Reference House source**  
**Date:** 2026-10-13  
**Upstream:** [RH-C1 executable slice](reference-house-executable-slice.md), [CF-01 generality assurance](compiler-generality-assurance-cf01.md)  
**Architectural authority:** [RH-05 Structural Coordination](../reference-house/structural-coordination.md)  
**External-review boundary:** [RH-11 Structural Review Brief](../reference-house/external-review-structural-rh11.md)  
**Implementation:** `compiler/structure-slice/`, `compiler/rhc2/`  
**Projection:** [`../reference-house/rhc2-structural-topology.svg`](../reference-house/rhc2-structural-topology.svg)

## Result

RH-C2 passes at the **structural-topology** scope.

The compiler now represents the RH-05 first-floor gravity concept as a structural view over the same architectural plan source used by RH-C1. It can check that the represented floor fields terminate on declared support paths, that those paths remain geometrically continuous, that edge beams terminate on their declared supports, that courtyard reaction nodes coincide with the members they join, and that the represented gravity paths reach a declared foundation destination.

That is a useful machine-checkable result. It is not structural engineering approval.

The proof boundary is explicit:

```text
STRUCTURAL TOPOLOGY       MACHINE-CHECKED
STRUCTURAL ADEQUACY       EXTERNAL — NOT PROVED
```

No member capacity, connection capacity, deflection, vibration, global stability, robustness, fire resistance, residual-pier capacity, lintel adequacy, foundation adequacy or Building Regulations structural compliance is asserted by RH-C2.

---

## Compiled topology

The executable fixture reproduces the controlled RH-05 arrangement without duplicating its plan coordinates.

### Gross floor fields

| Field | Architectural extent | Span direction | Derived gross span |
|---|---|---|---:|
| `F-W` | west outer wall → west courtyard line | east / west | 4,200 mm |
| `F-E` | east courtyard line → east outer wall | east / west | 4,200 mm |
| `F-S` | south outer wall → south courtyard line | north / south | 3,400 mm |
| `F-N` | north courtyard line → north outer wall | north / south | 3,400 mm |

The four gross fields close to the same **115.2 m²** first-floor plate used by the architectural model.

### Support topology

The structural slice represents:

- outer bearing lines on all four sides;
- courtyard bearing lines on all four sides;
- four short edge beams: `EB-W-S`, `EB-E-S`, `EB-W-N`, `EB-E-N`;
- continuous support paths assembled from those bearing and beam segments;
- four protected courtyard reaction nodes;
- a site-designed foundation destination as the declared end of represented bearing paths.

The foundation destination is intentionally qualitative. RH-C2 checks that a destination is declared; it does not select, size or validate a foundation system.

### Structural interruptions

Two known first-floor interruptions are carried without invented precision:

- `ST-01` — stair opening: local trimmer system required; exact trimming geometry remains absent because RH-05 does not control it;
- `PEN-SV-01` — service opening: approximately 1,050 × 850 mm structural envelope, with exact position and final engineered trimming still external.

The structural deck is the declared diaphragm layer. Changeable floor finishes remain explicitly non-structural.

---

## Bearing openings

A late RH-C2 red-team exposed a potential semantic error: a continuous bearing-line abstraction could make architectural windows and doors disappear from the structural model.

RH-C2 therefore maps architectural bearing boundaries to their structural bearing lines. Every **numeric** opening already present in those boundaries derives a structural obligation automatically.

The Reference House currently produces **12 numeric bearing-opening obligations**. Each carries:

```text
EXTERNAL-HEAD-SUPPORT-AND-BEARING
```

This records the structural consequence without inventing a lintel family, residual-pier capacity or end-bearing proof.

Openings whose architectural geometry is deliberately qualitative remain qualitative. In particular, the east/west courtyard opening centres and north/garden opening fields are not manufactured merely to make the structural view look complete.

---

## Executable invariants

RH-C2 checks that:

- the structural fixture is compiled against the intended architectural fixture;
- structural entities retain unique stable IDs;
- bearing lines declare a foundation destination;
- support paths reference real structural segments;
- support-path segments are collinear and continuous;
- edge beams terminate on their declared endpoint support paths;
- span fields remain inside the architectural shell and outside architectural voids;
- each span field is bounded by support paths perpendicular to its span direction;
- support paths cover the full cross-width of the field they support;
- gross structural fields do not overlap and close to the architectural plate area;
- represented gravity paths terminate at a declared foundation destination;
- courtyard reaction nodes coincide with every structural element they reference;
- architectural bearing boundaries map geometrically to the structural bearing lines that own them;
- known structural interruptions have declared local framing systems;
- the structural-deck diaphragm accounts for every gross field and known interruption;
- an upstream Reference House `REVIEW` or `FAIL` cannot be erased by a structurally coherent projection.

The structural renderer refuses a failed topology and the committed SVG is checked as an exact deterministic projection of the canonical fixture.

---

## Mutation evidence

The RH-C2 suite deliberately attacks the topology rather than merely snapshotting the baseline.

It confirms that:

- changing courtyard width propagates into span lengths and edge-beam positions;
- an RH-C1 stair-fit `REVIEW` remains an overall `REVIEW` even if structural topology still compiles;
- deleting an edge-beam segment from a support path exposes a support-path gap;
- moving an edge beam off its intended line exposes path and reaction-node inconsistency;
- removing a bearing line's foundation destination breaks the represented gravity path;
- mapping an architectural bearing boundary to the wrong structural line fails geometrically;
- assigning a span field to support paths that do not bound it fails;
- removing a required local trimmer fails;
- silently omitting a field from the structural-deck diaphragm fails;
- unchanged input produces deterministic semantic and drawing output.

The RH-C2 suite passes **17/17 tests** while the earlier P0, PAT-XW-01, RH-C1 and CF-01 suites remain regression gates.

---

## Deliberate absences

RH-C2 does not infer data that RH-05 or subsequent controlled records do not provide.

It therefore does **not** contain:

- engineered joist or beam sections;
- timber strength classes;
- loads or load combinations;
- connection details or capacities;
- exact stair trimmer geometry;
- exact service-opening position;
- lintel selection or residual-pier calculations;
- roof structural topology beyond the earlier qualitative expectation of ordinary short-span framing;
- a lateral-stability analytical model;
- foundations beyond a declared site-designed destination;
- ULS / SLS calculations;
- regulatory structural certification.

These are not omissions to be silently filled by implementation convenience. They remain engineering or later bounded-solver work.

---

## What RH-C2 proves

RH-C2 establishes that the coordinated architectural concept has a **represented and internally coherent structural topology at the declared scope**.

It proves that the software can detect certain broken relationships before drawings drift apart: missing supports, discontinuous support paths, misaligned beams, false span support, unmapped bearing boundaries, lost local framing obligations and incomplete diaphragm accounting.

It does **not** prove that any of those elements are strong enough.

That distinction is the core result of the gate.

---

## Programme consequence

```text
RH-C0  model freeze                     PASS
   ↓
RH-C1  deterministic Reference House   PASS
   ↓
CF-01  contrast-fixture generality     PASS
   ↓
RH-C2  bounded structural view         PASS
   ↓
RH-C3  bounded service view            NEXT
```

RH-C3 may now begin when desired. It should add only the service topology needed to reproduce the already-coordinated RH-06/RH-07/RH-10 relationships, while preserving the same distinction between represented route coherence and external technical adequacy.

The computational workstream remains **M3**. RH-C2 is stronger internal model control; it is not competent structural review or physical validation and does not promote the Reference House beyond its current virtual-design maturity.
