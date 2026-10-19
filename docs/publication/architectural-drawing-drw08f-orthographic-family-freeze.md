<!-- nav-exclude: redirect -->
# DRW-08F — Orthographic-family parity review and freeze

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-08F  
**Issue:** #154  
**Status:** FROZEN SUBJECT TO EXACT-HEAD VALIDATION

## Outcome

The completed Reference House orthographic family is coherent enough to freeze as the substrate for DRW-09 and DRW-10.

The review found **no controlled geometric contradiction requiring a redraw**. It did expose an important representational boundary that must now be explicit: several earlier plans/sections carry **view-local provisional drawing proxies** for openings that later elevations deliberately leave partially or wholly absent. Those proxies are not contradictory, but they are also **not composable 3D authority**.

DRW-09 must therefore not combine a provisional plan width, provisional section head and qualitative facade occurrence into a fictional fully resolved aperture.

## Family frozen by this packet

The orthographic substrate now comprises:

- ground-floor publication plan;
- first-floor publication plan;
- paired-plan plate;
- principal longitudinal section;
- principal front elevation;
- roof/drainage plan;
- service/transverse section;
- garden elevation;
- retained courtyard elevation material;
- synthetic setting/type plan;
- supplementary east/service-side elevation retained by DRW-02D.

The west elevation remains deliberately deleted. No new view is admitted here.

## Shared controlled substrate

The family agrees on the canonical Reference House facts:

- shell: **12,000 × 10,800 mm**;
- courtyard: **3,600 × 4,000 mm**, centred in the shell;
- courtyard extents: **X 4,200–7,800 mm / Y 3,400–7,400 mm**;
- ground FFL: **0 mm**;
- ground clear ceiling: **+2,950 mm**;
- first FFL: **+3,300 mm**;
- upper clear ceiling: **+6,000 mm**;
- cornice/outer-edge control: approximately **+6,250 mm**, still provisional;
- roof family: four very-low-slope fields draining outward.

The front, garden, courtyard and service-side elevations share those vertical datums. The service/transverse section uses the same shell/court/gallery substrate and its Y = 6,900 mm cut remains inside the controlled courtyard/service band and documented `SV-01` reservation.

## Cross-view findings

### Garden order

Ground-plan, first-floor-plan and garden-elevation axes agree at approximately:

- X = 2,100 mm;
- X = 6,000 mm;
- X = 9,900 mm.

The RH-C0.6 correction is preserved: the centre upper garden occurrence belongs to the dry dressing/storage field, not the north cross-landing.

### Courtyard order

The south and north courtyard faces remain centred on the same controlled court geometry. Their elevation-family centre axis is the local midpoint of the 3,600 mm court face and therefore registers to model X = 6,000 mm.

East/west courtyard axis coordinates remain absent. Their two-bay/two-room order is semantic authority only.

### Service side

The east elevation's south / middle / north fields are derived directly from the controlled court Y extents:

- south: shell south → courtyard south;
- middle: courtyard south → courtyard north;
- north: courtyard north → shell north.

Its MVHR, ASHP and soil-vent relationships remain aligned with the DRW-08A service source. `RWP-SE` and `RWP-NE` agree with the DRW-07 roof/drainage family while exact downpipe centrelines remain absent.

### Synthetic setting

The 1:200 synthetic setting reuses the same controlled shell and courtyard only. The approximately 15.5 m surrogate width remains outside RH-C1 and does not create plot depth, legal boundaries, geographic north, neighbours, topography or real-site utility geometry.

Analytical maintenance geometry remains owned by DRW-10D.

## View-local proxy rule

This is the principal freeze created by DRW-08F.

Earlier vertical slices sometimes had to create provisional paper-space / publication-view geometry so a specific drawing could exist. Examples include:

- the ground plan's provisional centre garden opening width;
- provisional courtyard opening widths in plan;
- the principal section's provisional garden/courtyard opening heads and sills;
- plan-view stair reservation/trace proxies.

Later elevations sometimes correctly retain less geometry because the architectural source does not own a complete aperture schedule.

These facts are not allowed to be silently unioned.

> **A view-local provisional drawing proxy proves only the drawing it was created to support. It does not become missing-axis authority for another view and does not become a 3D solid merely because another view supplies a different provisional dimension.**

For example, the ground plan may show a provisional 1,800 mm centre garden opening while the garden elevation still records the aperture width/head as absent and only owns the approximately 1,200 mm clear-opening logistics target. Likewise, a provisional section head must not be combined with the plan width to fabricate a complete garden-door object.

Any future packet that needs a genuinely resolved 3D aperture must either:

1. derive all required dimensions from one already-authoritative source family; or
2. split and harden the missing architectural source explicitly.

## Precision hierarchy after freeze

DRW-08F preserves these distinct classes:

1. **CONTROLLED / exact** — shell, court, core level datums, controlled plan relationships;
2. **CONTROLLED derived / exact** — deterministic consequences such as court extents or service-side field extents;
3. **PROVISIONAL / representable** — bounded publication proxies and current approximate architectural selections;
4. **selected outside RH-C1** — RH-04/RH-06/RH-07/RH-08/RH-10 relationships carried with provenance;
5. **ABSENT / ABSENT_TECHNICAL** — facts the project does not own and must not infer from a drawing gap.

Legacy RH-04/RH-06/RH-08/RH-10 SVG pixels remain coordination evidence only and carry no publication geometry authority.

## Machine lock

`compiler/reference-house/publication-orthographic-family-parity.test.ts` protects the highest-value family invariants:

- one shell/court substrate across views;
- shared vertical datums and roof family;
- garden-axis parity between plans and elevation;
- centred courtyard registration;
- explicit non-composability of plan/section opening proxies versus absent elevation aperture authority;
- service-side relation parity with service-section and roof sources;
- synthetic-setting real-site absences.

This is intentionally a family-level lock. It does not duplicate every per-view renderer/artifact regression already owned by DRW-03 through DRW-08E.2.

## DRW-09 admission boundary

The orthographic family is now frozen strongly enough to test a sectional axonometric, but **not** strongly enough to guarantee one deserves publication.

DRW-09A must therefore:

- select the hero cut and parallel projection first;
- prove that the intended architectural argument can be made using controlled shell/court/level/roof/spatial geometry plus explicitly admissible provisional geometry;
- refuse to infer complete windows, doors, service terminals, plant objects or construction build-ups from orthographic gaps;
- split source hardening only if the hero view genuinely earns the missing facts;
- otherwise reject the axonometric rather than weaken the authority model merely to obtain a hero image.

## Gate result

**PASS — orthographic family frozen, with an explicit non-composability boundary for view-local provisional proxies.**

No architectural redraw is required by DRW-08F itself.

**Next authorised packet:** DRW-09A — freeze the hero sectional-axonometric cut/projection and prove whether the existing orthographic substrate is sufficient.
