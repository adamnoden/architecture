# DPL-N — Post-DPL-15A Evidence-Acquisition / Candidate-Readiness Review

**Issue:** #538  
**Depends on:** DPL-15A #532 / PR #536  
**Reviewed baseline:** `732dabfca881cbb43b35a109d861e8921bbb0122`  
**Status:** **PASS DPL-15A; HOLD CANDIDATE AUTHORING; ADMIT DPL-15B PUBLIC PLANNING-EVIDENCE ACQUISITION.**

## 1. Decision

DPL-15A is accepted as the first controlled real-site evidence / coverage trial.

It proves that the RP-003 corpus can enter the DPL evidence graph without synthetic `RS-*` coercion and without turning historical planning evidence into current physical truth.

Its candidate-authoring refusal remains correct:

```text
candidateAuthoringState = NOT_AUTHORED_INSUFFICIENT_GEOMETRY
```

The next useful question is narrower than title/survey completion:

> **Can already-public planning material improve the geometry evidence enough to decide whether a provisional SCREENING candidate could later be authored without pretending that planning drawings are title/survey authority?**

There is enough public evidence value to justify one bounded acquisition packet.

Admit only:

> **DPL-15B — RP-003 bounded public planning-evidence acquisition / geometry-readiness review**

DPL-15B must not author the candidate itself.

## 2. Assurance-level distinction

DPL-15A correctly demanded real evidence rather than map-derived guesses.

DPL-N freezes a more precise rule:

> **Evidence may be adequate for a SCREENING proposition without being adequate for title, survey, technical design or construction.**

A controlled planning drawing can therefore support a bounded screening geometry proposition if it contains an explicit scale/dimension and a clear application boundary.

It still cannot establish:

- legal title boundary;
- ownership/control;
- private rights/easements/covenants;
- current as-built physical condition;
- survey-grade levels;
- geotechnical/drainage/sewer/utility facts;
- structural adequacy.

Conversely, a planning document does not gain geometry authority merely because it was submitted with an application. Undimensioned illustrations, presentation diagrams, approximate maps and pixel-derived measurements remain insufficient.

## 3. Public evidence already recovered

The gate tested whether the public record contains material information beyond the frozen DPL-14B corpus.

### 3.1 First-party Croydon decision authority — strong

Croydon's own weekly-decisions record states:

```text
24/03598/FUL
73A and 73B Woodside Green
Full planning permission
Demolition of existing garages and construction of a replacement
2-storey 4-bedroom dwellinghouse with off-street parking
Permission Granted
Decision: 11 April 2025
```

Source:

`https://croydon.moderngov.co.uk/documents/s64687/Weekly_Decisions_310325to270425.pdf`

This confirms the DPL-14B historical one-house permission claim at first-party authority.

It does not contain the approved-plan geometry needed to author a candidate.

### 3.2 Applicant Design & Access Statement — useful mirror, not geometry proof yet

A public planning-document mirror exposes a Design & Access Statement for the same site/application context:

`https://docs.planning.org.uk/20250225/117/SS8MYVJLJ6W00/yp3zbnvdl787fhmd.pdf`

Indexed text confirms:

- demolition of garages and one replacement two-storey four-bedroom dwelling with off-street parking;
- application site at 73A/73B Woodside Green;
- rear development land containing garages facing Dickenson's Lane plus part of the rear gardens;
- a similar `18/05834/FUL` consent granted on 8 March 2019;
- the later application sought to reinstate that consent.

The mirror is useful evidence about application/site context.

It is **not yet admitted as dimensional geometry evidence**. In this review environment the PDF itself could not be opened for controlled page inspection, and the indexed text does not expose an approved drawing schedule or explicit site dimensions.

### 3.3 Applicant fire-safety statement — useful boundary/context visual, not dimensional proof

A second mirrored applicant document is publicly indexed:

`https://docs.planning.org.uk/20250225/117/SS8MYVJLJ6W00/1bidftjj9lki2cty.pdf`

Indexed material confirms the same rear-site description and one-house proposal. Its indexed visual metadata shows a site-location plan with a red application boundary and north arrow around the rear land.

That is useful evidence that a controlled application boundary document exists in the public material.

It is **not** treated as sufficient candidate geometry because the present retrieval does not establish controlled drawing scale, explicit dimensions or approved-plan status.

## 4. Source conflict red team

A third-party planning index currently reports `24/03598/FUL` as withdrawn on 25 October 2024.

That source is not admitted for the decision result because a later and stronger first-party Croydon record explicitly records **Permission Granted, 11 April 2025** for the same reference/site/proposal.

DPL-N therefore freezes:

> **Where public indexes conflict with later first-party decision authority, preserve the conflict in provenance but do not downgrade the stronger official decision record.**

DPL-15B should record this conflict as a source-quality lesson rather than as a site uncertainty.

## 5. Why public evidence acquisition is worth one packet

The current search proves the existence of application material more specific than the DPL-14B summary, but not yet enough to authorize a placement.

A bounded acquisition packet has meaningful information value because it can try to recover, in authority order:

1. Croydon decision notice and approved-plan schedule;
2. Croydon-hosted application drawings/documents;
3. dimensioned submitted/approved site or block plan;
4. explicit red-line boundary drawing;
5. plan drawing number/revision/date;
6. explicit access geometry;
7. explicit proposed/site levels where documented;
8. private-amenity/garden geometry relevant to Croydon quantitative policy.

If those are unavailable or not sufficiently dimensioned, DPL-15B can close with a useful negative result:

```text
SCREENING_CANDIDATE_AUTHORING_READY = NO
```

and name the precise evidence class that now requires survey/title/professional acquisition.

## 6. Candidate authoring remains held

DPL-N does not admit a screening placement from the evidence currently in hand.

Reasons:

- no controlled approved-plan schedule has been recovered;
- no controlled dimensioned site/block plan has been inspected;
- no explicit parcel dimensions have been admitted;
- no survey-grade levels have been admitted;
- no title/control authority has changed;
- current physical condition remains unknown.

The next packet is evidence acquisition / readiness review only.

## 7. Generic real-site adapter remains held

DPL-15A already proves that the fifteen RP-003 real claims can be deterministically mapped to live owner-family authority without a universal real-site ontology.

No generic adapter is currently blocking useful work.

Decision:

> **Do not universalise the real-claim schema before a real candidate exists. Earn the next abstraction from the evidence/candidate seam.**

## 8. Exact next packet — DPL-15B

Admit only:

> **DPL-15B — RP-003 bounded public planning-evidence acquisition / geometry-readiness review**

It must:

1. preserve DPL-15A as a frozen baseline;
2. create a separately versioned evidence supplement rather than silently rewriting the old manifest;
3. record retrieval date, source URL, host/publisher, first-party/mirror status, application reference, document identity and evidence authority class;
4. prefer first-party Croydon material over mirrors;
5. recover exact document/drawing numbers, revisions and dates where available;
6. extract only explicit dimensional/geometry facts;
7. prohibit pixel-derived measurement or approximate map scaling;
8. cross-check `24/03598/FUL` decision status against first-party Croydon authority;
9. preserve `18/05834/FUL` as historical related-consent context only unless its documents are separately acquired;
10. record the third-party withdrawn-status conflict without giving it equal authority to the later official Croydon decision;
11. distinguish application red-line/planning geometry from title/legal boundary;
12. decide only `SCREENING_CANDIDATE_AUTHORING_READY | NOT_READY`;
13. refuse candidate authoring itself;
14. leave title, rights, current physical state, ground, drainage, sewers, utilities and structural evidence unresolved unless independently proved;
15. emit no `COMPATIBLE`, `INCOMPATIBLE`, route-exhaustion or planning-likelihood result.

## 9. Held work

Continue to hold:

- DPL-15 candidate authoring/evaluation;
- `COMPATIBLE @ SCREENING`;
- `INCOMPATIBLE`;
- route exhaustion / optimisation;
- Reference House mutation;
- Croydon local-quantitative PASS based on inferred dimensions;
- generic real-site ontology;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 closeout.

## 10. Closeout

DPL-15A found a genuine evidence boundary, but the boundary is not yet necessarily the expensive survey/title boundary.

There is one cheap, disciplined step left: acquire the public planning evidence properly and ask whether it earns a **SCREENING-only** geometry proposition.

That is DPL-15B.
