<!-- nav-exclude: redirect -->
# TYP-09D — physical verdict, release freeze and PR-02 handoff

Status: **BLOCKED ONLY ON OWNER PHYSICAL VERDICT + RELEASE TAG WRITE**  
Programme: TYP #425  
Parent: TYP-09 #702  
Packet: TYP-09D #706  
Upstream: TYP-09C #705 / PR #721 / merge `c3a08751b561448d5d7432efc4080c9c10cadcea`

## 1. Purpose

This is the final TYP closeout dossier. It does not reopen typography design.

The production system, release-candidate mechanics, full-book pagination, font embedding, semantic opening behaviour, PDF integrity, rebuild-equivalence boundary and TYP→PLT interface have already passed their machine gates. TYP-09D owns only:

1. the final physical review of one exact B5 release-candidate PDF;
2. an exact owner verdict recorded without inference;
3. the release/freeze record if accepted;
4. the PR-02 handoff.

A physical defect is not polished away here. It is an explicit freeze break against the smallest owning earlier TYP contract.

## 2. Exact integration state

TYP-09C landed via:

- PR: `#721`;
- validated PR head: `7629660c8d2bd0caf195b0a4ee6efb8c523b7d17`;
- merge: `c3a08751b561448d5d7432efc4080c9c10cadcea`.

Exact-head gates:

- TYP-09C release candidate run `40229870243` — **SUCCESS**;
- production typography proof run `40229870299` — **SUCCESS**;
- repository validation run `40229870458` — **SUCCESS**.

The TYP-09C release-candidate workflow used two independent hosted runners. Both rebuilt the paired A4/B5 publication and passed:

- permanent production typography verification;
- paired pagination ledger;
- frozen reader-content text-layout fingerprints;
- frozen reader-content bounding-box fingerprints;
- frozen complete 36 dpi grayscale reader-page fingerprints.

## 3. Exact physical-review object

The owner must review the **B5 PDF from this exact artifact**, not a later local rebuild.

GitHub Actions object:

- workflow run: `40229870243`;
- artifact name: `publication-typography-v1-rc1`;
- artifact id: `12611634571`;
- artifact digest: `sha256:a6dc6d4e85890d8ea39bf085cbbcfd023fe0dd25a9b2deaf5d1db77f62782bed`;
- artifact expiry: `2027-01-23`;
- B5 file: `b5/publication-typography-production-b5.pdf`;
- B5 PDF SHA-256: `3284d426bb855b758956fa7fe8000a6d4dd939be5170adc7393815d2c40da4af`;
- A4 PDF SHA-256: `0e4d4a09a10ba1ab05a0bdaad499c5720cf1d028cac4429dbf1a19d081e70de9`.

Evidence bundle:

- artifact name: `publication-typography-v1-rc1-evidence`;
- artifact id: `12611754250`;
- digest: `sha256:aaae5c271760c4910304701b1cb5478ab7b4df71cf2ff818c5ad0952ce569322`.

The exact PDF SHA is evidence for which file received the physical verdict. It is **not** a claim that independent Vivliostyle renders have identical raw PDF bytes.

## 4. Frozen production object

### A4 regression form

- 278 pages;
- 139 duplex leaves;
- 18 × 16-page planning sections if imposed as a simple 16-page boundary;
- 10 pages to the next 288-page 16-page boundary.

### Conservative B5 release form

- 335 pages;
- 168 duplex leaves;
- 21 × 16-page planning sections = 336 pages;
- therefore 1 page to that planning boundary.

The final manufacturing imposition belongs to the printer/binder. TYP does not infer a signature scheme merely from page count.

### Finished font set

Exactly:

- Source Serif 4 Regular;
- Source Serif 4 Italic;
- Source Serif 4 Bold;
- Source Sans 3 Regular;
- Source Sans 3 Bold.

No finished-PDF fallback face is admitted.

## 5. Rebuild-equivalence boundary

Fresh Vivliostyle runs are not claimed to be raw-byte-identical PDFs.

TYP-09C instead proved a bounded reader/layout equivalence contract:

- all 613 A4+B5 pages are mechanically verified;
- page 2 in each format is the live imprint/provenance page and intentionally carries the checked-out revision;
- page 2 remains present and structurally fail-closed but is excluded from cross-run content fingerprints;
- the remaining 611 reader-content pages must match frozen text-layout, bounding-box and complete-page raster fingerprints on two independent CI replicas;
- qpdf normalization within each build is separately byte-idempotent after volatile PDF dates are removed and overlong Vivliostyle destinations are normalized.

Authority: `publication/release-candidates/typ09c.json`.

## 6. Physical review gate

Owner verdict: **PENDING**.

The physical review is deliberately qualitative and human. Review the exact B5 file above at actual size, preferably black-only on stock reasonably approximating the intended warm uncoated interior paper.

The verdict need only answer:

> **ACCEPT**, or identify a specific physical typography defect.

Useful inspection territory, without turning this into a mandatory scorecard:

- sustained prose reading comfort and page colour;
- body size / leading / measure at actual size;
- Part and chapter thresholds;
- contents, folios and running furniture;
- dense technical/reference material;
- captions / plate furniture against architectural drawings;
- reduction behaviour of Source Sans drawing/publication typography;
- whether any page exposes a screen-only success that fails in print.

Do not manufacture observations for boxes that were not actually reviewed. The recorded verdict is the owner's evidence.

## 7. Before / after transition

### Previous working system

TYP began from an intentionally pragmatic publication layer:

- body role: Georgia / Cambria / Times-like system serif stack;
- sans role: Arial / Helvetica-like system sans stack;
- typography tuned for robust working A4 output while manuscript/drawing infrastructure remained mobile;
- no finished physical-book typography release identity.

That working system remains part of repository history and is not retrospectively described as defective. It was fit for its stage.

### Frozen TYP production system

The production publication now uses:

- Source Serif 4 as the sustained-reading/body family;
- Source Sans 3 as the restrained publication/navigation/drawing-interface family;
- explicitly mapped opening, hierarchy, mixed-content and furniture roles;
- pinned font resources and fail-closed finished-PDF embedding/fallback checks;
- authoritative A4 and conservative-B5 page geometry;
- semantic recto Part openings and controlled parity blanks;
- deterministic production preparation and bounded PDF normalization;
- permanent pagination and typography regressions.

This is a transition of publication authority, not erasure of the previous working state.

## 8. PLT handoff

Current compatibility state: **`CONTRACT_COMPATIBLE_PRE_V2`**.

TYP has frozen the drawing/publication sans interface:

- Source Sans 3;
- Regular / 400 and Bold / 700;
- no drawing sans italic;
- tabular figures available where alignment earns them;
- pinned font bytes and finished-PDF fallback proof;
- central semantic `PUBLICATION_DRAWING_TOKENS` / shared renderer seam;
- no view-local family fork.

PLT retains authority over drawing-specific sizes, hierarchy, placement and BOOK/WALL composition. Its historical `drawing-publication-v1` Arial token remains protected. PLT-03+ may consume the TYP-06 Source Sans contract; `drawing-publication-v2` must eventually migrate the central v2 token seam and re-prove its own outputs.

TYP does not need to wait for the future v2 release to record its own typography acceptance.

## 9. PR-02 handoff

PR-02 is owned by PUB-01 #71.

After physical acceptance and release identity creation, PR-02 may consume TYP without reopening typography for:

- final private-object trim/manufacturing work;
- paper and book-block decisions;
- printer/binder proofing;
- cloth, boards, sewing and exterior production;
- final 12-copy object production once the independent PLT drawing freeze is also satisfied.

TYP does **not** freeze final spine width. That remains manufacturing-dependent on actual stock/caliper, binding construction and printer/binder imposition.

Any substantive typography defect discovered during PR-02 production is a TYP freeze break, not ordinary production polish.

## 10. Release identity and tool boundary

Intended release identity: **`publication-typography-v1`**.

Current state: **PENDING PHYSICAL ACCEPTANCE**.

The connected GitHub tool surface available to this execution can create/merge commits and inspect releases/tags but does not expose tag/release creation. Therefore no tag is claimed here before it verifiably exists.

After an accepted physical verdict, the durable closeout must record:

- exact accepted B5 PDF SHA-256 above;
- owner verdict exactly as supplied;
- exact validated release commit;
- verifiable `publication-typography-v1` tag/release identity;
- repository validation green at the release state;
- final PR-02 handoff.

TYP-09 #702 and TYP #425 remain open until those conditions are true.

## 11. Current disposition

Machine / repository work: **COMPLETE THROUGH RELEASE CANDIDATE**.  
Typography design questions: **NONE OPEN**.  
Exact physical-review file: **FROZEN**.  
Owner physical verdict: **PENDING**.  
`publication-typography-v1` tag: **PENDING ACCEPTANCE + TAG WRITE**.  
PR-02 handoff: **PREPARED; FINAL AFTER RELEASE IDENTITY**.

No further TYP design work is authorised unless the physical proof identifies a specific defect.
