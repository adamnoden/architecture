# Reference House — RH-C0 Drawing Parity / Cross-View Audit

**Status:** RH-C0.6 — **PASS**  
**Date:** 2026-10-12  
**Baseline:** [`model-baseline-rhc0.md`](model-baseline-rhc0.md)  
**Discrepancies:** [`rhc0-discrepancy-register.md`](rhc0-discrepancy-register.md)

This audit checks semantic identity and controlling dimensions across the current Reference House views. It does **not** promote any hand-authored SVG into source geometry.

The single geometric authority remains the RH-C0 baseline schedule. Drawings are projections, explanations or provenance. Where an old SVG contains a still-useful relationship and a superseded one, the file is demoted rather than treated as a menu from which RH-C1 may choose coordinates.

## Current RH-C0 visual comparators

These static projections were made from the RH-C0 baseline after independent reconstruction. They are deliberately secondary to the baseline:

- [`rhc0-ground-floor-comparator.svg`](rhc0-ground-floor-comparator.svg) — current ground topology, RH-03 hall correction, controlled front axes, provisional service overlays;
- [`rhc0-first-floor-comparator.svg`](rhc0-first-floor-comparator.svg) — current four-bedroom topology, RH-06 dry-space correction, current opening/axis relationships;
- [`rhc0-principal-section-comparator.svg`](rhc0-principal-section-comparator.svg) — current datums and RH-08 low-slope roof family;
- [`rhc0-front-elevation-comparator.svg`](rhc0-front-elevation-comparator.svg) — current RH-04 four-bay front without the superseded pitched-roof silhouette;
- [`rhc0-garden-elevation-comparator.svg`](rhc0-garden-elevation-comparator.svg) — current RH-10 north order after the RH-C0.6 host-space correction.

**RH-C1 visual comparator set:** the first three files above. The front/garden comparators exist to close cross-view parity, not to expand RH-C1's first production-output scope.

---

## 1. Plan ↔ plan

**PASS at the RH-C0.6 audit baseline.** The later DRW-04A.1 source correction adds explicit eastward turning fields to the south and north upper landings so the authored U-route has positive-width continuity. The old RH-C0 first-floor comparator remains provenance and must not be used as current geometry. Ground and upper baseline comparators otherwise share exactly:

- shell `12,000 × 10,800`;
- centred court `3,600 × 4,000` with edges `X 4,200–7,800`, `Y 3,400–7,400`;
- RH-03 local front west boundary at nominal `X≈4,000` south of the court only;
- east gallery/service partition `X=9,100` where it applies;
- service/bath stack field `X 9,100–12,000`, `Y 3,400–7,400`;
- front façade axis field;
- courtyard north/south centre axis `X=6,000`.

The two plans intentionally differ north of the court: the upper north-centre zone is cross-landing followed by dry dressing/linen, not a copy of the ground garden-dining room.

The old RH-02 ground SVG and RH-03 upper SVG are no longer eligible as a paired current-plan set because the former predates the hall correction and the latter predates both +3300 FFL and deletion of the en-suite.

---

## 2. Plan ↔ section

**PASS at planning-datum level.** The current principal section uses the same north-south geometry as the plans:

- south/front wing `3,400`;
- court `4,000` in section direction;
- north/rear wing `3,400`;
- total depth `10,800`.

Vertical closure is exact at the authored datum level:

| Datum | Value |
|---|---:|
| ground FFL | `0` |
| ground clear ceiling | `+2,950` |
| first FFL | `+3,300` |
| derived inter-storey datum gap | `350` |
| upper clear ceiling | `+6,000` |
| derived upper clear height | `2,700` |
| outer cornice/eaves control | `≈+6,250` |

The section does not draw a final wall build-up, floor assembly, parapet or stair string. Those are not missing coordinates to be inferred from line weights.

---

## 3. Plan ↔ elevation

### South/front

**PASS.** The four controlled axes land in the correct plan hosts on both floors:

| Axis | Ground host | Upper host |
|---:|---|---|
| `X=1,950` | drawing room | west-front bedroom `U-BED-02` |
| `X=4,650` | stair/hall window | south stair/landing |
| `X=7,350` | principal entrance | south landing |
| `X=10,050` | study | east-front bedroom `U-BED-03` |

The RH-03 hall correction is therefore compatible with the RH-04 façade field. No room boundary needs to move to rescue the front elevation.

### North/garden

**PASS after one owning-authority correction.** The three RH-10 axes land as follows:

| Axis | Ground host | Upper host |
|---:|---|---|
| `X≈2,100` | family room | principal bedroom |
| `X=6,000` | garden dining / logistics door | **dry dressing/storage field** |
| `X≈9,900` | kitchen | east-rear bedroom `U-BED-04` |

RH-10 previously called the centre upper opening a **north cross-landing window**. That was impossible in the controlled plan: the cross-landing ends around `Y≈8,600`, while `U-DRESS-01` / linen occupy the field between it and the north external wall at `Y=10,800`.

The defect has been repaired in `outer-elevation-coordination-rh10.md` by correcting the host to the dry dressing/storage field. The plan is unchanged; the cross-landing continues to receive its north-side light from the courtyard face. This is the smallest coherent repair.

### East/service

**PASS at field level.** RH-10's three east elevation fields correspond to the plan bands:

- south/front `Y 0–3,400`: study / east-front bedroom;
- middle `Y 3,400–7,400`: service suite / family bathroom;
- north/rear `Y 7,400–10,800`: kitchen / east-rear bedroom.

Exact side-window and technical-terminal coordinates remain coordination/detail work, not RH-C1 source facts.

### West

**PASS at relationship level.** West opening order remains room-owned by front and rear west room fields. Exact opening coordinates are not frozen.

---

## 4. Section ↔ elevation

**PASS.** Current comparator elevations and section share:

- first FFL `+3,300`;
- cornice/eaves control `≈+6,250`;
- RH-04 opening-head hierarchy below the relevant ceilings;
- no pitched roof as current façade geometry.

The old RH-04 front elevation and principal section retain useful façade/storey information but show a roof silhouette that RH-08 later superseded. They are therefore provenance, not whole-view current comparators.

---

## 5. Opening ↔ host room/wall

**PASS for controlled major openings; explicitly incomplete elsewhere.**

Controlled major opening identities close against their host spaces:

- front bay 1 ground ↔ drawing;
- front bay 2 ground ↔ stair/hall;
- front bay 3 ground ↔ entrance/hall;
- front bay 4 ground ↔ study;
- front bay 1 upper ↔ `U-BED-02`;
- front bays 2/3 upper ↔ stair/south landing;
- front bay 4 upper ↔ `U-BED-03`;
- garden west ↔ family/principal bedroom;
- garden centre ↔ dining/dry dressing-storage field;
- garden east ↔ kitchen/`U-BED-04`;
- court north/south centre openings ↔ garden-dining/cross-landing and hall/stair relationships respectively.

**Exact east/west courtyard opening centres remain intentionally un-authored.** Their RH-04 elevation study shows the qualitative two-bay/room-owned order only. RH-C1 must not harvest those pixels into coordinates.

Internal door leaf positions/swings remain outside RH-C1 unless later deliberately authored.

---

## 6. Opening ↔ architectural axis

**PASS.** The first-slice source contract can safely derive:

- four front axes from the authored centred `4 × 2,700` field;
- entrance centre from `entranceBayIndex=3`;
- front-window centres from bay membership;
- north/south courtyard centre from the centred court;
- garden axes from the provisional centred three-axis RH-10 composition if represented.

It must **not** simultaneously store those derived coordinates as independently editable facts.

---

## 7. Wall ↔ structural support line

**PASS at conceptual coordination level; structure remains outside RH-C1.**

RH-05 support logic uses:

- outer loadbearing inner-leaf line;
- courtyard loadbearing inner-leaf line;
- support-line continuations at `X≈4,200` and `X≈7,800` through front/rear centre wings.

Important non-coincidence: the RH-03 front drawing/hall room boundary is nominally `X≈4,000`, while the western courtyard support-line continuation remains at `X≈4,200`. **Do not snap these together.** One is an architectural room boundary; the other is a structural support line continued from the court.

The RH-05 stair opening begins east of the western support line in the structural overlay, so no current conceptual beam/stair contradiction is exposed. Exact beam size, bearing and stair trimming remain engineering work.

---

## 8. Stair ↔ storey datums

**PASS arithmetically; construction remains provisional.**

At first FFL `+3,300`:

- 18 equal risers → `183.33 mm` rise;
- 3 flights × 6 rises → intermediate landing levels `+1,100` and `+2,200`;
- 5 goings × `280` → `1,400 mm` run/flight;
- `2R+G=646.67 mm`;
- pitch ≈`33.2°`.

All current RH-C0 comparators use the +3300 datum. The RH-03 section/upper SVGs that show `3240 / 180` are historical only.

The 2.4–2.5 m stair reservation remains a provisional planning envelope, especially at the 450 mm wall stress case. Exact strings, handrails, landings and headroom are not frozen.

---

## 9. Courtyard ↔ section height

**PASS.** The same court is used everywhere:

- plan `3.6 × 4.0 m`;
- open through both principal storeys;
- cornice/eaves control `≈6.25 m` above ground FFL;
- environmental screening H/W ≈`1.56–1.74`.

The current N-S principal section cuts the 4.0 m court dimension. RH-07's conclusion—deep shaded light court rather than sunny garden—therefore remains consistent with current geometry.

---

## 10. Roof ↔ cornice/parapet/elevation

**PASS at architectural family level.** RH-08/RH-10 current roof topology is:

- four low-slope fields;
- diagonal outer-corner→court-corner watersheds in plan;
- fall **outward**, away from the court;
- ~1:40 coordination fall only;
- external perimeter collection rather than inner-court primary roof drainage.

For the 3.4 m north/south wing run, a 1:40 screening fall is about `85 mm`. The current principal-section comparator shows this only to communicate direction/family; it does not freeze roof surface elevation or build-up.

RH-04's pitched silhouette is explicitly superseded and is not a current comparator.

---

## 11. Service zones ↔ room geometry

**PASS at reservation level; technical adequacy remains unproved.**

Text-controlled service geometry closes against the architectural plan:

- `G-SVC-02`: `X 9,100–12,000 / Y 3,400–7,400` (`≈2.9 × 4.0 m`);
- `G-PLANT-01`: north end `≈2.9 × 2.2 m`;
- utility/WC/storage remainder: south band `≈2.9 × 1.8 m`;
- `SV-01`: clear `≈900 × 700`, `X≈9,150–10,050 / Y≈6,550–7,250`;
- upper `U-BATH-01` occupies the same gross east-middle stack field.

`service-topology-rh06.svg` is not dimensionally faithful to the 1.8 m south-band split; its utility/WC rectangles visually extend into a larger front field. The RH-06 text remains authority and the SVG is classified as non-geometric topology. No domestic or compiler conclusion may be taken from its pixel areas.

---

# Drawing authority classification

**No hand-authored SVG is `CURRENT GEOMETRIC AUTHORITY`.** The geometric authority is `model-baseline-rhc0.md`. This is intentional.

| Drawing | Classification | Current use / reason |
|---|---|---|
| `rhc0-ground-floor-comparator.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | RH-C1 visual comparator; dimensionally faithful projection, never source |
| `rhc0-first-floor-comparator.svg` | **HISTORICAL / PROVENANCE ONLY** | RH-C0.6 comparator superseded geometrically by DRW-04A.1 upper-circulation correction; never source |
| `rhc0-principal-section-comparator.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | RH-C1 visual comparator; current datums/roof family |
| `rhc0-front-elevation-comparator.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | current cross-view front comparator |
| `rhc0-garden-elevation-comparator.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | current cross-view garden comparator after host correction |
| `morphology-options.svg` | **HISTORICAL / PROVENANCE ONLY** | pre-selection morphology options |
| `gross-morphology-baseline.svg` | **HISTORICAL / PROVENANCE ONLY** | RH-01 11.4 m shell superseded by RH-02 12.0 m |
| `ground-floor-development.svg` | **HISTORICAL / PROVENANCE ONLY** | RH-02 stage plan; predates RH-03 hall correction/RH-06/RH-10 |
| `stair-ground-floor-overlay.svg` | **HISTORICAL / PROVENANCE ONLY** | records RH-03 local correction; stair box remains provisional |
| `upper-floor-and-stair-development.svg` | **HISTORICAL / PROVENANCE ONLY** | stale 3240 datum + deleted en-suite |
| `stair-courtyard-section.svg` | **HISTORICAL / PROVENANCE ONLY** | explicit RH-03 provisional 3240 section |
| `principal-section-rh04.svg` | **HISTORICAL / PROVENANCE ONLY** | storey datums useful; roof silhouette superseded by RH-08 |
| `front-elevation-study.svg` | **HISTORICAL / PROVENANCE ONLY** | front order useful; pitched roof makes whole drawing non-current |
| `courtyard-elevations-study.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | current qualitative court opening order; east/west numeric centres forbidden |
| `structural-concept-overlay.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | current pre-engineering support concept; RH-C2 domain |
| `service-topology-rh06.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | topology only; service-band pixels are not dimensions |
| `service-riser-section-rh06.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | riser relationship/reservation only |
| `environmental-coordination.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | environmental strategy summary |
| `courtyard-solar-section-rh07.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | screening environmental section, not building section authority |
| `mvhr-topology-rh07.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | conditional ventilation topology; RH-C3 domain |
| `roof-drainage-plan-rh08.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | current roof/drainage topology; technical geometry provisional |
| `external-maintenance-access-rh08.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | access/maintenance strategy |
| `tectonic-interface-family-rh09.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | interface-family summary; not whole-house geometry |
| `vertical-bay-coordination.svg` | **HISTORICAL / PROVENANCE ONLY** | W2/selective tectonic hypothesis; W0 is ordinary occupied-wall baseline |
| `outer-elevations-rh10.svg` | **STALE — REPLACE/CORRECT** | central north upper host mislabeled as landing; owning text corrected and garden comparator replaces current use |
| `energy-heat-topology-rh10.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | energy/heat topology; specialist proof absent |
| `whole-house-coordination-rh10.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | M3 whole-house summary map, intentionally schematic |
| `whole-house-coordination-fixture.svg` | **HISTORICAL / PROVENANCE ONLY** | earlier coordination fixture, not current Reference House geometry |
| `external-review-package-rh11.svg` | **CURRENT DIAGRAM / NON-GEOMETRIC** | review-package map, not design geometry |

`outer-elevations-rh10.svg` is intentionally not silently edited into a new truth in RH-C0.6. Its garden-host error is recorded, its owning text authority is corrected, and the new current garden comparator makes the repaired relationship visible. The old SVG remains useful provenance for RH-10's service-elevation thinking.

---

# RH-C0.6 gate result

**PASS.** Plan, section, elevation, stair, support, roof and service relationships now have one cross-view interpretation. The one newly discovered semantic defect—the north centre upper garden opening assigned to a landing that does not reach the façade—was repaired through its owning RH-10 elevation authority without moving the plan. Stale drawings are explicitly demoted, and RH-C1 has a named three-drawing visual-comparator set that cannot override the semantic baseline.