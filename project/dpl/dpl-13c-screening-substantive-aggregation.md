# DPL-13C — SCREENING substantive aggregation ledger and `UNRESOLVED`-only whole-site conclusion

**Issue:** #484  
**PR:** #485  
**Programme:** #299  
**Depends on:** DPL-I #475 / PR #483  
**Landed admission baseline:** `8e3d25bcdada241cbfbac92fb6d404f46bfc5877`  
**Status:** COMPLETE CANDIDATE — merge only after exact-final-head validation

## Decision implemented

DPL-13C implements exactly the asymmetric conclusion authority admitted by DPL-I:

> **The canonical Reference House × DPL-RS-01 deployment may emit `UNRESOLVED @ SCREENING` when the complete controlled SCREENING owner universe is joined to a complete provenance-bearing blocking ledger. `COMPATIBLE` and `INCOMPATIBLE` remain unavailable.**

The runtime is `compiler/dpl/substantive-aggregation.ts`.

The adversarial proof is `compiler/dpl/dpl13c.test.ts`.

---

## 1. Inputs

DPL-13C composes two already-controlled propositions rather than creating a second source of truth:

1. **DPL-13A / DPL-12B canonical substantive state**
   - deployment-case identity;
   - exact site and authored candidate identity;
   - candidate-conformance findings;
   - target obligation ledger;
   - evidence and unresolved-input state.
2. **DPL-13B SCREENING coverage/readiness**
   - four owner coverage registries;
   - exact planning authority graph;
   - complete 29-claim site ownership map;
   - direct DPL-08B site-interface datum authority;
   - due/future/classification disposition;
   - unresolved acceleration-review metadata.

DPL-13C does not reinterpret either source.

---

## 2. No fuzzy family-to-target inference

A material design choice is deliberately conservative:

> **A coverage family is never associated with arbitrary obligations merely because they share a target id.**

That would be unsafe because one target can contain several obligations with different subjects, methods and evidence requirements.

The current exact seams are therefore narrow.

### Reference House

Every due-now DPL-02C clause maps by exact clause id to the corresponding DPL-12B `CandidateConformanceFinding`.

Consequences:

- currently native clauses such as `RH-I02`, `RH-PROT-01`, `RH-PROT-04` and `RH-PROT-06` consume their actual `CONFORMS` finding;
- positive-conformance-required clauses without native evaluation consume the explicit DPL-12B `OPEN` finding;
- registry presence never becomes conformance.

### Planning

`DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY` maps explicitly to:

```text
LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20
  → LON-D3-DESIGN-LED
```

The canonical obligation is currently `UNRESOLVED` because it requires qualitative planning judgement.

Other due-now planning owner entries without an admitted case-specific substantive evaluator remain explicit unresolved records rather than being associated fuzzily with neighbouring London obligations.

### England technical/process

The due-now source/applicability spine remains represented but has no case-specific substantive discharge result. It therefore remains explicit unresolved at aggregation level.

Technical families that are genuinely future-due remain separate unless their owner authority raises a current acceleration/classification question.

### Non-planning due diligence

The three canonical due-now families remain explicit unresolved blockers:

- `DPL11-COV-SITE-CONTROL`;
- `DPL11-COV-PHYSICAL-FLOOD-WATER`;
- `DPL11-COV-ACCESS-STATUS`.

Synthetic site claims exercise these families but are not real title, flood/water, survey, highway, access, geotechnical or provider evidence.

---

## 3. Two uncertainty classes remain distinct

DPL-13C preserves the DPL-I distinction in machine output.

### `SUBSTANTIVE_UNRESOLVED`

Used where the current due proposition itself is not positively discharged, including:

- DPL-12B `OPEN` candidate conformance;
- deployment obligation `UNRESOLVED`;
- `UNSUPPORTED` current method/evaluation;
- absent required external evidence or judgement;
- a substantive failure that cannot yet establish whole-site incompatibility.

### `DUE_CLASSIFICATION_UNRESOLVED`

Used where the unresolved question is whether/when a family is due, including:

- opaque owner acceleration-review questions;
- local-policy applicability when no real borough is assigned.

The canonical synthetic case currently contains:

- **17 acceleration-review classification blockers**; and
- **2 base local-planning classification blockers**:
  - `DPL10-COV-LOCAL-QUANTITATIVE-POLICY`;
  - `DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY`.

Those two are not defects. They are the correct consequence of preserving:

```text
localPlanningTargetState = NO_REAL_BOROUGH_ASSIGNED
```

for DPL-RS-01.

No trigger prose is parsed or executed.

---

## 4. Direct DPL-08 authority remains separate

DPL-13C carries forward:

```text
RS-FFL-01
  → SITE_INTERFACE
  → DPL-08B:GI-D02-DATUM
```

as identity-bearing site-interface authority.

It does **not** convert that relationship into an aggregation pass.

The datum relationship proves ownership of the authored absolute datum response only. It does not prove:

- ground adequacy;
- foundation design;
- access;
- weathering;
- drainage;
- whole-site compatibility.

---

## 5. Current versus future scope

DPL-13C creates aggregation records only for current blocking propositions:

- `DUE_NOW_REPRESENTED`;
- `DUE_NOW_MISSING`;
- `DUE_CLASSIFICATION_UNRESOLVED`;
- `ACCELERATION_REVIEW_REQUIRED`;

where owner authority says positive compatibility would be blocking when due.

`FUTURE_DUE` families remain separately visible in the result and identity.

A future family is not silently promoted merely because it exists in the complete owner registry.

---

## 6. Exact fail-closed result semantics

### Incomplete owner/profile universe

If DPL-13B no longer proves the declared owner/site universe complete:

```text
WHOLE-SITE CONCLUSION: NOT_ADMITTED
reason = PROFILE_UNIVERSE_INCOMPLETE
```

### Incomplete blocking ledger

If any required current blocker disappears from DPL-13C aggregation scope:

```text
WHOLE-SITE CONCLUSION: NOT_ADMITTED
reason = BLOCKING_SCOPE_INCOMPLETE
```

### All represented blockers resolve positively

DPL-13C still cannot emit `COMPATIBLE`:

```text
WHOLE-SITE CONCLUSION: NOT_ADMITTED
reason = POSITIVE_CONCLUSION_NOT_ADMITTED
```

Positive compatibility requires a separate future gate.

### Current blockers remain

When the owner universe and blocking ledger are complete and at least one current blocker remains unresolved/open/unsupported/failing or due-classification unresolved:

```text
UNRESOLVED @ SCREENING
```

### Hard substantive failure

A candidate or obligation `FAIL` still does **not** establish whole-site incompatibility while route exhaustion or an invariant site-level blocker is unproved.

DPL-13C therefore continues to emit only `UNRESOLVED @ SCREENING` in that condition.

---

## 7. Canonical result

The current canonical synthetic case earns:

```text
wholeSiteConclusion = UNRESOLVED @ SCREENING
compatibleAtScreening = NOT_ADMITTED
incompatible = NOT_ADMITTED
routeExhaustion = NOT_IMPLEMENTED
architecturalCandidateSelection = NOT_IMPLEMENTED
localBoroughTarget = NOT_ASSIGNED_SYNTHETIC_REFERENCE
```

This is the first DPL runtime whole-site conclusion.

It is deliberately weak in the epistemically correct direction: the system can now say that the complete declared SCREENING proposition is unresolved, but cannot turn unresolved scope into optimism or candidate failure into site impossibility.

---

## 8. Identity and invalidation

DPL-13C identity includes:

- DPL-13A canonical case identity;
- deployment-case and deployment-result fingerprints;
- site and candidate identity;
- DPL-13B readiness identity/result fingerprints;
- every canonical aggregation record and its own fingerprint;
- future-due set;
- direct site-interface authority;
- proof-boundary state.

Therefore material changes to case, evidence, readiness, substantive findings, owner mapping or blocker semantics invalidate the aggregate identity.

Semantically irrelevant aggregation-record order is canonicalized and does not change identity.

---

## 9. Adversarial proof

`compiler/dpl/dpl13c.test.ts` proves at least:

1. deterministic canonical `UNRESOLVED @ SCREENING`;
2. every due/due-classification blocker represented exactly once;
3. exact DPL-12B clause findings consumed instead of coverage-as-conformance;
4. exact London D3 obligation consumed;
5. absent DPL-11 external evidence remains unresolved;
6. acceleration and base classification uncertainty remain separate from substantive uncertainty;
7. DPL-08B datum authority remains non-discharge authority;
8. future-due families stay outside the current blocker ledger;
9. incomplete profile universe emits no conclusion;
10. missing blocker record emits no conclusion;
11. all-positive scope cannot emit `COMPATIBLE`;
12. hard failure cannot emit `INCOMPATIBLE` without route exhaustion;
13. record ordering is identity-neutral;
14. material record changes invalidate identity;
15. mismatched site/readiness composition is rejected;
16. explicit mapping construction is deterministic.

The first validation pass exposed a test-model mistake rather than a runtime defect: the test counted only 17 acceleration blockers while the runtime correctly retained 19 total classification blockers because two local-planning applicability entries are independently unresolved. The test was corrected to preserve that distinction.

---

## 10. Maturity consequence

DPL remains **M4** at the scope already admitted by DPL-I:

> deterministic bounded canonical synthetic deployment-case integration plus controlled SCREENING owner-universe / coverage-readiness composition.

DPL-13C existing and passing its implementation tests does **not** by itself broaden M4 to whole-site deployment-result validation.

That requires a fresh adversarial gate.

---

## 11. Mandatory next gate

After DPL-13C merges, open:

> **DPL-J — post-DPL-13C whole-site `UNRESOLVED @ SCREENING` adversarial review and positive-result admission gate**

DPL-J must attack the aggregation proposition itself before any broader conclusion authority is admitted.

Until DPL-J decides otherwise, continue to hold:

- `COMPATIBLE @ SCREENING`;
- `INCOMPATIBLE`;
- route search/exhaustion/optimisation;
- DPL-14D bulk corpus expansion;
- DPL-15 real-site deployment trials;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 closeout;
- generic all-borough planning ontology;
- unrelated technical/interface expansion;
- Reference House geometry changes;
- DRW changes.
