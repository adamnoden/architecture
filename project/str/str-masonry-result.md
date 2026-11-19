# STR-MASONRY — solid walls and genuine arches

**Result:** bounded option study complete, subject to final repository integration checks. A reasoned shortlist and source-bound geometric handoff are provided; no house geometry, wall assembly, structural member, load capacity or foundation is adopted.  
**Source:** `RH-LAYOUT-REVISION-02` / `RH-LAYOUT-FAMILY-02`, refreshed against main `6d24ac888d55c85fd6db15f15208c93e1cea8929`; exact geometry source blobs are recorded in the calculation JSON. The merged ground-water policy is incorporated at its clarified scope.  
**Authority:** [STR programme](structural-architecture-programme.md), [structural brief](../../docs/reference-house/structural-brief.md), [parent issue #1103](https://github.com/adamnoden/architecture/issues/1103).

## Earned decision

Develop a role-specific solid masonry plan. Use **140 mm solid dense concrete masonry** as the first space-conscious general comparison, **215 mm bonded clay brickwork** for selected permanent walls and arch-bearing regions, and **190 mm solid concrete masonry** as an intermediate option where its product, constituents and construction earn it. The manufacturer evidence establishes real families rather than certifying their suitability here. The 190 mm family is documented historically, with current product/UK supply still to establish. Reject a blanket 440 mm rule and do not convert all solid walls into bearing walls.

Develop **genuine segmental arches** first, both inside and outside; retain **true flat/gauged arches** for suitable rectangular Georgian heads. Semicircular arches are a local comparator. A brick-slip assembly backed by a concrete or steel beam is the conventional control or an explicit exception, not evidence of the intended masonry arch action.

The preference for direct bearing and compression retains its necessary restraint, lateral, uplift, diaphragm and tie duties. An in-plane arch bridges an opening; it does not relocate a laterally offset upper wall. Every upper masonry enclosure needs support for its self-weight, even when it carries no floor or roof.

## Delivered evidence

- [Public research study](../../docs/research/solid-walls-and-masonry-arches.md): wall-role schedule; product-bound shortlist; supported leaf/load distinctions; segmental, flat/gauged and semicircular families; abutments, movement, construction, materials, fire/sound, services and renewable-door consequences; rejected cases and 11 primary sources.
- [Source-derived calculation](studies/wall-arch-envelope.ts), [JSON record](studies/wall-arch-envelope.json) and [A3 drawing](studies/wall-arch-envelope.svg): directly imported current geometry plus separately declared hypothetical arch/weight inputs. No compiler or house source change.

The common 20 kN/m³, 3.1 m high bare-wall screening gives line weights **8.68 / 11.78 / 13.33 kN/m** for cores **140 / 190 / 215 mm**. These are unfactored self-weight illustrations excluding openings, finishes and supported loads. With an assumed 15 mm finish on each face, each straight 10 m wall occupies **0.45 / 0.95 / 1.20 m²** more than the current 125 mm reservation, before junction overlap. No whole-house area total is claimed.

Retaining other envelope layers while changing inner leaves 140→190→215 gives overall wall depths **417.5 / 467.5 / 492.5 mm**, ordinary wing widths **3415 / 3315 / 3265 mm**, and west-gallery sensitivities **1015 / 915 / 865 mm** with the 2400 mm stair held. The loss occurs on both wing boundaries. Local thickening and a coherent replan therefore deserve comparison before blanket 215 mm walls.

The internal 900 mm `bed2-door` can be represented with a 2250 mm springing, 225 mm rise and hypothetical 215 mm radial ring, leaving 410 mm from ring crown to the relative 3100 mm ceiling. That is a useful spatial envelope, not an adequate arch or a clear-passage promise. Its 450 mm nominal side strip remains unproved.

The court-south 2400 mm opening merits a real inner-leaf arch as a possible receiving structure for the void-edge reactions at x 4862.5/7137.5. A 2250 springing, 600 rise and hypothetical 215 radial ring produces a 3065 crown: **35 mm below ceiling 3100, 65 mm below represented seat 3130 and 105 mm below framing 3170**. It requires a changed door composition; a 2850 springing with the same rise/ring reaches 3665 and does not fit. The source's 200 mm represented head depth and 250 mm door-head-to-ceiling interval are distinguished. No free cavity-tray or bearing zone is inferred.

## Conditions passed to the existing owners

| Owner / next decision | Required handoff |
|---|---|
| **STR-HOUSE / HAD** | Compare least-disruptive and replanned arrangements on paired floors. Locate every wall role, material/core/finish depth, opening and vertical support route; test actual rooms, four-bedroom programme, stair/gallery, service fronts and circulation. The shortlist does not place walls or adopt thicker envelopes |
| **STR-HOUSE / STR-SPANS** | Obtain actual floor/roof reactions, bearing widths, eccentricities and restraint demands. Develop the court arch with its edge-following frame or reject it for a reason. Demonstrate the full load path through abutments/returns to foundations. Recompute all arch clearances when the non-timber floor depth or seat changes; the present 350 mm package is not a fixed compatibility promise |
| **OAS / IAS** | Draw structural inner and weathering outer leaves separately, including arch/head, tray/closure, thermal and acoustic/fire transitions, replaceable mounts, services and first release. Masonry opening width/height is not doorset order size or usable passage |
| **MAT / BCR / MRA** | Apply the merged non-plastic damp-barrier policy: robust overbuilding with evidence, not three independent systems. Assess compression, shear, sliding and restraint at every DPC plane crossing an arch-thrust route. Retain constituent checks for mortar, ties, fillers, coatings, seals and adhesives |
| **ROF / STR-SPANS** | Supply actual roof support/reaction/uplift and movement demands to named walls. No roof form, covering or substrate selection is made here; no circular dependency on the final roof gate is introduced |
| **BCR / EPR** | Carry specific adequacy questions into ER-STR-01: finite ring under actual concentrated/asymmetric loads, bearing and crushing, sliding/overturning, effective abutments, out-of-plane restraint, movement, construction sequence and ground/foundation response. The known court-door conflict is bounded, not closed |
| **STR-RECONCILE / book** | Reconcile candidate geometry and affected earlier evidence through existing gates. Carry the earned lessons into Repose, permanent-opening/replaceable-door and G-01; retain the owner's felt calm as testimony rather than a universal physiological claim |

The court's nominal 550 mm strips and the internal door's 450 mm strip are geometry, not adequate piers. Temporary centering and staged loads remain part of the construction proposition. A generic referral alone will not close the court reaction conflict; the next house comparison must choose and explain an actual candidate route.

## Validation and limits

The study generator ran successfully and its `--check` reproduced the JSON/SVG exactly. A direct TypeScript check passed. The A3 SVG was rendered with Inkscape and visually inspected; the ring is a concentric radial construction, the illustrative skewback envelopes meet it, and the floor band is labelled as a reserve rather than a selected member. Source dimensions were cross-checked against the existing BCR geometry study and actual current sources. Primary references and their editions/applicability were inspected. Repository route/nomenclature and final exact-head health are coordinated by root before integration.

These checks establish reproducibility, legibility and source fidelity, not physical adequacy, product acceptance, statutory compliance or a construction instruction. The remaining engineering duties are specific to the nominated candidates; no unstated load, strength, soil capacity, price or service-life result has been manufactured.

## Execution provenance

Directed packet lease `a3f5f8b3-573e-4791-b3da-13ea6e526cf1`, generation 1, branch `work/str-masonry-20261030-a3f5f8b3`. Canonical transport acquisition and remote checkpoints were verified through the root relay after terminal transport failed and an initial connector attempt returned unconfirmed. No CLI acquisition is asserted. Root owns final publication, fresh canonical merge preflight, serial integration with STR-SPANS and lease release; this worker does not merge.
