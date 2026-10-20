# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Foundation gate:** [#344 — DPL-FR — foundation coherence review gate](https://github.com/adamnoden/architecture/issues/344)  
**Wave-A gate:** [#356 — DPL-WA — Wave A integration and DRW rendezvous](https://github.com/adamnoden/architecture/issues/356)  
**Wave-B1 gate:** [#373 — DPL-B1 — Wave B1 integration and next-wave readiness gate](https://github.com/adamnoden/architecture/issues/373)  
**Programme state:** foundation + Wave A + Wave B1 developed; B2 is the next bounded wave; DPL-12 remains held  
**Programme maturity:** **M2 — Developed**

## Purpose

DPL establishes the machinery required to ask whether the controlled Ovid’s House Reference House can be deployed honestly onto real land under declared external normative contexts without confusing architectural authorship, site evidence, law/policy, compiler proof or professional judgement.

The end-state question is:

> **Can this controlled Reference House revision be deployed on this site, under this exact target composition and evidence state, while preserving its architectural identity and satisfying every obligation due for the requested assurance profile?**

The only current top-level answers are:

- `COMPATIBLE`;
- `UNRESOLVED`;
- `INCOMPATIBLE`;

always qualified by the exact deployment case and assurance profile.

DPL is not:

- a generic house generator;
- a Building Regulations product;
- a planning-permission predictor;
- a substitute for competent engineering, legal, planning or statutory review;
- permission to mutate the Reference House until any plot passes.

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

A site is not entitled to deform the Reference House. Where deployment would require an unauthorised change to controlled architectural identity or protected order, the correct result is a compatibility problem or an explicit upstream Reference House rewind.

---

# Canonical authority model

The controlled foundation is spread across the DPL-01 through DPL-06 records rather than redefined here:

- [DPL-01 — deployment ontology](dpl-01-deployment-ontology.md);
- [DPL-02 — Reference House conformance](dpl-02-reference-house-conformance.md);
- [DPL-03 — assurance/result semantics](dpl-03-assurance-result-semantics.md);
- [DPL-04 — assurance profiles](dpl-04-compilation-maturity.md);
- [DPL-05 — target composition model](dpl-05-target-stack-model.md);
- [DPL-06 — site manifest model](dpl-06-site-manifest-model.md).

Their integrated relationship remains:

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

A failed candidate does not itself prove site incompatibility. `INCOMPATIBLE` requires a blocking condition plus exhaustion of relevant admitted conformance-preserving routes, or a failure invariant across them.

## Site claims

The real site exists independently of the repository and can never be assumed to be exhaustively captured by a model.

DPL-06 therefore treats a site manifest as an immutable versioned snapshot of evidence-backed claims, explicit unknowns and explicit assumptions.

Unknown is first-class.

Missing does not mean false, zero, safe or not applicable.

The site manifest must not store derived normative conclusions such as `planningCompliant`, `ReferenceHouseCompatible`, `foundationTypeRequired` or `suitableForDevelopment`.

## External normative authority

DPL-05 defines a compiler target as an immutable versioned representation of an external normative environment and a deployment “target stack” as a typed **target composition**, not an inheritance list.

No precedence may be inferred from:

- list order;
- geographic nesting;
- “more local” status;
- publication recency.

Building control and planning remain distinct authority systems even when both constrain one deployment case.

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

These are claim/evidence horizons, not RIBA stages, project maturity or a confidence score.

A normally later obligation becomes due earlier where credible current evidence makes it decision-critical.

---

# Controlled programme history

## Foundation — complete

DPL-01 through DPL-06 are complete.

The mandatory [DPL Foundation Coherence Review](dpl-foundation-coherence-review.md) passed with bounded corrections and did not reopen the foundation.

## Wave A — complete

Wave A deliberately attacked the foundation with concrete external/site research before shared implementation:

- [DPL-07 — Reference Site](dpl-07-reference-site.md) / #347;
- [DPL-09 — England regulatory target inventory](dpl-09-england-regulatory-target-inventory.md) / #348;
- [DPL-10 — London planning target inventory](dpl-10-london-planning-target-inventory.md) / #349;
- [DPL-11 — site due-diligence / non-planning model](dpl-11-site-due-diligence-model.md) / #350.

The [Wave-A rendezvous](dpl-wave-a-rendezvous.md) / #356 then authorised only a bounded B1 set.

## Wave B1 — complete

B1 froze four implementation-facing contracts without turning them prematurely into a shared runtime schema:

- [DPL-08A — site-interface authority register](dpl-08a-site-interface-authority-register.md) / #358;
- [DPL-09A — England source/applicability spine](dpl-09a-england-source-applicability-spine.md) / #359;
- [DPL-10A — planning source/status spine](dpl-10a-planning-source-status-spine.md) / #360;
- [DPL-14A — real-plot corpus protocol](dpl-14a-real-plot-corpus-protocol.md) / #361.

The [DPL-B1 readiness review](dpl-wave-b1-readiness-review.md) / #373 concludes:

> **PASS — HOLD DPL-12; AUTHORISE B2 ONLY.**

B1 proves that the authority contracts compose, but it still lacks a real site record, one substantive technical target family, one substantive strategic-planning family and one authored site-interface response family. DPL-12 must consume those objects rather than invent their common shape from prose.

---

# Reference Site

`DPL-RS-01` is the controlled synthetic Reference Site.

It makes one plausible London deployment context explicit without claiming statistical typicality.

It exists to expose hidden assumptions and support canonical integration. Real plots later determine the empirical deployment envelope.

The Reference Site must not be averaged or retrospectively tuned merely to look representative of the later corpus.

---

# House ↔ land interface

DPL-08A freezes six package authorities:

1. ground / foundation support;
2. datum / plinth / accessible approach;
3. foul / surface / site water;
4. utility approach / external plant;
5. construction / maintenance / landscape;
6. context / environmental mitigation.

The interface absorbs legitimate land/building variation only.

It is not a universal adapter and does not transfer engineering, planning or statutory authority into architecture.

**Next interface packet:** DPL-08B — ground / datum / plinth / accessible approach.

---

# England building-control target

The England target remains a composition of independently versioned source and obligation families.

DPL-09A freezes:

- Building Regulations source identity and point-in-time discipline;
- explicit amendment/transition provenance;
- project-event applicability;
- independent technical/substantive and process/dutyholder target families;
- unresolved future-event semantics;
- law/guidance/standard/evidence separation.

Selecting the correct source regime is only an applicability result; it is not technical compliance.

**Next technical family:** DPL-09B — structure / ground / moisture / materials.

No DPL-09C–J work is authorised yet.

---

# London planning target

DPL-10A freezes:

- point-in-time section-38 decision basis;
- development-plan membership as an explicit site/date-specific fact;
- source status separately from membership;
- London Plan 2021 as the operative strategic source at the 2026-10-20 research date;
- Draft London Plan 2026 as emerging/non-operative at that date;
- London Plan Guidance as guidance/material consideration rather than London Plan policy;
- section-38(5) policy conflict as an explicit relation rather than `more local wins`;
- permission/refusal/conditions/appeal as external statutory evidence.

**Next planning packet:** DPL-10B — London strategic residential / design target.

The first borough remains unselected until the real corpus produces a sufficiently varied empirical mini-cohort.

No DPL-10C–F work is authorised yet.

---

# Real London plot corpus

DPL-14A freezes Corpus 1 as a deliberately varied **adversarial design-of-experiments sample**, not a statistical market sample or purchase shortlist.

Current target:

```text
24 admitted Greater-London plots
+
up to 6 reserves
```

Selection is coverage-driven across plot geometry, access, orientation, context, levels, trees, environmental/heritage friction and site-interface stress.

The public repository retains source provenance and bounded extracted claims, not a mirror of third-party listing imagery/material.

Price is not an admission criterion.

**Next empirical packet:** DPL-14B — three-site real-corpus pilot under the final protocol.

The first three should preferably span three different boroughs and materially different site conditions. They may count toward the final 24 if they survive protocol review.

---

# Wave B2 — next authorised wave after DPL-B1 merge

Open **only** the following four packets:

```text
DPL-08B   ground / datum / plinth / accessible approach
DPL-09B   structure / ground / moisture / materials
DPL-10B   London strategic residential / design target
DPL-14B   three-site real-corpus pilot
```

All depend on DPL-B1.

Additional dependencies:

```text
DPL-08B ← DPL-08A + DPL-07 + DPL-B1
DPL-09B ← DPL-09A + DPL-09 inventory + DPL-B1
DPL-10B ← DPL-10A + DPL-10 inventory + DPL-B1
DPL-14B ← DPL-14A + DPL-06 + DPL-B1
```

They may proceed laterally.

No open B2 packet may treat another B2 packet as settled authority. Cross-lane unknowns are carried explicitly to the B2 integration gate.

## DPL-09B split rule

The B2 authorisation is for the structure/ground/moisture/materials **family**, not a forced mega-PR.

If authority recovery shows materially independent method/evidence systems, split the family into restart-safe subpackets before substantive implementation.

---

# DPL-12 admission rule

**DPL-12 remains held.**

B1 produced strong contracts but still no multiple concrete domain objects from which to derive a trustworthy shared orchestration schema.

DPL-12 may re-enter only after the B2 integration gate has at least:

1. three real screening manifests from heterogeneous public sources;
2. one England technical family with exact sources, applicability, admitted methods and external-evidence boundaries;
3. one London strategic planning family with exact policy/guidance authority and deterministic/evidence/judgement split;
4. one site-interface response family represented conditionally without construction pseudo-precision;
5. demonstrated common identity/provenance seams across those objects.

The intended dependency is:

```text
real instances / bounded methods
          ↓
compare recurring seams
          ↓
minimal shared DPL-12 substrate
```

not:

```text
generic schema first
          ↓
force every domain to fit it
```

---

# Held work

Until the B2 integration / DPL-12 admission gate, hold:

- DPL-08C+;
- DPL-09C–J;
- DPL-10C–F;
- broader DPL-11 implementation children;
- corpus expansion beyond the three-site B2 pilot;
- DPL-12;
- DPL-13 through DPL-18.

DPL-13 remains the canonical first integrated deployment compile only after the required substrate and target/site/interface inputs exist.

---

# Programme maturity

DPL remains **M2 — Developed** after B1.

B1 materially strengthens M2: the programme now has controlled site-interface authority, England source/applicability authority, planning source/status authority and an empirical corpus protocol.

M3 is not yet earned because DPL still lacks:

- admitted real site manifests;
- substantive technical obligations from an England domain;
- substantive planning obligations/methods;
- an authored site-interface response family;
- shared deployment orchestration;
- a canonical deployment compile.

Do not promote maturity because the documentation is extensive.

---

# DRW concurrency

DRW may continue against controlled Reference House geometry.

The concurrency rule remains:

> **DRW may represent controlled architectural authority; it may not invent site/ground-interface or technical construction authority ahead of DPL/specialist evidence. DPL may create duties and interface authority; it may not mutate controlled house geometry through drawing code.**

DRW-11 has so far respected this boundary by refusing unearned permanent-opening/service-riser construction detail where technical authority is absent.

Until DPL-08B closes, DRW should not author a construction-complete solution for:

- ground-to-plinth relationship;
- site-side accessible entrance approach/threshold;
- foundation/ground interface;
- retaining condition;
- external site-drainage connection.

Analytical or explicitly unresolved representation remains permissible where otherwise authorised.

DPL-08B does not require DRW to pause.

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

After DPL-B1 / #373 merges, open and execute **Wave B2 only**:

- DPL-08B — ground / datum / plinth / accessible approach;
- DPL-09B — structure / ground / moisture / materials;
- DPL-10B — London strategic residential / design target;
- DPL-14B — three-site real-corpus pilot.

Then perform a **B2 integration / DPL-12 admission gate**.

Do not start DPL-12, select the first borough, expand the full corpus, open the remaining regulatory/planning child queues or begin DPL-13+ merely because B1 is complete.
