# MAT — material integrity and synthetic-polymer avoidance

**Tracking:** [#1100](https://github.com/adamnoden/architecture/issues/1100). **Direction:** owner's 30 October 2026 instruction; [whole-house material policy](../../docs/reference-house/material-policy.md). This programme serves the actual house under the [charter](../owner-house-charter.md), not a materials-purity demonstration detached from occupation, safety or budget.

## Question and ownership

How far can the whole installed house avoid synthetic polymers, especially visible/touchable ones, through simpler material and assembly choices, while keeping every necessary performance duty and making residual exceptions explicit?

MAT owns the requirement, constituent audit, cross-system comparison and exception record. IAS/OAS/HAD/ROF/RWT/BCR retain their actual assemblies and drawings. There is one materials requirement and one rainwater programme, not a parallel task graph. Canonical scheduling lives in `project/control/nodes/materials.ts` and the existing owning node shards. Issue discussion is not lifecycle authority.

## Packets and earned exits

| Packet | Question and required output | Dependencies and exit boundary |
|---|---|---|
| MAT-00 | Establish binding owner policy, initial adverse evidence, supersession of plastic defaults and this coherent research/design plan | Owner-directed. Completion is policy/planning only, not a whole-house audit or selected-material pass |
| MAT-AUDIT | Inventory each proposed installed assembly from permanent fabric through appliance internals: core, facing, binder, coatings, joints, accessories, temporary components that remain, visibility, quantities and uncertainty | After MAT-00. [Current-concept register completed](constituent-audit.md): known polymers, evidenced non-polymer components and unknowns separated across 54 entries. Historical applicability and quantity uncertainty remain explicit; future product disclosure is not accepted in advance |
| MAT-ENVELOPE | Resolve non-plastic alternatives for structure/insulation, roof underlays, wall/floor damp and air boundaries, openings, glazing and external finishes; apply the [ground-water policy](../../docs/reference-house/ground-water-policy.md) and establish substantial damp protection with justified extra margin | After MAT-AUDIT. Owning section/product changes, cost/repair consequences and any requested exceptions; a non-plastic core does not close an assembly |
| MAT-SERVICES | Resolve supply/heating/drainage, concealed sleeves/supports, electrical/data routes, controls, ventilation and equipment residues | After MAT-AUDIT. Include electrical terminations and valve/seal innards. Reuse RWT-METALS for rainwater; never author a competing metal-compatibility table. Do not retrofit uncertified appliance internals |
| MAT-INTERIORS | Resolve wet rooms, floor/wall finishes, joinery/glues, sanitaryware, ironmongery, paint/clearcoats and concealed linings | After MAT-AUDIT. Develop actual compliant assemblies with IAS/OAS/HAD; replace a polymer waterproofing concept with a complete water-safe design, not omission of waterproofing |
| MAT-COORDINATION | Reconcile the selected house against all three design results; resolve or explicitly obtain owner decisions on every remaining polymer exception; supply procurement/change controls | After the three alternatives packets. No unresolved mandatory constituent or unapproved exception may be labelled accepted. Feeds TRIAD-GATE; does not grant fire/structural/regulatory acceptance |

The three design packets can proceed independently after the inventory. Read other work for context without inventing hard dependencies. MAT-COORDINATION must not depend on TRIAD-GATE: it is an input to that gate, not a circular prerequisite. Necessary external evidence can remain a named hold; do not fabricate it or use completion counts as proof.

## Ground-water requirement amendment — 30 October 2026

The [ground-water and rising-damp policy](../../docs/reference-house/ground-water-policy.md) adds passive dryness, explicit rejection of plastic DPCs and substantial slate/engineering-brick candidate construction with generous evidence-based margin to the house brief. The owner clarified the earlier "triple redundancy" wording as overbuilding, such as extra slate depth, with the detailed arrangement delegated to design judgement. It also records the owner's 1,000-year ambition without asserting a service-life result. This amendment does not execute or complete MAT-AUDIT or MAT-ENVELOPE, and it does not reopen historical studies merely to erase their original conclusions.

MAT-AUDIT must include the actual proposed ground/wall/floor boundaries and all retained constituents. MAT-ENVELOPE, with BCR and the owning assembly designers, must supply:

- a source-to-vulnerable-fabric section and junction set covering every consequential upward capillary path, including internal walls, thresholds and penetrations;
- a conventional mineral-assembly baseline and an evidence-led comparison of beneficial extra thickness, courses, joint protection or justified backup, including bypass risks;
- exact material suitability and complete joints/bedding, avoiding generic approval of all engineering brick, roofing slate or metal trays;
- bearing, shear/sliding, restraint and movement appraisal of the whole arrangement, including any consequential arch thrust; no unengineered stack of sheets or courses;
- construction verification, inspectable bypass risks, drying and intervention routes, with whole-life burden and unresolved evidence stated.

Exposure reduction, drainage and inspection support the substantial barrier. No mandatory three-system arrangement or literal thickness multiplier is imposed; the final construction remains open. Feed the proposed design to the existing MRA assurance process; do not invent a second moisture matrix or use a passed material audit as proof of physical dryness.

## Current constituent audit — 30 October 2026

The [whole-house constituent register](constituent-audit.md) is the single current inventory. Its 54 entries cover ground and structure, roof and rainwater, openings, interiors, services, equipment and retained construction residues. It replaces the programme's initial adverse-inventory table; the [MAT-00 result](material-water-direction-result.md) and reconnaissance below retain the dated policy-stage evidence.

The audit locates hidden polymer dependencies in wet-room bonding products and fixtures, roof membranes, pipe accessories, ventilation distribution and cylinder insulation. It also records substantial unknowns where the house has only a material intention, geometric reserve or unadopted comparison. No complete installed assembly, product schedule, installed quantity or exception is accepted. The three alternatives packets can now proceed from the same source-linked baseline; their design selections must update the affected rows, and MAT-COORDINATION must reconcile the selected house later.

MAT-ENVELOPE should first develop the ground/wall/floor section and substantial mineral damp barrier, including joints, bypasses and structural interfaces, under the amendment above. MAT-SERVICES owns complete service/equipment alternatives with RWT retaining its single metal-compatibility record. MAT-INTERIORS must revisit the complete wet assembly and actual finish/joinery constituents. Current design unknowns remain visible work, not an exemption from the policy.

Historical holds preserve the old source identities and technical learning. Existing completed research packets remain complete at their original scope; successors and the final material gate prevent old evidence being silently promoted to new policy compliance.

## Design comparisons

- [Enamelled tray, located drain and renewal comparison](interior-shower-tray-alternatives.md) — MAT-INTERIORS locates four 5940 drain orientations against the unadopted IAS room, carries west-side access forward for detailing, identifies a metal support candidate and an explicit plastic waste counterexample, and defines wall/seal/tray renewal duties. I05/I07/I08 are updated; no complete assembly or packet closeout is selected.
- [Mineral ground boundary and floor junction comparison](envelope-ground-boundary.md) — MAT-ENVELOPE develops the bonded DPC1/slate comparison, separates floor insulation from moisture/gas and movement duties, and excludes exact lined cellular-glass variants under the default policy. Its [dry-jointed stainless tray candidate](envelope-ground-boundary.md#dry-jointed-stainless-cavity-tray-candidate) leaves the inner-leaf membrane interface and outlet setting-out unresolved. It defines the next wall/floor, internal-support, threshold and penetration junctions; no complete assembly, house geometry or packet closeout is selected.
- [Water joints, isolation residues and repair access](services-water-joints.md) — MAT-SERVICES develops accessible metal-sealing compression connections, excludes exact polymer-bearing press/valve examples under the default policy, and tests the connection and first-release burden against the existing BCR/IAS service geography. S01 remains unresolved as a complete installed water system; no geometry, exception or packet closeout is selected.

## Primary-source reconnaissance, accessed 30 October 2026

The following observations bound the initial design work. They are not procurement recommendations or a complete lifecycle assessment.

- **Schlüter:** [KERDI-200](https://eu.schluter.com/en-GB/waterproofing-224/e/22011/kerdi-200?search=kerdi) identifies a polyethylene membrane; [KERDI-BOARD](https://eu.schluter.com/en-GB/substrates-building-317/e/22635/kerdi-board) identifies an XPS rigid-foam core. The existing IAS wet-room comparison is therefore materially affected even though the plastics are behind tile. Board reinforcement, adhesives and joint accessories must also be audited.
- **Gutex:** [Thermosafe-homogen](https://www.gutex.co.uk/products-systems/insulation-materials/gutex-thermosafe-homogenous~p1081) declares 4% PUR resin and 0.5% paraffin. This is a counterexample to treating 'wood fibre' as automatically plastic-free, not a finding that this product is installed in the house or that all wood-fibre products share its recipe.
- **FOAMGLAS:** its [cellular-glass technical explanation](https://www.foamglas.com/en-gb/advice-center/general-advice/chemical-durability) reports no organic binder in the insulation. The separate [PC 56 adhesive](https://www.foamglas.com/en/products/adhevises/pc-56) contains a bitumen-based emulsion and cementitious component. A suitable inorganic core is a promising alternative, not approval of its complete adhered/faced assembly; investigate jointing, additional constituents and exposure separately. Bitumen is not silently classified as plastic or approved because it is not called plastic.
- **Chemelex Pyrotenax:** [mineral-insulated wiring](https://www.chemelex.com/en-us/pyrotenax/solutions/fire-rated-wiring/mineral-insulated-wiring-vs-polymeric-alternatives) provides a real alternative family; its [UK standard termination kits](https://www.chemelex.com/en-gb/pyrotenax/products/standard-termination-kit) show that the cable is not the entire circuit. The [subsequent UK cable/termination comparison](services-mineral-cable.md) retains bare copper/MgO cable while identifying edition-specific PVC/PTFE end components and current formulation gaps. It develops accessible continuous routes without approving a complete circuit or owner exception. MAT-SERVICES remains planned; no US fire-system approval is transferred.
- **Copper Development Association:** [copper gutter specifications](https://archive.copper.org/applications/architecture/arch_dhb/specifications/arch_specs/gutters_downspouts.php) include soldered seams, movement provisions and some separation/sealing materials. A copper system must still disclose its joint and coating chemistry; a metal headline alone cannot close MAT.

Source statements are product/edition-specific. Do not transfer a listed composition or performance from one family to another. Supplier changes trigger reassessment.

## Research method and falsification

For every major assembly, compare a credible non-plastic baseline against the current concept. Include buildability, whole-life repair and ordinary workmanship, thermal/moisture/fire/structural duties, component service life, craft availability, procurement and cost ranges with evidence dates. Prefer deletion and ordinary robust construction over proprietary or bespoke complexity. Do not substitute an unrelated risk merely to remove a visible polymer.

Evidence that would defeat a candidate includes: required polymer accessories not disclosed; irreversible wet-critical bonds; inadequate thermal/fire/water performance; incompatible movement; unrepairable seals; or disproportionate space/cost/maintenance burden that would make redesign better. A failed non-plastic candidate does not automatically approve the old plastic one. Record alternatives, redesign options and the exact owner's decision.

## Exceptions, sampling and procurement

Use the policy's single exception record rather than adding a second approvals system. No exception is approved at programme creation. When one is proposed, retain its manufacturer revision, constituent quantities/uncertainties, location, function, exposure, alternatives and owner decision. Keep undecided cases visibly unapproved. Actual contacting, commissioning, purchasing and mock-ups require their own authorisation.

Before design selection, inspect representative product sections and verify the complete layers. Before procurement, demand constituent and accessory declarations for the actual products; record proposed substitutions, obtain owner approval where policy changes, and recheck the affected performance. At delivery/installation, compare labels and samples with the approved schedule. Do not allow a contractor substitution to bypass the policy by retaining a similar colour or product title.

## Interfaces and limits

RWT owns water topology, free shedding, copper collection and brass-channel development; MAT owns the material requirement. ROF owns eaves/coverings/underlays; HAD owns Georgian expression, courtyard space and landscape relationships; IAS/OAS own connected internal/opening assemblies; BCR resolves construction implications; MRA attacks moisture consequences; DEL carries constituent and substitution requirements into eventual delivery information.

Material-policy compliance and physical adequacy are different gates. This work neither certifies a plastic-free house nor establishes health superiority, universal material durability, structural capacity, water safety or regulatory acceptance. The final design must remain honest about residual materials and evidence limits.
