<!-- nav-exclude: redirect -->
# DRW-10F — Analytical-family consistency + physical plate proof

**Status:** PASSED — merge remains subject to exact-current-main lease  
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

An analytical overlay is not permitted to become an independent redraw of its architectural substrate. Scene-level regression therefore proves that every analytical scene preserves its complete canonical substrate primitive array unchanged and only appends analytical notation:

- structural/span → canonical first-floor plan;
- ground service/maintenance → canonical ground-floor plan;
- first service/maintenance → canonical first-floor plan;
- roof water/failure → controlled roof/drainage plan;
- external maintenance/setting → controlled synthetic setting;
- future adaptation → canonical ground-floor plan.

All eight controlled family SVGs must also regenerate byte-clean.

## DRW-10B recovery

Family reconciliation exposed a historical control defect: the two DRW-10B service-maintenance SVGs had been reviewed/generated but were absent from `main` because the old freeze workflow tested ordinary `git diff` before staging ignored generated files.

DRW-10F corrected the gate by force-staging before testing the cached diff, recovered both controlled SVGs at `d5b96c19b9da767121b8cefc2dd30a55ee2f7c59`, and added deterministic committed-artifact regressions. The renderer and architectural content were unchanged.

## Physical proof

The proof uses the actual publication-role sequence rather than a montage:

1. intentional blank;
2. synthetic setting — left;
3. external maintenance — right;
4. ground service geography — left;
5. first service geography — right;
6. roof/drainage — left;
7. roof failure — right;
8. structural explanatory prose — left;
9. structural/span plate — right;
10. adaptation explanatory prose — left;
11. future-adaptation plate — right.

No controlled drawing is fit-scaled. Plan-derived plates remain 136 mm wide; setting/roof plates remain 166 mm wide. On 176 mm B5 the wide plates therefore retain the already-proven 5 mm trim-side envelope. This is a robustness proof, not a false final binding-margin claim.

## Physical finding and correction

The first full-family review found one real defect: the accepted DRW-10C roof-failure plate's long bottom nonclaim collided with the inherited scale-bar `0` at both A4 and B5.

DRW-10F changed presentation only. The absence copy moved into unused right-hand analytical legend territory; the canonical roof substrate, scale bar, metadata and water-management nonclaims remain unchanged. The corrected SVG was frozen at `deb7afc3e74c76229070f94bd51a40df9a163316`, and `ec8700dd48d81024862d7813f6fe2eb107a46876` adds a regression protecting that clearance.

## Accepted proof

Workflow run `39486843600` passed:

- all eight controlled SVGs regenerate byte-clean;
- substrate-prefix parity passes;
- recovered service deterministic-artifact locks pass;
- A4 proof builds and validates;
- conservative B5 proof builds and validates;
- both PDFs pass structural checks;
- 11-page sequence and facing-page parity are correct;
- direct review confirms legibility, hierarchy and absence of clipping/collisions at both sizes.

Accepted proof artifact digest:

`sha256:23fce67a06629fcd8a98a30aa8f3bcdf03fc35afa4160779c5a207049362e572`

## Authority boundary

DRW-10F adds no architectural geometry and promotes no provisional fact. It proves consistency only:

- structural support/span order, not engineering member design;
- service host-space geography, not MEP centrelines;
- failure/inspection relationships, not hydraulic sizing or outlet coordinates;
- maintenance capacity, not temporary-works/equipment footprints;
- life-course adaptation capacity, not accessibility compliance or an accessible-suite layout.

## Closeout

The analytical family is physically and semantically coherent. Remaining merge work is procedural only: reconcile the accepted packet onto exact current `main`, re-run the combined-head proof/validation, and merge only under a clean lease.

**Exact next packet after merge:** **DRW-11A — freeze the bounded detail register against current technical/prototype authority.**
