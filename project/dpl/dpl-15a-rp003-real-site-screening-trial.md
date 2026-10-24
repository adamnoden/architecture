# DPL-15A — DPL-RP-003 Real-Site Screening Manifest / Coverage Trial

**Issue:** #532  
**Admitted by:** DPL-M #530 / PR #531  
**Site:** DPL-RP-003 — Rear of 73A and 73B Woodside Green, South Norwood, SE25 5HU  
**Borough:** Croydon  
**Assurance profile:** `SCREENING`  
**Status:** implementation candidate; exact-head validation required

## 1. Result

The first real-site DPL trial is deliberately an evidence/coverage result, not a deployment conclusion.

The frozen DPL-14B RP-003 record can be represented deterministically as:

```text
site kind                    = REAL
real claims                  = 15 / 15 represented
real claims mapped           = 15 / 15
synthetic RS-* ids reused    = 0
candidate authoring          = NOT_AUTHORED_INSUFFICIENT_GEOMETRY
COMPATIBLE                   = NOT_ADMITTED
INCOMPATIBLE                 = NOT_ADMITTED
route exhaustion             = NOT_IMPLEMENTED
Reference House mutation     = NOT_AUTHORISED
```

This is the intended first contact with reality: the system can represent what is known, historical, externally judged, partially evidenced and unknown without pretending that those categories are interchangeable.

## 2. Authority

The packet consumes only the already-frozen DPL-14B corpus record:

```text
project/dpl/sites/dpl-rp-003-rear-73a-73b-woodside-green-croydon.md
research date = 2026-10-20
git blob      = fb1c01a5e28044eda9ac275c2881082bb1917826
```

No current web research is silently mixed into this manifest.

The machine manifest is:

```text
project/dpl/sites/dpl-rp-003-trial-manifest-v01.json
```

The loader refuses changed corpus-authority bytes.

## 3. Real evidence vocabulary

DPL-15A preserves eight distinct evidence states from the admitted corpus rather than flattening them into a boolean `known` flag:

- `KNOWN_AT_SCREENING`;
- `HISTORICAL_PUBLIC_RECORD`;
- `EXTERNAL_PLANNING_DECISION_EVIDENCE`;
- `EXTERNAL_PLANNING_JUDGEMENT_EVIDENCE`;
- `UNKNOWN_AT_ADMITTED_EVIDENCE`;
- `UNKNOWN_AT_SURVEY_OR_TITLE_PRECISION`;
- `PARTIALLY_EVIDENCED_NOT_SURVEYED`;
- `UNKNOWN`.

The 15 claims therefore preserve materially different epistemic meanings.

In particular `RP003-C03` remains:

```text
historical garage/redevelopment evidence
current physical state = UNKNOWN
```

The validator rejects any attempt to convert that historical record into current physical truth without new authority.

## 4. Planning history remains proposal-specific

The manifest records:

- `RP003-C04` — historical one-house permission `24/03598/FUL`;
- `RP003-C05` — later two-house refusal / appeal dismissal;
- `RP003-C06` — proposal-specific character/massing judgement evidence;
- `RP003-C07` — proposal-specific qualitative private-amenity judgement evidence;
- `RP003-C08` — proposal-specific parking/highway judgement evidence.

These map into planning owner families, including the external-determination/history family, without producing any site-level planning pass.

DPL-15A does not infer:

- one dwelling is generically acceptable;
- the earlier permission remains live or implemented;
- the Reference House is acceptable;
- the appeal outcome predicts the Reference House outcome;
- technical/site evidence was discharged by planning permission.

## 5. Real claims map to owner families, not synthetic ids

The real claim ids remain `RP003-C01` through `RP003-C15`.

They are explicitly mapped to current planning/non-planning coverage families. Multi-owner mapping is normal because one real-world condition can feed several authority domains.

Examples:

```text
RP003-C06 character/massing evidence
  → PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
  → PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY

RP003-C11 access evidence/unknowns
  → NON_PLANNING:DPL11-COV-ACCESS-STATUS
  → NON_PLANNING:DPL11-COV-PRIVATE-RIGHTS
  → PLANNING:DPL10-COV-TRANSPORT-ACCESS-HIGHWAY-PARKING

RP003-C14 ground/drainage/utilities/sewers unknown
  → NON_PLANNING:DPL11-COV-GROUND-ENVIRONMENT
  → NON_PLANNING:DPL11-COV-SEWER-UNDERTAKER
  → NON_PLANNING:DPL11-COV-UTILITIES
  → NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER
  → PLANNING:DPL10-COV-FLOOD-DRAINAGE-SUDS-PLANNING
```

Every mapping id is validated against the current controlled registries.

## 6. Synthetic DPL-13B vocabulary does not generalise automatically

DPL-13B's synthetic Reference-Site claim universe contains fixture-specific propositions such as:

- synthetic rectangular parcel geometry;
- a declared cardinal coordinate frame;
- an already-authored Reference House transform;
- derived side and garden clearances;
- synthetic street-edge assumptions.

The RP-003 real claims have **zero id intersection** with that synthetic vocabulary.

DPL-15A therefore freezes:

```text
directDPL13BReuse = NOT_ADMITTED_SYNTHETIC_CLAIM_VOCABULARY
requiredNextAbstraction = REAL_CLAIM_TO_OWNER_FAMILY_ADAPTER_IF_EARNED
```

This is not a failure of the real-site trial. It is a useful discovery about where the current canonical coverage machinery is still fixture-coupled.

## 7. Candidate authoring is refused

The admitted evidence is insufficient to author one Reference House placement without guessing.

The trial state is:

```text
NOT_AUTHORED_INSUFFICIENT_GEOMETRY
```

The packet names the missing evidence explicitly:

1. authoritative legal or survey parcel boundary geometry;
2. authoritative frontage/depth/shape sufficient to test the 12.0 m × 10.8 m Reference House footprint;
3. a reliable site coordinate/orientation frame tied to the real parcel;
4. surveyed site levels/topography sufficient to author a ground-floor datum;
5. surveyed physical access geometry and street/approach relationship;
6. title/control relationship sufficient to know the land on which placement is being authored.

No geometry is reverse-engineered from screenshots, marketing maps or approximate web polygons.

## 8. Exact planning authority

The real-site trial reuses the already-controlled authority edge:

```text
LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20
  → CROYDON-LOCAL-PLANNING-2018-2026-10-21
```

The validator fails closed if that Croydon → London parent relation changes.

No new borough target is authored.

## 9. Adversarial proof

The DPL-15A executable tests prove:

- exactly fifteen real claims exist, once each;
- all fifteen carry at least one valid owner-family mapping;
- the evidence-state vocabulary remains explicit;
- historical evidence cannot become current physical truth;
- missing, duplicate or synthetic claim ids fail closed;
- unknown coverage-family ids fail closed;
- claim/source/mapping order is identity-neutral;
- material evidence or mapping mutation changes identity;
- all current owner mappings are live registry ids;
- no `RS-*` claim is introduced;
- Croydon → London authority remains exact;
- candidate authoring remains refused and missing evidence is named;
- no compatibility, incompatibility, route-exhaustion, planning-likelihood or purchase result leaks into the packet.

## 10. Programme consequence

DPL has now proved a stronger proposition than the synthetic fixtures alone could establish:

> **Real evidence can enter the deployment system without being coerced into the synthetic Reference-Site ontology and without uncertainty being erased for the convenience of candidate generation.**

The most material result is negative but useful: the current admitted public corpus is **not sufficient to author a controlled Reference House placement on RP-003**.

That means the next packet should not be DPL-15B candidate evaluation by default.

## 11. Next gate

A post-DPL-15A gate should decide whether the most valuable next action is:

- bounded public-evidence acquisition from authoritative planning documents;
- explicit survey/title evidence requirements that cannot be satisfied from public records;
- a reusable real-claim → owner-family adapter earned from this trial;
- or candidate authoring only if better evidence legitimately closes the geometry gap.

The gate must not treat the existence of historic planning drawings as permission to infer title or survey precision without checking their actual authority and dimensional content.
