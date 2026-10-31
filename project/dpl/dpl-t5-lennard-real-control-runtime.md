# DPL-T5 — Lennard real-control runtime assembly and screening-coverage replay

**Issue:** #763  
**PR:** #766  
**Baseline:** `96afe215f4615581ac78e3be1aeffe612c42d6b3`  
**Control:** `DPL-T-CONTROL-004`  
**Candidate:** `DPL-T-CANDIDATE-004-01` / revision `0.1`  
**Assurance:** `SCREENING`  
**Date:** 2026-10-25  
**Result:** `REAL_CONTROL_RUNTIME_COMPOSED_GAPS_EXPOSED`

## Question

Can the verified Lennard Road Reference House candidate be composed through the existing DPL runtime as a real instrumented control, using current England / London / Bromley authority, without converting missing evidence into invented facts or importing the applicant's different proposal into the Reference House candidate?

Yes.

T5 is the first DPL real-control case that reaches the generic deployment runtime with an actually authored and machine-verified Reference House candidate.

## Real-control evidence layer

T5 adds:

`project/dpl/sites/dpl-t-control-004-lennard-road-runtime-manifest-v01.json`

It deliberately uses seventeen real-control claims:

```text
LNR-C01 … LNR-C17
```

It does **not** rename real evidence into the synthetic `RS-*` fixture vocabulary.

All 17 claims map explicitly into current DPL-10 / DPL-11 owner-family authority. The control remains:

```text
INSTRUMENTED_REAL_CONTROL
EXCLUDED_FROM_DEPLOYMENT_ENVELOPE_SAMPLE
```

The DPL-14 corpus remains exactly eight sites. DPL-16 remains held.

## Runtime composition

Adapter:

`compiler/dpl/dplT5Lennard.ts`

Proof:

`compiler/dpl/dplT5Lennard.test.ts`

T5 reuses the existing runtime rather than creating a second compiler:

```text
compileDeploymentCase(...)
loadWaveCInterfaceContracts()
loadWaveCTargetComposition('Bromley')
```

Current target stack contains four controlled targets, including:

- England structure / ground / moisture / materials;
- England drainage / waste / water;
- London strategic residential design;
- Bromley local planning under the controlled London strategic parent.

Current interface stack contains:

- `DPL-08B-GROUND-DATUM-PLINTH-APPROACH`;
- `DPL-08C-FOUL-SURFACE-SITE-WATER`.

## Proposal-fact discipline

T5 admits exactly one runtime proposal fact:

```text
dwellingStoreys = 2
```

This is directly mapped from the controlled Reference House source.

T5 intentionally does **not** transfer the current applicant scheme's bedroom count, bedspace count, policy GIA, built-in storage, private-outside-space geometry or accessibility assignment onto the unchanged Reference House candidate merely because application `26/02618/FPA` concerns the same address.

That refusal is material: a different proposal on the same land is evidence about the site/context, not a fact store for Ovid's House.

## Exact deterministic identities

```text
manifest fingerprint
  d45dda4d1c7faa46aaf08e773671590cf78a2bc7335079dfebec81091a56145b

source-set fingerprint
  a6af74fed8e78faa84bdcb3dcc28d2f245b74585f2a2024a3cec5ff729ce76d0

deployment-case fingerprint
  791cb427364d32208a00d02d7b42f2b472a64023e0e1b2eed58215e37fee52f3

deployment-result fingerprint
  3f2fdfb9573a31bfdf33fc418169f49d83cad303830e4e9a56370c65e22608f9

T5 result fingerprint
  c858fcac7b7481f43c33e49cf7e092ca749467370d75e7903973c1887401ecdf
```

## Raw runtime result

The current target slices expose 29 obligation records:

```text
PASS                   0
EXTERNALLY_DISCHARGED  0
FAIL                   0
UNSUPPORTED            2
UNRESOLVED            27
NOT_APPLICABLE         0
WARNING                0
SUPERSEDED             0
```

Applicability:

```text
APPLIES       26
UNRESOLVED     3
NOT_APPLICABLE 0
```

There are 45 named unresolved runtime inputs.

This is a useful diagnostic, but **45 is not a screening-blocker count**. DPL-12A is intentionally a low-level obligation ledger. It lists absent inputs even when the higher DPL-09 / DPL-10 / DPL-11 coverage authority may classify an obligation as future-due, owner-judgement, external-evidence or otherwise non-native at SCREENING.

Therefore T5 must not turn the raw input count into a shopping list for consultants or surveys.

## Candidate conformance result

T5 preserves the exact T4 candidate identity and current Reference House source.

Candidate-conformance counts are:

```text
CONFORMS                          5
OPEN                             20
NON_CONFORMING                    0
REQUIRES_REFERENCE_HOUSE_REVISION 0
```

The 20 OPEN findings have an already-established authority ecology.

### Existing project architectural-review authority — 16

DPL-13E defines the complete current `ARCHITECTURAL_REVIEW / NOT_NATIVE / unresolvedBlocksPositiveConformance` universe:

```text
RH-I01
RH-I03
RH-I04
RH-I05
RH-I06
RH-I07
RH-PROT-02
RH-PROT-03
RH-PROT-05
RH-PROT-07
RH-PROT-09
RH-PROT-10
RH-PROT-11
RH-PROT-12
RH-PROT-13
RH-PROT-15
```

These are not missing real-site surveys. They require explicit project architectural judgement bound to the exact Lennard candidate and current DPL-02 authority.

DPL-13E already proves the correct mechanism and authority boundary on RS-02. The existing RS-02 review itself cannot simply be copied because it is byte- and candidate-bound, but the review authority/mechanism is established.

### External / professional / site authority — 4

The remaining OPEN candidate findings are not project-author architectural review:

- `RH-PROT-08` — competent structural/professional evidence;
- `RH-PROT-14` — actual maintenance/site-interface evidence;
- `RH-SI02` — absolute datum / external-level / threshold / grading response;
- `RH-SI05` — approach / access / landscape / external site response.

These remain open.

## Real-claim coverage

```text
real claims                    = 17
mapped real claims             = 17
unique owner coverage families = 18
```

Evidence-state distribution:

```text
KNOWN_AT_SCREENING                         3
VERIFIED_CONTROL_RESULT                    1
PARTIALLY_EVIDENCED_NOT_SURVEYED           2
PARTIALLY_EVIDENCED_NOT_POLICY_MEASURED    1
UNKNOWN_AT_SURVEY_OR_TITLE_PRECISION       1
UNKNOWN_AT_ADMITTED_EVIDENCE               8
EXTERNAL_PLANNING_RECORD_CONTEXT           1
```

Unknown/partial real claims are:

```text
LNR-C05  terrain / candidate datum precision
LNR-C06  physical access precision/status
LNR-C07  legal boundary precision
LNR-C08  highway extent / private rights
LNR-C09  neighbour geometry / amenity
LNR-C10  trees / landscape
LNR-C11  flood / drainage / sewer
LNR-C12  utilities / external plant
LNR-C13  ground / foundations
LNR-C14  heritage
LNR-C15  ecology / biodiversity
LNR-C16  candidate-specific London housing-policy measurements
```

This is the honest real evidence frontier.

## Interpretation

T5 proves three important things.

First, the generic DPL runtime can accept a real instrumented control and verified candidate without making that site part of the empirical corpus.

Second, the compiler preserves uncertainty: the absence of evidence produces unresolved/unsupported results rather than fabricated PASS or FAIL states.

Third, the next task is **not** to acquire all 45 raw missing inputs. Existing programme authority must first determine which of those inputs are actually due at SCREENING and which unresolved candidate clauses can already be resolved by controlled project architectural review.

This follows the earlier DPL-M finding that the programme's dominant frontier is epistemic rather than a generic compiler backlog.

## Proof boundary

```text
whole-site COMPATIBLE             = NOT_ADMITTED
whole-site INCOMPATIBLE           = NOT_ADMITTED
route exhaustion                  = NOT_IMPLEMENTED
candidate search                  = NOT_IMPLEMENTED
Reference House mutation          = PROHIBITED
legal boundary                    = UNRESOLVED
measured topography               = NOT_ACQUIRED
planning likelihood               = NOT_CLAIMED
site-interface discharge          = NOT_INFERRED_FROM_PLACEMENT
DPL-14 corpus                     = UNCHANGED
DPL-16 deployment envelope        = HELD
```

## Exact next gate — DPL-T6

> **Compose Lennard through a bounded real-control SCREENING aggregation seam and apply the existing DPL-13E architectural-review authority to the exact T5 candidate; classify raw runtime gaps by current DPL-02 / DPL-09 / DPL-10 / DPL-11 authority so only genuinely due external/site evidence survives as the next acquisition frontier.**

T6 should:

1. preserve the `LNR-C##` real-claim vocabulary and existing coverage-family mappings;
2. reuse/refactor existing DPL-13 readiness/aggregation machinery only as narrowly needed for a real-control case;
3. author a fresh Lennard-specific architectural review over the exact 16-clause DPL-13E universe rather than reusing the RS-02 ledger;
4. bind that review to the exact candidate, current Reference House source and current DPL-02 authority;
5. preserve `RH-PROT-08`, `RH-PROT-14`, `RH-SI02` and `RH-SI05` as external/site authority;
6. distinguish due-now SCREENING blockers from future-due technical inputs and owner-judgement records;
7. reuse current source/applicability authority where already implemented rather than creating new generic machinery;
8. emit no compatibility, incompatibility or route-exhaustion conclusion.

Only after T6 should the programme commission the next real evidence packet.
