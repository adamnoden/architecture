# Domain S0 — Paper Compilation Run 02

**Run ID:** S0-RUN-02  
**Source:** [S0 Run 02 Source Overlay v0.2](s0-source-package-v02.md) over [S0 Frozen Source Package v0.1](s0-source-package.md)  
**Target:** [T-ENG-NDW-2026-10-03-S0-03](s0-target-snapshot-v03.md)  
**Boundary family:** [BF-WIN-MCW-01](boundary-family-window-masonry-v01.md)  
**Structural assurance:** [SAB-H1-01](structural-assurance-boundary-h1-v01.md)  
**Complexity gate:** [S0 Complexity Gate](s0-complexity-gate.md)  
**Variant:** S0-A conventional control  
**Date:** 2026-10-03  
**Implementation:** manual paper compilation

## 1. Headline result

### Research compile

**PASS — STRONGER THAN RUN 01**

Run 02 represents:

- two repeated bays instead of one;
- broader regulatory coverage;
- operational window semantics;
- target-transition dependency;
- one reusable wall/window boundary family;
- an explicit structural-assurance boundary;
- conventional workmanship semantics;
- grouped author-facing issues.

The model became more complete **without requiring the author to manually create more rule/check objects**.

### Building release

**FAIL — EXPECTED**

The run still lacks real:

- structural engineer evidence;
- selected window/product evidence;
- wall U-value/junction evidence;
- exposure/relevant-boundary site context;
- final fall-protection/safety-glazing solution;
- purge/opening performance;
- numeric product/tolerance envelopes.

The release failure is correct.

## 2. What changed from Run 01

Run 01 asked:

> can one architectural junction survive end-to-end obligation/evidence reasoning?

Run 02 asks:

> can the model become more complete and repeat itself without the user's burden scaling with internal rule count?

The second question is the more important complexity test.

## 3. Target compile

Frozen inputs:

- application: 2026-10-03;
- non-HRB;
- hypothetical commencement: 2027-09-01.

Target v0.3 therefore resolves the transitional L/F branch to the pre-2027 route for this test.

**TARGET APPLICABILITY: PASS for the frozen Run-02 assumption**

Important dependency retained:

- if commencement moves beyond the transitional deadline, L/F target applicability becomes stale.

The target is no longer treated as timeless metadata.

## 4. Occurrence/family compile

B01 and B02 reference the same:

- wall family;
- boundary family;
- floor/wall interface family;
- workmanship process model;
- structural assurance policy.

Those definitions exist once.

The second bay adds:

- occurrences;
- geometry;
- quantities;
- occurrence-specific future inspection points.

It does **not** require a second definition of:

- Part K;
- Part C cavity logic;
- Part L air-boundary logic;
- structural-assurance semantics;
- workmanship semantics.

**CG-04 KNOWLEDGE REUSE: PASS**

## 5. Boundary-family compile

BF-WIN-MCW-01 contributes the same family knowledge to both window/wall occurrences.

### Host geometry

Both occurrences fit the family geometrically.

**PASS**

### Residual cavity

50 mm nominal residual cavity.

**GEOMETRIC ROUTE: PASS**

### Wind-driven-rain exposure

Unknown project/site input.

The compiler derives one shared project-context issue:

> **Site envelope context unresolved — wind-driven-rain exposure required for 2 wall/window occurrences.**

It does not create two identical author tasks.

**DEFAULT ISSUE GROUPING: PASS**

### Air boundary

Both windows contribute transitions to one elevation/room-side air-boundary model.

Semantic topology:

**PASS**

Product/material evidence:

**UNRESOLVED**

### Thermal

Two window areas and opaque wall areas are derived.

Wall/window/junction performance:

**UNRESOLVED**

Again, the family knowledge is shared while occurrence geometry remains distinct.

## 6. Window operational/safety compile

Both windows have:

- 750 mm sill;
- ordinary openable intent;
- exterior fall context 3.3 m;
- candidate purge role at room level;
- no final product.

Target v0.3 therefore generates the relevant K/F/B applicability questions.

### Fall protection

Low sill/openable condition requires a protection strategy.

**UNRESOLVED**

### Critical glazing

Glazing enters the critical low-level zone.

**PRODUCT / SAFETY-GLAZING EVIDENCE REQUIRED**

### Purge ventilation

R01 is habitable and nominates the window set as a candidate purge route.

Missing:

- full room floor area;
- opening mechanism;
- effective openable area/angle.

**UNRESOLVED**

### Emergency egress

Whole-house fire strategy absent.

**APPLICABILITY UNRESOLVED**

### Security

Run-02 exterior-access assumption says neither window is easily accessible from outside.

**Q WINDOW ROUTE: NOT APPLICABLE on frozen test facts**

### Default author-facing issue

The internal child states above are grouped as:

> **Window operational/safety strategy unresolved — affects 2 windows: fall protection, safety glazing, purge performance and possible escape role.**

Expert expansion exposes every child obligation.

**CG-05 ACTION GROUPING: PASS**

## 7. External-fire-spread contribution

Two openings contribute:

**4.32 m² total opening area**

to the represented elevation fragment.

Relevant-boundary distance remains unknown.

Therefore:

**B4: UNRESOLVED AT ELEVATION/SITE SCALE**

Default issue is grouped with the missing site context rather than repeated per window.

This demonstrates:

- local occurrences contributing to a higher-scale obligation;
- no manually authored aggregate rule.

**CG-03 COMPOSITION: PASS**

## 8. Structural compile under SAB-H1-01

### Native topology

For each bay:

- floor support relationship represented;
- restraint role represented;
- opening head-support obligation represented;
- side-pier load path represented;
- P01 represented in B01's right pier.

Across the two bays:

**STRUCTURAL TOPOLOGY: PASS**

### Member/connection adequacy

No engineer evidence is fabricated.

One scoped future structural package may cover both repeated conditions if its evidence envelope explicitly does so.

Current result:

**PASS ROUTE / EXTERNAL EVIDENCE REQUIRED**

Default author-facing issue:

> **Structural engineering evidence required — repeated floor/wall and opening conditions currently cover 2 bays.**

No duplicated author task is created merely because the detail repeats.

## 9. Regulation 7 / workmanship compile

The conventional workmanship process model now applies to both bays.

### Process semantics

- datum;
- incoming condition;
- acceptance;
- adjustment;
- remediation;
- hold point;
- evidence phase

are explicit.

**PROCESS MODEL: PASS**

### Numeric/product envelopes

Still unknown until actual:

- window/interface;
- hanger;
- finish;
- cavity/insulation systems

are selected.

**UNRESOLVED**

Default issue:

> **Technical acceptance envelopes incomplete — resolve with selected products/specification before release.**

This is different from saying ordinary construction fails.

## 10. Default author-facing issue surface

At baseline, despite two bays and broader target coverage, the ordinary author can be shown approximately these **five resolution actions**:

1. **Site/envelope context required**  
   Wind-driven-rain exposure + relevant-boundary/elevation context.

2. **Window operational/safety strategy unresolved — 2 occurrences**  
   Fall protection, safety glazing, purge performance, escape applicability.

3. **Select/evidence supported wall-window implementation — 2 occurrences**  
   Window product, Uw, fixing, closer, weather/air/thermal interface evidence.

4. **Structural engineering evidence required — repeated condition covers 2 bays**  
   Floor/hanger, opening head, masonry/support scope.

5. **Technical acceptance envelopes incomplete**  
   Product-specific tolerances / installation evidence required before release.

Internally these expand into substantially more obligations.

The user does not author those obligations.

## 11. Complexity-gate audit

### CG-01 no manual obligation authoring

**PASS**

### CG-02 one authoritative fact

Opening dimensions, sill heights, wall layers and context values are authored once per appropriate scope.

Derived views consume them.

**PASS**

### CG-03 composition before obligations

Boundary/structural contributions compose before canonical cross-interface obligations.

**PASS**

### CG-04 occurrences are cheap

B02 reused family/target/doctrine knowledge.

**PASS**

### CG-05 group by resolution action

Repeated/common deficiencies collapse into shared decisions.

**PASS — PAPER MODEL**

### CG-06 selective invalidation

Tested below.

**PASS**

### CG-07 shared evidence

The model permits one family-level item or engineer evidence package to cover several occurrences if scope supports them, while installation evidence remains occurrence-level.

**PASS conceptually**

### CG-08 expert inspectability

Every grouped issue retains child obligation/authority/evidence structure.

**PASS conceptually**

### Overall

**S0 COMPLEXITY GATE: PROVISIONAL PASS**

This is not a whole-house pass.

## 12. Mutation C-M2 — obstruct WIN02 withdrawal only

Add fixed joinery into WIN02's withdrawal volume.

### Result

B02:

**MAINTENANCE / REPLACEMENT: FAIL**

B01:

**UNCHANGED**

Shared family issues:

**UNCHANGED**

Default issue surface gains one local action:

> **WIN02 replacement clearance blocked.**

It does not duplicate all window-family issues.

**SELECTIVE LOCALITY: PASS**

## 13. Mutation C-M3 — widen only B02 opening

Change B02:

1200 → 1800 mm.

Derived opening total:

- B01 = 2.16 m²;
- B02 = 3.24 m²;
- represented elevation total = **5.40 m²**.

### Re-evaluate locally for B02

- head-support evidence;
- residual-pier evidence;
- window product fit;
- weather/air/thermal transitions;
- quantities;
- future G-01 opening relation.

### Re-evaluate at higher scale

- B4 elevation opening aggregate.

### B01 local state

Remains current unless shared product/family evidence has a parameter envelope that the changed occurrence leaves.

**SELECTIVE INVALIDATION: PASS**

This is a stronger test than Run 01 because local and aggregate consequences happen together.

## 14. Mutation C-M4 — miss the L/F transition deadline

Change hypothetical commencement:

2027-09-01 → 2028-04-01.

### Source geometry

Unchanged.

### Target applicability

The frozen previous-standard L/F branch is no longer valid under the v0.3 transition model.

Generate one project-level action:

> **Regulatory target migration required — Part L/F basis no longer valid for recorded commencement.**

### Stale

- L/F target-dependent evidence/rules;
- affected thermal/ventilation compliance conclusions.

### Remain current unless separately dependent

- structural topology;
- external structural evidence not tied to L/F;
- doctrine;
- quantities;
- maintenance geometry.

**TARGET-DEPENDENCY INVALIDATION: PASS**

## 15. Mutation C-M5 — select one shared window family

Assume a future supported window family is chosen for both WIN01 and WIN02.

One family-level selection may supply shared evidence for:

- Uw;
- safety glazing capability;
- frame/material class;
- hardware family;
- product performance,

within its scope.

Occurrence-specific evidence remains required for:

- measured opening;
- installation/fixing occurrence;
- air/weather seals;
- physical inspection.

### Complexity result

The same product decision can resolve several shared issue children across two windows.

It does not erase occurrence evidence.

**SHARED-EVIDENCE SCOPING: PASS**

## 16. Comparison with Run 01

Run 02 knows materially more:

- K;
- Q;
- Regulation 7;
- B1/B4 context;
- room-level purge contribution;
- target transition dependency;
- operational window roles;
- reusable boundary family;
- repeated occurrences;
- explicit structural-assurance boundary.

Yet the ordinary author still deals primarily with:

- meaningful source/context;
- family selection;
- a handful of unresolved decisions.

That is the exact direction we wanted.

## 17. What Run 02 did not prove

- whole-house complexity remains unknown;
- the five default issue groups are a paper UX model, not a tested interface;
- external engineer evidence scoping has not been exercised with a real engineer;
- BF-WIN-MCW-01 still lacks selected products/exposure;
- target coverage is still partial;
- G-01 is not yet executable;
- no software graph engine has been implemented.

## 18. Complexity alarm status

### Obligation explosion

**CONTAINED PROVISIONALLY**

The internal model grows, but repeated occurrences do not force repeated author decisions.

### Duplicate truth

**NO ALARM in paper model**

### Broad invalidation

**NO ALARM in tested mutations**

### Unsupported-domain pressure

**NOT YET TESTED AT HOUSE SCALE**

### Expert opacity

**NO ALARM conceptually**, because grouped issues remain expandable.

## 19. Programme consequence

Run 02 is enough to stop iterating S0 for its own sake.

Do **not** create Run 03 immediately.

The next scaling test should occur at a larger architectural unit.

Recommended next computational milestone:

> **S1 — one complete room / two-wall corner / floor / ceiling / two windows / door / service route**, using the same family/graph/issue-grouping machinery.

This should be large enough to introduce:

- corner boundary continuity;
- multiple openings;
- room-level ventilation;
- interior/exterior interfaces;
- more realistic maintenance conflicts;
- architectural-order input;

without jumping directly to a whole house.

If S1 causes authoring burden to scale with internal obligations, raise the course alarm.

## 20. Final verdict

**RUN 02 RESEARCH RESULT: PASS**

More importantly:

> **Run 02 is more complete than Run 01 without being proportionally more complicated to author.**

That is the strongest evidence so far that the compiler might genuinely **contain** building complexity rather than merely formalise it.
