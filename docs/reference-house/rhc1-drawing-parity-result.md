# RH-C1 — Deterministic Drawing Parity Result

**Status:** PASS at the bounded RH-C1 fixture scope  
**Authority:** [`model-baseline-rhc0.md`](model-baseline-rhc0.md)  
**Executable slice:** `compiler/reference-house/`  
**Generated outputs:** [`rhc1-ground-floor.svg`](rhc1-ground-floor.svg), [`rhc1-first-floor.svg`](rhc1-first-floor.svg), [`rhc1-principal-section.svg`](rhc1-principal-section.svg)

RH-C1 does not promote drawings to architectural source authority. The three SVGs are deterministic projections of the compiled Reference House semantic result. Editing them cannot change the house; regeneration replaces manual changes.

## Result

The generated plan/section set reproduces the RH-C0-controlled architecture strongly enough to replace the three RH-C0 hand-authored plan/section comparators as the current C1 projections.

Parity is semantic, not pixel matching. The comparators were inspected only as cross-view references. No SVG path or pixel coordinate was used as source geometry.

| Controlled relationship | Generated result | Parity |
|---|---|---|
| outer shell | 12,000 × 10,800 mm, one stable `SHELL-01` identity | PASS |
| centred courtyard | `C-01`, 3,600 × 4,000 mm, derived edges X=4,200/7,800 and Y=3,400/7,400 | PASS |
| enclosed plate | 115.2 m²/storey from shell minus court | PASS |
| ground room topology | all eight RH-C0 reservations generated from named planning lines | PASS |
| first-floor topology | four bedrooms, east gallery/bath, north landing and dry dressing/linen field; no `U-ENS-01` | PASS |
| RH-03 hall correction | provisional hall boundary remains X≈4,000; it does not snap to court/support line X=4,200 | PASS |
| front field | four axes derive at 1,950 / 4,650 / 7,350 / 10,050 mm | PASS |
| entrance | bay-3 membership authored once; centre derives at X=7,350 mm | PASS |
| opening hosts | front and centred N/S court openings retain boundary and room-host identity | PASS |
| east/west court openings | qualitative relationships retained; no numeric centres generated | PASS |
| north-centre upper garden host correction | qualitative relationship remains owned by `U-DRESS-01`, not `U-LAND-N01`; optional garden numeric field is not invented | PASS |
| vertical datums | ±0 / +2,950 / +3,300 / +6,000 and provisional +6,250 control derive into the section | PASS |
| stair arithmetic | 18 rises, 6/6/6 groups, 280 mm going, 183.333 mm rise, +1,100/+2,200 landing datums | PASS |
| stair construction absence | no strings, guards, tread construction, headroom proof or exact well geometry generated | PASS |
| wall construction absence | semantic boundary strokes are drawing convention only; no wall-face thickness is generated | PASS |
| wall stress view | 400–425 mm family / 450 mm stress remain calculation inputs, not plan geometry | PASS |
| roof family | principal section stays low-slope and outward-draining; no pitched-roof regression | PASS |
| technical proof boundary | no structural, MEP, fire, thermal or regulatory adequacy is inferred by drawing generation | PASS |

## Deliberate non-copies from the RH-C0 comparators

The generated drawings are intentionally not tracing replacements.

- The RH-C0 plan comparators showed a schematic stair-reservation box. RH-C1 does not place one because the source freezes the 2.4–2.5 m planning requirement but not a finished well/string geometry.
- The RH-C0 plan comparators showed the provisional garden three-axis field. The baseline explicitly makes that field optional for the three C1 production views. RH-C1 retains the corrected upper central host relationship qualitatively but does not invent a numeric garden opening model merely to reproduce comparator marks.
- The RH-C0 section used diagrammatic mass to communicate floor/roof zones. RH-C1 instead separates occupied volumes, datums and roof screening lines so a 350 mm datum gap is not mistaken for a proven floor build-up.
- Opening ranges remain ranges. The renderer does not choose a hidden midpoint to obtain one convenient line length.

These differences reduce false authority rather than losing controlled architecture.

## Determinism and mutation result

The RH-C1 executable suite contains 27 tests across semantic derivation, mutation behaviour and drawing projection.

The drawing tests establish that:

- every plan space, boundary and numeric opening carries stable `data-entity` identity;
- the same derived front axes drive semantic output and SVG placement;
- opening-width mutation changes the occurrence without moving its bay centre;
- level mutation moves the section datum and derived stair landings together;
- a `REVIEW` compile can be projected only with the review state visible;
- a `FAIL` compile cannot produce drawings;
- regenerated SVG strings are byte-for-byte identical for unchanged source;
- the committed SVG files are exact outputs of the renderer.

The wider RH-C0 mutation map also remains executable: M1–M6 and M8/M9 propagate only through owned dependencies, M5 fails source integrity, M2b raises the recorded stair-fit review, and M7/M10 remain absent because their facts are outside RH-C1.

## Drawing authority after RH-C1

| Drawing | Post-RH-C1 classification |
|---|---|
| `rhc1-ground-floor.svg` | **CURRENT GENERATED PROJECTION — ground plan** |
| `rhc1-first-floor.svg` | **CURRENT GENERATED PROJECTION — first-floor plan** |
| `rhc1-principal-section.svg` | **CURRENT GENERATED PROJECTION — principal section** |
| `rhc0-ground-floor-comparator.svg` | **HISTORICAL RH-C0 COMPARATOR / PROVENANCE** |
| `rhc0-first-floor-comparator.svg` | **HISTORICAL RH-C0 COMPARATOR / PROVENANCE** |
| `rhc0-principal-section-comparator.svg` | **HISTORICAL RH-C0 COMPARATOR / PROVENANCE** |

The generated set still does not outrank `model-baseline-rhc0.md`. It is simply the first plan/section set for which geometry is regenerated from the canonical semantic source rather than maintained by hand.

## RH-C1 gate consequence

At this slice, the Reference House is encoded once, deterministic consequences are derived, provisional facts remain marked, out-of-scope facts remain absent, the mutation map behaves as predicted and the three required drawings regenerate from the same model.

That establishes **fixture fidelity + dependency correctness for one controlled house**.

It does not establish bounded generality. The next gate remains **CF-01**, whose purpose is to attack accidental Reference-House assumptions before RH-C2 expands the compiler into structure.
