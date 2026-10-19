<!-- nav-exclude: redirect -->
# DRW-06B — principal front-elevation source

**Status:** source hardening packet  
**Depends on:** DRW-06A authority freeze

## Result

The principal south/front elevation now has one canonical publication source boundary at `compiler/reference-house/publication-front-elevation-source.ts`.

The source carries only facts authorised by DRW-06A:

- facade plane `y = 0`;
- west→east model `x` as horizontal axis;
- controlled facade width `12,000 mm`;
- controlled four-axis field at `2,700 mm` spacing, deterministically projected to `1,950 / 4,650 / 7,350 / 10,050 mm`;
- entrance membership at bay 3;
- ground role sequence principal window / stair window / entrance / principal window;
- controlled internal datums GFFL `0`, ground ceiling `2,950`, first FFL `3,300`, upper ceiling `6,000 mm`;
- canonical opening-family dimensions without upgrading their provisional authority;
- provisional cornice/eaves control and roof morphology without upgrading them.

## Refusal boundary

The source makes the following geometry explicitly absent rather than fabricating it:

- ridge datum;
- exterior grade/profile;
- canopy geometry;
- facade-panel geometry;
- visible slab-line geometry;
- decorative geometry.

Bay axes are opening-placement axes only. They are not facade panel edges. The derived axis coordinates are consequences of controlled source facts, not independent architectural selections.

## Gate to DRW-06C

DRW-06C may render only this source contract. It must not infer absent geometry, silently promote provisional values, or use legacy elevation studies as authority.
