# Print publication pipeline — implementation record

**Status:** active implementation — **G0/G1/G2/G3 PASS; G4 active**  
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
  vivliostyle.config.js   # renderer configuration + title/contents wiring
  theme.css               # publication-grade A4 duplex print system
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

The 193-page artifact proved composition, ownership and renderer mechanics. It was not yet a designed book; G3 deliberately handled physical publication semantics separately.

The exterior-maintenance insert is intentionally nested inside Chapter 8 rather than promoted to an independent numbered chapter. Its absence from the shallow generated contents is therefore not a missing-content defect.

## G3 — print semantics and typography — PASS

**Purpose:** turn the mechanically correct Working Edition into a durable reading object without redesigning canonical prose.

Implemented and verified:

- [x] A4 portrait, ordinary UK duplex-print target;
- [x] binding-aware facing margins: larger inner than outer margin;
- [x] restrained serif body / sans heading system continuous with, but not copied from, the website;
- [x] body measure held around the intended 65–75-character range;
- [x] dedicated title/edition page with build date, short Git revision and canonical site address;
- [x] publication contents reduced from raw docs-tree depth to a controlled two-page book hierarchy;
- [x] Preface and Parts I–V begin recto, with automatic blank versos where required;
- [x] title, contents, blank pages and major entry openings suppress inappropriate running furniture;
- [x] facing-page running heads and outer folios are stable;
- [x] widows/orphans, heading breaks, figures, code blocks and tables have explicit print rules;
- [x] figures remain vector where the source permits and synthetic VFM captions remain suppressed;
- [x] tables remain legible on dense Reference House pages without forcing a landscape system prematurely;
- [x] grayscale contact-sheet review completed; hierarchy and diagrams remain intelligible without colour;
- [x] representative Poppler/PDFium renderer comparison completed with no material structural disagreement;
- [x] final artifact preflight: **213 A4 pages**, openable, unencrypted, no XFA/forms/attachments, all fonts embedded/subset;
- [x] final user-facing URI sanity check remains free of filesystem/runner/`localhost`/raw `.md` destinations;
- [x] final Actions run `37930228403` passed repository tests, smoke build and full Working Edition build from commit `4ac561a`;
- [x] final TOC artifact review confirmed removal of Vivliostyle's otherwise redundant non-linked publication-title row.

### G3 findings retained as constraints

1. **Use CSS paged-media rules for article parity, not Vivliostyle cover/TOC metadata.**  
   Initial `pageBreakBefore` / `pageCounterReset` assumptions were invalid for ordinary publication entries and were removed rather than left as dead configuration.

2. **Contents must be curated as book furniture.**  
   A raw multi-document outline produced a website-like contents section. The current CSS deliberately exposes chapter depth for the composite manuscript Parts and publication-entry depth elsewhere.

3. **Legacy manuscript container titles are print-only composition concerns.**  
   `The Long-Life House` remains canonical source history but is suppressed by deterministic Part adapters so it does not compete with the actual publication title.

4. **Vivliostyle's long named destinations remain a known non-blocking parser warning.**  
   Poppler emits `name token is longer than what the specification says it can be`; links resolve, both tested renderers agree on representative pages, the file is openable and fonts are embedded. Do not hide the warning. Recheck after material Vivliostyle upgrades and again during G5 live-artifact verification.

5. **213 pages is a Working Edition consequence, not a target.**  
   G4 may shorten or restructure the book when editorial proof identifies duplicated argument, administrative residue or material that belongs online rather than in the linear publication.

## G4 — whole-book editorial proof — ACTIVE

Use the printed object to expose duplicated argument, late definitions, web-only context, weak transitions, catalogue fatigue, missing publication-facing Reference House material, badly sequenced figures and online-only material leaking into the book.

Editorial findings modify canonical source when the problem belongs to canonical prose. Print-only title/hierarchy composition may still be corrected in deterministic adapters. Do not hide manuscript weaknesses with CSS.

Acceptance:

- [ ] end-to-end print/preview read completed;
- [ ] publication-architecture/front-matter promises checked against what the Working Edition actually contains;
- [ ] web/repository-only residue identified and removed or explicitly justified;
- [ ] Part III assessed for development-history leakage and catalogue fatigue;
- [ ] Part IV assessed against the intended six-chapter Reference House publication structure;
- [ ] transitions between Parts assessed as a linear argument rather than website navigation;
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

**G4: begin with a durable editorial-proof ledger before changing canonical manuscript prose.**

Read the 213-page Working Edition linearly in Part-sized passes. Record each finding as one of: `fix now`, `defer because source is intentionally incomplete`, or `keep`. First audit the promised front matter, Part III development/provenance residue and Part IV against the publication architecture. Make canonical edits only after the finding is recorded, then rebuild the PDF after coherent batches rather than after every sentence.
