<!-- nav-exclude: redirect -->
# TYP-05C — technical / mixed-content typography freeze

Status: **COMPLETE — mixed-content system physically accepted and frozen**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Owning packet: **#489 — TYP-05 — technical / mixed-content typography**  
Inventory packet: **#494 — TYP-05A — difficult-content inventory and failure map**  
Physical specimen packet: **#497 — TYP-05B — exact-font mixed-content specimen and first technical candidate**  
Closeout packet: **#507 — TYP-05C — mixed-content typography freeze closeout**  
Inherited body authority: `docs/publication/publication-typography-typ03f-source-selection.md`  
Inherited hierarchy authority: `docs/publication/publication-typography-typ04c-hierarchy-freeze.md`

## 1. Decision

The frozen Source Serif 4 + Source Sans 3 publication system survives the current reader-facing difficult-content corpus without a third type family and without a parallel technical-documentation language.

TYP-05 freezes the following posture:

- **Source Serif 4 + Source Sans 3 remain the complete publication family architecture** for the present corpus;
- **no publication mono family is admitted**;
- **no display-math family or equation system is admitted**;
- the compact Part V analytical matrix remains a restrained table;
- the prose-heavy Appendix C implementation schedule is presented as labelled records rather than miniaturised into a five-column report grid;
- the two architectural text/arrow sequences use Source Sans 3, not code styling;
- bibliographic citations remain serif-led while long URLs are subordinate, breakable Source Sans 3;
- inline figure captions and architectural plate furniture use Source Sans 3 as book typography;
- ordinary dense lists receive no special technical voice;
- tabular figures are used only where alignment materially earns them;
- drawing-internal annotation sizes, placement and hierarchy remain PLT authority.

The TYP-03 body contract and TYP-04 hierarchy contract are unchanged.

## 2. Evidence chain

### TYP-05A — corpus inventory and failure map

PR **#495** merged as `73be228a0841662cb38dce14de9c0a6a9a17040a`.

Executable inventory evidence:

- workflow: **TYP-05 difficult-content inventory**;
- run: **39939776875 — SUCCESS**;
- artifact: **12495900442 — `typ05a-difficult-content-inventory`**;
- artifact digest: `sha256:9fed8a78e1957c82342245a6bb46a1f0acaaae73a49bc78e6523ff15616bd595`.

The inventory established the important negative results: the current publication corpus contains no genuine reader-facing code class requiring monospacing and no display-math class requiring a mathematics system. Its actual stresses are table/schedule composition, URLs, captions/plate furniture, numerals/units/scales, two text sequences and sustained list rhythm.

### TYP-05B — exact-font mixed-content proof

PR **#499** merged as `c8b720218c6791761d6d4d14ea940ef5c3819e1a` from validated head `6be7f45ea5f7ee7e741addbb07cdc42cf95a3f32`.

Final proof evidence:

- exact mixed-content run **39941744729 — SUCCESS**;
- whole-repository/publication validation **39941744734 — SUCCESS**;
- TYP-05 inventory run **39941744762 — SUCCESS**;
- artifact **12496412315 — `typ05b-mixed-content-proof`**;
- artifact digest `sha256:b537dfe2dd8f5a181eab2e40f5df07bd7ee6ebdf7946062ed162519e3055e227`;
- conservative-B5 proof: **11 pages, 176 × 250 mm**;
- finished PDF embeds `SourceSerif4-Regular`, `SourceSerif4-Bold`, `SourceSans3-Regular` and `SourceSans3-Bold` with no common system-font fallback;
- rendered inspection found no clipping, overflow, broken glyphs or composition corruption.

The proof deliberately uses neutral visual fields for inline-figure and plate specimens. Generated architectural drawing assets and figure-internal lettering are not TYP-05 inputs; actual drawing-internal typography remains a TYP-06 / PLT concern.

### Physical owner verdict

The exact B5 proof was handed off for review at **100% / Actual Size**.

On **24 October 2026** the project owner returned the verdict **`LGTM`**. No revision, metric retuning or qualitative defect was supplied.

This record does not convert that terse acceptance into invented observations. The evidenced result is simply that the exact-font mixed-content candidate was physically accepted without requested change.

### Post-merge reconciliation

TYP-05B merged at `c8b720218c6791761d6d4d14ea940ef5c3819e1a`. Before physical closeout, current `main` had advanced to `6eb965582819df4e5b12bd26b8d9e19cb352be42` through DPL work.

The intervening changes do not touch the TYP-05 specimen harness, font inputs, publication content inputs used by the proof, or TYP-05 authority records. The physically reviewed artifact therefore remains the exact TYP-05B evidence object; no replay or visual re-judgement is earned merely because unrelated DPL history advanced `main`.

## 3. Inherited body contract remains frozen

TYP-05 does not alter TYP-03. The body contract remains:

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

TYP-05 technical roles may not be used as a back door to retune this reading system.

## 4. Frozen mixed-content roles and metrics

The following values are the accepted TYP-05 specimen contract. They are a coherent role family, not arbitrary defaults to apply to all technically themed pages.

### Compact analytical table

Use for concise, genuinely tabular comparisons such as the Part V B0–B3 matrix.

- family: **Source Sans 3**;
- size: **8.5 pt**;
- line-height: **1.32**;
- tabular numerals: **on**;
- top / bottom rule: **0.5 pt**;
- header rule: **0.35 pt**;
- ordinary row rule: **0.2 pt**, subordinate;
- cells remain top-aligned and may break long material rather than overflow.

This is a compact table, not a general report-grid language.

### Dense implementation schedule

Appendix C does **not** inherit the compact-table treatment. Its prose obligations are represented as labelled schedule records.

**Record subject**

- family: **Source Serif 4 bold**;
- size: **10.5 pt**;
- line-height: **1.25**.

**Field label**

- family: **Source Sans 3 bold**;
- size: **7.2 pt**;
- line-height: **1.2**;
- case: **uppercase**;
- tracking: **+0.055 em**;
- label column: **27 mm**;
- label/body gap: **4 mm**.

**Field body**

- family: **Source Serif 4 regular**;
- size: **9.2 pt**;
- line-height: **1.38**;
- long content may break rather than force a smaller type size.

Records use a restrained **0.35 pt** top rule and should avoid internal page breaks where the composition engine permits.

The semantic schedule remains intact; only its reader-facing composition changes from a five-column miniature report to a readable record sequence.

### Architectural sequence block

Use for the two existing ordered text/arrow architectural sequences.

- family: **Source Sans 3**;
- size: **8.5 pt**;
- line-height: **1.25**;
- maximum block width in the accepted specimen: **94 mm**;
- text alignment: **centred**;
- step text: **bold**, tracking **+0.015 em**;
- arrows: **10 pt**;
- restrained rules may separate steps.

This is architectural ordered logic, not software code. Monospacing is not admitted.

### Source citation and long URL

**Citation**

- family: **Source Serif 4 regular**;
- size: **9.3 pt**;
- line-height: **1.4**.

**URL**

- family: **Source Sans 3 regular**;
- size: **7.6 pt**;
- line-height: **1.3**;
- visually subordinate / muted;
- controlled breaking is permitted to prevent overflow and rag damage.

A bare URL does not create a technical voice or earn a mono family.

### Inline figure caption

- family: **Source Sans 3 regular**;
- size: **8.3 pt**;
- line-height: **1.35**;
- subordinate / muted relative to body prose and the figure itself.

TYP-05 proves the book caption role. It does not govern lettering inside the controlled figure artwork.

### Architectural plate furniture

**Plate title**

- family: **Source Sans 3 bold**;
- size: **11 pt**;
- line-height: **1.15**.

**Scale**

- family: **Source Sans 3 regular**;
- size: **8.3 pt**;
- line-height: **1**;
- tabular numerals: **on** where numeric scale alignment benefits;
- `NTS` remains ordinary sans text rather than receiving a special style.

**Plate caption**

- family: **Source Sans 3 regular**;
- size: **8.3 pt**;
- line-height: **1.35**;
- subordinate / muted.

These values govern plate furniture as part of the book. They do **not** freeze room labels, dimensions, level markers, leaders or other drawing-internal annotation.

### Ordinary dense list

No TYP-05-specific visual token is admitted.

Dense lists remain in the inherited body/hierarchy system with ordinary list geometry. Technical subject matter alone is not a reason to switch the page to sans, compact the text or create report-style furniture.

## 5. Numerals, units, ranges and symbols

TYP-05 freezes the following posture:

- no separate numeric typeface;
- use the serif or sans role already appropriate to the surrounding content;
- use **tabular figures only where alignment materially benefits**, notably compact tabular material and numeric plate scales;
- preserve proper multiplication signs and required unit/symbol glyphs;
- prevent number/unit pairs from breaking awkwardly where composition permits;
- the existing `×`, `→`, `≤`, `≥`, `±` and `≈` corpus is ordinary Source-family content, not evidence for a mathematics system.

If future reader-facing material introduces genuine equations, fixed-column data, compiler diagnostics or source code, that new corpus is a freeze-break question. It is not pre-authorised by this record.

## 6. Negative decisions are part of the freeze

The absence of extra typographic machinery is deliberate.

TYP-05 does **not** admit:

- a publication mono family;
- a display-math family or equation hierarchy;
- a page-wide technical sans mode;
- code styling for canonical architectural pattern names;
- a special dense-list style;
- dashboard cards, shaded report panels or table ornament;
- category-specific type families for patterns, appendices or compiler-adjacent material.

These decisions may be revisited only by a concrete reader-facing failure or genuinely new content class, not because the repository itself contains software.

## 7. TYP / PLT boundary

TYP owns the identity and book use of the publication sans role.

TYP-05 therefore legitimately freezes Source Sans 3 for:

- section/minor hierarchy inherited from TYP-04;
- navigation and running furniture inherited from TYP-04;
- compact tables where admitted;
- sequence blocks;
- long URLs;
- figure captions;
- plate titles, scales and captions.

PLT continues to own drawing-specific use of that publication sans substrate:

- room/place label sizes and hierarchy;
- dimensions, levels and markers;
- drawing annotation weights;
- label anchors and collision behaviour;
- leader spacing;
- BOOK versus WALL paper-space annotation sizes and placement.

TYP-06 is the explicit interface gate that proves the publication-sans family/features at representative drawing-annotation territory and defines the shared token/API boundary. TYP-05 does not pre-empt that work.

## 8. Exact-font and production boundary

All downstream TYP proof work must retain the corrected rendered-font evidence discipline:

1. retrieve the exact pinned Source files;
2. verify their identities before use;
3. transport the verified bytes deterministically into the proof;
4. inspect the **finished PDF** for required Source identities;
5. fail closed on common system-font fallback.

The accepted TYP-05 proof demonstrates the Source Serif regular/bold and Source Sans regular/bold faces actually used by these specimens. The TYP-03 body contract remains authority for Source Serif italic.

TYP-05 freezes the **contract**, not production-wide integration. `publication/theme.css` remains untouched by this closeout. Later TYP gates must integrate the frozen roles, then prove representative signatures and the whole book before `publication-typography-v1` can release.

## 9. Closeout

TYP-05 is complete.

The current publication now has:

- a physically accepted body-reading system from TYP-03;
- a physically accepted hierarchy/opening/navigation system from TYP-04;
- a physically accepted minimal mixed-content system from TYP-05;
- an explicit refusal of unearned mono/math/report typography;
- exact-font, finished-PDF evidence for the accepted specimen;
- a clean authority boundary between book furniture and drawing-internal typography.

Next programme stage: **#508 — TYP-06 — publication-sans / drawing interface contract**. Its first bounded packet is **#509 — TYP-06A — publication-sans boundary audit and specimen brief**, activated only after this closeout lands cleanly.
