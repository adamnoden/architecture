# Print publication pipeline — implementation record

**Status:** **COMPLETE — G0–G6 PASS**  
**Merged:** PR #26 — *Build first-class print publication pipeline*  
**Implementation merge:** `1504786299722487e9a4a5a2520a53ad89a5c1bf` (`1504786`)  
**Started / completed:** 2026-10-09  
**Editorial authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)  
**Scope crosswalk:** [`print-publication-scope-crosswalk.md`](print-publication-scope-crosswalk.md)  
**Editorial proof:** [`print-publication-editorial-proof.md`](print-publication-editorial-proof.md)

This is the durable maintenance record for the House Systems Architecture Working Edition PDF. The implementation is complete; future work should treat the pipeline as ordinary project infrastructure rather than a separate initiative.

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

The website and PDF are sibling renderers over the same canonical source. The website is for navigation, audit and live project state; the PDF is the linear publication; the repository owns source, development history and executable work.

## Durable implementation

```text
publication/
  publication.ts          # Working Edition compile manifest
  adapters.ts             # deterministic print-only composition/adaptation
  vivliostyle.config.js   # title, contents and renderer configuration
  theme.css               # A4 duplex print system
  puppeteer.ci.json       # isolated CI-only Mermaid Chromium workaround
  scripts/
    prepare.ts             # disposable workspace, links, Mermaid derivation
    validate.ts            # source/manifest invariants
```

Generated `.work/` and `dist/` state is disposable and ignored.

Direct publication tools are exact-pinned:

- `@vivliostyle/cli` `11.3.3`
- `@mermaid-js/mermaid-cli` `11.17.0`

The full npm dependency closure is committed in `package-lock.json`; CI uses `npm ci`.

## Publication rules

1. Canonical prose remains in the existing Markdown tree. There is no duplicate print manuscript.
2. `docs/manuscript/publication-architecture.md` owns editorial scope and sequence meaning.
3. `publication/publication.ts` owns mechanical compile order only.
4. Print-only composition belongs in `publication/adapters.ts`; it must not silently redefine architectural claims.
5. Mermaid fenced source remains canonical; print SVGs are derived artifacts.
6. Research, development history and the computational track do not enter the monograph merely because they exist in the repo.
7. The rolling PDF is explicitly a **Working Edition**.
8. Stable public PDF path: `/architecture/house-systems-architecture.pdf`.
9. Missing sources, duplicate entries, unsupported dynamic constructs, failed Mermaid rendering, residual local repository links and failed PDF production are hard build errors.
10. Page count is an outcome, not a target.

## Production Pages contract

Every push to `main` now uses `.github/workflows/docs-pages.yml` to:

1. check out one commit;
2. install the locked dependency graph with `npm ci`;
3. run the repository tests and publication validation;
4. build the Working Edition PDF;
5. fail if the PDF is absent;
6. build VitePress;
7. copy the PDF to `.vitepress/dist/house-systems-architecture.pdf`;
8. upload one Pages artifact;
9. deploy that artifact to GitHub Pages.

The website and downloadable PDF therefore necessarily originate from the same commit.

## Current Working Edition

The implementation-closeout edition is **213 A4 pages** and contains title/edition metadata, controlled contents, Preface, Reader's Guide, Parts I–V, 21 canonical patterns, three strategies, four held candidates and the current publication-facing Reference House material.

Print design is A4 portrait, duplex/facing-page aware, binding-margin aware and black-and-white safe. Major Parts begin recto. Figures remain vector where source permits. Tables, code, widows/orphans and running furniture have explicit print rules.

The Reference House remains honestly provisional. Do not manufacture the six future publication chapters by renaming current development records. Missing Site/type, water/environmental and future-maintenance chapters are normal future HSA work.

## Verification record

### G0–G4

The compatibility, full-publication, typography and whole-book editorial gates all passed. Detailed findings remain in the scope crosswalk and editorial-proof ledger.

Key verified properties include:

- canonical sources are not mutated by build preparation;
- Vue-generated Pattern index content has a deterministic print representation;
- canonical Part I/II inserts compose at their intended positions;
- Parts III/IV retain canonical source ownership;
- evidence/maturity and `Does not prove` boundaries survive print while repository/migration bureaucracy stays out of the primary reading path;
- all fonts are embedded/subset;
- representative Poppler/PDFium rendering agrees;
- user-facing PDF links contain no `localhost`, filesystem, runner-path or raw `.md` destinations.

### G5

Deterministic combined site/PDF build passed with read-only CI permissions before production integration. The assembled preview contained both `index.html` and `house-systems-architecture.pdf`, and its rendered navigation target was verified as `/architecture/house-systems-architecture.pdf`.

### G6 — merge and production closeout

PR #26 was merged to `main` at commit `1504786299722487e9a4a5a2520a53ad89a5c1bf`.

Production GitHub Pages workflow run `37938502579` passed both build and deploy jobs. GitHub deployment `ed56d6c125590e0ac0e2f15c6649ee80` deployed the site to `https://adamnoden.github.io/architecture/`.

The exact Pages artifact deployed by GitHub (artifact `11619791208`) was downloaded and inspected:

- `index.html` present;
- `house-systems-architecture.pdf` present;
- rendered **Download PDF** href: `/architecture/house-systems-architecture.pdf`;
- site build meta: full merge commit `1504786299722487e9a4a5a2520a53ad89a5c1bf`;
- PDF title: **House Systems Architecture — Working Edition**;
- PDF: **213 A4 pages**, unencrypted, no forms or JavaScript;
- PDF title page revision: `1504786`;
- deployed PDF SHA-256: `2398f6fb1d8f2793daf046f50178c5c27e1129e63b24246a0462a621bd21f264`.

Direct DNS access to the public GitHub Pages domain was unavailable from the implementation tool environment, so live-byte verification used the exact `github-pages` artifact referenced by the successful GitHub deployment. That artifact is the deploy job's source payload, not a separate local rebuild.

## Known renderer warning

Poppler reports that some Vivliostyle named-destination tokens are longer than the PDF specification recommends. The warning was reproduced on the exact deployed Pages PDF.

It remains non-blocking because:

- the PDF opens correctly;
- internal links resolve;
- fonts are embedded;
- representative Poppler/PDFium rendering agrees;
- user-facing URI annotations are clean.

Do not hide the warning. Recheck after material Vivliostyle upgrades.

## Maintenance / recovery protocol

If the publication build fails in future:

1. reproduce with the same `npm ci`, `npm test`, `npm run publication:build`, `npm run docs:build` sequence used by Pages;
2. read `docs/manuscript/publication-architecture.md` before changing publication scope;
3. treat `publication/publication.ts` as compile order, not editorial authority;
4. keep generated state disposable;
5. add a print adapter only when web/repository source legitimately needs a different publication representation;
6. never weaken source, navigation or link validation merely to make the PDF compile;
7. re-run PDF preflight and representative visual review after renderer/tool upgrades.

The print pipeline is now ordinary project infrastructure. Future PDF improvements should be driven by publication or architectural needs, not by pipeline novelty.
