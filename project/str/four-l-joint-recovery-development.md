# Four-L joint demand recovery — development checkpoint

Owning packet: STR-FLOOR-PORTAL. Native reference: source58 tuple
`f25a58d9e517a13fc7b04d52685a750e8d5ef9d43b579883ba55fb699e5e7d88`
on the `e0e70c8f` integration baseline. This isolated continuation does
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

Eighteen cheap Python tests and five focused Node tests pass: body-load subtraction/action signs, physical-cut
offsets, unit conversion and virtual-work conjugacy, all six components,
input change/reversal, unsupported topology/nonfinite rejection, and a strict
ordinary/observed full-result join, required numerical thread settings, full-byte
checkpoint preservation, and physical plate material attribution/edit/reversal.

One actual f25 wet-aligned-quadrature8 observed run completed190.03871618s.
It omitted the project's single-thread BLAS/OMP convention and is explicitly
rejected in `studies/four-l-joint-default-thread-attempt.json`. Its source and
request match the retained genuinely executed ordinary capture, but the actual
heads differ by up to1.48043e-9kN/kNm and full-result/physical-cut checksums
differ. Strict passivity FAILED; the tolerance is not weakened. Its four rigid
joint free bodies close within5.79919e-9kN/kNm and its condensed plate reactions
match actual physical recovery within2.26644e-10, but these numerical outputs
are retained experiment evidence, not admitted current joint demands. The
attempt retained the cropped observation and full-result checksum, not its
full result bytes. The observer now retains full bytes before comparison and
rejects missing/nonunit thread settings before importing the native builder.

The fresh matched1-thread observed run completed68.227935s. **Strict passivity
passes:** its complete15,331,498-byte native result is byte-for-byte identical
to the genuinely executed ordinary f25 capture. Both raw-file SHA256 values are
`e20abd0f305c963a250acd3e0857079dccc9ed851bf39e43b2e41bf531a6b5ff`;
both canonical full-result checksums are
`16f14bea7b3c08c10af3b60b21e14c8c2ef60a2687950afd0595ec775df66b4d`.
All52 heads and every preexisting physical cut match exactly. Source, request
and case ID remain identical; no hash-seed-controlled extra pair was needed.

`studies/four_l_joint_proof.py --write` verifies the actual complete ordinary
capture/manifest, observed complete bytes/envelope and actual Node admission
before writing `studies/four-l-joint-proof.json`. Its `--check` replays retained
observed inputs, pure recovery and source/method/witness joins without a house
builder. The crop does not reconstruct omitted full native bytes; missing full
captures require genuine reruns. The default-thread rejection remains separate.

The actual Node validator admits that same envelope: four rigid-joint free
bodies close within5.798782e-9kN/kNm and eight previously omitted physical L
end tractions are available. At the physical cuts, positive axial compression
and signed global moments are:

| Corner | Lower cut3170: N/Mx/My/Mz kN/kNm | Upper cut3370: N/Mx/My/Mz kN/kNm |
| --- | --- | --- |
| SW |155.596/−33.025/+23.332/−0.025|68.588/−40.026/+44.500/+0.148|
| SE |83.536/+23.211/−30.703/+0.200|56.579/−91.286/+68.647/+0.815|
| NW |109.172/+45.075/−27.168/−0.080|63.332/−69.351/+96.901/−1.533|
| NE |60.088/−0.002/−7.090/−0.182|50.905/−18.522/+20.579/+0.451|

These are member tractions with actual consistent body G removed once. The
proof retains both horizontal force components, exact physical cut origins,
member-on-joint actions, plate/membrane actions and direct collector couples.
They are one simultaneous1.35G/Q2/floor-density27/wet-density25 source-pressure
case, not a signed envelope or a finite joint resistance result.

Run the observer in a dedicated process with `OPENBLAS_NUM_THREADS=1` and
`OMP_NUM_THREADS=1`, using the exact request and stable
case ID from the existing floor-section case producer. Execute the ordinary
control with `--ordinary`, then the observed run with identical input, or use
an exact genuinely executed ordinary capture from the same source/request and
documented runtime. Supply `--capture-full NEW_PATH` to preserve both complete
results. The
pure `verify_passivity` join requires identical source/request/case identity,
full native result checksum, all52 heads and all existing physical cuts,
and recovered joint closure within1e-5kN/kNm. A stored sidecar also binds the
two new method files. The actual physical plate recovery independently checks
the observed net condensed reactions.

## Shared floor-stage integration — isolated candidate

`compiler/reference-house/current-design/structural-four-l-joint-adapter.ts`
is integrated into the existing floor stage in this isolated candidate. Five
focused Node tests pass without invoking a builder. The optional capability requires a
strict source/method/runtime-bound witness for the exact executed request;
untested nonwet/default200/250 and changed load/topology requests explicitly
remain unsupported. No authored stage field or saved-case shape changes.

The observer's `--return-native` mode returns the complete native result as a
canonical JSON string beside the observation and pure recovery. The adapter
hashes those exact Python bytes before parsing: JavaScript reserialization of
`1.0` or `-0.0` cannot establish their checksum. One existing native invocation
supplies both result and observed demand; no duplicate solve is introduced.
It validates current58-source/request/case identity, all52 heads, the method
and runtime identities, each derived component's original observed inputs,
six-component closure, no extra patch G and all unsupported capacity flags.

The existing stage now chooses this adapter only for the exact genuinely
admitted request and exposes `fourLJointDemands` plus diagnostics on its shared
result. Other requests retain the ordinary native path with an explicit
unavailable diagnostic. A dispatch regression proves exactly one selected
native execution and no fallback solve after an admitted observer error.
CLI, browser and batch already consume this stage; authored stage and request
schemas remain unchanged. Existing wet-bearing contact/cage wiring is retained.

The current binding includes the three method paths, proof producer and proof
JSON. Root must reconcile the existing source family, dependent projections
and review receipts before integrating this isolated candidate. The actual
envelope was re-admitted by the final Node adapter and the proof regenerated
from the same unchanged complete captures; no further house solve occurred.
No passivity witness was derived from the rejected default-thread attempt.

## Rigid joint material is already included — initial gap hypothesis rejected

The source-bound actual geometry identifies the following full L footprints
between the actual lower body end3170 and upper body start3370mm:

| Corner | Union area mm² | Slab-depth volume m³ | G at25kN/m³ | Actual quad8 plate G at27kN/m³ |
| --- | ---: | ---: | ---: | ---: |
| SW |260400|0.05208|1.302kN|1.40616kN|
| SE |260400|0.05208|1.302kN|1.40616kN|
| NW |360000|0.072|1.8kN|1.944kN|
| NE |360000|0.072|1.8kN|1.944kN|
| Total |1240800|0.24816|6.204kN|6.70032kN|

`studies/four_l_joint_material_audit.py` postprocesses the genuinely executed
ordinary full result and the source/request-identical observed footprint
geometry. `studies/four-l-joint-material-audit.json` preserves every attributed
actual plate-cell intersection (18/22/37/43 pieces for SW/SE/NW/NE), its area,
volume, G and physical centroid. All four footprints are covered exactly once
by actual uniform plate cells and match the upper L physical body areas and
centroids. The ordinary full-capture file SHA256 is
`e20abd0f305c963a250acd3e0857079dccc9ed851bf39e43b2e41bf531a6b5ff`.

The initial hypothesis misread the `rc_rectangles` contact-domain exclusion as
plate material removal. `build_vertical_rc_floor` excludes these rectangles
when creating ordinary ground-to-floor contact domains, while its plate cells
remain and carry their material G. Their boundary kinematics are rigid L port
maps; zero relative plate strain does not imply zero mass. The existing plate
self-G condensation and physical recovery already include this slab-depth G.

`_add_lower_l_weight` ends at3170; `_replace_upper_L_start` starts at3370, so
neither duplicates that slab-depth material. Upper clear masonry excludes
the L footprints (actual projected overlap0). The formed court corner is a
separate ground body. Old floor/finish GMAX/Q cards are removed. Actual
collector physical-G cards, after removing independently known lower/upper
member cards and actual condensed plate/self-G/free-upper-G cards, leave
numerical zero (largest residual vertical component1.42e-14kN).

No new joint body gravity control or load is needed. Adding6.204kN to a25kN/m³
control, or6.70032kN to this27kN/m³ plate control, would double-count existing
material. The recovered joint free body must leave own-patch G inside its
plate contribution. Any future explicit separation must subtract the exact
patch part from that plate contribution and add it once at its real centroid.

The existing wet25/wet27 quadrature refinements change only
`wetSupport.concreteUnitWeightKNPerM3`: at each16/32/64 order, every other
authored request field is exactly equal between that pair. All nine retained
requests keep the surrounding plate at27kN/m³ and upper/lower L members at25.
This is a wet-support comparison, not a whole-house density comparison.
The existing floor-section result describes the27 plate density as an
authored adverse trial, not an approved complete reinforcement takeoff. This
audit does not alter that density or resolve the actual concrete/steel account.

## Limits retained

A closed free body will establish demand under the existing rigid-joint and
source load assumptions. It will not establish finite joint shear/torsion,
diagonal compression, anchorage/development, local floor strip convergence,
contact/bearing law, reinforcement fit, foundation resistance or acceptance.
The bounded one-case result must precede extension to signed/adverse cases.
