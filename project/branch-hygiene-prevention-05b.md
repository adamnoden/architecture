# BRH-05B — read-only orphan-branch audit

BRH-05B installs the smallest durable branch-lifecycle monitor authorised by issue #161. It reports branch hygiene signals; it never deletes, rewrites or pushes refs.

## Entry authority

- baseline `main`: `0da7f1ccd9a9d7ae540a6c326733a2fdb7ef3d0d`
- historical BRH deletion queue: empty
- live namespace before packet creation: `main`, DRW-05E and fresh concurrent HFI-04D
- DRW-05E remained protected by open draft PR #235
- `delete_branch_on_merge = true` remains established by BRH-05A

## Design

The existing `scripts/branch-hygiene-audit.mjs` remains the single Git-history engine. It already provides exact head SHA, head commit timestamp, PR association, ahead/behind counts, branch-only commits, stable patch IDs and `git cherry` equivalence evidence.

BRH-05B adds only `scripts/branch-orphan-report.mjs`, which classifies each non-`main` branch as:

1. **`open-pr`** — at least one open PR exists;
2. **`retained`** — no open PR, but `project/branch-hygiene-retentions.json` contains a non-empty reason;
3. **`recent`** — neither of the above, but head commit age is no more than 14 days;
4. **`suspicious`** — none of the above.

`Suspicious` is a review signal only. It does not fail the workflow and never triggers deletion.

### Age limitation

Git refs do not carry a reliable branch-creation timestamp. The reproducible age signal is therefore **head commit age**. This is conservative: a newly created ref pointing at an old commit may be surfaced for review rather than silently treated as new.

## Workflow

`.github/workflows/branch-orphan-audit.yml` runs weekly (Monday 06:17 UTC), manually through `workflow_dispatch`, and on PRs that modify the audit itself.

Its complete token permission set is:

- `contents: read`
- `pull-requests: read`

It checks out full history, runs the established audit, derives Markdown/JSON orphan reports, writes the Markdown to the Actions summary, and uploads all three report files as an artifact. There is no write permission, push command, deletion command or ref-update path.

## First live proof

The workflow self-tested on PR **#245** at implementation head `9725d95538fd38be9c3bd99826a7ded2029f2aad`.

- workflow run: **39255049551**
- job: **118068114269**
- conclusion: **success**
- artifact: **12187616745**
- artifact digest: `sha256:f9f82676b17772d8ff49a05b394cda9d65b4a0b15387bcc0ffdb4e3a24db3623`
- audited branches: **3**
- `open-pr`: **2**
- `recent`: **1**
- `retained`: **0**
- `suspicious`: **0**

The proof matched the live topology: DRW-05E and BRH-05B had open PRs; HFI-04D was recent. No active branch was falsely labelled suspicious.

## Explicit retentions

`project/branch-hygiene-retentions.json` is intentionally tiny. It maps branch names to human-readable reasons only when a durable branch without an open PR is intentionally retained. An empty map is normal. A retention entry suppresses only the `suspicious` label; it grants no permanent exemption from review.

## Report fields

Every audited branch reports branch/head identity, head-age signal, open PR association, ahead/behind `main`, branch-only commit count, unique/patch-equivalent counts, retention reason and review status.

## Remaining acceptance

Before BRH-05B closes:

1. normal repository validation must be green on the exact final PR head;
2. merge must use a fresh `main` lease;
3. post-merge publication/Pages validation must pass;
4. issue #161 must record the exact endpoint.

## Next packet

**BRH-05C — lifecycle doctrine.** Record only the minimum durable branch workflow rules authorised by #161; do not build a branch-management subsystem.
