# Wet post head — actual duties and graded upper-link comparison

Keep centred pads and the existing cage as the unselected development reference.
For the next local head study, compare a **10mm graded raise of the existing post
link levels**. It puts the highest cross-tie56mm below the head instead of66mm,
without adding steel, while retaining about6mm nominal analytical top-cover
reserve after the declared independent setting tolerances. Do not adopt this as
a post-head resistance solution. The pad material/contact, splitting/bursting,
bar development and complete signed demand still require their actual models.

The shared cage method now consumes the authored `postTopLevelRaiseMm` choice,
with default0 and explicit comparison domain0..20mm. It redistributes **every**
post-link level using the existing pitch rule; moving only the last level could
break the100mm pitch duty. CLI, saved document and API use this same generator.
A saved `set-wet-cage-top-level` edit preserves all other cage choices, can be
undone exactly and invalidates stale replies. An older serialized choice set
missing the new field is unsupported, rather than silently receiving a new
geometry. Explicit admission of20mm does not make its geometry pass.

## Actual head-to-post duties

The [replay receipt](studies/wet-post-head-duties-proof.json) consumes each of the
seven exact retained native inputs in the existing cage batch, verifying its
checksum and all58 native source bytes. It retains both actual six-component
end wrenches for every post and the parent full-response identity. The source
native solver is not executed by this postprocessor. This bounded replay is
separate from the full cage batch, which must be genuinely regenerated when its
method or versioned choices change.

At depth `z` below the head, transport the entire top wrench with
`r=(0,0,z)` and add the actual centred post body load. Thus
`Mx(z)=Mx(head)−z·Fy`, `My(z)=My(head)+z·Fx`, and
`N(z)=N(head)+q·z`, consistently in kN and mm. The transported base wrench must
close all six components of the actual opposite base end within1e−6kN/kNmm.
No arbitrary force factor, stronger material, hidden restraint or minimum axial
force is introduced. Piecewise-affine root finding retains both bending sign
changes and the finite3190mm actual post height.

The following depths are where the *gross affine full-compression condition*
first becomes possible. They are not D-region lengths, crack predictions,
concrete pressure capacities or anchorage proofs. A pressure resultant inside
the actual pad/post can exist even when this gross-section criterion fails.

| Actual control | South depth mm | North depth mm |
|---|---:|---:|
| Aligned4 |0 |176.914 |
| Aligned8 |0 |167.424 |
| Aligned, wet concrete27 |0 |187.264 |
| South+160,4 |None within post |87.689 |
| South+160,8 |None within post |87.384 |
| South+160, roof3 |None within post |214.279 |
| ZeroG suction |Unloaded |Unloaded |

Actual factored body gravity is12.5965125kN per post for wet25 and13.6042335kN
for wet27. These are recovered from the actual end-action difference and added
only as a distributed load between cuts. The25 case is not selected by this
calculation: its installed mass remains unqualified. The zeroG vectors retain
numerical residuals and are explicitly not applicable to a compression ratio.

## Compare actual upper cage geometry

The comparison retains the existing18 main paths and220 link/cross-tie paths.
Each post still has32 levels. Full independent path-pair, single-bar closure,
and exact source-solid-union cover checks are run independently for every
variant. The source main bars still terminate56mm below the head; moving a link
does not create a hook, bond length, bearing node or developed tension tie.

| Authored raise mm | Top perimeter depth mm | Highest cross-tie depth mm | Level pitch mm | Plane top cover before curve bound mm | Geometry disposition |
|---|---:|---:|---:|---:|---|
|0 |84 |66 |97.967742 |56 |Reference retained |
|10 |74 |56 |98.290323 |46 |Next local comparison |
|15 |69 |51 |98.451613 |41 |Small cover-reserve probe |
|20 |64 |46 |98.612903 |36 |Reject: two actual top cover failures |

The exact cover method also subtracts its interpolation bound: the20mm variant
has35.990389mm governing cover; its admitted setting is therefore a failed
adverse comparison. The15mm upper cross-tie has40.990389mm cover, leaving only
0.990389mm beyond the40mm requirement after the existing fabrication/setting
allowances. Prefer the10mm candidate when developing this local detail further.
The overall cage minimum remains40mm elsewhere and is not improved by this edit.

All four variants have the same explicit124.259755294kg steel and the same
source body geometry. This preserves the existing mass ledger, including its
unqualified plain-concrete upper bound, wire/chairs and existing grid steel.
It does not retrospectively qualify native bulk25, adopt27, or change any native
load/stiffness/contact law. Added reinforcement or changed bar development would
need a fresh quantity and actual native mass feedback.

## Evidence and next decision

`wet_post_head_duties.py` supplies the reusable six-wrench/finite-post screen and
is consumed by the existing cage `assess` result and method identity. Its own
bounded replay compares the four actual generated cages, preserving input,
settings and processing hashes. Tests include an independent cross-product
oracle, a shear-driven moment reversal, the actual wet27 and unloaded duties,
source/choice checksum rejection, complete geometry and the20mm cover failure.

This removes an inaccurate inference that a north gross kern ratio above1
means tensile pad traction or immediate head failure. It also shows that small
north axial load does not erase a local compression/anchorage duty, and that
raising the links alone cannot develop the H12 bar ends. Next, use the actual
coupled/refined pad traction patch and post-head wrench with this candidate
geometry in a local splitting/bursting and anchorage model. If that load path
cannot be developed inside the real head, replace the pad/head arrangement;
do not thicken the entire slab to hide it. No concrete, pad, anchorage, full
signed envelope, grid joint, foundation or construction acceptance is claimed.
