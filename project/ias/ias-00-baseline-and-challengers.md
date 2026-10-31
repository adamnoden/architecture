# IAS-00 — current-source baseline and challengers

**Outcome:** baseline inventory complete; shared interface freeze awaits OAS-00 and HAD-00

**Tracking:** [IAS #941](https://github.com/adamnoden/architecture/issues/941)

**Starting main:** `63b429938b3db27b13a3ea80cfc9a98825ac9e86`

**Reconciled BSR main:** `64597a4a75a53c845f93605a824fee7db53b0421`

**House:** `RH-LAYOUT-REVISION-02`, consumed by `RH-LAYOUT-FAMILY-02`

**Scope:** read-only source audit, inherited baseline/challenger comparison and a bounded shared-interface and candidate-family handoff. No architecture, drawing, manuscript topology, prototype state or performance authority is changed.

## 1. Question and dependency

What does the current house actually provide for the interior system, which
existing positions can be carried forward, and what must be resolved before
selecting a buildable wall/floor/service family?

The owner approves continuing from the current PLT candidates and defers later
aesthetic refinement. That does not establish a physical print verdict or
performance result. BSR #940 / PR #950 owns the manuscript topology and is now
closed. Its six-part migration establishes the IAS chapter/ownership interface.
This inventory does not author that chapter or select a detailed assembly;
the next shared gate is `TRIAD-IFACE-FREEZE`, after OAS-00 and HAD-00.
Only after that contract may IAS-01V and IAS-01H develop core candidates.

The baseline is deliberately selective. The project already rejected the
presumption that every wall or floor should become removable. IAS must develop
the interfaces that earn themselves, rather than relabel every previously held
experiment as a requirement of the new chapter.

## 2. Authority and applicability inventory

| Source | What carries forward | What does not carry forward automatically |
|---|---|---|
| [Current layout](../../docs/reference-house/layout-revision-02.md), `georgian/layout-revision.ts` | Current rooms, partitions, openings, service reservations and entrance void | A selected lining/frame, component withdrawal path, floor crossing or installed product |
| `georgian/section-source.ts` and [shared section record](../../docs/publication/architectural-plate-section-assemblies.md) | Nominal drawn wall/floor/ceiling layers and source-owned representation choices | Structural sizing, acoustic/fire build-up, selected foundation/head or performance proof |
| [RH-09 occupied-interface baseline](../../docs/reference-house/tectonic-integration-rh09.md) | W0/W1/W2 selection logic, conventional-floor presumption, selective dry routes and qualitative fixing classes | Historical room IDs, old service geography, installation dimensions or current-house technical validation |
| [Tectonic architectural language](../../docs/reference-house/tectonic-architectural-language.md) | Repose, real joinery, quiet interfaces and subordination of mechanism to room | A settled HAD material/panelling/cornice composition for every current room |
| [Controlled Attachment Plane](../../docs/patterns/controlled-attachment-plane.md) | A supported invariant for sparse, documented attachment where justified | A whole-room rack, anchor capacity, spacing, material or proprietary hardware selection |
| [Accessible Room Service Route](../../docs/patterns/accessible-room-service-route.md) | Bounded room-side distribution through serviceable architectural layers | Every skirting/architrave carrying services, or selected electrical routes/accessory positions |
| [High-Service-Room Service Wall](../../docs/patterns/high-service-room-service-wall.md) | Concentrated access from a maintainable side, with tool/withdrawal space | Enough clearance merely because a panel symbol exists, or a universal double wall |
| [Compartmented Service Void](../../docs/patterns/compartmented-service-void.md) | Continuous services do not require one continuous open void | Unreviewed cavity barriers, fire ratings, acoustic performance or penetration details |
| [Wall options](../../docs/research/replaceable-wall-system-options.md) / [floor options](../../docs/research/finish-agnostic-floor-platform-options.md) | Existing comparison hierarchy and burdens to test | Manufacturer capability as proof of domestic suitability or a product specification |
| [Manufacturing strategy](../../docs/development/manufacturing-strategy.md) | Small interface layer, bounded tolerance translation, ordinary fasteners and first articles | A factory system, dimensional module, anchor design or procurement commitment |
| [PHY programme](../phy/physical-validation-programme.md) / [RH-09 handoff](../../docs/reference-house/prototype-handoff-rh09.md) | PHY-03 engineering-first / PHY-04 priority; PHY-01/02 remain held at their stated scope | A new test programme, a released specimen or a physical result for the changed house |

The current computational source is not the historical RH-06/RH-09 building.
Those records remain evidence and design rationale at their own scope. Their
room/service routes and technical compiler results are not pasted into the
revised house. In particular, old claims about what runs beneath a floor do not
establish the actual services of this changed design.

## 3. Represented depth is already allocated

`compiler/reference-house/georgian/ias-baseline-audit.ts` reproduces this inventory
from the current plan/section source. Its output is deliberately not an IAS
approval or whole-building pass.

| Current source item | Nominal represented value | IAS consequence |
|---|---:|---|
| Envelope | 417.5 mm | Current representation, not an extra room-side lining allowance |
| Envelope finish | 15 mm | A backplane, service cavity and removable face cannot simply be added while claiming the same finished room datum |
| Internal partition | 125 mm | Total planning thickness only; no member/board/performance build-up or heavy-fixing capacity is established |
| Floor/service/ceiling zone | 3450 − 3100 = 350 mm | The floor package must be reconciled within this zone or explicitly rewind the source |
| Finish / deck / nominal framing / service void / ceiling | 20 + 22 + 238 + 55 + 15 = 350 mm | Zero currently unallocated depth; a platform, support rail or acoustic layer must replace/reallocate an existing assumption, not silently stack above it |
| Upper service-lining reservation | x = 9862.5; y = 2762.5; width = 250; depth = 5405 mm | Authored plan-space reservation, not a fully designed 250 mm wall assembly or proof of free component volume |
| Riser reservation | x = 9862.5; y = 4500; 550 × 700 mm | Reservation only; frame, pipe/duct packing, floor crossing and fire-stopping remain unresolved |

The 55 mm floor service void is an allocated zone, not an assurance that any
particular service or additional construction fits. The 238 mm drawn framing
zone is not a sized timber member. Older manuscript discussion of an approximately
300 mm engineering comparator is not a second compatible build-up to insert
without reconciliation. IAS-01H/BCR must make that comparison explicit.

No floor level, wall face, room clearance or ceiling height is changed here.
Any selected assembly that needs extra depth must show its replacement/reallocation
or raise a bounded source rewind before current geometry is treated as retained.

## 4. A panel reservation already crosses a nominal return

The source draws three upper access-panel reservations on the x = 9500 wet
spine. Their widths are lengths along that wall, not selected framed openings.
Comparing them with the adjoining nominal 125 mm partition faces gives:

| Current reservation | Reserved y interval | Clear interval between nominal return faces | Signed end margins | Result |
|---|---|---|---|---|
| U-ENS3: centre 3450; width 700 mm | 3100–3800 mm | 2712.5–3787.5 mm | +387.5 / **−12.5 mm** | Intersects the represented return |
| U-BATH: centre 4750; width 700 mm | 4400–5100 mm | 3912.5–6437.5 mm | +487.5 / +1337.5 mm | Inside the nominal interval; frame/handling still unproved |
| U-ENSP: centre 7350; width 900 mm | 6900–7800 mm | 6562.5–8167.5 mm | +337.5 / +367.5 mm | Inside the nominal interval; frame/handling still unproved |

This is a source-coordination warning, not a claim about an installed panel.
The drawing never selected a frame, panel height, fixing border, component or
withdrawal envelope. A centreline-only check would miss the first overlap.

**Coordination item I00-C1 (IAS-01V, then IAS-02S / IAS-02W):** resolve the U-ENS3 access assembly together
with its intended service task, current return and source branch before drawing
it as an opening. For comparison, the same 700 mm reservation centred at y =
3300 would occupy 2950–3650 mm and leave nominal margins of 237.5 / 137.5 mm.
That is a calculable alternative, not an adopted correction or proof that the
component can pass through it. The actual frame/clear-opening requirement may
make another answer better. Any adopted change must be recorded in the owning
house/service source and propagated to PLT; this packet changes no source data.

The comparison is one-dimensional; it does not establish clearance from door
leaves, other openings, fixtures, pipework or the component being accessed.
The audit returns UNKNOWN when a return, host or thickness is absent. It does
not turn an unknown boundary into zero thickness or promote positive nominal
clearance into access approval.

## 5. Baselines and challenger dispositions

These retain the existing project hierarchy for the new implementation work;
they do not promote held candidates into validated patterns.

| Family | Baseline / challenger disposition | Burden that must earn the added system |
|---|---|---|
| Quiet masonry wall | W0 direct mineral/plaster finish remains the control | Another face must provide useful access/renewal/fixing value while matching solidity and calm |
| Conventional independent drylining | Keep as a technical comparator where separation is needed | Buried fixings, filled joints and perimeter seals do not establish repeated removability |
| Sparse attachment datums | W1 is the starting interface direction where a declared task earns it | Locate loads and services; classify permanent anchors and adjustment; no global rack by default |
| Removable dense-mineral face | W2 stays a selective challenger | Actual task, depth, real joints, weight/handling, impact, rattle, fixing, repeated reinstatement and boundary independence |
| True timber panelling / joinery | Available where HAD selects it architecturally | Removability is additional work, not a reason to impose panelling or hide arbitrary technical seams |
| Fully integrated demountable wall cassette | Reject as the house-wide default | No current task justifies transferring many boundary duties to a bespoke replaceable cassette |
| Ordinary principal-room floor | Conventional continuous floor remains the control | Acoustic/fire/structural build-up still needs competent design; conventional does not mean already verified |
| Selective floor-access band | Held until an actual current service intervention earns a location | Compare with a local hatch and wall/joinery access; clear fixed furniture, edges and thresholds |
| Full-room access floor / dense-mineral platform | Not the first design move | Must solve a substantial problem left by selective access without exporting depth, joints, hollow footfall or supplier dependence |
| Low-level dry route with declared rises | Develop selectively under IAS-02S | Appropriate service classes, segregation, protection, boundary stops and accessible accessories require competent design |
| High-service access face | Carry into IAS-01V, then IAS-02S / IAS-02W | Keep routine removal on a maintainable side; identify actual components, tool space and removal path |

No score is assigned to untested acoustic, fire, cost, carbon or tactile
performance. A mechanism with more reversible joints is not automatically the
winner. An excellent conventional implementation is a real alternative, not
a deliberately weak control.

## 6. Representative conditions and next design decisions

| Condition | Work that IAS must resolve | Interface / evidence owner |
|---|---|---|
| Quiet masonry wall and one declared fixing datum | Finished datum, boundary treatment, sparse anchor/ground, removable trim where needed; distinguish ordinary and consequential loads | IAS-01V; EPR for anchor/load/performance questions; HAD for visible composition |
| Lightweight partition return | Keep the 125 mm total as a planning constraint until a real build-up is chosen; do not assume masonry-style grounds or capacities | IAS-01V; BCR/EPR for required performance and changed depth |
| U-ENS3 / U-BATH / U-ENSP access fronts | Component/task list; dry-side approach; return/frame margins; service-reservation cross-section; panel height, capture and reinstatement sequence | IAS-01V then IAS-02S / IAS-02W / I00-C1; MEP/fire/acoustic input through BCR/EPR |
| Floor edge and ceiling below | Reconcile the 350 mm package and actual service tasks before adding access; keep structural/boundary duties out of a decorative access layer | IAS-01H; existing PHY-03 / EPR applicability check through BCR |
| Dry skirting, corner and door-side rise | First release point, ordinary tool access, local pieces, service/no-fix map, accessory interruption and stop at significant boundaries | IAS-02S; electrical design through BCR/EPR; OAS/HAD at opening/visible trim |
| Wall/ceiling cover | One controlling attachment, independent movement, accessible release, boundary continuity and decoration that does not lock the joint | IAS-HAD-JUNCTION; existing PHY-04 comparison, not an automatic new prototype |
| Window/door-adjacent lining | Independent room-side termination, release order and no brittle bridge across the replaceable frame | IAS-OAS-JUNCTION; OAS owns the envelope crossing and doorset/cassette |
| Kitchen, wet-room and grille/access pieces | Support and isolation duties, opening sequence and reinstatement independent of brittle wet finishes where possible | IAS-02W / IAS-HAD-JUNCTION; HAD for appearance; BCR for technical evidence routes |

After the shared interface freeze, the minimum vertical worked family is **one quiet wall/attachment datum plus one
high-service access front**, including a partition return and floor/ceiling
termination. That answers a current need without requiring a universal removable
wall. Reuse existing PHY-03/04 questions only after checking applicability;
neither PHY-01 nor PHY-02 is reactivated merely by this inventory.

## 7. Removal and reinstatement comparison

Every later candidate must name the component/task before it is detailed as
accessible, then show:

1. safe isolation or any required prerequisite;
2. the first reachable release and ordinary tool approach;
3. removal of the minimum local trim/face, with finish edges protected;
4. the component's tool and withdrawal space, including normal furniture/joinery;
5. which permanent boundary stays intact and which controlled crossing needs
   competent reinstatement;
6. reinstallation, capture, alignment, closure and verification after access.

No particular component mass, anchor capacity, panel height, tolerance range or
frame aperture is invented in IAS-00. Manufacturing information follows the
selected detail and first article; it is not a second technical framework added
ahead of the architectural question.

## 8. Packet result and falsifiers

IAS-00 supplies a current-source inventory, a retained conventional/challenger
hierarchy, quantified depth constraints and one reproducible access-reservation
coordination item. It does not close IAS #941 or select the full interior system.

The direction changes if a current authoritative maintenance task requires a
different route, a proportionate assembly cannot fit the represented depths,
ordinary construction performs the task better, or competent/physical evidence
rejects an implementation. Such results narrow or rewind the implementation;
they do not justify hiding extra construction in the drawings.

BSR is closed. **Next: shared `TRIAD-IFACE-FREEZE` after OAS-00 and HAD-00.**
This inventory contributes the current datums, depth budgets, retained controls
and I00-C1 to that contract. IAS-01V / IAS-01H then explore vertical/horizontal
candidates; IAS-02S / IAS-02W and the IAS-OAS / IAS-HAD junction nodes reconcile
services, wet variants and shared interfaces against those candidates. IAS-03
selects the family; the shared TRIAD-GATE precedes coordinated BCR input.
HRS and final PLT/EDA/PUB retain their downstream gates.

This handoff was reconciled with the parallel PCO/ACO topology added while
IAS-00 was running. The earlier linear IAS-01…06 sequence is superseded by the
canonical [execution graph](../control/nodes/architecture.ts) and issue #941.

## Reproduction and validation boundary

The audit is `auditIasBaseline()` in
`compiler/reference-house/georgian/ias-baseline-audit.ts`. Its independent interval
tests cover the 12.5 mm overlap, a nominally clear alternative and unknown/invalid
geometry. The baseline contract checks allocation arithmetic and absence of
source mutation or performance promotion. Existing repository/type/publication
checks apply. No PDF, construction detail or performance test is manufactured
to make this inventory appear further advanced.
