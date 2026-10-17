<!-- nav-exclude: redirect -->
# DRW-01E — print-size doctrine proof and DRW-01 freeze

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-01E  
**Status:** DONE  
**Issue:** #154  
**Branch:** `drw-01e`  
**Proof head before this closeout:** `2bc84bcf26605522467383efbd7fd8c21f9cde3b`

## 1. Result

DRW-01 is complete.

The drawing doctrine frozen by DRW-01A through DRW-01D has survived an executable physical-size specimen at both the current A4 proof surface and a conservative ISO B5 robustness surface without requiring a graphic-token, notation, scale or page-grammar revision.

The governing conclusion is:

> **The frozen drawing grammar remains legible and compositionally coherent on a smaller-than-A4 portrait page without shrinking required annotation or making the binding carry unique meaning.**

This proof does not claim that ISO B5 is the final PR-02 trim, that the current specimen is a Reference House renderer, or that any synthetic specimen geometry is architectural source authority.

## 2. Executable proof artefact

The specimen lives under:

`publication/specimens/drw01e/`

It is deliberately independent of the Reference House source/renderer so DRW-01 can prove representation doctrine without manufacturing house geometry ahead of the vertical drawing slices.

Reproduce the proof with:

```sh
npm run drw:01e:proof
```

That command builds both physical surfaces through the repository's actual Vivliostyle stack and validates the resulting PDFs.

A targeted GitHub Actions workflow, `.github/workflows/drw-doctrine-proof.yml`, runs only when the specimen, its package inputs or that workflow change. DRW-01E therefore does not add two extra PDF builds to every unrelated pull request.

## 3. Seven-page proof sequence

Both A4 and B5 outputs contain exactly seven pages:

| Page | Class / role | Proof task |
|---:|---|---|
| 1 | `FLOW` | prose-led page with a small abstract non-scaled doctrine figure |
| 2 | `PLATE_PAIR` — left | complete synthetic ground plan at `1:100` |
| 3 | `PLATE_PAIR` — right | complete synthetic first-floor plan at `1:100` |
| 4 | `PLATE_SINGLE` | section / notation specimen exercising the DRW-01B/01C graphic grammar |
| 5 | intentional blank | forces the following spread to a physical verso-left / recto-right pair |
| 6 | `PLATE_SPREAD` — left | left deterministic crop of one logical spread composition |
| 7 | `PLATE_SPREAD` — right | right deterministic crop of the same logical spread composition |

The pair is two semantically complete drawings. The spread is one **256 mm** logical composition emitted as two deterministic **128 mm** crops. That distinction is therefore executable rather than merely described in DRW-01D.

## 4. Physical proof surfaces

### 4.1 A4 — current automated baseline

The A4 specimen is generated at **210 × 297 mm** using the current publication proof assumptions:

- top: 23 mm;
- bottom: 24 mm;
- inner: 30 mm;
- outer: 22 mm.

It is not a new final-book decision; it proves compatibility with the repository's current deterministic publication surface.

### 4.2 ISO B5 — conservative robustness surface

The second specimen is generated at **176 × 250 mm** ISO B5.

Its proof-only mirrored margins are:

- top/bottom: 18 mm;
- inner: 22 mm;
- outer: 16 mm.

This leaves a 138 mm nominal page content width. The controlled drawing frame remains **128 mm** wide, preserving approximately **5 mm on each side** rather than scaling the drawing down.

ISO B5 is intentionally used as a demanding smaller-than-A4 physical test in the already-authorised B5 territory. It is **not** selected here as the final PR-02 trim or production margin system.

## 5. Graphic-token proof

The synthetic plan/section specimens exercise the frozen DRW-01B/01C family in physical units:

- cut: **0.50 mm**;
- profile: **0.35 mm**;
- primary: **0.25 mm**;
- secondary: **0.18 mm**;
- hatch: secondary-weight 45° field;
- principal labels: **7.5 pt** role;
- notes/dimensions/levels: **6.5 pt** role;
- linear dimensions with architectural ticks;
- levels;
- graphic scale bars;
- controlled overhead/beyond geometry;
- explicitly provisional geometry using the short-dash uncertainty pattern plus `Approx.` text.

No B5-specific smaller annotation family exists. The SVG drawing widths and paper-space graphic roles remain physically fixed across A4 and B5.

The validator additionally compares extracted drawing-label font sizes for representative labels (`Kitchen`, `Bedroom`, `Approx.`) across the two generated PDFs and fails if B5 has silently reduced them.

## 6. Page-grammar proof

### `FLOW`

The first page remains prose-led and demonstrates that a small abstract figure can remain inline without claiming architectural scale or dedicated plate status.

### `PLATE_PAIR`

Pages 2–3 demonstrate two complete drawings at identical `1:100` scale, common 128 mm frame and comparable orientation. Each remains intelligible independently; the facing relationship adds comparison rather than repairing an incomplete drawing.

### `PLATE_SINGLE`

Page 4 demonstrates that the notation family and caption/scale ownership fit one portrait B5 proof page without reducing the frozen annotation minimum.

### `PLATE_SPREAD`

Pages 6–7 are generated from one master composition. A proof-only grey overlay visibly marks **12 mm on each side of the logical fold — 24 mm total**.

Only continuous/repetitive geometry crosses the marked band. Unique labels, dimension values, caption text and other semantic events remain outside it. The test therefore supports the DRW-01D `gutter.critical-exclusion` token as a conservative pre-production rule.

The token remains a semantic proof allowance, not an assertion that the eventual sewn binding physically obscures exactly 12 mm per leaf.

## 7. Publication-layer ownership proof

Dedicated plates keep:

- human plate title;
- visible numeric scale ratio;
- concise caption;
- folio;

outside the controlled drawing SVG.

The SVG retains:

- geometry;
- architectural labels;
- dimensions/levels;
- graphic scale bar;
- drawing-local notes/markers.

The specimen therefore confirms the page-versus-drawing ownership boundary frozen by DRW-01B/01D.

## 8. Black-only and diagnostic colour boundary

Required meaning is black-only.

The only grey in the specimen is proof diagnostics / subordinate proof context, notably the visible fold-exclusion overlay and temporary plate-frame guide. Removing that grey does not remove any architectural distinction or claim.

No publication accent colour is introduced.

## 9. Visual review

The actual CI-built Vivliostyle PDFs were rasterised and inspected, not accepted from source assertions alone.

### A4

The A4 object shows:

- clear hierarchy between prose-led flow and dedicated plates;
- comparable paired plans;
- legible line/type hierarchy and notation on the single section;
- a readable spread with semantic information clear of the fold exclusion;
- outward folios and suppressed running heads on plate pages.

Its larger page naturally contains more white space because drawing width is deliberately capped by the smaller proof surface rather than inflated for A4 and later reduced.

### B5

The B5 object remains legible without reducing the drawing frame or required annotation:

- room labels, level values, dimensions and scale bars remain readable;
- 0.18 mm secondary work remains visible;
- hatch does not close up;
- provisional dashed geometry remains distinguishable from ordinary geometry;
- the 5 mm plate-frame clearance is workable;
- the spread's 12 mm-per-side fold exclusion remains conservative without consuming the unique semantic content;
- captions and plate furniture fit without collision after the final proof-guide clearance adjustment.

No evidence from the B5 proof requires lowering information density by changing the doctrine tokens.

## 10. Proof-run history

### First targeted run — fail closed

Targeted doctrine workflow run `39074276331` / **#1** failed.

The failure identified two proof-harness defects rather than a doctrine failure:

1. the format stylesheet used a local CSS `@import` that Vivliostyle did not resolve in this specimen context;
2. because the shared page CSS was therefore absent, the intentionally blank page collapsed and the validator correctly observed six pages instead of seven.

The fix loaded common and format stylesheets explicitly through the Vivliostyle theme array and made the blank page structurally non-empty while visually blank. No DRW-01B/01C/01D token changed.

### Successful proof

After that fix, targeted run `39074415002` / **#2** passed and produced an inspectable A4/B5 artifact.

A final minor visual review found the proof-only 5 mm diagnostic frame touching the caption start on plan/section pages. Caption clearance was increased; this changed only specimen proof furniture, not the frozen page/drawing doctrine.

Final targeted run `39074619584` / **#3** passed on head `2bc84bcf26605522467383efbd7fd8c21f9cde3b`.

Final proof artifact:

- artifact id: `12116866247`;
- name: `drw-01e-doctrine-proof`;
- digest: `sha256:6305a3eba5c6177ed6baebfd1d5bf3d2a4966a8ea4e297892ffbcc94db04f143`;
- A4: **7 pages, 210 × 297 mm**;
- B5: **7 pages, 176 × 250 mm**.

Normal PR validation run `39074619585` / **#577** also passed completely on the same head, including repository health, both ordinary publication PDFs, PDF metadata, source/rendered nomenclature checks, adversarial nomenclature regressions and inventory.

## 11. Token disposition

**No DRW-01B, DRW-01C or DRW-01D token is revised by DRW-01E.**

Specifically retained unchanged:

- four line-weight roles;
- 7.5 pt / 6.5 pt drawing typography roles;
- approved scale family and 1:100 whole-building default;
- hatch and uncertainty conventions;
- selective dimension doctrine;
- page-class hierarchy;
- 5 mm plate-frame critical annotation inset;
- 12 mm-per-side spread critical exclusion;
- plate/drawing text ownership;
- rotation/foldout boundaries.

Future real drawings may reveal a concrete exception. Such an exception must reopen the owning token deliberately; DRW-01E does not grant later renderers permission to drift locally.

## 12. DRW-01 gate close

DRW-01 is now **FROZEN / COMPLETE**:

- DRW-01A — bounded precedent sample: DONE;
- DRW-01B — physical graphic tokens: DONE;
- DRW-01C — scale and notation doctrine: DONE;
- DRW-01D — page grammar: DONE;
- DRW-01E — executable A4/B5 physical-size proof: DONE.

The programme may now move from representational doctrine to selecting exactly what architecture the book must draw.

## 13. Handoff

**Next authorised packet: DRW-02A — map every Part IV architectural claim to the minimum drawing/view that can prove it.**

DRW-02A is a drawing-selection/claim-mapping packet. It must not begin by building the renderer, hardening arbitrary geometry or producing attractive plates before the register is earned.
