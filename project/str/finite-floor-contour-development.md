# SW finite slab-contour component — unresolved elastic development

The ordinary native floor and its failed fixed-cut refinement remain unchanged.
This experiment provides the missing independent distributed floor interface to
an elastic slab/L component. It does not insert that component into the house,
qualify a concrete material or establish a finite joint/design-strip demand.

The explicit versioned `finite-floor-contour-inputs.json` owns the stable SW occurrence, units/datum, patch bounds, wall-end elevations and wall density. Slab elevations derive from actual source-bound floor-section datums. The reader validates every authored extent against its actual reference mesh and material.

The actual completed native500 and250 meshes share contour axes X2177.5 and
Y2187.5mm. Use the exact rectangular SW slab domain from X/Y262.5mm to those
axes, rather than the former arbitrary2m square ending2262.5mm. Both complete
captures verify material coverage and the absence of internal apertures or
normal receiver fibres. These are authored computational extents, not justified
Saint-Venant distances. Their use can avoid a new whole-house gridline, but
compatible band/chord ports, remeshing consequences and global replacement still
require explicit integration evidence.

The slab occupies Z3170..3370mm. Exact disjoint lower/upper L stubs end at
Z2170/4370mm. The union is1.258075m³: slab0.737275m³ and wall stubs0.5208m³.
At the source slab27 and wall25kN/m³ its characteristic G is32.926425kN,
including19.906425kN slab G. This material already belongs to the native house;
a replacement must remove its original operators and loads exactly once.

The component exposes100 independent shell coordinates along actual literal
native500 north/east contour stations and12 rigid wall-end coordinates. The
shared corner has one5-coordinate station. For ζ=Z−3270mm, the work-conjugate
trace in SI units is U=u0+ζ·ry, V=v0−ζ·rx, W=w. Intermediate solid boundary
nodes interpolate between declared physical stations. No rigid middle plane,
nearest-node substitution, numerical grounding or clipped stiffness is added.
The west/south exterior edges remain free in this bounded component: actual
outer RC band/chord interfaces are unavailable. The bulk membrane starts at
332.5mm; its domain must not silently extend to the plate edge262.5mm during
any future global insertion.

Four analytical/adverse controls cover authored source-extent edits with exact restoration, unit/datum and off-mesh rejection, two differently sized geometries,
independent virtual work, six rigid motions, exact full potential with consistent
G condensation, separate local floor-load changes, modulus doubling, unchanged
control and rejected material overlap/invalid contour/orphan data. The source
reader validates native byte identities and complete executed capture receipts.
The retained uniform140/70/35 history and the current graded140/70/50 controls preserve six free rigid modes and106 positive relative modes. Each receipt records its actual residuals; a killed process contributes no response or convergence value. The isolated pinned scikit-fem runtime remains separate from the
ordinary native runtime.

## Current graded-contour comparison — 25 November2026

The original uniform140/70/35 trial is retained in
`studies/finite-floor-contour-uniform-history.tar.xz`, with its original method
and input identities inside the captures. Its all-motion sensitivities were
86.4487% and84.3436%; the35mm governing mode concentrated rotations around the
literal15mm north-contour station interval. These are historical executed
comparisons, not current graded outputs or an inferred locking diagnosis.

The versioned authored `meshControls` now explicitly retain normal contour
layers at7.5/15/30/60/120mm from both interior edges and divide the slab depth
into at most15mm intervals. The global maximum pitch changes independently. It can also subdivide tangential contour intervals and intervals between the authored layer positions; the complete near-field mesh is not held fixed.
These retain every112port coordinate and all106 relative modes; no averaging,
mode removal, rigid middle port or relaxed threshold hides the old response.
Sparse condensation uses the explicitly recorded MMD_AT_PLUS_A ordering.

| Global maximum pitch | Nodes | Bricks | Worst all-relative-motion energy sensitivity from previous |
| --- | ---: | ---: | ---: |
|140mm|10464|8754|n/a|
|70mm|22485|19116|12.05566%|
|50mm|44250|38596|13.80010%|
|35mm|Unavailable|Unavailable|Process killed; no result|

The comparison fixes the lower wall-end six coordinates only to quotient the
same six global rigid motions. Both the12.05566%140→70 and13.80010%70→50 changes remain material. The latter is larger; a falling nominal maximum pitch is not evidence of a monotone convergence rate. Its governing relative eigenvector is concentrated in in-plane east-contour `u/v` at Y262.5–417.5mm; this observation does not establish a physical house demand or element-locking diagnosis.
Fixed authored contour-layer and slab-depth positions plus changing global pitch are **not complete mesh convergence** or a far-field-only test. Actual tangential subdivisions can change beside those fixed positions. Separate near-field/depth and component-domain sensitivity checks remain necessary. No convergence acceptance follows.
The largest current rigid-mode residual is below6.7e−14; the independently
integrated complete-G wrench residual is below1.12e−11kN/kNm.

The actual graded35 process was killed before emitting a complete result. The
[execution record](studies/finite-floor-contour-execution-limit.json) binds its
exact inputs, methods and runtime. The shell's kill observation establishes an
execution failure; its underlying cause is unknown. The old uniform35 capture
was removed from the current family after the producer correctly rejected its
incompatible inputs. It remains available only in labelled history. The literal50mm intermediate control completed in204.02s; it is reported as50 and is not substituted for the missing35 response.

A passive actual140 numerical-order observer retains the unchanged assembled
solid matrix, contour trace, boundary and consistent load from the ordinary
MMD call. It then calls the existing same condensation method with COLAMD on
those **identical** operators. The repeated ordinary result must equal the
current140 capture exactly except elapsed time. This changes no physical
operator or authored input, and does not require a second implementation of
assembly. The source-bound ordering receipt reports an all-relative-motion
energy difference1.831e−11 and maximum consistent-load difference4.26e−12kN/kNm.
Those satisfy the explicit1e−7 numerical reproducibility screen; that screen
supplies no physical convergence or resistance claim.

```sh
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 PINNED_PYTHON -B project/str/studies/finite_floor_contour_ordering_control.py --root . --retained project/str/studies/finite-floor-contour-captures/contour140.json --out project/str/studies/finite-floor-contour-captures/ordering-control.json
```

The isotropic33GPa/ν0.2 comparison is not equivalent to the native separate
plate/membrane/frame laws. The [existing common-modulus bound](finite-joint-solid-development.md)
still rules out an equivalent common positive local material for those authored
slab laws. A solid insertion would be a declared constitutive candidate change,
requiring whole-system comparison and exact operator/G replacement. No slab
thickness is selected.

## Shared saved-document, CLI and browser route

The optional `floorSection.contourComponent` authored object contains exactly
`execution`, `pitchMm`, `youngKNPerM2`, `poisson` and
`slabVolumeLoadEquivalentKPa`. `execution` is `deferred` or `compute`. The final
field is an explicitly labelled local body-load comparison, not a qualified
physical floor surface-loading programme. Absent controls retain the ordinary
native solve and return no component. Deferred controls expose an analysis-pending
result for the exact saved revision. An atomic `set-floor-contour-comparison`
operation uses the existing floor stable ID and preserves normal undo/redo and
stale-result fencing.

The adapter compares the **complete actual native request**, including geometry,
loads, supports, thickness and laws, with the explicitly declared current-source
experimental contour reference. A changed house case returns
`FINITE_CONTOUR_CHANGED_NATIVE_CASE`; source hashes alone cannot bypass it.
Supported local controls recompute the same versioned Python method. The existing saved-document CLI (`--bundle`), API and browser status consume that result. There is no standalone current reader that substitutes the retained experiment for authored native inputs. The actual stage requires the current finite-joint-development owning binding, exact method identities and the actual saved native request/revision identity. Runtime absence is explicit
unsupported evidence, not a cached answer or ordinary-floor fallback. Heavy
analysis may use `STR_FINITE_SOLID_PYTHON` pointing at the separately pinned runtime.

```sh
STR_FINITE_SOLID_PYTHON=/ABSOLUTE/PINNED/PYTHON node --import tsx scripts/compile-current-design.ts --bundle ACTUAL_SAVED_ENGINEERING_DOCUMENT.json
```

The retained experiment is an applicability reference, never an independently current-authoritative native input. Full normal
and signed loading, physical material/contact laws, exact native band/chord and
wall replacements, finite concrete/steel transfer, reinforcement/anchorage,
foundation resistance and whole-house architectural coordination remain open.


## Actual native loading: precise next missing observation

The retained complete native result exposes vertical contour `w/rx/ry` but does
not retain the bulk membrane's interior `u/v` field or actual wall displacements
at the authored2170/4370mm end stations. Fixing those missing coordinates or
substituting nearby masters would invent a different submodel boundary. The
next demand comparison requires passive recovery of actual membrane Schur
coordinates and the real finite wall interpolation, with an ordinary/observed
full-result passivity control. Even that one-way native-driven component would
remain a constitutive/domain comparison, not compatible global demand: native
band/chord replacement and feedback still have to be proved.


## Replaying scalar diagnostics on another numerical runner

The contour captures, their complete port matrices, input/method identities,
mesh-pitch pairs and every nonacceptance flag remain exact checks. Recomputed
LAPACK eigenvalue extrema use the same1e−12 absolute scalar replay allowance
already used by the ordering-control checker. The prior text-byte comparison
failed on the hosted runner even though the current pinned local replay was
byte-identical. The checker now reports any larger scalar change explicitly;
changed capture/source hashes, pitch, claims and nonfinite values still reject.
This is a numerical replay boundary, not a relaxation of the unresolved12.06%
and13.80% physical mesh sensitivities or an acceptance of either comparison.
