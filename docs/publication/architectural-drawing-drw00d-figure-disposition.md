<!-- nav-exclude: redirect -->
# DRW-00D — inherited figure disposition and DRW-00 closeout

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-00D  
**Status:** DONE pending branch validation  
**Issue:** #154

## 1. Decision rule

DRW-00D classifies the eleven figures inherited by the Working Edition after authority, before-state and physical-format constraints have been frozen.

This packet judges the **representational instrument**, not merely graphic taste.

- **RETAIN** — the claim is inherently abstract/systemic and the current figure can remain a principal figure, subject to later doctrine-level graphic normalisation.
- **REPLACE** — the claim remains worth showing, but the current asset must leave the active publication once a stronger canonical drawing succeeds it.
- **DEMOTE** — useful supporting material, but no longer principal visual evidence.
- **REMOVE** — the visual no longer earns a reader task and requires no successor.

A `RETAIN` decision is not a pixel freeze. DRW-01 may normalise typography, stroke hierarchy, caption relationship and page composition without changing the figure's representational role.

A `REPLACE` decision preserves the **reader question**, not the current SVG geometry.

## 2. Governing judgement

The inherited set separates cleanly into two families.

### Abstract doctrine / method figures

The first five figures explain concepts that do not belong to one building geometry: selective permanence, interface duties, failure sequence, maintenance-route geometry and the relationship between pattern fields and generative sequence.

Abstraction is the correct instrument for those claims. Turning them into pseudo-building drawings would make them less general and less precise.

### Reference House spatial/system figures

The final six figures make claims about one actual worked architectural object. They are separately authored schematic SVGs rather than projections of the controlled Reference House state.

That is now an unacceptable representation boundary. Their claims remain useful, but the current assets cannot remain principal evidence once DRW produces canonical plans, sections, elevations, roof/water drawings and analytical overlays.

The correction is therefore **not** “make the six diagrams prettier”. It is to replace them with architectural drawings and overlays derived from controlled geometry.

## 3. Frozen disposition

| Current asset | Current reader task | Disposition | Rationale | Successor / later owner |
|---|---|---|---|---|
| `selective-permanence-platform.svg` | Distinguish slow permanent fabric, interface infrastructure and faster replaceable layers. | **RETAIN** | This is a conceptual hierarchy, not a claim about one house. Diagrammatic abstraction is appropriate. | DRW-11 early-book audit may normalise/redraw only if DRW-01 doctrine materially improves it. |
| `designed-interface-functions.svg` | Explain separation of support, restraint, movement, sealing and access duties at an interface. | **RETAIN** | Functional decomposition is inherently schematic; forcing it onto one construction detail would narrow the principle prematurely. | DRW-11 early-book audit; later details may complement it but do not supersede the concept. |
| `failure-architecture-sequence.svg` | Show first defence → detection → harmless consequence → recovery as one failure architecture. | **RETAIN** | The figure communicates a general temporal/causal sequence rather than building-specific geometry. | DRW-11 early-book audit; spatial failure overlays in DRW-10 are complementary. |
| `maintenance-geography-route.svg` | Show approach, working space, disconnection clearance and withdrawal as one continuous maintenance route. | **RETAIN** | The four geometries are intentionally generic and qualitative. The figure states a transferable task sequence without pretending to document the Reference House. | DRW-11 early-book audit; Reference House maintenance overlays in DRW-10 provide the worked example. |
| `pattern-language-fields-sequence.svg` | Separate pattern-language fields from one generative service-topology sequence. | **RETAIN** | Its subject is a conceptual system/order relationship. A flow/field diagram is more truthful than an architectural plan here. | DRW-11 early-book audit / doctrine normalisation only. |
| `reference-house-type-orientation.svg` | Establish house type, court, service flank and contextual orientation constraints. | **REPLACE** | It is a spatial claim about the Reference House but uses a separately authored schematic shell. It must no longer stand in for architectural plan/site information. | DRW-03/04 plans establish the object; DRW-08 may add retained synthetic setting/type material where needed. |
| `reference-house-spatial-sectional-order.svg` | Explain court, entrance/garden sequence and vertical/sectional hierarchy. | **REPLACE** | The claim is architectural and should be inspectable through real plans and section, not proxy rectangles. | DRW-03/04 plans + DRW-05 principal section. |
| `reference-house-structural-assembly-logic.svg` | Explain bearing/support, seated floor logic, transfer restraint and assembly hierarchy. | **REPLACE** | The structural reading must be drawn on the same controlled geometry as the house and must not imply more engineering authority than the source owns. | DRW-05 section where relevant + DRW-10 structural analytical overlay. |
| `reference-house-service-maintenance-geography.svg` | Explain concentrated service flank, riser/manifold access and maintenance routes. | **REPLACE** | This is explicitly spatial and is strongest when overlaid on canonical plan/section geometry. | DRW-03/05 substrate + DRW-10 service/maintenance overlay. |
| `reference-house-external-maintenance-geography.svg` | Explain roof/plant/facade/garden maintenance access and external routes. | **REPLACE** | The current schematic cannot substitute for roof, elevation, site/garden and access geometry. | DRW-06/07/08 architectural substrate + DRW-10 maintenance overlay. |
| `reference-house-water-failure-geography.svg` | Explain roof collection, overflow, wet-zone containment and safe failure paths. | **REPLACE** | Water/failure claims require actual roof, section and plan geometry so routes and consequences can be inspected. | DRW-07 roof/drainage slice + DRW-10 water/failure overlay. |

## 4. Totals

- **RETAIN:** 5
- **REPLACE:** 6
- **DEMOTE:** 0
- **REMOVE:** 0

The absence of `DEMOTE` / `REMOVE` is deliberate, not an attempt to preserve everything. The current eleven are already a bounded set and every one still performs a valid reader task. The defect in the six Reference House figures is the instrument used to prove the task, not the existence of the task itself.

If DRW-02 later proves that a claimed successor view is redundant in the full plate sequence, it may consolidate views without reviving the current schematic asset.

## 5. Replacement rules

The six `REPLACE` assets remain active **temporarily** so the current book stays complete and green while the new drawing system is built vertically.

They are retired only when all of the following are true for the relevant reader task:

1. a successor drawing/plate exists;
2. its geometry derives from the controlled source/compiled state under the DRW-00A authority hierarchy;
3. it respects the DRW-01 visual/page doctrine and DRW-00C physical-format contract;
4. the publication placement/caption is updated atomically;
5. source and rendered PUB-NOM validation stays green;
6. the old SVG has no remaining active placement unless separately reclassified for a demonstrated reader task.

Do not delete the six assets merely because this record marks them `REPLACE`; that would create a deliberate visual hole before their vertical slices exist.

## 6. No new figure numbering

DRW-00D does not create a replacement public figure-number system.

PUB-NOM retired the legacy `D-F*` identity. If DRW later demonstrates a reader need for numbered figure cross-reference, the new family must first enter `project/nomenclature.ts` with an explicit public-surface contract. Until then, titles/captions and placement own reader identity.

## 7. DRW-00 gate closeout

DRW-00 has now established:

- **00A:** authoritative source / compile / renderer / publication hierarchy;
- **00B:** exact before-state figure and PDF evidence;
- **00C:** controlled A4 proof baseline, PR-02 physical direction and explicit open production inputs;
- **00D:** frozen inherited-figure disposition and successor ownership.

No architectural source, renderer or public figure has been changed during DRW-00. The current publication remains the intact before-state while the rules for replacing it are now explicit.

## 8. Handoff

**Next packet: DRW-01A — curate the bounded architectural-drawing precedent sample and extract only transferable conventions.**

Do not begin renderer implementation or redraw the six Reference House figures before DRW-01 freezes the drawing/page doctrine and DRW-02 freezes the exact target view register.