# Actual released-ring comparison

**Ideal spring/crown rotation releases improve the shallow arch, but do not resolve its actual compression-only load path.** The E3000 gravity case retains one cut outside the ring, and the proper retained-G roof-suction case has nine. Lowering the assumed modulus is not an earned material selection. The next geometric question is a steeper arch at the same2850mm head and215mm ring, rather than increasing the whole floor or hiding the unresolved joint actions.

This additive comparison preserves the [v2 native replacement](wet-masonry-arch-native-development.md), its exact original RC200 plate/membrane operators,140mm lower wall with12mm eccentricity, all material/source loads, finite grid receivers, normal-only floor bearings and positive tension-only tie. It uses the existing mapped-frame energy with four independent scalar globalRX coordinates: both spring ends and both faces of the crown. All translations and transverse rotations remain compatible. There are no penalty springs, erased end loads or new solver. Five unused coordinates on each scalar rotation node are fixed only as gauges and are absent from all work maps.

The two small independent tests recover the exact cantilever shear/fixed-end couple with zero released moment and zero gauge support wrench, and retain all six rigid motions. The full captures independently recover all four released end moments; the maximum absolute value across all four cases is below2.2e−9kNmm. These are **ideal kinematic joints**, not qualified physical masonry pins or rocking interfaces. Ring/pier spandrels remain elastic-frame material; joint normal/shear/contact, transverse stability, bearing, tie plates, DPC/base/grid and material resistance remain unresolved.

| Actual full joined solve | Normal floor bearing | Active normal points | Tie tension | Ring cuts outside actual215×140 rectangle | Worst in-plane eccentricity at governing kern cut |
|---|---:|---:|---:|---:|---:|
| E3000,1.35G/Q2 |17.854kN|16/32|8.780kN|1|111.506mm|
| E1500,1.35G/Q2 |7.684kN|14/32|5.454kN|0|74.469mm|
| E3000,0.9G/Q0 plus−2.25kPa roof pressure |7.850kN|10/32|3.513kN|9|195.549mm|
| E3000,zeroG/Q0 plus−2.25kPa roof pressure diagnostic |0.01648kN|1/32|0, open|17;2 noncompressive|70.596mm plus968.911mm normal eccentricity|

The E3000 gravity controlling cut has N2.529625kN/M0.282068kNm, giving111.506mm eccentricity against107.5mm half depth. The actual combined roof-pressure cut has N0.818680kN/M0.160092kNm, giving195.549mm. Neither fixed set of recovered elastic actions admits compression confined to the real ring. The E1500 gravity case lies inside the rectangle, but its gross affine kern ratio2.151 still demands cracking/partial contact; it is neither a resistance pass nor evidence for choosing a favorable E. Actual pier necessary section screens are retained separately; the E3000 gravity north base gross affine ratio1.737 also requires a resolved compression distribution.

## Exact load ownership

The gravity control is the retained actual floor-section programme:1.35 times the physical G inventory,2kPa fresh net floor live load and27kN/m³ RC comparison density, with source native31 wall/floor programme unchanged and `includeExternalGMAXQ=false`.

The combined roof-pressure control takes its **exact0.9G/Q0/−2.25kPa programme** from `roof_surface_pressure_proof.pressure_controls` / `uniform-suction`, ported onto this same27density candidate. The full nonlinear floor/roof/house contact problem is re-solved with both gravity and suction. It is not a linear increment added to the gravity response. Its tie remains active, unlike the zero-G diagnostic. There is no captured v2 counterpart for this extra combined case, so no v2-to-v3 improvement is claimed for it.

Zero physicalG/Q0 suction remains a distinct nonlinear diagnostic. Its opening/tension does not represent a preloaded full design combination and cannot reject gravity masonry by itself. Neither retained programme establishes a complete signed or code combination envelope, aerodynamic coefficients or design factor acceptance. The combined full-source failure above supplies the consequential action screen without using zeroG as a substitute.

For all three paired v2-to-v3 controls, actual plate cells/holes, physical G and the complete external source wrench remain identical. The E-only comparison likewise preserves them. Existing full58 native source identities and additive method/runtime identities authenticate every complete response. The independent six-component arch free body and native global/energy checks pass in every case. No admission of the material/joints follows from balance. Both the actual capture and the derived receipt correctly mark finish/stair/service evidence inapplicable.

## Coordinated next geometric comparison

At fixed2150finished span,27finish,head2850 and ring215, rise450/600 would lower raw spring from2550 to2400/2250. Their actual full-opening minimum finished intrados is2388.599/2241.991mm, compared with2534.491mm now. Their outer-ring projection at the raw spring contracts toY8790.525..11574.475 /8831.652..11533.348. These are useful actual room/abutment tradeoffs, not accepted proportions. A2560 tie still crosses the opening with an exposed-envelope underside2535; moving it lower would introduce its own head/appearance price and must be authored separately.

The owner charter/structural brief prefer genuine arches and direct support but mandate no2550 spring. The source2680 finished-intrados requirement belongs to specific Plant/spine service packets, not this new living divider. The protected-route2250 rectangular assembly limit is a different source duty;600rise would require a real carrying/head path rather than inheriting that control. The600body plan reserves and sofa/radiator operations remain limited checks. No whole room or taste acceptance is inferred.

Deeper rise **does not itself remove the12mm offset**: the same south solid pierY8627.5..9080.5 overlaps the protected stair east wallY4173..8949.5 over322mm. An aligned140core plus27finish still intrudes12mm into that finished plane. Any offset removal needs a separately coordinated core/finish/pier-footprint change. Keep the eccentricity in the initial geometry controls. The completed crafted study room is retained; these new living-divider interfaces receive their own review.

## Reproduction

```sh
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 python3 -B project/str/studies/wet_masonry_arch_released_proof.py --check
python3 -B -m unittest discover -s project/str/studies -p wet_masonry_arch_released_test.py
```

The versioned producer regenerates exact requests from the owning controls, authenticates the four captured requests/start records/complete responses, checks source/method identities, actual52 heads, source wrench, material/floor unchanged controls, released moments, necessary ring/pier screens and independent six-wrench balances. It reuses the existing v2 proof and does not execute a native solve. Changed inputs or methods invalidate it. A fresh execution uses the archived explicit request and `wet_masonry_arch_released.py --request REQUEST.json --out NEW.json`; overwrite is rejected and an interruption after solution leaves an explicitly unvalidated checkpoint. No editor current-house admission, masonry selection, construction release or owner approval exists.
