# BRH-05A — automatic post-merge deletion verification

BRH-05A verifies the repository lifecycle control required by issue #161.

## Entry authority

- packet baseline `main`: `a4fb2c706ff02a7c6089d857a33cf6d71c87c0a1`
- live repository setting on entry: `delete_branch_on_merge = true`
- live remote namespace before creating this packet branch: `main`, `drw-05e-principal-section-spread-proof`, `hfi-04c-environmental-electrical-controls`
- open PRs: #235 on `drw-05e-principal-section-spread-proof`
- historical BRH deletion queue: empty

The target setting was already enabled when BRH-05A began. Therefore this packet performs **no redundant repository-setting mutation**. The programme requirement is satisfied by proving the desired state directly rather than toggling a correct setting off/on merely to manufacture a mutation event.

## Independent setting proof

GitHub repository authority returned:

`delete_branch_on_merge = true`

The same live repository object also confirms normal merge methods remain enabled; BRH-05A changes no unrelated repository policy.

## Functional proof already visible on entry

PR #241 merged `drw-05c1-principal-section-label-fit` into `main` as `a4fb2c706ff02a7c6089d857a33cf6d71c87c0a1`. The merged PR still records its head branch and exact head SHA, while fresh remote enumeration no longer contains that branch. This is direct behavioural evidence that merged PR heads are being removed automatically.

BRH-05A adds one further self-test: after this proof PR merges, `brh-05a-auto-delete-verification` must disappear automatically without a manual branch-deletion action. That post-merge observation is the final packet acceptance test.

## Safety / scope

- no historical or active branch deletion is performed by this packet;
- no branch is rewritten;
- no repository setting is changed because the required value is already present;
- DRW-05E remains protected and open as PR #235;
- HFI-04C remains active and untouched;
- automatic deletion applies only to successfully merged PR heads; orphan/stale branches remain report-only under the BRH doctrine.

## Acceptance

BRH-05A is complete only when all of the following hold:

1. exact-head PR validation is green;
2. the proof PR merges under a fresh `main` lease;
3. `delete_branch_on_merge` still reads `true` after merge;
4. the BRH-05A head branch is absent after merge without a manual deletion action;
5. durable closeout is recorded on issue #161.

Next authorised packet after closeout: **BRH-05B — read-only orphan-branch audit**.
