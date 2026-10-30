# MAT — material integrity and synthetic-polymer avoidance

**Tracking:** [#1100](https://github.com/adamnoden/architecture/issues/1100). **Direction:** owner's 30 October 2026 instruction; [whole-house material policy](../../docs/reference-house/material-policy.md). This programme serves the actual house under the [charter](../owner-house-charter.md), not a materials-purity demonstration detached from occupation, safety or budget.

## Question and ownership

How far can the whole installed house avoid synthetic polymers, especially visible/touchable ones, through simpler material and assembly choices, while keeping every necessary performance duty and making residual exceptions explicit?

MAT owns the requirement, constituent audit, cross-system comparison and exception record. IAS/OAS/HAD/ROF/RWT/BCR retain their actual assemblies and drawings. There is one materials requirement and one rainwater programme, not a parallel task graph. Canonical scheduling lives in `project/control/nodes/materials.ts` and the existing owning node shards. Issue discussion is not lifecycle authority.

## Packets and earned exits

| Packet | Question and required output | Dependencies and exit boundary |
|---|---|---|
| MAT-00 | Establish binding owner policy, initial adverse evidence, supersession of plastic defaults and this coherent research/design plan | Owner-directed. Completion is policy/planning only, not a whole-house audit or selected-material pass |
| MAT-AUDIT | Inventory each proposed installed assembly from permanent fabric through appliance internals: core, facing, binder, coatings, joints, accessories, temporary components that remain, visibility, quantities and uncertainty | After MAT-00. Produce one source-linked register; flag known polymers, evidenced non-polymer constituents and unknowns separately. Include historical applicability; do not list historical fixtures as installed products |
| MAT-ENVELOPE | Resolve non-plastic alternatives for structure/insulation, roof underlays, wall/floor damp and air boundaries, openings, glazing and external finishes; apply the [ground-water policy](../../docs/reference-house/ground-water-policy.md) and its three-barrier evidence requirement | After MAT-AUDIT. Owning section/product changes, cost/repair consequences and any requested exceptions; a non-plastic core does not close an assembly |
| MAT-SERVICES | Resolve supply/heating/drainage, concealed sleeves/supports, electrical/data routes, controls, ventilation and equipment residues | After MAT-AUDIT. Include electrical terminations and valve/seal innards. Reuse RWT-METALS for rainwater; never author a competing metal-compatibility table. Do not retrofit uncertified appliance internals |
| MAT-INTERIORS | Resolve wet rooms, floor/wall finishes, joinery/glues, sanitaryware, ironmongery, paint/clearcoats and concealed linings | After MAT-AUDIT. Develop actual compliant assemblies with IAS/OAS/HAD; replace a polymer waterproofing concept with a complete water-safe design, not omission of waterproofing |
| MAT-COORDINATION | Reconcile the selected house against all three design results; resolve or explicitly obtain owner decisions on every remaining polymer exception; supply procurement/change controls | After the three alternatives packets. No unresolved mandatory constituent or unapproved exception may be labelled accepted. Feeds TRIAD-GATE; does not grant fire/structural/regulatory acceptance |

The three design packets can proceed independently after the inventory. Read other work for context without inventing hard dependencies. MAT-COORDINATION must not depend on TRIAD-GATE: it is an input to that gate, not a circular prerequisite. Necessary external evidence can remain a named hold; do not fabricate it or use completion counts as proof.

## Ground-water requirement amendment — 30 October 2026

The [ground-water and rising-damp policy](../../docs/reference-house/ground-water-policy.md) adds passive dryness, explicit rejection of plastic DPCs, preferred slate/engineering-brick candidates and three independently effective capillary barriers to the house brief. It also records the owner's 1,000-year ambition without asserting a service-life result. This amendment does not execute or complete MAT-AUDIT or MAT-ENVELOPE, and it does not reopen historical studies merely to erase their original conclusions.

MAT-AUDIT must include the actual proposed ground/wall/floor boundaries and all retained constituents. MAT-ENVELOPE, with BCR and the owning assembly designers, must supply:

- a source-to-vulnerable-fabric section and junction set covering every consequential upward capillary path, including internal walls, thresholds and penetrations;
- three identifiable non-plastic barriers, each with evidence for its defined standalone performance when the other two are ineffective, plus a common-bypass review;
- exact material suitability and complete joints/bedding, avoiding generic approval of all engineering brick, roofing slate or metal trays;
- bearing, shear/sliding, restraint and movement appraisal of the whole arrangement, including any consequential arch thrust; no unengineered stack of sheets or courses;
- construction verification, inspectable bypass risks, drying and intervention routes, with whole-life burden and unresolved evidence stated.

Exposure reduction, drainage and inspection support these barriers but do not count as three interchangeable DPCs. The third barrier and the final construction remain open. Feed the proposed design to the existing MRA assurance process; do not invent a second moisture matrix or use a passed material audit as proof of physical dryness.

## Initial adverse inventory — not the complete audit

| Located source or candidate | Immediate disposition under the new policy | Design owner / next question |
|---|---|---|
| `project/rwt/conventional-carrier.md`: PVC-U preferred comparison from #1099 | Material preference superseded; keep tests and geometry as dated evidence | RWT-METALS/RWT-06: copper or another justified non-plastic complete carrier/joint/support assembly; reconsider the route rather than simply changing pipe modulus |
| `project/rwt/carrier-support.md` and `north-court-carrier.md`: PE carrier/sleeve and polymer spacer family | No concealed-parts exemption; these are not current admissible defaults | RWT with MAT-SERVICES: eliminate unnecessary sleeves/parts where possible; otherwise re-evaluate complete non-plastic assembly and leak/renewal duty |
| `project/ias/ias-03-bedroom4-assembly-successor.md`: KERDI-200 and KERDI-BOARD wet assembly | Polyethylene membrane and XPS board are identified polymer dependencies; selected-house adoption now requires redesign or a specific owner-approved exception | IAS/MAT-INTERIORS: actual waterproof floor/wall/threshold assembly and movement joints; no blind mineral-board swap |
| Insulation, timber products, finish coatings, electrical/data and equipment interiors | Full constituent/product audit not yet performed | MAT-AUDIT. No generic 'mineral', 'wood' or 'metal enclosure' approval |

These holds concern the new owner requirement, not an assertion that the old calculations were wrong. Preserve old source identities and technical learning. Existing completed research packets remain complete at their original scope; successors and the final material gate prevent old evidence being silently promoted to new policy compliance.

## Primary-source reconnaissance, accessed 30 October 2026

The following observations bound the initial design work. They are not procurement recommendations or a complete lifecycle assessment.

- **Schlüter:** [KERDI-200](https://eu.schluter.com/en-GB/waterproofing-224/e/22011/kerdi-200?search=kerdi) identifies a polyethylene membrane; [KERDI-BOARD](https://eu.schluter.com/en-GB/substrates-building-317/e/22635/kerdi-board) identifies an XPS rigid-foam core. The existing IAS wet-room comparison is therefore materially affected even though the plastics are behind tile. Board reinforcement, adhesives and joint accessories must also be audited.
- **Gutex:** [Thermosafe-homogen](https://www.gutex.co.uk/products-systems/insulation-materials/gutex-thermosafe-homogenous~p1081) declares 4% PUR resin and 0.5% paraffin. This is a counterexample to treating 'wood fibre' as automatically plastic-free, not a finding that this product is installed in the house or that all wood-fibre products share its recipe.
- **FOAMGLAS:** its [cellular-glass technical explanation](https://www.foamglas.com/en-gb/advice-center/general-advice/chemical-durability) reports no organic binder in the insulation. The separate [PC 56 adhesive](https://www.foamglas.com/en/products/adhevises/pc-56) contains a bitumen-based emulsion and cementitious component. A suitable inorganic core is a promising alternative, not approval of its complete adhered/faced assembly; investigate jointing, additional constituents and exposure separately. Bitumen is not silently classified as plastic or approved because it is not called plastic.
- **Chemelex Pyrotenax:** [mineral-insulated wiring](https://www.chemelex.com/en-us/pyrotenax/solutions/fire-rated-wiring/mineral-insulated-wiring-vs-polymeric-alternatives) provides a real alternative family; its [UK standard termination kits](https://www.chemelex.com/en-gb/pyrotenax/products/standard-termination-kit) show that the cable is not the entire circuit. Termination seal, tails, sleeves, accessories and UK suitability require exact evidence. No US fire-system example is a UK whole-house electrical design.
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
