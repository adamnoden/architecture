# SWE-CONTROL — Selection races and coherent lease reads

**Scope:** findings 1 and 3 of the [software reliability programme](software-reliability-programme.md), directed through [SWE #1174](https://github.com/adamnoden/architecture/issues/1174). Implementation baseline: `1378e249` on current main. This changes coordination behaviour and its tests; it changes no architectural source, claim ceiling or physical-proof requirement.

## Result

A competing live or grace lease appearing between dispatcher listing and acquisition now raises a typed occupancy conflict. The dispatcher refreshes the inventory and reranks within its existing selection-race limit. If no eligible packet remains, it returns that empty frontier without a write. Unavailable reads and other errors still fail closed; the dispatcher does not retry arbitrary failures.

Native GitHub claim listings now capture one runtime-branch commit, list the claim directory at that immutable revision, and fetch the listed blobs by SHA with at most eight concurrent readers. Each decoded blob is checked against its Git identity and expected node. Output order follows the captured inventory, not response completion order. Malformed JSON, invalid paths/identities, duplicate nodes, missing blobs and content mismatches reject the entire listing. A directory response reaching GitHub's 1,000-entry limit is rejected because completeness is not established.

The observation time is the captured branch response time, with the existing explicit local-clock fallback. It is not represented as a fresh observation at completion of every later HTTP request. The selected node is still read freshly before acquisition, and the existing exact per-file SHA, UUID/generation, temporal and uncertain-write rules remain in force. No cross-command snapshot cache or new coordination store is introduced.

The live dependency-graph command now uses the same native store instead of maintaining a second serial HTTP reader. Its current-main guard and Mermaid rendering are unchanged.

## Evidence and measured effect

| Boundary | Before | After / evidence |
|---|---|---|
| Competitor between list and read | Generic error aborts despite a second eligible packet | Live and grace fixtures select the alternative, retain the competitor and perform exactly one successful write |
| No alternative after a race | Aborts with generic occupancy error | Refreshed empty frontier, one selection race, no mutation |
| Persistently stale selection | Earlier read-stage error bypasses retry classification | Existing bound enforced; a one-retry fixture stops after two conflicts with no mutation |
| Native 89-record cold listing | 91 serial HTTP requests | 91 requests remain; measured maximum of eight simultaneous blob reads and twelve blob waves plus two snapshot requests |
| Mutable branch during listing | Separate file reads can observe different revisions | All listed blobs come from the captured commit; a subsequent direct read and a second listing observe the newer generation |
| Acquisition after snapshot movement | Fresh read/CAS is required | Fixture advances from an expired generation 1 snapshot to a released generation 2 record; acquisition uses that record's SHA and creates generation 3 |

The concurrency measurement uses a deterministic mocked HTTP transport with the audit's 89-record fixture. Its fourteen dependency rounds versus ninety-one serial requests represent approximately 85% fewer sequential rounds under the fixture's uniform completion model. This is **not a measured production elapsed-time speedup or API-quota saving**. The gateway's separate reconciliation and dispatcher listings remain separate fresh observations.

## Validation

- `node --import tsx --test project/control/claims.test.ts project/control/claim-store.test.ts project/control/dispatch.test.ts project/control/github-claim-store.test.ts` — the initial focused run passed 64 tests, including the original lost-write/CAS and recovery regressions.
- `npm run test:project-control` — the full control suite passed 139 tests before the additional malformed branch/directory JSON cases.
- `node --import tsx --test project/control/github-claim-store.test.ts` — the final transport boundary passed 22 tests, including malformed JSON classification and null branch payloads.
- `node node_modules/typescript/bin/tsc --noEmit` — passed after consolidating the graph reader.
- `node --import tsx scripts/project-control-graph.ts` — static graph generation passed; `git diff --check` passed.

Canonical full repository health is established by the implementation PR's exact-head CI before merge. Local verification above is bounded to the changed coordination and graph interfaces; it does not replace CI or demonstrate architectural adequacy. Integration and final closeout are tracked by [SWE #1174](https://github.com/adamnoden/architecture/issues/1174).

## External API contract

The implementation uses GitHub's documented [branch identity](https://docs.github.com/en/rest/branches/branches#get-a-branch), [commit-specific contents lookup and directory limit](https://docs.github.com/en/rest/repos/contents#get-repository-content), and [SHA-addressed base64 blob response](https://docs.github.com/en/rest/git/blobs#get-a-blob). It does not widen repository permissions or alter write authentication.
