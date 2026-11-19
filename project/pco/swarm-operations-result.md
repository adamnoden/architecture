# PCO-SWARM — operating contract and run-report result

**Scope:** owner-directed improvements requested on 29 October 2026.  
**Result:** continuation, supported startup transport, proportionate validation guidance and a standard measured report are implemented. No architectural authority or maturity claim changes.

## Changes and owning sources

- Root `AGENTS.md` requires an evidenced stopping reason, continued dispatch after packet completion, honest progress/time reporting and validation proportional to the changed boundary.
- [Swarm runbook](../control/swarm-runbook.md) owns runtime/transport instructions, connector tool mapping, CI cadence, restart/cleanup duties and the standard user-facing report contract.
- `scripts/project-claims.ts` can select `--transport connector`; `project/control/git-connector-claim-store.ts` implements fresh Git reads and a bounded private mailbox to the session's authorised GitHub connector. Existing canonical dispatcher/store acquisition, CAS races, renewal, verification and release logic are reused. No token placeholder, HTTP interception, new scheduler or forced lease is added.
- `project/control/run-report.ts` and `scripts/swarm-run.ts` capture a main-source graph baseline and measured time, record merged packet identities, and produce before/after packet coverage, scope/requeue changes, session attribution, structural/live frontiers, manual gates, validation, lease/cleanup state and stop reason. Run journals stay outside the repository; durable work evidence remains in its owning result/PR.

## Progress semantics

Coverage means complete canonical packets divided by non-cancelled canonical packets. It is not effort complete, an ETA, architectural maturity or construction readiness. Shared nodes count once globally and in each owning stream; empty scopes are n/a. Added/cancelled/removed/reopened packets are explicit. Programme deltas may include other agents; this session's merge journal is separate. A later requeue invalidates the currently-complete shipment count without erasing the historical merge.

Captures and merge recording require current main and clean authoritative graph sources; unmerged lifecycle changes cannot inflate the report. The agent still verifies actual PR merged state and packet ownership; Git ancestry alone is not proof that a PR discharged a particular architectural obligation. No retrospective timing or absent live availability is invented.

## Validation and limitations

Local validation passed typechecking, all 58 then-current control tests (including 12 new adverse-case tests), repository/README command integrity and 1,018 automated tests in the canonical health run before the known executor browser singleton-socket restriction stopped browser figure validation. Parallel owner-house charter, graph and programme work was reconciled without replacing its decisions; affected control/source/build validation is repeated on that combined head, and exact-head CI must establish full repository/publication health before merge.

The new tests cover same-node CAS races, expected-SHA updates, malformed/duplicate/mismatched records, false success without a stored write, wrong replies, bounded mailbox timeout and retained unknown outcomes, scope growth/requeues, shared ownership, attribution, empty scopes, invalid timing, fabricated packet caps and explicit residue. A live connector-backed renewal of this execution's PCO-SWARM lease completed and verified against a fresh remote snapshot without CLI write credentials. Final lease release uses the same supported transport.

The Git transport uses observed local time, not a falsely claimed GitHub server clock; clock uncertainty near expiry must be resolved before acquisition. Connector availability/authentication and fresh Git reads remain real prerequisites. A mailbox timeout is an unknown remote outcome that must be reconciled by exact lease identity before retrying; it never establishes freedom. No unattended background executor is created.

## Closeout

Exact merge, CI and cleanup identities belong to the PR and live claim record. The finite owner assignment completes when its operating contract/tooling is integrated and verified; it does not declare the undirected project frontier empty. Future `swarm` sessions must continue while safe eligible work remains, or state the actual reason they cannot.
