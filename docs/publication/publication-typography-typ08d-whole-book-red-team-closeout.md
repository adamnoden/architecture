# TYP-08D — Whole-book typography red-team closeout

Status: **COMPLETE CANDIDATE — pending merge of this closeout record**  
Programme: TYP #425  
Parent stage: TYP-08 #549  
Closeout issue: #553  
Correction issue: #552  
Correction PR: #569

## 1. Outcome

TYP-08 is complete in substance.

The full Ovid’s House candidate has passed a cold whole-corpus typography review, the five material defects admitted by TYP-08B have been corrected at bounded seams, and the corrected A4/B5 corpus has returned mechanically green without reopening the frozen type system.

No typeface search, body-metric retuning, manuscript rewrite, pattern redesign, Appendix C redesign, or PLT drawing-geometry change was admitted by TYP-08C.

The remaining work is **production integration and release**, not typography design. That work belongs to TYP-09 #702.

## 2. Final correction authority

The TYP-08B whole-book defect ledger is:

`docs/publication/publication-typography-typ08b-whole-book-red-team.md`

It admitted exactly five correction classes:

1. semantic division/entry running context and frozen TYP-04 running navigation;
2. frozen TYP-04 division + entry opening-page composition;
3. frozen TYP-05 citation/URL roles on Part I Notes;
4. frozen TYP-04 title/imprint separation;
5. exact Source Sans SVG transport / finished-PDF parser integrity.

PR #569 implemented only these classes in generated proof space and associated verification machinery.

## 3. Exact final proof authority

Final validated replay head:

`e77666854410b53e55b6be1391e2a3d616aaec03`

Merged via PR #569 as:

`eec15a2be370c849d2ed7040a153baeceba6ed96`

Exact validation:

- TYP-08 full-book proof run `40196023884` — **SUCCESS**;
- whole-repository validation run `40196023867` — **SUCCESS**;
- whole-book artifact `12599667113` — `typ08a-full-book-candidate`;
- whole-book artifact digest `sha256:c42693eb4f2f7642a5a071277f7320e7d88fc99fbdcb74ec21ab81f6c8d4b86c`;
- diagnostics artifact `12599579654` — `typ08c-pdf-diagnostics`;
- diagnostics digest `sha256:dda7020a34dcb2cf3f34b9ce9ce52d64e94069f0fa06e71ffd851e6a559c166f`.

The final proof contains 343 files, including both PDFs, verification manifests, correction evidence, destination-normalisation evidence, review index and 334 deterministic B5 review images.

## 4. Final A4 / B5 corpus

### A4 regression candidate

- 276 pages;
- 138 leaves;
- 18 × 16-page sections = 288-page boundary;
- 12 pages of padding to that boundary;
- PDF SHA-256: `3f8b7298b10d21e7bce2a2483492505b367ab6d8914c73607a76c8ace49264c8`.

### Conservative B5 candidate

- 334 pages;
- 167 leaves;
- 176 × 250 mm;
- 21 × 16-page sections = 336-page boundary;
- 2 pages of padding to that boundary;
- PDF SHA-256: `0f65d6cbade6632ffc4dc039a3cad89225b5982a26cb7d1a8a1272a18bcdc991`.

### B5 versus A4

- +58 pages;
- +29 leaves;
- +21.01% page count.

A spine-width claim is still **not admissible**. Final paper stock, bulk/caliper, binding specification and printer imposition are manufacturing inputs outside TYP-08 authority. TYP-09 / PR-02 may convert the known 334-page / 167-leaf block into a spine dimension only when those inputs are real.

Compared with the original TYP-08A proof (260 A4 / 317 B5), the corrected corpus is +16 A4 pages and +17 B5 pages. That growth was earned by the bounded opening/front-matter/navigation corrections rather than by a body-text retune.

## 5. Finished-font and PDF integrity verdict

Both final PDFs contain exactly the frozen five faces:

- `SourceSerif4-Regular`;
- `SourceSerif4-It`;
- `SourceSerif4-Bold`;
- `SourceSans3-Regular`;
- `SourceSans3-Bold`.

No common system-font fallback is admitted.

The D05 diagnosis is now explicit: the material Poppler problem was overlong Vivliostyle named destinations, not the exact embedded Source Sans data-URI transport. The exact Source Sans transport was therefore restored in the 22 generated SVG copies, while finished PDFs receive deterministic destination normalisation.

Final D05 evidence:

- 69 overlong Vivliostyle destination names normalised;
- 196 occurrences in A4;
- 198 occurrences in B5;
- qpdf clean after normalisation;
- Poppler parser stderr clean at verification.

## 6. Opening / navigation verdict

The corrected full-book verifier passes the frozen TYP-04 semantic contract:

- all five Part openings begin on recto;
- Part openings are furnitureless;
- genuine parity blanks are furnitureless;
- semantic division/entry running context is present;
- representative internal chapter entry behaviour retains its folio;
- principal title page is clear of proof provenance;
- provenance is separated onto an imprint page;
- Part I Notes use the frozen citation / long-URL role split.

These are production semantics to be migrated by TYP-09. They are not permission to copy the entire TYP-08 proof harness wholesale into production.

## 7. Whole-book red-team findings disposition

TYP-08B found no reason to reopen the typeface or body-reading system.

The following classes were explicitly accepted as **no change** after whole-corpus review:

- contents system apart from the admitted semantic/navigation defects;
- body page colour;
- sparse tails;
- pattern material;
- FLOW graphic language;
- architectural plates;
- Appendix C;
- Appendix E.

All five admitted defects are now corrected and re-proved. No material typography finding remains held open inside TYP-08.

## 8. Physical-review evidence

TYP-08B earned **no new physical-only question**.

The inherited physical authority therefore remains the TYP-07 representative-signature proof accepted by the owner on 24 October 2026 with the exact verdict `LGTM` and no requested correction or freeze break:

- TYP-07B PR #548;
- proof head `4fb5769c46fa32f5e9ac0c8a9d72a73e1fc2ae80`;
- proof run `40080166415` — SUCCESS;
- artifact `12554427992`;
- artifact digest `sha256:ba68915fbe44ff23271109d91a341e6194c3c4fd84f74983ad34593964e9f376`;
- B5 17 pages at 176 × 250 mm;
- A4 15 pages;
- exact five Source faces;
- no common fallback.

TYP-08 does not invent a second qualitative physical verdict that was never supplied. Final production physical proof remains TYP-09D authority.

## 9. Production-integration debt carried to TYP-09

A direct audit of the current production path confirms that TYP-09 is substantive integration work, not an administrative release step.

### `publication/theme.css`

The authoritative production theme is still explicitly the earlier A4 working system:

- serif role remains `Georgia / Cambria / Times...`;
- sans role remains `Arial / Helvetica...`;
- mono remains a system stack;
- body remains `72ch` with `hyphens: auto`;
- running furniture still uses `env(pub-title)` / `env(doc-title)`;
- title, Part opening, heading, table and caption metrics remain the previous working implementation.

Those facts are historical working-system state, not a defect in TYP-08. TYP-09A must migrate the frozen contracts deliberately rather than pretending the specimen implementation is already production.

### `publication/vivliostyle.config.js`

Production currently:

- builds A4 only;
- has title + contents but no production imprint entry;
- applies one working `theme.css`;
- has no production A4/B5 release-candidate mode or typography-specific final verification boundary.

### `publication/scripts/prepare.ts`

Production preparation currently:

- writes date/revision/site provenance on the principal title page;
- does not yet emit the semantic division/entry context used by the proved TYP-08 contract;
- does not yet own the corrected Part I Notes citation/URL role mapping;
- has no TYP-08-style production imprint separation.

### Mechanical release boundary

Production still needs deliberate decisions about which proved mechanisms become permanent:

- exact pinned Source font loading;
- finished-PDF font identity checks;
- destination normalisation / qpdf boundary;
- Poppler warning fail-closed checks;
- opening / blank / running-context regressions;
- A4 regression plus conservative-B5 production proof;
- removal or retention of mono only according to actual reader-facing corpus need;
- PLT compatibility against the frozen Source Sans contract.

This debt is now packetised as #702 → #703 → #704 → #705 → #706.

## 10. TYP-09 handoff

TYP-09 parent: #702.

Dependency spine:

`#703 TYP-09A → #704 TYP-09B → #705 TYP-09C → #706 TYP-09D`

The first authorised work after this closeout merges is #703 / TYP-09A: production integration boundary and role/token migration.

No typography design question is intentionally carried forward.

TYP-09 may discover an integration defect. If that defect requires changing a frozen TYP-03/04/05/06 decision, it must be recorded as an explicit freeze break against the smallest owning contract rather than silently absorbed into production CSS.

## 11. Close decision

On merge of this record:

- #553 / TYP-08D may close;
- #549 / TYP-08 may close;
- #702 / TYP-09 becomes active;
- #703 / TYP-09A becomes the current authorised packet.

TYP-08 therefore closes with the whole-book typography system **proved and corrected**, but not yet released as production authority. The release name `publication-typography-v1` remains reserved for successful TYP-09D closeout.
