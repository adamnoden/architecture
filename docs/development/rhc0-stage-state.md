# RH-C0 Stage State

**Programme:** [`docs/computational/reference-house-model-freeze-rhc0.md`](../computational/reference-house-model-freeze-rhc0.md)  
**Status:** **RH-C0.7 — Controlled fixture freeze — ACTIVE**  
**Last completed:** **RH-C0.6 — Drawing parity / cross-view audit — PASS**  
**RH-C1:** blocked until RH-C0.7 closes RH-C0 PASS.

Update this file after each RH-C0 stage so a fresh session can resume from the correct gate without reconstructing progress from chat.

| Stage | State | Canonical output |
|---|---|---|
| RH-C0.1 Authority consolidation | **PASS** | `docs/reference-house/model-baseline-rhc0.md` |
| RH-C0.2 Independent dimensional reconstruction | **PASS** | baseline + `docs/reference-house/rhc0-discrepancy-register.md` |
| RH-C0.3 Authored vs derived closure | **PASS** | `docs/reference-house/model-baseline-rhc0.md` |
| RH-C0.4 Mutation/dependency red-team | **PASS** | `docs/reference-house/rhc0-mutation-map.md` |
| RH-C0.5 Domestic/architectural adversarial review | **PASS** | `docs/reference-house/rhc0-domesticity-audit.md` |
| RH-C0.6 Drawing parity/cross-view audit | **PASS** | `docs/reference-house/rhc0-drawing-parity-audit.md` + RH-C0 comparators |
| RH-C0.7 Controlled fixture freeze | **ACTIVE** | final `docs/reference-house/model-baseline-rhc0.md` + closeout |

## Restart pointer

1. Read `model-baseline-rhc0.md`, then the mutation, domesticity and drawing-parity audits.
2. RH-C0.6 found and repaired one real current cross-view defect: RH-10's north-centre upper garden opening was incorrectly assigned to the cross-landing. The owning RH-10 text now assigns it to the dry dressing/storage field; no plan geometry moved.
3. `outer-elevations-rh10.svg` is explicitly stale because it still carries the old host label; use `rhc0-garden-elevation-comparator.svg` for current visual comparison.
4. RH-C1's visual comparator set is `rhc0-ground-floor-comparator.svg`, `rhc0-first-floor-comparator.svg`, and `rhc0-principal-section-comparator.svg`. They are secondary projections, never source geometry.
5. RH-C0.7 must finish `model-baseline-rhc0.md` with final `FROZEN_FOR_RH_C1`, `PROVISIONAL_BUT_REPRESENTABLE`, and `OUTSIDE_RH_C1` classifications; unresolved items; supersession notes; and the RH-C1 source contract.
6. Explicitly verify all ten PASS conditions in the canonical RH-C0 programme before closing issue #34.
7. Reference House maturity remains M3. Passing RH-C0 does not validate construction, compliance, engineering or building physics.
8. Issue #33 / RH-C1 remains blocked until RH-C0.7 passes and issue #34 is closed.

### Completed stage commits

- RH-C0.1 — `8351305a9bb6232e890881415da6f0d78f956cbb`.
- RH-C0.2 — `f4e65c7fdb1d363738620832912c66ac2018479c`.
- RH-C0.3 — `03696c4451ac70448372b4a886957cecfb6d749a`.
- RH-C0.4 — `15e24b5f24b1be9df23e0fd3f9eb74636d838ae3`.
- RH-C0.5 — `f91066ba9a99ad35aa4e07dc4512448717a99498`.
- RH-C0.6 — commit containing this state update, parity audit, repaired RH-10 elevation authority and current comparators.

Do not advance RH-C1 merely because the first six RH-C0 stages pass. Advance only if RH-C0.7 verifies the complete freeze gate.