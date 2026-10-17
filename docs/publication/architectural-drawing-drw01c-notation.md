<!-- nav-exclude: redirect -->
# DRW-01C — scale and notation doctrine

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-01C  
**Status:** DONE pending branch validation  
**Issue:** #154

## 1. Purpose

Freeze the architectural notation rules that sit between the physical graphic tokens of DRW-01B and the page-composition rules of DRW-01D.

This packet owns:

- scale bands and scale-selection discipline;
- scale-aware simplification;
- conventional line types and architectural markers;
- selective dimensioning;
- level and datum notation;
- uncertainty / approximation behaviour;
- human label placement rules.

It does **not** implement renderer code, choose the final drawing register, harden architectural source geometry or replace a publication figure.

The governing rule is:

> **A drawing may simplify controlled architecture, but it may not invent precision, silently change scale grammar or force the reader to learn an Ovid’s House notation dialect.**

## 2. External convention boundary

DRW-01C uses current technical/construction-drawing standards as a discipline check rather than as a claim that Ovid’s House publishes construction documents.

Checked references:

- **ISO 7519:2025** — construction documentation; general principles of presentation for general arrangement and assembly drawings: https://www.iso.org/standard/89718.html
- **ISO 128-2:2022** — basic conventions for lines, leaders and reference lines: https://www.iso.org/standard/83355.html
- **ISO 128-3:2022** — views, sections and cuts: https://www.iso.org/standard/83356.html
- **ISO 5455:1979**, confirmed current in 2025 — recommended drawing scales and scale designation: https://www.iso.org/standard/11500.html
- **ISO 129-1:2018**, current while a later edition is under development — general principles for presentation of dimensions: https://www.iso.org/standard/64007.html

The standards establish the value of common presentation, line, view, scale and dimension conventions. The exact limited token family below remains a **project publication decision** and is intentionally smaller than a contractor drawing standard.

## 3. World scale and paper scale

Architecture remains in world millimetres. Notation remains in physical paper units.

A controlled drawing therefore has two independent properties:

1. world geometry and its source authority;
2. intended print scale and paper-space graphic grammar.

Changing paper scale may change what is represented and annotated. It must not alter the underlying architectural source.

### 3.1 Approved scale family

Scaled architectural drawings use only this family unless a later packet proves a concrete exception:

`1:1000 · 1:500 · 1:200 · 1:100 · 1:50 · 1:20 · 1:10 · 1:5 · 1:2 · 1:1`

Do not introduce arbitrary fit scales such as `1:73`, `1:87` or `1:125` simply because an SVG happens to fit a page.

DRW-02 freezes the exact scale for every retained view. DRW-01C freezes only the available bands and representation behaviour.

### 3.2 Scale bands

| Band | Approved scales | Intended task |
|---|---|---|
| **Context / type** | `1:1000`, `1:500`, `1:200` | setting, type plan, broad site/maintenance relation where source authority exists |
| **Whole building** | `1:100` default; `1:50` where page class and reader task justify enlargement | plans, principal sections, elevations, roof plan |
| **Assembly** | `1:20`, `1:10` | bounded interface / assembly relationships whose source authority has been earned |
| **Detail** | `1:5`, `1:2`, `1:1` | only technically controlled conditions accepted later by DRW-11 |

`1:100` is the default whole-building publication scale because it remains plausible in B5 territory for a compact domestic building. `1:50` is not a prestige scale: use it only where the drawing genuinely benefits from the additional information and the page class can support it without shrinking notation.

### 3.3 No scale-by-shrinkage

If a frozen drawing does not fit at an approved useful scale:

1. reduce non-essential annotation;
2. choose a larger page class under DRW-01D;
3. use facing pages / a spread where warranted;
4. only then reconsider the exact scale within the approved family.

Required text and line weights remain at their DRW-01B paper sizes. Geometry may reduce; annotation does not blindly scale with it.

### 3.4 “Not to scale” is not an escape hatch

A deterministic orthographic view generated from controlled measurable geometry must not be labelled `NTS` merely because scale management is inconvenient.

Abstract doctrine diagrams outside the controlled architectural-view system may be non-scaled. A drawing that claims to be a plan, section, elevation, roof plan or detail is either intentionally scaled or explicitly a schematic with a different reader task.

### 3.5 Visible scale indication

Every controlled scaled architectural view records its exact scale in the view specification.

Publication output must provide:

- a visible numeric scale ratio in plate furniture or drawing annotation; and
- for whole-building/context orthographics, a **graphic scale bar** sized approximately **25–40 mm on paper**, using a simple round world interval.

The scale bar is retained because it remains meaningful if a PDF is subsequently reduced by a reader. The numeric ratio is authoritative only at the intended physical output size.

## 4. Scale-aware representation

The same building is not represented with equal detail at every scale.

### Context / type — 1:1000 to 1:200

Show only geometry needed to understand broad architectural relation:

- principal building footprint / court / access relation;
- controlled neighbouring or landscape extents only where they actually exist in source;
- no door swing arcs;
- no joinery/frame construction;
- no decorative hatch;
- labels are sparse and strategic.

### Whole building — 1:100 / 1:50

This is the primary architectural grammar:

- cut walls/slabs/columns and openings;
- door leaves/swings only when handing and swing are controlled;
- stair direction and principal landing geometry;
- windows/openings simplified as architectural openings/frames, not construction details;
- principal fixtures only when useful to understand programme or clearance;
- room/place labels;
- selective dimensions;
- section / level / north notation only where the view needs it.

Do not expose cavity build-ups, fixings or detailed frame sections merely because the source may contain technical data elsewhere.

### Assembly — 1:20 / 1:10

The drawing may show controlled layers, interfaces and material distinctions only when those facts are source-owned and are the actual reader task.

### Detail — 1:5 / 1:2 / 1:1

Construction-like representation is admitted only after DRW-11 confirms technical authority. Graphic detail is not evidence of technical certainty.

## 5. Line types beyond the DRW-01B weight family

Line *weight* remains owned by DRW-01B. DRW-01C freezes a small line-type vocabulary.

### 5.1 Visible geometry

Continuous lines use the semantic weights from DRW-01B:

- cut = `0.50 mm`;
- profile = `0.35 mm`;
- primary visible = `0.25 mm`;
- secondary / annotation = `0.18 mm`.

### 5.2 Overhead / beyond

Geometry legitimately above the plan cut plane or beyond the principal cut may use:

- `line.secondary`;
- dash **3.0 mm**;
- gap **1.5 mm**.

This line type means **controlled geometry outside the primary visible plane**, not uncertainty.

### 5.3 Datum / grid / centreline

Only when the architectural source actually owns such a datum/grid:

- `line.secondary`;
- chain pattern **6.0 / 1.5 / 1.0 / 1.5 mm** (`long dash / gap / short dash / gap`).

Do not invent a design grid merely to make a publication drawing look technical.

### 5.4 Provisional represented geometry

Where source authority explicitly permits a bounded approximate geometry rather than exact geometry:

- `line.secondary`;
- short dash **1.0 mm**;
- gap **1.0 mm**;
- mandatory adjacent `Approx.` / `provisional` note or `≈` dimension cue.

A dash pattern is never sufficient by itself to communicate uncertainty.

## 6. Architectural markers and symbols

Use ordinary architectural forms. Symbols are restrained, monochrome and paper-sized.

### 6.1 North indicator

Use a simple north arrow + `N`, not a decorative compass rose.

Show it only when:

- orientation is source-controlled; and
- orientation materially helps read the plan / setting.

Do not invent north for a synthetic type plan whose orientation is intentionally unspecified.

### 6.2 Section marker

A section marker contains:

- a conventional cut/reference line where useful;
- arrowheads showing viewing direction;
- one compact reader-facing reference only after DRW-02 freezes the view/reference system.

DRW-01C does **not** create an `A–A`, `S01` or other publication identity family. If DRW-02 introduces a compact public reference family, it must first satisfy the existing PUB-NOM contract.

Orphan section markers that point to no retained published view are prohibited.

### 6.3 Stair direction

At whole-building scale, show a restrained arrow on the stair path pointing **from lower level toward upper level**. Add `Up` only when direction would otherwise be ambiguous.

The arrow must follow source-controlled stair geometry. It does not infer a flight arrangement absent from the model.

### 6.4 Door swing

At `1:100` / `1:50`, a controlled hinged door may show leaf + swing arc where handing/swing is source-owned and useful.

If handing or swing direction is unresolved, show the opening without manufacturing a swing.

### 6.5 Windows and openings

Windows are represented as architectural geometry at the scale band, not as branded glyphs. At whole-building scale show the opening/frame relationship only to the level the source supports; do not imply frame sections, sash divisions or fixing logic that belong to larger scales.

### 6.6 Levels / datums

Use a simple conventional level pointer / datum line with `type.note` text.

- relative project datum is preferred for the Reference House publication;
- a real survey/AOD datum may appear only when a real site source owns it;
- never promote synthetic setting geometry into survey authority.

## 7. Dimensioning doctrine

The publication uses dimensions to make architecture inspectable, not to become a tender or setting-out drawing.

### 7.1 What earns a dimension

Dimensions should normally be limited to:

- overall building / court / principal wing extents;
- principal structural or spatial spans where they support the argument;
- key openings or clearances when the architectural claim depends on them;
- stair geometry where relevant;
- selected assembly dimensions on authorised detail drawings.

Do **not** dimension every wall, room and opening simply because the source can produce numbers.

### 7.2 Dimension source rule

A dimension is rendered only from controlled world geometry / controlled numeric source.

Do not dimension:

- geometry inferred from an illustration;
- a provisional line as though exact;
- a manually shifted publication shape whose relationship to source is not controlled.

### 7.3 Linear dimension format

Ordinary architectural linear dimensions are in **millimetres with no unit suffix** unless a drawing explicitly declares another unit.

Use no decimal places for integer-millimetre controlled values. Do not add decimal precision that the source does not own.

A plate/detail note may state `Dimensions in millimetres` once rather than suffixing every number.

### 7.4 Level format

Relative levels are normally presented in **metres with a sign**, for example `+3.300`, where source precision supports millimetre resolution.

The number of decimals may be reduced when source authority is coarser. Never pad an approximate level with spurious decimals.

Where needed, one plate note states `Levels in metres`.

### 7.5 Dimension geometry

Ordinary linear dimensions use:

- `line.secondary` for dimension and extension lines;
- **45° architectural ticks, 1.8 mm paper length**;
- extension line starts approximately **1.0 mm** clear of object geometry;
- extension line continues approximately **1.0 mm** beyond the dimension line;
- dimension text = `type.note` **6.5 pt**;
- text centred on / immediately above the dimension line with a local break in the line where needed;
- minimum **5 mm paper-space separation** between parallel dimension chains.

Use arrowheads where convention requires direction (leaders, section direction, stair direction), not as the default linear-dimension terminator.

### 7.6 Chain hierarchy

Where several dimension chains are needed, place from architecture outward:

1. local opening/subdivision dimensions;
2. principal spans/bays;
3. overall extent furthest from the building.

A crowded chain is a reason to remove nonessential dimensions or change page class, not to shrink type below 6.5 pt.

### 7.7 Tolerances

Do not show construction tolerances in ordinary publication orthographics.

A tolerance appears only on a technically authorised later detail where the source/evidence actually owns it and the tolerance itself is part of the architectural/technical argument.

## 8. Uncertainty and authority notation

This is a publication of controlled knowledge, not a drawing set that hides unknowns behind drafting confidence.

### 8.1 Controlled

Controlled geometry uses the normal architectural line hierarchy with no uncertainty cue.

### 8.2 Approximate / provisional but bounded

Use only when the source explicitly owns an approximate location/extent.

Required treatment:

- provisional line type from §5.4 where geometry itself is approximate;
- `≈` before a numerical value or an explicit `Approx.` / `provisional` note;
- no exact dimension terminators or false decimal precision;
- no material hatch or solid cut poche that would imply fully controlled assembly geometry.

### 8.3 Range

A range is drawn only when the source owns both bounds.

Use paired/nested thin extents with a direct `range` / min–max note. Do not invent a tolerance band around a single uncertain point merely to make uncertainty look quantified.

### 8.4 Unresolved

When exact geometry is not controlled:

- omit the unresolved detail;
- use an explicit break / local note such as `not resolved` where omission could otherwise mislead; or
- refuse the requested view/detail entirely when the missing fact materially changes the architectural reading.

The renderer must not interpolate a plausible component simply to close a polygon or make a section attractive.

### 8.5 Meaning may not depend on grey

Grey may reinforce uncertainty hierarchy but can never be its sole signal. The distinction must survive black-only reproduction through geometry, line type and/or explicit text.

## 9. Labels and leaders

### 9.1 Human names lead

Publication labels use architectural names (`Kitchen`, `Courtyard`, `Service riser`) rather than machine IDs.

Any compact public cross-reference introduced later must satisfy PUB-NOM before it appears in reader-facing drawings.

### 9.2 Primary space labels

Use `type.label` = **7.5 pt** for principal room/place names.

Default placement is inside the controlled containing region in clear space near an authored or deterministic anchor.

A label-placement algorithm may reposition a label **within the same architectural region**. It must not move a room name across a wall, opening or zone boundary merely to resolve a collision.

### 9.3 Notes and technical labels

Use `type.note` = **6.5 pt** for levels, dimensions, short leaders and concise technical notes.

Long explanatory prose remains page-caption territory under DRW-01D, not drawing annotation.

### 9.4 Collision behaviour

If a required label cannot be placed legibly at the frozen page/scale:

1. use an authored alternate anchor;
2. use a restrained leader if the referent remains unambiguous;
3. change page class / scale under the owning packet;
4. otherwise fail the drawing check.

Do not solve collisions by:

- shrinking below the frozen type minimum;
- rotating labels arbitrarily;
- placing opaque decorative boxes around ordinary room names;
- moving a label into another room;
- deleting a required label silently.

### 9.5 Leaders

Leaders use `line.secondary` and terminate clearly at the referenced geometry. Prefer one straight segment; one controlled elbow is permitted when it materially improves clearance.

Do not let leaders cross unrelated text or become a spaghetti layer. If several leaders are required to explain a simple orthographic drawing, the drawing/annotation selection should be reconsidered.

### 9.6 Abbreviations

Prefer ordinary words. Do not create project-specific abbreviations to save space.

Established professional abbreviations may appear on explicitly technical drawings when their meaning is either conventional for the intended reader or defined once in the plate/key. The compact Primer and ordinary publication profile should remain human-first.

## 10. Required renderer/view-spec consequences

No implementation occurs in DRW-01C, but later renderer work must be capable of expressing at least:

- enumerated exact drawing scale;
- scale band;
- scale bar;
- visible / overhead / datum-grid / provisional line types;
- north marker with optional omission;
- stair direction marker;
- section marker whose reader identity is supplied externally by the frozen register;
- controlled door swing with omission when unresolved;
- relative level marker;
- selective linear dimensions with architectural ticks;
- explicit uncertainty state / note;
- room/place label with authored fallback anchor;
- leader;
- fail-closed behaviour when required annotation cannot be placed at frozen paper sizes.

These are semantic capabilities. Domain drawing code must not hard-code the SVG appearance locally.

## 11. Explicit non-decisions

DRW-01C does not freeze:

- which exact views appear in the book — DRW-02;
- the exact scale of each retained view — DRW-02;
- page margins / page classes / gutter zones — DRW-01D;
- renderer APIs or implementation — first earned by DRW-03C;
- section/elevation public numbering — DRW-02 + PUB-NOM if a compact family is needed;
- a structural grid that the Reference House does not already own;
- survey orientation / north for synthetic setting material;
- construction tolerances absent from technical source;
- any new architectural geometry.

## 12. Proof debt

As with DRW-01B, these values remain subject to the **DRW-01E print-size specimen**.

DRW-01E may revise a scale/notation token only when A4 and conservative B5-territory proof demonstrates a real legibility, reproduction or architectural-reading failure. Preference alone is not a reason to churn the frozen doctrine.

## 13. Handoff

**Next packet: DRW-01D — freeze page classes, facing-page/spread/rotation hierarchy, caption ownership and gutter safe zones.**

DRW-01D must compose around the scale and paper-space notation rules frozen here. It may not solve page-layout problems by silently shrinking the architectural notation system.