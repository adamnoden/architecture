# Computational Track

**Status:** internal paper-compilation phase complete; external review + minimal executable falsification prototype next  
**Heavy implementation status:** deliberately gated

This directory records the computational expression of the Long-Life House.

The architectural doctrine remains primary. The computational question is narrower: **which parts of that doctrine, together with structure, construction, regulation and evidence, can be represented strongly enough that invalid relationships are rejected during authoring or compilation rather than discovered only after drawing?**

The ambition is not “CAD that knows more rules”. It is a semantic model in which rooms, walls, openings, structure, boundaries, service routes and maintenance paths carry enough meaning to generate and discharge explicit obligations.

> **The program should compile a habitat.**

## Current position

The internal paper sequence is complete:

**S0 → S1 → S2 → H1-PAPER-01 → final red team → capability freeze.**

The result is deliberately mixed:

- the semantic / obligation / evidence abstraction survives whole-house paper scale;
- building release still fails because competent technical and physical evidence is absent;
- professional external review remains open;
- no further major paper-compilation scale is authorised;
- a **minimal executable vertical slice** is authorised as a falsification prototype;
- a heavy CAD/compiler product build is **not** authorised;
- post-freeze doctrine changes must receive explicit coverage audits so doctrine and compiler cannot drift silently apart.

Current programme control: [Research Programme v0.5](research-programme-v05.md)  
Frozen H1 capability audit: [H1 Capability Matrix v0.5](h1-capability-matrix-v05.md)  
Current doctrine delta: [Computational Doctrine Delta 01 — External Maintenance Geography](doctrine-delta-external-maintenance-v01.md)  
Current external-review handoff: [External Competent Review Pack — H1-PAPER v0.2](external-review-pack-h1-paper-v02.md)

## Canonical documents

### 1. [Executable Architecture](executable-architecture.md)

Canonical concept paper: proposition, compiler/checker distinction, bounded domain, proof boundary, product form and relationship to the architectural doctrine.

### 2. [Research Programme v0.5](research-programme-v05.md)

**Current programme-control layer.** It inherits the v0.4 stop rules and transition programme, then adds post-H1 doctrine-sync discipline and the external-maintenance extension fixture.

Historical programme layers remain provenance:

- [v0.4](research-programme-v04.md) — H1 paper phase frozen; external review + minimal kernel next;
- [v0.3](research-programme-v03.md) — H1-PAPER authorised;
- [v0.2](research-programme-v02.md) — post-S2/passive-environment correction;
- [v0.1](research-programme.md) — original workstream map and grand-TODO register.

### 3. [Formal Architectural Model](formal-architectural-model.md)

Models the building as overlapping semantic graphs rather than a collection of geometry.

### 4. [Architectural Grammar and Proportion](architectural-grammar-and-proportion.md)

Models design language through topology, hierarchy, ordering, proportional families, plan/section/elevation coordination, evaluation and controlled exception.

Supporting G-01 work:

- [G-01 Research Brief](g01-research-brief.md)
- [G-01 Corpus and Source-Quality Register](g01-corpus-register.md)
- [G-01 Precedent Annotation Schema](g01-annotation-schema.md)
- [G-01 Trial Case Records](g01-cases/README.md)
- [G-01 Topology Comparison](g01-topology-comparison.md)
- [G-01 Dimensional and Proportional Analysis](g01-dimensional-analysis.md)
- [G-01 Plan / Section / Elevation Coupling](g01-plan-section-elevation-coupling.md)
- [G-01 Candidate Constraint Register](g01-candidate-constraints-v01.md)

The pilot grammar machinery has been tested. **G-01 itself is not validated**, and no universal room-ratio rule is promoted.

### 5. [Validity and Obligations](validity-and-obligations.md)

Defines validity dimensions, compile failure, obligation discharge and what a successful compilation may legitimately claim.

### 6. [Evidence and Provenance Architecture](evidence-and-provenance.md)

Defines evidence classes, scope, lifecycle, future evidence plans, dependency invalidation and release manifests.

- [External Evidence Trial 01 — Mapeguard WP](external-evidence-trial-mapeguard-wp-v01.md) — first structured real product/system-evidence test; demonstrates applicability, scope and selective invalidation without turning manufacturer evidence into whole-building proof.

### 7. [Compiler Targets](compiler-targets.md)

Defines versioned regulatory and normative environments, beginning with England.

- [S0 Target v0.1](s0-target-snapshot.md)
- [S0 Target v0.2](s0-target-snapshot-v02.md)
- [S0 Target v0.3](s0-target-snapshot-v03.md)
- [S1 Target v0.1](s1-target-snapshot-v01.md)

The target model keeps legal requirements, statutory guidance/compliance routes, standards, product evidence and project/doctrine requirements distinct.

### 8. [Structural Semantics](structural-semantics.md)

Separates physical structure, structural topology and analytical idealisation.

- [Structural Assurance Boundary — H1 v0](structural-assurance-boundary-h1-v01.md) — topology, applicability and dependency are native; member, connection, stability and foundation adequacy may remain scoped external evidence in H1 v0.

### 9. [Boundary Semantics](boundary-semantics.md)

Models air, thermal, weather, moisture, fire, acoustic and related boundaries as overlapping first-class graphs.

Supported/research families include:

- [BF-WIN-MCW-01 — Window / masonry wall](boundary-family-window-masonry-v01.md)
- [BF-CORNER-MCW-01 — External masonry corner](boundary-family-external-masonry-corner-v01.md)
- [BF-GF-MCW-01 — Ground floor / masonry wall perimeter](boundary-family-ground-floor-masonry-v01.md)
- [PEN-ENV-01 — Controlled service penetration](boundary-family-controlled-penetration-v01.md) — typed transitions across independent weather, cavity/moisture, air, thermal and maintenance obligations;
- [WZ-BSM-01 — Bonded sheet-membrane wet zone](wet-zone-family-bonded-sheet-v01.md) — waterproof boundary, corners, drain and penetrations treated as a system rather than assuming “tiles are waterproof”.

### 10. Supported Domain / H1

Frozen audit:

- [H1 Capability Matrix v0.5 — Post-H1-PAPER Freeze](h1-capability-matrix-v05.md)

Post-freeze qualification:

- [Doctrine Delta 01 — External Maintenance Geography](doctrine-delta-external-maintenance-v01.md) — H1 demonstrated internal/service maintenance validity; exterior scaffold/site logistics are representable in principle but not yet demonstrated.

Historical audits:

- [v0.4 — Pre-H1-PAPER Freeze](h1-capability-matrix-v04.md)
- [v0.3 — Post-S2 / Environmental Correction](h1-capability-matrix-v03.md)
- [v0.2 — Post-Services](h1-capability-matrix-v02.md)
- [v0.1 — Post-S1](h1-capability-matrix-v01.md)

Key H1 families and decisions:

- [RF-TRUSS-DUO-01 — Simple duo-pitched trussed-rafter roof](roof-family-trussed-duopitch-v01.md)
- [ST-PRIVATE-01 — Private timber stair](stair-family-private-v01.md)
- [ENTR-DOOR-MCW-01 — Principal external doorset](entrance-family-principal-masonry-v01.md)
- [FIRE-H1-2S-EGRESS-01 — Two-storey escape-window fire route](fire-family-two-storey-egress-v01.md)
- [WET-CORE-01 — Clustered wet core](wet-service-family-core-v01.md)
- [SR-ROOM-LOW-01 — Accessible low-level room service route](service-family-room-low-level-v01.md)
- [H1 Services Target Extension](h1-services-target-extension-v01.md)

## Environment / ventilation

- [H1 Passive Environmental Strategy](h1-passive-environmental-strategy-v01.md) — reduce load → passive capability → bounded assistance → fully mechanical response where justified.
- [H1 Ventilation Decision v0.1](h1-ventilation-strategy-decision-v01.md) — historical CMEV-first decision.
- [H1 Ventilation Decision v0.2](h1-ventilation-strategy-decision-v02.md) — current passive-first/hybrid research posture.
- [VENT-HYBRID-STACK-01](ventilation-family-hybrid-stack-v01.md) — research-supported topology; competent whole-house performance proof remains external.
- [Hybrid Ventilation Evidence Trial 01](h1-hybrid-ventilation-evidence-trial-v01.md) — feasibility/evidence-boundary trial, not a performance certificate.
- [VENT-CMEV-01](ventilation-family-cmev-v01.md) — supported fallback and historical S2 family.

MVHR remains a legitimate higher-complexity alternative. No paper result establishes hybrid ventilation as universally superior.

## Heating

- [H1 Heating Strategy Decision](h1-heating-strategy-decision-v01.md)
- [HEAT-ASHP-RAD-01 — ASHP + low-temperature radiators](heating-family-ashp-radiators-v01.md)

Heating topology is research-supported. Real heat loss, plant/emitter sizing, hydraulics, controls and commissioning remain external.

## Paper-compilation record

### S0 — wall-bay scale

- [Domain S0 — Paper Compilation Fixture](paper-compilation-s0.md)
- [S0 Frozen Source Package](s0-source-package.md)
- [S0 Paper Compilation Run 01](s0-paper-compile-run-01.md)
- [Interface Obligation Bundles](interface-obligation-bundles.md)
- [Assembly Composition Test 01](assembly-composition-s0-wall-bay.md)
- [S0 Run 01 Red Team](s0-red-team-run-01.md)
- [S0-A Conventional Workmanship Route](s0-conventional-workmanship-route.md)
- [S0 Complexity Gate](s0-complexity-gate.md)
- [S0 Run 02 Source Overlay](s0-source-package-v02.md)
- [S0 Paper Compilation Run 02](s0-paper-compile-run-02.md)

### S1 — room scale

- [S1 Research Brief](s1-research-brief.md)
- [S1 Frozen Source Package](s1-source-package.md)
- [S1 Paper Compilation Run 01](s1-paper-compile-run-01.md)

Finding: evaluation scope must be explicit; contextual roles should remain relational rather than accumulating on physical-entity schemas.

### S2 — connected-cluster scale

- [S2 Research Brief](s2-research-brief.md)
- [S2 Frozen Source Package](s2-source-package.md)
- [S2 Paper Compilation Run 01](s2-paper-compile-run-01.md)

Findings: architectural and technical validity can diverge; route roles are authored semantics; `RESOLVABLE WITHIN CURRENT FAMILY` is useful only as a non-release advisory state.

S2 remains a frozen historical run using CMEV. Later environmental research does not rewrite that record.

### H1-PAPER-01 — complete bounded house

- [H1-PAPER Research Brief](h1-paper-research-brief.md)
- [H1-PAPER Corrected Frozen Source](h1-paper-source-package.md)
- [H1-PAPER Run 01](h1-paper-compile-run-01.md)
- [H1-PAPER Final Internal Red Team](h1-paper-final-red-team.md)

Result:

~~~text
RESEARCH COMPILE                PASS
WHOLE-HOUSE COMPLEXITY GATE     PROVISIONAL PASS
BUILDING RELEASE                FAIL — EXPECTED
EXTERNAL PROFESSIONAL REVIEW    OPEN
~~~

The initial H1 source contained an impossible dining→kitchen adjacency. The whole-house pass caught it; the source was corrected without weakening a family or proof rule. This is direct evidence that **machine-enforced source well-formedness belongs in the first implementation milestone**.

## Post-freeze doctrine deltas

Material doctrine additions after H1 require explicit computational coverage audits before the compiler can claim to cover them.

Current delta:

1. [External Maintenance Geography](doctrine-delta-external-maintenance-v01.md) — semantic architecture passes; H1 demonstration is partial; `EXT-MAINT-01` is authorised as a post-kernel executable extension fixture.

## External review

Historical pack:
- [S0/S1/H1 Review Pack v0.1](external-review-pack-s0-s1-h1-v01.md)

Current pack:
- [H1-PAPER External Review Pack v0.2](external-review-pack-h1-paper-v02.md)

Minimum external attack is requested from:

- structural engineer;
- building-control/fire/regulatory practitioner;
- building-services/ventilation engineer.

Preparing a review pack is not validation.

## Current development sequence

1. **Freeze major paper expansion** — complete.
2. Obtain competent external attack using the H1-PAPER review pack.
3. Implement the **minimal executable semantic/compiler vertical slice** defined in [Research Programme v0.5](research-programme-v05.md).
4. Test machine-enforced source well-formedness, obligation derivation, evidence scope and selective invalidation.
5. After the kernel succeeds, run doctrine-driven extension fixtures beginning with **EXT-MAINT-01 external maintenance geography**.
6. Perform one small physical/product prototype where doctrine meets workmanship.
7. Incorporate only evidence-driven paper corrections.
8. Decide whether the result earns heavier geometry, CAD, solver and product architecture.

## Working dependency order after H1

~~~text
ARCHITECTURAL DOCTRINE
        │
        ▼
PAPER SEMANTIC / OBLIGATION / EVIDENCE MODEL
        │
        ▼
H1-PAPER COMPLETE-HOUSE TEST
        │
        ├────────────► EXTERNAL COMPETENT ATTACK
        │
        ├────────────► PHYSICAL / PRODUCT PROTOTYPE
        │
        ▼
MINIMAL EXECUTABLE COMPILER KERNEL
        │
        ▼
DOCTRINE-DELTA EXTENSION FIXTURES
        │
        ▼
FALSIFICATION / RED TEAM
        │
        ▼
ONLY THEN: HEAVIER CAD / SOLVERS / RULE PACKS / PRODUCT
~~~

## Current rule

**Permission to prototype the kernel is not permission to build the full product.**

The first executable milestone uses deliberately simple geometry to test:

- semantic identity;
- typed relationships;
- geometric well-formedness;
- obligation derivation;
- evidence scope;
- selective invalidation;
- supported/unsupported distinction;
- intelligible diagnostics;
- deterministic reproducibility.

Do **not** begin with polished 3D CAD, a general structural solver, a full Building Regulations engine, IFC round-tripping, optimisation or generative-AI design. Those capabilities must be earned by the compiler kernel and external review.
