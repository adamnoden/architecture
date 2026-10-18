<!-- nav-exclude: redirect -->
# DRW-04A.1 — Upper-circulation continuity correction

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-04A.1  
**Issue:** #154

## Defect

DRW-04A found that the controlled prose and the executable first-floor geometry disagreed. RH-03/RH-04 require the route `stair → south landing → east courtyard gallery → north cross-landing`, but the encoded `U-STAIR-01`/`U-GAL-02` and `U-GAL-02`/`U-LAND-N01` reservations met only at courtyard corner points. A point contact cannot carry ordinary domestic circulation and cannot host an honest plan opening.

## Correction

The correction keeps the shell, court and east-gallery field fixed. It restores the two turns that the RH-03 schematic route implied without promoting that drawing to source authority:

- `U-STAIR-01` gains a provisional eastward turning field at the north-east corner of the south landing; its depth is approximately 1,300 mm, matching the current gallery-width field.
- `U-LAND-N01` gains an eastward turn across its existing 1,200 mm depth.
- `U-BED-03` and `U-BED-04` become L-shaped around those turns while retaining their existing outer-façade fields and direct adjacency to the owning landing.
- the gallery/service boundary extends through the two turning fields; the redundant court-continuation wall segments at the circulation turns are removed.
- `ADJ-U-STAIR-GAL` and `ADJ-U-GAL-LAND` become compiler-enforced required adjacencies.

## Boundaries

This packet does not author internal door positions, door leaves/swings, new courtyard openings, technical stair strings/guards, service geometry or publication notation. Those remain DRW-04A/04B work.

The old RH-C0 first-floor comparator is retained only as provenance; the regenerated RH-C1 first-floor projection is the current executable view.
