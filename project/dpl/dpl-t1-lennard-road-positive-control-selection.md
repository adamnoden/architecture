# DPL-T1 — 41 Lennard Road positive-control selection

**Parent gate:** #700 — DPL-T  
**Baseline main:** `0024b28d4e18c63dab966c36b660617b62dbc8cd`  
**Date:** 2026-10-25  
**Selected control:** `DPL-T-CONTROL-004`  
**State:** `CONTROLLED_SCREENING_GEOMETRY_DOES_NOT_DISPROVE_PLACEMENT`

## Selection

```text
41 Lennard Road, Bromley, BR2 8LN
planning ref: 26/02618/FPA
control id: DPL-T-CONTROL-004
```

The proposition is the intended experiment: demolition of an existing bungalow and construction of one detached house on the ordinary Lennard Road frontage, with front-driveway alterations. It is not backland or garage-court development.

## Geometry-first proof

An earlier planning statement for this exact address gives British National Grid coordinate `542903,166217`. The public Open UPRN point for `100020404537` transforms to approximately `542903.0123,166217.0333`, a separation of about `0.036 m`. This binds the exact address/planning identity to the UPRN without selecting a neighbouring parcel by eye.

Planning Data returns exactly one HM Land Registry `title-boundary` entity for that UPRN:

```text
entity       = 12057071807
reference    = 57071807
quality      = authoritative
area         = 783.6969 m²
min envelope = 13.5235 m × 67.1018 m
```

The unchanged Reference House remains `12.0 m × 10.8 m`. The controlled polygon's minimum containing width exceeds the RH theoretical minimum projection width by about `2.7235 m`.

A constructive rigid-placement witness was then tested against the exact controlled polygon. A full `12.0 m × 10.8 m` rectangle is contained with approximately `1.232 m` minimum boundary clearance at the witness position.

Therefore:

```text
CONTROLLED_SCREENING_GEOMETRY_DOES_NOT_DISPROVE_PLACEMENT
```

The witness is proof that the geometry-first gate survives. It is not yet the authored deployment candidate and is not an architectural optimisation output.

## Bounded shortlist

- `41 Lennard Road` — **SELECT** after positive constructive geometry preflight.
- `4 Ninhams Wood` — hold; no reason to spend further acquisition effort after the first positive control.
- `The Vicarage, 1B St James Road` — hold; clean replacement typology but not needed after Lennard passed.
- `15 Fairholme Gardens` — hold; clean replacement typology but not needed after Lennard passed.
- `The Bungalow, Routh Road` — hold; clean replacement typology but not needed after Lennard passed.
- `17 Tower Terrace` — reject before geometry: earlier Haringey history records garages/portacabins to the rear and prior rear-garden dwelling proposals, so it is not the clean street-front replacement experiment.

No scalar ranking was used. The stop condition was the first exact positive control matching the frozen typology.

## Authority boundary

The HMLR/Planning Data polygon is authoritative index geometry showing indicative registered-property position/extent. It is not a determined legal-title boundary.

This preflight does not establish planning acceptability, private rights, setbacks, access, levels, drainage, utilities, full R1–R6 readiness or `COMPATIBLE`.

## Acquisition proof

Disposable GitHub Actions run `40206660586` completed successfully on probe head `76f9a2bff6ad296817fd6fa41e4bd28d7f214aaa`. It acquired the exact Planning Data bytes and performed the bounded CRS/geometry calculations. The disposable workflow was removed before merge; no source-specific acquisition machinery enters `main`.

## R1–R6 frontier

```text
R1 = SATISFIED_FOR_SCREENING_TITLE_EXTENT
R2 = SATISFIED_POSITIVE_CONSTRUCTIVE_PREFLIGHT
R3 = SATISFIED_EPSG4326_SOURCE_WITH_BNG_ANALYSIS
R4 = PENDING_DOWNSTREAM_DATUM_TOPOGRAPHY
R5 = PENDING_DOWNSTREAM_STREET_ACCESS
R6 = SATISFIED_AT_PARCEL_ADDRESS_PLANNING_IDENTITY_LEVEL
```

## Exact next packet

After this selection lands, authorise only:

> **DPL-T2 — 41 Lennard Road datum / street-access composition and full R1–R6 admission**

DPL-T2 may acquire the downstream evidence now justified by the positive geometry result. It must not author the Reference House candidate itself.

## Frozen boundaries

- Reference House unchanged;
- no neighbouring-title aggregation;
- no `COMPATIBLE`;
- no whole-site `INCOMPATIBLE`;
- no route search/optimisation;
- Lennard remains an instrumented control excluded from DPL-16;
- DPL-RP-001…008 remains unchanged at `0 / 8` candidate-authoring-ready.
