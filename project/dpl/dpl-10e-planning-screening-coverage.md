# DPL-10E — London planning SCREENING coverage registry

**Issue:** #456  
**Programme:** #299  
**Authorising gate:** DPL-F / #434  
**Baseline `main`:** `d4bd6f4f4edb9e3cf12a054ad83041d3bfdcd9c7`  
**Review date:** 2026-10-22  
**Status:** **PASS — planning owner universe is machine-readable at SCREENING coverage level; no planning determination or whole-site conclusion is implied**

## Decision

> **PASS — DPL-10 now has an owner-side SCREENING coverage registry sufficient for DPL-G to re-test cross-owner coverage completeness.**

DPL-10E closes the missing owner-side coverage seam identified by DPL-F.

It does **not** close planning itself.

The distinction is deliberate:

```text
planning family exists + is represented in coverage
    ≠
policy requirement discharged
    ≠
planning judgement favourable
    ≠
planning permission likely
    ≠
planning permission granted
```

DPL-10E gives later composition machinery an exhaustive current family inventory, explicit source/status semantics, bounded resolution classes, controlled target mappings, canonical Reference Site claim references and a first-class no-borough state.

It does not turn DPL-10 into a planning rules engine.

---

# 1. Authority recovered

The registry is derived only from the controlled DPL-10 authority:

- `dpl-10-london-planning-target-inventory.md`;
- `dpl-10a-planning-source-status-spine.md`;
- `dpl-10b-london-strategic-residential-design.md`;
- `dpl-10c-croydon-planning-plugin.md`;
- `dpl-10d-bromley-adversarial-replay.md`;
- DPL-04 SCREENING profile semantics;
- current London/Croydon/Bromley target artefacts;
- DPL-RS-01 only for controlled canonical claim references.

No new planning-policy research was added merely to make software structure symmetrical.

The registry authority set is fingerprinted independently from registry semantics so later source edits invalidate the loaded coverage authority even if the registry JSON itself is unchanged.

---

# 2. Frozen planning coverage universe

The current DPL-10 owner universe is represented as **16 families**.

## 1. Source composition / status

Owns the distinction among:

- national material considerations;
- operative London development-plan policy;
- adopted London guidance;
- operative borough/local development-plan policy;
- adopted borough guidance/SPD material;
- emerging/non-operative policy;
- application evidence;
- external statutory determination.

This family is due at SCREENING because target/source authority must be identifiable before any policy result can mean anything.

It does not resolve policy conflicts or planning balance.

## 2. Strategic design / context / capacity

Owns strategic design-led/context/site-capacity questions represented in part by the current London target.

The existing target remains explicitly **partial**.

## 3. Housing quality / accessibility

Owns planning housing-quality, strategic space/private-amenity and planning-triggered accessibility questions.

Planning selection of an optional accessibility category remains distinct from DPL-09 / Part M technical discharge.

## 4. Neighbour amenity / privacy / daylight-sunlight

Owns public-law planning effects on neighbouring occupiers.

Private rights / neighbour process remain DPL-11 authority.

## 5. Transport / access / highway / parking

Owns planning transport, highway-safety, access and parking policy questions.

Physical/legal access remains DPL-11; approach/interface geometry remains DPL-08.

## 6. Heritage designation / setting

Owns heritage applicability and planning effects on significance/setting.

The canonical site's no-designation proposition is only `ASSUMED`; DPL-10E explicitly refuses to promote it into `NOT_APPLICABLE_PROVED`.

## 7. Trees / landscape / urban greening

Owns planning tree/designation/landscape/greening consequences.

Arboricultural and ground evidence remain DPL-11.

## 8. Ecology / biodiversity / green infrastructure

Owns planning ecology/biodiversity/green-infrastructure families.

The canonical ecology claim remains `UNKNOWN`.

## 9. Flood / drainage / SuDS planning

Owns planning flood-risk/SuDS/water-policy questions.

This remains separate from:

- DPL-09 Part H;
- DPL-11 physical flood/water evidence;
- DPL-08 site-water interfaces.

## 10. Air quality / noise / agent of change

Owns environmental planning noise/air-quality/sensitive-receptor questions.

The canonical external-noise claim remains `UNKNOWN`.

Part E acoustic compliance is not substituted for planning noise policy.

## 11. Energy / carbon / sustainability planning

Owns planning energy/carbon/sustainability policy questions while DPL-09 retains technical Building Regulations authority.

## 12. Local quantitative policy

Owns borough-specific explicit numeric policy only after real local authority / source applicability is known.

Croydon and Bromley are examples, not a universal local ruleset.

## 13. Local qualitative / evidence policy

Owns borough-specific character, backland, amenity, trees, road-safety, flood and similar judgement/evidence families.

Again, two boroughs prove an envelope, not one policy ontology.

## 14. Validation / process / specialist evidence

Owns planning application-validation/evidence-route coverage.

It does not manufacture specialist reports or validate an application.

## 15. Emerging policy / material weight

Owns explicit emerging/non-operative source status and the fact that material weight remains a planning judgement.

No scalar weight is created.

## 16. External determination / history / conditions

Owns P6 evidence only:

- permission;
- refusal;
- appeal/history;
- conditions;
- other competent statutory determination evidence.

It is `EXTERNAL_ONLY`.

---

# 3. Source/status separation

DPL-10E preserves DPL-10A's central source rule:

> **planning source composition is not list-order inheritance and not “newer wins”.**

The registry uses separate controlled source classes for:

- `NATIONAL_MATERIAL_CONSIDERATION`;
- `LONDON_DEVELOPMENT_PLAN_POLICY`;
- `LONDON_ADOPTED_GUIDANCE`;
- `BOROUGH_DEVELOPMENT_PLAN_POLICY`;
- `BOROUGH_ADOPTED_GUIDANCE`;
- `EMERGING_NON_OPERATIVE_POLICY`;
- `PLANNING_APPLICATION_EVIDENCE`;
- `EXTERNAL_STATUTORY_DETERMINATION`;
- source/status control records.

The explicit class distinction prevents guidance or emerging policy from gaining operative development-plan status merely because it appears in the registry.

The emerging-policy family is deliberately judgement-led rather than P3 numeric.

---

# 4. P1–P6 planning resolution classes

DPL-10E preserves the existing determinism boundary:

- `P1_SITE_PROJECT_FACT`;
- `P2_MECHANICAL_APPLICABILITY`;
- `P3_BOUNDED_QUANTITATIVE_POLICY`;
- `P4_EVIDENCE_LED_TECHNICAL_PLANNING_ASSESSMENT`;
- `P5_QUALITATIVE_PLANNING_JUDGEMENT`;
- `P6_STATUTORY_DETERMINATION`.

The validator adds one hard executable lock:

> **Any family containing P6 must be `EXTERNAL_ONLY`, must contain P6 alone, and therefore cannot mix P6 with P1–P5 native/judgement coverage.**

This blocks the most dangerous planning overclaim structurally rather than editorially.

No P1–P5 path can become planning permission.

---

# 5. Existing target reconciliation

The registry validates the current target artefacts against exact identities:

- `LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20`;
- `CROYDON-LOCAL-PLANNING-2018-2026-10-21`;
- `BROMLEY-LOCAL-PLANNING-2019-2026-10-22`.

Target identity drift fails closed.

## London strategic target

Mapped only as:

`STRATEGIC_TARGET_SLICE_PARTIAL`

for the bounded strategic families it actually represents.

It is not the complete London planning target.

## Croydon / Bromley

Mapped only as:

`BOROUGH_EXEMPLAR_PARTIAL`

for relevant local families.

The common abstraction remains source/status/method/evidence composition. Substantive local policy remains borough-specific.

## Known target-link debt surfaced, not rewritten

The existing Croydon/Bromley artefacts retain a historical textual `parentStrategicTargetId` that does not match the actual current London strategic target ID string.

DPL-10E does **not** silently rewrite those target artefacts because this packet owns coverage, not target-history repair.

The coverage registry instead validates and fingerprints the actual three controlled target identities directly.

DPL-G must decide whether the stale parent-link string matters to conclusion-readiness composition and, if so, return it to the owning target packet as a bounded repair.

---

# 6. Canonical Reference Site planning mapping

DPL-RS-01 remains:

`SYNTHETIC_REFERENCE`

with:

`NO_REAL_BOROUGH_ASSIGNED`

and an empty local-target set.

The validator rejects any registry instance that tries to assign a local planning target while that state is active.

This is stronger than a comment: the synthetic site cannot silently become Croydon or Bromley.

## Consequential mappings

The registry explicitly maps:

- `RS-HERITAGE-01` → heritage;
- `RS-NOISE-01` → air-quality/noise/agent-of-change;
- `RS-ECO-01` → ecology/biodiversity/green infrastructure;
- `RS-NBR-*` → neighbour amenity/privacy/daylight;
- `RS-TREE-*` → trees/landscape planning;
- `RS-FLOOD-01`, `RS-SW-01`, `RS-GROUND-01` → planning flood/SuDS;
- `RS-ACCESS-01`, `RS-STREET-01`, `RS-TOPO-01` → transport/access/highway;
- parcel/frame/placement/garden geometry → design/context/capacity.

Every mapped claim id is validated against the current DPL-RS-01 manifest.

A reference is not discharge evidence.

The canonical states survive:

- heritage no-designation: `ASSUMED` / authored fixture proposition;
- external noise: `UNKNOWN`;
- ecology/habitat: `UNKNOWN`.

---

# 7. Multi-owner facts remain multi-owner

DPL-10E deliberately does not deduplicate site facts across authorities.

Examples:

```text
neighbour geometry
  → DPL-10 planning amenity/privacy/daylight
  → DPL-11 neighbour/private process

trees / roots
  → DPL-10 tree/landscape policy
  → DPL-11 arboricultural/ground evidence

flood / surface water / ground
  → DPL-10 planning flood/SuDS
  → DPL-09 Part H technical target
  → DPL-11 physical flood/water evidence
  → DPL-08 site-water interface

access / street / topography
  → DPL-10 transport/highway planning
  → DPL-11 physical/legal access
  → DPL-08 approach/interface
```

That overlap is correct.

One site fact may support several differently owned obligations without merging their authority.

---

# 8. SCREENING timing

DPL-04 remains authoritative.

The registry therefore distinguishes family coverage from detailed planning assessment.

At SCREENING:

- source/status composition is due now;
- coarse strategic design/context/site-capacity representation is due now;
- many detailed planning families remain `FUTURE_DUE` unless a credible site fact accelerates them;
- local-family due classification remains unresolved on the synthetic fixture because no real borough is assigned;
- emerging source status is represented now while material weight remains judgement-led;
- P6 statutory determination is normally future/external.

Acceleration trigger text is metadata only.

DPL-10E does not parse trigger prose into executable rules.

---

# 9. Executable proof

The regression suite proves:

1. exactly 16 controlled family ids exist;
2. duplicate/missing ids fail closed;
3. source-status/applicability/disposition/P1–P6/implementation vocabularies fail closed;
4. the London strategic target is partial coverage, never complete planning;
5. Croydon/Bromley remain bounded exemplars;
6. the canonical no-borough state is explicit and rejects hidden local-target assignment;
7. heritage/noise/ecology mappings preserve `ASSUMED` / `UNKNOWN` site states and cannot create result fields;
8. multi-owner boundaries remain explicit;
9. emerging policy stays non-operative and judgement-led;
10. P6 is structurally quarantined from P1–P5;
11. ordering is identity-neutral;
12. semantic coverage changes are identity-bearing;
13. unknown vocabulary and uncontrolled target ids fail closed;
14. the registry has no planning-permission or whole-site conclusion field.

The loader also fingerprints independently:

- registry semantics;
- authority source set/content;
- canonical Reference Site claim-id set;
- current planning target identity set.

---

# 10. What DPL-G may now assume

After DPL-10E lands, DPL-G may assume that all four current owner-side SCREENING universes are machine-readable:

- DPL-02C — Reference House conformance;
- DPL-09D — England technical/process;
- DPL-10E — planning;
- DPL-11B — non-planning due diligence.

It may also assume:

- DPL-RS-01's no-borough state is explicit rather than omitted;
- planning claim mappings are references, not discharge;
- detailed planning judgement remains future/external where appropriate;
- P6 is external only;
- planning families can share site claims with DPL-08/09/11 without authority transfer.

DPL-G must still determine whether these four owner universes are jointly sufficient for a generic coverage/readiness composer.

DPL-G must specifically attack:

- the stale borough→strategic parent-id string;
- whether local-borough absence is represented strongly enough for `COVERAGE_COMPLETE_FOR_PROFILE` versus `COVERAGE_UNRESOLVED`;
- how opaque acceleration triggers become `REVIEW_REQUIRED` rather than executable pseudo-rules;
- whether any DPL-RS-01 claim remains outside all relevant owner families;
- whether coverage completeness can be implemented without yet emitting a whole-site `UNRESOLVED` conclusion.

---

# 11. Proof boundary

DPL-10E does **not** establish:

- planning permission likelihood;
- planning permission;
- favourable planning balance;
- acceptable heritage/amenity/ecology/noise judgement;
- complete London strategic policy compliance;
- complete borough policy compliance;
- whole-site `COMPATIBLE`;
- whole-site `UNRESOLVED`;
- whole-site `INCOMPATIBLE`;
- route exhaustion;
- real-site deployment validity.

No Reference House geometry changes.

No DRW changes.

---

# 12. Next authorised gate

After DPL-10E merges:

> **DPL-G — post-planning-coverage integration and DPL-13B admission gate.**

DPL-13B remains held until DPL-G explicitly admits it.