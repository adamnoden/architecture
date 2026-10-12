# Reference House — RH-C0 Model Baseline

**Status:** RH-C0.2 independent dimensional reconstruction — **PASS**; later RH-C0 stages may refine this file  
**Date:** 2026-10-12  
**Programme:** [`../computational/reference-house-model-freeze-rhc0.md`](../computational/reference-house-model-freeze-rhc0.md)  
**Downstream:** [`../computational/reference-house-executable-slice.md`](../computational/reference-house-executable-slice.md)

This is the canonical pre-compiler fact schedule for the Reference House. It records which current RH authority owns each compiler-bound architectural fact after RH-00→RH-11 supersessions. It is not construction information and does not convert provisional engineering assumptions into evidence.

Coordinates use the current Reference House convention: origin at the south-west outer corner; +X east; +Y north; millimetres unless stated otherwise.

## Status vocabulary

- **CONTROLLED** — current architectural/project fact at the stated scope.
- **PROVISIONAL** — current working fact needed for coordination but still dependent on engineering, simulation, product selection, site or competent review.
- **OPEN** — unresolved enough that RH-C1 must not treat it as source truth.

The later RH-C0.3/RH-C0.7 classifications (`AUTHORED`, `DERIVED`, etc.; `FROZEN_FOR_RH_C1`, etc.) will be added only after dependency review.

## Canonical authority / fact schedule

| ID | Semantic subject | Current value / relationship | Unit | Owner | Exact source | Status | Supersession / dependencies |
|---|---|---|---|---|---|---|---|
| `RHCF-SHELL-X` | outer shell width | 12,000 | mm | RH-02 | `ground-floor-development.md` §1, §3 | CONTROLLED | Supersedes RH-01 11,400 mm width. |
| `RHCF-SHELL-Y` | outer shell depth | 10,800 | mm | RH-01 retained by RH-02 | `ground-floor-development.md` §1, §3 | CONTROLLED | Unchanged by RH-02 correction. |
| `RHCF-COURT-X0` | courtyard west edge | X = 4,200 | mm | RH-02 | `ground-floor-development.md` §3 | CONTROLLED | Same coordinate used by RH-03/RH-05. |
| `RHCF-COURT-X1` | courtyard east edge | X = 7,800 | mm | RH-02 | `ground-floor-development.md` §3 | CONTROLLED | — |
| `RHCF-COURT-Y0` | courtyard south edge | Y = 3,400 | mm | RH-02 | `ground-floor-development.md` §3 | CONTROLLED | — |
| `RHCF-COURT-Y1` | courtyard north edge | Y = 7,400 | mm | RH-02 | `ground-floor-development.md` §3 | CONTROLLED | — |
| `RHCF-COURT-SIZE` | courtyard gross size | 3,600 × 4,000; centred in shell | mm | RH-02 | `ground-floor-development.md` §1, §3 | CONTROLLED | Environmental role refined by RH-07; geometry unchanged. |
| `RHCF-WING-WE` | west/east gross wing depth | 4,200 each | mm | derived from RH-02 morphology | `ground-floor-development.md` §1 | CONTROLLED | Consequence of shell/court geometry. |
| `RHCF-WING-SN` | south/north gross wing depth | 3,400 each | mm | derived from RH-02 morphology | `ground-floor-development.md` §1 | CONTROLLED | Consequence of shell/court geometry. |
| `RHCF-PLATE` | enclosed gross plate proxy | 115.2/storey; 230.4 two storeys | m² | derived from RH-02 shell/court | `ground-floor-development.md` §1 | CONTROLLED | Gross proxy only; not GIA/NIA. |
| `RHCF-GF-TOPO` | ground-floor topology | west front drawing; west rear family; south centre hall/stair; east inner gallery; south-east study; east-middle service suite; north-centre garden dining; north-east kitchen | relationship | RH-02, locally RH-03 | `ground-floor-development.md` §3; `upper-floor-and-stair-development.md` §3 | CONTROLLED | RH-03 moves only front drawing/hall boundary. |
| `RHCF-GDRAW-SPLIT` | west drawing/family split | Y ≈ 5,000; adjustable by a few hundred mm | mm | RH-02 | `ground-floor-development.md` §3 | PROVISIONAL | Order controlled; exact partition deliberately unfrozen. |
| `RHCF-HALL-WEST` | front drawing/hall boundary | X ≈ 4,000 for front-wing depth only | mm | RH-03 | `upper-floor-and-stair-development.md` §3; `stair-ground-floor-overlay.svg` | CONTROLLED at planning level | Supersedes RH-02 X=4,200 only south of courtyard. Exact wall build-up/finish offsets remain downstream. |
| `RHCF-GAL-X0` | east gallery west edge | X = 7,800 | mm | RH-02 | `ground-floor-development.md` §3 | CONTROLLED | Coincident with courtyard east line. |
| `RHCF-GAL-X1` | east gallery / outer service-strip boundary | X = 9,100 | mm | RH-02 | `ground-floor-development.md` §3 | CONTROLLED at reservation level | Final clear gallery width depends on partitions/envelope. |
| `RHCF-GSVC` | gross service-suite reservation | X 9,100–12,000; Y 3,400–7,400 | mm | RH-02/RH-06 | `ground-floor-development.md` §3; `service-topology-rh06.md` §3 | CONTROLLED | Internal subdivision by RH-06. |
| `RHCF-GPLANT` | plant-room reservation | approx. 2,900 × 2,200 at north end of G-SVC-02 | mm | RH-06 | `service-topology-rh06.md` §3 | PROVISIONAL | Packing not proven; RH-10 says simplify plant before enlarging suite. |
| `RHCF-SERVICE-SOUTH` | utility/WC/service band | approx. 2,900 × 1,800 at south end of G-SVC-02 | mm | RH-06 | `service-topology-rh06.md` §3 | PROVISIONAL | Exact utility/WC partition remains adjustable and must satisfy visitability. |
| `RHCF-SV01` | vertical service reservation | clear approx. 900 × 700; X 9,150–10,050; Y 6,550–7,250 | mm | RH-06 | `service-topology-rh06.md` §5 | PROVISIONAL | Carries wet/dry services; RH-07 adds MVHR trunks subject to MEP proof. Structural opening starting envelope 1,050 × 850 is not an approved size. |
| `RHCF-UF-TOPO` | upper-floor topology | four bedrooms; south stair/landing; east courtyard gallery; north cross-landing; family bathroom east-middle; former en-suite replaced by dressing/linen/storage | relationship | RH-03, locally superseded RH-06 | `upper-floor-and-stair-development.md` §5–7; `service-topology-rh06.md` §7 | CONTROLLED | `U-ENS-01` deleted; `U-DRESS-01` replaces it. |
| `RHCF-U-CIRC` | upper circulation | south stair hall → east courtyard gallery → north cross-landing; no west gallery | relationship | RH-03 | `upper-floor-and-stair-development.md` §4 | CONTROLLED | — |
| `RHCF-U-BATH` | family bathroom reservation | X 9,100–12,000; Y 3,400–7,400 | mm | RH-03 | `upper-floor-and-stair-development.md` §5 | CONTROLLED at gross reservation level | Dry-side service relationship to U-GAL-02 retained by RH-06/RH-09. |
| `RHCF-FFL-G` | ground FFL | ±0 | mm | RH-04 | `plan-section-elevation-gate.md` §2 H1 | CONTROLLED | — |
| `RHCF-CEIL-G` | ground clear ceiling datum | +2,950 | mm | RH-04 | `plan-section-elevation-gate.md` §2 H1 | CONTROLLED | Do not reduce silently if structure deepens. |
| `RHCF-FFL-1` | first-floor FFL | +3,300 | mm | RH-04 | `plan-section-elevation-gate.md` §2 H1 | CONTROLLED | Supersedes RH-03 3,240 mm test datum. |
| `RHCF-FLOOR-ZONE` | ground ceiling→first FFL reservation | 350 | mm | RH-04, tested RH-05 | `plan-section-elevation-gate.md` §2 H1; `structural-coordination.md` §5 | PROVISIONAL | Architectural reservation survives only provisionally; structural/acoustic/fire proof outside RH-C1. |
| `RHCF-CEIL-U` | upper clear ceiling datum | +6,000 | mm | RH-04 | `plan-section-elevation-gate.md` §2 H1 | CONTROLLED | — |
| `RHCF-CORNICE` | outer cornice/eaves control | approx. +6,250 | mm | RH-04 retained through RH-08/RH-10 | `plan-section-elevation-gate.md` §2; `roof-drainage-access-rh08.md` §3 | CONTROLLED at architectural datum level | Roof family later superseded; datum retained. |
| `RHCF-STAIR-N` | principal stair riser count | 18 total; 3 flights × 6 | count | RH-03 retained RH-04 | `upper-floor-and-stair-development.md` §1 | CONTROLLED | — |
| `RHCF-STAIR-G` | principal stair planning going | 280; five goings per flight | mm | RH-03 | `upper-floor-and-stair-development.md` §1 | CONTROLLED | — |
| `RHCF-STAIR-W` | stair clear-width target | approx. 1,000 | mm | RH-03 | `upper-floor-and-stair-development.md` §1 | PROVISIONAL | Technical width/guarding fit unproved. |
| `RHCF-STAIR-BOX` | stair planning reservation | approx. 2,400–2,500 square in western entrance hall | mm | RH-03 | `upper-floor-and-stair-development.md` §3; `stair-ground-floor-overlay.svg` | PROVISIONAL | Exact strings/well/landings not frozen. |
| `RHCF-STAIR-RISE` | planning rise at current FFL | 3,300 / 18 = 183.3 | mm | derived from RH-03 topology + RH-04 FFL | `plan-section-elevation-gate.md` §2 H1 | CONTROLLED derived relationship | Must not be separately authored in RH-C1. |
| `RHCF-FRONT-AXES` | principal front bay axes | X = 1,950 / 4,650 / 7,350 / 10,050; 2,700 spacing | mm | RH-04 | `plan-section-elevation-gate.md` §3 F3 | CONTROLLED | Architectural coordinates; entrance on bay 3. |
| `RHCF-FRONT-ENTRANCE` | principal entrance centreline | X = 7,350 | mm | RH-04 | `plan-section-elevation-gate.md` §3, §10 | CONTROLLED | Snapped to bay 3 without material plan change. |
| `RHCF-FRONT-GW` | principal ground front window family | bays 1/4 width ≈1,050; sill ≈+650–700; head ≈+2,550 | mm | RH-04 | `plan-section-elevation-gate.md` §4 | PROVISIONAL | Coordination dimensions, not final window schedule. |
| `RHCF-FRONT-STW` | ground stair window | bay 2 width ≈900; sill ≈+1,050; head ≈+2,550 | mm | RH-04 | `plan-section-elevation-gate.md` §4 | PROVISIONAL | Sill section-led; centreline axis-led. |
| `RHCF-FRONT-UW` | upper front window family | width ≈900–950; sill ≈800 above first FFL; head ≈2,350 above first FFL; height ≈1,550 | mm | RH-04 | `plan-section-elevation-gate.md` §4 | PROVISIONAL | Bays 1/4 also carry RH-10 escape duty; final free opening outside RH-C1. |
| `RHCF-COURT-NSAXIS` | south/north courtyard principal opening axis | X = 6,000 | mm | RH-04 | `plan-section-elevation-gate.md` §5 | CONTROLLED | Courtyard order is separate from front order. |
| `RHCF-COURT-E` | east courtyard opening order | two-bay aligned ground/upper rhythm | relationship | RH-04 | `plan-section-elevation-gate.md` §5 | CONTROLLED order / OPEN exact centres | Exact coordinates/types intentionally deferred. |
| `RHCF-COURT-W` | west courtyard opening order | two room-owned axes; upper/lower aligned where coherent | relationship | RH-04 | `plan-section-elevation-gate.md` §5 | CONTROLLED order / OPEN exact centres | Exact centres intentionally not fixed. |
| `RHCF-GARDEN-AXES` | north/garden principal axes | X ≈2,100 / 6,000 / 9,900 | mm | RH-10 | `outer-elevation-coordination-rh10.md` §1 | CONTROLLED at composition level | Widths remain technical/G-01 detail. Centre ground opening carries 1,200 mm clear logistics target. |
| `RHCF-EAST-FIELDS` | east/service elevation order | south study/bedroom; middle utility/plant/bath; north kitchen/bedroom | relationship | RH-10 | `outer-elevation-coordination-rh10.md` §2 | CONTROLLED | Technical terminals concentrated in middle field; exact coordinates provisional. |
| `RHCF-WEST-FIELDS` | west elevation order | front drawing/bedroom field + rear family/principal-bedroom field | relationship | RH-10 | `outer-elevation-coordination-rh10.md` §3 | CONTROLLED | Exact opening centres not frozen. |
| `RHCF-WALL-NORMAL` | external/courtyard wall planning family | 400–425 normal planning; plausible geometric family broadly 410–435 | mm | RH-10 | `envelope-coordination-rh10.md` §2–3 | PROVISIONAL | Supersedes RH-02 350 mm allowance. This is planning geometry, not a construction build-up. |
| `RHCF-WALL-STRESS` | whole-house wall-depth stress test | 450 | mm | RH-10 | `envelope-coordination-rh10.md` §3 | PROVISIONAL | Not the canonical wall thickness. >450 materially triggers RH-02/RH-03 rewind. |
| `RHCF-STRUCT-SUPPORT` | primary support lines | outer and courtyard loadbearing inner leaves | relationship | RH-05 | `structural-coordination.md` §2–3 | PROVISIONAL | Pre-engineering structural concept; actual leaf thickness/capacity outside RH-C1. |
| `RHCF-STRUCT-SPANS` | gross floor span logic | west/east ≈4,200 E–W; south/north centre ≈3,400 N–S | mm | RH-05 | `structural-coordination.md` §3 | PROVISIONAL | Structural view context, not member sizing. |
| `RHCF-EDGE-BEAMS` | courtyard support-line continuations | lines X≈4,200 and X≈7,800 through south/north wings; four 3,400-class edge-beam conditions | relationship | RH-05 | `structural-coordination.md` §4 | PROVISIONAL | Sizing and connection design outside RH-C1. |
| `RHCF-ROOF-FAMILY` | roof gross family | four outward-draining very-low-slope fields; diagonal watersheds outer corner→court corner | relationship | RH-08, supersession confirmed RH-10 | `roof-drainage-access-rh08.md` §2; `outer-elevation-coordination-rh10.md` §5 | CONTROLLED family / PROVISIONAL technical geometry | Explicitly supersedes RH-04 pitched-roof preference. |
| `RHCF-ROOF-FALL` | coordination roof fall | ~1:40 class outward from court to perimeter | ratio | RH-08 | `roof-drainage-access-rh08.md` §3 | PROVISIONAL | Not a specification/minimum finished fall. |
| `RHCF-ROOF-CATCH` | roof plan catchment proxies | south/north ≈26.5 m² each; west/east ≈31.1 m² each | m² | derived RH-08 | `roof-drainage-access-rh08.md` §2 | PROVISIONAL derived | Gross plan geometry only. |
| `RHCF-COURT-DRAIN` | court drainage geography | east-side accessible collector; short straight service-side route + independent higher visible overflow | relationship | RH-08 | `roof-drainage-access-rh08.md` §5 | PROVISIONAL | Detailed hydraulic levels/sizes outside RH-C1. |
| `RHCF-PLANT-ACCESS` | plant replacement opening | nominal 1,000 clear target on service side | mm | RH-06 | `service-topology-rh06.md` §3 | PROVISIONAL | Actual equipment/replacement proof outstanding. |
| `RHCF-GARDEN-LOGISTICS` | controlling garden/court logistics opening | 1,200 clear coordination target | mm | RH-08 | `roof-drainage-access-rh08.md` §9 | PROVISIONAL | Door leaf/threshold/product not fixed. |

## Supersession ledger

1. **RH-01 shell width 11.4 m → RH-02 12.0 m.** Courtyard and 10.8 m depth remain.
2. **RH-02 front drawing/hall boundary X=4.2 m → RH-03 X≈4.0 m** for the front-wing depth only.
3. **RH-03 3,240 mm floor-to-floor test datum → RH-04 first FFL +3,300 mm.** The 18-riser topology remains.
4. **RH-03 `U-ENS-01` → RH-06 `U-DRESS-01`.** The remote en-suite is deleted from the active house.
5. **RH-06 local-extract / ventilation-open position → RH-07 central MVHR baseline**, with continuous MEV fallback; major service geography remains.
6. **RH-04 visible pitched-roof preference → RH-08 outward-draining low-slope roof**, explicitly reconciled by RH-10. RH-04 retains cornice/storey/opening authority.
7. **RH-02 350 mm wall planning allowance → RH-10 400–425 mm normal family / 450 mm stress test.** No shell enlargement follows automatically.

## Independent dimensional reconstruction — RH-C0.2

This reconstruction was made from the textual/numeric authorities above before comparing any existing SVG geometry. It is a planning-level semantic reconstruction, not a construction drawing.

### 1. Gross morphology

Starting inputs:

- shell = `12,000 × 10,800`;
- court = `3,600 × 4,000`, centred.

Derived:

- shell plan = `129.60 m²`;
- court plan = `14.40 m²`;
- enclosed gross plate = `129.60 − 14.40 = 115.20 m²`;
- west/east gross ring = `(12,000 − 3,600) / 2 = 4,200 mm`;
- south/north gross ring = `(10,800 − 4,000) / 2 = 3,400 mm`;
- court edges = `X 4,200–7,800`, `Y 3,400–7,400`.

The gross morphology closes exactly. No SVG coordinate is required to obtain it.

### 2. Ground-floor semantic reservation reconstruction

These polygons reproduce the current controlled room/circulation order. They are gross **semantic reservations**, not clear-room dimensions or wall faces. Approximate RH-stage coordinates remain approximate rather than becoming more certain through transcription.

| Object | Reconstructed reservation | Gross reservation area |
|---|---|---:|
| `G-DRAW-02` | X 0–4,000 / Y 0–3,400 **plus** X 0–4,200 / Y 3,400–≈5,000 | ≈20.32 m² |
| `G-FAM-02` | X 0–4,200 / Y ≈5,000–10,800 | ≈24.36 m² |
| `G-HALL-02` | X 4,000–7,800 / Y 0–3,400 | 12.92 m² |
| `G-STUDY-02` | X 9,100–12,000 / Y 0–3,400 | 9.86 m² |
| `G-GAL-01` | X 7,800–9,100 / Y 0–7,400 | 9.62 m² |
| `G-SVC-02` | X 9,100–12,000 / Y 3,400–7,400 | 11.60 m² |
| `G-GARDEN-02` | X 4,200–7,800 / Y 7,400–10,800 | 12.24 m² |
| `G-KIT-02` | X 7,800–12,000 / Y 7,400–10,800 | 14.28 m² |

At the provisional `Y≈5,000` west-room split these reservations total **115.20 m²**, exactly matching the enclosed gross plate. The 200 mm RH-03 hall correction is therefore a local notch in the west-front room, not an unexplained gain/loss of floor field.

`G-SVC-02` then contains the RH-06 internal working split: north `G-PLANT-01 ≈2,900 × 2,200`, south service band `≈2,900 × 1,800`, with exact utility/WC subdivision unresolved.

### 3. Upper-floor semantic reservation reconstruction

The upper floor uses the same shell/court and the RH-03 circulation topology, with RH-06's deletion of the en-suite applied before comparison with drawings.

| Object | Reconstructed reservation | Gross reservation area |
|---|---|---:|
| `U-BED-02` | X 0–4,000 / Y 0–3,400 **plus** X 0–4,200 / Y 3,400–≈5,000 | ≈20.32 m² |
| `U-BED-P01` | X 0–4,200 / Y ≈5,000–10,800 | ≈24.36 m² |
| `U-STAIR-01` | X 4,000–7,800 / Y 0–3,400 | 12.92 m² |
| `U-BED-03` | X 7,800–12,000 / Y 0–3,400 | 14.28 m² |
| `U-GAL-02` | X 7,800–9,100 / Y 3,400–7,400 | 5.20 m² |
| `U-BATH-01` | X 9,100–12,000 / Y 3,400–7,400 | 11.60 m² |
| `U-BED-04` | X 7,800–12,000 / Y 7,400–10,800 | 14.28 m² |
| `U-LAND-N01` | X 4,200–7,800 / Y 7,400–≈8,600 | ≈4.32 m² |
| `U-DRESS-01` | former en-suite dry reservation, approximately X 4,200–6,400 / Y 8,600–10,800 | ≈4.84 m² |
| `U-LIN-01` | approximately X 6,400–7,800 / Y 8,600–10,800 | ≈3.08 m² |

Using the RH-03 approximate `Y≈8,600` and `X≈6,400` dry-space split, the reservations again total **115.20 m²**. The split between `U-DRESS-01` and `U-LIN-01` remains provisional; the important controlled correction is that neither is a wet en-suite.

### 4. Conservative wall-envelope reconstruction

RH-C0.2 does **not** choose one wall thickness from the RH-10 family. It uses the recorded values only as stress cases.

For a ring bounded by two equal envelope faces:

| Planning thickness per face | side-ring clear field | front/rear-ring clear field | Meaning |
|---:|---:|---:|---|
| 400 mm | 3,400 mm | 2,600 mm | lower end of normal planning family |
| 425 mm | 3,350 mm | 2,550 mm | upper end of normal planning family |
| 450 mm | 3,300 mm | 2,500 mm | whole-house geometry stress test |
| 500 mm | 3,200 mm | 2,400 mm | outside current family; rewind-test condition only |

These are ring-depth checks, **not universal room-clear dimensions**. Corner/service rooms often have a lighter internal partition on one side. No single 425/450 mm value becomes an authored construction thickness through this exercise.

### 5. Stair reconstruction

From the controlling RH-03 topology and RH-04 level:

- first-floor rise = `3,300 mm`;
- risers = `18`;
- rise = `3,300 / 18 = 183.33 mm`;
- flights = `3 × 6 rises`;
- goings per flight = `5`;
- going = `280 mm`;
- horizontal run per flight = `5 × 280 = 1,400 mm`;
- vertical increment per six-rise flight = `6 × 183.33 = 1,100 mm`;
- intermediate landing levels therefore occur at approximately `+1,100` and `+2,200 mm` before first FFL `+3,300`;
- `2R + G = 646.67 mm`;
- pitch from rise/going ≈ `33.2°`.

The arithmetic is coherent. The **exact two-dimensional string/well/landing construction is not yet a frozen fact**: RH-03 deliberately leaves a `≈2,400–2,500 mm` coordination reservation and RH-05 only proves conceptual structural compatibility.

### 6. Plan-to-section closure

The controlled section reconstructs as:

- ground FFL `0`;
- ground clear ceiling `+2,950`;
- first FFL `+3,300`;
- ceiling-to-FFL architectural reservation `350`;
- upper clear ceiling `+6,000`;
- first-floor clear occupied height `2,700`;
- cornice/eaves control `≈+6,250`.

The 350 mm floor zone is numerically exact as a **datum difference** but remains technically provisional as a structural/fire/acoustic assembly.

### 7. Axes and major openings

The front composition reconstructs without drawing input from the RH-04 relationship: a four-bay regular field, centred on `X=6,000`, spacing `2,700 mm`. This yields axes:

`1,950 / 4,650 / 7,350 / 10,050 mm`.

Entrance centre = bay 3 = `X 7,350`.

The courtyard north/south principal opening centre derives from the courtyard/shell centre at `X=6,000`. North/garden RH-10 axes remain approximate `2,100 / 6,000 / 9,900`.

RH-04 never fixes numeric east/west courtyard opening centres. Those remain **OPEN** and are not reconstructed by guessing from the SVG.

### 8. Roof reconstruction

The current roof family is reconstructable in plan from controlled geometry:

- connect each outer shell corner to the corresponding courtyard corner to form four diagonal watersheds;
- four roof fields fall **from courtyard edge outward** to the external perimeter;
- no diagonal is a valley;
- court plan remains open to sky.

The resulting gross plan catchments agree with RH-08's approximately `26.5 / 26.5 / 31.1 / 31.1 m²` south/north/west/east split and total `115.2 m²`.

Only the **family and plan topology** are controlled. The ~1:40 fall is a coordination assumption and the exact waterproofing surface/elevation, build-up, parapet/coping and structure remain provisional.

### 9. Comparison with existing drawings

Only after the reconstruction above was complete were the current SVGs inspected. Material differences are recorded in [`rhc0-discrepancy-register.md`](rhc0-discrepancy-register.md).

The important conclusion is that the **textual/current authorities reconstruct one coherent planning-level house**. The discovered conflicts are stale or deliberately scoped representations, not incompatible current design instructions:

- RH-02 ground SVG predates the RH-03 200 mm hall correction;
- RH-03 upper SVG predates RH-06 deletion of `U-ENS-01` and RH-04's +3,300 datum;
- RH-04 section/elevation intentionally show a now-superseded roof silhouette while labelling it non-authoritative;
- older plan drawings are gross-zone diagrams and cannot supply clear wall-face geometry under the RH-10 envelope family.

No independent reconstruction value has been altered to match those SVGs.

## Authority boundary for RH-C1

RH-C1 may eventually encode only facts explicitly released by RH-C0.7. At RH-C0.2 the likely source domain is shell, courtyard, levels, room/circulation topology, stair, major planning walls, principal axes and major opening relationships. Structure, roof, plant and riser facts above are recorded because they constrain interpretation, not because RH-C1 is permitted to make them technically authoritative.

## Open items carried into RH-C0.3+

- Exact east/west courtyard opening centres were never numerically authored by RH-04.
- Several room boundaries are intentionally approximate (`Y≈5.0 m` west split; `Y≈8.6 m` north landing/dry split; exact stair box; utility/WC subdivision).
- Gross opening widths are coordination families rather than final products.
- The 400–425 mm wall family is not one authored thickness and must not be duplicated as several editable geometry values.
- Existing SVGs require explicit geometric-authority classification and controlled comparators at RH-C0.6.

## RH-C0.1 gate result

**PASS.** Every fact expected to matter to the RH-C1 source contract has one identifiable current owning gate or is explicitly marked provisional/open. Known supersessions are recorded rather than silently blended. No engineering, product or real-site assumption has been promoted by the schedule.

## RH-C0.2 gate result

**PASS.** The current authorities independently reconstruct one coherent planning-level house. Remaining numeric gaps are explicitly OPEN/PROVISIONAL and therefore cannot become RH-C1 facts by implication. The drawing discrepancies are registered and will be corrected or demoted before any SVG is admitted as an RH-C1 comparator.