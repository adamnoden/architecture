# Print publication pipeline — implementation record

**Status:** active implementation  
**Branch:** `print-publication-pipeline`  
**Started:** 2026-10-09  
**Editorial authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)

This file is the durable control record for turning the House Systems Architecture publication into a first-class printable PDF. It exists so the work can resume safely after chat loss, interrupted sessions, CI failures or partial implementation. Update it before advancing a gate.

## Objective

Produce a continuously buildable **House Systems Architecture — Working Edition** PDF from the same canonical Markdown and figure sources used by the repository and documentation site.

The PDF is the linear publication, not a dump of the website or repository. Website navigation remains governed by `.vitepress/navigation.ts`; publication order remains governed editorially by `docs/manuscript/publication-architecture.md`.

The intended division is:

- **website:** navigation, exploration, audit, provenance and live project state;
- **PDF:** sustained linear reading of the architectural publication;
- **repository:** source ownership, history, development records and executable work.

## Locked implementation decisions

1. **Canonical content stays in the existing Markdown/SVG/Mermaid sources.** No duplicate manuscript tree is introduced.
2. **VitePress remains the web renderer.** The PDF does not scrape or print the rendered website.
3. **Vivliostyle CLI is the print renderer.** It consumes prepared Markdown directly and supplies paged-media layout, multi-document publication, contents, recto/verso control, running furniture and PDF output.
4. **The build remains Node-based.** Avoid a second publishing language/toolchain unless a demonstrated blocker requires it.
5. **Mermaid fenced source remains canonical.** The print preparation step generates temporary SVG derivatives; generated SVGs are not hand-maintained or promoted to source authority.
6. **A small TypeScript publication manifest is the mechanical compilation order.** It does not duplicate the explanatory content of `publication-architecture.md`.
7. **A4 portrait, duplex-first, black-and-white-safe** is the baseline physical target. Wide pages may later be used only where evidence shows they materially improve a figure/table.
8. **The current PDF is always a Working Edition.** Named immutable editions may later be produced from tags/releases, but are not part of the first implementation.
9. **The PDF build and website build must eventually derive from the same commit and deploy together.** The stable public PDF path should be `/architecture/house-systems-architecture.pdf`.
10. **No stage may silently redefine publication scope.** If the source corpus exposes an editorial ambiguity, record it here and resolve it against the publication architecture before widening the build.

## Non-goals

The first implementation does not:

- print every page in `docs/`;
- promote research, development history, project status, computational work or delivery material into the monograph merely because they exist in the repository;
- redesign the manuscript while solving build mechanics;
- produce a coffee-table-book layout;
- depend on JavaScript execution inside the final publication for semantic content;
- commit generated PDFs or generated Mermaid SVGs as canonical sources;
- establish version-numbering/release policy beyond the Working Edition.

## Recovery protocol

When resuming this work after an interruption:

1. Read this file first.
2. Read `docs/manuscript/publication-architecture.md` before changing publication scope.
3. Inspect the current head of `print-publication-pipeline` and the latest commits.
4. Start at the first gate below that is not marked **PASS**.
5. Re-run that gate's verification before assuming previous transient results still hold.
6. Do not widen the manuscript set, modify CI or merge to `main` while an earlier gate is unresolved.
7. Record any new blocker, decision or deliberate deviation in this file before proceeding.

A partially generated workspace or PDF is always disposable. Canonical state must be reconstructible from Git-tracked source plus pinned dependencies.

## File architecture

Target structure:

```text
publication/
  publication.ts          # mechanical reading order + per-entry print metadata
  vivliostyle.config.ts   # print build configuration
  theme.css               # book typography / paged-media rules
  frontmatter/            # print-only generated/static front matter where justified
  scripts/
    prepare.ts             # validates/copies sources and derives print assets
    validate.ts            # manifest/source invariants
  .work/                   # generated, ignored
  dist/                    # generated, ignored except when copied into Pages output
```

Names may change if Vivliostyle's actual runtime contract makes a simpler structure preferable. The architectural roles above should remain stable.

## Publication-source rule

The manifest should contain only enough information to compile the book, for example:

```ts
{
  source: 'docs/manuscript/part-i.md',
  title: 'Part I — The Proposition',
  kind: 'part',
  pageBreakBefore: 'recto'
}
```

It must not become another prose outline of the book.

Likely exclusions from the primary PDF include:

- root `README.md`;
- `docs/reading-guide.md`;
- `docs/manuscript/publication-architecture.md`;
- `STATUS.md`;
- development/history/provenance records except material deliberately incorporated by the publication architecture;
- the computational track as a standalone manuscript part;
- the separate architect-facing implementation brief.

## Gate plan

### G0 — durable control and branch isolation

**Purpose:** make the work recoverable before experimentation.

Acceptance:

- [x] dedicated branch exists;
- [x] this implementation record exists;
- [ ] draft PR exists so branch purpose and current state remain visible from GitHub UI.

**Status:** IN PROGRESS

### G1 — renderer compatibility vertical slice

**Purpose:** prove that representative canonical sources survive a direct Markdown → Vivliostyle path before designing the book.

Representative material must cover:

- long-form manuscript prose and heading hierarchy;
- frontmatter-bearing canonical pattern source;
- internal relative links;
- footnotes/references where present;
- ordinary SVG/image assets;
- Mermaid fenced diagrams converted to derived SVG;
- multi-document publication order.

Initial candidate slice:

1. `docs/manuscript/preface.md`
2. `docs/manuscript/part-i.md`
3. `docs/patterns/controlled-utility-entry.md`
4. one source containing Mermaid and/or an owned SVG figure (select by inspection rather than fabricating test content)

Acceptance:

- [ ] dependencies pinned locally;
- [ ] `npm run publication:validate` succeeds;
- [ ] `npm run publication:prepare` creates a disposable workspace from canonical sources;
- [ ] Mermaid fences in the slice become readable SVG references without changing source files;
- [ ] Vivliostyle builds one A4 PDF from the prepared slice;
- [ ] internal links do not point at local filesystem/repository garbage;
- [ ] source frontmatter does not leak as visible prose;
- [ ] no canonical source file is rewritten by the pipeline;
- [ ] generated workspace is ignored by Git.

**Status:** NOT STARTED

### G2 — full mechanical publication manifest

**Purpose:** encode the current publication architecture as a minimal compile order without redesigning it.

Acceptance:

- [ ] all entries resolve to canonical source files;
- [ ] no source is duplicated unintentionally;
- [ ] historical/provenance material is excluded unless explicitly justified;
- [ ] Parts III and IV use their canonical owners rather than copied manuscript duplicates;
- [ ] an exclusion/scope review against `publication-architecture.md` is recorded;
- [ ] full unstyled or minimally styled PDF builds successfully.

**Status:** NOT STARTED

### G3 — print semantics and typography

**Purpose:** turn a mechanically correct PDF into a durable reading object.

Baseline:

- A4 portrait;
- duplex/facing pages;
- serif body / restrained sans heading system continuous with the site without imitating it;
- approximately 65–75 characters per line;
- generous inside/outside margins appropriate to binding/stapling;
- recto starts for major Parts where proportionate;
- running heads and outer page numbers;
- no running furniture on title/major opening pages;
- robust widows/orphans/page-break rules;
- vector figures where source permits;
- black-and-white-safe semantics;
- sensible table and code treatment.

Acceptance:

- [ ] title page + Working Edition metadata;
- [ ] generated contents;
- [ ] page numbering and running heads stable;
- [ ] major headings and figures do not produce pathological breaks;
- [ ] representative duplex print review completed;
- [ ] grayscale review completed.

**Status:** NOT STARTED

### G4 — whole-book editorial proof

**Purpose:** use print as a test of the manuscript rather than hiding structural problems with navigation.

Review for:

- duplicated argument;
- definitions arriving too late;
- chapters that depend on web-only context;
- weak transitions between Parts;
- pattern-language catalogue fatigue;
- missing publication-facing Reference House material;
- figures introduced too early/late;
- references that make sense online but fail linearly;
- material that belongs online but has leaked into the book.

Editorial changes belong in canonical source files and should be tracked separately from print-engine hacks.

Acceptance:

- [ ] end-to-end printed/print-preview read completed;
- [ ] structural findings resolved or explicitly deferred;
- [ ] publication manifest still matches editorial authority after changes.

**Status:** NOT STARTED

### G5 — CI and website delivery

**Purpose:** make PDF generation ordinary and self-maintaining.

Acceptance:

- [ ] existing tests still pass;
- [ ] publication validation/build runs in GitHub Actions;
- [ ] VitePress build and PDF build use the same checkout/commit;
- [ ] PDF copied into `.vitepress/dist/house-systems-architecture.pdf` before Pages artifact upload;
- [ ] build fails if publication compilation fails;
- [ ] stable website download link added in an appropriate high-level location;
- [ ] live deployed PDF inspected;
- [ ] build/recovery instructions documented.

**Status:** NOT STARTED

### G6 — merge and closeout

Acceptance:

- [ ] branch diff reviewed for accidental content/authority changes;
- [ ] dependency/tool choices rechecked against current upstream documentation;
- [ ] PR CI passes;
- [ ] implementation record updated with final architecture and maintenance rule;
- [ ] merged to `main`;
- [ ] live Pages site and PDF verified from merged commit.

**Status:** NOT STARTED

## Resilience rules

- **Pin publication dependencies** in `package.json`/lockfile; do not depend on globally installed CLIs or `latest` during normal builds.
- **Prefer deterministic local scripts** over shell pipelines embedded only in CI.
- **CI calls the same npm commands used locally.** It must not contain a separate hidden implementation.
- **Generated state is disposable.** `publication/.work`, generated Mermaid SVGs and built PDFs must be reproducible.
- **Fail loudly on ambiguity.** Missing manifest sources, duplicate entries, failed Mermaid rendering or failed PDF production are build errors.
- **Keep changes incremental.** A gate should end in a coherent commit and update this record before the next gate begins.
- **Avoid tool lock-in in content.** Publication-specific directives should stay in the manifest/theme wherever possible rather than contaminating canonical Markdown.
- **Do not parse prose to infer editorial order.** Mechanical order is explicit in the manifest; editorial meaning remains in the publication architecture.
- **Do not make the website a build dependency for print.** Web and print are sibling renderers over common source.

## Verified upstream assumptions — 2026-10-09

Before implementation, official/current upstream documentation was checked for these assumptions:

- Vivliostyle CLI can build Markdown directly to PDF, supports multi-entry configuration, A4 sizing, themes/CSS, generated contents and per-entry page-break control.
- `@vivliostyle/cli` can be installed locally and configured via JS/TS-compatible module configuration.
- Mermaid CLI supports transforming Markdown containing Mermaid fences into Markdown that references generated SVG files.

Recheck these if dependency versions or APIs materially change.

## Current next action

**Complete G0, then begin G1 only.**

Create the draft PR, inspect representative assets/links/footnotes, pin the minimum publication dependencies, and establish the smallest build that produces a disposable vertical-slice PDF. Do not add full book scope or polished typography until G1 passes.
