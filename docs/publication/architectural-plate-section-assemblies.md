<!-- nav-exclude: redirect -->
# Section junctions and reusable representation

## Question and authority

Starting main: `402661893330f7a46ecdd41dc92267c9c97e2715`. The owner requests the last section feedback first, then a review of PLT's accumulated house-specific drawing code for reusable engine capabilities. Accepted plan and twin-pitched roof remain held. This is representation work, not a technical design release.

## Feedback correction

The principal cut now continues both masonry leaves beneath the floor datum into a dashed support reservation. The envelope is a diagrammatic connection obligation, not a chosen footing profile, depth or width; it must not be dimensioned. Ground build-up remains a reservation. Opening heads have separate provisional support zones per leaf and an explicit cavity closure convention; these are not sized lintels or selected thermal/moisture details. The court opening is a door, with its frame beneath the head.

Closely spaced finish/deck boundaries are combined at BOOK scale and separated at WALL scale. The service void is unfilled space between members and ceiling; its redundant dashed centreline is removed. Limited storage decking has a leader label, as does the first-floor top package. Historical PLT11 remains tied to `section-exemplar-05.ts`.

## Limitations

The source owns the provisional visual reservations. Structural adequacy, ground conditions, footing selection, lintel capacity/bearing, cavity trays, damp proofing, thermal continuity and actual support connections remain unresolved. Neither the support envelope's drawn extent nor nominal member depths are engineering evidence. No physical print acceptance, maturity increase or drawing freeze follows.

## Review of accumulated PLT changes

| Capability / decision | Disposition and ownership |
|---|---|
| Orthogonal wall joins, cavity bands, true aperture subtraction, uncertainty and dimensions | Already shared in ADE topology, assembly/opening compilers and dimension drawing; reuse rather than duplicate. |
| Door swings, window plan symbols, fixture notation and return stair | Already shared in opening-symbol, fitting-drawing and stair-drawing; source owns handing, sizes, stair geometry and accessibility assumptions. |
| Physical scales, line roles, grey material separation, font/dash hierarchy, vector backend | Already shared in projections, v2 backend and candidate tokens. Physical token acceptance still belongs to PLT. |
| Layered vertical cuts, reversed leaf orientation, sloping wall caps and real voids | Now shared in section-assemblies; consumes nominal source-owned layers and hosted opening extents. No inferred 3D cut. |
| Opening head zones and cavity closure convention | Now shared parameterised representation; callers must author which leaves have head support and its nominal drawing depth. No automatic lintel selection. |
| Below-ground leaf continuation and connection to support reserve | Now shared. Dashed envelope carries non-dimensionable, unselected-foundation metadata. No universal footing size/type. |
| Floor/ceiling packages, separate clear timber ends and indicative support seats | Now shared. Source owns all depths, gaps and seat geometry; the engine checks extents and seat reach, not capacity/anchorage. |
| Thin finish/deck legibility at BOOK versus WALL scale | Now shared physical-boundary threshold; semantic layer IDs survive coalescence. Voids are unfilled gaps, never dashed materials. |
| Face-on frame/grid/head/sill notation and cut door/frame/fanlight/threshold | Now shared in aperture-drawing. The principal section uses it for beyond-cut windows and both cut doors. Grid counts/profiles are explicit caller inputs. |
| Five-bay Georgian front, six-over-six style, paired panelled door and cornice/plinth | Remain house/grammar-owned. Existing elevation adapters can adopt the new aperture helper when their family is revised; historical packs do not silently change. |
| 12 m shell, centred square court, flush rooms, tall ceilings, stair position, utility/plant split | Remain Reference House architecture; not engine rules. |
| Twin pitched ring, 25 degrees, no roof openings and no flat roofs | Remain selected project geometry/brief. Generic roof-field inference is not earned by this one case. |
| Risers, plumbing adjacency, plant capacity, access and analytical structural overlays | Remain source/evidence obligations. The old technical compiler is not proof of the changed house; no automatic upgrade is claimed. |
| Book spreads, page pairing, subtraction, physical proof and v2 integration | Remain publication/programme work, not architectural engine defaults. |

## Shared contract and proof

Current house rendering calls shared `sectionWallToDrawingPrimitives`,
`sectionFloorToDrawingPrimitives`, `framedApertureToDrawingPrimitives` and
`cutApertureToDrawingPrimitives`. Its decisions live in `georgian/section-source.ts`.
No shared module imports the Reference House. The old one-off wall builder and
floor loops are removed from the current section adapter, rather than retained
beside the new API. Historical snapshots are immutable comparison sources.

The independent asymmetric fixture changes wall sizes, handedness, spans, storey
levels, aperture positions, head depths and floor packages without a courtyard.
Tests also translate it through negative/positive coordinates and check cavity
width, mirrored closure, empty voids, continuous support, seat reach, physical
scale coalescence and fail-closed invalid inputs. House regression checks hold
roof/elevation primitive geometry unchanged at both scales and retain historical
PLT11 identities. This proves reuse within the API's vertical-cut/horizontal-floor
domain, not automatic support for every future house or construction system.

`publication/specimens/plt12` supplies six sheets at B5/A4 1:100 and A2 1:50;
the last sheet is the independent fixture. The specimen number is not programme
PLT-12 completion. Finished-PDF checks cover all 18 pages, page dimensions, actual
scale, embedded fonts, text bounds and source/scene fingerprints. Actual print
acceptance and full remaining-section migration remain open.
