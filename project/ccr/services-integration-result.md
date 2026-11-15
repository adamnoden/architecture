# Bind a configurable east court intake case to the current house

[25 mm narrowing comparison drawing](studies/court-intake-25mm-narrowing.svg)

This checkpoint connects the actual east diversion's west court intake to a versioned port, interval and quiet-stage document. It uses the staged current compile and the authored HAD/RWT source bindings. The HAD and RWT producers and retained event outputs remain as they were.

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

The quiet-stage comparison addresses an ideal critical-section sensitivity. Real approach and capture losses, first wetting, installed flow, survey levels, site disposal and full-network operation remain open. Port relocation and physical crest reprofiling need an explicit supported method and revised source. Other roof thresholds, the selected occupied-service calculations, potable inlet replacement and direct native consumers remain integration work. This slice does not close CCR-SERVICES-INTEGRATION.

Verify the retained witness with `node --import tsx project/ccr/studies/current-projection-witnesses.ts --check`.
