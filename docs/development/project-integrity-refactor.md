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

**State:** planned

Add a small validator to the ordinary test suite. Initial invariants:

- every published Markdown page remains deliberately classified in site navigation;
- local Markdown links resolve;
- publication manifests contain existing, unique sources and the canonical pattern set exactly once;
- current project-facing surfaces do not accidentally reintroduce legacy project names;
- machine-owned control metadata is internally consistent.

The validator should reuse existing publication/navigation definitions where possible rather than create parallel lists.

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
