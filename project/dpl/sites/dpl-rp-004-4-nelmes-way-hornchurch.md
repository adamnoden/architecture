# DPL-RP-004 — 4 Nelmes Way, Hornchurch, RM11 2QZ

**Corpus:** DPL Corpus 1 gap-correction cohort  
**Packet:** DPL-14C / #402  
**Site kind:** `REAL`  
**Assurance profile:** `SCREENING`  
**Corpus role:** `COVERAGE_ADDITION`  
**Admission state:** `ADMITTED`  
**Research / retrieval date:** 2026-10-21  
**Borough:** London Borough of Havering  
**Working site identity:** 4 Nelmes Way, Hornchurch, RM11 2QZ  
**Legal boundary:** `UNKNOWN`  
**Deployment conclusion:** **NOT EVALUATED — DPL-15 NOT STARTED**

## 1. Why admitted

This site supplies the gap cohort's **ordinary street-front replacement-dwelling** condition. Unlike the B2 pilot's backland/garage sites, the public planning record concerns demolition of an existing dwelling and construction of one replacement dwelling on an established residential street.

It is admitted because that is a materially different deployment context, not because the approved proposal resembles the Reference House.

## 2. Source register

### S1 — Havering official planning register

- authority: London Borough of Havering;
- reference: `P0366.26`;
- location: `4 Nelmes Way Hornchurch RM11 2QZ`;
- proposal: construction of a replacement dwelling with basement, habitable loft, ancillary outbuilding, bin/cycle storage and associated works following demolition of the existing dwelling;
- received: 2026-03-25;
- validated: 2026-04-07;
- decision: approved with conditions, 2026-07-09;
- URL: `https://development.havering.gov.uk/OcellaWeb/planningDetails?from=planningSearch&reference=P0366.26`;
- class: `OFFICIAL_LOCAL_AUTHORITY_REGISTER`.

### S2 — Havering weekly applications list

- official weekly publication confirming the same application reference, location and proposal;
- URL: `https://www.havering.gov.uk/downloads/file/7391/planning-applications-received-7-to-13-april-2026`;
- class: `OFFICIAL_LOCAL_AUTHORITY_PUBLICATION`.

**Lineage:** S1 and S2 originate from the same authority; they are two records, not independent technical corroboration.

## 3. Screening claims

- `RP004-C01` — the planning-defined site identity is exact enough for screening: `KNOWN_AT_SCREENING` from S1/S2.
- `RP004-C02` — the 2026 proposal is one replacement dwelling: `EXTERNAL_PLANNING_RECORD`.
- `RP004-C03` — an existing dwelling was present as the proposal baseline: `HISTORICAL_AT_APPLICATION_DATE`; current demolition/build-out state is `UNKNOWN`.
- `RP004-C04` — the site has a normal public-street relationship rather than a backland/footpath-only access condition: `KNOWN_AT_SCREENING` only at planning-address/context level; exact access geometry is `UNKNOWN`.
- `RP004-C05` — permission was granted in July 2026: `EXTERNAL_PLANNING_DECISION_EVIDENCE`; this is not Reference House permission and does not prove present buildability.

## 4. Decision-critical unknowns

- exact legal/title boundary and rights;
- measured plot width/depth/area and orientation;
- topographic survey and finished levels;
- current physical/build-out state;
- ground/geotechnics, groundwater, contamination/radon;
- foul/surface drainage and sewer constraints;
- utility routes/capacity;
- neighbour-window geometry and construction logistics.

## 5. Interface stress

Primary DPL-08 packages exercised: `SI-P01` support/ground, `SI-P02` datum/plinth/approach, `SI-P03` site water, `SI-P04` utilities and `SI-P05` construction/maintenance. The value of this record is that those duties are exercised in a **conventional replacement** condition rather than only difficult backland land.

## 6. Provenance semantics

`sourceIdentityLinkConfidence: EXACT_IDENTITY` for S1↔S2 application identity.  
`temporalState: CURRENT_DECISION / CURRENT_PHYSICAL_STATE_RECHECK_REQUIRED`.  
`spatialScope: PLANNING_APPLICATION_SITE; LEGAL_TITLE_EXTENT_UNKNOWN`.

No site compatibility or purchase conclusion is made.