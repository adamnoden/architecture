<!-- nav-exclude: redirect -->
# DRW-03B.1 — Drawing/family passage clearance correction

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-03B.1  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `dfba4237107eda8c7a6d79e53607ba25e40a4f49`

## Finding

DRW-03D was the first packet to turn the planning wall proxies into actual cut bodies. That exposed one conflict in the provisional DRW-03B opening source:

- west courtyard void face: X `4200`;
- provisional courtyard wall body: `400 mm` west of that face;
- courtyard wall inner planning face: X `3800`;
- drawing ↔ family passage: centre X≈`3400`, width≈`1200`;
- authored passage right edge: X≈`4000`.

The passage therefore extended approximately `200 mm` into the court-wall planning body.

This is a source-coordination defect, not a renderer problem. The renderer must not make it disappear by clipping or by silently narrowing the opening.

## Correction

Keep the provisional passage width at **≈1200 mm** and move only its provisional centre:

- before: X≈`3400`;
- after: **X≈`3200`**;
- resulting span: X≈`2600–3800`.

The passage now terminates exactly at the courtyard wall’s current inner planning face.

No room boundary, court dimension, wall family, adjacency, door type or construction fact changes. The value remains `PROVISIONAL_BUT_REPRESENTABLE` / approximate.

## Proof

`publication-plan-source.test.ts` now derives the court-wall inner face from the canonical shell/court geometry plus the DRW-03B wall proxy and proves:

`passage centre + half width = court-wall inner planning face = 3800 mm`.

## Handoff

Resume DRW-03D. Its wall-body representation must also trim internal planning bodies to permanent outer/courtyard wall inner faces instead of letting centreline source boundaries visually run through permanent cut matter. That is representation geometry and requires no further source fact.
