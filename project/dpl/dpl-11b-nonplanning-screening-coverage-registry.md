# DPL-11B — Non-Planning SCREENING Family Coverage Registry

**Issue:** [#430 — DPL-11B — non-planning SCREENING family coverage registry](https://github.com/adamnoden/architecture/issues/430)  
**Programme:** [#299 — DPL](https://github.com/adamnoden/architecture/issues/299)  
**Authorised by:** [DPL-E / #426](dpl-e-post-13a-review.md)  
**Baseline `main`:** `541766736ff491feb5c025cb7a55b5680d6e6ab1`  
**Disposition:** **PASS — non-planning due-diligence families are machine-readable at SCREENING while every substantive legal/professional/provider determination remains external**

## 1. Question

> **Can the deployment system know exhaustively which non-planning due-diligence families exist, when they are normally due at SCREENING, what facts accelerate them, and which external authority/evidence route owns resolution—without pretending the compiler can itself clear title, utilities, sewer, ground or neighbour-process risk?**

**Yes.**

DPL-11B turns DPL-11's conceptual due-diligence model into a controlled family coverage registry.

It does not perform due diligence.

The controlling distinction is:

> **A family can be represented in coverage without its external proposition being resolved.**

---

## 2. Controlled artefacts

### Registry

`project/dpl/coverage/dpl-11-nonplanning-screening-coverage-v1.json`

Schema:

`dpl.nonPlanningScreeningCoverageRegistry.v1`

Identity:

`DPL-11-NONPLANNING-SCREENING-COVERAGE-v1`

### Loader / validator

`compiler/dpl/nonplanning-coverage.ts`

### Regression proof

`compiler/dpl/dpl11b.test.ts`

---

## 3. Controlled family universe

The registry contains ten bounded non-planning family groups.

### `DPL11-COV-SITE-CONTROL`

Credible site-control / ownership-interest identity sufficient to know what land is being screened.

### `DPL11-COV-LEGAL-BOUNDARY-TITLE`

Precise title extent, legal boundary and detailed title evidence.

### `DPL11-COV-PRIVATE-RIGHTS`

Restrictive covenants, easements, rights of way/access, service rights, wayleaves and related private constraints.

### `DPL11-COV-NEIGHBOUR-PRIVATE-PROCESS`

Party Wall etc. Act and related neighbour/private process dependencies where applicable.

### `DPL11-COV-SEWER-UNDERTAKER`

Public sewer location/depth/capacity, connection rights, undertaker process and related build-over/diversion/easement constraints.

### `DPL11-COV-UTILITIES`

Utility capacity, exact routes, connection feasibility, diversions and rights/easements.

### `DPL11-COV-GROUND-ENVIRONMENT`

Ground profile, bearing, groundwater, contamination, gas/radon, buried obstructions and material tree-ground interaction.

### `DPL11-COV-PHYSICAL-FLOOD-WATER`

Physical flood/water condition outside planning-policy abstraction.

### `DPL11-COV-ACCESS-STATUS`

Physical and legal site-access status at the level relevant to early deployment screening.

### `DPL11-COV-CONSTRUCTION-LOGISTICS`

Detailed temporary access, working territory, scaffold/tower/crane/oversailing/highway occupation and construction logistics.

The registry deliberately remains at authority-family scale.

It does not explode these families into pseudo-legal micro-rules merely because JSON can represent them.

---

## 4. SCREENING timing

DPL-11B preserves DPL-04's timing discipline.

### Due now

Three high-level families are represented as current SCREENING coverage:

- site-control identity;
- physical flood/water screening;
- physical/legal access status.

These are capable of containing early fatal or strongly geometry-shaping facts.

Their current evidence may still be assumed/unknown/external.

`DUE_NOW_REPRESENTED` means the family/evidence route is in the declared scope—not that it passed.

### Future due

Detailed:

- title/legal boundary;
- private rights;
- neighbour/private process;
- sewer/undertaker work;
- utilities;
- ground/geotechnical/environment evidence;
- construction logistics;

remain normally `FUTURE_DUE` at SCREENING.

They do not disappear.

When they become due, unresolved/missing evidence blocks positive compatibility.

### Acceleration

Each future-due family carries bounded decision-critical trigger descriptions.

Examples include:

- known title/boundary ambiguity;
- known covenant/easement/ransom-strip/access-right problem;
- boundary/proximity/excavation condition making neighbour process material;
- known sewer route/capacity/build-over/easement problem;
- known utility capacity/network/right problem;
- known tree/ground/mining/contamination/groundwater problem;
- obviously constrained construction access/working space.

The registry stores these as trigger metadata only.

It does not self-activate them.

---

## 5. DPL-RS-01 mappings preserve provenance

DPL-11B maps the already-controlled Reference Site claim ids into relevant non-planning families.

This mapping is a **reference relationship only**.

It never converts a claim into evidence discharge.

Examples:

### title/control

`RS-TITLE-CONTROL-01`

is an authored synthetic `ASSUMED` claim.

The registry explicitly states:

> a synthetic assumption can exercise the family but is not real title/control evidence.

### ground

`RS-GROUND-01`

remains:

```text
state = UNKNOWN
basis = UNKNOWN
```

while `RS-TREE-01` remains an authored synthetic assumption.

Neither becomes a geotechnical/arboricultural determination merely because both are referenced by the ground family.

### sewer

`RS-SEWER-STREET-01` remains only the assumption that foul sewer serves the street context.

`RS-SEWER-DETAIL-01` remains unknown.

The registry refuses to infer:

- route;
- depth;
- capacity;
- connection rights;
- easement status;
- undertaker approval.

### utilities

Street-context electricity/water/data assumptions remain distinct from `RS-UTIL-CAP-01` unknown capacity/routes.

### flood/water

`RS-FLOOD-01` and `RS-SW-01` remain explicit unknowns where authored that way.

This is the right epistemic behavior.

---

## 6. Resolution authority remains external

DPL-11B uses a bounded authority vocabulary including:

- `TITLE_OR_LEGAL_EVIDENCE`;
- `SURVEY_EVIDENCE`;
- `UTILITY_OR_UNDERTAKER_EVIDENCE`;
- `GEOTECHNICAL_OR_ENVIRONMENTAL_EVIDENCE`;
- `ARBORICULTURAL_EVIDENCE`;
- `STATUTORY_PRIVATE_PROCESS`;
- `LOGISTICS_OR_METHOD_PLAN`;
- `NATIVE_APPLICABILITY_ONLY`;
- `EXTERNAL_FLOOD_OR_WATER_EVIDENCE`;
- `HIGHWAY_OR_ACCESS_EVIDENCE`.

These labels identify who/what must resolve a proposition.

They do not mean resolution has occurred.

The compiler remains unable to:

- issue a title opinion;
- waive a covenant;
- create an easement/right of way;
- determine Party Wall applicability without facts;
- grant neighbour consent;
- confirm sewer/utility capacity or rights;
- perform geotechnical/flood/arboricultural assessment;
- author a logistics method plan.

---

## 7. Owner boundaries remain explicit

DPL-11B avoids absorbing adjacent authority.

### sewer / water

```text
DPL-11 external sewer/undertaker evidence
        ≠
DPL-09 Part H technical obligation
        ≠
DPL-08C building↔site water interface
        ≠
DPL-10 planning SuDS/flood policy
```

### ground / trees

```text
DPL-11 physical ground / tree-ground evidence
        ≠
DPL-09 Part A/C obligations
        ≠
DPL-10 planning tree/TPO policy/status
        ≠
DPL-08 foundation interface freedom
```

### access

```text
DPL-11 physical/legal access evidence
        ≠
DPL-08B architectural approach/threshold interface
        ≠
DPL-10 planning/highway judgement
```

This separation is why the family registry is useful to a later generic coverage composer.

---

## 8. Missing evidence never means not applicable

DPL-11B statically permits no family to use:

`NOT_APPLICABLE_PROVED`

The validator rejects that state in this registry.

This is intentional because these non-planning families are highly fact-sensitive.

Absence of:

- title evidence;
- sewer record;
- utility response;
- ground report;
- neighbour/process evidence;

is not evidence that the corresponding family is irrelevant.

---

## 9. Identity / drift proof

The registry canonicalises:

- family order;
- authority-source order;
- resolution-authority order;
- Reference Site claim-reference order;
- owner-boundary order;
- acceleration-trigger order.

Syntactic reordering does not change identity.

Material changes do.

Changing:

- default SCREENING timing;
- resolution authority;
- family mapping;
- blocking posture;

changes the registry fingerprint.

The underlying authority-source set is fingerprinted separately.

---

## 10. Handoff to DPL-F

A generic SCREENING coverage composer may safely assume from DPL-11B that:

1. the current non-planning due-diligence family universe is machine-readable at bounded owner-family level;
2. site claim references retain their original ASSUMED / DERIVED / UNKNOWN provenance;
3. claim presence is not evidence discharge;
4. site control, high-level flood/water and access-status are current screening families;
5. detailed title/private-right/sewer/utility/ground/logistics work is normally future due but remains visible;
6. acceleration requires explicit admitted case facts;
7. resolution authority remains external;
8. no missing evidence produces static not-applicability;
9. owner boundaries with DPL-08/09/10 remain explicit;
10. registry coverage carries no PASS, discharge or whole-site result.

DPL-F can therefore reason about family completeness/timing without asking DPL-11B to impersonate solicitors, engineers, utilities or statutory processes.

---

## 11. Closeout

**DPL-11B PASS.**

The major non-planning coverage gap exposed by DPL-13A is now structurally representable without false automation.

The compiler can know that a title, sewer, utility, ground or access question belongs to the declared deployment scope—and whether it is current/future/accelerated—while still saying:

> **the answer belongs to external evidence and is not mine to invent.**
