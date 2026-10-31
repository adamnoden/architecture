<!-- nav-exclude: redirect -->
# TYP-03G — embedded-font proof correction

Status: **COMPLETE — corrected exact Source proof passed rendered-font validation and physical re-confirmation**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Physical gate: GitHub issue **#467 — TYP-03F — physical body-text reading and freeze**  
Discovery arose during: **#478 / TYP-04B**

## 1. Freeze break

Direct inspection of the PDF font dictionaries during TYP-04B exposed a defect in the earlier TYP-03F proof chain.

The selected proof produced by workflow run `39817623755` was described as the exact repo-pinned Source Serif 4 + Source Sans 3 confirmation. Its upstream inputs **were** correctly fetched and verified by Git blob identity, but the generated `@font-face` rules referenced copied font files by relative URL. Vivliostyle/Chromium did not resolve those font resources in the PDF build and silently substituted Liberation fonts.

The resulting PDF therefore embedded Liberation Serif/Sans variants rather than the five intended Source faces.

The TYP-03F closeout consequently overstated the proof boundary. The exact-pinned **input identity** was proved; exact-pinned **rendered font identity** was not.

## 2. What remained valid

The freeze break did not restart font selection.

Still valid throughout the correction:

- Source Serif 4 + Source Sans 3 remained the owner-selected open direction;
- the earlier Source-vs-Newsreader preference remained recorded;
- proprietary candidates remained withdrawn on value/procurement grounds rather than declared aesthetic losers;
- the body geometry candidate remained 10.5 pt / 1.5 / 112 mm, spaced, ragged-right, no hyphenation under ragged composition;
- an earlier local confirmation PDF genuinely embedded Source Serif 4 and supported the Source body-face preference.

Withdrawn until re-proof were only:

- the claim that the final TYP-03F exact-pinned physical sheet rendered the exact Source faces;
- final physical freeze status.

## 3. Owning error

The defect was at the **verified-font-bytes → browser/PDF embedding boundary**.

It was not:

- an upstream pin failure;
- a Source licence failure;
- a manuscript failure;
- a body-metric failure;
- a reason to reopen the candidate field.

The proof machinery previously verified font bytes before composition but did not verify font identity **after PDF composition**. A green build was therefore insufficient evidence.

## 4. Correction

The corrected harness makes two durable changes.

### Deterministic font transport

For non-baseline specimens, the already-authorised supplied font bytes are encoded directly into the ignored generated candidate CSS as data URIs.

This removes path resolution from the proof boundary. No font binary or generated CSS is committed to the public repository.

### Fail-closed rendered identity

`publication/specimens/typ03/validate-pdf-fonts.ts` uses Poppler `pdffonts` against the finished PDF and requires all five Source PostScript names:

- `SourceSerif4-Regular`;
- `SourceSerif4-It`;
- `SourceSerif4-Bold`;
- `SourceSans3-Regular`;
- `SourceSans3-Bold`.

The proof fails if any required Source face is missing or if common system fallbacks such as Liberation / Arial / Helvetica / Times / Georgia appear.

The dedicated selected-proof workflow runs this assertion before uploading the artifact.

## 5. Corrected proof result

PR **#482** merged the correction as `912dbf14bb7733e4ca84e2d8a7754e7254360ef2` from validated head `a4f6f6751b68b2ac66cc7952bcdd1735abba626c`.

Evidence:

- ordinary repo validation run: `39859180904` — **SUCCESS**;
- corrected selected-proof run: `39859180939` — **SUCCESS**;
- artifact: `12461610257` — `typ03f-source-confirmation`;
- artifact digest: `sha256:d6fb39aecd082e294943280e6a7e416bd225e62d9354a101849f668c8f8cef66`;
- rendered-font identity gate: **PASS**;
- independent PDF inspection agreed that Source Serif 4 regular/italic/bold and Source Sans 3 regular/bold were embedded/subset;
- no Liberation fallback was observed.

The project owner physically re-confirmed the corrected exact-font B5 sheet on **23 October 2026** and reported that it looked good. The corrected sheet earned **no metric retuning**.

## 6. Closeout

All four corrective acceptance conditions are satisfied:

1. corrected proof built from the existing Git-blob-verified Source pins — **PASS**;
2. rendered-font identity assertion passed — **PASS**;
3. independent finished-PDF inspection agreed — **PASS**;
4. corrected B5 sheet was physically re-confirmed by the project owner — **PASS**.

TYP-03F may therefore be re-closed with the same frozen body metrics and family selection.

The original workflow run `39817623755` remains retained as historical evidence of the discovered failure but is permanently inadmissible as exact-font proof.

## 7. TYP-04 consequence

TYP-04A remains valid because it froze semantic publication roles rather than visual font metrics.

The pre-correction TYP-04B fallback-font PDF is inadmissible and must not influence aesthetic decisions. TYP-04B may now be replayed from corrected current `main`, using the repaired exact-font transport and rendered-font identity gate as part of its proof boundary.
