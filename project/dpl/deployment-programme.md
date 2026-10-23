# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Latest gate:** [#486 — DPL-J](https://github.com/adamnoden/architecture/issues/486)  
**Latest implemented packet:** [#484 — DPL-13C](https://github.com/adamnoden/architecture/issues/484)  
**Next authorised packet after DPL-J merge:** **DPL-13D — second canonical synthetic fixture / borough-assigned positive-readiness generalisation case**  
**Programme maturity:** **M4 — Internally validated / controlled at bounded canonical synthetic deployment-case integration + SCREENING coverage/readiness composition + canonical DPL-RS-01 `UNRESOLVED @ SCREENING` result scope; broader result authority remains held**

## Purpose

DPL establishes the machinery required to ask whether the controlled Ovid’s House Reference House can be deployed honestly onto land under declared site, jurisdiction, evidence and assurance conditions without confusing architectural authorship, site truth, external authority, compiler proof or professional judgement.

The deployment question remains:

> **Can this controlled Reference House revision be deployed on this site, under this exact target composition and evidence state, while preserving its architectural identity and satisfying every obligation due for the requested assurance profile?**

Top-level deployment conclusions remain:

- `COMPATIBLE`;
- `UNRESOLVED`;
- `INCOMPATIBLE`.

The only whole-site conclusion currently admitted into the controlled proposition is the canonical DPL-RS-01 result:

```text
UNRESOLVED @ SCREENING
```

`COMPATIBLE`, `INCOMPATIBLE`, route exhaustion and real-site deployment remain unauthorised.

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

## DPL-E — complete

[DPL-E](dpl-e-post-13a-review.md) promoted DPL to M4 at bounded canonical synthetic integration / no-conclusion scope and identified profile-coverage completeness as the next blocker.

## Coverage foundations — complete

Controlled owner-side SCREENING coverage authority exists in:

- [DPL-02C](dpl-02c-conformance-coverage.md) — Reference House conformance;
- [DPL-09D](dpl-09d-england-screening-coverage.md) — England technical/process;
- [DPL-10E](dpl-10e-planning-screening-coverage.md) — planning;
- [DPL-11B](dpl-11b-nonplanning-screening-coverage.md) — non-planning due diligence.

Registry presence is coverage authority, not substantive PASS.

## DPL-F / DPL-G / DPL-10F / DPL-H — complete

DPL-F found planning as the missing fourth owner.

DPL-10E closed that family gap, including explicit ownership of `RS-NOISE-01`, `RS-ECO-01`, heritage and other planning/context claims.

DPL-G then found a real authority-graph defect: Croydon/Bromley referenced a stale London strategic target identity.

DPL-10F repaired the exact graph. Both borough exemplars point to:

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

### Material finding

The first strong 29-claim composition proof exposed `RS-FFL-01` as outside the four profile registries.

Authority recovery correctly retained its existing direct owner:

```text
RS-FFL-01
  → SITE_INTERFACE
  → DPL-08B:GI-D02-DATUM
```

This is not a fifth coverage registry.

### Canonical DPL-13B result

```text
uncoveredClaimIds = []
profileUniverseState = PROFILE_DISPOSITION_UNRESOLVED
conclusionReadiness = NOT_READY_PROFILE_DISPOSITION_UNRESOLVED
```

The declared SCREENING universe is owner-complete. Some due/applicability/acceleration classifications remain unresolved.

## DPL-I — complete

[DPL-I](dpl-i-post-13b-unresolved-admission-review.md) concludes:

> **PASS — ADMIT DPL-13C AS AN `UNRESOLVED @ SCREENING`-ONLY SUBSTANTIVE AGGREGATOR. BROADEN DPL'S M4 SCOPE TO INCLUDE CONTROLLED SCREENING COVERAGE/READINESS COMPOSITION. KEEP `COMPATIBLE` AND `INCOMPATIBLE` UNAUTHORISED.**

DPL-I establishes the key semantic distinction:

> **A complete coverage universe does not require every proposition to be resolved before the system may honestly say the deployment is unresolved. It requires every relevant uncertainty to be inside the declared, provenance-bearing aggregation scope.**

Opaque acceleration text remains non-executable. Unresolved due/profile classification may support conservative `UNRESOLVED`, but cannot become PASS/FAIL by inference.

## DPL-13C — substantive aggregation — complete

[DPL-13C](dpl-13c-screening-substantive-aggregation.md) implements the first authorised whole-site conclusion path.

Runtime:

```text
compiler/dpl/substantive-aggregation.ts
```

Adversarial proof:

```text
compiler/dpl/dpl13c.test.ts
```

### Exact join strategy

DPL-13C deliberately refuses fuzzy family→target inference.

Reference House due-now DPL-02C clauses map by exact clause id to DPL-12B findings.

The strategic planning family has one explicit substantive mapping:

```text
DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
  → LON-D3-DESIGN-LED
```

Due-now England/planning/non-planning families without an admitted case-specific substantive evaluator or accepted external determination remain explicit unresolved blockers.

Synthetic site facts never become external discharge evidence.

### Two blocker classes

DPL-13C preserves separately:

- `SUBSTANTIVE_UNRESOLVED`;
- `DUE_CLASSIFICATION_UNRESOLVED`.

The canonical synthetic case retains:

- 17 acceleration-review classification blockers; and
- 2 base local-planning due-classification blockers because no real borough is assigned:
  - `DPL10-COV-LOCAL-QUANTITATIVE-POLICY`;
  - `DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY`.

No trigger prose is parsed or executed.

### Fail-closed result semantics

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

Complete current scope with one or more blockers:

```text
UNRESOLVED @ SCREENING
```

A hard substantive failure still does not imply `INCOMPATIBLE` while route exhaustion or an invariant site-level blocker remains unproved.

### Canonical DPL-13C result

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

[DPL-J](dpl-j-post-13c-unresolved-result-validation.md) adversarially attacks the DPL-13C result proposition and concludes:

> **PASS — ADMIT DPL-13C AS THE INTERNALLY CONTROLLED CANONICAL `UNRESOLVED @ SCREENING` RESULT FOR DPL-RS-01. BROADEN DPL'S M4 SCOPE TO INCLUDE THAT CONTROLLED CANONICAL WHOLE-SITE RESULT. KEEP `COMPATIBLE`, `INCOMPATIBLE`, ROUTE EXHAUSTION AND REAL-SITE DEPLOYMENT UNAUTHORISED.**

## DPL-J findings

DPL-13C survives review because:

- every current positive-compatibility blocker is represented exactly once under the correct owner identity;
- DPL-02 consumes exact DPL-12B findings rather than treating coverage as conformance;
- the London D3 join is explicit and narrow;
- no fuzzy target-family association is used elsewhere;
- absent evaluators/evidence remain explicit unresolved blockers;
- `FUTURE_DUE` stays outside the current blocker ledger;
- 17 acceleration-review and two no-borough local-planning classification blockers remain distinct and non-executable;
- all-positive scope cannot emit `COMPATIBLE`;
- hard substantive failure cannot emit `INCOMPATIBLE` without route exhaustion;
- material case/readiness/blocker changes invalidate aggregation identity;
- direct DPL-08B datum authority remains non-discharge authority.

The controlled M4 proposition therefore now includes the **canonical DPL-RS-01 whole-site `UNRESOLVED @ SCREENING` result**, but no broader result authority.

---

# Current authorised work — DPL-13D only

## Why the experiment must change

DPL-RS-01 is intentionally excellent for proving a conservative middle result:

- no real borough is assigned;
- many site claims are `UNKNOWN` or synthetic assumptions;
- external evidence and professional/planning determinations are absent.

Those same properties make it structurally unsuitable for positive-readiness testing.

Two local-planning entries cannot be positively classified while the fixture remains no-borough. Seventeen acceleration questions also remain current classification blockers.

The next value is therefore not another generic conclusion function and not an attempt to force DPL-RS-01 to pass.

## DPL-13D — second canonical synthetic fixture / borough-assigned positive-readiness generalisation case

DPL-13D must introduce one second synthetic deployment case to test whether the existing DPL-13B/DPL-13C machinery generalises beyond the no-borough/UNKNOWN ecology of DPL-RS-01.

Minimum posture:

- new synthetic site identity, provisionally `DPL-RS-02`;
- explicit London strategic target plus one already-controlled local borough target;
- prefer the existing Croydon target so no new borough research is required;
- enough authored synthetic facts to change selected due/acceleration classifications deliberately;
- UNKNOWN remains where external evidence is intentionally absent;
- synthetic facts never become title, survey, provider, building-control or professional evidence;
- one explicitly authored Reference House deployment candidate;
- no optimiser/candidate search;
- reuse DPL-13B/DPL-13C machinery without fixture-specific result semantics;
- prove changed borough/site disposition participates in case/readiness/result identity;
- `COMPATIBLE` and `INCOMPATIBLE` remain unavailable.

The purpose is **positive-readiness generalisation**, not a positive conclusion.

After DPL-13D lands, run a fresh gate before any positive-result implementation is admitted.

---

# Current proof boundary

DPL remains **M4**.

The controlled M4 scope is now:

> **deterministic bounded canonical synthetic deployment-case integration, controlled SCREENING owner-universe / coverage-readiness composition, and the canonical DPL-RS-01 whole-site `UNRESOLVED @ SCREENING` result proposition.**

This does not mean:

- `COMPATIBLE @ SCREENING`;
- `INCOMPATIBLE`;
- route exhaustion;
- multi-site/general result validation;
- real-site deployability;
- planning permission;
- regulatory compliance;
- legal clearance;
- external validation.

M5 remains unavailable without competent independent / real-world validation.

---

# Held work

Until post-DPL-13D review, continue to hold:

- `COMPATIBLE @ SCREENING` implementation;
- `INCOMPATIBLE` implementation;
- route search/exhaustion/optimisation;
- DPL-14D bulk corpus expansion;
- DPL-15 real-site deployment trials;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 final closeout;
- generic all-borough planning ontology;
- new borough research not required by DPL-13D;
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
