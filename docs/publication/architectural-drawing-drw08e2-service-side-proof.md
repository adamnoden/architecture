<!-- nav-exclude: redirect -->
# DRW-08E.2 — Service-side elevation generation and physical proof

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-08E.2  
**Issue:** #154  
**Status:** IMPLEMENTED — CANDIDATE PROOF

## Purpose

Generate the DRW-02D retained `SUPPORTING` east/service elevation from DRW-08E.1 without converting qualitative service geography into a fake MEP elevation.

## Representation

The controlled drawing is true `1:100` and uses the shared elevation projection / paper-space drawing grammar.

It contains:

- canonical east facade depth and vertical datums;
- exact south / middle / north plan-owned field extents represented only by small ownership ticks and labels;
- selected study, bathroom and kitchen opening occurrences as text because aperture geometry is absent;
- the nominal ≈1.0 m clear plant-replacement target as text, with position/head explicitly unresolved;
- MVHR, utility-entry, ASHP, cooker, rainwater-return and soil-vent relationships as qualitative zone notation only;
- a physical scale bar and restrained datum references.

It contains **no aperture rectangle, terminal point, pipe/downpipe centreline, ASHP product outline, exterior-grade line, facade panel seam, material hatch or decorative service screen**.

## Physical proof

The candidate SVG is placed literally on the established three-page blank → furniture leaf → controlled-drawing leaf specimen and built at:

- A4 portrait, the current Working Edition baseline;
- conservative ISO B5 portrait, used only as a robustness proof.

No CSS zoom, fit transform or view-specific scale reduction is authorised.

The first successful candidate proof will be promoted byte-for-byte into the controlled SVG and regression-locked before merge.

## Stop rule

If the scene fails B5 bounds or typography, correct the renderer/notation in a bounded packet. Do not shrink the architecture or quietly convert absent service geometry into convenient coordinates.

## Handoff

After exact candidate bytes are committed and the A4/B5 + repository gates pass again, merge DRW-08E.2 and proceed to DRW-08F orthographic-family parity/freeze.
