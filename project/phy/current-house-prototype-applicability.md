# Current-house prototype applicability and release requirements

**PHY-APPLICABILITY · 29 October 2026.** Inspected main `c7d994a962be3d17d19ad85bd397f20d872d6817`, after BCR-PREFLIGHT. This completes applicability preparation, not engineering, specimen release, a physical event or a house assurance pass. The [PHY programme](physical-validation-programme.md), [current house basis](../../docs/reference-house/current-house-basis.md), [preflight findings](../bcr/bcr-preflight-result.md) and [owner-house charter](../owner-house-charter.md) govern the scope.

The decision improved is which existing prototype questions still matter to the owner's current house, what must change before a representative test, and where ordinary construction can remove unnecessary experimental work. A completed protocol is evidence about a proposed method; it is not a measured result. The reviewed repository records contain prepared briefs, protocols and diagrams, not a supplied P03/P04 measured-result record. No external physical event is presumed either to have occurred or to have passed.

## Applicability verdict

P03's separation of gravity, restraint, diaphragm, movement, closure and repair duties survives. Its old representative geometry and permission to use an ordinary side-wing edge as the governing house case do not transfer. Current entrance/stair interruptions, wall substrate, wet/service penetrations and the fully allocated floor package require actual design and competent engineering before a structural specimen is released.

P04's conventional comparison, independent finish termination, decoration challenge and repeated local reinstatement remain useful methods. Its 2950 mm room rig is historical; current clear rooms are 3100. The selected dry interior now uses a plain upper termination by default, with an optional small wall-fixed cover only at a real independently moving junction. It does not adopt a house-wide cornice or require all three prepared families. A retained old rig can answer a bounded local mechanical question if its actual background and scope are declared; it cannot silently represent current room proportions or the current detail.

No test is activated by this result. **31 October 2026 development-policy amendment:** PHY-03-ENGINEERING now admits a self-service internal options/calculation study under the [current PHY contract](physical-validation-programme.md#phy-03-engineering--internal-development-contract). Its completion does not release a structural specimen. ER-STR-01 / EPR-RH11 structural acceptance and PHY-04 physical evidence remain separate manual obligations; PHY-01/02 remain held. The dated source/applicability findings below retain their original scope. BCR's routed-pending physical findings remain unresolved until their owning design/evidence conditions are met.

## Retained source identities

The following are the **pre-notice blobs** inspected at the baseline above. Their dated substantive contents and SVGs remain recoverable. This packet adds applicability notices to the five Markdown records and does not redraw the old diagrams or substitute new dimensions into their history.

| Historical artefact | Git blob | Current use |
|---|---|---|
| `docs/prototypes/p03-floor-edge-engineering-brief.md` | `4dd6a37b4e05b20ee95caec257c3ccaa6a4c5890` | Duty/option and engineering-first method; old house geometry superseded for current issue |
| `docs/prototypes/p03-floor-edge-test-protocol.md` | `53bc64fb13f7fe17dd40014c469dbe55aa7d86f3` | Conditional assembly, tolerance, inspection and controlled loading method; no current released specimen |
| `docs/prototypes/p03-structural-floor-edge-handoff.md` | `e689f1e4eabaf346f7ef5e2cce6cf89165c508a5` | Historical side-wing/edge-beam questions; no accepted current load path |
| `docs/prototypes/p03-floor-edge-options.svg` | `b30ee941aa868282650e1a9a58d45f8d1138e871` | Historical option diagram, not fabrication geometry |
| `docs/prototypes/p04-wall-ceiling-build-pack.md` | `cb04e3cf5c30f0847135f2f034c1088ee21c44fa` | Historical 2950 rig and control/challenger logic; current specimen needs explicit revision/release |
| `docs/prototypes/p04-wall-ceiling-test-protocol.md` | `268e73e8a477f52fb297556f59952e9c4367caa9` | Exploratory movement/reinstatement method within stated limits, not life or performance certification |
| `docs/prototypes/p04-wall-ceiling-rig.svg` | `13dbef815603d02f42fe79b8fac8514d7c92c71d` | Historical rig illustration only |

Current input anchors at that same baseline: BCR-PREFLIGHT result blob `1af61accfaa5bbcb84fa02fca208b6121273f102`; BCR-STRUCTURE result `334798985eeb828f7c3e6f175c0ee1678bc1c8ea`; bounded interior selection `4d1f5681193a4f0aa7624c904ab873da331e6feb`. The preflight's own accepted-source table binds all five physical investigations. Later adoption or changed loads/materials/geometry requires an affected-claim review, not automatic reuse of these identities.

## What changed in the representative house

Dimensions below are millimetres unless explicitly marked otherwise.

| Input | Historical prepared basis | Current source / consequence for a meaningful test |
|---|---|---|
| Shell and court |12000×10800; court 3600×4000 |12000 square; court 3500 square at x/y 4250. A former front/rear beam or side-wing specimen cannot certify present corners and interrupted supports. |
| Levels | First FFL 3300; ground clear 2950 | First FFL 3450; ground clear 3100; upper ceiling 6550. Current room height is 150 greater; this alone establishes neither failure nor adequacy of an old local mechanism. |
| Floor package |350 overall | Still 350, but exactly 20 finish+22 deck+238 framing reserve+55 services+15 ceiling. No spare structural, service or wet-finish allowance is earned by unchanged total depth. |
| Span/support premise | Approximate 4.2 m side-wing and 3.4 m short edge-beam cases | Nominal ring 4.25 m gross; ordinary wall-face distance 4250−2×417.5=3415. Neither is the selected engineering span. Receiving masonry leaf, bearing line, member direction and finite connections remain unselected. |
| Structural interruptions | Prepared ordinary side-wing first | Entrance void 2275×2295 and 1120 bridge band; edge-following reactions fall within a ground court doorway. Stair aperture/trimmers remain unauthored. A coupon at an uninterrupted wall does not answer these load paths. |
| Services and wet loads | Service-free protected edge assumed in specimen | Proposed y 3300 route crosses bridge/trimmer territory;75/190/250 service envelopes exceed 55. Riser and unadopted rear-west stack need supported penetrations. Wet loads, drains and local depth need selected products/sections before test release. |
| Visible upper junction | Full-height cornice/slip/metal comparisons | Plain ordinary termination; optional wall-fixed 35 high×12 projecting cover. Its 5 top gap and 20 overlap are geometric study values, not project movement capacity or a primary boundary. |

The [structure study](../bcr/bcr-structure-result.md) owns the detailed located conflicts and [interior selection](../../docs/reference-house/interior-family-selection.md) owns the bounded dry detail. This table is an applicability delta, not a new framing or finish specification.

## P03: engineering release before any structural claim

The 29 October study used the ordinary compatible hanger/restraint family as the control, direct/seated bearing as a comparator, and bespoke shoe/ledge only where it earned an advantage. **Current development must first apply the later STR and material direction**, including non-timber primary structure; retain the old families only where applicable as historical comparisons. A conventional family is not selected merely by being listed. The represented 100 projection/40 deep seat and 25 end gap are drawing assumptions, not an engineered connection. The 417.5 envelope is not solid loadbearing material.

Before issuing a current structural specimen definition, the house/HAD structural owner with IAS must identify the actual floor directions, supports, receiving substrate and connections. Competent structural engineering must establish the current actions, load paths and member/connection geometry, including restraint/diaphragm/robustness, stiffness/vibration and any temporary condition. EPR supplies the corresponding professional review route; this preparation does not appoint or impersonate that role.

The engineering response must distinguish at least these **occurrence classes**, without automatically ordering one specimen per class:

- Ordinary outer/court wall edge: actual bearing/hanger, substrate and ceiling/air/fire/acoustic closure; retain the permanent deck/diaphragm and separate removable finish duties.
- Entrance/stair interrupted edge: adopted header/trimmer, finite reactions and supports, doorway/bridge/guard and finished soffit/headroom. The trial x 4600/7400 frame is an unadopted comparison, not test-ready structure.
- Service/wet penetration or loaded edge: actual supported opening, member exclusions and selected wet/plant loads. The rear-west cabinet footprint is neither its clear void nor permission to cut bearing structure.

Choose a representative bay only after explaining which of these duties it covers and which remain engineering-only or require another bounded observation. The original two-adjacent-joist/deck/closure concept remains useful once actual members, centres, substrate, support and boundary layers are released. A shortened specimen may show connection assembly or repair; it does not reproduce full-span vibration/deflection or whole-building diaphragm action. Do not force every interruption into the old ordinary-edge specimen.

The release record must state: selected/rejected families and why; named engineer and competence; detail revision and source applicability; loads and boundary conditions; allowed construction deviations/adjustments; the specific property the specimen can establish; what remains calculation/product evidence; actual safe test method and acceptance limits if loading is included; boundary/repair observations; and any required architectural rewind. No workshop load, proof factor, bearing length or acceptance threshold is supplied here. Ordinary inspection/assembly trials are also not authority for unsupported loading.

**Conventional fallback:** a competent adopted conventional solution may remove the need for a bespoke structural experiment. It does not remove design calculations, compatibility, workmanship inspection or installed boundary duties. Record the reason a specimen adds no material evidence rather than build one to vindicate an earlier idea. If the credible solution requires greater depth, altered supports, changed openings or a different architecture, return to the design owner and recheck affected occupation/services/wet evidence before claiming release.

## P04: current detail and actual movement, not a scaled old rig

The retained build pack can be revised into a current room-quality comparison at 3100 clear height. A 2950 rig retained as a local joint demonstrator must be labelled as such; its height cannot prove the present room composition. Width, ceiling projection, actual background stiffness, finish/decorating systems, cover/support and operator viewpoints must be chosen for the claim being tested and recorded before testing. No physical enlargement or new rig is authorised by this document.

For the optional selected dry study, wall finish stops at 3080, the ceiling edge is 3100 and the cover occupies 3060–3095, fixed only to wall-side support at the represented axis 3070. This gives the nominal 5 top gap and 20 overlap. Neither dimension is an approved displacement allowance: tolerances, actual edge/decorating behaviour, overlap retention and all relevant movement modes can consume them. The old rig's ±5 capability and exploratory ±1/2/3 sequence cannot be promoted to the building's movement demand or scaled by 3100/2950. Actual structure/ceiling/substrate movement input remains needed for a technical comparison.

The current comparison should start with a well-executed ordinary joint. Test the optional cover only where the actual occurrence earns it; a functional metal variant needs a concrete advantage and is not mandatory. No house-wide 100 mm cornice is revived. The ordinary default may eliminate the challenger while preserving the duty to accommodate actual movement and keep primary boundaries complete.

Before a current specimen is released, freeze the occurrence/source revision, actual construction, controlling assembly, fixings, finish/decorating system, gap/overlap, intended movement modes and project-derived demand where available. Keep fire/acoustic/air/cavity closures separately owned and represented sufficiently to expose conflicts; the decorative cover cannot become the sole closure. Actual specialist evidence remains separate from a visual/tactile screen.

Retain the useful protocol attacks: visible quality against the competent control; controlled movement with recorded actual displacement; decoration locking; local removal/reinstatement and repair; declared imperfect backgrounds; hidden inspection and noise/looseness. The inherited 20 movement and 10 removal cycles are proposed repeatability screens, not years of life or proof of the final system. If actual movement input is unavailable, a deliberately authorised exploratory test can report observations only. It cannot earn project adequacy by surviving an arbitrary amplitude. Freeze acceptance criteria before the event, preserve failures/deviations and never silently redesign a failed specimen into a pass.

## What the other current findings earn

The [shared BCR matrix](../bcr/construction-resolution-matrix.md) remains the owning finding/disposition record. This table routes **evidence questions**, not new tests, dependencies or resolved findings. Selected geometry and consequential claim determine whether a physical trial is useful after competent/product evidence and simpler alternatives are considered.

| Current question | Appropriate next evidence / what a physical observation could add | Boundary retained |
|---|---|---|
| BST-01–05: supports, openings, service crossings and wet loads | Current architectural section and engineering first; then representative assembly/access/repair observation only for an unresolved concrete detail | P03 cannot certify whole-house structure, stair headroom or unspecified penetrations. |
| BWT-01/03–07: wet finish/deck, datum/boundary, tray/waste and renewal access | Actual supported product-generation-specific assembly and access sequence; targeted wetting/repair mock-up only if selected boundaries and failure question justify it | A waterproof board or plan route is not a complete waterproof room; no invented test head/time or substituted drain generation. |
| BS-01–04 and occupation renewal tasks | Actual connected plant/component envelope, doors/thresholds/turns and operators; representative handling/withdrawal/reinstatement trial can test that task | Body packing, a 600-circle route or an aperture width cannot establish a complete human action or safe handling. |
| Court carrier, landing and receiver failure | Resolve internal section/support, lowest vulnerable boundary and hydraulic basis; a later located water-path or access trial must reproduce the relevant inlet/head/backwater/temporary state | RWT low/higher alternatives and HAD court-level proposals remain unadopted. P02 floor-access research cannot substitute for structural, moisture or hydraulic design. |
| High roof/court repair | Competent access/temporary-works and actual component logistics first; representative component handling/reinstatement can answer the specific remaining question | The rejected tower does not become safe through a mock-up; no work at height, anchor or loading is authorised. |
| MRA concealed wetting, drying and reinstatement | Use named current failure scenario and first vulnerable layer, material/closure evidence and an actual observable recovery path; physical evidence only at a defined selected interface | EXT11 carrier leakage and EXT12 receiver renewal are distinct cases. Unknown drying/capacity cannot pass by referral to a future test. |
| Fire, acoustics, thermal/moisture or certified product performance | Relevant competent design, applicable product/system evidence and any warranted formal testing | A room-quality, water demonstration or repeated-removal screen grants none of these certifications. |

PHY-01 remains optional/held: selected ordinary direct finishes have not created a universal removable-wall dependency. PHY-02 remains held: a current accessible wet/service route may eventually warrant a bounded question, but its actual design, evidence value and authorisation must be established first. No new hard dependency or prototype family is created by this applicability packet.

## Release, result and change control

Current-house use of the historical packs requires this addendum and then a specific released specimen revision; the old READY wording describes its dated preparation scope. It is not a present build instruction. Internal option reduction may complete under PHY-03-ENGINEERING; competent structural/specimen acceptance remains outstanding under ER-STR-01 / EPR-RH11. PHY-04 requires a real authorised specimen/test and appropriate interpretation. Preparing a study or release record does not discharge those external/physical evidence obligations. Physical construction, procurement, appointments and external contact require their actual authorisation.

For any eventual event, retain the question/control/criteria fixed beforehand, actual specimen and product/detail revisions, competence/roles, measured geometry and observations, instrumentation/method where relevant, photographs/raw records, departures and failures, independent comparison, and the precise supported/unsupported conclusion. Separate general proposition evidence, current-house selection and formal technical performance. Record affected design/matrix rows, correction/retest or rejection, and downstream stale outputs. A successful local result does not automatically raise any project or pattern maturity.

If adoption changes floor depth/support, room height, trim geometry, openings, wet layers, service route or roof/court access, recheck only the affected specimen claims and their inputs. Preserve the old result for its actual configuration. There is no inherited pass across a changed specimen merely because its P03/P04 name survives.

## Validation and disposition

Current geometric deltas were checked against source-bound BCR studies and the bounded IAS selection. The five historical Markdown bodies and two SVG blobs are retained; added notices direct current use here. Repository/control/publication-boundary checks and independent review are recorded in the integrating PR. No physical, structural, hydraulic, fire, acoustic or building-physics validation occurred.

Applicability preparation is complete. It gives the existing manual gates a current, narrower evidence duty and allows a conventional fallback to remove unnecessary experimentation. All essential design/evidence obligations remain with their owners; a named reviewer or proposed test is not resolution.
