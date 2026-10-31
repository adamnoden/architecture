<!-- nav-exclude: redirect -->
# DRW-10F — Analytical-family consistency and physical plate proof

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-10F  
**Issue:** #154  
**PR:** #364  
**Status:** ACCEPTED — exact-lease merge pending  
**Starting lease:** `782d5eb512c7ec8958bfa20fdddb3091e1cddb74`

## Purpose

Close DRW-10 by proving the completed analytical family as a publication family rather than as isolated SVGs.

This packet owns no new architectural drawing. It is a read-only integration proof over the frozen controlled artifacts produced by DRW-10A through DRW-10E.1, including the DRW-10B.1 artifact-freeze repair.

## Frozen family under proof

The controlled analytical views are:

- structural / span overlay — `1:100`, `136 × 145 mm`;
- external-maintenance / setting overlay — `1:200`, `166 × 108 mm`;
- ground-floor service / maintenance overlay — `1:100`, `136 × 145 mm`;
- first-floor service / maintenance overlay — `1:100`, `136 × 145 mm`;
- roof water / failure overlay — `1:100`, `166 × 145 mm`;
- entrance-storey future-adaptation overlay — `1:100`, `136 × 145 mm`.

The physical proof also carries the two ordinary architectural substrates that form frozen analytical pairs:

- synthetic setting / type plan — `1:200`, `166 × 108 mm`;
- roof / drainage plan — `1:100`, `166 × 145 mm`.

The separate spatial/sectional-hierarchy drawing remains `NOT_REQUIRED` by DRW-10E and is not resurrected here.

## Frozen publication roles

DRW-02E remains authoritative for sequence and pairing. The proof therefore reproduces the real publication relationships rather than making a synthetic contact sheet:

1. prose/context ↔ structural/span overlay;
2. synthetic setting/type plan ↔ external-maintenance/setting overlay;
3. ground-floor service/maintenance overlay ↔ first-floor service/maintenance overlay;
4. roof/drainage plan ↔ roof-water/failure overlay;
5. future-adaptation overlay ↔ prose/context.

The three true pairs preserve their frozen left/right order. The two singles remain independently complete and face prose rather than being promoted into artificial analytical pairs.

## Family rules proved

- canonical architecture remains visually primary; overlays are removable readings rather than replacement drawings;
- exact geometry, host-space/capacity territory, topology and unresolved geometry stay distinguishable;
- no overlay manufactures service routes, hydraulic coordinates, accessibility compliance, scaffold layouts or other absent technical geometry;
- page furniture is consistent across the family without forcing unlike sheet sizes into one generic frame;
- all controlled SVGs retain their intrinsic physical dimensions at A4 and conservative B5 proof sizes;
- there is no fit scaling, raster substitution or manual SVG post-editing;
- wide `166 mm` sheets and `136 mm` plan-family sheets receive distinct literal-size placement rules;
- frozen pair order survives duplex pagination.

## Proof form

The proof is an eleven-page duplex sequence:

- page 1 intentional blank;
- pages 2–3 structural context / structural overlay;
- pages 4–5 setting / external maintenance;
- pages 6–7 ground / first service-maintenance;
- pages 8–9 roof / failure;
- pages 10–11 future adaptation / context.

Both A4 and conservative B5 builds use literal controlled SVG dimensions. The proof validator checks page count/order, physical page size, intrinsic SVG size/scale/view identity, frozen pairing order and the absence of scale-to-fit CSS.

## Acceptance evidence

The first complete candidate head was `67b0f51bd62649cdda2b453cf6d3626ea0f9e671` on PR #364, based exactly on the corrected DRW-10B.1 `main` lease.

Automated proof on that candidate:

- analytical-family workflow run `39491255901` — **SUCCESS**;
- full pull-request validation run `39491256129` — **SUCCESS**;
- uploaded proof artifact `drw-10f-analytical-family-proof` — SHA-256 `6a2fa63e0d9a98b81049605b2b5e2471ac5e31c1c8fbe30c41c8c46c60bdf36c`.

The uploaded PDFs were rendered and physically inspected page by page at A4 and conservative B5. The review found:

- no clipped or missing drawing content;
- no fit-scaling or change of controlled physical size;
- readable and subordinate analytical overlays;
- intact left/right pairing at setting, service-maintenance and roof/failure spreads;
- structurally independent single plates facing prose rather than synthetic partner drawings;
- the `166 mm` B5 sheets remain inside the `176 mm` trim with the intended narrow robustness margin;
- no visual reason to reopen or cosmetically modify any owning DRW-10 packet.

The only change after that physical acceptance is this durable record update. The final PR head must therefore repeat both the analytical-family proof and the full repository validation successfully before merge.

## Non-goals

DRW-10F does not:

- redraw or restyle any controlled SVG;
- change source geometry or analytical authority;
- integrate the figures into the production manuscript (DRW-12A/B owns final registry and book integration);
- add a spatial-hierarchy plate;
- resolve any technical fact previously marked absent, provisional or capacity-only.

## Completion condition

DRW-10 is accepted when the record-only final head is green and PR #364 merges under an exact unchanged-`main` lease. Any later substantive failure reopens the smallest owning packet rather than being cosmetically hidden in DRW-10F.
