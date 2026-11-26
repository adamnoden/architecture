# L200 section works; the first complete node cage is rejected

This bounded comparison keeps the actual SW concrete and all solved house actions unchanged. Sixteen H12 longitudinal bars fit the L section and admit simultaneous axial/biaxial strain-compatible equilibrium for every one of the 192 physical wall cuts in the complete 96-case source programme. That result does not make the monolithic slab/wall node buildable. The tested two-arm hoop / four-layer slab arrangement and its first conventional vertical-tail alternative both fail specific placement or anchorage checks.

**Reference design — not released for construction. Assumptions and outstanding verification accompany the proposal; internal checks do not constitute external assurance or certification.**

## Actual authority and scope

The controlling geometry remains the saved uniform200 house. The accepted mechanical evidence for this comparison is the actual hosted source proof at commit `867e8042`, workflow run `45814303861`: 96 full native houses, each with one finite SW joint, three rigid corner controls, 52 heads, 153 finite ports and 32 normal contacts. The exact summary's SHA256 is `bfeae934f0e3c16a522250dc7e835a7374a6627673ffbe25d1311358981ee7bf`. The owning durable summary is `studies/current-finite-signed-proof.json`; its source/method identities and controlling-choice digest must match before this consumer admits it.

The exact hosted W0 raw capture supplies the independently replayed geometry/material context. The calculation uses all simultaneous lower/upper cut vectors from the signed summary. It never assembles an invented vector from individual component extrema. The raw W0 capture and complete proof have the same 58 source hashes, six finite-method hashes and numerical runtime. Earlier restored W0 evidence had a different Python patch release and is not substituted for the retained hosted capture.

The L is the disjoint union of X262.5..462.5/Y262.5..1262.5 and X462.5..1262.5/Y262.5..462.5 mm: area360000 mm² and global centroid584.722222/584.722222 mm. The finite slab occupies Z3170..3370; the upper L stub ends at4370. Both retained wall-cut wrenches already act at this section centroid. Upper and lower cut normals are handled explicitly; no fictional one-metre rigid transfer arm is added.

## Explicit section proposal

The new source-only consumer is `studies/current_l200_node.py`; it imports the existing general L-section geometry and shared cage/material allowances, not a portal-specific cage function. It changes no native input, stiffness, mass, physical solver or head reaction.

Sixteen unique H12 bars lie on two orthogonal two-face rows. Relative to the outer concrete corner, the face rows are69 and131 mm; along each leaf the stations are69,131,397.666667,664.333333 and931 mm. The four shared corner-intersection bars are counted once. Total steel is1809.557 mm², or0.502655% of gross L area. The adverse independent main-bar clear is40 mm; adverse main-bar cover is53 mm. H8 links retain45 mm nominal surface cover,40 mm after the shared5 mm cage-setting allowance, and32 mm inside mandrels.

The straight longitudinal continuity zone is Z2170..5370, with no proposed lap inside the slab or upper stub. At full source yield, H12 straight good-bond development is434.783 mm;995 mm remains on each side of the relevant cut after end setting. This necessary local continuation check does not qualify foundation or roof termination, bond splitting or a whole-wall splice schedule.

Two nominal rounded rectangular arm hoops are shown at physically different Z planes, with75 mm pitch near the joint and100 mm ordinary pitch. The SVG distinguishes this proposed geometry from an adopted fabrication schedule. Intermediate longitudinal-bar restraints and complete hook closures remain unqualified.

## Biaxial and six-component comparison

Every case uses one compatible plane strain field in the actual L union, with no concrete tension. Concrete follows a deliberately conservative bilinear compression comparison:17 MPa at strain0.00175, with a strict0.00175 maximum in every case. Steel uses200 GPa, clipped at the shared400 MPa comparison limit. The full source design yield remains500/1.15 MPa for development. Concrete displaced by each discrete bar is subtracted. These are explicit comparison laws, not material selection or a calibrated cracked-RC law.

The concrete is integrated over disjoint physical rectangles with25 mm cells and2×2 Gaussian integration. Axial force and both moments are solved simultaneously; a governing12.5 mm refinement is checked. No uniaxial interaction shortcut supplies the biaxial result.

All192 cut witnesses converge, with maximum equilibrium residual below1.3e−10 kN/kNm. The governing section is W58 upper: largest absolute bar stress128.527 MPa and maximum concrete compression strain0.000162275. Thus ordinary section steel is not the present obstacle.

The consumer also reports simultaneous shear/torsion reservations: both shear components are summed conservatively into one link-leg flow; full torsion is assigned to the smaller disjoint200×800 mm arm cell, without shared-corner area or two-leg enhancement. The largest H8/75 link-flow ratio is0.523. Adding an openly conservative longitudinal shear/torsion stress reservation to the compatible sectional stress gives193.111 MPa at W58 upper. These are necessary section reservations, not a qualified L-node strut field, compatible shear/torsion resistance, buckling or second-order proof.

Fewer-bar and smaller-diameter alternatives are calculated separately. A smaller diameter cannot silently inherit column detailing; fewer longitudinal bars cannot silently exceed the350 mm torsion spacing comparator merely because their sectional steel is sufficient. The reference16H12 retains a maximum along-face spacing266.667 mm.

## Actual slab-node transfer and rejected straight ends

Both wall-cut wrenches are transferred once to the real slab midplane3270 mm using their actual Z coordinates. Their sum reaches a79.547200 kNm component at W72. That is a boundary action for the node, not a recovered finite-solid slab moment per metre.

For one explicit trial, a one-metre horizontal chord is assigned to the actual one-metre wall leaf. This is a declared necessary trial bound; it is not a proof that the actual effective strip must be exactly one metre. No broader effective width is invented to reduce the force.

| Four-layer floor trial | Necessary zero-N strip capacity, kNm/m | Straight development at the declared chord stress, mm | Actual straight wall run, mm |
| --- | ---: | ---: | ---: |
| H12/100 |49.172 |915.108 |134 |
| H12/55 |80.450 |503.309 |134 |
| H14/75 |77.874 |603.114 |133 |
| H16/80 |86.833 |577.464 |132 |

The strip calculation reuses the existing strain-compatible zero-axial section primitive. It is a necessary comparison with no compression-mat benefit, not a converged slab or node resistance. H12/100 is insufficient for this particular one-metre chord; merely preserving the inherited H16/80 area is not an owner requirement.

Every plain straight-ended trial fails its actual short wall-width development run. The source H16/80 four-layer field is also congested: its gross steel quantity is about5.03% of the200 mm slab when both directions/faces are counted. That percentage is an inventory comparison, not an automatic code-area violation.

The link/mat test retains independent floor and column cage setting. Relative mat-to-link setting is15 mm: two5 mm cage settings plus5 mm bar setting. The H16 inter-mat centre window is−2 mm; the H12 window is14 mm, while two independent H8 hoop planes require18 mm. If one demonstrably common coordinated cage removes relative whole-cage motion, those windows become18 and34 mm respectively; that coordinated assembly has not been established. This rejects the tested ordinary independent-cage arrangement, not every possible monolithic node.

## A real conventional alternative was drawn and rejected

The consumer draws an H12/55 alternative with200 mm inside90-degree mandrels and600 mm straight vertical tails in the actual continuous RC wall. It does not try to contain a deep U-return inside the200 mm slab. The vertical tails continue into the real lower or upper L, depending on the slab face.

Bend plus tail length is766.504 mm, exceeding full-yield poor-bond development621.118 mm. The retained full-force concrete bend screen needs about183.4 mm, below the proposed200 mm mandrel. Those favourable bond/bend comparisons do not establish fit.

Literal unshifted tail stations were then tested against every actual proposed longitudinal bar and the actual end of the one-metre wall. The trial retains explicit adverse bar collisions and a4 mm minimum wall-end cover. It is rejected. The JSON retains the individual3D bend/tail paths and governing parallel pair so the failed layout can be inspected and changed instead of replaced by a generic assurance sentence.

## Decision and remaining constructive work

Retain the200 mm concrete and16H12 as an ordinary sectional development candidate. Reject adoption of the tested complete monolithic node. Do not thicken the slab or freeze a dense floor mat solely to rescue this first arrangement.

A revised monolithic detail must physically recompose floor bar stations, vertical-bar positions, anchored cross-ties and vertical-tail routes together, then close the actual node's three-dimensional force path. The other conventional comparison is direct floor bearing while the RC corners preserve their lateral/roof continuity; that is a different physical load path and requires its actual geometry, mass, stiffness and fresh house comparison before receiving any mechanical credit. Neither alternative is adopted here.

The finite slab's internal stress field, numerical adequacy, complete shear/torsion D-region, punching/bearing, thermal/shrinkage actions, cracking, durability, material specification and foundation/roof anchorage remain separate. No resistance, reinforcement, anchorage, complete-house or owner acceptance flag is raised.

## Recovery and validation

Run the new consumer with the exact signed summary and hosted W0 `case-00.json.gz`. It admits the full source programme, checks controlling saved choices and source/method identity, independently replays the raw capture, and emits JSON/SVG without solving the house again. Test inputs are supplied through `STR_L200_SUMMARY` and `STR_L200_CAPTURE`.

Twelve tests passed against the exact hosted W0 capture: all192 actual biaxial cuts; an analytic axial rectangle; translation and90-degree rotation invariance; bar-size perturbation with unchanged house inputs; extreme biaxial overload; changed geometry/source/missing programme rejection; blocked strength injection; actual Z-arm transfer; failed plain-edge anchorage; literal vertical-tail failures; and governing fibre refinement. Subsequent source changes require appropriate rerun; the receipt carries method hashes.

Technical basis: the shared project cage owns the numerical material/cover/bond assumptions. The Concrete Centre's first-generation *Concise Eurocode2* (2006), sections6,9,11 and12, supplies the compatible-section, anchorage and detailing method correspondence: https://www.concretecentre.com/TCC/media/TCCMediaLibrary/Events/Online%20course/CCIP_Concise_EC2.pdf . It is not an assertion that this legacy edition/National Annex or the assumed materials are selected for the eventual house. Accessed26November2026.
