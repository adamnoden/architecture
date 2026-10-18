<!-- nav-exclude: redirect -->
# DRW-05B — Principal longitudinal-section publication source hardening

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-05B  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `58fbf4fc96cbd6023d4ce4d1a0b95094e52a977e`

## 1. Outcome

DRW-05B closes only the five bounded source gaps identified by DRW-05A for the frozen principal longitudinal section.

New companion source:

- `compiler/reference-house/publication-principal-section-source.ts`

Regression proof:

- `compiler/reference-house/publication-principal-section-source.test.ts`

No canonical Reference House morphology is changed. No renderer is added in this packet.

The frozen publication view remains:

- straight north–south section;
- cut at X = `6000 mm`;
- looking west;
- south on paper left, north on paper right;
- true `1:100`;
- publication view ID `REFERENCE-HOUSE-PRINCIPAL-LONGITUDINAL-SECTION`.

## 2. Governing distinction

A publication section requires more vertical geometry than the RH-C1 coordination section, but it still must not manufacture technical construction certainty.

DRW-05B therefore separates:

- **canonical architectural facts** — levels, court extent, roof direction, stair arithmetic, opening-family vertical controls;
- **publication-section facts** — bounded cut-body representation, opening extents crossed by the cut, cut-vs-beyond stair relation and graphic ground termination;
- **technical facts still absent** — foundations, structural member depths, wall/roof build-ups, frame/reveal details, guards, strings, handrails, services and site profile.

## 3. Representation source

### 3.1 Wall cut-body proxy

The section reuses the existing DRW-03/04 external/courtyard publication body proxy rather than creating a second wall-thickness family.

The source therefore imports the same approximately `400 mm` representation fact already used by the controlled plans.

This is a drawing cut-body proxy only. It does not select cavity, leaf, insulation, finish or bearing geometry.

### 3.2 Inter-storey zone

The controlled levels already define:

- ground clear ceiling: `+2950 mm`;
- first FFL: `+3300 mm`.

DRW-05B exposes the resulting `350 mm` interval as a provisional publication planning zone.

It is explicitly **not** a slab, joist or ceiling-construction depth.

### 3.3 Ground termination

The architectural section terminates graphically at ground FFL.

The controlled rule is:

`terminate-at-ground-ffl-no-foundation-or-site-profile`

No footing, slab build-up, soil line or external topography is invented simply because conventional construction sections often show them.

### 3.4 Roof treatment

The roof is represented from the already-controlled low-slope outward-draining profile only.

The rule is:

`controlled-profile-line-no-technical-build-up`

No roof deck, insulation, parapet/coping or gutter construction is authored here.

## 4. Opening extents crossed by the cut

The X = `6000 mm` section crosses exactly six publication opening occurrences requiring executable vertical extents:

1. ground south courtyard major opening;
2. ground north courtyard major opening;
3. upper south courtyard opening;
4. upper north courtyard opening;
5. ground centre garden/logistics opening;
6. upper centre garden/dressing-field opening.

### 4.1 Ground openings

The three ground occurrences are threshold-level publication openings with sill `0` relative to their level and provisional head `+2550 mm`.

The `2550 mm` value is not introduced as a new independent datum. DRW-05B deliberately derives it from the already-coordinated `FAM-FRONT-GROUND-PRINCIPAL` head datum and provisionally extends that ground-level opening hierarchy to the court/garden cuts crossed by this section.

That extension remains `PROVISIONAL_BUT_REPRESENTABLE`; it is not a final door/window schedule.

### 4.2 Upper openings

The three upper occurrences reuse the canonical upper-window vertical family:

- sill ≈`800 mm` above first FFL;
- head ≈`2350 mm` above first FFL.

The source derives those values directly from `FAM-FRONT-UPPER`; it does not copy `800 / 2350` as new independent section constants.

Widths remain owned by the plan/elevation publication sources and are not re-authored here.

## 5. Stair-section source

The principal stair retains canonical:

- `18` rises;
- `6 / 6 / 6` rise groups;
- `280 mm` going;
- `5` goings per flight;
- first FFL `+3300 mm`.

The section companion source adds only the planning relation of the three flights to the frozen X = `6000 mm` cut:

| Flight | Direction | Relation to section | Elevation |
|---|---|---|---|
| 1 | north | beyond | `0 → 1100 mm` |
| 2 | east | perpendicular beyond | `1100 → 2200 mm` |
| 3 | south | cut | `2200 → 3300 mm` |

Plan placement of the flight traces remains provisional.

### 5.1 Important renderer/source correction

The older ground-plan publication renderer drew its first/third stair trace over approximately `1600 mm` for schematic legibility.

That coordinate is renderer convenience, not architectural source.

DRW-05B derives the longitudinal section flight run from canonical arithmetic:

`5 goings × 280 mm = 1400 mm`.

The publication section must therefore use the `1400 mm` source run. It must not copy the plan renderer's schematic trace merely to obtain visual parity.

This is exactly the source-authority distinction DRW is intended to preserve.

## 6. Precision / authority policy

Newly authored section geometry remains provisional where it is a publication selection:

- inter-storey representation zone;
- all six opening sill/head occurrences;
- stair plan-placement coordinates.

Controlled facts are either:

- the frozen DRW-05A view contract;
- explicit representation prohibitions/termination rules;
- canonical stair arithmetic copied by reference from the house source.

Tests reject accidental promotion or hidden independent numerical copies.

## 7. Explicit non-authority

DRW-05B does not source:

- foundations or below-ground construction;
- site/topographic profile;
- ground-bearing slab build-up;
- engineered joist/member depth;
- wall cavity/leaf build-up;
- roof deck/insulation/coping/gutter construction;
- window/door frame, reveal or threshold construction;
- stair strings, soffits, guards, handrails, newels or finish build-up;
- services, ducts or pipes;
- structural lintels/connections/reinforcement;
- fire, thermal, acoustic or regulatory proof.

## 8. Validation target

`publication-principal-section-source.test.ts` proves that:

- the DRW-05A cut/view remains exact;
- the section reuses the plan wall-body proxy;
- the `350 mm` inter-storey interval remains a provisional planning zone;
- ground termination and roof treatment explicitly refuse technical invention;
- exactly six opening occurrences receive vertical extents;
- all new opening extents remain provisional;
- upper sill/head values derive from the canonical upper opening family;
- stair rise/run geometry derives from canonical arithmetic;
- the section flight run is `1400 mm`, not the old schematic `1600 mm` plan-renderer trace;
- stair placement remains provisional while rise/going arithmetic remains controlled;
- no construction-detail source category appears.

## 9. Handoff to DRW-05C

DRW-05C may now add the minimum section renderer capability required by this frozen source:

1. orthographic Y/Z section projection at true `1:100`;
2. cut-wall / floor-zone poche using the bounded publication representation source;
3. beyond-line treatment distinct from cut geometry;
4. vertical opening cuts for the six crossed occurrences;
5. the three-flight stair using cut/beyond hierarchy;
6. restrained level markers and section labels in frozen paper-space grammar;
7. ground termination at FFL without invented foundation/site geometry.

DRW-05C must not broaden into a generic section/CAD framework or add construction information merely because the view can display it.

If renderer work exposes a genuinely missing architectural fact, reopen the smallest source-owning packet rather than embedding coordinates in drawing code.
