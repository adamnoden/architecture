<!-- nav-exclude: redirect -->
# TYP-03G — embedded-font proof correction

Status: **ACTIVE — TYP-03F freeze reopened pending corrected exact physical confirmation**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Physical gate: GitHub issue **#467 — TYP-03F — physical body-text reading and freeze**  
Discovery arose during: **#478 / TYP-04B**

## 1. Freeze break

Direct inspection of the PDF font dictionaries during TYP-04B exposed a defect in the earlier TYP-03F proof chain.

The selected proof produced by workflow run `39817623755` was described as the exact repo-pinned Source Serif 4 + Source Sans 3 confirmation. Its upstream inputs **were** correctly fetched and verified by Git blob identity, but the generated `@font-face` rules referenced copied font files by relative URL. Vivliostyle/Chromium did not resolve those font resources in the PDF build and silently substituted Liberation fonts.

The resulting PDF therefore embedded:

- Liberation Serif variants;
- Liberation Sans variants;

rather than the five intended Source faces.

The TYP-03F closeout consequently overstated the proof boundary. The exact-pinned **input identity** was proved; exact-pinned **rendered font identity** was not.

## 2. What remains valid

This freeze break does not restart font selection.

Still valid:

- Source Serif 4 + Source Sans 3 remains the owner-selected open direction;
- the earlier Source-vs-Newsreader preference remains recorded;
- proprietary candidates remain withdrawn on value/procurement grounds rather than declared aesthetic losers;
- the body geometry candidate remains 10.5 pt / 1.5 / 112 mm, spaced, ragged-right, no hyphenation under ragged composition;
- an earlier local confirmation PDF genuinely embedded Source Serif 4 and supported the Source body-face preference.

What is withdrawn until re-proof:

- the claim that the final TYP-03F exact-pinned physical sheet rendered the exact Source faces;
- final physical freeze status.

## 3. Owning error

The defect is at the **verified-font-bytes → browser/PDF embedding boundary**.

It is not:

- an upstream pin failure;
- a Source licence failure;
- a manuscript failure;
- a body-metric failure;
- a reason to reopen the candidate field.

The proof machinery previously verified font bytes before composition but did not verify font identity **after PDF composition**. A green build was therefore insufficient evidence.

## 4. Correction

The corrected harness makes two changes.

### Deterministic font transport

For non-baseline specimens, the already-authorised supplied font bytes are encoded directly into the ignored generated candidate CSS as data URIs.

This removes path resolution from the proof boundary. No font binary or generated CSS is committed to the public repository.

### Fail-closed rendered identity

`publication/specimens/typ03/validate-pdf-fonts.ts` reads the finished PDF font dictionaries and requires all five Source PostScript names:

- `SourceSerif4-Regular`;
- `SourceSerif4-It`;
- `SourceSerif4-Bold`;
- `SourceSans3-Regular`;
- `SourceSans3-Bold`.

The proof fails if any is missing or if common system fallbacks such as Liberation / Arial / Helvetica / Times / Georgia appear.

The dedicated selected-proof workflow runs this assertion before uploading the artifact.

## 5. Corrected acceptance gate

TYP-03F may close again only after:

1. the corrected selected proof builds from the existing Git-blob-verified pins;
2. the workflow's rendered-font identity assertion passes;
3. direct independent inspection of the resulting PDF agrees that Source faces are embedded;
4. the corrected B5 sheet is physically re-confirmed by the project owner.

No metric retuning is authorised unless the corrected physical Source sheet exposes a specific problem.

## 6. TYP-04 consequence

TYP-04A remains valid because it froze semantic publication roles rather than visual font metrics.

TYP-04B visual evidence is blocked until this correction lands. Its specimen architecture may be replayed after the corrected TYP-03F merge, but the fallback-font PDF generated before this correction is inadmissible and must not influence aesthetic decisions.
