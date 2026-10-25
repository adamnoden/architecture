<!-- nav-exclude: redirect -->
# TYP-09B — Deterministic production typography verification

Status: **FINAL REPROOF CANDIDATE**  
Programme: TYP #425  
Parent: TYP-09 #702  
Packet: #704

## Boundary

TYP-09B makes the TYP-09A production typography mechanically fail-closed without reopening its design.

The authoritative proof path is now `publication/scripts/build-typography-proof.ts` + `publication/scripts/verify-typography.ts` + `publication/scripts/verify-typography-ledger.ts`, exercised by `.github/workflows/publication-typography.yml`.

The proof produces normalized A4/B5 copies under `publication/.proof/typ09b`. Ordinary `publication:build` remains the fast A4 authoring path and is not burdened with qpdf/Poppler proof mechanics.

## Permanent checks

The production gate verifies:

- exact five finished Source faces only;
- embedded + subset + Unicode-mapped finished fonts;
- every-page A4 / 176 × 250 mm geometry;
- both A4 and B5 page/leaf/signature counts against `publication/typography-metadata.json`;
- qpdf structural integrity;
- deterministic overlong Vivliostyle destination normalization when needed;
- zero `pdftotext` parser stderr;
- principal title page free of revision/date/site provenance;
- generated imprint carries moved provenance;
- all five Part openings occur in order, on recto, without folios;
- actual parity blanks are furnitureless and never doubled;
- representative internal chapter 9 retains its folio;
- TYP-09A integration evidence still records five divisions, the complete Part I Notes mapping, complete mixed-content transforms, one stripped working plate seam and 22 controlled SVGs;
- PDF SHA-256 plus pages/leaves and 16-page signature-boundary implications are recorded for both formats.

## First exact production proof

First successful paired proof authority:

- branch head `7542b4cfcfeeb7fb90489b37dd97130d2bb9b828`;
- workflow run `40198770522` — **SUCCESS**;
- reader-facing proof artifact `12601145960` — `publication-typography-production-proof`;
- proof artifact digest `sha256:49069c2469f8a626f487c0ad54349486dcc2f5f869115fc165cf792ef54c88d4`;
- diagnostics artifact `12601630400` — `publication-typography-production-diagnostics`;
- diagnostics digest `sha256:b4a5d7254200c13c8335a7ee24cacfcf72dbf87b4583627ae13307560909140a`.

### A4

- 278 pages / 139 duplex leaves;
- 18 × 16-page sections → 288-page boundary;
- 10 pages of padding to that boundary;
- normalized proof SHA-256 `12d39eddc3ca8e2a371d4a661bb08dcdaf14283a79957a14ed91d345b8c4c684`;
- Part openings: 19 / 49 / 83 / 173 / 227;
- one actual parity blank before Part II at page 48;
- chapter 9 at page 69;
- 69 overlong Vivliostyle destination names normalized across 196 occurrences.

### Conservative B5

- **335 pages / 168 duplex leaves**;
- 176 × 250 mm;
- 21 × 16-page sections → 336-page boundary;
- **1 page of padding** to that boundary;
- normalized proof SHA-256 `99a20ffd24a668e738db0f1f7828f3224c34dbf0464443a6d2b2f05754408180`;
- Part openings: 23 / 59 / 103 / 215 / 273;
- actual parity blanks before Parts I–IV at pages 22 / 58 / 102 / 214; Part V needs none;
- chapter 9 at page 85;
- 69 overlong Vivliostyle destination names normalized across 198 occurrences.

### Format comparison

- B5 is +57 pages versus A4;
- +29 duplex leaves;
- +20.5% pages.

No spine width is claimed: final paper caliper, stock and binding specification remain manufacturing inputs.

This first proof is now frozen as `publication/typography-metadata.json`. Subsequent production typography proofs must reproduce **278 A4 / 335 B5** with the same block implications unless an explicitly owned content or typography freeze break updates the ledger.

## Artifact separation

The workflow emits two independent artifacts:

- `publication-typography-production-proof` — reader-facing A4/B5 PDFs only;
- `publication-typography-production-diagnostics` — committed pagination ledger, verification JSON, upstream font evidence, integration evidence, destination-normalization evidence and inspector output.

Diagnostics therefore do not leak into the reader-facing release object.

## Historical TYP-08 boundary

The frozen TYP-08 full-book workflow remains available through manual dispatch and runs automatically only when its own workflow or `publication/specimens/typ08/**` changes. It is no longer a universal tax on every publication/manuscript PR.

This does not erase TYP-08 authority. The exact historical proof remains independently reproducible; TYP-09B simply replaces it as the active production typography gate.

## Close condition

TYP-09B may close when the committed pagination ledger reproduces on a fresh exact head, the repository validation is green, and the production proof/diagnostics artifacts are present. No further typography-design work is authorised in this packet.
