<!-- nav-exclude: redirect -->
# DRW-01B — semantic graphic tokens

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-01B  
**Status:** DONE  
**Issue:** #154  
**Validation:** PR runs `39059722647` / #551 and `39059929251` / #552 — PASS

## 1. Purpose

Freeze the paper-space graphic grammar that later renderers must implement.

This packet converts DRW-01A’s qualitative precedent conclusions into a deliberately small set of executable visual roles. It does **not** implement a renderer and does not claim construction-document compliance.

The governing rule is:

> **Every graphic token expresses a semantic role in physical paper units. No drawing code chooses a local stroke, fill, font size or colour merely because it looks right.**

## 2. Physical line-width family

Ovid’s House uses four ordinary publication line weights:

| Token | Paper width | Semantic role |
|---|---:|---|
| `line.cut` | **0.50 mm** | matter intersected by the active plan/section cut plane; strongest ordinary architectural line |
| `line.profile` | **0.35 mm** | principal silhouette, major uncut boundary, strong opening/profile edge where hierarchy requires it |
| `line.primary` | **0.25 mm** | normal visible architectural edges beyond the cut plane |
| `line.secondary` | **0.18 mm** | secondary geometry, fixtures/context, dimensions, leaders, grids/datums, hatching and other subordinate notation |

These widths are selected from the conventional technical-drawing series rather than invented as SVG pixel values. Current ISO 128-2 establishes general line conventions for technical drawings; this publication adopts the physical-width discipline without presenting itself as an ISO construction-document set.

### 2.1 No fifth ordinary weight

Do not create 0.22 mm, 0.3 mm, 0.4 mm or similar local compromises.

A later packet may prove a rare need for an **exceptional emphasis** token (for example a section cut marker external to the drawing field), but such a token must be part of a conventional symbol and cannot become a fifth general geometry weight by stealth.

### 2.2 Reduction rule

The weights above are **final paper widths**. If a plate is geometrically reduced for the B5-territory robustness proof, the renderer/page compositor must preserve the intended printed line hierarchy rather than blindly scaling SVG stroke widths down with the geometry.

A drawing that becomes dependent on sub-0.18 mm required linework after composition has failed its page/scale choice.

## 3. Line geometry

Ordinary architectural geometry uses:

- `stroke-linecap: butt`;
- `stroke-linejoin: miter`;
- a controlled miter limit sufficient for ordinary orthogonal/roof geometry without long spikes;
- constant width for one semantic line role along a continuous element.

Rounded caps/joins are not the house style. They are permitted only where a conventional symbol requires them.

Dash patterns, overhead/hidden lines, grid/axis conventions and uncertainty notation are owned by DRW-01C. Their width must still map to this four-token family.

## 4. Cut matter and poche

### 4.1 Default cut hierarchy

Where a plan or section intersects **controlled solid matter** and material differentiation is not the reader task, the preferred overview treatment is:

- `line.cut` outline where an edge remains visible;
- **solid black cut poche** for the intersected matter;
- openings/voids remain paper white.

This makes the cut plane read immediately and is intentionally stronger than the current inspection-renderer convention.

### 4.2 Poche is not material proof

Solid cut poche means only **matter is cut here**. It does not assert masonry, concrete, timber or another material.

Material identity is shown only when:

1. the controlled architectural/technical source owns that identity; and
2. the drawing’s reader task requires the distinction.

### 4.3 Detail-scale transition

At a scale where the internal build-up of an assembly is itself the subject, blanket black poche may give way to controlled material boundaries/hatches. DRW-01C owns the scale bands; DRW-11 owns whether source authority is strong enough for a construction-like detail.

## 5. Hatch grammar

Hatch is information, not texture.

### 5.1 Base hatch token

- stroke: `line.secondary` = **0.18 mm**;
- minimum nominal paper spacing: **1.5 mm**;
- ordinary direction: **45°**;
- alternate **135°** only where adjacent controlled materials/assemblies require discrimination;
- no dense decorative cross-hatch merely to make a drawing look technical.

### 5.2 Hatch admission rule

A hatch enters a drawing only to communicate one of:

- controlled material identity;
- controlled assembly distinction;
- a conventional section/earth condition;
- an explicitly keyed analytical zone where a fill/hatch is clearer than linework alone.

Unsupported material specificity, aesthetic texture and photographic simulation are prohibited.

### 5.3 Reproduction rule

Dot/stipple fields, ultra-fine patterns and closely spaced tone screens are not primary publication devices. Warm uncoated stock and B5-territory reduction make them unnecessarily fragile.

## 6. Monochrome palette

The physical publication is **black-only first**. Every required distinction must remain intelligible without colour.

| Token | Output | Permitted task |
|---|---|---|
| `ink.primary` | 100% black | all essential geometry, text, dimensions and symbols |
| `ink.context` | approximately 60% black / neutral grey | non-essential surrounding/context geometry only |
| `ink.faint` | approximately 35% black / neutral grey | subordinate guides/context that may disappear without changing the claim |
| `paper` | white / stock colour | negative space, openings, voids |

Grey may change emphasis. **Grey may not be the only carrier of meaning.**

If low-contrast context disappears in an ordinary black-only reproduction, the architectural claim must remain intact.

## 7. Optional accent policy

There is **no publication accent colour in the frozen DRW-01B physical grammar**.

A later analytical or digital inspection surface may request one accent colour only if all of the following are true:

1. the packet records a specific reader task;
2. the same distinction also survives through line type, hatch, label, symbol or geometry;
3. conversion to greyscale preserves the argument;
4. the accent does not enter the PR-02 private book unless the black-only physical constitution is explicitly reopened.

DRW therefore does not freeze an accent hue here. An unused colour token would be speculative design-system clutter.

## 8. Drawing typography

### 8.1 Typeface ownership

Drawing annotations use the **publication sans-serif role**, not an independently branded drawing typeface.

The current working publication maps that role to the Arial / Helvetica / sans-serif family. Renderer code must consume a shared publication/drawing typography token rather than hard-coding an office-style typeface locally. If PR-02 later changes the production typeface, drawing typography changes through that mapping and is re-proved rather than forked.

### 8.2 Paper sizes

| Token | Size | Use |
|---|---:|---|
| `type.label` | **7.5 pt** | room/place names, principal human-readable drawing labels |
| `type.note` | **6.5 pt** | dimensions, levels, leaders, short technical notes, keys |
| `type.marker` | **6.5 pt bold** | compact conventional markers where weight is needed for recognition |

**6.5 pt is the minimum routine publication annotation size.** Anything requiring smaller type must first justify a different page class, drawing scale or annotation strategy.

### 8.3 Text rules

- human architectural names lead;
- sentence/title case is preferred over all-caps fields;
- machine IDs remain absent from publication profile unless PUB-NOM explicitly permits a reader task;
- dimension numerals should use tabular figures where the resolved production font supports them;
- annotation should normally be horizontal; rotated text is reserved for conventional dimension/level situations where it materially improves reading;
- no text follows decorative curves;
- multiline note leading must remain generous enough to survive B5-territory proof;
- room labels are not boxed merely for graphic identity.

### 8.4 Page text does not belong in the drawing

The SVG/drawing canvas does **not** own:

- publication title;
- chapter title;
- figure title;
- long explanatory caption;
- source/provenance paragraph;
- page number.

Those belong to page composition. The drawing contains only annotation needed to read the architecture.

## 9. Hierarchy examples

### Plan / section

- cut wall/slab/column: `line.cut` + cut poche where appropriate;
- principal external/profile edge beyond cut: `line.profile`;
- visible opening/frame/edge: `line.primary`;
- furniture/context/dimension/hatch/grid: `line.secondary`;
- surrounding site/context may additionally use `ink.context`.

### Elevation

There is no cut plane by default:

- principal silhouette / dominant profile: `line.profile`;
- visible facade edges/openings: `line.primary`;
- joints/context/secondary elements: `line.secondary`;
- depth is established by selective hierarchy, not arbitrary gradients.

### Analytical overlay

The underlying building remains recognisable through the same roles. The analytical layer does not receive heavier linework than the architecture merely because it is the topic of the page.

## 10. Forbidden renderer behaviour

Later renderer code must not:

- specify ad-hoc stroke widths outside semantic style tokens;
- use CSS/SVG pixel values as final print authority;
- hard-code local font sizes or families in domain drawing functions;
- use a material hatch without controlled source authority;
- use colour as the sole distinction between systems;
- reduce required annotation below 6.5 pt to make a crowded composition fit;
- encode titles/captions into each SVG because page composition is inconvenient;
- give provisional geometry the same graphic authority as controlled geometry.

DRW-03C should eventually lint these constraints where practical.

## 11. Validation note

The first PR run after this record (`39059248735` / #549) reported 124 rendered nomenclature occurrences despite source nomenclature, repository health and both PDF builds passing. The failure could not be reproduced:

- a branch-head rendered build passed with zero nomenclature failures;
- an exact replay of the PR pre-render sequence (`npm run check` → both PDFs → rendered validator) passed with a clean worktree;
- the synthetic PR merge tree contained no file differences from the branch head;
- subsequent full PR run `39059722647` / #551 passed all gates;
- after diagnostic machinery was removed, production-shaped PR run `39059929251` / #552 passed all gates again.

No validator was weakened and no source rule was changed to obtain green CI. The isolated first failure is therefore retained as a non-reproducible CI/render-extraction anomaly rather than converted into a fictional code defect.

## 12. Proof debt deliberately retained

These token values are now frozen for implementation, but **DRW-01 is not closed** until DRW-01E physically/simulated-print proves them at A4 and conservative B5-territory output.

DRW-01E is allowed to revise a token if the specimen demonstrates a real reproduction or legibility defect. Such a revision must update this record explicitly; subjective preference alone is not a reason to churn the family.

## 13. Handoff

**Next packet: DRW-01C — freeze scale bands, conventional symbols, dimension rules, uncertainty notation and label behaviour.**

DRW-01C must use this graphic family rather than inventing separate weights/type sizes for individual symbols.