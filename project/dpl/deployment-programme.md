# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Latest gate:** [#486 — DPL-J](https://github.com/adamnoden/architecture/issues/486)  
**Latest implemented packet:** [#484 — DPL-13C](https://github.com/adamnoden/architecture/issues/484)  
**Next authorised packet after DPL-J merge:** **DPL-13C.1 — exact obligation identity + `WARNING` / `SUPERSEDED` aggregation semantics**  
**Programme maturity:** **M4 — Internally validated / controlled at bounded canonical synthetic deployment-case integration + SCREENING coverage/readiness composition + canonical DPL-RS-01 whole-site `UNRESOLVED @ SCREENING` result-validation scope; generic whole-site result authority remains held**

## Purpose

DPL establishes the machinery required to ask whether the controlled Ovid’s House Reference House can be deployed honestly onto land under declared site, jurisdiction, evidence and assurance conditions without confusing architectural authorship, site truth, external authority, compiler proof or professional judgement.

The deployment question remains:

> **Can this controlled Reference House revision be deployed on this site, under this exact target composition and evidence state, while preserving its architectural identity and satisfying every obligation due for the requested assurance profile?**

Top-level deployment conclusions remain:

- `COMPATIBLE`;
- `UNRESOLVED`;
- `INCOMPATIBLE`.

The current controlled whole-site result authority is deliberately narrow: the exact canonical Reference House × DPL-RS-01 case may emit **`UNRESOLVED @ SCREENING`**. `COMPATIBLE`, `INCOMPATIBLE`, generic whole-site aggregation across arbitrary future compositions and route exhaustion remain unauthorised.

## Governing rules

> **Compatibility before adaptation.**

> **The compiler evaluates architecture; it does not silently author it.**

> **A deterministic ledger is not a deployment conclusion unless both its evaluation scope and result aggregation semantics are proved.**

---

# Controlled programme history

## Foundation through DPL-12C — complete

DPL-01 through DPL-12C establish:

- deployment ontology and result semantics;
- Reference House conformance boundaries and admitted variants;
- assurance profiles;
- typed target composition;
- site-claim / evidence authority;
- synthetic Reference Site;
- England / London / borough target inventories and bounded executable slices;
- site-interface authority and water/ground interfaces;
- eight-site adversarial London corpus;
- authored deployment-candidate identity;
- bounded executable Reference House conformance;
- Wave-C runtime composition.

Restart-safe records remain under `project/dpl/`.

## DPL-13A — canonical synthetic compile — complete

[DPL-13A](dpl-13a-canonical-reference-site-compile.md) establishes the first controlled Reference House × synthetic DPL-RS-01 case.

It preserves:

- all 29 frozen DPL-07 site claims;
- explicit `UNKNOWN` and synthetic-assumption provenance;
- one authored unmirrored 180° `RH-V02` deployment candidate;
- DPL-08B/C interface identity;
- DPL-09B/C England target identity;
- London strategic planning with no fabricated local borough;
- bounded DPL-02 conformance;
- deterministic site/candidate/deployment/coverage/canonical identities.

Its original proof boundary deliberately retained no whole-site conclusion authority.

## DPL-E — complete

[DPL-E](dpl-e-post-13a-review.md) promoted DPL to **M4** at bounded canonical synthetic integration / no-conclusion scope.

It identified profile-coverage completeness as the next dominant blocker.

## Coverage foundations — complete

Controlled owner-side SCREENING coverage authority now exists in:

- [DPL-02C](dpl-02c-conformance-coverage.md) — Reference House conformance;
- [DPL-09D](dpl-09d-england-screening-coverage.md) — England technical/process;
- [DPL-10E](dpl-10e-planning-screening-coverage.md) — planning;
- [DPL-11B](dpl-11b-nonplanning-screening-coverage.md) — non-planning due diligence.

Registry presence is coverage authority, not substantive PASS.

## DPL-F / DPL-G / DPL-10F / DPL-H — complete

DPL-F found planning as the missing fourth owner.

DPL-10E closed that family gap, including explicit ownership of `RS-NOISE-01`, `RS-ECO-01`, heritage and other planning/context claims.

DPL-G then found a real authority-graph defect: Croydon/Bromley referenced a stale London strategic target identity.

DPL-10F repaired the exact graph. Both borough exemplars now point to:

```text
LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20
```

DPL-H then admitted DPL-13B coverage/readiness composition only.

## DPL-13B — SCREENING coverage/readiness — complete

[DPL-13B](dpl-13b-screening-coverage-readiness.md) makes the declared SCREENING owner universe executable.

It composes:

- all four owner coverage registries;
- the repaired DPL-10F planning authority graph;
- the exact DPL-RS-01 canonical site manifest;
- claim→owner relationships;
- profile disposition/readiness state;
- identity/invalidation boundaries.

The first strong 29-claim composition proof exposed `RS-FFL-01` as outside the four profile registries. Authority recovery correctly retained its existing direct owner:

```text
RS-FFL-01
  → SITE_INTERFACE
  → DPL-08B:GI-D02-DATUM
```

This is not a fifth coverage registry. It preserves direct site-interface authority over the authored absolute datum.

Canonical DPL-13B result:

```text
uncoveredClaimIds = []
profileUniverseState = PROFILE_DISPOSITION_UNRESOLVED
conclusionReadiness = NOT_READY_PROFILE_DISPOSITION_UNRESOLVED
```

The declared SCREENING universe is owner-complete. Some due/applicability/acceleration classifications remain unresolved.

## DPL-I — complete

[DPL-I](dpl-i-post-13b-unresolved-admission-review.md) concluded:

> **PASS — ADMIT DPL-13C AS AN `UNRESOLVED @ SCREENING`-ONLY SUBSTANTIVE AGGREGATOR. BROADEN DPL'S M4 SCOPE TO INCLUDE CONTROLLED SCREENING COVERAGE/READINESS COMPOSITION. KEEP `COMPATIBLE` AND `INCOMPATIBLE` UNAUTHORISED.**

DPL-I froze the key semantic distinction:

> **A complete coverage universe does not require every proposition to be resolved before the system may honestly say the deployment is unresolved. It requires every relevant uncertainty to be inside the declared, provenance-bearing aggregation scope.**

Opaque acceleration text remains non-executable. Unresolved due/profile classification may support conservative `UNRESOLVED`, but can never become PASS/FAIL by inference.

---

# DPL-13C — substantive aggregation — complete

[DPL-13C](dpl-13c-screening-substantive-aggregation.md) implements the first authorised whole-site conclusion path.

Runtime:

```text
compiler/dpl/substantive-aggregation.ts
```

Adversarial proof:

```text
compiler/dpl/dpl13c.test.ts
```

## Join strategy

DPL-13C deliberately refuses fuzzy family→target inference.

### Reference House

Due-now DPL-02C clauses map by exact clause id to corresponding DPL-12B candidate-conformance findings.

Native clauses consume actual `CONFORMS` results; non-native positive-conformance-required clauses consume explicit `OPEN` results.

### Planning

`DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY` maps to the controlled London strategic design-led obligation:

```text
LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20
  → LON-D3-DESIGN-LED
```

The canonical current obligation remains `UNRESOLVED` because qualitative planning judgement is required.

Other due-now planning families without an admitted case-specific evaluator remain explicit unresolved blockers.

### England technical/process

The due-now source/applicability spine remains represented but not substantively discharged. It remains explicit unresolved.

### Non-planning due diligence

The canonical due-now families remain explicit unresolved external-evidence blockers:

- site control;
- physical flood/water;
- access status.

Synthetic site claims do not become title, survey, flood, highway, provider or professional evidence.

## Two blocker classes

DPL-13C preserves separately:

- `SUBSTANTIVE_UNRESOLVED`;
- `DUE_CLASSIFICATION_UNRESOLVED`.

The canonical synthetic case retains:

- 17 acceleration-review classification blockers; and
- 2 base local-planning due-classification blockers because no real borough is assigned:
  - `DPL10-COV-LOCAL-QUANTITATIVE-POLICY`;
  - `DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY`.

No trigger prose is parsed or executed.

## Direct site-interface authority

The DPL-08B `RS-FFL-01` datum bridge remains identity-bearing but does not become a substantive aggregation pass.

## Current versus future scope

Current aggregation records are required for positive-compatibility-blocking entries with dispositions:

- `DUE_NOW_REPRESENTED`;
- `DUE_NOW_MISSING`;
- `DUE_CLASSIFICATION_UNRESOLVED`;
- `ACCELERATION_REVIEW_REQUIRED`.

`FUTURE_DUE` families remain separately visible and identity-bearing.

## Fail-closed results

Incomplete owner/profile universe:

```text
NOT_ADMITTED
reason = PROFILE_UNIVERSE_INCOMPLETE
```

Missing required blocker record:

```text
NOT_ADMITTED
reason = BLOCKING_SCOPE_INCOMPLETE
```

Everything represented resolves positively:

```text
NOT_ADMITTED
reason = POSITIVE_CONCLUSION_NOT_ADMITTED
```

Current complete scope with one or more blockers:

```text
UNRESOLVED @ SCREENING
```

A hard substantive failure still does not imply `INCOMPATIBLE` while route exhaustion or an invariant site-level blocker remains unproved.

Canonical DPL-13C result:

```text
wholeSiteConclusion = UNRESOLVED @ SCREENING
compatibleAtScreening = NOT_ADMITTED
incompatible = NOT_ADMITTED
routeExhaustion = NOT_IMPLEMENTED
architecturalCandidateSelection = NOT_IMPLEMENTED
localBoroughTarget = NOT_ASSIGNED_SYNTHETIC_REFERENCE
```

---

# DPL-J — complete candidate

[DPL-J](dpl-j-post-13c-result-validation.md) independently attacks the DPL-13C result proposition.

Its decision is:

> **PASS — DPL-13C EARNS CONTROLLED M4 AUTHORITY FOR THE CANONICAL DPL-RS-01 WHOLE-SITE `UNRESOLVED @ SCREENING` RESULT. KEEP `COMPATIBLE`, `INCOMPATIBLE`, ROUTE EXHAUSTION AND GENERIC WHOLE-SITE RESULT AUTHORITY HELD. BEFORE ANY POSITIVE-CONTROL WORK, REQUIRE ONE BOUNDED DPL-13C.1 SEMANTIC-HARDENING PACKET.**

The qualifier **canonical** is controlling. DPL-J validates the exact current Reference House × DPL-RS-01 SCREENING result, not a universal aggregation algebra.

## What DPL-J re-proves

DPL-J finds the canonical proposition sound because:

- every current positive-compatibility-blocking DPL-13B entry is represented exactly once;
- DPL-02 joins consume exact DPL-12B findings rather than coverage metadata;
- the London D3 canonical join consumes the actual current `UNRESOLVED` obligation;
- due-now owner families without exact evaluators/evidence remain explicit unresolved blockers;
- synthetic facts never become external discharge evidence;
- future-due families remain outside the current blocker ledger unless an owner acceleration-review record explicitly brings classification into current review;
- the 17 acceleration + 2 no-borough local-policy classification blockers are the correct canonical state;
- all-positive scope cannot emit `COMPATIBLE`;
- hard substantive failure cannot emit `INCOMPATIBLE` while route exhaustion remains unproved;
- case/readiness/record/future-due/site-interface identities are material to aggregation identity.

## Two generic semantic debts exposed by DPL-J

These debts do **not** falsify the canonical current result because neither ambiguous branch is exercised by the current London D3 `UNRESOLVED` obligation. They do block generic or positive-result work.

### 1. Exact obligation identity

The planning join is conceptually target-specific, but the current lookup selects by `obligationId` alone before recording the actual target id.

`DeploymentObligationLedgerEntry` carries both `targetId` and `obligationId`; future target compositions are not authorised to assume obligation ids are globally unique.

DPL-13C.1 must therefore map exact `(targetId, obligationId)` pairs and fail closed on zero or multiple current matches.

### 2. `WARNING` / `SUPERSEDED` semantics

Current generic `obligationState()` maps `WARNING` and `SUPERSEDED` into substantive unresolved alongside `UNRESOLVED`.

DPL-03 is stricter:

- a bare `WARNING` is valid at the mandatory level and does not block a deployment conclusion unless a separate mandatory proposition remains unresolved/failing;
- `SUPERSEDED` is historical and must not participate as current authority.

DPL-13C.1 must encode those distinctions explicitly and regression-lock them.

---

# Current controlled proof boundary

DPL remains **M4**, with its internally controlled scope now broadened narrowly to:

> **deterministic bounded canonical synthetic deployment-case integration, controlled SCREENING owner-universe / coverage-readiness composition, and controlled canonical DPL-RS-01 whole-site `UNRESOLVED @ SCREENING` result validation.**

This does **not** validate:

- generic DPL-13C aggregation across arbitrary future target/site compositions;
- `COMPATIBLE @ SCREENING`;
- `INCOMPATIBLE`;
- route search or exhaustion;
- real-site deployability;
- regulatory/planning/legal adequacy;
- external validation.

M5 remains unavailable without competent independent / real-world validation.

---

# Next authorised packet — DPL-13C.1 only

After DPL-J merges, open:

> **DPL-13C.1 — exact obligation identity + `WARNING` / `SUPERSEDED` aggregation semantics**

Required work:

1. replace obligation-id-only mappings with exact `(targetId, obligationId)` pairs;
2. fail closed if an exact mapping finds zero or more than one current ledger entry;
3. make `WARNING` non-blocking in accordance with DPL-03 where no hidden mandatory failure exists;
4. exclude `SUPERSEDED` as current authority and represent absence of a current mapped result explicitly;
5. add regression tests for duplicate obligation ids across targets, wrong-target same-id obligations, warning-only mapped results, superseded-only mapped results and unchanged canonical DPL-RS-01 output;
6. preserve all DPL-13C positive/incompatibility restraints.

After DPL-13C.1, run a fresh gate before deciding whether a second synthetic positive-control fixture is the correct next proof object.

Do **not** mutate DPL-RS-01 merely to make a positive result possible.

---

# Held work

Continue to hold:

- `COMPATIBLE @ SCREENING`;
- `INCOMPATIBLE`;
- generic whole-site result authority across arbitrary target/site compositions;
- route search/exhaustion/optimisation;
- DPL-14D bulk corpus expansion;
- DPL-15 real-site deployment trials;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 final closeout;
- generic all-borough planning ontology;
- unrelated technical/interface expansion;
- Reference House geometry changes;
- DRW changes.

---

# Packet discipline

Every DPL packet must preserve authority ownership and fail closed.

Split or refuse work that:

- converts external professional/legal/planning judgement into native truth;
- makes missing evidence look not applicable;
- broadens a borough/site/target accident into generic doctrine;
- silently authors architecture;
- changes claimed evaluation scope without invalidating identity;
- makes coverage metadata look like substantive discharge;
- conflates direct site-interface authority with coverage-registry membership;
- emits `COMPATIBLE` without a separately admitted positive-aggregation rule;
- emits `INCOMPATIBLE` without route exhaustion/invariant-blocker authority.
