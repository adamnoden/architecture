# DPL-RP-001 — Land at 26 The Avenue, Finchley, N3 2FD

**Corpus:** DPL Corpus 1 pilot  
**Packet:** DPL-14B / #379  
**Site kind:** `REAL`  
**Assurance profile:** `SCREENING`  
**Corpus role:** `COVERAGE_ADDITION`  
**Admission state:** `ADMITTED`  
**Research / retrieval date:** 2026-10-20  
**Borough:** London Borough of Barnet  
**Working site identity:** Land at 26 The Avenue, Finchley, London N3 2FD  
**Legal boundary:** `UNKNOWN`  
**Deployment conclusion:** **NOT EVALUATED — DPL-15 NOT STARTED**

## 1. Why this site is in the pilot

This site was selected because it is unusually useful as an adversarial comparator to `DPL-RS-01`.

Its marketed parcel area, approximately **491.7 m²**, is close to the synthetic Reference Site's **522 m²**, but the access condition is materially different: the auction/listing sources describe the parcel as being **accessed via a public footpath** rather than an ordinary vehicle-capable street frontage.

That makes it a good test of a central DPL proposition:

> **similar plot area does not imply similar deployability.**

The site attacks, at screening level:

- `SI-P02` datum / approach / accessible arrival;
- `SI-P04` utility approach / external plant;
- `SI-P05` construction / maintenance / landscape;
- DPL-11 physical-access versus legal-entitlement separation;
- the temptation to turn gross area into a site-quality proxy.

It is admitted to learn from those questions, not because it looks likely to accept the Reference House.

---

## 2. Source register

### `S1 — discovery / marketing record`

**Provider:** Rightmove / Savills Auctions marketing feed  
**Record:** Land at 26 The Avenue, London  
**Rightmove property ID:** `774538831569105`  
**URL:** `https://www.rightmove.co.uk/properties/774538831569105`  
**Source class:** `THIRD_PARTY_RECORD`  
**Retrieved:** 2026-10-20

Material claims used from this source:

- approximate parcel area: 491.7 m² / 5,293 sq ft;
- a single-storey building is present;
- stated building GIA: approximately 55.74 m² / 600 sq ft;
- parcel described as vacant;
- parcel described as freehold;
- location described as north side of Manor View;
- access described as via public footpath;
- no floor/site plan is published on the listing;
- development potential is expressly subject to consents.

Limitations:

- marketing particulars are not survey/title/planning evidence;
- `freehold` is a marketing statement, not accepted title evidence for DPL purposes;
- area is approximate;
- the source does not prove exact parcel geometry or legal access rights;
- the approximate location marker is not a legal boundary.

### `S2 — auctioneer record`

**Provider:** Savills Auctions  
**Record:** Land at 26 The Avenue, Finchley, London, N3 2FD  
**URL:** `https://auctions.savills.co.uk/auctions/29--30-september-2026-243/land-at-26-the-avenue-finchley-london-n3-2fd-25173`  
**Source class:** `THIRD_PARTY_RECORD`  
**Retrieved:** 2026-10-20

This independently preserves the auction-lot identity and repeats the principal site/building/access particulars.

It is useful provenance, but because it is the selling auctioneer it is **not treated as independent technical confirmation** of the marketing facts.

### `S3 — independent postcode/context record`

**Provider:** public postcode/mapping data aggregator  
**Record:** N3 2FD  
**URL:** `https://www.doogal.co.uk/ShowMap?postcode=N3+2FD`  
**Source class:** `PUBLIC_DATA_AGGREGATION`  
**Retrieved:** 2026-10-20

Material claims used:

- postcode point approximately `51.597034, -0.188166`;
- local authority identified as London Borough of Barnet;
- ward identified as Finchley Church End;
- known address listed as 26 The Avenue;
- mapping source confirms broad Greater London location/context independently of the selling particulars.

Limitations:

- postcode point is not a parcel centroid or boundary;
- altitude/postcode-level context is not topographical survey evidence;
- no legal access/title/designation claim is accepted from this source.

---

## 3. Screening site claims

### `RP001-C01 — site identity`

**Claim:** a real parcel publicly marketed as **Land at 26 The Avenue, Finchley, London N3 2FD** exists.  
**Basis:** `S1 + S2 + S3`  
**State:** `KNOWN_AT_SCREENING`  
**Precision:** address/marketing-lot identity; not legal-title geometry.

### `RP001-C02 — borough / strategic context`

**Claim:** the address/postcode lies within the London Borough of Barnet and Greater London.  
**Basis:** `S3`  
**State:** `KNOWN_AT_SCREENING`

This is enough to place the site in the Greater London DPL corpus and to identify Barnet as the future local-planning-authority layer if the site reaches a planning-case compile.

### `RP001-C03 — approximate parcel area`

**Claim:** marketing sources state approximately **491.7 m²**.  
**Basis:** `S1 + S2`  
**State:** `THIRD_PARTY_RECORD`  
**Precision:** approximate marketed area only.

Do not infer:

- exact boundary;
- exact width/depth;
- buildable area;
- title area;
- Reference House fit.

### `RP001-C04 — existing building`

**Claim:** marketing sources state that a single-storey building of approximately **55.74 m² GIA** is present.  
**Basis:** `S1 + S2`  
**State:** `THIRD_PARTY_RECORD`

Therefore the site is **not modelled as cleared land**.

Unknown at screening:

- exact footprint/location;
- lawful use;
- construction;
- structural condition;
- demolition constraints;
- asbestos/contamination implications;
- whether any reuse obligation/benefit is relevant.

### `RP001-C05 — marketed occupancy condition`

**Claim:** the auction/listing describes the property as vacant.  
**Basis:** `S1 + S2`  
**State:** `THIRD_PARTY_RECORD`

This is not a title/possession/legal-completion conclusion.

### `RP001-C06 — physical access description`

**Claim:** the marketing/auction records state that the property is accessed via a **public footpath**.  
**Basis:** `S1 + S2`  
**State:** `THIRD_PARTY_RECORD`  
**Decision criticality:** **HIGH at screening**.

The claim is deliberately not rewritten as:

- `vehicle access = NO`;
- `construction access impossible`;
- `legal access sufficient`;
- `utility access sufficient`;
- `accessible route impossible`.

Those are separate questions.

### `RP001-C07 — relationship to Manor View`

**Claim:** the selling sources describe the parcel as located on the north side of Manor View.  
**Basis:** `S1 + S2`  
**State:** `THIRD_PARTY_RECORD`

The exact route between highway, footpath and site boundary remains unresolved.

### `RP001-C08 — exact geometry`

**Claim:** exact survey/title geometry is not established by the admitted sources.  
**State:** `UNKNOWN`

Because the listing explicitly carries no site plan, DPL-14B does not manufacture:

- frontage;
- depth;
- orientation of a legal frontage;
- shape polygon;
- side clearances;
- house fit.

The approximate 491.7 m² area is retained independently of shape.

### `RP001-C09 — topography / levels`

**State:** `UNKNOWN`

The postcode-level mapping elevation and visual context are insufficient to establish:

- approach gradient;
- parcel crossfall;
- retaining need;
- Reference House datum.

### `RP001-C10 — trees / vegetation`

**State:** `UNKNOWN_AT_ADMITTED_EVIDENCE`

No tree-preservation, arboricultural or survey claim is inferred from absence of tree particulars in the marketing text.

### `RP001-C11 — heritage / designations`

**State:** `UNKNOWN_AT_ADMITTED_EVIDENCE`

No conservation-area, listed-setting or other designation conclusion is inferred from listing silence.

### `RP001-C12 — flood / drainage`

**State:** `UNKNOWN_AT_ADMITTED_EVIDENCE`

No flood-zone, groundwater, surface-water, sewer or infiltration conclusion is made.

### `RP001-C13 — utilities`

**State:** `UNKNOWN`

No utility capacity, point of connection, rights or route is inferred from the existence of the small building.

### `RP001-C14 — title / private rights`

**State:** `UNKNOWN`

The marketing statement `freehold` is not enough to establish:

- registered title extent;
- easements;
- restrictive covenants;
- rights over the public footpath or adjoining land;
- utility rights;
- overage;
- third-party rights.

A legal pack existed for the auction but is access-controlled and was not imported into the public DPL record.

---

## 4. DPL-08 interface stress

| Package / duty | Screening observation | State |
|---|---|---|
| `GI-D01 SUPPORT` | no ground/geotechnical evidence | `UNRESOLVED` |
| `GI-D02 DATUM` | no reliable site/approach levels | `UNRESOLVED` |
| `GI-D03 WEATHER/MOISTURE` | no drainage/groundwater/wall-base evidence | `UNRESOLVED` |
| `GI-D04 ACCESS/MOVEMENT` | footpath-access description is a decision-critical trigger | `UNRESOLVED — ACCELERATE EVIDENCE` |
| `GI-D05 MAINTENANCE TERRITORY` | parcel area known approximately but geometry/access/support territory unknown | `UNRESOLVED` |
| `SI-P04 utilities/external plant` | route/capacity/rights unknown; access may be consequential | `UNRESOLVED — ACCELERATE IF SITE CONSIDERED` |
| `SI-P06 context/environment` | insufficient designation/noise/privacy evidence | `UNRESOLVED` |

No interface failure is declared from the phrase `public footpath` alone.

The point of the site is to force later work to distinguish:

```text
physical pedestrian access
legal access rights
vehicle / emergency / refuse access
construction logistics
utility rights/routes
inclusive principal approach
```

rather than collapsing them into one Boolean `hasAccess` field.

---

## 5. DPL-09B consequences

At screening:

- `A1` remains `UNRESOLVED` — no structural/foundation/ground design;
- `A2` remains `UNRESOLVED` — no geotechnical/ground-movement evidence;
- `C1(1)` / `C1(2)` remain `UNRESOLVED` — existing building/history is not proof of clean ground;
- `C1(3)` remains `UNRESOLVED` — sub-soil drainage need unknown;
- `C2` remains `UNRESOLVED` — no technical envelope/site-water response;
- Regulation 7 is not meaningfully site-resolved at screening.

The presence of an existing building is **not** evidence that new-dwelling ground conditions are adequate.

---

## 6. DPL-10B consequences

At screening:

- D3 context/site-capacity response would require substantially better parcel/context evidence;
- D5 inclusive-design questions are immediately made non-trivial by the access description;
- D6 dwelling standards are proposal facts, not site facts, and are not evaluated here;
- D7 individual dwelling category remains a later planning assignment.

The site does not receive a planning-likelihood judgement.

---

## 7. Admission rationale

**Admit as `COVERAGE_ADDITION`.**

The site contributes:

- third borough in the eventual pilot set: Barnet;
- parcel area unusually close to `DPL-RS-01` while access morphology is radically different;
- an existing-building/redevelopment condition;
- a decision-critical physical-access unknown/constraint;
- a strong test of DPL-11's physical-versus-legal-versus-construction-access separation;
- a strong example of why gross site area cannot become a compatibility proxy.

---

## 8. Explicit unknowns carried forward

At admission, retain as `UNKNOWN` unless later evidence replaces them:

- exact legal boundary/title extent;
- parcel width/depth/shape at survey precision;
- legal rights over the access path;
- vehicle/construction/emergency/refuse access capability;
- highway adoption/interface details;
- topographical levels;
- geotechnical profile / bearing / shrink-swell;
- groundwater;
- contamination / ground gas / radon;
- trees / TPO / root constraints;
- sewers and drainage apparatus;
- utilities / capacity / connection rights;
- flood/surface-water risk;
- heritage/designations;
- neighbour-window geometry;
- planning acceptability;
- demolition/reuse constraints for the existing building.

---

## 9. Non-claims

DPL-RP-001 does **not** establish that:

- the Reference House fits;
- the site is inaccessible;
- vehicle access is legally or physically impossible;
- a footpath route can or cannot satisfy an applicable access target;
- utilities can be supplied;
- the land is buildable;
- ground conditions are suitable;
- planning permission is likely;
- the marketing freehold statement is accepted title evidence;
- the marketed area is a survey/title area;
- the site should be bought.

Its value is that a site close to the Reference Site in gross area immediately exposes a very different deployment problem.
