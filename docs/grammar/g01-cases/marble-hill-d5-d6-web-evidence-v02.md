# G-01 Marble Hill — D5/D6 Web-Evidence Pack v0.2

**Case:** G01-MHH  
**Status:** source-qualified web pass; D5/D6 not complete  
**Purpose:** upgrade the Marble Hill evidence actually inspectable on the public web, distinguish measured/current geometry from historical design evidence, and state exactly what can now enter D5/D6.

## 1. Source position

Marble Hill has unusually rich archival material, but the public web currently exposes that material unevenly.

The useful distinction is:

- **current/interpretive plan that can actually be inspected**;
- **historical design image that can actually be inspected**;
- **measured-drawing catalogue records whose images are currently unavailable**;
- **specialist secondary statements that give specific dimensions but are not themselves the raw survey.**

Do not collapse those into one evidence class.

## 2. Publicly inspectable sources

### MHH-W01 — English Heritage all-floor plan, November 2024

URL: https://www.english-heritage.org.uk/siteassets/home/visit/places-to-visit/marble-hill-house/history-and-stories/marble-hill-plans-2024.pdf

**Access:** W-I — inspectable PDF.  
**Authority:** English Heritage interpretive/current plan.  
**Useful for:**

- all-floor topology;
- current room names;
- Great Room / upper-Great-Room relationship;
- phase coding of fabric;
- location of lost service wing;
- metric orientation because a 0–10 m / 0–25 ft scale is printed.

The plan explicitly distinguishes fabric dated:

- 1724–9;
- 1739;
- 1740s;
- 1950;
- 1990s;

and notes walls demolished in 1909.

**Limit:** this is not a raw 1729 measured plan. It is a modern interpretive drawing of a building with later work and restoration history.

### MHH-W02 — English Heritage / Clews Architects restoration plans

URL: https://www.clewsarchitects.co.uk/english-heritage-visitor-improvement-projects.html

**Access:** W-I/W-R — inspectable web plan images.  
**Authority:** project survey/design information for the modern conservation project.  
**Useful for:**

- detailed surviving room/wall/opening geometry;
- opening IDs;
- current stair/door relationships;
- cross-checking the 2024 interpretive plan.

The public page exposes ground-, first- and second-floor plan images as part of the Marble Hill Revived project.

**Limit:** modern project geometry is high-value geometric evidence but is not automatically historical-phase evidence.

### MHH-W03 — Colen Campbell published design / early design image

English Heritage history image: https://www.english-heritage.org.uk/visit/places-to-visit/marble-hill/history-and-stories/history/

Public-domain copy: https://commons.wikimedia.org/wiki/File:MarbleHillHousePlans.JPG

**Access:** W-I.  
**Authority:** historical design/publication evidence, not a modern measured survey.  
**Useful for:**

- intended Palladian ordering;
- plan/elevation co-presentation;
- comparison between published/design intention and surviving geometry.

**Limit:** do not measure the as-built house from this plate without proving the relevant condition was executed as drawn.

### MHH-W04 — Michael Bidnell / Georgian Group, “Windows – Don’t Despair, Repair”, 2008

URL: https://ablakprofilok.hu/wp-content/uploads/2017/03/Michael_Bidnell_The-Georgian-Group_eloadas.pdf

**Access:** W-I — inspectable PDF.  
**Authority:** specialist secondary statement by the Georgian Group; not a raw measurement sheet.  
**Useful for:** a specific façade-module hypothesis.

Bidnell states that Marble Hill has classic **1–3–1** Palladian fenestration; that all windows are **40 in wide**; and that lateral and vertical spaces between windows are **40, 60, 80 or 120 in**.

Treat those values as **expert-stated / secondary metric evidence** pending direct survey corroboration.

### MHH-W05 — Historic England measured-drawing records

Examples:

- MP/MHH0016 — hand-tinted ground/first-floor measured plans, 1926;
- MP/MHH0116 — ground-floor publication measured drawing, 1962;
- MP/MHH0117 — first-floor publication measured drawing, 1962;
- MP/MHH0155 — plan/elevation of centre window of first-floor salon, 1964;
- PF/MHH — archive volume containing hundreds of measured drawings.

**Access:** W-L at present where the image itself is unavailable.  
**Authority:** A1 source universe.  
**Use now:** provenance and source map only where the scan cannot be inspected.

A measured-drawing catalogue record does not itself provide a dimension.

## 3. D5 — admitted metrics

### Existing direct metric

| Entity | Metric | Value | Evidence | Status |
|---|---|---:|---|---|
| MHH-1-GREAT | width | 24 ft | authoritative Historic England description / existing case record | DIRECT |
| MHH-1-GREAT | length | 24 ft | same | DIRECT |
| MHH-1-GREAT | height | 24 ft | same | DIRECT |

Derived:

- plan ratio = **1.000**;
- width:height = **1.000**;
- length:height = **1.000**.

### Newly admitted secondary façade metric

| Subject | Metric | Value | Evidence | Status |
|---|---|---:|---|---|
| principal-façade window family | nominal width | 40 in | MHH-W04, Georgian Group specialist statement | **EXPERT-STATED; corroboration desirable** |
| principal façade | spacing/module family | 40 / 60 / 80 / 120 in | MHH-W04 | **EXPERT-STATED; corroboration desirable** |
| principal façade | bay/opening rhythm | 1–3–1 | MHH-W04 + visually compatible with historical/current sources | **HIGH qualitative; exact coordinate extraction open** |

Do **not** upgrade the 40-inch module to A1 measured evidence merely because it is numerically precise.

## 4. D5 — what remains withheld

A Friends of Marble Hill architectural essay states that the rooms flanking the Great Room are “double cubes” and the two behind are “single cubes”. That is architecturally interesting but insufficiently sourced for the current quantitative table.

Therefore:

- retain the claim as a research lead;
- do not infer exact room dimensions from it;
- do not back-solve those rooms from the 24 ft Great Room.

Likewise, the 2024 plan has a scale bar, but no room widths are promoted from eyeballed screen measurements. If a value is extracted later, record the exact source image, pixel/scale method and uncertainty.

## 5. D5 result — a façade module can coexist with plural room geometry

Marble Hill now gives two different dimensional phenomena:

1. a **24 ft cubic dominant room**;
2. a reported **40 in façade opening module** with larger spaces expressed as multiples/half-multiples of that unit.

That suggests the grammar may contain several dimensional systems operating at different scopes:

```text
ROOM / VOLUME FAMILY
        ≠
FACADE / OPENING MODULE
```

A future rule should identify which scope the dimensional family owns rather than search for one master ratio governing the entire building.

This supports, but does not yet prove, the D5 move toward scope-aware proportional analysis.

## 6. D6 — phase-coded section is directly visible

The 2024 English Heritage plan shows:

- the Great Room on the first floor;
- the **upper part of the Great Room** occupying the corresponding second-floor position;
- surrounding second-floor rooms and gallery continuing around that void.

This is direct public evidence for:

> **first-floor room hierarchy changing the topology of the floor above.**

Record:

### MHH-CPL-02 — sectional privilege

- **scope_owner:** DWELLING / ROOM;
- **subject:** MHH-1-GREAT;
- **attribute:** vertical occupation / room rank;
- **plan signal:** dominant central principal room;
- **section signal:** 24 ft cubic/double-height volume;
- **upper-plan consequence:** second-floor void/upper-room absence;
- **direction:** MUTUAL between room identity and section;
- **confidence:** high.

This is stronger than an aesthetic statement about a tall room. It is a topological consequence across storeys.

## 7. D6 — design intent and as-built evidence must remain separate

Marble Hill is particularly useful because an early published design and modern measured/interpretive geometry can be compared.

The correct model is not:

```text
HISTORICAL PLATE = BUILDING
```

but:

```text
DESIGN / PUBLICATION INTENT
        ↕ compare
SURVIVING / MEASURED GEOMETRY
        ↕ phase reconcile
HISTORICAL INTERPRETATION
```

A grammar rule should not be promoted merely because it appears beautifully in Campbell’s published plate. The rule has to survive contact with the built case.

This distinction should be retained across G-01 whenever pattern books or publication drawings are compared with real buildings.

## 8. D6 — façade centre remains promising but not numerically closed

High-confidence evidence supports:

- five-bay north/south fronts;
- projecting and pedimented centre three;
- dominant central Great Room;
- 1–3–1 opening rhythm reported by the Georgian Group.

This strongly supports a shared **architectural centre** across room hierarchy and façade order.

What remains unproved in the current web pass is the exact coordinate relationship of:

- room centreline;
- centre-window centreline;
- flanking window centres;
- primary wall centres;
- stair axis.

Therefore MHH-CPL-01 remains **MUTUAL / broad-order high confidence; exact geometry open**.

## 9. New mutation precision

The original mutation “move one central principal-room/opening relation off the building’s dominant centre” was too vague.

Split it into two later tests:

### MHH-M01A — opening-only centre drift

Move the central opening set relative to the Great Room while holding the room and façade envelope fixed.

Tests:

- opening-to-room relation;
- 1–3–1 module;
- whether exact centring or bounded centring matters.

### MHH-M01B — sectional flattening

Retain the first-floor Great Room footprint and principal façade while inserting an ordinary second-floor floor plate through the upper part of the room.

Tests:

- whether hierarchy survives plan position alone;
- how much of Marble Hill’s principal-room identity is sectional;
- whether D6 correctly reports a sectional rather than plan failure.

Neither mutation is yet evaluated.

## 10. Current verdict

**D5:** materially improved but not complete.  
**D6:** source position materially improved; sectional coupling is high-confidence; exact opening-centre coupling remains open.

The next useful Marble Hill work is not another generic description. It is either:

1. direct high-resolution extraction from an inspectable measured sheet; or
2. controlled mutation once enough exact geometry exists to change one relation at a time.

Until then, retain the unknown rather than manufacture precision.
