# STR-SPANS — primary floor and roof options

**Result:** complete at bounded option-study scope; ready for coordinated integration. No floor/roof system, member or revised house geometry is selected.

**Date:** 30 October 2026.

**Programme:** [Structural Architecture](structural-architecture-programme.md).

**Starting source:** `c32b66570d4a4946f8286fe4f0809fe225a0b495`; reconciled to current main `6d24ac888d55c85fd6db15f15208c93e1cea8929`, including the merged ground-water policy. Structural geometry is unchanged by that update.

## Bounded answer

The [option study](../../docs/research/structural-floor-roof-options.md) gives a manageable non-timber shortlist for the accepted house:

1. Develop short-way prestressed hollowcore floors using actual 150/200 mm product families, with heavy-wall support and exceptional framing resolved explicitly.
2. Develop a tied steel primary roof with the current 25° ring, actual wall supports and a located ceiling/roof-assembly boundary.
3. Retain an explicitly hypothetical 200 mm reinforced-concrete floor and a steel/mineral-panel floor challenger; use conventional timber as the honest prior control.
4. Retain an exposed 200 mm-rise masonry vault as the compression-led challenger, explicitly relocating services and the flat ceiling. Reject only its attempt to retain the current flat-layer arrangement within 350 mm. Concrete primary roofs remain a low-priority conditional challenger.

These are priorities for STR-HOUSE, not supplier acceptance, member sizing or adopted geometry. Necessary tension resistance remains explicit. The owner's compression preference is not recast as a universal safety or physiological claim.

## Material findings

The floor has only 260 mm after the held 20 mm finish, 55 mm service zone and 15 mm ceiling. Hollowcore 150 with a published 75 mm topping comparator leaves 35 mm for all remaining upper-interface functions; hollowcore 200 with that topping exceeds the budget by 15 mm before those functions. The complete section, including camber, impact isolation and fire protection, controls admission.

Published ordinary hollowcore selfweights of 2.40/3.10 kN/m² are compared with an expressly assumed RC200 weight of 5.00 kN/m². Simple strip reactions are diagnostic, exclude actual wall/occupancy loads and use source lengths, not selected effective spans. They explain a foundation/load-transfer consequence without inventing ground capacity.

The 300 mm vertical roof band is 271.892 mm normal to a 25° face. Primary structure, insulation, secondary support, drainage and covering cannot each claim that complete depth. The separate ceiling/storage representation is also constrained. No truss depth, roof covering or slate/hook system is selected by this result.

An ideal three-hinged parabolic arch under uniform load gives `H/W = L/(8f)`: at L3415 and rise200 mm, H/W is 2.134. With a hypothetical 102.5 mm crown thickness, retaining the present finish/service/ceiling functions produces a minimum 392.5 mm depth before additional fill/levelling. Real vault stability and asymmetric loads are outside that ideal comparison.

The exposed comparator changes that outcome: FFL3450 minus finish20, hypothetical crown fill27.5, crown thickness102.5 and rise200 puts the springing at3100 and crown intrados3300. Services/flat ceiling relocate. With rise500, the springing drops to2800. A declared constant-vertical-offset geometry gives average spandrel fill94.2/194.2 mm; its nonuniform loading is not solved by the separate UDL thrust ratio. This is a genuine STR-HOUSE challenger with support/service duties, not a designed vault or an implicit rejection of the owner's compression preference.

## Ownership and remaining work

STR-HOUSE must locate upper-wall support, the entrance arch/frame alternatives, stair aperture and trimmers, bridge, corner framing and foundation paths on paired plans. STR-MASONRY supplies actual wall and arch assumptions. The present study does not declare an unaligned masonry partition acceptable on any slab.

IAS retains complete renewable floor/ceiling/service interfaces. ROF/RWT retain the actual covering, secondary support, water, moisture/thermal and renewal assembly; STR supplies primary support/reaction/connection requirements. MAT owns installed constituent acceptance. Ground-floor and DPC/groundwater design remain linked to the current house policy and actual site; no pumped dry-section proposition is introduced.

Internal work can develop source geometry, layer budgets, support topology, access and original sensitivities. BCR/ER-STR-01 and EPR retain competent structural/load/fire/durability/temporary-works review. PHY should be applied to concrete unresolved physical claims, not used as a generic substitute for design.

## Evidence and validation

Primary literature inspected: manufacturer hollowcore and mineral-panel data, MPA/PFF floor and installation guidance, SCI roof/truss guidance and BIA arch guidance. Exact URLs, scope and dates are retained in the option study.

The [reproducible calculation](studies/span-envelopes.ts), [exact data](studies/span-envelopes.json) and [A3 comparison plate](studies/span-envelopes.svg) bind the arithmetic to four source-file Git blob hashes. The plate shows the complete floor budgets, actual roof envelope and both the retained-flat-layer and exposed-vault cases. It was rendered with Inkscape and visually inspected, including the exposed-vault section and all table labels.

Changed-boundary verification completed locally:

- `node --import tsx project/str/studies/span-envelopes.ts` generated the retained data and plate.
- `node --import tsx project/str/studies/span-envelopes.ts --check` confirmed exact regeneration, with accounting/equilibrium checks inside the declared model.
- `node node_modules/typescript/bin/tsc --noEmit` passed using the existing locked dependencies and Node 24.22.1.
- The four calculated blob fingerprints were independently compared with shell `git hash-object` output and matched; local Markdown links resolved; the owned diff passed whitespace checking.

The study hashes the actual source bytes using the Git blob header and SHA-1, avoiding an unavailable Node-to-Git subprocess in this environment. This produces the verified Git blob identities; it is not a replacement for repository or engineering checks. Exact-head repository CI and canonical publication preflight remain required at integration; no unrun CI result or merge is claimed here.

The current ground-water policy is reconciled: robust overbuilding, not three independent barriers or a literal multiplier. The earlier timber working documents are retained as prior controls; their selection priority is explicitly qualified in the study. Navigation and graph lifecycle reconciliation belong to the coordinated integration. No compiler house source, shared contract, existing BCR result, engineering acceptance or physical-validation record was changed.

## Exit and handoff

The packet earns its comparison exit: a reasoned shortlist, bounded rejected cases, complete depth accounting, source-backed mass diagnostics, a genuine compression-led section alternative, support/opening/restraint duties and a precise internal-versus-external evidence boundary. It does not earn selection of a construction system. STR-HOUSE must resolve the actual plan/support topology and full assembly fit; STR-RECONCILE must bind any preferred candidate to the affected IAS/OAS/ROF/BCR/EPR/PHY records.

Durable recovery checkpoint publication and final exact-head integration are managed by the coordinating worker under this packet's own canonical lease. No external appointment, procurement or construction commitment was made.
