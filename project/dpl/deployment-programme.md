# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Latest gate:** [#475 — DPL-I](https://github.com/adamnoden/architecture/issues/475)  
**Latest implemented packet:** [#473 — DPL-13B](https://github.com/adamnoden/architecture/issues/473)  
**Next authorised packet after DPL-I merge:** **DPL-13C — SCREENING substantive aggregation ledger and `UNRESOLVED`-only whole-site conclusion**  
**Programme maturity:** **M4 — Internally validated / controlled at bounded canonical synthetic deployment-case integration + SCREENING coverage/readiness composition scope; whole-site result validation remains held**

## Purpose

DPL establishes the machinery required to ask whether the controlled Ovid’s House Reference House can be deployed honestly onto land under declared site, jurisdiction, evidence and assurance conditions without confusing architectural authorship, site truth, external authority, compiler proof or professional judgement.

The eventual deployment question remains:

> **Can this controlled Reference House revision be deployed on this site, under this exact target composition and evidence state, while preserving its architectural identity and satisfying every obligation due for the requested assurance profile?**

Top-level deployment conclusions remain:

- `COMPATIBLE`;
- `UNRESOLVED`;
- `INCOMPATIBLE`.

DPL-I authorises implementation of the conservative middle result **only** through DPL-13C and only at `SCREENING` scope. No current merged runtime emits a whole-site conclusion yet.

## Governing rules

> **Compatibility before adaptation.**

> **The compiler evaluates architecture; it does not silently author it.**

> **A deterministic ledger is not a deployment conclusion unless both its evaluation scope and result aggregation semantics are proved.**

---

# Controlled programme history

## Foundation through DPL-12C — complete

DPL-01 through DPL-12C establish the deployment ontology, Reference House conformance boundary, result semantics, assurance profiles, target composition, site-manifest model, Reference Site, bounded England/London/borough targets, site interfaces, real-site corpus, authored candidate/conformance runtime and Wave-C runtime composition.

Restart-safe records remain under `project/dpl/`.

## DPL-13A — canonical synthetic case — complete

[DPL-13A](dpl-13a-canonical-reference-site-compile.md) establishes the first controlled Reference House × synthetic DPL-RS-01 canonical case with:

- all 29 frozen site claims;
- explicit `UNKNOWN` and synthetic-assumption provenance;
- one authored `RH-V02` candidate;
- DPL-08B/C interface identity;
- DPL-09B/C England target identity;
- London strategic planning with no fabricated local borough;
- bounded DPL-02 conformance;
- deterministic site/candidate/deployment/coverage/canonical identities.

## DPL-E — complete

[DPL-E](dpl-e-post-13a-review.md) promoted DPL to M4 at bounded canonical synthetic integration / no-conclusion scope.

## Coverage Foundations — complete

Controlled owner-side SCREENING coverage now exists for:

- [DPL-02C](dpl-02c-conformance-coverage.md) — Reference House conformance;
- [DPL-09D](dpl-09d-england-screening-coverage.md) — England technical/process;
- [DPL-10E](dpl-10e-planning-screening-coverage.md) — planning;
- [DPL-11B](dpl-11b-nonplanning-screening-coverage.md) — non-planning due diligence.

Registry presence is coverage authority, not substantive PASS.

## DPL-F / DPL-G / DPL-10F / DPL-H — complete

DPL-F found planning as the missing fourth owner.

DPL-10E closed that family gap, including `RS-NOISE-01`, `RS-ECO-01` and heritage/context ownership.

DPL-G then found a real authority-graph defect: Croydon/Bromley referenced a stale London strategic target id.

DPL-10F repaired the exact graph and runtime now proves both boroughs point to:

```text
LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20
```

DPL-H then admitted DPL-13B coverage/readiness composition only.

## DPL-13B — complete

[DPL-13B](dpl-13b-screening-coverage-readiness.md) makes the declared SCREENING owner universe executable.

It composes:

- all four coverage registries;
- the DPL-10F planning authority graph;
- the exact canonical DPL-RS-01 manifest;
- claim→owner relationships;
- profile disposition/readiness state;
- identity/invalidation boundaries.

### Material discovery

The first strong 29-claim composition proof exposed `RS-FFL-01` as outside the four registries.

Authority recovery correctly retained its existing owner:

```text
RS-FFL-01
  → SITE_INTERFACE
  → DPL-08B:GI-D02-DATUM
```

This is not a fifth coverage registry. It preserves direct site-interface authority over the authored absolute datum.

### Canonical 13B result

```text
uncoveredClaimIds = []
profileUniverseState = PROFILE_DISPOSITION_UNRESOLVED
conclusionReadiness = NOT_READY_PROFILE_DISPOSITION_UNRESOLVED
```

The declared SCREENING universe is owner-complete. Some due/applicability/acceleration classifications remain unresolved.

---

# DPL-I decision

[DPL-I](dpl-i-post-13b-unresolved-admission-review.md) concludes:

> **PASS — ADMIT DPL-13C AS AN `UNRESOLVED @ SCREENING`-ONLY SUBSTANTIVE AGGREGATOR. BROADEN DPL'S M4 SCOPE TO INCLUDE CONTROLLED SCREENING COVERAGE/READINESS COMPOSITION. KEEP `COMPATIBLE` AND `INCOMPATIBLE` UNAUTHORISED.**

## Why profile-disposition uncertainty does not block conservative aggregation

DPL-03 already defines deployment-level `UNRESOLVED` as the correct state where positive compatibility is unearned and incompatibility unproved, including:

- unknown applicability;
- absent evidence;
- pending professional/planning judgement;
- unsupported due-now methods;
- untested permitted variants;
- unresolved site-interface routes.

Therefore unresolved due/profile classification may participate in a whole-site `UNRESOLVED` result **if and only if it is represented explicitly inside a complete aggregation scope**.

That is different from omitting the uncertainty.

## Acceleration

Opaque acceleration text remains non-executable.

Every current `ACCELERATION_REVIEW_REQUIRED` reference is treated as:

```text
owner question: represented
trigger result: not established
profile due-classification: unresolved
substantive failure: not established
positive discharge: not established
```

That state can block positive compatibility and can support conservative whole-site `UNRESOLVED`; it cannot produce PASS/FAIL by itself.

---

# Current authorised work — DPL-13C only

## DPL-13C — SCREENING substantive aggregation ledger and `UNRESOLVED`-only whole-site conclusion

DPL-13C must join:

1. DPL-13B's complete profile universe/readiness identity; and
2. the actual DPL-13A / DPL-12B obligation, evidence, applicability, conformance and unresolved-input findings.

### Required aggregation records

Every due-now or due-classification-unresolved blocking coverage entry must have an explicit aggregation record.

Use actual executable findings where they exist.

Where owner authority establishes a due blocker but no substantive evaluator/evidence determination exists, retain it explicitly as `UNRESOLVED` or `UNSUPPORTED` according to the admitted resolution route. Never omit it merely because implementation is absent.

Preserve separately:

- `SUBSTANTIVE_UNRESOLVED`;
- `DUE_CLASSIFICATION_UNRESOLVED`.

### DPL-02

Map DPL-02C entries to DPL-12B conformance findings where present. Non-native positive-conformance-required clauses remain explicit open/unresolved blockers rather than passing by omission.

### DPL-09

Map actual DPL-13A England target obligations where present. Broader DPL-09D families remain visible as future-due, unsupported/unresolved where due, or due-classification unresolved.

### DPL-10

Map actual London strategic obligations where present. Registry-only planning families and judgement routes remain explicit unresolved/classification blockers when due. Do not inject Croydon/Bromley obligations into the synthetic fixture.

### DPL-11

Due-now legal/professional/provider families without accepted evidence remain explicit unresolved blockers. Site claims alone do not discharge them.

### DPL-08

Retain direct site-interface authority separately, including the bounded `RS-FFL-01` datum relationship.

## Exact `UNRESOLVED @ SCREENING` admission rule

DPL-13C may emit whole-site `UNRESOLVED @ SCREENING` only when:

1. exact deployment-case identity is recorded;
2. exact DPL-13B readiness identity is recorded;
3. profile owner universe has zero uncovered required claims/families/authority edges;
4. every due-now or due-classification-unresolved blocking coverage entry has an aggregation record;
5. each record preserves owner authority/provenance;
6. actual DPL-13A/DPL-12B findings are used where available;
7. missing evaluator/evidence on a due blocker is explicit `UNRESOLVED`/`UNSUPPORTED`, never omission;
8. due-classification uncertainty is distinct from substantive unresolved state;
9. at least one blocking record remains unresolved/open/unsupported or due-classification unresolved;
10. no controlled proof establishes whole-site incompatibility;
11. route exhaustion is absent/unproved and remains explicit;
12. output is explicitly qualified `@ SCREENING`;
13. future-due obligations remain visible separately;
14. conclusion identity includes case, readiness, aggregation records and evidence state.

### Fail-closed outcomes

If profile scope is incomplete, emit **no whole-site conclusion**.

If every current blocker resolves positively, DPL-13C still may **not** emit `COMPATIBLE`; return a positive-conclusion-not-admitted state.

If a hard failure appears but route exhaustion is unproved, DPL-13C may still emit only `UNRESOLVED` at whole-site level.

---

# Maturity

DPL remains **M4**.

The controlled M4 scope is now:

> **deterministic bounded canonical synthetic deployment-case integration plus controlled SCREENING owner-universe / coverage-readiness composition.**

Whole-site deployment-result validation remains outside that controlled proposition until DPL-13C exists and survives a new adversarial gate.

M5 remains unavailable without competent independent / real-world validation.

---

# Held work

Until post-DPL-13C review, continue to hold:

- `COMPATIBLE @ SCREENING`;
- `INCOMPATIBLE`;
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
- silently authors architecture;
- changes claimed scope without invalidating identity;
- makes coverage metadata look like discharge;
- conflates direct site-interface authority with coverage-registry membership;
- emits `COMPATIBLE` without a separate positive-aggregation gate;
- emits `INCOMPATIBLE` without route exhaustion/invariant-blocker authority.
