# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Programme state:** framed; DPL-01 is the first authorised packet  
**Planning baseline:** `c0c12629ec21befc68cef778396b7bad51207bb7`

## Purpose

Ovid’s House currently separates general architectural doctrine from the coordinated Reference House, and the computational workstream deliberately refuses to claim whole-building technical or regulatory adequacy beyond its bounded proof families.

DPL establishes the next layer: the machinery required to ask whether the Reference House can be deployed honestly onto real land under a declared jurisdiction and planning context.

The end-state question is:

> **Can the Ovid’s House Reference House be deployed on this real residential plot without violating its doctrine, architectural identity, applicable hard constraints or known site facts?**

The answer may be **yes**, **no**, or **unresolved pending named evidence**. All three are legitimate outcomes.

DPL is not a generic house generator, not a Building Regulations product and not a substitute for planning permission, specialist engineering or competent statutory review.

## Governing proposition

> **The doctrine says what we believe.**  
> **The Reference House demonstrates it.**  
> **The Reference Site makes the demonstration concrete.**  
> **The target stack introduces the world of rules.**  
> **The real site introduces reality.**  
> **The site interface absorbs legitimate difference.**  
> **The compiler prevents us from lying to ourselves.**

The core architectural rule is:

> **Compatibility before adaptation.**

A plot is not automatically entitled to deform the Reference House. If deployment would require changes that destroy the house’s architectural identity or violate controlled doctrine, the correct result is incompatibility rather than a progressively mutated “fit”.

This preserves an existing Ovid’s House position: adaptability belongs where change is useful, while principal rooms, structural order, stairs, openings, axes, proportions and other defining architectural relationships may remain deliberately permanent.

## System model

The programme is built around distinct objects rather than one undifferentiated “site-compliant house”.

```text
HOUSE KERNEL
    +
REFERENCE HOUSE
    +
TARGET STACK
    +
SITE MANIFEST
    +
EVIDENCE
    +
SCENARIOS
    ↓
COMPILER
    ↓
DEPLOYMENT RESULT
```

The final semantics of these objects are owned by DPL-01. Until that packet closes, the following are working meanings only.

### House Kernel / doctrine

The general Ovid’s House architectural position. It should remain useful beyond one plot, one borough and one regulatory snapshot.

### Reference House

The authored architectural integration fixture that demonstrates the doctrine as a coherent house. It is not presumed to be infinitely deformable.

### Reference Site

A downstream synthetic but plausible site used to make hidden site assumptions explicit and to produce one canonical integrated specimen. It is not a claim that one “typical London plot” represents London.

### Real site

An actual candidate plot whose known facts, unknowns and evidence are represented through a site manifest.

### Site manifest

The controlled representation of site facts and unknowns: geometry, levels, orientation, neighbours, trees, ground, drainage, utilities, access, title/private constraints, designations, construction logistics and other relevant conditions.

### Target stack

The versioned external rule environment against which deployment is evaluated. It is expected to carry jurisdiction, authority layers, building/use class, effective date, transitional basis, statutory requirements, guidance, standards and planning-policy layers without collapsing them into one category.

### Evidence

Survey, calculation, certification, specialist report, product data, statutory source or other material required to support an obligation or result. Evidence must retain source, date, scope and applicability.

### Scenario

A declared non-statutory or project-selected condition against which the design is deliberately tested, such as future climate, utility outage, ageing occupants or credible failure states.

### Deployment result

The structured output that identifies proved conditions, failures, unknowns, missing evidence, judgement-dependent matters, legitimate site adaptations, conformance status and unresolved obligations.

### Deployed instance

A site-conditioned implementation that remains inside the Reference House conformance contract.

### Deployment envelope

The empirically derived class of sites onto which the Reference House can deploy without ceasing to be itself. The envelope should be learned from canonical and real-plot trials rather than invented before evidence exists.

## The site as a designed interface

DPL extends the project’s interface logic one level outward:

```text
LAND / SITE
    ↓
DESIGNED SITE INTERFACE
    ↓
REFERENCE HOUSE
```

The future site interface should absorb legitimate differences between plots while preserving the enduring architecture. Candidate responsibilities include:

- foundation/geotechnical response;
- finished ground levels and local transitions;
- perimeter dry-zone integration;
- foul and surface-water connection;
- incoming utility routes;
- external approach and step-free transition;
- retaining conditions;
- selected external servicing;
- landscape/building drainage junctions;
- construction interfaces where they materially affect deployability.

The exact boundary is not frozen by this programme-control document. It is owned downstream by DPL-08 after the conformance, site and Reference Site foundations exist.

## Authority model

DPL must keep separate categories that are often casually collapsed.

### Ovid’s House authority

- doctrine / House Kernel;
- Reference House decisions;
- controlled project-selected performance targets;
- scenarios and design tests.

### External normative authority

- statute / legal requirements;
- Building Regulations requirements;
- official compliance guidance;
- British/other referenced standards;
- national, strategic and local planning policy;
- other external technical guidance where relevant.

### Site evidence

- measured survey;
- title/private-law evidence;
- utilities and sewer records;
- arboricultural, geotechnical, flood, contamination or other specialist evidence;
- observed/verified context conditions.

### Human/professional judgement

Some planning, engineering, architectural and statutory matters remain judgement-dependent. The compiler may expose the question, inputs and evidence requirement; it must not impersonate an approval authority or professional opinion.

## Initial geographic posture

The initial deployment context is expected to be:

- **Building-regulation jurisdiction:** England;
- **Strategic planning context:** Greater London;
- **Local planning layer:** a London borough target selected downstream;
- **Building type:** new detached dwelling, subject to DPL-05 confirmation of how type/class belongs in the target stack.

These are implementation targets, not universal doctrine.

The publication should eventually signal this clearly but quietly. DPL does not authorise repeated UK/England badges or turn the book into a jurisdiction manual.

## Temporal/version discipline

“England” and “London” are not sufficient target identities by themselves.

External rules change. Transitional provisions can mean two projects submitted or commenced at different times legitimately use different technical regimes. Planning policy also changes on a different timetable.

A target must therefore carry enough temporal identity to reproduce what rules were believed applicable to a given compile. Later target updates must not silently rewrite the historical meaning of an earlier deployment result.

## Result and assurance discipline

DPL must expose heterogeneous conclusions rather than compress them into a seductive scalar score.

Candidate result states, to be tested and frozen by DPL-03, include:

`PROVED / FAIL / UNKNOWN / EVIDENCE REQUIRED / JUDGEMENT REQUIRED / NOT APPLICABLE`

Likewise, Reference House conformance should report explicit preserved invariants, permitted variants, site packages and non-conforming changes rather than “94% retained” or similar pseudo-precision.

Examples of the intended distinction:

```text
stair geometric criterion          PROVED
structural foundation capacity     EVIDENCE REQUIRED
flood policy applicability         PROVED / NOT APPLICABLE
neighbour daylight effect          ASSESSMENT REQUIRED
local character response           JUDGEMENT REQUIRED
Reference House principal axis     PRESERVED
principal room depth change        NON-CONFORMING
```

The final vocabulary and precedence rules belong to DPL-03.

## Compilation maturity

Deployment is progressively evidenced rather than magically known at one moment.

Candidate stages, to be tested by DPL-04, are:

1. **screening**;
2. **feasibility**;
3. **planning**;
4. **technical design**;
5. **construction**;
6. **commissioned / as-built**.

An early land listing may support only approximate plot geometry and access. Later work may add title evidence, topo survey, arboriculture, utility records, drainage, geotechnics, specialist calculations, product evidence and commissioning results.

The same site can therefore compile several times with different legitimate claim boundaries. Unknowns remain first-class rather than being silently defaulted.

DPL compilation maturity is not the project-wide M1–M5 maturity system and must not be presented as such.

## Deployability is broader than Building Regulations

DPL must eventually have a place for conditions capable of making an otherwise coherent house undeployable or materially different, including:

- plot geometry and levels;
- orientation and surrounding built form;
- neighbour windows/amenity conditions;
- trees;
- geotechnics and groundwater;
- flood, ground gas and contamination where relevant;
- foul and surface-water drainage;
- utilities and capacity;
- street/access conditions;
- fire/service access where applicable;
- construction logistics and working space;
- heritage/environmental designations;
- title constraints, easements and covenants;
- Party Wall and boundary relationships where relevant;
- planning policy and local judgement;
- specialist engineering and product evidence;
- cost/viability where explicitly treated as a project constraint.

These are not one rule family. Their commonality is only that real deployment cannot honestly erase them.

## Programme decomposition

DPL is intentionally split into small dependency-linked issues. The foundation set is open now; downstream issues are recorded here but must not be opened automatically.

### Foundation set — open

#### [DPL-01 — deployment ontology and governing model](https://github.com/adamnoden/architecture/issues/300)

Freeze the canonical objects, authority flow, definitions and anti-collapses used throughout the programme.

#### [DPL-02 — Reference House conformance contract](https://github.com/adamnoden/architecture/issues/301)

Define what must remain true for a site-conditioned implementation still to count as the Reference House; distinguish invariants, protected relationships, permitted variants, site packages and architectural rewinds.

#### [DPL-03 — assurance and deployment-result semantics](https://github.com/adamnoden/architecture/issues/302)

Freeze result states, evidence/provenance semantics, applicability, staleness, unknowns and professional-judgement boundaries.

#### [DPL-04 — compilation maturity model](https://github.com/adamnoden/architecture/issues/303)

Define what may honestly be claimed at screening, feasibility, planning, technical, construction and commissioned/as-built stages.

#### [DPL-05 — compiler target-stack model](https://github.com/adamnoden/architecture/issues/304)

Define the abstract versioned jurisdiction/rule stack. Do not yet encode the substantive England/London corpus.

#### [DPL-06 — site manifest model](https://github.com/adamnoden/architecture/issues/305)

Define how real-site facts, evidence, unknowns and assumptions are represented independently of rules/policy.

### Foundation dependency graph

```text
DPL-00 (#299)
   │
DPL-01 (#300)
   ├──────── DPL-02 (#301)
   ├── DPL-03 (#302) ── DPL-04 (#303)
   │       │
   │       └────────── DPL-05 (#304)
   └────────────────── DPL-06 (#305)
```

DPL-02 may proceed after DPL-01. DPL-03 may proceed after DPL-01. DPL-04 depends on DPL-03. DPL-05 and DPL-06 depend on the DPL-01/DPL-03 semantics sufficiently to avoid incompatible models.

Where execution ordering inside the open foundation set becomes ambiguous, prefer finishing shared semantics rather than allowing each branch to invent its own vocabulary.

## Mandatory foundation review gate

**Do not open DPL-07 onward merely because DPL-01 through DPL-06 are individually complete.**

First perform a programme-level coherence review covering:

- no duplicated or contradictory object meanings;
- conformance and site facts remain separate;
- target identity carries authority and time correctly;
- assurance states compose across site/rule/evidence objects;
- maturity does not manufacture certainty;
- the system remains compatible with current compiler identity/provenance architecture;
- Reference House architectural identity remains protected;
- no legal/planning model overclaims machine authority;
- no hidden requirement has already forced an unacknowledged house redesign.

This is the cheapest formal point to alter course.

## Planned downstream work — recorded, not yet authorised

The following issue names are provisional programme architecture. They should be opened only after the foundation review and may be split or renamed if the preceding work demonstrates a better seam.

### DPL-07 — Reference Site

Research and define one synthetic but plausible London Reference Site. Make every canonical site assumption explicit rather than letting the Reference House float in a white void.

**Expected dependencies:** DPL-05 + DPL-06.

### DPL-08 — house ↔ land site interface

Formalise foundations, levels, perimeter dry zone, drainage, service entry, approach/access, retaining conditions and other legitimate site-conditioned packages.

**Expected dependencies:** DPL-02 + DPL-06 + DPL-07.

### DPL-09 — England regulatory target

Establish a dated authoritative target for a new dwelling in England, including applicability, law/guidance/standards separation, transitional basis and obligation inventory. This gate should first inventory the actual corpus and then spawn bounded technical-domain children where justified; it must not become one mega “do all Building Regulations” packet.

**Expected dependency:** DPL-05.

### DPL-10 — London planning target

Establish the Greater London strategic layer and borough plug-in model; separate machine-checkable constraints, evidence requirements and planning judgement. As with DPL-09, inventory before decomposing substantive child work.

**Expected dependencies:** DPL-05 + DPL-06.

### DPL-11 — site due-diligence / non-planning constraints

Define how title/private constraints, easements/covenants, Party Wall relationships, sewers, utilities, trees, abnormal ground, construction access and similar deployment conditions enter the system without being mislabeled as planning policy.

**Expected dependency:** DPL-06.

### DPL-12 — deployment compiler substrate

Implement shared target + site + conformance + evidence + maturity orchestration only after the semantic foundations exist. Do not begin by encoding a giant regulations ruleset.

**Expected dependencies:** DPL-02 through DPL-06.

### DPL-13 — canonical deployment compile

Compile Reference House × Reference Site × selected England/London target. Produce the first serious deployment obligation/evidence ledger and identify contradictions or missing authority.

**Expected dependencies:** DPL-07 through DPL-12.

### DPL-14 — real London plot corpus

Assemble a deliberately varied set of genuine candidate-style London plots and represent them through the site manifest. This may proceed laterally once DPL-02 and DPL-06 are stable; it should not wait for every regulatory rule to be encoded.

**Expected dependencies:** DPL-02 + DPL-06.

### DPL-15 — real-plot deployment trials

Attempt deployment against the corpus. Record incompatibilities, legitimate adaptations, missing site facts, target failures and model weaknesses. Do not protect the Reference House from a genuine incompatibility finding.

**Expected dependencies:** DPL-13 + DPL-14.

### DPL-16 — deployment envelope v1

Derive the supported site class from the actual trial evidence rather than inventing a “typical London plot” first. Define the eventual land-screening output.

**Expected dependency:** DPL-15.

### DPL-17 — publication integration

Only after canonical and real-site deployment work exists, determine the small amount of England/London/site framing that belongs in the book. Most machinery should remain below the publication surface.

**Expected dependencies:** DPL-13 + DPL-16.

### DPL-18 — adversarial validation

Attack the integrated programme for legal/regulatory overclaiming, planning simplification, stale targets, false site certainty, architectural mutation, Reference House overfit, omitted real-world constraints and compiler proof-boundary inflation.

**Expected dependencies:** DPL-13 through DPL-17.

## Full intended dependency shape

```text
DPL-00
   │
DPL-01
   ├──────── DPL-02 ───────────────────────────────┐
   │                                               │
   ├── DPL-03 ── DPL-04                            │
   │       │                                       │
   │       └── DPL-05 ──┬── DPL-09                 │
   │                    └── DPL-10                 │
   │                                               │
   └──────── DPL-06 ──┬── DPL-07 ── DPL-08        │
                      ├── DPL-11                    │
                      └────────────── DPL-14         │
                                                    │
DPL-02/03/04/05/06 ───────────── DPL-12            │
                                      │             │
DPL-07/08/09/10/11/12 ───────── DPL-13             │
                                      │             │
                         DPL-14 ───────┘
                                      │
                                  DPL-15
                                      │
                                  DPL-16
                                   ┌──┴──┐
                                DPL-17 DPL-18
```

The diagram is planning guidance rather than immutable architecture. Later foundation work may discover a better dependency seam; any change must be recorded explicitly rather than silently drifting.

## Concurrency

After DPL-01 and enough of DPL-03 are stable, the programme is intentionally capable of lateral work:

```text
HOUSE TRACK        DPL-02
ASSURANCE TRACK    DPL-04
TARGET TRACK       DPL-05 → later DPL-09 / DPL-10
SITE TRACK         DPL-06 → later DPL-07 / DPL-11 / DPL-14
```

DPL-08 and DPL-12 become deliberate integration points.

Real-site corpus work should begin early enough to attack the ontology. Do not spend months perfecting a synthetic site model only to discover that ordinary London plots contain unmodelled categories of constraint.

## Relationship with the existing compiler

DPL begins from the current controlled computational baseline.

It does **not** silently create RH-C6, broaden RH-C5 into whole-building compliance or reinterpret existing numeric correspondence as statutory adequacy.

Future DPL computation should reuse established project values where appropriate:

- deterministic source/method/result identity;
- provenance and lineage;
- fail-closed handling of unsupported inputs;
- controlled representation boundaries;
- reproducible artefacts;
- explicit proof scope.

If deployment requires a materially new proof family, DPL should admit it deliberately under the new deployment architecture rather than retroactively pretending it was already proven.

## Relationship with the Reference House

The current Reference House remains the controlled architectural source until a DPL finding earns an explicit upstream rewind.

DPL may discover:

- a site-interface omission;
- a regulatory conflict;
- a planning conflict;
- an unmodelled site dependency;
- a conformance ambiguity;
- a genuine house defect.

The correct response is to route the finding to its owning authority. Do not patch drawing code, deployment code or site data merely to preserve a green result.

## Relationship with HFI and DRW

HFI is closed. Its integrated conclusions are now owned by their destination authorities: governing principles, Reference House source, N17 delivery verification and the RH-11 specialist-review handoff. Unresolved HFI closeout items remain with their explicit downstream owners rather than HFI as a parallel authority layer.

DRW may continue against controlled geometry. DPL does not authorise drawing-side architectural mutation. If a later deployment finding changes Reference House authority, affected drawings must be regenerated/revalidated through the existing DRW controls.

## Publication restraint

Most DPL work is backstage evidence architecture.

The physical publication should remain an architectural work, not a regulation/planning manual. The likely eventual reader-facing effect is small:

- a clear Reference House jurisdiction/context statement;
- an explanation that the Reference House is demonstrated against a declared Reference Site and technical/planning context;
- selected evidence or deployment material only where it deepens the architectural argument.

DPL-17 owns the exact treatment after the system has earned it.

## Programme anti-goals

DPL must not become:

- a generic parametric house generator;
- a claim that one immutable house fits arbitrary London land;
- a system that mutates the Reference House until any site “passes”;
- a Building Regulations encyclopedia disconnected from architecture;
- a planning-permission predictor;
- a substitute for competent engineering, planning or statutory review;
- an excuse to treat Approved Documents as identical to law;
- an undated “England target” that silently changes over time;
- an aggregate compliance/compatibility score;
- a site database whose unknown fields are silently defaulted;
- a reason to duplicate public-facing regulatory material throughout the book;
- an implicit new whole-building compiler authority.

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

## First authorised work

**DPL-01 through DPL-06 only.**

The recommended execution sequence is:

1. DPL-01 — freeze ontology/governing model;
2. DPL-03 — freeze assurance vocabulary sufficiently for dependent models;
3. DPL-02 may proceed laterally once DPL-01 is stable;
4. DPL-04 after DPL-03;
5. DPL-05 and DPL-06 once shared ontology/assurance semantics are stable;
6. perform the mandatory DPL foundation coherence review;
7. only then decide whether to open DPL-07 onward.

No Reference Site construction, substantive England rule encoding, London planning implementation, real-plot deployment or publication integration is authorised merely by opening this programme.