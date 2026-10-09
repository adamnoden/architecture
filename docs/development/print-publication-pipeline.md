# Print publication pipeline — implementation record

**Status:** **G0–G5 PASS; G6 active**  
**Branch:** `print-publication-pipeline`  
**PR:** #26 — *Build first-class print publication pipeline*  
**Started:** 2026-10-09  
**Editorial authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)  
**Scope crosswalk:** [`print-publication-scope-crosswalk.md`](print-publication-scope-crosswalk.md)  
**Editorial proof:** [`print-publication-editorial-proof.md`](print-publication-editorial-proof.md)

This document is the recovery and maintenance record for the House Systems Architecture Working Edition PDF. The repository must remain sufficient to resume or repair the system without relying on chat history.

## Final architecture

```text
canonical Markdown / SVG / Mermaid
              │
              ├── VitePress ───────────────► website
              │
              └── publication manifest
                        │
                        ▼
                 preparation layer
          adapters / links / Mermaid→SVG
                        │
                        ▼
                    Vivliostyle
                        │
                        ▼
          House Systems Architecture.pdf
                        │
                        └── copied into VitePress dist
                                  │
                                  ▼
                             GitHub Pages
```

The website and PDF are sibling renderers over the same source. The website is for navigation, audit and project state; the PDF is the linear publication; the repository owns source, development history and executable work.

## Durable implementation

```text
publication/
  publication.ts          # 45-entry Working Edition manifest
  adapters.ts             # deterministic print-only composition/adaptation
  vivliostyle.config.js   # title, contents and renderer configuration
  theme.css               # A4 duplex print system
  puppeteer.ci.json       # isolated CI-only Mermaid Chromium workaround
  scripts/
    prepare.ts             # disposable workspace, link rewriting, Mermaid
    validate.ts            # source/manifest invariants
```

Generated `.work/` and `dist/` state is disposable and ignored.

Direct publication tools are exact-pinned:

- `@vivliostyle/cli` `11.3.3`
- `@mermaid-js/mermaid-cli` `11.17.0`

The full npm dependency closure is committed in `package-lock.json`; CI uses `npm ci`.

## Publication rules

1. Canonical prose remains in the existing Markdown tree. No duplicate print manuscript.
2. `docs/manuscript/publication-architecture.md` owns editorial scope and sequence meaning.
3. `publication/publication.ts` owns only mechanical compile order and print metadata.
4. Print-only composition belongs in `publication/adapters.ts`; it must not silently redefine architectural claims.
5. Mermaid fenced source remains canonical; print SVGs are derived artifacts.
6. Research, development history and the computational track do not enter the monograph merely because they exist in the repo.
7. The rolling PDF is explicitly a **Working Edition**.
8. Stable public PDF path: `/architecture/house-systems-architecture.pdf`.
9. Missing sources, duplicate entries, unsupported dynamic constructs, failed Mermaid rendering, residual local repository links and failed PDF production are hard build errors.
10. Page count is an outcome, not a target.

## Current Working Edition

The current edition is **213 A4 pages** and includes:

- title / Working Edition metadata;
- controlled two-page contents;
- Preface;
- authored Reader's Guide with abstract, definitions, evidence/maturity legend and governing constraints;
- Parts I–V;
- 21 canonical patterns, three strategies and four held candidates;
- current publication-facing Reference House material;
- print-specific title/hierarchy composition without duplicating canonical source.

Print design is A4 portrait, duplex/facing-page aware, binding-margin aware and black-and-white safe. Major Parts begin recto. Figures remain vector where source permits. Tables, code, widows/orphans and running furniture have explicit print rules.

## Editorial boundary established by print proof

The whole-book proof retained evidence discipline while removing repository/process residue from the linear reading path.

Keep in print:

- stable pattern identities;
- Evidence and Maturity;
- `Does not prove` boundaries;
- meaningful architectural provenance;
- explicit uncertainty and candidate status.

Keep outside the primary print path where possible:

- raw filenames and repository paths;
- internal phase/gate terminology;
- migration bookkeeping;
- repetitive document-control furniture;
- excluded computational-track comparators.

The Reference House remains honestly provisional. Do not manufacture the six future publication chapters by renaming current development records. Missing Site/type, water/environmental and future-maintenance chapters are normal future HSA work.

## G0–G4 — PASS

Detailed decisions and findings remain in the scope crosswalk and editorial-proof ledger.

Key verified outcomes:

- direct Markdown → Vivliostyle path proved on representative sources;
- canonical sources remain unmodified by build preparation;
- Pattern index Vue content has a deterministic static print adapter;
- Part I/II canonical inserts compose at their intended positions;
- Part III/IV retain canonical source ownership;
- full Working Edition builds successfully;
- artifact visually reviewed in grayscale and duplex-oriented contact sheets;
- representative Poppler/PDFium rendering agrees;
- all fonts are embedded/subset;
- final user-facing PDF links contain no `localhost`, filesystem, runner-path or raw `.md` destinations;
- whole-book editorial proof completed and recorded.

## G5 — deterministic CI and website delivery — PASS on branch

The complete production build contract has been proven on `print-publication-pipeline`.

Verified:

- [x] `package-lock.json` generated in Linux CI and committed;
- [x] `npm ci --no-audit --no-fund` succeeds on Node 24;
- [x] P0 tests 17/17 and PAT-XW-01 tests 6/6 remain green;
- [x] publication validation succeeds with 45 Working Edition entries;
- [x] smoke PDF builds;
- [x] full Working Edition PDF builds;
- [x] VitePress build succeeds from the same checkout;
- [x] PDF is copied to `.vitepress/dist/house-systems-architecture.pdf`;
- [x] combined site artifact contains both `index.html` and the PDF;
- [x] high-level **Download PDF** nav item added;
- [x] rendered nav target verified as `/architecture/house-systems-architecture.pdf`;
- [x] VitePress navigation-coverage invariant retained and new publication pages classified properly;
- [x] production `.github/workflows/docs-pages.yml` now uses the same locked build/assembly sequence;
- [x] temporary branch-only publication workflow removed after successful proof.

The clean combined branch proof used read-only permissions and successfully completed install, tests, PDF build, site build, assembly and artifact upload. The public live deployment itself is intentionally verified only after merge in G6.

## Production Pages contract

On every push to `main`, `.github/workflows/docs-pages.yml` now:

1. checks out one commit;
2. installs with `npm ci`;
3. runs the repository test suite and publication validation;
4. builds the Working Edition PDF;
5. fails if the PDF is absent;
6. builds VitePress;
7. copies that PDF into `.vitepress/dist/house-systems-architecture.pdf`;
8. uploads one Pages artifact;
9. deploys that artifact to GitHub Pages.

Therefore the website and downloadable Working Edition necessarily originate from the same commit.

## Known renderer warning

Poppler reports that some Vivliostyle named-destination tokens are longer than the PDF specification recommends. This remains documented rather than suppressed.

Current evidence:

- PDF opens correctly;
- internal links resolve;
- fonts are embedded;
- representative Poppler/PDFium rendering agrees;
- user-facing URI annotations are clean.

Recheck after material Vivliostyle upgrades and once more on the live merged artifact. It is currently non-blocking.

## G6 — merge and live closeout — ACTIVE

Remaining acceptance:

- [ ] review branch diff for accidental authority/content changes;
- [ ] recheck publication dependency/tool assumptions against current upstream documentation where material;
- [ ] ensure final PR checks are green;
- [ ] merge PR #26 to `main`;
- [ ] observe the production Pages workflow from the merged commit;
- [ ] verify live website **Download PDF** navigation;
- [ ] open the live PDF and check title/edition metadata, page count and representative rendering;
- [ ] recheck the known named-destination warning on the merged artifact;
- [ ] confirm live website and PDF identify the same merged commit;
- [ ] close the implementation branch/PR cleanly.

## Recovery protocol

If interrupted during G6:

1. inspect PR #26 and branch `print-publication-pipeline`;
2. confirm the latest branch head and checks;
3. do not redo G0–G5 unless the diff changed relevant files;
4. continue from the first unchecked G6 item above;
5. after merge, treat the `main` Pages workflow and the live site/PDF as the final source of truth.
