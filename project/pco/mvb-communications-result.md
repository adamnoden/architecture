# MVB communication discipline and scoped preflight reporting

Owner-directed PCO-COMMS, 29 October 2026, after the MVB 1.0 baseline and platform assessment. The owner requested a hardened implementation of the aviation-inspired, human-readable coordination proposal. This packet improves safe continuation/integration of house work; it does not redesign the house, scheduler or architecture authority.

## Red team and decisions

| Failure in the initial idea | Distilled implementation |
|---|---|
| Formal words sound like a new authority | Markers describe messages only; permissions, source authority, canonical acquisition and fresh checks remain controlling |
| RECEIVED becomes acceptance or completion | Separate delivery, understanding, intention, permission, action and result; use only acknowledgements that add information |
| A coordinator becomes a compulsory tower | Keep self-service dispatch. No extra permission round trip, persistent controller or single coordinator dependency |
| Readback becomes two agents parroting an error | Select critical facts and check current evidence. Deterministic comparisons retain the machine boundary |
| Every message becomes a ceremony or rigid DSL | Eight optional markers, clear English accepted, one concise result permitted, no conversational parser or message store |
| Handoff wording invents a targeted atomic transfer | Offered/parked/successor-acquired describe actual progress. Existing release/acquire controls ownership; silence cannot retain unattended leases |
| Old reports become reusable clearance | Preflight output binds observed target/base/claim/time and names unperformed CI and absent atomic fencing |
| Main changes between ancestry checking and printing | Capture an immutable main SHA and use it for both check and observation; still disclose later movement/races |
| New format breaks current workers | Existing default JSON/top-level fields and `verify` stay stable; additive publication details, explicit `--format text` opt-in |
| New language becomes another editable task graph | No new stored lifecycle, lease/wire fields, authority, workflow, worker host or external service |

The owning [phrasebook](../control/communications.md) covers message meanings, minimal identity/intent/evidence/next, correction, stale/duplicate messages, honest waiting, scoped handoffs and publication evidence. It retains primary source links and makes adaptation rather than standards compliance explicit. The integrated manual and startup runbook link it; the measured final-run report remains authoritative for session accounting.

Executable work extracts the existing merge-check orchestration into `project/control/publication-preflight.ts`. It retains early ownership verification and all existing tracked-tree/branch/head/ancestry/final-lease/runway checks. It returns the old identity/time fields plus the scoped observation. Both JSON and readable text use that one result; formatting cannot bypass verification. No request/receipt/acceptance parser is introduced. Existing lease and connector schemas remain version 1. MVB's additive operating release is 1.1.0.

## Verification and limits

Adversarial tests exercise final-observation generation/UUID/branch changes, released ownership, insufficient runway, clock uncertainty and store failure; dirty tracked trees, remote/local head mismatches and rejected ancestry; invalid target identities before network access; final observation timing; exact captured-main identity during a simulated moving ref; and explicit CI/fence limits in the readable report. These are executable boundary tests, not tests of prose matching a preferred style.

Local validation passed: 88 control/selection/workflow tests, TypeScript, all 54 workflow syntax/basic-shape definitions, repository integrity and the acyclic 124-node control/evidence validator. Exact-head full CI remains required before integration; the PR records that result. Existing maturity freshness signals are separate evidence obligations and are not reassessed by this infrastructure packet. Browser/publication validation uses exact-head CI where the local runtime cannot provide it.

The tests establish these finite code paths, not hostile-writer fencing, reliable inter-chat delivery, human comprehension, faster throughput, or a live successor takeover. The real final integration uses the new text preflight after exact-head CI, providing a native read-path observation; it does not test every platform outage or assert atomic merge authority. Chat messages remain untrusted evidence outside the instruction/authority hierarchy. Production claim/wire records are not migrated, and an older worker using clear English/default JSON remains valid.

Rollback can revert these additive source/docs changes without migrating runtime records. Keep unrelated main work, retained runtime history, accepted evidence and the release record's correction history. Do not remove the existing preflight checks, reinterpret an old report as current, or delete runtime/claims.
