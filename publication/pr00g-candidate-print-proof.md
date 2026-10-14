# PR-00G — Candidate Print Proof

**Status:** COMPLETE — PR-00G PASS  
**Date:** 2026-10-14  
**Parent:** PR-00 — Candidate-Book Freeze Execution Programme  
**Entry baseline:** `dcd643eddd031607c7f305a6dc21fb14547b0c65`  
**Proof branch:** `pr00g-candidate-proof`  
**Umbrella issue:** #71 — PUB-01 publication credibility and release programme

PR-00G tested the actual paginated candidate object rather than its source Markdown.

## 1. Proof method

The full publication was built through the existing deterministic pipeline:

```text
npm run publication:prepare
  ↓
Vivliostyle
  ↓
publication/dist/*.pdf
```

For the proof branch only, pull-request CI temporarily uploaded the generated PDF as a short-lived workflow artifact for object inspection. That temporary artifact-upload step was removed before merge; the publication build commands remain canonical.

The inspected artifact was produced by successful PR validation run `38607568015` from head `325b1b940544a0cacb75597de3b71147ab97148d`.

Artifact identity:

- file: `ovids-house.pdf`;
- page count: **212**;
- artifact digest: `sha256:6b57e4b83f5dabcfadad948c7afb799ba067238e80d82cda97232a7346ddd273`;
- renderer: Vivliostyle.js 2.45.1 / Chrome 153;
- page size: A4;
- colour dependency: none required by the retained figure system.

## 2. Inspection performed

The proof was rendered page-by-page and inspected as an object, including a whole-book contact-sheet pass and full-size spot checks of figure-heavy and table-heavy pages.

The inspection covered:

- contents / part / chapter order;
- chapter starts and hierarchy;
- blank-page behaviour;
- headings at page boundaries;
- visually damaging widows/orphans;
- table continuity and splits;
- D-F01→D-F11 at actual rendered page size;
- caption separation;
- monochrome line weight and label legibility;
- missing glyphs or font substitution defects;
- SVG/image clipping;
- excessive whitespace accidents;
- repeated title/H1 artefacts from adapters;
- process/repository language reintroduced by rendering;
- back-matter continuity;
- physical plausibility as an internal candidate-book object.

## 3. Result

No freeze-blocking layout defect was found.

The proof establishes at publication-object scope that:

- the 212-page sequence is coherent;
- intentional blank verso/recto behaviour at major part boundaries reads deliberately rather than as missing content;
- all eleven retained PR-00D figures are present and readable at the current A4 proof measure;
- captions remain attached to their figures;
- no figure or major annotation is visibly clipped;
- the dense Appendix B and Appendix D tables remain readable and continuous across page breaks;
- Part III's repetitive pattern-page rhythm is deliberate and stable rather than a pagination failure;
- Part IV's figure/prose integration is visually coherent;
- back matter closes without orphaned structural elements or missing terminal pages;
- no black-square, missing-glyph or obvious font-substitution defect was observed.

## 4. Accepted non-blockers

The internal proof still identifies itself as **Working Edition**, carries a revision/date and includes the live project URL on its title page.

These are accepted for PR-00G because this artifact is the internally versioned object that PR-01 will attack. They are not treated as the constitution of the later private physical edition. PR-02 retains separate authority over the deliberately stripped private-object treatment, including the already-recorded restraint around overt URL/ISBN/author-brand clutter.

The PDF metadata likewise names the current object as the Working Edition. That is accepted as internal review provenance rather than publication-facing market positioning.

The proof tool reported non-fatal PDF name-token warnings during low-level inspection. They did not produce a visible rendering, navigation or content defect in the inspected artifact and are therefore not freeze blockers at this gate.

## 5. Gate result

**PR-00G — PASS.**

One exact full candidate artifact has been rendered and inspected, and no unresolved freeze-blocking defect remains from the print-proof pass.

The temporary CI artifact-upload machinery has been removed before merge.

The next gate is **PR-00H — Candidate-book freeze**. PR-00H must freeze the exact candidate revision and record its manifest/build identity, known research debt, accepted non-blockers, maturity boundaries and conditions that break the freeze.