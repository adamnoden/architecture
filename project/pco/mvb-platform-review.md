# MVB: build-versus-adopt assessment

**Decision:** retain MVB's current execution contract; version it as 1.0.0. Prioritise a bounded GitHub Agentic Workflows (GH-AW) trial before expanding custom orchestration. Do not migrate the task graph, deploy a supervisor or enable new model spending as an incidental consequence of this review.

Owner-directed **PCO-MVB-REVIEW**, 29 October 2026. This review supports the house by reducing coordination maintenance and interruption/integration risk. It is a source/documentation assessment and adoption decision, not a production benchmark or completed platform trial.

## Question and method

Which existing system can remove owned MVB machinery or improve verified delivery without introducing competing authorities? Compare actual contracts, deployment topology and failure handling, rather than count features or assume that an agent framework is a project scheduler.

Read current repository instructions, owner-house charter, MVB manual/runbook, schemas, transports, operations workflows and earlier failure records. Review primary project documentation/specifications, release notes and selected source/tests; retain the retrieved revisions below. Distinguish documented capability, inspected implementation, upstream-reported tests and locally demonstrated behaviour. No candidate was installed, run against the production repository or given credentials. No paid inference was launched.

The current system coordinates independent, sometimes short-lived Work chats. It does not own a persistent process capable of observing or terminating them. It already has repository-native CI and conservative reconciliation. Those constraints materially change the comparison with a CLI worker fleet.

## Findings by layer

| Layer | Existing approach | What this means for MVB |
|---|---|---|
| Plan | Dependency-aware trackers, typed DAGs, issue relationships | Familiar problem; preserve one plan, not our implementation at any cost |
| Acquisition | Transactional claims, CAS and leases | Established primitives; do not equate a task assignee with an expiring, versioned claim |
| Supervision | Persistent runner, isolated workspaces, observation, restart/cancellation | Largest missing capability; requires an actual host/runtime, not more chat instructions |
| Integration | Required CI, protected writes, merge queues | A fresh lease check is still not an atomic merge fence |
| Recovery | Durable state, request identity, reconciliation and repeat-safe effects | Retrying a timed-out write or worker launch can duplicate effects |
| Acceptance | Project evidence and judgement | No general platform can supply architectural adequacy from a successful task run |

### Beads: closest task/claim overlap

[Beads](https://github.com/gastownhall/beads) supplies a dependency-aware tracker backed by Dolt. Its [coordination guide](https://github.com/gastownhall/beads/blob/e226083653b893998614df4225f73b6688ca9166/docs/multi-agent/coordination.md) documents atomic ready-work claiming, handoffs and exclusive merge slots. The [release history](https://github.com/gastownhall/beads/releases) documents leased claims and recovery, and also concrete upgrade, backup and concurrency repairs.

Assessment: a credible replacement candidate for substantial portions of PCO/ACO, not merely an extra agent memory tool. Adoption moves task authority into a new database/sync topology. It must preserve our shared aliases, manual exclusions, cancellation/dependency semantics, evidence requirements and replacement-worker protection. Distributed synchronisation must be tested in the exact chosen writer topology; independent replicas must not each believe they own the same task. Upstream fixes demonstrate active engineering, not that Beads is categorically unreliable. Do not add it alongside the existing editable DAG.

### Gas Town: worker-fleet management

[Gas Town's overview](https://github.com/gastownhall/gastown/blob/466aa41c83ee73b1fa0eb79eb9d172fb1eca9476/docs/overview.md) and [provider integration](https://github.com/gastownhall/gastown/blob/466aa41c83ee73b1fa0eb79eb9d172fb1eca9476/docs/agent-provider-integration.md) describe CLI agents coordinated through terminal sessions, durable work assignment and communication. Its [README](https://github.com/gastownhall/gastown/blob/466aa41c83ee73b1fa0eb79eb9d172fb1eca9476/README.md) includes supervision and a test-gated integration queue.

Assessment: addresses the absent worker host and lifecycle layer more directly than Beads. It also introduces a substantial operating model and Beads dependency. It cannot supervise an arbitrary inaccessible Work chat simply by being installed. Worth revisiting for a sustained, heterogeneous terminal-agent fleet; not the smallest immediate addition to the current workflow. A successful daemon deployment would still need our acceptance and authority boundaries.

### GitHub Agentic Workflows: leading GitHub-native candidate

The [work-queue reference](https://github.github.io/gh-aw/reference/work-queue/) describes a Git-backed queue, dependency scheduling, immutable assignments and claim-scoped outputs. The [WorkQueueOps guide](https://github.github.io/gh-aw/patterns/workqueue-ops/) distinguishes that queue from simpler issue or memory-based patterns. The [safe-output model](https://github.github.io/gh-aw/reference/safe-outputs/) separates agent requests from permission-controlled mutation jobs.

Assessment: strongest strategic fit with our existing GitHub storage, CI and durable provenance. The queue is a potential replacement for generic scheduling/claim machinery, not automatically a sidecar to ACO. Its execution model binds authority to hosted workflow runs, unlike our cooperative chat leases. A source plan may feed derived assignments, but independent editing of two DAGs is unacceptable.

The [queue specification](https://github.github.io/gh-aw/specs/work-queue-specification/), especially its implementation/evidence checklist, explicitly separates local tests from remaining hosted, contention and delivery evidence. Documentation breadth is not proof that our deployment works. Selected pinned binding source and reconciliation tests were inspected; they include exact assignment checks and reservation retention on unavailable/mismatched evidence. Those tests were not executed here.

### Symphony: a focused supervisor candidate

[Symphony](https://github.com/openai/symphony) is explicitly an engineering preview. Its [specification](https://github.com/openai/symphony/blob/be10a1b79df723d6d7612b5651c8522704dafb2e/SPEC.md) separates tracker state from running/retry ownership, isolates workspaces and recovers through tracker/filesystem reconciliation. Its [reference implementation](https://github.com/openai/symphony/blob/be10a1b79df723d6d7612b5651c8522704dafb2e/elixir/README.md) documents GitHub Issues among its adapters and runs Codex app-server.

Assessment: attractive if the next need is a persistent Codex CLI host rather than a replacement task store. A tracker adapter does not automatically preserve the MVB DAG or coordinate with independent chat workers. Its orchestrator-local claims are not proof of mutual exclusion between multiple daemon instances or an external ACO worker. A trial needs one designated authority and a scoped worker population. Do not implement a new Symphony variant merely because its spec makes that possible.

### Other useful precedents

[Claude Code agent teams](https://code.claude.com/docs/en/agent-teams) provide shared tasks and messaging, but document experimental status and limitations in resumption, task state and session scope. They are useful execution machinery inside that harness, not a durable cross-harness project authority.

[Temporal](https://docs.temporal.io/temporal) provides durable workflow execution. Its [MCP guidance](https://docs.temporal.io/develop/python/integrations/mcp) explicitly warns that tools can execute again after lost responses and that an activity timeout does not cancel an already running request. [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence) supplies checkpoints/stores, with durable backends required across process loss. These are relevant implementation precedents, but adopting either alone would leave us building a bespoke coding-work coordinator around it.

## Native GitHub is useful, but not sufficient by itself

[Issue dependencies](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-issue-dependencies) expose blocking relationships; they do not themselves implement MVB's acquisition and evidence contract. [Merge queues](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue) test against the current target and queued changes. Their documented availability is organisation-owned repositories, with additional plan restrictions for private repositories. Our repository API reported a public, user-owned repository during this review: do not prescribe enabling an unavailable native queue or silently transfer ownership to obtain it.

[Actions concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency) serializes participating jobs, not arbitrary external workers. Default pending-run replacement also means a concurrency group is not automatically a durable backlog. Neither a concurrency group nor a normal issue assignee replaces cross-session CAS ownership.

The [GH-AW Codex engine guide](https://github.github.io/gh-aw/engines/codex/) requires API credentials or Copilot inference and explicitly excludes ChatGPT subscription login. Thus GitHub hosting is not a free extension of this Work chat. Establish actual credentials, inference budget and supported deployment before proposing autonomous execution. This review does not infer configured access from the existence of a connector.

## Red team: apply the same standard to MVB

Avoid sunk-cost defence. Selected scheduler/claims/reporting modules and their CLIs already total roughly 2,385 source lines, excluding tests and other control code. That is owned maintenance, not a full size/cost estimate. The hand-serviced connector mailbox and inability to supervise a vanished chat are real operating costs. GitHub storage makes the system inspectable, not intrinsically superior to a transactional database.

Conversely, do not trade known bounded defects for an untested platform whose credentials, writer topology and recovery policy we do not understand. Neither upstream popularity nor a green unit suite establishes our token permissions, deployment safety, cost or realised throughput. No measured performance winner is claimed.

Lease expiry is permission expiry, not worker termination. Cooperative old workers can recheck; a permission-enforced system needs trusted effect checks or revocation. A later runner must not count an expired lease as proof that physical capacity is free. Model invocation, worker conclusion, effect delivery, accepted merge and architectural acceptance are distinct results.

## Decision and next experiment

1. Keep the existing graph and lease store authoritative for current workers. Adopt the [version and cutover policy](../control/releases.md) now; no live authority migration occurs.
2. Do not expand MVB into a general worker manager, message bus, event-sourced ledger or model framework without a failure that an existing candidate cannot address more cheaply.
3. First candidate for a replacement trial: **GH-AW**, in a disposable test repository with synthetic work only. Scope initially to hosted execution and claim/effect recovery. Do not mirror live house tasks into its queue.
4. If the actual operating choice becomes a persistent Codex terminal host, compare **Symphony** before building one. Reconsider **Gas Town** for a heterogeneous terminal fleet, and **Beads** for an intentional task-store replacement. These are conditional alternatives, not four integrations to implement.
5. Keep deterministic reporting deterministic. Existing Actions jobs already compute it; an LLM rewriting the same report would add inference cost and another interpretation boundary without deleting a need.

A trial must identify its pinned release, deployment/runtime, auth mode, bounded inference allowance and sole authority before execution. The current review has no demonstrated candidate installation/auth readiness and does not claim a live pilot. A disposable test harness is an experiment, not a second production graph.

| Failure exercise | Required observation before adoption |
|---|---|
| Two workers contend for one ready packet | Exactly one authorised attempt; loser cannot emit protected effects |
| Worker/dispatcher dies before and after launch | Recoverable identities; uncertain launch is reconciled without blind duplication |
| Mutation succeeds but response is lost | One logical result, verified readback, no replay of unsafe effects |
| Original worker returns after reassignment | It cannot publish under its obsolete permission |
| Main/dependency/manual policy changes during execution | Invalid work is blocked or explicitly revalidated, not silently accepted |
| Two PRs independently pass then conflict on integration | Combined current-base checks protect main; no stale green shortcut |
| Credentials/network fail, including during recovery | Unknown remains visible; no false free frontier or premature release |
| Pause, upgrade and rollback with pending work | Exactly one writer, preserved evidence, settled workers/effects before authority transfer |

Success means repeatable recovery plus either demonstrably less owned machinery or better verified delivery under comparable workloads. Record operator interventions, duplicate/abandoned attempts, merge failures, recovery time, model/runner spend and the exact code/workflows that could be deleted. Do not fabricate a percentage improvement from a synthetic example. If adoption wins, remove replaced dispatch/store/recovery paths in the same planned cutover, retain only necessary project policy and read-only projections, and preserve historical evidence.

## Reproducible evidence and limits

Public documentation accessed 29 October 2026. Upstream default-branch revisions returned by GitHub's commit API during the review:

| Repository | Observed revision |
|---|---|
| `github/gh-aw` | `28f2101d8af447fdb90ffd70dd2579e4ad64a21c` |
| `gastownhall/beads` | `e226083653b893998614df4225f73b6688ca9166` |
| `gastownhall/gastown` | `466aa41c83ee73b1fa0eb79eb9d172fb1eca9476` |
| `openai/symphony` | `be10a1b79df723d6d7612b5651c8522704dafb2e` |

Website references are dated observations and may change; the revision table does not assert that every website page was built from that exact commit. Pinned source checks included GH-AW `actions/setup/js/work_queue_binding.cjs` (blob `97bd7ab652438f0b59f7dcd2da62a482885f6a8b`) and `reconcile_work_queue_run.test.cjs` (blob `0975af91239d76ea8a8d9dfc397c430db7b70aa2`), Beads' coordination guide and Symphony's spec. GH-AW's recursive tree response was not truncated and confirmed implementation/test paths beyond marketing descriptions.

Evidence tier: primary-document review and selected source/test inspection. No installed-platform benchmark, independent upstream suite pass, hosted queue deployment, hostile-writer proof or external price comparison is claimed. Existing MVB's authority limits remain. Local repository/control checks and exact-head CI validate this repository change; the PR records their actual result and integration identity. No external contact or operational service deployment is part of this packet.
