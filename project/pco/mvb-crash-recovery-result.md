# MVB crash recovery and regular-chat execution result

## Question and authority

Owner-directed PCO-CRASH, 30 October 2026; implementation issue #1083. After the 29 October Zerg rush exhausted ChatGPT Work usage, four worker leases were later released while draft PRs #1078–#1081 remained incomplete. The question was whether the existing MVB could recover safely after a process vanishes without a final handoff, and whether an ordinary ChatGPT session can work without GitHub CLI network access.

## Red-team findings

1. Lease expiry means only lost permission, **not** confirmed process death. Existing 45-minute TTL, two-minute grace, generation, CAS and publication preflight are retained.
2. The canonical dispatcher already reclaims expired/released *planned* nodes. It intentionally excluded `active-unclaimed` nodes, including those with preserved branch/checkpoint evidence.
3. Reacquisition previously replaced the per-node claim record without carrying a bounded predecessor pointer. Although history is retained in Git, a new worker dying immediately after acquisition could lose convenient recovery provenance.
4. Claim stores, PRs, source branches and chat journals contain different truths. A released claim is not a merged PR, a pushed draft is not a validated result, and a local-only journal is not durable after execution loss.
5. This regular-chat execution environment could read/write GitHub through the connector, but `git ls-remote` could not resolve github.com. Such an environment must not pretend to have run a local dispatcher or exact-head publication preflight.

## Implemented scope

- `claims.ts`: new **optional** `predecessor` evidence identity on a next-normal-acquisition generation. It records the prior UUID/generation, branch/PR and checkpoint; no prior checkpoint is copied to the successor's own `checkpoint`. Malformed, future/self predecessor identities fail parsing. Reusing the predecessor branch is rejected where both branches are given.
- `dispatch.ts`: guarded started-node recovery through **the existing self-service dispatcher**, only if a prior non-occupying claim has a branch plus evidence/next checkpoint. Manual and evidence-free active nodes remain outside automatic dispatch. Existing critical-depth and relief ranking remains intact.
- `claim-store.ts`: recheck active recovery evidence after candidate selection, immediately at store acquisition. If evidence was altered between dispatch snapshot and claim, treat it as a selection race and rerank, without issuing a mutation for that node.
- `operations.ts`: additive read-only recovery fields and a human-facing report distinguishing candidate predecessor evidence, active nodes needing review, and observed unmerged PRs. Missing claims or PR evidence stays unknown.
- Tests cover predecessor history, stale IDs, old schema compatibility, same-branch rejection, guarded active resume, manual/evidence-free exclusion, a lost-evidence selection race, and report truth boundaries.
- MVB manual, runbook and root agent constitution distinguish **full dispatcher runtime** from **connector-only owner-directed capability**. This is one GitHub authority, not a second task queue.

## Limits and deliberate rejections

- No autonomous restart of a ChatGPT session, always-on heartbeat process, independent scheduler, new database, automatic force-takeover or speculative attribution of expired wall time.
- Connector-only sessions do **not** have general undirected self-service dispatch merely because they can edit repository files. Direct owner assignment requires fresh canonical main/claim checks, exact-blob CAS and subsequent capable CI/preflight. If those cannot be proved, keep work unmerged.
- No permission-enforced atomic merge fence: the existing fresh lease/head preflight is cooperative. CI checks exact head but is not itself the claim-and-merge transaction.
- No claim that older PRs were completed by releasing leases or that prior research is correct merely because it survives remotely.

## Validation and integration boundary

Tests are in `claims.test.ts`, `dispatch.test.ts`, `operations.test.ts`. Require `npm run test:project-control`, `npm run check`, current-head CI and final lease-bound merge preflight before claiming the release shipped. Actual manual use of a GitHub connector in this session is a constrained-mode exercise, not a proof of fully automated connector-only self-service. The release is additive to existing claim schema version 1; no bulk runtime migration is expected. Previously stored claim records remain valid.

No architectural maturity, physical evidence or construction authority is advanced by this PCO change.
