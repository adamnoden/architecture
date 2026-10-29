# MVB versions and compatibility

This file owns the **Minimum Viable Bureaucracy operating-contract version**. The [manual](README.md) is the current integrated explanation; executable sources and the [runbook](swarm-runbook.md) retain their existing authority.

## Current: 1.1.0 — 29 October 2026

Additive communication discipline and evidence-bound publication reporting. The [phrasebook](communications.md) owns concise message meanings, selective readback, explicit correction, stale/duplicate-message handling and observed handoff progress. Labels are optional; clear English and existing workers remain valid. No new permission round trip, message transport or task state is introduced.

`merge-check` keeps its default JSON and original top-level fields, adds a `publication` observation (repository, branch, head, immutable observed main, claim blob SHA, CI not checked, no atomic fence), and supports explicit `--format text`. Both renderings use the same checked result. Ancestry checking and reporting bind the same captured main SHA; ownership is re-read after Git checks.

Starting deployment: [080ca3b5](https://github.com/adamnoden/architecture/tree/080ca3b5e2213d126f1440171ad47a0919a70b45/project/control), followed by the PCO-COMMS registration. The commit introducing this release identifies its exact implementation; the [result](../pco/mvb-communications-result.md) and owning PR record validation and integration evidence. This version claims compatible reporting/communication improvements, not measured throughput, assured message delivery or permission-enforced fencing.

Compatibility: existing claim and connector `schemaVersion: 1` records are unchanged. `verify` stays unchanged; default JSON consumers retain their fields. No persisted state migration, permissions, workflows, dependencies or new service. Rollback restores the previous code without claim migration; retain accepted provenance and existing safety checks. Regression tests cover rejected publication paths and observation identity; exact-head CI is required before merge.

## 1.0.0 — 29 October 2026

First explicit version of the existing GitHub-backed, cooperative coordination system. This is a baseline and adoption-policy release, not a new scheduler or a claim of complete fault tolerance.

The previously deployed implementation and named manual are recoverable at [f75668d39bdebb389b12721c28230549566bf8b9](https://github.com/adamnoden/architecture/tree/f75668d39bdebb389b12721c28230549566bf8b9/project/control). The commit introducing this release record adds the external-platform assessment and the compatibility/adoption policy below. Its Git history identifies that documentation delta; no release tag or separately published package is implied.

Included contract:

- PCO workstreams, canonical packets/aliases, dependency-derived readiness and manual dispatch boundaries.
- ACO per-node leases, UUID/generation ownership, expiry/grace, exact-version CAS, recovery checkpoints and bounded failure handling.
- Native API and Git/connector transports sharing one retained `runtime/claims` store.
- Cooperative publication preflight, exact-head CI, PR provenance and conservative post-merge release.
- Derived status and operational reports, separate from evidence maturity and architectural authority.
- One authoritative plan and one execution-ownership authority per packet; replacement components must earn their cost through deletion or a demonstrated execution improvement.

Compatibility: claim records remain `schemaVersion: 1`; connector requests/replies remain `schemaVersion: 1`. No runtime records, commands, node IDs, branch names, permissions or workflows are migrated by this release. Existing sessions continue through their normal freshness checks. There is no new runtime version handshake.

Known limits include unobservable independent chat-session liveness, cooperative rather than permission-enforced merge fencing, executor-clock fallback, and no persistent worker supervisor. See the [failure boundaries](README.md#failures-recovery-and-limits). Version 1.0.0 does not erase those limits.

## What gets a version

Version the shared operating contract, not every task, node edit, research result, report snapshot or generated status update. This is a repository-owned system version, independent of the house/book, root npm package, individual wire schemas and third-party product versions. A release number does not establish compatibility by itself.

| Change | Version rule | Required record |
|---|---|---|
| Correction preserving documented contracts, including a compatible bug fix | Patch | Fault/correction, affected checks and any recovery action |
| Additive capability that preserves existing valid readers, workers and ownership semantics | Minor | Capability, evidence, supported combinations and rollback |
| Incompatible ownership, storage, dependency/completion semantics, CLI/wire contract, or authority cutover | Major | Migration and cutover plan, old-worker handling, rollback boundary and validation |

Documentation clarifications can be committed without a release when they change no contract. A change that invalidates an existing legitimate worker is not merely additive because the JSON still parses. Resolve compatibility from behaviour and supported deployment combinations.

Each future release records its date, immutable source baseline, changes, independent schema versions, migration/no-migration decision, validation and limits here. Do not edit an old version to claim a newly deployed capability. Retain corrections explicitly in history. Create a tag only when it is useful and actually publish/verify it before referring to it.

## Replacement and cutover rule

The [external-platform assessment](../pco/mvb-platform-review.md) records the first build-versus-adopt decision. Prefer an existing component when it removes owned machinery or demonstrates a material improvement in verified delivery. Do not create a generic framework or integration wrapper before a real trial earns it.

A platform may have internal execution state without becoming a competing project plan. A read-only projection or derived, immutable execution assignment is legitimate; a second independently editable dependency/lifecycle database is not. During a trial, each packet has exactly one execution-ownership authority. Do not require two unrelated locks and call their uncoordinated combination safe.

Before replacing a live authority: pause new acquisition for the affected scope, settle or explicitly hand off every current lease/worker and uncertain write, preserve IDs/dependencies/manual gates/evidence, test the candidate, then switch the designated writer and retire the replaced paths. Old workers must fail publication or terminate; a version string alone cannot fence them. Preserve runtime history and accepted provenance. Do not delete `runtime/claims` as routine migration cleanup.

Rollback may restore the old owner only after candidate workers and pending effects are positively settled. If both sides may still publish, remain paused and reconcile; do not restart the old dispatcher merely because the new one failed.
