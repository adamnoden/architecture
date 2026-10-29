# Lease resilience result

## Question and authority

Owner-directed PCO-RESILIENCE, 29 October 2026, following a swarm stopped by unavailable native mutation credentials while sixteen structurally eligible packets remained. Starting authority: PCO-SWARM landed via #1013; registration commit c5ded9ca. The other session later released normally. Its lease was not the global blocker.

## Adversarial findings and decisions

- Ownership, recent heartbeat, responsiveness and recoverability are distinct. Expose age/expiry/checkpoint without inventing an alive/dead verdict or allowing silence-based theft.
- A two-hour default increases abandonment delay. New leases use 45 minutes plus unchanged two-minute grace; existing records and explicit longer operations retain their expiry. Checkpoint renewals around 10–15 minutes are cooperative guidance, not a watchdog. No detached heartbeat.
- Store a small optional evidence/next/blocker checkpoint in the existing lease, preserving old records. Durable pushed branches/results own recoverable output; never depend on another session's scratch files.
- Transport configuration can be checked without mutating leases, but actual write authorisation cannot be proved read-only. Doctor reports this distinction. Native HTTP and Git have bounded request/command waits.
- A timeout can occur after a successful write. Acquire, force, renew and release reconcile exact intended remote content once; no blind replay of an unknown outcome. Existing CAS contention/reranking rules remain unchanged.
- Returning workers must not publish after reassignment. Publication preflight binds generation, UUID, branch and validated remote/local head, reconciles current base ancestry and requires five minutes of live lease remaining. Grace is not publication permission. The final merge must also supply the same expected head SHA.
- A preflight is not atomic fencing. GitHub claim writes and merges cannot form one transaction here. A mandatory permission-controlled merge gateway would be needed to close that final race. Adding a status check alone would create false assurance; no gateway or write-enabled workflow is introduced.
- Recovery uses a replacement branch and existing provenance, not deletion or overwriting of the silent worker's files. A probe does not imply delivery, and no second queue/messaging service is added.

## Verification and limits

Independent regressions cover ghost identity rejection after expiry/reacquisition, expiry grace and publication runway, branch mismatch, clock uncertainty, malformed chronology/checkpoints, checkpoint survival through renewal, shorter defaults without silence-based takeover, and lost acknowledgements for acquire/renew/release without duplicate writes. All project-control tests and TypeScript checks pass locally. Full repository health and exact-head PR CI are required before merge; CI does not prove responsiveness, physical adequacy or atomic exclusion.

No architectural scope or maturity claim changes. Main reconciliation owns generated projections. Closeout requires verified merge, lease release and deletion of this packet's merged branch; execution identities are recorded on the PR and owning issue.
