# Executable occupied services, water and inlet routes

[25 mm narrowing comparison drawing](studies/court-intake-25mm-narrowing.svg)

The explicit current design drives the selected occupied-services schedule, selected water event and the named comparisons below. Each input identifies its object, design and method source. Trial results carry their own case identity and applicability.

The selected source supplies the intake at X6125, its credited Y6950–7175 and Y7275–7375 openings, the quiet-stage allocation and the existing assigned flow. The case stores the exact plan and RWT binding identities. It may narrow the credited intervals or lower the quiet-stage comparator. It cannot move the port, bridge the known excluded gap, add opening length or raise the allocation. The loss option is one of the existing RWT event sensitivities. The native `mouthFlow` and `mouthStage` methods retain the actual source-grade relation.

The same admitted intervals feed the capacity calculation and the local 1:10 diagram. The diagram shows the two selected source openings and overlays the trial openings at their actual station. Every stroke cites the bound plan and selected RWT inputs. The result records the input case digest, method and source identities, and the remaining nominal capacity. An empty route is blocked. If the allocated quiet stage cannot carry the assigned event, the result gives its capacity shortfall and withholds a required stage above that allocation.

## Reproduce the case

From the repository root, export the versioned request from the explicit current design. Edit the request's `intake.route.intervalsYMm` for a narrowing trial and run the same adapter.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --read-court-intake - > intake-case.json
node --import tsx scripts/compile-current-design.ts --court-intake intake-case.json
```

## Evidence and scope

| Case | Active width | Capacity at the allocation | Required stage within the allocation |
| --- | ---: | ---: | ---: |
| Selected openings, K = 1 sensitivity | 325 mm | 4.12928 L/s | −39.42661 mm |
| Trim 25 mm from the first credited interval | 300 mm | 3.80572 L/s | −36.81988 mm |
| Both credited intervals blocked | 0 mm | 0 L/s | Unavailable |

The selected replay matches the native RWT event's K = 1 result. The trim changes the calculated capacity, required stage, case digest and actual trial stroke while preserving the source apertures and binding. The blocked case draws no trial opening and produces no positive credit. The tests reject a bridged gap, a stale binding and a raised quiet stage. The native selected-event JSON/SVG and historical output checks still reproduce.

The quiet-stage comparison addresses an ideal critical-section sensitivity. Real approach and capture losses, first wetting, installed flow, survey levels, site disposal and full-network operation remain open. Port relocation and physical crest reprofiling need an explicit supported method and revised source.

Verify the retained witness with `node --import tsx project/ccr/studies/current-projection-witnesses.ts --check`.

## Current fixed-entry candidate

The default saved engineering document now emits `fixedInlet`, with the actual authored sill insert and fault stages. It runs the joint-free sloping lower tubes, matched ordinary valves, independent closed access hoods and light cold-renewal modules through the same current compiler and CLI. The [complete candidate and proof limits](../had/fixed-inlet-entry-candidate.md) distinguish its geometric result from unresolved support, thermal, material, tool and installed evidence. No selection or occupied acceptance follows.

The Y600 riser case includes the actual 2 mm wet-cell lining and 5 mm setting. Y605 fails that same boundary and remains an adverse regression. A 20 mm riser edit changes the actual paths, drawings and result identity while the upstream fault case, nominal plans, occupied-service schedule and water event retain their own source. Opening a control hood rejects passive source-fed fault containment. Missing explicit saved sill/fault stages, stale methods and injected approval reject.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --read-engineering - > engineering.json
node --import tsx scripts/compile-current-design.ts --bundle engineering.json
```

The rejected loaded-carrier arrangement is removed from this default. `--read-retained-inlet-comparison` and `readRetainedInletComparisonDocument` deliberately preserve its adverse, source-bound replay. Existing saved carrier documents remain explicit comparisons; they cannot substitute for the fixed-entry stage.

## Retained adverse carrier witness

The [raised plant section](studies/inlet-plant-25mm-raise.svg) is regenerated through `readRetainedInletComparisonDocument` and `compileEngineeringDocument`: the retained source plant leg is raised by 25 mm while its sill, faults, removals, split roofs and pressure endpoints retain their saved identities. The witness command verifies the route rejection; this is not the default fixed-entry proposal.

## Reproduce the indoor reference and earlier south comparison

The retained carrier witness uses its explicit saved comparison and [assembly rejection](../had/inlet-assembly-convergence.md), with sill axes X10080/X10285 and Utility riser Y580. The earlier two-scope adapter below preserves the indoor reference and bounded older south comparison; its X10500/X10645 ports are not substituted for the current fixed-entry candidate.

The earlier inlet adapter takes explicit `had-inlet-route-request/1` documents and validates the current design, case and binding identities. It distinguishes the **current indoor cabinet reference** from the **conditional south development**. It runs the native finite-bend, path separation and segment-to-box methods against the respective branch polylines and current bowl sweep. The two reference cases reproduce the respective native pipe-pair separations. Retained wall ports, installed pipe envelopes and the trial plant level appear with source identities in the result and coordinate-derived section.

| Case | Utility-to-plant clearance | Outcome within this calculation |
| --- | ---: | --- |
| Current indoor, nominal source convention | 185.99 mm | Clears the screened comparisons |
| South branch at Z2610, 10 mm setting allowance | 31.23 mm | Clears the screened comparisons |
| South branch raised to Z2635, same allowance | 6.29 mm | Blocks the route pair |

The south plant height edit moves the three vertices of the actual horizontal leg between its riser and the climb to the inherited high crossing. It preserves the source strokes, external wall ports and upper endpoint. A 25 mm raise moves the trial section and changes the calculation and case identity. The earlier case rejects stale geometry, scope substitution, port relocation and excursions outside the ±50 mm comparison.

The active input is the revised hot H0 route from the dry-bowl producer. The earlier path gives **15.99 mm** cold-to-hot after the south allowance. The actual revised hot path gives **40.19 mm** and the exposed terminals maintain **46.91 mm**. Moving the cold drop alone west 15 mm raises the active upper clearance to **50.34 mm** and keeps **46.91 mm** at the lower hot/cold pipe comparison. The moving washer, bowl and rail minima then remain 88.23, 182 and 403.65 mm respectively. Both the forward sink break and the washer stop stay fixed. Keep the sourced cold drop. The alternative adds change without improving the governing combined pipe clearance and still needs its own fittings, tools and retained support. An object-linked diagnostic preserves the earlier hot result as an adverse comparison.

From the root, read the two cases and run either as a separate request. The command accepts stdin in both modes.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --read-inlet-route -
node --import tsx scripts/compile-current-design.ts --inlet-route inlet-case.json
```

Both cases carry their source outlet or sleeve limits. Thermal protection, actual controls, fit, pressure containment and surveyed receiving remain in HAD's physical scope.

## Vary the east ground receiving level

The current route calls the native receiving solver with the actual RWT geometry, MAT dock and selected flow duties. Dropping the terminal comparison from Z−1600 to Z−1620 changes the full low-lane required head from Z−1571.67 to Z−1582.24. The half-lane remains crest and bed controlled. The same request moves the scaled tailwater line. A raised receiver at Z−1599 or a depth below the native subcritical domain gives no result. Missing current MAT source also stops the native current calculation. The separate historical call retains the frozen dock comparison. [Native reproduction and section](east-ground-receiving-result.md)

## Edit the selected ground WC condensate outlet

The occupied-service adapter changes the existing independent south-wall condensate outlet **X9130/Y0/Z2700**. It moves the outlet and the last straight outward tail together, keeping the tail's 8 mm fall over 800 mm. It runs the native structural aperture, exhaust-to-drain separation and room-side cartridge/blank-tool calculations from the occupied model. The Ø40 sleeve, 60 mm weather face, fan port, outward exchange and retained stage stay in their own fixed scope. The existing occupied-service case produces the selected schedule byte for byte. A different supported level creates a separate trial schedule and updates the port, exterior face and cartridge rows together. [Lowered outlet section](studies/ground-wc-condensate-25mm-lowering.svg)

| Ground WC outlet | Complete sleeve / face clearance | Room-side socket reach | Disposition |
| --- | ---: | ---: | --- |
| Selected Z2700 | 45 / 25 mm | 565.44 mm | Replays the selected schedule |
| Lowered to Z2675 | 45 / 25 mm | 551.17 mm | Recomputes the falling route and candidate schedule |
| Raised to Z2760 | 45 / 25 mm | 602.53 mm | Blocks against 600 mm even while every leg still falls |
| Raised to Z2785 | 45 / 25 mm | 619.05 mm | Blocks socket access and reverses the drop by 20.30 mm |

The invalid states produce their route drawings and object-linked failure diagnostics without a candidate schedule. A stale binding, different port, unsupported geometry or level beyond ±100 mm is rejected outright. The screened passing cases leave rain, frost, condensate performance, seals, bearings, occupied operation and full supported exchange as physical evidence duties.

```sh
node --import tsx scripts/compile-current-design.ts --read-georgian-source |
  node --import tsx scripts/compile-current-design.ts --read-occupied-condensate - > condensate-case.json
node --import tsx scripts/compile-current-design.ts --occupied-condensate condensate-case.json
```

## Acceptance boundary

The occupied schedule and ground WC case cover the active HAD calculation and a real port edit. The selected event, east intake and ground receiving cases cover the source-bound roof and water methods in their supported domains. The two distinct inlet requests expose the active branch, clearances and level mutation. Reference methods reproduce the owning schedule or bounded result. The tests verify that declared edits change the real drawing and calculation, record the matching evidence identity, and withhold unsupported routes.

This completes the current services integration contract. Product, installed pressure, drainage, frost and water-law choices remain with HAD, MAT and RWT. Other active consumers are assessed against the final selected design in CCR-CURRENT-RELEASE.
