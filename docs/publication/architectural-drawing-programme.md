<!-- nav-exclude: redirect -->
# Architectural drawing programme

**Programme:** DRW  
**Handoff issue:** #154  
**Status:** active programme; blocks PR-02 physical-object production until DRW-12 closeout

## 1. Why this programme exists

Ovid’s House now has a problem of representation rather than a shortage of architectural thought.

The Working Edition describes a coordinated Reference House with a real programme, courtyard morphology, structural concept, concentrated service flank, sectional order, opening grammar, roof/water logic, maintenance geography and bounded tectonic language. Yet the publication represents much of that through schematic rectangles and prose-heavy explanatory graphics.

The drawings therefore underperform the work in four ways:

1. **Insufficient architecture.** The reader is repeatedly told about the house but rarely allowed to inspect it through plans, sections, elevations, roof plans, details or a synthetic three-dimensional view.
2. **Representation drift.** Reader-facing Reference House SVGs are separately authored from deterministic compiler-derived geometry, so publication graphics can simplify or contradict the controlled model without current bounds checks noticing.
3. **Wrong visual register.** The repeated heading + subtitle + box diagram + prose-sidebar formula reads like presentation-deck information design rather than an architectural monograph.
4. **Weak verification.** Current figure validation catches gross SVG overflow, not semantic parity, cross-view disagreement, text collisions, print scale, architectural drawing grammar or page/spread failure.

The correction is therefore not a style pass. It is a bounded architectural-representation programme: strengthen only the source geometry the book genuinely needs, evolve the existing deterministic output layer into a native architectural SVG renderer, and compose the resulting drawings deliberately on the printed page.

## 2. Governing position

### 2.1 Show the building before explaining the building

The Reference House chapter should establish the architectural object through ordinary architectural drawings before analytical overlays explain structure, services, water, maintenance or hierarchy.

**here is the house → here is what it is doing → here is why**.

### 2.2 One geometry, several readings

Publication drawings, inspection views and analytical overlays may use different annotation and graphic profiles, but they should share one canonical geometry wherever the project owns that geometry.

A service overlay may simplify a plan. It must not own another plan.

### 2.3 No invented precision

A polished drawing is not permission to manufacture architecture.

When a requested view exposes missing geometry, the programme may only:

1. strengthen the canonical architectural source deliberately;
2. show the condition as provisional/ranged/unresolved using normal architectural notation;
3. refuse the requested level of specificity.

The renderer must never turn graphic plausibility into architectural authority.

### 2.4 Architectural convention before graphic novelty

A practising architect should not need to learn an Ovid’s House dialect to read an ordinary plan, section, elevation or detail.

The project can acquire a recognisable editorial hand through discipline, proportion, line hierarchy, typography and selection. It should not invent symbols where established architectural convention already works.

### 2.5 Publication and inspection are different surfaces, not different truths

The existing generated Reference House views correctly expose semantic IDs, precision classes, diagnostics and compile identity. Those are useful for inspection and wrong for the printed monograph.

The renderer therefore needs at least two profiles:

- **inspection** — semantic IDs, authority/uncertainty notation, machine identity and diagnostics;
- **publication** — human architectural naming, conventional notation, restrained uncertainty cues and no compiler-interface clutter.

Both are projections of the same controlled state.

### 2.6 Math first, SVG second, no CAD

The project does not need a CAD application, a browser modelling environment, Revit, Blender or a generic solid-modelling kernel to make excellent architectural drawings.

The core should remain explicit deterministic mathematics:

- points, vectors, segments, polylines and polygons in world coordinates;
- levels, hosted openings and bounded architectural objects;
- deterministic plan/section/elevation/parallel projections;
- clipping, intersections and visibility only where actual drawings demand them;
- SVG as the vector output medium.

A small geometry dependency may be introduced when it clearly improves robustness. A CAD/BIM dependency should only appear if a future concrete drawing requirement proves the bounded native approach insufficient.

### 2.7 The page is part of the drawing

A beautiful SVG that lands badly in the book is not a successful drawing.

Print scale, page class, aspect ratio, orientation, gutter, caption relationship and minimum readable text/line weight must be decided with the drawing register before mass implementation. Page composition is therefore an early design input, not a DRW-10 afterthought.

### 2.8 Do not overfit Reference House 01

The renderer should be reusable by later Reference Houses without pretending to be a general CAD system.

Generic drawing primitives should understand architectural ideas such as walls, openings, cuts, levels, slabs, roof faces and annotations. They should not encode assumptions such as “courtyard ring”, “four bays” or “service flank” into the drawing engine itself.

Small synthetic fixtures should prove that RH01 assumptions have not leaked into the renderer.

## 3. Visual precedent and target register

The target is not one office style copied wholesale. Four traditions are useful for different parts of the book.

### 3.1 Restrained British professional monograph drawing — primary grammar

**Reference:** Caruso St John project drawing sets.  
Examples:  
- https://carusostjohn.com/projects/house-lincolnshire/  
- https://carusostjohn.com/projects/private-house-north-london/  
- https://carusostjohn.com/projects/st-pancras/

Useful qualities:

- architecture dominates the page rather than graphic design;
- plans, sections and elevations remain quiet and conventional;
- linework carries hierarchy without theatre;
- a reader can understand spatial order before reading explanatory prose;
- details appear where they add architectural information.

**Use:** base register for the Reference House orthographic set.

### 3.2 DETAIL-style technical editorial drawing — detail grammar

**Reference:** DETAIL magazine / DETAIL Inspiration.  
Examples:  
- https://www.detail.de/en/magazine  
- https://www.detail.de/en/search?type=drawings

Useful qualities:

- disciplined line-weight hierarchy;
- material hatch used as information rather than decoration;
- visual density without explanatory clutter;
- obvious scale and construction logic;
- a consistent editorial language across different assemblies.

**Use:** selected 1:20 / 1:10 / 1:5 interface drawings after source authority is adequate.

### 3.3 Atelier Bow-Wow — synthesis / architectural anatomy

**Reference:** *Graphic Anatomy Atelier Bow-Wow*.  
Example: https://www-s.jp.toto.com/publishing/detail/A0278_e.htm

Useful qualities:

- one sectional-perspective drawing can make a building intelligible as a whole;
- section and three-dimensional reading coexist without becoming rendering;
- architecture, use and technical organisation can inhabit one view;
- the drawing rewards close reading in print.

**Use:** one major sectional axonometric/cutaway, not a default style for every figure.

### 3.4 British analytical drawing / projected section — analytical overlays

**References:** Drawing Matter material on projected sections and the Cedric Price archive.  
Examples:  
- https://drawingmatter.org/stalder-projected-sections/  
- https://www.cca.qc.ca/en/archives/380477/cedric-price-fonds/396839/projects/399301/fun-palace-project

Useful qualities:

- analytical information remains attached to architectural geometry;
- section, axonometric and diagram can hybridise when the question requires it;
- routes, components and change are shown in relation to the building rather than in disconnected flowcharts.

**Use:** conceptual ancestry for structure, service, maintenance and failure overlays.

## 4. Styles explicitly rejected as the primary language

- **Presentation-deck / thought-leadership graphics.** Useful occasionally, wrong as the principal evidence of the monograph.
- **Post-digital collage.** Atmosphere and texture would blur the distinction between owned, provisional and illustrative information.
- **Raw BIM / construction-document plotting.** Too much delivery notation, too little editorial hierarchy, and likely to imply more resolution than the project owns.
- **Hyper-minimal rectangle diagrams.** Still useful for genuinely abstract doctrine, but not as proxies for a worked building.
- **Photorealism.** Not needed to prove the argument and risks replacing architectural inspection with image-making.

## 5. Ovid’s House drawing doctrine to freeze in DRW-01

### 5.1 Semantic line hierarchy

Use a small controlled family:

- **cut** — heaviest;
- **profile** — strong external/principal silhouette;
- **primary beyond** — ordinary visible architectural edges;
- **secondary beyond** — secondary components/context;
- **overhead / hidden / provisional** — conventional dashed families with distinct meanings;
- **datum / grid / dimension / leader** — light annotation family.

Line weights must be defined in physical paper units, not arbitrary screen pixels.

### 5.2 World space and paper space must be separate

Architecture exists in world millimetres. Drawing graphics exist in paper millimetres/points.

The renderer therefore needs an explicit mapping:

**world geometry → view projection → paper-space frame → SVG**.

This prevents line weights, text size and symbols from accidentally becoming model-scale geometry and makes intended print scale testable.

### 5.3 Poche and material

Plan and section should clearly distinguish cut matter. Material hatch appears only where it communicates something needed at that scale. At small scales, restrained solid/grey poche is preferable to busy hatch.

### 5.4 Text and labels

Titles and explanatory prose belong to page composition, not inside the drawing canvas.

Human names lead in publication output. Internal semantic IDs remain available through SVG metadata and inspection profile.

Label generation must be deterministic. Where automated placement would become clever or unstable, explicit authored anchors are preferable to opaque layout optimisation.

### 5.5 Dimensions

Dimensions are selective rather than exhaustive. A monograph needs enough to establish scale, courtyard/wing relationships, key clearances and contested geometry. It does not need contractor-level chains.

### 5.6 Scale-aware representation

Architectural representation changes with scale.

A door/window/stair/detail at 1:100 must not simply be a shrunken 1:10 symbol. DRW-01 should freeze a small set of representation bands — for example site/type, building, enlarged assembly and detail — with appropriate simplification at each band.

### 5.7 Uncertainty

Uncertainty remains visible but does not become the visual theme:

- controlled geometry — normal architectural notation;
- provisional represented geometry — restrained conventional dash/note;
- range — paired/nested extent only when it matters;
- unresolved exact geometry — note, omission or refusal, never invented detail.

### 5.8 Colour

Baseline remains monochrome / restrained grey. One controlled accent may be tested for analytical overlays if it materially improves reading in print and on screen. Colour should never rescue weak hierarchy.

### 5.9 Vector cleanup

Generated linework must not look mechanically dirty. The engine may therefore require bounded post-processing for:

- coincident/duplicate edge suppression;
- clipping at openings and cut planes;
- sensible line joins/caps;
- hidden/occluded edge suppression where the chosen view requires it;
- hatch clipping;
- annotation masking where conventionally appropriate.

This is drawing hygiene, not CAD scope expansion.

## 6. Book-wide drawing register: current hypothesis

DRW-02 must decide the final set. The following is an initial hypothesis, not a quota.

### 6.1 Reference House — essential architectural set

| Drawing | Purpose |
|---|---|
| **Synthetic type / setting plan** | Establish front, garden, detached condition, service side and maintenance reservation without pretending to own a real site |
| **Ground-floor plan** | Programme, circulation, court, stair, service flank and front-to-garden sequence |
| **First-floor plan** | Four bedrooms, landing/gallery, bathroom, storage and court relationship |
| **Roof / drainage plan** | Roof fields, falls, collection edges, court drain and overflow |
| **Principal longitudinal section** | Front → stair → court → garden sequence and sectional hierarchy |
| **Transverse / service section** | Service flank, riser, bathroom stack, floors and court relationship |
| **Principal front elevation** | Four-bay order, opening hierarchy and ranked off-centre entrance |
| **Garden elevation** | Garden relationship and rear architectural order |
| **Courtyard elevation / section material** | Make the court architectural rather than a white rectangle |

A **service-side elevation** is conditional: keep it only if it proves something not already visible in the service section/overlay.

### 6.2 Reference House — synthesis / analytical set

| Drawing | Function |
|---|---|
| **Sectional axonometric / cutaway** | Whole-house comprehension: court, stair, storeys, roof and service flank |
| **Structural overlay** | Span/support topology on real architectural geometry |
| **Service geography overlay** | Service zones/routes on plan/section substrate |
| **Water/failure overlay** | Falls, ordinary drainage and abnormal routes on the actual roof/building geometry |
| **External-maintenance overlay** | Dimensioned task routes/zones on honest setting geometry |
| **Spatial-hierarchy overlay** | Retain only if plans/sections do not already make the argument sufficiently |

### 6.3 Detail set

Candidate subjects:

- permanent masonry opening → tolerance/fixing zone → replaceable frame → removable trim;
- service riser / high-service-room wall with dry-side access;
- structural floor edge / permanent diaphragm relationship;
- wall/ceiling movement junction;
- threshold / replaceable doorset;
- wet-room failure / visible leakage path;
- selected accessible rainwater collection condition.

DRW-08 must refuse any detail that outruns current physical or technical evidence.

### 6.4 Parts I–III

The early book can remain more abstract, but it should not remain architecture-free until Part IV. Likely useful additions are:

- one representative life-separated opening detail;
- one service-zone/riser section;
- one failure-tolerant wet-room section;
- one small pattern-family plate showing representative architectural conditions.

Do not illustrate every pattern or paragraph.

### 6.5 Quantity position

Do not target raw figure count.

A plausible result is **8–12 strong publication plates carrying roughly 15–20 drawing views**, with related views grouped intelligently. DRW-02 should reduce this further where one plate proves several claims.

## 7. Native architectural renderer

The correct move is to evolve the existing deterministic compiler output layer rather than start a parallel illustration system.

The repository already has:

- `compiler/output/svg.ts` — SVG primitives;
- `compiler/output/projection.ts` — projection helpers;
- `compiler/output/conventions.ts` — shared representation conventions;
- `compiler/reference-house/output/*` — deterministic Reference House plans/section/structure/report outputs;
- generated source/renderer identity and stale-output verification;
- existing Reference House outputs already marked as publication-source candidates.

### 7.1 Start smaller than the eventual module diagram

Do not pre-create a mini CAD framework because the programme can imagine one.

The first implementation should probably be only the minimal concepts demanded by the first frozen orthographic plates:

- drawing scene / semantic primitives;
- projection;
- paper-space style tokens;
- SVG serializer;
- a small symbol/annotation set;
- validation.

Split into more modules only when real complexity appears.

### 7.2 Semantic drawing scene

Domain code should stop concatenating arbitrary SVG style decisions directly. It should describe drawing semantics, for example:

```ts
Line({ role: 'cut', ... })
Polygon({ role: 'poche', material: 'masonry', ... })
OpeningSymbol({ kind: 'door', ... })
Dimension({ worldA, worldB, ... })
Text({ role: 'room-label', anchor: ... })
SectionMarker({ id: 'A–A', ... })
```

The serializer maps these roles to the chosen inspection/publication profile.

### 7.3 Declarative view specification

Every generated view should have an explicit data specification rather than hidden renderer constants:

- source/model identity;
- projection type;
- cut plane / direction;
- intended scale band and exact print scale where applicable;
- crop/frame;
- visible layers;
- annotation set;
- explicit authored label anchors or exceptions where needed;
- target page class.

Changing the house changes geometry. Changing the view spec changes the drawing. Manual SVG editing changes neither and is therefore forbidden for controlled outputs.

### 7.4 Geometry/source lineage

Publication primitives representing architecture should be traceable to source/derived entities where practical.

That enables tests such as:

- one front door entity agrees in plan and elevation;
- courtyard extents agree in plan, section, roof and axonometric;
- a cut wall comes from owned wall geometry, not a renderer constant;
- an analytical overlay cannot silently shift a service zone.

### 7.5 Model hardening required before drawings are honest

Likely additions include, only where DRW-02 demands them:

- wall families and wall-face offsets/thickness ranges;
- internal partition thickness;
- opening frames/reveals;
- internal doors / major openings and swings;
- stair runs, landings and well geometry beyond datum-only representation;
- roof planes, edge/cornice/parapet geometry and collection edges;
- floor/roof thickness envelopes sufficient for section;
- facade opening vertical geometry sufficient for elevations;
- surrogate external ground/maintenance extents;
- service-zone envelopes and riser access geometry;
- detail-specific layers actually owned by the source.

These are source changes, not renderer inventions, and they do not automatically raise Reference House maturity.

### 7.6 Axonometric / cutaway capability

Only build this after orthographic drawings are sound.

The Reference House can likely be handled with bounded 2.5D/simple 3D mathematics:

- XYZ points/vectors;
- extruded planar wall/slab/roof faces;
- deterministic parallel projection;
- face ordering/culling;
- cut-plane clipping;
- semantic projected line roles;
- optional controlled exploded offsets.

Do not introduce arbitrary Boolean solids or a full hidden-line engine unless a real future view proves they are needed.

### 7.7 Future Reference Houses

The contract should be:

**same model + same view spec + same renderer/style version = identical SVG**.

A new Reference House using the same drawing grammar should inherit the same visual language automatically. If the visual language itself changes later, that is a renderer/style version change, not silent drift.

Synthetic renderer fixtures should include at least a few geometries unlike RH01 so future reuse is tested rather than merely asserted.

## 8. Page and spread doctrine

The current print theme is A4 portrait and duplex-first. DRW should not rotate the entire book or introduce mixed physical trim sizes merely because architecture often wants width.

### 8.1 Preferred hierarchy

1. **Portrait single-page plate** where a useful scale fits comfortably.
2. **Paired facing plates** for comparable views — especially ground and first floor at exactly the same scale.
3. **True two-page spread** for long sections, elevation sequences and the hero sectional axonometric.
4. **90° rotated plate** only when materially better than a spread and worth making the reader turn the book.
5. **Foldout** only as an optional PR-02 manufacturing enhancement if a specific drawing genuinely earns it.

### 8.2 Plate pages should differ from prose pages

The existing prose margins are appropriate for text but need not govern major drawing plates.

DRW-01 should freeze named plate classes with their own safe margins/running furniture, while respecting binding and trim. Likely classes:

- `figure-inline`
- `plate-full`
- `plate-pair`
- `plate-spread`
- `plate-rotated`
- `plate-detail-grid`

Running heads can disappear on full plates where they weaken the composition.

### 8.3 Spread implementation

Do not rely on a fragile HTML element visually spanning two PDF pages.

Treat a spread as **one logical paper-space composition** and deterministically emit left/right page crops from that composition. The source geometry remains one scene; only the page crop differs.

This also lets the web show the same composition as one continuous SVG while the physical/PDF edition receives controlled page halves.

### 8.4 Gutter rule

Critical geometry, dimensions and labels must not sit in the binding loss zone.

Where a drawing crosses the fold, the composition should deliberately place low-information or recoverable space there. In a suitable section/axonometric, the courtyard void may even become a useful natural fold zone.

### 8.5 Caption/page relationship

The renderer should not own book titles, captions, figure numbers or running furniture.

It emits architectural drawing content into a declared paper-space frame. The publication layer owns the plate composition around it.

## 9. Verification

Drawing correctness is software behaviour as well as architectural judgement.

### 9.1 Semantic parity

Key entities, extents, openings, levels and relationships must agree with the canonical model.

### 9.2 Cross-view parity

One entity must agree across plan, section, elevation and axonometric.

### 9.3 Refusal of unsupported geometry

Requesting more specificity than the source owns must fail or remain explicitly unresolved. Silent completion is a bug.

### 9.4 Determinism and identity

Controlled outputs carry source, view-spec, renderer and style identity. Regeneration must be byte-stable where practical and stale committed drawings must fail verification.

### 9.5 Graphic collision and clipping

Detect practical failures including:

- text/text overlap;
- forbidden text/geometry overlap;
- clipped labels;
- labels outside frame;
- dimension overcrowding;
- minimum printed text size violations;
- spread gutter/safe-zone violations.

Generation must remain deterministic. Browser-based bounding-box checks may be used for validation, but should not introduce nondeterministic layout into controlled geometry.

### 9.6 Style lint

Domain renderers use semantic style tokens only. Arbitrary hard-coded stroke widths, fonts and colours in drawing code should fail review/lint.

### 9.7 Print proof

Browser appearance is insufficient. Physical-size proofs must check:

- line-weight survival;
- hatch survival;
- label legibility;
- figure/caption relationship;
- grayscale reproduction;
- page/spread rhythm;
- binding/gutter behaviour;
- no accidental rasterisation of vector linework.

### 9.8 Generality proof

Before DRW closes, render a small set of synthetic non-RH01 fixtures to prove the renderer does not encode courtyard/four-bay/service-flank assumptions.

## 10. Programme sequence

| Stage | Purpose | Hard output |
|---|---|---|
| **DRW-00** | Recover authority; freeze before-state and physical-format assumptions | Baseline + PR-02 block |
| **DRW-01** | Precedent, drawing doctrine and page grammar | Controlled style/scale/page specification |
| **DRW-02** | Book-wide claim-to-drawing audit | Frozen drawing register including scale + page class |
| **DRW-03** | Strengthen only demanded architectural source geometry | Model/source changes + authority tests |
| **DRW-04** | Build smallest reusable mathematical SVG renderer | Scene, projections, paper-space styles, symbols/annotations, validation |
| **DRW-05** | Produce core orthographic Reference House set | Plans, sections, elevations, roof/type drawings |
| **DRW-06** | Produce synthesis view if earned | Sectional axonometric / cutaway |
| **DRW-07** | Rebuild analytical overlays on canonical geometry | Structure/services/water/maintenance drawings |
| **DRW-08** | Add bounded detail family | Only details with honest authority |
| **DRW-09** | Audit Parts I–III figures | Retain/redraw/add architectural figures deliberately |
| **DRW-10** | Implement publication plates | Controlled figure registry, captions, scales, page/spread classes |
| **DRW-11** | Automated + architectural + physical verification | Semantic, graphic, generality and print proof |
| **DRW-12** | Freeze and hand back to publication | Closeout + PR-02 release |

## 11. What DRW must not do

The programme must not:

- promote Reference House maturity because the drawings look more resolved;
- turn prototype candidates into apparently construction-ready details;
- reopen architectural decisions merely to beautify drawings unless drawing exposes a real contradiction;
- create a parallel hand-authored publication geometry;
- attempt to illustrate every paragraph or pattern;
- chase photorealism;
- optimise for social-media diagram aesthetics;
- build general CAD functionality without a frozen drawing need;
- make algorithmic label placement more complex than the value it provides;
- preserve the existing `D-F*` set simply because it already exists;
- let the book layout become a passive consequence of whatever aspect ratio the renderer happens to emit.

A proper drawing is allowed to falsify the source. If a coherent section/elevation cannot be produced from the owned geometry, the architecture must rewind or remain explicitly unresolved rather than the drawing being massaged.

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
11. The renderer is demonstrably reusable beyond RH01 without having become CAD.
12. The final PDF/book survives physical-size page and spread proof.
13. PR-02 receives a frozen controlled drawing **and plate** system rather than a loose collection of manually maintained SVGs.

## 13. First action

Do not start by redrawing D-F06 through D-F11. Do not start by building the axonometric engine.

Start at **DRW-00**, recover current authority, freeze the before-state and confirm the physical-format assumptions. Then complete **DRW-01 and DRW-02 before expanding the renderer**.

The project must first decide:

1. what architectural drawings the book genuinely needs;
2. what those drawings should look like;
3. how they should inhabit the printed page;
4. what source geometry is missing.

Only then should the native renderer gain the exact mathematical capability needed to produce them.