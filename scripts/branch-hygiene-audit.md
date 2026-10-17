# Branch hygiene audit method

This document records the read-only audit mechanism established for BRH-00A under issue #161.

## Scope

The mechanism inventories remote branch state without deleting, pushing or rewriting any remote ref. It separates mechanical evidence collection from later BRH classification, semantic review, salvage and deletion packets.

Canonical tool:

`scripts/branch-hygiene-audit.mjs`

## Preconditions

- run from a full Git checkout of the repository;
- Node.js 22+;
- Git available on `PATH`;
- network access to GitHub for PR association lookup, unless `--skip-prs` is explicitly used for an offline/synthetic proof;
- a readable remote named `origin` unless another remote is passed explicitly.

The default invocation begins with:

```bash
git fetch --all --prune
```

This refreshes local remote-tracking refs only. It does not push, delete or mutate the GitHub repository.

## Enumeration proof

Every run enumerates the full `refs/remotes/<remote>/...` namespace with `git for-each-ref`, excluding only the symbolic `<remote>/HEAD` ref and `<remote>/<main>`.

The report records:

- every enumerated branch name and exact head SHA;
- branch count;
- a SHA-256 digest over the ordered `branch-name<TAB>head-sha` set;
- the exact `main` SHA used by the run.

When `--branches=` limits the expensive per-branch audit to representative branches, the complete remote enumeration is still recorded. Omitting `--branches=` audits every enumerated branch and is the intended BRH-00B mode.

## Per-branch evidence

For each audited branch the tool records:

- exact head SHA and commit date;
- merge base against `origin/main`;
- ahead/behind counts from `git rev-list --left-right --count`;
- whether the branch head is an ancestor of `main` via `git merge-base --is-ancestor`;
- all branch-only commits;
- non-merge branch-only commits;
- stable patch ID for every non-merge branch-only commit via `git patch-id --stable`;
- changed-file status/path summary from the merge base to branch head;
- `git cherry` patch-equivalence evidence, including unique/equivalent patch counts;
- associated GitHub pull requests, matched by head branch name.

The output is evidence only. It does not assign A/B/C/D/X classifications.

## Invocation

Representative probe:

```bash
node scripts/branch-hygiene-audit.mjs \
  --branches=drw-02a,prototype-p03-engineer-review-brief,project-integrity-refactor \
  --output=/tmp/brh-00a-proof.json
```

Full BRH-00B inventory:

```bash
node scripts/branch-hygiene-audit.mjs \
  --output=/tmp/branch-hygiene-inventory.json
```

Use `--repo=owner/name` if the GitHub repository cannot be inferred from the remote URL. `GITHUB_TOKEN` or `GH_TOKEN` is used when available; public unauthenticated lookup remains possible within GitHub rate limits.

## Safety boundary

The tool contains no deletion path and invokes no `git push`, remote-ref update or GitHub mutation. BRH-00A/00B/00C remain discovery-only packets. Any future deletion mechanism must be separate tooling introduced only under BRH-04 authority.

## BRH-00A execution baseline

The packet began from `main` at:

`77840514ed3a214d88b7aedf4d6a3d5d2a11b114`

At packet start:

- there were no open pull requests;
- `delete_branch_on_merge` remained `false`;
- BRH issue #161 had no prior closeout comment;
- no remote branch was deleted or otherwise mutated.

The representative proof run and exact resulting branch count/digest are recorded in the BRH-00A closeout comment on issue #161 rather than frozen here, because they are execution evidence rather than durable method semantics.
