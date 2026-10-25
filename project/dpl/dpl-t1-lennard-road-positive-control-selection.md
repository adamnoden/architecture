# DPL-T1 — 41 Lennard Road positive-control selection

**Parent gate:** #700 — DPL-T  
**Baseline main:** `59622075cf67e0bd7592480864ad37b5ef177817`  
**Date:** 2026-10-25  
**Selected control:** `DPL-T-CONTROL-004`  
**State:** `CONTROLLED_SCREENING_GEOMETRY_DOES_NOT_DISPROVE_PLACEMENT`

## Selection

Select:

```text
41 Lennard Road, Bromley, BR2 8LN
planning ref: 26/02618/FPA
control id: DPL-T-CONTROL-004
```

The planning proposition is the intended experimental typology: demolition of an existing bungalow and construction of one detached house on the ordinary Lennard Road frontage, with driveway alterations. It is not backland or garage-court development.

## Why this candidate survived the geometry-first gate

The address/planning identity is tied to BNG coordinate `542903,166217`. The Open UPRN point for `100020404537` transforms to within approximately `0.036 m` of that exact planning coordinate.

Planning Data then returns exactly one HM Land Registry `title-boundary` entity for that UPRN:

```text
entity       = 12057071807
reference    = 57071807
quality      = authoritative
area         = 783.6969 m²
min envelope = 13.5235 m × 67.1018 m
```

The unchanged Reference House footprint remains:

```text
12.0 m × 10.8 m
```

The parcel width therefore exceeds the RH theoretical minimum projection width by approximately `2.7235 m`.

More importantly, a constructive rigid-placement witness exists inside the exact controlled SCREENING polygon. A full `12.0 m × 10.8 m` rectangle aligned to the parcel long-axis frame is contained by the polygon with approximately `1.232 m` minimum boundary clearance in the tested witness position.

Therefore:

```text
CONTROLLED_SCREENING_GEOMETRY_DOES_NOT_DISPROVE_PLACEMENT
```

This is stronger than the Chesterfield result in the only way DPL-T asks at this stage: controlled parcel geometry does not eliminate the unchanged Reference House before downstream evidence work begins.

## Bounded shortlist disposition

- `41 Lennard Road` — **SELECT** after positive constructive geometry preflight.
- `4 Ninhams Wood` — held; no need to spend further acquisition effort once Lennard earned selection.
- `The Vicarage, 1B St James Road` — held; clean replacement typology but not needed after Lennard passed.
- `15 Fairholme Gardens` — held; clean replacement typology but not needed after Lennard passed.
- `The Bungalow, Routh Road` — held; clean replacement typology but not needed after Lennard passed.
- `17 Tower Terrace` — rejected before geometry because earlier Haringey history establishes garages/portacabins and rear-garden dwelling proposals; it is not the clean street-front replacement experiment.

No scalar ranking was used.

## Authority boundary

The HMLR/Planning Data polygon is an authoritative index polygon showing indicative registered-property position/extent. It is not a determined legal-title boundary.

The constructive rectangle is a geometry witness only. It is **not** yet the authored DPL deployment candidate and must not be interpreted as a planning proposal, setback decision, access solution or optimisation result.

## Exact next work

Now, and only now, acquire the downstream evidence needed for full R1–R6 admission:

1. authoritative datum/topography for 41 Lennard Road;
2. controlled street/access relationship;
3. exact planning identity/current snapshot cross-check;
4. R1–R6 admission closeout;
5. if READY, a separate authored-candidate packet.

## Frozen boundaries

- Reference House unchanged;
- no neighbouring-title aggregation;
- no `COMPATIBLE`;
- no whole-site `INCOMPATIBLE`;
- no route search/optimisation;
- Lennard remains an instrumented control excluded from DPL-16;
- DPL-RP-001…008 corpus remains unchanged.
