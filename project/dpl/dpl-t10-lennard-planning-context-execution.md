# DPL-T10 — Lennard planning-design-context execution

**Control:** `DPL-T-CONTROL-004` — 41 Lennard Road, Bromley, BR2 8LN  
**Candidate:** `DPL-T-CANDIDATE-004-01` / rev 0.1  
**Parent dependency:** `PLANNING_DESIGN_CONTEXT_REVIEW` from DPL-T9  
**Authority:** delegated project-author SCREENING judgement only; not statutory planning determination

## Exact question

> Does the unchanged Reference House at the exact T3/T4 placement form an acceptable design-led response to the Lennard Road row, street scene and site capacity under the operative Bromley qualitative design policies and London Plan D3, taking explicit account of the exact-site 2024 refusal without transferring facts from that different proposal?

## Controlled context

The site history creates a real red-team constraint:

- exact-site application `23/00297/FULL6` was refused on 21 March 2024;
- for that different proposal, the reason cited inadequate side space, disproportion/dominance relative to the row, visual amenity and street-scene harm;
- the reason cited Bromley Policies 6, 8 and 37 and London Plan D3.

The Reference House candidate is materially different:

- it is a detached two-storey unchanged `RH-V02` house rather than an upward extension of the existing bungalow;
- its canonical front centre is authored approximately 26 m inward from the admitted Lennard Road frontage midpoint, plus the declared 4.5 m along-frontage offset;
- the site context record describes Lennard Road as predominantly two-storey residential, with a smaller bungalow subset including 41 Lennard Road;
- the south-east side adjoins an access road toward Scrubs Farm before 43 Lennard Road, so the candidate's relationship is not a simple symmetric infill condition.

The current indicative title-index geometry places both side clearances below Bromley Policy 8's explicit 1 m floor, but that geometry is not measured/legal boundary evidence and cannot establish policy failure.

## SCREENING judgement

Result:

`SCREENING_CONTEXT_CONCERN_REQUIRES_EXISTING_TARGETED_GEOMETRY_RETURN`

### Why this is not a pass

The exact-site refusal means dominance, side space and the relationship to the established row are known site-sensitive matters. A materially inland detached two-storey house cannot be declared contextually acceptable merely because two-storey houses are common elsewhere along Lennard Road.

The T3 placement also creates a different design-led capacity question from the refused upward extension: whether a full detached house this far inland remains a coherent part of the Lennard Road pattern rather than reading as an awkward secondary/backland condition. That requires evidence-led judgement against the exact measured side relationship and controlled site/row geometry.

### Why this is not a conflict/refusal

The prior refusal belongs to a different proposal. The Reference House has a different footprint, architectural language, siting and relationship to the access-road side. No controlled evidence currently proves that the T3/T4 placement necessarily causes the same dominance/street-scene harm.

Likewise, the indicative sub-1 m title-index clearances cannot be promoted into a measured Policy 8 failure.

Therefore a categorical `SCREENING_CONTEXT_CONFLICT_IDENTIFIED` would exceed the evidence.

## Dependency result

T10 does **not** create a new planning-consultant dependency.

The planning-context review has now been executed. Its unresolved factual hinge is already contained in the existing dependency:

`MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY`

When that evidence returns, the project-author SCREENING review can be replayed with:

- measured east/west side geometry;
- exact T3/T4 candidate placement unchanged;
- existing controlled site/row context;
- exact-site prior refusal as historical context only.

If the measured geometry supports the explicit Policy 8 floor and no new categorical spatial conflict is exposed, the planning context can be re-reviewed without automatically procuring a planning consultant.

If measured geometry shows a real sub-1 m conflict or otherwise strengthens the exact-site dominance/context concern, only then should the project decide whether external planning judgement is warranted.

## No-cost closure effect

```text
PLANNING_DESIGN_CONTEXT_REVIEW                 = EXECUTED
screening result                               = CONCERN_REQUIRES_EXISTING_TARGETED_GEOMETRY_RETURN
new evidence dependency                       = NONE
new planning-consultant dependency             = NONE
existing dependency consumed on return         = MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY
statutory planning determination               = NOT CLAIMED
```

## Proof boundary

This result is neither planning permission nor refusal. It does not author a new siting route, move the house, determine legal boundaries, infer route exhaustion, or establish whole-site `COMPATIBLE` / `INCOMPATIBLE`.
