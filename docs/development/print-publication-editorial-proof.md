# Working Edition editorial proof — G4 ledger

**Status:** active — final artifact verification pending  
**Parent gate:** [`print-publication-pipeline.md`](print-publication-pipeline.md) — G4  
**Editorial authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)  
**Baseline artifact:** 213-page G3 Working Edition  
**Purpose:** test whether House Systems Architecture works as a linear publication rather than merely as a set of good web documents.

This ledger is the durable record of the whole-book proof. Findings are classified as:

- **FIXED** — resolved in canonical source or deterministic print composition;
- **DEFER** — a real publication gap whose proper solution requires substantive architectural/research work beyond this pipeline effort;
- **KEEP** — conspicuous under linear reading but justified.

Do not use the renderer to conceal canonical writing problems. Conversely, print-only wrappers may remove duplicated document titles, development provenance or control-document furniture when the canonical web/repository record should retain them.

## Review method

The proof was conducted in linear passes:

1. title + contents + front matter;
2. Preface → Part I → Part II as the main argument;
3. Part III as a professional reference after the argument;
4. Part IV against the intended six-chapter Reference House publication structure;
5. Part V as the closing delivery/testing argument;
6. whole-book checks for repetition, late definitions, web/admin residue, figures and transitions.

The G3 book was intentionally treated as a Working Edition rather than a claim of manuscript completion.

# Findings

## F-01 — promised front matter was absent — FIXED

The publication architecture promised an abstract, reading guidance, definitions, an evidence/maturity legend and governing constraints. Their absence was initially tolerable mechanically but became a genuine reading problem once Part III introduced evidence labels and HSA-specific vocabulary without prior explanation.

**Resolution:** authored [`../manuscript/readers-guide.md`](../manuscript/readers-guide.md) and inserted it after the Preface. It now provides:

- abstract;
- how to read Parts I–V;
- definitions of the HSA terms used in a specific sense;
- evidence states and the distinction between evidence and maturity;
- governing constraints and proportional serviceability.

The book no longer relies on repository knowledge to explain its own reference language.

## F-02 — duplicate Part III / Part IV opening hierarchy — FIXED

The first full book printed `Part III — Pattern Language` followed immediately by `Patterns`, and `Part IV — The Reference House` followed by `Reference House`.

**Resolution:** deterministic print adapters now replace the source-page H1 with the Part heading rather than demoting and repeating it. Canonical web source remains unchanged.

## F-03 — Part III leaked migration/project-file syntax — FIXED

The initial Working Edition exposed raw filenames, phase/gate vocabulary, migration footers and repository-shaped provenance in the reader-facing reference section.

The proof established a firm boundary:

- **keep:** stable IDs, Evidence, Maturity, `Does not prove`, meaningful identity history and architectural provenance;
- **remove from the primary print path:** raw repository paths, internal phase/gate terminology and repeated migration bookkeeping.

**Resolution:**

- canonical strategy and held-candidate evidence prose was rewritten into publication-native language;
- the Pattern and Strategy/Candidate indexes were cleaned of migration administration;
- the Service Topology sequence no longer ends with internal development history;
- two meaningful Reference House evidence statements were retained but rewritten without phase numbering;
- a print-only `pattern-page` adapter suppresses terminal migration-provenance footers on canonical patterns while retaining them on the web/repository surface;
- the authoring contract now refers to the human-readable **Pattern Index**, not `README.md`.

Evidence qualification was deliberately not weakened for elegance.

## F-04 — identity order differs from editorial reading order — KEEP

Pattern IDs are stable identity, not rank or publication sequence. The book follows the publication architecture's editorial grouping/order while the index remains an identity/index surface.

The Reader's Guide now states that distinction. Renumbering or sorting the book by ID would make the language conceptually worse merely to make two lists look alike.

## F-05 — Part IV is not yet the intended six-chapter Reference House publication — DEFER

The publication architecture ultimately calls for:

13. Site and type;
14. Architectural order, repose and tectonic language;
15. Material, structural and assembly system;
16. Maintenance geography;
17. Water and environmental systems;
18. Future maintenance scenarios.

The current Working Edition instead contains the strongest current Reference House material: overview, tectonic language, vertical-bay studies and coordination, whole-house fixture, pattern occurrence register and external-access plan.

**Decision:** do not fake maturity by renaming development records into six apparently finished chapters. The current Part IV remains explicitly provisional. Missing publication-facing house chapters are genuine future manuscript/design work rather than a PDF-pipeline defect.

## F-06 — Reference House overview contained website wayfinding — FIXED

`See ...`, `Start with ... then ...` and phase-number language made the overview read like a documentation landing page.

**Resolution:** canonical prose now explains authority and the current study set directly. Links remain where they carry useful relationships rather than navigation instructions.

## F-07 — External Access & Maintenance Plan ended as a web page — FIXED

A terminal `Related documents` block and phase-number language were repository navigation rather than publication prose.

**Resolution:** the redundant related-documents tail was removed canonically and the remaining development reference was expressed architecturally.

## F-08 — repeated administrative qualifiers were expensive in Part III/IV — FIXED / BOUNDED

The linear book made repeated `migration`, `Phase-*`, `gate`, `Status` and `Purpose` language much more intrusive than on the website.

**Resolution:**

- Part III migration administration is removed as described in F-03;
- evidence/maturity/`Does not prove` vocabulary remains because it is substantive;
- Reference House `Status:` / `Purpose:` control-document headers are suppressed in print while retained in repository source;
- the Whole-House Coordination Fixture's internal computational-H1 comparison is replaced in print by the actual architectural question it was testing: whether the courtyard house can remain service-coherent without paying for its spatial order through long routes, duplicated cores or technical corridors.

The print edition therefore stops exposing project-management scaffolding without pretending the underlying Reference House work is more mature than it is.

## F-09 — long Vivliostyle named destinations — KEEP / G5 RECHECK

Poppler warns that some Vivliostyle named destination tokens exceed the specification's recommended token length. Internal links resolve, the file opens cleanly, all fonts are embedded, and representative Poppler/PDFium renders agree.

This is a documented renderer issue, not an editorial defect. Recheck during G5 live-artifact verification and after material Vivliostyle upgrades.

## F-10 — Part I contained two consecutive implementation bridges — FIXED

Composing the canonical Governing Principles inside Part I produced `From doctrine to implementation` immediately before Part I's own `From principles to buildings`. Either source made sense alone; together they repeated the same transition.

**Resolution:** the Part I composition adapter omits the embedded principles document's terminal bridge and retains Part I's native transition.

## F-11 — legacy `The Long-Life House` self-reference leaked into HSA — FIXED

The older manuscript container name still appeared inside Parts I/II and the developed Repose spread.

**Resolution:** Part adapters normalise legacy manuscript self-reference to **House Systems Architecture** in print, while the independent Repose source was updated canonically. The legacy container headings remain source history and are already replaced by Part headings during print composition.

## F-12 — Part IV exposed an excluded computational comparator — FIXED IN PRINT

The Whole-House Coordination Fixture opened with `Relationship to the computational H1 fixture`. The comparison was useful development provenance, but the publication architecture explicitly keeps the computational track outside Parts I–V.

**Resolution:** the print adapter retains the architectural learning while removing the internal-track referent. The section becomes **Service coherence test** and states the actual question the comparator was testing.

## F-13 — Preface / Parts I–II / Part V repetition — KEEP WITH ONE FIX

The linear argument was checked specifically for repeated propositions.

Findings:

- the Preface is rhetorical and exploratory; Part I is systematic. They reinforce rather than duplicate each other;
- the `Build the permanent house. Assemble the changeable house inside it.` refrain appears at meaningful structural moments rather than as accidental duplication;
- proportionality language returns in Part V because delivery must retest the doctrine against cost, carbon and complexity;
- the only clear accidental repetition was F-10, now removed.

No broad prose shortening is justified by the print proof at this stage.

## F-14 — Part transitions — KEEP

The Reader's Guide now establishes the book's intentional mode changes:

- Parts I–II: linear argument;
- Part III: professional reference;
- Part IV: integration test / provisional worked house;
- Part V: return to making, procurement, testing and commissioning.

Because these mode changes are now established before Part I, the hard Part openings are preferable to artificial linking paragraphs inserted merely to smooth pagination.

# Deferred manuscript work exposed by print

The PDF has done useful diagnostic work beyond the pipeline itself. The principal deferred publication work is now clearer:

- mature the Reference House into the six publication-facing chapters named by the publication architecture;
- develop the missing project-specific Site/type, water/environmental and future-maintenance-scenario material rather than disguising existing coordination documents as those chapters;
- continue adding figures where the publication architecture calls for them and where they genuinely improve the argument;
- eventually develop the promised back matter (evidence/precedent notes, doctrine map, research agenda, implementation schedule, language map, glossary, bibliography/standards) as authored publication material rather than dumping repository indexes into the book.

These gaps are compatible with the label **Working Edition**. They should not block the PDF pipeline.

# Final G4 verification gate

Before marking G4 PASS:

- [ ] latest full Working Edition CI build succeeds after Reference House print adaptation;
- [ ] final PDF scan shows no unintended raw `.md`, `Phase-*`, `Start with`, `Related documents`, `The Long-Life House`, duplicate implementation bridge or internal computational-H1 language;
- [ ] Reader's Guide, Part III and representative Part IV pages are visually inspected in the rebuilt artifact;
- [ ] TOC/Part starts remain structurally sane after added front matter and editorial shortening;
- [ ] no new renderer/path regressions appear.

If these checks pass, G4 is complete. Further Reference House authorship belongs to normal project development, not this implementation branch.
