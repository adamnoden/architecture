# DPL-T8 — Lennard substantive SCREENING blocker disposition

**Control:** `DPL-T-CONTROL-004` — 41 Lennard Road, Bromley, BR2 8LN  
**Candidate:** `DPL-T-CANDIDATE-004-01` / rev 0.1  
**Parent:** DPL-T7 result `f326bf64e599b08099edd21160e8e6a7af79477fd76a1f72b3b445e587f3c88c`  
**Assurance profile:** `SCREENING`

## Question

Of the exact ten substantive blockers surviving DPL-T7, which are genuinely due at the present SCREENING gate, which can be resolved or re-timed from current authority, and what is the minimum evidence or judgement frontier that survives?

T8 commissions nothing. It classifies timing and authority only.

## Frozen result

The exact current-main synthetic merge passed the full repository-health and publication validation suite.

```text
result
  SUBSTANTIVE_FRONTIER_CLASSIFIED_MINIMUM_EVIDENCE_DEFINED

result fingerprint
  e2532fe6bd77016cba92490120ea36d172fbed57ca66913d7419bcd5d6ef1bb7

authority-evidence fingerprint
  cc590a361fbda9b1e0e924b1a015dd20920752fdfd22aa15cb007fa349bc9d85

candidate fingerprint
  c732f708c6a4a048b2edb67564a50c9fc27a3873be77664a7f655d40a5f7a3a7

analysis-geometry fingerprint
  b409102bd6a4c09ce48e5945c75722a7bb79e2886470ea0d6ac144093628abfa
```

Disposition counts:

```text
input substantive blockers                 = 10
RESOLVED_EXISTING_AUTHORITY                 = 1
RECLASSIFIED_FUTURE_DUE                     = 2
SURVIVES_DUE_NOW_EXTERNAL_EVIDENCE          = 4
UNRESOLVED_AUTHORITY                        = 3
current unresolved blockers                 = 7
```

The important reduction is not merely `10 → 7`. Four evidence-bearing blockers collapse to only **three distinct evidence classes**, and the other three current blockers are explicitly authority/judgement questions rather than missing surveys.

## Exact dispositions

### Resolved from existing authority

`NON_PLANNING:DPL11-COV-ACCESS-STATUS`

Exact-site evidence already establishes an ordinary Lennard Road street frontage, existing front access and dropped kerb. That is enough for the bounded high-level SCREENING access-status question. It does not determine highway extent, adoption, private access rights, emergency access or construction logistics; those remain downstream unless separately accelerated.

### Reclassified future-due

`ENGLAND:ENG-COV-SOURCE-APPLICABILITY`

The operative 2026 transition rule is known, but exact Building Regulations source applicability depends on future notice/application and qualifying commencement events. Those events do not yet exist. Their absence is not missing site evidence.

`NON_PLANNING:DPL11-COV-SITE-CONTROL`

For this excluded instrumented control, parcel/address/planning identity is sufficient to run the deployment experiment. Ownership/commercial-control evidence becomes decision-critical only if the control graduates into actual acquisition/deployment. T8 therefore does not manufacture a title-procurement requirement merely to continue the experiment.

### Surviving due-now external evidence

`REFERENCE_HOUSE:RH-PROT-08`

Minimum class: `COMPETENT_STRUCTURAL_CONCEPT_REVIEW`.

The existing RH-C2 topology demonstrates the architectural structural concept and bounded load-path relationships, but DPL-02 deliberately reserves adequacy to competent engineering. T8 does not widen this into detailed member/foundation design.

`REFERENCE_HOUSE:RH-PROT-14`

Minimum class: `MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY`.

The Reference House protects maintainability as architecture. On this control the relevant uncertainty is lateral real-site geometry around the unchanged shell, not a general topographic or legal-title survey.

`PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY`

Minimum class: the **same** `MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY` evidence, not a second procurement.

Bromley Local Plan Policy 8 normally requires at least 1 m side space for a residential proposal of two or more storeys, retained for the full height and length of the building. The Reference House is two storeys.

Deterministic replay against the admitted indicative HMLR / Planning Data polygon gives:

```text
Policy 8 numeric floor               = 1.000000 m
west indicative minimum clearance    = 0.7603636181699739 m
east indicative minimum clearance    = 0.6400238446118391 m
both indicative sides below floor    = YES
```

This is **not** a planning failure and **not** a legal-boundary finding. The HMLR index polygon has never been admitted at that authority. Instead, the proximity to the 1 m policy floor makes measured side-boundary geometry genuinely decision-critical. If later measured evidence creates a real boundary/control discrepancy, legal-title work may then accelerate under its own authority.

`NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER`

Minimum class: `EA_ADDRESS_LEVEL_LONG_TERM_FLOOD_SCREEN`.

Only authoritative high-level Environment Agency screening is due at this gate. T8 does not pre-authorise an FRA, flood model, drainage design, infiltration testing or sewer work. The public EA service is the correct authority class; an approximate or secondary postcode result is not promoted into control evidence.

## Current authority / judgement frontier

These three blockers remain current, but they are not evidence-procurement instructions:

```text
PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT
  → PLANNING_EMERGING_POLICY_WEIGHT_JUDGEMENT

PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY
  → LOCAL_QUALITATIVE_DESIGN_JUDGEMENT

PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
  → STRATEGIC_CAPACITY_PLANNING_JUDGEMENT
```

Current authority establishes the source/status framework: Bromley Local Plan 2019 remains operative; Bromley's review material remains emerging/non-operative; the Draft London Plan published for July–October 2026 consultation remains unadopted; national policy defines factors for emerging-policy weight but not a universal scalar answer. Applying those sources to this candidate remains judgement-led.

T8 therefore refuses to convert planning judgement into a survey shopping list.

## Minimum surviving frontier

### External evidence classes

```text
COMPETENT_STRUCTURAL_CONCEPT_REVIEW
EA_ADDRESS_LEVEL_LONG_TERM_FLOOD_SCREEN
MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY
```

### Planning / professional authority classes

```text
LOCAL_QUALITATIVE_DESIGN_JUDGEMENT
PLANNING_EMERGING_POLICY_WEIGHT_JUDGEMENT
STRATEGIC_CAPACITY_PLANNING_JUDGEMENT
```

### Exact seven current unresolved blockers

```text
NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER
PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT
PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY
PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY
PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY
REFERENCE_HOUSE:RH-PROT-08
REFERENCE_HOUSE:RH-PROT-14
```

## Proof boundary

T8 does **not** establish:

```text
whole-site COMPATIBLE
whole-site INCOMPATIBLE
route exhaustion
planning permission / refusal prediction
legal boundary position
structural adequacy
measured site geometry
property-level flood safety
```

And it does not:

```text
mutate the Reference House
commission a survey or consultant
transfer applicant-proposal facts onto the Reference House candidate
promote the HMLR index polygon into legal or measured geometry
promote secondary flood data into Environment Agency authority
```

`DPL-16` remains `HELD`.

## Next packet

**DPL-T9 — Lennard no-cost authority closure and minimum external-evidence briefs.**

T9 should first attack the seven-item frontier without spending or commissioning:

1. recover authoritative public evidence where it can legitimately discharge a current blocker, especially the EA high-level flood screen;
2. perform a bounded delegated project planning/architectural judgement pass over the three judgement classes without pretending to be a statutory planning determination;
3. produce tightly scoped, non-duplicative briefs for structural concept review and measured side-boundary / maintenance geometry where external evidence still survives;
4. preserve the unchanged Reference House and the no-compatibility/no-route-exhaustion boundary.

Only evidence and authority still surviving T9 should be eligible for an actual commissioning packet.