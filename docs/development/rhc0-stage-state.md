# RH-C0 Stage State

**Programme:** [`docs/computational/reference-house-model-freeze-rhc0.md`](../computational/reference-house-model-freeze-rhc0.md)  
**Status:** **RH-C0.4 — Mutation / dependency red-team — ACTIVE**  
**Last completed:** **RH-C0.3 — Authored vs derived closure — PASS**  
**RH-C1:** blocked until RH-C0 closes PASS.

Update this file after each RH-C0 stage so a fresh session can resume from the correct gate without reconstructing progress from chat.

| Stage | State | Canonical output |
|---|---|---|
| RH-C0.1 Authority consolidation | **PASS** | `docs/reference-house/model-baseline-rhc0.md` |
| RH-C0.2 Independent dimensional reconstruction | **PASS** | baseline + `docs/reference-house/rhc0-discrepancy-register.md` |
| RH-C0.3 Authored vs derived closure | **PASS** | `docs/reference-house/model-baseline-rhc0.md` |
| RH-C0.4 Mutation/dependency red-team | **ACTIVE** | `docs/reference-house/rhc0-mutation-map.md` |
| RH-C0.5 Domestic/architectural adversarial review | NOT STARTED | `docs/reference-house/rhc0-domesticity-audit.md` |
| RH-C0.6 Drawing parity/cross-view audit | NOT STARTED | `docs/reference-house/rhc0-drawing-parity-audit.md` |
| RH-C0.7 Controlled fixture freeze | NOT STARTED | final `model-baseline-rhc0.md` + closeout |

## Restart pointer

1. `model-baseline-rhc0.md` now contains the RH-C0.1 authority schedule, RH-C0.2 independent reconstruction and RH-C0.3 source/dependency contract.
2. `rhc0-discrepancy-register.md` remains live; drawing drift is not allowed to become source geometry.
3. RH-C0.4 must red-team the ten canonical mutations and state direct derived changes, architectural conflicts, stale obligations/evidence, owning RH gates, affected drawings/schedules and intentionally unaffected facts.
4. Mutation expectations should follow the dependency graph just closed; do not invent generic compiler rules or optimise the house.
5. RH-C1 remains blocked.

### Completed stage commits

- RH-C0.1 — `8351305a9bb6232e890881415da6f0d78f956cbb`.
- RH-C0.2 — `f4e65c7fdb1d363738620832912c66ac2018479c`.
- RH-C0.3 — commit containing this state update and the authored/derived closure.

Do not advance a stage merely because its document exists. Advance only when its gate in the canonical RH-C0 programme is satisfied.