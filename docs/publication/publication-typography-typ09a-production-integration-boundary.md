<!-- nav-exclude: redirect -->
# TYP-09A — Production typography integration boundary

Status: **IMPLEMENTATION CANDIDATE**  
Programme: TYP #425  
Parent: TYP-09 #702  
Packet: #703

## Decision

TYP-09A migrates the frozen typography contract into the authoritative full-book production path as a **new, explicit layer**. It does not rewrite `publication/theme.css` and pretend the historical working system never existed.

The production stack becomes:

1. `publication/theme.css` — historical working/base-structure layer;
2. generated `.work/typography-fonts.css` — exact pinned Source font transport;
3. `publication/typography.css` — frozen TYP-03/04/05/06 reader-facing roles;
4. `publication/formats/a4.css` or `publication/formats/b5.css` — proved page geometry;
5. `publication/division-recto-entry.css` — Part-entry-only recto constraint.

This ordering makes the migration legible, reversible and auditable. The older Georgia/Arial declarations remain visible as history/base fallback but cease to own the full-book reader-facing typography because the frozen production layer follows them in the cascade.

## Migrated authority

### TYP-03

- Source Serif 4 Regular / Italic / Bold;
- 10.5 pt / 1.5 body;
- 125 mm A4 proof measure and 112 mm conservative-B5 measure;
- spaced paragraphs;
- ragged right;
- hyphenation off;
- 3/3 widows and orphans;
- true serif italic.

### TYP-04

- title and edition roles;
- imprint separation;
- two-level restrained contents hierarchy;
- Part openings at 24 pt / 1.08, recto and furnitureless;
- internal entry openings at 18 pt / 1.12 with retained folio;
- H2/H3+ hierarchy;
- semantic division/entry running state;
- 7.2 pt running furniture and 7.5 pt folios;
- intentional blank suppression.

### TYP-05

- compact analytical tables;
- Appendix C labelled schedule records;
- architectural text/arrow sequence;
- citation + URL split;
- captions and plate furniture;
- no reader-facing mono role for the proved current corpus.

### TYP-06

- Source Sans 3 Regular / Bold only;
- no drawing-sans italic;
- tabular numerals where earned;
- generated FLOW/DRW copies rebind Arial declarations to exact pinned Source Sans without mutating canonical SVG bytes.

## Permanent production preparation semantics

`publication/scripts/typography.ts` now owns only generated full-book copies and:

- emits exact pinned Source font CSS from immutable upstream commits + Git blob checks;
- transforms Appendix C, architectural sequence and source/reference roles exactly as proved;
- strips the obsolete generated A4-only plate stylesheet from the staged Part IV copy;
- rebinds controlled generated SVG copies to exact Source Sans;
- emits semantic division/entry markers;
- adds generated Part body page-group roles;
- maps Part I Notes to the frozen citation/URL roles;
- removes revision/date/site provenance from the principal title page and emits a generated imprint page;
- records restart-safe integration evidence in `.work/typography-integration.json` and `build.json`.

Canonical manuscript, pattern and SVG bytes remain outside this transformation boundary.

## Format boundary

The existing `publication:build` path remains A4 by default for compatibility. The full-book production config also admits `PUBLICATION_FORMAT=b5`, using the exact conservative-B5 geometry proved through TYP-08. Auxiliary smoke/primer builds remain on the historical working theme in this packet; they are validation/derivative outputs and are not the PR-02 release object.

## Explicitly deferred to TYP-09B

TYP-09A does **not** migrate the TYP-08 proof harness wholesale. TYP-09B #704 owns the final mechanical production gate:

- finished-PDF exact-font identity checks;
- qpdf destination normalisation and integrity checks;
- Poppler parser-warning fail-closed checks;
- production opening/blank/running-state regressions;
- deterministic A4/B5 paired proof automation;
- final separation of diagnostics from release artefacts.

This is deliberate. Production owns typography semantics in 09A; 09B makes those semantics mechanically fail-closed.

## Before / after

Before TYP-09A, the authoritative full-book path was an A4 working system whose reader-facing serif/sans authority remained Georgia/Arial-family stacks, `72ch`, automatic hyphenation, environment-based running heads and title-page provenance.

After TYP-09A, the full-book path consumes the frozen Source Serif / Source Sans contracts, proved body/hierarchy/mixed-content metrics, semantic running state, imprint separation and A4/B5 geometry, while preserving the old working layer as explicit history/base structure.

No typography design question is reopened by this migration.
