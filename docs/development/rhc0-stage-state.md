# RH-C0 Stage State

**Programme:** [`docs/computational/reference-house-model-freeze-rhc0.md`](../computational/reference-house-model-freeze-rhc0.md)  
**Status:** **RH-C0 — PASS / CLOSED**  
**Last completed:** **RH-C0.7 — Controlled fixture freeze — PASS**  
**RH-C1:** **UNBLOCKED / READY**. Do not broaden its scope beyond the RH-C0 source contract.

This file is the restart-safe execution pointer for the Reference House computational handoff.

| Stage | State | Canonical output |
|---|---|---|
| RH-C0.1 Authority consolidation | **PASS** | `docs/reference-house/model-baseline-rhc0.md` |
| RH-C0.2 Independent dimensional reconstruction | **PASS** | baseline + `docs/reference-house/rhc0-discrepancy-register.md` |
| RH-C0.3 Authored vs derived closure | **PASS** | `docs/reference-house/model-baseline-rhc0.md` |
| RH-C0.4 Mutation/dependency red-team | **PASS** | `docs/reference-house/rhc0-mutation-map.md` |
| RH-C0.5 Domestic/architectural adversarial review | **PASS** | `docs/reference-house/rhc0-domesticity-audit.md` |
| RH-C0.6 Drawing parity/cross-view audit | **PASS** | `docs/reference-house/rhc0-drawing-parity-audit.md` + RH-C0 comparators |
| RH-C0.7 Controlled fixture freeze | **PASS** | final `docs/reference-house/model-baseline-rhc0.md` |

## Final result

All ten PASS conditions in the canonical RH-C0 programme are satisfied.

The controlled fixture is frozen only at the bounded architectural scope defined in `model-baseline-rhc0.md`. The freeze does not claim construction readiness, structural adequacy, fire compliance, acoustic performance, building-physics adequacy, MEP capacity, product suitability, site validity or professional validation.

Reference House maturity remains **M3 — Coordinated at virtual-design scope**.

## Restart pointer

1. Read `docs/reference-house/model-baseline-rhc0.md` first. It is the canonical RH-C1 source contract.
2. Read `docs/reference-house/rhc0-mutation-map.md` before writing mutation tests.
3. Use only the named RH-C0 comparator set for RH-C1 drawing parity:
   - `rhc0-ground-floor-comparator.svg`
   - `rhc0-first-floor-comparator.svg`
   - `rhc0-principal-section-comparator.svg`
4. Historical/stale SVGs remain provenance or scoped diagrams; they must not supply source coordinates.
5. RH-C0.6 repaired one real current cross-view defect: the north-centre upper garden opening is hosted by the dry dressing/storage field, not the north cross-landing. The owning RH-10 authority was corrected; the plan did not move.
6. `FROZEN_FOR_RH_C1`, `PROVISIONAL_BUT_REPRESENTABLE`, and `OUTSIDE_RH_C1` boundaries in the baseline are binding on RH-C1.
7. Do not add structure, MEP, detailed envelope physics, products or regulatory solvers to RH-C1 merely because they are adjacent to the model.
8. Issue #34 may be closed completed. Issue #33 is the next executable work item.

### Completed stage commits

- RH-C0.1 — `8351305a9bb6232e890881415da6f0d78f956cbb`.
- RH-C0.2 — `f4e65c7fdb1d363738620832912c66ac2018479c`.
- RH-C0.3 — `03696c4451ac70448372b4a886957cecfb6d749a`.
- RH-C0.4 — `15e24b5f24b1be9df23e0fd3f9eb74636d838ae3`.
- RH-C0.5 — `f91066ba9a99ad35aa4e07dc4512448717a99498`.
- RH-C0.6 — `d64c50e32aec4f1f7fa4ff0f3b2e8d97ddaa081e`.
- RH-C0.7 — this closeout commit.
