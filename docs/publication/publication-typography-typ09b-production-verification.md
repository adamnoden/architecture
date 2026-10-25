<!-- nav-exclude: redirect -->
# TYP-09B — Deterministic production typography verification

Status: **IMPLEMENTATION CANDIDATE**  
Programme: TYP #425  
Parent: TYP-09 #702  
Packet: #704

## Boundary

TYP-09B makes the TYP-09A production typography mechanically fail-closed without reopening its design.

The authoritative proof path is now `publication/scripts/build-typography-proof.ts` + `publication/scripts/verify-typography.ts`, exercised by `.github/workflows/publication-typography.yml`.

The proof produces normalized A4/B5 copies under `publication/.proof/typ09b`. Ordinary `publication:build` remains the fast A4 authoring path and is not burdened with qpdf/Poppler proof mechanics.

## Permanent checks

The production gate verifies:

- exact five finished Source faces only;
- embedded + subset + Unicode-mapped finished fonts;
- every-page A4 / 176 × 250 mm geometry;
- A4 page count agrees with the committed production metadata ledger;
- qpdf structural integrity;
- deterministic overlong Vivliostyle destination normalization when needed;
- zero `pdftotext` parser stderr;
- principal title page free of revision/date/site provenance;
- generated imprint carries moved provenance;
- all five Part openings occur in order, on recto, without folios;
- actual parity blanks are furnitureless and never doubled;
- representative internal chapter 9 retains its folio;
- TYP-09A integration evidence still records five divisions, the complete Part I Notes mapping, complete mixed-content transforms, one stripped working plate seam and 22 controlled SVGs;
- PDF SHA-256, pages/leaves and 16-page signature-boundary implications are recorded for both formats.

## Artifact separation

The workflow emits two independent artifacts:

- `publication-typography-production-proof` — reader-facing A4/B5 PDFs only;
- `publication-typography-production-diagnostics` — verification JSON, upstream font evidence, integration evidence, destination-normalization evidence and inspector output.

Diagnostics therefore do not leak into the reader-facing release object.

## Historical TYP-08 boundary

The frozen TYP-08 full-book workflow remains available through manual dispatch and runs automatically only when its own workflow or `publication/specimens/typ08/**` changes. It is no longer a universal tax on every publication/manuscript PR.

This does not erase TYP-08 authority. The exact historical proof remains independently reproducible; TYP-09B simply replaces it as the active production typography gate.

## First-proof freeze

The first exact production proof will establish the authoritative B5 page count and signature implication. That result must be committed as a regression ledger before TYP-09B closes; it is not inferred from the 334-page TYP-08 candidate because TYP-09A moved the system into a different production composition path.
