<!-- nav-exclude: redirect -->
# DRW-04C — Controlled first-floor publication SVG

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-04C  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `556ec8003fcaf54a057b26ef47ee14adce1a3568`

## 1. Outcome

DRW-04C turns the already-proven DRW-04B first-floor `DrawingScene` into a controlled, deterministic publication SVG.

Controlled output:

- `docs/reference-house/publication-first-floor-plan.svg`

Generator:

- `compiler/reference-house/generate-publication-first-floor-plan.ts`

Regression lock:

- `compiler/reference-house/publication-first-floor-plan-artifact.test.ts`

No architectural geometry, source authority or renderer behaviour is added in this packet.

## 2. Generation chain

The controlled artefact is regenerated through one explicit chain:

```text
Reference House canonical source
  + DRW-04A first-floor publication source
  + DRW-03B shared wall/stair representation source
        ↓
Reference House compile — PASS required
        ↓
DRW-04B first-floor DrawingScene
        ↓
shared publication SVG serializer
        ↓
publication-first-floor-plan.svg
```

Generation calls `assertCanonicalArtefactGenerationAllowed('DRW-04C', result.status)`. A `REVIEW` or `FAIL` compile therefore cannot silently become a canonical publication artefact.

## 3. Controlled physical identity

The SVG carries explicit machine-readable lineage:

- view: `REFERENCE-HOUSE-FIRST-FLOOR-PLAN`;
- source: `RH-C1-REFERENCE-HOUSE`;
- scale denominator: `100`;
- physical size: `136 mm × 145 mm`;
- viewBox: `0 0 136 145`.

The drawing is therefore a true `1:100` paper-space artefact, not a fit-to-box illustration.

Its physical envelope deliberately matches the controlled ground-floor plan so DRW-04D can pair the two without rescaling either drawing.

## 4. Exact-byte authority

The committed SVG is not an editable design source.

`publication-first-floor-plan-artifact.test.ts` renders the canonical scene twice and requires:

1. both renders to be byte-for-byte identical;
2. the committed SVG file to equal the canonical render exactly.

Any manual SVG edit is therefore overwritten by regeneration and rejected by the test unless it first becomes an authorised source/renderer change in its owning packet.

## 5. Reader-facing content lock

The controlled output retains the bounded DRW-04B reader content, including:

- principal bedroom;
- south landing;
- east gallery;
- family bathroom;
- north landing;
- dressing / storage;
- linen;
- courtyard;
- restrained `DN` stair direction.

The artefact test also rejects technical or premature notation such as door-leaf/swing/hinge/handing language, stair-construction terms, north-arrow IDs and section-marker IDs.

Machine source IDs remain SVG metadata and are not substituted for human room names.

## 6. No new authority

DRW-04C does not:

- choose or move a wall, room, aperture or window;
- alter label anchors or stair notation;
- add technical wall, door or stair construction;
- add true north, site context or section cuts;
- compose the facing-page plan pair;
- prove plate-level collision or print readability.

If the controlled SVG exposes a real graphic defect, the smallest owning renderer packet must be corrected and this artefact regenerated. The SVG itself is never the repair surface.

## 7. Generation evidence

The first controlled generation was executed from the branch source by a temporary branch-only CI runner. That runner:

- installed locked dependencies;
- executed the canonical generator;
- ran the full RH-C1 test suite;
- committed only the generated SVG.

The temporary workflow is not part of the durable packet and is removed before review. Its purpose is execution only, not publication authority.

## 8. Handoff to DRW-04D

DRW-04D may now compose the two controlled plan artefacts as an identical-scale facing-page pair:

- `publication-ground-floor-plan.svg`;
- `publication-first-floor-plan.svg`.

It must prove:

- both remain physically `1:100` with no CSS or page-level rescaling;
- permanent shell/courtyard geometry registers across floors;
- the pair survives the frozen binding/gutter safe zone;
- labels, dimensions and page furniture remain readable on A4 and the conservative B5 proof condition;
- no cross-page composition introduces new architectural facts.

Any drawing-level defect discovered by the paired proof must reopen the smallest owning packet rather than being patched in page CSS.