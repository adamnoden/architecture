# DPL-13D — Second Canonical Synthetic Fixture / Borough-Assigned Positive-Readiness Generalisation

**Issue:** #498  
**Depends on:** DPL-J, DPL-13B, DPL-13C  
**Fixture:** `DPL-RS-02`  
**Local planning target:** Croydon controlled exemplar  
**Status:** implementation candidate; exact executable result frozen pending final-head validation and post-merge DPL-K gate

## Purpose

DPL-RS-01 is intentionally no-borough and UNKNOWN/ASSUMED-heavy. That makes it a strong fixture for proving a complete conservative `UNRESOLVED @ SCREENING` result, but a poor experiment for whether the same machinery generalises to a materially better classified case.

DPL-13D introduces one second **synthetic** fixture. It changes the experiment without claiming a real site.

The question is:

> Can the existing DPL-13B owner universe and DPL-13C substantive aggregation be rebound to an explicit borough-assigned synthetic context, with materially changed classification state, while preserving external-evidence uncertainty and the existing UNRESOLVED-only result authority?

## Fixture identity

```text
siteId = DPL-RS-02
manifestId = DPL-RS-02-SM-v0.1
siteKind = SYNTHETIC_REFERENCE
local planning = Croydon controlled target
```

DPL-RS-02 deliberately preserves the same parcel, Reference House placement and 29-claim vocabulary as DPL-RS-01. This isolates the experiment to **site-fact disposition and local-target composition** rather than geometry.

The authored deployment candidate remains RH-V02, unmirrored, rotated 180°, but receives its own candidate/source identity. No candidate search occurs.

## Exact planning composition

The selected local target is:

```text
CROYDON-LOCAL-PLANNING-2018-2026-10-21
```

It proves the existing controlled parent edge to:

```text
LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20
```

No borough inference or alias reconciliation is permitted.

## Deliberately changed synthetic facts

The fixture preserves most DPL-RS-01 uncertainty. Two planning-context claims are deliberately made explicit enough to change the **classification experiment**, not to become external evidence.

### `RS-HERITAGE-01`

The synthetic scenario explicitly defines no listed/conservation/other heritage designation in the authored fixture context.

It is recorded as `DERIVED_SITE_CLAIM` only in the narrow sense that the proposition is derived from the declared synthetic scenario definition. It is **not** a heritage search, planning-officer judgement or statutory determination.

### `RS-NOISE-01`

The synthetic scenario explicitly defines an ordinary residential acoustic context with no authored severe-noise/sensitive-receptor flag.

Again, this is scenario classification input only. It is **not** an acoustic survey, agent-of-change assessment or planning discharge.

These changes are intentionally sparse. Flood, ecology, ground, title detail, utility capacity, neighbour openings, sewer detail, surface-water strategy and construction logistics remain UNKNOWN where the original fixture preserved missing evidence.

## Coverage/readiness generalisation seam

DPL-13D does **not** create a new owner registry.

It reuses the complete DPL-13B owner universe and rebinds only the case-dependent parts:

- site claim state/basis;
- opaque acceleration-review presence, using only typed trigger-count metadata plus claim uncertainty and never parsing trigger prose;
- local-authority-dependent planning disposition;
- selected controlled local target identity;
- claim ownership state/basis;
- readiness/result identity.

For an assigned controlled borough:

- local-authority-dependent planning entries represented by the selected target become `DUE_NOW_REPRESENTED`;
- if the selected target is not represented by the owner entry, the entry fails closed as `DUE_NOW_MISSING`;
- no local-policy entry becomes PASS merely because the borough is known.

The rebinding adapter is also exercised against DPL-RS-01/no-borough context and must reproduce the existing DPL-13B normalized coverage, counts, uncovered-claim state and ownership semantics exactly before RS-02 is admitted as a valid experiment.

## External-evidence boundary

Synthetic authored facts remain synthetic facts.

DPL-RS-02 does not positively discharge, merely by authorship:

- title/control or private-rights evidence;
- survey/geotechnical/contamination evidence;
- flood/drainage professional evidence;
- highway/access determination;
- utility/provider capacity;
- building-control evidence;
- qualitative planning judgement;
- planning permission/determination.

A better classified synthetic fixture may therefore still correctly remain `UNRESOLVED @ SCREENING`. DPL-13D is not authorised to emit `COMPATIBLE` in any event.

## Executable result

The exact DPL-RS-02 implementation was first proved green as a complete repository candidate, then a deliberately failing one-commit probe exposed the deterministic result payload so it could be frozen as assertions rather than described approximately. The probe itself is not part of the final proof boundary; the final test pins these values and must pass on the exact final head.

### Exact identities

```text
siteManifestFingerprint
  c1bc2e7fe0fc5778cda25de81ea0e4f0161962a59d5de80d6bea28d2df33e142

candidateFingerprint
  c0b4618cb8203e4dfddcf7e7ef852fa6c92e905fcd8e3a7e5322154e11903d81

canonicalCaseFingerprint
  52f27afbfd64e44bcdda3b7c7a5d2529e7cf10b0e91f9f33daa74ac4ad131c42

readinessIdentityFingerprint
  8d5187137d0f48e0ea43fa1860db761c6c001f64b4e4ffecf2392581373a80ab

readinessResultFingerprint
  4f384e6ae0eebd1e921bc58242cf452d34be96c6b80520be899341bdeab33dd2

fixtureIdentityFingerprint
  42ea515948f17d5fdc4838a7c1cb13109a9139515baf62a8271271e7c8ee9d9d

aggregationIdentityFingerprint
  4a3915fc927ed4c7450619ced3c9378994f38a7436b6ba5a78fa6633f7dfd195

aggregationResultFingerprint
  880385d2b230dbc3de14e93088d7b700259b09318d599579523389ef2faa7eff
```

### Coverage/readiness disposition

```text
DUE_NOW_REPRESENTED              = 31
DUE_NOW_MISSING                  = 0
FUTURE_DUE                       = 53
DUE_CLASSIFICATION_UNRESOLVED    = 0
NOT_APPLICABLE_PROVED            = 1
ADVISORY_NON_BLOCKING            = 2
ACCELERATION_REVIEW_REQUIRED     = 15
```

Compared with DPL-RS-01, the two local-planning entries that were unresolved only because no borough existed are now represented under the exact Croydon target:

```text
PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY
PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY
```

The two deliberately changed scenario facts also remove the heritage and noise acceleration-review questions. The acceleration-review count therefore falls from 17 to 15, while the two base no-borough classification blockers disappear entirely.

### Aggregation blockers

```text
substantiveUnresolved       = 27
dueClassificationUnresolved = 15
substantiveFailure          = 0
```

This is the central DPL-13D finding.

Classification improves materially:

- base due-classification uncertainty falls from 2 to 0;
- acceleration review falls from 17 to 15;
- no due-now coverage is missing.

But **27 substantive blockers remain unresolved** because external evidence, admitted evaluators or qualitative judgement are still absent. The system therefore does not mistake better classification for positive compatibility.

### Whole-site result

```text
wholeSiteConclusion = UNRESOLVED @ SCREENING
localBoroughTarget = CROYDON-LOCAL-PLANNING-2018-2026-10-21
compatibleAtScreening = NOT_ADMITTED
incompatible = NOT_ADMITTED
routeExhaustion = NOT_IMPLEMENTED
architecturalCandidateSelection = NOT_IMPLEMENTED
```

The all-positive adversarial override still returns:

```text
NOT_ADMITTED
reason = POSITIVE_CONCLUSION_NOT_ADMITTED
```

The second fixture therefore demonstrates that the DPL-13C middle result is not merely hard-coded to the no-borough DPL-RS-01 ecology. Case classification can improve substantially while the same aggregation machinery continues to return the evidence-appropriate middle result.

## Result authority

DPL-J admits only:

```text
UNRESOLVED @ SCREENING
```

or an explicit fail-closed non-conclusion.

DPL-13D preserves:

```text
compatibleAtScreening = NOT_ADMITTED
incompatible = NOT_ADMITTED
routeExhaustion = NOT_IMPLEMENTED
architecturalCandidateSelection = NOT_IMPLEMENTED
```

## Identity boundary

The second case is identity-distinct through:

- site manifest fingerprint;
- authored candidate fingerprint;
- deployment case/result fingerprints;
- local target id;
- rebound readiness identity/result fingerprints;
- changed aggregation records;
- final DPL-13C identity/result fingerprints.

Material site/readiness mutation changes identity. Aggregation-record ordering remains identity-neutral.

## Proof boundary

DPL-13D proves only a second controlled **synthetic candidate case** and the ability of the existing coverage/readiness + aggregation semantics to generalise across a changed site/planning context.

It does not yet broaden DPL's M4 claim beyond the DPL-J-controlled canonical RS-01 result. A fresh DPL-K gate must decide whether two-fixture result generalisation has earned a broader controlled scope.

It does not prove:

- positive compatibility;
- site incompatibility;
- route exhaustion;
- real-site deployability;
- planning permission;
- regulatory compliance;
- legal clearance;
- external validation;
- general all-borough support.

A fresh post-DPL-13D gate is mandatory before any positive-result implementation or broader result-scope claim.