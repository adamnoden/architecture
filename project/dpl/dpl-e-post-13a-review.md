# DPL-E — Post-DPL-13A Canonical Compile Review and Conclusion-Readiness Admission Gate

**Issue:** [#426 — DPL-E — post-DPL-13A canonical compile review and conclusion-readiness admission gate](https://github.com/adamnoden/architecture/issues/426)  
**Programme:** [#299 — DPL](https://github.com/adamnoden/architecture/issues/299)  
**Prior gate:** [DPL-D](dpl-wave-d-integration-admission-review.md)  
**Canonical specimen:** [DPL-13A](dpl-13a-canonical-reference-site-compile.md)  
**Landed baseline:** `41b7ef27cb648424d9bb8561f58d6b0b2462b3f6`  
**Review date:** 2026-10-22  
**Disposition:** **PASS — PROMOTE DPL TO M4 AT BOUNDED CANONICAL-COMPILE / NO-CONCLUSION SCOPE; AUTHORISE OWNER-SIDE COVERAGE REGISTRIES ONLY; HOLD DPL-13B AND WHOLE-SITE CONCLUSIONS**

## 1. Decision

DPL-13A survives adversarial review as a genuine internally controlled canonical integration baseline.

DPL therefore earns:

> **M4 — Internally validated / controlled**

but only at the following stated scope:

> **Deterministic assembly and bounded evaluation of an explicitly authored Reference House × synthetic Reference Site deployment case, with site/candidate/target/interface/coverage authority separated and whole-site conclusion authority explicitly absent.**

This M4 claim does **not** establish:

- a valid whole-site `COMPATIBLE`, `UNRESOLVED` or `INCOMPATIBLE` result;
- complete SCREENING obligation coverage;
- real-site deployability;
- Building Regulations compliance;
- planning acceptability or permission likelihood;
- legal/title adequacy;
- drainage, utilities, ground or structural adequacy;
- route exhaustion;
- external validation.

The next blocker is no longer case orchestration.

It is **authoritative coverage of the obligation/conformance families that define the requested assurance profile**.

DPL-E therefore does **not** admit DPL-13B yet.

Instead it authorises one bounded lateral coverage-foundation wave under the existing owners:

1. **DPL-02C — Reference House conformance coverage registry**;
2. **DPL-09D — England SCREENING family coverage registry**;
3. **DPL-11B — non-planning SCREENING family coverage registry**.

These packets may run laterally because each transcribes already-frozen authority into a machine-readable coverage contract without depending on the others.

After all three land, a new integration gate must decide whether DPL-13B is justified and exactly what conclusion-readiness semantics it may implement.

Whole-site conclusions remain held.

---

## 2. DPL-13A canonical specimen attack

DPL-13A is not merely a green fixture.

It survives the specific attacks that previously prevented DPL from being a controlled integrated baseline.

### 2.1 Determinism is semantic, not byte-order coincidence

The canonical case separately fingerprints:

- DPL-RS-01 site manifest;
- DPL-07 site authority;
- authored candidate architecture + placement;
- underlying deployment case;
- coverage manifest;
- coverage authority set;
- canonical case;
- canonical result.

Tests prove semantically irrelevant reordering of:

- site claims;
- targets;
- interfaces;
- coverage entries;
- coverage authority-source lists;

does not alter the canonical identity.

Material changes do.

That is the correct internal-control property.

### 2.2 Site provenance survives canonicalisation

The fixture remains:

`SYNTHETIC_REFERENCE`

All 29 frozen DPL-07 claim ids are carried into the machine-readable manifest.

Eleven remain explicit `UNKNOWN` claims.

Unknowns are not converted to zero, false, `NOT_APPLICABLE` or a convenient proposal fact.

Changing a claim's basis changes canonical identity.

This prevents canonical status from laundering synthetic assumptions into measured or authoritative real-site evidence.

### 2.3 Candidate authorship remains outside the compiler

The canonical candidate uses the DPL-07-authored:

- current unmirrored Reference House;
- rigid 180° placement;
- `RH-V02` route;
- exact placement/bounding-box authority.

Changing site placement changes canonical candidate/case identity while leaving the underlying Reference House architectural conformance result unchanged.

This is a strong proof that the system distinguishes:

```text
architecture identity
        ≠
site placement identity
```

The compiler still does not search or optimise.

### 2.4 Candidate failure remains local

The adversarial 250 mm stair test produces:

`REQUIRES_REFERENCE_HOUSE_REVISION`

for the candidate clause.

It does not create site `INCOMPATIBLE`.

Route exhaustion remains explicitly absent.

### 2.5 Borough restraint survives the canonical path

DPL-RS-01 has no real borough.

The canonical compiler rejects fabricated Croydon/Bromley composition and records:

`localBoroughTarget = NOT_ASSIGNED_SYNTHETIC_REFERENCE`

It does not reinterpret this as general local-policy non-applicability.

### 2.6 Coverage scope is independently invalidating

Changing the coverage manifest changes canonical case/result identity even if the architecture and represented obligation ledger are unchanged.

That is essential.

It proves the compile's claimed scope is itself part of result provenance rather than invisible commentary.

### 2.7 Whole-site conclusion remains absent under pressure

The canonical proof boundary still says:

```text
wholeSiteCompatibilityConclusion = NOT_IMPLEMENTED
conclusionReadiness = NOT_ESTABLISHED
coverageCompleteness = NOT_ESTABLISHED
routeExhaustion = NOT_IMPLEMENTED
architecturalCandidateSelection = NOT_IMPLEMENTED
```

A complete green CI run therefore does not masquerade as deployability.

### DPL-13A rewind decision

**No rewind required.**

The canonical specimen is fit to become the controlled baseline for subsequent coverage work.

---

## 3. Maturity decision — M4 is earned at a narrow scope

The project maturity definition for M4 is:

> **The proposition has been deliberately challenged against internal tests or evidence and is stable enough to act as the controlled baseline.**

DPL now satisfies that definition for the proposition actually proved by DPL-13A.

### Evidence for promotion

DPL has survived, cumulatively:

- ontology/foundation coherence review;
- typed target-composition challenge;
- real-site corpus challenge;
- mixed technical/planning method orchestration;
- Croydon local-planning composition;
- Bromley anti-overfit replay;
- candidate/conformance implementation with negative controls;
- Wave-C water and corpus integration;
- exact synthetic canonical case assembly;
- deterministic identity/invalidation tests;
- explicit unknown preservation;
- fabricated-borough rejection;
- candidate-failure ≠ site-incompatibility proof;
- explicit coverage incompleteness;
- repeated full repository/publication validation.

The canonical integration proposition is therefore stable enough to be the controlled baseline.

### Why this does not overclaim

The M4 scope is intentionally **not** “deployment result validity”.

It is:

> **canonical deployment-case integration, without whole-site conclusion authority.**

The distinction is visible in both the maturity text and executable proof boundary.

A later whole-site conclusion layer must earn its own internal-control evidence before the DPL M4 claim can be broadened to include it.

### M5 remains distant

M5 would require competent independent / real-world validation at the claimed scope.

DPL has none yet.

---

## 4. The coverage problem is now precise

DPL-D correctly refused even official runtime `UNRESOLVED @ SCREENING` because the runtime could not prove the scope over which that conclusion would be derived.

DPL-13A confirms that diagnosis.

The missing object is not “more rules”.

It is a **profile coverage contract** answering, for every material family in the declared scope:

```text
what family exists?
who owns its authority?
is it due now at this profile?
is it legitimately future due?
has a known fact accelerated it to now?
is applicability itself unresolved?
is it represented natively, externally, or only as a known gap?
what evidence/resolution route exists?
does its current state block a positive conclusion?
```

A coverage contract is complete only when an absent family cannot silently escape the conclusion universe.

---

## 5. Coverage vocabulary to preserve

Future conclusion-readiness machinery needs, at minimum, distinct states for:

### `DUE_NOW_REPRESENTED`

The family is due at the requested profile and has a represented obligation/evidence route.

Its result may still be `UNRESOLVED`, `UNSUPPORTED`, externally discharged, pass or fail.

### `DUE_NOW_MISSING`

The family is known to be due now but no adequate represented obligation/evidence route exists.

This is itself a blocker to positive compatibility and a blocker to claiming coverage completeness.

### `FUTURE_DUE`

The family is genuinely deferred by DPL-04 at the requested profile.

It remains visible but does not block the current profile unless accelerated.

### `ACCELERATED_DUE_NOW`

A normally later family has become decision-critical because a known current fact/red flag triggers early resolution.

### `DUE_CLASSIFICATION_UNRESOLVED`

The system knows the family may matter but lacks enough applicability/profile authority to classify it safely as current or future due.

This blocks coverage completeness.

### `NOT_APPLICABLE_PROVED`

Applicability has been established false by admitted authority/facts.

It must never be a default for missing data.

### `ADVISORY_NON_BLOCKING`

A visible project/advisory family that does not belong to the mandatory blocking set at the current profile.

These are coverage dispositions, not substitutes for DPL-03 obligation results.

---

## 6. DPL-11 is the largest coherent owner-side gap

DPL-11 already contains the required conceptual authority.

It distinguishes:

- site claims;
- evidence/source records;
- external determinations/agreements;
- deployment consequences.

It also records assurance posture and acceleration triggers across its due-diligence families.

The missing step is machine-readable family coverage, not new legal adjudication.

### Authorise DPL-11B

**DPL-11B — non-planning SCREENING family coverage registry** should:

- enumerate every DPL-11 constraint family with stable id;
- preserve source/evidence authority class;
- record default SCREENING timing (`DUE_NOW`, `FUTURE_DUE`, conditional/unknown as earned by DPL-04/11);
- record decision-critical acceleration triggers at family level without deciding whether a particular site triggers them unless explicit facts exist;
- identify the acceptable resolution mode (`NATIVE_APPLICABILITY_ONLY`, `EXTERNAL_LEGAL`, `EXTERNAL_PROFESSIONAL`, `UNDERTAKER`, `SURVEY`, `PROCESS`, etc.);
- distinguish applicability evidence from substantive external determination;
- record whether current DPL runtime has a represented obligation family;
- avoid any `site_legal_ok = true` / `ground_ok = true` simplification.

DPL-11B does **not** need to implement legal, geotechnical, sewer, utility or Party Wall judgement.

Its product is a controlled family registry suitable for profile coverage composition.

---

## 7. DPL-02 needs coverage, not universal native conformance code

DPL-02 already freezes:

- seven `IDENTITY_INVARIANT` clauses;
- fifteen `PROTECTED_ORDER` clauses;
- two explicit discrete variants;
- six site-interface freedoms;
- eight implementation freedoms;
- open/preference/superseded exclusions.

DPL-12B natively evaluates only the clauses for which controlled machine facts already exist.

That is not a defect.

A valid SCREENING conclusion does **not** require every architectural clause to become a deterministic boolean.

It does require the complete applicable conformance universe to be visible.

### Authorise DPL-02C

**DPL-02C — Reference House conformance coverage registry** should:

- enumerate every current DPL-02 conformance clause/route with stable id/class;
- record owning Reference House authority;
- distinguish current resolution modes:
  - native executable;
  - external/architectural review;
  - candidate-authored route selection;
  - site-interface evidence;
  - implementation/future detail;
  - genuinely open/not yet classifiable;
- state the default SCREENING relevance/blocking posture;
- record when an `OPEN` or externally reviewed clause prevents a positive Reference House conformance claim;
- preserve `RH-V01` / `RH-V02` as enumerable routes without introducing search;
- avoid converting descriptive architectural relationships into invented numeric surrogates.

DPL-02C should not add native clause evaluators unless a clause's existing authority and controlled data make the evaluator trivial and unavoidable. Its purpose is coverage first.

---

## 8. England target needs a family registry, not a full rules compiler

DPL-09 already provides a broad England new-dwelling inventory.

It explicitly distinguishes:

- substantive technical families;
- statutory process/dutyholder families;
- transition/source selection;
- Approved Documents/guidance;
- external standards/professional evidence;
- project/site applicability facts.

It also already records the important principle:

> **A family may be applicable while its native method is unsupported and its discharge route is competent external evidence.**

That is exactly what SCREENING coverage needs.

### Authorise DPL-09D

**DPL-09D — England SCREENING family coverage registry** should:

- enumerate the DPL-09 technical and process families relevant to the declared project class;
- preserve applicability class (`CORE`, `CONDITIONAL`, `PROJECT_CLASS_EXCLUDED`, transition-dependent, etc.);
- record default SCREENING timing under DPL-04;
- record decision-critical acceleration triggers at family level where justified;
- map currently implemented target slices (09B/09C, existing RH-C5 where relevant) without pretending those slices are whole-family proof;
- identify external/professional/process resolution routes;
- preserve source/transition identity requirements;
- explicitly mark target families not yet implemented;
- avoid implementing Parts B/F/G/L/O/etc. merely to make the registry green.

A complete family registry can support an authoritative `UNRESOLVED` coverage state long before the compiler can natively solve every regulation family.

That is the correct direction.

---

## 9. No DPL-10E is earned yet

DPL-E considered whether planning requires a fourth parallel registry packet now.

It does not.

Reasons:

1. DPL-10A/B already provide explicit strategic planning source/status and structured London obligations.
2. DPL-10C/D have already proved local-borough targets cannot be generalised into one ontology.
3. DPL-RS-01 has no real borough by design.
4. For the synthetic canonical fixture, the missing local-borough target can itself remain a declared `DUE_CLASSIFICATION_UNRESOLVED` / coverage limitation.
5. The next coverage substrate can be tested without inventing a local authority.

A later real-site case will require an actual local target selected by real geography.

Do not build a synthetic planning registry to hide that fact.

---

## 10. `UNRESOLVED @ SCREENING` remains held — but its prerequisite is now concrete

DPL-13A does not yet justify a whole-site `UNRESOLVED` result.

However, DPL-E can now state the minimum condition precisely.

An authoritative:

`UNRESOLVED @ SCREENING`

may become safe only when:

1. the complete declared SCREENING family universe is machine-readable from its owning registries;
2. every family has a profile disposition;
3. every `DUE_NOW` family is either represented by an executable/external obligation route or explicitly marked `DUE_NOW_MISSING`;
4. all decision-critical acceleration triggers exposed by current case facts have been applied or explicitly remain unresolved;
5. DPL-02 conformance coverage is complete as a clause universe even where resolution remains external/open;
6. target-family coverage is complete at family level even where substantive methods remain unsupported;
7. local-borough absence on DPL-RS-01 is explicitly represented as a scope limitation rather than silent non-applicability;
8. coverage completeness itself is deterministic/fingerprinted;
9. the top-level conclusion provenance names the exact profile + coverage contract revision;
10. positive compatibility remains impossible while any due blocker/missing family remains;
11. incompatibility remains impossible without route-exhaustion/invariant-blocker proof.

At that point `UNRESOLVED` would mean:

> the declared screening universe is known and incomplete/unresolved in named ways,

rather than:

> the current code happened to encounter some unknowns.

That is a meaningful semantic threshold.

---

## 11. Positive compatibility remains materially downstream

After DPL-13A, `COMPATIBLE @ SCREENING` still requires more than a coverage registry.

At minimum:

- complete SCREENING family coverage;
- every due-now blocking family represented;
- every due-now blocking obligation resolved positively / externally discharged / proven not applicable;
- complete applicable DPL-02 conformance coverage with no unresolved blocking clause;
- decision-critical acceleration handled;
- site evidence quality/currency sufficient for each due proposition;
- actual local-planning authority/target where a real site requires it;
- required external professional/legal/undertaker evidence accepted;
- target source/applicability/transition state current enough for the claim.

DPL-E authorises no positive-compatibility implementation.

---

## 12. Incompatibility / route exhaustion remains downstream

Route exhaustion is **not** the next bottleneck.

The next attainable whole-site conclusion, if any, is conservative `UNRESOLVED @ SCREENING` after coverage completeness is proved.

That conclusion does not require proving all deployment routes exhausted.

DPL therefore should not build:

- a candidate search engine;
- a generic optimisation grammar;
- variant enumeration beyond existing authorised routes;
- site-interface search machinery.

Keep route exhaustion held until a real candidate/blocker is being considered for `INCOMPATIBLE`.

A future bounded invariant-blocker proof may be worthwhile where a single categorical site fact defeats every admitted route by construction, but no such packet is earned by DPL-13A alone.

---

## 13. No second real-site canonical fixture yet

A real-borough second fixture would eventually be valuable.

It is not the next move.

A real-site compile today would inherit the same unresolved coverage semantics and add evidence acquisition/local-target complexity before the coverage contract exists.

That would make diagnosis harder, not stronger.

The synthetic canonical fixture is currently ideal for coverage work because:

- site provenance is controlled;
- unknowns are explicit;
- no property acquisition/recommendation is implied;
- local-borough absence is a visible test case rather than hidden noise.

DPL-15 remains held.

Reconsider a second fixture only after the coverage registries and their integration have established conclusion-readiness semantics.

---

## 14. Exact next wave

DPL-E authorises **Coverage Foundations** only.

The following three packets may proceed laterally after this gate merges:

### DPL-02C — Reference House conformance coverage registry

Owner: DPL-02 / Reference House conformance.

Purpose: make the full clause/route universe machine-readable without inventing universal native conformance methods.

### DPL-09D — England SCREENING family coverage registry

Owner: DPL-09.

Purpose: make the England technical/process family universe and SCREENING profile posture machine-readable without implementing the entire regulations corpus.

### DPL-11B — non-planning SCREENING family coverage registry

Owner: DPL-11.

Purpose: make private-law/infrastructure/ground/access/utility family coverage and evidence-resolution posture machine-readable without impersonating external professionals/authorities.

### After all three

Do **not** automatically start DPL-13B.

Run a small integration/admission gate:

> **DPL-F — post-Coverage-Foundations integration and DPL-13B admission gate.**

DPL-F must test whether the three owner registries plus existing planning/site/canonical authority form a complete enough SCREENING family universe to admit conclusion-readiness implementation.

DPL-13B remains held until DPL-F.

This ordering keeps substantive authority with its owners and prevents the generic compiler layer from defining law, architecture or due diligence by convenience.

---

## 15. Programme maturity after this gate

Promote DPL to:

> **M4 — Internally validated / controlled at bounded canonical synthetic deployment-case integration scope, explicitly excluding whole-site conclusion readiness.**

The controlled baseline consists of the foundation through DPL-13A and the DPL-E proof boundary.

Any future conclusion-readiness work extends the proposition and must be challenged before that wider scope can inherit the M4 claim.

M5 remains unavailable without competent independent / real-world validation.

---

## 16. Downstream restraint

Continue to hold:

- DPL-13B+;
- runtime whole-site `COMPATIBLE / UNRESOLVED / INCOMPATIBLE`;
- DPL-14D bulk corpus expansion;
- DPL-15 real-site deployment trials;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 final adversarial closeout;
- generic all-borough machinery;
- unrelated additional DPL-08/09 technical slices;
- route-search/optimisation machinery;
- DRW changes.

Coverage Foundations first.

---

## 17. Gate closeout

**DPL-E PASS.**

DPL has earned an internally controlled canonical integration baseline.

The canonical case proves both sides of the proposition:

- the system can assemble deployment truth deterministically without losing authority boundaries;
- deterministic assembly alone does not authorise a deployment conclusion.

The next work should therefore make the **scope of evaluation** explicit before making the **result of evaluation** more ambitious.

That is the role of DPL-02C, DPL-09D and DPL-11B.
