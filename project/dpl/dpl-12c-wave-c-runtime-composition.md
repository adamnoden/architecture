# DPL-12C — Wave-C Runtime Composition

**Issue:** [#418 — DPL-12C — compose Wave-C water, borough and eight-site corpus through deployment runtime](https://github.com/adamnoden/architecture/issues/418)  
**Programme:** [#299 — DPL](https://github.com/adamnoden/architecture/issues/299)  
**Authorised by:** DPL-C / #412, landed through PR #413  
**Depends on:** DPL-12B / #414, DPL-10D / #415, DPL-08C / #399, DPL-09C / #400, DPL-10C / #401, DPL-14C / #402  
**Baseline `main`:** `d51cce068abaa5aef593e4cf43ff1247aa53d4c0`  
**Implementation PR:** #419  
**Disposition:** **PASS — actual Wave-C water, borough and eight-site corpus objects compose through the existing deterministic deployment runtime without widening whole-site conclusion authority**

## 1. Question

> **Can the actual landed Wave-C water, borough-planning and eight-site corpus objects execute through the same deterministic deployment runtime as DPL-12B's authored candidate/conformance seam without inventing generic borough policy, drainage design or whole-site compatibility authority?**

**Yes, at the bounded DPL-12C scope.**

DPL-12C does **not** replace `compileDeploymentCase` and does not create a second evaluator. It adds a bounded composition adapter that validates the two new Wave-C envelopes which DPL-12A never claimed to understand:

- the controlled eight-site corpus index;
- the borough-planning target envelope proved independently by Croydon and Bromley.

It then supplies those controlled objects, the DPL-08C interface identity and the DPL-09C England drainage target to the existing deployment compiler.

This is preferable to widening the generic DPL-12A loader prematurely. The common semantics earned by Wave C are now explicit without pretending that one generic parser owns every future DPL source family.

---

## 2. Composition architecture

```text
DPL-CORPUS-1 current index
        │
        ├── exact index-entry identity
        └── exact controlled site-record identity

borough planning target
        │
        ├── Croydon OR Bromley
        ├── dpl.boroughPlanningSlice.v1 envelope
        └── borough-local obligation families remain local

DPL-08B + DPL-08C interfaces
DPL-09B + DPL-09C England targets
London strategic planning target
DPL-12B authored candidate + RH conformance
        │
        ▼
Wave-C composition adapter
        │
        ▼
existing compileDeploymentCase
        │
        ▼
deterministic obligation / evidence / conformance ledger
```

The adapter is in:

- `compiler/dpl/wavec.ts`

Its proof is in:

- `compiler/dpl/dpl12c.test.ts`

---

## 3. Eight-site corpus result

DPL-14C changed the authoritative corpus index from the original pilot schema to:

`dpl.realSiteIndex.v1`

with eight admitted site records across seven boroughs.

DPL-12C validates that schema independently rather than coercing it into the old `dpl.realSitePilotIndex.v1` parser.

The runtime preserves:

- stable site id;
- display identity;
- borough;
- admission state;
- record path;
- challenge tags;
- exact index-entry fingerprint;
- exact controlled record fingerprint.

It fails closed on:

- unsupported corpus schema;
- duplicate site ids;
- missing required index fields;
- unadmitted site ids;
- unreadable controlled records.

### Critical boundary: no prose mining

The current Corpus 1 index does **not** expose the pilot index's `decisionCriticalUnknowns` field or a claim-level site model.

DPL-12C therefore does not parse site-record prose or challenge tags into machine facts merely to preserve an old output shape.

The adapter records explicitly:

`claimLevelUnknownsExposedByIndex = false`

The normalized input supplied to the existing compiler carries no invented site unknown ids.

This is a real limitation, not missing implementation polish. A later whole-site conclusion cannot claim due-site-evidence completeness until a controlled claim-level representation exists or another bounded mechanism proves completeness.

---

## 4. Borough-planning result

DPL-10D established that Croydon and Bromley justify one narrow common envelope:

`dpl.boroughPlanningSlice.v1`

DPL-12C validates only that envelope:

- exact target id;
- declared borough;
- parent strategic target identity;
- method classes;
- source snapshots;
- obligations and their source references;
- duplicate-id integrity.

It does **not** require matching policy families.

The runtime therefore preserves materially different local targets:

### Croydon

Examples include:

- `CROY-DM10-1-DESIGN-CHARACTER`;
- `CROY-DM10-4-PRIVATE-AMENITY-AREA`;
- `CROY-DM25-SUDS-FLOOD`.

### Bromley

Examples include:

- `BROM-P3-BACKLAND-GARDEN`;
- `BROM-P8-SIDE-SPACE`;
- `BROM-P73-TREES`;
- `BROM-P30-PARKING`;
- `BROM-P115-P116-FLOOD-SUDS`.

No Croydon obligation is required to exist in Bromley and vice versa.

### Policy 30 remains an anti-overfit lock

Bromley Policy 30 deliberately declares:

`LOCAL_POLICY_CONFLICT_UNRESOLVED -> UNSUPPORTED`

DPL-12C preserves that method class through runtime evaluation.

The compiler does not execute the 2019 local parking table as current truth merely because it is numeric and machine-readable. The London Plan 2021 / local-policy temporal and conflict relationship remains unresolved authority work.

This is exactly the behaviour DPL-10D was intended to earn.

---

## 5. Water vertical result

DPL-12C composes the actual Wave-C water objects rather than adding another synthetic drainage model.

### Architectural / site interface

`DPL-08C-FOUL-SURFACE-SITE-WATER`

is fingerprinted from:

`project/dpl/dpl-08c-foul-surface-site-water-interface.md`

It records the building↔land handoff authority without designing a route.

### England technical target

`ENG-BC-DRAINAGE-WASTE-WATER-2026-10-21`

from DPL-09C now composes alongside the earlier England target.

Its obligations include H1–H5 drainage/waste-water questions and preserve external drainage, network, ground/infiltration and environmental evidence as external where required.

### Local planning water duty

The same deployment case may simultaneously contain, for example:

- `ENG-BR-H3-1-ROOF-RAINWATER` — England Building Regulations authority;
- `BROM-P115-P116-FLOOD-SUDS` — Bromley local planning authority;
- DPL-08C — architectural/site-interface authority.

For Croydon the corresponding local planning family includes `CROY-DM25-SUDS-FLOOD`.

These remain separate obligation/result identities.

There is no:

- `drainagePass`;
- selected discharge destination;
- sewer-capacity inference;
- infiltration assumption;
- hydraulic sizing;
- roof/water topology mutation.

Shared physical subject matter is not shared authority.

---

## 6. Candidate / Reference House conformance survives composition

DPL-12B remains the only owner of candidate/conformance evaluation.

DPL-12C proves that:

- target ordering does not alter candidate conformance;
- interface ordering does not alter candidate conformance;
- changing Croydon ↔ Bromley target composition does not rewrite the authored candidate;
- changing site composition does not rewrite the authored candidate;
- candidate identity remains fingerprinted independently of site/target results;
- a non-conforming candidate still does not create site `INCOMPATIBLE`.

The composition adapter supplies an authored candidate to `compileDeploymentCase`; it never authors, repairs, searches or ranks candidates.

---

## 7. Runtime-composed versus still external

| Object / semantic family | DPL-12C state |
|---|---|
| controlled Reference House source identity | runtime-composed |
| authored candidate identity | runtime-composed |
| bounded DPL-02 candidate conformance | runtime-composed |
| DPL-08B ground/datum/plinth/approach interface identity | runtime-composed |
| DPL-08C foul/surface/site-water interface identity | runtime-composed |
| DPL-09B England structure/ground/moisture/materials target | runtime-composed |
| DPL-09C England drainage/waste-water target | runtime-composed |
| London strategic residential-design target | runtime-composed |
| Croydon borough target | runtime-composed through bounded borough envelope |
| Bromley borough target | runtime-composed through bounded borough envelope |
| current eight-site Corpus 1 index/record identity | runtime-composed |
| corpus record prose as machine site facts | **not implemented / forbidden by this packet** |
| complete site-claim ledger | **not established** |
| strategic/local policy-conflict resolution | **not generally established** |
| local native numeric evaluators beyond existing admitted compiler methods | **not generally implemented** |
| drainage/hydraulic design | **external / not implemented** |
| planning/architectural judgement | **external** |
| planning permission | **external determination** |
| candidate generation/search/optimisation | **not implemented** |
| admitted-route exhaustion/invariance | **not implemented** |
| due-obligation completeness for whole-site conclusion | **not established** |
| whole-site compatibility conclusion | **not implemented** |

---

## 8. Why the core loader is not widened in this packet

A tempting implementation would add every current source schema to `compiler/dpl/load.ts` and expand `TargetAuthorityClass` into a generic universal registry.

DPL-12C does not earn that move yet.

Reasons:

1. DPL-12A's existing loader remains a controlled proof surface with two explicit schemas and pilot-site semantics.
2. The new corpus schema intentionally removed some pilot fields rather than merely renaming them.
3. Two boroughs prove a common envelope, not a common local-policy ontology.
4. The runtime evaluator already consumes the generic obligation shape once the source family has been validated.
5. A bounded adapter therefore creates less false universality while still exercising the same compiler.

If later DPL work produces a third/fourth recurring schema family and the seams genuinely converge, core-loader unification may then be earned.

---

## 9. Residual blockers handed to DPL-D

DPL-12C substantially strengthens composition but does **not** by itself admit DPL-13.

The post-Wave-D gate must attack at least these remaining semantics.

### A. Due-obligation completeness

The runtime can evaluate represented obligations.

It still cannot prove that every obligation due at a requested assurance profile has been represented.

Without that proof, absence of failure cannot become `COMPATIBLE`.

### B. Site-claim completeness

The eight-site index preserves controlled site identity and challenge metadata, but it does not expose a complete machine-readable site-claim/unknown ledger.

DPL must not interpret an empty normalized machine-unknown list as “no site unknowns”.

### C. Route exhaustion / invariance

DPL-12B can distinguish an authored candidate from the Reference House and enumerate only two admitted discrete variants.

It still does not prove that:

- all admitted conformance-preserving routes have been tested;
- a failure survives those routes;
- another authored candidate could not preserve the Reference House while resolving the conflict.

Therefore candidate failure remains candidate failure.

### D. Planning conflict / temporal composition

Bromley Policy 30 proves at least one real source conflict/temporal seam remains unresolved.

This need not block every deployment question, but DPL-D must decide how such unsupported due obligations affect any later top-level result authority.

### E. External professional and determination evidence

Structural, drainage, ground, planning judgement, permission and similar external methods remain external by design.

A canonical deployment case may expose them; it cannot fabricate their discharge.

---

## 10. DPL-13 remains held pending DPL-D

DPL-12C's role is to make the next decision sharper, not to skip it.

After this packet lands, Wave D is complete:

- DPL-12B — candidate/conformance seam;
- DPL-10D — borough anti-overfit replay;
- DPL-12C — Wave-C runtime composition.

The next authorised action is therefore only:

> **DPL-D — post-Wave-D integration / DPL-13 admission gate.**

DPL-D must decide whether DPL-13 is now justified and, if so, exactly what the canonical deployment is allowed to conclude.

Until then:

`DPL-13 = HELD`

and:

`COMPATIBLE / UNRESOLVED / INCOMPATIBLE = NOT IMPLEMENTED AT WHOLE-SITE RUNTIME SCOPE`
