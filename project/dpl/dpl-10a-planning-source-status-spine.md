# DPL-10A — Planning Legal and Source-Status Spine

**Issue:** [#360 — DPL-10A — planning legal and source-status spine](https://github.com/adamnoden/architecture/issues/360)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Parent inventory:** [DPL-10](dpl-10-london-planning-target-inventory.md)  
**Authorised by:** [#356 — DPL-WA Wave A integration and DRW rendezvous](https://github.com/adamnoden/architecture/issues/356)  
**Research date:** 2026-10-20  
**Baseline `main`:** `61a0db9cc7a5b33b97742c1320cc28b681959455`  
**Planning geography studied:** England → Greater London → future borough/local plug-in  
**Reference project class:** one new low-rise detached dwelling on a residential plot  
**Status:** planning source/membership/status contract; **not** a planning appraisal, policy-method implementation or permission prediction

## Question

> **How do we represent development-plan membership, operative/emerging status, source dates and section-38 decision/conflict semantics so that later planning methods cannot confuse policy, guidance, material considerations and permission?**

DPL-10A freezes that source/status spine.

It deliberately stops before encoding substantive London Plan or borough policy checks.

---

# 1. Result

A planning target cannot be represented as one ordered list such as:

```text
NPPF
London Plan
borough plan
local guidance
```

with an implicit rule that the last, newest or most local item wins.

The minimum honest planning model separates at least four objects:

```text
1. DEVELOPMENT-PLAN MEMBERSHIP
   Which exact source documents legally form part of the operative development plan
   for this place and date?

2. OTHER MATERIAL-CONSIDERATION SOURCES
   National policy, guidance, emerging policy, planning history and other admissible
   considerations outside development-plan membership.

3. POLICY / EVIDENCE / JUDGEMENT QUESTIONS
   Which provisions are material to the proposal, what facts/evidence do they require,
   and which conclusions remain judgement-dependent?

4. EXTERNAL STATUTORY DECISION
   Permission / refusal / condition / appeal decision as external evidence,
   never a compiler-native forecast presented as fact.
```

The governing rule is:

> **Membership, materiality, weight, conflict and decision are different questions.**

A source can exist without belonging to the development plan. A source can be a material consideration without having development-plan status. A development-plan policy can be material without determining the result by itself. An external authority still makes the planning decision.

---

# 2. Current statutory decision basis

## 2.1 Planning and Compulsory Purchase Act 2004 — section 38

Primary source:

- **Planning and Compulsory Purchase Act 2004, section 38**;
- official source: `https://www.legislation.gov.uk/ukpga/2004/5/section/38`;
- source checked 2026-10-20.

The current revised text is itself temporally significant: section 38 changed on **25 March 2026** through commencement of amendments made by the Levelling-up and Regeneration Act 2023.

For areas in England, the current section 38(2A) identifies the development plan as the applicable composition of:

- each operative spatial development strategy;
- each local plan in effect;
- each minerals and waste plan in effect;
- each supplementary plan in effect;
- each made neighbourhood development plan, together with the statutory referendum-stage case in section 38(3A) where applicable;
- each policies map for the area.

The exact London composition must therefore be derived from the current statutory membership model and the actual site geography, not from an inherited pre-2026 list copied into code.

### Source-state warning

The official revised source also records further changes to section 38 that are not yet in force/applied.

Therefore:

```text
section 38 URL today
    ≠
timeless planning-law target
```

A planning target must retain the point-in-time legislative source state against which membership and decision semantics were evaluated.

## 2.2 Development-plan-led determination — section 38(6)

Current section 38(6) provides the central statutory decision basis:

```text
where regard is to be had to the development plan
        ↓
determination in accordance with the plan
        ↓
unless material considerations indicate otherwise
```

Official Planning Practice Guidance gives the same operational framing for planning applications and appeals.

This means the compiler may assemble and evaluate the planning case, but cannot reduce it to:

```text
all policies pass → permission guaranteed
```

or:

```text
one policy fail → permission impossible
```

unless a specific legal/policy rule actually supports that conclusion.

## 2.3 Conflict within the development plan — section 38(5)

Current section 38(5) contains a specific statutory rule:

> where policies in the development plan conflict, the conflict is resolved in favour of the policy contained in the last document to become part of the development plan.

DPL must represent this **only after an actual conflict has been established**.

It does not create a generic precedence cascade.

Invalid shortcuts include:

```text
borough > London
London > borough
newer source > older source
more local > strategic
later array element > earlier array element
```

The statutory relation is narrower:

```text
both policies are members of the development plan
        +
actual material conflict exists
        +
source-document membership chronology established
        ↓
apply the section-38(5) conflict relation
```

Where policies can reasonably be read together, there may be no section-38(5) conflict to resolve.

---

# 3. Current source-status snapshots

## 3.1 National Planning Policy Framework — September 2026

Current source:

- **National Planning Policy Framework**;
- published 17 August 2026;
- last updated **29 September 2026**;
- official source: `https://www.gov.uk/guidance/national-planning-policy-framework`;
- applies to England.

The current Framework states that it sets government policy for plan-making and decision-making and describes itself as a material consideration of critical importance.

For DPL source classification:

```text
source: NPPF_2026_09_29
class: NATIONAL_PLANNING_POLICY
status: OPERATIVE_POLICY_MATERIAL_CONSIDERATION
statutoryDevelopmentPlanMember: NO
```

The NPPF must not be inserted into the development-plan array merely because it is nationally authoritative policy.

## 3.2 Planning Practice Guidance

Current relevant source family includes GOV.UK Planning Practice Guidance, including:

`https://www.gov.uk/guidance/determining-a-planning-application`

The determining-an-application page was last updated **8 April 2026** at the research date.

PPG may provide important official interpretation/process guidance, but it remains a separate source class from:

- statute;
- the development plan;
- the NPPF;
- an actual planning decision.

Later methods relying on PPG must record the exact topic/page and revision identity used rather than depending on an evergreen URL invisibly.

## 3.3 London Plan 2021 — operative strategic development-plan source

The **London Plan 2021** was published on **2 March 2021** and remains the operative Spatial Development Strategy at the DPL-10A research date.

Official London sources describe publication as giving full statutory weight to the Spatial Development Strategy as part of the Development Plan for all London planning authorities.

Canonical source family:

`https://www.london.gov.uk/programmes-strategies/planning/london-plan/the-london-plan-2021-online`

DPL classification:

```text
source: LONDON_PLAN_2021
class: SPATIAL_DEVELOPMENT_STRATEGY
status: OPERATIVE_DEVELOPMENT_PLAN_SOURCE
membership: DEVELOPMENT_PLAN
```

Its operative status does not mean every policy is material to every detached dwelling.

Applicability/materiality remains proposal- and site-dependent.

## 3.4 Draft London Plan 2026 — emerging, not operative London Plan

The Mayor's **Draft London Plan 2026** completed statutory consultation at **17:00 on 15 October 2026**.

The official programme currently indicates:

- examination in public: 2027;
- intended adoption: early 2028.

Official source:

`https://www.london.gov.uk/programmes-strategies/planning/london-plan/next-london-plan/draft-london-plan-consultation`

At the research date it is not the operative Spatial Development Strategy and must not replace London Plan 2021 in development-plan membership.

DPL classification:

```text
source: DRAFT_LONDON_PLAN_2026
class: EMERGING_STRATEGIC_POLICY
status: EMERGING_NON_OPERATIVE
membership: NOT_CURRENTLY_DEVELOPMENT_PLAN
potentialMaterialConsideration: CASE_DEPENDENT
```

If its planning weight becomes material in a real decision, that is a judgement/evidence question. DPL must not assign a made-up numeric weight because the draft has advanced through a particular consultation stage.

## 3.5 London Plan Guidance

Current official London Plan Guidance states that LPG:

- provides further information on implementing the current London Plan;
- has **no specific statutory weight**;
- cannot create or change London Plan policy;
- can be a material planning consideration.

Official collection:

`https://www.london.gov.uk/programmes-strategies/planning/implementing-london-plan/london-plan-guidance`

DPL classification:

```text
class: LONDON_PLAN_GUIDANCE
status: ADOPTED_GUIDANCE
membership: NOT_DEVELOPMENT_PLAN_POLICY
potentialMaterialConsideration: YES
```

A useful LPG table or design proposition must never be promoted to London Plan policy merely because it is easier to compute.

---

# 4. Planning source object

DPL-10A does not add a runtime source registry yet.

As in DPL-09A, the correct implementation boundary is to freeze the authority semantics first and let later borough/policy packets prove the stable common machine shape.

Any later structured planning source object must preserve at least:

```text
PlanningSourceSnapshot {
  id
  geography
  sourceClass
  title
  canonicalSource
  sourceVersionOrPointInTime
  publishedAt?
  adoptedAt?
  operativeFrom?
  retrievedAt

  status
  developmentPlanMembership
  membershipBasis?
  parentOrRelatedSources[]
  supersedes[]
  supersededBy[]

  materialConsiderationCapability
  completenessNote
  provenance
}
```

## 4.1 `status` and `membership` are separate

Do not infer development-plan membership merely from labels such as `ADOPTED`, `CURRENT` or `OPERATIVE`.

Examples:

```text
London Plan 2021
  status: OPERATIVE
  developmentPlanMembership: YES

adopted London Plan Guidance
  status: ADOPTED
  developmentPlanMembership: NO

NPPF September 2026
  status: OPERATIVE_POLICY
  developmentPlanMembership: NO

Draft London Plan 2026
  status: EMERGING
  developmentPlanMembership: NO
```

## 4.2 Geography is not enough

A document applying geographically to London does not automatically form part of the site's development plan.

The site-specific planning composition must establish legal membership through the governing source model.

## 4.3 Point-in-time identity is mandatory

A later adopted London Plan must not silently rewrite a 2026 deployment compile.

Historical results retain the exact source composition against which they were produced.

---

# 5. Development-plan composition object

For a real site, later planning work should conceptually derive:

```text
DevelopmentPlanComposition {
  siteGeography
  evaluatedAt
  statutoryBasis
  members[]
  membershipEvidence[]
  unresolvedMembershipQuestions[]
}
```

Current section 38(2A) means the candidate member classes can include:

- operative spatial development strategy;
- local plan;
- minerals and waste plan;
- supplementary plan;
- neighbourhood development plan;
- policies map.

Not every class will create substantive obligations for every small residential proposal, but legal membership should be represented correctly before material policy questions are selected.

## 5.1 Borough plug-in seam

A future borough target must therefore answer two questions before substantive policy checking begins:

1. **Which exact borough/local sources form part of the development plan for this site and date?**
2. **Which additional adopted/emerging guidance or other material-consideration sources are relevant but outside development-plan membership?**

This keeps a borough SPD/design guide from being silently elevated to local-plan policy.

## 5.2 Neighbourhood and supplementary-plan seam

The current section-38 model explicitly admits neighbourhood and supplementary-plan classes where the statutory conditions are satisfied.

DPL-10A therefore rejects the older simplified assumption that London planning composition is always just:

```text
London Plan + borough Local Plan
```

That may often be the dominant practical pair, but it is not a sufficient legal ontology.

---

# 6. Materiality and weight are separate from source membership

A source may be legally capable of being a material consideration without every provision being material to the actual proposal.

Later planning-case work must distinguish:

```text
source capability
    ↓
case-specific materiality
    ↓
case-specific weight / judgement
```

These are not interchangeable.

## 6.1 Materiality

Planning Practice Guidance describes a material planning consideration as one relevant to the planning decision in question.

Whether a specific consideration is material is case-dependent.

A compiler may:

- identify a candidate issue;
- trace it to an admitted source;
- expose the relevant site/proposal facts;
- record a professional/statutory judgement.

It should not declare every policy/guidance item material merely because a keyword matched.

## 6.2 Weight

The weight given to a material consideration is ordinarily a matter for the decision-maker subject to the legal framework.

DPL therefore forbids a generic numeric model such as:

```text
London Plan policy = 10 points
NPPF = 8 points
emerging policy = 4 points
LPG = 2 points
```

No evidence supports such arithmetic, and it would obscure rather than model planning judgement.

A later method may use bounded deterministic criteria where a source genuinely creates one, while leaving qualitative weight/judgement explicitly external.

---

# 7. Policy conflict is an explicit relation, not source precedence

Later planning work must model policy conflict as an object or explicit finding.

Conceptually:

```text
PlanningPolicyConflict {
  policyA
  policyB
  bothDevelopmentPlanMembers
  conflictEstablishedBy
  sourceDocumentA
  sourceDocumentB
  documentMembershipDates
  statutoryConflictRule
  resolution
}
```

The system must first establish that the policies actually conflict in the relevant sense.

Only then may section 38(5) provide the legal resolution relation.

## 7.1 Same-document issues

Section 38(5) speaks to policy conflicts across development-plan policy and the document that last became part of the plan.

It does not license a compiler to resolve ambiguous provisions inside one document by chronological guessing.

## 7.2 Outside-development-plan sources

NPPF, LPG, emerging plan material and other material considerations do not enter a section-38(5) conflict relation merely because they disagree with a development-plan policy.

Their legal role is instead considered under the development-plan-led decision framework and material-considerations question.

This distinction is central.

---

# 8. Planning case and external decision remain distinct

DPL can assemble a planning-case ledger.

It cannot issue planning permission.

Conceptually:

```text
PLANNING SOURCES
    +
SITE / PROPOSAL CLAIMS
    +
POLICY APPLICABILITY
    +
QUANTITATIVE METHODS
    +
EVIDENCE
    +
HUMAN / PROFESSIONAL JUDGEMENT
        ↓
PLANNING-CASE LEDGER
        ↓
EXTERNAL DECISION-MAKER
        ↓
PERMISSION / REFUSAL / CONDITIONS / APPEAL OUTCOME
        ↓
EXTERNAL STATUTORY EVIDENCE
```

A permission, refusal, condition or appeal decision can later discharge or alter specific deployment obligations under the DPL-03 evidence model.

It is never backfilled as a native compiler prediction.

---

# 9. Planning result semantics reuse DPL-03

DPL-10A creates no new result lattice.

Examples:

```text
obligation: establish operative London strategic-plan source
method: source-membership lookup
result: PASS
```

```text
obligation: establish applicable borough local-plan source
method: source-membership lookup
result: UNRESOLVED
reason: borough/site geography not yet selected
```

```text
obligation: assess character response
method: planning / architectural judgement
result: UNRESOLVED
required evidence: site/context analysis + professional/statutory judgement
```

```text
obligation: planning permission exists for exact candidate
method: external statutory decision evidence
result: EXTERNALLY_DISCHARGED
```

The existence of an adopted policy source does not by itself produce `PASS` or `FAIL` for the proposal.

---

# 10. Temporal test cases

## Case A — current London source state on 20 October 2026

For a London site where local membership is not yet selected:

```text
statutory basis
  section 38 current point-in-time state: OPERATIVE

strategic development-plan source
  London Plan 2021: OPERATIVE / MEMBER

national policy
  NPPF 2026-09-29: OPERATIVE POLICY / NOT MEMBER

London guidance
  adopted LPG: ADOPTED GUIDANCE / NOT MEMBER

emerging strategic source
  Draft London Plan 2026: EMERGING / NOT MEMBER

borough/local development-plan composition
  UNRESOLVED until actual site/borough membership is established
```

This is a valid target state. The system does not need to choose a borough in order to know that the London Plan 2021 remains the operative strategic source.

## Case B — future Draft London Plan progresses but is not adopted

If the Draft London Plan advances through examination but has not become the operative Spatial Development Strategy:

```text
London Plan 2021
  membership: remains current strategic development-plan source

new draft
  status: later-stage emerging source
  membership: NO
  potential materiality/weight: case-dependent
```

Do not replace the operative source based on anticipated adoption.

## Case C — future London Plan adoption

When a successor London Plan lawfully becomes the operative Spatial Development Strategy:

- new planning cases select the successor source where applicable;
- historical 2026 cases retain London Plan 2021 in their source composition;
- the old target result becomes historical/superseded for new evaluations, not rewritten in place.

## Case D — borough plan/guidance ambiguity

If a borough source is known but its legal membership/status is not established:

```text
policy method: DO NOT RUN AS DEVELOPMENT-PLAN POLICY
membership obligation: UNRESOLVED
```

Do not promote a PDF titled “design guide”, “SPD”, “code” or “strategy” by name alone.

## Case E — two development-plan policies appear inconsistent

Before applying section 38(5):

1. establish both policies are development-plan members;
2. establish an actual material conflict;
3. establish the relevant source-document membership chronology;
4. apply the statutory conflict relation;
5. retain the wider section-38(6) decision basis and material considerations.

There is no general `latest policy wins` algorithm.

---

# 11. Current London source-status examples

| Source | Source class | Current status 2026-10-20 | Development-plan member? | Potential material consideration? |
|---|---|---|---:|---:|
| Planning and Compulsory Purchase Act 2004 s.38 | legislation / decision basis | operative point-in-time law | n/a | n/a |
| NPPF, 29 Sep 2026 | national planning policy | operative | no | yes |
| London Plan 2021 | spatial development strategy | operative | yes | inherently part of plan-led framework |
| adopted London Plan Guidance | implementation guidance | adopted/current where applicable | no | yes |
| Draft London Plan 2026 | emerging strategic policy | consultation complete; not adopted | no | case-dependent |
| future borough Local Plan | local-plan source | unknown until site/borough/source selected | unknown | depends on status |
| future borough SPD/design guidance | supplementary guidance/material consideration source | unknown | do not infer | potentially |
| neighbourhood / supplementary plan | statutory development-plan class where requirements met | site-specific | where legally admitted | plan-led framework if member |

This table is a source-status demonstration only. It is not a policy applicability result for DPL-RS-01 or a real site.

---

# 12. Staleness and reproducibility

Planning targets are particularly vulnerable to invisible drift because web guidance, development-plan documents and emerging-policy states change on different schedules.

Every compile must retain:

1. statutory source/point-in-time identity;
2. development-plan composition identity;
3. non-development-plan source snapshot identities;
4. target-model version;
5. policy/method version;
6. site/proposal fact identity;
7. case result/evidence identity.

Example:

```text
Planning compile P-01
  evaluatedAt: 2026-10-20
  section38Source: exact snapshot
  developmentPlan:
    London Plan 2021
    borough sources: <resolved set>
    neighbourhood/supplementary sources: <resolved set>
  NPPF: 2026-09-29
  LPG sources: exact adopted snapshots
  emerging sources: recorded separately
  site manifest: S-17
  method set: PM-04
```

A later London Plan or NPPF update does not alter P-01. It creates a reason to evaluate a new target composition where the newer source applies.

---

# 13. No executable planning-source registry yet

DPL-10A deliberately does not create TypeScript/JSON source machinery.

Reasons:

1. the first borough has not yet been selected;
2. DPL-14A is deliberately responsible for the empirical selection frame that should help choose that borough;
3. local-plan, neighbourhood/supplementary-plan and guidance source shapes have not yet been exercised against a real borough corpus;
4. DPL-12 remains blocked pending the Wave-B1 concrete objects;
5. forcing planning and building-control sources into one premature shared schema would erase important authority differences.

The stable logical contract above is enough for this packet.

A later structured object should be derived after DPL-10B+ has exercised the borough plug-in seam.

---

# 14. Red-team findings

## 14.1 “London rules” fails

There is no single source object containing all planning authority for a London site.

The case is a composition of development-plan members plus other material-consideration sources and external judgement/evidence.

## 14.2 “Borough beats London” fails

Both strategic and local sources can be development-plan members. The statutory conflict relation is not a locality hierarchy.

## 14.3 “Latest wins” fails

Section 38(5) is a specific conflict rule concerning policies in development-plan documents. It is not permission to rank every source by date.

## 14.4 “Adopted means development plan” fails

London Plan Guidance can be adopted/current while explicitly having no specific statutory weight and no power to create/change London Plan policy.

## 14.5 “Emerging plan replaces current plan” fails

The Draft London Plan 2026 remains emerging/non-operative on 20 October 2026. Its progress does not erase London Plan 2021.

## 14.6 “Material consideration = fixed weight” fails

Materiality and weight are case-dependent legal/planning questions. A generic numeric weighting system would be pseudo-precision.

## 14.7 “Policy compliance = permission” fails

The planning authority/inspector makes the external decision under the statutory framework. DPL may support the planning case, not impersonate it.

## 14.8 “Planning law is evergreen” fails

Section 38 changed materially in March 2026 and has further future effects recorded by the official legislation service. Point-in-time statutory identity is therefore first-class.

---

# 15. Consequences for DPL-10B+

Later planning packets may now assume:

- exact planning source identity is required;
- development-plan membership is explicit and site/date-specific;
- source status and plan membership are independent fields;
- the current London Plan and an emerging successor can coexist in the target without authority confusion;
- NPPF and guidance remain outside development-plan membership unless legislation says otherwise;
- section-38(5) conflict is evaluated only after actual conflict and membership are established;
- materiality and weight are not scalar source metadata;
- permission/refusal/conditions/appeal outcomes remain external statutory evidence;
- historical planning compiles preserve their exact source composition.

They may **not** assume:

- a `more local wins` cascade;
- a `newest source wins` cascade;
- one borough source file;
- London Plan Guidance is London Plan policy;
- an emerging plan is operative because adoption is expected;
- machine-readable policy checks can replace planning judgement;
- a planning ledger is a permission prediction.

---

# 16. Non-claims

DPL-10A does **not** establish that:

- the Reference House would receive planning permission;
- any London Plan policy is satisfied by the Reference House;
- a first borough target has been selected;
- the operative local/neighbourhood/supplementary sources for DPL-RS-01 are known;
- the Draft London Plan 2026 has operative development-plan status;
- emerging-policy weight can be computed mechanically;
- London Plan Guidance creates statutory policy;
- section-38(5) resolves every apparent policy tension;
- an external planning decision can be generated by the compiler;
- DPL has created a planning permission score.

---

# 17. Packet result

**DPL-10A result: PASS at its declared source/status modelling scope.**

A later planning target can now ask, without collapsing authority classes:

> **Which exact sources form the operative development plan for this site and date; which additional sources are material considerations or emerging guidance; what genuine conflict/judgement questions exist; and what remains for the external decision-maker?**

That is sufficient authority to begin later borough/source work without treating planning as a flat ordered ruleset.

## Next gate

DPL-10A does **not** automatically open DPL-10B+.

Its result returns to the Wave-B1 sequence alongside DPL-09A and DPL-14A. The first borough should still be selected through the empirical corpus protocol rather than chosen in advance for convenience or familiarity.
