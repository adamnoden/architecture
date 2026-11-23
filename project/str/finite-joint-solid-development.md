# Finite L component — bounded elastic development

This prepares a finite solid replacement for the unresolved rigid L footprint;
it does not yet connect that component to the floor or select its reinforcement.
The existing native floor response and failed cut screens remain authoritative.

The input derives the SW disjoint 140mm L rectangles and slab Z3170..3370 from
the existing source-bound material audit. The two authored 1000mm wall extensions
end at Z2170/4370. Total volume is0.57288m³; existing characteristic G is13.02kN
in the two wall stubs plus1.40616kN already carried by the plate. Adding this
component to the global model without subtracting that material, its operators
and its loads would double-count it. No global insertion occurs here.

The established [scikit-fem12.0.2](https://github.com/kinnala/scikit-fem/releases/tag/12.0.2)
[solid elasticity operator](https://scikit-fem.readthedocs.io/en/stable/api.html)
assembles full-integration trilinear bricks. Its wheel is hash-pinned in a
separate exploratory requirements file; the native numerical runtime is unchanged.
Coordinates are metres, forces kN and moments kNm, with rotations in radians.
The actual isotropic33GPa/ν0.2 choice is a labelled comparison: it is not equivalent
to the separately authored native slab bending/shear, CST membrane, cracked wall
or independent steel chord operators.

This is a mathematical representation limit, not only a difference in nominal
modulus. For the same εxx/κxx strain direction with transverse strain held zero,
the source200mm membrane has A11=1200×200/(1−0.15²)=245524.2967N/mm;
the source bending law has D11=(33000×0.25)×200³/[12(1−0.2²)]
=5.729166667e9Nmm. Thus D11/A11=23334.4184mm², whereas any common positive
through-thickness Q11(z) confined to±100mm necessarily satisfies
D11/A11≤10000mm². The source exceeds that bound by2.33344×. Its membrane
G440MPa is also separately authored, rather than the isotropic521.739MPa
relation. This does not prove global instability: the separate native operators
can each be positive-energy numerical comparisons. It prevents claiming a
single physically equivalent3D material or tuning an isotropic solid to match
both. The separate perimeter chord cannot repair a bulk constitutive mismatch.

Three analytical/adverse tests establish six free rigid modes, constant-strain
energy and affine recovery, exact re-entrant void volume, modulus perturbation,
overlap rejection, Schur potential/work equivalence and consistent gravity work.
Rigid end faces are explicit boundary conditions; they suppress end-face warping
and Poisson contraction. An axial EA/L fit would therefore be inappropriate.

Actual140/70/35mm maximum-pitch executions retain17,875 nodes at the finest mesh.
The worst relative end-motion energy sensitivity is8.9329% for140→70 and3.4016%
for70→35, calculated from all six generalised eigenvalues rather than selected
diagonals. These are measured sensitivities, with no predeclared numerical-pass
claim or continuum extrapolation. All six rigid modes remain free, with relative
residual below1e−12. Complete matrices, consistent gravity port loads and source,
method, input and runtime identities are retained in the accompanying captures.

Run the isolated pinned runtime against `finite_joint_solid_test.py`, then
`finite_joint_solid_run.py --pitch-mm P --out FILE` for each authored pitch.
`finite_joint_solid_compare.py CAPTURE_DIR --check` reproduces the energy comparison.
Edits invalidate captured method/input identities; unsupported requests reject
explicitly. This experimental schema cannot enter ordinary native floor admission.

**Next physical integration:** include the independently loaded floor through
distributed slab/membrane contour ports. Twelve wall-end ports cannot represent
the actual simultaneous floor wrench; adding one rigid middle port would retain
the original clamp. A2m square slab patch beginning at[262.5,262.5]mm has no
captured normal supports, holes, upper masonry or seats. Its domain extent is an
authored computational trial, not a qualified Saint-Venant distance. That patch
ends at2262.5mm, which is not a gridline in either completed native mesh; exact
replacement therefore requires an explicit shared boundary and remeshing.
Nearest-node or whole-cell clipping is not an admissible replacement. The patch
contains21.6kN slab G and12kN current factored plate Q; the two wall stubs contain
13.02kN G. Remove/reinsert these exact operators and loads once, preserve the
independent chord, and re-solve the house before interpreting design-strip demand.

The nearby ground arch reservations overlap177.5mm of each L arm in plan even
though the clear window starts37.5mm beyond each arm. The slab underside sits
105mm above the current arch outer crown. Those physical arch/jamb interfaces
and the contrasting slab/wall unit weights remain unresolved; no support or
material qualification is invented here.
