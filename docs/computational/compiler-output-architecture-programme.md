# Compiler Output Architecture programme

**Programme:** COA — Compiler Output Architecture  
**Status:** PLANNED / AUTHORISED — no implementation gate passed yet  
**Planning baseline:** `2bacd97889caa7da1fe83ad4cbd7a7cdfb7be22c`  
**Computational maturity on entry:** M4 — internally validated / controlled at bounded computational scope  
**Reference House maturity on entry:** M3 — coordinated at virtual-design scope  
**Relationship to prior work:** downstream presentation/projection work; **not CH-09 and not RH-C6**

## Purpose

The hardened Metamorph Compiler now has a controlled semantic baseline, deterministic compilation and six frozen generated SVG artefacts. A direct visual inspection of those artefacts exposed a distinct problem that is not a new building-capability problem and is not ordinary software hardening:

> **the compiler needs an explicit output architecture that distinguishes machine proof, human inspection, and architectural communication.**

The present artefacts conflate several jobs. Some are spatial projections and genuinely belong in SVG. Others are tables or registers emitted as SVG only because the rendering path happened to be graphical. The plan/section outputs are semantically disciplined but still behave more like compiler-proof projections than fully legible architectural inspection drawings. The structural topology view has a projection-orientation mismatch with the plans. The section has a visible clipping defect. Several known-but-non-numeric relationships are retained in compiler semantics but disappear visually because the renderer refuses, correctly, to invent missing geometry.

COA resolves those problems **without widening the architectural or technical authority of the compiler**.

The end state is not a CAD/BIM system. It is a small deterministic projection layer in which each kind of information is emitted in the medium appropriate to its semantics, and in which a competent human can inspect what the compiler knows, what it does not know, and why.

---

## 1. Governing distinction

The compiler currently needs three clearly separate output classes.

### A. Machine / proof artefacts

Purpose: regression, provenance, exact identity, automated checking.

Typical formats:

- JSON manifests;
- stable diagnostic/result records;
- hashes/fingerprints;
- machine-readable inventories.

These optimise for exactness and reproducibility, not architectural reading.

### B. Semantic inspection outputs

Purpose: allow a developer, architect or reviewer to inspect the compiled state quickly and catch contradictions, omissions and suspicious relationships.

Typical formats:

- generated Markdown/HTML tables and registers for non-spatial information;
- SVG for metric geometry, spatial topology or graph relationships where a diagram materially improves understanding;
- clear legends, orientation and uncertainty conventions.

These are the principal target of COA.

### C. Publication architectural figures

Purpose: explain an architectural argument to a reader of *Ovid’s House*.

Ownership: **PR-00D — Figure and visual-argument completion**, not COA.

Publication figures may derive from COA outputs, but COA must not quietly turn compiler inspection drawings into finished monograph figures. Publication figures require publication-native labels, captions, composition and editorial judgement. They remain downstream of compiler authority.

The intended relationship is:

```text
AUTHORED ARCHITECTURAL SOURCE
        ↓
METAMORPH COMPILER
        ↓
COMPILED SEMANTIC STATE
        ├── machine/proof artefacts
        ├── semantic inspection outputs   ← COA
        └── publication figure sources    → PR-00D owns final communication
```

No generated output becomes architectural source authority.

---

## 2. Existing baseline that must not be casually rewritten

CH-00 and CH-08 deliberately froze the exact identities of six existing generated SVGs:

- `docs/reference-house/rhc1-ground-floor.svg`
- `docs/reference-house/rhc1-first-floor.svg`
- `docs/reference-house/rhc1-principal-section.svg`
- `docs/reference-house/rhc2-structural-topology.svg`
- `docs/reference-house/rhc3-service-topology.svg`
- `docs/reference-house/rhc4-boundary-topology.svg`

Their exact Git blob identities live in `compiler/ch00/reference-house-baseline.json`, and CH-08 explicitly records preservation of those identities as part of the hardening closeout.

### COA preservation rule

**Do not edit those six artefacts in place merely to make them prettier.**

They are historical executable evidence of the RH-C1…RH-C4 / CH baseline and should remain reproducible by their existing generators.

COA should create a **successor output family under new stable paths**. The old artefacts can later be reclassified in documentation as historical proof/inspection outputs once the successor family passes, but their content and hashes should remain frozen unless a separate explicit decision reopens the CH baseline.

This rule is important. A presentation improvement is not a good reason to erase the exact evidence that the hardening programme preserved.

---

## 3. Findings that triggered the programme

These are the initial observations. COA-00 must reproduce and verify each against current `main` before implementation.

### 3.1 RH-C3 and RH-C4 use SVG for essentially non-spatial reports

`rhc3-service-topology.svg` is principally a route/register table.  
`rhc4-boundary-topology.svg` is principally a structured textual register of carriers, transitions and drainage routes.

SVG gives deterministic layout, but at a cost:

- poor mobile reflow;
- weaker accessibility;
- awkward copy/search/link behaviour;
- poor textual diffs;
- large fixed canvases and avoidable white space;
- visual implication that the artefact is a drawing when it is actually a report.

Successor non-spatial registers should normally be generated Markdown/HTML backed by the same compiled state.

### 3.2 RH-C2 structural topology is visually inverted relative to RH-C1 plans

The Reference House coordinate convention is south-west origin, +X east, +Y north. The RH-C1 plan projection flips world Y into SVG Y so north is visually up. The structural renderer currently draws derived structural bounds directly into SVG coordinates instead of applying the same plan projection. The result places the south field visually above the courtyard and the north field below it.

This is not a structural-semantic failure, but it is a drawing-orientation defect and makes cross-view inspection unnecessarily dangerous.

### 3.3 RH-C1 principal section clips a right-side datum annotation

A current screenshot visibly truncates `outer cornice/eaves control +6250` to approximately `+62` at the right edge. The generated text is correct; the layout/viewBox is not sufficiently generous.

The successor layout must reserve explicit annotation space rather than rely on accidental margin.

### 3.4 Structural span arrows imply direction where the model owns only an axis

The structural source records `spanAxis: x | y`. The renderer uses a single arrowhead. A competent reader can reasonably interpret this as one-way load direction toward one support rather than an undirected span axis.

The successor convention should use a double-headed arrow or another explicitly non-directional span symbol unless the semantic model actually owns directional load flow.

### 3.5 Orientation and cross-view registration are too implicit

Plan-like outputs need an explicit north indicator. The principal section should mark south and north. The plans should show the principal section cut and the section should carry the same identifier.

A reader should not have to infer orientation from room names.

### 3.6 Known qualitative relationships can disappear visually

The Reference House source deliberately contains qualitative opening relationships whose exact numeric centres are absent, including east/west courtyard relationships and north garden relationships. The current numeric-opening renderer correctly refuses to invent coordinates, but the absence of a drawn mark can look like absence of an opening obligation altogether.

The successor drawing language needs a convention for:

> **relationship known; geometry unresolved**

without manufacturing a line, width or centre.

### 3.7 Required adjacency/connectivity is not visible where door geometry is unresolved

The semantic source carries required room adjacencies. Where an exact internal doorway is not authored, current plans can visually read as sealed rooms.

The successor plans should distinguish:

- exact/numeric opening geometry;
- approximate/ranged opening geometry;
- qualitative required connection with unresolved position;
- no known opening relationship.

Again, do not invent door positions or swings.

### 3.8 Compiler IDs dominate the current graphic language

Stable semantic IDs are valuable for inspection and debugging, but human labels should carry the first reading. The successor inspection view may retain IDs as secondary labels/data attributes without making `G-DRAW-02`, `U-BED-P01`, etc. the main architectural vocabulary.

### 3.9 The output medium is chosen by history rather than by information type

The larger underlying problem is architectural: the repository does not yet have a declared rule for when compiler output should be JSON, report text, topology diagram or architectural drawing.

COA fixes that root decision before redrawing individual artefacts.

---

## 4. Proof and authority boundary

COA may improve:

- legibility;
- orientation;
- accessibility;
- format appropriateness;
- deterministic rendering;
- traceability from compiled state to visible output;
- visual representation of uncertainty;
- cross-view coordination;
- inspection efficiency;
- documentation/publication handoff quality.

COA must **not** silently add or prove:

- wall-face construction geometry not currently owned by the source;
- exact internal door locations or swings where only adjacency is known;
- stair strings, tread construction, guards, headroom or exact well/trimmer geometry;
- structural member sizes, strength, deflection, vibration, robustness or foundation adequacy;
- exact service routing, sizing, pressure loss, airflow, acoustics or commissioning adequacy;
- U-values, condensation, airtightness or moisture performance;
- drainage capacity;
- fire or Building Regulations compliance;
- product adequacy;
- construction tolerances;
- architectural merit;
- publication-ready visual argument merely because an SVG looks polished.

### Stop rule

If a desired drawing requires a fact the source does not own, **do not draw a plausible answer**.

Choose one of:

1. represent the fact qualitatively as unresolved;
2. omit it and state why;
3. if the omission reveals a genuine architectural contradiction, stop COA work and reopen the owning architectural workstream explicitly.

Presentation is not authority.

---

## 5. Output-medium decision rule

COA should make output choice explicit and testable.

| Information character | Preferred output | Reason |
|---|---|---|
| machine identity, fingerprints, statuses, exact inventories | JSON | deterministic and machine-checkable |
| rows/registers with no meaningful 2D location | generated Markdown/HTML | searchable, reflowable, accessible, diffable |
| metric plan/section geometry | SVG | spatial position and proportion carry meaning |
| structural support/span topology tied to plan coordinates | SVG | spatial relationship carries meaning |
| pure graph topology with no metric position | SVG only if graph form materially improves understanding; accompany with textual register | avoid graphical theatre |
| boundary/drainage geometry tied to shell/roof/courtyard | SVG | spatial direction/ownership may carry meaning |
| long carrier/transition obligation inventories | generated Markdown/HTML | report semantics, not drawing semantics |
| publication figure | downstream PR-00D source, not automatically a compiler artefact | editorial ownership differs |

The test is simple:

> **If removing X/Y position does not materially reduce the meaning, the primary output probably should not be SVG.**

---

## 6. Target implementation shape

The existing generic compiler domains remain untouched in authority:

```text
core
  ↓
plan
  ↓
structure
  ↓
services
  ↓
envelope
  ↓
calculation
```

COA adds a deliberately downstream artefact layer. Candidate shape:

```text
compiler/
  output/
    model.ts              # artefact kinds, metadata, manifest contract
    conventions.ts        # shared output/drawing conventions
    svg.ts                # small deterministic SVG helpers only
    report.ts             # deterministic text/Markdown helpers only

  reference-house/
    output/
      build.ts            # consume one canonical compiled system result
      plan.ts
      section.ts
      structure.ts
      services.ts
      boundary.ts
      manifest.ts
```

Exact names may change during COA-00/01 if the current dependency enforcement makes another small shape cleaner. The invariant matters more than the folder spelling:

> **output code may depend on compiled semantic state; runtime semantic domains must never depend on output code.**

Do not create a general scene graph, CAD kernel, plugin renderer, canvas abstraction or layout framework.

### Canonical input

Successor outputs should consume the canonical single-pass Reference House system compile wherever practical:

`createReferenceHouseSource()` → `compileReferenceHouseSystem(source)` → output projection.

Do not reintroduce duplicated compilation merely because historical RH-C generators use historical wrappers.

Historical generators remain as frozen regression/evidence surfaces.

---

## 7. Successor artefact family

The exact final names should be frozen at COA-01, but the intended family is approximately:

```text
docs/reference-house/generated/
  index.md
  ground-floor-plan.svg
  first-floor-plan.svg
  principal-section.svg
  first-floor-structure.svg
  service-register.md
  boundary-register.md
  output-manifest.json
```

Additional graphical service/boundary views should be added only if COA-02/05 demonstrates that the relationships are materially clearer graphically.

Potential examples:

- service network graph — useful if route continuity/vertical-trunk relationships are hard to inspect in a register;
- roof/drainage ownership diagram — useful because directional catchment and outlet geography is spatial;
- carrier matrix — probably better as a report/table than SVG.

Do not force every compiler domain to produce one picture for symmetry.

---

## 8. Drawing language for semantic inspection

COA should establish one modest monochrome drawing language shared by plan/section/topology outputs.

### 8.1 Orientation

- plan-like views are north-up by default;
- north arrow is visible;
- if a view is ever rotated, rotation is explicit;
- section ends are labelled by cardinal direction;
- plan/section cut references use one stable identifier such as `A–A`.

### 8.2 Authority / certainty

The graphic language must distinguish at least:

- controlled/exact;
- approximate;
- ranged;
- provisional;
- qualitative/unresolved geometry;
- REVIEW state.

Do not rely on colour as the only distinction. Monochrome reproduction must remain legible.

A likely convention is:

- solid line: controlled/represented geometry;
- dashed line: provisional represented geometry;
- bracket/band: numeric range rather than invented midpoint;
- point/flag/glyph: relationship or opening known but width/centre unresolved;
- light contextual line: derived background context only;
- explicit banner/note: REVIEW.

COA-03 must freeze the actual convention and add a legend to views that need it.

### 8.3 Labels

Primary label: human architectural term.  
Secondary label: stable semantic ID where useful for inspection.

Example:

```text
Drawing room
G-DRAW-02
```

Stable IDs should also remain in `data-entity` attributes for machine inspection.

### 8.4 Dimensions

Only dimension values already owned by compiled state.

Do not infer wall faces, exact clear room sizes or centreline offsets from planning reservations unless the model explicitly owns them.

### 8.5 Structural notation

- span axis is visually undirected unless direction is semantically owned;
- support/bearing/edge-beam/reaction/interruption symbols are explained in a legend;
- structural view aligns with the same plan projection/orientation as the architectural plan;
- where useful, a light plan context may sit below structural topology, generated from the same compiled plan rather than redrawn separately.

### 8.6 Known but unresolved relationships

Required qualitative relationships should be visible without fake geometry.

Examples:

- a small labelled tick/flag on a host boundary where the host is known but centre is not;
- an adjacency/connection marker between named spaces where a connection is required but exact opening geometry is absent;
- an annotation such as `required connection — position unresolved`.

The marker must not look like an exact door/window opening.

### 8.7 Wall and stair restraint

The successor plans should not suddenly become conventional architectural plans by inventing wall thickness and stair construction.

The compiler does know a 400–425 mm normal wall planning family, a 450 mm stress case, 18 rises, 6/6/6 grouping, 280 mm going, approximately 1000 mm clear stair width target and a 2400–2500 mm planning reservation. Those values may be exposed as **planning annotations/reservations**.

They must not be converted into exact wall faces, stair flights, strings or a well geometry until the source owns those placements.

---

# 9. Programme sequence

```text
COA-00  BASELINE + OUTPUT AUDIT
   ↓
COA-01  OUTPUT CONTRACT + DEPENDENCY ARCHITECTURE
   ↓
COA-02  NON-SPATIAL REPORT EXTRACTION
   ↓
COA-03  SHARED DRAWING / UNCERTAINTY LANGUAGE
   ↓
COA-04  REFERENCE HOUSE PLAN + SECTION SUCCESSOR SET
   ↓
COA-05  TOPOLOGY SUCCESSOR VIEWS
   ↓
COA-06  INTEGRATION + DOCS SURFACE + CLOSEOUT
```

Do one gate at a time. Do not start by rewriting every renderer.

---

# COA-00 — Baseline and output audit

## Question

Can later presentation changes prove that they changed only representation, not architectural meaning or the frozen hardening baseline?

## Work

1. Reload current `main`; record exact starting commit and reconcile any change after planning baseline `2bacd97889caa7da1fe83ad4cbd7a7cdfb7be22c`.
2. Run the complete repository health stack and exact artefact checks.
3. Verify all six CH-frozen SVGs still match `compiler/ch00/reference-house-baseline.json`.
4. Reproduce each initial finding in section 3 against code and rendered output.
5. Inventory every compiler-generated output, its generator, input compile surface, format, intended audience and current documentation/publication use.
6. Classify each output as:
   - `MACHINE_PROOF`;
   - `SEMANTIC_REPORT`;
   - `SPATIAL_INSPECTION`;
   - `HISTORICAL_EVIDENCE`;
   - `PUBLICATION_SOURCE_CANDIDATE`.
7. Record which outputs contain information that is currently hidden visually despite existing semantically.
8. Record all cases where the renderer directly consumes a historical wrapper rather than the canonical single-pass system result.
9. Freeze the **legacy preservation rule**: the six historical artefacts remain byte-identical through COA unless a separately authorised baseline reopen occurs.
10. Create a machine-readable COA baseline/inventory if useful; do not duplicate the CH semantic manifest unnecessarily.

## Required findings to verify

At minimum:

- structural north/south projection mismatch;
- section right-edge clipping;
- single-headed span-axis notation;
- no north arrow / cross-view section reference;
- qualitative opening relationships not visibly expressed in plan output;
- required adjacency not visibly distinguished from a sealed boundary where exact opening geometry is absent;
- C3/C4 report-like content emitted as fixed SVG;
- all existing proof boundaries remain unchanged.

## Exit

A later agent can state exactly which artefacts are being superseded for inspection, which historical artefacts remain frozen, and which semantic facts each successor output must preserve.

---

# COA-01 — Output contract and dependency architecture

## Question

Can output generation become an explicit downstream system rather than a collection of historical drawing functions?

## Work

1. Define a small artefact model containing at least:
   - stable artefact ID;
   - output class/kind;
   - format;
   - generated path;
   - source compile identity/fingerprint;
   - renderer/output schema version;
   - proof/authority note;
   - deterministic content identity after generation.
2. Define one format-selection contract based on information character, not historical gate.
3. Establish downstream module boundaries for output code.
4. Add a dependency-law test so semantic runtime modules cannot import the output layer.
5. Ensure successor generation can consume one canonical `compileReferenceHouseSystem()` result rather than recompiling domain chains independently.
6. Define PASS/REVIEW/FAIL generation policy:
   - `FAIL`: no canonical inspection artefacts;
   - `REVIEW`: render only with unmistakable review state if the relevant source/result remains safely projectable;
   - `PASS`: canonical generation allowed.
7. Define successor output paths and manifest version.
8. Preserve historical RH-C generators unchanged except for a separately justified bug needed to keep them reproducible; generally they should not need modification.

## Gate

No drawing redesign begins until the output dependency and identity contract is explicit and tested.

---

# COA-02 — Non-spatial report extraction

## Question

Can report-shaped information become real reports while remaining deterministic and traceable?

## Mandatory targets

### Service topology

Create a generated, normal-document service register from the same compiled service result currently projected into `rhc3-service-topology.svg`.

It should retain at least:

- network;
- service class;
- semantic route;
- role;
- registered crossing;
- status/proof boundary;
- selected crossing summary.

Use normal headings/tables and allow the docs site/browser to reflow it.

### Boundary topology

Create a generated boundary report from the same compiled boundary result currently projected into `rhc4-boundary-topology.svg`.

It should retain at least:

- boundary carriers;
- typed boundary transitions;
- opening/service obligations;
- directional drainage routes;
- proof-boundary statement.

Long registers should be text/tables, not positioned text in a large SVG canvas.

## Requirements

- deterministic byte output for unchanged compiled state;
- normal searchable/selectable text;
- stable anchors where practical;
- mobile-readable layout through ordinary docs styling;
- proof boundary visible near the top, not hidden at the bottom;
- no loss of machine IDs needed for cross-reference;
- old C3/C4 SVGs remain frozen historical evidence.

## Optional graphical companion

If a service network graph or boundary/drainage diagram materially improves understanding, it may be designed later under COA-05. The existence of a report does not forbid a genuinely useful diagram; it removes the requirement that the report itself pretend to be one.

---

# COA-03 — Shared drawing and uncertainty language

## Question

Can all spatial inspection outputs communicate orientation, authority and unresolved geometry consistently before individual views are redrawn?

## Work

1. Freeze shared plan projection convention: north-up, one world→drawing transform.
2. Freeze section convention and section-cut identifier.
3. Define line/symbol conventions for exact, provisional, approximate, range and qualitative/unresolved states.
4. Define north arrow/cardinal direction convention.
5. Define title / subtitle / status / legend hierarchy.
6. Define human-label + semantic-ID hierarchy.
7. Define span-axis symbol so an undirected axis cannot be mistaken for one-way load flow.
8. Define qualitative opening and required-connection markers.
9. Define reserved annotation zones so labels cannot clip at the SVG edge.
10. Keep the language monochrome-first and print-safe.
11. Add focused renderer tests for conventions rather than only golden whole-file snapshots.

## Gate

The conventions should be simple enough to explain in one compact legend. If the legend starts looking like a CAD standard, the programme is over-designed.

---

# COA-04 — Reference House plan and section successor set

## Question

Can the compiled Reference House be inspected as a coherent architectural plan/section set without inventing facts absent from the model?

## Mandatory outputs

- ground-floor plan;
- first-floor plan;
- principal N–S section.

## Mandatory improvements

### Plans

- north arrow;
- explicit human room names, with semantic IDs secondary;
- principal `A–A` section line and direction markers;
- existing shell/court/front-field dimensions retained where authoritative;
- exact/approximate/ranged openings represented according to authority;
- qualitative opening relationships visibly represented as unresolved, not omitted;
- required adjacency/connectivity visibly represented where exact opening position is absent;
- concise legend;
- distinction between provisional boundaries and controlled boundaries;
- no invented wall faces;
- no invented internal door positions;
- no invented stair construction;
- optional stair/wall planning callouts only where source values already exist.

### Section

- `A–A` identifier matching plans;
- south and north marked;
- all datum labels fully inside the layout;
- current floor/ceiling/cornice and roof values retained;
- roof fall direction remains explicit;
- stair landing datums remain clearly derived guides, not drawn stair construction;
- court remains visibly open to sky;
- annotation column has deterministic reserved width;
- proof-boundary note remains concise and legible.

## Semantic parity requirement

COA-04 is allowed to change pixels and visible organisation dramatically. It is not allowed to silently change the compiled house.

Tests must prove that the successor views derive from the same semantic values and relationships as the canonical system compile.

---

# COA-05 — Topology successor views

## Question

Which compiled topologies genuinely benefit from a diagram, and can those diagrams share the same orientation/uncertainty rules as the plans?

## Structural topology — mandatory

Create a successor structural inspection SVG that:

- uses the same plan projection as the architectural plans;
- therefore places north/south consistently;
- carries north orientation explicitly;
- distinguishes bearing lines, edge beams, reaction nodes, span fields and interruptions in a legend;
- uses non-directional/double-headed span notation for a span axis;
- may use a light architectural plan context derived from the same plan result;
- visibly marks approximate service penetration envelope and qualitative stair interruption without inventing exact trimming geometry;
- retains the existing adequacy disclaimer.

## Service topology — conditional graphical companion

Do not recreate the old table as a prettier SVG.

Evaluate whether a node/edge network graph materially improves inspection of:

- plant/riser/terminal continuity;
- vertical trunks;
- external entries/exits;
- registered crossings.

If yes, create a graph whose layout is explicitly topological rather than pretending to be plan routing. Label it `TOPOLOGY — NOT PLAN GEOMETRY` prominently.

If the generated report is clearer on its own, do not create an SVG merely for symmetry.

## Boundary / drainage — selective graphical companion

Do not reproduce long carrier/transition lists as SVG.

A small spatial diagram is justified only for relationships whose geometry matters, especially:

- outer vs courtyard boundary ownership;
- roof catchment directions;
- courtyard primary vs emergency drainage route ownership;
- registered penetrations where host location is semantically known.

Keep the detailed carrier/transition inventory in the report.

## Gate

Each retained graphic must answer a question that is materially harder to answer from the report alone.

---

# COA-06 — Integration, docs surface and closeout

## Question

Does the new output system improve inspection without corrupting the hardened compiler baseline or becoming a second architectural authority?

## Work

1. Add one curated docs page that explains the output classes and embeds/links the successor Reference House inspection set.
2. Make reports ordinary docs pages rather than raw fixed canvases.
3. Provide links to raw SVG/JSON artefacts for forensic inspection without making raw artefacts the only reader experience.
4. Add one deterministic successor-output manifest and verification command.
5. Add obvious developer commands, likely along the lines of:
   - `outputs:generate`;
   - `outputs:check`.
6. Decide whether the top-level `artifacts:*` commands should invoke both historical and successor checks or remain split; choose the least surprising contract and document it.
7. Keep `npm test`, docs build, publication validation and CH-00…CH-08 preservation green.
8. Verify old six SVG hashes remain exactly unchanged.
9. Verify all successor outputs regenerate byte-for-byte from unchanged compiled state.
10. Verify source objects are not mutated by rendering.
11. Verify `FAIL` cannot emit canonical inspection outputs and `REVIEW` is unmistakably marked where allowed.
12. Update `docs/computational/README.md`, `compiler/README.md` and `STATUS.md` only after the programme result is known.
13. Record exactly which old outputs are now historical proof artefacts versus current semantic inspection outputs.
14. Hand the trustworthy successor set to PR-00D as **source material**, not as automatically publication-ready figures.

## Closeout judgement

COA should normally **not change computational maturity**. M4 already describes the bounded compiler machinery. Better output legibility does not itself earn M5 and does not raise Reference House maturity.

If COA reveals an actual semantic bug, that bug must be handled explicitly and may require a separate reassessment. Do not hide a semantic correction inside presentation work.

---

## 10. Test plan

The final programme should cover the following classes of tests.

### Legacy preservation

- all six CH-frozen SVG hashes remain unchanged;
- existing historical generators still reproduce them exactly;
- CH-00 and CH-08 tests remain green.

### Output identity and determinism

- identical compiled state → byte-identical successor outputs;
- manifest records source compile identity and output identities;
- semantically relevant mutation changes only outputs that own the changed fact;
- output generation does not mutate source or compiled results.

### Orientation and projection

- all plan-like successor views use one north-up projection;
- structural south/north fields occupy the same visual side as corresponding architectural plan context;
- section direction is labelled and corresponds to the plan cut.

### Semantic coverage

- every numeric opening intended for the view is present with correct authority metadata;
- qualitative opening relationships appear as qualitative markers, not invented spans;
- required adjacency/connectivity intended for plan inspection is represented without fake door geometry;
- structural interruptions are visible at their owned precision;
- report rows exactly cover compiled service/boundary records intended by the report contract.

### Authority restraint

- no wall-face geometry is emitted unless the source later owns it explicitly;
- no exact stair geometry is emitted from planning-only values;
- no service graph claims metric routing;
- no topology diagram claims sizing/performance/adequacy;
- proof boundary/disclaimer text remains present.

### Layout and accessibility

- every SVG has `<title>` and `<desc>`;
- legends/status/orientation exist where required;
- annotation regions fit inside declared layout bounds by construction;
- generated Markdown has meaningful headings and table headers;
- reports remain usable without colour;
- docs build exposes every intended route.

### Failure behaviour

- failed canonical compile cannot generate canonical successor artefacts;
- review-state generation, where allowed, carries visible and machine-readable REVIEW state;
- missing artefact dependencies fail generation rather than silently omitting rows/elements.

---

## 11. Relationship to PR-00D publication figures

COA is timely because PR-00D will soon need Reference House plan/section/service/maintenance figures. The two programmes should reinforce rather than blur each other.

COA establishes:

- trustworthy source geometry;
- deterministic projection;
- uncertainty notation;
- orientation;
- machine identity;
- human-inspectable semantics.

PR-00D decides:

- which figures belong in the book;
- how much compiler vocabulary to remove;
- publication composition and scale;
- caption and argumentative purpose;
- whether one compiler inspection view should be redrawn/simplified for publication;
- how it sits in the black-line publication visual language.

A publication figure may derive from a COA view, but it should never gain authority merely by looking more architectural.

### Scheduling implication

Prefer to complete COA-00…COA-04 before PR-00D freezes Reference House plan/section figures. PR-00C claim/evidence work can proceed independently. COA-05 may run in parallel with early PR-00D inventory work, provided publication does not freeze a legacy topology artefact that COA is about to supersede.

---

## 12. Non-goals

Do not use COA to build:

- general CAD;
- BIM/IFC export;
- a canvas editor;
- user-authored drag/drop geometry;
- a scene-graph framework;
- dimensioning automation for facts not owned by the model;
- automated architectural aesthetics;
- structural/MEP/building-physics calculations;
- a general diagramming DSL;
- publication layout machinery already owned by the publication pipeline;
- a replacement for professional drawings.

The target is deliberately smaller:

> **make the compiler’s existing knowledge legible in the medium appropriate to that knowledge.**

---

## 13. Final quality bar

COA is complete only when all of the following can be defended:

- old RH-C/CH evidence remains byte-identical and reproducible;
- every successor output has a declared audience, format and authority;
- non-spatial registers are no longer disguised as drawings;
- plan-like views share one explicit north-up coordinate convention;
- the principal section cannot clip owned annotations;
- span-axis notation cannot reasonably be mistaken for one-way load direction;
- orientation and plan/section cross-reference are explicit;
- known qualitative opening/connection obligations are visible without invented coordinates;
- human labels lead while semantic IDs remain inspectable;
- unresolved wall/stair/service geometry remains visibly unresolved;
- all successor outputs derive from one canonical compiled system state wherever practical;
- output code remains downstream of semantic runtime and cannot become a second source authority;
- generation is deterministic, fail-closed and manifest-linked;
- the docs site provides a coherent inspection surface rather than a collection of raw SVG links;
- PR-00D receives trustworthy figure source material without compiler proof artefacts being mistaken for finished publication graphics;
- no new claim about the physical building, compliance or engineering adequacy has been smuggled in through better-looking drawings.

---

## 14. Handoff instruction for a new agent

A fresh agent should **not rely on chat history**.

Start from repository authority and read, at minimum:

- this document;
- `STATUS.md`;
- `docs/computational/README.md`;
- `docs/computational/compiler-hardening-programme.md`;
- `compiler/ch00/reference-house-baseline.json`;
- `compiler/ch08/README.md`;
- `compiler/README.md`;
- `compiler/reference-house/fixture.ts`;
- `compiler/reference-house/system-compile.ts`;
- `compiler/reference-house/projection.ts`;
- `compiler/reference-house/drawings.ts`;
- `compiler/structure-slice/drawing.ts`;
- `compiler/service-slice/drawing.ts`;
- `compiler/boundary-slice/drawing.ts`;
- RH-C1 drawing parity record;
- current RH-C2/RH-C3/RH-C4 generators/tests;
- `package.json` and repository validation/CI scripts;
- `docs/manuscript/pr00-candidate-book-freeze-programme.md`, especially PR-00D.

Then do **COA-00 only**.

Do not begin by polishing SVGs. Freeze the current evidence, reproduce the problems, classify the outputs and record the actual dependency/output map first.

If the repository has advanced since planning baseline `2bacd97889caa7da1fe83ad4cbd7a7cdfb7be22c`, reconcile the newer state explicitly rather than resetting or assuming this plan is newer authority than the code.
