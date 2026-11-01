# TYP-08A — full-book candidate proof

This directory builds the first whole-book typography candidate for issue #550.

The candidate deliberately reuses the ordinary full-publication preparation path and then mutates only generated `publication/.work` copies. Canonical manuscript, figure, plate and production-theme files remain untouched.

The proof owns only these temporary integration duties:

- load the exact pinned Source Serif 4 Regular / Italic / Bold and Source Sans 3 Regular / Bold bytes already frozen by TYP-03;
- map the prepared full-book HTML/Markdown onto the frozen TYP-03 body, TYP-04 hierarchy/navigation and TYP-05 mixed-content roles;
- rebind reader-facing copied FLOW / DRW SVG lettering to the physically proven TYP-06 Source Sans interface without changing canonical SVG bytes or drawing geometry;
- remove the generated A4-only controlled-plate style from the prepared Part IV copy so the proof theme can compose the same real plate pages at A4 and conservative 176 × 250 mm B5 without fit-scaling controlled drawing sizes;
- represent Appendix C as the TYP-05 labelled-record schedule rather than the legacy five-column miniature table;
- represent the two existing architectural text/arrow sequences as Source Sans sequence blocks rather than code;
- keep bibliographic citation text serif-led while rendering long URLs as subordinate Source Sans;
- build exact-font A4 and B5 PDFs, verify every finished-PDF font face and page geometry, and render a deterministic B5 page-image corpus for TYP-08B.

This is **candidate-only integration**. It does not migrate `publication/theme.css`, change manuscript prose, alter canonical figures/drawings, decide PLT drawing typography, or release final production typography. TYP-08B owns the page-by-page defect ledger; TYP-09 owns final production integration and `publication-typography-v1`.
