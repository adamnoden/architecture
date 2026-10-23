# DPL-J — Post-DPL-13C `UNRESOLVED @ SCREENING` Result Validation / Positive-Conclusion Admission Gate

**Issue:** #486  
**Programme:** #299  
**Review date:** 2026-10-23  
**Landed DPL-13C baseline:** `d02de035ba3ecaa476d2b27bfad460f23963a215`  
**Current replay baseline:** `1fe97c8cfec3bef3471063e5fbd165d67afabbd9`  
**Depends on:** DPL-I, DPL-13B, DPL-13C, DPL-02C, DPL-08B, DPL-09D, DPL-10E/F, DPL-11B, DPL-12B, DPL-13A  
**Status:** PASS candidate; merge only after exact-final-head validation

## Decision

> **PASS — ADMIT DPL-13C AS THE INTERNALLY CONTROLLED CANONICAL `UNRESOLVED @ SCREENING` RESULT FOR DPL-RS-01. BROADEN DPL'S M4 SCOPE TO INCLUDE THAT CONTROLLED CANONICAL WHOLE-SITE RESULT. KEEP `COMPATIBLE`, `INCOMPATIBLE`, ROUTE EXHAUSTION AND REAL-SITE DEPLOYMENT UNAUTHORISED.**

DPL-13C survives adversarial review as a coherent whole-site middle-result proposition.

The result is earned for a narrow reason:

- the controlled SCREENING owner universe is complete;
- every current positive-compatibility-blocking entry is represented once in the aggregation ledger;
- exact substantive findings are consumed where an admitted exact seam exists;
- missing evaluators, evidence and judgement remain explicit unresolved blockers rather than omissions;
- due-classification uncertainty is preserved separately from substantive uncertainty;
- positive compatibility is deliberately refused even under an all-positive synthetic override;
- hard candidate/obligation failure remains distinct from site incompatibility while route exhaustion is unproved;
- result identity includes the case, readiness, blocker records, future-due set, site-interface authority and proof boundary.

The canonical result therefore earns internal control at its exact scope:

```text
wholeSiteConclusion = UNRESOLVED @ SCREENING
site = DPL-RS-01 synthetic reference
localBoroughTarget = NOT_ASSIGNED_SYNTHETIC_REFERENCE
compatibleAtScreening = NOT_ADMITTED
incompatible = NOT_ADMITTED
routeExhaustion = NOT_IMPLEMENTED
architecturalCandidateSelection = NOT_IMPLEMENTED
```

This does not establish positive compatibility, incompatibility, real-site deployability, planning permission, regulatory compliance, legal clearance or external validation.

---

## 1. Aggregation scope completeness

### Verdict

PASS.

DPL-13C derives its required current blocker universe from DPL-13B normalized coverage entries that are both:

- `positiveCompatibilityBlockingWhenDue`; and
- in one of:
  - `DUE_NOW_REPRESENTED`;
  - `DUE_NOW_MISSING`;
  - `DUE_CLASSIFICATION_UNRESOLVED`;
  - `ACCELERATION_REVIEW_REQUIRED`.

The runtime then proves exact scope equality between that required set and the aggregation ledger by owner + owner-entry identity.

The canonical adversarial test independently compares the same required owner-entry key set to the emitted aggregation records and requires one-to-one representation.

This is the right completeness proposition for first conservative aggregation. It does not claim every future family is currently due.

### Duplicate / omission posture

PASS.

The runtime rejects duplicate or missing current blocker coverage because `blockingScopeComplete` requires:

- equal set lengths;
- no duplicate required keys;
- no duplicate actual keys;
- every required key present in actual aggregation records.

A removed required record returns:

```text
NOT_ADMITTED
reason = BLOCKING_SCOPE_INCOMPLETE
```

rather than a degraded or optimistic conclusion.

---

## 2. Coverage → substantive joins

### DPL-02 exact clause join

PASS.

Reference House coverage is the strongest exact join in the current implementation.

Each due-now `REFERENCE_HOUSE` coverage entry consumes a DPL-12B candidate finding by exact `clauseId`.

Consequences are correct:

- a native `CONFORMS` finding becomes `POSITIVE_RESOLVED`;
- an existing `OPEN` finding remains `SUBSTANTIVE_UNRESOLVED`;
- a missing expected finding becomes explicit `SUBSTANTIVE_UNSUPPORTED`;
- `NON_CONFORMING` / `REQUIRES_REFERENCE_HOUSE_REVISION` become substantive failures but do not become site incompatibility.

Registry presence never becomes conformance.

### Planning exact join

PASS, at the currently admitted narrow seam.

The only direct family→obligation mapping is explicit:

```text
PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
  → LON-D3-DESIGN-LED
```

That obligation is consumed from the actual deployment ledger and currently remains `UNRESOLVED` because qualitative planning judgement is required.

No arbitrary obligation is selected merely because it shares a target id.

### Other owner families

PASS as an honest unresolved boundary.

Where a due-now England, planning or non-planning family lacks an admitted case-specific substantive evaluator or accepted external determination, DPL-13C emits:

```text
sourceKind = OWNER_EVIDENCE_REQUIRED
sourceResult = NO_CASE_SPECIFIC_SUBSTANTIVE_FINDING
aggregationState = SUBSTANTIVE_UNRESOLVED
```

This is conservative and truthful.

It must not be misread as a claim that the relevant external route has been investigated and failed. It means the current controlled case cannot positively discharge that owner family.

### Synthetic claims are not external discharge

PASS.

The DPL-11 site-control, flood/water and access-status families remain unresolved despite the synthetic site containing related claims. This correctly prevents authored/synthetic site data from masquerading as title evidence, survey evidence, highway determination, provider evidence or professional judgement.

---

## 3. Current / future separation

### Verdict

PASS.

`FUTURE_DUE` entries are emitted separately in `futureDue` and are not copied into the current aggregation ledger.

This prevents family completeness from becoming current-obligation inflation.

A future family can still create a current classification question only through existing owner coverage authority, for example an explicit acceleration-review disposition. DPL-13C does not independently promote a future family because a claim looks suspicious or is UNKNOWN.

This is an important restraint: trigger prose remains non-executable.

---

## 4. Canonical due-classification state

### Verdict

PASS.

The canonical DPL-RS-01 result contains 19 due-classification blockers:

- **17** `ACCELERATION_REVIEW_REQUIRED` records;
- **2** base `DUE_CLASSIFICATION_UNRESOLVED` local-planning records:
  - `DPL10-COV-LOCAL-QUANTITATIVE-POLICY`;
  - `DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY`.

The second pair is materially different from acceleration review.

They exist because DPL-RS-01 deliberately preserves:

```text
localPlanningTargetState = NO_REAL_BOROUGH_ASSIGNED
```

and therefore cannot positively determine which local-policy route is due.

The distinction survives in machine output and blocker counts.

No opaque trigger prose is executed.

---

## 5. `UNRESOLVED @ SCREENING` admission semantics

### Verdict

PASS.

The runtime emits `UNRESOLVED @ SCREENING` only after three gates:

1. owner/profile universe complete;
2. current blocking scope complete;
3. at least one represented blocker is not positively resolved.

This is stronger than "the fixture has unknowns".

It means the complete declared SCREENING blocker universe is known and the current result set does not justify either positive compatibility or site incompatibility.

The canonical fixture satisfies those conditions.

### Why the middle result is epistemically appropriate

The canonical case contains both:

- unresolved substantive propositions; and
- unresolved due/applicability classification.

DPL-03 already establishes those as valid causes of the middle deployment result.

DPL-13C does not erase the difference between them.

That is sufficient to admit the conservative middle result while withholding positive and terminal negative conclusions.

---

## 6. Positive-result refusal

### Verdict

PASS.

DPL-13C cannot emit `COMPATIBLE`.

The explicit all-positive adversarial fixture preserves the same aggregation scope but converts every record to positive resolution. The runtime then returns:

```text
NOT_ADMITTED
reason = POSITIVE_CONCLUSION_NOT_ADMITTED
```

This is the correct boundary.

A conservative aggregation rule working correctly does not prove the stronger positive rule.

Positive compatibility requires a separate authority path and must not be smuggled into DPL-13C by absence of blockers.

---

## 7. Incompatibility refusal

### Verdict

PASS.

A hard candidate or obligation failure remains a substantive blocker, but the whole-site result remains:

```text
UNRESOLVED @ SCREENING
```

while:

```text
routeExhaustion = NOT_IMPLEMENTED
incompatible = NOT_ADMITTED
```

This is consistent with compatibility-before-adaptation and DPL-03.

One candidate, route or obligation failure cannot establish site incompatibility if another admitted conformance-preserving route may remain.

No invariant site-level blocker is currently encoded as sufficient terminal authority.

---

## 8. Identity / invalidation

### Verdict

PASS at the current canonical-result scope.

DPL-13C identity includes:

- canonical case fingerprint;
- deployment case/result fingerprints;
- site manifest identity;
- authored candidate identity;
- DPL-13B readiness identity and result fingerprint;
- canonicalized aggregation records and per-record fingerprints;
- future-due set;
- direct site-interface claim authority;
- proof-boundary state.

Material aggregation-record change invalidates both identity and result fingerprint.

Record ordering is canonicalized and identity-neutral.

Site-manifest/readiness mismatch is rejected before aggregation.

### Remaining identity caution

DPL-13C is only controlled for the current canonical synthetic case contract. Future second-fixture work must prove that borough/local-target identity and any changed site-evidence topology are themselves incorporated into the canonical composition identity before using this aggregator outside DPL-RS-01.

---

## 9. Direct DPL-08 authority boundary

### Verdict

PASS.

The direct datum bridge:

```text
RS-FFL-01
  → SITE_INTERFACE
  → DPL-08B:GI-D02-DATUM
```

remains separately identity-bearing and is not converted into an aggregation PASS.

The test explicitly proves the authority id does not appear as a substantive aggregation source.

This preserves the distinction between ownership of an authored datum response and discharge of wider ground/interface obligations.

---

## 10. M4 scope decision

### Decision

DPL remains **M4**, with a further bounded scope broadening.

Previous controlled scope after DPL-I:

> deterministic bounded canonical synthetic deployment-case integration plus controlled SCREENING owner-universe / coverage-readiness composition.

New controlled scope after DPL-13C + DPL-J:

> **deterministic bounded canonical synthetic deployment-case integration, controlled SCREENING owner-universe / coverage-readiness composition, and the canonical DPL-RS-01 whole-site `UNRESOLVED @ SCREENING` result proposition.**

This is not a claim that the general whole-site result system is validated across sites.

It is not positive compatibility authority.

It is not incompatibility authority.

It is not M5.

---

## 11. Positive compatibility prerequisite — dominant blocker

DPL-13C proves that the next obstacle is no longer aggregation mechanics.

The dominant positive-readiness problem is **fixture/evidence disposition**, not another generic conclusion function.

The canonical DPL-RS-01 fixture is intentionally excellent for proving `UNRESOLVED` because it preserves:

- no real borough assignment;
- multiple `UNKNOWN` site claims;
- synthetic assumptions;
- absent external evidence and professional/planning determinations.

Those same properties make it structurally unsuitable for proving positive readiness.

Two local-planning entries can never become positively classified while the fixture remains no-borough.

Seventeen acceleration questions also remain classification blockers because the relevant synthetic claims are unresolved/assumed.

Even if those classifications were resolved, several due-now substantive routes would still require real or explicitly modelled external evidence/judgement.

Therefore the next packet must not be "make DPL-RS-01 pass".

---

## 12. Second fixture decision

### Decision

> **A second bounded synthetic fixture is now required before any positive-result implementation is considered. A real site is still not required.**

This is not realism optics.

The second fixture now answers a material semantic/generalisation question that DPL-RS-01 cannot:

> **Can the same controlled aggregation machinery compose a borough-assigned, more fully classified synthetic site without depending on the no-borough/UNKNOWN ecology that guarantees the current middle result?**

The fixture should use existing controlled authority only.

Recommended minimum:

- new synthetic site identity, provisionally `DPL-RS-02`;
- explicit London strategic target plus one already-controlled local borough target;
- prefer the existing Croydon target because it is the first controlled local plugin and does not require new borough research;
- enough authored synthetic facts to resolve selected acceleration/due-classification questions deliberately;
- UNKNOWN remains where evidence is intentionally absent;
- no synthetic fact may pretend to be title, survey, provider, building-control or professional evidence;
- one authored Reference House deployment candidate, not an optimiser-selected candidate;
- reuse the same DPL-13B/DPL-13C machinery rather than fork semantics;
- prove that local-target and changed site disposition participate in case/readiness/result identity;
- continue to refuse `COMPATIBLE` and `INCOMPATIBLE`.

The objective is **positive-readiness generalisation**, not a positive conclusion.

---

## 13. Exact next packet

After DPL-J merges, open only:

> **DPL-13D — second canonical synthetic fixture / borough-assigned positive-readiness generalisation case**

DPL-13D must determine whether the existing DPL-13B/DPL-13C machinery survives a second controlled synthetic composition with a real controlled borough target and materially different due-classification state.

It must not implement `COMPATIBLE @ SCREENING`.

After DPL-13D lands, run a fresh gate before any positive-result rule is admitted.

---

## 14. DPL-13D minimum acceptance contract

The next packet should close only if:

1. a second synthetic site has its own deterministic site identity;
2. local borough target assignment is explicit and existing-authority-backed;
3. strategic→local planning graph identity is proved, not inferred;
4. no DPL-RS-01 mutation occurs;
5. selected site facts deliberately change at least one current classification outcome;
6. absent external evidence remains unresolved rather than synthetically discharged;
7. candidate authorship remains explicit and non-optimising;
8. DPL-13B owner-universe/readiness composition succeeds for the new fixture or fails closed for a named reason;
9. DPL-13C aggregation succeeds or fails closed without fixture-specific code paths;
10. case/readiness/aggregation identity changes materially from DPL-RS-01;
11. `COMPATIBLE` remains unavailable even if the second fixture is materially better classified;
12. no real-site evidence claim is made.

---

## 15. Work still held

Continue to hold:

- `COMPATIBLE @ SCREENING` implementation;
- `INCOMPATIBLE` implementation;
- route search / optimisation / exhaustion;
- DPL-14D bulk corpus expansion;
- DPL-15 real-site deployment trials;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 final closeout;
- generic all-borough ontology;
- new borough research not required by the second synthetic fixture;
- unrelated technical/interface expansion;
- Reference House geometry changes;
- DRW changes.

---

## Closeout

The first whole-site result has now earned a narrow controlled status.

The critical next move is not to make the compiler more optimistic. It is to change the experiment.

> **DPL-RS-01 proved that the system can honestly say “unresolved” when the declared scope is complete. DPL-13D must now prove that this is a result of the case, not a permanent property of the machinery.**
