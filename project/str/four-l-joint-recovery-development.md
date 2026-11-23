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

## Browser numeric transport — retained production rejection and repair

The first fresh production call for`BROWSER-WET-CAGE` failed the unchanged
observation fingerprint. A direct Python replay with that label passed, so
neither cached-envelope admission nor a Python-only labelled replay qualified
the production boundary. The exact Node call was repeated with an
`execFileSync` interceptor that saved its actual stdout before admission.
It failed again after65.707s. The original and repeated rejection remain
negative evidence; no physical tolerance was changed to erase them.

Only four observation fields differed from the original proof:

| Field | Original capture | Actual Node/browser transport |
| --- | --- | --- |
| Case ID |`wet-aligned-quadrature8`|`BROWSER-WET-CAGE`|
| Complete native semantic-byte checksum |`16f14bea…66b4d`|`03ab8d2a…44f4`|
| Python request-byte checksum |`04e0d748…5dea4`|`83439025…66fc`|
| Python cut-byte checksum |`cf536736…9cfe`|`1ced3b05…b7ed`|

JavaScript serialization changes numeric JSON spelling such as290.0→290.
All actual request values and all four native cut catalogues were
semantically identical;252 cut metadata numbers changed Python numeric type
spelling. Every raw L action, component, port/work map, head and recovery
diagnostic matched exactly. The four-catalogue semantic fingerprint was
`b08f7ec3624385cbcd406e7db7ae7e0ecd13c0905faa1a38840133a0d7c84648`
on both captures. No nested case label was found in the cuts.

The captured failing stdout SHA256 is
`1f1b2438350336b12cd99ad3e66b05f172e1b5406ad558d58d9e18badacd74f6`.
Complete stdout/native JSON, exact incoming request, command environment,
failure trace and exhaustive field/type differences were retained under
`/tmp/four-l-production-intercept-20261122`. The original failed production
log remains at`/tmp/convergence-fresh-joint-case-label.log`.

The repair treats the four channels above as representation/label metadata
while fingerprinting the entire semantic request and every physical observed
value without rounding. The existing pure Python postprocess independently
checks both Python digests against the **exact native JSON string** before
recovery. The current proof now also retains a lossless compressed crop of
all426 existing native cut rows (258member ends,140interior cuts,8caps,
20adjacent-grid cuts), verified from the original complete ordinary capture.
Its decoded hash must equal both stored original physical-cut controls.
Fresh native cut values must match that trusted crop semantically and exactly;
changing a native cut plus recomputing its opaque/full checksums still rejects.

The original and captured rejected envelopes both pass repaired postprocessing
with unchanged physical numbers. Nine Node tests,20Python tests and TypeScript
checks cover numeric-spelling transport, altered request/cut/hash negatives,
complete pure recovery and balanced raw/derived tampering.

Two subsequent **fresh complete production** calls to
`runFloorNativeWithFourLJointCapability` with the exact admitted request and
`BROWSER-WET-CAGE` label passed serially in66.248s and66.344s. Each executed
one actual observer child, returned52 heads and4 joint free bodies, and made
zero ordinary-fallback calls. Both child stdout files were captured before
admission. Their bytes were identical to each other and to the genuinely
rejected pre-repair stdout: SHA256
`1f1b2438350336b12cd99ad3e66b05f172e1b5406ad558d58d9e18badacd74f6`.
The complete native string SHA256 was identically
`03ab8d2aa8f2ae105e7d338db878d9c6772cfcd5a135f0b1b88b417d5deb44f4`.
Thus the repaired admission accepted unchanged physical data; neither fresh
solve needed different arithmetic or relaxed physical comparisons.

Both executions used the production one-thread BLAS/OMP environment with no
`PYTHONHASHSEED` override. Exact incoming request, command environment,
stdout/native JSON and per-call reports are retained under
`/tmp/four-l-production-repaired-20261122`. The matched trusted/incoming
observation semantic fingerprint was
`27fa2953caa0e1211b13927e767d3891a608a67053d91f7a620e7cc495cd7873`.
This validates only the bounded exact-request capability and browser numeric
transport. Signed demand-envelope and finite-joint capacity flags remain false.


## Interrupted prepared-load continuation — recovery checkpoint

The separate follow-on worktree `/workspace/scratch/ae142320334c/floor-prepared-load-solve`
on `work/floor-prepared-load-solve-20261122` began from checkpoint
`ee7a52d16426bc3af33d1dab72c0ce2d75944535`. Execution stopped when the
workspace became unavailable and the exec-server disconnected. This section
records unfinished implementation, not validated house behaviour.

The prepared extraction was **not committed or published**. Its known local
source deltas were:

- `project/str/studies/perforated_floor_condensation.py`: existing compile
  delegates to prepare/load functions. Preparation preserves the original
  geometry/pressure coordinate-allocation order; subsequent cards assemble a
  fresh combined RHS in the original loop/card order and use the existing
  reduction. No separately summed response or load-only energy is used.
  Retained source, work maps, physical matrix and numerical factor are sealed;
  unsupported new work coordinates reject. Results are detached from held data.
- `project/str/studies/perforated_floor_sparse_test.py`: three new cheap tests
  cover both existing Python/SciPy backends, exact fresh/reused reversal,
  combined cards, zero and restoration, forbidden assembly/factor calls on
  reuse, source/matrix/unmeshed-boundary rejection, and input/result isolation.
  Fifteen cheap receiving/condensation tests passed before the final factor-seal
  addition; all three new tests passed again after that addition. No full
  physical house test was run.
- `project/str/studies/rc_floor_house_loads.py`: intermediate extraction of
  fresh source P1/open-portal cards and a lightweight pre-A receiver metadata
  snapshot, containing no stiffness or solved state. Syntax compilation passed.
  **Known semantic defect awaiting correction:** the moved
  `native_house_pressure_cards` water lookup still uses
  `source['joined']['floor']['retained']`; its actual parameter is
  `floor_source`. Fix this before any builder execution.
- `project/str/studies/floor_section_successor.py`: intermediate switch to
  prepared membrane/load APIs and retention of the prepared operator on the
  internal model.
- `project/str/studies/floor_section_model.py`: intermediate split into
  `prepare_floor_section` and `solve_prepared_floor_section`, with ordinary
  `run` delegating through them and deep-detaching each result. The last command
  to install the required `_PreparedFloorSection` and
  `_apply_prepared_loads` helpers failed to create its process when transport
  disconnected. Treat these helper definitions as **absent/unverified** and the
  intermediate file as not runnable until actual files are inspected.

No full builder, house solve, reused native batch, new-source tuple receipt or
capacity/envelope claim was produced. Existing f25 receipts must not be rehashed
to this changed method. The native closure count can remain58 because only
existing native modules were edited, but its tuple and the earlier floor-only
ancestor tuple necessarily change. All actual affected evidence must be
regenerated after the refactor earns validation.

The continuation must recreate all variable nodal/member registries from fresh
cards, retain only geometry/material/operators and immutable physical G, rebuild
both actual P1 and P2 from each of all96 programme identities, and use the existing
roof surface API. The actual pre-A load receiver must preserve the existing
unqualified nodal-envelope route, rather than applying legacy pressure functions
to deleted nodes or claiming new finite A-post pressure recovery. Each contact
solve must start and re-equilibrate normally; no active set or solved response is
reused. Runtime source and matrix/work-map checks must precede/follow each case.

Before any384-case matched programme, demonstrate full ordinary/reused result
parity on **the same genuinely new source** for W31 → W7 → W79 → aligned
G0/Q0/roof-suction → W31 restoration, preserving complete outputs and source,
request, runtime, all52 heads, all physical cuts, source wrench and passive joint
recovery. The programme remains a bounded declared comparison: +6.3kPa is not a
physical wind bound, unmodeled roof background G/patterning remain explicit, and
no local joint capacity or whole-house acceptance follows.

## Complete native-state admission — 23 November 2026

Recovery review reproduced an integrity gap: changed mass or bending fields could
pass admission after an opaque full-byte digest was recomputed, while trusted
heads, cuts and joint observations were unchanged. The adapter now also requires
the complete ordinary native semantic control. Only the actual caller's `name`,
`caseId` and exact floor-view caption are normalised. All other physical fields,
loads, reinforcement, roof/masonry fields, diagnostics and drawing geometry stay
bound. Numeric JSON spelling remains representation, without rounding physics.

Fresh ordinary and observed executions on the unchanged native58 source, with
both BLAS/OMP thread counts one, produced identical complete native capture
bytes. The owning producer verifies those captures and actual Node admission;
the updated retained proof records the complete semantic control and capture
identities. The four joint residual maximum remains 5.798781899102323e-9 kN/kNm.
Eleven focused Node tests include invented downstream-state rejection after
opaque hashes are recomputed, exact numeric transport, consistent caller
relabelling, stale inputs and unchanged ordinary behaviour. Python producer
replay independently joins its current method identities. This closes a
specific admission gap; finite joint resistance and signed envelopes remain
unavailable. No slab thickness or whole-house baseline is selected.
