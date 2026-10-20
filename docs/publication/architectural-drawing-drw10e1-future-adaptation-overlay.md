<!-- nav-exclude: redirect -->
# DRW-10E.1 — Entrance-storey future-adaptation overlay

**Status:** physically reviewed, byte-frozen analytical overlay

## Question

Can the retained entrance-storey future-adaptation view explain the house's one-level fallback framework after loss of stair use without inventing accessibility-compliance, sanitary, doorway or furniture geometry?

## Decision

Yes, but only as an architectural-geography overlay on the canonical ground-floor plan at true 1:100.

The view identifies only:

- `G-FAM-02` as a **provisional fallback sleeping option / topological capability**;
- `G-HALL-02` and `G-GAL-01` as existing **one-level all-weather route territory**, not a route centreline or clear-width proof;
- gross `G-SVC-02` as **sanitary / shower adaptation geography**, not a resolved accessible bathroom.

The comparator is **M4(2)-informed**. The drawing makes **no compliance claim** and is a **framework, not accessible-suite proof**.

## Authority

The canonical ground plan remains the sole geometric substrate. HFI-07B provides the audited one-level topology and plausible entrance-storey sleeping destination. HFI-02C / HFI-04A preserve the adaptation intention for the gross service suite. Those sources do not own finished route widths, doorway manoeuvres, exact sanitary subdivision, fixture positions or accessible-suite clearances.

Machine-readable selection and absences live in `compiler/reference-house/publication-future-adaptation-source.ts`.

## Representation boundary

The overlay adds no:

- bed or furniture geometry;
- route centrelines or claimed finished clear widths;
- turning circles or doorway manoeuvre envelopes;
- WC, basin or shower fixtures;
- exact sanitary subdivision;
- drainage, controls, support or dry-staging geometry;
- site-bound approach geometry;
- statement of Part M compliance.

It therefore uses whole already-owned host-space fields only. The canonical ground-plan scene is reused unchanged underneath.

## Physical review and byte lock

The accepted candidate was reviewed at the intended 1:100 drawing size after reconciliation onto exact `main` `7646cd6a21ae4d1108a720d0471b79f49b1848d3` in merge head `c9ce173354b756c9ed55a10d36d3a2c4b19a28c9`.

The reconciled candidate was byte-identical to the visually accepted candidate:

- file: `docs/reference-house/publication-future-adaptation-overlay.svg`
- SHA-256: `0321309e9388ae71f9c6b40b46da2f83667f0d11f2efa1ad19b02290cd00bd84`
- size: 19,109 bytes

The reviewed bytes were then committed by the freeze workflow at `210a38f6db7b6ec945d77c159d77ef145e7aba07`. A deterministic artifact regression requires the committed SVG to equal the canonical renderer output exactly.

## Validation

Completion requires and records:

1. semantic tests proving the selected spaces, provenance and explicit absences;
2. regression proof that the canonical ground-plan primitives remain unchanged;
3. deterministic controlled SVG regeneration;
4. actual physical review at the intended 1:100 publication size;
5. committed-byte equality with the canonical render;
6. family-level reconciliation in DRW-10F.

This packet does not prove that a future accessible sleeping/bathing suite can be delivered without further design. It proves only that the current architectural topology preserves a bounded adaptation framework worth communicating.
