<!-- nav-exclude: redirect -->
# ADE-04B — opening precision and uncertainty grammar

**Historical packet record. Current disposition:** ADE migration/generality is internally complete; [closeout and PLT physical-review handoff](architectural-drawing-engine-closeout.md). Earlier next/blocked statements below describe this packet’s historical gate.

Status: screen-reviewed capability grammar; exact paper-space treatment remains provisional pending ADE-06 physical atlas.

Parent: ADE #812  
Issue: #832  
Depends on: ADE-04A / #831

## Problem

The PLT-03 ground-plan candidate used dashed marks close to opening jambs to communicate incomplete source authority. Although epistemically motivated, those marks could be read as hidden construction, duplicate jambs or renderer residue. The drawing became less trustworthy precisely where it was attempting to be more honest.

ADE-04B therefore separates **physical absence of wall material** from **notation about what is not yet known**.

## Governing rule

> Architectural geometry and epistemic notation are different mark classes.

Uncertainty notation must remain outside represented wall matter. It must not create a plausible aperture, pseudo-jamb or construction line that the architectural source does not own.

## Accepted authority states

| Source state | Physical wall response | Epistemic response |
| --- | --- | --- |
| exact centre + exact width | exact admitted aperture | none |
| exact/approximate centre + approximate width | admitted nominal aperture | external nominal span with `≈` value |
| known centre + width range | guaranteed minimum aperture | external maximum span plus minimum limit ticks |
| known centre + unknown/qualitative width | no aperture | external point marker at known centre |
| unknown/qualitative position | no aperture | external host-span obligation bracket |
| ranged position | no representation yet | rejected until a dedicated notation is earned |

For a ranged width, ADE-04A/ADE-04B deliberately separate what is certain from what is possible: the wall is removed only across the guaranteed minimum opening; the remaining width authority is notation, not material geometry.

## Geometry / notation boundary

The compiler computes which physical face lies on the selected annotation side. Paper-space notation is offset beyond that face by a constant paper gap. A face-referenced wall therefore does not treat its reference line as though it were automatically the outside edge on both sides.

This rule is important at 1:50: an epistemic leader is mechanically prevented from tunnelling through a 400 mm represented wall body simply because the wall reference line lies on the opposite face.

## Exact-size capability proof

The proof atlas is A2 landscape at true 1:100 and true 1:50 and compares five source states on:

- a monolithic wall control; and
- the accepted layered cavity-wall family.

Machine gates require:

- no fit scaling;
- identical physical-paper tokens between scales;
- unique drawing entity IDs;
- no dashed epistemic primitive;
- explicit authority-state metadata on every epistemic mark;
- no uncertainty notation on exact openings;
- no physical aperture for centre-only or host-only authority;
- constant paper-space tick size between scales;
- conventional 2× model-space span growth from 1:100 to 1:50.

## Screen verdict

### Exact

**KEEP.** No uncertainty decoration is the correct result. Source certainty should disappear into ordinary architectural drawing rather than announce itself.

### Approximate width

**KEEP / ADVANCE.** The external span is immediately legible as annotation associated with the opening and is no longer confusable with a jamb. The `≈` value is useful and restrained.

### Width range

**KEEP / ADVANCE.** The minimum physical aperture plus external maximum span/minimum ticks cleanly distinguishes guaranteed material absence from permitted uncertainty. This is materially better than multiple dashed jamb candidates.

### Known centre / unknown width

**ADVANCE CONCEPT; REVISE IN ADE-06 IF NEEDED.** A point marker is truthful because only a point is owned. The current diamond + explanatory label is legible but slightly didactic. ADE-06 must test whether the label can be quieter or shorter without turning the symbol cryptic.

### Host-only occurrence

**ADVANCE CONCEPT; REVISE IN ADE-06 IF NEEDED.** A full host-span bracket correctly refuses to invent a centre. It is visually more dimension-like and text-dependent than the stronger states. That is acceptable for a capability proof but not yet frozen publication grammar.

## Rejected language

The following are rejected for the mature plan:

- dashed candidate jambs inside or immediately across wall material;
- duplicated opening edges whose distinction exists only in dash pattern;
- a plausible aperture for unknown width;
- a midpoint marker for host-only / relationship-only occurrence;
- host-wide phantom wall lines;
- uncertainty styling that changes wall topology rather than annotating it.

## Freeze boundary

ADE-04B freezes the **semantic-to-graphic mapping**, not the final exact graphic tokens.

Frozen now:

- uncertainty is external to material;
- exact state has no epistemic mark;
- approximate/range/centre-only/host-only states remain distinct;
- unresolved authority cannot become physical aperture;
- no dashed pseudo-jamb grammar.

Deferred to ADE-06 physical review:

- exact gap from wall;
- tick and point-marker size;
- whether centre-only uses the current diamond or a quieter equivalent;
- wording / necessity of explanatory labels;
- tonal hierarchy of epistemic marks in a complete architectural plate;
- any scale-profile simplification between BOOK 1:100 and WALL 1:50.

## Consequence for PLT-03

The phantom dashed opening marks visible in the previous PLT ground plan are not candidates for retention. ADE-07 must rebuild the Reference House openings from ADE-04A material subtraction plus this authority grammar, using only current source-owned opening facts.
