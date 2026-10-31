<!-- nav-exclude: redirect -->
# TYP-08A — full-book candidate assembly and proof contract

Status: **COMPLETE CANDIDATE — mechanically valid whole-book A4/B5 corpus, pending merge and TYP-08B red team**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Owning stage: **#549 — TYP-08 — whole-book typography red team**  
Packet: **#550 — TYP-08A — full-book candidate assembly and proof contract**  
Inherited representative-signature freeze: `docs/publication/publication-typography-typ07c-representative-signature-freeze.md`

## 1. Result

TYP-08A has produced the first complete Ovid’s House typography candidate in both the existing A4 regression territory and the conservative **176 × 250 mm B5** physical territory.

The candidate is mechanically valid. It is **not yet typographically approved page by page**. TYP-08B owns that adversarial review.

The decisive whole-book counts are:

| format | pages | leaves | 16-page planning sections | pages at next 16-page boundary | padding to boundary |
|---|---:|---:|---:|---:|---:|
| A4 | 260 | 130 | 17 | 272 | 12 |
| B5 176 × 250 mm | 317 | 159 | 20 | 320 | 3 |

The B5 candidate therefore adds:

- **57 pages** relative to A4;
- **+21.92%** pages;
- **29 leaves**.

The near-320-page B5 result is useful manufacturing-planning evidence, but **20 × 16-page sections is not yet a printer/signature specification**. Final imposition, section size, stock, creep and binding decisions remain manufacturing authority.

No numeric spine-width claim is admissible yet because final paper caliper / stock is not frozen. The correct relationship remains:

`book-block thickness = leaf count × actual paper caliper`

TYP-08A records the 159-leaf B5 fact; it does not invent the missing material input.

## 2. Build boundary

The candidate deliberately does **not** replace the current production theme globally.

It uses the existing authoritative preparation path:

`publication/scripts/prepare.ts --full`

That path supplies the complete 40-entry reader-facing publication, including generated contents, ordinary adapters, real FLOW placements and controlled architectural plates.

After that ordinary preparation, TYP-08A changes only generated `publication/.work` copies. Canonical manuscript, figure, plate and production-theme bytes remain untouched.

The candidate-only integration layer performs these bounded duties:

1. transports the exact pinned Source Serif 4 + Source Sans 3 bytes into the proof;
2. maps the prepared book onto the frozen TYP-03 body and TYP-04 hierarchy/navigation metrics;
3. applies the frozen TYP-05 difficult-content roles to the real full corpus;
4. rebinds copied reader-facing FLOW/DRW SVG lettering to the physically proven TYP-06 Source Sans interface;
5. removes the generated A4-only controlled-plate stylesheet from the prepared Part IV copy so the same real plate markup can compose in A4 and B5 without scaling controlled drawing paper-space sizes;
6. leaves production-wide integration for TYP-09.

This is the narrowest truthful full-book seam found. Migrating `publication/theme.css` merely to create the red-team object would collapse candidate proof and final release integration into one step and obscure whether later corrections are typographic design decisions or production plumbing.

## 3. Full-corpus integration facts

The exact candidate contains:

- **40 publication entries**;
- **40 Appendix C schedule records**, replacing the legacy five-column miniature grid only in the generated proof copy;
- **2 architectural text/arrow sequence blocks** rendered as Source Sans ordered logic rather than code;
- **16 long-URL bibliography rows** using serif citation text plus subordinate Source Sans URLs;
- **22 controlled FLOW / DRW SVG assets** with exact Source Sans proof rebinding;
- the real controlled architectural plate composition rather than placeholder fields.

All 22 SVG transformations are byte-reversible at the typography seam. The generated proof copy changes family/resource transport and, for Reference House drawings, enables the already physically proven `note`-role tabular-numeral capability. Canonical SVGs remain unchanged.

The prepared Part IV working plate style is stripped exactly once. That style is an A4 working-system seam containing fixed A4 page geometry and legacy Arial declarations; the underlying plate sections, titles, scales, captions and real drawings remain the same.

## 4. Exact font evidence

The candidate uses only the five TYP-frozen Source inputs.

### Source Serif 4

- `SourceSerif4-Regular.ttf` — proof-byte SHA-256 `e5a4ee6a3d87bb9024796be390c6771e2a0eb1883dae25effaf57ca01668e24b`
- `SourceSerif4-It.ttf` — proof-byte SHA-256 `9d2950a8f1da66e21502c35d646a1d2148e79f9ea43fd2158cf02f5232e7f430`
- `SourceSerif4-Bold.ttf` — proof-byte SHA-256 `7cf4f4e1ad74f45058d5bc61716b82560442fbdcd9d3654d2dea96bf6c683d86`

### Source Sans 3

- `SourceSans3-Regular.ttf` — proof-byte SHA-256 `4644c81b86ec9caaa76b634889968ed3c4f4f52f054855933acc7c2b21e53b0f`
- `SourceSans3-Bold.ttf` — proof-byte SHA-256 `9214b9d95e4231c609802815c2646c98174e2102d0d37f88978a7f8e71006e6a`

Finished-PDF inspection is fail-closed: every embedded font name must belong to this five-face set, and every required face must appear. The first complete proof passes that gate in both formats.

No Arial, Helvetica, Georgia, Times, Liberation, Courier or other renderer/system face survives in either finished candidate PDF.

## 5. Exact proof evidence

Implementation head before this durable-record commit:

`a2859dc13a593f9888b85a60bdd7d7a5afac23cf`

Pull request:

**#563 — TYP-08A: build exact full-book typography candidate**

First complete proof run:

- workflow: **TYP-08 full-book candidate**;
- run: **40085698724 — SUCCESS**;
- ordinary repository/publication validation: **40085698632 — SUCCESS**;
- artifact: **12556524707 — `typ08a-full-book-candidate`**;
- artifact digest: `sha256:0230b4a80d0124fe27fb39fdd34f7e4cf72e7b288f9d176d091e85ffa23cd5ec`.

### A4 candidate

- pages: **260**;
- leaves: **130**;
- page geometry: **210 × 297 mm** on every page;
- PDF SHA-256: `0e45dba85c875b0a17ba33eefedeafbc1fefd7febdad702db925e6c811c14c7d`;
- finished fonts: exactly the five frozen Source faces.

### Conservative-B5 candidate

- pages: **317**;
- leaves: **159**;
- page geometry: **176 × 250 mm** on every page;
- PDF SHA-256: `092cdb2d7f7fdc4fa2702a1aea54359e5370a3416890bd0455db872c61508dd0`;
- finished fonts: exactly the five frozen Source faces.

The workflow verifies page geometry **page by page**, not merely on page 1.

## 6. Review corpus

TYP-08A also renders every B5 page to an indexed **110 dpi JPEG review corpus**.

The artifact therefore contains:

- the full A4 candidate PDF;
- the full B5 candidate PDF;
- `manifest.json` describing exact inputs and candidate-only transformations;
- `verification.json` containing page/font/geometry/block evidence;
- `review-index.json` mapping all **317 B5 pages** to deterministic review images;
- **317 B5 page images**.

This corpus is the input to TYP-08B. TYP-08A does not reinterpret its existence as aesthetic approval.

## 7. What is now known about the physical book

For the first time, typography has been applied to the complete current publication rather than a representative signature.

Known:

- B5 territory currently yields **317 pages / 159 leaves**;
- the corpus lies only **3 pages below a 320-page / 20 × 16-page planning boundary**;
- the B5 typography system increases page count materially relative to A4, by about **22%**;
- exact Source embedding survives the complete corpus;
- the whole book can carry all present content classes without introducing another type family;
- the real plate/figure corpus can be carried through the exact-font candidate without altering canonical assets.

Not yet known:

- whether every one of the 317 B5 pages is typographically satisfactory;
- whether whole-book page turns, blank-page rhythm, table breaks, caption relationships or running furniture expose defects that representative proofs could not show;
- whether the candidate page count changes after legitimate TYP-08B corrections;
- final paper stock/caliper and therefore book-block/spine thickness;
- final printer signature/imposition strategy.

These uncertainties are now correctly bounded rather than guessed.

## 8. Explicit non-decisions

TYP-08A does **not**:

- reopen the typeface search;
- alter TYP-03 body size, leading, measure or paragraph system;
- alter TYP-04 hierarchy merely to reduce page count;
- admit a mono or display-math family;
- change PLT drawing-specific type sizes, hierarchy or geometry;
- rewrite manuscript prose to rescue pagination;
- migrate `publication/theme.css` into final production state;
- release `publication-typography-v1`;
- claim that 317 pages is the final private-edition pagination;
- convert the 159-leaf result into an invented spine width.

## 9. Handoff to TYP-08B

Next packet:

**#551 — TYP-08B — whole-book typographic corpus red team**.

TYP-08B should treat the exact B5 candidate as the primary whole-book reading object and inspect all 317 pages / spreads for concrete defects. A4 exists as the regression/reference counterpart where format difference matters.

The review must produce a page-addressed defect ledger, not a general aesthetic reaction. Each material finding should identify the smallest owning contract or production seam. Intentional unusual pages should be recorded as no-change rather than normalised automatically.

TYP-08C remains conditional. If TYP-08B earns no corrections, close it as not needed.
