# DPL-02C — Reference House Conformance Coverage Registry

**Issue:** [#428 — DPL-02C — Reference House conformance coverage registry](https://github.com/adamnoden/architecture/issues/428)  
**Programme:** [#299 — DPL](https://github.com/adamnoden/architecture/issues/299)  
**Authorised by:** [DPL-E / #426](dpl-e-post-13a-review.md)  
**Baseline `main`:** `541766736ff491feb5c025cb7a55b5680d6e6ab1`  
**Implementation PR:** #431  
**Disposition:** **PASS — complete current DPL-02 clause/route universe is machine-readable as coverage authority without expanding native conformance or whole-site conclusion authority**

## 1. Question

> **Can the compiler know, exhaustively and reproducibly, which Reference House conformance clauses/routes exist, who owns them, how each is currently resolvable, and whether unresolved coverage blocks a SCREENING-level positive conformance claim—without inventing new architectural rules?**

**Yes.**

DPL-02C turns the already-frozen DPL-02 contract into a controlled coverage registry while preserving the central distinction:

> **Clause existence / coverage is not clause resolution.**

A registry entry says that a conformance proposition belongs to the controlled universe and records its current resolution posture. It does not itself produce `CONFORMS`, `NON_CONFORMING`, `REQUIRES_REFERENCE_HOUSE_REVISION` or `OPEN`.

The actual candidate-level conformance evaluator remains DPL-12B.

---

## 2. Controlled artefacts

### Registry

`project/dpl/coverage/dpl-02-conformance-coverage-v1.json`

Schema:

`dpl.conformanceCoverageRegistry.v1`

Identity:

`DPL-02-CONFORMANCE-COVERAGE-v1`

### Loader / validator

`compiler/dpl/conformance-coverage.ts`

### Regression proof

`compiler/dpl/dpl02c.test.ts`

---

## 3. Complete current DPL-02 universe

The registry contains exactly **38** clause/route entries:

- **7** `IDENTITY_INVARIANT`;
- **15** `PROTECTED_ORDER`;
- **2** `PERMITTED_DISCRETE_VARIANT`;
- **6** `SITE_INTERFACE_FREEDOM`;
- **8** `IMPLEMENTATION_FREEDOM`.

It also preserves the three important non-clause categories:

- `PREFERRED`;
- `OPEN`;
- `SUPERSEDED`.

These categories exist specifically to prevent unresolved/history/preference material from becoming accidental deployment freedoms or conformance clauses.

The validator fails closed if:

- any expected id is missing;
- any duplicate id appears;
- any extra id appears outside the frozen universe;
- class counts drift;
- a class/resolution/executable/posture vocabulary is unknown;
- a variant stops being route-only;
- an implementation freedom is promoted out of its future implementation boundary;
- any entry claims independent site-incompatibility authority.

---

## 4. Native DPL-12B seam is locked bidirectionally

The registry marks exactly six current executable ids:

### Native clause checks

- `RH-I02` — open-to-sky courtyard;
- `RH-PROT-01` — principal gross geometry;
- `RH-PROT-04` — principal stair topology;
- `RH-PROT-06` — front architectural field.

### Native admitted routes

- `RH-V01` — coherent whole-house mirror;
- `RH-V02` — rigid site placement / orientation.

DPL-02C does not duplicate that executable truth in prose only.

The regression suite constructs a controlled candidate, runs the actual DPL-12B `evaluateCandidateConformance(...)` implementation and proves:

```text
registry native/native-route ids
        ==
DPL-12B executableClauseIds
```

This means drift fails in either direction:

- code adds/removes an executable clause without registry reconciliation;
- registry promotes/demotes native coverage without matching code.

No core conformance rule was expanded by DPL-02C.

---

## 5. Resolution modes

The registry uses a bounded resolution vocabulary.

### `NATIVE_EXECUTABLE`

The current candidate model and controlled Reference House source provide enough authority for a deterministic clause-level check.

This applies only to the four current native clauses.

### `AUTHORED_ROUTE_SELECTION`

An already-admitted route may be selected by an authored candidate.

This applies to `RH-V01` and `RH-V02`.

The compiler does not select, search or optimise the route.

### `ARCHITECTURAL_REVIEW`

The clause is part of Reference House identity/protected order but current authority should be assessed architecturally rather than converted into an invented numeric surrogate.

### `EXTERNAL_PROFESSIONAL_EVIDENCE`

The protected architectural proposition depends materially on competent external evidence for its implementation/resolution.

The current registry uses this where the architectural structural concept meets competent engineering evidence.

### `SITE_INTERFACE_EVIDENCE`

The clause defines a bounded deployment freedom whose use must be evidenced against an actual site/interface condition while preserving protected architecture.

### `IMPLEMENTATION_DETAIL_FUTURE`

The clause is an implementation freedom intentionally left to later technical/detail design inside the protected architecture.

### `OPEN_NOT_CLASSIFIABLE`

Reserved by the vocabulary for genuinely unclassifiable future coverage cases.

Its existence in the vocabulary does not mean any current DPL-02 clause has been reclassified there by this packet.

---

## 6. SCREENING coverage posture

DPL-02C separates coverage posture from result.

### `POSITIVE_CONFORMANCE_REQUIRES_RESOLUTION`

Identity/protected-order clauses cannot simply disappear from a future positive whole-Reference-House conformance claim because they lack native code.

An unresolved/external/open clause remains visible and blocks a complete positive conformance claim until resolved at the appropriate authority level.

### `ADMITTED_ROUTE_ONLY`

`RH-V01` / `RH-V02` are permissions, not obligations and not pass conditions.

Their presence means only that an authored candidate may invoke the route.

### `RESOLVE_IF_INVOKED`

Site-interface freedoms do not require every deployment to exercise them identically.

If a candidate relies on one, the invoked route must be evidenced and must preserve protected architecture.

### `FUTURE_IMPLEMENTATION_BOUNDARY`

Implementation freedoms remain visible boundaries but are not, merely by being unresolved in product/detail form, SCREENING blockers to current architectural conformance.

This does not waive future technical obligations.

---

## 7. Non-native clauses remain non-native

A key adversarial test uses `RH-I01`.

The registry knows:

- the clause exists;
- it is an `IDENTITY_INVARIANT`;
- its current resolution mode is `ARCHITECTURAL_REVIEW`;
- unresolved coverage blocks a complete positive conformance claim.

But evaluating a candidate through DPL-12B still returns:

`RH-I01 = OPEN`

The metadata does not cause a conformance result to appear.

That is the intended architecture.

The same principle applies across the non-native universe.

---

## 8. Route boundary survives

DPL-02C records `RH-V01` / `RH-V02` as `NATIVE_ROUTE` + `AUTHORED_ROUTE_SELECTION`.

It does not add:

- candidate generation;
- route search;
- variant ranking;
- optimisation;
- route-exhaustion state;
- automatic adaptation.

A candidate explicitly selecting `RH-V02` can receive a route-level `CONFORMS` finding from DPL-12B.

That is still only confirmation that the selected route is admitted.

It says nothing about whether the site/targets are compatible.

---

## 9. Site incompatibility remains outside clause coverage

Every registry entry carries:

`canProveSiteIncompatibilityAlone = false`

This is deliberate.

Even loss of a protected/identity clause proves that the **candidate leaves the current Reference House contract**.

It does not by itself prove that no other admitted candidate/route could work on the site.

The DPL-03 incompatibility threshold therefore remains downstream:

- route exhaustion; or
- a separately earned invariant-blocker proof.

DPL-02C implements neither.

---

## 10. Identity / drift proof

The registry is canonicalised before fingerprinting.

Therefore:

- entry ordering is identity-neutral;
- owner-reference ordering is identity-neutral;
- non-clause-category ordering is identity-neutral.

But a material change to coverage semantics—such as changing a clause's SCREENING posture—changes the registry fingerprint.

The DPL-02 authority source is independently fingerprinted as well.

This gives future coverage composition two distinct provenance dimensions:

- what the registry claims;
- which architectural authority it was derived from.

---

## 11. Handoff to DPL-F

A generic SCREENING coverage composer may safely assume from DPL-02C that:

1. the complete current Reference House conformance clause/route universe is the 38-entry registry;
2. exactly six ids are currently executable/native-route in DPL-12B;
3. all other clauses remain external/open/future according to their registry resolution mode;
4. identity/protected unresolved coverage blocks a complete positive Reference House conformance claim;
5. implementation freedoms can remain future detail at SCREENING while their architectural boundary stays visible;
6. site-interface freedoms are route permissions that require resolution if invoked;
7. variant routes remain authored selections rather than compiler choices;
8. no registry entry independently authorises site `INCOMPATIBLE`;
9. registry coverage must never be interpreted as a candidate conformance result.

DPL-F must compose these semantics with DPL-09D and DPL-11B rather than flattening them into one generic PASS/FAIL vocabulary.

---

## 12. Closeout

**DPL-02C PASS.**

Reference House conformance coverage is now exhaustive at the current DPL-02 contract level without expanding native architectural judgement.

The important change is epistemic rather than computational:

> **The compiler can now distinguish “this clause does not exist”, “this clause exists but is not native”, “this clause is a future implementation boundary”, and “this clause is an admitted authored route” without confusing any of those states with conformance itself.**

That is the architectural coverage substrate DPL-E required.
