# Project integrity refactor

**Status:** active  
**Started:** 2026-10-11  
**Purpose:** add small, explicit controls that make repository drift fail early rather than accumulate silently.

This is a reliability refactor, not an architectural or editorial expansion. The target is a small set of boring invariants: current publication sources stay classified, project identity cannot drift unnoticed, control documents expose their lifecycle, and machine-readable publication scope has one owner.

## Constraints

- Keep the repository understandable without bespoke tooling.
- Prefer compile/test failures over conventions that rely on memory.
- Do not add a generic schema system or frontmatter framework.
- Keep `docs/manuscript/publication-architecture.md` as the human editorial authority for the book.
- Keep each stage independently coherent and passing before moving on.

## Stages

### 1. Repository integrity validation

**State:** implemented — CI verification pending

Implemented:

- `scripts/validate-repository.ts` now runs from ordinary `npm test`;
- the existing curated-navigation coverage assertion is therefore tested before a docs build;
- relative local Markdown links across the root corpus and `docs/` must resolve and remain inside the repository;
- the existing publication validator remains the owner of manifest/source uniqueness and canonical-pattern invariants rather than duplicating those checks;
- a read-only pull-request validation workflow runs `npm test` and `npm run docs:build`.

The PR workflow was first added to `main` as inert validation infrastructure because GitHub does not execute a newly introduced `pull_request` workflow until that workflow exists on the base branch. It has no deploy step and only `contents: read` permission.

### 2. Control-document lifecycle

**State:** planned

Introduce minimal lifecycle metadata for programme-control records where current versus completed versus historical state matters. Keep the vocabulary deliberately small:

- `active`
- `complete`
- `historical`

Use it only on programme/control records, not the architectural manuscript. Validation should prevent an explicitly completed/historical control from presenting itself as a live control in machine-owned navigation or registries.

### 3. Project identity

**State:** planned

Create one small machine-readable identity module containing the current project name and recognised legacy names. Site/PDF metadata should consume the current identity where practical. Validation should allow legacy names only in explicitly historical/provenance contexts or narrow compatibility identifiers such as the stable `HSA-P-*` namespace.

### 4. Publication scope deduplication

**State:** planned

Keep two levels of authority:

1. `docs/manuscript/publication-architecture.md` — human editorial intent;
2. `publication/publication.ts` — machine-readable compile scope/order.

Stop maintaining the publication scope crosswalk as a second hand-edited manifest. Replace its mechanically duplicated sections with a generated report derived from `publication/publication.ts`, while retaining only the genuinely editorial scope rules and exceptions as authored prose.

## Checkpoint protocol

After each stage:

1. update this record with the completed state and any design decision that would matter after an interruption;
2. commit the stage separately on `project-integrity-refactor`;
3. run the repository CI path applicable to that stage;
4. do not begin the next stage until the previous stage is recoverable from the branch history.

On completion, open/refresh the pull request, review the aggregate diff for accidental complexity, and merge only from a green head.
