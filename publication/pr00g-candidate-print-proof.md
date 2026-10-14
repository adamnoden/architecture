# PR-00G — Candidate Print Proof

**Status:** active gate control  
**Date:** 2026-10-14  
**Parent:** PR-00 — Candidate-Book Freeze Execution Programme  
**Entry baseline:** `dcd643eddd031607c7f305a6dc21fb14547b0c65`  
**Umbrella issue:** #71 — PUB-01 publication credibility and release programme

PR-00G tests the actual paginated candidate object rather than its source Markdown.

## 1. Proof method

The full Working Edition is built through the existing deterministic publication pipeline:

```text
npm run publication:prepare
  ↓
Vivliostyle
  ↓
publication/dist/*.pdf
```

For the proof branch only, pull-request CI also uploads the generated PDF as a short-lived workflow artifact so it can be inspected outside the runner. The temporary artifact-upload step is removed before PR-00G merges; the publication build commands themselves remain canonical.

## 2. Inspection checklist

The generated artifact must be checked for:

- contents / part / chapter order;
- chapter starts and hierarchy;
- blank-page behaviour;
- headings stranded at page bottoms;
- visually damaging widows/orphans;
- unintelligible table splits;
- D-F01→D-F11 at actual page size;
- caption separation;
- monochrome line weight and label legibility;
- missing glyphs or font substitution defects;
- SVG/image clipping;
- excessive whitespace accidents;
- repeated H1/title artefacts from adapters;
- repository/admin/process language reintroduced by rendering;
- back-matter continuity;
- physical plausibility as the candidate book object.

Page count is recorded but is not a target.

## 3. Correction rule

Freeze-blocking defects are corrected at the highest legitimate source:

1. canonical/publication prose;
2. publication synthesis/composition;
3. adapter;
4. theme/layout only for genuinely typographic defects.

Any correction requires a full rebuild and re-inspection of the affected pages; broad changes require a new whole-book proof.

## 4. Gate

PR-00G passes only after one exact full PDF artifact has been rendered and inspected and all freeze-blocking defects are resolved or explicitly accepted as non-blockers.

The next gate is PR-00H — exact candidate-book freeze.