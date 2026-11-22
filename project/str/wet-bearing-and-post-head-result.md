# Wet support — compression contact, open-pad load path and head duties

**Prefer centred pads for continued development. Do not select the whole beam/joint
system yet.** The160mm south-pad shift creates a large avoidable post-head moment.
Removing that shift does not qualify the north contact, the concrete head regions,
beam/slab connection, complete load envelope or foundations.

This challenge uses the seven wet controls in the frozen58-source floor method,
with complete-response checksums and exact requests verified before inspection.
No native solve, material law, load, support or source was changed. The
[source-bound floor receipt](studies/floor-section-proof.json) and
[recovery checkpoint](studies/grid-corner-recovery-checkpoint.json) own the executed
cases; the [seated support result](seated-wet-support-result.md) owns the geometry.

## What the pad actually does

`seated_wet_support.py` creates `WET-SUPPORT/contact/{post}/{sample}` with mode
`compression`. `vertical_floor_numerics.py` activates a spring only on its
compressive branch and multiplies its force by that active state. These pads
are **unilateral**, not bilateral springs or tensile hold-downs.

Each spring acts in globalZ at its actual XY point. Its pressure distribution can
transmit vertical force and moments about globalX/Y through eccentric normal
forces. It supplies no globalX/Y shear or globalZ torque. Thus “no moment fixity”
does not mean zero pressure-resultant moment, and beam torsion about its
along-Y axis is different from post-head torque about globalZ.

The wet beam also replaces part of the slab and has real vertical and membrane
attachment stations along its span. It is **not a detached two-pad beam**. In the
zero-G suction control both pads open: their exact and quadrature compression is
zero, and both posts' complete end-action vectors are below4.7×10⁻¹³kN/kNm.
The connected beam still has up to5.742952kN vertical shear and2.731028kNm torsion
at distinct executed cuts. Its residual load path is through the shared plate/
membrane/frame assembly, not pad tension. That route requires its actual
reinforcement and joints; the open-pad solution does not prove a free-standing
beam can resist uplift.

The complete model also retains explicit L ties/keys and translationally restrained
ground heads. Those head restraints can react either vertical sign; resistance
has not been supplied. In this same suction control22heads require downward
reactions, includingP10 at−242.545085kN, andP04 carries595.391883kN horizontal
resultant. Ground-head reaction moments are zero because rotations are not fixed.
Opening two local pads does not remove the separate whole-house hold-down,
shear, grid/joint and site-resistance duties.

## Actual post-head six-actions

PositiveZ is upward; moments follow the right-hand rule. At the top of each post
write the recovered vector as`[Fx,Fy,−N,Mx,My,Mz]`, withN positive in compression.
For every row below,Fx/Fy/Mz are within3.1×10⁻¹²kN/kNm of zero. The table therefore
retains the three nonzero components without confusing absent pad shear/torque
with a missing resistance calculation.

| Executed control | South`[N kN,Mx kNm,My kNm]` | North`[N kN,Mx kNm,My kNm]` |
|---|---|---|
| Aligned,4-point | [52.701447,−0.119530,+0.053751] | [0.472164,+0.014219,+0.042517] |
| Aligned,8-point | [52.702973,−0.119547,+0.053750] | [0.446672,+0.013762,+0.040053] |
| South+160,4-point | [45.066071,−7.049094,+0.027409] | [0.242493,+0.008223,+0.020762] |
| South+160,8-point | [45.066682,−7.049194,+0.027407] | [0.235808,+0.007631,+0.020762] |
| South+160,3kPa roof | [44.363933,−6.942603,+0.027172] | [0.587633,+0.017451,+0.052047] |
| Aligned,wet concrete27 | [52.920597,−0.120368,+0.053837] | [0.549406,+0.016501,+0.048880] |
| Zero-G suction | [0,0,0], numerical residual only | [0,0,0], numerical residual only |

Independent reconstruction used the actual quadrature normal forces`Fi`, post
axis`(xp,yp)`, pad weight`Gp`, relative pad offset`e` and the executedG factor`g`:

- `Fz = −ΣFi − gGp`;
- `Mx = −ΣFi(yi−yp) − gGp·e`;
- `My = ΣFi(xi−xp)`;
- `Fx = Fy = Mz = 0`.

Lengths are converted from millimetres to metres for moments. All14six-action
rows match within3.1×10⁻¹²kN/kNm. Post own gravity is distributed down the finite
post, so its base compression exceeds the head compression; it must not be
added again at the head. In the aligned8-point case the south/north base axial
reactions are65.299486/13.043184kN.

## Centring is a useful geometry choice, not universal dominance

At the matched8-point controls, centring reduces the south head/baseMx magnitude
from7.049194 to0.119547kNm, a factor58.97. The160mm case has a normal-force centre
about156.42mm north of the post axis; the centred case is only2.27mm north.
There is no evidenced architectural requirement for the160mm shift, which was
an adverse editable probe. Keep it as an adverse case, not the default geometry.

The trade is explicit: separate beam absolute extrema change from shifted to
centred as follows. These are not a simultaneous design combination.

| Component | Shifted8-point | Centred8-point |
|---|---:|---:|
| Axial tension,kN | 8.293119 | 10.176988 |
| Local shearY,kN | 1.104579 | 1.215279 |
| Local shearZ,kN | 23.345346 | 12.950848 |
| Torsion,kNm | 1.885510 | 1.878430 |
| BendingY,kNm | 6.567838 | 7.196283 |
| BendingZ,kNm | 0.421573 | 0.425492 |

The normal pads do not carry that beam axial tension or horizontal shear.
Those actions belong to the beam/slab/membrane connection and its actual cage.
Centring therefore removes an avoidable post duty while increasing some beam
components. Neither arrangement is a complete accepted structural baseline.

## The north contact needs its own numerical criterion

For aligned4→8, the largest difference across all312head components is
0.024812666kN atP24 vertical reaction,42.251321→42.226509kN. The corresponding
beam absolute inspection extrema are:

| Component | Aligned4 | Aligned8 | Absolute-envelope change |
|---|---:|---:|---:|
| Axial,kN | 10.178922 | 10.176988 | −0.001934 |
| ShearY,kN | 1.215200 | 1.215279 | +0.000080 |
| ShearZ,kN | 12.950682 | 12.950848 | +0.000166 |
| Torsion,kNm | 1.878489 | 1.878430 | −0.000059 |
| BendingY,kNm | 7.196994 | 7.196283 | −0.000711 |
| BendingZ,kNm | 0.425502 | 0.425492 | −0.000010 |

At matching physical cut rows, the largest vertical-shear change is0.020498kN
atY11522.5. One interior bending extremum movesY9906.277189→9906.280850; it is
not falsely paired as an unchanged physical sample. All other37stored rows
have matching member/end/point identities.

These global differences conceal a comparatively large local force error:

| Aligned contact | Active samples | Gauss compression,kN | Exact declared-field compression,kN | Force error |
|---|---:|---:|---:|---:|
| South4 | 16/16 | 52.678133 | 52.678133 | numerical roundoff |
| South8 | 64/64 | 52.679659 | 52.679659 | numerical roundoff |
| North4 | 2/16 | 0.448849 | 0.410984 | +9.2133% |
| North8 | 11/64 | 0.423357 | 0.427031 | −0.8604% |

North8compresses only2170.882mm² of the22000mm² pad. Its exact declared pressure
centre is`(+94.274175,−32.744293)mm` relative to the post axis. Gauss8gives
`(+94.607393,−32.506802)mm`, an error`(+0.333218,+0.237491)mm`. North4has
centre errors`(+0.268261,+1.296480)mm`. The8-point declared peak is0.590126MPa;
it is a value of the comparison law, not a qualified material/local-concrete
pressure. The north force is small but not numerically zero.

“Exact declared field” means the positive part of **one affine normal-gap plane
over each entire pad**, constructed from the beam/post nodal vertical motions
and rigid-plane rotations. With uniform0.1mm/MPa normal compliance, pressure is
`max(−gap/compliance,0)`. Polygon clipping and integration are exact for that
linear-positive-part field. They do not model a flexible pad, concrete bearing
spread, a physical contact material or a spatially varying bedding law.

Each quadrature solve has its own displacement plane: its exact diagnostic is
not a new equilibrium solve. For the **frozen8-point north plane only**, independent
Gauss-Legendre reintegration gives:

| Postprocessing order per direction | Compression,kN | Error against that plane's exact integral |
|---|---:|---:|
| 8 | 0.423357 | −0.86036% |
| 16 | 0.427285 | +0.05941% |
| 32 | 0.427152 | +0.02824% |
| 64 | 0.427033 | +0.00038% |

These16/32/64values are **not coupled reruns** and provide no new head reactions.
They identify integration of a small clipped patch as a concrete numerical
obligation. The present native method admits only2/4/8. Do not select8because
the existing0.1kN/kNm global comparison looks small.

## What the gross kern does and does not reject

The aligned8-point north head has the simultaneous boundary vector
`[0,0,−0.446672,+0.013762,+0.040053,0]kN/kNm`. Its gross260×450uncracked
full-compression kern ratio is2.48009. This rejects **full compression over that
gross post section under an affine stress assumption**. It does not say the
actual normal pad is in tension: every solved pad traction is nonnegative and
its resultant lies inside its actual pad. Nor does it prove the eccentric local
concrete head is adequate. The zero-G unloaded rows are not capacity failures
created by dividing residual moments by a near-zeroN.

The concrete follow-on is a dimensioned **post-head D-region**, using each actual
normal traction patch, pad gravity and simultaneous six-action row above. The
source cage's main bars terminate56mm below the post top; a straight-section
capacity cannot be copied through that region. Include the real pad footprint,
setting envelope, top cover, last links/crossties, splitting/bursting ties and
force development into the continuing post. Check both the small eccentric
north patch and the roughly53kN centred south duty. Retain the adverse160mm
case explicitly; do not use a gross kern as a substitute for this work.

The other named follow-on is **actual coupled wet-pad integration refinement**:
predeclare local normal-force and centre-of-pressure criteria, then extend and
verify coupled16/32integration or a correctly assembled clipped-cell/tangent
method. Keep the same physical laws, all52heads, post six-wrench closure, source
wrenches and matched reversal controls. Exact postprocessing alone is not a
replacement for the re-equilibrated result. Physical pad/material and durability
qualification remain separate from numerical integration.

## Capture provenance

All seven full responses below matched their exact current requests and58-source
tuple when checked. The short labels in the tables expand to these native names.

| Native case | Complete-response SHA-256 |
|---|---|
| wet-aligned-G135-Q2-rho27 | `42438532ef0fcfb384e8a6548b018369191ffb37a36d1183d83498b5acca1b36` |
| wet-aligned-quadrature8 | `d777a90115d02a8d6d40aa14405a346c2a14df2631ae33d299159c30eec56257` |
| wet-south-pad-north160 | `ea09506940b0dd573414889780880215386fed55c4c2f64fafd5db6fb02608fc` |
| wet-shifted-quadrature8 | `d240d4b38f62a4865c828ebd560ad82846b75b225f4839768da8c7831ed50a4e` |
| wet-zeroG-roof-suction | `ce2834a98ce4473115a42959dcf637ae01da2baa47471725bf8ff927e79a1608` |
| wet-heavy-roof3 | `1e6d0db881bc0a2916be6016359f2d882f3723b16642cc8565c849d497fe6295` |
| wet-aligned-concrete27 | `6b1e8976953099e8cea55e3c1c317c696ea58176c110ac582a842fb9a289f910` |

This is a completed bounded mechanics challenge with explicit open development
work. It adopts no pad material, reinforcement, floor thickness, whole house or
foundation resistance.
