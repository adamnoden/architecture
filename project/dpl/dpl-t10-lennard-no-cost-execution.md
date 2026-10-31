# DPL-T10 — Lennard no-cost execution and commissioning threshold

**Control:** `DPL-T-CONTROL-004` — 41 Lennard Road, Bromley, BR2 8LN  
**Candidate:** `DPL-T-CANDIDATE-004-01` / rev 0.1  
**Parent:** DPL-T9 result `55c7020d704b1285527c7249c961783185f56d467e0cdd7f5c93fcdc80393e6a`  
**Assurance:** SCREENING  
**External commissioning:** none

## Result

`NO_COST_DECISIONS_EXECUTED_COMMISSIONING_THRESHOLD_FROZEN`

Frozen CI identities:

```text
T10 result fingerprint
  7a429b81016943fb12ba84b08df5ee18f618f85fc896253f983dd0b95bdfdaca

T10 evidence fingerprint
  4cf6f09a0a0c387172777c03db544c44a3f7b05ef4ef550964624cbde6b59a15
```

These identities were emitted by `compiler/dpl/dplT10Lennard.test.ts` on the exact green PR head and are preserved in `project/dpl/sites/dpl-t-control-004-lennard-road-t10-result-v01.json`.

## Reduction

DPL-T9 entered with four distinct decision dependencies:

```text
COMPETENT_STRUCTURAL_CONCEPT_REVIEW
EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY
MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY
PLANNING_DESIGN_CONTEXT_REVIEW
```

T10 executed the planning dependency rather than procuring a planner.

Result:

```text
T9 decision dependencies                = 4
planning dependency executed/folded     = 1
T10 active dependencies                 = 3
commissioning-eligible evidence classes = 2
actually commissioned                   = 0
```

The remaining active dependencies are exactly:

```text
COMPETENT_STRUCTURAL_CONCEPT_REVIEW
EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY
MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY
```

## Planning design/context execution

The bounded delegated project-author review returns:

`SCREENING_CONTEXT_CONCERN_REQUIRES_EXISTING_TARGETED_GEOMETRY_RETURN`

This is neither a positive planning conclusion nor a conflict/refusal.

The exact-site 2024 refusal establishes that side space, dominance and street-scene relationship are genuine site sensitivities. It belongs to a materially different proposal and is not transferred onto the Reference House candidate.

The unchanged Reference House sits materially inland of the street frontage. Current evidence cannot prove categorical contextual conflict, but the indicative title-index side clearances are not strong enough to support a positive Policy 8 or maintenance conclusion either.

The planning dependency therefore folds into the already-existing targeted measured geometry dependency. No separate planning consultant is earned at this gate.

See `project/dpl/dpl-t10-lennard-planning-context-execution.md`.

## Flood recovery

The Environment Agency's official postcode dataset and direct CSV resource were identified. The execution environment did not acquire the exact `BR2 8LN` row from the authoritative bytes.

Therefore:

```text
EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY = STILL NO-COST / PENDING
FRA or flood consultant               = NOT EARNED
secondary postcode substitution       = PROHIBITED
```

Technical inability to retrieve the row is not promoted into substantive flood uncertainty requiring professional procurement.

## Commissioning threshold

Exactly two evidence classes are now eligible for external acquisition if and when the project author explicitly authorises it:

### 1. Competent structural concept review

Use the existing RH-11 structural red-team brief and the Lennard-specific addendum. Do not duplicate the generic Reference House structural package.

This is concept-level competent-engineer review only. It does not pre-authorise detailed engineering or site investigation.

### 2. Measured side-boundary and maintenance geometry

Use one narrow measurement package for both:

```text
REFERENCE_HOUSE:RH-PROT-14
PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY
```

It also provides the factual return needed to replay the T10 planning-context judgement.

It does not pre-authorise a full topographic survey, determined legal boundary, drainage/utilities tracing, GI, Party Wall advice or redesign.

## Exact record fingerprints

```text
COMPETENT_STRUCTURAL_CONCEPT_REVIEW
  bc1c4168e47f4cd752b5c36905b9fc14010c1bdea200aa7426b8195338544d77

EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY
  5af435f46b56bf04c49889f9d7f4ada5c646ef08b1144e05d5d95d5eb00dc068

MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY
  948f3f19c0ca1b1487d3dc98e5aa4001296904640e35b4d3a84dddde5e787063

PLANNING_DESIGN_CONTEXT_REVIEW [folded]
  77a093f2602f1745e949b064aa239c698879905cfbaa6b6d4efb7e67ede4bb97
```

## Proof boundary

T10 does not claim or perform any of the following:

- whole-site `COMPATIBLE`;
- whole-site `INCOMPATIBLE`;
- route exhaustion;
- Reference House mutation;
- determined legal boundary;
- structural adequacy;
- property-level flood conclusion;
- statutory planning permission/refusal;
- external contact, procurement or spend.

DPL-16 remains **HELD**.

## Next packet

**DPL-T11 — exhaust remaining no-spend evidence and freeze acquisition-ready packages.**

T11 should attempt every remaining honest zero-cost reduction of the three-dependency frontier, inspect first-party exact-site material for usable evidence without promoting its authority class, and make the two external packages genuinely acquisition-ready. It must not contact or commission external parties without explicit project-author authority.
