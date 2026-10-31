<!-- nav-exclude: redirect -->
# TYP-06A — publication-sans / drawing interface audit and specimen brief

Status: **CANDIDATE COMPLETE — merge required**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Owning stage: **#508 — TYP-06 — publication-sans / drawing interface contract**  
Packet: **#509 — TYP-06A — publication-sans boundary audit and specimen brief**  
Inherited TYP-05 freeze: `docs/publication/publication-typography-typ05c-mixed-content-freeze.md`  
Protected drawing baseline: **`drawing-publication-v1`** / DRW final merge `9865477c21164cb3478d75a679f37df7464115b8`

## 1. Question

TYP-06 does not choose another sans-serif family. Source Sans 3 is already the physically accepted publication companion from TYP-03, TYP-04 and TYP-05.

The remaining cross-programme question is narrower:

> **What exact Source Sans 3 contract may PLT rely on for drawing typography, and what must be proved before that dependency becomes real rather than nominal?**

TYP-06A freezes the boundary and the TYP-06B proof brief. It changes no production typography, drawing bytes, drawing sizes or PLT geometry.

## 2. Existing authority

### Publication side

The frozen publication system already establishes:

- family: **Source Sans 3**;
- existing accepted publication weights: **regular 400** and **bold 700**;
- TYP-05 plate furniture: Source Sans 3 title / scale / caption roles;
- tabular figures only where alignment materially benefits;
- no publication mono family;
- no unearned sans italic role.

The exact open-font pins already exist in `publication/specimens/typ03/open-fonts.ts`:

- `SourceSans3-Regular.ttf` from `adobe-fonts/source-sans@87b37a2daaed80fcb8e8ccb0085c4d72ddade12e`;
- `SourceSans3-Bold.ttf` from the same exact upstream commit;
- both are Git-blob verified before proof use;
- the existing open-font path records `pdf-embed-ok` under the Source licence evidence.

TYP-06 must reuse these exact inputs rather than create a second font supply chain.

### Drawing side

DRW-01B deliberately established that drawing annotations consume the **publication sans-serif role**, not an independent drawing face.

Its current released paper-space text roles are:

| Drawing role | DRW v1 paper size | Weight | Current task |
|---|---:|---:|---|
| `label` | 7.5 pt | 400 | room/place names and principal human-readable labels |
| `note` | 6.5 pt | 400 | dimensions, levels, leaders, short notes, keys, scale numerals |
| `marker` | 6.5 pt | 700 | compact conventional markers such as `UP` |

DRW v1 also records **6.5 pt as the minimum routine publication annotation size**. TYP-06 does not convert that historical DRW value into an eternal PLT size rule; it uses the existing v1 sizes as the correct physical stress territory for testing Source Sans 3.

## 3. The actual shared renderer seam already exists

The released publication-drawing path is structurally well prepared for TYP-06.

`compiler/publication-drawing/model.ts` exposes only three semantic text roles:

- `label`;
- `note`;
- `marker`.

`compiler/publication-drawing/tokens.ts` centralises:

- paper-space text sizes;
- weights;
- one `fontFamily` value.

`compiler/publication-drawing/svg.ts` consumes that token centrally when generating `.text-label`, `.text-note` and `.text-marker`. Domain drawing functions do not choose local font families.

Canonical publication generators such as `compiler/reference-house/generate-publication-ground-plan.ts` pass their semantic scene through `renderDrawingSceneSvg()`. Therefore the TYP/PLT interface does **not** need a new drawing typography subsystem. The correct seam is the existing publication-drawing token layer.

### Current provisional value

The one unresolved identity is explicit:

```text
PUBLICATION_DRAWING_TOKENS.fontFamily = 'Arial, Helvetica, sans-serif'
```

That is exactly the provisional DRW posture the TYP programme was created to retire.

## 4. Important evidence gap: a family name is not an exact-font contract

Changing the token string from Arial to `Source Sans 3` would be insufficient proof.

The current SVG renderer writes a CSS family declaration but does not carry exact font bytes or an independently verified rendered-font identity. The resulting glyphs still depend on the rendering environment having a matching family available.

TYP-03/04/05 already demonstrated why this distinction matters: verified font inputs can still yield the wrong finished PDF if the rendering boundary silently falls back.

Therefore TYP-06B must prove **both**:

1. the semantic drawing token requests Source Sans 3; and
2. the finished physical proof actually embeds the exact pinned Source Sans 3 faces with no system fallback.

The proof must not claim success merely because generated SVG text contains `font-family: Source Sans 3`.

## 5. Current publication hard-coding is separate integration debt

Two reader-facing publication surfaces still carry the old working Arial mapping:

### `publication/theme.css`

The working theme still defines:

- `--hk-sans: Arial, Helvetica, sans-serif`;
- running heads and folios with direct Arial-family declarations.

### `publication/plates.ts`

Plate-page furniture still directly specifies Arial for:

- plate page family;
- 11 pt bold plate title;
- 8.3 pt scale;
- 8.3 pt caption.

TYP-05 has already frozen the **book-side** replacement contract for these plate roles as Source Sans 3. TYP-06A records these as later production-integration seams; they do not justify broadening TYP-06B into a whole-book theme migration.

The drawing-interface proof should stay focused on drawing-internal text and the shared renderer token.

## 6. Non-publication semantic inspection typography is out of scope

`compiler/reference-house/drawings.ts` contains older `system-ui` and monospaced styling for RH-C1 semantic/inspection outputs.

Those drawings are not the released DRW publication path. The controlled DRW publication generators use `compiler/publication-drawing/*` and the publication-specific Reference House scene builders.

TYP-06 must not turn a bounded publication interface packet into a cleanup of every SVG in the repository. Inspection/proof artefacts may keep typography appropriate to their own role unless another owning programme changes them.

## 7. Smallest Source Sans 3 contract earned by current drawings

TYP-06B should admit no more font surface than the current drawing grammar actually uses.

### Required faces

- **Source Sans 3 Regular / 400** — required by `label` and `note`;
- **Source Sans 3 Bold / 700** — required by `marker`.

### Italic

**No drawing sans italic role is currently earned.**

The publication-drawing model has no italic semantic role, the released DRW token set expresses only 400/700 weights, and the representative publication drawings do not require italic distinction. TYP-06B should not fetch or introduce a Source Sans italic merely for family completeness.

If PLT later demonstrates a real drawing task that requires italic semantics, that is an explicit interface extension rather than an assumed hidden capability.

### Numerals

Numerals are materially important because `note` currently carries:

- overall dimensions;
- level strings;
- scale-bar values;
- courtyard dimensions;
- directional / technical notes containing numbers.

DRW-01B says dimension numerals should use tabular figures where the resolved production font supports them. TYP-05 separately froze tabular figures where alignment materially benefits.

TYP-06B must therefore test Source Sans 3 tabular numeral behaviour on real dimension/level/scale content. It must **not** assume OpenType support merely from the family name.

The existing `note` role mixes numeric and prose content. If tabular figures are visually harmless across that role, a role-level feature may be the smallest interface. If they materially damage prose-like notes, TYP-06B may demonstrate the need for a minimal semantic numeral flag. It must not create a new type family or a gratuitous proliferation of drawing text roles.

## 8. Representative real-content specimen

TYP-06B should use the released DRW scene machinery and real Reference House annotation, not lorem ipsum or a synthetic type specimen.

### Ground-floor plan specimen

Use the canonical ground-plan scene to cover all three text roles and ordinary plan conditions:

**`label` / 7.5 pt regular**

- `Drawing room`;
- `Entrance hall`;
- `Gallery` with leader;
- `Service suite`;
- `Kitchen`;
- `Courtyard`.

**`note` / 6.5 pt regular**

- canonical overall width and depth dimensions;
- courtyard `width × depth` dimension;
- `Garden`;
- `Front / street surrogate`;
- scale-bar `0` and `3 m`;
- `Approx. planning wall bodies, openings and stair.`

**`marker` / 6.5 pt bold**

- `UP`.

This one drawing already proves ordinary labels, a leader, dimensions, multiplication sign, marker weight, directional/context notes and scale numerals against real architectural linework.

### Principal-section specimen

Use the canonical principal section to stress vertical/datum annotation and multi-line labels:

- `Entrance hall / stair`;
- `South landing / stair`;
- `Open courtyard`;
- `Ground FFL ±0`;
- upper level/elevation strings with `+` values;
- scale-bar `0` / `3 m`;
- the existing approximation note.

This adds `±`, signed level numerals, datum adjacency and the more constrained 166 × 92 mm section field.

### No invented content

A separate alphabet/glyph chart is not required. The existing two drawings contain the actual characters, word lengths, numeric forms and close-to-linework conditions the interface must survive.

## 9. Physical proof territory

### BOOK is the decisive TYP-06B proof

TYP-06B should prove the two representative drawings at their controlled **paper-space sizes**, preserving the existing 7.5 / 6.5 / 6.5 pt DRW v1 text territory.

Required proof:

- black-only;
- conservative B5 physical page territory for actual-size inspection;
- A4 counterpart for repository regression/comparison where useful;
- no fit scaling of the drawing typography;
- exact pinned Source Sans regular/bold transported into the proof;
- finished-PDF `pdffonts` fail-closed check for Source Sans regular/bold and against Arial, Helvetica, Liberation or another system fallback.

### WALL proof is not earned in TYP-06B

TYP-06 is proving family identity and small-size reproduction, not final PLT composition. WALL typography is explicitly intended to remain physically restrained rather than theatrically enlarge with the sheet.

A separate A2/A1 proof would therefore add little evidence at this interface stage. PLT owns BOOK/WALL placement and final paper-space tuning. TYP-06B should stay on the harsher BOOK territory unless the BOOK proof exposes a concrete output-profile interaction that earns a WALL cross-check.

## 10. Comparison boundary

TYP-06B should compare **font substitution only** against the protected DRW v1 typography geometry.

Keep fixed:

- architectural scene content;
- paper dimensions;
- existing DRW v1 label/note/marker sizes;
- text weights by semantic role;
- anchors and rotations;
- line and poche grammar;
- placement/collision decisions.

Change only the font-resource path needed to prove Source Sans 3 and any narrowly required numeral feature.

This is important because a new family can alter text width, collision and perceived density. Those effects are precisely what the specimen should expose; they must not be concealed by simultaneously retuning PLT geometry.

If Source Sans 3 causes a collision or fit failure, record it. Do not silently move labels in TYP-06B. PLT may later decide whether the drawing-specific geometry should change once the family contract is frozen.

## 11. Shared API boundary to prove, not yet implement globally

The intended contract remains the existing central token seam:

- publication family identity enters once at `compiler/publication-drawing/tokens.ts` or a directly shared typography value consumed there;
- `svg.ts` derives drawing text CSS from semantic roles;
- individual Reference House drawing functions remain ignorant of the family name;
- no drawing view hard-codes Source Sans 3 locally.

TYP-06B may use a specimen-only override/injection mechanism so `drawing-publication-v1` and canonical generated bytes remain protected during testing.

Production mutation of the shared token belongs only after physical acceptance and explicit TYP-06 closeout. Do not overwrite historical v1 artefacts merely to make the specimen convenient.

## 12. Rejection / escalation criteria

TYP-06B must not freeze the interface if any of the following occur at actual BOOK size:

- Source Sans 3 regular or bold silently falls back in the finished PDF;
- 6.5 pt routine notes/markers materially fail ordinary black-only legibility;
- 7.5 pt labels materially collide or become unacceptably wide solely because of the family substitution;
- bold markers lose required recognition at 6.5 pt;
- real dimension/level numerals are ambiguous or poorly aligned;
- tabular-number treatment introduces a new material defect;
- exact-font transport requires mutating the protected DRW v1 release or inventing drawing-local font machinery.

A failure should reopen the smallest relevant interface assumption. It does not reopen Source Serif, body metrics, TYP-04 hierarchy or the architectural drawing content by default.

## 13. TYP / PLT authority after this audit

### TYP-06 owns

- Source Sans 3 identity at the drawing interface;
- admitted regular/bold faces;
- exact-font transport / finished-PDF evidence;
- numeral-feature contract where required;
- proof that the family survives representative small annotation territory;
- the shared family/API seam consumed by PLT.

### PLT still owns

- whether 7.5 pt / 6.5 pt remain the final v2 drawing sizes;
- label hierarchy refinements;
- collision and anchor behaviour;
- leader spacing;
- dimension hierarchy;
- per-output BOOK/WALL paper-space tuning;
- drawing composition and architectural articulation.

TYP proves the typographic substrate. PLT designs the drawing with that real substrate.

## 14. Result

The interface is simpler than a new typography subsystem:

1. **Source Sans 3 Regular + Bold are the only current drawing faces that need proof.**
2. **No drawing sans italic is currently earned.**
3. **The existing `PUBLICATION_DRAWING_TOKENS` seam is the correct shared API location.**
4. **The unresolved defect is exact font-resource/rendered identity, not semantic role architecture.**
5. **Real ground-plan + principal-section annotations provide sufficient TYP-06B coverage.**
6. **BOOK territory is the decisive physical stress; a separate WALL proof is not currently earned.**
7. **No production or PLT geometry change should occur before the exact-font specimen is physically accepted.**

Next packet after a clean TYP-06A merge: **#511 — TYP-06B — exact Source Sans drawing-interface specimen**.
