<!-- nav-exclude: redirect -->
# DRW-06A — Principal front-elevation authority audit

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-06A  
**Issue:** #154  
**Status:** FROZEN — PENDING VALIDATION  
**View:** `DRW-PUB-ELEV-FRONT`  
**Target publication scale:** 1:100

## Purpose

DRW-06A freezes the source-authority boundary for the first controlled elevation before any elevation renderer or facade geometry is hardened.

The audit answers four questions:

1. which facade is the principal publication elevation;
2. which horizontal and vertical facts may be treated as controlled geometry;
3. which apparently concrete values remain provisional and must retain that status downstream;
4. which elevation features are not presently source-authored and therefore must not be invented by the drawing layer.

This packet changes no Reference House geometry.

## Canonical source used by this audit

The controlling architectural schedule is the current RH-C0 baseline and its executable `ReferenceHouseSource`. Where a derived value exists, its authority is inherited from the facts that produce it; derivation does not promote provisional input to controlled architectural truth.

The frozen publication view register supplies the reader task and public drawing identity. It does not supersede RH-C0 geometry.

## Frozen view contract

The first controlled elevation is `DRW-PUB-ELEV-FRONT`, already reserved by the frozen publication view register.

Its projection contract is:

- **subject:** the south / front / public-facing facade;
- **source facade plane:** the shell south boundary at model `y = 0`;
- **view type:** orthographic elevation only;
- **horizontal drawing axis:** model west → east, corresponding to increasing model `x`;
- **controlled overall facade width:** `12,000 mm`;
- **vertical drawing axis:** model elevation datum;
- **nominal publication scale:** `1:100`;
- **perspective or foreshortening:** prohibited;
- **publication purpose:** four-bay order, off-centre entrance, opening hierarchy and the stair-window consequence.

DRW-06B may implement this view. It may not reinterpret which facade is the front elevation.

## Authority matrix

| Elevation subject | Canonical authority available now | Status at DRW-06A | DRW-06B consequence |
| --- | --- | --- | --- |
| Public/front facade identity | `DRW-PUB-ELEV-FRONT`; fixture coordinates define south as the front surrogate | **Controlled / frozen** | Render this facade only |
| Facade horizontal extent | shell width `12,000 mm` | **Controlled** | May establish the elevation's true horizontal extent |
| Front facade plane | shell south boundary `y = 0` | **Controlled** | May establish the orthographic projection plane |
| Principal front field | `4` bays at `2,700 mm` spacing, field centred on shell centre X | **Controlled / authored** | Preserve the rule; do not replace it with four equal facade panels |
| Front bay axes | `X = 1,950 / 4,650 / 7,350 / 10,050 mm` | **Controlled / derived** | Derive from the front-field rule rather than re-authoring four coordinates |
| Entrance membership | bay `3` | **Controlled / authored** | Entrance centre derives to `X = 7,350 mm` |
| Ground opening role sequence | bay 1 principal window; bay 2 stair window; bay 3 entrance; bay 4 principal window | **Controlled membership; provisional sizes** | Preserve role and bay membership while propagating provisional dimensional authority |
| Upper opening membership | one upper front window on each bay axis | **Controlled membership; provisional sizes** | Preserve four-axis alignment while propagating provisional dimensional authority |
| Ground FFL | `0 mm` | **Controlled** | May be used as a vertical reference datum; it is not an exterior grade line |
| Ground clear ceiling | `+2,950 mm` | **Controlled** | May be used as a coordination datum; not automatically a visible facade edge |
| First-floor FFL | `+3,300 mm` | **Controlled** | May be used as a vertical reference datum; not automatically a visible facade line |
| Upper clear ceiling | `+6,000 mm` | **Controlled** | May be used as a coordination datum; not automatically a cornice/eaves profile |
| Outer cornice/eaves control | `≈+6,250 mm` | **Provisional** | May be represented only with explicit provisional provenance |
| Ground principal window family | width `≈1,050 mm`; sill `≈650–700 mm`; head `≈2,550 mm` | **Provisional** | Preserve approximate/range precision; do not collapse to false exactness |
| Ground stair-window family | width `≈900 mm`; sill `≈1,050 mm`; head `≈2,550 mm` | **Provisional** | Preserve stair-window distinction and provisional precision |
| Entrance opening family | width `≈950–1,050 mm`; head `≈2,550 mm` | **Provisional** | Do not invent a selected door width, leaf, sill/threshold or construction detail |
| Upper front window family | width `≈900–950 mm`; sill `≈800 mm` above first FFL; head `≈2,350 mm` above first FFL | **Provisional** | Any absolute sill/head ordinate remains derived from provisional opening geometry |
| Roof family | `four-low-slope-fields`, outward drainage, nominal `1:40` screening fall, outer-edge control `6,250 mm` | **Provisional** | Do not present a resolved front roof silhouette as controlled architecture |
| Ridge datum | no canonical RH-C0 ridge ordinate | **Absent** | Do not invent or import a legacy ridge height |
| Facade panel / seam geometry | no canonical elevation-panel geometry identified | **Absent** | Do not infer panel widths, joints, pilasters or decorative divisions from bay semantics |
| Visible floor/slab lines | level datums exist; no exterior slab-edge primitive identified | **Absent as visible geometry** | Do not convert datums into facade lines without an explicit source rule |
| External ground / grade line | no controlled exterior grade profile identified | **Absent** | Do not equate GFFL with exterior grade or invent terrain/steps/plinth geometry |
| Canopy geometry | no canonical RH-C0 front-canopy source fact identified | **Absent** | Do not introduce a canopy from legacy or illustrative material |
| Perspective depth / side return | none required by the frozen view | **Out of scope / prohibited** | Elevation remains orthographic; no perspective side reveal |

## Front-field authority rule

The RH-C0 source does not author four independent facade panels. It authors one front-field rule:

- four axes;
- `2,700 mm` spacing;
- centred on the `12,000 mm` shell;
- entrance membership at bay 3.

The resulting axes `1,950 / 4,650 / 7,350 / 10,050 mm` are deterministic consequences of that rule.

This matters because the drawing may use those axes to place source-owned openings, but it may not turn the axis field into unsupported masonry panel edges, pilasters, joints, recesses or other facade articulation.

## Opening-authority rule

The source contains two authority layers that must remain distinct.

**Controlled:**

- which front axis each opening belongs to;
- the entrance's membership in bay 3;
- the bay-2 stair-window role;
- one upper window on each of the four front axes.

**Provisional:**

- window and entrance widths;
- sill and head values;
- any absolute vertical ordinate derived from those provisional values.

The concrete opening objects in the executable fixture do not promote their family dimensions to controlled geometry.

Therefore:

> A deterministic derivation from provisional inputs remains provisional.

DRW-06B must carry provenance, precision and disposition through projection rather than treating computability as authority.

## Datum-authority rule

Controlled level datums may be used to locate and test the elevation, but they do not automatically create visible architectural edges.

Specifically:

- GFFL `0 mm` is a building datum, not an authorised exterior grade line;
- ground clear ceiling `+2,950 mm` is a coordination datum, not a facade course;
- first-floor FFL `+3,300 mm` is a level datum, not an authorised visible slab edge;
- upper clear ceiling `+6,000 mm` is a coordination datum, not an accepted eaves line;
- cornice/eaves control `≈+6,250 mm` is itself provisional;
- RH-C0 provides no controlled ridge ordinate.

The elevation renderer must not manufacture facade or roof articulation merely because vertical coordination numbers exist.

## Roof boundary

The roof source is wholly provisional at this architectural slice. It currently carries:

- `four-low-slope-fields` topology;
- outward drainage;
- a nominal `1:40` screening fall relation;
- `6,250 mm` outer-edge control.

Those data are sufficient to preserve a bounded working roof relationship, but not to claim a controlled principal-elevation roof profile. In particular, no RH-C0 ridge datum exists.

DRW-06B may encode the provisional roof relation if required for later rendering, but any visible profile derived from it must remain visibly/provenance-wise provisional. It must not import a legacy ridge, hip, parapet or silhouette to make the plate look complete.

## Ground boundary

No canonical exterior grade profile was identified in the audited source.

The drawing system therefore has no authority in DRW-06A to draw a literal ground line at `z = 0`, a plinth height, steps, falls, paving profile or terrain relationship. Those must come from explicit source authority or remain absent/provisional.

The controlled GFFL datum may still be used for measurement and vertical coordination.

## DRW-06B hardening requirements

DRW-06B is authorised to create the canonical front-elevation source/projection layer, but only under these constraints:

1. project the controlled `12,000 mm` facade width orthographically at true scale;
2. preserve `DRW-PUB-ELEV-FRONT` and the south/front orientation;
3. derive the four front axes from the controlled centred `4 × 2,700 mm` field rule;
4. preserve the controlled ground role sequence: principal window / stair window / entrance / principal window;
5. preserve the entrance at bay 3 and upper windows on all four bay axes;
6. preserve GFFL, ground-ceiling, first-FFL and upper-ceiling datums as controlled references without turning them into unsourced facade lines;
7. propagate provisional authority and original precision for all opening-family dimensions and any geometry derived from them;
8. propagate provisional authority for cornice/eaves control and roof-family geometry;
9. do not create a ridge datum, canopy, facade panels, visible slab courses, exterior grade, decorative divisions or resolved roof morphology without source authority;
10. prohibit perspective projection and fit-derived geometry;
11. fail explicitly when a requested controlled line cannot be sourced at the required authority level.

A renderer is not authorised to fill these gaps aesthetically.

## Audit conclusion

The principal front elevation is sufficiently specified to proceed to a controlled source-hardening packet, but it is **not** sufficiently specified to pretend that every visible facade line is controlled architecture.

DRW-06A therefore freezes a mixed-authority elevation:

- **controlled:** view identity, orientation, `12,000 mm` facade extent, centred four-axis field, bay-3 entrance membership, opening-role membership and principal internal level datums;
- **provisional:** all front-opening family dimensions, cornice/eaves control and roof family/morphology, together with geometry derived from those fields;
- **absent:** controlled ridge, canopy, facade-panel geometry, visible floor/slab-line geometry and exterior grade profile.

That boundary is the result of the audit, not a deficiency to be hidden.

## No-change declaration

DRW-06A changes no architectural geometry, opening dimensions, facade layout, levels, roof geometry or publication drawing geometry. It freezes source authority only.

## Handoff

**Next packet: DRW-06B — harden canonical front-elevation source geometry.**

DRW-06B must encode the controlled/provisional/absent distinction above before any controlled front-elevation SVG is generated. If a required visible element cannot be produced without inventing absent authority, the packet must stop or split rather than guess.
