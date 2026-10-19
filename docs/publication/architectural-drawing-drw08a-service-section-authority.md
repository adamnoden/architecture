<!-- nav-exclude: redirect -->
# DRW-08A — Service / transverse section authority and source hardening

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-08A  
**Issue:** #154  
**Status:** FROZEN — PENDING VALIDATION

## Reader task

The retained service/transverse section must prove four architectural facts at `1:100`:

1. high-service geography is stacked rather than dispersed;
2. the bounded `SV-01` vertical reservation actually joins the ground plant/service field to the upper bathroom/service edge;
3. dry-side access remains available from circulation/service territory;
4. current service classes can be coordinated without pretending the drawing is MEP or construction design.

This packet freezes the view and its authority boundary before any section renderer is introduced.

## Frozen publication view

- view ID: `REFERENCE-HOUSE-SERVICE-TRANSVERSE-SECTION`;
- projection: orthographic section, west → east along model `x`;
- selected cut plane: model `Y = 6,900 mm`;
- scale: `1:100`;
- cut basis: midpoint of the RH-06 approximate `SV-01` north/south reservation (`Y ≈ 6,550–7,250 mm`).

The cut plane is an **exact publication-view selection**, not a claim that `6,900 mm` is itself a newly controlled architectural datum. It lies inside both the canonical courtyard/service band and the documented `SV-01` reservation.

At that cut the canonical horizontal sequence is:

`west occupied ring → courtyard void → east gallery → stacked service/bathroom field → east/service exterior`.

## Authority matrix

### Controlled RH-C1 substrate

The section may use these as controlled geometry:

- shell width `12,000 mm`;
- courtyard faces at `X = 4,200 / 7,800 mm`;
- east gallery/service division at `X = 9,100 mm`;
- ground FFL `+0`;
- ground clear ceiling `+2,950 mm`;
- first FFL `+3,300 mm`;
- upper clear ceiling `+6,000 mm`;
- the resulting `350 mm` architectural inter-storey reservation;
- frozen `G-GAL-01`, `U-GAL-02` and `U-BATH-01` plan relationships.

The `350 mm` reservation is **not** a selected joist depth or complete floor build-up.

### Selected but approximate / qualitative service geography

The section may represent, with explicit weaker authority:

- `G-PLANT-01` as the approximate north part of `G-SVC-02`;
- `SV-01` clear reservation at approximately `900 × 700 mm`, around `X ≈ 9.15–10.05 m`, `Y ≈ 6.55–7.25 m`;
- `PEN-SV-01` / `SV-RES` as an approximately `1050 × 850 mm` engineering-starting envelope around the riser reservation;
- ground access from `G-GAL-01` / `G-PLANT-01` and upper dry-side access from `U-GAL-02`;
- one 100 mm-class soil/vent stack;
- domestic-water risers;
- low-temperature hydronic risers under the RH-10 working baseline;
- segregated dry electrical/data vertical distribution;
- `MV-SUP-01` and `MV-EXT-01` principal MVHR trunks, with only the RH-07 working `160–200 mm` duct class shown as an approximate capacity check;
- plant-room classes: `MVHR-01`, DHW/hydraulic equipment, electrical/controls/service index and riser working access;
- qualitative east/service-side relationships for `PEN-MV-01`, `PEN-HS-01`, `PEN-FD-01` and the soil-vent roof continuation.

The drawing may show **capacity classes and topology**, not exact internal packing.

## Superseded RH-06 drawing statements

`docs/reference-house/service-riser-section-rh06.svg` remains coordination evidence only and has **no publication geometry authority**.

Two statements in that inherited schematic are specifically stale:

- direct `BX-01` bathroom extract is no longer the baseline; RH-07 selects central MVHR extract and retains direct wall extract only as fallback;
- MVHR ducts are no longer excluded from `SV-01`; RH-07 explicitly adds the principal supply/extract trunks to the same bounded vertical reservation, subject to later MEP rejection/rewind criteria.

The publication section must follow RH-07/RH-10 current state, not redraw the older SVG.

## Explicit absences / stop conditions

DRW-08B must not invent any of the following merely to make the section look complete:

- exact internal riser packing;
- final structural-opening size;
- joist/trimmer/member design;
- fire/acoustic closure construction;
- exact duct sizes beyond the stated working class;
- exact water/hydronic/electrical route coordinates;
- branch centrelines;
- exact plant equipment packing or product outlines;
- exact boundary-penetration coordinates;
- resolved external-wall build-up;
- resolved roof/upper-distribution geometry.

Likewise, provisional wall-thickness planning ranges must not become a falsely exact construction section.

If a required visible line depends on one of those absent facts, the renderer must omit it or represent the relationship as qualified notation. It may not infer a plausible detail.

## DRW-08B handoff

DRW-08B may now generate and physically prove the service/transverse section using only this hardened source.

The intended graphic is an **architectural section with service-capacity overlays**, not a riser detail and not an MEP schematic. Exact pipes, ducts, equipment blocks and construction layers are outside scope unless later specialist design earns them.
