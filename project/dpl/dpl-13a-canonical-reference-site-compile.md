# DPL-13A — Canonical Reference Site Case Assembly and Deterministic Deployment Ledger

**Issue:** [#423 — DPL-13A — canonical Reference Site case assembly and deterministic deployment ledger](https://github.com/adamnoden/architecture/issues/423)  
**Programme:** [#299 — DPL](https://github.com/adamnoden/architecture/issues/299)  
**Authorised by:** [DPL-D / #420](dpl-wave-d-integration-admission-review.md), landed through PR #421  
**Baseline `main`:** `0b2f2df9e5eeed3514d38a21fead2839e93bfc16`  
**Implementation PR:** #424  
**Validated implementation head before this result record:** `dd82e2a0706c297a1c275181b422f7f2be30f618`  
**Validation run:** `39748348252` — full PR validation PASS  
**Disposition:** **PASS — first canonical synthetic deployment case is executable and deterministic; whole-site conclusion authority remains deliberately absent**

## 1. Question

> **When the controlled Reference House, the already-authored DPL-RS-01 placement, explicit synthetic site claims/unknowns, current interface authority and bounded England/London targets are forced into one reproducible case, what exactly is represented, unresolved, unsupported or still outside runtime coverage?**

DPL-13A answers this without manufacturing a deployability verdict.

The first canonical Reference House × Reference Site case now exists as one deterministic compile family.

It integrates:

- the controlled Reference House source identity;
- a machine-readable DPL-RS-01 synthetic site manifest;
- one explicit authored deployment candidate using DPL-07's already-selected unmirrored rigid 180° placement under `RH-V02`;
- bounded DPL-02 candidate conformance;
- DPL-08B and DPL-08C interface identities;
- DPL-09B and DPL-09C England technical target slices;
- the London strategic planning target;
- a first-class coverage manifest declaring represented families and known gaps;
- deterministic site, candidate, deployment-case, coverage, canonical-case and result fingerprints.

It does **not** emit `COMPATIBLE`, `UNRESOLVED` or `INCOMPATIBLE` as a whole-site conclusion.

That is the central success condition, not an omission.

---

## 2. Controlled artefacts

### Reference Site manifest

`project/dpl/reference-site/dpl-rs-01-v01.json`

Schema:

`dpl.referenceSiteManifest.v1`

Identity:

`DPL-RS-01-SM-v0.1`

The manifest is a transcription of DPL-07 authority rather than a new site design.

It preserves all **29** frozen DPL-07 claim ids.

Of those:

- **18** are authored/derived synthetic fixture claims;
- **11** remain explicit `UNKNOWN` claims.

The unknown set includes, among other matters:

- exact neighbour openings;
- tree/root constraints;
- geotechnical / groundwater / contamination / gas conditions;
- sewer route/depth/capacity/connection rights;
- lawful surface-water strategy;
- utility capacity/routes;
- title detail / covenants / easements / rights;
- flood condition;
- external noise;
- ecology;
- detailed construction logistics.

The manifest does not substitute zero, `false`, `NOT_APPLICABLE` or an inferred value for any of them.

### Coverage manifest

`project/dpl/reference-site/dpl-13a-coverage-v1.json`

Schema:

`dpl.canonicalCoverageManifest.v1`

Identity:

`DPL-13A-COVERAGE-v1`

It records five distinct coverage classes:

1. `RUNTIME_REPRESENTED`;
2. `SITE_CLAIM_ONLY`;
3. `KNOWN_RUNTIME_GAP`;
4. `FUTURE_DUE_WHERE_ESTABLISHED`;
5. `DUE_CLASSIFICATION_NOT_ESTABLISHED`.

It explicitly records:

```text
coverageCompleteness = NOT_ESTABLISHED
conclusionReadiness = NOT_ESTABLISHED
```

The manifest is not a score, percentage or claim that every deployment family has been enumerated.

### Canonical compiler wrapper

`compiler/dpl/canonical.ts`

The wrapper composes the canonical fixture above the existing `compileDeploymentCase` runtime.

It does not create a second obligation evaluator and does not widen the generic DPL-12 core merely for canonical-fixture convenience.

### Regression proof

`compiler/dpl/dpl13a.test.ts`

The complete DPL suite now contains **41 passing tests** at the validated implementation head.

---

## 3. Canonical site result

The canonical site remains exactly:

`SYNTHETIC_REFERENCE`

It is not a real London parcel and is not asserted to be typical.

The compiler preserves:

- parcel 17.4 × 30.0 m;
- derived 522 m² area;
- local XY/Z frame;
- north street / south rear-garden convention;
- broad synthetic north→south ground fall;
- DPL-07 synthetic neighbours and tree assumptions;
- synthetic street-context sewer/utilities assumptions;
- every explicit unknown from the v0.1 claim register.

The canonical runtime normalization uses:

`SYNTHETIC_REFERENCE_NO_BOROUGH`

as an explicit machine sentinel.

That is not a planning conclusion.

It means only:

> DPL-RS-01 is intentionally not assigned to a real local planning authority.

The canonical target composition therefore contains London strategic planning but no Croydon, Bromley or invented local-borough target.

---

## 4. Canonical authored candidate

The candidate is not generated by the compiler.

Its architectural source is the current controlled Reference House.

Its placement source is DPL-07 claim:

`RS-HOUSE-XFORM-01`

The selected route is:

`RH-V02 — rigid site placement / cardinal orientation`

The candidate preserves:

- current unmirrored Reference House;
- rigid 180° rotation;
- bounding box X 3.0–15.0 m / Y 14.0–24.8 m;
- west 3.0 m technical/service side field;
- east 2.4 m principal side field;
- north/front 5.2 m setback;
- south/rear 14.0 m garden depth;
- synthetic ground FFL datum +100 mm.

The compiler does not search, rank or optimise alternative rotations or handedness.

The canonical candidate conforms on every currently native DPL-02 architectural clause:

- `RH-I02`;
- `RH-PROT-01`;
- `RH-PROT-04`;
- `RH-PROT-06`;
- `RH-V02` route use.

Other DPL-02 clauses remain explicit `OPEN` coverage where no executable authority exists.

A deliberately broken 250 mm stair candidate correctly returns a candidate-level `REQUIRES_REFERENCE_HOUSE_REVISION` finding without creating site incompatibility.

---

## 5. Canonical target / interface composition

### Interface identities

The case includes:

- `DPL-08B-GROUND-DATUM-PLINTH-APPROACH`;
- `DPL-08C-FOUL-SURFACE-SITE-WATER`.

These are interface authority identities, not proof that their external/site questions are solved.

### England targets

The case includes:

- `ENG-BC-STRUCTURE-GROUND-MOISTURE-MATERIALS-2026-10-20`;
- `ENG-BC-DRAINAGE-WASTE-WATER-2026-10-21`.

These remain bounded slices, not complete Building Regulations coverage.

### Planning

The case includes:

- `LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20`.

It deliberately contains **no local borough target**.

That absence is represented in the canonical proof boundary as:

`localBoroughTarget = NOT_ASSIGNED_SYNTHETIC_REFERENCE`

It must never be interpreted as:

`local planning policy = NOT_APPLICABLE on real London sites`.

---

## 6. Deterministic identity result

The canonical compile distinguishes and fingerprints several different identities rather than collapsing everything into one hash.

### Site identity

Includes:

- canonicalized Reference Site manifest;
- exact DPL-07 authority-source content fingerprint.

### Candidate identity

Includes:

- DPL-12B architectural candidate input;
- DPL-07 placement transform / bounding box;
- placement authority claim identity.

This separation matters.

Moving the house on the synthetic site changes the canonical candidate/case identity even if the underlying Reference House architecture remains unchanged and its DPL-02 architectural conformance result remains identical.

### Coverage identity

Includes:

- canonicalized coverage manifest;
- fingerprints of the underlying authority sources named by that manifest.

Changing the declared coverage scope therefore invalidates the canonical case/result even if the represented architecture and obligations are unchanged.

### Deployment ledger identity

Retains the existing DPL-12 case fingerprinting for:

- Reference House source;
- site runtime identity;
- interfaces;
- targets;
- proposal facts;
- evidence;
- candidate identity.

### Ordering invariance

Tests prove that semantically irrelevant reordering of:

- site claims;
- coverage entries;
- coverage authority-source lists;
- targets;
- interfaces;

does not change canonical identity.

---

## 7. What the canonical case exposes

The most important DPL-13A finding is that **runtime composition is no longer the dominant blocker**.

The canonical machinery can now assemble the controlled case repeatably.

The dominant blocker is **scope coverage**.

### 7.1 Reference House conformance coverage remains bounded

The native DPL-12B subset is useful but does not establish complete Reference House conformance.

The canonical case therefore records both:

- represented native conformance;
- `COV-RH-CONFORMANCE-OPEN`.

### 7.2 DPL-11 is semantically mature but not runtime-complete

The coverage manifest explicitly names current gaps for:

- title/control and precise boundary authority;
- private rights / covenants / easements / rights of way;
- Party Wall / neighbour process;
- public sewer / undertaker relationship;
- utilities;
- ground/geotechnics/contamination/tree-ground evidence;
- physical water/flood evidence;
- construction logistics.

The canonical compiler does not mine DPL-11 prose into fake deterministic obligations.

### 7.3 England target coverage remains partial

DPL-09B/C execute as intended but do not constitute the whole England new-dwelling technical obligation universe.

The coverage manifest therefore names:

`COV-ENGLAND-TARGET-COMPLETENESS`

as a runtime gap.

### 7.4 Site claims are not automatically obligations

All 29 Reference Site claims are represented, but not every claim has a profile-aware executable obligation attached to it.

That remains:

`COV-CLAIM-OBLIGATION-MAPPING`.

This is the crucial seam between “the system knows an unknown exists” and “the system has proved whether that unknown is due now, future due, or decision-blocking at SCREENING.”

### 7.5 Local planning is intentionally unresolved at fixture-design level

A real London parcel would normally bring a local borough target.

The synthetic Reference Site has no real borough.

The coverage manifest therefore records the local target as:

`DUE_CLASSIFICATION_NOT_ESTABLISHED`

for the purposes of general real-site deployment.

The canonical fixture does not solve that by inventing geography.

### 7.6 Route exhaustion is still absent

Candidate failure still cannot become site `INCOMPATIBLE`.

The canonical case records:

`COV-ROUTE-EXHAUSTION`.

---

## 8. Whole-site conclusion boundary survived the canonical compile

The canonical result preserves:

```text
wholeSiteCompatibilityConclusion = NOT_IMPLEMENTED
conclusionReadiness = NOT_ESTABLISHED
coverageCompleteness = NOT_ESTABLISHED
routeExhaustion = NOT_IMPLEMENTED
architecturalCandidateSelection = NOT_IMPLEMENTED
localBoroughTarget = NOT_ASSIGNED_SYNTHETIC_REFERENCE
```

No object named `compatibility`, `deploymentConclusion` or `wholeSiteConclusion` is emitted by the canonical wrapper.

This matters because the canonical fixture could easily have created a false sense of completeness simply by being deterministic and green.

DPL-13A proves the opposite:

> **Deterministic integration is not the same thing as complete deployment evaluation.**

Even official top-level `UNRESOLVED @ SCREENING` remains unearned because the runtime has not yet proved the full SCREENING obligation scope over which that conclusion would be derived.

---

## 9. Adversarial findings

### Could synthetic assumptions be mistaken for real evidence?

The manifest carries basis/state on each claim and retains `SYNTHETIC_REFERENCE` in site identity.

Changing claim basis changes canonical identity.

This prevents an assumption→measurement upgrade from being semantically invisible.

### Could missing/unknown values become safe defaults?

No.

Unknown claims have no manufactured `value` and are not injected into proposal facts as false/zero defaults.

### Could a no-borough fixture accidentally imply no local planning?

No.

The canonical compiler rejects fabricated Croydon/Bromley targets and explicitly records the no-real-borough limitation.

### Could a green represented ledger imply compatibility?

No.

Coverage completeness and conclusion readiness remain independently `NOT_ESTABLISHED`.

### Could coverage-manifest presence itself imply completeness?

No.

The manifest explicitly contains known gaps and an unestablished due-classification family.

### Could a failed authored candidate imply site incompatibility?

No.

The broken-candidate test proves candidate failure remains local while route exhaustion and whole-site conclusion remain unimplemented.

### Could the compiler silently optimise the Reference Site transform?

No.

The authored placement is a separate input identity sourced from DPL-07 and is not generated by the compiler.

---

## 10. Validation

Validated implementation head before this result record:

`dd82e2a0706c297a1c275181b422f7f2be30f618`

PR validation run:

`39748348252`

Result:

**PASS**

Including:

- repository health;
- TypeScript;
- complete test suite;
- **41/41 DPL tests**;
- public nomenclature source validation;
- publication PDF rebuild;
- publication PDF metadata;
- plate rhythm;
- rendered public nomenclature;
- nomenclature regressions;
- reader-facing inventory.

This result record itself still requires the ordinary final exact-head PR re-proof before merge.

---

## 11. Recommendation after DPL-13A

Do **not** open DPL-13B automatically.

The canonical compile has changed the question enough to justify a dedicated integration/adversarial review first.

Recommended next gate:

> **DPL-E — post-DPL-13A canonical compile review / conclusion-readiness admission gate.**

That gate should attack at least:

1. whether the coverage manifest is a sufficiently disciplined substrate for profile-aware conclusion work;
2. which SCREENING families must become explicit due-now obligations before even top-level `UNRESOLVED` can be authoritative;
3. whether missing DPL-11 runtime coverage belongs in one compiler packet or several owner-specific packets;
4. how much additional DPL-02 conformance coverage is genuinely needed for SCREENING;
5. whether the synthetic no-borough fixture can support conclusion-readiness research without a second canonical fixture carrying a real local target;
6. whether route-exhaustion work is needed now or can remain downstream because the first plausible canonical conclusion is likely conservative/unresolved;
7. whether DPL has earned M4 after the canonical integrated specimen and adversarial review, or still requires one more internally controlled conclusion-readiness proof.

Until that review lands, hold:

- DPL-13B+;
- runtime whole-site `COMPATIBLE / UNRESOLVED / INCOMPATIBLE`;
- DPL-15 real-site trials;
- bulk corpus expansion;
- further technical/interface families not demanded by the canonical review;
- generic all-borough machinery;
- DRW changes.

---

## 12. Closeout

**DPL-13A PASS.**

The first canonical deployment case now exists.

It proves that Ovid's House can place the controlled Reference House, an explicitly authored synthetic site/candidate, current site-interface authority and bounded England/London targets into one reproducible deployment ledger while retaining uncertainty and authority boundaries.

It also proves why a whole-site conclusion is still premature.

The next problem is no longer case assembly.

It is:

> **How do we prove that the obligation scope itself is complete enough for a stated assurance profile before deriving a whole-site conclusion from the ledger?**

That is the question the post-DPL-13A review should admit, narrow or reject.
