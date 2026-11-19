# Primer audit — 31 October 2026

**Status:** revision passed editorial, source-fidelity, rendered-page and local repository review. The merging PR records exact-head integration and deployment evidence.

## Scope and decision

The owner requested a full audit of the Primer: dense, compact prose, a clear account of the project and mission, and ruthless review of figures, diagrams and sequences. This is an owner-directed, non-packet editorial/publication audit. It makes no canonical node or lease transition and does not discharge EDA-RENEWED, whose final review still depends on the PLT freeze.

The revision leads with the purpose of designing and building the owner's London home. It explains the physical consequences of separating durable fabric from replaceable systems, then presents the governing rules, pattern language, current house and means of testing the proposals. The book and computation remain subordinate to that purpose.

## Dispositions

- Compressed repeated permanence claims, introductory framing and publication self-description. Retained selective permanence, proportional serviceability, the four platform parts, workmanship robustness and repose.
- Removed four ASCII composition/process sequences: the assembly hierarchy, Reference House composition stack, repeated doctrine-to-implementation chain and computational pipeline. The necessary distinctions remain in compact prose.
- Retained all **11 canonical governing rules**, unchanged and in order, and all **21 active pattern identities**. Supporting sentences are selected from their owning sources for meaning rather than by paragraph position.
- Kept six representative patterns with canonical action statements, necessary qualifications and evidence labels. Their evidence status does not certify an implementation in the house.
- Replaced the inherited orientation SVG's **12 × 10.8 m** shell and **3.6 × 4 m** court with a ground-plan figure derived from the current source: a **12 × 12 m** shell and centred **3.5 × 3.5 m** court. The figure is an architectural study, not a construction detail.
- Restored the current owner requirements and pre-site design context. Material, structural, dryness and roof requirements remain distinct from adopted assemblies, engineering proof and future site acceptance.
- Reduced the closing section to physical trials, rejection of unsuccessful proposals, verification in the completed house and bounded computational support.

## Method and measured compression

Reviewed the owning charter, editorial doctrine, canonical rules, pattern sources, Reference House basis, publication adapters and assembled Primer. Compared the revised extraction against its source meaning and read the complete assembled text independently. Rendered inspection and build evidence are recorded separately below.

Counts below compare assembled source prose, excluding SVG content and Markdown link destinations. They measure editorial compression, not architectural completeness or maturity.

| Section | Before | After |
| --- | ---: | ---: |
| Proposition | 669 | 304 |
| Governing constitution | 854 | 882 |
| Patterns | 715 | 553 |
| Reference House | 263 | 288 |
| Outlook | 589 | 223 |
| **Total** | **3,090** | **2,250** |

The reduction is **840 words (27.18%)**. Constitution and Reference House grew where additional source-derived information corrected omissions or clarified the current design.

The previously deployed Primer had **16 pages**; the revised font-pinned edition has **10 A4 pages**, a reduction of six pages (37.5%). Title and contents share a page. Individual provisions and pattern examples stay intact; the house text and plan occupy a facing pair. The type remains 10.5 pt with 1.4 line spacing.

## Validation evidence

- Independently inspected every rendered page. No clipped text, collisions, missing glyphs, detached captions or page-break orphans were found. All eleven canonical rules match the PDF after normalising line-break hyphenation; all twenty-one active pattern titles appear.
- The plan's 12 m dimensions measure **119.9997 mm** horizontally and vertically in the PDF, confirming **1:100**. The upper dimension, external plant-room door and caption remain within the page. Tests also preserve source primitives, physical strokes and the 3 m scale bar.
- Embedded the existing, source-pinned Source Serif 4 and Source Sans 3 fonts. The original local replay used different host fallbacks and ran to 17 pages; the before figure above is the actual deployed 16-page PDF. Pagination now uses pinned publication fonts rather than host serif/sans substitution.
- Built both publications: the Working Edition remains **279 pages** and the Primer has **10**. Regenerated publication metadata and the dependent data plate from those PDFs.
- Local `npm run check` passed, including adapter/figure tests, generated outputs, publication source/integrity checks and the documentation build. The existing figure-bounds check passed with the same Liberation Sans fallback available in CI; the initial host lacked that font and falsely widened one unchanged full-book label. No assertion or source drawing was weakened to obtain a pass.
- A separate implementation review found no material defect in the canonical-source extraction, cardinality/centred-court guards, declared dependency copying or edition-specific font preparation. Full-book typography remains separate.

The reviewed pre-commit PDF has SHA-256 `5710097974ed7da27be2bbfba071a20767f4653ab4c2e2c9776479fcd083ce5b`. Its cover identifies the baseline revision; the integrated build must stamp its actual source revision. Exact-head CI, safe merge, deployed PDF verification and branch cleanup are required publication receipts in the merging PR, not inferred from this local proof.

The work does not establish structural capacity, building-physics performance, services adequacy, regulatory acceptance, real-site compatibility or physical prototype results.
