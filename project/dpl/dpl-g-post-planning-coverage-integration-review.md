# DPL-G — Post-Planning-Coverage Integration and DPL-13B Admission Review

**Issue:** #458  
**Programme:** #299  
**Review date:** 2026-10-22  
**Baseline `main`:** `caab0f812b838bd785b622d03a6f1f92e8e493aa`  
**Depends on:** DPL-02C, DPL-09D, DPL-10E, DPL-11B, DPL-13A  
**Status:** integration/admission gate; no whole-site conclusion

## Decision

> **PASS WITH HOLD — THE FOUR OWNER-SIDE COVERAGE FOUNDATIONS ARE COHERENT, BUT DPL-13B IS NOT YET ADMITTED. AUTHORISE DPL-10F PLANNING TARGET IDENTITY RECONCILIATION ONLY.**

DPL-10E closes the previously exposed planning-family coverage gap. The canonical site claims `RS-NOISE-01` and `RS-ECO-01` now have explicit planning coverage ownership, and the four owner domains are conceptually sufficient for a generic SCREENING coverage/readiness composer.

However, DPL-G exposes a narrower but material identity defect in the controlled planning target composition:

```text
actual London strategic target id:
LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20

Croydon parentStrategicTargetId:
LON-PLAN-2021-RESIDENTIAL-DESIGN-2026-10-20

Bromley parentStrategicTargetId:
LON-PLAN-2021-RESIDENTIAL-DESIGN-2026-10-20
```

The borough targets therefore claim a parent that is not the strategic target actually composed by DPL-12C and fingerprinted by DPL-10E.

This is not an acceptable alias to invent in DPL-13B.

## Why the defect matters

`compiler/dpl/wavec.ts` validates `parentStrategicTargetId` only as a non-empty string. It does not prove that the declared parent exists or matches the London strategic target loaded by `loadB2TargetComposition()`.

DPL-10E independently proves the current controlled planning target id set, but its tests likewise do not prove the borough → strategic parent edge.

The result is a dormant broken authority relationship:

- the strategic target exists under one controlled id;
- Croydon and Bromley exist under their controlled ids;
- the borough files assert a parent id that does not identify the actual strategic target;
- runtime composition still succeeds because the relationship is not checked.

A future coverage composer would therefore inherit a planning identity graph that is internally inconsistent even though all component fingerprints are deterministic.

That violates the purpose of DPL-05 typed target composition and the identity discipline established by DPL-12/13.

## Four-owner coverage review

### DPL-02C — Reference House

PASS.

The complete conformance clause/route universe is machine-readable and remains separate from actual conformance result.

### DPL-09D — England technical/process

PASS.

Family coverage remains distinct from substantive technical discharge and source/applicability identity remains explicit.

### DPL-10E — planning

PASS at family-coverage scope, with one identity-edge repair required before generic composition.

DPL-10E correctly:

- covers the controlled planning family universe;
- maps the bounded London strategic target as partial coverage;
- maps Croydon/Bromley only as bounded local exemplars;
- preserves the canonical synthetic fixture's `NO_REAL_BOROUGH_ASSIGNED` state;
- owns `RS-NOISE-01` / `RS-ECO-01` without laundering UNKNOWN into planning discharge;
- quarantines qualitative judgement and statutory determination;
- carries no planning-permission or whole-site result.

The registry itself correctly identifies the actual three target ids. The defect is the stale parent identity inside the two borough target artefacts and the absence of an edge check.

### DPL-11B — non-planning due diligence

PASS.

Legal/professional/provider authority remains external and site-claim mappings do not manufacture discharge.

## Site-claim ownership

DPL-10E closes the material owner gaps identified by DPL-F.

The canonical 29-claim DPL-RS-01 set is now sufficiently assigned across the existing owner domains for later SCREENING coverage composition work.

No new owner registry is required before DPL-13B.

## Common SCREENING semantics

The DPL-F common coverage semantics remain sound:

- `DUE_NOW_REPRESENTED`;
- `DUE_NOW_MISSING`;
- `FUTURE_DUE`;
- `DUE_CLASSIFICATION_UNRESOLVED`;
- `NOT_APPLICABLE_PROVED`;
- `ADVISORY_NON_BLOCKING`;
- later `ACCELERATION_REVIEW_REQUIRED` where an opaque/non-native acceleration trigger may be engaged.

Owner-specific semantics must survive generic composition.

## Acceleration

No change.

DPL-13B must not parse prose acceleration trigger descriptions into executable rules. Only typed/native trigger contracts may execute; opaque trigger metadata must remain review-required when material.

## Coverage completeness

The four owner domains are now conceptually sufficient to support the future states:

- `PROFILE_UNIVERSE_COMPLETE`;
- `PROFILE_UNIVERSE_INCOMPLETE`;
- `PROFILE_DISPOSITION_UNRESOLVED`.

But DPL-G does not authorise the composer while the planning authority graph contains a broken controlled parent edge.

Identity coherence is part of coverage coherence.

## DPL-10F — exact repair

Authorise one bounded owner repair:

> **DPL-10F — planning strategic/local target identity reconciliation**

DPL-10F must:

1. treat `project/dpl/targets/london-strategic-residential-design-v1.json` as the controlled strategic target identity source;
2. reconcile Croydon and Bromley `parentStrategicTargetId` values to the exact current London strategic target id;
3. add a fail-closed validator/proof that every borough target admitted into Wave-C composition declares the exact strategic parent actually composed with it;
4. add a DPL-10E regression proving represented borough target identities and their declared parent all reconcile to the controlled strategic target;
5. make target-identity changes fingerprint/invalidate normally;
6. preserve all existing policy/evidence semantics unchanged;
7. avoid aliases, fuzzy id matching or generic name normalisation.

DPL-10F must not:

- change planning policy content;
- change source status;
- add planning families;
- create generic all-borough abstraction;
- assign a borough to DPL-RS-01;
- emit planning prediction;
- emit whole-site compatibility;
- alter Reference House geometry or DRW.

## DPL-13B admission

**HELD.**

After DPL-10F lands, run **DPL-H — post-planning-identity repair / DPL-13B admission gate**.

If the identity graph is coherent at DPL-H, the expected smallest 13B scope remains:

- compose owner-registry identities;
- prove site-claim ownership coverage;
- derive profile-universe completeness/disposition state;
- expose due-now/future/missing/review-required references;
- fingerprint the readiness proposition;
- retain `wholeSiteCompatibilityConclusion = NOT_IMPLEMENTED`.

DPL-H, not this review, decides final admission.

## Whole-site conclusion boundary

No change.

`COMPATIBLE`, `UNRESOLVED @ SCREENING` and `INCOMPATIBLE` remain unauthorised runtime whole-site conclusions.

Route exhaustion remains downstream.

## Second fixture / real-site timing

Still held.

The synthetic fixture continues to expose programme-level semantic defects without entangling them with real-site evidence acquisition. Complete identity/readiness machinery first.

## Maturity

DPL remains **M4** at the existing bounded canonical synthetic integration / no-conclusion scope.

The identity defect does not invalidate that controlled proposition because the M4 scope does not claim generic local-planning parent-edge correctness or conclusion readiness. It does prevent broadening the proposition to DPL-13B coverage/readiness composition.

## Exact next sequence

```text
DPL-02C ─┐
DPL-09D ─┼── coverage foundations landed
DPL-10E ─┤
DPL-11B ─┘
    |
    v
DPL-G
    |
    v
DPL-10F — planning target identity reconciliation
    |
    v
DPL-H — DPL-13B admission gate
```

## Closeout

DPL-G succeeds by refusing to let deterministic component identities disguise an invalid relationship between them.

> **An authority graph is not coherent merely because every node has a fingerprint. Its controlled edges must identify real controlled nodes too.**
