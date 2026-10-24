# DPL-M — Post-DPL-13F Internal-Limit / DPL-15 Admission Review

**Issue:** #530  
**Depends on:** DPL-13F #527 / PR #528  
**Reviewed candidate:** `9ffc725b29cb93bcbe861b638075960608f12549`  
**Status:** **PASS DPL-13F; HOLD FURTHER SYNTHETIC LOCAL-QUANTITATIVE WORK; ADMIT DPL-15A ON DPL-RP-003.**

## 1. Decision

DPL-13F closes the last clearly justified generic internal integration omission.

Its narrow result is the correct one:

```text
ENG-COV-SOURCE-APPLICABILITY         = UNRESOLVED
DPL10-COV-SOURCE-COMPOSITION-STATUS = PASS
substantiveUnresolved                 = 10
dueClassificationUnresolved           = 17
substantiveFailure                     = 0
wholeSiteConclusion                    = UNRESOLVED @ SCREENING
```

The programme has now reached an epistemic boundary rather than an implementation backlog.

Decision:

> **Do not create another synthetic DPL-13 packet merely to reduce blocker counts. Begin DPL-15 through one bounded real-site evidence / coverage trial.**

The first trial is:

> **DPL-15A — DPL-RP-003 real-site screening manifest / coverage trial**

No compatibility verdict is admitted.

## 2. Remaining ten substantive blockers

After DPL-13F, the ten substantive blockers classify as follows.

### External / professional / site / legal evidence — 5

- `RH-PROT-08` — primary structural concept; competent engineering evidence;
- `RH-PROT-14` — maintenance geography; actual site-interface evidence;
- `DPL11-COV-SITE-CONTROL` — title/control/boundary evidence;
- `DPL11-COV-PHYSICAL-FLOOD-WATER` — physical flood/water evidence;
- `DPL11-COV-ACCESS-STATUS` — survey/title/highway/access evidence.

### England project-event applicability — 1

- `ENG-COV-SOURCE-APPLICABILITY`.

DPL-13F turns this from a generic owner placeholder into a finite real-project evidence question. The missing facts are:

```text
buildingControlRouteOrNoticeApplicationKind
noticeOrApplicationDateAndStatus
qualifyingCommencementDate
qualifyingCommencementEvidence
```

Synthetic site optimism cannot supply those events.

### Planning judgement / evidence — 3

- `DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY`;
- `DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY`;
- `DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT`.

DPL-13F can prove source/status composition but cannot mechanically prove qualitative design/context adequacy or emerging-policy material weight.

### Bounded local quantitative — 1

- `DPL10-COV-LOCAL-QUANTITATIVE-POLICY`.

This is the only remaining blocker that superficially looks like another compiler packet.

It is not currently the correct next packet.

## 3. Why Croydon local quantitative work is held

The current Croydon target contains genuinely native numeric methods, including:

### `CROY-DM10-4-PRIVATE-AMENITY-AREA`

Requires:

- occupant or bedspace count;
- policy-defined qualifying private amenity area after local exclusions;
- balcony dimensions if relied upon.

The explicit arithmetic is native, but the local policy also retains non-native judgement about functional usability, character and correct exclusion of paths/driveways/front gardens/vehicle/cycle/refuse territory.

### `CROY-DM10-4-HOST-GARDEN-RETENTION`

Requires:

- whether development is in the grounds of an existing retained building;
- authoritative existing host-garden area;
- authoritative retained host-garden area;
- retained host-garden length.

The target itself records that DPL-RP-003 lacks survey/title-grade host-garden geometry and legal parcel relationships sufficient to execute that rule.

### Parking / access

The Croydon parking family requires current strategic parking authority plus PTAL/parking-stress evidence, proposal parking/cycle geometry, highway/dropped-kerb context and any relevant existing-parking evidence. That is not a free synthetic numeric input.

### RS-02 does not have the inputs

The current DPL-RS-02 candidate carries bounded Reference House geometry needed for architectural conformance, not a complete local-planning proposal dossier.

In particular it does not establish the policy-defined local amenity-area inputs, legal host-garden relation or external parking/access evidence required to turn the local quantitative family into a case-specific PASS.

Therefore a synthetic DPL-13G would at best do one of two unhelpful things:

1. implement arithmetic that still returns `UNRESOLVED`; or
2. invent proposal/site facts so the arithmetic can return PASS.

The first adds machinery without changing the evidence frontier. The second is forbidden.

Decision:

> **Hold local-quantitative integration until a real proposal/site supplies the required facts.**

## 4. The seventeen acceleration reviews remain evidence-led

DPL-13F changes neither their source authority nor their disposition.

They remain:

```text
8 planning
9 non-planning
17 total ACCELERATION_REVIEW_REQUIRED
```

Their underlying questions concern neighbour/context, highway/access, heritage, trees, ecology, flood/drainage, noise, title/private rights, sewer, utilities, ground/environment, access and construction logistics.

Those are exactly the classes where real evidence can change the SCREENING due-now frontier.

A synthetic fixture cannot honestly answer whether a real title, neighbour, sewer, flood map, tree, highway or ground condition exists.

## 5. DPL-15 is now dependency-correct

The original programme dependency was:

```text
DPL-13 + DPL-14 → DPL-15
```

Both sides now exist materially:

- DPL-13 has a controlled canonical integration / coverage / `UNRESOLVED @ SCREENING` machinery, tested across two synthetic cases and extended with authored architectural review and source/status composition;
- DPL-14 has eight admitted real Greater-London screening records across seven boroughs with explicit provenance and unknown discipline.

More importantly, the *remaining unanswered questions* now require evidence that those two workstreams were created to meet.

This is the correct moment to cross from synthetic case development into real-site trials.

## 6. First trial selection — DPL-RP-003

Select:

> **DPL-RP-003 — Rear of 73A and 73B Woodside Green, South Norwood, SE25 5HU — Croydon**

This is not selected because it is favourable.

It is selected because it is epistemically rich and difficult.

### Advantages

- exact already-controlled Croydon local-planning target;
- exact London strategic parent already proved;
- official one-house permission (`24/03598/FUL`) in 2025;
- later two-house refusal and May 2026 appeal dismissal;
- explicit proposal-specific character/massing evidence;
- explicit qualitative private-amenity evidence;
- parking/highway evidence that was material but not treated as a universal site entitlement;
- real ambiguity in current physical condition;
- exact legal boundary unknown;
- exact site area/dimensions unknown at survey/title precision;
- access geometry/rights unresolved;
- levels, ground, drainage, utilities, sewers, trees and private rights substantially unresolved.

That combination makes it a stronger first trial than a conveniently clean parcel: it tests whether DPL preserves uncertainty and proposal-dependence when real evidence is contradictory and incomplete.

### Why not DPL-RP-007 first

RP-007 is also Croydon and provides valuable topography stress, but its steep-slope / multi-dwelling-history complications are a less controlled first test of the real-site evidence seam.

### Why not an ordinary street-front parcel first

RP-004 is a useful ordinary street-front control but would immediately require a new Havering local-planning target if local composition were to match the current Croydon maturity. That would mix the first real-site machinery proof with new borough-target research.

RP-003 lets the first trial isolate the real-site evidence problem using planning authority already controlled.

## 7. DPL-RS-01 / RS-02 claim vocabulary is not a universal real-site schema

The 29 `RS-*` claims were deliberately frozen as a Reference-Site integration vocabulary.

They include fixture-specific propositions such as:

- a rectangular 17.4 × 30.0 m parcel;
- an explicit local XY/cardinal frame;
- an already-authored RH 180° transform;
- derived side clearances and garden depths;
- a synthetic street-edge relationship.

A real rear-land Croydon parcel with unknown legal/survey geometry cannot honestly be forced into those propositions merely so DPL-13B accepts the same ids.

The governing DPL-06 rule is more fundamental:

> **The manifest records claims about reality. It does not turn those claims into reality.**

Decision:

> **Treat the 29 `RS-*` ids as synthetic-fixture vocabulary, not as universal real-site truth.**

DPL-15A must use real-site claims and explicitly map them into owner-family/coverage semantics. If a reusable claim-role adapter emerges, it must be earned from the real trial rather than assumed beforehand.

## 8. Exact DPL-15A packet

Admit only:

> **DPL-15A — first real-site screening manifest / coverage trial on DPL-RP-003**

DPL-15A must:

1. consume the frozen DPL-RP-003 corpus record as current project evidence authority;
2. create a deterministic machine-readable real-site manifest/snapshot under DPL-06 semantics;
3. distinguish `KNOWN_AT_SCREENING`, historical evidence, external decision/judgement evidence, partial evidence and `UNKNOWN` without flattening them to booleans;
4. preserve source/evidence refs and the corpus research date;
5. represent current-physical-state uncertainty explicitly;
6. keep legal boundary/title/control/private rights unresolved unless the corpus actually proves them;
7. keep survey geometry, levels, ground, drainage, sewers, utilities, trees and access precision unresolved where current evidence does;
8. preserve historical one-house permission and later refusal/appeal as proposal-specific evidence, not site compatibility;
9. map real claim ids to existing DPL coverage owners/families without renaming them into synthetic RS claim ids;
10. prove which parts of DPL-13B/13C can be reused generically and which are still synthetic-vocabulary coupled;
11. **not author a Reference House placement** while the legal/survey parcel geometry needed to locate the 12.0 × 10.8 m house is absent;
12. expose that missing candidate-authoring evidence as an explicit trial result rather than guessing geometry from screenshots/maps;
13. use exact Croydon + London target identity where planning authority is needed;
14. emit no `COMPATIBLE`, `INCOMPATIBLE` or route-exhaustion result;
15. make no Reference House geometry change.

## 9. What DPL-15A is allowed to conclude

It may conclude facts about the **trial machinery and evidence sufficiency**, for example:

- real-site manifest represented deterministically;
- owner/family mapping complete/incomplete;
- candidate placement `NOT_AUTHORED_INSUFFICIENT_GEOMETRY`;
- named evidence gaps required before a candidate can be authored;
- planning history represented with correct authority/proposal scope.

It may not conclude:

```text
COMPATIBLE
INCOMPATIBLE
likely to get permission
Reference House fits
site should be acquired
```

## 10. DPL-15B remains gated

A later packet may author and evaluate a Reference House candidate only if DPL-15A demonstrates sufficient site geometry/identity evidence.

If DPL-15A instead proves that survey/title evidence is the next genuine blocker, the correct next action is an evidence-acquisition requirement, not a fabricated placement.

## 11. Downstream hold

Continue to hold:

- positive compatibility;
- site incompatibility;
- route exhaustion / optimisation;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 final closeout;
- new Reference House geometry;
- new borough abstraction merely for symmetry.

## 12. Closeout

DPL-M marks an important programme transition.

Until DPL-13F, the dominant question was still whether the internal evidence graph honestly represented its known authority.

After DPL-13F, the dominant question is whether that graph survives contact with real, incomplete and contradictory site evidence.

That is now DPL-15A.
