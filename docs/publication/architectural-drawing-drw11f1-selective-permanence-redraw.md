<!-- nav-exclude: redirect -->
# DRW-11F-1 — Selective-permanence FLOW redraw

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-11F-1  
**Status:** PASS pending merge  
**Issue:** #154  
**Exact base:** `b5bc6d9a068a255995ff35a8abaa9063fcd610be`  
**Branch:** `drw-11f-1-selective-permanence-physical-redraw-v3`

## 1. Question

Can the authorised Part I selective-permanence figure be re-authored as a physically controlled `FLOW` figure without changing its doctrine, promoting it to a plate, or introducing presentation-deck graphic language?

## 2. Starting authority

DRW-11E froze this figure as **REDRAW — preserve concept and hierarchy**. The four temporal bands and the distinction between ordinary renewal and unavoidable crossings remain authorised. The defect was the legacy artifact, not the reader task: its 1400-unit screen-oriented viewport allowed embedded text to shrink below the mature physical typography contract when placed in the book.

The packet therefore had no authority to invent a construction build-up, literal service topology, universal lifetime model or new architectural claim.

## 3. Controlled artifact change

Reader-facing source:

- `docs/manuscript/figures/selective-permanence-platform.svg`
- old blob: `8abf5a2298134a9967e081b857484c8e8fe22128`
- accepted candidate blob: `41c7c14d45325a5e93f458dbf73ea894de00cd0a`

The redraw is intentionally conservative:

- preserves the four-band order: permanent fabric → interface infrastructure → replaceable systems → fit-out and wear;
- preserves a solid ordinary-renewal path terminating at the interface band;
- preserves a dashed exceptional crossing reaching permanent fabric;
- preserves the `sparse · deliberate · documented` qualification;
- removes the old explanatory prose panel rather than shrinking it into the graphic;
- removes grey tonal dependence: black line, dash and hierarchy carry the meaning;
- does not add a plate header, scale claim, decorative card system or architectural pseudo-detail.

The artifact now declares a fixed **128 × 78 mm** physical frame with `viewBox="0 0 128 78"`. Principal labels and notes use the established DRW physical roles. The browser/PDF result, rather than source arithmetic alone, is the acceptance authority for those sizes.

## 4. Reusable early-FLOW proof surface

DRW-11F-1 establishes `publication/specimens/drw11f/` as the bounded physical proof surface for the five accepted early-book redraws. It is deliberately small:

- one real reader-facing figure per proof page;
- current A4 publication margins;
- conservative ISO B5 robustness surface;
- fixed 128 mm figure width with no fit scaling;
- actual figure source, not a recreated proxy;
- extracted-PDF checks for physical type size;
- uploaded proof PDFs for visual inspection.

The workflow is `.github/workflows/drw-early-flow-proof.yml`. Later DRW-11F packets extend this same proof family rather than creating independent harnesses.

## 5. Provenance and physical proof

The DRW candidate was physically proved before the final exact-main re-cut. Parallel DPL-09B and DPL-10B movements touched only their own programme records/target JSON; they did not touch the controlled SVG, proof harness or publication placement. The accepted SVG and harness blobs were therefore carried byte-for-byte onto the fresh base rather than re-authored.

First complete physically proved candidate head: `4320c31de8b32aaa5f3bc78ef5c2f40806e9461d`.

Dedicated proof run **`39504604285`**: **SUCCESS**.

The validator proves on both formats:

- one-page A4 / B5 proof surfaces have the requested physical page dimensions;
- the figure retains its 128 × 78 mm frame;
- `Permanent fabric` resolves to the **7.5 pt** principal-label role within tolerance;
- `SLOWER / MORE ENDURING` resolves to the **6.5 pt** note role within tolerance;
- A4 and B5 extracted type sizes remain equal within the frozen tolerance.

Proof artifact:

- artifact id: `12302158777`
- artifact name: `drw-11f-early-flow-proof`
- GitHub artifact digest: `sha256:73e1c12839a3a5e1107fef45ff3575c4a1406802dca7c3a11e076285ff4c6b20`
- A4 PDF SHA-256: `15e52dc6ccccce9d4ea06119ae1eb451a5b3560223194ccc27502b7fb0b07063`
- B5 PDF SHA-256: `60d8efa677c5ee27719ef4903a7f26d1c71d5d4289497b9b4d93a0defb9ce634`

The fresh final head must independently rerun this proof before merge.

## 6. Physical inspection

The exact uploaded A4 and B5 PDFs were rendered at 200 dpi and inspected, not inferred from source or CI alone.

**A4: PASS**

- no clipping or overlap;
- all four bands remain immediately legible;
- both route curves are visually distinct;
- principal and note roles remain readable at page scale;
- caption and surrounding prose remain visually dominant enough to keep the object in `FLOW` rather than plate territory.

**Conservative B5: PASS**

- the fixed 128 mm figure fits inside the 138 mm proof content width without scaling;
- no clipping or collision appears at the tighter page width;
- labels remain readable;
- the two route annotations remain separated;
- the diagram still reads as a restrained explanatory figure rather than a dashboard or presentation slide.

No further graphical work is earned in this packet.

## 7. What this proves — and does not prove

DRW-11F-1 proves that this specific abstract figure can meet the mature publication's physical legibility and editorial-grammar standard while retaining its existing reader task.

It does **not**:

- turn the temporal bands into measured service lives;
- make the bands a construction build-up;
- establish a universal model of change;
- add technical detail authority;
- select a final book trim;
- prove the remaining four early-book figures.

## 8. Acceptance

**DRW-11F-1: PASS, subject only to exact-head re-proof and merge lease.**

On merge, programme completion advances to **75 / 85 = 88.24%**.

**Next authorised packet: DRW-11F-2 — physically re-author the designed-interface-functions figure while preserving its functional decomposition and abstract `FLOW` status.**
