# Reference House Executable Slice

**Status:** **PASS through RH-C4 — deterministic architecture + bounded structural, service and boundary topology**  
**Date:** 2026-10-13  
**Prerequisite:** [RH-C0 — Reference House Model Freeze](reference-house-model-freeze-rhc0.md) — **PASS**  
**Canonical architectural fixture:** [`../reference-house/model-baseline-rhc0.md`](../reference-house/model-baseline-rhc0.md)  
**Generality gate:** [`compiler-generality-assurance-cf01.md`](compiler-generality-assurance-cf01.md) — **PASS**

## Current result

The executable Reference House programme has now passed five bounded questions.

```text
RH-C1  deterministic architectural fixture                              PASS
CF-01  adversarial plan-slice generality challenge                      PASS
RH-C2  bounded RH-05 structural topology                                PASS
RH-C3  bounded RH-06/RH-07/RH-10 service topology                       PASS
RH-C4  bounded RH-08/RH-09/RH-10 envelope / boundary topology           PASS
```

Current executable suites:

```text
P0                         17 / 17 PASS
PAT-XW-01                   6 /  6 PASS
RH-C1                      27 / 27 PASS
CF-01                       7 /  7 PASS
RH-C2                      17 / 17 PASS
RH-C3                      21 / 21 PASS
RH-C4                      29 / 29 PASS
```

Deterministic projections now include:

- `docs/reference-house/rhc1-ground-floor.svg`;
- `docs/reference-house/rhc1-first-floor.svg`;
- `docs/reference-house/rhc1-principal-section.svg`;
- `docs/reference-house/rhc2-structural-topology.svg`;
- `docs/reference-house/rhc3-service-topology.svg`;
- `docs/reference-house/rhc4-boundary-topology.svg`.

The C2–C4 projections are semantic/topological views, not specialist construction drawings. Their committed SVGs are exact deterministic renderer outputs.

---

## RH-C1 — deterministic architectural fixture

RH-C1 proved that one controlled semantic source can reproduce the bounded Reference House geometry, simple derived calculations and architectural drawings without parallel authored geometry.

It retains the important uncertainty discipline established by RH-C0: walls remain zero-thickness semantic boundaries; provisional wall build-up is planning/stress metadata rather than invented wall faces; ranges remain ranges; deliberately unknown courtyard-opening coordinates remain unknown; and upstream architectural `REVIEW`/`FAIL` states cannot be hidden by a drawing.

RH-C1 therefore establishes **fixture fidelity + dependency correctness**, not generality or technical adequacy.

---

## CF-01 — bounded plan generality

CF-01 challenged the RH-C1 implementation with a deliberately unlike domestic fixture: one storey, asymmetric, no courtyard, no stair, no regular bay field, no entrance-bay membership and irregular opening coordinates.

The reusable plan-semantic mechanisms now live under `compiler/plan-slice/`: dynamic levels, named orthogonal planning lines, spaces/voids, boundaries, openings, adjacency, containment, plate closure, diagnostics and deterministic semantic projection.

Reference-House-specific courtyard centring, bay composition, stair, wall-planning and roof logic remain local. CF-01 is **two-fixture bounded evidence**, not arbitrary architecture support.

---

## RH-C2 — bounded structural topology

RH-C2 compiles the RH-05 first-floor gravity topology over the same architectural source.

```text
STRUCTURAL TOPOLOGY       MACHINE-CHECKED
STRUCTURAL ADEQUACY       EXTERNAL — NOT PROVED
```

It represents four gross span fields, continuous support paths, four courtyard edge beams, protected reaction nodes, known stair/service interruptions, structural-deck diaphragm ownership and represented gravity continuity to a qualitative site-designed foundation handoff.

Numeric architectural openings on mapped bearing boundaries derive explicit `EXTERNAL-HEAD-SUPPORT-AND-BEARING` obligations. The current fixture derives **12** such obligations. `PEN-SV-01` remains an approximately **1,050 × 850 mm** structural coordination envelope; exact position, trimming, member sizes and capacities remain external.

C2 can reject missing/misaligned supports, false span supports, broken reaction-node geometry, unclosed structural fields, lost foundation handoff, missing local framing and diaphragm omissions. It does not prove member capacity, stability, deflection, connections, foundations, ULS/SLS or structural compliance.

---

## RH-C3 — bounded service topology

RH-C3 compiles only the service relationships already coordinated through RH-06, RH-07 and RH-10.

```text
SERVICE TOPOLOGY          MACHINE-CHECKED
MEP PERFORMANCE / DETAIL  EXTERNAL — NOT PROVED
```

The current fixture contains **13 semantic networks** covering utility entry, domestic water/foul, electrical/data, hydronic distribution, MVHR supply/extract/outdoor air, cooker capture, ASHP and PV. It also makes plant/riser/distribution/terminal identity and working/replacement/isolation/filter/inspection access explicit.

The RH-06/RH-07 `SV-01` clear reservation is approximately **900 × 700 mm** and is checked against RH-C2 `PEN-SV-01`'s **1,050 × 850 mm** structural envelope. That establishes only gross reservation compatibility; actual service packing remains external.

Selected plan-boundary penetrations are reconciled with represented bearing lines so structural consequences cannot disappear between abstractions. `PEN-BX-01` remains an explicit unselected fallback after the MVHR decision. C3 does not prove pipe/duct/cable sizing, airflow, hydraulics, heat output, electrical design, drainage falls, fire stopping, acoustics, commissioning or product compliance.

---

## RH-C4 — bounded envelope / boundary topology

RH-C4 compiles the envelope relationships already coordinated through RH-08, RH-09 and RH-10.

```text
ENVELOPE / BOUNDARY TOPOLOGY  MACHINE-CHECKED
BUILDING-PHYSICS PERFORMANCE   EXTERNAL — NOT PROVED
```

### Independent boundary systems

C4 deliberately does not collapse "the wall" into one all-purpose environmental object. It carries four independent systems:

- weather;
- air;
- thermal;
- moisture.

Each system has four critical carriers:

- outer walls;
- courtyard walls;
- roof;
- ground-interface handoff.

That gives **16 critical carriers**. Critical slow-envelope functions are explicitly non-removable: W0/W1/W2 finish or service-access strategies cannot silently become the sole weather, air, thermal or moisture boundary.

### Openings and thresholds

Every currently represented enclosure opening becomes an explicit boundary interruption. The canonical fixture carries **18 opening obligations**:

- **12 numeric** openings already controlled by the plan model;
- **6 qualitative** opening relationships whose exact geometry remains deliberately absent.

The latter are important: C4 does not manufacture east/west courtyard or garden-opening coordinates merely to complete the boundary graph. It records the continuity obligations while preserving architectural uncertainty.

Ground-level courtyard major openings retain threshold duties for drainage, movement and accessibility. Opening obligations also preserve the RH-09 sequence of permanent masonry opening → tolerance/mounting zone → replaceable frame → removable internal trim; decorative trim is not promoted into the primary seal.

### Service penetrations

C4 carries **7 selected C3 envelope-relevant service crossings** into weather/air/thermal/moisture reinstatement obligations:

- `PEN-UE-01`;
- `PEN-KX-01`;
- `PEN-HS-01`;
- `PEN-MV-01`;
- `PEN-SV-RF-01`;
- `PEN-PV-01`;
- `PEN-FD-01`.

`PEN-SV-01` remains an internal inter-storey structural/service crossing and is therefore not misclassified as an external-envelope event. `PEN-BX-01` remains inactive fallback topology.

### Rainwater topology and `PEN-CD-01`

RH-08 is represented directionally rather than as a generic "drainage present" flag.

Four roof fields drain **outward**, away from the courtyard. Their baseline plan catchments are derived from the canonical shell/courtyard geometry rather than copied as fixed numbers:

| Field | Baseline plan catchment |
|---|---:|
| south | 26.52 m² |
| north | 26.52 m² |
| west | 31.08 m² |
| east | 31.08 m² |
| **total** | **115.20 m²** |

The total closes to the same enclosed plate area used by the architectural model. Courtyard-width mutation changes the field areas rather than preserving stale RH-08 figures. The courtyard open-sky catchment remains **14.40 m²** at baseline.

The courtyard keeps two distinct service-side routes:

- `RW-COURT-PRIMARY` — removable-grate/silt-collection route to external inspection;
- `RW-COURT-EMERGENCY` — independent higher-level visible overflow.

A late red-team recovered the canonical crossing identity from the RH-06→RH-10 register: **`PEN-CD-01`** now explicitly owns both courtyard routes. Deleting the occurrence, dropping the emergency route, hiding failure behaviour, turning a roof field inward, or collapsing primary/emergency destinations fails the compile.

### C4 invariants and mutations

RH-C4 fails closed when, among other things:

- a critical boundary is assigned to a routinely removable carrier;
- environmental enclosure semantics are mapped onto an internal partition;
- one weather/air/thermal/moisture system loses carrier continuity;
- a numeric or qualitative opening disappears from the boundary graph;
- an opening is assigned to the wrong host boundary;
- a selected envelope penetration loses its reinstatement event;
- transition/system ownership becomes one-sided;
- the fallback bathroom extract is promoted into active topology;
- a roof field stops draining outward;
- courtyard primary/emergency drainage loses redundancy or visible failure;
- `PEN-CD-01` loses either courtyard route;
- derived roof catchments stop closing to the architectural plate;
- upstream architectural/service `REVIEW` or `FAIL` state would otherwise be erased.

The C4 source intentionally contains no U-values, ψ-values, conductivity values, dew-point/condensation result, airtightness result, rain-resistance class, fire resistance or acoustic rating.

### What RH-C4 does not prove

C4 does **not** establish:

- U-values or Part L compliance;
- thermal-bridge / ψ-value performance;
- condensation or hygrothermal safety;
- measured/design airtightness;
- rain penetration resistance;
- drainage capacity or storm sizing;
- cavity/fire-stop performance;
- acoustic performance;
- exact roof/ground build-ups;
- product compliance or durability;
- a construction-ready wall thickness.

The RH-10 **400–425 mm planning family / 450 mm stress value** remains what it was: coordination authority, not a construction specification.

---

## Calculation and evidence boundary

The programme retains three broad discharge modes:

1. **deterministic calculation** — geometry/arithmetic or another method whose authority is explicit;
2. **supported implementation/rule family** — only after a bounded family and competent method are established;
3. **external evidence** — engineer, MEP specialist, building-physics model, fire/building-control determination, product evidence or physical test.

A topology `PASS` means the represented relationships are internally coherent at the declared scope. It does not transform those relationships into technical adequacy.

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
RH-C4 — envelope / boundary view       PASS
  ↓
RH-C5 — selected target calculations   NEXT
```

### RH-C5 — selected target calculations

**NEXT.** Consider only narrow, versioned checks whose rule authority, inputs, supported domain and proof boundary are explicit. Candidate calculations must be earned by the available source/evidence; C5 must not become a monolithic `isBuildingRegulationsCompliant()` abstraction.

These labels are sequencing aids, not maturity levels.

---

## Explicit non-goals

The executable programme does not presently justify arbitrary architecture support, a polished 3D modeller, general BIM replacement, generative design, a universal structural/MEP/building-physics solver, or a complete Building Regulations engine.

The current result is stronger but still bounded: **deterministic architectural fixture + two-fixture plan evidence + internally coherent structural topology + internally coherent service topology + internally coherent envelope/boundary topology**. Competent specialist review, physical validation and site-specific engineering remain external requirements.
