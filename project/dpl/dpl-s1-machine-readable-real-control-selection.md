# DPL-S1 — machine-readable real-control selection

**Issue:** #663  
**Parent gate:** DPL-S #660 / PR #661  
**Baseline main:** `e498e55b479ece575872068d39cab82cc0a66608`  
**Research / retrieval date:** 2026-10-25  
**Packet state:** `CONTROL_SELECTED_SOURCE_BYTES_PENDING`  
**Final R1–R6 result:** **NOT YET EMITTED**

## Decision

Select:

```text
controlId: DPL-S-CONTROL-002
site: 1 Whittington Road, Wood Green, London, N22 8YS
planningAuthority: London Borough of Haringey
applicationRef: HGY/2026/2550
applicationType: Full planning permission
snapshotStatus: Under Consultation / awaiting decision
validated: 2026-10-02
proposal: Demolition of existing garage and erection of two detached houses and associated landscaping changes
controlSiteKind: INSTRUMENTED_REAL_CONTROL
sampleMembership: EXCLUDED_FROM_DEPLOYMENT_ENVELOPE_SAMPLE
```

This control is selected for **source architecture**, not because the proposal is attractive, likely to obtain permission or likely to fit the Reference House.

The application package is unusually useful because the same exact Haringey application record exposes:

- a submitted `SiteLocation.geojson`;
- an existing site plan **and site sections**;
- a proposed site plan;
- a proposed site block plan;
- a proposed site section;
- a conventional location plan;
- one coherent application/address identity.

That is the closest current public control to the exact DPL-S experiment: machine-readable application geometry composed with explicit planning geometry and level/section material, without having to manufacture coordinates from PDF pixels.

## Authoritative identity

First-party application record:

`https://publicregister.haringey.gov.uk/pr/s/planning-application/a0iP200000IsXB7IAN/hgy20262550?c__r=Arcus_BE_Public_Register`

The Haringey public register is the authority for the application and submitted documents. The current automated retrieval route reaches the record but the Salesforce front end does not expose the document bytes directly to this pipeline.

Third-party indexes used only for discovery/cross-checking, not promoted above the council record:

- `https://plota.co.uk/application/lxnmyxix`
- `https://planindex.co.uk/planning-applications/haringey/hgy-2026-2550`
- `https://plotedge.uk/planning-applications/haringey/hgy-2026-2550/`

## Frozen source-package candidates

The following exact filenames are bound to the Haringey application lineage and are the only DPL-S1 document targets currently admitted.

| Id | Exact document identity | Date | Intended authority role | Current retrieval state |
|---|---|---:|---|---|
| `S1-WHIT-01` | `SiteLocation.geojson` | 2026-09-10 | native machine-readable application/site boundary; coordinate/orientation substrate | `DOCUMENT_IDENTITY_CONFIRMED_BYTES_NOT_ACQUIRED` |
| `S1-WHIT-02` | `571725 060 existing site plan and site sections.pdf` | 2026-09-10 | existing site geometry, street/access relationship, existing section/level evidence | `DOCUMENT_IDENTITY_CONFIRMED_BYTES_NOT_ACQUIRED` |
| `S1-WHIT-03` | `571725 061 proposed site block plan.pdf` | 2026-09-10 | application-context/site-block relationship | `DOCUMENT_IDENTITY_CONFIRMED_BYTES_NOT_ACQUIRED` |
| `S1-WHIT-04` | `571725 062 proposed site plan.pdf` | 2026-09-10 | proposed site/access/placement context; not RH placement authority | `DOCUMENT_IDENTITY_CONFIRMED_BYTES_NOT_ACQUIRED` |
| `S1-WHIT-05` | `571725 065 proposed site section.pdf` | 2026-09-10 | proposed level/site-section evidence | `DOCUMENT_IDENTITY_CONFIRMED_BYTES_NOT_ACQUIRED` |
| `S1-WHIT-06` | `LocationPlan.pdf` | 2026-09-10 | identity/orientation/context cross-check | `DOCUMENT_IDENTITY_CONFIRMED_BYTES_NOT_ACQUIRED` |

No drawing above may be measured from display pixels. If a PDF is later used to establish a numerical fact, that fact must come from explicit dimensions/levels/scale or controlled vector content, with its derivation recorded.

## Bounded shortlist

Selection was categorical; no score was used.

### `HGY/2026/2550` — 1 Whittington Road — **SELECT**

Reason:

- exact submitted `SiteLocation.geojson` is present in the application file;
- existing site plan **and site sections** are separately present;
- proposed site plan, block plan and site section are separately present;
- exact street address/application identity is coherent;
- low-rise detached-residential redevelopment is legible enough for a pipeline control;
- the experiment does not depend on extracting a red line from a raster/PDF drawing.

### `HGY/2026/2557` — 28 Sidney Road — **REJECT AS FIRST CHOICE**

Positive:

- submitted `SiteLocation.geojson` is present;
- one new dwelling is proposed.

Reason for rejection:

- proposal requires partial excavation and is a deliberately tight garage/backland-type condition;
- its surfaced drawing package is materially less explicit than Whittington's separate existing site sections / proposed site plan / proposed site section set;
- it would mix pipeline validation with a needlessly pathological fit/topography stress case.

This is not an incompatibility finding and the site remains a legitimate fallback control.

### `HGY/2026/2487` — 17 Tower Terrace — **HOLD / NOT SELECTED**

Positive:

- ordinary one-home redevelopment proposition;
- explicit access in proposal wording.

Reason:

- current bounded discovery confirms the application and a substantial document file but has not surfaced an exact machine-readable boundary document identity with the same confidence as Whittington.

Do not assume absence; this is merely weaker evidence for the current experiment.

### `26/01554/FUL` — 29 Mount Park Avenue, South Croydon — **REJECT FOR S1**

Positive:

- detached dwelling case;
- controlled planning material includes level-sensitive proposal information.

Reason:

- bounded discovery did not surface a native machine-readable application boundary document;
- therefore it risks reproducing the Uphill Road document-transport problem.

### `24/03371/FUL` — The Vicarage, 1B St James Road, Purley — **REJECT FOR S1**

Positive:

- ordinary replacement detached-house proposition with driveway/land-level work.

Reason:

- surfaced authority remains drawing/PDF-led rather than natively coordinate-led;
- again, it does not directly test the DPL-S machine-readable-control hypothesis.

## R1–R6 admission state

DPL-S1 does **not** convert document-list metadata into spatial proof.

### R1 — `R1_CONTROLLED_SPATIAL_IDENTITY`

**State: `SATISFIED_AT_SOURCE_IDENTITY_LEVEL`**

Evidence:

- exact Haringey application reference;
- exact address;
- one coherent council application document lineage;
- first-party source record recovered.

This is sufficient to freeze the control identity, but not enough by itself to author geometry.

### R2 — `R2_FOOTPRINT_TEST_GEOMETRY`

**State: `PENDING_SOURCE_BYTE_INSPECTION`**

A submitted `SiteLocation.geojson` exists and is the correct source class, but DPL has not yet recovered its bytes/coordinates. Presence of the filename alone cannot prove polygon validity, CRS semantics, dimensions or the ability to fit the `12.0 m × 10.8 m` RH footprint.

### R3 — `R3_REAL_ORIENTATION_FRAME`

**State: `PENDING_SOURCE_BYTE_INSPECTION`**

The GeoJSON / location-plan package should carry a real frame/orientation relationship, but this must be read from controlled bytes rather than inferred from a web map.

### R4 — `R4_DATUM_LEVEL_EVIDENCE`

**State: `PENDING_DOCUMENT_INSPECTION`**

The application file contains both existing site sections and a proposed site section. Their mere presence does not prove that the explicit levels are sufficient for a SCREENING datum; inspect the source documents first.

If the planning drawings remain insufficient, an Environment Agency LiDAR/equivalent controlled elevation source may be composed under the DPL-S1 contract rather than inventing a datum.

### R5 — `R5_PHYSICAL_ACCESS_STREET_GEOMETRY`

**State: `PENDING_DOCUMENT_INSPECTION`**

The application is tied to 1 Whittington Road and carries existing/proposed site plans plus block plan. That is a strong source package, but exact access/street geometry must still be read from controlled source bytes.

### R6 — `R6_SITE_IDENTITY_COHERENCE`

**State: `SATISFIED_AT_SOURCE_IDENTITY_LEVEL`**

The admitted source candidates all belong to the same exact Haringey application/address lineage. No historical/current or host/sub-parcel substitution is being used.

R6 does not establish legal title/control.

## Current packet result

No final DPL-S1 result is emitted yet.

```text
selection                              = DPL-S-CONTROL-002 / 1 Whittington Road
source package identity                = FROZEN
R1 source identity                     = SATISFIED
R2 footprint-test geometry             = PENDING SOURCE BYTES
R3 orientation frame                   = PENDING SOURCE BYTES
R4 datum / level evidence              = PENDING DOCUMENT INSPECTION
R5 physical street / access geometry   = PENDING DOCUMENT INSPECTION
R6 source identity coherence           = SATISFIED
Reference House candidate              = NOT AUTHORED
DPL-S1 final result                    = NOT YET EMITTED
```

This is deliberately stricter than declaring READY from filenames.

## Exact next action inside DPL-S1

Acquire and inspect the exact admitted bytes for:

1. `SiteLocation.geojson`;
2. `571725 060 existing site plan and site sections.pdf`;
3. `571725 062 proposed site plan.pdf`;
4. `571725 065 proposed site section.pdf`;
5. `571725 061 proposed site block plan.pdf` only if needed to resolve R5/context.

Then:

- validate GeoJSON geometry/CRS/coordinate semantics;
- test whether the unchanged `12.0 m × 10.8 m` footprint can be evaluated from the polygon without authoring a placement;
- recover only explicit/controlled datum and access facts;
- derive exactly one authorised DPL-S1 final result.

If the Haringey portal cannot expose the exact bytes through a faithful route, do **not** recreate them from screenshots. Either use a faithful exact-document mirror with provenance or abandon this control and move to the fallback shortlist.

## Frozen programme boundary

```text
DPL-14 eight-site corpus              = UNCHANGED
DPL-15C candidate readiness           = 0 / 8
DPL-S-CONTROL-001 / Uphill Road       = EXCLUDED FROM DPL-16 SAMPLE
DPL-S-CONTROL-002 / Whittington Road  = EXCLUDED FROM DPL-16 SAMPLE
Reference House                       = UNCHANGED
COMPATIBLE                            = NOT ADMITTED
INCOMPATIBLE                          = NOT ADMITTED
route exhaustion                      = NOT IMPLEMENTED
DPL-16                                = HELD
```

No empirical London deployment-envelope claim may use either instrumented control.
