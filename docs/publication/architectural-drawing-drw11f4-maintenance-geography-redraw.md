<!-- nav-exclude: redirect -->
# DRW-11F-4 — Maintenance-geography FLOW redraw

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-11F-4  
**Status:** PASS pending final-head validation and merge  
**Issue:** #154  
**Exact base:** `509a96c6b646062865376ead0d1cca3fddb1b7a6`  
**Branch:** `drw-11f-4-maintenance-geography-physical-redraw`

## 1. Question

Can the authorised Part II maintenance-geography figure be re-authored in physical paper space without losing the existing four spatial task geometries or turning them into a generic process graphic?

## 2. Starting authority

DRW-11E froze this figure as **REDRAW — preserve the four-geometry composition**.

The authorised reader task remains:

`approach → working space → disconnection → withdrawal`

The figure must make those four conditions spatial rather than merely procedural. It has no authority to prescribe universal clearances, one literal room, a service topology or a construction detail.

## 3. Controlled artifact change

Reader-facing source:

- `docs/manuscript/figures/maintenance-geography-route.svg`
- old blob: `23fc7bb35ff9b4d0bb3e4728e9004b4240a6ce3b`
- accepted candidate blob: `678d9f467ee31c8565a5839e007452411c6483a1`

The redraw replaces the legacy `1500 × 820` screen-oriented viewport with a fixed **128 × 78 mm** physical frame using the established early-FLOW roles.

The composition is deliberately conservative:

- four adjacent plan-like fragments remain the primary grammar;
- `Approach` retains a route through an opening toward the component;
- `Working space` retains a body/work envelope beside the component;
- `Disconnection` retains clearance plus releasable connections;
- `Withdrawal` retains the component, a ghosted intermediate position and an outward removal path;
- one bottom datum links the four fragments as a continuous route;
- embedded prose is reduced to short action words and the route sequence;
- tonal fill, oversized screen typography and explanatory bottom paragraphs are absent;
- black line, dashed clearance/ghost geometry and direction carry the meaning.

No dimensional allowance, product, room or technical route is invented.

## 4. Proof-family extension

DRW-11F-4 extends `publication/specimens/drw11f/` to four pages:

1. selective permanence — regression lock;
2. designed interface — regression lock;
3. failure architecture — regression lock;
4. maintenance geography — active proof.

All four use the actual reader-facing SVGs at fixed 128 mm width on current A4 margins and conservative ISO B5. The validator checks all four physical frames and representative 7.5 pt / 6.5 pt roles.

## 5. Automated physical proof

First complete candidate head: `83779749fceb55df765c449a81c6b9ac0c38e91c`.

Dedicated proof run **`39508608319`**: **SUCCESS**.

The exact proof validates on both A4 and B5:

- four pages at requested physical page sizes;
- all four SVGs retain their **128 × 78 mm** physical frames;
- the three prior figures retain their representative 7.5 pt / 6.5 pt roles;
- `ONE CONTINUOUS MAINTENANCE ROUTE` resolves to the **7.5 pt** role within tolerance;
- `reach` resolves to the **6.5 pt** role within tolerance;
- A4 and B5 extracted sizes remain equal within frozen tolerance.

Proof artifact:

- artifact id: `12304642282`
- artifact name: `drw-11f-early-flow-proof`
- GitHub artifact digest: `sha256:cbd1e9b6ad0f5085fe4de01252df6aaad6bf53daa2926b9546be1ff7344ee501`
- A4 PDF SHA-256: `897944bcf9e796a2e11ac259df3d80ec0c4984cdc6602136c1ffbbc255c4d9b4`
- B5 PDF SHA-256: `2db60895421dba6eff89ceab1ce53f92f61895d1daec928f18d643ff6238d342`

## 6. Physical inspection

The exact uploaded PDFs were rendered at 200 dpi and page 4 inspected in both formats.

**A4 page 4: PASS**

- no clipping, overlap or broken glyphs;
- all four plan fragments remain visually separate and equally ranked;
- approach and withdrawal paths remain legible through the deliberate wall openings;
- working envelope, disconnection clearance and ghosted withdrawal position remain distinct from permanent linework;
- the continuous route datum reads as linkage rather than a fifth process box;
- the figure remains subordinate to prose and caption.

**Conservative B5 page 4: PASS**

- fixed 128 mm width fits without scaling;
- all four titles and internal notes remain legible;
- the plan-like character survives the smaller trim;
- no density rescue through smaller typography is required;
- the figure reads as restrained architectural/editorial explanation rather than presentation-deck information design.

No further graphical work is earned in this packet.

## 7. What this proves — and does not prove

DRW-11F-4 proves that maintenance geography can remain a four-part spatial task argument under the mature physical-paper drawing contract.

It does **not**:

- set universal access dimensions;
- define an anthropometric minimum;
- prescribe one room, service wall or route;
- prove actual component removal for the Reference House;
- replace the later Part IV service/maintenance overlays;
- prove the final pattern-language / generative-sequence redraw.

## 8. Acceptance

**DRW-11F-4: PASS, subject only to exact-final-head validation and merge lease.**

On merge, programme completion advances to **78 / 85 = 91.76%**.

**Next authorised packet: DRW-11F-5 — physically re-author the pattern-language fields + generative-sequence figure, preserving the two-structure distinction while materially simplifying and reflowing the presentation-deck-like legacy composition.**
