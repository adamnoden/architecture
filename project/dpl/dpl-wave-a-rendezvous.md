# DPL-WA — Wave A Integration and DRW Rendezvous

**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Review baseline:** `2205fc06b261bee80408a633cd3d414ab7831fbb`  
**Review date:** 2026-10-20  
**Inputs:** DPL-07, DPL-09, DPL-10, DPL-11, DPL-02 conformance contract, current DRW authority through DRW-10E.1 with DRW-10F active  
**Status:** integration/rendezvous review

## 1. Purpose

Wave A deliberately attacked the DPL foundation from four independent directions before shared orchestration was frozen:

- **DPL-07** — one explicit synthetic Reference Site;
- **DPL-09** — England new-dwelling regulatory authority/applicability inventory;
- **DPL-10** — London planning authority and borough plug-in inventory;
- **DPL-11** — private/site due-diligence and non-planning constraint model.

The purpose of this gate is to ask whether those outputs still compose into one honest deployment system and, if so, identify the **smallest next wave**.

This review is also the planned rendezvous with DRW before DPL begins authoring the actual house↔land interface.

It does not implement DPL-08, encode technical regulations, select a London borough, build the deployment compiler or collect a full real-plot corpus.

## 2. Result

> **PASS — Wave A composes. Proceed with a bounded Wave B1.**

No DPL-07/09/10/11 packet reopens.

No Reference House architectural rewind is currently earned.

No DRW packet needs to stop or be invalidated.

The review does, however, refine the downstream ordering and introduces an explicit DRW/DPL interface rule before site-interface detail work begins.

## 3. Coherence test

### 3.1 One physical fact can create several obligations without authority collapse — PASS

Wave A repeatedly produces the same correct pattern:

```text
PHYSICAL / ADMINISTRATIVE SITE CLAIM
              │
              ├── planning obligation / judgement
              ├── Building Regulations obligation
              ├── private / undertaker / legal obligation
              └── site-interface design response
```

The child obligations share an input but do not share authority or result state.

Examples follow.

### Tree

```text
TREE CLAIM
 ├── DPL-10: planning designation / character / landscape / ecology question
 ├── DPL-11: arboricultural / root / ground evidence question
 ├── DPL-09: structure/site-preparation consequences where applicable
 └── DPL-08: foundation / access / landscape-interface response
```

A TPO or planning response is not geotechnical evidence. A structural response is not planning permission.

### Public sewer / drainage

```text
SEWER / DRAIN CLAIM
 ├── DPL-11: undertaker ownership / rights / build-near-diversion evidence
 ├── DPL-09: Part H / other technical obligation
 ├── DPL-10: flood/drainage planning evidence where applicable
 └── DPL-08: foundation / route / external-discharge response
```

Planning permission is not an undertaker agreement; an undertaker agreement is not Part H compliance.

### Parking

```text
PARKING CLAIM
 ├── DPL-10: parking / transport planning policy
 └── DPL-09: Part S applicability where the statutory facts trigger it
```

The planning conclusion and Part S obligation remain distinct.

### Planning-selected accessibility category

```text
PLANNING REQUIREMENT / CONDITION
            ↓
resolved M4 category selection
            ↓
DPL-09 Building Regulations obligation
```

This is a cross-target handoff, not a merger of planning and building-control authority.

### Boundary / neighbour geometry

```text
BOUNDARY / NEIGHBOUR CLAIMS
 ├── DPL-10: capacity / character / amenity / privacy / daylight context
 ├── DPL-11: legal boundary / rights / Party Wall / access questions
 └── DPL-08: placement / levels / maintenance / construction response
```

A title-plan red line must not be promoted into exact geometric authority for any of these consumers.

### Ground / contamination / water

```text
GROUND / WATER CLAIMS
 ├── DPL-09: A / C / H / Regulation 7 and related technical obligations
 ├── DPL-10: flood / drainage / contamination planning evidence where material
 ├── DPL-11: investigation / professional evidence / external approvals
 └── DPL-08: foundation / plinth / drainage / retaining design response
```

Again the physical source is shared; the obligation families are not.

## 4. Reference Site review

### 4.1 DPL-RS-01 remains valid — PASS

Wave A does not expose the synthetic 17.4 × 30.0 m Reference Site as a “magic site”.

Its most important feature is now the number of things it **refuses to pretend are known**.

The following deliberately unresolved families remain correct after DPL-09/10/11:

- exact legal boundary authority beyond the synthetic parcel definition;
- real title/private rights;
- ground/geotechnical conditions;
- detailed sewer/drainage ownership and route;
- utility capacity / connection evidence;
- flood/environmental evidence;
- real neighbour-window geometry;
- borough/local planning target;
- several construction/logistics permissions.

Do **not** revise DPL-RS-01 merely to fill these unknowns.

### 4.2 Canonical deployment does not require a fake fully-known site

A later canonical compile is allowed to expose unresolved obligations.

The purpose of the Reference Site is to make assumptions explicit and provide one integration fixture, not to guarantee `COMPATIBLE`.

Where a later technical/site-interface packet genuinely needs a site condition that DPL-RS-01 leaves unknown, there are three honest options:

1. keep the response conditional;
2. add a clearly named **synthetic scenario assumption/evidence bundle** for that bounded question;
3. defer the selected technical solution until real/external evidence exists.

The wrong option is to silently change `UNKNOWN` to a convenient value.

### 4.3 No executable site schema yet — decision reaffirmed

Wave A validates DPL-07's restraint against prematurely freezing TypeScript/JSON site fields.

DPL-09/10/11 discovered materially different evidence and authority requirements. DPL-12 should freeze executable orchestration only after the next source-spine/interface packets supply concrete admissible objects.

## 5. DRW rendezvous

### 5.1 Current DRW position

At this review:

- DRW-10E.1 is merged;
- DRW-10F is active on PR #352;
- DRW-10F explicitly owns analytical-family consistency and physical proof, **not architectural geometry redesign**;
- DRW-11A is next after DRW-10F and will freeze a small bounded detail register against current technical/prototype authority.

DPL therefore has no reason to block DRW-10F.

### 5.2 Existing detail-authority controls already protect the boundary

DRW-02C previously established that a reader question does not automatically earn a construction detail.

Materially relevant dispositions include:

- permanent opening / replaceable frame — high-value but deferred until enough assembly/performance authority exists;
- service wall / riser — spatial/analytical occurrence, not a construction-complete detail;
- movement/tolerance interface — resolved construction detail refused;
- controlled attachment plane — resolved detail refused;
- structural penetration/boundary transition — project-specific technical detail refused;
- threshold / wet-failure condition — dropped from the current detail queue because project-specific assembly authority is not yet earned.

This means DPL-08 does not need to wait for all of DRW-11.

### 5.3 Frozen DRW/DPL concurrency rule

> **DPL-08 and DRW-11 may proceed laterally, but neither programme may invent the other's authority.**

Specifically:

- DRW-11 may continue with details earned by current architectural/prototype authority;
- DRW-11 must not freeze a site/ground/plinth/drainage/external-threshold/site-service detail whose governing geometry or obligation belongs to unresolved DPL-08 work;
- DPL-08 may define site-interface duties, packages and conditional geometry without creating publication detail authority by itself;
- if DPL-08 later earns a material Reference House architectural change, the change must route through Reference House authority and affected DRW drawings return through DRW controls;
- if DRW discovers a site-interface assumption hidden in existing drawings, it should raise the dependency rather than solve it graphically.

The likely safe start is therefore **DPL-08A at authority/package-register scale**, not a construction-detail packet.

## 6. DPL-08 decomposition consequence

Wave A proves that “DPL-08 — site interface” is too large to execute as one undivided packet.

Recommended decomposition:

### DPL-08A — site-interface authority and package register

Freeze:

- building-side handoff conditions already owned by the Reference House;
- site-side input/evidence classes;
- interface package boundaries;
- conditions that remain external specialist design;
- conditions that would cross the DPL-02 conformance contract;
- interface-to-DRW publication authority boundary.

No final foundation/drainage/utility design.

### DPL-08B — ground, datum, plinth and accessible approach interface

Own:

- absolute site datum relationship;
- grading / local retaining logic;
- step-free approach interface;
- wall-base / moisture / maintenance-ground relationship;
- foundation handoff to competent engineering;
- conditional responses to ground/tree evidence.

Split again if foundation engineering and architectural ground/threshold work become independent.

### DPL-08C — foul, surface-water and site-water interface

Own:

- controlled building-side collection/exit conditions;
- site drainage routing classes;
- sewer / infiltration / attenuation / external-discharge handoffs;
- visible-failure / access requirements;
- DPL-09/DPL-10/DPL-11 obligation separation.

No claim of hydraulic adequacy without the relevant evidence/calculation.

### DPL-08D — utility and external plant/service approach

Own:

- incoming service handoff to the protected technical geography;
- external route/access/replaceability conditions;
- provider/capacity/right-of-route evidence dependencies;
- ASHP / external equipment geography where site-conditioned.

### DPL-08E — construction, maintenance and landscape interface

Own:

- site entrance / delivery / temporary works geography;
- future façade/roof/plant maintenance capability;
- courtyard logistics relation;
- removable vs critical landscape territory;
- neighbour/highway/third-party dependency as external evidence rather than assumed access.

### DPL-08F — Reference Site integration and adversarial closeout

Replay the complete interface package against DPL-RS-01, keeping unknowns explicit and refusing architectural mutation to obtain a pass.

Do not open DPL-08B→F now. DPL-08A should determine whether these seams survive actual authority recovery.

## 7. Target implementation consequence

The DPL-09 and DPL-10 inventories are intentionally much larger than the next authorised work.

Do not open every proposed child.

The first useful implementation packets are the **source/applicability spines**, because every later technical/policy method depends on them and they can progress without choosing convenient methods merely because they are easy to code.

### Authorise DPL-09A only

**England legal / applicability / process spine**:

- immutable source snapshot and target identity;
- transition-event semantics;
- technical-target ↔ process-target boundary;
- common applicability/source registry;
- no bulk Part A–T method implementation.

### Authorise DPL-10A only

**Planning legal / source spine**:

- development-plan membership;
- operative/emerging source status;
- current NPPF and London Plan source identities;
- section 38 decision/conflict semantics;
- guidance/material-consideration boundary;
- no borough policy implementation yet.

The later DPL-09B+ and DPL-10B+ queues remain recorded but unopened.

## 8. DPL-11 implementation consequence

Do **not** open DPL-11A→E yet.

The inventory is sufficient for the next architectural and real-site work to represent unknowns/evidence dependencies honestly.

A detailed private-rights or undertaker implementation should be earned by either:

- DPL-14 real plots exposing a repeated screening need; or
- DPL-08 requiring a concrete evidence contract for a site-interface package.

This avoids implementing a legal/search subsystem before the first real plot tells us which evidence is operationally valuable.

## 9. Real-plot corpus consequence

DPL-14 should now begin, but as a bounded first packet rather than “collect London”.

### Authorise DPL-14A — corpus protocol and selection frame

DPL-14A should define:

- inclusion/exclusion rules;
- diversity axes: frontage/depth, detached/edge condition, orientation, topography, trees, access, borough, heritage/environmental context and other material site variation;
- minimum public evidence required to admit a plot;
- handling of listing geometry and map uncertainty;
- source/provenance/licensing/privacy rules;
- site-manifest fields available at screening level;
- refusal to infer clean title/ground/utilities from absence of evidence;
- how the corpus selects the first borough proof target without overfitting;
- corpus size/stratification target for the later ingest packet.

DPL-14A need not acquire the whole corpus.

This gives the programme an empirical attack surface early, as originally intended.

## 10. DPL-12 consequence

Do **not** start the shared deployment compiler substrate immediately after Wave A.

The foundation models are mature, but Wave A still consists mostly of prose inventories and one synthetic site fixture.

Starting DPL-12 now would risk freezing abstractions before there is one executable/structured legal source spine and one planning source spine.

DPL-12 should re-enter after at least:

- DPL-08A;
- DPL-09A;
- DPL-10A;
- DPL-14A's screening/corpus protocol.

At that point the substrate can be tested against four concrete object families instead of being designed from the foundation documents alone.

This is a sequencing refinement, not a new semantic dependency.

## 11. Smallest next wave — B1

Authorise only four new packets/issues:

```text
ARCHITECTURE / SITE      DPL-08A
REGULATORY SOURCE        DPL-09A
PLANNING SOURCE          DPL-10A
EMPIRICAL SITE CORPUS    DPL-14A
```

They can proceed laterally after this gate.

Hold:

- DPL-08B→F;
- DPL-09B+;
- DPL-10B+;
- DPL-11A→E;
- DPL-12;
- DPL-13+.

The next integration gate should occur after B1, before shared compiler orchestration or bulk technical/policy encoding.

## 12. Programme maturity

DPL remains **M2 — Developed**.

Wave A materially deepens the system and validates its boundaries, but the project still lacks:

- a coordinated house↔land interface;
- executable release-grade target spines;
- a real-plot corpus;
- shared deployment orchestration;
- one canonical compiled deployment case.

Do not promote DPL to M3 merely because the research inventory is extensive.

## 13. Non-actions from this gate

This review does **not**:

- redesign the Reference House;
- alter DPL-RS-01 to manufacture known facts;
- select a first borough;
- implement Building Regulations methods;
- implement London policy methods;
- create a legal-advice engine;
- start DPL-12;
- claim planning or regulatory compliance;
- grant DRW authority to draw unresolved site-interface details;
- require DRW-10F to wait for DPL.

## 14. Acceptance

The Wave A rendezvous passes because:

- DPL-07/09/10/11 compose without authority collapse;
- the Reference Site remains honest after all three external-authority inventories attack it;
- cross-target handoffs are explicit;
- no architectural rewind is currently earned;
- DRW can continue without conflict under a narrow concurrency rule;
- DPL-08 is decomposed before implementation grows;
- target inventories are prevented from exploding into all children at once;
- real-plot work enters early enough to attack the abstractions;
- DPL-12 is delayed until concrete source/interface/corpus objects exist;
- the next wave is four bounded, lateral packets rather than the entire deployment programme.

**Decision:** PASS. Proceed to B1 only.
