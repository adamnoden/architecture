# DPL-15H — RP-007 bounded spatial-evidence acquisition and R1–R6 re-run

**Issue:** #872  
**Parent:** DPL-15G  
**Parent merge:** `a53d1c12eb19de53830baf774104d74a62846045`  
**Parent result fingerprint:** `de89a475c840b8c4deaf1509662389e26d7199c31439a7034a3190dd771cfb71`  
**Site:** DPL-RP-007 — Land at 28 Godstone Road, Kenley, CR8 5JE  
**Application:** `25/03774/FUL`  
**UPRN:** `10095497120`  
**Assurance:** `SCREENING`

## Result

```text
RP007_NOT_READY_CROYDON_DOCUMENT_TRANSPORT_AND_SPATIAL_AUTHORITY_BOUNDARY
```

Exact semantic result fingerprint:

```text
3033112069a44c4676e333ee7afa51f66607d9bd9141cd789d84992f9ba201c3
```

The corrected exact PR head passed the complete repository-health and publication workflow. The deterministic DPL test emitted:

```text
DPL-15H-FROZEN {
  "result":"RP007_NOT_READY_CROYDON_DOCUMENT_TRANSPORT_AND_SPATIAL_AUTHORITY_BOUNDARY",
  "siteId":"DPL-RP-007",
  "satisfiedCount":1,
  "residualCount":5,
  "candidateAuthoringReady":false,
  "resultFingerprint":"3033112069a44c4676e333ee7afa51f66607d9bd9141cd789d84992f9ba201c3",
  "nextPacket":"DPL-15I — RP-008 bounded no-spend spatial-evidence transport test and R1-R6 re-run"
}
```

## What was actually tested

DPL-15G selected RP-007 because its public evidence transport appeared categorically stronger than RP-008: exact application identity and UPRN plus a twenty-nine-document council-linked stack containing a location plan, flood-risk material, a BNG metric and decision/report material.

DPL-15H tested whether that apparent document richness survives the authority and transport test required for candidate authoring. It does not, in the current no-spend execution environment.

Five bounded acquisition routes were executed:

1. original Croydon location/site drawing bytes;
2. exact title-index geometry;
3. authoritative SCREENING terrain/datum evidence;
4. physical street/access relationship;
5. the conflicting public decision labels, quarantined from readiness.

The detailed attempt ledger and authority boundaries are frozen in:

`project/dpl/sites/dpl-15h-rp007-spatial-evidence-v01.json`.

## R1–R6 disposition

| Dimension | DPL-15H result | Reason |
| --- | --- | --- |
| R1 controlled spatial identity | **NOT SATISFIED** | exact application identity and UPRN are controlled, but no placement-ready application/title geometry entered the evidence graph |
| R2 footprint-test geometry | **NOT SATISFIED** | no controlled boundary shape/dimensions can test the unchanged `12.0 m × 10.8 m` Reference House |
| R3 real orientation frame | **NOT SATISFIED** | a location plan is indexed, but its source bytes/controlled geometry were not recovered; street/postcode context is insufficient |
| R4 datum / level evidence | **NOT SATISFIED** | steepness is well corroborated, but no authoritative ODN/terrain sample is bound to the controlled parcel |
| R5 physical access / street geometry | **NOT SATISFIED** | Godstone Road / Lower Road context and applicant access concerns are known, but exact controlled frontage/access geometry is absent |
| R6 site identity coherence | **SATISFIED** | application reference, address and UPRN converge on one real corpus site |

Therefore:

```text
positively evidenced readiness = 1 / 6
candidate authoring             = NOT AUTHORISED
```

## Critical finding

The important result is not merely that another site remains unready. It is that **document count is not evidence transport**.

RP-007 appeared to have a materially stronger public route because twenty-nine documents were indexed. But the decision-critical geometry remains behind Croydon's document transport boundary. An index proving that a location plan exists cannot substitute for the plan bytes, scale or geometry. Likewise:

- applicant three-dwelling geometry is non-transferable;
- narrative steepness is not datum evidence;
- postcode elevation is not parcel terrain;
- a planning red line is not legal title;
- an HMLR title-index polygon, if later recovered, would remain indicative rather than a determined boundary.

The compiler is not the limiting system.

## Planning-decision conflict

Croydon's first-party weekly decision publication places `25/03774/FUL` beneath a `Permission Granted` heading for 23 January 2026, while captured register/local public surfaces describe refusal on that date.

DPL-15H deliberately retains the conflict and excludes it from readiness. Direct decision-notice bytes would be required before using the planning outcome, but the outcome is not needed to answer R1–R6.

## Next disposition

Repeated Croydon index searches would reproduce the same failure class. RP-007 is therefore held at:

```text
HOLD_AT_EXTERNAL_OR_PORTAL_CONTROLLED_SPATIAL_EVIDENCE_BOUNDARY
```

The next bounded empirical test is:

```text
DPL-15I — RP-008 bounded no-spend spatial-evidence transport test and R1–R6 re-run
```

RP-008 is not promoted because it is easier, smaller or more likely to obtain permission. It earns one bounded pass because it is the deliberately lower-pathology one-house control and Lambeth exposes a categorically different public document route. If that route also fails to place controlled spatial evidence into the graph, DPL should stop generating site-search packets and make the programme-level external-evidence boundary explicit.

## Proof boundary

DPL-15H does **not** admit:

- a Reference House candidate;
- Reference House mutation;
- marketing geometry as authority;
- applicant-proposal geometry transfer;
- whole-site `COMPATIBLE` or `INCOMPATIBLE`;
- route exhaustion;
- external spend;
- DPL-16 admission.

DPL-16 remains held.