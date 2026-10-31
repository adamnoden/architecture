# PCO-DISPATCH — self-service agent dispatcher

**State:** design frozen for implementation  
**Date:** 2026-10-29  
**Owning packet:** `PCO-DISPATCH`

**Historical design boundary:** this record preserves the original READY-only dispatcher. [MVB crash recovery](mvb-crash-recovery-result.md) later admitted guarded recovery of started self-service packets with predecessor branch/checkpoint evidence. Use the [current MVB manual](../control/README.md#self-service-dispatcher) for present eligibility and acquisition rules; the original exclusions below are not the current recovery policy.

## Purpose

The dispatcher lets an idle general-purpose agent discover and claim the best currently executable packet without reconstructing programme state from chat history.

It is a policy/view layer over existing authorities:

- **PCO** decides whether work is structurally executable;
- **ACO** decides whether a structurally executable node is presently occupied;
- **the dispatcher** ranks only the remaining explicitly self-service candidates.

The dispatcher never creates work, changes dependencies, promotes maturity, steals a lease or decides that external/physical work is agent-executable.

## Non-goals

The first dispatcher deliberately does not implement:

- a hand-tuned numeric priority field;
- model/capability tags that no current scheduling input can honestly use;
- effort-weighted optimisation while effort estimates remain incomplete;
- automatic takeover of active/unclaimed work;
- automatic force takeover of live leases;
- fairness history, dispatch counters or another mutable runtime database;
- automatic architectural judgement about whether a packet is suitable for an agent.

Those mechanisms may be earned later by an observed coordination failure. They are not prerequisites for useful self-service scheduling.

## Explicit self-service boundary

Structural `READY` is necessary but not sufficient for generic agent dispatch.

Every non-terminal live node must state an agent-dispatch policy:

```ts
agentDispatch: {
  mode: 'self-service' | 'manual'
  reason?: string
}
```

`self-service` means a generic repository agent may take the packet when PCO says READY and ACO says available.

`manual` means the node stays visible in the programme but `control:claim-next` will never acquire it automatically. Manual nodes require an explicit directed decision and may still be claimed through the ordinary exact-node ACO command when authorised.

Manual mode requires a durable reason. Typical reasons include physical work, competent external/professional review, or an owner/manufacture release gate.

A missing policy on a planned/started/held node is a validation failure. This is intentionally fail-safe: newly introduced live work cannot silently become generic-agent work.

Completed/cancelled historical nodes do not require retroactive policy annotation.

## Eligibility

Default dispatcher candidates must satisfy all of the following:

1. PCO derived state is `ready`;
2. `agentDispatch.mode === 'self-service'`;
3. ACO operational occupancy is `available`;
4. any optional workstream filter matches an owning workstream.

Durably `active` but unclaimed nodes are reported as **handoff/resume candidates**, not silently assigned by the default dispatcher. Resuming an active packet can require context about partial work and is therefore a separate deliberate action.

A live or grace-period lease removes a node from the candidate set.

Any **invalid live claim** (for example a lease on a blocked/done/unknown node) makes automatic `claim-next` fail closed until the inconsistency is resolved. Read-only `next` may still report the ranking together with the unsafe condition.

## Ranking objective

The dispatcher optimises structural programme throughput without pretending node-count topology is elapsed time.

It uses a **lexicographic ordering**, not a weighted magic score. Each candidate receives four structural metrics:

1. **critical depth — descending**  
   Length of the longest remaining dependency chain beginning at the candidate, including the candidate. Higher means the packet sits further upstream of a long unresolved tail.

2. **blocker relief — descending**  
   For each direct planned dependent currently blocked by the candidate, contribute `1 / current blocker count`. A sole blocker contributes `1`; one of two blockers contributes `0.5`. This rewards packets that reduce near-term fan-in without pretending partial completion is an unlock.

3. **downstream reach — descending**  
   Number of unfinished descendant nodes reachable from the candidate. This favours work whose result participates in more of the remaining programme when the higher-order metrics tie.

4. **owner load — ascending**  
   Mean current load across the candidate's owning workstreams, where a workstream is loaded by durably active nodes and valid live/grace ACO claims. This is a weak tie-breaker that spreads genuinely equivalent work without overruling graph criticality.

Final tie-break: canonical node id ascending for deterministic output.

No aggregate numeric score is emitted. The policy remains inspectable as a tuple rather than presenting false precision.

`immediateUnlocks` is also reported for explanation, but is already represented inside blocker relief and is not a separate sort key.

## Why not use the existing single structural critical path directly?

`structuralCriticalPath()` intentionally returns one longest path. Tied paths can therefore be hidden by a deterministic traversal choice. The dispatcher instead calculates critical depth independently for every candidate, so equally long competing branches remain equally eligible for the first ranking key.

## Why not estimate duration?

Most live nodes do not carry reliable effort estimates. Missing effort must not become implicit zero. Until estimates are both broad and calibrated, node-count depth is labelled explicitly as structural rather than temporal.

## Live workload / owner-load semantics

Owner load is derived at read time from:

- nodes whose durable PCO state is `active`;
- known nodes with valid live/grace ACO leases.

A node is counted once even when both conditions apply. Multi-owner candidate load is the arithmetic mean of its owners' loads so shared integration gates are not automatically penalised merely for having more owners.

Released/expired claims do not contribute. Invalid live claims make automatic dispatch unsafe instead of being smuggled into a load score.

## Read-only command

```text
npm run control:next
```

Default output shows:

- observation time;
- whether automatic claiming is currently safe;
- ranked self-service READY candidates with explanatory metrics;
- manual READY nodes and their reasons;
- claimed READY/ACTIVE nodes;
- active/unclaimed handoff candidates;
- invalid live claims if any.

Options:

```text
--limit N
--workstream CODE
--format text|json
```

The JSON form is the stable machine-consumption surface for future orchestration.

## Atomic self-service command

```text
npm run control:claim-next -- --holder-kind chatgpt --holder-label session-name
```

It applies the same ranking policy and then acquires the top candidate through the existing ACO compare-and-swap protocol.

Race handling:

1. list claims and rank candidates;
2. attempt normal ACO acquisition of candidate 1;
3. if another claimant wins that node, re-list and **re-rank the whole frontier**;
4. take the new best available candidate;
5. bound repeated selection races and surface a conflict rather than loop forever.

Unrelated `runtime/claims` branch-head contention remains handled inside the existing per-node ACO acquisition retry logic.

`claim-next` never calls force takeover.

If no self-service candidate exists, it performs no mutation and reports that fact rather than treating manual/external work as automatically eligible.

## Workstream filter

`--workstream IAS` limits dispatch candidates to nodes owned by that registered workstream. It does not change ranking semantics or make manual nodes self-service.

This supports specialised workers without introducing an ungrounded capability taxonomy.

## Active/unclaimed work

The default scheduler does not silently resume active work. `ACTIVE · UNCLAIMED` remains visible as a handoff signal because the missing lease may mean:

- an intentional handoff;
- legacy work started before ACO;
- a crashed/expired agent;
- work that requires context before continuation.

An explicit resume mode can be added later if operational evidence shows it is useful and safe.

## Failure posture

Automatic dispatch fails closed when:

- the ACO store cannot be read or parsed;
- any invalid live claim exists;
- the local control view does not match current `main`;
- live node dispatch policy is missing/invalid;
- repeated claim races exceed the bounded retry budget.

Read-only ranking may explain unsafe state but must not mutate it.

## Agent loop after implementation

For an idle general-purpose agent with no directed packet:

```text
control:claim-next
  -> receive canonical node + lease
  -> read owning issue/programme/evidence
  -> create/renew branch metadata
  -> execute bounded packet
  -> validate
  -> verify lease before merge/handoff
  -> merge
  -> release
  -> control:claim-next again
```

A directly assigned packet still uses ordinary exact-node ACO acquisition; the dispatcher does not override explicit owner direction.

## Validation / adversarial cases

Implementation must prove at least:

- deterministic rank independent of input ordering;
- deeper structural tail outranks shallower work;
- blocker relief breaks equal-depth ties;
- downstream reach breaks remaining structural ties;
- owner load breaks genuinely equivalent ties without overriding criticality;
- claimed/grace nodes are excluded;
- manual READY nodes are never auto-selected;
- physical/external manual nodes remain visible with reasons;
- active/unclaimed nodes are reported but not default-selected;
- unknown or structurally invalid live claims make `claim-next` fail closed;
- released/expired claims do not block selection;
- workstream filtering cannot widen eligibility;
- a concurrent winner on the first candidate causes full re-ranking and acquisition of the next best node;
- no candidate produces no mutation;
- aliases remain canonical because acquisition continues through ACO;
- protocol tests use synthetic graphs rather than today's mutable programme frontier.

## Exit condition

`PCO-DISPATCH` closes only after:

- self-service/manual policy is explicit for all live non-terminal nodes;
- policy validation is in repository health;
- deterministic dispatcher unit/adversarial tests pass;
- `control:next` and `control:claim-next` are documented and available;
- `AGENTS.md` directs an idle undirected agent to self-serve through the dispatcher;
- a live read against the real programme produces a coherent ranking;
- a real ACO-protected `PCO-DISPATCH` implementation merge completes and its lease is released only after durable main reconciliation.

The dispatcher proves scheduling coherence only. It does not prove that the work selected will be architecturally correct.
