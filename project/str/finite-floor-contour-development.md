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
All140/70/35 runs preserve six free rigid modes and106 positive relative modes;
rigid residuals are below4e−14 and independent complete-G wrench residuals below
3e−13kN/kNm. The isolated pinned scikit-fem runtime remains separate from the
ordinary native runtime.

## Numerical result: not converged

| Maximum solid pitch | Nodes | Bricks | Worst all-relative-motion energy sensitivity from previous |
| --- | ---: | ---: | ---: |
|140mm|2364|1464|n/a|
|70mm|7284|4956|86.4487%|
|35mm|42310|34342|84.3436%|

The comparison fixes the lower wall-end six coordinates only to quotient the
same six global rigid modes. Generalised eigenvalues compare every remaining
relative contour/wall motion. These large changes are not a numerical pass.
The35mm governing mode is concentrated in north-contour rotations near X402.5,
417.5 and462.5mm, including the15mm station interval. This identifies a concrete
investigation of interface/high-frequency resolution and element behaviour;
it does not establish locking, continuum convergence or the actual house demand.
Retain the all-motion comparison rather than suppressing that mode or averaging
its energy away.

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
