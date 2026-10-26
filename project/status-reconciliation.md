# Project status reconciliation — 2026-10-26

**Question:** does the project overview identify the current open programmes and next gates without replaying superseded instructions?  
**Baseline:** `224c7cc838c658beb1b1463b3a0c0029827f4178` (`main`, DPL-15E integration)  
**Tracking:** issue and PR creation pending GitHub API access; no issue or PR number assigned

## Reconciliation decisions

| Stale or missing overview | Controlling evidence | Result |
| --- | --- | --- |
| DPL-13D presented as the next task; real-site trials held | `project/dpl/deployment-programme.md`, `project/dpl/dpl-15e-rp006-spatial-preflight.md`, `project/dpl/dpl-t11-lennard-no-spend-evidence.md` | DPL-15F is next; RP-006 still fails four readiness dimensions, corpus readiness remains 0/8, and Lennard remains excluded from the empirical sample. |
| Publication summary omitted ADE and PLT dependencies | `docs/publication/architectural-drawing-engine-ade00-audit.md`, `docs/publication/architectural-drawing-engine-ade03b-wall-grammar.md` | ADE-04 is next; PLT physical review cannot accept the old candidate and resumes after ADE-07 migration. |
| Private-object production appeared immediately ungated | `docs/publication/publication-typography-v1-release.md` | TYP RC2 acceptance permits manufacturing preparation; final 12-copy production still requires the independent PLT freeze. |
| Delivery modules lacked a coordinated effort record | `docs/delivery/README.md`, current M2 assessment and the user's authorised DEL recommendation | Frame DEL in `project/del/delivery-programme.md`; preserve module/source ownership and external evidence dependencies. |

The typed maturity registry is the source for the rendered status table. The existing status and data-plate generators reconcile its downstream outputs. All maturity levels and `project/authority.ts` remain unchanged. No source geometry, renderer, dependency, frozen artefact or historical gate record is changed.

## Tracking recommendation and execution boundary

Prepare one DEL umbrella and one bounded status-reconciliation issue. Before creating either, search existing open and closed issues for matching coverage. P01/P02 retain their existing codes; check their current tracking before creating deferred issues. Manufacturing and architectural specificity receive no new programme code.

The GitHub issues-list request was denied by the environment proxy at `api.github.com`. Native Git read/write access is separate and works. Issue inventory, creation, PR creation, CI observation and merge remain blocked; this record does not claim those operations happened. The branch must not merge without its tracking PR and validated head/base relationship.

## Acceptance and handoff

- Current ADE, PLT, TYP, DPL, RH/prototype and DEL gates are discoverable from `STATUS.md`.
- Generated maturity status and data plate agree with their typed source.
- Existing repository checks validate links, source/output consistency, project authority and publication boundaries.
- Remote issue/PR creation, CI and merge are required before operational closeout; append exact identities and outcomes when access is restored.

Validation: `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium npm run check` passed, including type checking, repository/source contracts, the existing compiler suites, committed-output verification, publication figure/integrity checks and the documentation build. Generated status and data-plate updates were run before validation. This validates repository consistency; it does not create external evidence or establish the correctness of architectural claims.

Prepared GitHub issue title: **Reconcile project status with current ADE, PLT, TYP and DPL gates**.

Prepared DEL umbrella title: **DEL — evidence-led delivery requirements and responsibility coordination**. Its scope and acceptance criteria are the delivery programme record; it does not authorise external contact, commissioning or spend.
