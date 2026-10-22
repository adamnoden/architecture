# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Foundation gate:** [#344 — DPL-FR](https://github.com/adamnoden/architecture/issues/344)  
**Wave-A gate:** [#356 — DPL-WA](https://github.com/adamnoden/architecture/issues/356)  
**Wave-B1 gate:** [#373 — DPL-B1](https://github.com/adamnoden/architecture/issues/373)  
**Wave-B2 gate:** [#390 — DPL-B2](https://github.com/adamnoden/architecture/issues/390)  
**Wave-C gate:** [#412 — DPL-C](https://github.com/adamnoden/architecture/issues/412)  
**Programme state:** foundation through Wave C complete; DPL-C passes, promotes DPL to M3 and authorises bounded Wave D only  
**Programme maturity:** **M3 — Coordinated**

## Purpose

DPL establishes the machinery required to ask whether the controlled Ovid’s House Reference House can be deployed honestly onto real land under declared external normative contexts without confusing architectural authorship, site evidence, law/policy, compiler proof or professional judgement.

The eventual deployment question is:

> **Can this controlled Reference House revision be deployed on this site, under this exact target composition and evidence state, while preserving its architectural identity and satisfying every obligation due for the requested assurance profile?**

The programme ultimately permits three whole-deployment conclusions:

- `COMPATIBLE`;
- `UNRESOLVED`;
- `INCOMPATIBLE`.

Those conclusions are always scoped to an exact deployment case and assurance profile.

**No current runtime is authorised to emit those whole-site conclusions.** The landed DPL-12A runtime deliberately stops at an obligation/evidence ledger and records candidate selection, route exhaustion and whole-site compatibility as unimplemented.

DPL is not:

- a generic house generator;
- a Building Regulations product;
- a planning-permission predictor;
- a substitute for competent engineering, legal, planning or statutory review;
- permission to mutate the Reference House until any plot passes;
- a property-ranking or acquisition-scoring system.

## Governing proposition

> **The doctrine says what we believe.**  
> **The Reference House demonstrates it.**  
> **The Reference Site makes one deployment demonstration concrete.**  
> **The target composition introduces external normative authority.**  
> **The site manifest records what we presently claim to know or assume about the site.**  
> **The site interface absorbs only legitimate land/building variation.**  
> **The compiler evaluates admitted representations and exposes unresolved obligations.**

Two rules govern the programme:

> **Compatibility before adaptation.**

and:

> **The compiler evaluates architecture; it does not silently author it.**

A site is not entitled to deform the Reference House. Where deployment would require an unauthorised change to controlled architectural identity or protected order, the correct response is a compatibility problem or an explicit upstream Reference House rewind.

---

# Canonical foundation

The governing semantics remain owned by:

- [DPL-01 — deployment ontology](dpl-01-deployment-ontology.md);
- [DPL-02 — Reference House conformance](dpl-02-reference-house-conformance.md);
- [DPL-03 — assurance/result semantics](dpl-03-assurance-result-semantics.md);
- [DPL-04 — assurance profiles](dpl-04-compilation-maturity.md);
- [DPL-05 — target composition](dpl-05-target-stack-model.md);
- [DPL-06 — site manifest](dpl-06-site-manifest-model.md).

The [foundation coherence review](dpl-foundation-coherence-review.md) passed without reopening those contracts.

The authority flow remains:

```text
OVID'S HOUSE ARCHITECTURAL PROPOSITION
        ↓
REFERENCE HOUSE
controlled authored architecture
        │
        ├──────────── SITE / SITE CLAIMS / EVIDENCE
        │
        ├──────── EXTERNAL NORMATIVE SOURCES
        │                    ↓
        │              TARGET COMPOSITION
        │
        └──────── PROJECT SCENARIOS
                     │
                     ↓
              DEPLOYMENT CASE
                     │
          architectural authoring
                     ↓
            DEPLOYMENT CANDIDATE
                     │
                     ↓
              METAMORPH COMPILER
                     ↓
          OBLIGATIONS + EVIDENCE
                     ↓
       COMPATIBLE / UNRESOLVED /
             INCOMPATIBLE
       @ exact assurance profile
```

The diagram is an authority model, not a claim that every arrow is implemented.

## Architectural authority

House Kernel is not a synonym for doctrine. The Reference House is one controlled authored integration fixture, not an infinitely deformable parametric family.

DPL-02 freezes five conformance classes:

1. identity invariants;
2. protected order;
3. permitted discrete variants;
4. site-interface freedoms;
5. implementation freedoms / open detail.

> **Deployment freedoms are opt-in.**

A failed candidate does not itself prove site incompatibility. `INCOMPATIBLE` requires a blocking condition plus exhaustion of relevant admitted conformance-preserving routes, or proof that the failure is invariant across them.

## Site claims

A site manifest is an immutable versioned snapshot of evidence-backed claims, explicit unknowns, explicit assumptions and provenance. The real site always exceeds that model.

Real-site provenance preserves, where material:

- source lineage;
- spatial scope;
- temporal state;
- source-identity-link confidence.

Unknown is first-class. Missing does not mean false, zero, safe or not applicable.

## External normative authority

A compiler target is an immutable versioned representation of an external normative environment. A target composition is typed; it is not an inheritance list.

No precedence may be inferred from list order, geographic nesting, locality or publication recency. Building control and planning remain distinct authority systems even where one produces an input for the other.

DPL preserves independent identity for source snapshot, target model, method implementation and target composition.

## Obligations, evidence and assurance

DPL reuses the existing Metamorph Compiler obligation/evidence architecture.

Canonical obligation results remain:

`PASS / EXTERNALLY_DISCHARGED / FAIL / UNSUPPORTED / UNRESOLVED / NOT_APPLICABLE / WARNING / SUPERSEDED`

Evidence lifecycle remains separate:

`PLANNED / PRESENT / ACCEPTED / REJECTED / STALE / SUPERSEDED / WITHDRAWN`

DPL-04 assurance profiles remain:

`SCREENING / FEASIBILITY / PLANNING_CASE / TECHNICAL_DESIGN / CONSTRUCTION / COMMISSIONED_AS_BUILT`

These are claim/evidence horizons, not project maturity or confidence scores.

---

# Controlled programme history

## Foundation — complete

DPL-01 through DPL-06 are complete. DPL-FR passed with bounded programme-control corrections.

## Wave A — complete

- [DPL-07 — Reference Site](dpl-07-reference-site.md) / #347;
- [DPL-09 — England regulatory target inventory](dpl-09-england-regulatory-target-inventory.md) / #348;
- [DPL-10 — London planning target inventory](dpl-10-london-planning-target-inventory.md) / #349;
- [DPL-11 — site due-diligence / non-planning model](dpl-11-site-due-diligence-model.md) / #350.

## Wave B1 — complete

- [DPL-08A — site-interface authority register](dpl-08a-site-interface-authority-register.md) / #358;
- [DPL-09A — England source/applicability spine](dpl-09a-england-source-applicability-spine.md) / #359;
- [DPL-10A — planning source/status spine](dpl-10a-planning-source-status-spine.md) / #360;
- [DPL-14A — real-plot corpus protocol](dpl-14a-real-plot-corpus-protocol.md) / #361.

DPL-B1 concluded:

> **PASS — HOLD DPL-12; AUTHORISE B2 ONLY.**

## Wave B2 — complete

- [DPL-08B — ground / datum / plinth / accessible approach](dpl-08b-ground-datum-plinth-approach-interface.md) / #376;
- [DPL-09B — structure / ground / moisture / materials](dpl-09b-structure-ground-moisture-materials.md) / #377;
- [DPL-10B — London strategic residential / design target](dpl-10b-london-strategic-residential-design.md) / #378;
- [DPL-14B — three-site real London corpus pilot](dpl-14b-three-site-real-corpus-pilot.md) / #379.

DPL-B2 concluded:

> **PASS — ADMIT DPL-12A; KEEP DPL AT M2; AUTHORISE WAVE C ONLY.**

## Wave C — complete

Wave C produced the first executable shared deployment spine and expanded every pressure surface selected by B2:

- [DPL-12A — minimal deployment orchestration](dpl-12a-minimal-orchestration.md) / #398;
- [DPL-08C — foul / surface / site-water interface](dpl-08c-foul-surface-site-water-interface.md) / #399;
- [DPL-09C — England drainage / waste-water target](dpl-09c-england-drainage-waste-water.md) / #400;
- [DPL-10C — Croydon borough planning plug-in proof](dpl-10c-croydon-planning-plugin.md) / #401;
- [DPL-14C — five-site corpus gap-correction cohort](dpl-14c-five-site-corpus-gap-correction.md) / #402.

The controlled corpus now contains eight screening-level sites across seven boroughs. It remains an adversarial design-of-experiments corpus rather than a statistical market sample or property shortlist.

The [post-Wave-C integration review](dpl-wave-c-integration-maturity-review.md) / #412 concludes:

> **PASS — PROMOTE DPL TO M3; HOLD DPL-13; AUTHORISE WAVE D ONLY.**

---

# Current coordinated state

## DPL-12A executable spine

DPL-12A consumes controlled Reference House identity, real Croydon site evidence, DPL-08B authority, the first England technical target and the London strategic planning target in one deterministic obligation/evidence ledger.

It proves mixed method classes, real-site unknown propagation, external-evidence discharge, cross-target edges, stable identity and relevant invalidation.

It does **not** author a deployment candidate, evaluate Reference House conformance, enumerate routes, prove route exhaustion or emit whole-site compatibility.

## Water / drainage

DPL-08C and DPL-09C now define a coherent architectural/site interface and England Part-H-family target without pretending to perform drainage engineering.

The next value is runtime composition, not another water research packet.

## Local planning

DPL-10C proves one Croydon local target can compose conceptually with the London strategic layer while preserving policy, guidance, judgement and external decision evidence.

Croydon has not earned generic-borough status. The predeclared Bromley replay remains the required anti-overfit test.

## Real corpus

DPL-14C materially reduces the original backland/infill bias. One residual ordinary-control gap and useful future survey/orientation/width/second-water opportunities remain explicit.

No further corpus packet is authorised in Wave D. Expand only when a concrete deployment proof demonstrates the need.

---

# Programme maturity

DPL is **M3 — Coordinated**.

This promotion is earned because real site evidence, controlled Reference House identity, external target authority, method classes, evidence lifecycle and obligation results now coexist coherently in executable orchestration, while the Wave-C site-interface, drainage, local-planning and empirical additions preserve those boundaries rather than contradict them.

M3 does **not** mean canonical deployment or validated site compatibility.

M4 remains held until the deployment proposition has been deliberately challenged as an end-to-end controlled baseline. At minimum the programme still lacks:

- authored deployment-candidate identity in runtime;
- executable Reference House conformance findings;
- admitted-route enumeration;
- route-exhaustion/invariant-blocker proof;
- full Wave-C runtime composition;
- an admitted canonical deployment compile.

---

# Wave D — current authorised work

After DPL-C / #412 merges, open and execute **only**:

```text
DPL-12B   authored candidate + Reference House conformance orchestration
DPL-10D   Bromley adversarial borough replay
     \     /
      \   /
      DPL-12C   Wave-C runtime composition expansion
          |
          v
       DPL-D     post-Wave-D integration / DPL-13 admission gate
```

## DPL-12B

DPL-12B owns only the bounded candidate/conformance seam already earned by DPL-02:

- explicit authored deployment-candidate identity/revision;
- relationship to one controlled Reference House revision;
- clause-level conformance findings;
- admitted variant/interface route identifiers where existing authority genuinely defines them;
- deterministic candidate/conformance provenance and invalidation.

It must not generate or optimise architecture, silently mutate the Reference House or emit whole-site compatibility.

## DPL-10D

DPL-10D replays the local-target model against Bromley before any generic borough abstraction is trusted. Croydon-specific semantics stay local unless Bromley independently demonstrates a reusable seam.

DPL-10D may proceed laterally with DPL-12B.

## DPL-12C

DPL-12C follows DPL-12B and DPL-10D and composes the authority already earned by Wave C through the runtime:

- DPL-08C water-interface facts/obligations;
- DPL-09C England drainage target;
- the borough-target seam after Croydon + Bromley;
- the controlled eight-site corpus/index;
- candidate/conformance identity from DPL-12B;
- deterministic provenance/invalidation across those additions.

It must not open another technical family, become a generic borough rules engine, perform DPL-13 or emit whole-site compatibility by implication.

## DPL-D

DPL-D is the next mandatory integration gate. It must decide explicitly whether DPL-13 is finally admitted and whether any whole-site conclusion semantics have actually been earned.

---

# Held work

Until DPL-D passes, hold:

- DPL-13 canonical deployment compile;
- DPL-14D / bulk corpus expansion;
- DPL-15 real-site deployment trials;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 final adversarial closeout;
- additional DPL-08 / DPL-09 technical/interface families;
- generic all-borough planning abstraction;
- whole-site compatibility output.

---

# DRW boundary

DRW is complete and frozen.

> **DPL may earn a future representational duty, but it may not silently mutate the released DRW pipeline.**

Any future DPL-driven drawing change requires an explicit DRW reopen with named authority/proof consequences or a separately owned post-DRW representation authority.

DPL-08C/09C analytical handoffs around external water/discharge/inspection geography remain recorded duties, not construction-detail authority.

---

# Publication restraint

Most DPL machinery remains backstage. The physical publication should remain an architectural work, not a regulations/planning manual.

Reader-facing jurisdiction/site/deployment treatment remains deferred to DPL-17 after the machinery has earned it.

---

# Packet discipline

Every DPL packet must remain restart-safe. Record at minimum:

`packet → baseline main SHA → authority recovered → exact question → source/evidence set → findings + rejected alternatives → artefacts/changes → checks → authority/proof consequences → downstream dependencies → exact next authorised packet`

Split a packet when it:

- mixes materially independent ontology, architectural, legal or site questions;
- jumps from source modelling to substantive rule encoding without a frozen contract;
- requires unrelated Reference House rewinds;
- creates a new compiler proof family unexpectedly;
- treats professional/planning judgement as deterministic computation;
- becomes too large for a later session to reconstruct from repository records alone.

# Current authorised work

**Wave D only after DPL-C merges:** DPL-12B and DPL-10D may start laterally. DPL-12C follows both. DPL-D follows all three.

Do not open DPL-13, another corpus wave, another technical/interface family or a whole-site compatibility implementation merely because DPL has reached M3.
