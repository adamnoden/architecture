<!-- nav-exclude: redirect -->
# DRW-06A — Principal front-elevation authority audit

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-06A  
**Issue:** #154  
**Status:** FROZEN — READY FOR DRW-06B  
**View:** `DRW-PUB-ELEV-FRONT`  
**Target publication scale:** 1:100

## Purpose

DRW-06A freezes the source-authority boundary for the first controlled elevation before any elevation renderer or facade geometry is hardened.

The audit answers four questions:

1. which facade is the principal publication elevation;
2. which horizontal and vertical facts may be treated as accepted geometry;
3. which apparently concrete values remain provisional and must retain that status downstream;
4. which elevation features are not presently source-authored and therefore must not be invented by the drawing layer.

This packet changes no Reference House geometry.

## Frozen view contract

The first controlled elevation is `DRW-PUB-ELEV-FRONT`, already reserved by the frozen publication view register.

Its projection contract is:

- **subject:** the south / front / public-facing facade;
- **source facade plane:** the front boundary at model `y = 0`;
- **view type:** orthographic elevation only;
- **horizontal drawing axis:** model west → east, corresponding to increasing model `x`;
- **accepted overall facade width:** `12,000 mm`;
- **vertical drawing axis:** model elevation datum;
- **nominal publication scale:** `1:100`;
- **perspective or foreshortening:** prohibited;
- **publication purpose:** facade rhythm, entrance identity, opening hierarchy and the relationship of accepted level/eaves/ridge datums.

The view register's semantic identity is authoritative. DRW-06B may implement this view; it may not reinterpret which facade is the front elevation.

## Authority matrix

| Elevation subject | Canonical authority available now | Status at DRW-06A | DRW-06B consequence |
| --- | --- | --- | --- |
| Public/front facade identity | `DRW-PUB-ELEV-FRONT`; source orientation identifies `south` as front | **Accepted / frozen** | Render this facade only |
| Facade horizontal extent | envelope width `12,000 mm` | **Accepted** | May establish the elevation's true horizontal extent |
| Front facade plane | front coordinate `y = 0` | **Accepted** | May establish the orthographic projection plane |
| Four-bay ordering | `front-formal-01`, `front-entrance-02`, `front-formal-03`, `front-formal-04` | **Accepted / frozen** | Preserve ordering and entrance identity |
| Entrance bay | `front-entrance-02` | **Accepted / frozen** | Entrance remains the second front bay |
| Ground-floor datum | GFFL `0 mm` | **Accepted** | May be used as a vertical reference datum |
| Upper-floor datum | UFFL `3,250 mm` | **Accepted** | May be used as a vertical reference datum; not automatically a visible facade line |
| Eaves / wall-plate datum | `6,000 mm` | **Accepted** | May anchor a vertical reference; does not author a complete roof silhouette |
| Ridge datum | `7,600 mm` | **Accepted** | May anchor a vertical reference; does not author a complete roof silhouette |
| Front ground principal opening family | `1,750 × 2,200 mm`, sill `450 mm` | **Provisional** | May be represented only with explicit provisional provenance until hardened |
| Front entrance opening family | `1,150 × 2,400 mm`, sill `0 mm` | **Provisional** | May be represented only with explicit provisional provenance until hardened |
| Front upper principal opening family | `1,700 × 1,900 mm`, sill `800 mm` | **Provisional** | May be represented only with explicit provisional provenance until hardened |
| Opening head heights | derivable from level + provisional sill + provisional height | **Derived from provisional** | Must remain provisional; derivation does not upgrade authority |
| Opening instances by front bay | source instances use `front-bay` placement with bay indices | **Semantically controlled; dimensions provisional** | Preserve instance/bay identity while propagating provisional geometry status |
| Front canopy level | `2,850 mm` | **Provisional** | Must not be presented as an accepted facade datum |
| Roof family / morphology | `four-low-slope-fields`, outward drainage, related roof-family data | **Provisional** | Do not draw a resolved front roof silhouette as accepted architecture |
| Roof qualitative material | slate appears in the derived Reference House model | **Insufficient for elevation geometry authority** | Material semantics do not author profile geometry |
| Party-wall parapet expression | derived model semantics exist | **Not a frozen front-elevation profile** | Require explicit 06B source treatment before rendering as controlled profile geometry |
| Facade panel / seam geometry | no canonical elevation-panel geometry identified | **Absent** | Do not infer panel widths, joints or decorative bay divisions from the four-bay semantic order |
| Visible slab line | UFFL datum exists; no separately authored exterior slab-edge primitive identified | **Absent as visible geometry** | Do not convert a datum into a facade line without an explicit rule |
| External ground / grade line | internal GFFL datum exists; no controlled exterior grade profile identified | **Absent** | Do not equate FFL with exterior ground level or invent terrain |
| Full front roof profile | eaves/ridge anchors exist; roof family remains provisional | **Not source-authorised** | 06B must preserve the distinction between accepted datums and provisional morphology |
| Perspective depth / side return | none required by the frozen view | **Out of scope / prohibited** | Elevation remains orthographic; no perspective side reveal may be introduced |

## Opening-authority rule

The source contains two different kinds of information that must not be collapsed into one authority level.

The **front bay order and entrance-bay identity are accepted semantic facts**. They answer which bay is which and preserve the intended public-facing rhythm.

The **opening-family width, height and sill values are provisional**. Their presence in concrete fixture objects or derived geometry does not promote them to accepted architecture. Any opening head calculated from those values inherits the provisional status.

Therefore:

> A deterministic derivation from provisional inputs remains provisional.

DRW-06B must carry provenance/status through projection rather than treating computability as authority.

## Datum-authority rule

Accepted vertical datums may be used to locate and test the elevation, but they do not automatically create visible architectural edges.

Specifically:

- GFFL `0 mm` is an accepted building datum, not an authorised exterior grade line;
- UFFL `3,250 mm` is an accepted level datum, not an authorised visible slab course;
- eaves / wall plate `6,000 mm` and ridge `7,600 mm` are accepted vertical anchors, but the roof family that connects them remains provisional.

This distinction is mandatory. The elevation renderer must not manufacture facade articulation merely because a useful datum exists.

## Four-bay semantics are not facade-panel geometry

The frozen front order establishes four semantic bays and fixes the entrance as bay two. It does **not** establish four equal-width masonry panels, pilasters, joints, seams, recesses or other facade subdivisions.

Until a canonical facade-projection rule exists, DRW-06B must not infer physical panel boundaries from the semantic bay list.

If an opening requires a horizontal centre derived from a bay, that derivation must be explicitly specified and provenance-bearing; it must not silently imply a stronger facade articulation than the source supports.

## Roof boundary

The source is deliberately asymmetric here:

- eaves / wall-plate elevation is accepted;
- ridge elevation is accepted;
- the roof-family object remains provisional;
- the complete front-elevation roof silhouette is therefore **not** accepted geometry.

DRW-06B may expose accepted datum anchors and may construct a provisional profile where required for a controlled proof, but it must label that provenance honestly. It may not present a particular hip/parapet/profile resolution as settled merely because it fits between accepted eaves and ridge heights.

## Ground boundary

No canonical exterior grade profile was identified in the audited source.

The drawing system therefore has no authority in DRW-06A to draw a literal ground line at `z = 0`, a plinth height, steps, falls, paving profile or terrain relationship. Those must come from explicit source authority or remain absent/provisional.

The accepted GFFL datum may still be used for measurement and vertical coordination.

## DRW-06B hardening requirements

DRW-06B is authorised to create the canonical front-elevation source/projection layer, but only under these constraints:

1. project the accepted `12,000 mm` facade width orthographically at true scale;
2. preserve `DRW-PUB-ELEV-FRONT` and the south/front orientation;
3. preserve the frozen four-bay order and entrance-bay identity;
4. preserve accepted GFFL, UFFL, eaves/wall-plate and ridge datums as source-backed references;
5. propagate provisional status for opening widths, heights, sills, heads and any geometry derived from them;
6. propagate provisional status for roof morphology and canopy geometry;
7. define any bay-to-opening horizontal placement rule explicitly rather than relying on accidental fixture coordinates;
8. do not create facade panels, visible slab courses, exterior grade, decorative divisions or resolved roof morphology without source authority;
9. prohibit perspective projection and fit-derived geometry;
10. fail explicitly when a requested controlled line cannot be sourced at the required authority level.

A renderer is not authorised to fill these gaps aesthetically.

## Audit conclusion

The principal front elevation is sufficiently specified to proceed to a controlled source-hardening packet, but it is **not** sufficiently specified to pretend that every visible facade line is accepted architecture.

DRW-06A therefore freezes a mixed-authority elevation:

- **accepted:** view identity, orientation, 12 m facade extent, four-bay order, entrance identity and principal vertical datums;
- **provisional:** opening dimensions, canopy and roof morphology, together with geometry derived from those fields;
- **absent:** canonical facade-panel geometry, visible slab-line geometry and exterior grade profile.

That boundary is the result of the audit, not a deficiency to be hidden.

## No-change declaration

DRW-06A changes no architectural geometry, opening dimensions, facade layout, levels, roof geometry or publication drawing geometry. It freezes source authority only.

## Handoff

**Next packet: DRW-06B — harden canonical front-elevation source geometry.**

DRW-06B must encode the accepted/provisional distinction above before any controlled front-elevation SVG is generated. If a required visible element cannot be produced without inventing absent authority, the packet must stop or split rather than guess.
