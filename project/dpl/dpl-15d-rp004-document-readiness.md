# DPL-15D — RP-004 Official Planning-Document Acquisition / Geometry-Readiness Review

**Issue:** #589  
**Admitted by:** DPL-P #586 / PR #587  
**Site:** DPL-RP-004 — 4 Nelmes Way, Hornchurch, RM11 2QZ  
**Application:** `P0366.26`  
**Assurance:** `SCREENING`  
**Status:** **NOT READY — DOCUMENT RETRIEVAL BOUNDARY.**

## Result

The bounded public-document pass confirms the current Havering application/decision lineage and confirms that a substantial application document corpus is publicly indexed, but it does not recover the actual approved/dimensioned documents needed to judge RP-004 placement geometry.

```text
RP004 result = RP004_NOT_READY_DOCUMENT_RETRIEVAL_BOUNDARY
R1 controlled spatial identity          = NOT_SATISFIED
R2 footprint-test geometry              = NOT_SATISFIED
R3 real orientation frame               = NOT_SATISFIED
R4 datum / level evidence               = NOT_SATISFIED
R5 physical access / street geometry    = NOT_SATISFIED
R6 site identity coherence              = SATISFIED
Reference House candidate               = NOT_AUTHORED
DPL-16                                   = HELD
```

This is a retrieval/evidence result, not a site verdict.

## Evidence recovered

### H1 — Havering application register

First-party application register evidence confirms:

- `P0366.26`;
- 4 Nelmes Way, Hornchurch RM11 2QZ;
- approved with conditions;
- received 25 March 2026;
- validated 7 April 2026;
- decided 9 July 2026;
- replacement dwelling with basement, habitable loft, ancillary outbuilding and associated works.

This is strong identity/status evidence and no more.

### H2 — Havering weekly application list

Havering's official weekly received-applications publication independently preserves the same reference, location, proposal and agent.

Again: application lineage, not geometry.

### H3 — public document index

PlanIndex reports **20 documents on file** for `P0366.26` and states that plans/drawings remain on Havering's portal.

That proves a bounded application-document corpus is indexed. It does not identify an approved drawing schedule or make any individual drawing available to this packet.

H3 therefore remains:

```text
THIRD_PARTY
NO_GEOMETRY_AUTHORITY
```

### H4 — official document-access route

Havering's planning-search interface states that selecting an application reference exposes associated documents.

The bounded retrieval pass could recover the application record but not an itemised P0366.26 document list or inspectable drawing bytes through the available public retrieval path.

H4 therefore records:

```text
INDEXED_NOT_DOCUMENT_RETRIEVABLE
```

not `RECOVERED_AND_INSPECTABLE`.

## Required planning documents not recovered

The packet sought, in order:

1. approved-plan schedule / decision-plan condition;
2. site/block/location plan;
3. dimensioned site geometry;
4. levels/site section/topographical evidence;
5. explicit access geometry.

No controlled document-level source was recovered for any of those propositions.

Searches using the exact application reference with `approved plan`, `approved drawings`, `drawing`, and `site plan` produced no document-level source.

This matters because **knowing that twenty documents exist is not the same as knowing what any one of them proves**.

## Why the result is a retrieval boundary

There are three allowed DPL-15D outcomes.

`READY` requires controlled dimensioned evidence and all six DPL-15C readiness dimensions positively satisfied.

`PUBLIC_GEOMETRY_INSUFFICIENT` applies when the relevant documents are actually recovered/inspectable but their contents do not supply enough geometry.

Here the planning corpus itself is evidenced to exist, but the required documents cannot be individually retrieved and inspected in the bounded pass.

Therefore the honest result is:

```text
RP004_NOT_READY_DOCUMENT_RETRIEVAL_BOUNDARY
```

The system does not pretend that inaccessible evidence is either favourable or unfavourable.

## Marketing evidence rejected

Current property marketing contains claims about the host plot and the scale of the approved replacement dwelling.

None enters this packet's geometry graph.

Forbidden:

- marketing dimensions/areas as planning geometry;
- measuring marketing plans or portal images;
- web-map pixel scaling;
- deriving dimensions from gross area;
- treating the approved replacement-house footprint as a Reference House fit test.

## External evidence remains unresolved

DPL-15D changes none of:

```text
legalTitleControl              = UNRESOLVED
privateRights                  = UNRESOLVED
currentPhysicalState           = UNRESOLVED
surveyGradeGeometry            = UNRESOLVED
groundDrainageSewerUtilities   = UNRESOLVED
structuralAdequacy             = UNRESOLVED
```

Even successful public planning-document geometry would not prove those classes.

## Proof boundary

```text
Reference House candidate      = NOT_AUTHORED
COMPATIBLE                     = NOT_ADMITTED
INCOMPATIBLE                   = NOT_ADMITTED
routeExhaustion                = NOT_IMPLEMENTED
DPL-16 deployment envelope     = HELD
marketingGeometryAuthority     = FORBIDDEN
pixelDerivedMeasurement        = FORBIDDEN
```

## Programme consequence

DPL-15 has now tested the spatial-evidence problem at three levels:

1. **RP-003 real-site representation:** real claims can enter the evidence graph honestly;
2. **RP-003 public evidence:** public planning context did not yield controlled dimensions;
3. **eight-site corpus sweep + RP-004 targeted pass:** the corpus is 0/8 candidate-ready, and the shortest current public-document path still terminates at a document-retrieval boundary.

This is increasingly strong evidence that the next real deployment step cannot be earned by adding more generic compiler machinery.

The next gate should decide whether to:

- record **external spatial evidence required** and hold DPL-15 candidate authoring;
- run one deliberately geometry-rich ninth-site experiment to prove the candidate path itself before waiting for a real survey;
- or obtain the required planning/survey/title documents outside the currently accessible public retrieval channel.

DPL-16 remains held until a real candidate is actually authored and evaluated.
