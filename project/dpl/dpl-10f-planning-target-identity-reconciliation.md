# DPL-10F — Planning Strategic / Local Target Identity Reconciliation

**Issue:** #469  
**Programme:** #299  
**Authorised by:** DPL-G / #458  
**Baseline `main`:** `aab6ceff37eb85788eda0c22eda9f68bbb863ea5`  
**Date:** 2026-10-22  
**Status:** PASS candidate; merge only after exact-final-head validation

## Question

> Can the controlled Croydon and Bromley local-planning targets prove that they are children of the exact London strategic target actually composed by the runtime, rather than merely carrying deterministic but disconnected ids?

## Decision

> **PASS — THE PLANNING TARGET IDENTITY GRAPH IS RECONCILED AND FAILS CLOSED ON A BROKEN BOROUGH → STRATEGIC EDGE.**

No planning-policy or source-status semantics changed.

## Defect recovered

DPL-G found that the controlled London strategic target is:

```text
LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20
```

while both borough artefacts declared:

```text
LON-PLAN-2021-RESIDENTIAL-DESIGN-2026-10-20
```

in both `parentStrategicTargetId` and their nested composition identity.

`compiler/dpl/wavec.ts` previously checked only that the parent field was a non-empty string. The target nodes could therefore all be deterministic while their declared authority edge was false.

## Repair

### Controlled target artefacts

Croydon and Bromley now both declare the exact controlled London strategic target id in:

- `parentStrategicTargetId`;
- `composition.strategicTargetId`.

Only those two identity fields changed in each target artefact.

### Shared edge proof

`compiler/dpl/planning-target-identity.ts` now owns the bounded identity-edge proof.

It:

1. derives the London strategic id from the strategic target actually loaded in the current target composition;
2. requires exactly one `LONDON_STRATEGIC_PLANNING` target;
3. requires each borough target's `parentStrategicTargetId` to equal that exact id;
4. requires the borough target's nested `composition.strategicTargetId` to equal the same id;
5. rejects missing, stale or contradictory edges without aliasing or normalisation.

### Wave-C composition

`compiler/dpl/wavec.ts` now validates the local→strategic edge before a borough target can enter the Wave-C deployment target composition.

The runtime does not hard-code an alternate London alias. The expected id is derived from `loadB2TargetComposition()`.

A wrong parent therefore fails before `compileDeploymentCase()`.

## Regression proof

`compiler/dpl/dpl10f.test.ts` proves:

- the exact controlled strategic id is derived from current composition;
- Croydon declares that exact parent;
- Bromley declares that exact parent;
- the DPL-10E controlled target node set and both parent edges reconcile as one graph;
- a stale borough parent fails before Wave-C composition;
- a contradictory nested composition id fails closed;
- changing the parent id changes the semantic target fingerprint;
- the repair creates no planning-permission or whole-site deployment result.

This also closes the DPL-10E regression gap identified by DPL-G: controlled planning target nodes are no longer tested without their local→strategic authority edges.

## Validation

Implementation head:

`23216a755b53c00a0077a4e38900a260ecf1b7ff`

PR validation run:

`39797347397`

Result: **SUCCESS**.

The successful chain included:

- TypeScript typecheck;
- repository invariants;
- complete `test:dpl` suite including DPL-10F;
- public nomenclature source validation;
- full publication PDF build;
- PDF metadata checks;
- plate-rhythm validation;
- rendered nomenclature checks;
- rendered nomenclature regressions;
- reader-facing nomenclature inventory.

A documentation-only closeout commit follows this proof. The final branch head must be revalidated before merge.

## Claim boundary

DPL-10F proves **target identity graph coherence only**.

It does not prove:

- planning-policy compliance;
- planning permission likelihood;
- current local-policy applicability beyond existing target authority;
- generic London-borough abstraction;
- whole-site deployment compatibility;
- route exhaustion.

## Consequence

The exact blocker identified by DPL-G is removed.

After DPL-10F merges, run:

> **DPL-H — post-planning-identity repair / DPL-13B admission gate.**

DPL-H must re-attack the complete four-owner SCREENING coverage foundation and decide whether the first generic coverage/readiness composer is now admitted.

DPL-13B remains held until DPL-H.

Whole-site `COMPATIBLE / UNRESOLVED / INCOMPATIBLE` remains held.

## Maturity

No maturity change.

DPL remains M4 at bounded canonical synthetic integration / no-conclusion scope.
