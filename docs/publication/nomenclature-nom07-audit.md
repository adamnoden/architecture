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

- [ ] **NOM-07A — front door, navigation and publication openings**  
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

_No sub-gate completed yet._

## Exit condition

NOM-07 closes only when every listed surface has been read cold, all FIX-NOW findings are resolved and validated, remaining compact references have an intelligible reader function, and any deliberately deferred number/order/version questions are explicitly handed to NOM-08 rather than left ambiguous.
