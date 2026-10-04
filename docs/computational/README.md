# Computational Track

**Status:** research programme — concept and formalisation only  
**Implementation status:** deliberately deferred

This directory records the computational expression of the Long-Life House.

The architectural doctrine remains primary. The purpose of this track is to discover which parts of that doctrine, together with structure, construction, regulation and evidence, can be represented strongly enough that a house can eventually be **compiled rather than merely drawn and checked afterwards**.

> **The program should compile a habitat.**

## Canonical documents

1. [Executable Architecture](executable-architecture.md)  
   The canonical concept paper: what the proposition is, why a compiler is different from a checker, the intended product form, the proof boundary and the relationship to the architectural doctrine.

2. [Research Programme](research-programme.md)  
   The master programme and grand TODO register. This is the document to consult before starting any new computational work.

3. [Formal Architectural Model](formal-architectural-model.md)  
   First conceptual model of the building as overlapping semantic graphs rather than a collection of geometry.

4. [Architectural Grammar and Proportion](architectural-grammar-and-proportion.md)  
   Defines the layered design-language model: topology, hierarchy, ordering, proportional families, plan/section/elevation coordination, evaluation and controlled exception.

   - [G-01 Research Brief](g01-research-brief.md) — scope, corpus strategy, annotation schema, candidate hypotheses and mutation-testing method for deriving the first Georgian-derived grammar from evidence rather than intuition.
   - [G-01 Corpus and Source-Quality Register](g01-corpus-register.md) — seed corpus, evidence grades, derivation/hold-out split and source-acquisition queue.
   - [G-01 Precedent Annotation Schema](g01-annotation-schema.md) — D3 evidence contract, now validated across three deliberately different cases.
   - [G-01 Trial Case Records](g01-cases/README.md) — completed D3 v0.1 semantic records for Marble Hill, Danson House and 76 Dean Street.
   - [G-01 Topology Comparison](g01-topology-comparison.md) — preliminary D4 comparison of morphology, connectivity, route/sequence, vertical hierarchy and scoped symmetry before dimensional analysis.
   - [G-01 Dimensional and Proportional Analysis](g01-dimensional-analysis.md) — D5 seed dataset and measurement discipline; currently strongest at Danson, deliberately sparse elsewhere.
   - [G-01 Plan / Section / Elevation Coupling](g01-plan-section-elevation-coupling.md) — D6 seed model for directional, attribute-level negotiation between spatial order, façade, section and technical structure.

5. [Validity and Obligations](validity-and-obligations.md)  
   Defines what kinds of validity exist, what a compile failure means, how obligations are discharged and what a successful compile may legitimately claim.

6. [Evidence and Provenance Architecture](evidence-and-provenance.md)  
   Defines evidence classes, scope, lifecycle, future evidence plans, dependency invalidation and release manifests.

7. [Compiler Targets](compiler-targets.md)  
   Defines the versioned regulatory/normative environment against which compilation occurs, beginning conceptually with England.

   - [S0 Compiler Target Snapshot v0.1 — England / 2026-10-03](s0-target-snapshot.md) — immutable target used by Run 01; retained with its known omissions for reproducibility.
   - [S0 Compiler Target Snapshot v0.2](s0-target-snapshot-v02.md) — same normative date, corrected target-model coverage after red-team; adds K, Q, Regulation 7 and broader B/F applicability tests.
   - [S0 Compiler Target Snapshot v0.3](s0-target-snapshot-v03.md) — hardens transitional applicability: an October-2026 application can retain the earlier L/F basis only if the relevant work commences before the March-2028 transition deadline.
   - [S1 Compiler Target Snapshot v0.1](s1-target-snapshot-v01.md) — room-scale target extension adding Part-M Category-1 accessibility, doorway/circulation, service controls and quantitative purge-role tests.

8. [Structural Semantics](structural-semantics.md)  
   Separates physical structure, structural topology and analytical idealisation; defines load-path semantics, proof envelopes and S0 structural obligations.

   - [Structural Assurance Boundary — H1 v0](structural-assurance-boundary-h1-v01.md) — programme decision: native topology/dependency reasoning, with member/connection/stability/foundation adequacy allowed as scoped external engineering evidence in H1 v0.

9. [Boundary Semantics](boundary-semantics.md)  
   Models air, thermal, weather, moisture, fire, acoustic and related boundaries as overlapping first-class graphs with typed transitions and penetrations.

   - [BF-WIN-MCW-01 — Window in Partial-Fill Masonry Cavity Wall](boundary-family-window-masonry-v01.md) — first instantiated boundary-family candidate for weather, moisture, thermal and air continuity.

10. [Supported Domain](supported-domain.md)  
   Defines the compiler competence boundary, Domain S0 for paper compilation, and candidate H1 whole-house scope using conservative technical baselines.

   - [Domain S0 — Paper Compilation Fixture](paper-compilation-s0.md) — exact first manual integration-test specification.
   - [S0 Frozen Source Package](s0-source-package.md) — explicit nominal test geometry, assumptions, boundaries and four frozen mutations.
   - [S0 Paper Compilation Run 01](s0-paper-compile-run-01.md) — first end-to-end manual compile; research model coherent, building release correctly fails on missing proof.
   - [Interface Obligation Bundles](interface-obligation-bundles.md) — Run-01 scaling response: recurring architectural interfaces hide proof complexity behind semantic relationships.
   - [Assembly Composition Test 01](assembly-composition-s0-wall-bay.md) — shows bundles must contribute to shared graphs before canonical obligations are derived; avoids duplicate checklists one abstraction higher.
   - [S0 Run 01 Red Team](s0-red-team-run-01.md) — adversarial pass that finds missed Part K/Q/Regulation 7/B/F obligations, cross-domain window conflicts and target-versioning requirements.
   - [S0-A Conventional Workmanship Route](s0-conventional-workmanship-route.md) — gives the ordinary control explicit datum, acceptance, remediation and evidence semantics without inventing unsupported numerical tolerances.
   - [S0 Complexity Gate](s0-complexity-gate.md) — explicit course guardrail: internal rigor may scale, authoring bureaucracy may not.
   - [S0 Run 02 Source Overlay](s0-source-package-v02.md) — repeats the wall-bay condition twice and adds only the context needed to test scaling and operational-window semantics.
   - [S0 Paper Compilation Run 02](s0-paper-compile-run-02.md) — broader regulatory/semantic coverage with two repeated bays; provisional complexity-gate pass and no release claim.
   - [S1 Research Brief](s1-research-brief.md) — next-scale falsification fixture: a complete ground-floor principal room with corner, two windows, door, floor/ceiling and service route.
   - [S1 Frozen Source Package](s1-source-package.md) — fixed room geometry, multi-role openings/door, service branch, project-order profile and seven mutations.
   - [S1 Paper Compilation Run 01](s1-paper-compile-run-01.md) — room-scale complexity pass; introduces obligation scope and contextual-role warnings while correctly failing release.

11. [Prior Art Map](prior-art-map.md)  
   Initial map of relevant work in IFC/openBIM, machine-readable information requirements, automated compliance checking, ontologies, shape grammars and automated planning.

## Working dependency order

~~~text
ARCHITECTURAL DOCTRINE
        │
        ▼
FORMAL ARCHITECTURAL MODEL
        │
        ├──────────────► ARCHITECTURAL GRAMMAR
        │                        │
        │                        ▼
        │                SUPPORTED-DOMAIN WORK
        │
        ▼
VALIDITY + OBLIGATION MODEL
        │
        ├──────────────► EVIDENCE / PROVENANCE MODEL
        │
        ▼
COMPILER TARGET MODEL
        │
        ▼
SUPPORTED-DOMAIN DEFINITION
        │
        ▼
PAPER COMPILATION OF REFERENCE HOUSE
        │
        ▼
FORMAL GRAMMAR / LANGUAGE DESIGN
        │
        ▼
IMPLEMENTATION
~~~

The arrows are dependencies, not a schedule.

## Current rule

**Do not start implementation because an implementation idea is exciting.**

Before code, the project should be able to answer:

- what things exist in the model;
- what relationships between them matter;
- what is impossible to express;
- what is expressible but invalid;
- what is merely undesirable;
- what obligations a design creates;
- what counts as evidence that an obligation has been discharged;
- what the compiler target means;
- what lies outside the supported domain;
- exactly what a successful compile claims;
- how the claim survives versioning and later alteration.

Until those questions are substantially answered, software would mostly fossilise premature assumptions.
