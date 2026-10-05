# H1-PAPER-01 — Final Internal Red Team

**Status:** final internal adversarial review before pre-implementation freeze  
**Date:** 2026-10-05  
**Scope:** H1-PAPER-01 research brief, corrected frozen source, baseline compile and mutation results  
**External review:** not performed

## 1. Review question

This red team is not asked:

> Can we find enough positive results to justify implementation?

It is asked:

> **Is there any internal evidence that the compiler framing should still be stopped, weakened or subjected to more paper work before software begins?**

The answer after review is:

**no further major internal paper-compilation scale is justified.**

But the result is conditional and several risks remain severe.

## 2. Finding RT-01 — the source itself contained a geometric contradiction

The first frozen H1 source declared a direct G-DIN-01 → G-KIT-01 opening even though the central spine physically separated the two rooms.

The contradiction was caught during the whole-house pass.

The corrected source now:

- shortens/repositions the hall/stair fields within the same central spine;
- gives dining, kitchen and utility real independent adjacency to the rear hall;
- removes the impossible dining→kitchen opening.

No family or proof rule was weakened to preserve the intended result.

This is not a trivial editorial mistake. It exposes a required implementation layer that paper prose can too easily bypass:

**source well-formedness must be mechanically checked before higher-order compilation.**

A future system needs at least:

- non-overlap/containment checks;
- adjacency validation;
- door/opening host validation;
- storey/level consistency;
- relationship geometry consistency.

The compiler cannot trust semantic assertions that contradict geometry.

**Verdict: MODEL STRENGTHENED BY FINDING.**

Do not add a new architectural family. Add a future formal well-formedness/geometry layer.

## 3. Finding RT-02 — the whole-house source is too verbose to be an authoring format

The H1 source package is readable as a research specification but absurd as a future user-facing authoring language.

It explicitly records many roles and consequences because we are manually emulating compilation.

If implementation simply turns these Markdown declarations into forms/JSON, the project will fail its own “Sims player” ambition.

The user should author roughly:

- rooms/massing;
- architectural hierarchy/route intent;
- openings;
- stair;
- supported system choices;
- service-core/plant geography;
- a small set of project/site facts.

The compiler must derive most of the rest.

**Verdict: NOT A PAPER BLOCKER. MAJOR IMPLEMENTATION GUARDRAIL.**

The H1 source is a compiler research IR/specification, not a proposed DSL or UI.

## 4. Finding RT-03 — external evidence is now the dominant release problem

The semantic model no longer lacks ordinary domestic nouns at H1 scale.

Release fails mainly because real external proof is absent:

- structure/foundations;
- ventilation airflow/performance;
- heating design;
- drainage/water design;
- Part L/SAP;
- Part O;
- product/installation evidence;
- fire/building-control review;
- commissioning/as-built evidence.

The future “compiler” could become merely an evidence-orchestration shell around conventional professional work.

That would still have value, but it would be a weaker proposition than an executable building compiler.

The prototype must demonstrate at least some obligations are genuinely discharged natively or by deterministic bounded methods, while others are explicitly external.

If almost everything meaningful becomes `EXTERNAL_EVIDENCE_REQUIRED`, the compiler thesis should be weakened.

**Verdict: SERIOUS RISK — CANNOT BE RESOLVED BY MORE PAPER FAMILY WRITING.**

Needs external reviewers and implementation/prototype evidence.

## 5. Finding RT-04 — hybrid ventilation remains the largest live technical-family uncertainty

VENT-HYBRID-STACK-01 now has:

- credible topology;
- real precedent;
- explicit passive-first rationale;
- bounded assistance semantics;
- honest external proof boundary.

It does not have a competent whole-house airflow/controls/energy/acoustic design for H1-PAPER-01.

A future implementation could accidentally hard-code hybrid ventilation as doctrinally preferred before it has earned that status on real houses.

Implement the environmental hierarchy, not a conclusion that hybrid stack always wins.

The system must be capable of selecting/demoting between:

- hybrid passive stack;
- CMEV;
- MVHR;
- future supported alternatives

based on project/site evidence.

**Verdict: KEEP AS RESEARCH-SUPPORTED TOPOLOGY + EXTERNAL PERFORMANCE PROOF.**

No more internal ventilation theorising is justified before competent building-services analysis.

## 6. Finding RT-05 — fire is too important to leave internally un-attacked by a competent practitioner

The bounded FIRE-H1-2S-EGRESS-01 route composes cleanly in the paper model and responds correctly to mutations.

But the entire route is still authored from internal interpretation of statutory guidance.

A small misunderstanding of applicability, interaction or referenced standards could contaminate a future rule pack while appearing highly precise.

**Verdict: EXTERNAL FIRE/BUILDING-CONTROL REVIEW IS A HARD TRUST GATE.**

It is not a reason for another internal paper compile.

It is a reason not to describe Gate B as professionally validated.

## 7. Finding RT-06 — structural semantics have been tested harder than structural solving

The support graph works well conceptually:

- support lines are explicit;
- spanning direction is explicit;
- openings create dependencies;
- unsupported transfer mutations leave the domain cleanly.

But H1 still outsources member/connection/stability/foundation adequacy.

The apparent simplicity of structural topology may conceal significant solver/model complexity when implemented.

**Verdict: SEMANTIC RESULT STANDS. NATIVE STRUCTURAL SOLVER REMAINS OPTIONAL/FUTURE.**

Do not build a general structural solver as the first implementation milestone.

## 8. Finding RT-07 — site facts are deliberately under-modelled

H1-PAPER is a house-on-an-assumed-site fixture.

Real release depends on facts including:

- ground/geotechnics;
- levels/drainage outfall;
- orientation/exposure;
- noise/pollution;
- relevant boundaries/fire spread;
- planning constraints;
- utilities;
- flood/radon/contamination where applicable.

“Compile a house” can become misleading if the source is treated as site-independent.

**Verdict: EXPLICIT FUTURE INPUT DOMAIN, NOT A REASON TO EXPAND H1-PAPER.**

The first software prototype should use declared fixed site assumptions rather than pretending to solve arbitrary sites.

## 9. Finding RT-08 — rainwater and cooking source capture remain incomplete ordinary systems

H1 deliberately leaves:

- rainwater drainage as partial/external;
- enhanced cooking source capture as represented obligation but not a hardened complete family.

These are real ordinary-house systems.

Should paper work continue until both are hardened?

**No.**

Why:

1. the semantic model already knows they are unresolved obligations;
2. H1-PAPER did not need to invent unsupported PASS states;
3. further family writing would no longer test the central compiler abstraction;
4. these are ideal future extension cases to test whether the implementation architecture genuinely supports new families without schema churn.

**Verdict: PRESERVE AS GRAND TODOs / EARLY IMPLEMENTATION EXTENSION TESTS.**

## 10. Finding RT-09 — family-catalogue risk did not trigger at whole-house scale

The complete house required no new family merely because the source became complete.

Recent families each isolated materially distinct proof/topology routes:

- wet-zone waterproofing;
- envelope penetration;
- hybrid ventilation.

H1 then reused them.

This could still deteriorate during implementation.

Guardrail:

A family earns existence only when it represents:

- a materially different topology;
- a materially different proof/evidence route;
- or a bounded supported-domain extension.

Not merely because a construction detail has a conventional name.

**Verdict: COMPLEXITY ALARM NOT TRIGGERED.**

## 11. Finding RT-10 — one-source composition survived

This remains the strongest result of the entire paper programme.

The same physical entities supported multiple analyses without author duplication.

Examples:

- one window carried architecture + weather + air + thermal + purge + fire roles;
- one entrance carried arrival + access + security + envelope + final-exit roles;
- one service core supported several distinct networks without becoming one meaningless MEP object;
- one penetration contributed independently to multiple boundaries;
- one stair carried architectural, access, structural and fire relationships without becoming a role-bloated stair type.

**Verdict: CENTRAL SEMANTIC PROPOSITION SURVIVES WHOLE-HOUSE PAPER SCALE.**

This is sufficient to justify a minimal executable test.

## 12. Finding RT-11 — selective invalidation survived whole-house scale

Mutation results show that:

- fire can fail while window weathering remains valid;
- air sealing can fail while heating connectivity remains valid;
- product evidence can stale without geometry moving;
- architecture can fail while technical geometry remains plausible;
- maintenance can fail while a network remains operational;
- a structural edit can leave the supported domain without forcing the compiler to guess.

**Verdict: DEPENDENCY/INVALIDATION PROPOSITION SURVIVES.**

This should become one of the first executable prototype tests.

## 13. Finding RT-12 — RESOLVABLE WITHIN FAMILY must remain non-authoritative

The stair/storey-height mutation again makes the concept attractive.

It is useful UX to say:

> a valid solution appears to remain inside the selected family.

But this must never be confused with current validity.

Implementation status model should keep:

- CURRENT VALID;
- CURRENT INVALID;
- UNRESOLVED/UNSUPPORTED

separate from advisory solver states such as:

- CANDIDATE SOLUTION EXISTS;
- RESOLVABLE WITHIN CURRENT FAMILY.

**Verdict: RESEARCH HINT RETAINED, NOT PROMOTED TO RELEASE LATTICE.**

## 14. Finding RT-13 — the compiler thesis has narrowed in a healthy way

At the beginning, “compile a house” risked implying one program would natively solve architecture, structure, MEP, regulation, cost and evidence.

The paper programme has produced a more credible proposition:

> **A bounded semantic authoring/compiler system owns the source model, obligation graph, supported-family logic, dependency/invalidation, target applicability and evidence completeness. It natively resolves what is deterministic inside its competence and requires scoped external proof for the rest.**

That is less magical and more useful.

**Verdict: KEEP THE COMPILER LANGUAGE, BUT KEEP ITS PROOF BOUNDARY EXPLICIT.**

## 15. Complexity-gate red team

### Does internal rigor scale?

So far: **yes, provisionally.**

### Does authoring bureaucracy scale?

Paper source itself is verbose, but the semantic input set remains bounded.

Future UI must prove this in software.

### Did whole-house scale require duplicate discipline models?

**No.**

### Did whole-house scale require uncontrolled new families?

**No.**

### Did mutations produce intelligible scoped consequences?

**Yes.**

### Did the model hide missing proof?

**No, in the paper run.**

### Complexity verdict

**PASS — WITH IMPLEMENTATION RISK STILL HIGH.**

## 16. Stop/continue decision

The internal paper programme has now extracted the information it can reasonably extract without code, professional external attack or physical evidence.

Another paper scale would have diminishing returns.

Do not create:

- S3;
- H2-PAPER;
- a larger family catalogue;
- a general MEP ontology;
- a full regulations transcription;
- a speculative geometry-solver architecture

before the next evidence source changes.

## 17. Recommended next evidence sequence

### A — competent external review

Update the review handoff to include H1-PAPER and ask at minimum:

- structural engineer: attack SAB-H1-01, load/support assumptions and evidence boundary;
- building-control/fire practitioner: attack target/applicability/fire/access assumptions;
- building-services/ventilation engineer: attack passive-first/hybrid strategy and service evidence boundary.

### B — minimal executable vertical slice

Implementation may begin only as a falsification prototype, not a production compiler.

The first slice should prove:

1. semantic source entities + relationships;
2. simple deterministic geometry/well-formedness;
3. obligations derived from relationships;
4. scoped evidence objects;
5. selective invalidation;
6. supported/unsupported distinction;
7. intelligible author-facing errors.

Use deliberately simple geometry.

Do not begin with:

- polished 3D CAD;
- general geometry kernel;
- general structural solver;
- full Building Regulations rule pack;
- IFC round-tripping;
- generative AI design;
- optimisation engine.

Those can follow only if the semantic vertical slice earns them.

### C — one physical/product prototype

A junction/penetration/wet-zone/service-access mock-up would provide a qualitatively different test of whether the doctrine/evidence model survives workmanship and physical sequence.

## 18. Final internal verdict

### Should the compiler project be abandoned before implementation?

**NO.**

### Should the project continue doing major paper compiler research first?

**NO.**

### Has professional/technical validity been established?

**NO.**

### Has the concept earned a minimal executable prototype and external attack?

**YES.**

The correct next move is therefore not “design more compiler on paper”.

It is:

> **freeze the paper model, expose it to competent practitioners, and implement the smallest vertical slice capable of falsifying the central mechanism.**
