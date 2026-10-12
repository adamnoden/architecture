# Reference House — RH-C0 Model Baseline

**Status:** RH-C0.1 authority consolidation — PASS; later RH-C0 stages may refine this file  
**Date:** 2026-10-12  
**Programme:** [`../computational/reference-house-model-freeze-rhc0.md`](../computational/reference-house-model-freeze-rhc0.md)  
**Downstream:** [`../computational/reference-house-executable-slice.md`](../computational/reference-house-executable-slice.md)

This is the canonical pre-compiler fact schedule for the Reference House. It records which current RH authority owns each compiler-bound architectural fact after RH-00→RH-11 supersessions. It is not construction information and does not convert provisional engineering assumptions into evidence.

Coordinates use the current Reference House convention: origin at the south-west outer corner; +X east; +Y north; millimetres unless stated otherwise.

## Status vocabulary

- **CONTROLLED** — current architectural/project fact at the stated scope.
- **PROVISIONAL** — current working fact needed for coordination but still dependent on engineering, simulation, product selection, site or competent review.
- **OPEN** — unresolved enough that RH-C1 must not treat it as source truth.

The later RH-C0.3/RH-C0.7 classifications (`AUTHORED`, `DERIVED`, etc.; `FROZEN_FOR_RH_C1`, etc.) will be added only after reconstruction and dependency review.

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
| `RHCF-FRONT-ENTRANCE` | principal entrance centreline | X = 7,350 | mm | RH-04 | `plan-section-elevation-gate.md` §3, §10 | CONTROLLED | Snapped to bay 3 without room-order change. |
| `RHCF-FRONT-GW` | principal ground front window family | bays 1/4 width ≈1,050; sill ≈+650–700; head ≈+2,550 | mm | RH-04 | `plan-section-elevation-gate.md` §4 | PROVISIONAL | Coordination dimensions, not final window schedule. |
| `RHCF-FRONT-STW` | ground stair window | bay 2 width ≈900; sill ≈+1,050; head ≈+2,550 | mm | RH-04 | `plan-section-elevation-gate.md` §4 | PROVISIONAL | Sill section-led; centreline axis-led. |
| `RHCF-FRONT-UW` | upper front window family | width ≈900–950; sill ≈800 above first FFL; head ≈2,350 above first FFL; height ≈1,550 | mm | RH-04 | `plan-section-elevation-gate.md` §4 | PROVISIONAL | Bays 1/4 also carry RH-10 escape duty; final free opening outside RH-C1. |
| `RHCF-COURT-NSAXIS` | south/north courtyard principal opening axis | X = 6,000 | mm | RH-04 | `plan-section-elevation-gate.md` §5 | CONTROLLED | Courtyard order is separate from front order. |
| `RHCF-COURT-E` | east courtyard opening order | two-bay aligned ground/upper rhythm | relationship | RH-04 | `plan-section-elevation-gate.md` §5 | CONTROLLED order / OPEN exact centres | Exact coordinates/types were intentionally deferred. RH-C1 must not invent numeric centres until RH-C0.6 decides comparator scope. |
| `RHCF-COURT-W` | west courtyard opening order | two room-owned axes; upper/lower aligned where coherent | relationship | RH-04 | `plan-section-elevation-gate.md` §5 | CONTROLLED order / OPEN exact centres | Exact centres intentionally not fixed. |
| `RHCF-GARDEN-AXES` | north/garden principal axes | X ≈2,100 / 6,000 / 9,900 | mm | RH-10 | `outer-elevation-coordination-rh10.md` §1 | CONTROLLED at composition level | Widths remain technical/G-01 detail. Centre ground opening carries 1,200 mm clear logistics target. |
| `RHCF-EAST-FIELDS` | east/service elevation order | south study/bedroom; middle utility/plant/bath; north kitchen/bedroom | relationship | RH-10 | `outer-elevation-coordination-rh10.md` §2 | CONTROLLED | Technical terminals concentrated in middle field; exact coordinates provisional. |
| `RHCF-WEST-FIELDS` | west elevation order | front drawing/bedroom field + rear family/principal-bedroom field | relationship | RH-10 | `outer-elevation-coordination-rh10.md` §3 | CONTROLLED | Exact opening centres not frozen. |
| `RHCF-WALL-NORMAL` | external/courtyard wall planning family | 400–425 normal planning; plausible geometric family broadly 410–435 | mm | RH-10 | `envelope-coordination-rh10.md` §2–3 | PROVISIONAL | Supersedes RH-02 350 mm allowance. This is planning geometry, not a construction build-up. |
| `RHCF-WALL-STRESS` | whole-house wall-depth stress test | 450 | mm | RH-10 | `envelope-coordination-rh10.md` §3 | PROVISIONAL | Not the canonical wall thickness. >450 materially triggers RH-02/RH-03 rewind. |
| `RHCF-STRUCT-SUPPORT` | primary support lines | outer and courtyard loadbearing inner leaves | relationship | RH-05 | `structural-coordination.md` §2–3 | PROVISIONAL | Pre-engineering structural concept; actual leaf thickness/capacity outside RH-C1. |
| `RHCF-STRUCT-SPANS` | gross floor span logic | west/east ≈4,200 E–W; south/north centre ≈3,400 N–S | mm | RH-05 | `structural-coordination.md` §3 | PROVISIONAL | Structural view context, not member sizing. |
| `RHCF-EDGE-BEAMS` | courtyard support-line continuations | lines X≈4,200 and X≈7,800 through south/north wings; four 3,400-class edge-beam conditions | relationship | RH-05 | `structural-coordination.md` §4 | PROVISIONAL | RH-C1 should represent only if needed to interpret architectural geometry; sizing outside slice. |
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
5. **RH-06 local extract-only ventilation position → RH-07 central MVHR baseline**, with continuous MEV fallback; major service geography remains.
6. **RH-04 visible pitched-roof preference → RH-08 outward-draining low-slope roof**, explicitly reconciled by RH-10. RH-04 retains cornice/storey/opening authority.
7. **RH-02 350 mm wall planning allowance → RH-10 400–425 mm normal family / 450 mm stress test.** No shell enlargement follows automatically.

## Authority boundary for RH-C1

RH-C1 may eventually encode only facts explicitly released by RH-C0.7. At RH-C0.1 the likely source domain is shell, courtyard, levels, room/circulation topology, stair, major planning walls, principal axes and major opening relationships. Structure, roof, plant and riser facts above are recorded because they constrain interpretation, not because RH-C1 is permitted to make them technically authoritative.

## Open items carried into RH-C0.2

- Exact east/west courtyard opening centres were never numerically authored by RH-04.
- Several room boundaries are intentionally approximate (`Y≈5.0 m` west split; exact stair box; utility/WC subdivision).
- Gross opening widths are coordination families rather than final products.
- The 400–425 mm wall family is not one authored thickness; independent reconstruction must use an explicit conservative test value without turning it into a frozen build-up.
- The current drawing set mixes geometric authorities, overlays and explanatory diagrams; RH-C0.2/RH-C0.6 must classify and reconcile them.

## RH-C0.1 gate result

**PASS.** Every fact expected to matter to the RH-C1 source contract now has one identifiable current owning gate or is explicitly marked provisional/open. Known supersessions are recorded rather than silently blended. No engineering, product or real-site assumption has been promoted by this schedule.