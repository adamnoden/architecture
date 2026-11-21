# Seated wet-wall support — unselected mechanical successor

The current floor-section assembly now admits an explicit seated wet support.
It uses the original X2902.5 beam axis and original260×450 receiver cores.
The trial beam is250×350, RCtop3370/soffit3020, on10mm normal bearings over
finite RC posts terminating at3010. The actual south/north post axes are
8852.5/11512.5. The stale2815mm span and3050mm window reservation do not govern.
The active north-window1 arch projection begins at3135, leaving75.5mm from the
original finished post and65.5mm after a10mm relative setting comparison.

The beam begins at Y8782.5 to preserve the actual stair opening through8767.5.
Its north end and actual upper material extend to11737.5. A220×100 pad and one
combined10mm relative-placement bound fit both the beam and260×450 post.
The south pad position is an authored input; moving it within the real post
changes actual post eccentricity and beam work, rather than moving the post.

Both floor operators use actual axis-aware finite-member traces. The beam owns
its complete350mm depth; its RC200 strip and overlapping concrete band stiffness
are replaced once. The independent source steel chord remains explicit. The
original wet-column scalar fibres are removed, ordinary masonry is subtracted
from the complete reserved pier territories, and the finite posts carry their own
G even when the beam bearings open. Actual empty head recesses are retained as
voids. No infill weight, stiffness, friction, tensile retention or beam-column
moment fixity is invented. Finite post-base maps act on the actual contained grid
member, with full-footprint ground coverage checked before the attachment.

The existing floorSection input owns this option. Save/load and compiler outputs
use that same input; no second house source or stand-alone beam solver is added.
Normal bearing quadrature, pad offsets, beam dimensions and material controls are
explicit and bounded. Independent beam/post/pad G and beam-top Q ledgers check all
six source-wrench components. Added load does not masquerade as physical mass.

## Regenerated current-source result — 21 November 2026

The [eight-state full-native capture](studies/floor-section-proof.json) now
executes the unchanged RC200 control, matched1.35G/Q2/rho27 RC200/250 pair,
actual aligned support, south-pad160mm offset, four/eight-point bearing
quadrature, zero-G roof suction and exact restoration. The unchanged control
and restoration reproduce all312 current RC200 head components. Each capture
checks the actual request,57 source identities, full-result checksum and
independent all-head/source-material wrench balances before reuse. No local-only
predecessor result or exploratory number supplies this evidence.

The aligned wet support gives84.439256kNm/m raw floor demand against84.680040
without it under matched heavy controls. The south-pad160mm offset gives
84.456499; eight-point quadrature gives84.456379. The largest four/eight change
among312 head components is0.006976kN/kNm. The beam is therefore **not a cure for
the south floor peak**, and global numerical agreement does not qualify a pad.

The shifted south pad carries45.097602kN over its full22000mm² declared plane.
The north pad has only1342.416mm² compressed area and0.209115kN exact positive-part
normal force. Its eight-point force differs by0.005270kN, about2.52%; the
four-point result differs by0.014860kN. These exact integrals audit the declared
rigid beam/post planes and linear normal law. Every sample attaches to its
single beam station: actual beam-face/pad flexibility, spreader stiffness and
concrete bearing are **not** qualified by quadrature refinement. Both pads open
under the executed zero-G roof-suction challenge; no fictitious tension,
friction or beam-column moment restraint is added to rescue them.

**Physical wet-beam section demands remain unavailable.** Internal review found
that plate and membrane interactions enter the coupled work maps but their
interior application origins do not enter member-cut load recovery. The
6.550528kNm bendingY,1.904417kNm torsion and21.661068kN shearZ values are only
generalised FE action diagnostics. Do not use them for reinforcement, anchorage
or local joint demands. A separate simply supported1kN/1m analytical witness
shows the consequence: unrecorded interior mapping invents0.125kNm end moments
and misses the real0.250kNm midpoint moment. Recorded origins or an actual
attachment node recover the closed-form PL/4 result. Global equilibrium does
not discharge this missing local recovery.

The compiler emits `WET_BEAM_PHYSICAL_CUTS_UNAVAILABLE` and an explicit false
demand-availability field. A separately checkpointed successor aligns every
actual vertical/membrane attachment with a real beam section node and preserves
zero-work in-plane coordinates where no slab exists; it requires fresh native
replays before promotion. No result from that unfinished successor is used here.

## Fixed physical cuts and failed mesh stability

The [authored cuts](studies/floor-section-cuts-inputs.json) and
[ten-state comparison](studies/floor-section-cuts-proof.json) hold physical
sections around the same south-west L while the existing plate and membrane
meshes change. The shared compiler consumer integrates signed normal and
twisting moments and the separate absolute envelope exactly through each
element field, retains every aperture gap and the raw point peak, and rejects
ambiguous element-face cuts. It does not invent an effective design width.

| Worked wet-support mesh | Raw point envelope kNm/m | Y450 cut absolute integral kNm | X1450 cut absolute integral kNm |
| --- | ---: | ---: | ---: |
| Vertical1000 / membrane1400 |84.456|33.272|30.770|
| Both700 |75.109|34.028|30.980|
| Both500 |107.239|32.705|36.299|

The predeclared700→500 stability screen fails: the largest head-component change
is1.699700kN at P07 horizontalX, and fixed-cut component changes reach15.409%.
Near-edge absolute integrals change by about3.8–3.9%, but the farther cuts remain
unstable. Do not call the current corner/strip demand converged, infer a local
capacity from an averaged peak, or choose a whole-house thickness from it.
The conventional finite corner-transfer/local recovery must be resolved before
the necessary strain-compatible slab screen becomes a selection basis.

## Shared authoring and material interfaces

The existing saved `floorSection` stage accepts optional `wetSupport` and
`sectionCuts`; `set-wet-bearing-offset` and `set-floor-section-cut` use stable
assembly/cut IDs, explicit millimetres, revision checks, save/load and exact
undo. Unknown cuts, invalid geometry/units and RC250 with the unreconciled RC200
wet beam reject. The same CLI/API cut consumer retains its source identity.

Service-centreline checks now also inspect the actual replacement beam and post
solids. Removing their footprint from the plate mesh cannot hide their material.
The existing PV crossing remains a separate conflict; no new route, opening,
fire or withdrawal envelope is invented. The nominal room plans remain an
unchanged control, while dependent stair/finish/service evidence stays withheld.

The [computed wet-support floor view](studies/seated-wet-support-floor.svg) was
rendered and inspected at1200×1080. Its normal-receiving legend describes the
ordinary floor/core fibres; the wet-pad forces/partial contact are reported
separately above. It is a source-ground-zero comparison, not a transformed
raised-service-floor drawing or an accepted house revision.

The south beam-end run is short because of the stair. Actual simultaneous beam
N/M/V/T, force-shift, source bond/minimum anchorage comparisons, ordinary returned
bar geometry, shear/torsion, concrete bearing/splitting and local base/joint duties
remain to be worked. Low bending alone establishes none of them. Complete pad
material/contact, contact convergence, eight-bar post cages and anchorage, closure
at the actual north weather boundary, independent finish/thermal/air seams,
stair/carry and service installation remain explicit obligations. Existing
finish/stair/service evidence is withheld even at RC200 when this support changes.

No candidate, floor section, reinforcement, weather detail or whole house has
been accepted by this comparison.
