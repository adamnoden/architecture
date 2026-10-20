<!-- nav-exclude: redirect -->
# DRW-10D — external-maintenance / setting overlay

**Status:** REVIEWED + BYTE-FROZEN — final exact-head validation pending  
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

The capacity territories are unfilled provisional outlines rather than solid bands. That keeps the DRW-08E substrate visually primary while still making the maintenance reading explicit.

## Hard boundary

The overlay does not draw or infer:

- legal/front/rear boundaries or plot depth;
- road/highway line or neighbour geometry;
- exact scaffold or tower footprint;
- exact support-zone dimensions or temporary loads;
- exact ASHP location or manufacturer working clearance;
- permanent anchors/tie points;
- planting, mature canopy or root geometry;
- actual drains/chambers;
- exact maintenance route centreline.

The side territories are **gross capacity**, not proof that a particular scaffold, tower or ASHP arrangement fits. The courtyard outline is **working territory**, not a selected tower setup.

## Architectural review result

Three generated candidates were inspected at rendered output.

The first was semantically correct but visually too forceful: solid grey capacity fills dominated the controlled substrate and the right-hand analytical legend collided with the existing east-side ≈1.75 m annotation. The second removed the fills and moved/shortened the legend, but the vertical side labels still crossed the inherited garden → dining → court note. The third moved those labels clear while changing no authority or geometry.

The accepted candidate passes the packet test:

1. west/east side capacities and courtyard working area read immediately;
2. the controlled house/court and DRW-08E uncertainty remain visually primary;
3. the east strip reads as shared service/access capacity, not a plant footprint;
4. rear logistics remains explicitly open-ended with no analytical route line;
5. site and temporary-works absences are visible in the right-hand legend;
6. the drawing remains a natural analytical partner for the unmodified DRW-08E setting in the frozen `PLATE_PAIR`.

The accepted SVG is tracked at `docs/reference-house/publication-external-maintenance-setting-overlay.svg`. The freeze workflow stages the generated file before byte comparison, so newly generated output cannot be mistaken for a clean tracked match.

After the first exact-head pass, `main` advanced from the DRW-10C merge to DPL-02. The intervening change adds only `project/dpl/dpl-02-reference-house-conformance.md`; it is path-disjoint from DRW-10D. The exact current `main` tree was therefore merged into this branch without altering the accepted drawing bytes, and the combined head is revalidated before merge.

DRW-10F retains family-level physical plate proof.

## Files

- `compiler/reference-house/publication-external-maintenance-source.ts`
- `compiler/reference-house/publication-external-maintenance.ts`
- `compiler/reference-house/publication-external-maintenance.test.ts`
- `compiler/reference-house/generate-publication-external-maintenance-overlay.ts`
- `.github/workflows/drw-external-maintenance-candidate.yml`
- `docs/reference-house/publication-external-maintenance-setting-overlay.svg`

## Next

After final exact-head validation and merge: **DRW-10E — decide whether a separate spatial / sectional-hierarchy drawing still earns a place**.
