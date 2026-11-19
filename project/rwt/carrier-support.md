# North court carrier — product-bound support and renewal subassembly

**30 October 2026 · RWT-06 bounded development · not for construction.** Starting main: `f3e72f6732dcb56ca45ebfa954cdd408e602dfe5`. This develops the [north-axis comparison](north-court-carrier.md), without adopting it or altering the house. The output is a located support schedule, a clearance calculation and explicit end-release conditions, not another assumed pipe line.

[Dimensioned station sheet](studies/carrier-support.svg) · [calculated cases](studies/carrier-support.json) · [executable source](studies/carrier-support.mjs) · [regression tests](studies/carrier-support.test.mjs).

## Development decision

Investigate an uninterrupted **Radius VS2751, 110 SDR17 black PE100 straight carrier**, cut from a 6 m stock length, through the existing 4250 mm north crossing. Compare **Radius VS3050, 180 SDR17** as the sleeve's actual dimensional family, not an approved buried sleeve or structural opening. Preserve the 4450 body and 5250 × 1600 external straight-renewal territory. The existing PVC-U comparator remains separate evidence; none of its sockets, bore or stiffness transfers to PE.

The finite support screen proposes **11 stations per carrier at 390 mm centres**, from 175 to 4075 mm along the crossing, with independently supported accessible terminals. This is the least count in the tested equal-pitch family that retains downhill slope for the declared intact and one-inactive-interior-support sensitivity cases. It is **not** a manufacturer's spacing prescription or a selected complete assembly. Two adjacent inactive supports fail this screen.

Use the real **PSI CaseX DSI PA/PE 4, 16 mm skid, article 3-001-01028** as the next fit candidate. The corresponding **25 mm skid, 3-001-01029**, cannot be credited in the nominal 180 SDR17 sleeve. Neither is a matched Radius/PSI installation merely because both components exist.

## Product evidence and limits

Primary sources below were read on 30 October 2026; the relevant PDF tables were visually inspected, not inferred from search snippets.

| Source | Evidence used | Limit |
|---|---|---|
| [Radius black-pipe brochure, May 2025, printed p.3](https://www.radius-systems.com/uploads/documents/downloads/Pipe-Brochure-Black-Pipe-Only-20-May-2025.pdf) | VS2751: 110 SDR17, 6 m straight, listed handling mass 2.3 kg/m. VS3050: 180 SDR17, 6 m straight | The listed mass uses maximum dimensions for handling. Pressure-drain product scope is not a complete gravity-drain, sleeve or joint-system approval |
| [Radius pipe brochure, April 2025, printed pp.20–21](https://www.radius-systems.com/uploads/documents/downloads/Pipe-Brochure-April-2025-Interactive.pdf) | Universal black PE100 dimensional ranges: 110 SDR17 OD110–110.7, wall6.6–7.4, bore95.2–97.5; 180 SDR17 OD180–181.1, bore156.2–159.7 | The table is guidance. Delivered diameter, wall, ovality and straightness still control; these are not an inspection certificate |
| [PSI selection tables 2023.1, printed p.8](https://psi-products.de/fileadmin/user_upload/02_Produkte/01_Dichtungstechnik/01_Link-Seal/Download/Selection_Tables.pdf) | PA/PE 4 covers carrier OD106.6–120; 16/25 mm skid article numbers above | Actual collar width, bolt projection, loaded contact shape and angular orientation are not established by this selection table |
| [Radius above-ground support guidance, March 2021, pp.1–2](https://www.radius-systems.com/uploads/documents/RS-Above-ground-PE-pipe-support.pdf) | E160 MPa at23°C; 110 SDR17 table spacing1250; bracket contact width half pipe OD, rounded edges, low-friction lining and thermal movement | Above-ground water-filled bracket guidance, not approval of casing rings; its stated fixed-end calculation basis differs from the simply supported comparison here |
| [PSI casing-spacer data, 2023, printed p.8](https://psi-products.de/fileadmin/user_upload/02_Produkte/02_Rohreinzug/01_CaseX_DSI/Download/Product-Data-Sheet_PSI_2023_Pipe-Insertion_CaseX_DSI-Casing-Spacer_EN.pdf) | Generic spacing is subordinate to carrier stiffness and pipe-maker requirements | The generic 2.5 m example is not applicable without a pipe-specific check; a PP-on-steel friction figure cannot describe PP sliding in a PE sleeve |

## Clearance: real bore, not nominal bore

The previous 180-outside/160-inside sleeve was an authored envelope. The product-family bore is **156.2–159.7**, so even a bare 110.7 carrier has only **22.75 mm** concentric radial space at the tightest listed combination. Retaining the earlier 5 mm downward eccentricity leaves **17.75 mm** below the pipe, not the old20.

For a deliberately ideal radial projection, `carrier OD + 2 × skid height` gives **142.7 mm** at110.7/16: **6.75 mm** concentric radial remainder in the minimum bore, or **1.75 mm** if the earlier5 offset is imposed. These are not guaranteed insertion clearances: actual bolts, collar, skid orientation, deformation and sleeve ovality still matter. A25 skid gives at least160 even on the smallest110 carrier, exceeding the largest listed159.7 sleeve bore by0.3 before any additional projection. Do not force that nominal combination through.

A free bearing ring also does not hold the pipe at the old authored centre. In an idealised downward-radial-skid contact model the 16 mm ring settles the carrier **6.75–8.85 mm below the sleeve centre**, rather than5. Actual contact orientation may change this. The installed ring geometry must therefore re-establish pipe inverts, end connection positions and the annular drain. This study does **not** silently move the old drawing's carrier levels or credit its50/30 receiving margins to a new installation. Sleeve OD tolerance likewise requires the support/opening envelope to be rechecked.

## The fall screen

The input crossing has60 fall over4250, a chord gradient of **14.118 mm/m**. Uniform pipe-plus-full-water load is a conservative screen against a blocked carrier; pressure thrust, sediment, fittings and local concentrated loads are excluded. It combines the published2.3 kg/m handling mass and maximum97.5 bore water mass, deliberately independent upper bounds rather than one claimed manufactured cross-section. Minimum OD110 and minimum wall6.6 give `I = 2,876,943 mm⁴`; load is `q = 0.095774 N/mm`. Water density1000 kg/m³ and gravity9.80665 m/s² are calculation assumptions.

For a simply supported, constant-section, small-deflection beam of span L:

```text
I = pi/64 × (Do^4 − Di^4)
mid-span sag = 5 q L^4 / (384 E I)
maximum chord-relative slope = q L^3 / (24 E I)
worst remaining downhill slope = 60/4250 − adverse differential/L − q L^3/(24 E I)
```

The last expression tests whether the rising half of the sagging span locally reverses the drain's intended fall. A mid-span deflection limit alone cannot answer that. This model does not reproduce Radius's fixed-end table, bound arbitrary support moments, or certify a continuous multi-span PE installation. It is a declared comparison; actual continuity, temperature/time-dependent modulus, ovality and contact need resolution.

| Comparison | E MPa | Sag mm | Worst downhill mm/m | Result in this model |
|---|---:|---:|---:|---|
| Generic2500 spacing, no endpoint error |160|105.826|−121.340|Reject as a gravity support argument; actual sleeve contact invalidates the large free-sag prediction |
|1250 reference spacing, no endpoint error|160|6.614|−2.815|No downhill-profile pass in this different model |
|487.5 spacing, no endpoint error|160|0.153|13.113|Positive, but not yet the adverse case |
|Proposed390 intact;3 mm adverse endpoint difference|80|0.125|5.397|Positive |
|One interior station ineffective:780 span; same3 mm difference|80|2.006|2.043|Positive |
|Two adjacent interior stations ineffective:1170 span; same3 mm difference|80|10.153|−16.216|Fails |

**80 MPa** is an authored half-modulus sensitivity, **not** an established lower bound at every operating temperature or age. **3 mm** is an authored adverse difference between the two supporting ends of each tested span, **not** ±3 at each end, a measured settlement or an allowed construction tolerance. It does not accumulate on every span around the whole route. These explicit assumptions are falsifiable: worse delivered support levels or a lower relevant modulus require redesign, not relabelling the result as robust. The test considers one inactive **interior** station only; failed terminal support is a different case.

## Located assembly and renewal sequence

Relative to court-side sleeve end y7750, station positions are **175,565,955,1345,1735,2125,2515,2905,3295,3685,4075**. Apply the same schedule to x5800 and6200. Each station reserves100 mm axially for the actual hardware, leaving125 at each sleeve end for seal and tool development. The100 reservation is not a claimed PSI collar width; the Radius half-OD bracket bearing guidance implies an approximately55 mm contact comparison, but does not approve the actual ring contact. Do not trim skids, omit a fastener or crush the pipe to achieve these envelopes.

The exposed body end lies275 from the nearest ring centre, including its100 projection. Provide an independent accessible support at each terminal so coupling, inlet and removal loads do not rely on an uncalculated cantilever or the annular seal. Those supports and connector profiles are **not yet designed**. With terminals supported, the intervening175-to-exterior span also needs a connected geometry/load check before installation.

Dry-assemble the carrier and removable rings outside; confirm that the complete assembly passes a representative delivered sleeve without forcing. Insert from outside using controlled support, leaving both terminal connection zones accessible. Before renewal, isolate/divert incoming rain independently, disconnect exposed joints, unload and remove the court annular closure, then withdraw the pipe **with its rings** into the retained exterior territory. Rings must remain secured to the carrier during pulling; a loose ring stranded inside the sleeve defeats the proposed sequence. Pull force, ring retention, bend/straightness, tool sweep and temporary rain management require a real assembly trial. A calculated small sag is not that trial.

## Court closure and observable leakage

[PSI EndiT DU/KG/KT families](https://psi-products.de/en/products/pipe-insertion/endit-casing-step-end-seal) describe dirt/moisture protection; that is not a matched pressure rating for a submerged court closure. The [LINK-SEAL BC/BS316 soft-EPDM families](https://psi-products.de/en/products/sealing-technology/original-link-seal-modular-seal) explicitly address plastic pipe and state pressure tightness up to3 bar, but an exact sleeve bore, pipe diameter, movement, surface and installation match is still required. A150-hole selection row cannot be reused for156.2–159.7. No seal model or pressure rating is adopted by this study.

Use a removable **pressure-qualified court-end annular closure** only after that match is established; retain a separately observable, free-draining exterior annular end rather than sealing both ends into a hidden reservoir. Verify exterior backwater at the tell-tale's own level. The previously drawn−585 receiver target is not surveyed water and cannot prove this. Neither a seal nor an in-service coupling becomes a structural support merely because it grips the pipe.

## Verification and handoff

Run from repository root:

```sh
node --test project/rwt/studies/carrier-support.test.mjs
node project/rwt/studies/carrier-support.mjs
node project/rwt/studies/carrier-support.mjs --check
```

Nine tests cover analytic boundary/symmetry/scaling identities, independent sampled fall, the smallest passing finite station count, adverse counterexamples, dimensions, invalid inputs and deterministic rendering. The generator is pinned to north comparison JSON blob `e516ebb375a2120a300e05bd869e7edcbb28f2c8`; a changed subject demands reassessment. That JSON contains historical prose fingerprints, including a HAD file later amended for navigation; this study does not assert their current freshness or turn the old generated drawing into house authority. The A3 output is an inspection diagram of the stated calculation, not a fabrication drawing.

**Earned result:** real product identities replace nominal dimensions; the25 skid substitution is rejected; the equal-pitch family has a reproducible11-station development candidate and explicit failure cases; terminal release, sealing and leakage requirements now attach to located physical territories. **Not earned:** installed product compatibility, buried sleeve/floor structure, actual support levels/modulus, pullability, threshold safety, inlet capacity, hydraulic acceptance or real-site discharge. RWT-06 remains planned; no RWT-07 or shared-gate unlock.
