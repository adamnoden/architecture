<!-- nav-exclude: redirect -->
# Architectural drawing programme

**Programme:** DRW  
**Handoff issue:** #154  
**Status:** active programme; blocks PR-02 physical-object production until DRW-12 closeout

## 1. Why this programme exists

Ovid’s House now has a problem of representation rather than a shortage of architectural thought.

The Working Edition describes a coordinated Reference House with a real programme, a courtyard morphology, a structural concept, a concentrated service flank, a sectional order, an opening grammar, roof and water logic, maintenance geography and a bounded tectonic language. Yet the publication represents most of that through schematic rectangles and prose-heavy explanatory graphics.

The drawings therefore underperform the work in three ways.

First, they do not let the reader inspect enough architecture. The house is repeatedly described but rarely shown through the ordinary instruments of architectural judgement: plans, sections, elevations, roof plans, details and three-dimensional analytical views.

Second, the current reader-facing Reference House figures are separately authored from the deterministic Reference House model and generated inspection drawings. That leaves open a representation-drift path: a publication SVG can simplify, omit or contradict current model geometry without the current figure-bounds validator knowing that anything is wrong.

Third, the repeated graphic formula — large heading, explanatory subtitle, large box diagram, right-hand prose panel — reads more like presentation-deck information design than an architectural monograph. The problem is not monochrome restraint; that is largely appropriate. The problem is that explanatory graphics have displaced architectural drawings.

The required correction is therefore not a style pass. It is a new architectural drawing system and a book-wide drawing programme.

## 2. Governing position

The programme adopts six rules.

### 2.1 Show the building before explaining the building

The Reference House chapter should establish the architectural object through plans, sections, elevations and roof/site drawings before asking analytical diagrams to explain structure, services, water, maintenance or hierarchy.

The intended reading sequence is:

**here is the house → here is what it is doing → here is why**.

### 2.2 One geometry, several readings

Publication drawings, machine inspection views and analytical overlays may use different annotation and graphic profiles, but they should share one canonical geometry wherever the project owns that geometry.

A service overlay may simplify the plan. It must not own another plan.

### 2.3 No invented precision

A more polished drawing is not permission to manufacture walls, openings, details or building systems that the source does not own.

Where a requested view exposes missing geometry, the programme has only three legitimate responses:

1. strengthen the canonical architectural source deliberately;
2. show the condition as provisional / ranged / unresolved using normal architectural notation;
3. refuse the drawing at that level of specificity.

The renderer must not convert graphic plausibility into architectural authority.

### 2.4 Architectural convention before visual novelty

A practising architect should not have to learn an Ovid’s House dialect in order to read an ordinary plan, section, elevation or detail.

The project can have a recognisable editorial hand, but that identity should come from discipline, proportion, line hierarchy, typography and selection — not custom symbols where industry convention already works.

### 2.5 Publication and inspection are different surfaces, not different truths

The current generated Reference House views are useful because they expose semantic IDs, precision classes, diagnostics and compile identity. Those features are appropriate for inspection and wrong for the printed monograph.

The drawing system therefore needs at least two profiles:

- **inspection** — explicit semantic IDs, authority/uncertainty notation, machine identity and diagnostics;
- **publication** — human architectural naming, conventional notation, restrained uncertainty cues and no compiler-interface clutter.

Both profiles must be projections of the same controlled state.

### 2.6 Do not build CAD

The project does not need a browser CAD application, a Revit substitute or a generic computational-geometry research programme.

It needs a narrow deterministic renderer capable of producing the drawing families the book and website genuinely require. Capability should be added demand-first from the frozen drawing register.

## 3. Precedent study: what visual register belongs here

The target is not one historical graphic style copied wholesale. Four traditions are useful for different parts of the work.

### 3.1 Restrained professional monograph drawing — primary grammar

**Reference:** Caruso St John project drawing sets, particularly their houses and civic work.  
Examples:  
- https://carusostjohn.com/projects/house-lincolnshire/  
- https://carusostjohn.com/projects/private-house-north-london/  
- https://carusostjohn.com/projects/st-pancras/

What is useful:

- drawings look like architecture first and editorial material second;
- plan, section and elevation remain quiet and conventional;
- linework carries hierarchy without graphic theatre;
- the drawing set is sufficient to understand spatial order before prose explains it;
- details appear only where they add architectural information.

What should not be copied mechanically:

- office-specific plotting conventions;
- construction-level certainty that Ovid’s House does not yet possess;
- ornamental or material notation unsupported by the Reference House source.

**Conclusion:** this should be the base register for the Reference House orthographic set.

### 3.2 DETAIL-style technical redrawing — detail grammar

**Reference:** DETAIL magazine / DETAIL Inspiration.  
Examples:  
- https://www.detail.de/en/magazine  
- https://www.detail.de/en/search?type=drawings

DETAIL’s characteristic strength is consistent editorial redrawing: details from different projects are normalised into a common technical language so that construction can be compared and read quickly.

What is useful:

- disciplined line-weight hierarchy;
- material hatching used as information rather than decoration;
- details are visually dense but semantically economical;
- scale and construction logic are obvious;
- one editorial drawing language can carry many different assemblies.

What should not be copied:

- the implication that our unresolved physical interfaces are already construction details;
- excessive build-up information where the project only owns a strategy or comparator.

**Conclusion:** use this register for selected 1:20 / 1:10 / 1:5 interface drawings after source authority is sufficient.

### 3.3 Atelier Bow-Wow Graphic Anatomy — synthesis / sectional perspective

**Reference:** *Graphic Anatomy Atelier Bow-Wow*.  
Example: https://www-s.jp.toto.com/publishing/detail/A0278_e.htm

The book presents projects through detailed sectional-perspective drawings that combine section, depth, occupation, fixtures, surroundings and constructional information.

What is useful:

- one drawing can make a whole building intelligible spatially;
- section and three-dimensional reading are combined without becoming a photoreal rendering;
- architecture, use and technical organisation can coexist;
- it rewards close inspection in print.

What should not be copied:

- illustrative density for its own sake;
- incidental people/furniture/objects that the model cannot place truthfully;
- turning every figure into an anatomy drawing.

**Conclusion:** test one major sectional axonometric / cutaway as a synthesis plate for the Reference House. It should be a hero drawing, not the house style for every page.

### 3.4 British analytical drawing / projected section — analytical overlays

**References:** Drawing Matter material on projected sections and the Cedric Price archive.  
Examples:  
- https://drawingmatter.org/stalder-projected-sections/  
- https://www.cca.qc.ca/en/archives/380477/cedric-price-fonds/396839/projects/399301/fun-palace-project

What is useful:

- analytical information remains spatial and architectural rather than collapsing into flowcharts;
- section, axonometric and diagram can be hybridised when the question demands it;
- routes, components and transformations are shown against a building substrate.

What should not be copied:

- historical graphic mannerism;
- diagrammatic density unrelated to the present argument;
- annotation systems that require archival familiarity.

**Conclusion:** this is the right conceptual ancestry for service, maintenance, failure and structural overlays. The key move is to draw *on the architecture* rather than beside a rectangle representing it.

## 4. Styles explicitly rejected as primary language

### Presentation-deck / thought-leadership diagram

The current repeated title + subtitle + central box + prose sidebar format is useful for a talk but weak as the principal visual evidence of a serious architectural monograph. It may survive in rare abstract figures; it should stop being the default.

### Post-digital collage

Collage, textured fills, cut-out vegetation and atmospheric post-production can be effective architectural representation. They are wrong as the baseline here because they blur the project’s exact distinction between what is owned, what is provisional and what is merely illustrative.

### Generic BIM / construction-document plot

A raw Revit-like plan is also not the target. It tends to contain too much project-delivery notation, too little editorial hierarchy and — at our current maturity — would imply more technical resolution than exists.

### Hyper-minimal conceptual rectangle diagrams

These may remain valuable at doctrine level. They cannot carry the burden of demonstrating a worked house.

## 5. Proposed Ovid’s House drawing doctrine

DRW-01 must test and freeze the precise tokens, but the target doctrine is already clear enough to guide research.

### 5.1 Graphic hierarchy

The drawing should use a small semantic line-weight family rather than locally chosen stroke widths:

- **cut** — heaviest; matter intersected by the cut plane;
- **profile** — strong external / principal silhouette;
- **primary beyond** — normal visible architectural edges;
- **secondary beyond** — furniture, secondary components, context;
- **overhead / hidden / provisional** — dashed by established meaning;
- **datum / grid / dimension / leader** — lighter annotation family.

Line weight should be defined in physical output units and tuned to final print scale, not as arbitrary screen pixels.

### 5.2 Poche and material

Plan and section should distinguish cut matter clearly. Material hatching appears only where it communicates something the reader needs to know. At small scales, solid or restrained grey poche is preferable to busy hatch patterns.

### 5.3 Text

Titles belong principally to page composition, not inside the SVG. The drawing canvas should contain only architectural annotations needed to read the drawing.

Human names lead. Internal semantic IDs disappear from publication profile unless a cross-reference genuinely requires them.

### 5.4 Dimensions

Dimensions are selective rather than exhaustive. A monograph plan needs enough dimensions to establish architectural scale, critical courtyard/wing relationships, maintenance clearances and disputed geometry. It does not need a contractor’s full dimension chain.

### 5.5 Scale

Every drawing that depends on geometric judgement should have an explicit intended print scale or a scale bar where page resizing is possible. The source geometry remains in millimetres; layout determines print scale.

### 5.6 Uncertainty

Uncertainty remains visible but does not become a graphical theme. The preferred order is:

- resolved controlled geometry — normal architectural line;
- provisional represented geometry — subtle conventional dash / note;
- range — nested or paired extent only when the range matters;
- unresolved exact geometry — note or omission, never invented detail.

### 5.7 Colour

The baseline remains monochrome / restrained grey. One controlled accent may be tested for analytical overlays if it materially improves reading in both print and web, but colour is not required to rescue weak hierarchy.

## 6. What is actually missing from the book

The exact register is a DRW-02 deliverable, but the current gap is large enough to state a strong initial hypothesis.

### 6.1 Reference House — essential architectural set

| Proposed drawing | Why the book needs it | Current status |
|---|---|---|
| **Synthetic site / type plan** | Establishs front, garden, detached condition, service side, maintenance reservation and the limits of the surrogate site | D-F06 partially does this, but too diagrammatically |
| **Ground-floor plan** | Lets the reader inspect programme, circulation, courtyard, stair, service flank and front-to-garden sequence | Compiler-generated inspection plan exists; no proper publication plan |
| **First-floor plan** | Establishes all four bedrooms, gallery/landing, family bathroom and dry storage arrangement | Compiler-generated inspection plan exists; no proper publication plan |
| **Roof / drainage plan** | Makes outward roof falls, external collection, court drain and emergency overflow inspectable | Existing water figure is schematic; older RH source drawing exists |
| **Principal longitudinal section A–A** | Proves the front → stair → court → garden relationship and real sectional hierarchy | Compiler-generated semantic section exists; current D-F07 substitutes a diagram |
| **Transverse / service section B–B** | Shows service flank, riser, bathroom stack, floor/service relationship and courtyard depth | Missing from publication; may require source hardening |
| **Principal front elevation** | Essential to a project whose G-01 argument depends on four-bay order, off-centre entrance and opening rank | Existing Reference House source study exists; absent from book |
| **Garden elevation** | Tests how the garden sequence and roof termination resolve architecturally | Existing development material exists; absent from book |
| **Service-side elevation** | Shows how technical expression is controlled rather than hidden | Existing development material exists; absent from book |
| **Courtyard elevation / section family** | The court is a central spatial device and currently appears only as a rectangle | Existing development material exists; absent from book |

### 6.2 Reference House — synthesis and analytical set

| Proposed drawing | Function |
|---|---|
| **Sectional axonometric / architectural anatomy** | One high-value drawing that makes the courtyard ring, stair, storeys, roof and service flank legible together |
| **Structural plan / axonometric overlay** | Replace or substantially upgrade D-F08 while retaining bounded pre-engineering scope |
| **Service geography overlay** | Replace D-F09 with service routes/zones drawn over a real plan/section substrate |
| **Water/failure overlay** | Recast D-F10 over the actual roof plan rather than a free-standing rectangle |
| **External-maintenance/site overlay** | Recast D-F11 on a dimensioned site/type plan with task-specific routes |
| **Spatial/sectional hierarchy overlay** | Keep only if it adds something that the actual plans and sections do not already make obvious |

### 6.3 Reference House — detail set

The monograph does not need a contractor’s detail book, but several central Ovid’s House claims remain oddly disembodied without a detail drawing.

Candidate detail families:

- permanent masonry opening → tolerance/fixing zone → replaceable frame → removable trim;
- service riser / high-service-room wall with dry-side access;
- structural floor edge / permanent diaphragm relationship;
- wall/ceiling movement junction;
- threshold / replaceable doorset;
- wet-room failure / visible leakage path;
- selected external rainwater collection / accessible maintenance condition.

DRW-08 must refuse to publish any detail that outruns current physical or technical evidence.

### 6.4 Parts I–III — missing architectural substance

The first five figures are currently mostly conceptual. Some abstraction is appropriate, but the book would benefit from a small number of real architectural drawings before Part IV:

- a representative **life-separated opening detail** to make selective permanence concrete;
- a **service-zone section / riser anatomy** showing how permanent fabric and replaceable services coexist;
- a **failure-tolerant wet-room section** showing defence, visible consequence, access and reinstatement spatially;
- one **pattern-family plate** containing a few representative patterns as actual architectural conditions rather than another taxonomy map.

The purpose is not to illustrate all 21 patterns. It is to stop the argument remaining purely verbal until the Reference House chapter.

## 7. The native drawing engine

A native drawing system is appropriate. Starting a separate system from zero is not.

The repository already has the beginnings of the correct architecture:

- `compiler/output/svg.ts` — deterministic SVG primitives;
- `compiler/output/projection.ts` — plan/section projection helpers;
- `compiler/output/conventions.ts` — shared representation conventions;
- `compiler/reference-house/output/*` — deterministic Reference House drawing/report emitters;
- generated outputs carrying renderer version, compile identity and stale-output verification;
- `PUBLICATION_SOURCE_CANDIDATE` output classes for the existing plan/section/structure views.

DRW should generalise this substrate into a real architectural renderer.

### 7.1 Suggested module boundary

A possible end-state is:

```text
compiler/
  drawing/
    model.ts               # drawing scene / semantic graphic primitives
    style.ts               # publication-scale line, text, hatch tokens
    projection/
      plan.ts
      section.ts
      elevation.ts
      axonometric.ts
    geometry/
      clipping.ts
      intersections.ts
      visibility.ts
    symbols/
      door.ts
      window.ts
      stair.ts
      north-arrow.ts
      section-marker.ts
      level-marker.ts
      scale-bar.ts
    annotation/
      dimensions.ts
      leaders.ts
      labels.ts
      collision.ts
    render/
      svg.ts
    validate/
      geometry.ts
      collision.ts
      style.ts
      lineage.ts
```

The exact folder names are not important. The separation is.

Reference House code should provide architecture to the renderer; it should not contain a second private SVG toolkit.

### 7.2 Semantic drawing scene

The renderer should not concatenate SVG strings directly from every domain renderer forever. Introduce a small intermediate drawing scene whose primitives know their semantic role.

Examples:

```ts
Line({ role: 'cut', ... })
Polygon({ role: 'poche', material: 'masonry', ... })
OpeningSymbol({ kind: 'door', ... })
Dimension({ worldA, worldB, ... })
Text({ role: 'room-label', ... })
SectionMarker({ id: 'A–A', ... })
```

The SVG serializer then maps semantic roles to the current style profile. This makes it possible to change publication line weights without touching architecture and to test that renderers do not invent arbitrary local styles.

### 7.3 Geometry and source lineage

Every publication primitive that represents architecture should be traceable to one or more source/derived entities where practical.

That allows tests such as:

- the front door shown in plan and elevation derives from the same opening entity;
- the courtyard shown in plan, section, roof and axonometric uses the same extents;
- a wall shown as cut in section came from an owned wall face / envelope, not a renderer constant;
- an analytical overlay cannot silently shift the service flank.

### 7.4 Model changes required before professional-looking drawings are honest

The current Reference House model is deliberately semantic and often represents boundary lines rather than finished wall faces. That was correct for its proof scope. It is insufficient for a convincing architectural plan.

DRW-03 will probably need explicit, authority-bearing representation of:

- wall families and wall-face offsets / thickness ranges;
- internal partition thickness where required for drawing;
- opening frames/reveals where controlled;
- internal doors / major openings and swings where controlled;
- stair runs, landings and well geometry beyond datum-only representation;
- roof planes, parapet/cornice edges and collection edges;
- floor and roof thickness envelopes sufficient for section;
- facade opening vertical geometry sufficient for elevations;
- external ground / maintenance extents at the surrogate-site level;
- service-zone envelopes and riser access geometry;
- any detail-specific layers actually owned by the source.

Adding these facts is architectural-source hardening, not renderer work. The distinction must remain explicit.

### 7.5 Axonometric / cutaway capability

A full solid-modelling kernel is unnecessary at first. The house is sufficiently orthogonal that a bounded 2.5D / simple 3D representation can support publication axonometrics.

The engine needs:

- points/vectors in world XYZ;
- extruded wall/slab/roof faces from owned geometry;
- deterministic parallel projection (isometric/axonometric);
- face culling / ordering;
- cut-plane clipping for sectional axonometric;
- semantic line roles after projection;
- optional controlled exploded offsets that do not alter source geometry.

If a future view requires arbitrary Boolean solids, curved geometry or robust hidden-line removal beyond this scope, that should become a concrete capability request rather than a pre-emptive platform project.

### 7.6 Why D3 is not the answer

D3 is excellent for data-driven graphics, but the hard problem here is not binding values to SVG elements. It is architectural semantics: cut planes, wall faces, openings, hatches, dimensions, projection, visibility, scale and cross-view consistency.

Raw deterministic TypeScript/SVG remains the better substrate, with small geometry dependencies introduced only where they clearly improve robustness.

## 8. Verification system

The new programme should treat drawing correctness as testable software behaviour.

### 8.1 Semantic parity

Every generated architectural view should be testable against the canonical model for key entities, extents, openings, levels and relationships.

### 8.2 Cross-view parity

The same entities must align across plan, section, elevation and axonometric. For example, an opening centre and width represented in plan should agree with the elevation that shows it.

### 8.3 Refusal of unsupported geometry

The engine should fail or mark unresolved when a publication drawing requests geometry that is not sufficiently owned. Silent completion is a bug.

### 8.4 Graphic collision and clipping

The current bounds validator should be extended using rendered SVG text/graphic bounding boxes to detect:

- text/text overlap;
- text/geometry overlap outside declared exceptions;
- clipped labels;
- labels outside intended viewports;
- overcrowded dimensions;
- minimum print-size violations.

### 8.5 Style lint

Publication renderers should use approved semantic style tokens only. Arbitrary hard-coded stroke widths, fonts or ad-hoc colour values in domain drawing code should fail review or automated lint.

### 8.6 Determinism and identity

Generated publication source must remain deterministic and carry renderer/source identity internally. `outputs:check`-style stale-output refusal should extend to the controlled publication drawing family.

### 8.7 Print proof

SVG correctness on a browser is not enough. DRW-11 must produce physical-size proof pages and check at least:

- A4/A5 effective reading size used by the book;
- line-weight survival;
- fine hatch survival;
- caption/drawing relationship;
- grayscale reproduction;
- small-label legibility;
- page/spread breaks;
- no rasterisation of vector linework during PDF generation.

## 9. Programme sequence

| Stage | Purpose | Hard output |
|---|---|---|
| **DRW-00** | Recover authority and freeze the before-state | Baseline + scope + PR-02 block |
| **DRW-01** | Precedent study and visual doctrine | Controlled drawing-style specification |
| **DRW-02** | Book-wide claim-to-drawing audit | Frozen drawing register / gap matrix |
| **DRW-03** | Strengthen architectural source geometry only where demanded | Model/source changes + authority tests |
| **DRW-04** | Build reusable architectural renderer | Shared drawing scene, symbols, styles, projection and validation primitives |
| **DRW-05** | Produce core orthographic Reference House set | Plans, sections, elevations, roof/site drawings |
| **DRW-06** | Produce one or two synthesis views | Sectional axonometric / cutaway where earned |
| **DRW-07** | Rebuild analytical overlays on canonical geometry | Structure/services/water/maintenance drawings |
| **DRW-08** | Add bounded detail family | Only details with honest authority |
| **DRW-09** | Audit Parts I–III figures | Retain/redraw/add architectural figures deliberately |
| **DRW-10** | Integrate with publication | Controlled figure registry, captions, scales and page composition |
| **DRW-11** | Adversarial + automated verification | Semantic, graphic and print proof |
| **DRW-12** | Freeze and hand back to publication | Closeout + PR-02 release |

## 10. What DRW must not do

The programme must not:

- promote Reference House maturity merely because its drawings look more resolved;
- convert prototype candidates into apparently construction-ready details;
- reopen architectural decisions simply to make prettier drawings unless drawing them exposes a real contradiction;
- create a parallel hand-authored geometric model for publication;
- attempt to illustrate every paragraph or every pattern;
- chase photorealism;
- optimise for social-media diagram aesthetics;
- build general CAD functionality without a frozen publication need;
- preserve the current `D-F*` set merely because it already exists.

A drawing is allowed to falsify the source. If a proper section exposes that the house cannot be drawn coherently, the architecture must rewind rather than the drawing being massaged.

## 11. Acceptance standard

DRW closes only when all of the following are true.

1. The Reference House can be understood as an architectural object from the drawings alone at ordinary monograph-reading depth.
2. Plans, sections and elevations use professional architectural conventions and cross-register.
3. The book no longer relies on rectangles as proxies for architecture where owned building geometry exists.
4. Existing analytical claims about structure, services, water and maintenance are redrawn on canonical building geometry where spatial substrate matters.
5. Publication output cannot silently drift from the controlled Reference House geometry.
6. No drawing claims more technical resolution than the source owns.
7. The drawing set has a coherent editorial hand without becoming a bespoke visual language.
8. One synthesis drawing gives the reader a strong three-dimensional understanding of the house without pretending to be a rendering.
9. Central interface claims are shown through a small number of honest architectural details where evidence permits.
10. Text collision, clipping, style drift, stale output and cross-view contradictions are machine-detectable to the practical extent available.
11. The final PDF survives physical-size print proof.
12. PR-02 receives a frozen controlled drawing family rather than a loose collection of manually maintained SVGs.

## 12. First action

Do not start by redrawing D-F06 through D-F11.

Start at **DRW-00**, recover current authority, freeze the before-state, then perform **DRW-01 and DRW-02 before extending the renderer**. The project should decide what a good architectural drawing set is and what the book actually needs before writing the engine that produces it.

That order is essential. Otherwise the drawing tool becomes another technology project searching for a publication problem.