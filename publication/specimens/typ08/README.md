# TYP-08 — retained full-book candidate proof

This directory retains the whole-book typography candidate begun in issue #550. `build.ts` now includes the TYP-08C corrections; the [TYP-08D closeout](../../../docs/publication/publication-typography-typ08d-whole-book-red-team-closeout.md) records that completed candidate review.

The candidate deliberately reuses full-publication preparation with `PUBLICATION_RAW_PREPARE=1`, bypassing the later production typography integration, and then mutates only generated proof copies. Canonical manuscript, figure, plate and production-theme files remain untouched.

## Replay boundary

Replay the accepted candidate from the complete code, publication manifest and manuscript checkout at the exact validated revision recorded in the [TYP-08D closeout](../../../docs/publication/publication-typography-typ08d-whole-book-red-team-closeout.md#3-exact-final-proof-authority). `PUBLICATION_RAW_PREPARE=1` bypasses production typography integration; it does not reconstruct historical source inputs.

This retained five-division harness is not the current-book proof entry point. Use the [publication workflow](../../README.md#ordinary-workflow) and [production typography proof](../../../.github/workflows/publication-typography.yml) for the current publication.

## Candidate integration scope

The proof owns only these temporary integration duties:

- load the exact pinned Source Serif 4 Regular / Italic / Bold and Source Sans 3 Regular / Bold bytes already frozen by TYP-03;
- map the prepared full-book HTML/Markdown onto the frozen TYP-03 body, TYP-04 hierarchy/navigation and TYP-05 mixed-content roles;
- rebind reader-facing copied FLOW / DRW SVG lettering to the physically proven TYP-06 Source Sans interface without changing canonical SVG bytes or drawing geometry;
- remove the generated A4-only controlled-plate style from the prepared Part IV copy so the proof theme can compose the same real plate pages at A4 and conservative 176 × 250 mm B5 without fit-scaling controlled drawing sizes;
- represent Appendix C as the TYP-05 labelled-record schedule rather than the legacy five-column miniature table;
- represent the two existing architectural text/arrow sequences as Source Sans sequence blocks rather than code;
- keep bibliographic citation text serif-led while rendering long URLs as subordinate Source Sans;
- build exact-font A4 and B5 PDFs, verify every finished-PDF font face and page geometry, and render a deterministic B5 page-image corpus for TYP-08B.

This is **retained candidate-only integration**. It does not migrate `publication/theme.css`, change manuscript prose, alter canonical figures/drawings, decide PLT drawing typography, or replace the accepted [production typography release](../../../docs/publication/publication-typography-v1-release.md). TYP-08B retains the page-by-page defect ledger; TYP-08C/D record its correction and closeout.
