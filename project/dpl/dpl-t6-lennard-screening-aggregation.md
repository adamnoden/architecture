# DPL-T6 — Lennard SCREENING frontier classification

**Packet:** DPL-T6  
**Control:** `DPL-T-CONTROL-004` — 41 Lennard Road, Bromley, BR2 8LN  
**Candidate:** `DPL-T-CANDIDATE-004-01` / rev `0.1`  
**Parent runtime:** DPL-T5 landed/current replay  
**Assurance profile:** `SCREENING`  
**Date:** 2026-10-25

## Question

Given the unchanged, T4-verified Reference House candidate and the T5 real-control runtime, which of the 45 raw unresolved runtime inputs are genuinely current SCREENING blockers once existing DPL-02, DPL-09, DPL-10 and DPL-11 authority is applied and the exact current architectural-review universe is reviewed?

T6 is a classification and review packet. It does not commission surveys, change the Reference House, author a new site response, determine planning acceptability or emit a whole-site compatibility conclusion.

## Parent identity reconciliation

T5 was originally frozen on its pre-merge branch with result fingerprint:

`c858fcac7b7481f43c33e49cf7e092ca749467370d75e7903973c1887401ecdf`

That identity remains historical evidence of the branch state. Replaying the unchanged T5 real-control manifest and candidate through the actual landed/current generic runtime yields the current parent identity:

`bf04feb48795c0f5fddda5d9ddbe944428f06a52fd2afebc857a3b1bde1cf009`

The reconciliation is recorded in `project/dpl/dpl-t5-merge-state-replay.md`. No Lennard evidence, T3 candidate, T4 verification or Reference House source was changed by that replay.

## Architectural review

T6 derives the architectural-review universe from current DPL-02 authority rather than copying a historical list. The universe is exactly sixteen clauses:

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

A fresh Lennard-specific delegated project-author review passes all sixteen against the exact T5 candidate. The review is fingerprint-bound to the candidate, current Reference House source, DPL-02 coverage registry and DPL-02 authority source.

This review is project architectural judgement only. It is not independent professional, statutory or planning evidence.

The two Reference House clauses which remain due now are deliberately outside that authority:

- `RH-PROT-08` — competent structural/professional evidence;
- `RH-PROT-14` — actual maintenance/site-interface evidence.

`RH-SI02` and `RH-SI05` remain external site interfaces, but under their existing `RESOLVE_IF_INVOKED` posture they are `FUTURE_DUE`, not current SCREENING blockers.

## Source-status composition

T6 performs only the narrow source/applicability composition already earned by present evidence.

For planning, the controlled source/status composition passes:

- London Plan 2021 — adopted operative;
- relevant London Plan Guidance — adopted guidance;
- Bromley Local Plan 2019 — operative;
- Bromley Local Plan review — emerging/non-operative at the research date.

This is a source/status PASS only. It is not policy compliance, planning permission or a material-weight conclusion.

For England technical applicability, current sources are identified but project-event applicability remains unresolved because no admitted building-control route/application and qualifying commencement facts have been authored. T6 therefore keeps `ENG-COV-SOURCE-APPLICABILITY` unresolved rather than substituting research-date source status for project-specific applicability.

## Frozen deterministic result

The corrected substantive T6 implementation passed the repository-wide health gate and emitted the following deterministic identities:

```text
T6 result fingerprint
  c59073cc2c6b073c2905a92b42b36b27f287e32e84d86d51f92cdd4d52ba3b45

readiness identity fingerprint
  8329522c604de85912b35aab4a3958f270bd7b246395ed0a534494f3b6d33853

architectural-review ledger fingerprint
  d320507d8bf7d6a6606e502a49515bb1a071c36ed8ed248f0d4fb022d4e1365c
```

Normalized coverage before architectural/source disposition:

```text
normalized coverage entries   = 102
blocking coverage entries     = 46
future-due entries             = 53
acceleration-review entries    = 15
uncovered real claims          = 0
```

The `46` figure is an intermediate readiness count. It is **not** the final post-review blocker count.

After architectural review and narrow source/status composition, the genuine current SCREENING frontier is:

```text
post-review blockers           = 25
SUBSTANTIVE_UNRESOLVED         = 10
DUE_CLASSIFICATION_UNRESOLVED  = 15
```

By owner:

```text
REFERENCE_HOUSE  = 2
ENGLAND          = 1
PLANNING         = 12
NON_PLANNING     = 10
```

That is the reduction T6 was intended to make: **45 raw missing runtime inputs are reduced to 25 current SCREENING blockers under existing authority.**

## Exact blocker frontier

### Reference House — 2

```text
REFERENCE_HOUSE:RH-PROT-08
REFERENCE_HOUSE:RH-PROT-14
```

### England — 1

```text
ENGLAND:ENG-COV-SOURCE-APPLICABILITY
```

### Planning — 12

```text
PLANNING:DPL10-COV-ECOLOGY-BIODIVERSITY-GREEN-INFRASTRUCTURE::ACCELERATION_REVIEW
PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT
PLANNING:DPL10-COV-FLOOD-DRAINAGE-SUDS-PLANNING::ACCELERATION_REVIEW
PLANNING:DPL10-COV-HERITAGE-DESIGNATION-SETTING::ACCELERATION_REVIEW
PLANNING:DPL10-COV-HOUSING-QUALITY-ACCESSIBILITY::ACCELERATION_REVIEW
PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY
PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY
PLANNING:DPL10-COV-NEIGHBOUR-AMENITY-PRIVACY-DAYLIGHT::ACCELERATION_REVIEW
PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY::ACCELERATION_REVIEW
PLANNING:DPL10-COV-TRANSPORT-ACCESS-HIGHWAY-PARKING::ACCELERATION_REVIEW
PLANNING:DPL10-COV-TREES-LANDSCAPE-URBAN-GREENING::ACCELERATION_REVIEW
```

### Non-planning — 10

```text
NON_PLANNING:DPL11-COV-ACCESS-STATUS
NON_PLANNING:DPL11-COV-ACCESS-STATUS::ACCELERATION_REVIEW
NON_PLANNING:DPL11-COV-GROUND-ENVIRONMENT::ACCELERATION_REVIEW
NON_PLANNING:DPL11-COV-LEGAL-BOUNDARY-TITLE::ACCELERATION_REVIEW
NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER
NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER::ACCELERATION_REVIEW
NON_PLANNING:DPL11-COV-PRIVATE-RIGHTS::ACCELERATION_REVIEW
NON_PLANNING:DPL11-COV-SEWER-UNDERTAKER::ACCELERATION_REVIEW
NON_PLANNING:DPL11-COV-SITE-CONTROL
NON_PLANNING:DPL11-COV-UTILITIES::ACCELERATION_REVIEW
```

## The fifteen classification blockers

The fifteen `::ACCELERATION_REVIEW` records are not fifteen survey instructions. They say that unknown or partial real-control claims intersect coverage families whose authority requires an explicit acceleration decision.

They divide into eight planning families and seven non-planning families:

```text
planning
  ecology / biodiversity / green infrastructure
  flood / drainage / SuDS
  heritage / designation / setting
  housing quality / accessibility
  neighbour amenity / privacy / daylight
  strategic design / context / capacity
  transport / access / highway / parking
  trees / landscape / urban greening

non-planning
  access status
  ground environment
  legal boundary / title
  physical flood / water
  private rights
  sewer undertaker
  utilities
```

The correct next move is to classify these before buying evidence. Public or already-admitted evidence may be enough to dismiss, defer or narrow some of them. Only unresolved items that survive that classification should become an external evidence/procurement packet.

## Future-due Reference House interfaces

The deterministic T6 result records the following Reference House entries as future-due rather than current blockers:

```text
RH-IMP01
RH-IMP02
RH-IMP03
RH-IMP04
RH-IMP05
RH-IMP06
RH-IMP07
RH-IMP08
RH-SI01
RH-SI02
RH-SI03
RH-SI04
RH-SI05
RH-SI06
```

This preserves the distinction between a present SCREENING frontier and later implementation/site-interface work.

## Result

`UNRESOLVED_AT_SCREENING_GENUINE_FRONTIER_CLASSIFIED`

T6 earns a materially narrower and better-typed uncertainty frontier. It does **not** earn compatibility.

```text
Reference House mutation          = NO
whole-site COMPATIBLE             = NOT_ADMITTED
whole-site INCOMPATIBLE           = NOT_ADMITTED
route exhaustion                  = NOT_IMPLEMENTED
site evidence commissioned        = NO
DPL-16                            = HELD
```

## Next packet — DPL-T7

DPL-T7 should be **Lennard acceleration classification and public-evidence disposition**.

Its bounded job is to take the exact fifteen `::ACCELERATION_REVIEW` records and, using present coverage authority plus already-admitted or recoverable public evidence, determine for each whether it:

1. can be resolved or dismissed at SCREENING without new commissioned evidence;
2. is genuinely due now and therefore survives into an external-evidence packet;
3. is future-due / downstream and should not block the current gate; or
4. remains unresolved because the required authority cannot be established internally.

T7 may also reconcile directly coupled substantive records when the same public evidence legitimately resolves them. It must not turn the 25-item frontier into a consultant shopping list by default.

T7 must preserve the same proof boundary: no Reference House mutation, no invented facts, no whole-site compatibility conclusion and no route-exhaustion claim.
