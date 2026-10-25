# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Latest landed real-control evidence:** PR #699 / `21d74227b08f3dc8bba06fd0bda7be2d91021c6e`  
**DPL-S1:** complete — three instrumented-control experiments have now isolated transport, source and geometry boundaries  
**Current authorised packet:** [#700 — DPL-T](https://github.com/adamnoden/architecture/issues/700) — conventional positive-control geometry preflight  
**Programme maturity:** **M4 — internally controlled at the bounded synthetic SCREENING-result scope. Real-site deployment remains unvalidated.**

## Purpose

DPL asks whether the controlled Ovid’s House Reference House can be deployed honestly onto real land under declared site, jurisdiction, evidence and assurance conditions without confusing architectural authorship, site truth, external authority, compiler proof or professional judgement.

The deployment question remains:

> **Can this controlled Reference House revision be deployed on this site, under this exact target composition and evidence state, while preserving its architectural identity and satisfying every obligation due for the requested assurance profile?**

Governing rules:

> **Compatibility before adaptation.**

> **The compiler evaluates architecture; it does not silently author it.**

> **Unknown reality stays unknown. Missing evidence is not a pass.**

> **Spatial evidence retains its actual authority class. An index polygon is not a determined legal boundary.**

---

# Controlled programme state

## Synthetic deployment machinery

DPL-01 through DPL-13 establish the controlled synthetic machinery: deployment ontology/result semantics, Reference House conformance, assurance profiles, target composition, site/interface authority, authored candidate identity and SCREENING aggregation.

The controlled M4 proposition includes:

- deterministic site / candidate / target / interface / result identity;
- owner-complete SCREENING coverage composition;
- explicit separation of architectural review, native computation and external evidence;
- bounded London strategic + borough target composition;
- canonical whole-site `UNRESOLVED @ SCREENING` authority;
- refusal to emit `COMPATIBLE` merely because represented checks are green;
- refusal to emit `INCOMPATIBLE` without separately controlled invariant-blocker / route-exhaustion authority.

This does **not** establish real-site deployability, planning permission, regulatory compliance, legal clearance or M5 external validation.

## Frozen real-site corpus

DPL-14 retains the empirical eight-site London corpus:

`DPL-RP-001 … DPL-RP-008`

The corpus remains:

```text
DPL-15C candidate-authoring readiness = 0 / 8
DPL-16 deployment envelope            = HELD
```

That `0 / 8` state is an external spatial-evidence finding, not eight incompatibility verdicts.

All instrumented controls described below are **excluded from DPL-16 sampling**.

---

# Instrumented-control sequence

## Control 1 — 92 Uphill Road, Mill Hill

```text
DPL-S-CONTROL-001
92 Uphill Road, Mill Hill, NW7 4QE
24/1141/FUL + accepted 25/1691/NMA Rev B lineage
```

DPL-R1 established evidence sufficiency under R1–R6 in principle.

DPL-R2 then failed cleanly at geometry acquisition:

```text
controlled proposal-demise geometry = EXISTS IN SOURCE
machine-recoverable boundary path   = NOT RECOVERED
Reference House candidate           = NOT AUTHORED
result                              = REAL_CONTROL_CANDIDATE_NOT_AUTHORED_GEOMETRY_RECOVERY_FAILED
```

Lesson: a scaled human drawing is not the same thing as acquired machine-readable geometry. Do not build OCR/raster/PDF machinery merely to force progress.

## Control 2 — 1 Whittington Road, Wood Green

```text
DPL-S-CONTROL-002
1 Whittington Road, Wood Green, N22 8YS
HGY/2026/2550
```

The planning file exposes a submitted `SiteLocation.geojson` identity plus useful plans/sections, but the Haringey/Arcus transport layer did not expose the exact document bytes through the bounded retrieval path.

Whittington therefore remains valid **document-transport boundary evidence**, not an authored candidate and not an incompatibility result.

Lesson: prefer direct spatial authority over a planning portal merely because a machine-readable filename appears in its document list.

## Control 3 — 25A Chesterfield Road, Chiswick

```text
DPL-S-CONTROL-003
25A Chesterfield Road, Chiswick, W4 3HQ
P/2025/1408
UPRN 100021580413
```

25A was deliberately selected as the more conventional experiment requested by the user:

```text
existing street-front bungalow
  → demolition
  → one detached replacement house
  → normal residential frontage
```

It removed the backland-access confounder present at Whittington.

### Exact source binding

Planning Data / HM Land Registry title-boundary evidence resolves exactly one entity for both the exact UPRN and an independent point query:

```text
entity                     = 12044235316
reference                  = 44235316
quality                    = authoritative
source JSON SHA-256        = 45240408b1a30743acfb5c06a98e9647ee55fa9bd6a24bcb5819163dee3b2b79
source CRS                 = EPSG:4326
```

The source is controlled **SCREENING index geometry**. HM Land Registry describes INSPIRE/index polygons as showing indicative position/extent; this is not a determined legal-title boundary.

### Geometry result

Metric analysis of the exact controlled polygon gives:

```text
area                               = 327.8688 m²
minimum containing envelope        = 8.96194 m × 42.07089 m
unchanged Reference House footprint = 12.0 m × 10.8 m
minimum RH projection width        = 10.8 m
```

The tested polygon lies wholly inside an `8.96194 m`-wide strip. A rigid `12.0 m × 10.8 m` rectangle has minimum orthogonal projection width `10.8 m` over every rotation.

Therefore no rigid rotation or mirror of the unchanged Reference House footprint can be contained within the exact tested SCREENING polygon.

Final S1 disposition:

```text
CONTROL_SITE_SCREENING_GEOMETRY_NO_UNCHANGED_RH_PLACEMENT
```

This is a **pre-candidate geometry result only**. It is not whole-site `INCOMPATIBLE`, legal-title impossibility, planning refusal or deployment-envelope evidence.

R1–R6 closeout:

```text
R1 = SATISFIED_FOR_TESTED_SCREENING_TITLE_EXTENT
R2 = SATISFIED_GEOMETRY_ACQUIRED_KNOWN_NO_PLACEMENT
R3 = SATISFIED_EPSG4326_SOURCE_WITH_BNG_ANALYSIS
R4 = NOT_ASSESSED_GEOMETRY_SHORT_CIRCUIT
R5 = PARTIAL_FIRST_PARTY_STREET_FRONT_IDENTITY_GEOMETRY_SHORT_CIRCUIT
R6 = SATISFIED_FOR_TESTED_SCREENING_TITLE_EXTENT
```

R4/R5 were deliberately short-circuited. Datum and access evidence cannot rescue a rigid footprint that cannot fit the controlled geometry.

25A is retained as a useful **conventional street-front negative geometry control**.

---

# DPL-S1 conclusion

The three controls answer three different questions cleanly:

```text
Uphill Road   → evidence exists, geometry transport/recovery fails
Whittington   → machine-readable document identity exists, portal byte transport fails
Chesterfield  → direct machine-readable geometry succeeds and proves no unchanged placement
```

The key programme lesson is dependency order.

For the next positive-control attempt, do **geometry preflight before downstream evidence acquisition**:

```text
exact address identity
  → exact machine-readable SCREENING polygon
  → rigid 12.0 m × 10.8 m footprint preflight
  → only if geometry does not disprove placement:
       datum / topography
       street / access
       full R1–R6 admission
       authored candidate
```

This is fail-fast dependency discipline, not optimisation.

---

# Current packet — DPL-T

[#700 — DPL-T](https://github.com/adamnoden/architecture/issues/700) owns the next experiment.

The next control should preserve the conventional condition that made 25A useful:

- Greater London;
- ordinary street-front detached residential plot;
- existing house/bungalow demolition or credible replacement-house planning lineage;
- house sits on the normal road frontage/building line, not rear/backland garage land;
- reasonably conventional parcel shape;
- instrumented control only, excluded from DPL-16.

Before spending effort on datum/access/planning evidence, bind one exact machine-readable SCREENING polygon and test the unchanged footprint.

Positive preflight means only:

```text
CONTROLLED_SCREENING_GEOMETRY_DOES_NOT_DISPROVE_PLACEMENT
```

Negative preflight may emit:

```text
CONTROL_SITE_SCREENING_GEOMETRY_NO_UNCHANGED_RH_PLACEMENT
```

Neither is whole-site compatibility/incompatibility.

The theoretical minimum containing width is `10.8 m`; prefer a sensible categorical margin beyond it so the next experiment is not dominated by centimetre-scale index/legal-boundary uncertainty. Do not create a scalar site score or rank land by width.

---

# Frozen programme boundaries

Until separately reopened:

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

Do not shrink or deform the Reference House to rescue a site.

Do not aggregate neighbouring land without exact authority.

Do not promote SCREENING index geometry to determined legal title.

Do not infer a deployment envelope from instrumented controls.

---

# Restart discipline

Resume from this file plus #700 and the durable control records under `project/dpl/sites/`.

Every packet must preserve:

`baseline main SHA → exact question → controlled inputs → evidence/authority → deterministic result → boundaries → artefacts changed → checks → exact next packet`

If reality rejects the Reference House, record the rejection before adapting the architecture.
