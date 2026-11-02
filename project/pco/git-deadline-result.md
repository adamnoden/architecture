# Bounded Git command deadline repair

## Question and authority

PCO-GIT-DEADLINE answers whether the canonical lease operations can tolerate measured proxy connection latency without weakening their freshness or publication checks. Owner-directed issue #1241 and the exceptional bootstrap decision in #953 authorise this bounded tooling packet. It introduces one manual node in the existing DAG, with PCO-SNAPSHOT as its prerequisite; no scheduler or architectural progress is introduced.

The measured transport diagnosis found a 26.365-second proxy CONNECT, 33 ms TLS, and 199/114 ms actual Git HTTP exchanges. Fresh ls-remote took 26.738/28.091 seconds and a runtime-claims fetch took 32.328 seconds. A fixed 30000 ms child-process deadline therefore rejected a working fresh transport. HTTP version tuning did not remove CONNECT latency.

## Change and limits

`project/control/git-command.ts` owns strict resolution of `ACO_GIT_TIMEOUT_MS`: absent means 30000 ms; an explicit decimal integer from 1 through 120000 ms is accepted; empty, nondecimal, fractional, zero, negative and over-limit input fails closed. The same runner applies it to claim snapshot fetch/tree/blob reads, canonical CLI startup/acquisition/publication Git, and swarm report Git. Operators may use 90000 ms for the measured environment.

Every existing fresh fetch, branch-specific immutable commit and blob capture, content validation, exact CAS, publication lease verification and runway check, and expected-head fence remains required. A longer individual command deadline does not guarantee total command duration or establish clock trust. TLS and proxy trust are preserved.

## Validation

The regression tests cover default/valid/invalid configuration and actual spawned Git running a bounded delayed alias: a short deadline times out and a larger bounded deadline succeeds. Existing FETCH_HEAD isolation, malformed snapshot, connector CAS, lease and publication failure checks remain in place. Local TypeScript checking and all 155 control tests passed, including existing snapshot/FETCH_HEAD, lease and publication failure coverage. `npm run check` reached `test:repo` and then the sandbox denied the tsx launcher IPC socket (`listen EPERM`); direct Node loader validation is recorded in the PR. Direct Node-loader repository integrity passed. The real canonical CLI with `ACO_GIT_TIMEOUT_MS=90000` passed publication preflight on implementation head `bd2e4f9095b53f648dae814bd454cbe22c898240`, observed at 2026-11-02T01:36:10.626Z; [PR evidence](https://github.com/adamnoden/architecture/pull/1242#issuecomment-6566996019) records the unchanged fresh reads and fencing boundaries.

The coordinator confirmed independent High review passed with no blockers and [exact implementation-head CI run 41373130393](https://github.com/adamnoden/architecture/actions/runs/41373130393) succeeded in every step. Those observations support the unchanged implementation, not an unrun check on a later commit. This closeout changes only lifecycle, owning evidence and generated projections; final-head exact CI and a fresh real configured canonical preflight remain pending merge gates. No final-head CI or merge is claimed here.

## Bootstrap and remaining gate

The node was absent from main when explicitly assigned. Before source mutation a canonical validated generation-1 lease was created only through the recorded connector-only exception, using exact runtime branch-head CAS and provider content reread. The record temporarily causes unknown-node dispatch safety to fail closed until the node registration reaches main. Connector calls are not canonical CLI execution. The candidate marks the bounded tooling packet complete on the strength of tested implementation and independent review. Completion becomes durable programme progress only after the verified main merge. The coordinator retains responsibility for final-head CI, fresh publication preflight, expected-head integration and subsequent lease/bootstrap-safety reconciliation.
