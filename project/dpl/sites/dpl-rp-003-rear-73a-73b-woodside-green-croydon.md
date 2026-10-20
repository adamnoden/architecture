# DPL-RP-003 — Rear of 73A and 73B Woodside Green, South Norwood, SE25 5HU

**Corpus:** DPL Corpus 1 pilot  
**Packet:** DPL-14B / #379  
**Site kind:** `REAL`  
**Assurance profile:** `SCREENING`  
**Corpus role:** `COVERAGE_ADDITION`  
**Admission state:** `ADMITTED`  
**Research / retrieval date:** 2026-10-20  
**Borough:** London Borough of Croydon  
**Working site identity:** garage/redevelopment land at/rear of 73A and 73B Woodside Green, South Norwood, London SE25 5HU  
**Legal boundary:** `UNKNOWN`  
**Deployment conclusion:** **NOT EVALUATED — DPL-15 NOT STARTED**

## 1. Why this site is in the pilot

This site is selected as the pilot's **tight urban garage/infill + contradictory planning-outcome** condition.

The public planning record shows a particularly useful sequence:

1. in 2025, Croydon granted planning permission for demolition of garages and a replacement two-storey **four-bedroom single dwelling**;
2. a later proposal for **two dwellings** on the rear site was refused and then dismissed at appeal in May 2026;
3. the appeal decision identified character/massing and the functional quality of private amenity space as decisive harms, while not finding the parking position determinative in the same way.

That makes the site a strong empirical test of several DPL rules:

- one prior permission is not a generic `site suitable for housing` pass;
- site capacity is proposal-specific and judgement-led;
- D6 private-space arithmetic is not the same as D3/D6 qualitative amenity judgement;
- more dwelling yield is not automatically optimum capacity;
- planning history is evidence, not architectural authorship.

---

## 2. Source register

### `S1 — official Croydon decision record / one-house permission`

**Authority:** London Borough of Croydon  
**Record:** `24/03598/FUL`  
**Location:** 73A and 73B Woodside Green, South Norwood, London SE25 5HU  
**Public authority record:** Croydon Planning Committee public decisions pack  
**URL:** `https://croydon.moderngov.co.uk/documents/g3876/Public%20reports%20pack%2008th-May-2025%2018.30%20Planning%20Committee.pdf?T=10`  
**Source class:** `OFFICIAL_LOCAL_AUTHORITY_PUBLIC_RECORD`  
**Decision date recorded:** 2025-04-11  
**Retrieved:** 2026-10-20

Proposal recorded:

- demolition of existing garages;
- construction of a replacement two-storey four-bedroom dwellinghouse;
- off-street parking.

Decision recorded:

- permission granted.

Limitations:

- this record confirms the decision/proposal identity but is not imported as an exact current site survey/title polygon;
- conditions, approved drawings and technical evidence are not treated as current DPL facts unless separately recovered;
- the grant does not establish Reference House acceptability.

### `S2 — later two-house application / public record`

**Authority:** London Borough of Croydon  
**Record:** `25/02151/FUL`  
**Location:** Rear of 73A and 73B Woodside Green, South Norwood, London SE25 5HU  
**Public register-derived record:** current Croydon planning-record datasets surfaced from public council/Planning London data  
**Source class:** `PUBLIC_PLANNING_RECORD`  
**Retrieved:** 2026-10-20

Proposal recorded:

- demolition of existing garages;
- construction of two dwellinghouses: one two-bedroom and one three-bedroom dwelling.

Decision context:

- application refused before appeal.

### `S3 — Planning Inspectorate appeal decision metadata / summary`

**Appeal:** `6005406`  
**Site:** Rear of 73A and 73B Woodside Green, South Norwood, London SE25 5HU  
**Decision date:** 2026-05-12  
**Procedure:** written representations  
**Outcome:** dismissed  
**Public research record pointing to Inspectorate decision:** `https://planningprecedent.co.uk/decision/6005406`  
**Alternative public record:** `https://townplannerpro.co.uk/appeals/6005406`  
**Source class:** `PUBLIC_SUMMARY_OF_PLANNING_INSPECTORATE_DECISION`  
**Retrieved:** 2026-10-20

Material issues recorded from the published appeal decision summary:

- character and appearance;
- living conditions for future occupiers, especially private amenity space for one dwelling;
- highway safety / parking.

The Inspector dismissed the two-house appeal because the identified character/appearance and living-condition harms outweighed its benefits.

Important bounded point:

> the appeal record explicitly refers to an extant scheme/fallback context but does not make that fallback a DPL compatibility result.

### Source-use restraint

DPL-14B encountered inconsistent secondary/marketing references while locating Woodside Green development land. No inconsistent application number is imported as authority.

For this admitted site the corpus uses the stable official/public-record identities above and treats exact parcel/title geometry as unresolved.

---

## 3. Screening site claims

### `RP003-C01 — site identity`

**Claim:** a real garage/redevelopment parcel at/rear of 73A and 73B Woodside Green is identified by Croydon planning records and Planning Inspectorate appeal history.  
**Basis:** `S1 + S2 + S3`  
**State:** `KNOWN_AT_SCREENING`

### `RP003-C02 — borough / planning authority`

**Claim:** the site lies in the London Borough of Croydon, Woodside ward/context.  
**Basis:** `S1 + S3`  
**State:** `KNOWN_AT_SCREENING`

### `RP003-C03 — existing garage / redevelopment condition`

**Claim:** both relevant planning proposals describe demolition of existing garages as part of redevelopment.  
**Basis:** `S1 + S2`  
**State:** `HISTORICAL_PUBLIC_RECORD`

**Current physical state in October 2026:** `UNKNOWN`.

The corpus therefore does not model the site as definitely:

- garage-occupied;
- cleared;
- built out under the 2025 permission.

### `RP003-C04 — one-house permission`

**Claim:** Croydon granted planning permission under `24/03598/FUL` for one two-storey four-bedroom dwelling with off-street parking.  
**Basis:** `S1`  
**State:** `EXTERNAL_PLANNING_DECISION_EVIDENCE`

This supports only the historical planning fact.

It does not establish:

- implementation;
- current permission status;
- Reference House acceptability;
- technical compliance;
- current local/strategic target satisfaction.

### `RP003-C05 — later two-house proposal and appeal`

**Claim:** a later two-dwelling proposal on the rear site was refused and its appeal (`6005406`) was dismissed on 2026-05-12.  
**Basis:** `S2 + S3`  
**State:** `EXTERNAL_PLANNING_DECISION_EVIDENCE`

### `RP003-C06 — character/massing sensitivity`

**Claim:** the 2026 appeal decision treated character/appearance and the scale/massing relationship to surrounding built form as material and ultimately harmful for the two-house scheme.  
**Basis:** `S3`  
**State:** `EXTERNAL_PLANNING_JUDGEMENT_EVIDENCE`  
**Decision criticality:** **HIGH for any later D3 case**.

Do not generalise this into:

```text
Reference House fails D3
```

because a different proposal must be judged on its own form/context response.

### `RP003-C07 — private amenity-space sensitivity`

**Claim:** the appeal decision found one proposed private garden insufficiently functional/usable, including because its constrained geometry and access/cycle-store relationships left little meaningful amenity area.  
**Basis:** `S3`  
**State:** `EXTERNAL_PLANNING_JUDGEMENT_EVIDENCE`

This is a valuable test of DPL-10B:

> **meeting or approaching a numeric area standard is not equivalent to acceptable qualitative amenity design.**

### `RP003-C08 — parking / highway issue`

**Claim:** parking provision formed an appeal issue, but the Inspector did not find highway-safety harm sufficient to outweigh/alter the decisive character/amenity conclusions.  
**Basis:** `S3`  
**State:** `EXTERNAL_PLANNING_JUDGEMENT_EVIDENCE`

DPL does not transform that proposal-specific conclusion into a site-wide parking entitlement.

### `RP003-C09 — site area`

**State:** `UNKNOWN_AT_ADMITTED_EVIDENCE`

No exact parcel area is imported from the current public sources used for this screening record.

### `RP003-C10 — boundary geometry / frontage / depth`

**State:** `UNKNOWN_AT_SURVEY_OR_TITLE_PRECISION`

The planning history proves a constrained urban parcel but does not justify reverse-engineering exact legal dimensions from screenshots or map polygons.

### `RP003-C11 — access geometry`

**State:** `PARTIALLY_EVIDENCED / NOT SURVEYED`

Off-street parking and the appeal's highway/parking discussion establish that vehicle/site-access relationships formed part of the proposals.

Unknown:

- exact access width;
- highway crossover geometry;
- construction access;
- legal rights;
- refuse/fire access;
- route levels.

### `RP003-C12 — topography / levels`

**State:** `UNKNOWN`

The appeal discussion of raised garden conditions is proposal-specific and is not a general topographical survey of the site.

### `RP003-C13 — trees / landscape`

**State:** `UNKNOWN_AT_ADMITTED_EVIDENCE`

No TPO/arboricultural conclusion is made from these records.

### `RP003-C14 — ground / drainage / utilities / sewers`

**State:** `UNKNOWN`

The existence of planning permission does not discharge technical/site due diligence.

### `RP003-C15 — title / private rights`

**State:** `UNKNOWN`

No title, easement, covenant, Party Wall or utility-right conclusion is inferred from the public planning history.

---

## 4. DPL-08 interface stress

| Package / duty | Screening observation | State |
|---|---|---|
| `GI-D01 SUPPORT` | no geotechnical/foundation evidence | `UNRESOLVED` |
| `GI-D02 DATUM` | exact levels unknown; later proposal had level/amenity geometry issues | `UNRESOLVED` |
| `GI-D03 WEATHER/MOISTURE` | no ground/water/drainage evidence | `UNRESOLVED` |
| `GI-D04 ACCESS/MOVEMENT` | proposal/parking access exists as planning question; exact route geometry unknown | `UNRESOLVED` |
| `GI-D05 MAINTENANCE TERRITORY` | constrained urban site likely makes working territory important; exact geometry absent | `UNRESOLVED` |
| `SI-P04 utilities/external plant` | unknown | `UNRESOLVED` |
| `SI-P06 context/environment` | character/massing and neighbour/amenity relationship demonstrably decision-critical | `UNRESOLVED — ACCELERATE PLANNING EVIDENCE` |

---

## 5. DPL-09B consequences

No public planning decision is treated as evidence that Parts A/C/D/Regulation 7 are satisfied for a new Reference House proposal.

At screening:

```text
A1  UNRESOLVED
A2  UNRESOLVED
A3  UNRESOLVED
C1  UNRESOLVED
C2  UNRESOLVED
D1  proposal/product fact dependent
Reg 7(1) future product/workmanship evidence
```

Planning permission is not technical approval.

---

## 6. DPL-10B consequences

This site is the strongest B2 pilot example for the mixed-method planning model.

### D3

The same underlying site has supported materially different proposals with materially different planning outcomes.

That is direct evidence against a simplistic site-level Boolean:

```text
planningSuitableForHousing = true
```

D3 remains proposal/context judgement.

### D6 private outside space

The appeal demonstrates that **functional quality** of amenity space can be material beyond a raw numeric area.

A future DPL-10B numeric D6 check must therefore remain bounded to the exact numeric proposition it proves.

It cannot override an adverse qualitative judgement about unusable space.

### D6 GIA / storage / height

Not evaluated in this screening site record because the Reference House is not yet a planning proposal on this site.

### D5 / D7

No inclusive-design or M4 category conclusion is inherited from either historical proposal.

---

## 7. Admission rationale

**Admit as `COVERAGE_ADDITION`.**

The site contributes:

- Croydon borough coverage;
- constrained urban garage/infill morphology;
- a one-house permission plus a later two-house refusal/appeal dismissal on the same broad parcel identity;
- strong D3 character/massing evidence;
- strong qualitative private-amenity evidence relevant to keeping D6 numeric checks bounded;
- proof that planning history must remain proposal-specific rather than being collapsed into site suitability;
- a useful future candidate for borough-policy/adversarial planning work because the public decision history is comparatively rich.

It is **not yet selected as the first DPL-10C borough proof**. B2 only records that Croydon now has unusually informative empirical material.

---

## 8. Explicit unknowns carried forward

- exact legal/title boundary;
- exact site area / dimensions;
- current physical garage/clearance/build-out state;
- title/control/private rights;
- access dimensions/rights;
- topography;
- ground/geotechnics;
- groundwater/contamination/gas/radon;
- sewers/drainage apparatus;
- utilities and capacity;
- tree/TPO condition;
- neighbour-window/current context survey;
- status/implementation of the 2025 permission;
- current borough-policy/applicability detail beyond the recovered decisions;
- whether any Reference House candidate can preserve DPL-02 identity on the site;
- planning acceptability of the Reference House.

---

## 9. Non-claims

DPL-RP-003 does **not** establish that:

- the 2025 permission is live or implemented;
- one dwelling is inherently acceptable on this site;
- two dwellings are inherently unacceptable under every possible design;
- the Reference House fits;
- the Reference House would repeat the 2026 appeal harms;
- the one-house permission makes the site `COMPATIBLE`;
- a D6 numeric pass would answer D3 or amenity judgement;
- planning history proves technical compliance;
- the site should be acquired.

Its value is that it makes planning **proposal-dependence** impossible for the DPL model to ignore.
