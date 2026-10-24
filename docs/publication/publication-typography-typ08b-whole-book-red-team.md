<!-- nav-exclude: redirect -->
# TYP-08B — whole-book typographic corpus red team

Status: **COMPLETE AUDIT — bounded corrections earned; TYP-08C required**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Owning stage: **#549 — TYP-08 — whole-book typography red team**  
Packet: **#551 — TYP-08B — whole-book typographic corpus red team**  
Candidate authority: **#550 / TYP-08A**, PR **#563**, merge `8e1104ef1ee05790746066b78d75eb9b951839c9`

## 1. Evidence object reviewed

The primary review object is the exact-final TYP-08A conservative-B5 candidate:

- proof run: **40085965363 — SUCCESS**;
- artifact: **12556729306 — `typ08a-full-book-candidate`**;
- artifact digest: `sha256:14a83bed847654cb3689ae6b58cb03438b95d32dc40f720a7462c658f3e691d1`;
- B5: **317 pages / 159 leaves**, 176 × 250 mm;
- A4 regression: **260 pages / 130 leaves**;
- finished PDFs: exactly the five frozen Source faces;
- all pages: correct physical geometry;
- B5 review corpus: 317 indexed page images.

The review does not reopen font choice, body metrics, hierarchy metrics or TYP-05 role metrics. It asks whether the complete candidate **actually applies the frozen contracts correctly at corpus scale**.

## 2. Review method

The audit used four complementary passes.

### Whole-corpus visual pass

All **317 B5 pages** were inspected through the deterministic page-image corpus, first as ordered contact sheets and then at individual-page scale where a page or transition warranted closer inspection.

This pass covered:

- page colour and prose rhythm;
- opening / closing pages;
- contents;
- running furniture;
- pattern entries;
- FLOW figures;
- architectural plates and paired/spread transitions;
- appendix tables / records / references;
- intentional blanks and page turns.

### Targeted high-resolution pass

Pages around the title/contents, Part openings, Notes, Part transitions, plate transitions, Appendix C and Appendix E were inspected individually. Representative page addresses cited below use the B5 candidate.

### Text / page-boundary diagnostics

Finished-PDF text extraction was used to map content across page boundaries and identify suspicious sparse tails, running-context values and source-note behaviour. This was diagnostic only; no OCR was used.

### Secondary A4 comparison

The A4 candidate was used as a regression/reference object where a finding might plausibly be B5-specific. The material defects below are semantic/integration defects, not B5-only shrinkage failures.

## 3. Overall result

The red team does **not** earn a new typography system.

The dominant result is positive:

- sustained prose retains a stable, readable-looking page colour across the complete corpus;
- the pattern corpus remains coherent without category-specific typography;
- the two-family Source architecture survives the whole book;
- the controlled plate family remains legible at its intended paper-space sizes without fit-scaling;
- Appendix C's labelled-record treatment scales to all 40 records;
- the two architectural sequence blocks remain distinct without a mono family;
- TOC hierarchy remains restrained and navigable;
- no widespread clipping, glyph corruption, overlap or overflow appeared in the visual corpus.

However, the candidate exposes **five bounded defects**. Four are direct integration failures against already frozen TYP contracts; one is a PDF-transport interoperability defect. These defects are small enough to correct without reopening design decisions, but material enough that TYP-08C is required.

## 4. Defect ledger

### TYP08B-D01 — verso running context exposes proof-harness title

**Severity:** material navigation/integration defect  
**Observed:** throughout ordinary verso pages; representative example **B5 p48**  
**Current output:** `TYP-08A full-book candidate — B5`  
**Owning authority:** TYP-04 running-navigation freeze / TYP-08 candidate integration seam  
**Disposition:** **ADMIT TYP-08C CORRECTION**

TYP-04 freezes:

- verso running context = current **division**;
- recto running context = current **entry**;
- Source Sans 3 at 7.2 pt / 1;
- opening/blank suppression rules.

The TYP-08A candidate instead uses Vivliostyle's generic `env(pub-title)` on verso pages. Because the proof configuration's publication title is `TYP-08A full-book candidate — B5`, proof-harness metadata leaks into the reader-facing book.

This is not a font or metric problem. TYP-08C must restore semantic division/entry strings in the generated candidate so the frozen TYP-04 running-navigation contract is actually exercised.

No new running-head style is authorised.

---

### TYP08B-D02 — Part/division openings are not composed as frozen division-opening pages

**Severity:** material hierarchy/page-turn defect  
**Observed:** all Part openings; representative examples **B5 p19, p51, p91, p203 and p257**  
**Owning authority:** TYP-04 division-opening freeze / TYP-08 candidate integration seam  
**Disposition:** **ADMIT TYP-08C CORRECTION**

TYP-04 freezes a division opening as:

- Source Serif 4 regular, 24 pt / 1.08;
- maximum title width 115 mm;
- 31 mm top offset;
- **right-hand / recto start**;
- no running furniture or folio;
- a structural threshold distinct from the following entry opening.

The TYP-08A candidate styles Part `h1` elements but leaves the first chapter/entry content flowing immediately beneath them on the same page. Representative p19 carries `Part I — The Proposition` and `1. The house after completion` on the same page; p51 similarly combines `Part II — Architecture of the Platform` with chapter 6.

This is not evidence that the frozen 24 pt division title is wrong. The semantic `division-page` composition from TYP-04 has simply not been integrated into the full candidate.

TYP-08C must expose real division-opening page semantics in the generated proof copy and preserve the already frozen metrics. Resulting pagination movement is expected and must be re-proved rather than resisted.

---

### TYP08B-D03 — Part I Notes bypass the frozen citation / long-URL roles

**Severity:** material mixed-content hierarchy defect  
**Observed:** **B5 pp48–50**  
**Owning authority:** TYP-05 source-citation / URL freeze / TYP-08 candidate integration seam  
**Disposition:** **ADMIT TYP-08C CORRECTION**

TYP-05 already freezes:

- citation: Source Serif 4 regular, **9.3 pt / 1.4**;
- long URL: Source Sans 3 regular, **7.6 pt / 1.3**, subordinate/muted and breakable.

TYP-08A applies those roles to Appendix E source rows, but the Part I Notes apparatus remains ordinary paragraph/link composition. Long underlined URLs therefore carry body-scale visual weight and dominate the page, especially across pp48–50.

No new note type is required. TYP-08C must map the existing Part I Notes citation/URL apparatus onto the already frozen TYP-05 source roles in the generated candidate copy.

Canonical manuscript wording must remain unchanged.

---

### TYP08B-D04 — title page carries proof/provenance metadata that TYP-04 assigns to imprint/provenance

**Severity:** material front-matter hierarchy/integration defect  
**Observed:** **B5 p1**  
**Owning authority:** TYP-04 title/imprint freeze / TYP-08 candidate integration seam  
**Disposition:** **ADMIT TYP-08C CORRECTION**

The title page currently carries:

- `WORKING EDITION`;
- date;
- revision hash;
- project URL.

The edition label itself is compatible with the frozen orienting-label role. The problem is that date/revision/URL proof metadata remains on the principal title page.

TYP-04 explicitly freezes the principal title page as free of proof/provenance clutter and assigns subordinate provenance to an **imprint/provenance page** using the 18 pt serif imprint title and 8.5 pt sans supporting text.

TYP-08C should therefore prove the frozen front-matter architecture in the candidate:

- retain only genuinely title-page material on the title page;
- move candidate provenance into a dedicated imprint/provenance page in generated proof space;
- do not make a final editorial decision here about which provenance fields survive the private object edition. That final production-content choice remains TYP-09 / PR-02 authority.

This correction tests the frozen hierarchy; it does not author the final colophon.

---

### TYP08B-D05 — embedded SVG data-URI font transport provokes finished-PDF parser warnings

**Severity:** mechanical interoperability / proof-transport defect  
**Observed:** complete B5 candidate; A4 exhibits the same class  
**Owning authority:** TYP exact-font transport / TYP-08 candidate proof seam  
**Disposition:** **ADMIT TYP-08C CORRECTION**

The visual result and finished-font identity are correct, but Poppler `pdftotext` emits repeated:

`Warning: name token is longer than what the specification says it can be`

On the exact B5 candidate, a fresh full extraction emitted **1,162** such warning lines.

The warning correlates with the proof-only strategy of embedding complete Source Sans data URIs inside each of the 22 controlled SVGs before browser/PDF composition. The same PDF:

- passes `pdfinfo` / geometry checks;
- passes `pdffonts` identity / embedding checks;
- renders correctly;
- passes a Ghostscript null-device parse with no stderr and exit code 0.

Therefore this record does **not** claim the PDF is unreadable or generally invalid. It records a narrower interoperability defect: one mainstream PDF parser reports repeated overlong-name syntax warnings caused by the candidate font-transport seam.

A final publication proof should not knowingly rely on a transport mechanism that creates 1,162 parser warnings merely to achieve exact font identity.

TYP-08C should replace the repeated SVG data-URI transport with the smallest deterministic exact-font resource strategy that:

1. preserves the same pinned Source Sans bytes;
2. keeps all controlled SVG transformations proof-only and canonical-byte-safe;
3. preserves finished-PDF font identity;
4. removes the Poppler warning class;
5. does not convert text to outlines or otherwise destroy semantic text unnecessarily.

If the warning cannot be removed without materially broader production work, record that boundary explicitly rather than suppressing the warning gate.

## 5. Explicit no-change findings

The red team deliberately records unusual pages that **do not** earn corrections.

### Contents — no change

B5 pp2–3 preserve the accepted restrained TOC posture:

- two reader-facing levels;
- no dot leaders;
- clear right-aligned page-number column;
- quiet page colour;
- no evidence that a third level is needed.

The sparse lower field at the end of contents is not itself a defect.

### Main prose page colour — no change

Across Parts I–V, ordinary prose remains stable under the 10.5 pt / 1.5 / 112 mm B5 body contract. The whole-book scan exposes no corpus-wide reason to alter body size, leading, measure, ragged composition or paragraph rhythm.

### Sparse tails before structural transitions — no change

Representative sparse pages such as **p90**, **p201**, **p255** and **p286** were inspected individually.

They are ordinary end-of-entry / end-of-Part tails preceding legitimate structural transitions. They do not show a one-line orphan, collision or typographic failure that justifies compressing the preceding prose or violating a recto/spread boundary.

White space here is cheaper than destabilising the reading system.

### Pattern corpus — no change

The long pattern sequence retains a coherent rhythm without a dedicated pattern typography. This supports the TYP-04 decision that pattern category does not earn a separate title scale.

No dashboard/card treatment or new technical voice is justified.

### FLOW figures — no visual redesign earned

The FLOW figures remain legible in the full corpus and do not force a separate figure typeface. TYP08B-D05 concerns **font transport**, not their graphic language.

### Controlled architectural plates — no TYP correction earned

The Part IV plate family preserves controlled paper-space drawing sizes and coherent paired/spread cadence. Intentional parity blanks and furniture-only spread starts are functioning as structural devices rather than accidental empty pages.

Examples include the roof pair and sectional-axonometric spread transitions.

Drawing-internal hierarchy remains PLT authority.

### Appendix C labelled records — no change

The full 40-record Appendix C treatment survives corpus scale. Representative pages in the pp295–310 region preserve the frozen:

- 10.5 pt serif record subject;
- 7.2 pt sans labels;
- 9.2 pt serif field body;
- 27 mm / 4 mm label-body geometry.

No return to a five-column miniature table is justified.

### Appendix E source list — no change to frozen source roles

Appendix E demonstrates the intended calmer source hierarchy: serif-led citations with subordinate Source Sans URLs. Its role architecture is the model that the Part I Notes apparatus should consume.

## 6. Physical-review disposition

No new physical-only typography question is earned by TYP-08B itself.

The five defects above are semantic/integration or PDF-transport failures that can be corrected and mechanically re-proved without changing the physically accepted font families or metrics.

TYP-08C should therefore correct and re-render first. A renewed physical review is required only if a correction unexpectedly forces a metric/family change or creates a question that cannot be settled from the already accepted physical contracts and exact rendered output.

Final full-book physical proof remains TYP-09 authority.

## 7. TYP-08C admission

**TYP-08C #552 IS REQUIRED.**

Authorised correction set is limited to:

1. semantic division/entry running strings;
2. frozen division-opening page composition;
3. existing TYP-05 citation/URL roles on Part I Notes;
4. frozen title/imprint front-matter separation in candidate proof space;
5. exact Source Sans SVG font transport without Poppler overlong-name warnings.

No other retuning is authorised by this audit.

In particular TYP-08C may not:

- change Source Serif 4 / Source Sans 3 family selection;
- shrink body text or leading to recover pages;
- alter the 112 mm B5 measure;
- invent a mono family;
- restyle the pattern corpus;
- retune Appendix C;
- change PLT-owned drawing annotation sizes or geometry;
- rewrite manuscript prose;
- normalise intentional blanks merely to reduce page count.

## 8. Handoff

After TYP-08C applies only the five admitted corrections, it must:

- rebuild exact-font A4 and B5 whole-book candidates;
- repeat every-page geometry and finished-font gates;
- add a fail-closed parser/interoperability check for TYP08B-D05;
- record the new exact page/leaf counts rather than preserving 260/317 artificially;
- re-review every changed page plus pagination-dependent downstream transitions;
- confirm all five defects are closed or explicitly held with evidence.

TYP-08D remains the closeout authority after that reproof.
