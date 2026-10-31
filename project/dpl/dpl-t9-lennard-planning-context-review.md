# DPL-T9 — Lennard planning-context SCREENING review

**Control:** `DPL-T-CONTROL-004` — 41 Lennard Road, Bromley, BR2 8LN  
**Candidate:** `DPL-T-CANDIDATE-004-01` / rev 0.1  
**Parent:** DPL-T8 result `e2532fe6bd77016cba92490120ea36d172fbed57ca66913d7419bcd5d6ef1bb7`  
**Authority:** delegated project-author SCREENING judgement only; **not** statutory planning determination

## Purpose

T8 correctly refused to turn three planning blockers into survey requests:

```text
DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT
DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY
DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
```

T9 asks what can be closed at no cost from current authority, and whether the remaining qualitative/strategic questions can be reduced to one exact decision dependency.

## 1. Emerging-policy material weight

Current official source status is sufficiently clear for this bounded gate:

- Bromley Local Plan 2019 remains the operative local development-plan source while review continues;
- Bromley's 2025 Direction of Travel is Regulation 18 plan-making material and explicitly contains no draft policies;
- the Draft London Plan consultation closed on 15 October 2026, with examination/adoption still future;
- current national policy says emerging-policy weight depends on stage of preparation, unresolved objections and consistency with national policy rather than a universal numeric score.

### T9 disposition

`PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT`

→ `RESOLVED_BOUNDED_PROJECT_AUTHORITY`

For this SCREENING gate, the project does not need to invent a scalar weight or commission planning advice merely to know that emerging sources remain non-operative and cannot silently displace the adopted development plan.

This is not a judgement about the final material weight that a statutory decision-maker may assign to a particular emerging policy at determination date. If a later planning decision depends materially on a specific emerging provision, that proposal-specific judgement remains external.

## 2. Exact-site history changes the qualitative posture

The current planning file reproduces the refusal reason for exact-site application `23/00297/FULL6`, refused on 21 March 2024.

The refusal reason identified, for that different proposal:

- design and inadequate side space;
- disproportion relative to the host dwelling;
- dominance relative to the row / surrounding dwellings;
- visual-amenity and street-scene harm;
- conflict with Bromley Local Plan Policies 6, 8 and 37 and London Plan Policy D3.

This is proposal-specific historical evidence, not a reusable refusal rule for the Reference House.

It is nevertheless **positive exact-site context evidence**. It prevents DPL from treating local qualitative or strategic capacity judgement as an abstract paperwork gap or from self-authoring an easy pass.

## 3. The Reference House candidate is materially different — but still requires judgement

The T3 candidate is not the refused extension and is not the current applicant proposal. It is one unchanged, unmirrored `RH-V02` house placement.

Its canonical front centre was authored approximately 26 m inward from the admitted Lennard Road frontage midpoint, plus the declared 4.5 m along-frontage offset. Therefore the relevant planning question is not simply whether another first-floor extension repeats the 2024 refusal.

The candidate introduces a different potential issue: whether a full detached two-storey Reference House in this inland position preserves an acceptable relationship to the existing Lennard Road row, street scene and local spatial pattern.

Indicative HMLR side clearances below the Policy 8 1 m floor amplify that concern, but they cannot decide it because the polygon is not measured/legal boundary evidence.

## 4. Consolidated planning dependency

T9 therefore consolidates:

```text
PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY
PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
```

into one decision dependency:

`PLANNING_DESIGN_CONTEXT_REVIEW`

### Exact question

> Does the unchanged Reference House at the exact T3/T4 41 Lennard Road placement form an acceptable design-led response to the Lennard Road row, street scene and site capacity under the operative Bromley qualitative design policies and London Plan Policy D3, taking explicit account of the exact-site 2024 refusal on side-space/dominance/street-scene grounds and without transferring facts from that different proposal?

### Minimum evidence set for that review

Use:

- exact T3/T4 Reference House placement and elevations;
- current adopted Bromley Local Plan / adopted design guidance;
- London Plan 2021 Policy D3 and adopted site-capacity guidance;
- exact-site 2024 refusal as historical context only;
- measured side-boundary/maintenance geometry once acquired;
- available current street/row context evidence adequate to judge scale, siting and relationship.

Do not automatically demand neighbour-window/daylight studies, full townscape analysis or planning-consultant reports unless the review identifies a specific unresolved question requiring them.

## 5. Review outcome vocabulary

A later bounded review should return one of:

```text
SCREENING_CONTEXT_ACCEPTABLE_NO_CATEGORICAL_CONFLICT_IDENTIFIED
SCREENING_CONTEXT_CONCERN_REQUIRES_TARGETED_EVIDENCE_OR_JUDGEMENT
SCREENING_CONTEXT_CONFLICT_IDENTIFIED
```

None of these is planning permission/refusal.

`SCREENING_CONTEXT_CONFLICT_IDENTIFIED` must state the exact architectural/site relationship creating the conflict. It does not author a redesign or prove route exhaustion.

## 6. T9 planning result

```text
emerging-policy material-weight blocker  = RESOLVED_BOUNDED_PROJECT_AUTHORITY
local qualitative blocker                = CONSOLIDATED INTO PLANNING_DESIGN_CONTEXT_REVIEW
strategic context/capacity blocker       = CONSOLIDATED INTO PLANNING_DESIGN_CONTEXT_REVIEW
new survey requirement from judgement    = NONE
statutory planning determination          = NOT CLAIMED
```

The important result is epistemic compression: two broad qualitative planning blockers become one precise candidate/site question, while the source-status blocker closes without spending money or fabricating a numeric policy weight.
