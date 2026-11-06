# IAS — parallel lower waste release, unadopted reference

**6 November 2026 · WIP after PR1333 / main3170188c. IAS-03 remains incomplete.** This is a project-designed stock-part candidate, not a manufacturer shower trap, a Services source change or a selected installed assembly. It tests a specific next architecture decision: keep the pan stub and floor boundary fixed during lower-trap exchange, and give the removable lower module two parallel, same-facing connections. Do not revive transport sampling against the old unbound whole tray.

## Why change the joint arrangement?

The [current service contract](../mat/whole-house-service-baseline.md#whole-inventory-and-first-release) has authored orthogonal A/B interfaces and an unmatched zero-capture requirement. A conical union is not automatically that joint. With two parallel, same-facing union axes a supported module can in principle translate along both axes together; it does not require opposed retained pipes to flex or an undocumented diagonal escape from captured perpendicular seats. Actual cone disengagement, nut parking and tools must still be established. A loose nut does not prove separation.

The pan-only comparison deliberately puts a new fabricated outlet at2122.5/9452.5. That is not the unchanged Bette drain2012.5/9452.5. In this reference the welded upper stub turns north **below** RC and remains independently supported with the fixed half of the inlet union. The other fixed union half belongs to the retained downstream branch. Both detachable faces point north towards the removable module. Their bodies, nuts and wrenches stay below the slab: no reason exists to force the complete union through the97-clear sleeve. The actual pipe-to-sleeve water/air/fire/acoustic boundary remains a separate mandatory detail, including ultimate stub renewal and temporary closure.

## Native stock actually inspected

Sources checked6 November2026; dimensions are nominal and manufacturers warn they may change. No supplied revision or procurement is accepted. Native PDFs were downloaded, hashed and rendered; the numbers below were read from the drawings, not inferred from nominal pipe names.

| Part | Native evidence | Bound observation; unresolved point |
| --- | --- | --- |
| NERO UCBW24,1½ butt-weld cone union | [primary product](https://www.nero.co.uk/Catalogue/Fittings/Threaded-150lb-Fittings/BSP/Butt-Weld-Cone-Seat-Union), [native drawing](https://www.nero.co.uk/files/5633360e-19e9-47fc-aa52-67bc3d789ef7/UNION%20CONICAL%20BUTT%20WELD.pdf), p1, SHA256`7b19ab951d447aed3285c788a427725584669073e01818e620cba4910475f84b` | A51 overall, H18 nut depth, D48.26 weld end, S71.5 across flats;0.44kg; CF8M316. Neither51 nor18 is a separation stroke. No dimensioned cone engagement, permitted seat medium, torque or counter-hold surface identified. The[2019 manufacturer catalogue](https://www.nero.co.uk/files/efe3c4d4-b933-42e0-a076-aa6a00d6b0c3/Nero%20Product%20Brochure%202019.pdf) calls the butt-weld ends Schedule40; delivered bore/end correspondence still needs confirmation. |
| NERO BE24/4,1½ Schedule40 long-radius90 | [native28_10_24 drawing](https://www.nero.co.uk/files/fa89e919-b16b-4603-b53d-9008be5bc006/Butt%20Weld%2090%20Degree%20LR%20Elbow_28_10_24.pdf), p1, SHA256`36b32dcdedb275e192246a275b0b558909f3b368bddf63a24cf73c2be2cdedb1` | OD48.1, centre-to-end57.2, wall3.68,0.40kg. Use the actual57.2, not1.5 times48.26. The small48.1/48.26 nominal difference cannot silently become a qualified weld mismatch. |
| NERO1.5S40316W pipe | [primary product](https://www.nero.co.uk/Catalogue/Pipe-Tube/Nominal-Bore-NB-Pipe/316-Pipe-Sch-10s-Sch-40s/Nominal-Bore-NB-Schedule-40S-316-Stainless-Steel-Pipe), [native09_12_25 table](https://www.nero.co.uk/files/20e0fb34-918e-429d-b881-cf1c0a23186e/Welded%20Pipe%2009_12_25.pdf), p1, SHA256`049c2265361a5546f71fffb5f99dbf1345fa3dc20f795acab196660014288067` |48.26OD,3.68 wall,4.11kg/m; ASTM A312 welded316/L. Supplier cutting±1 does not complete a welded fit-up or manufacturing tolerance budget. |

The actual [Oilybits NERO-UCBW supply page](https://www.oilybits.com/316-stainless-steel-cone-seat-union-150lb-butt-weld.html) says the cone face requires paste or another medium despite having no rubber seal. The primary NERO drawing does not resolve that constituent or authorise dry reuse. **Do not label this a polymer-free joint or substitute dry tightening.** Material policy still binds the seat medium, thread treatment, welding residues and all retained supports. Alfotech0100279190 is a separate57-long/74-key/0.306kg alternative, not an interchangeable source for UCBW24 dimensions or instructions.

## One explicit dimensional candidate, not an installed drawing

All centreline points below have x2122.5. North means decreasing y. Use R57.2, upper horizontal inlet z2950, and proposed lower horizontal outlet **z2790**. The latter is12.625 above current T2777.375: it is a deliberate **new local apparatus/branch proposal**, not the current A/T/B contract. A source-owned connected branch and actual fitting falls must reconcile the return to the existing R01 path. No new slab hole is authorised.

The fixed upper90 has its horizontal weld end at y9395.3; the complete51-long union spans y9344.3..9395.3. The moving module's two weld-end planes are y9344.3, at z2950 and2790, with both identical unions orientated alike. This uses end-to-end envelopes; the native mating plane is not assumed to be the centre of the51 body.

| Module centreline feature | y / z, mm |
| --- | --- |
| Inlet moving weld end |9344.3 /2950 |
|154.4 straight ends at first90 horizontal tangent |9189.9 /2950 |
| First90 ends vertically down |9132.7 /2892.8 |
|180 straight ends at the first lower90 |9132.7 /2712.8 |
| Two90s form the bottom return; other vertical tangent |9247.1 /2712.8 |
|20 straight ends at last90 |9247.1 /2732.8 |
| Last90 ends horizontally south |9304.3 /2790 |
|40 straight ends at outlet moving weld end |9344.3 /2790 |

Four stock90s and394.4mm straight pipe therefore define the nominal removable pipe body. The minimum external north y is`9132.7−48.26/2=9108.57`; lowest external z is`2712.8−57.2−48.26/2=2631.47`. The nominal bore is40.90. The ideal standing-water depth is **134.4mm**, from outlet invert2769.55 to inner bottom2635.15. The nominal **water seal is93.5mm**, from that waterline to the bottom bend's internal crown2676.05, not to its invert. That substantial seal/retained water and four bends are actual cleaning, siphon/venting and hydraulic costs; a50mm commercial trap rating cannot be borrowed. No shower flow, self-cleansing, pressure or odour-seal acceptance is claimed.

Nominal dry pipe core is`4×0.40 +0.3944×4.11 +2×0.44 =4.10kg`. Charging the **whole** two union masses to the moving core is conservative for the nominal catalogue mass allocation, but does not bound delivered parts, welds, handles, supports or water. A340×120×40 tray folded from3mm sheet has ideal developed mass1.86kg before bend allowances/welds/fittings. A provisional **8kg complete handled allowance** leaves about2.04kg for water and omitted hardware above these nominal totals; it is a design requirement to verify by actual bill/weighing, not an earned complete mass. Pressure-pipe ratings do not rate the shower, welds, support or handler.

## First release and its measurable limits

Place that340-long cradle at y9098..9438, x2062.5..2182.5, with its underside2623:5mm solid saddles above a3mm floor give a nominal8mm contact separation to the body. Underside-to-existing panel top2595.375 is27.625, leaving only2.625 beyond the inherited25 air reserve. This is an explicit **unqualified tolerance deficit risk**, not permission to consume the reserve. The source-owned actual contacts, saddle shape, thermal/acoustic/material constituents and ordinary full installed tolerance still need binding. A flat catalogue tube cannot carry its body as though it were an invisible point.

The proposed event is: isolate/drain affected use; move the actual sofa/erect the qualified platform; open the800 hatch; support the whole module/cradle independently before loosening either union; counter-hold both fixed halves; park nuts; release the actual seats; translate module/cradle north30 to a positive supported rest; capture it there; transfer to demonstrated handles/support; then lower450 through the open hatch. Reverse with a new complete module, restore the actual required seat medium/torque, leak/flow test and close the finished panel before restoring use. Both fixed stubs and their supports remain. No slab/floor seal is opened by that lower-module event.

**Thirty is allocated travel, not manufacturer release data.** Qualify native required axial disengagement plus nut parking, adhesion, fitting/weld alignment and reserve within30 before claiming the first move. Nominal cradle after translation is y9068..9408, inside hatch9052.5..9852.5 by only15.5 on the north side; the union corners, real tools/supports and construction losses must consume that budget explicitly. A71.5 regular hex gives82.56 theoretical corners before tool and casting allowances. It is not a full wrench envelope.

The existing operator is south at2082.5/9677.5, head radius150/top2750. Keeping the module north avoids placing its main body over that head; this is a plan disposition, not an operator/force validation. The upper nut circle reaches about2991.3; a450 drop would put it2541.3,34.1 below the finished panel underside2575.375, **only for the nominal native core**. Actual hands, handles, fixed halves, rails and support transfer can still invalidate the sequence. Do not count an unsupported intermediate position as a successful first release. The cradle support, positive rest/capture and handover are not yet detailed/rated, so no event pass follows from these arithmetic clearances.

Ultimate union-half, fixed stub and pan renewal are separate interventions. A welded stub cannot be renewed by undoing the central nut. Protect the retained RC and floor boundary during a declared cut/weld/reseal operation; incoming four-part pan forming, site seams, slip/wear face and actual whole-basin retirement remain the duties in the [deck-deletion comparison](ias-03-shower-walking-deck-comparison.md).

## Current decision

Parallel same-facing joints remain a useful release topology to investigate, with an actual dimensional source now bound. **Do not select this four-long-radius-elbow module.** Its93.5 seal/134.4 pool depth, changed outlet/branch, near-exhausted panel/hatch reserves, incomplete support/first rest, undocumented cone medium/stroke and unproved hydraulic/renewal event prevent an ordinary accepted assembly. Compare a real more compact metal trap and source-matched unions against this candidate; do not optimise this geometry indefinitely or infer that all metal traps fail. No material exception, current Services edit, complete incoming route, physical pass, selected occurrence or IAS completion is introduced.

## Delete the lower module before refining it

A real simpler construction lead is [Kent's current floor-tray family](https://www.kentstainless.com/drains/drain-gullies/floor-tray-gully-kft600-600-kv215-110/): the manufacturer describes a gully welded beneath the pan, and specifically offers a simple trapped110 pipe outlet for upper floors to reduce coring. Its [industrial brochure](https://www.kentstainless.com/wp-content/uploads/2020/11/stainless-steel-industrial-drainage.pdf), printed10 / PDF page12, shows a bell gripping an integral upstand and lifting for cleaning/rodding. That distinguishes renewable internal cleaning/trap parts from rare fixed-shell retirement. It is not an assertion that the complete trap body is removed from above or that all constituents are disclosed.

This is an architectural/actual manufacturing precedent only. The600 kitchen/mop tray is not a1000 barefoot shower; its grating/support,65 industrial bell seal, performance and constituent claims cannot be transferred to an unspecified upper-floor110 version or a scaled project-designed cup. Its bare110 outlet already exceeds the current97 clear sleeve. The exact upper-floor body/neck depths, full first-moving part, seal recipe, sleeve/support and complete renewed pan/body/stub package remain unbound. A top-cleanable insert would not waive whole-body replacement or protect the RC by itself. Nevertheless, this lead deserves checking **before completing the four-bend/dual-union apparatus**: ordinary cleaning may not require that apparatus at all.

Two apparently compact stainless search leads do not supply a default material solution: [Dallmer ORIO161307](https://www.dallmer.com/en/produkte/161307_shower-trap-orio-select-stainless-steel-satin-finish-dn-50.php) explicitly has a polypropylene trap, and [BES25262](https://www.bes.co.uk/shower-waste-trap-1-1-2-40mm-stainless-steel-25262/) describes a plated-plastic cover and lists stainless as its colour. Neither a metal cover nor removable cleaning insert proves a complete metal assembly or whole-body first release. No external enquiry, procurement or mock-up has been commissioned.
