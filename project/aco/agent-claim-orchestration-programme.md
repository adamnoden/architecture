# ACO — Agent Claim Orchestration

**State:** complete / self-hosted claim orchestration  
**Issue:** [#960](https://github.com/adamnoden/architecture/issues/960)  
**Date:** 2026-10-28

## Purpose

ACO adds an ephemeral, race-safe execution-claim layer over the PCO DAG so multiple agents can coordinate work without contaminating durable project-control state.

The governing distinction is:

> **PCO says whether work may run. ACO says whether somebody currently owns the right to run it.**

Claims are coordination metadata. They are not architectural authority, evidence, maturity, completion state or security credentials.

## Authority model

The system has three deliberately separate layers:

1. **PCO on `main`** — canonical workstreams, nodes, dependencies and durable lifecycle.
2. **ACO lease store** — live per-node lease records on a dedicated runtime branch.
3. **Operational scheduler** — derived at read time from PCO + ACO + current UTC.

Do not collapse these layers into one status enum or one committed Markdown surface.

## Why claims are leases

A permanent `claimed` flag would reproduce the stale-state problem PCO was built to eliminate. Sessions crash, browsers disappear, Codex jobs terminate and branches can outlive the work that created them.

ACO therefore uses expiring leases with explicit renewal and release.

Persist only deliberate lease state (`claimed` or `released`). **Expiry is derived from time.**

## Runtime store

Canonical runtime branch:

`runtime/claims`

Canonical per-node path:

`.pco/claims/<CANONICAL_NODE_ID>.json`

The runtime branch is intentionally long-lived and must never be merged into `main` or deleted during ordinary source-branch cleanup.

One file is reused per canonical node. Git history supplies the audit trail; no append-only heartbeat log is required.

### CAS property

The lease store relies on GitHub Contents API compare-and-swap behaviour:

- first acquisition is create-if-absent;
- subsequent acquisition/renew/release uses the exact current blob SHA;
- racing writes against the same prior record cannot both win;
- writes to distinct node files remain physically sharded.

Git branch heads are shared even when claim files differ, so a write conflict is classified by refetching the target node file. If its blob SHA is unchanged, the conflict can be boundedly retried as unrelated branch-head movement. If the node file itself changed, the competing lease mutation won and the stale writer must stop.

Do not replace this with a single claims JSON, issue comments, labels, assignees or branch-name inference.

## Canonical node resolution

Every normal operation resolves aliases to a canonical PCO node before touching the lease store.

For example, `IAS-02O` and `OAS-02I` both resolve to `IAS-OAS-JUNCTION`, so they share one lease file and cannot be claimed independently.

Release and diagnostic reads deliberately retain a narrow recovery path for an orphaned canonical key after a node has been removed from PCO. Historical aliases cannot be reconstructed once their canonical mapping disappears, so recovery requires the canonical node key.

## Claimability

Normal claims are allowed only for structural PCO state:

- `ready`;
- `active`.

Normal claims are rejected for:

- `blocked`;
- `held`;
- `done`;
- `cancelled`;
- unknown/deleted nodes.

ACO does not permit speculative reservations of blocked future work. If two activities are independently executable, they should be represented as separate PCO nodes rather than pre-claiming future work.

## Lease record v1

A claim record contains at least:

```json
{
  "schemaVersion": 1,
  "node": "IAS-00",
  "generation": 3,
  "state": "claimed",
  "leaseId": "uuid",
  "holder": {
    "kind": "chatgpt",
    "label": "optional operational session label"
  },
  "claimedAt": "2026-10-28T22:40:00Z",
  "heartbeatAt": "2026-10-28T22:40:00Z",
  "expiresAt": "2026-10-29T00:40:00Z",
  "branch": "optional/work-branch",
  "pr": null,
  "note": "optional bounded purpose"
}
```

Released records keep the same generation and add `releasedAt` plus a bounded release reason.

A new acquisition after release/expiry increments `generation` and creates a new `leaseId`.

`leaseId` is an ownership/collision token, not a secret authentication credential.

### Runtime metadata boundary

`runtime/claims` is coordination metadata visible to repository collaborators and, for a public repository, potentially public. Holder labels, branch names and notes must therefore be operational and non-sensitive.

Do not place secrets, credentials, private personal data, confidential information or hidden reasoning in claim records.

## Time semantics

- default TTL: **120 minutes**;
- ordinary maximum TTL: **8 hours**;
- minimum TTL: **15 minutes**;
- expiry takeover grace: **2 minutes** for clock skew;
- renewals extend from renewal time;
- long tasks renew rather than request effectively permanent ownership.

The GitHub client prefers GitHub server time from the response `Date` header when evaluating live records. Grace is a boundary safeguard, not permission to rely on inaccurate local clocks.

Agents should renew at meaningful checkpoints and verify the lease again before final merge/handoff.

## Operations

### Acquire

1. resolve alias -> canonical PCO node;
2. confirm structural claimability on current `main`;
3. read canonical lease file from `runtime/claims`;
4. create generation 1 when absent;
5. reject a live existing lease;
6. replace a released/expired-beyond-grace lease using exact blob SHA and generation + 1;
7. on CAS conflict, refetch and distinguish unrelated branch-head contention from a real same-node winner.

### Verify

Verification is deliberately occupancy-only:

- require matching lease id and, where supplied, generation;
- require state `claimed`;
- require temporal state `live` or grace;
- do not silently turn ACO into a second PCO structural validator.

PCO and merge validation remain the independent authority for durable structural correctness.

### Renew

- require matching node, generation and lease id;
- refuse renewal when the caller's PCO graph says the node is no longer `ready`/`active`;
- require current lease to remain claimed;
- update exact blob SHA;
- retain generation;
- advance heartbeat/expiry;
- if ownership changed, fail rather than resurrecting an old generation.

### Release

- require matching generation and lease id;
- update exact blob SHA;
- write `state: released`, `releasedAt` and reason;
- allow immediate subsequent acquisition;
- remain possible for a canonical orphaned lease even if its node has subsequently left the graph.

### Force takeover

Exceptional owner/admin operation only.

It requires explicit force intent and a non-empty reason, uses exact current SHA, increments generation, and records the superseded lease identity/holder/reason. If the record changes while takeover is being decided, stop and inspect the new holder rather than blindly overwriting it.

Normal agents do not force active claims merely to avoid waiting.

## Operational derivation

Keep PCO and ACO dimensions orthogonal.

Examples:

- PCO `ready` + no live lease -> **available**;
- PCO `ready` + live lease -> **claimed**;
- PCO `active` + no live lease -> **active / unclaimed handoff candidate**;
- PCO `active` + live lease -> **active / claimed**;
- blocked/held/done/cancelled + live lease -> **invalid live-lease condition**.

An unreadable/malformed lease record is an **unknown/coordination fault**, never equivalent to unclaimed.

## Failure semantics

ACO fails closed where occupancy cannot be established safely.

If `runtime/claims` is unavailable, a record is malformed, or a race-safe write cannot be made, do not reinterpret the node as available.

If GitHub is unavailable, PCO structural state remains valid but new collision-prone authoritative work should not start without explicit owner direction.

An active lease on a node that later becomes blocked, held, done or cancelled is surfaced as invalid coordination state. It cannot be renewed but remains releasable.

## Branch / PR metadata

Branch/PR fields are discovery metadata only. Do not infer claim authority from branch names.

Branches can predate PCO, outlive sessions, contain exploratory work, or survive a crash. The lease record is authoritative for occupancy.

A claim may be acquired before its work branch exists and enriched on renewal once branch/PR metadata becomes known.

## STATUS boundary

Volatile claim occupancy must not be committed into `STATUS.md` on each heartbeat.

`STATUS.md` remains the generated structural projection and labels its READY frontier as **structurally ready**. It points readers to the live ACO query before execution.

This avoids main-history spam, deploy churn, committed stale locks and runtime merge contention.

## Agent rule

For substantial work intended to produce durable/authoritative output:

```text
identify PCO node
  -> verify structural claimability
  -> query live occupancy
  -> acquire ACO lease
  -> execute
  -> renew when necessary
  -> verify ownership before merge/handoff
  -> merge / record durable result
  -> release
```

Read-only inspection that cannot collide with durable output does not need a lease.

Normal agents must not force-take live claims. If the store cannot be read safely, new collision-prone work fails closed.

## Guardrails

The implementation proves at least:

- aliases and canonical id converge on one lease path;
- only ready/active nodes are normally claimable;
- live lease rejects a second normal acquisition;
- expiry + grace behaviour;
- release/reacquire increments generation;
- stale-SHA same-node conflict has one winner;
- unrelated branch-head contention can be distinguished and boundedly retried;
- old generation cannot renew/release after supersession;
- verification proves occupancy without replacing structural validation;
- force takeover is explicit/audited and refuses to overwrite a lease that changed mid-decision;
- malformed/unavailable lease state fails closed;
- live claim against a no-longer-claimable node is surfaced invalid and cannot renew;
- orphaned canonical leases remain releasable;
- `.pco/claims/` runtime files are forbidden on source branches;
- volatile lease expiry is not a blocking PR-CI quality gate.

## Packets

### ACO-00 — authority and lease model

Freeze the authority boundaries, claimability, schema, expiry, failure semantics and threat model.

**State:** complete.

### ACO-01 — runtime store and atomic protocol

Create `runtime/claims`; implement canonical alias resolution and pure lease transition rules; prove CAS expectations and claim-file validation.

**State:** complete.

### ACO-02 — live operational client/query

Implement an authenticated client for acquire, verify, renew, release, force takeover and live operational frontier inspection. Keep the durable PCO status command network-independent.

**State:** complete.

### ACO-03 — repository integration

Update generated status language, agent constitution/control README, package commands and repository guardrails without making volatile claims a PR-CI timing dependency.

**State:** complete.

### ACO-04 — self-hosted adversarial closeout

Claim a real ACO node through the runtime store, exercise real renewal, protect the closeout through merge, release afterwards, and prove the collision/failure cases.

**State:** complete in the durable closeout source; final lease release follows the closeout merge. Detailed evidence: [`aco-04-adversarial-closeout.md`](aco-04-adversarial-closeout.md).

## Self-hosting result

ACO-00 through ACO-03 were merged through #962 as `b812b0364b3bb9fe0e8d7e111f71a1ab2936d06f` after the complete repository/publication gate passed. Main projection reconciliation then exposed ACO-04 as structurally ready.

ACO-04 used ACO itself before starting its final branch:

- generation 1 lease acquired on `runtime/claims` as `bb5dda08-87a8-4119-a91a-255b80fe42de` at `2026-10-28T22:59:13Z`;
- acquisition runtime commit: `0378cff4f022c60a21b15762af0d2058fbe6a81e`;
- only then was `work/aco-closeout` created;
- the same generation/lease was renewed at `2026-10-28T23:00:51Z`, gaining branch metadata and expiry `2026-10-29T01:00:51Z`;
- renewal runtime commit: `fd75e71ff9d383384e35742873851b57ee5377b2`.

The live lease remains deliberately held until the validated closeout reaches `main`; release is the final runtime action, not a prerequisite source mutation.

## Exit gate

ACO closes when:

- ACO is registered and self-hosted in PCO;
- `runtime/claims` is a deliberately retained runtime branch;
- per-node CAS leases support acquire/verify/renew/release/force-takeover safely;
- aliases cannot create duplicate ownership;
- operational scheduling cleanly distinguishes structural readiness from occupancy;
- substantial execution has a mandatory concise claim protocol;
- `STATUS.md` remains structural rather than volatile;
- unavailable/malformed lease state fails closed;
- tests cover collision, expiry, supersession, orphan recovery and invalid-live-lease cases;
- ACO-04 has exercised a real acquisition and renewal, with final release due only after the closeout merge;
- cleanup leaves no bootstrap source branches/machinery beyond the intentionally retained `runtime/claims` infrastructure branch.

ACO closeout proves orchestration coherence only. It does not prove architectural quality, project completion, maturity or external evidence.