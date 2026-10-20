# DPL-10 — London Planning Target and Borough Plug-in Inventory

**Issue:** [#349 — DPL-10 — inventory the London planning target and borough plug-in model](https://github.com/adamnoden/architecture/issues/349)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Research date:** 2026-10-20  
**Baseline `main`:** `6206f4b65dbb30b64bb2d4fe1de4d1367f634e0a`  
**Planning geography studied:** Greater London, with a future selected borough/local plug-in  
**Project class studied:** one new low-rise detached dwelling on a residential plot  
**Status:** authority/composition inventory; **not** a planning appraisal, permission prediction or release-grade planning target

## Question

> **What planning authorities, policy layers, site facts, evidence requirements and judgement-dependent tests constrain deployment of the Reference House on a London residential plot, and how should the strategic London layer compose with a borough/local target?**

DPL-10 answers the authority/composition and decomposition question.

It does not decide whether the Reference House would receive planning permission on any real site.

## Executive conclusion

A release-grade London planning target cannot be one ordered object called `LONDON_RULES`.

Planning in London has at least four materially different layers:

1. **the statutory development plan**;
2. **national policy and other material considerations**;
3. **site/project evidence and judgement**;
4. **the external statutory decision / permission record**.

For a London site, the development plan itself is a composition rather than a borough-only document. The relevant composition can include:

- the Mayor's spatial development strategy / London Plan;
- adopted borough development-plan documents / local-plan material that forms part of the development plan;
- a made neighbourhood development plan where one applies;
- other development-plan components admitted by the current statutory regime.

Those components do **not** compose by an invented rule such as:

```text
more local wins
newer guidance wins
borough beats London
London beats borough
```

Where development-plan policies conflict, the statutory conflict rule and actual source status must be represented explicitly.

Outside the development plan sit important material considerations including the current National Planning Policy Framework, adopted London Plan Guidance, local supplementary guidance/design material, relevant emerging policy, planning history and case-specific evidence. Their role and weight are not equivalent to development-plan policy.

The deployment compiler may:

- identify applicable policy/evidence questions;
- compute bounded quantitative tests where the authority and inputs justify it;
- expose missing site facts/evidence;
- assemble an auditable planning-case ledger;
- report unresolved qualitative judgement.

It may **not** generate planning permission, predict the decision authority's judgement as fact, or turn guidance into statute.

## Primary statutory decision basis

### Development-plan-led decision making

Current official planning guidance states that, where development-plan policies are material, planning decisions must be taken in accordance with the development plan unless material considerations indicate otherwise.

Primary/statutory sources:

- Planning and Compulsory Purchase Act 2004, section 38:  
  `https://www.legislation.gov.uk/ukpga/2004/5/section/38`
- GOV.UK Planning Practice Guidance — Determining a planning application:  
  `https://www.gov.uk/guidance/determining-a-planning-application`

DPL must therefore distinguish:

```text
DEVELOPMENT PLAN
      ↓
primary decision framework

MATERIAL CONSIDERATIONS
      ↓
may affect the decision / weight

PLANNING DECISION
      ↓
external statutory act
```

The compiler may model the first two layers and record the third as external evidence. It must not collapse them.

### Conflict within the development plan

Section 38 and current Planning Practice Guidance provide a specific rule for conflict between policies in development-plan documents: conflict is resolved in favour of the policy contained in the document that most recently became part of the development plan.

That does **not** justify a generic source-order precedence algorithm.

A later target should represent:

- source membership in the development plan;
- adoption/made/published date relevant to the statutory rule;
- whether an actual policy conflict exists;
- the governing statutory conflict relation;
- interpretive/judgement state where policies can reasonably be read together rather than treated as conflicting.

The data structure itself must not decide that every later or more local policy supersedes every earlier policy.

## Current national policy snapshot

### National Planning Policy Framework — September 2026

The current NPPF was published in August 2026 and updated on 29 September 2026. It applies to England and replaces the December 2024 framework.

Official source:

`https://www.gov.uk/guidance/national-planning-policy-framework`

The NPPF is **not itself the local development plan**. Current official guidance describes it as a material consideration of critical importance in plan-making and decision-taking.

DPL target family:

```text
ENGLAND_PLANNING_POLICY
  source: NPPF
  snapshot/effective identity: 2026-09-29
  authority class: NATIONAL_POLICY_MATERIAL_CONSIDERATION
```

The exact model/version identity should remain independent of the source publication date and compiler method identity per DPL-05.

### Planning Practice Guidance

Topic-specific Planning Practice Guidance can explain current government planning practice and statutory-process interpretation.

It must be source/version controlled per topic rather than treated as an invisible evergreen web dependency.

Where a later planning method relies on PPG, record:

- exact topic/page;
- paragraph/reference identifier where available;
- revision date;
- authority class;
- target interpretation/method version.

## Current Greater London strategic snapshot

### London Plan 2021 — operative strategic development-plan source

The **London Plan 2021** remains the adopted Spatial Development Strategy and has statutory weight as part of the development plan for London planning authorities.

Official source:

`https://www.london.gov.uk/programmes-strategies/planning/london-plan/the-london-plan-2021-online`

Relevant policy families for a detached residential deployment include, subject to actual applicability:

- D1 — form, character and capacity for growth;
- D2 — infrastructure requirements for sustainable densities;
- D3 — optimising site capacity through the design-led approach;
- D4 — delivering good design;
- D5 — inclusive design;
- D6 — housing quality and standards;
- D7 — accessible housing;
- D11/D12/D13/D14 where safety, fire, agent-of-change or noise matters apply;
- H1/H2 and other housing policies where applicable to the proposal/site class;
- transport/parking/cycling policies;
- green infrastructure / urban greening / biodiversity policy families;
- heritage policy families;
- air quality / noise / energy / water / flood / drainage policy families;
- any other strategic policy actually triggered by the site/proposal.

This list is an inventory seam, not a statement that every cited family generates a blocking obligation for every detached dwelling.

### Design-led site capacity is intrinsically site-specific

London Plan Policy D3 requires a design-led approach that determines the appropriate form of development by considering the site's attributes, context, capacity for growth and supporting infrastructure.

Official source:

`https://www.london.gov.uk/programmes-strategies/planning/london-plan/the-london-plan-2021-online/chapter-3-design`

This validates a central DPL proposition:

> **A planning target cannot determine deployability from Reference House geometry alone.**

It needs site/context claims and, for qualitative matters, an explicit planning judgement/evidence boundary.

A real planning case may therefore conclude:

```text
quantitative housing-space criterion    PASS
site designation applicability          PROVED
neighbour separation input              UNKNOWN
character response                      JUDGEMENT_REQUIRED
daylight/sunlight effect                EVIDENCE_REQUIRED
planning permission                     EXTERNAL_DECISION
```

No aggregate “planning score” is justified.

## Current London Plan Guidance snapshot

### Adopted guidance is not London Plan policy

London Plan Guidance can materially assist implementation of London Plan policies but does not itself create or amend London Plan policy.

The Mayor's 2023 adoption decision explicitly states that London Plan Guidance has **no specific statutory weight**, while being capable of constituting a material planning consideration.

Official source:

`https://www.london.gov.uk/md3090-design-and-characterisation-london-plan-guidance-documents`

Relevant adopted 2023 guidance includes:

- Characterisation and Growth Strategy LPG;
- Small Site Design Codes LPG;
- Optimising Site Capacity: A Design-led Approach LPG;
- Housing Design Standards LPG.

Official collection:

`https://www.london.gov.uk/programmes-strategies/planning/implementing-london-plan/london-plan-guidance`

DPL target class:

```text
LONDON_PLAN_GUIDANCE
  authority: MATERIAL_CONSIDERATION / IMPLEMENTATION_GUIDANCE
  parent policy references: explicit
  statutory development-plan membership: NO
```

The target must not silently promote a convenient LPG table into statutory policy.

### Small-site guidance

The adopted 2023 Small Site Design Codes LPG supports boroughs/neighbourhood planning groups in preparing local small-site design codes.

Official source:

`https://www.london.gov.uk/programmes-strategies/planning/implementing-london-plan/london-plan-guidance/small-site-design-codes-lpg`

For DPL this matters because a later borough plug-in may contain an adopted local design code derived from or informed by this guidance.

The existence of the London guidance is **not** itself proof that one uniform code applies to DPL-RS-01 or a real plot.

## Emerging London Plan — keep separate from operative authority

### Draft London Plan 2026

The Mayor published the Draft London Plan for statutory consultation in July 2026. The consultation closed at **17:00 on 15 October 2026**. Examination is expected during 2027 and adoption is currently indicated for early 2028.

Official sources:

- `https://www.london.gov.uk/md3515-london-plan-publication-and-statutory-consultation`
- `https://www.london.gov.uk/programmes-strategies/planning/london-plan/next-london-plan/draft-london-plan-consultation`

As at the DPL-10 research date it is **not the adopted London Plan**.

The target model should therefore distinguish:

```text
LONDON_PLAN_2021
  status: OPERATIVE_DEVELOPMENT_PLAN_SOURCE

DRAFT_LONDON_PLAN_2026
  status: EMERGING_NON_OPERATIVE_SOURCE
```

An emerging source may become a material consideration with case-dependent weight under planning law/policy, but its existence must not overwrite the operative source snapshot.

### Draft London Small Site Design Code 2026

A new London-wide Small Site Design Code LPG is separately out for consultation from September to **4 December 2026** and was prepared alongside the Draft London Plan 2026.

Official source:

`https://www.london.gov.uk/programmes-strategies/planning/implementing-london-plan/london-plan-guidance/london-small-site-design-code-lpg-0`

It should be recorded as:

```text
status: DRAFT_FOR_CONSULTATION
operative planning rule: NO
future/candidate source: YES
```

This is a strong example of why DPL-05 needs source status as well as publication date.

## London → borough/local composition

A deployment planning case should conceptually compose:

```text
OPERATIVE NATIONAL POLICY SNAPSHOT
        +
OPERATIVE LONDON DEVELOPMENT-PLAN SOURCE
        +
OPERATIVE BOROUGH DEVELOPMENT-PLAN SOURCE(S)
        +
MADE NEIGHBOURHOOD PLAN, IF ANY
        +
APPLICABLE GUIDANCE / DESIGN CODES /
MATERIAL CONSIDERATIONS
        +
SITE MANIFEST
        +
PLANNING EVIDENCE / PROFESSIONAL JUDGEMENT
        ↓
PLANNING-CASE LEDGER
        ↓
EXTERNAL DECISION / PERMISSION EVIDENCE
```

This is a **typed composition graph**, not a CSS cascade.

### Borough plug-in contract

A later borough plug-in should identify at minimum:

#### Authority identity

- borough / local planning authority identity;
- development-plan documents currently in force;
- adoption/effective dates;
- superseded/saved-policy state where applicable;
- policies map / designation source identity;
- made neighbourhood plan(s) relevant to the site if any;
- other development-plan components admitted by the then-current statutory regime.

#### Guidance identity

- adopted SPDs / design guidance / design codes;
- status and adoption date;
- explicit relationship to development-plan policies;
- material-consideration rather than development-plan classification where that is the correct authority status.

#### Local quantitative families

Where present and applicable:

- setbacks / building lines;
- height/massing parameters;
- garden/amenity-space standards;
- privacy/separation guidance;
- parking/cycle standards;
- refuse/storage requirements;
- tree/green-infrastructure standards;
- sustainable-drainage/local flood requirements;
- local energy/carbon requirements;
- local design-code parameters;
- other bounded numeric criteria.

#### Local qualitative/evidence families

- character/townscape response;
- heritage setting;
- neighbour amenity;
- daylight/sunlight;
- overlooking/privacy where not reducible to a single dimension;
- trees/landscape/arboriculture;
- transport/access/highway effects;
- ecology/BNG/green infrastructure;
- flood/drainage;
- air quality/noise;
- viability/obligations where relevant;
- other policy-specific reports or statements.

#### Process/evidence families

- validation/local-list requirements where relevant;
- design and access / planning statement requirements;
- specialist assessments;
- consultation/statutory-consultee evidence;
- section 106 / condition / CIL or other planning-process obligations where applicable;
- decision notice, approved plans and conditions as external evidence after determination.

The borough plug-in must not claim that a validation document being present proves its substantive policy conclusion.

## Site manifest dependencies

DPL-06 correctly keeps raw site claims separate from policy interpretation.

Planning target evaluation is therefore directional:

```text
SITE CLAIM
  e.g. tree, neighbour window, flood zone,
  conservation area, parking space
       ↓
TARGET APPLICABILITY / EVIDENCE QUESTION
       ↓
POLICY / GUIDANCE / JUDGEMENT RESULT
```

Do **not** encode:

```text
site.conservationArea = "planning failure"
site.neighbourWindow = "privacy breach"
site.tree = "unbuildable"
```

A site designation or physical condition triggers a planning question; it is not itself the planning conclusion.

## Determinism classification

Planning families need different resolution modes.

### Class P1 — directly representable site/project fact

Examples:

- site area;
- boundary geometry;
- proposal height;
- dwelling count;
- parking/cycle-space count;
- distance between controlled geometric features;
- listed/conservation/designation state where authoritative source evidence exists;
- PTAL/accessibility index where a controlled external source is imported;
- adopted-policy/source identity.

These can be represented in the site/project manifest but may still require evidence/provenance.

### Class P2 — mechanical applicability

Examples:

- whether a policy threshold is triggered by dwelling count/site area;
- whether a site lies inside a mapped designation where geometry/source are controlled;
- whether a planning requirement selects an optional Building Regulations category such as M4(2)/M4(3);
- whether a numeric policy family is applicable to the proposal class.

Native logic is plausible where the legal/policy interpretation is sufficiently settled and versioned.

### Class P3 — bounded quantitative policy/guidance check

Examples may include:

- minimum internal floor area where an applicable standard provides a clear dimension;
- minimum private amenity dimensions where an operative local standard clearly applies;
- parking/cycle maxima/minima;
- selected waste/storage or setback dimensions;
- explicit design-code geometry.

Each method must retain the source's actual authority status. A numeric guidance check does not become statute because it is easy to compute.

### Class P4 — evidence-led technical planning assessment

Examples:

- daylight/sunlight;
- flood risk and drainage strategy;
- transport/highway effects;
- arboriculture;
- noise;
- air quality;
- ecology / biodiversity evidence;
- energy/carbon planning evidence;
- heritage impact evidence;
- contamination where planning requires evidence.

The compiler can orchestrate inputs/results and track missing evidence; specialist methods/evidence remain external where appropriate.

### Class P5 — qualitative planning judgement

Examples:

- character and local distinctiveness;
- whether massing is appropriate to context;
- design quality;
- townscape response;
- heritage significance/setting judgements;
- neighbour amenity where policy is qualitative;
- whether competing policies/material considerations justify a departure from one reading.

These remain `JUDGEMENT_REQUIRED` unless a future bounded method proves a much narrower question.

### Class P6 — statutory decision / permission state

Examples:

- planning permission granted/refused;
- permission subject to conditions;
- appeal decision;
- discharge of condition;
- section 106 execution;
- lawful-development certificate where relevant.

These are external statutory/process evidence only.

No compiler method may produce `PLANNING_PERMISSION_GRANTED` from P1–P5 results.

## Planning pressure on the current Reference House

The inventory identifies several likely planning interfaces without concluding that any fails.

### Site capacity / form / character

The London design-led approach makes site/context response first-class. The Reference House's 12.0 × 10.8 m fixed shell and protected architectural order therefore belong in a **compatibility test**, not in an automatic site-deformation loop.

This is exactly the DPL rule **compatibility before adaptation**.

### Height / massing / relationship to neighbours

Reference House sectional hierarchy is protected by DPL-02. Real-site planning may test its visible height, massing, front/rear relation and neighbour effects.

A conflict does not automatically authorise storey compression or plan deformation.

### Housing quality / internal standards

Some London-wide housing standards are comparatively deterministic and may be native target candidates later.

Their existence does not imply the current compiler already proves them.

### Accessibility category cross-target relation

Planning can require optional M4 categories that then become Building Regulations requirements.

Planning and building-control targets therefore remain separate authorities connected by an explicit resolved planning obligation rather than merged into one ruleset.

### Privacy / daylight / sunlight / neighbour amenity

DPL-RS-01 currently contains approximate neighbour masses but deliberately lacks real neighbour-window geometry and planning evidence.

That is correct. A real planning case will need authoritative context facts and potentially specialist assessment before a meaningful result is possible.

### Trees / ecology / green infrastructure

The Reference Site's one synthetic mature tree provides useful physical friction but is not a planning designation or TPO fact.

Real sites need separate claims for tree geometry/condition, legal/designation state, ecology and policy consequences.

### Flood / drainage / environment

The Reference Site deliberately leaves detailed drainage/sewer/flood facts unresolved. Planning may require evidence distinct from Part H / Building Regulations technical compliance.

DPL must preserve that authority split.

### Transport / parking / cycle / waste

These are strongly borough/site-dependent and may combine bounded quantitative checks with qualitative highway/access judgement.

They belong in the borough plug-in and site interface rather than being invented in DPL-RS-01 merely to make a complete-looking plot.

### Energy / sustainability / overheating

London/local planning can impose policy/evidence requirements distinct from Building Regulations Parts L/O. The same physical model may support both, but the obligations and source authorities remain distinct.

## Reference Site consequences

DPL-10 supports DPL-07's decision **not** to fill every Reference Site field with optimistic synthetic facts before the planning inventory exists.

Before canonical planning-case compilation, DPL-RS-01 will eventually need enough additional claims/evidence or explicit assumptions to exercise, at minimum:

- applicable planning-authority/borough identity;
- relevant designations;
- neighbour-window/context evidence at suitable fidelity;
- access/parking/cycle/refuse proposal;
- tree/arboricultural facts sufficient for the selected scenario;
- flood/drainage/environmental claims;
- any policy-triggering site history/allocation/design-code facts;
- any neighbourhood-plan applicability;
- other facts discovered by the selected borough proof.

Those additions should occur through the site-manifest/source-authority process, not by silently expanding the Reference Site narrative.

## First-borough proof strategy

DPL-10 does **not** select a first borough yet.

That restraint is deliberate.

Selecting a borough now would risk overfitting the plug-in contract to a familiar authority before DPL-14's real London plot corpus exposes the actual variation we need to support.

Recommended selection rule later:

1. DPL-14 gathers a varied real-plot corpus;
2. choose one borough represented by a credible candidate plot and with a sufficiently explicit current local-plan/design-guidance corpus to exercise the plug-in;
3. implement that borough as a proof target;
4. test the contract against at least one materially different second borough before calling the plug-in general.

Borough selection is therefore an implementation choice, not London doctrine.

## Recommended child decomposition

The planning corpus is large enough that substantive implementation should not remain one issue.

### DPL-10A — planning legal/source spine

Own:

- development-plan membership model;
- current NPPF source snapshot;
- London Plan operative/emerging status;
- source status taxonomy;
- section 38 decision/conflict semantics;
- guidance/material-consideration boundary;
- common planning target identity.

### DPL-10B — London strategic residential/design target

Own bounded current London Plan / adopted LPG families most material to one detached dwelling, including:

- design-led site capacity;
- housing quality/space standards;
- inclusive/accessibility planning triggers;
- small-site policy/guidance relationships;
- strategic design/character obligations;
- explicit native vs judgement/evidence boundaries.

### DPL-10C — borough plug-in contract + first proof borough

Only after a first borough is selected through the real-plot strategy.

Own:

- local-plan source composition;
- policies map/designations;
- local numeric standards;
- SPDs/design codes/guidance authority;
- neighbourhood-plan composition;
- source/adoption/supersession state;
- proof against one borough then adversarial replay against a second.

### DPL-10D — amenity/context/heritage evidence families

Own planning-case interfaces for:

- neighbour privacy/overlooking;
- daylight/sunlight;
- character/townscape;
- heritage;
- noise/agent-of-change where applicable;
- external study/judgement boundaries.

### DPL-10E — transport, landscape, water and environmental planning families

Own planning-case interfaces for:

- access/highways;
- parking/cycle/waste;
- trees/landscape/green infrastructure;
- ecology/biodiversity;
- flood/drainage;
- air quality;
- planning energy/carbon/sustainability requirements;
- interaction with DPL-09 technical obligations without authority collapse.

### DPL-10F — planning process/evidence integration and adversarial closeout

Own:

- application/validation evidence ledger;
- conditions/obligations/decision evidence;
- emerging-policy handling;
- cross-policy conflict reporting;
- permission non-claim regression;
- whole planning-target red-team.

## Dependencies with sibling DPL work

### DPL-07

Provides the first synthetic site to test planning-input sufficiency, but must not be rewritten merely to satisfy the planning inventory.

### DPL-08

Will own actual house↔land interface design. DPL-10 may identify planning pressures but does not author interface geometry.

### DPL-09

Owns England Building Regulations/building-control target inventory. Cross-target triggers such as planning-selected M4 category must use an explicit interface rather than merging authority.

### DPL-11

Owns non-planning due diligence/private/site constraints. Restrictive covenant, private right of light, easement, Party Wall and similar matters must not be mislabeled as planning-policy failures.

### DPL-12

Will eventually orchestrate target composition and result semantics. DPL-10 supplies planning obligations and judgement/evidence states; it does not itself implement the orchestration substrate.

### DPL-14

Real plots should select/adversarially test the first borough plug-in and expose local-policy diversity before the deployment envelope is derived.

## Explicit non-claims

DPL-10 does **not** establish that:

- the Reference House would obtain planning permission on DPL-RS-01 or any real London plot;
- the London Plan 2021 is the only material planning source;
- the Draft London Plan 2026 currently replaces the London Plan 2021;
- adopted London Plan Guidance is statutory development-plan policy;
- draft London Small Site Design Code provisions currently govern the Reference House;
- a more local policy automatically defeats a strategic policy;
- every planning policy can be evaluated mechanically;
- a positive ledger of policy checks predicts the planning authority's overall judgement;
- planning approval proves Building Regulations compliance;
- Building Regulations compliance proves planning acceptability;
- private rights/title constraints are planning matters;
- current synthetic neighbour/site assumptions are real evidence.

## Unresolved questions passed forward

1. Exact source/version packaging for individual London Plan policies and adopted LPG extracts without reproducing copyrighted material unnecessarily.
2. How emerging-policy weight should be represented as a bounded evidence/judgement object without inventing a numeric weight score.
3. Which London-wide housing/design standards merit first native methods after source/applicability hardening.
4. Exact interface by which a resolved planning requirement selects an optional Building Regulations category such as M4(2)/M4(3).
5. Which local-plan system/transitional reforms in force at first real deployment materially change the borough plug-in schema.
6. First borough selection after DPL-14 provides a real candidate corpus.
7. Whether a planning-case renderer/report belongs in DPL-12 or a later bounded packet.

## Acceptance assessment

DPL-10 succeeds at inventory scope if later work can answer all of the following without guessing:

- what sources form the operative development plan for the selected site;
- which other sources are material considerations rather than development-plan policy;
- which source snapshot was operative/emerging on the compile date;
- what borough/local plug-in is selected;
- what site facts trigger each planning question;
- whether the question is machine-checkable, evidence-led or judgement-dependent;
- what remains external statutory decision evidence;
- why a policy conflict or precedence relation exists rather than inferring it from source order.

The inventory supports that architecture.

It deliberately stops before bulk policy encoding.
