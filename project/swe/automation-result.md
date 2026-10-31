# SWE-AUTOMATION — source-coherent and proportionate automation

**Direction:** the accepted [SWE programme](software-reliability-programme.md), findings 4, 5 and 7, under [#1174](https://github.com/adamnoden/architecture/issues/1174). Implementation: [PR #1181](https://github.com/adamnoden/architecture/pull/1181). This result changes software execution only; it grants no architectural, physical or regulatory claim.

## Source-coherent operations reports

The audit found three source-freshness failures among 53 sampled claim-push reports: main advanced after checkout, while dependency installation ran. The reporting process had already imported the old programme when its guard fetched newer main.

The hosted reporter now uses `scripts/fresh-operations-report.mjs`. It accepts only a clean disposable Actions checkout, fetches and selects an immutable main revision, then starts a **new Node process** to load the canonical programme and existing reporting guard. A guard failure is retried only when Git proves that main advanced from that source. There are at most three attempts. Dirty or divergent history, unrelated errors, unavailable claims and an exhausted retry bound remain failures. Successful diagnostics are preserved.

Changed package, lockfile or npm configuration inputs require a new locked install before reporting; a changed Node requirement requires a new job setup. The launcher imports no programme modules before selecting the source. The existing guard, source/current-main provenance, lease mutations and reconciliation rules are unchanged.

## Installed dependency cache: retained after measurement

Four existing trusted-main jobs share `.github/actions/control-runtime/action.yml`: operations reporting, completed-lease reconciliation, projection regeneration and the command gateway. The key includes OS, architecture, actual Node version, package/lock/npm configuration inputs and the action revision. Only an exact hit skips `npm ci`; partial or missing entries use the locked install. Default cache access remains unchanged. No second package or lockfile was introduced.

The action saves immediately after installation. A report can subsequently adopt a newer main lockfile, so a post-job save under the earlier key would be incorrect. The installed cache contains dependencies only; source reports, leases and credentials are not cached.

A temporary read-only PR workflow measured separate hosted runners and loaded the actual canonical control nodes after installation/restoration. It was removed from the final source. Evidence: [run 41239290959](https://github.com/adamnoden/architecture/actions/runs/41239290959), implementation checkpoint `3e55b1951889997015170d7e42ac788852b2408b`.

| Observation | Result |
|---|---|
| Cold setup, Node 24.22.1, job 124649588657 | 28 seconds for the composite action, including a 19-second locked install and 4.647-second cache save |
| First following runner, Node 24.22.0, job 124649729137 | Correct cache miss because the actual toolchain differed; its locked install and save completed, and the benchmark's expected-hit assertion failed |
| Matched warm rerun, Node 24.22.1, attempt 2, job 124650306112 | 7 seconds for the composite action; exact installed cache hit; 172 MB compressed archive restored; install and save skipped; all 148 canonical nodes loaded |

The matched **cache-population versus warm setup** comparison is 28 → 7 seconds, a 21-second/75% reduction including initial save overhead. The warm hit also avoided the measured 19-second installation. These are one matched hosted sample, not a claim that all CI or every future runner becomes 75% faster. Changed toolchains and manifests deliberately invalidate the cache. The measured gain warrants retaining it.

## Historical proof selection

The PLT owner-feedback workflow retains all **16 families and 48 PDF builds**. Its shared selector now has an explicit opt-in that skips compiler `*.test.ts` and `README.md` changes only within its three existing compiler input subtrees. Inspection of the preparation paths found those files are not rendering inputs; README provenance references remain references, not consumed text. Mandatory repository health still executes the tests and documentation checks.

Mixed fixture, renderer, font, specimen, dependency, runtime or unknown changes run the complete proof. Rename comparison retains both old and new paths, so moving a rendering input into a test filename cannot conceal its removal. Empty or unreliable change sets run the proof. Other specialised workflows retain their existing selection policy; manual invocations always replay the full family.

The audit's 394-second historical job is the work avoided by a correctly excluded change, not a newly measured runtime reduction. A skipped PR still runs the inexpensive scope job and mandatory full repository health.

## Validation and limits

- `node --import tsx --test project/control/automation.test.ts scripts/proof-scope.test.mjs`: 12 passing tests, including real temporary Git histories and separate child processes for source advances, changed dependencies, repeated movement, non-retryable errors, dirty checkouts and changed Node requirements. Only npm installation is a recording stub in those race fixtures; actual installation/restoration is covered by the hosted measurement.
- `npm run typecheck` and workflow syntax/execution-shape validation passed.
- Local `npm run check` passed its tests and source/publication contracts until browser figure validation reproduced the unchanged external-maintenance SVG label clipping under the local environment. The same failure was independently reproduced on untouched registration source; no SVG, tolerance or validation gate was changed. Required exact-head CI remains the complete publication and repository-health gate.
- The cache benchmark succeeded on its matched warm rerun; the initial patch-version miss is retained as invalidation evidence. Its temporary workflow is absent from the final tree. The remaining action is used by four maintained workflows.

Source freshness remains an observation at the recorded revision, not a lock preventing later main or lease changes. This launcher retries read-only reports only and does not weaken publication preflight, CAS or unknown-state handling.
