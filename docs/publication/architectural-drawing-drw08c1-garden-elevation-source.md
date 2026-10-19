<!-- nav-exclude: redirect -->
# DRW-08C.1 — Garden-elevation source hardening

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-08C.1  
**Issue:** #154  
**Status:** IMPLEMENTED — PENDING VALIDATION

## Why DRW-08C split

DRW-02D retains the north/garden elevation as a `SUPPORTING` true-`1:100` publication view. Its job is specific: show the three-field rear order, the principal garden threshold, and the refusal of one undifferentiated glazed wall while retaining meaningful masonry piers.

The DRW-08C source audit found that this view cannot honestly be generated directly from RH-C1.

RH-10 owns a three-axis garden composition at approximately `X = 2.1 / 6.0 / 9.9 m` and identifies the six room-owned opening occurrences. RH-C1, however, only carries the centre garden opening relationships qualitatively and does not contain a complete numeric rear-opening schedule. RH-10 also states explicitly that exact garden opening widths remain unresolved technical / G-01 work.

The split rule therefore applies. DRW-08C.1 hardens only the publication source; DRW-08C then resumes generation and physical proof.

## Frozen view

`REFERENCE-HOUSE-GARDEN-ELEVATION`

- north facade, looking south toward the building;
- facade plane at canonical shell north, `Y = 10,800 mm`;
- horizontal axis west → east / model `+X`;
- true publication scale `1:100`;
- controlled facade width `12,000 mm`;
- canonical level datums retained without inventing visible slab courses or exterior grade.

The view identity is controlled by DRW. The three garden axes are not promoted into RH-C1: they remain `RH10_SELECTED_OUTSIDE_RH_C1`, approximate, and provenance-bearing.

## Three-field order

RH-10's selected order is retained as:

- west axis ≈ `2,100 mm`;
- centre axis ≈ `6,000 mm`;
- east axis ≈ `9,900 mm`.

The relationship is architectural rather than facade-panel geometry: three separated room-owned opening fields with masonry remaining between them. No panel joints, pilasters, decorative bays or masonry pier widths are invented from those axes.

## Opening authority

### Ground west

A family-room window is a selected RH-10 occurrence. For publication representation it may reuse the existing provisional `FAM-FRONT-GROUND-PRINCIPAL` window family because that family already supplies a bounded occupied-window width/sill/head vocabulary. Reuse does **not** make those dimensions controlled and does not assert a final rear-window product.

### Ground centre

The principal garden-dining threshold is a selected occurrence. RH-08/RH-10 provide an approximately `1,200 mm` clear-opening coordination target.

That target is **not** converted into a final wall aperture. Aperture width, head, threshold build-up and exterior grade remain absent. DRW-08C may therefore show the target/occurrence using restrained provisional notation, but it may not draw invented jamb/head geometry and call it architecture.

### Ground east

RH-10 deliberately leaves this as a kitchen `window / door family` pending furniture and service-wall design. The occurrence and axis are selected; the opening kind and dimensions remain absent.

### Upper west/east

The principal-bedroom and east-rear-bedroom windows are selected RH-10 occurrences. They may reuse the existing provisional upper-window family for bounded publication representation. Their egress performance remains downstream technical design.

### Upper centre

RH-C0.6 corrected the host identity: this is a dry dressing/storage-field window associated with `U-DRESS-01`, not a north cross-landing window. The occurrence is retained. RH-10 says it may be narrower/lighter than bedroom openings, so its width remains absent rather than silently copied from the bedroom family. The existing provisional upper-window sill/head family may still bound its vertical representation.

## Explicit absences

The source keeps these machine-visible:

- exterior garden grade;
- garden threshold construction;
- final garden-door aperture width and head;
- ground-east opening kind and dimensions;
- upper-centre opening width;
- ridge datum;
- facade-panel / decorative geometry.

A deterministic renderer must omit, mark provisionally, or refuse any graphic that requires those facts. It may not infer them from symmetry or graphic convenience.

## Legacy RH-10 elevation SVG

`outer-elevations-rh10.svg` remains useful coordination evidence for the intent of the rear/service elevations, but its pixel coordinates are **not publication geometry**.

DRW-08C.1 therefore records it as:

`QUARANTINED_COORDINATION_EVIDENCE / geometryAuthority: NONE`

No numeric coordinate in that SVG may be imported into the controlled garden-elevation renderer.

## Handoff

Resume **DRW-08C — generate and prove garden elevation** from this source.

The renderer must distinguish real provisional aperture envelopes from axis-only / target-only unresolved occurrences. If the view cannot remain architecturally legible without fabricating the absent ground-centre, ground-east or upper-centre geometry, DRW-08C must stop rather than manufacture completeness.
