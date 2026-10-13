# Computational Track

The computational track asks a narrow question within House Kernel: **which building relationships can be represented strongly enough that invalid arrangements, unresolved obligations or missing evidence are exposed during authoring rather than discovered later in drawings or construction?**

It is subordinate to the architecture. Rooms, walls, openings, structure, boundaries, service routes and maintenance paths may be represented semantically where doing so creates a useful check, but architectural judgement is not converted into arbitrary machine rules merely to make the model more complete.

The paper-compilation programme, Phase-8 pattern crosswalk, P0 executable kernel, `PAT-XW-01`, RH-C0 model freeze, RH-C1 deterministic Reference House slice, CF-01 contrast-fixture gate, RH-C2 bounded structural view and RH-C3 bounded service view have now completed at their stated internal scopes.

## Active computational work

**RH-C4 — envelope / boundary view — is next.**

RH-C3 now represents and falsifies the already-coordinated RH-06/RH-07/RH-10 service topology over the same architectural and structural source chain. It checks semantic network continuity, primary-service geography, maintenance/replacement access, selected versus fallback crossings, the `SV-01` service reservation against the RH-C2 structural opening envelope, and bearing-wall consequences of selected service penetrations.

The RH-C3 projection is intentionally non-spatial: it records semantic route continuity and crossing ownership without inventing exact pipe, cable or duct coordinates.

The proof boundary remains narrow. RH-C3 proves **represented service-topology coherence**, not MEP sizing, hydraulic/aerodynamic performance, acoustic/fire performance, commissioning or product compliance.

Current executable suites:

```text
P0                         17 / 17 PASS
PAT-XW-01                   6 /  6 PASS
RH-C1                      27 / 27 PASS
CF-01                       7 /  7 PASS
RH-C2                      17 / 17 PASS
RH-C3                      21 / 21 PASS
```

Canonical sequence:

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

Programme records:

- [RH-C0 — Reference House Model Freeze](reference-house-model-freeze-rhc0.md)
- [Reference House executable programme — RH-C1 through RH-C3](reference-house-executable-slice.md)
- [CF-01 — Compiler Generality Assurance](compiler-generality-assurance-cf01.md)
- [RH-C1 drawing parity result](../reference-house/rhc1-drawing-parity-result.md)

The Reference House remains a **controlled regression fixture**, not a universally correct house or universal House Kernel template. The CF-01 contrast house is likewise an adversarial test fixture, not a second design proposal.

## What has been established

The research sequence progressed from wall-bay scale to a bounded whole-house paper model, then into the minimal executable kernel and controlled architectural fixtures:

```text
S0 → S1 → S2 → H1-PAPER-01
                     ↓
          Phase-8 pattern crosswalk
                     ↓
              P0 executable kernel
                     ↓
                 PAT-XW-01
                     ↓
          RH-C0 model freeze
                     ↓
       RH-C1 deterministic fixture
                     ↓
       CF-01 contrast-fixture gate
                     ↓
       RH-C2 structural topology
                     ↓
       RH-C3 service topology
```

Within those scopes, the work established that:

- semantic identity, typed relationships, obligations and scoped evidence can remain coherent from assembly to bounded whole-house scale;
- the canonical pattern language can provide project provenance without becoming a second compiler ontology;
- project requirements and technical validity can diverge cleanly;
- technical obligations can derive from composed building relationships rather than from pattern identity;
- evidence can be scoped and invalidated selectively rather than treated as a global PASS/FAIL state;
- simple source and geometry well-formedness can be checked deterministically;
- architectural commitments can remain valid while a dependent technical obligation becomes unresolved;
- one bounded architectural source can drive deterministic geometry, calculations and SVG drawings without duplicating derived facts;
- mutation tests can distinguish propagation, source-integrity failure, architectural review and deliberate absence;
- provisional architectural facts can remain provisional in an executable model rather than being hardened for implementation convenience;
- shared plan semantics can operate across two materially unlike fixtures without fixture-ID branching or requiring a courtyard, two storeys, a regular bay field, entrance-bay membership or a stair;
- a bounded structural topology can be derived from the same plan source and checked for support continuity, span/support coherence, reaction-node geometry, structural-field closure, known interruptions and represented gravity continuity;
- architectural openings hosted by bearing boundaries can remain visible as explicit external structural obligations without inventing a native capacity proof;
- bounded service networks can be checked for semantic continuity, route/crossing ownership, service geography and declared access without inventing MEP sizing or exact branch geometry;
- the RH-06/RH-07 900 × 700 mm service reservation can be checked against the RH-C2 1050 × 850 mm structural opening envelope while leaving actual service packing external;
- selected service crossings through represented bearing walls can derive explicit structural-opening/bearing obligations rather than disappearing behind either the service or structural abstraction.

These results do **not** establish that a building or assembly is structurally, environmentally, regulatorily or MEP-adequate. Building release remains outside the demonstrated scope, and competent external review is still required.

## Authority boundary

The computational model has a deliberately limited authority.

- **A pattern is not a compiler primitive.**
- **Pattern provenance is not technical authority.**
- **An architectural grammar is not owned by the compiler.**
- **Representability is not evidence of adequacy.**
- **A research compile is not a building-release certificate.**
- **Architectural judgement remains architectural where no legitimate deterministic rule exists.**

The useful object is therefore not a universal rule engine but a model that can make selected relationships explicit, derive obligations from them, attach evidence at the right scope and refuse claims the available evidence cannot support.

RH-C1 follows that boundary for architectural geometry. CF-01 strengthens only the reuse claim around the bounded plan-semantic mechanisms. RH-C2 extends machine checking to **structural topology only**. RH-C3 extends it to **service topology only**. A `PASS` means the represented relationship graph is internally coherent at its declared scope; technical adequacy remains external.

## Core model

- [Executable Architecture](executable-architecture.md) — proposition, compiler/checker distinction, bounded domain and proof boundary.
- [Formal Architectural Model](formal-architectural-model.md) — overlapping semantic graphs rather than geometry alone.
- [Validity and Obligations](validity-and-obligations.md) — validity dimensions, obligations and legitimate compile claims.
- [Evidence and Provenance Architecture](evidence-and-provenance.md) — evidence classes, scope, lifecycle and selective invalidation.
- [Compiler Targets](compiler-targets.md) — versioned regulatory and normative environments.
- [Structural Semantics](structural-semantics.md) — physical structure, topology and analytical idealisation.
- [Boundary Semantics](boundary-semantics.md) — air, thermal, weather, moisture, fire, acoustic and related boundaries.
- [Interface Obligation Bundles](interface-obligation-bundles.md) — reusable technical obligations created by recurring boundary and interface conditions.

The executable plan slice lives under `compiler/plan-slice/`. Its current supported geometry remains intentionally narrow: rectangular outer shells, orthogonal named planning lines, spaces/voids as unions of axis-aligned rectangles, line boundaries and line-hosted numeric openings.

The structural-topology kernel lives under `compiler/structure-slice/`; the Reference House fixture/adapter lives under `compiler/rhc2/`. It models line supports, span fields, reaction nodes, known floor interruptions, diaphragm ownership, bearing-boundary mappings and qualitative foundation destinations. It is not an analytical frame/FE model.

The service-topology kernel lives under `compiler/service-slice/`; Reference House service authority and interface hardening live under `compiler/rhc3/`. It models semantic nodes, routes, networks, access obligations and registered crossings. It is not an MEP routing, sizing or simulation engine.

## Pattern crosswalk

The crosswalk tested whether House Kernel patterns could inform authoring without being promoted into compiler entities. All 21 active patterns, three strategies and four held candidates were representable through the existing semantic, obligation and evidence architecture at internal mapping scope.

- [Pattern → Computational Crosswalk](pattern-crosswalk-model.md)
- [Service-Topology Pilot](pattern-crosswalk-service-topology-pilot.md)
- [Remaining Active Patterns](pattern-crosswalk-remaining-active.md)
- [Strategies and Held Candidates](pattern-crosswalk-strategies-candidates.md)
- [Implementation Handoff](pattern-crosswalk-implementation-handoff.md)
- [Phase-8 Gate Review](../development/pattern-language-phase8-review.md)

Computational representability does not promote or validate an architectural proposition.

## Relationship to architectural grammar

The architectural-grammar framework and G-01 research are owned by the separate [Architectural Grammar](../grammar/) area. A selected grammar may create relationships or requirements that are useful to represent computationally, but representation does not transfer ownership or authority to this track.

The computational model must remain capable of distinguishing grammar conformance from House Kernel doctrine, technical validity, supported-domain status and project requirements. G-01 is therefore an input that may be checked where formalisation is justified, not a hidden default of the compiler.

RH-C1 localises current G-01-derived opening memberships/order as Reference House fixture data. CF-01 passed a neutral contrast fixture through the same shared plan mechanisms without requiring those memberships. RH-C2 consumes architectural boundaries/openings semantically without promoting G-01 composition into structural doctrine. RH-C3 likewise keeps the selected ASHP, MVHR, PV, courtyard form and service-side geography local to the Reference House fixture.

## Supported H1 research domain

The H1 papers use bounded technical families to test the semantic model. Those families describe the domain in which the research was exercised; they are not universal House Kernel preferences.

Key records include:

- [H1 Capability Matrix v0.5](h1-capability-matrix-v05.md)
- [Structural Assurance Boundary — H1](structural-assurance-boundary-h1-v01.md)
- [H1 Services Target Extension](h1-services-target-extension-v01.md)
- [H1 Passive Environmental Strategy](h1-passive-environmental-strategy-v01.md)
- [H1 Ventilation Decision v0.2](h1-ventilation-strategy-decision-v02.md)
- [Hybrid Stack Ventilation Family](ventilation-family-hybrid-stack-v01.md)
- [cMEV Ventilation Family](ventilation-family-cmev-v01.md)
- [H1 Heating Strategy Decision](h1-heating-strategy-decision-v01.md)
- [ASHP + Radiator Heating Family](heating-family-ashp-radiators-v01.md)

The environmental hierarchy remains **reduce load → passive capability → bounded assistance → fully mechanical response where justified**. The paper work does not establish any ventilation or heating topology as universally superior.

## Paper-compilation record

### S0 — wall-bay scale

S0 established the initial source, obligation and evidence model together with conventional-comparator discipline, interface bundles and a complexity gate.

### S1 — room scale

S1 established the need for explicit evaluation scope and showed that contextual roles are better represented relationally than accumulated indiscriminately on physical entities.

### S2 — connected-cluster scale

S2 established that architectural and technical validity can diverge and that route roles are authored semantics. Its frozen fixture used cMEV; later environmental research does not retrospectively alter that historical run.

### H1-PAPER-01 — bounded whole house

The final internal paper result was:

```text
RESEARCH COMPILE                PASS
WHOLE-HOUSE COMPLEXITY GATE     PROVISIONAL PASS
BUILDING RELEASE                FAIL — EXPECTED
EXTERNAL PROFESSIONAL REVIEW    OPEN
```

The first H1 source contained an impossible dining-to-kitchen adjacency. The paper compile rejected it, and the source was corrected without weakening a family or proof rule. That result motivated machine-enforced source well-formedness in P0.

## External review

The [H1-PAPER External Review Pack v0.2](external-review-pack-h1-paper-v02.md) is prepared for competent attack from structural engineering, building-control/fire practice and building-services/ventilation engineering.

The Reference House has more specific RH-11 review briefs, including [structural](../reference-house/external-review-structural-rh11.md) and MEP/acoustic review. RH-C2 and RH-C3 do not discharge them. Member sizing/stability, service packing/sizing, acoustic/fire performance, commissioning and product questions remain open for competent review.

Preparation of a review pack is not external validation.

## Evidence-selected future fixtures

Several fixtures remain available if another workstream exposes a live uncertainty:

- `EXT-MAINT-01` — exterior maintenance geography;
- `RAIN-XW-01` — rainwater route;
- `KEX-XW-01` — kitchen source capture;
- `WATER-XW-01` — water failure, visible leakage and wet-service rooms;
- `ROOM-XW-01` — room service route and compartmented void;
- `OPEN-XW-01` — openings, movement and thresholds;
- `ATTACH-XW-01` — Controlled Attachment Plane / Replaceable Architectural Lining, preferably after physical W2 evidence.

`HSA-P-012 — Physical Service Index` likewise remains deferred until a real physical-information use case justifies generic identification or correspondence semantics.

These are candidate tests, not a standing implementation queue.

## Scope boundary

The demonstrated kernel does not justify building a polished 3D CAD system, general structural/MEP solver, complete Building Regulations engine, IFC round-tripping, optimisation layer, generative-AI designer or pattern-specific rule library. Those capabilities would require their own architectural and technical case.

Current executable work may now proceed to **RH-C4 only**: add the smallest envelope/boundary view needed to reproduce already-coordinated external/courtyard boundary and junction relationships while preserving the authority boundary established by P0 through RH-C3. Physical prototypes and competent external review proceed independently.

The P0, `PAT-XW-01`, RH-C1, CF-01, RH-C2 and RH-C3 suites remain regression tests and should expand only when new work exposes a concrete model defect or a high-value relationship that benefits from formalisation.

## Programme and provenance

- [RH-C0 — Reference House Model Freeze](reference-house-model-freeze-rhc0.md) — **PASS**, controlled fixture authority established.
- [Reference House executable programme](reference-house-executable-slice.md) — **RH-C1 / RH-C2 / RH-C3 PASS**, deterministic architecture plus bounded structural and service topology established.
- [CF-01 — Compiler Generality Assurance](compiler-generality-assurance-cf01.md) — **PASS**, two-fixture bounded evidence for the shared plan-semantic slice.
- **RH-C4 — envelope / boundary view — NEXT.**
- [P0 + PAT-XW-01 — Executable Gate Result](p0-pat-xw-01-result.md) — retained executable baseline.
- [Research Programme v0.6](research-programme-v06.md) — final pre-executable programme record retained for provenance.
- [H1 Capability Matrix v0.5](h1-capability-matrix-v05.md) — frozen paper-domain capability audit.
- [External Competent Review Pack — H1-PAPER v0.2](external-review-pack-h1-paper-v02.md) — professional-review handoff.

Earlier programme versions and paper-compile runs remain available in the navigation as historical research records.
