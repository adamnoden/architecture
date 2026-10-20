# DPL-01 — Deployment Ontology and Governing Model

**Issue:** [#300 — DPL-01 — deployment ontology and governing model](https://github.com/adamnoden/architecture/issues/300)  
**Parent programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Baseline `main`:** `00edf057a6611cc0ed75478ff5034cc5067f8412`  
**Status:** ontology frozen for DPL foundation work

## Question

> **What exactly are we modelling when Ovid’s House moves from an authored, site-independent Reference House toward evaluation and deployment on a real site?**

The purpose of DPL-01 is not to encode regulations, design a Reference Site, define site schemas, classify Reference House invariants or implement deployment software. It is to make the conceptual boundaries strong enough that those later tasks cannot silently use the same word for different kinds of authority.

## Conclusion

DPL should not be modelled as:

```text
HOUSE KERNEL
    +
SITE
    +
RULES
    ↓
COMPILER
    ↓
ADAPTED HOUSE
```

That formulation collapses the architectural proposition into the formal system, treats a represented site as the site itself, flattens several external authorities into “rules” and lets software appear to author architecture.

The governing model is instead:

```text
OVID'S HOUSE ARCHITECTURAL PROPOSITION
        +
SELECTED PATTERNS / GRAMMAR / PROJECT DECISIONS
        ↓
REFERENCE HOUSE
        │
        │             REAL SITE
        │                 ↓
        │          SITE EVIDENCE / ASSUMPTIONS
        │                 ↓
        │            SITE MANIFEST
        │
        │          EXTERNAL NORMATIVE SOURCES
        │                 ↓
        │        VERSIONED COMPILER TARGETS
        │                 ↓
        │            TARGET STACK
        │
        │          PROJECT SCENARIOS
        │                 │
        └────────────┬────┴────────────┐
                     ↓                 │
              DEPLOYMENT CASE          │
                     │                 │
          architectural authoring      │
                     ↓                 │
            DEPLOYMENT CANDIDATE       │
                     │                 │
                     └──────┬──────────┘
                            ↓
                    HOUSE KERNEL
              formal representation layer
                            ↓
                  METAMORPH COMPILER
                            ↓
             OBLIGATIONS + EVIDENCE STATE
                            ↓
                  DEPLOYMENT RESULT
                            │
             ┌──────────────┼───────────────┐
             ↓              ↓               ↓
         compatible      unresolved     incompatible
             │                              │
             ↓                              ↓
      deployed instance              reject this site /
      may be authored                reopen an owning
      and controlled                 architectural decision
```

The diagram is an authority model, not a claim that every arrow is already implemented.

Two rules govern the whole programme:

> **Compatibility before adaptation.**

and:

> **The compiler evaluates architecture; it does not silently author it.**

## Authority recovered

DPL-01 does not invent a parallel ontology. It reconciles existing project authority.

### Architectural proposition

`README.md`, the manuscript and governing principles establish **Ovid’s House** as the architectural design-research project and public proposition. The project deliberately separates general architectural claims from project-specific decisions, evidence and computational machinery.

### Architectural specificity

`docs/development/architectural-specificity-boundary.md` already establishes the rule:

> **Generalise the reason; localise the taste.**

Doctrine, reusable patterns, supported technical domains, architectural grammar, project/site configuration and the Reference House are separate layers. Downstream specificity does not become upstream doctrine merely because it recurs.

### Reference House

`docs/reference-house/README.md` defines the **Reference House** as one deliberately specific integration test. It is an authored architectural proposition, not proof of Ovid’s House and not a universal house type. Real-site and deployment context is explicitly a further layer.

### House Kernel and Metamorph Compiler

`docs/computational/README.md` and `compiler/README.md` define **House Kernel** as the formal architectural/computational system used where facts, relationships, invariants, obligations and proof boundaries can legitimately be explicit. **Metamorph Compiler** is the executable implementation that compiles and checks those representations.

This is narrower than the architecture.

A critical DPL-00 working phrase therefore needs semantic correction:

> **House Kernel is not a synonym for Ovid’s House doctrine.**

The architectural proposition is owned by Ovid’s House/manuscript. House Kernel is the formal system through which selected facts and obligations may later be represented and checked.

### Targets

`docs/computational/compiler-targets.md` already defines a **compiler target** as:

> **A named, immutable, versioned representation of the external normative environment against which defined claims are compiled.**

DPL must preserve that definition. A DPL **target stack** is therefore a deployment-level composition of one or more independently versioned target families; it is not a replacement definition of compiler target.

### Obligations and results

`docs/computational/validity-and-obligations.md` already defines an **obligation** as an explicit proposition that must be established, with subject, source authority, applicability, method, evidence and present result.

DPL does not create a second kind of obligation.

### Evidence

`docs/computational/evidence-and-provenance.md` already distinguishes source fact, applicability, obligation, method, evidence and result. Evidence has scope, provenance, dependencies and lifecycle; the mere existence of a document does not establish a proposition.

DPL site evidence, professional evidence and statutory decisions must reuse that distinction.

### Current claim ceiling

`project/authority.ts` currently fixes the project at virtual Reference House design, bounded internal compiler proof, with regulatory compliance, construction adequacy, physical validation and competent external review not established.

DPL-01 does not raise any of those authority fields.

## Canonical vocabulary

The following terms are canonical for DPL foundation work.

### Ovid’s House architectural proposition / doctrine

The architectural claims, principles and arguments the project is prepared to defend as architecture at their stated scope.

**Owned by:** manuscript / governing-principle authority and their evidence trail.

**Not:** House Kernel; the Reference House; a compiler target; a legal code.

A site-specific or jurisdiction-specific requirement may constrain an Ovid’s House project without becoming Ovid’s House doctrine.

### House Kernel

The formal architectural/computational system used where selected facts, relationships, invariants, obligations and proof boundaries can legitimately be explicit.

**Owned by:** computational conceptual authority.

**Not:** the totality of Ovid’s House architecture; a design generator; a regulatory code; the public doctrine itself.

House Kernel can represent selected architectural commitments. Representation does not transfer ownership of those commitments to the formal system.

### Metamorph Compiler

The executable implementation that compiles and checks admitted House Kernel representations within declared supported domains and proof contracts.

**Owned by:** `compiler/` implementation and its computational proof records.

**Not:** an architect; planning authority; building-control body; engineer; whole-building approval engine.

A deployment compiler may later be built on Metamorph Compiler. DPL-01 does not claim that capability presently exists.

### Reference House

The controlled, authored, deliberately specific architectural integration fixture for Ovid’s House.

It combines selected doctrine, patterns, grammar, programme, morphology, technical families and project decisions in one house so conflicts become concrete.

**Owned by:** Reference House architectural source and its explicit gates.

**Not:** a universal house; a site-neutral law of good housing; a compiler output; a claim that every plot must accept its geometry.

### Reference Site

A synthetic, explicitly authored site fixture used to make otherwise hidden site assumptions concrete for one canonical deployment exercise.

**Owned by:** future DPL-07.

**Not:** a statistical “typical London plot”; evidence about real London prevalence; a real site; a planning target.

A Reference Site may later be represented through the same site-manifest structure used for real sites, but its provenance must remain **synthetic / assumed**, not surveyed or observed.

### Real site

The actual physical, legal, infrastructural and contextual condition of a particular parcel and its relevant surroundings.

A real site exists independently of the project model and can never be assumed to be exhaustively captured by the repository.

**Not:** the site manifest.

The project can only hold claims and evidence about the real site. New evidence may therefore correct earlier site representations.

### Site fact / site claim

A proposition about a real or synthetic site that is relevant to deployment: boundary geometry, level, tree, sewer, access condition, neighbouring opening, ground condition or similar.

For a real site, a consequential site fact should be traceable to evidence, observation, authoritative record or an explicit assumption.

A site claim is not automatically true merely because it appears in a manifest.

### Site evidence

Evidence supporting, qualifying or contradicting a site claim: survey, title record, utility record, ground investigation, arboricultural report, inspection or other scoped source.

**Owned by:** the evidence graph and future DPL-06 site-manifest semantics.

**Not:** the site fact itself.

One evidence item may support several claims; one claim may require several evidence sources.

### Site manifest

A controlled, versioned representation of site claims, explicit unknowns, assumptions and evidence references used for a particular deployment evaluation.

**Owned by:** future DPL-06.

**Not:** the real site; a policy interpretation; a planning permission; a bucket for every project requirement.

The manifest represents what the project presently knows or assumes about the site. It must remain correctable as better evidence arrives.

### Site interface

The architectural boundary through which legitimate site-specific conditions are resolved without casually rewriting the enduring Reference House.

It is expected to include selected relationships around ground support, levels, perimeter drainage, service entry, approach/access, retaining conditions and other building/land junctions where site variation genuinely belongs.

**Owned by:** future DPL-08, informed by DPL-02 and DPL-06/07.

**Not:** a magical adapter that makes every site compatible; permission to alter any Reference House feature; the site itself.

The site interface is an architectural integration boundary, not a general-purpose mutation layer.

### Compiler target

Use the existing computational definition unchanged:

> **A named, immutable, versioned representation of the external normative environment against which defined claims are compiled.**

A target carries its own jurisdiction, temporal basis, applicability and source provenance.

**Not:** site facts, architectural preference, supported-domain capability or project brief.

### Target stack

The typed composition of the external target snapshots selected for one deployment case.

A target stack may later contain separate target families such as building control, planning or another external normative system. Those authorities remain independently identifiable and versioned.

**Owned by:** future DPL-05.

**Not:** one flattened hierarchy in which all external requirements acquire the same authority; a replacement for compiler-target identity; project configuration.

“Stack” means composition for a deployment case, not that building control, planning and every other authority are one linear legal chain.

### Supported-domain profile

The declared boundary of what House Kernel / Metamorph Compiler legitimately knows how to represent or establish for the case being evaluated.

This remains the existing computational concept.

**Not:** a target; a statement that conditions outside the domain are architecturally invalid; evidence that represented conditions are physically adequate.

Leaving the supported domain is a proof-system boundary, not necessarily a deployment failure.

### Requirement source

The source of a proposition that may create an obligation: Ovid’s House project requirement, architectural grammar, law, target, technical standard, physical relationship, client brief, product limitation, process requirement or another explicitly scoped authority.

Requirement sources must remain distinguishable even when they ask for similar geometry.

### Obligation

Use the existing computational meaning: an explicit proposition that must be established for a stated subject under a stated source authority and applicability condition.

An obligation should preserve why it exists, what it applies to, how it may be discharged and what evidence/result currently supports it.

**Not:** a generic todo item; proof merely because it has been listed.

### Evidence

A scoped artefact, determination, observation, calculation or other epistemic support for a proposition.

Evidence carries provenance, scope, dependencies and lifecycle.

**Not:** the proposition itself; automatic proof; architecture merely because it supports an architectural claim.

### Scenario

A declared condition under which the project deliberately evaluates behaviour beyond or alongside ordinary present-state facts: for example future climate, prolonged utility outage, ageing occupancy or a credible failure state.

**Owned by:** the project/deployment configuration that selects it and by the evidence/method that evaluates it.

**Not:** automatically law; automatically a site fact; automatically doctrine.

A scenario can become a project requirement only through an explicit act of adoption. Otherwise it remains a test condition.

### Reference House conformance contract

The future DPL-02 contract that states which architectural identity conditions must remain true, which changes are permitted, which are bounded and which require rejection or an upstream architectural rewind.

DPL-01 establishes the need for this contract but does not classify individual Reference House elements.

### Deployment case

The reproducible evaluation context for asking a deployment question.

Conceptually, a deployment case binds exact identities for:

```text
Reference House revision
+ Reference House conformance contract
+ site manifest revision
+ target stack
+ selected scenarios / project requirements
+ supported-domain profile
+ relevant evidence snapshot
```

The term is intentionally configuration-like. It is the deployment counterpart of the existing computational **build configuration** idea rather than a new architectural authority.

A deployment result is meaningless if the case it evaluated cannot be reconstructed.

### Deployment candidate

An authored proposal for how the Reference House would occupy and meet a specific site under a deployment case.

A candidate may be:

- the unadapted/canonical Reference House placed on the site for screening;
- a handed or otherwise explicitly permitted variant;
- a site-conditioned architectural state using permitted site-interface packages;
- a proposal that later proves non-conforming or otherwise unacceptable.

**Owned by:** architectural authoring / Reference House project authority for that site-specific proposal.

**Not:** an automatic compiler output.

The compiler may expose that a candidate fails and may identify obligations or permitted parameter ranges. Any consequential architectural mutation remains an authored decision unless a future bounded generative mechanism earns explicit authority.

### Adaptation

An explicit authored transformation from the controlled Reference House toward a deployment candidate in response to site, target or project conditions.

Adaptation is legitimate only where the Reference House conformance contract permits it or where an explicit upstream architectural decision redefines the Reference House.

**Not:** any change necessary to make a site pass.

A required change can be real and still be disallowed because it would destroy Reference House identity.

### Conformance

A relation between a deployment candidate and the Reference House conformance contract.

It answers:

> **Does this candidate remain a valid instance of the controlled Reference House identity?**

**Not:** regulatory compliance; grammar conformance; doctrine consistency; site compatibility; planning acceptability.

Those may all be relevant simultaneously and must remain separately reportable.

### Compatibility

A scoped relation between a specified Reference House revision, a specified site representation, a specified target stack and the available evidence/maturity of a deployment case.

It answers, at that declared scope:

> **Can this Reference House be deployed here without a known requirement for non-conforming architectural change and without a known hard target/site failure?**

Compatibility is therefore **not a permanent property of the site or house alone**.

It may change when:

- the Reference House changes;
- the conformance contract changes;
- better site evidence arrives;
- a target changes;
- a different target route applies;
- a previously unknown condition becomes known.

DPL-03/04 will define the exact result vocabulary and what level of evidence is sufficient to make a positive compatibility claim at each maturity stage.

Until then, missing evidence must not be converted into compatibility by optimism.

### Incompatibility

A known deployment conflict for which the current case has no conformance-preserving route under the selected target/site conditions.

Examples in principle could include:

- site geometry that cannot accommodate a protected architectural invariant;
- a known access or boundary condition that cannot be resolved through the permitted site interface;
- a hard target condition that cannot be met without a non-conforming change.

**Not:** missing information; unsupported computation; a merely inconvenient site; architectural dislike.

Unknown and incompatible are different epistemic states.

### Deployment result

The structured evaluation of one exact deployment case and candidate at one declared maturity/evidence state.

A deployment result may contain:

- Reference House conformance findings;
- target-derived obligations and their states;
- site-derived obligations and unknowns;
- accepted evidence and stale/missing evidence;
- supported-domain limits;
- scenario results;
- findings requiring human/professional judgement;
- a bounded compatibility conclusion where earned.

**Owned by:** the DPL/computational evaluation process and its evidence/provenance record.

**Not:** architectural source authority; planning permission; building-control approval; an instruction to mutate the house.

### Deployed instance

A site-specific authored architectural project state accepted as remaining within the Reference House conformance contract for a declared deployment case.

A deployed instance is a controlled architectural instance, not merely a passing compiler artefact.

**Not:** necessarily built; necessarily approved; necessarily complete; necessarily physically verified.

A deployed instance can exist at design stage. Physical construction and as-built evidence are later states.

### Deployment envelope

A versioned, evidence-backed description of the class of sites/contexts for which deployment has been demonstrated or bounded sufficiently to support a stated screening claim.

It is derived from canonical and real-site trials rather than declared first and then defended.

A deployment envelope should identify at least the Reference House/conformance revision, relevant target context, evidence/trial corpus and maturity of the claim.

**Owned by:** future DPL-16.

**Not:** a universal property of Ovid’s House; a guarantee for every unseen site; an input invented to make the later trials pass.

## Object classes and ownership

The DPL ontology contains several fundamentally different classes of thing.

| Class | Examples | Authority behaviour |
|---|---|---|
| Architectural authority | Ovid’s House proposition, Reference House, deployment candidate, deployed instance | Authored and changed only through owning architectural sources |
| Formal representation | House Kernel representations, supported-domain profile | Represents bounded semantics; does not acquire architectural authority by encoding them |
| Executable machinery | Metamorph Compiler, admitted methods | Evaluates declared propositions within proof scope |
| External normative authority | compiler targets, planning-policy targets, standards/method sources | Imported/versioned with provenance; not authored by Ovid’s House |
| Contextual reality | real site, physical surroundings, utility/ground conditions | Exists independently of the model |
| Context representation | Reference Site, site manifest, assumptions | Authored/recorded representations whose provenance must remain explicit |
| Epistemic support | surveys, calculations, tests, professional determinations, statutory decisions | Supports bounded propositions; can become stale or be contradicted |
| Derived evaluation | obligation states, deployment result, compatibility finding | Consequence of identified inputs/authority; never silently becomes upstream source truth |
| Empirical summary | deployment envelope | Derived from trials; must retain scope and evidence basis |

This classification is more important than any future TypeScript interface. Later implementation should preserve the distinctions rather than forcing every item into one generic `Constraint` object.

## Authority flow

### Architectural flow

```text
OVID'S HOUSE PROPOSITION
        ↓
patterns / grammar / project decisions
        ↓
REFERENCE HOUSE
        ↓
conformance contract (DPL-02)
        ↓
DEPLOYMENT CANDIDATE
        ↓
DEPLOYED INSTANCE, if accepted
```

The compiler may test relationships on this path but does not own the authored architectural transitions.

### Site flow

```text
REAL SITE
   ↓ observed / measured / recorded through
SITE EVIDENCE
   ↓ supports or challenges
SITE CLAIMS
   ↓ controlled representation
SITE MANIFEST
```

The arrow must never be reversed. Changing the manifest does not change the site.

### Normative flow

```text
LAW / POLICY / STANDARD / OTHER EXTERNAL AUTHORITY
        ↓ provenance + applicability interpretation
IMMUTABLE TARGET SNAPSHOT
        ↓ typed composition
TARGET STACK
        ↓ creates applicable obligations
DEPLOYMENT CASE
```

A DPL result may reveal an interpretation problem. It does not rewrite the external source.

### Evidence/result flow

```text
REQUIREMENT / FACT / RELATIONSHIP
        ↓
APPLICABILITY
        ↓
OBLIGATION
        ↓
METHOD
        ↓
EVIDENCE / DETERMINATION
        ↓
RESULT
```

This is the existing computational evidence model and remains authoritative inside DPL.

### Finding-to-authoring loop

A deployment result can legitimately trigger a human/architectural response:

```text
DEPLOYMENT RESULT
        ↓
known conflict
        ↓
choose one explicitly:
  - reject the site
  - select another permitted variant
  - author a site-interface solution
  - obtain missing evidence
  - choose/justify another legitimate target route
  - reopen an upstream architectural decision
```

The result itself does not select and author one of those responses merely because software could do so.

## Compatibility before adaptation

“Compatibility before adaptation” is now a precise ordering rule.

### First question

Can the controlled Reference House, including already permitted variants and site-interface freedoms, be deployed on the site under the declared case?

### Only then

If a conflict appears, identify **what kind** of conflict it is before changing anything:

- missing/weak site evidence;
- unsupported computational condition;
- target failure;
- Reference House conformance failure;
- ordinary site-interface design work;
- professional/judgement requirement;
- genuine upstream Reference House defect.

### Rejection is legitimate

If resolution requires a non-conforming change and no upstream architectural revision is justified, `INCOMPATIBLE SITE` is a successful, truthful outcome.

This prevents the project from treating land as an excuse to dissolve its architectural proposition.

## Distinctions that must remain reportable

Several questions can all produce “no” without meaning the same thing.

| Question | Example conclusion | What it does **not** mean |
|---|---|---|
| Ovid’s House consistency | project proposition not satisfied | illegal |
| Reference House conformance | candidate no longer counts as the Reference House | bad architecture in general |
| Grammar conformance | candidate leaves G-01 | Reference House necessarily invalid if grammar is intentionally changed upstream |
| Site claim state | neighbour window position unknown | incompatible site |
| Supported-domain state | compiler cannot establish proposition | proposition false |
| Target conformance | selected target method fails | planning refused / building control formally rejected |
| External evidence state | engineer determination missing | known technical failure |
| Planning judgement | professional/authority determination required | deterministic fail |
| Physical conformance | constructed condition not verified | design source invalid |
| Statutory approval | approval not obtained | compiler failure |

DPL downstream work must not compress these into one `valid` Boolean.

## Target stack is composition, not flattening

The existing computational target model already says planning and Building Regulations are different legal/decision systems. DPL preserves that.

Conceptually a deployment case may eventually use:

```text
TARGET STACK
  ├── England building-control target <version>
  ├── Greater London strategic-planning target <version>
  ├── borough planning target <version>
  └── other admitted external target families, if earned
```

The branch structure is important. A target stack is not one document called “London rules”.

Each target retains:

- source authority;
- jurisdiction;
- temporal basis;
- applicability;
- proof route;
- evidence requirements;
- independent version identity.

DPL-05 owns the exact composition/precedence model.

## Reference Site and real sites use the same ontology differently

A useful later design is likely to let both Reference Site and real sites use the DPL-06 site-manifest structure while preserving provenance.

### Reference Site

```text
claim source: synthetic project assumption
status: deliberately authored fixture
purpose: canonical integration / falsification
```

### Real site

```text
claim source: survey / record / observation / explicit provisional assumption
status: evidence-bearing project context
purpose: actual deployment evaluation
```

This allows shared tooling without allowing a synthetic fixture to masquerade as field evidence.

## Deployment candidate is intentionally first-class

DPL-00 originally implied a compiler pipeline that could be read as turning Reference House + site + targets directly into a deployed house. That is too strong.

A **deployment candidate** is required between context and evaluation because architecture must remain authored.

Without this object, the system would have only two choices:

1. the compiler mutates the Reference House itself; or
2. every site-conditioned change is smuggled into the site interface as if no architectural judgement occurred.

Both are wrong.

The candidate makes the act visible:

```text
Reference House
   + site/target findings
   + permitted transformation rules
   + architectural judgement
        ↓
Deployment candidate
        ↓
formal evaluation
```

DPL-02 will determine which transformations can remain within conformance. DPL-08 will determine what work properly belongs to the site interface.

## Deployment result cannot author source truth

A derived result may state:

- opening adjustment would be required;
- foundation response remains unresolved;
- target condition fails;
- western service entry is incompatible with the present candidate;
- a handed variant would remain within a permitted class, if DPL-02 later establishes that permission.

It must not silently rewrite the Reference House source or emit a new architectural state as authoritative merely because it found a possible solution.

If future work earns bounded generative design capability, that capability must have an explicit architectural-authority contract and review gate. DPL-01 does not assume one.

## Deployment envelope is a conclusion, not a premise

The eventual deployment envelope should be discovered by challenge:

```text
Reference House + conformance contract
        ↓
Reference Site trial
        ↓
real-site corpus
        ↓
failures / permitted adaptations / unknowns
        ↓
empirically bounded deployment envelope
```

Starting with a preferred envelope and then encoding the rules to preserve it would invert the evidence chain.

A later land-search tool may use the deployment envelope for screening. The screening tool does not own the envelope’s truth.

## Forbidden collapses

The following are ontology errors, not merely wording preferences.

### `House Kernel = Ovid’s House doctrine`

Wrong. House Kernel is the formal system; Ovid’s House/manuscript owns the architectural proposition.

### `site manifest = real site`

Wrong. The manifest is a versioned representation of claims, unknowns and evidence about a site.

### `Reference Site = typical London site`

Wrong. It is one synthetic fixture and carries no statistical authority merely because it is plausible.

### `target stack = all project constraints`

Wrong. Site facts, project requirements, scenarios, architectural commitments and supported-domain limits are separate from external normative targets.

### `building-control target + planning target = one regulation target`

Wrong. Distinct authority families must remain independently versioned and reportable.

### `compiler target = supported domain`

Wrong. One says what external normative environment is selected; the other says what the software legitimately knows how to establish.

### `evidence = fact`

Wrong. Evidence supports a proposition within scope; it may be stale, contradictory or insufficient.

### `unknown = incompatible`

Wrong. Missing evidence is not a known site failure.

### `not yet disproved = compatible`

Wrong. Positive compatibility needs a claim boundary and sufficient evidence for the maturity stage defined later by DPL-03/04.

### `Reference House conformance = regulatory compliance`

Wrong. Architectural identity and external legal requirements are different axes.

### `target conformance = statutory approval`

Wrong. Machine result and authority decision are different processes.

### `deployment result = deployed instance`

Wrong. A result is an evaluation record; a deployed instance is an authored architectural project state.

### `compiler finds a solution = compiler owns the architectural mutation`

Wrong. A diagnostic or candidate suggestion does not acquire architectural authority automatically.

### `site-specific recurrence = doctrine`

Wrong. Repeated site responses move upstream only after abstraction and independent justification under the architectural-specificity rule.

### `deployment envelope = universal guarantee`

Wrong. It is a scoped empirical summary tied to a Reference House/conformance revision, target context and evidence corpus.

### `one compatibility score`

Wrong unless a future quantity has a real defensible mathematical meaning. Heterogeneous failures and unknowns must remain explicit.

## Anti-pattern examples

### Bad: mutate until green

```text
plot too narrow
  ↓
shrink principal room
  ↓
move stair
  ↓
remove courtyard
  ↓
compiler passes
```

This may produce another house. It does not demonstrate deployment of the Reference House.

### Good: preserve ownership

```text
plot too narrow
  ↓
required change touches protected relationship
  ↓
DPL-02 conformance says not permitted
  ↓
INCOMPATIBLE SITE
```

or, if the conflict reveals a genuine architectural defect:

```text
plot conflict
  ↓
explicit upstream Reference House review
  ↓
architectural decision changes owning source
  ↓
new controlled Reference House revision
  ↓
re-evaluate deployment
```

### Bad: policy as site fact

```text
site.max_height = 9m
```

when `9m` is actually an interpretation of a planning policy.

### Good: preserve chain

```text
site fact: street / context / measured levels
planning target: policy source + version
interpretation / method: stated
obligation/result: derived
```

### Bad: “London compliant”

A deployment result that merges Building Regulations, strategic planning, borough policy and professional judgement into one green badge destroys the most important distinctions in the system.

## Consequences for the foundation packets

DPL-01 intentionally pushes detail downstream rather than solving everything here.

### DPL-02 — Reference House conformance contract

DPL-02 now has a precise job:

- define the identity relation between Reference House and deployment candidate;
- classify invariants, protected relationships, permitted discrete variants, bounded parameters and site-interface freedoms;
- define when adaptation is inside conformance, outside conformance or requires explicit upstream Reference House revision;
- keep grammar conformance, doctrine consistency and Reference House conformance separate;
- do not create an aggregate similarity score.

DPL-02 must treat adaptation as **authored architectural change**, not compiler mutation.

### DPL-03 — assurance and result semantics

DPL-03 should **start from the existing computational status/evidence model**, not invent a parallel DPL vocabulary because the programme draft happened to use different words.

Existing semantics already distinguish, among others:

- `PASS`;
- `EXTERNALLY_DISCHARGED`;
- `FAIL`;
- `UNSUPPORTED`;
- `UNRESOLVED`;
- `NOT_APPLICABLE`;
- `WARNING`;
- `SUPERSEDED`.

DPL-03 may add or present deployment-specific distinctions only where a real epistemic state is missing. Terms such as “judgement required” or “evidence required” may prove useful as obligation/method presentations, but should not automatically become duplicate top-level result states.

DPL-03 must also define the exact difference between compatibility, unresolved compatibility and incompatibility without treating lack of evidence as either pass or fail.

### DPL-04 — compilation maturity model

DPL-04 owns how much evidence is enough to make which deployment claim at screening, feasibility, planning, technical design, construction and as-built stages.

It must preserve that:

- a deployment case can be evaluated repeatedly as evidence matures;
- an earlier positive screening conclusion can be invalidated later;
- “potentially compatible” is not the same claim as a fully evidenced technical deployment;
- DPL maturity remains distinct from project-wide M1–M5 maturity.

### DPL-05 — target-stack model

DPL-05 must reuse the existing compiler-target definition rather than redefine it.

Its new work is the **composition layer**:

- how several independently versioned target families are selected for one deployment case;
- how authority and source precedence remain explicit;
- how building-control and planning targets coexist without flattening;
- how effective dates and transitional bases bind to the case;
- how target changes invalidate affected results;
- whether any additional external target families are justified.

DPL-05 should not place site facts, scenarios, project preferences or supported-domain capability inside the target stack.

### DPL-06 — site manifest model

DPL-06 must model a representation of site knowledge, not the real site itself.

It should distinguish at minimum:

- site claim / fact;
- source evidence;
- explicit assumption;
- unknown;
- provenance/date;
- dependency / supersession;
- derived interpretation/result.

A policy conclusion must not be authored as a raw site fact.

The same manifest architecture may later support a synthetic Reference Site and a real site, but their provenance classes must remain visibly different.

## Consequences for later packets

### DPL-07 — Reference Site

DPL-07 should author a **synthetic fixture**, not a “typical London plot”. It must state assumptions rather than manufacture evidence.

### DPL-08 — site interface

DPL-08 should define the legitimate architectural building/land integration boundary. It must not become a generic location for every site-driven mutation.

### DPL-09 / DPL-10 — England regulation / London planning

These should populate distinct target families under DPL-05 semantics. Neither should be permitted to collapse approval, guidance, law, policy and professional judgement into a single deterministic rule corpus.

### DPL-11 — non-planning due diligence

Private rights, title restrictions, Party Wall relationships, utility/sewer conditions and similar matters may not all belong to the same ontology class. DPL-11 must place each according to actual authority rather than labelling the whole set “site constraints”.

### DPL-12 — compiler substrate

Implementation should occur only after DPL-02 through DPL-06 freeze the necessary contracts. DPL-12 should orchestrate existing formal concepts where possible rather than building a second evidence/obligation system.

### DPL-13 onward

Canonical and real-site trials evaluate authored candidates against exact deployment cases. Their failures are evidence about deployment, not permission to deform the Reference House until the trials become green.

## Unresolved questions deliberately passed forward

DPL-01 does not answer the following because the owning packet has not yet earned the answer.

### Reference House identity

Which exact spatial, compositional, tectonic and technical relationships are invariant, protected, parameterised or site-interface freedoms?

**Owner:** DPL-02.

### Result vocabulary

What exact top-level deployment statuses should be emitted, and how should existing computational statuses compose into compatibility language?

**Owner:** DPL-03.

### Maturity claims

What site evidence and unresolved-state tolerance is legitimate at screening versus later technical stages?

**Owner:** DPL-04.

### Target composition and precedence

How should independently versioned building-control, strategic-planning and local-planning targets be composed, and when does one source modify or supersede another?

**Owner:** DPL-05.

### Site-manifest schema

Which site claims deserve first-class identity, what counts as evidence, how assumptions/unknowns are expressed and how source conflict is handled?

**Owner:** DPL-06.

### Reference Site assumptions

What synthetic physical/contextual condition gives the Reference House a useful canonical site without pretending to represent London statistically?

**Owner:** DPL-07.

### Site-interface extent

Which foundations, drainage, level transitions, service-entry, external-access, retaining and other conditions properly belong to the interface rather than the enduring house or wider site works?

**Owner:** DPL-08.

### Private-law and due-diligence classification

Whether a particular covenant, easement, sewer agreement, Party Wall relationship or utility condition should be represented as a site claim, external target, evidence-backed right/constraint or separate process obligation.

**Owner:** DPL-11.

### Generative assistance

Whether future software should ever propose bounded site adaptations, and if so what architectural-authority and review contract would be required.

**Owner:** not authorised by the current DPL programme; only open if a concrete later case earns it.

## Adversarial checks

The ontology was challenged against several failure modes before freeze.

### Could DPL swallow House Kernel?

No. DPL composes context for deployment, while House Kernel remains the formal system. DPL does not redefine computational ontology or proof authority.

### Could House Kernel swallow Ovid’s House doctrine?

No. The architectural proposition remains independently owned and can contain judgement that should never become executable rules.

### Could the Reference House become an immutable object incapable of meeting real land?

No. DPL-02/08 may establish legitimate variants and site-interface freedoms. The guardrail is against **unbounded** adaptation, not against all site response.

### Could “compatibility before adaptation” reject every normal site?

Potentially, and that would be useful evidence. If ordinary London sites repeatedly require the same architectural change, the project must decide explicitly whether the Reference House is too brittle, the target site class is narrower than assumed or an architectural invariant should be revised. The compiler must not resolve that political/architectural choice by stealth.

### Could a synthetic Reference Site bias the system?

Yes. That is why it carries no prevalence authority and must later be attacked by a varied real-site corpus before DPL-16 derives an envelope.

### Could target modelling become a regulation encyclopedia?

Yes. The ontology prevents this by treating targets as external normative snapshots selected for defined deployment questions, while unsupported/judgement-dependent matters remain visible.

### Could site evidence become a document dump?

Yes. The existing evidence architecture prevents this: evidence must identify what proposition it supports, its scope, dependencies and lifecycle.

### Could a deployment result become a green badge?

Not without violating the ontology. Heterogeneous conformance, target, evidence, supported-domain and judgement states must remain reportable.

### Could the compiler become a design generator by accident?

The first-class deployment candidate prevents this. A result can diagnose and perhaps later offer bounded suggestions, but architecture remains authored until a separate authority contract is deliberately created.

## Frozen governing rules

DPL foundation work should now treat the following as frozen unless contradictory evidence earns a deliberate reopen:

1. **Ovid’s House doctrine and House Kernel are distinct authorities.**
2. **The Reference House is authored architecture, not compiler output.**
3. **A real site and its site manifest are distinct.**
4. **A Reference Site is synthetic and carries no statistical prevalence authority.**
5. **A compiler target retains the existing immutable/versioned external-normative definition.**
6. **A target stack composes independently identifiable targets without flattening their authority.**
7. **Site facts, targets, scenarios, project requirements, supported-domain limits and evidence remain separate classes.**
8. **DPL reuses the existing obligation/evidence/provenance model rather than inventing a parallel one.**
9. **A deployment candidate is an authored architectural proposal.**
10. **The compiler evaluates deployment candidates; it does not silently author them.**
11. **Reference House conformance, target compliance, grammar conformance, doctrine consistency, supported-domain status and statutory approval remain distinct axes.**
12. **Compatibility is a scoped relation for an exact deployment case, not a permanent property of a site or house.**
13. **Unknown is not incompatible, and absence of a known failure is not positive compatibility.**
14. **Incompatibility is a legitimate successful result where no conformance-preserving route exists.**
15. **A deployed instance is a controlled architectural state, not merely a passing result and not necessarily a built house.**
16. **The deployment envelope is derived from trials and evidence; it is not invented first.**
17. **No aggregate compatibility or architectural-retention score is authorised.**
18. **Downstream deployment findings can trigger explicit upstream review but never silently rewrite an owning source.**

## What DPL-01 changes

DPL-01 changes **semantics only**.

It does not:

- alter Reference House geometry;
- change any architectural doctrine;
- create a site schema;
- create a compiler target;
- encode England regulations;
- encode London planning policy;
- implement software;
- widen House Kernel supported domain;
- raise `project/authority.ts`;
- create a deployed instance;
- claim that any real site is compatible.

Its material correction is the authority separation needed for later work to proceed safely.

## Next authorised work

After this ontology is accepted:

- **DPL-02** may begin the Reference House conformance contract;
- **DPL-03** may begin assurance/result reconciliation against the existing computational status model.

DPL-04 remains downstream of DPL-03. DPL-05 and DPL-06 should not freeze detailed schemas until the shared DPL-03 assurance semantics are sufficiently stable.

The programme-level DPL-01→06 coherence gate remains mandatory before DPL-07 onward.