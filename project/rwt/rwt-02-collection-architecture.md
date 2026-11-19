# RWT-02 — collection architecture comparison

**Result:** complete at comparative research/architecture scope; no collector or network selected.
**Starting main:** `15ab2ca5d4da39d7f46372dbbf55a4cd9af6ae10` after BCR-SCAFFOLD projection reconciliation.
**Date:** 29 October 2026. **Tracking:** [RWT #992](https://github.com/adamnoden/architecture/issues/992).
**Owning research:** [Rainwater collection: access and failure paths](../../docs/research/rainwater-collection-options.md).

## Question and result

Which collection families deserve development for the accepted roof and court, and what would defeat them?

The research compares exposed eaves, valleys/receivers, box/parapet and internal gutters, hoppers, scuppers, roof outlets, and court point/channel collectors across capture, obstruction, overflow, critical joints, access, appearance, cleaning and replacement. It separates collecting geometry from transfer fittings rather than treating their names as interchangeable systems.

Exposed conventional eaves are the ordinary comparator. Concealed collection remains a conditional alternative with explicit access/overflow/renewal burdens. Point versus linear court collection remains a real unresolved design comparison; neither provides a safe failed-collector route merely by being shown near a door. No numerical scoring, product/capacity selection, source geometry mutation or new compiler mechanism is warranted.

## Current source check

Read `compiler/reference-house/georgian/layout-family.ts`: `currentRoofZ`, `roofHeight` and `createLayoutRoof`, with `layout-revision.ts`. At the south-west inner diagonal, `currentRoofZ(3000,3000)` is approximately 7382.884573 mm; both `currentRoofZ(2900,3100)` and `currentRoofZ(3100,2900)` are approximately 7429.515339 mm. The diagonal is therefore locally lower than either side. Symmetry supplies four inner valleys reaching court corners. Outer portions of the same drawn diagonals are hips. This independently checks the parallel ROF geometry finding against the already-authoritative model; it does not adopt an unmerged roof alternative.

These are nominal source coordinates, not finished valley inverts, effective catchment allocation, collector positions or capacities. Corner concentration must enter the receiver study. Four corners do not select four downpipes, and the eight source arrows do not allocate equal flow.

## Evidence and adverse checks

Primary conservation guidance explains visible failure, trapped gutter consequences and actual access needs. Manufacturer examples distinguish membrane/outlet-body interfaces, head-dependent scupper performance and facade channels that discharge onto a lower drainage layer. The research lists exact source URLs, inspected sections and access limits; the Wade PDF was available only through its publisher-indexed installation excerpt. No licensed standard clauses or uninspected capacity tables are claimed.

Counterexamples retained: an exposed inner gutter can still wet court doors; an extra inlet can share the blocked throat; a low overflow lip can require unsafe operating head; a cleanable grate does not prove replaceable outlet body; a narrow channel slot need not provide full cleaning access; a high-level roof transfer does not drain direct court rainfall. RWT-03 receives primary/overflow identities, operating levels, actual access and any forced court/cross-building routes. RWT-04 retains materials and compatibility; ROF retains topology/weathering; OAS retains thresholds.

## Validation and handoff

Independently reproduced the three roof-height values with the source function. Checked every required collection family and evaluation dimension against the RWT programme, RWT-00/01 and the roof/water seam. Local repository/control checks, production documentation build and exact-head CI are recorded in the PR; software validation does not establish hydraulic or physical performance.

RWT-05 consumes this comparison alongside conveyance/material work to attack obstruction and exceedance. RWT-07 and ROF-RWT-GATE must compose and actually select the coupled system. Missing collection capacity or receiving space essential to fit cannot be deferred as harmless detail. BCR/MRA/DPL/DEL retain their evidence and site boundaries. RWT #992 remains open.
