<!-- nav-exclude: redirect -->
# DRW-03D — Ground-floor publication-plan scene

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-03D  
**Status:** DONE pending branch validation  
**Issue:** #154

## 1. Outcome

DRW-03D composes the first native Reference House architectural plan scene from canonical RH-C1 geometry, the bounded DRW-03B/03B.1 publication-plan source and the physical-mm renderer frozen by DRW-03C.

The scene builder is `compiler/reference-house/publication-ground-plan.ts`; focused proof is `compiler/reference-house/publication-ground-plan.test.ts`.

This packet stops before committing the generated SVG. DRW-03E owns canonical generation, lineage and byte-for-byte regeneration proof.

## 2. Scale and paper territory

The plan remains exactly **1:100**. The canonical `12,000 × 10,800 mm` shell therefore occupies exactly **120 × 108 mm** on paper.

The drawing scene is **136 × 145 mm**. This fits the conservative B5-territory body width without fit-scaling, while forcing dimensioning and notes to remain sparse.

## 3. Cut matter and junction geometry

Every canonical ground boundary is represented as solid black cut matter. There are:

- four outer cut-wall bodies;
- four courtyard cut-wall bodies;
- six internal planning-boundary bodies.

Total: **14 cut-wall bodies**.

The wall bodies use the bounded DRW-03B planning proxies:

- external/courtyard body ≈`400 mm`;
- ordinary internal body ≈`125 mm`.

Black poche means only that planning matter is cut; it does not promote either proxy into construction thickness or material truth.

The already-frozen face-ownership rule determines body geometry:

- shell coordinates own outer faces, so outer wall bodies offset inward;
- court coordinates own void faces, so courtyard bodies offset away from the void;
- internal planning lines own centrelines.

DRW-03D makes the deterministic junction consequences explicit rather than allowing overlapping rectangles to imply false geometry:

1. the four courtyard bodies extend one wall-body thickness beyond their void-face endpoints so they form one continuous rectangular cut frame at the outer corners;
2. internal planning bodies terminate at the inner faces of permanent outer/courtyard wall bodies rather than running through them.

No new architectural fact is created by either operation; both derive from the face-ownership rule plus the authored body proxies.

The first rendering pass exposed one source defect: the provisional drawing↔family passage initially extended `200 mm` into the courtyard-wall body. DRW-03B.1 corrected the source rather than hiding the conflict in rendering code. The retained ≈`1200 mm` passage now spans X≈`2600–3800`, terminating exactly at the west courtyard wall’s current inner planning face X≈`3800`.

## 4. Openings and passages

Openings are created by cutting wall matter back to paper white after the cut bodies are drawn.

The scene contains **20 authorised cuts**:

- 4 canonical front openings;
- 7 internal open passages;
- 6 courtyard openings;
- 3 garden-side openings.

Window occurrences receive one minimal primary frame line across the opening body at `1:100`. Nine such window marks occur: three front, four courtyard and two garden.

The entrance, major court openings, garden logistics opening and seven internal circulation connections remain clean gaps. **No door leaf, swing, handing or hinge geometry is invented.**

## 5. Stair notation

The principal stair appears only at planning authority:

- ≈`2.5 × 2.5 m` reservation as a secondary provisional dashed box;
- three-segment trace expressing north → east → south flight topology;
- conventional `UP` marker and simple line arrowhead.

No tread layout, strings, well construction, guarding, handrail, nosings, headroom construction or compliance proof is drawn.

## 6. Reader-facing labels

Visible text uses human architectural names only:

- Drawing room
- Family room
- Entrance hall
- Study
- Gallery
- Service suite
- Garden dining
- Kitchen
- Courtyard

Neutral machine/source identities remain metadata only.

Two non-compass orientation phrases are shown:

- `Garden`
- `Front / street surrogate`

There is no true north arrow because no real site orientation is owned.

## 7. Dimensions and scale bar

The dimension burden is deliberately small:

- overall width `12000`;
- overall depth `10800`;
- court `3600 × 4000` inside the court.

Overall chains use secondary lines and 45° ticks. Room-by-room dimensions are absent.

A **30 mm physical graphic scale bar** represents `0–3 m` at `1:100`.

One short drawing note states: `Approx. planning wall bodies, openings and stair.`

## 8. Explicit refusals

The scene contains no north arrow, section marker, public figure number, visible machine ID, door swing, technical wall layer, service route, service-room packing, adaptation overlay, structural member, accessibility/compliance symbol or DRW/workflow label.

Those absences are authority protection, not incomplete drafting.

## 9. Proof

`publication-ground-plan.test.ts` proves:

- exact `1:100` scale and `120 × 108 mm` shell projection;
- all 14 wall bodies and all 20 authorised cuts;
- continuous courtyard-wall corner geometry;
- internal planning walls terminate at permanent-wall inner faces;
- the corrected drawing↔family passage ends exactly at the courtyard-wall inner face;
- nine minimal window frame marks and no door swing;
- provisional/topological stair notation only;
- human architectural labels with no reader-visible machine IDs;
- sparse dimensions and exactly 30 mm scale bar;
- no north/section marker;
- byte-deterministic SVG serialization with no workflow-history residue.

## 10. Handoff to DRW-03E

DRW-03E may generate this frozen scene deterministically, commit the controlled SVG under a publication-drawing output path, and prove that regeneration is byte-for-byte identical. It must not manually edit the SVG or change the scene composition while generating it; a semantic or visual defect returns to DRW-03D.
