# DPL-13B — SCREENING Coverage Universe and Conclusion-Readiness Composer

**Issue:** #473  
**Programme:** #299  
**Authorised by:** DPL-H / #471  
**Baseline `main`:** `e33be0b27493db5bd81305034de0067b5b745ff5`  
**Date:** 2026-10-22  
**Status:** PASS candidate; final only after exact-final-head CI and merge

## Decision

> **PASS — SCREENING PROFILE UNIVERSE IS OWNER-COMPLETE FOR THE CANONICAL SYNTHETIC CASE, BUT PROFILE DISPOSITION REMAINS UNRESOLVED. WHOLE-SITE CONCLUSION AGGREGATION REMAINS UNAUTHORISED.**

DPL-13B implements the thin generic compositor admitted by DPL-H.

It answers:

> **Do we know the declared owner/family/clause universe that must be considered before a SCREENING deployment conclusion could be aggregated, and is that universe disposition-ready?**

It does **not** answer whether the site is compatible, unresolved or incompatible.

## 1. Architecture of the compositor

The implementation is deliberately small:

- `compiler/dpl/coverage-readiness.ts`;
- `compiler/dpl/dpl13b.test.ts`.

No new source JSON schema or fifth substantive coverage registry was created.

DPL-13B consumes the existing validated owner artefacts:

1. DPL-02C — Reference House conformance coverage;
2. DPL-09D — England technical/process coverage;
3. DPL-10E — planning coverage;
4. DPL-11B — non-planning due diligence;
5. DPL-10F — exact strategic/local planning target graph;
6. DPL-13A — canonical DPL-RS-01 site manifest.

The generic layer normalises only what is needed for profile-level coverage/readiness. Owner-specific semantics remain visible beside the normalised posture.

## 2. First adversarial failure — FFL ownership

The first substantive 13B run failed the strongest canonical assertion:

```text
all 29 DPL-RS-01 claims must have controlled ownership
```

The sole uncovered claim was:

```text
RS-FFL-01 — RH ground FFL maps to site Z +0.100 m
```

The failure was **not** repaired by assigning the claim to planning, England technical coverage or non-planning due diligence.

Authority recovery showed that DPL-08B already owns this exact relationship under:

```text
GI-D02 — DATUM
```

DPL-08B explicitly owns selection of the building's absolute site elevation while preserving protected internal relative levels.

DPL-13B therefore adds one direct, explicit site-interface claim-authority bridge:

```text
RS-FFL-01
    → SITE_INTERFACE
    → DPL-08B:GI-D02-DATUM
```

This is **not** a fifth coverage registry.

It records the existing owner of an authored site-interface claim that is not naturally represented by the four SCREENING coverage registries.

The bridge is identity-bearing and carries an explicit claim boundary:

> owns the authored absolute site datum response only; does not prove ground, access, weathering, foundation or whole-site compatibility.

This finding materially improves the model: **coverage-registry ownership and site-interface claim ownership are related but not identical concepts.**

## 3. Canonical site-claim universe

After preserving the DPL-08B datum authority, the canonical DPL-RS-01 universe contains:

- 29 claims;
- zero uncovered claims;
- all original `UNKNOWN` states preserved;
- all synthetic `ASSUMED` / `ASSUMED_DEPLOYMENT_DATUM` bases preserved.

Examples that remain deliberately multi-domain include access, tree, flood, drainage and neighbour conditions.

Multi-owner consumption does not transfer authority.

A claim reference is never treated as discharge evidence.

## 4. Former material owner gaps

DPL-10E remains the planning owner for:

- `RS-NOISE-01` through air-quality/noise/agent-of-change coverage;
- `RS-ECO-01` through ecology/biodiversity/green-infrastructure coverage;
- `RS-HERITAGE-01` through heritage coverage.

DPL-13B proves that those claims are represented in the owner graph while also proving that the mapping itself contains no substantive `PASS` result.

## 5. Planning authority graph

DPL-13B reconstructs the planning authority graph from the controlled runtime inputs rather than trusting target names.

It requires the exact London strategic target:

```text
LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20
```

and proves that both controlled borough targets declare that exact parent.

A stale or contradictory borough parent fails before readiness composition.

The graph fingerprint is part of 13B identity.

## 6. Synthetic local-planning state

The canonical fixture remains:

```text
localPlanningTargetState = NO_REAL_BOROUGH_ASSIGNED
localPlanningTargetIds = []
```

DPL-13B refuses to infer or assign Croydon/Bromley merely because those targets exist in the repository.

The borough targets participate in authority-graph proof, not as the local target of DPL-RS-01.

## 7. Normalised coverage posture

The compositor exposes the DPL-H integration vocabulary:

- `DUE_NOW_REPRESENTED`;
- `DUE_NOW_MISSING`;
- `FUTURE_DUE`;
- `DUE_CLASSIFICATION_UNRESOLVED`;
- `NOT_APPLICABLE_PROVED`;
- `ADVISORY_NON_BLOCKING`;
- `ACCELERATION_REVIEW_REQUIRED`.

This vocabulary is an integration view, not a replacement owner ontology.

The result retains, as applicable:

- DPL-02 conformance class / resolution / execution posture;
- DPL-09 applicability / implementation / target mapping / evidence authority;
- DPL-10 source / applicability / resolution / target identity;
- DPL-11 runtime/evidence authority;
- site claim basis and state.

## 8. Acceleration boundary

Opaque acceleration metadata is never executed as a rule.

Where an owner entry contains acceleration metadata and a referenced canonical claim is still `UNKNOWN` or synthetic-assumed, DPL-13B emits a separate:

```text
ACCELERATION_REVIEW_REQUIRED
```

reference.

That reference records:

```text
triggerKind = OPAQUE_OWNER_METADATA_NOT_EXECUTED
```

It does not create a trigger result, substantive obligation result or deployment conclusion.

## 9. Canonical baseline result

The canonical case proves:

```text
uncoveredClaimIds = []
profileUniverseState = PROFILE_DISPOSITION_UNRESOLVED
conclusionReadiness = NOT_READY_PROFILE_DISPOSITION_UNRESOLVED
```

The important distinction is:

> **The universe is now represented; its profile dispositions are not yet fully resolvable without review of opaque decision-critical acceleration questions.**

That is a stronger and more useful result than either:

- saying coverage is incomplete when it is not; or
- emitting whole-site `UNRESOLVED` merely because unknowns exist.

DPL-13B therefore closes the **ownership/scope completeness** problem for this canonical fixture while exposing the next exact problem: disposition resolution and later substantive aggregation.

## 10. Identity and invalidation

The readiness identity includes:

- all four owner registry identities/fingerprints;
- owner authority-set fingerprints;
- direct DPL-08B site-interface claim authority;
- DPL-10F planning authority graph;
- canonical site-manifest identity;
- claim→owner mapping;
- normalised owner references;
- profile-universe state;
- conclusion-readiness state.

Tests prove that materially changing:

- a claim-owner mapping;
- a planning target parent edge;
- a registry/profile disposition;
- the DPL-08B datum authority bridge;

changes or invalidates the result as appropriate.

Set-like owner-entry ordering remains identity-neutral.

## 11. Proof boundary

DPL-13B retains exactly:

```text
wholeSiteCompatibilityConclusion = NOT_IMPLEMENTED
substantiveConclusionAggregation = NOT_ADMITTED
routeExhaustion = NOT_IMPLEMENTED
architecturalCandidateSelection = NOT_IMPLEMENTED
```

Therefore this packet does not emit:

- `COMPATIBLE @ SCREENING`;
- whole-site `UNRESOLVED @ SCREENING`;
- `INCOMPATIBLE`.

It does not search routes, rank sites, design site interfaces or author architecture.

## 12. Adversarial proofs

The DPL-13B suite proves:

1. deterministic identity;
2. exactly four controlled coverage registries;
3. direct DPL-08B ownership of `RS-FFL-01`;
4. exact repaired London→Croydon/Bromley authority graph;
5. all 29 canonical site claims accounted for;
6. noise/ecology planning ownership without discharge;
7. synthetic no-borough restraint;
8. removed consequential owner mapping → `PROFILE_UNIVERSE_INCOMPLETE`;
9. stale borough parent → fail closed;
10. registry ordering invariance;
11. owner semantics survive normalisation;
12. `UNKNOWN` / assumed provenance survives composition;
13. due-classification uncertainty remains a profile-disposition state, not substantive `UNRESOLVED`;
14. opaque acceleration metadata is not executed;
15. material coverage semantics invalidate identity;
16. direct site-interface authority is identity-bearing;
17. whole-site conclusion authority remains absent.

## 13. Maturity consequence

No maturity promotion is claimed by this packet alone.

DPL remains M4 at the existing bounded internal-control scope until the post-13B adversarial gate decides whether the controlled proposition may be broadened to include conclusion-readiness.

## 14. Exact next gate

After DPL-13B lands, open:

> **DPL-I — post-DPL-13B conclusion-readiness / first whole-site UNRESOLVED admission gate**

DPL-I must attack:

- whether `PROFILE_DISPOSITION_UNRESOLVED` is itself the final blocker to substantive aggregation;
- whether acceleration-review references need owner-side typed resolution before any aggregation;
- how actual DPL-13A obligation/conformance findings map to the complete 13B profile universe;
- whether an official whole-site `UNRESOLVED @ SCREENING` can finally be derived without masking missing scope;
- whether conclusion-readiness has earned a broader M4 scope.

`COMPATIBLE` remains separately downstream even if `UNRESOLVED` is admitted.

`INCOMPATIBLE` remains held behind route exhaustion or a separately controlled invariant-blocker proof.

## Held work

Continue to hold:

- whole-site `COMPATIBLE / UNRESOLVED / INCOMPATIBLE` runtime output;
- route search/exhaustion;
- DPL-15 real-site deployment trials;
- deployment-envelope derivation;
- publication integration;
- bulk corpus expansion by convenience;
- generic all-borough ontology;
- unrelated Reference House or DRW change.

## Closeout

DPL-13B turns coverage from a prose warning into an executable proposition.

Its result is intentionally uncomfortable but precise:

> **We now know the complete declared SCREENING universe for the canonical synthetic case. We do not yet know enough to aggregate that universe into an authorised whole-site deployment result.**
