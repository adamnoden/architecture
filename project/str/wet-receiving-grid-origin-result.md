# Wet-post receiving-grid physical load origins

This continuation addresses the two actual members receiving the seated wet
posts: `GRID/rear-W/0` and `GRID/wet/0`. It adds no load, support, restraint,
stiffness, material resistance or selected house geometry.

The existing finite work maps preserve the global force and first moments,
but applying an interior load only through its equivalent end vector does not
recover a physical member's endpoint and internal section actions. The new
postprocessor separates characteristic body gravity from solved interface
forces. It records lower-body base gravity, free-top masonry gravity and
disjoint foundation gravity at the adapters that actually apply those loads.
It then recovers normal/body spring forces and the complete six-component wet
post-base wrench at their existing physical attachment points. Post self-weight
is already included in the recovered base wrench and is not added again.

Every recovered origin is checked against its actual finite member work map.
Completed adapter inventories, the full actual contact/post identities and
member force/moment equilibrium guard the bounded result. Equilibrium alone
cannot prove that all origins were recorded. Missing adapter entries reject;
an unsupported existing grid load family rejects; an unclosed member result
emits no physical cuts. Solved forces have factor one, while characteristic
body gravity receives its physical gravity factor exactly once.

The receiving members reuse the existing endpoint and analytic interior-cut
method. Point-force and point-couple jumps, source offsets, grid local axes and
all six wrench components remain explicit. Postprocessing must preserve the
existing native support reactions and applied loads exactly.

Nine analytical tests pass: a simply supported midpoint force recovers zero
support moment and `PL/4`; an eccentric six-component source preserves reactions
and the actual couple jumps; characteristic and already-solved factors agree;
missing source-piece, contact or post evidence rejects; malformed, duplicate and
mismatched work maps reject; both beam axes retain exact uniform gravity rather
than quadrature-point jumps; incomplete recovery still protects native reactions.
Together with the existing related tests, 38 checks pass. These are mathematical
controls, not whole-house evidence.

A source-bound shifted south-pad/quadrature-eight native witness, under the
guarded method checkpoint `d3506053`, retained all 52 heads and reproduced all
312 predecessor head components exactly. Its 901 origins comprise 448 solved
normal/body forces, 448 consistent body-base gravity shares, three physical
uniform foundation pieces and two full post-base wrenches. The independent
source-piece identities, gravity and first moments matched; the maximum local
member equilibrium residual was 2.274 × 10⁻¹³ kN/kNm. The full native response
SHA-256 is `5572d861325bd15f77abffc58d59cbe496a665d49746af086ddbd6d663e018c0`.
No producer receipt is promoted by this source checkpoint.

The helper is bound only through the actual floor-section wet-support path.
The subsequent import scoping ensures that non-wet lower-body/foundation paths
neither import nor execute the optional helper. Integration must add that helper
to the shared source binding, regenerate the final affected native evidence and
reconcile compiler consumers before promotion. The floor-section tuple changes
from 57 to 58 dependencies; non-wet predecessor source inventories do not gain
an unused helper input.

Even a closed executed-case member recovery supplies neither a complete signed
grid demand envelope nor a local three-dimensional joint, reinforcement,
foundation, pile or soil resistance pass. Those acceptance flags remain false.
