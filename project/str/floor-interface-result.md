# Named floor-to-L actions — simultaneous six-component interface demand

The existing complete native floor responses retain enough information to recover
all six components of the **floor-to-collector interface**. They do not retain a
complete joint free body or the actual upper/lower L member-end actions needed
to establish it. This work does not select the floor, corner joint or house.

The native plate response carries a mixed-coordinate reaction vector, without
named port metadata. Pairing its first twelve entries with corners by assumption
would make an undocumented array order into engineering authority. The new
metadata observer runs the **same source-bound builder** and stops immediately
before its nonlinear solve. It obtains the actual named ports, collector nodes,
origins and physical-point work maps. It executes no nonlinear solve and changes
none of the 58 native controlling source files.

The shared pure method joins those explicit plate port3-actions with each named
membrane port3-action. It translates the membrane force and moment from its
actual midplane origin to the actual collector node. Plate moments are mapped
through the native millimetre/milliradian coefficient rows before conversion
to kNm. The result retains the simultaneous signed six-vector on the floor and
its equal/opposite action on the collector, rather than combining independent
component maxima.

Actual physical plate points and named membrane displacements reconstruct each
collector's six rigid displacement coordinates. Their redundant trace equations
must agree, and actual port work must equal collector force/displacement work.
These are checks on the declared rigid interface, not evidence that real
concrete behaves as a rigid patch. Sources, complete request, case identity,
metadata method and full-response checksums remain explicit.

The [batch producer](studies/floor-interface-proof.ts) consumes the existing
canonical fixed-cut controls. It retains the exact cropped native inputs and
named metadata for reproducible replay; the parent full-response checksum does
not pretend to reconstruct omitted full bytes. Current700/500/250 and both
operator-separated comparisons preserve each collector's actual origin and all
six signed changes. No new stability acceptance threshold is invented for these
interface actions. The current/restored200 reversal is the unchanged control.

Missing whole-joint evidence remains precise: actual lower/upper L member-end
wrenches at the collector, their physical load origins, a closed control-volume
balance, local finite transfer geometry, reinforcement/development and complete
signed loading. The transverse-shear cuts are complementary evidence, not a
replacement for that missing free body. Existing mesh failures and the rigid
patch idealisation remain visible. Passing virtual work does not qualify the
local concrete, pad/contact law, foundation resistance or construction.


## Completed current-source replay — 22 November 2026

The current [receipt](studies/floor-interface-proof.json) now retains all16 actual controls and64 named corner interfaces. Each of the384 simultaneous six-vector components is derived from its actual source/request/checksum-bound native response and the same-builder port map. Maximum physical port/collector work relative residual is 2.160e-13 against the existing1e-8 limit; current200/restored200 gives exactly zero six-component difference. These are interface actions, not a complete joint free body.

The actual700/500/250 and both mixed-operator controls preserve each physical collector origin. Their six comparisons retain signed force/moment changes without inventing a new acceptance threshold. All source-bound fixed-cut/head stability screens still fail. No whole-floor thickness, finite corner, cage, pad material or foundation is selected.
