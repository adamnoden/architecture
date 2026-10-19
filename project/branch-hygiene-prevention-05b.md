# BRH-05B — read-only orphan-branch audit

BRH-05B installs the smallest durable branch-lifecycle monitor authorised by issue #161. It reports branch hygiene signals; it never deletes, rewrites or pushes refs.

## Entry authority

- baseline `main`: `0da7f1ccd9a9d7ae540a6c326733a2fdb7ef3d0d`
- historical BRH deletion queue: empty
- live namespace before packet creation:
  - `main`
  - `drw-05e-principal-section-spread-proof` — open draft PR #235
  - `hfi-04d-kitchen-storage-fixed-work-zones` — newly created concurrent HFI work
- `delete_branch_on_merge = true` remains established by BRH-05A

The packet does not reinterpret or interfere with either live programme branch.

## Design

The existing `scripts/branch-hygiene-audit.mjs` remains the single Git-history engine. It already provides the evidence 05B needs:

- exact branch head SHA;
- head commit timestamp;
- open/closed PR association;
- ahead/behind counts;
- branch-only and non-merge branch-only commits;
- stable patch IDs;
- `git cherry` unique/patch-equivalent signals.

BRH-05B adds only `scripts/branch-orphan-report.mjs`, which classifies that evidence for review.

A non-`main` branch is reported as:

1. **`open-pr`** — at least one open PR exists for the branch;
2. **`retained`** — no open PR, but `project/branch-hygiene-retentions.json` records a non-empty explicit retention reason;
3. **`recent`** — no open PR or retention reason, but the head commit is no more than 14 days old;
4. **`suspicious`** — none of the above.

`Suspicious` is deliberately only a review signal. The reporter exits successfully when suspicious branches exist; it does not turn a heuristic into an automatic destruction policy.

### Age limitation

Git refs do not carry a reliable branch-creation timestamp. The audit therefore uses **head commit age** as the reproducible age signal. This is intentionally conservative: a newly created branch pointing at an old commit may be flagged early rather than silently treated as recent. Open PR or explicit retention evidence overrides that age signal.

## Workflow

`.github/workflows/branch-orphan-audit.yml` runs:

- weekly, Monday at 06:17 UTC;
- manually through `workflow_dispatch`;
- on PRs that modify the audit itself, so changes to the monitor are self-proving before merge.

Permissions are restricted to:

- `contents: read`
- `pull-requests: read`

The workflow:

1. checks out full history;
2. runs the established read-only branch-hygiene audit;
3. derives the orphan report;
4. writes the Markdown report to the Actions job summary;
5. uploads raw audit JSON plus Markdown/JSON orphan reports as an artifact.

There is no write permission, deletion command, push command, branch mutation or stale-ref automation.

## Explicit retentions

`project/branch-hygiene-retentions.json` is intentionally tiny. It maps a branch name to a human-readable reason when a durable branch without an open PR is intentionally retained. An empty map is the normal state.

A retention entry suppresses only the `suspicious` label. It does not prevent later human review or grant permanent exemption from BRH doctrine.

## Report fields

Every audited branch reports at least:

- branch name and exact head SHA;
- head age signal;
- open PR association;
- ahead / behind `main`;
- branch-only commit count;
- unique / patch-equivalent `git cherry` counts;
- explicit retention reason where present;
- resulting review status.

## Acceptance

BRH-05B closes when:

1. the workflow and reporter run successfully on the packet PR;
2. the live branches are classified without false orphaning of DRW/HFI work;
3. the generated report is available in both the job summary and uploaded artifact;
4. normal repository validation is green on the exact final head;
5. merge and post-merge publication validation pass;
6. issue #161 records the proof and exact next packet.

## Next packet

**BRH-05C — lifecycle doctrine.** Record only the minimum durable branch workflow rules authorised by #161; do not build a branch-management subsystem.
