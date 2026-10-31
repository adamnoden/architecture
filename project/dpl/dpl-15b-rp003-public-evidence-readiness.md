# DPL-15B — RP-003 Public Planning-Evidence Acquisition / Geometry-Readiness Review

**Issue:** #540  
**Admitted by:** DPL-N #538 / PR #539  
**Baseline:** DPL-15A merge `732dabfca881cbb43b35a109d861e8921bbb0122`  
**Site:** DPL-RP-003 — rear of 73A/73B Woodside Green, South Norwood, SE25 5HU  
**Status:** **PUBLIC EVIDENCE ACQUIRED; SCREENING CANDIDATE AUTHORING NOT READY.**

## 1. Decision

The bounded public-evidence pass improves source provenance and application context but does **not** recover controlled dimensional geometry sufficient to authorize even a provisional DPL screening placement.

Result:

```text
first-party application decision   = PERMISSION_GRANTED / 2025-04-11
public application context         = IMPROVED
controlled dimensioned site plan   = NOT_ACQUIRED
approved plan schedule             = NOT_ACQUIRED
screening geometry readiness       = NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT
Reference House candidate          = NOT_AUTHORED
```

The negative readiness result is useful: the cheap public-web pass has now been exhausted without fabricating dimensions.

## 2. Evidence supplement

The separately versioned supplement is:

`project/dpl/sites/dpl-rp-003-public-evidence-supplement-v01.json`

It does not rewrite the landed DPL-15A manifest.

Every source records:

- URL / host / publisher;
- first-party, mirror or third-party relationship;
- authority class;
- retrieval mode;
- application reference / document identity;
- geometry-authority class;
- recovered facts;
- limitations;
- a semantic record fingerprint at runtime.

Remote PDF bytes were not acquired into the repository, so the supplement does not pretend to carry remote-byte hashes.

## 3. E1 — Croydon first-party decision record

Source:

`https://croydon.moderngov.co.uk/documents/s64687/Weekly_Decisions_310325to270425.pdf`

Authority:

```text
FIRST_PARTY_LOCAL_AUTHORITY_DECISION_RECORD
FIRST_PARTY
NO_GEOMETRY_AUTHORITY
```

Recovered:

- `24/03598/FUL`;
- 73A/73B Woodside Green;
- full planning permission;
- demolition of garages + replacement two-storey four-bedroom dwelling with off-street parking;
- `Permission Granted`;
- decision 11 April 2025.

The official decision list itself also directs users to Croydon's online planning service for application drawings and decision notices. That confirms a stronger document set should exist, but the decision list is not itself that document set.

## 4. E2 — mirrored Design & Access Statement

Source:

`https://docs.planning.org.uk/20250225/117/SS8MYVJLJ6W00/yp3zbnvdl787fhmd.pdf`

Authority:

```text
PUBLIC_DOCUMENT_MIRROR_APPLICANT_STATEMENT
MIRROR
CONTEXT_GEOMETRY_ONLY
```

Recovered indexed text confirms:

- the one-house four-bedroom proposal;
- application site 73A/73B Woodside Green;
- rear land containing garages facing Dickenson's Lane plus part of the rear gardens;
- related `18/05834/FUL` consent from 8 March 2019;
- applicant intent to reinstate that consent.

The retrieval did not yield a controlled inspected dimensioned site/block plan, drawing scale, plan number/revision or approved-plan schedule.

Therefore E2 does not authorize numeric placement geometry.

## 5. E3 — mirrored Fire Safety Statement

Source:

`https://docs.planning.org.uk/20250225/117/SS8MYVJLJ6W00/1bidftjj9lki2cty.pdf`

Authority:

```text
PUBLIC_DOCUMENT_MIRROR_APPLICANT_STATEMENT
MIRROR
CONTEXT_GEOMETRY_ONLY
```

Indexed material confirms the same site/proposal. Search/index metadata also exposes that the document contains a site-location plan with a red application boundary and north arrow.

That visual is not upgraded into geometry authority:

- no controlled page inspection was available during this acquisition;
- no explicit scale/dimensions were recovered;
- no pixel-derived measurement is admitted;
- approved-plan status was not established.

## 6. E4 — conflicting third-party index

Source:

`https://planning-records.uk/croydon/2024/`

Authority:

```text
THIRD_PARTY_INDEX
THIRD_PARTY
NO_GEOMETRY_AUTHORITY
```

It reports `24/03598/FUL` as withdrawn on 25 October 2024.

The controlled status remains the later first-party Croydon record:

```text
Permission Granted — 11 April 2025
```

The validator does not select this by searching for the word `granted`. It validates an explicit authority hierarchy:

```text
FIRST_PARTY > MIRROR > THIRD_PARTY
```

and requires the selected decision-status source to be first-party.

E4 remains in the supplement because contradictory public indexes are useful provenance evidence. It does not receive equal decision authority.

## 7. Geometry readiness

The finite geometry-authority vocabulary is:

```text
NO_GEOMETRY_AUTHORITY
CONTEXT_GEOMETRY_ONLY
EXPLICIT_DIMENSIONED_SCREENING_GEOMETRY
APPROVED_DIMENSIONED_SCREENING_GEOMETRY
```

Current sources are only the first two classes.

No DPL-15B source earns either dimensioned class.

Named missing geometry remains:

- approved-plan schedule;
- controlled dimensioned site/block plan;
- explicit site width/depth/area usable at screening;
- controlled drawing scale sufficient for placement;
- explicit screening access dimensions;
- screening level/topography geometry.

Therefore the derived result is:

```text
NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT
```

The code would permit `SCREENING_CANDIDATE_AUTHORING_READY` only if an admitted source actually carries explicit/approved dimensioned screening geometry **and** the named geometry-gap set is empty.

## 8. External evidence boundary is unchanged

Planning geometry, even if later recovered, would not silently prove:

```text
legalTitleBoundary          = UNRESOLVED
ownershipControl            = UNRESOLVED
privateRights               = UNRESOLVED
currentPhysicalState        = UNRESOLVED
surveyGradeTopography       = UNRESOLVED
groundDrainageSewerUtilities = UNRESOLVED
structuralAdequacy          = UNRESOLVED
```

DPL-15B changes none of those authority classes.

## 9. Result boundary

DPL-15B explicitly retains:

```text
compatibleAtScreening  = NOT_ADMITTED
incompatible            = NOT_ADMITTED
routeExhaustion         = NOT_IMPLEMENTED
Reference House candidate = NOT_AUTHORED
Reference House mutation  = NOT_AUTHORISED
planningLikelihood      = NOT_CLAIMED
purchaseRecommendation  = NOT_CLAIMED
```

## 10. What the packet has earned

The first real-site programme has now crossed two separate evidence boundaries:

1. DPL-15A proved the real site can be represented honestly without synthetic ontology coercion.
2. DPL-15B proved a bounded public-web acquisition can improve provenance/context but cannot yet supply the dimensional geometry required for candidate placement.

The next decision should no longer be another generic compiler feature.

It should ask whether to:

- perform a **deeper application-document acquisition** through Croydon's own planning register / approved drawing set;
- formally require title/topographical survey evidence;
- or pause RP-003 candidate work until such evidence is supplied.

A post-DPL-15B gate must choose explicitly. It must not author DPL-15C merely because a historical planning permission exists.
