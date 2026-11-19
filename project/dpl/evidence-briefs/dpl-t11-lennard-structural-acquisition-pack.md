# DPL-T11 — Lennard structural concept acquisition pack

**Control:** `DPL-T-CONTROL-004` — 41 Lennard Road, Bromley, BR2 8LN  
**Candidate:** `DPL-T-CANDIDATE-004-01` / rev 0.1  
**Purpose:** acquisition-ready competent structural concept review  
**Status:** ready to issue if explicitly authorised; **not commissioned**

**Historical-source applicability — 29 October 2026:** this unchanged Lennard candidate uses the predecessor 12 × 10.8 m house. The generic source path `docs/reference-house/external-review-structural-rh11.md` now contains current 12 × 12 m house questions and must not be substituted into this historical pack. Use the exact [retained pre-refresh brief](rh11-structural-pre-refresh.txt), path `project/dpl/evidence-briefs/rh11-structural-pre-refresh.txt`, observed at commit `c7d994a962be3d17d19ad85bd397f20d872d6817`, original Git blob `9ee85484ab6972a1063c4226c643f5bed146f8d8`. The text snapshot retains relative links in their original docs/reference-house context and is not a relocated live Markdown page. This identifies retained bytes, not the date of the original T9/T11 review preparation. The current-house brief and [EPR applicability](../../epr/current-house-review-applicability.md) require their own candidate/site reconciliation before any new issue. No review has been commissioned or returned by this archive correction.

## One review, not two

Issue these together as one controlled pack:

1. the retained pre-refresh brief above, originally `docs/reference-house/external-review-structural-rh11.md`
2. `project/dpl/evidence-briefs/dpl-t9-lennard-structural-concept-addendum.md`
3. the exact T3/T4 candidate and verification artifacts named in the Lennard addendum.

RH-11 already contains the generic structural red team: load path/stability, floor framing, masonry/openings, roof/PV, foundation/ground questions, four adverse cases and explicit architectural rewind conditions. The Lennard addendum supplies only the site/candidate delta. **Do not write or procure a second generic structural report.**

## Decision requested

The competent reviewer must return exactly one primary SCREENING disposition:

```text
CONCEPT_ACCEPTABLE_NO_PROTECTED_ORDER_CHANGE_IDENTIFIED
CONCEPT_ACCEPTABLE_WITH_FUTURE_DETAIL_DEPENDENCIES
CONCEPT_CONFLICT_IDENTIFIED
```

This is a concept judgement, not member or foundation design.

## Minimum return

Return a short evidence-bearing note containing:

```text
reviewer competence / discipline basis
review date
pack version / document identities reviewed
primary SCREENING disposition
material findings first
protected Reference House conditions implicated, if any
future technical dependencies, separated from current concept blockers
whether GI is required before concept judgement, with reason if YES
whether any exact T3/T4 site-placement consequence forces RH mutation
standards / Eurocodes / National Annex basis relied upon
```

For `CONCEPT_CONFLICT_IDENTIFIED`, identify the exact protected architectural condition and mechanism. Do **not** redesign the house in the response.

## Site-specific questions

In addition to RH-11, answer the five Lennard questions already frozen in the T9 addendum, including whether the 70.70 m ODN screening datum / ~0.90 m DTM range exposes an inherent concept problem, whether superstructure judgement can be separated from future ground/foundation adequacy, and whether the rigid site placement itself creates a mutation requirement.

## Explicit non-scope

Do not include by default:

- detailed member sizing or schedules;
- reinforcement design;
- foundation design;
- geotechnical investigation unless the reviewer explains why concept judgement is impossible without it;
- drainage design;
- Building Regulations approval;
- temporary works;
- construction method statement;
- alternative plan, siting or architectural redesign;
- optimisation / route search.

## DPL consumption rule

A positive concept disposition may resolve `REFERENCE_HOUSE:RH-PROT-08` at SCREENING only. It does not prove Part A compliance, ground suitability, foundation/member adequacy or whole-site compatibility.

A conflict likewise does not prove whole-site incompatibility. It creates an exact protected-order conflict for the next DPL gate.

## Commissioning boundary

This pack is **ACQUISITION_READY**, not commissioned. No engineer has been contacted and no spend is authorised by DPL-T11.
