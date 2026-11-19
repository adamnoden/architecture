# PCO-DISPATCH — dispatcher closeout

**State:** complete; operational evidence reconciled 2026-10-31

**Date:** 2026-10-29

This record retains the original dispatcher implementation and proof. Its READY-only scope was later extended by [guarded crash recovery](mvb-crash-recovery-result.md); use the [current MVB manual](../control/README.md#self-service-dispatcher) for present eligibility.

## Result

The dispatcher adds a self-service scheduling layer over PCO and ACO without becoming a third project-state authority.

- PCO owns durable structural eligibility and lifecycle.
- ACO owns volatile execution occupancy.
- `agentDispatch` decides whether a generic undirected agent may self-serve a live node.
- `control:next` ranks structurally READY, ACO-available, self-service nodes.
- `control:claim-next` applies that ranking and acquires through the existing ACO compare-and-swap protocol.

## Frozen ranking policy

Candidates are ordered lexicographically by:

1. remaining structural critical depth descending;
2. fractional direct blocker relief descending;
3. unfinished downstream reach descending;
4. current owning-workstream load ascending;
5. canonical node id ascending.

No weighted aggregate score is emitted. The tuple remains inspectable and does not present uncalibrated node-count metrics as false temporal precision.

## Dispatch boundary

Every live non-terminal node declares either:

- `self-service` — eligible for generic dispatcher selection when READY and unclaimed;
- `manual` — visible but excluded from automatic dispatch, with a durable reason.

Physical validation, competent external review and final private-object manufacture/release gates are manual in the current graph. Missing live-node policy fails repository validation. Durably active but unclaimed work is shown as a handoff/resume candidate rather than silently inherited.

## Race / safety model

Automatic dispatch:

- fails closed if ACO cannot be read/parsed;
- fails closed if any invalid live claim exists;
- requires the local structural graph, dispatcher policy and ACO protocol to match current `main`;
- never uses force takeover;
- fully reloads and reranks the frontier after losing a candidate acquisition race;
- bounds repeated selection races rather than looping forever;
- performs no mutation when no self-service candidate exists.

The existing ACO store continues to distinguish a genuine same-node claimant race from unrelated `runtime/claims` branch-head contention.

## Automated proof

`project/control/dispatch.test.ts` uses synthetic DAG fixtures so advancing the real programme cannot invalidate policy tests. It proves deterministic ranking, each ranking key, lease exclusion/expiry behaviour, manual-node exclusion, active-unclaimed handoff treatment, invalid-claim fail-closed behaviour, workstream filtering, dispatch-policy validation, full reranking after a lost acquisition race and no-candidate/no-mutation behaviour.

Repository-wide validation also checks that every real live non-terminal PCO node has an explicit valid dispatch policy.

## Agent contract

Root `AGENTS.md` requires an idle undirected agent to self-serve through the dispatcher rather than choosing an arbitrary READY node. A direct owner assignment overrides dispatcher ranking but does not bypass the ACO lease protocol.

`project/control/README.md` documents the human and machine interfaces:

```text
npm run control:next
npm run control:next -- --format json
npm run control:claim-next -- --holder-kind chatgpt --holder-label session-name
```

## Protected implementation

The implementation was protected through its merge by the real ACO lease:

- node: `PCO-DISPATCH`;
- generation: `1`;
- lease id: `47a84b0e-4afa-49dd-98cf-5748a0d2539f`;
- holder: `architecture-dispatcher-build`;
- branch: `work/pco-dispatch`;
- lease remained live through the validated implementation and closeout merges; its subsequent release is recorded below.

## Implementation merge proof

Implementation PR #974 passed the full repository/publication validation pipeline on validated head `1fe049f1a55f70ec5fb7885105ac1af9f144d95d` (workflow run `40848973679`). It was squash-merged while the ACO lease was still live as `c8bebd0c7984a81d8ebbdf97ce0eb9e15b5bf525`.

The main-branch project-control projection reconciler then completed successfully and advanced `main` to `28d76be03aba42032d763df50a0b638e34a73a83` before later concurrent programme movement.

## Live dispatcher proof

A disposable read-only Actions probe executed the **merged** dispatcher from an exact reconciled-main source tree against the real `runtime/claims` ACO store. Probe PR #976 was explicitly not merged to `main`; workflow run `40849561180`, job `123365338368`, passed the dispatcher step and the complete repository/publication validation tail.

At GitHub-observed time `2026-10-29T09:24:35Z`, `control:next -- --format json --limit 20` reported:

- `safeForAutomaticClaim: true`;
- no unsafe reasons;
- no invalid live claims;
- no dispatch-policy errors;
- four available self-service candidates;
- physical/professional evidence gates remained manual;
- durably active/unclaimed work remained visible as handoff candidates rather than being silently inherited.

The live ranking was:

| Rank | Node | Critical depth | Blocker relief | Downstream reach | Owner load |
|---:|---|---:|---:|---:|---:|
| 1 | `IAS-01H` | 13 | 1.2 | 17 | 0 |
| 2 | `OAS-01E` | 12 | 1.0333333333333332 | 16 | 0 |
| 3 | `OAS-01I` | 12 | 1.0333333333333332 | 16 | 0 |
| 4 | `BCR-SCAFFOLD` | 9 | 0.3333333333333333 | 8 | 0 |

`IAS-01V`, which would otherwise be high-value, was correctly excluded because ACO showed it already claimed by `architecture-ias01v` on branch `ias/01v-vertical-candidates`.

The READY evidence routes remained visible but manual:

- `PHY-03-ENGINEERING` — competent structural-engineering judgement;
- `PHY-04` — physical build/test;
- `EPR-RH11` — competent independent professional review.

The live dispatcher also surfaced the existing active/unclaimed handoff candidates `MRA-00`, `PLT-CURRENT-REVIEW` and `PUB-02-PREP`.

This demonstrates that the dispatcher is not merely a static ranking function: it combined the merged PCO graph with real ACO occupancy and respected both self-service and manual authority boundaries.

## Disposable probe hygiene

Probe PR #976 was closed unmerged after its evidence was captured. Its temporary source branch was disposed through `delete-me` by [PR #977](https://github.com/adamnoden/architecture/pull/977). The superseded pre-reconciliation closeout branch was disposed by [PR #982](https://github.com/adamnoden/architecture/pull/982). Neither disposal merged probe or superseded source into `main`; the source refs were confirmed absent during the 2026-10-31 reconciliation.

## Completion state

`PCO-DISPATCH` is durably marked `complete` with its implementation/design/test/operating-contract evidence registered in the PCO node.

[Closeout PR #979](https://github.com/adamnoden/architecture/pull/979) merged as `e7ca470eb10f2496f973423177572b16991e8470`. Main projection commit `f01030195e4526668fc074cbaca2ba3a168db674` then recorded `PCO-DISPATCH` as complete.

Generation `1`, lease id `47a84b0e-4afa-49dd-98cf-5748a0d2539f`, was released at `2026-10-29T09:36:52Z` with reason `completed`, recorded in [runtime commit f99801ee](https://github.com/adamnoden/architecture/commit/f99801eee0703ebf9da40c2854d44f1e19d8028d). The release followed durable completion; it was not still pending.

The final hygiene reconciliation had been preserved in unmerged commit `5069421b59c151ba9178f95c16c933c29aa45945`. Its release and disposal evidence was independently rechecked and reconciled here on 2026-10-31. This corrects the operational record without changing packet lifecycle or claiming a new implementation result. `runtime/claims` remains retained coordination infrastructure.
