# TYP-00 — publication typography baseline and proof brief

Status: **candidate baseline**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Baseline commit: `3dd02fca17c15c7e9be0d71eec5bd9e388d09f05`  
Packet scope: current-state inventory and proof brief only

## 1. Purpose

TYP-00 freezes the problem before the project starts selecting typefaces.

The present system is a successful **working publication system**, not a finished book typography. It has been deliberately conservative while the manuscript, drawings and publication machinery were still moving. TYP now has to improve that system without confusing font preference with typography, and without allowing a beautiful isolated specimen to damage sustained reading, pagination, technical clarity or the physical object.

This record therefore fixes:

- the current reader-facing typographic roles;
- the current page and type metrics;
- the current pagination baseline;
- the places where the system is merely functional, generic or inconsistent;
- the physical territory against which candidates must be proved;
- the qualitative brief and explicit rejection criteria;
- the specimen/proof boundary;
- the TYP / PLT authority boundary;
- the restart point for TYP-01.

**TYP-00 selects no final font and changes no production typography.**

---

## 2. Current physical baseline

The executable source of truth is `publication/theme.css` at the baseline commit.

### Working page

| Property | Current value |
|---|---:|
| Page | A4 portrait |
| Page size | 210 × 297 mm |
| Top margin | 23 mm |
| Bottom margin | 24 mm |
| Outside margin | 22 mm |
| Inside margin | 30 mm |
| Ordinary live width | 158 mm |
| Ordinary live height | 250 mm |
| Body maximum | `72ch` |

The 30 mm inner / 22 mm outer split is already duplex-aware. The live width is therefore materially narrower than a symmetric 22 mm A4 page and must be preserved when making regression comparisons.

Special page classes currently alter this baseline:

- title page: zero page margin; internal composition supplies its own 38/30/28 mm padding;
- contents: 28 mm top and 26 mm bottom margins;
- plate pages: full A4 page with explicitly positioned furniture and no running matter;
- blank pages: no running matter;
- entry first pages suppress running heads.

### Pagination baseline

`publication/metadata.json` records the current working edition as:

- **243 A4 pages**;
- **122 duplex leaves**;
- **40 entries**;
- **5 FLOW figures**.

This count is a regression datum, **not a target**. A better final type system is allowed to alter pagination. The cost must simply become visible because page count affects signature planning, book-block thickness, spine width, manufacturing and page turns.

The primer is currently 16 A4 pages / 8 duplex leaves and is useful as a faster secondary regression surface, but it is not sufficient proof of the whole typography.

---

## 3. Current font-role baseline

The working stacks are:

```css
--hk-serif: Georgia, Cambria, "Times New Roman", Times, serif;
--hk-sans: Arial, Helvetica, sans-serif;
--hk-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
```

There is no selected publication family, local font package or `@font-face` embedding contract. Exact rendered faces can therefore vary by environment. That is acceptable for the present working edition and unacceptable as the final publication contract.

### Reader-facing role inventory

| Role | Current implementation | Current metrics / behaviour | TYP owner? |
|---|---|---|---|
| Sustained prose | `--hk-serif` | 10.5 pt / 1.5; `72ch` max; auto hyphenation | yes |
| Paragraph rhythm | body serif | 0.75 em bottom space; no first-line indent | yes |
| Lists | body serif | 1.55 em indent; 0.18 em between sibling items | yes |
| Block quotations | body serif italic | left rule + 5 mm inset | yes |
| Ordinary H1 | `--hk-sans`, bold | 21 pt / 1.12, negative tracking | yes |
| Ordinary H2 | `--hk-sans`, bold | 14.5 pt / 1.18 | yes |
| Ordinary H3 | `--hk-sans`, bold | 11.5 pt / 1.22 | yes |
| H4–H6 | `--hk-sans`, bold | one shared 9.5 pt / 1.25 treatment | yes |
| Major Part opening | `--hk-sans`, bold | 28 pt / 1.05; 28 mm top space | yes |
| Pattern H1 | `--hk-sans`, bold | 18.5 pt / 1.1 | yes |
| Publication title | `--hk-sans`, bold | 34 pt / 1.04 | yes |
| Edition label | `--hk-sans`, bold uppercase | 8.5 pt / 1.2; 0.14 em tracking | yes |
| Title-page metadata | `--hk-sans` | 8.5 pt / 1.45 | yes |
| Contents | `--hk-sans` | 9.5 pt / 1.3; dot leaders; tabular page numerals | yes |
| Contents heading | `--hk-sans` | 23 pt / 1.08 | yes |
| Running heads | hard-coded Arial/Helvetica | 7.5 pt; tracked; muted | yes |
| Folios | hard-coded Arial/Helvetica | 7.5 pt; muted | yes |
| Authored figure captions | `--hk-sans` | 8.3 pt / 1.35; muted | yes |
| Tables | `--hk-sans` | 8.2 pt / 1.32; ruled; no hyphenation | yes |
| Inline code | `--hk-mono` | 0.88 em | yes |
| Code blocks | `--hk-mono` | 7.8 pt / 1.35 | yes |
| Plate title | hard-coded Arial/Helvetica | bold 11 pt / 1.15 | yes |
| Plate scale | hard-coded Arial/Helvetica | 8.3 pt / 1 | yes |
| Plate caption | hard-coded Arial/Helvetica | 8.3 pt / 1.35 | yes |
| Drawing-internal labels | publication-sans role consumed under DRW/PLT authority | sizes/placement are drawing-specific | family contract only |

The last row is an important boundary. TYP owns the **publication sans family and admitted features**. PLT owns the paper-space sizes, hierarchy, placement, collision behaviour and other drawing-specific use of that role.

---

## 4. What is merely functional today

The current system has earned stability, but not finality.

### 4.1 Generic rather than selected faces

Georgia / Arial / system mono are sensible working defaults. They do not constitute a deliberate relationship between prose, navigation, technical matter and drawings. Their strongest virtue is availability.

### 4.2 The sans role is overloaded

The same broad sans idiom currently carries:

- every heading level;
- contents;
- running matter;
- figure captions;
- tables;
- title-page furniture;
- plate furniture;
- the shared drawing-family contract.

That economy may survive TYP, but it has not yet been demonstrated as a coherent finished hierarchy. In particular, bold sans headings at nearly every level can make a manuscript drift toward report/website behaviour if scale and spacing are not controlled carefully.

### 4.3 One conceptual role has multiple implementation paths

`--hk-sans` exists, but several important surfaces bypass it:

- running heads and folios hard-code `Arial, Helvetica, sans-serif` in `theme.css`;
- `publication/plates.ts` hard-codes Arial/Helvetica for the plate page, title, scale and caption.

The final system must not depend on remembering to update several Arial literals when the publication sans changes. TYP-06 is the natural gate for eliminating this split because that packet freezes the sans / drawing interface contract.

### 4.4 Fine hierarchy is compressed

H4, H5 and H6 currently collapse to the same visual treatment. That is defensible in a working corpus but means semantic depth is not always visually recoverable without context.

### 4.5 Small technical sizes have not yet been proved at target trim

Tables at 8.2 pt, plate furniture at 8.3 pt and code blocks at 7.8 pt are known A4 working values. They must not be carried blindly into a smaller physical book. The final decision depends on the selected face, x-height, weight, paper and reproduction, not point size alone.

### 4.6 Body rhythm is A4-working rhythm

10.5 pt / 1.5 is generous and robust for the current face and geometry. It should not become a hidden constraint on the final book. Typeface width, x-height and colour may justify materially different size, leading, measure, paragraph spacing and hyphenation while still improving legibility.

### 4.7 Font reproducibility is not yet a publication guarantee

The fallback stacks deliberately permit environment-specific substitution. A frozen physical edition must instead prove:

- exact font identity;
- exact admitted weights/styles/features;
- deterministic local availability;
- PDF embedding;
- licensing for the intended edition and plausible later public edition.

---

## 5. Qualitative brief

The type system should make the book feel:

- **serious** without institutional stiffness;
- **literary** without preciousness;
- **precise** without clinical coldness;
- **quiet** enough for long reading;
- **slightly strange** without typographic theatre;
- **durable** rather than fashionable;
- capable of carrying prose, evidence, tables, compiler material and architectural drawings without changing voice every time the content type changes.

The desired result is not “architectural-looking typography”. It is typography whose proportion, rhythm and hierarchy feel inevitable for this particular argument and physical object.

A useful governing test remains:

> The reader should remember the argument and the drawings, not notice that the typography was trying to impress them.

---

## 6. Physical target and proof assumptions

TYP does **not** freeze final trim. That remains coupled to PLT / PR-02 physical-layout and manufacturing work.

Typography must nevertheless be tested in a real target territory. The proof envelope is therefore:

1. **A4 working output** — regression comparison against the current 243-page system;
2. **conservative B5 territory** — use approximately ISO B5, 176 × 250 mm, as the smaller physical proof envelope unless PLT has frozen a more authoritative target by the relevant packet;
3. **black-only reproduction**;
4. **warm off-white uncoated stock approximation** where physical proof is required;
5. duplex reading, with inner/outer page behaviour visible;
6. no judgement from browser screenshots or enlarged PDF views in place of 1:1 print.

B5 here is a **proof territory, not a final trim declaration**.

---

## 7. Representative proof corpus

Typography candidates must be compared on stable semantic anchors rather than page numbers because pagination will move.

The specimen set should include real Ovid’s House material covering at least:

1. sustained argumentative prose;
2. a short aphoristic / high-whitespace passage;
3. ordinary H1 → prose and H2/H3 transitions;
4. a major Part opening;
5. a contents/navigation sample with long and short entries;
6. a quotation and mixed list page;
7. an evidence-heavy page with links/citations/source-like text;
8. a dense table with numerals, units and ranges;
9. code or compiler material requiring genuine mono behaviour;
10. an inline FLOW figure with authored caption;
11. a dedicated architectural plate with title, scale and caption;
12. a paired/spread plate condition;
13. a pattern-heavy page;
14. a page where running head/folio and main hierarchy can be judged together.

TYP-01 should freeze exact source anchors for these samples before comparisons proliferate.

The corpus must include awkward material. A face that looks excellent on a title page but fails a table, italic paragraph, technical symbol or 8 pt caption is not a successful publication face.

---

## 8. Specimen and evidence location

Publication tooling already defines `publication/specimens/` as the bounded physical/specimen proof area.

TYP should therefore use:

- `publication/specimens/typography/` for generated or authored typography specimen machinery and outputs that belong in source control;
- `docs/publication/` for durable TYP decision/proof records;
- issue #425 for restart-safe packet closeouts and exact PR/commit/CI state.

Generated disposable build intermediates must not become authority.

No TYP packet may silently alter the production theme while still calling an experiment a specimen. Candidate experiments remain isolated until a packet explicitly authorises production integration.

---

## 9. Rejection criteria

A candidate serif, sans, mono or pairing is rejected if any of the following is true and cannot be corrected without defeating the candidate’s reason for selection.

### Reading / hierarchy

Reject if it:

- tires in sustained prose at plausible book sizes;
- needs an implausibly large size or loose leading to become readable;
- produces weak word shapes, muddy page colour or distracting texture;
- has poor italic or emphasis behaviour;
- turns headings/navigation into visual theatre;
- makes captions or running matter compete with drawings and prose;
- loses essential distinctions in numerals, punctuation, units or technical strings;
- creates ugly tables or requires category-specific font proliferation to rescue them.

### Physical reproduction

Reject if it:

- closes up or becomes brittle in small black-only print on uncoated stock;
- depends on screen antialiasing to look convincing;
- becomes unreliable in the conservative B5 proof envelope;
- produces unacceptable line-length or pagination consequences without a commensurate reading benefit.

### Technical / operational

Reject if it:

- cannot be packaged deterministically for the publication build;
- cannot be embedded reliably into the produced PDF;
- has unclear or unsuitable licensing for the intended private edition and plausible later publication path;
- lacks the weights, italics, numerals, punctuation or technical glyphs the actual corpus requires;
- requires a network font service at build time;
- encourages separate local type systems for plates or drawings instead of one explicit role contract.

### Character

Reject if it is selected principally because it:

- signals “architecture”;
- looks luxurious;
- looks historical;
- looks fashionable;
- produces a striking isolated title page.

Those effects may occur incidentally. None is a sufficient reason to choose the system.

---

## 10. Evaluation criteria for later packets

Candidate systems should be judged in this order:

1. sustained reading quality;
2. hierarchy and navigation clarity;
3. page colour and rhythm across spreads;
4. behaviour under technical/mixed content;
5. relationship between prose, plate furniture and drawing annotations;
6. physical reproduction at target territory;
7. deterministic build / embedding / licensing;
8. pagination and manufacturing consequences;
9. character fit.

Character matters, but only after the system works.

No weighted pseudo-score should disguise judgement. Measurements should expose consequences; physical comparison should decide where qualities are irreducible.

---

## 11. TYP / PLT boundary

TYP owns the book-wide type system:

- families;
- admitted weights/styles/features;
- body size, leading and measure;
- paragraph rhythm;
- heading/navigation hierarchy;
- contents/running matter;
- captions, tables and technical typography;
- hyphenation/justification/rag policy;
- publication-sans contract;
- embedding/licensing/reproduction constraints.

PLT owns drawing-specific use of the publication sans:

- drawing label and dimension sizes;
- annotation hierarchy;
- anchors/collision behaviour;
- paper-space spacing;
- BOOK versus WALL drawing token use;
- drawing-specific placement and graphic grammar.

This prevents two equal mistakes:

1. TYP must not redesign drawing notation while choosing the book’s sans;
2. PLT must not freeze Arial-specific drawing geometry before the final publication sans metrics exist.

The hard programme gate remains **TYP-06 → PLT-03 final typography/token freeze**.

---

## 12. TYP-00 freeze

TYP-00 freezes the following facts and rules:

1. The current production typography remains the comparison baseline until a later packet explicitly replaces it.
2. The baseline working edition is 243 A4 pages at commit `3dd02fca17c15c7e9be0d71eec5bd9e388d09f05`.
3. The current serif/sans/mono stacks are working fallbacks, not presumed finalists.
4. Candidate selection must use real manuscript material and representative difficult content.
5. A4 regression proof and conservative B5 physical proof are both required before final freeze.
6. Final judgement is physical; screenshots are supporting evidence only.
7. Final font identity, licensing and embedding must be deterministic.
8. Page-count movement is allowed but must be measured and explained.
9. The publication sans is one shared conceptual role; current hard-coded Arial paths are baseline debt, not a second role.
10. TYP owns the publication type contract; PLT owns drawing-specific use of that contract.
11. No typeface search may sprawl into an unbounded moodboard.
12. No production typography change is authorised by this packet.

---

## 13. Restart discipline and next authorised packet

On merge, issue #425 should record:

- this baseline record;
- exact merge/head SHA;
- build/CI state;
- confirmation that no production typography changed;
- any cross-programme consequence discovered;
- **TYP-01 — bounded precedent study** as the next authorised packet.

TYP-01 should research typographic jobs, not collect admired books. It should return a small set of transferable conventions and explicit anti-patterns before TYP-02 begins any typeface shortlist.

Until TYP-01 closes, do not choose or integrate final fonts.
