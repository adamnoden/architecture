# Native project operations integration

## Scope and starting authority

Owner-directed PCO-OPERATIONS, 29 October 2026, after lease resilience #1015. Registration: 126549cd. This work improves how agents recover programme state, validate coordination contracts and close routine leases. It does not redesign the scheduler, house or architectural authority.

## Decisions and adversarial boundaries

1. One briefing derives canonical dispatcher order, lease freshness/recovery pointers, invalid state, manual gates and open PR heads. Unknown claim/PR sources remain explicit, not empty frontiers. The current-main CLI and GitHub Actions JSON/Markdown snapshots share the renderer. Reports record source revision and observation time; they do not assert continuous presence, CI readiness or effort completion.
2. A PR packet contract binds Work declarations to canonical nodes and current lease UUID/generation, branch and PR association. Explicit non-packet exemptions require a reason and cannot alter node sources. CI is an observation, not final permission; the existing publication preflight remains necessary.
3. Thirteen package-triggered specialised proof workflows share a no-dependency, conservative selector. Only coordination sources and control npm commands can earn a skip. Unknown/shared inputs, lockfiles, dependencies, other npm commands and selector/workflow changes run proofs. Both sides of renames remain visible. Manual dispatch runs proofs. Full repository health always runs. This is a narrow optimisation, not an inferred universal impact graph; no arbitrary graph of software dependencies is introduced.
4. Native API claim transport is extracted unchanged from the CLI into one reusable store; connector and native clients retain the same canonical CAS protocol. No extra token, service or authentication route is introduced.
5. Trusted-main post-merge reconciliation runs after projection completion, avoiding a race with its source updates. It releases only terminal-node claims with matching merged main PR provenance, exact identity/generation and normal CAS. Main movement or concurrent replacement retains the lease and reports why. Missing provenance remains visible. It does not acquire work, force takeover, edit lifecycle, close parent issues or delete branches. Existing GitHub branch deletion and branch audit retain those roles.
6. Operations reporting follows reconciliation, including when reconciliation fails, and also refreshes on claim-branch pushes. Separate concurrency by source branch prevents a pending claim report from displacing a main closeout. No independent renewal daemon or new message bus is added. Reports are downloadable artifacts and job summaries, linked from generated status and agent entry points.

## Verification and limits

Adversarial regressions cover missing/duplicate declarations, superseded identity/generation, wrong PR branch, explicit exemptions, unknown observation sources, recovery evidence, terminal-vs-active handling, unmerged/wrong-repository/wrong-branch PRs, concurrent lease replacement, main movement, shared/unknown CI inputs, malformed packages, rename boundaries and selector wiring. TypeScript, control/selector tests and repository validation are run locally; browser-bound full health and all affected proof workflows must pass on the exact PR head before integration.

The first deployment must be observed on GitHub: confirm projection completion, operational report generation and conservative lease reconciliation. Since this PR changes the selection mechanism itself, all affected specialised proofs run. Future coordination-only changes can earn skips. Native GitHub merge queue/ruleset configuration and atomic merge fencing are outside this slice; no unavailable permissions or guarantees are assumed.

No architecture, evidence maturity or construction-readiness claim changes. Generated main projections own durable status. PR/issue closeout records carry actual CI, merge and cleanup identities.

## First deployment and event integration correction

#1016 merged at 93d3f3d4. All fourteen exact-head PR workflows passed. Native Project operations run 40928817685 succeeded; its trusted-main reconciliation released generation 1 at 18:14:33 UTC and emitted the first report. This establishes actual native mutation/reporting capability, not merely workflow configuration.

Inspection then identified an event-placement defect: GitHub reads push workflows from the pushed branch. The retained runtime branch did not contain the new trigger. PCO-OPERATIONS was explicitly requeued rather than claiming that main-only wiring handled heartbeats, and generation 2 acquired normally after the automatic release. The reporting job is now one read-only reusable main workflow, with a small canonical trigger installed separately on runtime/claims. Main closeout and claim events share that reporting implementation. Runtime trigger installation is retained coordination infrastructure, never a source branch to merge/delete.

Verify the claim-branch push run and its report before final closeout. The source template is deliberately small; change reporting logic on main rather than duplicating implementation on the runtime branch.
