# Compiler Generality Assurance — CF-01 Contrast Fixture Gate

**Status:** **PASS — two-fixture bounded generality established for the plan-semantic slice**  
**Date:** 2026-10-13  
**Upstream:** [`reference-house-executable-slice.md`](reference-house-executable-slice.md)  
**Reference fixture:** [`../reference-house/model-baseline-rhc0.md`](../reference-house/model-baseline-rhc0.md)  
**Implementation:** `compiler/plan-slice/`, `compiler/reference-house/plan-adapter.ts`, `compiler/cf01/`

## Result

CF-01 passed.

RH-C1 proved that one frozen Reference House could be encoded once, mutated coherently and projected deterministically. CF-01 then challenged the implementation with a deliberately unlike but small domestic fixture rather than assuming those abstractions were general.

The contrast fixture is:

- single-storey;
- asymmetric in plan;
- without a courtyard or other internal void;
- without a stair;
- without a regular bay field or entrance-bay membership;
- driven by irregular opening coordinates on semantic host boundaries;
- neutral with respect to G-01 grammar.

It uses the same extracted plan-semantic compiler as the Reference House. The shared compiler knows about levels, named planning lines, spaces, optional voids, boundaries, openings, required adjacency, plan closure and deterministic plan projection. It does **not** know that the Reference House has a centred courtyard, two storeys, a four-bay front, a particular stair, G-01-derived opening composition, the RH wall-planning stress model or the RH roof relation.

The executable result is:

```text
P0                         17 / 17 PASS
PAT-XW-01                   6 /  6 PASS
RH-C1                      27 / 27 PASS
CF-01                       7 /  7 PASS
repository / publication          PASS
documentation build               PASS
```

This is **two-fixture bounded evidence**, not proof of arbitrary architectural validity.

---

## What the contrast fixture exposed

The RH-C1 code had several real Reference-House-shaped assumptions. They were acceptable while C1 was intentionally a one-fixture slice, but they could not remain hidden in the shared plan machinery.

### 1. Fixed two-storey iteration

RH-C1 integrity checking iterated explicitly over `GROUND` and `FIRST`.

**CF-01 correction:** the shared plan compiler now consumes an authored level collection and performs overlap and plate-closure checks over whatever levels are present. The Reference House adapter supplies its two levels; the contrast fixture supplies one.

### 2. Mandatory centred courtyard

RH-C1 plan derivation assumed a centred courtyard existed and used it directly for exclusion and enclosed-plate calculations.

**CF-01 correction:** the shared plan source has optional plan voids. Plate area is shell area minus the authored void regions on that level. The Reference House adapter represents its courtyard as a void; the contrast fixture has none. Courtyard centring remains Reference House logic.

### 3. Bay-derived numeric openings

RH-C1 derived front openings from one regular centred bay field and required an entrance-bay membership.

**CF-01 correction:** the shared opening mechanism accepts semantic host boundaries with neutral coordinates, boundary-centred placement or qualitative-only placement. The Reference House adapter resolves its bay memberships to coordinates while retaining their project semantic kind. The contrast fixture authors irregular host coordinates directly.

### 4. Mandatory stair and Reference House section machinery

The RH-C1 source necessarily contains stair, wall-planning and roof facts because those are part of the frozen fixture and principal section.

**CF-01 correction:** none of those concepts is required by the shared plan compiler. They remain in `compiler/reference-house/` and continue to be tested there. A one-storey fixture can therefore compile without fake stair or section data.

### 5. Reference-House-owned units

Millimetre, square-millimetre and degree types were housed under `compiler/reference-house/` even though they are not Reference-House concepts.

**CF-01 correction:** those unit primitives now live at `compiler/units.ts`. The previous Reference House import path is retained as a compatibility re-export.

These are deliberately modest generalisations. CF-01 did not invent a universal building schema merely to make the second fixture fit.

---

## Shared plan-semantic kernel

The extracted `compiler/plan-slice/` layer owns only mechanisms justified by both worked cases or by an independently useful semantic need:

- arbitrary string level identity plus level datum;
- named orthogonal planning lines;
- spaces as unions of rectangles resolved from those lines;
- optional excluded plan regions / voids;
- line boundaries with semantic host identity;
- opening families and authority-aware dimensions;
- opening placement by host coordinate, host centre or qualitative relation;
- semantic opening-to-space ownership;
- required adjacency;
- shell containment, non-overlap, void exclusion and per-level plate closure;
- deterministic diagnostic ordering;
- deterministic semantic SVG plan projection.

The Reference House continues to own its own adapter and project-specific derivations. There is no branch on fixture identity in the shared compiler.

---

## Deliberate supported-domain restrictions

CF-01 does not erase every limitation in RH-C1. It makes the remaining limits explicit.

The current shared plan slice is intentionally restricted to:

- a rectangular outer shell in a 2D orthogonal coordinate system;
- spaces and voids represented as unions of axis-aligned rectangles;
- boundaries represented as horizontal or vertical line segments;
- numeric openings hosted by those line boundaries;
- simple per-level area closure rather than arbitrary polygon topology;
- architectural plan relationships only.

It does **not** yet support arbitrary polygons, curved or angled walls, split-level volumetric modelling, non-line opening hosts, structure, services, detailed envelope physics, products, regulatory compliance or general BIM/IFC semantics.

Those are not defects CF-01 needs to conceal. They are the current supported domain. The compiler must continue to refuse or leave unsupported work outside it rather than guessing.

---

## Pass conditions

| # | Condition | Result |
|---|---|---|
| 1 | Reference House and contrast fixture use the same core semantic mechanisms | **PASS** — both run through `compilePlanSlice()` |
| 2 | no fixture-ID branching rescues either house | **PASS** — shared plan code contains no fixture identity branch |
| 3 | Reference-House-specific courtyard, four-bay, stair and grammar facts remain local | **PASS** — these stay in the RH source/adapter or are absent from the contrast source |
| 4 | shared integrity invariants remain meaningful on both fixtures | **PASS** — containment, overlap, closure, adjacency and opening-host checks execute on both |
| 5 | deterministic calculations and relevant drawings regenerate from each source | **PASS** — RH production drawings remain deterministic; the contrast semantic plan projection is deeply deterministic |
| 6 | RH-C1 mutation suite still passes | **PASS — 27/27** |
| 7 | at least one accidental assumption is removed, localised or declared restricted | **PASS** — fixed levels, mandatory court and bay/entrance assumptions were removed from the shared layer |
| 8 | new abstractions are justified rather than speculative | **PASS** — extraction is limited to mechanisms exercised by both fixtures; RH-only concepts remain local |
| 9 | compiler fails closed where the fixture violates the supported domain/invariants | **PASS** — opening-host escape and missing plate closure produce `FAIL` rather than repair |
| 10 | result is described as bounded evidence, not universal validity | **PASS** — this document and programme status retain that boundary explicitly |

---

## What CF-01 does not prove

Two fixtures do not make a universal house compiler.

CF-01 gives materially stronger evidence for a narrower claim: the reusable plan-semantic mechanisms are no longer contingent on the Reference House having exactly two storeys, a centred courtyard, a regular four-bay front, entrance-bay membership or a stair.

The Reference House remains the project's principal controlled regression fixture. The contrast house is an adversarial test fixture, not a second design proposal and not a second architectural authority.

Representability still does not establish structural, environmental, fire, regulatory or construction adequacy.

---

## Programme position

```text
RH-C0  model freeze                              PASS
   ↓
RH-C1  deterministic Reference House             PASS
   ↓
CF-01  adversarial contrast / generality gate    PASS
   ↓
RH-C2  bounded structural view                   NEXT
   ↓
RH-C3  service view
   ↓
RH-C4  envelope / boundary view
   ↓
RH-C5  selected target calculations
```

CF-01 removes the sequencing block on RH-C2. It does not begin RH-C2 and does not raise the computational track to a new maturity level by itself.

The governing distinction remains:

> **Reference House reproduction proves fixture fidelity. Mutations test dependency correctness. The contrast fixture supplies bounded evidence that the shared plan mechanisms do not only describe that house.**
