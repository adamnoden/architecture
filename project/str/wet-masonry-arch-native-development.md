# Actual coupled lower-arch comparison

**The continuous elastic masonry arrangement fails necessary compression-only section admission. Keep the alternative open only through an explicitly different joint/contact arrangement.** The earlier [partial three-hinge study](wet-masonry-arch-comparison.md) is not promoted to a house solution.

This executable experimental successor replaces the seated wet beam, both posts and pads in the actual native RC200 house. It retains the existing MITC4 plate, CST membrane, steel chord, roof, wall contacts, source loads and all52 physical grid heads. The omitted250mm slab strip is restored. The actual140×3110mm lower masonry footprint and its12mm east offset remain the authored partial-study geometry. Existing finite grid-member traces carry the two masonry piers; there are no nearest-node supports or missing-coordinate clamps.

The new wall has a105mm deep top band below RC3170,215mm radial ring and actual spandrel/pier material. Their E3000MPa,ν0.2 elastic-frame representation is a declared comparison law. It supplies bending and tension, so it cannot silently stand in for ordinary masonry. The section helper's first argument is localZ depth; all ring/head sections use215×140 with localY parallel globalX. An earlier reversed-section prototype and an earlier one-dimensional slab-strip prototype are excluded from every consumed capture.

Thirty-two scalar plate receivers give two-point Gauss integration across140mm and along eight longitudinal bearing cells. The area is435400mm², with exact first/second geometric moments. Compression-only normal springs use declared0.1mm/MPa compliance and work-dual finite member loads at the true RC3170 contact plane. Each contact annihilates all six rigid motions; unused scalar receiver coordinates do not restrain the house. No friction or floor moment fixity is supplied. The existing tension-only kernel carries the30mm tie atZ2560 betweenY8700/11650. Actual rod/product/node resistance remains unresolved.

## Actual results

All three complete captures used CPython3.12.14, NumPy2.3.5 and SciPy1.17.0, with BLAS/OMP threads set to one. Each executed the same unchanged58 native sources and exact frozen additive backend. Requests, start records, complete outputs and the actual predecessor are retained in the authenticated capture archive.

| Actual coupled case | Floor normal compression | Active contacts | Tie tension | Maximum plate deflection | Worst positive-N gross kern ratio |
|---|---:|---:|---:|---:|---:|
| E3000, actual gravity/control |18.667kN|20/32|8.398kN|2.91724mm|4.789|
| E1500, stiffness edit only |8.184kN|17/32|5.281kN|2.91675mm|3.076|
| E3000, existing zero-G roof-suction adverse pressure |0.01063kN|1/32|0, open|5.42431mm|29.970;10 noncompressive cuts|

At the E3000 crown-adjacent ring cut, actual compression is2.231214kN and in-plane moment0.371883kNm: the resultant eccentricity166.673mm exceeds the107.5mm half-ring depth. Seven recovered end cuts lie outside the215×140mm section. E1500 still has one outside cut, with107.929mm eccentricity. These fixed elastic actions cannot be supported by compression confined to the actual ring rectangle, irrespective of a chosen compressive strength. This is stronger than a failed middle-third screen, but it is **not an arch-collapse proof**: genuine joint opening/release can redistribute actions. Enlarging the whole slab or merely lowering assumed masonry E does not resolve the demonstrated mechanism.

The zero-G adverse case is preserved unchanged. Its tie opens, ten ring end cuts are noncompressive and eighteen fail the section-resultant screen. Positive contact activity is numerical demand, not a masonry or uplift pass. No favorable retained-G case replaces that adverse duty.

The stiffness edit preserves the actual plate cells, holes, source external wrench and physical G; it changes P47 vertical reaction by3.331107kN. Compared with the actual predecessor, P47 changes by22.608731kN. These are changed native demands, not foundation capacities. The added retained floor points also remesh the plate; no identical-mesh old-beam control or corner convergence claim is made.

## Independent replacement and work checks

The gross joined-house material G changes by−8.506593515kN. An independently reconstructed ledger closes to less than1e−7kN:

| Remove/add operation | G change |
|---|---:|
| Remove old RC beam and posts |−27.1356075kN|
| Remove old pads |−0.0345400kN|
| Add gross arch masonry |+12.1828950kN|
| Add gross rod/plate/washer/nut envelopes |+0.2402089kN|
| Restore RC200 slab strip |+3.9892500kN|
| Restore adjacent ordinary clear masonry outside the narrower lower wall |+2.2512000kN|

Actual normal-core union area increases33600mm²; its3350mm height and20kN/m³ source density produce the last term. This checks material accounting, not delivered quantities, pocket losses or a complete finish package. The gross masonry strip partition conserves total G and globalX/Y gravity first moments. Individual curved strips use declared midpoint lumping; their individual centroids are not asserted exact.

The actual arch free body independently combines recovered mapped-grid end wrenches, actual normal-contact forces, every declared masonry G origin and tie-hardware G. All six components close within4e−11kN/kNm across the three cases. Whole native wrench residuals stay below9e−8kN/kNm and the frame energy check passes. These checks do not qualify the elastic masonry law, finite nodes or physical bearing.

The immutable native captures inherit `finishStairServiceEvidenceApplicable=true` because the ordinary RC200 engine sees no seated support. The **derived experimental receipt overrides it to false**, retains the captured value and executed backend identity, and emits `EXPERIMENTAL_LOWER_ARCH_SUPPORT_REPLACES_SOURCE_HOUSE_INTERFACES`. Consumers must use this experimental receipt; its schema has no current-house/cache admission. No captured bytes or executed source identities were rebound to repair metadata.

## Executable next comparison

The bounded next change is an additive released/contact joint adapter using the existing native frame/contact kernels. It must retain this exact geometry, all floor/masonry/source wrenches, full material account, normal bearing and actual grid receivers. A three-hinge static witness does not author physical pins. Actual ring/abutment and crown joint location, normal/shear paths, opening/rocking, tie bearing, transverse stability and DPC/base interfaces must be explicit. Released end moments must be recovered and checked rather than discarded after the solve. This comparison has not yet run.

Reinforcement is a separate alternative requiring its actual force/anchorage/node path. Ring thickening is not selected to bury the elastic continuity peak. Finite compression/splitting, constituent directional resistance, bedding, mortar, tension/slip, tie/base/grid/foundation strength, signed-load envelope and mesh sensitivity remain unsupported. The existing sofa/stair/window/route/weather geometry checks remain partial; source-ground-zero is not either proposed raised-ground house, and no owner acceptance exists.

## Replay

```sh
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 python3 -B project/str/studies/wet_masonry_arch_native_proof.py --check
python3 -B -m unittest discover -s project/str/studies -p wet_masonry_arch_native_test.py
```

The proof replay authenticates all retained bytes and the current authored request/source/backend, then regenerates balances, mass replacement, actual52-head changes and necessary ring screens without re-solving. A changed input or backend invalidates it. For a fresh native execution, extract an archived request and run `wet_masonry_arch_native.py --request REQUEST.json --out NEW.json` in an isolated process; overwrite is rejected, start/runtime identities are saved and incomplete post-source validation leaves an explicitly unvalidated checkpoint. Changes to the actual model must produce new captures, never a relabelled receipt.
