# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Foundation gate:** [#344 — DPL-FR — foundation coherence review gate](https://github.com/adamnoden/architecture/issues/344)  
**Programme state:** foundation developed and coherence-reviewed; Wave A authorised after DPL-FR merge  
**Foundation baseline:** `e581d18db732a8bd6ae9a10a967cf038ce5459eb`

## Purpose

DPL establishes the machinery required to ask whether the controlled Ovid’s House Reference House can be deployed honestly onto real land under declared external normative contexts without confusing architectural authorship, site evidence, law/policy, compiler proof or professional judgement.

The end-state question is:

> **Can this controlled Reference House revision be deployed on this site, under this exact target composition and evidence state, while preserving its architectural identity and satisfying every obligation due for the requested assurance profile?**

The legitimate top-level answers are:

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

## Canonical authority model

DPL-01 through DPL-06 freeze the following model:

```text
OVID'S HOUSE ARCHITECTURAL PROPOSITION
        +
SELECTED PATTERNS / GRAMMAR / PROJECT DECISIONS
        ↓
REFERENCE HOUSE
controlled authored architecture
        │
        │             REAL / REFERENCE SITE
        │                    ↓
        │          SITE EVIDENCE / ASSUMPTIONS
        │                    ↓
        │               SITE CLAIMS
        │                    ↓
        │               SITE MANIFEST
        │
        │        EXTERNAL NORMATIVE SOURCES
        │                    ↓
        │          COMPILER TARGET SNAPSHOTS
        │                    ↓
        │        TARGET COMPOSITION MANIFEST
        │
        │              PROJECT SCENARIOS
        │                    │
        └────────────┬───────┴───────────────┐
                     ↓                       │
              DEPLOYMENT CASE                │
                     │                       │
          architectural authoring            │
                     ↓                       │
            DEPLOYMENT CANDIDATE              │
                     │                       │
                     └────────┬──────────────┘
                              ↓
                         HOUSE KERNEL
                 admitted formal representation
                              ↓
                    METAMORPH COMPILER
                              ↓
                OBLIGATIONS + EVIDENCE STATE
                              ↓
             COMPATIBLE / UNRESOLVED /
                   INCOMPATIBLE
             @ exact assurance profile
```

The diagram is an authority model, not a claim that every arrow is already implemented.

## Architectural authority

### Ovid’s House architectural proposition / doctrine

The manuscript and governing-principle authority own the architectural claims the project is prepared to defend.

House Kernel is **not** a synonym for doctrine.

A site-specific or jurisdiction-specific constraint may affect a project without becoming Ovid’s House doctrine.

### House Kernel

House Kernel is the narrower formal architectural/computational system used where selected facts, relationships, invariants, obligations and proof boundaries can legitimately be explicit.

It may represent architectural commitments; representation does not transfer ownership of those commitments to the computational system.

### Reference House

The Reference House is one controlled, authored architectural integration fixture.

It is not:

- a universal house;
- a compiler output;
- an infinitely deformable parametric family;
- proof that every plot should accept its geometry.

DPL-02 freezes a conformance contract over a specific controlled Reference House revision.

## Reference House conformance

The five DPL-02 classes are:

1. **identity invariants** — categorical conditions whose loss creates another architectural proposition;
2. **protected order** — earned current design decisions that are not deployment parameters;
3. **permitted discrete variants** — bounded alternatives already licensed by current authority;
4. **site-interface freedoms** — land/building relationships intentionally left site-dependent;
5. **implementation freedoms / open detail** — bounded product/engineering/detail choices that do not alter architectural identity.

The governing conformance rule is:

> **Deployment freedoms are opt-in.**

A plausible redesign is not automatically an authorised deployment variant.

A failed candidate does not itself prove site incompatibility. `INCOMPATIBLE` requires a blocking condition plus exhaustion of the relevant admitted conformance-preserving routes, or a failure invariant across them.

## Real site and site manifest

The real site exists independently of the repository and can never be assumed to be exhaustively captured by a model.

DPL-06 defines the **site manifest** as an immutable, versioned site-state snapshot containing evidence-backed site claims, explicit unknowns and explicit assumptions.

A consequential site claim should preserve, where material:

- stable identity;
- subject/entity;
- proposition or value;
- unit/reference frame;
- spatial scope;
- temporal/source scope;
- epistemic basis;
- evidence references;
- assumptions/dependencies;
- supersession/contradiction state;
- relevant source limitations.

Unknown is first-class.

Missing does not mean false, zero, safe or not applicable.

Assumptions are explicit provisional dependencies with replacement evidence and invalidation consequences; they are not weak facts.

The manifest must not contain derived normative conclusions such as:

- “planning compliant”;
- “Reference House compatible”;
- “buildable envelope”;
- “foundation type required”;
- “acceptable overlooking”;
- “suitable for development”.

Those belong to downstream evaluation, architectural authoring or external determination.

## Reference Site

The Reference Site is a future synthetic, explicitly authored site fixture used to make hidden site assumptions concrete for one canonical deployment exercise.

It may use the DPL-06 manifest structure, but its provenance must remain synthetic/assumed rather than surveyed or observed.

It is not evidence for a statistically typical London plot.

Real-plot trials later determine the empirical deployment envelope.

## Site interface

DPL extends the project’s existing interface logic one level outward:

```text
LAND / SITE
    ↓
DESIGNED SITE INTERFACE
    ↓
REFERENCE HOUSE
```

DPL-08 will define the exact boundary.

Likely responsibilities include:

- foundation/geotechnical response;
- local finished levels and approach transitions;
- perimeter dry-zone integration;
- below-ground foul/surface-water connection;
- incoming utility routing outside controlled building geography;
- step-free/entrance approach conditions;
- retaining conditions;
- selected external servicing and landscape/building junctions.

A site-interface freedom is not a universal adapter. If the site cannot be resolved without crossing DPL-02 protected order, deployment must reject or explicitly reopen architecture.

## External normative authority and target composition

A compiler target retains the existing computational definition:

> **A named, immutable, versioned representation of the external normative environment against which defined claims are compiled.**

DPL-05 freezes the deployment-level **target stack** as a human-facing name for an immutable **target composition manifest** over a typed graph of independently versioned target snapshots.

It is not an ordered inheritance stack.

No precedence may be inferred from:

- array/list order;
- geographic nesting;
- “more local” status;
- publication recency.

Any precedence, supplementation, supersession or incorporation relation must be grounded in the actual external authority system.

Initial target families include conceptually:

- `BUILDING_CONTROL` — initial jurisdiction: England;
- `STRATEGIC_PLANNING` — initial strategic context: Greater London;
- `LOCAL_PLANNING` — a selected London borough/local layer where actually relevant.

Building control and planning remain distinct authority systems even when both constrain one deployment case.

## Target identity and time

“England”, “London” or “2026” are not sufficient target identities.

DPL preserves four independent version identities:

1. external source/source-snapshot version;
2. target-model version;
3. method-implementation version;
4. target-composition version.

A corrected compiler method does not imply that the law changed.

A better target interpretation does not imply that the source changed.

Changing one constituent target changes composition identity without rewriting historical results.

Target applicability may legitimately remain conditional on future project events, including transitional conditions. Unknown applicability fails closed when the distinction is due for the requested assurance profile.

## Site facts and target applicability

The canonical relationship is:

```text
SITE CLAIM
    ↓
TARGET APPLICABILITY / METHOD
    ↓
OBLIGATION
    ↓
RESULT
```

Not:

```text
SITE MANIFEST
  planningCompliant = true
  regulationRequired = false
```

Site/project facts remain outside targets. Targets provide the normative conditions that act on those facts.

## Obligations, evidence and result semantics

DPL reuses the existing House Kernel / Metamorph Compiler evidence architecture.

### Obligation result

Canonical conceptual states remain:

- `PASS`;
- `EXTERNALLY_DISCHARGED`;
- `FAIL`;
- `UNSUPPORTED`;
- `UNRESOLVED`;
- `NOT_APPLICABLE`;
- `WARNING`;
- `SUPERSEDED`.

DPL creates no competing low-level status enum.

### Evidence lifecycle

Evidence lifecycle remains separate:

- `PLANNED`;
- `PRESENT`;
- `ACCEPTED`;
- `REJECTED`;
- `STALE`;
- `SUPERSEDED`;
- `WITHDRAWN`.

### Method / authority

Resolution may be native/deterministic, geometry/calculation based, accepted external evidence, professional determination, planning/statutory judgement, inspection/commissioning or explicitly unsupported.

The method/authority remains visible even when the result is satisfactory.

### Presentation phrases are not statuses

“Evidence required” usually means an `UNRESOLVED` obligation with a known external evidence route.

“Judgement required” usually means an `UNRESOLVED` obligation whose admitted method is a professional/planning/statutory determination.

Neither phrase creates a new result status.

## Deployment conclusion

The only current top-level DPL conclusions are:

- `COMPATIBLE`;
- `UNRESOLVED`;
- `INCOMPATIBLE`.

Every conclusion is scoped to:

- exact Reference House revision;
- exact conformance-contract revision;
- exact deployment candidate/case;
- exact site-manifest identity;
- exact target-composition identity;
- exact evidence/source state;
- exact deployment assurance profile.

`COMPATIBLE` never means approved, built, universally suitable or physically verified.

## Deployment assurance profiles

DPL-04 freezes six **assurance profiles**, not project stages:

1. `SCREENING`;
2. `FEASIBILITY`;
3. `PLANNING_CASE`;
4. `TECHNICAL_DESIGN`;
5. `CONSTRUCTION`;
6. `COMMISSIONED_AS_BUILT`.

A profile is a claim boundary. It determines which applicable blocking obligations are due now and which may legitimately remain future-due.

Profiles are not:

- project-wide M1–M5 maturity;
- RIBA Plan of Work stages;
- a procurement sequence;
- a confidence score;
- one irreversible progress counter.

The same deployment case may be recompiled under later profiles as evidence matures.

New evidence may rewind a previously positive result without making the earlier, narrower profile result dishonest.

## Decision-critical acceleration

A normally later obligation becomes due earlier where credible current evidence shows that resolving it is necessary to support the present land/project decision.

A known red flag may not be hidden as “future-due” merely because its category normally matures later.

This applies to issues such as severe ground risk, dominant tree constraints, sewer/easement conflicts, heritage/context blockers, impossible service access or other conditions capable of overturning the current decision.

## Deployability is broader than Building Regulations

The DPL model has room for materially different constraint families including:

- physical plot geometry and levels;
- neighbouring/context conditions;
- trees and ecology;
- geotechnics, groundwater, contamination and ground gas;
- flood/water/drainage conditions;
- utilities and capacity;
- street/access conditions;
- construction logistics;
- heritage/administrative designations;
- title/private constraints, easements and covenants;
- Party Wall / boundary relationships where relevant;
- planning policy and judgement;
- specialist engineering/product evidence;
- explicit project cost/viability constraints where chosen.

These are not one ruleset. DPL’s job is to preserve their distinct authority while allowing them to constrain one deployment case.

## Initial geographic posture

The first implementation context is:

- **building-control jurisdiction:** England;
- **strategic planning context:** Greater London;
- **local planning layer:** a selected London borough/local target where applicable;
- **project class:** a new detached dwelling, subject to the actual DPL-09/DPL-10 applicability model.

These are implementation targets, not universal doctrine.

Publication treatment remains deferred to DPL-17.

## Foundation set — complete

The six foundation packets are complete and controlled:

- [DPL-01 — deployment ontology and governing model](dpl-01-deployment-ontology.md) / #300;
- [DPL-02 — Reference House conformance contract](dpl-02-reference-house-conformance.md) / #301;
- [DPL-03 — assurance and deployment-result semantics](dpl-03-assurance-result-semantics.md) / #302;
- [DPL-04 — deployment assurance profiles](dpl-04-compilation-maturity.md) / #303;
- [DPL-05 — compiler target-stack model](dpl-05-target-stack-model.md) / #304;
- [DPL-06 — site manifest model](dpl-06-site-manifest-model.md) / #305.

The mandatory foundation review is recorded in [DPL Foundation Coherence Review](dpl-foundation-coherence-review.md) / #344.

Its result is:

> **PASS WITH BOUNDED CORRECTIONS**

No foundation packet reopens.

## Programme maturity

After the foundation review, DPL is **M2 — Developed** at programme scope.

The problem is no longer merely framed: substantive models now exist and their principal trade-offs/boundaries are visible.

DPL is not yet M3 because the workstream has not coordinated the actual Reference Site, England/London target inventories, site interface, deployment compiler substrate or real-site evidence into one deployment case.

## Downstream programme

The provisional DPL-07 through DPL-18 architecture remains valid with one sequencing refinement: **concrete Reference Site/target/due-diligence work should attack the foundation before shared compiler orchestration is frozen.**

### Wave A — authorised after DPL-FR merge

#### DPL-07 — Reference Site

Define one explicit synthetic Reference Site using DPL-06 site-claim semantics and DPL-05 contextual identity.

**Dependencies:** DPL-05 + DPL-06 + DPL-FR.

#### DPL-09 — England regulatory target inventory

Recover the actual England new-dwelling authority/applicability corpus first. Separate law, guidance, standards, routes and transitional conditions. Split into bounded technical-domain child packets only after the inventory reveals the correct seams.

**Dependencies:** DPL-05 + DPL-FR.

#### DPL-10 — London planning target inventory

Recover the actual Greater London + local planning authority relationship, including what is deterministic, evidence-led and judgement-dependent.

**Dependencies:** DPL-05 + DPL-06 + DPL-FR.

#### DPL-11 — site due-diligence / non-planning constraints

Define how title/private rights, boundary/Party Wall relationships, utilities/sewers, ground, trees, access and similar constraints enter deployment without being mislabeled as planning policy.

**Dependencies:** DPL-06 + DPL-FR.

These four lanes may proceed laterally.

### Wave B — deliberately sequenced

#### DPL-08 — house ↔ land site interface

Formalise foundations, levels, perimeter dry zone, drainage, utility entry, approach/access, retaining conditions and other legitimate site-conditioned packages.

**Dependencies:** DPL-02 + DPL-06 + DPL-07.

#### DPL-12 — deployment compiler substrate

Implement shared target + site + conformance + evidence + assurance-profile orchestration.

Its semantic dependencies are already present, but implementation is intentionally deferred until DPL-07/09/10/11 provide enough concrete material to attack the abstractions.

#### DPL-14 — real London plot corpus

Assemble a deliberately varied genuine plot corpus early enough to attack the site ontology, but only after DPL-07 establishes a usable first manifest field discipline.

**Core dependencies:** DPL-02 + DPL-06; sequencing dependency on initial DPL-07 site-manifest discipline.

### Integration

#### DPL-13 — canonical deployment compile

Compile Reference House × Reference Site × selected England/London target/context with explicit evidence/obligation ledger.

**Expected dependencies:** DPL-07 through DPL-12.

#### DPL-15 — real-plot deployment trials

Attempt deployment against the real-plot corpus. Record incompatible sites, legitimate site-interface adaptations, missing evidence and upstream weaknesses.

**Dependencies:** DPL-13 + DPL-14.

#### DPL-16 — deployment envelope v1

Derive the supported site class from trial evidence rather than inventing a “typical London plot”.

**Dependency:** DPL-15.

#### DPL-17 — publication integration

Decide the small amount of England/London/site/deployment framing that genuinely belongs in the physical publication.

**Dependencies:** DPL-13 + DPL-16.

#### DPL-18 — adversarial validation

Attack the integrated programme for architectural mutation, legal/regulatory overclaiming, planning simplification, stale targets, false site certainty, omitted constraints and compiler proof-boundary inflation.

**Dependencies:** integrated DPL-13 through DPL-17 evidence.

## Dependency shape

```text
FOUNDATION — COMPLETE

DPL-01
   ├── DPL-02
   └── DPL-03 ── DPL-04
          ├──── DPL-05
          └──── DPL-06 (with DPL-01)

             ↓
          DPL-FR
             ↓

WAVE A

DPL-07     DPL-09     DPL-10     DPL-11
   │          │           │          │
   └──DPL-08  │           │          │
              └─────┬─────┴──────┬───┘
                    │            │
                DPL-12       DPL-14
                    │            │
                    └────DPL-13──┘
                              │
                           DPL-15
                              │
                           DPL-16
                           ┌──┴──┐
                        DPL-17 DPL-18
```

The diagram is programme guidance, not an external-authority hierarchy.

## Relationship with the existing compiler

DPL begins from the current controlled computational baseline.

It does **not** silently create RH-C6, broaden RH-C5 into whole-building compliance or reinterpret existing numeric correspondence as statutory adequacy.

Future computation should reuse established values:

- deterministic identity;
- source/method/result provenance;
- fail-closed unsupported inputs;
- explicit supported-domain boundaries;
- reproducible artefacts;
- selective invalidation;
- bounded proof language.

A materially new deployment proof family must be admitted explicitly rather than retroactively described as already proven.

## Relationship with the Reference House

The current Reference House remains controlled architectural source until deployment evidence earns an explicit upstream rewind.

DPL may eventually discover:

- a site-interface omission;
- a regulatory conflict;
- a planning conflict;
- an unmodelled site dependency;
- a conformance ambiguity;
- genuine architectural brittleness or defect.

The correct response is to route that finding to its owning authority.

Do not patch site data, compiler logic or drawings merely to preserve a green result.

## Relationship with HFI and DRW

HFI is closed. Its surviving conclusions live in their destination authorities rather than as a parallel DPL layer.

DRW may continue against controlled Reference House geometry. DPL does not authorise drawing-side mutation. If deployment later rewinds Reference House authority, affected drawings must return through the established drawing controls.

## Publication restraint

Most DPL machinery remains backstage.

The physical publication should remain an architectural work, not a regulations/planning manual.

Possible reader-facing consequences are deferred to DPL-17 and may include only:

- a clear Reference House jurisdiction/context statement;
- explanation of the declared Reference Site/context;
- selected deployment/evidence material where it materially deepens the architectural argument.

## Programme anti-goals

DPL must not become:

- a generic parametric house generator;
- a claim that one immutable house fits arbitrary London land;
- a system that mutates protected architecture until any site passes;
- a Building Regulations encyclopedia disconnected from architecture;
- a planning-permission predictor;
- a substitute for competent engineering, planning, legal or statutory review;
- an excuse to treat Approved Documents as identical to law;
- an undated mutable “England target”;
- an aggregate compatibility/compliance/confidence score;
- a site database whose missing fields default optimistically;
- a public regulatory appendix disguised as architecture;
- an implicit whole-building compiler authority.

## Packet discipline

Every DPL packet must be restart-safe.

Record at minimum:

`packet → baseline main SHA → authority recovered → exact question → source/evidence set → findings + rejected alternatives → artefacts/changes → checks → authority/proof consequences → downstream dependencies → exact next authorised packet`

Split a packet when it:

- mixes materially independent ontology, architectural, legal or site questions;
- jumps from modelling to substantive rule encoding without a frozen contract;
- requires several unrelated Reference House rewinds;
- creates a new compiler proof family unexpectedly;
- starts treating professional/planning judgement as deterministic computation;
- grows large enough that a later session could not reconstruct its state from the repository alone.

## Current authorised work

After DPL-FR merges, open and execute **Wave A only**:

- DPL-07 — Reference Site;
- DPL-09 — England regulatory target inventory;
- DPL-10 — London planning target inventory;
- DPL-11 — site due-diligence / non-planning constraints.

Do not begin DPL-08, DPL-12, DPL-14 or later integration merely because the foundation exists. Follow the sequencing above and let concrete evidence attack the model before implementation hardens it.
