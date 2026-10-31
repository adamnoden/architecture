# DPL-P — Post-DPL-15C Corpus Evidence Frontier / RP-004 Admission Review

**Issue:** #586  
**Depends on:** DPL-15C #582 / PR #584  
**Reviewed DPL-15C candidate:** `17d113ee996ca5bcf59777ad7c8f1f4bd779c49e`  
**Status:** **PASS DPL-15C; HOLD CANDIDATE AUTHORING AND DPL-16; ADMIT DPL-15D ON RP-004.**

## 1. Decision

DPL-15C establishes the correct corpus-level finding:

```text
CANDIDATE_AUTHORING_READY = 0 / 8
NOT_READY                 = 8 / 8
```

That is not a compiler defect and not eight incompatibility findings. It is a spatial-evidence frontier.

The six-part readiness contract must remain intact. Loosening it merely to obtain a candidate would erase the exact distinction DPL-15 exists to prove: a real site may be identifiable and planning-rich while still lacking enough controlled geometry to author a non-fabricated placement.

One bounded public-document acquisition remains justified before declaring an external survey/title boundary:

> **DPL-15D — RP-004 official planning-document acquisition / geometry-readiness review**

No Reference House candidate is admitted by this gate.

## 2. Why RP-004

Select `DPL-RP-004 — 4 Nelmes Way, Hornchurch, RM11 2QZ` for evidence acquisition only.

The selection is categorical, not a site score.

The frozen corpus already has:

- exact current application reference `P0366.26`;
- exact address/application identity;
- one replacement-dwelling proposal rather than a multi-unit/backland compound case;
- an ordinary public-street relationship;
- Havering approval with conditions on 9 July 2026;
- no known sub-parcel/source-identity conflict comparable to RP-005;
- no previous DPL-15 public-document acquisition pass.

This makes RP-004 the shortest currently visible path from `NOT_READY` to a better-evidenced readiness decision. It does **not** make RP-004 more compatible, desirable or purchasable than the other sites.

## 3. Fresh public-source preflight

The gate checked whether RP-004 actually has a bounded public-document target rather than merely looking convenient in the frozen corpus.

### Havering planning register

Official application page:

`https://development.havering.gov.uk/OcellaWeb/planningDetails?from=planningSearch&reference=P0366.26`

Current published record confirms:

```text
reference = P0366.26
status    = Apprv with cons
location  = 4 Nelmes Way Hornchurch RM11 2QZ
received  = 2026-03-25
validated = 2026-04-07
decided   = 2026-07-09
```

Proposal:

> Construction of a replacement dwelling with basement, habitable loft space, ancillary outbuilding, bin storage, cycle storage and associated works following demolition of existing dwelling.

This is first-party application identity/status authority. It is not spatial geometry authority by itself.

### Havering weekly applications publication

Havering's official received-applications publication for 7–13 April 2026 independently preserves the same reference, proposal, location and agent.

This confirms the application lineage but supplies no placement geometry.

### Public document index

PlanIndex currently reports **20 documents on file** for `P0366.26` and states that the plans/drawings remain on Havering's council portal.

Treat this only as evidence that a bounded document corpus exists. PlanIndex is not the authority for the drawing contents.

The gate's direct search did not recover a controlled approved-plan list, site-plan PDF or dimensioned drawing from the indexed public surfaces. Therefore RP-004 remains `NOT_READY` now.

## 4. Marketing evidence remains outside geometry authority

Current property marketing describes a large host property/grounds and a very large approved replacement dwelling.

DPL-P explicitly refuses to use those particulars for candidate geometry.

Do not derive:

- legal/site boundary;
- width/depth;
- orientation;
- Reference House fit;
- placement polygon;
- access dimensions;
- levels;
- candidate readiness

from marketing area, marketing plans, listing images or web-map scaling.

The purpose of DPL-15D is to ask whether the **planning file itself** carries sufficiently controlled screening geometry.

## 5. Source hierarchy for DPL-15D

Acquire in this order:

1. Havering decision notice and/or condition carrying approved drawing schedule;
2. Havering-hosted application/approved location plan;
3. Havering-hosted site/block/existing/proposed site plan with explicit scale or dimensions;
4. Havering-hosted level/site-section/topographical information if present;
5. Havering-hosted access/driveway geometry if explicit;
6. only if first-party bytes cannot be recovered, faithful public mirrors of those exact documents, retaining mirror status.

A mirror can preserve useful document evidence but cannot become first-party merely because its file appears genuine.

## 6. Geometry evidence rule

DPL-15D may classify a source as screening-dimensional only where the actual controlled document supplies an explicit scale/dimension relationship adequate to the proposition being made.

Forbidden:

- pixel measurement;
- screenshot scaling;
- approximate web-map measurement;
- inferred rectangle from gross area;
- estimating dimensions from the approved replacement house;
- assuming the planning red line equals legal title.

## 7. Exact DPL-15D result universe

DPL-15D must emit exactly one readiness outcome:

```text
RP004_SCREENING_CANDIDATE_AUTHORING_READY
RP004_NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT
RP004_NOT_READY_DOCUMENT_RETRIEVAL_BOUNDARY
```

`READY` is permitted only if the acquired public planning evidence positively satisfies all DPL-15C R1–R6 dimensions at SCREENING scope.

`DOCUMENT_RETRIEVAL_BOUNDARY` is appropriate if the official record demonstrates that relevant documents exist but the present retrieval path cannot obtain inspectable authoritative/mirror bytes needed to judge their geometry content.

`PUBLIC_GEOMETRY_INSUFFICIENT` is appropriate if the actual recovered documents are inspectable but still lack the required geometry.

## 8. Authority explicitly still held

Even an RP-004 READY result would leave unresolved unless independently evidenced:

- legal title/control;
- covenants/easements/private rights;
- current as-built condition;
- survey-grade topography;
- geotechnics/groundwater/contamination;
- drainage/sewers/utilities;
- structural adequacy;
- Reference House planning judgement;
- construction logistics.

Candidate authoring readiness is not compatibility.

## 9. Why no ninth site yet

Do not add a ninth site merely because its planning documents are easier to scrape.

The current corpus was selected for deployment-pathology coverage, not document convenience. First exhaust one ordinary current application whose known official file contains a substantial document set.

If RP-004 still cannot reach readiness, a later gate can make the programme-level decision among:

- externally supplied survey/title/spatial evidence;
- a deliberately geometry-rich ninth-site experiment;
- pausing real candidate authoring while retaining the real-site evidence findings already earned.

## 10. Generic work remains held

Do not introduce:

- a generic council-portal scraper;
- automatic drawing/image measurement;
- a universal planning-document parser;
- a scalar readiness/site score;
- a universal real-site ontology;
- DPL-16 deployment-envelope inference.

DPL-15D is a one-site evidence acquisition and readiness review.

## 11. DPL-16 remains held

A deployment envelope cannot be derived while the real corpus has produced no authored/evaluated Reference House candidate.

The correct dependency remains:

```text
real candidate evidence → real evaluation evidence → DPL-16
```

not:

```text
corpus metadata → inferred deployment envelope
```

## 12. Closeout

DPL-15C demonstrates that the current corpus is universally spatial-evidence-blocked at candidate-authoring level.

DPL-P narrows the next experiment to the cheapest legitimate attempt to break that boundary: recover the controlled current planning drawings for RP-004 and test the same six readiness dimensions without weakening them.
