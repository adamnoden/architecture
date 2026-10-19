<!-- nav-exclude: redirect -->
# DRW-08C — Garden elevation generation and physical proof

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-08C  
**Issue:** #154  
**Status:** IMPLEMENTED — PENDING VALIDATION / ARTIFACT LOCK

## Purpose

Generate the DRW-02D `SUPPORTING` north/garden elevation from the hardened DRW-08C.1 source without manufacturing the rear opening schedule that RH-C1 does not own.

## Representation rule

The elevation is true `1:100` and uses the same physical-mm projection and graphic-token system as the controlled front elevation.

It draws aperture envelopes only where a selected opening occurrence has bounded provisional dimensions. Where RH-10 selects an occurrence but the aperture remains absent, the drawing uses target/axis notation instead:

- centre garden threshold: `≈1.2 m clear target`, not invented jamb/head geometry;
- east ground kitchen opening: occurrence axis only; kind and dimensions unresolved;
- centre upper dry-storage opening: vertical occurrence axis only; width unresolved.

The three RH-10 composition axes are shown only as short notation ticks. They are not facade panels, pilasters or invented masonry joints.

## Physical proof

The candidate scene is `166 × 96 mm` at true `1:100`. A4 and conservative B5 proofs use the established blank → verso furniture → recto drawing grammar with no CSS fit scaling. Validation checks the controlled scale, physical page sizes, bounded versus unresolved opening semantics, browser-safe SVG typography and presence of authority cues.

## Stop rule

The generated SVG is not yet controlled merely because it renders. CI must first prove the renderer and physical plate. The exact SVG bytes are then committed and locked before merge.

## Handoff

After successful validation and byte lock, proceed to **DRW-08D — courtyard elevation/section material**. Apply the same source-hardening split rule if the courtyard's qualitative east/west opening relationships cannot support an honest 1:50 plate directly.
