# Services applicability during the floor/portal correction

**10 November 2026 — HAD-SERVICES-02 remains the completed, bounded architectural service selection. Current joined structural fit, support and movement applicability is withdrawn pending STR-FLOOR-PORTAL.** Historical services, structural and receiver completions remain part of the record; none supplies the missing connection.

The services integration is preserved at `a06013820dfdc2b5ee1918abf42abce8423eb0ad` (PR #1473). This read-only audit inspected checkout HEAD `97b2920999d250d976702f39bf46cdd11760b716`; the exact source bytes are identified below. The [owning service selection](inhabited-services-selection.md) retains its independent product, material, operating and site conditions.

## Why the structural applicability changes

The [floor/portal review](../str/floor-portal-interface-review.md) identifies a physical contradiction. SAP-C1's 205 mm along × 180 mm normal jamb continues through the floor, at q222.5–402.5. The actual 140 × 750 mm outer collector occupies q262.5–402.5 and Z3170–3920, with continuous concrete, flexural cages and separate plan chords. The portal model connects floor and jamb through normal-only keys while leaving tangential and vertical relative motion available. The membrane contains no sixteen jamb openings or collector bypasses. A receiver pocket cannot remove that concrete/cage continuity.

STR must resolve the actual connection and its gravity, stiffness, force and movement consequences. The service audit does not select either a monolithic connection or a bypass.

## Precisely what needs replay

| Claim and owning source | Current bounded result | Required replay after the correction |
|---|---|---|
| **21 formed holes and complete weather faces**, the 16 shifted openings, four new opaque heads and Principal Bath's retained head: `service-apertures.mjs`, `selected-service-interfaces.mjs` | Minimum formed-hole margin 31 mm at Principal Bath exhaust; minimum weather-face margin 25 mm at Ground-WC condensate. The calculation screens finite arches, full-height jamb bands and head borders. | Corrected concrete/cages, opening positions, head/frame support and jamb deformation. The screen contains no floor collector/bypass or joint kinematics. |
| **Six complete duct/support envelopes and kitchen safety-seat clearance**: `selected-service-interfaces.mjs` | Ground-WC / Utility / Kitchen support reserves 26.5 / 26.5 / 26.5 mm; Rear / Family / Principal Bath 36.5 / 26.25 / 31.5 mm. Actuator ceiling reserve 29.5 mm. Section undersides are fixed at Z3170 and Z6550. | Actual corrected section bounds, attachment positions and relative deflections. These small reserves cannot absorb an unmodelled downstand or moved support. |
| **Exterior renewal and roof separation**: `service-head-maintenance.mjs`, `inlet-maintenance.mjs` | The code fixes the lower carrier at Z6375, combined movement/body/setting budget at 48 mm, and leader inboard face at normal 1000. Upper stages retain 27 mm; Family Bath's moving face 31.95 mm; Bed4/Principal fixed inlet faces 32 mm; nominal stage-to-leader gap 50 mm. | Corrected coupled roof/support movement, actual retained roof goods and each moving task envelope. The constants are not live native movement inputs. Ground-supported tasks need the applicable roof-to-ground movement; roof-mounted interfaces need their actual relative movement. |
| **Receiving support and frame operation**: fixed heads/receivers, duct and actuator supports, `radiator-maintenance.mjs`, `purge-window-interfaces.mjs` | Captured radiator envelopes are 80 / 40 / 30 kg; the exterior stage task bound is 300 kg. Four purge operations, cartridge running gaps and fixed-glazing boundaries use the authored frame and room geometry. | Corrected anchor/substrate load paths and frame movement. Actual support admission was already open; the former normal-only connection cannot qualify it. Preserve the finite geometric controls at their recorded inputs. |
| **Occupied fit where structural geometry changes**: current-house compositor and fitted service/room sources | Radiators, bed/fridge positions, local releases, store route, room areas/volumes and heat-bridge allowances use the current footprints. | Recheck only the affected bodies, routes and numerical inputs against the chosen correction. Keeping the footprint can preserve static geometry; an inward bypass must earn its room-space cost. |

There is **no new direct port/collector collision in the unchanged geometry**: the highest complete ground face is Ground-WC exhaust at Z3140, 30 mm below the collector soffit. The lowest complete upper face starts at Z5350, 1430 mm above the collector. This preserves those static measurements; it does not validate the disputed connection or its movements.

## Explicit bypass collision control

The [provisional handoff](../str/provisional-house-handoff.md) reserves ±45 mm tangential travel. A 205 mm jamb therefore needs at least `205 + 2 × 45 = 295 mm` clear along the wall. The structural review's provisional ±5 mm normal challenge gives a 190 mm normal opening. A same-width 140 mm inboard bypass then occupies q407.5–547.5, extending `547.5 − 429.5 = 118 mm` beyond the existing finished wall face.

For a simple rectangular bypass band across that required 295 mm opening, the following exact world-coordinate boxes intersect selected radiator bodies. All intervals are in mm, ordered **X × Y × Z**; first-floor FFL is Z3450.

| Location | Provisional bypass box | Selected complete radiator box | Intersection dimensions |
|---|---|---|---|
| West jamb, along 9297.5; `rear-W` | `[407.5, 547.5] × [9150, 9445] × [3170, 3920]` | `[429.5, 629.5] × [9250, 9900] × [3550, 4150]` | **118 × 195 × 370 mm** |
| North jamb, along 10502.5; `principal-N` | `[10355, 10650] × [11452.5, 11592.5] × [3170, 3920]` | `[10165, 11515] × [11370.5, 11570.5] × [3550, 4150]` | **295 × 118 × 370 mm** |

Each dimension is `min(upper bounds) − max(lower bounds)`. The north normal conversion is `Y = 12000 − q`. The two along intervals are jamb station ±147.5 mm. These are counterexamples to this provisional bypass geometry. Its return beams, development, torsion, finishes and actual joints still need design; other bypass geometries require their own occupied-interface checks.

## Independent service results retained

This review found no new numerical disproof of the six-extract/cooker architecture, the 96-state airflow and fault-control comparisons, heating/storage and electrical duties, fitted water/WC inventory, DHW discharge first-stroke arithmetic, or the recorded local geometric failure controls. They retain their stated inputs and existing qualification boundaries. Changed room geometry, duct routes, volume or thermal bridges would require their affected input calculations to be repeated; the upstream structural correction alone does not erase them.

## Source and replay boundary

`deriveCurrentHouse()` records seventeen JSON inputs. Its structural inputs are `reconciled-house-interface`, `current-house-arch-movement` and `house-corner-rewind`; it does **not** directly consume `current-house-floor-stops` or `current-house-membrane`. A floor-topology correction cannot be admitted merely because unchanged services tests still pass or those three input identities remain unchanged.

The export says `structurallyAdopted: false` and `qualifiedPhysical: false`. Its `architecturalServiceSelected: true` retains the bounded service choice. The inspected `97b2920` source had `model.currentAdoptionBlockers = []`; that was never clearance of STR-FLOOR-PORTAL. PR #1476 subsequently records the incoming-water route and upstream-isolation blocker explicitly. Neither that water correction nor unchanged static service geometry supplies the missing structural connection. The canonical structural dependency and this applicability hold remain in force.

After the actual correction, reconcile the three consumed structural records with the chosen physical system, regenerate the current service schedule/drawings, and replay the affected current-house and OAS interface checks. Preserve the historical receipts at their original inputs. This note changes no numeric geometry, source selection, BCR/MRA scope or test framework.

## Historical inspected source identities

SHA256 values identify the bytes inspected at `97b2920999d250d976702f39bf46cdd11760b716`; this table is retained as that historical observation. The complete seventeen-input Git-blob map is retained in `current-house-services.json.sources`; it includes the room, plant, water and thermal inputs used by the compositor.

| Source location | SHA256 |
|---|---|
| [current-house.mjs](studies/current-house.mjs) | `6f983def825e3cd6b94e12410b8057fb902c62e28fe3365598a3d1ea69eef021` |
| [current-house-services.json](studies/current-house-services.json) | `fa820740d3c6b55917715945b158bc4ad1005ab80306fb3165b59c0136d31a84` |
| [service-apertures.mjs](studies/service-apertures.mjs) | `28a106b5cb11c18efd34137b9d141d9343652e89c33c0eaca4fcd312f4093358` |
| [selected-service-interfaces.mjs](studies/selected-service-interfaces.mjs) | `3bc73fb0cbe6682e185d4cb5a609ced042a181076f7dc8db8dfb1104803abb29` |
| [service-head-maintenance.mjs](studies/service-head-maintenance.mjs) | `76ac1926951222b3d49bced22cd519bfcf653cb473e2388540aff8ba13e0a2fe` |
| [inlet-maintenance.mjs](studies/inlet-maintenance.mjs) | `3fdbee67ac075206a9879552da6c9b76331049109eb1e3bfd1ca8cb6b93c5527` |
| [purge-window-interfaces.mjs](studies/purge-window-interfaces.mjs) | `743087477e9c553f40cd471147e68f572b26539e3e994d5044626a72632123ec` |
| [radiator-maintenance.mjs](studies/radiator-maintenance.mjs) | `6789ebdb5a35213d824f91bdbde0ddc49b0483d401c60113f207882842d7edf9` |
| [reconciled-house-interface.json](../str/studies/reconciled-house-interface.json) | `ae17f6de977de58ae54f25edfc67c48c36f348cffc288e839f25a8b4143c16cf` |
| [reconciled-corner-portals.py](../str/studies/reconciled-corner-portals.py) | `a0c158fbff68bc250e6ab64ab6251cc396abc7efb6ef3f398325629e678b92bd` |
| [current-house-floor-stops.json](../str/studies/current-house-floor-stops.json) | `c34062f32e3aea595a27366c509a821f5d328cbc9a8499c7857ff0184568a8ad` |
| [current-house-membrane.py](../str/studies/current-house-membrane.py) | `1602b0dec2cd69fe0b142a64052ff76f57cf5f045ea6d8924efa51c27d3c1a5e` |
| [current-house-arch-movement.json](../str/studies/current-house-arch-movement.json) | `dd585adfcb76aa45f14b70f8c230a4a53f8a1cc956152ef777fee9b2628c8443` |
| [house-corner-rewind.json](../str/studies/house-corner-rewind.json) | `0a927d781097f01693195bae56712204abd8d5c6d7335a56038d3ea3d26007a1` |

## Joined current-source observation — 11 November

The join of the published `f7942830` roof checkpoint and main `b0f3ffd5` retains PR #1476's two internal-water duty corrections and its inlet adoption blocker. It does not adopt a replacement inlet or alter the static service results recorded above. The water investigation guards the original physical boundary while normalising exactly the recorded roof-source identity changes.

| Current source | SHA256 |
|---|---|
| `project/had/studies/current-house.mjs` | `d4aaa78821f1fea4da3412a3d780fe3f30b2f852e76bb29abcc744e0e41443dd` |
| `project/had/studies/selected-water-duties.mjs` | `833347613d0c80d870b21632b069ee63a2f2be183428828d6d903a65561d5c00` |
| `project/had/studies/current-house-services.json` | `fa820740d3c6b55917715945b158bc4ad1005ab80306fb3165b59c0136d31a84` |

The historical fourteen-entry table is not overwritten. Its former empty blocker list and producer identity must not be read as the current source. After STR-FLOOR-PORTAL, replay the affected geometry, supports and movement against the adopted successor; these metadata reconciliations earn no structural pass.
