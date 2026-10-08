# Computational Track

The computational track asks a narrow question within House Systems Architecture: **which building relationships can be represented strongly enough that invalid arrangements, unresolved obligations or missing evidence are exposed during authoring rather than discovered later in drawings or construction?**

It is subordinate to the architecture. Rooms, walls, openings, structure, boundaries, service routes and maintenance paths may be represented semantically where doing so creates a useful check, but architectural judgement is not converted into arbitrary machine rules merely to make the model more complete.

The paper-compilation programme, Phase-8 pattern crosswalk, P0 executable kernel and `PAT-XW-01` executable crosswalk are complete at their stated internal scopes. Generic compiler growth is now frozen. Further executable work is justified only where architectural, physical or professional-review work exposes a concrete question worth formalising.

## What has been established

The research sequence progressed from wall-bay scale to a bounded whole-house paper model, then into the minimal executable kernel:

```text
S0 → S1 → S2 → H1-PAPER-01
                     ↓
          Phase-8 pattern crosswalk
                     ↓
              P0 executable kernel
                     ↓
                 PAT-XW-01
```

Within those scopes, the work established that:

- semantic identity, typed relationships, obligations and scoped evidence can remain coherent from assembly to bounded whole-house scale;
- the canonical pattern language can provide project provenance without becoming a second compiler ontology;
- project requirements and technical validity can diverge cleanly;
- technical obligations can derive from composed building relationships rather than from pattern identity;
- evidence can be scoped and invalidated selectively rather than treated as a global PASS/FAIL state;
- simple source and geometry well-formedness can be checked deterministically;
- architectural commitments can remain valid while a dependent technical obligation becomes unresolved.

The executable result is recorded in [P0 + PAT-XW-01 — Executable Gate Result](p0-pat-xw-01-result.md): 17 P0 tests and six pattern-crosswalk tests pass in the ordinary CI path.

These results do **not** establish that a building or assembly is structurally, environmentally or regulatorily adequate. Building release remains outside the demonstrated scope, and competent external review is still required.

## Authority boundary

The computational model has a deliberately limited authority.

- **A pattern is not a compiler primitive.**
- **Pattern provenance is not technical authority.**
- **Representability is not evidence of adequacy.**
- **A research compile is not a building-release certificate.**
- **Architectural judgement remains architectural where no legitimate deterministic rule exists.**

The useful object is therefore not a universal rule engine but a model that can make selected relationships explicit, derive obligations from them, attach evidence at the right scope and refuse claims the available evidence cannot support.

## Core model

- [Executable Architecture](executable-architecture.md) — proposition, compiler/checker distinction, bounded domain and proof boundary.
- [Formal Architectural Model](formal-architectural-model.md) — overlapping semantic graphs rather than geometry alone.
- [Validity and Obligations](validity-and-obligations.md) — validity dimensions, obligations and legitimate compile claims.
- [Evidence and Provenance Architecture](evidence-and-provenance.md) — evidence classes, scope, lifecycle and selective invalidation.
- [Compiler Targets](compiler-targets.md) — versioned regulatory and normative environments.
- [Structural Semantics](structural-semantics.md) — physical structure, topology and analytical idealisation.
- [Boundary Semantics](boundary-semantics.md) — air, thermal, weather, moisture, fire, acoustic and related boundaries.
- [Interface Obligation Bundles](interface-obligation-bundles.md) — reusable technical obligations created by recurring boundary and interface conditions.

## Pattern crosswalk

The crosswalk tested whether HSA patterns could inform authoring without being promoted into compiler entities. All 21 active patterns, three strategies and four held candidates were representable through the existing semantic, obligation and evidence architecture at internal mapping scope.

- [Pattern → Computational Crosswalk](pattern-crosswalk-model.md)
- [Service-Topology Pilot](pattern-crosswalk-service-topology-pilot.md)
- [Remaining Active Patterns](pattern-crosswalk-remaining-active.md)
- [Strategies and Held Candidates](pattern-crosswalk-strategies-candidates.md)
- [Implementation Handoff](pattern-crosswalk-implementation-handoff.md)
- [Phase-8 Gate Review](../development/pattern-language-phase8-review.md)

Computational representability does not promote or validate an architectural proposition.

## Architectural grammar

[Architectural Grammar and Proportion](architectural-grammar-and-proportion.md) defines a generic grammar framework separate from HSA doctrine. G-01 is one Georgian-derived domestic grammar selected for the Reference House.

Current G-01 research includes:

- [G-01 Grammar Charter](g01-grammar-charter.md)
- [G-01 Research Brief](g01-research-brief.md)
- [G-01 Corpus and Source-Quality Register](g01-corpus-register.md)
- [G-01 Precedent Annotation Schema](g01-annotation-schema.md)
- [G-01 Trial Cases](g01-cases/README.md)
- [G-01 Topology Comparison](g01-topology-comparison.md)
- [G-01 Dimensional and Proportional Analysis](g01-dimensional-analysis.md)
- [G-01 Plan / Section / Elevation Coupling](g01-plan-section-elevation-coupling.md)
- [G-01 Candidate Constraint Register](g01-candidate-constraints-v01.md)

The framework has been exercised, but G-01 remains research-incomplete and has not been externally validated. No universal room-ratio rule has been established.

## Supported H1 research domain

The H1 papers use bounded technical families to test the semantic model. Those families describe the domain in which the research was exercised; they are not universal HSA preferences.

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

The demonstrated kernel does not justify building a polished 3D CAD system, general structural solver, complete Building Regulations engine, IFC round-tripping, optimisation layer, generative-AI designer or pattern-specific rule library. Those capabilities would require their own architectural and technical case.

Current project effort is therefore concentrated on Reference House coordination, physical prototypes, engineering, passive-first environmental work and competent external review. The P0 and `PAT-XW-01` suites remain as regression tests and should expand only when new work exposes a concrete model defect or a high-value relationship that benefits from formalisation.

## Programme and provenance

- [P0 + PAT-XW-01 — Executable Gate Result](p0-pat-xw-01-result.md) — current executable result.
- [Research Programme v0.6](research-programme-v06.md) — final pre-executable programme record retained for provenance.
- [H1 Capability Matrix v0.5](h1-capability-matrix-v05.md) — frozen paper-domain capability audit.
- [External Competent Review Pack — H1-PAPER v0.2](external-review-pack-h1-paper-v02.md) — professional-review handoff.

Earlier programme versions and paper-compile runs remain available in the navigation as historical research records.
