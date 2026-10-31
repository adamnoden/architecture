# OAS-00 — opening taxonomy, baselines and invariants

**Result:** opening baseline complete; shared interface freeze awaits HAD-00.

**Tracking:** [OAS #942](https://github.com/adamnoden/architecture/issues/942).

**Starting main:** `fa31e0325777d7cba0151706df52794064b054ce`.

**House:** `RH-LAYOUT-REVISION-02`, consumed by `RH-LAYOUT-FAMILY-02`.

## Question and scope

Which opening conditions does the current house actually contain, what is the
excellent conventional control, and which dimensions and boundary duties must
IAS/OAS/HAD share before developing candidate assemblies?

This is a source inventory and design brief. No opening, wall, threshold,
product, construction junction, prototype state or performance claim is changed.
It closes OAS-00 only. OAS #942 remains open for candidate development, selection,
replacement drawings and the coordinated-house gate.

## Authority and applicability

| Source | Carries forward | Does not establish |
|---|---|---|
| `compiler/reference-house/georgian/layout-revision.ts`, `revisionOpenings()` | Current level, host, centre, nominal width, door swing/leaf representation | Surveyed masonry aperture, frame size, clear passage, operating sash or withdrawal envelope |
| `georgian/layout-family.ts`, elevation/section model derivation | Shared current opening heights and architectural profiles | Selected frame depth, weather seal, sill construction, threshold upstand or structural head |
| `georgian/section-source.ts` and [section record](../../docs/publication/architectural-plate-section-assemblies.md) | Nominal 417.5 mm envelope, 200 mm drawn head zone and represented layers | Lintel design, cavity closure, thermal bridge or complete opening junction |
| [Window pattern](../../docs/patterns/permanent-opening-replaceable-window.md), [door pattern](../../docs/patterns/permanent-opening-replaceable-door.md), [threshold pattern](../../docs/patterns/designed-threshold.md) | Enduring opening, renewable assembly, real fixing/adjustment and boundary-aware replacement | Requirement for a proprietary cassette, a subframe at every opening or a raised threshold everywhere |
| [IAS-00](../ias/ias-00-baseline-and-challengers.md) | 15 mm ordinary envelope finish allowance, fully allocated 350 mm floor zone, 125 mm nominal partitions and explicit source rewind | Spare reveal/floor volume, selected room-side lining or resolved service-access front |
| [DRW-11B decision](../../docs/publication/architectural-drawing-drw11b-permanent-opening-detail-decision.md) | Why OW-01 construction-style details were withheld; the missing authority to earn re-entry | A selected jamb/head/sill merely because the drawing engine can render it |
| [RH-09 handoff](../../docs/reference-house/prototype-handoff-rh09.md) | Window full-frame and external-threshold questions, conventional fallback | A completed mock-up or current-house technical validation |
| [Window/masonry research family](../../docs/computational/boundary-family-window-masonry-v01.md) and [interface bundle](../../docs/computational/interface-bundle-window-masonry.md) | Checklist of recurring boundary obligations and selective invalidation | Applicability of the historical S0 wall build-up, current product/site evidence or a pass for this house |

The earlier masonry research family has different wall dimensions from the
current 417.5 mm representation. Its layers and results are not imported. Frame
position through the current wall depth remains unselected. Old dormer fields
retained in inherited source objects do not author roof openings: the current
roof has no openings and external maintenance access remains unresolved.

## Current occurrence taxonomy

The counts below come from `revisionOpenings('GROUND' | 'FIRST')`, grouped by
`outer-`, `court-` and partition host. Scope is those two current occupied levels;
this is not a certified opening schedule or quantity-survey deliverable.

| Condition | Ground | First | Nominal widths | Representative question |
|---|---:|---:|---|---|
| Outer-envelope window | 15 | 17 | 1000 mm | Ordinary jamb/head/sill, room-side access and full-frame renewal |
| Courtyard window | 4 | 8 | 1000 mm | Same boundary obligations; court exposure, drainage, access and visible expression need their own applicability check |
| Outer external door | 3 | 0 | Front 1800; plant 1400; garden 2400 mm | Entrance composition, plant carrying task and garden threshold are different duties |
| Courtyard external door | 2 | 0 | 2400 mm each | Two-ended front-to-garden route, court water management and maintainable threshold |
| Internal door | 6 | 8 | Cloak 800; principal 1000; others 900 mm | Quiet frame/trim junction, use-specific boundaries and floor transition |
| **Total** | **30** | **33** | **44 windows + 19 doors** | Five external door occurrences carry external-threshold questions |

Opening identity is **level + host + id**. Repeated ids across levels must not
collapse two occurrences. Window `swing`/`leaves` metadata inherited from a shared
constructor is not an operating-sash or replacement-sequence specification.
The six-over-six expression is architectural representation, not a chosen product.

The current rear first-floor elevation has four outer windows; the centre is
absent. Ground court doors are `grand-court-entry-south` and
`grand-court-entry-north`. Do not recover the older garden/court door arrangement
from `source.ts` in isolation: `revisionOpenings()` filters and replaces it.

### Dimensional envelope, not construction allowance

| Current datum | Represented value | Constraint on later work |
|---|---:|---|
| Ground / first finished floor | 0 / 3450 mm | Coordinate threshold/floor families against the same datums |
| Window sill / head, relative to level | 750 / 2850 mm by current family derivation | 2100 mm nominal aperture height; no selected sash/glazing/clear escape dimension |
| External door bottom / head, relative to level | 0 / 2850 mm by family derivation | Front leaf/fanlight profiles are not interchangeable with gross aperture or clear passage |
| Ordinary wall representation | 102.5 weather + 160 cavity + 155 inner including finish = 417.5 mm | Frame depth/position, closer and fixing cannot be inferred from a profile symbol |
| Ordinary inner finish | 15 mm | Removable reveal/architrave and IAS lining need a real depth allocation |
| Internal partition | 125 mm total | Frame anchorage and head/jamb build-up remain to be designed |
| Facade ground / entrance landing | −150 / 0 mm | Nominal drawing relationship; does not select courtyard/garden paving, drainage or accessible approach |

The nominal 60 mm frame face, 80 mm sill projection and 120 mm facade head
profile are presentation/source choices, not selected fabrication sections.
The 200 mm section head zone is not a designed lintel. The elevation's door
threshold mark at sill +50 mm does not select a 50 mm step: OAS-01E must own a
real threshold and exterior level/drainage section before such a claim exists.
No dimensional tolerance, fixing edge distance or product allowance is invented
by subtracting an arbitrary gap from the current aperture.

## Conventional controls and challengers

| Family | Disposition | What must earn the extra interface |
|---|---|---|
| Mechanically fixed conventional window/doorset with deliberate mounting zone, accessible internal trim and specified boundary reinstatement | Primary comparison control; detailed installation still unselected | Full-frame replacement and environmental continuity must actually be shown; ordinary installation is not assumed adequate by name |
| Serviceable sash/glazing/hardware within a retained sound frame | Include as a maintenance operation | Does not answer eventual full-frame replacement |
| Sparse durable grounds/brackets with replaceable frame and independent trim | Candidate | Accessible load path, adjustment, opening-edge protection and compatible boundary transitions |
| Continuous retained subframe/cassette | Challenger, not house-wide default | Demonstrable renewal benefit versus extra joints, thermal/moisture consequences, tolerance stack, material life and supplier dependence |
| Replaceable whole lining/reveal module | Selective challenger at a real task | Must coordinate IAS depth and HAD expression without moving finished faces or destroying a primary boundary |
| Conventional internal frame with serviceable hinges/locks and removable real architrave | Internal-door control | Quietness, adjustment and proportionate full-frame renewal; no bespoke cassette assumed for a light partition |
| Conventional external doorset and integrated threshold | External control | Keep weathering, accessibility, seals, drainage and replacement together; no detached decorative threshold solution |

These are comparison positions, not product or performance selections. Reject a
cassette that merely moves destructive work to a hidden joint, traps water,
requires one future supplier or burdens every opening to solve a rare task.
A special system must beat the excellent conventional control at its stated
maintenance task while retaining the required architectural and boundary duties.

## Inputs to the shared interface freeze

1. **Retain geometry:** current host/centre/aperture, storey datums and roof policy
   remain controlled; a change goes to the house/PLT source through an explicit rewind.
2. **Name dimensional meanings:** masonry opening, tolerance zone, frame outside,
   visible frame, clear opening and withdrawal envelope are separate quantities.
   OAS owns their proposed relationship; the current nominal width is not all six.
3. **Own each boundary:** OAS owns mounting/weather/air/thermal/vapour intent and
   external door/threshold candidates together. IAS owns the room-side lining and
   floor termination; HAD owns visible reveal/trim/frame proportions and expression.
4. **Keep provisional budgets explicit:** no automatic extra lining, floor or
   reveal volume. Frame position, tolerances, court/garden levels, drainage,
   threshold section, release/tool space and carrying envelopes are unresolved inputs.
5. **Protect replacement:** state which boundary remains intact, which component
   is sacrificed/renewed and how a disturbed boundary is reinstated and verified.
   Concealment is allowed; inaccessible fixings disguised by plaster are not a solution.
6. **Rewind locally and visibly:** changed opening size or frame position requires
   checking plan/elevation, room use, IAS junction, HAD proportions and affected
   structural/environmental questions. A new product does not automatically reopen
   unrelated house geometry, but it cannot inherit old evidence outside its scope.

This is OAS's input to the shared contract, not a unilateral completed freeze.
HAD-00 still has to contribute its brief and hierarchy before that node proceeds.

## Representative conditions and candidate exit questions

OAS-01E begins after the shared freeze with one ordinary outer window and a
courtyard counterpart, then the front entrance, garden/court double door and
plant-replacement door. Keep head, jamb, sill/threshold, drainage, mounting and
boundary continuity in the same candidate. The plant door's nominal 1400 mm
width does not establish that an unspecified plant item can be carried through it.

OAS-01I compares a quiet room door, the 800 mm cloak condition and a wet/service
room interface. Any fire/smoke, acoustic, privacy, security or accessibility duty
must first have its applicable use/context established; none is inferred from
a generic door symbol. Do not assign every internal door a performance class.

Every candidate records: the replacement task (hardware, sash/glazing, leaf,
full frame, threshold or retained mounting interface); reachable first release;
ordinary tool and handling space; trim/finish protection; isolation/support
prerequisites; removal route; boundary interruption and reinstatement; and
alignment/closure checks. Inside removal is a direction to test, not a proven
universal operation. Product mass, furniture, guarding and access constraints
remain actual inputs before a removal operation is accepted.

OAS-03 selection follows core candidates and the IAS/OAS and OAS/HAD junction
nodes. The shared TRIAD-GATE must establish one house before selected BCR input.
Detailed assembly drawings must cite actual new design authority; OAS-00 does
not overturn DRW-11B or manufacture a 1:5 construction-style detail.

## Evidence routes and falsifiers

BCR routes concrete structural/fixing, lintel, air/water/thermal/moisture,
fire/acoustic/security and access questions to competent EPR/product evidence;
DEL identifies responsibility, manufacture and reinstatement records. A selected
novel joint may earn a PHY question through BCR. This inventory neither starts a
new prototype nor reactivates held tests. Current PHY routing remains authoritative.

The position changes if an actual frame/maintenance task cannot fit, retained
parts make future replacement less robust than conventional work, a boundary
cannot be reinstated reliably, the visible assembly fails HAD's repose criteria,
or evidence rejects the environmental/structural proposition. Reject, simplify
or explicitly rewind the affected candidate; do not weaken the task after failure.

## Reproduction and result boundary

Import `revisionOpenings` from
`compiler/reference-house/georgian/layout-revision.ts`; for GROUND and FIRST,
group `kind` by host prefix `outer-`, `court-` or remaining partition host.
Read nominal vertical aperture derivation in `layout-family.ts`, not from a
window product or the older unmigrated plan. Existing layout-family regression
checks retain the shared current plan/elevation/section relationships.

Repository integrity, project-control validation and canonical CI apply. No
new audit engine, duplicate source schedule, drawing or physical proof is needed
for this bounded inventory. Completing OAS-00 changes execution state only;
architectural selection, maturity and construction acceptance remain unchanged.
