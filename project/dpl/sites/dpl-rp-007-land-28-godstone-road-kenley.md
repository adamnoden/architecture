# DPL-RP-007 — Land at 28 Godstone Road, Kenley, CR8 5JE

**Corpus:** DPL Corpus 1 gap-correction cohort  
**Packet:** DPL-14C / #402  
**Site kind:** `REAL`  
**Assurance profile:** `SCREENING`  
**Corpus role:** `COVERAGE_ADDITION`  
**Admission state:** `ADMITTED_TOPOGRAPHY_STRESS`  
**Research / retrieval date:** 2026-10-21  
**Borough:** London Borough of Croydon  
**Working site identity:** Land at 28 Godstone Road, Kenley, CR8 5JE  
**Legal boundary:** `UNKNOWN`  
**Deployment conclusion:** **NOT EVALUATED — DPL-15 NOT STARTED**

## 1. Why admitted

This record supplies the cohort's missing **reliably evidenced steep/topographic condition**. Public planning material consistently identifies the parcel and 2025 application `25/03774/FUL`; contemporaneous local planning commentary describes the land as a natural/sloping and steeply levelled strip between Godstone Road and Lower Road.

The application was for three dwellings, not one. DPL therefore admits this record **only as a real parcel/topography stress case**. It is not evidence that the parcel's natural development unit is three homes, that one Reference House is acceptable, or that a DPL-15 one-dwelling candidate has yet been authored.

## 2. Source register

### S1 — Croydon official planning decisions publication

- authority: London Borough of Croydon;
- reference: `25/03774/FUL`;
- site: Land at 28 Godstone Road, Kenley, CR8 5JE;
- proposal: three terraced dwellings with landscaping, cycle/refuse storage and communal garden;
- recorded decision date: 2026-01-23;
- URL: `https://croydon.moderngov.co.uk/documents/s69269/Weekly_Decisions_05.01.26to25.01.26.pdf`;
- class: `OFFICIAL_LOCAL_AUTHORITY_PUBLICATION`.

### S2 — captured planning-register record

- Planning Atlas record for `25/03774/FUL` links the same site/reference and 29 council documents including location plan, flood-risk assessment, biodiversity material and officer/decision records;
- URL: `https://www.planningatlas.co.uk/atlas/croydon/applications/25-03774-FUL`;
- class: `PUBLIC_CAPTURE_OF_OFFICIAL_REGISTER`.

### S3 — contemporaneous local planning commentary

- Croydon local councillor/public planning commentary, 2025-12-21, describes the application site as a natural/sloping site and explicitly refers to **steep levels**, rear height consequences and established trees;
- URL: `https://www.croydonconservatives.com/news/planning-application-28-godstone-road-kenley`;
- follow-up refusal commentary similarly describes a narrow strip and a steeply sloping site: `https://www.croydonconservatives.com/news/planning-refused-land-between-godstone-road-and-lower-road`;
- class: `PUBLIC_CONTEXT_ASSERTION`, not statutory decision authority.

## 3. Source conflict retained, not laundered

The public surfaces disagree on the decision label for `25/03774/FUL`: the Croydon decisions PDF text extraction places the reference beneath a `Permission Granted` heading, while the captured planning register and later local commentary describe refusal on 2026-01-23.

DPL therefore records:

```text
decisionStatus = CONFLICTING_PUBLIC_RECORD_REQUIRES_DIRECT_NOTICE_RECHECK
```

The conflict has **no bearing on why this site is admitted**. Site identity, proposal identity and steep topographic condition are enough for the bounded screening purpose. No planning-outcome inference is consumed downstream until the direct notice is recovered.

## 4. Screening claims

- `RP007-C01` — the planning-defined parcel/reference identity is `KNOWN_AT_SCREENING` from S1/S2.
- `RP007-C02` — the parcel has materially steep/sloping topography: `PUBLIC_CONTEXT_ASSERTION_CORROBORATED_BY_APPLICATION_CONTEXT`; a measured topographic survey remains absent from DPL.
- `RP007-C03` — vegetation/tree effects were material to the 2025 proposal context: `HISTORICAL_APPLICATION_CONTEXT`.
- `RP007-C04` — the proposal was three dwellings: `KNOWN_APPLICATION_FACT`; it is **not** the DPL deployment candidate.
- `RP007-C05` — exact decision outcome remains `UNRESOLVED_SOURCE_CONFLICT` pending direct decision-notice inspection.

## 5. Decision-critical unknowns

- surveyed levels/contours and gradients;
- exact legal/title extent and road relationships;
- whether a one-dwelling deployment case is meaningful on the same controlled parcel without redefining it;
- current physical/vegetation state;
- access rights and gradients;
- ground/geotechnics and retaining requirements;
- groundwater/flood/drainage/sewer evidence;
- utilities and construction logistics.

## 6. Interface stress

Primary packages: `SI-P01` ground/support, `SI-P02` datum/plinth/accessible approach, `SI-P03` site water, `SI-P05` construction/maintenance and `SI-P06` context/environment. The steep-level condition is particularly useful because it makes accessibility, harmless level change, retaining/ground design and drainage interact without authorising any construction solution.

## 7. Provenance semantics

`sourceIdentityLinkConfidence: EXACT_IDENTITY` for application/site reference.  
`temporalState: APPLICATION_2025 / DECISION_DATE_2026; CURRENT_PHYSICAL_STATE_RECHECK_REQUIRED`.  
`spatialScope: PLANNING_APPLICATION_SITE; LEGAL_TITLE_EXTENT_UNKNOWN`.  
`decisionStatusConfidence: CONFLICTING_PUBLIC_RECORD`.

No compatibility, planning acceptability or purchase conclusion is made.