# DPL-F — Coverage Foundations Integration and DPL-13B Admission Review

**Issue:** #434  
**Programme:** #299  
**Review date:** 2026-10-22  
**Baseline `main`:** `3dd02fca17c15c7e9be0d71eec5bd9e388d09f05`  
**Depends on:** DPL-02C, DPL-09D, DPL-11B, DPL-13A  
**Status:** integration/admission gate; no whole-site deployment conclusion

## Decision

> **PASS WITH HOLD — THE COVERAGE FOUNDATIONS ARE COHERENT, BUT DPL-13B IS NOT YET ADMITTED. AUTHORISE DPL-10E PLANNING SCREENING COVERAGE REGISTRY ONLY.**

The three owner-side Coverage Foundations materially improve the canonical deployment proposition:

- DPL-02C makes the complete current Reference House conformance universe machine-readable without converting it into universal native proof;
- DPL-09D makes the controlled England technical/process family universe machine-readable while preserving the distinction between family coverage and technical discharge;
- DPL-11B makes the non-planning due-diligence family universe machine-readable while keeping legal, professional and provider determinations external.

They are mutually compatible.

However, the canonical `SCREENING` universe remains incomplete because **planning coverage is still only represented by bounded implemented target slices, not by a complete machine-readable DPL-10 family registry**.

The concrete failure is visible in DPL-RS-01:

- `RS-NOISE-01` — external noise condition;
- `RS-ECO-01` — ecology/habitat condition.

These are not ownerless subjects. DPL-10 already inventories London strategic planning families including noise/agent-of-change, green infrastructure/biodiversity, heritage, air quality, water/flood/drainage and other site-dependent policy/evidence families.

But the current executable London strategic target is intentionally narrower: it contains only the selected D3/D5/D6/D7 residential/design slice.

Therefore a generic DPL-13B composer cannot honestly distinguish:

```text
planning family exists but is unresolved/external/future
```

from:

```text
planning family was never represented
```

for the complete planning domain.

That distinction is mandatory before any claim of profile-complete coverage.

## 1. Registry integrity review

### DPL-02C

PASS.

The 38-entry registry correctly separates:

- clause existence;
- conformance class;
- current resolution mode;
- SCREENING blocking posture;
- actual conformance result.

The six executable/native-route ids remain bounded to the current DPL-12B implementation. Registry metadata does not create conformance.

Site-interface freedoms and implementation freedoms remain permissions/boundaries rather than automatic candidate routes or passes.

No DPL-F repair is required.

### DPL-09D

PASS.

The England registry correctly separates:

- family presence;
- source/applicability selection;
- SCREENING timing;
- acceleration metadata;
- current implementation coverage;
- substantive technical discharge.

DPL-09B/C remain partial target slices rather than family-complete compliance.

RH-C5 remains a selected Part K method only.

Conditional families do not become not-applicable by missing evidence.

No DPL-F repair is required.

### DPL-11B

PASS.

The non-planning registry preserves DPL-11's authority boundary:

- title/control;
- legal boundary;
- private rights;
- neighbour/private statutory process;
- sewer/undertaker;
- utilities;
- ground/environment physical evidence;
- physical flood/water;
- access status;
- construction/temporary logistics.

DPL-RS-01 claim references retain their authored/assumed/unknown state and do not discharge a family merely by being mapped.

No DPL-F repair is required.

## 2. Common composition semantics

A future coverage composer may normalise only the profile-level posture required for integration.

The common semantic layer should support at least:

- `DUE_NOW_REPRESENTED`;
- `DUE_NOW_MISSING`;
- `FUTURE_DUE`;
- `DUE_CLASSIFICATION_UNRESOLVED`;
- `NOT_APPLICABLE_PROVED`;
- `ADVISORY_NON_BLOCKING`;
- `ACCELERATION_REVIEW_REQUIRED` when a family has an opaque/non-native acceleration trigger and the current case contains potentially relevant evidence.

Owner-specific fields must survive alongside that common layer.

Do not force architectural routes, regulatory applicability, planning judgement and legal evidence into one universal obligation schema.

## 3. DPL-02 composition consequence

The complete DPL-02 registry is sufficient as an owner-side coverage source.

A positive whole-Reference-House conformance claim still requires positive resolution of every clause marked as required for that claim.

At SCREENING:

- non-native architectural review clauses may remain unresolved and therefore block positive compatibility where due;
- admitted variants are route permissions selected by authored input, not passes over the whole house;
- site-interface freedoms block only when actually invoked by a candidate/site response and unresolved at the required profile;
- implementation freedoms may remain future-due where DPL-04 allows them.

No additional DPL-02 native rules are required before coverage composition work.

## 4. DPL-09 composition consequence

The DPL-09 registry is sufficient as an owner-side England family coverage source.

The key distinction is:

> **complete family coverage at SCREENING does not require complete technical compliance at SCREENING.**

Many technical/process families may be represented and correctly classified as future-due until a known decision-critical fact accelerates them.

The composer must retain current source/applicability selection as a due-now authority question where DPL-09D marks it so.

## 5. DPL-11 composition consequence

The DPL-11 registry is sufficient as an owner-side non-planning family coverage source.

It may tell a composer that a family exists, is future/due-now/unresolved and has a declared external evidence owner.

It may not tell the composer that title, rights, sewer capacity, utility capacity, ground adequacy or neighbour process is cleared unless accepted evidence/determination exists.

## 6. Planning coverage — material missing foundation

DPL-10 already owns a materially wider planning universe than the current implemented target slices.

Its inventory explicitly includes, subject to applicability:

- strategic design/context/capacity;
- accessible/inclusive housing;
- housing quality/space;
- safety/fire/agent-of-change/noise;
- housing/small-site policy;
- transport/parking/cycling;
- green infrastructure / urban greening / biodiversity;
- heritage;
- air quality;
- energy;
- water/flood/drainage;
- borough/local development-plan policy;
- neighbourhood-plan applicability;
- national policy/material considerations;
- guidance/material considerations;
- emerging policy status;
- case-specific evidence and planning judgement;
- external statutory planning decision.

The current London strategic executable slice is deliberately much smaller.

Therefore DPL-10 needs the same family-coverage treatment already given to DPL-02/09/11.

### DPL-10E required scope

DPL-10E should create a machine-readable **planning SCREENING coverage registry** that:

- begins from DPL-10 / DPL-10A authority rather than inventing new planning law;
- distinguishes development-plan sources, national/material-consideration sources, guidance, emerging policy and external decisions;
- includes the controlled London strategic family universe at family level;
- represents local-borough planning as a required profile slot for real sites without assigning a borough to DPL-RS-01;
- records existing DPL-10B/C/D target slices as partial implementations;
- explicitly owns `RS-NOISE-01` and `RS-ECO-01` at the planning-evidence/family level where applicable;
- keeps planning judgement external;
- preserves source conflict/status semantics;
- does not create a generic all-borough rule engine.

## 7. Site-claim ownership

The DPL-13A site manifest remains sound.

Most consequential claims already map naturally to DPL-02/08/09/10/11 authority.

The two material uncovered machine-coverage claims are:

```text
RS-NOISE-01
RS-ECO-01
```

They should not be moved into DPL-11 merely because DPL-11 already has an environment-like family. Their principal SCREENING deployment consequence is planning-policy/evidence applicability under DPL-10, even though later acoustic/ecological professional evidence may also exist externally.

DPL-10E should establish the coverage ownership boundary rather than DPL-13B embedding a special-case mapping.

## 8. Acceleration semantics

Owner registries currently store decision-critical acceleration largely as metadata.

DPL-13B must not parse prose trigger descriptions into executable rules.

The safe future composition rule is:

1. execute only explicitly typed/native trigger contracts backed by current case facts;
2. where a family carries only opaque trigger metadata and the case may contain relevant facts, emit `ACCELERATION_REVIEW_REQUIRED`;
3. otherwise preserve the owner's default profile disposition.

`ACCELERATION_REVIEW_REQUIRED` is a coverage/readiness state, not a substantive failure.

## 9. Coverage-completeness semantics

DPL-F freezes the following distinction for later implementation.

### `PROFILE_UNIVERSE_COMPLETE`

All owner families/clauses required for the requested profile are represented under controlled registries/target composition, and every relevant site claim has an owner or an explicit non-blocking/out-of-scope classification.

This says nothing about whether obligations pass.

### `PROFILE_UNIVERSE_INCOMPLETE`

At least one required owner family, authority layer or consequential site claim is absent from the declared profile universe.

This is the current DPL-RS-01 state because planning family coverage is incomplete.

### `PROFILE_DISPOSITION_UNRESOLVED`

The universe is complete, but at least one family's profile timing/applicability/acceleration classification cannot yet be determined honestly.

These states must be identity-bearing in any future canonical conclusion-readiness result.

## 10. Conclusion readiness

DPL-13B remains held.

The next implementation milestone should still be **coverage/readiness**, not whole-site compatibility.

Even after DPL-10E, DPL-13B should initially be authorised only to compute:

- owner-registry identities;
- site-claim ownership coverage;
- profile universe completeness;
- profile disposition state;
- due-now/future/missing/review-required counts and references;
- deterministic coverage/readiness identity.

It should retain:

```text
wholeSiteCompatibilityConclusion = NOT_IMPLEMENTED
```

until a later adversarial gate explicitly decides whether `UNRESOLVED @ SCREENING` is now semantically earned.

## 11. Positive compatibility boundary

`COMPATIBLE @ SCREENING` remains materially downstream.

It requires at minimum:

- complete SCREENING universe;
- every due-now blocking family represented;
- every due-now blocking obligation/conformance proposition positively resolved/discharged at sufficient evidence quality;
- planning local-authority composition appropriate to the actual site;
- no unresolved decision-critical acceleration;
- candidate conformance at the scope required by DPL-02/DPL-04;
- current source/applicability identity;
- no hidden unsupported blocking family.

## 12. Incompatibility / route exhaustion

`INCOMPATIBLE` remains held.

Nothing in DPL-F justifies generic route-search or optimisation machinery.

Route exhaustion becomes necessary only when the system attempts to elevate a candidate/site failure into a site-level incompatibility conclusion, unless a separately controlled invariant blocker can prove incompatibility directly.

## 13. Second fixture / real-site timing

A second real-site canonical fixture is still premature.

The synthetic fixture has already exposed a genuine missing authority layer cleanly. Adding a real borough now would mix coverage-model incompleteness with site-specific evidence acquisition.

Complete planning coverage semantics first.

## 14. Exact next packet

Authorise **DPL-10E only**.

Dependency:

```text
DPL-02C ─┐
DPL-09D ─┼─ already landed
DPL-11B ─┘
    |
    v
DPL-F
    |
    v
DPL-10E — planning SCREENING coverage registry
    |
    v
DPL-G — post-planning-coverage integration / DPL-13B admission gate
```

Do not open DPL-13B until DPL-10E lands and DPL-G reviews the complete four-owner coverage foundation.

## 15. Maturity

DPL remains **M4** at the bounded canonical synthetic integration / no-conclusion scope established by DPL-E.

No demotion is warranted: DPL-F discovered a boundary exactly because the current controlled baseline exposes missing scope instead of laundering it into a result.

No maturity broadening is earned: planning family coverage and conclusion readiness remain outside the current M4 proposition.

## Held work

Continue to hold:

- DPL-13B+;
- runtime whole-site `COMPATIBLE / UNRESOLVED / INCOMPATIBLE`;
- DPL-15 real-site deployment trials;
- DPL-14D bulk corpus expansion;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 closeout;
- route-search/optimisation;
- generic all-borough policy ontology;
- unrelated technical/interface expansion;
- DRW changes.

## Closeout

DPL-F succeeds by **refusing premature generic composition**.

The architecture of the programme is now clearer:

> Owner-specific coverage registries first; generic conclusion-readiness composition only after every material owner domain is visible.

The missing fourth owner-side foundation is planning.
