<!-- nav-exclude: redirect -->
# TYP-04C — hierarchy, openings and navigation freeze

Status: **COMPLETE — hierarchy system accepted and frozen**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Owning packet: **#478 — TYP-04 — hierarchy, openings and navigation**  
Closeout packet: **#490 — TYP-04C — hierarchy freeze closeout**  
Body-reading authority: `docs/publication/publication-typography-typ03f-source-selection.md`

## 1. Decision

Ovid’s House uses a deliberately small publication hierarchy built around the frozen Source system:

- **Source Serif 4 regular** leads book, division, entry, contents and imprint-title openings;
- **Source Sans 3** carries section/minor hierarchy, labels, contents rows, running context and folios;
- the frozen TYP-03 body system remains unchanged;
- there is **no separate pattern-title scale**;
- there is **no tertiary contents level**;
- there is **no H5/H6 visual hierarchy** unless later evidence demonstrates a real navigation failure.

The accepted posture is serif-led literary/architectural openings with sans-led navigation and furniture. The hierarchy is intentionally restrained: it must navigate clearly without turning the publication into a report, dashboard, website export or branded architectural-office object.

## 2. Evidence chain

### TYP-04A — semantic role audit

PR **#480** merged as `38d07a09d8426a1c1fd45ae147d268b959f59dc1`.

It froze the smallest role architecture before visual styling:

**Content roles**

- book title;
- division opening;
- entry opening;
- section;
- subsection / minor hierarchy.

**Navigation / furniture roles**

- edition label + imprint/provenance;
- contents title + two TOC levels;
- running context + folio;
- internal cross-reference.

Durable audit: `docs/publication/publication-typography-typ04a-hierarchy-audit.md`.

### TYP-04B — exact-font representative proof

The first visual attempt in PR **#481** is permanently inadmissible as aesthetic evidence because its rendered PDF used Liberation fallbacks.

The corrected replay was PR **#488**, merged as `8d01d978c8364902adc419e5003252eaecd630dd` from validated head `8c3513bac53fca58a0dd155b6c038201e9e58aa1`.

Proof evidence:

- ordinary repository validation: run **39927364091 — SUCCESS**;
- exact hierarchy proof: run **39927363952 — SUCCESS**;
- artifact: **12489992297 — `typ04b-hierarchy-proof`**;
- artifact digest: `sha256:991029f7be240b2bb77298453bc7e527c89c30f9736bbd4aefb2ed596a5f1e0c`;
- B5 proof: `typ04b-serif-led-b5.pdf`;
- B5 extent: **13 pages, 176 × 250 mm**;
- finished A4 and B5 PDFs report embedded `SourceSerif4-Regular`, `SourceSans3-Regular` and `SourceSans3-Bold`;
- no Liberation / common system-font fallback was detected;
- rendered inspection found no clipping, broken glyphs or composition corruption across title, contents, division, entry/body, pattern, appendix, running furniture and recto-start pages.

The project owner accepted the handed-off B5 candidate on **23 October 2026** with the verdict **“LGTM”** after being instructed to review the proof at **100% / Actual Size**. No second visual candidate or metric retuning was earned.

This record does not convert that terse acceptance into invented qualitative observations. The evidenced result is simply that the exact-font candidate was accepted as the hierarchy direction without requested change.

## 3. Frozen body input

TYP-04 does not alter TYP-03. The inherited body contract remains:

- body serif: **Source Serif 4 regular**;
- companion sans: **Source Sans 3**;
- body size: **10.5 pt**;
- leading: **1.5**;
- conservative-B5 practical measure: **112 mm**;
- paragraph rhythm: **spaced paragraphs**;
- composition: **ragged-right**;
- hyphenation: **off** under the frozen ragged composition;
- widows / orphans: **3 / 3** where supported;
- emphasis: **true Source Serif 4 italic**;
- semantic bold: **Source Serif 4 bold** where required.

Later TYP packets must not retune these values to solve technical-page problems without a concrete TYP-03 freeze break.

## 4. Frozen hierarchy metrics

The following metrics are the accepted TYP-04 visual contract. They are frozen as a coherent family, not a menu of independent defaults.

### Book title

- family: **Source Serif 4 regular**;
- size: **31 pt**;
- line-height: **1.02**;
- tracking: **−0.012 em**;
- maximum title width: **120 mm**;
- title-page top offset: **19 mm**;
- no running furniture or folio on the title page.

### Edition / division labels

- family: **Source Sans 3 bold**;
- size: **7.5 pt**;
- line-height: **1.2**;
- tracking: **+0.12 em**;
- case: **uppercase**;
- space below: **5 mm**.

These are small orienting labels, not competing headings.

### Imprint / provenance page

- imprint title: **Source Serif 4 regular, 18 pt / 1.12**, with **6 mm** below;
- supporting imprint text: **Source Sans 3 regular, 8.5 pt / 1.45**;
- page top offset: **30 mm**;
- subordinate imprint note: **8 mm** above, muted;
- no running furniture or folio.

The principal title page remains free of proof/provenance clutter; subordinate edition/provenance information belongs here.

### Contents

**Contents title**

- Source Serif 4 regular;
- **20 pt / 1.08**;
- tracking **−0.01 em**;
- **9 mm** below.

**Contents note**

- Source Sans 3 regular;
- **7.5 pt / 1.35**;
- maximum width **100 mm**;
- **8 mm** below;
- muted tone.

**Primary TOC rows**

- Source Sans 3 bold;
- **9.5 pt / 1.25**;
- **2.8 mm** top separation.

**Secondary TOC rows**

- Source Sans 3 regular;
- **9 pt / 1.25**;
- **1.2 mm** top separation;
- **6 mm** left indent.

**TOC composition**

- exactly **two reader-facing levels**;
- page number in a separate right-aligned column;
- column gap **5 mm**;
- tabular numerals;
- no dot leaders;
- optional qualifier at **0.88 em**, regular weight, muted, with **0.45 em** following space;
- rows do not break internally;
- no running furniture or folio on contents pages.

### Division opening

- family: **Source Serif 4 regular**;
- size: **24 pt**;
- line-height: **1.08**;
- tracking: **−0.012 em**;
- maximum title width: **115 mm**;
- top offset: **31 mm**;
- starts on a **right-hand / recto page**;
- no running furniture or folio.

Optional division deck:

- inherited serif voice;
- **9.5 pt**;
- maximum width **92 mm**;
- **16 mm** above;
- muted.

A division opening is a structural threshold, not a poster page.

### Entry opening

- family: **Source Serif 4 regular**;
- size: **18 pt**;
- line-height: **1.12**;
- tracking: **−0.008 em**;
- **8 mm** below the title;
- page top offset: **13 mm**;
- starts on a new page, but not every entry is forced to recto;
- running context is suppressed on the first entry page;
- folio remains available unless another page role suppresses it.

The same entry-opening role serves chapters, pattern entries and appendix entries. Content category alone does not earn a new title scale.

### Section

- family: **Source Sans 3 bold**;
- size: **11 pt**;
- line-height: **1.2**;
- spacing: **8 mm above / 2.5 mm below**;
- avoid a page break immediately after the heading.

### Minor / subsection

- family: **Source Sans 3 bold**;
- size: **9.5 pt**;
- line-height: **1.25**;
- spacing: **6 mm above / 2 mm below**;
- avoid a page break immediately after the heading.

No further visual heading tier is authorised merely because source Markdown contains deeper levels.

## 5. Running navigation and folios

Running furniture uses **Source Sans 3** and remains subordinate to the page.

### Running context

- size: **7.2 pt**;
- line-height: **1**;
- left / verso: current **division** context;
- right / recto: current **entry** context;
- tracking: **+0.02 em** on verso division context;
- tracking: **+0.015 em** on recto entry context.

### Folio

- family: Source Sans 3 regular;
- size: **7.5 pt**;
- line-height: **1**;
- bottom-left on verso;
- bottom-right on recto.

### Suppression rules

All running context and folios are suppressed on:

- title pages;
- imprint/provenance pages;
- contents pages;
- division openings;
- intentional parity blanks.

Entry-opening pages suppress the top running context while retaining the folio.

Intentional blank pages carry **no furniture at all**.

## 6. Cross-reference treatment

Reader-facing links are not allowed to make the printed book look like a browser export.

- internal cross-references inherit text colour and carry **no underline**;
- external links retain an ordinary underline where a visible link treatment is materially useful;
- underline thickness: **0.35 pt**;
- underline offset: **0.12 em**;
- long link text may wrap rather than overflow.

TYP-05 may revisit long URL and machine-like text handling where the difficult-content corpus earns it; it may not turn ordinary internal references back into web UI.

## 7. Page geometry used for proof

The hierarchy was judged in the conservative B5 proof territory:

- page: **176 × 250 mm**;
- top / bottom margin: **20 mm / 20 mm**;
- inner margin: **23 mm**;
- outer margin: **18 mm**;
- body measure: **112 mm**;
- nominal live height token: **210 mm**.

A4 remains regression territory rather than the final physical hierarchy target:

- page: A4;
- top / bottom: **23 mm / 24 mm**;
- inner / outer: **30 mm / 22 mm**;
- body measure: **125 mm**;
- nominal live height token: **250 mm**.

Hierarchy sizes themselves are not independently rescaled between A4 and B5 in the accepted specimen.

## 8. Role boundaries

The accepted hierarchy deliberately refuses several tempting proliferations:

- no pattern-specific title size;
- no strategy/candidate-specific title size;
- no appendix-specific title family;
- no third TOC level;
- no ornamental display face;
- no independent architectural-office drawing typeface;
- no H5/H6 visual token set by default.

Publication semantics must eventually assign these roles explicitly. Repository path names, heading IDs and source file classes are not a legitimate long-term typography API.

## 9. Exact-font proof boundary

All future TYP specimen work inheriting this hierarchy must preserve the corrected TYP-03G font-evidence boundary:

1. retrieve the exact pinned Source files through the verified open-font fetcher;
2. transport verified font bytes deterministically into the generated specimen;
3. inspect the **finished PDF**, not only source inputs;
4. fail closed if required Source faces are absent or common system fallbacks appear.

A green browser/PDF build without rendered-font identity evidence is not sufficient typography proof.

## 10. Production boundary

TYP-04 freezes the hierarchy/opening/navigation **contract** and its proven specimen values.

It does **not** yet rewrite production `publication/theme.css` wholesale. Production-wide token integration remains a later TYP programme task, after technical-content, drawing-interface, representative-signature and whole-book gates have had an opportunity to expose conflicts.

TYP-05 may inherit these values directly for technical/mixed-content testing. It may introduce only the smallest additional roles earned by difficult content.

## 11. Closeout

TYP-04 is complete.

The book now has:

- a physically accepted body-reading system from TYP-03;
- a restrained, exact-font-proved hierarchy/opening/navigation system from TYP-04;
- explicit role boundaries that prevent report/dashboard hierarchy creep;
- reproducible A4/B5 specimen machinery;
- fail-closed rendered-font evidence.

Next authorised packet: **#489 — TYP-05 — technical / mixed-content typography**.
