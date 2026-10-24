<!-- nav-exclude: redirect -->
# TYP-07C — representative-signature physical freeze

Status: **COMPLETE — representative publication typography physically accepted and frozen for whole-book red team**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Owning stage: **#541 — TYP-07 — representative-signature physical proof**  
Manifest/audit packet: **#542 — TYP-07A**  
Exact proof packet: **#543 — TYP-07B**  
Closeout packet: **#544 — TYP-07C**  
Next stage: **#549 — TYP-08 — whole-book typography red team**

## 1. Decision

TYP-07 is complete.

The physically accepted TYP-03/04/05/06 typography system has now survived one deterministic representative publication proof using real Ovid’s House content, real FLOW figures and real released architectural plates at conservative B5 territory.

The owner reviewed the exact TYP-07B B5 proof at 100% / Actual Size and returned:

`LGTM`

No revision, metric retuning, hierarchy change, new content role, new font face or other freeze break was requested.

This closeout therefore freezes the representative-signature result **without changing any inherited typography contract**.

It does not claim that the full book has yet survived whole-corpus review. That remains TYP-08 authority.

## 2. Inherited frozen system remains unchanged

TYP-07 introduces no new typography design decision.

The accepted representative proof continues to use:

- **Source Serif 4** for the body system;
- body **10.5 pt / 1.5**;
- conservative-B5 practical prose measure **112 mm**;
- spaced paragraphs;
- ragged-right composition;
- hyphenation off;
- 3 / 3 widow-orphan posture where supported;
- true Source Serif 4 italic;
- TYP-04 hierarchy/opening/navigation roles and metrics;
- TYP-05 mixed-content table, schedule, source/URL, caption and plate-furniture roles;
- no mono family for the present reader-facing corpus;
- **Source Sans 3 Regular / 400 + Bold / 700** as the publication/drawing sans interface;
- no drawing sans italic;
- tabular figures available where alignment earns them.

Nothing in TYP-07 physical review earned a change to those contracts.

## 3. TYP-07A — representative corpus and build boundary

TYP-07A merged through PR **#546** as:

`9fc5d4bf3a7268d31fc43b009986c02052a04898`

It froze ten real proof obligations:

1. continuous Part I prose;
2. Part I division / entry opening;
3. contents / navigation;
4. Part V B0–B3 compact analytical table;
5. Appendix C implementation schedule in labelled-record form;
6. real Part II FLOW figure;
7. real principal front-elevation architectural plate;
8. real paired ground / first-floor architectural plates;
9. real Part III caption-heavy figure;
10. dense Sources and Further Reading material with long URLs.

It also established the truthful build boundary:

- current production `publication/theme.css` remained the historical Working Edition implementation and was **not** treated as proof authority for the frozen TYP system;
- representative proof composition would apply the frozen TYP contracts in bounded proof space;
- canonical `drawing-publication-v1` and FLOW assets would not be rewritten merely to make the specimen convenient;
- real SVG text could be rebound temporarily and reversibly to the frozen Source Sans interface for proof only;
- production-wide migration remained downstream work.

The TYP-07A audit failed closed on source identity, proof-class coverage, required font-face coverage, figure/plate registry identity and production-boundary drift.

## 4. TYP-07B — exact representative proof

TYP-07B merged through PR **#548** as:

`374d0a0e23f5c31c8d9998ac0d2ba89d26368cc2`

Validated proof head:

`4fb5769c46fa32f5e9ac0c8a9d72a73e1fc2ae80`

Exact-head validation:

- TYP-07 representative manifest audit run **40080166543 — SUCCESS**;
- TYP-07 representative signature proof run **40080166415 — SUCCESS**;
- whole-repository `Validate pull request` run **40080166448 — SUCCESS**;
- artifact **12554427992 — `typ07b-representative-signature-proof`**;
- artifact digest `sha256:ba68915fbe44ff23271109d91a341e6194c3c4fd84f74983ad34593964e9f376`.

Finished proof geometry:

### A4 regression counterpart

- **15 pages**;
- **595.276 × 841.89 pt**.

### Conservative B5 decisive proof

- **17 pages**;
- **498.898 × 708.661 pt**;
- equivalent to **176 × 250 mm**.

Finished-PDF embedded faces:

- `SourceSerif4-Regular`;
- `SourceSerif4-It`;
- `SourceSerif4-Bold`;
- `SourceSans3-Regular`;
- `SourceSans3-Bold`.

The proof rejected common Arial / Helvetica / Liberation / Times / Georgia / Courier fallback at the finished-PDF boundary.

## 5. Real figure and architectural drawing proof

TYP-07B did not use neutral placeholders for the visual classes that matter to the publication.

It carried real FLOW and DRW v1 SVGs into the representative object.

Those historical assets still contain working Arial-family declarations internally. TYP-07 therefore used the already-proven TYP-06 posture:

- copy the real source into proof space;
- inject exact pinned Source Sans bytes;
- replace only the authorised working family declaration;
- preserve geometry, text sizes, anchors, linework and architectural content;
- reverse the transformation and require the canonical source to reproduce exactly.

Five real SVG transformations were proven reversible.

Canonical figure and `drawing-publication-v1` bytes remained unmodified.

The representative proof also used a dedicated true-scale plate page class so controlled 1:100 architectural drawings were not fit-scaled into the prose measure. In particular, the **166 mm** principal front elevation and the paired 1:100 plans survived the conservative-B5 composition at their controlled paper-space sizes.

This proves publication coexistence at the representative scale. It does not transfer PLT authority for final v2 drawing-specific typography, hierarchy or BOOK/WALL tuning into TYP.

## 6. Digital and physical verdicts

### Digital inspection

After the exact proof artifact was downloaded, all **17 B5 pages** were independently rendered at 200 dpi and inspected.

No clipping, overlap, broken glyphs, unintended overflow, fallback typography or plate fit-scaling corruption was observed.

Intentional blank-page and recto/verso behaviour remained intact.

This digital inspection was not treated as a substitute for physical review.

### Physical owner verdict

The exact B5 proof was handed to the owner for 100% / Actual Size review.

On **24 October 2026** the owner returned:

`LGTM`

No further qualitative observations were supplied, so none are invented here.

The evidenced physical conclusion is deliberately narrow and sufficient:

> **The exact TYP-07B representative B5 publication proof was accepted without requested change.**

## 7. Page-count and book-block implication

The representative proof produced:

- A4: **15 pages**;
- conservative B5: **17 pages**.

Within this deliberately selected subset, the B5 candidate therefore requires **2 additional pages**, or approximately **13.3% more pages**, than the A4 regression counterpart.

That difference is useful evidence that physical format, page turns, opening behaviour, blank-page discipline, technical material and plate geometry interact materially with pagination.

It is **not** a defensible whole-book expansion ratio.

The representative corpus is intentionally heterogeneous and selected for stress coverage rather than statistical similarity to the complete manuscript. Multiplying 13.3% across the current Working Edition would manufacture a false page count and false spine implication.

Therefore the durable book-block conclusion from TYP-07 is:

> **Whole-book B5 page count and spine/book-block implications cannot be inferred responsibly from the representative signature. They must be measured from the full candidate book in TYP-08.**

TYP-08 now owns the first legitimate full-book page-count comparison.

## 8. What TYP-07 freezes

TYP-07 freezes only the following claim:

> **The frozen TYP-03/04/05/06 typography system can coexist successfully across the selected real Ovid’s House prose, hierarchy, navigation, technical material, FLOW figures, architectural plates, captions and references at conservative B5 physical scale without an earned local typography exception.**

Consequences:

- there is no reason to reopen the Source Serif / Source Sans family choice;
- there is no reason to retune the frozen body system before whole-book evidence exists;
- there is no reason to invent a mono family for the present corpus;
- there is no reason to alter TYP-04 hierarchy or TYP-05 mixed-content roles from representative evidence;
- there is no reason to change the TYP-06 drawing-interface family contract;
- representative proof-only page composition must not silently become final production policy merely because it passed.

## 9. What remains open for TYP-08

TYP-08 must now ask a different question: whether the **entire candidate publication** survives the same system.

Outstanding whole-book concerns include:

- cumulative page colour and reading fatigue;
- repeated hierarchy rhythm across all Parts and entries;
- recto/verso behaviour at corpus scale;
- bad page turns, widows, orphans and awkward breaks not sampled by TYP-07;
- repeated running furniture and whether it becomes noise;
- full-table / schedule / source-list distribution;
- captions adjacent to the complete drawing corpus;
- consistent numeral and unit treatment;
- full candidate A4/B5 page counts;
- resulting book-block and spine implications;
- production-composition seams that become visible only when the complete book is assembled.

TYP-08 may correct concrete defects. It may not treat whole-book scale as permission for a new aesthetic redesign.

## 10. What remains TYP-09 authority

TYP-07 does not release `publication-typography-v1`.

Final production integration still includes, where earned:

- replacing historical Working Edition font mappings with the frozen production identities;
- consolidating exact font transport into the final publication build path;
- mapping all reader-facing roles to final production tokens;
- confirming finished-PDF embedding and fallback discipline in the full release build;
- confirming PLT compatibility against the released v2 drawing system;
- recording final page count and physical-book implications;
- final full-book physical proof;
- release tagging / freeze as `publication-typography-v1`.

TYP-09 owns that release boundary after TYP-08 has removed whole-corpus uncertainty.

## 11. Closeout

TYP-07 is physically complete.

No representative-page defect earned a freeze break.

The project now has a much stronger typography claim than it had after isolated body, hierarchy, mixed-content and drawing-interface proofs: those contracts have survived together in one real, exact-font, physically accepted miniature of the publication.

The next legitimate source of typographic evidence is no longer another specimen.

It is the whole book.

Next authorised stage: **#549 — TYP-08 — whole-book typography red team**, beginning with **#550 — TYP-08A — full-book candidate assembly and proof contract**.
