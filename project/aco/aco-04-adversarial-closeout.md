# ACO-04 — Self-hosted adversarial closeout

**State:** candidate; lease-held closeout in progress  
**Date:** 2026-10-28  
**Parent:** ACO #960

## Purpose

Prove ACO against its own final packet using the same runtime lease protocol future agents must follow.

ACO-04 is not complete merely because the lease implementation has unit tests. Closeout requires a real claim on the retained runtime store, renewal during execution, ownership verification before merge, a validated merge, and release only after durable closeout reaches `main`.

## Validated implementation baseline

ACO-00 through ACO-03 were merged through PR #962 as `b812b0364b3bb9fe0e8d7e111f71a1ab2936d06f` after the complete repository/publication validation gate passed on head `4a2a4f6bd376c1ca250ccbe6967617ee68d6c677`.

The post-merge project-control projection workflow `40783936203` completed successfully. The resulting generated `STATUS.md` identified `ACO-04` as structurally ready while continuing to state explicitly that structural readiness is not live occupancy authority.

## Real self-hosted lease

The retained runtime branch is `runtime/claims`. It was initialised with only the non-lease sentinel `.pco/claims/.store`; it is deliberately not a source branch and must never be merged into `main`.

Before creating the closeout branch, the runtime store was checked for `.pco/claims/ACO-04.json` and no record existed.

ACO-04 then acquired the real generation-1 lease:

- canonical node: `ACO-04`;
- lease id: `bb5dda08-87a8-4119-a91a-255b80fe42de`;
- holder: `chatgpt / architecture-control`;
- claimed at: `2026-10-28T22:59:13Z`;
- initial expiry: `2026-10-29T00:59:13Z`;
- runtime commit: `0378cff4f022c60a21b15762af0d2058fbe6a81e`.

Only after acquisition was `work/aco-closeout` created from then-current `main` (`5995d0149780008f8331654719a8df25ee2dc45e`).

The same lease was then renewed using the exact prior blob SHA, without changing generation or lease id:

- heartbeat: `2026-10-28T23:00:51Z`;
- renewed expiry: `2026-10-29T01:00:51Z`;
- branch metadata: `work/aco-closeout`;
- runtime commit: `fd75e71ff9d383384e35742873851b57ee5377b2`.

This proves the intended distinction between lease identity and evolving discovery metadata: renewal updates heartbeat/expiry/branch while ownership remains generation 1 of the same lease.

## Adversarial proof matrix

| Failure mode | Expected behaviour | Evidence |
|---|---|---|
| two claimants target one canonical node | one winner; second normal acquisition rejected | deterministic `claim-store.test.ts` + per-node SHA CAS protocol |
| two aliases name the same shared packet | aliases converge onto one canonical lease path | `claims.test.ts` canonical alias-path proof |
| unrelated writes move `runtime/claims` branch head | retry only when the target node file SHA is unchanged | deterministic branch-head contention test |
| same-node record changes during mutation | fail rather than overwrite winner | deterministic acquisition/renewal/takeover race tests |
| lease reaches expiry boundary | two-minute grace prevents immediate overlap | lease temporal-state tests |
| old generation attempts renew/release after takeover | reject stale ownership | supersession tests |
| node becomes done/blocked/held while claimed | surface invalid occupancy; renewal refused | operational-state + invalid-renewal tests |
| node disappears from PCO while lease exists | canonical orphan remains releasable | orphan-release test |
| malformed claim JSON | fail closed | parser tests + GitHub store wrapper |
| runtime branch unavailable | fail closed for new collision-prone work | `ClaimStoreUnavailableError` path and repository doctrine |
| force takeover used casually | forbidden by agent constitution; explicit reason required and previous owner audited | ACO programme / `AGENTS.md` / force-takeover semantics |
| lease expiry during PR CI | does not make code-quality CI time-dependent | volatile lease validity deliberately excluded from PR validation |
| runtime claims copied to a source branch | repository validation rejects `.pco/claims` | `validateControlPlane()` guard |

## Authority boundary proved

ACO never replaces PCO state.

- PCO determines whether a node is structurally `ready`, `active`, `blocked`, `held`, `done` or `cancelled`.
- ACO determines whether a claimable node currently has a live lease.
- `STATUS.md` remains a durable structural projection and does not churn on heartbeats.
- `control:verify` answers lease ownership/temporal validity only; structural correctness remains independently proven by PCO and merge validation.

The real ACO-04 lease therefore protects the closeout execution without becoming a durable lifecycle fact itself.

## Runtime metadata boundary

`runtime/claims` is coordination metadata visible to repository collaborators and, for a public repository, potentially public. Holder labels, branch names and notes must therefore be operational and non-sensitive. Do not place secrets, private personal data, credentials, hidden reasoning or confidential project information in claim records.

`leaseId` is an ownership/collision token, not a secret authentication credential.

## Remaining closeout sequence

Before ACO-04 and parent ACO may close:

1. mark ACO-04 complete in the durable PCO graph with this file as closeout evidence;
2. close the canonical ACO programme state;
3. open and fully validate the closeout PR;
4. re-read the runtime claim and prove generation 1 / lease id ownership remains live immediately before merge;
5. merge only the validated head against the live base relationship;
6. observe successful main projection reconciliation and confirm ACO-04 leaves the structural ready frontier;
7. release the same generation-1 lease on `runtime/claims` with reason `completed` only after the durable closeout is on `main`;
8. clean temporary ACO source branches while deliberately retaining `runtime/claims` as infrastructure;
9. close #960 with the merge, lease and cleanup evidence.

Until that sequence completes, this record remains candidate evidence rather than the final claim that ACO is closed.