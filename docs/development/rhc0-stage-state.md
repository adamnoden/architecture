# RH-C0 Stage State

**Programme:** [`docs/computational/reference-house-model-freeze-rhc0.md`](../computational/reference-house-model-freeze-rhc0.md)  
**Status:** **RH-C0.2 — Independent dimensional reconstruction — ACTIVE**  
**Last completed:** **RH-C0.1 — Authority consolidation — PASS**  
**RH-C1:** blocked until RH-C0 closes PASS.

Update this file after each RH-C0 stage so a fresh session can resume from the correct gate without reconstructing progress from chat.

| Stage | State | Canonical output |
|---|---|---|
| RH-C0.1 Authority consolidation | **PASS** | `docs/reference-house/model-baseline-rhc0.md` |
| RH-C0.2 Independent dimensional reconstruction | **ACTIVE** | baseline + `rhc0-discrepancy-register.md` if needed |
| RH-C0.3 Authored vs derived closure | NOT STARTED | `model-baseline-rhc0.md` |
| RH-C0.4 Mutation/dependency red-team | NOT STARTED | `docs/reference-house/rhc0-mutation-map.md` |
| RH-C0.5 Domestic/architectural adversarial review | NOT STARTED | `docs/reference-house/rhc0-domesticity-audit.md` |
| RH-C0.6 Drawing parity/cross-view audit | NOT STARTED | `docs/reference-house/rhc0-drawing-parity-audit.md` |
| RH-C0.7 Controlled fixture freeze | NOT STARTED | final `model-baseline-rhc0.md` + closeout |

## Restart pointer

1. Read `docs/reference-house/model-baseline-rhc0.md`; RH-C0.1 is the current authority schedule.
2. For RH-C0.2 reconstruct from the textual/numeric authorities first. Do not use current SVG geometry as source truth.
3. Compare the independent reconstruction against `ground-floor-development.svg`, `stair-ground-floor-overlay.svg`, `upper-floor-and-stair-development.svg`, `principal-section-rh04.svg`, `front-elevation-study.svg` and later RH-10 drawings only after the reconstruction exists.
4. Record every mismatch before correcting it. Repair any real contradiction through its owning RH gate.

**RH-C0.1 commit intent:** consolidate current shell/court, datums, room topology, stair, axes/openings, roof, structural-support and service-zone authorities; record the RH-01/RH-03/RH-06/RH-08/RH-10 supersession chain; keep wall, roof, plant and riser assumptions explicitly provisional.

Do not advance a stage merely because its document exists. Advance only when its gate in the canonical RH-C0 programme is satisfied.