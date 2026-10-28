# ACO-04 — Self-hosted adversarial closeout

**State:** complete  
**Date:** 2026-10-28  
**Parent:** ACO #960

## Purpose

Prove ACO against its own final packet using the same runtime lease protocol future agents must follow.

ACO-04 required more than unit-test success: a real lease on the retained runtime store, renewal during execution, ownership verification immediately before merge, a fully validated merge, durable `main` reconciliation, and release only after that durable completion existed.

## Validated implementation baseline

ACO-00 through ACO-03 were merged through PR #962 as `b812b0364b3bb9fe0e8d7e111f71a1ab2936d06f` after the complete repository/publication validation gate passed on head `4a2a4f6bd376c1ca250ccbe6967617ee68d6c677`.

Post-merge project-control projection workflow `40783936203` completed successfully. The resulting generated `STATUS.md` identified `ACO-04` as structurally ready while explicitly stating that structural readiness is not live occupancy authority.

## Real self-hosted lease

The retained runtime branch is `runtime/claims`. It is coordination infrastructure, not a source branch, and must never be merged into `main`.

Before the closeout branch existed, `.pco/claims/ACO-04.json` was confirmed absent. ACO-04 then acquired the real generation-1 lease:

- canonical node: `ACO-04`;
- lease id: `bb5dda08-87a8-4119-a91a-255b80fe42de`;
- holder: `chatgpt / architecture-control`;
- claimed at: `2026-10-28T22:59:13Z`;
- initial expiry: `2026-10-29T00:59:13Z`;
- runtime acquisition commit: `0378cff4f022c60a21b15762af0d2058fbe6a81e`.

Only after acquisition was `work/aco-closeout` created from then-current `main` (`5995d0149780008f8331654719a8df25ee2dc45e`).

The same lease was renewed using the exact prior blob SHA, without changing generation or lease id:

- heartbeat: `2026-10-28T23:00:51Z`;
- renewed expiry: `2026-10-29T01:00:51Z`;
- branch metadata: `work/aco-closeout`;
- runtime renewal commit: `fd75e71ff9d383384e35742873851b57ee5377b2`.

This proves the intended distinction between lease identity and evolving discovery metadata: renewal changed heartbeat/expiry/branch while ownership remained generation 1 of the same lease.

## Closeout merge under lease

PR #964 carried the ACO-04 closeout while the generation-1 lease remained live.

An initial PR run exposed a regression-test smell: protocol tests used the real `ACO-04` node as a mutable “ready” fixture, so correctly completing ACO-04 broke the tests. The tests were hardened to use synthetic DAG fixtures for protocol semantics while integration checks continue to exercise the real project graph. This prevents future workstream progress from invalidating the lease protocol's own test fixtures.

The repaired merge-ref validation run `40784687314` then passed the complete repository gate, including:

- generated projection validation;
- repository health and type checking;
- PCO validation and project-control/ACO invariant tests;
- public nomenclature source checks;
- publication PDF build, metadata and plate-rhythm checks;
- rendered nomenclature and regression checks.

Immediately before merge, the live runtime record was re-read and still showed:

- state `claimed`;
- generation `1`;
- lease id `bb5dda08-87a8-4119-a91a-255b80fe42de`;
- holder `architecture-control`;
- expiry `2026-10-29T01:00:51Z`.

At `2026-10-28T23:08:00Z` the lease was therefore still safely live. `main` remained the exact validated base `b0bbf6cd97604375608c1c872a525fd45a3ae61a` and PR #964 remained mergeable. The validated head was squash-merged as `c5523f59c44f4587060e13499de7681fc8e601fa`.

Main projection reconciliation workflow `40785195579` then completed successfully and committed generated state as `6f3dc51cc1b950e2b483f4247b3b641306d5aeb7`. The resulting `STATUS.md` no longer listed ACO-04 as structurally ready and reported ACO's completed node in the done count.

## Final release

Only after the durable closeout and projection were established on `main` was the live lease released.

Using the exact current runtime blob SHA, the same generation-1 record was updated to:

- state: `released`;
- heartbeat / release time: `2026-10-28T23:09:15Z`;
- expiry: `2026-10-28T23:09:15Z`;
- release reason: `completed`;
- runtime release commit: `9b2879066a17e26b7b0fa979ba61706b42145bea`.

No second generation was created. The complete self-hosting sequence was therefore:

`claim -> branch -> renew -> validate merge-ref -> verify live ownership -> merge -> reconcile durable projection -> release`

This is the operational sequence future agents should follow for substantial collision-prone work.

## Adversarial proof matrix

| Failure mode | Expected behaviour | Evidence |
|---|---|---|
| two claimants target one canonical node | one winner; second normal acquisition rejected | deterministic `claim-store.test.ts` + per-node SHA CAS protocol |
| two aliases name the same shared packet | aliases converge onto one canonical lease path | `claims.test.ts` canonical alias-path proof |
| unrelated writes move `runtime/claims` branch head | retry only when target node file SHA is unchanged | deterministic branch-head contention test |
| same-node record changes during mutation | fail rather than overwrite winner | acquisition/renewal/takeover race tests |
| lease reaches expiry boundary | two-minute grace prevents immediate overlap | lease temporal-state tests |
| old generation attempts renew/release after takeover | reject stale ownership | supersession tests |
| node becomes done/blocked/held while claimed | surface invalid occupancy; renewal refused | operational-state + invalid-renewal tests |
| node disappears from PCO while lease exists | canonical orphan remains releasable | orphan-release test |
| malformed claim JSON | fail closed | parser tests + GitHub store wrapper |
| runtime branch unavailable | fail closed for new collision-prone work | `ClaimStoreUnavailableError` path and repository doctrine |
| force takeover used casually | forbidden for normal agents; explicit reason and superseded owner recorded | ACO programme / `AGENTS.md` / takeover semantics |
| lease expiry during PR CI | does not make code-quality CI time-dependent | lease validity deliberately excluded from PR validation |
| runtime claims copied to source branch | repository validation rejects `.pco/claims` | `validateControlPlane()` guard |
| mutable real frontier used as protocol fixture | protocol tests remain stable as project progresses | synthetic DAG fixtures introduced during #964 closeout |

## Authority boundary proved

ACO never replaces PCO state.

- PCO determines whether a node is structurally `ready`, `active`, `blocked`, `held`, `done` or `cancelled`.
- ACO determines whether a claimable node currently has a live lease.
- `STATUS.md` remains a durable structural projection and does not churn on heartbeats.
- `control:verify` answers lease ownership/temporal validity only; structural correctness remains independently proven by PCO and merge validation.

The ACO-04 lease protected execution without becoming a durable lifecycle fact itself.

A brief transition after the closeout merge necessarily had durable ACO-04 `done` while its lease was still live. ACO correctly treats such a combination as invalid live occupancy until release rather than hiding the structural truth. The immediate post-projection release resolved that transitional condition.

## Runtime metadata boundary

`runtime/claims` is coordination metadata visible to repository collaborators and, for a public repository, potentially public. Holder labels, branch names and notes must therefore be operational and non-sensitive. Do not place secrets, private personal data, credentials, hidden reasoning or confidential project information in claim records.

`leaseId` is an ownership/collision token, not a secret authentication credential.

## Result

ACO-00 through ACO-04 are complete. ACO has proved its own runtime mechanism against its own final work packet, including real acquisition, renewal, verified ownership, a validated merge and post-merge release.

The deliberately retained `runtime/claims` branch is infrastructure, not cleanup residue. Ordinary temporary ACO source branches should be removed or automatically deleted as normal repository hygiene.

ACO closeout proves orchestration coherence only. It does not prove architectural quality, project completion, maturity or external evidence.