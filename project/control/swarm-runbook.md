# Minimum Viable Bureaucracy: swarm runbook and report contract

This is the operational companion to root `AGENTS.md` and the [Minimum Viable Bureaucracy (MVB) manual](README.md). It introduces no scheduler, alternative lease authority, workstream maturity scale or permission grant.

Use the [communication phrasebook](communications.md) at consequential coordination boundaries. Clear English remains valid; markers never grant ownership. Keep ordinary progress updates concise and retain the measured closeout contract below.

## Start once, then keep working

1. Read root instructions and control documentation. Inspect the configured runtime/network guidance, tool descriptions and available GitHub connector schema before guessing arguments. Do not print credentials.
2. Run `npm run control:brief` for a consolidated snapshot when current-main source and Git access are available. Read its timestamp, warnings and PR head identities; use the canonical dispatcher for acquisition. Establish current `main`, a clean authoritative graph and live claims. Use a dedicated checkout/worktree; preserve other sessions' files. Capture a run baseline before the first lease. If capture begins late, label the earlier duration unknown rather than backdating it.
3. Choose the supported transport below. Run the canonical dispatcher for undirected work; directly claim only an explicitly assigned canonical node.
4. Execute, validate, merge, reconcile issues/projections and clean up the bounded packet. Verify the lease before merge, then release it promptly. Record the merged packet from current main, not an unmerged branch.
5. Dispatch again. Successful completion of one or two packets is not a stopping condition. If a candidate cannot proceed, prefer another eligible candidate. Do not silently convert `swarm` into a trial.

Stop only for interruption, an actual execution limit, an evidenced empty eligible frontier, or a coordination/environment blocker after safe alternatives. A directed assignment may finish at its explicitly bounded scope. Do not invent an execution deadline, infer approval from silence or leave an unattended lease. Preserve unfinished work and exact handoff evidence, release/handoff leases and state what remains. No background execution after the turn is implied.

## Shared execution across chat environments

Independent regular chats, independent Work chats, and a Work coordinator with parallel agents all use the **same PCO dispatcher and ACO leases**. Each executing worker claims one canonical packet independently, verifies before publishing, and releases after completion or handoff. A coordinator may sequence workers and report combined results, but cannot replace a worker's lease with a conversation assignment or maintain a competing task queue.

Four regular chats and eight parallel workers are illustrative, not settings or limits. Moving between these arrangements needs no reset: read current main and live claims, respect occupied packets, reuse verified recovery evidence and continue. A coordinator stopping does not revoke other workers' leases. Session-level progress and individual verified merges remain separate.

## Runtime and supported transports

Check the repository's Node requirement and locked dependencies once. The direct launch form avoids `tsx`'s IPC launcher and retains its TypeScript loader:

```sh
node --import tsx scripts/project-claims.ts next --format json
node --import tsx scripts/project-claims.ts claim-next --holder-kind chatgpt --holder-label SESSION
```

With a configured `GH_TOKEN`/`GITHUB_TOKEN`, the default `github` transport uses the existing API store. Never invent a token or expose one in logs. Read-only API access is not evidence of write authorisation.

When CLI credentials are absent but the session has an authorised GitHub connector, use `--transport connector`. The store fetches the retained `runtime/claims` branch into its branch-specific remote-tracking ref without touching shared `FETCH_HEAD`, then captures an immutable commit. This prevents an overlapping main fetch from substituting the source tree for the lease store. It validates every record against its Git blob SHA; immutable snapshots supply all reads. Network/malformed-store failures fail closed. The Git transport cannot observe GitHub HTTP server time, so it explicitly uses the executor clock at read time, matching the native client's local-clock fallback. Do not use commit timestamps as server time. If clock accuracy is in doubt near expiry, do not acquire overlapping work; resolve the clock uncertainty first.

```sh
node --import tsx scripts/project-claims.ts next --transport connector --format json
# Create a private temporary directory OUTSIDE the repository using the host's temp-directory facility.
node --import tsx scripts/project-claims.ts claim-next --transport connector --bridge-dir /ABSOLUTE/PRIVATE/TEMP --holder-kind chatgpt --holder-label SESSION --format json
```

Use the same transport flags with `claim`, `show`, `verify`, `renew`, `release` and `status`. Read-only commands need no mailbox. The holder label identifies the session; branch/PR metadata should identify its actual bounded output when known. Existing main/protocol freshness guards still apply. Never claim from a feature branch that changes dispatcher/store policy.

### Connector mailbox protocol

The CLI emits `ACO_CONNECTOR_REQUEST /…/UUID.request.json` on stderr and waits up to 120 seconds for a matching `UUID.response.json`. The agent services this request through its existing authorised connector tools; the CLI does not discover sessions, start authentication, proxy arbitrary HTTP or grant permissions.

The request contains schema version 1, request UUID, repository, fixed `runtime/claims` branch, canonical `.pco/claims/NODE.json` path, `create`/`update`, exact UTF-8 content, commit message, and (for update) `expectedSha`.

1. Read the request through the host file tools. Confirm it belongs to this execution, expected repository, fixed branch and canonical node; service only requests from your private mailbox. Check the connector's **actual tool schema** before calling it.
2. For `create`, call the connector's create-file operation. For `update`, call update-file with **exactly `expectedSha`** as its current blob SHA. Never downgrade an update to a blind replacement, omit CAS, force a lease, or retry using a newly read SHA without rerunning the canonical lease operation.
3. On success, fetch the stored file on `runtime/claims`; verify its content matches the request. Its **content blob SHA**, not the commit SHA, goes in the reply. A known 409/422 same-file CAS/create collision is `conflict`; authentication, malformed response, network or uncertain outcomes are `unavailable`.
4. Atomically rename a temporary reply into `UUID.response.json`. A success response is:

```json
{"schemaVersion":1,"requestId":"UUID","outcome":"written","contentSha":"CONTENT_BLOB_SHA"}
```

Other responses use `"outcome":"conflict"` or `"outcome":"unavailable"` with an optional `detail`. No secrets belong in a request or reply. The CLI re-fetches the remote snapshot and verifies the exact content/blob before accepting success. Canonical acquisition/renewal/release and race-safe dispatcher retry logic run unchanged above this transport.

A timeout is **unknown remote outcome**, not a free node. Retain the request, read remote state and reconcile its exact lease UUID/generation before another attempt. Never process an old timed-out request after starting a replacement acquisition. Remove temporary mailboxes only after successful reconciliation and lease cleanup. If fresh Git reads or connector writes cannot be established safely, stop new collision-prone work and report the precise blocker.

## Regular-chat gateway: three commands only

The locked [MVB control mailbox #1089](https://github.com/adamnoden/architecture/issues/1089) accepts owner-authored one-line command comments, for example:

```text
MVB/1 {"cmd":"claim-next"}
MVB/1 {"cmd":"renew","node":"ABC-01","leaseId":"UUID","generation":1,"checkpoint":{"evidence":"PR #123","next":"Inspect CI"}}
MVB/1 {"cmd":"release","node":"ABC-01","leaseId":"UUID","generation":1,"reason":"handoff"}
```

The gateway assigns unique `work/mvb-chat-COMMENT_ID` branch identity on acquisition; create that branch only after the returned claim is verified. A GitHub Actions runner executes the canonical `project-claims.ts` CLI, and a bot comment starting `MVB/1 RESULT COMMENT_ID` reports the outcome. If a response is absent or ambiguous, inspect the canonical claim record and workflow run; **do not post another claim-next blindly**. Use `renew` to update a pushed branch/PR recovery checkpoint; only `handoff` and `abandoned` are permitted for explicit release. Merged-packet completion is reconciled by existing main automation. This gateway does not merge or restart the chat.

## Connector-only chat boundary

Some ordinary ChatGPT sessions expose GitHub connector reads and writes but cannot clone/fetch GitHub from their local terminal. **Do not claim that a GitHub tool call ran the canonical CLI.** This is a degraded, owner-directed transport boundary, not another dispatcher. Undirected `swarm` still requires fresh `control:claim-next`; without it, report the limitation and do useful read-only planning instead of inventing ranking.

For an **explicitly owner-directed bounded packet** in such a chat, connector-only execution may proceed only if all of these checks are established: read current main's canonical PCO node definition and dispatch/manual policy; read the exact claim file on retained `runtime/claims` (not another ref); observe expiry plus grace conservatively and clock reliability; use connector create-if-absent or update with the **exact previous blob SHA**, never blind replacement; verify returned remote content, UUID, generation and new branch; preserve old branch/PR; and recheck ownership prior to dependent writes. If a prior write is uncertain, reconcile it before any new mutation. Never claim a node absent from current main without recording an exceptional bootstrap decision and its temporary effect on dispatch safety.

This connector-only path does not itself run repository tests or `control:merge-check`. Require exact-head CI and a verified fresh publication preflight on a capable runner before merging. If those cannot be established, leave the PR unmerged and report the precise missing proof. Do not treat an issue/PR comment as lease authority. Connector-only behaviour must be provenance-bound and attributable, not a general alternative to the canonical dispatcher.

## Validation cadence

- Iterate with checks that cover the changed boundary. Run the canonical full-health command locally when supported; otherwise require full health on the exact submitted head in CI and record the local runtime limitation.
- Do not repeat successful checks unless a relevant source/dependency changed, a failure appeared or a concern remains. CI still runs the repository's required suite; this guidance does not weaken it.
- Poll CI at meaningful intervals (usually 30–60 seconds). Continue safe independent investigation while waiting. Do not repeatedly fetch full logs; inspect failed/current jobs when that answers a question.
- Before merge, compare validated head and current base. Reconcile parallel changes and revalidate affected boundaries. Preserve a parallel fix rather than duplicating it. CI passing does not establish architectural, physical or professional adequacy.
- After merge, verify source lifecycle, projection reconciliation, issue state, lease release and branch cleanup. Report exact residue proactively.

## Capture and report commands

Use a private run JSON path outside the repository. It is a session journal, not another durable queue. The CLI captures only a current-main graph with clean authoritative sources. A previous journal may be resumed; do not overwrite it or silently restart its clock. Preserve important unfinished-work evidence in the owning repository result/PR before the session ends.

```sh
npm run swarm:run -- start --run /ABSOLUTE/PRIVATE/run.json --mode swarm
# A specifically bounded owner assignment uses --mode directed.

# After verified merge, from current main:
npm run swarm:run -- record --run /ABSOLUTE/PRIVATE/run.json --node CODE-01 --pr https://github.com/OWNER/REPO/pull/123 --merge FULL_MERGE_SHA

# Checkpoint; continue afterwards:
npm run swarm:run -- report --run /ABSOLUTE/PRIVATE/run.json

# Capture live state: use direct Node so redirected output contains pure JSON, not npm banners.
node --import tsx scripts/project-claims.ts next --transport connector --format json > /ABSOLUTE/PRIVATE/dispatch.json

npm run swarm:run -- report --run /ABSOLUTE/PRIVATE/run.json --dispatch-json /ABSOLUTE/PRIVATE/dispatch.json --all true --stop-reason frontier-empty --detail "Fresh canonical dispatch reports zero eligible self-service candidates; manual gates remain" --validation "Exact-head CI passed; architectural limits retained" --leases released --cleanup clean --output /ABSOLUTE/PRIVATE/report.md
```

Final stop reasons: `frontier-empty`, `coordination-unavailable`, `owner-interruption`, `execution-limit`, and (directed runs only) `scope-complete`. Concrete detail and validation/lease/cleanup status are mandatory. A claimed cleanup or lease residue requires `--residue` naming the exact item and action owner. An empty frontier requires fresh canonical dispatch JSON, safe for automatic claim and with zero candidates. An execution limit must identify the actual limit; a self-imposed packet cap is not one. Record a packet only after verifying the PR's merged status, merge identity and packet ownership; the CLI additionally checks main ancestry and current complete state. A later reopening removes it from the report's currently-complete shipment count.

## Standard user-facing final report

Lead with the outcome, then provide the following consistently. Use the generated report as the numerical source; present touched workstreams by default and expand to all workstreams with `--all true` when useful. Keep checkpoints shorter. Do not bury the stop reason.

| Field | Required content |
|---|---|
| Outcome | Packets merged, substantive findings/changes and PR links; unfinished/pending work separately |
| Time | Captured start/end and elapsed wall minutes, including CI/waits; identify any unmeasured earlier setup. No invented labour hours or total parallel compute |
| Coverage | Before → after completed/non-cancelled canonical packet counts and percentage, globally and per touched workstream. Empty scopes are n/a |
| Scope changes | Added, removed, cancelled and reopened packets; explain denominator changes or a falling percentage |
| Attribution | This session's verified merge journal separately from net programme deltas, which may include other agents |
| Frontier | Structural ready/blocked/active/held counts, newly-ready nodes, and fresh live available/claimed/manual/active-unclaimed state; unknown availability stays unknown |
| Owner decisions | Manual gates and their concrete reasons; actual blockers and what would unblock them |
| Assurance | Validation and its limits, lease status, cleanup clean or exact residue/owner |
| Stop / next | Explicit stop category, evidence, remaining eligible work and resumable handoff |

Packet percentages are **coverage of the current execution graph**. Tasks differ in size and future work can be added. They are not percentage of effort, architecture resolved, building ready to construct, or maturity validated. Shared nodes count once globally and in each owning workstream; do not sum workstream rows. Preserve the separate maturity/authority ceiling. Do not turn these counts into an ETA or weighted score without independently justified estimates. Never present an unmerged branch's `complete` lifecycle as shipped work.

## Resilience, recovery and publication preflight

At startup, inspect the crash-recovery section of `control:brief` before dispatching. Check preserved unmerged PRs, previous claims and active-unclaimed review items; none is an instruction to merge. A valid previous branch plus checkpoint permits guarded started-node self-service recovery in the existing dispatcher, with evidence rechecked at acquisition. New leases carry the immediate predecessor identity plus the last durable remote evidence source, even through repeated empty successor runs, but *not* the predecessor's checkpoint as the successor's present achievement. Compare actual branch/PR head to current main and validate anew.

A sudden session death can interrupt between remote push, lease renewal, PR creation, CI, merge and release. Recover using fresh remote observations, never the last chat transcript, and never infer missing labour time or local-only changes. Branch/PR evidence should be pushed before recording a matching checkpoint; do not depend on a final goodbye message. Returning workers must stop publishing if their generation is superseded.

Before acquiring work, run `npm run control:doctor -- --transport connector --bridge-dir /ABSOLUTE/PRIVATE/TEMP` (or the native transport). It verifies fresh main/protocol and claim reads, and reports whether mutation transport is configured. Configuration is not proof of write authorisation; only a successful canonical CAS operation proves that. Do not confuse a transport outage with an empty frontier or another agent owning all work. Native HTTP calls have a 20-second request deadline; Git operations default to a 30-second command deadline. Set `ACO_GIT_TIMEOUT_MS` to a decimal integer from 1 to 120000 milliseconds (for example `ACO_GIT_TIMEOUT_MS=90000`) when measured transport latency needs more time; invalid explicit values fail closed. The shared bound covers claim snapshots, startup/acquisition/publication Git and swarm report Git. It changes no fresh-fetch, immutable snapshot, CAS, lease verification/runway or expected-head requirement. A whole multi-request command may take longer.

New leases default to **45 minutes**, with the existing two-minute expiry grace. Existing records retain their authored expiry; explicit 15–480 minute TTLs remain available. Renew at real execution checkpoints around every 10–15 minutes and before a long operation if necessary. Do not create an independent heartbeat process: it could keep a dead worker's lease alive. Silence alone never permits takeover. Freshness is an observation, not proof of responsiveness. Clock uncertainty must be resolved before overlap or publication.

Acquire/renew with recovery metadata:

```sh
node --import tsx scripts/project-claims.ts renew NODE --lease-id UUID --generation N --transport connector --bridge-dir /ABSOLUTE/PRIVATE/TEMP --branch work/example --checkpoint-evidence 'PR #123; owning result section Validation' --checkpoint-next 'Inspect CI, then merge' --checkpoint-blocker 'CI pending'
```

Evidence and next action must appear together. Store recoverable work on a pushed branch/draft PR or the owning durable result at meaningful boundaries. A scratch path is not a recovery record; a heartbeat or checkpoint is not evidence that an output is correct. Existing branch/PR/note fields remain usable for older records. Do not put credentials or private owner information in the public lease store.

After expiry plus grace, normal acquisition increments generation; it does not delete the previous branch. The replacement inspects and selectively reuses verified evidence. It must not overwrite a potentially still-running worker's branch: use its own branch. A returning original worker must re-read ownership before publishing and stop if superseded; it may offer its preserved work through the normal recovery path. Never renew or release another generation. Issue probes are durable requests, not delivered messages or guaranteed wakeups.

A lost write acknowledgement is reconciled by a single fresh read: only the exact intended record counts as confirmation. Otherwise the CLI reports the lease identity and unknown outcome, without replaying the write. Inspect remote state and any outstanding connector request before retrying. Never service a timed-out mailbox request later: that can still write an unwanted lease.

Immediately before merging a leased packet:

```sh
npm run control:merge-check -- NODE --transport connector --lease-id UUID --generation N --branch work/example --head FULL_VALIDATED_HEAD_SHA
```

Add `--format text` for a readable, evidence-bound REPORT; default output remains JSON, with additive publication context. The report explicitly leaves CI unverified and atomic fencing absent.

This checks local and fresh remote head identity, current main ancestry, then freshly re-reads the exact lease identity/generation and branch binding. It rejects grace, clock uncertainty and less than five minutes remaining. If renewal is needed after branch-local lifecycle was marked complete, renew from a clean current-main control checkout before final preflight. Merge immediately with the connector's `expected_head_sha` set to that same validated SHA; separately verify exact-head CI. On a delay, head/base change, expiry or takeover, repeat the preflight and relevant validation. No unattended lease may survive session end without explicit handoff.

This is a cooperative publication preflight, **not atomic fencing**: runtime claims and the GitHub merge are different operations. CI can become stale and cannot close that race by itself. A hard fence would require a single authorised merge gateway and repository permissions preventing bypass. That larger operational change is not claimed here. Do not describe a fresh preflight or a green historical CI check as an atomic lock.
