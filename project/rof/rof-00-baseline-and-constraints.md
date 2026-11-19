# ROF-00 — Roof baseline and inherited constraints

**Result:** complete — baseline and ownership established; no roof system selected.  
**Date:** 2026-10-29  
**Starting authority:** `a31efba595449295ef8b19cd55c7d2d49d7cb129` on `main`.  
**Programme:** [ROF](roof-systems-programme.md), issue #991.  
**Shared contract:** [roof / rainwater interfaces](../roof-water-interface-contract.md).

## Question and result

What exactly does roof research inherit, and which apparent decisions must remain open?

The Reference House currently represents a 25° inward/outward pitched ring around an open courtyard. That is the controlled comparison baseline, not an accepted weathering assembly. The owner-imposed exclusion of flat and very-low-slope roofs remains operative. Research may challenge it explicitly; neither a comparison study nor a drawing silently changes it.

ROF-01 can now establish the evidence and evaluation frame. It must not treat the drawn ring, a traditional material, fewer joints, or an attractive silhouette as a prior winner.

## Current controlled representation

The source chain is `section-exemplar.ts` → `layout-revision.ts` → `layout-family.ts`, with `sectional-synthesis.ts` and `exterior-isometrics.ts` consuming the current geometry under `compiler/reference-house/georgian/`. The latest layout source identifies itself as `RH-LAYOUT-REVISION-02`.

| Fact | Baseline | Authority / limit |
|---|---|---|
| Outer plan reference | 12,000 × 12,000 mm | `layoutRevision.shell`; this is the drawing reference, not a measured finished catchment |
| Open courtyard | 3,500 × 3,500 mm; south-west origin (4,250, 4,250) mm | `layoutRevision.court` |
| Roof topology | Inward/outward pitched ring; ridge inset 2,125 mm | `layoutRevision.roof`; four wings, outward and court-facing fields |
| Nominal pitch | 25° | `upperPitchDeg`; no covering/system suitability established |
| Eaves reference | +6,800 mm, outer and courtyard | `eaves` / `courtEaves`; not gutter invert or finished weathering level |
| Ridge reference | Approximately +7,790.9 mm | `roofTop()` = 6,800 + 2,125 tan(25°); source-derived geometry only |
| Overhang / build reserve | 200 mm / 300 mm | Overhang and nominal roof build zone; no selected layer build-up or structural section |
| Roof apertures | No authored dormer axes; no selected roof access opening | `dormerAxes` empty; external maintenance access remains unresolved |
| Collection representation | Inner and outer dashed collection reserves; eight fall arrows | `createLayoutRoof('ROOF-WATER', …)`; no selected gutter, outlet, downpipe, capacity or overflow |
| Courtyard surface water | Unresolved | Explicit drawing note; separate from roof catchment collection |

The renderer also carries inherited fields such as `breakZ`, dormer dimensions and a roof-access text value. Their presence in the object does not select those details: the current ring-height function and empty dormer axes control this representation. A later formalisation review should admit only fields actually needed by the selected design; this packet adds no compiler machinery.

A plan-reference annulus would be 144 − 12.25 = **131.75 m²**. This arithmetic is only an orientation check: overhangs, effective wind-driven rainfall area, collection splits and selected weathering edges are not resolved. It is not hydraulic design area. In particular, the old RH-08 catchment figure must not be copied into RWT as current geometry.

## Inherited constraints and open assumptions

- [Georgian replan — roof constraint](../../docs/reference-house/georgian-replan.md#roof-constraint) and `project/design-constraints.ts` exclude flat roofs, very-low-slope substitutes and flat ancillary/dormer roofs in newly authored designs. This is a project preference, not a universal failure claim.
- [Governing principles](../../docs/manuscript/governing-principles.md) and [Part I](../../docs/manuscript/part-i.md) supply permanence/change, maintainability and proportionate intervention. They do not prescribe copper, lead, slate, a permanent hatch or an anchor system.
- [Roof Maintenance Route](../../docs/patterns/roof-maintenance-route.md) requires task-appropriate approach, working position and renewal access. Temporary access can win where justified; a hatch alone is not a safe route.
- [Ground-Supported Facade Access](../../docs/patterns/ground-supported-facade-access.md) preserves ground/courtyard logistics. It does not prove scaffold support, actual site clearance or a contractor method.
- The programme's geometry-before-chemistry preference concerns physical water paths and recoverability. It does not mean all joints or sealants can be eliminated, or that seamless construction is inherently safer.
- Covering, substrate, fixings, ventilation, air/vapour control, insulation, fire/wind performance, material compatibility, penetrations, PV arrangement and renewal sequence remain unselected or unproved at roof-system scope.
- No real plot, rainfall exposure, wind zone, discharge approval, site infiltration or ground condition is established by the virtual baseline.

No-flat-roof revision would require an explicit owner/owning-source decision, supported comparison and coordinated changes to the project constraint, Reference House choice, HAD/RWT interfaces and dependent representation. A research challenger may be assessed without admitting it into current project geometry.

## Existing-source inventory and conflicts

| Source | What survives into ROF | What must not be inherited as resolved |
|---|---|---|
| `docs/reference-house/georgian-replan.md`, `layout-revision-02.md`, current compiler source | Current project constraint, layout and represented ring | Covering/structure/drainage adequacy |
| `docs/reference-house/roof-drainage-access-rh08.md` and its drawings | Historical options/reasons, inspection questions and external-access precedent | Its selected outward-only low-slope roof, no primary courtyard roof catchment, old areas and service-terminal assumptions |
| `docs/manuscript/reference-house-implementation-schedule.md`, roof rows | Named professional/hydraulic/access obligations | Older low-slope roof and external-only catchment descriptions; reconciled here to provisional current baseline |
| `docs/reference-house/whole-house-coordination-fixture.md`, environmental/roof assumptions | Service-terminal and replacement questions | A preferred terminal zone or historic environmental scheme as a selected penetration design |
| `docs/patterns/roof-maintenance-route.md`, `ground-supported-facade-access.md` | Task/geography-led inspection, cleaning, repair and replacement | A universal hatch/anchor solution or proven access method |
| `project/mra/moisture-resilience-assurance-programme.md` | Source/path/failure, visible symptoms, drying and selected compound-failure questions | Assurance as constructive roof-system selection |
| `project/bcr/buildability-construction-resolution-programme.md` | Routing structure for roof/weathering obligations | An internally selected system as construction approval |
| `project/roof-water-interface-contract.md` | Collection, material, movement, exceedance and site-handoff seams | Existing symbolic routes as a hydraulic network |
| PLT current roof, section and exterior-isometric outputs | Inspectable source-derived geometry and reproducible starting point | Weatherproofing, drainage capacity, access or construction evidence |

The historical low-slope decision is retained as evidence, not erased. A status note on RH-08 prevents its past-tense selection from competing with the current baseline. Other inherited environmental/service records require targeted reconciliation when a roof system and penetrations are actually selected; this packet does not reopen those owners' designs.

## Ownership and downstream obligations

| Boundary | ROF must supply / preserve | Decision or evidence owner |
|---|---|---|
| ROF ↔ RWT | Identified catchments, geometry/edges/low points, runoff material compatibility, movement and high-consequence overflow territories; RWT feeds collection conflicts back | Shared contract; RWT selects hardware/network after the seam |
| ROF ↔ HAD | Silhouette, ridge/eaves/cornice consequences, visible materials and access implications | HAD owns expression; a technical conflict requires explicit rewind |
| ROF ↔ OAS | Roof-water exposure at court openings/thresholds and adjacent wall boundaries | OAS retains assembly authority; no silent threshold redesign |
| ROF ↔ MRA | Selected primary/secondary defences, wetting/drying and inspection assumptions | MRA-00 can frame questions; MRA-01/03 attack selected external-water/condensation propositions after coordination |
| ROF ↔ BCR/EPR | Support/load/uplift, fixings, thermal/moisture/fire and system applicability questions tied to actual selection | BCR records disposition; EPR supplies competent technical judgement |
| ROF ↔ PHY | Specific material, interface or repair proposition whose uncertainty needs a physical test | PHY designs/records earned testing; a proposed test is not evidence |
| ROF ↔ DEL | Workmanship-sensitive steps, inspection before concealment, procurement/substitution limits, handover and maintenance/renewal tasks | DEL owns responsibilities and acceptance; no invented installation tolerances |
| ROF ↔ PLT | Resolved geometry and explicit omissions after coordinated selection | PLT represents it; current drawings remain comparison evidence |
| RWT ↔ DPL | Preserve `SITE-WATER-HANDOFF`; no sewer/infiltration/site route selected by ROF | RWT defines building-side transition; DPL/real project owns downstream site facts |

The shared collection seam needs, for each future candidate: stable identity; geometric source; primary collection edge/point; exposed versus trapped condition; roof/runoff materials; movement constraints; permissible failure/exceedance territory; and unresolved evidence owner. These are handoff requirements, not invented values or a new compulsory software schema. RWT-00 and the later synthesis must instantiate/reconcile them.

## Comparison vocabulary and falsification

Evaluate a **system**: topology × covering × supporting assembly × junctions × access/renewal. Distinguish a face, ridge, hip, valley, abutment, edge/eave, penetration, collection point and concentration point by what water, movement and maintenance actually do there.

For each performance-critical interface, record sensitivity, failure consequence, visibility/detection delay, local repair extent, drying/recovery and maintenance dependency. Preserve comparisons across bulk-water paths, secondary defences, workmanship, movement, wind/fire dependencies and material compatibility. Do not multiply ordinal scores into a fake quantitative risk result or collapse them into joints-per-area/one complexity index.

The ring baseline would lose its presumption of suitability if its inner collection cannot be cleaned or safely exceeded, its junctions cannot accommodate movement/drying, its covering is unsuitable for geometry/exposure, its support/access is implausible, or renewal destroys disproportionate permanent fabric. Conversely, many visible replaceable laps do not themselves falsify a slate/tile candidate, and few seams do not validate a metal candidate. Later evidence must be allowed to reject the familiar baseline as well as a novel challenger.

## Closeout and limits

ROF-00 establishes source authority, a reproducible starting geometry, conflicts, constraints, comparison terms and named handoffs. It does not establish roof durability, material superiority, hydraulic capacity, condensation safety, structural adequacy, safe work-at-height provision, regulatory approval or physical validation.

ROF-01 is the next roof packet. RWT-00 remains independently eligible. No roof selection, shared interface freeze, project authority ceiling or downstream gate has been promoted by this closeout.

## Validation record

The baseline values were read from the current exported source objects and `roofTop()`; the authority chain and historical conflict were checked against the owning documents above. Local validation passed typechecking, 1,006 automated tests with zero failures, repository/public-route/brand checks, output verification, publication manifest validation, publication integrity and the website production build. `git diff --check` passed.

The local full-health run stopped at browser-based figure validation: the browser was installed, but this executor denies its singleton socket. That is a runtime limitation, not a passing figure check. The unchanged repository PR health workflow must pass on the exact submitted head before integration. No physical, hydraulic, structural or building-physics performance has been tested by these software checks.
