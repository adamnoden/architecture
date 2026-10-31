# DPL-RP-005 — Great West Road / Stucley Road corner site, Hounslow, TW5

**Corpus:** DPL Corpus 1 gap-correction cohort  
**Packet:** DPL-14C / #402  
**Site kind:** `REAL`  
**Assurance profile:** `SCREENING`  
**Corpus role:** `COVERAGE_ADDITION`  
**Admission state:** `ADMITTED_WITH_SOURCE_IDENTITY_RECHECK`  
**Research / retrieval date:** 2026-10-21  
**Borough:** London Borough of Hounslow  
**Working site identity:** rear-garage development land serving the current Great West Road corner property, with proposed/new address relationship to Stucley Road  
**Legal boundary:** `UNKNOWN`  
**Deployment conclusion:** **NOT EVALUATED — DPL-15 NOT STARTED**

## 1. Why admitted

This record supplies the missing **corner / dual-frontage** condition. Current marketing describes a large gated corner property on Great West Road whose rear garages have separate side-road access and an asserted planning permission for a detached dwelling with its own Stucley Road address.

The site is useful precisely because the public evidence does not collapse neatly into one parcel identity. DPL therefore admits the screening condition while retaining the planning/source-link uncertainty.

## 2. Source register

### S1 — current property marketing record

- current Rightmove listing for `Great West Road, Hounslow, Greater London, TW5`;
- describes the host property as a prominent gated corner plot with three rear garages, each with gated side access;
- asserts planning reference `00505/R/O588/P3` for conversion/redevelopment of two rear garages into a detached house with its own Stucley Road address;
- URL: `https://www.rightmove.co.uk/properties/169266563`;
- class: `CURRENT_MARKETING_RECORD`.

### S2 — independent listing surface carrying the same particulars

- OnTheMarket record for the same host property repeats the corner plot, rear garages and reference `00505/R/O588/P3`;
- URL: `https://www.onthemarket.com/details/16029259/`;
- class: `DERIVATIVE_MARKETING_RECORD`.

### S3 — Hounslow public planning/street context

- Hounslow/Planning Atlas public planning history for Stucley Road confirms the side-road residential context and Hounslow authority but does not independently prove S1's exact rear-parcel identity;
- URL: `https://www.planningatlas.co.uk/atlas/street/hounslow/stucley-road`;
- class: `PUBLIC_PLANNING_CONTEXT`.

**Lineage warning:** S1 and S2 are materially syndicated marketing evidence. They count as separate source records but not independent corroboration of the planning claim.

## 3. Screening claims

- `RP005-C01` — a current large corner host property with meaningful Great West Road and side-road relationships exists: `CURRENT_MARKETING_ASSERTION`.
- `RP005-C02` — rear garages / side access create a distinct potential one-dwelling development area: `CURRENT_MARKETING_ASSERTION`.
- `RP005-C03` — planning reference `00505/R/O588/P3` and separate Stucley Road address are asserted consistently by current marketing: `THIRD_PARTY_ASSERTED_PLANNING_IDENTITY` pending direct register recovery.
- `RP005-C04` — dual-frontage/corner exposure is decision-critical to access, orientation, public-realm and context interfaces: `KNOWN_AT_SCREENING` at host-property level.

The record does **not** assert that the marketed freehold/title extent equals the planning red line for the additional dwelling.

## 4. Decision-critical unknowns

- direct official planning-register verification of `00505/R/O588/P3` and current permission status;
- exact red-line/title relationship between host property, garages and Stucley Road;
- plot dimensions/orientation for the one-dwelling parcel;
- legal rights and access;
- current garage/build-out state;
- topography, ground, drainage/sewers and utilities;
- neighbour/public-realm geometry.

## 5. Interface stress

Primary packages: `SI-P02` approach/datum, `SI-P04` utilities, `SI-P05` construction/maintenance and `SI-P06` context/environment. The key empirical value is **two-street exposure and potentially independent side-road servicing**, which is absent from RP-001→003.

## 6. Provenance semantics

`sourceIdentityLinkConfidence: LIKELY_OVERLAP` between current marketing and asserted planning parcel.  
`temporalState: CURRENT_MARKETING; PLANNING_STATUS_RECHECK_REQUIRED`.  
`spatialScope: HOST_CORNER_PROPERTY + ASSERTED_REAR_GARAGE_SUBAREA; LEGAL/PLANNING PARCEL NOT PROVEN`.

This admission deliberately proves that a useful corpus record can remain admitted while an identity edge is unresolved. It may not be promoted into a deployment case until that edge is rechecked.