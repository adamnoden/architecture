<!-- nav-exclude: redirect -->
# ADE-02 — wall topology / join compiler verdict

**Programme:** ADE — Architectural Drawing Engine capability uplift  
**Parent:** #812  
**Packet:** #815  
**Candidate:** PR #826  
**Purpose:** prove joined wall topology before any cavity/opening/partition grammar enters Ovid’s House

## Decision

**KEEP.**

The direct-primitives PLT plan assembled walls as independent rectangles. ADE-02 replaces that representation seam with a model-space orthogonal wall-network compiler whose output is a joined material region.

The accepted conceptual rule is:

> **A semantic wall network becomes a continuous region before graphic styling is applied.**

A wall corner is therefore no longer the accidental overlap of two rectangles, and a courtyard ring is no longer four rectangles whose individual edges can leak into the plate.

## Proved capabilities

Exact synthetic micro-fixtures cover:

- C01 straight run;
- C02 L corner;
- C03 T junction;
- C04 cross junction;
- C05 closed centreline wall ring with inner hole;
- C06 face-aligned perimeter ring;
- differing wall thicknesses meeting at an authored node;
- disconnected wall networks remaining separate regions;
- ranged wall thickness accepted only through an explicit value inside source authority.

The compiler deliberately rejects non-orthogonal wall runs. No current Reference House plan requirement earns a general angled/curved offset kernel yet.

## Low-level backend extension

ADE-02 adds one new terminal vector primitive: `DrawingPath`.

It carries one or more closed paper-space rings and renders using SVG's even-odd fill rule. This is the minimum extension required for a continuous region containing a hole.

This is **not** a change of backend architecture:

- `DrawingScene` remains the terminal paper-space IR;
- SVG remains the renderer;
- line/text/rect primitives remain valid;
- the path primitive contains no architectural intelligence;
- wall topology remains upstream in ADE.

## Why the join defect is actually solved

The previous PLT wall corner could expose:

- rectangle end caps;
- duplicate outlines;
- seams where two bodies met;
- small gaps or overdraw dependent on styling.

ADE-02 instead:

1. derives a strip from each authored wall run and its resolved source-admissible thickness;
2. adds material continuity only at a shared semantic wall node;
3. unions the resulting rectilinear material cells;
4. traces only the external boundary of that union;
5. emits one joined path per connected wall network.

No internal rectangle boundary survives into `DrawingScene`, so later token changes cannot accidentally reveal it.

## Exact-size scale proof

The capability sheets are exact A2 landscape at:

- 1:100;
- 1:50.

Machine proof confirms:

- no fit scaling;
- identical physical graphic-token CSS at both scales;
- every capability's architectural geometry doubles exactly from 1:100 to 1:50;
- each connected network is one path;
- C05/C06 encode outer boundary + inner hole as two rings inside that one path.

## Screen review

### 1:100

The topology reads as a deliberately simplified whole-building wall convention. Corners are calm and unambiguous. L/T/cross junctions do not expose construction seams. Closed rings read as rings rather than four assembled bars.

### 1:50

The same grammar remains clean at the larger architectural scale. The extra physical size does not reveal hidden caps, seams or border artefacts. This is especially important because PLT-03's prior corner defects became objectionable only under closer / larger-scale inspection.

### Aesthetic verdict

**PASS for topology.**

The fixtures are intentionally not yet beautiful architectural walls; they are generic material bodies. But their geometry is quiet, continuous and visually inevitable. ADE-03 can now add owned assembly structure without first fighting broken joins.

## Limits deliberately retained

ADE-02 does not solve:

- cavity-wall layer representation;
- loadbearing versus weathering leaf hierarchy;
- opening subtraction;
- opening uncertainty;
- partitions;
- doors;
- technical junction detail;
- arbitrary angled/curved topology.

Those omissions are correct packet boundaries, not deficits to hide in this compiler.

## Handoff

The wall topology capability is accepted as the substrate for:

- ADE-03 / #816 — coordination-level wall assembly / cavity-wall grammar;
- ADE-04 / #817 — opening subtraction + uncertainty grammar.

**Next authorised packet after clean merge: ADE-03.**
