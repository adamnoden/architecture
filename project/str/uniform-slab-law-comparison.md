# RC200 uniform slab-law comparison

The actual RC200 house can be evaluated with a common, explicitly changed linear slab material. This resolves the algebraic slab-law incompatibility for this comparison; it does not identify the cracked-concrete stiffness or select a floor.

The retained control is `WET120-SOUTH40-q32`: 200mm slab, 120mm wet-bearing pad, south offset40mm, contact quadrature32, concrete27kN/m³, physical G factor1.35 and fresh floor Q2kPa. The authenticated full control and actual changed native result are retained in [the archive](studies/uniform-slab-law-native-captures.tar.xz). All other floor/frame/roof/support and load-origin choices are unchanged.

## Constitutive change

The native membrane uses `A = h C`, with independent authored shear modulus. The MITC4 plate uses `D = E × flexuralFactor × h³ / (12(1−ν²))` and transverse `S = E / (2(1+ν)) × shearFactor × h`.

| Slab operator | Retained comparison | Uniform alternative |
| --- | ---: | ---: |
| Membrane E / ν / G, MPa | 1200 /0.15 /440 | 8250 /0.2 /3437.5 |
| Plate E / flexural factor | 33000 /0.25 | 8250 /1 |
| Transverse shear correction | 0.5 | 5/6 |
| A11, N/mm | 245524.297 | 1718750 |
| A12, N/mm | 36828.645 | 343750 |
| A66, N/mm | 88000 | 687500 |
| D11, Nmm | 5729166666.667 | unchanged |
| D12, Nmm | 1145833333.333 | unchanged |
| D66, Nmm | 2291666666.667 | unchanged |
| Transverse S, N/mm | 1375000 | 572916.667 |
| D11/A11 divided by h²/4 | 2.333441840 | 1/3 |

The alternative has the exact membrane and bending operators of uniform isotropic E8250MPa, ν0.2, G3437.5MPa, with the declared5/6 Mindlin shear correction. Changing only membrane E would leave the transverse shear inconsistent: preserving old S at this new E would require shear correction2, outside the native supported domain. The alternative therefore changes both membrane and transverse shear deliberately while preserving all bending entries.

The existing common-material diagnostic changes from `common-modulus-ruled-out` to `necessary-bound-not-exceeded`; it continues to withhold material qualification. The producer separately verifies the full uniform A/D/isotropic-G/corrected-S identities. A positive necessary bound alone is not that verification.

## Actual same-case response

| Output | Retained q32 | Uniform q32 |
| --- | ---: | ---: |
| Frame strain energy, kNmm | 2893.164 | 2906.381 |
| Physical plate strain energy, kNmm | 548.981 | 547.576 |
| Maximum plate deflection, mm | 2.908642 | 2.924508 |
| Raw unconverged point bending-plus-twisting, kNm/m | 84.431413 | 81.676047 |
| Maximum frame translation, mm | 15.719173 | 15.893408 |
| Wet normal compression, kN | 44.131662 | 45.490292 |

The largest52-head component change is7.449746kN at P04/Fy. A wet-beam physical cut changes its axial component from−9.682997 to−64.151449kN at `[2902.5,9923.75,3195]mm` (compression positive: greater tension). The law change is consequential; previous cut/contact/anchorage evidence cannot be transferred unchanged.

The complete physical mass ledger agrees within2.9×10⁻¹¹kN numerical roundoff, and the maximum external source-origin wrench difference is1.17×10⁻¹⁰kN/kNm. The changed native52-head wrench residual is at most7.30×10⁻⁸kN/kNm. Frame work/strain-energy relative residual is1.18×10⁻¹²; plate work relative residual is2.43×10⁻¹³. Actual forces, moments, contacts and source residuals are retained in [the executable proof](studies/uniform-slab-law-proof.json).

Six response-derived interior moment-stationary cuts move. The comparison directly pairs the134 identical physical cuts and preserves distinct extrema separately; list index is not a physical cut identity.

## Scope and next executable boundary

The former1200/440MPa membrane was an authored cracked/steel-only comparison, with its own retained rationale. Increasing membrane stiffness to8250/3437.5MPa is a new material-model assumption, not a demonstrated improvement in actual RC. No cracking, long-term stiffness, reinforcement, local stress convergence, signed envelope, anchorage, node resistance or foundation acceptance follows. The changed law has not received a q32→q64 convergence check.

The current finite-contour solid assigns one E to both slab and adjoining L-wall volumes. Applying8250MPa to that entire patch would also change retained L-wall axial/frame stiffness. The present comparison resolves **the slab** constitutive mismatch. A finite replacement still needs body-specific material ownership, explicit frame/solid cut conditions, fresh station-response evidence, reciprocal work maps and subtraction of the replaced native energy/load exactly once. No finite patch is inserted here.

The smallest equivalent numerical edit is three membrane fields plus plate `shearFactor=5/24`, retaining plate `E33000 × flexuralFactor0.25`. The authored alternative uses `E8250 × flexuralFactor1` with `shearFactor5/6` to expose the common slab law directly.

## Reproduce

`python3 -B project/str/studies/uniform_slab_law_proof.py --check` authenticates both full captures against independently reconstructed current native requests, all58 native source identities, capture summaries/drawings, actual52 heads, source-wrench controls and current comparison methods. It regenerates the shared TypeScript necessary-bound diagnostic and compares the complete derived proof. It executes no native solve.

`python3 -B project/str/studies/uniform_slab_law_test.py` checks the exact transformed input domain and independent native MITC4 element equivalence.

`python3 -B project/str/studies/uniform_slab_law_proof.py --capture-to /absolute/new/directory` explicitly executes the changed actual native case and writes a fresh complete request/full/capture checkpoint. It refuses to overwrite existing evidence. The source control is recovered from authenticated actual evidence, never fabricated or silently replaced.

The same authored recipe belongs in saved `distributedFloor.membraneLaw` and `masonryFrame.plateLaw`, with the unchanged complete current wet-case stages. It uses existing shared solvers and supported input fields. Current finite-joint/contour receipts must return unsupported for this changed request until new evidence is produced; no historical fallback is earned by this comparison.
