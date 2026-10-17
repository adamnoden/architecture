<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-07 whole-corpus first-reader audit

**Gate:** NOM-07 — whole-corpus first-reader nomenclature audit  
**Status:** IN PROGRESS  
**Draft PR:** #157  
**Tracking issue:** #156  
**Starting head:** `936a529174c8856f9adeb38937b67b251a067837`

## Purpose

Audit the resolved publication as a reader rather than as a repository maintainer. The governing test is not zero acronyms or zero compact references. It is **zero unexplained or functionless identity noise**.

NOM-07 does not reopen completed NOM-02/NOM-03/NOM-06 decisions without new evidence. It asks whether the resolved site, Working Edition, Primer and technical/public surfaces make sense without knowledge of repository history.

## Bounded audit sequence

The gate is divided into independently resumable sub-gates so that each pass can be completed, recorded and validated before the next begins.

- [x] **NOM-07A — front door, navigation and publication openings**  
  Contents, landing/navigation/search-facing titles, Reader's Guide, part/chapter openings and section labels.
- [ ] **NOM-07B — patterns, strategies and held candidates**  
  Pattern index and every reader-facing pattern page, then strategies and held candidates. Verify that useful cross-reference capability survived removal of machine IDs.
- [ ] **NOM-07C — grammar, Reference House and technical/public computational surfaces**  
  Grammar material, Reference House exposition, generated/public technical pages, data plate and reader-visible compact technical references.
- [ ] **NOM-07D — figures, captions, evidence and back matter**  
  Figure/table captions and in-text references, SVG-visible text/metadata where reader-relevant, evidence/precedent apparatus, appendices and glossary.
- [ ] **NOM-07E — Primer and cross-surface consistency**  
  Read the Primer independently, then compare names/titles/references against the site and Working Edition.
- [ ] **NOM-07F — adversarial cold-reader reconciliation**  
  Final whole-corpus sweep for unexplained acronyms, false ordinals, workflow residue, inconsistent naming and over-cleaning. Resolve findings or explicitly defer number/order/version-only questions to NOM-08.

## Questions applied at every sub-gate

1. Is any acronym or compact reference unexplained where it first matters?
2. Does any code look like an ordinal when it is not?
3. Does any visible number imply false authority or maturity?
4. Does any workflow label survive in resolved architectural exposition?
5. Are names, titles and references consistent between web and print?
6. Has hiding a code removed useful cross-reference capability?
7. Has a technical surface become unnecessarily verbose because a useful compact code was over-cleaned?

## Finding classes

Each finding is recorded as one of:

- **FIX-NOW** — nomenclature/reader-coherence defect owned by NOM-07;
- **NOM-08** — number/order/version semantic question that should be decided in the dedicated next gate;
- **DRW** — figure/drawing quality or canonical figure-register matter owned by the sibling drawing programme;
- **RETAIN** — initially suspicious identity that earns its reader-facing role on inspection;
- **INTERNAL-ONLY** — valid machine/provenance identity confirmed absent from ordinary reader surfaces.

## Audit log

### NOM-07A — front door, navigation and publication openings — COMPLETE

Surfaces read:

- project landing page and reading guide;
- manuscript overview and Reader's Guide;
- Preface and Part I–V openings;
- publication entry titles used by the Working Edition;
- VitePress top-level navigation/sidebar definitions together with the public-surface filter and public-label overrides.

Findings:

- **FIX-NOW — obsolete hidden-ID explanation in Reader's Guide.** The guide still told readers that stable pattern IDs preserve provenance and cross-reference even though NOM-06 deliberately removed those machine IDs from ordinary presentation. Replaced with the actual reader semantic: pattern names are the identity and book order is editorial rather than ranking or required sequence.
- **FIX-NOW — code-first grammar introduction.** The first Reader's Guide mention of `G-01 v0.1` led with the code. Recast as a controlled Georgian-derived grammar with the compact reference in parentheses, so the reader encounters meaning before identifier.
- **RETAIN — `G-01` compact reference.** At the publication opening level the reference earns a role because it distinguishes the selected controlled grammar from the general architectural-grammar framework and is introduced with its human meaning. Whether `v0.1` is the best public version treatment remains a NOM-08 question.
- **INTERNAL-ONLY — workflow/history navigation definitions.** The source navigation file contains development/provenance labels and coded programme names, but `project/public-surface.ts` removes those sources from the public build/navigation and applies human-facing label overrides to retained technical material. No reader-facing defect was found at this layer.
- **RETAIN — ordinary external standards acronyms.** Familiar external references such as ISO/RICS/CIBSE/RIBA are used as standards/professional-body references rather than project-owned identity machinery. NOM-07 does not expand into stylistic acronym elimination where context is already clear.

Implementation commit: `5d265aca62163b61e96b898dbe881c10f16c2fbe`.

## Exit condition

NOM-07 closes only when every listed surface has been read cold, all FIX-NOW findings are resolved and validated, remaining compact references have an intelligible reader function, and any deliberately deferred number/order/version questions are explicitly handed to NOM-08 rather than left ambiguous.
