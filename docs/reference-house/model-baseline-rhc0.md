# Reference House — RH-C0 Model Baseline

**Status:** RH-C0.3 authored-vs-derived closure — **PASS**; later RH-C0 stages may refine this file  
**Date:** 2026-10-12  
**Programme:** [`../computational/reference-house-model-freeze-rhc0.md`](../computational/reference-house-model-freeze-rhc0.md)  
**Downstream:** [`../computational/reference-house-executable-slice.md`](../computational/reference-house-executable-slice.md)

This is the canonical pre-compiler fact schedule for the Reference House. It records which current RH authority owns each compiler-bound architectural fact after RH-00→RH-11 supersessions. It is not construction information and does not convert provisional engineering assumptions into evidence.

Coordinates use the current Reference House convention: origin at the south-west outer corner; +X east; +Y north; millimetres unless stated otherwise.

## Status vocabulary

- **CONTROLLED** — current architectural/project fact at the stated scope.
- **PROVISIONAL** — current working fact needed for coordination but still dependent on engineering, simulation, product selection, site or competent review.
- **OPEN** — unresolved enough that RH-C1 must not treat it as source truth.

## Canonical authority / fact schedule

| ID | Semantic subject | Current value / relationship | Unit | Owner | Exact source | Status | Supersession / dependencies |
|---|---|---|---|---|---|---|---|
| `RHCF-SHELL-X` | outer shell width | 12,000 | mm | RH-02 | `ground-floor-development.md` §1, §3 | CONTROLLED | Supersedes RH-01 11,400 mm width. |
| `RHCF-SHELL-Y` | outer shell depth | 10,800 | mm | RH-01 retained by RH-02 | `ground-floor-development.md` §1, §3 | CONTROLLED | Unchanged by RH-02 correction. |
| `RHCF-COURT-X0` | courtyard west edge | X = 4,200 | mm | RH-02 | `ground-floor-development.md` §3 | CONTROLLED | **DERIVED** in the source contract from shell/court dimensions + centred placement. |
| `RHCF-COURT-X1` | courtyard east edge | X = 7,800 | mm | RH-02 | `ground-floor-development.md` §3 | CONTROLLED | **DERIVED** in source contract. |
| `RHCF-COURT-Y0` | courtyard south edge | Y = 3,400 | mm | RH-02 | `ground-floor-development.md` §3 | CONTROLLED | **DERIVED** in source contract. |
| `RHCF-COURT-Y1` | courtyard north edge | Y = 7,400 | mm | RH-02 | `ground-floor-development.md` §3 | CONTROLLED | **DERIVED** in source contract. |
| `RHCF-COURT-SIZE` | courtyard gross size | 3,600 × 4,000; centred in shell | mm | RH-02 | `ground-floor-development.md` §1, §3 | CONTROLLED | Environmental role refined by RH-07; geometry unchanged. |
| `RHCF-WING-WE` | west/east gross wing depth | 4,200 each | mm | derived from RH-02 morphology | `ground-floor-development.md` §1 | CONTROLLED | DERIVED from shell/court. |
| `RHCF-WING-SN` | south/north gross wing depth | 3,400 each | mm | derived from RH-02 morphology | `ground-floor-development.md` §1 | CONTROLLED | DERIVED from shell/court. |
| `RHCF-PLATE` | enclosed gross plate proxy | 115.2/storey; 230.4 two storeys | m² | derived from RH-02 shell/court | `ground-floor-development.md` §1 | CONTROLLED | DERIVED gross proxy only; not GIA/NIA. |
| `RHCF-GF-TOPO` | ground-floor topology | west front drawing; west rear family; south centre hall/stair; east inner gallery; south-east study; east-middle service suite; north-centre garden dining; north-east kitchen | relationship | RH-02, locally RH-03 | `ground-floor-development.md` §3; `upper-floor-and-stair-development.md` §3 | CONTROLLED | RH-03 moves only front drawing/hall boundary. |
| `RHCF-GDRAW-SPLIT` | west drawing/family split | Y ≈ 5,000; adjustable by a few hundred mm | mm | RH-02 | `ground-floor-development.md` §3 | PROVISIONAL | Nominal fixture coordinate is a PROVISIONAL ASSUMPTION, not false exactness. |
| `RHCF-HALL-WEST` | front drawing/hall boundary | X ≈ 4,000 for front-wing depth only | mm | RH-03 | `upper-floor-and-stair-development.md` §3; `stair-ground-floor-overlay.svg` | CONTROLLED at planning level | Nominal fixture coordinate is PROVISIONAL because source says approximately 200 mm shift. |
| `RHCF-GAL-X0` | east gallery west edge | X = 7,800 | mm | RH-02 | `ground-floor-development.md` §3 | CONTROLLED | DERIVED from court east edge. |
| `RHCF-GAL-X1` | east gallery / outer service-strip boundary | X = 9,100 | mm | RH-02 | `ground-floor-development.md` §3 | CONTROLLED at reservation level | AUTHORED planning reservation line. |
| `RHCF-GSVC` | gross service-suite reservation | X 9,100–12,000; Y 3,400–7,400 | mm | RH-02/RH-06 | `ground-floor-development.md` §3; `service-topology-rh06.md` §3 | CONTROLLED | Polygon DERIVED from shell/court/gallery partition lines. |
| `RHCF-GPLANT` | plant-room reservation | approx. 2,900 × 2,200 at north end of G-SVC-02 | mm | RH-06 | `service-topology-rh06.md` §3 | PROVISIONAL | OUTSIDE RH-C1 initial geometric source. |
| `RHCF-SERVICE-SOUTH` | utility/WC/service band | approx. 2,900 × 1,800 at south end of G-SVC-02 | mm | RH-06 | `service-topology-rh06.md` §3 | PROVISIONAL | OUTSIDE RH-C1 initial geometric source. |
| `RHCF-SV01` | vertical service reservation | clear approx. 900 × 700; X 9,150–10,050; Y 6,550–7,250 | mm | RH-06 | `service-topology-rh06.md` §5 | PROVISIONAL | OUTSIDE RH-C1 initial geometric source; capacity unproved. |
| `RHCF-UF-TOPO` | upper-floor topology | four bedrooms; south stair/landing; east courtyard gallery; north cross-landing; family bathroom east-middle; former en-suite replaced by dressing/linen/storage | relationship | RH-03, locally superseded RH-06 | `upper-floor-and-stair-development.md` §5–7; `service-topology-rh06.md` §7 | CONTROLLED | `U-ENS-01` deleted; `U-DRESS-01` replaces it. |
| `RHCF-U-CIRC` | upper circulation | south stair hall → east courtyard gallery → north cross-landing; no west gallery | relationship | RH-03 | `upper-floor-and-stair-development.md` §4 | CONTROLLED | AUTHORED topology. |
| `RHCF-U-BATH` | family bathroom reservation | X 9,100–12,000; Y 3,400–7,400 | mm | RH-03 | `upper-floor-and-stair-development.md` §5 | CONTROLLED at gross reservation level | Polygon DERIVED from shell/court/gallery partition lines. |
| `RHCF-FFL-G` | ground FFL | ±0 | mm | RH-04 | `plan-section-elevation-gate.md` §2 H1 | CONTROLLED | AUTHORED datum. |
| `RHCF-CEIL-G` | ground clear ceiling datum | +2,950 | mm | RH-04 | `plan-section-elevation-gate.md` §2 H1 | CONTROLLED | AUTHORED datum. |
| `RHCF-FFL-1` | first-floor FFL | +3,300 | mm | RH-04 | `plan-section-elevation-gate.md` §2 H1 | CONTROLLED | AUTHORED; supersedes RH-03 3,240 mm test datum. |
| `RHCF-FLOOR-ZONE` | ground ceiling→first FFL reservation | 350 | mm | RH-04, tested RH-05 | `plan-section-elevation-gate.md` §2 H1; `structural-coordination.md` §5 | PROVISIONAL | DERIVED datum difference `3300−2950`; technical adequacy remains provisional. |
| `RHCF-CEIL-U` | upper clear ceiling datum | +6,000 | mm | RH-04 | `plan-section-elevation-gate.md` §2 H1 | CONTROLLED | AUTHORED datum. |
| `RHCF-CORNICE` | outer cornice/eaves control | approx. +6,250 | mm | RH-04 retained through RH-08/RH-10 | `plan-section-elevation-gate.md` §2; `roof-drainage-access-rh08.md` §3 | CONTROLLED at architectural datum level | PROVISIONAL ASSUMPTION for executable representation because source is approximate. |
| `RHCF-STAIR-N` | principal stair riser count | 18 total; 3 flights × 6 | count | RH-03 retained RH-04 | `upper-floor-and-stair-development.md` §1 | CONTROLLED | AUTHORED stair topology. |
| `RHCF-STAIR-G` | principal stair planning going | 280; five goings per flight | mm | RH-03 | `upper-floor-and-stair-development.md` §1 | CONTROLLED | AUTHORED going; run DERIVED. |
| `RHCF-STAIR-W` | stair clear-width target | approx. 1,000 | mm | RH-03 | `upper-floor-and-stair-development.md` §1 | PROVISIONAL | PROVISIONAL ASSUMPTION; technical fit unproved. |
| `RHCF-STAIR-BOX` | stair planning reservation | approx. 2,400–2,500 square in western entrance hall | mm | RH-03 | `upper-floor-and-stair-development.md` §3; `stair-ground-floor-overlay.svg` | PROVISIONAL | PROVISIONAL ASSUMPTION; not a duplicate source for run/width. |
| `RHCF-STAIR-RISE` | planning rise at current FFL | 3,300 / 18 = 183.3 | mm | derived from RH-03 topology + RH-04 FFL | `plan-section-elevation-gate.md` §2 H1 | CONTROLLED derived relationship | DERIVED only. |
| `RHCF-FRONT-AXES` | principal front bay axes | X = 1,950 / 4,650 / 7,350 / 10,050; 2,700 spacing | mm | RH-04 | `plan-section-elevation-gate.md` §3 F3 | CONTROLLED | Axes become DERIVED from authored centred 4-bay field + 2,700 spacing. |
| `RHCF-FRONT-ENTRANCE` | principal entrance centreline | X = 7,350 | mm | RH-04 | `plan-section-elevation-gate.md` §3, §10 | CONTROLLED | DERIVED from authored entrance bay index 3. |
| `RHCF-FRONT-GW` | principal ground front window family | bays 1/4 width ≈1,050; sill ≈+650–700; head ≈+2,550 | mm | RH-04 | `plan-section-elevation-gate.md` §4 | PROVISIONAL | PROVISIONAL ASSUMPTION / range; centres DERIVED from bay axes. |
| `RHCF-FRONT-STW` | ground stair window | bay 2 width ≈900; sill ≈+1,050; head ≈+2,550 | mm | RH-04 | `plan-section-elevation-gate.md` §4 | PROVISIONAL | Size/sill PROVISIONAL; centre DERIVED from bay 2. |
| `RHCF-FRONT-UW` | upper front window family | width ≈900–950; sill ≈800 above first FFL; head ≈2,350 above first FFL; height ≈1,550 | mm | RH-04 | `plan-section-elevation-gate.md` §4 | PROVISIONAL | Size family PROVISIONAL; centres DERIVED from axes. |
| `RHCF-COURT-NSAXIS` | south/north courtyard principal opening axis | X = 6,000 | mm | RH-04 | `plan-section-elevation-gate.md` §5 | CONTROLLED | DERIVED from centred court; opening-centred-on-axis relationship AUTHORED. |
| `RHCF-COURT-E` | east courtyard opening order | two-bay aligned ground/upper rhythm | relationship | RH-04 | `plan-section-elevation-gate.md` §5 | CONTROLLED order / OPEN exact centres | AUTHORED qualitative order; numeric centres OUTSIDE RH-C1 until authored. |
| `RHCF-COURT-W` | west courtyard opening order | two room-owned axes; upper/lower aligned where coherent | relationship | RH-04 | `plan-section-elevation-gate.md` §5 | CONTROLLED order / OPEN exact centres | AUTHORED qualitative order; numeric centres OUTSIDE RH-C1 until authored. |
| `RHCF-GARDEN-AXES` | north/garden principal axes | X ≈2,100 / 6,000 / 9,900 | mm | RH-10 | `outer-elevation-coordination-rh10.md` §1 | CONTROLLED at composition level | PROVISIONAL centred 3-axis field at ≈3,900 spacing; numeric axes DERIVED for representation. |
| `RHCF-EAST-FIELDS` | east/service elevation order | south study/bedroom; middle utility/plant/bath; north kitchen/bedroom | relationship | RH-10 | `outer-elevation-coordination-rh10.md` §2 | CONTROLLED | AUTHORED qualitative field order; exact opening coordinates not first-slice facts. |
| `RHCF-WEST-FIELDS` | west elevation order | front drawing/bedroom field + rear family/principal-bedroom field | relationship | RH-10 | `outer-elevation-coordination-rh10.md` §3 | CONTROLLED | AUTHORED qualitative field order; exact opening coordinates not first-slice facts. |
| `RHCF-WALL-NORMAL` | external/courtyard wall planning family | 400–425 normal planning; plausible geometric family broadly 410–435 | mm | RH-10 | `envelope-coordination-rh10.md` §2–3 | PROVISIONAL | PROVISIONAL ASSUMPTION as a range; no single hidden thickness source. |
| `RHCF-WALL-STRESS` | whole-house wall-depth stress test | 450 | mm | RH-10 | `envelope-coordination-rh10.md` §3 | PROVISIONAL | PROVISIONAL ASSUMPTION/test parameter; never a second wall-thickness authority. |
| `RHCF-STRUCT-SUPPORT` | primary support lines | outer and courtyard loadbearing inner leaves | relationship | RH-05 | `structural-coordination.md` §2–3 | PROVISIONAL | OUTSIDE RH-C1; structural concept only. |
| `RHCF-STRUCT-SPANS` | gross floor span logic | west/east ≈4,200 E–W; south/north centre ≈3,400 N–S | mm | RH-05 | `structural-coordination.md` §3 | PROVISIONAL | OUTSIDE RH-C1; geometry is derivable from shell/court if later needed. |
| `RHCF-EDGE-BEAMS` | courtyard support-line continuations | lines X≈4,200 and X≈7,800 through south/north wings; four 3,400-class edge-beam conditions | relationship | RH-05 | `structural-coordination.md` §4 | PROVISIONAL | OUTSIDE RH-C1. |
| `RHCF-ROOF-FAMILY` | roof gross family | four outward-draining very-low-slope fields; diagonal watersheds outer corner→court corner | relationship | RH-08, supersession confirmed RH-10 | `roof-drainage-access-rh08.md` §2; `outer-elevation-coordination-rh10.md` §5 | CONTROLLED family / PROVISIONAL technical geometry | AUTHORED gross topology; field polygons DERIVED from shell/court. |
| `RHCF-ROOF-FALL` | coordination roof fall | ~1:40 class outward from court to perimeter | ratio | RH-08 | `roof-drainage-access-rh08.md` §3 | PROVISIONAL | PROVISIONAL ASSUMPTION; not a specification. |
| `RHCF-ROOF-CATCH` | roof plan catchment proxies | south/north ≈26.5 m² each; west/east ≈31.1 m² each | m² | derived RH-08 | `roof-drainage-access-rh08.md` §2 | PROVISIONAL derived | DERIVED from field polygons. |
| `RHCF-COURT-DRAIN` | court drainage geography | east-side accessible collector; short straight service-side route + independent higher visible overflow | relationship | RH-08 | `roof-drainage-access-rh08.md` §5 | PROVISIONAL | OUTSIDE RH-C1 initial geometric slice. |
| `RHCF-PLANT-ACCESS` | plant replacement opening | nominal 1,000 clear target on service side | mm | RH-06 | `service-topology-rh06.md` §3 | PROVISIONAL | OUTSIDE RH-C1; actual equipment proof outstanding. |
| `RHCF-GARDEN-LOGISTICS` | controlling garden/court logistics opening | 1,200 clear coordination target | mm | RH-08 | `roof-drainage-access-rh08.md` §9 | PROVISIONAL | PROVISIONAL opening obligation; exact doorset outside RH-C1. |

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

### Gross morphology

- shell plan = `12,000 × 10,800 = 129.60 m²`;
- court plan = `3,600 × 4,000 = 14.40 m²`;
- enclosed gross plate = `115.20 m²`;
- west/east gross ring = `(12,000 − 3,600) / 2 = 4,200 mm`;
- south/north gross ring = `(10,800 − 4,000) / 2 = 3,400 mm`;
- court edges = `X 4,200–7,800`, `Y 3,400–7,400`.

The gross morphology closes exactly without drawing input.

### Ground-floor semantic reservations

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

At nominal `Y≈5,000` the reservations total **115.20 m²**. These are semantic reservation polygons, not clear wall-face dimensions.

### Upper-floor semantic reservations

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
| `U-DRESS-01` | former en-suite dry reservation, approx. X 4,200–6,400 / Y 8,600–10,800 | ≈4.84 m² |
| `U-LIN-01` | approx. X 6,400–7,800 / Y 8,600–10,800 | ≈3.08 m² |

At the nominal approximate dry-space split the upper reservations also total **115.20 m²**.

### Conservative wall-envelope reconstruction

| Planning thickness per face | side-ring clear field | front/rear-ring clear field | Meaning |
|---:|---:|---:|---|
| 400 mm | 3,400 mm | 2,600 mm | lower end of normal planning family |
| 425 mm | 3,350 mm | 2,550 mm | upper end of normal planning family |
| 450 mm | 3,300 mm | 2,500 mm | whole-house geometry stress test |
| 500 mm | 3,200 mm | 2,400 mm | outside current family; rewind-test condition only |

These are ring-depth checks, not universal room-clear dimensions.

### Stair reconstruction

- first-floor rise = `3,300 mm`;
- risers = `18` → rise `183.33 mm`;
- 3 flights × 6 rises;
- five `280 mm` goings per flight → run `1,400 mm`;
- intermediate levels `+1,100` and `+2,200 mm`;
- `2R + G = 646.67 mm`;
- pitch ≈ `33.2°`.

Exact string/well/landing construction remains provisional.

### Plan-to-section closure

- ground FFL `0`;
- ground clear ceiling `+2,950`;
- first FFL `+3,300`;
- derived datum gap `350`;
- upper clear ceiling `+6,000`;
- derived upper clear height `2,700`;
- cornice/eaves control `≈+6,250`.

### Axes, openings and roof

The RH-04 front rule is independently reconstructable as a centred four-bay field with 2,700 mm spacing; its axes are `1,950 / 4,650 / 7,350 / 10,050`. Entrance centre is bay 3 (`7,350`). Courtyard north/south principal openings centre on shell/court X=`6,000`. Exact east/west court opening centres remain OPEN.

The RH-08 roof plan derives from four outer-corner→court-corner diagonal watersheds and gives the recorded approx. `26.5 / 26.5 / 31.1 / 31.1 m²` field split. Roof build-up and exact vertical surface remain provisional.

Only after this reconstruction was complete were SVGs compared. Material differences are recorded in [`rhc0-discrepancy-register.md`](rhc0-discrepancy-register.md). No reconstructed value was changed to match an SVG.

## Authored vs derived closure — RH-C0.3

The compiler fixture must encode **design intent once**. The current documents often state both a relationship and its consequences for human readability; RH-C1 must not make both independently editable.

### Classification vocabulary

- **AUTHORED** — intentional Reference House input.
- **DERIVED** — deterministic consequence of authored/provisional source inputs.
- **EVIDENCE-BACKED** — externally/imported result tied to declared source facts. There are **no EVIDENCE-BACKED values in the first RH-C1 architectural geometry source**; later specialist evidence remains external and staleable.
- **PROVISIONAL ASSUMPTION** — useful current source value/relationship whose authority remains explicitly provisional.
- **OUTSIDE RH-C1** — deliberately not part of the first executable slice.

### RH-C1 source authorship schedule

| Source subject | Classification | Canonical source expression | Derived consequences / notes |
|---|---|---|---|
| shell width/depth | AUTHORED | `width=12000`, `depth=10800` | shell area and shell centre derived |
| court width/depth | AUTHORED | `width=3600`, `depth=4000` | court area derived |
| court placement | AUTHORED | `centredInShell=true` | court X/Y edges and all four gross wing depths derived; **do not author court edges separately** |
| coordinate handedness for fixture | AUTHORED | origin SW; +X east; +Y north; front surrogate south | project-fixture convention, not House Kernel doctrine |
| ground room/circulation topology | AUTHORED | named adjacency/order from RH-02/RH-03 | room reservation polygons consume partition lines below |
| upper room/circulation topology | AUTHORED | four bedrooms + U-shaped south/east/north circulation + bathroom + dry dressing/storage | no wet `U-ENS-01` source object exists |
| east gallery/service partition | AUTHORED | `X=9100` | gallery/service room polygons derived; gallery west edge derives from court east edge |
| west room split | PROVISIONAL ASSUMPTION | nominal `Y=5000` because RH-02 says `≈5.0 m`, adjustable | west room polygons/areas derived; source must preserve provisional status |
| front hall/drawing local shift | PROVISIONAL ASSUMPTION | nominal `X=4000` south of court because RH-03 says `≈200 mm` shift | local notched room polygons derived |
| north landing/dry-space split | PROVISIONAL ASSUMPTION | nominal `Y=8600`, dry split `X=6400` | landing/dressing/linen polygons derived; exact joinery/partition may move |
| ground FFL | AUTHORED | `0` | level reference |
| first FFL | AUTHORED | `3300` | stair rise and floor-to-floor derived |
| ground clear ceiling | AUTHORED | `2950` | floor/service zone `350` derived |
| upper clear ceiling | AUTHORED | `6000` | upper clear height `2700` derived |
| cornice/eaves control | PROVISIONAL ASSUMPTION | nominal `6250`, retaining `≈` authority | roof/interface representation only; not technical build-up |
| riser count | AUTHORED | `18`; grouped `3 × 6` | rise, intermediate landing levels derived |
| stair going | AUTHORED | `280`; `5` goings/flight | run, pitch, `2R+G` derived |
| stair clear width | PROVISIONAL ASSUMPTION | target `≈1000` | not proof of technical clear width |
| stair planning reservation | PROVISIONAL ASSUMPTION | `≈2400–2500` square | not an independent source for rise/run |
| front façade field | AUTHORED | `count=4`, `spacing=2700`, `centre=shell centre X` | axes `1950/4650/7350/10050` derived; **do not author four coordinates separately** |
| principal entrance bay | AUTHORED | `bayIndex=3` | entrance centre `X=7350` derived |
| front opening centres | DERIVED | from declared bay membership | widths/sills/heads remain provisional families |
| front major opening size families | PROVISIONAL ASSUMPTION | RH-04 ranges/nominals by opening role | product/free-opening geometry outside RH-C1 |
| courtyard north/south opening relationship | AUTHORED | centred on courtyard X axis | centre `X=6000` derived |
| east/west courtyard opening order | AUTHORED qualitative relationship | east = two-bay vertically aligned; west = two room-owned axes | exact numeric centres **OUTSIDE RH-C1** until an owning gate authors them; never infer from pixels |
| garden elevation field | PROVISIONAL ASSUMPTION | three axes, centred, spacing `≈3900` | approx. `2100/6000/9900` derived for representation; exact widths not source truth |
| wall planning family | PROVISIONAL ASSUMPTION | normal range `400–425`; stress parameter `450` | clear-field stress calculations derived; **no hidden single wall thickness** |
| gross roof topology | AUTHORED | four outward-falling fields; corner-to-court-corner watersheds | field plan polygons derived from shell/court |
| roof coordination fall | PROVISIONAL ASSUMPTION | `≈1:40 class` | local rises/catchment relations derived; not a technical specification |
| structural support/member data | OUTSIDE RH-C1 | — | RH-C2 owns future structural view; no member size/support capacity becomes C1 source |
| plant / utility subdivision / `SV-01` | OUTSIDE RH-C1 | — | recorded in baseline for architectural constraints; RH-C3 owns future service view |
| final window/door product geometry | OUTSIDE RH-C1 | — | frame, clear opening, reveal, threshold and replacement detail remain technical/product work |
| final envelope build-up / thermal data | OUTSIDE RH-C1 | — | no U-value, ψ-value, inner-leaf size or insulation becomes C1 truth |

### Dependency paths that RH-C1 must preserve

```text
shell.width + shell.depth
  ├─> shell.area
  ├─> shell.centre
  └─> court placement reference

court.width + court.depth + centredInShell + shell
  ├─> court edges
  ├─> court.area
  ├─> west/east/front/rear gross wing depths
  └─> roof field vertices

shell/court edges + authored/provisional partition lines + room topology
  ├─> room reservation polygons
  └─> room reservation areas

firstFloorFFL + stair.riserCount
  ├─> stair.rise
  ├─> flight landing levels
  ├─> stair pitch (with going)
  └─> 2R+G (with going)

stair.going + goingsPerFlight
  └─> flight run

frontField.count + frontField.spacing + shell.centreX
  ├─> front bay axes
  ├─> window centres by bay membership
  └─> entrance centre via entranceBayIndex

groundCeiling + firstFloorFFL
  └─> inter-storey architectural reservation

firstFloorFFL + upperCeiling
  └─> upper clear height

shell/court vertices + roof topology
  ├─> four roof-field polygons
  └─> plan catchment areas
```

### Duplicated authorship eliminated

The following values remain visible in documentation but are **not independent editable source facts**:

- courtyard edge coordinates;
- wing depths;
- enclosed plate area;
- room polygon coordinates wherever they are consequences of shell/court/partition inputs;
- 350 mm floor-zone depth;
- 2,700 mm upper clear height;
- stair rise, run, landing levels, pitch and `2R+G`;
- four front bay-axis coordinates;
- principal entrance centreline;
- front opening centres where bay membership controls them;
- roof field polygons and catchment areas.

A future compiler may report all of these, but editing them directly would be a model error.

## Authority boundary for RH-C1

RH-C1 may encode only facts explicitly released by RH-C0.7 as `FROZEN_FOR_RH_C1` or deliberately `PROVISIONAL_BUT_REPRESENTABLE`. The authorship schedule above defines **how** a released fact enters the model, not whether it has earned final freeze status yet.

## Open items carried forward

- Exact east/west courtyard opening centres remain un-authored and therefore outside the first source unless RH-C0.6 demonstrates a need for an RH-04 correction.
- `Y≈5.0 m`, `X≈4.0 m`, `Y≈8.6 m` and `X≈6.4 m` are nominal fixture coordinates with explicit provisional authority, not silently upgraded dimensions.
- Gross opening widths remain coordination families rather than final products.
- The 400–425 mm wall family is a range; 450 mm is a stress parameter, not a competing source thickness.
- Existing SVGs still require RH-C0.6 comparator replacement/classification.

## RH-C0.1 gate result

**PASS.** Every fact expected to matter to the RH-C1 source contract has one identifiable current owning gate or is explicitly marked provisional/open.

## RH-C0.2 gate result

**PASS.** The current authorities independently reconstruct one coherent planning-level house. Drawing discrepancies are registered rather than absorbed into the reconstruction.

## RH-C0.3 gate result

**PASS.** Every first-slice fact now has one authorship role and a dependency path. No physical relationship is knowingly editable from two independent sources. Values stated redundantly in the architectural documents are explicitly consequences in the executable contract, and provisional values remain labelled provisional rather than becoming exact through coding.