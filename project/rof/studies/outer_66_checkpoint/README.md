# 66-piece outer inventory and independent hydraulic checkpoint

**Unselected. No ordinary renewal route, joined leaf hydraulic pass or complete native load closure is accepted.**

This package retains the full 80 mm support inventory and exact-root vector ledger. The 40/60 mm alternatives retain compact stock, stress and clearance summaries, plus the SHA256 of each complete generated receipt. The original 64-piece failure control is the already-published `../outer_physical_checkpoint/outer-module-inventory.json`; it is read directly and is not copied again.

The outer geometry and numbers are unchanged from the earlier full 66-piece private archive. Only the output packaging and generator self-hash change. There are 66 removable pieces per circuit on 64 nominal root packets, with 60 unique actual collector attachments per circuit and 116 across both circuits. The actual corner clamp is included in every load lever.

## Reproduce from the repository root

```sh
python -B project/rof/studies/outer_66_checkpoint/outer-66-pieces.py --repo .
python -B project/rof/studies/outer_66_checkpoint/outer-66-pieces.py --repo . --primary-spreader-depth 40
python -B project/rof/studies/outer_66_checkpoint/outer-66-pieces.py --repo . --primary-spreader-depth 60
python -B project/rof/studies/outer_66_checkpoint/outer-66-load-ledger.py
python -B project/rof/studies/roof_water_inner_highback_audit.py
python -B project/rof/studies/roof_water_inner_leaf_hydraulic_screen.py
```

Repeat each command with `--check` to require byte-identical adjacent receipts. All six generation and check commands passed at checkpoint creation. The two audit scripts also accept `--repo /path/to/architecture`.

To reproduce either omitted full control receipt, run the inventory command with `--primary-spreader-depth 40` or `60` plus `--full-control-receipt`. It writes `outer-66-pieces_40-full.json` or `outer-66-pieces_60-full.json`; its SHA256 must equal `fullReceiptSHA256` in the corresponding compact summary. Both complete receipts were generated and hash-checked before packaging. They need not be committed.

The stronger 80 mm support is the default full receipt, `outer-66-pieces.json`. Its small excess over one old root cap remains visible; it is not rejected merely to preserve that old scalar cap. The ledger reads that full 80 mm receipt.

## Concrete geometry

The opposed wet ends lie at the true normal and relief head stations±30 mm. Each half has an independent moving crossarm and a pickup connected to a retained spreader at its original root packet. Removing one half does not remove the other half's carrier. Both halves retain their actual bed elevation; no planar pan is invented across the original 30.25/51.5/57.5 mm discontinuity. A real two-entry head turn box is still required.

Primary head halves split the original 160 mm crossarm width into 80+80 or 120+40, all with 3 mm wall. Lower halves use 40×25×3 and 120×25×4. Rails and ribs butt into the crossarm and rail faces in a coplanar 25 mm grillage. This gives a physically possible 27 mm backing/carrier depth; it does not assume several 25 mm members can be stacked in that depth. The butt joints, local walls, torsion and miter-end details remain unverified.

The complete source 400/600 mm moving crossarm stock remains present, including its unloaded tail. Its radial envelopes are **160–560 mm primary** and **105–705 mm lower**, wider than the wet-pan polygons. Those tails enter the capture envelope and the actual mass centroid.

The folds are explicit new trial allocations of the existing developed sheet stock. Primary uses a 15 mm rear top down-hem, 25 mm front top down-hem and 20 mm front bottom down-return; lower uses 10 mm at each top edge. Head ends remain open, with a downturned copper termination and a supporting end rib. No transverse water dam is invented.

## Support alternatives and negative controls

The primary spreader is 25 mm radially wide, with 2 mm wall. Its depth is compared at 40, 60 and 80 mm. Each branch screen places the **entire original root's factored dry/water/wind demand** at either pickup. It does not use a favourable partial-body load to obtain the result.

| Primary spreader depth | Worst branch stress | Worst branch deflection | Least scalar root-mass reserve |
|---|---:|---:|---:|
| 40 mm | 244.59 MPa — fails 150 MPa | 2.546 mm | +0.570 kg |
| 60 mm | 132.91 MPa | 0.922 mm | +0.220 kg |
| 80 mm | 84.71 MPa | 0.441 mm | −0.130 kg |

The **80 mm alternative is materially stronger** and retains more allowance for the actual joint and eccentricity. Its 0.130 kg excess over the old south-primary root cap is a legitimate load-update candidate. Only a new combined native run with the complete material and load paths can admit that changed cap. Neither a small excess nor the favourable average kg/m is a substitute for that run.

The 80 mm primary beam stock sits 132.017 mm above the intact lower rim across its plan. An illustrative 50 native +8 lower +1 spreader +10 setting charge leaves 63.017 mm. The 60 mm version leaves 83.017 mm. These are beam-stock comparisons; the actual forks and collars need their own envelopes. A 100 mm lower-pan lift while radial overlap persists would fail that same clearance, so any later lift still needs the first radial-release gate.

Known removable mass is at most 18.330 kg primary and 25.966 kg lower. The installed stock comparison is approximately 46.47/44.58 kg/m for the 80 mm primary alternative. It retains the original fixed-stock schedule and adds the new support stock without credit for deleting the old fork. It remains a **stock comparison**, not a proven root load distribution.

## Exact load identities

The inventory contains 2,072 separately located removable material atoms. Each records its trial radial/along centroid, world XY coordinate, original root packet, actual clamped native attachment, and characteristic gravity force/moment at that attachment. New retained spreader/stub/height-step/collar atoms are separate.

The compact ledger independently recomputes every removable atom's `r × F`; the largest discrepancy from rounded input is below 0.000005 Nmm. It provides both physical Cartesian moments and the owning `Load.place` generalized `[down, down·dx, down·dy]` convention. It enumerates all local half-presence combinations, keeping the new support retained.

Both the nominal tributary station and the actual collector attachment are retained. For example, the lower north head packet is centred at along 11997.656 mm but its native attachment is at world[11667.5,11667.5]. That along lever is included. The first exploratory vectors that omitted this corner clamp are superseded by this checkpoint.

The ledger also gives independent water-at-source-depth and explicit floor-pressure vectors. It exposes the moment difference from placing the same known dry mass at the old R345/R397.5 source point. An independent 0–cap scalar mass at that old point does not automatically contain the changed vector.

## Explicit unresolved ledger

The original fixed roots, plates, gussets, apron stock and their receiving paths do not yet have a complete drawn centroid schedule. Their known mass stays in an **unlocated fixed-stock ledger**. No convenient centroid or favourable zero mass is assigned to close native moments.

The two adjacent seam half-shares account for stock only. A soldered or clipped seam can transfer vertical force and moment between two roots. Its real stiffness, retention and first-cut state need the actual joint detail. Longitudinal thermal freedom does not imply zero vertical moment transfer.

The primary pickup stubs cross the secondary skin at R146. Priced metal collars are included, but their rain-tight geometry and removal around retained roots are not qualified. Actual fixed support/facade contact, root torsion, retained wind area, corner pan continuity and all local butt joints remain open. No missing wall, lap or baffle wind is silently set to zero.

Contained roof and underlay reception before the first wet opening, a complete normal/relief head sequence, the full part/grip first rest and reverse installation remain unresolved. This checkpoint is a concrete input to that work, not its completion.

## Independent high-back hydraulic audit

`../roof_water_inner_highback_audit.py/json` independently reproduces normal depths by Newton inversion and graded spill by 9600-strip numerical quadrature. It reads the owning source JSON and geometry, but never imports the owner's hydraulic functions. Its input identity is the final high-back source SHA256 `d5b624a10bfd98ff1a462561f9feedf221600a0acba14fef648d48aef147b070` and JSON SHA256 `db7e7bf96777f7fe4421aa909260e00cd656861f94ff9ed5849ed11ea73cd627`.

For full inward 3.60375 L/s and 25 mm movement, the unobstructed primary normal-profile reserve is 5.079070 mm. Both blocked transport paths use 6500 mm. The primary/lower stored-depth comparisons are190.226227/210.019409 mm; the lower unknown-crest-shape comparator is 217.700425 mm, leaving2.299575 mm below the 220 mm water bound. The older160/6790/190 failures and original 20.304054 mm graded-spill control remain explicit.

The 5800 mm normal-profile coordinate is a reference parameter. Its 1 mm interval maps to 6500/5800 mm on the longest physical path, preserving the same bed and cumulative-flow endpoint fractions. The hydraulic fall0.004 remains below both actual edge grades. This numerical bound does not solve subcritical backwater or qualify inlet, corner and obstruction routing.

## Immersed leaf: conditional comparison only

`../roof_water_inner_leaf_hydraulic_screen.py/json` records the next owner-confirmed but unfrozen leaf geometry: primary q4375–4725, hinged wet plane q4618, hinge7200, fixed wet plane q4615/toe7080, normal toe nominally bed+75. The 0.7 mm leaf and 20 mm courtward ribs do not yet have a frozen net flow section or longitudinal rib schedule.

The screen uses two conservative full-depth parallel lanes and continuously bounds both the along coordinate and all residual-width splits. Conditional on 175 mm **net** residual width and common inlet/outlet levels, its normal reserve is 1.971896 mm and blocked storage193.986086 mm, leaving5.263914 mm at the rear after splash. Equal lanes are worst for blocked common-head conductance, but an unequal approximately 46/129 mm split governs normal depth plus maximum lane K4.

The single 107 mm front-lane control fails the normal screen by 15.750921 mm. Deducting a full-depth20.7 mm rib/sheet strip gives further failing controls; these deliberately pessimistic strips do not prove that the actual partly submerged hardware fails.

An assumed Cd0.6 under-leaf opening, with an **unearned**75−25−10=40 mm minimum toe gap, requires approximately 400/467 mm clear along length for one full-flow normal/blocked crossing. Two serial full-flow crossings require565/661 mm at each crossing. These are sizing illustrations, not an installed rating or proof of sharing. Actual inlet distribution, common levels, cross-transfer path, net width, ribs, ends and toe-to-bed relative movement remain explicit holds.

Whole-house support reconciliation remains an upstream hold. This bounded checkpoint does not admit the collector/jamb topology, the numerical spring comparisons, or a new combined global load case.
