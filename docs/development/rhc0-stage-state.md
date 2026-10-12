# RH-C0 Stage State

**Programme:** [`docs/computational/reference-house-model-freeze-rhc0.md`](../computational/reference-house-model-freeze-rhc0.md)  
**Status:** **RH-C0.6 — Drawing parity / cross-view audit — ACTIVE**  
**Last completed:** **RH-C0.5 — Fresh domestic / architectural adversarial review — PASS**  
**RH-C1:** blocked until RH-C0 closes PASS.

Update this file after each RH-C0 stage so a fresh session can resume from the correct gate without reconstructing progress from chat.

| Stage | State | Canonical output |
|---|---|---|
| RH-C0.1 Authority consolidation | **PASS** | `docs/reference-house/model-baseline-rhc0.md` |
| RH-C0.2 Independent dimensional reconstruction | **PASS** | baseline + `docs/reference-house/rhc0-discrepancy-register.md` |
| RH-C0.3 Authored vs derived closure | **PASS** | `docs/reference-house/model-baseline-rhc0.md` |
| RH-C0.4 Mutation/dependency red-team | **PASS** | `docs/reference-house/rhc0-mutation-map.md` |
| RH-C0.5 Domestic/architectural adversarial review | **PASS** | `docs/reference-house/rhc0-domesticity-audit.md` |
| RH-C0.6 Drawing parity/cross-view audit | **ACTIVE** | `docs/reference-house/rhc0-drawing-parity-audit.md` + comparator drawings |
| RH-C0.7 Controlled fixture freeze | NOT STARTED | final `model-baseline-rhc0.md` + closeout |

## Restart pointer

1. Read `model-baseline-rhc0.md`, then `rhc0-domesticity-audit.md` and the live `rhc0-discrepancy-register.md`.
2. RH-C0.5 found no morphology rewind. It did **not** prove exact door swings, M4/WC fit, final stair construction or plant/riser packing.
3. Treat 450 mm wall depth as an adversarial stress boundary, not a comfortable or proven construction thickness.
4. RH-C0.6 must audit actual semantic/dimensional parity across plan↔plan, plan↔section, plan↔elevation, section↔elevation, openings/axes/rooms, support lines, stair/datums, court/section, roof/elevation and service zones.
5. Classify every relevant current drawing as `CURRENT GEOMETRIC AUTHORITY`, `CURRENT DIAGRAM / NON-GEOMETRIC`, `STALE — REPLACE/CORRECT`, or `HISTORICAL / PROVENANCE ONLY`.
6. No hand-authored SVG is allowed to become source geometry merely because it is dimensionally useful. If current visual comparators are needed, create controlled projections of the RH-C0 baseline and label them as secondary comparators.
7. `service-topology-rh06.svg` is now explicitly registered as a topology diagram whose utility/WC pixels must not supply dimensions.
8. RH-C1 remains blocked.

### Completed stage commits

- RH-C0.1 — `8351305a9bb6232e890881415da6f0d78f956cbb`.
- RH-C0.2 — `f4e65c7fdb1d363738620832912c66ac2018479c`.
- RH-C0.3 — `03696c4451ac70448372b4a886957cecfb6d749a`.
- RH-C0.4 — `15e24b5f24b1be9df23e0fd3f9eb74636d838ae3`.
- RH-C0.5 — commit containing this state update, domesticity audit and discrepancy update.

Do not advance a stage merely because its document exists. Advance only when its gate in the canonical RH-C0 programme is satisfied.