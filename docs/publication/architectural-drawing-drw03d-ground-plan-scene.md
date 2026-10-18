<!-- nav-exclude: redirect -->
# DRW-03D — Ground-floor publication-plan scene

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-03D  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `72e27764943cbeba9da6573b7dacb7d32f769937`

## 1. Outcome

DRW-03D composes the first native Reference House architectural plan scene from:

- canonical RH-C1 compiled geometry;
- the bounded publication-plan source added by DRW-03B;
- the physical-mm scene/projection/SVG foundation frozen by DRW-03C.

The scene builder is:

- `compiler/reference-house/publication-ground-plan.ts`

Focused proof is:

- `compiler/reference-house/publication-ground-plan.test.ts`

This packet deliberately stops before committing a controlled generated SVG. DRW-03E owns generation/lineage/determinism of the committed artefact.

## 2. Scale and paper territory

The plan remains exactly **1:100**.

At that scale the canonical `12,000 × 10,800 mm` shell occupies exactly:

- `120 × 108 mm` on paper.

The drawing scene is `136 × 145 mm`, leaving only `8 mm` lateral drawing-space margin around the house geometry. This is intentional. The B5-territory proof gives approximately `138 mm` body width, so the plan is designed to fit the conservative physical target without reducing scale.

The consequence is useful discipline: dimensioning and notes must remain sparse. This is an architectural publication plan, not a tender sheet.

## 3. Cut matter

Every canonical ground boundary is represented as cut matter using solid black poche.

The plan contains:

- four outer cut-wall bodies;
- four courtyard cut-wall bodies;
- six internal planning-boundary bodies.

Total: **14 cut-wall bodies**.

Wall bodies use DRW-03B’s explicit representation proxies:

- outer/court `≈400 mm` planning body;
- internal `≈125 mm` planning body.

The source metadata remains provisional. Black poche means only that planning matter is cut at this representation scale; it does not promote those proxies into construction thickness or material truth.

Wall direction follows DRW-03B face ownership:

- shell coordinates are outer faces, so outer wall bodies offset inward;
- court coordinates are void faces, so court wall bodies offset away from the void;
- internal planning lines are centrelines, so internal bodies offset equally to both sides.

## 4. Openings and passages

Openings are created by cutting the black body back to paper white after all cut matter is drawn.

The scene contains **20 authored cuts**:

- 4 canonical front openings;
- 7 internal open passages;
- 6 courtyard openings;
- 3 garden-side openings.

This ordering is deliberate: wall intersections remain visually continuous first, then source-owned openings remove only the required matter.

### Windows

Window occurrences receive one minimal primary frame line across the opening body at `1:100`.

Nine such window marks occur:

- three front windows;
- four courtyard windows;
- two garden windows.

The mark is sufficient to distinguish a window from an open passage without claiming frame, sash, reveal or threshold construction.

### Entrance / major openings / passages

The principal entrance, court major openings, garden logistics opening and seven internal circulation connections are represented as clean gaps.

**No door leaf, swing, handing or hinge geometry is invented.**

This is especially important internally: the source owns adjacency and planning passage geometry, not a door schedule.

## 5. Stair notation

The selected principal stair appears only at the authority actually owned.

The scene shows:

- the DRW-03B `≈2.5 × 2.5 m` planning reservation as a secondary `1/1 mm` provisional dashed box;
- a three-segment trace expressing the selected north → east → south flight sequence;
- a conventional `UP` marker;
- a simple line arrowhead.

It does **not** show:

- tread lines;
- exact landings or well;
- strings;
- balustrade;
- handrail;
- nosings;
- headroom construction;
- compliance proof.

The notation makes the hall/stair relationship inspectable without turning RH-03’s planning topology into invented technical geometry.

## 6. Reader-facing labels

Only human architectural names appear visibly:

- Drawing room
- Family room
- Entrance hall
- Study
- Gallery
- Service suite
- Garden dining
- Kitchen
- Courtyard

Source IDs remain machine metadata only.

The scene adds two non-compass orientation phrases:

- `Garden`
- `Front / street surrogate`

These help the reader understand the frozen type while explicitly refusing a true site orientation.

## 7. Dimensions and scale bar

The drawing uses the minimum dimension burden needed for architectural inspectability:

- overall width `12000`;
- overall depth `10800`;
- court `3600 × 4000` noted inside the court.

Overall dimension chains use secondary lines and DRW-01C 45° ticks. Room-by-room dimensioning is deliberately absent.

The drawing includes a **30 mm physical graphic scale bar**, representing `0–3 m` at `1:100`.

A short note states:

> Approx. planning wall bodies, openings and stair.

This makes the provisional representation visible without filling the drawing with repeated uncertainty labels.

## 8. Explicit refusals

The scene contains no:

- north arrow;
- section marker;
- public figure number;
- machine ID in visible text;
- door swing;
- technical wall layer;
- service route;
- utility/WC/plant packing;
- adaptation overlay;
- structural member;
- accessibility/compliance symbol;
- DRW packet/history label.

Those absences are intentional authority protection, not unfinished drafting.

## 9. Proof

`publication-ground-plan.test.ts` proves that:

- scale remains exactly `1:100`;
- shell paper size remains exactly `120 × 108 mm`;
- all 14 ground wall bodies are cut matter;
- all 20 authorised opening/passages cut those bodies;
- only window occurrences gain simplified frame marks;
- no door leaf/swing appears;
- stair notation stays provisional and topological;
- nine human architectural labels are present;
- no machine IDs become visible text;
- dimension burden remains bounded;
- graphic scale bar is exactly `30 mm` long;
- no true north or section marker appears;
- repeated scene construction/SVG serialization is byte-deterministic;
- no DRW/workflow residue appears in serialized output.

## 10. Handoff to DRW-03E

DRW-03E may now:

1. generate the scene deterministically;
2. write the controlled ground-floor SVG to a canonical generated-output path;
3. record source/view/style lineage in machine metadata without reader-facing workflow residue;
4. prove the committed SVG is byte-for-byte identical to regeneration;
5. add a generation/check command only if the existing artifact-generation structure genuinely needs it.

DRW-03E must not manually edit the SVG or change architectural composition while generating it. A visual/semantic problem found there returns to DRW-03D.
