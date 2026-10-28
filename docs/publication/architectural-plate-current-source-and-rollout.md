<!-- nav-exclude: redirect -->
# PLT working source and family rollout

## Joined section exemplar and twin roof

The owner approves the [joined section exemplar](architectural-plate-joined-section.md): plan-consistent cavity leaves, joined cut regions, nominal inner-leaf bearing and roof underside junctions, plus 25-degree falls inward and outward. Use `georgian/section-exemplar.ts` for this roof/section successor. Full family rollout follows exemplar review; older outward-only views remain historical.

## Current section and roof candidates

[Sections and roof](architectural-plate-sections-roof.md) now supply locator, principal/service cuts, a four-field roof plan and a separate water/failure reading. These consume the simple-roof successor; final book-spread composition, technical obligations and physical proof remain open.

## Current exterior revision

The owner subsequently approves the [simplified roof and facade](architectural-plate-simple-roof.md). Use `georgian/facade-source.ts` for new exterior/section work, retaining the accepted ground/first plan geography. The mansard, dormers and standing attic stair are superseded; do not mix their historical previews into a current set.

## Current direction

The owner accepts the PLT-05 floor plan as the working drawing basis and defers
personal layout refinements. Resume plate refinement under PLT #422. Do not
hold this work for another floor-plan review or use it to reopen discretionary
house design. Screen acceptance authorises continued drawing development;
actual-size physical acceptance and final drawing release remain separate.

The working source is `compiler/reference-house/georgian/source.ts`, introduced
through PR #910. Its source-owned room boundaries, apertures, levels, stair,
services and pitched roof are held. The architectural decision remains
[Georgian re-plan](../reference-house/georgian-replan.md). The no-flat-roof
constraint continues to apply. Only a concrete defect that prevents an honest
coordinated drawing warrants a source correction within PLT; record that delta
explicitly rather than hiding it in linework.

## Source and release boundaries

| Object | Current authority / use |
|---|---|
| Georgian source | Accepted working architectural source for PLT candidate drawings |
| `georgian/plan.ts` and `georgian/scenes.ts` | Existing source-derived plan and coordination previews |
| `georgian/elevations.ts` | New elevation-family projections of the same source |
| B6 / PLT04 / PLT05 review packs | Retained historical proof identities; do not silently redraw them |
| Frozen DRW v1 and historical RH compiler | Retained historical releases and bounded technical proof; not proof of this changed house |
| Final publication | Still consumes its controlled historical release until an atomic, validated v2 replacement |

A candidate may reuse the shared v2 graphic tokens without claiming that the
full frozen RH structural, service, boundary and calculation models have been
migrated. In particular, an old span or service overlay must not be pasted over
the new plan and described as a compiled result. Reconcile the source obligation
for each family; retain unsupported facts explicitly. Full technical successor
work is a separate obligation wherever publication relies on that evidence.

## Remaining family work

The [programme](https://github.com/adamnoden/architecture/issues/422) owns PLT's
sequence. The historical [view register](architectural-drawing-drw02d-view-register.md)
owns reader tasks unless an explicit revision below supersedes one. A review
pack existing is not the same as its entire family being complete.

| Programme stage | Current candidate / remaining obligation |
|---|---|
| Exemplar and plans, PLT-03/04 | Shared candidate grammar and three source-derived plans exist. Continue from accepted layout; finish BOOK facing relationships and final print review. |
| Elevations, PLT-05 | Front, garden, service-side and two courtyard readings now have one source-derived candidate family. Finished-PDF and rendered proof precede adoption as release plates. |
| Sections, PLT-06 | Existing transverse roof section and developed stair are coordination previews. Principal longitudinal and transverse service sections remain. |
| Roof, PLT-07 | New pitched roof requires its own controlled roof/drainage substrate and honest water/failure reading. Historical low-slope geometry cannot stand in. |
| Axonometric, PLT-08 | Re-test synthesis value after orthographics; never invent unique content. |
| Analysis, PLT-09 | Ground plant overlay and upper service indications exist. Complete source-consistent structure, services, external maintenance, water/failure and adaptation readings. Synthetic setting remains an explicit surrogate, not the deferred modest-plot redesign. |
| Subtraction, PLT-10 | Review every mark across the whole set for necessity, hierarchy and consistency. |
| Physical proof, PLT-11 | Actual-size B5/A4 book, A2 wall and selected A1 proof; book pairing/gutter and three-distance inspection. Screen approval does not discharge it. |
| Integration, PLT-12 | Trace every delta from v1, regenerate publication, inspect typeset book, freeze identities and release drawing v2 before final manufacture. |

## Elevation-family decisions

`publication/specimens/plt06/` is the elevation proof specimen; its directory
number is a specimen identity, **not a claim that programme PLT-06 sections are
complete**. Five sheets show front, garden, service side, north courtyard and
south courtyard. East/west courtyard faces have the same nominal aperture
arrangement as the south face, so separate duplicate plates add no information.
No dedicated west outer elevation is added; its historical register exclusion
continues.

The garden projection reverses the plan X direction, placing the asymmetric
roof-access opening on the correct viewer's side. The service-side projection
uses plan Y. Aperture widths, kinds and positions come directly from the same
openings used by the plans. Shared floor, sill and head datums retain vertical
registration. Aperture/sash conventions do not imply selected frame, flashing,
reveal depth or sill construction.

The older preview drew horizontal lines at storey datums as though they were
built facade bands. The source does not select those bands. The elevation family
uses discrete level ticks instead. Profile, aperture and secondary sash strokes
use shared physical-paper roles; there are no shadows or invented mouldings.
The roof silhouette is a projection of pitched fields, not a flat roof. The
service-side sheet identifies the unmodelled dormer side returns; rear roof
access keeps its unresolved platform/protection note.

### Explicit scale revision for the tall courtyard

The old register specifies a 1:50 courtyard BOOK elevation. The new 10878 mm
high courtyard wall alone occupies **217.6 mm at 1:50**, exceeding the 190 mm
candidate scene height before notes or scale bar. That is a concrete source/
page conflict, not an aesthetic preference. Reopen this register entry for the
current candidate: **BOOK B5/A4 1:100, WALL A2 1:50**. No fit scaling or shortened
wall is allowed. The full-height court is retained so the massing consequence
remains visible. Final physical review must assess whether this reading earns
its publication space; the true height must not be disguised through cropping.

## Validation and next step

Semantic tests check plan/elevation aperture registration, rear-view handedness,
service-side limits, courtyard entry differentiation and full wall height,
dormer occlusion and deterministic vector output. The finished-PDF gate checks
all 15 pages for exact physical scale, page size, embedded Source Sans/Unicode,
source/scene identity and text bounds. Render every final sheet before adoption.
No physical acceptance, engineering adequacy or token freeze is asserted.

After the elevation candidate clears these checks, proceed to principal and
service sections against the held source. Escalate only the specific missing
architectural fact needed to draw them honestly; do not restart layout design.
