# BRH-02B — infrastructure/tooling semantic review

Semantic review only. This packet resolves the two `infrastructure-tooling` entries frozen by BRH-01C. It performs no salvage and authorises no deletion.

## Baseline

- programme: issue #161
- current `main` at review start: `dfba4237107eda8c7a6d79e53607ba25e40a4f49`
- open PRs at review start: DRW-03D / #181 only; protected concurrent work
- bounded branches reviewed: **2**
- final C: **2**
- final D: **0**
- final X: **0**
- review JSON SHA-256: `0877fa63979c572f51ab518f37bd19fc975c9243d64d9855cb00431bcc79358b`

## `project-integrity-refactor` → C

Head `5f3ddadab402daaf9f01a3ea99531fc65734302d` is mechanically diverged from the review baseline: **23 ahead / 929 behind**, with 23 branch-only commits.

The branch was not disposable merely because equivalent filenames now exist. Its semantic contribution was a coherent project-integrity architecture:

- central project identity rather than scattered hard-coded names;
- lifecycle-aware programme-control registration;
- generated publication-scope/crosswalk content;
- repository-level link/navigation/identity checks;
- PR validation that runs those checks.

That architecture is now present and stronger on current `main`:

- `project/identity.ts` has evolved from the branch's House Kernel identity into current Ovid’s House / House Kernel / Metamorph Compiler identity and explicit legacy-name policy;
- `project/programme-controls.ts` retains the same lifecycle registry and now includes later Reference House and Ovid’s House controls;
- `publication/scope-report.ts` is byte-identical to the branch version;
- `scripts/validate-repository.ts` retains the branch's navigation, local-link, programme-control and project-identity checks and adds later maturity-state validation;
- `.github/workflows/validate-pr.yml` and the publication/site scripts continue to enforce the resulting integrity system under later nomenclature/public-surface controls.

The unique branch topology therefore represents the development route by which this system was first assembled, not stranded project value. Reapplying it would regress current naming and duplicate or weaken later authority.

**Final classification: C — unique branch history, semantically reimplemented and evolved on current main. No salvage.**

## `public-url-phase-1` → C

Head `45fcb14128ae055a8b0724cbfbbc31bbc8758ceb` is mechanically diverged from the review baseline: **4 ahead / 924 behind**, with four branch-only commits.

Its contribution was the first coherent clean-public-URL layer: source-ID rewriting, public route mapping, Markdown-link translation, mapped navigation/sidebar routes and route-integrity validation.

Current authority retains that design and develops it further:

- `project/site-routes.ts` still provides `rewriteSourceId`, `routeForSource`, `publicRoute`, `rewriteMarkdownPageLink`, `mapNavigationLinks` and `mapSidebarRoutes`;
- the current implementation additionally understands the explicit public-surface boundary and converts links to intentionally hidden repository records into source links instead of dead public URLs;
- `scripts/validate-public-routes.ts` retains collision checks, route contracts, legacy-path rejection and mapped navigation coverage, but validates the resolved public surface rather than assuming every repository Markdown file is public;
- VitePress and package-level integration still call the current route system.

There is no coherent useful residue absent from `main`. The branch is an earlier implementation state of the current routing system.

**Final classification: C — unique branch history, semantically reimplemented and evolved on current main. No salvage.**

## Safety boundary

- No branch was deleted.
- No branch was rewritten.
- No content was salvaged from either reviewed branch.
- No repository setting was changed.
- DRW-03D / #181 was treated as protected concurrent work and not touched.
- These C classifications are semantic dispositions only; deletion remains gated to BRH-04.

## Exact next packet

**BRH-02C — compiler/computational semantic review**, bounded to seven branches:

- `cf-01-contrast-fixture`
- `ch-05-determinism-identity-provenance`
- `ch-05-housekeeping-sync`
- `ch-08-distillation-deletion`
- `coa-04-plan-section-successors`
- `coa-05-topology-successors-final`
- `coa-06-output-integration`

This is one coherent unresolved lineage and remains below the BRH-02 hard cap of ten branches. BRH-02C is semantic review only: no salvage or deletion.
