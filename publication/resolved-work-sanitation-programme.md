# Resolved-Work Sanitation Programme

Issue: #133 — `PUB-SAN — resolved-work sanitation programme`

## Governing rule

> **The publication contains the resolved work, not the history of its resolution.**

This rule applies to every reader-facing Ovid’s House surface, including the docs site and all generated PDFs.

The public corpus should present Ovid’s House as a coherent resolved body of architectural work. Development history, migration scaffolding, superseded taxonomies, internal programme language and drafting provenance belong in repository history or explicitly internal records unless that history itself contributes to the architectural argument.

## What “lossless” means here

Losslessness means **losslessness of substantive ideas**, not losslessness of drafts, documents or historical formulations.

Before any reader-facing material is removed or internalised, determine whether it contains a unique:

- architectural claim
- distinction
- constraint
- strategy or pattern
- precedent
- evidence item
- useful formulation
- dependency or explanatory link required elsewhere

If unique value exists, migrate it into the correct current canonical location first. If not, the historical artefact can be removed from the public corpus.

Git history remains the development archive.

## Why this programme exists

A spot check of the major PDF exposed `Appendix B — Legacy Doctrine Register Crosswalk`, including references to `House Design Doctrine v7` and prose explaining the migration from the old long-form doctrine into the current taxonomy.

That material may have been useful as migration assurance during development, but it is not part of the resolved architectural argument. Its presence indicates a wider risk: reader-facing outputs may have accumulated internal process residue because earlier work correctly prioritised preserving ideas during restructuring.

This programme reverses that retention bias without sacrificing substance.

## Scope

Audit the complete reader-facing build graph, not just obvious publication files.

At minimum:

- all docs-site routes and navigation entries
- all Markdown or generated content exposed on the website
- full PDF sources and assembly inputs
- compact/primer PDF sources and assembly inputs
- appendices
- publication adapters and generated publication content
- captions, notes, callouts, prefaces and metadata
- reader-facing compiler material
- reader-facing project-status or methodology material
- references between public sections

Internal project-management files are not automatically deletion targets. They may remain in the repository while being excluded from navigation and publication builds.

## Classification model

Every suspect reader-facing item or coherent section receives exactly one disposition:

| Disposition | Meaning |
|---|---|
| `KEEP` | Resolved content that belongs as-is. |
| `REWRITE` | Substance belongs, but framing is historical, procedural, obsolete or internally addressed. |
| `MERGE` | Unique value exists but belongs inside another current canonical section. |
| `INTERNALISE` | Useful development or maintenance record that should remain in the repo but not be reader-facing. |
| `DELETE` | No unique surviving value and no public purpose. |

Classification is about the item’s role in the final work, not whether it was once useful.

## Residue taxonomy

The audit must look for meaning, not just keywords. Likely residue includes:

- old doctrine versions and versioned snapshots
- doctrine crosswalks and migration tables
- references such as `v7`, `legacy`, `archived`, `preserved from`, `previously`, `superseded`, `migration`, `crosswalk`
- phase names, issue numbers and programme identifiers exposed to readers
- prose explaining why a page or file exists rather than advancing the argument
- duplicate concepts retained for completeness
- implementation commentary presented as publication prose
- obsolete caveats that mattered only during development
- internal status or progress material in public navigation
- appendices whose main purpose is project provenance
- old naming or taxonomy retained only because earlier drafts used it
- references to drafting agents or the conversation/process used to develop the project
- text written as handoff commentary rather than as finished publication prose
- seams where a current section assumes knowledge of superseded material

## Programme sequence

### SAN-00 — Baseline and corpus map

Objective: establish exactly what a reader can currently encounter and how it gets there.

Actions:

1. Recover current authority from `main`.
2. Enumerate every public docs-site route and navigation entry.
3. Enumerate every file/source that enters the full PDF.
4. Enumerate every file/source that enters the compact/primer PDF.
5. Record source-to-output assembly/build paths.
6. Classify repository material initially as public-source, build-support, or internal-only.
7. Freeze a baseline inventory for later comparison.

Deliverable: a corpus map detailed enough that no reader-facing surface can escape the audit.

### SAN-01 — Mechanical residue scan

Objective: find obvious development residue efficiently.

Actions:

1. Search repository-wide for known version/provenance/process vocabulary.
2. Inspect every hit in context.
3. Search for internal programme IDs, issue-like language and historical naming.
4. Build a candidate register with location, excerpt, reason for suspicion and preliminary classification.
5. Do not delete based on keyword matches alone.

Deliverable: candidate register covering mechanically discoverable residue.

### SAN-02 — Structural and editorial audit

Objective: find residue that cannot be discovered mechanically.

Actions:

1. Read the entire reader-facing corpus in publication order.
2. Ask of every section: would this exist if the final system had been conceived in its present form from day one?
3. Identify pages/appendices whose very existence is historical scaffolding.
4. Identify prose addressed to future maintainers rather than readers.
5. Identify duplications caused by prior migrations.
6. Assign `KEEP / REWRITE / MERGE / INTERNALISE / DELETE`.

Deliverable: complete disposition register for all suspect material.

### SAN-03 — Semantic-loss audit

Objective: guarantee that cleanup does not discard intellectual value.

For every item marked `MERGE`, `INTERNALISE` or `DELETE`:

1. Extract every unique substantive proposition or useful formulation.
2. Locate its canonical surviving destination.
3. If no destination exists, create or amend one before removal.
4. Check dependencies: does another public section rely on this item for context or definitions?
5. Explicitly verify coverage of doctrine, strategies, patterns, constraints, evidence, precedents and Reference House reasoning.

Nothing is removed merely because it looks obsolete.

Deliverable: value-migration map proving where every retained idea survives.

### SAN-04 — Execute public-corpus cleanup

Objective: transform the reader-facing corpus into resolved work only.

Actions:

1. Remove internal-history material from website navigation and public build inputs.
2. Rewrite valid passages into resolved-present-tense prose.
3. Merge useful fragments into canonical sections.
4. Delete genuinely redundant reader-facing material.
5. Preserve useful maintenance records internally where appropriate.
6. Repair references, navigation, appendices and PDF assembly after removals.

The visible `Legacy Doctrine Register Crosswalk` is handled here, after the semantic-loss audit rather than as an isolated first deletion.

### SAN-05 — Publication coherence pass

Objective: test the cleaned work as a first-time external reader would encounter it.

Read the website and both PDF forms end-to-end and hunt for:

- unexplained internal acronyms or programme names
- references to vanished documents or taxonomies
- duplicated arguments
- historical seams left by deleted context
- prose that still sounds like a project handoff
- methodological explanations with no reader value
- appendices that still fail the resolved-work test
- any sense that the reader is watching the project being developed rather than reading the finished work

Deliverable: coherence corrections after structural cleanup.

### SAN-06 — Lossless verification and closeout

Objective: prove that the programme improved presentation without reducing the substantive work.

Actions:

1. Compare cleaned outputs against the SAN-00 baseline and SAN-03 value map.
2. Account for every substantive idea in removed material as retained, intentionally rejected, or superseded by a stronger resolved statement.
3. Regenerate every public output.
4. Run all relevant validation, build and test suites.
5. Verify website navigation exposes only intended public material.
6. Verify full and compact PDFs contain only resolved work plus genuinely useful scholarly/technical apparatus.
7. Record any provenance material intentionally retained and why.
8. Close issue #133 only after these conditions hold.

## Acceptance criteria

The programme is complete only when all of the following are true:

1. No reader-facing section exists primarily to document how the project evolved.
2. No obsolete version, taxonomy or migration language remains unless historically necessary to the architectural argument.
3. Every removal or internalisation has been checked for unique substantive content.
4. Valuable content from removed artefacts survives in canonical current locations where appropriate.
5. Website navigation exposes only material intended for an external reader.
6. Full and compact PDFs contain only resolved work and genuinely useful supporting apparatus.
7. A first-time reader can understand the work without knowing its development history.
8. Internal project records remain available where they still serve maintenance or auditability.
9. Git history remains sufficient to recover superseded drafts if ever needed.
10. Existing builds/tests/validation pass after cleanup.

## Handoff for another agent

Start with issue #133 and this document. Recover authority from `main`; do not rely on chat history. Begin at SAN-00 and map the complete reader-facing build graph before changing content.

Do not treat this as a keyword deletion exercise or a narrow cleanup of Appendix B. It is an editorial and information-architecture hardening programme whose two simultaneous requirements are:

1. remove development history from the public work; and
2. preserve the architectural substance without loss.

The governing test throughout is:

> **Does this belong in the resolved work, or only in the history of how the resolved work came to exist?**
