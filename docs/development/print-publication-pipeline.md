# Print publication pipeline — implementation record

**Status:** active implementation — **G0/G1/G2/G3/G4 PASS; G5 next**  
**Branch:** `print-publication-pipeline`  
**Draft PR:** #26 — *Build first-class print publication pipeline*  
**Started:** 2026-10-09  
**Editorial authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)  
**Scope crosswalk:** [`print-publication-scope-crosswalk.md`](print-publication-scope-crosswalk.md)  
**Editorial proof:** [`print-publication-editorial-proof.md`](print-publication-editorial-proof.md)

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
  publication.ts          # 45-entry Working Edition manifest + G1 smoke slice
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

The Working Edition includes the authored `docs/manuscript/readers-guide.md` front matter added during G4.

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

- [x] full mechanical manifest established and validated;
- [x] all manifest sources resolve and are unique;
- [x] Parts III and IV retain their canonical owners rather than copied manuscript duplicates;
- [x] Pattern index Vue content is converted deterministically from canonical pattern frontmatter;
- [x] Part I composes the canonical Governing Principles and developed Principle 8 material at the intended position;
- [x] Part II composes `Maintenance Geography — The Exterior` inside Chapter 8 before Chapter 9;
- [x] print-only wrappers expose **Part III — Pattern Language** and **Part IV — The Reference House** without duplicating source documents;
- [x] 21 active patterns appear in the publication architecture's editorial order;
- [x] three strategies and four held candidates remain explicitly distinct from canonical patterns;
- [x] research, development history and the computational track remain outside the monograph unless editorial authority says otherwise;
- [x] all local repository links that are not internal publication destinations are rewritten to stable live-site URLs, including linked SVG/source assets;
- [x] prepared output asserts against residual local repository links;
- [x] full Working Edition builds in GitHub Actions together with the G1 smoke build and all existing tests;
- [x] final G2 artifact: **193 A4 pages**;
- [x] PDF outline and representative pages inspected across Parts I–V;
- [x] user-facing annotations contained zero `localhost`, `file:`, runner-path or raw `.md` destinations.

The exterior-maintenance insert remains intentionally nested inside Chapter 8 rather than promoted to an independent numbered chapter.

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
- [x] final user-facing URI sanity check remained free of filesystem/runner/`localhost`/raw `.md` destinations;
- [x] final TOC artifact review confirmed removal of Vivliostyle's redundant non-linked publication-title row.

G3 constraints retained:

1. Use CSS paged-media rules for article parity, not cover/TOC metadata intended for other entry types.
2. Contents must be curated as book furniture rather than exposed as a raw multi-document outline.
3. Legacy manuscript container titles are composition concerns and must not compete with the publication title.
4. Vivliostyle's long named destinations remain a known non-blocking parser warning; recheck during G5 live-artifact verification.
5. Page count is an outcome, not a target.

## G4 — whole-book editorial proof — PASS

**Purpose:** use the print object to reveal problems the website can hide.

The durable finding-by-finding record is [`print-publication-editorial-proof.md`](print-publication-editorial-proof.md).

Implemented and verified:

- [x] title/front matter and publication-architecture promises reviewed;
- [x] authored a compact **Reader's Guide** containing abstract, reading model, definitions, evidence/maturity legend and governing constraints;
- [x] Preface → Parts I/II → Part V read as one argument and checked for accidental repetition;
- [x] duplicate Part-I implementation bridge removed during composition while preserving the canonical source documents;
- [x] legacy `The Long-Life House` self-reference removed from the Working Edition;
- [x] Part III assessed for catalogue fatigue, migration bureaucracy and evidence discipline;
- [x] stable IDs, evidence/maturity and `Does not prove` boundaries retained;
- [x] raw filenames, phase/gate language and migration bookkeeping removed from the primary print path;
- [x] Pattern index and Service Topology sequence cleaned of development-history tails;
- [x] Part IV assessed against the intended six-chapter Reference House publication architecture;
- [x] current strong Reference House material retained honestly rather than renamed into fictitiously mature chapters;
- [x] missing Site/type, water/environmental and future-maintenance publication chapters explicitly deferred to normal project development;
- [x] Reference House web-wayfinding and terminal `Related documents` residue removed canonically;
- [x] repetitive Reference House `Status:`/`Purpose:` document-control furniture suppressed in print;
- [x] internal computational-H1 comparator translated in print into its actual architectural **Service coherence test**;
- [x] Part transitions checked after the Reader's Guide established the deliberate mode changes between argument, reference, integration test and delivery;
- [x] final G4 artifact remains **213 A4 pages** and structurally sane;
- [x] final text scan returned zero raw `.md`, `Phase-*`, `Related documents`, `Start with`, `The Long-Life House`, duplicate implementation bridge, internal computational-H1 or `README.md` residue;
- [x] representative Reader's Guide, Part III, Part IV and Part V pages visually inspected after rebuild;
- [x] final PDF preflight: openable, unencrypted, no XFA/forms; known Vivliostyle named-destination warning unchanged;
- [x] all **344 user-facing annotations** checked: zero `localhost`, `file:`, runner-path or raw `.md` destinations;
- [x] repository tests, smoke PDF and full Working Edition build passed for the final publication content state.

The main deferred editorial work is now explicit rather than hidden: mature the Reference House into the six publication-facing chapters and later author the promised back matter. Those are normal HSA development tasks, not blockers for the print pipeline.

## G5 — CI and website delivery — NEXT

**Purpose:** make PDF generation an ordinary, deterministic part of the existing Pages deployment.

Acceptance:

- [ ] deterministic package lock committed;
- [ ] CI uses the same local commands, preferably `npm ci` once locked;
- [ ] existing compiler and publication validation tests still pass;
- [ ] full publication build integrated with the durable Pages workflow;
- [ ] PDF and VitePress site use the same checkout/commit;
- [ ] PDF copied to `.vitepress/dist/house-systems-architecture.pdf` before Pages artifact upload;
- [ ] Pages build fails when publication compilation fails;
- [ ] temporary implementation-branch workflow removed or folded into durable CI;
- [ ] appropriate high-level **Download PDF** link added to the site;
- [ ] live deployed PDF inspected;
- [ ] build/recovery instructions complete;
- [ ] named-destination warning rechecked on the actual deployed artifact.

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

**Begin G5 only.**

First inspect the existing `package.json`, dependency state and Pages workflow. Establish a deterministic lockfile and local/CI command contract before modifying deployment. Then integrate the full PDF build into the existing Pages workflow so VitePress and the Working Edition are produced from one checkout and one commit. Do not merge or alter the live site until the combined workflow has been proven safely on the implementation branch.
