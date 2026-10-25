# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Current gate:** [#700 — DPL-T](https://github.com/adamnoden/architecture/issues/700) — conventional positive-control geometry preflight  
**DPL-T1 selected control:** `DPL-T-CONTROL-004 — 41 Lennard Road, Bromley, BR2 8LN`  
**DPL-T1 result:** `CONTROLLED_SCREENING_GEOMETRY_DOES_NOT_DISPROVE_PLACEMENT`  
**Next authorised packet after DPL-T1 lands:** **DPL-T2 — 41 Lennard Road datum / street-access composition and full R1–R6 admission**  
**Programme maturity:** **M4 — internally controlled at the bounded synthetic SCREENING-result scope. Real-site deployment remains unvalidated.**

## Purpose

DPL asks whether the controlled Ovid’s House Reference House can be deployed honestly onto real land under declared site, jurisdiction, evidence and assurance conditions without confusing architectural authorship, site truth, external authority, compiler proof or professional judgement.

Governing rules remain:

> **Compatibility before adaptation.**

> **The compiler evaluates architecture; it does not silently author it.**

> **Unknown reality stays unknown. Missing evidence is not a pass.**

> **Spatial evidence retains its actual authority class. An index polygon is not a determined legal boundary.**

## Controlled programme state

DPL-01 through DPL-13 establish the controlled synthetic deployment machinery: ontology/result semantics, Reference House conformance, assurance profiles, target composition, site/interface authority, authored-candidate identity and SCREENING aggregation.

The empirical DPL-14 London corpus remains:

```text
DPL-RP-001 … DPL-RP-008
DPL-15C candidate-authoring readiness = 0 / 8
DPL-16 deployment envelope            = HELD
```

That `0 / 8` state is an external spatial-evidence finding, not eight incompatibility verdicts. Every instrumented control below is excluded from DPL-16 sampling.

---

# Instrumented-control sequence

## Control 1 — 92 Uphill Road, Mill Hill

```text
DPL-S-CONTROL-001
92 Uphill Road, Mill Hill, NW7 4QE
```

Evidence sufficiency existed in principle, but exact machine-readable geometry could not be recovered faithfully from the controlled planning drawing.

```text
result = REAL_CONTROL_CANDIDATE_NOT_AUTHORED_GEOMETRY_RECOVERY_FAILED
```

Lesson: do not build OCR/raster/PDF machinery merely to force progress.

## Control 2 — 1 Whittington Road, Wood Green

```text
DPL-S-CONTROL-002
1 Whittington Road, Wood Green, N22 8YS
HGY/2026/2550
```

A submitted `SiteLocation.geojson` identity and useful plans/sections existed, but the Haringey/Arcus transport layer did not expose the exact document bytes through the bounded retrieval path.

Lesson: a machine-readable filename in a planning portal is not acquired geometry.

## Control 3 — 25A Chesterfield Road, Chiswick

```text
DPL-S-CONTROL-003
25A Chesterfield Road, Chiswick, W4 3HQ
UPRN 100021580413
```

This deliberately conventional street-front bungalow-replacement control successfully reached direct HMLR/Planning Data geometry, but the exact SCREENING polygon proved too narrow:

```text
area                         = 327.8688 m²
minimum containing width     = 8.96194 m
Reference House footprint    = 12.0 m × 10.8 m
minimum RH projection width  = 10.8 m
result                       = CONTROL_SITE_SCREENING_GEOMETRY_NO_UNCHANGED_RH_PLACEMENT
```

This is a pre-candidate geometry result, not whole-site `INCOMPATIBLE`.

Lesson: test geometry before spending effort on datum/access evidence.

## Control 4 — 41 Lennard Road, Bromley — selected by DPL-T1

```text
DPL-T-CONTROL-004
41 Lennard Road, Bromley, BR2 8LN
planning ref 26/02618/FPA
UPRN 100020404537
```

The site matches the intended clean experimental typology: existing bungalow → demolition → one detached replacement dwelling on the normal street frontage.

### Exact identity and geometry

An exact planning-source BNG point `542903,166217` and the public UPRN point for `100020404537` converge within approximately `0.036 m`, preventing neighbouring-title selection by visual judgement.

Planning Data returns exactly one HMLR title-boundary entity:

```text
entity                          = 12057071807
reference                       = 57071807
quality                         = authoritative
source CRS                      = EPSG:4326
analysis CRS                    = EPSG:27700
area                            = 783.6969 m²
minimum containing envelope     = 13.5235 m × 67.1018 m
RH theoretical minimum width    = 10.8 m
width margin                    = 2.7235 m
```

A constructive `12.0 m × 10.8 m` rigid rectangle is contained by the exact controlled SCREENING polygon with approximately `1.232 m` minimum boundary clearance at the witness placement.

Therefore:

```text
CONTROLLED_SCREENING_GEOMETRY_DOES_NOT_DISPROVE_PLACEMENT
```

The witness is geometry proof only. It is **not** the authored deployment candidate, a setback decision, a planning proposition or an optimisation output.

### Current R1–R6 frontier

```text
R1 = SATISFIED_FOR_SCREENING_TITLE_EXTENT
R2 = SATISFIED_POSITIVE_CONSTRUCTIVE_PREFLIGHT
R3 = SATISFIED_EPSG4326_SOURCE_WITH_BNG_ANALYSIS
R4 = PENDING_DOWNSTREAM_DATUM_TOPOGRAPHY
R5 = PENDING_DOWNSTREAM_STREET_ACCESS
R6 = SATISFIED_AT_PARCEL_ADDRESS_PLANNING_IDENTITY_LEVEL
Reference House candidate = NOT AUTHORED
```

The HMLR polygon remains indicative registered-property index geometry, not a determined legal-title boundary.

---

# DPL-T1 selection discipline

The bounded shortlist was categorical, not scored:

- `41 Lennard Road` — **selected** after exact positive geometry preflight;
- `4 Ninhams Wood` — held after the first positive control was found;
- `The Vicarage, 1B St James Road` — held;
- `15 Fairholme Gardens` — held;
- `The Bungalow, Routh Road` — held;
- `17 Tower Terrace` — rejected before geometry because earlier planning history establishes rear-garden / garages / portacabins conditions rather than the clean street-front replacement experiment.

Stop at the first legitimate positive control. Do not expand the shortlist for sample-size optics.

---

# Next packet — DPL-T2

After DPL-T1 lands, acquire only the downstream evidence now justified by the positive geometry result:

1. authoritative elevation/topography sufficient for `R4_DATUM_LEVEL_EVIDENCE`;
2. controlled physical street/access relationship sufficient for `R5_PHYSICAL_ACCESS_STREET_GEOMETRY`;
3. current planning identity/snapshot cross-check;
4. final R1–R6 admission disposition.

DPL-T2 may emit candidate-authoring readiness if all six dimensions are positively evidenced. It must **not** author the candidate itself; candidate authoring remains a subsequent packet.

---

# Frozen programme boundaries

```text
DPL-14 eight-site corpus              = UNCHANGED
DPL-15C corpus readiness              = 0 / 8
instrumented real controls            = EXCLUDED FROM DPL-16 SAMPLE
Reference House                       = UNCHANGED
COMPATIBLE @ SCREENING                = NOT ADMITTED FOR REAL CONTROL
whole-site INCOMPATIBLE               = NOT ADMITTED
route search / exhaustion             = NOT IMPLEMENTED
DPL-16 deployment envelope            = HELD
DPL-17 publication integration        = HELD
DPL-18 final validation               = HELD
```

Do not shrink or deform the Reference House to rescue a site. Do not aggregate neighbouring land without exact authority. Do not promote SCREENING index geometry to determined legal title. Do not infer a deployment envelope from instrumented controls.

## Restart discipline

Resume from this file, #700, `project/dpl/dpl-t1-lennard-road-positive-control-selection.md`, and the two `DPL-T-CONTROL-004` records under `project/dpl/sites/`.

Every packet must preserve:

`baseline main SHA → exact question → controlled inputs → evidence/authority → deterministic result → boundaries → artefacts changed → checks → exact next packet`
