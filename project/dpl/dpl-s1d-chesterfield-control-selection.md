# DPL-S1D — Chesterfield Road conventional replacement control

**Parent:** #663 — DPL-S1  
**Selection record:** #675  
**Parcel binding:** #672 / #682  
**Datum + street/access:** #673  
**Admission closeout:** #674  
**Red team:** #676  
**Baseline main:** `7364609ddaeb263b1008a5ecd092b0c33ba55846`  
**Research date:** 2026-10-25  
**State:** `CONTROL_003_SELECTED_EVIDENCE_COMPOSITION_IN_PROGRESS`

## Decision

Supersede Whittington Road as the active DPL-S1 control candidate with:

```text
controlId: DPL-S-CONTROL-003
site: 25A Chesterfield Road, Chiswick, London, W4 3HQ
planningAuthority: London Borough of Hounslow
applicationRef: P/2025/1408
controlSiteKind: INSTRUMENTED_REAL_CONTROL
sampleMembership: EXCLUDED_FROM_DEPLOYMENT_ENVELOPE_SAMPLE
ReferenceHouse: UNCHANGED
```

Whittington Road is **not deleted or invalidated**. It remains a useful failed transport experiment: a council planning record may expose a machine-readable document identity while still being a poor machine-readable source seam for DPL.

The reason for moving to 25A is experimental legibility, not expected success.

## Why 25A is a better control

The first-party Hounslow planning record identifies the proposition as:

> erection of a self-build two-storey detached house following demolition of the existing bungalow.

That creates a materially cleaner real-site experiment than a backland garage plot:

```text
existing ordinary street-fronting dwelling
  -> demolition
  -> same conventional residential plot
  -> one detached replacement house
```

It removes rear-lane/backland access as a confounder and lets DPL test a question much closer to the ordinary deployment proposition: can the unchanged Reference House be authored on a normal London house plot?

This is **not** selection because Hounslow considered the submitted scheme acceptable, because the land is commercially attractive, or because the Reference House is expected to fit. The exact title polygon has not yet been bound and no fit result exists.

## Controlled evidence already established

### Planning identity

First-party London Borough of Hounslow records bind:

```text
P/2025/1408
25A Chesterfield Road, Chiswick, London, W4 3HQ
```

to demolition of the existing bungalow and erection of a detached replacement house.

Public Hounslow source:

`https://www.hounslow.gov.uk/downloads/file/11903/-week-39-pending-decisions-list-26-september-2025-to-3-october-2025-outcomes`

The planning portal is undergoing scheduled maintenance on 2026-10-25, so the exact first-party decision/date snapshot remains separately audited under #679 rather than inferred from conflicting secondary indexes.

### Street-front identity

Hounslow traffic-order records provide unusually explicit street-side identity for No. 25A:

- Chesterfield Road is identified on the **south-west side**;
- one order references the **common boundary of Nos. 25 and 25A Chesterfield Road**;
- another references the **western flank wall of No. 25A Chesterfield Road**.

Sources:

`https://www.hounslow.gov.uk/downloads/file/14102/central-avenue-crossover-notice-of-making-p071-25`

`https://www.hounslow.gov.uk/downloads/file/13513/electric-vehicle-on-street-consolidation-nom-tmo-p018-26`

These records establish road-front identity context. They do **not** establish private access rights or parcel coordinates.

### Address / postcode substrate

`W4 3HQ` is a controlled postcode containing 25 UPRNs. Public address-point material confirms 25A exists at this postcode, but the exact UPRN has not yet been proved. Several UPRNs in the postcode have coincident or near-coincident coordinates, therefore visual ordering is expressly prohibited as an identity method.

Exact-address resolution is owned by #682.

### Parcel source class

DPL-S1 now prefers the Planning Data / HM Land Registry `title-boundary` dataset over a portal-specific planning red line for the parcel substrate.

Dataset:

`https://www.planning.data.gov.uk/dataset/title-boundary`

Authority semantics:

- provider: HM Land Registry;
- machine-readable WKT / GeoJSON geometry;
- Planning Data marks entities as authoritative-at-source;
- geometry is an **indicative index polygon showing position and extent of a registered property**;
- it is not silently upgraded to a determined legal boundary.

The exact 25A entity/reference is not yet frozen. #672 owns that binding and must fail closed rather than choose the visually plausible neighbour.

### Datum source class

Environment Agency `LIDAR Composite Digital Terrain Model (DTM) - 1m` is admitted as the preferred R4 source class.

Dataset:

`https://www.data.gov.uk/dataset/01b3ee39-da3f-47b6-83da-dc98e73a461f/lidar-composite-dtm-2022-1m`

Controlled properties:

- publisher: Environment Agency;
- approximately 99% England coverage;
- 1 m horizontal resolution;
- metres referenced to Ordnance Survey Newlyn;
- OSTN15 transformation;
- contributing individual LiDAR surveys state +/-15 cm RMSE vertical accuracy;
- public/open licence.

Exact tile/cell extraction for 25A is owned by #673. Dataset existence is not yet a site datum.

## R1–R6 state after selection

```text
R1_CONTROLLED_SPATIAL_IDENTITY         = PARTIAL — planning/address identity proved; exact parcel binding pending #672/#682
R2_FOOTPRINT_TEST_GEOMETRY             = PENDING — exact HMLR title polygon not yet frozen
R3_REAL_ORIENTATION_FRAME              = PENDING — follows exact WGS84 title geometry binding
R4_DATUM_LEVEL_EVIDENCE                = PENDING — EA 1 m DTM source class admitted; site extraction pending #673
R5_PHYSICAL_ACCESS_STREET_GEOMETRY     = PARTIAL — street-front identity strongly proved; exact geometry/access disposition pending #673
R6_SITE_IDENTITY_COHERENCE             = PARTIAL — planning + street + address align; parcel entity still unbound
```

No final DPL-S1 result is emitted.

## Dependency graph

```text
#682 exact address key
   -> #672 exact title polygon / R1-R3

#673 EA datum + street/access / R4-R5

#672 + #673
   -> #674 R1-R6 closeout
   -> #676 adversarial control-selection red team
   -> #663 DPL-S1 close only if earned
```

#679 separately audits the controlled planning snapshot date because public secondary indexes conflict. That date must not be fabricated merely to make the manifest look complete.

## What would make this work

The control becomes candidate-authoring-ready only when the following exact chain exists:

```text
25A exact address key
  -> exact HM Land Registry index polygon
  -> WGS84/orientation semantics
  -> explicit 12.0 m x 10.8 m footprint-test geometry
  -> exact EA DTM site extraction
  -> controlled Chesterfield Road frontage/access relationship
  -> coherent one-site evidence identity
```

Only then may #674 emit:

```text
CONTROL_SITE_CANDIDATE_AUTHORING_READY
```

and authorise DPL-S2.

## Frozen boundaries

```text
DPL-RP-001...008 corpus                 = UNCHANGED
DPL-15C corpus readiness                = 0 / 8
DPL-S-CONTROL-001 Uphill Road           = EXCLUDED_FROM_DPL16_SAMPLE
DPL-S-CONTROL-002 Whittington Road      = SUPERSEDED_ACTIVE_CONTROL / RETAINED_EVIDENCE
DPL-S-CONTROL-003 Chesterfield Road     = ACTIVE_S1_CONTROL_CANDIDATE / EXCLUDED_FROM_DPL16_SAMPLE
Reference House                         = UNCHANGED
Reference House placement               = NOT AUTHORED
COMPATIBLE                               = NOT ADMITTED
INCOMPATIBLE                             = NOT ADMITTED
route search / exhaustion                = NOT IMPLEMENTED
DPL-16                                   = HELD
```
