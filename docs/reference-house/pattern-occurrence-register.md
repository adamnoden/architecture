# Reference House — Pattern Selection

The Reference House is one worked interpretation of Ovid’s House. Its use of a pattern is **not evidence for the pattern language**: an occurrence shows what the pattern means in this house, not that the pattern is generally valid.

This page records the current selected patterns, their concrete architectural consequences and the evidence still required before those consequences can be treated as technically adequate.

## Service geography and distribution

| Pattern | Current Reference House occurrence | Current implementation direction | Outstanding proof |
|---|---|---|---|
| [Controlled Utility Entry](../patterns/controlled-utility-entry.md) | water, electricity and communications enter through service-side geography into the plant/service hub | utilities are geographically grouped while remaining separately penetrated and isolatable | real utility records, site approach, supplier clearances and boundary details |
| [Plant Room as Service Hub](../patterns/plant-room-service-hub.md) | dedicated plant/distribution room, approximately **2.9 × 2.2 m gross** | ventilation, DHW/hydraulics, dry controls, primary isolation and riser access are concentrated with working and replacement access | product-level packing, acoustics, heat rejection, water-failure design and withdrawal geometry |
| [Coherent Horizontal Service Route](../patterns/coherent-horizontal-service-route.md) | distinct ground/upper dry routes and low-temperature heating routes | primary routes follow service/gallery and selected perimeter geography rather than becoming one mixed-services duct | exact containment, separation, fire/acoustic crossings, pipe sizing and expansion/noise design |
| [High-Service-Room Service Wall](../patterns/high-service-room-service-wall.md) | service edge to the kitchen and dry-side service relationship to the upper family bathroom | maintainable components are biased toward short service-side branches and dry-side access; waterproofing remains independent | final fixture layouts, withdrawal geometry, privacy/acoustics and waterproofing detail |
| [Designed Structural Penetration](../patterns/designed-structural-penetration.md) | registered utility, riser, foul, extract, ventilation, heat-pump, courtyard-drainage, soil-vent and PV crossings | primary structure is protected from arbitrary later drilling; each consequential crossing owns its boundary-reinstatement duties | structural sizing, fire/acoustic/weather/air/thermal detail and product-specific clearances |
| [Accessible Vertical Service Zone](../patterns/accessible-vertical-service-zone.md) | approximately **900 × 700 mm clear** vertical service reservation | soil/vent, water, segregated dry services, ventilation trunks and possible small-bore heating risers share one controlled geography | fire/acoustic compartmentation, supports, congestion, separation and final sizes |
| [Accessible Room Service Route](../patterns/accessible-room-service-route.md) | bounded dry-service routes at room edges | substantial removable skirting and selected door/architrave or local datums may carry dry distribution and vertical rises where proportionate | electrical protection/separation, detail depth, furniture conflicts and safe-fixing information |

The house does not infer a generic service plenum from these selections. Large wet, foul and ventilation routes use explicit service geography; dry services are given more flexibility where they remain accessible and do not take over quiet rooms.

## Water, leakage and rainwater

| Pattern | Current Reference House occurrence | Current implementation direction | Outstanding proof |
|---|---|---|---|
| [Accessible Rainwater Route](../patterns/accessible-rainwater-route.md) | outward-draining roof fields and separately drained courtyard | roof water reaches inspectable external collection edges; the courtyard has a short primary route plus an independent visible emergency overflow | hydraulic sizing, gutter/coping details, courtyard falls and thresholds, site discharge strategy |
| [Visible Leakage Path](../patterns/visible-leakage-path.md) | concentrated high-service geography and observable failure routes | significant leakage should reveal itself in inspectable service territory rather than disappear into slow fabric | product- and assembly-specific containment, drainage, drying and detection design |
| [Failure-Tolerant Wet Service Room](../patterns/failure-tolerant-wet-service-room.md) | utility/WC and upper bathroom service relationships | maintainable components favour dry-side access; waterproofing and access are not the same layer | full wet-room build-up, drainage/overflow behaviour, drying and reinstatement detail |

The selected [Fail-Safe Water Distribution](../patterns/strategies/fail-safe-water-distribution.md) strategy applies the same logic across plant, riser, kitchen/utility, bathroom and soil/waste geography: minimise concealed joints, keep isolation and consequential joints accessible, and make credible leakage discoverable and recoverable.

## Openings, movement and attachment

| Pattern | Current Reference House occurrence | Current implementation direction | Outstanding proof |
|---|---|---|---|
| [Permanent Opening / Replaceable Window](../patterns/permanent-opening-replaceable-window.md) | representative G-01 window family | permanent masonry opening → mounting/tolerance zone → mechanically fixed replaceable frame → removable internal trim | jamb/head/sill mock-up, air/water/thermal continuity, fixing/withdrawal and bedroom escape-opening geometry |
| [Permanent Opening / Replaceable Door](../patterns/permanent-opening-replaceable-door.md) | doorsets in genuinely permanent openings | permanent opening → adjustment/fixing zone → replaceable doorset → removable architrave | fire/acoustic/security variants, fixing, tolerance and replacement sequence |
| [Designed Threshold](../patterns/designed-threshold.md) | principal entrance and garden/courtyard external openings | substantially level, quiet interfaces in which weathering, wear, movement and replacement duties are explicit | real-site approach levels, drainage/weathering, doorset integration and accessibility proof |
| [Movement / Slip Junction](../patterns/movement-slip-junction.md) | principal wall/ceiling junction | wall and ceiling finish should terminate independently where movement demands it; any cover belongs to one controlling assembly | quantified movement, fire/acoustic continuity, decoration sequence and full-scale comparison |
| [Controlled Attachment Plane](../patterns/controlled-attachment-plane.md) | sparse skirting, jamb/architrave, hanging and heavy-load fixing datums | known local grounds are used where repeated fixing or access earns them; there is no whole-room rack by default | load classes, anchor design, safe/no-fix information and fire/acoustic consequences |

The corresponding structural strategy, [Decompose Structural Interface Functions](../patterns/strategies/decompose-structural-interface-functions.md), keeps gravity support, restraint, diaphragm transfer, movement, tolerance and boundary closure conceptually separate at the floor edge. That does not imply a bespoke connector: excellent conventional construction remains the incumbent.

## Environment and external maintenance

| Pattern | Current Reference House occurrence | Current implementation direction | Outstanding proof |
|---|---|---|---|
| [Source-Capture Kitchen Extract](../patterns/source-capture-kitchen-extract.md) | kitchen to short service-side discharge | dedicated cooker extract remains independent from whole-house ventilation | hood/duct sizing, cleaning, terminal position and nuisance control |
| [Source-Capture Bathroom Extract](../patterns/source-capture-bathroom-extract.md) | upper bathroom moisture-source extraction | central whole-house ventilation is the baseline; direct wall extract remains a fallback if the central route proves disproportionate | capture effectiveness, pressure loss, acoustics, condensate and commissioning |
| [Roof Maintenance Route](../patterns/roof-maintenance-route.md) | external scaffold/tower access to low-slope roof | no permanent hatch is selected merely as a symbol of maintainability; temporary collective access supplies arrival, working platform and edge protection | real-site temporary-work selection, ground bearing and final PV access zones |
| [Ground-Supported Façade Access](../patterns/ground-supported-facade-access.md) | service-side, west/rear and courtyard working geography | useful support positions and the garden-to-courtyard logistics route are protected from permanent obstructions | real-site boundaries, ground bearing, landscape maturity and neighbour/highway dependence |

## Stewardship

| Pattern | Current Reference House occurrence | Current implementation direction | Outstanding proof |
|---|---|---|---|
| [Physical Service Index](../patterns/physical-service-index.md) | service index near the plant/service hub | durable physical identification shares stable identities with isolation, drawings and commissioning information | installed naming, final physical format and owner-facing information design |

The index is enhanced stewardship, not a substitute for physical legibility. Principal isolation, service geography and consequential access should remain discoverable even if the original digital record disappears.

## Floor strategy

The house selects [Separate Structural Floor from Changeable Layers Where Proportionate](../patterns/strategies/separate-structural-floor-changeable-layers.md) without turning it into a house-wide access-floor system.

The structural deck and joists remain primary structure. Services move around protected structure except at designed crossings. Principal-room floors remain continuous conventional floors unless a later local task earns selective access.

## Held candidates

Four propositions remain outside the selected pattern set for this house:

- [Replaceable Architectural Lining](../patterns/candidates/replaceable-architectural-lining.md) — an optional physical challenger; the house remains complete if it fails;
- [Individually Isolatable Manifold Distribution](../patterns/candidates/individually-isolatable-manifold-distribution.md) — not selected merely because a service hub exists;
- [Local Deep Service Zone](../patterns/candidates/local-deep-service-zone.md) — justified only if real routes demonstrate a recurring need;
- [Selective Floor Access](../patterns/candidates/selective-floor-access.md) — not part of the present principal-room baseline.

The structural floor edge and wall/ceiling movement junction remain active proof questions, but neither requires promoting a held candidate in advance of engineering or physical evidence.

## Reading the register

A Reference House occurrence means only that the current design has a concrete place where the pattern applies. It does not establish technical adequacy, raise the pattern’s evidence maturity or turn a project-specific implementation into doctrine.

The current whole-house technical arrangement and its proof boundaries are described in [Current Technical Coordination](structural-coordination.md).