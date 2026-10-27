<!-- nav-exclude: redirect -->
# ADE-03B — cavity-wall graphic grammar verdict

**Historical packet record. Current disposition:** ADE migration/generality is internally complete; [closeout and PLT physical-review handoff](architectural-drawing-engine-closeout.md). Earlier next/blocked statements below describe this packet’s historical gate.

**Programme:** ADE — Architectural Drawing Engine capability uplift  
**Parent:** #812 / #816  
**Packet:** #828  
**Candidate:** PR #830  
**Purpose:** select a whole-building cavity-wall representation before Reference House migration

## Decision

**Advance a quiet layered wall grammar with restrained inner-leaf emphasis.**

Do not return to the single joined-body wall as the final PLT language at 1:50.

The selected concept is:

```text
weathering masonry leaf — light cut tint
cavity / insulated zone — paper-white void
substantial inner masonry leaf — slightly stronger cut tint
internal finish zone — semantically retained, visually merged with inner leaf at whole-building scale
```

The exact grey/tint values are **not frozen** by ADE-03B. ADE-06 physical capability proof must confirm that the hierarchy survives ordinary black-only print without becoming muddy, decorative or construction-document-like.

## Controlled comparison

The proof used identical source-owned geometry in three representations:

1. **BODY CONTROL** — one joined wall body;
2. **LAYERED QUIET** — leaf / void / leaf with equal light leaf tint;
3. **STRUCTURAL EMPHASIS** — the same layered geometry, with only the substantial inner leaf / finish zone given slightly greater tonal weight.

Synthetic proof values were explicitly representative of the RH-10 coordination family:

- weathering leaf: 102.5 mm;
- cavity: 160 mm, inside the 150–175 mm class;
- structural inner leaf: 140 mm;
- finish/tolerance zone: 15 mm;
- represented total: 417.5 mm, inside the 410–435 mm coordination family.

These values are a representation proof, not a construction specification.

## Renderer defect exposed and corrected

The first ADE-03B proof revealed that v2 paths carrying both fill and outline inherited the frozen v1 fill class `stroke:none`, which suppressed the intended overall wall profile.

The correction remains confined to `publication-drawing-v2`:

- frozen v1 output remains byte-identical;
- v2 appends path-only stroke override CSS only when a new path explicitly requests both fill and outline;
- legacy v1 primitive scenes still serialize byte-for-byte identically through v2;
- path fill and outline now compose correctly.

This was a useful capability-level catch that would have been much harder to diagnose inside the full house plan.

## Aesthetic verdict by grammar

### BODY CONTROL — reject as final 1:50 wall language

**Correct but under-informative.**

It is calm and robust, but it repeats the key weakness of the previous PLT drawing: a real layered masonry wall reads as one generic slab. At 1:50 the omission is visible enough to make the drawing feel schematic rather than resolved.

Retain BODY only as:

- a control;
- a possible simplification fallback if a much smaller scale later earns it;
- a representation for genuinely monolithic/unresolved wall assemblies.

### LAYERED QUIET — keep

**Strong aesthetic baseline.**

The paper-white cavity is enough to make the wall read as an assembly rather than a solid bar. No hatch or material symbol is required. Corners remain continuous and calm because the layers inherit ADE-02 topology.

The grammar materially improves close-reading reward without making the drawing look like a construction document.

### STRUCTURAL EMPHASIS — revise, then advance

The first version used too much tonal separation and began to read as a diagram of structural importance rather than a quiet architectural plan.

The revised proof narrows the tint difference substantially (`faint` versus a much closer `context` tint). On screen:

- at ordinary viewing distance it remains effectively the same calm layered wall as LAYERED QUIET;
- under closer inspection the substantial inner masonry leaf becomes just perceptibly more legible;
- the cavity remains the primary assembly separator;
- no extra linework, hatch or symbol is introduced.

**This revised concept is the preferred candidate for physical proof.**

## Scale verdict

### 1:100

The layered family remains legible without obvious congestion. The cavity is fine but real; the wall no longer collapses into a generic body.

The restrained inner-leaf hierarchy remains subtle enough that it does not overpower room geometry.

**Advance layered representation at 1:100 to ADE-06 physical proof.**

Do not yet freeze whether every 1:100 publication view should expose all layers; that remains a representation-profile decision based on the whole plate, not this isolated wall specimen.

### 1:50

The layered grammar clearly earns its additional information. The 417.5 mm wall occupies enough paper width that:

- outer leaf;
- actual cavity void;
- substantial inner leaf

can all read without decorative graphics.

The revised inner-leaf emphasis rewards close scrutiny and directly answers one of the PLT-03 review failures: the loadbearing comparator no longer disappears inside a generic grey band.

**Advance the revised layered/structural grammar as the default ADE-07 WALL candidate.**

## Why no cavity hatch

The proof intentionally rejects conventional-looking graphic additions unless they solve a real reader problem.

No:

- brick hatch;
- insulation squiggle;
- cavity tie symbols;
- material texture;
- DPC marks;
- lintels;
- frame positions;
- technical closure details

are necessary to communicate the owned whole-building fact.

The cavity is represented by **actual geometric absence** between two source-owned leaves. That is both more truthful and more consistent with the Ovid's House aesthetic than decorative construction shorthand.

## Finish-zone decision

The 15 mm finish/tolerance zone remains semantically separate in ADE so later detail views can use it correctly.

At whole-building 1:100 / 1:50 plan scale it does **not** receive its own strong line or tint. Doing so would create a false impression of technical resolution and an unnecessary fourth visible band.

It visually merges with the inner masonry leaf in this profile.

## Physical-proof boundary

ADE-03B is a screen/vector grammar decision, not the final print freeze.

ADE-06 must verify:

- pale leaf tints remain stable on ordinary high-quality black-only print;
- the revised inner-leaf distinction is perceptible at close reading but does not become a dark structural stripe;
- the cavity remains clean and does not fill-in or disappear;
- 1:100 remains sufficiently quiet in the context of dimensions, openings, partitions and room labels;
- 1:50 retains the intended monograph quality.

If tonal hierarchy is unreliable in print, retain the geometry and revise only the physical graphic treatment; do not retreat to a simulated solid wall merely because a particular grey value fails.

## Handoff

ADE-03 has now established:

1. joined wall topology;
2. source-owned ordered wall layers;
3. continuous layer-band geometry;
4. an accepted whole-building cavity-wall representation concept.

The next major defect class is openings and uncertainty.

**Next authorised packet: ADE-04 / #817 — opening subtraction + uncertainty grammar.**
