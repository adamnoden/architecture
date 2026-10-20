# DPL-09 — England New-Dwelling Regulatory Target Inventory

**Issue:** [#348 — DPL-09 — inventory the England new-dwelling regulatory target](https://github.com/adamnoden/architecture/issues/348)  
**Programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Research date:** 2026-10-20  
**Baseline `main`:** `7646cd6a21ae4d1108a720d0471b79f49b1848d3`  
**Jurisdiction:** England  
**Project class studied:** new, low-rise detached dwelling; non-HRB unless later facts contradict that classification  
**Status:** authority/applicability inventory; **not** a declaration of compliance and **not** a release-grade compiler target

## Question

> **What exact statutory requirements, official guidance routes, technical standards, transitional conditions and external determinations can constrain a new detached dwelling in England, and how should that corpus be decomposed for later target implementation?**

DPL-09 answers the inventory/decomposition question.

It does not implement all requirements.

## Executive conclusion

A release-grade England target cannot be one object called `ENGLAND_2026`.

At minimum it must distinguish:

1. **technical/substantive Building Regulations obligations**;
2. **statutory process, dutyholder and competence obligations**;
3. **source-law snapshot and amendments**;
4. **Approved Document / official guidance route**;
5. **referenced standards / calculations / product evidence**;
6. **project/site facts that determine applicability**;
7. **transitional conditions tied to notices/applications and commencement events**;
8. **method implementation identity**;
9. **external professional/statutory evidence where native computation is not authoritative**.

The current House Kernel / Metamorph Compiler is nowhere near whole-target coverage and should continue to say so.

The DPL-09 inventory therefore recommends **domain child packets**, not one giant regulations implementation.

## Primary authority recovered

### Building Regulations 2010

Primary current instrument:

- **The Building Regulations 2010 — SI 2010/2214**, as amended;
- current revised/point-in-time legislation available at `legislation.gov.uk`;
- source checked 2026-10-20.

Primary source:

`https://www.legislation.gov.uk/uksi/2010/2214/contents`

The current legislation contains substantive requirements, application/notification provisions, dutyholder/process provisions and other regulations around Schedule 1.

A target must not model only the letters A–T and ignore the surrounding regulations.

### 2023 dutyholder / competence amendments

**The Building Regulations etc. (Amendment) (England) Regulations 2023 — SI 2023/911** came into force on 1 October 2023 and inserted Part 2A into the 2010 Regulations.

Among other matters, Part 2A creates statutory duties for clients, designers and contractors to plan/manage/monitor work so relevant requirements are complied with and sets competence requirements.

Primary source:

`https://www.legislation.gov.uk/uksi/2023/911`

These are real statutory obligations but are not sensibly represented as ordinary geometric/technical compiler checks.

They belong in a distinct **statutory process/dutyholder target family** that can track appointments, declarations/evidence and unresolved external obligations without pretending the compiler proves competence.

### 2026 Future Homes and Buildings Standards amendments

**The Building Regulations etc. (Amendment) (England) Regulations 2026 — SI 2026/335** were made on 23 March 2026.

Primary sources:

- `https://www.legislation.gov.uk/uksi/2026/335/enacted`
- `https://www.gov.uk/government/publications/the-future-homes-and-buildings-standards-building-circular-012026`
- `https://www.gov.uk/government/publications/the-future-homes-and-buildings-standards-building-circular-012026/the-future-homes-and-buildings-standards-building-circular-012026-letter`

For ordinary **non-HRB** work the principal 2026 changes come into force on **24 March 2027**.

The official circular states that those changes do not apply to work where a building notice, initial notice or building-control approval application with full plans is given/made before 24 March 2027 **provided the relevant work is commenced before 24 March 2028**.

Therefore:

```text
application / notice date alone
    ≠
complete regulatory target selection
```

A future commencement event can change whether the previous or successor F/L regime is available.

The existing S0 research target correctly discovered this issue. DPL-09 confirms it belongs in the general target architecture, not only that experiment.

## Approved Documents are guidance routes, not the law

Canonical official collection:

`https://www.gov.uk/government/collections/approved-documents`

Approved Documents are statutory guidance giving practical routes for common circumstances. They are important target inputs but must not be promoted into the functional legal requirement itself.

Canonical chain:

```text
LEGAL / FUNCTIONAL REQUIREMENT
        ↓
SELECTED COMPLIANCE / EVIDENCE ROUTE
        ↓
APPROVED DOCUMENT / STANDARD /
CALCULATION / PRODUCT EVIDENCE /
PROFESSIONAL DETERMINATION
```

Alternative compliant routes remain possible where law/competent determination allows them.

## Technical requirement-family inventory

The following table is an **inventory**, not a statement that every paragraph applies to every candidate.

| Family | Current England guidance family checked 2026-10-20 | New detached dwelling posture | Likely project resolution mode |
|---|---|---|---|
| **A — Structure** | Approved Document A | core applicable family | competent structural design/calculation + bounded native geometry where justified |
| **B — Fire safety** | Approved Document B Vol. 1, 2019 edition with effective 2020/2022/2025/2026 amendments and future 2029 changes collated in publication | core applicable family; exact provisions depend on building facts | mixed bounded geometry + product/specification + competent fire/building-control review |
| **C — Site preparation / contaminants / moisture** | Approved Document C | core site/envelope family | site evidence + building-detail methods + external evidence |
| **D — Toxic substances** | Approved Document D, 2010 edition incorporating amendments | conditional; notably relevant to certain cavity-insulation conditions/materials | product/material route; often `NOT_APPLICABLE` only after product/build-up facts prove it |
| **E — Resistance to sound** | Approved Document E | applicable in part to dwelling-house internal/acoustic conditions; separating-building provisions depend on actual context | specification/detail + test/calculation/external acoustic evidence as required |
| **F — Ventilation** | current pre-2027 dwelling guidance or 2026 AD F Volume 1 depending transition basis | core applicable family | ventilation design, sizing, commissioning and evidence; some native arithmetic possible later |
| **G — Sanitation, hot-water safety, water efficiency** | Approved Document G, current edition incorporating 2024 amendments | core applicable family | design/specification/calculation + commissioning/product evidence |
| **H — Drainage and waste disposal** | Approved Document H | core applicable family with strong site dependency | site claim + drainage design/calculation + statutory undertaker/external evidence where relevant |
| **J — Combustion appliances / fuel storage** | Approved Document J, 2010 edition incorporating 2010/2013/2022 amendments | **conditional**; current RH all-electric baseline may make much of J not applicable, but that conclusion depends on final appliance/fuel facts | applicability + product/system/external competent evidence |
| **K — Falling, collision and impact** | Approved Document K | core applicable family | strong candidate for bounded native geometry plus product/detail evidence |
| **L — Energy / greenhouse-gas / future renewable-electricity requirements** | current 2021/2023 dwelling route or 2026 Approved Document L Vol. 1 depending transition basis | core applicable family; **transition-sensitive** | regulated energy model, fabric/services evidence, commissioning; largely external specialist software/evidence initially |
| **M — Access to and use** | Approved Document M Vol. 1: dwellings, 2015 edition with 2016 amendments | M4(1) baseline; M4(2)/M4(3) are planning-triggered optional categories where required | bounded geometry + planning-target trigger + professional/detail evidence |
| **O — Overheating** | Approved Document O, 2021/2022 corrected edition | applies to new residential buildings | simplified/dynamic route depending case; site/orientation/shading facts material |
| **P — Electrical safety** | Approved Document P, dwellings | core dwelling family | competent electrical design/install/test/certification; limited native target role |
| **Q — Security in dwellings** | Approved Document Q | applies to new dwellings | product/opening specification + evidence; some semantic checks possible |
| **R — Electronic communications infrastructure** | Approved Document R Vol. 1, 2022 edition for new dwellings | applies to erection of new dwellings subject to detailed conditions/exceptions | infrastructure/connection design + provider evidence |
| **S — EV charging infrastructure** | Approved Document S | conditional on associated parking and detailed statutory conditions | site/parking applicability + electrical/site design + external evidence |
| **T — Toilet accommodation** | Approved Document T, current corrected 2025 edition | **not applicable to a new dwelling**; guidance applies to new buildings other than dwellings and certain material changes of use | exclude from ordinary detached-dwelling target unless project class changes |
| **Regulation 7 — Materials and workmanship** | Approved Document 7, current guidance including 2018 amendment | core cross-cutting requirement | product/system evidence + workmanship/inspection/external evidence |

### Important inventory rule

A family appearing in the target does not imply native compiler support.

The target may legitimately say:

```text
A — structural stability
  target applicability: APPLICABLE
  native method:        UNSUPPORTED
  discharge route:      competent structural evidence

K — selected stair geometry
  target applicability: APPLICABLE
  native method:        supported for declared bounded subset
  wider Part K:         unresolved / external / unsupported
```

That is preferable to omitting an applicable requirement merely because it is inconvenient to compute.

## Current guidance / transition notes

### Part B — current publication is temporally layered

The current Approved Document B publication collates amendments with different effective dates.

Official MHCLG material identifies:

- 2025 amendments effective 2 March 2025, subject to transition;
- 2026 amendments effective 30 September 2026, subject to transition;
- 2029 amendments effective 2 September 2029, subject to transition.

The 2026 amendment includes second-stair provisions for residential buildings over 18 m. That specific change is unlikely to drive this low-rise detached dwelling, but the **target source identity still must know which amendment state is applicable** rather than treating a collated PDF as one timeless ruleset.

Source family:

- `https://www.gov.uk/government/publications/fire-safety-approved-document-b`
- `https://www.gov.uk/government/publications/amendments-to-approved-document-b-fire-safety-circular-and-letter`

### Parts F and L — material 2027 transition

New 2026 Approved Documents F and L were published 24 March 2026 and corrected/revised 8 September 2026.

Official pages explicitly state that earlier versions continue to apply to buildings subject to previous regulatory standards.

For a non-HRB new dwelling, the DPL target must therefore model at least:

```text
application / notice event
commencement event
building/work class
transition qualification
selected F source snapshot
selected L source snapshot
method/software version
```

A compile in October 2026 cannot simply select the newly published 2026 documents because they exist.

### Part M — planning can select the regulatory category

Approved Document M Volume 1 distinguishes:

- Category 1 — visitable dwelling;
- Category 2 — accessible and adaptable dwelling;
- Category 3 — wheelchair-user dwelling.

Official guidance notes Categories 2 and 3 apply where required by planning permission.

This is a concrete cross-target dependency:

```text
PLANNING TARGET / PERMISSION CONDITION
          ↓
selects M4 category
          ↓
BUILDING-CONTROL TARGET OBLIGATIONS
```

DPL-10 must therefore be able to pass a resolved planning requirement into target applicability without merging planning and building-control authority.

### Part S — site/parking fact controls applicability

Approved Document S applies to new residential buildings, but detailed requirements depend on associated parking.

Official FAQs state that a new detached house with two associated parking spaces requires one charge point, while a building with no associated parking space does not require one merely because it is a new dwelling.

This is another clean DPL example:

```text
SITE / PROJECT PARKING CLAIM
          ↓
PART S APPLICABILITY
          ↓
technical obligation
```

### Part O — site/orientation evidence matters

Approved Document O applies to new residential buildings.

Its compliance routes depend on glazing/orientation/location/shading/ventilation facts and may use simplified or dynamic-thermal methods.

This family should not be encoded before DPL-10/site-environment work establishes authoritative inputs and appropriate modelling boundaries.

## Requirements outside the simple A–T list

A release-grade target inventory must include relevant regulations outside Schedule 1 letters.

Examples include:

- dutyholder/client/designer/contractor duties and competence under Part 2A;
- application/building-control procedural obligations;
- completion/notification/declaration evidence;
- regulations supporting Part L/F calculations, testing, commissioning and information where applicable;
- Regulation 7 material/workmanship requirements;
- any current project-class-specific procedural/substantive requirements discovered during domain implementation.

DPL-09 does not yet formalise every procedural regulation.

It freezes the requirement that later target work **must not equate “all Parts A–T considered” with “the legal target is complete”.**

## Technical target versus statutory process target

DPL-09 recommends two linked but distinct families.

### A. `ENGLAND_BUILDING_TECHNICAL`

Owns:

- substantive technical requirements;
- Schedule 1 applicability;
- selected compliance/evidence routes;
- source/guidance/standard provenance;
- native/external/unsupported method coverage.

### B. `ENGLAND_BUILDING_PROCESS`

Owns or tracks:

- applicable building-control route;
- dutyholder roles/appointments;
- statutory competence/duty declarations as external/process evidence;
- notice/application/completion events;
- transition-trigger events;
- external approval/certificate state;
- other process obligations.

The compiler may track that evidence/process state.

It must not claim to prove:

- professional competence;
- statutory approval;
- truth of signed declarations;
- Building Control acceptance.

## Source-version / method-version separation

DPL-05 already freezes four separate identities.

DPL-09 confirms they are necessary in practice.

Example:

```text
external source:
  Approved Document K 2013

formal target model:
  ENG-K-PRIVATE-STAIR-v2

compiler method:
  RH-C5-K-STAIR-METHOD-v4

composition:
  ENG-NDW-<project-transition-basis>-vN
```

If the compiler method contains a bug and is corrected:

- source law/guidance version does not change;
- target model may or may not change;
- method identity must change;
- affected results become stale/recompiled.

## Existing project computational coverage

### RH-C5

The current bounded stair method is useful precedent because it already records:

- external source identity;
- edition;
- applicability context;
- implementation identity;
- fail-closed unsupported input handling;
- explicit refusal to call bounded numeric correspondence whole-building compliance.

DPL-09 preserves that posture.

RH-C5 currently proves only one selected numeric method family over controlled Reference House stair geometry.

It does not establish:

- Part K as a whole;
- M4 access compliance;
- fire escape adequacy;
- whole-building technical adequacy;
- Building Regulations compliance.

### S0 historical targets

The S0 regulatory research snapshots remain useful evidence that:

- source coverage can be incomplete;
- transitions can depend on future events;
- target modelling itself can improve while external law does not change.

They remain research fixtures, not the release DPL-09 target.

## Machine-native / external / judgement classification

The correct implementation strategy is mixed.

### Strong native candidates

Examples of potentially defensible bounded native methods include:

- explicit dimensional geometry;
- selected stair/guarding/clearance relationships;
- explicit route-length or opening relationships where authoritative inputs are controlled;
- deterministic semantic applicability;
- simple numerical calculations with authoritative equations and test cases.

Native suitability must be proved per method; it is not inherited from the Part letter.

### Native + external model

Likely examples:

- energy/carbon modelling;
- overheating;
- ventilation system sizing;
- acoustics;
- drainage/hydraulics;
- structural sizing;
- moisture/condensation analysis.

The DPL system may orchestrate inputs/results while accepted specialist software/professional work remains the evidential authority.

### Primarily external professional / product / commissioning evidence

Likely examples:

- structural design responsibility;
- foundation/geotechnical adequacy;
- product fire performance;
- electrical certification/testing;
- ventilation commissioning;
- airtightness testing;
- acoustic testing where required;
- water/system commissioning;
- final as-built declarations/certificates.

The compiler should track evidence and unresolved obligations rather than manufacture calculations merely for apparent coverage.

## Standards and licensing

Approved Document routes often refer to British, European and other standards.

DPL-09 confirms the existing project restraint:

> **A citation to a standard is not permission to reproduce its copyrighted text, tables or normative content in executable form.**

Before implementing a standard-derived method, the relevant child packet must establish:

- lawful source/access;
- exact edition/national annex where applicable;
- whether the required rule can be independently and lawfully implemented;
- authoritative validation cases;
- scope/applicability;
- method-version provenance.

Where that cannot be established, use external evidence or leave the native method unsupported.

## Target source register — first release inventory

The following source families are mandatory starting points for the later England target.

### Core legislation

- The Building Act 1984, relevant current provisions;
- The Building Regulations 2010, SI 2010/2214 as amended;
- Building Regulations etc. (Amendment) (England) Regulations 2023, SI 2023/911;
- Building Regulations etc. (Amendment) (England) Regulations 2026, SI 2026/335;
- other amending instruments identified by each technical-domain packet as relevant to the selected snapshot.

### Official current guidance collection

- GOV.UK Approved Documents collection;
- relevant current Approved Document pages/booklets/circulars;
- current Future Homes and Buildings Standards circular for transition logic;
- current Approved Document B amendment circulars for effective-date layering.

### External standards / technical methods

Enumerated only inside the child domain that actually relies on them.

Do not build one giant standards list disconnected from an admitted method.

## Recommended child decomposition

The inventory is large enough that substantive implementation should **not** remain one issue.

The seams below follow technical authority/evidence relationships rather than alphabetic convenience.

### DPL-09A — England legal / applicability / process spine

Own:

- Building Regulations 2010 project-class applicability;
- amendment/source snapshot;
- transition events;
- Part 2A dutyholder/process family;
- technical-target ↔ process-target boundary;
- common target identity and source registry;
- cross-domain applicability API/contract, but not all technical methods.

This packet should land first.

### DPL-09B — structure, ground, moisture, materials

Own likely families:

- A;
- C;
- D where applicable;
- Regulation 7;
- site/geotechnical dependencies and external structural/material evidence boundaries.

This packet should coordinate closely with DPL-11 and later DPL-08.

### DPL-09C — fire safety

Own:

- Part B;
- dwelling-specific applicability;
- current 2025/2026 amendment state and transition;
- fire-product evidence;
- means-of-escape / internal layout / external-spread / fire-service information boundaries as actually applicable;
- professional/building-control evidence split.

Fire is sufficiently consequential to remain its own packet.

### DPL-09D — ventilation, energy and overheating

Own:

- F;
- L;
- O;
- 2026/2027 Future Homes and Buildings transition;
- approved calculation/model interfaces;
- weather/location/site inputs;
- commissioning/test evidence;
- L3/on-site renewable electricity requirements when the successor target applies.

### DPL-09E — sanitation, water and drainage

Own:

- G;
- H;
- water-efficiency / hot-water safety;
- foul/surface-water building-side obligations;
- drainage evidence boundary with DPL-11 site/sewer due diligence.

### DPL-09F — access, movement and fall/collision safety

Own:

- K;
- M;
- planning-selected M4 category dependency;
- bounded geometry versus detail/product/external proof;
- HFI/Reference House preference versus regulatory floor separation.

This is where the existing 300 mm stair preference must remain clearly separate from statutory guidance.

### DPL-09G — acoustic performance

Own:

- E;
- exact dwelling-house applicability;
- internal/across-boundary distinctions;
- design specification vs testing/competent acoustic evidence.

Keep acoustic evidence separate rather than burying it inside generic envelope work.

### DPL-09H — electrical, security, communications and EV infrastructure

Own:

- P;
- Q;
- R;
- S;
- product/certification/provider evidence;
- parking-dependent Part S applicability;
- communication-provider / network evidence boundaries.

### DPL-09I — combustion conditional route

Own:

- J;
- exact `NOT_APPLICABLE` proof for the all-electric canonical Reference House where appropriate;
- what happens if a fireplace/combustion appliance re-enters the design;
- carbon-monoxide / flue / air-supply consequences.

Keep conditional exclusion explicit rather than deleting J from the target.

### DPL-09J — England target integration / coverage red-team

After domain packets:

- compose the release research target;
- audit omitted regulations outside Schedule 1;
- attack transition coverage;
- attack unsupported-method leakage;
- verify source/version registry;
- ensure current and successor target branches remain reproducible;
- obtain/prepare competent regulatory review at the claimed scope.

## Dependency recommendation

```text
DPL-09 inventory — this packet
          ↓
      DPL-09A
   legal/process spine
          ↓
 ┌────────┼─────────────────────────────────────┐
 ↓        ↓        ↓       ↓       ↓      ↓     ↓
09B      09C      09D     09E     09F    09G   09H
                                             
                 09I conditional J
                          │
                          ↓
                      DPL-09J
                 integration / red-team
```

The technical children can run laterally after 09A freezes the common target/applicability contract.

Do not automatically open all children merely because this inventory names them. Confirm the decomposition at DPL-09 close and create only the next justified set.

## Interaction with DPL-07 Reference Site

DPL-RS-01 currently exposes useful unknowns that the England inventory can later turn into due obligations:

- ground / contamination / groundwater → A/C and professional evidence;
- drainage/sewer → H plus site due diligence;
- access/levels → M/K;
- orientation/tree/neighbours → O and some envelope/fire/site interactions;
- utilities/parking → P/R/S as applicable;
- all-electric system family → potential J non-applicability;
- Reference House fabric/services → F/L/G/P and related evidence.

The target must consume those claims.

It must not write regulatory interpretations back into the site manifest.

## Explicit non-claims

DPL-09 does **not** establish that:

- the Reference House complies with the Building Regulations;
- every listed Part applies in full;
- Approved Documents are the only lawful compliance routes;
- current compiler methods cover any family beyond their existing bounded claims;
- professional evidence can be replaced by machine calculation;
- a building-control body will approve the design;
- a future project can use the current rules without checking dates/transitions;
- the 2026 F/L documents apply merely because the research date is 2026;
- planning permission and Building Regulations are one target;
- Part T applies to the canonical new dwelling;
- Part J can be omitted universally merely because the current house is all-electric.

## Unresolved items deliberately passed to child packets

1. exact point-in-time consolidated legislation/source registry for the first selected project transition branch;
2. all relevant non-Schedule-1 regulations for each domain;
3. exact amendment/transition applicability for every current Approved Document family;
4. exact standards editions and lawful machine-use strategy;
5. method-by-method native computation admission;
6. exact professional evidence acceptance contracts;
7. exact scope of Part E inside a detached dwelling;
8. exact M4 category for the Reference Site after DPL-10 planning-target work;
9. exact Part S state after parking/site approach is authored;
10. final J non-applicability once all combustion features are frozen;
11. successor 2026 F/L/L3 implementation details;
12. competent building-control/regulatory review of the assembled target.

## Acceptance check

DPL-09 succeeds at inventory scope if a later implementer can answer:

1. what the primary legal instrument is;
2. why England—not “UK”—is the initial technical jurisdiction;
3. why Approved Documents are guidance routes rather than the legal requirement itself;
4. why target selection must be dated and transition-aware;
5. which technical families can affect a new detached dwelling;
6. which families are conditional or excluded for the current project class;
7. which statutory process/dutyholder obligations live outside ordinary geometry checks;
8. how site/planning facts can trigger Building Regulations applicability without being copied into the target;
9. where native computation is plausible versus where external evidence remains authoritative;
10. how to split the work into bounded technical packets without pretending current compiler coverage is broader than it is.

This inventory satisfies those conditions at research/programme scope.

## Packet conclusion

The England regulatory target is not one “regs file”.

It is a versioned external authority system with:

```text
LEGAL SNAPSHOT
    +
PROJECT / WORK CLASS
    +
TRANSITION EVENTS
    +
TECHNICAL REQUIREMENT FAMILIES
    +
PROCESS / DUTYHOLDER OBLIGATIONS
    +
SELECTED EVIDENCE ROUTES
    +
REFERENCED METHODS / STANDARDS
    +
SITE / PROJECT APPLICABILITY FACTS
    ↓
TARGET COMPOSITION
```

The next implementation work should therefore start with the **legal/applicability/process spine**, then allow bounded technical domains to proceed laterally.

That structure preserves the project’s central regulatory principle:

> **Regulation constrains the design; doctrine explains why the design goes further.**

and its computational restraint:

> **An applicable requirement that the compiler cannot prove remains visible and unresolved; it does not disappear.**
