# PCO-DISPATCH — dispatcher closeout

**State:** candidate; live main-branch ranking and final lease release pending  
**Date:** 2026-10-29

## Result

The dispatcher implementation adds a self-service scheduling layer over PCO and ACO without becoming a third project-state authority.

- PCO still owns durable structural eligibility and lifecycle.
- ACO still owns volatile execution occupancy.
- `agentDispatch` explicitly decides whether a generic undirected agent may self-serve a live node.
- `control:next` ranks only structurally READY, ACO-available, self-service nodes.
- `control:claim-next` applies that ranking and acquires through the existing ACO compare-and-swap protocol.

## Frozen ranking policy

Candidates are ordered lexicographically by:

1. remaining structural critical depth descending;
2. fractional direct blocker relief descending;
3. unfinished downstream reach descending;
4. current owning-workstream load ascending;
5. canonical node id ascending.

The dispatcher intentionally does not emit a weighted aggregate score. The tuple is inspectable and avoids presenting uncalibrated node-count metrics as false temporal precision.

## Dispatch boundary

Every live non-terminal node must declare one of:

- `self-service` — eligible for generic dispatcher selection when READY and unclaimed;
- `manual` — visible but excluded from automatic dispatch, with a durable reason.

Physical validation, competent external review and final private-object manufacture/release gates are manual in the current graph. Missing live-node policy fails repository validation.

Durably active but unclaimed work is shown as a handoff/resume candidate; it is not silently inherited by the default scheduler.

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

`project/control/dispatch.test.ts` uses synthetic DAG fixtures so advancing the real programme cannot invalidate policy tests. It proves:

- deterministic ranking independent of input order;
- critical-depth precedence;
- blocker-relief precedence;
- downstream-reach precedence;
- owner-load tie-breaking;
- live/grace claim exclusion;
- expired/released claim availability;
- manual READY visibility without auto-selection;
- active/unclaimed handoff treatment;
- known and unknown invalid live-claim fail-closed behaviour;
- workstream filtering without eligibility widening;
- missing/manual-without-reason policy validation;
- full reranking after a lost top-candidate race;
- no-candidate/no-mutation behaviour.

Repository-wide validation also checks that every real live non-terminal PCO node has an explicit valid dispatch policy.

## Agent contract

Root `AGENTS.md` now requires an idle undirected agent to self-serve through the dispatcher rather than choosing an arbitrary READY node. A direct owner assignment overrides dispatcher ranking but does not bypass the ACO lease protocol.

`project/control/README.md` documents the human and machine interfaces:

```text
npm run control:next
npm run control:next -- --format json
npm run control:claim-next -- --holder-kind chatgpt --holder-label session-name
```

## Protected implementation

This implementation is protected by the real ACO lease:

- node: `PCO-DISPATCH`;
- generation: `1`;
- lease id: `47a84b0e-4afa-49dd-98cf-5748a0d2539f`;
- holder: `architecture-dispatcher-build`;
- branch: `work/pco-dispatch`.

## Remaining observations before completion

1. implementation PR passes full repository/publication CI;
2. validated implementation merges while the lease is still owned;
3. main projection reconciliation completes;
4. `control:next` is run from reconciled `main` against the real ACO store and produces a coherent ranking/manual/handoff view;
5. `PCO-DISPATCH` is marked complete with durable evidence;
6. closeout change passes normal CI and merges;
7. ACO lease is released only after durable completion is on `main`;
8. temporary dispatcher branches are cleaned up.

Until those are observed, this record remains a closeout candidate.