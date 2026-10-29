# Project control

This directory is the machine-readable execution-control plane for Ovid’s House.

It does **not** own architectural truth, maturity judgement or narrative history.

## Agent operating loop

For substantial bounded project work intended to produce durable/authoritative output:

1. identify the owning PCO node;
2. verify the node is structurally `ready` (or already durably `active`);
3. query live ACO occupancy with `npm run control:claims`;
4. acquire the canonical node lease before beginning collision-prone execution;
5. read the owning issue/programme/result sources for scope and authority;
6. execute the bounded work without silently changing another node/workstream’s owned decisions;
7. renew the lease at meaningful checkpoints when the work approaches expiry;
8. verify the lease still belongs to this execution before final merge/handoff;
9. commit durable result / closeout evidence and change only the owning sharded node lifecycle when warranted;
10. release the ACO lease after merge, handoff or abandonment;
11. run project-control validation and the applicable repository/workstream checks;
12. let main-branch projection reconciliation update `STATUS.md`, `project/workstream-codes.md` and `project/control/graph.md`.

Read-only inspection that cannot collide with another agent’s durable output does not need a lease.

Do not hand-author `READY` or `BLOCKED`. Do not treat GitHub issue open/closed state as execution authority. Do not create a graph node for every implementation micro-step.

**READY means structurally dependency-eligible, not globally unclaimed.** ACO owns live execution occupancy on the dedicated `runtime/claims` branch. `STATUS.md` intentionally remains structural and does not embed volatile claim state.

Normal agents must not force-take a live lease merely to avoid waiting. Force takeover is an exceptional owner/admin operation requiring an explicit reason. An expired/released lease may be reacquired normally.

If the live lease store is unavailable or malformed, fail closed for new collision-prone work rather than assuming the node is free.

If a node becomes blocked, held, complete or cancelled while a lease is live, the lease becomes an invalid coordination condition and cannot be renewed. It can still be released. A canonical orphaned lease can also be released even if its node has subsequently been removed from the graph.

If substantial authorised work has no suitable node, add a bounded node to the owning workstream before treating the work as part of the execution programme. New first-class workstreams must be registered with exactly three uppercase letters; historical exceptions/aliases are not precedents for new codes.

## Visual control map

`project/control/graph.md` is a generated Mermaid projection of the durable PCO DAG. Its first graph omits completed/cancelled history to keep the current execution frontier legible; a second collapsed graph includes the complete history.

```text
npm run control:graph
npm run control:graph -- --all
npm run control:graph -- --tb
```

The committed map is intentionally structural. For the same graph with live ACO occupancy overlaid at read time:

```text
npm run control:graph:live
npm run control:graph:live -- --all
```

The live view reads `runtime/claims`, evaluates leases at GitHub-observed time and marks claimable nodes as `AVAILABLE`, `CLAIMED`, `CLAIM GRACE` or `ACTIVE · UNCLAIMED`. A live lease on a blocked/held/done/cancelled node is rendered as an explicit invalid-claim condition rather than masking PCO state.

## Lease commands

The GitHub-backed client uses `GH_TOKEN` or `GITHUB_TOKEN` for mutations. It prefers GitHub server time when evaluating leases.

```text
npm run control:claims
npm run control:claim -- NODE --holder-kind chatgpt --holder-label session-name --branch work/example
npm run control:verify -- NODE --lease-id UUID --generation N
npm run control:renew -- NODE --lease-id UUID --generation N
npm run control:release -- NODE --lease-id UUID --generation N --reason completed
npm run control:force -- NODE --holder-kind human --holder-label owner --reason "confirmed ghost session"
```

Aliases resolve to canonical node ids before touching the lease store, so shared packet aliases cannot acquire separate leases.

`status`, normal `claim` and `force` deliberately require a checkout whose PCO structural graph matches current `main`, because they answer structural availability. `verify` is occupancy-only: it proves that the supplied lease id/generation still owns a live lease, while PCO/merge validation independently proves durable structural correctness. `renew` refuses renewal when the caller’s graph already says the node is no longer ready/active. `release` is intentionally more permissive so an orphaned canonical lease can always be relinquished.

## Sources

- `workstreams.ts` — first-class workstream identity.
- `nodes/` — sharded executable packets/gates and deliberate lifecycle.
- `derive.ts` — readiness, blockers, frontier, unlocks and structural critical path.
- `claims.ts` — lease schema, canonical resolution, expiry and operational-state semantics.
- `claim-store.ts` — race-safe store-level acquire/verify/renew/release/takeover operations.
- `mermaid.ts` — deterministic structural/live Mermaid projection.
- `graph.md` — generated structural Mermaid map; never runtime claim authority.
- `validate.ts` — structural and evidence-contract guardrails.
- `render.ts` — human-readable durable projections.
- `../maturity.ts` — separate epistemic maturity authority.
- `../maturity-freshness.ts` — evidence-content drift surveillance for maturity reassessment.

Root `AGENTS.md` remains the repository-wide operating constitution. This README adds the PCO/ACO-specific execution mechanics; it does not duplicate or weaken the root rules.