<!-- nav-exclude: redirect -->
# DRW-10D — external-maintenance / setting overlay

**Status:** CANDIDATE IMPLEMENTED — architectural review pending  
**Programme:** DRW  
**Parent:** #154

## Question

Can the controlled DRW-08E synthetic setting make the Reference House external-maintenance strategy inspectable without pretending to own a real site, temporary-works design or equipment layout?

## Starting authority

DRW-08E already owns the only setting geometry available at publication authority:

- controlled 12.0 × 10.8 m house shell and controlled courtyard;
- an explicitly synthetic ≈15.5 m width stress test;
- derived ≈1.75 m gross side capacity on west and east;
- west representative façade / roof-edge access capacity;
- east service / plant / façade / roof access capacity;
- rear working / garden logistics continuation;
- garden → dining → courtyard logistics as a qualitative relation;
- explicit absence of plot depth, legal boundaries, road/highway, neighbours, topography, planting/canopies, actual drains/chambers, actual utility approach, exact site entrance and exact ASHP position.

`docs/reference-house/external-access-maintenance-plan.md` supplies the task meaning:

- east/service-side, west representative access, rear working line, courtyard working area and logistics route are Category A maintenance geography;
- those positions should retain useful future capability and remain substantially open;
- courtyard access assumes dismantled mobile-tower components, not a permanent tower position;
- ASHP service/replacement must preserve useful side passage rather than consuming the only route;
- front-façade work may legitimately depend on highway-facing scaffold, but the virtual site does not own a road or boundary;
- exact support conditions, temporary loads, scaffold/tower footprints, final ASHP position/clearance and landscape remain later-stage or real-site facts.

## Representation rule

The complete DRW-08E 1:200 synthetic-setting scene is copied unchanged as the substrate. DRW-10D appends only three provisional **capacity territories** plus terse analytical notes:

1. **west side capacity** — the existing surrogate strip between house and width stress line;
2. **east service/access capacity** — the equivalent existing strip, carrying the additional obligation to retain useful passage around service/plant use;
3. **courtyard working area** — the controlled court itself, available for temporary setup but with no tower footprint located.

No line primitive is added by the analytical layer. Rear logistics therefore remains a qualitative/open-ended relationship rather than acquiring a fictional route centreline.

## Hard boundary

The overlay must not draw or infer:

- legal/front/rear boundaries or plot depth;
- road/highway line or neighbour geometry;
- exact scaffold or tower footprint;
- exact support-zone dimensions or temporary loads;
- exact ASHP location or manufacturer working clearance;
- permanent anchors/tie points;
- planting, mature canopy or root geometry;
- actual drains/chambers;
- exact maintenance route centreline.

The shaded side bands are **gross capacity**, not proof that a particular scaffold, tower or ASHP arrangement fits. The courtyard shade is **working territory**, not a selected tower setup.

## Candidate review protocol

The candidate is generated in CI before any byte freeze. Architectural acceptance requires:

1. the left/right side capacities and courtyard working area read immediately;
2. the controlled house/court and DRW-08E uncertainty remain more authoritative than the analytical shading;
3. the east strip reads as a valuable shared service/access territory, not as a plant footprint;
4. the drawing does not imply a bounded rear garden or exact logistics route;
5. site/temporary-works absences remain unmistakable;
6. the paired relationship with the unmodified DRW-08E synthetic setting remains suitable for the frozen DRW-02E `PLATE_PAIR`.

After visual review, accepted SVG bytes will be tracked and deterministic regeneration locked. DRW-10F retains family-level physical plate proof.

## Files

- `compiler/reference-house/publication-external-maintenance-source.ts`
- `compiler/reference-house/publication-external-maintenance.ts`
- `compiler/reference-house/publication-external-maintenance.test.ts`
- `compiler/reference-house/generate-publication-external-maintenance-overlay.ts`
- `.github/workflows/drw-external-maintenance-candidate.yml`

Candidate output:

- `docs/reference-house/publication-external-maintenance-setting-overlay.svg`

## Next

After reviewed-byte freeze, exact-head validation and merge: **DRW-10E — decide whether a separate spatial / sectional-hierarchy drawing still earns a place**.
