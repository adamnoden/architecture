# BRH-05A — automatic post-merge deletion complete

BRH-05A verifies the repository lifecycle control required by issue #161.

## Result

The required GitHub repository setting was already enabled when the packet began:

`delete_branch_on_merge = true`

BRH-05A therefore did **not** toggle the setting merely to manufacture a mutation event. That would have temporarily regressed a correct safety/lifecycle state. Instead the packet independently verified the live setting and proved the behaviour with merged PR heads.

## Entry authority

- baseline `main`: `a4fb2c706ff02a7c6089d857a33cf6d71c87c0a1`
- historical BRH queue: empty
- surviving live refs before packet creation: `main`, DRW-05E, HFI-04C
- active work remained untouched

PR #241 already provided an external behavioural witness: it merged head `drw-05c1-principal-section-label-fit` at `b41d2e944d209427f4da0af42a10b8b88ce92501`, while fresh enumeration after merge no longer contained that branch.

## BRH-05A self-test

Proof PR **#242** used `brh-05a-auto-delete-verification`.

- exact proof head: `e39fe58d586b2aa70026bc37aa4a8347b22c24a5`
- validation run: **39252790903** — fully green
- fresh merge lease `main`: `a4fb2c706ff02a7c6089d857a33cf6d71c87c0a1`
- merge: `a5683e0e7de44684eb7c5148ddb2686116010fda`
- first parent: leased `main` `a4fb2c706ff02a7c6089d857a33cf6d71c87c0a1`
- second parent: validated proof head `e39fe58d586b2aa70026bc37aa4a8347b22c24a5`

After merge, two independent acceptance checks passed:

1. repository authority still returned `delete_branch_on_merge = true`;
2. `brh-05a-auto-delete-verification` was absent from fresh remote enumeration without any manual delete action.

The observed surviving namespace returned to active work only: `main`, DRW-05E and HFI-04C.

## Safety / scope

- repository setting mutation: **none required / none performed**
- manual branch deletion: **none**
- branch rewrite: **none**
- unrelated repository setting change: **none**
- active DRW/HFI work: **untouched**

The BRH doctrine remains unchanged: automatic deletion applies to successfully merged PR heads only. Orphan/stale branches are reported, not automatically destroyed.

## Next packet

**BRH-05B — read-only orphan-branch audit.**

Add only the lightweight scheduled/manual report authorised by #161. It must remain read-only and must not introduce automatic stale-branch deletion.
