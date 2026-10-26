# Project status reconciliation — 2026-10-26

**Question:** does the project overview identify the current open programmes and next gates without replaying superseded instructions?  
**Starting baseline:** `224c7cc838c658beb1b1463b3a0c0029827f4178` (`main`, DPL-15E integration)  
**Merge-reconciliation baseline:** `1995736c1d1b86fedf6a794e04f4414a61ba0678` (`main`, ADE-04B merged)  
**Tracking:** [#855 — Reconcile project status with current ADE, PLT, TYP and DPL gates](https://github.com/adamnoden/architecture/issues/855), implemented by [PR #858](https://github.com/adamnoden/architecture/pull/858). DEL remains separately open under [#854](https://github.com/adamnoden/architecture/issues/854).

## Reconciliation decisions

| Stale or missing overview | Controlling evidence | Result |
| --- | --- | --- |
| DPL-13D presented as the next task; real-site trials held | `project/dpl/deployment-programme.md`, `project/dpl/dpl-15e-rp006-spatial-preflight.md`, `project/dpl/dpl-t11-lennard-no-spend-evidence.md` | DPL-15F is next; RP-006 still fails four readiness dimensions, corpus readiness remains 0/8, and Lennard remains excluded from the empirical sample. |
| Publication summary omitted ADE and PLT dependencies | `docs/publication/architectural-drawing-engine-ade00-audit.md`, `docs/publication/architectural-drawing-engine-ade03b-wall-grammar.md`, `docs/publication/architectural-drawing-engine-ade04b-opening-uncertainty.md`, ADE-04A PR #833 and ADE-04B PR #851 | ADE-04 opening subtraction and uncertainty grammar are now merged. The current ADE gate is ADE-05: upstream internal-partition authority (#834) and partition/adjacency representation (#835). PLT physical review cannot accept the old candidate and resumes only after ADE-07 migration. |
| Private-object production appeared immediately ungated | `docs/publication/publication-typography-v1-release.md` | TYP RC2 acceptance permits manufacturing preparation; final 12-copy production still requires the independent PLT freeze. |
| Delivery modules lacked a coordinated effort record | `docs/delivery/README.md`, current M2 assessment and `project/del/delivery-programme.md` | DEL is established under #854; preserve module/source ownership and external evidence dependencies. |
| P01/P02 held states had no bounded issue tracking | `docs/development/validation-execution-register.md` | P01 remains held/optional research under #856 and reopens only when resources justify the generic evidence question or a real high-change lining task appears. P02 remains held under #857 and reopens only if service coordination places a genuinely maintainable component beneath a bounded circulation/floor zone. |

The typed maturity registry is the source for the rendered status table. The existing status and data-plate generators reconcile its downstream outputs. All maturity levels and `project/authority.ts` remain unchanged. No source geometry, renderer, dependency, frozen artefact or historical gate record is changed.

## Tracking and execution boundary

Issue inventory found no equivalent DEL umbrella and no existing bounded P01/P02 execution issues. The following durable tracking now exists:

- [#854 — DEL — evidence-led delivery requirements and responsibility coordination](https://github.com/adamnoden/architecture/issues/854) — remains open for actual delivery coordination;
- [#855 — Reconcile project status with current ADE, PLT, TYP and DPL gates](https://github.com/adamnoden/architecture/issues/855) — closes with PR #858;
- [#856 — P01 — W2 wall bay (held optional research)](https://github.com/adamnoden/architecture/issues/856) — deferred only;
- [#857 — P02 — selective floor access (held)](https://github.com/adamnoden/architecture/issues/857) — deferred only.

Manufacturing and architectural specificity receive no new programme code. No external contact, commissioning or spend is authorised. This reconciliation does not execute ADE, DPL, DEL, prototypes or professional reviews.

## Acceptance and handoff

- Current ADE, PLT, TYP, DPL, RH/prototype and DEL gates are discoverable from `STATUS.md`.
- Generated maturity status and data plate agree with their typed source.
- Existing repository checks validate links, source/output consistency, project authority and publication boundaries.
- #854 remains open for DEL work; #856/#857 remain held; #855 closes when PR #858 merges.

The original reconciliation head passed `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium npm run check`, including type checking, repository/source contracts, the existing compiler suites, committed-output verification, publication figure/integrity checks and the documentation build; generated status and data-plate updates were run before that validation. Subsequent tracking-link and current-frontier corrections are required to pass PR #858 CI before merge. These checks validate repository consistency; they do not create external evidence or establish the correctness of architectural claims.
