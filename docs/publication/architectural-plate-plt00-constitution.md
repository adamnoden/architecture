# PLT-00 — constitution, baseline and scope freeze

**Programme:** PLT — Architectural Plate Refinement  
**Parent:** #422  
**Packet:** #628  
**Packet baseline:** `60de4d04961676a540eac9e141207e32337dc7ba`  
**Historical drawing release:** `drawing-publication-v1` / `9865477c21164cb3478d75a679f37df7464115b8`

## 1. Purpose

PLT begins from a drawing system that is already controlled and released. Its job is not to rescue incorrect drawings or invent a new visual brand. It is to test whether the same controlled architecture can become a materially better architectural plate system without losing semantic fidelity, evidential honesty or deterministic regeneration.

The invariant is:

> Any aesthetic improvement that makes the architectural state less inspectable is a regression.

PLT therefore treats `drawing-publication-v1` as an immutable historical comparison object. V2 work may derive from later controlled Reference House authority where explicitly traced, but it may not silently rewrite what v1 meant.

## 2. Frozen authority boundary

### Protected v1 comparison surface

- release identity: `drawing-publication-v1`;
- release merge: `9865477c21164cb3478d75a679f37df7464115b8`;
- canonical closeout: `docs/publication/architectural-drawing-drw12e-closeout.md`;
- precedent constitution: `docs/publication/architectural-drawing-drw01a-precedents.md`;
- graphic-token doctrine: `docs/publication/architectural-drawing-drw01b-graphic-tokens.md`;
- scale / notation doctrine: `docs/publication/architectural-drawing-drw01c-notation.md`;
- page grammar: `docs/publication/architectural-drawing-drw01d-page-grammar.md`;
- machine freeze: `compiler/drw-freeze/drw12e-freeze.json`.

The current `main` is a source/repository baseline, not a replacement identity for v1.

### Architectural/source changes

PLT may expose a source defect but may not repair it cosmetically. A genuine architectural change must:

1. be routed to the owning architectural authority;
2. be merged there as an explicit source change;
3. identify affected PLT views;
4. be separated in later semantic comparison from representational refinement.

Site-specific DPL facts do not migrate into the canonical Reference House merely to improve a plate. DPL may interrupt PLT only if it changes canonical Reference House authority used by the drawings.

## 3. Frozen scope tiers

### FRAME-GRADE

The following eight views carry the full BOOK + WALL quality bar:

1. ground-floor plan;
2. first-floor plan;
3. principal front elevation;
4. principal longitudinal section;
5. courtyard elevation;
6. garden elevation;
7. roof / drainage plan;
8. sectional axonometric.

### Supporting publication views

The remaining nine released views inherit the refined grammar but remain explanation-first:

- synthetic setting / type plan;
- external maintenance / setting overlay;
- structural / span overlay;
- service / transverse section;
- service-side elevation;
- ground-floor service / maintenance overlay;
- first-floor service / maintenance overlay;
- roof water / failure overlay;
- entrance-storey future-adaptation overlay.

No supporting view is required to manufacture wall-art character to justify its existence.

## 4. Frozen physical profiles

### BOOK

- publication use;
- conservative B5 territory with A4 regression proof;
- conventional architectural scales;
- legible without zoom;
- restrained annotation;
- obeys the publication page/spread grammar.

### WALL

- autonomous plate use;
- A2 default for FRAME-GRADE views;
- A1 only when a specific view demonstrably earns it;
- same semantic drawing grammar as BOOK;
- no arbitrary fit scale;
- typography remains physically restrained rather than scaling theatrically with the sheet.

BOOK and WALL are two controlled embodiments of one semantic drawing, not two designs.

## 5. Aesthetic constitution retained

PLT retains the bounded DRW precedent families:

1. Caruso St John — restrained monograph orthographics;
2. Glenn Murcutt / *Thinking Drawing, Working Drawing* — physical-scale seriousness and source-to-detail continuity;
3. DETAIL — disciplined technical density where information earns it;
4. Atelier Bow-Wow / *Graphic Anatomy* — sectional synthesis without rendering theatre;
5. Drawing Matter / projected-section lineage + Cedric Price — analysis attached to architecture rather than detached consultancy graphics.

The rule remains:

> Borrow conventions that make architecture more inspectable. Do not borrow another architect’s visual personality.

Rejected as primary languages: photorealism, post-digital collage, atmospheric texture, competition-board composition, consultancy graphics, raw BIM plots, faux hand drawing, ornamental historic drafting, decorative hatch, gratuitous axonometric display, colour used to manufacture interest, invented furniture/people/vegetation and custom symbols where ordinary architectural convention suffices.

## 6. Semantic-diff contract

Every later candidate must distinguish three classes of change against v1:

- **R — representational:** line hierarchy, typography, placement, spacing, sheet composition or other graphic treatment with unchanged architectural meaning;
- **S — source-traced:** architectural/content change caused by an explicit accepted upstream source revision;
- **X — unexplained:** factual/semantic change with no controlled source authority.

`X` is always a failure. It cannot be waived because a candidate looks better.

A candidate may only progress when every substantive difference is R or S and every S item names its upstream authority.

## 7. Typography interface

TYP-06 is now available as an input to later PLT work:

- family: Source Sans 3;
- admitted drawing faces: Regular/400 and Bold/700;
- drawing italic: not admitted;
- tabular figures available where numeric alignment earns them;
- exact pinned font resources with finished-PDF fallback checks;
- shared seam: semantic `label` / `note` / `marker` roles through `PUBLICATION_DRAWING_TOKENS` and the shared SVG renderer;
- drawing views must not hard-code a separate family.

The DRW v1 7.5 pt / 6.5 pt / 6.5 pt sizes remain proven territory, not mandatory PLT v2 values. PLT-03 owns any later drawing-specific hierarchy or size decision.

PLT-00 makes no token or renderer change.

## 8. Proof and restart discipline

Later packets must keep proof artefacts under a dedicated PLT proof namespace and preserve source identity in any manifest. At every clean packet boundary record:

- packet baseline and exact PR head;
- changed source/render/proof files;
- semantic-diff result where drawing bytes change;
- BOOK/WALL output profile and physical proof state where relevant;
- CI/proof run identities;
- any upstream architectural source change;
- next authorised packet.

No packet may claim physical acceptance without an actual physical review verdict.

## 9. PLT-00 closeout decision

PLT-00 freezes the programme without changing a drawing.

- `drawing-publication-v1` remains protected;
- scope tiers are fixed;
- BOOK/WALL are fixed as output profiles rather than separate designs;
- precedent and rejection language are fixed;
- semantic-diff and upstream-rewind rules are fixed;
- the TYP-06 interface is available for later use;
- no aesthetic renderer work is performed here.

**Next authorised packet after clean merge: PLT-01 — forensic precedent re-read + current 17-view audit.**
