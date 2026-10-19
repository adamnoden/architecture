<!-- nav-exclude: redirect -->
# DRW-06C — Principal front-elevation renderer capability

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-06C  
**Issue:** #154  
**Status:** IMPLEMENTED — PENDING VALIDATION  
**View:** `REFERENCE-HOUSE-PRINCIPAL-FRONT-ELEVATION`  
**Scale:** 1:100

## Purpose

DRW-06C adds only the renderer capability required to turn the DRW-06B front-elevation source into an honest architectural elevation scene. It does not generate the controlled SVG artifact or compose its publication plate; those remain DRW-06D and DRW-06E.

The governing constraint is the mixed authority frozen by DRW-06A and encoded by DRW-06B. A renderer may make that authority legible. It may not upgrade provisional geometry or fill absent geometry aesthetically.

## Projection

The shared publication projection layer now has an explicit elevation projection:

- horizontal model X increases left-to-right;
- elevation increases upward while SVG Y increases downward;
- model millimetres are divided only by the frozen scale denominator;
- no perspective, foreshortening or fit-derived scaling exists at this boundary.

At 1:100 the 12,000 mm facade is therefore exactly 120 mm on paper.

## Facade profile

The renderer uses the controlled facade width but the upper termination is the provisional cornice/eaves control. Consequently the side profile and cornice control are rendered with the provisional line type and an explicit authority note.

The lower drawing termination is the controlled GFFL datum. It is not joined by a facade-wide line and is explicitly marked as a drawing termination, not exterior grade. No terrain, plinth, steps, threshold or paving profile is inferred.

No ridge or roof silhouette is drawn because DRW-06B records the ridge datum as absent and the roof morphology as provisional without enough authority for a resolved front profile.

## Opening representation

All front-opening dimensions remain provisional.

The renderer therefore follows DRW-01C uncertainty doctrine:

- approximate dimensions use the provisional short-dash line type;
- range dimensions retain both source-owned bounds rather than selecting a midpoint or preferred value;
- width ranges use an outer maximum envelope plus paired inner minimum extents;
- sill/head ranges use their paired vertical bounds;
- a concise note states that the geometry is provisional and paired extents are source ranges.

The entrance is deliberately incomplete. Its width and head are bounded, but its sill/threshold is unresolved. DRW-06C therefore renders only the authorised head/width relationship and states that the lower termination is unresolved. It does not invent a door sill, threshold or connection to GFFL.

## Datums

GFFL, ground ceiling, first FFL and upper ceiling remain controlled coordination datums. They are rendered as short side references only, outside the facade extent. They do not become visible facade courses or slab edges.

The cornice control is likewise shown at the side, but with an approximation cue and provisional line type.

## Surface and beyond geometry

No facade material, panel, seam, pilaster, course or decorative surface geometry is source-authorised, so none is drawn.

The existing drawing grammar already has a secondary/beyond line role, but this elevation has no source-owned behind-plane geometry that earns representation. DRW-06C therefore adds no decorative depth or side-return lines merely to make the elevation look richer.

This absence is intentional architectural honesty, not missing renderer capability.

## Regression boundary

Tests lock:

- literal 1:100 X/Z projection;
- exact 120 mm paper facade width;
- controlled bay-axis placement;
- provisional/range opening treatment;
- unresolved entrance lower termination;
- no facade-wide grade line;
- no ridge, canopy, facade panels, slab courses or decorative geometry;
- side-only datum treatment;
- deterministic SVG serialization and no packet-history leakage.

## Explicit non-work

DRW-06C does not:

- change the Reference House source;
- promote provisional opening or roof facts;
- select a ridge, threshold, grade or decorative facade language;
- generate the controlled front-elevation SVG;
- add plan elevation markers;
- compose or physically prove the elevation plate.

## Handoff

**Next packet: DRW-06D — generate and verify the controlled principal front elevation.**

DRW-06D must serialize this scene through the controlled SVG path and prove opening/bay/level parity against the established plan and section substrate before the elevation enters a publication plate.
