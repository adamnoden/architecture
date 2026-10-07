# G-01 Trial Case Records

**Status:** D3 semantic annotation set v0.1; D5/D6 urban supplement added  
**Purpose:** hold precedent annotations as scalable case records rather than embedding growing building studies inside the annotation-schema document.

All D3 cases use the same contract defined in [G-01 Precedent Annotation Schema](../g01-annotation-schema.md).

Current D5/D6 control: [G-01 D5 / D6 Web-Evidence Pass v0.2](../g01-d5-d6-web-pass-v02.md).

## D3 trial set

| Case | Morphology | Evidence position | D3 semantic status | Current role |
|---|---|---|---|---|
| [Marble Hill House](marble-hill-house.md) | compact freestanding Palladian villa | A1 measured source universe + phase-coded public plan | **COMPLETE v0.1** | canonical compact-villa metric/coupling case; expand D5/D6 |
| [Danson House](danson-house.md) | compact later-Georgian/neo-Palladian villa | A2 fabric research + near-contemporary plan | **COMPLETE v0.1** | proportion + construction/coupling case; extend openings/bays |
| [76 Dean Street](76-dean-street.md) | urban double-pile terrace | authoritative descriptive record + located historic survey plans | **COMPLETE v0.1 WITH UNKNOWNS** | early-Georgian urban counterexample; qualitative/topological unless web metric evidence improves |

## D5/D6 supplementary case

| Case | Morphology | Evidence position | Status | Why added |
|---|---|---|---|---|
| [Bedford Square urban family](bedford-square.md) | later-Georgian planned square / terrace houses | public-domain measured plans + direct parcel dimensions + block-composition evidence | **WEB-SOURCE PASS v0.1** | supplies inspectable urban measurement and exposes row/block-level coupling across individual dwelling boundaries |

Bedford Square does **not** replace Dean Street. The cases have deliberately different jobs. Dean Street prevents villa-derived rules becoming universal; Bedford Square carries urban metric evidence and tests architectural order above the individual-house scale.

## Web-only evidence boundary

For the present D5/D6 phase, publicly inspectable web material is the hard evidence boundary.

A catalogue record proving that a measured drawing exists does not authorise measurement when the drawing itself is unavailable. Such a source may remain in the acquisition register, but metric values stay `UNKNOWN`.

This rule is recorded in the [D5/D6 Web-Evidence Pass](../g01-d5-d6-web-pass-v02.md).

## What “D3 complete” means

It means each D3 trial building has been passed through the same semantic questions:

- source and phase register;
- case identity;
- morphology;
- stable space IDs;
- spatial topology;
- hierarchy;
- ordering;
- metric fields;
- vertical grammar;
- elevation;
- plan/elevation coupling;
- section/plan coupling;
- structural reading;
- service/occupation reading;
- social-history warning;
- Long-Life House translation note;
- candidate observations;
- alterations;
- uncertainties.

A field may legitimately be **UNKNOWN**.

D3 completion does **not** mean:

- every room has been measured;
- every original doorway is known;
- the building has been reduced to a clean graph;
- a grammar rule has been proved;
- source disagreements have been erased.

Those tasks belong to D4–D9.

## Why case records are separate

The annotation schema is a contract.

A case record is data produced under that contract.

Keeping them separate prevents two forms of drift:

1. the schema becoming an unreadable scrapbook of precedents;
2. precedent-specific quirks silently redefining the general annotation method.

When a case exposes a genuinely general missing concept, the schema may be revised explicitly and versioned.

Bedford Square has now exposed one such general modelling correction for D6: a coupling relation needs **scope/owner** as well as attribute and direction, because architectural order can operate at component, room, dwelling, row/block or urban scale.

## D3 result in one sentence

> **The same semantic method can describe a canonical compact villa, a different compact villa organised by circulation sequence, and a constrained urban townhouse without forcing them into one plan type or inventing missing evidence.**

The supplementary Bedford Square work then asks whether the model can also describe a house whose exterior order participates in a larger terrace composition.

Current research questions:

- D4 — what topological patterns actually compare?
- D5 — what dimensional/proportional relationships survive measurement at room, dwelling and urban-module scale?
- D6 — how do plan, section and elevation negotiate, and at what architectural scope?
