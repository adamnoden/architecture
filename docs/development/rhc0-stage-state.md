# RH-C0 Stage State

**Programme:** [`docs/computational/reference-house-model-freeze-rhc0.md`](../computational/reference-house-model-freeze-rhc0.md)  
**Status:** **RH-C0.3 — Authored vs derived closure — ACTIVE**  
**Last completed:** **RH-C0.2 — Independent dimensional reconstruction — PASS**  
**RH-C1:** blocked until RH-C0 closes PASS.

Update this file after each RH-C0 stage so a fresh session can resume from the correct gate without reconstructing progress from chat.

| Stage | State | Canonical output |
|---|---|---|
| RH-C0.1 Authority consolidation | **PASS** | `docs/reference-house/model-baseline-rhc0.md` |
| RH-C0.2 Independent dimensional reconstruction | **PASS** | baseline + `docs/reference-house/rhc0-discrepancy-register.md` |
| RH-C0.3 Authored vs derived closure | **ACTIVE** | `model-baseline-rhc0.md` |
| RH-C0.4 Mutation/dependency red-team | NOT STARTED | `docs/reference-house/rhc0-mutation-map.md` |
| RH-C0.5 Domestic/architectural adversarial review | NOT STARTED | `docs/reference-house/rhc0-domesticity-audit.md` |
| RH-C0.6 Drawing parity/cross-view audit | NOT STARTED | `docs/reference-house/rhc0-drawing-parity-audit.md` |
| RH-C0.7 Controlled fixture freeze | NOT STARTED | final `model-baseline-rhc0.md` + closeout |

## Restart pointer

1. Read `docs/reference-house/model-baseline-rhc0.md`; RH-C0.1 authority consolidation and RH-C0.2 independent reconstruction are closed PASS.
2. Read `docs/reference-house/rhc0-discrepancy-register.md`; drawing discrepancies remain intentionally open until RH-C0.6 unless a later stage finds a true design contradiction.
3. RH-C0.3 must eliminate duplicated authorship. In particular decide source-vs-derived treatment for courtyard edges/wings, front bay axes, entrance centre, level differences, stair rise/run/pitch and semantic room reservation coordinates.
4. Do not turn the RH-10 400–425 mm envelope family into one invented canonical construction thickness merely to make geometry easier to encode.
5. Exact east/west courtyard opening centres remain OPEN unless a justified RH-04 correction authors them.

### Completed stage commits

- RH-C0.1 — `8351305a9bb6232e890881415da6f0d78f956cbb` — authority consolidation.
- RH-C0.2 — commit containing this state update, baseline reconstruction and discrepancy register.

Do not advance a stage merely because its document exists. Advance only when its gate in the canonical RH-C0 programme is satisfied.