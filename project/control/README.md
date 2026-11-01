# Project control

This directory is the machine-readable execution-control plane for Ovid’s House.

It does **not** own architectural truth, maturity judgement or narrative history.

## Agent operating loop

For substantial bounded project work intended to produce durable/authoritative output:

1. if the owner has explicitly assigned a packet, identify that canonical PCO node; otherwise use `npm run control:claim-next` to self-serve the best currently available generic-agent packet;
2. for a directed packet, verify the node is structurally `ready` (or already durably `active`) and acquire its exact ACO lease;
3. read the owning issue/programme/result sources for scope and authority;
4. execute the bounded work without silently changing another node/workstream’s owned decisions;
5. renew the lease at meaningful checkpoints when the work approaches expiry;
6. verify the lease still belongs to this execution before final merge/handoff;
7. commit durable result / closeout evidence and change only the owning sharded node lifecycle when warranted;
8. release the ACO lease after merge, handoff or abandonment;
9. run project-control validation and the applicable repository/workstream checks;
10. let main-branch projection reconciliation update `STATUS.md`, `project/workstream-codes.md` and `project/control/graph.md`;
11. if still idle and undirected, run `control:claim-next` again rather than choosing an arbitrary READY node.

Read-only inspection that cannot collide with another agent’s durable output does not need a lease.

Do not hand-author `READY` or `BLOCKED`. Do not treat GitHub issue open/closed state as execution authority. Do not create a graph node for every implementation micro-step.

**READY means structurally dependency-eligible, not globally unclaimed and not automatically suitable for generic agent execution.** ACO owns live execution occupancy on the dedicated `runtime/claims` branch. Each live node also has an explicit `agentDispatch` policy: `self-service` nodes may enter the generic dispatcher; `manual` nodes remain directed work even when structurally READY.

Normal agents must not force-take a live lease merely to avoid waiting. Force takeover is an exceptional owner/admin operation requiring an explicit reason. An expired/released lease may be reacquired normally.

If the live lease store is unavailable or malformed, fail closed for new collision-prone work rather than assuming the node is free.

If a node becomes blocked, held, complete or cancelled while a lease is live, the lease becomes an invalid coordination condition and cannot be renewed. It can still be released. A canonical orphaned lease can also be released even if its node has subsequently been removed from the graph.

If substantial authorised work has no suitable node, add a bounded node to the owning workstream before treating the work as part of the execution programme. New first-class workstreams must be registered with exactly three uppercase letters; historical exceptions/aliases are not precedents for new codes.

## Self-service dispatcher

The dispatcher combines durable PCO structure with live ACO occupancy to help an idle undirected agent select useful work without reconstructing the programme from chat history.

```text
npm run control:next
npm run control:next -- --limit 10
npm run control:next -- --workstream IAS
npm run control:next -- --format json

npm run control:claim-next -- --holder-kind chatgpt --holder-label session-name
npm run control:claim-next -- --holder-kind chatgpt --holder-label session-name --workstream OAS
```

`control:next` is read-only and explainable. It ranks only structurally READY, explicitly `self-service`, presently unclaimed nodes. The ordering is lexicographic rather than a hand-tuned score:

1. longer remaining structural critical depth;
2. greater direct blocker relief;
3. greater unfinished downstream reach;
4. lower current owner/workstream load;
5. canonical node id for deterministic ties.

The metrics are structural. They are not wall-clock duration estimates.

`control:claim-next` applies the same ranking and acquires the top candidate through the ordinary ACO compare-and-swap protocol. If another agent wins that node concurrently, the dispatcher reloads live occupancy, reranks the complete eligible frontier and attempts the new best candidate. It never calls force takeover.

Manual READY nodes remain visible with their exclusion reason but are never auto-selected. This includes physical tests and competent external/professional review gates. Durably active but unclaimed nodes are shown as handoff/resume candidates; the default dispatcher does not silently inherit them.

Any invalid live claim makes automatic dispatch fail closed until the coordination inconsistency is resolved. A missing dispatch policy on any live non-terminal node is also a repository-validation failure, so newly added work cannot silently become generic-agent work.

The stable machine-consumption surface is `control:next -- --format json`. An optional `--workstream CODE` filter only narrows eligible work; it cannot turn a manual node into self-service work.

The full policy rationale and adversarial contract live in `project/pco/pco-dispatcher-design.md`.

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

`status`, normal `claim` and `force` deliberately require a checkout whose PCO structural graph matches current `main`, because they answer structural availability. Dispatcher commands additionally require the local dispatcher/ACO protocol itself to match `main`, so a feature branch cannot silently run a private ranking policy. `verify` is occupancy-only: it proves that the supplied lease id/generation still owns a live lease, while PCO/merge validation independently proves durable structural correctness. `renew` refuses renewal when the caller’s graph already says the node is no longer ready/active. `release` is intentionally more permissive so an orphaned canonical lease can always be relinquished.

## Sources

- `workstreams.ts` — first-class workstream identity.
- `nodes/` — sharded executable packets/gates, deliberate lifecycle and explicit agent-dispatch policy.
- `derive.ts` — readiness, blockers, frontier, unlocks and structural critical path.
- `dispatch.ts` — deterministic self-service eligibility, ranking and race-safe `claim-next` orchestration.
- `claims.ts` — lease schema, canonical resolution, expiry and operational-state semantics.
- `claim-store.ts` — race-safe store-level acquire/verify/renew/release/takeover operations.
- `mermaid.ts` — deterministic structural/live Mermaid projection.
- `graph.md` — generated structural Mermaid map; never runtime claim authority.
- `validate.ts` — structural, dispatch-policy and evidence-contract guardrails.
- `render.ts` — human-readable durable projections.
- `../maturity.ts` — separate epistemic maturity authority.
- `../maturity-freshness.ts` — evidence-content drift surveillance for maturity reassessment.

Root `AGENTS.md` remains the repository-wide operating constitution. This README adds the PCO/ACO-specific execution mechanics; it does not duplicate or weaken the root rules.