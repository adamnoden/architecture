# DPL-10C — Croydon Borough Planning Plug-In Proof

**Issue:** [#401 — DPL-10C — Croydon borough planning plug-in proof](https://github.com/adamnoden/architecture/issues/401)  
**Programme:** [#299 — DPL](https://github.com/adamnoden/architecture/issues/299)  
**Authorised by:** [#390 — DPL-B2](https://github.com/adamnoden/architecture/issues/390)  
**Research baseline:** `8ff9bbb093adf7aed9d26d2e3faa68a6bda7ec64`  
**Research date:** 2026-10-21  
**Proof site:** `DPL-RP-003 — Rear of 73A and 73B Woodside Green, Croydon`  
**Disposition:** **PASS — one borough target composes with London strategic policy without collapsing source status, judgement or external permission; Bromley remains the predeclared adversarial replay**

## 1. Question

> **Can Croydon’s operative local planning sources and proposal-specific evidence compose with the London strategic target while preserving development-plan membership, guidance, judgement and external decision evidence as distinct authorities?**

**Yes, at the bounded proof scope.**

DPL-10C does not build a general planning-permission predictor or a complete Croydon policy engine. It proves that one real borough target can be represented as a typed local layer beside the already-controlled London strategic target without using list-order precedence, turning judgement into a score or treating one historic permission/refusal as a site-level planning Boolean.

Structured target:

`project/dpl/targets/croydon-local-planning-v1.json`

---

# 2. Source-status result at 2026-10-21

## 2.1 Operative local development-plan authority

Croydon’s current development-plan material identifies the **Croydon Local Plan 2018** as the operative local-plan component alongside the London Plan.

Controlled local-plan source:

`https://www.croydon.gov.uk/sites/default/files/2022-01/croydon-local-plan-20180.pdf`

Adoption date recorded by the council:

`2018-02-27`

The target therefore treats the 2018 Local Plan as:

`ADOPTED_LOCAL_DEVELOPMENT_PLAN_POLICY / OPERATIVE_AT_RESEARCH_DATE`

## 2.2 Partial Local Plan review remains emerging

Croydon’s Local Plan review is progressing through examination / modification work but had **not displaced the adopted 2018 plan on 21 October 2026**.

Official source:

`https://www.croydon.gov.uk/planning-and-regeneration/planning-policy/local-plan-review/local-plan-review-examination`

DPL-10C therefore records it as:

`EMERGING_LOCAL_PLAN / EMERGING_NON_OPERATIVE_AT_RESEARCH_DATE`

This is not a statement that emerging policy has zero planning weight in every live case. It is a source-status statement: the review is not silently substituted for the adopted local-plan target.

Any future planning case that needs emerging-policy weight must represent that material consideration explicitly and at the correct date rather than rewriting this target snapshot.

## 2.3 Suburban Design Guide SPD2 is revoked

Croydon states that the **Suburban Design Guide Supplementary Planning Document (SPD2)** ceased to be used as material guidance for determining planning applications from **26 July 2022**.

Current council guidance page:

`https://www.croydon.gov.uk/planning-and-regeneration/planning-policy/further-planning-guidance/supplementary-planning-documents-and-guidance`

DPL-10C therefore records SPD2 as:

`REVOKED_SUPPLEMENTARY_PLANNING_DOCUMENT`

It is not imported merely because older Croydon decisions or internet commentary may mention it.

This is exactly why target identity must include time and source status rather than an evergreen list of familiar documents.

---

# 3. Borough plug-in model

The Croydon target composes as a **typed local development-plan target**, not as a child object whose position in a list grants precedence.

```text
LONDON STRATEGIC TARGET
    London Plan 2021
    + adopted London guidance where material

CROYDON LOCAL TARGET
    Croydon Local Plan 2018
    + separately typed current local guidance where admitted

PROPOSAL / SITE EVIDENCE
    DPL-RP-003 facts and unknowns
    historic Croydon decisions
    appeal evidence

                ↓
       PLANNING CASE COMPOSITION
```

The model preserves these rules:

- local does not automatically override strategic because it is geographically narrower;
- strategic does not automatically override local because it is higher-level;
- apparently overlapping numeric duties retain separate policy identities;
- source conflict is handled through the planning/legal conflict semantics frozen by DPL-10A;
- guidance is not promoted into development-plan policy;
- historic decision evidence is not promoted into target policy;
- planning permission remains an external determination.

---

# 4. Admitted Croydon obligations

DPL-10C intentionally selects a **small representative slice** rather than attempting to encode the entire Local Plan.

## 4.1 `CROY-DM10-1-DESIGN-CHARACTER`

**Source:** Policy DM10.1–10.3  
**Method:** `LOCAL_DESIGN_JUDGEMENT`

The obligation covers, as applicable:

- pattern/layout/siting;
- scale/height/massing/density;
- appearance/materials/features;
- relationship to the local built/natural context;
- subservience where development occurs within the grounds of a retained building.

This remains planning/architectural judgement.

DPL-12A-style orchestration may organise the policy source, site evidence and proposal facts. It may not produce a character score or infer that a house is acceptable from dimensions alone.

### Proof-case evidence

The 2026 two-house appeal on DPL-RP-003 is useful because character/massing was materially adverse for that specific scheme.

It does **not** produce:

```text
site.characterCapacity = FAIL
```

or:

```text
ReferenceHouseFailsDM10 = true
```

A different authored proposal remains a different planning case.

## 4.2 `CROY-DM10-4-PRIVATE-AMENITY-AREA`

**Source:** Policy DM10.4(a–d)  
**Method:** `LOCAL_NATIVE_NUMERIC` for the explicit minimum; qualitative remainder stays judgement-led.

The controlled local baseline is:

- `5 m²` for a 1–2 person dwelling;
- `+1 m²` for each additional occupant;
- where a balcony is relied upon, minimum width/depth `1.5 m`;
- policy-specific exclusions/quality requirements still matter.

This is a legitimate native bounded check **only when the exact proposal facts exist**.

A numeric pass proves only the numeric proposition.

It does not prove:

- useful shape;
- privacy;
- good access;
- character response;
- acceptable cycle/refuse relationships;
- overall residential quality.

The DPL-RP-003 appeal history is a direct empirical reason to keep that boundary: the later scheme’s private amenity problem was not reducible to raw area alone.

### Relationship with London Plan D6

The local numeric baseline may resemble the London D6 private-outside-space baseline.

DPL-10C does **not** merge them into one obligation merely because the values overlap.

They remain:

- one London strategic obligation;
- one Croydon local obligation;
- each with its own source identity and additional conditions.

## 4.3 `CROY-DM10-4-HOST-GARDEN-RETENTION`

**Source:** Policy DM10.4(e)  
**Method:** `LOCAL_NATIVE_NUMERIC` once applicability and survey facts are known.

Where the policy applies to development in the grounds of a retained building, the host garden must retain:

- minimum length `10 m`; and
- area no less than the smaller of:
  - one-half of the existing garden area; or
  - `200 m²`.

This is a useful fact-gated native rule.

DPL-RP-003 does not currently provide title/survey-grade parcel relationships or host-garden geometry sufficient to execute it.

Current proof-case state:

`UNRESOLVED`

That is the correct result.

## 4.4 `CROY-DM10-6-NEIGHBOUR-AMENITY`

**Source:** Policy DM10.6  
**Method:** `LOCAL_DESIGN_JUDGEMENT`

The policy includes bounded spatial propositions, including the treatment of direct overlooking of private outdoor space within `10 m` perpendicular to the rear elevation of a dwelling.

DPL-10C deliberately does **not** turn the complete policy into:

```text
neighbourDistance >= 10m ? PASS : FAIL
```

The broader duty includes privacy, daylight/sunlight and amenity relationships and therefore remains judgement/evidence-led.

## 4.5 `CROY-DM25-SUDS-FLOOD`

**Source:** Policy DM25  
**Method:** `LOCAL_TECHNICAL_PLANNING_EVIDENCE`

DPL-10C records the local planning duties including:

- sustainable drainage in development;
- managing runoff close to source;
- relationship to the London Plan sustainable-drainage hierarchy;
- runoff performance ambitions;
- maintenance and multifunctionality;
- flood-risk evidence / sequential or exception-test questions where actually triggered.

This policy is **planning authority**, not Part H.

Its coexistence with DPL-08C / DPL-09C is deliberate:

```text
DM25 local planning obligation
        ≠
Part H statutory building-control obligation
        ≠
DPL-08C architectural/site-water response
        ≠
competent drainage/hydraulic design
```

The same site evidence may feed several of them without collapsing ownership.

## 4.6 `CROY-DM29-SUSTAINABLE-TRAVEL-HIGHWAY`

**Source:** Policy DM29  
**Method:** `LOCAL_DESIGN_JUDGEMENT`

This captures local sustainable-travel, highway-safety and network-impact duties at a level appropriate to the development class.

Major-development transport-document expectations are not automatically applied to a single-house proposal merely because they exist in the same policy.

## 4.7 `CROY-DM30-CAR-CYCLE-PARKING`

**Source:** Policy DM30 / Table 10.1  
**Method:** `LOCAL_TECHNICAL_PLANNING_EVIDENCE`

The adopted local policy governs local parking quality/safety/context and refers to strategic London parking standards.

DPL-10C does **not** freeze 2018-era London strategic parking-table values into the Croydon target as though they remained the current strategic layer forever.

Instead:

- the local policy remains the local obligation;
- the current London strategic target must be composed separately;
- PTAL / parking stress / access / dropped-kerb and proposal geometry remain evidence inputs where relevant.

The DPL-RP-003 appeal also demonstrates why parking history remains proposal-specific rather than a site entitlement.

---

# 5. Spatial applicability restraint — DM47

DPL-10C specifically rejects a tempting overfit:

> **“The site is in Woodside, therefore every policy clause labelled Woodside applies.”**

DM47’s substantive spatial clauses refer to named stretches of Portland Road and other defined place-specific geography.

The Woodside Green address alone does not prove those spatial clauses apply to DPL-RP-003.

Therefore:

`CROY-DM47-WOODSIDE-PLACE-SPECIFIC = HELD / NOT ADMITTED WITHOUT SPATIAL APPLICABILITY EVIDENCE`

This is an important generic borough-plugin rule:

> **Place-policy names are not applicability logic. Spatial scope must be proved from the actual policy/map/source.**

---

# 6. Proof-case planning evidence

DPL-10C keeps planning decisions in a separate evidence layer.

## `24/03598/FUL`

Controlled corpus evidence records:

- demolition of garages;
- one two-storey four-bedroom dwelling;
- off-street parking;
- permission granted in 2025.

This proves a historic external decision for that authored scheme.

It does not prove:

- current physical implementation;
- continued permission status;
- Reference House acceptability;
- generic one-house acceptability;
- current target compliance.

## `25/02151/FUL`

The later two-house scheme was refused before appeal.

Again, this is proposal-specific decision evidence.

## Appeal `6005406`

The controlled corpus currently holds public secondary summaries of the 2026 appeal rather than an Inspectorate-hosted primary decision artefact.

DPL-10C therefore keeps this evidence visibly bounded.

The recorded issues—character/appearance, future-occupier amenity/private space, and parking/highway—are useful to test the target model, but are not promoted into policy text or generic site rules.

If a future planning case relies materially on the exact Inspector’s reasoning, recover the primary decision document first.

---

# 7. DPL-RP-003 proof disposition

DPL-10C deliberately does **not** run a Reference House permission test on Woodside Green.

The proof site demonstrates target composition and missing evidence.

| Obligation | Proof-case state | Reason |
|---|---|---|
| `CROY-DM10-1-DESIGN-CHARACTER` | `UNRESOLVED / JUDGEMENT REQUIRED` | no authored Reference House site proposal/context submission exists; historical two-house harm is not transferable |
| `CROY-DM10-4-PRIVATE-AMENITY-AREA` | `UNRESOLVED` | Reference House planning occupancy + qualifying site-specific private-space facts are not frozen for this site |
| `CROY-DM10-4-HOST-GARDEN-RETENTION` | `UNRESOLVED` | exact applicability, legal parcel relationship and survey-grade garden geometry unknown |
| `CROY-DM10-6-NEIGHBOUR-AMENITY` | `UNRESOLVED / JUDGEMENT REQUIRED` | current neighbour/opening/site levels and proposal geometry absent |
| `CROY-DM25-SUDS-FLOOD` | `UNRESOLVED / EVIDENCE REQUIRED` | authoritative flood/drainage evidence and site strategy absent |
| `CROY-DM29-SUSTAINABLE-TRAVEL-HIGHWAY` | `UNRESOLVED / JUDGEMENT REQUIRED` | exact Reference House access/parking proposal absent |
| `CROY-DM30-CAR-CYCLE-PARKING` | `UNRESOLVED / EVIDENCE REQUIRED` | current strategic standard + local access/parking facts not assembled into a planning case |

No `PASS`, `FAIL` or permission prediction is earned merely by the existence of the 2025 permission.

---

# 8. London strategic composition

Croydon is not a replacement for the London strategic target.

The controlled relationship is:

```text
LON-PLAN-2021-RESIDENTIAL-DESIGN-2026-10-20
        +
CROYDON-LOCAL-PLANNING-2018-2026-10-21
        +
case-specific material considerations / evidence
        ↓
planning obligation set
```

Examples:

### Private outside space

London D6 + Croydon DM10.4 may both be due.

A single measured fact set may evaluate the bounded numeric parts of both, but the obligations keep separate IDs/source provenance.

### Design / character

London D3 and Croydon DM10 coexist.

Neither becomes a scalar and neither is automatically superseded by the other.

### Sustainable drainage

London strategic drainage hierarchy, Croydon DM25, Part H and DPL-08C can all touch the same physical proposal while remaining different authorities.

This is exactly the target-composition model DPL-05/10A intended.

---

# 9. Emerging and revoked sources remain visible

DPL-10C proves two negative source-status cases which are as important as operative policy.

## Emerging Local Plan review

Stored as:

`EMERGING_NON_OPERATIVE_AT_RESEARCH_DATE`

It is **not** used as the local policy target in this packet.

## Revoked Suburban Design Guide SPD2

Stored as:

`REVOKED_FROM_2022-07-26`

It is **not** used as current material guidance.

These records protect future compiles from source-status drift and make later target updates explicit rather than invisible.

---

# 10. DPL-12A consequence

DPL-10C earns a new **target schema instance**, not yet a runtime rewrite.

The new target uses:

`dpl.boroughPlanningSlice.v1`

Its method semantics deliberately reuse the same conceptual classes already proven by DPL-12A:

- `NATIVE_DETERMINISTIC`;
- `EXTERNAL_PLANNING_OR_ARCHITECTURAL_JUDGEMENT`;
- `EXTERNAL_EVIDENCE_AND_INSPECTION`;
- `EXTERNAL_PLANNING_DETERMINATION`.

However DPL-12A’s current fail-closed loader only admits the B2 England/London target schemas.

**DPL-10C does not widen the runtime loader in this packet.**

The post-Wave-C integration gate should test whether:

- adding `dpl.boroughPlanningSlice.v1` is a natural bounded extension of 12A; or
- the borough proof has exposed a new orchestration requirement warranting a named DPL-12 follow-up.

This keeps source modelling separate from runtime generalisation.

---

# 11. Anti-overfit — Bromley is already waiting

Bromley remains the predeclared second-borough replay.

DPL-10C therefore labels the following as **Croydon-specific target content**, not generic borough framework:

- policy IDs/names;
- DM10 numeric private-amenity formula;
- DM25 wording;
- DM29/DM30 local transport/parking duties;
- current Croydon source-status records;
- Croydon plan-review / revoked-SPD history.

The later Bromley replay must attack the generic assumptions using at least:

- backland/private-access conditions;
- tree/TPO policy/history;
- drainage-condition history;
- different local-plan / guidance source ecology;
- different proposal-history structure.

Generic abstractions which must survive Bromley include only things such as:

- typed source status;
- local + strategic target composition;
- spatial applicability;
- method class;
- evidence vs policy vs external determination separation;
- version/provenance identity.

If Bromley requires those abstractions to change materially, that is useful evidence that Croydon was overfit.

---

# 12. Red-team findings

## “The 2024/review plan is newer, so use it instead”

**REJECTED.** Newer publication is not operative target status. At 2026-10-21 the adopted 2018 Local Plan remains the controlled local development-plan source.

## “SPD2 is famous Croydon suburban guidance, so include it”

**REJECTED.** It was revoked from 26 July 2022.

## “The site had a one-house permission, therefore one house fits”

**REJECTED.** Permission belongs to an authored proposal and its evidence/time, not to the land as a reusable Boolean.

## “The later two-house refusal means the site capacity is one dwelling”

**REJECTED.** It demonstrates proposal sensitivity, not a compiler-derived unit cap.

## “DM10.4 numeric amenity space answers amenity quality”

**REJECTED.** The appeal history itself demonstrates the importance of functional/qualitative amenity judgement.

## “DM47 says Woodside, therefore it applies”

**REJECTED.** Spatial policy applicability comes from the actual policy geography, not a place-name substring.

## “DM25 and Part H are duplicate drainage rules”

**REJECTED.** One is local planning policy; one is England Building Regulations; DPL-08C is architectural/site interface; technical drainage adequacy remains specialist evidence.

## “Croydon local parking tables should replace current London strategic parking policy”

**REJECTED.** The target preserves local policy identity and composes the current strategic target rather than silently freezing historic strategic values into the borough layer.

---

# 13. Disposition

**DPL-10C PASS — the first borough planning plug-in proof is controlled without creating a planning predictor or Croydon-shaped generic engine.**

The result is:

```text
OPERATIVE LONDON STRATEGIC TARGET
              +
OPERATIVE CROYDON LOCAL TARGET
              +
EXPLICIT CASE / SITE EVIDENCE
              +
MATERIAL CONSIDERATIONS / EXTERNAL DECISIONS
              ↓
TYPED PLANNING OBLIGATIONS
```

not:

```text
SITE HAS PRIOR PERMISSION
              ↓
PLANNING PASS
```

No Reference House geometry is changed. No DPL-RP-003 permission outcome is predicted. No whole-Croydon compliance claim is made.

**Next adversarial borough:** Bromley remains held until the post-Wave-C gate decides whether the Croydon abstraction is ready to be attacked.