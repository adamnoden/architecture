# DPL-10B — London Strategic Residential and Design Target

**Issue:** [#378 — DPL-10B — London strategic residential and design target](https://github.com/adamnoden/architecture/issues/378)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Planning source/status spine:** [DPL-10A](dpl-10a-planning-source-status-spine.md)  
**Research date:** 2026-10-20  
**Initial branch baseline:** `3fddf4b8508f99efe33162a80d910253f658e114`  
**Strategic planning context:** Greater London  
**Reference development class:** one new self-contained detached C3 dwelling  
**Structured slice:** [`targets/london-strategic-residential-design-v1.json`](targets/london-strategic-residential-design-v1.json)  
**Status:** first substantive London strategic planning slice; **not** a borough target and **not** a prediction of planning permission

## Question

> **Which operative London-wide residential/design obligations can be represented deterministically, which remain evidence- or judgement-led, and how can both coexist without turning planning into a false compliance score?**

DPL-10B deliberately chooses a mixed slice rather than only the easy numeric policies.

---

# 1. Result

The current adopted London strategic target can be represented honestly as several materially different obligation types:

```text
D3 — design-led site capacity / context response
     → PLANNING DESIGN JUDGEMENT

D5 — inclusive design
     → PLANNING / INCLUSIVE-DESIGN JUDGEMENT

D6 — minimum GIA / storage
     → NATIVE NUMERIC when proposal facts are admitted

D6 — minimum finished floor-to-ceiling-height coverage
     → NATIVE NUMERIC when finished-height/GIA facts are admitted

D6 — private outside space London baseline
     → NATIVE NUMERIC, conditional on no higher local standard

D7 — M4(2) / M4(3) accessible-housing requirement
     → STRATEGIC MIX REPRESENTATION + EXTERNAL PLANNING CATEGORY ASSIGNMENT
```

The governing result is:

> **Planning policy can contain deterministic propositions without planning itself becoming deterministic.**

DPL may compute the propositions whose authority and inputs genuinely make them computable. It must leave context, character, design quality, inclusion and the overall planning balance with the authority/judgement that owns them.

---

# 2. Operative source state

## 2.1 London Plan 2021

Primary strategic source used by this packet:

- **The London Plan 2021 — Chapter 3 Design**;
- publication status: **Adopted**;
- publication date: **1 March 2021**;
- official source: `https://www.london.gov.uk/programmes-strategies/planning/london-plan/the-london-plan-2021-online/chapter-3-design`;
- retrieval/research date: **20 October 2026**.

DPL-10A already freezes the source-status rule: the adopted London Plan is part of the operative development-plan environment; a known emerging replacement does not silently supersede it before adoption/effect.

DPL-10B therefore does **not** substitute draft/replacement London Plan material for the 2021 policy source.

## 2.2 Adopted London Plan Guidance

Two current adopted guidance sources are useful to this slice:

### Optimising Site Capacity: A Design-led Approach LPG

- status: **Adopted London Plan Guidance**;
- publication date: **8 June 2023**;
- official source: `https://www.london.gov.uk/programmes-strategies/planning/implementing-london-plan/london-plan-guidance/optimising-site-capacity-design-led-approach-lpg`.

It explains how the Policy D3 design-led approach should be applied.

It remains guidance. It is not promoted into London Plan policy merely because it is useful or adopted.

### Housing Design Standards LPG

- status: **Adopted London Plan Guidance**;
- publication date: **8 June 2023**;
- official source: `https://www.london.gov.uk/programmes-strategies/planning/implementing-london-plan/london-plan-guidance/housing-design-standards-lpg`.

The GLA describes it as guidance bringing together and interpreting housing-related London Plan design policies. The GLA also expressly warns that it should not be applied mechanistically and that the weight given to a departure is ultimately a matter for the decision maker.

That statement is an important DPL boundary:

```text
structured guidance
        ≠
statutory policy
        ≠
native planning permission algorithm
```

---

# 3. Structured target slice

The packet adds:

`project/dpl/targets/london-strategic-residential-design-v1.json`

Its purpose is not to freeze the future DPL-12 schema.

It proves that one planning target slice can retain:

- source status and provenance;
- statutory policy versus guidance;
- exact policy provision;
- numeric and qualitative methods in one target;
- conditional applicability;
- local-policy composition points;
- cross-target outputs;
- current Reference House evidence gaps;
- explicit non-claims.

This is the planning counterpart to DPL-09B's first England technical slice.

---

# 4. Policy D3 — design-led site capacity

## Policy duty

Policy D3 requires development to use a design-led approach that optimises site capacity by finding an appropriate form and land use responsive to:

- site context;
- capacity for growth;
- supporting infrastructure;
- the wider design outcomes required by the policy.

The Plan explicitly distinguishes **optimum capacity** from simply maximum capacity.

## DPL method

```text
PLANNING_DESIGN_JUDGEMENT
```

The compiler can assemble evidence and expose the due question. It cannot truthfully reduce D3 to:

```text
density = 42 dwellings/ha
therefore PASS
```

or:

```text
traditional-looking = contextually appropriate
therefore PASS
```

## Evidence the deployment case can organise

At proportionate scope:

- plot geometry and access;
- surrounding form, grain, height and massing;
- landscape/topography;
- relevant heritage/context evidence;
- connectivity/infrastructure context;
- proposal footprint, scale and site organisation;
- alternatives/design rationale where material;
- relationship to operative borough/site-allocation evidence once DPL-10C exists.

## Reference House consequence

DPL-02's **compatibility before adaptation** rule is exactly the correct response to D3.

A planning judgement that the fixed 12.0 × 10.8 m Reference House form is inappropriate on a particular plot does not automatically authorise the compiler to distort the house.

The deployment case must instead expose:

```text
site/planning pressure
        ↓
admitted site-interface / conformance-preserving responses
        ↓
if still unresolved/conflicting
        ↓
explicit architectural rewind OR site rejection
```

Current DPL result:

```text
D3: UNRESOLVED
method: PLANNING_DESIGN_JUDGEMENT
```

---

# 5. Policy D5 — inclusive design

## Policy duty

Policy D5 requires development proposals to achieve high standards of accessible and inclusive design, including:

- consideration of London's diverse population;
- high-quality people-focused spaces;
- no disabling barriers;
- independent access without undue effort, separation or special treatment;
- safe, easy and dignified entry, use and exit;
- inclusive-design material within the Design and Access Statement proportionate to the development.

The policy is broader than a Part M dwelling category.

## DPL method

```text
PLANNING_INCLUSIVE_DESIGN_JUDGEMENT
```

DPL can expose evidence such as:

- principal arrival/approach relationship;
- DPL-08B ground/datum/access duties;
- internal route and threshold evidence;
- relevant human-factors decisions;
- emergency-evacuation strategy where due;
- design rationale and documented departures.

It cannot replace the qualitative policy with a score.

## Important non-collapse

```text
M4(2) selected
        ≠
D5 discharged
```

and:

```text
flush threshold shown
        ≠
inclusive-design policy discharged
```

D5 concerns the whole inclusive-design proposition and its relationship to the context/proposal.

Current result:

```text
D5: UNRESOLVED
method: PLANNING_INCLUSIVE_DESIGN_JUDGEMENT
```

---

# 6. Policy D6 — housing quality and standards

D6 is useful because one policy contains both qualitative design obligations and unusually explicit numeric standards.

DPL-10B admits only the bounded numeric families needed to prove the target model. It does not claim D6 as a whole has become machine-provable.

## 6.1 Minimum GIA and built-in storage — D6 F(1) / Table 3.1

For self-contained housing, D6 requires minimum GIA and built-in storage according to:

- bedroom count;
- bedspace/person count;
- dwelling storeys.

The complete published table for 1–6 bedrooms / up to 8 bedspaces is represented in the structured target artefact.

### Native method

```text
NATIVE_POLICY_NUMERIC
```

Required proposal facts:

```text
bedroomCount
bedspaceCount
dwellingStoreys
policyDefinedGIA
builtInStorageArea
```

Method:

1. exact lookup of the bedroom/bedspace/storey tuple;
2. compare GIA to minimum GIA;
3. compare built-in storage to minimum storage;
4. report each result independently with exact source identity.

A missing tuple/fact does not choose the nearest standard.

### Current Reference House

The current controlled upper floor contains four bedrooms and the house has two principal storeys, but DPL does **not** yet have:

- a planning-authority bedspace/occupancy declaration;
- a policy-defined GIA measurement admitted at this proof boundary;
- final built-in storage area measured to the policy definition.

Therefore:

```text
D6 GIA / storage: UNRESOLVED
```

This is preferable to estimating from the 12.0 × 10.8 m outer shell or inferring bedspaces from room names.

## 6.2 Finished floor-to-ceiling height — D6 F(8)

The current policy requires a minimum **2.5 m floor-to-ceiling height for at least 75% of dwelling GIA**.

### Native method

```text
areaHeightAtLeast2_5m / policyDefinedGIA >= 0.75
```

Required inputs are finished dimensions, not gross storey datums.

### Reference House consequence

The RH +3300 mm floor-to-floor datum is **not** proof of this policy requirement.

Floor build-up, ceiling zone/finish and qualifying GIA must still be known.

Current result:

```text
D6 ceiling-height coverage: UNRESOLVED
```

## 6.3 Private outside space — D6 F(9)

Where no higher local standard applies, the London baseline is:

- **5 m²** private outdoor space for a 1–2 person dwelling;
- **+1 m²** for every additional occupant;
- minimum qualifying depth **1.5 m**;
- minimum qualifying width **1.5 m**.

### Native method

The arithmetic itself is deterministic.

The applicability relation is not complete until local target composition can answer whether a **higher borough standard** applies.

Therefore the structured target represents:

```text
LONDON BASELINE
        +
LOCAL-HIGHER-STANDARD STATUS
        ↓
applicable obligation set
```

It does not use London policy to erase a stronger local requirement.

### Reference Site consequence

`DPL-RS-01` contains substantial garden territory, but DPL-10B does not call D6 F(9) `PASS` because:

- planning occupancy/bedspace count remains unfrozen;
- final qualifying private-space geometry/landscape is not yet a planning proposal;
- local higher-standard status is intentionally absent before DPL-10C.

Current result:

```text
D6 private outside space: UNRESOLVED
```

---

# 7. Policy D7 — accessible housing

## Strategic requirement

For dwellings created through work to which Part M Volume 1 applies, D7 states strategically:

- at least **10%** of dwellings are to meet `M4(3)` wheelchair-user dwelling requirements;
- all other dwellings are to meet `M4(2)` accessible/adaptable dwelling requirements.

The supporting text expects the selected categories to be secured by planning condition so building control can then check the optional Building Regulations standard.

This is a canonical cross-target relationship.

## Authority flow

```text
LONDON PLANNING POLICY D7
        ↓
planning proposal / category schedule
        ↓
planning authority determination / condition
        ↓
resolved dwelling category
        ↓
ENGLAND BUILDING-CONTROL TARGET
        ↓
M4(2) or M4(3) technical obligation
```

Planning selects the optional standard requirement.

Building control owns technical compliance with that standard.

Neither authority becomes the other.

## The single-dwelling problem

The Reference House deployment case contains one dwelling.

DPL-10B deliberately does **not** implement:

```text
round(10% × 1 dwelling)
```

or:

```text
single dwelling therefore automatically M4(2)
```

as a strategic native rule.

The London Plan states the strategic development requirement and supporting implementation via planning condition, but this packet has no borough/application determination assigning the one Reference House to an individual category.

There is also real planning practice showing that individual small/single-dwelling applications may be handled through M4(2) while the M4(3) percentage is treated at larger-development scale. That practice is useful context, but DPL-10B does not elevate one borough committee interpretation into pan-London statutory policy.

Therefore current Reference House result:

```text
D7 strategic duty: PRESENT
individual RH category: UNRESOLVED
method: PLANNING_CATEGORY_ASSIGNMENT
```

When a future real planning case/condition resolves the category, that value becomes a **cross-target input**, not a DPL guess.

## M4(3) accessible vs adaptable

The Plan/supporting guidance also distinguishes wheelchair-accessible and wheelchair-adaptable cases; national planning guidance limits when a local-plan policy can require an immediately wheelchair-accessible rather than adaptable home.

DPL-10B does not collapse those subcategories. They remain part of the eventual planning condition/category evidence.

---

# 8. D4 and design scrutiny

D4 requires suitable design analysis/scrutiny and Design and Access Statement evidence proportionate to the proposal.

For this first target slice, D4 is treated mainly as a **process/evidence relationship**, not a new design-quality algorithm.

It reinforces two rules:

1. the target may require evidence explaining design choices;
2. the compiler cannot replace planning/urban-design scrutiny merely by generating more diagrams.

Later planning-case orchestration may model D4 evidence obligations explicitly once the first borough/application workflow exists.

DPL-10B does not invent that workflow prematurely.

---

# 9. Guidance relationship

## Optimising Site Capacity LPG

Useful to structure D3 evidence and site/design options.

It does not create a hidden native capacity formula that supersedes D3 judgement.

## Housing Design Standards LPG

Useful to:

- interpret D5/D6/D7 relationships;
- organise housing-design evidence;
- distinguish required policy standards from voluntary best practice;
- clarify the design intent around flexible dwelling layouts and private space.

But the GLA's own status statement says the guidance should not be applied mechanically and decision makers determine the weight of departures.

Therefore DPL must preserve, for every guidance-derived item:

```text
source status = GUIDANCE
not POLICY
```

A useful checklist is not promoted into statutory policy merely because a compiler likes checklists.

---

# 10. Target-slice method classes

## `NATIVE_POLICY_NUMERIC`

Allowed where:

- the operative policy contains a clear numeric proposition;
- applicability is established;
- the proposal facts have controlled definitions/units;
- no hidden judgement is being smuggled into the input;
- the result is labelled as the bounded policy check only.

D6 GIA/storage, height coverage and London-baseline private-space arithmetic are admitted examples.

## `PLANNING_DESIGN_JUDGEMENT`

Used for D3/context/design-led capacity and related design-quality propositions.

The compiler may present:

- source;
- relevant facts;
- contradictory evidence;
- design rationale;
- unresolved questions.

It does not emit a native design-quality `PASS`.

## `PLANNING_INCLUSIVE_DESIGN_JUDGEMENT`

Used for D5 whole-proposal inclusive-design adequacy.

It may consume bounded geometric/technical evidence while retaining the policy's wider qualitative authority.

## `PLANNING_CATEGORY_ASSIGNMENT`

Used where planning must resolve an optional technical category that another target subsequently proves.

D7 is the first concrete example.

---

# 11. Test flows

## P1 — D6 GIA with complete facts

Example only:

```text
bedrooms = 4
bedspaces = 6
storeys = 2
GIA = 108 m²
storage = 3.2 m²
```

Table 3.1 lookup:

```text
minimum GIA = 106 m²
minimum storage = 3.0 m²
```

Native result:

```text
D6 GIA       PASS
D6 storage   PASS
```

This proves only those numeric standards.

It does not prove D3, D5, D6 qualitative quality, D7, borough policy or planning permission.

## P2 — D6 GIA with unknown bedspaces

```text
bedrooms = 4
bedspaces = UNKNOWN
storeys = 2
GIA = known
```

Result:

```text
D6 GIA / storage: UNRESOLVED
missing fact: planning bedspace count
```

Do not select the easiest/minimum 4-bedroom table row.

## P3 — D6 ceiling height

```text
policy GIA = 200 m²
area ≥ 2.5m finished height = 160 m²
ratio = 0.80
```

Bounded result:

```text
D6 F(8): PASS
```

Again, no whole-policy or permission claim follows.

## P4 — D3 on an apparently generous site

Even if plot area and setbacks look generous:

```text
D3: UNRESOLVED / JUDGEMENT_REQUIRED
```

until context, form and design-led site response are assessed at planning-case scope.

## P5 — D7 with one dwelling and no condition/category evidence

```text
dwelling count = 1
Part M Volume 1 applicability = yes
individual category = UNKNOWN
```

Result:

```text
D7 strategic requirement: PRESENT
individual category: UNRESOLVED
```

No 10% rounding algorithm is permitted.

## P6 — D7 after planning condition

If an authoritative planning condition later specifies:

```text
Reference House → M4(2)
```

DPL may emit:

```text
cross-target obligation:
  England Building Control / M4(2)
```

Planning evidence resolves **which standard** applies.

Building-control evidence later resolves **whether the design satisfies it**.

---

# 12. Current Reference House disposition

DPL-10B intentionally stops short of a strategic planning `PASS`.

| Obligation | Current DPL state | Why |
|---|---|---|
| D3 design-led response | `UNRESOLVED` / judgement | no real planning context/borough/site evidence or planning-case rationale |
| D5 inclusive design | `UNRESOLVED` / judgement | useful HFI/interface evidence exists, but whole planning duty not externally assessed |
| D6 GIA/storage | `UNRESOLVED` | bedspace count + policy-measured GIA/storage not frozen |
| D6 ceiling-height coverage | `UNRESOLVED` | floor-to-floor datum is not finished-height area evidence |
| D6 private outside space | `UNRESOLVED` | occupancy + final qualifying geometry + local-higher-standard status absent |
| D7 accessible category | `UNRESOLVED` | no authoritative planning category assignment/condition |

This is a strong result rather than an incomplete one: the target now identifies **exactly what is missing and why**.

---

# 13. Relationship with DPL-14B

The three-site real pilot should now collect enough public evidence to exercise the *questions* behind D3/D5/D6/D7 without pretending to decide them.

Especially useful site/context claims include:

- street/plot/edge relationship;
- surrounding built form and obvious scale context;
- access/approach condition;
- orientation and neighbouring massing;
- available private-space geometry at source precision;
- obvious designations/context constraints;
- borough identity;
- current proposal/listing facts where a proposal exists.

DPL-14B should not infer a D3/D5 planning judgement from a listing photo.

The pilot may, however, prove whether the site manifest contains the right facts to support later planning work.

---

# 14. Relationship with DPL-08B

DPL-08B protects the architectural/site-interface problem at ground, datum and approach.

DPL-10B supplies external planning duties that may act on it.

Examples:

```text
D5 independent / non-segregated access duty
        +
D7 planning-selected M4 category
        ↓
DPL-08B ACCESS / MOVEMENT interface
        ↓
later technical design
```

The planning target does not author ramp/threshold/site-interface geometry.

The site-interface contract does not decide planning-policy acceptability.

---

# 15. Relationship with DPL-09B

The first concrete cross-target relation is D7:

```text
PLANNING
  select/condition M4(2) or M4(3)

BUILDING CONTROL
  prove optional technical requirement
```

DPL-09B itself does not own Part M, but it establishes the general England technical-target pattern that later DPL-09F can use.

The B2 integration gate can now test whether the shared orchestration model needs a first-class **cross-target obligation edge** rather than merely a flat set of unrelated checks.

---

# 16. Borough boundary

DPL-10B remains strategic only.

It does **not** select a borough or encode:

- local-plan character policy;
- local housing standards;
- conservation-area guidance;
- borough design codes;
- local parking/refuse standards;
- local amenity/privacy/daylight rules;
- neighbourhood plans;
- borough-specific M4 implementation practice.

Where D6 F(9) expressly defers to a higher local private-space standard, DPL-10B records that composition point as unresolved until the local target exists.

The first borough remains a future empirical choice after DPL-14 evidence.

---

# 17. Red-team

## Failure mode — planning = numeric standards

Rejected.

The same target contains D3/D5 judgement and D6 numeric checks.

## Failure mode — D3 “optimise” = maximise development

Rejected.

The operative Plan explicitly treats optimum site capacity as context/design-led rather than a maximum-density algorithm.

## Failure mode — traditional architecture = D3/D4 pass

Rejected.

G-01 / Georgian-derived language is an Ovid's House architectural choice. Planning still judges actual context, form, scale and design quality.

## Failure mode — M4(2) = inclusive design complete

Rejected.

D5 is broader than a Building Regulations category.

## Failure mode — 3.3 m storey height proves D6 F(8)

Rejected.

The policy metric is finished floor-to-ceiling height over policy GIA.

## Failure mode — large garden obviously passes private-space policy

Rejected at current authority.

Occupancy, qualifying final geometry and potentially higher local standards still matter.

## Failure mode — 10% of one dwelling = automatic category

Rejected as a native strategic computation.

The strategic mix is represented; the individual category waits for actual planning proposal/condition/local application evidence.

## Failure mode — LPG checklist item = statutory policy

Rejected.

Guidance source status remains visible and non-mechanical.

## Failure mode — all D6 checks pass therefore planning permission likely

Rejected.

Bounded numeric results remain bounded numeric results.

---

# 18. Consequences for later DPL-12

DPL-10B earns several concrete orchestration requirements:

- policy and guidance source classes must coexist without authority collapse;
- one target contains several method classes;
- a native numeric obligation may remain unresolved because a proposal fact is missing;
- local target composition may strengthen a strategic minimum;
- cross-target obligations require directional edges (`planning → building control`);
- a planning judgement may remain unresolved even where many supporting geometry checks pass;
- one proposal can have a mix of PASS/UNRESOLVED/JUDGEMENT_REQUIRED-style presentation without an aggregate planning score;
- target outputs must preserve exact source/status and non-claim boundary.

Those are concrete runtime pressures, not abstract ontology.

DPL-12 remains held until DPL-14B supplies real site records and the B2 gate compares all four slices.

---

# 19. Explicit non-claims

DPL-10B does **not** establish that:

- the Reference House optimises any real London site;
- its Georgian-derived design is acceptable in a particular context;
- D5 inclusive-design policy is discharged;
- the Reference House satisfies D6 GIA/storage/height/private-space requirements;
- the Reference House is M4(2) or M4(3);
- an M4 category selected at planning would itself be technically satisfied;
- Housing Design Standards LPG is statutory London Plan policy;
- the emerging/replacement London Plan is operative;
- any borough policy has been evaluated;
- planning permission is likely or granted;
- DPL can replace planning/design judgement.

---

# 20. Closeout

DPL-10B proves the first substantive strategic planning slice with the correct asymmetry:

> **Compute the exact things policy genuinely makes exact; preserve judgement where planning genuinely requires judgement; and make cross-target obligations explicit instead of merging authorities.**

The result now sits beside DPL-09B's technical target slice and DPL-08B's land/building interface contract as the third concrete B2 vertical.
