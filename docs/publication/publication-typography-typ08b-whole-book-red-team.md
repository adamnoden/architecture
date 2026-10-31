<!-- nav-exclude: redirect -->
# TYP-08B — whole-book typographic corpus red team

Status: **COMPLETE AUDIT — bounded corrections earned; TYP-08C required**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Owning stage: **#549 — TYP-08 — whole-book typography red team**  
Packet: **#551 — TYP-08B — whole-book typographic corpus red team**  
Candidate authority: **#550 / TYP-08A**, PR **#563**, merge `8e1104ef1ee05790746066b78d75eb9b951839c9`

## 1. Evidence object reviewed

Primary evidence is the exact-final TYP-08A conservative-B5 candidate:

- proof run **40085965363 — SUCCESS**;
- artifact **12556729306 — `typ08a-full-book-candidate`**;
- digest `sha256:14a83bed847654cb3689ae6b58cb03438b95d32dc40f720a7462c658f3e691d1`;
- B5 **317 pages / 159 leaves**, 176 × 250 mm;
- A4 regression **260 pages / 130 leaves**;
- finished PDFs contain exactly the five frozen Source faces;
- every page passes physical-geometry checks;
- B5 review corpus contains 317 indexed page images.

The audit does not reopen font choice, body metrics, hierarchy metrics or TYP-05 role metrics. It asks whether the complete candidate actually applies those frozen contracts correctly at corpus scale.

## 2. Review method

The audit used four complementary passes.

### Whole-corpus visual pass

All **317 B5 pages** were inspected as ordered contact sheets and at individual-page scale where a page or transition warranted closer inspection. This covered page colour, openings, contents, running furniture, patterns, FLOW figures, architectural plates, appendices, intentional blanks and page turns.

### Targeted high-resolution pass

Pages around title/contents, Part openings, Notes, Part transitions, plate transitions, Appendix C and Appendix E were inspected individually.

### Text / page-boundary diagnostics

Finished-PDF text extraction mapped content across page boundaries and exposed running-context values, source-note behaviour and headings that did not receive their frozen opening semantics. No OCR was used.

### Secondary A4 comparison

A4 was used as a regression/reference object where a finding might plausibly be B5-specific. The material defects below are semantic/integration defects, not B5-only shrinkage failures.

## 3. Overall result

The whole-book red team does **not** earn a new typography system.

The dominant result is positive:

- sustained prose retains stable page colour;
- the pattern corpus remains coherent without category-specific typography;
- the two-family Source architecture survives the full corpus;
- controlled plates retain intended paper-space sizes without fit-scaling;
- Appendix C's labelled-record treatment scales to all 40 records;
- architectural sequence blocks remain distinct without mono;
- TOC hierarchy remains restrained and navigable;
- no widespread clipping, glyph corruption, overlap or overflow appears in the visual corpus.

The candidate nevertheless exposes **five bounded defects**. Four are integration failures against already frozen TYP contracts; one is a PDF-transport interoperability defect. TYP-08C is therefore required.

## 4. Defect ledger

### TYP08B-D01 — running navigation does not consume semantic division / entry context

**Severity:** material navigation/integration defect  
**Observed:** ordinary running pages; representative **B5 pp48–49**  
**Owning authority:** TYP-04 running-navigation freeze / TYP-08 candidate integration seam  
**Disposition:** **ADMIT TYP-08C CORRECTION**

TYP-04 freezes:

- verso running context = current **division**;
- recto running context = current **entry**;
- Source Sans 3 at 7.2 pt / 1;
- opening and blank suppression rules.

The TYP-08A candidate does not currently expose those semantic strings.

On verso pages, `env(pub-title)` resolves to proof-harness metadata, producing:

`TYP-08A full-book candidate — B5`

On recto pages inside composite Parts, `env(doc-title)` remains the source-document title such as `Part I — The Proposition` rather than advancing with the current chapter/entry context.

This is not a font or metric problem. TYP-08C must restore semantic division and entry strings in generated proof space and make the running furniture consume them. No new running-head style is authorised.

---

### TYP08B-D02 — division and entry openings are not composed with frozen TYP-04 page semantics

**Severity:** material hierarchy/page-turn defect  
**Observed:** Part thresholds and source-internal chapters/entries  
**Representative division pages:** **B5 p19, p51, p91, p203, p257**  
**Representative missed entry opening:** chapter 9 begins mid-page on **B5 p75**  
**Owning authority:** TYP-04 division/entry-opening freeze / TYP-08 candidate integration seam  
**Disposition:** **ADMIT TYP-08C CORRECTION**

TYP-04 freezes division openings as:

- Source Serif 4 regular, 24 pt / 1.08;
- maximum title width 115 mm;
- 31 mm top offset;
- **right-hand / recto start**;
- no running furniture or folio;
- a structural threshold distinct from the following entry.

TYP-04 also freezes entry openings as:

- Source Serif 4 regular, 18 pt / 1.12;
- 13 mm top offset;
- **new page** start, not necessarily recto;
- top running context suppressed on the opening page;
- folio retained unless another page role suppresses it.

The TYP-08A candidate styles headings but does not integrate these semantic page roles across the full prepared corpus.

Examples:

- p19 combines `Part I — The Proposition` and `1. The house after completion` on one page;
- p51 combines `Part II — Architecture of the Platform` and chapter 6;
- chapter 9 begins mid-page on p75 rather than as an entry opening;
- the same source-internal problem recurs in later composite Part/Reference-House chapters.

The defect therefore is broader than a Part-title break. The full frozen **division + entry opening grammar** is missing from candidate integration.

TYP-08C must expose these semantic page roles in generated proof copies and preserve the already frozen metrics. Pagination movement is expected and must be accepted/re-proved rather than counteracted by shrinking text or suppressing white space.

---

### TYP08B-D03 — Part I Notes bypass frozen citation / long-URL roles

**Severity:** material mixed-content hierarchy defect  
**Observed:** **B5 pp48–50**  
**Owning authority:** TYP-05 source-citation / URL freeze / TYP-08 candidate integration seam  
**Disposition:** **ADMIT TYP-08C CORRECTION**

TYP-05 already freezes:

- citation: Source Serif 4 regular, **9.3 pt / 1.4**;
- long URL: Source Sans 3 regular, **7.6 pt / 1.3**, subordinate/muted and breakable.

TYP-08A applies those roles to Appendix E but Part I Notes remain ordinary paragraph/link composition. Long underlined URLs therefore carry body-scale visual weight and dominate the page.

No new note type is required. TYP-08C must map the existing Notes citation/URL apparatus onto the frozen source roles in the generated copy. Canonical manuscript wording remains unchanged.

---

### TYP08B-D04 — title page retains proof/provenance metadata assigned by TYP-04 to imprint/provenance

**Severity:** material front-matter hierarchy/integration defect  
**Observed:** **B5 p1**  
**Owning authority:** TYP-04 title/imprint freeze / TYP-08 candidate integration seam  
**Disposition:** **ADMIT TYP-08C CORRECTION**

The title page currently carries:

- `WORKING EDITION`;
- date;
- revision hash;
- project URL.

The edition label is compatible with the frozen orienting-label role. The defect is date/revision/URL proof metadata remaining on the principal title page.

TYP-04 explicitly freezes the title page as free of proof/provenance clutter and assigns subordinate provenance to an **imprint/provenance page** using the 18 pt serif imprint title and 8.5 pt sans supporting text.

TYP-08C must prove that already-frozen front-matter architecture in candidate space: keep title material on the title page and move candidate provenance to a dedicated imprint/provenance page. TYP-08C does **not** decide which provenance fields ultimately survive the private object edition; final production-content choice remains TYP-09 / PR-02 authority.

---

### TYP08B-D05 — repeated SVG data-URI font transport provokes PDF parser warnings

**Severity:** mechanical interoperability / proof-transport defect  
**Observed:** full B5 candidate; same class present in A4  
**Owning authority:** TYP exact-font transport / TYP-08 candidate proof seam  
**Disposition:** **ADMIT TYP-08C CORRECTION**

The visual result and finished-font identity are correct, but Poppler `pdftotext` repeatedly emits:

`Warning: name token is longer than what the specification says it can be`

A fresh extraction of the exact B5 candidate emitted **1,162 warning lines**.

The warning correlates with the proof strategy of embedding complete Source Sans data URIs inside each of the 22 controlled SVGs before browser/PDF composition. The same PDF:

- passes `pdfinfo` / geometry checks;
- passes `pdffonts` identity / embedding checks;
- renders correctly;
- passes Ghostscript null-device parsing with exit code 0 and no stderr.

This record therefore does **not** claim the PDF is unreadable or generally invalid. The narrower defect is that a mainstream PDF parser reports repeated syntax warnings from the candidate transport seam.

TYP-08C must seek the smallest deterministic exact-font resource strategy that:

1. preserves the same pinned Source Sans bytes;
2. keeps controlled SVG changes proof-only and canonical-byte-safe;
3. preserves finished-PDF font identity;
4. removes the Poppler warning class;
5. does not turn text into outlines merely to evade the transport problem.

If removing the warning genuinely requires broader production integration, that boundary must be recorded rather than the warning silently ignored.

## 5. Explicit no-change findings

### Contents — no change

B5 pp2–3 preserve the accepted two-level TOC, no dot leaders, clear right-aligned page numbers and restrained hierarchy. The sparse lower field at the end of contents is not a defect.

### Main prose page colour — no change

Across Parts I–V, ordinary prose remains stable under the 10.5 pt / 1.5 / 112 mm B5 body contract. The whole-book scan gives no corpus-wide reason to alter body size, leading, measure, ragged composition or paragraph rhythm.

### Sparse tails before structural transitions — no change

Representative sparse pages **p90, p201, p255 and p286** were inspected individually. They are ordinary end-of-entry / end-of-Part tails, not clipping, one-line orphan failures or reasons to compress preceding prose. White space is cheaper than destabilising the reading system.

### Pattern corpus — no change

The long pattern sequence retains coherent rhythm without dedicated pattern typography. No separate pattern-title scale, card treatment or technical voice is earned.

### FLOW figures — no visual redesign earned

FLOW figures remain legible and do not force a separate typeface. TYP08B-D05 concerns resource transport, not graphic language.

### Controlled architectural plates — no TYP correction earned

Part IV retains controlled paper-space drawing sizes and coherent paired/spread cadence. Intentional parity blanks and furniture-only spread starts function structurally rather than as accidental empty pages. Drawing-internal hierarchy remains PLT authority.

### Appendix C labelled records — no change

The full 40-record schedule survives corpus scale with the frozen 10.5 pt serif subject, 7.2 pt sans labels, 9.2 pt serif field body and 27 mm / 4 mm label-body geometry. No return to a five-column miniature table is justified.

### Appendix E source list — no change

Appendix E demonstrates the intended source hierarchy: serif-led citations with subordinate Source Sans URLs. Its existing role architecture is the model Part I Notes should consume.

## 6. Physical-review disposition

No new physical-only typography question is earned by TYP-08B.

The five defects are semantic/integration or PDF-transport failures that can be corrected without changing the physically accepted families or metrics. TYP-08C should correct and re-render first. Renewed physical review is required only if a correction unexpectedly forces a metric/family change or creates a question not settled by existing physical evidence.

Final full-book physical proof remains TYP-09 authority.

## 7. TYP-08C admission

**TYP-08C #552 IS REQUIRED.**

Authorised correction set is limited to:

1. semantic division/entry strings and running navigation;
2. frozen division **and entry** opening-page composition;
3. existing TYP-05 citation/URL roles on Part I Notes;
4. frozen title/imprint front-matter separation in candidate proof space;
5. exact Source Sans SVG font transport without Poppler overlong-name warnings.

No other retuning is authorised.

TYP-08C may not:

- change Source Serif 4 / Source Sans 3 selection;
- shrink body text or leading to recover pages;
- alter the 112 mm B5 measure;
- invent mono;
- restyle patterns;
- retune Appendix C;
- change PLT-owned drawing annotation sizes or geometry;
- rewrite manuscript prose;
- normalise intentional blanks merely to reduce page count.

## 8. Handoff

TYP-08C must:

- rebuild exact-font A4 and B5 full-book candidates;
- repeat every-page geometry and finished-font gates;
- add a fail-closed parser/interoperability check for D05;
- record new page/leaf counts rather than preserving 260/317 artificially;
- re-review every changed page plus pagination-dependent downstream transitions;
- confirm all five defects are closed or explicitly held with evidence.

TYP-08D remains closeout authority after that reproof.
