<!-- nav-exclude: redirect -->
# DRW-08E.1 — Service-side elevation source hardening

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-08E.1  
**Issue:** #154  
**Status:** SOURCE HARDENING — NO RENDERER

## Why this packet exists

DRW-02D retained the east/service elevation as `SUPPORTING` because it proves a real architectural claim that the service/transverse section does not fully carry: the service flank is deliberately asymmetrical, technical expression is concentrated rather than scattered, the plant replacement route remains architecture, and rainwater/ventilation/utility objects remain subordinate to room-owned openings.

The fixed DRW-08 register did not assign that retained supporting view its own packet. DRW-08E therefore hands off to this bounded insertion before DRW-08F.

## Authority recovered

The canonical RH-C1 source owns:

- east facade plane at model `X = 12,000 mm`;
- total south→north facade depth `10,800 mm`;
- courtyard-derived field breaks at model `Y = 3,400 / 7,400 mm`;
- vertical datums and provisional cornice/roof control.

RH-10 owns the architectural service-side order:

- south field — study / east-front bedroom;
- middle field — service suite / family bathroom;
- north field — kitchen / east-rear bedroom;
- technical expression concentrated in the middle field rather than distributed as an equipment dump;
- occupied openings and the plant replacement opening remain visually controlling over technical terminals.

RH-06 / RH-07 / RH-08 own the selected service relationships reused here:

- nominal `1000 mm` plant replacement clear-opening target, with final aperture position/head absent;
- `UE-01` grouped low utility-entry geography;
- preferred high-level service-side `PEN-MV-01` MVHR intake/exhaust boundary geography;
- `ASHP-01` relation beside plant, without a selected footprint;
- short local `KX-01` cooker terminal geography;
- `RWP-SE` and `RWP-NE` near the south/front and north/rear returns;
- soil-vent roof continuation on the east/service roof field.

## Deliberate absences

The project still does **not** own a complete east-facing aperture or terminal schedule. This packet therefore keeps machine-visible absence for:

- study, bathroom and kitchen opening centres/sizes;
- plant-opening centre/head;
- utility penetration points;
- MVHR terminal points/separation;
- cooker-terminal point;
- downpipe centrelines;
- ASHP product footprint;
- exterior grade;
- technical wall build-up;
- facade panels, decorative screen and material pattern.

The RH-10 `outer-elevations-rh10.svg` remains coordination evidence only. Its pixel coordinates contribute no publication geometry.

## Renderer consequence

The next service-side packet may draw the controlled facade envelope and exact three plan-owned field extents. It may show selected openings/services as labelled occurrences, targets or qualitative zones. It may **not** convert those labels into point coordinates, aperture rectangles, pipe centrelines or equipment outlines unless a source already owns that geometry.

Field breaks are composition/ownership boundaries, not facade-panel seams.

## Handoff

After this source packet validates and merges, generate/prove the retained service-side elevation at true `1:100`, then proceed to DRW-08F orthographic-family parity/freeze.
