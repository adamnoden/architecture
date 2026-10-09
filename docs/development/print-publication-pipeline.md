# Print publication pipeline — implementation record

**Status:** active implementation — **G0/G1/G2 PASS; G3 active**  
**Branch:** `print-publication-pipeline`  
**Draft PR:** #26 — *Build first-class print publication pipeline*  
**Started:** 2026-10-09  
**Editorial authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)  
**Scope crosswalk:** [`print-publication-scope-crosswalk.md`](print-publication-scope-crosswalk.md)

This is the durable recovery record for the House Systems Architecture Working Edition PDF. Read it first after any interruption. The repository, not chat state, must always be sufficient to resume safely.

## Objective

Produce a continuously buildable **House Systems Architecture — Working Edition** PDF from the same canonical Markdown, SVG and Mermaid sources used by the documentation site.

The three surfaces remain distinct:

- **website:** navigation, exploration, audit, provenance and live project state;
- **PDF:** sustained linear reading of the architectural publication;
- **repository:** source ownership, history, development records and executable work.

Website navigation remains governed by `.vitepress/navigation.ts`. Publication meaning and scope remain governed by `docs/manuscript/publication-architecture.md`.

## Recovery protocol

1. Read this file.
2. Read `docs/manuscript/publication-architecture.md` before changing publication scope.
3. Inspect branch `print-publication-pipeline`, PR #26 and latest Actions results.
4. Resume at the first gate below that is not **PASS**.
5. Re-run that gate before trusting old transient results.
6. Record new blockers or deliberate deviations here before advancing.
7. Do not merge to `main` while an earlier gate is unresolved.

Generated workspaces and PDFs are disposable. Canonical state must be reconstructible from Git-tracked source plus declared dependencies.

## Locked architecture

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
```

Rules:

1. No duplicate manuscript tree.
2. VitePress remains the web renderer; print never scrapes the website.
3. Vivliostyle CLI is the print renderer over prepared Markdown.
4. The build stays Node-based unless a demonstrated blocker requires otherwise.
5. Mermaid fenced source remains canonical; print SVGs are disposable derivatives.
6. `publication/publication.ts` owns mechanical compile order only, not editorial meaning.
7. Print-only composition/adaptation belongs in `publication/adapters.ts`, not canonical prose.
8. Baseline physical target is A4 portrait, duplex/facing-page aware and black-and-white safe.
9. The rolling PDF is a **Working Edition**; immutable editions may later be cut from tags/releases.
10. Website and PDF must eventually build from the same commit and deploy together.
11. Stable public target path is `/architecture/house-systems-architecture.pdf`.
12. Publication scope may never widen silently to make the book look more complete.

## Implemented structure

```text
publication/
  publication.ts          # 44-entry Working Edition manifest + G1 smoke slice
  adapters.ts             # deterministic print composition/adapters
  vivliostyle.config.js   # renderer configuration
  theme.css               # currently compatibility-grade; G3 owns final print design
  puppeteer.ci.json       # isolated CI-only Mermaid Chromium workaround
  scripts/
    prepare.ts             # disposable workspace, adapters, link rewriting, Mermaid
    validate.ts            # manifest/source invariants
  .work/                   # generated, ignored
  dist/                    # generated, ignored
```

## G0 — durable control and branch isolation — PASS

- [x] dedicated branch;
- [x] durable recovery record;
- [x] draft PR #26.

## G1 — renderer compatibility vertical slice — PASS

Representative canonical material proved the prepared-Markdown → Vivliostyle route with long prose, headings, authored notes, YAML frontmatter, SVG, Mermaid and cross-document links.

Verified:

- [x] exact direct versions pinned: `@vivliostyle/cli` 11.3.3 and `@mermaid-js/mermaid-cli` 11.17.0;
- [x] preparation is disposable and canonical source hashes remain unchanged;
- [x] Mermaid becomes derived SVG;
- [x] YAML frontmatter remains metadata rather than visible prose;
- [x] internal publication links become `.html` destinations that resolve inside the PDF;
- [x] excluded canonical Markdown links become stable live-site URLs;
- [x] authored SVG figures survive;
- [x] VFM synthetic image captions are hidden because HSA already authors captions separately;
- [x] all existing compiler tests remain green;
- [x] final 30-page smoke artifact visually inspected.

G1 findings retained as constraints:

- the canonical Pattern index contains Vue/VitePress logic and therefore requires a deterministic print adapter;
- Part I currently uses authored numbered Notes, not Markdown footnotes;
- GitHub Ubuntu requires a CI-only `--no-sandbox` Puppeteer config for Mermaid rendering;
- Poppler reports long named-destination warnings on Vivliostyle PDFs; links/rendering work, but preflight must revisit this in G3/G5;
- direct publication versions are pinned but the repository still needs a committed dependency lock before final CI/merge.

## G2 — full mechanical Working Edition — PASS

**Purpose:** compile the current publication architecture without redesigning it or laundering supporting material into the book.

The publication-scope decisions are recorded in [`print-publication-scope-crosswalk.md`](print-publication-scope-crosswalk.md).

Implemented and verified:

- [x] full mechanical manifest: **44 entries**;
- [x] all manifest sources resolve and are unique;
- [x] Parts III and IV retain their canonical owners rather than copied manuscript duplicates;
- [x] Pattern index Vue content is converted deterministically from canonical pattern frontmatter;
- [x] Part I composes the canonical Governing Principles and developed Principle 8 material at the intended position;
- [x] Part II composes `Maintenance Geography — The Exterior` inside Chapter 8 before Chapter 9;
- [x] print-only wrappers expose **Part III — Pattern Language** and **Part IV — The Reference House** without editing canonical source;
- [x] 21 active patterns appear in the publication architecture's editorial order;
- [x] three strategies and four held candidates remain explicitly distinct from canonical patterns;
- [x] research, development history, computational work, reading-guide material and status/admin pages remain outside the primary monograph unless editorial authority says otherwise;
- [x] all local repository links that are not internal publication destinations are rewritten to stable live-site URLs, including linked SVG/source assets;
- [x] prepared output asserts against residual local repository links;
- [x] full Working Edition builds in GitHub Actions together with the G1 smoke build and all existing tests;
- [x] final G2 artifact: **193 A4 pages**;
- [x] PDF outline inspected: Parts I–V present in correct order;
- [x] PDF annotations inspected: **zero `localhost`, `file:`, runner-path or `.md` destinations**;
- [x] representative rendered-page review completed across front matter, Parts I–V, pattern language and Reference House.

### G2 interpretation

The 193-page artifact proves composition, ownership and renderer mechanics. It is **not** a designed book yet. The current generated contents, typography, margins, page starts and hierarchy are intentionally provisional and now become G3 work.

The exterior-maintenance insert is intentionally nested inside Chapter 8 rather than promoted to an independent numbered chapter. Its absence from the shallow generated contents is therefore not a missing-content defect; G3 will decide whether major inserts need a deeper/curated contents treatment.

## G3 — print semantics and typography — ACTIVE

**Purpose:** turn the mechanically correct Working Edition into a durable reading object.

Baseline requirements:

- A4 portrait, designed for ordinary UK duplex printing;
- facing-page / binding-aware geometry;
- serif body with restrained sans headings, continuous with but not imitative of the site;
- roughly 65–75 characters per line;
- major Parts begin on recto pages where proportionate;
- proper title/edition page rather than using the contents page as the de facto cover;
- generated contents designed as publication furniture rather than raw renderer output;
- running heads and outer page numbers;
- no running furniture on title/major opening pages;
- robust widows/orphans and heading/figure/table break rules;
- vector figures retained where source permits;
- black-and-white-safe semantics;
- sensible tables, code, blockquotes and evidence metadata;
- landscape/wide-page exceptions only for genuinely unreadable technical material;
- no information conveyed by colour alone.

Acceptance:

- [ ] title page + Working Edition date/revision metadata;
- [ ] publication-quality contents;
- [ ] stable facing-page margins, page numbering and running heads;
- [ ] deliberate Part/chapter opening hierarchy;
- [ ] body measure and leading reviewed on representative prose-heavy pages;
- [ ] pattern pages retain useful density without looking like website documentation;
- [ ] figures/tables/code survive pagination without pathological breaks;
- [ ] representative duplex print review;
- [ ] grayscale review;
- [ ] PDF preflight completed, including re-check of Vivliostyle named-destination warnings.

## G4 — whole-book editorial proof

Use the printed object to expose duplicated argument, late definitions, web-only context, weak transitions, catalogue fatigue, missing publication-facing Reference House material, badly sequenced figures and online-only material leaking into the book.

Editorial findings modify canonical source. Do not hide them with print-engine hacks.

Acceptance:

- [ ] end-to-end print/preview read completed;
- [ ] structural findings resolved or explicitly deferred;
- [ ] manifest still matches editorial authority afterward.

## G5 — CI and website delivery

- [ ] deterministic package lock committed;
- [ ] CI uses the same local commands, preferably `npm ci` once locked;
- [ ] full publication build integrated with durable Pages workflow;
- [ ] PDF and VitePress site use the same checkout/commit;
- [ ] PDF copied to `.vitepress/dist/house-systems-architecture.pdf` before Pages artifact upload;
- [ ] Pages build fails when publication build fails;
- [ ] temporary implementation-branch workflow removed/folded into durable CI;
- [ ] appropriate high-level **Download PDF** link added;
- [ ] live deployed PDF inspected;
- [ ] build/recovery instructions complete.

## G6 — merge and closeout

- [ ] branch diff reviewed for accidental authority/content changes;
- [ ] publication dependencies/tool assumptions rechecked against upstream documentation;
- [ ] PR CI green;
- [ ] this record reduced to final architecture + maintenance instructions;
- [ ] merged to `main`;
- [ ] live Pages site and PDF verified from merged commit.

## Resilience rules

- Pin direct tools now; commit full dependency closure before merge.
- Prefer deterministic local scripts over CI-only implementations.
- CI must call the same commands used locally.
- Generated state is disposable.
- Missing sources, duplicates, unsupported dynamic constructs, failed Mermaid rendering, residual local repository links and failed PDF production are hard errors.
- End every gate with a coherent Git checkpoint and update this record before advancing.
- Keep print directives in manifest/adapters/theme/preparation rather than contaminating canonical Markdown.
- Never infer editorial order from filenames or website navigation.
- Web and print remain sibling renderers over common source.
- Renderer workarounds must be isolated, documented and incapable of redefining publication content.

## Current next action

**Begin G3 with a print-system design pass before styling individual pages.**

First inspect the existing site typography/visual tokens and representative G2 page classes, then establish the page grid, type scale, opening-page hierarchy, contents strategy, running furniture and figure/table rules in `publication/theme.css`. Validate on a small representative page set before applying judgement to the entire 193-page artifact. Do not touch Pages deployment or perform whole-book editorial rewriting yet.
