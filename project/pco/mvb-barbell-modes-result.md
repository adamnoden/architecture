# PCO-MODES — unified worker topology and gateway closeout

Owner-directed PCO packet, 30 October 2026, issue #1091. Scope: correct a missing PR binding in connector-only chat renewal, document the user's three execution arrangements, and prove that workers can switch between independently launched chats and a centrally coordinated group without a new ownership system.

## Result

- Existing `MVB/1` `renew` takes optional `pr` as a positive integer, not a fourth command. The handler retrieves the actual open GitHub PR and verifies the repository, main base, exact claim branch, and canonical `Work:` and `Lease:` declarations before passing `--pr` into `scripts/project-claims.ts`. A retry is considered reconciled only when both checkpoint and PR association match the live lease.
- Same PCO dispatcher and ACO lease generation across independent ordinary chats, independent Work chats, and one coordinator with parallel workers. Each worker claims its own packet. Coordinator-level reports are not packet ownership or an alternative queue. No topology mode, fleet registry or worker cap.
- Tests cover malformed and forged PR association, exact lease/branch declarations, concurrent independent acquisitions, occupied/live claims, expired/released recovery, returning coordinated workers, and manual gate exclusion. The test simulates claim transitions, not actual ChatGPT usage exhaustion.

## Boundaries

The gateway does not merge PRs. Existing full-health exact-head CI, fresh publication preflight and merge/reconcile semantics still govern integration. The command runner is not a ChatGPT host and does not restart sessions. Lease expiry is not proof of worker death; old generation publication remains forbidden. No new dependency or architectural maturity claim follows from this coordination fix.

## Integration evidence

Expected: PR with `Work: PCO-MODES` and exact lease generation, full repository health, current-main reconciliation, expected-head merge, release and cleanup. Record actual identifiers in the PR/issue. Version 1.4.0 is an additive, backwards-compatible gateway correction; no runtime claim migration.
