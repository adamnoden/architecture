# Reference House Executable Slice

**Status:** **PASS through RH-C5 — bounded internal executable sequence complete**  
**Date:** 2026-10-13  
**Prerequisite:** [RH-C0 — Reference House Model Freeze](reference-house-model-freeze-rhc0.md) — **PASS**  
**Canonical architectural fixture:** [`../reference-house/model-baseline-rhc0.md`](../reference-house/model-baseline-rhc0.md)  
**Generality gate:** [`compiler-generality-assurance-cf01.md`](compiler-generality-assurance-cf01.md) — **PASS**

## Current result

The Reference House executable programme has passed its six bounded questions.

```text
RH-C1  deterministic architectural fixture                              PASS
CF-01  adversarial plan-slice generality challenge                      PASS
RH-C2  bounded RH-05 structural topology                                PASS
RH-C3  bounded RH-06/RH-07/RH-10 service topology                       PASS
RH-C4  bounded RH-08/RH-09/RH-10 envelope / boundary topology           PASS
RH-C5  selected numeric calculation method                              PASS
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
RH-C5                      16 / 16 PASS
```

Deterministic projections include:

- `docs/reference-house/rhc1-ground-floor.svg`;
- `docs/reference-house/rhc1-first-floor.svg`;
- `docs/reference-house/rhc1-principal-section.svg`;
- `docs/reference-house/rhc2-structural-topology.svg`;
- `docs/reference-house/rhc3-service-topology.svg`;
- `docs/reference-house/rhc4-boundary-topology.svg`.

The C2–C4 projections are semantic/topological views, not specialist construction drawings. Their committed SVGs are exact deterministic renderer outputs. C5 is a numeric result and does not add a drawing merely to create another artefact.

---

## RH-C1 — deterministic architectural fixture

RH-C1 proved that one controlled semantic source can reproduce the bounded Reference House geometry, simple derived calculations and architectural drawings without parallel authored geometry.

The source controls the 12,000 × 10,800 mm shell, centred 3,600 × 4,000 mm courtyard, principal levels, spaces, stair arithmetic, major semantic boundaries, major openings and the front bay field. The enclosed plate is 115.2 m² per principal storey. Walls remain zero-thickness semantic boundaries; provisional wall build-up stays planning/stress metadata rather than invented construction geometry. Ranges remain ranges, and deliberately unknown courtyard-opening coordinates remain unknown.

The canonical stair arithmetic derives rather than authors its consequences: 18 rises over 3,300 mm, approximately 183.333 mm rise, 280 mm going, 1,400 mm flight run, 2R+G approximately 646.667 mm and pitch approximately 33.215°. RH-C1 does not assign those numbers regulatory authority.

Mutation tests distinguish propagation, source-integrity failure, architectural `REVIEW` and deliberate absence. An upstream `REVIEW` or `FAIL` cannot be hidden by a drawing.

RH-C1 therefore establishes **fixture fidelity + dependency correctness**, not generality or technical adequacy.

---

## CF-01 — bounded plan generality

CF-01 challenged the RH-C1 implementation with a deliberately unlike domestic fixture: one storey, asymmetric, no courtyard, no stair, no regular bay field, no entrance-bay membership and irregular opening coordinates.

The reusable plan-semantic mechanisms live under `compiler/plan-slice/`: dynamic levels, named orthogonal planning lines, spaces/voids, boundaries, openings, adjacency, containment, plate closure, diagnostics and deterministic semantic projection.

Reference-House-specific courtyard centring, bay composition, stair, wall-planning and roof logic remain local. CF-01 is **two-fixture bounded evidence**, not arbitrary architecture support.

---

## RH-C2 — bounded structural topology

RH-C2 compiles the RH-05 first-floor gravity topology over the same architectural source.

```text
STRUCTURAL TOPOLOGY       MACHINE-CHECKED
STRUCTURAL ADEQUACY       EXTERNAL — NOT PROVED
```

It represents four gross span fields, continuous support paths, four courtyard edge beams, protected reaction nodes, known stair/service interruptions, structural-deck diaphragm ownership and represented gravity continuity to a qualitative site-designed foundation handoff.

Numeric architectural openings on mapped bearing boundaries derive explicit `EXTERNAL-HEAD-SUPPORT-AND-BEARING` obligations. The canonical house derives 12 such obligations. `PEN-SV-01` remains an approximately 1,050 × 850 mm structural coordination envelope; exact position, trimming, member sizes and capacities remain external.

C2 rejects missing/misaligned supports, false span supports, broken reaction-node geometry, unclosed structural fields, lost foundation handoff, missing local framing and diaphragm omissions. It does not prove member capacity, stability, deflection, connections, foundations, ULS/SLS or structural compliance.

---

## RH-C3 — bounded service topology

RH-C3 compiles only the service relationships already coordinated through RH-06, RH-07 and RH-10.

```text
SERVICE TOPOLOGY          MACHINE-CHECKED
MEP PERFORMANCE / DETAIL  EXTERNAL — NOT PROVED
```

The fixture contains 13 semantic networks covering utility entry, domestic water/foul, electrical/data, hydronic distribution, MVHR supply/extract/outdoor air, cooker capture, ASHP and PV. Plant/riser/distribution/terminal identity and working/replacement/isolation/filter/inspection access are explicit.

The RH-06/RH-07 `SV-01` clear reservation is approximately 900 × 700 mm and is checked against RH-C2 `PEN-SV-01`'s approximately 1,050 × 850 mm structural envelope. That establishes only gross reservation compatibility; actual service packing remains external.

Selected plan-boundary penetrations are reconciled with represented bearing lines so structural consequences cannot disappear between abstractions. `PEN-BX-01` remains an explicit unselected fallback after the MVHR decision. C3 does not prove pipe/duct/cable sizing, airflow, hydraulics, heat output, electrical design, drainage falls, fire stopping, acoustics, commissioning or product compliance.

---

## RH-C4 — bounded envelope / boundary topology

RH-C4 compiles the envelope relationships already coordinated through RH-08, RH-09 and RH-10.

```text
ENVELOPE / BOUNDARY TOPOLOGY  MACHINE-CHECKED
BUILDING-PHYSICS PERFORMANCE   EXTERNAL — NOT PROVED
```

C4 does not collapse “the wall” into one environmental property. It carries four independent systems — weather, air, thermal and moisture — across outer walls, courtyard walls, roof and a qualitative ground-interface handoff: 16 critical non-removable carriers in total.

Every currently represented enclosure opening becomes an explicit boundary interruption. The fixture carries 18 opening obligations: 12 numeric openings and six deliberately qualitative opening relationships. Missing east/west courtyard or garden-opening coordinates are not manufactured. Ground-level courtyard openings retain threshold duties for drainage, movement and accessibility.

Seven selected C3 envelope-relevant crossings create weather/air/thermal/moisture reinstatement obligations: `PEN-UE-01`, `PEN-KX-01`, `PEN-HS-01`, `PEN-MV-01`, `PEN-SV-RF-01`, `PEN-PV-01` and `PEN-FD-01`. Internal inter-storey `PEN-SV-01` is not misclassified as an external-envelope event; fallback `PEN-BX-01` remains inactive.

RH-08 rainwater topology is directional. Four roof fields drain outward. Baseline plan catchments derive from the same shell/courtyard geometry:

| Field | Baseline plan catchment |
|---|---:|
| south | 26.52 m² |
| north | 26.52 m² |
| west | 31.08 m² |
| east | 31.08 m² |
| **total** | **115.20 m²** |

The total closes to the architectural plate. Courtyard-width mutation changes those fields rather than preserving stale values. The courtyard open-sky catchment is 14.40 m² at baseline.

The courtyard retains two distinct routes: `RW-COURT-PRIMARY` to external inspection and `RW-COURT-EMERGENCY` as an independent higher-level visible overflow. Canonical occurrence `PEN-CD-01` owns both. Deleting the occurrence, dropping the emergency route, hiding failure behaviour, turning a roof field inward or collapsing the two destinations fails the compile.

C4 does not establish U-values, ψ-values, condensation/hygrothermal safety, airtightness, rain penetration resistance, drainage capacity, fire/acoustic performance, exact roof/ground build-ups or product compliance. The RH-10 400–425 mm planning family / 450 mm stress value remains coordination authority, not a construction specification.

---

## RH-C5 — selected numeric calculation method

RH-C5 is the first Reference House gate to compare a derived technical number against an external method authority rather than checking topology alone.

The audit deliberately admitted only one family: **private-stair geometry**. The canonical house already owns all required inputs with sufficient precision. U-values, rainwater capacity, structural member sizing and MEP sizing remain absent because their construction, site/rainfall, load/member or performance inputs are not yet authoritative enough.

The reusable evaluator lives under `compiler/calculation-slice/`; the Reference House method/application lives under `compiler/rhc5/`.

### Method identity and authority

The encoded method is `ADK-2013-PRIVATE-STAIR-GEOMETRY` version `1.0.0`. It records:

- jurisdiction: England;
- source: *Approved Document K: protection from falling, collision and impact*;
- edition: 2013 edition;
- paragraph 1.3 / Table 1.1;
- official GOV.UK source URL;
- source checked on 2026-10-13;
- fixture application context: dwelling / private stair.

That is a **versioned calculation-method snapshot**, not a release-grade compiler target. House Kernel's compiler-target architecture additionally requires the applicable legal snapshot, transitional basis, building/work classification, selected compliance routes and referenced standards. C5 does not invent those determinations.

### Implemented numeric correspondence

For the selected private-stair family the method checks:

| Criterion | Selected guidance value | Reference House | Result |
|---|---:|---:|---|
| rise | 150–220 mm inclusive | ≈183.333 mm | PASS |
| going | 220–300 mm inclusive | 280 mm | PASS |
| pitch | ≤42° | ≈33.215° | PASS |
| 2R+G | 550–700 mm inclusive | ≈646.667 mm | PASS |

The values are consumed from the same derived stair used by RH-C1; C5 does not author a second stair model.

### Proof boundary

```text
SELECTED NUMERIC METHOD CORRESPONDENCE  MACHINE-CHECKED
APPROVED-DOCUMENT GUIDANCE COVERAGE     BOUNDED-METHOD-ONLY
RELEASE-GRADE COMPILER TARGET           NOT ESTABLISHED
BUILDING REGULATIONS COMPLIANCE         NOT PROVED
WHOLE-BUILDING TECHNICAL ADEQUACY       EXTERNAL — NOT PROVED
```

A C5 `PASS` means only that the represented values correspond to the four selected numeric guidance values within this declared method/application context. It does not establish Requirement K1 compliance as a whole, headroom, landing geometry, handrails, guarding, accessibility, fire/means-of-escape adequacy, construction tolerances, workmanship or building-control acceptance.

### Fail-closed behaviour

The calculation kernel has three result states: `PASS`, `FAIL` and `UNSUPPORTED`.

- an in-domain complete input outside a selected numeric bound is `FAIL`;
- missing input, wrong unit, non-finite input or out-of-domain applicability is `UNSUPPORTED`;
- malformed encoded methods are `UNSUPPORTED` rather than evaluated;
- incomplete evidence dominates a simultaneous failing criterion, preventing a definitive negative claim from incomplete input;
- upstream architectural `REVIEW` remains `REVIEW` even if the numeric method passes;
- upstream `FAIL` remains `FAIL`;
- unchanged source and method authority are deeply deterministic.

The 16-test suite exercises inclusive boundaries, failure values, unsupported applicability, missing/non-finite inputs, malformed method data, upstream status propagation, source mutation, determinism and absence of unearned calculation families.

There is no `isBuildingRegulationsCompliant()` result.

---

## Calculation and evidence boundary

The programme retains three broad discharge modes:

1. **deterministic calculation** — geometry/arithmetic or another method whose authority is explicit;
2. **supported implementation/rule family** — only after a bounded family and competent method are established;
3. **external evidence** — engineer, MEP specialist, building-physics model, fire/building-control determination, product evidence or physical test.

Representability is not adequacy. A topology `PASS` says a represented relationship graph is coherent. A C5 numeric `PASS` says only what its named method claim says. Neither silently widens into building release.

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
RH-C5 — selected target calculations   PASS
```

**There is no standing RH-C6.** RH-C5 closes the currently authorised bounded internal executable sequence. New calculation families or compiler capabilities should be added only when a concrete project uncertainty, external professional finding, physical-test result or newly authoritative input makes a machine check worthwhile.

This is not a claim that the compiler is finished in the general sense. It is a control decision against speculative expansion.

---

## Explicit non-goals and next evidence

The executable programme does not presently justify arbitrary architecture support, a polished 3D modeller, general BIM replacement, generative design, a universal structural/MEP/building-physics solver, or a complete Building Regulations engine.

The current result is deliberately bounded: **deterministic architectural fixture + two-fixture plan evidence + internally coherent structural topology + internally coherent service topology + internally coherent envelope/boundary topology + one versioned numeric method correspondence check**.

Competent specialist review, physical validation and site-specific engineering remain external requirements. The next valuable computational work is therefore **evidence-selected**, not stage-number-selected: retain the existing suites as regression gates and reopen implementation only when another workstream exposes a concrete relationship or proof family worth formalising.
