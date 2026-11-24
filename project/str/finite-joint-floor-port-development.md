# Distributed floor ports — finite component remains numerically unresolved

This is a separate development component, outside current native floor admission.
It extends the wall-end benchmark with a real slab patch and distributed floor
work. It is not a native house replacement, joint cage or engineering selection.

The exact current-source 500 mm capture supplies the physical material and
contour partitions. Its complete source/method identities and archived response
checksum are checked before use. The 2 m square SW patch is fully material with
no actual normal contact inside it. The contour ends at 2262.5 mm, requiring new
axes in the future exterior model. The L wall stubs extend 1 m below and above
the 200 mm slab. The full union is 1.3208 m³: slab G21.6 kN plus wall G13.02 kN.
Its gravity wrench is [0,0,−34.62,−34.60915,+34.60915,0] kN/kNm about the source
origin. These are existing source contributions to replace once, not extra G.

The component has 127 common work ports: twelve actual wall-end coordinates and
five shell coordinates at each of 23 east/north contour points. For ζ about the
slab midplane, the displacement trace is [u+ζry,v−ζrx,w]. Refinement retains the
same physical contour knots and linear trace, with no nearest-node snapping.
The west/south exterior faces remain free. The trace constrains contour thickness
warping; it is an explicit computational boundary, not a qualified physical bond.

Three analytical/adverse controls establish exact material union, all six rigid
modes, consistent G and first moments, complete Schur potential, exact linear
trace and rejected coordinate overreach. A loaded footprint demonstrably distorts
instead of retaining the old rigid L clamp. The established solid operator still
uses the explicit isotropic comparison; it does not reproduce the native
independently authored membrane, bending and cracked-frame laws.

Actual maximum pitches 140/70/35 mm use the same source, method, runtime and
127-port basis. The finest mesh has 44,893 field nodes and 36,520 bricks. Both
predeclared 5% all-port energy screens **fail**: 88.6400% at140→70 and59.4917%
at70→35. The metric is the largest generalised energy change after fixing the
lower six rigid-body gauge coordinates. It covers every relative end/contour
motion, rather than selected diagonal entries. It is not the existing native
head/cut screen. Do not publish this component as converged, suppress its
controlling mode or infer a slab thickness from it.

The [complete captures](studies/finite-joint-floor-port-captures.tar.xz),
[comparison](studies/finite-joint-floor-port-comparison.json), serialisable input,
reusable geometry/trace method and isolated CLI runner are versioned together.
`finite_joint_floor_ports_compare.py --check` reproduces the comparison and checks
actual source identities; source/input edits invalidate the captures. Run the
analytical controls using the existing isolated hash-pinned solid runtime.

Next compare an established higher-order solid discretisation under the same
physical geometry, contour and declared screen. No native band/chord yaw map,
unit adapter, exterior remeshing, shortened physical frame or exact operator/load
replacement is implemented. Actual floor-pressure and other load families,
arch/jamb geometry, material law, cage/anchorage and whole-house design-strip
demands remain separate open obligations. This component does not enter current
CLI/browser house outputs as a successful substitute.
