# Four-L joint demand recovery — development checkpoint

Owning packet: STR-FLOOR-PORTAL. Native reference: source58 at
`7a5e9635cff5a368e7d087afa7d030591cfce71a`. This isolated continuation does
not change a native source, select a house or accept a finite joint.

## Exact missing interface

The actual surviving wet-aligned-quadrature8 assembly contains246 frame
members; the existing physical-cut catalogue covers129. All eight members
incident on the four outer L floor collectors are absent from that catalogue:
`{SW,SE,NW,NE}/upper-wall` at their upper ends and
`JOINED-ROOF/upper-L/{SW,SE,NW,NE}` at their lower ends. The raw solver already
returns every member's twelve master-node actions. A new solver is unnecessary.

The lower cuts are at3170mm. The upper physical cuts are at3370mm although
their work-dual master remains at3170mm. Roof masters are also offset from
the physical L centroid and top; recovering actions directly at a master
would lose the physical cut moment. Both incident members' half-body G cards
must be subtracted from raw K.u before interpreting a physical traction.
Those L cards currently are not in `memberEquivalentLoads`.

`studies/four_l_joint_observer.py` wraps the existing builder, member creation
and solve boundaries in one dedicated process. It records the surviving
physical ends, actual applied collector cards, real floor work maps and raw
actions, restoring every hook on exit. It inserts no load or stiffness.
`studies/four_l_joint_recovery.py` is pure: it removes equivalent member loads
once, transports all six components in kN/kNm, reverses component/member
actions onto the joint and sums independently observed direct loads. Applied
cards are partitioned independently of the solved actions; no load is fitted
to make a free body close.

## Required verification before relying on the observer

Seven cheap pure tests pass: body-load subtraction/action signs, physical-cut
offsets, unit conversion and virtual-work conjugacy, all six components,
input change/reversal, unsupported topology/nonfinite rejection, and a strict
ordinary/observed full-result join. Actual observed and ordinary house runs
are deferred while the commander completes a memory-sensitive contact replay.
No actual joint equilibrium or observer passivity is claimed at this checkpoint.

Run the observer in a dedicated process, using the exact request and stable
case ID from the existing floor-section case producer. Execute the ordinary
control with `--ordinary`, then the observed run with identical input. The
pure `verify_passivity` join requires identical source/request/case identity,
full native result checksum, all52 heads and all existing physical cuts,
and recovered joint closure within1e-5kN/kNm. A stored sidecar also binds the
two new method files. The actual physical plate recovery independently checks
the observed net condensed reactions.

## Rigid joint material question

Metadata observed before any solve identifies the following full L footprints
between the actual lower body end3170 and upper body start3370mm:

| Corner | Union area mm² | Slab-depth volume m³ | Reference G at25kN/m³ |
| --- | ---: | ---: | ---: |
| SW |260400|0.05208|1.302kN|
| SE |260400|0.05208|1.302kN|
| NW |360000|0.072|1.8kN|
| NE |360000|0.072|1.8kN|
| Total |1240800|0.24816|6.204kN|

This is a potential material-inventory gap, not yet a completed whole-model
double-count audit. The floor cell builder excludes the L rectangles;
`_add_lower_l_weight` ends at3170; `_replace_upper_L_start` starts at3370.
Upper clear masonry excludes the same L rectangles and begins at the slabtop.
The formed court corner is a ground-level body at another location, and old
floor/finish GMAX/Q cards are removed; those are not replacement L joint bodies.
Complete the actual physical-body overlap and applied-card audits before
calling this uncharged G. No joint body G is inserted by this continuation.

The current admitted floor-section/masonry/roof cases have exact key sets and
no explicit joint-body gravity control. `FrameModel.load` and the physical-G
family can represent its six-component equivalent load, but the current
authored request cannot name it. Increasing an L member density would charge
other bodies. A future explicit source-bound authored control or versioned
adapter must name the body, density, physical origin and load combination,
then propagate it into the compiler and rerun dependent native evidence.

## Limits retained

A closed free body will establish demand under the existing rigid-joint and
source load assumptions. It will not establish finite joint shear/torsion,
diagonal compression, anchorage/development, local floor strip convergence,
contact/bearing law, reinforcement fit, foundation resistance or acceptance.
The bounded one-case result must precede extension to signed/adverse cases.
