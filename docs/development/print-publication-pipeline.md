# Print publication pipeline — implementation record

**Status:** **COMPLETE — G0–G6 PASS; PRIMER COMPANION LIVE**  
**Merged:** PR #26 — *Build first-class print publication pipeline*  
**Implementation merge:** `1504786299722487e9a4a5a2520a53ad89a5c1bf` (`1504786`)  
**Started / completed:** 2026-10-09  
**Primer companion added:** 2026-10-11  
**Editorial authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)  
**Scope crosswalk:** [`print-publication-scope-crosswalk.md`](print-publication-scope-crosswalk.md)  
**Editorial proof:** [`print-publication-editorial-proof.md`](print-publication-editorial-proof.md)

This is the durable maintenance record for the House Kernel print-publication system. It now produces two sibling publications from one repository commit: the complete **Working Edition** and the compact **Primer**. The implementation is ordinary project infrastructure rather than a separate initiative.

## Final architecture

```text
canonical Markdown / SVG / Mermaid
              │
              ├── VitePress ─────────────────────────────► website
              │
              └── publication manifests
                        │
              ┌─────────┴─────────┐
              │                   │
        Working Edition         Primer
              │                   │
              └─────────┬─────────┘
                        ▼
                 preparation layer
          adapters / links / Mermaid→SVG
                        │
                        ▼
                    Vivliostyle
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
       Working Edition.pdf      Primer.pdf
              │                   │
              └─────────┬─────────┘
                        ▼
                copied into VitePress dist
                        │
                        ▼
                   GitHub Pages
```

The website and both PDFs are sibling renderers over the same project source. The website is for navigation, audit and live project state; the Working Edition is the complete linear publication; the Primer is the compact entry publication; the repository owns source, development history and executable work.

## Durable implementation

```text
publication/
  publication.ts          # Working Edition + Primer compile manifests
  adapters.ts             # deterministic print-only composition/adaptation
  vivliostyle.config.js   # title, contents and renderer configuration
  theme.css               # shared A4 duplex print system
  puppeteer.ci.json       # isolated CI-only Mermaid Chromium workaround
  primer/
    README.md              # Primer editorial contract
    proposition.md         # Primer-only opening compression
    outlook.md             # Primer-only closing compression
  scripts/
    prepare.ts             # disposable workspace, links, Mermaid derivation
    validate.ts            # source/manifest/adapter invariants
```

Generated `.work/` and `dist/` state is disposable and ignored.

Direct publication tools are exact-pinned:

- `@vivliostyle/cli` `11.3.3`
- `@mermaid-js/mermaid-cli` `11.17.0`

The full npm dependency closure is committed in `package-lock.json`; CI uses `npm ci`.

## Publication rules

1. Canonical architectural prose remains in the existing Markdown tree. There is no duplicate print manuscript. The Primer owns only the connective compression that is unique to its editorial job.
2. `docs/manuscript/publication-architecture.md` owns Working Edition scope and sequence meaning; `publication/primer/README.md` owns the compact edition's editorial contract.
3. `publication/publication.ts` owns mechanical compile order only.
4. Print-only composition belongs in `publication/adapters.ts`; it must not silently redefine architectural claims.
5. Primer doctrine, pattern identities/statements and Reference House claims are derived from canonical sources rather than copied into a second maintained text.
6. Mermaid fenced source remains canonical; print SVGs are derived artifacts.
7. Research, development history and the computational track do not enter either publication merely because they exist in the repo.
8. The complete rolling PDF is explicitly a **Working Edition**. The compact companion is explicitly a **Primer**.
9. Stable public paths are `/architecture/house-kernel.pdf` and `/architecture/house-kernel-primer.pdf`.
10. Missing sources, duplicate entries, unsupported dynamic constructs, adapter/schema drift, failed Mermaid rendering, residual local repository links and failed PDF production are hard build errors.
11. Page count is an outcome, not a hard target. The Primer currently uses 14–18 pages as an editorial compression signal, with roughly 16 pages as the intended centre.

## Primer editorial contract

The Primer is not a miniature copy of the Working Edition and not a promotional brochure. Its job is to give a technically literate reader the complete mental model of House Kernel in one sitting.

Its current five-part sequence is:

1. **The proposition** — lifespan coupling, selective permanence, proportional serviceability and the architectural platform.
2. **Eleven governing principles** — all doctrine principles, in canonical order, with their canonical rules and enough explanation to preserve meaning.
3. **From doctrine to patterns** — the doctrine → strategy → pattern → reference-implementation hierarchy; all 21 active canonical pattern identities; six representative patterns in brief.
4. **The Reference House** — one coordinated interpretation and integration test, explicitly not proof or style doctrine.
5. **Making and testing the platform** — physical testing, implementation discipline and the parallel computational track, kept subordinate to the architectural argument.

The six currently expanded patterns are deliberately broad rather than a privileged inner canon:

- `PAT-001` — Controlled Utility Entry;
- `PAT-005` — Designed Structural Penetration;
- `PAT-018` — Failure-Tolerant Wet Service Room;
- `PAT-007` — Permanent Opening / Replaceable Window;
- `PAT-013` — Ground-Supported Façade Access;
- `PAT-012` — Physical Service Index.

The full compact-edition contract is maintained in `publication/primer/README.md`.

## Production Pages contract

Every push to `main` now uses `.github/workflows/docs-pages.yml` to:

1. check out one commit;
2. install the locked dependency graph with `npm ci`;
3. run repository tests and publication/adapter validation;
4. build the Working Edition PDF;
5. build the Primer PDF;
6. fail if either PDF is absent;
7. build VitePress;
8. copy both PDFs into `.vitepress/dist/`;
9. upload one Pages artifact;
10. deploy that artifact to GitHub Pages.

The website and both downloadable publications therefore necessarily originate from the same commit.

## Current Working Edition

The implementation-closeout edition was **213 A4 pages** and contained title/edition metadata, controlled contents, Preface, Reader's Guide, Parts I–V, 21 canonical patterns, three strategies, four held candidates and the current publication-facing Reference House material. The exact rolling page count may change with the project.

Print design is A4 portrait, duplex/facing-page aware, binding-margin aware and black-and-white safe. Major Parts begin recto. Figures remain vector where source permits. Tables, code, widows/orphans and running furniture have explicit print rules.

The Reference House remains honestly provisional. Do not manufacture the six future publication chapters by renaming current development records. Missing Site/type, water/environmental and future-maintenance chapters are normal future House Kernel work.

## Current Primer

The first deployed Primer is **15 A4 pages**. It contains a title page and controlled contents, the compact proposition, all eleven governing principles, the complete 21-pattern active-language map, six representative pattern summaries, the Reference House integration section and the testing/computational outlook.

The same print theme is retained deliberately so the two PDFs read as editions of one publication system rather than separate products. The compact edition does not shrink body type or compress margins merely to hit a page number; compression is editorial.

The initial 15-page render was inspected page by page from the exact Pages deployment artifact. No clipping, overlap, broken glyphs or missing sections were observed. The Reference House fixture remains vector and legible, and the compact pattern map remains readable at ordinary A4 print scale.

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

Deterministic combined site/PDF build passed with read-only CI permissions before production integration. The assembled preview contained both `index.html` and `house-kernel.pdf`, and its rendered navigation target was verified as `/architecture/house-kernel.pdf`.

### G6 — merge and production closeout

PR #26 was merged to `main` at commit `1504786299722487e9a4a5a2520a53ad89a5c1bf`.

Production GitHub Pages workflow run `37938502579` passed both build and deploy jobs. GitHub deployment `ed56d6c125590e0ac0e2f15c6649ee80` deployed the site to `https://adamnoden.github.io/architecture/`.

The exact Pages artifact deployed by GitHub (artifact `11619791208`) was downloaded and inspected:

- `index.html` present;
- `house-kernel.pdf` present;
- rendered **Download PDF** href: `/architecture/house-kernel.pdf`;
- site build meta: full merge commit `1504786299722487e9a4a5a2520a53ad89a5c1bf`;
- PDF title: **House Kernel — Working Edition**;
- PDF: **213 A4 pages**, unencrypted, no forms or JavaScript;
- PDF title page revision: `1504786`;
- deployed PDF SHA-256: `2398f6fb1d8f2793daf046f50178c5c27e1129e63b24246a0462a621bd21f264`.

Direct DNS access to the public GitHub Pages domain was unavailable from the implementation tool environment, so live-byte verification used the exact `github-pages` artifact referenced by the successful GitHub deployment. That artifact is the deploy job's source payload, not a separate local rebuild.

### Primer companion — production closeout

The Primer companion was added on 2026-10-11 and hardened so its deterministic adapters are exercised during ordinary `npm test`, not only when Vivliostyle starts rendering. This makes source/adaptor schema drift a repository-test failure.

Production workflow run `38126989866`, at commit `9c30e24a000bddcdcdf99d059802041bbc9fded0`, passed tests, both PDF builds, PDF-presence checks, VitePress build, Pages assembly, artifact upload and deployment.

The preceding successful Pages artifact that introduced the same Primer content was downloaded and inspected directly because the public Pages domain remained unavailable from the tool environment:

- both publication PDFs present;
- Primer title: **House Kernel — Primer**;
- Primer: **15 A4 pages**, unencrypted, no forms;
- five PDF outline entries matching the five-part editorial sequence;
- rendered site navigation contains **Primer · compact** and **Working Edition · complete**;
- full-page visual inspection showed no clipping or overlap.

## Known renderer warning

Poppler reports that some Vivliostyle named-destination tokens are longer than the PDF specification recommends. The warning is present in both publication builds and was reproduced on deployed Pages artifacts.

It remains non-blocking because:

- the PDFs open correctly;
- internal links resolve;
- fonts are embedded;
- representative rendering is clean;
- user-facing URI annotations are clean.

Do not hide the warning. Recheck after material Vivliostyle upgrades.

## Maintenance / recovery protocol

If the publication build fails in future:

1. reproduce with the same `npm ci`, `npm test`, `npm run publication:build`, `npm run publication:build:primer`, `npm run docs:build` sequence used by Pages;
2. read `docs/manuscript/publication-architecture.md` before changing Working Edition scope and `publication/primer/README.md` before changing Primer scope;
3. treat `publication/publication.ts` as compile order, not editorial authority;
4. keep generated state disposable;
5. add a print adapter only when canonical web/repository source legitimately needs a different publication representation;
6. never weaken source, adapter, navigation or link validation merely to make a PDF compile;
7. re-run PDF preflight and representative visual review after renderer/tool upgrades.

The print pipeline is ordinary project infrastructure. Future PDF improvements should be driven by publication or architectural needs, not by pipeline novelty.
