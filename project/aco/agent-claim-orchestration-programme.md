# ACO — Agent Claim Orchestration

**State:** authorised / bootstrap workstream  
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

The runtime branch is intentionally long-lived and must never be merged into `main`.

One file is reused per canonical node. Git history supplies the audit trail; no append-only heartbeat log is required.

### CAS property

The lease store relies on GitHub Contents API compare-and-swap behaviour:

- first acquisition is create-if-absent;
- subsequent acquisition/renew/release uses the exact current blob SHA;
- racing writes against the same prior record cannot both win;
- writes to distinct node files remain physically sharded.

Do not replace this with a single claims JSON, issue comments, labels, assignees or branch-name inference.

## Canonical node resolution

Every operation resolves aliases to a canonical PCO node before touching the lease store.

For example, `IAS-02O` and `OAS-02I` both resolve to `IAS-OAS-JUNCTION`, so they share one lease file and cannot be claimed independently.

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

ACO does not permit speculative reservations of blocked future work.

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
    "label": "optional session label"
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

`leaseId` is an accidental-collision token, not a secret.

## Time semantics

- default TTL: **120 minutes**;
- ordinary maximum TTL: **8 hours**;
- minimum TTL: **15 minutes**;
- expiry takeover grace: **2 minutes** for clock skew;
- renewals extend from renewal time;
- long tasks renew rather than request effectively permanent ownership.

Agents should renew at meaningful checkpoints and verify the lease again before final merge/handoff.

## Operations

### Acquire

1. resolve alias -> canonical PCO node;
2. confirm structural claimability on current `main`;
3. read canonical lease file from `runtime/claims`;
4. create generation 1 when absent;
5. reject a live existing lease;
6. replace a released/expired-beyond-grace lease using exact blob SHA and generation + 1;
7. on CAS conflict, refetch and treat the winning record as authority.

### Renew

- require matching node, generation and lease id;
- require current lease to remain claimed;
- update exact blob SHA;
- retain generation;
- advance heartbeat/expiry;
- if ownership changed, fail rather than resurrecting an old generation.

### Release

- require matching generation and lease id;
- update exact blob SHA;
- write `state: released`, `releasedAt` and reason;
- allow immediate subsequent acquisition.

### Force takeover

Exceptional owner/admin operation only.

It must require explicit force intent and a non-empty reason, use exact current SHA, increment generation, and record the superseded lease identity/holder/reason. Normal agents do not force active claims merely to avoid waiting.

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

## Branch / PR metadata

Branch/PR fields are discovery metadata only. Do not infer claim authority from branch names.

Branches can predate PCO, outlive sessions, contain exploratory work, or survive a crash. The lease record is authoritative for occupancy.

## STATUS boundary

Volatile claim occupancy must not be committed into `STATUS.md` on each heartbeat.

`STATUS.md` remains the generated structural projection and should label its READY frontier as **structurally ready**. It must point readers to a live ACO query before execution.

This avoids main-history spam, deploy churn, committed stale locks and runtime merge contention.

## Agent rule

For substantial work intended to produce durable/authoritative output:

```text
identify PCO node
  -> verify structural claimability
  -> acquire ACO lease
  -> execute
  -> renew when necessary
  -> verify lease before merge/handoff
  -> release
```

Read-only inspection that cannot collide with durable output does not need a lease.

## Guardrails

The implementation must prove at least:

- aliases and canonical id converge on one lease path;
- only ready/active nodes are normally claimable;
- live lease rejects a second normal acquisition;
- expiry + grace behaviour;
- release/reacquire increments generation;
- stale-SHA conflict has one winner;
- old generation cannot renew/release after supersession;
- force takeover is explicit/audited;
- malformed/unavailable lease state fails closed;
- live claim against a no-longer-claimable node is surfaced invalid;
- `.pco/claims/` files are forbidden on `main`;
- volatile lease expiry is not a blocking PR-CI quality gate.

## Packets

### ACO-00 — authority and lease model

Freeze the authority boundaries, claimability, schema, expiry, failure semantics and threat model.

### ACO-01 — runtime store and atomic protocol

Create `runtime/claims`; implement canonical alias resolution and pure lease transition rules; prove CAS expectations and claim-file validation.

### ACO-02 — live operational client/query

Implement an authenticated CLI/client for acquire, renew, release, force takeover and live operational frontier inspection. Keep the durable PCO status command network-independent.

### ACO-03 — repository integration

Update generated status language, agent constitution/control README, package commands and repository guardrails without making volatile claims a PR-CI timing dependency.

### ACO-04 — self-hosted adversarial closeout

Claim a real ACO node through the runtime store, exercise renewal/release or supersession, prove collision/failure cases, then close with only the intentionally retained `runtime/claims` branch.

## Exit gate

ACO closes when:

- ACO is registered and self-hosted in PCO;
- `runtime/claims` is a deliberately retained runtime branch;
- per-node CAS leases support acquire/renew/release/force-takeover safely;
- aliases cannot create duplicate ownership;
- operational scheduling cleanly distinguishes structural readiness from occupancy;
- substantial execution has a mandatory concise claim protocol;
- `STATUS.md` remains structural rather than volatile;
- unavailable/malformed lease state fails closed;
- tests cover collision, expiry, supersession and invalid-live-lease cases;
- one real ACO node is exercised through the lease mechanism;
- cleanup leaves no bootstrap branches/machinery beyond `runtime/claims`.

ACO closeout proves orchestration coherence only. It does not prove architectural quality, project completion, maturity or external evidence.