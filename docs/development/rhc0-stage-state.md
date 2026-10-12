# RH-C0 Stage State

**Programme:** [`docs/computational/reference-house-model-freeze-rhc0.md`](../computational/reference-house-model-freeze-rhc0.md)  
**Status:** **RH-C0.5 — Fresh domestic / architectural adversarial review — ACTIVE**  
**Last completed:** **RH-C0.4 — Mutation / dependency red-team — PASS**  
**RH-C1:** blocked until RH-C0 closes PASS.

Update this file after each RH-C0 stage so a fresh session can resume from the correct gate without reconstructing progress from chat.

| Stage | State | Canonical output |
|---|---|---|
| RH-C0.1 Authority consolidation | **PASS** | `docs/reference-house/model-baseline-rhc0.md` |
| RH-C0.2 Independent dimensional reconstruction | **PASS** | baseline + `docs/reference-house/rhc0-discrepancy-register.md` |
| RH-C0.3 Authored vs derived closure | **PASS** | `docs/reference-house/model-baseline-rhc0.md` |
| RH-C0.4 Mutation/dependency red-team | **PASS** | `docs/reference-house/rhc0-mutation-map.md` |
| RH-C0.5 Domestic/architectural adversarial review | **ACTIVE** | `docs/reference-house/rhc0-domesticity-audit.md` |
| RH-C0.6 Drawing parity/cross-view audit | NOT STARTED | `docs/reference-house/rhc0-drawing-parity-audit.md` |
| RH-C0.7 Controlled fixture freeze | NOT STARTED | final `model-baseline-rhc0.md` + closeout |

## Restart pointer

1. Read `model-baseline-rhc0.md` for the current authority/reconstruction/authorship contract.
2. Read `rhc0-mutation-map.md`; it defines expected propagation and deliberate failure conditions for future RH-C1 tests.
3. RH-C0.5 must now ignore subsystem elegance and re-read the current design as an ordinary four-bedroom house under the conservative RH-10 envelope assumptions.
4. Pay particular attention to the front-centre stair fit at 425/450 mm wall tests, shallow garden dining field, service/plant proportionality, four-bedroom usefulness, ordinary storage/laundry/cleaning, courtyard value/cost and whether any House Kernel infrastructure is consuming architecture without earning it.
5. If a real architectural defect is found, repair it through its owning RH gate and propagate before marking RH-C0.5 PASS.
6. RH-C1 remains blocked.

### Completed stage commits

- RH-C0.1 — `8351305a9bb6232e890881415da6f0d78f956cbb`.
- RH-C0.2 — `f4e65c7fdb1d363738620832912c66ac2018479c`.
- RH-C0.3 — `03696c4451ac70448372b4a886957cecfb6d749a`.
- RH-C0.4 — commit containing this state update and `rhc0-mutation-map.md`.

Do not advance a stage merely because its document exists. Advance only when its gate in the canonical RH-C0 programme is satisfied.