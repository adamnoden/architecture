# Reference House — RH-C0 Model Baseline

**Status:** **RH-C0 PASS — controlled pre-compiler fixture frozen; HFI-08B stair fact refreshed**  
**Date:** 2026-10-12; HFI-08B refresh 2026-10-19  
**Reference House maturity:** **M3 — Coordinated at virtual-design scope (unchanged)**  
**Programme:** [`../computational/reference-house-model-freeze-rhc0.md`](../computational/reference-house-model-freeze-rhc0.md)  
**Downstream:** [`../computational/reference-house-executable-slice.md`](../computational/reference-house-executable-slice.md)

This document is the canonical pre-compiler baseline for the current Reference House. RH-C1 must consume this baseline rather than copying values from historical drawings, prose summaries or chat.

The freeze proves a narrower claim than construction readiness:

> **we now know which virtual house the first executable fixture means, which facts own it, which facts are consequences, and which uncertainties must remain visibly provisional or outside the slice.**

RH-C0 does **not** validate structural adequacy, fire safety, acoustics, building physics, MEP capacity, products, workmanship, site response or regulatory compliance. TypeScript must not confer authority those things have not earned.

Coordinates use the fixture convention: origin at the south-west outer corner; +X east; +Y north; front/street surrogate south. This convention belongs to this fixture, not House Kernel doctrine.

HFI-08B changes exactly one controlled stair source fact in the canonical fixture: `RHCF-STAIR-G` goes from 280 to **300 mm**. The riser topology, storey datums, stair reservation and all non-stair source facts remain unchanged; run, pitch and `2R+G` remain derived consequences.

---

# 1. Freeze vocabulary

## Authority status

- **CONTROLLED** — current architectural/project fact at the stated scope.
- **PROVISIONAL** — current working fact needed for coordination but dependent on later design, engineering, simulation, product, site or review evidence.
- **OPEN** — deliberately unresolved; RH-C1 must not invent a value.

## Authorship

- **AUTHORED** — intentional Reference House source input.
- **DERIVED** — deterministic consequence of source inputs; never independently editable.
- **PROVISIONAL ASSUMPTION** — useful current source input whose uncertainty must survive encoding.
- **EVIDENCE-BACKED** — imported specialist result with explicit evidence dependency. **None belong in the first RH-C1 architectural source.**
- **OUTSIDE RH-C1** — not part of the first executable slice.

## Freeze disposition

- **FROZEN_FOR_RH_C1** — stable enough to be canonical regression-fixture truth at the stated architectural scope.
- **PROVISIONAL_BUT_REPRESENTABLE** — may be encoded or drawn because the current fixture depends on it, but its provisional authority must remain explicit.
- **OUTSIDE_RH_C1** — must not become first-slice source truth.

A **DERIVED** fact can be `FROZEN_FOR_RH_C1`: that means its relationship is frozen, not that the result becomes independently editable.

---

# 2. Canonical fact / authority / freeze schedule

| ID | Subject | Current value / relationship | Owner | Authorship | Freeze disposition | Notes / dependency |
|---|---|---|---|---|---|---|
| `RHCF-COORD` | fixture coordinates | origin SW; +X east; +Y north; south = front surrogate | RH-C0 | AUTHORED | FROZEN_FOR_RH_C1 | fixture convention only |
| `RHCF-SHELL-X` | outer shell width | `12,000 mm` | RH-02 | AUTHORED | FROZEN_FOR_RH_C1 | supersedes RH-01 11,400 |
| `RHCF-SHELL-Y` | outer shell depth | `10,800 mm` | RH-01 retained RH-02 | AUTHORED | FROZEN_FOR_RH_C1 | — |
| `RHCF-COURT-SIZE` | court gross geometry | `3,600 × 4,000 mm`, centred in shell | RH-02 | AUTHORED | FROZEN_FOR_RH_C1 | size + centred relationship are source |
| `RHCF-COURT-X0/X1` | court west/east edges | `4,200 / 7,800` | RH-02 | DERIVED | FROZEN_FOR_RH_C1 | derive from shell + centred court |
| `RHCF-COURT-Y0/Y1` | court south/north edges | `3,400 / 7,400` | RH-02 | DERIVED | FROZEN_FOR_RH_C1 | derive from shell + centred court |
| `RHCF-WING-WE` | west/east gross ring | `4,200` each | RH-02 | DERIVED | FROZEN_FOR_RH_C1 | shell/court consequence |
| `RHCF-WING-SN` | south/north gross ring | `3,400` each | RH-02 | DERIVED | FROZEN_FOR_RH_C1 | shell/court consequence |
| `RHCF-PLATE` | enclosed gross plate | `115.2 m²/storey`; `230.4 m²` two storeys | RH-02 | DERIVED | FROZEN_FOR_RH_C1 | gross proxy, not GIA/NIA |
| `RHCF-GF-TOPO` | ground topology | drawing / family / hall-stair / gallery / study / service suite / garden dining / kitchen | RH-02 + RH-03 | AUTHORED | FROZEN_FOR_RH_C1 | semantic adjacency/order |
| `RHCF-GDRAW-SPLIT` | west drawing/family split | nominal `Y≈5,000` | RH-02 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | source explicitly says approximate/adjustable |
| `RHCF-HALL-WEST` | front drawing/hall boundary | nominal `X≈4,000` south of court only | RH-03 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | court west edge remains 4,200 |
| `RHCF-GAL-X0` | gallery west edge | `X=7,800` | RH-02 | DERIVED | FROZEN_FOR_RH_C1 | court east edge |
| `RHCF-GAL-X1` | gallery/service partition | `X=9,100` | RH-02 | AUTHORED | FROZEN_FOR_RH_C1 | planning reservation line |
| `RHCF-GSVC` | gross service-suite room | `X 9,100–12,000 / Y 3,400–7,400` | RH-02/RH-06 | DERIVED | FROZEN_FOR_RH_C1 | architectural room reservation only; internal plant split outside |
| `RHCF-GPLANT` | plant reservation | approx. `2,900 × 2,200` north of G-SVC | RH-06 | PROVISIONAL ASSUMPTION | OUTSIDE_RH_C1 | RH-C3/service domain; packing unproved |
| `RHCF-SERVICE-SOUTH` | utility/WC band | approx. `2,900 × 1,800` | RH-06 | PROVISIONAL ASSUMPTION | OUTSIDE_RH_C1 | exact split unproved; M4/WC unresolved |
| `RHCF-SV01` | vertical service zone | clear approx. `900 × 700`; current nominal location `X 9,150–10,050 / Y 6,550–7,250` | RH-06/RH-07 | PROVISIONAL ASSUMPTION | OUTSIDE_RH_C1 | capacity/fire/acoustic/MEP proof absent |
| `RHCF-UF-TOPO` | upper topology | four bedrooms; south stair/landing; east gallery; north cross-landing; east-middle family bath; north-centre dry dressing/linen | RH-03 + RH-06 | AUTHORED | FROZEN_FOR_RH_C1 | `U-ENS-01` does not exist in current house |
| `RHCF-U-CIRC` | upper circulation | south stair → east gallery → north cross-landing; no west gallery | RH-03 | AUTHORED | FROZEN_FOR_RH_C1 | semantic topology |
| `RHCF-U-SOUTH-TURN-D` | south-landing east turn | `≈1,300 mm` deep eastward turn into the gallery-width field; north landing uses its existing `1,200 mm` depth | DRW-04A.1 correction of RH-03 route geometry | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | makes the authored U-route share real planning edges rather than corner points; no stair construction claim |
| `RHCF-U-NORTH-SPLIT` | north landing / dry-space boundary | nominal `Y≈8,600` | RH-03/RH-06 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | approximate planning boundary |
| `RHCF-U-DRY-SPLIT` | dressing / linen split | nominal `X≈6,400` | RH-06 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | dry subdivision may move |
| `RHCF-U-BATH` | family-bath gross reservation | `X 9,100–12,000 / Y 3,400–7,400` | RH-03 | DERIVED | FROZEN_FOR_RH_C1 | gross room polygon only |
| `RHCF-FFL-G` | ground FFL | `0` | RH-04 | AUTHORED | FROZEN_FOR_RH_C1 | datum |
| `RHCF-CEIL-G` | ground clear ceiling | `+2,950` | RH-04 | AUTHORED | FROZEN_FOR_RH_C1 | datum |
| `RHCF-FFL-1` | first-floor FFL | `+3,300` | RH-04 | AUTHORED | FROZEN_FOR_RH_C1 | supersedes RH-03 3,240 test datum |
| `RHCF-FLOOR-ZONE` | ceiling-to-first-FFL datum gap | `350` | RH-04/RH-05 | DERIVED | FROZEN_FOR_RH_C1 | arithmetic datum gap only; assembly is outside RH-C1 |
| `RHCF-CEIL-U` | upper clear ceiling | `+6,000` | RH-04 | AUTHORED | FROZEN_FOR_RH_C1 | datum |
| `RHCF-UPPER-CLEAR` | upper clear height | `2,700` | RH-04 | DERIVED | FROZEN_FOR_RH_C1 | `6000−3300` |
| `RHCF-CORNICE` | outer cornice/eaves control | `≈+6,250` | RH-04 retained RH-08/RH-10 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | architectural datum, not roof build-up |
| `RHCF-STAIR-N` | riser topology | `18`; `3 flights × 6` | RH-03 | AUTHORED | FROZEN_FOR_RH_C1 | source invariant |
| `RHCF-STAIR-G` | going topology | **`300 mm`**; `5 goings/flight` | RH-03 / HFI-08B | AUTHORED | FROZEN_FOR_RH_C1 | current controlled source; supersedes 280 mm |
| `RHCF-STAIR-RISE` | rise | `183.33 mm` | RH-03 + RH-04 | DERIVED | FROZEN_FOR_RH_C1 | `3300/18` |
| `RHCF-STAIR-RUN` | flight run | **`1,500 mm`** | RH-03 / HFI-08B | DERIVED | FROZEN_FOR_RH_C1 | `5×300` |
| `RHCF-STAIR-LVLS` | intermediate landing datums | `+1,100 / +2,200` | RH-03 + RH-04 | DERIVED | FROZEN_FOR_RH_C1 | six-rise increments |
| `RHCF-STAIR-COMFORT` | stair arithmetic | **`2R+G=666.67`; pitch `≈31.4°`** | RH-03 + RH-04 / HFI-08B | DERIVED | FROZEN_FOR_RH_C1 | deterministic arithmetic, not compliance certificate |
| `RHCF-STAIR-W` | clear flight width target | `≈1,000` | RH-03 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | exact strings/guards reduce real clear width |
| `RHCF-STAIR-BOX` | planning reservation | `≈2,400–2,500` square | RH-03 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | 300 mm going uses upper end; semantic reservation only |
| `RHCF-STAIR-PASSAGE` | east arrival passage target | `≈1,050–1,150 clear` | RH-03 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | detailed fit not proved |
| `RHCF-FRONT-FIELD` | principal front bay rule | `4 bays`; `2,700` spacing; field centred on shell centre X | RH-04 | AUTHORED | FROZEN_FOR_RH_C1 | source rule, not four independent coordinates |
| `RHCF-FRONT-AXES` | front axes | `1,950 / 4,650 / 7,350 / 10,050` | RH-04 | DERIVED | FROZEN_FOR_RH_C1 | derive from front-field rule |
| `RHCF-ENTRANCE-BAY` | entrance membership | bay `3` | RH-04 | AUTHORED | FROZEN_FOR_RH_C1 | — |
| `RHCF-FRONT-ENTRANCE` | entrance centre | `X=7,350` | RH-04 | DERIVED | FROZEN_FOR_RH_C1 | from bay 3 |
| `RHCF-FRONT-GW` | principal ground window size family | width `≈1,050`; sill `≈650–700`; head `≈2,550` | RH-04 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | centres derive from bay membership |
| `RHCF-FRONT-STW` | ground stair window family | width `≈900`; sill `≈1,050`; head `≈2,550` | RH-04 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | centre derives from bay 2 |
| `RHCF-FRONT-DOOR` | principal entrance opening family | width `≈950–1,050`; head `≈2,550` | RH-04 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | product/clear leaf outside RH-C1 |
| `RHCF-FRONT-UW` | upper front window family | width `≈900–950`; sill `+800` above FFL; head `+2,350` above FFL | RH-04 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | centres derive from front axes |
| `RHCF-COURT-NS` | court north/south opening relationship | principal openings centred on court/shell X axis | RH-04 | AUTHORED relationship | FROZEN_FOR_RH_C1 | derived centre `X=6,000`; widths provisional |
| `RHCF-COURT-E` | east court opening order | two-bay rhythm, vertically aligned | RH-04 | AUTHORED qualitative relationship | FROZEN_FOR_RH_C1 | **exact numeric centres OUTSIDE RH-C1** |
| `RHCF-COURT-W` | west court opening order | two room-owned axes, vertically aligned where coherent | RH-04 | AUTHORED qualitative relationship | FROZEN_FOR_RH_C1 | **exact numeric centres OUTSIDE RH-C1** |
| `RHCF-GARDEN-FIELD` | north/garden field | centred 3-axis order; axes approx. `2,100 / 6,000 / 9,900` | RH-10 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | centre upper host corrected to dry dressing/storage at RH-C0.6 |
| `RHCF-GARDEN-LOGISTICS` | central garden opening | `≥1,200 clear` coordination target | RH-08/RH-10 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | product/threshold outside C1 |
| `RHCF-EAST-FIELDS` | east elevation field order | study/bedroom; service/bath; kitchen/bedroom | RH-10 | AUTHORED qualitative relationship | OUTSIDE_RH_C1 | no elevation output in first slice |
| `RHCF-WEST-FIELDS` | west elevation field order | front and rear room-owned fields | RH-10 | AUTHORED qualitative relationship | OUTSIDE_RH_C1 | no elevation output in first slice |
| `RHCF-WALL-NORMAL` | external/court planning family | `400–425 mm` normal planning range | RH-10 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | range metadata; **no hidden single thickness** |
| `RHCF-WALL-STRESS` | wall geometry stress parameter | `450 mm` | RH-10 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | test boundary, not selected construction |
| `RHCF-STRUCT-SUPPORT` | support-line concept | outer + courtyard inner leaves | RH-05 | OUTSIDE RH-C1 | OUTSIDE_RH_C1 | RH-C2 domain; engineering absent |
| `RHCF-STRUCT-SPANS` | gross span concept | side `≈4,200`; centre `≈3,400` | RH-05 | OUTSIDE RH-C1 | OUTSIDE_RH_C1 | RH-C2 domain |
| `RHCF-EDGE-BEAMS` | court support continuations | X≈4,200/7,800 through front/rear fields | RH-05 | OUTSIDE RH-C1 | OUTSIDE_RH_C1 | do not snap to room partitions |
| `RHCF-ROOF-FAMILY` | gross roof topology | four very-low-slope fields; diagonal outer-corner→court-corner watersheds; falls outward | RH-08/RH-10 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | enough to reproduce current section family only |
| `RHCF-ROOF-FALL` | screening fall | `≈1:40 class` outward | RH-08 | PROVISIONAL ASSUMPTION | PROVISIONAL_BUT_REPRESENTABLE | not specification/minimum finished fall |
| `RHCF-ROOF-CATCH` | plan catchment proxy | S/N `≈26.5 m²`; W/E `≈31.1 m²` | RH-08 | DERIVED | OUTSIDE_RH_C1 | drainage/roof calculations are later work |
| `RHCF-COURT-DRAIN` | courtyard drainage geography | east-side accessible route + visible overflow | RH-08 | OUTSIDE RH-C1 | OUTSIDE_RH_C1 | hydraulic design absent |
| `RHCF-PLANT-ACCESS` | plant replacement opening | nominal `1,000 clear` | RH-06 | PROVISIONAL ASSUMPTION | OUTSIDE_RH_C1 | service/equipment domain |

---

# 3. Current room / circulation reservation contract

These polygons are planning-level semantic reservations. A coordinate marked `≈` stays provisional. RH-C1 must not convert them into finished wall-face dimensions.

## Ground floor

| Entity | Reservation | Freeze status |
|---|---|---|
| `G-DRAW-02` | `X 0–≈4,000 / Y 0–3,400` plus `X 0–4,200 / Y 3,400–≈5,000` | PROVISIONAL_BUT_REPRESENTABLE boundaries; room identity/topology frozen |
| `G-FAM-02` | `X 0–4,200 / Y ≈5,000–10,800` | PROVISIONAL_BUT_REPRESENTABLE split |
| `G-HALL-02` | `X ≈4,000–7,800 / Y 0–3,400` | PROVISIONAL_BUT_REPRESENTABLE west boundary |
| `G-STUDY-02` | `X 9,100–12,000 / Y 0–3,400` | FROZEN_FOR_RH_C1 |
| `G-GAL-01` | `X 7,800–9,100 / Y 0–7,400` | FROZEN_FOR_RH_C1 |
| `G-SVC-02` | `X 9,100–12,000 / Y 3,400–7,400` | FROZEN_FOR_RH_C1 gross room only |
| `G-GARDEN-02` | `X 4,200–7,800 / Y 7,400–10,800` | FROZEN_FOR_RH_C1 |
| `G-KIT-02` | `X 7,800–12,000 / Y 7,400–10,800` | FROZEN_FOR_RH_C1 |

At the nominal west split these reservations close to the `115.2 m²` enclosed gross field exactly.

## First floor

| Entity | Reservation | Freeze status |
|---|---|---|
| `U-BED-02` | `X 0–≈4,000 / Y 0–3,400` plus `X 0–4,200 / Y 3,400–≈5,000` | PROVISIONAL_BUT_REPRESENTABLE boundaries |
| `U-BED-P01` | `X 0–4,200 / Y ≈5,000–10,800` | PROVISIONAL_BUT_REPRESENTABLE split |
| `U-STAIR-01` | `X ≈4,000–7,800 / Y 0–3,400` | PROVISIONAL_BUT_REPRESENTABLE west boundary |
| `U-BED-03` | `X 7,800–12,000 / Y 0–3,400` | FROZEN_FOR_RH_C1 |
| `U-GAL-02` | `X 7,800–9,100 / Y 3,400–7,400` | FROZEN_FOR_RH_C1 |
| `U-BATH-01` | `X 9,100–12,000 / Y 3,400–7,400` | FROZEN_FOR_RH_C1 gross room only |
| `U-BED-04` | `X 7,800–12,000 / Y 7,400–10,800` | FROZEN_FOR_RH_C1 |
| `U-LAND-N01` | `X 4,200–7,800 / Y 7,400–≈8,600` | PROVISIONAL_BUT_REPRESENTABLE north boundary |
| `U-DRESS-01` | approx. `X 4,200–6,400 / Y 8,600–10,800` | PROVISIONAL_BUT_REPRESENTABLE subdivision |
| `U-LIN-01` | approx. `X 6,400–7,800 / Y 8,600–10,800` | PROVISIONAL_BUT_REPRESENTABLE subdivision |

The upper field also closes to `115.2 m²` at the nominal dry-space splits. `U-ENS-01` is historical only.

---

# 4. Authored → derived dependency contract

RH-C1 should encode the left side once and calculate the right side. Editing a right-side consequence directly is a model error.

```text
shell.width + shell.depth
  ├─> shell.area
  ├─> shell.centre
  └─> centred-court reference

court.width + court.depth + centredInShell + shell
  ├─> court edges
  ├─> court area
  ├─> west/east/front/rear gross ring depths
  └─> roof plan-field vertices

shell/court + partition inputs + room topology
  ├─> room reservation polygons
  └─> room reservation areas

firstFloorFFL + stair.riserCount
  ├─> stair.rise
  ├─> six-rise landing levels
  ├─> pitch (with going)
  └─> 2R+G (with going)

stair.going + goingsPerFlight
  └─> flight run

frontField.count + frontField.spacing + shell.centreX
  ├─> front bay axes
  ├─> front opening centres by bay membership
  └─> entrance centre via entranceBayIndex

groundCeiling + firstFloorFFL
  └─> inter-storey datum gap

firstFloorFFL + upperCeiling
  └─> upper clear height

shell/court vertices + roof topology
  └─> roof field polygons
```

The following are therefore **not independent source values** even though they appear in prose/drawings for readability: court edges, ring depths, plate area, room polygons where fully implied, 350 mm datum gap, 2,700 mm upper clear height, stair rise/run/landing levels/pitch/`2R+G`, the four front-axis coordinates, entrance centre and roof field polygons.

---

# 5. RH-C1 source contract

RH-C1 may encode only this bounded semantic source.

## Required source entities / relationships

### Shell / court

- `shell { width: 12000, depth: 10800 }`
- `court { width: 3600, depth: 4000, placement: centredInShell }`

### Levels

- ground FFL `0`
- ground clear ceiling `2950`
- first FFL `3300`
- upper clear ceiling `6000`
- cornice/eaves control may be represented as `≈6250` with explicit provisional status

### Rooms / circulation

- semantic identities and adjacency/topology listed above;
- exact partition inputs where controlled;
- nominal approximate partition inputs only with `PROVISIONAL_BUT_REPRESENTABLE` metadata;
- no internal door leaf/swing geometry unless a later owning architectural gate authors it.

### Stair

Encode:

- 18 risers;
- 3 groups of 6;
- 5 goings per flight;
- **300 mm planning going**;
- provisional `≈1000` clear target and `≈2400–2500` planning reservation if needed by the drawing.

Derive rise/run/landing datums/pitch/`2R+G`. At the current +3300 first-floor FFL those consequences are 183.33 mm rise, 1500 mm flight run, landing datums +1100/+2200, `2R+G=666.67 mm`, and pitch ≈31.4°.

**Do not invent** strings, balustrades, handrails, tread placement around the well, exact landings, headroom construction or a certified stair. The RH-C1 principal section may show the controlled stair reservation/topology and derived landing datums, as the RH-C0 comparator does.

### Walls

RH-C1 needs semantic room boundaries / host walls sufficient to draw the planning fixture and host major openings. It does **not** have a frozen construction thickness.

If the wall planning family is represented, encode the explicit range `400–425` and stress parameter `450` as provisional model metadata/test inputs. Do not select a hidden nominal thickness merely to draw two wall faces.

### Principal axes / openings

Encode:

- front field rule `{ count: 4, spacing: 2700, centredOnShell: true }`;
- entrance membership `bayIndex=3`;
- front opening role/bay membership;
- provisional front opening size/sill/head families;
- court north/south centred-opening relationship;
- qualitative east/west court opening orders without fabricated numeric centres;
- garden field only if useful as a provisional relationship; it is not required for the three RH-C1 production views.

### Roof in the principal section

RH-C1 may represent the current gross roof family solely so the section does not regress to the superseded pitched roof:

- outward fall away from court;
- four-field topology in plan;
- `≈1:40` coordination fall;
- `≈+6250` outer edge control.

This is **PROVISIONAL_BUT_REPRESENTABLE**. RH-C1 must not infer roof build-up, parapet, waterproofing, structural depth, drainage sizing or compliance from it.

---

# 6. Explicitly OUTSIDE RH-C1

The first slice must not create source truth for:

- exact east/west courtyard opening centres;
- exact side-elevation opening coordinates;
- internal door positions, leaf widths or swings;
- final wall-face / construction thickness;
- masonry leaf sizes, insulation, cavity, air barrier or final thermal build-up;
- U-values, ψ-values or thermal-bridge details;
- final window/door product geometry, frames, sashes, free-opening areas, reveals or thresholds;
- final stair strings, well construction, guards, handrails, headroom details or compliance sign-off;
- structural member sizes, joists, beams, bearings, connections, foundations or capacity;
- plant-room packing, utility/WC final subdivision, `SV-01` capacity or MEP routes;
- MVHR duct sizing, fan duty, terminal separation, acoustics or fire stopping;
- heat loss, heat-emitter sizing, ASHP sizing, DHW sizing or electrical design;
- detailed roof build-up, parapet/coping, drainage outlets, gutters/downpipes or hydraulic sizing;
- court drain sizing;
- final fire/escape strategy or Building Regulations compliance;
- daylight, overheating, hygrothermal or acoustic proof;
- real orientation, site boundaries, drainage, utilities, planning or ground conditions;
- physical-test results or external professional determinations not yet obtained.

These are not omissions to fill with plausible defaults. They are controlled boundaries for later RH-C2→RH-C5 or external evidence.

---

# 7. Supersession / correction ledger

1. **RH-01 shell width `11.4 m` → RH-02 `12.0 m`.** Depth and 3.6×4.0 court retained.
2. **RH-02 front drawing/hall boundary `X=4.2 m` → RH-03 nominal `X≈4.0 m`** south of the court only.
3. **RH-03 stair test datum `3,240` → RH-04 first FFL `+3,300`.** Eighteen-riser / three-flight topology retained.
4. **RH-03 `U-ENS-01` → RH-06 dry `U-DRESS-01` / linen-storage field.** No principal en-suite exists in the current house.
5. **RH-06 local-extract/open ventilation position → RH-07 central MVHR baseline with continuous-MEV fallback.** Service geography remains provisional.
6. **RH-04 pitched-roof preference → RH-08/RH-10 outward-draining low-slope roof.** RH-04 still owns storey/cornice/opening hierarchy.
7. **RH-02 350 mm wall allowance → RH-10 400–425 mm planning family + 450 mm stress boundary.** No shell growth follows automatically.
8. **RH-10 north-centre upper garden opening host “cross-landing” → RH-C0.6 dry dressing/storage field.** The plan did not move; `outer-elevation-coordination-rh10.md` was repaired and the stale SVG demoted.
9. **RH-03/RH-C0 principal-stair going `280 mm` → HFI-08B `300 mm`.** Eighteen risers, three flights, five goings per flight, full landings, +3300 first FFL, shell, courtyard and circulation topology retained; run/pitch/`2R+G` rederive from the changed source.

---

# 8. Controlled unresolved items

These are visible uncertainties, not hidden freeze failures.

| Item | Current treatment | Why RH-C0 may still PASS |
|---|---|---|
| west room split `Y≈5.0 m` | PROVISIONAL_BUT_REPRESENTABLE | source is deliberately approximate and fixture can preserve that status |
| front hall line `X≈4.0 m` | PROVISIONAL_BUT_REPRESENTABLE | relationship/correction is clear even though final wall face is not |
| upper dry-space splits `Y≈8.6 / X≈6.4` | PROVISIONAL_BUT_REPRESENTABLE | dry topology is controlled; joinery/partition detail may move |
| exact E/W courtyard opening centres | OUTSIDE RH-C1 | RH-04 never authored them; no first-slice invariant requires fabricated coordinates |
| internal doors/swings | OUTSIDE RH-C1 | topology closes without pretending a joinery plan exists |
| wall construction thickness | PROVISIONAL range only | RH-C1 can preserve the range/stress test without selecting construction |
| stair detailed construction | OUTSIDE RH-C1 detail | source has enough topology/arithmetic for C1; technical stair remains later work |
| utility/WC fit | OUTSIDE RH-C1 | domestic audit marks it unproved; RH-C3 / later architectural detail owns it |
| plant/riser packing | OUTSIDE RH-C1 | specialist proof absent; no area expansion is assumed |
| roof technical geometry | provisional gross family only | enough to prevent section regression; technical roof remains later evidence |

No unresolved item above can be silently filled by an RH-C1 default.

---

# 9. Visual comparator contract

The following are the RH-C1 parity comparators:

1. [`rhc0-ground-floor-comparator.svg`](rhc0-ground-floor-comparator.svg)
2. [`rhc0-first-floor-comparator.svg`](rhc0-first-floor-comparator.svg)
3. [`rhc0-principal-section-comparator.svg`](rhc0-principal-section-comparator.svg)

Additional cross-view checks:

- [`rhc0-front-elevation-comparator.svg`](rhc0-front-elevation-comparator.svg)
- [`rhc0-garden-elevation-comparator.svg`](rhc0-garden-elevation-comparator.svg)

All five are **secondary projections**. They are `CURRENT DIAGRAM / NON-GEOMETRIC`, never source authority. RH-C1 must reproduce their controlled semantics/dimensions from this baseline, not copy their SVG coordinates.

Full drawing classification and stale-material disposition live in [`rhc0-drawing-parity-audit.md`](rhc0-drawing-parity-audit.md).

---

# 10. RH-C0 closeout evidence

- authority consolidation + independent reconstruction + source contract: **this document**
- discrepancy/supersession record: [`rhc0-discrepancy-register.md`](rhc0-discrepancy-register.md)
- mutation/dependency red-team: [`rhc0-mutation-map.md`](rhc0-mutation-map.md)
- domestic/adversarial review: [`rhc0-domesticity-audit.md`](rhc0-domesticity-audit.md)
- drawing parity/classification: [`rhc0-drawing-parity-audit.md`](rhc0-drawing-parity-audit.md)
- material RH-C0 rewind/correction: [`outer-elevation-coordination-rh10.md`](outer-elevation-coordination-rh10.md) — north-centre upper garden host corrected at RH-C0.6
- HFI stair-source correction: [`../../project/hfi/hfi-08b-rh03-stair-rewind.md`](../../project/hfi/hfi-08b-rh03-stair-rewind.md) — `RHCF-STAIR-G` corrected to 300 mm with RH-04/RH-05/RH-10 rechecks

## Ten-condition PASS gate

| # | Canonical RH-C0 condition | Result | Evidence |
|---:|---|---|---|
| 1 | every RH-C1 fact has one current authority | **PASS** | fact schedule + source contract above |
| 2 | current authorities reconstruct one coherent house | **PASS** | independent reconstruction in RH-C0.2; both storeys close to 115.2 m² gross semantic field |
| 3 | no compiler-bound fact is unknowingly authored twice | **PASS** | authored→derived dependency contract |
| 4 | high-leverage mutation consequences are recorded | **PASS** | `rhc0-mutation-map.md`, including explicit propagation/failure/review outcomes |
| 5 | fresh domestic/architectural adversarial review survived | **PASS** | `rhc0-domesticity-audit.md`; HFI-08B subsequently resolved the stair-going improvement through RH-03 without morphology rewind |
| 6 | current comparator drawings agree or stale drawings are demoted | **PASS** | `rhc0-drawing-parity-audit.md` + named RH-C0 comparator set; current deterministic projections must follow the refreshed canonical source |
| 7 | every relevant fact is frozen/provisional/outside | **PASS** | schedule above |
| 8 | unresolved technical proof remains visible | **PASS** | explicit OUTSIDE/PROVISIONAL sections; no specialist adequacy promoted |
| 9 | material contradictions found by RH-C0 or later bounded audit are repaired through owning gate | **PASS** | RH-C0.6 garden-host defect repaired in RH-10; HFI-08B stair-going improvement repaired in RH-03/RH-04 authority |
| 10 | maturity remains tied to real evidence | **PASS** | Reference House remains **M3**; no RH-C0/HFI-08B promotion |

# RH-C0 result

**PASS.** The Reference House is frozen strongly enough to act as the controlled regression fixture for RH-C1 at the bounded architectural scope above, with the HFI-08B 300 mm stair going now part of that current source.

This does **not** make the house a universal House Kernel template or gold-standard design. It is one controlled reference fixture against which the executable architecture can prove that semantic source, derivation and drawings remain consistent.

RH-C1 consumes this current source. Its job remains reproduction, not invention: one semantic source for the released shell, court, levels, rooms/circulation, stair, walls/openings and principal axes; small pure derived calculations; then deterministic ground-plan, first-floor-plan and principal-section SVGs.