# DPL-F — post-Coverage-Foundations integration and DPL-13B admission gate

**Issue:** #434  
**Programme:** #299  
**Baseline `main`:** `3dd02fca17c15c7e9be0d71eec5bd9e388d09f05`  
**Review date:** 2026-10-22  
**Status:** integration/admission gate; no whole-site conclusion implementation

## Decision

> **PASS COVERAGE FOUNDATIONS — HOLD DPL-13B; AUTHORISE DPL-10E PLANNING SCREENING COVERAGE REGISTRY ONLY; THEN RUN DPL-G.**

The three owner-side Coverage Foundations are coherent and materially improve DPL's scope control:

- DPL-02C makes the complete current Reference House conformance universe machine-readable without converting architectural authority into blanket native booleans;
- DPL-09D makes the controlled England technical/process family universe machine-readable while keeping substantive technical discharge separate from family coverage;
- DPL-11B makes the controlled non-planning due-diligence family universe machine-readable while preserving legal/professional/provider authority outside the compiler.

They do **not**, however, form the complete SCREENING family universe required by DPL-04 and DPL-03.

The remaining coherent owner gap is **planning coverage**.

DPL-10 already owns a materially broader planning inventory than the currently executable London strategic slice. Its controlled inventory expressly includes, subject to applicability:

- London strategic and borough/local source composition;
- design/context/character;
- neighbour amenity, privacy, daylight/sunlight;
- transport/access/highway effects;
- heritage;
- trees/landscape/arboriculture;
- ecology / biodiversity / green infrastructure;
- flood / drainage planning policy;
- air quality / noise;
- parking/cycle/refuse and other local quantitative families;
- validation/process/evidence requirements;
- external planning determination.

DPL-10B represents only a bounded strategic residential/design slice. Croydon and Bromley prove a narrow borough source/status/method envelope, not complete planning-family coverage.

Therefore a generic SCREENING composer written now would have to either:

1. silently pretend DPL-10B is the complete planning target; or
2. hide planning-specific gaps inside generic DPL-13B special cases.

Both would violate the programme's authority model.

DPL-13B remains held until planning receives the same owner-side coverage treatment as DPL-02, DPL-09 and DPL-11.

---

# 1. Coverage Foundation attack

## DPL-02C — PASS

The DPL-02C registry contains the complete current 38-entry conformance universe:

- 7 identity invariants;
- 15 protected-order clauses;
- 2 permitted discrete variants;
- 6 site-interface freedoms;
- 8 implementation freedoms.

Its six current executable/native-route ids remain exactly:

`RH-I02 / RH-PROT-01 / RH-PROT-04 / RH-PROT-06 / RH-V01 / RH-V02`.

The key semantic separation survives:

```text
clause exists in coverage registry
    ≠
clause conforms
```

Non-native architectural clauses can remain OPEN / review-led while still belonging to the complete conformance universe. Site-interface freedoms are resolved if invoked; implementation freedoms remain future implementation boundaries. No registry entry can prove site incompatibility by itself.

No DPL-02C rewind is earned.

## DPL-09D — PASS

The England registry covers the controlled DPL-09 family/process universe at SCREENING and correctly separates:

```text
family represented in coverage
    ≠
technical requirement discharged
```

The key anti-overclaim cases survive:

- DPL-09B/C remain bounded partial target slices;
- RH-C5 remains one selected Part K method, not generic Part K compliance;
- conditional D/J/S applicability cannot become `NOT_APPLICABLE` from missing evidence;
- transition/source selection remains a due-now authority problem;
- most detailed technical/process work remains future-due at SCREENING unless a case fact accelerates it;
- the ordinary non-HRB project-class exclusion remains narrow and identity-bearing.

No DPL-09D rewind or new technical-method wave is earned.

## DPL-11B — PASS

The non-planning registry gives bounded machine-readable coverage to the current DPL-11 families:

- site control identity;
- precise title/legal boundary;
- private rights/restrictions;
- neighbour/statutory private process;
- public sewer/undertaker relationship;
- utilities;
- ground/environmental physical evidence;
- physical flood/water evidence;
- access status;
- construction/temporary-access logistics.

DPL-RS-01 claim references remain references only. `ASSUMED` stays assumed. `UNKNOWN` stays unknown. Detailed due diligence is normally future-due at SCREENING but can be accelerated by explicit decision-critical facts.

No DPL-11B rewind is earned.

---

# 2. Common coverage semantics

The three registries prove that DPL-13B does **not** need one universal owner schema.

A future composer needs only a bounded common projection.

For every owner proposition relevant to the requested profile it must be able to determine, without changing owner semantics:

- owner + stable id;
- profile disposition;
- whether the proposition is represented in the declared family/clause universe;
- whether a due-now unresolved/missing state blocks positive compatibility;
- whether applicability itself is unresolved;
- whether an explicit case fact has invoked/accelerated a conditional route;
- current resolution/evidence authority;
- result state where an actual result exists;
- provenance/fingerprint of the owner registry.

The common coverage vocabulary should remain conceptually:

- `DUE_NOW_REPRESENTED`;
- `DUE_NOW_MISSING`;
- `FUTURE_DUE`;
- `DUE_CLASSIFICATION_UNRESOLVED`;
- `NOT_APPLICABLE_PROVED`;
- `ADVISORY_NON_BLOCKING`;
- plus owner-specific invocation/route conditions where required.

`ACCELERATED_DUE_NOW` is a **case state**, not a static registry default.

A coverage composer may normalize these semantics for reporting. It must not erase the owner-specific fields that justify them.

---

# 3. Acceleration semantics

Current registry acceleration triggers are descriptive authority metadata.

DPL-13B must **not parse prose trigger text as executable logic**.

The safe future rule is:

```text
typed explicit trigger + controlled case fact
    → native acceleration evaluation may be admitted

opaque/descriptive trigger text
    → ACCELERATION_REVIEW_REQUIRED
```

Until owner registries provide a typed trigger contract for a specific trigger, the generic composer may expose that an acceleration review exists but may not manufacture a `true/false` trigger result.

This is sufficient for coverage reporting because a family can remain visible with due classification unresolved. It is not sufficient for a positive compatibility conclusion.

---

# 4. Site-claim ownership attack

DPL-13A correctly preserves all 29 Reference Site claims, but claim presence is not family ownership.

The Coverage Foundations resolve much of the previous gap, but not all of it.

## Planning-owned residuals

At minimum the following canonical claims expose DPL-10 family coverage not represented by a complete machine-readable planning registry:

### `RS-HERITAGE-01`

The synthetic fixture assumes no listed/conservation designation.

DPL-10 owns heritage designation/applicability and heritage setting/policy consequences. DPL-10B does not represent the full heritage planning family.

The synthetic assumption must not become `NOT_APPLICABLE_PROVED` merely because DPL-RS-01 was authored that way.

### `RS-NOISE-01`

External noise condition is `UNKNOWN`.

DPL-10's controlled inventory explicitly names London strategic noise/agent-of-change/noise policy and local air-quality/noise qualitative/evidence families.

Part E acoustic requirements under DPL-09 are a separate technical authority and do not consume the planning noise question.

### `RS-ECO-01`

Ecology/habitat condition is `UNKNOWN`.

DPL-10's controlled inventory explicitly names green-infrastructure/biodiversity strategic policy and local ecology/BNG/green-infrastructure families.

DPL-11 ground/environmental evidence does not silently own ecological planning policy.

## Claims with legitimate multi-owner interpretation

Several claims are correctly relevant to more than one authority:

- neighbour mass/openings → DPL-10 amenity/privacy/daylight judgement **and** DPL-11 neighbour/private-process evidence;
- trees/root constraints → DPL-10 trees/landscape policy **and** DPL-11 arboricultural/ground evidence;
- flood/surface water → DPL-10 planning flood/SuDS policy, DPL-09 Part H technical requirements, DPL-11 physical flood/water evidence and DPL-08 site interface;
- access/street facts → DPL-10 transport/highway/planning judgement, DPL-11 physical/legal access evidence and DPL-08 approach/interface authority.

This overlap is not duplication to eliminate. It is evidence that a planning coverage registry is required so one site claim can legitimately feed several differently owned obligations without ownership collapse.

---

# 5. Planning coverage — FAIL FOR DPL-13B ADMISSION, NOT A DPL-10 FAILURE

DPL-10's prose authority is strong enough to identify the missing machine layer.

The current executable planning state is intentionally narrower:

- London strategic DPL-10B: selected Chapter 3 residential/design policies;
- Croydon DPL-10C: one bounded borough plug-in;
- Bromley DPL-10D: adversarial replay proving the narrow borough envelope;
- DPL-RS-01: deliberately no real borough target.

That is sufficient for canonical integration M4.

It is **not** sufficient for a statement that the SCREENING planning family universe is complete.

The right repair is owner-side:

> **DPL-10E — London planning SCREENING coverage registry.**

DPL-10E should encode the controlled planning family universe and its source/applicability/evidence posture. It should not implement every policy or assign a borough to the synthetic fixture.

---

# 6. Coverage-completeness semantics

DPL-F freezes three future coverage states.

## `COVERAGE_COMPLETE_FOR_PROFILE`

May be emitted only when:

1. every owner required by the profile has a controlled family/clause universe;
2. every relevant family/clause has a profile disposition;
3. all consequential site claims are mapped to their relevant owner families or explicitly classified outside the current profile;
4. local/jurisdiction target absence is itself represented as a known coverage state, not omission;
5. unresolved applicability/acceleration questions are explicitly represented;
6. the complete owner-registry identity set is included in result provenance.

It does **not** mean the substantive obligations pass.

## `COVERAGE_INCOMPLETE`

Use when a known owner family/registry/claim mapping required for the profile is absent.

This is the correct current state because planning lacks its family coverage registry.

## `COVERAGE_UNRESOLVED`

Use when the declared family universe exists but one or more profile dispositions/applicability/acceleration classifications cannot yet be determined from current controlled facts/evidence.

This state may eventually coexist with a complete family universe.

---

# 7. Conclusion readiness

DPL-F does **not** admit official whole-site `UNRESOLVED @ SCREENING`.

The current correct state remains:

```text
coverageCompleteness = COVERAGE_INCOMPLETE
conclusionReadiness = NOT_ESTABLISHED
wholeSiteCompatibilityConclusion = NOT_IMPLEMENTED
```

or equivalent language until DPL-10E lands and the full owner set is re-reviewed.

A cosmetically conservative `UNRESOLVED` would still overclaim because the runtime cannot yet prove that the complete planning family universe was included.

---

# 8. Positive compatibility boundary

`COMPATIBLE @ SCREENING` remains materially downstream.

Even after family-scope completeness is earned, positive compatibility requires:

- every due-now blocking DPL-02 clause resolved to the required conformance state;
- every due-now England family appropriately resolved/discharged;
- every due-now planning family resolved at its correct evidence/judgement authority;
- every due-now DPL-11 family resolved at sufficient evidence quality;
- site-interface duties invoked by the case resolved;
- local planning applicability/absence handled correctly;
- all acceleration reviews resolved;
- no due-now unsupported/unresolved/fail state;
- evidence lifecycle/currentness adequate for the SCREENING claim.

Registry completeness alone is never positive compatibility.

---

# 9. Incompatibility / route exhaustion

No change.

`INCOMPATIBLE` remains held until:

- an invariant blocker with explicit authority proves no current-house route can exist; or
- admitted conformance-preserving routes are exhausted under controlled route semantics.

No route-search/optimisation machinery is currently earned.

---

# 10. Second fixture / real-site timing

A second real-site fixture is still premature.

The synthetic fixture has already exposed the missing planning-coverage seam cleanly. Introducing a real borough now would entangle planning-family completeness with live local source selection and real evidence acquisition before the generic coverage substrate is ready.

DPL-15 remains held.

---

# 11. Exact next packet

Authorise **DPL-10E only**.

## DPL-10E — London planning SCREENING coverage registry

It must make the complete currently controlled DPL-10 planning family universe machine-readable at coverage level, while preserving:

- strategic London vs borough/local ownership;
- development-plan vs guidance/material-consideration status;
- source/applicability identity;
- numeric vs judgement vs evidence/process resolution modes;
- local-borough target absence as explicit state for DPL-RS-01;
- planning interpretations of relevant Reference Site claims, including heritage/noise/ecology;
- overlap with DPL-09/DPL-11/DPL-08 without authority collapse;
- no planning-permission prediction;
- no whole-site conclusion.

After DPL-10E lands, run:

> **DPL-G — post-planning-coverage integration and DPL-13B admission gate.**

DPL-G should be narrow: re-run the owner-completeness attack with all four owner registries and decide whether DPL-13B may implement coverage completeness / conclusion-readiness.

Do not pre-author DPL-13B before DPL-G.

---

# 12. Maturity

DPL remains:

> **M4 — Internally validated / controlled at bounded canonical synthetic deployment-case integration scope; whole-site conclusion readiness excluded.**

No demotion is earned: DPL-F discovered a missing downstream coverage owner exactly because the existing M4 baseline exposes omissions rather than hiding them.

No broader M4 claim is earned either. Coverage/conclusion-readiness remains outside the controlled proposition until the planning family registry and later composer survive their own gates.

---

# 13. Downstream restraint

Held after DPL-F:

- DPL-13B+;
- runtime whole-site `COMPATIBLE / UNRESOLVED / INCOMPATIBLE`;
- route exhaustion/search/optimisation;
- DPL-14D bulk corpus expansion;
- DPL-15 real-site deployment trials;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 closeout;
- generic all-borough planning ontology;
- unrelated technical/interface expansion;
- DRW changes.

The sole next authorised work is DPL-10E.