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

The former1200/440MPa membrane was an authored cracked/steel-only comparison, with its own retained rationale. Increasing membrane stiffness to8250/3437.5MPa is a new material-model assumption, not a demonstrated improvement in actual RC. No cracking, long-term stiffness, reinforcement, local stress convergence, signed envelope, anchorage, node resistance or foundation acceptance follows. The later q32→q64 check below addresses only normal-bearing integration at the unchanged slab mesh.

The current finite-contour solid assigns one E to both slab and adjoining L-wall volumes. Applying8250MPa to that entire patch would also change retained L-wall axial/frame stiffness. The present comparison resolves **the slab** constitutive mismatch. A finite replacement still needs body-specific material ownership, explicit frame/solid cut conditions, fresh station-response evidence, reciprocal work maps and subtraction of the replaced native energy/load exactly once. No finite patch is inserted here.

The smallest equivalent numerical edit is three membrane fields plus plate `shearFactor=5/24`, retaining plate `E33000 × flexuralFactor0.25`. The authored alternative uses `E8250 × flexuralFactor1` with `shearFactor5/6` to expose the common slab law directly.

## Reproduce

`python3 -B project/str/studies/uniform_slab_law_proof.py --check` authenticates both full captures against independently reconstructed current native requests, all58 native source identities, capture summaries/drawings, actual52 heads, source-wrench controls and current comparison methods. It regenerates the shared TypeScript necessary-bound diagnostic and compares the complete derived proof. It executes no native solve.

`python3 -B project/str/studies/uniform_slab_law_test.py` checks the exact transformed input domain and independent native MITC4 element equivalence.

`python3 -B project/str/studies/uniform_slab_law_proof.py --capture-to /absolute/new/directory` explicitly executes the changed actual native case and writes a fresh complete request/full/capture checkpoint. It refuses to overwrite existing evidence. The source control is recovered from authenticated actual evidence, never fabricated or silently replaced.

The same authored recipe belongs in saved `distributedFloor.membraneLaw` and `masonryFrame.plateLaw`, with the unchanged complete current wet-case stages. It uses existing shared solvers and supported input fields. Current finite-joint/contour receipts must return unsupported for this changed request until new evidence is produced; no historical fallback is earned by this comparison.

## Consequence for the wet-beam end

Retain D80 as the existing old-law control. Carry D100 into further **common8250-law end development**, because D80 fails a declared nominal straight-cut witness while D100 does not. This is a direction for the next comparison, not an assembly selection, a physical rejection of D80, or acceptance of D100 anchorage.

The [current-source consequence](studies/uniform-slab-law-end-consequence.json) executes `wet_beam_rectangular_return.assess` on both actual q32 native results with the same current cage settings, post-link raise10mm, end mandrels80/100mm and strut cotangent choices1/2.5. It regenerates complete lap/ramp/post/link collision, closure and cover comparisons, quantities, nominal post-head fans and the [D100 comparison view](studies/uniform-slab-law-end.svg). For each mandrel the complete geometry identity and quantities are unchanged between constitutive cases. Neither the existing default law nor its D80 input is changed.

At the same physical boundary cut—`WET-SUPPORT/beam/3`, end0, `[2902.5,9252.5,3195]mm`—the cot2.5 chosen-allocation comparison changes as follows:

| Declared comparison at the same cut | Old law q32 | Uniform8250 q32 |
| --- | ---: | ---: |
| Axial compression, kN (negative is tension) | −4.009840 | −37.112028 |
| Four-corner maximum tie witness, kN | 9.269267 | 15.804930 |
| Added orthogonal shear per tension bar, kN | 5.794993 | 8.908317 |
| Added thin-cell torsion per corner, kN | 0.163899 | 0.199509 |
| Chosen nominal bar-force comparison, kN | 15.228159 | 24.912756 |
| Reference stress at declared fraction, MPa | 146.354876 | 239.431658 |
| Basic poor-bond length comparison, mm | 209.078394 | 342.045225 |
| Governing nominal mandrel comparison, mm | 56.797267 | 92.918420 |

D80 passes the old-law nominal comparisons. Under the uniform law, its three supported straight cuts pass the cot1 comparison but fail cot2.5. D100 passes both declared cot choices at those three cuts. The longer basic poor-bond comparison does not prove that a compatible development path exists; its actual stressed length and curved transfer remain unresolved.

All five curved/ramp cuts remain explicitly unsupported. The four-corner equilibrium allocation leaves a self-equilibrating corner mode unresolved, so the displayed force is not an actual bar-force bound. The study supplies no compatible curved-bar force, finite concrete node, bend-pressure resistance, bond/anchorage, placement-force envelope, full signed-load envelope, cage-mass feedback or global mesh/stress convergence. The slightly improved floor point moment cannot cancel these increased end demands.

Reproduce with `python3 -B project/str/studies/uniform_slab_end_consequence.py --check`; regenerate with `--write`. This postprocessing executes no new native solve and pairs the exact same physical cuts, retaining separate coincident member-end cuts rather than erasing their nodal force jumps.

## Actual normal-bearing refinement and fine end witnesses

The uniform8250 case now has an actually re-equilibrated order64 normal-bearing counterpart. Its only authored change from the actual q32 case is `wetSupport.bearingQuadratureOrder:32→64`. All six slab-law fields, physical geometry, supports, loads, other frame laws, slab cells and voids remain unchanged. The [fine native archive](studies/uniform-slab-contact-refinement-native-captures.tar.xz) retains the complete actual request/result/capture and execution-start source/runtime identities; q32 remains authenticated through its existing archive.

The [normal-contact receipt](studies/uniform-slab-contact-refinement.json) applies the existing unmodified `compare_contacts` criteria to both actual responses. Both states meet their own exact clipped-affine same-plane force/centroid comparisons, and the coupled normal refinement passes:

| Monitored comparison | Actual q32→q64 change | Existing criterion |
| --- | ---: | ---: |
| Maximum of all312 signed head components, kN/kNm | 0.000010837 | 0.1 |
| South post normal force, kN | +0.000000795 | 0.044143047 |
| North post normal force, kN | −0.000011173 | 0.001367245 |
| Largest post centre-of-pressure component, mm | 0.000961140 | 0.1 |

The complete per-post head/base wrenches, contact forces/first moments/centres, both52-head lists, source-origin/mass controls and work/strain-energy residuals are retained. No global slab mesh was refined. The monitored floor point moment changes81.676046624→81.676046425kNm/m; this small contact-quadrature sensitivity is **not** evidence of slab/corner stress convergence or a material qualification.

The [fine end receipt](studies/uniform-slab-contact-end.json) recomputes D80/D100 nominal force cases from both actual q32/q64 responses. The existing complete geometric checks are reused only after matching the current complete cage/quantity identity and unchanged geometry methods/choices. All eight exact physical end cuts retain six signed native-action comparisons, including the five cuts for which a compatible curved-bar force remains unavailable.

The governing chosen-allocation mandrel changes92.918420367→92.918417552mm, a difference of−0.000002815mm; the corresponding basic poor-bond comparison changes342.045225029→342.045214666mm. D80 still fails three cot2.5 nominal witnesses and D100 passes all six declared comparisons. Continue D100 as the next uniform-law development comparison, retain D80 under the old law, and preserve the unresolved allocation/curved-force/anchorage and assembly-selection boundaries. The [fine D100 view](studies/uniform-slab-contact-end.svg) uses the actual q64 force case.

Reproduce with `python3 -B project/str/studies/uniform_slab_contact_refinement.py --check`, `python3 -B project/str/studies/uniform_slab_contact_end.py --check`, and `python3 -B project/str/studies/uniform_slab_contact_refinement_test.py`. These replay checks execute no native solve. A fresh actual fine solve requires explicit `uniform_slab_contact_refinement.py --capture-to /absolute/new/directory` and refuses overwriting retained evidence.
