# COA-03 — shared drawing and uncertainty language

**Gate:** COA-03  
**Status:** PASS subject to repository CI  
**Starting main:** `74a6c3c469af5a314d7e66acd98a13109f1a4426`  
**Issue:** #95  
**Authority effect:** none

## Question

Can every successor spatial inspection view communicate orientation, certainty and deliberately unresolved geometry consistently before the individual Reference House views are redrawn?

**Answer: yes.** COA-03 freezes one small monochrome-first drawing language and one north-up projection convention. It does not yet replace any spatial artefact.

## Projection convention

Plan-like views use the authored world convention directly:

```text
world +X east  → drawing right
world +Y north → drawing up
```

Because SVG Y increases downward, `createNorthUpPlanProjection(shellDepth)` reflects world Y about the shell depth. The successor structural view must use the same transform; the historical RH-C2 inversion therefore cannot recur accidentally.

Principal section `A–A` is drawn south-to-north: south at the left, north at the right, height upward.

## Graphic authority language

The language is deliberately smaller than a CAD standard.

| Meaning | Convention |
|---|---|
| controlled / represented geometry | strong solid line |
| provisional represented geometry | long dash |
| approximate geometry | short dash |
| numeric range | outer ranged extent + inner extent where the view owns both |
| qualitative / unresolved geometry | light dotted full-host or full-candidate-edge marker + explicit unresolved label |
| contextual derived geometry | light solid line |
| REVIEW | visible boxed banner and `data-compile-status="REVIEW"` |

Colour is not required to distinguish any authority state.

## Known relationship, unresolved position

A central restraint is now explicit:

> **Do not turn an unknown position into a plausible point.**

Where the compiler knows that an opening relationship belongs to a host boundary but does not own its centre, the successor view marks the **whole known host span** and labels the position unresolved. It does not place an opening glyph at the midpoint.

Likewise, where two spaces require a connection but the exact door/opening is unresolved, the successor view marks the whole candidate shared edge and labels the connection unresolved. The mark is a semantic obligation, not a doorway.

## Orientation and cross-view registration

- every plan-like successor shows a north arrow;
- the principal section identifier is frozen as `A–A`;
- plans show the `A–A` cut;
- the section will show `A–A`, `S` and `N` explicitly;
- section-callout direction is a drawing convention only and does not create architectural authority.

## Labels

Human architectural labels lead. Stable semantic IDs are secondary and remain present in `data-entity` attributes.

```text
Drawing room
G-DRAW-02
```

The compiler vocabulary therefore remains inspectable without becoming the visual hierarchy.

## Structural notation

A span **axis** is undirected unless the semantic model owns a direction. The shared symbol therefore has arrowheads at both ends. The one-headed historical RH-C2 glyph is not reused.

## Layout restraint

Successor spatial views reserve deterministic annotation space:

- right annotation zone: 3900 drawing units;
- bottom annotation zone: 2100 drawing units.

These are output-layout values, not building geometry. Their purpose is to make annotation clipping a construction error rather than a visual accident.

## Non-goals preserved

COA-03 does not author:

- wall faces or wall build-ups;
- exact internal door positions;
- stair strings, treads, guards, headroom or well geometry;
- exact service routes;
- structural member sizes or adequacy;
- performance or regulatory conclusions.

Planning values may be annotated in later views only at the precision already owned by the source.

## Implementation

Small downstream helpers live in:

- `compiler/output/svg.ts` — escaping, number formatting and primitive deterministic SVG strings;
- `compiler/output/projection.ts` — north-up plan and south-to-north section projections;
- `compiler/output/conventions.ts` — frozen graphic classes and compact symbols.

There is deliberately no scene graph, CAD object model or generic drawing framework.

**Next gate:** COA-04 — Reference House plan and section successor set.
