# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Foundation gate:** [#344 — DPL-FR — foundation coherence review gate](https://github.com/adamnoden/architecture/issues/344)  
**Wave-A gate:** [#356 — DPL-WA — Wave A integration and DRW rendezvous](https://github.com/adamnoden/architecture/issues/356)  
**Wave-B1 gate:** [#373 — DPL-B1 — Wave B1 integration and next-wave readiness gate](https://github.com/adamnoden/architecture/issues/373)  
**Wave-B2 gate:** [#390 — DPL-B2 — concrete vertical integration and DPL-12 admission gate](https://github.com/adamnoden/architecture/issues/390)  
**Programme state:** foundation + Wave A + B1 + B2 complete; B2 gate admits a bounded Wave C and DPL-12A only  
**Programme maturity:** **M2 — Developed**

## Purpose

DPL establishes the machinery required to ask whether the controlled Ovid’s House Reference House can be deployed honestly onto real land under declared external normative contexts without confusing architectural authorship, site evidence, law/policy, compiler proof or professional judgement.

The eventual deployment question is:

> **Can this controlled Reference House revision be deployed on this site, under this exact target composition and evidence state, while preserving its architectural identity and satisfying every obligation due for the requested assurance profile?**

The programme ultimately permits three whole-deployment conclusions:

- `COMPATIBLE`;
- `UNRESOLVED`;
- `INCOMPATIBLE`.

Those conclusions are always qualified by an exact deployment case and assurance profile.

**No current runtime is authorised to emit those whole-site conclusions.** DPL-12A is deliberately narrower: it may orchestrate obligations, applicability, evidence, unknowns and provenance, but it may not yet decide whole-site compatibility.

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

The governing semantics are owned by the controlled DPL foundation records:

- [DPL-01 — deployment ontology](dpl-01-deployment-ontology.md);
- [DPL-02 — Reference House conformance](dpl-02-reference-house-conformance.md);
- [DPL-03 — assurance/result semantics](dpl-03-assurance-result-semantics.md);
- [DPL-04 — assurance profiles](dpl-04-compilation-maturity.md);
- [DPL-05 — target composition model](dpl-05-target-stack-model.md);
- [DPL-06 — site manifest model](dpl-06-site-manifest-model.md).

The [foundation coherence review](dpl-foundation-coherence-review.md) passed without reopening those contracts.

The authority flow remains:

```text
OVID'S HOUSE ARCHITECTURAL PROPOSITION
        ↓
REFERENCE HOUSE
controlled authored architecture
        │
        ├──────────── REAL / REFERENCE SITE
        │                    ↓
        │               SITE CLAIMS
        │                    ↓
        │               SITE MANIFEST
        │
        ├──────── EXTERNAL NORMATIVE SOURCES
        │                    ↓
        │          TARGET SNAPSHOTS
        │                    ↓
        │        TARGET COMPOSITION
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
                HOUSE KERNEL
          admitted formal representation
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

House Kernel is **not** a synonym for doctrine.

The Reference House is one controlled authored integration fixture, not a universal house, compiler output or infinitely deformable parametric family.

DPL-02 freezes five conformance classes:

1. identity invariants;
2. protected order;
3. permitted discrete variants;
4. site-interface freedoms;
5. implementation freedoms / open detail.

The governing conformance rule is:

> **Deployment freedoms are opt-in.**

A failed candidate does not itself prove site incompatibility. `INCOMPATIBLE` requires a blocking condition plus exhaustion of relevant admitted conformance-preserving routes, or proof that the failure is invariant across them.

## Site claims

The real site exists independently of the repository and can never be assumed to be exhaustively captured by a model.

A site manifest is therefore an immutable versioned snapshot of:

- evidence-backed claims;
- explicit unknowns;
- explicit assumptions;
- source/provenance information.

Unknown is first-class. Missing does not mean false, zero, safe or not applicable.

DPL-14B additionally proves that real-site provenance must preserve, where material:

- **source lineage**;
- **spatial scope**;
- **temporal state**;
- **source-identity-link confidence**.

A site manifest must not store derived normative conclusions such as `planningCompliant`, `ReferenceHouseCompatible`, `foundationTypeRequired` or `suitableForDevelopment`.

## External normative authority

A compiler target is an immutable versioned representation of an external normative environment. A deployment “target stack” is a typed **target composition**, not an inheritance list.

No precedence may be inferred from:

- list order;
- geographic nesting;
- “more local” status;
- publication recency.

Building control and planning remain distinct authority systems even where one creates an input for the other.

DPL preserves independent identity for:

1. external source/source-snapshot version;
2. target-model version;
3. method-implementation version;
4. target-composition version.

A corrected method does not imply the law changed. A later source does not silently rewrite an earlier compile.

## Obligations and evidence

DPL reuses the existing House Kernel / Metamorph Compiler evidence architecture.

Canonical obligation results remain:

- `PASS`;
- `EXTERNALLY_DISCHARGED`;
- `FAIL`;
- `UNSUPPORTED`;
- `UNRESOLVED`;
- `NOT_APPLICABLE`;
- `WARNING`;
- `SUPERSEDED`.

Evidence lifecycle remains separate:

- `PLANNED`;
- `PRESENT`;
- `ACCEPTED`;
- `REJECTED`;
- `STALE`;
- `SUPERSEDED`;
- `WITHDRAWN`.

“Evidence required” and “judgement required” describe why an obligation remains unresolved; they are not competing status enums.

## Assurance profiles

DPL-04 freezes:

1. `SCREENING`;
2. `FEASIBILITY`;
3. `PLANNING_CASE`;
4. `TECHNICAL_DESIGN`;
5. `CONSTRUCTION`;
6. `COMMISSIONED_AS_BUILT`.

These are claim/evidence horizons, not RIBA stages, project maturity or confidence scores.

A normally later obligation becomes due earlier where credible current evidence makes it decision-critical.

---

# Controlled programme history

## Foundation — complete

DPL-01 through DPL-06 are complete. The foundation review passed with bounded programme-control corrections.

## Wave A — complete

Wave A attacked the abstract foundation with real external/site research before shared implementation:

- [DPL-07 — Reference Site](dpl-07-reference-site.md) / #347;
- [DPL-09 — England regulatory target inventory](dpl-09-england-regulatory-target-inventory.md) / #348;
- [DPL-10 — London planning target inventory](dpl-10-london-planning-target-inventory.md) / #349;
- [DPL-11 — site due-diligence / non-planning model](dpl-11-site-due-diligence-model.md) / #350.

The [Wave-A rendezvous](dpl-wave-a-rendezvous.md) / #356 then authorised B1 only.

## Wave B1 — complete

B1 froze implementation-facing contracts without inventing a generic runtime schema:

- [DPL-08A — site-interface authority register](dpl-08a-site-interface-authority-register.md) / #358;
- [DPL-09A — England source/applicability spine](dpl-09a-england-source-applicability-spine.md) / #359;
- [DPL-10A — planning source/status spine](dpl-10a-planning-source-status-spine.md) / #360;
- [DPL-14A — real-plot corpus protocol](dpl-14a-real-plot-corpus-protocol.md) / #361.

The [B1 readiness review](dpl-wave-b1-readiness-review.md) / #373 concluded:

> **PASS — HOLD DPL-12; AUTHORISE B2 ONLY.**

## Wave B2 — complete

B2 produced the first concrete cross-domain objects:

- [DPL-08B — ground / datum / plinth / accessible approach](dpl-08b-ground-datum-plinth-approach-interface.md) / #376;
- [DPL-09B — structure / ground / moisture / materials](dpl-09b-structure-ground-moisture-materials.md) / #377;
- [DPL-10B — London strategic residential / design target](dpl-10b-london-strategic-residential-design.md) / #378;
- [DPL-14B — three-site real London corpus pilot](dpl-14b-three-site-real-corpus-pilot.md) / #379.

DPL-14B admits real screening manifests for Barnet, Bromley and Croydon and passes with bounded provenance refinements. No site receives a purchase or compatibility verdict.

The [B2 integration review](dpl-wave-b2-integration-review.md) / #390 concludes:

> **PASS — ADMIT DPL-12A; KEEP DPL AT M2; AUTHORISE WAVE C ONLY.**

---

# Reference Site and real corpus

`DPL-RS-01` remains the controlled synthetic Reference Site. It makes one plausible London deployment context explicit without claiming statistical typicality.

Real sites are the empirical attack surface. The Reference Site must not be averaged or retrospectively tuned merely to resemble the corpus.

Corpus 1 remains an adversarial design-of-experiments sample rather than a statistical market survey or purchase shortlist.

Longer-term target:

```text
24 admitted Greater-London plots
+
up to 6 reserves
```

Do **not** jump directly from the current three difficult infill/backland cases to the remaining corpus.

Wave C authorises one bounded **DPL-14C five-site gap-correction cohort** covering, as far as practical:

1. ordinary street-front detached/replacement land;
2. corner / dual-frontage land;
3. reliably evidenced slope/topography;
4. authoritative flood/water/environmental trigger;
5. unusually clear public geometry with comparatively sparse planning history as an ordinary control, with orientation diversity where possible.

Price is not an admission criterion.

---

# House ↔ land interface

DPL-08A freezes six package authorities:

1. ground / foundation support;
2. datum / plinth / accessible approach;
3. foul / surface / site water;
4. utility approach / external plant;
5. construction / maintenance / landscape;
6. context / environmental mitigation.

DPL-08B now provides the first substantive conditional interface family for support/datum/access without pretending to be foundation, threshold or drainage design.

The next authorised interface packet is:

> **DPL-08C — foul / surface / site-water interface.**

It should define the land/building response contract for foul connection, surface-water discharge hierarchy, courtyard/perimeter/roof-water handoff, site levels/falls, inspection/maintenance territory and external sewer/authority dependencies while preserving specialist-design boundaries.

---

# England building-control target

DPL-09A freezes source/applicability/process identity. DPL-09B provides the first substantive technical slice for structure/ground/moisture/materials.

DPL-09B proves a central rule:

> **An obligation can be exactly identified and correctly applicable while remaining unresolved because its lawful method requires competent external evidence.**

The next authorised technical packet is:

> **DPL-09C — England drainage / waste-water target slice.**

Its primary statutory family is Part H and directly relevant source/guidance relationships. Part G may enter only at explicit interface points genuinely required by this water/sanitation vertical; DPL-09C is not permission to implement Part G wholesale.

DPL-08C and DPL-09C may proceed laterally once their authority seam is explicit. Neither may treat the other’s open findings as settled authority.

---

# London planning target

DPL-10A freezes planning source/status/membership semantics. DPL-10B proves that numeric policy, design judgement, inclusive-design judgement, guidance and cross-target assignment can coexist without being flattened into one check type.

## First borough proof: Croydon

Wave C authorises:

> **DPL-10C — Croydon borough planning plug-in proof.**

Croydon is selected as a **proof target**, not because it is representative or favourable. The DPL-RP-003 decision history provides an unusually useful interaction between London strategic policy, local policy, proposal-specific judgement and external permission/refusal evidence.

## Predeclared adversarial replay: Bromley

**Bromley is predeclared now as the second-borough replay.**

Do not open that replay until Croydon closes. Predeclaring it prevents a Croydon-specific first implementation from quietly defining the generic borough abstraction.

The Bromley pilot differs materially through backland/private-access conditions, tree/TPO history, larger-scheme refusal versus later one-house permission, drainage-condition history and a different local-policy/source ecology.

---

# DPL-12 admission

## DPL-12A is now authorised

The B2 gate determines that enough concrete instances exist to derive a **minimal shared deployment orchestration substrate**.

DPL-12A must consume the existing B2 objects. It must not force them into a generic schema designed in advance.

### DPL-12A may own only

1. deployment-case identity;
2. site/source/evidence provenance references;
3. typed target composition;
4. applicability state;
5. method class;
6. existing obligation/result state;
7. independent evidence lifecycle state;
8. explicit missing evidence / unknowns;
9. cross-target edges;
10. deterministic result/provenance identity and invalidation.

DPL-12A should exercise these seams against the actual B2 artefacts rather than building an unused framework.

### DPL-12A may not

- generate architecture;
- select site adaptations;
- author a deployment candidate;
- infer missing site facts;
- implement all Building Regulations or planning policy;
- replace specialist evidence or statutory permission;
- rank land;
- create aggregate compliance/confidence scores;
- emit a whole-site `COMPATIBLE` or `INCOMPATIBLE` conclusion.

### Why whole-site compatibility remains held

A whole deployment conclusion still needs architectural candidate/conformance handling, site-interface response selection and due-obligation completeness.

`INCOMPATIBLE` additionally requires route exhaustion or proof that a blocker is invariant across relevant admitted conformance-preserving routes.

DPL-12A does not yet own those semantics.

Therefore a fully green ledger for the currently represented subset does **not** imply site compatibility.

---

# Wave C — current authorised work

After #390 merges, open and execute **only**:

```text
DPL-12A   minimal deployment orchestration substrate
DPL-08C   foul / surface / site-water interface
DPL-09C   England drainage / waste-water target slice
DPL-10C   Croydon borough planning plug-in proof
DPL-14C   five-site corpus gap-correction cohort
```

Dependencies:

```text
DPL-12A ← DPL-B2 + DPL-08B + DPL-09B + DPL-10B + DPL-14B

DPL-08C ← DPL-B2 + DPL-08A + DPL-14B
DPL-09C ← DPL-B2 + DPL-09A/B + DPL-08C authority boundary
DPL-10C ← DPL-B2 + DPL-10A/B + DPL-14B
DPL-14C ← DPL-B2 + DPL-14A/B + DPL-06
```

DPL-09C need not wait for DPL-08C to close. They may proceed laterally after the ownership seam is explicit and must carry unresolved cross-lane questions honestly.

The next mandatory integration gate occurs after these five packets. That gate must reconsider:

- DPL M2 → M3;
- whether the orchestration abstractions survived concrete use;
- whether whole-site conclusion semantics are any closer to being earned;
- whether Croydon earned a stable borough plug-in abstraction before the Bromley replay;
- whether water/drainage integration exposed a Reference House or DRW rewind;
- whether Corpus 1 may now scale beyond the gap-correction cohort.

---

# Held work

Until the post-Wave-C integration gate, hold:

- DPL-10D Bromley replay;
- DPL-08D+ other interface families;
- DPL-09D+ bulk technical families;
- corpus expansion beyond DPL-14C;
- whole-site compatibility output from the runtime;
- DPL-13 canonical deployment compile;
- DPL-15 real-site deployment trials;
- DPL-16 deployment-envelope derivation;
- DPL-17 publication integration;
- DPL-18 final adversarial closeout.

DPL-12A admission is not authority to begin the rest of the compiler programme.

---

# Programme maturity

DPL remains **M2 — Developed** at the B2 gate.

B2 has now produced:

- real site manifests;
- substantive technical obligations and method/evidence boundaries;
- substantive planning obligations and mixed method classes;
- a substantive conditional site-interface family.

But those objects have not yet been reconciled through an executable shared orchestration layer.

The project-wide M3 criterion requires the workstream to be reconciled with adjacent parts of the project and internally coherent at its stated scope. DPL-12A is now the concrete coordination test.

Reconsider M3 only after DPL-12A executes against the actual B2 objects and a post-Wave-C gate reviews the result.

Do not promote maturity because the documentation or issue count is large.

---

# DRW concurrency

DRW may continue against controlled Reference House geometry.

The concurrency rule remains:

> **DRW may represent controlled architectural and analytical authority; it may not invent site-interface or technical construction authority ahead of DPL/specialist evidence. DPL may create duties and interface authority; it may not mutate controlled house geometry through drawing code.**

DRW-11 closed while respecting this boundary and repeatedly refused unearned construction-style detail.

Wave C does not require DRW to pause.

DPL-08C / DPL-09C may later earn new analytical drawing duties around external water/drainage geography. Record those as explicit DRW handoffs rather than editing drawing artefacts inside DPL packets.

DPL-12A may consume controlled house/drawing evidence only at its existing proof scope; drawings do not become construction or statutory proof by entering a deployment case.

---

# Publication restraint

Most DPL machinery remains backstage.

The physical publication should remain an architectural work, not a regulations/planning manual.

Reader-facing jurisdiction/site/deployment treatment remains deferred to DPL-17 after the machinery has earned it.

---

# Packet discipline

Every DPL packet must remain restart-safe.

Record at minimum:

`packet → baseline main SHA → authority recovered → exact question → source/evidence set → findings + rejected alternatives → artefacts/changes → checks → authority/proof consequences → downstream dependencies → exact next authorised packet`

Split a packet when it:

- mixes materially independent ontology, architectural, legal or site questions;
- jumps from source modelling to substantive rule encoding without a frozen contract;
- requires unrelated Reference House rewinds;
- creates a new compiler proof family unexpectedly;
- starts treating professional/planning judgement as deterministic computation;
- becomes too large for a later session to reconstruct from repository records alone.

---

# Current authorised work

After the B2 gate / #390 merges, execute **Wave C only**:

- DPL-12A — minimal deployment orchestration substrate;
- DPL-08C — foul / surface / site-water interface;
- DPL-09C — England drainage / waste-water target slice;
- DPL-10C — Croydon borough planning plug-in proof;
- DPL-14C — five-site corpus gap-correction cohort.

Then perform the mandatory **post-Wave-C integration gate**.

Do not open the Bromley replay, bulk technical/interface children, the remaining corpus or DPL-13+ merely because DPL-12A is now admitted.