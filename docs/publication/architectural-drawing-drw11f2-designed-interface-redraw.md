<!-- nav-exclude: redirect -->
# DRW-11F-2 — Designed-interface FLOW redraw

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-11F-2  
**Status:** PASS pending final-head validation and merge  
**Issue:** #154  
**Exact base:** `01cb881bf1e8854a958cee676263d595450fe129`  
**Branch:** `drw-11f-2-designed-interface-physical-redraw-v2`

## 1. Question

Can the authorised Part II designed-interface figure be re-authored in physical paper space while retaining its functional decomposition, abstract `FLOW` status and explicit refusal to masquerade as a construction detail?

## 2. Starting authority

DRW-11E froze this figure as **REDRAW — preserve functional decomposition**. The reader task remains valid: make the duties of an interface explicit between two assemblies without pretending that a generic diagram can select a real junction.

The authorised structure is:

`Assembly A → interface duties → Assembly B`

The six duties remain:

- support;
- restraint;
- movement;
- boundary continuity;
- tolerance;
- fixing and removal.

The packet has no authority to invent construction build-ups, products, seals, fixings, dimensions, tolerances or a universal interface detail.

## 3. Controlled artifact change

Reader-facing source:

- `docs/manuscript/figures/designed-interface-functions.svg`
- old blob: `d8a4c0382479f45e554f7da409fd0b7fb067a291`
- accepted candidate blob: `2af61b411e76eb7093fffaabfe9ccf38f13570b0`

The redraw replaces the legacy `1500 × 820` screen-oriented viewport with a fixed **128 × 78 mm** physical frame and the already-proved DRW early-FLOW type roles.

The redraw is deliberately restrained:

- Assembly A and Assembly B remain plain outline figures rather than decorative cards;
- the central functional schedule remains dominant;
- all six authorised duties remain explicit;
- short prompts replace explanatory prose where the adjacent publication caption already carries the qualification;
- grey fill, rounded-card cues and the old bottom prose block are removed;
- black line, rule weight and spacing carry the hierarchy;
- no scale, technical-detail or construction authority is implied.

The result is a functional schedule, not a detail catalogue or universal joint.

## 4. Proof-family extension

DRW-11F-2 extends the existing `publication/specimens/drw11f/` proof family additively rather than creating a new harness.

- page 1 remains the accepted DRW-11F-1 selective-permanence figure as a regression lock;
- page 2 is the actual reader-facing designed-interface SVG;
- both are fixed at 128 mm width;
- both are rendered at current A4 margins and conservative ISO B5;
- the validator checks both pages, both physical frames and representative 7.5 pt / 6.5 pt embedded text roles.

This preserves family continuity while keeping each redraw independently inspectable.

## 5. Provenance and automated physical proof

The DRW candidate was physically proved before the final exact-main re-cut. Parallel DPL-14B movement touched only its corpus/site records; it did not touch the controlled SVG, publication placement or proof harness. The accepted SVG and harness blobs were therefore carried byte-for-byte onto the fresh base rather than re-authored.

First complete physically proved candidate head: `f78151eb8e79c0561cf434b999fda452fcd9fc7c`.

Dedicated proof run **`39506012998`**: **SUCCESS**.

The validator proves on both A4 and B5:

- two proof pages are present at the requested physical page dimensions;
- both controlled SVGs retain their **128 × 78 mm** frames;
- the DRW-11F-1 representative text roles remain at **7.5 pt / 6.5 pt**;
- `DESIGNED INTERFACE` resolves to the **7.5 pt** role within tolerance;
- `gravity load path` resolves to the **6.5 pt** role within tolerance;
- A4 and B5 extracted sizes remain equal within the frozen tolerance.

Proof artifact:

- artifact id: `12303306355`
- artifact name: `drw-11f-early-flow-proof`
- GitHub artifact digest: `sha256:6a5dc87a26f2878550c8f6e4fc4fb6d44863f831e8b4d14d977482ce91fb6ab7`
- A4 PDF SHA-256: `3e7a52161248b35af148b2642b427d91b708efee4ca170572c3c2ed613eb44e3`
- B5 PDF SHA-256: `ec76ea4625006a2dc9b3421e4c1d22940f772a4d7842325acd653d748b580fd8`

The fresh final head must independently rerun the proof before merge.

## 6. Physical inspection

The exact uploaded proof PDFs were rendered at 200 dpi and inspected.

**A4 page 2: PASS**

- no clipping, overlap or broken glyphs;
- six duty rows read immediately;
- assembly descriptions remain legible without competing with the central schedule;
- the figure is clearly subordinate to prose/caption and does not read as a plate;
- no presentation-card or dashboard grammar remains.

**Conservative B5 page 2: PASS**

- fixed 128 mm figure fits without scaling;
- central schedule retains comfortable internal spacing;
- assembly boxes and connector lines remain distinct;
- all label and note roles remain readable;
- no collision appears in the longer `Boundaries`, `Tolerance` or `Fixing + removal` rows.

**B5 page 1 regression spot-check: PASS**

The accepted selective-permanence figure remains visually unchanged and unclipped after the harness becomes two pages.

No further graphical work is earned in this packet.

## 7. What this proves — and does not prove

DRW-11F-2 proves that the functional-decomposition figure can meet the mature book's physical typography and restrained editorial grammar while remaining abstract.

It does **not**:

- prescribe which duties every real interface must contain;
- claim that all duties are separate components;
- select any real junction geometry or product;
- establish structural, fire, acoustic, water, air or thermal adequacy;
- turn the figure into a technical detail;
- prove the remaining three early-book redraws.

## 8. Acceptance

**DRW-11F-2: PASS, subject only to exact-final-head validation and merge lease.**

On merge, programme completion advances to **76 / 85 = 89.41%**.

**Next authorised packet: DRW-11F-3 — physically re-author the failure-architecture sequence, preserving the causal review logic while removing embedded prose that belongs in the adjacent caption.**
