# RWT-00 — Rainwater baseline and interfaces

**Result:** complete — authority, provisional baseline and handoff requirements established.  
**Date:** 2026-10-29  
**Starting authority:** `4fc92c7c40dd8844c30d32e2ed76e0bee1e29f54`.  
**Programme:** [RWT](rainwater-systems-programme.md), issue #992.  
**Roof input:** [ROF-00](../rof/rof-00-baseline-and-constraints.md).  
**Governing seam:** [roof / rainwater contract](../roof-water-interface-contract.md).

## Question and result

Where does building-side rainwater design begin and end, and what does the current drawing actually establish?

RWT begins with ROF's roof collection interfaces and the house's open-to-sky courtyard surface. It selects maintainable collection/conveyance and credible failure/exceedance paths through an explicit building-side handoff. It does not select real-site receiving drainage. The current roof-water drawing establishes none of the pipework, hydraulic capacities or failure paths required for system selection.

RWT-01 can now establish the bounded rainfall/hydraulic basis without guessing rainfall, inventing a sewer, or treating old arrows as a proven route.

## Frozen provisional baseline

Use the source chain and dimensions in ROF-00. `compiler/reference-house/georgian/layout-family.ts` draws the current roof/water view from `layout-revision.ts`: a 12 m square plan reference, 3.5 m square open court, 25° inward/outward ring and inner/outer collection reserves. The eight fall arrows identify represented directions, not eight selected pipes or hydraulically independent catchments.

| Item | Present authority | Unresolved |
|---|---|---|
| Outer roof faces | Outward fall toward outer eaves in represented ring | Collection hardware, catchment split, outlet locations, downpipe count, branches and ground transition |
| Inner roof faces | Inward fall toward courtyard eaves | Roof collection and safe failure route; roof runoff must not silently be added to courtyard surface collector load |
| Open court | Nominal 3,500 × 3,500 mm = **12.25 m²** plan opening | Actual surface falls/finish, drained surface extent, wind-driven facade contribution, drain position, threshold and overflow levels |
| Roof area | Nominal plan-reference annulus **131.75 m²** before edge/overhang treatment | Actual effective catchment area and allocation; neither plan arithmetic nor sloping surface area is automatically the correct hydraulic input |
| Collection marks | Inner/outer dashed reserves | No selected gutter profile, invert, outlet, scupper, material or capacity |
| Conveyance / outfall | No selected current physical network | No pipe size, gradient, junction geometry, below-ground continuation or lawful destination |
| Blockage / exceedance | Programme duty to make consequential failure visible and bounded | No demonstrated safe path, independence, capacity or level hierarchy |
| Maintenance | Existing rainwater/access patterns govern questions | No demonstrated cleaning, rodding, component removal or safe access sequence |

No field above is a hydraulic acceptance result. The current inward roof fall is not permission to discharge roof water onto the courtyard paving. Collection may intercept it; the selected ROF/RWT system must establish that physical path.

## Source inventory and authority conflicts

| Source | Useful authority | Boundary / reconciliation |
|---|---|---|
| [Accessible Rainwater Route](../../docs/patterns/accessible-rainwater-route.md) | Cleanable debris points, deliberate failure paths, inspectable replacement and wall-base protection | No universal gutter/downpipe type, count or capacity |
| [Roof Maintenance Route](../../docs/patterns/roof-maintenance-route.md), [Ground-Supported Facade Access](../../docs/patterns/ground-supported-facade-access.md) | Safe task geography and replacement logistics | No assumed safe ladder, tower, scaffold support or permanent anchor |
| [Designed Threshold](../../docs/patterns/designed-threshold.md) | Explicit transition of weather, levels, access and material duties | A nominal line/step is not a tested water boundary |
| [Historical RH-08](../../docs/reference-house/roof-drainage-access-rh08.md) | Reasons to distinguish primary/overflow paths, inspectability and service-side handoffs | Outward-only low-slope roof, four downpipe families and 3.6 × 4.0 m court are historical; none is current selected network geometry |
| [DPL-08C](../dpl/dpl-08c-foul-surface-site-water-interface.md) | Distinct handoff duties, required site evidence and explicit unknowns | Its RH-08-derived building topology remains historical input. Preserve duties while ROF/RWT replace the provisional house-side network; do not reinterpret it as site evidence |
| [DPL-08A](../dpl/dpl-08a-site-interface-authority-register.md), [DPL-08B](../dpl/dpl-08b-ground-datum-plinth-approach-interface.md) | Interface authority and separation of drainage, wall-base drying, access and maintenance territory | A single strip/trench does not discharge all duties |
| [Opening assembly selection](../../docs/reference-house/opening-assembly-selection.md), OAS-03 | Conventional external/court doorset family; OS-02/03 water/threshold obligations remain open | Low-access intent is not a flush-threshold, blocked-drain or weather-performance pass |
| [MRA programme](../mra/moisture-resilience-assurance-programme.md) | Source/path/failure, concealed wetting, symptom delay and drying assault | Assurance challenges selected ROF/RWT design; does not choose it |
| [Implementation schedule](../../docs/manuscript/reference-house-implementation-schedule.md) | Named professional/site obligations | Historic 14.4 m² courtyard and selected east-side primary/overflow description reconciled to current unselected representation |

This packet retains historical records. It does not erase the reasons behind them, promote their obsolete geometry, or redesign the DPL/OAS programmes.

## ROF → RWT collection contract

For each candidate, identify the following explicitly before network synthesis:

- catchment identity and source geometry, including the basis of area and allocation;
- collecting edge/low-point condition and the boundary between roof weathering and collection hardware;
- exposed versus trapped behaviour and what fabric/occupation lies below failure;
- roof/runoff materials and restrictions on receiving components;
- movement/support interface and independent replacement requirements;
- candidate overflow territory and any geometry that makes it unsafe or unavailable;
- unknowns, evidence source, responsible owner and whether a topology rewind is necessary.

ROF owns roof weathering/topology. RWT owns collection hardware after the seam. A failed gutter fixing or roof-edge closure may engage both: name the physical interface and joint duty instead of solving the conflict by moving a line. RWT may reject an unmaintainable collection proposition and request ROF/HAD reconsideration; it may not quietly change the pitch, eaves or courtyard.

## RWT → DPL: SITE-WATER-HANDOFF

`SITE-WATER-HANDOFF` is a boundary of design authority, not a surveyed plot line or a preselected pipe coordinate. Keep multiple flow/failure identities distinct beneath this one contract.

| DPL handoff duty | RWT treatment | What remains outside RWT |
|---|---|---|
| W-H01 foul | Out of rainwater scope; preserve separation | Foul system and site connection design |
| W-H02 roof-water ground transitions | Identify selected roof routes, receiving transition/access zone and normal/failure behaviour; historical count of four is not binding | Buried ring/manifold, destination, invert, infiltration or attenuation selection |
| W-H03 courtyard primary | Identify actual collector-to-external inspection/handoff relationship after selection | Receiving network, lawful outfall, downstream size/fall and land conditions |
| W-H04 courtyard emergency overflow | Preserve distinct failure identity; require a visible escape before occupied thresholds are endangered | Exact site receiving geometry/capacity and assurance that downstream flood/backwater cannot defeat it |
| W-H05 building-edge surface water | Supply threshold/wall-base protection and interaction requirements | Real-site grading, incoming overland water and landscape drainage design |

At each selected rainwater handoff RWT must supply: flow/catchment identity; location/zone with datum basis; bounded design assumptions and eventual demand basis; transition type; inspection/cleaning/replacement access; credible failure/exceedance and downstream constraints; unresolved evidence owner. RWT-00 deliberately supplies no invented coordinates, elevations or flows.

DPL/real-project evidence must supply receiving levels, ground/topography, flood/backwater conditions, network ownership/capacity/rights, infiltration/groundwater data where relevant and lawful route/approval. A downstream obstruction or high receiving water level may force a house-side rewind. An overflow that rejoins the same blocked route without an earned independence argument is not a demonstrated backup. Preserve this as an open design obligation, not a universal prohibition on every shared downstream asset.

## RWT ↔ OAS / HAD courtyard rule

For each court/garden/entrance opening, reconcile approach and paving levels, surface falls, collection, normal water level, failed-collector level and overflow territory with the actual threshold's vulnerable boundary. No unproved millimetre allowance, threshold height or courtyard fall is frozen here.

OAS owns the threshold assembly and water boundary; RWT owns adjacent collection/conveyance and failure-water geometry; HAD owns spatial/elevation consequences. No room door becomes the emergency weir. A water requirement that defeats the low-access objective is an explicit joint design conflict, not permission for a hidden step, channel or sealant patch.

## Shared material-compatibility record

Later roof and rainwater candidates must share one compatibility assessment per actual contact or runoff chain: upstream material/coating and runoff exposure; downstream material/coating; direct-contact versus transported-runoff condition; fixings/supports; movement and replacement sequence; relevant environmental limitations; primary system/manufacturer evidence; uncertainty and owner.

Do not infer compatibility from material names, corrosion resistance alone or absence of direct contact. No metal pairing, product, protective coating or joint type is approved or banned by this baseline; RWT-04 / ROF-03/05 must earn the selection. Preserve the record in the shared candidate/interface evidence, not two conflicting roof and pipe schedules.

## Open obligations and exit

RWT-01 owns rainfall/effective-area/capacity assumptions. RWT-02/03/04 develop collection, conveyance and materials; RWT-05/06 test blockage/exceedance and maintenance/site transitions; RWT-07 synthesises the actual network against ROF geometry. The shared ROF-RWT-GATE reconciles house-wide roof/water/threshold consequences before TRIAD-GATE. BCR/EPR route technical judgement, PHY earns physical tests, DEL carries workmanship/inspection/acceptance, MRA attacks selected failure behaviour, and PLT represents resolved authority.

This result establishes baseline and contract requirements only. No hydraulic, structural, threshold, regulatory, safe-access, site-compatibility or physical-validation claim is advanced.

## Validation record

Checked against the current source geometry, ROF-00, the governing shared contract, DPL-08C handoff duties and OAS family/OS-02/03 limits. Local typechecking, repository/local-link integrity, PCO/evidence validation, publication integrity and the production website build passed. Parallel main-branch DAG presentation changes were retained and the repository/build checks repeated against that combined source. Browser-based publication validation must pass in the existing exact-head CI workflow before integration; this executor's socket restriction is already recorded in ROF-00. No hydraulic or physical test is implied by the software checks.

Closeout exposed a projection-workflow mismatch: the DAG viewer generates `docs/project/graph-source.ts`, but the reconciliation allowlist rejected that file (main run 40901773476). The workflow now admits and commits that existing generated projection alongside the other three outputs. This restores the owning generation path; no projection is hand-edited and no new generator is added.
