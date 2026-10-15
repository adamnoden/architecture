# Post-freeze figure legibility correction

**Status:** PASS — publication-figure defect repaired and re-proved  
**Date:** 2026-10-15  
**Parent proof:** `publication/pr01-r9-reproof-refreeze.md`  
**Repair PR:** #134 — `Publication — harden figure geometry and legibility`

## Why this record exists

A reader spot-check after PR-01 R9 found real defects in retained publication figures: text was being clipped, overflowing its intended geometry or colliding with neighbouring annotations in the final Working Edition PDF.

This falsifies the literal R9 section 4 result **“no clipping defect found.”** The R9 whole-book contact-sheet method was sufficient for gross page failure but was not sufficient evidence for internal figure geometry and legibility. That historical proof result is therefore superseded on this point by the repair and re-proof recorded here.

The architectural argument was not reopened. This is an argument-neutral publication-legibility repair permitted by the R9 freeze semantics.

## Audit and repair

All eleven retained publication figures D-F01 through D-F11 were audited at source and at final PDF publication scale.

Six Reference House figures required bounded corrections:

- D-F06 — type and orientation;
- D-F07 — spatial and sectional order;
- D-F08 — structural and assembly logic;
- D-F09 — service and maintenance geography;
- D-F10 — water and failure geography;
- D-F11 — external maintenance geography.

Corrections were limited to figure composition and wording needed for legibility: repositioning dimension and annotation bands, separating colliding labels, shortening or wrapping explanatory text, and keeping all visible content inside the SVG canvas. No architectural claim, evidence boundary or Reference House maturity state was promoted.

The remaining five retained figures passed the same audit without source repair.

## Permanent guard

`publication/scripts/validate-figures.ts` is now part of `npm run publication:validate`.

It renders every retained SVG in Chromium and fails repository validation when visible rendered geometry exceeds the SVG viewBox. This makes hard clipping and canvas overflow a CI failure rather than something dependent on visual discovery.

The validator is deliberately narrow. It does not pretend to prove aesthetic quality or detect every possible annotation collision. Final publication-scale visual proof remains the authority for legibility.

## Final proof

After the source repairs, the full **226-page A4 Working Edition** was rebuilt and the retained figure pages were reviewed at publication scale.

Final proof run before removal of temporary artifact-upload machinery:

- workflow run: `38764257283`;
- head: `3ef1b6981af24b749a00cc135760fec678771887`;
- artifact: `publication-figure-hardening-proof`;
- artifact digest: `sha256:cfb7056da47fb435cca15532e065a849944656fb78d2e5dc1e9a4875ec029c28`;
- page count: **226**.

The final proof showed the repaired figure family without the clipping, overflow or annotation collisions that triggered this correction.

The temporary PDF-upload steps were then removed. A final clean repository validation ran against head `6e893eba90cb054f74ede59a264b5e45a0979801` and passed in workflow run `38789634532`.

PR #134 merged at:

`241b2e8df13cf6d6cb83c370a0f3a6fa44b35107`

## Freeze consequence

The R8-F intellectual candidate identity remains:

`a628f6855789a3c591cd052b54f1bfb45de23b39`

PR #134 does not create a new architectural edition. It corrects the presentation of already-frozen content and strengthens the proof gate used to establish that presentation is complete and legible.

The corrected Working Edition may proceed toward PR-02 subject to the separate resolved-work sanitation programme and any other explicitly authorised publication-control work. The old R9 statement that no clipping was found must not be used as evidence against this later, stronger figure audit.
