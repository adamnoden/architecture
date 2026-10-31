# DPL-T9 — Lennard structural-concept review addendum

**Control:** `DPL-T-CONTROL-004` — 41 Lennard Road, Bromley, BR2 8LN  
**Candidate:** `DPL-T-CANDIDATE-004-01` / rev 0.1  
**Base structural brief:** `docs/reference-house/external-review-structural-rh11.md`  
**Status:** addendum authored; **no engineer commissioned**

## Purpose

Do not create a second generic structural brief. RH-11 already asks the competent structural-engineer red-team question for the controlled Reference House and explicitly withholds any structural-adequacy claim.

This addendum supplies only the Lennard-specific candidate/site context needed to answer `RH-PROT-08` at the deployment SCREENING gate.

## Review question

> Does the existing RH-05 / RH-11 primary structural concept remain a credible structural concept for the exact unchanged T3/T4 Lennard candidate, without requiring a material rewrite of protected Reference House order?

The required answer is conceptual. Detailed member/foundation design is outside this gate.

## Controlled Lennard inputs

Use the exact controlled candidate and verification artifacts:

- `project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json`
- `project/dpl/sites/dpl-t-control-004-lennard-road-verification-v01.json`
- `project/dpl/sites/dpl-t-control-004-lennard-road-elevation.json`
- `project/dpl/dpl-t4-lennard-candidate-verification.md`

Candidate facts relevant to the review:

```text
Reference House shell       = 12.0 m × 10.8 m
storeys                      = 2
handedness                   = UNMIRRORED
variant                      = RH-V02 rigid placement
screening FFL                = 70.70 m ODN
EA DTM parcel range          ≈ 0.90 m
measured private topography  = NOT ACQUIRED
ground investigation         = NOT ACQUIRED
```

The EA DTM is screening terrain only. It is not ground/foundation evidence.

## Exact decision requested

Return one of:

```text
CONCEPT_ACCEPTABLE_NO_PROTECTED_ORDER_CHANGE_IDENTIFIED
CONCEPT_ACCEPTABLE_WITH_FUTURE_DETAIL_DEPENDENCIES
CONCEPT_CONFLICT_IDENTIFIED
```

For the first two states, identify any important later dependencies but do not design them.

For `CONCEPT_CONFLICT_IDENTIFIED`, identify precisely which protected architectural condition is implicated and why. Do not redesign the house in the review response.

## Minimum questions

In addition to the existing RH-11 structural questions, answer only these site/candidate-specific points:

1. Does the 70.70 m ODN screening datum or the admitted ~0.90 m parcel DTM range reveal any obvious reason the controlled structural concept is inherently implausible on this candidate?
2. Is any foundation assumption embedded in the RH structural concept such that lack of ground investigation prevents even a concept-level positive disposition?
3. Can the review distinguish a credible **superstructure concept** from future foundation/ground adequacy, rather than withholding all concept judgement until detailed GI exists?
4. Does the exact rigid site placement introduce any structural consequence that would require moving, mirroring, splitting or otherwise mutating the protected Reference House geometry?
5. Are there any site-related dependencies that must be promoted to the current SCREENING frontier because they plausibly threaten the structural concept itself, rather than merely future foundation detailing?

## Explicit exclusions

Do **not** provide or require at this gate:

- detailed member sizing;
- reinforcement schedules;
- foundation design;
- geotechnical investigation as a default prerequisite unless the reviewer explains why concept judgement is impossible without it;
- drainage design;
- Building Regulations approval;
- temporary works design;
- construction method statement;
- alternative plan or architectural redesign;
- optimisation or route search.

## DPL interpretation

This review exists only to resolve `REFERENCE_HOUSE:RH-PROT-08` at SCREENING.

A positive concept disposition does not prove:

```text
Part A compliance
foundation adequacy
ground suitability
member adequacy
construction-stage stability
whole-site COMPATIBLE
```

A negative concept disposition likewise does not prove whole-site `INCOMPATIBLE`; it creates a precise protected-order conflict for later DPL handling.
