<!-- nav-exclude: redirect -->
# Architectural drawing programme

**Programme:** DRW  
**Handoff issue:** #154  
**Execution plan:** `docs/publication/architectural-drawing-execution-plan.md`  
**Status:** active programme; blocks PR-02 physical-object production until DRW-12 closeout

## 1. Purpose

Ovid’s House has a representation problem rather than a shortage of architectural thought.

The Working Edition describes a coordinated Reference House with programme, courtyard morphology, structural concept, concentrated service flank, sectional order, opening grammar, roof/water logic, maintenance geography and bounded tectonic language. Yet much of that architecture is represented through schematic rectangles and prose-heavy explanatory graphics.

The present figures therefore underperform the work in four ways:

1. **Insufficient architecture.** The reader is told about the house more often than allowed to inspect it through plans, sections, elevations, roof drawings, details or a synthetic three-dimensional view.
2. **Representation drift.** Reader-facing Reference House SVGs are separately authored from deterministic compiler-derived geometry, so publication graphics can simplify or contradict the controlled model without current bounds checks noticing.
3. **Wrong visual register.** Repeated heading + subtitle + box diagram + prose-sidebar compositions read like presentation-deck information design rather than an architectural monograph.
4. **Weak verification.** Current figure checks catch gross SVG overflow, not semantic parity, cross-view disagreement, text collisions, print scale, architectural drawing grammar or page/spread failure.

DRW is therefore not a cosmetic illustration pass. It is a bounded architectural-representation programme: strengthen only the source geometry the book genuinely needs, evolve the existing deterministic output layer into a native mathematical architectural renderer, and compose the resulting drawings deliberately in the publication.

## 2. Governing rules

### 2.1 Architecture first; analysis second; explanation third

The Reference House should first be encountered through ordinary architectural drawings. Analytical overlays then explain structure, services, water, maintenance and hierarchy. Prose explains consequences after the reader can inspect the building.

**here is the house → here is what it is doing → here is why**

### 2.2 One geometry, several readings

Publication drawings, inspection views and analytical overlays may use different annotation and graphic profiles, but they share canonical geometry wherever the project owns it.

A service overlay may simplify a plan. It must not own another plan.

### 2.3 No invented precision

A polished drawing is not permission to manufacture architecture.

When a requested view exposes missing geometry, the programme may only:

1. strengthen the canonical source deliberately;
2. show the condition as provisional/ranged/unresolved using normal architectural notation;
3. refuse the requested level of specificity.

The renderer must never turn graphic plausibility into architectural authority.

### 2.4 Architectural convention before graphic novelty

A practising architect should not need to learn an Ovid’s House dialect to read a plan, section, elevation or detail.

The publication may acquire a recognisable editorial hand through restraint, line hierarchy, typography, proportion and selection. It should not invent symbols where established architectural convention already works.

### 2.5 Publication and inspection are different surfaces, not different truths

The renderer needs at least two profiles over the same controlled state:

- **inspection** — semantic IDs, authority/uncertainty notation, compile identity and diagnostics;
- **publication** — human architectural naming, conventional notation, restrained uncertainty cues and no compiler-interface clutter.

### 2.6 Math first, SVG second, no CAD

The project does not need a CAD application, browser modelling environment, Revit substitute, Blender workflow or generic solid-modelling kernel in order to make excellent drawings.

The core remains explicit deterministic mathematics:

- points, vectors, segments, polylines and polygons in world coordinates;
- levels, hosted openings and bounded architectural objects;
- deterministic plan/section/elevation/parallel projections;
- clipping, intersections and visibility only where real drawings demand them;
- SVG as the vector output medium.

A small geometry dependency may be introduced when it clearly improves robustness. CAD/BIM dependency is justified only if a future concrete drawing requirement proves the bounded native approach insufficient.

### 2.7 The page is part of the drawing

A beautiful SVG that lands badly in the book is not a successful drawing.

Print scale, page class, aspect ratio, orientation, gutter, caption relationship and minimum readable text/line weight are therefore early design inputs, not late publication cleanup.

### 2.8 Do not overfit Reference House 01

Generic drawing primitives may understand walls, openings, cuts, levels, slabs, roof faces and annotations. They must not encode “courtyard ring”, “four bays” or “service flank” as renderer assumptions.

Small synthetic fixtures must prove reuse beyond RH01.

## 3. Visual register

The target is not one office style copied wholesale. Four traditions are useful for different tasks.

### Restrained British professional monograph drawing — primary grammar

**Reference:** Caruso St John project drawing sets.  
Examples:
- https://carusostjohn.com/projects/house-lincolnshire/
- https://carusostjohn.com/projects/private-house-north-london/
- https://carusostjohn.com/projects/st-pancras/

Useful qualities: architecture dominates the page; plans/sections/elevations remain quiet and conventional; hierarchy comes from linework rather than graphic theatre.

### DETAIL-style technical editorial drawing — detail grammar

**Reference:** DETAIL magazine / DETAIL Inspiration.  
Examples:
- https://www.detail.de/en/magazine
- https://www.detail.de/en/search?type=drawings

Useful qualities: disciplined line-weight hierarchy, material hatch used as information, dense but economical technical drawing and obvious scale.

### Atelier Bow-Wow — synthesis / architectural anatomy

**Reference:** *Graphic Anatomy Atelier Bow-Wow*.  
Example: https://www-s.jp.toto.com/publishing/detail/A0278_e.htm

Useful qualities: one sectional-perspective drawing can make a building intelligible as a whole; section and three-dimensional reading coexist without becoming photoreal rendering.

Use this as precedent for one earned hero sectional axonometric/cutaway, not as the default house style.

### British analytical drawing / projected section — overlays

**References:**
- https://drawingmatter.org/stalder-projected-sections/
- https://www.cca.qc.ca/en/archives/380477/cedric-price-fonds/396839/projects/399301/fun-palace-project

Useful quality: analytical information remains attached to architectural geometry rather than collapsing into detached flowcharts.

### Explicitly rejected as primary language

- presentation-deck / thought-leadership graphics;
- post-digital collage;
- raw BIM / construction-document plotting;
- hyper-minimal rectangles where owned architecture exists;
- photorealism.

## 4. Drawing doctrine

DRW-01 freezes the precise tokens, but the required principles are already clear.

### 4.1 Semantic line hierarchy

Use a small controlled family:

- **cut** — heaviest;
- **profile** — strong external/principal silhouette;
- **primary beyond** — ordinary visible architectural edges;
- **secondary beyond** — secondary components/context;
- **overhead / hidden / provisional** — conventional dashed families with distinct meanings;
- **datum / grid / dimension / leader** — light annotation family.

Line weights live in physical paper units, not arbitrary screen pixels.

### 4.2 World space and paper space are separate

Architecture exists in world millimetres. Drawing graphics exist in paper millimetres/points.

**world geometry → view projection → paper-space frame → SVG**

This separation makes line weights, text size, symbols and intended print scale deterministic and testable.

### 4.3 Scale-aware representation

Architectural representation changes with scale. A door, window or stair at 1:100 is not simply a shrunken 1:10 symbol.

DRW-01 freezes a small set of representation bands — for example site/type, building, enlarged assembly and detail — with appropriate simplification at each band.

### 4.4 Poche, material and vector hygiene

Plan and section clearly distinguish cut matter. Material hatch appears only when informative at the drawing scale; restrained solid/grey poche is preferable to busy hatch at small scales.

Generated linework may use bounded deterministic cleanup for duplicate/coincident edge suppression, clipping at openings/cut planes, joins/caps, hatch clipping, annotation masking and hidden-edge suppression where the view genuinely needs it. This is drawing hygiene, not CAD scope expansion.

### 4.5 Text, dimensions and labels

Titles and explanatory prose belong principally to page composition, not the SVG canvas.

Human names lead in publication output. Internal IDs remain available through metadata/inspection output.

Dimensions are selective rather than contractor-complete. Label placement must be deterministic; explicit authored anchors are preferable to opaque optimisation when architectural judgement is needed.

### 4.6 Uncertainty

- controlled geometry — normal architectural notation;
- provisional represented geometry — restrained conventional dash/note;
- range — paired/nested extent only when material;
- unresolved exact geometry — note, omission or refusal, never invented detail.

Baseline colour remains monochrome/restrained grey. A single controlled analytical accent may be tested if it materially improves reading in both print and web.

## 5. Drawing register: current hypothesis

DRW-02 freezes the final set. The following is an initial hypothesis, not a quota.

### 5.1 Essential Reference House orthographic set

- synthetic type / setting plan at honest surrogate-site scope;
- ground-floor plan;
- first-floor plan;
- roof / drainage plan;
- principal longitudinal section;
- transverse / service section;
- principal front elevation;
- garden elevation;
- courtyard elevation / section material.

A service-side elevation is conditional: retain it only if it proves something not already visible in the service section/overlay.

### 5.2 Synthesis and analytical set

- one sectional axonometric / cutaway;
- structural/span overlay on canonical geometry;
- service/maintenance-geography overlay;
- water/failure overlay on the actual roof/building geometry;
- external-maintenance/setting overlay;
- spatial-hierarchy overlay only if actual plans/sections do not already carry the argument.

### 5.3 Detail family

Candidate subjects include:

- permanent masonry opening → tolerance/fixing zone → replaceable frame → removable trim;
- service riser / high-service-room wall with dry-side access;
- structural floor edge / permanent diaphragm relationship;
- wall/ceiling movement junction;
- threshold / replaceable doorset;
- wet-room failure / visible leakage path;
- selected accessible rainwater collection condition.

Only details whose source/technical authority is honest are published.

### 5.4 Parts I–III

The early book may remain more abstract, but should not remain architecture-free until Part IV. Likely candidates are:

- one representative life-separated opening detail;
- one service-zone/riser section;
- one failure-tolerant wet-room section;
- one small pattern-family plate showing representative architectural conditions.

Do not illustrate every pattern or paragraph.

### 5.5 Quantity position

Do not target raw figure count. A plausible result is **8–12 strong publication plates carrying roughly 15–20 views**, with related views grouped intelligently. DRW-02 should reduce this wherever one drawing or plate proves several claims.

## 6. Page and spread doctrine

The current publication is A4 portrait and duplex-first. DRW should not turn the entire monograph landscape or mix physical trim sizes merely because architecture often wants width.

Preferred hierarchy:

1. **portrait single-page plate** where a useful scale fits;
2. **paired facing plates** for directly comparable views, especially the two floor plans at identical scale;
3. **true two-page spread** for long sections, elevation sequences and the hero sectional axonometric;
4. **90° rotated plate** only when materially better than a spread and worth making the reader turn the book;
5. **foldout** only as an optional PR-02 enhancement if a specific drawing genuinely earns the manufacturing complexity.

Plate pages may use different safe margins/running furniture from prose pages. Critical geometry, dimensions and labels must not sit in the binding loss zone.

A spread is treated as one logical paper-space composition and emitted deterministically as left/right crops for the PDF/physical book. The web may show the same composition as one continuous SVG.

The renderer owns architectural drawing content. The publication layer owns figure number, caption, plate furniture, page margins, running heads and spread crops.

## 7. Native renderer position

The correct move is to evolve the existing deterministic compiler output layer, not create a parallel illustration system.

Existing footholds include:

- `compiler/output/svg.ts`;
- `compiler/output/projection.ts`;
- `compiler/output/conventions.ts`;
- `compiler/reference-house/output/*`;
- generated source/renderer identity and stale-output verification;
- existing Reference House outputs already marked as publication-source candidates.

### 7.1 Renderer capability grows vertically

Do **not** first build a complete drawing framework and then attempt to use it.

The first implementation should contain only the primitives required by the first frozen publication plan. The second drawing reuses those primitives and adds only what it genuinely needs. Sections, elevations, roof drawings and axonometrics earn their capabilities in the same way.

Source-model hardening follows the same rule: add only the architectural facts needed for the next controlled view.

### 7.2 Semantic drawing scene

Domain code describes drawing meaning rather than local SVG styling, for example:

```ts
Line({ role: 'cut', ... })
Polygon({ role: 'poche', material: 'masonry', ... })
OpeningSymbol({ kind: 'door', ... })
Dimension({ worldA, worldB, ... })
Text({ role: 'room-label', anchor: ... })
SectionMarker({ id: 'A–A', ... })
```

The serializer maps semantic roles to the inspection/publication profile.

### 7.3 Declarative view specification

Every controlled view records its source/model identity, projection, cut/direction, scale band/exact print scale where applicable, crop/frame, visible layers, annotation set, authored label exceptions and target page class.

Changing the house changes geometry. Changing the view specification changes the drawing. Manual SVG editing is not an accepted controlled path.

### 7.4 Deterministic reuse contract

**same model + same view spec + same renderer/style version = identical SVG**

A future Reference House using the same drawing grammar inherits the same visual language automatically. A future visual-language change is a renderer/style version change, not silent drift.

### 7.5 Axonometric capability

Only after the orthographic set is sound should DRW add bounded 2.5D/simple-3D mathematics: XYZ points/vectors, extruded planar wall/slab/roof faces, deterministic parallel projection, face ordering/culling, cut-plane clipping and semantic projected line roles.

Do not introduce arbitrary Boolean solids or a full hidden-line engine unless a real drawing proves they are required.

## 8. Verification

Drawing correctness is software behaviour as well as architectural judgement.

DRW must test, to the practical extent available:

- semantic parity with canonical geometry;
- plan/section/elevation/axonometric cross-view parity;
- refusal of unsupported geometry;
- deterministic output and stale-output refusal;
- source/view/renderer/style lineage;
- physical scale and line-weight correctness;
- text collisions, clipping, minimum label size and dimension overcrowding;
- style-token compliance;
- vector integrity / no accidental rasterisation;
- spread gutter/safe-zone compliance;
- grayscale and physical print legibility;
- renderer generality through small non-RH01 synthetic fixtures.

Browser appearance alone is insufficient. Major plates must survive physical-size proof.

## 9. Refactored programme gates

The original horizontal sequence — complete geometry hardening, then complete renderer construction, then make drawings — is explicitly abandoned. It creates large coupled stages with poor restart points.

DRW-00 through DRW-02 freeze the rules and target set. From DRW-03 onward, work proceeds as vertical drawing slices from source authority through printed proof.

| Gate | Purpose | Hard output |
|---|---|---|
| **DRW-00** | Authority, before-state and physical-format freeze | Baseline, figure disposition, format assumptions, PR-02 block |
| **DRW-01** | Visual doctrine and page grammar | Frozen style/scale/annotation/page doctrine plus specimen proof |
| **DRW-02** | Book-wide drawing register and plate map | Frozen views, authority, scale, page class and plate sequence |
| **DRW-03** | Ground-floor plan vertical slice | First end-to-end publication drawing proving the minimal native renderer |
| **DRW-04** | First-floor plan + paired plans | Second plan, cross-floor parity and facing-page plate |
| **DRW-05** | Principal section vertical slice | Cross-registered longitudinal section and plate/spread proof |
| **DRW-06** | Principal front elevation vertical slice | Cross-registered facade elevation and elevation grammar |
| **DRW-07** | Roof/drainage vertical slice | Roof geometry, water notation and publication roof plate |
| **DRW-08** | Remaining orthographic set | Retained service section, garden/courtyard and setting/type material |
| **DRW-09** | Sectional axonometric / synthesis slice | One earned 2.5D hero view and spread proof |
| **DRW-10** | Analytical overlays | Structure/services/water/maintenance readings over canonical geometry |
| **DRW-11** | Details + Parts I–III architectural figures | Bounded details and accepted early-book drawings |
| **DRW-12** | Whole-book integration, adversarial proof and freeze | Full/primer rebuild, generality proof, physical proof, closeout + PR-02 release |

The detailed restart-safe packet decomposition is authoritative in `docs/publication/architectural-drawing-execution-plan.md`.

## 10. Execution discipline

Programme gates are not normal work units. **Packets are.**

The execution plan decomposes the programme into small packets such as `DRW-03A`, `DRW-03B`, etc. Each packet has one dominant outcome, must leave the repository green, and ends with a durable handoff on issue #154.

If a packet exposes multiple unplanned architectural decisions, several unrelated renderer capabilities, or cannot reach a reviewable green state in one focused execution session, it is split before continuing. The correct response to unexpectedly large work is to reduce the work boundary, not to accumulate an unreviewable half-finished stage.

Source hardening and renderer development are therefore continuous capabilities earned drawing-by-drawing rather than standalone “big bang” phases.

## 11. What DRW must not do

The programme must not:

- promote Reference House maturity because drawings look more resolved;
- turn prototype candidates into apparently construction-ready details;
- reopen architectural decisions merely to beautify drawings unless drawing exposes a real contradiction;
- create parallel hand-authored publication geometry;
- attempt to illustrate every paragraph or pattern;
- chase photorealism;
- optimise for social-media diagram aesthetics;
- build general CAD functionality without a frozen drawing need;
- make algorithmic label placement more complex than its value;
- preserve the existing `D-F*` set simply because it already exists;
- let the book layout become a passive consequence of renderer aspect ratio;
- complete large horizontal “geometry” or “renderer” phases before a concrete drawing requires their capability.

A proper drawing is allowed to falsify the source. If a coherent plan, section or elevation cannot be produced from owned geometry, the architecture must rewind or remain explicitly unresolved rather than the drawing being massaged.

## 12. Acceptance standard

DRW closes only when all of the following are true:

1. The Reference House can be understood as an architectural object from the drawings alone at ordinary monograph-reading depth.
2. Plans, sections and elevations use professional architectural conventions and cross-register.
3. The book no longer relies on rectangles as proxies for architecture where owned geometry exists.
4. Analytical structure/services/water/maintenance claims are drawn on canonical building geometry where spatial substrate matters.
5. Publication output cannot silently drift from controlled Reference House geometry.
6. No drawing claims more technical resolution than the source owns.
7. The drawing set has a coherent editorial hand without becoming a bespoke visual language.
8. One synthesis drawing gives strong three-dimensional understanding without pretending to be a rendering.
9. Central interface claims are shown through a small number of honest details where evidence permits.
10. Text collision, clipping, style drift, stale output, scale errors, gutter failures and cross-view contradictions are machine-detectable to the practical extent available.
11. The renderer is demonstrably reusable beyond RH01 without becoming CAD.
12. The final PDF/book survives physical-size page and spread proof.
13. The programme can be stopped after any completed packet and resumed from repository records without reconstructing a half-finished stage from chat.
14. PR-02 receives a frozen controlled drawing **and plate** system rather than a loose collection of manually maintained SVGs.

## 13. First action

Do not begin by redrawing D-F06 through D-F11, building a general renderer, or implementing the axonometric engine.

Start with **DRW-00A** in the execution plan. Complete packets in order through DRW-01 and DRW-02, freezing the drawing/page doctrine and exact drawing register before the first production slice.

The first implementation slice is then **DRW-03 — ground-floor plan**. It should earn only the source and renderer capability required to take that one drawing all the way from canonical geometry to a physically proofed publication plate.