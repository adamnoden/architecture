# Branch lifecycle

The remote branch namespace is a view of **current work**, not a second archive. Git history, merged pull requests and programme records are the archive.

These are the minimum project-wide branch rules.

## Durable work gets an early PR

Work expected to survive beyond a short diagnostic or one-shot maintenance operation should normally get a **draft pull request early**, before the branch becomes a long-lived private work queue.

The draft PR gives the branch an explicit purpose, owner, programme link and review surface while work is still in progress. It does not imply that incomplete work is ready to merge.

A newly created active branch may exist briefly without a PR while the first coherent change is being prepared. If it is going to persist, open the draft PR rather than relying on branch age or name to communicate intent.

## Temporary branches end with the operation

Diagnostic, CI-proof, dependency/lockfile and other deliberately temporary branches should not become historical residue.

When their purpose is complete, dispose of them in the **same bounded operation** that closes the work:

- merged PR heads are removed automatically by the repository's post-merge deletion setting;
- an intentionally unmerged temporary branch is removed only after its useful evidence has been captured and its purpose is definitively complete.

Do not create archive branches or archive tags merely to preserve a ref. Commit, PR, issue and proof records are sufficient provenance.

## Intentional durable exceptions are explicit

A durable non-`main` branch should normally have an open PR. If a branch intentionally needs to remain without one, record a concise retention reason in [`../../project/branch-hygiene-retentions.json`](../../project/branch-hygiene-retentions.json).

Retention is an explicit exception, not a way to hide uncertainty. A recent branch can remain unclassified while active work is forming; age alone never makes a branch disposable.

## Orphans are reported, not destroyed

The scheduled/manual branch audit reports branches as `open-pr`, `retained`, `recent` or `suspicious`. A suspicious result is a request for review, **not permission to delete**.

Before any orphan/stale branch is removed, its current head and content state must be inspected under the same lossless rules used by BRH: preserve unique value, separate technical uniqueness from project value, and never use age alone as a deletion criterion.

There is deliberately **no automatic stale/orphan deletion**.

## Operational endpoint

The intended steady state is simple:

> `main` + branches corresponding to genuinely active work.

Automatic post-merge deletion handles the normal case. The read-only orphan audit surfaces exceptions. Human review handles anything ambiguous. No larger branch-management subsystem is intended.
