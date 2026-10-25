# DPL-T4 — deterministic Lennard candidate verification

**Issue:** #752  
**Programme:** DPL  
**Control:** `DPL-T-CONTROL-004`  
**Candidate:** `DPL-T-CANDIDATE-004-01` / revision `0.1`  
**Baseline `main`:** `43bd29bf67bbf796e8ef3ff77bad97a7bced5279`  
**Date:** 2026-10-25  
**Result:** `VERIFIED_BOUNDED_CANDIDATE_READY_FOR_NEXT_DPL_GATE`

## Question

> Can the single human-authored Lennard Road Reference House candidate be reproduced from pinned source authority and pass the bounded DPL-12B architectural conformance seam without route search, repair, source drift or whole-site conclusion inflation?

Yes, at the exact bounded scope below.

T4 verifies the candidate authored by T3. It does not generate, rank, optimise, repair or substitute another placement.

## Controlled inputs

### Reference House

```text
source                         compiler/reference-house/fixture.ts
source git blob                68162a4b6336fac48fd18ecb96eaf915b38ac633
current compile fingerprint    16ffc5c68a0247202997603f5fff48737c4c93d89b5947b40336fde0f63b366c
```

### Site evidence

```text
title boundary blob            2e73185ae1bd0cb8b9b10130abde31d14745f5b3
HMLR reference                 57071807
title source JSON SHA-256      faa4f7bf323166e92345db7e57208b70c197379388e3c9b3e6f1f457d6985450

elevation blob                 6665b293048b40015e08883f14548be40adb3b70
EA raster SHA-256              ee7e04c7eee8f4391bc64cd57485439722e15687ffaad49b4a02804957fd1db9

street/access blob             789b2591d113ea691bb9dc369685c03cc55917b3
```

The bounded EPSG:27700 replay geometry is recorded at:

`project/dpl/sites/dpl-t-control-004-lennard-road-analysis-bng-v01.json`

It is explicitly derived from the unchanged EPSG:4326 HMLR/Planning Data source WKT. Its source-WKT SHA-256 is:

`316c7f30cc418d1dcbd1a3900b98d2aeda4c3982821df023e2a45bacc6c7b676`

The derived geometry improves machine replay, not source authority. It remains indicative title-index SCREENING geometry rather than a determined legal boundary or measured survey.

## Deterministic geometry replay

The executable proof reconstructs the candidate from the authored rigid transform rather than trusting its stored footprint coordinates.

It proves:

```text
shell                         12.000 m × 10.800 m
handedness                    UNMIRRORED
|model +X|                    1
|model +Y|                    1
X·Y                           0
determinant                   +1
screening containment         PASS
minimum title-index clearance ~0.640024 m
```

The same replay reconstructs the architectural street relation from the controlled frontage segment:

```text
frontage bearing              -44.6343476471° from BNG easting
Reference House front bearing -51.6343476471° from BNG easting
front skew                    -7.000°
```

It independently reconstructs the T3 front-centre construction:

```text
frontage midpoint
  + 4.5 m along frontage
  + 26.0 m inward normal
  = 542916.1224158244 E, 166221.2335255643 N
```

and proves that this is the centre of the transformed canonical 12 m front.

The authored SCREENING FFL is also replayed from source evidence:

```text
EA parcel-centroid sample     70.4000015258789 m ODN
authored screening raise      +0.30 m
candidate FFL                 70.70 m ODN
```

No construction-grade grading, retaining, threshold, foundation or drainage conclusion follows from that arithmetic.

## Bounded DPL-12B conformance replay

T4 creates the candidate input from the current Reference House source authority and evaluates it through the existing `evaluateCandidateConformance` seam.

Result:

```text
RH-I02       CONFORMS
RH-PROT-01   CONFORMS
RH-PROT-04   CONFORMS
RH-PROT-06   CONFORMS
RH-V02       CONFORMS
RH-SI02      OPEN / EXTERNAL_OR_UNMODELLED
RH-SI05      OPEN / EXTERNAL_OR_UNMODELLED
```

This is the intended result.

The candidate preserves the controlled house and valid rigid-placement route. The two site-interface freedoms remain open because a placement is not evidence that absolute datum/external-level transition or principal approach/access/landscape integration has been technically discharged.

That follows the existing DPL-08 authority rule: there is no generic `siteInterfaceSolved = true` state.

## Frozen result

Deterministic result record:

`project/dpl/sites/dpl-t-control-004-lennard-road-verification-v01.json`

Semantic result fingerprint:

`7c7b6857b5ca6e0ec01aa799bb071a56bf4dd9ec0fe085e20407aca5681625b4`

The executable proof is:

`compiler/dpl/dplT4Lennard.test.ts`

It fails closed on source-identity drift, transform drift, mirror/deformation, containment failure, frontage-relation drift, candidate-fact drift or conformance-result drift.

## What T4 does not prove

```text
legal title boundary               = UNRESOLVED
private access rights               = UNRESOLVED
highway adoption extent             = UNRESOLVED
measured private topographic survey = NOT ACQUIRED
foundation / ground adequacy        = NOT PROVED
threshold / accessible approach     = NOT PROVED
foul / surface-water solution       = NOT PROVED
utility approach / external plant   = NOT PROVED
planning acceptability              = NOT PROVED
whole-site COMPATIBLE               = NOT ADMITTED
whole-site INCOMPATIBLE             = NOT ADMITTED
route search / exhaustion           = NOT IMPLEMENTED
DPL-16                              = HELD
```

The `~0.640 m` screening clearance is especially not promoted into a legal setback, fire separation, maintenance corridor or construction tolerance.

## Interpretation

T4 has now crossed an important boundary:

```text
T1  controlled geometry says an unchanged RH may fit
T2  real site evidence is sufficient to author a SCREENING candidate
T3  one architecture-authorised candidate exists
T4  that exact candidate is machine-reproducible and boundedly conforming
```

What is still missing is not another placement.

The next useful experiment is to force this verified real candidate through the existing deployment runtime and current coverage/target/interface machinery, so the programme can observe which obligations and evidence gaps actually become decision-critical on a real conventional plot.

## Exact next gate — DPL-T5

> **Assemble `DPL-T-CONTROL-004` + `DPL-T-CANDIDATE-004-01` as one instrumented real-control deployment case through the existing DPL runtime, using current England/London/Bromley target slices and DPL-08 interface authorities; preserve all real-site unknowns and emit coverage/readiness evidence without whole-site compatibility inflation.**

T5 should answer what the current system can and cannot actually evaluate on Lennard Road. It should not pre-emptively design `RH-SI02`, `RH-SI05` or other site-interface responses merely to make the case green.
