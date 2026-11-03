# RWT-06 — rainwater and a separate dry passage cannot both occupy this north loggia unchanged

**3 November 2026 — source-pinned architectural width counterexample, not a selected plan change or hydraulic/pedestrian approval.** The existing [surface-apron study](rwt-06-surface-apron.md) finds only 100 mm gross unused at the selected far edge, but does not price an explicit *usable* parallel passage or test it against the independent [outward-only roof load shift](rwt-06-outward-roof-rewind.md). This joined test does both. [Executable comparison](studies/court-water-people-envelope.mjs) and [five regressions](studies/court-water-people-envelope.test.mjs) read the exact selected HAD-B/MAT inputs through their already pinned source links; no dimensions, roof, material or water route are modified.

## The selected cross-section already consumes almost everything

The selected outdoor loggia occupies **x4800–7200, 2400 mm finished gross**, within the **3500 mm square court**. The insulated portal has **2960 mm rough span**, with **560 mm** difference to its **2400 mm** finished vertical-jamb passage. The current normal carrier occupies **400 mm gross**; an **existing 75 mm** separation divides it from the **1800 mm gross relief surface**. The three unused gross bands are only **25, 75 and 100 mm**. The 75 between water routes is not a safe dry pedestrian band.

To expose the architectural cost, introduce—not select—a **1200 mm *gross* independent daily pedestrian reservation**, alongside the full present normal and relief routes, with an additional **75 mm *gross* water/pedestrian separator**. Neither 1200 nor 75 is a statutory minimum, proven usable clear width, pedestrian barrier design or any claim about flood-safe passage.

| Required concurrent band | Gross mm |
|---|---:|
| Current protected normal route | 400 |
| Existing normal/relief separation | 75 |
| Current open relief route | 1800 |
| **New** wet/pedestrian separator trial | 75 |
| **New** independent dry pedestrian reservation trial | 1200 |
| **Total finished passage needed** | **3550** |

The **3550 mm** total is **1150 mm wider than the selected 2400 mm loggia**. It even exceeds the **entire 3500 mm gross court width by 50 mm**, before any wall, arch, support, guard, insulation, drainage edge, opening recess or weathering. If the existing 560 mm rough-to-finished portal difference were retained, the gross requirement would be **4110 mm rough**, **610 mm wider than the entire court**. That is a *local hard no-fit for this simultaneous straight-band proposition*, not a proof that no differently shaped, split-level, rerouted or larger courtyard could solve the problem.

**Reject a free 1200 mm all-weather passage beside the present split system.** Calling a cover walkable does not establish a safe route during opening, leakage or work. Calling the wet relief itself a walkway does not make it dry during a rare storm or common failure.

## A coupled roof and route rewrite nearly fits—yet still fails to earn acceptance

The independently studied [outward-only pitched-roof challenger](rwt-06-outward-roof-rewind.md) would redirect **47.8125 m²** of inner roof projection to the exterior instead of the court, changing the illustrative **216 mm/h** court stress from **3.60375 to 0.735 L/s**. That is not the selected roof, and the exterior collections gain **2.86875 L/s** of event duty. A low-pitch outward roof also raises the courtyard high edge, changes structure/daylight and requires its own complete weathering/product design.

**Only under that changed-source hypothesis**, test shrinking the *full-length* relief from 1800 to a new **600 mm gross** and retaining the separate 400 mm normal, two 75 mm separation bands and 1200 gross pedestrian band:

| Trial | Normal + gaps + relief + pedestrian | Remaining of selected 2400 gross |
|---|---:|---:|
| Selected inward roof, existing 1800 relief, 1200 new pedestrian | **3550 mm** | **−1150 mm** |
| Future outward-only roof, new 600 relief, 1200 pedestrian | **2350 mm** | **+50 mm** |
| Same future roof and relief, 900 pedestrian instead | **2050 mm** | **+350 mm** |

These are **gross widths**, *not* finished pathways. The +50 mm option cannot fund actual edge supports, guarded wet/dry separation, construction tolerances or a proven dry route without a redesign; neither +350 mm case can yet claim one. The existing **600 mm steep terminal chute is not a 600 mm full-length channel**: that substitution requires a physically new route, not a relabelled old study.

### The present roof cannot borrow the future smaller watercourse

At the same inherited roughness and 1% ideal comparison, a hypothetical unobstructed **600 mm** strip under the **full current 3.60375 L/s roof-failure** flow and **60 mm** debris dam has **−3.15 mm ideal separation** to the **unqualified −30 mm pan/DPC joint**. The necessary ideal stage already exceeds that vulnerable comparison, before inlet losses, splash or backwater. At the *future outward-only* **0.735 L/s** flow the corresponding ideal comparison becomes **+11.98 mm**—positive **not a hydraulic pass**, head allowance or first-leak qualification. The future route still must pass actual coupled inlet/obstruction/receiver states and direct rain, and a full-mouth blanket or high connected tailwater defeats both plan-width sketches.

## Architectural decision

The selected section **cannot contain all three as parallel independent bands**: current normal water, current full-width surface relief and a 1200 gross independent dry passage. The 2400 selected portal cannot be saved by a smaller chute at its outlet, a shallower pit, an unnamed “accessible cover” or a convenient assumption that the inward roof will not fail.

The only promising compact **plan-width** counterfactual combines *two coordinated source changes*: outward-only pitched roofing **and** a completely redesigned, physically separated smaller full-length court-water system. Even then, only 50 mm remains with the 1200 pedestrian reservation, so a real complete wet/dry enclosure and arch/support section will probably demand wider architecture or a different walking-route arrangement. The actual rejected source remains in force until a joined HAD/STR/MAT/ROF/RWT source can demonstrate daylight, support, material compliance, full-event performance, removable maintenance, independent flooding routes and true pedestrian clearance.

**Disposition:** Promote this as an explicit **architectural rebrief/rejection test** for RWT-06, not as a newly selected 600 mm watercourse, 1200 mm dry lane, roof pitch or permission to close the workstream. The actual site receiver/first-harm duties from [garden grade study](rwt-06-site-grade-envelope.md) remain independent. RWT-06 stays **planned** and RWT-07 stays blocked.

Reproduce: `node --test project/rwt/studies/court-water-people-envelope.test.mjs` (included in `npm run test:rwt`).
