<!-- nav-exclude: redirect -->
# DRW-05D — Controlled principal longitudinal-section artifact

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-05D  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `5aa3e71b49856a5b79e7c0a7847f1af188216cb4`

## 1. Outcome

DRW-05D turns the DRW-05C principal-section scene into the first controlled publication section artifact and proves that its frozen cut is registered against both controlled plan scenes.

New deterministic generator:

- `compiler/reference-house/generate-publication-principal-section.ts`

Controlled artifact:

- `docs/reference-house/publication-principal-section.svg`

Regression proof:

- `compiler/reference-house/publication-principal-section-artifact.test.ts`

No canonical Reference House geometry is changed. No section-renderer geometry is changed. No spread composition is attempted here.

## 2. Controlled artifact contract

The controlled SVG is generated only from:

1. canonical Reference House source;
2. canonical compile result;
3. DRW-05B principal-section publication source;
4. DRW-05C principal-section scene;
5. the shared publication SVG serializer.

Generation uses the same canonical-artifact guard as the controlled plan drawings and refuses generation unless the Reference House compile is `PASS`.

The artifact records:

- view ID `REFERENCE-HOUSE-PRINCIPAL-LONGITUDINAL-SECTION`;
- source ID `RH-C1-REFERENCE-HOUSE`;
- true scale `1:100`;
- literal physical SVG size `166 × 92 mm`.

The committed bytes are regression-locked against a fresh deterministic render. Manual SVG post-editing is therefore not an accepted path.

## 3. Cross-view registration

DRW-05A froze the principal section as:

- north–south;
- X = `6000 mm`;
- looking west;
- through the courtyard centreline.

DRW-05D proves that this is not merely a section-local coordinate.

The test suite verifies:

- section cut X = `6000 mm` equals the compiled shell centre X;
- ground plan, first-floor plan and section all remain `1:100`;
- the frozen cut maps to plan paper X = `68 mm` under the controlled plan projection;
- the ground south-court opening is centred on that cut;
- the ground north-court opening is centred on that cut;
- the ground centre garden/logistics opening is centred on that cut;
- the upper south-court opening is centred on that cut;
- the upper north-court opening is centred on that cut;
- the upper centre garden/dressing opening is centred on that cut.

This gives the section a real executable relationship to both plans rather than a visually plausible but independently authored alignment.

## 4. Why the plans do not receive `A–A` or `S01` markers here

DRW-01C requires a conventional section marker to carry a compact reader-facing reference only after the publication reference system has been frozen.

DRW-02 deliberately did **not** create a reader-facing figure/section-number family. PUB-NOM also prohibits inventing a new public identifier family ad hoc.

Therefore DRW-05D does **not** manufacture `A–A`, `S01`, `Section 1` or a machine-derived section ID merely to make the plans look like a conventional drawing set.

The geometric cross-registration is frozen now. A visible plan marker may be introduced later only when its reader-facing reference can be drawn from the publication's accepted reference architecture. Until then, omission is more honest than a temporary notation dialect.

The regression suite explicitly rejects accidental introduction of an `A–A` / `S01` style identity into the controlled plan scene.

## 5. What the controlled section contains

The artifact preserves exactly the DRW-05C scene contract:

- four cut-wall planning bodies;
- two `350 mm` inter-storey planning zones;
- six source-authorised vertical opening cuts;
- roof profile only;
- ground termination at FFL;
- three-flight stair with cut/beyond hierarchy;
- human architectural labels;
- restrained level markers;
- physical `3 m` scale bar;
- explicit approximate-planning note.

No drawing element gains additional architectural authority simply because it is now committed as a controlled SVG.

## 6. Explicit non-work

DRW-05D does not:

- alter the section cut, scale or view direction;
- change canonical plan/section geometry;
- create a public section-reference family;
- add plan section markers with invented references;
- invent foundations or site profile;
- introduce wall/floor/roof construction build-ups;
- invent stair construction;
- add services;
- compose the section spread;
- declare physical print proof complete.

## 7. Validation target

`publication-principal-section-artifact.test.ts` proves:

- fresh renders are byte-deterministic;
- the committed SVG is exactly the fresh canonical render;
- view/source/scale/physical-size lineage is present;
- packet/workflow history does not leak into the controlled SVG;
- the section cut is the shell centreline at X = `6000 mm`;
- both controlled plans share the same scale;
- all six section-crossed plan openings are centred on the same plan-paper cut coordinate;
- no ad-hoc `A–A` / `S01` public section identity is introduced.

## 8. Handoff to DRW-05E

DRW-05E may now compose and prove the principal section on its frozen `PLATE_SPREAD` page class.

It should test, at minimum:

1. true `1:100` placement with no page-level geometry rescaling;
2. the 12 mm-per-side critical fold exclusion from DRW-01D;
3. level-marker and label clearance from the fold/gutter;
4. physical text and line-weight legibility in A4/B5 proof output as applicable;
5. section readability as a front → stair/arrival → court → garden architectural sequence;
6. collision/overflow and vector-output integrity;
7. whether a reader-facing section marker can now be sourced from accepted publication reference architecture; otherwise retain the current marker omission.

If physical proof exposes a drawing defect, reopen the smallest owning packet. Do not repair the controlled SVG manually.
