# SWE — Software reliability and efficiency

**Owner direction:** 31 October 2026. [Single workstream issue #1174](https://github.com/adamnoden/architecture/issues/1174) records the accepted software audit and its implementation. The canonical nodes in `project/control/nodes/software.ts` own execution state; this programme owns scope and acceptance. No separate issue queue or scheduler is introduced.

## Purpose and boundaries

Make the software that supports the owner's house enquiry more dependable: concurrent workers must recover from ordinary selection races, publication links must follow the actual website, and repeated setup/downloads must earn their cost. Preserve lease identity/CAS, explicit source authority, physical-proof obligations and retained historical evidence. A faster run is not permission to weaken a check.

The audit inspected source at `c9e9a2c0087ef4e18b5fa4527826767ba4f0c8bd`, recent Actions logs and targeted executable probes. Integration begins from current main and must reconcile concurrent work. Counts below are audit observations, not permanent project facts; proposed speed gains and engineer-hours were estimates.

## Accepted findings and bounded packets

| Packet | Findings and baseline evidence | Acceptance and owning result |
|---|---|---|
| SWE-CONTROL | **1.** A competing acquisition between list/read throws a generic error and aborts despite another available packet. **3.** At 89 records, one cold native listing makes 91 sequential HTTP requests; the gateway lists twice. | Typed selection conflict with bounded reranking; fail closed on other errors. Coherent immutable listing, bounded parallel reads and measured concurrency, preserving a fresh selected-record read and exact CAS. Result: `project/swe/control-result.md`. |
| SWE-PUBLICATION | **2.** 21 Primer pattern-index links and 10 Working Edition occurrences retain obsolete `/docs/` site routes. **6.** Seven pinned font/licence files are redownloaded every invocation from a disposable cache. **8.** Mermaid rendering rereads the original file and loses preceding in-memory transformations; no current production entry exercises this latent bug. | Reuse the canonical site route/exclusion resolver and verify the audited links. A persistent integrity-keyed cache avoids warm downloads and handles corrupt/partial entries. Render transformed content and prove adapter/frontmatter/figure changes survive. Reconcile actual PDF metadata and inspect affected output. Result: `project/swe/publication-result.md`. |
| SWE-AUTOMATION | **4.** Three of 53 sampled lease-triggered reports failed source freshness after main moved during setup. **5.** Sample report installed 943 packages in 20 seconds to produce a two-second briefing. **7.** A broadly triggered proof job rendered 48 PDFs across 16 families in 394 seconds. | Launch a fresh process from a coherent current-main snapshot with bounded source-drift retry, preserving the guard and handling dependency changes. Benchmark a trust/toolchain-scoped installed-dependency cache with a locked miss path; retain only an evidenced gain. Narrow expensive proof execution only for changes demonstrated irrelevant, with dependency-sensitive regressions and manual full replay. Result: `project/swe/automation-result.md`. |
| SWE-IDENTITY | **9.** Locale-sensitive canonical key sorting changes identical inputs' hashes between en-US and sv-SE; no current production mismatch was demonstrated. | Explicit locale-independent ordering, adversarial cross-locale tests and a controlled comparison of existing identities. Reconcile any legitimately changed algorithm versions, baseline fingerprints and generated outputs, with retained provenance. Result: `project/swe/identity-result.md`. |

All four implementation packets depend only on completed registration (SWE-PLAN) and may execute independently under separate leases and isolated branches. Shared package-script or generated-output edits must be coordinated and revalidated after integration. The coordinator closes #1174 only after all nine findings have an accepted disposition and all four results are on main.

## Registration and recovery

SWE-PLAN registers the workstream, this programme and its packets. The owner explicitly directed this new work, but the node does not yet exist on main. Under the existing runbook's exceptional bootstrap rule, the registration PR uses a create-if-absent SWE-PLAN lease with a recorded UUID/generation. Until registration merges, that unknown live claim can correctly inhibit new automatic dispatch. This temporary conservative effect is declared in #1174; no existing worker is displaced and no dispatcher/CI requirement is relaxed. Release the bootstrap lease immediately after registration.

For each implementation packet, preserve pushed branch/PR evidence and meaningful checkpoints, renew at execution milestones, run relevant local regressions, and establish canonical full repository health on the exact merged head. Fresh publication preflight, expected-head merge and prompt lease release remain required. A deferred or rejected optimisation needs evidence and a reason; an unmeasured hoped-for gain is not completion.

## Closeout

The owning result records must distinguish measured results from estimates, identify commands and fixtures used, list material limitations and any changed controlled baselines, and link integrated PRs. Final closeout verifies all nine acceptance conditions, generated projections, repository health, the parent issue, released leases and safely removed feature branches. No new external review requirement is introduced, and this software work grants no additional architectural claim authority.
