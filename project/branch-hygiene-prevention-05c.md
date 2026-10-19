# BRH-05C — lifecycle doctrine

BRH-05C records the minimum durable branch workflow authorised by issue #161. It adds no branch-management subsystem and changes no repository lifecycle setting or automation.

## Entry authority

- baseline `main`: `932dd67c61ba10cbc154f68745cf8571430f3ada`
- historical BRH cleanup queue: empty
- `delete_branch_on_merge`: enabled
- orphan audit: present and read-only
- live non-main work at packet start:
  - `drw-05e-principal-section-spread-proof` — open draft PR #235
  - `hfi-05c-cross-discipline-conflict-matrix` — newly created active branch from current `main`

Neither live programme branch is modified by BRH-05C.

## Doctrine recorded

Canonical workflow: `project/branch-lifecycle.md`.

It records only four operational rules:

1. durable work should normally get an early draft PR;
2. temporary diagnostic/CI/dependency branches should end in the same bounded operation that completes their purpose;
3. an intentional durable branch without an open PR must carry an explicit retention reason;
4. orphan/stale branches are reported for review and are never automatically deleted.

The doctrine also makes explicit that Git/PR/issue history is the archive; archive branches/tags are not required merely to retain provenance.

## Deliberate non-scope

BRH-05C does **not** add:

- branch naming policy;
- automatic stale/orphan deletion;
- stale-branch failure gates;
- branch SLAs;
- archive tags/branches;
- new labels or bots;
- branch protection or merge-policy changes;
- additional lifecycle automation.

The existing automatic post-merge deletion setting and read-only orphan audit remain the entire mechanical prevention layer.

## Placement

The lifecycle doctrine lives under `project/`, not the published documentation surface. Repository health correctly rejected the first draft when it was placed under `docs/development/` without curated navigation coverage; the packet used that failure to tighten scope rather than expanding public navigation for an internal process note.

## Administrative note

Issues #250 and #251 were accidental connector-routing invocations during this packet. Both were immediately marked `[VOID]`, closed as `not_planned`, and carry no project authority or follow-up.

## Next packet

**BRH-06A — final mechanical re-audit.** Run a fresh full inventory from then-current `main` using the BRH-00A audit mechanism and prove the final surviving namespace before programme closeout.
