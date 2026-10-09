# Print publication pipeline — implementation record

**Status:** active implementation — **G1 passed; G2 next**  
**Branch:** `print-publication-pipeline`  
**Draft PR:** #26 — *Build first-class print publication pipeline*  
**Started:** 2026-10-09  
**Editorial authority:** [`../manuscript/publication-architecture.md`](../manuscript/publication-architecture.md)

This is the durable control record for turning House Systems Architecture into a first-class printable publication. It is intentionally sufficient to resume work after chat loss, interrupted sessions, CI failures or partial implementation. Update this file before advancing a gate.

## Objective

Produce a continuously buildable **House Systems Architecture — Working Edition** PDF from the same canonical Markdown, SVG and Mermaid sources used by the repository and documentation site.

The PDF is the linear publication, not a dump of the website or repository.

- **website:** navigation, exploration, audit, provenance and live project state;
- **PDF:** sustained linear reading of the architectural publication;
- **repository:** source ownership, history, development records and executable work.

Website navigation remains governed by `.vitepress/navigation.ts`. Publication meaning and scope remain governed by `docs/manuscript/publication-architecture.md`.

## Locked implementation decisions

1. Canonical content stays in the existing Markdown/SVG/Mermaid sources. No duplicate manuscript tree.
2. VitePress remains the web renderer. Print does not scrape or browser-print the site.
3. Vivliostyle CLI is the print renderer over prepared Markdown.
4. The build remains Node-based unless a demonstrated blocker requires otherwise.
5. Mermaid fenced source remains canonical; print SVGs are disposable derivatives.
6. A small TypeScript manifest owns only mechanical compile order and print metadata. It must not become a second editorial outline.
7. Baseline physical target is A4 portrait, duplex/facing-page aware and black-and-white safe.
8. The rolling PDF is a **Working Edition**. Immutable named editions can later be cut from tags/releases.
9. Website and PDF must ultimately build from the same commit and deploy together.
10. Stable public target path is `/architecture/house-systems-architecture.pdf`.
11. No build stage may silently redefine publication scope. Editorial ambiguity is resolved against the publication architecture before implementation widens.

## Non-goals

The first implementation does not:

- print every page in `docs/`;
- promote research, development history, status, computational work or delivery material into the monograph merely because it exists;
- redesign the manuscript while solving renderer mechanics;
- produce a coffee-table-book layout;
- depend on client-side JavaScript for semantic publication content;
- commit generated Mermaid SVGs or generated PDFs as canonical source;
- establish final release/versioning policy.

## Recovery protocol

When resuming after any interruption:

1. Read this file first.
2. Read `docs/manuscript/publication-architecture.md` before changing publication scope.
3. Inspect branch `print-publication-pipeline`, draft PR #26 and the latest commits/checks.
4. Start at the first gate below that is not **PASS**.
5. Re-run that gate's verification before trusting transient prior results.
6. Do not merge to `main` while an earlier gate is unresolved.
7. Record new blockers, decisions or deliberate deviations here before moving on.

Generated workspaces and PDFs are disposable. Canonical state must be reconstructible from Git-tracked source plus declared dependencies.

## Implemented file architecture

```text
publication/
  publication.ts          # current mechanical manifest; G1 slice today
  vivliostyle.config.js   # Vivliostyle build configuration
  theme.css               # print rules; deliberately minimal until G3
  puppeteer.ci.json       # CI-only Mermaid browser compatibility
  scripts/
    prepare.ts             # disposable source prep, links, Mermaid derivation
    validate.ts            # source/manifest invariants
  .work/                   # generated, ignored
  dist/                    # generated, ignored
```

The existing G1 manifest is explicitly a compatibility slice, not the full book manifest.

## Publication-source rule

The eventual manifest may say only what is mechanically necessary, for example:

```ts
{
  source: 'docs/manuscript/part-i.md',
  title: 'Part I — The Proposition',
  kind: 'part'
}
```

Descriptions of what a chapter means belong in `publication-architecture.md`, not in build configuration.

Known primary-PDF exclusions include root `README.md`, `docs/reading-guide.md`, `docs/manuscript/publication-architecture.md`, `STATUS.md`, development/history records, the computational track as a standalone manuscript part and the separate architect-facing implementation brief unless the publication architecture later says otherwise.

# Gate record

## G0 — durable control and branch isolation — PASS

**Purpose:** make the work recoverable before experimentation.

- [x] dedicated `print-publication-pipeline` branch;
- [x] durable implementation/recovery record;
- [x] draft PR #26 exposing branch purpose and state in GitHub.

## G1 — renderer compatibility vertical slice — PASS

**Purpose:** prove representative canonical sources survive the direct prepared-Markdown → Vivliostyle path before designing the book.

### Slice exercised

- `docs/manuscript/preface.md` — long-form prose;
- `docs/manuscript/part-i.md` — long chapter hierarchy, notes and links;
- `docs/manuscript/governing-principles.md` — cross-document internal links;
- `docs/manuscript/principle-08-repose.md` — owned SVG figure + authored caption;
- `docs/patterns/controlled-utility-entry.md` — YAML frontmatter + canonical pattern links;
- root `README.md` — **smoke-only** Mermaid fixture; it is not thereby admitted to the book.

### Acceptance

- [x] publication tool versions exact-pinned in `package.json` (`@vivliostyle/cli` 11.3.3; `@mermaid-js/mermaid-cli` 11.17.0);
- [x] `npm run publication:validate` succeeds in CI;
- [x] preparation creates only a disposable ignored workspace;
- [x] Mermaid fences become derived SVG without rewriting canonical source;
- [x] Vivliostyle builds one non-empty A4 PDF;
- [x] selected canonical files are hash-checked before/after preparation;
- [x] YAML frontmatter does not leak into visible publication prose;
- [x] included Markdown cross-links become internal PDF destinations rather than `*.md` browser URLs;
- [x] links to repository material excluded from the slice become stable live-site URLs;
- [x] ordinary owned SVG figures render;
- [x] derived Mermaid SVG renders;
- [x] VFM's synthetic image captions are suppressed while source alt text is retained;
- [x] existing compiler tests still pass (P0 17/17; PAT-XW-01 6/6);
- [x] final smoke PDF visually inspected after rendering to images.

### G1 execution findings

**1. The Pattern index needs an explicit print adapter in G2.**  
`docs/patterns/README.md` contains VitePress/Vue-generated material (`<script setup>`, directives/template interpolation). Direct Markdown publication would silently lose content. Validation now treats raw Vue constructs as an error for selected publication sources. G2 must define the static publication representation deliberately rather than strip template code.

**2. Part I currently uses authored numbered Notes rather than Markdown footnotes.**  
No footnote transformation is required to preserve the current source semantics.

**3. Cross-document publication links require `.html` preparation.**  
Leaving canonical `.md` links intact caused Vivliostyle to encode local `localhost/.../*.md` destinations. The preparation step now converts links to included publication entries into relative `.html` targets. Links to excluded canonical documents become `https://adamnoden.github.io/architecture/...` URLs. The prepared slice asserts that no local Markdown links remain.

**4. VFM treats image alt text as a visible `figcaption`.**  
HSA sources already author publication captions separately. Printing VFM's synthetic caption duplicated the existing SVG caption and printed Mermaid's generic `diagram` alt text. The print theme therefore hides generated `figure > figcaption` while preserving alt text on the image itself.

**5. GitHub-hosted Ubuntu 24.04 blocks Mermaid's Chromium sandbox.**  
Mermaid preparation uses a CI-only Puppeteer config containing `--no-sandbox`; normal local execution retains the ordinary sandboxed path. This is isolated to generated-diagram rendering rather than becoming a global browser setting.

**6. Vivliostyle generates very long named PDF destinations.**  
Poppler emits `name token is longer than what the specification says it can be` warnings when rasterising the smoke PDF. The document renders correctly and tested internal links resolve to the correct PDF pages. Treat this as a known non-blocking warning for now; re-evaluate during G3/G5 preflight rather than hiding it.

**7. Dependency closure is not yet lockfile-frozen.**  
The two publication tools are direct-version pinned, which is sufficient for the G1 compatibility result, but the repository still has no committed `package-lock.json`. A deterministic dependency closure is required before final CI/merge in G5/G6; after it exists, normal CI should prefer `npm ci`.

### Final G1 verification

The final compatibility artifact is a 30-page smoke PDF. Render review confirmed:

- no duplicate synthetic caption on the Principle 8 SVG;
- explicit authored Figure 8.1 caption remains;
- Mermaid diagram visible with no printed `diagram` caption;
- pattern YAML metadata absent from visible text;
- internal destinations resolve inside the PDF;
- excluded-document links resolve to the live documentation site.

G1 is closed. Do not broaden G1 fixtures unless a later regression requires it.

## G2 — full mechanical publication manifest — NEXT

**Purpose:** encode the current publication architecture as a minimal compile order without redesigning it.

Required work:

1. perform an explicit publication-scope crosswalk against `docs/manuscript/publication-architecture.md`;
2. classify each source as direct publication entry, publication insert/owned material, adapted index, or excluded supporting material;
3. resolve dynamic publication-facing pages, beginning with `docs/patterns/README.md`, through deterministic static print adapters rather than copied prose;
4. preserve Part III and Part IV canonical ownership rather than duplicating them under `manuscript/`;
5. validate that all manifest entries exist, are unique and are compatible or explicitly adapted;
6. build the entire book with only minimal compatibility styling;
7. inspect the full output for missing content, broken assets/links and renderer pathologies.

Acceptance:

- [ ] scope/exclusion crosswalk recorded;
- [ ] full mechanical manifest exists;
- [ ] all entries resolve to canonical source or deterministic adapter;
- [ ] no unintended duplicates;
- [ ] historical/provenance material excluded unless explicitly justified;
- [ ] Parts III/IV retain canonical owners;
- [ ] dynamic source adaptations are explicit and reproducible;
- [ ] full minimally styled PDF builds successfully;
- [ ] full-output structural/visual smoke review completed.

## G3 — print semantics and typography

**Purpose:** turn the mechanically correct publication into a durable reading object.

Baseline:

- A4 portrait;
- duplex/facing pages;
- serif body with restrained sans headings, continuous with but not imitative of the site;
- roughly 65–75 characters per line;
- binding-aware inside/outside margins;
- recto starts for major Parts where proportionate;
- running heads and outer page numbers;
- no running furniture on title/major opening pages;
- robust widows/orphans/page-break rules;
- vector figures where source permits;
- black-and-white-safe semantics;
- sensible tables/code treatment;
- deliberate landscape/wide-page exception only when a real figure warrants it.

Acceptance:

- [ ] title page + Working Edition metadata;
- [ ] generated contents;
- [ ] page numbering/running heads stable;
- [ ] no pathological heading/figure/table breaks;
- [ ] representative duplex print review;
- [ ] grayscale review;
- [ ] PDF preflight, including re-check of long named-destination warnings.

## G4 — whole-book editorial proof

**Purpose:** use print as a test of the manuscript rather than hiding structural problems behind web navigation.

Review for duplicated argument, late definitions, web-only context, weak transitions, catalogue fatigue in Part III, missing publication-facing Reference House material, badly sequenced figures, print-hostile references and online-only material leaking into the book.

Editorial findings must change canonical source, not be patched in the print renderer.

Acceptance:

- [ ] end-to-end printed/print-preview read completed;
- [ ] structural findings resolved or explicitly deferred;
- [ ] publication manifest still matches editorial authority afterward.

## G5 — CI and website delivery

**Purpose:** make publication generation ordinary and self-maintaining.

Acceptance:

- [ ] deterministic package lock committed;
- [ ] CI uses the same npm commands as local development, preferably `npm ci` once locked;
- [ ] existing tests still pass;
- [ ] full publication validation/build runs in Actions;
- [ ] VitePress + PDF use the same checkout/commit;
- [ ] PDF copied to `.vitepress/dist/house-systems-architecture.pdf` before Pages artifact upload;
- [ ] build fails if publication compilation fails;
- [ ] temporary branch-only smoke workflow is removed or folded into durable CI;
- [ ] appropriate high-level website PDF link added;
- [ ] live deployed PDF inspected;
- [ ] recovery/build instructions complete.

## G6 — merge and closeout

Acceptance:

- [ ] branch diff reviewed for accidental content/authority changes;
- [ ] dependency/tool assumptions rechecked against upstream documentation;
- [ ] PR CI passes;
- [ ] this record updated with final architecture and maintenance rule;
- [ ] merged to `main`;
- [ ] live Pages site and PDF verified from merged commit.

# Resilience rules

- Pin direct tool versions and commit a dependency lock before merge.
- Prefer deterministic local scripts over CI-only shell implementations.
- CI calls the same npm commands used locally.
- Generated state is disposable and reconstructible.
- Missing sources, duplicate entries, unsupported dynamic constructs, failed Mermaid rendering, residual local Markdown links or failed PDF production are build errors.
- End each gate with a coherent commit and an updated version of this record.
- Keep publication-specific directives in the manifest/theme/preparation layer wherever possible rather than contaminating canonical Markdown.
- Never infer editorial order by parsing prose; the mechanical order is explicit and the editorial meaning stays in `publication-architecture.md`.
- Print and web remain sibling renderers over common source; the website is not a print build dependency.
- A renderer workaround is permitted only when isolated, documented and unable to redefine publication content.

## Verified upstream assumptions — 2026-10-09

At implementation start, current upstream documentation was checked for these assumptions:

- Vivliostyle CLI can build Markdown directly to PDF and supports multi-entry configuration, A4 sizing, CSS themes, generated contents and paged-media controls.
- `@vivliostyle/cli` can be installed locally and configured from a JavaScript module.
- Mermaid CLI can transform Markdown Mermaid fences into Markdown referring to generated SVG files.
- Mermaid/Puppeteer supports an explicit browser config for the Linux sandbox compatibility case used by CI.

Recheck these when dependency versions materially change.

## Current next action

**Begin G2 only.**

First produce the publication-scope crosswalk against `docs/manuscript/publication-architecture.md`, then design the smallest deterministic adapter for dynamic publication-facing indexes—especially the canonical Pattern Language index. Do **not** start polished typography, Pages deployment or whole-book editorial rewriting until the full mechanical publication builds.
