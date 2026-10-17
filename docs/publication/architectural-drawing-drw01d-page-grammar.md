<!-- nav-exclude: redirect -->
# DRW-01D — publication page grammar

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-01D  
**Status:** DONE pending branch validation  
**Issue:** #154

## 1. Purpose

Freeze how controlled architectural drawings occupy the physical publication page before DRW-01E proves the system at print size and before DRW-02 assigns actual drawings to plates.

This packet owns:

- page classes;
- facing-page versus true-spread semantics;
- rotated-plate admission rules;
- plate furniture and caption ownership;
- running-furniture behaviour on plate pages;
- semantic gutter / edge safe zones;
- escalation rules when a drawing does not fit at its frozen scale.

It does **not** choose the book-wide drawing register, implement plate CSS, alter the renderer, harden architectural source geometry or replace any current publication figure.

The governing rule is:

> **The page may enlarge or pair a drawing, but it may not shrink away its architectural legibility or make the binding carry unique meaning.**

## 2. Authority boundary

DRW-01D sits between three already-frozen layers:

1. DRW-00C: portrait sewn physical object, current A4 duplex proof, B5-territory reduction proof and the page-class preference hierarchy;
2. DRW-01B: paper-space line weights, drawing type sizes, monochrome grammar and page-versus-drawing text ownership;
3. DRW-01C: approved scale family, scale-aware representation, conventional symbols, dimensions, uncertainty and label rules.

The current automated publication remains A4 portrait with mirrored margins of 30 mm inner / 22 mm outer and approximately 158 × 250 mm of ordinary body space. These are the proof baseline, not final hardback dimensions.

## 3. Page-class family

DRW uses five ordinary page classes. Foldouts remain outside the ordinary deterministic publication system.

| Class | Purpose | Key rule |
|---|---|---|
| `FLOW` | prose page with an inline figure | figure remains subordinate to reading flow |
| `PLATE_SINGLE` | one dedicated portrait plate | one drawing or tightly related drawing group occupies one page |
| `PLATE_PAIR` | two facing, individually complete plates | comparison without splitting either drawing |
| `PLATE_SPREAD` | one logical composition across two pages | one composition, two deterministic crops, gutter-safe semantics |
| `PLATE_ROTATED` | one dedicated page read after rotating the book | exceptional long/wide view only |

A future foldout is a PR-02 manufacturing decision, not a sixth default class.

## 4. `FLOW` — prose with inline figure

`FLOW` is the existing publication condition and remains appropriate for retained abstract doctrine figures and small explanatory material.

Rules:

- figure and caption stay with the surrounding prose;
- no architectural drawing is reduced below its useful frozen scale merely to remain inline;
- ordinary running heads and folios remain;
- the figure does not claim a dedicated plate identity merely because it is visually prominent;
- if a controlled scaled architectural drawing requires more room than the flow page permits, escalate page class rather than shrinking annotations.

`FLOW` is not the default for the six Reference House schematics already marked for replacement by DRW-00D.

## 5. `PLATE_SINGLE` — dedicated portrait page

This is the default architectural plate class.

Use it when one controlled drawing fits at an approved useful scale on one portrait page.

Rules:

- the architectural drawing receives the dominant page area;
- explanatory prose does not share the page except for restrained plate furniture/caption;
- running heads are suppressed;
- the folio may remain at the normal outer-bottom position;
- figure/plate title, scale ratio and caption sit outside the controlled SVG;
- the drawing may contain its own graphic scale bar where DRW-01C requires one;
- the caption remains attached to the plate and may not spill to a following page;
- no page-local styling may reduce DRW-01B line/type tokens.

The current A4 margin geometry is a proof implementation detail. A future dedicated-plate template may recover more page area, but only if the gutter/edge rules in this record remain satisfied.

## 6. `PLATE_PAIR` — facing, comparable pages

A pair is **two complete plates placed opposite one another**, not one drawing cut in half.

Typical use:

- ground and first floor plans at identical scale;
- two directly comparable elevations;
- before/after or primary/analytical readings only where the comparison itself is the reader task.

Rules:

- both pages use the same page class and comparable plate frame;
- paired orthographics use the same print scale unless a recorded reason makes direct scale comparison irrelevant;
- common orientation and registration are preferred where the architecture supports them;
- each drawing remains semantically complete if seen alone;
- a shared caption may serve the pair, but it must occupy one page or two clearly separated page-local blocks — never straddle the gutter;
- running heads are suppressed on both pages;
- folios remain on the two outer bottom corners;
- pagination may insert a deliberate blank beforehand so the pair lands as verso-left / recto-right.

If the meaning depends on continuous geometry crossing the binding, the correct class is `PLATE_SPREAD`, not `PLATE_PAIR`.

## 7. `PLATE_SPREAD` — one logical two-page composition

A spread is one paper-space composition emitted as deterministic left/right page crops.

It is justified only when a single-page plate at an approved useful scale materially underperforms and the reader benefits from continuity across two pages.

Likely candidates later include a long principal section, elevation sequence or the single earned sectional axonometric. DRW-02 must still authorise each case.

Rules:

- one canonical spread composition exists; left/right pages are generated crops, not independently edited drawings;
- the web may display the same composition continuously;
- the physical split is explicit in the plate specification;
- running heads are suppressed on both pages;
- folios remain only at the outer bottom corners;
- plate title/caption/legend must sit wholly on one side or in mirrored page-local blocks;
- no caption sentence, scale ratio, legend entry or key is split at the gutter;
- geometry may cross the fold only when its continuity remains intelligible with some central loss;
- unique semantic information may not depend on the fold region.

### 7.1 Semantic gutter exclusion zone

Until PR-02 has a real paper/binding specification, DRW freezes a conservative **12 mm zone on each side of the logical fold** — **24 mm total** — as the `gutter.critical-exclusion` band for true spreads.

Inside this band:

- continuous architectural geometry may pass through;
- repetitive hatch or noncritical context may pass through;
- no unique room/place label may sit;
- no dimension value or sole dimension terminator may sit;
- no section marker, north arrow, level datum, legend key or scale ratio may sit;
- no unique analytical route event / junction may rely on visibility there;
- no caption or explanatory text may cross it.

This is a project proof token, **not** a prediction that a sewn binding loses exactly 12 mm per page. DRW-01E must test it at A4 and conservative B5-territory size; PR-02 may increase it if the selected binding demands more loss. Reducing it below 12 mm requires physical evidence, not visual preference.

## 8. `PLATE_ROTATED` — exceptional 90° plate

The physical book remains portrait. Rotation is therefore exceptional.

A rotated plate is admitted only when all of the following are true:

1. a single portrait plate cannot carry the frozen drawing at a useful approved scale;
2. a facing pair would destroy the drawing’s continuity;
3. a true spread is materially worse because of the binding split or page rhythm;
4. rotating the page produces a clearly superior architectural reading.

Rules:

- the whole plate content rotates as one coherent reading field;
- drawing, title, scale and caption rotate together;
- the physical folio may remain in normal book orientation at the outer edge;
- no ordinary prose shares the rotated page;
- the reader should not need to rotate the book repeatedly within one short sequence;
- rotation is never used merely to make a plate feel technical or dramatic.

DRW-02 records any authorised rotated plate explicitly. There is no implicit auto-rotation based on aspect ratio.

## 9. Foldout boundary

A foldout is **not currently an executable DRW page class**.

It may be reconsidered only if a specific frozen drawing proves that:

- single page, pair, spread and rotation all materially damage the reader task; and
- the manufacturing complexity is justified for the 12-copy PR-02 object.

Until then, no renderer/view spec assumes foldout width and no plate depends on one.

## 10. Page-class escalation

A drawing that does not fit must be resolved in this order:

1. remove nonessential annotation while preserving the reader task;
2. use `PLATE_SINGLE` instead of `FLOW`;
3. if comparison is the task, use `PLATE_PAIR`;
4. if one continuous composition genuinely needs width, use `PLATE_SPREAD`;
5. use `PLATE_ROTATED` only when materially superior to the spread;
6. reconsider exact scale within DRW-01C’s approved family only after the page-class options are exhausted;
7. refuse or split the reader task if legibility still cannot be achieved.

Do not solve page pressure by shrinking drawing text below 6.5 pt, reducing required line weights or introducing an arbitrary scale.

## 11. Edge safe zones

The page margin and the drawing’s semantic safe zone are different concepts.

### 11.1 Plate-frame edge inset

Within every dedicated plate frame, required labels, dimensions, keys and markers keep a nominal **5 mm paper-space inset** from the plate-frame edge unless the geometry itself requires an edge condition.

Geometry may approach/cross the plate frame only when the plate specification deliberately clips it. Critical annotation may not depend on crop tolerance.

### 11.2 Binding side

For `PLATE_SINGLE`, `PLATE_PAIR` and `PLATE_ROTATED`, the page template must preserve at least the ordinary publication’s binding awareness. The current 30 mm inner margin is the A4 proof baseline; 01D does not freeze it as the final hardback margin.

For `PLATE_SPREAD`, the explicit 12 mm-per-side critical exclusion band controls semantic placement regardless of the final trim/margin values.

### 11.3 Outer / top / bottom edges

Critical plate information remains within the page-safe content frame; no important dimension, label or caption may depend on trim-edge precision or bleed. DRW currently has no authorised full-bleed architectural plate.

## 12. Caption and plate-furniture ownership

The publication layer owns:

- plate / figure title;
- visible numeric scale ratio;
- caption;
- optional concise legend/key that explains the plate as a publication object;
- figure/reference number if DRW-02 later introduces an approved PUB-NOM-compliant family;
- page number;
- source/provenance note where one genuinely serves the reader.

The controlled drawing/SVG owns:

- architectural geometry;
- room/place labels;
- dimensions and levels;
- conventional architectural markers;
- graphic scale bar where required;
- short leaders/notes needed to read the architecture.

The same sentence must not be duplicated in both layers.

### 12.1 Caption form

Captions should answer **what the reader is looking at and what architectural point the drawing makes**. They must not become a second essay.

Default order where all fields are needed:

`human plate title → scale ratio → concise caption → bounded source/provenance note`

Machine IDs, compiler hashes and build provenance remain outside ordinary plate furniture under PUB-NOM.

### 12.2 Caption typography

DRW-01D does not create a second caption type system. It uses the publication caption role already present in `publication/theme.css` (currently approximately 8.3 pt sans-serif) and requires DRW-01E to prove it at conservative B5-territory reduction.

## 13. Running furniture

Dedicated architectural plate classes (`PLATE_SINGLE`, `PLATE_PAIR`, `PLATE_SPREAD`, `PLATE_ROTATED`) suppress running heads so the drawing field is not framed by chapter-title noise.

Folios remain because the physical book still needs stable navigation:

- single/rotated plate: normal outer-bottom folio;
- pair/spread: folios at the two outer-bottom corners;
- no folio in the centre/gutter region.

Intentional blank pages continue to suppress all running matter under the existing publication grammar.

## 14. Page rhythm and recto/verso behaviour

Not every drawing must begin on a recto; forcing that would create needless blanks and turn plate placement into ceremony.

Rules:

- `PLATE_SINGLE` may occupy verso or recto according to book rhythm;
- `PLATE_PAIR` and `PLATE_SPREAD` must occupy a physical facing pair, with left page verso and right page recto;
- a blank may be inserted before a pair/spread where necessary to preserve that relationship;
- Part openings retain their existing recto authority;
- DRW-02E owns the actual plate sequence and book rhythm.

A later plate sequence should alternate density rather than producing a block of uninterrupted technical sheets where the manuscript needs reading cadence.

## 15. Cross-surface contract

The physical book is the authority for plate composition.

The web may:

- show a spread as one continuous SVG/composition;
- stack a facing pair responsively;
- provide zoom for inspection.

The web may not use zoom as evidence that the physical plate is legible. The same architectural content and scale semantics must remain intelligible in the print proof.

## 16. Implementation consequences for later packets

Later page-composition code must make page class explicit in the plate/view registry. It may not infer final publication class solely from SVG aspect ratio.

A controlled plate record will eventually need at least:

- page class;
- target print scale;
- logical plate frame;
- caption ownership/content reference;
- running-furniture profile;
- gutter/edge safe-zone profile;
- for pair/spread, left/right relationship and crop definition;
- rotation flag only for an explicitly authorised rotated plate.

DRW-02D/02E owns assignment of real views to these classes. DRW-03 onward earns the implementation vertically.

## 17. Fail-closed rules

A plate fails composition when any of these is true:

- required drawing annotation falls below DRW-01B minimum size;
- an unapproved arbitrary drawing scale is introduced to make it fit;
- required text/dimensions collide or clip;
- unique meaning enters the spread critical-exclusion band;
- a pair is implemented by splitting one semantically incomplete drawing;
- a spread is made from manually edited independent halves;
- caption/legend crosses the gutter;
- plate furniture duplicates drawing annotation materially;
- a rotated plate is selected automatically rather than deliberately;
- required plate meaning depends on screen zoom;
- page layout silently changes architectural geometry.

The later validator should automate the checks that can be expressed deterministically and leave architectural adequacy to explicit review.

## 18. Proof debt retained for DRW-01E

DRW-01D is doctrine, not physical proof.

DRW-01E must build a compact specimen that exercises at minimum:

- `FLOW` versus `PLATE_SINGLE` hierarchy;
- one facing `PLATE_PAIR`;
- one `PLATE_SPREAD` with the 24 mm total semantic gutter exclusion visibly tested;
- line/type/label/dimension tokens from 01B/01C;
- plate title, numeric scale and caption ownership;
- A4 full-size output;
- conservative B5-territory reduction;
- black-only reproduction.

01E may revise a 01B–01D token only where the proof exposes a real legibility, binding or compositional failure. Preference alone is not enough.

## 19. Handoff

**Next packet: DRW-01E — produce the bounded doctrine specimen/proof sheet and close DRW-01 only if it survives physical-size review.**

Do not begin DRW-02 until 01E has either frozen the doctrine or recorded and re-proved any required correction.