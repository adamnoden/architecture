# DPL-RP-006 — Land adjacent to 50 Camelot Close, Thamesmead, SE28 0ET

**Corpus:** DPL Corpus 1 gap-correction cohort  
**Packet:** DPL-14C / #402  
**Site kind:** `REAL`  
**Assurance profile:** `SCREENING`  
**Corpus role:** `COVERAGE_ADDITION`  
**Admission state:** `ADMITTED`  
**Research / retrieval date:** 2026-10-21  
**Borough:** Royal Borough of Greenwich  
**Working site identity:** land adjacent to 50 Camelot Close, Thamesmead, SE28 0ET  
**Legal boundary:** `UNKNOWN`  
**Deployment conclusion:** **NOT EVALUATED — DPL-15 NOT STARTED**

## 1. Why admitted

This site supplies the gap cohort's strongest **water / environmental / contaminated-land** condition. It is a small residential development parcel with recent planning permission, while the public application evidence includes flood-risk, contamination and foul-sewage/utilities material. The auction evidence also warns that the depicted parcel may overlap adopted highway and that stated measurements are approximate.

That combination is exactly the DPL problem: rich environmental evidence alongside unresolved legal/spatial identity.

## 2. Source register

### S1 — current/recent auction record

- Auction House London, lot for `Land Adjacent to 50 Camelot Close, Thamesmead, London, SE28 0ET`;
- approximately 217 m² asserted;
- records planning reference `25/3755/F`, granted 2026-01-16, for a two-storey dwelling attached to No. 50;
- warns that plan/measurements are indicative and that some/all land may comprise adopted highway;
- URL: `https://www.auctionhouse.co.uk/london/auction/lot/152498`;
- class: `CURRENT/RECENT AUCTION_RECORD`.

### S2 — Royal Greenwich planning application public material

- reference: `25/3755/F`;
- location: land adjacent to 50 Camelot Close, Thamesmead;
- proposal: construction of two-storey dwellinghouse attached to No. 50 with landscaping, waste and cycle storage;
- Royal Greenwich public weekly/application material surfaced through official planning publication;
- class: `OFFICIAL_LOCAL_AUTHORITY_PLANNING_RECORD`.

### S3 — application technical documents

Public planning documents for `25/3755/F` include a Design and Access Statement / supporting material with flood-risk, land-contamination and foul-sewage/utilities sections, plus a contaminated-land risk document for the application site.

Representative public document host: `https://docs.planning.org.uk/` (application `25/3755/F`).

## 3. Screening claims

- `RP006-C01` — one recent small residential planning site is identified consistently by marketing and planning sources: `KNOWN_AT_SCREENING`.
- `RP006-C02` — permission for one two-storey dwelling was recorded on 2026-01-16: `EXTERNAL_PLANNING_DECISION_EVIDENCE`.
- `RP006-C03` — auction particulars assert ~217 m² only as approximate marketing geometry: `APPROXIMATE_MARKETING_MEASUREMENT`.
- `RP006-C04` — adopted-highway overlap is explicitly possible: `DECISION_CRITICAL_UNKNOWN`, not a title conclusion.
- `RP006-C05` — flood, contamination and foul/utilities questions were material enough to generate dedicated application evidence: `KNOWN_EVIDENCE_FAMILY`, not proof that every risk is absent or resolved for a different proposal.
- `RP006-C06` — planning material described the application land as private garden/vacant plot context at its relevant date: `HISTORICAL_APPLICATION_STATE`; current physical state requires recheck.

## 4. Decision-critical unknowns

- exact legal/title and adopted-highway extent;
- exact surveyed geometry and orientation;
- current build-out state after the October 2026 auction;
- site levels/topography;
- current flood-risk dataset status and design consequence;
- contamination/remediation status;
- sewer ownership/capacity/connection rights;
- utilities and access rights;
- geotechnics and groundwater.

## 5. Interface stress

Primary packages: `SI-P03` foul/surface/site water, plus `SI-P01` ground, `SI-P02` approach/datum and `SI-P04` utilities. This is the first corpus record with a clearly evidenced **water/environmental evidence stack** rather than merely an unknown drainage field.

## 6. Provenance semantics

`sourceIdentityLinkConfidence: EXACT_IDENTITY` for the application reference/location; title/highway identity remains unresolved.  
`temporalState: PLANNING_DECISION_2026 + AUCTION_STATE_2026; CURRENT_BUILD_OUT_RECHECK_REQUIRED`.  
`spatialScope: PLANNING_APPLICATION_SITE / INDICATIVE_AUCTION_PLAN; LEGAL_EXTENT_UNKNOWN`.

No compatibility, remediation sufficiency or purchase conclusion is made.