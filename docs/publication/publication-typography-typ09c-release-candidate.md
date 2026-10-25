<!-- nav-exclude: redirect -->
# TYP-09C — production release candidate and PLT compatibility

Status: **RELEASE-CANDIDATE PROOF**  
Programme: TYP #425  
Parent: TYP-09 #702  
Packet: #705  
Depends on: TYP-09B #704 / PR #715 / merge `59622075cf67e0bd7592480864ad37b5ef177817`

## Decision

TYP-09C freezes **`publication-typography-v1-rc1`** as the production typography release-candidate contract.

RC1 preserves:

- A4: **278 pages / 139 duplex leaves**;
- B5: **335 pages / 168 duplex leaves**;
- B5 planning boundary: **21 × 16-page sections = 336 pages**, therefore **1 page of boundary padding**;
- finished-PDF fonts: Source Serif 4 Regular / Italic / Bold + Source Sans 3 Regular / Bold only;
- the frozen TYP-03/04/05/06 body, hierarchy, mixed-content and drawing-interface contracts;
- no spine-width claim until final paper caliper / manufacturing stock is fixed.

The machine-readable authority is `publication/release-candidates/typ09c.json`.

## Exact artifact identity versus rebuild equivalence

An individual proof artifact has an exact PDF SHA-256 and GitHub artifact digest. TYP-09D records the exact **B5 file physically reviewed**; that file identity is immutable evidence for the owner verdict.

Fresh Vivliostyle builds do **not** reproduce identical raw PDF bytes across independent runners. TYP-09C proved this rather than hiding it. Within each individual build, PDF post-processing removes `CreationDate` / `ModDate`, normalises overlong Vivliostyle destinations, applies deterministic qpdf IDs, and proves byte idempotence on a consecutive qpdf pass; cross-run raw-PDF identity is nevertheless not claimed.

The publication also deliberately carries live provenance on page **2**. Its revision string follows the checked-out commit, including GitHub synthetic PR merge commits. Page 2 therefore cannot legitimately participate in a cross-run identity hash. It remains fully present in the release artifact and is separately fail-closed by the permanent verifier: it must remain page 2, contain the imprint/provenance role and carry the moved revision/source information.

Production rebuild equivalence is frozen at the reader/layout boundary using:

- GitHub hosted Ubuntu 26.04;
- Poppler `26.01.0-2ubuntu0.3`;
- qpdf `12.3.2-1`.

Each replica verifies all **613** pages mechanically, while reader-content fingerprints cover the **611 non-provenance pages**. Two independent calibration runners reproduced the following six values exactly before they were frozen.

### A4 — 278 pages total / 277 fingerprinted reader pages

- `pdftotext -layout`: `ef3e6a8650f3cfc025878c20de507d3170a13b74361c89704a15d3b404a56133`;
- `pdftotext -bbox-layout`: `0478ea9ee33525b22ac9fae22f7030819eddd9a705b84a3d8ad50c8bacca55b9`;
- reader pages rendered grayscale at 36 dpi: `ade41ca1ba6d6c164b5e84b5d1d49cfd5b56b3e3b7e114b837673a86ab5ebc6f`.

### B5 — 335 pages total / 334 fingerprinted reader pages

- `pdftotext -layout`: `13b908e3d5ae0a2595e4e302382b4e3b2ba8ff3b17f5a49fdf554d21edf864ff`;
- `pdftotext -bbox-layout`: `c2bd4615abd6217551984a760a6210e388f139a74dc0cc32a1612bebb56976d3`;
- reader pages rendered grayscale at 36 dpi: `efa3c201e11e745f8d834554ac222e9b1fa1c3e1fc2346f457649b5dcb3865d5`.

The dedicated TYP-09C workflow runs **two independent CI replicas**. Both rebuild the whole A4/B5 publication, pass the permanent production verifier and pagination ledger, and must reproduce all six reader-content fingerprints. Replica 1 alone emits the exact physical-review artifact; replica 2 exists solely to prove independent rebuild equivalence.

## Cold PDF review

Before RC freeze, the exact B5 production artifact from TYP-09B run `40199097721` / artifact `12600940982` was reviewed cold as a PDF object rather than inferred from CSS.

Sampled pages: `1, 2, 23, 59, 85, 103, 215, 216, 230, 231, 240, 273, 335`.

The sample spans title/imprint, all five Part thresholds, ordinary chapter/prose, Reference House transition, a real architectural plate, Part V and dense source material.

Result: **PASS — no new typography design question exposed.**

This remains screen/PDF review, not the final TYP-09D physical-owner verdict.

## PLT compatibility

TYP-09C does not pretend `drawing-publication-v2` exists.

The current central drawing token still contains the protected `drawing-publication-v1` working value `Arial, Helvetica, sans-serif`. TYP-06 already classifies that value as historical rather than the final family contract.

The frozen TYP→PLT contract is:

- **Source Sans 3**;
- 400 Regular + 700 Bold;
- no drawing sans italic;
- tabular figures where alignment earns them;
- exact pinned font bytes / fail-closed finished-PDF fallback proof;
- one central `PUBLICATION_DRAWING_TOKENS` / renderer seam;
- no view-local family forks.

Compatibility verdict: **`CONTRACT_COMPATIBLE_PRE_V2`**.

Before `drawing-publication-v2` release, PLT must make its central v2 drawing-token seam consume the frozen Source Sans identity and re-prove BOOK/WALL outputs under PLT authority. TYP does not mutate the historical v1 token merely to close its own release gate.

## Release boundary

After both TYP-09C CI replicas and repository validation pass, only the final physical review of the exact replica-1 B5 artifact remains TYP-owned.

TYP-09D must record that artifact/run/digest/file SHA exactly, obtain the owner's physical verdict without manufacturing qualitative evidence, route any defect to the smallest frozen TYP owner, and—if accepted—freeze `publication-typography-v1`, preserve the 278/335 pagination ledger and manufacturing-only spine unknown, and hand the contract to PR-02.

No physical verdict is inferred here.
