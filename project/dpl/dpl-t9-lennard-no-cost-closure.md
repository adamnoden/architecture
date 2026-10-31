# DPL-T9 — Lennard no-cost authority closure and minimum decision dependencies

**Control:** `DPL-T-CONTROL-004` — 41 Lennard Road, Bromley, BR2 8LN  
**Candidate:** `DPL-T-CANDIDATE-004-01` / rev 0.1  
**Parent:** DPL-T8 result `e2532fe6bd77016cba92490120ea36d172fbed57ca66913d7419bcd5d6ef1bb7`  
**Assurance profile:** `SCREENING`

## Question

Of the exact seven current blockers frozen by DPL-T8, which can be closed honestly without commissioning external work, and what is the smallest set of distinct decision dependencies that survives?

T9 commissions nothing. It does not mutate the Reference House, author a planning determination, determine a legal boundary or claim whole-site compatibility.

## Frozen semantic result

The semantic identities are cross-locked independently in `compiler/dpl/dplT9Lennard.frozen.test.ts` using the repository's canonical SHA-256 semantic-fingerprint implementation.

```text
result
  NO_COST_FRONTIER_REDUCED_MINIMUM_DECISION_DEPENDENCIES_FROZEN

result fingerprint
  55c7020d704b1285527c7249c961783185f56d467e0cdd7f5c93fcdc80393e6a

authority-evidence fingerprint
  90c69b103fff3fe330a0b3f88fdeff8c44928e587ff8c864d01393161ca4946a
```

Exact reduction:

```text
T8 current blocker records                  = 7
RESOLVED_BOUNDED_PROJECT_AUTHORITY           = 1
PUBLIC_AUTHORITY_RECOVERY_PENDING            = 1
SURVIVES_EXTERNAL_EVIDENCE_BRIEF             = 3
CONSOLIDATED_PLANNING_CONTEXT_REVIEW         = 2
T9 current active blocker records            = 6
unique decision dependencies                 = 4
external professional/measurement deps       = 2
public-authority recovery deps                = 1
planning-context judgement deps               = 1
```

## No-cost closure

`PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT`

→ `RESOLVED_BOUNDED_PROJECT_AUTHORITY`

Current official authority is enough to distinguish operative development-plan sources from emerging non-operative material without fabricating a scalar statutory planning weight:

- Bromley Local Plan 2019 remains operative while review continues;
- Bromley's 2025 Direction of Travel is Regulation 18 material and expressly contains no draft policies;
- the Draft London Plan consultation closed on 15 October 2026 and remains unadopted;
- national policy supplies factors for weight to emerging policy rather than a universal numeric answer.

If a later statutory determination turns materially on a specific emerging policy, proposal-specific weight remains decision-maker judgement. That later question does not block this SCREENING source-status gate.

## Flood — competent public authority identified, exact row still pending

`NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER`

→ `EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY`

The Environment Agency publishes the competent high-level postcode dataset. T9 identified the official source but did not acquire the exact authoritative `BR2 8LN` row through the current automated path.

T9 therefore does **not** promote a secondary postcode website, approximate pin, or applicant-proposal drainage statement into Environment Agency authority.

The next action remains a **no-cost official row / address-level recovery**, not an FRA, hydraulic model, drainage design or consultant instruction.

## Structural concept — reuse, do not duplicate

`REFERENCE_HOUSE:RH-PROT-08`

→ `COMPETENT_STRUCTURAL_CONCEPT_REVIEW`

The existing controlled RH-11 external structural red-team brief already asks the generic competent-engineer question and expressly withholds structural-adequacy claims. T9 adds only the exact Lennard candidate/site context in:

`project/dpl/evidence-briefs/dpl-t9-lennard-structural-concept-addendum.md`

The addendum does not pre-authorise detailed member design, foundation design or ground investigation.

## Measured side geometry — one brief, two blockers

The same evidence package serves:

```text
REFERENCE_HOUSE:RH-PROT-14
PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY
```

Dependency:

`MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY`

Brief:

`project/dpl/evidence-briefs/dpl-t9-lennard-side-boundary-maintenance-geometry.md`

This is intentionally narrower than a whole-site topo or legal-boundary exercise. It asks for the real physical side geometry around the exact T3/T4 placement and enough measurement accuracy to test:

1. Bromley Policy 8's explicit 1 m side-space floor; and
2. the protected RH-08 / RH-PROT-14 maintenance geography.

It does not ask the surveyor to determine a legal boundary. If measured physical evidence later exposes a genuine boundary/control discrepancy, title/legal work may then accelerate under its own authority.

## Planning red-team — exact-site refusal prevents a synthetic pass

The current planning file reproduces the refusal reason for exact-site application `23/00297/FULL6`, refused on 21 March 2024.

For that different proposal, the reason identified:

- inadequate side space;
- disproportion / dominance relative to the host dwelling and row;
- visual-amenity and street-scene harm;
- conflict with Bromley Local Plan Policies 6, 8 and 37 and London Plan Policy D3.

This is not a reusable refusal rule and is not transferred onto the Reference House candidate. It is nevertheless positive exact-site context evidence and therefore prevents T9 from self-authoring an easy planning-context pass.

The Reference House candidate is materially different: its canonical front centre is authored approximately 26 m inward from the admitted Lennard Road frontage midpoint, plus the declared 4.5 m along-frontage offset. The relevant planning question is therefore candidate-specific.

T9 consolidates:

```text
PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY
PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
```

into one dependency:

`PLANNING_DESIGN_CONTEXT_REVIEW`

The bounded review question is recorded in:

`project/dpl/dpl-t9-lennard-planning-context-review.md`

It asks whether the unchanged T3/T4 placement forms an acceptable design-led response to the Lennard Road row, street scene and site capacity under the operative Bromley qualitative design policies and London Plan D3, explicitly taking account of the prior exact-site refusal without transferring facts from that proposal.

This is project/planning judgement, not a survey instruction and not statutory permission/refusal.

## Exact four decision dependencies

```text
COMPETENT_STRUCTURAL_CONCEPT_REVIEW
EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY
MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY
PLANNING_DESIGN_CONTEXT_REVIEW
```

Only two are external professional/measurement work:

```text
COMPETENT_STRUCTURAL_CONCEPT_REVIEW
MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY
```

The flood dependency is public-authority recovery. The planning dependency is a bounded candidate/context judgement.

## Exact six active blocker records

```text
NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER
PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY
PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY
PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
REFERENCE_HOUSE:RH-PROT-08
REFERENCE_HOUSE:RH-PROT-14
```

These six records are not six independent procurements. They map onto the four dependencies above.

## Frozen record identities

```text
NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER
  283b4ec8cb6aafd2a112896eb73bba9535de50541ee7316bb35ddd4e420a88d6

PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT
  0d7f9e5304aca6ff662699a499a865d6dbc3035102b238e21f270ff3203b7ab6

PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY
  49f9ff9bdff3dce7f28a9cfe96667a54704dc53d6d1653f3eac201ad7aaa0294

PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY
  c33a9f3b3d0d381f37b69bc2df825948309222521984787fdbe26c0964652155

PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
  4c55d74c700ac0430e79f80b4848f7a552fbbaf474d147a4c3083769919982c0

REFERENCE_HOUSE:RH-PROT-08
  c78798580e99ed7aa25ba27f9ebaf64914ba4bb60c1001a4afb9c8a1a45fe162

REFERENCE_HOUSE:RH-PROT-14
  c162b6afb6e46c2a61097d731517da7537ab8360cb67b268d34db132ffb0672d
```

## Proof boundary

T9 does **not** establish:

```text
whole-site COMPATIBLE
whole-site INCOMPATIBLE
route exhaustion
planning permission / refusal prediction
legal boundary position
structural adequacy
measured side geometry
property-level flood safety
```

And T9 does not:

```text
mutate the Reference House
commission or contact an engineer, surveyor or planner
promote a secondary flood source into Environment Agency authority
turn the 2024 refusal into a reusable site rule
move / rotate / mirror / optimise the T3 candidate
```

`DPL-16` remains `HELD`.

## Next packet

**DPL-T10 — execute the remaining no-cost decision work and freeze the commissioning threshold.**

T10 should:

1. make a final direct attempt to acquire the official Environment Agency `BR2 8LN` postcode/address-level flood result;
2. perform the bounded `PLANNING_DESIGN_CONTEXT_REVIEW` against the exact T3/T4 placement and current controlled context, returning an explicit SCREENING state rather than permission/refusal;
3. leave the two external professional/measurement briefs untouched unless they truly remain after the no-cost work;
4. define the exact commissioning threshold and evidence-return contract for any dependency that survives;
5. preserve all T9 proof boundaries.

Only after T10 should DPL decide whether external evidence acquisition is actually authorised for this instrumented control.