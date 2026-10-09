# Information Architecture Migration — Control Record

**Status:** complete  
**Completed:** 2026-10-09  
**Purpose:** reorganise repository ownership and the documentation-site information architecture without conflating filesystem, publication order, navigation or project state.

This record preserves the decisions and verification behind the migration so the resulting structure does not have to be reconstructed from chat history.

## Target model

House Systems Architecture has four related but distinct structures:

1. **Repository ownership** — where a document belongs according to the role it performs.
2. **Publication structure** — the order in which the architectural argument is made.
3. **Website navigation** — the routes a reader needs through the corpus.
4. **Project state** — what is current, provisional, complete or historical.

No one of these structures is permitted to dictate the others mechanically.

The repository remains the source of truth. The website is a curated reading interface over the same source files. Publication order may cross repository ownership boundaries. Historical files remain discoverable without being promoted into the primary reading path.

## Decisions

- Keep the existing role-based repository model rather than reorganising the whole corpus around the book.
- Promote **architectural grammar** to a first-class repository area independent of the computational track.
- Separate current pattern-language material from migration provenance in navigation; retain stable repository paths where ownership is already correct.
- Use VitePress route-specific sidebars rather than one global corpus-wide sidebar.
- Keep exhaustive published-Markdown navigation coverage as a build invariant, but enforce it across the union of all curated sidebars.
- Make navigation declarative in one place; remove post-definition sidebar mutation from `config.ts`.
- Make the manuscript route reflect the actual publication hierarchy: Part I, Part II, Part III Pattern Language, Part IV Reference House, Part V.
- Treat developed inserts such as Repose and External Maintenance Geography as subordinate to their owning manuscript part rather than peers of the Parts.
- Keep history and provenance available under local collapsed groups rather than allowing it to dominate primary navigation.
- Keep `governing-principles.md` as the single maintained source for the eleven principles; Part I now points to it rather than duplicating the full block.

## Migration stages

### Stage 0 — control record

- [x] Record the target model and migration stages in-repo.

### Stage 1 — documentation contract

- [x] Update `docs/README.md` to define repository ownership, publication structure, website navigation and project state as separate concerns.
- [x] Record the rule that navigation must optimise for reading rather than mirror the filesystem.
- [x] Record the rule that history remains discoverable without receiving equal visual rank to current material.

### Stage 2 — repository ownership corrections

- [x] Create `docs/grammar/` as the first-class owner of the architectural-grammar framework and G-01 research.
- [x] Move the generic grammar framework, G-01 records and G-01 precedent cases out of `docs/computational/` as canonical content.
- [x] Preserve old computational grammar URLs as explicit compatibility landing pages excluded from primary navigation.
- [x] Repair canonical links in the main project, Reference House and computational indexes; legacy links remain functional through compatibility pages.
- [x] Review historical pattern-language paths. Their ownership is already `patterns/`, so retain stable paths and express provenance through the local sidebar rather than moving files for cosmetic hierarchy.
- [x] Review Phase-5 Reference House service-topology paths. Their ownership is already `reference-house/`, so retain stable paths and place them under local history/provenance navigation.
- [x] Avoid unrelated filesystem churn.

### Stage 3 — navigation architecture

- [x] Replace the single global sidebar with route-specific VitePress sidebars.
- [x] Create a small global navbar for major reading areas.
- [x] Make `.vitepress/navigation.ts` the complete declarative source for nav and sidebars.
- [x] Remove sidebar mutation logic from `.vitepress/config.ts`.
- [x] Retain exhaustive Markdown coverage across the union of route-specific sidebars, with an explicit marker only for compatibility landing pages.

### Stage 4 — manuscript reading hierarchy

- [x] Rebuild the manuscript sidebar around Front Matter and Parts I–V.
- [x] Nest Repose beneath Part I and External Maintenance Geography beneath Part II.
- [x] Link Part III directly to the canonical pattern-language area.
- [x] Link Part IV directly to the canonical Reference House area.
- [x] Keep Publication Architecture available as structural/reference material rather than part of the primary book sequence.

### Stage 5 — local area sidebars

- [x] Pattern language: current language first; strategies/candidates/retired identities clearly separated; migration provenance collapsed.
- [x] Architectural grammar: framework, G-01, evidence/derivation and precedent cases.
- [x] Reference House: current architectural work first; old coordination runs under history.
- [x] Research: subject-led current research, historical migration evidence demoted.
- [x] Computational: current executable result/review, core model, technical families and crosswalk first; paper/programme history demoted; no G-01 ownership.
- [x] Development: live controls first; completed migration/audit material under provenance.
- [x] Prototypes, Delivery, Editorial and Source: concise local sidebars matching their existing ownership roles.

### Stage 6 — content reconciliation

- [x] Update `docs/reading-guide.md` to match the new reading architecture.
- [x] Update `docs/manuscript/README.md` to match the actual Part I–V structure.
- [x] Reconcile stale Publication Architecture v0.11 references in `STATUS.md` to current v0.12 and update the status date.
- [x] Remove the duplicate independently editable governing-principles block from Part I while preserving repository readability through an explicit link to the canonical principles document.
- [x] Repair structural cross-links affected by the grammar move; compatibility landing pages preserve older inbound links.

### Stage 7 — verification and closeout

- [x] Run TypeScript typecheck through the ordinary CI path after the navigation/grammar refactor.
- [x] Run P0 and pattern-crosswalk tests through the ordinary CI path after the navigation/grammar refactor.
- [x] Run the VitePress production build after the final content reconciliation.
- [x] Confirm navigation coverage accepts the classified corpus and excludes only explicitly marked compatibility landing pages.
- [x] Deploy the final reconciled site successfully through the ordinary GitHub Pages workflow.
- [x] Close this control record.

A post-move build initially exposed seven broken relative links in second-level compatibility pages. The links were corrected in a separate commit. The final build after status reconciliation and Part-I deduplication passed the compiler tests, VitePress production build and Pages deployment.

The automated pipeline cannot perform a device-level visual inspection of the mobile drawer. That remains a smoke check rather than an information-architecture gate; the navigation uses VitePress's standard route-specific sidebar and mobile-menu behaviour rather than custom rendering code.

## Resulting invariant

Future work should preserve the distinction established here:

> **Move a document when its ownership is wrong. Change navigation when its presentation is wrong. Do not make either structure impersonate the other.**

A new published Markdown page must be deliberately classified in navigation. A historical page may remain available without receiving primary visual rank. A publication Part may point across repository areas without duplicating their content. A computational representation may depend on an architectural grammar without owning it.