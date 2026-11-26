# Perimeter upstand and L300 cage comparison

The monolithic 300 × 350 mm perimeter band with inward L300 corners is the preferred next whole-house mechanical comparison. The separated-floor clevis family remains rejected in [its owning report](three-clevis-comparison.md). This result establishes a bounded local bar-profile route under explicit placing assumptions; it does not select reinforcement strength, establish a complete frame resistance, or accept construction.

The source-owned inputs are [perimeter-upstand-cage-inputs.json](studies/perimeter-upstand-cage-inputs.json). The [consumer](studies/perimeter_upstand_cage.py), [controls](studies/perimeter_upstand_cage_test.py), exact [result](studies/perimeter-upstand-cage-checkpoint.json), [drawing](drawings/perimeter-upstand-cage.svg), and [observed receipt](studies/perimeter-upstand-cage-observed.json) form one comparison. Native methods, source accounts and historical receipts are unchanged.

## Physical proposal

| Item | Prospective arrangement |
| --- | --- |
| Concrete | Four inward L300 corners, each two 1000 mm arms; outer perimeter band 300 × 350 mm |
| Levels | Slab 3170–3370; band 3170–3520; FIRST 3450 |
| Column main bars | 12H16; local face rows 85/215; along stations 85/215/590/930, with exact rounded-link corner adjustments in the result |
| Continuous band bars | Four H16; inward normals 120/183; Z 3260/3449; corner centreline radii 179/190, actual minimum mandrels 340/362 |
| Corner floor returns | Prospective H14; normal 152; minimum mandrel 280; bottom tails DOWN and top tails UP, each 1000 mm straight |
| Corner rows | 340/405/465/535/630/690/765/840/899 mm; full local coordinates govern rather than an assumed uniform field |
| Column links | H10, mandrel 40, two 135° returns with 100 mm straight tails; 14 mm plane transitions on clear long legs, away from the hooks; each scheduled family pitch ≤180 |
| Ordinary band links | H8, mandrel 32, 80 mm tails and 12 mm clear-leg plane transitions; contour widened 5 mm on each normal side to avoid its own tail; maximum scheduled pitch 75 |
| Floor mats | Nominal H14/75, outside envelope 16; X/Y bottom 3230/3246 and top 3310/3294 |
| Ordinary floor returns | Bottom and top rows phased separately, 140 mm mandrel, vertical end 3460; one straight top transition row at 955 mm has only 240 mm basic bond length |

All local plan coordinates are measured inward from the real outside corner face. Mirror origins are SW (262.5,262.5), SE (11737.5,262.5), NW (262.5,11737.5), NE (11737.5,11737.5), with the corresponding inward signs. Mirroring four placing profiles does not prove four finite joints.

The ordinary band centroid is inward normal 150, Z3345. The L300 union area is 510000 mm² and centroid is (355.882352941,355.882352941) from the outside corner face. Actual new six-component cut wrenches must be shifted from their recorded origins to these section centroids before resistance evaluation.

The band adds a visible 70 mm plinth above FIRST and projects 160 mm farther inward than the 140 mm wall. Each L300 adds 0.15 m² of concrete plan footprint relative to L200, 0.60 m² across four corners. No floor raise or ground-soffit reduction is credited. Furniture, finishes, openings, foundations and service consequences require the actual staged house join. The old separate inner masonry seats are unused.

## Observed local proof

At exact source `9f52b14a16370f628fa59a696a8db5184d6e4339`, [run45878156786](https://github.com/adamnoden/architecture/actions/runs/45878156786), job140110803345, all **30 controls passed** (2.591 s test runtime). Chromium rendered the exact SVG at1500×1240 and the output was visually inspected. The raw result is398851 bytes; producer SHA256 `bfe31da08da4be5e4bac085ea01a374fbfe0d9e32f6ab721bec30d34cd53a92e`. The 90-day archive is artifact15146756154 with GitHub-reported SHA256 `8e3f8b6f6f79372211c86c6acaa106cf4d08ec89a29fb673c643e60b73e96231`. Exact raw JSON and SVG have been retained in Git, not reconstructed from this summary.

The audit uses exact line and circular-arc coordinate bounds, with actual adverse witnesses and fail-closed unresolved intervals. Distinct independent bars retain the full relative ±10 mm box, representing ±5 mm each; external cover deducts both the common cage 5 mm and independent bar 5 mm. Forming deviation must fit inside that total independent allowance. Same-bar nonadjacent portions separately retain ±1 mm forming error each.

Wire-tied orthogonal mat crossings and registered link/main contacts use explicit nonpenetrating surface-contact constraints. They cannot move through each other in the contact-normal direction. A common jig and actual rib envelopes remain fabrication conditions. All other pairs retain their full adverse box; these contact classes do not waive cylinder overlap. An audit's zero B&B-pair count means all its candidate pairs were certified clear by exact coordinate boxes; it does not mean untested geometry passed. Minimum aggregate clearance applies to parallel bars/layers, not every orthogonal tied crossing. The declared maximum aggregate is 16 mm. Actual minimum adverse parallel floor clearance is 30 mm and intermat clearance 22 mm; required minimum is 21 mm. Minimum checked adverse concrete cover is 40 mm.

The tests retain real rejected alternatives: the old column S closure crosses its own135° return; same-row ordinary bottom upturns intersect the top mat; the narrow H8 contour intersects its own return; insufficient cover rejects; shortening an authored ordinary end recomputes and invalidates its standard tail; reducing bend mandrels reduces concrete-bearing bounds. The earlier passes before the self-intersection control are incomplete predecessors, not complete placing evidence.

Only the local corner and adjacent ordinary band window are profiled. Horizontal floor stubs continue into the field, and ring bars continue around the house. Full-span laps, field recomposition, the court/garden deep-band transitions and an assembly sequence are not qualified by these checks. Practical shop scheduling, clear installation paths and placing trials remain unearned; whole-cage placing acceptance stays false.

## Finite anchorage and bearing bounds

The transparent comparison uses steel stress 400 MPa, concrete compression 17 MPa and bond 2.1/3.0 MPa. These are comparison assumptions, not a new accepted material grade. No shape/cover/confinement reduction or crossbar exemption is credited. Mandrels are required actual minima; forming tolerances cannot reduce them below the input.

The 1000 mm corner tail exceeds the 666.667 mm basic straight tension requirement at poor bond. The 280 mm floor bend exceeds the conservative required 277.199 mm by only 2.801 mm. Continuous ring bend-bearing stress bounds are 416.714/443.678 MPa for outer/inner bars. These scalar bounds do not close splitting, confinement, compression anchorage or a combined N/V/M/T node resistance.

Ordinary short returns cannot be credited at 400 MPa. Actual authored neighbour spacings 65/58.5 mm drive their bearing bounds:

| Layer | Poor-bond stress bound | Good-bond stress bound | Bend-bearing bound | Governing good-bond bound |
| --- | ---: | ---: | ---: | ---: |
| X bottom | 153.815 MPa | 219.736 MPa | 214.501 MPa | 214.501 MPa |
| Y bottom | 144.215 MPa | 206.021 MPa | 214.501 MPa | 206.021 MPa |
| X top | 159.913 MPa | 228.448 MPa | 200.916 MPa | 200.916 MPa |
| Y top | 169.513 MPa | 242.162 MPa | 200.916 MPa | 200.916 MPa |

The straight transition row is bounded at 144/205.714 MPa for poor/good bond. Compression anchorage is unqualified. Good bond is conditional on the stated monolithic slab/band pour and actual bar placement; poor bounds remain visible. The ordinary 140 mm mandrel leaves at least 72 mm straight after the bend against the selected 5φ=70 mm structural comparison. The old 160 mm bend leaves 62 mm and fails that comparison.

Nominal H14/75 area is 2052.507 mm²/m, versus legacy H16/80 at 2513.274 mm²/m. Local pitches are deliberately nonuniform and include 90 mm gaps. Neither this nominal field area nor the bar reduction is strength-selected from actual new plate/cut demands.

The primary detailing reference is [JRC's 2011 EC2 workshop, Arrieta](https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/05_EC2WS_Arrieta_Detailing.pdf), used as a declared analytical comparison, not a current UK compliance certificate. The 100 mm column hook tail is a conservative 10φ fabrication comparison rather than relying on the shorter structural hook minimum. [Hy-Ten](https://hy-ten.co.uk/concrete/bar-reinforcement/) lists 14 mm bar and describes cut/bent supply and dimensioned shape-99 schedules. This is evidence of a plausible supply route, not a project quotation, verified outside rib diameter, approved bend schedule or product acceptance.

## Next executable whole-system comparison

Keep the floor at 200 mm and test this conventional concrete geometry before funding a thicker whole floor or another clevis family. The owning producer must replace actual L/band footprints and masses, retain the source roof, openings, full G/Q/E, and preserve the zero additional axial-chord boundary. It must material-union the actual retained north750/court650 members, retaining their true centroids and avoiding duplicate stiffness/mass; the ordinary ring drawing does not certify their reinforcement.

First earn a fresh coupled gravity case and an adverse simultaneous lateral case, recording all52 heads, all physical contacts and all four actual corner cuts with their origins. A 300 mm core must receive a genuinely derived/controlled operator rather than being fed through the old200 finite guard. Old96/clevis pressure-only demands are not transferred. Increased section stiffness can increase actions, so no reduction is assumed.

Then evaluate actual simultaneous six-wrenches against the real sections, ordinary edge force versus the finite bond/bearing limits above, plate strip/convergence demands versus the proposed mats, and column/foundation development. Complete the span lap layout and deep-band transitions using those actual demands. Other three finite joints remain open; one local profile or one SW proof cannot close the house.

All native-response, complete resistance, whole-cage placing, product, physical, owner and house acceptances remain false. The paused [rear arch slab-tie API checkpoint](rear-arch-slab-tie-api-checkpoint.md) is preserved; no ideal base keys or separate arch mechanics were introduced here.
