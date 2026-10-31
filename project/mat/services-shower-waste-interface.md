# MAT-SERVICES — shower-waste connection and first release

**31 October 2026. Bounded S02 service-interface study from main `8feba35f3673062555093bed9ac2e80b17b503b7`; MAT-SERVICES remains planned.** This develops the connected drainage side of the [enamelled-tray comparison](interior-shower-tray-alternatives.md), under the [material policy](../../docs/reference-house/material-policy.md). IAS/HAD and MAT-INTERIORS retain the room, tray, support and lining decisions. This study changes none of their geometry and selects no complete waste installation.

## Result

**Separate the space occupied with the service face closed from the space used after it is removed.** The conditional west-facing Tecom brass outlet ends only **43 mm behind the existing tray-edge station**. A connection concealed wholly behind an unpenetrated face must fit that installed budget. Its first release may use the space outside the removed face: requiring the whole repair movement to remain inside 43 mm would unnecessarily constrain the design.

The resulting connection, crossing and parking conditions are now explicit. They are necessary geometric conditions, not a complete fit or release result. The exact mating joint, complete waste envelope, retained supports and clear opening are still missing. In particular, Tecom's **43 mm vertical body dimension is not the complete metal depth**: the enlarged outlet is drawn below that body-bottom line. It must not be used to size the support bay.

[Inspection drawing](studies/shower-waste-interface.svg) · [derived data and source fingerprints](studies/shower-waste-interface.json) · [reproducer](studies/shower-waste-interface.py). Run `python project/mat/studies/shower-waste-interface.py --check` from the repository root to verify the stored comparison. The drawing represents the retained, **unadopted** IAS/HAD occurrence, not the later STR room arrangement or an accepted house change.

## Source-bound interface

The [existing tray study](interior-shower-tray-alternatives.md#located-drain-comparison) owns the nominal west-drain orientation. Its [derived data](studies/enamelled-tray-access.json), the [IAS connected-assembly data](../ias/studies/bedroom4-connected-assembly.json) and [HAD maintenance data](../had/studies/bedroom4-maintenance-study.json) provide these retained coordinates. All dimensions are millimetres; x runs east, y north and z upward.

| Datum | Coordinate | Meaning |
|---|---:|---|
| West boxing's room-side plane | x577.5 | Conservative forbidden plan boundary during the assessed westward movement |
| West tray edge / service-face station | x1335 | A retained station; no fascia thickness, fixing or clear aperture is selected |
| Conditional brass outlet end | x1378 | 1545 − 167, only if the PDOTT90 is matched to the tray and oriented west |
| Nominal drain centre | x1545 / y10322.5 | Existing west-drain comparison |
| North boxing's southern edge | y10572.5 | 250 north of the centred withdrawal axis |
| Wet finished floor / structural deck top | z3455 / z3430 | Existing comparison levels; neither is automatically the support-bearing plane |

The [Tecom PDOTT90 manufacturer-branded sheet](https://www.tecnomat.it/pub/media/catalog/product/7/c/4/4/piletta_doccia_tecom_low_round_o_mm_h_mm_scarico_o_mm_portata_l_min_in_ottone_25060591_techsheetsup.pdf) is a component source, not a matched-system drawing. Its 167 mm dimension binds centreline to brass terminal end. The Ø32 and Ø40 arrows describe the external neck and enlarged terminal, respectively; they provide no bore, tolerances, mating standard or axial grip-land length. A nominally 40 mm fitting cannot be presumed compatible.

The separate **106 mm adapter** is shown unassembled and dimensioned overall. Its seated projection, permissible overlap and release stroke are not specified. Do not subtract a guessed engagement length or assume that the entire 106 mm projects beyond the brass end. The supplied adapter is polypropylene; replacing or omitting it requires a demonstrated alternative joint. The existing brass-body finding and unresolved gasket formulations remain as recorded in the tray study.

## Four distinct movement conditions

### 1. Face closed: installed connection

Let `p` be the actual installed westward projection of the modelled connected part from x1378, and `cF` its required clearance to the closed face. If that part must remain wholly behind an unpenetrated face at x1335:

`p + cF ≤ 43`.

This is a conditional packaging requirement, not a selected fitting size. A thicker face extending east, an intentional penetration or an altered station changes the budget and needs an owning assembly decision. None is assumed here.

### 2. Face removed: first joint release

For a part that actually translates west by `r`, its westernmost point becomes `1378 − p − r`. With west-obstacle clearance `cW`, the conservative plan condition is:

`p + r + cW ≤ 800.5`, where `800.5 = 1378 − 577.5`.

The joint's **required** release stroke is a separate input. This inequality gives only the available west-obstacle budget for the stated motion. It does not mean that a connection releases, remains supported or can pass the opening. A nut sliding on a fixed pipe, rotating union, telescoping joint, downward separation or tool movement needs its own envelope. The downstream branch cannot silently move with the fitting.

Remove the independent service face before assessing this movement. The tray, frame, feet and necessary additional supports remain fixed. Removing a loaded support is not an available first step.

### 3. Crossing the face and passing the north boxing

While a straight-west sweep overlaps the north boxing in x, its northern extent `bN` from y10322.5 must satisfy:

`bN + cN ≤ 250`.

For a symmetric swept envelope of width `W`, this becomes `W + 2cN ≤ 500`. **This limits that centred straight-west sweep, not the possible fascia-opening width.** A larger face opening may exist without its full width providing a clear route. An offset, asymmetric, rotating or vertically changing path must be examined separately.

The actual clear face opening must contain every crossing portion of the body, retained projections and any tools that cross with it. Its width must exceed the crossing swept width plus side margins; its height must exceed the crossing swept height plus top/bottom margins. Neither opening dimension is presently bound. The 610 mm frame rail is not an aperture, and the Ø118 waste cover is not the whole body.

The boxing footprints are conservatively treated as forbidden throughout the assessed height range. Passing above or below them requires an explicit section; this plan cannot grant that passage.

### 4. Released body: parking outside the tray

The exterior pocket between x577.5 and x1335 is **757.5 mm wide**. Let the released body, with every retained projection, initially span `[L0, R0]` in x. After a westward translation `t`, complete parking requires:

`max(0, R0 − 1335 + cE) ≤ t ≤ L0 − 577.5 − cW`.

For a body initially beneath the tray, the associated longitudinal-capacity condition is `Lx + cW + cE ≤ 757.5`, where `Lx = R0 − L0`. This is separate from joint release. A connector can release while the body remains trapped, or a body can fit the exterior pocket while its joint cannot release. Tecom's 167 mm centre-to-end and Ø118 cover do not establish `Lx`.

## Vertical datum: what the source now establishes

The manufacturer-hosted [Bette Foot-System Z0009038 Rev.15 /12.2025](https://content.my-bette.com/produkt_downloads/Fuss-System-fur-Duschwannen-133586/Fuss-System-fur-Duschwanne-700-700-mm-133607/Z0009038_REV15.pdf), p9 right-hand configuration column, dimensions **H from the foot-bearing plane to the horizontal tray-rim top**. The base configurations shown span 80–200 mm. This establishes the dimension's endpoints; it does not select the configured 5940/frame package, a bearing plane or an installed H. The horizontal rim datum is not the top of a configured upstand or the waste cover.

For an applicable configuration, the necessary relationship is `zRim = zBearing + H`. Relative to the retained wet floor, `rimRise = zBearing + H − 3455`. Thus bearing on the wet-floor datum would give an 80–200 mm family comparison, whereas bearing at the deck datum would give 55–175 mm. These are **conditional datum calculations, not two accepted support details**. Bearing, protection of the water boundary and the actual selected configuration remain to be designed.

The same configuration column illustrates a foot axis 78 mm inboard of the outer tray edge. This is not a pad diameter or a fixed location for every foot: p10 shows alternative corner holes. Neither the axis offset nor H establishes the rail underside, pad footprint, additional support or free opening. Do not place those parts from a scaled illustration.

Tecom's 43 mm vertical dimension runs from the drawn upper body/flange line to the body-bottom line, below the cover and gasket stack. The enlarged Ø40 terminal extends below that line. No overall metal depth, installed waste-seat level, complete outlet envelope or connected adapter level is declared. Do not create a 47 mm overall depth by assuming concentricity from the picture. The actual seat, lowest outlet, rail and bearing planes must be supplied before the vertical fit can be assessed. No missing depth is borrowed from the allocated BCR floor package.

## Next design decision and limits

Keep the west service interface as the comparison, with the required supports retained. The next useful input is an **exact compatible outlet-to-branch connection**: mating geometry and tolerances, all seal/washer/compound constituents, seated extent, fixed and moving parts, release stroke and tool envelope. Combine it with the complete waste envelope and actual support section, then check the four conditions above and the path between them. If the connection needs to project beyond the present face, return that measured consequence to IAS/MAT-INTERIORS for a deliberate interface change.

No polymer-free package, clear aperture, pipe fall, discharge capacity, trap-seal performance, physical renewal result or service life is established. The [soil-joint study](services-waste-joints.md) separately carries the stack/joint comparison; these dimensions do not transfer to it. The [single constituent register](constituent-audit.md) records the connected S02 uncertainty. No exception or lifecycle completion is earned.

## Verification and provenance

The Tecom sheet and Bette p9 were visually inspected, and the geometry/movement conditions independently reviewed. The generated comparison binds the existing IAS/HAD/located-tray source bytes and preserves unknown component dimensions. It is a deterministic inspection aid, not a physical test or an adopted room model.

| Retrieved primary document, 31 October 2026 | SHA-256 |
|---|---|
| [Tecom PDOTT90, p1](https://www.tecnomat.it/pub/media/catalog/product/7/c/4/4/piletta_doccia_tecom_low_round_o_mm_h_mm_scarico_o_mm_portata_l_min_in_ottone_25060591_techsheetsup.pdf); no printed revision | `aa8a4f421168e6fd558948c7e106f2bee2214351c1d9f24d66abe8f60a1b1fb3` |
| Bette content-host Z0009038 Rev.15 /12.2025, pp9–10 | `4a2ec361f14c01c510d270e7a240161e24f7aba1ac9fbcee325e04f5ccbc4b59` |

The content-host Bette PDF differs in bytes from the shop-hosted copy recorded in the tray study. The revision and retrieved file are identified separately; a fingerprint is a change detector, not product approval. No supplier was contacted and no hardware was altered or tested.
