# Information Architecture Migration — Control Record

**Status:** active  
**Purpose:** reorganise repository ownership and the documentation-site information architecture without conflating filesystem, publication order, navigation or project state.

This document is the resumable control record for the migration. It exists so the work can be continued safely after an interrupted session without reconstructing intent from chat history.

## Target model

House Systems Architecture has four related but distinct structures:

1. **Repository ownership** — where a document belongs according to the role it performs.
2. **Publication structure** — the order in which the architectural argument is made.
3. **Website navigation** — the routes a reader needs through the corpus.
4. **Project state** — what is current, provisional, complete or historical.

No one of these structures is permitted to dictate the others mechanically.

The repository remains the source of truth. The website is a curated reading interface over the same source files. Publication order may cross repository ownership boundaries. Historical files remain discoverable without being promoted into the primary reading path.

## Decisions already made

- Keep the existing role-based repository model rather than reorganising the whole corpus around the book.
- Promote **architectural grammar** to a first-class repository area independent of the computational track.
- Separate current pattern-language material from migration provenance where current paths imply false authority.
- Use VitePress route-specific sidebars rather than one global corpus-wide sidebar.
- Keep exhaustive published-Markdown navigation coverage as a build invariant, but enforce it across the union of all curated sidebars.
- Make navigation declarative in one place; remove post-definition sidebar mutation from `config.ts`.
- Make the manuscript route reflect the actual publication hierarchy: Part I, Part II, Part III Pattern Language, Part IV Reference House, Part V.
- Treat developed inserts such as Repose and External Maintenance Geography as subordinate to their owning manuscript part rather than peers of the Parts.
- Keep history and provenance available under local collapsed groups rather than allowing it to dominate primary navigation.
- Keep `governing-principles.md` as the canonical principles text and remove future drift risk from duplicate independently editable copies.

## Migration stages

### Stage 0 — control record

- [x] Record the target model and migration stages in-repo.

### Stage 1 — documentation contract

- [x] Update `docs/README.md` to define repository ownership, publication structure, website navigation and project state as separate concerns.
- [x] Record the rule that navigation must optimise for reading rather than mirror the filesystem.
- [x] Record the rule that history remains discoverable without receiving equal visual rank to current material.

### Stage 2 — repository ownership corrections

- [ ] Create `docs/grammar/` as the first-class owner of the architectural-grammar framework and G-01 research.
- [ ] Move the generic grammar framework, G-01 records and G-01 precedent cases out of `docs/computational/`.
- [ ] Repair all affected internal links.
- [ ] Move clearly historical pattern-language records into a provenance/history location where current paths misstate authority.
- [ ] Move Phase-5 Reference House service-topology records into a local history/provenance location if link repair remains proportionate.
- [ ] Do not perform unrelated filesystem churn.

### Stage 3 — navigation architecture

- [ ] Replace the single global sidebar with route-specific VitePress sidebars.
- [ ] Create a small global navbar for major reading areas.
- [ ] Make `.vitepress/navigation.ts` the complete declarative source for nav and sidebars.
- [ ] Remove sidebar mutation logic from `.vitepress/config.ts`.
- [ ] Retain exhaustive Markdown coverage across the union of route-specific sidebars.

### Stage 4 — manuscript reading hierarchy

- [ ] Rebuild the manuscript sidebar around Front Matter and Parts I–V.
- [ ] Nest Repose beneath Part I and External Maintenance Geography beneath Part II.
- [ ] Link Part III directly to the canonical pattern-language area.
- [ ] Link Part IV directly to the canonical Reference House area.
- [ ] Keep Publication Architecture available as structural/reference material rather than part of the primary book sequence.

### Stage 5 — local area sidebars

- [ ] Pattern language: current language first; strategies/candidates/retired identities clearly separated; migration provenance collapsed.
- [ ] Architectural grammar: framework, G-01, evidence/derivation and provenance.
- [ ] Reference House: current architectural work first; old coordination runs under history.
- [ ] Research: subject-led current research, historical migration evidence demoted.
- [ ] Computational: current executable result/review, core model, technical families and crosswalk first; paper/programme history demoted; no G-01 ownership.
- [ ] Development: live controls first; completed migration/audit material under provenance.
- [ ] Prototypes, Delivery, Editorial and Source: concise local sidebars matching their existing ownership roles.

### Stage 6 — content reconciliation

- [ ] Update `docs/reading-guide.md` to match the new reading architecture.
- [ ] Update `docs/manuscript/README.md` to match the actual Part I–V structure.
- [ ] Reconcile stale publication-version references, including `STATUS.md`.
- [ ] Remove the duplicate independently editable governing-principles block from Part I while preserving repository readability outside VitePress.
- [ ] Repair cross-links affected by file moves.

### Stage 7 — verification and closeout

- [ ] Run TypeScript typecheck.
- [ ] Run P0 and pattern-crosswalk tests.
- [ ] Run the VitePress production build.
- [ ] Confirm navigation coverage catches unplaced Markdown pages.
- [ ] Inspect the built hierarchy for both desktop and mobile behaviour.
- [ ] Update this record with completed stages and any deliberate deviations.
- [ ] Update `STATUS.md` only where project state or canonical structure has genuinely changed.

## Stop / resume rule

After every logically complete stage, commit the repository in a buildable or explicitly documented transitional state. If the migration is interrupted, resume from the first unchecked item in this file and verify the current repository state before writing further changes.

Do not infer completion from chat history. The repository and this control record govern.

## Scope guard

This migration is an information-architecture repair, not an excuse for a general rewrite. Move a document when its **ownership is wrong**. Change navigation when its **presentation is wrong**. Rewrite content only where the structural migration exposes duplication, stale authority or misleading prose.