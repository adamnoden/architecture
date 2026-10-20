<!-- nav-exclude: redirect -->
# DRW-10F — Analytical-family consistency + physical plate proof

**Status:** IMPLEMENTED — physical proof pending

**Starting `main`:** `6206f4b65dbb30b64bb2d4fe1de4d1367f634e0a`  
**Owning issue:** #154  
**PR:** #352

## Question

Does the completed DRW-10 analytical family remain attached to canonical architectural substrates, preserve authority/precision boundaries and survive its actual frozen publication roles at A4 and conservative B5 without fit-scaling or geometric contradiction?

## Frozen publication roles

DRW-02E and DRW-10E resolve the family to exactly **two single analytical plates and three facing analytical pairs**:

| Event | Left / prose side | Right / drawing side | Scale |
|---|---|---|---:|
| external maintenance pair | synthetic setting / type plan | external-maintenance / setting overlay | 1:200 |
| service-maintenance pair | ground service / maintenance geography | first-floor service / maintenance geography | 1:100 |
| roof-failure pair | roof / drainage plan | roof water / failure reading | 1:100 |
| structural single | explanatory prose | structural / span reading | 1:100 |
| future-adaptation single | explanatory prose | future-adaptation framework | 1:100 |

A separate spatial-hierarchy drawing remains `NOT_REQUIRED` under DRW-10E.

## Family invariant

An analytical overlay is not permitted to become an independent redraw of its architectural substrate.

DRW-10F therefore proves at scene level that each overlay preserves its complete canonical substrate primitive array unchanged and only appends analytical notation:

- structural/span → canonical first-floor plan;
- ground service/maintenance → canonical ground-floor plan;
- first service/maintenance → canonical first-floor plan;
- roof water/failure → controlled roof/drainage plan;
- external maintenance/setting → controlled synthetic setting;
- future adaptation → canonical ground-floor plan.

The invariant is tested in `compiler/reference-house/publication-analytical-family-parity.test.ts`.

## DRW-10B controlled-artifact recovery

Family reconciliation exposed one real historical defect: the two DRW-10B service-maintenance SVGs had been reviewed/generated but were absent from `main`.

The old freeze workflow tested ordinary `git diff` **before staging ignored generated SVGs**. Untracked output therefore appeared clean and the job exited without committing the accepted pair.

DRW-10F repairs the mechanism by force-staging the generated SVG pair first and then testing the cached diff. The recovered controlled artifacts are:

- `docs/reference-house/publication-ground-service-maintenance-overlay.svg`
- `docs/reference-house/publication-first-service-maintenance-overlay.svg`

A deterministic artifact regression now requires both committed files to equal canonical generator output exactly. This is a control/freeze correction only; the DRW-10B renderer and architectural content are unchanged.

## Physical proof

The proof specimen is deliberately the **actual publication-role sequence**, not a montage:

1. intentional blank;
2. synthetic setting — left;
3. external maintenance — right;
4. ground service geography — left;
5. first service geography — right;
6. roof/drainage — left;
7. roof failure — right;
8. structural explanatory prose — left;
9. structural/span analytical plate — right;
10. adaptation explanatory prose — left;
11. future-adaptation analytical plate — right.

Files:

- `publication/specimens/drw10f/specimen.html`
- `publication/specimens/drw10f/common.css`
- `publication/specimens/drw10f/a4.css`
- `publication/specimens/drw10f/b5.css`
- `publication/specimens/drw10f/prepare.ts`
- `publication/specimens/drw10f/validate.ts`
- `publication/specimens/drw10f/vivliostyle.config.js`

CI produces both A4 and conservative-B5 PDFs plus rasterised page images for direct physical review.

## Physical-size boundary

No controlled drawing is fit-scaled.

The analytical family contains two native paper widths:

- `136 mm` plan-derived plates;
- `166 mm` setting and roof plates.

The 166 mm plates leave only `5 mm` at each trim edge on 176 mm-wide B5. That is an intentional **robustness proof**, not a final binding-margin or trim decision, and follows the already proven DRW-08E setting strategy. It would be false to claim a 22 mm binding-side margin while also retaining a true-size 166 mm drawing on B5.

## Authority boundary

DRW-10F adds no architectural geometry and promotes no provisional fact. It proves consistency of already-admitted analytical readings:

- gross structural support/span order, not engineering member design;
- service host-space geography, not MEP centrelines;
- failure/inspection relationships, not hydraulic sizing or outlet coordinates;
- maintenance capacity, not temporary-works/equipment footprints;
- life-course adaptation capacity, not accessibility compliance or an accessible-suite layout.

## Completion gate

DRW-10F is complete only when all of the following are true on the exact merge candidate:

1. all eight controlled analytical-family SVGs regenerate byte-clean;
2. scene-level substrate-prefix tests pass;
3. recovered service SVG deterministic artifact tests pass;
4. A4 proof builds and validates;
5. conservative B5 proof builds and validates at true drawing size;
6. both PDFs pass structural PDF checks;
7. rendered pages are directly reviewed for legibility, pair hierarchy, clipping and collisions;
8. any physical defect is corrected and the exact accepted head is re-proved;
9. the accepted head is reconciled against exact current `main` before merge.

No completion claim is made by this record until those gates pass.
