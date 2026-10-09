# Working Edition editorial proof — G4 ledger

**Status:** active  
**Parent gate:** [`print-publication-pipeline.md`](print-publication-pipeline.md) — G4  
**Editorial authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)  
**Baseline artifact:** 213-page Working Edition from G3 commit `4ac561a`  
**Purpose:** test whether House Systems Architecture works as a linear publication rather than merely as a set of good web documents.

This ledger is the durable record of the whole-book proof. Record a finding here before making a consequential editorial change. The categories are:

- **FIX NOW** — the current Working Edition is materially worse because of it and the correction is clear enough to make now;
- **DEFER** — a real publication gap, but solving it would require substantive new architectural/research work outside this pipeline effort;
- **KEEP** — conspicuous under linear reading but justified.

Do not use the print renderer to conceal a canonical writing problem. Conversely, print-only wrappers may remove duplicated document titles or other mechanical composition artefacts without changing canonical meaning.

## Review method

Review in linear passes rather than file-by-file:

1. title + contents + promised front matter;
2. Preface → Part I → Part II as the main argument;
3. Part III as a professional reference after the argument;
4. Part IV against the six-chapter Reference House structure promised by the publication architecture;
5. Part V as the closing delivery/testing argument;
6. whole-book pass for repetition, definitions, transitions, figures, web residue and print-hostile references.

For each pass, distinguish:

- **argument problem** — order, repetition, missing bridge, late definition;
- **genre problem** — repository/web/admin language appearing inside the book;
- **maturity problem** — publication architecture promises material that is not yet authored;
- **presentation problem** — genuine print composition issue rather than prose;
- **evidence problem** — claim/reference relationship is unclear or print-hostile.

## Baseline observations

The G3 book is intentionally a Working Edition, not a claim of manuscript completion. Current rough balance is:

| Section | Approx. pages | Approx. words | Initial reading |
| --- | ---: | ---: | --- |
| Preface | 8 | 2.5k | strong authored opening |
| Part I | 18 | 6.2k | compact proposition |
| Part II | 28 | 8.3k | main architectural argument |
| Part III | 104 | 20k | dominant share of book; reference/catalogue by design |
| Part IV | 40 | 8.1k | useful project material, but not yet the promised six-chapter publication form |
| Part V | 11 | 2.4k | concise closing method/delivery argument |

The imbalance is not automatically a defect: Part III is explicitly a browsable reference. It does, however, make development-history residue and repetitive metadata much more costly in print than on the website.

# Findings

## F-01 — promised front matter is substantially absent

**Category:** maturity problem  
**Disposition:** **DEFER**, but make the incompleteness explicit in publication planning rather than silently treating title + contents as complete front matter.

The publication architecture currently promises:

- Abstract;
- How to read the book;
- Definitions;
- Evidence and maturity legend;
- Governing constraints.

The Working Edition currently provides title/edition page, contents, then the Preface. The renderer should not fabricate these pages from repository/admin material.

**Action:** do not block the PDF pipeline. Keep these as authored-manuscript TODOs owned by the publication architecture. During G4, check whether one or more is necessary enough for the current Working Edition to justify authoring now; otherwise record the gap clearly and proceed.

## F-02 — Part III begins with duplicated publication/web title hierarchy

**Category:** presentation problem  
**Disposition:** **FIX NOW**.

The print wrapper creates `Part III — Pattern Language`, immediately followed by the source page's `Patterns` heading. The same issue occurs in Part IV with `Part IV — The Reference House` followed by `Reference House`.

These are web document titles, not useful second-level book headings.

**Action:** adjust deterministic print adapters to replace/remove the original opening H1 rather than merely demoting it. Canonical source remains unchanged.

## F-03 — Part III leaks repository migration/provenance syntax into reader-facing prose

**Category:** genre + evidence problem  
**Disposition:** **FIX NOW**, carefully and canonically.

Examples visible in the Working Edition include:

- literal filenames such as `README.md`, `core-12.md`, `pilot/...md`;
- raw relative paths such as `../reversible-assembly-candidates.md` and `../../research/...md`;
- migration/process language such as `Phase-6 gate review`, `Migration does not increase evidence or maturity`, and repeated internal provenance statements.

Some provenance is valuable because evidence maturity and identity matter. Raw repository paths and migration bureaucracy are not publication prose.

**Action:** audit Part III source pages by class:

1. keep meaningful historical/evidence provenance;
2. rewrite raw repository paths into human-readable source/reference labels or proper links;
3. remove repeated migration boilerplate where it adds no reader value;
4. retain stable-ID/history information where it explains the language rather than the repository migration project.

Do this in coherent batches, not blanket search/replace.

## F-04 — Part III's opening index order and reading order communicate different structures

**Category:** argument/reference-navigation problem  
**Disposition:** **KEEP for now; REVIEW**.

The canonical Pattern index presents active patterns primarily as an identity/index surface while the actual book sequence follows the publication architecture's editorial grouping/order. That distinction is legitimate, but the Working Edition should make it obvious enough that readers do not infer a mistake.

**Action:** during the Part III read, judge whether a one-sentence distinction between stable identity order and editorial reading order is sufficient. Do not reorder stable IDs merely to make the lists look neat.

## F-05 — Part IV is useful project material but not yet the promised Reference House publication

**Category:** maturity + argument problem  
**Disposition:** **DEFER substantive missing chapters; FIX NOW obvious web/admin residue**.

The publication architecture promises six chapters:

13. Site and type;
14. Architectural order, repose and tectonic language;
15. Material, structural and assembly system;
16. Maintenance geography;
17. Water and environmental systems;
18. Future maintenance scenarios.

The current Working Edition instead compiles the strongest existing Reference House documents: overview, tectonic language, vertical bay studies/coordination, whole-house coordination fixture, pattern occurrence register and external access plan.

That is honest for a Working Edition, but it must not be mistaken for the finished Part IV.

**Action:**

- do not invent six weak chapters by renaming development material;
- retain current strong material as provisional Part IV;
- remove obvious website wayfinding such as `Start with ...` and terminal `Related documents` lists where they interrupt the linear book;
- record missing publication-facing chapters as manuscript work outside this pipeline.

## F-06 — Part IV overview contains web-navigation prose

**Category:** genre problem  
**Disposition:** **FIX NOW**.

Examples include `See the project-wide ...`, `Start with ... then ...`, and similar instructions that make sense on a documentation landing page but not in the middle of a book.

**Action:** revise canonical Reference House overview so it still explains authority and composition while reading naturally both online and in print. Links may remain where they support a claim; route instructions should not.

## F-07 — External Access & Maintenance Plan ends with a website-style `Related documents` block

**Category:** genre problem  
**Disposition:** **FIX NOW**.

The block is useful web navigation but functions as an administrative tail in the book.

**Action:** decide whether these relationships belong as a short prose cross-reference inside the document or solely in website navigation. Prefer removing the terminal list from canonical prose if the surrounding text already carries the necessary conceptual links.

## F-08 — Part III/IV scale makes repeated administrative qualifiers expensive

**Category:** style/genre problem  
**Disposition:** **REVIEW DURING LINEAR PASS**.

Phrases such as `canonical`, `migration`, `provenance`, `Phase-6`, `gate`, `does not prove` and maturity labels occur frequently. Several are essential to HSA's evidence discipline. Others describe the project's internal migration history rather than the architecture.

**Action:** do not reduce evidence qualification for elegance. Remove only the portions whose subject is the repository/process rather than the architectural proposition, evidence boundary or stable language identity.

## F-09 — known PDF named-destination warning is not an editorial defect

**Category:** renderer/preflight  
**Disposition:** **KEEP / G5 recheck**.

Poppler warns that some Vivliostyle named destination tokens exceed the PDF specification's recommended token length. Internal links resolve, fonts are embedded, the file opens cleanly, and representative Poppler/PDFium renders agree.

**Action:** keep documented in the pipeline record; do not let G4 editorial work get entangled with it.

# Current work order

1. Fix F-02 print-only duplicated Part III/IV opening titles.
2. Perform Part III canonical residue audit (F-03/F-08) before editing.
3. Perform Part IV linear prose audit (F-05/F-06/F-07).
4. Re-read Preface + Parts I/II/V for argument repetition and transitions.
5. Update this ledger with every resolved/deferred finding.
6. Rebuild a coherent G4 candidate PDF only after a meaningful batch of editorial changes.
