# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Current packet:** [#763 — DPL-T5](https://github.com/adamnoden/architecture/issues/763) — Lennard real-control runtime assembly and screening-coverage replay  
**Current real-control result:** `REAL_CONTROL_RUNTIME_COMPOSED_GAPS_EXPOSED`  
**Next authorised packet:** **DPL-T6 — Lennard real-control SCREENING aggregation and architectural-review composition**  
**Programme maturity:** **M4 — bounded real-control runtime composition is now proved; whole-site SCREENING conclusion remains unearned.**

## Purpose and governing rules

DPL asks whether the controlled Ovid’s House Reference House can be deployed honestly onto real land under declared site, jurisdiction, evidence and assurance conditions.

> **Compatibility before adaptation.**

> **The compiler evaluates architecture; it does not silently author it.**

> **Unknown reality stays unknown. Missing evidence is not a pass.**

> **Spatial evidence retains its actual authority class. An HMLR index polygon is not a determined legal boundary; EA DTM is not a private measured topo survey.**

## Controlled synthetic and corpus state

DPL-01 through DPL-13 establish the deployment ontology, conformance seam, interface authority, target stack, runtime composition and SCREENING aggregation semantics.

The empirical DPL-14 London corpus remains unchanged:

```text
DPL-RP-001 … DPL-RP-008
DPL-15C candidate-authoring readiness = 0 / 8
DPL-16 deployment envelope            = HELD
```

Instrumented controls are pipeline experiments only and remain excluded from DPL-16 sampling.

## Instrumented-control sequence

### Control 1 — 92 Uphill Road, Mill Hill

Evidence sufficient in principle; exact machine-readable geometry was not recovered faithfully from the scaled planning source.

`REAL_CONTROL_CANDIDATE_NOT_AUTHORED_GEOMETRY_RECOVERY_FAILED`

### Control 2 — 1 Whittington Road, Wood Green

Planning file exposed `SiteLocation.geojson` identity and useful plans/sections, but the portal transport did not expose controlled bytes.

Lesson: document-list metadata is not acquired geometry.

### Control 3 — 25A Chesterfield Road, Chiswick

Conventional street-front replacement typology; exact HMLR SCREENING geometry acquired but too narrow:

```text
area                        = 327.8688 m²
minimum containing width    = 8.96194 m
unchanged RH                = 12.0 m × 10.8 m
result                      = CONTROL_SITE_SCREENING_GEOMETRY_NO_UNCHANGED_RH_PLACEMENT
```

This is a pre-candidate geometry result, not whole-site `INCOMPATIBLE`.

### Control 4 — 41 Lennard Road, Bromley

```text
control id       = DPL-T-CONTROL-004
address          = 41 Lennard Road, Bromley, BR2 8LN
planning ref     = 26/02618/FPA
UPRN             = 100020404537
HMLR entity      = 12057071807
HMLR reference   = 57071807
```

The site is the intended conventional condition: existing bungalow → demolition → one detached replacement house on a normal street frontage.

#### T1 — fail-fast geometry preflight

```text
area                            = 783.6969 m²
minimum containing envelope     = 13.5235 m × 67.1018 m
unchanged RH                    = 12.0 m × 10.8 m
constructive witness contained  = YES
witness min boundary clearance  = ~1.232 m
```

Result:

`CONTROLLED_SCREENING_GEOMETRY_DOES_NOT_DISPROVE_PLACEMENT`

The witness proved only that the shell could fit. It was not promoted into architecture.

#### T2 — R1–R6 admission

Admitted evidence:

- HMLR / Planning Data indicative title-index geometry;
- Environment Agency 1 m LiDAR Composite DTM, EPSG:27700 / ODN;
- exact-site submitted planning evidence identifying the south-west Lennard Road frontage, front access and dropped kerb;
- current `26/02618/FPA` proposition corroborating front driveway alterations.

```text
R1_CONTROLLED_SPATIAL_IDENTITY       = SATISFIED_FOR_SCREENING_TITLE_EXTENT
R2_FOOTPRINT_TEST_GEOMETRY           = SATISFIED_POSITIVE_CONSTRUCTIVE_PREFLIGHT
R3_REAL_ORIENTATION_FRAME            = SATISFIED_EPSG4326_SOURCE_WITH_BNG_ANALYSIS
R4_DATUM_LEVEL_EVIDENCE              = SATISFIED_SCREENING_DATUM_TOPOGRAPHY_EA_DTM
R5_PHYSICAL_ACCESS_STREET_GEOMETRY   = SATISFIED_SCREENING_PHYSICAL_STREET_ACCESS_RELATIONSHIP
R6_SITE_IDENTITY_COHERENCE           = SATISFIED_AT_PARCEL_ADDRESS_PLANNING_IDENTITY_LEVEL

result = CONTROL_SITE_CANDIDATE_AUTHORING_READY
```

EA parcel terrain evidence:

```text
minimum             = 70.20 m ODN
maximum             = 71.10 m ODN
mean                = 70.5288 m ODN
terrain range       = 0.90 m
centroid sample     = 70.4000 m ODN
raster SHA-256      = ee7e04c7eee8f4391bc64cd57485439722e15687ffaad49b4a02804957fd1db9
```

This remains SCREENING evidence, not a measured private topographic survey.

#### T3 — authored candidate

T3 authored exactly one unchanged, unmirrored `RH-V02` placement:

```text
candidate                  = DPL-T-CANDIDATE-004-01 / rev 0.1
canonical front            = 12.000 m model-south edge
front bearing              = -51.6343476471° from BNG easting
frontage bearing           = -44.6343476471° from BNG easting
front skew                 = -7.000°
front-centre construction  = frontage midpoint +4.5 m along frontage +26.0 m inward
ground FFL                 = 70.70 m ODN
screening containment      = YES
min title-index clearance  = ~0.640 m
```

T3 kept the canonical 12 m façade street-facing rather than reusing the arbitrary T1 fit witness.

Artifacts:

- `project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json`
- `project/dpl/dpl-t3-lennard-authored-candidate.md`

#### T4 — deterministic candidate verification

Executable proof:

`compiler/dpl/dplT4Lennard.test.ts`

Bounded BNG analysis artifact:

`project/dpl/sites/dpl-t-control-004-lennard-road-analysis-bng-v01.json`

Frozen verification result:

`project/dpl/sites/dpl-t-control-004-lennard-road-verification-v01.json`

Semantic result fingerprint:

`0fafa462472370e54d5e1e3aba40e88cb594e8aafb877e0c687af0e5c5fc96dc`

The replay proves:

```text
Reference House source identity    = CURRENT / PINNED
Reference House compile identity   = CURRENT / PINNED
rigid 12.0 × 10.8 m transform      = PASS
handedness                         = UNMIRRORED
title-index containment            = PASS
minimum screening clearance        = ~0.640024 m
frontage / front / -7° skew        = REPRODUCED
70.70 m ODN screening FFL          = REPRODUCED
```

Bounded DPL-12B result:

```text
RH-I02       = CONFORMS
RH-PROT-01   = CONFORMS
RH-PROT-04   = CONFORMS
RH-PROT-06   = CONFORMS
RH-V02       = CONFORMS
RH-SI02      = OPEN / EXTERNAL_OR_UNMODELLED
RH-SI05      = OPEN / EXTERNAL_OR_UNMODELLED
```

This is a verified **candidate**, not a verified whole site.

#### T5 — real-control runtime assembly

T5 is the first instrumented real control to reach the generic DPL runtime with an authored and verified Reference House candidate.

Real-control manifest:

`project/dpl/sites/dpl-t-control-004-lennard-road-runtime-manifest-v01.json`

Adapter and proof:

- `compiler/dpl/dplT5Lennard.ts`
- `compiler/dpl/dplT5Lennard.test.ts`

Decision record:

`project/dpl/dpl-t5-lennard-real-control-runtime.md`

T5 uses seventeen real claims, `LNR-C01 … LNR-C17`, mapped explicitly to current DPL-10 / DPL-11 coverage families. It does not rename real evidence into the synthetic `RS-*` vocabulary.

Only one candidate-specific runtime proposal fact is admitted:

```text
dwellingStoreys = 2
```

The current applicant proposal's bedroom count, bedspace count, GIA, storage, private-outside-space geometry and M4 assignment are deliberately not transferred onto the different unchanged Reference House candidate.

Frozen identities:

```text
manifest fingerprint
  d45dda4d1c7faa46aaf08e773671590cf78a2bc7335079dfebec81091a56145b

source-set fingerprint
  a6af74fed8e78faa84bdcb3dcc28d2f245b74585f2a2024a3cec5ff729ce76d0

deployment-case fingerprint
  791cb427364d32208a00d02d7b42f2b472a64023e0e1b2eed58215e37fee52f3

deployment-result fingerprint
  3f2fdfb9573a31bfdf33fc418169f49d83cad303830e4e9a56370c65e22608f9

T5 result fingerprint
  c858fcac7b7481f43c33e49cf7e092ca749467370d75e7903973c1887401ecdf
```

Raw runtime:

```text
obligations               = 29
UNRESOLVED                 = 27
UNSUPPORTED                = 2
FAIL                       = 0
PASS                       = 0
EXTERNALLY_DISCHARGED      = 0
raw unresolved inputs      = 45
```

Candidate conformance:

```text
CONFORMS                           = 5
OPEN                              = 20
NON_CONFORMING                     = 0
REQUIRES_REFERENCE_HOUSE_REVISION = 0
```

Real-claim coverage:

```text
real claims                    = 17
mapped real claims             = 17
unique owner coverage families = 18
```

The crucial interpretation is that **45 raw missing fields are not 45 SCREENING blockers**. DPL-12A is a deliberately low-level obligation ledger. Existing DPL-02 / DPL-09 / DPL-10 / DPL-11 authority must classify what is actually due at SCREENING before new evidence is commissioned.

The 20 OPEN candidate findings likewise have an established authority split:

```text
16  DPL-13E project architectural-review clauses
 4  external/professional/site authority
```

The four non-architectural-review opens are:

- `RH-PROT-08` — competent structural/professional evidence;
- `RH-PROT-14` — actual maintenance/site-interface evidence;
- `RH-SI02` — datum / external-level / threshold / grading response;
- `RH-SI05` — approach / access / landscape / external-site response.

Therefore T5 does not author a consultant shopping list from the raw runtime.

## Active packet — DPL-T5

T5 proves the real-control composition seam and freezes its diagnostic result.

It does not:

```text
reuse the applicant scheme as the Reference House
resolve all raw DPL-12A missing inputs
reuse the RS-02 architectural-review ledger on a different candidate
infer legal boundaries
infer measured topography
solve site interfaces
assess planning acceptability
emit whole-site COMPATIBLE / INCOMPATIBLE
```

## Next gate — DPL-T6

> **Compose Lennard through a bounded real-control SCREENING aggregation seam and apply the existing DPL-13E architectural-review authority to the exact T5 candidate; classify raw runtime gaps by current DPL-02 / DPL-09 / DPL-10 / DPL-11 authority so only genuinely due external/site evidence survives as the next acquisition frontier.**

T6 must:

1. preserve the `LNR-C##` real-claim vocabulary and owner-family mappings;
2. reuse/refactor DPL-13 readiness/aggregation only as narrowly required for a real-control case;
3. author a fresh Lennard-specific review over the exact sixteen-clause DPL-13E universe;
4. bind that review to the exact Lennard candidate, current Reference House source and DPL-02 authority;
5. preserve `RH-PROT-08`, `RH-PROT-14`, `RH-SI02` and `RH-SI05` as external/site authority;
6. distinguish due-now SCREENING blockers from future-due technical inputs and owner-judgement records;
7. reuse existing source/applicability authority where already implemented;
8. refuse `COMPATIBLE`, `INCOMPATIBLE` and route exhaustion.

Only after T6 should the programme commission the next real evidence packet.

## Frozen programme boundaries

```text
DPL-14 eight-site corpus              = UNCHANGED
DPL-15C corpus readiness              = 0 / 8
instrumented real controls            = EXCLUDED FROM DPL-16 SAMPLE
Reference House                       = UNCHANGED
legal title boundary                  = UNRESOLVED
private access rights                 = UNRESOLVED
highway adoption extent               = UNRESOLVED
measured private topographic survey   = NOT_ACQUIRED
foundation / ground adequacy          = NOT_PROVED
accessible approach / threshold       = NOT_PROVED
foul / surface-water solution         = NOT_PROVED
utility approach / external plant     = NOT_PROVED
planning acceptability                = NOT_PROVED
COMPATIBLE @ SCREENING                = NOT_ADMITTED FOR REAL CONTROL
whole-site INCOMPATIBLE               = NOT_ADMITTED
route search / exhaustion             = NOT_IMPLEMENTED
DPL-16 deployment envelope            = HELD
DPL-17 publication integration        = HELD
DPL-18 final validation               = HELD
```

## Restart discipline

Resume from this file, #763, `project/dpl/dpl-t5-lennard-real-control-runtime.md`, the T3/T4/T5 artifacts under `project/dpl/sites/`, and the existing DPL-13E architectural-review authority.

Every packet must preserve:

`baseline main SHA → exact question → controlled inputs → evidence/authority → deterministic result → boundaries → artefacts changed → checks → exact next packet`
